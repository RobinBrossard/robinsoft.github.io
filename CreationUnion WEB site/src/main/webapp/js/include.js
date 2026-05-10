// Simple HTML include loader: inserts fetched HTML into elements with a data-include attribute
// Dispatches a document-level 'includesLoaded' event when all includes are processed.
function applyNavPrefixes() {
  const includeHosts = Array.from(document.querySelectorAll('[data-include][data-nav-prefix]'));
  includeHosts.forEach(function(host) {
    const prefix = host.getAttribute('data-nav-prefix') || '';
    host.querySelectorAll('.main-nav a[data-nav-path]').forEach(function(link) {
      const target = link.getAttribute('data-nav-path');
      if (target) {
        link.setAttribute('href', prefix + target);
      }
    });
  });
}

function notifyIncludesLoaded() {
  applyNavPrefixes();
  document.dispatchEvent(new Event('includesLoaded'));
  // After includesLoaded, try to trigger i18n translation if available.
  if (window.i18n) {
    if (typeof window.i18n.init === 'function') {
      try { window.i18n.init(); } catch(e) { console.warn('i18n.init failed', e); }
    } else if (typeof window.i18n.translate === 'function') {
      try { window.i18n.translate(); } catch(e) { console.warn('i18n.translate failed', e); }
    } else if (typeof window.i18n.setLang === 'function') {
      try { window.i18n.setLang(window.i18n.currentLang || 'en'); } catch(e) { console.warn('i18n.setLang failed', e); }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const includes = Array.from(document.querySelectorAll('[data-include]'));
  if (includes.length === 0) {
    notifyIncludesLoaded();
    return;
  }

  let remaining = includes.length;
  includes.forEach(el => {
    const path = el.getAttribute('data-include');
    fetch(path).then(res => {
      if (!res.ok) throw new Error('Failed to load ' + path + ' (' + res.status + ')');
      return res.text();
    }).then(html => {
      el.innerHTML = html;
    }).catch(err => {
      console.error(err);
      el.innerHTML = '';
      }).finally(() => {
      remaining--;
      if (remaining === 0) {
        notifyIncludesLoaded();
      }
    });
  });
});
