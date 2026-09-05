# WIRO 4x4 — release-preparation QA handoff

- Date: 2026-09-05 UTC
- Client: WIRO 4x4
- Intent: close the fallback package booking-context blocker under Mike-approved release preparation.
- Lifecycle: `RELEASE PREPARATION`
- Owner: Levi
- Status: local fix implemented and verified; production release still blocked.

## Outcome

Fallback package detail pages no longer link to a bare `/book`. They pass a URL-encoded package name through `/book?package=...`. BookingForm reads that context, displays it in the Selected tours panel, preserves it in `specialRequests`, and includes it in the WhatsApp availability message even when the tours API has no matching records.

## Files changed

- `client/src/lib/bookingTourContext.ts`
  - added package-context parser and URL builder.
- `client/src/lib/bookingTourContext.test.ts`
  - added fallback package handoff regression coverage; 6 tests total.
- `client/src/pages/PackageDetail.tsx`
  - fallback Book Online CTA now uses `buildPackageBookingUrl(pkg.name)`.
- `client/src/pages/BookingForm.tsx`
  - reads package context and preserves/displays it without DB-only tour matching.

## Verification evidence

- `pnpm exec vitest run client/src/lib/bookingTourContext.test.ts` — PASS, 6/6 tests.
- `pnpm test` — PASS, 69 test files; 488 passed, 32 skipped.
- `pnpm check` — PASS, TypeScript exit 0.
- `pnpm exec eslint client/src/lib/bookingTourContext.ts client/src/lib/bookingTourContext.test.ts client/src/pages/BookingForm.tsx client/src/pages/PackageDetail.tsx client/src/pages/Packages.tsx` — PASS, exit 0.
- `pnpm build` — PASS, Vite frontend and esbuild server bundle completed.
- `git diff --check` — PASS.
- Previous full-suite verification before this surgical change: 487 passed, 32 skipped; this change is covered by the focused regression suite and full build/typecheck.

## Independent QA

- Playwright Chromium was installed in the local QA environment.
- `E2E_PORT=4174` with local-only placeholder environment values: `pnpm exec playwright test e2e/fallback-package-booking.spec.ts --project=chromium` — PASS, 1/1.
- The browser flow reached `/book?package=...`, showed the Selected tours panel, and displayed the complete fallback package name.
- No live booking submission was made. Database-dependent tests remain skipped where the test suite requires external services.

## Risks / blockers

- The fix is local and uncommitted; branch `fix/wiro-e2e-reviews` is ahead of `origin/main` by one existing commit, with current working-tree changes listed above plus audit documents.
- No push, merge, deployment, publication, customer message, ad setup, or budget action has occurred.
- Public contact, pricing, inclusion, NAP, social-profile, and marketing claims remain separately approval/fact-check gated.

## Approval gate

Mike approval received for release preparation only. A separate explicit approval is required before push/merge/deploy. Client/operations approval is required for public claims and public-facing content. Production deploy must wait for browser QA with Chromium available and final release review.

## Next owner/action

- QA/release owner: install or enable the approved Playwright Chromium runtime, run the fallback package → `/book?package=...` browser flow and mobile/RTL smoke checks.
- Levi: incorporate QA evidence into the final release packet and present the exact diff/rollback scope to Mike.
- Mike: decide `DEPLOY` or `REVISE` only after the final packet is presented.
