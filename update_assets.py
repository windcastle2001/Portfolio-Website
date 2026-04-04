import re

css = '''
/* =========================================================
   CORE CAPABILITIES 3D SECTION
   ========================================================= */
.cap-3d-scene {
  position: relative;
  width: 100%;
  height: 850px;
  perspective: 2000px;
  transform-style: preserve-3d;
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cap-3d-wrapper {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}
@media (max-width: 600px) {
  .cap-3d-wrapper { transform: scale(0.55); }
}
@media (min-width: 601px) and (max-width: 1024px) {
  .cap-3d-wrapper { transform: scale(0.75); }
}

.cap-3d-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 320px;
  height: 400px;
  transform-style: preserve-3d;
  transition: all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 10;
  opacity: 0; /* will be 1 when visible */
}
.cap-3d-card.z-50 {
  z-index: 50;
}

@keyframes floatCard {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}
.cap-3d-float {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}
.cap-3d-float.animate-floating {
  animation: floatCard 4s ease-in-out infinite;
}

.cap-3d-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  padding: 2rem;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: box-shadow 0.5s, border-color 0.5s;
  transform-style: preserve-3d;
}
.cap-3d-card.is-hovered .cap-3d-inner {
  border-color: transparent;
  box-shadow: 0 30px 60px rgba(251,146,60,0.3);
}

.cap-3d-accent {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 4px;
  background: linear-gradient(to right, #fb923c, #ef4444);
  transition: opacity 0.5s;
}
.cap-3d-card.is-hovered .cap-3d-accent {
  opacity: 0;
}

.cap-3d-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.7s ease-in-out;
}
.cap-3d-card.is-hovered .cap-3d-bg {
  opacity: 1;
}
.cap-3d-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.8);
  z-index: 10;
  transition: opacity 0.5s;
  mix-blend-mode: multiply;
}
.cap-3d-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 15s linear;
  transform: scale(1);
}
.cap-3d-card.is-hovered .cap-3d-bg img {
  transform: scale(1.25);
}

.cap-3d-number {
  position: absolute;
  right: -5%;
  top: 0%;
  z-index: 0;
  font-weight: 900;
  font-size: 10rem;
  line-height: 1;
  user-select: none;
  pointer-events: none;
  transition: all 0.7s ease-out;
  -webkit-text-stroke: 2px rgba(209, 213, 219, 0.4);
  color: transparent;
}
.cap-3d-card.is-hovered .cap-3d-number {
  -webkit-text-stroke: 0px transparent;
  color: rgba(255,255,255,0.08);
}

.cap-3d-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: none;
  transform: translateZ(30px);
}
.cap-3d-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  border-radius: 9999px;
  width: max-content;
  margin-bottom: 1rem;
  transition: background 0.3s, color 0.3s;
  background: #f3f4f6;
  color: #6b7280;
}
.cap-3d-card.is-hovered .cap-3d-category {
  background: rgba(249, 115, 22, 0.2);
  color: #fb923c;
}
.cap-3d-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
  transition: color 0.3s;
  color: #111827;
  line-height: 1.3;
}
.cap-3d-card.is-hovered .cap-3d-title {
  color: #ffffff;
}

.cap-3d-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  flex: 1;
}
.cap-3d-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.cap-3d-list li span:first-child {
  margin-top: 0.5rem;
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.3s, box-shadow 0.3s;
  background: #d1d5db;
}
.cap-3d-card.is-hovered .cap-3d-list li span:first-child {
  background: #fb923c;
  box-shadow: 0 0 8px rgba(251,146,60,0.8);
}
.cap-3d-list li p {
  font-size: 0.875rem;
  line-height: 1.6;
  transition: color 0.3s;
  color: #4b5563;
  margin: 0;
}
.cap-3d-card.is-hovered .cap-3d-list li p {
  color: #e5e7eb;
}

.cap-3d-plus {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 2rem;
  height: 2rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cap-3d-plus .i-plus,
.cap-3d-plus .i-arr {
  font-size: 1.25rem;
  position: absolute;
  transition: all 0.3s;
}
.cap-3d-plus .i-plus {
  color: #d1d5db;
  transform: translate(0, 0);
  opacity: 1;
}
.cap-3d-plus .i-arr {
  color: #fb923c;
  transform: translate(-100%, 100%);
  opacity: 0;
}
.cap-3d-card.is-hovered .cap-3d-plus .i-plus {
  transform: translate(100%, -100%);
  opacity: 0;
}
.cap-3d-card.is-hovered .cap-3d-plus .i-arr {
  transform: translate(0, 0);
  opacity: 1;
}

/* =========================================================
   CHATBOT WIDGET
   ========================================================= */
.chatbot-widget {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: inherit;
}
.chatbot-window {
  width: 20rem;
  height: 400px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
  transition: all 0.3s;
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}
.chatbot-window.is-open {
  transform: scale(1);
  opacity: 1;
  pointer-events: auto;
}
@media (min-width: 640px) {
  .chatbot-window { width: 24rem; }
}

.chatbot-header {
  background: #000;
  color: #fff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}
.chatbot-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.status-dot {
  width: 8px; height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulseChatDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulseChatDot {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
.chatbot-close {
  background: none; border: none; color: #fff;
  font-size: 1.5rem; line-height: 1; cursor: pointer;
}
.chatbot-close:hover { color: #d1d5db; }

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.cb-msg-row {
  display: flex;
  width: 100%;
}
.cb-bot { justify-content: flex-start; }
.cb-user { justify-content: flex-end; }
.cb-bubble {
  max-width: 85%;
  padding: 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  word-break: keep-all;
}
.cb-bot .cb-bubble {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #1f2937;
  border-top-left-radius: 0.125rem;
}
.cb-user .cb-bubble {
  background: #f97316;
  color: #fff;
  border-top-right-radius: 0.125rem;
}

.cb-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  border-radius: 1rem;
  border-top-left-radius: 0.125rem;
  width: max-content;
}
.cb-loading-dot {
  width: 8px; height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: cbBounce 1s infinite;
}
.cb-loading-dot:nth-child(2) { animation-delay: 0.15s; }
.cb-loading-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes cbBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.chatbot-input-area {
  padding: 0.75rem;
  background: #fff;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.5rem;
}
#cb-input {
  flex: 1;
  background: #f3f4f6;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border: none;
  outline: none;
  transition: box-shadow 0.2s;
}
#cb-input:focus {
  box-shadow: 0 0 0 2px #f97316;
}
#cb-send {
  background: #000;
  color: #fff;
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none; cursor: pointer;
  transition: background 0.2s;
}
#cb-send:hover { background: #1f2937; }
#cb-send:disabled { background: #d1d5db; cursor: not-allowed; }

.chatbot-toggle {
  background: #000;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none; cursor: pointer;
  transition: all 0.3s;
  pointer-events: auto;
}
.chatbot-toggle:hover {
  transform: scale(1.05) translateY(-4px);
}
.chatbot-toggle.is-hidden {
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}
.chatbot-toggle .icon { font-size: 1.25rem; }

'''

js = '''
/* ─── 3D CAPABILITIES GALLERY LOGIC ─── */
function initCapabilities3D() {
  const scene = document.getElementById('cap-3d-scene');
  if (!scene) return;

  const wrapper = document.getElementById('cap-3d-wrapper');
  const cards = document.querySelectorAll('.cap-3d-card');
  let isGridVisible = false;
  let hoveredIndex = null;

  const positions = [
    { x: -480, y: -240, z: -300, rotY: 15,  rotX: 5 },
    { x: 0,    y: -320, z: -500, rotY: 0,   rotX: 10 },
    { x: 480,  y: -240, z: -300, rotY: -15, rotX: 5 },
    { x: -420, y: 220,  z: -50,  rotY: 20,  rotX: -5 },
    { x: 0,    y: 280,  z: 150,  rotY: 0,   rotX: -10 },
    { x: 420,  y: 220,  z: -50,  rotY: -20, rotX: -5 },
  ];

  function updateTransforms() {
    cards.forEach((card, i) => {
      const pos = positions[i];
      const floatWrap = card.querySelector('.cap-3d-float');
      const numberEl = card.querySelector('.cap-3d-number');

      // Default offscreen state
      let targetTransform = `translate(-50%, -50%) translate3d(0px, 400px, -1500px) rotateX(30deg) rotateY(${i % 2 === 0 ? 30 : -30}deg)`;
      let targetOpacity = 0;
      let targetBlur = 'blur(0px)';
      let isFocus = false;
      let isBlurred = false;

      if (isGridVisible) {
        if (hoveredIndex === null) {
          // Everyone at their base coordinates
          targetTransform = `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg)`;
          targetOpacity = 1;
        } else if (hoveredIndex === i) {
          // Focused
          isFocus = true;
          // transform is calculated in mouse move so use rotation data
          const rotX = parseFloat(card.dataset.rotX) || 0;
          const rotY = parseFloat(card.dataset.rotY) || 0;
          targetTransform = `translate(-50%, -50%) translate3d(0px, 0px, 300px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.15)`;
          targetOpacity = 1;
        } else {
          // Pushed back background
          targetTransform = `translate(-50%, -50%) translate3d(${pos.x * 1.5}px, ${pos.y * 1.5}px, ${pos.z - 500}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg)`;
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
    isGridVisible = entries[0].isIntersecting;
    updateTransforms();
  }, { threshold: 0.1 });
  obs.observe(scene);

  cards.forEach((c, idx) => {
    c.addEventListener('mouseenter', () => {
      hoveredIndex = idx;
      updateTransforms();
    });
    c.addEventListener('mouseleave', () => {
      hoveredIndex = null;
      c.dataset.rotX = 0;
      c.dataset.rotY = 0;
      updateTransforms();
    });
    c.addEventListener('mousemove', (e) => {
      if (hoveredIndex !== idx) return;
      const rect = c.getBoundingClientRect();
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
    bubble.textContent = text;
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
'''

def apply():
    with open('style.css', 'a', encoding='utf-8') as f:
        f.write('\n' + css)
        
    with open('script.js', 'a', encoding='utf-8') as f:
        f.write('\n' + js)

if __name__ == '__main__':
    apply()
