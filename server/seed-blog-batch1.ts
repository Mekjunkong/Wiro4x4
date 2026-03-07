/**
 * Blog Article Seed Script — Batch 1 (3 articles)
 *
 * Run with: npx tsx server/seed-blog-batch1.ts
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { blogPosts } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const articles = [
  // ─── Article 1: Best Time to Visit Chiang Mai for Off-Road Tours ───
  {
    title: "Best Time to Visit Chiang Mai for Off-Road Tours",
    titleHe: "הזמן הטוב ביותר לבקר בצ'יאנג מאי לטיולי שטח",
    slug: "best-time-to-visit-chiang-mai-off-road-tours",
    coverImage: "/images/optimized/chiang_mai_valley_panorama.jpg",
    excerpt:
      "Plan your Chiang Mai off-road adventure around the best seasons. Learn when trails are at their peak, what weather to expect month by month, and how to avoid the crowds.",
    excerptHe:
      "תכננו את הרפתקת השטח שלכם בצ'יאנג מאי סביב העונות הטובות ביותר. למדו מתי השבילים במיטבם, מה מזג האוויר הצפוי בכל חודש וכיצד להימנע מהמונים.",
    category: "Travel Tips",
    content: `# Best Time to Visit Chiang Mai for Off-Road Tours

Chiang Mai's mountainous terrain makes it one of Southeast Asia's top destinations for off-road adventures. But timing your visit right can mean the difference between an unforgettable jungle expedition and a muddy, frustrating washout. Here's your complete seasonal guide to planning the perfect 4x4 adventure in Northern Thailand.

## The Three Seasons of Northern Thailand

Unlike the tropical south, Chiang Mai experiences three distinct seasons that dramatically affect trail conditions, scenery, and your overall experience.

### Cool Season (November – February) — The Golden Window

This is the **prime season for off-road touring** in Chiang Mai. Daytime temperatures hover between 20-30°C (68-86°F), dropping to a refreshing 10-15°C at night in the mountains. The trails are dry but not dusty, rivers run at manageable levels, and the jungle canopy is lush from the preceding rains.

**Why it's ideal for off-roading:**
- Firm trail surfaces with excellent traction
- Clear mountain views and stunning sunrises
- Comfortable temperatures for hiking segments
- Waterfalls still flowing beautifully from monsoon reserves

The [Doi Inthanon tour](/tours/doi-inthanon-roof-of-thailand) is spectacular during this period — you may even see frost at Thailand's highest peak on early morning runs. The [Samoeng Loop](/tours/samoeng-loop-mountain-circuit) offers crystal-clear valley panoramas that stretch for kilometers.

**Pro tip:** December and January are peak tourist months. Book your tours at least 2-3 weeks in advance, especially around Christmas and New Year.

### Hot Season (March – May) — For the Adventurous

Temperatures climb to 35-40°C, and the infamous "burning season" (smoke from agricultural fires) can reduce visibility in March and early April. However, this is when you'll find the fewest tourists and the most authentic local experiences.

**Off-road considerations:**
- Trails are bone-dry, which means more dust but stable ground
- River crossings are at their shallowest — easier for beginners
- Some waterfalls slow to a trickle
- Songkran (Thai New Year, April 13-15) is an incredible cultural experience

The [Mae Wang Jungle Wilderness tour](/tours/mae-wang-jungle-wilderness) works well in hot season because the dense jungle canopy provides natural shade. Early morning departures (7:00 AM) help you beat the afternoon heat.

### Rainy Season (June – October) — The Wild Card

The monsoon transforms Northern Thailand into an emerald paradise. Waterfalls rage, rice terraces glow neon green, and the mountains disappear into dramatic cloud formations. It's also when off-roading gets truly exciting — and challenging.

**What to expect:**
- Rain typically falls in short, intense afternoon bursts (mornings are often clear)
- Trails become muddy and slippery — real 4x4 territory
- Rivers swell, making some crossings impossible
- Leeches appear on jungle trails
- Lush greenery and dramatic skies create incredible photo opportunities

Experienced off-roaders often prefer this season for the adrenaline factor. The [Sticky Waterfalls tour](/tours/maerim-sticky-waterfalls) is at its most impressive during the rainy months, with water cascading down the limestone in sheets.

**Important:** Some remote trails close during heavy monsoon periods (August-September). Always check current conditions with your tour operator.

## Month-by-Month Quick Guide

| Month | Temp (°C) | Rain | Trail Condition | Crowds | Rating |
|-------|-----------|------|-----------------|--------|--------|
| January | 15-30 | Dry | Excellent | High | Top Pick |
| February | 17-33 | Dry | Excellent | Medium | Top Pick |
| March | 20-36 | Dry | Good (dusty) | Low | Good |
| April | 23-38 | Light | Good | Low | Good |
| May | 23-35 | Moderate | Variable | Low | Fair |
| June | 23-33 | Heavy | Muddy | Low | Fair |
| July | 23-32 | Heavy | Challenging | Very Low | Adventurous |
| August | 23-32 | Very Heavy | Challenging | Very Low | Adventurous |
| September | 22-32 | Heavy | Challenging | Very Low | Adventurous |
| October | 21-32 | Moderate | Recovering | Low | Fair |
| November | 19-31 | Light | Good | Medium | Great |
| December | 15-29 | Dry | Excellent | High | Top Pick |

## Special Considerations for Israeli Travelers

### Jewish Holidays and Chiang Mai Seasons

Planning around Jewish holidays can actually work in your favor:

- **Sukkot (September/October):** Rainy season is winding down, prices are low, and the landscape is incredibly green
- **Hanukkah (December):** Perfect cool-season weather and easy to find Chabad events in Chiang Mai
- **Pesach (March/April):** Hot season, but Chabad Chiang Mai organizes large Seders — combine your tour trip with community celebrations
- **Post-army travel (year-round):** Many Israelis visit after military service. The cool season offers the most comfortable experience for extended trips

### Shabbat Planning

WIRO 4x4 respects Shabbat observance. We do not operate tours on Shabbat, so plan your itinerary accordingly. Friday tours return well before candle lighting time, and we can recommend Shabbat-friendly accommodations near Chabad of Chiang Mai.

## How to Book the Best Experience

1. **Choose your season** based on your priorities (comfort vs. adventure vs. budget)
2. **Book early** for cool-season trips (November-February fill up fast)
3. **Consider multi-day packages** — a 2-3 day itinerary lets you experience different terrains and elevations
4. **Tell us your preferences** — we customize every tour based on your group's interests, fitness level, and schedule

The [Mae Kampong Hidden Village tour](/tours/mae-kampong-hidden-village) and [Doi Suthep & Beyond](/tours/doi-suthep-pui-beyond-temple) are excellent year-round options with routes that adapt well to any season.

## Ready to Plan Your Chiang Mai Off-Road Adventure?

Whether you're chasing cool-season clarity or monsoon-season thrills, WIRO 4x4 has the local expertise to make your trip extraordinary. [Contact us on WhatsApp](https://wa.me/66929894495) to start planning your custom off-road experience in Northern Thailand.`,
    contentHe: `# הזמן הטוב ביותר לבקר בצ'יאנג מאי לטיולי שטח

השטח ההררי של צ'יאנג מאי הופך אותה לאחד היעדים המובילים בדרום-מזרח אסיה להרפתקאות שטח. אבל תזמון נכון של הביקור שלכם יכול להיות ההבדל בין מסע ג'ונגל בלתי נשכח לבין חוויה מתסכלת בבוץ. הנה המדריך העונתי המלא שלכם לתכנון הרפתקת 4x4 מושלמת בצפון תאילנד.

## שלוש העונות של צפון תאילנד

בניגוד לדרום הטרופי, צ'יאנג מאי חווה שלוש עונות מובחנות שמשפיעות באופן דרמטי על מצב השבילים, הנוף והחוויה הכוללת.

### העונה הקרירה (נובמבר – פברואר) — החלון המושלם

זוהי **העונה האידיאלית לטיולי שטח** בצ'יאנג מאי. טמפרטורות היום נעות בין 20-30 מעלות, ויורדות ל-10-15 מעלות בלילה בהרים. השבילים יבשים אך לא מאובקים, הנהרות זורמים ברמות נוחות, וחופת הג'ונגל ירוקה ושופעת מהגשמים שקדמו.

**למה זה אידיאלי לנהיגת שטח:**
- משטחי שביל יציבים עם אחיזה מצוינת
- נופי הרים בהירים וזריחות מדהימות
- טמפרטורות נוחות לקטעי הליכה
- מפלים עדיין זורמים יפה ממאגרי המונסון

הסיור ל[דוי אינתנון](/tours/doi-inthanon-roof-of-thailand) מרהיב בתקופה זו — ייתכן שתראו אפילו כפור בפסגה הגבוהה ביותר בתאילנד בנסיעות בוקר מוקדמות. ה[לולאת סאמואנג](/tours/samoeng-loop-mountain-circuit) מציעה פנורמות עמק צלולות שנמשכות לקילומטרים.

### העונה החמה (מרץ – מאי) — להרפתקנים

הטמפרטורות עולות ל-35-40 מעלות, ו"עונת השריפות" המפורסמת יכולה להפחית את הנראות במרץ ותחילת אפריל. עם זאת, זו התקופה בה תמצאו הכי פחות תיירים והכי הרבה חוויות מקומיות אותנטיות.

**שיקולי שטח:**
- השבילים יבשים לגמרי — יותר אבק אבל קרקע יציבה
- חציות נהר ברמות הנמוכות ביותר — קל יותר למתחילים
- חלק מהמפלים מאטים לטפטוף
- סונגקראן (ראש השנה התאילנדי, 13-15 באפריל) הוא חוויה תרבותית מדהימה

הסיור ל[מאה וואנג](/tours/mae-wang-jungle-wilderness) עובד היטב בעונה החמה כי חופת הג'ונגל הצפופה מספקת צל טבעי.

### עונת הגשמים (יוני – אוקטובר) — הפתעות

המונסון הופך את צפון תאילנד לגן עדן אזמרגדי. מפלים גועשים, מדרגות אורז זוהרות בירוק ניאון, וההרים נעלמים בתוך ענני ערפל דרמטיים. זה גם הזמן שבו נהיגת השטח נהיית באמת מרגשת — ומאתגרת.

**מה לצפות:**
- גשם יורד בדרך כלל בהתפרצויות קצרות וחזקות אחר הצהריים (בקרים לרוב בהירים)
- שבילים הופכים לבוציים וחלקלקים — שטח אמיתי ל-4x4
- נהרות תופחים, מה שהופך חלק מהחציות לבלתי אפשריות
- עלוקות מופיעות בשבילי הג'ונגל
- ירוק שופע ושמיים דרמטיים יוצרים הזדמנויות צילום מדהימות

ה[מפלי הסטיקי](/tours/maerim-sticky-waterfalls) מרשימים במיוחד בחודשי הגשם, עם מים שנשפכים על הגיר בגליונות.

## שיקולים מיוחדים למטיילים ישראלים

### חגים יהודיים ועונות צ'יאנג מאי

תכנון סביב חגים יהודיים יכול דווקא לעבוד לטובתכם:

- **סוכות (ספטמבר/אוקטובר):** עונת הגשמים שוככת, המחירים נמוכים, והנוף ירוק להפליא
- **חנוכה (דצמבר):** מזג אוויר מושלם של העונה הקרירה וקל למצוא אירועי חב"ד בצ'יאנג מאי
- **פסח (מרץ/אפריל):** עונה חמה, אבל חב"ד צ'יאנג מאי מארגנים סדרים גדולים
- **טיול אחרי צבא (כל השנה):** ישראלים רבים מבקרים אחרי השירות הצבאי. העונה הקרירה מציעה את החוויה הנוחה ביותר

### תכנון שבת

WIRO 4x4 מכבד שמירת שבת. אנחנו לא מפעילים סיורים בשבת, אז תכננו את המסלול שלכם בהתאם. סיורי יום שישי חוזרים הרבה לפני הדלקת נרות, ואנחנו יכולים להמליץ על מקומות לינה ידידותיים לשבת ליד חב"ד צ'יאנג מאי.

## איך להזמין את החוויה הטובה ביותר

1. **בחרו את העונה** על פי העדפותיכם (נוחות מול הרפתקה מול תקציב)
2. **הזמינו מוקדם** לטיולים בעונה הקרירה (נובמבר-פברואר מתמלאים מהר)
3. **שקלו חבילות רב-יומיות** — מסלול של 2-3 ימים מאפשר לכם לחוות שטחים וגבהים שונים
4. **ספרו לנו על ההעדפות שלכם** — אנחנו מתאימים כל סיור למאפייני הקבוצה שלכם

הסיור ל[כפר מאה קמפונג הנסתר](/tours/mae-kampong-hidden-village) ו[דוי סוטפ ומעבר לו](/tours/doi-suthep-pui-beyond-temple) הם אפשרויות מצוינות לכל עונה.

## מוכנים לתכנן את הרפתקת השטח שלכם בצ'יאנג מאי?

בין אם אתם רודפים אחרי בהירות העונה הקרירה או ריגושי המונסון, ל-WIRO 4x4 יש את המומחיות המקומית להפוך את הטיול שלכם ליוצא דופן. [צרו קשר בוואטסאפ](https://wa.me/66929894495) כדי להתחיל לתכנן את חוויית השטח המותאמת אישית שלכם בצפון תאילנד.`,
  },

  // ─── Article 2: Kosher Food Guide for Northern Thailand Travelers ───
  {
    title: "Kosher Food Guide for Northern Thailand Travelers",
    titleHe: "מדריך אוכל כשר למטיילים בצפון תאילנד",
    slug: "kosher-food-guide-northern-thailand",
    coverImage: "/images/optimized/kosher_meal.jpg",
    excerpt:
      "A practical guide to finding and enjoying kosher food in Chiang Mai and Northern Thailand — from Chabad kitchens to self-catering tips and kosher-friendly restaurants.",
    excerptHe:
      "מדריך מעשי למציאת אוכל כשר בצ'יאנג מאי ובצפון תאילנד — ממטבחי חב\"ד ועד טיפים לבישול עצמי ומסעדות ידידותיות לכשרות.",
    category: "Food & Kosher",
    content: `# Kosher Food Guide for Northern Thailand Travelers

One of the biggest concerns for observant Jewish travelers heading to Southeast Asia is food. Can you keep kosher in Chiang Mai? The short answer is: absolutely yes — and it's easier than you might think. This comprehensive guide covers everything from Chabad meals to self-catering strategies, so you can focus on enjoying your Northern Thailand adventure without worrying about your next meal.

## Chabad of Chiang Mai — Your Kosher Home Base

The Chabad House in Chiang Mai has been serving the Jewish community and travelers for over two decades. Located in the Old City area, it's the cornerstone of kosher dining in Northern Thailand.

### What Chabad Offers

- **Friday Night Dinner:** A full Shabbat dinner every week, often hosting 100+ travelers. Reservations recommended but walk-ins usually welcome
- **Shabbat Lunch:** Available with advance registration
- **Holiday Meals:** Major Jewish holidays feature large communal meals — Pesach Seders regularly draw 500+ people
- **Daily Meals:** During busy seasons, Chabad often offers weekday lunch and dinner options
- **Kosher Store:** A small shop sells kosher snacks, instant noodles, canned goods, and basic supplies

**Location:** Chabad of Chiang Mai is centrally located in the Old City, walkable from most popular guesthouses and hostels.

**Cost:** Shabbat meals are typically offered on a donation basis. Holiday meals may have a set fee — check their website or WhatsApp for current details.

## Kosher-Friendly Restaurants and Markets

While there aren't many certified kosher restaurants outside of Chabad in Chiang Mai, there are plenty of options for keeping kosher with some planning.

### Naturally Kosher Options

Many Thai dishes are naturally free from non-kosher ingredients when you know what to look for:

- **Fresh Fruit:** Thailand is a fruit paradise. Markets overflow with mango, papaya, dragon fruit, pineapple, coconut, and dozens of exotic varieties. All naturally kosher
- **Vegetable Stir-Fries:** Most basic vegetable stir-fries at Thai restaurants use vegetable oil. Ask for "jay" (เจ) — the Thai word for vegan/Buddhist vegetarian — to ensure no animal products
- **Rice Dishes:** Plain steamed rice (khao suay) is a safe staple everywhere
- **Fresh Coconut Water:** Available at every street corner and market — refreshing and 100% kosher
- **Nuts and Seeds:** Roasted cashews, peanuts, and various seeds are widely available at markets

### Night Markets and Street Food Tips

Chiang Mai's famous night markets (like the Sunday Walking Street and Saturday Night Market) offer extensive food options. Here's how to navigate them:

1. **Stick to whole fruits** — cut fruit from vendors is generally fine, but verify the cutting board isn't shared with non-kosher items
2. **Fresh juices** from dedicated juice stalls are typically safe
3. **Grilled corn on the cob** is a popular and usually kosher-safe street food
4. **Avoid:** Mixed dishes from stalls that also cook meat, soups with unknown stock bases, and anything with shrimp paste (common in Thai cooking)

### Supermarkets for Self-Catering

For travelers who prefer to prepare their own meals, Chiang Mai has excellent supermarkets:

- **Rimping Supermarket:** The most upscale option with a wide selection of imported foods, fresh produce, and international products. Multiple locations including Nimmanhaemin and Maya Mall
- **Tops Market:** Found in Central Festival and other malls. Good selection of fresh vegetables, fruits, breads, and packaged goods
- **Makro:** A wholesale market great for buying in bulk if you're staying long-term

**Self-catering essentials to buy locally:**
- Fresh bread (check ingredients for animal fats)
- Eggs
- Fresh fruits and vegetables
- Rice and pasta
- Canned tuna and beans
- Peanut butter
- Instant coffee and tea

## Kosher Dining on WIRO 4x4 Tours

At WIRO 4x4, we understand that kosher food is non-negotiable for many of our guests. That's why we offer **kosher meal packages** on all our tours.

### What We Provide

- **Kosher picnic lunches** prepared with kosher ingredients for day tours
- **Snack packs** with fruits, nuts, granola bars, and bottled water
- **Advance coordination** — tell us your dietary requirements when booking, and we'll handle the rest
- **Flexible scheduling** — tours can include stops at markets where you can select your own food

Our guides are familiar with kosher requirements and can help you navigate local markets and restaurants. The [Doi Inthanon tour](/tours/doi-inthanon-roof-of-thailand) includes a lunch stop where we can arrange kosher-friendly options, and the [Mae Kampong village tour](/tours/mae-kampong-hidden-village) can include a self-prepared meal experience with fresh local ingredients.

## Regional Kosher Tips: Beyond Chiang Mai

If your Northern Thailand itinerary extends beyond Chiang Mai, here's what to know:

### Pai
- No Chabad or kosher restaurants
- Self-catering is your best bet — Pai has small supermarkets and excellent fresh produce at the morning market
- Many Israeli-owned guesthouses understand kosher needs and can help accommodate

### Chiang Rai
- A smaller Chabad presence occasionally operates, especially during high season — check in advance
- The night bazaar has fresh fruit vendors and vegetable options
- Golden Triangle tours can be combined with packed kosher meals from Chiang Mai

### Mae Hong Son
- Very remote — bring all kosher food supplies from Chiang Mai
- Local markets have excellent fresh produce for self-catering

## Practical Tips for Kosher Travel in Thailand

1. **Pack basics from home:** Bring your favorite kosher snack bars, instant soups, and any specific items you can't live without
2. **Learn key Thai phrases:**
   - "Mai sai nam pla" (ไม่ใส่น้ำปลา) = No fish sauce
   - "Mai sai nam man hoi" (ไม่ใส่น้ำมันหอย) = No oyster sauce
   - "Jay" (เจ) = Vegan/vegetarian
   - "Mai sai nuea sat" (ไม่ใส่เนื้อสัตว์) = No meat
3. **Carry emergency snacks:** Always have nuts, fruit, or granola bars in your daypack
4. **Connect with the community:** The Israeli traveler network in Chiang Mai is strong — join Facebook groups and WhatsApp groups for real-time kosher tips
5. **Use technology:** Apps like "Is It Kosher?" can help identify packaged products with kosher symbols
6. **Stay near Chabad:** When choosing accommodation, proximity to Chabad makes Shabbat meals much easier

## The Bottom Line

Keeping kosher in Chiang Mai is not only possible — it can actually enhance your travel experience by connecting you with a vibrant Jewish community and encouraging you to explore local markets and fresh produce. With Chabad as your anchor, smart self-catering strategies, and a tour company like WIRO 4x4 that understands your needs, you won't miss a single meal or a single adventure.

[Contact us on WhatsApp](https://wa.me/66929894495) to discuss kosher meal options for your upcoming tour, or visit our [Kosher Tours page](/kosher-tours) for more information.`,
    contentHe: `# מדריך אוכל כשר למטיילים בצפון תאילנד

אחד החששות הגדולים ביותר עבור מטיילים יהודים שומרי מצוות שנוסעים לדרום-מזרח אסיה הוא האוכל. האם אפשר לשמור כשרות בצ'יאנג מאי? התשובה הקצרה היא: בהחלט כן — וזה קל יותר ממה שאתם חושבים. המדריך המקיף הזה מכסה הכל, מארוחות חב"ד ועד אסטרטגיות בישול עצמי, כדי שתוכלו להתמקד בהנאה מההרפתקה שלכם בצפון תאילנד.

## חב"ד צ'יאנג מאי — הבסיס הכשר שלכם

בית חב"ד בצ'יאנג מאי משרת את הקהילה היהודית והמטיילים כבר למעלה משני עשורים. הוא ממוקם באזור העיר העתיקה, והוא אבן הפינה של האוכל הכשר בצפון תאילנד.

### מה חב"ד מציע

- **ארוחת שישי בערב:** ארוחת שבת מלאה כל שבוע, לעתים קרובות מארחת 100+ מטיילים. מומלץ להירשם מראש
- **ארוחת שבת צהריים:** זמינה עם הרשמה מראש
- **ארוחות חג:** חגים יהודיים גדולים כוללים ארוחות קהילתיות גדולות — סדרי פסח מושכים באופן קבוע 500+ אנשים
- **ארוחות יומיות:** בעונות עמוסות, חב"ד מציע לעתים קרובות אפשרויות ארוחת צהריים וערב
- **חנות כשרה:** חנות קטנה מוכרת חטיפים כשרים, נודלס מהיר, שימורים ומוצרים בסיסיים

## אפשרויות כשרות טבעיות בשוק

מנות תאילנדיות רבות נקיות באופן טבעי ממרכיבים לא כשרים כשיודעים מה לחפש:

- **פירות טריים:** תאילנד היא גן עדן של פירות. השווקים גדושים במנגו, פפאיה, פרי דרקון, אננס, קוקוס ועשרות זנים אקזוטיים
- **טיגוני ירקות:** רוב טיגוני הירקות הבסיסיים במסעדות תאילנדיות משתמשים בשמן צמחי. בקשו "ג'יי" (เจ) — המילה התאילנדית לטבעוני
- **מנות אורז:** אורז מאודה רגיל (ข้าวสวย) הוא מזון בסיסי בטוח בכל מקום
- **מי קוקוס טריים:** זמינים בכל פינת רחוב ושוק
- **אגוזים וזרעים:** קשיו קלוי, בוטנים וזרעים שונים זמינים בשפע בשווקים

### טיפים לשווקי לילה ואוכל רחוב

שווקי הלילה המפורסמים של צ'יאנג מאי מציעים אפשרויות אוכל נרחבות:

1. **הישארו עם פירות שלמים** — פירות חתוכים מדוכנים בדרך כלל בסדר, אבל ודאו שמשטח החיתוך לא משותף עם פריטים לא כשרים
2. **מיצים טריים** מדוכני מיצים ייעודיים בדרך כלל בטוחים
3. **תירס קלוי** הוא אוכל רחוב פופולרי ובדרך כלל בטוח מבחינת כשרות
4. **הימנעו:** ממנות מעורבות מדוכנים שמבשלים גם בשר, ממרקים עם בסיס ציר לא ידוע, ומכל דבר עם משחת שרימפס

### סופרמרקטים לבישול עצמי

- **רימפינג סופרמרקט:** האפשרות היוקרתית ביותר עם מבחר רחב של מוצרים מיובאים, תוצרת טרייה ומוצרים בינלאומיים
- **טופס מרקט:** נמצא בסנטרל פסטיבל ומרכזים מסחריים אחרים
- **מאקרו:** שוק סיטונאי מצוין לקניות בכמויות

## אוכל כשר בסיורי WIRO 4x4

ב-WIRO 4x4, אנחנו מבינים שאוכל כשר הוא ללא פשרות עבור רבים מהאורחים שלנו. לכן אנחנו מציעים **חבילות ארוחות כשרות** בכל הסיורים שלנו.

### מה אנחנו מספקים

- **ארוחות פיקניק כשרות** מוכנות עם מרכיבים כשרים לסיורי יום
- **חבילות חטיפים** עם פירות, אגוזים, חטיפי גרנולה ומים
- **תיאום מראש** — ספרו לנו על הדרישות התזונתיות שלכם בעת ההזמנה ואנחנו נטפל בשאר
- **לוח זמנים גמיש** — סיורים יכולים לכלול עצירות בשווקים בהם תוכלו לבחור אוכל משלכם

המדריכים שלנו מכירים את דרישות הכשרות ויכולים לעזור לכם לנווט בשווקים ובמסעדות מקומיות. הסיור ל[דוי אינתנון](/tours/doi-inthanon-roof-of-thailand) כולל עצירת צהריים בה אנחנו יכולים לארגן אפשרויות כשרות, וסיור [כפר מאה קמפונג](/tours/mae-kampong-hidden-village) יכול לכלול חוויית ארוחה עם מרכיבים מקומיים טריים.

## טיפים מעשיים לנסיעה כשרה בתאילנד

1. **ארזו בסיסיים מהבית:** הביאו חטיפים כשרים אהובים, מרקים מהירים וכל פריט ספציפי שאתם חייבים
2. **למדו ביטויים תאילנדיים חיוניים:**
   - "מאי סאי נאם פלא" = בלי רוטב דגים
   - "מאי סאי נאם מאן הוי" = בלי רוטב צדפות
   - "ג'יי" = טבעוני/צמחוני
3. **סחבו חטיפי חירום:** תמיד יהיו לכם אגוזים, פרי או חטיפי גרנולה בתיק היום
4. **התחברו לקהילה:** רשת המטיילים הישראלית בצ'יאנג מאי חזקה — הצטרפו לקבוצות פייסבוק ווואטסאפ לטיפים בזמן אמת
5. **השתמשו בטכנולוגיה:** אפליקציות יכולות לעזור לזהות מוצרים ארוזים עם סמלי כשרות
6. **התארחו קרוב לחב"ד:** כשבוחרים מקום לינה, קרבה לחב"ד מקלה מאוד על ארוחות שבת

## השורה התחתונה

שמירת כשרות בצ'יאנג מאי לא רק אפשרית — היא יכולה למעשה לשפר את חוויית הטיול שלכם על ידי חיבור לקהילה יהודית תוססת ועידוד לחקור שווקים מקומיים ותוצרת טרייה. עם חב"ד כעוגן שלכם, אסטרטגיות בישול עצמי חכמות, וחברת סיורים כמו WIRO 4x4 שמבינה את הצרכים שלכם, לא תפסידו אף ארוחה ואף הרפתקה.

[צרו קשר בוואטסאפ](https://wa.me/66929894495) כדי לדון באפשרויות ארוחות כשרות לסיור הקרוב שלכם, או בקרו ב[דף הסיורים הכשרים](/kosher-tours) למידע נוסף.`,
  },

  // ─── Article 3: Family-Friendly 4x4 Adventures in Chiang Mai ───
  {
    title: "Family-Friendly 4x4 Adventures in Chiang Mai",
    titleHe: "הרפתקאות 4x4 למשפחות בצ'יאנג מאי",
    slug: "family-friendly-4x4-adventures-chiang-mai",
    coverImage: "/images/optimized/tour_group_photo.jpg",
    excerpt:
      "Discover why Chiang Mai is the perfect destination for family off-road adventures. From elephant encounters to waterfall picnics, here's how to create unforgettable memories with kids of all ages.",
    excerptHe:
      "גלו למה צ'יאנג מאי היא היעד המושלם להרפתקאות שטח משפחתיות. ממפגשים עם פילים ועד פיקניקים ליד מפלים, הנה איך ליצור זיכרונות בלתי נשכחים עם ילדים בכל גיל.",
    category: "Adventure",
    content: `# Family-Friendly 4x4 Adventures in Chiang Mai

Traveling with kids doesn't mean compromising on adventure. In fact, some of our most memorable tours at WIRO 4x4 have been with families — from toddlers strapped into car seats to teenagers who can't stop filming everything on their phones. Chiang Mai's diverse terrain, gentle culture, and incredible wildlife make it a dream destination for family off-road adventures.

## Why Chiang Mai Is Perfect for Family 4x4 Tours

### Safety First
Northern Thailand is one of the safest regions in Southeast Asia for family travel. The locals adore children, medical facilities in Chiang Mai city are modern and affordable, and the 4x4 vehicles we use are equipped with full safety features including child seat mounts.

### Variety for Every Age
The beauty of Chiang Mai's tour offerings is that you can mix adrenaline-pumping off-road sections with gentle cultural stops, wildlife encounters, and scenic picnic breaks. No one gets bored — not the adventure-seeking teens, not the curious toddlers, and definitely not the parents.

### Manageable Distances
Unlike some destinations where you spend half the day just getting there, Chiang Mai's top attractions are within 1-2 hours of the city. That means less "are we there yet?" and more "can we stay longer?"

## Top Family-Friendly Tours

### 1. Sticky Waterfalls — The Ultimate Kids' Adventure

The [Sticky Waterfalls (Bua Tong)](/tours/maerim-sticky-waterfalls) tour is hands-down the most popular family choice, and for good reason. These unique limestone waterfalls have a naturally rough surface that allows you to literally walk UP the waterfall — no climbing gear needed.

**Why kids love it:**
- Walking up a waterfall feels like a real-life superpower
- Shallow pools at multiple levels for safe splashing
- Natural water slides between rock formations
- Butterflies and colorful insects everywhere

**Parent tips:**
- Bring water shoes for everyone (essential, not optional)
- Pack swimwear and a change of dry clothes
- The walk from the parking area is short and flat — stroller-accessible to the base
- Best time: morning visits are less crowded

**Age range:** 3+ (with parent assistance). Teens absolutely love the challenge of climbing to the top.

### 2. Doi Inthanon — Thailand's Rooftop Family Experience

The [Doi Inthanon tour](/tours/doi-inthanon-roof-of-thailand) takes you to the highest point in Thailand at 2,565 meters. The drive up is an adventure in itself, winding through cloud forest and Karen hill tribe villages.

**Family highlights:**
- **Twin Pagodas:** Beautiful hilltop temples surrounded by manicured gardens — kids love exploring the flower paths
- **Wachirathan Waterfall:** A massive, thundering cascade that never fails to impress
- **Nature Trail:** A 1.2 km boardwalk through mossy cloud forest — easy for kids, magical for everyone
- **Hill Tribe Coffee:** Stop at a local coffee plantation where kids can try hot chocolate while parents enjoy some of Thailand's best arabica

**Parent tips:**
- It's noticeably cooler at the summit (bring light jackets, especially in cool season)
- The nature trail boardwalk is wheelchair and stroller friendly
- Pack snacks for the car ride — it's about 1.5 hours from the city

**Age range:** All ages. Babies in carriers, toddlers in strollers, and kids on foot all work here.

### 3. Mae Kampong — Village Life Experience

The [Mae Kampong Hidden Village](/tours/mae-kampong-hidden-village) tour offers something different — an immersive cultural experience that teaches kids about traditional Thai mountain life.

**What families enjoy:**
- **Coffee and Tea Workshops:** Kids can help pick tea leaves and see how coffee cherries become the drink their parents can't live without
- **Treehouse Village Walk:** The village is built on a steep hillside with wooden walkways between houses — it feels like an adventure playground
- **Local School Visit:** During school days, visitors can sometimes interact with village children — a powerful cultural exchange
- **Waterfall Hike:** A gentle 20-minute walk through the forest to a beautiful waterfall with swimming pools

**Parent tips:**
- The village walkways have stairs and uneven surfaces — not suitable for strollers, but baby carriers work well
- Locals are incredibly welcoming to children
- Great opportunity to teach kids about sustainable living

**Age range:** 4+ recommended. The walking portions require some stamina but are not strenuous.

### 4. Mae Wang — Jungle and Elephants

The [Mae Wang Jungle Wilderness](/tours/mae-wang-jungle-wilderness) tour combines off-road driving with the chance to visit an ethical elephant sanctuary — often the absolute highlight for families.

**The elephant experience:**
- Feed elephants bananas and sugarcane up close
- Watch elephants bathe in the river
- Learn about elephant conservation from knowledgeable guides
- Photo opportunities that will be framed on your wall forever

**Other family activities on this route:**
- River crossings in the 4x4 (kids scream with delight every time)
- Bamboo rafting on calm river sections (seasonal)
- Jungle canopy views from hilltop viewpoints
- Local Karen village visit

**Parent tips:**
- Choose an ethical sanctuary that prioritizes elephant welfare (we only partner with approved sanctuaries)
- Elephant encounters can be muddy — dress accordingly
- Morning departures offer the best elephant activity times

**Age range:** 2+ for elephant viewing, 5+ for elephant bathing activities.

## Practical Tips for Family Off-Road Travel

### What to Pack

- **Sun protection:** High SPF sunscreen, hats, and UV shirts for kids
- **Water shoes:** Essential for waterfalls and river activities
- **Insect repellent:** Child-safe formulas (DEET-free options available locally)
- **Snacks:** Pack favorites from home plus local fresh fruits
- **Entertainment:** Download movies/games for car rides (though the scenery usually wins)
- **First aid basics:** Band-aids, antiseptic, any prescribed medications
- **Change of clothes:** At least one extra outfit per child (you'll thank us later)

### Vehicle Safety

WIRO 4x4 provides:
- Modern Toyota Hilux and Fortuner vehicles with full safety equipment
- Child car seats on request (please specify age/weight when booking)
- Experienced drivers who adjust speed and route difficulty for family groups
- First aid kits in every vehicle
- Air conditioning for comfortable travel between stops

### Scheduling Tips

- **Start early:** Morning departures (7:30-8:00 AM) beat the heat and crowds
- **Build in breaks:** We schedule regular stops for bathroom, snacks, and leg stretching
- **Half-day options:** Not sure your kids can handle a full day? We offer half-day tours that still pack in amazing experiences
- **Nap-friendly:** The gentle rocking of 4x4 travel often puts little ones to sleep — embrace it

### Kosher Family Meals

Traveling with a kosher family? We've got you covered:
- Kosher picnic lunches with kid-friendly options
- Fresh fruit packs
- We can stop at markets where you can select food for your family
- Advance coordination with Chabad Chiang Mai for special dietary needs

See our full [Kosher Food Guide](/blog/kosher-food-guide-northern-thailand) for more details.

## Age-by-Age Guide

| Age Group | Best Tours | Special Needs |
|-----------|-----------|---------------|
| 0-2 years | Doi Inthanon, Doi Suthep | Car seat, carrier, shorter routes |
| 3-5 years | Sticky Waterfalls, Mae Wang | Water shoes, snacks, nap time |
| 6-10 years | All tours! | Activity variety, photo challenges |
| 11-14 years | Mae Wang, Samoeng Loop | More adventurous routes, let them navigate |
| 15+ years | All tours (adult routes) | Challenge them! Off-road driving intro |

## What Families Say About WIRO 4x4

> "Wiro made our family trip absolutely magical. The kids still talk about climbing the Sticky Waterfalls and feeding elephants. He adjusted the whole day around our toddler's nap schedule!" — The Cohen Family, Tel Aviv

> "We were nervous about off-roading with our 4-year-old twins, but the car seats were perfectly installed and Wiro drove so carefully on the rough sections. The kids LOVED the river crossings." — Sivan & Daniel, Jerusalem

## Ready to Book Your Family Adventure?

Every WIRO 4x4 family tour is customized to your children's ages, interests, and energy levels. We'll build the perfect itinerary that keeps everyone — from toddlers to grandparents — engaged and amazed.

[Contact us on WhatsApp](https://wa.me/66929894495) with your family details, and we'll design your dream Chiang Mai adventure. Check our [Trip Cost Estimator](/estimate) to get an idea of pricing for your group.`,
    contentHe: `# הרפתקאות 4x4 למשפחות בצ'יאנג מאי

טיול עם ילדים לא אומר לוותר על הרפתקה. למעשה, חלק מהסיורים הזכורים ביותר שלנו ב-WIRO 4x4 היו עם משפחות — מפעוטות חגורים בכיסאות בטיחות ועד מתבגרים שלא מפסיקים לצלם הכל בטלפון. השטח המגוון של צ'יאנג מאי, התרבות העדינה וחיי הבר המדהימים הופכים אותה ליעד חלומי להרפתקאות שטח משפחתיות.

## למה צ'יאנג מאי מושלמת לסיורי 4x4 משפחתיים

### בטיחות בראש סדר העדיפויות
צפון תאילנד הוא אחד האזורים הבטוחים ביותר בדרום-מזרח אסיה לטיולים משפחתיים. המקומיים מעריצים ילדים, מתקני הרפואה בעיר צ'יאנג מאי מודרניים ובמחירים נוחים, ורכבי ה-4x4 שלנו מצוידים בתכונות בטיחות מלאות כולל מעמדי מושב בטיחות לילדים.

### מגוון לכל גיל
היופי בהצעות הסיורים של צ'יאנג מאי הוא שאפשר לשלב קטעי שטח מרגשים עם עצירות תרבותיות עדינות, מפגשי חיות בר והפסקות פיקניק נופיות. אף אחד לא משתעמם — לא המתבגרים חובבי ההרפתקאות, לא הפעוטות הסקרנים, ובטח לא ההורים.

### מרחקים נוחים
בניגוד ליעדים מסוימים שבהם מבלים חצי יום רק בנסיעה, האטרקציות המובילות של צ'יאנג מאי נמצאות בטווח של 1-2 שעות מהעיר. זה אומר פחות "מתי כבר נגיע?" ויותר "אפשר להישאר עוד?"

## הסיורים המובילים למשפחות

### 1. מפלי הסטיקי — ההרפתקה האולטימטיבית לילדים

הסיור ל[מפלי הסטיקי (בואה טונג)](/tours/maerim-sticky-waterfalls) הוא ללא ספק הבחירה המשפחתית הפופולרית ביותר, ומסיבה טובה. למפלי גיר ייחודיים אלה יש משטח מחוספס באופן טבעי שמאפשר לכם ממש ללכת למעלה על המפל — ללא ציוד טיפוס.

**למה ילדים אוהבים את זה:**
- הליכה למעלה על מפל מרגישה כמו כוח-על אמיתי
- בריכות רדודות בכמה רמות לשכשוך בטוח
- מגלשות מים טבעיות בין תצורות סלע
- פרפרים וחרקים צבעוניים בכל מקום

**טיפים להורים:**
- הביאו נעלי מים לכולם (חיוני, לא אופציונלי)
- ארזו בגדי ים ובגדים יבשים להחלפה
- ההליכה מהחנייה קצרה ושטוחה
- הזמן הטוב ביותר: ביקורי בוקר פחות צפופים

### 2. דוי אינתנון — חוויית הגג של תאילנד למשפחות

הסיור ל[דוי אינתנון](/tours/doi-inthanon-roof-of-thailand) לוקח אתכם לנקודה הגבוהה ביותר בתאילנד ב-2,565 מטר. הנסיעה למעלה היא הרפתקה בפני עצמה, מתפתלת דרך יער ענן וכפרי שבטי גבעות קארן.

**דגשים משפחתיים:**
- **פגודות תאומות:** מקדשים יפים בראש גבעה מוקפים בגנים מטופחים
- **מפל וואצ'יראתאן:** מפל רועם ומסיבי שתמיד מרשים
- **שביל הטבע:** שביל עץ של 1.2 ק"מ דרך יער ענן מכוסה טחב — קל לילדים, קסום לכולם
- **קפה שבטי:** עצירה במטע קפה מקומי שבו ילדים יכולים לנסות שוקו חם

### 3. מאה קמפונג — חוויית חיי הכפר

הסיור ל[כפר מאה קמפונג הנסתר](/tours/mae-kampong-hidden-village) מציע משהו אחר — חוויה תרבותית עמוקה שמלמדת ילדים על חיי ההרים המסורתיים של תאילנד.

**מה משפחות נהנות ממנו:**
- **סדנאות קפה ותה:** ילדים יכולים לעזור בקטיפת עלי תה ולראות איך דובדבני קפה הופכים למשקה
- **הליכה בכפר בתי העץ:** הכפר בנוי על מדרון תלול עם מעברי עץ בין הבתים — מרגיש כמו מגרש משחקים הרפתקני
- **טיול למפל:** הליכה עדינה של 20 דקות דרך היער למפל יפהפה עם בריכות שחייה

### 4. מאה וואנג — ג'ונגל ופילים

הסיור ל[מאה וואנג](/tours/mae-wang-jungle-wilderness) משלב נהיגת שטח עם הזדמנות לבקר במקלט פילים אתי — לעתים קרובות הנקודה המוחלטת של הטיול למשפחות.

**חוויית הפילים:**
- האכלת פילים בננות וקני סוכר מקרוב
- צפייה בפילים מתרחצים בנהר
- למידה על שימור פילים ממדריכים מומחים
- הזדמנויות צילום שימוסגרו על הקיר שלכם לנצח

## טיפים מעשיים לטיולי שטח משפחתיים

### מה לארוז
- **הגנה מהשמש:** קרם הגנה SPF גבוה, כובעים וחולצות UV לילדים
- **נעלי מים:** חיוניות למפלים ופעילויות נהר
- **דוחה יתושים:** נוסחאות בטוחות לילדים
- **חטיפים:** ארזו אהובים מהבית וגם פירות טריים מקומיים
- **בגדים להחלפה:** לפחות סט אחד נוסף לכל ילד

### בטיחות רכב
WIRO 4x4 מספק:
- רכבי טויוטה היילקס ופורצ'ונר מודרניים עם ציוד בטיחות מלא
- מושבי בטיחות לילדים על פי בקשה
- נהגים מנוסים שמתאימים מהירות ורמת קושי למשפחות
- ערכות עזרה ראשונה בכל רכב
- מיזוג אוויר לנסיעה נוחה

### ארוחות כשרות למשפחות
מטיילים עם משפחה כשרה? יש לנו פתרון:
- ארוחות צהריים כשרות בפיקניק עם אפשרויות ידידותיות לילדים
- חבילות פירות טריים
- אנחנו יכולים לעצור בשווקים בהם תוכלו לבחור אוכל למשפחה
- תיאום מראש עם חב"ד צ'יאנג מאי לצרכים תזונתיים מיוחדים

ראו את [מדריך האוכל הכשר](/blog/kosher-food-guide-northern-thailand) המלא שלנו לפרטים נוספים.

## מדריך לפי גיל

| קבוצת גיל | סיורים מומלצים | צרכים מיוחדים |
|-----------|----------------|---------------|
| 0-2 שנים | דוי אינתנון, דוי סוטפ | כיסא בטיחות, מנשא, מסלולים קצרים |
| 3-5 שנים | מפלי סטיקי, מאה וואנג | נעלי מים, חטיפים, זמן תנומה |
| 6-10 שנים | כל הסיורים! | מגוון פעילויות, אתגרי צילום |
| 11-14 שנים | מאה וואנג, לולאת סאמואנג | מסלולים הרפתקניים יותר |
| 15+ שנים | כל הסיורים (מסלולי מבוגרים) | תאתגרו אותם! היכרות עם נהיגת שטח |

## מוכנים להזמין את ההרפתקה המשפחתית שלכם?

כל סיור משפחתי של WIRO 4x4 מותאם אישית לגילאי הילדים שלכם, תחומי העניין ורמות האנרגיה. אנחנו נבנה את המסלול המושלם שישמור על כולם — מפעוטות ועד סבים וסבתות — מעורבים ומופתעים.

[צרו קשר בוואטסאפ](https://wa.me/66929894495) עם פרטי המשפחה שלכם, ואנחנו נעצב את הרפתקת צ'יאנג מאי החלומית שלכם. בדקו את [מחשבון עלויות הטיול](/estimate) שלנו כדי לקבל מושג על התמחור לקבוצה שלכם.`,
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

  console.log(`Seeding ${articles.length} blog articles (Batch 1)...`);

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
        tags:
          article.slug === "best-time-to-visit-chiang-mai-off-road-tours"
            ? "chiang mai,off-road,seasons,weather,travel planning"
            : article.slug === "kosher-food-guide-northern-thailand"
              ? "kosher,food,chabad,chiang mai,travel tips"
              : "family,kids,adventure,chiang mai,4x4",
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
  console.log("\nDone! Batch 1 blog articles seeded successfully.");
}

seed().catch(console.error);
