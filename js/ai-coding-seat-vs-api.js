/* TokenLedger AI Coding Assistant Seat vs BYOK API Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('csModel');
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.output + ')';
        if (m.id === 'claude-sonnet-4.5') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      modelId: $('csModel').value || 'claude-sonnet-4.5',
      devs: Number($('csDevs').value) || 25,
      workdaysPerMonth: Number($('csDays').value) || 21,
      sessionsPerDevDay: Number($('csSessions').value) || 12,
      inputPerSession: Number($('csInTok').value) || 24000,
      outputPerSession: Number($('csOutTok').value) || 1600,
      cacheHitRate: Number($('csCache').value) || 85
    };
  }

  function render() {
    var o = getOpts();
    $('csCacheVal').textContent = o.cacheHitRate + '%';
    var res = E.calcCodingSeatVsApi(o);

    $('kpiCsApiDev').textContent = E.formatUsd(res.apiPerDevMonthly) + '/dev';
    $('kpiCsApiDevSub').textContent = res.model.name + ' (' + E.formatUsd(res.perSessionCost) + '/session)';
    $('kpiCsApiTeam').textContent = E.formatUsd(res.apiTeamMonthly) + '/mo';
    $('kpiCsApiTeamSub').textContent = E.formatUsd(res.apiTeamAnnual) + '/yr for ' + res.devs + ' devs';
    $('kpiCsWinner').textContent = res.overallWinner;
    $('kpiCsWinnerSub').textContent = 'Lowest monthly total at current usage';
    var cursorTeam = res.plans.find(function (p) { return p.id === 'cursor-business'; }) || res.plans[0];
    $('kpiCsBreakEven').textContent = cursorTeam.breakEvenSessionsDay.toFixed(1) + ' sess/d';
    $('kpiCsBreakEvenSub').textContent = 'Break-even vs ' + cursorTeam.name + ' ($' + cursorTeam.perSeatMo + ')';

    var body = $('csTableBody');
    if (body) {
      body.innerHTML = '';
      res.plans.forEach(function (p) {
        var tr = document.createElement('tr');
        var badge = p.winner === 'seat'
          ? '<span class="tl-badge best">Seat Saves ' + E.formatUsd(Math.abs(p.deltaVsApi)) + '/mo</span>'
          : '<span class="tl-badge warn">BYOK Saves ' + E.formatUsd(Math.abs(p.deltaVsApi)) + '/mo</span>';
        tr.innerHTML = '<td><strong>' + p.name + '</strong><div class="kpi-sub">' + p.includedNote + '</div></td>' +
          '<td class="num">' + E.formatUsd(p.perSeatMo) + '/seat</td>' +
          '<td class="num"><strong>' + E.formatUsd(p.teamMonthly) + '/mo</strong></td>' +
          '<td class="num">' + E.formatUsd(res.apiTeamMonthly) + '/mo</td>' +
          '<td class="num">' + p.breakEvenSessionsDay.toFixed(1) + ' /day</td>' +
          '<td>' + badge + '</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['csModel', 'csDevs', 'csDays', 'csSessions', 'csInTok', 'csOutTok', 'csCache'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnCsCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## AI Coding Seat vs. BYOK API Budget Memo (TokenLedger)',
          'Team: **' + r.devs + ' developers** · BYOK Model: **' + r.model.name + '** · BYOK Team Spend: **' + E.formatUsd(r.apiTeamMonthly) + '/mo** (' + E.formatUsd(r.apiPerDevMonthly) + '/dev)',
          '',
          '| Seat Plan | Seat Price | Team Seat/Mo | BYOK API/Mo | Break-Even Sessions/Day | Recommendation |',
          '|---|---:|---:|---:|---:|---|'
        ].concat(r.plans.map(function (p) {
          return '| ' + p.name + ' | ' + E.formatUsd(p.perSeatMo) + ' | ' + E.formatUsd(p.teamMonthly) + ' | ' + E.formatUsd(r.apiTeamMonthly) + ' | ' + p.breakEvenSessionsDay.toFixed(1) + ' | ' + (p.winner === 'seat' ? 'Seat cheaper' : 'BYOK cheaper') + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Coding Seat vs BYOK Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
