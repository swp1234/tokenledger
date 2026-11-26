/* TokenLedger CFO Hybrid Routing + Caching + Batch Cost Waterfall Simulator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function populate() {
    var fSel = document.getElementById('hyFrontier');
    var mSel = document.getElementById('hyMini');
    if (!fSel || !mSel) return;
    fSel.innerHTML = ''; mSel.innerHTML = '';
    E.MODELS.forEach(function (m) {
      var o1 = document.createElement('option');
      o1.value = m.id; o1.textContent = m.name + ' ($' + m.input + '/$' + m.output + ')';
      if (m.id === 'claude-sonnet-4') o1.selected = true;
      fSel.appendChild(o1);
      var o2 = document.createElement('option');
      o2.value = m.id; o2.textContent = m.name + ' ($' + m.input + '/$' + m.output + ')';
      if (m.id === 'gemini-2.5-flash') o2.selected = true;
      mSel.appendChild(o2);
    });
  }

  var lastRes = null;

  function render() {
    var miniPct = Number(document.getElementById('hyMiniPct').value) || 0;
    var batchPct = Number(document.getElementById('hyBatchPct').value) || 0;
    if (miniPct + batchPct > 100) batchPct = 100 - miniPct;
    var opts = {
      frontierId: document.getElementById('hyFrontier').value,
      miniId: document.getElementById('hyMini').value,
      inputTokens: Number(document.getElementById('hyInTok').value) || 3500,
      outputTokens: Number(document.getElementById('hyOutTok').value) || 700,
      dailyRequests: Number(document.getElementById('hyReqs').value) || 10000,
      miniPct: miniPct,
      batchPct: batchPct,
      cacheHitRate: Number(document.getElementById('hyCache').value) || 70
    };
    document.getElementById('hyMiniVal').textContent = miniPct + '%';
    document.getElementById('hyBatchVal').textContent = batchPct + '%';
    document.getElementById('hyCacheVal').textContent = opts.cacheHitRate + '%';

    var res = E.calcHybridWaterfall(opts);
    lastRes = { opts: opts, res: res };

    document.getElementById('kpiHyBase').textContent = E.formatUsd(res.baselineMonthly) + '/mo';
    document.getElementById('kpiHyBaseSub').textContent = '100% uncached ' + res.frontier.name;
    document.getElementById('kpiHyOpt').textContent = E.formatUsd(res.optimizedMonthly) + '/mo';
    document.getElementById('kpiHyOptSub').textContent = res.split.frontierPct + '% Frontier · ' + res.split.miniPct + '% Mini · ' + res.split.batchPct + '% Batch';
    document.getElementById('kpiHySaveMo').textContent = '-' + E.formatUsd(res.monthlySaved) + '/mo';
    document.getElementById('kpiHySaveMoSub').textContent = res.savedPct.toFixed(1) + '% total spend reduction';
    document.getElementById('kpiHySaveYr').textContent = E.formatUsd(res.annualSaved) + '/yr';
    document.getElementById('kpiHySaveYrSub').textContent = 'Annualized CFO FinOps savings';

    var tb = document.getElementById('hyWaterfallBody');
    if (tb) {
      var rows = [
        { step: '0. Unoptimized Baseline (100% ' + res.frontier.name + ', 0% Cache)', mo: res.baselineMonthly, yr: res.baselineMonthly * 12, pct: '100.0%' },
        { step: '1. After Prompt Caching Alone (' + opts.cacheHitRate + '% Cache Hit)', mo: res.afterCacheOnlyMonthly, yr: res.afterCacheOnlyMonthly * 12, pct: (res.baselineMonthly ? (res.afterCacheOnlyMonthly / res.baselineMonthly * 100).toFixed(1) : '0') + '%' },
        { step: '2a. Optimized Lane — Realtime Frontier (' + res.split.frontierPct + '% traffic)', mo: res.laneFrontierMonthly, yr: res.laneFrontierMonthly * 12, pct: (res.baselineMonthly ? (res.laneFrontierMonthly / res.baselineMonthly * 100).toFixed(1) : '0') + '%' },
        { step: '2b. Optimized Lane — Fast Cascade ' + res.mini.name + ' (' + res.split.miniPct + '% traffic)', mo: res.laneMiniMonthly, yr: res.laneMiniMonthly * 12, pct: (res.baselineMonthly ? (res.laneMiniMonthly / res.baselineMonthly * 100).toFixed(1) : '0') + '%' },
        { step: '2c. Optimized Lane — 50% Async Batch API (' + res.split.batchPct + '% traffic)', mo: res.laneBatchMonthly, yr: res.laneBatchMonthly * 12, pct: (res.baselineMonthly ? (res.laneBatchMonthly / res.baselineMonthly * 100).toFixed(1) : '0') + '%' },
        { step: 'Final Blended Enterprise FinOps Spend', mo: res.optimizedMonthly, yr: res.optimizedMonthly * 12, pct: (100 - res.savedPct).toFixed(1) + '% (-' + res.savedPct.toFixed(1) + '%)' }
      ];
      tb.innerHTML = rows.map(function (r, idx) {
        var strong = idx === rows.length - 1 ? ' style="font-weight:700;color:var(--accent)"' : '';
        return '<tr' + strong + '><td>' + r.step + '</td><td class="num">' + E.formatUsd(r.mo) + '/mo</td><td class="num">' + E.formatUsd(r.yr) + '/yr</td><td class="num">' + r.pct + '</td></tr>';
      }).join('');
    }
  }

  function init() {
    populate();
    document.querySelectorAll('#hyFrontier,#hyMini,#hyInTok,#hyOutTok,#hyReqs,#hyMiniPct,#hyBatchPct,#hyCache').forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    var btnMd = document.getElementById('btnHyMemo');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        if (!lastRes) return;
        var r = lastRes.res;
        var md = [
          '### Executive AI FinOps Savings Waterfall',
          '- **Baseline (100% ' + r.frontier.name + ', Uncached)**: ' + E.formatUsd(r.baselineMonthly) + '/mo (' + E.formatUsd(r.baselineMonthly * 12) + '/yr)',
          '- **Optimized Hybrid Architecture** (' + r.split.frontierPct + '% Frontier / ' + r.split.miniPct + '% ' + r.mini.name + ' / ' + r.split.batchPct + '% Batch): **' + E.formatUsd(r.optimizedMonthly) + '/mo**',
          '- **Projected Annual Savings**: **' + E.formatUsd(r.annualSaved) + '/yr (-' + r.savedPct.toFixed(1) + '%)**',
          '',
          '_Generated locally with [TokenLedger Hybrid FinOps Waterfall](https://tokenledger-8x7.pages.dev/tools/batch-vs-realtime-router.html)_'
        ].join('\n');
        UI.copyText(md, 'Copied CFO Executive Memo Markdown!');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
