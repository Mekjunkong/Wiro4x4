# Codebase Cleanup Report

**Date:** 2026-03-05
**Performed by:** Claude Code (Automated)

## Summary

Removed 33 unused npm dependencies, 45+ dead code files, and ~10,000 lines of unused code.
All tests, TypeScript checks, and builds pass after cleanup.

## Validation Results

```
TypeScript:  npx tsc --noEmit        -> 0 errors
Tests:       pnpm test               -> 157 passed, 36 skipped (unchanged)
Build:       pnpm build              -> Success (5.15s)
```

---

## 1. Dependencies Removed (33 packages)

### Production Dependencies Removed (20)

| Package                           | Reason                                                            |
| --------------------------------- | ----------------------------------------------------------------- |
| `@gsap/react`                     | Never imported (gsap itself is used, but not the React wrapper)   |
| `@supabase/supabase-js`           | Only used in deleted `server/supabaseStorage.ts`                  |
| `next-themes`                     | Only used in `sonner.tsx` wrapper (replaced with hardcoded theme) |
| `streamdown`                      | Only used in deleted `AIChatBox.tsx`                              |
| `cmdk`                            | Only used in deleted `ui/command.tsx`                             |
| `input-otp`                       | Only used in deleted `ui/input-otp.tsx`                           |
| `vaul`                            | Only used in deleted `ui/drawer.tsx`                              |
| `react-resizable-panels`          | Only used in deleted `ui/resizable.tsx`                           |
| `react-hook-form`                 | Only used in deleted `ui/form.tsx`                                |
| `embla-carousel-autoplay`         | Never imported (manual setInterval used instead)                  |
| `tailwindcss-animate`             | Never imported (project uses `tw-animate-css`)                    |
| `@radix-ui/react-alert-dialog`    | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-aspect-ratio`    | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-collapsible`     | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-context-menu`    | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-hover-card`      | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-menubar`         | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-navigation-menu` | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-popover`         | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-progress`        | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-radio-group`     | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-scroll-area`     | Only used in deleted components                                   |
| `@radix-ui/react-slider`          | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-switch`          | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-toggle`          | Only used in deleted UI wrapper                                   |
| `@radix-ui/react-toggle-group`    | Only used in deleted UI wrapper                                   |

### Dev Dependencies Removed (7)

| Package                            | Reason                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| `@types/google.maps`               | No Google Maps types referenced in source              |
| `@types/sharp`                     | Deprecated package (sharp has built-in types)          |
| `@typescript-eslint/eslint-plugin` | Redundant with `typescript-eslint` flat config         |
| `@typescript-eslint/parser`        | Redundant with `typescript-eslint` flat config         |
| `autoprefixer`                     | Not needed with `@tailwindcss/vite` (Tailwind v4)      |
| `postcss`                          | Not needed with `@tailwindcss/vite` (Tailwind v4)      |
| `pnpm`                             | Redundant as devDep (it is the package manager itself) |

### Dependencies Kept (with rationale)

| Package                          | Reason to keep                                               |
| -------------------------------- | ------------------------------------------------------------ |
| `openai`                         | Used by `server/_core/sdk.ts` (Manus framework, DO NOT EDIT) |
| `axios`                          | Used by `server/_core/sdk.ts` (Manus framework, DO NOT EDIT) |
| `gsap`                           | Used by `useScrollReveal.ts` and `Hero.tsx`                  |
| `framer-motion`                  | Used in `App.tsx` for route transitions                      |
| `@sentry/node` + `@sentry/react` | Used in `main.tsx`, `ErrorBoundary.tsx`, `sentry.ts`         |

---

## 2. Dead Code Files Removed

### Root-Level Stale Files

| Path                                        | Lines  | Reason                                            |
| ------------------------------------------- | ------ | ------------------------------------------------- |
| `components/` (entire directory, 95+ files) | ~5,677 | Root-level copy never imported by any source file |
| `Footer.tsx` (root)                         | ~200   | Root-level copy never imported                    |
| `server/supabaseStorage.ts`                 | 42     | Never imported by any file                        |
| `scripts/optimize-images.py`                | 151    | Duplicate of TS version (package.json uses `.ts`) |

### Unused Client Components

| Path                                            | Lines | Reason                                                    |
| ----------------------------------------------- | ----- | --------------------------------------------------------- |
| `client/src/components/AIChatBox.tsx`           | 249   | Never imported                                            |
| `client/src/components/AIConcierge.tsx`         | 137   | Never imported                                            |
| `client/src/components/ManusDialog.tsx`         | 91    | Never imported                                            |
| `client/src/components/Map.tsx`                 | 148   | Never imported                                            |
| `client/src/components/WhatsAppButton.tsx`      | 30    | Never imported (separate from FloatingActionButtons)      |
| `client/src/components/TripCostEstimator.tsx`   | 277   | Never imported (CostCalculator.tsx is the active version) |
| `client/src/components/TravelChecklist.tsx`     | 196   | Never imported                                            |
| `client/src/components/SocialProofBar.tsx`      | 116   | Never imported                                            |
| `client/src/components/RecentlyBookedPopup.tsx` | 91    | Never imported                                            |
| `client/src/components/WhatsAppPrompt.tsx`      | 85    | Never imported                                            |
| `client/src/components/SectionBanner.tsx`       | 22    | Never imported                                            |
| `client/src/components/AnnouncementBar.tsx`     | 63    | Never imported                                            |
| `client/src/components/StatsCounter.tsx`        | 138   | Never imported                                            |
| `client/src/components/NewsletterCTA.tsx`       | 69    | Never imported                                            |

### Unused UI Wrapper Components (31 files)

All in `client/src/components/ui/`:

alert-dialog, aspect-ratio, breadcrumb, button-group, chart, collapsible,
command, context-menu, drawer, empty, field, form, hover-card, input-group,
input-otp, item, kbd, menubar, navigation-menu, pagination, popover,
progress, radio-group, resizable, scroll-area, slider, spinner, switch,
table, toggle, toggle-group

**Total: ~3,634 lines**

---

## 3. Code Modifications

| File                                  | Change                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `client/src/components/ui/sonner.tsx` | Removed `next-themes` import, hardcoded `theme="light"`                   |
| `eslint.config.js`                    | Removed `"Footer.tsx"` and `"components/**"` from ignores (files deleted) |

---

## 4. Impact Summary

| Metric                  | Before          | After | Saved         |
| ----------------------- | --------------- | ----- | ------------- |
| Production dependencies | 50              | 24    | 26 packages   |
| Dev dependencies        | 21              | 14    | 7 packages    |
| Dead component files    | 45+             | 0     | ~10,000 lines |
| Root-level stale dirs   | 1 (components/) | 0     | ~5,677 lines  |
| Tests passing           | 157             | 157   | No regression |
| TypeScript errors       | 0               | 0     | No regression |
| Build time              | ~5.5s           | ~5.2s | Faster        |

---

## 5. Remaining Notes

- `openai` and `axios` are kept because they are used by `server/_core/` (Manus framework internals that must not be edited)
- The `components/` eslint ignore entries for `pages/**`, `hooks/**`, `contexts/**`, `lib/**` remain in case those root-level copies resurface
- Seed scripts (`seed-blog-articles.ts`, `seed-tours.ts`, `seed-packages.ts`) are CLI tools, not library imports -- they are intentionally standalone
- Console.log statements in server code are intentional logging for production observability (booking notifications, seed scripts, scheduler)
