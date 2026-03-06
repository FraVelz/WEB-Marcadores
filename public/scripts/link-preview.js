/**
 * Preview de enlaces usando Microlink API (og:image, title, description).
 * Se activa al pasar el ratón sobre enlaces externos en el área de contenido.
 */
(function () {
  const CACHE = new Map();
  const HOVER_DELAY = 400;
  let hoverTimer = null;
  let currentLink = null;

  function getPreviewUrl(url) {
    try {
      return 'https://api.microlink.io/?url=' + encodeURIComponent(url) + '&screenshot=false';
    } catch {
      return null;
    }
  }

  function createTooltip() {
    const el = document.createElement('div');
    el.id = 'link-preview-tooltip';
    el.className = 'link-preview-tooltip';
    el.setAttribute('role', 'tooltip');
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  function getTooltip() {
    return document.getElementById('link-preview-tooltip') || createTooltip();
  }

  function hideTooltip() {
    const tip = getTooltip();
    tip.classList.remove('link-preview-visible');
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '';
  }

  function positionTooltip(tip, anchor) {
    const rect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const gap = 12;
    let top = rect.bottom + gap;
    let left = rect.left;

    if (top + tipRect.height > window.innerHeight - 20) {
      top = rect.top - tipRect.height - gap;
    }
    if (left + tipRect.width > window.innerWidth - 20) {
      left = window.innerWidth - tipRect.width - 20;
    }
    if (left < 20) left = 20;

    tip.style.position = 'fixed';
    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
  }

  function showPreview(url, data) {
    const tip = getTooltip();
    const img = data?.image?.url;
    const title = data?.title || data?.url || url;
    const desc = data?.description || '';

    tip.innerHTML = '<div class="link-preview-card">' +
      (img ? '<img src="' + img + '" alt="" class="link-preview-img" loading="lazy" />' : '') +
      '<div class="link-preview-body">' +
      '<div class="link-preview-title">' + escapeHtml(title) + '</div>' +
      (desc ? '<div class="link-preview-desc">' + escapeHtml(truncate(desc, 120)) + '</div>' : '') +
      '</div></div>';
    tip.classList.add('link-preview-visible');
    tip.setAttribute('aria-hidden', 'false');
    positionTooltip(tip, currentLink);
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function truncate(s, len) {
    if (s.length <= len) return s;
    return s.slice(0, len).trim() + '\u2026';
  }

  function fetchPreview(url) {
    if (CACHE.has(url)) {
      const cached = CACHE.get(url);
      if (cached) showPreview(url, cached);
      return;
    }
    const apiUrl = getPreviewUrl(url);
    if (!apiUrl) return;

    fetch(apiUrl)
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.status === 'success' && res.data) {
          CACHE.set(url, res.data);
          if (currentLink && currentLink.href === url) {
            showPreview(url, res.data);
          }
        }
      })
      .catch(function () {
        CACHE.set(url, null);
      });
  }

  function handleMouseEnter(e) {
    const link = e.target.closest('a[href^="http"]');
    if (!link || link.href.startsWith(window.location.origin)) return;
    if (!link.closest('main')) return;

    currentLink = link;
    hoverTimer = setTimeout(function () {
      fetchPreview(link.href);
    }, HOVER_DELAY);
  }

  function handleMouseLeave(e) {
    const link = e.target.closest('a[href^="http"]');
    if (link) {
      currentLink = null;
      clearTimeout(hoverTimer);
      hoverTimer = null;
      hideTooltip();
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
