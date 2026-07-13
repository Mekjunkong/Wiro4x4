import type { WhatsAppSourceCode } from "@shared/whatsappAttribution";
import { COMMERCIAL_SEO_BY_INTENT } from "@shared/commercialSeo";

export type CommercialIntent = "kosher" | "hebrewGuide" | "family";
export type CommercialLanguage = "en" | "he";

export interface LocalizedCopy {
  en: string;
  he: string;
}

export interface CommercialLandingContent {
  intent: CommercialIntent;
  paths: Record<CommercialLanguage, string>;
  sourceCodes: Record<CommercialLanguage, WhatsAppSourceCode>;
  metaTitle: LocalizedCopy;
  metaDescription: LocalizedCopy;
  eyebrow: LocalizedCopy;
  h1: LocalizedCopy;
  intro: LocalizedCopy;
  audience: LocalizedCopy;
  heroImage: string;
  heroAlt: LocalizedCopy;
  duration: LocalizedCopy;
  startingPrice: LocalizedCopy;
  pickup: LocalizedCopy;
  groupSize: LocalizedCopy;
  familySuitability: LocalizedCopy;
  planningBoundary: LocalizedCopy;
  itinerary: Array<{ title: LocalizedCopy; detail: LocalizedCopy }>;
  included: LocalizedCopy[];
  excluded: LocalizedCopy[];
  relatedTours: Array<{ href: string; label: LocalizedCopy }>;
  whatsappMessage: LocalizedCopy;
  whatsappLabel: LocalizedCopy;
}

const sharedIncluded: LocalizedCopy[] = [
  {
    en: "Private 4x4 vehicle, driver-guide, fuel, and basic tour insurance",
    he: "רכב 4x4 פרטי, נהג-מדריך, דלק וביטוח טיול בסיסי",
  },
  {
    en: "Route planning and pickup from Chiang Mai city centre or most nearby areas",
    he: "תכנון מסלול ואיסוף ממרכז צ׳אנג מאי או מרוב האזורים הקרובים",
  },
  {
    en: "Flexible stops and a pace agreed for your private group",
    he: "עצירות גמישות וקצב שמותאם מראש לקבוצה הפרטית שלכם",
  },
];

const sharedExcluded: LocalizedCopy[] = [
  {
    en: "Attraction or national-park entry fees unless your quote says otherwise",
    he: "דמי כניסה לאטרקציות או לפארקים לאומיים, אלא אם נכתב אחרת בהצעה",
  },
  {
    en: "Meals, accommodation, and services not confirmed in your written plan",
    he: "ארוחות, לינה ושירותים שלא אושרו בתכנית הכתובה שלכם",
  },
  {
    en: "Pickup outside the standard area; we confirm any extra transport cost first",
    he: "איסוף מחוץ לאזור הרגיל; כל עלות הסעה נוספת תאושר מראש",
  },
];

export const COMMERCIAL_LANDING_CONTENT: Record<
  CommercialIntent,
  CommercialLandingContent
> = {
  kosher: {
    intent: "kosher",
    paths: COMMERCIAL_SEO_BY_INTENT.kosher.paths,
    sourceCodes: { en: "KOSHER-PAGE-EN", he: "KOSHER-PAGE-HE" },
    metaTitle: {
      en: COMMERCIAL_SEO_BY_INTENT.kosher.metadata.en.title,
      he: COMMERCIAL_SEO_BY_INTENT.kosher.metadata.he.title,
    },
    metaDescription: {
      en: COMMERCIAL_SEO_BY_INTENT.kosher.metadata.en.description,
      he: COMMERCIAL_SEO_BY_INTENT.kosher.metadata.he.description,
    },
    eyebrow: {
      en: "Kosher-aware expedition planning",
      he: "תכנון טיול שמתחשב בכשרות",
    },
    h1: {
      en: "Kosher-Friendly Tours in Chiang Mai",
      he: "טיולים כשרים בצ׳אנג מאי",
    },
    intro: {
      en: "A private 4x4 day for Jewish and Israeli travelers who want food, timing, and route decisions checked before booking—not improvised on the road.",
      he: "יום 4x4 פרטי למטיילים יהודים וישראלים שרוצים לבדוק מראש את האוכל, הזמנים והמסלול — ולא לאלתר תוך כדי הטיול.",
    },
    audience: {
      en: "Best for families and small private groups who need kosher-friendly options, prayer breaks, or Shabbat-sensitive scheduling.",
      he: "מתאים למשפחות ולקבוצות פרטיות קטנות שצריכות אפשרויות ידידותיות לכשרות, הפסקות לתפילה או תכנון שמתחשב בשבת.",
    },
    heroImage: COMMERCIAL_SEO_BY_INTENT.kosher.heroImage,
    heroAlt: {
      en: "Packed kosher-friendly meal options prepared for a WIRO 4x4 day trip",
      he: "אפשרויות אוכל ארוזות וידידותיות לכשרות לטיול יום של WIRO 4x4",
    },
    duration: { en: "5–10 hours", he: "5–10 שעות" },
    startingPrice: {
      en: "From ฿3,500 per private vehicle; the route, group, date, and food plan determine the final quote.",
      he: "החל מ־3,500 באט לרכב פרטי; המסלול, גודל הקבוצה, התאריך ותכנון האוכל קובעים את ההצעה הסופית.",
    },
    pickup: {
      en: "Chiang Mai city-centre hotels and most nearby areas; ask us to confirm an address outside the usual zone.",
      he: "מלונות במרכז צ׳אנג מאי ורוב האזורים הקרובים; לכתובת מחוץ לאזור הרגיל נבדוק מראש.",
    },
    groupSize: {
      en: "1–6 guests per vehicle. Larger groups can use multiple vehicles after a custom check.",
      he: "1–6 מטיילים ברכב. לקבוצה גדולה יותר אפשר לתאם כמה רכבים לאחר בדיקה פרטנית.",
    },
    familySuitability: {
      en: "Children are welcome. We adjust walking, breaks, and route length to ages and mobility shared before confirmation.",
      he: "ילדים מוזמנים. נתאים הליכה, הפסקות ואורך מסלול לגילים ולניידות שתמסרו לפני האישור.",
    },
    planningBoundary: {
      en: "Kosher-friendly does not mean every remote stop is certified. Tell us your kashrut level. We confirm feasible providers, sealed items, or packed-meal options. We do not drive during Shabbat; timing and Hebrew-guide availability must be confirmed for your date.",
      he: "ידידותי לכשרות אינו אומר שכל עצירה מרוחקת מחזיקה תעודת כשרות. ספרו לנו את רמת הכשרות, ונאשר ספקים אפשריים, מוצרים סגורים או ארוחה ארוזה. איננו נוסעים בשבת; יש לאשר מראש את הזמנים ואת זמינות המדריך בעברית.",
    },
    itinerary: [
      {
        title: { en: "Mae Kampong", he: "מאה קמפונג" },
        detail: {
          en: "Mountain village, viewpoints, and flexible food timing on a 5–7 hour day.",
          he: "כפר הררי, תצפיות ותזמון אוכל גמיש ביום של 5–7 שעות.",
        },
      },
      {
        title: { en: "Doi Inthanon", he: "דוי אינתנון" },
        detail: {
          en: "A 7–8 hour mountain day with a packed-meal plan agreed before departure.",
          he: "יום הררי של 7–8 שעות עם תכנון ארוחה ארוזה שסוגרים לפני היציאה.",
        },
      },
      {
        title: {
          en: "Sticky Waterfalls & Mae Rim",
          he: "המפלים הדביקים ומאה רים",
        },
        detail: {
          en: "A family-paced 7–8 hour route with stops chosen around your food and mobility needs.",
          he: "מסלול של 7–8 שעות בקצב משפחתי, עם עצירות לפי צרכי האוכל והניידות שלכם.",
        },
      },
    ],
    included: sharedIncluded,
    excluded: sharedExcluded,
    relatedTours: [
      {
        href: "/tours/doi-inthanon-roof-of-thailand",
        label: {
          en: "Doi Inthanon route details",
          he: "פרטי מסלול דוי אינתנון",
        },
      },
      {
        href: "/tours/mae-kampong-hidden-village",
        label: { en: "Mae Kampong route details", he: "פרטי מסלול מאה קמפונג" },
      },
    ],
    whatsappMessage: {
      en: "Hi WIRO 4x4, we are planning a kosher-friendly private tour. Dates: __ Group size and ages: __ Pickup hotel: __ Kashrut level: __ Shabbat or Hebrew needs: __",
      he: "שלום WIRO 4x4, אנחנו מתכננים טיול פרטי ידידותי לכשרות. תאריכים: __ מספר מטיילים וגילים: __ מלון לאיסוף: __ רמת כשרות: __ צרכי שבת או עברית: __",
    },
    whatsappLabel: {
      en: "Check kosher-tour availability on WhatsApp",
      he: "בדיקת זמינות לטיול כשר בוואטסאפ",
    },
  },
  hebrewGuide: {
    intent: "hebrewGuide",
    paths: COMMERCIAL_SEO_BY_INTENT.hebrewGuide.paths,
    sourceCodes: { en: "HEBREW-GUIDE-EN", he: "HEBREW-GUIDE-HE" },
    metaTitle: {
      en: COMMERCIAL_SEO_BY_INTENT.hebrewGuide.metadata.en.title,
      he: COMMERCIAL_SEO_BY_INTENT.hebrewGuide.metadata.he.title,
    },
    metaDescription: {
      en: COMMERCIAL_SEO_BY_INTENT.hebrewGuide.metadata.en.description,
      he: COMMERCIAL_SEO_BY_INTENT.hebrewGuide.metadata.he.description,
    },
    eyebrow: {
      en: "Local routes, explained in Hebrew",
      he: "מסלולים מקומיים, בהסבר בעברית",
    },
    h1: {
      en: "Hebrew-Speaking Guide in Chiang Mai",
      he: "מדריך דובר עברית בצ׳אנג מאי",
    },
    intro: {
      en: "Plan a private Northern Thailand day with clear Hebrew communication from the first route decision to the final pickup time.",
      he: "תכננו יום פרטי בצפון תאילנד עם תקשורת ברורה בעברית — מבחירת המסלול ועד שעת האיסוף הסופית.",
    },
    audience: {
      en: "For Israeli families, couples, and small groups who want local context and practical decisions explained in Hebrew.",
      he: "למשפחות ישראליות, זוגות וקבוצות קטנות שרוצים הקשר מקומי והחלטות מעשיות בהסבר בעברית.",
    },
    heroImage: COMMERCIAL_SEO_BY_INTENT.hebrewGuide.heroImage,
    heroAlt: {
      en: "WIRO guide beside a 4x4 vehicle in Northern Thailand",
      he: "המדריך WIRO ליד רכב 4x4 בצפון תאילנד",
    },
    duration: { en: "5–10 hours", he: "5–10 שעות" },
    startingPrice: {
      en: "Private day routes start at ฿3,500; confirm Hebrew-guide availability and the final quote for your date.",
      he: "מסלולי יום פרטיים מתחילים ב־3,500 באט; יש לאשר זמינות מדריך בעברית והצעה סופית לתאריך שלכם.",
    },
    pickup: {
      en: "Chiang Mai city centre and most nearby hotels, with the exact time set after the route is chosen.",
      he: "מרכז צ׳אנג מאי ורוב המלונות הקרובים; השעה המדויקת נקבעת אחרי בחירת המסלול.",
    },
    groupSize: {
      en: "1–6 guests per vehicle; multiple vehicles require advance coordination.",
      he: "1–6 מטיילים ברכב; כמה רכבים דורשים תיאום מראש.",
    },
    familySuitability: {
      en: "Suitable for families when we know the children's ages, walking comfort, and preferred pace before the day.",
      he: "מתאים למשפחות כשאנחנו יודעים מראש את גילי הילדים, נוחות ההליכה והקצב המועדף.",
    },
    planningBoundary: {
      en: "Hebrew support is subject to guide availability, so confirm it for your exact date. Kosher-friendly meals and Shabbat-sensitive timing are separate planning items and are included only when agreed in writing.",
      he: "השירות בעברית תלוי בזמינות המדריך, ולכן צריך לאשר אותו לתאריך המדויק. אוכל ידידותי לכשרות ותכנון שמתחשב בשבת הם סעיפים נפרדים ונכללים רק לאחר אישור כתוב.",
    },
    itinerary: [
      {
        title: { en: "Doi Suthep-Pui", he: "דוי סוטפ-פוי" },
        detail: {
          en: "A 5–7 hour mountain and viewpoint route.",
          he: "מסלול הרים ותצפיות של 5–7 שעות.",
        },
      },
      {
        title: { en: "Mae Kampong", he: "מאה קמפונג" },
        detail: {
          en: "Village stories, mountain roads, and stops explained in Hebrew.",
          he: "סיפורי כפר, דרכי הרים ועצירות בהסבר בעברית.",
        },
      },
      {
        title: { en: "Samoeng Loop", he: "לולאת סמואנג" },
        detail: {
          en: "A longer scenic circuit for groups comfortable with an 8–10 hour day.",
          he: "מסלול נופי ארוך לקבוצות שמתאים להן יום של 8–10 שעות.",
        },
      },
    ],
    included: sharedIncluded,
    excluded: sharedExcluded,
    relatedTours: [
      {
        href: "/tours/doi-suthep-pui-beyond-temple",
        label: {
          en: "Doi Suthep-Pui route details",
          he: "פרטי מסלול דוי סוטפ-פוי",
        },
      },
      {
        href: "/tours/samoeng-loop-mountain-circuit",
        label: {
          en: "Samoeng Loop route details",
          he: "פרטי מסלול לולאת סמואנג",
        },
      },
    ],
    whatsappMessage: {
      en: "Hi WIRO 4x4, we need a Hebrew-speaking guide. Dates: __ Group size and ages: __ Pickup hotel: __ Route ideas: __ Kosher or Shabbat needs: __",
      he: "שלום WIRO 4x4, אנחנו צריכים מדריך דובר עברית. תאריכים: __ מספר מטיילים וגילים: __ מלון לאיסוף: __ רעיונות למסלול: __ צרכי כשרות או שבת: __",
    },
    whatsappLabel: {
      en: "Check Hebrew-guide availability on WhatsApp",
      he: "בדיקת זמינות מדריך בעברית בוואטסאפ",
    },
  },
  family: {
    intent: "family",
    paths: COMMERCIAL_SEO_BY_INTENT.family.paths,
    sourceCodes: { en: "FAMILY-PAGE-EN", he: "FAMILY-PAGE-HE" },
    metaTitle: {
      en: COMMERCIAL_SEO_BY_INTENT.family.metadata.en.title,
      he: COMMERCIAL_SEO_BY_INTENT.family.metadata.he.title,
    },
    metaDescription: {
      en: COMMERCIAL_SEO_BY_INTENT.family.metadata.en.description,
      he: COMMERCIAL_SEO_BY_INTENT.family.metadata.he.description,
    },
    eyebrow: {
      en: "An expedition dossier for your family",
      he: "תיק מסע למשפחה שלכם",
    },
    h1: {
      en: "Private Family 4x4 Tours in Chiang Mai",
      he: "טיולי 4x4 פרטיים למשפחות בצ׳אנג מאי",
    },
    intro: {
      en: "Choose a real Northern Thailand route, then shape the walking, stops, food, and timing around your family's ages and energy.",
      he: "בחרו מסלול אמיתי בצפון תאילנד, ואז נתאים את ההליכה, העצירות, האוכל והזמנים לגילים ולאנרגיה של המשפחה.",
    },
    audience: {
      en: "For parents, children, grandparents, and multigenerational groups who prefer one private vehicle and a flexible day.",
      he: "להורים, ילדים, סבים וקבוצות רב־דוריות שמעדיפים רכב פרטי אחד ויום גמיש.",
    },
    heroImage: COMMERCIAL_SEO_BY_INTENT.family.heroImage,
    heroAlt: {
      en: "Family travelers beside a WIRO 4x4 vehicle in Northern Thailand",
      he: "משפחה מטיילת ליד רכב WIRO 4x4 בצפון תאילנד",
    },
    duration: { en: "5–10 hours", he: "5–10 שעות" },
    startingPrice: {
      en: "From ฿3,500 per private vehicle. Group size, date, route, and extras determine the final quote.",
      he: "החל מ־3,500 באט לרכב פרטי. גודל הקבוצה, התאריך, המסלול והתוספות קובעים את ההצעה הסופית.",
    },
    pickup: {
      en: "Pickup and drop-off at Chiang Mai city-centre hotels and most surrounding areas.",
      he: "איסוף והחזרה במלונות במרכז צ׳אנג מאי וברוב האזורים הסמוכים.",
    },
    groupSize: {
      en: "1–6 guests per vehicle. Ask for a multiple-vehicle plan for 7 or more.",
      he: "1–6 מטיילים ברכב. לקבוצה של 7 ומעלה בקשו תכנון עם כמה רכבים.",
    },
    familySuitability: {
      en: "All ages can join, but route suitability depends on walking, road comfort, weather, and the youngest traveler's needs.",
      he: "אפשר לצרף את כל הגילים, אבל התאמת המסלול תלויה בהליכה, בנוחות בדרכי שטח, במזג האוויר ובצרכים של המטייל הצעיר ביותר.",
    },
    planningBoundary: {
      en: "We confirm route conditions, child seating requests, attraction availability, kosher-friendly food, Hebrew support, and Shabbat timing before booking. None should be assumed until written into your plan.",
      he: "לפני ההזמנה נאשר תנאי מסלול, בקשות למושבי ילדים, זמינות אטרקציות, אוכל ידידותי לכשרות, תמיכה בעברית וזמני שבת. אין להניח שסעיף כלשהו כלול עד שהוא מופיע בתכנית הכתובה.",
    },
    itinerary: [
      {
        title: { en: "Easy village day", he: "יום כפר רגוע" },
        detail: {
          en: "Mae Kampong in 5–7 hours, with short stops and a family pace.",
          he: "מאה קמפונג ב־5–7 שעות, עם עצירות קצרות וקצב משפחתי.",
        },
      },
      {
        title: { en: "Waterfall day", he: "יום מפלים" },
        detail: {
          en: "Sticky Waterfalls and Mae Rim in 7–8 hours, adjusted to walking confidence.",
          he: "המפלים הדביקים ומאה רים ב־7–8 שעות, בהתאמה לביטחון בהליכה.",
        },
      },
      {
        title: { en: "Mountain discovery", he: "יום גילוי בהרים" },
        detail: {
          en: "Doi Inthanon in 7–8 hours for families comfortable with a fuller day.",
          he: "דוי אינתנון ב־7–8 שעות למשפחות שמתאים להן יום מלא יותר.",
        },
      },
    ],
    included: sharedIncluded,
    excluded: sharedExcluded,
    relatedTours: [
      {
        href: "/tours/mae-kampong-hidden-village",
        label: {
          en: "See the Mae Kampong family route",
          he: "ראו את מסלול מאה קמפונג למשפחות",
        },
      },
      {
        href: "/tours/maerim-sticky-waterfalls",
        label: {
          en: "See the Sticky Waterfalls route",
          he: "ראו את מסלול המפלים הדביקים",
        },
      },
    ],
    whatsappMessage: {
      en: "Hi WIRO 4x4, we are planning a private family tour. Dates: __ Adults and children's ages: __ Pickup hotel: __ Route ideas: __ Food, mobility, or language needs: __",
      he: "שלום WIRO 4x4, אנחנו מתכננים טיול משפחתי פרטי. תאריכים: __ מבוגרים וגילי ילדים: __ מלון לאיסוף: __ רעיונות למסלול: __ צרכי אוכל, ניידות או שפה: __",
    },
    whatsappLabel: {
      en: "Check family-tour availability on WhatsApp",
      he: "בדיקת זמינות לטיול משפחתי בוואטסאפ",
    },
  },
};

export function copyFor(copy: LocalizedCopy, language: CommercialLanguage) {
  return copy[language];
}
