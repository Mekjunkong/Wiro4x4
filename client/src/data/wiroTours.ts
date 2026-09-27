import {
  WIRO_DEPOSIT_RATE,
  WIRO_TOUR_CATALOG,
  type WiroTourCatalogEntry,
} from "@shared/wiroTourCatalog";

/**
 * Editorial copy for the six day tours (Claude Design "WIRO 4x4" import).
 *
 * Prices, durations and difficulty are NOT stored here — they come from
 * `WIRO_TOUR_CATALOG` (or the database, which overrides it). This module only
 * adds the storytelling layer: short name, tagline, itinerary, meal line and
 * which map pins belong to the route.
 */

export type Bi = readonly [en: string, he: string];

export type MapPlaceKey =
  | "inthanon"
  | "sticky"
  | "kampong"
  | "phachor"
  | "elephant"
  | "suthep"
  | "samoeng";

export interface WiroTourStory {
  slug: string;
  image: string;
  hours: number;
  shabbatFriendly: boolean;
  places: readonly MapPlaceKey[];
  shortName: Bi;
  tag: Bi;
  badge: Bi;
  desc: Bi;
  meal: Bi;
  itinerary: readonly (readonly [time: string, en: string, he: string])[];
}

/**
 * The one tour-card image map (slug → file stem in
 * `client/public/images/optimized/`). Tour cards force these images over the
 * database `imageUrl`.
 */
export const TOUR_IMAGE_MAP: Record<string, string> = {
  "doi-inthanon-roof-of-thailand": "mountain_sunset",
  "mae-kampong-hidden-village": "mae-kampong-village",
  "maerim-sticky-waterfalls": "sticky_waterfalls",
  "doi-suthep-pui-beyond-temple": "mountain_sunset_golden",
  "mae-wang-jungle-wilderness": "elephant_sanctuary_chiangmai",
  "samoeng-loop-mountain-circuit": "wiro_vehicle_scenic_stop",
};

export const WIRO_TOUR_STORIES: readonly WiroTourStory[] = [
  {
    slug: "doi-inthanon-roof-of-thailand",
    image: TOUR_IMAGE_MAP["doi-inthanon-roof-of-thailand"],
    hours: 7,
    shabbatFriendly: true,
    places: ["inthanon"],
    shortName: ["Doi Inthanon", "דוי אינתנון"],
    tag: ["Roof of Thailand", "גג תאילנד"],
    badge: ["Most Popular", "הכי פופולרי"],
    desc: [
      "Thailand's highest peak, cloud forest trails, and a Karen village coffee farm.",
      "הפסגה הגבוהה בתאילנד, שבילי יער ענן וחוות קפה בכפר קארן.",
    ],
    meal: [
      "Kosher-friendly lunch at a Karen village coffee farm, with the valley below you.",
      "ארוחת צהריים בתכנון כשר בחוות קפה בכפר קארן, עם העמק מתחתיכם.",
    ],
    itinerary: [
      ["07:30", "Hotel pickup in Chiang Mai", "איסוף מהמלון בצ'יאנג מאי"],
      [
        "09:15",
        "Wachirathan waterfall — spray on your face",
        "מפל וואצ'ירתאן — רסס על הפנים",
      ],
      [
        "10:30",
        "The summit, 2,565 m — highest point in Thailand",
        "הפסגה, 2,565 מ' — הנקודה הגבוהה בתאילנד",
      ],
      [
        "11:30",
        "Cloud-forest trail and the royal pagodas",
        "שביל יער הענן והפגודות המלכותיות",
      ],
      [
        "13:00",
        "Lunch at a Karen coffee farm",
        "ארוחת צהריים בחוות קפה של הקארן",
      ],
      ["16:00", "Back at your hotel", "חזרה למלון"],
    ],
  },
  {
    slug: "mae-kampong-hidden-village",
    image: TOUR_IMAGE_MAP["mae-kampong-hidden-village"],
    hours: 5,
    shabbatFriendly: true,
    places: ["kampong"],
    shortName: ["Mae Kampong", "מאה קמפונג"],
    tag: ["Hidden Mountain Village", "הכפר הנסתר בהרים"],
    badge: ["Hidden Gem", "פנינה נסתרת"],
    desc: [
      "An old mountain eco-village, forest tracks, local tea and coffee, and a panoramic viewpoint walk.",
      "כפר הרים אקולוגי ותיק, דרכי יער, תה וקפה מקומיים והליכה לתצפית פנורמית.",
    ],
    meal: [
      "Kosher-friendly lunch by the stream, with coffee grown on the slope above.",
      "ארוחה בתכנון כשר ליד הנחל, עם קפה שגדל במדרון מעליכם.",
    ],
    itinerary: [
      ["08:00", "Hotel pickup", "איסוף מהמלון"],
      ["09:15", "Forest track up into the mountains", "דרך יער אל תוך ההרים"],
      ["10:00", "Walk the village, then tea", "סיור בכפר, ואז תה"],
      ["11:30", "Viewpoint walk", "הליכה לנקודת התצפית"],
      ["12:30", "Lunch by the stream", "ארוחת צהריים ליד הנחל"],
      ["14:30", "Back in Chiang Mai", "חזרה לצ'יאנג מאי"],
    ],
  },
  {
    slug: "maerim-sticky-waterfalls",
    image: TOUR_IMAGE_MAP["maerim-sticky-waterfalls"],
    hours: 7,
    shabbatFriendly: true,
    places: ["sticky"],
    shortName: ["Sticky Waterfalls", "המפלים הדביקים"],
    tag: ["Maerim & Bua Tong", "מאה רים ובואה טונג"],
    badge: ["Family Favorite", "מועדף למשפחות"],
    desc: [
      "Climb UP a waterfall barefoot, walk a canopy walkway, and explore the quieter upper tiers.",
      "טפסו למעלה על מפל יחפים, הלכו על גשר צמרות וגלו את הקומות העליונות והשקטות של המפל.",
    ],
    meal: [
      "Kosher-friendly lunch in the shade between the climb and the canopy walk.",
      "ארוחה בתכנון כשר בצל, בין הטיפוס לגשר הצמרות.",
    ],
    itinerary: [
      ["08:00", "Hotel pickup", "איסוף מהמלון"],
      [
        "09:00",
        "Bua Tong — climb the sticky limestone, barefoot",
        "בואה טונג — טיפוס יחפים על אבן הגיר הדביקה",
      ],
      [
        "11:00",
        "Upper tiers most visitors never reach",
        "הקומות העליונות שרוב המבקרים לא מגיעים אליהן",
      ],
      ["12:30", "Lunch in the shade", "ארוחת צהריים בצל"],
      ["14:00", "Canopy walkway", "גשר הצמרות"],
      ["16:00", "Back at your hotel", "חזרה למלון"],
    ],
  },
  {
    slug: "doi-suthep-pui-beyond-temple",
    image: TOUR_IMAGE_MAP["doi-suthep-pui-beyond-temple"],
    hours: 6,
    shabbatFriendly: true,
    places: ["suthep"],
    shortName: ["Doi Suthep-Pui", "דוי סוטפ-פוי"],
    tag: ["Beyond the Temple", "מעבר למקדש"],
    badge: ["Temple & Trails", "מקדש ושבילים"],
    desc: [
      "The Monk's Trail, then onward where most tours turn back — a Hmong village, a coffee farm, a quiet waterfall.",
      "שביל הנזירים, ואז המשך לאן שרוב הטיולים חוזרים — כפר המונג, חוות קפה ומפל שקט.",
    ],
    meal: [
      "Kosher-friendly lunch at a coffee farm on the far side of the mountain.",
      "ארוחה בתכנון כשר בחוות קפה בצד השני של ההר.",
    ],
    itinerary: [
      ["07:30", "Hotel pickup", "איסוף מהמלון"],
      ["08:00", "Monk's Trail up to Wat Pha Lat", "שביל הנזירים אל ואט פה לאט"],
      [
        "10:00",
        "Doi Suthep temple, before the crowds",
        "מקדש דוי סוטפ, לפני ההמונים",
      ],
      ["11:30", "Hmong village on the far side", "כפר המונג בצד השני של ההר"],
      ["12:30", "Lunch at a coffee farm", "ארוחת צהריים בחוות קפה"],
      ["15:00", "Back in Chiang Mai", "חזרה לצ'יאנג מאי"],
    ],
  },
  {
    slug: "mae-wang-jungle-wilderness",
    image: TOUR_IMAGE_MAP["mae-wang-jungle-wilderness"],
    hours: 8,
    shabbatFriendly: false,
    places: ["elephant", "phachor"],
    shortName: ["Mae Wang", "מאה וואנג"],
    tag: ["Jungle & River Wilderness", "ג'ונגל ונהרות פראיים"],
    badge: ["Adventure Pick", "בחירת הרפתקנים"],
    desc: [
      "Real 4x4 off-road through jungle, Pha Chor canyon, river scenery and optional activities by request.",
      "שטח אמיתי ברכב 4x4 דרך ג'ונגל, קניון פה-צ'ור, נופי נהר ופעילויות נוספות לפי בקשה.",
    ],
    meal: [
      "Kosher-friendly lunch on the riverbank, planned before your day.",
      "ארוחה בתכנון כשר על גדת הנהר, מתואמת לפני היום.",
    ],
    itinerary: [
      ["07:30", "Hotel pickup", "איסוף מהמלון"],
      [
        "09:00",
        "Proper off-road: jungle tracks, river crossings",
        "שטח אמיתי: דרכי ג'ונגל וחציית נהרות",
      ],
      [
        "10:30",
        "Elephant sanctuary visit (optional, no riding)",
        "ביקור במקלט פילים (לבחירה, בלי רכיבה)",
      ],
      ["12:30", "Lunch on the riverbank", "ארוחת צהריים על גדת הנהר"],
      ["13:30", "River time on the Mae Wang", "זמן על הנהר במאה וואנג"],
      ["15:00", "Pha Chor canyon walls", "קירות קניון פה צ'ור"],
      ["17:00", "Back at your hotel", "חזרה למלון"],
    ],
  },
  {
    slug: "samoeng-loop-mountain-circuit",
    image: TOUR_IMAGE_MAP["samoeng-loop-mountain-circuit"],
    hours: 7,
    shabbatFriendly: true,
    places: ["samoeng"],
    shortName: ["Samoeng Loop", "לולאת סמואנג"],
    tag: ["The Mountain Circuit", "מעגל ההרים"],
    badge: ["Scenic Drive", "נסיעת נוף"],
    desc: [
      "A mountain loop of viewpoints, rural villages, a hilltop farm and market stops.",
      "לולאת הרים של תצפיות, כפרים כפריים, חווה על פסגה ועצירות בשווקים.",
    ],
    meal: [
      "Kosher-friendly lunch at a hilltop farm, often above the clouds.",
      "ארוחה בתכנון כשר בחווה על פסגת הר, לעיתים מעל העננים.",
    ],
    itinerary: [
      ["08:00", "Hotel pickup", "איסוף מהמלון"],
      [
        "09:30",
        "Up the loop — first viewpoints",
        "עולים ללולאה — תצפיות ראשונות",
      ],
      ["10:30", "Village and temple stop", "עצירה בכפר ובמקדש"],
      ["12:00", "Lunch at a hilltop farm", "ארוחת צהריים בחווה על פסגת הר"],
      ["14:00", "Hmong village and market", "כפר המונג ושוק"],
      ["16:30", "Lakeside stop, then home", "עצירה על שפת האגם, ואז הביתה"],
    ],
  },
];

export const DIFFICULTY_LABEL: Record<WiroTourCatalogEntry["difficulty"], Bi> =
  {
    easy: ["Easy", "קל"],
    moderate: ["Moderate", "בינוני"],
    challenging: ["Challenging", "מאתגר"],
  };

export const DURATION_HE: Record<string, string> = {
  "5-7 hours": "5-7 שעות",
  "6-7 hours": "6-7 שעות",
  "7-8 hours": "7-8 שעות",
  "8-9 hours": "8-9 שעות",
};

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
