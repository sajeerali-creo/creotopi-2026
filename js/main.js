(() => {
  const init = () => {
  const D = window.CREOTOPI;
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  /* ---------- Render content ---------- */
  const mail = $('#mail-btn');
  mail.href = 'mailto:' + D.studio.email;
  mail.textContent = D.studio.email;

  const form = $('#contact-form'), msg = $('#form-msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = form.name.value.trim(), m = form.email.value.trim();
    if (!n || !/^\S+@\S+\.\S+$/.test(m)) { msg.textContent = 'Please enter your name and a valid email.'; return; }
    msg.textContent = 'Opening your email app…';
    location.href = `mailto:${D.studio.email}?subject=${encodeURIComponent('Project enquiry from ' + n)}&body=${encodeURIComponent('Name: ' + n + '\nEmail: ' + m + '\n\n')}`;
  });

  const media = p => p.cover
    ? `<img src="${escapeHTML(p.cover)}" alt="${escapeHTML(p.title)}" loading="lazy">`
    : `<div class="ph">${escapeHTML(p.title).toUpperCase()}</div>`;

  $('#grid').innerHTML = D.projects.slice(0, 6).map(p => `
    <a class="card" href="${escapeHTML(p.url)}" target="_blank" rel="noopener" data-card>
      <div class="card__media" style="--g1:${escapeHTML(p.g?.[0] || '#ccc')};--g2:${escapeHTML(p.g?.[1] || '#999')}">${media(p)}</div>
      <div class="card__meta"><span>${escapeHTML(p.title)}</span><span>_${escapeHTML(p.date)}</span></div>
    </a>`).join('');
  $('#work-count').textContent = `( _${String(new Date().getFullYear()).slice(2).padStart(3, '0')} )`;

  // 10 hero banner tiles matching reference
  const heroTiles = [
    { type: 'video', src: 'assets/hero/tile-1.mp4', r: '90px 90px 90px 90px' },
    { type: 'image', src: 'assets/hero/tile-2.png', r: '90px 90px 90px 90px' },
    { type: 'video', src: 'assets/hero/tile-3.mp4', r: '90px 90px 90px 90px' },
    { type: 'image', src: 'assets/hero/tile-4.png', r: '90px 90px 90px 90px' },
    { type: 'image', src: 'assets/hero/tile-5.png', r: '90px 20px 90px 20px' },
    { type: 'image', src: 'assets/hero/tile-6.png', r: '20px 90px 20px 90px' },
    { type: 'image', src: 'assets/hero/tile-7.png', r: '90px 90px 90px 90px' },
    { type: 'image', src: 'assets/hero/tile-8.png', r: '90px 90px 90px 90px' },
    { type: 'video', src: 'assets/hero/tile-1.mp4', r: '90px 90px 90px 90px' },
    { type: 'image', src: 'assets/hero/tile-2.png', r: '90px 90px 90px 90px' }
  ];

  const renderTile = t => t.type === 'video'
    ? `<div class="pill" style="border-radius:${t.r}"><video src="${t.src}" autoplay loop muted playsinline></video></div>`
    : `<div class="pill" style="border-radius:${t.r}"><img src="${t.src}" alt=""></div>`;

  const track = $('#marquee-track');
  const tilesHtml = heroTiles.map(renderTile).join('');
  track.innerHTML = tilesHtml + tilesHtml;

  // services
  const icons = {
    a: [0,1,0,1,1, 1,0,1,1,0, 0,1,1,0,1, 1,1,0,1,0, 1,0,1,0,0],
    b: [0,0,1,0,0, 0,1,0,1,0, 1,0,1,0,1, 0,1,0,1,0, 0,0,1,0,0],
    c: [1,0,1,0,1, 0,1,0,1,0, 1,0,1,0,1, 0,1,0,1,0, 1,0,1,0,1]
  };
  $('#cards').innerHTML = D.services.map(s => `
    <article class="svc" style="--c:${s.color}">
      <span class="svc__n">( ${s.n} )</span>
      <div class="svc__icon">${icons[s.icon].map(v => `<b class="${v ? 'on' : ''}"></b>`).join('')}</div>
      <div><h3>${s.title}</h3><p>${s.text}</p></div>
    </article>`).join('');

  // google reviews
  const revCfg = D.googleReviews || {};
  const revTrack = $('#reviews-track');
  const revAvg = $('#reviews-avg');
  const revTotal = $('#reviews-total');
  const revWrite = $('#reviews-write-link');

  const gIcon = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`;

  const getInitials = (str = '') => str.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'CR';

  const revSlider = $('.reviews__slider');
  let autoTimer = null;
  const AUTO_INTERVAL = 3800;

  const getStep = () => {
    const card = revTrack?.querySelector('.rev-card');
    const gap = revTrack ? parseFloat(getComputedStyle(revTrack).columnGap) || 0 : 0;
    return card ? card.offsetWidth + gap : 384;
  };

  const stepNext = () => {
    if (!revTrack) return;
    const half = revTrack.scrollWidth / 2;
    if (half > 0 && revTrack.scrollLeft >= half - 16) {
      revTrack.scrollLeft -= half;
    }
    revTrack.scrollBy({ left: getStep(), behavior: 'smooth' });
  };

  const stepPrev = () => {
    if (!revTrack) return;
    const half = revTrack.scrollWidth / 2;
    if (half > 0 && revTrack.scrollLeft <= 16) {
      revTrack.scrollLeft += half;
    }
    revTrack.scrollBy({ left: -getStep(), behavior: 'smooth' });
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    autoTimer = setInterval(stepNext, AUTO_INTERVAL);
  };

  const stopAutoSlide = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const renderReviewCards = (items = [], avg = '5.0', total = items.length, writeUrl = '') => {
    if (revAvg) revAvg.textContent = Number(avg).toFixed(1);
    if (revTotal) revTotal.textContent = `( ${total} Google Reviews )`;
    if (revWrite && writeUrl) revWrite.href = writeUrl;
    if (!revTrack) return;

    // Duplicate list for infinite smooth wrap
    const displayList = items.length > 2 ? [...items, ...items] : items;

    revTrack.innerHTML = displayList.map(r => {
      const rating = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      const stars = '★'.repeat(rating);
      const avatarHtml = r.avatar
        ? `<img class="rev-card__avatar" src="${escapeHTML(r.avatar)}" alt="${escapeHTML(r.author)}" loading="lazy">`
        : `<div class="rev-card__avatar">${escapeHTML(getInitials(r.author))}</div>`;

      return `
        <article class="rev-card">
          <div>
            <div class="rev-card__top">
              <div class="rev-card__author">
                ${avatarHtml}
                <div>
                  <h3 class="rev-card__name">${escapeHTML(r.author || 'Google User')}</h3>
                  <p class="rev-card__sub mono">${escapeHTML(r.role || 'Verified Client')}</p>
                </div>
              </div>
              <div class="rev-card__gmark">${gIcon}</div>
            </div>
            <div class="rev-card__stars" aria-label="${rating} out of 5 stars">${stars}</div>
            <p class="rev-card__text">“${escapeHTML(r.text || '')}”</p>
          </div>
          <div class="rev-card__bottom mono">
            <span class="rev-card__verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Google Verified
            </span>
            <span class="rev-card__time">${escapeHTML(r.time || 'Recent')}</span>
          </div>
        </article>
      `;
    }).join('');
  };

  const initialWriteUrl = revCfg.writeReviewUrl || 'https://maps.google.com';

  renderReviewCards(revCfg.items, revCfg.rating, revCfg.totalReviews, initialWriteUrl);

  // Prev / Next arrow buttons & drag-scroll & edge-fade listener
  if (revTrack) {
    const prevBtn = $('#rev-prev'), nextBtn = $('#rev-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { stepPrev(); startAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stepNext(); startAutoSlide(); });

    let rdown = false, rsx = 0, rsl = 0;
    revTrack.addEventListener('pointerdown', e => {
      stopAutoSlide();
      rdown = true;
      rsx = e.clientX;
      rsl = revTrack.scrollLeft;
      revTrack.classList.add('dragging');
    });
    addEventListener('pointerup', () => {
      if (rdown) {
        rdown = false;
        revTrack.classList.remove('dragging');
        startAutoSlide();
      }
    });
    revTrack.addEventListener('pointermove', e => {
      if (rdown) revTrack.scrollLeft = rsl - (e.clientX - rsx);
    });

    // Dynamic edge fade out & infinite seamless wrap
    revTrack.addEventListener('scroll', () => {
      const half = revTrack.scrollWidth / 2;
      if (half > 0 && revTrack.scrollLeft >= half * 1.5) {
        revTrack.scrollLeft -= half;
      }
      if (revSlider) {
        revSlider.classList.toggle('has-left-fade', revTrack.scrollLeft > 14);
      }
    }, { passive: true });

    // Pause auto slide on hover, resume on mouse leave
    if (revSlider) {
      revSlider.addEventListener('mouseenter', stopAutoSlide);
      revSlider.addEventListener('mouseleave', startAutoSlide);
    }

    // Auto slide only when visible in viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAutoSlide();
          } else {
            stopAutoSlide();
          }
        });
      }, { threshold: 0.1 });
      const revSec = $('#reviews');
      if (revSec) observer.observe(revSec);
    } else {
      startAutoSlide();
    }
  }

  // faq
  $('#faq-list').innerHTML = D.faq.map(f => `
    <div class="faq__item">
      <button class="faq__q">${f.q}<i>+</i></button>
      <div class="faq__a"><p>${f.a}</p></div>
    </div>`).join('');
  document.querySelectorAll('.faq__item').forEach(it => {
    const a = $('.faq__a', it);
    $('.faq__q', it).addEventListener('click', () => {
      const open = it.classList.toggle('open');
      gsap.to(a, { height: open ? 'auto' : 0, duration: .7, ease: 'expo.out' });
    });
  });

  /* ---------- Clock ---------- */
  const tick = () => {
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: D.studio.timezone }).format(new Date());
    $('#clock').textContent = `( ${t} ${D.studio.cityCode} )`;
  };
  tick(); setInterval(tick, 20000);

  /* ---------- Menu ---------- */
  const btn = $('#menu-btn'), ov = $('#overlay');
  const setMenu = o => { ov.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
  btn.addEventListener('click', () => setMenu(!ov.classList.contains('open')));
  document.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Smooth scroll + motion blur ---------- */
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) { e.preventDefault(); lenis.scrollTo(0); return; }
    const el = $(id); if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -20 }); }
  }));

  if (reduce) return;

  // velocity based blur on project media + service cards + review cards
  const blurTargets = gsap.utils.toArray('.card__media, .svc, .rev-card');
  const setB = gsap.quickSetter;
  let cur = 0;
  gsap.ticker.add(() => {
    const target = Math.min(Math.abs(lenis.velocity) * .35, 6);
    cur += (target - cur) * .15;
    const f = cur < .08 ? 'none' : `blur(${cur.toFixed(2)}px)`;
    blurTargets.forEach(el => el.style.filter = f);
  });

  /* ---------- Intro load animation ---------- */
  const split = (el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(line => {
      const temp = document.createElement('div');
      temp.innerHTML = line;
      const words = temp.textContent.trim().split(/\s+/).filter(Boolean);
      return words.map(w => `<span class="ln"><span>${w}&nbsp;</span></span>`).join('');
    }).join('<br>');
    return el.querySelectorAll('.ln>span');
  };
  const heroLetters = $('#hero-title span');
  heroLetters.innerHTML = heroLetters.textContent.split('').map(c => `<span style="display:inline-block">${c}</span>`).join('');
  const chars = heroLetters.querySelectorAll('span');

  gsap.set(chars, { yPercent: 60, opacity: 0, filter: 'blur(24px)' });
  gsap.set('.hero__title sup,.hero__sub,.hero__clock,.hero__social,.nav', { opacity: 0 });
  gsap.set('.pill', { yPercent: 40, opacity: 0, filter: 'blur(14px)' });

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .to(chars, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.6, stagger: .06 })
    .to('.hero__title sup,.hero__sub,.hero__clock,.hero__social,.nav', { opacity: 1, duration: 1 }, '-=1.1')
    .to('.pill', { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: .05 }, '-=1.3');

  /* ---------- Marquee (scroll-velocity boosted) ---------- */
  const total = () => track.scrollWidth / 2;
  let x = 0, boost = 0;
  gsap.ticker.add(() => {
    boost += (Math.abs(lenis.velocity) * .6 - boost) * .1;
    x -= .6 + boost;
    if (-x >= total()) x += total();
    track.style.transform = `translate3d(${x}px,0,0)`;
    track.style.filter = boost > .4 ? `blur(${Math.min(boost * .6, 4).toFixed(2)}px)` : 'none';
  });

  // Fade out hero bottom blur when scrolling down to reveal bottom of tiles
  const heroFade = $('#hero-fade');
  if (heroFade) {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: '35% top',
      scrub: true,
      onUpdate: self => {
        heroFade.style.opacity = Math.max(0, 1 - self.progress * 1.6);
      }
    });
  }

  /* ---------- Scroll reveals ---------- */
  gsap.utils.toArray('.reveal').forEach(el => {
    const spans = split(el);
    gsap.fromTo(spans, { yPercent: 110, filter: 'blur(10px)' }, {
      yPercent: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: .035,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  gsap.utils.toArray('.card').forEach((c, i) => {
    gsap.from(c.querySelector('.card__media'), { clipPath: 'inset(12% 8% 12% 8% round 28px)', scale: .94, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } });
    gsap.from(c.querySelector('.card__meta'), { opacity: 0, y: 12, duration: .8, scrollTrigger: { trigger: c, start: 'top 85%' } });
  });
  gsap.from('.svc', { x: 80, opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'expo.out', stagger: .08, clearProps: 'transform,opacity,filter', scrollTrigger: { trigger: '#cards', start: 'top 90%', once: true } });
  gsap.from('#reviews-track .rev-card:nth-child(-n+6)', { x: 80, opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'expo.out', stagger: .08, clearProps: 'transform,opacity,filter', scrollTrigger: { trigger: '#reviews-track', start: 'top 90%', once: true } });
  gsap.from('.faq__item', { opacity: 0, y: 30, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#faq-list', start: 'top 88%' } });

  // parallax for project images
  gsap.utils.toArray('.card__media img,.card__media .ph').forEach(img => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } });
  });

  // drag-scroll for services
  const cards = $('#cards'); let down = false, sx = 0, sl = 0;
  cards.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sl = cards.scrollLeft; cards.style.cursor = 'grabbing'; });
  addEventListener('pointerup', () => { down = false; cards.style.cursor = 'grab'; });
  cards.addEventListener('pointermove', e => { if (down) cards.scrollLeft = sl - (e.clientX - sx); });

  // nav hide on scroll down, show on up
  let last = 0;
  lenis.on('scroll', ({ scroll }) => {
    gsap.to('#nav', { yPercent: scroll > last && scroll > 200 ? -120 : 0, duration: .5, ease: 'power3.out', overwrite: true });
    last = scroll;
  });
  };

  (window.CREOTOPI_READY || Promise.resolve()).then(init);
})();
