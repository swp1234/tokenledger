/* TokenLedger Core FinOps Engine — 100% deterministic, zero external deps, browser + Node UMD */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TokenLedgerEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MODELS = [
    { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', tier: 'frontier', input: 1.25, cachedInput: 0.125, output: 10.00, batchDiscount: 0.5, context: 400000, badge: 'Frontier' },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', provider: 'OpenAI', tier: 'mini', input: 0.25, cachedInput: 0.025, output: 2.00, batchDiscount: 0.5, context: 400000, badge: 'Best Value' },
    { id: 'gpt-5-nano', name: 'GPT-5 nano', provider: 'OpenAI', tier: 'mini', input: 0.05, cachedInput: 0.005, output: 0.40, batchDiscount: 0.5, context: 400000, badge: 'Ultra-Budget' },
    { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', tier: 'balanced', input: 2.00, cachedInput: 0.50, output: 8.00, batchDiscount: 0.5, context: 1047576, badge: '1M Context' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', provider: 'OpenAI', tier: 'mini', input: 0.40, cachedInput: 0.10, output: 1.60, batchDiscount: 0.5, context: 1047576, badge: 'Fast 1M' },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 nano', provider: 'OpenAI', tier: 'mini', input: 0.10, cachedInput: 0.025, output: 0.40, batchDiscount: 0.5, context: 1047576, badge: 'Ultra-Budget' },
    { id: 'o3', name: 'OpenAI o3', provider: 'OpenAI', tier: 'reasoning', input: 2.00, cachedInput: 0.50, output: 8.00, batchDiscount: 0.5, context: 200000, badge: 'Reasoning' },
    { id: 'o4-mini', name: 'OpenAI o4-mini', provider: 'OpenAI', tier: 'reasoning', input: 1.10, cachedInput: 0.275, output: 4.40, batchDiscount: 0.5, context: 200000, badge: 'Fast Reasoning' },
    { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', tier: 'frontier', input: 15.00, cachedInput: 1.50, output: 75.00, batchDiscount: 0.5, context: 200000, badge: 'Deep Coding' },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', tier: 'balanced', input: 3.00, cachedInput: 0.30, output: 15.00, batchDiscount: 0.5, context: 200000, badge: 'Agent Default' },
    { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', tier: 'mini', input: 0.80, cachedInput: 0.08, output: 4.00, batchDiscount: 0.5, context: 200000, badge: 'Low Latency' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', tier: 'frontier', input: 1.25, cachedInput: 0.3125, output: 10.00, batchDiscount: 0.5, context: 1048576, badge: '1M Frontier' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', tier: 'balanced', input: 0.30, cachedInput: 0.075, output: 2.50, batchDiscount: 0.5, context: 1048576, badge: 'Best Value' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', provider: 'Google', tier: 'mini', input: 0.10, cachedInput: 0.025, output: 0.40, batchDiscount: 0.5, context: 1048576, badge: 'Ultra-Budget' },
    { id: 'deepseek-v3', name: 'DeepSeek-V3 (Chat)', provider: 'DeepSeek', tier: 'balanced', input: 0.27, cachedInput: 0.07, output: 1.10, batchDiscount: 0.5, context: 128000, badge: 'Open Weight' },
    { id: 'deepseek-r1', name: 'DeepSeek-R1', provider: 'DeepSeek', tier: 'reasoning', input: 0.55, cachedInput: 0.14, output: 2.19, batchDiscount: 0.5, context: 128000, badge: 'Value Reasoning' },
    { id: 'grok-3', name: 'Grok 3', provider: 'xAI', tier: 'frontier', input: 3.00, cachedInput: 0.75, output: 15.00, batchDiscount: 0.0, context: 131072, badge: 'Frontier' },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xAI', tier: 'reasoning', input: 0.30, cachedInput: 0.075, output: 0.50, batchDiscount: 0.0, context: 131072, badge: 'Fast Reasoning' },
    { id: 'llama-4-maverick', name: 'Llama 4 Maverick (Hosted)', provider: 'Meta', tier: 'balanced', input: 0.27, cachedInput: 0.135, output: 0.85, batchDiscount: 0.0, context: 1000000, badge: 'Open 1M' },
    { id: 'llama-4-scout', name: 'Llama 4 Scout (Hosted)', provider: 'Meta', tier: 'mini', input: 0.11, cachedInput: 0.055, output: 0.34, batchDiscount: 0.0, context: 1000000, badge: 'Ultra-Budget' },
    { id: 'mistral-large-2', name: 'Mistral Large 2', provider: 'Mistral', tier: 'balanced', input: 2.00, cachedInput: 2.00, output: 6.00, batchDiscount: 0.5, context: 128000, badge: 'EU Sovereign' },
    { id: 'mistral-small-3', name: 'Mistral Small 3.1', provider: 'Mistral', tier: 'mini', input: 0.10, cachedInput: 0.10, output: 0.30, batchDiscount: 0.5, context: 128000, badge: 'EU Budget' },
    { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B (Hosted)', provider: 'Alibaba', tier: 'balanced', input: 0.35, cachedInput: 0.175, output: 0.40, batchDiscount: 0.0, context: 131072, badge: 'Multilingual' },
    { id: 'sonar-pro', name: 'Perplexity Sonar Pro', provider: 'Perplexity', tier: 'balanced', input: 3.00, cachedInput: 3.00, output: 15.00, batchDiscount: 0.0, context: 200000, badge: 'Search API' }
  ];

  var EMBEDDINGS = [
    { id: 'text-embedding-3-small', name: 'OpenAI text-embedding-3-small', provider: 'OpenAI', per1M: 0.02, dims: 1536 },
    { id: 'text-embedding-3-large', name: 'OpenAI text-embedding-3-large', provider: 'OpenAI', per1M: 0.13, dims: 3072 },
    { id: 'gemini-embedding-001', name: 'Google Gemini Embedding 001', provider: 'Google', per1M: 0.15, dims: 3072 },
    { id: 'voyage-3-large', name: 'Voyage 3 Large', provider: 'Voyage AI', per1M: 0.18, dims: 1024 },
    { id: 'cohere-embed-v3', name: 'Cohere Embed v3', provider: 'Cohere', per1M: 0.10, dims: 1024 },
    { id: 'bge-m3-hosted', name: 'BGE-M3 (Hosted Open)', provider: 'Open Source', per1M: 0.015, dims: 1024 }
  ];

  function getModel(id) {
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].id === id) return MODELS[i];
    }
    return MODELS[0];
  }

  function getEmbedding(id) {
    for (var i = 0; i < EMBEDDINGS.length; i++) {
      if (EMBEDDINGS[i].id === id) return EMBEDDINGS[i];
    }
    return EMBEDDINGS[0];
  }

  function clamp(n, min, max) {
    var x = Number(n);
    if (!isFinite(x)) return min;
    return Math.min(max, Math.max(min, x));
  }

  // Multi-family BPE/SentencePiece engineering token estimator (handles prose, code/JSON, and CJK/Korean)
  function estimateTokens(text) {
    var s = String(text || '');
    var chars = s.length;
    if (!chars) {
      return {
        chars: 0, words: 0, lines: 0,
        tokensOpenAI: 0, tokensClaude: 0, tokensGemini: 0,
        cjkRatio: 0, codeSymbolRatio: 0, whitespaceRatio: 0
      };
    }
    var lines = s.split(/\r\n|\r|\n/).length;
    var trimmed = s.trim();
    var words = trimmed ? trimmed.split(/\s+/).length : 0;

    var cjkCount = (s.match(/[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/g) || []).length;
    var codeSymCount = (s.match(/[{}\[\]():;,.<>=+\-*/\\|`~!@#$%^&?"']/g) || []).length;
    var wsCount = (s.match(/\s/g) || []).length;
    var asciiAlpha = Math.max(0, chars - cjkCount - codeSymCount - wsCount);

    // Calibrated heuristics against o200k_base (OpenAI), Claude BPE, and Gemini SentencePiece
    var baseOpenAI = (asciiAlpha / 4.15) + (cjkCount * 0.85) + (codeSymCount * 0.58) + (wsCount * 0.18);
    var baseClaude = (asciiAlpha / 3.85) + (cjkCount * 1.10) + (codeSymCount * 0.64) + (wsCount * 0.22);
    var baseGemini = (asciiAlpha / 4.05) + (cjkCount * 0.78) + (codeSymCount * 0.55) + (wsCount * 0.16);

    return {
      chars: chars,
      words: words,
      lines: lines,
      tokensOpenAI: Math.max(1, Math.round(baseOpenAI)),
      tokensClaude: Math.max(1, Math.round(baseClaude)),
      tokensGemini: Math.max(1, Math.round(baseGemini)),
      cjkRatio: Math.round((cjkCount / chars) * 1000) / 10,
      codeSymbolRatio: Math.round((codeSymCount / chars) * 1000) / 10,
      whitespaceRatio: Math.round((wsCount / chars) * 1000) / 10
    };
  }

  function calcModelWorkload(model, opts) {
    var m = typeof model === 'string' ? getModel(model) : model;
    var inputTokens = clamp(opts.inputTokens, 0, 20000000);
    var outputTokens = clamp(opts.outputTokens, 0, 5000000);
    var dailyRequests = clamp(opts.dailyRequests, 0, 100000000);
    var cacheHitRate = clamp(opts.cacheHitRate || 0, 0, 95) / 100;
    var useBatch = Boolean(opts.useBatch);
    var batchMult = useBatch && m.batchDiscount > 0 ? (1 - m.batchDiscount) : 1;

    var cachedTokens = inputTokens * cacheHitRate;
    var uncachedTokens = inputTokens - cachedTokens;

    var rawInputCost = (inputTokens / 1e6) * m.input;
    var effInputCost = ((uncachedTokens / 1e6) * m.input + (cachedTokens / 1e6) * m.cachedInput) * batchMult;
    var rawOutputCost = (outputTokens / 1e6) * m.output;
    var effOutputCost = rawOutputCost * batchMult;

    var rawPerReq = rawInputCost + rawOutputCost;
    var perReq = effInputCost + effOutputCost;
    var daily = perReq * dailyRequests;
    var monthly = daily * 30;
    var annual = daily * 365;
    var rawMonthly = rawPerReq * dailyRequests * 30;
    var monthlySavings = Math.max(0, rawMonthly - monthly);
    var contextFillPct = m.context > 0 ? Math.min(100, ((inputTokens + outputTokens) / m.context) * 100) : 0;

    return {
      model: m,
      perReq: perReq,
      rawPerReq: rawPerReq,
      daily: daily,
      monthly: monthly,
      annual: annual,
      rawMonthly: rawMonthly,
      monthlySavings: monthlySavings,
      contextFillPct: contextFillPct,
      exceedsContext: (inputTokens + outputTokens) > m.context,
      batchApplied: useBatch && m.batchDiscount > 0
    };
  }

  function calcCascadeSavings(frontierId, miniId, opts, offloadPct) {
    var pct = clamp(offloadPct, 0, 100) / 100;
    var fRes = calcModelWorkload(frontierId, opts);
    var mRes = calcModelWorkload(miniId, opts);
    var blendedMonthly = fRes.monthly * (1 - pct) + mRes.monthly * pct;
    var savedMonthly = Math.max(0, fRes.monthly - blendedMonthly);
    var savedPct = fRes.monthly > 0 ? (savedMonthly / fRes.monthly) * 100 : 0;
    return {
      frontierMonthly: fRes.monthly,
      miniMonthly: mRes.monthly,
      blendedMonthly: blendedMonthly,
      savedMonthly: savedMonthly,
      savedAnnual: savedMonthly * 12,
      savedPct: savedPct
    };
  }

  // Quadratic multi-turn AI agent context snowball calculator
  function calcAgentBurn(modelId, opts) {
    var m = getModel(modelId);
    var turns = Math.round(clamp(opts.turns, 1, 50));
    var systemTokens = clamp(opts.systemTokens, 100, 100000);
    var growthPerTurn = clamp(opts.growthPerTurn, 50, 50000);
    var outputPerTurn = clamp(opts.outputPerTurn, 50, 20000);
    var runsPerDay = clamp(opts.runsPerDay, 1, 1000000);
    var cacheRate = clamp(opts.cacheHitRate || 80, 0, 95) / 100;
    var windowSize = Math.round(clamp(opts.windowTurns || 5, 2, 20));

    var naiveInputTotal = 0;
    var cachedCostRun = 0;
    var naiveCostRun = 0;
    var windowCostRun = 0;
    var totalOutputTokens = turns * outputPerTurn;
    var breakdown = [];

    for (var t = 1; t <= turns; t++) {
      var turnInNaive = systemTokens + (t - 1) * (growthPerTurn + outputPerTurn);
      naiveInputTotal += turnInNaive;
      var naiveTurnCost = (turnInNaive / 1e6) * m.input + (outputPerTurn / 1e6) * m.output;
      naiveCostRun += naiveTurnCost;

      // Prompt cache hits prefix from prior turn (turns >= 2)
      var cachedPrefix = t === 1 ? 0 : (turnInNaive - growthPerTurn - outputPerTurn) * cacheRate;
      var freshIn = Math.max(0, turnInNaive - cachedPrefix);
      var cachedTurnCost = (freshIn / 1e6) * m.input + (cachedPrefix / 1e6) * m.cachedInput + (outputPerTurn / 1e6) * m.output;
      cachedCostRun += cachedTurnCost;

      // Sliding window caps history at last windowSize turns + 400-token rolling summary
      var effHistTurns = Math.min(t - 1, windowSize);
      var summaryOverhead = t > windowSize + 1 ? 400 : 0;
      var turnInWin = systemTokens + summaryOverhead + effHistTurns * (growthPerTurn + outputPerTurn);
      var winCached = t === 1 ? 0 : systemTokens * cacheRate;
      var winTurnCost = ((turnInWin - winCached) / 1e6) * m.input + (winCached / 1e6) * m.cachedInput + (outputPerTurn / 1e6) * m.output;
      windowCostRun += winTurnCost;

      breakdown.push({
        turn: t,
        inputTokens: turnInNaive,
        naiveTurnCost: naiveTurnCost,
        cachedTurnCost: cachedTurnCost,
        windowTurnCost: winTurnCost
      });
    }

    return {
      model: m,
      turns: turns,
      naiveInputTokens: naiveInputTotal,
      totalOutputTokens: totalOutputTokens,
      naivePerRun: naiveCostRun,
      cachedPerRun: cachedCostRun,
      windowPerRun: windowCostRun,
      naiveMonthly: naiveCostRun * runsPerDay * 30,
      cachedMonthly: cachedCostRun * runsPerDay * 30,
      windowMonthly: windowCostRun * runsPerDay * 30,
      cacheSavingsPct: naiveCostRun > 0 ? ((naiveCostRun - cachedCostRun) / naiveCostRun) * 100 : 0,
      windowSavingsPct: naiveCostRun > 0 ? ((naiveCostRun - windowCostRun) / naiveCostRun) * 100 : 0,
      snowballMultiplier: systemTokens > 0 ? (naiveInputTotal / (systemTokens * turns)) : 1,
      breakdown: breakdown
    };
  }

  // AI SaaS Unit Economics & Gross Margin Simulator
  function calcSaasMargin(modelId, opts) {
    var m = getModel(modelId);
    var price = clamp(opts.price, 1, 10000);
    var seats = Math.round(clamp(opts.seats, 1, 1000000));
    var reqPerSeatMonth = clamp(opts.reqPerSeatMonth, 1, 100000);
    var inputTokens = clamp(opts.inputTokens, 50, 500000);
    var outputTokens = clamp(opts.outputTokens, 20, 100000);
    var cacheHitRate = clamp(opts.cacheHitRate || 50, 0, 95);
    var fixedInfraPerSeat = clamp(opts.fixedInfraPerSeat || 0.35, 0, 500);
    var paymentFee = price * 0.029 + 0.30;

    var w = calcModelWorkload(m, {
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      dailyRequests: reqPerSeatMonth / 30,
      cacheHitRate: cacheHitRate,
      useBatch: false
    });

    var aiCogsPerSeat = w.monthly;
    var totalCogsPerSeat = aiCogsPerSeat + paymentFee + fixedInfraPerSeat;
    var grossProfitPerSeat = price - totalCogsPerSeat;
    var grossMarginPct = price > 0 ? (grossProfitPerSeat / price) * 100 : 0;
    var netContributionForAI = Math.max(0, price - paymentFee - fixedInfraPerSeat);
    var breakEvenReqPerSeat = w.perReq > 0 ? Math.floor(netContributionForAI / w.perReq) : 999999;

    var health = grossMarginPct >= 75 ? 'healthy' : grossMarginPct >= 55 ? 'watch' : 'danger';

    return {
      model: m,
      price: price,
      seats: seats,
      paymentFee: paymentFee,
      fixedInfraPerSeat: fixedInfraPerSeat,
      aiCogsPerSeat: aiCogsPerSeat,
      totalCogsPerSeat: totalCogsPerSeat,
      grossProfitPerSeat: grossProfitPerSeat,
      grossMarginPct: grossMarginPct,
      totalMonthlyRevenue: price * seats,
      totalMonthlyAiSpend: aiCogsPerSeat * seats,
      totalMonthlyGrossProfit: grossProfitPerSeat * seats,
      breakEvenReqPerSeat: breakEvenReqPerSeat,
      costPerRequest: w.perReq,
      health: health
    };
  }

  // RAG & Vector Embedding TCO Planner
  function calcRagBudget(embedId, llmId, opts) {
    var emb = getEmbedding(embedId);
    var llm = getModel(llmId);
    var docCount = clamp(opts.docCount, 10, 50000000);
    var tokensPerDoc = clamp(opts.tokensPerDoc, 50, 100000);
    var overlapPct = clamp(opts.overlapPct || 15, 0, 50) / 100;
    var monthlyChurnPct = clamp(opts.monthlyChurnPct || 10, 0, 100) / 100;
    var dailyQueries = clamp(opts.dailyQueries, 1, 10000000);
    var topK = Math.round(clamp(opts.topK || 6, 1, 30));
    var chunkSize = clamp(opts.chunkSize || 512, 128, 4096);
    var outputTokens = clamp(opts.outputTokens || 450, 50, 16000);
    var cacheHitRate = clamp(opts.cacheHitRate || 30, 0, 95);

    var rawCorpusTokens = docCount * tokensPerDoc;
    var indexedTokens = rawCorpusTokens * (1 + overlapPct);
    var totalChunks = Math.ceil(indexedTokens / chunkSize);

    // Float32 vector memory footprint: dims * 4 bytes + ~30% HNSW index overhead
    var vectorRamGB = (totalChunks * emb.dims * 4 * 1.3) / (1024 * 1024 * 1024);
    var estVectorDbMonthly = Math.max(0, vectorRamGB <= 0.5 ? 0 : Math.ceil(vectorRamGB * 14));

    var oneTimeIngestCost = (indexedTokens / 1e6) * emb.per1M;
    var monthlyReindexCost = oneTimeIngestCost * monthlyChurnPct;
    var monthlyQueryEmbedCost = ((dailyQueries * 30 * 40) / 1e6) * emb.per1M;

    var synthInputTokens = 350 + topK * chunkSize;
    var synth = calcModelWorkload(llm, {
      inputTokens: synthInputTokens,
      outputTokens: outputTokens,
      dailyRequests: dailyQueries,
      cacheHitRate: cacheHitRate,
      useBatch: false
    });

    var monthlyTotal = monthlyReindexCost + monthlyQueryEmbedCost + estVectorDbMonthly + synth.monthly;

    return {
      embedding: emb,
      llm: llm,
      indexedTokens: indexedTokens,
      totalChunks: totalChunks,
      vectorRamGB: vectorRamGB,
      oneTimeIngestCost: oneTimeIngestCost,
      monthlyReindexCost: monthlyReindexCost,
      monthlyQueryEmbedCost: monthlyQueryEmbedCost,
      estVectorDbMonthly: estVectorDbMonthly,
      monthlySynthCost: synth.monthly,
      monthlyTotal: monthlyTotal,
      synthInputTokens: synthInputTokens
    };
  }

  // Self-Hosted GPU (vLLM/TGI) vs Cloud API Break-Even Calculator
  var GPU_PRESETS = [
    { id: 'rtx-4090-1x', name: '1x RTX 4090 (24GB)', hourlyUsd: 0.45, tokPerSec: 85, vramGb: 24 },
    { id: 'l40s-1x', name: '1x NVIDIA L40S (48GB)', hourlyUsd: 1.15, tokPerSec: 130, vramGb: 48 },
    { id: 'a100-80gb-1x', name: '1x NVIDIA A100 (80GB)', hourlyUsd: 1.65, tokPerSec: 175, vramGb: 80 },
    { id: 'h100-80gb-1x', name: '1x NVIDIA H100 (80GB)', hourlyUsd: 2.85, tokPerSec: 340, vramGb: 80 },
    { id: 'h100-80gb-4x', name: '4x NVIDIA H100 Node (320GB)', hourlyUsd: 11.20, tokPerSec: 1100, vramGb: 320 },
    { id: 'h100-80gb-8x', name: '8x NVIDIA H100 Cluster (640GB)', hourlyUsd: 21.90, tokPerSec: 2100, vramGb: 640 }
  ];

  function calcSelfHostVsApi(modelId, opts) {
    var m = getModel(modelId);
    var gpuHourly = clamp(opts.gpuHourly, 0.05, 500);
    var hoursPerDay = clamp(opts.hoursPerDay || 24, 1, 24);
    var devopsMonthly = clamp(opts.devopsMonthly || 400, 0, 50000);
    var tokPerSec = clamp(opts.tokPerSec || 175, 5, 50000);
    var avgUtilPct = clamp(opts.avgUtilPct || 35, 1, 100) / 100;
    var inputTokens = clamp(opts.inputTokens || 2000, 50, 200000);
    var outputTokens = clamp(opts.outputTokens || 500, 20, 50000);
    var dailyRequests = clamp(opts.dailyRequests || 5000, 1, 10000000);
    var cacheHitRate = clamp(opts.cacheHitRate || 50, 0, 95);

    var gpuMonthly = gpuHourly * hoursPerDay * 30;
    var selfHostMonthly = gpuMonthly + devopsMonthly;

    var apiWork = calcModelWorkload(m, {
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      dailyRequests: dailyRequests,
      cacheHitRate: cacheHitRate,
      useBatch: false
    });

    var monthlyOutputCapacity = tokPerSec * avgUtilPct * hoursPerDay * 3600 * 30;
    var monthlyOutputDemand = dailyRequests * outputTokens * 30;
    var monthlyTotalTokensDemand = dailyRequests * (inputTokens + outputTokens) * 30;
    var effectivePer1M = monthlyTotalTokensDemand > 0 ? (selfHostMonthly / (monthlyTotalTokensDemand / 1e6)) : 0;
    var capacityHeadroomPct = monthlyOutputCapacity > 0 ? (monthlyOutputDemand / monthlyOutputCapacity) * 100 : 100;
    var breakEvenDailyReqs = apiWork.perReq > 0 ? Math.ceil(selfHostMonthly / (apiWork.perReq * 30)) : 9999999;

    var verdict = capacityHeadroomPct > 90
      ? 'needs-more-gpus'
      : selfHostMonthly < apiWork.monthly * 0.85
        ? 'self-host-wins'
        : selfHostMonthly <= apiWork.monthly * 1.15
          ? 'hybrid-borderline'
          : 'cloud-api-wins';

    return {
      model: m,
      gpuMonthly: gpuMonthly,
      devopsMonthly: devopsMonthly,
      selfHostMonthly: selfHostMonthly,
      apiMonthly: apiWork.monthly,
      monthlyDiff: apiWork.monthly - selfHostMonthly,
      effectivePer1M: effectivePer1M,
      capacityHeadroomPct: capacityHeadroomPct,
      breakEvenDailyReqs: breakEvenDailyReqs,
      verdict: verdict
    };
  }

  // MCP & Function-Calling Tool Schema Tax Auditor
  function calcMcpSchemaTax(modelId, opts) {
    var m = getModel(modelId);
    var servers = Math.round(clamp(opts.servers || 5, 1, 50));
    var toolsPerServer = Math.round(clamp(opts.toolsPerServer || 12, 1, 100));
    var tokensPerTool = clamp(opts.tokensPerTool || 260, 40, 4000);
    var turnsPerSession = Math.round(clamp(opts.turnsPerSession || 15, 1, 100));
    var sessionsPerDay = clamp(opts.sessionsPerDay || 500, 1, 1000000);
    var cacheHitRate = clamp(opts.cacheHitRate || 80, 0, 95) / 100;
    var lazyDeferPct = clamp(opts.lazyDeferPct || 85, 0, 98) / 100;

    var totalTools = servers * toolsPerServer;
    var schemaTokensPerTurn = totalTools * tokensPerTool;
    var dailyTurns = turnsPerSession * sessionsPerDay;

    var uncachedTurnCost = (schemaTokensPerTurn / 1e6) * m.input;
    var cachedTurnCost = ((schemaTokensPerTurn * (1 - cacheHitRate)) / 1e6) * m.input +
      ((schemaTokensPerTurn * cacheHitRate) / 1e6) * m.cachedInput;

    // Lazy-loading / tool-search defers ~lazyDeferPct of schemas until invoked
    var lazyTokens = schemaTokensPerTurn * (1 - lazyDeferPct) + (totalTools * 14); // compact name index
    var lazyTurnCost = ((lazyTokens * (1 - cacheHitRate)) / 1e6) * m.input +
      ((lazyTokens * cacheHitRate) / 1e6) * m.cachedInput;

    var monthlyUncached = uncachedTurnCost * dailyTurns * 30;
    var monthlyCached = cachedTurnCost * dailyTurns * 30;
    var monthlyLazy = lazyTurnCost * dailyTurns * 30;

    return {
      model: m,
      totalTools: totalTools,
      schemaTokensPerTurn: schemaTokensPerTurn,
      lazyTokensPerTurn: Math.round(lazyTokens),
      contextTaxPct200k: Math.min(100, (schemaTokensPerTurn / 200000) * 100),
      monthlyUncached: monthlyUncached,
      monthlyCached: monthlyCached,
      monthlyLazy: monthlyLazy,
      monthlySavedWithLazy: Math.max(0, monthlyCached - monthlyLazy),
      annualSavedWithLazy: Math.max(0, monthlyCached - monthlyLazy) * 12
    };
  }

  // Analyze raw JSON array of MCP/OpenAI tool definitions
  function auditToolJson(rawJson) {
    var parsed = JSON.parse(rawJson);
    var arr = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.tools) ? parsed.tools : [parsed]);
    var items = arr.map(function (tool, idx) {
      var str = JSON.stringify(tool);
      var pretty = JSON.stringify(tool, null, 2);
      var name = (tool && (tool.name || (tool.function && tool.function.name))) || ('tool_' + (idx + 1));
      return {
        name: String(name),
        prettyTokens: estimateTokens(pretty).tokensOpenAI,
        minifiedTokens: estimateTokens(str).tokensOpenAI
      };
    });
    items.sort(function (a, b) { return b.prettyTokens - a.prettyTokens; });
    var totalPretty = items.reduce(function (s, x) { return s + x.prettyTokens; }, 0);
    var totalMin = items.reduce(function (s, x) { return s + x.minifiedTokens; }, 0);
    return { count: items.length, totalPretty: totalPretty, totalMinified: totalMin, savedTokens: Math.max(0, totalPretty - totalMin), topTools: items.slice(0, 8) };
  }

  // Multimodal Vision, PDF OCR, Voice Realtime & Image Gen Budget Studio
  var MULTIMODAL_RATES = {
    vision: [
      { id: 'gpt-5-vision', name: 'OpenAI GPT-5 Vision', tokensPerImage: 765, inputPer1M: 1.25, outputPer1M: 10.00 },
      { id: 'gpt-4.1-mini-vision', name: 'OpenAI GPT-4.1 mini Vision', tokensPerImage: 765, inputPer1M: 0.40, outputPer1M: 1.60 },
      { id: 'claude-sonnet-4-vision', name: 'Anthropic Claude Sonnet 4 Vision', tokensPerImage: 1334, inputPer1M: 3.00, outputPer1M: 15.00 },
      { id: 'gemini-2.5-flash-vision', name: 'Google Gemini 2.5 Flash Vision', tokensPerImage: 258, inputPer1M: 0.30, outputPer1M: 2.50 }
    ],
    voice: [
      { id: 'openai-realtime', name: 'OpenAI Realtime Voice API', usdPerMin: 0.24 },
      { id: 'openai-realtime-mini', name: 'OpenAI Realtime Mini Voice', usdPerMin: 0.065 },
      { id: 'gemini-live-flash', name: 'Google Gemini 2.5 Flash Live Audio', usdPerMin: 0.042 },
      { id: 'cascaded-stt-llm-tts', name: 'Cascaded STT (Whisper) + Flash + TTS', usdPerMin: 0.028 }
    ],
    imageGen: [
      { id: 'gpt-image-1-med', name: 'OpenAI GPT Image 1 (Medium)', usdPerImage: 0.042 },
      { id: 'imagen-3', name: 'Google Imagen 3 / 4 Standard', usdPerImage: 0.03 },
      { id: 'flux-pro', name: 'Flux 1.1 Pro (Hosted)', usdPerImage: 0.04 },
      { id: 'flux-schnell', name: 'Flux Schnell (Fast Open)', usdPerImage: 0.003 }
    ]
  };

  function calcMultimodalBudget(opts) {
    var vRate = MULTIMODAL_RATES.vision.find(function (x) { return x.id === opts.visionModel; }) || MULTIMODAL_RATES.vision[0];
    var aRate = MULTIMODAL_RATES.voice.find(function (x) { return x.id === opts.voiceModel; }) || MULTIMODAL_RATES.voice[0];
    var iRate = MULTIMODAL_RATES.imageGen.find(function (x) { return x.id === opts.imageModel; }) || MULTIMODAL_RATES.imageGen[0];

    var dailyImages = clamp(opts.dailyImages || 0, 0, 10000000);
    var visionOutTok = clamp(opts.visionOutTok || 250, 0, 10000);
    var dailyVoiceMins = clamp(opts.dailyVoiceMins || 0, 0, 10000000);
    var dailyGenImages = clamp(opts.dailyGenImages || 0, 0, 10000000);

    var visionMonthly = dailyImages * 30 * (((vRate.tokensPerImage + 120) / 1e6) * vRate.inputPer1M + (visionOutTok / 1e6) * vRate.outputPer1M);
    var voiceMonthly = dailyVoiceMins * 30 * aRate.usdPerMin;
    var imageGenMonthly = dailyGenImages * 30 * iRate.usdPerImage;
    var totalMonthly = visionMonthly + voiceMonthly + imageGenMonthly;

    return {
      visionModel: vRate,
      voiceModel: aRate,
      imageModel: iRate,
      visionMonthly: visionMonthly,
      voiceMonthly: voiceMonthly,
      imageGenMonthly: imageGenMonthly,
      totalMonthly: totalMonthly,
      totalAnnual: totalMonthly * 12
    };
  }

  function formatUsd(n) {
    var x = Number(n);
    if (!isFinite(x)) return '$0.00';
    var abs = Math.abs(x);
    var sign = x < 0 ? '-' : '';
    if (abs === 0) return '$0.00';
    if (abs < 0.0001) return sign + '$' + abs.toFixed(6);
    if (abs < 0.01) return sign + '$' + abs.toFixed(4);
    if (abs < 1000) return sign + '$' + abs.toFixed(2);
    return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatInt(n) {
    return Math.round(Number(n) || 0).toLocaleString('en-US');
  }

  return {
    MODELS: MODELS,
    EMBEDDINGS: EMBEDDINGS,
    GPU_PRESETS: GPU_PRESETS,
    MULTIMODAL_RATES: MULTIMODAL_RATES,
    getModel: getModel,
    getEmbedding: getEmbedding,
    estimateTokens: estimateTokens,
    calcModelWorkload: calcModelWorkload,
    calcCascadeSavings: calcCascadeSavings,
    calcAgentBurn: calcAgentBurn,
    calcSaasMargin: calcSaasMargin,
    calcRagBudget: calcRagBudget,
    calcSelfHostVsApi: calcSelfHostVsApi,
    calcMcpSchemaTax: calcMcpSchemaTax,
    auditToolJson: auditToolJson,
    calcMultimodalBudget: calcMultimodalBudget,
    formatUsd: formatUsd,
    formatInt: formatInt
  };
});
