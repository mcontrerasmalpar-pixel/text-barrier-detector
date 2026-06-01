# TEXT BARRIER DETECTOR 🔍

> An in-browser text accessibility analyzer powered by rule-based NLP and Claude AI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-prose--decoder--bot.vercel.app-00C7B7?style=flat-square&logo=vercel)](https://prose-decoder-bot.vercel.app)
[![Readability Check](https://img.shields.io/badge/GitHub%20Action-Readability%20Check-2088FF?style=flat-square&logo=github-actions)](https://github.com/mcontrerasmalpar-pixel/text-barrier-detector/actions/workflows/readability-check.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-97.2%25-3178C6?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## What it does

Text Barrier Detector analyzes any piece of writing for readability and accessibility problems — entirely in the browser, with no backend required. Paste your text, click **Analyze**, and get:

- **Flesch Reading Ease score** with a visual gauge (0–100)
- **Flesch-Kincaid Grade Level** estimate
- **CEFR-style text level** (A1 → C2) with audience description and tips to improve
- **Sentence-level heatmap** — color-coded by issue type (long sentences, passive voice, complex words)
- **Structure score** based on use of headings, lists, and paragraph breaks
- **Overall accessibility score** (weighted composite metric)
- **AI-powered rewrites** via Claude — simplifies your hardest sentences on demand

---

## Features

| Feature | Description |
|-|-|
| 🧠 In-browser analysis | No API calls needed for core analysis — runs entirely client-side |
| 🎯 CEFR Level classification | Rates text from A1 (Beginner) to C2 (Expert) with per-dimension breakdown |
| 🎨 Sentence heatmap | Red = long sentence, orange = passive voice, yellow = complex words, green = clean |
| 📊 Metrics sidebar | Visual gauge, grade level, avg sentence length, passive voice count |
| 🤖 Claude AI enhancement | Optional: sends complex sentences to Claude for plain-language rewrites |
| 🌐 Bilingual UI | Full English / Spanish interface toggle |
| ⚡ Zero setup | No accounts, no keys required for base functionality |
| 🔁 GitHub Action | Automated readability check on PRs and Issues via GitHub API |

---

## CEFR Text Level Classification

Every analysis now includes a **CEFR-inspired level** (A1–C2) derived from five weighted dimensions:

| Level | Label | Score range | Audience |
|-------|-------|-------------|----------|
| 🟢 A1 | Beginner | 85–100 | Children, early learners, non-native speakers |
| 🟢 A2 | Elementary | 70–84 | General public, non-native speakers |
| 🟡 B1 | Intermediate | 55–69 | Most adults — plain-language standard |
| 🟠 B2 | Upper Intermediate | 40–54 | Educated adults, related professionals |
| 🔴 C1 | Advanced | 25–39 | Specialists, academics |
| 🔴 C2 | Mastery / Expert | 0–24 | Domain experts, researchers only |

The level is computed from five dimensions:

```
Level Score =
  Readability (Flesch)  × 0.35
  Sentence length       × 0.20
  Passive voice         × 0.15
  Complex word density  × 0.15
  Structure score       × 0.15
```

Each result also includes **tips to reach the next level** (e.g. C1 → B2) and the recommended audience for the current level.

---

## GitHub Action: Readability Check

This repo includes a **GitHub Action** that automatically runs the readability engine on every PR description and Issue body, then posts a structured report as a comment.

### How it works

1. A PR or Issue is opened or edited
2. The action extracts the body text and runs `scripts/analyze.mjs`
3. A comment is posted with the full metrics table, CEFR level, dimension breakdown, and improvement tips
4. If the overall score is below **30/100**, the check fails

### Example output

```
🟡 Text Barrier Detector — Readability Report

### 🟠 Text Level: `B2` — Upper Intermediate
> Moderately complex. Longer sentences, some passive voice.
> Recommended audience: Educated adults, professionals.

| Metric                  | Value           |
|-------------------------|-----------------|
| Overall Score           | 54/100          |
| Level Score             | 47/100          |
| Flesch Reading Ease     | 48.3 (Moderate) |
| Grade Level             | 11.2            |

### 📊 Dimension Breakdown
| Dimension        | Score   |
|------------------|---------|
| Readability      | 48/100  |
| Sentence Length  | 61/100  |
| Passive Voice    | 72/100  |
| Complexity       | 55/100  |
| Structure        | 40/100  |

### 🎯 Tips to reach level B1
- Break long sentences into shorter ones (target: under 15 words).
- Replace complex words with simpler synonyms.
```

### Use it in your own repo

Copy `.github/workflows/readability-check.yml` and `scripts/analyze.mjs` to your repository. No extra dependencies or tokens needed beyond the default `GITHUB_TOKEN`.

---

## How the scoring works

The overall accessibility score is a weighted composite:

```
Overall Score =
  Flesch Reading Ease   × 0.35
  Sentence length       × 0.20
  Passive voice         × 0.15
  Complex word density  × 0.15
  Structure score       × 0.15
```

**Structure score** rewards paragraph breaks (+40), bullet/numbered lists (+30), and headers (+30).

**Complex words** are defined as words with more than 3 syllables.

**Passive voice** is detected via regex pattern matching on auxiliary verb + past participle constructions.

---

## Tech stack

- **Framework**: React 18 + TypeScript
- **Build tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **AI**: Anthropic Claude (`claude-haiku-4-5-20251001`) via direct browser API call
- **Testing**: Vitest + Testing Library + Playwright
- **CI**: GitHub Actions — readability check on PRs and Issues

---

## Getting started

```bash
# Clone the repo
git clone https://github.com/mcontrerasmalpar-pixel/text-barrier-detector.git
cd text-barrier-detector

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Run the CLI analyzer

```bash
node scripts/analyze.mjs path/to/your/file.txt
```

Returns a JSON object with all readability metrics, CEFR level, dimension scores, and improvement tips.

---

## Project structure

```
.github/
└── workflows/
    └── readability-check.yml   # GitHub Action for PRs and Issues
scripts/
└── analyze.mjs                 # Standalone CLI analyzer (no deps)
src/
├── components/
│   ├── AnnotatedText.tsx        # Sentence heatmap with tooltips
│   ├── MetricsSidebar.tsx       # Score gauges and metrics
│   ├── SuggestionCard.tsx       # Claude AI rewrite suggestions
│   └── TextInput.tsx            # Input area and analyze button
├── lib/
│   ├── analyzer.ts              # Core readability engine
│   ├── levelClassifier.ts       # CEFR-style level classification (A1–C2)
│   ├── claudeEnhancer.ts        # Claude API integration
│   ├── i18n.ts                  # EN/ES translations
│   └── syllables.ts             # Syllable counter
└── pages/
    └── Index.tsx                # Main page and state management
```

---

## Roadmap

- [ ] Fix tooltip overlap on dense text
- [ ] Export analysis as PDF report
- [ ] Improve passive voice detection for Spanish
- [ ] Add support for additional languages (PT, FR)
- [ ] Domain-specific jargon detection (medical, legal, academic)
- [ ] Keyboard accessibility audit
- [ ] GitHub App with OAuth for repo README analysis

---

## Support

For questions, bug reports, or feedback: **maria@mcontrerasmalpartida.dev**

Open an [issue](https://github.com/mcontrerasmalpar-pixel/text-barrier-detector/issues) or reach out directly — all reports are reviewed and responded to.

---

## About

Built by [Maria Contreras](https://github.com/mcontrerasmalpar-pixel) — AI engineer specializing in NLP and accessibility tooling.

Part of a broader research interest in text accessibility barriers, alongside a multilingual Sign Language Translator (ASL, LSM, BSL, DGS).

> Works with GitHub · [GitHub Developer Program](https://github.com/developer/register)
