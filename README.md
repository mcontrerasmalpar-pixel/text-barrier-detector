# TEXT BARRIER DETECTOR 🔍

> An in-browser text accessibility analyzer powered by rule-based NLP and Claude AI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-prose--decoder--bot.vercel.app-00C7B7?style=flat-square&logo=vercel)](https://prose-decoder-bot.vercel.app)
!\[TypeScript](https://img.shields.io/badge/TypeScript-97.2%25-3178C6?style=flat-square\&logo=typescript)
!\[React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square\&logo=react)
!\[Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square\&logo=vite)
!\[License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

\---

## What it does

Text Barrier Detector analyzes any piece of writing for readability and accessibility problems — entirely in the browser, with no backend required. Paste your text, click **Analyze**, and get:

* **Flesch Reading Ease score** with a visual gauge (0–100)
* **Flesch-Kincaid Grade Level** estimate
* **Sentence-level heatmap** — color-coded by issue type (long sentences, passive voice, complex words)
* **Structure score** based on use of headings, lists, and paragraph breaks
* **Overall accessibility score** (weighted composite metric)
* **AI-powered rewrites** via Claude — simplifies your hardest sentences on demand

\---

## Features

|Feature|Description|
|-|-|
|🧠 In-browser analysis|No API calls needed for core analysis — runs entirely client-side|
|🎨 Sentence heatmap|Red = long sentence, orange = passive voice, yellow = complex words, green = clean|
|📊 Metrics sidebar|Visual gauge, grade level, avg sentence length, passive voice count|
|🤖 Claude AI enhancement|Optional: sends complex sentences to Claude for plain-language rewrites|
|🌐 Bilingual UI|Full English / Spanish interface toggle|
|⚡ Zero setup|No accounts, no keys required for base functionality|

\---

## How the scoring works

The overall score is a weighted composite:

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

\---

## Tech stack

* **Framework**: React 18 + TypeScript
* **Build tool**: Vite 5
* **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
* **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) via direct browser API call
* **Testing**: Vitest + Testing Library + Playwright
* **Built with**: [Lovable](https://lovable.dev)

\---

## Getting started

```bash
# Clone the repo
git clone https://github.com/mcontrerasmalpar-pixel/prose-decoder-bot.git
cd prose-decoder-bot

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

\---

## Project structure

```
src/
├── components/
│   ├── AnnotatedText.tsx    # Sentence heatmap with tooltips
│   ├── MetricsSidebar.tsx   # Score gauges and metrics
│   ├── SuggestionCard.tsx   # Claude AI rewrite suggestions
│   └── TextInput.tsx        # Input area and analyze button
├── lib/
│   ├── analyzer.ts          # Core readability engine (no deps)
│   ├── claudeEnhancer.ts    # Claude API integration
│   ├── i18n.ts              # EN/ES translations
│   └── syllables.ts         # Syllable counter
└── pages/
    └── Index.tsx            # Main page and state management
```

\---

## Roadmap

* \[ ] Fix tooltip overlap on dense text
* \[ ] Export analysis as PDF report
* \[ ] Improve passive voice detection for Spanish
* \[ ] Add support for additional languages (PT, FR)
* \[ ] Domain-specific jargon detection (medical, legal, academic)
* \[ ] Keyboard accessibility audit

\---

## About

Built by [Maria Contreras](https://github.com/mcontrerasmalpar-pixel) — AI engineer specializing in NLP and accessibility tooling.

Part of a broader research interest in text accessibility barriers, alongside a multilingual Sign Language Translator (ASL, LSM, BSL, DGS).



