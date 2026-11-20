# Changelog

All notable changes to this project and its published packages (`@makitaki/text-barrier-core` and `@makitaki/text-barrier-mcp`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-20

### Added

- **`@makitaki/text-barrier-core` (`packages/core`):**
  - Pure TypeScript readability and barrier detector (`analyze`, `analyzeText`, `findBarriers`) with zero runtime dependencies, no DOM, and no network calls.
  - `LanguagePack` architecture shipping English (`en`, Flesch Reading Ease) and Spanish (`es`, Fernández-Huerta `206.84 - 1.02*P - 0.60*S`) packs.
  - Deterministic `findBarriers(text, { lang })` returning `passive`, `long_sentence`, and `complex_word` issues with exact `start`/`end` character offsets, `sentenceIndex`, localized `reason`, and `lang`.
  - Refined English passive detector with irregular participle list and phrasal-verb (*"is turned on"*), raising-verb (*"is said to be"*), and adjectival participle (*"is interested in"*) exclusions.
  - Refined Spanish passive detector (*ser* + participle and *se*-passive/impersonal) with reflexive/accidental clitic exclusions (*"Se me olvidó"*).
  - Density-aware structure scoring that evaluates paragraphs, lists, and headings relative to word count so empty formatting cannot reach `100/100`.
  - **Readability Band (A1–C2)** classifier with explicit disclaimer (`"CEFR-inspired readability heuristic, not a CEFR assessment or certification."`).
  - Input validation (`AnalysisError`) for non-string (`INVALID_TYPE`), empty (`EMPTY_TEXT`), `> 1,000,000` characters (`TEXT_TOO_LONG`), and unsupported language (`UNSUPPORTED_LANGUAGE`) with localized messages (`en`/`es`).
- **`@makitaki/text-barrier-mcp` (`packages/mcp`):**
  - Official `@modelcontextprotocol/sdk` (`stdio`) server exposing `analyze_text`, `find_barriers`, and `check_file` (`.md` / `.txt`).
  - Official MCP Registry manifest (`server.json`, schema `2025-12-11`) and `mcpName` metadata (`io.github.mcontrerasmalpar-pixel/text-barrier-mcp`).
- **CI & Quality:**
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`) running `npm ci`, `npm run build:mcp`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
  - Regression test suites for EN/ES passive voice, Unicode `NFC`/`NFD`, punctuation-only input, `100,000`-word stress tests, and MCP `stdio` client-server integration tests.

### Removed

- Removed dead browser-side Claude rewrite card (`SuggestionCard.tsx` and `claudeEnhancer.ts`); plain-language rewrites are handled by the host LLM consuming `@makitaki/text-barrier-mcp`.
- Removed duplicate `bun.lock` and `bun.lockb` lockfiles in favor of a single npm workspace lockfile (`package-lock.json`).
