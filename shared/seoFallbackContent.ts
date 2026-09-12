export const CORE_TOUR_SLUGS = [
  "doi-inthanon-roof-of-thailand",
  "mae-kampong-hidden-village",
  "maerim-sticky-waterfalls",
  "doi-suthep-pui-beyond-temple",
  "mae-wang-jungle-wilderness",
  "samoeng-loop-mountain-circuit",
] as const;

export interface FallbackBlogPostMeta {
  slug: string;
  title: string;
  titleHe: string;
  excerpt: string;
  excerptHe: string;
  coverImage: string;
  category: string;
  tags: string;
  publishedAt: string;
  showWhenDatabaseHasContent?: boolean;
}

export const FALLBACK_BLOG_POSTS: readonly FallbackBlogPostMeta[] = [
  {
    slug: "kosher-dining-guide",
    title: "Kosher Dining Guide for Northern Thailand",
    titleHe: "איך שומרים כשרות בצפון תאילנד -- המדריך המלא",
    excerpt:
      "Plan kosher food in Chiang Mai with practical guidance for Shabbat meals, tour-day supplies, supermarket shopping, and advance coordination.",
    excerptHe:
      "תכננו אוכל כשר בצ'יאנג מאי עם מידע מעשי על ארוחות שבת, ציוד לימי טיול, קניות בסופר ותיאום מראש.",
    coverImage: "/images/optimized/village_hamlet_rice_fields.jpg",
    category: "Food & Kosher",
    tags: "kosher,food,chiang-mai,shabbat",
    publishedAt: "2024-12-07",
  },
  {
    slug: "israeli-traveler-tips",
    title: "Israeli Traveler Tips for Southeast Asia",
    titleHe: "המדריך השלם למטייל הישראלי בדרום מזרח אסיה",
    excerpt:
      "Prepare for Northern Thailand and neighboring countries with practical advice on documents, transport, cultural respect, Shabbat planning, and rural travel.",
    excerptHe:
      "התכוננו לצפון תאילנד ולמדינות השכנות עם טיפים מעשיים על מסמכים, תחבורה, כבוד לתרבות, שבת וטיולים באזורים כפריים.",
    coverImage: "/images/optimized/waterfall_lush_jungle.jpg",
    category: "Travel Tips",
    tags: "travel-tips,israel,southeast-asia,planning",
    publishedAt: "2024-12-07",
  },
  {
    slug: "cultural-etiquette",
    title: "Cultural Etiquette Guide for Indochina",
    titleHe: "איך להתנהג באינדוסין -- המדריך התרבותי",
    excerpt:
      "Travel respectfully through Thailand, Laos, and Vietnam with practical guidance for temples, villages, photography, markets, and local customs.",
    excerptHe:
      "טיילו בכבוד בתאילנד, לאוס ווייטנאם עם כללים מעשיים למקדשים, כפרים, צילום, שווקים ומנהגים מקומיים.",
    coverImage: "/images/optimized/hilltribe_girl_craft_market-md.webp",
    category: "Culture",
    tags: "culture,etiquette,temples,thailand",
    publishedAt: "2024-12-07",
  },
  {
    slug: "off-road-adventure-guide",
    title: "What to Expect on a 4x4 Off-Road Tour",
    titleHe: "מה לצפות מטיול שטח ב-4x4",
    excerpt:
      "Learn how a private Chiang Mai 4x4 tour works, what to wear and bring, how routes change with the weather, and how to choose between guided and self-drive travel.",
    excerptHe:
      "גלו איך נראה טיול 4x4 פרטי בצ'יאנג מאי, מה ללבוש ולהביא, איך מזג האוויר משנה את המסלול ואיך לבחור בין מדריך לנהיגה עצמית.",
    coverImage: "/images/optimized/offroad_trail_driving-md.webp",
    category: "Adventures",
    tags: "off-road,4x4,chiang-mai,adventure,guide",
    publishedAt: "2024-12-07",
  },
  {
    slug: "doi-inthanon-experience",
    title: "Doi Inthanon: Thailand's Highest Peak Experience",
    titleHe: "דוי אינתנון: חוויית הפסגה הגבוהה בתאילנד",
    excerpt:
      "Plan a private Doi Inthanon day trip from Chiang Mai, including mountain weather, waterfalls, viewpoints, village stops, and practical packing advice.",
    excerptHe:
      "תכננו יום פרטי בדוי אינתנון מצ'יאנג מאי עם מזג אוויר הררי, מפלים, תצפיות, עצירות בכפרים וטיפים לאריזה.",
    coverImage: "/images/optimized/doi_inthanon_royal_pagoda-md.webp",
    category: "Destinations",
    tags: "doi-inthanon,chiang-mai,mountains,waterfalls,private-tour",
    publishedAt: "2024-12-07",
  },
  {
    slug: "elephant-sanctuary-guide",
    title: "Ethical Elephant Encounters in Chiang Mai",
    titleHe: "מפגשים אתיים עם פילים בצ'יאנג מאי",
    excerpt:
      "Use a practical welfare checklist to compare elephant experiences near Chiang Mai, recognize red flags, and plan a respectful family visit.",
    excerptHe:
      "השתמשו ברשימת בדיקה מעשית לרווחת בעלי חיים כדי להשוות חוויות פילים ליד צ'יאנג מאי, לזהות סימני אזהרה ולתכנן ביקור משפחתי מכבד.",
    coverImage: "/images/optimized/elephant_bathing.webp",
    category: "Activities",
    tags: "elephants,animal-welfare,chiang-mai,family-travel",
    publishedAt: "2024-12-07",
  },
  {
    slug: "samoeng-loop-guide-chiang-mai",
    title: "Samoeng Loop from Chiang Mai: A Practical Mountain Route Guide",
    titleHe: "לולאת סמואנג מצ'יאנג מאי: מדריך מעשי למסלול ההרים",
    excerpt:
      "Plan a flexible Samoeng Loop day from Chiang Mai with forest roads, viewpoints, farms, village stops, route stages, weather checks, and private 4x4 or motorcycle options.",
    excerptHe:
      "תכננו יום גמיש בלולאת סמואנג מצ'יאנג מאי עם דרכי יער, תצפיות, חוות, כפרים, מקטעי מסלול, בדיקות מזג אוויר ואפשרויות 4x4 או אופנוע.",
    coverImage: "/images/optimized/samoeng_valley.webp",
    category: "Destinations",
    tags: "samoeng-loop,chiang-mai,4x4,motorcycle,mountains,travel-guide",
    publishedAt: "2026-09-13",
    showWhenDatabaseHasContent: true,
  },
  {
    slug: "mae-hong-son-loop-guide-chiang-mai",
    title: "Mae Hong Son Loop from Chiang Mai: How to Plan 4, 5 or 6 Days",
    titleHe: "לולאת מאה הונג סון מצ'יאנג מאי: איך לתכנן 4, 5 או 6 ימים",
    excerpt:
      "Use this route-planning guide to choose a realistic Mae Hong Son Loop pace, compare motorcycle and private 4x4 travel, and decide which stops deserve more time.",
    excerptHe:
      "בחרו קצב מציאותי ללולאת מאה הונג סון, השוו בין אופנוע ל-4x4 פרטי והחליטו אילו עצירות ראויות ליותר זמן.",
    coverImage: "/images/optimized/mae-hong-son-loop-route.webp",
    category: "Destinations",
    tags: "mae-hong-son-loop,northern-thailand,motorcycle,4x4,pai,route-planning",
    publishedAt: "2026-09-13",
    showWhenDatabaseHasContent: true,
  },
  {
    slug: "mae-kampong-or-samoeng",
    title:
      "Mae Kampong or Samoeng Loop? Choosing the Right Chiang Mai Mountain Day",
    titleHe: "מאה קמפונג או לולאת סמואנג? איך לבחור יום הרים בצ'יאנג מאי",
    excerpt:
      "Compare Mae Kampong's slower village-and-forest rhythm with the wider Samoeng mountain circuit, then choose the WIRO route that matches your group.",
    excerptHe:
      "השוו בין הקצב הרגוע של מאה קמפונג לבין מעגל ההרים הרחב של סמואנג ובחרו את מסלול WIRO שמתאים לקבוצה שלכם.",
    coverImage: "/images/optimized/mae-kampong-village.webp",
    category: "Trip Planning",
    tags: "mae-kampong,samoeng-loop,chiang-mai-day-trip,family-travel,4x4",
    publishedAt: "2026-09-13",
    showWhenDatabaseHasContent: true,
  },
  {
    slug: "chiang-mai-4x4-day-trips-by-interest",
    title: "6 Chiang Mai Places to Visit That Fit a Private WIRO 4x4 Tour",
    titleHe: "6 מקומות לבקר בהם בצ'יאנג מאי שמתאימים לטיול 4x4 פרטי של WIRO",
    excerpt:
      "Match your Chiang Mai day to the places your group wants to experience: Thailand's highest peak, villages, waterfalls, temple viewpoints, jungle tracks, or the Samoeng circuit.",
    excerptHe:
      "התאימו את היום בצ'יאנג מאי למקומות שהקבוצה רוצה לחוות: ההר הגבוה בתאילנד, כפרים, מפלים, תצפיות, דרכי ג'ונגל או מעגל סמואנג.",
    coverImage: "/images/optimized/chiang_mai_tour_photo.webp",
    category: "Trip Planning",
    tags: "chiang-mai,day-trips,4x4,tour-planning,doi-inthanon,mae-kampong",
    publishedAt: "2026-09-13",
    showWhenDatabaseHasContent: true,
  },
] as const;

export function getFallbackBlogPost(
  slug: string
): FallbackBlogPostMeta | undefined {
  return FALLBACK_BLOG_POSTS.find(post => post.slug === slug);
}
