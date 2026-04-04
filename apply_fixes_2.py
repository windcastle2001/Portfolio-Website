import re

def update_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # 1. Sidebar Nav scrollbar & active bulge
    css = re.sub(
        r'(\.sidebar-nav \{[^}]*)\}', 
        r'\1\n  overflow-y: auto;\n}\n.sidebar-nav::-webkit-scrollbar { display: none; }\n', 
        css
    )
    # The nav-link transition and active classes
    new_nav_link_base = r'''.nav-link {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.55);
  padding: 9px 6px 8px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
}'''
    css = re.sub(r'\.nav-link\s*\{[^}]*\}', new_nav_link_base, css, count=1)

    new_nav_active = r'''.nav-link.active {
  color: var(--white);
  border-bottom-color: var(--orange);
  transform: scale(1.15) translateX(10px);
}'''
    css = re.sub(r'\.nav-link\.active\s*\{[^}]*\}', new_nav_active, css, count=1)

    # 2. 3D Gallery Scalability and dimensions
    new_scene = r'''.cap-3d-scene {
  position: relative;
  width: 100%;
  height: 650px;
  perspective: 2000px;
  transform-style: preserve-3d;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}'''
    css = re.sub(r'\.cap-3d-scene\s*\{[^}]*\}', new_scene, css, count=1)

    # Media query changes for cap-3d-wrapper
    css = re.sub(r'transform:\s*scale\(0\.55\);', 'transform: scale(0.40);', css)
    css = re.sub(r'transform:\s*scale\(0\.75\);', 'transform: scale(0.65);', css)

    # cap-3d-card pointer-events trick for better hover 
    css = re.sub(r'(\.cap-3d-card\s*\{[^}]*)(\})', r'\1  pointer-events: none;\n\2', css)
    css = re.sub(r'(\.cap-3d-inner\s*\{[^}]*)(\})', r'\1  pointer-events: auto;\n\2', css)

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)


def update_js():
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Change event listeners to bind to inner but act on card
    old_code = r'''  cards.forEach((c, idx) => {
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
  });'''

    new_code = r'''  cards.forEach((c, idx) => {
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
  });'''

    js = js.replace(old_code, new_code)

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)

if __name__ == '__main__':
    update_css()
    update_js()

