/* TokenLedger Multi-Agent Orchestration & Swarm Cost Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelect(id, defId) {
    var sel = $(id);
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.input + '/$' + m.output + ')';
        if (m.id === defId) o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      plannerModelId: $('swPlanner').value || 'claude-opus-4.5',
      workerModelId: $('swWorker').value || 'gemini-2.5-flash',
      criticModelId: $('swCritic').value || 'gpt-5-mini',
      workerCount: Number($('swWorkers').value) || 4,
      handoffsPerRun: Number($('swHandoffs').value) || 3,
      avgContextPerHop: Number($('swCtx').value) || 6000,
      outputPerHop: Number($('swOut').value) || 650,
      runsPerDay: Number($('swRuns').value) || 250,
      cacheHitRate: Number($('swCache').value)
    };
  }

  function render() {
    $('swCacheVal').textContent = ($('swCache').value || '75') + '%';
    var res = E.calcMultiAgentSwarmCost(getOpts());

    $('kpiSwAllFront').textContent = E.formatUsd(res.allFrontierMonthly) + '/mo';
    $('kpiSwAllFrontSub').textContent = res.planner.name + ' across all ' + res.totalCallsPerRun + ' calls/run';
    $('kpiSwTiered').textContent = E.formatUsd(res.tieredMonthly) + '/mo';
    $('kpiSwTieredSub').textContent = '-' + res.tieredSavePct.toFixed(1) + '% vs. single-tier (' + E.formatUsd(res.tieredPerRun) + '/run)';
    $('kpiSwCompact').textContent = E.formatUsd(res.compactMonthly) + '/mo';
    $('kpiSwCompactSub').textContent = '-' + res.compactSavePct.toFixed(1) + '% with compact handoff state';
    $('kpiSwSaveYr').textContent = E.formatUsd(res.annualSavedCompact) + '/yr';
    $('kpiSwSaveYrSub').textContent = 'Annual savings vs. all-frontier swarm';

    var body = $('swTableBody');
    if (body) {
      body.innerHTML = '';
      res.architectures.forEach(function (a, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + a.name + '</strong>' + (idx === 2 ? ' <span class="tl-badge best">Optimal</span>' : '') + '</td>' +
          '<td class="num">' + a.callsPerRun + '</td>' +
          '<td class="num">' + E.formatUsd(a.perRun) + '</td>' +
          '<td class="num"><strong>' + E.formatUsd(a.monthly) + '/mo</strong></td>' +
          '<td class="num">' + E.formatUsd(a.annual) + '/yr</td>' +
          '<td class="num">' + (a.savePct > 0 ? '-' + a.savePct.toFixed(1) + '%' : 'Baseline') + '</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelect('swPlanner', 'claude-opus-4.5');
    populateSelect('swWorker', 'gemini-2.5-flash');
    populateSelect('swCritic', 'gpt-5-mini');
    ['swPlanner', 'swWorker', 'swCritic', 'swWorkers', 'swHandoffs', 'swCtx', 'swOut', 'swRuns', 'swCache'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnSwCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## Multi-Agent Swarm & Orchestration Cost Architecture (TokenLedger)',
          'Planner: **' + r.planner.name + '** · Workers: **' + r.worker.name + '** · Critic: **' + r.critic.name + '** · Calls/Run: **' + r.totalCallsPerRun + '**',
          '',
          '| Architecture | Calls/Run | Cost/Run | Monthly | Annual | Savings |',
          '|---|---:|---:|---:|---:|---:|'
        ].concat(r.architectures.map(function (a) {
          return '| ' + a.name + ' | ' + a.callsPerRun + ' | ' + E.formatUsd(a.perRun) + ' | ' + E.formatUsd(a.monthly) + ' | ' + E.formatUsd(a.annual) + ' | ' + (a.savePct > 0 ? '-' + a.savePct.toFixed(1) + '%' : 'Baseline') + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Multi-Agent Swarm Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
