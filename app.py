import json
import os
import secrets
import smtplib
import urllib.error
import urllib.request
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import wraps
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, abort, g, jsonify, request, send_from_directory, session

load_dotenv()
try:
    from dotenv import load_dotenv as _load_dotenv_again
    _load_dotenv_again()
except ImportError:
    pass


GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True

CONTENT_DIR = Path(__file__).parent / 'data'
CONTENT_FILE = CONTENT_DIR / 'content.json'
CONTENT_DIR.mkdir(parents=True, exist_ok=True)

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'windcast@naver.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'tower147@@')

SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.naver.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_USER = os.environ.get('SMTP_USER', 'windcast@naver.com')
SMTP_PASS = os.environ.get('SMTP_PASS', '')

MONGO_URI = os.environ.get('MONGO_URI', '')
MONGO_DB = os.environ.get('MONGO_DB', 'portfolio')
DEBUG_MODE = os.environ.get('DEBUG', 'false').lower() == 'true'
STRICT_MONGO = bool(MONGO_URI) and not DEBUG_MODE

_mongo_collection = None
LAST_STORAGE_BACKEND = 'file'


class StorageError(Exception):
    """Raised when configured content storage cannot be used."""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def request_id() -> str:
    if not hasattr(g, 'request_id'):
        incoming = request.headers.get('X-Request-Id', '').strip()
        g.request_id = incoming or secrets.token_hex(6)
    return g.request_id


def log_storage(event: str, **fields):
    details = ' '.join(f'{k}={fields[k]}' for k in sorted(fields))
    print(f'[storage] rid={request_id()} event={event} {details}'.rstrip())


def call_gemini(prompt: str) -> str:
    url = (
        'https://generativelanguage.googleapis.com/v1beta/models/'
        f'gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}'
    )
    payload = json.dumps({
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {'maxOutputTokens': 2048, 'temperature': 0.7},
    }).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data['candidates'][0]['content']['parts'][0]['text'].strip()


def get_collection():
    global _mongo_collection
    if not MONGO_URI:
        return None
    if _mongo_collection is None:
        from pymongo import MongoClient

        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        _mongo_collection = client[MONGO_DB]['content']
    return _mongo_collection


def _load_from_file() -> dict:
    if CONTENT_FILE.exists():
        with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def _save_to_file(data: dict):
    with open(CONTENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _content_doc_without_meta(doc: dict) -> dict:
    clean = dict(doc or {})
    clean.pop('_id', None)
    return clean


def merge_content(current: dict, incoming: dict) -> dict:
    merged = dict(current or {})
    for key, value in (incoming or {}).items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = merge_content(merged[key], value)
        else:
            merged[key] = value
    return merged


def load_content() -> tuple[dict, str]:
    global LAST_STORAGE_BACKEND

    col = get_collection()
    if col is None:
        LAST_STORAGE_BACKEND = 'file'
        data = _load_from_file()
        log_storage('load', source='file', strict=STRICT_MONGO)
        return data, 'file'

    try:
        doc = col.find_one({'_id': 'main'})
        if doc:
            LAST_STORAGE_BACKEND = 'mongo'
            log_storage('load', source='mongo', strict=STRICT_MONGO)
            return _content_doc_without_meta(doc), 'mongo'

        local = _load_from_file()
        if local:
            if STRICT_MONGO:
                log_storage('load_error', source='mongo', reason='missing_main_doc')
                raise StorageError('MongoDB main content document is missing.')
            col.replace_one({'_id': 'main'}, {**local, '_id': 'main'}, upsert=True)
            LAST_STORAGE_BACKEND = 'mongo'
            log_storage('load', source='mongo', migrated_from='file', strict=STRICT_MONGO)
            return local, 'mongo'

        LAST_STORAGE_BACKEND = 'mongo'
        log_storage('load', source='mongo', strict=STRICT_MONGO, empty=True)
        return {}, 'mongo'
    except StorageError:
        raise
    except Exception as e:
        print(f'[Mongo load error] {type(e).__name__}: {e}')
        log_storage('load_error', source='mongo', error=type(e).__name__)
        if STRICT_MONGO:
            raise StorageError(f'MongoDB load failed: {type(e).__name__}')
        LAST_STORAGE_BACKEND = 'file'
        fallback = _load_from_file()
        log_storage('load', source='file', fallback_from='mongo')
        return fallback, 'file'


def get_content_or_raise() -> tuple[dict, str]:
    return load_content()


def save_content(data: dict) -> dict:
    global LAST_STORAGE_BACKEND

    existing, _ = load_content()
    merged = merge_content(existing, data)
    merged['updated_at'] = now_iso()

    file_ok = False
    try:
        _save_to_file(merged)
        file_ok = True
        log_storage('save_file_ok', target='file')
    except Exception as e:
        print(f'[File save error] {e}')
        log_storage('save_file_error', target='file', error=type(e).__name__)

    col = get_collection()
    if col is None:
        LAST_STORAGE_BACKEND = 'file'
        merged['last_saved_backend'] = 'file'
        if file_ok:
            _save_to_file(merged)
        return {
            'ok': file_ok,
            'storage': 'file',
            'mongo_write_ok': False,
            'file_write_ok': file_ok,
            'content': merged,
            'message': 'Saved to local file.' if file_ok else 'Failed to save local file.',
        }

    try:
        col.replace_one(
            {'_id': 'main'},
            {**merged, '_id': 'main', 'last_saved_backend': 'mongo'},
            upsert=True,
        )
        LAST_STORAGE_BACKEND = 'mongo'
        merged['last_saved_backend'] = 'mongo'
        if file_ok:
            _save_to_file(merged)
        log_storage('save_mongo_ok', target='mongo')
        return {
            'ok': True,
            'storage': 'mongo',
            'mongo_write_ok': True,
            'file_write_ok': file_ok,
            'content': merged,
            'message': 'Saved to MongoDB.',
        }
    except Exception as e:
        print(f'[Mongo save error] {type(e).__name__}: {e}')
        log_storage('save_mongo_error', target='mongo', error=type(e).__name__)
        if STRICT_MONGO:
            raise StorageError(f'MongoDB save failed: {type(e).__name__}')
        LAST_STORAGE_BACKEND = 'file'
        merged['last_saved_backend'] = 'file'
        if file_ok:
            _save_to_file(merged)
        return {
            'ok': file_ok,
            'storage': 'file',
            'mongo_write_ok': False,
            'file_write_ok': file_ok,
            'content': merged,
            'message': 'MongoDB save failed; saved to local file.' if file_ok else 'MongoDB save failed.',
        }


def build_chat_context() -> str:
    content, _ = load_content()

    parts = []

    if content.get('chatbot_context'):
        parts.append('=== 핵심 포트폴리오 요약 ===\n' + content['chatbot_context'])

    hero = content.get('hero', {})
    about = content.get('about', {})
    if hero or about:
        parts.append('=== 소개 ===')
        if hero.get('subtitle'):
            parts.append(hero['subtitle'])
        if hero.get('desc'):
            parts.append(hero['desc'])
        if about.get('bio'):
            parts.append(about['bio'])
        if about.get('quote'):
            parts.append('"' + about['quote'] + '"')

    exps = content.get('experience', [])
    if exps:
        lines = ['=== 경력 ===']
        for company in exps:
            lines.append(f"[{company.get('company', '')}] {company.get('dept', '')} | {company.get('period', '')}")
            for job in company.get('jobs', []):
                lines.append(f"  · {job.get('game', '')} ({job.get('period', '')}) – {job.get('position', '')}")
                for item in job.get('items', []):
                    lines.append(f'    - {item}')
        parts.append('\n'.join(lines))

    projects = content.get('projects', [])
    if projects:
        lines = ['=== 주요 프로젝트 ===']
        for project in projects:
            lines.append(
                f"[{project.get('num', '')}] {project.get('category', '')} – "
                f"{project.get('title', '').replace(chr(10), ' ')}"
            )
            if project.get('desc'):
                lines.append('  ' + project['desc'])
            if project.get('result'):
                lines.append('  성과: ' + project['result'])
        parts.append('\n'.join(lines))

    metrics = content.get('metrics', [])
    if metrics:
        lines = ['=== 핵심 수치 ===']
        for metric in metrics:
            lines.append(
                f"  {metric.get('num', '')} – {metric.get('label', '').replace(chr(10), ' ')}"
            )
        parts.append('\n'.join(lines))

    contact = content.get('contact', {})
    if contact:
        parts.append(
            f"=== 연락처 ===\n이메일: {contact.get('email', '')}\n위치: {contact.get('location', '')}"
        )

    for fname in ['antigravity_master_brief_final_ko_v2.md', 'PROJECT_DATA_SUMMARY.md']:
        fpath = Path(__file__).parent / fname
        if fpath.exists():
            try:
                txt = fpath.read_text(encoding='utf-8')
                parts.append(f'=== 문서: {fname} ===\n' + txt[:6000])
            except Exception:
                pass

    return '\n\n'.join(parts)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin'):
            return jsonify({'error': '로그인이 필요합니다.'}), 401
        return f(*args, **kwargs)

    return decorated


@app.after_request
def apply_cache_headers(response):
    if request.path.startswith('/api/content'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['X-Request-Id'] = request_id()
    return response


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/admin')
@app.route('/admin/')
def admin():
    return send_from_directory('admin', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    if data.get('email') == ADMIN_EMAIL and data.get('password') == ADMIN_PASSWORD:
        session['admin'] = True
        return jsonify({'ok': True})
    return jsonify({'error': '이메일 또는 비밀번호가 틀렸습니다.'}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})


@app.route('/api/auth')
def auth_check():
    return jsonify({'loggedIn': bool(session.get('admin'))})


@app.route('/api/content')
def get_content():
    try:
        content, storage = get_content_or_raise()
        response = jsonify(content)
        response.headers['X-Content-Storage'] = storage
        return response
    except StorageError as e:
        response = jsonify({
            'error': str(e),
            'storage': 'mongo',
            'request_id': request_id(),
        })
        response.status_code = 503
        return response


@app.route('/api/mongo-health')
def mongo_health():
    info = {
        'mongo_uri_set': bool(MONGO_URI),
        'mongo_db': MONGO_DB,
        'strict_mongo': STRICT_MONGO,
        'last_storage_backend': LAST_STORAGE_BACKEND,
        'request_id': request_id(),
    }
    if not MONGO_URI:
        info['status'] = 'no_uri'
        return jsonify(info)
    try:
        col = get_collection()
        col.database.command('ping')
        info['ping'] = 'ok'

        doc = col.find_one({'_id': 'main'}, {'updated_at': 1, 'last_saved_backend': 1})
        info['has_main_doc'] = bool(doc)
        info['read'] = 'ok' if doc else 'missing'
        if doc:
            info['updated_at'] = doc.get('updated_at')
            info['last_saved_backend'] = doc.get('last_saved_backend', LAST_STORAGE_BACKEND)

        col.update_one(
            {'_id': '__healthcheck__'},
            {'$set': {'ts': now_iso(), 'request_id': request_id()}},
            upsert=True,
        )
        info['write'] = 'ok'
        info['status'] = 'healthy'
    except Exception as e:
        info['status'] = 'error'
        info['error'] = f'{type(e).__name__}: {str(e)[:300]}'
    return jsonify(info)


@app.route('/api/download/<path:filepath>')
def download_file(filepath):
    safe_name = Path(filepath).name
    safe_dir = str(Path(filepath).parent)
    if not safe_name.lower().endswith('.pdf'):
        abort(403)
    return send_from_directory(safe_dir, safe_name, as_attachment=True, download_name=safe_name)


@app.route('/api/content', methods=['POST'])
@login_required
def update_content():
    data = request.get_json()
    if not data:
        return jsonify({'error': '데이터가 없습니다.'}), 400
    try:
        result = save_content(data)
        status = 200 if result.get('ok') else 500
        return jsonify({
            'ok': result.get('ok', False),
            'message': result.get('message', '저장 완료!'),
            'storage': result.get('storage'),
            'mongo_write_ok': result.get('mongo_write_ok', False),
            'file_write_ok': result.get('file_write_ok', False),
            'updated_at': (result.get('content') or {}).get('updated_at'),
            'request_id': request_id(),
        }), status
    except StorageError as e:
        return jsonify({
            'ok': False,
            'error': str(e),
            'storage': 'mongo',
            'mongo_write_ok': False,
            'file_write_ok': False,
            'request_id': request_id(),
        }), 503


@app.route('/api/contact', methods=['POST'])
def send_contact_email():
    data = request.get_json() or {}
    from_name = data.get('from_name', '').strip()
    from_email = data.get('from_email', '').strip()
    message = data.get('message', '').strip()

    if not from_name or not from_email or not message:
        return jsonify({'error': '모든 항목을 입력해 주세요.'}), 400

    if not SMTP_PASS:
        return jsonify({'error': 'SMTP_PASS가 설정되지 않았습니다.'}), 503

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'[포트폴리오 문의] {from_name}님의 메시지'
        msg['From'] = SMTP_USER
        msg['To'] = 'windcast@naver.com'
        msg['Reply-To'] = from_email

        body = (
            f'보낸 분: {from_name}\n'
            f'이메일: {from_email}\n'
            f'─────────────────────────\n'
            f'{message}'
        )
        body_html = (
            f'<p><b>보낸 분:</b> {from_name}</p>'
            f'<p><b>이메일:</b> <a href="mailto:{from_email}">{from_email}</a></p>'
            f'<hr>'
            f'<p style="white-space:pre-wrap">{message}</p>'
        )
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        msg.attach(MIMEText(body_html, 'html', 'utf-8'))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, 'windcast@naver.com', msg.as_string())

        print(f'[Contact] 메일 전송 완료: {from_name} <{from_email}>')
        return jsonify({'ok': True})
    except Exception as e:
        print(f'[Contact] 메일 전송 실패: {type(e).__name__}: {e}')
        return jsonify({'error': f'메일 전송 실패: {str(e)[:200]}'}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    msg = (request.get_json() or {}).get('message', '').strip()
    if not msg:
        return jsonify({'reply': '메시지를 입력해 주세요.'}), 400

    if not GEMINI_API_KEY:
        return jsonify({'reply': 'AI 챗봇이 아직 설정되지 않았습니다.'})

    ctx = build_chat_context()
    prompt = (
        '당신은 임광윤(Kevin Im)의 포트폴리오 어시스턴트입니다.\n'
        '방문자(주로 채용담당자)의 질문에 한국어로 친절하고 적절한 길이로 답하세요.\n'
        '현재 날짜는 2026년 4월입니다. 시제에 맞게 답변하세요 (예: 졸업 예정 → 이미 졸업).\n'
        "포트폴리오에 없는 정보는 '해당 내용은 확인이 어렵지만 직접 연락 주시면 빠르게 답변 드리겠습니다'라고 하세요.\n"
        '전화번호, 주민번호 등 민감한 개인정보는 절대 제공하지 마세요.\n'
        '답변 시 **굵은글씨**, *기울임*, 줄바꿈(\\n) 등 마크다운은 절대 사용하지 마세요.\n'
        "대신 줄바꿈이 필요하면 실제 줄바꿈 문자를 사용하고, 강조는 '〔〕' 또는 문맥으로 표현하세요.\n"
        '중요한 항목은 · (가운뎃점) 또는 ✓ 로 시작하는 목록 형태로 정리하세요.\n\n'
        f'[포트폴리오 정보]\n{ctx}\n\n'
        f'[질문]\n{msg}'
    )

    try:
        reply = call_gemini(prompt)
        return jsonify({'reply': reply})
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        print(f'[Gemini HTTPError] {e.code}: {body}')
        return jsonify({'reply': f'API 오류 ({e.code}): {body[:200]}'})
    except Exception as e:
        print(f'[Gemini Error] {type(e).__name__}: {e}')
        return jsonify({'reply': f'오류: {type(e).__name__} - {str(e)[:200]}'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = DEBUG_MODE
    print(f'[Server start]: http://localhost:{port}')
    print(f'[Admin path]: http://localhost:{port}/admin')
    print(f'[Gemini status]: {"Connected" if GEMINI_API_KEY else "API Key Not Set"}')
    print(f'[Storage mode]: strict_mongo={STRICT_MONGO} mongo_uri_set={bool(MONGO_URI)}')
    app.run(host='0.0.0.0', port=port, debug=debug)
