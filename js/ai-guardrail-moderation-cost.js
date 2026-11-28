/* TokenLedger AI Guardrail, PII Redaction & Safety Moderation Cost Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('grModel');
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.input + '/$' + m.output + ')';
        if (m.id === 'claude-sonnet-4.5') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      primaryModelId: $('grModel').value || 'claude-sonnet-4.5',
      dailyRequests: Number($('grReqs').value) || 10000,
      avgInputTokens: Number($('grInTok').value) || 1800,
      avgOutputTokens: Number($('grOutTok').value) || 450,
      cacheHitRate: Number($('grCache').value),
      checkOutput: $('grCheckOut').checked,
      piiScan: $('grPiiScan').checked
    };
  }

  function render() {
    $('grCacheVal').textContent = ($('grCache').value || '50') + '%';
    var res = E.calcGuardrailCost(getOpts());

    $('kpiGrPrimary').textContent = E.formatUsd(res.primaryMonthly) + '/mo';
    $('kpiGrPrimarySub').textContent = res.primary.name + ' (' + E.formatInt(res.monthlyReqs) + ' req/mo)';
    $('kpiGrCheapPaid').textContent = E.formatUsd(res.cheapestPaid.monthly) + '/mo';
    $('kpiGrCheapPaidSub').textContent = res.cheapestPaid.name + ' (+' + res.cheapestPaid.overheadPct.toFixed(1) + '%)';
    $('kpiGrPriciest').textContent = E.formatUsd(res.priciest.monthly) + '/mo';
    $('kpiGrPriciestSub').textContent = res.priciest.name + ' (+' + res.priciest.overheadPct.toFixed(1) + '%)';
    $('kpiGrScanned').textContent = E.formatInt(res.scannedTokensPerReq) + ' tok';
    $('kpiGrScannedSub').textContent = 'Scanned tokens per request (in + out)';

    var body = $('grTableBody');
    if (body) {
      body.innerHTML = '';
      res.rows.forEach(function (r, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + r.name + '</strong>' + (idx === 0 ? ' <span class="tl-badge best">Lowest</span>' : '') + '<div class="kpi-sub">' + r.notes + '</div></td>' +
          '<td class="num"><strong>' + E.formatUsd(r.monthly) + '/mo</strong></td>' +
          '<td class="num">+' + r.overheadPct.toFixed(1) + '%</td>' +
          '<td class="num">' + E.formatUsd(r.combinedMonthly) + '/mo</td>' +
          '<td class="num">' + E.formatUsd(r.annual) + '/yr</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['grModel', 'grReqs', 'grInTok', 'grOutTok', 'grCache', 'grCheckOut', 'grPiiScan'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnGrCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## AI Guardrail, PII & Moderation Cost Report (TokenLedger)',
          'Primary LLM: **' + r.primary.name + '** (' + E.formatUsd(r.primaryMonthly) + '/mo · ' + E.formatInt(r.monthlyReqs) + ' req/mo)',
          '',
          '| Guardrail Stack | Guardrail/Mo | Safety Overhead % | Combined Monthly | Guardrail Annual |',
          '|---|---:|---:|---:|---:|'
        ].concat(r.rows.map(function (x) {
          return '| ' + x.name + ' | ' + E.formatUsd(x.monthly) + ' | +' + x.overheadPct.toFixed(1) + '% | ' + E.formatUsd(x.combinedMonthly) + ' | ' + E.formatUsd(x.annual) + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Guardrail Cost Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
