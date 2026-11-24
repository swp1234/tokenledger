/* TokenLedger Context Window & JSON/Prompt Minifier Token Inspector */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var baselineTokens = null;

  function render() {
    var txt = document.getElementById('inspectorInput').value;
    var est = E.estimateTokens(txt);
    document.getElementById('kpiTokOpenAI').textContent = E.formatInt(est.tokensOpenAI);
    document.getElementById('kpiTokClaude').textContent = E.formatInt(est.tokensClaude);
    document.getElementById('kpiTokGemini').textContent = E.formatInt(est.tokensGemini);
    document.getElementById('kpiChars').textContent = E.formatInt(est.chars);
    document.getElementById('kpiCharsSub').textContent = E.formatInt(est.words) + ' words · ' + E.formatInt(est.lines) + ' lines · CJK ' + est.cjkRatio + '%';

    var windows = [
      { id: 'bar128k', lbl: 'lbl128k', cap: 128000 },
      { id: 'bar200k', lbl: 'lbl200k', cap: 200000 },
      { id: 'bar1m', lbl: 'lbl1m', cap: 1000000 }
    ];
    windows.forEach(function (w) {
      var pct = Math.min(100, (est.tokensOpenAI / w.cap) * 100);
      document.getElementById(w.id).style.width = Math.max(est.tokensOpenAI > 0 ? 1.5 : 0, pct).toFixed(2) + '%';
      document.getElementById(w.lbl).textContent = pct.toFixed(2) + '%';
    });

    var saveBox = document.getElementById('minifySavings');
    if (baselineTokens && baselineTokens > est.tokensOpenAI) {
      var saved = baselineTokens - est.tokensOpenAI;
      var savedPct = ((saved / baselineTokens) * 100).toFixed(1);
      var annualSonnet = ((saved / 1e6) * 3.00) * 1000 * 365;
      saveBox.textContent = 'Trimmed ' + E.formatInt(saved) + ' tokens (-' + savedPct + '%) — saves ~' + E.formatUsd(annualSonnet) + '/yr at 1,000 req/day on Claude Sonnet 4!';
      saveBox.hidden = false;
    } else if (!txt.trim()) {
      baselineTokens = null;
      saveBox.hidden = true;
    }
  }

  function init() {
    var area = document.getElementById('inspectorInput');
    area.addEventListener('input', render);

    document.getElementById('btnMinifyJson').addEventListener('click', function () {
      var raw = area.value;
      var before = E.estimateTokens(raw).tokensOpenAI;
      try {
        var parsed = JSON.parse(raw);
        baselineTokens = before;
        area.value = JSON.stringify(parsed);
        render();
        UI.showToast('Minified JSON payload');
      } catch (e) {
        UI.showToast('Input is not valid JSON — try Trim Whitespace instead');
      }
    });

    document.getElementById('btnTrimWs').addEventListener('click', function () {
      var raw = area.value;
      baselineTokens = E.estimateTokens(raw).tokensOpenAI;
      area.value = raw.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      render();
      UI.showToast('Compressed redundant whitespace');
    });

    document.getElementById('btnSampleJson').addEventListener('click', function () {
      baselineTokens = null;
      area.value = JSON.stringify({
        role: 'system',
        policy: 'Respond in concise JSON strictly matching the output schema.',
        tools: [
          { name: 'search_orders', description: 'Retrieve customer order status by order_id or email address.', parameters: { type: 'object', properties: { order_id: { type: 'string' }, include_items: { type: 'boolean' } }, required: ['order_id'] } },
          { name: 'create_refund', description: 'Initiate a partial or full refund for an eligible order.', parameters: { type: 'object', properties: { order_id: { type: 'string' }, amount_usd: { type: 'number' }, reason: { type: 'string' } }, required: ['order_id', 'amount_usd'] } }
        ]
      }, null, 2);
      render();
    });

    document.getElementById('btnCopyClean').addEventListener('click', function () {
      UI.copyText(area.value, 'Cleaned prompt/JSON copied');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
