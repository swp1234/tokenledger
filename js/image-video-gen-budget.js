/* TokenLedger AI Image & Video Generation Studio Cost Calculator */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var imgSel = $('mvImgModel');
    var vidSel = $('mvVidModel');
    if (imgSel && !imgSel.options.length) {
      E.IMAGE_GEN_MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.perImg.toFixed(3) + '/img)';
        if (m.id === 'flux-1-1-pro') o.selected = true;
        imgSel.appendChild(o);
      });
    }
    if (vidSel && !vidSel.options.length) {
      E.VIDEO_GEN_MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' ($' + m.perSec.toFixed(2) + '/sec)';
        if (m.id === 'runway-gen4-turbo') o.selected = true;
        vidSel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      imgModelId: $('mvImgModel').value,
      vidModelId: $('mvVidModel').value,
      dailyPublishedImages: Number($('mvDailyImgs').value) || 0,
      imgRetryFactor: Number($('mvImgRetry').value) || 1,
      dailyVideoClips: Number($('mvDailyClips').value) || 0,
      avgClipSec: Number($('mvClipSec').value) || 5,
      vidRetryFactor: Number($('mvVidRetry').value) || 1,
      useDraftCascade: $('mvDraftCascade').checked
    };
  }

  function render() {
    var o = getOpts();
    $('mvImgRetryVal').textContent = o.imgRetryFactor.toFixed(1) + 'x';
    $('mvVidRetryVal').textContent = o.vidRetryFactor.toFixed(1) + 'x';
    var res = E.calcMediaGenBudget(o);

    $('kpiMvTotal').textContent = E.formatUsd(res.totalMonthly) + '/mo';
    $('kpiMvTotalSub').textContent = E.formatUsd(res.annualTotal) + '/yr creative API budget';
    $('kpiMvImg').textContent = E.formatUsd(res.effImgMonthly) + '/mo';
    $('kpiMvImgSub').textContent = E.formatUsd(res.costPerPublishedImg) + ' per published image';
    $('kpiMvVid').textContent = E.formatUsd(res.vidMonthly) + '/mo';
    $('kpiMvVidSub').textContent = E.formatUsd(res.costPerPublishedClip) + ' per published clip';
    $('kpiMvSave').textContent = E.formatUsd(res.draftSavingsMonthly) + '/mo';
    $('kpiMvSaveSub').textContent = o.useDraftCascade ? 'Applied (FLUX schnell drafts)' : 'Toggle draft cascade to save';

    var imgBody = $('mvImgTableBody');
    if (imgBody) {
      imgBody.innerHTML = '';
      E.IMAGE_GEN_MODELS.forEach(function (m) {
        var rawMo = o.dailyPublishedImages * o.imgRetryFactor * 30 * m.perImg;
        var cascMo = o.dailyPublishedImages * 30 * (m.perImg + Math.max(0, o.imgRetryFactor - 1) * 0.003);
        var effMo = o.useDraftCascade ? Math.min(rawMo, cascMo) : rawMo;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + m.name + '</strong>' + (m.id === res.imgModel.id ? ' <span class="tl-badge best">Selected</span>' : '') + ' <span class="kpi-sub">(' + m.tier + ')</span></td>' +
          '<td class="num">$' + m.perImg.toFixed(3) + '</td>' +
          '<td class="num">' + E.formatUsd(effMo) + '/mo</td>' +
          '<td class="num">' + E.formatUsd(effMo * 12) + '/yr</td>';
        imgBody.appendChild(tr);
      });
    }

    var vidBody = $('mvVidTableBody');
    if (vidBody) {
      vidBody.innerHTML = '';
      E.VIDEO_GEN_MODELS.forEach(function (m) {
        var mo = res.totalVidSecsDay * 30 * m.perSec;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + m.name + '</strong>' + (m.id === res.vidModel.id ? ' <span class="tl-badge best">Selected</span>' : '') + ' <span class="kpi-sub">(' + m.tier + ')</span></td>' +
          '<td class="num">$' + m.perSec.toFixed(2) + '/s</td>' +
          '<td class="num">' + E.formatUsd(mo) + '/mo</td>' +
          '<td class="num">' + E.formatUsd(mo * 12) + '/yr</td>';
        vidBody.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['mvImgModel', 'mvVidModel', 'mvDailyImgs', 'mvImgRetry', 'mvDailyClips', 'mvClipSec', 'mvVidRetry', 'mvDraftCascade'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnMvCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var o = getOpts();
        var r = render();
        var md = [
          '## AI Image & Video Studio Budget (TokenLedger)',
          '- **Image Pipeline**: ' + r.imgModel.name + ' · ' + E.formatInt(o.dailyPublishedImages) + ' published/day × ' + o.imgRetryFactor.toFixed(1) + 'x retries' + (o.useDraftCascade ? ' (FLUX schnell Draft Cascade ON)' : '') + ' -> **' + E.formatUsd(r.effImgMonthly) + '/mo** (' + E.formatUsd(r.costPerPublishedImg) + '/asset)',
          '- **Video Pipeline**: ' + r.vidModel.name + ' · ' + E.formatInt(o.dailyVideoClips) + ' clips/day × ' + o.avgClipSec + 's × ' + o.vidRetryFactor.toFixed(1) + 'x retries -> **' + E.formatUsd(r.vidMonthly) + '/mo** (' + E.formatUsd(r.costPerPublishedClip) + '/clip)',
          '- **Total Monthly Studio API Spend**: **' + E.formatUsd(r.totalMonthly) + '/mo** (**' + E.formatUsd(r.annualTotal) + '/yr**)'
        ].join('\n');
        UI.copyText(md, 'Image & Video Budget Markdown copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
