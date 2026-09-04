# Spec-Driven Development

This repo is maintained with **spec-anchored** Spec-Driven Development (SDD): the documents under `specs/` are the living source of intent. Code, UI, and CI should fulfill them—not the other way around.

## Loop

1. **Constitution** — non-negotiable product and engineering rules (`constitution.md`)
2. **Specify** — update the product contract and acceptance criteria (`product.md`)
3. **Plan / tasks** — for non-trivial work, add a short `specs/features/<slug>.md` with scope, out-of-scope, and acceptance checks
4. **Implement** — change code against that feature spec
5. **Validate** — tests, Action, and a manual pass against the acceptance criteria

Small typo fixes do not need a feature file. Anything that changes scoring, UX contracts, or Action behavior does.

## Feature specs

| ID | Spec | Status |
|----|------|--------|
| 01 | [Spanish heuristics](./features/01-spanish-heuristics.md) | specified |

## Why here

Text Barrier Detector is easy to “improve” in ways that break trust (silent score changes, English-only heuristics sold as multilingual, optional AI that becomes required). Specs make those trade-offs explicit before code lands.

## For AI agents and collaborators

- Read `constitution.md` and `product.md` before proposing changes.
- Prefer editing the relevant spec in the same PR as the code.
- Do not invent metrics, thresholds, or languages that are not in the product contract.
