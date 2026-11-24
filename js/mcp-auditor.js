/* TokenLedger MCP & Tool-Calling Schema Bloat Auditor */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    modelId: 'claude-sonnet-4',
    servers: 5,
    toolsPerServer: 14,
    tokensPerTool: 260,
    turnsPerSession: 16,
    sessionsPerDay: 400,
    cacheHitRate: 80,
    lazyDeferPct: 85
  };

  function render() {
    document.getElementById('mcpCacheVal').textContent = state.cacheHitRate + '%';
    document.getElementById('mcpLazyVal').textContent = state.lazyDeferPct + '%';

    var res = E.calcMcpSchemaTax(state.modelId, state);
    document.getElementById('kpiMcpTokens').textContent = E.formatInt(res.schemaTokensPerTurn) + ' tok';
    document.getElementById('kpiMcpTokensSub').textContent = res.totalTools + ' tools · ' + res.contextTaxPct200k.toFixed(1) + '% of 200K ctx BEFORE user speaks';
    document.getElementById('kpiMcpUncached').textContent = E.formatUsd(res.monthlyUncached) + '/mo';
    document.getElementById('kpiMcpUncachedSub').textContent = 'Schema tax alone without prompt caching';
    document.getElementById('kpiMcpCached').textContent = E.formatUsd(res.monthlyCached) + '/mo';
    document.getElementById('kpiMcpCachedSub').textContent = 'With ' + state.cacheHitRate + '% prefix cache hit rate';
    document.getElementById('kpiMcpLazy').textContent = E.formatUsd(res.monthlyLazy) + '/mo';
    document.getElementById('kpiMcpLazySub').textContent = 'Saves ' + E.formatUsd(res.annualSavedWithLazy) + '/yr (' + E.formatInt(res.lazyTokensPerTurn) + ' tok/turn)';
  }

  function renderJsonAudit(raw) {
    var box = document.getElementById('mcpAuditOut');
    var tbody = document.getElementById('mcpToolTableBody');
    if (!raw.trim()) {
      box.hidden = true;
      return;
    }
    try {
      var a = E.auditToolJson(raw);
      box.hidden = false;
      document.getElementById('mcpAuditSummary').textContent =
        'Detected ' + a.count + ' tool schema(s) · Pretty: ' + E.formatInt(a.totalPretty) +
        ' tok · Minified: ' + E.formatInt(a.totalMinified) + ' tok (Saves ' + E.formatInt(a.savedTokens) + ' tok/turn)';
      tbody.textContent = '';
      a.topTools.forEach(function (item) {
        var tr = document.createElement('tr');
        var td1 = document.createElement('td'); td1.textContent = item.name;
        var td2 = document.createElement('td'); td2.className = 'num'; td2.textContent = E.formatInt(item.prettyTokens);
        var td3 = document.createElement('td'); td3.className = 'num'; td3.textContent = E.formatInt(item.minifiedTokens);
        var td4 = document.createElement('td'); td4.className = 'num'; td4.textContent = '-' + E.formatInt(item.prettyTokens - item.minifiedTokens);
        tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4);
        tbody.appendChild(tr);
      });
    } catch (e) {
      box.hidden = false;
      document.getElementById('mcpAuditSummary').textContent = 'Paste a valid JSON array of MCP/OpenAI tool objects to inspect per-tool token bloat.';
      tbody.textContent = '';
    }
  }

  function init() {
    var sel = document.getElementById('mcpModel');
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ' · $' + m.input + '/$' + m.cachedInput + ' cached)';
      sel.appendChild(o);
    });
    sel.value = state.modelId;
    sel.addEventListener('change', function () { state.modelId = sel.value; render(); });

    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    bindNum('mcpServers', 'servers');
    bindNum('mcpToolsPer', 'toolsPerServer');
    bindNum('mcpTokPer', 'tokensPerTool');
    bindNum('mcpTurns', 'turnsPerSession');
    bindNum('mcpSessions', 'sessionsPerDay');
    bindNum('mcpCache', 'cacheHitRate');
    bindNum('mcpLazy', 'lazyDeferPct');

    var area = document.getElementById('mcpJsonInput');
    area.addEventListener('input', function () { renderJsonAudit(area.value); });

    document.getElementById('btnMcpSample').addEventListener('click', function () {
      var sample = [
        { name: 'github_create_pull_request', description: 'Creates a new pull request in the specified GitHub repository with optional draft flag, reviewers, assignees, labels, and milestone metadata.', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' }, body: { type: 'string' }, draft: { type: 'boolean' } }, required: ['owner', 'repo', 'title', 'head', 'base'] } },
        { name: 'postgres_run_readonly_query', description: 'Executes a parameterized read-only SQL query against the connected analytics PostgreSQL replica and returns up to 500 JSON rows.', inputSchema: { type: 'object', properties: { sql: { type: 'string' }, params: { type: 'array', items: { type: 'string' } }, timeout_ms: { type: 'number' } }, required: ['sql'] } },
        { name: 'slack_post_channel_message', description: 'Posts a formatted markdown block message into a public or private Slack channel or replies to an existing thread timestamp.', inputSchema: { type: 'object', properties: { channel_id: { type: 'string' }, text: { type: 'string' }, thread_ts: { type: 'string' } }, required: ['channel_id', 'text'] } }
      ];
      area.value = JSON.stringify(sample, null, 2);
      renderJsonAudit(area.value);
      UI.showToast('Loaded sample MCP tool definitions');
    });

    document.getElementById('btnMcpExport').addEventListener('click', function () {
      var res = E.calcMcpSchemaTax(state.modelId, state);
      UI.downloadFile('tokenledger-mcp-audit.json', JSON.stringify({ scenario: state, audit: res }, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-mcp-audit.json');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
