# FoodWise Health

FoodWise Health is a **standalone React + Vite prototype** for checking whether a food is broadly appropriate for a health condition. The first supported condition is gout. It is designed as a transparent decision tool: it shows a status, the reason, serving guidance, supporting tags, and the source behind the rule. It is not a diagnostic or treatment system.

## Run locally

```bash
cd prototypes/foodwise-health
pnpm install
pnpm dev
```

Use `pnpm exec vitest run`, `pnpm run check`, and `pnpm run build` before opening a pull request. The client is served through Vite, and `server/` only provides static-serving compatibility for the template.

## Product architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Decision UI | `client/src/pages/Home.tsx` | Collects the food, flare context, and additional notes; presents a result as an evidence trail |
| Rule engine | `client/src/lib/foodAdvisor.ts` | Maps a food query to a status, explanation, serving guidance, tags, and source URL |
| Regression tests | `client/src/lib/foodAdvisor.test.ts` | Protects the decision contract, including the rule that unknown foods are never automatically safe |
| Health governance | `docs/health-content-governance.md` | Documents content scope, medical-review requirements, source links, and failure paths |
| Brand system | `ideas.md` | Captures the decision-rail and recipe-notebook visual language for future UI work |
| Visual assets | `client/public/foodwise-assets/` | Carries the FoodWise product images and icon with the repository |

## Safe workflow for a new disease rule

| Stage | Required outcome | Owner |
| --- | --- | --- |
| Trigger | A request for a condition, food, or context is received | Product owner |
| Evidence | Credible, current clinical guidance is identified and stored with its URL and review date | Content researcher |
| Rule draft | The rule declares status, reason, serving guidance, tags, confidence, and source | Developer + content reviewer |
| Human checkpoint | A qualified clinician or dietitian approves the wording and exceptions | Clinical reviewer |
| Tests | New decision behavior is written as a failing test first, then implemented | Developer |
| Failure path | Uncertain recipes or conflicting evidence resolve to `needs-review`, never `ok` | Rule engine |

## Current limitations

The UI lets a user write additional health context, but the version in this folder evaluates **gout only**. It must not claim to accommodate kidney disease, diabetes, pregnancy, medication interactions, or other conditions until rules for those contexts have been reviewed and implemented.

For evidence and medical safety requirements, read [health-content-governance.md](docs/health-content-governance.md) before changing any health guidance.
