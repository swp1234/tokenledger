/* TokenLedger RAG & Vector Embedding TCO Planner */
(function () {
  'use strict';
  var E = window.TokenLedgerEngine;
  var UI = window.TokenLedgerUI;
  if (!E) return;

  var state = {
    embedId: 'text-embedding-3-small',
    llmId: 'gemini-2.5-flash',
    docCount: 25000,
    tokensPerDoc: 1500,
    chunkSize: 512,
    overlapPct: 15,
    monthlyChurnPct: 12,
    dailyQueries: 3000,
    topK: 6,
    outputTokens: 500,
    cacheHitRate: 35
  };

  function render() {
    document.getElementById('ragOverlapVal').textContent = state.overlapPct + '%';
    document.getElementById('ragChurnVal').textContent = state.monthlyChurnPct + '%';
    document.getElementById('ragTopKVal').textContent = 'Top-' + state.topK;

    var res = E.calcRagBudget(state.embedId, state.llmId, state);
    document.getElementById('kpiIngest').textContent = E.formatUsd(res.oneTimeIngestCost);
    document.getElementById('kpiIngestSub').textContent = E.formatInt(res.totalChunks) + ' chunks (' + (res.indexedTokens / 1e6).toFixed(1) + 'M tok)';
    document.getElementById('kpiVector').textContent = E.formatUsd(res.estVectorDbMonthly) + '/mo';
    document.getElementById('kpiVectorSub').textContent = res.vectorRamGB.toFixed(2) + ' GB est. HNSW RAM';
    document.getElementById('kpiSynth').textContent = E.formatUsd(res.monthlySynthCost) + '/mo';
    document.getElementById('kpiSynthSub').textContent = E.formatInt(res.synthInputTokens) + ' ctx tok/query on ' + res.llm.name;
    document.getElementById('kpiRagTotal').textContent = E.formatUsd(res.monthlyTotal) + '/mo';
    document.getElementById('kpiRagTotalSub').textContent = 'Re-index ' + E.formatUsd(res.monthlyReindexCost) + ' + Query Emb ' + E.formatUsd(res.monthlyQueryEmbedCost);
  }

  function init() {
    var embSel = document.getElementById('ragEmbed');
    E.EMBEDDINGS.forEach(function (em) {
      var o = document.createElement('option');
      o.value = em.id;
      o.textContent = em.name + ' ($' + em.per1M + '/1M · ' + em.dims + 'd)';
      embSel.appendChild(o);
    });
    embSel.value = state.embedId;
    embSel.addEventListener('change', function () { state.embedId = embSel.value; render(); });

    var llmSel = document.getElementById('ragLlm');
    E.MODELS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + ' (' + m.provider + ')';
      llmSel.appendChild(o);
    });
    llmSel.value = state.llmId;
    llmSel.addEventListener('change', function () { state.llmId = llmSel.value; render(); });

    var bindNum = function (id, key) {
      var el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener('input', function () { state[key] = Number(el.value) || 0; render(); });
    };
    bindNum('ragDocs', 'docCount');
    bindNum('ragTokDoc', 'tokensPerDoc');
    bindNum('ragChunk', 'chunkSize');
    bindNum('ragOverlap', 'overlapPct');
    bindNum('ragChurn', 'monthlyChurnPct');
    bindNum('ragQueries', 'dailyQueries');
    bindNum('ragTopK', 'topK');
    bindNum('ragOut', 'outputTokens');

    document.getElementById('btnRagExport').addEventListener('click', function () {
      var res = E.calcRagBudget(state.embedId, state.llmId, state);
      UI.downloadFile('tokenledger-rag-tco.json', JSON.stringify({ scenario: state, budget: res }, null, 2), 'application/json;charset=utf-8');
      UI.showToast('Downloaded tokenledger-rag-tco.json');
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
