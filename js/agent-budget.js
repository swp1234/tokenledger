/* TokenLedger AI Agent Loop & Quadratic Token Snowball Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    modelId: 'claude-sonnet-4',
    turns: 14,
    systemTokens: 3200,
    growthPerTurn: 1400,
    outputPerTurn: 450,
    runsPerDay: 300,
    cacheHitRate: 85,
    windowTurns: 5
  };

  function render() {
    document.getElementById('turnsVal').textContent = state.turns + ' turns';
    document.getElementById('cacheVal').textContent = state.cacheHitRate + '%';
    document.getElementById('winVal').textContent = state.windowTurns + ' turns';

    var res = E.calcAgentBurn(state.modelId, state);
    document.getElementById('kpiNaive').textContent = E.formatUsd(res.naiveMonthly) + '/mo';
    document.getElementById('kpiNaiveSub').textContent = E.formatUsd(res.naivePerRun) + '/run · ' + E.formatInt(res.naiveInputTokens) + ' in tok';
    document.getElementById('kpiCached').textContent = E.formatUsd(res.cachedMonthly) + '/mo';
    document.getElementById('kpiCachedSub').textContent = 'Saves ' + Math.round(res.cacheSavingsPct) + '% (' + E.formatUsd(res.cachedPerRun) + '/run)';
    document.getElementById('kpiWindow').textContent = E.formatUsd(res.windowMonthly) + '/mo';
    document.getElementById('kpiWindowSub').textContent = 'Saves ' + Math.round(res.windowSavingsPct) + '% (' + E.formatUsd(res.windowPerRun) + '/run)';
    document.getElementById('kpiMult').textContent = res.snowballMultiplier.toFixed(1) + 'x';
    document.getElementById('kpiMultSub').textContent = 'Context snowball vs turn-1 base';

    var chart = document.getElementById('turnChart');
    chart.textContent = '';
    var maxCost = res.breakdown.reduce(function (m, b) { return Math.max(m, b.naiveTurnCost); }, 0.00001);
    res.breakdown.forEach(function (b) {
      var row = document.createElement('div');
      row.className = 'tl-chart-row';
      var lbl = document.createElement('span');
      lbl.className = 'num';
      lbl.textContent = 'Turn ' + b.turn;
      var wrap = document.createElement('div');
      wrap.className = 'tl-chart-bar-wrap';
      var barN = document.createElement('div');
      barN.className = 'tl-chart-bar-naive';
      barN.style.width = Math.max(3, (b.naiveTurnCost / maxCost) * 100).toFixed(1) + '%';
      var barC = document.createElement('div');
      barC.className = 'tl-chart-bar-cached';
      barC.style.width = Math.max(2, (b.cachedTurnCost / maxCost) * 100).toFixed(1) + '%';
      wrap.appendChild(barN);
      wrap.appendChild(barC);
      var val = document.createElement('span');
      val.className = 'num';
      val.style.textAlign = 'right';
      val.textContent = E.formatUsd(b.naiveTurnCost);
      row.appendChild(lbl);
      row.appendChild(wrap);
      row.appendChild(val);
      chart.appendChild(row);
    });
  }

  function init() {
    var sel = document.getElementById('agentModel');
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.output + ')';
      sel.appendChild(o);
    });
    sel.value = state.modelId;

    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    sel.addEventListener('change', function () { state.modelId = sel.value; render(); });
    bindNum('agentTurns', 'turns');
    bindNum('sysTokens', 'systemTokens');
    bindNum('toolGrowth', 'growthPerTurn');
    bindNum('outPerTurn', 'outputPerTurn');
    bindNum('runsPerDay', 'runsPerDay');
    bindNum('agentCache', 'cacheHitRate');
    bindNum('winTurns', 'windowTurns');

    document.getElementById('btnExportAgent').addEventListener('click', function () {
      var res = E.calcAgentBurn(state.modelId, state);
      var csv = UI.rowsToCsv(
        ['Turn', 'Cumulative_Input_Tokens', 'Naive_Turn_USD', 'Cached_Turn_USD', 'Sliding_Window_Turn_USD'],
        res.breakdown.map(function (b) { return [b.turn, b.inputTokens, b.naiveTurnCost.toFixed(6), b.cachedTurnCost.toFixed(6), b.windowTurnCost.toFixed(6)]; })
      );
      UI.downloadFile('tokenledger-agent-burn.csv', csv, 'text/csv;charset=utf-8');
      UI.showToast('Downloaded tokenledger-agent-burn.csv');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
