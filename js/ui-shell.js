/* TokenLedger Shared UI Shell — Theme toggle, Export (CSV/JSON/Print), Toast & Curated Technical Stack */
(function () {
  'use strict';

  var THEME_KEY = 'tl_theme_v1';

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('tlThemeToggle');
    if (btn) btn.textContent = t === 'light' ? 'Dark' : 'Light';
  }

  function initTheme() {
    var saved = 'dark';
    try { saved = localStorage.getItem(THEME_KEY) || 'dark'; } catch (_) {}
    applyTheme(saved);
    var btn = document.getElementById('tlThemeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
        applyTheme(next);
      });
    }
  }

  function showToast(msg) {
    var el = document.getElementById('tlToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tlToast';
      el.className = 'tl-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(successMsg || 'Copied to clipboard');
      }).catch(function () {
        showToast('Copy unavailable in this browser context');
      });
    }
  }

  function csvCell(v) {
    var s = String(v == null ? '' : v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function rowsToCsv(headers, rows) {
    var lines = [headers.map(csvCell).join(',')];
    for (var i = 0; i < rows.length; i++) {
      lines.push(rows[i].map(csvCell).join(','));
    }
    return lines.join('\n');
  }

  window.TokenLedgerUI = {
    showToast: showToast,
    downloadFile: downloadFile,
    copyText: copyText,
    rowsToCsv: rowsToCsv
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme, { once: true });
  } else {
    initTheme();
  }
})();
