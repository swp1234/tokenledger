#!/usr/bin/env node
'use strict';
const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = require(path.join(ROOT, 'js', 'pricing-engine.js'));

// Load Playwright from parent workspace if not installed locally
let chromium;
try { ({ chromium } = require('playwright')); }
catch (_) { ({ chromium } = require('e:\\Fire Project\\node_modules\\playwright')); }

function runUnitTests() {
  const apiJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'api', 'pricing.json'), 'utf8'));
  assert.strictEqual(apiJson.models.length, 40, 'Expected 40 models in api/pricing.json');
  assert.strictEqual(apiJson.models.length, ENGINE.MODELS.length, 'api/pricing.json and pricing-engine.js model count mismatch');
  assert.strictEqual(apiJson.embeddings.length, ENGINE.EMBEDDINGS.length, 'embedding count mismatch');
  for (let i = 0; i < apiJson.models.length; i++) {
    assert.strictEqual(apiJson.models[i].id, ENGINE.MODELS[i].id);
    assert.strictEqual(apiJson.models[i].input, ENGINE.MODELS[i].input);
    assert.strictEqual(apiJson.models[i].output, ENGINE.MODELS[i].output);
  }

  // Token estimator sanity (ASCII, JSON, Korean)
  const enEst = ENGINE.estimateTokens('Calculate the monthly API budget for a 15-turn coding agent.');
  assert(enEst.tokensOpenAI >= 10 && enEst.tokensOpenAI <= 25, `Unexpected EN token estimate: ${enEst.tokensOpenAI}`);
  const koEst = ENGINE.estimateTokens('인공지능 API 비용을 정확하게 계산하는 브라우저 로컬 도구입니다.');
  assert(koEst.cjkRatio > 50 && koEst.tokensOpenAI > 15, `Unexpected KO token estimate: ${JSON.stringify(koEst)}`);

  // Workload + Caching + Batch math
  const raw = ENGINE.calcModelWorkload('claude-sonnet-4', { inputTokens: 10000, outputTokens: 1000, dailyRequests: 1000, cacheHitRate: 0, useBatch: false });
  const cached = ENGINE.calcModelWorkload('claude-sonnet-4', { inputTokens: 10000, outputTokens: 1000, dailyRequests: 1000, cacheHitRate: 80, useBatch: false });
  const batched = ENGINE.calcModelWorkload('claude-sonnet-4', { inputTokens: 10000, outputTokens: 1000, dailyRequests: 1000, cacheHitRate: 0, useBatch: true });
  assert(cached.monthly < raw.monthly, 'Prompt caching must reduce monthly cost');
  assert(Math.abs(batched.monthly - raw.monthly * 0.5) < 0.01, 'Batch discount must be exact 50%');

  // Cascade savings
  const casc = ENGINE.calcCascadeSavings('claude-opus-4', 'gemini-2.5-flash', { inputTokens: 3000, outputTokens: 700, dailyRequests: 1000, cacheHitRate: 50, useBatch: false }, 70);
  assert(casc.savedPct > 60 && casc.blendedMonthly < casc.frontierMonthly, 'Cascade routing must save >60% on Opus->Flash');

  // Agent quadratic burn
  const ag = ENGINE.calcAgentBurn('claude-sonnet-4', { turns: 15, systemTokens: 3000, growthPerTurn: 1500, outputPerTurn: 400, runsPerDay: 200, cacheHitRate: 85, windowTurns: 5 });
  assert(ag.breakdown.length === 15);
  assert(ag.snowballMultiplier > 3, `Expected quadratic snowball >3x, got ${ag.snowballMultiplier}`);
  assert(ag.cachedMonthly < ag.naiveMonthly && ag.windowMonthly < ag.naiveMonthly, 'Caching & sliding window must beat naive history');

  // SaaS gross margin
  const saas = ENGINE.calcSaasMargin('gemini-2.5-flash', { price: 29, seats: 500, reqPerSeatMonth: 250, inputTokens: 2500, outputTokens: 600, cacheHitRate: 50, fixedInfraPerSeat: 0.4 });
  assert(saas.grossMarginPct > 80 && saas.health === 'healthy' && saas.breakEvenReqPerSeat > 1000);

  // RAG TCO
  const rag = ENGINE.calcRagBudget('text-embedding-3-small', 'gemini-2.5-flash', { docCount: 25000, tokensPerDoc: 1500, chunkSize: 512, overlapPct: 15, monthlyChurnPct: 10, dailyQueries: 3000, topK: 6, outputTokens: 500 });
  assert(rag.totalChunks > 50000 && rag.monthlyTotal > rag.oneTimeIngestCost);

  // Self-Hosted GPU vs Cloud API break-even
  const sh = ENGINE.calcSelfHostVsApi('claude-sonnet-4', { gpuHourly: 2.85, hoursPerDay: 24, devopsMonthly: 450, tokPerSec: 340, avgUtilPct: 35, inputTokens: 2500, outputTokens: 600, dailyRequests: 8000, cacheHitRate: 50 });
  assert(sh.selfHostMonthly > 2000 && sh.breakEvenDailyReqs > 500 && ['self-host-wins', 'hybrid-borderline', 'cloud-api-wins', 'needs-more-gpus'].includes(sh.verdict));

  // MCP Schema Tax & Tool JSON Auditor
  const mcp = ENGINE.calcMcpSchemaTax('claude-sonnet-4', { servers: 5, toolsPerServer: 14, tokensPerTool: 260, turnsPerSession: 16, sessionsPerDay: 400, cacheHitRate: 80, lazyDeferPct: 85 });
  assert(mcp.totalTools === 70 && mcp.monthlyLazy < mcp.monthlyCached && mcp.monthlyCached < mcp.monthlyUncached);
  const audit = ENGINE.auditToolJson(JSON.stringify([{ name: 'a', description: 'long desc', inputSchema: { type: 'object' } }]));
  assert(audit.count === 1 && audit.totalMinified <= audit.totalPretty);

  // Multimodal Vision / Voice / Image Gen
  const mm = ENGINE.calcMultimodalBudget({ visionModel: 'gemini-2.5-flash-vision', voiceModel: 'gemini-live-flash', imageModel: 'imagen-3', dailyImages: 1500, visionOutTok: 250, dailyVoiceMins: 600, dailyGenImages: 200 });
  assert(mm.totalMonthly > 500 && mm.voiceMonthly > mm.visionMonthly);

  // AI Runway, Prompt A/B Diff, Fine-Tune vs RAG, Rate-Limit Planner & Multi-Currency
  const rw = ENGINE.calcAiRunway({ cashOnHand: 250000, mrr: 8000, mrrGrowthPct: 12, monthlyAiSpend: 4500, monthlyCloudInfra: 1800, monthlyPayrollOps: 18000, aiScalesWithMrr: true });
  assert(rw.timeline.length === 24 && rw.runwayMonths > 0);
  const pd = ENGINE.calcPromptDiff('You are a very polite verbose helpful assistant that always writes long sentences.', 'Role: concise assistant.', 2000, 50);
  assert(pd.savedOpenAI > 0 && pd.compressionPct > 40);
  const ft = ENGINE.calcFineTuneVsRag({ baseModelId: 'gpt-4.1-mini', kbTokens: 150000, dailyRequests: 4000 });
  assert(ft.ftAnnual > 0 && ft.ragAnnual > 0 && ft.winner && ft.winner.annual <= ft.runnerUp.annual);
  const rl = ENGINE.calcRateLimitPlan('claude-sonnet-4', { avgRpm: 120, burstMultiplier: 2.5, inputTokens: 2500, outputTokens: 600, avgLatencySec: 4.5 });
  assert(rl.peakRpm === 300 && rl.peakTpm === 300 * 3100 && rl.peakConcurrency >= 22);
  ENGINE.setCurrency('EUR');
  assert(ENGINE.formatUsd(100).startsWith('€'));
  ENGINE.setCurrency('JPY');
  assert(ENGINE.formatUsd(100).startsWith('¥'));
  ENGINE.setCurrency('USD');
  assert(ENGINE.formatUsd(100) === '$100.00');
  const vr = ENGINE.calcGpuVram({ modelId: 'llama-3.3-70b', quant: 'q4km', contextLen: 8192, batchSize: 4, kvFp8: false });
  assert(vr.weightsGB > 35 && vr.weightsGB < 45 && vr.totalVramGB > vr.weightsGB);
  const vrFp8 = ENGINE.calcGpuVram({ modelId: 'llama-3.3-70b', quant: 'q4km', contextLen: 8192, batchSize: 4, kvFp8: true });
  assert(Math.abs(vrFp8.kvCacheGB - vr.kvCacheGB * 0.5) < 0.01, 'FP8 KV cache must halve KV memory');
  const hy = ENGINE.calcHybridWaterfall({ frontierId: 'claude-sonnet-4', miniId: 'gemini-2.5-flash', inputTokens: 3500, outputTokens: 700, dailyRequests: 10000, miniPct: 55, batchPct: 25, cacheHitRate: 70 });
  assert(hy.savedPct > 60 && hy.optimizedMonthly < hy.baselineMonthly);
  const au = ENGINE.calcAudioPipeline({ sttId: 'deepgram-nova-3', ttsId: 'openai-tts-1', dailyAudioMins: 1200, vadSilenceTrimPct: 30, needDiarization: false, dailyTtsChars: 250000, ttsCacheHitPct: 25 });
  assert(au.optTotalMonthly < au.rawTotalMonthly && au.sttComparison.length === 7 && au.ttsComparison.length === 8);
  const mv = ENGINE.calcMediaGenBudget({ imgModelId: 'flux-1-1-pro', vidModelId: 'runway-gen4-turbo', dailyPublishedImages: 150, imgRetryFactor: 2.5, dailyVideoClips: 15, avgClipSec: 6, vidRetryFactor: 3.0, useDraftCascade: true });
  assert(mv.effImgMonthly < mv.rawImgMonthly && mv.draftSavingsMonthly > 0 && mv.totalMonthly > 0);
  const lt = ENGINE.calcLatencyBudget({ profileId: 'gpt-5-mini-lat', inputTokens: 2500, outputTokens: 500, networkRttMs: 80, slaTargetSec: 5.0 });
  assert(lt.rows.length === 12 && lt.fastest.totalSec < lt.selected.totalSec && lt.passingCount >= 5);
  const pt = ENGINE.calcPricingTiers({ modelId: 'gemini-2.5-flash', inputTokens: 2800, outputTokens: 650, cacheHitRate: 55, targetMarginPct: 78, proPrice: 29, teamPrice: 79, entPrice: 299, fixedInfraPerUser: 0.65 });
  assert(pt.tiers.length === 4 && pt.tiers[1].grossMarginPct >= 77 && pt.tiers[1].maxCredits >= 100);
  const vdbFp32 = ENGINE.calcVectorDbTco({ vectors: 5000000, dims: 1536, quant: 'fp32', monthlyQueries: 3000000, monthlyUpserts: 500000, embeddingId: 'text-embedding-3-small' });
  const vdbInt8 = ENGINE.calcVectorDbTco({ vectors: 5000000, dims: 1536, quant: 'int8', monthlyQueries: 3000000, monthlyUpserts: 500000, embeddingId: 'text-embedding-3-small' });
  assert(vdbFp32.rows.length === 5 && vdbInt8.rawGb < vdbFp32.rawGb * 0.3 && vdbFp32.cheapest.totalMonthly <= vdbFp32.priciest.totalMonthly);
  const cs = ENGINE.calcCodingSeatVsApi({ modelId: 'claude-sonnet-4.5', devs: 25, workdaysPerMonth: 21, sessionsPerDevDay: 12, inputPerSession: 24000, outputPerSession: 1600, cacheHitRate: 85 });
  assert(cs.plans.length === 5 && cs.apiTeamMonthly > 0 && cs.plans[0].breakEvenSessionsDay > 0);
  const cc = ENGINE.calcCacheTtlRoi({ modelId: 'claude-sonnet-4.5', prefixTokens: 25000, dynamicInput: 400, outputTokens: 500, reqsPerHour: 30, activeHoursDay: 16 });
  assert(cc.strategies.length === 4 && cc.breakEvenHits5m === 2 && cc.breakEvenHits1h === 3 && cc.maxSavingsPct > 40);
  const ev = ENGINE.calcEvalJudgeBudget({ judgeModelId: 'gpt-5-mini', evalCases: 500, ciRunsPerMonth: 60, prodTracesPerDay: 10000, sampleRatePct: 5, avgInputPerJudge: 2200, avgOutputPerJudge: 350, rubricsPerCase: 2, cacheHitRate: 65, useBatch: true });
  assert(ev.rows.length === 6 && ev.totalJudgeCallsMo === 90000 && ev.batchSavingsMonthly > 0);

  // OG PNG check
  const ogBuf = fs.readFileSync(path.join(ROOT, 'og-image.png'));
  assert(ogBuf.length > 10000 && ogBuf.slice(0, 8).toString('hex') === '89504e470d0a1a0a', 'og-image.png must be a valid PNG');

  console.log('[PASS] Unit tests: pricing-engine, 40 models parity, Cache TTL ROI, Eval Judge Budget, Vector DB TCO, Coding Seat vs BYOK, OG PNG');
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let fp = path.join(ROOT, p.replace(/^\/+/, ''));
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, origin: `http://127.0.0.1:${srv.address().port}` }));
  });
}

async function runBrowserTests() {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const paths = [...sm.matchAll(/<loc>https:\/\/tokenledger-8x7\.pages\.dev([^<]+)<\/loc>/g)].map(m => m[1]);
  assert(paths.length === 140, `Expected 140 sitemap URLs, got ${paths.length}`);

  const { srv, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      return route.abort();
    });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    // Check all pages on mobile 390x844
    for (const p of paths) {
      const resp = await page.goto(`${origin}${p}`, { waitUntil: 'domcontentloaded' });
      assert.strictEqual(resp.status(), 200, `HTTP ${resp.status()} on ${p}`);
      const rep = await page.evaluate(() => ({
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        hasBeacon: Boolean(document.querySelector('script[src*="cloudflareinsights.com/beacon.min.js"][data-cf-beacon*="5b25f3b3091241dfbaf9f4ff2f1f6cdb"]'))
      }));
      assert(rep.overflow <= 1, `Mobile 390px overflow ${rep.overflow}px on ${p}`);
      assert(rep.h1.length > 5 && rep.canonical.startsWith('https://tokenledger-8x7.pages.dev'), `Metadata issue on ${p}`);
      assert(rep.hasBeacon, `Missing Cloudflare Web Analytics beacon on ${p}`);
    }
    console.log(`[PASS] All ${paths.length} pages verified on 390x844 mobile (0px overflow, 200 OK, metadata intact)`);

    // Interactive E2E on Home Studio
    await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' });
    const beforeSonnet = await page.textContent('#kpiSonnet');
    await page.click('[data-preset="coding"]');
    const afterSonnet = await page.textContent('#kpiSonnet');
    assert(beforeSonnet !== afterSonnet, 'Coding preset did not update KPI');
    await page.click('[data-provider="Anthropic"]');
    const anthropicRows = await page.locator('#modelTableBody tr').count();
    assert.strictEqual(anthropicRows, 7, `Expected 7 Anthropic rows, got ${anthropicRows}`);
    await page.click('#tlThemeToggle');
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert.strictEqual(theme, 'light', 'Theme toggle failed');
    await page.selectOption('#tlCurrencySelect', 'EUR');
    assert((await page.textContent('#kpiSonnet')).includes('€'), 'Currency switcher did not update KPI to EUR');
    await page.selectOption('#tlCurrencySelect', 'USD');
    assert((await page.textContent('#kpiSonnet')).includes('$'), 'Currency switcher did not restore USD');

    // Interactive E2E on Token Inspector (Load sample JSON -> Minify -> verify savings banner!)
    await page.goto(`${origin}/tools/token-inspector.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btnSampleJson');
    const tokBefore = Number((await page.textContent('#kpiTokOpenAI')).replace(/,/g, ''));
    await page.click('#btnMinifyJson');
    const tokAfter = Number((await page.textContent('#kpiTokOpenAI')).replace(/,/g, ''));
    const saveVisible = await page.locator('#minifySavings').isVisible();
    assert(tokAfter < tokBefore && saveVisible, `JSON minifier failed: before=${tokBefore}, after=${tokAfter}, visible=${saveVisible}`);

    // Interactive E2E on Agent Burn, SaaS Margin, RAG TCO, Self-Host GPU vs API & KO Hub
    await page.goto(`${origin}/tools/agent-budget.html`, { waitUntil: 'domcontentloaded' });
    assert.strictEqual(await page.locator('#turnChart .tl-chart-row').count(), 14);
    await page.goto(`${origin}/tools/saas-margin.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#saasCompareBody tr').count()) === 7);
    await page.goto(`${origin}/tools/rag-calculator.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.textContent('#kpiRagTotal')).includes('$'));
    await page.goto(`${origin}/tools/self-host-vs-api.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.textContent('#kpiBreakEven')).includes('/day'));
    await page.goto(`${origin}/tools/mcp-schema-auditor.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btnMcpSample');
    assert((await page.locator('#mcpToolTableBody tr').count()) === 3);
    await page.goto(`${origin}/tools/multimodal-budget.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#voiceCompareBody tr').count()) === 4);
    await page.goto(`${origin}/ko/`, { waitUntil: 'domcontentloaded' });
    assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'ko');
    assert((await page.locator('#modelTableBody tr').count()) === 40);
    await page.goto(`${origin}/es/`, { waitUntil: 'domcontentloaded' });
    assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'es');
    await page.goto(`${origin}/tools/ai-runway.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#runwayTableBody tr').count()) >= 8);
    await page.goto(`${origin}/tools/prompt-diff.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btnDiffSample');
    assert((await page.textContent('#kpiDiffDelta')).startsWith('-'));
    assert(await page.locator('#btnCopyGhAction').isVisible(), 'GitHub Action CI YAML button missing');
    await page.goto(`${origin}/tools/fine-tune-vs-rag.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#ftBreakdownBody tr').count()) === 3);
    assert((await page.textContent('#kpiFtAnnual')).includes('$'));
    await page.goto(`${origin}/tools/llm-rate-limit-planner.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.textContent('#kpiRlPeakTpm')).includes('TPM'));
    assert((await page.textContent('#rlConfigPreview')).includes('tokenBucket'));
    await page.goto(`${origin}/tools/gpu-vram-calculator.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#vrMatrixBody tr').count()) === 5);
    assert((await page.textContent('#kpiVrTotal')).includes('GB'));
    await page.goto(`${origin}/tools/batch-vs-realtime-router.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#hyWaterfallBody tr').count()) === 6);
    assert((await page.textContent('#kpiHySaveYr')).includes('/yr'));
    await page.goto(`${origin}/tools/audio-transcription-cost.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#auSttTableBody tr').count()) === 7);
    assert((await page.locator('#auTtsTableBody tr').count()) === 8);
    assert((await page.textContent('#kpiAuTotal')).includes('/mo'));
    await page.goto(`${origin}/tools/image-video-gen-budget.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#mvImgTableBody tr').count()) === 10);
    assert((await page.locator('#mvVidTableBody tr').count()) === 6);
    assert((await page.textContent('#kpiMvTotal')).includes('/mo'));
    await page.goto(`${origin}/tools/llm-latency-ttft-calculator.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#ltTableBody tr').count()) === 12);
    assert((await page.textContent('#kpiLtTtft')).includes('s'));
    await page.goto(`${origin}/tools/ai-pricing-tier-designer.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#ptTableBody tr').count()) === 4);
    assert((await page.textContent('#kpiPtProCap')).includes('cr/mo'));
    await page.goto(`${origin}/tools/vector-db-cost-calculator.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#vdbTableBody tr').count()) === 5);
    assert((await page.textContent('#kpiVdbRam')).includes('GB'));
    await page.goto(`${origin}/tools/ai-coding-seat-vs-api.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#csTableBody tr').count()) === 5);
    assert((await page.textContent('#kpiCsBreakEven')).includes('sess/d'));
    await page.goto(`${origin}/tools/llm-context-caching-roi.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#ccTableBody tr').count()) === 4);
    assert((await page.textContent('#kpiCcBe5m')).includes('hits'));
    await page.goto(`${origin}/tools/ai-eval-judge-budget.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#evTableBody tr').count()) === 6);
    assert((await page.textContent('#kpiEvCalls')).includes('/mo'));
    await page.click('#tlCmdOpen');
    await page.fill('#tlCmdInput', 'pinecone');
    assert((await page.locator('#tlCmdList .tl-cmd-item').count()) === 1, 'Command palette search failed');
    await page.keyboard.press('Escape');
    await page.goto(`${origin}/?embed=1`, { waitUntil: 'domcontentloaded' });
    assert(await page.evaluate(() => document.documentElement.classList.contains('tl-embed-mode')));

    assert.strictEqual(errors.length, 0, `Uncaught page errors: ${errors.join(' | ')}`);
    console.log('[PASS] Interactive E2E tests passed across all 22 workspaces (40 models) + Ctrl+K Command Palette + 5-currency switcher');
  } finally {
    await browser.close();
    await new Promise(r => srv.close(r));
  }
}

(async () => {
  runUnitTests();
  await runBrowserTests();
  console.log('\nALL TOKENLEDGER CHECKS PASSED 100%!');
})().catch(e => { console.error(e); process.exit(1); });
