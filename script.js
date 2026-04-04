/* ===========================================================
   KEVIN IM PORTFOLIO – script.js (v4)
   =========================================================== */

/* ─── EmailJS 설정 ───────────────────────────────────────────
   ※ 아래 3가지 값을 EmailJS 계정에서 발급받아 채워 넣으세요.
   1. PUBLIC_KEY  : Account → API Keys → Public Key
   2. SERVICE_ID  : Email Services → 생성한 서비스 ID
   3. TEMPLATE_ID : Email Templates → 생성한 템플릿 ID
   ─────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = '8Og_DDRJ23tbyZHiG';
const EMAILJS_SERVICE_ID  = 'service_cpvb348';
const EMAILJS_TEMPLATE_ID = 'template_xjr6p5h';

window.addEventListener('load', () => {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    console.log('[EmailJS] 초기화 완료');
  }
});

/* ─── Contact Form Submit ─── */
window.submitContact = async function(e) {
  e.preventDefault();
  const btn    = document.getElementById('cf-submit');
  const status = document.getElementById('cf-status');

  // 키가 설정되지 않은 경우 안내
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    status.className = 'cf-status error';
    status.textContent = '⚠️ EmailJS 키를 아직 설정하지 않으셨습니다. script.js 상단을 확인해 주세요.';
    return;
  }

  const params = {
    from_name:  document.getElementById('cf-name').value.trim(),
    from_email: document.getElementById('cf-email').value.trim(),
    message:    document.getElementById('cf-msg').value.trim(),
    to_email:   'windcast@naver.com',
  };

  btn.disabled = true;
  btn.textContent = '전송 중...';
  status.className = 'cf-status';
  status.textContent = '';

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    status.className = 'cf-status success';
    status.textContent = '✓ 메시지를 성공적으로 보냈습니다! 빠르게 회신 드리겠습니다.';
    document.getElementById('contactForm').reset();
  } catch (err) {
    console.error('[EmailJS] 전송 실패:', err);
    status.className = 'cf-status error';
    status.textContent = '✕ 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    btn.disabled = false;
    btn.textContent = '보내기 ↗';
  }
};

/* ─── 1. SIDEBAR ACTIVE LINK + SMOOTH SCROLL ─── */
function initScrollSpy() {
  const sections  = document.querySelectorAll('main .section[id]');
  const navLinks  = document.querySelectorAll('.nav-link, .scroll-link');

  function setActive(id) {
    navLinks.forEach(a => {
      const target = a.dataset.target || a.getAttribute('href')?.replace('#','');
      a.classList.toggle('active', target === id);
    });
  }

  // Intersection Observer – fire when section enters viewport
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { threshold: 0.25 });

  sections.forEach(s => obs.observe(s));

  // Click → smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.dataset.target || link.getAttribute('href')?.replace('#','');
      if (!targetId) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── 2. REVEAL ON SCROLL ─── */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const obs   = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
}

/* ─── 3. HERO SPARKLE FLOAT ─── */
function initSparkles() {
  let t = 0;
  const sparkles = document.querySelectorAll('.sparkle');
  function tick() {
    t += 0.015;
    sparkles.forEach((sp, i) => {
      sp.style.transform = `translateY(${Math.sin(t + i * 1.5) * 8}px)`;
    });
    requestAnimationFrame(tick);
  }
  tick();
  const shapes = document.querySelectorAll('.hs');
  let t2 = 0;
  function tickShapes() {
    t2 += 0.008;
    shapes.forEach((sh, i) => {
      sh.style.transform = `translate(${Math.cos(t2 + i) * 6}px, ${Math.sin(t2 + i * 0.9) * 5}px)`;
    });
    requestAnimationFrame(tickShapes);
  }
  tickShapes();
}

/* ─── 4. PROJECT SLIDER ─── */
let projIdx = 0;
const TOTAL_SLIDES = 6;

function initSlider() {
  const track    = document.getElementById('projTrack');
  const viewport = document.getElementById('projViewport');
  if (!track || !viewport) return;

  let startX = 0, startScrollLeft = 0, isDragging = false;

  function getSlideW() {
    const slide = track.querySelector('.proj-slide');
    if (!slide) return 420;
    return slide.offsetWidth + 20; // width + gap
  }

  function goTo(idx) {
    projIdx = Math.max(0, Math.min(TOTAL_SLIDES - 1, idx));
    const offset = projIdx * getSlideW();
    track.style.transition = 'transform 0.38s cubic-bezier(.4,0,.2,1)';
    track.style.transform  = `translateX(-${offset}px)`;
    updateDots();
  }

  window.slideProj  = (dir) => goTo(projIdx + dir);
  window.goToSlide  = (idx) => goTo(idx);

  // Mouse drag
  track.addEventListener('mousedown', e => {
    isDragging     = true;
    startX         = e.pageX;
    startScrollLeft = projIdx * getSlideW();
    track.style.transition = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    track.style.transform = `translateX(-${startScrollLeft - dx}px)`;
  });
  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const dx   = e.pageX - startX;
    if (Math.abs(dx) > 60) { goTo(projIdx + (dx < 0 ? 1 : -1)); }
    else { goTo(projIdx); }
  });
  document.addEventListener('mouseleave', () => {
    if (isDragging) { isDragging = false; goTo(projIdx); }
  });

  // Touch
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(projIdx + (dx < 0 ? 1 : -1));
  });
}

function updateDots() {
  document.querySelectorAll('.proj-dot').forEach((d, i) => {
    d.classList.toggle('active', i === projIdx);
  });
  const arL = document.getElementById('arrowLeft');
  const arR = document.getElementById('arrowRight');
  if (arL) arL.style.opacity = projIdx === 0 ? '0.35' : '1';
  if (arR) arR.style.opacity = projIdx === TOTAL_SLIDES - 1 ? '0.35' : '1';
}

/* ─── 5. IMAGE MODAL ─── */
window.openModal = function(src, caption) {
  const overlay = document.getElementById('imgModal');
  document.getElementById('modalImg').src     = src;
  document.getElementById('modalCaption').textContent = caption || '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeModal = function() {
  document.getElementById('imgModal').classList.remove('open');
  document.body.style.overflow = '';
};
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closePdfModal(); closeResumePicker(); }
});

/* ─── 6. PDF PREVIEW MODAL ─── */
window.previewPdf = function(src, title) {
  closeResumePicker();
  const overlay = document.getElementById('pdfModal');
  document.getElementById('pdfFrame').src        = src;
  document.getElementById('pdfModalTitle').textContent = title || '문서 미리보기';
  const dlBtn = document.getElementById('pdfDownloadBtn');
  dlBtn.href  = src;
  dlBtn.download = (title || 'document').replace(/[^\w가-힣\s]/g,'_') + '.pdf';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closePdfModal = function() {
  const overlay = document.getElementById('pdfModal');
  overlay.classList.remove('open');
  setTimeout(() => { document.getElementById('pdfFrame').src = ''; }, 300);
  document.body.style.overflow = '';
};

/* ─── 7. RESUME PICKER ─── */
window.openResumePicker = function() {
  document.getElementById('resumePickerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
};
window.closeResumePicker = function() {
  document.getElementById('resumePickerModal').classList.remove('open');
  document.body.style.overflow = '';
};

/* ─── 8. FLOATING CHATBOT ─── */
window.toggleChat = function() {
  const box = document.getElementById('floatChatBox');
  box.style.display = box.style.display === 'none' ? 'flex' : 'none';
  if (box.style.display === 'flex') {
    box.style.flexDirection = 'column';
    document.getElementById('floatChatInput').focus();
  }
};

window.submitFloatExample = function(btn) {
  document.getElementById('floatChatInput').value = btn.textContent;
  sendFloatChat();
};

window.sendFloatChat = async function() {
  const input = document.getElementById('floatChatInput');
  const q = (input.value || '').trim();
  if (!q) return;
  addFloatMsg(q, 'user');
  input.value = '';

  // 타이핑 인디케이터
  const tempId = 'typing-' + Date.now();
  addFloatMsg('답변을 생성 중...', 'bot', tempId);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q }),
      signal: AbortSignal.timeout(15000)
    });
    const data = await res.json();
    removeMsg(tempId);
    addFloatMsg(data.reply || '죄송합니다. 다시 시도해주세요.', 'bot');
  } catch (e) {
    // Gemini API 불가 시 하드코딩 폴백
    removeMsg(tempId);
    addFloatMsg(getBotReply(q), 'bot');
  }
};

document.getElementById('floatChatInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendFloatChat();
});

function addFloatMsg(text, who, msgId) {
  const msgs = document.getElementById('floatMessages');
  const div  = document.createElement('div');
  div.className  = `chat-msg ${who}`;
  if (msgId) div.id = msgId;
  let parsedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')       // 굵은 글씨
    .replace(/\n\s*[-*]\s/g, '<br>• ')                      // 리스트(줄바꿈 후)
    .replace(/^\s*[-*]\s/g, '• ')                           // 리스트(첫 줄)
    .replace(/\n/g, '<br>');                                // 엔터
  div.innerHTML  = `<div class="chat-bubble">${parsedText}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeMsg(msgId) {
  const el = document.getElementById(msgId);
  if (el) el.remove();
}

function getBotReply(q) {
  const k = q.toLowerCase();
  if (/경력|이력|커리어/.test(k)) return '임광윤(Kevin Im)은 IGS(넷마블 계열사)에서 2022.06부터 현재까지 글로벌 게임 라이브 서비스 운영을 담당하고 있습니다.\n\nKOF AFK 글로벌, 세븐나이츠2 글로벌, 마블 퓨처파이트 글로벌, KOF 올스타 등 다수의 타이틀을 운영했습니다.\n\n그 전에는 인천공항운영서비스(2019~2021)와 한국생산성본부 인턴(2018) 경력이 있습니다.';
  if (/학교|대학|교육|학력|mba|대학원/.test(k)) return '동국대학교 MBA(비즈니스데이터애널리틱스) 과정을 2026년 2월 수료했습니다.\n\n동국대학교 학부에서는 영어영문학 주전공·경제학 복수전공을 했습니다.';
  if (/프로젝트|project|업적|실적/.test(k)) return '주요 프로젝트:\n\n1️⃣ 커뮤니티 이벤트 지표 분석 (최고 참여율 53%)\n2️⃣ VOC 구조화 및 인게임 개선안 도출\n3️⃣ 운영툴/포럼 기능 개선 제안 (25건)\n4️⃣ 빌드 검토 & 리스크 리포트\n5️⃣ KOF AFK 글로벌 SNS & 론칭 운영\n6️⃣ AiGS TIMES AI 뉴스레터 자동화 (44호+)';
  if (/스킬|기술|툴|tool|sql|python|n8n|make|자동화/.test(k)) return '주요 역량:\n• 글로벌 라이브 서비스 운영 (Jira, 운영툴)\n• 데이터 분석 (SQL, Python, R, 대시보드)\n• AI 자동화 (Make·n8n·Gemini API)\n• 영문 현지화 (TOEIC 960, Speaking 180)\n• VOC 구조화 및 리스크 리포팅';
  if (/aigs|뉴스레터|자동화|n8n/.test(k)) return 'AiGS TF는 사내 AI 활용 태스크포스입니다.\n\n2025.07~11: Make 기반 AI 뉴스레터 자동 발행 시스템 구축·운영\n2026.01~현재: n8n 기반으로 전환, AiGS TIMES 44호+ 발행(평일 1회)\n\nSNS 디스크립션·공지 초안 자동화로 반복 업무 효율화. 월간 경영회의 발표 및 사내 공유.';
  if (/연락|이메일|메일|contact/.test(k)) return '이메일: windcast@naver.com\n위치: Seoul, Korea\n\n언제든지 연락 주시면 빠르게 회신 드리겠습니다 😊';
  if (/resume|이력서|경력기술/.test(k)) return 'Resume 버튼을 클릭하시면 사업 PM용과 운영용 두 가지 경력기술서를 미리보기 또는 다운로드할 수 있습니다!';
  if (/youtube|유튜브|잼헌터/.test(k)) return '유튜브 채널 "잼헌터(@jamhuntrix)"를 운영 중입니다.\n구독자 10,300+명의 콘텐츠 기획·운영 채널입니다.';
  return '죄송합니다, 해당 질문에 대한 정확한 정보가 없습니다.\n\n경력·프로젝트·역량·연락처에 대해 질문해 주시면 성심껏 답변 드리겠습니다 😊';
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollSpy();
  initReveal();
  initSparkles();
  initSlider();
  updateDots();
});


/* ─── 3D CAPABILITIES GALLERY LOGIC ─── */
function initCapabilities3D() {
  const scene = document.getElementById('cap-3d-scene');
  if (!scene) return;

  const wrapper = document.getElementById('cap-3d-wrapper');
  const cards = document.querySelectorAll('.cap-3d-card');
  let isGridVisible = false;
  let hasAnimatedIntro = false;
  let isIntroPlaying = false;
  let hoveredIndex = null;

  const positions = [
    { x: -300, y: -100, z: -250, rotY: 15,  rotX: 5 },
    { x: 0,    y: -150, z: -400, rotY: 0,   rotX: 10 },
    { x: 300,  y: -100, z: -250, rotY: -15, rotX: 5 },
    { x: -280, y: 140,  z: -50,  rotY: 20,  rotX: -5 },
    { x: 0,    y: 180,  z: 150,  rotY: 0,   rotX: -10 },
    { x: 280,  y: 140,  z: -50,  rotY: -20, rotX: -5 },
  ];

  function updateTransforms() {
    if (isIntroPlaying) return;
    cards.forEach((card, i) => {
      const pos = positions[i];
      const floatWrap = card.querySelector('.cap-3d-float');
      const numberEl = card.querySelector('.cap-3d-number');

      // Default offscreen state
      let targetTransform = `translate(-50%, -50%) translate3d(0px, 400px, -1500px) rotateX(30deg) rotateY(${i % 2 === 0 ? 30 : -30}deg) scale(0.7)`;
      let targetOpacity = 0;
      let targetBlur = 'blur(0px)';
      let isFocus = false;
      let isBlurred = false;

      if (isGridVisible) {
        if (hoveredIndex === null) {
          // Everyone at their base coordinates
          targetTransform = `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg) scale(0.75)`;
          targetOpacity = 1;
        } else if (hoveredIndex === i) {
          // Focused
          isFocus = true;
          // transform is calculated in mouse move so use rotation data
          const rotX = parseFloat(card.dataset.rotX) || 0;
          const rotY = parseFloat(card.dataset.rotY) || 0;
          targetTransform = `translate(-50%, -50%) translate3d(0px, 0px, 300px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(0.9)`;
          targetOpacity = 1;
        } else {
          // Pushed back background
          targetTransform = `translate(-50%, -50%) translate3d(${pos.x * 1.5}px, ${pos.y * 1.5}px, ${pos.z - 500}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg) scale(0.75)`;
          targetOpacity = 0.3;
          targetBlur = 'blur(4px)';
          isBlurred = true;
        }
      }

      // Apply
      card.style.transform = targetTransform;
      card.style.opacity = targetOpacity;
      card.style.filter = targetBlur;
      
      // Floating anim states
      if (isGridVisible && hoveredIndex === null) {
        floatWrap.classList.add('animate-floating');
        floatWrap.style.animationDelay = `${i * 0.15}s`;
      } else {
        floatWrap.classList.remove('animate-floating');
      }

      // Classes for CSS rules
      if (isFocus) card.classList.add('is-hovered', 'z-50');
      else card.classList.remove('is-hovered', 'z-50');

      // Number parallax when focused
      if (isFocus) {
        const rotX = parseFloat(card.dataset.rotX) || 0;
        const rotY = parseFloat(card.dataset.rotY) || 0;
        numberEl.style.transform = `translateZ(60px) translateX(${rotY * -2}px) translateY(${rotX * 2}px)`;
      } else {
        numberEl.style.transform = `translateZ(0px)`;
      }

      if (!isGridVisible && hoveredIndex === null) {
         card.style.transitionDelay = `${i * 80}ms`;
      } else {
         card.style.transitionDelay = '0ms';
      }
    });
  }

  // Intersection Observer
  const obs = new IntersectionObserver(entries => {
    const isIntersecting = entries[0].isIntersecting;
    isGridVisible = isIntersecting;

    if (isIntersecting && !hasAnimatedIntro) {
      hasAnimatedIntro = true;
      playIntro();
    } else if (!isIntroPlaying) {
      updateTransforms();
    }
  }, { threshold: 0.2 });

  function playIntro() {
    isIntroPlaying = true;
    // 래퍼 빙글빙글 회전
    wrapper.style.animation = 'spinGallery 3.5s ease-in-out forwards';
    
    // 카드 원형 정렬
    const numCards = cards.length;
    const radius = 320;
    
    cards.forEach((card, i) => {
      const angle = (i / numCards) * Math.PI * 2;
      const cx = Math.cos(angle) * radius;
      const cy = Math.sin(angle) * radius;
      
      // opacity 0에서 시작하게 되어있으므로, css transform 및 opacity 적용
      card.style.transition = `transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.2}s, opacity 0.8s ease ${i * 0.2}s`;
      card.style.transform = `translate(-50%, -50%) translate3d(${cx}px, ${cy}px, -200px) rotateY(${angle}rad) scale(0.5)`;
      card.style.opacity = 1;
      card.style.filter = 'blur(0px)';
      const floatWrap = card.querySelector('.cap-3d-float');
      if (floatWrap) floatWrap.classList.remove('animate-floating');
    });

    // 회전 끝나고 흩어지기
    setTimeout(() => {
      cards.forEach((card) => {
        card.style.transition = 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
      });
      isIntroPlaying = false;
      updateTransforms();
    }, 3500);
  }
  obs.observe(scene);

  cards.forEach((c, idx) => {
    const inner = c.querySelector('.cap-3d-inner');
    inner.addEventListener('mouseenter', () => {
      hoveredIndex = idx;
      updateTransforms();
    });
    inner.addEventListener('mouseleave', () => {
      hoveredIndex = null;
      c.dataset.rotX = 0;
      c.dataset.rotY = 0;
      updateTransforms();
    });
    inner.addEventListener('mousemove', (e) => {
      if (hoveredIndex !== idx) return;
      const rect = inner.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctrX = rect.width / 2;
      const ctrY = rect.height / 2;
      
      const rx = ((y - ctrY) / ctrY) * -8;
      const ry = ((x - ctrX) / ctrX) * 8;
      
      c.dataset.rotX = rx;
      c.dataset.rotY = ry;
      updateTransforms();
    });
  });
}

function initChatbot() {
  const toggleBtn = document.getElementById('cb-toggle');
  const cbWin = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('cb-close');
  const input = document.getElementById('cb-input');
  const sendBtn = document.getElementById('cb-send');
  const msgsDiv = document.getElementById('cb-messages');

  if (!toggleBtn || !cbWin) return;

  function setOpen(val) {
    if (val) {
      cbWin.classList.add('is-open');
      toggleBtn.classList.add('is-hidden');
      setTimeout(() => input.focus(), 300);
      scrollToBottom();
    } else {
      cbWin.classList.remove('is-open');
      toggleBtn.classList.remove('is-hidden');
    }
  }

  function scrollToBottom() {
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
  }

  function appendMsg(text, isUser) {
    const row = document.createElement('div');
    row.className = `cb-msg-row ${isUser ? 'cb-user' : 'cb-bot'}`;
    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    bubble.innerHTML = text.replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    row.appendChild(bubble);
    msgsDiv.appendChild(row);
    scrollToBottom();
  }

  function appendLoading() {
    const row = document.createElement('div');
    row.className = 'cb-msg-row cb-bot cb-loading-row';
    const bubble = document.createElement('div');
    bubble.className = 'cb-loading';
    bubble.innerHTML = '<div class="cb-loading-dot"></div><div class="cb-loading-dot"></div><div class="cb-loading-dot"></div>';
    row.appendChild(bubble);
    msgsDiv.appendChild(row);
    scrollToBottom();
  }

  function removeLoading() {
    const rm = document.querySelector('.cb-loading-row');
    if (rm) rm.remove();
  }

  toggleBtn.onclick = () => setOpen(true);
  closeBtn.onclick = () => setOpen(false);

  async function handleSend() {
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    sendBtn.disabled = true;

    appendMsg(v, true);
    appendLoading();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: v })
      });
      const data = await res.json();
      removeLoading();
      appendMsg(data.reply || '오류가 발생했습니다.', false);
    } catch (e) {
      removeLoading();
      appendMsg('네트워크 오류가 발생했습니다.', false);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.onclick = handleSend;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') handleSend();
  };
}

// Append to window.onload existing
window.addEventListener('load', () => {
  initCapabilities3D();
  initChatbot();
});
