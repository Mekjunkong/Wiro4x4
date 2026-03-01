# Image Loading Performance Optimization — Design

**Date:** 2026-03-01
**Status:** Approved
**Approach:** Build-time image pipeline + runtime loading improvements

## Problem

The Wiro 4x4 site has ~110 images totaling ~144 MB. Performance issues include:

- Hero image is unoptimized JPEG (no WebP, no responsive sizes)
- No `srcset`/`sizes` — every device downloads full-size images
- Gallery page loads ALL images at once (no pagination)
- 3 different lazy loading strategies used inconsistently across components
- No blur placeholders — images flash from blank to loaded
- No image compression pipeline

## Solution Overview

| Change                                              | Impact                               |
| --------------------------------------------------- | ------------------------------------ |
| Sharp.js build-time image pipeline                  | 60-70% smaller image payload         |
| Unified OptimizedImage component with srcset + blur | Consistent loading, responsive sizes |
| Gallery infinite scroll (20 per batch)              | Faster gallery, less DOM/memory      |
| Hero image optimization                             | Better LCP score                     |

## 1. Build-Time Image Pipeline

A Node.js script (`scripts/optimize-images.ts`) using Sharp.js processes all source images into optimized variants.

**Input:** Images in `client/public/images/` (originals)

**Output per image** (to `client/public/images/optimized/`):

| Variant             | Width | Format | Purpose                          |
| ------------------- | ----- | ------ | -------------------------------- |
| `{name}-thumb.webp` | 20px  | WebP   | Blur placeholder (inline base64) |
| `{name}-sm.webp`    | 400w  | WebP   | Mobile portrait                  |
| `{name}-md.webp`    | 800w  | WebP   | Tablet / mobile landscape        |
| `{name}-lg.webp`    | 1600w | WebP   | Desktop                          |
| `{name}-sm.jpg`     | 400w  | JPEG   | Fallback mobile                  |
| `{name}-md.jpg`     | 800w  | JPEG   | Fallback tablet                  |
| `{name}-lg.jpg`     | 1600w | JPEG   | Fallback desktop                 |

**Compression:** WebP quality 80, JPEG quality 85.

**Manifest:** Generates `client/public/image-manifest.json` mapping original filenames to variant paths + base64 blur thumbnails.

**NPM script:** `pnpm images:optimize`

## 2. Unified OptimizedImage Component

Refactor `OptimizedImage.tsx` to be the single image component used everywhere. Remove ad-hoc `<picture>` elements from Hero, PhotoGallery, Tours, GalleryShowcase, TrustAndKosher.

**Props:**

```tsx
interface OptimizedImageProps {
  src: string; // base image path (e.g., "/images/optimized/banner")
  alt: string;
  priority?: boolean; // eager load + fetchPriority="high"
  sizes?: string; // responsive sizes hint
  className?: string;
  blurHash?: string; // base64 blur placeholder
  aspectRatio?: string; // prevents layout shift
  onError?: () => void; // broken image callback
}
```

**Behavior:**

1. Renders `<picture>` with `<source srcset>` for WebP (sm/md/lg) and `<img srcset>` for JPG fallback
2. Shows blur placeholder while loading (CSS background-image with base64 thumb)
3. Fades in real image once loaded (opacity transition)
4. Priority images: `loading="eager"`, `fetchPriority="high"`, preloaded
5. Non-priority: `loading="lazy"`, `decoding="async"`

## 3. Gallery Infinite Scroll

Replace "load all images at once" with infinite scroll — 20 images per batch.

**Frontend:**

1. Initial load: fetch first 20 photos
2. Sentinel `<div>` at bottom observed by IntersectionObserver
3. When sentinel enters viewport → fetch next 20, append
4. Category filter resets to page 1 and refetches
5. "Loading more..." spinner during fetch
6. Stops when all images loaded

**Backend:** Add pagination to `gallery.list` (page + pageSize params). Same pattern as existing `listPaginated` procedures.

## 4. Hero Image Optimization

- Convert `banner.jpeg` into the pipeline (generates 400/800/1600w in WebP + JPG)
- Hero.tsx switches to `<OptimizedImage src="/images/optimized/banner" priority />`
- Preload via `<link rel="preload">` for LCP
- Blur placeholder shows immediately, replaced by full image on load

## Components Affected

| Component       | File                                        | Change                              |
| --------------- | ------------------------------------------- | ----------------------------------- |
| OptimizedImage  | `client/src/components/OptimizedImage.tsx`  | Rewrite with srcset + blur          |
| Hero            | `client/src/components/Hero.tsx`            | Use OptimizedImage                  |
| PhotoGallery    | `client/src/components/PhotoGallery.tsx`    | Use OptimizedImage                  |
| Tours           | `client/src/components/Tours.tsx`           | Use OptimizedImage                  |
| GalleryShowcase | `client/src/components/GalleryShowcase.tsx` | Use OptimizedImage                  |
| TrustAndKosher  | `client/src/components/TrustAndKosher.tsx`  | Use OptimizedImage                  |
| Gallery (page)  | `client/src/pages/Gallery.tsx`              | Infinite scroll + OptimizedImage    |
| LazyImage       | `client/src/pages/Gallery.tsx`              | Remove (replaced by OptimizedImage) |
| API routers     | `server/routers.ts`                         | Add pagination to gallery.list      |
| DB helpers      | `server/db.ts`                              | Add paginated gallery query         |
| Image pipeline  | `scripts/optimize-images.ts`                | New file                            |
| Image manifest  | `client/public/image-manifest.json`         | New file (generated)                |

## Expected Results

- **Image payload:** 60-70% reduction (144 MB source → ~50 MB optimized, per-page much less via srcset)
- **LCP:** Significant improvement from hero WebP + preload
- **Gallery:** Only 20 images in DOM initially instead of 100+
- **Mobile:** 400w images instead of full-size — ~80% bandwidth savings
- **Perceived speed:** Blur placeholders eliminate blank image flash
