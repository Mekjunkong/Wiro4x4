export interface WiroTourCatalogEntry {
  id: number;
  slug: string;
  name: string;
  nameHe: string;
  price: number;
  duration: string;
  difficulty: "easy" | "moderate" | "challenging";
  isKosher: number;
  bestFor: string;
  highlights: readonly string[];
}

/**
 * Free, database-independent tour facts used by both the public package UI and
 * Levi. Database rows override these values when the database is healthy, but
 * there must never be a second hand-written set of Levi prices.
 */
export const WIRO_TOUR_CATALOG = [
  {
    id: 1,
    slug: "doi-inthanon-roof-of-thailand",
    name: "Doi Inthanon — Roof of Thailand",
    nameHe: "דוי אינתנון — גג תאילנד",
    price: 5000,
    duration: "7-8 hours",
    difficulty: "moderate",
    isKosher: 1,
    bestFor: "nature lovers, families, and first-time visitors",
    highlights: [
      "Thailand's highest peak",
      "waterfalls",
      "royal pagodas",
      "highland village stops",
    ],
  },
  {
    id: 2,
    slug: "mae-kampong-hidden-village",
    name: "Mae Kampong — Hidden Mountain Village",
    nameHe: "מאה קמפונג — הכפר הנסתר בהרים",
    price: 3500,
    duration: "5-7 hours",
    difficulty: "easy",
    isKosher: 1,
    bestFor: "culture lovers and gentler family days",
    highlights: [
      "mountain village",
      "forest scenery",
      "local coffee",
      "waterfalls",
    ],
  },
  {
    id: 3,
    slug: "maerim-sticky-waterfalls",
    name: "Maerim & Sticky Waterfalls",
    nameHe: "מאה רים ומפלים דביקים",
    price: 4500,
    duration: "7-8 hours",
    difficulty: "easy",
    isKosher: 1,
    bestFor: "adventurous families with children",
    highlights: [
      "Bua Tong sticky waterfalls",
      "canopy walkway",
      "family-friendly stops",
    ],
  },
  {
    id: 4,
    slug: "doi-suthep-pui-beyond-temple",
    name: "Doi Suthep-Pui — Beyond the Temple",
    nameHe: "דוי סוטפ-פוי — מעבר למקדש",
    price: 3500,
    duration: "6-7 hours",
    difficulty: "moderate",
    isKosher: 1,
    bestFor: "travelers wanting a temple, nature, and viewpoints",
    highlights: [
      "Doi Suthep temple",
      "mountain viewpoints",
      "village and coffee stops",
    ],
  },
  {
    id: 5,
    slug: "mae-wang-jungle-wilderness",
    name: "Mae Wang — Jungle Wilderness",
    nameHe: "מאה וואנג — פראות הג'ונגל",
    price: 4800,
    duration: "8-9 hours",
    difficulty: "challenging",
    isKosher: 1,
    bestFor: "travelers seeking a longer, more adventurous day",
    highlights: [
      "jungle tracks",
      "river scenery",
      "Pha Chor",
      "optional activities by request",
    ],
  },
  {
    id: 6,
    slug: "samoeng-loop-mountain-circuit",
    name: "Samoeng Loop — Mountain Circuit",
    nameHe: "לולאת סמואנג — מעגל ההרים",
    price: 3500,
    duration: "7-8 hours",
    difficulty: "moderate",
    isKosher: 1,
    bestFor: "scenic drives, mountain landscapes, and photography",
    highlights: [
      "mountain circuit",
      "rural villages",
      "viewpoints",
      "farm and market stops",
    ],
  },
] as const satisfies readonly WiroTourCatalogEntry[];

export const WIRO_WHATSAPP_NUMBER = "66816401397";
export const WIRO_DEPOSIT_RATE = 0.3;

export function getFallbackTourBySlug(slug: string) {
  return WIRO_TOUR_CATALOG.find(tour => tour.slug === slug);
}
