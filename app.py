import os, json, secrets
import urllib.request, urllib.error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from functools import wraps
from flask import (Flask, jsonify, request, session,
                   send_from_directory, abort)
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# ── python-dotenv (로컬 .env 로드) ────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

def call_gemini(prompt: str) -> str:
    """Gemini 2.0 Flash REST API 직접 호출 (SDK 불필요)"""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    )
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 2048, "temperature": 0.7}
    }).encode('utf-8')
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data['candidates'][0]['content']['parts'][0]['text'].strip()

# ── Flask 앱 설정 ──────────────────────────────────────────────
app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
# HTTPS 배포 시 아래 줄 활성화
# app.config['SESSION_COOKIE_SECURE'] = True

ADMIN_EMAIL    = os.environ.get('ADMIN_EMAIL',    'windcast@naver.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'tower147@@')
CONTENT_FILE   = Path(__file__).parent / 'content.json'

# SMTP 설정 (Naver)
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.naver.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_USER = os.environ.get('SMTP_USER', 'windcast@naver.com')
SMTP_PASS = os.environ.get('SMTP_PASS', '')  # .env에 naver 앱 비밀번호 설정 필요

# ── 헬퍼 ──────────────────────────────────────────────────────
def load_content() -> dict:
    if CONTENT_FILE.exists():
        with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_content(data: dict):
    with open(CONTENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def build_chat_context() -> str:
    """content.json 전체 + 포트폴리오 MD 파일을 읽어 챗봇 컨텍스트 자동 빌드"""
    C = load_content()

    parts = []

    # 1) 관리자가 직접 작성한 컨텍스트 (우선 포함)
    if C.get('chatbot_context'):
        parts.append('=== 핵심 포트폴리오 요약 ===\n' + C['chatbot_context'])

    # 2) Hero / About
    h = C.get('hero', {})
    a = C.get('about', {})
    if h or a:
        parts.append('=== 소개 ===')
        if h.get('subtitle'): parts.append(h['subtitle'])
        if h.get('desc'):     parts.append(h['desc'])
        if a.get('bio'):      parts.append(a['bio'])
        if a.get('quote'):    parts.append('"' + a['quote'] + '"')

    # 3) Experience
    exps = C.get('experience', [])
    if exps:
        lines = ['=== 경력 ===']
        for co in exps:
            lines.append(f"[{co.get('company','')}] {co.get('dept','')} | {co.get('period','')}")
            for job in co.get('jobs', []):
                lines.append(f"  · {job.get('game','')} ({job.get('period','')}) – {job.get('position','')}")
                for item in job.get('items', []):
                    lines.append(f"    - {item}")
        parts.append('\n'.join(lines))

    # 4) Projects
    projs = C.get('projects', [])
    if projs:
        lines = ['=== 주요 프로젝트 ===']
        for p in projs:
            lines.append(f"[{p.get('num','')}] {p.get('category','')} – {p.get('title','').replace(chr(10),' ')}")
            if p.get('desc'):   lines.append('  ' + p['desc'])
            if p.get('result'): lines.append('  성과: ' + p['result'])
        parts.append('\n'.join(lines))

    # 5) Metrics
    metrics = C.get('metrics', [])
    if metrics:
        lines = ['=== 핵심 수치 ===']
        for m in metrics:
            lines.append(f"  {m.get('num','')} – {m.get('label','').replace(chr(10),' ')}")
        parts.append('\n'.join(lines))

    # 6) Contact
    co = C.get('contact', {})
    if co:
        parts.append(f"=== 연락처 ===\n이메일: {co.get('email','')}\n위치: {co.get('location','')}")

    # 7) 포트폴리오 MD 파일 (있으면 추가)
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

# ── 정적 파일 서빙 ─────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/admin')
@app.route('/admin/')
def admin():
    return send_from_directory('admin', 'index.html')

# ─── .html / .css / .js / img / pdf 등 정적 파일 ─────────────
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# ── Auth API ───────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    d = request.get_json() or {}
    if d.get('email') == ADMIN_EMAIL and d.get('password') == ADMIN_PASSWORD:
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

# ── Content API ────────────────────────────────────────────────
@app.route('/api/content')
def get_content():
    return jsonify(load_content())

@app.route('/api/content', methods=['POST'])
@login_required
def update_content():
    data = request.get_json()
    if not data:
        return jsonify({'error': '데이터가 없습니다.'}), 400
    save_content(data)
    return jsonify({'ok': True, 'message': '저장 완료!'})

# ── Contact Email API ──────────────────────────────────────────
@app.route('/api/contact', methods=['POST'])
def send_contact_email():
    d = request.get_json() or {}
    from_name  = d.get('from_name',  '').strip()
    from_email = d.get('from_email', '').strip()
    message    = d.get('message',    '').strip()

    if not from_name or not from_email or not message:
        return jsonify({'error': '모든 항목을 입력해 주세요.'}), 400

    if not SMTP_PASS:
        # SMTP 미설정 → EmailJS fallback 안내
        return jsonify({'error': 'SMTP_PASS가 설정되지 않았습니다.'}), 503

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'[포트폴리오 문의] {from_name}님의 메시지'
        msg['From']    = SMTP_USER
        msg['To']      = 'windcast@naver.com'
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
        msg.attach(MIMEText(body,      'plain',  'utf-8'))
        msg.attach(MIMEText(body_html, 'html',   'utf-8'))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, 'windcast@naver.com', msg.as_string())

        print(f'[Contact] 메일 전송 완료: {from_name} <{from_email}>')
        return jsonify({'ok': True})

    except Exception as e:
        print(f'[Contact] 메일 전송 실패: {type(e).__name__}: {e}')
        return jsonify({'error': f'메일 전송 실패: {str(e)[:200]}'}), 500

# ── Gemini Chatbot API ─────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def chat():
    msg = (request.get_json() or {}).get('message', '').strip()
    if not msg:
        return jsonify({'reply': '메시지를 입력해 주세요.'}), 400

    if not GEMINI_API_KEY:
        return jsonify({'reply': 'AI 챗봇이 아직 설정되지 않았습니다.'})

    ctx = build_chat_context()
    prompt = (
        "당신은 임광윤(Kevin Im)의 포트폴리오 어시스턴트입니다.\n"
        "방문자(주로 채용담당자)의 질문에 한국어로 친절하고 적절한 길이로 답하세요.\n"
        "현재 날짜는 2026년 4월입니다. 시제에 맞게 답변하세요 (예: 졸업 예정 → 이미 졸업).\n"
        "포트폴리오에 없는 정보는 '해당 내용은 확인이 어렵지만 직접 연락 주시면 빠르게 답변 드리겠습니다'라고 하세요.\n"
        "전화번호, 주민번호 등 민감한 개인정보는 절대 제공하지 마세요.\n"
        "답변 시 **굵은글씨**, *기울임*, 줄바꿈(\\n) 등 마크다운은 절대 사용하지 마세요.\n"
        "대신 줄바꿈이 필요하면 실제 줄바꿈 문자를 사용하고, 강조는 '〔〕' 또는 문맥으로 표현하세요.\n"
        "중요한 항목은 · (가운뎃점) 또는 ✓ 로 시작하는 목록 형태로 정리하세요.\n\n"
        f"[포트폴리오 정보]\n{ctx}\n\n"
        f"[질문]\n{msg}"
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
# ── 실행 ───────────────────────────────────────────────────────
if __name__ == '__main__':
    port  = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    print(f'[Server start]: http://localhost:{port}')
    print(f'[Admin path]: http://localhost:{port}/admin')
    print(f'[Gemini status]: {"Connected" if GEMINI_API_KEY else "API Key Not Set"}')
    app.run(host='0.0.0.0', port=port, debug=debug)
