/* TokenLedger Prompt A vs Prompt B Compression & Annual USD Savings Diff */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  function render() {
    var a = document.getElementById('diffA').value;
    var b = document.getElementById('diffB').value;
    var reqs = Number(document.getElementById('diffReqs').value) || 2000;
    var cache = Number(document.getElementById('diffCache').value) || 50;
    document.getElementById('diffCacheVal').textContent = cache + '%';

    var res = E.calcPromptDiff(a, b, reqs, cache);
    document.getElementById('kpiDiffA').textContent = E.formatInt(res.estA.tokensOpenAI) + ' tok';
    document.getElementById('kpiDiffASub').textContent = 'Claude ' + E.formatInt(res.estA.tokensClaude) + ' · Gemini ' + E.formatInt(res.estA.tokensGemini);
    document.getElementById('kpiDiffB').textContent = E.formatInt(res.estB.tokensOpenAI) + ' tok';
    document.getElementById('kpiDiffBSub').textContent = 'Claude ' + E.formatInt(res.estB.tokensClaude) + ' · Gemini ' + E.formatInt(res.estB.tokensGemini);

    var dEl = document.getElementById('kpiDiffDelta');
    dEl.textContent = (res.savedOpenAI >= 0 ? '-' : '+') + E.formatInt(Math.abs(res.savedOpenAI)) + ' tok';
    dEl.className = 'kpi-val ' + (res.savedOpenAI > 0 ? 'accent' : res.savedOpenAI < 0 ? 'danger' : '');
    document.getElementById('kpiDiffDeltaSub').textContent = res.compressionPct.toFixed(1) + '% compression ratio';

    var sonnet = res.benchmarks.find(function (x) { return x.model === 'Claude Sonnet 4'; }) || res.benchmarks[0];
    document.getElementById('kpiDiffAnnual').textContent = E.formatUsd(sonnet.annualDelta) + '/yr';
    document.getElementById('kpiDiffAnnualSub').textContent = 'Annual delta on Claude Sonnet 4 @ ' + E.formatInt(reqs) + ' req/day';

    var tbody = document.getElementById('diffTableBody');
    tbody.textContent = '';
    res.benchmarks.forEach(function (row) {
      var tr = document.createElement('tr');
      var cells = [row.model, row.provider, E.formatUsd(row.monthlyDelta) + '/mo', E.formatUsd(row.annualDelta) + '/yr'];
      cells.forEach(function (txt, idx) {
        var td = document.createElement('td');
        if (idx >= 2) td.className = 'num';
        td.textContent = txt;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function init() {
    ['diffA', 'diffB', 'diffReqs', 'diffCache'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', render);
    });
    document.getElementById('btnDiffSample').addEventListener('click', function () {
      document.getElementById('diffA').value = 'You are an extraordinarily helpful, polite, and thorough enterprise customer support assistant. Please always remember to carefully read the entire customer ticket before answering, double check every single order detail, never fabricate refund eligibility, and format your final output cleanly as valid JSON with the exact keys status, summary, and next_action.\n\n{\n  "schema": {\n    "status": "string",\n    "summary": "string",\n    "next_action": "string"\n  }\n}';
      document.getElementById('diffB').value = 'Role: Enterprise support assistant. Verify order facts; never fabricate policy. Return JSON only: {"status":string,"summary":string,"next_action":string}';
      render();
      UI.showToast('Loaded verbose vs compressed system prompt sample');
    });
    document.getElementById('btnDiffMd').addEventListener('click', function () {
      var res = E.calcPromptDiff(document.getElementById('diffA').value, document.getElementById('diffB').value, Number(document.getElementById('diffReqs').value) || 2000, Number(document.getElementById('diffCache').value) || 50);
      var md = [
        '### Prompt Compression Cost Diff (' + res.estA.tokensOpenAI + ' → ' + res.estB.tokensOpenAI + ' tok, ' + res.compressionPct.toFixed(1) + '% saved)',
        '',
        '| Model | Monthly Delta | Annual Savings |',
        '|---|---:|---:|'
      ].concat(res.benchmarks.map(function (b) { return '| ' + b.model + ' | ' + E.formatUsd(b.monthlyDelta) + '/mo | **' + E.formatUsd(b.annualDelta) + '/yr** |'; }))
       .concat(['', '_Generated via [TokenLedger Prompt Diff](https://tokenledger-8x7.pages.dev/tools/prompt-diff.html)_']).join('\n');
      UI.copyText(md, 'Copied PR Prompt Diff Markdown table!');
    });
    var btnGh = document.getElementById('btnCopyGhAction');
    if (btnGh) {
      btnGh.addEventListener('click', function () {
        var reqs = Number(document.getElementById('diffReqs').value) || 2000;
        var cache = Number(document.getElementById('diffCache').value) || 50;
        var estB = E.estimateTokens(document.getElementById('diffB').value).tokensOpenAI || 1200;
        var yml = [
          'name: TokenLedger Prompt Budget Guard',
          'on: [pull_request]',
          'jobs:',
          '  budget-check:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - uses: actions/setup-node@v4',
          '        with: { node-version: 20 }',
          '      - name: Estimate LLM API Budget Impact',
          '        run: |',
          '          npx --yes github:swp1234/tokenledger --in ' + estB + ' --out 600 --req ' + reqs + ' --cache ' + cache + ' --format md > budget.md',
          '          cat budget.md >> "$GITHUB_STEP_SUMMARY"'
        ].join('\n');
        UI.copyText(yml, 'Copied GitHub Action CI YAML!');
      });
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
