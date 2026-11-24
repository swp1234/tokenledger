# TokenLedger Launch & Monetization Playbook

Live product: **https://tokenledger-8x7.pages.dev**  
Source repo: **https://github.com/swp1234/tokenledger**  
Public Pricing JSON API: **https://tokenledger-8x7.pages.dev/api/pricing.json**

## 1. Ready-to-Post Community Launches

### Show HN (Hacker News)
- **Title**: `Show HN: TokenLedger – Browser-private LLM API cost, agent snowball & GPU break-even studio`
- **Body**:
  > I built TokenLedger because every LLM pricing calculator I found either only priced single-turn prompts or uploaded pasted prompts to a server.
  >
  > Everything runs 100% locally in the browser (zero prompt upload) across 24 models (GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4, Grok 3, Mistral):
  > - **24-model estimator** with prompt caching (0–95%), 50% batch discounts, 70/30 model cascade savings, and one-click **Copy Markdown Table** for GitHub PRs / Notion RFCs
  > - **Multi-turn Agent Burn Calculator** modeling quadratic O(N²) context snowballing vs. prefix caching & sliding windows
  > - **Self-Hosted GPU (H100/A100/L40S/4090) vs. Cloud API** break-even calculator
  > - **AI SaaS Gross Margin & Power-User Cap Simulator** + **RAG TCO Planner**
  > - Open CORS-enabled JSON pricing feed at `/api/pricing.json`
  >
  > Repo (MIT): https://github.com/swp1234/tokenledger  
  > Live: https://tokenledger-8x7.pages.dev

### r/LocalLLaMA & r/ClaudeAI
- **Angle**: *"I modeled why a 15-turn coding agent burns 12x more tokens than Turn 1 — and built a local GPU (4090/L40S/A100/H100) vs. Cloud API break-even calculator (no login, 100% client-side)"*

### GeekNews (news.hada.io — Korea)
- **Title**: `TokenLedger – 브라우저에서 100% 로컬 실행되는 24개 LLM API 비용·에이전트 폭증·GPU 손익분기점 계산기`
- **Link**: `https://tokenledger-8x7.pages.dev/ko/`

## 2. Monetization Activation Roadmap (Zero Code Rewrite)
1. **Day 1 (Live Now)**: Curated high-ticket O'Reilly AI Engineering & Cloud FinOps technical book recommendations (`dopabrain-20`, `rel="sponsored"`) + open GitHub Sponsor CTA on every workspace and guide.
2. **At 3,000+ Monthly Dev Visits**: Apply for **EthicalAds** or **Carbon Ads** (`$6–$15` eCPM on developer FinOps traffic — 10×–20× higher than consumer display ads) or bind a custom domain (`tokenledger.dev` / `tokenledger.io`) for direct AdSense + newsletter sponsorship.
3. **B2B Direct Sponsors ($250–$1,000/mo)**: AI gateway, observability, and GPU cloud providers (OpenRouter, Helicone, Portkey, RunPod, Lambda, Together AI) pay top rates for above-the-fold placement on LLM cost comparison pages.
4. **Pro FinOps Pack ($19–$49 one-time via LemonSqueezy/Stripe)**: Ready-made Notion/Excel CFO AI Budget Deck + GitHub Action PR cost-diff bot using `/api/pricing.json`.
