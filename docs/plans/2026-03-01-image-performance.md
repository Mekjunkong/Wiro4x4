# Image Loading Performance Optimization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce image payload by 60-70%, add responsive srcset/sizes, blur placeholders, and gallery infinite scroll.

**Architecture:** Build-time Sharp.js pipeline generates responsive image variants (400/800/1600w in WebP + JPG) plus tiny blur thumbnails. A unified `OptimizedImage` component replaces all ad-hoc `<picture>` elements across the site. The gallery page switches from "load all" to infinite scroll with 20 images per batch via a new paginated `gallery.listPaginated` public procedure.

**Tech Stack:** Sharp.js (image processing), React (OptimizedImage component), tRPC (paginated gallery API), IntersectionObserver (infinite scroll sentinel)

---

## Task 1: Install Sharp.js and Create Image Pipeline Script

**Files:**

- Modify: `package.json` (add sharp dev dependency + `images:optimize` script)
- Create: `scripts/optimize-images.ts`

**Step 1: Install sharp**

Run: `pnpm add -D sharp @types/sharp`

**Step 2: Create the image pipeline script**

Create `scripts/optimize-images.ts`:

```ts
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const INPUT_DIR = path.resolve("client/public/images");
const OUTPUT_DIR = path.resolve("client/public/images/optimized");
const MANIFEST_PATH = path.resolve("client/public/image-manifest.json");

const SIZES = [
  { suffix: "sm", width: 400 },
  { suffix: "md", width: 800 },
  { suffix: "lg", width: 1600 },
];

const WEBP_QUALITY = 80;
const JPEG_QUALITY = 85;
const THUMB_WIDTH = 20;

type ManifestEntry = {
  blur: string; // base64 data URI
  sm: { webp: string; jpg: string };
  md: { webp: string; jpg: string };
  lg: { webp: string; jpg: string };
};

async function processImage(
  filePath: string,
  baseName: string
): Promise<ManifestEntry> {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  const entry: ManifestEntry = {
    blur: "",
    sm: { webp: "", jpg: "" },
    md: { webp: "", jpg: "" },
    lg: { webp: "", jpg: "" },
  };

  // Generate blur thumbnail (20px wide, base64)
  const thumbBuffer = await sharp(filePath)
    .resize(THUMB_WIDTH)
    .webp({ quality: 20 })
    .toBuffer();
  entry.blur = `data:image/webp;base64,${thumbBuffer.toString("base64")}`;

  // Generate responsive variants
  for (const size of SIZES) {
    // Skip if source is smaller than target width
    const targetWidth =
      metadata.width && metadata.width < size.width
        ? metadata.width
        : size.width;

    const webpPath = path.join(OUTPUT_DIR, `${baseName}-${size.suffix}.webp`);
    const jpgPath = path.join(OUTPUT_DIR, `${baseName}-${size.suffix}.jpg`);

    await sharp(filePath)
      .resize(targetWidth)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    await sharp(filePath)
      .resize(targetWidth)
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(jpgPath);

    entry[size.suffix as "sm" | "md" | "lg"] = {
      webp: `/images/optimized/${baseName}-${size.suffix}.webp`,
      jpg: `/images/optimized/${baseName}-${size.suffix}.jpg`,
    };
  }

  return entry;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Process images from the root images dir (not the optimized subdir)
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`Found ${imageFiles.length} images to process...`);

  const manifest: Record<string, ManifestEntry> = {};
  let processed = 0;

  for (const file of imageFiles) {
    const filePath = path.join(INPUT_DIR, file);
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");

    try {
      manifest[baseName] = await processImage(filePath, baseName);
      processed++;
      console.log(`[${processed}/${imageFiles.length}] ${file}`);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }

  // Also process existing optimized images that don't have responsive variants yet
  const optimizedFiles = await readdir(OUTPUT_DIR);
  const existingOptimized = optimizedFiles.filter(
    f => /\.(jpg|jpeg|png|webp)$/i.test(f) && !/-(?:sm|md|lg|thumb)\./.test(f)
  );

  for (const file of existingOptimized) {
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    if (manifest[baseName]) continue; // Already processed from root

    const filePath = path.join(OUTPUT_DIR, file);
    try {
      manifest[baseName] = await processImage(filePath, baseName);
      processed++;
      console.log(`[optimized] ${file}`);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nDone! Processed ${processed} images.`);
  console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main();
```

**Step 3: Add npm script to package.json**

Add to `scripts` in `package.json`:

```json
"images:optimize": "tsx scripts/optimize-images.ts"
```

**Step 4: Run the pipeline**

Run: `pnpm images:optimize`
Expected: Generates responsive variants in `client/public/images/optimized/` and `image-manifest.json`.

**Step 5: Add manifest to .gitignore**

The manifest is generated — add to `.gitignore`:

```
client/public/image-manifest.json
```

Also add the generated responsive variants pattern:

```
client/public/images/optimized/*-sm.*
client/public/images/optimized/*-md.*
client/public/images/optimized/*-lg.*
client/public/images/optimized/*-thumb.*
```

**Step 6: Commit**

```bash
git add scripts/optimize-images.ts package.json pnpm-lock.yaml .gitignore
git commit -m "feat: add Sharp.js image optimization pipeline

Generates responsive variants (400/800/1600w) in WebP + JPG
plus tiny blur thumbnails. Run with pnpm images:optimize."
```

---

## Task 2: Rewrite OptimizedImage Component with srcset + Blur

**Files:**

- Modify: `client/src/components/OptimizedImage.tsx`

**Step 1: Write the test**

This is a React component — manual testing via `pnpm dev` is more practical. Skip unit test for this UI component.

**Step 2: Rewrite OptimizedImage.tsx**

Replace the entire file with:

```tsx
import { ImgHTMLAttributes, useState, useEffect } from "react";

interface OptimizedImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet"
> {
  /** Base image name (e.g., "mountain_sunset" or full path "/images/optimized/mountain_sunset") */
  src: string;
  alt: string;
  /** Eager load for LCP/hero images */
  priority?: boolean;
  /** Directory containing the responsive variants */
  basePath?: string;
  /** Responsive sizes hint (defaults to 100vw) */
  sizes?: string;
  /** Base64 blur placeholder data URI */
  blur?: string;
  /** Aspect ratio for layout shift prevention (e.g., "16/9", "4/3") */
  aspectRatio?: string;
  /** Called when all image sources fail */
  onError?: () => void;
  /** Fallback format */
  fallbackFormat?: "jpg" | "jpeg" | "png";
}

/**
 * Unified image component with:
 * - Responsive srcset (sm/md/lg variants at 400/800/1600w)
 * - WebP with JPG fallback via <picture>
 * - Blur placeholder while loading
 * - Priority loading for LCP images
 * - Graceful fallback to single-file mode when no responsive variants exist
 */
export function OptimizedImage({
  src,
  alt,
  priority = false,
  basePath = "/images/optimized",
  sizes = "100vw",
  blur,
  aspectRatio,
  fallbackFormat = "jpg",
  className = "",
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Extract clean base name — strip path prefix and extension
  const cleanSrc = src
    .replace(/^\/images\/optimized\//, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");

  // Check if this is already a full URL (S3/external)
  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");

  // Build srcset paths for responsive variants
  const webpSrcSet = isExternalUrl
    ? undefined
    : `${basePath}/${cleanSrc}-sm.webp 400w, ${basePath}/${cleanSrc}-md.webp 800w, ${basePath}/${cleanSrc}-lg.webp 1600w`;

  const jpgSrcSet = isExternalUrl
    ? undefined
    : `${basePath}/${cleanSrc}-sm.${fallbackFormat} 400w, ${basePath}/${cleanSrc}-md.${fallbackFormat} 800w, ${basePath}/${cleanSrc}-lg.${fallbackFormat} 1600w`;

  // Fallback src (largest variant or original for external URLs)
  const fallbackSrc = isExternalUrl
    ? src
    : `${basePath}/${cleanSrc}-lg.${fallbackFormat}`;

  // Preload priority images
  useEffect(() => {
    if (!priority || isExternalUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.type = "image/webp";
    link.imageSrcset = webpSrcSet || "";
    link.imageSizes = sizes;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [priority, webpSrcSet, sizes, isExternalUrl]);

  if (hasError) return null;

  const containerStyle: React.CSSProperties = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(blur && !isLoaded
      ? {
          backgroundImage: `url(${blur})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    ...style,
  };

  return (
    <picture>
      {/* WebP responsive source */}
      {webpSrcSet && (
        <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      )}

      {/* JPG fallback with srcset */}
      <img
        src={fallbackSrc}
        srcSet={jpgSrcSet}
        sizes={isExternalUrl ? undefined : sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={containerStyle}
        {...props}
      />
    </picture>
  );
}

/**
 * Preload a critical image for LCP optimization.
 * Call early in a component to hint the browser.
 */
export function preloadImage(
  src: string,
  basePath = "/images/optimized",
  sizes = "100vw"
) {
  const cleanSrc = src
    .replace(/^\/images\/optimized\//, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.type = "image/webp";
  link.imageSrcset = `${basePath}/${cleanSrc}-sm.webp 400w, ${basePath}/${cleanSrc}-md.webp 800w, ${basePath}/${cleanSrc}-lg.webp 1600w`;
  link.imageSizes = sizes;
  document.head.appendChild(link);
}
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No new errors.

**Step 4: Commit**

```bash
git add client/src/components/OptimizedImage.tsx
git commit -m "feat: rewrite OptimizedImage with responsive srcset and blur placeholders

Supports sm/md/lg variants (400/800/1600w), WebP+JPG via picture,
blur placeholder backgrounds, priority preloading, and external URL fallback."
```

---

## Task 3: Migrate Hero.tsx to OptimizedImage

**Files:**

- Modify: `client/src/components/Hero.tsx`

**Step 1: Update Hero.tsx**

Replace the `<img>` tag (lines 58-67) with `OptimizedImage`:

Change:

```tsx
<img
  src="/images/banner.jpeg"
  alt={t(
    "Travelers with WIRO 4x4 vehicle on jungle road in Chiang Mai",
    "מטיילים עם רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
  )}
  className="absolute inset-0 w-full h-full object-cover"
  loading="eager"
  fetchPriority="high"
/>
```

To:

```tsx
<OptimizedImage
  src="banner"
  alt={t(
    "Travelers with WIRO 4x4 vehicle on jungle road in Chiang Mai",
    "מטיילים עם רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
  )}
  className="absolute inset-0 w-full h-full object-cover"
  priority
  sizes="100vw"
/>
```

Add import at top:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";
```

**Note:** The pipeline script (Task 1) must process `banner.jpeg` from `client/public/images/` to generate `banner-sm.webp`, `banner-md.webp`, `banner-lg.webp`, etc. in `client/public/images/optimized/`.

**Step 2: Verify via dev server**

Run: `pnpm dev`
Check: Homepage loads, hero image renders correctly, inspect Network tab to confirm WebP srcset is used.

**Step 3: Commit**

```bash
git add client/src/components/Hero.tsx
git commit -m "feat: migrate Hero to OptimizedImage with responsive srcset

Hero banner now uses WebP+JPG responsive variants (400/800/1600w)
with priority preloading for better LCP."
```

---

## Task 4: Migrate PhotoGallery.tsx to OptimizedImage

**Files:**

- Modify: `client/src/components/PhotoGallery.tsx`

**Step 1: Update PhotoGallery.tsx**

1. Add import:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";
```

2. Simplify the `Photo` interface — now just need `src` (base name) and `caption`:

```tsx
interface Photo {
  src: string; // base name, e.g., "guide_wiro"
  caption: string;
}
```

3. Simplify photo array — remove `fallback` field, use base names only:

```tsx
const photos: Photo[] = [
  {
    src: "guide_wiro",
    caption: t("Meet Guide Wiro — your adventure starts here", "..."),
  },
  // ... same for all 8 photos, using base names
];
```

4. Replace the `<picture>` block inside the carousel (lines 147-157) with:

```tsx
<OptimizedImage
  src={photo.src}
  alt={photo.caption}
  priority={index === 0}
  sizes="100vw"
  className="w-full h-full object-cover object-center"
/>
```

**Step 2: Verify**

Run: `pnpm dev`
Check: Homepage carousel renders correctly, first slide loads eagerly, rest lazy.

**Step 3: Commit**

```bash
git add client/src/components/PhotoGallery.tsx
git commit -m "feat: migrate PhotoGallery to OptimizedImage

Carousel now uses responsive srcset variants with priority loading
for first slide."
```

---

## Task 5: Migrate Tours.tsx to OptimizedImage

**Files:**

- Modify: `client/src/components/Tours.tsx`

**Step 1: Update Tours.tsx**

1. Add import:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";
```

2. Simplify `TOUR_IMAGE_MAP` — now just needs the base name:

```tsx
const TOUR_IMAGE_MAP: Record<string, string> = {
  "doi-inthanon-roof-of-thailand": "mountain_sunset",
  "mae-kampong-hidden-village": "mountain_village_view",
  "maerim-sticky-waterfalls": "sticky_waterfalls",
  "doi-suthep-pui-beyond-temple": "accessible_doi_suthep_temple",
  "mae-wang-jungle-wilderness": "elephant_encounter",
  "samoeng-loop-mountain-circuit": "samoeng_village",
};
```

3. In the tour card rendering, replace the `<picture>` element with:

```tsx
<OptimizedImage
  src={TOUR_IMAGE_MAP[tour.slug] || tour.image}
  alt={tour.title}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
```

4. Remove `imageWebp` from the mapped tour object — no longer needed.

**Step 2: Verify**

Run: `pnpm dev`
Check: Tour cards render with correct images, responsive srcset in devtools.

**Step 3: Commit**

```bash
git add client/src/components/Tours.tsx
git commit -m "feat: migrate Tours to OptimizedImage with responsive srcset

Tour cards now serve 400/800/1600w variants. Simplified TOUR_IMAGE_MAP
to base names."
```

---

## Task 6: Migrate TrustAndKosher.tsx to OptimizedImage

**Files:**

- Modify: `client/src/components/TrustAndKosher.tsx`

**Step 1: Update TrustAndKosher.tsx**

1. Add import:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";
```

2. Replace the `<picture>` block (lines 76-87) with:

```tsx
<OptimizedImage
  src="wiro_with_vehicle"
  alt={t("WIRO guide with 4x4 vehicle", "מדריך WIRO עם רכב שטח")}
  sizes="(max-width: 1024px) 100vw, 50vw"
  className="w-full h-full object-cover"
/>
```

**Step 2: Verify**

Run: `pnpm dev`
Check: "Why WIRO 4x4?" section image renders correctly.

**Step 3: Commit**

```bash
git add client/src/components/TrustAndKosher.tsx
git commit -m "feat: migrate TrustAndKosher to OptimizedImage"
```

---

## Task 7: Migrate GalleryShowcase.tsx to OptimizedImage

**Files:**

- Modify: `client/src/components/GalleryShowcase.tsx`

**Step 1: Update GalleryShowcase.tsx**

1. Add import:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";
```

2. Update `FALLBACK_IMAGES` to use base names:

```tsx
const FALLBACK_IMAGES = [
  { src: "hero-wiro", caption: "Chiang Mai Adventure" },
  { src: "mountain_sunset", caption: "Doi Inthanon Summit" },
  { src: "mae-kampong-village", caption: "Mae Kampong Village" },
  { src: "sticky_waterfalls", caption: "Sticky Waterfalls" },
  { src: "doi_suthep_temple", caption: "Doi Suthep Temple" },
  { src: "mae_wang_elephants", caption: "Mae Wang Jungle" },
];
```

3. Replace the `<img>` tag (line 62-66) with:

```tsx
<OptimizedImage
  src={img.src}
  alt={img.caption}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
/>
```

4. Handle the DB case — when using `p.s3Url`, pass the full URL (OptimizedImage handles external URLs by skipping srcset):

```tsx
const images =
  photos && photos.length >= 6
    ? photos.slice(0, 8).map(p => ({
        src: p.s3Url || FALLBACK_IMAGES[0].src,
        caption: p.title || "",
      }))
    : FALLBACK_IMAGES;
```

**Step 2: Verify**

Run: `pnpm dev`
Check: "Adventure Gallery" section on homepage renders correctly.

**Step 3: Commit**

```bash
git add client/src/components/GalleryShowcase.tsx
git commit -m "feat: migrate GalleryShowcase to OptimizedImage"
```

---

## Task 8: Add Paginated Public Gallery API

**Files:**

- Modify: `server/db/gallery.ts` (add `getPublishedPhotosPaginated`)
- Modify: `server/db/index.ts` (export new function)
- Modify: `server/routes/gallery.ts` (add `listPaginated` public procedure)
- Modify: `server/gallery.test.ts` (add pagination test)

**Step 1: Write the failing test**

Add to `server/gallery.test.ts`:

```ts
describe("gallery.listPaginated (public)", () => {
  it("returns paginated published photos with total count", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gallery.listPaginated({
      page: 1,
      pageSize: 20,
    });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page", 1);
    expect(result).toHaveProperty("pageSize", 20);
    expect(result).toHaveProperty("totalPages");
    expect(Array.isArray(result.items)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- gallery.test.ts`
Expected: FAIL — `caller.gallery.listPaginated` is not a function.

**Step 3: Add DB helper**

In `server/db/gallery.ts`, add:

```ts
export async function getPublishedPhotosPaginated(
  page = 1,
  pageSize = 20,
  category?: string
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;

  const conditions = [eq(galleryPhotos.isPublished, 1)];
  if (category && category !== "all") {
    conditions.push(eq(galleryPhotos.category, category));
  }

  const whereClause =
    conditions.length === 1 ? conditions[0] : and(...conditions);

  const items = await db
    .select()
    .from(galleryPhotos)
    .where(whereClause)
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(galleryPhotos)
    .where(whereClause);

  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
```

Add import `and` from drizzle-orm at top of file.

**Step 4: Export from db/index.ts**

Add `getPublishedPhotosPaginated` to the gallery exports in `server/db/index.ts`.

**Step 5: Add tRPC procedure**

In `server/routes/gallery.ts`, add the procedure:

```ts
listPaginated: securePublicProcedure
  .input(
    paginationInput.extend({
      category: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const { page, pageSize, category } = input;
    const { items, total } = await getPublishedPhotosPaginated(
      page,
      pageSize,
      category
    );
    return {
      items: items.map(p => ({ ...p, imageUrl: p.s3Url })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }),
```

Add import for `getPublishedPhotosPaginated` and `z`.

**Step 6: Run test to verify it passes**

Run: `pnpm test -- gallery.test.ts`
Expected: PASS.

**Step 7: Commit**

```bash
git add server/db/gallery.ts server/db/index.ts server/routes/gallery.ts server/gallery.test.ts
git commit -m "feat: add paginated public gallery API

New gallery.listPaginated procedure with page/pageSize/category params.
Follows existing pagination pattern."
```

---

## Task 9: Rewrite Gallery Page with Infinite Scroll

**Files:**

- Modify: `client/src/pages/Gallery.tsx`

**Step 1: Rewrite Gallery.tsx**

Key changes:

1. Remove `LazyImage` component (replaced by `OptimizedImage`)
2. Replace `trpc.gallery.list.useQuery()` with paginated fetching
3. Add infinite scroll via IntersectionObserver sentinel
4. Keep all existing functionality: category filters, lightbox, broken image tracking, swipe gestures

Replace the data fetching and grid section. The key changes are:

**State additions:**

```tsx
const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const sentinelRef = useRef<HTMLDivElement>(null);
const PAGE_SIZE = 20;
```

**Replace the single `useQuery` with paginated fetch:**

```tsx
const { data, isLoading } = trpc.gallery.listPaginated.useQuery(
  {
    page: 1,
    pageSize: PAGE_SIZE,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  },
  { keepPreviousData: true }
);
```

For infinite scroll, use `useInfiniteQuery` or manual pagination with `useQuery` + append pattern.

**Preferred approach — manual pagination with `useEffect`:**

```tsx
// Fetch first page
const { data: firstPage, isLoading } = trpc.gallery.listPaginated.useQuery({
  page: 1,
  pageSize: PAGE_SIZE,
  category: selectedCategory === "all" ? undefined : selectedCategory,
});

// Track all loaded photos
const [extraPages, setExtraPages] = useState<(typeof firstPage)["items"][]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);

// Reset on category change
useEffect(() => {
  setExtraPages([]);
  setCurrentPage(1);
  setHasMore(true);
}, [selectedCategory]);

// Combine all pages
const allPhotos = useMemo(() => {
  const base = firstPage?.items || [];
  return [...base, ...extraPages.flat()];
}, [firstPage, extraPages]);

// Update hasMore
useEffect(() => {
  if (firstPage) {
    setHasMore(currentPage < firstPage.totalPages);
  }
}, [firstPage, currentPage]);

// Load more function
const loadMore = useCallback(async () => {
  if (isLoadingMore || !hasMore) return;
  setIsLoadingMore(true);
  // Use tRPC client directly for subsequent pages
  // (This requires using trpc.useUtils() to access the client)
}, [isLoadingMore, hasMore, currentPage, selectedCategory]);
```

**Sentinel div at bottom of grid:**

```tsx
{
  hasMore && (
    <div ref={sentinelRef} className="col-span-full flex justify-center py-8">
      <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

**IntersectionObserver for sentinel:**

```tsx
useEffect(() => {
  if (!sentinelRef.current || !hasMore) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) loadMore();
    },
    { rootMargin: "200px" }
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, loadMore]);
```

**Replace `LazyImage` usage in grid with `OptimizedImage`:**

```tsx
<OptimizedImage
  src={photo.imageUrl}
  alt={`${photo.title} | WIRO 4x4 Gallery`}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  onError={() =>
    setBrokenIds(prev => {
      const next = new Set(Array.from(prev));
      next.add(photo.id);
      return next;
    })
  }
/>
```

**Step 2: Verify**

Run: `pnpm dev`
Check:

- Gallery page loads first 20 images
- Scrolling down loads more (check Network tab)
- Category filter resets and reloads from page 1
- Lightbox still works
- Swipe gestures still work

**Step 3: Run tests**

Run: `pnpm test`
Expected: All existing tests pass.

**Step 4: Commit**

```bash
git add client/src/pages/Gallery.tsx
git commit -m "feat: add infinite scroll to Gallery page

Loads 20 photos per batch with IntersectionObserver sentinel.
Replaces LazyImage with OptimizedImage. Category filter resets pagination."
```

---

## Task 10: Type Check and Final Verification

**Files:**

- No new files

**Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Run all tests**

Run: `pnpm test`
Expected: All tests pass (existing + new gallery pagination test).

**Step 3: Manual smoke test**

Run: `pnpm dev`

Check these pages:

- `/` — Hero loads fast (WebP srcset), carousel works, gallery showcase renders
- `/gallery` — Infinite scroll loads 20 at a time, category filter works, lightbox works
- `/tours/:slug` — Tour detail images render correctly
- Mobile viewport — smaller image variants served (check Network tab for 400w images)

**Step 4: Commit any fixes**

If any issues found, fix and commit individually.

**Step 5: Final commit**

```bash
git commit --allow-empty -m "chore: verify image performance optimization complete

All components migrated to OptimizedImage with responsive srcset.
Gallery uses infinite scroll. Pipeline generates optimized variants."
```
