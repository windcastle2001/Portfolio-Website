import re

def patch_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Add overflow: visible to #capabilities
    # Looking for a safe place, just append it.
    patch = '''
#capabilities {
  overflow: visible !important;
}

@keyframes spinGallery {
  0%   { transform: rotateY(-360deg); }
  100% { transform: rotateY(0deg); }
}

'''
    # Change margin-top of .cap-3d-scene
    css = re.sub(r'(\.cap-3d-scene\s*\{[^}]*margin-top:\s*)(\d+px)', r'\g<1>150px', css)

    if '#capabilities' not in css:
        css += patch

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

def patch_js():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Update positions to be tighter and lower
    old_pos = '''  const positions = [
    { x: -480, y: -240, z: -300, rotY: 15,  rotX: 5 },
    { x: 0,    y: -320, z: -500, rotY: 0,   rotX: 10 },
    { x: 480,  y: -240, z: -300, rotY: -15, rotX: 5 },
    { x: -420, y: 220,  z: -50,  rotY: 20,  rotX: -5 },
    { x: 0,    y: 280,  z: 150,  rotY: 0,   rotX: -10 },
    { x: 420,  y: 220,  z: -50,  rotY: -20, rotX: -5 },
  ];'''

    new_pos = '''  const positions = [
    { x: -380, y: -160, z: -300, rotY: 15,  rotX: 5 },
    { x: 0,    y: -220, z: -500, rotY: 0,   rotX: 10 },
    { x: 380,  y: -160, z: -300, rotY: -15, rotX: 5 },
    { x: -340, y: 220,  z: -50,  rotY: 20,  rotX: -5 },
    { x: 0,    y: 260,  z: 150,  rotY: 0,   rotX: -10 },
    { x: 340,  y: 220,  z: -50,  rotY: -20, rotX: -5 },
  ];'''
    js = js.replace(old_pos, new_pos)

    # Insert hasAnimatedIntro before positions
    js = js.replace('  let isGridVisible = false;', '  let isGridVisible = false;\n  let hasAnimatedIntro = false;\n  let isIntroPlaying = false;')

    # Replace the Intersection Observer logic to handle playIntro()
    old_obs = '''  const obs = new IntersectionObserver(entries => {
    isGridVisible = entries[0].isIntersecting;
    updateTransforms();
  }, { threshold: 0.1 });'''

    new_obs = '''  const obs = new IntersectionObserver(entries => {
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
      card.style.transform = `translate(-50%, -50%) translate3d(${cx}px, ${cy}px, -200px) rotateY(${angle}rad) scale(0.6)`;
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
  }'''

    js = js.replace(old_obs, new_obs)

    # In updateTransforms, block if intro is playing
    js = js.replace('function updateTransforms() {\n    cards.forEach(', 'function updateTransforms() {\n    if (isIntroPlaying) return;\n    cards.forEach(')

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)

if __name__ == '__main__':
    patch_css()
    patch_js()
