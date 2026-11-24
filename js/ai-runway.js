/* TokenLedger AI Startup Monthly Burn & Runway Planner */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    cashOnHand: 250000,
    mrr: 8000,
    mrrGrowthPct: 12,
    monthlyAiSpend: 4500,
    monthlyCloudInfra: 1800,
    monthlyPayrollOps: 18000,
    aiScalesWithMrr: true
  };

  function render() {
    var res = E.calcAiRunway(state);
    var rEl = document.getElementById('kpiRunway');
    rEl.textContent = res.defaultAlive ? 'Default Alive' : (res.runwayMonths + ' months');
    rEl.className = 'kpi-val ' + (res.defaultAlive ? 'accent' : res.runwayMonths >= 15 ? 'warn' : 'danger');
    document.getElementById('kpiRunwaySub').textContent = res.defaultAlive
      ? 'Reaches cash-flow positive in Month ' + res.profitableMonth
      : 'Projected cash-zero in Month ' + res.runwayMonths;

    document.getElementById('kpiNetBurn').textContent = E.formatUsd(res.month1NetBurn) + '/mo';
    document.getElementById('kpiNetBurnSub').textContent = 'Gross burn ' + E.formatUsd(res.month1Burn) + ' minus ' + E.formatUsd(state.mrr) + ' MRR';

    document.getElementById('kpiAiShare').textContent = res.aiShareOfBurnPct.toFixed(1) + '%';
    document.getElementById('kpiAiShareSub').textContent = E.formatUsd(state.monthlyAiSpend) + '/mo LLM spend share of gross burn';

    document.getElementById('kpiBreakEvenMo').textContent = res.profitableMonth ? ('Month ' + res.profitableMonth) : '60+ mo';
    document.getElementById('kpiBreakEvenMoSub').textContent = 'At ' + state.mrrGrowthPct + '% MoM revenue growth';

    var tbody = document.getElementById('runwayTableBody');
    tbody.textContent = '';
    res.timeline.filter(function (row) { return row.month === 1 || row.month % 3 === 0; }).forEach(function (row) {
      var tr = document.createElement('tr');
      var cells = [
        'Month ' + row.month,
        E.formatUsd(row.mrr),
        E.formatUsd(row.aiSpend),
        E.formatUsd(row.totalBurn),
        E.formatUsd(row.netBurn),
        E.formatUsd(row.endingCash)
      ];
      cells.forEach(function (txt, idx) {
        var td = document.createElement('td');
        if (idx > 0) td.className = 'num';
        td.textContent = txt;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function init() {
    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    bindNum('rwCash', 'cashOnHand');
    bindNum('rwMrr', 'mrr');
    bindNum('rwGrowth', 'mrrGrowthPct');
    bindNum('rwAi', 'monthlyAiSpend');
    bindNum('rwCloud', 'monthlyCloudInfra');
    bindNum('rwOps', 'monthlyPayrollOps');
    var chk = document.getElementById('rwScaleAi');
    chk.checked = state.aiScalesWithMrr;
    chk.addEventListener('change', function () { state.aiScalesWithMrr = chk.checked; render(); });

    document.getElementById('btnRwExport').addEventListener('click', function () {
      var res = E.calcAiRunway(state);
      UI.downloadFile('tokenledger-ai-runway.json', JSON.stringify({ scenario: state, projection: res }, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-ai-runway.json');
    });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
