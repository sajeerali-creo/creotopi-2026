window.CREOTOPI_READY = fetch('api/content.php', { credentials: 'same-origin' })
  .then(response => response.ok ? response.json() : null)
  .then(content => {
    if (!content || !window.CREOTOPI) return;
    if (Array.isArray(content.projects)) window.CREOTOPI.projects = content.projects;
    if (content.googleReviews && Array.isArray(content.googleReviews.items)) {
      window.CREOTOPI.googleReviews = content.googleReviews;
    }
  })
  .catch(() => null);
