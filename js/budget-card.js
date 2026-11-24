/* TokenLedger Visual Executive Budget Card Exporter (1200x630 PNG via Canvas — 100% browser-local) */
(function () {
  'use strict';

  function downloadBudgetCardPng(opts) {
    var canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    var grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#080c15');
    grad.addColorStop(1, '#0f1b2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Subtle accent glow
    var g1 = ctx.createRadialGradient(1040, 90, 10, 1040, 90, 340);
    g1.addColorStop(0, 'rgba(56,189,248,0.22)');
    g1.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, 1200, 630);

    // Header badge
    ctx.fillStyle = '#10b981';
    ctx.fillRect(56, 48, 46, 46);
    ctx.fillStyle = '#031510';
    ctx.font = '900 22px ui-monospace, monospace';
    ctx.fillText('TL', 66, 79);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '800 28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    ctx.fillText('TokenLedger — Executive LLM API Budget', 118, 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px ui-monospace, monospace';
    ctx.fillText(opts.subtitle || '', 56, 126);

    // Top 5 model rows
    var rows = (opts.rows || []).slice(0, 5);
    var maxCost = rows.reduce(function (m, r) { return Math.max(m, r.monthly); }, 0.01);
    var y = 178;
    rows.forEach(function (r, i) {
      ctx.fillStyle = 'rgba(18,26,45,0.92)';
      ctx.fillRect(56, y, 1088, 62);
      ctx.strokeStyle = i === 0 ? 'rgba(16,185,129,0.55)' : 'rgba(148,163,184,0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(56, y, 1088, 62);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
      ctx.fillText((i + 1) + '. ' + r.name + ' (' + r.provider + ')', 78, y + 38);

      // Bar
      var barW = Math.max(12, Math.round((r.monthly / maxCost) * 340));
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(500, y + 22, 340, 18);
      ctx.fillStyle = i === 0 ? '#10b981' : '#38bdf8';
      ctx.fillRect(500, y + 22, barW, 18);

      // Monthly USD
      ctx.fillStyle = i === 0 ? '#34d399' : '#f1f5f9';
      ctx.font = '800 22px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(r.monthlyLabel + '/mo', 1122, y + 39);
      ctx.textAlign = 'left';

      y += 74;
    });

    // Footer bar
    ctx.fillStyle = '#34d399';
    ctx.font = '700 18px ui-monospace, monospace';
    ctx.fillText(opts.highlight || '100% browser-private LLM FinOps estimate', 56, 582);

    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.font = '600 17px ui-monospace, monospace';
    ctx.fillText('tokenledger-8x7.pages.dev', 1144, 582);
    ctx.textAlign = 'left';

    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = opts.filename || 'tokenledger-budget-card.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }, 'image/png');
  }

  window.TokenLedgerCard = { downloadBudgetCardPng: downloadBudgetCardPng };
})();
