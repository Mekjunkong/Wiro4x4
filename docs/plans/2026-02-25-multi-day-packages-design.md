# Multi-Day Tour Packages & Pick-and-Mix Builder

**Date:** 2026-02-25
**Status:** Approved
**Goal:** New revenue features — multi-day curated packages + custom pick-and-mix tour builder with percentage-based discounts.

## Summary

Add a `/packages` page where customers can browse pre-built multi-day packages OR build their own by selecting 2-5 existing day tours. Pricing uses tiered percentage discounts (2 tours = 10% off, 3 = 15%, 5 = 25%). Selected packages flow into the existing booking form with tours pre-filled.

## Package Builder Page (`/packages`)

Two modes on one page:

1. **Curated packages** — 3+ admin-created combos (2-day, 3-day, 5-day) with hero images, day-by-day itinerary previews, price with savings badge, and "Book This Package" CTA.
2. **Build Your Own** — 6 existing tour cards with checkboxes. Select 2-5 tours, live sidebar shows selected tours, discount tier, and calculated price. "Book This Package" CTA.

### Curated Package Detail (`/packages/:slug`)

- Hero with cover image
- Day-by-day itinerary resolved from tour data (highlights, description, images)
- Price breakdown: original vs discounted with savings badge
- "Book This Package" CTA → `/book?tours=slug1,slug2,slug3`

### Booking Integration

"Book This Package" navigates to `/book` with query params `?tours=slug1,slug2,slug3`. Booking form reads query params and pre-fills `suggestedDestinations`.

## Data Model

### New `tourPackages` table

| Column          | Type                | Purpose                                 |
| --------------- | ------------------- | --------------------------------------- |
| id              | int (PK)            | Auto-increment                          |
| name            | varchar(255)        | English name                            |
| nameHe          | varchar(255)        | Hebrew name                             |
| slug            | varchar(255) unique | URL identifier                          |
| description     | text                | English description                     |
| descriptionHe   | text                | Hebrew description                      |
| tourSlugs       | JSON                | Ordered array of tour slugs             |
| discountPercent | int (nullable)      | Override discount (null = default tier) |
| coverImage      | text                | Hero image URL                          |
| isPublished     | int default 0       | Visibility toggle                       |
| createdAt       | timestamp           | Auto                                    |
| updatedAt       | timestamp           | Auto                                    |

JSON array of tour slugs chosen over join table because: packages are small (2-5 tours), order matters, tour slugs are stable, avoids unnecessary complexity.

### Updates to `shared/pricing.ts`

New constant:

```typescript
export const PACKAGE_DISCOUNTS: Record<number, number> = {
  2: 0.1,
  3: 0.15,
  4: 0.2,
  5: 0.25,
};
```

New function:

```typescript
export function calculatePackageDiscount(
  tourCount: number,
  tourTotal: number,
  overridePercent?: number
): { discountedPrice: number; savings: number; discountPercent: number };
```

Update `findPackageOption()` to use dynamic discount tiers instead of fixed prices from `MULTI_DAY_PACKAGES`.

### Bookings table change

Add nullable `packageId` int column to link bookings to packages (optional).

## Backend API

New tRPC procedures in `server/routers.ts`:

| Procedure           | Type     | Auth   | Purpose                                                        |
| ------------------- | -------- | ------ | -------------------------------------------------------------- |
| `package.list`      | query    | public | Published packages with resolved tour data + calculated prices |
| `package.getBySlug` | query    | public | Single package by slug                                         |
| `package.listAll`   | query    | admin  | All packages including unpublished                             |
| `package.create`    | mutation | admin  | Create package                                                 |
| `package.update`    | mutation | admin  | Edit package                                                   |
| `package.delete`    | mutation | admin  | Remove package                                                 |

New shared schema in `shared/schemas.ts`:

- `tourPackageInputSchema` — name, nameHe, slug, tourSlugs (min 2, max 5 strings), discountPercent (0-50 nullable), coverImage, isPublished

Package resolution: `package.list` and `getBySlug` resolve tourSlugs to full tour objects, calculate `originalPrice`, `discountedPrice`, `savings`.

## Admin Panel

New **Packages tab** in AdminDashboard:

- CRUD form: name (EN/HE), description (EN/HE), multi-select tour picker (reorderable), discount override input, cover image URL, publish toggle
- Live price preview showing discount calculation
- Package list with edit/delete/publish actions

## SEO

- `usePageMeta()` on `/packages` and `/packages/:slug` with appropriate meta tags
- Add package pages to dynamic sitemap (`server/routes/sitemap.ts`)
- JSON-LD structured data for packages

## Testing

- `server/package.test.ts` — CRUD tests (list, getBySlug, create, listAll, update, delete) ~6 tests
- Update `server/pricing.test.ts` — `calculatePackageDiscount()` + discount tier tests ~4 tests
- ~10 new tests total

## What Does NOT Change

- Booking form submission flow
- Email notification system
- Admin CRM
- Existing tour pages
- Gallery, reviews, blog
