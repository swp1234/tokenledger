/* TokenLedger LLM Rate-Limit (RPM / TPM / Concurrency) & Multi-Provider Capacity Planner */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function populateModels() {
    var sel = document.getElementById('rlModel');
    if (!sel) return;
    sel.innerHTML = '';
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ')';
      if (m.id === 'claude-sonnet-4') o.selected = true;
      sel.appendChild(o);
    });
  }

  var lastPlan = null;

  function render() {
    var opts = {
      avgRpm: Number(document.getElementById('rlAvgRpm').value) || 120,
      burstMultiplier: Number(document.getElementById('rlBurst').value) || 2.5,
      inputTokens: Number(document.getElementById('rlInTok').value) || 2500,
      outputTokens: Number(document.getElementById('rlOutTok').value) || 600,
      avgLatencySec: Number(document.getElementById('rlLatency').value) || 4.5,
      cacheHitRate: Number(document.getElementById('rlCache').value) || 50
    };
    document.getElementById('rlBurstVal').textContent = opts.burstMultiplier.toFixed(1) + 'x';
    document.getElementById('rlCacheVal').textContent = opts.cacheHitRate + '%';
    var modelId = document.getElementById('rlModel').value;
    var res = E.calcRateLimitPlan(modelId, opts);
    lastPlan = { opts: opts, res: res };

    document.getElementById('kpiRlPeakTpm').textContent = E.formatInt(res.peakTpm) + ' TPM';
    document.getElementById('kpiRlPeakTpmSub').textContent = 'Output TPM: ' + E.formatInt(res.peakOutputTpm) + ' · Peak ' + E.formatInt(res.peakRpm) + ' RPM';
    document.getElementById('kpiRlConc').textContent = E.formatInt(res.peakConcurrency) + ' workers';
    document.getElementById('kpiRlConcSub').textContent = "Little's Law @ " + opts.avgLatencySec + 's latency';
    document.getElementById('kpiRlTier').textContent = res.recommendedTier.split(' (')[0];
    document.getElementById('kpiRlTierSub').textContent = res.recommendedTier;
    document.getElementById('kpiRlCost').textContent = E.formatUsd(res.estMonthlyCost) + '/mo';
    document.getElementById('kpiRlCostSub').textContent = res.backupProvidersNeeded + ' failover provider(s) advised';

    var pre = document.getElementById('rlConfigPreview');
    if (pre) {
      var cfg = {
        model: res.model.id,
        provider: res.model.provider,
        tokenBucket: {
          maxRpm: res.peakRpm,
          maxTpm: res.peakTpm,
          maxConcurrentStreams: res.peakConcurrency,
          retryBackoffMs: [500, 1500, 4000],
          jitter: true
        },
        failover: {
          triggerOnStatus: [429, 503, 529],
          backupEndpoints: res.backupProvidersNeeded,
          recommendedTier: res.recommendedTier
        }
      };
      pre.textContent = JSON.stringify(cfg, null, 2);
    }
  }

  function init() {
    populateModels();
    document.querySelectorAll('#rlModel,#rlAvgRpm,#rlBurst,#rlInTok,#rlOutTok,#rlLatency,#rlCache').forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    var btnCopy = document.getElementById('btnRlCopyJson');
    if (btnCopy) {
      btnCopy.addEventListener('click', function () {
        var pre = document.getElementById('rlConfigPreview');
        if (pre) UI.copyText(pre.textContent, 'Rate-limiter JSON config copied');
      });
    }
    var btnDl = document.getElementById('btnRlDownload');
    if (btnDl) {
      btnDl.addEventListener('click', function () {
        var pre = document.getElementById('rlConfigPreview');
        if (pre) UI.downloadFile('tokenledger-rate-limit-policy.json', pre.textContent, 'application/json');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
