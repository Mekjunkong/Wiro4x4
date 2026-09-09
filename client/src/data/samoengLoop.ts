export type BilingualCopy = { en: string; he: string };

export type SamoengCategory =
  | "nature"
  | "views"
  | "culture"
  | "adventure"
  | "family"
  | "food";

export interface SamoengAttraction {
  id: string;
  name: string;
  description: BilingualCopy;
  category: SamoengCategory;
  searchQuery: string;
}

export const SAMOENG_ROUTE_URL =
  "https://maps.app.goo.gl/TuSG8CtxUajoz1Tw5?g_st=ac";

export const SAMOENG_SAVED_PLACES_URL =
  "https://maps.app.goo.gl/XuxDp3u1DMJjUYxH8?g_st=ac";

export const SAMOENG_CATEGORIES: Array<{
  id: "all" | SamoengCategory;
  label: BilingualCopy;
}> = [
  { id: "all", label: { en: "All highlights", he: "כל המקומות" } },
  { id: "nature", label: { en: "Waterfalls & nature", he: "מפלים וטבע" } },
  { id: "views", label: { en: "Views & gardens", he: "תצפיות וגנים" } },
  { id: "culture", label: { en: "Temples & culture", he: "מקדשים ותרבות" } },
  { id: "adventure", label: { en: "Adventure", he: "אטרקציות אקסטרים" } },
  { id: "family", label: { en: "Family & animals", he: "משפחה ובעלי חיים" } },
  { id: "food", label: { en: "Cafes & food", he: "בתי קפה ואוכל" } },
];

export const SAMOENG_ROUTE_STAGES: Array<{
  name: BilingualCopy;
  description: BilingualCopy;
}> = [
  {
    name: { en: "Chiang Mai to Mae Rim", he: "מצ׳יאנג מאי למאה רים" },
    description: {
      en: "Leave the city and settle into the ride before the mountain road begins.",
      he: "יוצאים מהעיר ונכנסים לקצב לפני תחילת כביש ההרים.",
    },
  },
  {
    name: { en: "Mae Sa and Pong Yaeng", he: "מאה סה ופונג יאנג" },
    description: {
      en: "Waterfalls, gardens and activity stops along Route 1096.",
      he: "מפלים, גנים ואטרקציות לאורך כביש 1096.",
    },
  },
  {
    name: { en: "Samoeng mountains", he: "הרי סמואנג" },
    description: {
      en: "The quiet, winding western section through forest and valley scenery.",
      he: "הקטע המערבי השקט והמפותל, בין יערות ונופי עמק.",
    },
  },
  {
    name: { en: "Doi Kham to Chiang Mai", he: "מדוי קאם לצ׳יאנג מאי" },
    description: {
      en: "Return toward the city with optional temple and sunset stops.",
      he: "חוזרים לעיר עם אפשרות לעצירות במקדשים ובשקיעה.",
    },
  },
];

export const SAMOENG_ATTRACTIONS: SamoengAttraction[] = [
  {
    id: "mae-sa-waterfall",
    name: "Mae Sa Waterfall",
    category: "nature",
    searchQuery: "Mae Sa Waterfall Chiang Mai Thailand",
    description: {
      en: "A forest waterfall stop with several tiers to explore.",
      he: "עצירת מפל ביער עם מספר מפלסים לטיול.",
    },
  },
  {
    id: "tat-phanarom",
    name: "Cascade 7 Tat Phanarom",
    category: "nature",
    searchQuery: "Cascade 7 Tat Phanarom Chiang Mai Thailand",
    description: {
      en: "A quieter nature stop saved in WIRO’s loop collection.",
      he: "עצירת טבע שקטה יותר מתוך אוסף המסלול של WIRO.",
    },
  },
  {
    id: "ob-khan-national-park",
    name: "Ob Khan National Park",
    category: "nature",
    searchQuery: "Ob Khan National Park Chiang Mai Thailand",
    description: {
      en: "River, rock formations and forest near the southern side of the loop.",
      he: "נהר, תצורות סלע ויער בצד הדרומי של המסלול.",
    },
  },
  {
    id: "mae-sap-cave",
    name: "Mae Sap Cave",
    category: "nature",
    searchQuery: "Mae Sap Cave Samoeng Chiang Mai Thailand",
    description: {
      en: "An optional cave detour for riders with time to explore.",
      he: "סטייה אופציונלית למערה למי שיש זמן לחקור.",
    },
  },
  {
    id: "mon-jam",
    name: "Mon Jam",
    category: "views",
    searchQuery: "Mon Jam Chiang Mai Thailand",
    description: {
      en: "Mountain gardens and wide Mae Rim valley views.",
      he: "גנים הרריים ותצפיות רחבות על עמק מאה רים.",
    },
  },
  {
    id: "queen-sirikit-botanic-garden",
    name: "Queen Sirikit Botanic Garden",
    category: "views",
    searchQuery: "Queen Sirikit Botanic Garden Chiang Mai Thailand",
    description: {
      en: "A spacious garden stop with forest walks and glasshouses.",
      he: "גן רחב ידיים עם שבילי יער וחממות.",
    },
  },
  {
    id: "napa-phupa-strawberry-farm",
    name: "Napa Phupa Strawberry Farm",
    category: "views",
    searchQuery: "Napa Phupa Strawberry Farm Samoeng Chiang Mai Thailand",
    description: {
      en: "A seasonal farm stop in the Samoeng mountain landscape.",
      he: "עצירת חווה עונתית בנוף ההררי של סמואנג.",
    },
  },
  {
    id: "wat-phra-that-doi-kham",
    name: "Wat Phra That Doi Kham",
    category: "culture",
    searchQuery: "Wat Phra That Doi Kham Chiang Mai Thailand",
    description: {
      en: "A revered hilltop temple near the return into Chiang Mai.",
      he: "מקדש חשוב על גבעה סמוך לחזרה לצ׳יאנג מאי.",
    },
  },
  {
    id: "loha-prasat-sri-mueang-pong",
    name: "Loha Prasat Sri Mueang Pong",
    category: "culture",
    searchQuery: "Loha Prasat Sri Mueang Pong Chiang Mai Thailand",
    description: {
      en: "A distinctive Buddhist site on the mountain side of the loop.",
      he: "אתר בודהיסטי ייחודי בצד ההררי של המסלול.",
    },
  },
  {
    id: "pong-yang-jungle-coaster",
    name: "Pong Yang Jungle Coaster & Zipline",
    category: "adventure",
    searchQuery: "Pong Yang Jungle Coaster Zipline Chiang Mai Thailand",
    description: {
      en: "A high-energy stop for coaster and zipline activities.",
      he: "עצירה אנרגטית לפעילויות רכבת הרים ואומגות.",
    },
  },
  {
    id: "x-centre",
    name: "X-Centre",
    category: "adventure",
    searchQuery: "X-Centre Chiang Mai Mae Rim Thailand",
    description: {
      en: "Adventure activities near Mae Rim at the start of the mountain section.",
      he: "פעילויות אקסטרים ליד מאה רים בתחילת קטע ההרים.",
    },
  },
  {
    id: "siam-insect-zoo",
    name: "Siam Insect Zoo",
    category: "family",
    searchQuery: "Siam Insect Zoo Chiang Mai Thailand",
    description: {
      en: "A compact educational stop for families and curious riders.",
      he: "עצירה חינוכית וקצרה למשפחות ולרוכבים סקרנים.",
    },
  },
  {
    id: "elephant-poopoopaper-park",
    name: "Elephant POOPOOPAPER Park",
    category: "family",
    searchQuery: "Elephant POOPOOPAPER Park Chiang Mai Thailand",
    description: {
      en: "A hands-on recycling experience near Mae Rim.",
      he: "חוויה מעשית בנושא מחזור ליד מאה רים.",
    },
  },
  {
    id: "ai-nara-cafe",
    name: "Ai Nara Cafe",
    category: "food",
    searchQuery: "Ai Nara Cafe Chiang Mai Thailand",
    description: {
      en: "A saved coffee stop for a slower start or finish.",
      he: "עצירת קפה שמורה לפתיחה או סיום רגועים יותר.",
    },
  },
  {
    id: "river-rock-cafe-hill",
    name: "River Rock Cafe Hill",
    category: "food",
    searchQuery: "River Rock Cafe Hill Samoeng Chiang Mai Thailand",
    description: {
      en: "A mountain cafe option when the route calls for a longer break.",
      he: "אפשרות לבית קפה הררי להפסקה ארוכה יותר במסלול.",
    },
  },
];

export function buildGoogleMapsSearchUrl(query: string): string {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);
  return url.toString();
}

export function filterSamoengAttractions(
  category: "all" | SamoengCategory
): SamoengAttraction[] {
  return category === "all"
    ? SAMOENG_ATTRACTIONS
    : SAMOENG_ATTRACTIONS.filter(
        attraction => attraction.category === category
      );
}
