# Product contract — Text Barrier Detector

Status: **current** (matches `main` as of 2026-09-04)

## Problem

Product and docs teams ship unclear English copy. Readers bounce or open support tickets. Authors need a fast, local signal before publish.

## Users

- Writers and PMs reviewing docs, onboarding, emails, PR/issue bodies
- Engineers who want a reusable readability check in CI

## Primary jobs

1. Paste text → see readability / complexity signals in under a few seconds
2. Spot which sentences are long, passive, or lexically heavy
3. Optionally request plain-language rewrites for hard sentences
4. Optionally run the same engine on GitHub PR/issue bodies via Action

## In scope (shipped)

| Capability | Contract |
|------------|----------|
| Flesch Reading Ease | 0–100 with plain label |
| Flesch–Kincaid grade | Approximate U.S. grade level |
| CEFR-style level | A1–C2 band + audience + tips |
| Sentence heatmap | Long / passive / complex / clean |
| Structure score | Paragraphs, lists, headings |
| Overall score | Weighted composite (see Scoring) |
| UI languages | English and Spanish strings |
| Spanish heuristics | Passive (*ser*+participle, *se*), Spanish syllables, Fernández-Huerta when analysis lang=`es` |
| CLI | `node scripts/analyze.mjs [--lang=en|es] <file>` → JSON (includes `language`, `formulaName`) |
| GitHub Action | Comment + fail if overall score &lt; 30 (English-default; lang input deferred) |

## Planned (specified, not shipped)

| Capability | Spec |
|------------|------|
| GitHub Action `analysis_language` input | Follow-up to Feature 01 |

## Out of scope (current)

- Certified CEFR assessment
- Perfect multilingual NLP (Spanish heuristics are approximate)
- Portuguese / French linguistic analysis (after Spanish)
- Required accounts or paid gate for core Analyze
- Guaranteed PDF export (code may exist; not a shipped contract yet)
- GitHub App / OAuth repo scanning

## Scoring

```
Overall / level score =
  Ease score (Flesch / Fernández-Huerta) × 0.35
  Sentence length       × 0.20
  Passive voice         × 0.15
  Complex-word density  × 0.15
  Structure             × 0.15
```

Heuristics:

- Long sentence: &gt; 20 words (both languages)
- Complex word: ≥4 syllables (English historically `&gt; 3`; same threshold for Spanish)
- Passive (en): English auxiliary + past participle regex
- Passive (es): *ser* + participle; *se* + 3rd-person product-copy patterns
- Ease formula (en): Flesch Reading Ease
- Ease formula (es): Fernández-Huerta `206.84 - 1.02*P - 0.60*S`
- Structure: paragraph breaks, lists, headings (capped at 100)

Overall weight vector is unchanged across languages; only the ease formula and linguistic detectors switch with `lang`.

Action fail threshold: overall score **&lt; 30/100**.

## Acceptance checks for this contract

- [ ] Analyze works offline for core metrics (no Anthropic call)
- [ ] Claude path is opt-in and degrades without a key
- [ ] `scripts/analyze.mjs` returns JSON with metrics + `level`
- [ ] README live URL matches the deployed Vercel app
- [ ] Spec and scoring docs stay aligned when weights change

## Non-goals disguised as features

Do not ship “multilingual analysis” that only translates the chrome (Spanish heuristics must be real detectors + formula). Do not rename CEFR-inspired bands as official CEFR. Do not move core scoring to a server without a new product decision.
