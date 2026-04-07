/**
 * content-loader.js
 * /api/content에서 데이터를 가져와 페이지의 동적 요소에 반영합니다.
 */
(function () {
  'use strict';

  fetch('/api/content', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : r.json().then(err => Promise.reject(err)))
    .then(apply)
    .catch(err => console.warn('[content-loader] fetch 실패:', err));

  function isPdfUrl(url) {
    return /\.pdf(\?|$)/i.test(url || '');
  }

  function apply(C) {
    if (!C) return;

    // ── 1. Hero ──────────────────────────────────────────────
    const h = C.hero || {};
    setText('dyn-hero-subtitle', h.subtitle);
    setHtml('dyn-hero-desc', nl2br(h.desc));

    // ── 2. About ─────────────────────────────────────────────
    const a = C.about || {};
    setHtml('dyn-about-bio', nl2br(a.bio));
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

    // ── 3. Metrics / Skills ─────────────────────────────────
    const grid = document.getElementById('dyn-metrics-grid');
    if (grid && Array.isArray(C.metrics) && C.metrics.length) {
      grid.innerHTML = C.metrics.map(m =>
        `<div class="metric-card">
           <span class="metric-num">${esc(m.num)}</span>
           <span class="metric-label">${esc(m.label).replace(/\n/g, '<br>')}</span>
         </div>`
      ).join('');
    }

    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid && Array.isArray(C.skills) && C.skills.length) {
      skillsGrid.innerHTML = C.skills.map(group => {
        const tagsHtml = (group.tags || []).map(tag => {
          const cls = tag.type === 'orange' ? 'tag tag-orange'
                    : tag.type === 'purple' ? 'tag tag-purple' : 'tag';
          return `<span class="${cls}">${esc(tag.text)}</span>`;
        }).join('');
        return `<div class="skill-group reveal visible">
          <h3 class="skill-group-title"><span class="skill-dot"></span>${esc(group.title)}</h3>
          <div class="skill-tags">${tagsHtml}</div>
        </div>`;
      }).join('');
    }

    // ── 4. Media: 프로필 사진 & PDF 버튼 ───────────────────
    const med = C.media || {};

    if (med.profile_home) {
      const el = document.getElementById('hero-profile-img');
      if (el) el.src = med.profile_home;
    }
    if (med.profile_about) {
      const el = document.getElementById('about-profile-img');
      if (el) el.src = med.profile_about;
    }

    renderYoutubeMeta(med);
    if (med.youtube_subscribers) {
      const ysEl = document.getElementById('dyn-youtube-sub');
      if (ysEl) ysEl.textContent = `콘텐츠 기획·운영 채널 (구독자 ${med.youtube_subscribers})`;
    }
    if (med.youtube_url) {
      const ylEl = document.querySelector('.about-youtube .youtube-link');
      if (ylEl) ylEl.href = med.youtube_url;
    }

    window.previewPortfolio = function () {
      if (med.portfolio_pdf) window.downloadPdf(med.portfolio_pdf, '포트폴리오_임광윤');
    };

    const resumePmBtn  = document.querySelector('.picker-btns .picker-btn:nth-child(1)');
    const resumeOpsBtn = document.querySelector('.picker-btns .picker-btn:nth-child(2)');
    if (resumePmBtn  && med.resume_pm_pdf)  resumePmBtn.onclick  = () => { window.closeResumePicker(); window.downloadPdf(med.resume_pm_pdf,  '경력기술서_임광윤_사업PM'); };
    if (resumeOpsBtn && med.resume_ops_pdf) resumeOpsBtn.onclick = () => { window.closeResumePicker(); window.downloadPdf(med.resume_ops_pdf, '경력기술서_임광윤_운영'); };

    // ── 5. Projects: 대표 이미지 1장 + 배지 ────────────────
    const track = document.getElementById('projTrack');
    if (track && Array.isArray(C.projects) && C.projects.length) {

    track.innerHTML = '';

    C.projects.forEach((p, pIdx) => {
      const id     = 'p' + (pIdx + 1);
      const images = p.images || [];

      // 갤러리 데이터 등록 (script.js GALLERIES 객체)
      window.GALLERIES[id] = images.map(img => {
        let cleanUrl = img.url;
        // [User 요청] PDF 전체 노출을 위해 Cloudinary 이미지 압축/변환 플래그 제거
        if (isPdfUrl(cleanUrl)) {
          cleanUrl = cleanUrl.replace(/\/(q_auto|f_auto|fl_attachment)[^/]*\//g, '/');
          cleanUrl = cleanUrl.replace(/,(q_auto|f_auto|fl_attachment)[^/,]*/g, '');
        }
        return {
          src:     cleanUrl,
          caption: img.caption || p.title,
          isPdf:   isPdfUrl(cleanUrl)
        };
      });

      // 대표 이미지: 1장만 (첫 번째)
      const first    = images[0] || {};
      const thumbSrc = first.url || '';

      let thumbContent = '';
      if (thumbSrc) {
        if (isPdfUrl(thumbSrc)) {
          // PDF 대표 → 아이콘 표시
          thumbContent = `
            <div class="proj-thumb-pdf-placeholder">
              <div class="pdf-icon">📄</div>
              <div class="pdf-label">${esc(first.caption || 'PDF 문서')}</div>
              <div class="pdf-click-hint">클릭하여 미리보기</div>
            </div>`;
        } else {
          thumbContent = `<img
            class="proj-thumb-img"
            src="${thumbSrc}"
            alt="${esc(first.caption || p.title)}"
            loading="lazy"
            draggable="false"
          >`;
        }
      }

      // 배지: 전체 파일 수 표시
      const total     = images.length;
      const badgeHtml = total > 1 ? `<div class="proj-img-badge">+${total}장</div>` : '';
      const zoomHint  = thumbSrc ? '<div class="proj-thumb-zoom">🔍 클릭하여 확대</div>' : '';

      const slide = document.createElement('div');
      slide.className = 'proj-slide';
      // 기술 스택 배지
      const techHtml = (p.tech || []).map(t => `<span class="tag tag-sm">${esc(t)}</span>`).join('');
      
      slide.innerHTML = `
        <div class="proj-thumb proj-thumb-single gallery-trigger" data-gallery-id="${id}" data-gallery-idx="0">
          <div class="proj-thumb-label">${esc(p.category)}</div>
          ${thumbContent}
          ${badgeHtml}
          ${zoomHint}
        </div>
        <div class="proj-body">
          <span class="proj-num">${esc(p.num)}</span>
          <h3 class="proj-title">${nl2br(esc(p.title))}</h3>
          <p class="proj-desc">${nl2br(esc(p.desc))}</p>
          <div class="proj-result"><span>핵심성과:</span> ${nl2br(esc(p.result))}</div>
          <div class="proj-tech-wrap" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:5px;">
            ${techHtml}
          </div>
        </div>
      `;
      track.appendChild(slide);
    });

    // ── 슬라이더 초기화 (DOM 구성 완료 후) ──────────────────
    window.TOTAL_SLIDES = C.projects.length;
    if (typeof window.initSlider === 'function') window.initSlider();
    renderDots(C.projects.length);
    if (typeof window.updateDots === 'function') window.updateDots();

    } // end if (track && projects)

    // ── 6. Capabilities ──────────────────────
    function applyCapabilities(caps) {
      const container = document.getElementById('dyn-capabilities-list');
      if (!container || !caps) return;
      
      container.innerHTML = caps.map((cap, index) => `
        <div class="cap-3d-card" data-tilt>
          <div class="cap-3d-float animate-floating">
            <div class="cap-3d-inner">
              <div class="cap-3d-accent"></div>
              <div class="cap-3d-bg">
                <img src="${cap.bg_image || ''}" alt="${esc(cap.title)}" loading="lazy">
                <div class="cap-3d-overlay"></div>
              </div>
              <div class="cap-3d-number">0${index + 1}</div>
              <div class="cap-3d-content">
                <span class="cap-3d-category">${esc(cap.category || 'OPERATION')}</span>
                <h3 class="cap-3d-title">${esc(cap.title)}</h3>
                <ul class="cap-3d-list">
                  ${(cap.items || []).map(item => `<li><span></span><p>${esc(item)}</p></li>`).join('')}
                </ul>
                <div class="cap-3d-plus">
                  <span class="i-plus">+</span>
                  <span class="i-arr">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      
      if (window.initTilt) window.initTilt();
      
      // [긴급 복구] 렌더링 완료 후 GSAP 애니메이션 트리거 초기화/리프레시
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
      if (typeof window.initCapAnimation === 'function') {
        window.initCapAnimation();
      }
    }
    applyCapabilities(C.capabilities);

    // ── 7. Story ──────────────────────
    const storyContainer = document.getElementById('dyn-story-content');
    if (storyContainer && C.story) {
      const renderCol = (items, header, isBlue) => {
        const headerCls = isBlue ? 'story-col-header story-col-header-blue' : 'story-col-header';
        const itemsHtml = (items || []).map(item => `
          <div class="story-item reveal visible">
            <span class="story-icon">${esc(item.icon)}</span>
            <div>
              <strong>${esc(item.title)}</strong>
              <p>${esc(item.desc)}</p>
            </div>
          </div>`).join('');
        
        return `
          <div class="story-col">
            <div class="${headerCls}">${esc(header)}</div>
            <div class="story-items-wrap">
              ${itemsHtml}
            </div>
          </div>`;
      };

      storyContainer.innerHTML = 
        renderCol(C.story.left, '운영에서 해온 일', false) +
        renderCol(C.story.right, '사업 PM 역할로의 연결', true);
    }

    // ── 8. Experience ──────────────────────
    const expList = document.getElementById('dyn-experience-list');
    if (expList && Array.isArray(C.experience) && C.experience.length) {
      expList.innerHTML = C.experience.map(co => {
        const jobs = co.jobs || [];

        // 게임 아이템 (tl-game-list 안에만)
        const gameItemsHtml = jobs.map(job => {
          const logoHtml = job.game_logo_url
            ? `<img src="${esc(job.game_logo_url)}" alt="${esc(job.game)}" class="tl-game-logo" onerror="this.style.display='none'">`
            : '';
          return `<div class="tl-game-item">
            ${logoHtml}
            <div>
              <span class="tl-game-title">${esc(job.game)}</span>
              <span class="tl-game-period">${esc(job.period)}</span>
              ${job.position ? `<span style="font-size:11px;color:rgba(255,255,255,0.5);display:block;">${esc(job.position)}${job.regions ? ' · ' + esc(job.regions) : ''}</span>` : ''}
            </div>
          </div>`;
        }).join('');

        // 업무 항목 (tl-game-list 밖, 각 job별 subtask)
        const subtasksHtml = jobs.filter(j => j.items && j.items.length).map(job => {
          const itemsHtml = job.items.map(it =>
            `<div class="tl-subtask-row">· ${esc(it)}</div>`
          ).join('');
          return `<div class="tl-subtask">
            <span class="tl-subtask-label">+ ${esc(job.game)} · ${esc(job.period)}</span>
            <div class="tl-subtask-body">${itemsHtml}</div>
          </div>`;
        }).join('');

        const logoHtml = co.logo_url
          ? `<img src="${esc(co.logo_url)}" alt="${esc(co.company)}" class="tl-logo" onerror="this.style.display='none'">`
          : '';

        return `<div class="tl-item reveal visible">
          <div class="tl-left">
            <span class="tl-period">${esc(co.period)}</span>
            <div class="tl-logo-wrap">${logoHtml}</div>
            <span class="tl-company">${esc(co.company)}${co.dept ? ' · ' + esc(co.dept) : ''}</span>
          </div>
          <div class="tl-right">
            <h3 class="tl-role">${esc(co.dept || '').toUpperCase()}</h3>
            ${gameItemsHtml ? `<div class="tl-game-list">${gameItemsHtml}</div>` : ''}
            ${subtasksHtml}
          </div>
        </div>`;
      }).join('');
    }

    // ── 9. Contact ──────────────────────
    if (C.contact) {
      const emailEl = document.getElementById('dyn-contact-email');
      if (emailEl) {
        emailEl.textContent = '✉ ' + C.contact.email;
        emailEl.href = 'mailto:' + C.contact.email;
      }
      const locEl = document.getElementById('dyn-contact-location');
      if (locEl) locEl.textContent = '📍 ' + C.contact.location;

      setHtml('dyn-contact-desc', nl2br(C.contact.desc));
    }

    // ── 콘텐츠 로딩 완료 신호 (자동화 테스트 감지용) ──────────────
    document.body.setAttribute('data-content-loaded', 'true');
    document.dispatchEvent(new CustomEvent('contentLoaded'));
  }


  function renderDots(num) {
    var container = document.getElementById('projDots');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < num; i++) {
      var dot = document.createElement('button');
      dot.className = 'proj-dot' + (i === 0 ? ' active' : '');
      (function (idx) {
        dot.onclick = function () { window.goToSlide && window.goToSlide(idx); };
      })(i);
      container.appendChild(dot);
    }
  }

  // ── helpers ──────────────────────────────────────────────
  function setText(id, val) {
    if (!val) return;
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function setHtml(id, val) {
    if (!val) return;
    var el = document.getElementById(id);
    if (el) el.innerHTML = val;
  }
  function nl2br(s) {
    if (!s) return '';
    return String(s).replace(/\n/g, '<br>');
  }
  function renderYoutubeMeta(med) {
    const ysEl = document.getElementById('dyn-youtube-sub');
    if (!ysEl) return;
    const subs = ((med || {}).youtube_subscribers || '').trim();
    if (!subs) return;
    ysEl.textContent = `콘텐츠 기획·운영 채널 (구독자 ${subs})`;
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  }
})();
