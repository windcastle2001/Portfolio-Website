## 1. 환경 및 시스템 정보 (System Info)
- **Base URL**: `http://localhost:8080`
- **Backend Stack**: Python 3.x, Flask 3.0.3
- **Data Storage**: `content.json` (Local File-based JSON Database)
- **Deployment Server**: Development (Werkzeug) / Production (Gunicorn)
- **Session Mgt**: Flask Server-side Session (Cookie-based, `SameSite=Lax`)

## 2. API 상세 정의 및 테스트 기준

### 2.1 인증 (Authentication)
| Method | Endpoint | Description | Request Payload | Response (200) | Error (401) |
|---|---|---|---|---|---|
| `POST` | `/api/login` | 관리자 세션 생성 | `{"email": "...", "password": "..."}` | `{"ok": true}` | `{"error": "이메일 또는 비밀번호가 틀렸습니다."}` |
| `POST` | `/api/logout` | 세션 파기 | N/A | `{"ok": true}` | N/A |
| `GET` | `/api/auth` | 로그인 상태 확인 | N/A | `{"loggedIn": true/false}` | N/A |

### 2.2 콘텐츠 엔진 (Content Engine - JSON DB)
- **Persistence**: `POST /api/content` 요청 시 `content.json` 파일을 즉시 덮어쓰기 방식으로 저장함.
- **Latency Target**: `GET /api/content` 응답 속도는 로컬 환경 기준 **50ms 미만**이어야 함.

| Method | Endpoint | Auth | Description | Success Criteria |
|---|---|---|---|---|
| `GET` | `/api/content` | No | 전체 데이터 조회 | 모든 섹션(hero, about, projects 등)의 키가 존재해야 함. |
| `POST` | `/api/content` | **Yes** | 데이터 업데이트 | 업데이트 후 `content.json` 파일의 수정 시간이 갱신되어야 함. |

### 2.3 지능형 서비스 (AI & Email)
| Method | Endpoint | Description | Timeout | Reliability Requirement |
|---|---|---|---|---|
| `POST` | `/api/chat` | Gemini API 연동 챗봇 | 30s | API Key 유효 시 응답 문자열 필수 포함 |
| `POST` | `/api/contact` | Naver SMTP 메일 발송 | 10s | 발송 실패 시 503 반환 및 에러 메시지 확인 |

---

## 3. 백엔드 특화 테스트 시나리오 (Technical Scenarios)

### SC-05: JSON DB 무결성 및 동시성 테스트
- **시나리오**: 거대한 JSON 데이터(1MB 이상)를 `POST`로 전송했을 때 서버의 처리 능력 확인.
- **검증**: `content.json` 파일이 깨지지 않고 정상적으로 저장되는지 확인.

### SC-06: 챗봇 컨텍스트 빌드 테스트
- **시나리오**: `build_chat_context()` 함수가 `content.json`뿐만 아니라 `PROJECT_DATA_SUMMARY.md` 등 외부 파일을 정상적으로 읽어 프롬프트를 생성하는지 확인.
- **검증**: `POST /api/chat` 응답이 문서의 내용을 포함하고 있는지 확인.

### SC-07: 로딩 성능 및 리소스 서빙
- **시나리오**: `/static/` 경로가 아닌 루트 경로에서 이미지 및 PDF 파일이 `send_from_directory`를 통해 정상적으로 서빙되는지 확인.
- **검증**: `http://localhost:8080/img/picture.jpg` 호출 시 200 OK 확인.

---

## 4. 모니터링 및 디버깅 가이드
- **Server Logs**: Flask 콘솔 출력에서 `[Server start]`, `[Contact] 메일 전송 완료`, `[Gemini Error]` 패턴을 모니터링하십시오.
- **Error Codes Reference**:
    - `400`: 필수 필드(`message`, `from_name` 등) 누락
    - `401`: 어드민 인증 실패 또는 세션 만료
    - `503`: SMTP 비밀번호 미설정 또는 네트워크 연결 오류
    - `500`: Gemini API 호출 실패 또는 JSON 파싱 오류
