/**
 * Preview de enlaces en la barra derecha (TOC).
 * Panel fijo en la parte inferior con marco notorio.
 * Estados: idle, cargando, metadatos, sin metadatos.
 */
(function () {
  const CACHE = new Map();
  const HOVER_DELAY = 400;
  let hoverTimer = null;
  let currentLink = null;
  let isLoading = false;

  function getPreviewUrl(url) {
    try {
      return 'https://api.microlink.io/?url=' + encodeURIComponent(url) + '&screenshot=false';
    } catch {
      return null;
    }
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function truncate(s, len) {
    if (!s || s.length <= len) return s || '';
    return s.slice(0, len).trim() + '\u2026';
  }

  function createPanel() {
    const sidebar = document.querySelector('.right-sidebar') ||
      document.querySelector('.right-sidebar-container');
    const container = sidebar || document.body;
    const panel = document.createElement('div');
    panel.id = 'link-preview-panel';
    panel.className = 'link-preview-panel';
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<div class="link-preview-panel-inner">' +
      '<div class="link-preview-panel-header">Vista previa</div>' +
      '<div class="link-preview-panel-body link-preview-idle">' +
      '<span class="link-preview-placeholder">Pasa el mouse sobre un enlace</span>' +
      '</div></div>';
    if (sidebar) {
      sidebar.appendChild(panel);
    } else {
      panel.style.position = 'fixed';
      panel.style.bottom = '1rem';
      panel.style.right = '1rem';
      panel.style.maxWidth = '320px';
      document.body.appendChild(panel);
    }
    return panel;
  }

  function getPanel() {
    return document.getElementById('link-preview-panel') || createPanel();
  }

  function setState(state, content) {
    const panel = getPanel();
    const body = panel.querySelector('.link-preview-panel-body');
    if (!body) return;
    body.className = 'link-preview-panel-body link-preview-' + state;
    body.innerHTML = content || '';
  }

  function showIdle() {
    setState('idle', '<span class="link-preview-placeholder">Pasa el mouse sobre un enlace</span>');
  }

  function showLoading(url) {
    isLoading = true;
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    setState('loading', '<span class="link-preview-loading">Cargando metadatos\u2026</span>' +
      '<span class="link-preview-url-hint">' + escapeHtml(domain) + '</span>');
  }

  function showNoMetadata(url) {
    isLoading = false;
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    setState('no-metadata', '<span class="link-preview-no-meta">Sin metadatos disponibles</span>' +
      '<span class="link-preview-url-hint">' + escapeHtml(domain) + '</span>');
  }

  function showPreview(url, data) {
    isLoading = false;
    const img = data?.image?.url;
    const title = data?.title || data?.url || url;
    const desc = data?.description || '';
    const hasMeta = !!(img || title || desc);

    if (!hasMeta) {
      showNoMetadata(url);
      return;
    }

    let html = '<div class="link-preview-card">';
    if (img) html += '<img src="' + img + '" alt="" class="link-preview-img" loading="lazy" />';
    html += '<div class="link-preview-content">' +
      '<div class="link-preview-title">' + escapeHtml(title) + '</div>' +
      (desc ? '<div class="link-preview-desc">' + escapeHtml(truncate(desc, 100)) + '</div>' : '') +
      '</div></div>';
    setState('has-metadata', html);
  }

  function highlightLink(link, on) {
    if (!link) return;
    link.classList.toggle('link-preview-hover-active', on);
  }

  function fetchPreview(url) {
    if (CACHE.has(url)) {
      const cached = CACHE.get(url);
      if (cached) {
        showPreview(url, cached);
      } else {
        showNoMetadata(url);
      }
      return;
    }
    const apiUrl = getPreviewUrl(url);
    if (!apiUrl) {
      showNoMetadata(url);
      return;
    }

    showLoading(url);
    fetch(apiUrl)
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.status === 'success' && res.data) {
          CACHE.set(url, res.data);
          if (currentLink && currentLink.href === url) {
            showPreview(url, res.data);
          }
        } else {
          CACHE.set(url, null);
          if (currentLink && currentLink.href === url) {
            showNoMetadata(url);
          }
        }
      })
      .catch(function () {
        CACHE.set(url, null);
        if (currentLink && currentLink.href === url) {
          showNoMetadata(url);
        }
      });
  }

  function handleMouseEnter(e) {
    const link = e.target.closest('a[href^="http"]');
    if (!link || link.href.startsWith(window.location.origin)) return;
    if (!link.closest('main')) return;

    currentLink = link;
    highlightLink(link, true);
    hoverTimer = setTimeout(function () {
      fetchPreview(link.href);
    }, HOVER_DELAY);
  }

  function handleMouseLeave(e) {
    const link = e.target.closest('a[href^="http"]');
    if (link) {
      currentLink = null;
      highlightLink(link, false);
      clearTimeout(hoverTimer);
      hoverTimer = null;
      showIdle();
    }
  }

  function init() {
    document.body.addEventListener('mouseover', handleMouseEnter);
    document.body.addEventListener('mouseout', handleMouseLeave);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
