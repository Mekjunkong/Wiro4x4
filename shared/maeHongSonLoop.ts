export type LocalizedCopy = { en: string; he: string };

export type MaeHongSonPace = "4" | "5" | "6";
export type MaeHongSonVehicle = "motorcycle" | "4x4";
export type MaeHongSonCategory =
  | "nature"
  | "culture"
  | "viewpoints"
  | "town-food"
  | "seasonal"
  | "detours";

export interface MaeHongSonStage {
  id: string;
  number: number;
  name: LocalizedCopy;
  route: LocalizedCopy;
  description: LocalizedCopy;
  origin: string;
  destination: string;
  mapLabel: LocalizedCopy;
}

export interface MaeHongSonPaceOption {
  id: MaeHongSonPace;
  label: LocalizedCopy;
  eyebrow: LocalizedCopy;
  summary: LocalizedCopy;
  days: LocalizedCopy[];
}

export interface MaeHongSonHighlight {
  id: string;
  name: LocalizedCopy;
  description: LocalizedCopy;
  category: MaeHongSonCategory;
  stageId: string;
  searchQuery: string;
  sourceUrl: string;
  lastVerified: string;
  liveCheckRequired: boolean;
  vehicleNote?: LocalizedCopy;
}

export interface MaeHongSonRouteMoment {
  id: string;
  image: string;
  title: LocalizedCopy;
  description: LocalizedCopy;
  alt: LocalizedCopy;
}

const GOOGLE_MAPS_DIRECTIONS_URL = "https://www.google.com/maps/dir/";
const GOOGLE_MAPS_SEARCH_URL = "https://www.google.com/maps/search/";

export function buildGoogleMapsDirectionsUrl(
  origin: string,
  destination: string,
  travelMode: "driving" | "two-wheeler" = "driving"
): string {
  const url = new URL(GOOGLE_MAPS_DIRECTIONS_URL);
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("travelmode", travelMode);
  return url.toString();
}

export function buildMaeHongSonSearchUrl(query: string): string {
  const url = new URL(GOOGLE_MAPS_SEARCH_URL);
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);
  return url.toString();
}

export const MAE_HONG_SON_STAGES: MaeHongSonStage[] = [
  {
    id: "mae-sariang",
    number: 1,
    name: { en: "The southern road", he: "הדרך הדרומית" },
    route: { en: "Chiang Mai → Mae Sariang", he: "צ׳יאנג מאי ← מאה סאריאנג" },
    description: {
      en: "Leave Chiang Mai on Highway 108 and let the road settle into forest, river valleys and the quieter rhythm of Mae Sariang.",
      he: "יוצאים מצ׳יאנג מאי בכביש 108 ונכנסים בהדרגה ליערות, לעמקי נהרות ולקצב השקט של מאה סאריאנג.",
    },
    origin: "Chiang Mai Thailand",
    destination: "Mae Sariang Mae Hong Son Thailand",
    mapLabel: { en: "Open stage 1", he: "פתחו את מקטע 1" },
  },
  {
    id: "khun-yuam",
    number: 2,
    name: { en: "Borderland history", he: "היסטוריה לאורך הגבול" },
    route: { en: "Mae Sariang → Khun Yuam", he: "מאה סאריאנג ← קון יואם" },
    description: {
      en: "Continue north through a less hurried section of the loop, with Khun Yuam as the cultural anchor and seasonal mountain detours nearby.",
      he: "ממשיכים צפונה בקטע רגוע יותר של הלולאה, עם קון יואם כעוגן תרבותי וסטיות הרריות עונתיות בקרבת מקום.",
    },
    origin: "Mae Sariang Mae Hong Son Thailand",
    destination: "Khun Yuam Mae Hong Son Thailand",
    mapLabel: { en: "Open stage 2", he: "פתחו את מקטע 2" },
  },
  {
    id: "mae-hong-son-town",
    number: 3,
    name: { en: "The valley capital", he: "בירת העמק" },
    route: { en: "Khun Yuam → Mae Hong Son", he: "קון יואם ← מאה הונג סון" },
    description: {
      en: "Follow Highway 108 into Mae Hong Son town, where hilltop temples and the lake become the natural pause point of the loop.",
      he: "ממשיכים בכביש 108 אל העיר מאה הונג סון, שבה מקדשים על ההר והאגם יוצרים נקודת עצירה טבעית במסלול.",
    },
    origin: "Khun Yuam Mae Hong Son Thailand",
    destination: "Mae Hong Son Thailand",
    mapLabel: { en: "Open stage 3", he: "פתחו את מקטע 3" },
  },
  {
    id: "northern-detours",
    number: 4,
    name: { en: "Northern detours", he: "סטיות צפוניות" },
    route: { en: "Mae Hong Son base day", he: "יום בסיס במאה הונג סון" },
    description: {
      en: "Use a slower day for Su Tong Pae, Ban Rak Thai or Pang Ung, choosing only what fits current access, weather and your pace.",
      he: "מקדישים יום רגוע לסו טונג פאה, באן ראק תאי או פאנג אונג, ובוחרים רק מה שמתאים לגישה, למזג האוויר ולקצב העדכניים.",
    },
    origin: "Mae Hong Son Thailand",
    destination: "Ban Rak Thai Mae Hong Son Thailand",
    mapLabel: { en: "Open northern detour", he: "פתחו את הסטייה הצפונית" },
  },
  {
    id: "pang-mapha-pai",
    number: 5,
    name: { en: "Caves and high ridges", he: "מערות ורכסים גבוהים" },
    route: {
      en: "Mae Hong Son → Pang Mapha → Pai",
      he: "מאה הונג סון ← פאנג מאפה ← פאי",
    },
    description: {
      en: "Climb toward Pang Mapha for cave country and mountain viewpoints before following the bends east into Pai.",
      he: "מטפסים לכיוון פאנג מאפה, אזור של מערות ותצפיות הרריות, ואז ממשיכים בפיתולים מזרחה אל פאי.",
    },
    origin: "Mae Hong Son Thailand",
    destination: "Pai Mae Hong Son Thailand",
    mapLabel: { en: "Open stage 5", he: "פתחו את מקטע 5" },
  },
  {
    id: "return-chiang-mai",
    number: 6,
    name: { en: "The road home", he: "הדרך חזרה" },
    route: { en: "Pai → Chiang Mai", he: "פאי ← צ׳יאנג מאי" },
    description: {
      en: "Return through the familiar mountain bends of Highway 1095, then reconnect with Highway 107 for Chiang Mai.",
      he: "חוזרים דרך פיתולי ההרים המוכרים של כביש 1095, ומתחברים לכביש 107 בדרך לצ׳יאנג מאי.",
    },
    origin: "Pai Mae Hong Son Thailand",
    destination: "Chiang Mai Thailand",
    mapLabel: { en: "Open stage 6", he: "פתחו את מקטע 6" },
  },
];

export const MAE_HONG_SON_PACES: MaeHongSonPaceOption[] = [
  {
    id: "4",
    label: { en: "4 days", he: "4 ימים" },
    eyebrow: { en: "Fast and focused", he: "מהיר וממוקד" },
    summary: {
      en: "For experienced road travelers who are comfortable with longer days and a short list of essential stops.",
      he: "למטיילי כביש מנוסים שנוח להם עם ימים ארוכים ורשימה קצרה של עצירות מרכזיות.",
    },
    days: [
      { en: "Chiang Mai → Mae Sariang", he: "צ׳יאנג מאי ← מאה סאריאנג" },
      { en: "Mae Sariang → Mae Hong Son", he: "מאה סאריאנג ← מאה הונג סון" },
      { en: "Mae Hong Son → Pai", he: "מאה הונג סון ← פאי" },
      { en: "Pai → Chiang Mai", he: "פאי ← צ׳יאנג מאי" },
    ],
  },
  {
    id: "5",
    label: { en: "5 days", he: "5 ימים" },
    eyebrow: { en: "Balanced loop", he: "לולאה מאוזנת" },
    summary: {
      en: "A practical balance of road time, Mae Hong Son culture, Tham Lod and the atmosphere of Pai.",
      he: "איזון מעשי בין זמן על הכביש, התרבות של מאה הונג סון, תאם לוד והאווירה של פאי.",
    },
    days: [
      { en: "Chiang Mai → Mae Sariang", he: "צ׳יאנג מאי ← מאה סאריאנג" },
      { en: "Mae Sariang → Mae Hong Son", he: "מאה סאריאנג ← מאה הונג סון" },
      {
        en: "Mae Hong Son and northern detours",
        he: "מאה הונג סון והסטיות הצפוניות",
      },
      {
        en: "Mae Hong Son → Tham Lod → Pai",
        he: "מאה הונג סון ← תאם לוד ← פאי",
      },
      { en: "Pai → Chiang Mai", he: "פאי ← צ׳יאנג מאי" },
    ],
  },
  {
    id: "6",
    label: { en: "6 days", he: "6 ימים" },
    eyebrow: { en: "WIRO recommended pace", he: "הקצב המומלץ של WIRO" },
    summary: {
      en: "The fullest expedition-atlas pace, with room for the western towns, a Mae Hong Son base day and fewer rushed decisions.",
      he: "קצב מלא בסגנון אטלס מסע, עם זמן לעיירות המערב, יום בסיס במאה הונג סון ופחות החלטות בלחץ.",
    },
    days: MAE_HONG_SON_STAGES.map(stage => stage.route),
  },
];

export const MAE_HONG_SON_CATEGORIES: Array<{
  id: "all" | MaeHongSonCategory;
  label: LocalizedCopy;
}> = [
  { id: "all", label: { en: "All highlights", he: "כל המקומות" } },
  { id: "nature", label: { en: "Nature", he: "טבע" } },
  { id: "culture", label: { en: "Culture", he: "תרבות" } },
  { id: "viewpoints", label: { en: "Viewpoints", he: "תצפיות" } },
  { id: "town-food", label: { en: "Towns & food", he: "עיירות ואוכל" } },
  { id: "seasonal", label: { en: "Seasonal", he: "עונתי" } },
  { id: "detours", label: { en: "Optional detours", he: "סטיות אופציונליות" } },
];

const TAT_MAE_HONG_SON =
  "https://www.tourismthailand.org/Articles/mae-hong-son";
const TAT_NATURAL_ATTRACTIONS =
  "https://www.tourismthailand.org/Articles/4-natural-tourist-attractions-in-mae-hong-son";
const TAT_ESCAPE =
  "https://www.tourismthailand.org/Articles/mae-hong-son-pai-a-summary-escape-to-the-valley-of-ethnic-groups-2";
const TAT_MUST_DO =
  "https://thai.tourismthailand.org/Articles/5-must-do-in-mae-hong-son";
const TAT_TEN_STOPS =
  "https://thai.tourismthailand.org/Articles/10-%E0%B9%80%E0%B8%97%E0%B9%88-%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%A7-%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%AE%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%AD%E0%B8%99";

export const MAE_HONG_SON_HIGHLIGHTS: MaeHongSonHighlight[] = [
  {
    id: "mae-sariang",
    name: { en: "Mae Sariang", he: "מאה סאריאנג" },
    description: {
      en: "A small riverside town that gives the southern side of the loop a slower, local beginning.",
      he: "עיירה קטנה על הנהר שמעניקה לצד הדרומי של הלולאה התחלה מקומית ורגועה יותר.",
    },
    category: "town-food",
    stageId: "mae-sariang",
    searchQuery: "Mae Sariang Mae Hong Son Thailand",
    sourceUrl: TAT_MAE_HONG_SON,
    lastVerified: "2026-09-11",
    liveCheckRequired: false,
  },
  {
    id: "khun-yuam-memorial",
    name: { en: "Khun Yuam memorial", he: "המוזיאון בקון יואם" },
    description: {
      en: "A focused history stop that adds context to the remote western road and its wartime connections.",
      he: "עצירת היסטוריה ממוקדת שמוסיפה הקשר לדרך המערבית המרוחקת ולקשריה מתקופת המלחמה.",
    },
    category: "culture",
    stageId: "khun-yuam",
    searchQuery: "Thai-Japan Friendship Memorial Hall Khun Yuam Thailand",
    sourceUrl: TAT_MAE_HONG_SON,
    lastVerified: "2026-09-11",
    liveCheckRequired: true,
  },
  {
    id: "doi-mae-u-kho",
    name: { en: "Doi Mae U Kho", he: "דוי מאה או קו" },
    description: {
      en: "A mountain detour known for seasonal Mexican sunflower fields; include it only when the bloom and access suit the trip.",
      he: "סטייה הררית הידועה בשדות חמניות מקסיקניות עונתיים; משלבים אותה רק כשהפריחה והגישה מתאימות לטיול.",
    },
    category: "seasonal",
    stageId: "khun-yuam",
    searchQuery: "Doi Mae U Kho Khun Yuam Mae Hong Son Thailand",
    sourceUrl: TAT_TEN_STOPS,
    lastVerified: "2026-09-11",
    liveCheckRequired: true,
  },
  {
    id: "doi-kong-mu",
    name: { en: "Wat Phra That Doi Kong Mu", he: "ואט פרה תאט דוי קונג מו" },
    description: {
      en: "A hilltop temple above Mae Hong Son town, valued for the setting and broad valley outlook.",
      he: "מקדש על ראש גבעה מעל העיר מאה הונג סון, עם אווירה מיוחדת ותצפית רחבה על העמק.",
    },
    category: "viewpoints",
    stageId: "mae-hong-son-town",
    searchQuery: "Wat Phra That Doi Kong Mu Mae Hong Son Thailand",
    sourceUrl: TAT_TEN_STOPS,
    lastVerified: "2026-09-11",
    liveCheckRequired: false,
  },
  {
    id: "jong-kham-jong-klang",
    name: { en: "Jong Kham & Jong Klang", he: "ג׳ונג קאם וג׳ונג קלאנג" },
    description: {
      en: "The lakeside temple pair gives Mae Hong Son town a distinctive evening and early-morning atmosphere.",
      he: "צמד המקדשים שעל שפת האגם מעניק לעיר מאה הונג סון אווירה מיוחדת בערב ובשעות הבוקר המוקדמות.",
    },
    category: "culture",
    stageId: "mae-hong-son-town",
    searchQuery: "Wat Jong Kham Wat Jong Klang Mae Hong Son Thailand",
    sourceUrl: TAT_ESCAPE,
    lastVerified: "2026-09-11",
    liveCheckRequired: false,
  },
  {
    id: "su-tong-pae",
    name: { en: "Su Tong Pae Bridge", he: "גשר סו טונג פאה" },
    description: {
      en: "A bamboo bridge across rice fields and countryside north of town, best treated as a quiet cultural stop.",
      he: "גשר במבוק מעל שדות אורז וכפרים מצפון לעיר, שמתאים כעצירה תרבותית שקטה.",
    },
    category: "culture",
    stageId: "northern-detours",
    searchQuery: "Su Tong Pae Bridge Mae Hong Son Thailand",
    sourceUrl: TAT_NATURAL_ATTRACTIONS,
    lastVerified: "2026-09-11",
    liveCheckRequired: false,
  },
  {
    id: "ban-rak-thai",
    name: { en: "Ban Rak Thai", he: "באן ראק תאי" },
    description: {
      en: "A lakeside tea village near the Myanmar border and a worthwhile detour when the itinerary has breathing room.",
      he: "כפר תה על שפת אגם סמוך לגבול מיאנמר, סטייה כדאית כשהמסלול מאפשר זמן רגוע.",
    },
    category: "detours",
    stageId: "northern-detours",
    searchQuery: "Ban Rak Thai Mae Hong Son Thailand",
    sourceUrl: TAT_MUST_DO,
    lastVerified: "2026-09-11",
    liveCheckRequired: true,
  },
  {
    id: "pang-ung",
    name: { en: "Pang Ung", he: "פאנג אונג" },
    description: {
      en: "A reservoir and pine-forest setting that needs a live access check before it is added to the day.",
      he: "מאגר מים בנוף של יער אורנים שדורש בדיקת גישה עדכנית לפני שמוסיפים אותו ליום.",
    },
    category: "detours",
    stageId: "northern-detours",
    searchQuery: "Pang Ung Mae Hong Son Thailand",
    sourceUrl: TAT_TEN_STOPS,
    lastVerified: "2026-09-11",
    liveCheckRequired: true,
  },
  {
    id: "tham-lod",
    name: { en: "Tham Lod Cave", he: "מערת תאם לוד" },
    description: {
      en: "A major cave system near Pang Mapha. Guide, raft and operating conditions should be checked before arrival.",
      he: "מערכת מערות מרכזית ליד פאנג מאפה. יש לבדוק מראש מדריך, רפסודה ותנאי פעילות.",
    },
    category: "nature",
    stageId: "pang-mapha-pai",
    searchQuery: "Tham Lod Cave Pang Mapha Mae Hong Son Thailand",
    sourceUrl: TAT_NATURAL_ATTRACTIONS,
    lastVerified: "2026-09-11",
    liveCheckRequired: true,
  },
  {
    id: "ban-jabo",
    name: { en: "Ban Jabo viewpoint", he: "תצפית באן ג׳אבו" },
    description: {
      en: "A mountain-village viewpoint above layered valleys on the Pang Mapha side of the loop.",
      he: "תצפית מכפר הררי מעל עמקים מדורגים בצד של פאנג מאפה.",
    },
    category: "viewpoints",
    stageId: "pang-mapha-pai",
    searchQuery: "Ban Jabo viewpoint Pang Mapha Thailand",
    sourceUrl: "https://www.tourismthailand.org/Articles/5-viewpoints-en",
    lastVerified: "2026-09-11",
    liveCheckRequired: true,
  },
  {
    id: "pai-canyon",
    name: { en: "Pai Canyon", he: "קניון פאי" },
    description: {
      en: "An exposed ridge landscape near Pai; enjoy the viewpoint and treat narrow trails with care.",
      he: "נוף רכסים חשוף ליד פאי; נהנים מהתצפית ונזהרים בשבילי ההליכה הצרים.",
    },
    category: "viewpoints",
    stageId: "pang-mapha-pai",
    searchQuery: "Pai Canyon Mae Hong Son Thailand",
    sourceUrl: TAT_NATURAL_ATTRACTIONS,
    lastVerified: "2026-09-11",
    liveCheckRequired: false,
  },
  {
    id: "pai-town",
    name: { en: "Pai town", he: "העיירה פאי" },
    description: {
      en: "A lively final overnight stop with food, cafes and an easy base for a slower morning before Chiang Mai.",
      he: "תחנת לילה תוססת אחרונה עם אוכל ובתי קפה, ובסיס נוח לבוקר רגוע לפני החזרה לצ׳יאנג מאי.",
    },
    category: "town-food",
    stageId: "pang-mapha-pai",
    searchQuery: "Pai Walking Street Mae Hong Son Thailand",
    sourceUrl: TAT_ESCAPE,
    lastVerified: "2026-09-11",
    liveCheckRequired: false,
  },
];

export const MAE_HONG_SON_ROUTE_MOMENTS: MaeHongSonRouteMoment[] = [
  {
    id: "mountain-road",
    image: "/images/optimized/motorcycle-touring-illustration.webp",
    title: { en: "Roads above the mist", he: "כבישים מעל הערפל" },
    description: {
      en: "Long mountain transitions are the heart of the loop, not empty space between attractions.",
      he: "קטעי ההרים הארוכים הם לב המסלול, לא זמן ריק בין אטרקציות.",
    },
    alt: {
      en: "Motorcyclists riding a winding mountain road in Northern Thailand",
      he: "רוכבי אופנוע בדרך הררית מפותלת בצפון תאילנד",
    },
  },
  {
    id: "cave-country",
    image: "/images/optimized/cave_boat.webp",
    title: { en: "Cave-country passage", he: "מעבר בארץ המערות" },
    description: {
      en: "The Pang Mapha chapter changes the rhythm from open road to river cave and limestone country.",
      he: "הפרק של פאנג מאפה משנה את הקצב מכביש פתוח למערות נהר ונופי גיר.",
    },
    alt: {
      en: "Small rafts crossing a river cave in Northern Thailand",
      he: "רפסודות קטנות חוצות מערת נהר בצפון תאילנד",
    },
  },
  {
    id: "village-light",
    image: "/images/optimized/mountain_village_view.webp",
    title: { en: "Village light", he: "אור בכפרים" },
    description: {
      en: "Slow down for the smaller settlements that make the western mountains feel inhabited and personal.",
      he: "מאטים בכפרים הקטנים שמעניקים להרי המערב תחושה חיה ואישית.",
    },
    alt: {
      en: "Warm morning light over a forest village in Northern Thailand",
      he: "אור בוקר חם מעל כפר מיוער בצפון תאילנד",
    },
  },
  {
    id: "quiet-water",
    image: "/images/optimized/river_sunrise.webp",
    title: { en: "Quiet-water mornings", he: "בקרים של מים שקטים" },
    description: {
      en: "An extra day creates room for early lakeside and riverside moments without racing the next road.",
      he: "יום נוסף מאפשר בקרים שקטים ליד אגם או נהר בלי למהר לכביש הבא.",
    },
    alt: {
      en: "Soft sunrise reflected on water in Northern Thailand",
      he: "זריחה רכה משתקפת במים בצפון תאילנד",
    },
  },
];

export const MAE_HONG_SON_VEHICLE_NOTES: Record<
  MaeHongSonVehicle,
  LocalizedCopy[]
> = {
  motorcycle: [
    {
      en: "Best for experienced riders comfortable with repeated mountain bends and changing surfaces.",
      he: "מתאים לרוכבים מנוסים שנוח להם עם רצף פיתולי הרים ומשטחים משתנים.",
    },
    {
      en: "Keep luggage compact and protect time for fuel, weather and fatigue checks.",
      he: "שמרו על ציוד קומפקטי והשאירו זמן לבדיקות דלק, מזג אוויר ועייפות.",
    },
  ],
  "4x4": [
    {
      en: "A private 4x4 gives families and mixed-pace groups more shelter and room for luggage.",
      he: "רכב 4x4 פרטי מעניק למשפחות ולקבוצות בקצב מגוון יותר הגנה ומקום לציוד.",
    },
    {
      en: "Long mountain days still require realistic stop choices and an alert driver.",
      he: "גם ברכב, ימי הרים ארוכים דורשים בחירת עצירות מציאותית ונהג ערני.",
    },
  ],
};

export function filterMaeHongSonHighlights(
  category: "all" | MaeHongSonCategory
): MaeHongSonHighlight[] {
  return category === "all"
    ? MAE_HONG_SON_HIGHLIGHTS
    : MAE_HONG_SON_HIGHLIGHTS.filter(
        highlight => highlight.category === category
      );
}
