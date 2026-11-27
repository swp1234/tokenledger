/* TokenLedger LLM Context Caching Write-Premium & TTL ROI Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('ccModel');
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.input + ' in / $' + m.cachedInput + ' cached)';
        if (m.id === 'claude-sonnet-4.5') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      modelId: $('ccModel').value || 'claude-sonnet-4.5',
      prefixTokens: Number($('ccPrefix').value) || 25000,
      dynamicInput: Number($('ccDynIn').value) || 400,
      outputTokens: Number($('ccOutTok').value) || 500,
      reqsPerHour: Number($('ccReqsHr').value) || 30,
      activeHoursDay: Number($('ccHoursDay').value) || 16
    };
  }

  function render() {
    var res = E.calcCacheTtlRoi(getOpts());
    $('kpiCcBest').textContent = E.formatUsd(res.best.totalMonthly) + '/mo';
    $('kpiCcBestSub').textContent = res.best.name;
    $('kpiCcSaveMo').textContent = E.formatUsd(res.maxSavingsMonthly) + '/mo';
    $('kpiCcSaveMoSub').textContent = res.maxSavingsPct.toFixed(1) + '% saved vs. uncached (' + E.formatUsd(res.maxSavingsAnnual) + '/yr)';
    $('kpiCcBe5m').textContent = res.breakEvenHits5m + ' hits';
    $('kpiCcBe5mSub').textContent = 'Min hits per 5-min TTL write (1.25x)';
    $('kpiCcBe1h').textContent = res.breakEvenHits1h + ' hits';
    $('kpiCcBe1hSub').textContent = 'Min hits per 1-hr TTL write (2.0x)';

    var body = $('ccTableBody');
    if (body) {
      body.innerHTML = '';
      res.strategies.forEach(function (s) {
        var isBest = s.id === res.best.id;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + s.name + '</strong>' + (isBest ? ' <span class="tl-badge best">Best ROI</span>' : '') + '</td>' +
          '<td class="num">' + s.hitRatePct.toFixed(1) + '%</td>' +
          '<td class="num">' + E.formatUsd(s.writeOverhead) + '</td>' +
          '<td class="num">' + E.formatUsd(s.readCost) + '</td>' +
          '<td class="num"><strong>' + E.formatUsd(s.totalMonthly) + '/mo</strong></td>' +
          '<td class="num">' + (s.savingsVsBase > 0 ? '-' + E.formatUsd(s.savingsVsBase) + '/mo' : 'Baseline') + '</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['ccModel', 'ccPrefix', 'ccDynIn', 'ccOutTok', 'ccReqsHr', 'ccHoursDay'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnCcCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## LLM Prompt Caching TTL ROI Analysis (TokenLedger)',
          'Model: **' + r.model.name + '** · Prefix: **' + E.formatInt(r.prefixTokens) + ' tok** · Monthly Requests: **' + E.formatInt(r.monthlyReqs) + '**',
          'Winner: **' + r.best.name + '** (Saves **' + E.formatUsd(r.maxSavingsMonthly) + '/mo** / **' + r.maxSavingsPct.toFixed(1) + '%**)',
          '',
          '| Caching Strategy | Est. Hit Rate | Write/Storage | Prefix Reads | Total/Mo | Savings vs. Baseline |',
          '|---|---:|---:|---:|---:|---:|'
        ].concat(r.strategies.map(function (s) {
          return '| ' + s.name + ' | ' + s.hitRatePct.toFixed(1) + '% | ' + E.formatUsd(s.writeOverhead) + ' | ' + E.formatUsd(s.readCost) + ' | ' + E.formatUsd(s.totalMonthly) + ' | ' + (s.savingsVsBase > 0 ? '-' + E.formatUsd(s.savingsVsBase) : 'Baseline') + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Cache TTL ROI Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
