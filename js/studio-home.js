/* TokenLedger Primary Studio — 24-Model Live Cost Estimator, Prompt Token Counter, Cascade Savings & CSV/JSON Export */
(function () {
  'use strict';

  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    inputTokens: 2500,
    outputTokens: 600,
    dailyRequests: 1000,
    cacheHitRate: 50,
    useBatch: false,
    provider: 'all',
    tier: 'all',
    sortBy: 'monthly',
    frontierId: 'claude-sonnet-4',
    miniId: 'gemini-2.5-flash',
    offloadPct: 70
  };

  function readQuery() {
    var q = new URLSearchParams(window.location.search);
    if (q.has('in')) state.inputTokens = Number(q.get('in')) || state.inputTokens;
    if (q.has('out')) state.outputTokens = Number(q.get('out')) || state.outputTokens;
    if (q.has('req')) state.dailyRequests = Number(q.get('req')) || state.dailyRequests;
    if (q.has('cache')) state.cacheHitRate = Number(q.get('cache')) || 0;
    if (q.has('batch')) state.useBatch = q.get('batch') === '1';
    if (q.has('frontier')) state.frontierId = q.get('frontier');
    if (q.has('mini')) state.miniId = q.get('mini');
    if (q.has('offload')) state.offloadPct = Number(q.get('offload')) || 70;
  }

  function buildShareUrl() {
    var u = new URL(window.location.origin + window.location.pathname);
    u.searchParams.set('in', String(state.inputTokens));
    u.searchParams.set('out', String(state.outputTokens));
    u.searchParams.set('req', String(state.dailyRequests));
    u.searchParams.set('cache', String(state.cacheHitRate));
    if (state.useBatch) u.searchParams.set('batch', '1');
    u.searchParams.set('frontier', state.frontierId);
    u.searchParams.set('mini', state.miniId);
    u.searchParams.set('offload', String(state.offloadPct));
    return u.toString();
  }

  function populateSelects() {
    var fSel = document.getElementById('cascadeFrontier');
    var mSel = document.getElementById('cascadeMini');
    if (!fSel || !mSel) return;
    fSel.textContent = '';
    mSel.textContent = '';
    E.MODELS.forEach(function (m) {
      var o1 = document.createElement('option');
      o1.value = m.id;
      o1.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.output + ')';
      fSel.appendChild(o1);

      var o2 = document.createElement('option');
      o2.value = m.id;
      o2.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.output + ')';
      mSel.appendChild(o2);
    });
    fSel.value = state.frontierId;
    mSel.value = state.miniId;
  }

  function getComputedRows() {
    var rows = E.MODELS.map(function (m) {
      return E.calcModelWorkload(m, state);
    });
    if (state.provider !== 'all') {
      rows = rows.filter(function (r) { return r.model.provider === state.provider; });
    }
    if (state.tier !== 'all') {
      rows = rows.filter(function (r) { return r.model.tier === state.tier; });
    }
    rows.sort(function (a, b) {
      if (state.sortBy === 'context') return b.model.context - a.model.context;
      if (state.sortBy === 'input') return a.model.input - b.model.input;
      return a.monthly - b.monthly;
    });
    return rows;
  }

  function render() {
    document.getElementById('cacheVal').textContent = state.cacheHitRate + '%';
    document.getElementById('offloadVal').textContent = state.offloadPct + '%';

    var allRows = E.MODELS.map(function (m) { return E.calcModelWorkload(m, state); });
    allRows.sort(function (a, b) { return a.monthly - b.monthly; });
    var cheapest = allRows[0];
    var priciest = allRows[allRows.length - 1];
    var sonnet = E.calcModelWorkload('claude-sonnet-4', state);
    var gpt5 = E.calcModelWorkload('gpt-5', state);

    document.getElementById('kpiCheapest').textContent = E.formatUsd(cheapest.monthly) + '/mo';
    document.getElementById('kpiCheapestSub').textContent = cheapest.model.name + ' (' + E.formatUsd(cheapest.perReq) + '/req)';
    document.getElementById('kpiGpt5').textContent = E.formatUsd(gpt5.monthly) + '/mo';
    document.getElementById('kpiGpt5Sub').textContent = 'GPT-5 · ' + E.formatUsd(gpt5.annual) + '/yr';
    document.getElementById('kpiSonnet').textContent = E.formatUsd(sonnet.monthly) + '/mo';
    document.getElementById('kpiSonnetSub').textContent = 'Claude Sonnet 4 · ' + E.formatUsd(sonnet.annual) + '/yr';

    var casc = E.calcCascadeSavings(state.frontierId, state.miniId, state, state.offloadPct);
    document.getElementById('kpiCascadeSave').textContent = E.formatUsd(casc.savedMonthly) + '/mo';
    document.getElementById('kpiCascadeSub').textContent = Math.round(casc.savedPct) + '% off (' + E.formatUsd(casc.savedAnnual) + '/yr saved)';
    document.getElementById('cascadeOut').textContent =
      '100% ' + E.getModel(state.frontierId).name + ': ' + E.formatUsd(casc.frontierMonthly) +
      '/mo  →  Blended (' + (100 - state.offloadPct) + '/' + state.offloadPct + '): ' +
      E.formatUsd(casc.blendedMonthly) + '/mo  (Saves ' + E.formatUsd(casc.savedAnnual) + '/year)';

    var rows = getComputedRows();
    var maxM = rows.reduce(function (acc, r) { return Math.max(acc, r.monthly); }, 0.0001);
    var tbody = document.getElementById('modelTableBody');
    tbody.textContent = '';

    rows.forEach(function (r, idx) {
      var tr = document.createElement('tr');

      var tdModel = document.createElement('td');
      var strong = document.createElement('strong');
      strong.textContent = r.model.name;
      var sub = document.createElement('div');
      sub.style.fontSize = '0.76rem';
      sub.style.color = 'var(--text-dim)';
      sub.textContent = r.model.provider + ' · ' + Math.round(r.model.context / 1000) + 'K ctx';
      tdModel.appendChild(strong);
      tdModel.appendChild(sub);

      var tdBadge = document.createElement('td');
      var b = document.createElement('span');
      b.className = 'tl-badge' + (idx === 0 ? ' best' : r.exceedsContext ? ' warn' : '');
      b.textContent = r.exceedsContext ? 'Exceeds Ctx' : (idx === 0 ? 'Lowest Cost' : r.model.badge);
      tdBadge.appendChild(b);

      var tdRates = document.createElement('td');
      tdRates.className = 'num';
      tdRates.textContent = '$' + r.model.input.toFixed(2) + ' / $' + r.model.output.toFixed(2);

      var tdReq = document.createElement('td');
      tdReq.className = 'num';
      tdReq.textContent = E.formatUsd(r.perReq);

      var tdMonth = document.createElement('td');
      tdMonth.className = 'num';
      var mStrong = document.createElement('strong');
      mStrong.textContent = E.formatUsd(r.monthly);
      tdMonth.appendChild(mStrong);

      var tdAnnual = document.createElement('td');
      tdAnnual.className = 'num';
      tdAnnual.textContent = E.formatUsd(r.annual);

      var tdBar = document.createElement('td');
      var track = document.createElement('div');
      track.className = 'tl-bar-track';
      var fill = document.createElement('div');
      fill.className = 'tl-bar-fill';
      var wPct = Math.max(3, Math.min(100, (r.monthly / maxM) * 100));
      fill.style.width = wPct.toFixed(1) + '%';
      track.appendChild(fill);
      tdBar.appendChild(track);

      tr.appendChild(tdModel);
      tr.appendChild(tdBadge);
      tr.appendChild(tdRates);
      tr.appendChild(tdReq);
      tr.appendChild(tdMonth);
      tr.appendChild(tdAnnual);
      tr.appendChild(tdBar);
      tbody.appendChild(tr);
    });

    document.getElementById('spreadSummary').textContent =
      'Spread across 24 models: ' + E.formatUsd(cheapest.monthly) + '/mo (' + cheapest.model.name +
      ') to ' + E.formatUsd(priciest.monthly) + '/mo (' + priciest.model.name + ') — a ' +
      Math.round(priciest.monthly / Math.max(0.000001, cheapest.monthly)) + 'x cost gap.';
  }

  function bind() {
    readQuery();
    populateSelects();

    var inEl = document.getElementById('inTokens');
    var outEl = document.getElementById('outTokens');
    var reqEl = document.getElementById('dailyReqs');
    var cacheEl = document.getElementById('cacheSlider');
    var batchEl = document.getElementById('batchToggle');
    var promptEl = document.getElementById('livePrompt');
    var offloadEl = document.getElementById('offloadSlider');

    inEl.value = state.inputTokens;
    outEl.value = state.outputTokens;
    reqEl.value = state.dailyRequests;
    cacheEl.value = state.cacheHitRate;
    batchEl.checked = state.useBatch;
    offloadEl.value = state.offloadPct;

    inEl.addEventListener('input', function () { state.inputTokens = Number(inEl.value) || 0; render(); });
    outEl.addEventListener('input', function () { state.outputTokens = Number(outEl.value) || 0; render(); });
    reqEl.addEventListener('input', function () { state.dailyRequests = Number(reqEl.value) || 0; render(); });
    cacheEl.addEventListener('input', function () { state.cacheHitRate = Number(cacheEl.value) || 0; render(); });
    batchEl.addEventListener('change', function () { state.useBatch = batchEl.checked; render(); });
    offloadEl.addEventListener('input', function () { state.offloadPct = Number(offloadEl.value) || 0; render(); });

    document.getElementById('cascadeFrontier').addEventListener('change', function (ev) { state.frontierId = ev.target.value; render(); });
    document.getElementById('cascadeMini').addEventListener('change', function (ev) { state.miniId = ev.target.value; render(); });
    document.getElementById('sortSelect').addEventListener('change', function (ev) { state.sortBy = ev.target.value; render(); });

    if (promptEl) {
      promptEl.addEventListener('input', function () {
        var est = E.estimateTokens(promptEl.value);
        document.getElementById('promptStats').textContent =
          E.formatInt(est.tokensOpenAI) + ' OpenAI tok · ' + E.formatInt(est.tokensClaude) +
          ' Claude tok · ' + E.formatInt(est.tokensGemini) + ' Gemini tok (' + E.formatInt(est.chars) + ' chars)';
        if (est.tokensOpenAI > 0) {
          state.inputTokens = est.tokensOpenAI;
          inEl.value = state.inputTokens;
          render();
        }
      });
    }

    document.querySelectorAll('[data-provider]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.provider = btn.getAttribute('data-provider');
        document.querySelectorAll('[data-provider]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        render();
      });
    });

    document.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-preset');
        if (p === 'support') { state.inputTokens = 1800; state.outputTokens = 350; state.dailyRequests = 5000; state.cacheHitRate = 65; }
        else if (p === 'coding') { state.inputTokens = 18000; state.outputTokens = 1800; state.dailyRequests = 400; state.cacheHitRate = 80; }
        else if (p === 'rag') { state.inputTokens = 4500; state.outputTokens = 600; state.dailyRequests = 2000; state.cacheHitRate = 40; }
        else if (p === 'batch') { state.inputTokens = 3200; state.outputTokens = 500; state.dailyRequests = 15000; state.cacheHitRate = 30; state.useBatch = true; }
        inEl.value = state.inputTokens;
        outEl.value = state.outputTokens;
        reqEl.value = state.dailyRequests;
        cacheEl.value = state.cacheHitRate;
        batchEl.checked = state.useBatch;
        render();
        UI.showToast('Loaded ' + btn.textContent.trim() + ' workload');
      });
    });

    document.getElementById('btnShare').addEventListener('click', function () {
      UI.copyText(buildShareUrl(), 'Shareable FinOps scenario URL copied');
    });

    document.getElementById('btnCsv').addEventListener('click', function () {
      var rows = getComputedRows();
      var csv = UI.rowsToCsv(
        ['Model', 'Provider', 'Tier', 'Input_USD_1M', 'Output_USD_1M', 'Per_Request_USD', 'Monthly_USD', 'Annual_USD', 'Context_Window'],
        rows.map(function (r) {
          return [r.model.name, r.model.provider, r.model.tier, r.model.input, r.model.output, r.perReq.toFixed(6), r.monthly.toFixed(2), r.annual.toFixed(2), r.model.context];
        })
      );
      UI.downloadFile('tokenledger-budget.csv', csv, 'text/csv;charset=utf-8');
      UI.showToast('Downloaded tokenledger-budget.csv');
    });

    document.getElementById('btnJson').addEventListener('click', function () {
      var payload = {
        generatedBy: 'TokenLedger',
        scenario: state,
        models: getComputedRows().map(function (r) {
          return { id: r.model.id, name: r.model.name, provider: r.model.provider, perReqUsd: Number(r.perReq.toFixed(6)), monthlyUsd: Number(r.monthly.toFixed(2)), annualUsd: Number(r.annual.toFixed(2)) };
        })
      };
      UI.downloadFile('tokenledger-budget.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-budget.json');
    });

    document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
