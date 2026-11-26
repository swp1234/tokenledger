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

  var CMD_ITEMS = [
    { t: '24-Model Live Cost Estimator', u: '/', k: 'home pricing gpt-5 claude gemini deepseek' },
    { t: 'GPU VRAM & KV-Cache Quantization Calculator', u: '/tools/gpu-vram-calculator.html', k: 'vram llama 70b deepseek q4 fp8 h100 4090' },
    { t: 'CFO Hybrid Caching + Batch + Cascade Waterfall', u: '/tools/batch-vs-realtime-router.html', k: 'cfo waterfall batch routing savings' },
    { t: 'Fine-Tuning vs. RAG vs. Prompt Caching 12-Month TCO', u: '/tools/fine-tune-vs-rag.html', k: 'lora sft rag vector adr' },
    { t: 'LLM Rate-Limit (RPM / TPM / Concurrency) Planner', u: '/tools/llm-rate-limit-planner.html', k: '429 tpm rpm tier little law failover' },
    { t: 'AI Agent Loop Burn Calculator (O(N²))', u: '/tools/agent-budget.html', k: 'agent turns snowball sliding window' },
    { t: 'MCP & Function-Calling Schema Tax Auditor', u: '/tools/mcp-schema-auditor.html', k: 'mcp claude code cursor json tools bloat' },
    { t: 'AI SaaS Gross Margin & Break-Even Simulator', u: '/tools/saas-margin.html', k: 'saas margin cogs stripe power user' },
    { t: 'RAG & Vector DB HNSW RAM TCO Planner', u: '/tools/rag-calculator.html', k: 'rag embedding chunks vector hnsw' },
    { t: 'Self-Hosted GPU vs. Cloud LLM API Break-Even', u: '/tools/self-host-vs-api.html', k: 'self host vllm gpu a100 h100 l40s' },
    { t: 'Voice, Vision & Multimodal Cost Studio', u: '/tools/multimodal-budget.html', k: 'realtime voice gemini live pdf ocr image' },
    { t: 'AI Startup Monthly Burn & Default-Alive Runway', u: '/tools/ai-runway.html', k: 'startup runway mrr burn cash' },
    { t: 'Prompt A/B Compression Cost Diff & GitHub CI Guard', u: '/tools/prompt-diff.html', k: 'prompt diff compression github action ci yaml' },
    { t: 'Context Window & JSON Schema Minifier Inspector', u: '/tools/token-inspector.html', k: 'token counter minify json context 128k 1m' },
    { t: 'AWS Bedrock vs. Direct Anthropic API Comparison', u: '/compare/aws-bedrock-vs-direct-anthropic-api.html', k: 'aws bedrock anthropic enterprise' },
    { t: 'Public Machine-Readable Pricing API (JSON)', u: '/api/pricing.json', k: 'json api feed pricing' }
  ];

  function initCommandPalette() {
    var modal = null;
    function ensureModal() {
      if (modal) return modal;
      modal = document.createElement('div');
      modal.id = 'tlCmdModal';
      modal.className = 'tl-cmd-backdrop';
      modal.hidden = true;
      modal.innerHTML = '<div class="tl-cmd-dialog" role="dialog" aria-modal="true" aria-label="Quick Navigation">' +
        '<input id="tlCmdInput" class="tl-cmd-input" type="search" placeholder="Jump to calculator, VRAM, Bedrock, Rate-Limit... (Esc to close)" autocomplete="off">' +
        '<div id="tlCmdList" class="tl-cmd-list"></div></div>';
      document.body.appendChild(modal);
      var inp = modal.querySelector('#tlCmdInput');
      var list = modal.querySelector('#tlCmdList');

      function renderList(q) {
        var needle = String(q || '').trim().toLowerCase();
        var hits = CMD_ITEMS.filter(function (it) {
          return !needle || it.t.toLowerCase().indexOf(needle) !== -1 || it.k.indexOf(needle) !== -1;
        });
        list.innerHTML = hits.length
          ? hits.map(function (it) { return '<a class="tl-cmd-item" href="' + it.u + '"><strong>' + it.t + '</strong><span>' + it.u + '</span></a>'; }).join('')
          : '<div class="tl-cmd-empty">No matching TokenLedger workspace</div>';
      }

      inp.addEventListener('input', function () { renderList(inp.value); });
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      renderList('');
      return modal;
    }

    function openModal() {
      var m = ensureModal();
      m.hidden = false;
      var inp = m.querySelector('#tlCmdInput');
      if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input')); inp.focus(); }
    }
    function closeModal() {
      if (modal) modal.hidden = true;
    }

    var btn = document.getElementById('tlCmdOpen');
    if (btn) btn.addEventListener('click', openModal);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        if (modal && !modal.hidden) closeModal(); else openModal();
      } else if (e.key === 'Escape' && modal && !modal.hidden) {
        closeModal();
      }
    });
  }

  initEmbedMode();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initTheme(); initCurrency(); initCommandPalette(); }, { once: true });
  } else {
    initTheme();
    initCurrency();
    initCommandPalette();
  }
})();
