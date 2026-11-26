/* TokenLedger LLM GPU VRAM & KV-Cache Quantization Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function populateModels() {
    var sel = document.getElementById('vrModel');
    if (!sel) return;
    sel.innerHTML = '';
    E.VRAM_MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.paramsB + 'B · ' + m.layers + 'L)';
      if (m.id === 'llama-3.3-70b') o.selected = true;
      sel.appendChild(o);
    });
  }

  var lastRes = null;

  function render() {
    var modelId = document.getElementById('vrModel').value;
    var preset = E.VRAM_MODELS.find(function (x) { return x.id === modelId; }) || E.VRAM_MODELS[4];
    var opts = {
      modelId: modelId,
      paramsB: preset.paramsB,
      layers: preset.layers,
      kvHeads: preset.kvHeads,
      headDim: preset.headDim,
      quant: document.getElementById('vrQuant').value,
      contextLen: Number(document.getElementById('vrCtx').value) || 8192,
      batchSize: Number(document.getElementById('vrBatch').value) || 4,
      kvFp8: document.getElementById('vrKvFp8').checked
    };
    var res = E.calcGpuVram(opts);
    lastRes = { opts: opts, res: res };

    document.getElementById('kpiVrTotal').textContent = res.totalVramGB.toFixed(1) + ' GB';
    document.getElementById('kpiVrTotalSub').textContent = res.quantLabel + ' · Batch ' + opts.batchSize;
    document.getElementById('kpiVrWeights').textContent = res.weightsGB.toFixed(1) + ' GB';
    document.getElementById('kpiVrWeightsSub').textContent = preset.paramsB + 'B parameters';
    document.getElementById('kpiVrKv').textContent = res.kvCacheGB.toFixed(1) + ' GB';
    document.getElementById('kpiVrKvSub').textContent = E.formatInt(opts.contextLen) + ' ctx · ' + (opts.kvFp8 ? 'FP8 KV' : 'FP16 KV');
    document.getElementById('kpiVrHw').textContent = res.recommendedHw.name.split(' (')[0];
    document.getElementById('kpiVrHwSub').textContent = E.formatUsd(res.recommendedHw.hourly) + '/hr · ~' + E.formatUsd(res.estCloudMonthly) + '/mo';

    var tb = document.getElementById('vrMatrixBody');
    if (tb) {
      var quants = ['fp16', 'fp8', 'q6k', 'q4km', 'q3km'];
      tb.innerHTML = quants.map(function (q) {
        var r = E.calcGpuVram(Object.assign({}, opts, { quant: q }));
        var active = q === opts.quant ? ' <span class="tl-badge best">Selected</span>' : '';
        return '<tr><td><strong>' + r.quantLabel + '</strong>' + active + '</td>' +
          '<td class="num">' + r.weightsGB.toFixed(1) + ' GB</td>' +
          '<td class="num">' + r.kvCacheGB.toFixed(1) + ' GB</td>' +
          '<td class="num"><strong>' + r.totalVramGB.toFixed(1) + ' GB</strong></td>' +
          '<td>' + r.recommendedHw.name + '</td>' +
          '<td class="num">' + E.formatUsd(r.estCloudMonthly) + '/mo</td></tr>';
      }).join('');
    }
  }

  function init() {
    populateModels();
    document.querySelectorAll('#vrModel,#vrQuant,#vrCtx,#vrBatch,#vrKvFp8').forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    var btn = document.getElementById('btnVrCopyMd');
    if (btn) {
      btn.addEventListener('click', function () {
        if (!lastRes) return;
        var r = lastRes.res, o = lastRes.opts;
        var md = [
          '### GPU VRAM Sizing: ' + r.preset.name + ' (' + r.quantLabel + ')',
          '- **Weights VRAM**: ' + r.weightsGB.toFixed(1) + ' GB',
          '- **KV-Cache VRAM** (' + E.formatInt(o.contextLen) + ' ctx × batch ' + o.batchSize + '): ' + r.kvCacheGB.toFixed(1) + ' GB',
          '- **Total Required VRAM** (incl. 12% activation overhead): **' + r.totalVramGB.toFixed(1) + ' GB**',
          '- **Recommended Hardware**: ' + r.recommendedHw.name + ' (~' + E.formatUsd(r.estCloudMonthly) + '/mo)',
          '',
          '_Generated locally with [TokenLedger VRAM Calculator](https://tokenledger-8x7.pages.dev/tools/gpu-vram-calculator.html)_'
        ].join('\n');
        UI.copyText(md, 'Copied VRAM sizing Markdown!');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
