/** Motorcycle tour options, shared so the server renders them for crawlers. */
export type Copy = { en: string; he: string };
export type TourOption = {
  id: "three" | "five" | "custom";
  title: Copy;
  summary: Copy;
  meta: Copy;
  details: Copy[];
};

export const MOTORCYCLE_TOUR_OPTIONS: TourOption[] = [
  {
    id: "three",
    title: {
      en: "Northern Thailand Loop · 3 Days",
      he: "לולאת צפון תאילנד · 3 ימים",
    },
    summary: {
      en: "Chiang Mai · Pai · Mae Hong Son · Chiang Mai. A compact, scenic loop with caves, villages and mountain roads.",
      he: "צ׳יאנג מאי · פאי · מאה הונג סון · צ׳יאנג מאי. לולאה קצרה עם מערות, כפרים וכבישי הרים.",
    },
    meta: {
      en: "3 days / 2 nights · about 550 km",
      he: "3 ימים / 2 לילות · כ-550 ק״מ",
    },
    details: [
      {
        en: "Day 1: Chiang Mai to Pai via Mok Fa Waterfall and Pai Canyon sunset.",
        he: "יום 1: מצ׳יאנג מאי לפאי דרך מפל מוק פאה ושקיעה בקניון פאי.",
      },
      {
        en: "Day 2: Pai to Mae Hong Son via Tham Lod Cave, Ban Jabo and a Long Neck Karen village boat ride.",
        he: "יום 2: מפאי למאה הונג סון דרך מערת תאם לוד, באן ג׳אבו ושיט לכפר קארן ארוך הצוואר.",
      },
      {
        en: "Day 3: Mae Hong Son to Chiang Mai through the Mae Hong Son Loop mountain roads.",
        he: "יום 3: ממאה הונג סון לצ׳יאנג מאי בכבישי ההרים של לולאת מאה הונג סון.",
      },
    ],
  },
  {
    id: "five",
    title: {
      en: "Ride Beyond Borders · 5 Days",
      he: "רוכבים מעבר לגבולות · 5 ימים",
    },
    summary: {
      en: "Chiang Mai · Mae Hong Son · Pai · Thaton · Chiang Rai. The complete Off Trail Thailand adventure.",
      he: "צ׳יאנג מאי · מאה הונג סון · פאי · תאטן · צ׳יאנג ראי. הרפתקת Off Trail Thailand המלאה.",
    },
    meta: {
      en: "5 days / 4 nights · approximately 1,115 km · 100% paved",
      he: "5 ימים / 4 לילות · כ-1,115 ק״מ · כבישים סלולים",
    },
    details: [
      {
        en: "Day 1 · Chiang Mai → Doi Inthanon → Mae Hong Son: Thailand’s highest peak (2,565 m), Wachirathan Waterfall and Mae Chaem. 240 km · 6–6.5 hours. Overnight: Fern Resort Mae Hong Son.",
        he: "יום 1 · צ׳יאנג מאי → דוי אינתנון → מאה הונג סון: הפסגה הגבוהה בתאילנד (2,565 מ׳), מפל וצ׳יראטאן ומאה צ׳אם. 240 ק״מ · 6–6.5 שעות. לינה: Fern Resort Mae Hong Son.",
      },
      {
        en: "Day 2 · Mae Hong Son → Pai: optional Long Neck Karen Village boat excursion, Tham Lod Cave bamboo raft and the mountain curves into Pai. 210 km · 4.5–5 hours. Overnight: The Quarter Pai.",
        he: "יום 2 · מאה הונג סון → פאי: שיט אופציונלי לכפר קארן ארוך הצוואר, רפסודת במבוק במערת תאם לוד וכבישי הרים לפאי. 210 ק״מ · 4.5–5 שעות. לינה: The Quarter Pai.",
      },
      {
        en: "Day 3 · Pai → Mae Taeng → Thaton: viewpoints, coffee, an ethical elephant sanctuary and Wat Thaton before sunset. 270 km · 6–6.5 hours. Overnight: Maekok River Village Resort.",
        he: "יום 3 · פאי → מאה טאנג → תאטן: תצפיות, קפה, מקלט פילים אתי ומקדש ואט תאטן לפני השקיעה. 270 ק״מ · 6–6.5 שעות. לינה: Maekok River Village Resort.",
      },
      {
        en: "Day 4 · Thaton → Doi Mae Salong → Golden Triangle → Chiang Rai: tea plantations, Chinese heritage, Mekong River boat excursion and borderland history. 200 km · 4–5 hours. Overnight: Diamond Park Inn Chiang Rai Resort.",
        he: "יום 4 · תאטן → דוי מאה סאלונג → משולש הזהב → צ׳יאנג ראי: מטעי תה, מורשת סינית, שיט במקונג והיסטוריית אזור הגבול. 200 ק״מ · 4–5 שעות. לינה: Diamond Park Inn Chiang Rai Resort.",
      },
      {
        en: "Day 5 · Chiang Rai → Wat Rong Khun → Chiang Mai: visit the White Temple, return the motorcycle and transfer to your hotel. 180–190 km · 3.5–4.5 hours. Expected arrival: around 15:00.",
        he: "יום 5 · צ׳יאנג ראי → ואט רונג קון → צ׳יאנג מאי: ביקור במקדש הלבן, החזרת האופנוע והעברה למלון. 180–190 ק״מ · 3.5–4.5 שעות. הגעה צפויה: בסביבות 15:00.",
      },
    ],
  },
  {
    id: "custom",
    title: { en: "Build Your Own Tour", he: "בנו את הטיול שלכם" },
    summary: {
      en: "Choose the days, roads, riding pace, stays and experiences that fit your group.",
      he: "בחרו את מספר הימים, הכבישים, קצב הרכיבה, הלינות והחוויות שמתאימים לקבוצה שלכם.",
    },
    meta: {
      en: "Flexible dates · route · pace · support",
      he: "תאריכים · מסלול · קצב · תמיכה גמישים",
    },
    details: [
      {
        en: "Combine the Mae Hong Son Loop, Pai, Doi Inthanon, Doi Mae Salong, Chiang Rai or other northern roads.",
        he: "שלבו את לולאת מאה הונג סון, פאי, דוי אינתנון, דוי מאה סאלונג, צ׳יאנג ראי או כבישים צפוניים אחרים.",
      },
      {
        en: "Tell us your riding level, preferred daily distance, hotel style, must-see places and support needs.",
        he: "ספרו לנו על רמת הרכיבה, המרחק היומי, סגנון המלונות, המקומות שחשוב לכם לראות וצרכי התמיכה.",
      },
      {
        en: "We will shape a personal route and confirm availability, inclusions and the final quotation with you.",
        he: "נבנה עבורכם מסלול אישי ונאשר איתכם זמינות, מה כלול והצעת מחיר סופית.",
      },
    ],
  },
];

export const MOTORCYCLE_HIGHLIGHTS: Copy[] = [
  { en: "More than 2,500 mountain curves", he: "יותר מ-2,500 פניות הרריות" },
  { en: "Doi Inthanon National Park", he: "הפארק הלאומי דוי אינתנון" },
  { en: "Tham Lod Cave bamboo rafting", he: "רפסודת במבוק במערת תאם לוד" },
  { en: "Long Neck Karen Village", he: "כפר קארן ארוך הצוואר" },
  { en: "Ethical elephant sanctuary", he: "מקלט פילים אתי" },
  { en: "Doi Mae Salong tea plantations", he: "מטעי התה של דוי מאה סאלונג" },
  { en: "Golden Triangle and Mekong boat trip", he: "משולש הזהב ושיט במקונג" },
  { en: "White Temple (Wat Rong Khun)", he: "המקדש הלבן (ואט רונג קון)" },
];
