# TokenLedger v4.0 Launch & Monetization Playbook

- Live product: **https://tokenledger-8x7.pages.dev**
- Source repo (MIT): **https://github.com/swp1234/tokenledger**
- Public Pricing JSON API: **https://tokenledger-8x7.pages.dev/api/pricing.json**

## 1. Ready-to-Post Community Launches (v4.0)

### Show HN (Hacker News)
- **URL**: `https://tokenledger-8x7.pages.dev`
- **Title**: `Show HN: TokenLedger – Browser-private LLM FinOps studio (14 calculators, 24 models)`
- **First Comment**:
  > I built TokenLedger because almost every LLM cost calculator I found either only multiplied single-prompt token rates or sent pasted prompts/schemas to a backend.
  >
  > TokenLedger runs 100% locally in the browser (zero prompt uploads, zero login wall, cookie-free analytics) and models the architectural cost traps that actually blow up AI bills across 24 models (GPT-5, GPT-4.1, o3, Claude 4, Gemini 2.5, DeepSeek V3/R1, Llama 4, Grok 3, Mistral, Qwen):
  >
  > - **24-Model Live Estimator** with prompt caching (0–95%), 50% async batch discounts, 70/30 model cascade routing, 5-currency switcher (USD/EUR/GBP/JPY/KRW), Ctrl+K palette, and one-click Markdown/CSV/PNG exports
  > - **Multi-Turn Agent Burn Calculator**: models quadratic O(N²) context snowballing in tool-calling loops vs. prefix caching & sliding windows
  > - **MCP & Tool Schema Tax Auditor**: paste your JSON tool definitions to see upfront schema bloat and lazy-deferral savings
  > - **GPU VRAM & KV-Cache Calculator + Self-Hosted GPU vs. Cloud API Break-Even**: Q4/FP8/FP16 weights + FP8 KV-cache sizing for 4090/L40S/A100/H100
  > - **Fine-Tuning vs. RAG vs. Caching TCO**, **RPM/TPM Rate-Limit Capacity Planner**, **AI SaaS Gross Margin**, **Startup Runway**, **CFO Hybrid Waterfall**, and **Prompt A/B Diff** with GitHub Action CI budget-guard YAML export
  > - **Open CORS JSON feed** at `/api/pricing.json` + zero-dep CLI (`node bin/tokenledger.js`)
  >
  > Repo (MIT): https://github.com/swp1234/tokenledger
  >
  > Curious which pricing edge cases (e.g., AWS Bedrock PTU, Anthropic extended thinking tokens, or multi-GPU tensor parallelism) people hit most in production—happy to add them.

### GeekNews (news.hada.io — Korea)
- **URL**: `https://tokenledger-8x7.pages.dev/ko/`
- **Title**: `TokenLedger – 브라우저에서 100% 로컬 실행되는 AI·LLM API 비용 & FinOps 스튜디오 (14개 도구, 24개 모델)`
- **Summary**:
  > 프롬프트나 JSON 스키마를 서버로 전혀 전송하지 않고 브라우저에서 100% 로컬로 실행되는 오픈소스(MIT) AI/LLM API 비용 계산기 및 FinOps 스튜디오입니다.
  > - OpenAI(GPT-5, GPT-4.1, o3), Anthropic(Claude 4), Google(Gemini 2.5), DeepSeek(V3/R1), Llama 4, Qwen 등 24개 모델 실시간 비교 (KRW/USD/EUR/JPY/GBP 통화 전환, 프롬프트 캐싱·50% Batch·모델 캐스케이드 라우팅)
  > - 멀티턴 AI 에이전트의 O(N²) 컨텍스트 폭증 시뮬레이터, MCP 툴 스키마 토큰 세금 감사기, GPU VRAM·KV-Cache 양자화 계산기, 셀프호스팅 GPU vs 클라우드 API 손익분기점, Fine-Tuning vs RAG vs 캐싱 12개월 TCO, RPM/TPM 레이트 리밋 플래너 등 총 14개 워크스페이스 제공
  > - CORS 개방 공개 JSON 피드(`/api/pricing.json`), 무의존성 CLI, GitHub Action PR 비용 가드 YAML 및 Markdown 표 내보내기 지원
  > - GitHub (MIT): https://github.com/swp1234/tokenledger

### r/LocalLLaMA
- **Title**: `I built a 100% browser-local GPU VRAM + KV-Cache calculator & Self-Hosted GPU vs. Cloud API break-even tool (MIT, no login)`
- **Body**:
  > Every time I wanted to sanity-check whether hosting Llama 3.3 70B / Qwen 32B / DeepSeek-R1 on 4090/L40S/A100/H100 beats paying per token on cloud APIs, I ended up juggling three spreadsheets (weights + KV cache + DevOps overhead + utilization).
  >
  > So I built **TokenLedger** — 100% static, runs locally in your browser (zero prompt uploads, MIT licensed):
  > - **GPU VRAM & KV-Cache Calculator**: https://tokenledger-8x7.pages.dev/tools/gpu-vram-calculator.html (Q4/FP8/FP16 weights + FP8 KV-cache halving + context length/batch sizing)
  > - **Self-Hosted GPU vs. Cloud API Break-Even**: https://tokenledger-8x7.pages.dev/tools/self-host-vs-api.html (exact daily request threshold across 4090/L40S/A100/H100)
  > - Also includes 12 other FinOps tools (24-model cost studio, multi-turn agent O(N²) burn, MCP schema tax auditor, Fine-Tuning vs RAG vs Caching TCO, RPM/TPM planner) + open `/api/pricing.json` feed & CLI.
  >
  > Source (MIT): https://github.com/swp1234/tokenledger
  >
  > Feedback on quantization overheads or vLLM throughput defaults is very welcome!

### r/ClaudeAI / r/LLMDevs
- **Title**: `Why a 15-turn MCP/tool-calling agent burns 12x more tokens than Turn 1 — I built a 100% local Agent Burn & MCP Schema Tax calculator (MIT)`
- **Body**:
  > After watching multi-turn tool-calling agents and 5+ connected MCP servers quietly blow up API bills, I built **TokenLedger** — a 100% browser-private (zero prompt upload, MIT open-source) FinOps studio:
  > - **Agent Loop Burn Simulator**: https://tokenledger-8x7.pages.dev/tools/agent-budget.html (visualizes quadratic O(N²) context growth turn by turn vs. prefix caching & sliding windows)
  > - **MCP Schema Tax Auditor**: https://tokenledger-8x7.pages.dev/tools/mcp-schema-auditor.html (paste your tool JSON locally to rank heaviest schemas and estimate lazy-deferral + minification savings)
  > - **Prompt A/B Diff + GitHub Action CI Guard**: https://tokenledger-8x7.pages.dev/tools/prompt-diff.html
  >
  > Source: https://github.com/swp1234/tokenledger

## 2. Monetization Activation Roadmap (Zero Code Rewrite)
1. **Day 1 (Live Now)**: Curated high-ticket O'Reilly AI Engineering & Cloud FinOps technical book recommendations (`dopabrain-20`, `rel="sponsored"`) + open GitHub Sponsor / Partnership CTA across all 80 pages + cookie-free Cloudflare Web Analytics.
2. **At 3,000+ Monthly Dev Visits**: Apply for **EthicalAds** or **Carbon Ads** ($6–$15 eCPM on developer FinOps traffic) or bind a custom domain (`tokenledger.dev` / `tokenledger.io`) for direct AdSense + newsletter sponsorship.
3. **B2B Direct Sponsors ($250–$1,000/mo)**: AI gateway, observability, and GPU cloud providers (OpenRouter, Helicone, Portkey, RunPod, Lambda, Together AI) for above-the-fold placement on `/compare/` and `/` pages.
4. **Pro FinOps Pack ($19–$49 one-time via LemonSqueezy/Stripe)**: CFO AI Budget Deck (Notion/Excel) + automated GitHub Action PR cost-diff bot using `/api/pricing.json`.
