(() => {
  const D = window.CREOTOPI;
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    ? `<img src="${p.cover}" alt="${p.title}" loading="lazy">`
    : `<div class="ph">${p.title.toUpperCase()}</div>`;

  $('#grid').innerHTML = D.projects.map(p => `
    <a class="card" href="${p.url}" target="_blank" rel="noopener" data-card>
      <div class="card__media" style="--g1:${p.g?.[0] || '#ccc'};--g2:${p.g?.[1] || '#999'}">${media(p)}</div>
      <div class="card__meta"><span>${p.title}</span><span>_${p.date}</span></div>
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

  // velocity based blur on project media + service cards
  const blurTargets = gsap.utils.toArray('.card__media, .svc');
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
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="ln"><span>${w}&nbsp;</span></span>`).join('');
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
  gsap.from('.svc', { x: 120, opacity: 0, filter: 'blur(14px)', duration: 1.3, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '#cards', start: 'top 85%' } });
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
})();
