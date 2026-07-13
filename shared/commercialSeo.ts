export type CommercialSeoIntent = "kosher" | "hebrewGuide" | "family";
export type CommercialSeoLanguage = "en" | "he";

export interface CommercialSeoRoutePair {
  intent: CommercialSeoIntent;
  paths: Record<CommercialSeoLanguage, string>;
  metadata: Record<
    CommercialSeoLanguage,
    {
      title: string;
      description: string;
    }
  >;
  heroImage: string;
}

/**
 * Canonical route pairs and search snippets for the bilingual commercial
 * landing pages. Both the SPA and the raw server HTML consume this contract.
 */
export const COMMERCIAL_SEO_BY_INTENT: Record<
  CommercialSeoIntent,
  CommercialSeoRoutePair
> = {
  kosher: {
    intent: "kosher",
    paths: {
      en: "/kosher-tours",
      he: "/he/kosher-tours-chiang-mai",
    },
    metadata: {
      en: {
        title: "Kosher-Friendly Tours in Chiang Mai for Families",
        description:
          "Plan a private kosher-friendly 4x4 tour from Chiang Mai with realistic meal logistics, Shabbat-aware timing, and Hebrew or English support.",
      },
      he: {
        title: "טיולים כשרים בצ׳אנג מאי למשפחות",
        description:
          "תכננו טיול 4x4 פרטי וידידותי לכשרות מצ׳אנג מאי, עם לוגיסטיקת אוכל מציאותית, תזמון שמתחשב בשבת ותמיכה בעברית.",
      },
    },
    heroImage: "kosher_meal_packages",
  },
  hebrewGuide: {
    intent: "hebrewGuide",
    paths: {
      en: "/hebrew-guide",
      he: "/he/hebrew-guide-chiang-mai",
    },
    metadata: {
      en: {
        title: "Hebrew-Speaking Guide in Chiang Mai for Private Tours",
        description:
          "Check a Hebrew-speaking guide for a private Chiang Mai 4x4 tour, with family-paced routes and kosher-aware planning when requested.",
      },
      he: {
        title: "מדריך דובר עברית בצ׳אנג מאי לטיולים פרטיים",
        description:
          "בדקו זמינות של מדריך דובר עברית לטיול 4x4 פרטי בצ׳אנג מאי, עם מסלולים בקצב משפחתי ותכנון כשרות לפי הצורך.",
      },
    },
    heroImage: "guide_wiro",
  },
  family: {
    intent: "family",
    paths: {
      en: "/private-family-tours",
      he: "/he/private-family-tours-chiang-mai",
    },
    metadata: {
      en: {
        title: "Private Family 4x4 Tours in Chiang Mai",
        description:
          "Compare private family 4x4 routes from Chiang Mai with flexible pacing, hotel pickup, clear inclusions, and English or Hebrew planning.",
      },
      he: {
        title: "טיולי 4x4 פרטיים למשפחות בצ׳אנג מאי",
        description:
          "השוו מסלולי 4x4 פרטיים למשפחות מצ׳אנג מאי, עם קצב גמיש, איסוף מהמלון, פירוט ברור ותכנון בעברית או באנגלית.",
      },
    },
    heroImage: "tourists_with_4x4",
  },
};

export const COMMERCIAL_SEO_ROUTE_PAIRS = Object.values(
  COMMERCIAL_SEO_BY_INTENT
);

export function getCommercialSeoRoute(path: string): {
  pair: CommercialSeoRoutePair;
  language: CommercialSeoLanguage;
} | null {
  for (const pair of COMMERCIAL_SEO_ROUTE_PAIRS) {
    if (pair.paths.en === path) return { pair, language: "en" };
    if (pair.paths.he === path) return { pair, language: "he" };
  }
  return null;
}
