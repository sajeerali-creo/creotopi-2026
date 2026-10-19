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
    const list = $('#project-list');
    list.replaceChildren();
    if (!content.projects.length) {
      list.innerHTML = '<p class="empty-state">No projects yet. Add your first project.</p>';
      return;
    }

    content.projects.forEach((project, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `item-row${Number($('#project-index').value) === index ? ' is-active' : ''}`;
      button.innerHTML = '<span class="item-row__title"></span><span class="item-row__meta"></span>';
      button.querySelector('.item-row__title').textContent = project.title;
      button.querySelector('.item-row__meta').textContent = project.tag;
      button.addEventListener('click', () => editProject(index));
      list.append(button);
    });
  };

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
  };

  function editProject(index) {
    const project = content.projects[index];
    if (!project) return;
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
  }

  const renderReviewList = () => {
    const list = $('#review-list');
    list.replaceChildren();
    if (!content.googleReviews.items.length) {
      list.innerHTML = '<p class="empty-state">No review entries yet. Add one to display it on the site.</p>';
      return;
    }

    content.googleReviews.items.forEach((review, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `item-row${Number($('#review-index').value) === index ? ' is-active' : ''}`;
      button.innerHTML = '<span class="item-row__title"></span><span class="item-row__meta"></span>';
      button.querySelector('.item-row__title').textContent = review.author;
      button.querySelector('.item-row__meta').textContent = `${review.rating} ★`;
      button.addEventListener('click', () => editReview(index));
      list.append(button);
    });
  };

  const newReview = () => {
    $('#review-form').reset();
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
  };

  function editReview(index) {
    const review = content.googleReviews.items[index];
    if (!review) return;
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
    newProject();
    newReview();
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
      if (index < 0) content.projects.push(saveProject);
      else content.projects[index] = saveProject;
      updateCounters();
      renderProjectList();
      editProject(index < 0 ? content.projects.length - 1 : index);
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
    newProject();
    setMessage($('#project-message'), 'Project removed. Select Save changes to publish it.');
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
    newReview();
    setMessage($('#review-message'), 'Review removed. Select Save changes to publish it.');
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
