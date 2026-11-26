/* TokenLedger Fine-Tuning vs RAG vs Long-Context Prompt Caching 12-Month TCO */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function populateModels() {
    var sel = document.getElementById('ftModel');
    if (!sel) return;
    sel.innerHTML = '';
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.output + ')';
      if (m.id === 'gpt-4.1-mini') o.selected = true;
      sel.appendChild(o);
    });
  }

  function getOpts() {
    return {
      baseModelId: document.getElementById('ftModel').value,
      kbTokens: Number(document.getElementById('ftKbTokens').value) || 150000,
      dailyRequests: Number(document.getElementById('ftDailyReqs').value) || 4000,
      userPromptTokens: Number(document.getElementById('ftUserTok').value) || 350,
      outputTokens: Number(document.getElementById('ftOutTok').value) || 450,
      trainCostPer1M: Number(document.getElementById('ftTrainRate').value) || 3.0,
      trainEpochs: Number(document.getElementById('ftEpochs').value) || 3,
      retrainsPerYear: Number(document.getElementById('ftRetrains').value) || 6,
      ftInferMultiplier: Number(document.getElementById('ftInferMult').value) || 1.6,
      ragTopKTokens: Number(document.getElementById('ftRagTopK').value) || 2400,
      vectorDbMonthly: Number(document.getElementById('ftVectorDb').value) || 70,
      cacheHitRate: Number(document.getElementById('ftCacheHit').value) || 85
    };
  }

  var lastRes = null;

  function render() {
    var o = getOpts();
    document.getElementById('ftCacheVal').textContent = o.cacheHitRate + '%';
    var res = E.calcFineTuneVsRag(o);
    lastRes = { opts: o, res: res };

    document.getElementById('kpiFtWinner').textContent = res.winner.label;
    document.getElementById('kpiFtWinnerSub').textContent = 'Saves ' + E.formatUsd(res.annualSavingsVsRunnerUp) + '/yr vs ' + res.runnerUp.label;
    document.getElementById('kpiFtAnnual').textContent = E.formatUsd(res.ftAnnual) + '/yr';
    document.getElementById('kpiFtAnnualSub').textContent = 'Train: ' + E.formatUsd(res.annualTrainCost) + '/yr · ' + E.formatUsd(res.ftMonthly) + '/mo';
    document.getElementById('kpiRagAnnual').textContent = E.formatUsd(res.ragAnnual) + '/yr';
    document.getElementById('kpiRagAnnualSub').textContent = E.formatUsd(res.ragMonthly) + '/mo incl. Vector DB';
    document.getElementById('kpiCacheAnnual').textContent = res.cacheFits ? (E.formatUsd(res.cacheAnnual) + '/yr') : 'Exceeds 900K';
    document.getElementById('kpiCacheAnnualSub').textContent = res.cacheFits ? (E.formatUsd(res.cacheMonthly) + '/mo @ ' + o.cacheHitRate + '% cache') : 'KB > 900K tokens — use RAG or FT';

    var tb = document.getElementById('ftBreakdownBody');
    if (tb) {
      var rows = [
        { name: 'Fine-Tuning (LoRA/SFT)', mo: res.ftMonthly, yr: res.ftAnnual, note: o.retrainsPerYear + ' retrains/yr · ' + o.ftInferMultiplier + '× inference rate' },
        { name: 'RAG + Vector DB', mo: res.ragMonthly, yr: res.ragAnnual, note: E.formatInt(o.ragTopKTokens) + ' retrieved tok/req + ' + E.formatUsd(o.vectorDbMonthly) + '/mo DB' },
        { name: 'Long-Context Prompt Caching', mo: res.cacheFits ? res.cacheMonthly : null, yr: res.cacheFits ? res.cacheAnnual : null, note: res.cacheFits ? (E.formatInt(o.kbTokens) + ' KB tok @ ' + o.cacheHitRate + '% cache hit') : 'Knowledge base exceeds single-context cache ceiling' }
      ];
      tb.innerHTML = rows.map(function (r) {
        var win = r.name === res.winner.label ? ' <span class="badge-pill">Lowest 12m TCO</span>' : '';
        return '<tr><td><strong>' + r.name + '</strong>' + win + '</td>' +
          '<td class="num">' + (r.mo !== null ? E.formatUsd(r.mo) + '/mo' : 'N/A') + '</td>' +
          '<td class="num">' + (r.yr !== null ? E.formatUsd(r.yr) + '/yr' : 'N/A') + '</td>' +
          '<td>' + r.note + '</td></tr>';
      }).join('');
    }
  }

  function init() {
    populateModels();
    document.querySelectorAll('#ftModel,#ftKbTokens,#ftDailyReqs,#ftUserTok,#ftOutTok,#ftTrainRate,#ftEpochs,#ftRetrains,#ftInferMult,#ftRagTopK,#ftVectorDb,#ftCacheHit').forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    var btnMd = document.getElementById('btnFtCopyAdr');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        if (!lastRes) return;
        var r = lastRes.res;
        var o = lastRes.opts;
        var md = [
          '### Architecture Decision Record: Fine-Tuning vs. RAG vs. Prompt Caching',
          '- **Base Model**: ' + r.model.name + ' (' + r.model.provider + ')',
          '- **Workload**: ' + E.formatInt(o.dailyRequests) + ' req/day · KB: ' + E.formatInt(o.kbTokens) + ' tokens',
          '- **Recommended 12-Month Winner**: **' + r.winner.label + '** (' + E.formatUsd(r.winner.annual) + '/yr — saves ' + E.formatUsd(r.annualSavingsVsRunnerUp) + '/yr vs ' + r.runnerUp.label + ')',
          '',
          '| Architecture | Monthly | 12-Month TCO |',
          '|---|---:|---:|',
          '| Fine-Tuning (LoRA/SFT) | ' + E.formatUsd(r.ftMonthly) + ' | ' + E.formatUsd(r.ftAnnual) + ' |',
          '| RAG + Vector DB | ' + E.formatUsd(r.ragMonthly) + ' | ' + E.formatUsd(r.ragAnnual) + ' |',
          '| Long-Context Prompt Caching | ' + (r.cacheFits ? E.formatUsd(r.cacheMonthly) : 'N/A') + ' | ' + (r.cacheFits ? E.formatUsd(r.cacheAnnual) : 'N/A') + ' |',
          '',
          '_Generated locally with [TokenLedger](https://tokenledger-8x7.pages.dev/tools/fine-tune-vs-rag.html)_'
        ].join('\n');
        UI.copyText(md, 'ADR Markdown copied to clipboard');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
