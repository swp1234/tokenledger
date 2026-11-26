/* TokenLedger AI SaaS Pricing Tier & Credit-Pack Architect */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E || !UI) return;

  function $(id) { return document.getElementById(id); }

  function populateSelects() {
    var sel = $('ptModel');
    if (sel && !sel.options.length) {
      E.MODELS.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.output + ')';
        if (m.id === 'gemini-2.5-flash') o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function getOpts() {
    return {
      modelId: $('ptModel').value,
      inputTokens: Number($('ptInTok').value) || 0,
      outputTokens: Number($('ptOutTok').value) || 0,
      cacheHitRate: Number($('ptCache').value) || 0,
      targetMarginPct: Number($('ptMargin').value) || 78,
      proPrice: Number($('ptProPrice').value) || 29,
      teamPrice: Number($('ptTeamPrice').value) || 79,
      entPrice: Number($('ptEntPrice').value) || 299,
      fixedInfraPerUser: Number($('ptFixedInfra').value) || 0
    };
  }

  function render() {
    var o = getOpts();
    $('ptCacheVal').textContent = o.cacheHitRate + '%';
    $('ptMarginVal').textContent = o.targetMarginPct + '%';
    var res = E.calcPricingTiers(o);
    var pro = res.tiers[1];
    var team = res.tiers[2];

    $('kpiPtAction').textContent = E.formatUsd(res.perActionCost);
    $('kpiPtActionSub').textContent = 'Direct LLM COGS / AI action (' + res.model.name + ')';
    $('kpiPtProCap').textContent = E.formatInt(pro.maxCredits) + ' cr/mo';
    $('kpiPtProCapSub').textContent = 'Safe Pro cap at ' + pro.grossMarginPct.toFixed(1) + '% margin floor';
    $('kpiPtTeamCap').textContent = E.formatInt(team.maxCredits) + ' cr/mo';
    $('kpiPtTeamCapSub').textContent = 'Safe Team seat cap (' + E.formatUsd(team.netAfterAll) + ' net/seat)';
    $('kpiPtOverage').textContent = E.formatUsd(pro.overagePer1k) + ' / 1K';
    $('kpiPtOverageSub').textContent = 'Margin-safe overage pack price';

    var body = $('ptTableBody');
    if (body) {
      body.innerHTML = '';
      res.tiers.forEach(function (t) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + t.name + '</strong></td>' +
          '<td class="num">' + (t.price === 0 ? 'Free' : E.formatUsd(t.price) + '/mo') + '</td>' +
          '<td class="num"><strong>' + E.formatInt(t.maxCredits) + ' credits</strong></td>' +
          '<td class="num">' + E.formatUsd(t.maxAiCogs) + '</td>' +
          '<td class="num">' + E.formatUsd(t.netAfterAll) + '</td>' +
          '<td class="num">' + (t.price === 0 ? 'Acq. Cost' : '<span class="tl-badge best">' + t.grossMarginPct.toFixed(1) + '%</span>') + '</td>' +
          '<td class="num">' + E.formatUsd(t.overagePer1k) + '/1K</td>';
        body.appendChild(tr);
      });
    }
    return res;
  }

  function init() {
    populateSelects();
    ['ptModel', 'ptInTok', 'ptOutTok', 'ptCache', 'ptMargin', 'ptProPrice', 'ptTeamPrice', 'ptEntPrice', 'ptFixedInfra'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    window.addEventListener('tl:currency-change', render);

    var btnMd = $('btnPtCopyMd');
    if (btnMd) {
      btnMd.addEventListener('click', function () {
        var r = render();
        var lines = [
          '## AI SaaS Pricing Tier Architecture (TokenLedger)',
          'Model: **' + r.model.name + '** · Direct COGS/Action: **' + E.formatUsd(r.perActionCost) + '** · Margin Floor Target: **' + r.targetMarginPct + '%**',
          '',
          '| Tier | Price | Monthly Credits Cap | Max AI COGS | Worst-Case Net | Gross Margin Floor | Overage / 1K |',
          '|---|---:|---:|---:|---:|---:|---:|'
        ].concat(r.tiers.map(function (t) {
          return '| ' + t.name + ' | ' + (t.price === 0 ? 'Free' : E.formatUsd(t.price) + '/mo') + ' | ' + E.formatInt(t.maxCredits) + ' | ' + E.formatUsd(t.maxAiCogs) + ' | ' + E.formatUsd(t.netAfterAll) + ' | ' + (t.price === 0 ? 'CAC' : t.grossMarginPct.toFixed(1) + '%') + ' | ' + E.formatUsd(t.overagePer1k) + ' |';
        }));
        UI.copyText(lines.join('\n'), 'Pricing Tier Table Markdown copied');
      });
    }

    var btnJson = $('btnPtCopyJson');
    if (btnJson) {
      btnJson.addEventListener('click', function () {
        var r = render();
        var spec = {
          model: r.model.id,
          perActionUsd: Number(r.perActionCost.toFixed(6)),
          targetMarginPct: r.targetMarginPct,
          tiers: r.tiers.map(function (t) {
            return { name: t.name, monthlyUsd: t.price, monthlyCredits: t.maxCredits, overageUsdPer1kCredits: t.overagePer1k, floorMarginPct: Number(t.grossMarginPct.toFixed(1)) };
          })
        };
        UI.copyText(JSON.stringify(spec, null, 2), 'Stripe/Billing JSON spec copied');
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
