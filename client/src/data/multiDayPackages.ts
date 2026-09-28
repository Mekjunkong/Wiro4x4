/**
 * The hand-written multi-day packages (shown by PackageDetail when the slug
 * is not in the database, and as expedition cards on the packages page).
 */
/* ─── Fallback itinerary day type ─── */
export interface ItineraryDay {
  day: number;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  image: string;
  highlights: string[];
  highlightsHe: string[];
}

export interface FallbackPackage {
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
export const FALLBACK_PACKAGES: Record<string, FallbackPackage> = {
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
