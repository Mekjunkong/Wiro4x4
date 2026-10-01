import { COMMERCIAL_SEO_ROUTE_PAIRS } from "./commercialSeo";
import { WIRO_TOUR_CATALOG } from "./wiroTourCatalog";
import { WIRO_TOUR_STORIES } from "./wiroTourStories";

/**
 * Tour URLs per language. English tours live at /tours/:slug and Hebrew ones
 * at /he/tours/:slug, so each language has its own crawlable page linked by
 * hreflang. Used by the client (links, meta, language switch) and the server
 * (SEO meta, crawler HTML, sitemap).
 */

export type SiteLanguage = "en" | "he";

const HE_TOUR_PATH = /^\/he\/tours\/([^/]+)$/;
const EN_TOUR_PATH = /^\/tours\/([^/]+)$/;

export function tourPath(slug: string, language: SiteLanguage): string {
  return language === "he" ? `/he/tours/${slug}` : `/tours/${slug}`;
}

export function tourAlternates(slug: string) {
  return {
    en: tourPath(slug, "en"),
    he: tourPath(slug, "he"),
    "x-default": tourPath(slug, "en"),
  } as const;
}

/** The slug of a Hebrew tour URL, or null. */
export function hebrewTourSlug(path: string): string | null {
  return path.match(HE_TOUR_PATH)?.[1] ?? null;
}

/**
 * Hebrew title and description, built only from copy the site already shows
 * (catalog nameHe + the tour story's Hebrew line).
 */
export function hebrewTourSeoMeta(
  slug: string
): { title: string; description: string } | null {
  const tour = WIRO_TOUR_CATALOG.find(t => t.slug === slug);
  if (!tour) return null;
  const story = WIRO_TOUR_STORIES.find(s => s.slug === slug);
  return {
    title: `${tour.nameHe}: טיול ג׳יפים פרטי מצ׳יאנג מאי`,
    description: `${story ? `${story.desc[1]} ` : ""}טיול ג׳יפים פרטי ברכב 4x4 מצ׳יאנג מאי, עם איסוף ותכנון ארוחות ידידותי לכשרות.`,
  };
}

/**
 * The same page in the other language, when one exists: tour pages and the
 * paired commercial landing pages. Used by the header language switch, which
 * otherwise cannot change a page whose language is fixed by its URL.
 */
export function languagePairPath(
  path: string,
  target: SiteLanguage
): string | null {
  const heSlug = hebrewTourSlug(path);
  if (heSlug) return target === "en" ? tourPath(heSlug, "en") : null;
  const enSlug = path.match(EN_TOUR_PATH)?.[1];
  if (enSlug) return target === "he" ? tourPath(enSlug, "he") : null;
  for (const pair of COMMERCIAL_SEO_ROUTE_PAIRS) {
    if (pair.paths.en === path || pair.paths.he === path) {
      const other = pair.paths[target];
      return other === path ? null : other;
    }
  }
  return null;
}
