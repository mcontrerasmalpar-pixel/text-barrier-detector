# Feature 01 — Spanish heuristics

Status: **implemented**  
Owner: Maria Contreras  
Related: [`../product.md`](../product.md), [`../constitution.md`](../constitution.md)

## Problem

The UI already speaks Spanish (`i18n` `es`), but the analyzer still assumes English:

- Passive voice uses English auxiliaries (`is/are/was/were…` + past participle)
- Syllable counting is English-oriented
- Flesch / Flesch–Kincaid constants are calibrated for English

That creates a trust gap for Spanish (and LatAm) product copy: the chrome says “Analizar”, the engine still scores as if the text were English.

## Goal

Ship **language-aware Spanish heuristics** for core analysis, still 100% client-side, so Spanish input gets Spanish-appropriate passive detection, syllable estimates, and readability formulas—without claiming certified CEFR or perfect NLP.

## Users / scenarios

1. A writer pastes Spanish onboarding copy with the UI in `es` and expects passive/long/complex highlights that make sense for Spanish.
2. A bilingual team pastes Spanish into the CLI / Action and wants JSON that reflects Spanish heuristics when language is Spanish.
3. An English document must keep today’s English behavior (no silent regression).

## In scope

1. **Language selection for analysis**
   - Explicit control: user can set analysis language to `en` | `es` (default: follow UI language, with a clear override).
   - Optional light auto-detect is nice-to-have only if it is deterministic and documented; default path must not be opaque.
2. **Spanish passive voice**
   - Detect common periphrastic passives: *ser* + participle (agreement-aware enough for MVP), and high-signal *se* passives / impersonal *se* patterns used in product copy.
   - Document known misses (e.g. rare literary forms) in this spec when implementing.
3. **Spanish syllable / complexity proxy**
   - Replace English-only syllable rules for `es` with a Spanish vowel-group heuristic (including accented vowels `áéíóúü`, digraphs as needed for MVP).
   - Keep “complex word” definition as syllable threshold, but tune the threshold only if tests show English `>3` is unfair for Spanish; any threshold change must be recorded here and in `product.md`.
4. **Spanish readability formula**
   - Use a documented Spanish-oriented formula for the primary ease score when `lang=es` (e.g. Fernández-Huerta or Szigriszt-Pazos—pick one in implementation and name it in UI/CLI output).
   - Map the result into the existing 0–100 gauge and overall weights **without** changing English weights.
5. **Parity surfaces**
   - Browser Analyze path (`analyzer.ts` + classifier inputs)
   - `scripts/analyze.mjs` (same rules; accept `--lang=es|en` or equivalent)
   - Heatmap tips / suggestion strings already exist in `i18n`; ensure tips match the heuristic that fired
6. **Honesty in UI**
   - When `lang=es`, labels must not say “Flesch” if the formula is not Flesch—use the real formula name.
   - README + `product.md` updated in the same PR that lands code.

## Out of scope

- Certified CEFR / Instituto Cervantes alignment
- Full morphological analysis, dependency parsing, or server models
- Portuguese / French (separate feature specs later)
- Changing Action fail threshold (30) unless a follow-up product decision says so
- Making Claude required for Spanish
- Translating only the UI and calling that “Spanish analysis”

## Constraints (constitution)

- Core analysis stays client-side; no API key for Spanish heuristics.
- Claude remains optional.
- Do not market Spanish heuristics as perfect multilingual NLP.
- Keep `analyze.mjs` zero-dependency.
- Add/adjust Vitest coverage for Spanish fixtures when scoring modules change.

## Acceptance criteria

Checkable before merge:

- [x] With `lang=en`, golden English fixtures match current scores within a documented tolerance (no unintended drift).
- [x] With `lang=es`, at least 8 fixture sentences cover: clear *ser* + participle passive, clear *se* passive/impersonal, long sentence, short clean sentence, word with accented vowels, product-doc style paragraph.
- [x] Spanish passive fixtures are flagged; parallel English-only regex must **not** be the sole detector for those fixtures.
- [x] UI exposes analysis language (or inherits UI language with override) and shows the correct formula name for `es`.
- [x] `node scripts/analyze.mjs --lang=es <fixture>` returns JSON including language and Spanish formula fields.
- [x] `product.md` moves “Strong Spanish… analysis” from out-of-scope to in-scope (shipped) and lists formula + heuristics.
- [x] Constitution item “Bilingual UI, not bilingual NLP (yet)” is revised in the same PR to reflect shipped Spanish heuristics and remaining limits.

## Implementation sketch (non-binding)

Hunches for the implementer to verify—not required design:

- Introduce `AnalysisLanguage = 'en' | 'es'` threaded through `analyzeText` / CLI.
- Split detectors: `passive/en.ts`, `passive/es.ts`; `syllables/en.ts`, `syllables/es.ts`; readability formula switch.
- Keep overall weight vector identical unless product.md explicitly changes it.

## Test plan

1. Unit tests for Spanish passive + syllables + formula on fixtures under e.g. `src/lib/__fixtures__/es/`.
2. Regression suite for existing English analyzer tests.
3. Manual: UI `es` + Spanish paste → heatmap + metrics labels look coherent; switch to `en` on same Spanish text → user can see the difference (expected).
4. Action: optional follow-up to pass language via workflow input; not required for MVP if CLI flag exists and docs say Action stays English-default until configured.

## Rollout

1. Land this spec (this file).
2. Implement behind clear `lang` control; default inherits UI language.
3. Update README scoring section + product contract in the implementation PR.
4. Consider a short “Spanish heuristics” note in the portfolio project blurb after ship.

## Decisions (resolved in implementation)

1. **Default language:** Analysis language inherits the UI language (`en` | `es`). No auto-detect in v1. CLI uses `--lang=es|en` (default `en`).
2. **Formula:** Fernández-Huerta for `lang=es`: `206.84 - (1.02 * P) - (0.60 * S)`. UI/CLI expose `formulaName: "Fernández-Huerta"`. English keeps Flesch.
3. **GitHub Action language input:** Deferred. Action stays English-default. CLI `--lang` is available now.

## Known misses (Spanish passive)

- Rare literary passives and full morphological agreement are not covered.
- Ambiguous reflexive *se* outside product-copy 3rd-person patterns may be under- or over-flagged.
- Some adjectives ending in *-to/-so/-cho* after *ser* can false-positive the participle heuristic.

## Complex-word threshold

Spanish complex word = **≥4 syllables** (same integer threshold as English `>3`). Recorded here and in `product.md`.
