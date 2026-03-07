/**
 * Blog Article Seed Script — Batch 4 (1 article)
 *
 * Run with: npx tsx server/seed-blog-batch4.ts
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { blogPosts } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const articles = [
  // ─── Article 10: Accessibility-Friendly Tours in Chiang Mai ───
  {
    title: "Accessibility-Friendly Tours in Chiang Mai",
    titleHe: "סיורים נגישים בצ'יאנג מאי",
    slug: "accessibility-friendly-tours-chiang-mai",
    coverImage: "/images/optimized/accessible_wheelchair_assist.jpg",
    excerpt:
      "Chiang Mai is more accessible than you think. Discover how WIRO 4x4 adapts off-road tours for travelers with mobility challenges, seniors, and anyone who needs a little extra support to explore Northern Thailand.",
    excerptHe:
      "צ'יאנג מאי נגישה יותר ממה שאתם חושבים. גלו איך WIRO 4x4 מתאים סיורי שטח למטיילים עם מגבלות ניידות, קשישים וכל מי שצריך קצת תמיכה נוספת כדי לחקור את צפון תאילנד.",
    category: "Accessibility",
    tags: "accessibility,wheelchair,seniors,inclusive travel,chiang mai,4x4",
    content: `# Accessibility-Friendly Tours in Chiang Mai

Adventure travel and accessibility don't have to be mutually exclusive. At WIRO 4x4, we believe that everyone deserves to experience the jaw-dropping beauty of Northern Thailand's mountains, temples, and jungles — regardless of mobility level, age, or physical ability. This guide explains how we make that happen and which tours work best for travelers who need accessibility accommodations.

## Why 4x4 Touring Is Actually Great for Accessibility

Here's something most people don't realize: a well-equipped 4x4 vehicle is one of the best accessibility tools in the world. While backpackers hike for hours to reach remote viewpoints and waterfalls, our guests ride in comfort to the same destinations — and sometimes to places no public transport can reach.

**The 4x4 advantage for accessible travel:**
- **Door-to-destination service** — no long walks from distant parking lots
- **High ground clearance vehicles** sit at a comfortable transfer height for wheelchair users
- **Air-conditioned comfort** — no heat exhaustion concerns on hot days
- **Flexible pacing** — we stop as often as needed, for as long as needed
- **Private tours** — no rushing to keep up with a group; your tour, your pace

Our Toyota Hilux and Fortuner fleet vehicles have wide-opening doors, spacious cabins, and can accommodate folded wheelchairs and mobility aids in the cargo area with ease.

## Accessibility Levels: Understanding Your Options

Not every trail in Chiang Mai is wheelchair-accessible — we're honest about that. But many of the most spectacular experiences absolutely are, and others can be adapted with advance planning. We categorize our tours into three accessibility levels:

### Level 1: Fully Accessible (Minimal Walking Required)

These experiences involve little to no walking. Guests remain in or very near the vehicle for scenic viewpoints, with paved or flat surfaces at key stops.

**Best tours at this level:**
- **[Doi Suthep & Beyond](/tours/doi-suthep-pui-beyond-temple)** — The temple complex has a tram/elevator system to bypass the famous 306-step staircase. The panoramic viewpoint over Chiang Mai is accessible by vehicle. Garden areas around the temple are paved and relatively flat.
- **[Samoeng Loop Mountain Circuit](/tours/samoeng-loop-mountain-circuit)** — This scenic driving route features numerous roadside viewpoints where you can enjoy mountain panoramas without leaving the vehicle. We stop at flat, accessible market areas and coffee shops along the route.

### Level 2: Moderately Accessible (Some Assistance Needed)

These tours include stops with uneven terrain, short dirt paths, or gentle slopes. Guests who can walk short distances with assistance (cane, walker, or helping hand) will enjoy these experiences fully.

**Best tours at this level:**
- **[Doi Inthanon — Roof of Thailand](/tours/doi-inthanon-roof-of-thailand)** — Thailand's highest peak is accessible by vehicle all the way to the summit. The Twin Pagodas have paved garden paths. The nature trail boardwalk (1.2 km) is flat and wide enough for wheelchairs in most sections, though some areas may be tight. Wachirathan Waterfall has a short paved path to the viewing platform.
- **[Mae Kampong Hidden Village](/tours/mae-kampong-hidden-village)** — The village itself has stairs and steep paths, but the drive through the mountains is spectacular. We can arrange stops at the village entrance and accessible viewpoints. The coffee workshop area at the base is relatively flat.

### Level 3: Adventure-Adapted (Significant Assistance Required)

These tours traverse rougher terrain, but we've developed adapted versions that maximize the experience while respecting physical limitations.

**Adapted tours:**
- **[Sticky Waterfalls](/tours/maerim-sticky-waterfalls)** — The waterfall itself requires climbing on wet rock (not wheelchair accessible), but the base area has flat ground with seating areas where you can watch others climb while enjoying the natural surroundings. The nearby hot springs offer accessible soaking pools.
- **[Mae Wang Jungle Wilderness](/tours/mae-wang-jungle-wilderness)** — The jungle tracks are rough, but ethical elephant sanctuaries in the area have flat viewing platforms where guests with mobility challenges can watch and even feed elephants without navigating uneven ground.

## How We Adapt Tours for Different Needs

### Wheelchair Users

We work with wheelchair users regularly and have developed specific protocols:

1. **Vehicle transfer** — Our guides are trained to assist with vehicle transfers. We can arrange a vehicle with a lower step height if needed
2. **Wheelchair storage** — Manual wheelchairs fold and fit easily in our cargo area. We carry tie-down straps to secure them
3. **Route selection** — We choose stops with paved or hard-packed surfaces and avoid steep grades
4. **Restroom planning** — We know which stops along every route have accessible restroom facilities
5. **Advance scouting** — For first-time routes, our guide checks accessibility before the tour date

### Seniors and Elderly Travelers

Many of our guests are older travelers — retirees exploring Southeast Asia, grandparents joining family trips, or active seniors who love nature but need a gentler pace.

**What we do for senior travelers:**
- Schedule more frequent rest stops
- Choose shaded viewpoints and air-conditioned rest areas
- Provide extra cushioning and comfortable seating arrangements
- Recommend half-day tours for those with limited stamina
- Coordinate with hotels for door-to-door pickup and dropoff
- Carry extra water, sun protection, and basic first-aid supplies

### Travelers with Visual or Hearing Impairments

Our guides provide rich verbal descriptions of scenery for visually impaired guests and can communicate through written notes or visual cues for hearing-impaired travelers. If you have specific communication needs, let us know when booking so we can prepare accordingly.

### Traveling with Medical Conditions

For guests with conditions like heart problems, respiratory issues, or diabetes, we plan routes that stay within reasonable altitude ranges and proximity to medical facilities. Chiang Mai has excellent private hospitals (Chiangmai Ram, Suan Dok), and we always have a first-aid kit and emergency contacts ready.

## Practical Accessibility Information

### Medical Facilities

Chiang Mai has surprisingly good medical infrastructure:
- **Chiangmai Ram Hospital** — International-standard private hospital with English-speaking staff
- **Suan Dok Hospital** — University hospital with specialist departments
- **Pharmacies** — Available on virtually every major street; many medications available without prescription

### Accessible Accommodation

We can recommend hotels with:
- Ground-floor or elevator-accessible rooms
- Roll-in showers and grab bars
- Wide doorways for wheelchair access
- Proximity to Chabad and kosher food options

### Renting Mobility Equipment

If you don't want to travel with heavy equipment:
- Wheelchair rentals are available through several Chiang Mai medical supply shops
- Walking aids (canes, walkers) can be purchased affordably at local pharmacies
- We can help arrange equipment rental before your arrival

## Kosher + Accessible: A Unique Combination

For Jewish travelers who need both kosher food and accessibility accommodations, WIRO 4x4 is uniquely positioned to help. We understand both worlds:

- **Shabbat-friendly scheduling** with accessible tour timing
- **Kosher meal coordination** paired with accessible dining locations
- **Chabad proximity** — we recommend accessible accommodation near Chabad of Chiang Mai
- **Cultural sensitivity** — our guides understand Jewish customs and accessibility needs simultaneously

Read our [Kosher Food Guide](/blog/kosher-food-guide-northern-thailand) for details on kosher dining options, and visit our [Accessible Tours page](/accessible-tours) for more about our accessibility commitment.

## Real Stories from Our Guests

> "My mother uses a wheelchair, and we thought an off-road tour was impossible. Wiro proved us wrong. He drove us to viewpoints where Mom could see the mountains from the vehicle, and at Doi Inthanon, he helped her onto the boardwalk nature trail. She said it was the highlight of her entire Thailand trip." — Yael & Rivka, Haifa

> "I'm 74 and had a knee replacement last year. WIRO 4x4 planned a half-day tour that let me see waterfalls, temples, and mountain views without a single steep climb. The air-conditioned truck was a bonus!" — David, Netanya

## Planning Your Accessible Tour

Getting started is simple:

1. **Tell us about your needs** — Contact us on WhatsApp and describe your mobility situation, any equipment you use, and what experiences interest you most
2. **We'll design a custom route** — Based on your abilities, we select stops, plan rest breaks, and scout accessibility at every location
3. **Confirm logistics** — We arrange accessible vehicle setup, kosher meals if needed, and door-to-door pickup
4. **Enjoy the adventure** — On tour day, your guide handles everything so you can focus on the experience

Don't let mobility challenges keep you from exploring Northern Thailand. Some of the most breathtaking views in Chiang Mai are reached by vehicle, not by foot — and we'll take you there.

[Contact us on WhatsApp](https://wa.me/66929894495) to discuss your accessibility needs, or use our [Trip Cost Estimator](/estimate) to start planning your custom accessible tour.`,
    contentHe: `# סיורים נגישים בצ'יאנג מאי

תיירות הרפתקאות ונגישות לא חייבות לשלול זו את זו. ב-WIRO 4x4, אנחנו מאמינים שכל אחד ראוי לחוות את היופי עוצר הנשימה של ההרים, המקדשים והג'ונגלים של צפון תאילנד — ללא קשר לרמת הניידות, הגיל או היכולת הפיזית. מדריך זה מסביר איך אנחנו עושים את זה ואילו סיורים מתאימים ביותר למטיילים שזקוקים להתאמות נגישות.

## למה סיורי 4x4 הם בעצם מצוינים לנגישות

הנה משהו שרוב האנשים לא מבינים: רכב 4x4 מצויד היטב הוא אחד מכלי הנגישות הטובים בעולם. בעוד מטיילי תרמיל מטיילים שעות כדי להגיע לתצפיות ומפלים מרוחקים, האורחים שלנו נוסעים בנוחות לאותם יעדים — ולפעמים למקומות שאין אליהם תחבורה ציבורית.

**היתרון של 4x4 לנסיעות נגישות:**
- **שירות מדלת ליעד** — ללא הליכות ארוכות מחניונים רחוקים
- **רכבים עם גובה מרחק מהקרקע גבוה** יושבים בגובה העברה נוח למשתמשי כיסא גלגלים
- **נוחות ממוזגת** — ללא חשש מהתייבשות בימים חמים
- **קצב גמיש** — אנחנו עוצרים כמה שצריך, לכמה זמן שצריך
- **סיורים פרטיים** — ללא לחץ לעמוד בקצב של קבוצה; הסיור שלכם, הקצב שלכם

רכבי הטויוטה היילקס והפורצ'ונר שלנו כוללים דלתות רחבות, תאים מרווחים ויכולים להכיל כיסאות גלגלים מקופלים ועזרי ניידות באזור המטען בקלות.

## רמות נגישות: הבנת האפשרויות שלכם

לא כל שביל בצ'יאנג מאי נגיש לכיסא גלגלים — אנחנו כנים לגבי זה. אבל הרבה מהחוויות המרהיבות ביותר בהחלט כן, ואחרות ניתנות להתאמה עם תכנון מראש. אנחנו מסווגים את הסיורים שלנו לשלוש רמות נגישות:

### רמה 1: נגיש לחלוטין (הליכה מינימלית)

חוויות אלה כוללות מעט עד לא הליכה. האורחים נשארים ברכב או בסמוך אליו לתצפיות נופיות, עם משטחים סלולים או שטוחים בעצירות מרכזיות.

**סיורים מומלצים ברמה זו:**
- **[דוי סוטפ ומעבר לו](/tours/doi-suthep-pui-beyond-temple)** — למתחם המקדש יש מערכת רכבל/מעלית שעוקפת את המדרגות המפורסמות. נקודת התצפית הפנורמית נגישה ברכב. אזורי הגינה סביב המקדש סלולים ושטוחים יחסית.
- **[לולאת ההרים של סאמואנג](/tours/samoeng-loop-mountain-circuit)** — מסלול נסיעה נופי זה כולל תצפיות רבות בצד הדרך בהן ניתן ליהנות מפנורמות הרים מבלי לעזוב את הרכב.

### רמה 2: נגיש בינוני (נדרשת עזרה מסוימת)

סיורים אלה כוללים עצירות עם שטח לא אחיד, שבילי עפר קצרים או מדרונות עדינים. אורחים שיכולים ללכת מרחקים קצרים עם עזרה ייהנו מחוויות אלה במלואן.

**סיורים מומלצים ברמה זו:**
- **[דוי אינתנון — גג תאילנד](/tours/doi-inthanon-roof-of-thailand)** — הפסגה הגבוהה ביותר בתאילנד נגישה ברכב עד לפסגה. לפגודות התאומות יש שבילי גינה סלולים. שביל הטבע (1.2 ק"מ) שטוח ורחב מספיק לכיסאות גלגלים ברוב הקטעים. למפל וואצ'יראתאן יש שביל סלול קצר לפלטפורמת הצפייה.
- **[כפר מאה קמפונג הנסתר](/tours/mae-kampong-hidden-village)** — הכפר עצמו כולל מדרגות ושבילים תלולים, אבל הנסיעה דרך ההרים מרהיבה. אנחנו יכולים לארגן עצירות בכניסה לכפר ובתצפיות נגישות.

### רמה 3: הרפתקה מותאמת (נדרשת עזרה משמעותית)

סיורים אלה חוצים שטח מחוספס יותר, אבל פיתחנו גרסאות מותאמות שממקסמות את החוויה תוך כיבוד מגבלות פיזיות.

**סיורים מותאמים:**
- **[מפלי הסטיקי](/tours/maerim-sticky-waterfalls)** — המפל עצמו דורש טיפוס על סלע רטוב (לא נגיש לכיסא גלגלים), אבל אזור הבסיס כולל קרקע שטוחה עם אזורי ישיבה. מעיינות חמים קרובים מציעים בריכות השרייה נגישות.
- **[מאה וואנג — שמורת הג'ונגל](/tours/mae-wang-jungle-wilderness)** — שבילי הג'ונגל מחוספסים, אבל מקלטי פילים אתיים באזור כוללים פלטפורמות צפייה שטוחות בהן אורחים עם מגבלות ניידות יכולים לצפות ואפילו להאכיל פילים.

## איך אנחנו מתאימים סיורים לצרכים שונים

### משתמשי כיסא גלגלים

אנחנו עובדים עם משתמשי כיסא גלגלים באופן קבוע ופיתחנו פרוטוקולים ספציפיים:

1. **העברה לרכב** — המדריכים שלנו מאומנים לסייע בהעברות לרכב
2. **אחסון כיסא גלגלים** — כיסאות גלגלים ידניים מתקפלים ונכנסים בקלות למטען
3. **בחירת מסלול** — אנחנו בוחרים עצירות עם משטחים סלולים או דחוסים
4. **תכנון שירותים** — אנחנו יודעים אילו עצירות כוללות שירותים נגישים
5. **סיור מקדים** — למסלולים חדשים, המדריך בודק נגישות לפני יום הסיור

### מטיילים מבוגרים וקשישים

רבים מאורחינו הם מטיילים מבוגרים — גמלאים החוקרים דרום-מזרח אסיה, סבים וסבתות המצטרפים לטיולים משפחתיים, או מבוגרים פעילים שאוהבים טבע אבל צריכים קצב עדין יותר.

**מה אנחנו עושים למטיילים מבוגרים:**
- מתזמנים עצירות מנוחה תכופות יותר
- בוחרים תצפיות מוצלות ואזורי מנוחה ממוזגים
- מספקים ריפוד נוסף וסידורי ישיבה נוחים
- ממליצים על סיורים של חצי יום למי שעם סיבולת מוגבלת
- מתאמים עם מלונות לאיסוף והורדה מדלת לדלת
- נושאים מים נוספים, הגנה מהשמש וציוד עזרה ראשונה

### מטיילים עם לקויות ראייה או שמיעה

המדריכים שלנו מספקים תיאורים מילוליים עשירים של הנוף לאורחים עם לקויות ראייה ויכולים לתקשר באמצעות הודעות כתובות לאורחים עם לקויות שמיעה. אם יש לכם צרכי תקשורת ספציפיים, ספרו לנו בעת ההזמנה.

### נסיעה עם מצבים רפואיים

לאורחים עם מצבים כמו בעיות לב, בעיות נשימה או סוכרת, אנחנו מתכננים מסלולים שנשארים בטווחי גובה סבירים ובקרבה למתקני רפואה. לצ'יאנג מאי יש בתי חולים פרטיים מצוינים, ותמיד יש לנו ערכת עזרה ראשונה ואנשי קשר לשעת חירום.

## מידע מעשי על נגישות

### מתקנים רפואיים

לצ'יאנג מאי תשתית רפואית טובה להפתיע:
- **בית חולים צ'יאנגמאי ראם** — בית חולים פרטי בסטנדרט בינלאומי עם צוות דובר אנגלית
- **בית חולים סואן דוק** — בית חולים אוניברסיטאי עם מחלקות מתמחות
- **בתי מרקחת** — זמינים כמעט בכל רחוב ראשי

### לינה נגישה

אנחנו יכולים להמליץ על מלונות עם:
- חדרים בקומת קרקע או נגישים במעלית
- מקלחות עם גישה לכיסא גלגלים ומוטות אחיזה
- דלתות רחבות לגישת כיסא גלגלים
- קרבה לחב"ד ואפשרויות אוכל כשר

### השכרת ציוד ניידות

אם אתם לא רוצים לטייל עם ציוד כבד:
- השכרת כיסאות גלגלים זמינה דרך חנויות ציוד רפואי בצ'יאנג מאי
- עזרי הליכה (מקלות, הליכונים) ניתנים לרכישה במחירים נוחים בבתי מרקחת
- אנחנו יכולים לעזור לארגן השכרת ציוד לפני הגעתכם

## כשר + נגיש: שילוב ייחודי

למטיילים יהודים שזקוקים גם לאוכל כשר וגם להתאמות נגישות, WIRO 4x4 ממוקם באופן ייחודי לעזור. אנחנו מבינים את שני העולמות:

- **תזמון ידידותי לשבת** עם עיתוי סיור נגיש
- **תיאום ארוחות כשרות** בשילוב עם מיקומי אכילה נגישים
- **קרבה לחב"ד** — אנחנו ממליצים על לינה נגישה ליד חב"ד צ'יאנג מאי
- **רגישות תרבותית** — המדריכים שלנו מבינים מנהגים יהודיים וצרכי נגישות בו-זמנית

קראו את [מדריך האוכל הכשר](/blog/kosher-food-guide-northern-thailand) שלנו לפרטים על אפשרויות אכילה כשרה, ובקרו ב[דף הסיורים הנגישים](/accessible-tours) שלנו למידע נוסף על המחויבות שלנו לנגישות.

## סיפורים אמיתיים מהאורחים שלנו

> "אמא שלי משתמשת בכיסא גלגלים, וחשבנו שסיור שטח בלתי אפשרי. וירו הוכיח שטעינו. הוא נסע איתנו לתצפיות שבהן אמא יכלה לראות את ההרים מהרכב, ובדוי אינתנון הוא עזר לה להגיע לשביל הטבע. היא אמרה שזו הייתה נקודת השיא של כל הטיול שלה בתאילנד." — יעל וריבקה, חיפה

> "אני בן 74 ועברתי החלפת ברך בשנה שעברה. WIRO 4x4 תכנן סיור חצי יום שאיפשר לי לראות מפלים, מקדשים ונופי הרים בלי טיפוס תלול אחד. המשאית הממוזגת הייתה בונוס!" — דוד, נתניה

## תכנון הסיור הנגיש שלכם

להתחיל זה פשוט:

1. **ספרו לנו על הצרכים שלכם** — צרו קשר בוואטסאפ ותארו את מצב הניידות שלכם, כל ציוד שאתם משתמשים בו, ומה החוויות שמעניינות אתכם ביותר
2. **אנחנו נעצב מסלול מותאם** — בהתבסס על היכולות שלכם, נבחר עצירות, נתכנן הפסקות מנוחה ונבדוק נגישות בכל מיקום
3. **אישור לוגיסטיקה** — נארגן התקנת רכב נגיש, ארוחות כשרות אם צריך, ואיסוף מדלת לדלת
4. **תהנו מההרפתקה** — ביום הסיור, המדריך שלכם מטפל בהכל כדי שתוכלו להתמקד בחוויה

אל תתנו לאתגרי ניידות למנוע מכם לחקור את צפון תאילנד. חלק מהנופים עוצרי הנשימה ביותר בצ'יאנג מאי מגיעים אליהם ברכב, לא ברגל — ואנחנו ניקח אתכם לשם.

[צרו קשר בוואטסאפ](https://wa.me/66929894495) כדי לדון בצרכי הנגישות שלכם, או השתמשו ב[מחשבון עלויות הטיול](/estimate) שלנו כדי להתחיל לתכנן את הסיור הנגיש המותאם שלכם.`,
  },
];

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error(
      "DATABASE_URL is not set. Please provide a valid database connection string."
    );
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  console.log(
    `Seeding ${articles.length} blog article(s) (Batch 4 — Final)...`
  );

  for (const article of articles) {
    try {
      await db.insert(blogPosts).values({
        title: article.title,
        titleHe: article.titleHe,
        slug: article.slug,
        content: article.content,
        contentHe: article.contentHe,
        excerpt: article.excerpt,
        excerptHe: article.excerptHe,
        category: article.category,
        coverImage: article.coverImage,
        tags: article.tags,
        isPublished: 1,
        publishedAt: new Date(),
        author: "WIRO 4x4",
      });
      console.log(`  + ${article.slug}`);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "ER_DUP_ENTRY") {
        console.log(`  ~ ${article.slug} (already exists, skipping)`);
      } else {
        console.error(`  ! ${article.slug}: ${e.message}`);
      }
    }
  }

  await connection.end();
  console.log("\nDone! Batch 4 (final) blog article seeded successfully.");
}

seed().catch(console.error);
