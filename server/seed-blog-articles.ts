/**
 * Blog Article Seed Script
 *
 * Run with: npx tsx server/seed-blog-articles.ts
 *
 * Inserts 10 bilingual (EN/HE) SEO blog articles into the blogPosts table.
 * Each article has internal links to relevant tour pages and ends with a CTA.
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { blogPosts } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const articles = [
  // ─── Article 1: Israeli Travelers Guide ───────────────────────────
  {
    title: "Chiang Mai for Israeli Travelers — The Complete Guide",
    titleHe: "צ'יאנג מאי למטיילים ישראלים — המדריך המלא",
    slug: "chiang-mai-israeli-travelers-guide",
    excerpt:
      "Everything Israeli travelers need to know about Chiang Mai: visa, money, SIM cards, kosher food, Hebrew services, and the best day trips.",
    excerptHe:
      "כל מה שמטיילים ישראלים צריכים לדעת על צ'יאנג מאי: ויזה, כסף, כרטיסי SIM, אוכל כשר, שירותים בעברית והטיולים היומיים הטובים ביותר.",
    category: "travel-guide",
    content: `# Chiang Mai for Israeli Travelers — The Complete Guide

Chiang Mai has become one of the most popular destinations for Israeli travelers in Southeast Asia. Whether you're backpacking after the army, traveling with family, or on a couples' retreat, this northern Thai city offers an incredible mix of culture, nature, and adventure — with a surprisingly strong Jewish infrastructure.

## Getting There

**From Bangkok:** The easiest route is a 1-hour flight with AirAsia, Nok Air, or Thai Smile (from ~800 THB one-way). Overnight trains are another option (11-13 hours in sleeper class). VIP buses run daily (9-10 hours).

**From Israel:** No direct flights, but connections through Bangkok (BKK or DMK) are straightforward. Flight time is roughly 10-11 hours to Bangkok, plus the 1-hour domestic hop.

## Visa Information

Israeli passport holders receive **visa-free entry for 60 days** (as of 2025). For longer stays, you can extend at Chiang Mai immigration for an additional 30 days (1,900 THB fee). Dress respectfully for the immigration office — long pants and covered shoulders.

## Money & Payments

- **Currency:** Thai Baht (THB). Roughly 10 THB = 1 ILS as of early 2026.
- **ATMs:** Everywhere. Most charge 220 THB per withdrawal. Bangkok Bank and Kasikorn have the widest networks.
- **Credit cards:** Accepted at hotels, malls, and larger restaurants. Not at markets or street vendors.
- **Cash:** King everywhere. Carry small bills (20-100 THB) for markets and tuk-tuks.

## SIM Cards & Internet

Buy a tourist SIM at the airport (AIS, DTAC, or True). ~300 THB for 15 days of unlimited data. Wi-Fi is excellent in cafes and hotels.

## Kosher Food in Chiang Mai

This is where Chiang Mai shines for Jewish travelers:

- **Chabad of Chiang Mai** runs a kosher restaurant with daily meals (especially packed on Friday nights)
- Several Israeli-run restaurants serve kosher-friendly options
- Supermarkets stock imported Israeli products (Osem, Elite)
- For tour meals, [WIRO 4x4](/kosher-tours) arranges certified kosher catering with advance notice

## Hebrew Services

- **Chabad House:** Weekly Shabbat services and meals, holiday celebrations, Torah classes
- **Hebrew-speaking guides:** [WIRO 4x4 offers Hebrew-speaking guides](/hebrew-guide) for all day trips
- Israeli community events and meetups happen regularly

## Best Day Trips from Chiang Mai

The real magic of Chiang Mai is the surrounding mountains. Here are our top picks:

1. **[Doi Inthanon](/tours/doi-inthanon-roof-of-thailand)** — Thailand's highest peak, cloud forests, Karen village coffee farms
2. **[Mae Kampong](/tours/mae-kampong-hidden-village)** — 700-year-old eco-village, gibbon spotting, ancient fermented tea
3. **[Sticky Waterfalls](/tours/maerim-sticky-waterfalls)** — Climb UP a waterfall barefoot, canopy walkway, hill tribe village
4. **[Doi Suthep](/tours/doi-suthep-pui-beyond-temple)** — Ancient Monk's Trail, golden temple, hidden coffee village
5. **[Mae Wang](/tours/mae-wang-jungle-wilderness)** — Real 4x4 off-road, ethical elephants, bamboo rafting
6. **[Samoeng Loop](/tours/samoeng-loop-mountain-circuit)** — 100km mountain circuit, terraced farms, lakeside sunset

## Safety Tips

Chiang Mai is generally very safe for tourists. Standard precautions apply:
- Be careful with motorbike rentals — roads are different from Israel
- Drink bottled water
- Use mosquito repellent, especially around sunset
- Be respectful at temples (shoes off, cover shoulders)

## Best Season to Visit

**November-February:** Cool season. Perfect weather, clear skies, 15-25°C. Best time for outdoor activities.
**March-May:** Hot season. Can reach 40°C. Good for indoor attractions.
**June-October:** Green season. Afternoon rain showers. Lush landscapes, fewer tourists.

---

**Ready to explore Chiang Mai with a Hebrew-speaking guide and kosher meals?**

[Chat with us on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I'm%20an%20Israeli%20traveler%20interested%20in%20Chiang%20Mai%20tours) or [Book a Tour](/book) to start planning your adventure.`,
    contentHe: `# צ'יאנג מאי למטיילים ישראלים — המדריך המלא

צ'יאנג מאי הפכה לאחד היעדים הפופולריים ביותר למטיילים ישראלים בדרום מזרח אסיה. בין אם אתם בטיול אחרי הצבא, מטיילים עם המשפחה או בחופשה זוגית, העיר הצפונית הזו מציעה שילוב מדהים של תרבות, טבע והרפתקאות — עם תשתית יהודית מפתיעה.

## איך מגיעים

**מבנגקוק:** האפשרות הקלה ביותר היא טיסה של שעה עם AirAsia, Nok Air או Thai Smile (מ-~800 בהט). רכבת לילה אפשרות נוספת (11-13 שעות במחלקת שינה). אוטובוסי VIP יוצאים כל יום (9-10 שעות).

**מישראל:** אין טיסות ישירות, אבל חיבורים דרך בנגקוק (BKK או DMK) פשוטים. זמן הטיסה כ-10-11 שעות לבנגקוק, פלוס שעה פנימית.

## מידע על ויזה

בעלי דרכון ישראלי מקבלים **כניסה ללא ויזה ל-60 יום** (נכון ל-2025). לשהייה ארוכה יותר, אפשר להאריך במשרד ההגירה של צ'יאנג מאי ב-30 ימים נוספים (1,900 בהט). הלבשו בכבוד — מכנסיים ארוכים וכתפיים מכוסות.

## כסף ותשלומים

- **מטבע:** בהט תאילנדי (THB). בערך 10 בהט = 1 שקל נכון לתחילת 2026.
- **כספומטים:** בכל מקום. רוב גובים 220 בהט למשיכה. Bangkok Bank ו-Kasikorn הנפוצים ביותר.
- **כרטיסי אשראי:** מתקבלים במלונות, קניונים ומסעדות גדולות. לא בשווקים או דוכנים.
- **מזומן:** מלך בכל מקום. נשאו שטרות קטנים (20-100 בהט) לשווקים וטוק-טוקים.

## כרטיסי SIM ואינטרנט

קנו SIM תיירותי בשדה התעופה (AIS, DTAC או True). ~300 בהט ל-15 ימים של דאטה בלתי מוגבל. Wi-Fi מצוין בבתי קפה ומלונות.

## אוכל כשר בצ'יאנג מאי

כאן צ'יאנג מאי מצטיינת למטיילים יהודים:

- **חב"ד צ'יאנג מאי** מפעיל מסעדה כשרה עם ארוחות יומיות (במיוחד צפוף בליל שישי)
- כמה מסעדות ישראליות מגישות אפשרויות כשרות
- סופרמרקטים מוכרים מוצרים ישראליים מיובאים (אסם, עלית)
- לארוחות בטיולים, [WIRO 4x4](/kosher-tours) מסדירים קייטרינג כשר מאושר בהודעה מראש

## שירותים בעברית

- **בית חב"ד:** תפילות שבת וארוחות שבועיות, חגיגות חגים, שיעורי תורה
- **מדריכים דוברי עברית:** [WIRO 4x4 מציעים מדריכים דוברי עברית](/hebrew-guide) לכל הטיולים היומיים
- אירועים ומפגשים של הקהילה הישראלית מתקיימים באופן קבוע

## הטיולים היומיים הטובים ביותר מצ'יאנג מאי

הקסם האמיתי של צ'יאנג מאי הוא ההרים שמסביב. הבחירות המובילות שלנו:

1. **[דוי אינתנון](/tours/doi-inthanon-roof-of-thailand)** — הפסגה הגבוהה בתאילנד, יערות ענן, חוות קפה בכפר קארן
2. **[מאה קמפונג](/tours/mae-kampong-hidden-village)** — כפר אקולוגי בן 700 שנה, צפייה בגיבונים, תה מותסס עתיק
3. **[מפלים דביקים](/tours/maerim-sticky-waterfalls)** — טפסו למעלה על מפל יחפים, גשר צמרות, כפר שבטי
4. **[דוי סוטפ](/tours/doi-suthep-pui-beyond-temple)** — שביל הנזירים העתיק, מקדש זהוב, כפר קפה נסתר
5. **[מאה וואנג](/tours/mae-wang-jungle-wilderness)** — שטח אמיתי ב-4x4, פילים אתיים, שייט במבוק
6. **[לולאת סמאנג](/tours/samoeng-loop-mountain-circuit)** — מעגל הרים של 100 ק"מ, חוות מדורגות, שקיעה על אגם

## טיפים לבטיחות

צ'יאנג מאי בטוחה מאוד לתיירים. אמצעי זהירות בסיסיים:
- היזהרו עם השכרת אופנועים — הכבישים שונים מישראל
- שתו מים בבקבוקים
- השתמשו בדוחה יתושים, במיוחד סביב השקיעה
- כבדו את המקדשות (נעליים חולצות, כיסוי כתפיים)

## העונה הטובה ביותר לביקור

**נובמבר-פברואר:** עונה קרירה. מזג אוויר מושלם, שמים צלולים, 15-25 מעלות. הזמן הטוב ביותר לפעילויות חוץ.
**מרץ-מאי:** עונה חמה. יכול להגיע ל-40 מעלות. טוב לאטרקציות פנים.
**יוני-אוקטובר:** עונה ירוקה. מקלחות גשם אחר-הצהריים. נופים ירוקים, פחות תיירים.

---

**מוכנים לגלות את צ'יאנג מאי עם מדריך דובר עברית וארוחות כשרות?**

[שלחו הודעה בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20אני%20מטייל/ת%20ישראלי/ת%20ומתעניין/ת%20בטיולים%20בצ'יאנג%20מאי) או [הזמינו טיול](/book) כדי להתחיל לתכנן את ההרפתקה שלכם.`,
  },

  // ─── Article 2: Shabbat Guide ──────────────────────────────────────
  {
    title: "Shabbat in Chiang Mai — Where to Stay, Eat & Pray",
    titleHe: "שבת בצ'יאנג מאי — איפה לגור, לאכול ולהתפלל",
    slug: "shabbat-in-chiang-mai-guide",
    excerpt:
      "A complete guide to keeping Shabbat in Chiang Mai: Chabad services, kosher restaurants, Shabbat-friendly hotels, and how to plan your tour week around it.",
    excerptHe:
      "מדריך מלא לשמירת שבת בצ'יאנג מאי: שירותי חב\"ד, מסעדות כשרות, מלונות שבת-ידידותיים ואיך לתכנן את שבוע הטיולים סביב זה.",
    category: "jewish-travel",
    content: `# Shabbat in Chiang Mai — Where to Stay, Eat & Pray

Keeping Shabbat while traveling doesn't have to mean missing out. Chiang Mai has a warm, welcoming Jewish community that makes Shabbat observance not just possible, but genuinely enjoyable.

## Chabad of Chiang Mai

The anchor of Jewish life in Chiang Mai, Chabad has been serving the community since 2001.

**Services:**
- **Friday night:** Kabbalat Shabbat services followed by a festive dinner (reservations recommended)
- **Shabbat morning:** Shacharit services with kiddush
- **Location:** Central Chiang Mai, walkable from most hotels in the Old City
- **Contact:** Book in advance, especially during Israeli holiday seasons (Sukkot, Pesach)

## Shabbat-Friendly Hotels

Choose a hotel within walking distance of Chabad:

- **Old City area:** Multiple hotels within 10-15 minute walk
- **Night Bazaar area:** Slightly further but still walkable
- **Request in advance:** Many hotels will accommodate Shabbat needs (pre-set room key, avoid electronic locks on request)

**Pro tip:** When booking with [WIRO 4x4](/kosher-tours), we can recommend specific hotels and help arrange Shabbat logistics.

## Kosher Dining on Shabbat

- **Chabad Shabbat dinner:** The main event. Book ahead — tables fill up, especially during high season
- **Kosher snacks:** Stock up Thursday or Friday morning at local supermarkets
- **Hotel breakfast:** Most hotels offer fruit, bread, and eggs that can work for kosher travelers

## Planning Your Tour Week Around Shabbat

Here's how we recommend structuring a week in Chiang Mai:

**Sunday:** Arrive, settle in, explore the Old City on foot
**Monday:** [Doi Inthanon](/tours/doi-inthanon-roof-of-thailand) — full-day tour
**Tuesday:** [Mae Kampong](/tours/mae-kampong-hidden-village) — half-day, afternoon free
**Wednesday:** [Sticky Waterfalls](/tours/maerim-sticky-waterfalls) — full-day
**Thursday:** [Samoeng Loop](/tours/samoeng-loop-mountain-circuit) or free day for Night Bazaar shopping
**Friday:** Free morning, prepare for Shabbat, Chabad services
**Shabbat:** Rest, Chabad meals, walks in the Old City

## What to Know Before Shabbat

- **Candle lighting times:** Check local times for Chiang Mai (approximately 18:00-18:30 depending on season)
- **Eruv:** No established eruv in Chiang Mai — plan accordingly
- **Walking routes:** The Old City is flat and walkable, making Shabbat strolls pleasant
- **Temperature:** Even in cool season, Shabbat walks are comfortable

## Emergency Contacts

- Chabad Chiang Mai: Available for emergencies
- Israeli Embassy (Bangkok): For consular emergencies
- WIRO 4x4 team: Available via WhatsApp for any assistance

---

**Planning a Shabbat-friendly trip to Chiang Mai?**

[Chat with us on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I'm%20planning%20a%20Shabbat-friendly%20trip%20to%20Chiang%20Mai) and we'll help plan your entire week — tours, kosher meals, and Shabbat arrangements included.`,
    contentHe: `# שבת בצ'יאנג מאי — איפה לגור, לאכול ולהתפלל

שמירת שבת בזמן טיול לא חייבת להיות בעייתית. בצ'יאנג מאי יש קהילה יהודית חמה ומזמינה שהופכת שמירת שבת ללא רק אפשרית, אלא באמת מהנה.

## חב"ד צ'יאנג מאי

העוגן של החיים היהודיים בצ'יאנג מאי, חב"ד משרת את הקהילה מאז 2001.

**שירותים:**
- **ליל שישי:** תפילת קבלת שבת ואחריה ארוחת שבת חגיגית (מומלץ להזמין מראש)
- **שבת בבוקר:** תפילת שחרית עם קידוש
- **מיקום:** מרכז צ'יאנג מאי, במרחק הליכה מרוב המלונות בעיר העתיקה
- **יצירת קשר:** הזמינו מראש, במיוחד בתקופות חגים ישראליים (סוכות, פסח)

## מלונות שבת-ידידותיים

בחרו מלון במרחק הליכה מחב"ד:

- **אזור העיר העתיקה:** מלונות רבים במרחק 10-15 דקות הליכה
- **אזור שוק הלילה:** קצת יותר רחוק אבל עדיין ניתן להגיע ברגל
- **בקשו מראש:** מלונות רבים יתאימו לצרכי שבת (מפתח חדר מוגדר מראש, הימנעות ממנעולים אלקטרוניים לפי בקשה)

**טיפ:** כשמזמינים עם [WIRO 4x4](/kosher-tours), אנחנו ממליצים על מלונות ספציפיים ועוזרים לסדר לוגיסטיקת שבת.

## אוכל כשר בשבת

- **ארוחת שבת בחב"ד:** האירוע המרכזי. הזמינו מראש — השולחנות מתמלאים, במיוחד בעונה
- **חטיפים כשרים:** התאגדו ביום חמישי או שישי בבוקר בסופרמרקטים
- **ארוחת בוקר במלון:** רוב המלונות מציעים פירות, לחם וביצים

## תכנון שבוע הטיולים סביב שבת

ככה אנחנו ממליצים לבנות שבוע בצ'יאנג מאי:

**ראשון:** הגעה, התמקמות, סיור רגלי בעיר העתיקה
**שני:** [דוי אינתנון](/tours/doi-inthanon-roof-of-thailand) — טיול יום שלם
**שלישי:** [מאה קמפונג](/tours/mae-kampong-hidden-village) — חצי יום, אחר-הצהריים חופשי
**רביעי:** [מפלים דביקים](/tours/maerim-sticky-waterfalls) — יום שלם
**חמישי:** [לולאת סמאנג](/tours/samoeng-loop-mountain-circuit) או יום חופשי לקניות בשוק הלילה
**שישי:** בוקר חופשי, הכנות לשבת, תפילות בחב"ד
**שבת:** מנוחה, ארוחות חב"ד, טיולים בעיר העתיקה

## מה חשוב לדעת לפני שבת

- **זמני הדלקת נרות:** בדקו זמנים מקומיים לצ'יאנג מאי (בערך 18:00-18:30 בהתאם לעונה)
- **עירוב:** אין עירוב בצ'יאנג מאי — תכננו בהתאם
- **מסלולי הליכה:** העיר העתיקה שטוחה ונגישה, מה שהופך טיולי שבת לנעימים
- **טמפרטורה:** אפילו בעונה הקרירה, טיולי שבת נוחים

---

**מתכננים טיול שבת-ידידותי לצ'יאנג מאי?**

[שלחו הודעה בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20מתכננים%20טיול%20שבת-ידידותי%20לצ'יאנג%20מאי) ונעזור לתכנן את כל השבוע — טיולים, ארוחות כשרות והסדרי שבת כלולים.`,
  },

  // ─── Article 3-10: Shorter articles with full content ────────────
  {
    title: "Kosher Food in Chiang Mai — Every Option Mapped",
    titleHe: "אוכל כשר בצ'יאנג מאי — כל האפשרויות במפה",
    slug: "kosher-food-chiang-mai-guide",
    excerpt:
      "A comprehensive guide to finding kosher food in Chiang Mai: restaurants, supermarkets, Chabad meals, and tips for kosher travelers.",
    excerptHe:
      "מדריך מקיף למציאת אוכל כשר בצ'יאנג מאי: מסעדות, סופרמרקטים, ארוחות חב\"ד וטיפים למטיילים שומרי כשרות.",
    category: "jewish-travel",
    content: `# Kosher Food in Chiang Mai — Every Option Mapped

Finding kosher food in Thailand might sound challenging, but Chiang Mai actually has more options than you'd expect. Here's your complete guide.

## Chabad Restaurant

The primary kosher dining option. Serves lunch and dinner daily, with expanded Shabbat meals.
- Certified kosher under Chabad supervision
- Israeli and Thai fusion menu
- Advance booking essential for Shabbat

## Israeli-Run Restaurants

Several restaurants cater to Israeli travelers with familiar flavors. While not all have formal kosher certification, many use kosher ingredients and accommodate requests.

## Supermarket Shopping

Stock up on kosher-friendly items:
- **Rimping Supermarket:** Best selection of imported foods, including some Israeli products
- **Tops Market:** Good for fresh produce, bread, and dairy
- **7-Eleven:** Surprisingly useful — sealed snacks, water, instant noodles (check ingredients)

## On-Tour Dining

When booking a [kosher tour with WIRO 4x4](/kosher-tours):
- We coordinate kosher meals from certified sources
- Packed lunches available for remote tours
- Fresh fruits and vegetables from mountain markets
- All dietary restrictions accommodated with advance notice

## Cooking Your Own

Some accommodations offer kitchen facilities:
- Airbnb apartments with full kitchens
- Hotels with kitchenette rooms
- Fresh produce at local markets is excellent and affordable

## Tips for Kosher Travelers

1. **Communicate early:** Tell us your kashrut level when booking
2. **Bring essentials:** Pack a small supply of snacks from home for the first day
3. **Fruit is your friend:** Thailand has incredible tropical fruit — all naturally kosher
4. **Rice is everywhere:** Thai cuisine is rice-based, making it easier to find suitable options
5. **Read labels:** Many packaged foods have English ingredient lists

---

**Need kosher meals arranged for your Chiang Mai tour?**

[Contact WIRO 4x4 on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I%20need%20kosher%20meal%20arrangements%20for%20my%20tour) and we'll handle everything.`,
    contentHe: `# אוכל כשר בצ'יאנג מאי — כל האפשרויות במפה

מציאת אוכל כשר בתאילנד אולי נשמעת מאתגרת, אבל בצ'יאנג מאי יש יותר אפשרויות ממה שחושבים. הנה המדריך המלא שלכם.

## מסעדת חב"ד

אפשרות האוכל הכשר העיקרית. מגישה ארוחות צהריים וערב יומיות, עם ארוחות שבת מורחבות.
- כשרות מאושרת בפיקוח חב"ד
- תפריט פיוז'ן ישראלי-תאילנדי
- הזמנה מראש חיונית לשבת

## מסעדות ישראליות

כמה מסעדות פונות למטיילים ישראלים עם טעמים מוכרים. לא לכולן הכשר רשמי, אבל רבות משתמשות בחומרי גלם כשרים ומתאימות לבקשות.

## קניות בסופרמרקט

התאגדו בפריטים כשרים:
- **Rimping Supermarket:** המבחר הטוב ביותר של מוצרים מיובאים, כולל מוצרים ישראליים
- **Tops Market:** טוב לירקות טריים, לחם וחלב
- **7-Eleven:** שימושי להפתיע — חטיפים ארוזים, מים, נודלס מיידי (בדקו רכיבים)

## אוכל בטיולים

כשמזמינים [טיול כשר עם WIRO 4x4](/kosher-tours):
- אנחנו מתאמים ארוחות כשרות ממקורות מאושרים
- ארוחות צהריים ארוזות זמינות לטיולים מרוחקים
- פירות וירקות טריים משווקי הרים
- כל ההגבלות התזונתיות מטופלות בהודעה מראש

## לבשל לבד

חלק מהלינות מציעות מתקני מטבח:
- דירות Airbnb עם מטבח מלא
- מלונות עם חדרי מטבחון
- ירקות טריים בשווקים מקומיים מצוינים ובמחירים נוחים

## טיפים למטיילים שומרי כשרות

1. **תקשרו מוקדם:** ספרו לנו על רמת הכשרות שלכם כשמזמינים
2. **הביאו בסיסים:** ארזו אספקה קטנה של חטיפים מהבית ליום הראשון
3. **פירות הם החבר שלכם:** לתאילנד יש פירות טרופיים מדהימים — כולם כשרים מטבעם
4. **אורז בכל מקום:** המטבח התאילנדי מבוסס אורז, מה שמקל על מציאת אפשרויות מתאימות
5. **קראו תוויות:** מוצרים ארוזים רבים כוללים רשימת רכיבים באנגלית

---

**צריכים ארוחות כשרות מסודרות לטיול בצ'יאנג מאי?**

[צרו קשר עם WIRO 4x4 בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20צריך%20הסדרי%20ארוחות%20כשרות%20לטיול) ונטפל בהכל.`,
  },

  {
    title: "Top 5 Kosher-Friendly Day Trips from Chiang Mai",
    titleHe: "5 הטיולים היומיים הכשרים הטובים ביותר מצ'יאנג מאי",
    slug: "top-5-kosher-day-trips-chiang-mai",
    excerpt:
      "The best day trips from Chiang Mai for kosher travelers — each with kosher meals, Hebrew guides, and unforgettable off-road adventures.",
    excerptHe:
      "הטיולים היומיים הטובים ביותר מצ'יאנג מאי למטיילים כשרים — כל אחד עם ארוחות כשרות, מדריכים בעברית והרפתקאות שטח בלתי נשכחות.",
    category: "tours",
    content: `# Top 5 Kosher-Friendly Day Trips from Chiang Mai

Chiang Mai's surrounding mountains offer some of Thailand's most spectacular day trips. Here are our top 5 picks for kosher travelers — each with certified kosher meal options and Hebrew-speaking guides available.

## 1. Doi Inthanon — Roof of Thailand

**Duration:** 7-8 hours | **Price:** From 5,000 THB per group

Stand on Thailand's highest peak at 2,565 meters, then explore cloud forests, hidden waterfalls, and a Karen village coffee farm that most tourists never find.

**Why it's great for kosher travelers:** Advance-arranged kosher lunch at the Karen village, plus kosher snack packs throughout the day.

[View full tour details](/tours/doi-inthanon-roof-of-thailand)

## 2. Mae Kampong — Hidden Mountain Village

**Duration:** 5-7 hours | **Price:** From 3,500 THB per group

A 700-year-old eco-village where you'll spot wild gibbons, learn ancient tea fermentation, and hike to a panoramic viewpoint most visitors miss.

**Why it's great for kosher travelers:** Village homestay lunch adapted for kosher requirements. Peaceful, family-friendly atmosphere.

[View full tour details](/tours/mae-kampong-hidden-village)

## 3. Sticky Waterfalls & Canopy Walk

**Duration:** 7-8 hours | **Price:** From 4,500 THB per group

Climb UP a waterfall barefoot (the limestone is naturally grippy), walk a 400m canopy walkway 20 meters above the forest, and explore an authentic hill tribe village.

**Why it's great for kosher travelers:** Packed kosher lunch option. The waterfall experience is appropriate for modest dress (bring water shoes and modest swimwear).

[View full tour details](/tours/maerim-sticky-waterfalls)

## 4. Doi Suthep — Beyond the Temple

**Duration:** 5-7 hours | **Price:** From 3,500 THB per group

Hike the ancient Monk's Trail through jungle to the golden temple, then continue past where all the tourists turn back — deep into the national park to a hidden coffee village.

**Why it's great for kosher travelers:** Temple visits are respectful and culturally enriching. Coffee village has simple, adaptable food options.

[View full tour details](/tours/doi-suthep-pui-beyond-temple)

## 5. Samoeng Loop — The Mountain Circuit

**Duration:** 8-10 hours | **Price:** From 5,000 THB per group

A 100km mountain circuit through Chiang Mai's green lung — hidden wooden temples, terraced hilltop farms with 360-degree views, and a sunset at a lakeside bamboo hut.

**Why it's great for kosher travelers:** Farm-to-table lunch at Mon Jam Royal Project with adaptable menu. Shabbat-friendly scheduling.

[View full tour details](/tours/samoeng-loop-mountain-circuit)

## All Tours Include

- Private 4x4 vehicle with experienced driver
- Optional Hebrew-speaking guide
- Kosher meal arrangements (advance notice required)
- National park entrance fees
- Hotel pickup and drop-off

---

**Ready to book a kosher day trip?**

[Chat with us on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I%20want%20to%20book%20a%20kosher%20day%20trip) or [Book Online](/book).`,
    contentHe: `# 5 הטיולים היומיים הכשרים הטובים ביותר מצ'יאנג מאי

ההרים שמסביב לצ'יאנג מאי מציעים כמה מהטיולים היומיים המרהיבים ביותר בתאילנד. הנה 5 הבחירות המובילות שלנו למטיילים כשרים — כל אחד עם אפשרויות ארוחות כשרות מאושרות ומדריכים דוברי עברית.

## 1. דוי אינתנון — גג תאילנד

**משך:** 7-8 שעות | **מחיר:** מ-5,000 בהט לקבוצה

עמדו על הפסגה הגבוהה בתאילנד בגובה 2,565 מטר, ואז גלו יערות ענן, מפלים נסתרים וחוות קפה בכפר קארן שרוב התיירים לא מוצאים.

**למה מעולה למטיילים כשרים:** ארוחת צהריים כשרה מתואמת מראש בכפר הקארן, ועוד חבילות חטיפים כשרים לאורך היום.

[ראו פרטי טיול מלאים](/tours/doi-inthanon-roof-of-thailand)

## 2. מאה קמפונג — כפר ההרים הנסתר

**משך:** 5-7 שעות | **מחיר:** מ-3,500 בהט לקבוצה

כפר אקולוגי בן 700 שנה שם תצפו בגיבוני בר, תלמדו תסיסת תה עתיקה ותטיילו לתצפית פנורמית שרוב המבקרים מפספסים.

**למה מעולה למטיילים כשרים:** ארוחת צהריים בבית מארח מותאמת לדרישות כשרות. אווירה שלווה וידידותית למשפחות.

[ראו פרטי טיול מלאים](/tours/mae-kampong-hidden-village)

## 3. מפלים דביקים וגשר צמרות

**משך:** 7-8 שעות | **מחיר:** מ-4,500 בהט לקבוצה

טפסו למעלה על מפל יחפים (אבן הגיר אוחזת באופן טבעי), לכו על גשר צמרות באורך 400 מ' בגובה 20 מטר מעל היער, וגלו כפר שבטי הרים אותנטי.

**למה מעולה למטיילים כשרים:** אפשרות ארוחת צהריים כשרה ארוזה. חוויית המפל מתאימה ללבוש צנוע.

[ראו פרטי טיול מלאים](/tours/maerim-sticky-waterfalls)

## 4. דוי סוטפ — מעבר למקדש

**משך:** 5-7 שעות | **מחיר:** מ-3,500 בהט לקבוצה

טיילו בשביל הנזירים העתיק דרך הג'ונגל למקדש הזהוב, ואז המשיכו הלאה לשם שכל התיירים חוזרים — עמוק בפארק הלאומי לכפר קפה נסתר.

**למה מעולה למטיילים כשרים:** ביקורי מקדש מכבדים ומעשירים תרבותית. לכפר הקפה אפשרויות אוכל פשוטות וניתנות להתאמה.

[ראו פרטי טיול מלאים](/tours/doi-suthep-pui-beyond-temple)

## 5. לולאת סמאנג — המעגל ההררי

**משך:** 8-10 שעות | **מחיר:** מ-5,000 בהט לקבוצה

מעגל הרים של 100 ק"מ — מקדשי עץ נסתרים, חוות מדורגות עם נוף 360 מעלות ושקיעה בבקתת במבוק על שפת אגם.

**למה מעולה למטיילים כשרים:** ארוחת צהריים מהחווה לשולחן בפרויקט המלכותי מון ג'אם עם תפריט ניתן להתאמה. תזמון שבת-ידידותי.

[ראו פרטי טיול מלאים](/tours/samoeng-loop-mountain-circuit)

---

**מוכנים להזמין טיול יומי כשר?**

[שלחו הודעה בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20רוצה%20להזמין%20טיול%20יומי%20כשר) או [הזמינו אונליין](/book).`,
  },

  {
    title: "Planning a Kosher Trip to Thailand — What You Need to Know",
    titleHe: "תכנון טיול כשר לתאילנד — מה שצריך לדעת",
    slug: "planning-kosher-trip-thailand",
    excerpt:
      "A practical guide for observant Jewish travelers planning a kosher trip to Thailand: food, Shabbat, holiday logistics, and cultural tips.",
    excerptHe:
      "מדריך מעשי למטיילים יהודים שומרי מצוות שמתכננים טיול כשר לתאילנד: אוכל, שבת, לוגיסטיקת חגים וטיפים תרבותיים.",
    category: "jewish-travel",
    content: `# Planning a Kosher Trip to Thailand — What You Need to Know

Thailand is increasingly popular with observant Jewish travelers — and for good reason. With the right planning, you can keep kosher, observe Shabbat, and have an incredible adventure. Here's your practical guide.

## Kosher Food Strategy

**In Bangkok:**
- Multiple Chabad houses with kosher restaurants
- Israeli restaurants in the Khao San Road area
- Large supermarkets stock imported kosher products

**In Chiang Mai:**
- Chabad restaurant for daily meals
- [WIRO 4x4 arranges kosher tour meals](/kosher-tours)
- Fresh fruits and vegetables are abundant and naturally kosher

**On the Road:**
- Pack kosher snacks for travel days
- Rice-based Thai dishes are often the easiest to adapt
- Always communicate dietary needs in advance

## Shabbat Planning

- [Detailed Chiang Mai Shabbat guide](/blog/shabbat-in-chiang-mai-guide)
- Chabad houses in Bangkok, Chiang Mai, Phuket, and Koh Samui
- Book Shabbat meals at least a few days in advance
- Choose walking-distance hotels near Chabad

## Modest Dress Considerations

Thai temple dress codes actually align well with tzniut:
- Shoulders covered (required at temples anyway)
- Knees covered
- Many Thai women dress conservatively
- Swimwear: modest options work well at waterfalls and beaches

## Cultural Tips for Jewish Travelers

- **Temple visits:** Shoes off, respectful silence. Very compatible with Jewish values of respecting holy places.
- **Head coverings:** Kippot are not unusual in Thailand — locals are accepting of all religious expressions
- **Vegetarian/vegan:** Thailand is very vegetarian-friendly, making kashrus easier
- **Tipping:** Not mandatory but appreciated (10-20 THB tips are common)

## Health & Safety

- Travel insurance is essential (check coverage for adventure activities)
- Mosquito repellent with DEET recommended
- Drink bottled water only
- Medical care in Chiang Mai is excellent (private hospitals have English-speaking staff)

## Best Time to Visit

For Jewish travelers, we recommend:
- **Sukkot period (Sep-Oct):** Green season but Chabad organizes beautiful Sukkot celebrations
- **Chanukah (Dec):** Perfect cool-season weather plus Chabad menorah lighting
- **Pesach (Mar-Apr):** Chabad runs full Pesach seders with kosher-for-Passover meals

## Planning Checklist

- [ ] Book flights 2-3 months ahead
- [ ] Reserve Shabbat meals at Chabad
- [ ] Arrange kosher tour meals with [WIRO 4x4](/kosher-tours)
- [ ] Pack emergency kosher snacks
- [ ] Download offline Hebrew-Thai phrasebook
- [ ] Get travel insurance
- [ ] Check candle lighting times for your dates

---

**Need help planning your kosher Thailand trip?**

[Chat with WIRO 4x4 on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I'm%20planning%20a%20kosher%20trip%20to%20Thailand) — we'll help with tours, meals, and logistics.`,
    contentHe: `# תכנון טיול כשר לתאילנד — מה שצריך לדעת

תאילנד הולכת ונהיית פופולרית בקרב מטיילים יהודים שומרי מצוות — ובצדק. עם תכנון נכון, אפשר לשמור כשרות, לשמור שבת ולחוות הרפתקה מדהימה. הנה המדריך המעשי שלכם.

## אסטרטגיית אוכל כשר

**בבנגקוק:** בתי חב"ד רבים עם מסעדות כשרות. מסעדות ישראליות באזור קאו סאן. סופרמרקטים גדולים עם מוצרים כשרים.

**בצ'יאנג מאי:** מסעדת חב"ד לארוחות יומיות. [WIRO 4x4 מסדיר ארוחות כשרות בטיולים](/kosher-tours). פירות וירקות טריים בשפע.

**בדרך:** ארזו חטיפים כשרים לימי נסיעה. מנות תאילנדיות מבוססות אורז הן הקלות ביותר להתאמה.

## תכנון שבת

- [מדריך שבת מפורט לצ'יאנג מאי](/blog/shabbat-in-chiang-mai-guide)
- בתי חב"ד בבנגקוק, צ'יאנג מאי, פוקט וקו סמוי
- הזמינו ארוחות שבת לפחות כמה ימים מראש
- בחרו מלונות במרחק הליכה מחב"ד

## שיקולי צניעות

קוד הלבוש במקדשות תאילנדיים מתיישב היטב עם צניעות: כתפיים מכוסות, ברכיים מכוסות. נשים תאילנדיות רבות מתלבשות בצניעות.

## טיפים תרבותיים

- **ביקורי מקדש:** חלצו נעליים, שקט מכבד. מאוד תואם ערכים יהודיים של כיבוד מקומות קדושים.
- **כיסוי ראש:** כיפות לא יוצאות דופן בתאילנד — מקומיים מקבלים ביטויי דת
- **צמחוני:** תאילנד ידידותית מאוד לצמחונים, מה שמקל על כשרות

## רשימת תכנון

- [ ] הזמינו טיסות 2-3 חודשים מראש
- [ ] הזמינו ארוחות שבת בחב"ד
- [ ] סדרו ארוחות כשרות בטיולים עם [WIRO 4x4](/kosher-tours)
- [ ] ארזו חטיפים כשרים לחירום
- [ ] עשו ביטוח נסיעות
- [ ] בדקו זמני הדלקת נרות לתאריכים שלכם

---

**צריכים עזרה בתכנון טיול כשר לתאילנד?**

[שלחו הודעה ל-WIRO 4x4 בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20מתכנן/ת%20טיול%20כשר%20לתאילנד) — נעזור עם טיולים, ארוחות ולוגיסטיקה.`,
  },

  {
    title: "Jewish Holidays in Thailand — Celebrating Abroad",
    titleHe: 'חגים יהודיים בתאילנד — חגיגות בחו"ל',
    slug: "jewish-holidays-thailand-celebrating-abroad",
    excerpt:
      "How to celebrate Pesach, Sukkot, Rosh Hashana, and other Jewish holidays in Thailand — Chabad services, kosher meals, and travel tips.",
    excerptHe:
      'איך חוגגים פסח, סוכות, ראש השנה וחגים יהודיים נוספים בתאילנד — שירותי חב"ד, ארוחות כשרות וטיפים למטיילים.',
    category: "jewish-travel",
    content: `# Jewish Holidays in Thailand — Celebrating Abroad

One of the most special experiences for Jewish travelers is celebrating holidays abroad. Thailand's Chabad network makes this possible with full services and communal meals.

## Pesach (Passover)

The biggest Jewish holiday event in Thailand. Chabad Chiang Mai and Bangkok both run full Pesach programs:
- Community seders (first and second night)
- Kosher-for-Passover meals throughout the holiday
- Matza and Pesach products available
- Book well in advance — this is the most popular time

**Tour tip:** Schedule your [Chiang Mai tours](/kosher-tours) for Chol HaMoed — the intermediate days are perfect for day trips.

## Sukkot

Chabad builds a sukkah and provides the four species:
- Meals in the sukkah
- Lulav and etrog available
- Particularly beautiful in the cool season

## Rosh Hashana & Yom Kippur

- Full High Holiday services at Chabad
- Festive Rosh Hashana dinner with traditional foods
- Shofar blowing
- Break-fast after Yom Kippur

## Chanukah

December in Chiang Mai means cool weather and menorah lighting:
- Public menorah lighting events
- Sufganiyot and latkes at Chabad
- The cool season weather makes evening celebrations comfortable

## Shabbat (Every Week)

- [Full Shabbat guide for Chiang Mai](/blog/shabbat-in-chiang-mai-guide)
- Friday night services and dinner
- Shabbat morning services and kiddush

## Planning Around Holidays

When booking tours with [WIRO 4x4](/kosher-tours):
- We never schedule tours during Shabbat or Jewish holidays
- Chol HaMoed is ideal for day trips
- We can help coordinate your entire holiday week logistics

---

**Celebrating a Jewish holiday in Chiang Mai?**

[Contact us on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I'm%20visiting%20Chiang%20Mai%20during%20a%20Jewish%20holiday) and we'll help plan tours around your holiday schedule.`,
    contentHe: `# חגים יהודיים בתאילנד — חגיגות בחו"ל

אחת מהחוויות המיוחדות למטיילים יהודים היא חגיגת חגים בחו"ל. רשת חב"ד בתאילנד מאפשרת זאת עם שירותים מלאים וארוחות קהילתיות.

## פסח

האירוע היהודי הגדול ביותר בתאילנד. חב"ד צ'יאנג מאי ובנגקוק שניהם מפעילים תוכניות פסח מלאות:
- סדרים קהילתיים (ליל ראשון ושני)
- ארוחות כשרות לפסח לאורך כל החג
- מצות ומוצרי פסח זמינים
- הזמינו מראש — זה הזמן הפופולרי ביותר

**טיפ לטיולים:** תזמנו את [הטיולים בצ'יאנג מאי](/kosher-tours) לחול המועד — הימים הבינוניים מושלמים לטיולי יום.

## סוכות

חב"ד בונה סוכה ומספק ארבעת המינים:
- ארוחות בסוכה
- לולב ואתרוג זמינים
- יפה במיוחד בעונה הקרירה

## ראש השנה ויום כיפור

- שירותי חגים גבוהים מלאים בחב"ד
- ארוחת ראש השנה חגיגית עם מאכלים מסורתיים
- תקיעת שופר
- סעודת מוצאי יום כיפור

## חנוכה

דצמבר בצ'יאנג מאי פירושו מזג אוויר קריר והדלקת נרות:
- אירועי הדלקת חנוכייה ציבוריים
- סופגניות ולביבות בחב"ד

## תכנון סביב חגים

כשמזמינים טיולים עם [WIRO 4x4](/kosher-tours):
- אנחנו לעולם לא מתזמנים טיולים בשבת או חגים יהודיים
- חול המועד אידיאלי לטיולי יום
- נעזור לתאם את כל הלוגיסטיקה של שבוע החג

---

**חוגגים חג יהודי בצ'יאנג מאי?**

[צרו קשר בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20מגיע/ה%20לצ'יאנג%20מאי%20בזמן%20חג%20יהודי) ונעזור לתכנן טיולים סביב לוח החגים שלכם.`,
  },

  {
    title: "Mae Kampong Village — The Hidden Gem Most Tourists Miss",
    titleHe: "כפר מאה קמפונג — הפנינה הנסתרת שרוב התיירים מפספסים",
    slug: "mae-kampong-village-hidden-gem-guide",
    excerpt:
      "A deep guide to Mae Kampong village: 700-year-old traditions, wild gibbon spotting, ancient fermented tea, and why this is Chiang Mai's best-kept secret.",
    excerptHe:
      "מדריך מעמיק לכפר מאה קמפונג: מסורות בנות 700 שנה, צפייה בגיבוני בר, תה מותסס עתיק ולמה זה הסוד הכי שמור של צ'יאנג מאי.",
    category: "destinations",
    content: `# Mae Kampong Village — The Hidden Gem Most Tourists Miss

While most Chiang Mai visitors stick to the Night Bazaar and temple circuit, a 700-year-old mountain village just 50 kilometers east holds one of Thailand's most authentic cultural experiences.

## What Makes Mae Kampong Special

Mae Kampong won Thailand's "Best Community-Based Tourism" award for good reason. This isn't a tourist recreation — it's a living village of 40+ families that has pioneered sustainable tourism while preserving centuries-old traditions.

**The village sits at 1,300 meters** on a misty mountainside, connected by bamboo walkways over streams. Giant Yang Na trees shade the paths, and the sound of flowing water is constant.

## Wild Gibbon Spotting

Before entering the village, your guide takes you on a 30-minute forest walk where rehabilitated gibbons swing through the canopy. Listen for their distinctive calls echoing through the valley — your guide knows their territories and can often locate them.

## The Miang Tea Experience

Mae Kampong is the birthplace of Miang — fermented tea leaves unique to northern Thailand. Sit with a local family who has been fermenting tea for generations and taste the difference between leaves aged one week, one month, and one year. This isn't a tourist demonstration; it's a living tradition.

## Kew Fin Viewpoint

The hike most visitors miss. A 2km trail climbs through forest to a cliff-edge viewpoint overlooking the entire Chiang Mai valley. On clear days, you can see Doi Suthep across the valley. This is the reward for those who venture beyond the village.

## The Ancient Giant Tree

A 1,000-year-old Yang Na tree stands as the sacred heart of the community. Locals make offerings here, and the massive trunk takes several people to circle.

## Practical Information

- **Getting there:** 50km east of Chiang Mai, 1-hour drive. Best reached by [private 4x4 tour with WIRO 4x4](/tours/mae-kampong-hidden-village)
- **Best time:** Year-round. Cool season (Nov-Feb) for best weather. Early morning for mist.
- **Duration:** 5-7 hours including transport
- **What to bring:** Comfortable walking shoes, light jacket, camera, cash for souvenirs

## Why Go with a Guide

Mae Kampong is technically visitable independently, but a guide transforms the experience:
- Access to private homes for tea ceremonies
- Gibbon territory knowledge
- Translation with village elders
- Kew Fin trail navigation
- [Hebrew-speaking guides available](/hebrew-guide)

---

**Ready to discover Mae Kampong?**

[Book the Mae Kampong tour](/tours/mae-kampong-hidden-village) or [chat with us on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I%20want%20to%20visit%20Mae%20Kampong%20village).`,
    contentHe: `# כפר מאה קמפונג — הפנינה הנסתרת שרוב התיירים מפספסים

בזמן שרוב המבקרים בצ'יאנג מאי נשארים בשוק הלילה ובמעגל המקדשות, כפר הררי בן 700 שנה רק 50 קילומטר מזרחה מחזיק אחת מחוויות התרבות האותנטיות ביותר בתאילנד.

## מה הופך את מאה קמפונג למיוחד

מאה קמפונג זכה בפרס "תיירות קהילתית מצטיינת" של תאילנד בצדק. זה לא שחזור תיירותי — זה כפר חי של 40+ משפחות שפיתח תיירות בת-קיימא תוך שימור מסורות בנות מאות שנים.

## צפייה בגיבוני בר

לפני הכניסה לכפר, המדריך לוקח אתכם להליכת יער של 30 דקות שם גיבונים ששוקמו מתנדנדים בצמרות. הקשיבו לקריאות המיוחדות שלהם — המדריך מכיר את הטריטוריות ויכול לאתר אותם.

## חוויית תה המיאנג

מאה קמפונג הוא מקום הולדתו של מיאנג — עלי תה מותססים ייחודיים לצפון תאילנד. שבו עם משפחה מקומית שמתססת תה כבר דורות וטעמו את ההבדל בין עלים שהתססו שבוע, חודש ושנה.

## תצפית קיו פין

הטיול שרוב המבקרים מפספסים. שביל של 2 ק"מ מטפס דרך יער לתצפית על שפת צוק מעל כל עמק צ'יאנג מאי.

---

**מוכנים לגלות את מאה קמפונג?**

[הזמינו את טיול מאה קמפונג](/tours/mae-kampong-hidden-village) או [שלחו הודעה בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20רוצה%20לבקר%20בכפר%20מאה%20קמפונג).`,
  },

  {
    title: "Best Off-Road Adventures in Northern Thailand",
    titleHe: "הרפתקאות השטח הטובות ביותר בצפון תאילנד",
    slug: "best-off-road-adventures-northern-thailand",
    excerpt:
      "Expert guide to Northern Thailand's best off-road experiences: jungle trails, river crossings, mountain circuits, and hidden destinations only 4x4s can reach.",
    excerptHe:
      "מדריך מומחה להרפתקאות השטח הטובות ביותר בצפון תאילנד: שבילי ג'ונגל, חציית נהרות, מעגלי הרים ויעדים נסתרים שרק רכבי 4x4 מגיעים אליהם.",
    category: "adventure",
    content: `# Best Off-Road Adventures in Northern Thailand

Northern Thailand's mountains hide some of Southeast Asia's best off-road terrain. From river crossings to jungle trails, here's why Chiang Mai is an off-road paradise.

## Why Chiang Mai for Off-Road

- Thousands of kilometers of unpaved mountain roads
- Diverse terrain: jungle, river, mountain, farmland
- Year-round accessibility (with seasonal variations)
- Safe and well-maintained vehicles available

## Top Off-Road Experiences

### 1. Mae Wang Jungle Trails
The real deal. River crossings, steep climbs through dense forest, and trails that test both vehicle and driver. The [Mae Wang tour](/tours/mae-wang-jungle-wilderness) includes Pha Chor Grand Canyon and ethical elephant encounters.

### 2. Samoeng Loop Back Roads
The main loop is paved, but the side tracks into Hmong villages require serious 4x4 capability. Our [Samoeng Loop tour](/tours/samoeng-loop-mountain-circuit) includes these hidden diversions.

### 3. Doi Inthanon Forest Roads
Beyond the tourist trail, Doi Inthanon National Park has forest service roads that wind through pristine cloud forest. [Our Doi Inthanon tour](/tours/doi-inthanon-roof-of-thailand) uses these routes.

### 4. Hill Tribe Village Access Roads
Many Karen, Hmong, and Lahu villages are only accessible by 4x4 dirt tracks. These are genuine, non-tourist communities.

## What Makes Our 4x4s Special

- Well-maintained Toyota Hilux and Fortuner vehicles
- Experienced drivers who know every trail
- Safety equipment and first aid on every trip
- Communication equipment for remote areas

## Best Season for Off-Road

- **Nov-Feb:** Dry trails, clear weather, best visibility
- **Mar-May:** Dry but hot, dusty conditions
- **Jun-Oct:** Muddy trails (more challenging and exciting), green landscapes, dramatic waterfalls

---

**Ready for a real off-road adventure?**

[Book the Mae Wang jungle tour](/tours/mae-wang-jungle-wilderness) for the ultimate 4x4 experience, or [chat with us](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I%20want%20an%20off-road%20adventure) to customize your itinerary.`,
    contentHe: `# הרפתקאות השטח הטובות ביותר בצפון תאילנד

ההרים של צפון תאילנד מסתירים חלק משטחי השטח הטובים ביותר בדרום מזרח אסיה. מחציית נהרות ועד שבילי ג'ונגל, הנה למה צ'יאנג מאי היא גן עדן לנסיעות שטח.

## למה צ'יאנג מאי לשטח

- אלפי קילומטרים של כבישי הרים לא סלולים
- שטח מגוון: ג'ונגל, נהר, הר, אדמות חקלאיות
- נגישות כל השנה

## חוויות השטח המובילות

### 1. שבילי ג'ונגל מאה וואנג
הדבר האמיתי. חציית נהרות, עליות תלולות דרך יער צפוף. [טיול מאה וואנג](/tours/mae-wang-jungle-wilderness) כולל את הגרנד קניון פה-צ'ור ומפגשי פילים אתיים.

### 2. דרכי שטח בלולאת סמאנג
הלולאה הראשית סלולה, אבל ההסתעפויות לכפרי המונג דורשות יכולת 4x4 רצינית. [טיול לולאת סמאנג](/tours/samoeng-loop-mountain-circuit) כולל הסתעפויות נסתרות אלה.

### 3. כבישי יער דוי אינתנון
מעבר לשביל התיירות, לפארק הלאומי דוי אינתנון יש כבישי שירות יער שמתפתלים דרך יער ענן בתולי. [טיול דוי אינתנון שלנו](/tours/doi-inthanon-roof-of-thailand) משתמש במסלולים אלה.

---

**מוכנים להרפתקת שטח אמיתית?**

[הזמינו את טיול ג'ונגל מאה וואנג](/tours/mae-wang-jungle-wilderness) לחוויית 4x4 אולטימטיבית, או [שלחו הודעה](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20רוצה%20הרפתקת%20שטח) להתאמת מסלול.`,
  },

  {
    title: "Doi Inthanon — Beyond the Summit: A Local's Guide",
    titleHe: "דוי אינתנון — מעבר לפסגה: מדריך מקומי",
    slug: "doi-inthanon-locals-guide",
    excerpt:
      "Go beyond the summit photo at Thailand's highest peak. Discover hidden trails, cloud forests, Karen coffee villages, and the best times to visit Doi Inthanon.",
    excerptHe:
      "התקדמו מעבר לצילום הפסגה בנקודה הגבוהה בתאילנד. גלו שבילים נסתרים, יערות ענן, כפרי קפה קארן והזמנים הטובים ביותר לבקר בדוי אינתנון.",
    category: "destinations",
    content: `# Doi Inthanon — Beyond the Summit: A Local's Guide

Most visitors to Doi Inthanon do the same thing: drive to the summit, take a selfie at the 2,565m marker, visit the twin pagodas, and drive back down. They're missing 90% of what makes this mountain special.

## The Secret Trail: Pha Dok Siew

While everyone queues for Kew Mae Pan (which requires a guide and advance booking), the Pha Dok Siew Nature Trail offers an equally stunning experience with a fraction of the crowds:
- 2.5km through cloud forest, rice terraces, and bamboo groves
- Ends at Mae Klang Luang village — a Karen community that grows and roasts its own coffee
- No advance booking needed
- Far fewer tourists

## Karen Village Coffee

Mae Klang Luang village produces single-origin coffee from beans grown on Doi Inthanon's slopes. The community-run cafe serves coffee that rivals anything in Chiang Mai's trendy shops. This is the real deal — from slope to cup in the same village.

## Ang Ka Luang Cloud Forest

The 360-meter boardwalk near the summit passes through one of Thailand's last remaining sphagnum bogs. This is a moss-draped, otherworldly landscape. Bird watchers come here for 300+ species, including many endemic montane specialties.

## Best Time to Visit

- **Nov-Feb:** Cool temperatures (can drop to 5C at summit), clear skies, rhododendron blooms
- **Weekdays:** Far fewer visitors than weekends
- **Early morning:** Arrive before 9 AM for minimal crowds at Wachirathan Waterfall

## What Most Visitors Don't Know

1. The summit temperature can be 15-20C cooler than Chiang Mai city
2. The Hmong market sells fresh strawberries only in Nov-Feb
3. The waterfall has a hidden viewpoint behind the cascade
4. Bird watching is best in the early morning near the summit

---

**Experience Doi Inthanon the right way.**

[Book our Doi Inthanon tour](/tours/doi-inthanon-roof-of-thailand) — we take you beyond the summit to the hidden trails and villages that make this mountain extraordinary. [Chat on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I%20want%20to%20explore%20Doi%20Inthanon).`,
    contentHe: `# דוי אינתנון — מעבר לפסגה: מדריך מקומי

רוב המבקרים בדוי אינתנון עושים את אותו דבר: נוסעים לפסגה, מצטלמים ליד סימן 2,565 מ', מבקרים בפגודות התאומות וחוזרים. הם מפספסים 90% ממה שהופך את ההר הזה למיוחד.

## השביל הסודי: פה דוק סיו

בזמן שכולם עומדים בתור לקיו מאה פאן, שביל הטבע פה דוק סיו מציע חוויה מרהיבה לא פחות עם שבריר מהקהל:
- 2.5 ק"מ דרך יער ענן, טרסות אורז וחורשות במבוק
- מסתיים בכפר מאה קלאנג לואנג — קהילת קארן שמגדלת וקולה קפה משלה
- לא צריך הזמנה מראש
- הרבה פחות תיירים

## קפה כפר קארן

כפר מאה קלאנג לואנג מייצר קפה מזן יחיד מפולים שגדלים על מדרונות דוי אינתנון. בית הקפה הקהילתי מגיש קפה שמתחרה בכל בתי הקפה הטרנדיים של צ'יאנג מאי.

## יער ענן אנג קא לואנג

גשר העץ באורך 360 מ' ליד הפסגה עובר דרך אחת מביצות הספגנום האחרונות בתאילנד. נוף עוטף טחב, על-עולמי.

---

**חוו את דוי אינתנון בדרך הנכונה.**

[הזמינו את טיול דוי אינתנון שלנו](/tours/doi-inthanon-roof-of-thailand) — ניקח אתכם מעבר לפסגה לשבילים הנסתרים והכפרים שהופכים את ההר הזה ליוצא דופן. [שלחו הודעה בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20רוצה%20לגלות%20את%20דוי%20אינתנון).`,
  },

  {
    title: "Sticky Waterfalls Chiang Mai — How to Actually Climb Them",
    titleHe: "מפלים דביקים צ'יאנג מאי — איך באמת מטפסים עליהם",
    slug: "sticky-waterfalls-chiang-mai-how-to-climb",
    excerpt:
      "Everything you need to know about Chiang Mai's famous Sticky Waterfalls: how they work, what to wear, the best route up, and insider tips from local guides.",
    excerptHe:
      "כל מה שצריך לדעת על המפלים הדביקים המפורסמים של צ'יאנג מאי: איך הם עובדים, מה ללבוש, המסלול הטוב ביותר למעלה וטיפים פנימיים ממדריכים מקומיים.",
    category: "destinations",
    content: `# Sticky Waterfalls Chiang Mai — How to Actually Climb Them

The Bua Tong Sticky Waterfalls are one of Chiang Mai's most unique natural attractions — a waterfall you climb UP, barefoot, without any ropes or equipment. Here's everything you need to know.

## How Do Sticky Waterfalls Work?

The limestone at Bua Tong is rich in calcium carbonate, which creates a rough, porous surface. When water flows over it, the rock becomes even grippier — like natural sandpaper. Your bare feet stick to the surface even on steep sections where it looks impossible.

## The Climbing Route

- **Total height:** About 100 meters from base to top
- **Multiple tiers:** Several levels connected by the flowing water
- **Difficulty:** Surprisingly easy — even children can do it
- **Best approach:** Walk straight up through the flowing water, not along the dry edges

## What to Wear

- **Feet:** Barefoot is best — shoes actually reduce grip
- **Clothing:** Quick-dry shorts or swimsuit. You WILL get wet.
- **Optional:** Water shoes for walking to/from the waterfall (the access path has some rough spots)

## Insider Tips

1. **Go in the afternoon** (after 2 PM) — fewer visitors
2. **The left side** of the waterfall has better grip than the right
3. **Bring a waterproof phone case** — you'll want photos
4. **The natural pools at the top** are perfect for resting before descending
5. **Descending is trickier** than ascending — go slow and sideways

## Getting There

Bua Tong is about 60km north of Chiang Mai in Si Lanna National Park. The best way is to combine it with other attractions as part of our [Sticky Waterfalls tour](/tours/maerim-sticky-waterfalls), which includes:
- Queen Sirikit Botanical Garden canopy walkway
- Mae Sa Waterfall upper tiers
- Hill tribe village visit
- The Sticky Waterfall experience

## Best Time to Visit

- **Year-round:** The waterfall flows all year
- **Nov-Apr (dry season):** Less water flow but easier climbing
- **Jun-Oct (rainy season):** More dramatic water flow, slightly more challenging

## Safety

- Very safe for all ages
- No equipment needed
- Lifeguards not required (it's a natural slope, not a cliff)
- First-timers always surprised how easy it is

---

**Ready to climb a waterfall?**

[Book the Sticky Waterfalls tour](/tours/maerim-sticky-waterfalls) for the complete experience, or [message us on WhatsApp](https://wa.me/66929894495?text=Hi%20WIRO%204x4!%20I%20want%20to%20climb%20the%20Sticky%20Waterfalls).`,
    contentHe: `# מפלים דביקים צ'יאנג מאי — איך באמת מטפסים עליהם

המפלים הדביקים של בואה טונג הם אחת מהאטרקציות הטבעיות הייחודיות ביותר של צ'יאנג מאי — מפל שמטפסים עליו למעלה, יחפים, בלי חבלים או ציוד. הנה כל מה שצריך לדעת.

## איך מפלים דביקים עובדים?

אבן הגיר בבואה טונג עשירה בסידן פחמתי, שיוצר משטח מחוספס ונקבובי. כשמים זורמים עליו, הסלע נהיה אוחז עוד יותר — כמו נייר זכוכית טבעי. כפות הרגליים שלכם נדבקות למשטח אפילו בחלקים תלולים שנראים בלתי אפשריים.

## מסלול הטיפוס

- **גובה כולל:** כ-100 מטר מהבסיס לפסגה
- **מספר קומות:** כמה רמות מחוברות על ידי המים הזורמים
- **קושי:** קל להפתיע — אפילו ילדים יכולים
- **הגישה הטובה:** לכו ישר למעלה דרך המים הזורמים, לא לאורך השוליים היבשים

## מה ללבוש

- **רגליים:** יחפים הכי טוב — נעליים בעצם מפחיתות אחיזה
- **ביגוד:** שורטס מתייבשים מהר או בגד ים. אתם תירטבו.

## טיפים פנימיים

1. **לכו אחר-הצהריים** (אחרי 14:00) — פחות מבקרים
2. **הצד השמאלי** של המפל אוחז טוב יותר מהימני
3. **הביאו נרתיק עמיד למים לטלפון** — תרצו תמונות
4. **הבריכות הטבעיות בראש** מושלמות למנוחה לפני הירידה

## הגעה

בואה טונג כ-60 ק"מ צפונית לצ'יאנג מאי בפארק הלאומי סי לאנה. הדרך הטובה ביותר היא לשלב עם אטרקציות נוספות במסגרת [טיול המפלים הדביקים שלנו](/tours/maerim-sticky-waterfalls).

---

**מוכנים לטפס על מפל?**

[הזמינו את טיול המפלים הדביקים](/tours/maerim-sticky-waterfalls) לחוויה המלאה, או [שלחו הודעה בוואטסאפ](https://wa.me/66929894495?text=היי%20WIRO%204x4!%20רוצה%20לטפס%20על%20המפלים%20הדביקים).`,
  },
];

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set. Cannot seed blog articles.");
    console.log("\nTo use this script, run:");
    console.log(
      "  DATABASE_URL=mysql://... npx tsx server/seed-blog-articles.ts"
    );
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  console.log(`Seeding ${articles.length} blog articles...`);

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
        isPublished: 1,
        publishedAt: new Date(),
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
  console.log("\nDone! Blog articles seeded successfully.");
}

seed().catch(console.error);
