/* TokenLedger Self-Hosted GPU (vLLM) vs Cloud API Break-Even Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    gpuPreset: 'h100-80gb-1x',
    modelId: 'claude-sonnet-4',
    gpuHourly: 2.85,
    hoursPerDay: 24,
    devopsMonthly: 450,
    tokPerSec: 340,
    avgUtilPct: 35,
    inputTokens: 2500,
    outputTokens: 600,
    dailyRequests: 8000,
    cacheHitRate: 50
  };

  function render() {
    document.getElementById('shUtilVal').textContent = state.avgUtilPct + '%';
    document.getElementById('shCacheVal').textContent = state.cacheHitRate + '%';

    var res = E.calcSelfHostVsApi(state.modelId, state);
    document.getElementById('kpiSelfHost').textContent = E.formatUsd(res.selfHostMonthly) + '/mo';
    document.getElementById('kpiSelfHostSub').textContent = 'GPU ' + E.formatUsd(res.gpuMonthly) + ' + Ops ' + E.formatUsd(res.devopsMonthly);
    document.getElementById('kpiCloudApi').textContent = E.formatUsd(res.apiMonthly) + '/mo';
    document.getElementById('kpiCloudApiSub').textContent = res.model.name + ' (' + state.cacheHitRate + '% cache)';
    document.getElementById('kpiBreakEven').textContent = E.formatInt(res.breakEvenDailyReqs) + '/day';
    document.getElementById('kpiBreakEvenSub').textContent = 'Exact daily reqs where self-hosting breaks even';

    var vEl = document.getElementById('kpiVerdict');
    var vSub = document.getElementById('kpiVerdictSub');
    if (res.verdict === 'needs-more-gpus') {
      vEl.textContent = 'Capacity Exceeded';
      vEl.className = 'kpi-val danger';
      vSub.textContent = 'Demand uses ' + Math.round(res.capacityHeadroomPct) + '% of single-node throughput — scale up GPUs';
    } else if (res.verdict === 'self-host-wins') {
      vEl.textContent = 'Self-Host Saves ' + E.formatUsd(res.monthlyDiff) + '/mo';
      vEl.className = 'kpi-val accent';
      vSub.textContent = 'Effective cost: ' + E.formatUsd(res.effectivePer1M) + '/1M blended tok (' + Math.round(res.capacityHeadroomPct) + '% GPU load)';
    } else if (res.verdict === 'hybrid-borderline') {
      vEl.textContent = 'Near Break-Even';
      vEl.className = 'kpi-val warn';
      vSub.textContent = 'Within ±15% — Cloud API avoids GPU ops overhead unless privacy mandates self-hosting';
    } else {
      vEl.textContent = 'Cloud API Saves ' + E.formatUsd(Math.abs(res.monthlyDiff)) + '/mo';
      vEl.className = 'kpi-val accent';
      vSub.textContent = 'Stay on API until volume passes ' + E.formatInt(res.breakEvenDailyReqs) + ' req/day';
    }
  }

  function init() {
    var gSel = document.getElementById('shGpuPreset');
    E.GPU_PRESETS.forEach(function (g) {
      var o = document.createElement('option');
      o.value = g.id;
      o.textContent = g.name + ' (~$' + g.hourlyUsd.toFixed(2) + '/hr · ' + g.tokPerSec + ' tok/s)';
      gSel.appendChild(o);
    });
    gSel.value = state.gpuPreset;
    gSel.addEventListener('change', function () {
      var found = E.GPU_PRESETS.find(function (x) { return x.id === gSel.value; });
      if (found) {
        state.gpuPreset = found.id;
        state.gpuHourly = found.hourlyUsd;
        state.tokPerSec = found.tokPerSec;
        document.getElementById('shHourly').value = state.gpuHourly;
        document.getElementById('shTps').value = state.tokPerSec;
      }
      render();
    });

    var mSel = document.getElementById('shModel');
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ')';
      mSel.appendChild(o);
    });
    mSel.value = state.modelId;
    mSel.addEventListener('change', function () { state.modelId = mSel.value; render(); });

    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    bindNum('shHourly', 'gpuHourly');
    bindNum('shHours', 'hoursPerDay');
    bindNum('shDevops', 'devopsMonthly');
    bindNum('shTps', 'tokPerSec');
    bindNum('shUtil', 'avgUtilPct');
    bindNum('shIn', 'inputTokens');
    bindNum('shOut', 'outputTokens');
    bindNum('shReqs', 'dailyRequests');
    bindNum('shCache', 'cacheHitRate');

    document.getElementById('btnShExport').addEventListener('click', function () {
      var res = E.calcSelfHostVsApi(state.modelId, state);
      UI.downloadFile('tokenledger-gpu-vs-api.json', JSON.stringify({ scenario: state, analysis: res }, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-gpu-vs-api.json');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
