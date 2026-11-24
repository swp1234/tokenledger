/* TokenLedger Vision, PDF OCR, Realtime Voice & Image Generation Cost Studio */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    visionModel: 'gemini-2.5-flash-vision',
    voiceModel: 'gemini-live-flash',
    imageModel: 'imagen-3',
    dailyImages: 1500,
    visionOutTok: 250,
    dailyVoiceMins: 600,
    dailyGenImages: 200
  };

  function render() {
    var res = E.calcMultimodalBudget(state);
    document.getElementById('kpiMmVision').textContent = E.formatUsd(res.visionMonthly) + '/mo';
    document.getElementById('kpiMmVisionSub').textContent = res.visionModel.name + ' (' + res.visionModel.tokensPerImage + ' tok/img)';
    document.getElementById('kpiMmVoice').textContent = E.formatUsd(res.voiceMonthly) + '/mo';
    document.getElementById('kpiMmVoiceSub').textContent = res.voiceModel.name + ' ($' + res.voiceModel.usdPerMin.toFixed(3) + '/min)';
    document.getElementById('kpiMmGen').textContent = E.formatUsd(res.imageGenMonthly) + '/mo';
    document.getElementById('kpiMmGenSub').textContent = res.imageModel.name + ' ($' + res.imageModel.usdPerImage.toFixed(3) + '/img)';
    document.getElementById('kpiMmTotal').textContent = E.formatUsd(res.totalMonthly) + '/mo';
    document.getElementById('kpiMmTotalSub').textContent = E.formatUsd(res.totalAnnual) + '/year combined multimodal spend';

    // Populate voice comparison table
    var tbody = document.getElementById('voiceCompareBody');
    tbody.textContent = '';
    E.MULTIMODAL_RATES.voice.forEach(function (v) {
      var mo = state.dailyVoiceMins * 30 * v.usdPerMin;
      var tr = document.createElement('tr');
      var cells = [v.name, '$' + v.usdPerMin.toFixed(3) + '/min', E.formatUsd(mo) + '/mo', E.formatUsd(mo * 12) + '/yr'];
      cells.forEach(function (txt, idx) {
        var td = document.createElement('td');
        if (idx > 0) td.className = 'num';
        td.textContent = txt;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function init() {
    var vSel = document.getElementById('mmVisionModel');
    E.MULTIMODAL_RATES.vision.forEach(function (x) {
      var o = document.createElement('option'); o.value = x.id; o.textContent = x.name + ' (' + x.tokensPerImage + ' tok/img)';
      vSel.appendChild(o);
    });
    vSel.value = state.visionModel;
    vSel.addEventListener('change', function () { state.visionModel = vSel.value; render(); });

    var aSel = document.getElementById('mmVoiceModel');
    E.MULTIMODAL_RATES.voice.forEach(function (x) {
      var o = document.createElement('option'); o.value = x.id; o.textContent = x.name + ' ($' + x.usdPerMin.toFixed(3) + '/min)';
      aSel.appendChild(o);
    });
    aSel.value = state.voiceModel;
    aSel.addEventListener('change', function () { state.voiceModel = aSel.value; render(); });

    var iSel = document.getElementById('mmImageModel');
    E.MULTIMODAL_RATES.imageGen.forEach(function (x) {
      var o = document.createElement('option'); o.value = x.id; o.textContent = x.name + ' ($' + x.usdPerImage.toFixed(3) + '/img)';
      iSel.appendChild(o);
    });
    iSel.value = state.imageModel;
    iSel.addEventListener('change', function () { state.imageModel = iSel.value; render(); });

    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    bindNum('mmDailyImgs', 'dailyImages');
    bindNum('mmVisionOut', 'visionOutTok');
    bindNum('mmVoiceMins', 'dailyVoiceMins');
    bindNum('mmGenImgs', 'dailyGenImages');

    document.getElementById('btnMmExport').addEventListener('click', function () {
      var res = E.calcMultimodalBudget(state);
      UI.downloadFile('tokenledger-multimodal-budget.json', JSON.stringify({ scenario: state, budget: res }, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-multimodal-budget.json');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
