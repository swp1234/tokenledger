/* TokenLedger Speech-to-Text (STT) & Text-to-Speech (TTS) Audio API FinOps Studio */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sttSel = $('auSttModel');
    var ttsSel = $('auTtsModel');
    if (sttSel && !sttSel.options.length) {
      E.AUDIO_STT_MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.perMin.toFixed(4) + '/min)';
        if (m.id === 'deepgram-nova-3') o.selected = true;
        sttSel.appendChild(o);
      });
    }
    if (ttsSel && !ttsSel.options.length) {
      E.AUDIO_TTS_MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.per1MChars.toFixed(0) + '/1M chars)';
        if (m.id === 'openai-tts-1') o.selected = true;
        ttsSel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      sttId: $('auSttModel').value,
      ttsId: $('auTtsModel').value,
      dailyAudioMins: Number($('auDailyMins').value) || 0,
      vadSilenceTrimPct: Number($('auVadTrim').value) || 0,
      needDiarization: $('auDiarization').checked,
      dailyTtsChars: Number($('auTtsChars').value) || 0,
      ttsCacheHitPct: Number($('auTtsCache').value) || 0
    };
  }

  function render() {
    var o = getOpts();
    $('auVadVal').textContent = o.vadSilenceTrimPct + '%';
    $('auTtsCacheVal').textContent = o.ttsCacheHitPct + '%';
    var res = E.calcAudioPipeline(o);

    $('kpiAuTotal').textContent = E.formatUsd(res.optTotalMonthly) + '/mo';
    $('kpiAuTotalSub').textContent = E.formatUsd(res.annualTotal) + '/yr combined STT + TTS';
    $('kpiAuStt').textContent = E.formatUsd(res.optSttMonthly) + '/mo';
    $('kpiAuSttSub').textContent = E.formatInt(res.billedMinsPerDay) + ' billed min/day (' + res.stt.provider + ')';
    $('kpiAuTts').textContent = E.formatUsd(res.optTtsMonthly) + '/mo';
    $('kpiAuTtsSub').textContent = res.tts.name;
    $('kpiAuSave').textContent = E.formatUsd(res.monthlySaved) + '/mo';
    $('kpiAuSaveSub').textContent = E.formatUsd(res.monthlySaved * 12) + '/yr via VAD + TTS cache';

    var sttBody = $('auSttTableBody');
    if (sttBody) {
      sttBody.innerHTML = '';
      res.sttComparison.forEach(function (row, idx) {
        var tr = document.createElement('tr');
        var isSel = row.model.id === res.stt.id;
        tr.innerHTML = '<td><strong>' + row.model.name + '</strong>' + (isSel ? ' <span class="tl-badge best">Selected</span>' : idx === 0 ? ' <span class="tl-badge">Lowest</span>' : '') + '<div class="kpi-sub">' + row.model.note + '</div></td>' +
          '<td class="num">$' + row.effectivePerMin.toFixed(5) + '/min</td>' +
          '<td class="num">' + E.formatUsd(row.monthly) + '/mo</td>' +
          '<td class="num">' + E.formatUsd(row.annual) + '/yr</td>';
        sttBody.appendChild(tr);
      });
    }

    var ttsBody = $('auTtsTableBody');
    if (ttsBody) {
      ttsBody.innerHTML = '';
      res.ttsComparison.forEach(function (row, idx) {
        var tr = document.createElement('tr');
        var isSel = row.model.id === res.tts.id;
        tr.innerHTML = '<td><strong>' + row.model.name + '</strong>' + (isSel ? ' <span class="tl-badge best">Selected</span>' : idx === 0 ? ' <span class="tl-badge">Lowest</span>' : '') + '<div class="kpi-sub">' + row.model.note + '</div></td>' +
          '<td class="num">$' + row.model.per1MChars.toFixed(0) + '/1M</td>' +
          '<td class="num">' + E.formatUsd(row.monthly) + '/mo</td>' +
          '<td class="num">' + E.formatUsd(row.annual) + '/yr</td>';
        ttsBody.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['auSttModel', 'auTtsModel', 'auDailyMins', 'auVadTrim', 'auDiarization', 'auTtsChars', 'auTtsCache'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnAuCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var o = getOpts();
        var r = render();
        var md = [
          '## Audio STT + TTS Pipeline FinOps Estimate (TokenLedger)',
          '- **STT Engine**: ' + r.stt.name + ' (' + E.formatInt(o.dailyAudioMins) + ' raw min/d, ' + o.vadSilenceTrimPct + '% VAD silence trimmed -> ' + E.formatInt(r.billedMinsPerDay) + ' billed min/d)',
          '- **TTS Engine**: ' + r.tts.name + ' (' + E.formatInt(o.dailyTtsChars) + ' chars/d, ' + o.ttsCacheHitPct + '% response cache)',
          '- **Optimized Monthly Spend**: **' + E.formatUsd(r.optTotalMonthly) + '/mo** (STT: ' + E.formatUsd(r.optSttMonthly) + ' + TTS: ' + E.formatUsd(r.optTtsMonthly) + ')',
          '- **Annualized Savings (VAD + TTS Cache)**: **' + E.formatUsd(r.monthlySaved * 12) + '/yr**'
        ].join('\n');
        UI.copyText(md, 'Audio FinOps Markdown copied');
      });
    }

    var btnCsv = $('btnAuExportCsv');
    if (btnCsv) {
      btnCsv.addEventListener('click', function () {
        var r = render();
        var rows = r.sttComparison.map(function (x) {
          return ['STT', x.model.name, x.model.provider, '$' + x.effectivePerMin.toFixed(5) + '/min', x.monthly.toFixed(2), x.annual.toFixed(2)];
        }).concat(r.ttsComparison.map(function (x) {
          return ['TTS', x.model.name, x.model.provider, '$' + x.model.per1MChars.toFixed(0) + '/1M chars', x.monthly.toFixed(2), x.annual.toFixed(2)];
        }));
        UI.downloadFile('tokenledger-audio-stt-tts.csv', UI.rowsToCsv(['Type', 'Model', 'Provider', 'Unit Rate', 'Monthly USD', 'Annual USD'], rows), 'text/csv;charset=utf-8');
        UI.showToast('Audio CSV exported');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
