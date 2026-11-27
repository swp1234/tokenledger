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
    { id: 'sonar-pro', name: 'Perplexity Sonar Pro', provider: 'Perplexity', tier: 'balanced', input: 3.00, cachedInput: 3.00, output: 15.00, batchDiscount: 0.0, context: 200000, badge: 'Search API' },
    { id: 'claude-sonnet-4.5', name: 'Claude 4.5 Sonnet', provider: 'Anthropic', tier: 'balanced', input: 3.00, cachedInput: 0.30, output: 15.00, batchDiscount: 0.5, context: 200000, badge: 'Coding Leader' },
    { id: 'claude-haiku-4.5', name: 'Claude 4.5 Haiku', provider: 'Anthropic', tier: 'mini', input: 1.00, cachedInput: 0.10, output: 5.00, batchDiscount: 0.5, context: 200000, badge: 'Fast Agent' },
    { id: 'o3-pro', name: 'OpenAI o3-pro', provider: 'OpenAI', tier: 'reasoning', input: 20.00, cachedInput: 5.00, output: 80.00, batchDiscount: 0.5, context: 200000, badge: 'Deep Research' },
    { id: 'deepseek-v3.1', name: 'DeepSeek-V3.1 (Hybrid)', provider: 'DeepSeek', tier: 'balanced', input: 0.28, cachedInput: 0.07, output: 1.10, batchDiscount: 0.5, context: 128000, badge: 'Hybrid MoE' },
    { id: 'qwen-3-235b', name: 'Qwen 3 235B-A22B (MoE)', provider: 'Alibaba', tier: 'balanced', input: 0.22, cachedInput: 0.11, output: 0.88, batchDiscount: 0.0, context: 131072, badge: 'Open MoE' },
    { id: 'amazon-nova-pro', name: 'Amazon Nova Pro (Bedrock)', provider: 'AWS', tier: 'balanced', input: 0.80, cachedInput: 0.20, output: 3.20, batchDiscount: 0.5, context: 300000, badge: 'AWS Native' },
    { id: 'claude-opus-4.5', name: 'Claude 4.5 Opus', provider: 'Anthropic', tier: 'frontier', input: 15.00, cachedInput: 1.50, output: 75.00, batchDiscount: 0.5, context: 200000, badge: 'Flagship Agent' },
    { id: 'gpt-5-pro', name: 'OpenAI GPT-5 Pro', provider: 'OpenAI', tier: 'reasoning', input: 15.00, cachedInput: 3.75, output: 120.00, batchDiscount: 0.5, context: 400000, badge: 'Max Reasoning' },
    { id: 'gemini-2.5-pro-think', name: 'Gemini 2.5 Pro Deep Think', provider: 'Google', tier: 'reasoning', input: 2.50, cachedInput: 0.625, output: 15.00, batchDiscount: 0.5, context: 1048576, badge: '1M Reasoning' },
    { id: 'mistral-medium-3', name: 'Mistral Medium 3', provider: 'Mistral', tier: 'balanced', input: 0.40, cachedInput: 0.40, output: 2.00, batchDiscount: 0.5, context: 128000, badge: 'EU Enterprise' },
    { id: 'cohere-command-a', name: 'Cohere Command A', provider: 'Cohere', tier: 'balanced', input: 2.50, cachedInput: 1.25, output: 10.00, batchDiscount: 0.5, context: 256000, badge: 'Enterprise RAG' },
    { id: 'amazon-nova-lite', name: 'Amazon Nova Lite (Bedrock)', provider: 'AWS', tier: 'mini', input: 0.06, cachedInput: 0.015, output: 0.24, batchDiscount: 0.5, context: 300000, badge: 'Ultra-Budget' },
    { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', tier: 'balanced', input: 3.00, cachedInput: 0.30, output: 15.00, batchDiscount: 0.5, context: 200000, badge: 'Hybrid Thinking' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'mini', input: 0.10, cachedInput: 0.025, output: 0.40, batchDiscount: 0.5, context: 1048576, badge: '1M Workhorse' },
    { id: 'llama-3.3-70b-hosted', name: 'Llama 3.3 70B (Hosted)', provider: 'Meta', tier: 'balanced', input: 0.59, cachedInput: 0.295, output: 0.79, batchDiscount: 0.0, context: 131072, badge: 'Open Workhorse' },
    { id: 'deepseek-v3-0324', name: 'DeepSeek-V3-0324', provider: 'DeepSeek', tier: 'balanced', input: 0.27, cachedInput: 0.07, output: 1.10, batchDiscount: 0.5, context: 128000, badge: 'Coding MoE' }
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

  // AI Startup Monthly Burn & Runway Planner
  function calcAiRunway(opts) {
    var cashOnHand = clamp(opts.cashOnHand || 250000, 1000, 1000000000);
    var mrr = clamp(opts.mrr || 8000, 0, 100000000);
    var mrrGrowthPct = clamp(opts.mrrGrowthPct || 12, -50, 200) / 100;
    var monthlyAiSpend = clamp(opts.monthlyAiSpend || 4500, 0, 50000000);
    var monthlyCloudInfra = clamp(opts.monthlyCloudInfra || 1800, 0, 50000000);
    var monthlyPayrollOps = clamp(opts.monthlyPayrollOps || 18000, 0, 100000000);
    var aiSpendScalesWithMrr = opts.aiScalesWithMrr !== false;

    var cash = cashOnHand;
    var curMrr = mrr;
    var curAi = monthlyAiSpend;
    var timeline = [];
    var runwayMonths = 60;
    var profitableMonth = null;

    for (var month = 1; month <= 60; month++) {
      var totalBurn = curAi + monthlyCloudInfra + monthlyPayrollOps;
      var netBurn = totalBurn - curMrr;
      if (netBurn <= 0 && profitableMonth === null) profitableMonth = month;
      cash = cash - netBurn;
      if (month <= 24) {
        timeline.push({
          month: month,
          mrr: Math.round(curMrr),
          aiSpend: Math.round(curAi),
          totalBurn: Math.round(totalBurn),
          netBurn: Math.round(netBurn),
          endingCash: Math.max(0, Math.round(cash))
        });
      }
      if (cash <= 0 && runwayMonths === 60) {
        runwayMonths = month;
      }
      var nextMrr = curMrr * (1 + mrrGrowthPct);
      if (aiSpendScalesWithMrr && curMrr > 0) {
        curAi = curAi * (1 + mrrGrowthPct * 0.75);
      }
      curMrr = nextMrr;
    }

    var month1Burn = monthlyAiSpend + monthlyCloudInfra + monthlyPayrollOps;
    var month1NetBurn = month1Burn - mrr;
    var aiShareOfBurnPct = month1Burn > 0 ? (monthlyAiSpend / month1Burn) * 100 : 0;

    return {
      month1Burn: month1Burn,
      month1NetBurn: month1NetBurn,
      aiShareOfBurnPct: aiShareOfBurnPct,
      runwayMonths: runwayMonths,
      defaultAlive: profitableMonth !== null && profitableMonth <= runwayMonths,
      profitableMonth: profitableMonth,
      timeline: timeline
    };
  }

  // Prompt A vs Prompt B Compression & Annual Savings Diff
  function calcPromptDiff(promptA, promptB, dailyRequests, cacheHitRate) {
    var estA = estimateTokens(promptA);
    var estB = estimateTokens(promptB);
    var savedOpenAI = estA.tokensOpenAI - estB.tokensOpenAI;
    var savedClaude = estA.tokensClaude - estB.tokensClaude;
    var savedGemini = estA.tokensGemini - estB.tokensGemini;
    var pct = estA.tokensOpenAI > 0 ? (savedOpenAI / estA.tokensOpenAI) * 100 : 0;
    var reqs = clamp(dailyRequests || 2000, 1, 100000000);
    var cache = clamp(cacheHitRate || 50, 0, 95);

    var benchmarks = ['claude-opus-4', 'claude-sonnet-4', 'gpt-5', 'gpt-4.1', 'gemini-2.5-pro', 'gemini-2.5-flash'].map(function (id) {
      var m = getModel(id);
      var a = calcModelWorkload(m, { inputTokens: estA.tokensOpenAI, outputTokens: 0, dailyRequests: reqs, cacheHitRate: cache, useBatch: false });
      var b = calcModelWorkload(m, { inputTokens: estB.tokensOpenAI, outputTokens: 0, dailyRequests: reqs, cacheHitRate: cache, useBatch: false });
      return {
        model: m.name,
        provider: m.provider,
        monthlyDelta: a.monthly - b.monthly,
        annualDelta: a.annual - b.annual
      };
    });

    return {
      estA: estA,
      estB: estB,
      savedOpenAI: savedOpenAI,
      savedClaude: savedClaude,
      savedGemini: savedGemini,
      compressionPct: pct,
      benchmarks: benchmarks
    };
  }

  // Fine-Tuning vs RAG vs Prompt Caching 12-Month TCO Calculator
  function calcFineTuneVsRag(opts) {
    var baseModel = getModel(opts.baseModelId || 'gpt-4.1-mini');
    var kbTokens = clamp(opts.kbTokens || 150000, 1000, 20000000);
    var dailyRequests = clamp(opts.dailyRequests || 4000, 1, 10000000);
    var userPromptTokens = clamp(opts.userPromptTokens || 350, 20, 50000);
    var outputTokens = clamp(opts.outputTokens || 450, 20, 32000);
    var trainCostPer1M = clamp(opts.trainCostPer1M || 3.00, 0.1, 100);
    var trainEpochs = clamp(opts.trainEpochs || 3, 1, 10);
    var retrainsPerYear = clamp(opts.retrainsPerYear || 6, 1, 52);
    var ftInferMultiplier = clamp(opts.ftInferMultiplier || 1.6, 1.0, 4.0);
    var ragTopKTokens = clamp(opts.ragTopKTokens || 2400, 200, 40000);
    var vectorDbMonthly = clamp(opts.vectorDbMonthly || 70, 0, 10000);
    var cacheHitRate = clamp(opts.cacheHitRate || 85, 0, 95);

    // 1. Fine-Tuning 12-month TCO
    var oneTrainCost = (kbTokens / 1e6) * trainCostPer1M * trainEpochs;
    var annualTrainCost = oneTrainCost * retrainsPerYear;
    var ftInRate = baseModel.input * ftInferMultiplier;
    var ftOutRate = baseModel.output * ftInferMultiplier;
    var ftMonthlyInfer = dailyRequests * 30 * ((userPromptTokens / 1e6) * ftInRate + (outputTokens / 1e6) * ftOutRate);
    var ftAnnual = annualTrainCost + ftMonthlyInfer * 12;

    // 2. RAG + Vector DB 12-month TCO
    var ragWork = calcModelWorkload(baseModel, {
      inputTokens: userPromptTokens + ragTopKTokens,
      outputTokens: outputTokens,
      dailyRequests: dailyRequests,
      cacheHitRate: 30,
      useBatch: false
    });
    var ragEmbedAnnual = ((kbTokens * retrainsPerYear + dailyRequests * 365 * 40) / 1e6) * 0.02;
    var ragAnnual = (ragWork.monthly + vectorDbMonthly) * 12 + ragEmbedAnnual;

    // 3. Long-Context Prompt Caching 12-month TCO (fits if kbTokens <= 1M)
    var cacheFits = kbTokens <= 900000;
    var cacheWork = calcModelWorkload(baseModel, {
      inputTokens: Math.min(kbTokens, 900000) + userPromptTokens,
      outputTokens: outputTokens,
      dailyRequests: dailyRequests,
      cacheHitRate: cacheHitRate,
      useBatch: false
    });
    var cacheAnnual = cacheFits ? cacheWork.monthly * 12 : null;

    var candidates = [
      { id: 'fine-tuning', label: 'Fine-Tuning (LoRA/SFT)', annual: ftAnnual, monthly: ftAnnual / 12 },
      { id: 'rag', label: 'RAG + Vector DB', annual: ragAnnual, monthly: ragAnnual / 12 }
    ];
    if (cacheFits) {
      candidates.push({ id: 'prompt-caching', label: 'Long-Context Prompt Caching', annual: cacheAnnual, monthly: cacheAnnual / 12 });
    }
    candidates.sort(function (a, b) { return a.annual - b.annual; });

    return {
      model: baseModel,
      oneTrainCost: oneTrainCost,
      annualTrainCost: annualTrainCost,
      ftMonthly: ftAnnual / 12,
      ftAnnual: ftAnnual,
      ragMonthly: ragAnnual / 12,
      ragAnnual: ragAnnual,
      cacheFits: cacheFits,
      cacheMonthly: cacheFits ? cacheAnnual / 12 : null,
      cacheAnnual: cacheAnnual,
      winner: candidates[0],
      runnerUp: candidates[1],
      annualSavingsVsRunnerUp: candidates[1].annual - candidates[0].annual
    };
  }

  // LLM Rate-Limit (RPM / TPM / Concurrency) & Tier Capacity Planner
  function calcRateLimitPlan(modelId, opts) {
    var m = getModel(modelId);
    var avgRpm = clamp(opts.avgRpm || 120, 1, 500000);
    var burstMultiplier = clamp(opts.burstMultiplier || 2.5, 1, 10);
    var inputTokens = clamp(opts.inputTokens || 2500, 50, 500000);
    var outputTokens = clamp(opts.outputTokens || 600, 20, 64000);
    var avgLatencySec = clamp(opts.avgLatencySec || 4.5, 0.2, 120);
    var cacheHitRate = clamp(opts.cacheHitRate || 50, 0, 95);

    var peakRpm = Math.ceil(avgRpm * burstMultiplier);
    var totalTokPerReq = inputTokens + outputTokens;
    var peakTpm = peakRpm * totalTokPerReq;
    var peakOutputTpm = peakRpm * outputTokens;
    // Little's Law: L = lambda * W
    var peakConcurrency = Math.ceil((peakRpm / 60) * avgLatencySec);
    var recommendedTier = peakTpm <= 200000 ? 'Tier 1–2 (Standard Pay-As-You-Go)'
      : peakTpm <= 2000000 ? 'Tier 3–4 (Scale API + Exponential Backoff)'
        : peakTpm <= 10000000 ? 'Tier 5 + Multi-Region Failover Router'
          : 'Provisioned Throughput / Enterprise PTU';

    var dailyReqsAtAvg = Math.round(avgRpm * 60 * 14); // 14 active-equivalent hours/day
    var monthlyWork = calcModelWorkload(m, {
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      dailyRequests: dailyReqsAtAvg,
      cacheHitRate: cacheHitRate,
      useBatch: false
    });

    return {
      model: m,
      avgRpm: avgRpm,
      peakRpm: peakRpm,
      peakTpm: peakTpm,
      peakOutputTpm: peakOutputTpm,
      peakConcurrency: peakConcurrency,
      recommendedTier: recommendedTier,
      estMonthlyCost: monthlyWork.monthly,
      backupProvidersNeeded: peakTpm > 2000000 ? 2 : 1
    };
  }

  // LLM GPU VRAM & KV-Cache Quantization Calculator
  var VRAM_MODELS = [
    { id: 'llama-3.1-8b', name: 'Llama 3.1 / 3.3 8B', paramsB: 8, layers: 32, kvHeads: 8, headDim: 128 },
    { id: 'qwen-2.5-14b', name: 'Qwen 2.5 / 3 14B', paramsB: 14.8, layers: 48, kvHeads: 8, headDim: 128 },
    { id: 'gemma-3-27b', name: 'Gemma 3 27B', paramsB: 27, layers: 62, kvHeads: 16, headDim: 128 },
    { id: 'qwen-2.5-32b', name: 'Qwen 2.5 / QwQ 32B', paramsB: 32.5, layers: 64, kvHeads: 8, headDim: 128 },
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128 },
    { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', paramsB: 72.7, layers: 80, kvHeads: 8, headDim: 128 },
    { id: 'llama-4-scout-109b', name: 'Llama 4 Scout (109B MoE)', paramsB: 109, layers: 48, kvHeads: 8, headDim: 128 },
    { id: 'llama-4-maverick-400b', name: 'Llama 4 Maverick (400B MoE)', paramsB: 400, layers: 48, kvHeads: 8, headDim: 128 },
    { id: 'deepseek-r1-671b', name: 'DeepSeek-V3 / R1 (671B MoE)', paramsB: 671, layers: 61, kvHeads: 8, headDim: 128 }
  ];

  var QUANT_BITS = {
    fp16: { label: 'FP16 / BF16 (16-bit)', bytesPerParam: 2.0 },
    fp8: { label: 'FP8 / INT8 (8-bit)', bytesPerParam: 1.05 },
    q6k: { label: 'GGUF Q6_K (~6.6-bit)', bytesPerParam: 0.83 },
    q4km: { label: 'GGUF Q4_K_M / AWQ 4-bit', bytesPerParam: 0.58 },
    q3km: { label: 'GGUF Q3_K_M (~3.9-bit)', bytesPerParam: 0.49 }
  };

  function calcGpuVram(opts) {
    var preset = VRAM_MODELS.find(function (x) { return x.id === opts.modelId; }) || VRAM_MODELS[4];
    var paramsB = clamp(opts.paramsB || preset.paramsB, 0.5, 2000);
    var quant = QUANT_BITS[opts.quant] || QUANT_BITS.q4km;
    var contextLen = clamp(opts.contextLen || 8192, 512, 1000000);
    var batchSize = Math.round(clamp(opts.batchSize || 4, 1, 256));
    var kvQuantBytes = opts.kvFp8 ? 1 : 2; // FP8 KV cache vs FP16 KV cache
    var layers = clamp(opts.layers || preset.layers, 8, 200);
    var kvHeads = clamp(opts.kvHeads || preset.kvHeads, 1, 128);
    var headDim = clamp(opts.headDim || preset.headDim, 32, 256);

    var weightsGB = (paramsB * 1e9 * quant.bytesPerParam) / (1024 * 1024 * 1024);
    // KV cache bytes = 2 (K+V) * layers * kvHeads * headDim * contextLen * batchSize * kvQuantBytes
    var kvCacheGB = (2 * layers * kvHeads * headDim * contextLen * batchSize * kvQuantBytes) / (1024 * 1024 * 1024);
    var overheadGB = Math.max(1.2, (weightsGB + kvCacheGB) * 0.12);
    var totalVramGB = weightsGB + kvCacheGB + overheadGB;

    var hw = totalVramGB <= 22 ? { name: '1x RTX 4090 / 3090 (24GB)', hourly: 0.45, vram: 24 }
      : totalVramGB <= 44 ? { name: '1x NVIDIA L40S / A6000 (48GB)', hourly: 1.15, vram: 48 }
        : totalVramGB <= 74 ? { name: '1x NVIDIA A100 / H100 (80GB)', hourly: 1.65, vram: 80 }
          : totalVramGB <= 150 ? { name: '2x NVIDIA H100 (160GB) or Mac Studio 192GB', hourly: 5.70, vram: 160 }
            : totalVramGB <= 300 ? { name: '4x NVIDIA H100 Node (320GB)', hourly: 11.20, vram: 320 }
              : totalVramGB <= 600 ? { name: '8x NVIDIA H100 Cluster (640GB)', hourly: 21.90, vram: 640 }
                : { name: 'Multi-Node 2x8 H100 / H200 Cluster (1.1TB+)', hourly: 43.80, vram: 1128 };

    return {
      preset: preset,
      quantLabel: quant.label,
      weightsGB: weightsGB,
      kvCacheGB: kvCacheGB,
      overheadGB: overheadGB,
      totalVramGB: totalVramGB,
      recommendedHw: hw,
      estCloudMonthly: hw.hourly * 24 * 30
    };
  }

  // Enterprise Hybrid Traffic Waterfall (Realtime Frontier + Fast/Mini Cascade + 50% Async Batch + Prompt Caching)
  function calcHybridWaterfall(opts) {
    var frontier = getModel(opts.frontierId || 'claude-sonnet-4');
    var mini = getModel(opts.miniId || 'gemini-2.5-flash');
    var inputTokens = clamp(opts.inputTokens || 3500, 50, 500000);
    var outputTokens = clamp(opts.outputTokens || 700, 20, 64000);
    var dailyRequests = clamp(opts.dailyRequests || 10000, 1, 100000000);
    var miniPct = clamp(opts.miniPct || 55, 0, 95);
    var batchPct = clamp(opts.batchPct || 25, 0, 100 - miniPct);
    var frontierPct = Math.max(0, 100 - miniPct - batchPct);
    var cacheHitRate = clamp(opts.cacheHitRate || 70, 0, 95);

    var baseline = calcModelWorkload(frontier, { inputTokens: inputTokens, outputTokens: outputTokens, dailyRequests: dailyRequests, cacheHitRate: 0, useBatch: false });
    var afterCacheOnly = calcModelWorkload(frontier, { inputTokens: inputTokens, outputTokens: outputTokens, dailyRequests: dailyRequests, cacheHitRate: cacheHitRate, useBatch: false });
    var laneFrontier = calcModelWorkload(frontier, { inputTokens: inputTokens, outputTokens: outputTokens, dailyRequests: dailyRequests * (frontierPct / 100), cacheHitRate: cacheHitRate, useBatch: false });
    var laneMini = calcModelWorkload(mini, { inputTokens: inputTokens, outputTokens: outputTokens, dailyRequests: dailyRequests * (miniPct / 100), cacheHitRate: cacheHitRate, useBatch: false });
    var laneBatch = calcModelWorkload(frontier, { inputTokens: inputTokens, outputTokens: outputTokens, dailyRequests: dailyRequests * (batchPct / 100), cacheHitRate: cacheHitRate, useBatch: true });

    var optimizedMonthly = laneFrontier.monthly + laneMini.monthly + laneBatch.monthly;
    var monthlySaved = Math.max(0, baseline.monthly - optimizedMonthly);
    var savedPct = baseline.monthly > 0 ? (monthlySaved / baseline.monthly) * 100 : 0;

    return {
      frontier: frontier,
      mini: mini,
      split: { frontierPct: frontierPct, miniPct: miniPct, batchPct: batchPct },
      baselineMonthly: baseline.monthly,
      afterCacheOnlyMonthly: afterCacheOnly.monthly,
      laneFrontierMonthly: laneFrontier.monthly,
      laneMiniMonthly: laneMini.monthly,
      laneBatchMonthly: laneBatch.monthly,
      optimizedMonthly: optimizedMonthly,
      monthlySaved: monthlySaved,
      annualSaved: monthlySaved * 12,
      savedPct: savedPct
    };
  }

  // Speech-to-Text (STT) & Text-to-Speech (TTS) Audio API FinOps Calculator
  var AUDIO_STT_MODELS = [
    { id: 'groq-whisper-v3-turbo', name: 'Groq Whisper Large-v3-Turbo', provider: 'Groq', perMin: 0.00067, diarizationAdd: 0, note: 'Fastest batch STT ($0.04/hr)' },
    { id: 'gemini-2.5-flash-audio', name: 'Gemini 2.5 Flash Audio', provider: 'Google', perMin: 0.0019, diarizationAdd: 0, note: 'Multimodal audio + reasoning' },
    { id: 'openai-gpt4o-mini-transcribe', name: 'GPT-4o-mini Transcribe', provider: 'OpenAI', perMin: 0.0030, diarizationAdd: 0, note: 'Low-cost OpenAI STT' },
    { id: 'deepgram-nova-3', name: 'Deepgram Nova-3 (Pre-recorded)', provider: 'Deepgram', perMin: 0.0043, diarizationAdd: 0.0020, note: 'Streaming & enterprise accuracy' },
    { id: 'openai-whisper', name: 'OpenAI Whisper (whisper-1)', provider: 'OpenAI', perMin: 0.0060, diarizationAdd: 0, note: 'Industry baseline STT' },
    { id: 'openai-gpt4o-transcribe', name: 'OpenAI GPT-4o Transcribe', provider: 'OpenAI', perMin: 0.0060, diarizationAdd: 0, note: 'Higher accuracy on noisy audio' },
    { id: 'assemblyai-universal-2', name: 'AssemblyAI Universal-2', provider: 'AssemblyAI', perMin: 0.0062, diarizationAdd: 0.0015, note: 'Speaker labels & PII redaction' }
  ];

  var AUDIO_TTS_MODELS = [
    { id: 'openai-gpt4o-mini-tts', name: 'OpenAI GPT-4o-mini-TTS', provider: 'OpenAI', per1MChars: 12.00, note: 'Steerable budget voice' },
    { id: 'openai-tts-1', name: 'OpenAI TTS-1', provider: 'OpenAI', per1MChars: 15.00, note: 'Standard low-latency TTS' },
    { id: 'deepgram-aura-2', name: 'Deepgram Aura-2', provider: 'Deepgram', per1MChars: 15.00, note: 'Voice-agent tuned streaming' },
    { id: 'google-chirp-3', name: 'Google Cloud Neural2 / Chirp', provider: 'Google', per1MChars: 16.00, note: 'Global multilingual TTS' },
    { id: 'openai-tts-1-hd', name: 'OpenAI TTS-1 HD', provider: 'OpenAI', per1MChars: 30.00, note: 'High-definition narration' },
    { id: 'cartesia-sonic-2', name: 'Cartesia Sonic 2', provider: 'Cartesia', per1MChars: 45.00, note: 'Ultra-low latency (<90ms)' },
    { id: 'elevenlabs-flash-v2.5', name: 'ElevenLabs Flash v2.5 (Scale)', provider: 'ElevenLabs', per1MChars: 90.00, note: 'Expressive real-time voice' },
    { id: 'elevenlabs-multilingual-v2', name: 'ElevenLabs Multilingual v2', provider: 'ElevenLabs', per1MChars: 180.00, note: 'Studio-grade cloning & dubbing' }
  ];

  function calcAudioPipeline(opts) {
    var stt = AUDIO_STT_MODELS.find(function (x) { return x.id === opts.sttId; }) || AUDIO_STT_MODELS[3];
    var tts = AUDIO_TTS_MODELS.find(function (x) { return x.id === opts.ttsId; }) || AUDIO_TTS_MODELS[1];
    var dailyAudioMins = clamp(opts.dailyAudioMins != null ? opts.dailyAudioMins : 1200, 0, 10000000);
    var vadSilenceTrimPct = clamp(opts.vadSilenceTrimPct != null ? opts.vadSilenceTrimPct : 30, 0, 75);
    var needDiarization = Boolean(opts.needDiarization);
    var dailyTtsChars = clamp(opts.dailyTtsChars != null ? opts.dailyTtsChars : 250000, 0, 1000000000);
    var ttsCacheHitPct = clamp(opts.ttsCacheHitPct != null ? opts.ttsCacheHitPct : 25, 0, 95);

    var rawSttRate = stt.perMin + (needDiarization ? stt.diarizationAdd : 0);
    var rawSttMonthly = dailyAudioMins * 30 * rawSttRate;
    var billedMinsPerDay = dailyAudioMins * (1 - vadSilenceTrimPct / 100);
    var optSttMonthly = billedMinsPerDay * 30 * rawSttRate;

    var rawTtsMonthly = ((dailyTtsChars * 30) / 1e6) * tts.per1MChars;
    var optTtsMonthly = rawTtsMonthly * (1 - ttsCacheHitPct / 100);

    var rawTotalMonthly = rawSttMonthly + rawTtsMonthly;
    var optTotalMonthly = optSttMonthly + optTtsMonthly;
    var monthlySaved = Math.max(0, rawTotalMonthly - optTotalMonthly);

    var sttComparison = AUDIO_STT_MODELS.map(function (m) {
      var rate = m.perMin + (needDiarization ? m.diarizationAdd : 0);
      var mo = billedMinsPerDay * 30 * rate;
      return { model: m, effectivePerMin: rate, monthly: mo, annual: mo * 12 };
    }).sort(function (a, b) { return a.monthly - b.monthly; });

    var ttsComparison = AUDIO_TTS_MODELS.map(function (m) {
      var mo = ((dailyTtsChars * 30 * (1 - ttsCacheHitPct / 100)) / 1e6) * m.per1MChars;
      return { model: m, monthly: mo, annual: mo * 12 };
    }).sort(function (a, b) { return a.monthly - b.monthly; });

    return {
      stt: stt,
      tts: tts,
      billedMinsPerDay: billedMinsPerDay,
      rawSttMonthly: rawSttMonthly,
      optSttMonthly: optSttMonthly,
      rawTtsMonthly: rawTtsMonthly,
      optTtsMonthly: optTtsMonthly,
      rawTotalMonthly: rawTotalMonthly,
      optTotalMonthly: optTotalMonthly,
      annualTotal: optTotalMonthly * 12,
      monthlySaved: monthlySaved,
      sttComparison: sttComparison,
      ttsComparison: ttsComparison
    };
  }

  // AI Image & Video Generation Studio Cost Calculator
  var IMAGE_GEN_MODELS = [
    { id: 'flux-1-schnell', name: 'FLUX.1 [schnell] (API)', provider: 'Black Forest Labs', perImg: 0.003, tier: 'Draft / Fast' },
    { id: 'gpt-image-1-low', name: 'OpenAI GPT-Image-1 (Low)', provider: 'OpenAI', perImg: 0.011, tier: 'Fast Draft' },
    { id: 'imagen-3-fast', name: 'Google Imagen 3 Fast', provider: 'Google', perImg: 0.020, tier: 'Fast Photoreal' },
    { id: 'flux-1-dev', name: 'FLUX.1 [dev] (API)', provider: 'Black Forest Labs', perImg: 0.025, tier: 'Open Quality' },
    { id: 'imagen-3', name: 'Google Imagen 3', provider: 'Google', perImg: 0.030, tier: 'Production' },
    { id: 'flux-1-1-pro', name: 'FLUX 1.1 [pro]', provider: 'Black Forest Labs', perImg: 0.040, tier: 'Commercial Pro' },
    { id: 'gpt-image-1-med', name: 'OpenAI GPT-Image-1 (Medium)', provider: 'OpenAI', perImg: 0.042, tier: 'Text + Layout' },
    { id: 'flux-1-1-pro-ultra', name: 'FLUX 1.1 [pro] Ultra (2K)', provider: 'Black Forest Labs', perImg: 0.060, tier: '2K High-Res' },
    { id: 'ideogram-3', name: 'Ideogram 3.0', provider: 'Ideogram', perImg: 0.060, tier: 'Typography' },
    { id: 'gpt-image-1-high', name: 'OpenAI GPT-Image-1 (High)', provider: 'OpenAI', perImg: 0.167, tier: 'Hero Assets' }
  ];

  var VIDEO_GEN_MODELS = [
    { id: 'runway-gen4-turbo', name: 'Runway Gen-4 Turbo', provider: 'Runway', perSec: 0.05, tier: 'Fast Commercial' },
    { id: 'kling-1-6-pro', name: 'Kling 1.6 Pro (1080p)', provider: 'Kuaishou', perSec: 0.09, tier: 'Cinematic Value' },
    { id: 'luma-ray-2', name: 'Luma Ray 2 (720p)', provider: 'Luma AI', perSec: 0.10, tier: 'Physics Motion' },
    { id: 'sora-api-est', name: 'OpenAI Sora (720p/1080p)', provider: 'OpenAI', perSec: 0.25, tier: 'Flagship Video' },
    { id: 'veo-2', name: 'Google Veo 2 (1080p)', provider: 'Google', perSec: 0.35, tier: 'Studio Realism' },
    { id: 'veo-3-fast', name: 'Google Veo 3 Fast (Audio)', provider: 'Google', perSec: 0.40, tier: 'Native Audio+Video' }
  ];

  function calcMediaGenBudget(opts) {
    var imgModel = IMAGE_GEN_MODELS.find(function (x) { return x.id === opts.imgModelId; }) || IMAGE_GEN_MODELS[5];
    var vidModel = VIDEO_GEN_MODELS.find(function (x) { return x.id === opts.vidModelId; }) || VIDEO_GEN_MODELS[0];
    var dailyPublishedImages = clamp(opts.dailyPublishedImages != null ? opts.dailyPublishedImages : 150, 0, 1000000);
    var imgRetryFactor = clamp(opts.imgRetryFactor != null ? opts.imgRetryFactor : 2.5, 1, 12);
    var dailyVideoClips = clamp(opts.dailyVideoClips != null ? opts.dailyVideoClips : 15, 0, 100000);
    var avgClipSec = clamp(opts.avgClipSec != null ? opts.avgClipSec : 6, 1, 60);
    var vidRetryFactor = clamp(opts.vidRetryFactor != null ? opts.vidRetryFactor : 3.0, 1, 12);
    var useDraftCascade = Boolean(opts.useDraftCascade);

    var totalImgGensDay = dailyPublishedImages * imgRetryFactor;
    var rawImgMonthly = totalImgGensDay * 30 * imgModel.perImg;
    // Draft cascade: run (retryFactor - 1) drafts on FLUX schnell ($0.003) and only final 1x on selected pro model
    var cascadeImgMonthly = dailyPublishedImages * 30 * (imgModel.perImg + Math.max(0, imgRetryFactor - 1) * 0.003);
    var effImgMonthly = useDraftCascade ? Math.min(rawImgMonthly, cascadeImgMonthly) : rawImgMonthly;

    var totalVidSecsDay = dailyVideoClips * avgClipSec * vidRetryFactor;
    var vidMonthly = totalVidSecsDay * 30 * vidModel.perSec;

    var totalMonthly = effImgMonthly + vidMonthly;
    var draftSavingsMonthly = Math.max(0, rawImgMonthly - cascadeImgMonthly);
    var costPerPublishedImg = dailyPublishedImages > 0 ? (effImgMonthly / (dailyPublishedImages * 30)) : 0;
    var costPerPublishedClip = dailyVideoClips > 0 ? (vidMonthly / (dailyVideoClips * 30)) : 0;

    return {
      imgModel: imgModel,
      vidModel: vidModel,
      totalImgGensDay: totalImgGensDay,
      totalVidSecsDay: totalVidSecsDay,
      rawImgMonthly: rawImgMonthly,
      effImgMonthly: effImgMonthly,
      vidMonthly: vidMonthly,
      totalMonthly: totalMonthly,
      annualTotal: totalMonthly * 12,
      draftSavingsMonthly: draftSavingsMonthly,
      costPerPublishedImg: costPerPublishedImg,
      costPerPublishedClip: costPerPublishedClip
    };
  }

  // LLM Latency, TTFT & Streaming UX Speed Calculator
  var LATENCY_PROFILES = [
    { id: 'cerebras-llama70b', name: 'Cerebras Llama 3.3 70B', provider: 'Cerebras', ttftMs: 180, tokPerSec: 2100, inRate: 0.85, outRate: 1.20 },
    { id: 'groq-llama70b', name: 'Groq Llama 3.3 70B', provider: 'Groq', ttftMs: 240, tokPerSec: 330, inRate: 0.59, outRate: 0.79 },
    { id: 'fireworks-deepseek', name: 'Fireworks DeepSeek-V3.1', provider: 'Fireworks', ttftMs: 380, tokPerSec: 180, inRate: 0.56, outRate: 1.68 },
    { id: 'gemini-2.5-flash-lat', name: 'Google Gemini 2.5 Flash', provider: 'Google', ttftMs: 420, tokPerSec: 170, inRate: 0.30, outRate: 2.50 },
    { id: 'gpt-5-mini-lat', name: 'OpenAI GPT-5 mini', provider: 'OpenAI', ttftMs: 460, tokPerSec: 120, inRate: 0.25, outRate: 2.00 },
    { id: 'claude-haiku-4.5-lat', name: 'Anthropic Claude 4.5 Haiku', provider: 'Anthropic', ttftMs: 440, tokPerSec: 115, inRate: 1.00, outRate: 5.00 },
    { id: 'amazon-nova-pro-lat', name: 'AWS Bedrock Nova Pro', provider: 'AWS', ttftMs: 490, tokPerSec: 105, inRate: 0.80, outRate: 3.20 },
    { id: 'gemini-2.5-pro-lat', name: 'Google Gemini 2.5 Pro', provider: 'Google', ttftMs: 850, tokPerSec: 90, inRate: 1.25, outRate: 10.00 },
    { id: 'gpt-5-lat', name: 'OpenAI GPT-5', provider: 'OpenAI', ttftMs: 780, tokPerSec: 85, inRate: 1.25, outRate: 10.00 },
    { id: 'claude-sonnet-4.5-lat', name: 'Anthropic Claude 4.5 Sonnet', provider: 'Anthropic', ttftMs: 740, tokPerSec: 75, inRate: 3.00, outRate: 15.00 },
    { id: 'deepseek-r1-lat', name: 'DeepSeek-R1 (Reasoning)', provider: 'DeepSeek', ttftMs: 1450, tokPerSec: 45, inRate: 0.55, outRate: 2.19 },
    { id: 'claude-opus-4-lat', name: 'Anthropic Claude Opus 4', provider: 'Anthropic', ttftMs: 1150, tokPerSec: 40, inRate: 15.00, outRate: 75.00 }
  ];

  function calcLatencyBudget(opts) {
    var inputTokens = clamp(opts.inputTokens != null ? opts.inputTokens : 2500, 50, 500000);
    var outputTokens = clamp(opts.outputTokens != null ? opts.outputTokens : 500, 10, 32000);
    var networkRttMs = clamp(opts.networkRttMs != null ? opts.networkRttMs : 80, 0, 2000);
    var slaTargetSec = clamp(opts.slaTargetSec != null ? opts.slaTargetSec : 5.0, 0.5, 120);

    var rows = LATENCY_PROFILES.map(function (p) {
      // Prefill scales mildly with input length (~30ms per additional 1K input tokens beyond 1K)
      var prefillAddMs = Math.max(0, (inputTokens - 1000) / 1000) * 32;
      var ttftSec = (p.ttftMs + prefillAddMs + networkRttMs) / 1000;
      var genSec = outputTokens / p.tokPerSec;
      var totalSec = ttftSec + genSec;
      var costPer10k = 10000 * ((inputTokens / 1e6) * p.inRate + (outputTokens / 1e6) * p.outRate);
      var uxBand = totalSec <= 1.5 ? 'Instant' : totalSec <= 4.0 ? 'Snappy' : totalSec <= 9.0 ? 'Noticeable' : 'Async / Queue';
      return {
        profile: p,
        ttftSec: ttftSec,
        genSec: genSec,
        totalSec: totalSec,
        meetsSla: totalSec <= slaTargetSec,
        uxBand: uxBand,
        costPer10k: costPer10k
      };
    }).sort(function (a, b) { return a.totalSec - b.totalSec; });

    var selected = rows.find(function (r) { return r.profile.id === opts.profileId; }) || rows[4];
    var passingCount = rows.filter(function (r) { return r.meetsSla; }).length;
    return {
      selected: selected,
      fastest: rows[0],
      passingCount: passingCount,
      slaTargetSec: slaTargetSec,
      rows: rows
    };
  }

  // AI SaaS Pricing Tier & Credit-Pack Architect
  function calcPricingTiers(opts) {
    var m = getModel(opts.modelId || 'gemini-2.5-flash');
    var inputTokens = clamp(opts.inputTokens != null ? opts.inputTokens : 2800, 50, 200000);
    var outputTokens = clamp(opts.outputTokens != null ? opts.outputTokens : 650, 20, 32000);
    var cacheHitRate = clamp(opts.cacheHitRate != null ? opts.cacheHitRate : 55, 0, 95);
    var targetMarginPct = clamp(opts.targetMarginPct != null ? opts.targetMarginPct : 78, 40, 95);
    var proPrice = clamp(opts.proPrice != null ? opts.proPrice : 29, 5, 500);
    var teamPrice = clamp(opts.teamPrice != null ? opts.teamPrice : 79, 10, 2000);
    var entPrice = clamp(opts.entPrice != null ? opts.entPrice : 299, 50, 10000);
    var fixedInfraPerUser = clamp(opts.fixedInfraPerUser != null ? opts.fixedInfraPerUser : 0.65, 0, 50);

    var perActionCost = calcModelWorkload(m, { inputTokens: inputTokens, outputTokens: outputTokens, dailyRequests: 1, cacheHitRate: cacheHitRate, useBatch: false }).perReq;
    var safePerAction = Math.max(0.00005, perActionCost);

    function buildTier(name, price, freeCap) {
      if (price === 0) {
        var cogsFree = freeCap * safePerAction + fixedInfraPerUser * 0.25;
        return { name: name, price: 0, maxCredits: freeCap, maxAiCogs: cogsFree, stripeFee: 0, netAfterAll: -cogsFree, grossMarginPct: 0, overagePer1k: Math.ceil(safePerAction * 1000 * 4 * 100) / 100 };
      }
      var stripeFee = price * 0.029 + 0.30;
      var maxTotalCogs = price * (1 - targetMarginPct / 100);
      var aiBudget = Math.max(0.10, maxTotalCogs - stripeFee - fixedInfraPerUser);
      var safeCredits = Math.max(50, Math.floor((aiBudget / safePerAction) / 50) * 50);
      var actualAiCogs = safeCredits * safePerAction;
      var actualMarginPct = ((price - stripeFee - fixedInfraPerUser - actualAiCogs) / price) * 100;
      var overagePer1k = Math.max(1, Math.ceil((safePerAction * 1000) / (1 - targetMarginPct / 100) * 100) / 100);
      return {
        name: name,
        price: price,
        maxCredits: safeCredits,
        maxAiCogs: actualAiCogs,
        stripeFee: stripeFee,
        netAfterAll: price - stripeFee - fixedInfraPerUser - actualAiCogs,
        grossMarginPct: actualMarginPct,
        overagePer1k: overagePer1k
      };
    }

    var tiers = [
      buildTier('Free / Trial', 0, 50),
      buildTier('Pro (Individual)', proPrice, 0),
      buildTier('Team (Per Seat)', teamPrice, 0),
      buildTier('Enterprise (Org Seat)', entPrice, 0)
    ];

    return {
      model: m,
      perActionCost: safePerAction,
      targetMarginPct: targetMarginPct,
      tiers: tiers
    };
  }

  var CURRENCIES = {
    USD: { code: 'USD', symbol: '$', rate: 1, decimals: 2 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92, decimals: 2 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79, decimals: 2 },
    JPY: { code: 'JPY', symbol: '¥', rate: 154, decimals: 0 },
    KRW: { code: 'KRW', symbol: '₩', rate: 1390, decimals: 0 }
  };
  var activeCurrency = 'USD';

  function setCurrency(code) {
    if (CURRENCIES[code]) activeCurrency = code;
    return activeCurrency;
  }

  function getCurrency() {
    return CURRENCIES[activeCurrency] || CURRENCIES.USD;
  }

  function formatUsd(n) {
    var cur = getCurrency();
    var x = Number(n) * cur.rate;
    if (!isFinite(x)) return cur.symbol + (cur.decimals === 0 ? '0' : '0.00');
    var abs = Math.abs(x);
    var sign = x < 0 ? '-' : '';
    if (abs === 0) return cur.symbol + (cur.decimals === 0 ? '0' : '0.00');
    if (cur.decimals === 0) {
      if (abs < 1) return sign + cur.symbol + abs.toFixed(2);
      return sign + cur.symbol + Math.round(abs).toLocaleString('en-US');
    }
    if (abs < 0.0001) return sign + cur.symbol + abs.toFixed(6);
    if (abs < 0.01) return sign + cur.symbol + abs.toFixed(4);
    if (abs < 1000) return sign + cur.symbol + abs.toFixed(2);
    return sign + cur.symbol + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatInt(n) {
    return Math.round(Number(n) || 0).toLocaleString('en-US');
  }

  // Vector Database Cloud Cost Comparator (Pinecone, Qdrant, pgvector/Supabase, Weaviate, Turbopuffer)
  var VECTOR_DB_PROVIDERS = [
    { id: 'pinecone-serverless', name: 'Pinecone Serverless', storagePerGbMo: 0.33, readPer1M: 8.25, writePer1M: 2.00, baseMonthly: 0, ramMultiplier: 1.0, notes: 'Pay-per-RU/WU serverless; zero idle pod cost' },
    { id: 'qdrant-cloud', name: 'Qdrant Cloud Managed', storagePerGbMo: 1.85, readPer1M: 0.35, writePer1M: 0.25, baseMonthly: 25, ramMultiplier: 1.35, notes: 'High-QPS Rust HNSW + native scalar/binary quant' },
    { id: 'supabase-pgvector', name: 'PostgreSQL pgvector (Managed)', storagePerGbMo: 1.60, readPer1M: 0.15, writePer1M: 0.15, baseMonthly: 25, ramMultiplier: 1.50, notes: 'Co-located SQL + halfvec HNSW; best under 5M vectors' },
    { id: 'weaviate-cloud', name: 'Weaviate Cloud Serverless', storagePerGbMo: 1.45, readPer1M: 1.20, writePer1M: 0.60, baseMonthly: 25, ramMultiplier: 1.30, notes: 'Hybrid BM25 + vector search with PQ compression' },
    { id: 'turbopuffer', name: 'Turbopuffer (Object-Storage)', storagePerGbMo: 0.14, readPer1M: 1.90, writePer1M: 0.50, baseMonthly: 0, ramMultiplier: 0.85, notes: 'Cold-tier S3/NVMe hybrid; ultra-low idle storage cost' }
  ];

  function calcVectorDbTco(opts) {
    var vectors = clamp(opts.vectors || 5000000, 10000, 500000000);
    var dims = clamp(opts.dims || 1536, 128, 4096);
    var quant = opts.quant || 'fp32';
    var monthlyQueries = clamp(opts.monthlyQueries || 3000000, 1000, 1000000000);
    var monthlyUpserts = clamp(opts.monthlyUpserts || 500000, 0, 500000000);
    var emb = getEmbedding(opts.embeddingId || 'text-embedding-3-small');

    var bytesPerDim = quant === 'binary' ? 0.125 : (quant === 'int8' ? 1 : (quant === 'fp16' ? 2 : 4));
    var rawGb = (vectors * dims * bytesPerDim) / (1024 * 1024 * 1024);
    var indexGb = rawGb * 1.45; // HNSW graph + metadata overhead
    var ingestTokens = (vectors * 350);
    var oneTimeEmbedUsd = (ingestTokens / 1e6) * emb.per1M;
    var monthlyEmbedChurnUsd = ((monthlyUpserts * 350) / 1e6) * emb.per1M;

    var rows = VECTOR_DB_PROVIDERS.map(function (p) {
      var billedGb = Math.max(1, indexGb * p.ramMultiplier);
      var storageCost = billedGb * p.storagePerGbMo;
      var queryCost = (monthlyQueries / 1e6) * p.readPer1M;
      var writeCost = (monthlyUpserts / 1e6) * p.writePer1M;
      var dbMonthly = p.baseMonthly + storageCost + queryCost + writeCost;
      var totalMonthly = dbMonthly + monthlyEmbedChurnUsd;
      return {
        id: p.id,
        name: p.name,
        notes: p.notes,
        billedGb: billedGb,
        storageCost: storageCost,
        queryCost: queryCost,
        writeCost: writeCost,
        dbMonthly: dbMonthly,
        totalMonthly: totalMonthly,
        annualTco: totalMonthly * 12 + oneTimeEmbedUsd
      };
    });
    rows.sort(function (a, b) { return a.totalMonthly - b.totalMonthly; });
    return {
      vectors: vectors,
      dims: dims,
      quant: quant,
      rawGb: rawGb,
      indexGb: indexGb,
      embedding: emb,
      oneTimeEmbedUsd: oneTimeEmbedUsd,
      monthlyEmbedChurnUsd: monthlyEmbedChurnUsd,
      cheapest: rows[0],
      priciest: rows[rows.length - 1],
      rows: rows
    };
  }

  // AI Coding Assistant Seat vs. BYOK API Cost Calculator
  var CODING_SEAT_PLANS = [
    { id: 'windsurf-pro', name: 'Windsurf Pro', perSeatMo: 15, includedNote: 'Prompt credits tier' },
    { id: 'copilot-business', name: 'GitHub Copilot Business', perSeatMo: 19, includedNote: 'Org-wide completions & chat' },
    { id: 'cursor-pro', name: 'Cursor Pro', perSeatMo: 20, includedNote: 'Individual IDE seat' },
    { id: 'cursor-business', name: 'Cursor Business / Teams', perSeatMo: 40, includedNote: 'SSO, privacy mode, org billing' },
    { id: 'claude-code-max', name: 'Claude Max (Heavy Agent)', perSeatMo: 100, includedNote: 'High-usage autonomous coding' }
  ];

  function calcCodingSeatVsApi(opts) {
    var m = getModel(opts.modelId || 'claude-sonnet-4.5');
    var devs = Math.round(clamp(opts.devs || 25, 1, 2000));
    var workdaysPerMonth = clamp(opts.workdaysPerMonth || 21, 5, 31);
    var sessionsPerDevDay = clamp(opts.sessionsPerDevDay || 12, 1, 200);
    var inputPerSession = clamp(opts.inputPerSession || 24000, 1000, 500000);
    var outputPerSession = clamp(opts.outputPerSession || 1600, 100, 50000);
    var cacheHitRate = clamp(opts.cacheHitRate != null ? opts.cacheHitRate : 85, 0, 95) / 100;

    var perSessionInCost = ((inputPerSession * (1 - cacheHitRate)) / 1e6) * m.input + ((inputPerSession * cacheHitRate) / 1e6) * m.cachedInput;
    var perSessionOutCost = (outputPerSession / 1e6) * m.output;
    var perSessionCost = perSessionInCost + perSessionOutCost;
    var apiPerDevMonthly = perSessionCost * sessionsPerDevDay * workdaysPerMonth;
    var apiTeamMonthly = apiPerDevMonthly * devs;

    var plans = CODING_SEAT_PLANS.map(function (pl) {
      var teamMonthly = pl.perSeatMo * devs;
      var deltaVsApi = teamMonthly - apiTeamMonthly;
      var breakEvenSessionsDay = perSessionCost > 0 ? (pl.perSeatMo / (perSessionCost * workdaysPerMonth)) : 0;
      return {
        id: pl.id,
        name: pl.name,
        perSeatMo: pl.perSeatMo,
        includedNote: pl.includedNote,
        teamMonthly: teamMonthly,
        teamAnnual: teamMonthly * 12,
        deltaVsApi: deltaVsApi,
        breakEvenSessionsDay: breakEvenSessionsDay,
        winner: teamMonthly <= apiTeamMonthly ? 'seat' : 'byok-api'
      };
    });

    var sortedAll = plans.slice().sort(function (a, b) { return a.teamMonthly - b.teamMonthly; });
    var bestPlan = sortedAll[0];
    var overallWinner = apiTeamMonthly < bestPlan.teamMonthly ? ('BYOK API (' + m.name + ')') : bestPlan.name;

    return {
      model: m,
      devs: devs,
      workdaysPerMonth: workdaysPerMonth,
      sessionsPerDevDay: sessionsPerDevDay,
      perSessionCost: perSessionCost,
      apiPerDevMonthly: apiPerDevMonthly,
      apiTeamMonthly: apiTeamMonthly,
      apiTeamAnnual: apiTeamMonthly * 12,
      overallWinner: overallWinner,
      plans: plans
    };
  }

  // LLM Context Caching Write-Premium & TTL ROI Calculator
  function calcCacheTtlRoi(opts) {
    var m = getModel(opts.modelId || 'claude-sonnet-4.5');
    var prefixTokens = clamp(opts.prefixTokens || 25000, 1024, 500000);
    var dynamicInput = clamp(opts.dynamicInput != null ? opts.dynamicInput : 400, 0, 100000);
    var outputTokens = clamp(opts.outputTokens != null ? opts.outputTokens : 500, 0, 50000);
    var reqsPerHour = clamp(opts.reqsPerHour || 30, 0.5, 100000);
    var activeHoursDay = clamp(opts.activeHoursDay || 16, 1, 24);

    var monthlyHours = activeHoursDay * 30;
    var monthlyReqs = reqsPerHour * monthlyHours;
    var prefixM = prefixTokens / 1e6;
    var readRate = m.cachedInput;
    var dynOutPerReq = (dynamicInput / 1e6) * m.input + (outputTokens / 1e6) * m.output;
    var dynOutMonthly = dynOutPerReq * monthlyReqs;

    // 1. No Caching Baseline
    var noCachePrefixMonthly = monthlyReqs * prefixM * m.input;
    var noCacheMonthly = noCachePrefixMonthly + dynOutMonthly;

    // 2. 5-Minute Ephemeral Cache (1.25x write premium, refreshes on hits)
    var writesHr5m = Math.min(reqsPerHour, Math.max(1 / activeHoursDay, 1 + reqsPerHour * Math.exp(-reqsPerHour / 12)));
    var hitsHr5m = Math.max(0, reqsPerHour - writesHr5m);
    var writeCost5m = writesHr5m * monthlyHours * prefixM * (m.input * 1.25);
    var readCost5m = hitsHr5m * monthlyHours * prefixM * readRate;
    var total5m = writeCost5m + readCost5m + dynOutMonthly;

    // 3. 1-Hour Extended Cache (2.0x write premium)
    var writesHr1h = Math.min(reqsPerHour, Math.max(1 / activeHoursDay, 1 + reqsPerHour * Math.exp(-reqsPerHour)));
    var hitsHr1h = Math.max(0, reqsPerHour - writesHr1h);
    var writeCost1h = writesHr1h * monthlyHours * prefixM * (m.input * 2.0);
    var readCost1h = hitsHr1h * monthlyHours * prefixM * readRate;
    var total1h = writeCost1h + readCost1h + dynOutMonthly;

    // 4. Explicit Context Storage Cache (1.0x write + $1.00/1M tok-hr storage)
    var storageWritesMo = 30;
    var storageHitsMo = Math.max(0, monthlyReqs - storageWritesMo);
    var writeCostStore = storageWritesMo * prefixM * m.input + (prefixM * 1.00 * monthlyHours);
    var readCostStore = storageHitsMo * prefixM * readRate;
    var totalStore = writeCostStore + readCostStore + dynOutMonthly;

    var denom = Math.max(0.0001, m.input - readRate);
    var breakEvenHits5m = Math.ceil((1.25 * m.input) / denom);
    var breakEvenHits1h = Math.ceil((2.00 * m.input) / denom);

    var strategies = [
      { id: 'no-cache', name: 'No Prompt Caching (Baseline)', writeOverhead: 0, readCost: noCachePrefixMonthly, totalMonthly: noCacheMonthly, savingsVsBase: 0, hitRatePct: 0 },
      { id: 'ttl-5m', name: '5-Min Ephemeral Cache (1.25x Write)', writeOverhead: writeCost5m, readCost: readCost5m, totalMonthly: total5m, savingsVsBase: noCacheMonthly - total5m, hitRatePct: (hitsHr5m / reqsPerHour) * 100 },
      { id: 'ttl-1h', name: '1-Hour Extended Cache (2.0x Write)', writeOverhead: writeCost1h, readCost: readCost1h, totalMonthly: total1h, savingsVsBase: noCacheMonthly - total1h, hitRatePct: (hitsHr1h / reqsPerHour) * 100 },
      { id: 'ttl-storage', name: 'Explicit TTL Storage ($1/1M tok-hr)', writeOverhead: writeCostStore, readCost: readCostStore, totalMonthly: totalStore, savingsVsBase: noCacheMonthly - totalStore, hitRatePct: monthlyReqs > 0 ? (storageHitsMo / monthlyReqs) * 100 : 0 }
    ];
    var sorted = strategies.slice().sort(function (a, b) { return a.totalMonthly - b.totalMonthly; });
    var best = sorted[0];
    var maxSavingsMonthly = Math.max(0, noCacheMonthly - best.totalMonthly);
    var maxSavingsPct = noCacheMonthly > 0 ? (maxSavingsMonthly / noCacheMonthly) * 100 : 0;

    return {
      model: m,
      prefixTokens: prefixTokens,
      monthlyReqs: Math.round(monthlyReqs),
      breakEvenHits5m: breakEvenHits5m,
      breakEvenHits1h: breakEvenHits1h,
      noCacheMonthly: noCacheMonthly,
      best: best,
      maxSavingsMonthly: maxSavingsMonthly,
      maxSavingsAnnual: maxSavingsMonthly * 12,
      maxSavingsPct: maxSavingsPct,
      strategies: strategies
    };
  }

  // LLM-as-a-Judge & AI Evaluation Pipeline Budget Calculator
  var EVAL_JUDGE_IDS = ['claude-opus-4.5', 'gpt-5', 'claude-sonnet-4.5', 'gemini-2.5-pro', 'gpt-5-mini', 'gemini-2.5-flash'];

  function calcEvalJudgeBudget(opts) {
    var selected = getModel(opts.judgeModelId || 'gpt-5-mini');
    var evalCases = clamp(opts.evalCases || 500, 10, 500000);
    var ciRunsPerMonth = clamp(opts.ciRunsPerMonth || 60, 0, 5000);
    var prodTracesPerDay = clamp(opts.prodTracesPerDay || 10000, 0, 5000000);
    var sampleRatePct = clamp(opts.sampleRatePct != null ? opts.sampleRatePct : 5, 0, 100) / 100;
    var avgInputPerJudge = clamp(opts.avgInputPerJudge || 2200, 100, 100000);
    var avgOutputPerJudge = clamp(opts.avgOutputPerJudge || 350, 20, 16000);
    var rubricsPerCase = Math.round(clamp(opts.rubricsPerCase || 2, 1, 10));
    var cacheHitRate = clamp(opts.cacheHitRate != null ? opts.cacheHitRate : 65, 0, 95);
    var useBatch = opts.useBatch !== false;

    var ciJudgeCallsMo = evalCases * ciRunsPerMonth * rubricsPerCase;
    var prodJudgeCallsMo = Math.round(prodTracesPerDay * 30 * sampleRatePct * rubricsPerCase);
    var totalJudgeCallsMo = ciJudgeCallsMo + prodJudgeCallsMo;

    function priceJudge(m) {
      var rt = calcModelWorkload(m, { inputTokens: avgInputPerJudge, outputTokens: avgOutputPerJudge, dailyRequests: totalJudgeCallsMo / 30, cacheHitRate: cacheHitRate, useBatch: false });
      var bt = calcModelWorkload(m, { inputTokens: avgInputPerJudge, outputTokens: avgOutputPerJudge, dailyRequests: totalJudgeCallsMo / 30, cacheHitRate: cacheHitRate, useBatch: true });
      var active = useBatch ? bt : rt;
      return {
        model: m,
        realtimeMonthly: rt.monthly,
        batchMonthly: bt.monthly,
        activeMonthly: active.monthly,
        activeAnnual: active.monthly * 12,
        costPer1kEvals: active.perReq * 1000
      };
    }

    var selectedRes = priceJudge(selected);
    var ciSharePct = totalJudgeCallsMo > 0 ? (ciJudgeCallsMo / totalJudgeCallsMo) * 100 : 0;
    var rows = EVAL_JUDGE_IDS.map(function (id) { return priceJudge(getModel(id)); });
    rows.sort(function (a, b) { return a.activeMonthly - b.activeMonthly; });

    return {
      selected: selectedRes,
      ciJudgeCallsMo: ciJudgeCallsMo,
      prodJudgeCallsMo: prodJudgeCallsMo,
      totalJudgeCallsMo: totalJudgeCallsMo,
      ciSharePct: ciSharePct,
      batchSavingsMonthly: Math.max(0, selectedRes.realtimeMonthly - selectedRes.batchMonthly),
      rows: rows
    };
  }

  return {
    MODELS: MODELS,
    EMBEDDINGS: EMBEDDINGS,
    GPU_PRESETS: GPU_PRESETS,
    VRAM_MODELS: VRAM_MODELS,
    QUANT_BITS: QUANT_BITS,
    MULTIMODAL_RATES: MULTIMODAL_RATES,
    AUDIO_STT_MODELS: AUDIO_STT_MODELS,
    AUDIO_TTS_MODELS: AUDIO_TTS_MODELS,
    IMAGE_GEN_MODELS: IMAGE_GEN_MODELS,
    VIDEO_GEN_MODELS: VIDEO_GEN_MODELS,
    LATENCY_PROFILES: LATENCY_PROFILES,
    VECTOR_DB_PROVIDERS: VECTOR_DB_PROVIDERS,
    CODING_SEAT_PLANS: CODING_SEAT_PLANS,
    EVAL_JUDGE_IDS: EVAL_JUDGE_IDS,
    CURRENCIES: CURRENCIES,
    getModel: getModel,
    getEmbedding: getEmbedding,
    setCurrency: setCurrency,
    getCurrency: getCurrency,
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
    calcAiRunway: calcAiRunway,
    calcPromptDiff: calcPromptDiff,
    calcFineTuneVsRag: calcFineTuneVsRag,
    calcRateLimitPlan: calcRateLimitPlan,
    calcGpuVram: calcGpuVram,
    calcHybridWaterfall: calcHybridWaterfall,
    calcAudioPipeline: calcAudioPipeline,
    calcMediaGenBudget: calcMediaGenBudget,
    calcLatencyBudget: calcLatencyBudget,
    calcPricingTiers: calcPricingTiers,
    calcVectorDbTco: calcVectorDbTco,
    calcCodingSeatVsApi: calcCodingSeatVsApi,
    calcCacheTtlRoi: calcCacheTtlRoi,
    calcEvalJudgeBudget: calcEvalJudgeBudget,
    formatUsd: formatUsd,
    formatInt: formatInt
  };
});
