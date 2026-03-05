# Accessibility Audit Report

**Date:** 2026-03-05
**Standard:** WCAG 2.1 AA
**Auditor:** Claude Code (automated code review)

---

## Summary

Manual code review of all public-facing components for WCAG 2.1 AA compliance.
Automated tools (axe-core/Lighthouse) were not run against the live site due to environment constraints; this audit was performed via source code analysis.

---

## Issues Found and Fixed

### Critical (Fixed)

| #   | Issue                                                             | Component              | Fix Applied                                                                  |
| --- | ----------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| 1   | **Viewport `maximum-scale=1` prevents user zooming** (WCAG 1.4.4) | `client/index.html`    | Removed `maximum-scale=1` from viewport meta tag                             |
| 2   | **Form inputs missing label associations** (`htmlFor`/`id`)       | `QuickInquiryForm.tsx` | Added `htmlFor` on all `<label>` elements and matching `id` on inputs        |
| 3   | **Form inputs missing label associations**                        | `Reviews.tsx`          | Added `htmlFor`/`id` pairs for name, email, tour type, review text fields    |
| 4   | **Blog "Read More" links lack descriptive context** (WCAG 2.4.4)  | `Blog.tsx`             | Added `aria-label` with post title to each "Read More" link                  |
| 5   | **Language switcher missing `aria-label`** (WCAG 1.1.1)           | `LanguageSwitcher.tsx` | Added `aria-label` describing the action                                     |
| 6   | **Gallery photo items not keyboard accessible** (WCAG 2.1.1)      | `Gallery.tsx`          | Added `role="button"`, `tabIndex={0}`, `onKeyDown` handler, and `aria-label` |
| 7   | **Gallery lightbox close button missing `aria-label`**            | `Gallery.tsx`          | Added `aria-label="Close lightbox"`                                          |
| 8   | **Navigation `<nav>` elements missing `aria-label`** (WCAG 1.3.1) | `Header.tsx`           | Added `aria-label="Main navigation"` and `aria-label="Mobile navigation"`    |
| 9   | **Blog search input missing accessible label**                    | `Blog.tsx`             | Added `aria-label="Search blog articles"`                                    |
| 10  | **Reviews sort select missing accessible label**                  | `Reviews.tsx`          | Added `aria-label="Sort reviews"`                                            |
| 11  | **Form error messages not announced to screen readers**           | `QuickInquiryForm.tsx` | Added `role="alert"` on error message elements                               |

### Previously Compliant (No Changes Needed)

| Feature                                                             | Status | Notes                                                                   |
| ------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Skip-to-main-content link                                           | PASS   | Present in `App.tsx`, bilingual, sr-only with focus visibility          |
| Mobile menu toggle `aria-expanded`                                  | PASS   | Correctly toggles in `Header.tsx`                                       |
| Mobile menu toggle `aria-label`                                     | PASS   | Present with bilingual text                                             |
| Admin tab panel `role="tablist"` / `role="tab"` / `role="tabpanel"` | PASS   | Full ARIA tabs pattern in `AdminDashboard.tsx`                          |
| Admin tab keyboard navigation (Arrow keys, Home, End)               | PASS   | Implemented in `handleTabKeyDown`                                       |
| Floating action buttons `aria-label`                                | PASS   | All buttons have descriptive labels                                     |
| Floating action buttons `aria-expanded`                             | PASS   | Collapsible FAB correctly announces state                               |
| Star rating `role="radiogroup"`                                     | PASS   | Interactive star rating uses proper ARIA                                |
| Star rating `aria-checked`                                          | PASS   | Each star has `role="radio"` with `aria-checked`                        |
| Filter buttons `aria-pressed`                                       | PASS   | Tour difficulty/duration filters use `aria-pressed`                     |
| Image alt text                                                      | PASS   | All `<img>` and `OptimizedImage` components have `alt` attributes       |
| Focus indicators                                                    | PASS   | `focus-visible:ring-2` applied consistently across interactive elements |
| Touch target sizes                                                  | PASS   | Mobile buttons use `min-width: 48px` / `min-height: 48px`               |
| `aria-current="page"` on active nav links                           | PASS   | Present in Header desktop nav                                           |
| Decorative elements `aria-hidden`                                   | PASS   | Dividers and decorative icons marked correctly                          |
| Form validation `aria-required` / `aria-invalid`                    | PASS   | QuickInquiryForm uses both attributes                                   |
| Color contrast on primary text                                      | PASS   | Dark charcoal (#1C1C1C) on ivory (#FAF7F2) exceeds 4.5:1                |

### Remaining Concerns (Not Fixed -- Low Priority)

| #   | Issue                                                                     | Severity | Notes                                                                                     |
| --- | ------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| 1   | Gold accent (#D4AF37) on white background may not meet 3:1 for large text | Low      | Used primarily on dark backgrounds or as decorative; functional text uses darker variants |
| 2   | Mobile menu lacks focus trap                                              | Low      | Users can tab outside the open mobile menu; mitigated by close-on-outside-click           |
| 3   | Gallery lightbox lacks focus trap                                         | Low      | Standard Dialog component from Radix UI handles most focus management                     |
| 4   | `html lang` attribute is static "en" even when Hebrew is selected         | Low      | Would require server-side rendering or JS-based `document.documentElement.lang` update    |

---

## Loading States Added

All data-fetching components now show skeleton loading screens:

| Component      | Skeleton Type                                                                   | File                                            |
| -------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| `Tours.tsx`    | `TourCardSkeleton` (6 cards in 3-col grid)                                      | `client/src/components/SkeletonLoader.tsx`      |
| `Blog.tsx`     | `BlogCardSkeleton` (3 cards in 3-col grid)                                      | `client/src/components/SkeletonLoader.tsx`      |
| `Reviews.tsx`  | `ReviewCardSkeleton` (3 review cards)                                           | `client/src/components/SkeletonLoader.tsx`      |
| `Gallery.tsx`  | `Skeleton` (6 grid items) -- already existed                                    | `client/src/components/ui/skeleton.tsx`         |
| All admin tabs | `TableSkeleton` / `CardGridSkeleton` / `GalleryGridSkeleton` -- already existed | `client/src/components/admin/AdminSkeleton.tsx` |

All skeletons use `animate-pulse` for shimmer effect, match actual content dimensions to prevent layout shift, and include `role="status"` with `aria-label` for screen reader announcements.

---

## Validation

- TypeScript: `npx tsc --noEmit` -- 0 errors
- Tests: `pnpm test` -- 157 passed, 36 skipped (DB-dependent), 0 failures
