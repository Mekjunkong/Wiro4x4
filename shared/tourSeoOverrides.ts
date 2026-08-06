export interface TourSeoMeta {
  title: string;
  description: string;
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

export function resolveTourSeoMeta(
  slug: string,
  fallback: TourSeoMeta
): TourSeoMeta {
  return TOUR_SEO_OVERRIDES[slug] ?? fallback;
}
