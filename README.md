# Text Barrier Detector

Client-side and Node.js readability and plain-language analysis engine for **English (`en`)** and **Spanish (`es`)** product docs, support copy, PR descriptions, and MCP / CLI workflows.

**Live web app:** [text-barrier-detector.vercel.app](https://text-barrier-detector.vercel.app)  
**Author:** [Maria Contreras](https://github.com/mcontrerasmalpar-pixel)  
**License:** [MIT](./LICENSE)

---

## Features

- **Single TypeScript source of truth** (`src/lib/analyzer.ts`, exported via `src/index.ts`) shared across the browser UI, CLI (`scripts/analyze.mjs`), GitHub Action, and npm / MCP integrations.
- **Zero runtime dependencies** in the published library build (`dist-lib/`).
- **Bilingual heuristics (`en` | `es`)** behind a `LanguagePack` interface:
  - **English (`en`):** Flesch Reading Ease, Flesch–Kincaid Grade Level, syllable counter, passive-voice detector with irregular participle list and phrasal-verb / adjectival / raising-verb false-positive exclusions.
  - **Spanish (`es`):** Fernández-Huerta reading ease (`206.84 - 1.02*P - 0.60*S`), diphthong/hiatus syllable counter, analytic (*ser* + participle) and *se*-passive/impersonal detection with reflexive/accidental clitic exclusions (*"Se me olvidó"*).
- **Density-aware structure scoring:** rewards real paragraph layout, lists, and headings relative to word count so empty formatting cannot game a 100/100 score.
- **Readability Band (A1–C2):** a **CEFR-inspired** heuristic composite (not a certified language exam or official CEFR certification) with target audience and actionable tips.
- **Strict input validation** with localized (`en` / `es`) `AnalysisError` messages and machine-readable error codes.

---

## Installation & Usage

### As an npm package (ESM / CommonJS / TypeScript)

```bash
npm install text-barrier-detector
```

```ts
import {
  analyzeText,
  AnalysisError,
  SUPPORTED_LANGUAGES,
  MAX_INPUT_CHARS,
} from 'text-barrier-detector';

const result = analyzeText(
  'The report was written by the team. She is turned on.',
  'en'
);

console.log(result.overallScore); // 78
console.log(result.passiveCount); // 1 ("She is turned on" is ignored)
console.log(result.level);        // { level: 'A2', label: 'Easy', ... }
```

### CLI

Build the library once (`npm run build:lib`), then run:

```bash
# Analyze a file (defaults to --lang=en)
node scripts/analyze.mjs path/to/file.txt

# Analyze Spanish text from a file or stdin
node scripts/analyze.mjs --lang=es path/to/archivo.txt
echo "Se registró el usuario. Se me olvidó." | node scripts/analyze.mjs --lang=es -
```

---

## API Reference

### `analyzeText(text: string, lang?: AnalysisLanguage): AnalysisResult`

#### Input Schema

| Parameter | Type | Default | Constraints |
|-----------|------|---------|-------------|
| `text` | `string` | *(required)* | Non-empty after trimming; length `<= 1,000,000` UTF-16 code units (`MAX_INPUT_CHARS`). Normalized to Unicode `NFC`. |
| `lang` | `'en' \| 'es'` | `'en'` | Must be one of `SUPPORTED_LANGUAGES` (`['en', 'es']`). |

#### Output Schema (`AnalysisResult`)

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

## JSON Examples

### English Example (`lang = 'en'`)

```ts
analyzeText('The report was written by the team. She is turned on.', 'en');
```

```json
{
  "sentences": [
    {
      "text": "The report was written by the team.",
      "wordCount": 7,
      "isLong": false,
      "hasPassiveVoice": true,
      "complexWords": [],
      "index": 0
    },
    {
      "text": "She is turned on.",
      "wordCount": 4,
      "isLong": false,
      "hasPassiveVoice": false,
      "complexWords": [],
      "index": 1
    }
  ],
  "fleschScore": 96.2,
  "fleschLabel": "Very easy",
  "gradeLevel": 1.3,
  "avgSentenceLength": 5.5,
  "passiveCount": 1,
  "complexWordCount": 0,
  "structureScore": 15,
  "overallScore": 78,
  "totalWords": 11,
  "totalSentences": 2,
  "totalSyllables": 13,
  "suggestions": [
    "Convert passive voice to active voice for clarity.",
    "Add paragraph breaks, headings, or lists to improve structure."
  ],
  "language": "en",
  "formulaName": "Flesch",
  "level": {
    "level": "A2",
    "label": "Easy",
    "description": "Simple text. Common everyday vocabulary, mostly short sentences.",
    "audience": "General public, non-native speakers, readers with limited education.",
    "score": 71,
    "disclaimer": "CEFR-inspired readability heuristic, not a CEFR assessment or certification.",
    "dimensions": {
      "readabilityScore": 96.2,
      "gradeLevelScore": 100,
      "sentenceLengthScore": 100,
      "passiveVoiceScore": 0,
      "complexityScore": 100,
      "structureScore": 15
    },
    "tips": [
      "Rewrite passive-voice sentences in active voice (e.g. \"The report was written by Ana\" → \"Ana wrote the report\").",
      "Add headings, bullet lists, or paragraph breaks to improve visual structure."
    ]
  }
}
```

### Spanish Example (`lang = 'es'`)

```ts
analyzeText('Se registró el usuario. Se me olvidó la contraseña.', 'es');
```

```json
{
  "sentences": [
    {
      "text": "Se registró el usuario.",
      "wordCount": 4,
      "isLong": false,
      "hasPassiveVoice": true,
      "complexWords": [],
      "index": 0
    },
    {
      "text": "Se me olvidó la contraseña.",
      "wordCount": 5,
      "isLong": false,
      "hasPassiveVoice": false,
      "complexWords": [
        "contraseña"
      ],
      "index": 1
    }
  ],
  "fleschScore": 100,
  "fleschLabel": "Very easy",
  "gradeLevel": 10.6,
  "avgSentenceLength": 4.5,
  "passiveCount": 1,
  "complexWordCount": 1,
  "structureScore": 15,
  "overallScore": 76,
  "totalWords": 9,
  "totalSentences": 2,
  "totalSyllables": 19,
  "suggestions": [
    "Convert passive voice to active voice for clarity.",
    "Add paragraph breaks, headings, or lists to improve structure."
  ],
  "language": "es",
  "formulaName": "Fernández-Huerta",
  "level": {
    "level": "B1",
    "label": "Standard",
    "description": "Accessible text. Mix of simple and moderate complexity. Some technical terms.",
    "audience": "Most adults, general audience, plain-language standard.",
    "score": 64,
    "disclaimer": "CEFR-inspired readability heuristic, not a CEFR assessment or certification.",
    "dimensions": {
      "readabilityScore": 100,
      "gradeLevelScore": 45,
      "sentenceLengthScore": 100,
      "passiveVoiceScore": 0,
      "complexityScore": 44.44444444444444,
      "structureScore": 15
    },
    "tips": [
      "Rewrite passive-voice sentences in active voice (e.g. \"The report was written by Ana\" → \"Ana wrote the report\").",
      "Replace polysyllabic words with simpler synonyms (e.g. \"utilise\" → \"use\", \"demonstrate\" → \"show\").",
      "Add headings, bullet lists, or paragraph breaks to improve visual structure."
    ]
  }
}
```

---

## Expected Errors (`AnalysisError`)

Invalid inputs throw an `AnalysisError` (subclass of `Error`) with:
- `code`: `'INVALID_TYPE' | 'EMPTY_TEXT' | 'TEXT_TOO_LONG' | 'UNSUPPORTED_LANGUAGE'`
- `message`: localized human-readable message (`en` or `es`, from `src/lib/i18n.ts`)
- `details`: structured metadata object

| Code | Trigger | Example Message (`en`) | Example Message (`es`) | `details` |
|------|---------|------------------------|------------------------|-----------|
| `INVALID_TYPE` | `typeof text !== 'string'` (e.g. `null`, `undefined`, number, array, object) | `Input text must be a string, but received number.` | `El texto de entrada debe ser una cadena (string), pero se recibió number.` | `{ type: 'number' }` |
| `EMPTY_TEXT` | `text.trim().length === 0` (`""`, `"   \n\t "`) | `Input text is empty. Provide at least one word to analyze.` | `El texto de entrada está vacío. Proporcione al menos una palabra para analizar.` | `{}` |
| `TEXT_TOO_LONG` | `text.length > 1_000_000` (`MAX_INPUT_CHARS`) | `Input text is too long: 1000001 characters (maximum 1000000). Split it into smaller parts.` | `El texto de entrada es demasiado largo: 1000001 caracteres (máximo 1000000). Divídalo en partes más pequeñas.` | `{ length: 1000001, max: 1000000 }` |
| `UNSUPPORTED_LANGUAGE` | `lang` is not `'en'` or `'es'` | `Unsupported language "fr". Supported languages: en, es.` | `Idioma no admitido "fr". Idiomas admitidos: en, es.` | `{ lang: 'fr', supported: 'en, es' }` |

When running via `scripts/analyze.mjs`, `AnalysisError` is printed to `stderr` as JSON (`{"error":{"code":"...","message":"...","details":{...}}}`) and the process exits with code `2`.

---

## Scoring & Readability Band (Honest Notes)

**Overall score & Readability Band composite weights:**

```text
Ease score (Flesch or Fernández-Huerta)   × 0.35
Sentence length                           × 0.20
Passive voice                             × 0.15
Complex-word density                      × 0.15
Structure (density-aware)                 × 0.15
```

- **Readability Band (A1–C2):** The **Readability Band (A1–C2)** is **CEFR-inspired**: it borrows the A1–C2 codes (`A1 Very Easy`, `A2 Easy`, `B1 Standard`, `B2 Moderately Complex`, `C1 Complex`, `C2 Very Complex`) for familiarity, but it is a heuristic composite of the metrics above, **not a CEFR assessment or certification**.
- **Structure density:** Headings require body text beneath them (`>= 15` body words per heading), lists require `>= 2` items with real words, over-fragmented text (`elements / totalWords > 0.5`) is capped at `40`, and short snippets (`< 20` words) are capped at `30`.

Full contract: [`specs/product.md`](./specs/product.md) and [`specs/constitution.md`](./specs/constitution.md).

---

## Development Scripts

```bash
npm install
npm run dev         # Start Vite dev server on http://localhost:8080
npm test            # Run Vitest suite
npm run build:lib   # Build dist-lib/ (ESM + CJS + TypeScript declarations)
npm run build       # Build web application
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```

---

## License

[MIT](./LICENSE) © 2026 Maria Contreras
