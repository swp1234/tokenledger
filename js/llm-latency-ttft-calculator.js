/* TokenLedger LLM Latency, TTFT & Streaming UX Speed Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('ltProfile');
    if (sel && !sel.options.length) {
      E.LATENCY_PROFILES.forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.name + ' (' + p.tokPerSec + ' tok/s · ' + p.ttftMs + 'ms TTFT)';
        if (p.id === 'gpt-5-mini-lat') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      profileId: $('ltProfile').value,
      inputTokens: Number($('ltInTok').value) || 0,
      outputTokens: Number($('ltOutTok').value) || 0,
      networkRttMs: Number($('ltRtt').value) || 0,
      slaTargetSec: Number($('ltSla').value) || 5.0
    };
  }

  function render() {
    var o = getOpts();
    var res = E.calcLatencyBudget(o);
    var sel = res.selected;

    $('kpiLtTtft').textContent = sel.ttftSec.toFixed(2) + 's';
    $('kpiLtTtftSub').textContent = 'Time to First Token (' + sel.profile.provider + ')';
    $('kpiLtTotal').textContent = sel.totalSec.toFixed(2) + 's';
    $('kpiLtTotalSub').textContent = 'UX Band: ' + sel.uxBand + (sel.meetsSla ? ' · Meets SLA' : ' · Exceeds SLA');
    $('kpiLtFastest').textContent = res.fastest.totalSec.toFixed(2) + 's';
    $('kpiLtFastestSub').textContent = res.fastest.profile.name;
    $('kpiLtPass').textContent = res.passingCount + ' / ' + res.rows.length;
    $('kpiLtPassSub').textContent = 'Endpoints under ' + res.slaTargetSec.toFixed(1) + 's SLA';

    var body = $('ltTableBody');
    if (body) {
      body.innerHTML = '';
      res.rows.forEach(function (r) {
        var tr = document.createElement('tr');
        var badge = r.meetsSla ? '<span class="tl-badge best">PASS SLA</span>' : '<span class="tl-badge">OVER SLA</span>';
        tr.innerHTML = '<td><strong>' + r.profile.name + '</strong>' + (r.profile.id === sel.profile.id ? ' <span class="tl-badge best">Selected</span>' : '') + '<div class="kpi-sub">' + r.profile.tokPerSec + ' tok/s · ' + r.uxBand + '</div></td>' +
          '<td class="num">' + r.ttftSec.toFixed(2) + 's</td>' +
          '<td class="num">' + r.genSec.toFixed(2) + 's</td>' +
          '<td class="num"><strong>' + r.totalSec.toFixed(2) + 's</strong></td>' +
          '<td class="num">' + E.formatUsd(r.costPer10k) + '</td>' +
          '<td>' + badge + '</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['ltProfile', 'ltInTok', 'ltOutTok', 'ltRtt', 'ltSla'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnLtCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var o = getOpts();
        var r = render();
        var s = r.selected;
        var md = [
          '## LLM Streaming Latency & SLA Estimate (TokenLedger)',
          '- **Workload**: ' + E.formatInt(o.inputTokens) + ' input tok -> ' + E.formatInt(o.outputTokens) + ' output tok (Network RTT: ' + o.networkRttMs + 'ms, SLA: ' + o.slaTargetSec + 's)',
          '- **Selected Endpoint**: ' + s.profile.name + ' — TTFT **' + s.ttftSec.toFixed(2) + 's**, Generation **' + s.genSec.toFixed(2) + 's**, Total **' + s.totalSec.toFixed(2) + 's** (' + s.uxBand + ')',
          '- **Fastest Alternative**: ' + r.fastest.profile.name + ' (**' + r.fastest.totalSec.toFixed(2) + 's** total, ' + E.formatUsd(r.fastest.costPer10k) + ' per 10K reqs)',
          '- **SLA Compliance**: ' + r.passingCount + '/' + r.rows.length + ' endpoints pass <' + o.slaTargetSec + 's SLA'
        ].join('\n');
        UI.copyText(md, 'Latency SLA Markdown copied');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
