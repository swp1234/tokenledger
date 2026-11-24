/* TokenLedger AI SaaS Gross Margin & Break-Even Power-User Simulator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    modelId: 'claude-sonnet-4',
    price: 29,
    seats: 500,
    reqPerSeatMonth: 250,
    inputTokens: 2800,
    outputTokens: 650,
    cacheHitRate: 60,
    fixedInfraPerSeat: 0.45
  };

  function render() {
    document.getElementById('saasCacheVal').textContent = state.cacheHitRate + '%';
    var res = E.calcSaasMargin(state.modelId, state);

    var mEl = document.getElementById('kpiMargin');
    mEl.textContent = res.grossMarginPct.toFixed(1) + '%';
    mEl.className = 'kpi-val ' + (res.health === 'healthy' ? 'accent' : res.health === 'watch' ? 'warn' : 'danger');
    document.getElementById('kpiMarginSub').textContent =
      res.health === 'healthy' ? 'SaaS-grade margin (>=75%)' : res.health === 'watch' ? 'Compressed margin (55-74%)' : 'Margin risk (<55% — add caching or tiering)';

    document.getElementById('kpiCogs').textContent = E.formatUsd(res.aiCogsPerSeat) + '/seat';
    document.getElementById('kpiCogsSub').textContent = 'Total COGS ' + E.formatUsd(res.totalCogsPerSeat) + ' (incl. ' + E.formatUsd(res.paymentFee) + ' fee)';

    document.getElementById('kpiProfit').textContent = E.formatUsd(res.totalMonthlyGrossProfit) + '/mo';
    document.getElementById('kpiProfitSub').textContent = 'On ' + E.formatUsd(res.totalMonthlyRevenue) + ' MRR (' + E.formatInt(state.seats) + ' seats)';

    document.getElementById('kpiCap').textContent = E.formatInt(res.breakEvenReqPerSeat) + ' reqs';
    document.getElementById('kpiCapSub').textContent = 'Hard break-even cap/seat/mo (' + E.formatUsd(res.costPerRequest) + '/req)';

    // Compare across 6 key models for instant founder pricing table
    var compareIds = ['claude-opus-4', 'claude-sonnet-4', 'gpt-5', 'gpt-4.1', 'gemini-2.5-flash', 'gpt-5-mini', 'deepseek-v3'];
    var tbody = document.getElementById('saasCompareBody');
    tbody.textContent = '';
    compareIds.forEach(function (id) {
      var r = E.calcSaasMargin(id, state);
      var tr = document.createElement('tr');
      var cells = [
        r.model.name,
        E.formatUsd(r.aiCogsPerSeat),
        r.grossMarginPct.toFixed(1) + '%',
        E.formatInt(r.breakEvenReqPerSeat) + ' req/mo',
        E.formatUsd(r.totalMonthlyGrossProfit) + '/mo'
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
    var sel = document.getElementById('saasModel');
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ')';
      sel.appendChild(o);
    });
    sel.value = state.modelId;
    sel.addEventListener('change', function () { state.modelId = sel.value; render(); });

    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    bindNum('saasPrice', 'price');
    bindNum('saasSeats', 'seats');
    bindNum('saasReqs', 'reqPerSeatMonth');
    bindNum('saasIn', 'inputTokens');
    bindNum('saasOut', 'outputTokens');
    bindNum('saasCache', 'cacheHitRate');
    bindNum('saasInfra', 'fixedInfraPerSeat');

    document.getElementById('btnSaasPrint').addEventListener('click', function () { window.print(); });
    document.getElementById('btnSaasJson').addEventListener('click', function () {
      var res = E.calcSaasMargin(state.modelId, state);
      UI.downloadFile('tokenledger-saas-margin.json', JSON.stringify({ scenario: state, summary: res }, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-saas-margin.json');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
