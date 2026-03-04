# Multi-Day Tour Packages — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multi-day curated packages and a pick-and-mix custom tour builder with percentage-based discounts, flowing into the existing booking form.

**Architecture:** New `tourPackages` table stores curated packages with JSON tour slug arrays. Shared pricing gets a `calculatePackageDiscount()` function using tiered percentages. A new `package` tRPC router handles CRUD. Frontend adds `/packages` (listing + builder) and `/packages/:slug` (detail) pages, plus an admin Packages tab.

**Tech Stack:** React 19 + TypeScript + Tailwind 4 + Wouter + tRPC 11 + Drizzle ORM (MySQL) + Vitest + Zod 4

---

## Task 1: Add `PACKAGE_DISCOUNTS` constant and `calculatePackageDiscount()` to pricing

**Files:**

- Modify: `shared/pricing.ts` (add constant + function after line 98)
- Test: `server/pricing.test.ts` (add test block)

**Step 1: Write the failing tests**

Add to the bottom of `server/pricing.test.ts`:

```typescript
describe("calculatePackageDiscount", () => {
  it("returns 10% discount for 2 tours", () => {
    const result = calculatePackageDiscount(2, 8000);
    expect(result.discountPercent).toBe(10);
    expect(result.discountedPrice).toBe(7200);
    expect(result.savings).toBe(800);
  });

  it("returns 15% discount for 3 tours", () => {
    const result = calculatePackageDiscount(3, 12000);
    expect(result.discountPercent).toBe(15);
    expect(result.discountedPrice).toBe(10200);
    expect(result.savings).toBe(1800);
  });

  it("returns 25% discount for 5 tours", () => {
    const result = calculatePackageDiscount(5, 20000);
    expect(result.discountPercent).toBe(25);
    expect(result.discountedPrice).toBe(15000);
    expect(result.savings).toBe(5000);
  });

  it("uses override percent when provided", () => {
    const result = calculatePackageDiscount(2, 8000, 30);
    expect(result.discountPercent).toBe(30);
    expect(result.discountedPrice).toBe(5600);
    expect(result.savings).toBe(2400);
  });

  it("returns no discount for 1 tour", () => {
    const result = calculatePackageDiscount(1, 4000);
    expect(result.discountPercent).toBe(0);
    expect(result.discountedPrice).toBe(4000);
    expect(result.savings).toBe(0);
  });
});
```

Also add `calculatePackageDiscount, PACKAGE_DISCOUNTS` to the import line at the top of the file.

**Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/pricing.test.ts`
Expected: FAIL — `calculatePackageDiscount` is not exported

**Step 3: Write the implementation**

In `shared/pricing.ts`, after the `MULTI_DAY_PACKAGES` constant (line 98), add:

```typescript
export const PACKAGE_DISCOUNTS: Record<number, number> = {
  2: 0.1,
  3: 0.15,
  4: 0.2,
  5: 0.25,
};

/**
 * Calculate the discounted price for a package of N tours.
 * Uses tiered percentage discounts (or an admin override).
 */
export function calculatePackageDiscount(
  tourCount: number,
  tourTotal: number,
  overridePercent?: number
): { discountedPrice: number; savings: number; discountPercent: number } {
  const decimalDiscount =
    overridePercent != null
      ? overridePercent / 100
      : (PACKAGE_DISCOUNTS[tourCount] ?? 0);
  const discountPercent = Math.round(decimalDiscount * 100);
  const savings = Math.round(tourTotal * decimalDiscount);
  const discountedPrice = tourTotal - savings;
  return { discountedPrice, savings, discountPercent };
}
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/pricing.test.ts`
Expected: ALL PASS (existing 31 + 5 new = 36 tests)

**Step 5: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add shared/pricing.ts server/pricing.test.ts
git commit -m "feat: add PACKAGE_DISCOUNTS constant and calculatePackageDiscount function"
```

---

## Task 2: Add `tourPackageInputSchema` to shared schemas

**Files:**

- Modify: `shared/schemas.ts` (add schema + type export after `blogPostInputSchema`, ~line 142)

**Step 1: Add the schema**

In `shared/schemas.ts`, after `blogPostInputSchema` (line 142), add:

```typescript
export const tourPackageInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  nameHe: z.string().min(1, "Hebrew name is required").max(255),
  slug: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  tourSlugs: z
    .array(z.string().min(1))
    .min(2, "At least 2 tours required")
    .max(5, "Maximum 5 tours"),
  discountPercent: z.number().min(0).max(50).nullable().optional(),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),
});
```

Also add to the type exports section at the bottom:

```typescript
export type TourPackageInput = z.infer<typeof tourPackageInputSchema>;
```

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add shared/schemas.ts
git commit -m "feat: add tourPackageInputSchema to shared schemas"
```

---

## Task 3: Add `tourPackages` table to Drizzle schema

**Files:**

- Modify: `drizzle/schema.ts` (add table after `tours` definition, ~line 319)

**Step 1: Add the table definition**

In `drizzle/schema.ts`, after line 319 (`export type InsertTour = typeof tours.$inferInsert;`), add:

```typescript
// Tour Packages Table
export const tourPackages = mysqlTable("tourPackages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameHe: varchar("nameHe", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionHe: text("descriptionHe"),
  tourSlugs: text("tourSlugs").notNull(), // JSON array of tour slugs
  discountPercent: int("discountPercent"), // Override (null = use default tier)
  coverImage: text("coverImage"),
  isPublished: int("isPublished").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TourPackage = typeof tourPackages.$inferSelect;
export type InsertTourPackage = typeof tourPackages.$inferInsert;
```

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add drizzle/schema.ts
git commit -m "feat: add tourPackages table to Drizzle schema"
```

**Note:** Run `pnpm db:push` on Manus to apply migration (or after deploying).

---

## Task 4: Create `server/db/packages.ts` DB helpers

**Files:**

- Create: `server/db/packages.ts`
- Modify: `server/db/index.ts` (add barrel export)

**Step 1: Create the DB helper file**

Create `server/db/packages.ts`:

```typescript
import { eq, sql, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { tourPackages, InsertTourPackage } from "../../drizzle/schema";

export async function createTourPackage(pkg: InsertTourPackage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tourPackages).values(pkg);
}

export async function getPublishedTourPackages() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourPackages)
    .where(eq(tourPackages.isPublished, 1))
    .orderBy(desc(tourPackages.createdAt));
}

export async function getAllTourPackages() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourPackages)
    .orderBy(desc(tourPackages.createdAt));
}

export async function getTourPackageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tourPackages)
    .where(eq(tourPackages.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTourPackage(
  id: number,
  data: Partial<InsertTourPackage>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tourPackages).set(data).where(eq(tourPackages.id, id));
}

export async function deleteTourPackage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tourPackages).where(eq(tourPackages.id, id));
}
```

**Step 2: Add barrel export to `server/db/index.ts`**

After the Tours export block (~line 117), add:

```typescript
// Tour Packages
export {
  createTourPackage,
  getPublishedTourPackages,
  getAllTourPackages,
  getTourPackageBySlug,
  updateTourPackage,
  deleteTourPackage,
} from "./packages";
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add server/db/packages.ts server/db/index.ts
git commit -m "feat: add tour package DB helpers with barrel export"
```

---

## Task 5: Create `server/routes/package.ts` tRPC router

**Files:**

- Create: `server/routes/package.ts`
- Modify: `server/routers.ts` (register new router)

**Step 1: Create the package router**

Create `server/routes/package.ts`:

```typescript
import { z } from "zod";
import {
  router,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getPublishedTourPackages,
  getAllTourPackages,
  getTourPackageBySlug,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  getAllActiveTours,
} from "../db";
import { tourPackageInputSchema } from "../../shared/schemas";
import {
  calculatePackageDiscount,
  PACKAGE_DISCOUNTS,
} from "../../shared/pricing";
import type { Tour, TourPackage } from "../../drizzle/schema";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve a package's tourSlugs to full tour objects and calculate pricing. */
function resolvePackage(pkg: TourPackage, toursMap: Map<string, Tour>) {
  const tourSlugs: string[] = JSON.parse(pkg.tourSlugs);
  const resolvedTours = tourSlugs
    .map(slug => toursMap.get(slug))
    .filter((t): t is Tour => t != null);

  const originalPrice = resolvedTours.reduce((sum, t) => sum + t.price, 0);
  const { discountedPrice, savings, discountPercent } =
    calculatePackageDiscount(
      resolvedTours.length,
      originalPrice,
      pkg.discountPercent ?? undefined
    );

  return {
    ...pkg,
    tourSlugs,
    resolvedTours,
    originalPrice,
    discountedPrice,
    savings,
    discountPercent,
  };
}

export const packageRouter = router({
  /** Public: list published packages with resolved tour data + pricing */
  list: securePublicProcedure.query(async () => {
    const [packages, tours] = await Promise.all([
      getPublishedTourPackages(),
      getAllActiveTours(),
    ]);
    const toursMap = new Map(tours.map(t => [t.slug, t]));
    return packages.map(pkg => resolvePackage(pkg, toursMap));
  }),

  /** Public: single package by slug */
  getBySlug: securePublicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const pkg = await getTourPackageBySlug(input.slug);
      if (!pkg) return undefined;

      const tours = await getAllActiveTours();
      const toursMap = new Map(tours.map(t => [t.slug, t]));
      return resolvePackage(pkg, toursMap);
    }),

  /** Admin: list all packages including unpublished */
  listAll: secureProtectedProcedure.query(async () => {
    const [packages, tours] = await Promise.all([
      getAllTourPackages(),
      getAllActiveTours(),
    ]);
    const toursMap = new Map(tours.map(t => [t.slug, t]));
    return packages.map(pkg => resolvePackage(pkg, toursMap));
  }),

  /** Admin: create a package */
  create: secureProtectedProcedure
    .input(tourPackageInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const slug = input.slug || generateSlug(input.name);
      await createTourPackage({
        name: input.name,
        nameHe: input.nameHe,
        slug,
        description: input.description ?? null,
        descriptionHe: input.descriptionHe ?? null,
        tourSlugs: JSON.stringify(input.tourSlugs),
        discountPercent: input.discountPercent ?? null,
        coverImage: input.coverImage ?? null,
        isPublished: input.isPublished ? 1 : 0,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "tourPackage",
        newValue: JSON.stringify({ name: input.name }),
      });
      return { success: true, message: "Package created successfully" };
    }),

  /** Admin: update a package */
  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: tourPackageInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData: Record<string, unknown> = {};
      const fields = [
        "name",
        "nameHe",
        "slug",
        "description",
        "descriptionHe",
        "coverImage",
      ] as const;
      for (const field of fields) {
        if (input.data[field] !== undefined)
          updateData[field] = input.data[field];
      }
      if (input.data.tourSlugs !== undefined)
        updateData.tourSlugs = JSON.stringify(input.data.tourSlugs);
      if (input.data.discountPercent !== undefined)
        updateData.discountPercent = input.data.discountPercent;
      if (input.data.isPublished !== undefined)
        updateData.isPublished = input.data.isPublished ? 1 : 0;

      await updateTourPackage(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourPackage",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  /** Admin: delete a package */
  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTourPackage(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "tourPackage",
        resourceId: input.id,
      });
      return { success: true };
    }),
});
```

**Step 2: Register in `server/routers.ts`**

Add import after the existing imports (~line 24, after `analyticsRouter`):

```typescript
import { packageRouter } from "./routes/package";
```

Add to the `router({})` call:

```typescript
package: packageRouter,
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add server/routes/package.ts server/routers.ts
git commit -m "feat: add package tRPC router with CRUD + tour resolution"
```

---

## Task 6: Write package API tests

**Files:**

- Create: `server/package.test.ts`

**Step 1: Write the test file**

Create `server/package.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("package.list (public)", () => {
  it("returns published packages", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("package.getBySlug (public)", () => {
  it("returns undefined for non-existent slug", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.getBySlug({
      slug: "non-existent-package",
    });

    expect(result).toBeUndefined();
  });
});

describe("package.create", () => {
  itWithDb("creates a tour package", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.create({
      name: "Weekend Adventure",
      nameHe: "הרפתקת סוף שבוע",
      tourSlugs: [
        "doi-inthanon-roof-of-thailand",
        "mae-kampong-hidden-village",
      ],
      isPublished: true,
    });

    expect(result).toEqual({
      success: true,
      message: "Package created successfully",
    });
  });
});

describe("package.listAll (admin)", () => {
  it("returns all packages including unpublished", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.listAll();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("package.update", () => {
  itWithDb("updates a tour package", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create first
    await caller.package.create({
      name: "Temp Package",
      nameHe: "חבילה זמנית",
      tourSlugs: [
        "doi-inthanon-roof-of-thailand",
        "mae-kampong-hidden-village",
      ],
    });

    // Get the list to find our package
    const packages = await caller.package.listAll();
    const pkg = packages.find(p => p.name === "Temp Package");
    if (!pkg) throw new Error("Package not found");

    const result = await caller.package.update({
      id: pkg.id,
      data: { name: "Updated Package" },
    });

    expect(result).toEqual({ success: true });
  });
});

describe("package.delete", () => {
  itWithDb("deletes a tour package", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create first
    await caller.package.create({
      name: "To Delete",
      nameHe: "למחיקה",
      slug: `to-delete-${Date.now()}`,
      tourSlugs: ["doi-inthanon-roof-of-thailand", "maerim-sticky-waterfalls"],
    });

    const packages = await caller.package.listAll();
    const pkg = packages.find(p => p.name === "To Delete");
    if (!pkg) throw new Error("Package not found");

    const result = await caller.package.delete({ id: pkg.id });

    expect(result).toEqual({ success: true });
  });
});
```

**Step 2: Run tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/package.test.ts`
Expected: 2 pass (public list + getBySlug), 4 skip (DB-dependent) — all green locally

**Step 3: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests still pass + new tests pass/skip

**Step 4: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add server/package.test.ts
git commit -m "test: add package router tests (list, getBySlug, create, update, delete)"
```

---

## Task 7: Create `/packages` page (listing + build your own)

**Files:**

- Create: `client/src/pages/Packages.tsx`
- Modify: `client/src/App.tsx` (add route + lazy import)

**Step 1: Create the Packages page**

Create `client/src/pages/Packages.tsx`. This page has two sections:

1. **Curated Packages** — cards from `trpc.package.list()`
2. **Build Your Own** — tour cards with checkboxes from `trpc.tour.list()`, live sidebar

Key implementation details:

- Uses `useLanguage()` + `t()` for bilingual
- Uses `usePageMeta()` for SEO
- Tour selection: checkbox cards, min 2 max 5
- Sidebar shows selected tours, discount tier from `calculatePackageDiscount()`, total price
- "Book This Package" CTA links to `/book?tours=slug1,slug2,slug3`
- Curated package cards link to `/packages/:slug`
- Import `calculatePackageDiscount` from `../../shared/pricing` for client-side calculation

```typescript
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { trpc } from "../lib/trpc";
import { Link } from "wouter";
import { calculatePackageDiscount, formatTHB } from "../../shared/pricing";
import Header from "../components/Header";
import Footer from "../components/Footer";
```

The full page component should include:

- Hero section with title "Tour Packages" / "חבילות סיור"
- Tabbed interface: "Curated Packages" | "Build Your Own"
- Curated tab: cards with cover image, name, day count, price with savings badge, CTA
- Build Your Own tab: tour cards grid with checkboxes + sticky sidebar with live pricing
- `usePageMeta({ title: "Tour Packages | WIRO 4x4", description: "...", canonicalPath: "/packages" })`

**Step 2: Add route to App.tsx**

Add lazy import after existing imports (~line 31):

```typescript
const Packages = React.lazy(() => import("./pages/Packages"));
const PackageDetail = React.lazy(() => import("./pages/PackageDetail"));
```

Add routes inside `<Switch>` after the `/estimate` route (line 79):

```typescript
<Route path={"/packages"} component={Packages} />
<Route path={"/packages/:slug"} component={PackageDetail} />
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors (PackageDetail doesn't exist yet but lazy import won't fail at typecheck)

**Step 4: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add client/src/pages/Packages.tsx client/src/App.tsx
git commit -m "feat: add /packages page with curated listing and build-your-own builder"
```

---

## Task 8: Create `/packages/:slug` detail page

**Files:**

- Create: `client/src/pages/PackageDetail.tsx`

**Step 1: Create the PackageDetail page**

Create `client/src/pages/PackageDetail.tsx`:

Key features:

- Fetches package by slug via `trpc.package.getBySlug()`
- Hero section with cover image
- Day-by-day itinerary from resolved tour data (each tour = 1 day)
- Per-tour card with highlights, description snippet, image
- Price breakdown: original price (strikethrough) → discounted price + savings badge
- "Book This Package" CTA → `/book?tours=slug1,slug2,slug3`
- 404 handling if package not found
- `usePageMeta()` with package name as title
- JSON-LD structured data (TouristTrip schema)

```typescript
import { useLanguage } from "../contexts/LanguageContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { trpc } from "../lib/trpc";
import { useParams } from "wouter";
import { formatTHB } from "../../shared/pricing";
import Header from "../components/Header";
import Footer from "../components/Footer";
```

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add client/src/pages/PackageDetail.tsx
git commit -m "feat: add /packages/:slug detail page with itinerary and pricing"
```

---

## Task 9: Add Packages tab to AdminDashboard

**Files:**

- Modify: `client/src/pages/AdminDashboard.tsx` (add Packages tab)

**Step 1: Add the Packages admin tab**

In `AdminDashboard.tsx`, add a new tab for Packages. Follow the same pattern as the Tours tab:

- Tab label: "Packages" (add to tab list)
- Tab content: PackagesTab component (inline or extracted)
- Features:
  - List all packages via `trpc.package.listAll()`
  - Create form: name (EN/HE), description (EN/HE), multi-select tour picker, discount override, cover image URL, publish toggle
  - Tour picker: list all tours from `trpc.tour.listAll()`, checkboxes, reorderable (drag or up/down buttons)
  - Live price preview using `calculatePackageDiscount()` from shared/pricing
  - Edit/delete/publish toggle actions
  - Toast notifications on success/error

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Run dev server and test visually**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`
Navigate to `/admin` → Packages tab → verify form and list render

**Step 4: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add client/src/pages/AdminDashboard.tsx
git commit -m "feat: add Packages tab to admin dashboard with CRUD"
```

---

## Task 10: Add booking form integration (query params)

**Files:**

- Modify: `client/src/pages/BookingForm.tsx` (read `?tours=` query param)

**Step 1: Update BookingForm to read tour query params**

In `BookingForm.tsx`, near the top of the component:

```typescript
// Read pre-selected tours from URL query params (?tours=slug1,slug2,slug3)
const searchParams = new URLSearchParams(window.location.search);
const preSelectedTours = searchParams.get("tours");
```

If `preSelectedTours` is set, pre-fill the `suggestedDestinations` field with the tour names (resolved from slugs via `trpc.tour.list()`). This is a lightweight integration — the booking form already has a `suggestedDestinations` text field.

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add client/src/pages/BookingForm.tsx
git commit -m "feat: pre-fill booking form from ?tours= query param"
```

---

## Task 11: Add packages to sitemap + navigation

**Files:**

- Modify: `server/routes/sitemap.ts` (add package URLs)
- Modify: `client/src/components/Header.tsx` (add Packages nav link)

**Step 1: Update sitemap**

In `server/routes/sitemap.ts`:

1. Add `/packages` to `STATIC_PAGES`:

```typescript
{ path: "/packages", priority: "0.9", changefreq: "weekly" },
```

2. Import `getPublishedTourPackages` from `../db`

3. In `registerSitemapRoute`, fetch packages and add their URLs:

```typescript
const packages = await getPublishedTourPackages();
```

4. Update `generateSitemap` signature to accept packages and generate URLs like:

```typescript
const packageUrls = packages
  .map(
    p => `  <url>
    <loc>${escapeXml(siteUrl)}/packages/${escapeXml(p.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n");
```

**Step 2: Add navigation link in Header**

In `client/src/components/Header.tsx`, add a "Packages" link in the navigation menu, linking to `/packages`.

**Step 3: Run type check + tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm test`
Expected: All pass

**Step 4: Commit**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add server/routes/sitemap.ts client/src/components/Header.tsx
git commit -m "feat: add packages to sitemap and header navigation"
```

---

## Task 12: Final verification

**Step 1: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests pass + ~11 new tests (5 pricing + 6 package router)

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Run dev server and verify**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`
Test manually:

- `/packages` — curated packages list + build your own tab
- `/packages/:slug` — detail page with itinerary
- `/admin` → Packages tab — CRUD operations
- `/book?tours=slug1,slug2` — pre-filled booking form
- `/sitemap.xml` — includes package URLs

**Step 4: Final commit if any fixes needed**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4
git add -A
git commit -m "chore: final verification and fixes for multi-day packages"
```

---

## Summary

| Task      | Description                                        | New Tests         |
| --------- | -------------------------------------------------- | ----------------- |
| 1         | `PACKAGE_DISCOUNTS` + `calculatePackageDiscount()` | 5                 |
| 2         | `tourPackageInputSchema` in shared schemas         | 0                 |
| 3         | `tourPackages` table in Drizzle schema             | 0                 |
| 4         | DB helpers (`server/db/packages.ts`)               | 0                 |
| 5         | tRPC router (`server/routes/package.ts`)           | 0                 |
| 6         | Package API tests                                  | 6                 |
| 7         | `/packages` page (listing + builder)               | 0                 |
| 8         | `/packages/:slug` detail page                      | 0                 |
| 9         | Admin Packages tab                                 | 0                 |
| 10        | Booking form query param integration               | 0                 |
| 11        | Sitemap + navigation                               | 0                 |
| 12        | Final verification                                 | 0                 |
| **Total** |                                                    | **~11 new tests** |
