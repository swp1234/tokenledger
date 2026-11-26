/* TokenLedger Shared UI Shell — Theme toggle, Export (CSV/JSON/Print), Toast & Curated Technical Stack */
(function () {
  'use strict';

  var THEME_KEY = 'tl_theme_v1';
  var CUR_KEY = 'tl_currency_v1';

  function initCurrency() {
    var E = window.TokenLedgerEngine;
    var sel = document.getElementById('tlCurrencySelect');
    var saved = 'USD';
    try { saved = localStorage.getItem(CUR_KEY) || 'USD'; } catch (_) {}
    if (E && E.setCurrency) E.setCurrency(saved);
    if (sel) {
      sel.value = saved;
      sel.addEventListener('change', function () {
        var next = sel.value;
        try { localStorage.setItem(CUR_KEY, next); } catch (_) {}
        if (E && E.setCurrency) E.setCurrency(next);
        window.dispatchEvent(new CustomEvent('tl:currency-change', { detail: { currency: next } }));
        // Re-trigger inputs on current workspace so every calculator re-renders immediately
        var firstInput = document.querySelector('main input, main select, main textarea');
        if (firstInput) firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        if (firstInput) firstInput.dispatchEvent(new Event('change', { bubbles: true }));
        showToast('Display currency switched to ' + next);
      });
    }
  }

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

  function initEmbedMode() {
    try {
      if (new URLSearchParams(window.location.search).get('embed') === '1') {
        document.documentElement.classList.add('tl-embed-mode');
      }
    } catch (_) {}
  }

  window.TokenLedgerUI = {
    showToast: showToast,
    downloadFile: downloadFile,
    copyText: copyText,
    rowsToCsv: rowsToCsv
  };

  initEmbedMode();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initTheme(); initCurrency(); }, { once: true });
  } else {
    initTheme();
    initCurrency();
  }
})();
