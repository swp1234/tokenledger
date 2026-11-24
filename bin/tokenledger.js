#!/usr/bin/env node
'use strict';
const E = require('../js/pricing-engine.js');

const args = process.argv.slice(2);
function flag(name, def) {
  const idx = args.indexOf('--' + name);
  return idx !== -1 && args[idx + 1] !== undefined ? args[idx + 1] : def;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`TokenLedger CLI — Zero-dependency LLM API FinOps Estimator (24 models)

Usage:
  node bin/tokenledger.js [options]

Options:
  --in <tokens>       Input tokens per request (default: 2500)
  --out <tokens>      Output tokens per request (default: 600)
  --req <count>       Daily requests (default: 1000)
  --cache <0-95>      Prompt cache hit rate % (default: 50)
  --batch             Apply 50% async batch discount where supported
  --top <n>           Limit rows displayed (default: 10)
  --format <table|md|json> Output format (default: table)
`);
  process.exit(0);
}

const opts = {
  inputTokens: Number(flag('in', 2500)),
  outputTokens: Number(flag('out', 600)),
  dailyRequests: Number(flag('req', 1000)),
  cacheHitRate: Number(flag('cache', 50)),
  useBatch: args.includes('--batch'),
};
const topN = Number(flag('top', 10));
const format = flag('format', 'table');

const rows = E.MODELS.map(m => E.calcModelWorkload(m, opts))
  .sort((a, b) => a.monthly - b.monthly)
  .slice(0, topN);

if (format === 'json') {
  console.log(JSON.stringify({ scenario: opts, results: rows.map(r => ({ id: r.model.id, name: r.model.name, provider: r.model.provider, perReqUsd: Number(r.perReq.toFixed(6)), monthlyUsd: Number(r.monthly.toFixed(2)), annualUsd: Number(r.annual.toFixed(2)) })) }, null, 2));
} else if (format === 'md') {
  console.log(`| Model | Provider | Per Req | Monthly (30d) | Annual (365d) |\n|---|---|---:|---:|---:|`);
  for (const r of rows) {
    console.log(`| ${r.model.name} | ${r.model.provider} | ${E.formatUsd(r.perReq)} | **${E.formatUsd(r.monthly)}** | ${E.formatUsd(r.annual)} |`);
  }
  console.log(`\n_Generated locally via [TokenLedger](https://tokenledger-8x7.pages.dev/)_`);
} else {
  console.log(`TokenLedger Estimate (${opts.inputTokens} in / ${opts.outputTokens} out · ${opts.dailyRequests} req/day · ${opts.cacheHitRate}% cache${opts.useBatch ? ' · Batch' : ''})\n`);
  for (const r of rows) {
    console.log(`${r.model.name.padEnd(28)} ${r.model.provider.padEnd(12)} ${E.formatUsd(r.monthly).padStart(12)}/mo   (${E.formatUsd(r.annual)}/yr)`);
  }
}
