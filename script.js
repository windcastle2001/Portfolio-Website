/* ===========================================================
   KEVIN IM PORTFOLIO – script.js (v5 - Unified & Targeted)
   =========================================================== */

const EMAILJS_PUBLIC_KEY = '8Og_DDRJ23tbyZHiG';
const EMAILJS_SERVICE_ID = 'service_cpvb348';
const EMAILJS_TEMPLATE_ID = 'template_xjr6p5h';

window.addEventListener('load', () => {
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    console.log('[EmailJS] 초기화 완료');
  }
});

/* ─── Contact Form Submit ─── */
window.submitContact = async function (e) {
  e.preventDefault();
  const btn    = document.getElementById('cf-submit');
  const status = document.getElementById('cf-status');

  const params = {
    from_name:  document.getElementById('cf-name').value.trim(),
    from_email: document.getElementById('cf-email').value.trim(),
    message:    document.getElementById('cf-msg').value.trim(),
    to_email:   'windcast@naver.com',
  };

  if (!params.from_name || !params.from_email || !params.message) {
    status.className  = 'cf-status error';
    status.textContent = '⚠️ 모든 항목을 입력해 주세요.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = '전송 중...';
  status.className  = 'cf-status';
  status.textContent = '';

  try {
    const res  = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(params),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      status.className  = 'cf-status success';
      status.textContent = '✓ 메시지를 성공적으로 보냈습니다! 빠르게 회신 드리겠습니다.';
      document.getElementById('contactForm').reset();
      btn.disabled    = false;
      btn.textContent = '보내기 ↗';
      return;
    }
    if (res.status !== 503) throw new Error(data.error || '서버 오류');
  } catch (backendErr) {
    console.warn('[Contact] backend fallback to EmailJS:', backendErr);
  }

  if (typeof emailjs === 'undefined') {
    status.className  = 'cf-status error';
    status.textContent = '✕ 전송 실패. windcast@naver.com 으로 직접 연락 주세요.';
    btn.disabled = false; btn.textContent = '보내기 ↗';
    return;
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    status.className  = 'cf-status success';
    status.textContent = '✓ 메시지를 성공적으로 보냈습니다!';
    document.getElementById('contactForm').reset();
  } catch (err) {
    status.className  = 'cf-status error';
    status.textContent = '✕ 전송 실패. windcast@naver.com 으로 연락 주세요.';
  } finally {
    btn.disabled = false; btn.textContent = '보내기 ↗';
  }
};

/* ─── 1. SIDEBAR ACTIVE LINK + SMOOTH SCROLL ─── */
function initScrollSpy() {
  const sections = document.querySelectorAll('main .section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .scroll-link');

  function setActive(id) {
    navLinks.forEach(a => {
      const target = a.dataset.target || a.getAttribute('href')?.replace('#', '');
      a.classList.toggle('active', target === id);
    });
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { threshold: 0.25 });

  sections.forEach(s => obs.observe(s));

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      // 모바일: 사이드바를 먼저 닫아 overflow:hidden 해제 후 스크롤
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }

      // overflow 복원이 반영된 뒤 스크롤 (50ms 대기)
      setTimeout(() => {
        const headerHeight = window.innerWidth <= 768 ? 64 : 0;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }, 50);
    });
  });
}

/* ─── 1-1. MOBILE MENU TOGGLE ─── */
window.toggleMobileMenu = function() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');
  const isOpening = !sidebar.classList.contains('open');

  if (isOpening) {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    if (menuToggle) menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  } else {
    closeMobileMenu();
  }
};

function closeMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  if (menuToggle) menuToggle.classList.remove('active');
  document.body.style.overflow = ''; // 스크롤 허용
}

/* ─── 1-1. 3D TILT INIT ─── */
function initTilt() {
  if (typeof VanillaTilt !== 'undefined') {
    // Core Capabilities (cap-3d-card)
    VanillaTilt.init(document.querySelectorAll(".cap-3d-card"), {
      max: 12,
      speed: 600,
      glare: true,
      "max-glare": 0.2,
      perspective: 1200,
      scale: 1.02
    });
    
    // Story items (reveal 클래스이면서 data-tilt 속성이 있는 것)
    VanillaTilt.init(document.querySelectorAll(".story-item[data-tilt]"), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.3
    });

    // 호버 이벤트 핸들링 (is-hovered 클래스 토글)
    document.querySelectorAll(".cap-3d-card").forEach(card => {
      card.addEventListener("mouseenter", () => card.classList.add("is-hovered"));
      card.addEventListener("mouseleave", () => card.classList.remove("is-hovered"));
    });
  } else {
    console.warn('[Tilt] VanillaTilt not found');
  }
}

/* ─── 2. REVEAL ON SCROLL ─── */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
}

/* ─── 3. HERO ANIMATIONS ─── */
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

/* ─── 4. PROJECT SLIDER (Targeted Dragging) ─── */
let projIdx = 0;
// TOTAL_SLIDES는 content-loader.js에서 window.TOTAL_SLIDES로 초기화됨

function initSlider() {
  const track = document.getElementById('projTrack');
  if (!track) return;

  let startX, startScrollX, isDragging = false, wasDragged = false;
  const DRAG_THRESHOLD = 15;

  function getSlideW() {
    const slide = track.querySelector('.proj-slide');
    if (!slide) return 420;
    const style = window.getComputedStyle(slide);
    const marginRight = parseInt(style.marginRight) || 0;
    return slide.offsetWidth + marginRight;
  }

  function goTo(idx) {
    if (window.TOTAL_SLIDES === 0) return;
    projIdx = Math.max(0, Math.min(window.TOTAL_SLIDES - 1, idx));
    const offset = projIdx * getSlideW();
    track.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)';
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  window.slideProj = (dir) => {
    const nextIdx = projIdx + dir;
    if (nextIdx >= 0 && nextIdx < (window.TOTAL_SLIDES || 1)) {
      goTo(nextIdx);
    }
  };
  window.goToSlide = (idx) => goTo(idx);

  track.addEventListener('dragstart', e => e.preventDefault());

  track.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    
    // [사용자 요청] 이미지 영역(.gallery-trigger) 터치 시 드래그 방지
    if (e.target.closest('.gallery-trigger')) {
      isDragging = false;
      wasDragged = false;
      return; 
    }

    isDragging = true;
    wasDragged = false;
    startX = e.clientX;
    startScrollX = projIdx * getSlideW();
    track.style.transition = 'none';
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) wasDragged = true;
    track.style.transform = `translateX(-${startScrollX - dx}px)`;
  });

  track.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    track.releasePointerCapture(e.pointerId);
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 80) {
      goTo(projIdx + (dx < 0 ? 1 : -1));
    } else {
      goTo(projIdx);
    }
  });

  track.addEventListener('pointercancel', () => {
    if (isDragging) { isDragging = false; goTo(projIdx); }
  });

  // 클릭 이벤트 캡처링 단계에서 드래그 여부 확인 및 갤러리 실행
  track.addEventListener('click', e => {
    // 드래그가 발생했다면 클릭 무시 (wasDragged가 true인 경우)
    if (wasDragged) {
      e.preventDefault();
      e.stopPropagation();
      wasDragged = false; // 다음 클릭을 위해 리셋
      return;
    }

    const trigger = e.target.closest('.gallery-trigger');
    if (trigger) {
      e.preventDefault();
      const gid = trigger.getAttribute('data-gallery-id');
      const gidx = parseInt(trigger.getAttribute('data-gallery-idx') || '0', 10);
      if (gid) openGallery(gid, gidx);
    }
  }, true);

  window.addEventListener('resize', () => goTo(projIdx));
}

function updateDots() {
  document.querySelectorAll('.proj-dot').forEach((d, i) => {
    d.classList.toggle('active', i === projIdx);
  });
  const arL = document.getElementById('arrowLeft');
  const arR = document.getElementById('arrowRight');
  if (arL) arL.style.opacity = projIdx === 0 ? '0.35' : '1';
  if (arR) arR.style.opacity = projIdx === window.TOTAL_SLIDES - 1 ? '0.35' : '1';
}

/* ─── 5. UNIFIED GALLERY (IMG + PDF) ─── */
const GALLERIES = {};
window.GALLERIES = GALLERIES;
let currentGalleryId = null;
let currentGalleryIdx = 0;

window.openGallery = function(id, idx = 0) {
  const gallery = GALLERIES[id];
  if (!gallery || gallery.length === 0) return;

  currentGalleryId = id;
  currentGalleryIdx = idx;

  const modal = document.getElementById('imgModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderGalleryItem();
  }
};

function renderGalleryItem() {
  const gallery = GALLERIES[currentGalleryId];
  if (!gallery) return;

  const item = gallery[currentGalleryIdx];
  const viewport = document.getElementById('modalViewport');
  const caption = document.getElementById('modalCaption');
  const counter = document.getElementById('modalCounter');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');

  if (!viewport) return;
  viewport.innerHTML = '';

  const url = item.src || item.url;
  const isPdf = url && url.toLowerCase().endsWith('.pdf');
  
  if (isPdf) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'modal-pdf';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    // PDF 전체 스크롤을 위해 scrolling="yes" 명시 (브라우저 기본값이지만 확실히 함)
    iframe.setAttribute('scrolling', 'yes');
    viewport.appendChild(iframe);
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.alt = item.caption || 'Gallery Image';
    viewport.appendChild(img);
  }

  if (caption) caption.textContent = item.caption || '';
  if (counter) counter.textContent = `${currentGalleryIdx + 1} / ${gallery.length}`;

  if (prevBtn) {
    prevBtn.disabled = (currentGalleryIdx === 0);
    prevBtn.style.opacity = (currentGalleryIdx === 0) ? '0.2' : '1';
  }
  if (nextBtn) {
    nextBtn.disabled = (currentGalleryIdx === gallery.length - 1);
    nextBtn.style.opacity = (currentGalleryIdx === gallery.length - 1) ? '0.2' : '1';
  }
}

window.galleryNav = function(dir) {
  const gallery = GALLERIES[currentGalleryId];
  if (!gallery) return;

  const nextIdx = currentGalleryIdx + dir;
  if (nextIdx >= 0 && nextIdx < gallery.length) {
    currentGalleryIdx = nextIdx;
    renderGalleryItem();
  }
};

window.closeModal = function() {
  const modal = document.getElementById('imgModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    const viewport = document.getElementById('modalViewport');
    if (viewport) viewport.innerHTML = '';
  }
};

/* ─── 6. PDF & RESUME PICKER ─── */
window.previewPdf = function (src, title) {
  closeResumePicker();
  const overlay = document.getElementById('pdfModal');
  if (!overlay) return;
  document.getElementById('pdfFrame').src = src;
  document.getElementById('pdfModalTitle').textContent = title || '문서 미리보기';
  const dlBtn = document.getElementById('pdfDownloadBtn');
  dlBtn.href = src;
  dlBtn.download = (title || 'document').replace(/[^\w가-힣\s]/g, '_') + '.pdf';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closePdfModal = function () {
  const overlay = document.getElementById('pdfModal');
  if (overlay) overlay.classList.remove('open');
  setTimeout(() => { 
    const frame = document.getElementById('pdfFrame');
    if(frame) frame.src = ''; 
  }, 300);
  document.body.style.overflow = '';
};

window.openResumePicker = function () {
  const overlay = document.getElementById('resumePickerModal');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    console.warn('[Resume] resumePickerModal element not found');
  }
};

window.closeResumePicker = function () {
  const overlay = document.getElementById('resumePickerModal');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ─── Keyboard Nav ─── */
document.addEventListener('keydown', e => {
  const imgModal = document.getElementById('imgModal');
  if (imgModal && imgModal.classList.contains('open')) {
    if (e.key === 'ArrowLeft')  galleryNav(-1);
    if (e.key === 'ArrowRight') galleryNav(1);
    if (e.key === 'Escape') closeModal();
  }
  const pdfModal = document.getElementById('pdfModal');
  if (pdfModal && pdfModal.classList.contains('open')) {
    if (e.key === 'Escape') closePdfModal();
  }
});

/* ─── 7. FLOATING AI CHATBOT (Original UI) ─── */
window.toggleChat = function() {
  const box = document.getElementById('floatChatBox');
  if (!box) return;
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'flex' : 'none';
  
  if (isHidden) {
    const input = document.getElementById('floatChatInput');
    if (input) input.focus();
  }
};

window.submitFloatExample = function(btn) {
  const text = btn.textContent;
  const input = document.getElementById('floatChatInput');
  if (input) {
    input.value = text;
    sendFloatChat();
  }
};

window.sendFloatChat = async function() {
  const input = document.getElementById('floatChatInput');
  const messages = document.getElementById('floatMessages');
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;

  // 유저 메시지 추가
  addFloatMessage('user', text);
  input.value = '';

  // AI 로딩 상태
  const loadingId = 'loading-' + Date.now();
  addFloatMessage('bot', '생각 중...', loadingId);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    
    // 로딩 메시지 제거 후 실제 답변 추가
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    if (data.reply) {
      addFloatMessage('bot', data.reply);
    } else {
      addFloatMessage('bot', '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.');
    }
  } catch (err) {
    console.error('[Chat] Error:', err);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    addFloatMessage('bot', '서버와 연결할 수 없습니다. 나중에 다시 시도해 주세요.');
  }
};

function addFloatMessage(role, text, id = null) {
  const container = document.getElementById('floatMessages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg ' + role;
  if (id) msgDiv.id = id;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');

  msgDiv.appendChild(bubble);
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// 엔터키 처리
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement.id === 'floatChatInput') {
    sendFloatChat();
  }
});


/* ─── 4. Mail Copy & Toast Notification ─── */
function initMailCopy() {
  const btn = document.getElementById('mail-copy-btn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = 'windcast@naver.com';
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showToast('메일 주소가 복사되었습니다.');
      }).catch(err => {
        console.error('[Mail] Copy failed:', err);
        fallbackCopyText(email);
      });
    } else {
      fallbackCopyText(email);
    }
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('메일 주소가 복사되었습니다.');
  } catch (err) {
    console.error('[Mail] Fallback copy failed:', err);
  }
  document.body.removeChild(textArea);
}

function showToast(msg) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  
  toast.textContent = msg;
  // Trigger Reflow
  toast.offsetHeight; 
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}


/* ─── 5. GSAP Signature Animations ─── */
function initCapAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);
  const container = document.getElementById('dyn-capabilities-list');
  const cards = document.querySelectorAll('.cap-3d-card');
  if (!container || !cards.length) return;

  // 카드들을 중앙으로 모으기 위한 계산 (초기 상태 세팅)
  cards.forEach((card) => {
    gsap.set(card, {
      opacity: 0,
      scale: 0,
      rotation: -180,
      x: 0, // 기본적으로 absolute/grid 위치에서 0 (후속 계산에서 보정 가능하지만, 간단히 0으로 두고 transform 중심점 활용)
      y: 0,
      z: -200
    });
  });

  ScrollTrigger.create({
    trigger: "#capabilities",
    start: "top 85%",
    onEnter: () => {
      // 촥 퍼지는 느낌을 위해 각 카드의 원본 그리드 위치를 활용
      // gsap.from을 써서 중앙(x:0, y:0가 아닌 별도 offset)에서 오게 할 수도 있지만
      // 여기서는 스케일과 회전, 그리고 물리적인 '전개' 느낌을 강조합니다.
      gsap.to(cards, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        z: 0,
        duration: 1.6,
        stagger: {
          each: 0.12,
          from: "center" // 중앙부터 순차적으로 퍼짐
        },
        ease: "expo.out",
        onComplete: function() {
          cards.forEach(t => {
            t.classList.add('is-ready');
            t.addEventListener('mouseenter', () => t.classList.add('is-hovered'));
            t.addEventListener('mouseleave', () => t.classList.remove('is-hovered'));
          });
        }
      });
    },
    once: true
  });

  setTimeout(() => ScrollTrigger.refresh(), 1000);
}

/* ─── 6. CAPABILITIES MOBILE SLIDER ─── */
function initCapSlider() {
  if (window.innerWidth > 768) return;
  const grid = document.querySelector('.cap-grid');
  const leftBtn = document.querySelector('.cap-arrow-left');
  const rightBtn = document.querySelector('.cap-arrow-right');
  const indicator = document.getElementById('capSliderIndicator');
  if (!grid || !leftBtn || !rightBtn) return;

  let currentIndex = 0;
  const getCards = () => grid.querySelectorAll('.cap-3d-card');

  function goToCard(index) {
    const cards = getCards();
    if (!cards.length) return;
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    const card = cards[currentIndex];
    grid.scrollTo({ left: card.offsetLeft - (grid.offsetWidth - card.offsetWidth) / 2, behavior: 'smooth' });
    if (indicator) indicator.textContent = (currentIndex + 1) + ' / ' + cards.length;
  }

  leftBtn.addEventListener('click', () => goToCard(currentIndex - 1));
  rightBtn.addEventListener('click', () => goToCard(currentIndex + 1));

  // 초기 상태
  const cards = getCards();
  if (indicator && cards.length) indicator.textContent = '1 / ' + cards.length;
}

/* ─── Initialization ─── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollSpy();
  initReveal();
  initSparkles();
  initSlider();
  initMailCopy();
  initCapAnimation();

  // 모바일 햄버거 버튼 이벤트 바인딩
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  // VanillaTilt 초기화 (Capabilities 포함)
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
  }

  // 콘텐츠 로딩 완료 후 처리
  document.addEventListener('contentLoaded', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    initCapSlider();
  });

  // GSAP 미작동 시 카드 강제 표시 (3초 후)
  setTimeout(() => {
    document.querySelectorAll('.cap-3d-card').forEach(card => {
      if (getComputedStyle(card).opacity === '0') {
        card.style.opacity = '1';
        card.style.transform = 'none';
      }
    });
    // contentLoaded가 이미 발생했을 수 있으므로 슬라이더도 초기화 시도
    initCapSlider();
  }, 3000);
});

