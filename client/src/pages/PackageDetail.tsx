import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { formatUSD } from "../../../shared/pricing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Check,
  Users,
  Mountain,
  Utensils,
  BedDouble,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/const";
import { OptimizedImage } from "@/components/OptimizedImage";

/* ─── Fallback itinerary day type ─── */
interface ItineraryDay {
  day: number;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  image: string;
  highlights: string[];
  highlightsHe: string[];
}

interface FallbackPackage {
  name: string;
  nameHe: string;
  slug: string;
  description: string;
  descriptionHe: string;
  coverImage: string;
  price: number;
  duration: string;
  durationHe: string;
  location: string;
  locationHe: string;
  groupSize: string;
  groupSizeHe: string;
  included: string[];
  includedHe: string[];
  itinerary: ItineraryDay[];
}

/* ─── Hardcoded fallback packages ─── */
const FALLBACK_PACKAGES: Record<string, FallbackPackage> = {
  "northern-thailand-3d2n": {
    name: "3 Days / 2 Nights — Northern Thailand Mountain Loop",
    nameHe: "3 ימים / 2 לילות — לולאת ההרים של צפון תאילנד",
    slug: "northern-thailand-3d2n",
    description:
      "An unforgettable 3-day off-road adventure through the mountains of Northern Thailand. Explore hidden caves in Chiang Dao, drive the stunning mountain roads to Doi Ang Khang and Mae Salong's hilltop tea plantations, then discover Chiang Rai's iconic temples — all in a private 4x4 with your Hebrew-speaking guide.",
    descriptionHe:
      "הרפתקת שטח בת 3 ימים בלתי נשכחת דרך ההרים של צפון תאילנד. חקרו מערות נסתרות בצ'יאנג דאו, סעו בכבישי הרים מרהיבים לדוי אנג חאנג ומטעי התה של מאה סאלונג, וגלו את המקדשים האייקוניים של צ'יאנג ראי — הכל ברכב 4x4 פרטי עם מדריך דובר עברית.",
    coverImage: "/images/optimized/nong_khiaw_river.jpg",
    price: 12900,
    duration: "3 Days / 2 Nights",
    durationHe: "3 ימים / 2 לילות",
    location: "Northern Thailand",
    locationHe: "צפון תאילנד",
    groupSize: "2–6 guests",
    groupSizeHe: "2–6 אורחים",
    included: [
      "Private 4x4 vehicle for all 3 days",
      "Hebrew-speaking guide throughout",
      "2 nights mountain lodge accommodation",
      "All entrance fees & activities",
      "Drinking water & snacks daily",
      "Hotel pickup & drop-off in Chiang Mai",
      "Fuel & tolls included",
    ],
    includedHe: [
      "רכב 4x4 פרטי ל-3 ימים",
      "מדריך דובר עברית לאורך כל המסע",
      "2 לילות לינה בלודג' הרים",
      "כל דמי הכניסה והפעילויות",
      "מים ונשנושים יומיים",
      "איסוף והחזרה למלון בצ'יאנג מאי",
      "דלק ואגרות כלולים",
    ],
    itinerary: [
      {
        day: 1,
        title: "Chiang Mai → Chiang Dao Caves & Hot Springs",
        titleHe: "צ'יאנג מאי → מערות צ'יאנג דאו ומעיינות חמים",
        description:
          "Depart Chiang Mai heading north along scenic mountain roads to Chiang Dao. Explore the ancient limestone caves with underground rivers. After lunch at a local restaurant, soak in natural hot springs surrounded by jungle. Drive off-road trails to your mountain lodge for the night.",
        descriptionHe:
          "יציאה מצ'יאנג מאי צפונה לאורך כבישי הרים ציוריים לצ'יאנג דאו. חקירת מערות גיר עתיקות עם נהרות תת-קרקעיים. ארוחת צהריים במסעדה מקומית, ואז השרייה במעיינות חמים טבעיים מוקפי ג'ונגל. נסיעת שטח ללודג' ההרים ללינה.",
        image: "/images/optimized/cave_exploration.jpg",
        highlights: [
          "Chiang Dao Cave exploration",
          "Natural hot springs",
          "Off-road mountain trails",
          "Mountain lodge overnight",
        ],
        highlightsHe: [
          "חקירת מערות צ'יאנג דאו",
          "מעיינות חמים טבעיים",
          "שבילי שטח בהרים",
          "לינה בלודג' הרים",
        ],
      },
      {
        day: 2,
        title: "Doi Ang Khang & Mae Salong Tea Plantations",
        titleHe: "דוי אנג חאנג ומטעי תה מאה סאלונג",
        description:
          "Morning drive through misty mountain roads to Doi Ang Khang — a stunning royal agricultural station near the Myanmar border with flower gardens and strawberry farms. Continue along dramatic ridge roads to Mae Salong, a Chinese-Yunnan hilltop village famous for its oolong tea. Visit tea plantations, sample fresh brews, and enjoy panoramic valley views. Overnight at a mountain guesthouse.",
        descriptionHe:
          "נסיעת בוקר דרך כבישי הרים ערפיליים לדוי אנג חאנג — תחנה חקלאית מלכותית מרהיבה ליד גבול מיאנמר עם גני פרחים וחוות תותים. המשך בכבישי רכס דרמטיים למאה סאלונג, כפר סיני-יוננאני על פסגת הר המפורסם בתה אולונג. ביקור במטעי תה, טעימת תה טרי ונוף פנורמי של העמק. לינה בבית הארחה בהרים.",
        image: "/images/optimized/mae_salong_tea_plantation.jpg",
        highlights: [
          "Doi Ang Khang royal station",
          "Mae Salong tea tasting",
          "Panoramic mountain views",
          "Hilltribe village visit",
        ],
        highlightsHe: [
          "תחנה מלכותית דוי אנג חאנג",
          "טעימת תה במאה סאלונג",
          "נוף הרים פנורמי",
          "ביקור בכפר שבטי",
        ],
      },
      {
        day: 3,
        title: "Chiang Rai Temples & Return to Chiang Mai",
        titleHe: "מקדשי צ'יאנג ראי וחזרה לצ'יאנג מאי",
        description:
          "Drive from Mae Salong to Chiang Rai — Thailand's northernmost province. Visit the stunning White Temple (Wat Rong Khun), the vibrant Blue Temple (Wat Rong Suea Ten), and browse the local markets. Enjoy a scenic lunch overlooking the Kok River before the return drive to Chiang Mai along mountain highways with breathtaking sunset views.",
        descriptionHe:
          "נסיעה ממאה סאלונג לצ'יאנג ראי — המחוז הצפוני ביותר של תאילנד. ביקור במקדש הלבן המדהים (וואט רונג חון), המקדש הכחול התוסס (וואט רונג סואה טן) וסיור בשווקים המקומיים. ארוחת צהריים ציורית מול נהר קוק לפני הנסיעה חזרה לצ'יאנג מאי דרך כבישי הרים עם נוף שקיעה עוצר נשימה.",
        image: "/images/optimized/doi_suthep_golden_chedi.jpg",
        highlights: [
          "White Temple (Wat Rong Khun)",
          "Blue Temple visit",
          "Chiang Rai local markets",
          "Mountain sunset drive",
        ],
        highlightsHe: [
          "המקדש הלבן (וואט רונג חון)",
          "ביקור במקדש הכחול",
          "שווקים מקומיים בצ'יאנג ראי",
          "נסיעת שקיעה בהרים",
        ],
      },
    ],
  },
  "grand-tour-laos-14d": {
    name: "14-Day Grand Tour: Thailand to Laos by 4x4",
    nameHe: "מסע גדול 14 ימים: מתאילנד ללאוס ברכב 4x4",
    slug: "grand-tour-laos-14d",
    description:
      "The ultimate overland expedition from Chiang Mai through the mountains of Northern Thailand, across the Mekong River into Laos, and back. Two weeks of epic off-road driving, ancient temples, hidden waterfalls, Mekong River villages, and cross-border adventure — all with full kosher support and your private Hebrew-speaking guide.",
    descriptionHe:
      "המסע היבשתי האולטימטיבי מצ'יאנג מאי דרך ההרים של צפון תאילנד, חציית נהר המקונג ללאוס וחזרה. שבועיים של נהיגת שטח אפית, מקדשים עתיקים, מפלים נסתרים, כפרי נהר המקונג והרפתקת חציית גבולות — הכל עם תמיכה כשרה מלאה ומדריך פרטי דובר עברית.",
    coverImage: "/images/optimized/vang_vieng_mountains.jpg",
    price: 59900,
    duration: "14 Days / 13 Nights",
    durationHe: "14 ימים / 13 לילות",
    location: "Thailand + Laos",
    locationHe: "תאילנד + לאוס",
    groupSize: "2–4 guests",
    groupSizeHe: "2–4 אורחים",
    included: [
      "Private 4x4 vehicle for 14 days",
      "Hebrew-speaking guide throughout",
      "13 nights accommodation (hotels & lodges)",
      "All entrance fees & activities",
      "Border crossing assistance & permits",
      "Laos visa arrangement",
      "Daily drinking water & snacks",
      "Hotel pickup & drop-off in Chiang Mai",
      "Fuel, tolls & ferry crossings",
      "Emergency support & insurance",
    ],
    includedHe: [
      "רכב 4x4 פרטי ל-14 ימים",
      "מדריך דובר עברית לאורך כל המסע",
      "13 לילות לינה (מלונות ולודג'ים)",
      "כל דמי הכניסה והפעילויות",
      "סיוע בחציית גבולות ואישורים",
      "הסדרת ויזה ללאוס",
      "מים ונשנושים יומיים",
      "איסוף והחזרה למלון בצ'יאנג מאי",
      "דלק, אגרות ומעבורות",
      "תמיכת חירום וביטוח",
    ],
    itinerary: [
      {
        day: 1,
        title: "Chiang Mai → Doi Inthanon National Park",
        titleHe: "צ'יאנג מאי → הפארק הלאומי דוי אינטנון",
        description:
          "Begin the grand tour ascending Thailand's highest peak. Explore royal pagodas, Karen hill tribe villages, and pristine waterfalls at Doi Inthanon National Park.",
        descriptionHe:
          "תחילת המסע הגדול בטיפוס לפסגה הגבוהה ביותר בתאילנד. חקירת פגודות מלכותיות, כפרי שבט קארן ומפלים בפארק הלאומי דוי אינטנון.",
        image: "/images/optimized/doi_inthanon_royal_pagoda.jpg",
        highlights: [
          "Thailand's highest peak",
          "Royal pagodas",
          "Karen villages",
        ],
        highlightsHe: ["הפסגה הגבוהה בתאילנד", "פגודות מלכותיות", "כפרי קארן"],
      },
      {
        day: 2,
        title: "Chiang Dao Caves & Mountain Trails",
        titleHe: "מערות צ'יאנג דאו ושבילי הרים",
        description:
          "Head north to Chiang Dao for cave exploration and off-road mountain trails. Visit the sacred Wat Tham Chiang Dao temple caves with ancient Buddha images deep underground.",
        descriptionHe:
          "נסיעה צפונה לצ'יאנג דאו לחקירת מערות ושבילי שטח בהרים. ביקור במקדש ואט תם צ'יאנג דאו הקדוש עם פסלי בודהה עתיקים מתחת לאדמה.",
        image: "/images/optimized/cave_exploration.jpg",
        highlights: [
          "Sacred cave temples",
          "Off-road trails",
          "Mountain scenery",
        ],
        highlightsHe: ["מקדשי מערות קדושים", "שבילי שטח", "נוף הרים"],
      },
      {
        day: 3,
        title: "Mae Salong & Hilltribe Culture",
        titleHe: "מאה סאלונג ותרבות שבטי ההרים",
        description:
          "Drive through misty mountains to Mae Salong — a Chinese-Yunnan village perched on a mountaintop. Tea plantation tours, traditional markets, and panoramic views.",
        descriptionHe:
          "נסיעה דרך הרים ערפיליים למאה סאלונג — כפר סיני-יוננאני על פסגת הר. סיורי מטעי תה, שווקים מסורתיים ונוף פנורמי.",
        image: "/images/optimized/mae_salong_tea_plantation.jpg",
        highlights: [
          "Tea plantations",
          "Chinese-Thai culture",
          "Mountain markets",
        ],
        highlightsHe: ["מטעי תה", "תרבות סינית-תאילנדית", "שוקי הרים"],
      },
      {
        day: 4,
        title: "Golden Triangle & Chiang Rai",
        titleHe: "משולש הזהב וצ'יאנג ראי",
        description:
          "Visit the legendary Golden Triangle where Thailand, Myanmar, and Laos meet at the Mekong River. Explore Chiang Rai's famous White Temple (Wat Rong Khun) and Blue Temple.",
        descriptionHe:
          "ביקור במשולש הזהב האגדי שבו תאילנד, מיאנמר ולאוס נפגשות בנהר המקונג. חקירת המקדש הלבן המפורסם של צ'יאנג ראי ואט רונג קון והמקדש הכחול.",
        image: "/images/optimized/golden_triangle_mekong.jpg",
        highlights: [
          "Golden Triangle viewpoint",
          "White Temple",
          "Mekong River",
        ],
        highlightsHe: ["תצפית משולש הזהב", "המקדש הלבן", "נהר המקונג"],
      },
      {
        day: 5,
        title: "Border Crossing → Laos (Huay Xai)",
        titleHe: "חציית גבול → לאוס (הואי שאי)",
        description:
          "Cross the Mekong River from Chiang Khong to Huay Xai in Laos by ferry with the 4x4. Begin the Laos adventure exploring the riverside town and local markets.",
        descriptionHe:
          "חציית נהר המקונג מצ'יאנג קונג להואי שאי בלאוס במעבורת עם הרכב 4x4. תחילת הרפתקת לאוס עם חקירת העיירה לחוף הנהר ושווקים מקומיים.",
        image: "/images/optimized/mekong_river_chiang_saen.jpg",
        highlights: [
          "Mekong ferry crossing",
          "Laos border entry",
          "Riverside town",
        ],
        highlightsHe: [
          "חציית מעבורת המקונג",
          "כניסה לגבול לאוס",
          "עיירת חוף הנהר",
        ],
      },
      {
        day: 6,
        title: "Luang Namtha & Nam Ha National Park",
        titleHe: "לואנג נאמטה ופארק נאם הא",
        description:
          "Drive through the mountains of Northern Laos to Luang Namtha. Off-road trails through Nam Ha National Protected Area with pristine jungle and ethnic minority villages.",
        descriptionHe:
          "נסיעה דרך ההרים של צפון לאוס ללואנג נאמטה. שבילי שטח דרך שמורת נאם הא עם ג'ונגל בתולי וכפרי מיעוטים אתניים.",
        image: "/images/optimized/vehicle_offroad_scene.jpg",
        highlights: [
          "Off-road jungle trails",
          "Ethnic villages",
          "Pristine nature",
        ],
        highlightsHe: ["שבילי שטח בג'ונגל", "כפרים אתניים", "טבע בתולי"],
      },
      {
        day: 7,
        title: "Nong Khiaw — Mekong River Valley",
        titleHe: "נונג קיאו — עמק נהר המקונג",
        description:
          "Journey to Nong Khiaw, a stunning riverside town nestled between dramatic limestone cliffs along the Nam Ou river. Hike to viewpoints and explore caves.",
        descriptionHe:
          "מסע לנונג קיאו, עיירת חוף נהר מרהיבה בין צוקי גיר דרמטיים לאורך נהר נאם או. טיפוס לתצפיות וחקירת מערות.",
        image: "/images/optimized/nong_khiaw_river.jpg",
        highlights: [
          "Limestone cliff views",
          "River village life",
          "Cave exploration",
        ],
        highlightsHe: ["נוף צוקי גיר", "חיי כפר הנהר", "חקירת מערות"],
      },
      {
        day: 8,
        title: "Nong Khiaw → Luang Prabang",
        titleHe: "נונג קיאו → לואנג פרבאנג",
        description:
          "Scenic drive along the Nam Ou river to the UNESCO World Heritage city of Luang Prabang. Arrive in time for the famous night market and sunset on the Mekong.",
        descriptionHe:
          'נסיעה ציורית לאורך נהר נאם או לעיר מורשת עולמית של יונסק"ו לואנג פרבאנג. הגעה בזמן לשוק הלילה המפורסם ולשקיעה על המקונג.',
        image: "/images/optimized/luang_prabang_temple.jpg",
        highlights: [
          "Scenic river drive",
          "UNESCO World Heritage",
          "Night market",
        ],
        highlightsHe: ["נסיעה ציורית לחוף הנהר", "מורשת עולמית", "שוק לילה"],
      },
      {
        day: 9,
        title: "Luang Prabang — Temples & Waterfalls",
        titleHe: "לואנג פרבאנג — מקדשים ומפלים",
        description:
          "Full day exploring Luang Prabang. Early morning alms giving ceremony, Royal Palace Museum, Wat Xieng Thong, and the spectacular Kuang Si Waterfalls with turquoise pools.",
        descriptionHe:
          "יום שלם בחקירת לואנג פרבאנג. טקס נתינת הצדקה בבוקר מוקדם, מוזיאון הארמון המלכותי, ואט שיאנג טונג ומפלי קואנג סי המרהיבים עם בריכות טורקיז.",
        image: "/images/optimized/kuang_si_waterfall_laos.jpg",
        highlights: [
          "Alms giving ceremony",
          "Ancient temples",
          "Kuang Si Falls",
        ],
        highlightsHe: ["טקס נתינת צדקה", "מקדשים עתיקים", "מפלי קואנג סי"],
      },
      {
        day: 10,
        title: "Luang Prabang → Vang Vieng",
        titleHe: "לואנג פרבאנג → וואנג ויאנג",
        description:
          "Drive south through mountainous terrain to Vang Vieng. Dramatic karst landscapes, blue lagoons, and cave systems. Off-road trails along the Nam Song river valley.",
        descriptionHe:
          "נסיעה דרומה דרך שטח הררי לוואנג ויאנג. נופי קרסט דרמטיים, לגונות כחולות ומערכות מערות. שבילי שטח לאורך עמק נהר נאם סונג.",
        image: "/images/optimized/vang_vieng_mountains.jpg",
        highlights: ["Karst landscapes", "Blue lagoons", "Cave systems"],
        highlightsHe: ["נופי קרסט", "לגונות כחולות", "מערכות מערות"],
      },
      {
        day: 11,
        title: "Vang Vieng → Vientiane",
        titleHe: "וואנג ויאנג → ויינטיאן",
        description:
          "Continue to the Lao capital Vientiane. Visit Patuxai (Victory Gate), Pha That Luang golden stupa, and explore the charming riverside promenade along the Mekong.",
        descriptionHe:
          "המשך לבירת לאוס ויינטיאן. ביקור בפטוקסאי (שער הניצחון), סטופת פה טאט לואנג המוזהבת וחקירת הטיילת הקסומה לחוף המקונג.",
        image: "/images/optimized/vientiane_pha_that_luang.jpg",
        highlights: ["Lao capital city", "Golden stupa", "Mekong promenade"],
        highlightsHe: ["בירת לאוס", "סטופה מוזהבת", "טיילת המקונג"],
      },
      {
        day: 12,
        title: "Vientiane → Border Crossing → Loei (Thailand)",
        titleHe: "ויינטיאן → חציית גבול → לואי (תאילנד)",
        description:
          "Cross back into Thailand via the Friendship Bridge. Drive into Loei province — Thailand's wild northeast with stunning mountain scenery and the famous Phu Kradueng cliffs.",
        descriptionHe:
          "חזרה לתאילנד דרך גשר הידידות. נסיעה למחוז לואי — הצפון-מזרח הפראי של תאילנד עם נוף הרים מרהיב וצוקי פו קראדואנג המפורסמים.",
        image: "/images/optimized/mountain_peak_sunrise_golden.jpg",
        highlights: [
          "Friendship Bridge crossing",
          "Loei mountains",
          "Thai-Lao border",
        ],
        highlightsHe: ["חציית גשר הידידות", "הרי לואי", "גבול תאי-לאוס"],
      },
      {
        day: 13,
        title: "Loei → Chiang Khan → Phitsanulok",
        titleHe: "לואי → צ'יאנג קאן → פיצנולוק",
        description:
          "Morning visit to the charming Mekong riverside town of Chiang Khan with its colorful walking street. Drive through central Thailand's countryside to Phitsanulok.",
        descriptionHe:
          "ביקור בוקר בעיירת חוף המקונג הקסומה צ'יאנג קאן עם רחוב ההליכה הצבעוני שלה. נסיעה דרך הכפר של מרכז תאילנד לפיצנולוק.",
        image: "/images/optimized/river_sunrise.jpg",
        highlights: [
          "Chiang Khan walking street",
          "Mekong views",
          "Thai countryside",
        ],
        highlightsHe: ["רחוב ההליכה בצ'יאנג קאן", "נוף המקונג", "כפר תאילנדי"],
      },
      {
        day: 14,
        title: "Return to Chiang Mai — Grand Finale",
        titleHe: "חזרה לצ'יאנג מאי — סיום גדול",
        description:
          "Final drive back to Chiang Mai through the scenic central highlands. Stop at Sukhothai Historical Park (UNESCO) if time permits. Arrive in Chiang Mai by evening. Farewell dinner celebration.",
        descriptionHe:
          "נסיעה אחרונה חזרה לצ'יאנג מאי דרך הרמה המרכזית הציורית. עצירה בפארק ההיסטורי סוקוטאי (יונסק\"ו) אם הזמן מאפשר. הגעה לצ'יאנג מאי עד הערב. ארוחת ערב חגיגית לסיום.",
        image: "/images/optimized/mountain_sunset_golden.jpg",
        highlights: [
          "Sukhothai UNESCO site",
          "Scenic highlands",
          "Farewell celebration",
        ],
        highlightsHe: ['אתר יונסק"ו סוקוטאי', "רמה ציורית", "חגיגת סיום"],
      },
    ],
  },
};

/* ─── Tour image map for DB-based packages ─── */
const TOUR_IMAGE_MAP: Record<string, string> = {
  "doi-inthanon-roof-of-thailand": "doi_inthanon_peak",
  "mae-kampong-hidden-village": "mountain_village_view",
  "maerim-sticky-waterfalls": "sticky_waterfalls",
  "doi-suthep-pui-beyond-temple": "doi_suthep_temple",
  "mae-wang-jungle-wilderness": "mae_wang_elephants",
  "samoeng-loop-mountain-circuit": "samoeng_valley",
};

export default function PackageDetail() {
  const { t, language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: dbPkg, isLoading } = trpc.package.getBySlug.useQuery(
    { slug },
    { enabled: slug.length > 0 }
  );

  const fallback = FALLBACK_PACKAGES[slug];
  const hasFallback = !dbPkg && !!fallback;
  const hasData = !!dbPkg || hasFallback;

  const packageName = dbPkg
    ? t(dbPkg.name, dbPkg.nameHe)
    : fallback
      ? t(fallback.name, fallback.nameHe)
      : t("Package Details", "פרטי החבילה");

  const packageDesc = dbPkg
    ? t(dbPkg.description || "", dbPkg.descriptionHe || dbPkg.description || "")
    : fallback
      ? t(fallback.description, fallback.descriptionHe)
      : "";

  usePageMeta({
    title: `${packageName} | WIRO 4x4`,
    description:
      packageDesc ||
      t(
        "Multi-day tour package in Northern Thailand.",
        "חבילת סיור מרובת ימים בצפון תאילנד."
      ),
    canonicalPath: `/packages/${slug}`,
    jsonLd: hasData
      ? {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: dbPkg?.name || fallback?.name || "",
          description:
            dbPkg?.description ||
            fallback?.description ||
            "Multi-day tour package",
          touristType: "Adventure travelers",
          offers: {
            "@type": "Offer",
            price: dbPkg?.discountedPrice || fallback?.price || 0,
            priceCurrency: "THB",
            availability: "https://schema.org/InStock",
          },
          provider: {
            "@type": "TourOperator",
            name: "WIRO 4x4",
            url: "https://www.wiro4x4indochina.com",
          },
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 flex items-center justify-center"
        >
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  /* ─── Not found ─── */
  if (!hasData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 container mx-auto px-4 py-16 text-center"
        >
          <h1 className="text-3xl font-bold text-primary mb-4">
            {t("Package Not Found", "החבילה לא נמצאה")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              "The package you're looking for doesn't exist or has been removed.",
              "החבילה שחיפשתם לא קיימת או הוסרה."
            )}
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Home", "חזרה לדף הבית")}
            </Button>
          </Link>
        </main>
        <Footer />
        <FloatingActionButtons />
      </div>
    );
  }

  /* ─── Fallback rendering (multi-day itinerary) ─── */
  if (hasFallback) {
    const pkg = fallback!;
    const whatsappMsg = encodeURIComponent(
      `Hi! I'm interested in the ${pkg.name} package. Can you tell me more?`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${whatsappMsg}`;

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          {/* Hero */}
          <section className="relative h-72 md:h-96">
            <img
              src={pkg.coverImage}
              alt={t(pkg.name, pkg.nameHe)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
              <Breadcrumb
                items={[
                  {
                    label: t("Adventures", "הרפתקאות"),
                    href: "/",
                  },
                  { label: t(pkg.name, pkg.nameHe) },
                ]}
              />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-normal text-white mt-2">
                {t(pkg.name, pkg.nameHe)}
              </h1>
            </div>
          </section>

          <div className="container mx-auto px-4 py-10">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* Description */}
                <p className="text-lg text-foreground/70 leading-relaxed">
                  {t(pkg.description, pkg.descriptionHe)}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm bg-background dark:bg-card px-4 py-2.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-accent" />
                    {t(pkg.duration, pkg.durationHe)}
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-background dark:bg-card px-4 py-2.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-accent" />
                    {t(pkg.location, pkg.locationHe)}
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-background dark:bg-card px-4 py-2.5 rounded-lg">
                    <Users className="w-4 h-4 text-accent" />
                    {t(pkg.groupSize, pkg.groupSizeHe)}
                  </div>
                </div>

                {/* Day-by-Day Itinerary */}
                <section>
                  <h2 className="text-2xl md:text-3xl font-heading font-normal mb-6">
                    {t("Day-by-Day Itinerary", "מסלול יום אחר יום")}
                  </h2>
                  <div className="space-y-4">
                    {pkg.itinerary.map(day => (
                      <Card
                        key={day.day}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-52 h-44 sm:h-auto shrink-0">
                            <OptimizedImage
                              src={day.image}
                              alt={t(day.title, day.titleHe)}
                              sizes="(max-width: 640px) 100vw, 208px"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-accent-cta text-white text-xs font-bold px-2.5 py-1 rounded">
                              {t("Day", "יום")} {day.day}
                            </div>
                          </div>
                          <div className="p-5 flex-1">
                            <h3 className="text-lg font-bold mb-2">
                              {t(day.title, day.titleHe)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {t(day.description, day.descriptionHe)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(language === "he"
                                ? day.highlightsHe
                                : day.highlights
                              ).map(h => (
                                <span
                                  key={h}
                                  className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* What's Included */}
                <section>
                  <h2 className="text-2xl md:text-3xl font-heading font-normal mb-6">
                    {t("What's Included", "מה כלול")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(language === "he" ? pkg.includedHe : pkg.included).map(
                      item => (
                        <div
                          key={item}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </section>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white dark:bg-card border border-accent/20 rounded-2xl p-6 shadow-lg space-y-5">
                  <h3 className="font-heading font-normal text-xl flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-accent" />
                    {t("Trip Overview", "סקירת המסע")}
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Duration", "משך")}
                        </div>
                        <div className="text-muted-foreground">
                          {t(pkg.duration, pkg.durationHe)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Group Size", "גודל קבוצה")}
                        </div>
                        <div className="text-muted-foreground">
                          {t(pkg.groupSize, pkg.groupSizeHe)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Utensils className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Kosher Support", "תמיכה כשרה")}
                        </div>
                        <div className="text-muted-foreground">
                          {t("Available on request", "זמין לפי בקשה")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">
                          {t("Accommodation", "לינה")}
                        </div>
                        <div className="text-muted-foreground">
                          {t(
                            "Hotels & mountain lodges",
                            "מלונות ולודג'ים בהרים"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      {t("Starting from", "החל מ-")}
                    </div>
                    <div className="text-3xl font-heading font-normal text-accent">
                      {formatUSD(pkg.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("per person", "לאדם")}
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className="w-full bg-accent-cta hover:bg-accent-cta-hover text-white font-bold"
                      size="lg"
                    >
                      {t("Inquire via WhatsApp", "פנו אלינו בוואטסאפ")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>

                  <Link href="/book">
                    <Button variant="outline" className="w-full" size="lg">
                      {t("Book Online", "הזמנה אונליין")}
                    </Button>
                  </Link>

                  <Link
                    href="/"
                    className="block text-center text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    {t("All Adventures", "כל ההרפתקאות")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <FloatingActionButtons />
      </div>
    );
  }

  /* ─── DB-based package rendering (existing behavior) ─── */
  const pkg = dbPkg!;
  const coverSlug = pkg.tourSlugs[0];
  const coverImgName = coverSlug ? TOUR_IMAGE_MAP[coverSlug] : null;
  const coverSrc = pkg.coverImage || coverImgName || "samoeng_valley";
  const bookUrl = `/book?tours=${pkg.tourSlugs.join(",")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative h-64 md:h-80">
          <OptimizedImage
            src={coverSrc}
            alt={packageName}
            priority
            sizes="100vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
            <Breadcrumb
              items={[
                {
                  label: t("Tour Packages", "חבילות סיור"),
                  href: "/packages",
                },
                { label: packageName },
              ]}
            />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {packageName}
            </h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {packageDesc && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {packageDesc}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  {pkg.tourSlugs.length} {t("days", "ימים")}
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                  {pkg.tourSlugs.length} {t("destinations", "יעדים")}
                </div>
                {pkg.discountPercent > 0 && (
                  <div className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium">
                    <Tag className="w-4 h-4" />
                    {t("Save", "חסכו")} {pkg.discountPercent}%
                  </div>
                )}
              </div>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {t("Day-by-Day Itinerary", "מסלול יום אחר יום")}
                </h2>
                <div className="space-y-4">
                  {pkg.resolvedTours.map((tour, index) => {
                    const imgName = TOUR_IMAGE_MAP[tour.slug];
                    const imgSrc = imgName || tour.imageUrl || "samoeng_valley";

                    return (
                      <Card key={tour.slug} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-48 h-40 sm:h-auto shrink-0">
                            <OptimizedImage
                              src={imgSrc}
                              alt={t(tour.name, tour.nameHe)}
                              sizes="(max-width: 640px) 100vw, 192px"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                              {t("Day", "יום")} {index + 1}
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="text-lg font-bold mb-1">
                              {t(tour.name, tour.nameHe)}
                            </h3>
                            {tour.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {t(
                                  tour.description,
                                  tour.descriptionHe || tour.description
                                )}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tour.duration}
                              </span>
                              {tour.difficulty && (
                                <span className="flex items-center gap-1 capitalize">
                                  {tour.difficulty}
                                </span>
                              )}
                              {tour.isKosher === 1 && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Check className="w-3 h-3" />
                                  {t("Kosher", "כשר")}
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <Link
                                href={`/tours/${tour.slug}`}
                                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                              >
                                {t("View tour details", "פרטי הסיור")}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  {t("What's Included", "מה כלול")}
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    t(
                      "Private 4x4 vehicle for all days",
                      "רכב 4x4 פרטי לכל הימים"
                    ),
                    t("Hebrew-speaking guide", "מדריך דובר עברית"),
                    t("Hotel pickup & drop-off", "איסוף והחזרה למלון"),
                    t("All entrance fees", "כל דמי הכניסה"),
                    t("Drinking water & snacks", "מים ונשנושים"),
                    t("Package discount applied", "הנחת חבילה מיושמת"),
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  {t("Package Price", "מחיר החבילה")}
                </h3>

                <ul className="space-y-2">
                  {pkg.resolvedTours.map(tour => (
                    <li
                      key={tour.slug}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate mr-2">
                        {t(tour.name, tour.nameHe)}
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {formatUSD(tour.price)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t pt-3 space-y-2">
                  {pkg.savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{t("Original Price", "מחיר מקורי")}</span>
                      <span className="line-through text-muted-foreground">
                        {formatUSD(pkg.originalPrice)}
                      </span>
                    </div>
                  )}
                  {pkg.savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>
                        {t("You Save", "אתם חוסכים")} (-{pkg.discountPercent}
                        %)
                      </span>
                      <span>-{formatUSD(pkg.savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("Total", "סה״כ")}</span>
                    <span className="text-primary">
                      {formatUSD(pkg.discountedPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("Price per person", "מחיר לאדם")}
                  </p>
                </div>

                <Link href={bookUrl}>
                  <Button className="w-full" size="lg">
                    {t("Book This Package", "הזמנת החבילה")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Link
                  href="/packages"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  {t("Browse all packages", "כל החבילות")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
