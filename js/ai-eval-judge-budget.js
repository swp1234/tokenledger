/* TokenLedger LLM-as-a-Judge & AI Evaluation Pipeline Budget Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('evModel');
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.input + '/$' + m.output + ')';
        if (m.id === 'gpt-5-mini') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      judgeModelId: $('evModel').value || 'gpt-5-mini',
      evalCases: Number($('evCases').value) || 500,
      ciRunsPerMonth: Number($('evCiRuns').value) || 60,
      prodTracesPerDay: Number($('evProdTraces').value) || 10000,
      sampleRatePct: Number($('evSamplePct').value),
      avgInputPerJudge: Number($('evInTok').value) || 2200,
      avgOutputPerJudge: Number($('evOutTok').value) || 350,
      rubricsPerCase: Number($('evRubrics').value) || 2,
      cacheHitRate: Number($('evCache').value),
      useBatch: $('evBatch').checked
    };
  }

  function render() {
    $('evSampleVal').textContent = ($('evSamplePct').value || '5') + '%';
    $('evCacheVal').textContent = ($('evCache').value || '65') + '%';
    var res = E.calcEvalJudgeBudget(getOpts());

    $('kpiEvMonthly').textContent = E.formatUsd(res.selected.activeMonthly) + '/mo';
    $('kpiEvMonthlySub').textContent = res.selected.model.name + ' (' + E.formatUsd(res.selected.activeAnnual) + '/yr)';
    $('kpiEvCalls').textContent = E.formatInt(res.totalJudgeCallsMo) + '/mo';
    $('kpiEvCallsSub').textContent = 'CI: ' + E.formatInt(res.ciJudgeCallsMo) + ' (' + res.ciSharePct.toFixed(0) + '%) · Prod: ' + E.formatInt(res.prodJudgeCallsMo);
    $('kpiEvPer1k').textContent = E.formatUsd(res.selected.costPer1kEvals) + '/1K';
    $('kpiEvPer1kSub').textContent = 'Per 1,000 judge evaluations';
    $('kpiEvBatchSave').textContent = E.formatUsd(res.batchSavingsMonthly) + '/mo';
    $('kpiEvBatchSaveSub').textContent = '50% Async Batch API discount impact';

    var body = $('evTableBody');
    if (body) {
      body.innerHTML = '';
      res.rows.forEach(function (r, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + r.model.name + '</strong>' + (idx === 0 ? ' <span class="tl-badge best">Lowest</span>' : '') + '</td>' +
          '<td class="num">' + E.formatUsd(r.costPer1kEvals) + '</td>' +
          '<td class="num">' + E.formatUsd(r.realtimeMonthly) + '/mo</td>' +
          '<td class="num">' + E.formatUsd(r.batchMonthly) + '/mo</td>' +
          '<td class="num"><strong>' + E.formatUsd(r.activeMonthly) + '/mo</strong></td>' +
          '<td class="num">' + E.formatUsd(r.activeAnnual) + '/yr</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['evModel', 'evCases', 'evCiRuns', 'evProdTraces', 'evSamplePct', 'evInTok', 'evOutTok', 'evRubrics', 'evCache', 'evBatch'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnEvCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## LLM-as-a-Judge & CI Evaluation Pipeline Budget (TokenLedger)',
          'Total Monthly Judge Calls: **' + E.formatInt(r.totalJudgeCallsMo) + '** (CI: ' + E.formatInt(r.ciJudgeCallsMo) + ' · Prod Sampling: ' + E.formatInt(r.prodJudgeCallsMo) + ')',
          'Selected Judge: **' + r.selected.model.name + '** -> **' + E.formatUsd(r.selected.activeMonthly) + '/mo** (' + E.formatUsd(r.selected.costPer1kEvals) + ' per 1K evals)',
          '',
          '| Judge Model | Cost / 1K Evals | Real-Time/Mo | 50% Batch/Mo | Active/Mo | Annual |',
          '|---|---:|---:|---:|---:|---:|'
        ].concat(r.rows.map(function (x) {
          return '| ' + x.model.name + ' | ' + E.formatUsd(x.costPer1kEvals) + ' | ' + E.formatUsd(x.realtimeMonthly) + ' | ' + E.formatUsd(x.batchMonthly) + ' | ' + E.formatUsd(x.activeMonthly) + ' | ' + E.formatUsd(x.activeAnnual) + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Eval Judge Budget Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
