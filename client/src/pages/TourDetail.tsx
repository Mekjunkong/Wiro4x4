import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoldDivider } from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Clock,
  Users,
  Utensils,
  Calendar,
  Check,
  ArrowLeft,
  MessageCircle,
  MapPin,
  Backpack,
  Sun,
  Lightbulb,
  ArrowRight,
  BookOpen,
  XCircle,
} from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TourSocialProof } from "@/components/TourSocialProof";
import { TourFAQ } from "@/components/TourFAQ";
import { OptimizedImage } from "@/components/OptimizedImage";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

/** Hardcoded fallback data matching Tours.tsx + Pricing.tsx */
const FALLBACK_TOURS: Record<
  string,
  {
    name: string;
    nameHe: string;
    description: string;
    descriptionHe: string;
    duration: string;
    durationHe: string;
    difficulty: "easy" | "moderate" | "challenging";
    price: number;
    imageUrl: string;
    isKosher: number;
    isPrivate: number;
    isShabbatOk: number;
    groupMinSize: number;
    groupMaxSize: number;
    included: { en: string; he: string }[];
    highlights: string[];
    highlightsHe: string[];
    itineraryData: {
      title: string;
      titleHe: string;
      description: string;
      descriptionHe: string;
    }[];
  }
> = {
  "doi-inthanon-roof-of-thailand": {
    name: "Doi Inthanon — Roof of Thailand",
    nameHe: "דוי אינתנון — גג תאילנד",
    description:
      "Stand on the highest point in Thailand, then descend into a world most tourists never see — cloud forests where orchids grow on mossy trees, a hidden nature trail that ends at a Karen village coffee farm, and waterfalls you'll have entirely to yourself. The Pha Dok Siew trail is the secret alternative to the crowded Kew Mae Pan, winding through rice terraces to Mae Klang Luang village where coffee is brewed from beans grown on the slopes you just walked past.",
    descriptionHe:
      "עמדו על הנקודה הגבוהה ביותר בתאילנד, ואז צללו לעולם שרוב התיירים לא רואים — יערות ענן שבהם סחלבים גדלים על עצים מכוסי טחב, שביל טבע נסתר שמסתיים בחוות קפה של כפר קארן, ומפלים שיהיו רק שלכם. שביל פה דוק סיו הוא החלופה הסודית לשביל קיו מאה פאן הצפוף, מתפתל דרך טרסות אורז עד לכפר מאה קלאנג לואנג שבו מכינים קפה מפולים שגדלים על המדרונות שזה עתה עברתם.",
    duration: "7-8 hours",
    durationHe: "7-8 שעות",
    difficulty: "moderate",
    price: 5000,
    imageUrl: "/images/optimized/mountain_sunset.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      {
        en: "English/Hebrew-speaking guide",
        he: "מדריך דובר אנגלית/עברית",
      },
      {
        en: "National park entrance fees",
        he: "דמי כניסה לפארק הלאומי",
      },
      { en: "Village coffee tasting", he: "טעימת קפה בכפר" },
      { en: "Lunch at Karen village", he: "ארוחת צהריים בכפר קארן" },
      { en: "Drinking water & snacks", he: "מי שתייה וחטיפים" },
      {
        en: "Kosher meal arrangements (advance notice)",
        he: "הסדרי ארוחות כשרות (בהודעה מראש)",
      },
    ],
    highlights: [
      "Stand on Thailand's highest peak (2,565m)",
      "Pha Dok Siew trail — the secret cloud forest hike most tourists never find",
      "Coffee tasting at a Karen village farm",
      "Walk through a mossy cloud forest boardwalk",
      "300+ bird species in the park",
    ],
    highlightsHe: [
      "עמדו על הפסגה הגבוהה ביותר בתאילנד (2,565 מ')",
      "שביל פה דוק סיו — טיול יער הענן הסודי שרוב התיירים לא מוצאים",
      "טעימת קפה בחוות כפר קארן",
      "הליכה על גשר עץ ביער ענן מכוסה טחב",
      "300+ מיני ציפורים בפארק",
    ],
    itineraryData: [
      {
        title: "07:30 — Pickup & Depart Chiang Mai",
        titleHe: "07:30 — איסוף ויציאה מצ'יאנג מאי",
        description:
          "Head south on Hwy 108 toward Doi Inthanon National Park. 1.5h scenic drive through foothills.",
        descriptionHe:
          "נסיעה דרומה בכביש 108 לכיוון הפארק הלאומי דוי אינתנון. נסיעה נופית של שעה וחצי דרך גבעות.",
      },
      {
        title: "09:00 — Wachirathan Waterfall",
        titleHe: "09:00 — מפל וצ'יראטאן",
        description:
          "Arrive before the tour buses. 80m cascade with a hidden viewpoint behind the waterfall that most visitors miss.",
        descriptionHe:
          "הגעה לפני אוטובוסי התיירים. מפל בגובה 80 מ' עם נקודת תצפית נסתרת מאחורי המפל שרוב המבקרים מפספסים.",
      },
      {
        title: "10:00 — Pha Dok Siew Nature Trail",
        titleHe: "10:00 — שביל הטבע פה דוק סיו",
        description:
          "The secret alternative to the crowded Kew Mae Pan trail. 2.5km hike through cloud forest, past rice terraces, ending at Mae Klang Luang village — a Karen community that grows and roasts their own coffee. Coffee tasting at the source.",
        descriptionHe:
          'החלופה הסודית לשביל קיו מאה פאן הצפוף. טיול של 2.5 ק"מ דרך יער ענן, ליד טרסות אורז, עד לכפר מאה קלאנג לואנג — קהילת קארן שמגדלת וקולה קפה משלה. טעימת קפה במקור.',
      },
      {
        title: "12:00 — Lunch at Mae Klang Luang",
        titleHe: "12:00 — ארוחת צהריים במאה קלאנג לואנג",
        description:
          "Community-run lunch at the village. Traditional northern Thai food cooked by Karen villagers. Kosher-friendly options available with advance notice.",
        descriptionHe:
          "ארוחת צהריים קהילתית בכפר. אוכל תאילנדי צפוני מסורתי שמבשלים תושבי הכפר הקארנים. אפשרויות כשרות בהודעה מראש.",
      },
      {
        title: "13:00 — Twin Pagodas & Summit",
        titleHe: "13:00 — הפגודות התאומות והפסגה",
        description:
          "Royal pagodas at 2,565m with panoramic mountain views — best visited after midday when morning mist clears. Quick photo at Thailand's highest point.",
        descriptionHe:
          "פגודות מלכותיות בגובה 2,565 מ' עם נוף הרים פנורמי — הכי טוב לבקר אחרי הצהריים כשערפל הבוקר מתפזר. צילום מהיר בנקודה הגבוהה בתאילנד.",
      },
      {
        title: "13:30 — Ang Ka Luang Cloud Forest",
        titleHe: "13:30 — יער הענן אנג קא לואנג",
        description:
          "360m boardwalk through a moss-draped cloud forest — one of Thailand's last remaining sphagnum bogs. Bird watchers' paradise with 300+ species.",
        descriptionHe:
          "גשר עץ באורך 360 מ' דרך יער ענן עטוף טחב — אחת מביצות הספגנום האחרונות בתאילנד. גן עדן לצפרים עם 300+ מינים.",
      },
      {
        title: "14:30 — Hmong Market & Return",
        titleHe: "14:30 — שוק המונג וחזרה",
        description:
          "Roadside market run by local Hmong families. Fresh strawberries (Nov-Feb), passion fruit, handwoven textiles. Scenic descent back to Chiang Mai by 16:30.",
        descriptionHe:
          "שוק בצד הדרך שמנהלות משפחות המונג מקומיות. תותים טריים (נוב'-פבר'), פסיפלורה, אריגים ארוגים ביד. ירידה נופית חזרה לצ'יאנג מאי עד 16:30.",
      },
    ],
  },
  "mae-kampong-hidden-village": {
    name: "Mae Kampong — Hidden Mountain Village",
    nameHe: "מאה קמפונג — הכפר הנסתר בהרים",
    description:
      "A 700-year-old village clinging to a misty mountainside, where time moves at the pace of dripping coffee and flowing streams. Search for wild gibbons in the forest, learn the ancient art of Miang fermented tea from the villagers who invented it, and hike a trail only locals know to a hidden panoramic viewpoint. This award-winning eco-tourism village pioneered community-based sustainable tourism in Thailand.",
    descriptionHe:
      "כפר בן 700 שנה שנאחז בצלע הר מעורפל, שם הזמן זורם בקצב של קפה מטפטף ונחלים זורמים. חפשו גיבוני בר ביער, למדו את אומנות תה המיאנג המותסס מהכפריים שהמציאו אותו, וטיילו בשביל שרק מקומיים מכירים עד לתצפית פנורמית נסתרת. כפר אקו-תיירות חלוצי שזכה בפרסים על תיירות קהילתית בת-קיימא בתאילנד.",
    duration: "5-7 hours",
    durationHe: "5-7 שעות",
    difficulty: "easy",
    price: 3500,
    imageUrl: "/images/optimized/mountain_village_view.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      {
        en: "English/Hebrew-speaking guide",
        he: "מדריך דובר אנגלית/עברית",
      },
      { en: "Miang tea tasting experience", he: "חוויית טעימת תה מיאנג" },
      { en: "Coffee roasting activity", he: "פעילות קליית קפה" },
      { en: "Homestay lunch", he: "ארוחת צהריים בבית מארח" },
      { en: "Drinking water & snacks", he: "מי שתייה וחטיפים" },
      {
        en: "Kosher meal arrangements (advance notice)",
        he: "הסדרי ארוחות כשרות (בהודעה מראש)",
      },
    ],
    highlights: [
      "Search for wild gibbons in the forest",
      "Learn the ancient art of Miang fermented tea — from the families who invented it",
      "Roast your own coffee beans at a Royal Project farm",
      "Hike to Kew Fin panoramic viewpoint (most visitors miss this)",
      "1,000-year-old giant Yang Na tree",
      "Authentic homestay lunch, not a restaurant",
    ],
    highlightsHe: [
      "חפשו גיבוני בר ביער",
      "למדו את אומנות תה המיאנג המותסס — מהמשפחות שהמציאו אותו",
      "קלו פולי קפה משלכם בחוות פרויקט מלכותי",
      "טיילו לתצפית קיו פין הפנורמית (רוב המבקרים מפספסים)",
      "עץ יאנג נא ענק בן 1,000 שנה",
      "ארוחת צהריים אותנטית בבית מארח, לא מסעדה",
    ],
    itineraryData: [
      {
        title: "08:30 — Pickup & Drive East",
        titleHe: "08:30 — איסוף ונסיעה מזרחה",
        description:
          "Depart Chiang Mai through the foothills. The road climbs into dense forest as you approach the village at 1,300m elevation.",
        descriptionHe:
          "יציאה מצ'יאנג מאי דרך הגבעות. הכביש מטפס ליער צפוף כשמתקרבים לכפר בגובה 1,300 מ'.",
      },
      {
        title: "09:30 — Gibbon Spotting Trek",
        titleHe: "09:30 — טרק תצפית גיבונים",
        description:
          "Short 30-min forest walk before the village. Rehabilitated gibbons were released here — listen for their calls, spot them swinging through the canopy. Your guide knows their territories.",
        descriptionHe:
          "הליכת יער קצרה של 30 דקות לפני הכפר. גיבונים ששוקמו שוחררו כאן — הקשיבו לקריאות שלהם, צפו בהם מתנדנדים בצמרות. המדריך מכיר את הטריטוריות שלהם.",
      },
      {
        title: "10:15 — Mae Kampong Village",
        titleHe: "10:15 — כפר מאה קמפונג",
        description:
          "Walk through the village on bamboo walkways over streams. Visit the 1,000-year-old giant Yang Na tree — a sacred landmark of the community.",
        descriptionHe:
          "הליכה בכפר על גשרי במבוק מעל נחלים. ביקור בעץ יאנג נא הענק בן 1,000 שנה — ציון דרך קדוש של הקהילה.",
      },
      {
        title: "10:45 — Miang Tea Experience",
        titleHe: "10:45 — חוויית תה מיאנג",
        description:
          "Sit with a local family and learn to make Miang — fermented tea leaves unique to northern Thailand. This isn't a tourist demonstration; these families have been fermenting tea for centuries. Taste the difference between 1-week, 1-month, and 1-year fermented leaves.",
        descriptionHe:
          "שבו עם משפחה מקומית ולמדו להכין מיאנג — עלי תה מותססים ייחודיים לצפון תאילנד. זו לא הדגמה תיירותית; המשפחות האלה מתססות תה במשך מאות שנים. טעמו את ההבדל בין עלים מותססים שבוע, חודש ושנה.",
      },
      {
        title: "11:30 — Teen Tok Royal Project",
        titleHe: "11:30 — פרויקט מלכותי טין טוק",
        description:
          "Visit the sustainable agriculture station. Coffee roasting demonstration — beans grown on the slopes you just walked past. Roast your own small batch to take home.",
        descriptionHe:
          "ביקור בתחנת החקלאות הבת-קיימא. הדגמת קליית קפה — פולים שגדלים על המדרונות שעברתם. קלו מנה קטנה משלכם לקחת הביתה.",
      },
      {
        title: "12:15 — Homestay Lunch",
        titleHe: "12:15 — ארוחת צהריים בבית מארח",
        description:
          "Traditional Lanna meal prepared by a local host family. Eat in their home, not a restaurant. Authentic flavors you won't find anywhere else.",
        descriptionHe:
          "ארוחת לאנה מסורתית שהכינה משפחה מארחת מקומית. אוכלים בביתם, לא במסעדה. טעמים אותנטיים שלא תמצאו בשום מקום אחר.",
      },
      {
        title: "13:15 — Kew Fin Viewpoint Hike",
        titleHe: "13:15 — טיול לתצפית קיו פין",
        description:
          "2km hike up through forest to Kew Fin — a cliff-edge panoramic viewpoint over the entire Chiang Mai valley. On clear days you can see Doi Suthep across the valley. Most visitors never leave the village; this is the payoff for those who do.",
        descriptionHe:
          "טיול של 2 ק\"מ למעלה דרך היער לקיו פין — תצפית פנורמית על שפת צוק מעל כל עמק צ'יאנג מאי. בימים בהירים אפשר לראות את דוי סוטפ מעבר לעמק. רוב המבקרים לא עוזבים את הכפר; זה הפרס למי שכן.",
      },
      {
        title: "15:00 — Return to Chiang Mai",
        titleHe: "15:00 — חזרה לצ'יאנג מאי",
        description:
          "Descend through the forested mountains. Optional stop at the hidden waterfall trail (3km, locals only) if time permits. Back in Chiang Mai by 16:30.",
        descriptionHe:
          "ירידה דרך ההרים המיוערים. עצירה אופציונלית בשביל המפל הנסתר (3 ק\"מ, רק מקומיים מכירים) אם יש זמן. חזרה לצ'יאנג מאי עד 16:30.",
      },
    ],
  },
  "maerim-sticky-waterfalls": {
    name: "Maerim & Sticky Waterfalls",
    nameHe: "מאה רים ומפלים דביקים",
    description:
      "Climb UP a waterfall — no ropes, no harness, just limestone so sticky your bare feet grip like glue. Then walk 20 meters above the forest floor on a sky-high canopy walkway, hike to waterfall tiers that 95% of visitors never reach, and explore a hill tribe village down an unmarked dirt road. The Queen Sirikit Botanic Garden's 400m canopy walkway is one of Thailand's best-kept secrets, and the upper tiers of Mae Sa Waterfall reward those who go beyond the crowded lower levels.",
    descriptionHe:
      "טפסו למעלה על מפל מים — בלי חבלים, בלי רתמה, רק אבן גיר דביקה כל כך שכפות הרגליים שלכם נאחזות כמו דבק. אחר כך לכו 20 מטר מעל רצפת היער על גשר צמרות עצים, טיילו לקומות מפל ש-95% מהמבקרים לא מגיעים אליהן, וגלו כפר שבטי הרים בסוף דרך עפר לא מסומנת. גשר הצמרות באורך 400 מ' בגן הבוטני של המלכה סיריקיט הוא אחד הסודות הכי שמורים של תאילנד.",
    duration: "7-8 hours",
    durationHe: "7-8 שעות",
    difficulty: "easy",
    price: 4500,
    imageUrl: "/images/optimized/sticky_waterfalls.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      {
        en: "English/Hebrew-speaking guide",
        he: "מדריך דובר אנגלית/עברית",
      },
      {
        en: "National park entrance fees",
        he: "דמי כניסה לפארק הלאומי",
      },
      {
        en: "Botanical garden entrance fee",
        he: "דמי כניסה לגן הבוטני",
      },
      {
        en: "Riverside lunch",
        he: "ארוחת צהריים על גדת הנהר",
      },
      {
        en: "Village coffee tasting",
        he: "טעימות קפה בכפר",
      },
      { en: "Drinking water", he: "מי שתייה" },
      {
        en: "Kosher meal arrangements (advance notice)",
        he: "הסדרי ארוחות כשרות (בהזמנה מראש)",
      },
    ],
    highlights: [
      "Climb UP a waterfall barefoot — the Sticky Waterfall experience",
      "400m canopy walkway 20m above the forest",
      "Upper tiers of Mae Sa Waterfall (most tourists stop at tier 3)",
      "Off-road to an authentic hill tribe village",
      "World-class botanical garden",
    ],
    highlightsHe: [
      "טפסו למעלה על מפל יחפים — חוויית המפל הדביק",
      "גשר צמרות באורך 400 מ' בגובה 20 מ' מעל היער",
      "קומות עליונות של מפל מאה סה (רוב התיירים עוצרים בקומה 3)",
      "נסיעת שטח לכפר שבטי הרים אותנטי",
      "גן בוטני ברמה עולמית",
    ],
    itineraryData: [
      {
        title: "08:00 — Pickup & Head North",
        titleHe: "08:00 — איסוף ונסיעה צפונה",
        description:
          "Depart Chiang Mai heading north on Hwy 107 toward Mae Rim district.",
        descriptionHe: "יציאה מצ'יאנג מאי צפונה בכביש 107 לכיוון מחוז מאה רים.",
      },
      {
        title: "08:45 — Queen Sirikit Botanic Garden",
        titleHe: "08:45 — הגן הבוטני של המלכה סיריקיט",
        description:
          "Thailand's premier botanical garden. Head straight for the 400m canopy walkway — 20m above the forest floor, swaying through the treetops. Most visitors skip this because they don't know it exists. World-class glasshouse collection.",
        descriptionHe:
          "הגן הבוטני המוביל בתאילנד. ישר לגשר הצמרות באורך 400 מ' — 20 מ' מעל רצפת היער, מתנדנדים בין צמרות העצים. רוב המבקרים מדלגים כי הם לא יודעים שזה קיים. אוסף חממות ברמה עולמית.",
      },
      {
        title: "10:15 — Mae Sa Waterfall Upper Tiers",
        titleHe: "10:15 — הקומות העליונות של מפל מאה סה",
        description:
          "10-tier waterfall inside Doi Suthep-Pui National Park. Skip the crowded lower levels — your guide takes you on the upper trail to tiers 7-10. Forest pools, zero crowds. The waterfall gets more dramatic the higher you climb.",
        descriptionHe:
          "מפל בן 10 קומות בפארק הלאומי דוי סוטפ-פוי. דלגו על הקומות התחתונות הצפופות — המדריך לוקח אתכם בשביל העליון לקומות 7-10. בריכות יער, אפס קהל. המפל נהיה דרמטי יותר ככל שמטפסים.",
      },
      {
        title: "11:30 — Off-Road to Hill Tribe Village",
        titleHe: "11:30 — נסיעת שטח לכפר שבטי הרים",
        description:
          "Switch to 4x4 dirt track above the Mae Sa valley. Visit a Hmong village that has no tourist market — just daily life, agriculture, and mountain views. Your guide translates.",
        descriptionHe:
          "מעבר לדרך עפר ב-4x4 מעל עמק מאה סה. ביקור בכפר המונג שאין בו שוק תיירותי — רק חיי יום-יום, חקלאות ונופי הרים. המדריך מתרגם.",
      },
      {
        title: "12:30 — Lunch in Mae Rim Valley",
        titleHe: "12:30 — ארוחת צהריים בעמק מאה רים",
        description:
          "Riverside restaurant with local northern Thai food and mountain views.",
        descriptionHe: "מסעדה ליד הנהר עם אוכל תאילנדי צפוני מקומי ונופי הרים.",
      },
      {
        title: "14:15 — Bua Tong Sticky Waterfall",
        titleHe: "14:15 — מפל בואה טונג הדביק",
        description:
          "The highlight. A mineral-rich limestone waterfall you can climb barefoot — the surface is rough and grippy like sandpaper. Walk straight up the flowing water, 100m to the top. Completely unique natural phenomenon. Bring a swimsuit!",
        descriptionHe:
          "השיא של היום. מפל אבן גיר עשיר במינרלים שאפשר לטפס עליו יחף — המשטח מחוספס ואוחז כמו נייר זכוכית. לכו ישר למעלה דרך המים הזורמים, 100 מ' עד הפסגה. תופעת טבע ייחודית לחלוטין. קחו בגד ים!",
      },
      {
        title: "15:30 — Return to Chiang Mai",
        titleHe: "15:30 — חזרה לצ'יאנג מאי",
        description:
          "Scenic route back through the countryside. Back in Chiang Mai by 16:30.",
        descriptionHe: "מסלול נופי חזרה דרך הכפר. חזרה לצ'יאנג מאי עד 16:30.",
      },
    ],
  },
  "doi-suthep-pui-beyond-temple": {
    name: "Doi Suthep-Pui — Beyond the Temple",
    nameHe: "דוי סוטפ-פוי — מעבר למקדש",
    description:
      "Everyone drives up to the famous temple. You'll hike the original Monk's Trail through jungle to get there — then keep going where the tourists turn back. Deep into the national park, past a Hmong village most outsiders never see, to a hidden coffee village at the end of a dirt track and a waterfall in total solitude. The Monk's Trail is the ancient pilgrimage path monks have walked for centuries, through bamboo forest and across streams.",
    descriptionHe:
      "כולם נוסעים למעלה למקדש המפורסם. אתם תעלו בשביל הנזירים המקורי דרך הג'ונגל — ואז תמשיכו הלאה, לשם שהתיירים כבר לא מגיעים. עמוק בפארק הלאומי, דרך כפר המונג שרוב הזרים לא רואים, עד לכפר קפה נסתר בסוף דרך עפר ומפל מים בבדידות מוחלטת. שביל הנזירים הוא שביל העלייה לרגל העתיק שנזירים הלכו בו במשך מאות שנים, דרך יער במבוק וחציית נחלים.",
    duration: "5-7 hours",
    durationHe: "5-7 שעות",
    difficulty: "easy",
    price: 3500,
    imageUrl: "/images/optimized/doi_suthep_golden_chedi.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      {
        en: "English/Hebrew-speaking guide",
        he: "מדריך דובר אנגלית/עברית",
      },
      { en: "National park entrance fee", he: "דמי כניסה לפארק הלאומי" },
      { en: "Temple entrance", he: "כניסה למקדש" },
      {
        en: "Coffee tasting at Ban Kun Chang Kian",
        he: "טעימת קפה בבאן קון צ'אנג קיאן",
      },
      { en: "Lunch at coffee village", he: "ארוחת צהריים בכפר הקפה" },
      { en: "Drinking water & snacks", he: "מי שתייה וחטיפים" },
      {
        en: "Kosher meal arrangements (advance notice)",
        he: "הסדרי ארוחות כשרות (בהודעה מראש)",
      },
    ],
    highlights: [
      "Hike the ancient Monk's Trail through jungle to the temple",
      "Continue past the temple where 99% of tourists turn back",
      "Visit the original Hmong village (not the tourist market)",
      "4x4 to a hidden coffee village down a dirt track",
      "Secluded waterfall hike — likely just you",
    ],
    highlightsHe: [
      "טיילו בשביל הנזירים העתיק דרך הג'ונגל למקדש",
      "המשיכו מעבר למקדש לאן ש-99% מהתיירים חוזרים",
      "בקרו בכפר ההמונג המקורי (לא השוק התיירותי)",
      "נסיעת 4x4 לכפר קפה נסתר בסוף דרך עפר",
      "טיול למפל מבודד — כנראה רק אתם שם",
    ],
    itineraryData: [
      {
        title: "08:00 — Pickup & Drive to Doi Suthep",
        titleHe: "08:00 — איסוף ונסיעה לדוי סוטפ",
        description:
          "Short drive to the base of Doi Suthep mountain, just west of Chiang Mai.",
        descriptionHe: "נסיעה קצרה לבסיס הר דוי סוטפ, ממש מערבית לצ'יאנג מאי.",
      },
      {
        title: "08:30 — Monk's Trail Hike",
        titleHe: "08:30 — טיול שביל הנזירים",
        description:
          "Start at the hidden trailhead near Chiang Mai Zoo. 1.5km jungle hike on the original pilgrimage path monks have walked for centuries. Pass through bamboo forest, cross streams, spot forest birds. Arrive at the temple from behind — the way it was meant to be approached.",
        descriptionHe:
          "התחלה בנקודת השביל הנסתרת ליד גן החיות של צ'יאנג מאי. טיול ג'ונגל של 1.5 ק\"מ בשביל העלייה לרגל המקורי. עוברים דרך יער במבוק, חוצים נחלים, צופים בציפורי יער. מגיעים למקדש מאחור — כמו שתמיד היה צריך להגיע אליו.",
      },
      {
        title: "09:30 — Wat Phra That Doi Suthep",
        titleHe: "09:30 — ואט פרה טאט דוי סוטפ",
        description:
          "Brief temple visit before the bus crowds arrive. Golden chedi, panoramic city views, sacred atmosphere.",
        descriptionHe:
          "ביקור קצר במקדש לפני שהמוני האוטובוסים מגיעים. צ'די זהוב, נוף פנורמי על העיר, אווירה קדושה.",
      },
      {
        title: "10:15 — Deep into the National Park",
        titleHe: "10:15 — עמוק לתוך הפארק הלאומי",
        description:
          "This is where 99% of tourists turn back. You continue deeper into Doi Suthep-Pui National Park on a winding mountain road past pine forests.",
        descriptionHe:
          "כאן 99% מהתיירים חוזרים. אתם ממשיכים עמוק יותר לפארק הלאומי דוי סוטפ-פוי בכביש הרים מתפתל בין יערות אורנים.",
      },
      {
        title: "10:45 — Doi Pui Hmong Village",
        titleHe: "10:45 — כפר המונג דוי פוי",
        description:
          "Skip the tourist market at the entrance. Your guide takes you to the original village behind it — traditional wooden houses, small opium museum, elderly Hmong women in full traditional dress. A community living here for generations.",
        descriptionHe:
          "דלגו על השוק התיירותי בכניסה. המדריך לוקח אתכם לכפר המקורי מאחוריו — בתי עץ מסורתיים, מוזיאון אופיום קטן, נשים המונג מבוגרות בלבוש מסורתי מלא. קהילה שחיה כאן דורות.",
      },
      {
        title: "12:00 — Ban Kun Chang Kian Coffee Village",
        titleHe: "12:00 — כפר הקפה באן קון צ'אנג קיאן",
        description:
          "4x4 down a dirt track past the Doi Pui campground. A hidden coffee village that few tourists know exists. Taste single-origin arabica grown and roasted right here at 1,400m. Simple, authentic lunch at the farm.",
        descriptionHe:
          "נסיעת 4x4 בדרך עפר אחרי מחנה דוי פוי. כפר קפה נסתר שמעט תיירים יודעים שקיים. טעמו ערביקה מזן יחיד שגדל ונקלה כאן בגובה 1,400 מ'. ארוחת צהריים פשוטה ואותנטית בחווה.",
      },
      {
        title: "13:30 — Tad Mork Waterfall",
        titleHe: "13:30 — מפל טאד מורק",
        description:
          "1.5km trail through forest to this secluded waterfall beyond Doi Pui. You'll likely have it completely to yourself. Return to Chiang Mai by 15:30.",
        descriptionHe:
          "שביל של 1.5 ק\"מ דרך יער למפל המבודד הזה מעבר לדוי פוי. סביר שתהיו שם לגמרי לבד. חזרה לצ'יאנג מאי עד 15:30.",
      },
    ],
  },
  "mae-wang-jungle-wilderness": {
    name: "Mae Wang — Jungle & River Wilderness",
    nameHe: "מאה וואנג — ג'ונגל ונהרות פראיים",
    description:
      "This is the real off-road day. Jungle trails that only 4x4s can handle, river crossings, a sandstone canyon that rivals Arizona, an ethical elephant encounter in Karen clothing, and bamboo rafting through silent forest. End the day at a hidden waterfall with a natural swimming pool — and not another tourist in sight. Mae Wang district is one of Chiang Mai's best-kept secrets for genuine off-road adventure.",
    descriptionHe:
      "זה יום השטח האמיתי. שבילי ג'ונגל שרק רכבי 4x4 יכולים לעבור, חציית נהרות, קניון אבן חול שמתחרה עם אריזונה, מפגש אתי עם פילים בלבוש קארן, ושייט במבוק דרך יער שקט. סיימו את היום במפל נסתר עם בריכת שחייה טבעית — ובלי תייר אחר באופק. מחוז מאה וואנג הוא אחד הסודות הכי שמורים של צ'יאנג מאי להרפתקת שטח אמיתית.",
    duration: "8-9 hours",
    durationHe: "8-9 שעות",
    difficulty: "challenging",
    price: 5500,
    imageUrl: "/images/optimized/elephant_encounter.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 0,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      {
        en: "English/Hebrew-speaking guide",
        he: "מדריך דובר אנגלית/עברית",
      },
      { en: "Elephant sanctuary fee", he: "דמי כניסה למקלט פילים" },
      { en: "Bamboo rafting", he: "שייט במבוק" },
      { en: "Karen village lunch", he: "ארוחת צהריים בכפר קארן" },
      {
        en: "National park entrance fees",
        he: "דמי כניסה לפארק הלאומי",
      },
      { en: "Drinking water & snacks", he: "מי שתייה וחטיפים" },
      {
        en: "Kosher meal arrangements (advance notice)",
        he: "הסדרי ארוחות כשרות (בהודעה מראש)",
      },
    ],
    highlights: [
      'Pha Chor "Grand Canyon" — dramatic sandstone formations',
      "Real 4x4 off-road through jungle with river crossings",
      "Ethical elephant experience in Karen village",
      "Bamboo rafting through silent forest",
      "Hidden waterfall with natural swimming pool",
      "Visit a hilltop temple accessible only by 4x4",
    ],
    highlightsHe: [
      'פה-צ\'ור "הגרנד קניון" — תצורות אבן חול דרמטיות',
      "שטח אמיתי ב-4x4 דרך ג'ונגל עם חציית נהרות",
      "חוויית פילים אתית בכפר קארן",
      "שייט במבוק דרך יער שקט",
      "מפל נסתר עם בריכת שחייה טבעית",
      "ביקור במקדש על פסגת גבעה שנגיש רק ב-4x4",
    ],
    itineraryData: [
      {
        title: "07:30 — Pickup & Head South",
        titleHe: "07:30 — איסוף ונסיעה דרומה",
        description:
          "Depart Chiang Mai heading south toward Mae Wang district. 1.5h drive through rural countryside.",
        descriptionHe:
          "יציאה מצ'יאנג מאי דרומה לכיוון מחוז מאה וואנג. נסיעה של שעה וחצי דרך אזורים כפריים.",
      },
      {
        title: "09:00 — Pha Chor Grand Canyon",
        titleHe: "09:00 — הגרנד קניון פה-צ'ור",
        description:
          "Ancient sandstone pillars and cliffs formed by millions of years of erosion. Dramatic rust-colored formations rising from the forest floor. Quiet, uncrowded — most tourists have never heard of this place.",
        descriptionHe:
          "עמודי אבן חול וצוקים עתיקים שנוצרו על ידי מיליוני שנים של שחיקה. תצורות בצבע חלודה דרמטיות שמתרוממות מרצפת היער. שקט, לא צפוף — רוב התיירים מעולם לא שמעו על המקום.",
      },
      {
        title: "10:00 — Off-Road to Karen Village",
        titleHe: "10:00 — נסיעת שטח לכפר קארן",
        description:
          "Switch to serious 4x4 trails. River crossings, jungle tracks, steep climbs through dense forest. This is what the vehicle was built for.",
        descriptionHe:
          "מעבר לשבילי 4x4 רציניים. חציית נהרות, מסלולי ג'ונגל, טיפוסים תלולים דרך יער צפוף. בשביל זה הרכב נבנה.",
      },
      {
        title: "10:45 — Karen Hill Tribe Village",
        titleHe: "10:45 — כפר שבט ההרים קארן",
        description:
          "Meet the Pa Ka Yor (Karen) people. Watch traditional backstrap weaving, learn about their animist-Buddhist beliefs, see how they live alongside the forest.",
        descriptionHe:
          "פגשו את העם הפה קא יור (קארן). צפו באריגת רצועת גב מסורתית, למדו על האמונות האנימיסטיות-בודהיסטיות שלהם, ראו איך הם חיים לצד היער.",
      },
      {
        title: "11:15 — Ethical Elephant Experience",
        titleHe: "11:15 — חוויית פילים אתית",
        description:
          "Change into Karen clothing. Feed and walk with rescued elephants in their forest habitat — no riding, no chains. Learn about each elephant's rescue story from the Karen mahouts who care for them.",
        descriptionHe:
          "החליפו לבגדי קארן. האכילו ולכו עם פילים שניצלו בבית הגידול הטבעי שלהם — בלי רכיבה, בלי שרשראות. שמעו את סיפור ההצלה של כל פיל מפי מטפלי הקארן.",
      },
      {
        title: "12:30 — Bamboo Rafting",
        titleHe: "12:30 — שייט במבוק",
        description:
          "Board a bamboo raft and float down the Wang River. 45 minutes through jungle, listening to birds and water. Your guide poles the raft.",
        descriptionHe:
          "עלו על רפסודת במבוק ושוטו במורד נהר וואנג. 45 דקות דרך ג'ונגל, מקשיבים לציפורים ולמים. המדריך מוליך את הרפסודה.",
      },
      {
        title: "13:15 — Karen Village Lunch",
        titleHe: "13:15 — ארוחת צהריים בכפר קארן",
        description:
          "Traditional Karen meal — sticky rice, jungle vegetables, river fish. Eaten on a bamboo platform over the river.",
        descriptionHe:
          "ארוחת קארן מסורתית — אורז דביק, ירקות ג'ונגל, דגי נהר. אוכלים על במת במבוק מעל הנהר.",
      },
      {
        title: "14:00 — Hidden Waterfall Hike",
        titleHe: "14:00 — טיול למפל הנסתר",
        description:
          "2-3km trail through forest to a secluded waterfall with a natural swimming pool. Zero foot traffic. Time to swim and relax.",
        descriptionHe:
          'שביל של 2-3 ק"מ דרך היער למפל מבודד עם בריכת שחייה טבעית. אפס תנועה. זמן לשחות ולהירגע.',
      },
      {
        title: "15:30 — Wat Doi Sapphanyu & Return",
        titleHe: "15:30 — ואט דוי סאפאניו וחזרה",
        description:
          "Hidden hilltop temple — 4x4 access only. Panoramic valley views. A local meditation spot, not a tourist attraction. Back in Chiang Mai by 17:00.",
        descriptionHe:
          "מקדש נסתר על פסגת גבעה — נגיש רק ב-4x4. נוף פנורמי על העמק. מקום מדיטציה מקומי, לא אטרקציה תיירותית. חזרה לצ'יאנג מאי עד 17:00.",
      },
    ],
  },
  "samoeng-loop-mountain-circuit": {
    name: "Samoeng Loop — The Mountain Circuit",
    nameHe: "לולאת סמאנג — המעגל ההררי",
    description:
      "A 100km mountain circuit through Chiang Mai's green lung — past one of Thailand's last wooden Lanna temples, up to a terraced hilltop farm where you'll pick strawberries above the clouds, through forest roads to a Hmong village, and ending at a lakeside bamboo hut as the sun sets over the mountains. The Nong Hoi Royal Project at Mon Jam replaced opium farming with organic agriculture over 40 years ago, and Wat Ton Kwen is a 1858 wooden masterpiece most Chiang Mai residents don't even know exists.",
    descriptionHe:
      "מעגל הרים של 100 ק\"מ דרך הריאה הירוקה של צ'יאנג מאי — ליד אחד ממקדשי העץ האחרונים בסגנון לאנה, למעלה לחווה מדורגת על פסגת הר שם תקטפו תותים מעל העננים, דרך כבישי יער לכפר המונג, ולסיום בבקתת במבוק על שפת אגם בשקיעה מעל ההרים. הפרויקט המלכותי נונג הוי במון ג'אם החליף גידול אופיום בחקלאות אורגנית לפני יותר מ-40 שנה, וואט טון קוון הוא יצירת מופת מעץ מ-1858 שרוב תושבי צ'יאנג מאי לא יודעים שקיים.",
    duration: "8-10 hours",
    durationHe: "8-10 שעות",
    difficulty: "moderate",
    price: 5000,
    imageUrl: "/images/optimized/chiang_mai_valley.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      {
        en: "English/Hebrew-speaking guide",
        he: "מדריך דובר אנגלית/עברית",
      },
      {
        en: "National park entrance fees",
        he: "דמי כניסה לפארק הלאומי",
      },
      {
        en: "Mon Jam / Royal Project entrance",
        he: "כניסה למון ג'אם / פרויקט מלכותי",
      },
      {
        en: "Farm-to-table lunch at Mon Jam",
        he: "ארוחת מהחווה לשולחן במון ג'אם",
      },
      {
        en: "Bamboo hut rental at reservoir",
        he: "השכרת בקתת במבוק על האגם",
      },
      { en: "Drinking water & snacks", he: "מי שתייה וחטיפים" },
      {
        en: "Kosher meal arrangements (advance notice)",
        he: "הסדרי ארוחות כשרות (בהודעה מראש)",
      },
    ],
    highlights: [
      "Wat Ton Kwen — one of Thailand's last wooden Lanna temples (1858)",
      "Mon Jam terraced hilltop farm with 360-degree views",
      "Strawberry picking above the clouds (Nov-Feb)",
      "4x4 to a Hmong village above the valley",
      "Samoeng local market — zero tourist infrastructure",
      "Sunset at a hidden lakeside bamboo hut",
    ],
    highlightsHe: [
      "ואט טון קוון — אחד ממקדשי העץ האחרונים בסגנון לאנה (1858)",
      "חוות מון ג'אם על פסגת הר מדורגת עם נוף 360 מעלות",
      "קטיף תותים מעל העננים (נוב'-פבר')",
      "נסיעת 4x4 לכפר המונג מעל העמק",
      "שוק סמאנג המקומי — אפס תשתית תיירותית",
      "שקיעה בבקתת במבוק נסתרת על שפת אגם",
    ],
    itineraryData: [
      {
        title: "07:30 — Pickup & Head North",
        titleHe: "07:30 — איסוף ונסיעה צפונה",
        description:
          "Depart Chiang Mai heading north through Mae Rim. Begin the 100km loop clockwise.",
        descriptionHe:
          "יציאה מצ'יאנג מאי צפונה דרך מאה רים. התחלת הלולאה של 100 ק\"מ בכיוון השעון.",
      },
      {
        title: "08:15 — Wat Ton Kwen",
        titleHe: "08:15 — ואט טון קוון",
        description:
          "One of the finest surviving Lanna wooden temples, built in 1858. Protected by the Fine Arts Department. Intricate wood carvings, zero tourists. Most Chiang Mai residents don't even know it's here.",
        descriptionHe:
          "אחד ממקדשי העץ הלאנה המשומרים ביותר, נבנה ב-1858. מוגן על ידי מחלקת האמנויות היפות. גילופי עץ מורכבים, אפס תיירים. רוב תושבי צ'יאנג מאי אפילו לא יודעים שהוא כאן.",
      },
      {
        title: "09:00 — Mae Sa Waterfall",
        titleHe: "09:00 — מפל מאה סה",
        description:
          "Quick stop at the first 2-3 tiers for morning photos. The mist catches the light beautifully in the early morning.",
        descriptionHe:
          "עצירה מהירה ב-2-3 הקומות הראשונות לצילומי בוקר. הערפל תופס את האור בצורה יפהפייה בשעות הבוקר.",
      },
      {
        title: "09:45 — Off-Road to Hmong Village",
        titleHe: "09:45 — נסיעת שטח לכפר המונג",
        description:
          "Leave the main loop road. 4x4 up a steep dirt track to a Hmong village above the valley. Traditional agriculture, handicrafts, mountain views. Your guide speaks their dialect.",
        descriptionHe:
          "עזיבת כביש הלולאה הראשי. נסיעת 4x4 בעלייה תלולה לכפר המונג מעל העמק. חקלאות מסורתית, מלאכת יד, נופי הרים. המדריך מדבר בניב שלהם.",
      },
      {
        title: "10:45 — Mon Jam Royal Project",
        titleHe: "10:45 — פרויקט מלכותי מון ג'אם",
        description:
          "The highlight of the loop. A terraced hillside at 1,350m with 360-degree views. The Royal Project replaced opium farming with organic vegetables and flowers over 40 years ago. Strawberry picking in Nov-Feb. Walk the terraced gardens — roses, chrysanthemums, vegetables growing in mountain air.",
        descriptionHe:
          "שיא הלולאה. מדרגה על צלע הר בגובה 1,350 מ' עם נוף 360 מעלות. הפרויקט המלכותי החליף גידול אופיום בירקות אורגניים ופרחים לפני 40+ שנה. קטיף תותים בנוב'-פבר'. הליכה בגנים המדורגים — ורדים, חרציות, ירקות שגדלים באוויר ההר.",
      },
      {
        title: "12:00 — Farm-to-Table Lunch",
        titleHe: "12:00 — ארוחת מהחווה לשולחן",
        description:
          "Eat at the Royal Project restaurant. Everything was picked that morning. Mountain views from your table.",
        descriptionHe:
          "אכלו במסעדת הפרויקט המלכותי. הכל נקטף באותו בוקר. נופי הרים מהשולחן שלכם.",
      },
      {
        title: "13:00 — Samoeng Town",
        titleHe: "13:00 — עיירת סמאנג",
        description:
          "Small district capital that barely sees tourists. Walk the local market — dried jungle herbs, handmade brooms, fermented pork sausage. This is how northern Thailand actually shops.",
        descriptionHe:
          "בירת מחוז קטנה שבקושי רואה תיירים. לכו בשוק המקומי — עשבי ג'ונגל מיובשים, מטאטאים עשויים ביד, נקניק חזיר מותסס. ככה צפון תאילנד באמת קונה.",
      },
      {
        title: "14:00 — Forest Road & Viewpoints",
        titleHe: "14:00 — כביש יער ונקודות תצפית",
        description:
          "The most scenic stretch of the loop. Winding through dense forest, 4x4 back roads, photo stops at the Samoeng Forest Viewpoint.",
        descriptionHe:
          "הקטע הנופי ביותר של הלולאה. פיתולים דרך יער צפוף, דרכי שטח, עצירות צילום בתצפית יער סמאנג.",
      },
      {
        title: "15:00 — Huay Tueng Thao Reservoir",
        titleHe: "15:00 — מאגר הואי טואנג טאו",
        description:
          "A hidden lake just north of the city. Rent a bamboo hut built over the water. Swim, relax, watch locals fishing. Thai-style afternoon snacks at the lakeside stalls. Stay for sunset over the mountains.",
        descriptionHe:
          "אגם נסתר צפונית לעיר. שכרו בקתת במבוק בנויה מעל המים. שחו, הירגעו, צפו במקומיים שדגים. חטיפי אחר-צהריים בסגנון תאילנדי בדוכני שפת האגם. הישארו לשקיעה מעל ההרים.",
      },
      {
        title: "17:00 — Back in Chiang Mai",
        titleHe: "17:00 — חזרה לצ'יאנג מאי",
        description: "Short drive back to the city from the reservoir.",
        descriptionHe: "נסיעה קצרה חזרה לעיר מהמאגר.",
      },
    ],
  },
};

/** Items NOT included in any tour (from official pricing card) */
const NOT_INCLUDED: { en: string; he: string }[] = [
  {
    en: "Travel insurance (mandatory: every traveler must have health insurance)",
    he: "ביטוחים (חובה: על כל נוסע לרכוש ביטוח בריאות)",
  },
  {
    en: "Meals beyond those listed in the itinerary",
    he: "ארוחות מעבר לאלו המצוינות בתוכנית הטיול",
  },
  {
    en: "Personal expenses",
    he: "הוצאות אישיות",
  },
  {
    en: "Activities, entrance fees, or attractions not listed in the itinerary",
    he: "כל פעילויות, כניסה לאתר או אטרקציה שאינה מופיעה בתוכנית",
  },
  {
    en: "Tips for driver/guide",
    he: "טיפים לנהג/מדריך",
  },
];

const DIFFICULTY_LABELS: Record<string, { en: string; he: string }> = {
  easy: { en: "Easy", he: "קל" },
  moderate: { en: "Moderate", he: "בינוני" },
  challenging: { en: "Challenging", he: "מאתגר" },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  challenging: "bg-red-100 text-red-700",
};

/** Per-tour content enrichment data for SEO */
const TOUR_ENRICHMENT: Record<
  string,
  {
    whatToBring: { en: string; he: string }[];
    bestTimeToVisit: { en: string; he: string };
    localTips: { en: string; he: string }[];
    relatedTourSlugs: string[];
  }
> = {
  "doi-inthanon-roof-of-thailand": {
    whatToBring: [
      {
        en: "Warm layer (10-15C at summit)",
        he: "שכבה חמה (10-15 מעלות בפסגה)",
      },
      { en: "Comfortable hiking shoes", he: "נעלי הליכה נוחות" },
      {
        en: "Rain jacket (especially Jun-Oct)",
        he: "מעיל גשם (במיוחד יוני-אוקטובר)",
      },
      {
        en: "Camera with good zoom for birds",
        he: "מצלמה עם זום טוב לציפורים",
      },
      { en: "Sunscreen and hat", he: "קרם הגנה וכובע" },
    ],
    bestTimeToVisit: {
      en: "November to February offers the clearest skies and coolest temperatures at the summit. The rhododendrons bloom in December-January. Avoid weekends and Thai holidays for fewer crowds.",
      he: "נובמבר עד פברואר מציעים את השמים הצלולים ביותר והטמפרטורות הנוחות בפסגה. הרודודנדרונים פורחים בדצמבר-ינואר. הימנעו מסופי שבוע וחגים תאילנדיים לפחות קהל.",
    },
    localTips: [
      {
        en: "The Pha Dok Siew trail is far less crowded than Kew Mae Pan and equally beautiful",
        he: "שביל פה דוק סיו פחות צפוף בהרבה מקיו מאה פאן ויפה באותה מידה",
      },
      {
        en: "Buy fresh strawberries and passion fruit at the Hmong market on the way down",
        he: "קנו תותים ופסיפלורה טריים בשוק ההמונג בדרך למטה",
      },
      {
        en: "Visit the summit viewpoint right after the Hmong market stop — morning mist clears by noon",
        he: "בקרו בתצפית הפסגה מיד אחרי עצירת שוק ההמונג — ערפל הבוקר מתפזר בצהריים",
      },
    ],
    relatedTourSlugs: [
      "samoeng-loop-mountain-circuit",
      "mae-wang-jungle-wilderness",
    ],
  },
  "mae-kampong-hidden-village": {
    whatToBring: [
      { en: "Comfortable walking shoes", he: "נעלי הליכה נוחות" },
      { en: "Light jacket (cool in the village)", he: "ז'קט קל (קריר בכפר)" },
      { en: "Camera", he: "מצלמה" },
      { en: "Cash for local products", he: "מזומן למוצרים מקומיים" },
      { en: "Insect repellent", he: "דוחה חרקים" },
    ],
    bestTimeToVisit: {
      en: "Year-round destination. November to February for cool weather. The village is magical in the early morning mist. Weekdays are quieter.",
      he: "יעד לכל השנה. נובמבר עד פברואר למזג אוויר קריר. הכפר קסום בערפל הבוקר המוקדם. ימי חול שקטים יותר.",
    },
    localTips: [
      {
        en: "Buy Miang (fermented tea) directly from the families — it's a unique souvenir",
        he: "קנו מיאנג (תה מותסס) ישירות מהמשפחות — זה מזכרת ייחודית",
      },
      {
        en: "The Kew Fin viewpoint hike is worth the effort — most visitors skip it",
        he: "הטיול לתצפית קיו פין שווה את המאמץ — רוב המבקרים מדלגים",
      },
      {
        en: "Try the village coffee — it's roasted and ground fresh daily",
        he: "טעמו את קפה הכפר — נקלה ונטחן טרי כל יום",
      },
    ],
    relatedTourSlugs: [
      "doi-suthep-pui-beyond-temple",
      "samoeng-loop-mountain-circuit",
    ],
  },
  "maerim-sticky-waterfalls": {
    whatToBring: [
      { en: "Swimsuit and quick-dry towel", he: "בגד ים ומגבת מתייבשת מהר" },
      {
        en: "Water shoes or old sneakers (for climbing the waterfall)",
        he: "נעלי מים או נעלי ספורט ישנות (לטיפוס על המפל)",
      },
      { en: "Change of clothes", he: "בגדים להחלפה" },
      { en: "Waterproof phone case", he: "נרתיק עמיד למים לטלפון" },
      { en: "Sunscreen", he: "קרם הגנה" },
    ],
    bestTimeToVisit: {
      en: "Best from November to April (dry season) for the best waterfall climbing conditions. The botanical garden is beautiful year-round. Mornings are best to avoid afternoon heat.",
      he: "הכי טוב מנובמבר עד אפריל (עונה יבשה) לתנאי טיפוס מפל מיטביים. הגן הבוטני יפה כל השנה. בקרים הם הזמן הטוב ביותר להימנע מחום אחר-הצהריים.",
    },
    localTips: [
      {
        en: "At the Sticky Waterfall, bare feet grip better than shoes on the limestone",
        he: "במפל הדביק, כפות רגליים יחפות אוחזות טוב יותר מנעליים על אבן הגיר",
      },
      {
        en: "The canopy walkway at the botanical garden is best visited early morning for bird sightings",
        he: "גשר הצמרות בגן הבוטני הכי טוב לבקר בבוקר מוקדם לצפייה בציפורים",
      },
      {
        en: "Ask your guide to take you to the upper tiers of Mae Sa — tier 7-10 have zero crowds",
        he: "בקשו מהמדריך לקחת אתכם לקומות העליונות של מאה סה — קומות 7-10 ללא קהל",
      },
    ],
    relatedTourSlugs: [
      "doi-suthep-pui-beyond-temple",
      "mae-wang-jungle-wilderness",
    ],
  },
  "doi-suthep-pui-beyond-temple": {
    whatToBring: [
      { en: "Comfortable hiking shoes", he: "נעלי הליכה נוחות" },
      {
        en: "Long pants (for temple visit)",
        he: "מכנסיים ארוכים (לביקור במקדש)",
      },
      {
        en: "Shoulder-covering top (temple dress code)",
        he: "חולצה שמכסה כתפיים (קוד לבוש במקדש)",
      },
      { en: "Water bottle", he: "בקבוק מים" },
      {
        en: "Cash for donations and market purchases",
        he: "מזומן לתרומות ולקניות בשוק",
      },
    ],
    bestTimeToVisit: {
      en: "November to February for cool mornings. Go early (before 9 AM) to beat the bus tour crowds at the temple. Cherry blossoms at Ban Kun Chang Kian bloom in January-February.",
      he: "נובמבר עד פברואר לבקרים קרירים. צאו מוקדם (לפני 9 בבוקר) להקדים את קהל אוטובוסי התיירים במקדש. פריחת הדובדבן בבאן קון צ'אנג קיאן בינואר-פברואר.",
    },
    localTips: [
      {
        en: "The Monk's Trail hidden trailhead is near Chiang Mai Zoo — it's the authentic way to reach the temple",
        he: "נקודת ההתחלה הנסתרת של שביל הנזירים ליד גן החיות — זו הדרך האותנטית להגיע למקדש",
      },
      {
        en: "Skip the tourist market at Doi Pui village entrance — the real village is behind it",
        he: "דלגו על השוק התיירותי בכניסה לכפר דוי פוי — הכפר האמיתי מאחוריו",
      },
      {
        en: "The coffee at Ban Kun Chang Kian is single-origin arabica grown at 1,400m — genuinely excellent",
        he: "הקפה בבאן קון צ'אנג קיאן הוא ערביקה מזן יחיד שגדל בגובה 1,400 מ' — באמת מצוין",
      },
    ],
    relatedTourSlugs: [
      "maerim-sticky-waterfalls",
      "mae-kampong-hidden-village",
    ],
  },
  "mae-wang-jungle-wilderness": {
    whatToBring: [
      {
        en: "Sturdy closed-toe shoes (river crossings)",
        he: "נעליים סגורות יציבות (חציית נהרות)",
      },
      {
        en: "Change of clothes (you may get wet)",
        he: "בגדים להחלפה (אפשר להירטב)",
      },
      { en: "Swimsuit for the waterfall pool", he: "בגד ים לבריכת המפל" },
      {
        en: "Insect repellent (jungle trails)",
        he: "דוחה חרקים (שבילי ג'ונגל)",
      },
      { en: "Sunscreen and hat", he: "קרם הגנה וכובע" },
      { en: "Camera with waterproof case", he: "מצלמה עם נרתיק עמיד למים" },
    ],
    bestTimeToVisit: {
      en: "November to March for the best off-road conditions. River crossings are more dramatic in the green season (Jun-Oct) but require more skill. The waterfall pool is warmest in March-April.",
      he: "נובמבר עד מרץ לתנאי שטח מיטביים. חציית נהרות דרמטית יותר בעונה הירוקה (יוני-אוקטובר) אבל דורשת יותר מיומנות. בריכת המפל חמה ביותר במרץ-אפריל.",
    },
    localTips: [
      {
        en: "Pha Chor is best photographed in the golden hour — the rust-colored sandstone glows",
        he: "פה-צ'ור הכי טוב לצלם בשעת הזהב — אבן החול בצבע החלודה זוהרת",
      },
      {
        en: "The elephant experience is ethical — no riding, just walking with them in their habitat",
        he: "חוויית הפילים אתית — בלי רכיבה, רק הליכה איתם בבית הגידול שלהם",
      },
      {
        en: "Note: This is the only tour not scheduled on Shabbat due to its remote location",
        he: "שימו לב: זה הטיול היחיד שלא מתוזמן בשבת בגלל מיקומו המרוחק",
      },
    ],
    relatedTourSlugs: [
      "doi-inthanon-roof-of-thailand",
      "samoeng-loop-mountain-circuit",
    ],
  },
  "samoeng-loop-mountain-circuit": {
    whatToBring: [
      { en: "Light jacket for mountain elevations", he: "ז'קט קל לגבהי ההרים" },
      { en: "Swimsuit for the reservoir", he: "בגד ים למאגר" },
      { en: "Camera", he: "מצלמה" },
      { en: "Cash for local market purchases", he: "מזומן לקניות בשוק המקומי" },
      { en: "Sunscreen and sunglasses", he: "קרם הגנה ומשקפי שמש" },
    ],
    bestTimeToVisit: {
      en: "November to February for strawberry season at Mon Jam and cool mountain air. The reservoir is pleasant year-round. Sunset at the reservoir is magical in December-January.",
      he: "נובמבר עד פברואר לעונת התותים במון ג'אם ואוויר הרים קריר. המאגר נעים כל השנה. השקיעה במאגר קסומה בדצמבר-ינואר.",
    },
    localTips: [
      {
        en: "Wat Ton Kwen is one of Thailand's most beautiful wooden temples — don't skip it",
        he: "ואט טון קוון הוא אחד ממקדשי העץ היפים בתאילנד — אל תדלגו",
      },
      {
        en: "Buy organic vegetables at Mon Jam — they're grown in pristine mountain soil",
        he: "קנו ירקות אורגניים במון ג'אם — הם גדלים באדמת הרים טהורה",
      },
      {
        en: "Book the bamboo hut at the reservoir in advance for weekends",
        he: "הזמינו את בקתת הבמבוק במאגר מראש לסופי שבוע",
      },
    ],
    relatedTourSlugs: [
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
    ],
  },
};

/** Get enrichment data for a given tour slug */
function getTourEnrichment(slug: string) {
  return TOUR_ENRICHMENT[slug] ?? null;
}

interface NormalizedTour {
  dbId: number | null; // null for fallback tours
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  duration: string;
  difficulty: string;
  price: number;
  imageUrl: string;
  isKosher: number;
  isPrivate: number;
  isShabbatOk: number;
  groupMinSize: number;
  groupMaxSize: number;
  includedItems: string | null;
  itinerary: string | null;
  highlights: string | null;
  highlightsHe: string | null;
  fallbackIncluded?: { en: string; he: string }[];
}

export default function TourDetail() {
  const { t, language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const slug = params.slug ?? "";

  const { data: dbTour, isLoading } = trpc.tour.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Normalize into a common shape
  const fallback = FALLBACK_TOURS[slug];
  let tour: NormalizedTour | null = null;
  if (dbTour) {
    tour = {
      dbId: dbTour.id,
      name: dbTour.name,
      nameHe: dbTour.nameHe,
      description: dbTour.description,
      descriptionHe: dbTour.descriptionHe,
      duration: dbTour.duration,
      difficulty: dbTour.difficulty,
      price: dbTour.price,
      imageUrl: dbTour.imageUrl,
      isKosher: dbTour.isKosher,
      isPrivate: dbTour.isPrivate,
      isShabbatOk: dbTour.isShabbatOk,
      groupMinSize: dbTour.groupMinSize ?? 1,
      groupMaxSize: dbTour.groupMaxSize ?? 10,
      includedItems: dbTour.includedItems ?? null,
      itinerary: dbTour.itinerary ?? null,
      highlights: dbTour.highlights ?? null,
      highlightsHe: dbTour.highlightsHe ?? null,
    };
  } else if (fallback) {
    tour = {
      dbId: null,
      name: fallback.name,
      nameHe: fallback.nameHe,
      description: fallback.description,
      descriptionHe: fallback.descriptionHe,
      duration: fallback.duration,
      difficulty: fallback.difficulty,
      price: fallback.price,
      imageUrl: fallback.imageUrl,
      isKosher: fallback.isKosher,
      isPrivate: fallback.isPrivate,
      isShabbatOk: fallback.isShabbatOk,
      groupMinSize: fallback.groupMinSize,
      groupMaxSize: fallback.groupMaxSize,
      includedItems: null,
      itinerary: fallback.itineraryData
        ? JSON.stringify(fallback.itineraryData)
        : null,
      highlights: fallback.highlights
        ? JSON.stringify(fallback.highlights)
        : null,
      highlightsHe: fallback.highlightsHe
        ? JSON.stringify(fallback.highlightsHe)
        : null,
      fallbackIncluded: fallback.included,
    };
  }

  // Build enhanced JSON-LD for tour pages
  const tourJsonLd = (() => {
    if (!tour) return undefined;
    const siteUrl = "https://www.wiro4x4indochina.com";
    const tourUrl = `${siteUrl}/tours/${slug}`;
    const imageUrl = tour.imageUrl.startsWith("http")
      ? tour.imageUrl
      : `${siteUrl}${tour.imageUrl}`;

    // Parse duration string (e.g. "7-8 hours") into ISO 8601 duration
    const durationMatch = tour.duration.match(/(\d+)/);
    const durationHours = durationMatch ? parseInt(durationMatch[1], 10) : 8;
    const isoDuration = `PT${durationHours}H`;

    // Build itinerary ItemList from parsed itinerary JSON
    let itineraryItems: Record<string, unknown>[] = [];
    if (tour.itinerary) {
      try {
        const parsed = JSON.parse(tour.itinerary) as {
          title: string;
          description: string;
        }[];
        itineraryItems = parsed.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          description: item.description,
        }));
      } catch {
        // ignore parse errors
      }
    }

    const touristTrip: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: tour.name,
      description: tour.description,
      touristType: ["Adventure", "Kosher", "Off-Road"],
      image: imageUrl,
      url: tourUrl,
      duration: isoDuration,
      maximumAttendeeCapacity: tour.groupMaxSize,
      offers: {
        "@type": "Offer",
        price: String(tour.price),
        priceCurrency: "THB",
        availability: "https://schema.org/InStock",
        validFrom: new Date().toISOString().split("T")[0],
        url: tourUrl,
      },
      provider: {
        "@type": ["TravelAgency", "LocalBusiness"],
        "@id": `${siteUrl}/#organization`,
        name: "WIRO 4x4 Indochina Adventure",
        url: siteUrl,
        telephone: "+66816401397",
      },
    };

    if (itineraryItems.length > 0) {
      touristTrip.itinerary = {
        "@type": "ItemList",
        numberOfItems: itineraryItems.length,
        itemListElement: itineraryItems,
      };
    }

    if (tour.isKosher) {
      touristTrip.additionalType = "https://schema.org/FoodService";
      touristTrip.amenityFeature = {
        "@type": "LocationFeatureSpecification",
        name: "Kosher Meals Available",
        value: true,
      };
    }

    return touristTrip;
  })();

  // SEO: Per-tour meta + JSON-LD structured data
  usePageMeta(
    tour
      ? {
          title: `${tour.name} — Chiang Mai 4x4 Tour`,
          description: tour.description.slice(0, 160),
          ogTitle: `${tour.name} | Kosher Off-Road Tour | WIRO 4x4`,
          ogDescription: tour.description.slice(0, 200),
          ogImage: tour.imageUrl.startsWith("http")
            ? tour.imageUrl
            : `https://www.wiro4x4indochina.com${tour.imageUrl}`,
          canonicalPath: `/tours/${slug}`,
          jsonLd: tourJsonLd,
        }
      : { title: "Tour Details" }
  );

  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const tourViewKeyRef = useRef("");
  const pricingViewKeyRef = useRef("");

  useEffect(() => {
    if (!tour || tourViewKeyRef.current === slug) return;
    tourViewKeyRef.current = slug;
    trackEvent("tour_view", {
      page: `/tours/${slug}`,
      placement: "tour-detail",
      language,
      tour: slug,
    });
  }, [language, slug, tour]);

  useEffect(() => {
    if (
      !tour ||
      !pricingSectionRef.current ||
      pricingViewKeyRef.current === slug
    )
      return;
    const observer = new IntersectionObserver(
      entries => {
        if (
          !entries.some(entry => entry.isIntersecting) ||
          pricingViewKeyRef.current === slug
        )
          return;
        pricingViewKeyRef.current = slug;
        trackEvent("pricing_view", {
          page: `/tours/${slug}`,
          placement: "booking-card",
          language,
          tour: slug,
        });
        observer.disconnect();
      },
      { threshold: 0.25 }
    );
    observer.observe(pricingSectionRef.current);
    return () => observer.disconnect();
  }, [language, slug, tour]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-medium mb-4">
            {t("Tour Not Found", "הטיול לא נמצא")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              "The tour you're looking for doesn't exist.",
              "הטיול שחיפשתם לא קיים."
            )}
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Home", "חזרה לעמוד הבית")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse included items (from DB or fallback)
  let includedItems: { en: string; he: string }[] = [];
  if (tour.includedItems) {
    try {
      includedItems = JSON.parse(tour.includedItems);
    } catch {
      /* ignore parse errors */
    }
  }
  if (includedItems.length === 0 && tour.fallbackIncluded) {
    includedItems = tour.fallbackIncluded;
  }
  // Fallback: use highlights if no includedItems
  if (includedItems.length === 0 && tour.highlights) {
    try {
      const hl: string[] = JSON.parse(tour.highlights);
      const hlHe: string[] = tour.highlightsHe
        ? JSON.parse(tour.highlightsHe)
        : [];
      includedItems = hl.map((h, i) => ({ en: h, he: hlHe[i] || h }));
    } catch {
      /* ignore */
    }
  }

  // Parse itinerary
  let itinerary: {
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
  }[] = [];
  if (tour.itinerary) {
    try {
      itinerary = JSON.parse(tour.itinerary);
    } catch {
      /* ignore */
    }
  }

  const diffLabel =
    DIFFICULTY_LABELS[tour.difficulty] ?? DIFFICULTY_LABELS.moderate;
  const diffColor =
    DIFFICULTY_COLORS[tour.difficulty] ?? DIFFICULTY_COLORS.moderate;

  const whatsappMessage = t(
    `Hi WIRO 4x4! I'm interested in the ${tour.name}. Can you share pricing and availability?`,
    `היי WIRO 4x4! מתעניינים ב${t(tour.name, tour.nameHe)}. אפשר לשמוע על מחירים וזמינות?`
  );

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[
          {
            label: t("Tours", "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD"),
            href: "/#tours",
          },
          { label: t(tour.name, tour.nameHe) },
        ]}
      />
      <main id="main-content">
        {/* Full-bleed Hero Image (60vh) */}
        <section className="relative min-h-[60vh] overflow-hidden">
          <OptimizedImage
            src={tour.imageUrl}
            alt={t(tour.name, tour.nameHe)}
            priority
            sizes="100vw"
            className="w-full h-full absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("All Tours", "כל הטיולים")}
              </button>
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-3">
                {t(tour.name, tour.nameHe)}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {tour.duration}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${diffColor}`}
                >
                  {t(diffLabel.en, diffLabel.he)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Overlapping Content Card */}
        <div className="container -mt-20 relative z-10 pb-10 md:pb-14">
          <div className="bg-card rounded-sm shadow-premium p-6 md:p-10">
            <GoldDivider className="mx-0 mt-0 mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-medium mb-4">
                    {t("About This Tour", "אודות הטיול")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(tour.description, tour.descriptionHe)}
                  </p>
                </div>

                {/* Social Proof */}
                <TourSocialProof />

                {/* Badges */}
                <div className="flex flex-wrap gap-3">
                  {tour.isKosher === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent text-sm rounded-sm font-medium">
                      <Utensils className="h-4 w-4" />
                      {t("Kosher Meals Included", "ארוחות כשרות כלולות")}
                    </span>
                  )}
                  {tour.isPrivate === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary/10 text-secondary-foreground text-sm rounded-sm font-medium">
                      <Users className="h-4 w-4" />
                      {t("Private Tour", "טיול פרטי")}
                    </span>
                  )}
                  {tour.isShabbatOk === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent-foreground text-sm rounded-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      {t("Shabbat Friendly", "מתאים לשבת")}
                    </span>
                  )}
                </div>

                {/* What's Included */}
                {includedItems.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-medium mb-4">
                      {t("What's Included", "מה כלול")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {includedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-sm bg-accent/5"
                        >
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm">{t(item.en, item.he)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Included */}
                <div>
                  <h2 className="text-2xl font-medium mb-4">
                    {t("Not Included", "הסיול לא כולל")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NOT_INCLUDED.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-sm bg-muted/50"
                      >
                        <XCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {t(item.en, item.he)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itinerary */}
                {itinerary.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-medium mb-4">
                      {t("Day-by-Day Itinerary", "מסלול מפורט")}
                    </h2>
                    <div className="space-y-4">
                      {itinerary.map((step, idx) => (
                        <details
                          key={idx}
                          className="group p-4 border border-border rounded-sm"
                          onToggle={event => {
                            if (!event.currentTarget.open) return;
                            trackEvent("itinerary_expand", {
                              page: `/tours/${slug}`,
                              placement: `step-${idx + 1}`,
                              language,
                              tour: slug,
                            });
                          }}
                        >
                          <summary className="flex cursor-pointer list-none items-center gap-4">
                            <span className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-2xl shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="font-semibold">
                              {t(step.title, step.titleHe)}
                            </h4>
                          </summary>
                          <p className="mt-3 ps-14 text-sm text-muted-foreground">
                            {t(step.description, step.descriptionHe)}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Calendar */}
                <AvailabilityCalendar
                  tourId={tour.dbId}
                  tourSlug={slug}
                  tourName={tour.name}
                  tourNameHe={tour.nameHe}
                />

                {/* What to Bring */}
                {(() => {
                  const enrichment = getTourEnrichment(slug);
                  if (!enrichment) return null;
                  return (
                    <div>
                      <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
                        <Backpack className="w-6 h-6 text-accent" />
                        {t("What to Bring", "מה להביא")}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {enrichment.whatToBring.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-sm bg-muted/50"
                          >
                            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <span className="text-sm">
                              {t(item.en, item.he)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Best Time to Visit */}
                {(() => {
                  const enrichment = getTourEnrichment(slug);
                  if (!enrichment) return null;
                  return (
                    <div>
                      <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
                        <Sun className="w-6 h-6 text-accent" />
                        {t("Best Time to Visit", "הזמן הטוב ביותר לביקור")}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {t(
                          enrichment.bestTimeToVisit.en,
                          enrichment.bestTimeToVisit.he
                        )}
                      </p>
                    </div>
                  );
                })()}

                {/* Local Tips */}
                {(() => {
                  const enrichment = getTourEnrichment(slug);
                  if (!enrichment) return null;
                  return (
                    <div>
                      <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-accent" />
                        {t("Local Tips", "טיפים מקומיים")}
                      </h2>
                      <div className="space-y-3">
                        {enrichment.localTips.map((tip, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-sm border border-accent/20 bg-accent/5"
                          >
                            <span className="text-accent font-bold shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="text-sm">{t(tip.en, tip.he)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Related Tours */}
                {(() => {
                  const enrichment = getTourEnrichment(slug);
                  if (!enrichment) return null;
                  const relatedTours = enrichment.relatedTourSlugs
                    .map(s => {
                      const fb = FALLBACK_TOURS[s];
                      return fb ? { slug: s, ...fb } : null;
                    })
                    .filter(Boolean) as ((typeof FALLBACK_TOURS)[string] & {
                    slug: string;
                  })[];
                  if (relatedTours.length === 0) return null;
                  return (
                    <div>
                      <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
                        <ArrowRight className="w-6 h-6 text-accent" />
                        {t("Related Tours", "טיולים קשורים")}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedTours.map(rt => (
                          <Link key={rt.slug} href={`/tours/${rt.slug}`}>
                            <Card className="overflow-hidden rounded-sm hover:shadow-premium transition-shadow cursor-pointer group">
                              <div className="relative h-32 overflow-hidden">
                                <OptimizedImage
                                  src={rt.imageUrl}
                                  alt={t(
                                    `${rt.name} - Related off-road tour`,
                                    `${rt.nameHe} - טיול שטח קשור`
                                  )}
                                  sizes="(max-width: 640px) 100vw, 50vw"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-sm mb-1">
                                  {t(rt.name, rt.nameHe)}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {rt.duration}
                                  </span>
                                  <span className="text-accent font-bold">
                                    &#3647;{rt.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Related Blog Posts Placeholder */}
                <div>
                  <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-accent" />
                    {t("Read More", "קראו עוד")}
                  </h2>
                  <div className="p-4 rounded-sm border border-border bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(
                        "Explore our blog for travel tips, guides, and stories from Chiang Mai.",
                        "גלו את הבלוג שלנו לטיפים, מדריכים וסיפורים מצ'יאנג מאי."
                      )}
                    </p>
                    <Link href="/blog">
                      <span className="text-accent text-sm font-medium hover:underline cursor-pointer">
                        {t("Visit our Blog", "בקרו בבלוג שלנו")} &rarr;
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Tour FAQ */}
                <TourFAQ />
              </div>

              {/* Sidebar - Booking Card */}
              <div>
                <Card
                  ref={pricingSectionRef}
                  className="p-6 sticky top-24 space-y-5 rounded-sm"
                >
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("Starting from", "החל מ-")}
                    </div>
                    <div className="text-4xl font-bold text-accent">
                      &#3647;{tour.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t(
                        `per group (${tour.groupMinSize}-${tour.groupMaxSize} people)`,
                        `לקבוצה (${tour.groupMinSize}-${tour.groupMaxSize} אנשים)`
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("Duration", "משך")}
                      </span>
                      <span className="font-medium">{tour.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("Difficulty", "רמת קושי")}
                      </span>
                      <span className="font-medium">
                        {t(diffLabel.en, diffLabel.he)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("Group Size", "גודל קבוצה")}
                      </span>
                      <span className="font-medium">
                        {tour.groupMinSize}-{tour.groupMaxSize}{" "}
                        {t("people", "אנשים")}
                      </span>
                    </div>
                  </div>

                  {/* What's Included (pricing clarity) */}
                  {includedItems.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {t("Includes:", "כולל:")}
                      </p>
                      {includedItems.slice(0, 5).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{t(item.en, item.he)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <Link href={`/book?tour=${slug}`}>
                      <Button
                        className="w-full gap-2"
                        variant="default"
                        size="lg"
                      >
                        <Calendar className="w-5 h-5" />
                        {t("Book Now", "הזמינו עכשיו")}
                      </Button>
                    </Link>
                    <Button
                      asChild
                      className="w-full gap-2"
                      variant="outline"
                      size="lg"
                    >
                      <Link href={`/book?tour=${slug}`}>
                        <Calendar className="w-5 h-5" />
                        {t("Book Now", "הזמינו עכשיו")}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full gap-2"
                      variant="outline"
                      size="lg"
                    >
                      <TrackedWhatsAppLink
                        sourceCode={
                          language === "he"
                            ? "TOUR-DETAIL-HE"
                            : "TOUR-DETAIL-EN"
                        }
                        humanMessage={whatsappMessage}
                        tour={slug}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {t("Book via WhatsApp", "הזמינו בוואטסאפ")}
                      </TrackedWhatsAppLink>
                    </Button>
                    <a
                      href="#inquiry"
                      onClick={e => {
                        e.preventDefault();
                        navigate("/");
                        // Small delay so the homepage loads then scrolls
                        setTimeout(() => {
                          document
                            .getElementById("inquiry")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                      }}
                      className="block text-center text-sm text-accent hover:underline"
                    >
                      {t("Or request a free quote", "או בקשו הצעת מחיר חינם")}
                    </a>
                  </div>

                  <div className="pt-3 border-t text-xs text-muted-foreground space-y-1.5">
                    <p>
                      {t(
                        "50% deposit to confirm. Balance on tour day.",
                        "מקדמה 50% לאישור. יתרה ביום הטיול."
                      )}
                    </p>
                    <p>
                      {t(
                        "Free cancellation 7+ days before.",
                        "ביטול חינם 7+ ימים לפני."
                      )}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Compare with other tours */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-xl font-semibold mb-2">
              {t("Not sure yet?", "עדיין לא בטוחים?")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t(
                "Compare all our tours to find your perfect adventure",
                "השוו את כל הטיולים שלנו כדי למצוא את ההרפתקה המושלמת"
              )}
            </p>
            <Link href="/pricing">
              <button className="border-2 border-accent text-accent hover:bg-accent hover:text-primary font-semibold px-6 py-2 rounded-full transition-all">
                {t("Compare All Tours", "השוו את כל הטיולים")}
              </button>
            </Link>
          </div>
        </section>
      </main>
      <FloatingActionButtons />
      <Footer />
    </div>
  );
}
