(() => {
  const init = () => {
  const data = window.CREOTOPI;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const filterList = document.querySelector('#works-filters');
  const grid = document.querySelector('#works-grid');
  const count = document.querySelector('#works-count');
  const mail = document.querySelector('#mail-btn');
  const form = document.querySelector('#contact-form');
  const formMessage = document.querySelector('#form-msg');

  mail.href = `mailto:${data.studio.email}`;
  mail.textContent = data.studio.email;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.namedItem('name').value.trim();
    const email = form.elements.namedItem('email').value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      formMessage.textContent = 'Please enter your name and a valid email.';
      return;
    }
    formMessage.textContent = 'Opening your email app…';
    location.href = `mailto:${data.studio.email}?subject=${encodeURIComponent(`Project enquiry from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n`)}`;
  });

  const filters = [
    { n: 'ALL', title: 'ALL PROJECTS', tag: 'all', color: '#e4e5ea' },
    ...data.services.map(service => ({ ...service, tag: service.tag }))
  ];

  filterList.innerHTML = filters.map(filter => `
    <button class="work-filter" type="button" data-filter="${filter.tag}" style="--c:${filter.color}" aria-pressed="${filter.tag === 'all'}">
      <span class="work-filter__n">( ${filter.n} )</span>
      <span class="work-filter__name">${filter.title}</span>
    </button>`).join('');

  const projectMedia = project => project.cover
    ? `<img src="${escapeHTML(project.cover)}" alt="${escapeHTML(project.title)}" loading="lazy">`
    : `<div class="ph">${escapeHTML(project.title).toUpperCase()}</div>`;

  const renderProjects = activeTag => {
    const projects = activeTag === 'all'
      ? data.projects
      : data.projects.filter(project => project.tag === activeTag);

    grid.innerHTML = projects.map(project => `
      <a class="card" href="${escapeHTML(project.url)}" target="_blank" rel="noopener" data-card>
        <div class="card__media" style="--g1:${escapeHTML(project.g?.[0] || '#ccc')};--g2:${escapeHTML(project.g?.[1] || '#999')}">${projectMedia(project)}</div>
        <div class="card__meta"><span>${escapeHTML(project.title)}</span><span>_${escapeHTML(project.date)}</span></div>
      </a>`).join('');
    count.textContent = `( ${String(projects.length).padStart(2, '0')} / ${String(data.projects.length).padStart(2, '0')} )`;
  };

  filterList.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;

    filterList.querySelectorAll('[data-filter]').forEach(filter => {
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    renderProjects(button.dataset.filter);
  });

  const menuButton = document.querySelector('#menu-btn');
  const overlay = document.querySelector('#overlay');
  const setMenu = open => {
    overlay.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  };

  menuButton.addEventListener('click', () => setMenu(!overlay.classList.contains('open')));
  overlay.querySelectorAll('[data-close]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
  });

  renderProjects('all');
  };

  (window.CREOTOPI_READY || Promise.resolve()).then(init);
})();