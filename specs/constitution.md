# Constitution

Rules that do not bend without an explicit product decision.

## Product

1. **Core analysis is 100% deterministic and local.** Flesch / Fernández-Huerta reading ease, grade level, Readability Band (A1–C2), sentence heatmap, `findBarriers`, and density-aware structure scoring run locally in memory with no backend, no network calls, and no API key.
2. **Host LLM rewrites via MCP, not browser API calls.** Plain-language rewrites are delegated to the host LLM consuming `@makitaki/text-barrier-mcp` (`analyze_text`, `find_barriers`, `check_file`), rather than embedding direct browser calls to third-party LLM APIs.
3. **Honesty over marketing.** Scores are review aids. The Readability Band (A1–C2) is CEFR-inspired, not a CEFR assessment or certification. Document heuristic limits in user-facing copy and specs.
4. **Bilingual UI and Spanish heuristics (EN + ES only).** EN/ES interface strings are required. Spanish analysis (`lang=es`) uses deterministic heuristics: *ser*/se passive detection with reflexive/clitic exclusions, Spanish syllable groups, and Fernández-Huerta ease—not certified NLP or CEFR. English remains the default for CLI/Action/MCP unless `lang` is specified.
5. **Fail closed on trust.** Do not raise or lower scoring weights, thresholds, or Action fail cutoffs without updating `product.md` in the same change.

## Engineering

1. TypeScript for all code. `@makitaki/text-barrier-core` (`packages/core`) is the **single source of truth**: the React UI (`src/`), the MCP server (`packages/mcp`), and `scripts/analyze.mjs` must import from `@makitaki/text-barrier-core`, never duplicate heuristics. `@makitaki/text-barrier-core` has zero runtime dependencies.
2. Prefer small, reviewable PRs that include spec updates when behavior changes, and keep CI (`.github/workflows/ci.yml`: lint, typecheck, build, test) green.
3. Tests must cover scoring, passive false-positive regressions, edge cases, and MCP stdio tool execution when those modules change.
4. Accessibility of the analyzer UI matters as much as the readability of the text under analysis.

## Process

1. Spec before (or with) implementation for behavior changes.
2. Acceptance criteria must be checkable (test, Action output, or explicit manual steps).
3. Roadmap items stay aspirational until they have a feature spec and a PR.
