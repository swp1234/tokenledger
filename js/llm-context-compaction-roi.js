/* TokenLedger Long-Session Context Compaction & Rolling Summary ROI Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function initSelect() {
    var sel = $('cpModel');
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

  function render() {
    $('cpCacheVal').textContent = ($('cpCache').value || '80') + '%';
    var res = E.calcContextCompactionRoi({
      modelId: $('cpModel').value || 'claude-sonnet-4.5',
      turns: Number($('cpTurns').value) || 30,
      systemTokens: Number($('cpSys').value) || 4000,
      growthPerTurn: Number($('cpGrow').value) || 2200,
      outputPerTurn: Number($('cpOut').value) || 550,
      compactAtTokens: Number($('cpThreshold').value) || 32000,
      summarySize: Number($('cpSummary').value) || 2500,
      sessionsPerDay: Number($('cpSess').value) || 300,
      cacheHitRate: Number($('cpCache').value)
    });

    $('kpiCpNaive').textContent = E.formatUsd(res.naive.monthly) + '/mo';
    $('kpiCpNaiveSub').textContent = 'Peak ' + Math.round(res.naive.peakCtx / 1000) + 'K ctx (' + E.formatUsd(res.naive.perSession) + '/sess)';
    $('kpiCpHybrid').textContent = E.formatUsd(res.hybrid.monthly) + '/mo';
    $('kpiCpHybridSub').textContent = '-' + res.savePct.toFixed(1) + '% (' + res.hybrid.compactions + ' compactions/sess)';
    $('kpiCpPeak').textContent = Math.round(res.hybrid.peakCtx / 1000) + 'K tok';
    $('kpiCpPeakSub').textContent = 'Down from ' + Math.round(res.naive.peakCtx / 1000) + 'K unbounded';
    $('kpiCpSaveYr').textContent = E.formatUsd(res.annualSaved) + '/yr';
    $('kpiCpSaveYrSub').textContent = 'Annual savings via truncation + compaction';

    var body = $('cpTableBody');
    if (body) {
      body.innerHTML = '';
      res.strategies.forEach(function (s, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + s.name + '</strong>' + (idx === 3 ? ' <span class="tl-badge best">Best ROI</span>' : '') + '</td>' +
          '<td class="num">' + Math.round(s.peakCtx / 1000) + 'K</td>' +
          '<td class="num">' + s.compactions + '</td>' +
          '<td class="num">' + E.formatUsd(s.perSession) + '</td>' +
          '<td class="num"><strong>' + E.formatUsd(s.monthly) + '/mo</strong></td>' +
          '<td class="num">' + (s.savePct > 0 ? '-' + s.savePct.toFixed(1) + '%' : 'Baseline') + '</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    initSelect();
    ['cpModel', 'cpTurns', 'cpSys', 'cpGrow', 'cpOut', 'cpThreshold', 'cpSummary', 'cpSess', 'cpCache'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnCpCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## Long-Session Context Compaction ROI (TokenLedger)',
          'Model: **' + r.model.name + '** · Turns/Session: **' + r.turns + '** · Annual Savings: **' + E.formatUsd(r.annualSaved) + '/yr**',
          '',
          '| Strategy | Peak Ctx | Compactions | Cost/Session | Monthly | Savings |',
          '|---|---:|---:|---:|---:|---:|'
        ].concat(r.strategies.map(function (s) {
          return '| ' + s.name + ' | ' + Math.round(s.peakCtx / 1000) + 'K | ' + s.compactions + ' | ' + E.formatUsd(s.perSession) + ' | ' + E.formatUsd(s.monthly) + '/mo | ' + (s.savePct > 0 ? '-' + s.savePct.toFixed(1) + '%' : 'Baseline') + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Context Compaction Markdown copied');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
