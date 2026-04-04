/**
 * content-loader.js
 * /api/content에서 데이터를 가져와 페이지의 동적 요소에 반영합니다.
 * Admin CMS에서 저장하면 페이지 새로고침 시 즉시 반영됩니다.
 */
(function () {
  'use strict';

  fetch('/api/content')
    .then(r => r.json())
    .then(apply)
    .catch(() => {}); // 로컬이 아닌 환경에서도 조용히 실패

  function apply(C) {
    // ── Hero ──────────────────────────────────────────────
    const h = C.hero || {};
    setText('dyn-hero-subtitle', h.subtitle);
    setHtml('dyn-hero-desc',  nl2br(h.desc));

    // ── About ─────────────────────────────────────────────
    const a = C.about || {};
    setHtml('dyn-about-bio',   nl2br(a.bio));
    setHtml('dyn-about-quote', a.quote ? '"' + a.quote + '"' : null);

    const statsContainer = document.getElementById('dyn-about-stats');
    if (statsContainer && Array.isArray(a.stats) && a.stats.length) {
      statsContainer.innerHTML = a.stats.map(s =>
        `<div class="stat-item">
           <span class="stat-num">${esc(s.num)}</span>
           <span class="stat-label">${esc(s.label).replace(/\n/g, '<br>')}</span>
         </div>`
      ).join('');
    }

    // ── Metrics ───────────────────────────────────────────
    const grid = document.getElementById('dyn-metrics-grid');
    if (grid && Array.isArray(C.metrics) && C.metrics.length) {
      grid.innerHTML = C.metrics.map(m =>
        `<div class="metric-card">
           <span class="metric-num">${esc(m.num)}</span>
           <span class="metric-label">${esc(m.label).replace(/\n/g, '<br>')}</span>
         </div>`
      ).join('');
      // reveal을 쓰지 않고 직접 표시 — initReveal이 이미 끝난 뒤 주입되므로
    }

    // ── Contact ───────────────────────────────────────────
    const co = C.contact || {};
    if (co.email) {
      document.querySelectorAll('[data-dyn-email]').forEach(el => {
        el.textContent = co.email;
        el.href = 'mailto:' + co.email;
      });
    }

    // ── Media: PDF 버튼 ───────────────────────────────────
    const med = C.media || {};
    patchPdfBtn('resume_pm',   med.resume_pm_pdf);
    patchPdfBtn('resume_ops',  med.resume_ops_pdf);
    patchPdfBtn('portfolio',   med.portfolio_pdf);
  }

  // ── helpers ──────────────────────────────────────────────
  function setText(id, val) {
    if (!val) return;
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function setHtml(id, val) {
    if (!val) return;
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  }
  function nl2br(s) {
    if (!s) return '';
    return esc(s).replace(/\n/g, '<br>');
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function patchPdfBtn(key, url) {
    if (!url) return;
    // picker 모달의 onclick을 업데이트
    document.querySelectorAll(`[data-pdf="${key}"]`).forEach(btn => {
      btn.onclick = () => window.previewPdf && window.previewPdf(url, btn.dataset.pdfTitle || '');
    });
  }
})();
