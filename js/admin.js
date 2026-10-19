(() => {
  const $ = selector => document.querySelector(selector);
  const authPanel = $('#auth-panel');
  const workspace = $('#workspace');
  const authForm = $('#auth-form');
  const authMessage = $('#auth-message');
  const status = $('#admin-status');
  const saveButton = $('#save-button');
  let csrfToken = '';
  let content = null;
  let activeTab = 'works';

  const setMessage = (element, message) => { element.textContent = message || ''; };
  const showAuth = (setupRequired, message = '', setupConfigured = true) => {
    workspace.hidden = true;
    authPanel.hidden = false;
    $('#auth-title').textContent = setupRequired ? 'Set your password.' : 'Welcome back.';
    $('#auth-copy').textContent = setupRequired
      ? setupConfigured
        ? 'Enter your private setup key, then create an admin password with at least 12 characters.'
        : 'Add your private setup key to api/config.php in Hostinger File Manager, then reload this page.'
      : 'Sign in to manage your projects and Google reviews.';
    $('#setup-key-field').hidden = !setupRequired;
    $('#setup-key').required = setupRequired;
    $('#setup-key').disabled = setupRequired && !setupConfigured;
    $('#confirm-field').hidden = !setupRequired;
    $('#password-label').textContent = setupRequired ? 'New password' : 'Password';
    $('#admin-password').autocomplete = setupRequired ? 'new-password' : 'current-password';
    $('#auth-submit').textContent = setupRequired ? 'Create admin password' : 'Sign in';
    $('#auth-submit').disabled = setupRequired && !setupConfigured;
    setMessage(authMessage, message);
  };

  const request = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    const result = await response.json().catch(() => null);
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('The admin API is not returning JSON. Upload the site to Hostinger with PHP enabled.');
    }
    if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
    return result;
  };

  const adminRequest = (url, options = {}) => request(url, {
    ...options,
    headers: { ...(options.headers || {}), 'X-CSRF-Token': csrfToken },
  });

  const updateCounters = () => {
    $('#project-total').textContent = content.projects.length;
    $('#review-total').textContent = content.googleReviews.items.length;
  };

  const renderProjectList = () => {
    const table = $('#project-list');
    table.replaceChildren();
    if (!content.projects.length) {
      const row = table.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 6;
      cell.className = 'table-empty';
      cell.textContent = 'No projects yet. Add your first project.';
      return;
    }

    content.projects.forEach((project, index) => {
      const row = table.insertRow();
      const orderCell = row.insertCell();
      const order = document.createElement('div');
      order.className = 'order-controls';
      const number = document.createElement('span');
      number.className = 'table-order';
      number.textContent = String(index + 1).padStart(2, '0');
      const moveUp = document.createElement('button');
      moveUp.type = 'button';
      moveUp.className = 'order-button';
      moveUp.textContent = '↑';
      moveUp.setAttribute('aria-label', `Move ${project.title} up`);
      moveUp.title = 'Move up';
      moveUp.disabled = index === 0;
      moveUp.addEventListener('click', () => moveProject(index, -1));
      const moveDown = document.createElement('button');
      moveDown.type = 'button';
      moveDown.className = 'order-button';
      moveDown.textContent = '↓';
      moveDown.setAttribute('aria-label', `Move ${project.title} down`);
      moveDown.title = 'Move down';
      moveDown.disabled = index === content.projects.length - 1;
      moveDown.addEventListener('click', () => moveProject(index, 1));
      order.append(number, moveUp, moveDown);
      orderCell.append(order);

      const imageCell = row.insertCell();
      if (project.cover) {
        const image = document.createElement('img');
        image.className = 'table-thumb';
        image.src = project.cover;
        image.alt = '';
        image.loading = 'lazy';
        imageCell.append(image);
      } else {
        imageCell.append(Object.assign(document.createElement('span'), { className: 'table-thumb table-thumb--empty' }));
      }

      const titleCell = row.insertCell();
      const title = document.createElement('strong');
      title.className = 'table-title';
      title.textContent = project.title;
      const date = document.createElement('span');
      date.className = 'table-subtext';
      date.textContent = project.date || 'No date';
      titleCell.append(title, date);
      row.insertCell().textContent = project.tag;

      const linkCell = row.insertCell();
      const link = document.createElement('a');
      link.className = 'table-link';
      link.href = project.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Open ↗';
      linkCell.append(link);

      const actionCell = row.insertCell();
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'table-action';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => editProject(index));
      actionCell.append(edit);
    });
  };

  function moveProject(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.projects.length) return;
    [content.projects[index], content.projects[nextIndex]] = [content.projects[nextIndex], content.projects[index]];
    $('#project-form').hidden = true;
    $('#project-index').value = '-1';
    renderProjectList();
    setMessage($('#workspace-message'), 'Project order changed. Select Save changes to publish it.');
  }

  const updateImagePreview = source => {
    const preview = $('#image-preview');
    if (!source) {
      preview.hidden = true;
      $('#preview-image').removeAttribute('src');
      return;
    }
    $('#preview-image').src = source;
    preview.hidden = false;
  };

  const newProject = () => {
    $('#project-form').reset();
    $('#project-form').hidden = false;
    $('#project-index').value = '-1';
    $('#project-title').value = '';
    $('#project-category').value = 'Branding';
    $('#project-cover').value = '';
    $('#project-date').value = '';
    $('#project-url').value = '';
    $('#project-image').value = '';
    $('#project-form-title').textContent = 'New project';
    $('#delete-project-button').hidden = true;
    setMessage($('#project-message'), '');
    updateImagePreview('');
    renderProjectList();
    $('#project-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function editProject(index) {
    const project = content.projects[index];
    if (!project) return;
    $('#project-form').hidden = false;
    $('#project-index').value = index;
    $('#project-title').value = project.title || '';
    $('#project-category').value = project.tag || 'Branding';
    $('#project-date').value = project.date || '';
    $('#project-url').value = project.url || '';
    $('#project-cover').value = project.cover || '';
    $('#project-image').value = '';
    $('#project-form-title').textContent = 'Edit project';
    $('#delete-project-button').hidden = false;
    setMessage($('#project-message'), '');
    updateImagePreview(project.cover || '');
    renderProjectList();
    $('#project-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const renderReviewList = () => {
    const table = $('#review-list');
    table.replaceChildren();
    if (!content.googleReviews.items.length) {
      const row = table.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      cell.className = 'table-empty';
      cell.textContent = 'No review entries yet. Add one to display it on the site.';
      return;
    }

    content.googleReviews.items.forEach((review, index) => {
      const row = table.insertRow();
      const authorCell = row.insertCell();
      const author = document.createElement('div');
      author.className = 'reviewer-cell';
      if (review.avatar) {
        const avatar = document.createElement('img');
        avatar.className = 'review-avatar';
        avatar.src = review.avatar;
        avatar.alt = '';
        avatar.loading = 'lazy';
        author.append(avatar);
      } else {
        const initials = document.createElement('span');
        initials.className = 'review-avatar review-avatar--initials';
        initials.textContent = review.author.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
        author.append(initials);
      }
      const nameGroup = document.createElement('span');
      const name = document.createElement('strong');
      name.className = 'table-title';
      name.textContent = review.author;
      const role = document.createElement('span');
      role.className = 'table-subtext';
      role.textContent = review.role || 'Client';
      nameGroup.append(name, role);
      author.append(nameGroup);
      authorCell.append(author);

      const rating = row.insertCell();
      rating.className = 'table-rating';
      rating.textContent = `${review.rating} ★`;
      const excerpt = row.insertCell();
      excerpt.className = 'review-excerpt';
      excerpt.textContent = review.text;
      const actionCell = row.insertCell();
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'table-action';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => editReview(index));
      actionCell.append(edit);
    });
  };

  const newReview = () => {
    $('#review-form').reset();
    $('#review-form').hidden = false;
    $('#review-index').value = '-1';
    $('#review-author').value = '';
    $('#review-role').value = '';
    $('#review-item-rating').value = '5';
    $('#review-time').value = '';
    $('#review-avatar').value = '';
    $('#review-text').value = '';
    $('#review-form-title').textContent = 'New review';
    $('#delete-review-button').hidden = true;
    setMessage($('#review-message'), '');
    renderReviewList();
    $('#review-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function editReview(index) {
    const review = content.googleReviews.items[index];
    if (!review) return;
    $('#review-form').hidden = false;
    $('#review-index').value = index;
    $('#review-author').value = review.author || '';
    $('#review-role').value = review.role || '';
    $('#review-item-rating').value = String(review.rating || 5);
    $('#review-time').value = review.time || '';
    $('#review-avatar').value = review.avatar || '';
    $('#review-text').value = review.text || '';
    $('#review-form-title').textContent = 'Edit review';
    $('#delete-review-button').hidden = false;
    setMessage($('#review-message'), '');
    renderReviewList();
    $('#review-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const initializeWorkspace = async () => {
    const response = await request('api/auth.php');
    csrfToken = response.csrfToken || '';
    if (!response.authenticated) {
      showAuth(response.setupRequired, '', response.setupConfigured);
      return;
    }

    const savedContent = await request('api/content.php');
    content = {
      projects: savedContent.projects,
      googleReviews: savedContent.googleReviews,
    };
    $('#review-rating').value = content.googleReviews.rating;
    $('#review-count').value = content.googleReviews.totalReviews;
    $('#review-place-id').value = content.googleReviews.placeId || '';
    $('#review-write-url').value = content.googleReviews.writeReviewUrl || '';
    $('#review-api-url').value = content.googleReviews.apiEndpoint || '';
    authPanel.hidden = true;
    workspace.hidden = false;
    $('#logout-button').hidden = false;
    status.textContent = 'Connected';
    updateCounters();
    $('#project-form').hidden = true;
    $('#review-form').hidden = true;
    renderProjectList();
    renderReviewList();
  };

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    const password = $('#admin-password').value;
    const setupRequired = !$('#confirm-field').hidden;
    if (setupRequired && password !== $('#confirm-password').value) {
      setMessage(authMessage, 'Those passwords do not match.');
      return;
    }
    setMessage(authMessage, '');
    $('#auth-submit').disabled = true;
    try {
      const result = await request('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: setupRequired ? 'setup' : 'login', password, setupKey: $('#setup-key').value }),
      });
      csrfToken = result.csrfToken;
      await initializeWorkspace();
    } catch (error) {
      setMessage(authMessage, error.message);
    } finally {
      $('#auth-submit').disabled = false;
    }
  });

  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(button => {
        const isActive = button === tab;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });
      $('#works-section').hidden = activeTab !== 'works';
      $('#reviews-section').hidden = activeTab !== 'reviews';
    });
  });

  $('#new-project-button').addEventListener('click', newProject);
  $('#new-review-button').addEventListener('click', newReview);
  $('#cancel-project-button').addEventListener('click', () => {
    $('#project-form').hidden = true;
    $('#project-index').value = '-1';
    renderProjectList();
  });
  $('#cancel-review-button').addEventListener('click', () => {
    $('#review-form').hidden = true;
    $('#review-index').value = '-1';
    renderReviewList();
  });

  $('#project-form').addEventListener('submit', async event => {
    event.preventDefault();
    const saveProject = {
      title: $('#project-title').value.trim(),
      tag: $('#project-category').value,
      date: $('#project-date').value.trim(),
      cover: $('#project-cover').value.trim(),
      url: $('#project-url').value.trim(),
    };
    const image = $('#project-image').files[0];

    try {
      if (image) {
        const upload = new FormData();
        upload.append('image', image);
        const result = await adminRequest('api/upload.php', { method: 'POST', body: upload });
        saveProject.cover = result.url;
      }
      if (!saveProject.cover) throw new Error('Add an image URL or upload an image.');

      const index = Number($('#project-index').value);
      if (index >= 0) content.projects.splice(index, 1);
      content.projects.unshift(saveProject);
      updateCounters();
      renderProjectList();
      editProject(0);
      setMessage($('#project-message'), 'Project applied. Select Save changes to publish it.');
    } catch (error) {
      setMessage($('#project-message'), error.message);
    }
  });

  $('#delete-project-button').addEventListener('click', () => {
    const index = Number($('#project-index').value);
    if (index < 0 || !window.confirm('Delete this project? Save changes to publish the deletion.')) return;
    content.projects.splice(index, 1);
    updateCounters();
    $('#project-form').hidden = true;
    $('#project-index').value = '-1';
    renderProjectList();
    setMessage($('#workspace-message'), 'Project removed. Select Save changes to publish it.');
  });

  $('#review-form').addEventListener('submit', event => {
    event.preventDefault();
    const review = {
      author: $('#review-author').value.trim(),
      role: $('#review-role').value.trim(),
      avatar: $('#review-avatar').value.trim(),
      rating: Number($('#review-item-rating').value),
      time: $('#review-time').value.trim(),
      text: $('#review-text').value.trim(),
    };
    const index = Number($('#review-index').value);
    if (index < 0) content.googleReviews.items.push(review);
    else content.googleReviews.items[index] = review;
    updateCounters();
    renderReviewList();
    editReview(index < 0 ? content.googleReviews.items.length - 1 : index);
    setMessage($('#review-message'), 'Review applied. Select Save changes to publish it.');
  });

  $('#delete-review-button').addEventListener('click', () => {
    const index = Number($('#review-index').value);
    if (index < 0 || !window.confirm('Delete this review? Save changes to publish the deletion.')) return;
    content.googleReviews.items.splice(index, 1);
    updateCounters();
    $('#review-form').hidden = true;
    $('#review-index').value = '-1';
    renderReviewList();
    setMessage($('#workspace-message'), 'Review removed. Select Save changes to publish it.');
  });

  saveButton.addEventListener('click', async () => {
    content.googleReviews.rating = Number($('#review-rating').value);
    content.googleReviews.totalReviews = Number($('#review-count').value);
    content.googleReviews.placeId = $('#review-place-id').value.trim();
    content.googleReviews.writeReviewUrl = $('#review-write-url').value.trim();
    content.googleReviews.apiEndpoint = $('#review-api-url').value.trim();
    saveButton.disabled = true;
    status.textContent = 'Saving…';
    try {
      await adminRequest('api/content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      status.textContent = 'All changes saved';
      setMessage($('#workspace-message'), 'Your changes are live on the website.');
    } catch (error) {
      status.textContent = 'Not saved';
      setMessage($('#workspace-message'), error.message);
    } finally {
      saveButton.disabled = false;
    }
  });

  $('#logout-button').addEventListener('click', async () => {
    try {
      await adminRequest('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      window.location.reload();
    } catch (error) {
      status.textContent = error.message;
    }
  });

  $('#project-image').addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) updateImagePreview(URL.createObjectURL(file));
  });
  $('#project-cover').addEventListener('input', event => updateImagePreview(event.target.value.trim()));

  request('api/auth.php')
    .then(response => {
      csrfToken = response.csrfToken || '';
      if (response.authenticated) return initializeWorkspace();
      showAuth(response.setupRequired, '', response.setupConfigured);
      status.textContent = response.setupRequired ? 'First-time setup' : 'Sign in required';
    })
    .catch(() => {
      showAuth(false, 'The admin needs the PHP API. Open this page through your HTTPS Hostinger domain; a local file preview cannot sign in.');
      status.textContent = 'API unavailable';
    });
})();
