# Codebase Improvements Plan (14 Findings)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address all 14 findings from Eli's audit — performance, security, maintainability, testing, docs, and UX improvements.

**Architecture:** Incremental improvements grouped into 6 independent chunks. Each chunk is self-contained and can be committed/deployed independently. No architectural rewrites — focused fixes only.

**Tech Stack:** React 19, TypeScript, Vite, Express 4, Vitest, Playwright, Tailwind CSS 4

---

## Chunk 1: Performance — Bundle Size (Findings #1)

### Task 1.1: Lazy-load Home page

**Files:**

- Modify: `client/src/App.tsx:10` (change eager import to lazy)

- [ ] **Step 1: Change Home import to lazy**

In `client/src/App.tsx`, line 10 currently has:

```typescript
import Home from "./pages/Home";
```

Change to:

```typescript
const Home = React.lazy(() => import("./pages/Home"));
```

- [ ] **Step 2: Move framer-motion to a lazy wrapper**

`framer-motion` is imported at the top of `App.tsx` (line 6) and used only in the `Router` component for page transitions. Create a lightweight wrapper:

Create: `client/src/components/PageTransition.tsx`

```typescript
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export function PageTransition({
  locationKey,
  prefersReducedMotion,
  children,
}: {
  locationKey: string;
  prefersReducedMotion: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: "easeInOut" }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

Then in `App.tsx`, remove the direct `framer-motion` import and lazy-load PageTransition or keep it (since Router is always used). The key win is lazy-loading Home.

- [ ] **Step 3: Add framer-motion and gsap to manual chunks in vite.config.ts**

In `vite.config.ts`, add to `manualChunks`:

```typescript
"animation": ["framer-motion", "gsap"],
```

- [ ] **Step 4: Build and verify bundle sizes**

Run: `pnpm build`
Expected: Main `index.js` chunk should be significantly smaller (under 400 KB)

- [ ] **Step 5: Commit**

```bash
git add client/src/App.tsx client/src/components/PageTransition.tsx vite.config.ts
git commit -m "perf: lazy-load Home page and split animation chunk"
```

---

### Task 1.2: Add Sentry to manual chunks (or remove if unused)

**Files:**

- Modify: `client/src/main.tsx`
- Modify: `vite.config.ts`

- [ ] **Step 1: Check if VITE_SENTRY_DSN is configured**

Sentry is conditionally initialized in `client/src/main.tsx:13-21`. If the DSN env var is set in Vercel, keep it. If not, it's dead code adding to bundle.

- [ ] **Step 2a: If Sentry IS used — add to manual chunks**

In `vite.config.ts` manualChunks:

```typescript
"sentry": ["@sentry/react"],
```

- [ ] **Step 2b: If Sentry is NOT used — remove dependencies**

```bash
pnpm remove @sentry/react @sentry/node
```

Remove the Sentry.init block from `client/src/main.tsx`.

- [ ] **Step 3: Build and verify**

Run: `pnpm build`

- [ ] **Step 4: Commit**

---

## Chunk 2: Performance — Images (Finding #2)

### Task 2.1: Remove oversized original images from public/

**Files:**

- Move: `client/public/images/*.jpg` (originals >1MB) to `assets-source/` (not served)

- [ ] **Step 1: Create assets-source directory and move large originals**

```bash
mkdir -p assets-source/images
find client/public/images -maxdepth 1 -type f -size +1M -exec mv {} assets-source/images/ \;
```

- [ ] **Step 2: Add assets-source to .gitignore**

Append to `.gitignore`:

```
assets-source/
```

- [ ] **Step 3: Verify no components reference the moved files directly**

Run: `grep -rn "client/public/images/" client/src/ --include="*.tsx" --include="*.ts" | grep -v optimized`

Any references to non-optimized originals need updating to `/images/optimized/` versions.

- [ ] **Step 4: Build and test the site loads correctly**

Run: `pnpm build && pnpm test`

- [ ] **Step 5: Commit**

```bash
git add .gitignore client/public/images/
git commit -m "perf: remove oversized original images from public directory"
```

---

## Chunk 3: Security (Finding #4)

### Task 3.1: Add helmet security headers

**Files:**

- Modify: `server/routes.ts` or Express entry point (where Express app is created)

- [ ] **Step 1: Install helmet**

```bash
pnpm add helmet
```

- [ ] **Step 2: Find Express app setup**

Look for `express()` creation — likely in `server/_core/` or a server entry file. Since `_core` is off-limits, add helmet in the closest server setup file we can edit.

Check `server/routers.ts` or the API entry point used by Vercel (`api/index.ts`).

- [ ] **Step 3: Add helmet middleware**

```typescript
import helmet from "helmet";
// Add before routes
app.use(
  helmet({
    contentSecurityPolicy: false, // Start permissive, tighten later
    crossOriginEmbedderPolicy: false, // Allow embedded images
  })
);
```

- [ ] **Step 4: Test the site still works**

Run: `pnpm build && pnpm test`

- [ ] **Step 5: Commit**

```bash
git commit -m "security: add helmet middleware for security headers"
```

---

## Chunk 4: Maintainability (Findings #3, #6, #7, #12, #14)

### Task 4.1: Split TourDetail.tsx — extract enrichment data

**Files:**

- Create: `client/src/data/tourEnrichment.ts`
- Modify: `client/src/pages/TourDetail.tsx`

- [ ] **Step 1: Extract TOUR_ENRICHMENT to separate file**

Find the `TOUR_ENRICHMENT` constant in `TourDetail.tsx` and move it to `client/src/data/tourEnrichment.ts`. Export it.

- [ ] **Step 2: Import in TourDetail.tsx**

Replace the inline constant with:

```typescript
import { TOUR_ENRICHMENT } from "@/data/tourEnrichment";
```

- [ ] **Step 3: Extract sub-components**

Create these files from sections of TourDetail.tsx:

- `client/src/components/tour/TourHero.tsx`
- `client/src/components/tour/TourItinerary.tsx`
- `client/src/components/tour/TourEnrichmentSection.tsx`
- `client/src/components/tour/TourBookingCTA.tsx`

Each component receives props from TourDetail.tsx.

- [ ] **Step 4: Verify build and type check**

Run: `npx tsc --noEmit && pnpm build`

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: split TourDetail.tsx into focused sub-components"
```

### Task 4.2: Fix cancellation policy inconsistency

**Files:**

- Create: `shared/policies.ts`
- Modify: `client/src/pages/TermsOfService.tsx`
- Modify: `client/src/pages/Pricing.tsx`
- Modify: `client/src/components/FAQ.tsx`

- [ ] **Step 1: Create shared policy constants**

Create `shared/policies.ts`:

```typescript
export const CANCELLATION_POLICY = {
  fullRefund: { days: 7, label: "7+ days before" },
  partialRefund: { days: 3, percent: 50, label: "3-6 days before" },
  noRefund: { days: 0, label: "Less than 3 days" },
} as const;
```

- [ ] **Step 2: Update TermsOfService.tsx to use 7-day policy (matching Pricing/FAQ)**

Replace the 48-hour/24-hour text at lines 93-108 with 7-day/3-day text matching the FAQ and Pricing page. Remove the TODO comment at line 81.

- [ ] **Step 3: Verify all three pages show consistent policy**

Manually check: TermsOfService, Pricing, FAQ — all should say 7+ days full, 3-6 days 50%, <3 days no refund.

- [ ] **Step 4: Commit**

```bash
git commit -m "fix: align cancellation policy across all pages (7-day standard)"
```

### Task 4.3: Remove duplicate Estimate V2 page (or consolidate)

**Files:**

- Remove: `client/src/pages/EstimateV2.tsx` (21 lines, just a wrapper)
- Modify: `client/src/App.tsx` (remove `/estimate-v2` route)

- [ ] **Step 1: Check if V2 calculator is more complete than V1**

V2 (`calculator-v2/CostCalculatorRedesigned.tsx`) is 311 lines with 13 sub-components — it's a proper redesign. V1 (`components/CostCalculator.tsx`) is the original.

Decision: Keep both components available but remove the duplicate route. The V2 can be promoted when ready.

- [ ] **Step 2: Remove /estimate-v2 route from App.tsx**

Remove line: `<Route path={"/estimate-v2"} component={EstimateV2} />`
Remove lazy import: `const EstimateV2 = React.lazy(() => import("./pages/EstimateV2"));`

- [ ] **Step 3: Type check and build**

Run: `npx tsc --noEmit && pnpm build`

- [ ] **Step 4: Commit**

```bash
git commit -m "cleanup: remove duplicate /estimate-v2 route"
```

### Task 4.4: Gate background workers in test/serverless environments

**Files:**

- Modify: `server/routers.ts:41-42`

- [ ] **Step 1: Wrap worker startup with environment check**

Change lines 41-42 in `server/routers.ts`:

```typescript
// Before
startSessionChecker();
startReminderScheduler();

// After
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startSessionChecker();
  startReminderScheduler();
}
```

- [ ] **Step 2: Run tests — verify no more noisy output**

Run: `pnpm test 2>&1 | grep -c "SessionChecker\|Reminder Scheduler"`
Expected: 0 (no more noise)

- [ ] **Step 3: Commit**

```bash
git commit -m "fix: skip background workers in test and serverless environments"
```

### Task 4.5: Handle .npmrc

**Files:**

- Modify: `.gitignore` or commit `.npmrc`

- [ ] **Step 1: Review .npmrc contents**

Current contents: `onlyBuiltDependencies="[\"sharp\", \"bcrypt\"]"`
This is safe to commit — no secrets.

- [ ] **Step 2: Add to git**

```bash
git add .npmrc
git commit -m "chore: track .npmrc with build dependency config"
```

---

## Chunk 5: Testing & CI (Findings #8, #9)

### Task 5.1: Add docker-compose for local MySQL

**Files:**

- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: test
      MYSQL_DATABASE: wiro_test
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

- [ ] **Step 2: Add .env.test example**

Create `.env.test.example`:

```
DATABASE_URL=mysql://root:test@localhost:3306/wiro_test
```

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml .env.test.example
git commit -m "chore: add docker-compose for local MySQL testing"
```

### Task 5.2: Add Playwright E2E to CI

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add E2E job to CI**

Add after the existing `ci` job:

```yaml
e2e:
  runs-on: ubuntu-latest
  needs: ci
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - uses: pnpm/action-setup@v4
      with:
        version: 10
    - run: pnpm install --frozen-lockfile
    - run: pnpm exec playwright install --with-deps chromium
    - run: pnpm build
    - run: pnpm test:e2e
      env:
        CI: true
```

- [ ] **Step 2: Verify the test:e2e script exists in package.json**

Check `package.json` has `"test:e2e"` script.

- [ ] **Step 3: Commit**

```bash
git commit -m "ci: add Playwright E2E tests to CI pipeline"
```

---

## Chunk 6: DevOps & Cleanup (Findings #10, #13)

### Task 6.1: Clean up Manus artifacts from Vercel deployment

**Files:**

- Modify: `vite.config.ts`

- [ ] **Step 1: Remove Manus plugin and allowed hosts**

In `vite.config.ts`:

- Remove line 8: `import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";`
- Remove line 16: `vitePluginManusRuntime(),`
- Remove Manus hosts from `allowedHosts` (lines 83-87), keep only:

```typescript
allowedHosts: ["localhost", "127.0.0.1"],
```

- [ ] **Step 2: Check if vite-plugin-manus-runtime can be removed from deps**

```bash
grep -rn "manus-runtime" client/src/ server/ 2>/dev/null
```

If no other references, remove:

```bash
pnpm remove vite-plugin-manus-runtime
```

- [ ] **Step 3: Build and test**

Run: `pnpm build && pnpm test`

- [ ] **Step 4: Commit**

```bash
git commit -m "cleanup: remove Manus-specific plugins and allowed hosts"
```

### Task 6.2: Accessibility — CustomCursor respects reduced-motion

**Files:**

- Modify: `client/src/components/CustomCursor.tsx`

- [ ] **Step 1: Add prefers-reduced-motion check**

Add early return in CustomCursor:

```typescript
useEffect(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    setIsTouch(true); // Reuse isTouch to disable cursor
    return;
  }
  // ... rest of existing code
```

- [ ] **Step 2: Commit**

```bash
git commit -m "a11y: disable custom cursor when prefers-reduced-motion is set"
```

---

## Chunk 7: CLAUDE.md Full Update (Finding #5)

### Task 7.1: Comprehensive CLAUDE.md rewrite

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Update table count**

Change "11 tables" to actual count (21+ tables). List all tables.

- [ ] **Step 2: Update auth system description**

Replace "Manus OAuth (built-in)" references with self-hosted JWT auth (login/register/forgot-password).

- [ ] **Step 3: Update server structure**

`server/db.ts` is now `server/db/` directory with 23 modules. `server/routers.ts` imports 22 domain routers.

- [ ] **Step 4: Update admin panel description**

Admin has more than 6 tabs — update to current count (Bookings, Calendar, Agents, Leads, Financial, Tours, Gallery, Blog, Reviews, CRM, Accounting, Inventory, Packages, Settings, etc.)

- [ ] **Step 5: Remove stale root-level component copy references**

Remove the "Stale Root-Level Copies" section if those files no longer exist.

- [ ] **Step 6: Update test counts throughout**

All test references should say 235 tests, 39 files.

- [ ] **Step 7: Commit**

```bash
git commit -m "docs: comprehensive CLAUDE.md update reflecting current architecture"
```

---

## Execution Order

Independent chunks — can run in parallel:

```
[Chunk 1: Bundle] [Chunk 2: Images] [Chunk 3: Security] [Chunk 4: Maintainability] [Chunk 5: Testing] [Chunk 6: Cleanup]
                                          ↓
                                    [Chunk 7: CLAUDE.md update — after all changes are done]
```

## Validation Gate

After all chunks complete:

```bash
npx tsc --noEmit    # Type check
pnpm test           # All tests pass
pnpm build          # Build succeeds, check bundle sizes
```
