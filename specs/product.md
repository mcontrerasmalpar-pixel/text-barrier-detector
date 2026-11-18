# Product contract — Text Barrier Detector

Status: **current** (matches `feat/npm-ready-core` as of 2026-11-18)

## Problem

Product and docs teams ship unclear English and Spanish copy. Readers bounce or open support tickets. Authors and developer tools (CI, CLI, MCP servers) need a fast, deterministic, zero-dependency signal before publish.

## Users

- Writers and PMs reviewing docs, onboarding, emails, PR/issue bodies in the web UI
- Developers and AI agents consuming the analyzer as an npm package, CLI, or MCP server
- Engineers running readability checks in GitHub Actions CI

## Primary jobs

1. Analyze English (`en`) or Spanish (`es`) text and get deterministic readability and complexity metrics in milliseconds
2. Spot which sentences are long, passive, or lexically heavy
3. Enforce input boundaries with clear, localized error codes and messages
4. Optionally request plain-language rewrites for hard sentences in the browser UI
5. Run the exact same TypeScript engine in the browser, CLI, CI Action, and npm / MCP consumers

## In scope (shipped)

| Capability | Contract |
|------------|----------|
| Core package (`@maky/text-barrier-core` in `packages/core`) | Pure TypeScript ESM + `.d.ts` declarations (`dist/`); exports `analyze(text, { lang })`, `analyzeText(text, lang)`, and `findBarriers(text, { lang })`; zero runtime dependencies, no React/DOM/network code; consumed directly by the React UI, CLI, and MCP server |
| Barrier locator (`findBarriers`) | Deterministic list of `BarrierIssue` items (`passive \| long_sentence \| complex_word`) with `start`/`end` character offsets, `sentenceIndex`, `reason`, `lang`, and `text` |
| MCP server (`@maky/text-barrier-mcp` in `packages/mcp`) | Official `@modelcontextprotocol/sdk` stdio server (`npx -y @maky/text-barrier-mcp`); exposes `analyze_text(text, lang?)`, `find_barriers(text, lang?)`, and `check_file(path, lang?)` (`.md`/`.txt`); Zod schemas, size limits, no user text logging, no network calls, no rewrite tool (host LLM rewrites using the issues) |
| Language packs (`LanguagePack`) | `en` (Flesch) and `es` (Fernández-Huerta) behind a unified `LanguagePack` interface (`src/lib/languages/`). Only `en` and `es` are shipped |
| Ease score | 0–100 with plain label (`Flesch` for `en`, `Fernández-Huerta` for `es`) |
| Flesch–Kincaid grade | Approximate grade level (`>= 0`) |
| Readability Band (A1–C2) | CEFR-inspired band (`A1 Very Easy` → `C2 Very Complex`) + audience + tips + `disclaimer` field; always labelled "CEFR-inspired, not a certification" |
| Sentence heatmap | Long (`> 20` words), passive voice, complex words (`>= 4` syllables minus common technical allow-list) |
| EN passive heuristic | `be`/`get` auxiliaries + regular `-ed` and irregular past participles; excludes phrasal verbs without a `by`-agent (*"is turned on"*), raising verbs (*"is said to be"*), adjectival participles (*"is interested in"*, *"was tired"*), and non-participle `-en`/`-ed` words (*"open"*, *"seven"*, *"indeed"*) |
| ES passive heuristic | Analytic *ser* + participle (`-ado/-ido/-to/-so/-cho`) and *se*-passive/impersonal; excludes accidental/reflexive clitics (*"Se me olvidó"*, *"Se le cayó"*), common reflexive verbs (*"se fue"*, *"se llama"*), and non-participle demonstratives/quantifiers (*"es todo"*, *"es esto"*) |
| Density-aware structure score | Paragraphs, lists (`>= 2` items), and headings (`>= 15` body words per heading) scored relative to word count; caps short (`< 20` words → max `30`) and over-fragmented (`elements / words > 0.5` → max `40`) inputs so empty formatting cannot reach 100 |
| Input validation (`AnalysisError`) | Rejects non-string (`INVALID_TYPE`), empty/whitespace-only (`EMPTY_TEXT`), `> 1,000,000` chars (`TEXT_TOO_LONG`), and unsupported languages (`UNSUPPORTED_LANGUAGE`) with localized (`en`/`es`) messages from `src/lib/i18n.ts` |
| CLI (`scripts/analyze.mjs`) | Thin wrapper over `dist-lib/index.js`; supports `--lang=en\|es`, file path or `-` (stdin), JSON output on stdout, structured JSON errors on stderr |
| GitHub Action | Builds `dist-lib/`, runs `scripts/analyze.mjs`, posts report comment with `Readability Band (A1–C2)`, fails if `overallScore < 30` |

## Out of scope (current)

- Certified CEFR assessment (the Readability Band is CEFR-inspired only)
- Languages other than English (`en`) and Spanish (`es`)
- Heavy NLP runtime dependencies
- Backend server, FastAPI, or Stripe / paid gates for core analysis

## Scoring

```text
Overall / band score =
  Ease score (Flesch / Fernández-Huerta) × 0.35
  Sentence length                        × 0.20
  Passive voice                          × 0.15
  Complex-word density                   × 0.15
  Structure (density-aware)              × 0.15
```

Heuristics:

- Long sentence: `> 20` words (`en` and `es`)
- Complex word: `>= 4` syllables, excluding per-language common product/technical allow-lists
- Passive (`en`): auxiliary + past participle with phrasal-verb, raising-verb, and adjectival exclusions
- Passive (`es`): *ser* + participle and *se* + 3rd-person verb with reflexive/clitic exclusions
- Ease formula (`en`): Flesch Reading Ease `206.835 - 1.015*(W/S) - 84.6*(Syl/W)`
- Ease formula (`es`): Fernández-Huerta `206.84 - 1.02*P - 0.60*S`
- Structure: paragraph layout + paragraph word density (40–180 words/para) + substantive lists + headings with body text, capped for short or over-fragmented inputs

Action fail threshold: overall score **< 30/100**.

## Acceptance checks for this contract

- [x] Core analyzer exports cleanly via `npm run build:lib` (ESM, CJS, `.d.ts`) with zero runtime dependencies
- [x] `scripts/analyze.mjs` reuses the built TypeScript analyzer as the single source of truth
- [x] Passive voice regression fixtures pass for EN (*"The report was written"* vs *"She is turned on"*) and ES (*"Se registró"* vs *"Se me olvidó"*)
- [x] Edge cases pass (punctuation-only, Unicode NFC/NFD, emojis/CJK/RTL, 100k words)
- [x] Input validation throws `AnalysisError` with localized `i18n.ts` messages for non-string, empty, `> 1,000,000` chars, and unsupported language
- [x] UI, README, CLI, Action, and specs use **Readability Band (A1–C2)** and state it is CEFR-inspired, not a certification

## Non-goals disguised as features

Do not ship "multilingual analysis" that only translates the chrome. Do not present the Readability Band (A1–C2) as an official CEFR level or certification; keep the "CEFR-inspired, not a certification" note wherever a band is shown. Do not duplicate analyzer heuristics outside `src/lib/`.
