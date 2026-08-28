export interface TourSeoMeta {
  title: string;
  description: string;
}

export interface TourDisplayHeading {
  en: string;
  he: string;
}

export const TOUR_SEO_OVERRIDES: Readonly<Record<string, TourSeoMeta>> = {
  "doi-inthanon-roof-of-thailand": {
    title: "Private Doi Inthanon Tour from Chiang Mai — Roof of Thailand 4x4",
    description:
      "Private Doi Inthanon tour to Thailand's 2,565m peak, Pha Dok Siew trail, a Karen village coffee farm, and Wachirathan Waterfall.",
  },
  "mae-wang-jungle-wilderness": {
    title: "Mae Wang Jungle 4x4 Adventure — Private Tour from Chiang Mai",
    description:
      "Private Mae Wang 4x4 adventure with Pha Chor canyon, river crossings, a no-riding elephant walk, and bamboo rafting from Chiang Mai.",
  },
};

// Keep visible headings independent from SEO titles: the latter are written
// for search snippets and should not be rendered verbatim as an H1.
export const TOUR_DISPLAY_HEADING_OVERRIDES: Readonly<
  Record<string, TourDisplayHeading>
> = {
  "doi-inthanon-roof-of-thailand": {
    en: "Private Doi Inthanon Tour from Chiang Mai",
    he: "טיול פרטי לדוי אינתנון מצ'יאנג מאי",
  },
  "mae-wang-jungle-wilderness": {
    en: "Private Mae Wang Jungle 4x4 Adventure",
    he: "הרפתקת ג'ונגל פרטית ב-4x4 במאה וואנג",
  },
};

export function resolveTourSeoMeta(
  slug: string,
  fallback: TourSeoMeta
): TourSeoMeta {
  return TOUR_SEO_OVERRIDES[slug] ?? fallback;
}

export function resolveTourDisplayHeading(
  slug: string,
  fallback: TourDisplayHeading
): TourDisplayHeading {
  return TOUR_DISPLAY_HEADING_OVERRIDES[slug] ?? fallback;
}
