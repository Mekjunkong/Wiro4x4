import type { HardcodedPost } from "./hardcodedPosts";

type TranslationFn = (en: string, he: string) => string;

export function getAdditionalHardcodedPosts(
  t: TranslationFn
): Record<string, HardcodedPost> {
  return {
    "off-road-adventure-guide": {
      title: t(
        "What to Expect on a 4x4 Off-Road Tour",
        "מה לצפות מטיול שטח ב-4x4"
      ),
      date: t("December 7, 2024", "7 דצמבר 2024"),
      readTime: t("5 min read", "5 דקות קריאה"),
      image: "/images/optimized/offroad_trail_driving-md.webp",
      content: t(
        `# What to Expect on a Private 4x4 Tour in Chiang Mai

A 4x4 day is not simply a faster way to reach a viewpoint. The vehicle lets a local guide connect mountain roads, farming areas, forest tracks, waterfalls, and village stops that would be difficult to combine by ordinary car. The best route is flexible: road conditions, rain, visibility, and the group's comfort all shape the day.

## Before the tour

Tell the operator about children, older travelers, mobility needs, food requirements, and anyone who becomes uncomfortable on winding roads. Ask what is included, whether the trip is private, how long the driving sections are, and where hotel pickup is available.

For WIRO trips, confirm the exact route and kosher-friendly meal plan before the day. Start with the [full tour list](/tours), then ask for a route matched to your group.

## What to wear and bring

- Closed shoes with useful grip
- Light, quick-drying clothes
- A warm layer for higher elevations
- Sun protection and insect repellent
- A reusable water bottle
- Personal medicine and motion-sickness medicine if needed
- A waterproof pouch for your phone during the rainy season

Keep luggage small. A light day bag is easier to secure inside the vehicle and carry during short walks.

## How weather changes the route

Northern Thailand's mountain weather can change quickly. Rain may make a track muddy or unsafe, while low cloud can hide a viewpoint. A responsible guide may shorten, reverse, or replace part of the route. That is good risk management, not a missed promise.

The dry season usually offers firmer tracks, while the green season brings fuller waterfalls and lush scenery. Neither season guarantees a specific road condition. Follow the driver's instructions and never pressure the team to use a closed or unsafe section.

## Guided tour or self-drive?

Self-driving can suit experienced travelers who understand local road rules, vehicle insurance, mountain driving, and recovery procedures. A guided private tour is usually simpler for visitors: the guide handles navigation, changing conditions, local communication, and timing.

If you want a wilder day, look at the [Mae Wang Jungle Wilderness route](/tours/mae-wang-jungle-wilderness). Families or first-time visitors can request gentler tracks and more scenic stops.

## A good 4x4 day

Expect an early start, several driving sections, short walks, photo stops, and a relaxed meal break. The aim is not to drive aggressively. It is to reach quieter landscapes safely and leave enough time to meet people and enjoy the place.

[Contact WIRO 4x4](/contact) with your dates, group size, ages, and preferred pace. The team can suggest a realistic route and confirm current conditions before departure.`,
        `# למה לצפות מטיול 4x4 פרטי בצ'יאנג מאי

טיול 4x4 הוא לא רק דרך מהירה יותר להגיע לתצפית. הרכב מאפשר למדריך מקומי לחבר בין כבישי הרים, אזורי חקלאות, שבילי יער, מפלים וכפרים שקשה לשלב ברכב רגיל. המסלול הטוב ביותר נשאר גמיש: מצב הדרך, הגשם, הראות והנוחות של הקבוצה משפיעים על היום.

## לפני הטיול

ספרו למפעיל על ילדים, מטיילים מבוגרים, מגבלות תנועה, דרישות מזון וכל מי שרגיש לכבישים מפותלים. שאלו מה כלול, האם הטיול פרטי, כמה זמן נמשכים קטעי הנהיגה ומאילו מלונות אפשר לקבל איסוף.

בטיולי WIRO חשוב לאשר מראש את המסלול ואת תכנון האוכל הידידותי לכשרות. התחילו ב[רשימת הטיולים](/tours) ובקשו מסלול שמתאים לקבוצה שלכם.

## מה ללבוש ולהביא

- נעליים סגורות עם אחיזה טובה
- בגדים קלים שמתייבשים מהר
- שכבה חמה לאזורים הגבוהים
- הגנה מהשמש וחומר נגד יתושים
- בקבוק מים רב-פעמי
- תרופות אישיות ותרופה נגד בחילה במידת הצורך
- נרתיק עמיד למים לטלפון בעונה הגשומה

עדיף תיק יום קטן שקל לאבטח ברכב ולקחת להליכות קצרות.

## איך מזג האוויר משנה את המסלול

מזג האוויר בהרים של צפון תאילנד יכול להשתנות במהירות. גשם עלול להפוך שביל לבוצי או לא בטוח, ועננים נמוכים יכולים להסתיר תצפית. מדריך אחראי עשוי לקצר, להפוך או להחליף חלק מהמסלול. זו החלטת בטיחות נכונה.

בעונה היבשה השבילים בדרך כלל יציבים יותר, ובעונה הירוקה המפלים מלאים והנוף שופע. אף עונה לא מבטיחה מצב דרך מסוים. הקשיבו לנהג ואל תלחצו להיכנס לקטע סגור או מסוכן.

## טיול מודרך או נהיגה עצמית?

נהיגה עצמית יכולה להתאים למטיילים מנוסים שמבינים את חוקי הדרך, ביטוח הרכב, נהיגת הרים וחילוץ. לרוב המבקרים טיול פרטי מודרך פשוט יותר: המדריך מטפל בניווט, בשינויים, בתקשורת המקומית ובזמנים.

ליום הרפתקני יותר בדקו את [מסלול הג'ונגל של מאה וואנג](/tours/mae-wang-jungle-wilderness). משפחות ומטיילים בפעם הראשונה יכולים לבקש שבילים רגועים יותר ויותר עצירות נוף.

## איך נראה יום טוב בשטח

צפו ליציאה מוקדמת, כמה קטעי נהיגה, הליכות קצרות, עצירות צילום וארוחה רגועה. המטרה אינה נהיגה אגרסיבית, אלא הגעה בטוחה לנופים שקטים עם זמן ליהנות מהמקום.

[צרו קשר עם WIRO 4x4](/contact) עם התאריכים, גודל הקבוצה, הגילים והקצב הרצוי. הצוות יציע מסלול מציאותי ויאשר את תנאי הדרך לפני היציאה.`
      ),
    },
    "doi-inthanon-experience": {
      title: t(
        "Doi Inthanon: Thailand's Highest Peak Experience",
        "דוי אינתנון: חוויית הפסגה הגבוהה בתאילנד"
      ),
      date: t("December 7, 2024", "7 דצמבר 2024"),
      readTime: t("5 min read", "5 דקות קריאה"),
      image: "/images/optimized/doi_inthanon_royal_pagoda-md.webp",
      content: t(
        `# Planning a Doi Inthanon Day Trip from Chiang Mai

Doi Inthanon combines cool mountain air, forest, waterfalls, viewpoints, and highland communities in one long day from Chiang Mai. It is a strong choice for families and first-time visitors, but the mountain deserves more planning than a simple city excursion.

## What a private day can include

A well-paced route may combine the summit area, a nature trail or short forest walk, a waterfall, the royal pagoda gardens, and a village or local market stop. Trying to include every attraction can make the day feel rushed. Choose two or three priorities and let the guide adjust the order around weather and traffic.

See the [private Doi Inthanon tour](/tours/doi-inthanon-roof-of-thailand) for the route overview, then confirm the current stops before booking.

## Mountain weather and clothing

Conditions near the summit are noticeably cooler than Chiang Mai city. Mornings can be misty, windy, or wet even when the city is warm. Bring a light jacket, a rain layer, closed shoes, and sun protection. Families should pack a spare dry layer for children.

Cloud is part of the mountain experience, but it can reduce visibility. A flexible guide may visit a waterfall first and return to a viewpoint later if conditions improve.

## Walking and accessibility

Not every stop requires a long hike. Some viewpoints and garden areas involve steps or uneven paths, while other stops are close to the vehicle. Tell the operator about mobility concerns before booking so the route can emphasize easier access and comfortable rest breaks.

## Food and timing

The drive from Chiang Mai is substantial, so an early departure protects time on the mountain. If you require kosher food, do not rely on finding it inside the park. Arrange a packed meal or suitable supplies in advance and confirm how food will be stored during the day.

## Respectful village visits

Highland communities are homes, not staged attractions. Ask before photographing people, follow the guide's advice, buy directly from local producers when appropriate, and avoid entering private areas. Coffee, fruit, textiles, and small community enterprises can make a meaningful stop when the visit is welcomed.

## Is Doi Inthanon right for your group?

Choose it if you want varied scenery, cooler air, gentle nature stops, and a full day outside the city. Travelers who dislike long winding drives may prefer a closer Chiang Mai route. A private trip makes it easier to slow down, skip unsuitable stops, and match the day to children or older guests.

[Ask WIRO 4x4 about Doi Inthanon](/contact) with your travel date and group details. Current weather, trail access, and the final itinerary should always be confirmed close to departure.`,
        `# תכנון יום טיול בדוי אינתנון מצ'יאנג מאי

דוי אינתנון משלב אוויר הרים קריר, יער, מפלים, תצפיות וקהילות הרריות ביום ארוך אחד מצ'יאנג מאי. זו בחירה טובה למשפחות ולמבקרים בפעם הראשונה, אבל ההר דורש יותר תכנון מטיול עירוני פשוט.

## מה אפשר לשלב ביום פרטי

מסלול בקצב נכון יכול לשלב את אזור הפסגה, שביל טבע או הליכת יער קצרה, מפל, גני הפגודות המלכותיות ועצירה בכפר או בשוק מקומי. ניסיון להספיק הכול עלול להפוך את היום ללחוץ. בחרו שתיים או שלוש עדיפויות ותנו למדריך להתאים את הסדר למזג האוויר ולתנועה.

ראו את [הטיול הפרטי לדוי אינתנון](/tours/doi-inthanon-roof-of-thailand) ולאחר מכן אשרו את העצירות העדכניות לפני ההזמנה.

## מזג אוויר ולבוש

באזור הפסגה קריר משמעותית מצ'יאנג מאי. הבוקר יכול להיות ערפילי, סוער או רטוב גם כשהעיר חמה. הביאו מעיל קל, שכבת גשם, נעליים סגורות והגנה מהשמש. למשפחות כדאי להביא לילדים שכבה יבשה נוספת.

עננים הם חלק מחוויית ההר, אך הם עלולים להגביל את הראות. מדריך גמיש יכול להתחיל במפל ולחזור לתצפית מאוחר יותר אם התנאים משתפרים.

## הליכה ונגישות

לא כל עצירה דורשת מסלול ארוך. בחלק מהתצפיות והגנים יש מדרגות או שבילים לא ישרים, ואחרות קרובות לרכב. ספרו למפעיל מראש על מגבלות תנועה כדי שהמסלול יתמקד בגישה נוחה ובהפסקות מתאימות.

## אוכל וזמנים

הנסיעה מצ'יאנג מאי משמעותית, ולכן יציאה מוקדמת משאירה זמן על ההר. אם אתם זקוקים לאוכל כשר, אל תסתמכו על מציאתו בתוך הפארק. תאמו ארוחה ארוזה או ציוד מתאים מראש ואשרו כיצד האוכל יישמר לאורך היום.

## ביקור מכבד בכפרים

קהילות ההר הן בתים אמיתיים, לא תפאורה. בקשו רשות לפני צילום אנשים, הקשיבו להנחיות המדריך, קנו ישירות מיצרנים מקומיים כשמתאים ואל תיכנסו לשטח פרטי. קפה, פירות, טקסטיל ועסקים קהילתיים קטנים יכולים ליצור עצירה משמעותית כשהביקור רצוי.

## האם דוי אינתנון מתאים לקבוצה שלכם?

בחרו בו אם אתם רוצים נופים מגוונים, אוויר קריר, עצירות טבע קלות ויום מלא מחוץ לעיר. מי שאינו אוהב נסיעות ארוכות ומפותלות עשוי להעדיף מסלול קרוב יותר. טיול פרטי מקל להאט, לדלג על עצירות לא מתאימות ולהתאים את היום לילדים או למבוגרים.

[שאלו את WIRO 4x4 על דוי אינתנון](/contact) וציינו תאריך ופרטי קבוצה. חשוב לאשר מזג אוויר, גישה לשבילים ומסלול סופי סמוך ליציאה.`
      ),
    },
    "elephant-sanctuary-guide": {
      title: t(
        "Ethical Elephant Encounters in Chiang Mai",
        "מפגשים אתיים עם פילים בצ'יאנג מאי"
      ),
      date: t("December 7, 2024", "7 דצמבר 2024"),
      readTime: t("5 min read", "5 דקות קריאה"),
      image: "/images/optimized/elephant_bathing.webp",
      content: t(
        `# How to Compare Elephant Experiences near Chiang Mai

The word “sanctuary” is not a guarantee of good welfare. Before booking, look past the name and photos. Ask how the elephants spend a normal day, how visitors interact with them, and whether the venue changes its practices when animals show stress.

## Positive signs

- Elephants can move away from visitors
- Groups are small and interactions are closely supervised
- Observation, education, and natural behavior are central
- Staff explain each elephant's background without promising a performance
- Food, shade, water, veterinary care, and rest are clearly discussed
- The venue is transparent about ownership, breeding, transfers, and funding

No facility is perfect, but clear answers and limited visitor control are better signs than a packed activity schedule.

## Red flags

Avoid places centered on riding, tricks, painting, forced poses, chains used for visitor displays, or constant touching. “No riding” alone does not prove strong welfare. Scheduled bathing and feeding can also become performances when elephants cannot opt out.

Photos of people hugging trunks or standing under elephants may look exciting, but close contact can create risk for both animals and visitors. Families should ask about barriers, guide-to-guest ratios, and emergency procedures.

## Questions to ask before paying

1. Can an elephant walk away from an interaction?
2. Are visitors allowed to ride, sit on, or command elephants?
3. Is bathing optional for the animal?
4. How many visitors join each session?
5. What happens when an elephant appears stressed?
6. Is there an independent welfare policy or recent outside assessment?

Answers and conditions can change, so verify them directly with the venue close to your visit.

## Planning the day

Wear closed shoes and clothes that can get dusty or wet. Bring sun protection, water, and insect repellent. Do not feed an elephant outside staff instructions, use flash at close range, or step away from the guide for a better photograph.

WIRO 4x4 is a tour operator, not an elephant sanctuary. If an elephant visit is requested, the team should confirm current availability and welfare practices before suggesting an option. You can also combine rural scenery without animal interaction on the [Mae Wang Jungle Wilderness tour](/tours/mae-wang-jungle-wilderness).

## The respectful choice

The most ethical experience may feel quieter than expected: observing elephants forage, walk, rest, and socialize from a safe distance. That slower experience gives the animal more choice and usually teaches visitors more.

[Contact WIRO 4x4](/contact) if you want help planning a family day near Chiang Mai. Ask for the latest details before deciding, because welfare standards and operating practices can change.`,
        `# איך משווים חוויות פילים ליד צ'יאנג מאי

המילה "מקלט" אינה מבטיחה רווחת בעלי חיים טובה. לפני שמזמינים, הסתכלו מעבר לשם ולתמונות. שאלו איך הפילים מבלים יום רגיל, איך מבקרים מתקשרים איתם והאם המקום משנה פעילות כשפיל מראה סימני לחץ.

## סימנים חיוביים

- הפילים יכולים להתרחק מהמבקרים
- הקבוצות קטנות והמפגש מפוקח היטב
- התבוננות, לימוד והתנהגות טבעית נמצאים במרכז
- הצוות מסביר את הרקע של כל פיל בלי להבטיח מופע
- מדברים בגלוי על מזון, צל, מים, טיפול וטרינרי ומנוחה
- המקום שקוף לגבי בעלות, רבייה, העברות ומימון

אין מקום מושלם, אבל תשובות ברורות ושליטה מוגבלת של המבקר הן סימנים טובים יותר מלוח פעילויות עמוס.

## סימני אזהרה

הימנעו ממקומות שבמרכזם רכיבה, תרגילים, ציור, תנוחות כפויות, שרשראות לתצוגה או מגע מתמשך. הכיתוב "ללא רכיבה" לבדו אינו מוכיח רווחה טובה. גם רחצה והאכלה מתוזמנות יכולות להפוך למופע כשהפיל אינו יכול לבחור להתרחק.

תמונות של חיבוק חדק או עמידה מתחת לפיל נראות מרגשות, אבל מגע קרוב יוצר סיכון לבעלי החיים ולמבקרים. משפחות צריכות לשאול על מחסומים, יחס מדריכים למבקרים ונהלי חירום.

## שאלות שכדאי לשאול לפני תשלום

1. האם פיל יכול להתרחק ממפגש?
2. האם מותר לרכוב, לשבת על פיל או לפקד עליו?
3. האם הרחצה היא בחירה של הפיל?
4. כמה מבקרים משתתפים בכל מפגש?
5. מה עושים כשפיל נראה לחוץ?
6. האם קיימת מדיניות רווחה עצמאית או בדיקה חיצונית עדכנית?

תשובות ותנאים יכולים להשתנות, ולכן חשוב לאמת אותם ישירות מול המקום סמוך לביקור.

## תכנון היום

לבשו נעליים סגורות ובגדים שיכולים להתלכלך או להירטב. הביאו הגנה מהשמש, מים וחומר נגד יתושים. אל תאכילו פיל בלי הוראות הצוות, אל תשתמשו בפלאש מקרוב ואל תתרחקו מהמדריך בשביל תמונה.

WIRO 4x4 הוא מפעיל טיולים, לא מקלט פילים. אם מבקשים ביקור עם פילים, הצוות צריך לאשר זמינות ושיטות רווחה עדכניות לפני המלצה. אפשר גם ליהנות מנוף כפרי ללא מפגש עם בעלי חיים ב[טיול הג'ונגל של מאה וואנג](/tours/mae-wang-jungle-wilderness).

## הבחירה המכבדת

החוויה האתית ביותר עשויה להיות שקטה יותר מהצפוי: לצפות בפילים מחפשים מזון, הולכים, נחים ומתקשרים ממרחק בטוח. כך לפיל נשארת יותר בחירה, והמבקר בדרך כלל לומד יותר.

[צרו קשר עם WIRO 4x4](/contact) אם אתם רוצים עזרה בתכנון יום משפחתי ליד צ'יאנג מאי. בקשו פרטים עדכניים לפני החלטה, כי תקני רווחה ושיטות הפעלה יכולים להשתנות.`
      ),
    },
  };
}
