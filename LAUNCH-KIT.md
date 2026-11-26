# TokenLedger v6.0 Launch & Monetization Playbook

- Live product: **https://tokenledger-8x7.pages.dev**
- Source repo (MIT): **https://github.com/swp1234/tokenledger**
- Public Pricing JSON API: **https://tokenledger-8x7.pages.dev/api/pricing.json**
- Embeddable Widget: `https://tokenledger-8x7.pages.dev/?embed=1`

## 1. Ready-to-Post Community Launches (v6.0)

### Show HN (Hacker News)
- **URL**: `https://tokenledger-8x7.pages.dev`
- **Title**: `Show HN: TokenLedger – Browser-private AI/LLM FinOps studio (18 calculators, 30 models)`
- **First Comment**:
  > I built TokenLedger because almost every LLM cost calculator I found either only multiplied single-prompt token rates or sent pasted prompts/schemas to a backend.
  >
  > TokenLedger runs 100% locally in the browser (zero prompt uploads, zero login wall, cookie-free analytics) and models the architectural cost traps that actually blow up production AI budgets across **30 flagship models** (GPT-5, GPT-4.1, o3/o3-pro, Claude 4.5 Sonnet/Haiku, Opus 4, Gemini 2.5, DeepSeek-V3.1/R1, Qwen 3 235B MoE, Amazon Nova Pro, Llama 4, Grok 3, Mistral):
  >
  > - **30-Model Live Estimator** with prompt caching (0–95%), 50% async batch discounts, 70/30 model cascade routing, 5-currency switcher (USD/EUR/GBP/JPY/KRW), Ctrl+K palette, and one-click Markdown/CSV/PNG exports
  > - **AI SaaS Pricing Tier & Credit-Pack Architect**: auto-generates Free/Pro/Team/Enterprise credit caps & overage packs with hard gross-margin floor protection + Stripe billing JSON
  > - **LLM Latency, TTFT & Streaming Speed Calculator**: compares 12 inference endpoints (Cerebras, Groq, Fireworks, Gemini, GPT-5, Claude 4.5, Nova Pro) against your SLA
  > - **STT/TTS Audio API Calculator** (Whisper, Deepgram Nova-3, Groq, ElevenLabs, Cartesia + VAD silence trimming) & **Image/Video Gen Studio Budget** (FLUX, GPT-Image-1, Imagen 3, Veo, Runway Gen-4, Sora + draft cascades)
  > - **Multi-Turn Agent Burn O(N²)**, **MCP Schema Tax Auditor**, **GPU VRAM & KV-Cache Calculator**, **Self-Hosted GPU vs. Cloud API**, **Fine-Tuning vs. RAG vs. Caching TCO**, **RPM/TPM Rate-Limit Planner**, **CFO Hybrid Waterfall**, and **Prompt A/B Diff + GitHub Action CI Guard**
  > - **Open CORS JSON feed** at `/api/pricing.json` + zero-dep CLI (`node bin/tokenledger.js`) + 1-line `?embed=1` iframe widget
  >
  > Repo (MIT): https://github.com/swp1234/tokenledger
  >
  > Curious which pricing edge cases (e.g., AWS Bedrock PTU, Anthropic extended thinking tokens, or multi-GPU tensor parallelism) people hit most in production—happy to add them.

### GeekNews (news.hada.io — Korea)
- **URL**: `https://tokenledger-8x7.pages.dev/ko/`
- **Title**: `TokenLedger v6.0 – 브라우저 100% 로컬 실행 AI·LLM API 비용 & FinOps 스튜디오 (18개 도구, 30개 모델)`
- **Summary**:
  > 프롬프트나 JSON 스키마를 서버로 전혀 전송하지 않고 브라우저에서 100% 로컬로 실행되는 오픈소스(MIT) AI/LLM API 비용 계산기 및 FinOps 스튜디오입니다.
  > - OpenAI(GPT-5, GPT-4.1, o3/o3-pro), Anthropic(Claude 4.5 Sonnet/Haiku, Opus 4), Google(Gemini 2.5), DeepSeek(V3.1/R1), Qwen 3 235B MoE, Amazon Nova Pro, Llama 4 등 30개 모델 실시간 비교 (KRW/USD/EUR/JPY/GBP 통화 전환, 프롬프트 캐싱·50% Batch·모델 캐스케이드)
  > - AI SaaS 요금제·크레딧 팩 설계기(마진 하한선 자동 계산), LLM 지연시간(TTFT)·스트리밍 속도 계산기(Cerebras/Groq/Fireworks), STT/TTS 음성 API(Whisper/Deepgram/ElevenLabs), 이미지·영상 생성(FLUX/Imagen 3/Veo/Sora), 멀티턴 에이전트 O(N²) 폭증, MCP 스키마 세금 감사기, GPU VRAM·KV-Cache 등 총 18개 워크스페이스·120페이지 제공
  > - CORS 개방 공개 JSON 피드(`/api/pricing.json`), 무의존성 CLI, GitHub Action PR 비용 가드 YAML 및 `?embed=1` 임베드 위젯 지원
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
1. **Day 1 (Live Now)**: Curated high-ticket O'Reilly AI Engineering & Cloud FinOps technical book recommendations (`dopabrain-20`, `rel="sponsored"`) + open GitHub Sponsor / Partnership CTA across all 120 pages + cookie-free Cloudflare Web Analytics + GSC verification.
2. **At 3,000+ Monthly Dev Visits**: Apply for **EthicalAds** or **Carbon Ads** ($6–$15 eCPM on developer FinOps traffic) or bind a custom domain (`tokenledger.dev` / `tokenledger.io`) for direct AdSense + newsletter sponsorship.
3. **B2B Direct Sponsors ($250–$1,000/mo)**: AI gateway, observability, and GPU cloud providers (OpenRouter, Helicone, Portkey, RunPod, Lambda, Together AI) for above-the-fold placement on `/compare/` and `/` pages.
4. **Pro FinOps Pack ($19–$49 one-time via LemonSqueezy/Stripe)**: CFO AI Budget Deck (Notion/Excel) + automated GitHub Action PR cost-diff bot using `/api/pricing.json`.
