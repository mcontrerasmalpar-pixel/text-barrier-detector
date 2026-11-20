---
name: text-barrier
description: Check and improve the readability of English or Spanish docs (README, release notes, support copy, specs) with the Text Barrier MCP server. Use when the user asks to simplify, plain-language, proofread for clarity, or audit readability of a .md/.txt file or pasted text. Returns exact passive-voice, long-sentence and complex-word locations so you can rewrite them.
---

# Text Barrier: plain-language checker

Deterministic, offline readability analysis for **English (`en`)** and **Spanish (`es`)**. It runs locally over MCP: no API key, no network calls, no second LLM. You rewrite the text; the server tells you exactly where the barriers are.

## Setup (once)

The skill needs the `text-barrier` MCP server. If its tools (`analyze_text`, `find_barriers`, `check_file`) are not available, install it:

```bash
claude mcp add text-barrier -- npx -y @makitaki/text-barrier-mcp
```

Other clients (Cursor, Claude Desktop): add `{"command": "npx", "args": ["-y", "@makitaki/text-barrier-mcp"]}` under `mcpServers`. Requires Node 18+.

## When to use it

- "Make this clearer / simpler / plain language"
- "Check the readability of README.md" or any `.md` / `.txt` file
- Reviewing docs, onboarding guides, release notes, support copy or PR descriptions before they ship
- Reducing a document to a target level (for example "bring this down to B1")

Do **not** use it for code, logs, or languages other than English and Spanish.

## Tools

| Tool | Use it for | Input |
|---|---|---|
| `check_file` | A local `.md` or `.txt` file. Returns full analysis plus barrier issues in one call. | `path`, `lang?` |
| `analyze_text` | Scores for pasted text: Flesch (en) or Fernández-Huerta (es), grade level, structure score, overall score, Readability Band A1–C2, tips. | `text`, `lang?` |
| `find_barriers` | Exact issues with character offsets: `passive`, `long_sentence` (over 20 words), `complex_word`. | `text`, `lang?` |

`lang` is `"en"` (default) or `"es"`. **Always set it explicitly** to match the text. Do not rely on the default for Spanish.

## Workflow

1. **Pick the tool.** A file path means `check_file`. Pasted text means `analyze_text`, then `find_barriers`.
2. **Report the baseline** in two or three lines: Readability Band, overall score, and the count of each barrier type.
3. **Rewrite only flagged spans.** Use each issue's `start`/`end` offsets and `sentenceIndex`. Keep meaning, names, numbers and technical terms unchanged. Typical fixes:
   - `passive`: rewrite in active voice ("The report was written by Ana" becomes "Ana wrote the report").
   - `long_sentence`: split at a natural break; aim for 20 words or fewer.
   - `complex_word`: replace with a simpler synonym only when meaning is preserved. Keep necessary technical terms.
4. **Re-run** the same tool on the revised text and show before and after (band and overall score).
5. **Stop** when the user's target is met or when remaining issues are intentional (technical terms, legal wording). Say which ones you left and why.

## Rules

- **Never rewrite the whole document** just to raise a score. Change flagged spans and leave the rest.
- **Do not edit the file on disk** unless the user asked you to. Otherwise present the revised passages.
- **Be honest about limits.** The Readability Band is *CEFR-inspired*, not a CEFR assessment or certification. Scores are review aids, not verdicts. Spanish uses heuristics (se/ser passive detection, Spanish syllable groups) and is less precise than English.
- **Respect privacy.** The server does not log or transmit text; `check_file` only reads local `.md` and `.txt` files.
- **Input limit:** 1,000,000 characters. For very large files, check section by section.

## Example (real run on `README.md`)

User: "Check the clarity of README.md."

1. Call `check_file` with `path: "README.md"`, `lang: "en"`.
2. Real baseline returned by `@makitaki/text-barrier-mcp@0.1.0` on this repository's `README.md`:
   - **Readability Band:** `C1` (`Complex`, band score `31/100`), **Overall Score:** `45/100`, **Structure Score:** `85/100`.
   - **Barriers:** `9` passive, `25` long sentences, `201` complex words (`1,455` words across `48` sentences).
   - *(Note: Markdown code blocks, JSON examples, and URLs inflate `complex_word` and `long_sentence` counts—focus rewrites on prose paragraphs and leave code/URLs untouched.)*
3. Rewrite the flagged prose spans (for example, splitting sentence `0` of `README.md`, which has 25 words and flags `Deterministic` / `readability`, into two shorter active sentences while keeping package names and commands intact).
4. Re-run `analyze_text` on the revised prose and report the before/after Readability Band and overall score.

## Errors

Tools return `{"error": {"code", "message", "details"}}` with `isError: true`. Common codes: `UNSUPPORTED_LANGUAGE` (use `en` or `es`), `UNSUPPORTED_FILE_TYPE` (only `.md`, `.txt`), `FILE_NOT_FOUND`, `INVALID_PATH`. Fix the argument and retry once; do not guess results.

## Source

MIT licensed. Repo: https://github.com/mcontrerasmalpar-pixel/text-barrier-detector (package `@makitaki/text-barrier-mcp`).
