/* TokenLedger Enterprise Provisioned Throughput (PTU / GSU) vs PayGo Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function initSelect() {
    var sel = $('ptuModel');
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.input + '/$' + m.output + ')';
        if (m.id === 'gpt-5') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function render() {
    $('ptuUtilVal').textContent = ($('ptuUtil').value || '48') + '%';
    $('ptuCacheVal').textContent = ($('ptuCache').value || '50') + '%';
    var res = E.calcPtuVsPaygo({
      modelId: $('ptuModel').value || 'gpt-5',
      ptuCount: Number($('ptuUnits').value) || 100,
      ptuUnitMonthly: Number($('ptuUnitCost').value) || 200,
      tpmPerPtu: Number($('ptuTpm').value) || 2500,
      avgUtilPct: Number($('ptuUtil').value),
      peakToAvg: Number($('ptuPeak').value) || 2.2,
      outputRatioPct: Number($('ptuOutRatio').value) || 22,
      cacheHitRate: Number($('ptuCache').value)
    });

    $('kpiPtuPaygo').textContent = E.formatUsd(res.paygoMonthly) + '/mo';
    $('kpiPtuPaygoSub').textContent = res.monthlyTokensB.toFixed(2) + 'B tokens/mo @ avg util';
    $('kpiPtuFull').textContent = E.formatUsd(res.ptuFullMonthly) + '/mo';
    $('kpiPtuFullSub').textContent = E.formatInt(res.reservedCapacityTpm) + ' reserved TPM';
    $('kpiPtuBe').textContent = res.breakEvenUtilPct.toFixed(1) + '%';
    $('kpiPtuBeSub').textContent = 'Min utilization for 100% PTU win';
    $('kpiPtuBest').textContent = E.formatUsd(res.winner.monthly) + '/mo';
    $('kpiPtuBestSub').textContent = 'Winner: ' + res.winner.name.split(' (')[0];

    var body = $('ptuTableBody');
    if (body) {
      body.innerHTML = '';
      res.options.forEach(function (o) {
        var isWin = o.name === res.winner.name;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + o.name + '</strong>' + (isWin ? ' <span class="tl-badge best">Lowest TCO</span>' : '') + '</td>' +
          '<td class="num">' + o.ptus + '</td>' +
          '<td class="num"><strong>' + E.formatUsd(o.monthly) + '/mo</strong></td>' +
          '<td class="num">' + E.formatUsd(o.annual) + '/yr</td>' +
          '<td>' + o.sla + '</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    initSelect();
    ['ptuModel', 'ptuUnits', 'ptuUnitCost', 'ptuTpm', 'ptuUtil', 'ptuPeak', 'ptuOutRatio', 'ptuCache'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnPtuCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## Enterprise PTU / GSU vs. Pay-As-You-Go Analysis (TokenLedger)',
          'Model: **' + r.model.name + '** · Break-Even Util: **' + r.breakEvenUtilPct.toFixed(1) + '%** · Recommended: **' + r.winner.name + '**',
          '',
          '| Capacity Model | PTUs | Monthly | Annual | SLA Profile |',
          '|---|---:|---:|---:|---|'
        ].concat(r.options.map(function (o) {
          return '| ' + o.name + ' | ' + o.ptus + ' | ' + E.formatUsd(o.monthly) + '/mo | ' + E.formatUsd(o.annual) + '/yr | ' + o.sla + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Enterprise PTU vs PayGo Markdown copied');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
