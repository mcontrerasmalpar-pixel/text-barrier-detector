# `@maky/text-barrier-core`

Deterministic readability and plain-language barrier detector for **English (`en`)** and **Spanish (`es`)** text.

- **Zero runtime dependencies** — pure TypeScript compiled to standard ES2022 modules (`dist/index.js`) with full type declarations (`dist/index.d.ts`).
- **No DOM, no React, no network calls** — runs identically in Node.js (`>= 18`), serverless/edge runtimes, browsers, CI pipelines, and MCP servers.
- **Bilingual `LanguagePack` heuristics (`en` | `es`):**
  - **English (`en`):** Flesch Reading Ease, Flesch–Kincaid Grade Level, English syllable estimator, and passive-voice detector with irregular participle list and phrasal-verb (*"is turned on"*), raising-verb (*"is said to be"*), and adjectival participle (*"is interested in"*) exclusions.
  - **Spanish (`es`):** Fernández-Huerta reading ease (`206.84 - 1.02*P - 0.60*S`), diphthong/hiatus syllable estimator, analytic passive (*ser* + participle) and *se*-passive/impersonal detector with reflexive/accidental clitic exclusions (*"Se me olvidó"*).
- **Density-aware structure scoring:** evaluates paragraphs, lists (`>= 2` items), and headings (`>= 15` body words per heading) relative to word count so empty formatting cannot reach `100/100`.
- **Readability Band (A1–C2):** a **CEFR-inspired** heuristic composite (not a certified language exam or official CEFR certification) with target audience and improvement tips.
- **Exact barrier offsets (`findBarriers`):** returns `passive`, `long_sentence`, and `complex_word` issues with `start`/`end` character offsets, `sentenceIndex`, localized `reason`, and `lang`.

---

## Installation

```bash
npm install @maky/text-barrier-core
```

---

## Quick Start

```ts
import {
  analyze,
  findBarriers,
  AnalysisError,
  SUPPORTED_LANGUAGES,
  MAX_INPUT_CHARS,
} from '@maky/text-barrier-core';

// 1. Full readability report + Readability Band (A1–C2)
const report = analyze(
  'The report was written by the team. She is turned on.',
  { lang: 'en' }
);

console.log(report.overallScore); // 77
console.log(report.fleschScore);  // 93.6
console.log(report.passiveCount); // 1 ("She is turned on" is ignored)
console.log(report.level);
// {
//   level: 'A2',
//   label: 'Easy',
//   score: 70,
//   disclaimer: 'CEFR-inspired readability heuristic, not a CEFR assessment or certification.',
//   ...
// }

// 2. Deterministic issue locator with character offsets
const issues = findBarriers(
  'Se registró el usuario. Se me olvidó la contraseña.',
  { lang: 'es' }
);

console.log(issues);
// [
//   {
//     type: 'passive',
//     start: 0,
//     end: 11,
//     sentenceIndex: 0,
//     reason: 'Voz pasiva o construcción impersonal detectada; considera usar voz activa.',
//     lang: 'es',
//     text: 'Se registró'
//   },
//   {
//     type: 'complex_word',
//     start: 40,
//     end: 50,
//     sentenceIndex: 1,
//     reason: 'Palabra compleja (4 sílabas; considera un sinónimo más simple).',
//     lang: 'es',
//     text: 'contraseña'
//   }
// ]
```

---

## API Reference

### `analyze(text: string, options?: AnalyzeOptions): AnalysisResult`
### `analyzeText(text: string, lang?: AnalysisLanguage): AnalysisResult`

Analyzes `text` and returns readability scores, sentence-by-sentence breakdown, structure score, suggestions, and the **Readability Band (A1–C2)**.

| Parameter | Type | Default | Constraints |
|-----------|------|---------|-------------|
| `text` | `string` | *(required)* | Non-empty after trimming; `text.length <= 1,000,000` (`MAX_INPUT_CHARS`). Normalized to Unicode `NFC`. |
| `options.lang` / `lang` | `'en' \| 'es'` | `'en'` | Must be one of `SUPPORTED_LANGUAGES` (`['en', 'es']`). |

---

### `findBarriers(text: string, options?: AnalyzeOptions): BarrierIssue[]`

Deterministically locates readability barriers in `text` without calling an LLM.

Each `BarrierIssue` contains:

```ts
export type BarrierType = 'passive' | 'long_sentence' | 'complex_word';

export interface BarrierIssue {
  /** Issue category */
  type: BarrierType;
  /** Inclusive start offset in the NFC-normalized input string */
  start: number;
  /** Exclusive end offset in the NFC-normalized input string */
  end: number;
  /** Zero-based index of the sentence containing this issue */
  sentenceIndex: number;
  /** Short, deterministic human-readable explanation (EN or ES) */
  reason: string;
  /** Analysis language used ('en' | 'es') */
  lang: 'en' | 'es';
  /** Exact substring (`text.slice(start, end)`) that triggered the issue */
  text: string;
}
```

---

### Output Schema (`AnalysisResult`)

```ts
export type AnalysisLanguage = 'en' | 'es';
export type FormulaName = 'Flesch' | 'Fernández-Huerta';
export type TextLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface SentenceAnalysis {
  text: string;
  wordCount: number;
  isLong: boolean;          // true when wordCount > 20
  hasPassiveVoice: boolean; // language-specific passive heuristic
  complexWords: string[];   // >= 4 syllables, excluding common technical allow-list
  index: number;
}

export interface LevelDimensions {
  readabilityScore: number;    // 0–100
  gradeLevelScore: number;     // 0–100 (inverted grade level)
  sentenceLengthScore: number; // 0–100
  passiveVoiceScore: number;   // 0–100
  complexityScore: number;     // 0–100
  structureScore: number;      // 0–100
}

export interface LevelResult {
  level: TextLevel;            // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  label: string;               // 'Very Easy' | 'Easy' | 'Standard' | 'Moderately Complex' | 'Complex' | 'Very Complex'
  description: string;
  audience: string;
  score: number;               // 0–100 weighted composite
  disclaimer: string;          // Always states CEFR-inspired heuristic, not a certification
  dimensions: LevelDimensions;
  tips: string[];              // Up to 3 actionable suggestions
}

export interface AnalysisResult {
  sentences: SentenceAnalysis[];
  fleschScore: number;         // 0–100 (Flesch for 'en', Fernández-Huerta for 'es')
  fleschLabel: string;         // 'Very easy' | 'Easy' | 'Moderate' | 'Difficult' | 'Very difficult'
  gradeLevel: number;          // >= 0
  avgSentenceLength: number;   // words per sentence
  passiveCount: number;        // sentences flagged for passive voice
  complexWordCount: number;    // total complex words across sentences
  structureScore: number;      // 0–100 density-aware structure score
  overallScore: number;        // 0–100 weighted composite
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  suggestions: string[];       // Top 3 overall suggestions
  level: LevelResult;          // Readability Band (A1–C2), CEFR-inspired
  language: AnalysisLanguage;  // 'en' | 'es'
  formulaName: FormulaName;    // 'Flesch' | 'Fernández-Huerta'
}
```

---

## Input Validation & `AnalysisError`

Invalid inputs throw an `AnalysisError` (subclass of `Error`) with:
- `code`: `'INVALID_TYPE' | 'EMPTY_TEXT' | 'TEXT_TOO_LONG' | 'UNSUPPORTED_LANGUAGE'`
- `message`: localized human-readable message (`en` or `es`)
- `details`: structured metadata object

| Code | Trigger | Example Message (`en`) | Example Message (`es`) | `details` |
|------|---------|------------------------|------------------------|-----------|
| `INVALID_TYPE` | `typeof text !== 'string'` | `Input text must be a string, but received number.` | `El texto de entrada debe ser una cadena (string), pero se recibió number.` | `{ type: 'number' }` |
| `EMPTY_TEXT` | `text.trim().length === 0` | `Input text is empty. Provide at least one word to analyze.` | `El texto de entrada está vacío. Proporcione al menos una palabra para analizar.` | `{}` |
| `TEXT_TOO_LONG` | `text.length > 1_000_000` (`MAX_INPUT_CHARS`) | `Input text is too long: 1000001 characters (maximum 1000000). Split it into smaller parts.` | `El texto de entrada es demasiado largo: 1000001 caracteres (máximo 1000000). Divídalo en partes más pequeñas.` | `{ length: 1000001, max: 1000000 }` |
| `UNSUPPORTED_LANGUAGE` | `lang` is not `'en'` or `'es'` | `Unsupported language "fr". Supported languages: en, es.` | `Idioma no admitido "fr". Idiomas admitidos: en, es.` | `{ lang: 'fr', supported: 'en, es' }` |

---

## Scoring & Limitations

```text
Overall / Readability Band score =
  Ease score (Flesch / Fernández-Huerta) × 0.35
  Sentence length                        × 0.20
  Passive voice                          × 0.15
  Complex-word density                   × 0.15
  Structure (density-aware)              × 0.15
```

- **Readability Band (A1–C2) is CEFR-inspired, not a certification:** The `A1`–`C2` codes borrow a familiar scale, but the band is a weighted readability composite, **not** an official CEFR exam or certification.
- **Approximate heuristics:** Passive voice and syllable counts use deterministic rules and curated false-positive exclusions rather than a heavy syntactic parser.

---

## License

[MIT](./LICENSE) © 2026 Maria Contreras
