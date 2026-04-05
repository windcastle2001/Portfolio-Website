# Product Requirements Document
# 임광윤(Kevin Im) 포트폴리오 웹사이트

## 1. 프로젝트 개요

**제품명**: 임광윤(Kevin Im) 이직용 포트폴리오 사이트  
**기술 스택**: Python Flask (백엔드), Vanilla JS + GSAP + VanillaTilt (프론트엔드), HTML/CSS  
**로컬 서버**: `http://localhost:8080`  
**어드민 패널**: `http://localhost:8080/admin`  
**목적**: 게임 라이브 서비스 운영 경력자(임광윤)의 역량·경험·프로젝트를 채용담당자에게 보여주는 1인 포트폴리오 사이트

---

## 2. 전체 아키텍처

- **Flask** 서버가 `content.json` 파일을 읽어 `/api/content` API로 제공
- 프론트엔드는 `content-loader.js`를 통해 `/api/content`를 fetch하여 동적 콘텐츠를 DOM에 주입
- 좌측 고정 사이드바에 9개 섹션 네비게이션 존재
- 모든 섹션은 single-page 스크롤 방식으로 구성

---

## 3. 페이지 섹션별 기능 요구사항

### 3.1 HOME (Hero 섹션)
- **위치**: 페이지 최상단, `id="home"`
- **필수 노출 요소**:
  - 태그 텍스트: "GAME LIVE OPERATIONS & BUSINESS PM"
  - 대형 제목: "MY NAME IS / 임광윤 / (KEVIN IM)"
  - 부제목: `/api/content`의 `hero.subtitle` 값 (동적 로드)
  - 설명문: `/api/content`의 `hero.desc` 값 (동적 로드)
  - 메타 정보: 이메일(`windcast@naver.com`), 위치(`Seoul, Korea`)
  - 프로필 사진: `id="hero-profile-img"` (동적 로드, 실패 시 `img/picture.jpg` fallback)
  - 장식 요소: 배경 도형(`.hs1~3`), 반짝임 효과(`.sparkle`)
- **버튼 4개**:
  1. `Projects 보기 ↗` → `#projects` 섹션으로 스크롤
  2. `Contact` → `#contact` 섹션으로 스크롤
  3. `Resume ↓` → Resume Picker 모달 오픈
  4. `포트폴리오 ↓` → PDF 미리보기 모달 오픈
- **레이아웃**: viewport 수직 중앙 정렬, 좌(텍스트)+우(사진) 2열 구조

### 3.2 ABOUT 섹션
- **위치**: `id="about"`
- **필수 노출 요소**:
  - 섹션 태그: "Nice to meet you!", 제목: "WELCOME TO..."
  - 좌측 컬럼: 프로필 사진(`id="about-profile-img"`), 이름, 역할, 유튜브 링크
  - 우측 컬럼:
    - 정보 행: 이메일, 학력(MBA), 자격증(SQLD, TOEIC 960)
    - 통계(stats): `id="dyn-about-stats"` (동적 로드 — `4+` 글로벌 게임 타이틀, `3년+` 경력)
    - 자기소개(bio): `id="dyn-about-bio"` (동적 로드)
    - 인용구: `id="dyn-about-quote"` (동적 로드)
- **동작**: 페이지 로드 후 `/api/content` 응답으로 stats/bio/quote가 채워져야 함

### 3.3 STORY 섹션
- **위치**: `id="story"`, 어두운 배경(`.section-dark`)
- **필수 노출 요소**:
  - 태그: "Why PM?", 제목: "운영에서 해온 일이 사업 PM과 연결됩니다"
  - 2열 그리드(`id="dyn-story-content"`): 동적 로드
  - 좌측 컬럼 헤더: "운영에서 해온 일"
  - 우측 컬럼 헤더: "사업 PM 역할로의 연결" (파란 배지)
  - 각 컬럼에 6개 스토리 아이템 (아이콘 + 제목 + 설명)
- **인터랙션**: 각 스토리 아이템 hover 시 주황색 하이라이트

### 3.4 CAPABILITIES 섹션
- **위치**: `id="capabilities"`
- **필수 노출 요소**:
  - 태그: "What I Do", 제목: "CORE CAPABILITIES"
  - 3열 × 2행 그리드(`id="dyn-capabilities-list"`): 6개 카드 동적 로드
- **카드 내용** (각 카드):
  - 카테고리 배지 (e.g. OPERATION, DATA ANALYSIS, INSIGHT, RISK MGT, PROCESS, AI AUTOMATION)
  - 제목 (e.g. "글로벌 라이브 서비스 운영")
  - 항목 리스트 (`items` 배열, 불릿 포인트 형식)
  - 배경 이미지 (각 카드별 로컬 이미지: `img/global_ops_bg.png` 등)
  - 번호 워터마크 (01~06)
- **진입 애니메이션**: 섹션 스크롤 시 카드가 중앙에서 scale:0, rotation:-180으로 시작하여 퍼지면서 등장 (GSAP ScrollTrigger, stagger from center)
- **플로팅 애니메이션**: 카드가 위아래로 부유하는 효과 (CSS keyframe)
- **Hover 인터랙션**: 
  - 마우스 오버 시 `.is-hovered` 클래스 추가
  - 배경 이미지 opacity 0 → 1
  - 이미지 scale 1 → 1.15 (15초에 걸쳐)
  - 텍스트 색상: 어두운 → 흰색
  - 주황색 글로우 효과

### 3.5 EXPERIENCE 섹션
- **위치**: `id="experience"`, 그라디언트 배경(`.section-grad`)
- **필수 노출 요소**:
  - 태그: "Experience", 제목: "MY EXPERIENCE"
  - 타임라인 3개 항목:
    1. **IGS(아이지에스)** (2022.06~현재): KOF AFK, 세븐나이츠2, 마블 퓨처파이트, KOF 올스타 + AiGS TF 부업무
    2. **인천공항운영서비스** (2019.11~2021.02)
    3. **한국생산성본부(KPC)** (2018.01~2018.06, 인턴)
  - 각 항목: 기간, 회사 로고, 회사명, 역할, 설명
- **스크롤 reveal 애니메이션**: `.reveal` 클래스 요소가 뷰포트 진입 시 페이드인

### 3.6 PROJECTS 섹션
- **위치**: `id="projects"`
- **필수 노출 요소**:
  - 태그: "Work", 제목: "KEY PROJECTS"
  - 힌트 텍스트: "← 드래그하거나 화살표로 넘겨보세요 →"
  - 슬라이더(`id="projTrack"`): 동적 로드된 프로젝트 카드들
  - 이전/다음 화살표 버튼
  - 하단 dot 인디케이터
- **각 프로젝트 카드 내용**:
  - 대표 썸네일 이미지 (클릭 시 이미지 갤러리 모달 오픈)
  - 이미지 개수 배지 (`+N장`)
  - 프로젝트 번호, 제목, 설명, 핵심성과, 기술 스택 태그
- **슬라이더 인터랙션**:
  - 좌우 화살표 클릭으로 카드 전환
  - 드래그(포인터 이벤트)로 슬라이드
  - 하단 dot 클릭으로 특정 카드로 이동
  - 현재 활성 dot 강조

### 3.7 METRICS 섹션
- **위치**: `id="metrics"`, 연한 회색 배경(`.section-light-gray`)
- **필수 노출 요소**:
  - 태그: "Proof", 제목: "METRICS & IMPACT"
  - 메트릭 카드 그리드(`id="dyn-metrics-grid"`): 9개 카드
  - 주요 수치: 130%, 53%, 27800명, +15%, 44호+, 5000+, 24개, A등급, 0건
- **스크롤 reveal 애니메이션**: 뷰포트 진입 시 페이드인

### 3.8 SKILLS 섹션
- **위치**: `id="skills"`
- **필수 노출 요소**:
  - 태그: "Tools & Tech", 제목: "SKILLS & TOOLS"
  - 스킬 그룹 4개:
    1. Operations & Collaboration (Jira, Google Workspace 등)
    2. Data & Analytics (SQL, Python, R 등)
    3. Automation & AI (Make, n8n, Gemini API 등) — 주황 태그
    4. Language & Certification (SQLD, TOEIC 960 등) — 보라 태그
  - 학력 섹션: 동국대 MBA(2024-2026), 동국대 학부(2012-2019) 2개 카드

### 3.9 CONTACT 섹션
- **위치**: `id="contact"`
- **필수 노출 요소**:
  - 태그: "Get in Touch", 제목: "CONTACT"
  - 좌측: 안내 문구, 이메일 링크, 위치
  - 우측: 문의 폼 (성함, 이메일, 메시지, 보내기 버튼)
  - 하단 footer-bar: "© 2026 Kevin Im. All rights reserved."
- **동적 로드**: `/api/content`의 `contact` 데이터로 이메일·위치 표시

---

## 4. 공통 UI 컴포넌트

### 4.1 사이드바 네비게이션
- **위치**: 좌측 고정(fixed), 너비 200px, 검정 배경
- **네비게이션 링크 9개**: HOME, ABOUT, STORY, CAPABILITIES, EXPERIENCE, PROJECTS, METRICS, SKILLS, CONTACT
- **동작**:
  - 클릭 시 해당 섹션으로 smooth scroll (`scrollIntoView`)
  - 현재 섹션 링크에 `.active` 클래스 (주황 하단 밑줄)
  - Intersection Observer로 스크롤 중 자동 active 업데이트
- **하단**: 이메일, LinkedIn, Resume 다운로드 아이콘

### 4.2 PDF 미리보기 모달
- **트리거**: "포트폴리오 ↓" 버튼
- **동작**: 오버레이 모달에서 `<iframe>`으로 PDF 렌더링
- **컨트롤**: 닫기(✕) 버튼, 다운로드(⬇) 버튼, 오버레이 클릭으로 닫기

### 4.3 Resume Picker 모달
- **트리거**: "Resume ↓" 버튼
- **동작**: "사업 PM용" / "운영용" 2가지 경력기술서 선택 팝업
- **선택 시**: PDF 미리보기 모달으로 연결

### 4.4 이미지 갤러리 모달
- **트리거**: 프로젝트 카드 썸네일 클릭
- **동작**:
  - 이미지/PDF 전체화면 뷰어
  - 이전/다음 버튼으로 갤러리 탐색
  - 캡션 및 카운터 표시 (e.g. "2 / 5")
  - ✕ 버튼 또는 오버레이 클릭으로 닫기

### 4.5 AI 챗봇 (Floating Chat)
- **위치**: 우측 하단 플로팅 버튼 ("Ask Kevin")
- **동작**:
  - 버튼 클릭 시 채팅창 토글
  - 메시지 입력 후 전송 → `/api/chat`에 POST 요청
  - Gemini API 기반 응답 수신·표시
  - 예시 버튼 4개 (경력, 프로젝트, 기술, 연락처 관련)
  - 닫기 버튼(✕)
- **초기 메시지**: "안녕하세요! 임광윤(Kevin Im)의 포트폴리오 어시스턴트입니다."

---

## 5. 백엔드 API 요구사항

### 5.1 GET `/api/content`
- **설명**: `content.json` 파일 전체 반환
- **응답 형식**: JSON
- **필수 포함 키**: `hero`, `about`, `capabilities`, `story`, `experience`, `projects`, `metrics`, `skills`, `contact`, `media`
- **기대 동작**: 200 OK + 유효한 JSON

### 5.2 POST `/api/chat`
- **설명**: Gemini AI 챗봇 응답 반환
- **요청 Body**: `{ "message": "질문 텍스트" }`
- **응답 형식**: `{ "reply": "응답 텍스트" }`
- **기대 동작**: 200 OK + `reply` 필드 포함
- **에러 케이스**: 빈 메시지 → 400, API 키 미설정 → 기본 응답 메시지

### 5.3 POST `/api/contact`
- **설명**: 문의 이메일 발송
- **요청 Body**: `{ "from_name": "...", "from_email": "...", "message": "..." }`
- **응답 형식**: `{ "ok": true }` 또는 에러
- **유효성 검사**: 필수 항목 누락 시 400 반환
- **SMTP 미설정**: 503 반환 (EmailJS fallback 안내)

### 5.4 POST `/api/login`
- **설명**: 어드민 로그인
- **요청 Body**: `{ "email": "...", "password": "..." }`
- **성공 응답**: `{ "ok": true }` + 세션 설정
- **실패 응답**: 401 + 에러 메시지

### 5.5 GET `/api/auth`
- **설명**: 현재 로그인 상태 확인
- **응답**: `{ "loggedIn": true/false }`

### 5.6 POST `/api/logout`
- **설명**: 어드민 로그아웃
- **응답**: `{ "ok": true }` + 세션 삭제

### 5.7 POST `/api/content` (어드민 전용)
- **설명**: `content.json` 내용 업데이트
- **인증**: 세션 기반 (미로그인 시 401)
- **요청 Body**: 업데이트할 content JSON 객체
- **응답**: `{ "ok": true, "message": "저장 완료!" }`

### 5.8 GET `/admin`
- **설명**: 어드민 패널 HTML 반환
- **인증**: 없음 (프론트엔드에서 처리)
- **응답**: 200 OK + HTML

---

## 6. 어드민 패널 (`/admin`)
- **로그인**: 이메일 + 비밀번호 입력 후 `/api/login` 호출
- **인증 후 기능**:
  - content.json의 모든 섹션 수정 가능 (Hero, About, Capabilities, Projects 등)
  - 이미지/PDF 업로드 (Cloudinary 연동)
  - 저장 버튼 → `/api/content` POST
- **로그아웃**: 세션 삭제

---

## 7. 동적 콘텐츠 로딩 요구사항

`content-loader.js`가 페이지 로드 후 `/api/content`를 fetch하여 다음을 DOM에 주입:

| DOM ID / 선택자 | 소스 경로 | 설명 |
|---|---|---|
| `#dyn-hero-subtitle` | `hero.subtitle` | Hero 부제목 |
| `#dyn-hero-desc` | `hero.desc` | Hero 설명 |
| `#dyn-about-bio` | `about.bio` | About 자기소개 |
| `#dyn-about-quote` | `about.quote` | About 인용구 |
| `#dyn-about-stats` | `about.stats[]` | About 통계 카드들 |
| `#dyn-metrics-grid` | `metrics[]` | Metrics 카드들 |
| `.skills-grid` | `skills[]` | Skills 태그 그룹들 |
| `#projTrack` | `projects[]` | 프로젝트 슬라이더 카드들 |
| `#dyn-capabilities-list` | `capabilities[]` | Capabilities 카드들 |
| `#dyn-story-content` | `story.left[]`, `story.right[]` | Story 아이템들 |
| `#hero-profile-img` | `media.profile_home` | Hero 프로필 사진 URL |
| `#about-profile-img` | `media.profile_about` | About 프로필 사진 URL |
| `#dyn-contact-email` | `contact.email` | 연락처 이메일 |
| `#dyn-contact-location` | `contact.location` | 연락처 위치 |
| `#dyn-contact-desc` | `contact.desc` | 연락처 설명 |

---

## 8. 인터랙션 & 애니메이션 요구사항

### 8.1 스크롤 네비게이션
- 사이드바 링크 클릭 → `scrollIntoView({ behavior: 'smooth', block: 'start' })`
- IntersectionObserver (threshold 0.25)로 현재 섹션 감지 → active 링크 업데이트

### 8.2 Reveal 애니메이션
- `.reveal` 클래스 요소: 뷰포트 진입 시 `.visible` 클래스 추가 (페이드인)
- threshold: 0.12

### 8.3 Hero 애니메이션
- `.sparkle` 요소: sin 함수 기반 부유 효과 (requestAnimationFrame)
- `.hs` 도형: cos/sin 기반 미세 이동 효과

### 8.4 Capabilities 애니메이션 (GSAP + ScrollTrigger)
- 초기: `opacity:0, scale:0, rotation:-180, z:-200`
- ScrollTrigger: `#capabilities` 섹션 상단 85% 진입 시 발동
- 카드 등장: `stagger: { from: 'center', each: 0.12 }`, `ease: 'expo.out'`, duration 1.6s
- 완료 후: VanillaTilt 3D 틸트 활성화 (`max:12, glare:true`)

### 8.5 프로젝트 슬라이더
- 포인터 드래그: 15px 이상 드래그 시 슬라이드 전환
- 화살표/dot 클릭: 즉시 전환 (`transform: translateX`)
- 트랜지션: `0.45s cubic-bezier(0.23, 1, 0.32, 1)`

---

## 9. 반응형 요구사항

- **데스크톱 (> 1024px)**: 사이드바 고정, 전체 레이아웃 표시
- **태블릿 (768px ~ 1024px)**: 사이드바 축소, 일부 그리드 2열로 변경
- **모바일 (< 768px)**: 사이드바 상단 고정 수평 배치, 1열 레이아웃, 터치 슬라이더 지원

---

## 10. 에러 처리 & 폴백

- 프로필 이미지 로드 실패 → `img/picture.jpg` fallback (`onerror` 핸들러)
- `/api/content` fetch 실패 → 기본 정적 텍스트 유지, 콘솔 경고 출력
- Contact 폼 전송 실패 (SMTP 503) → EmailJS로 fallback 시도
- PDF 로드 실패 → 다운로드 링크 제공
