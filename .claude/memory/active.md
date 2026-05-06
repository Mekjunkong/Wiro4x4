# Active Memory

## Current Focus

2026-05-06: Ran the Wiro4x4 Impeccable-style critique, polish, and bolder pass across public pages and shared UI surfaces.

## Just Completed

- Loaded PRODUCT.md and DESIGN.md brand context.
- Ran `npx impeccable detect client/src` and fixed all detected anti-patterns.
- Replaced pure-black overlay utilities with warm `primary` overlays across public and shared UI components.
- Removed side-tab card accents and gradient-text utilities flagged by Impeccable.
- Replaced bounce typing animation with pulse motion.
- Verified homepage and gallery in browser at local dev server.
- Verification passed: `npx impeccable detect client/src`, `pnpm check`, `pnpm lint`, `pnpm build`, `pnpm test`.

## In Progress

- Working tree has many uncommitted changes, including pre-existing auth/session and CI changes that were already present before this polish pass. Do not commit/push blindly without separating or reviewing scope.

## Next Steps

- If shipping, review `git diff` by area and commit in separated logical commits: design/polish, auth/session, CI/config.
- Optionally run Playwright E2E before deployment if changing public route layouts again.
