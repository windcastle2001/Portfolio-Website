def apply_fixes():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    css = css.replace(
        '  overflow: hidden;\n  transform-origin: bottom right;\n  transition: all 0.3s;',
        '  overflow: hidden; resize: both; min-width: 300px; min-height: 400px; max-width: 90vw; max-height: 80vh;\n  transform-origin: bottom right;\n  transition: transform 0.3s, opacity 0.3s;'
    )

    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css)

    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Apply markdown parsing for **bold** and line breaks
    from_str = "bubble.textContent = text;"
    to_str = "bubble.innerHTML = text.replace(/\\\\*\\\\*([^\\\\*]+)\\\\*\\\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>');"
    
    js = js.replace(from_str, to_str)

    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(js)

if __name__ == '__main__':
    apply_fixes()
