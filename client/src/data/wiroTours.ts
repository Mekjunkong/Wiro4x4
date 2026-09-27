import {
  WIRO_DEPOSIT_RATE,
  WIRO_TOUR_CATALOG,
  type WiroTourCatalogEntry,
} from "@shared/wiroTourCatalog";
import { WIRO_TOUR_STORIES, type WiroTourStory } from "@shared/wiroTourStories";

// Editorial tour data lives in shared/ so the server's crawler HTML uses the
// same words as the app.
export {
  DIFFICULTY_LABEL,
  DURATION_HE,
  TOUR_IMAGE_MAP,
  WIRO_TOUR_STORIES,
  type Bi,
  type MapPlaceKey,
  type WiroTourStory,
} from "@shared/wiroTourStories";

/** A tour card: catalog facts merged with the editorial story. */
export interface WiroTour extends WiroTourStory {
  id: number;
  name: string;
  nameHe: string;
  price: number | null;
  duration: string;
  difficulty: WiroTourCatalogEntry["difficulty"];
}

export interface TourFactsOverride {
  slug: string;
  price?: number | null;
  duration?: string;
  difficulty?: string;
}

function isDifficulty(v: unknown): v is WiroTourCatalogEntry["difficulty"] {
  return v === "easy" || v === "moderate" || v === "challenging";
}

/**
 * The six tours in display order. Pass database rows to let their price,
 * duration and difficulty override the catalog fallback.
 */
export function getWiroTours(
  overrides: readonly TourFactsOverride[] = []
): WiroTour[] {
  return WIRO_TOUR_STORIES.flatMap(story => {
    const base = WIRO_TOUR_CATALOG.find(c => c.slug === story.slug);
    if (!base) return [];
    const db = overrides.find(o => o.slug === story.slug);
    return [
      {
        ...story,
        id: base.id,
        name: base.name,
        nameHe: base.nameHe,
        price: db?.price ?? base.price,
        duration: db?.duration || base.duration,
        difficulty: isDifficulty(db?.difficulty)
          ? db.difficulty
          : base.difficulty,
      },
    ];
  });
}

export function getWiroTourStory(slug: string): WiroTourStory | undefined {
  return WIRO_TOUR_STORIES.find(s => s.slug === slug);
}

export function formatBaht(amount: number | null | undefined): string {
  if (amount == null) return "";
  return "฿" + Math.round(amount).toLocaleString("en-US");
}

export function depositFor(amount: number | null | undefined): number | null {
  return amount == null ? null : Math.round(amount * WIRO_DEPOSIT_RATE);
}

/**
 * Image URLs for a file stem in /images/optimized (written by
 * `pnpm images:optimize`). `lg` is the largest variant (≤1200px wide).
 */
export function photo(stem: string) {
  const base = `/images/optimized/${stem}`;
  return { lg: `${base}-lg.jpg`, md: `${base}-md.jpg`, sm: `${base}-sm.jpg` };
}
