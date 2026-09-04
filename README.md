# Text Barrier Detector

In-browser readability and plain-language analysis for product docs, support copy, and public writing.

**Live:** [text-barrier-detector.vercel.app](https://text-barrier-detector.vercel.app)  
**Author:** [Maria Contreras](https://github.com/mcontrerasmalpar-pixel)  
**License:** [MIT](./LICENSE)

---

## Why this exists

Teams ship features faster than they ship clear language. Dense sentences, passive voice, and unexplained jargon create the same kind of barrier as a broken UI: people bounce, misunderstand, or ask support what the page already tried to say.

Text Barrier Detector turns that into a measurable signal. Paste text, run analysis, and get scores plus a sentence-level heatmap—no backend and no account for the core path.

Built for people who write or review English product copy (docs, onboarding, emails, PR descriptions) and want something concrete to improve before publish.

---

## What you get

| Output | Detail |
|--------|--------|
| Flesch Reading Ease | 0–100 score with a plain label (Very easy → Very difficult) |
| Flesch–Kincaid grade | Approximate U.S. grade level |
| CEFR-style level | A1–C2 band with audience note and tips toward the next band |
| Sentence heatmap | Long sentences, passive voice, and complex words highlighted |
| Structure score | Rewards paragraphs, lists, and headings |
| Overall score | Weighted composite of the metrics above |
| Optional rewrites | Claude can suggest plain-language alternatives for hard sentences |
| UI language | English / Spanish toggle |

Core analysis runs entirely in the browser. Claude is optional and only used when you ask for rewrites.

---

## Scoring (honest notes)

**Overall score** (same weights as the level score):

```
Flesch Reading Ease   × 0.35
Sentence length       × 0.20
Passive voice         × 0.15
Complex-word density  × 0.15
Structure             × 0.15
```

| Heuristic | Rule of thumb in this repo |
|-----------|----------------------------|
| Long sentence | More than 20 words |
| Complex word | More than 3 syllables |
| Passive voice | English auxiliary + past participle pattern (regex) |
| Structure | Paragraph breaks, lists, and headings |

The A1–C2 labels are **CEFR-inspired composites**, not a certified language exam. Passive detection is English-oriented; Spanish UI does not yet mean Spanish-grade NLP. Treat scores as a review aid, not a compliance stamp.

---

## GitHub Action

`.github/workflows/readability-check.yml` analyzes PR and issue bodies with `scripts/analyze.mjs`, posts a metrics comment, and fails the check when the overall score is below **30/100**.

To reuse elsewhere, copy the workflow and `scripts/analyze.mjs`. The default `GITHUB_TOKEN` is enough.

Example comment shape:

```text
Text Barrier Detector — Readability Report

Text Level: B2 — Upper Intermediate
Recommended audience: Educated adults, professionals.

| Metric              | Value           |
|---------------------|-----------------|
| Overall Score       | 54/100          |
| Flesch Reading Ease | 48.3 (Moderate) |
| Grade Level         | 11.2            |
```

---

## Stack

- React 18, TypeScript, Vite 5
- Tailwind CSS + shadcn/ui (Radix)
- Vitest, Testing Library, Playwright
- Optional: Anthropic Claude (`claude-haiku-4-5-20251001`) from the browser
- CI: readability Action on PRs and issues

---

## Quick start

```bash
git clone https://github.com/mcontrerasmalpar-pixel/text-barrier-detector.git
cd text-barrier-detector
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

CLI (JSON metrics to stdout):

```bash
node scripts/analyze.mjs path/to/your/file.txt
```

Useful scripts: `npm run build`, `npm test`, `npm run lint`.

---

## Layout

```text
.github/workflows/readability-check.yml
scripts/analyze.mjs              # Zero-dep CLI used by the Action
src/
  components/                    # Input, heatmap, metrics, suggestions
  lib/
    analyzer.ts                  # Core readability engine
    levelClassifier.ts           # CEFR-style bands
    claudeEnhancer.ts            # Optional rewrites
    i18n.ts                      # EN / ES strings
    syllables.ts
  pages/Index.tsx
```

---

## Roadmap

Priorities that would matter in a hiring conversation:

1. Stronger Spanish (and later PT/FR) heuristics—not only UI strings
2. Keyboard and screen-reader pass on the heatmap and metrics
3. PDF / shareable report export (`generatePDF` exists; wire and verify)
4. Domain jargon packs (docs, legal, medical) as optional overlays
5. Optional GitHub App for README / docs path analysis

---

## License

[MIT](./LICENSE) © 2026 Maria Contreras

---

## Contact

Issues welcome: [open an issue](https://github.com/mcontrerasmalpar-pixel/text-barrier-detector/issues).  
Email: maria@mcontrerasmalpartida.dev

Designed, built, and shipped by Maria Contreras—NLP and accessibility tooling with a product lens.
