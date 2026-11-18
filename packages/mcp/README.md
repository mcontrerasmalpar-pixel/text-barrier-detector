# `@maky/text-barrier-mcp`

Model Context Protocol (MCP) server for **Text Barrier Detector** (`@maky/text-barrier-core`).

Gives AI assistants and coding agents deterministic, local readability metrics and barrier detection for **English (`en`)** and **Spanish (`es`)** text and documentation files—with **no network calls, no API keys, and no logging of user text**. Instead of calling a second LLM to rewrite text, `@maky/text-barrier-mcp` returns exact sentence and word barriers (`passive`, `long_sentence`, `complex_word`) with character offsets so the host LLM can rewrite unclear passages directly.

---

## Quick Start

```bash
npx -y @maky/text-barrier-mcp
```

---

## Configuration

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "text-barrier": {
      "command": "npx",
      "args": ["-y", "@maky/text-barrier-mcp"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "text-barrier": {
      "command": "npx",
      "args": ["-y", "@maky/text-barrier-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add text-barrier -- npx -y @maky/text-barrier-mcp
```

---

## Example Prompts

- `"Check the clarity of README.md"`
- `"Run find_barriers on docs/onboarding.md and rewrite any passive or >20-word sentences in active voice."`
- `"Analyze the Spanish release notes in CHANGELOG.es.md with lang='es' and simplify any B2/C1 sections to B1."`

---

## Tools Reference

### 1. `analyze_text`

Computes readability scores (Flesch Reading Ease for `en`, Fernández-Huerta for `es`, Flesch–Kincaid Grade Level, density-aware Structure Score, composite Overall Score) and the **Readability Band (A1–C2)**.

#### Input Schema

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | *(required)* | Plain text or Markdown to analyze (non-empty after trim, max `1,000,000` characters). |
| `lang` | `'en' \| 'es'` | `'en'` | Analysis language (`"en"` uses Flesch Reading Ease; `"es"` uses Fernández-Huerta). |

#### Output Example — English (`lang: "en"`)

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
  "fleschScore": 93.6,
  "fleschLabel": "Very easy",
  "gradeLevel": 1.6,
  "avgSentenceLength": 5.5,
  "passiveCount": 1,
  "complexWordCount": 0,
  "structureScore": 15,
  "overallScore": 77,
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
    "score": 70,
    "disclaimer": "CEFR-inspired readability heuristic, not a CEFR assessment or certification.",
    "dimensions": {
      "readabilityScore": 93.6,
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

#### Output Example — Spanish (`lang: "es"`)

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
      "complexWords": ["contraseña"],
      "index": 1
    }
  ],
  "fleschScore": 100,
  "fleschLabel": "Very easy",
  "gradeLevel": 9.8,
  "avgSentenceLength": 4.5,
  "passiveCount": 1,
  "complexWordCount": 1,
  "structureScore": 15,
  "overallScore": 76,
  "totalWords": 9,
  "totalSentences": 2,
  "totalSyllables": 18,
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
      "gradeLevelScore": 51.67,
      "sentenceLengthScore": 100,
      "passiveVoiceScore": 0,
      "complexityScore": 44.44,
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

### 2. `find_barriers`

Returns a deterministic list of readability barriers (`passive` | `long_sentence` | `complex_word`) with exact character offsets (`start`, `end`), `sentenceIndex`, `reason`, and `lang`.

#### Input Schema

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | *(required)* | Plain text or Markdown to scan (non-empty after trim, max `1,000,000` characters). |
| `lang` | `'en' \| 'es'` | `'en'` | Analysis language (`"en"` or `"es"`). |

#### Output Example — English (`lang: "en"`)

```json
{
  "lang": "en",
  "count": 2,
  "issues": [
    {
      "type": "passive",
      "start": 11,
      "end": 22,
      "sentenceIndex": 0,
      "reason": "Passive voice construction detected; consider rewriting in active voice.",
      "lang": "en",
      "text": "was written"
    },
    {
      "type": "complex_word",
      "start": 39,
      "end": 55,
      "sentenceIndex": 1,
      "reason": "Complex word (6 syllables; consider a simpler synonym).",
      "lang": "en",
      "text": "counterintuitive"
    }
  ]
}
```

#### Output Example — Spanish (`lang: "es"`)

```json
{
  "lang": "es",
  "count": 2,
  "issues": [
    {
      "type": "passive",
      "start": 0,
      "end": 11,
      "sentenceIndex": 0,
      "reason": "Voz pasiva o construcción impersonal detectada; considera usar voz activa.",
      "lang": "es",
      "text": "Se registró"
    },
    {
      "type": "complex_word",
      "start": 40,
      "end": 50,
      "sentenceIndex": 1,
      "reason": "Palabra compleja (4 sílabas; considera un sinónimo más simple).",
      "lang": "es",
      "text": "contraseña"
    }
  ]
}
```

---

### 3. `check_file`

Reads a local `.md` or `.txt` file and returns both the full `analysis` object and the `issues` list in a single call.

#### Input Schema

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `path` | `string` | *(required)* | Local path to a `.md` or `.txt` file (up to `1,000,000` characters / `4 MB`). |
| `lang` | `'en' \| 'es'` | `'en'` | Analysis language (`"en"` or `"es"`). |

#### Output Example

```json
{
  "path": "README.md",
  "lang": "en",
  "analysis": {
    "overallScore": 78,
    "fleschScore": 64.2,
    "fleschLabel": "Moderate",
    "gradeLevel": 8.1,
    "avgSentenceLength": 14.3,
    "passiveCount": 1,
    "complexWordCount": 2,
    "structureScore": 85,
    "totalWords": 143,
    "totalSentences": 10,
    "totalSyllables": 210,
    "language": "en",
    "formulaName": "Flesch",
    "level": {
      "level": "B1",
      "label": "Standard",
      "score": 68,
      "disclaimer": "CEFR-inspired readability heuristic, not a CEFR assessment or certification."
    }
  },
  "issues": [
    {
      "type": "passive",
      "start": 120,
      "end": 131,
      "sentenceIndex": 3,
      "reason": "Passive voice construction detected; consider rewriting in active voice.",
      "lang": "en",
      "text": "was written"
    }
  ]
}
```

---

## Limitations & Honest Notes

- **Approximate heuristics, not full syntactic NLP:** Passive voice (`be`/`get` + participle in English; *ser* + participle and *se*-passive in Spanish) and syllable counts use fast, deterministic rules with curated false-positive exclusions (*"is turned on"*, *"said to be"*, *"Se me olvidó"*). Rare literary passives or ambiguous reflexives can still be missed.
- **Readability Band (A1–C2) is CEFR-inspired, not a certification:** The `A1`–`C2` codes borrow a familiar scale, but the band is a weighted readability composite, **not** an official CEFR exam or Instituto Cervantes / Cambridge assessment.
- **Languages:** Only English (`en`) and Spanish (`es`) are supported.

---

## License

[MIT](./LICENSE) © 2026 Maria Contreras
