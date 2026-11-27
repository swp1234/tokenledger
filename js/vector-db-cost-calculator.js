/* TokenLedger Vector Database Cloud Cost Comparator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('vdbEmbed');
    if (sel && !sel.options.length) {
      E.EMBEDDINGS.forEach(function (em) {
        var o = document.createElement('option');
        o.value = em.id;
        o.textContent = em.name + ' ($' + em.per1M + '/1M · ' + em.dims + 'd)';
        if (em.id === 'text-embedding-3-small') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      vectors: Number($('vdbVectors').value) || 5000000,
      dims: Number($('vdbDims').value) || 1536,
      quant: $('vdbQuant').value || 'fp32',
      monthlyQueries: Number($('vdbQueries').value) || 3000000,
      monthlyUpserts: Number($('vdbUpserts').value) || 500000,
      embeddingId: $('vdbEmbed').value || 'text-embedding-3-small'
    };
  }

  function render() {
    var res = E.calcVectorDbTco(getOpts());
    $('kpiVdbBest').textContent = E.formatUsd(res.cheapest.totalMonthly) + '/mo';
    $('kpiVdbBestSub').textContent = res.cheapest.name + ' (lowest monthly)';
    $('kpiVdbRam').textContent = res.indexGb.toFixed(1) + ' GB';
    $('kpiVdbRamSub').textContent = res.rawGb.toFixed(1) + ' GB raw + HNSW overhead (' + res.quant.toUpperCase() + ')';
    $('kpiVdbIngest').textContent = E.formatUsd(res.oneTimeEmbedUsd);
    $('kpiVdbIngestSub').textContent = res.embedding.name + ' initial backfill';
    $('kpiVdbSpread').textContent = E.formatUsd(Math.max(0, res.priciest.annualTco - res.cheapest.annualTco)) + '/yr';
    $('kpiVdbSpreadSub').textContent = '12-month spread vs. ' + res.priciest.name;

    var body = $('vdbTableBody');
    if (body) {
      body.innerHTML = '';
      res.rows.forEach(function (r, idx) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + r.name + '</strong>' + (idx === 0 ? ' <span class="tl-badge best">Lowest</span>' : '') + '<div class="kpi-sub">' + r.notes + '</div></td>' +
          '<td class="num">' + r.billedGb.toFixed(1) + ' GB</td>' +
          '<td class="num">' + E.formatUsd(r.storageCost) + '</td>' +
          '<td class="num">' + E.formatUsd(r.queryCost + r.writeCost) + '</td>' +
          '<td class="num"><strong>' + E.formatUsd(r.totalMonthly) + '/mo</strong></td>' +
          '<td class="num">' + E.formatUsd(r.annualTco) + '/yr</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['vdbVectors', 'vdbDims', 'vdbQuant', 'vdbQueries', 'vdbUpserts', 'vdbEmbed'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnVdbCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## Vector Database 12-Month TCO Report (TokenLedger)',
          'Corpus: **' + E.formatInt(r.vectors) + ' vectors × ' + r.dims + 'd (' + r.quant.toUpperCase() + ')** · Index Footprint: **' + r.indexGb.toFixed(1) + ' GB**',
          '',
          '| Provider | Billed Footprint | Storage/Mo | Query+Write/Mo | Total/Mo | 12-Mo TCO |',
          '|---|---:|---:|---:|---:|---:|'
        ].concat(r.rows.map(function (x) {
          return '| ' + x.name + ' | ' + x.billedGb.toFixed(1) + ' GB | ' + E.formatUsd(x.storageCost) + ' | ' + E.formatUsd(x.queryCost + x.writeCost) + ' | ' + E.formatUsd(x.totalMonthly) + ' | ' + E.formatUsd(x.annualTco) + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Vector DB TCO Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
