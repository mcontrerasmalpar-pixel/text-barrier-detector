# Constitution

Rules that do not bend without an explicit product decision.

## Product

1. **Core analysis stays client-side.** Flesch, grade level, CEFR-style band, heatmap, and structure scoring must work with no backend and no API key.
2. **Claude is optional.** Rewrites may call Anthropic only when the user opts in. Never block Analyze on AI availability.
3. **Honesty over marketing.** Scores are review aids. CEFR labels are inspired composites, not certified exams. Document English-first heuristic limits in user-facing copy and specs.
4. **Bilingual UI and Spanish heuristics (limited).** EN/ES interface strings are required. Spanish analysis (`lang=es`) uses client-side heuristics: *ser*/se passive detection, Spanish syllable groups, and Fernández-Huerta ease—not certified NLP or CEFR. English remains the default for CLI/Action until configured. Do not market Spanish heuristics as perfect multilingual NLP. Portuguese/French remain roadmap.
5. **Fail closed on trust.** Do not raise or lower scoring weights, thresholds, or Action fail cutoffs without updating `product.md` in the same change.

## Engineering

1. TypeScript for app code; keep `scripts/analyze.mjs` zero-dependency so the GitHub Action stays portable.
2. Prefer small, reviewable PRs that include spec updates when behavior changes.
3. Tests should cover scoring and level classification regressions when those modules change.
4. Accessibility of the analyzer UI matters as much as the readability of the text under analysis.

## Process

1. Spec before (or with) implementation for behavior changes.
2. Acceptance criteria must be checkable (test, Action output, or explicit manual steps).
3. Roadmap items stay aspirational until they have a feature spec and a PR.
