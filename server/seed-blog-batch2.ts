/**
 * Blog Article Seed Script — Batch 2 (3 articles)
 *
 * Run with: npx tsx server/seed-blog-batch2.ts
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { blogPosts } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const articles = [
  // ─── Article 4: Doi Inthanon National Park: Complete Guide ───
  {
    title: "Doi Inthanon National Park: Complete Guide",
    titleHe: "הפארק הלאומי דוי אינתנון: המדריך המלא",
    slug: "doi-inthanon-national-park-complete-guide",
    coverImage: "/images/optimized/doi_inthanon_royal_pagoda.jpg",
    excerpt:
      "Everything you need to know about visiting Thailand's highest peak — from the twin Royal Pagodas and stunning waterfalls to hill tribe villages, cloud forest nature trails, and the best off-road routes only accessible by 4x4.",
    excerptHe:
      "כל מה שצריך לדעת על ביקור בפסגה הגבוהה ביותר בתאילנד — מהפגודות המלכותיות התאומות ומפלים מדהימים ועד כפרי שבטי גבעות, שבילי יער ענן והמסלולים הטובים ביותר בשטח שנגישים רק ברכב 4x4.",
    category: "Destinations",
    content: `# Doi Inthanon National Park: Complete Guide

Standing at 2,565 meters above sea level, Doi Inthanon is Thailand's highest peak and one of Northern Thailand's most spectacular natural attractions. But this national park is far more than just a summit marker — it's a world of cloud forests, thundering waterfalls, ancient hill tribe villages, and off-road trails that wind through some of the most breathtaking scenery in Southeast Asia.

This complete guide covers everything you need to plan an unforgettable visit, whether you're coming for a day trip or a multi-day adventure.

## Why Doi Inthanon Is Special

Doi Inthanon sits in the Thanon Thong Chai mountain range, about 90 kilometers southwest of Chiang Mai city. What makes it unique isn't just the elevation — it's the incredible biodiversity found nowhere else in Thailand.

### A Different Climate

At the summit, temperatures can drop to near-freezing during cool season (November-February). Morning frost is common in December and January — a surreal sight in tropical Thailand. The temperature difference between Chiang Mai city and the summit can be 15-20°C, so you're essentially traveling between climate zones in under two hours.

### Biodiversity Hotspot

The park is home to over 400 bird species, making it one of Asia's premier birdwatching destinations. The cloud forests support mosses, lichens, ferns, and orchids found nowhere else in Thailand. From November to February, wild Himalayan cherry blossoms paint the mountainsides pink.

## The Must-See Attractions

### The Twin Royal Pagodas (Naphamethinidon & Naphaphonphumisiri)

Built to honor King Bhumibol and Queen Sirikit, these twin pagodas sit at 2,400 meters elevation and are arguably the most photographed spot in the park. Each pagoda is surrounded by beautifully manicured gardens with panoramic mountain views.

**What to know:**
- The gardens are stunning in any season, but peak flower bloom is November-January
- Mornings offer the best light for photography and fewer clouds
- The pagodas are wheelchair and stroller accessible via paved paths
- There's a small donation requested for garden maintenance
- A cafe at the pagoda level serves hot coffee and snacks — perfect for the cool summit air

### Wachirathan Waterfall

This is Doi Inthanon's most dramatic waterfall — a powerful 80-meter cascade that generates a constant mist spray you can feel from the viewing platform. The roar of the water is thunderous during rainy season and impressive year-round.

**Tips:**
- Bring a waterproof cover for your camera — the mist reaches the viewing area
- The path to the base is short and paved — suitable for all fitness levels
- During cool season, a rainbow often forms in the morning mist
- There's a small market near the parking area selling local hill tribe products and snacks

### Sirithan Waterfall

Smaller than Wachirathan but equally beautiful, Sirithan is a wide, photogenic cascade surrounded by lush jungle. It's less crowded than Wachirathan and feels more intimate.

### Ang Ka Nature Trail

This is one of the park's hidden gems — a 360-meter elevated boardwalk through pristine sphagnum moss cloud forest at 2,500 meters elevation. Walking through this misty, ancient forest feels like stepping into another world.

**What makes it special:**
- The trail is entirely on raised wooden boardwalk — no muddy boots required
- Moss-draped trees create an otherworldly atmosphere
- It's one of the best spots in Thailand for birdwatching (look for green-tailed sunbirds)
- The trail takes about 20-30 minutes to complete at a leisurely pace
- Best visited in early morning when mist hangs in the canopy

### Kew Mae Pan Nature Trail

For those wanting a more active hike, the Kew Mae Pan trail offers 2.5 kilometers of mountain scenery with panoramic views of the valleys below. This trail requires a local Karen guide (arranged at the trailhead) and takes about 2-3 hours.

**Highlights:**
- Sweeping views of terraced rice fields and mountain valleys
- Wild flower meadows (peak bloom: November-January)
- A chance to see rare bird species in their natural habitat
- The trail passes through primary forest, grasslands, and rocky ridgelines

**Important:** This trail closes during rainy season (June-October) for safety and conservation reasons.

## Hill Tribe Villages

Doi Inthanon is home to several Karen (Pgaz K'Nyau) and Hmong communities that have lived on these mountains for generations. Visiting these villages offers a window into traditional ways of life that have persisted for centuries.

### What to Expect

- **Coffee plantations:** Many Karen villages grow some of Thailand's finest arabica coffee at high elevation. You can tour small plantations, see the drying process, and buy beans directly from the growers
- **Traditional weaving:** Karen women are renowned weavers. You'll see handlooms producing intricate textiles using natural dyes
- **Rice terraces:** The stepped rice paddies carved into the mountainsides are engineering marvels and incredibly photogenic
- **Warm hospitality:** Hill tribe communities are welcoming to respectful visitors. A smile goes a long way

### Responsible Tourism

At WIRO 4x4, we practice and promote responsible hill tribe tourism:
- We visit communities that have invited tourism, not those that want privacy
- Our guides speak Karen and Hmong languages, enabling genuine interaction
- We purchase directly from village artisans and coffee growers
- We never treat villages as "human zoos" — these are real communities with real lives

## Getting There by 4x4 — The Best Way

While you can drive a regular car to the summit via Route 1009, a 4x4 unlocks the real magic of Doi Inthanon — the off-road trails that wind through the park's most remote and beautiful areas.

### Why Choose a 4x4 Tour

- **Access hidden waterfalls** that aren't on the main tourist route
- **Visit remote hill tribe villages** only reachable by unpaved mountain roads
- **Experience the off-road trails** that connect viewpoints through dense forest
- **River crossings and mountain passes** that make the journey an adventure
- **A local guide** who knows the park intimately and can share stories, history, and hidden spots

### The WIRO 4x4 Doi Inthanon Experience

Our [Doi Inthanon: Roof of Thailand tour](/tours/doi-inthanon-roof-of-thailand) is one of our most popular offerings. Here's what a typical day looks like:

**7:00 AM** — Pickup from your Chiang Mai hotel
**8:30 AM** — First stop at Wachirathan Waterfall
**9:30 AM** — Off-road section through forest trails to a Karen village
**10:30 AM** — Coffee tasting at a highland plantation
**11:30 AM** — Kew Mae Pan Nature Trail hike (seasonal)
**1:00 PM** — Lunch stop (kosher options available — see our [Kosher Food Guide](/blog/kosher-food-guide-northern-thailand))
**2:00 PM** — Twin Royal Pagodas and gardens
**3:00 PM** — Summit marker at Thailand's highest point
**3:30 PM** — Ang Ka Nature Trail
**4:30 PM** — Return drive with scenic stops
**6:00 PM** — Drop-off at your hotel

## Practical Information

### Park Entrance Fees
- Adults: 300 THB (foreigners) / 50 THB (Thai nationals)
- Children: 150 THB (foreigners) / 20 THB (Thai nationals)
- Vehicle entry: 30 THB

### What to Bring
- **Warm layers** — it can be 10-15°C colder at the summit than in Chiang Mai city
- **Rain jacket** — weather changes quickly at high elevation
- **Good walking shoes** — trails can be slippery, especially Kew Mae Pan
- **Camera** — you'll want it at every stop
- **Sunscreen and hat** — the UV is stronger at altitude
- **Water and snacks** — though vendors are available at major stops

### Best Time to Visit
- **November-February:** Cool, clear skies, wild cherry blossoms, possible frost at summit
- **March-May:** Warmer, some haze, fewer tourists
- **June-October:** Lush and green, waterfalls at peak flow, some trails closed, afternoon rain

For a detailed seasonal breakdown, check our [Best Time to Visit Chiang Mai](/blog/best-time-to-visit-chiang-mai-off-road-tours) guide.

## Combining Doi Inthanon with Other Tours

Many visitors combine a Doi Inthanon day with other Northern Thailand experiences:

- **Day 1:** Doi Inthanon + hill tribe villages
- **Day 2:** [Sticky Waterfalls](/tours/maerim-sticky-waterfalls) + [Mae Kampong Village](/tours/mae-kampong-hidden-village)
- **Day 3:** [Mae Wang Jungle Wilderness](/tours/mae-wang-jungle-wilderness) + elephant sanctuary

We offer multi-day packages that cover the best of Northern Thailand. Check our [Trip Cost Estimator](/estimate) to build your ideal itinerary.

## Ready to Explore Thailand's Rooftop?

Doi Inthanon is one of those rare places where every visitor — from nature lovers and birdwatchers to adventure seekers and families — finds something extraordinary. Let WIRO 4x4 show you the park beyond the tourist trail.

[Contact us on WhatsApp](https://wa.me/66929894495) to book your Doi Inthanon adventure, or browse our [full tour collection](/tours) for more Northern Thailand experiences.`,
    contentHe: `# הפארק הלאומי דוי אינתנון: המדריך המלא

בגובה 2,565 מטר מעל פני הים, דוי אינתנון היא הפסגה הגבוהה ביותר בתאילנד ואחת מאטרקציות הטבע המרהיבות ביותר בצפון תאילנד. אבל הפארק הלאומי הזה הוא הרבה יותר מסמן פסגה — הוא עולם של יערות ענן, מפלים רועמים, כפרי שבטי גבעות עתיקים ושבילי שטח שמתפתלים דרך כמה מהנופים המדהימים ביותר בדרום-מזרח אסיה.

המדריך המלא הזה מכסה כל מה שצריך כדי לתכנן ביקור בלתי נשכח, בין אם אתם מגיעים לטיול יום או להרפתקה רב-יומית.

## למה דוי אינתנון מיוחד

דוי אינתנון יושב ברכס ההרים תנון תונג צ'אי, כ-90 קילומטרים דרום-מערב לעיר צ'יאנג מאי. מה שהופך אותו לייחודי זה לא רק הגובה — זה המגוון הביולוגי המדהים שלא נמצא בשום מקום אחר בתאילנד.

### אקלים שונה

בפסגה, הטמפרטורות יכולות לרדת קרוב לאפס בעונה הקרירה (נובמבר-פברואר). כפור בוקר הוא דבר שכיח בדצמבר וינואר — מראה סוריאליסטי בתאילנד הטרופית. הפרש הטמפרטורות בין העיר צ'יאנג מאי והפסגה יכול להיות 15-20 מעלות, כך שאתם למעשה נוסעים בין אזורי אקלים בפחות משעתיים.

### נקודה חמה של מגוון ביולוגי

הפארק הוא בית ליותר מ-400 מיני ציפורים, מה שהופך אותו לאחד יעדי הצפרות המובילים באסיה. יערות הענן תומכים בטחבים, חזזיות, שרכים וסחלבים שלא נמצאים בשום מקום אחר בתאילנד. מנובמבר עד פברואר, פריחת דובדבן הימלאית פראית צובעת את מדרונות ההרים בוורוד.

## האטרקציות שחובה לראות

### הפגודות המלכותיות התאומות

נבנו לכבוד המלך בומיבול והמלכה סיריקיט, הפגודות התאומות יושבות בגובה 2,400 מטר והן ככל הנראה המקום המצולם ביותר בפארק. כל פגודה מוקפת בגנים מטופחים יפהפיים עם נופי הרים פנורמיים.

**מה צריך לדעת:**
- הגנים מדהימים בכל עונה, אבל שיא הפריחה הוא נובמבר-ינואר
- בקרים מציעים את התאורה הטובה ביותר לצילום ופחות עננים
- הפגודות נגישות לכיסאות גלגלים ועגלות דרך שבילים סלולים
- בית קפה ברמת הפגודה מגיש קפה חם וחטיפים

### מפל וואצ'יראתאן

זהו המפל הדרמטי ביותר של דוי אינתנון — מפל חזק בגובה 80 מטר שמייצר ערפל תרסיס מתמיד שאפשר להרגיש מתצפית התצפית. שאגת המים רועמת בעונת הגשמים ומרשימה כל השנה.

**טיפים:**
- הביאו כיסוי אטום למים למצלמה — הערפל מגיע לאזור התצפית
- השביל לבסיס קצר וסלול — מתאים לכל רמות הכושר
- בעונה הקרירה, קשת בענן נוצרת לעתים קרובות בערפל הבוקר

### שביל הטבע אנג קא

זהו אחד מהאוצרות החבויים של הפארק — שביל עץ מוגבה באורך 360 מטר דרך יער ענן טחב ספגנום בתולי בגובה 2,500 מטר. הליכה דרך היער הערפילי והעתיק הזה מרגישה כמו כניסה לעולם אחר.

**מה מיוחד בו:**
- השביל כולו על שביל עץ מוגבה — אין צורך במגפיים מלוכלכים
- עצים עטופי טחב יוצרים אווירה מעולם אחר
- זה אחד המקומות הטובים ביותר בתאילנד לצפרות
- השביל לוקח כ-20-30 דקות בקצב נינוח

### שביל הטבע קיו מאה פאן

למי שרוצה טיול פעיל יותר, שביל קיו מאה פאן מציע 2.5 קילומטרים של נופי הרים עם נופים פנורמיים של העמקים למטה. שביל זה דורש מדריך קארן מקומי ולוקח כ-2-3 שעות.

**דגשים:**
- נופים גורפים של מדרגות אורז ועמקי הרים
- אחוות פרחי בר (שיא הפריחה: נובמבר-ינואר)
- השביל עובר דרך יער ראשוני, אחוזי עשב ורכסים סלעיים

**חשוב:** שביל זה סגור בעונת הגשמים (יוני-אוקטובר) מסיבות בטיחות ושימור.

## כפרי שבטי גבעות

דוי אינתנון הוא ביתם של מספר קהילות קארן והמונג שחיו על ההרים האלה במשך דורות. ביקור בכפרים אלה מציע הצצה לדרכי חיים מסורתיות שנמשכות מאות שנים.

### מה לצפות

- **מטעי קפה:** כפרי קארן רבים מגדלים חלק מקפה הערביקה המשובח ביותר בתאילנד בגבהים. אפשר לסייר במטעים קטנים, לראות את תהליך הייבוש ולקנות פולים ישירות מהמגדלים
- **אריגה מסורתית:** נשות קארן הן אורגות מפורסמות. תראו נולים ידניים המייצרים טקסטיל מורכב בצבעים טבעיים
- **מדרגות אורז:** מדרגות האורז החצובות במדרונות ההרים הן פלאי הנדסה ופוטוגניות להפליא

### תיירות אחראית

ב-WIRO 4x4, אנחנו מתרגלים ומקדמים תיירות אחראית לשבטי גבעות:
- אנחנו מבקרים בקהילות שהזמינו תיירות
- המדריכים שלנו דוברים קארן והמונג, מה שמאפשר אינטראקציה אמיתית
- אנחנו קונים ישירות מאומני הכפר ומגדלי הקפה
- אנחנו אף פעם לא מתייחסים לכפרים כ"גן חיות אנושי"

## הגעה ב-4x4 — הדרך הטובה ביותר

בעוד שאפשר לנהוג ברכב רגיל לפסגה דרך כביש 1009, רכב 4x4 פותח את הקסם האמיתי של דוי אינתנון — שבילי השטח שמתפתלים דרך האזורים המרוחקים והיפים ביותר של הפארק.

### למה לבחור בסיור 4x4

- **גישה למפלים נסתרים** שלא נמצאים במסלול התיירותי הראשי
- **ביקור בכפרי שבטי גבעות מרוחקים** שנגישים רק בדרכי הרים לא סלולות
- **חוויית שבילי השטח** שמחברים תצפיות דרך יער צפוף
- **חציות נהר ומעברי הרים** שהופכים את הנסיעה להרפתקה
- **מדריך מקומי** שמכיר את הפארק לעומק ויכול לשתף סיפורים, היסטוריה ומקומות נסתרים

### חוויית WIRO 4x4 בדוי אינתנון

הסיור שלנו [דוי אינתנון: גג תאילנד](/tours/doi-inthanon-roof-of-thailand) הוא אחד ההצעות הפופולריות ביותר שלנו.

## מידע מעשי

### דמי כניסה לפארק
- מבוגרים: 300 באט (זרים) / 50 באט (תאילנדים)
- ילדים: 150 באט (זרים) / 20 באט (תאילנדים)
- כניסת רכב: 30 באט

### מה להביא
- **שכבות חמות** — יכול להיות קר ב-10-15 מעלות פחות מאשר בעיר צ'יאנג מאי
- **מעיל גשם** — מזג האוויר משתנה מהר בגובה רב
- **נעלי הליכה טובות** — שבילים יכולים להיות חלקלקים
- **מצלמה** — תרצו אותה בכל עצירה
- **קרם הגנה וכובע** — קרינת UV חזקה יותר בגובה
- **מים וחטיפים** — למרות שיש מוכרים בעצירות המרכזיות

### הזמן הטוב ביותר לביקור
- **נובמבר-פברואר:** קריר, שמיים בהירים, פריחת דובדבן, כפור אפשרי בפסגה
- **מרץ-מאי:** חם יותר, קצת אובך, פחות תיירים
- **יוני-אוקטובר:** ירוק ושופע, מפלים בשיא הזרימה, חלק מהשבילים סגורים

למידע עונתי מפורט, בדקו את המדריך שלנו [הזמן הטוב ביותר לבקר בצ'יאנג מאי](/blog/best-time-to-visit-chiang-mai-off-road-tours).

## שילוב דוי אינתנון עם סיורים אחרים

מבקרים רבים משלבים יום בדוי אינתנון עם חוויות נוספות בצפון תאילנד:

- **יום 1:** דוי אינתנון + כפרי שבטי גבעות
- **יום 2:** [מפלי הסטיקי](/tours/maerim-sticky-waterfalls) + [כפר מאה קמפונג](/tours/mae-kampong-hidden-village)
- **יום 3:** [מאה וואנג](/tours/mae-wang-jungle-wilderness) + מקלט פילים

אנחנו מציעים חבילות רב-יומיות שמכסות את המיטב של צפון תאילנד. בדקו את [מחשבון עלויות הטיול](/estimate) שלנו כדי לבנות את המסלול האידיאלי.

## מוכנים לחקור את גג תאילנד?

דוי אינתנון הוא אחד מהמקומות הנדירים שבהם כל מבקר — מחובבי טבע וצפרים ועד מחפשי הרפתקאות ומשפחות — מוצא משהו יוצא מן הכלל. תנו ל-WIRO 4x4 להראות לכם את הפארק מעבר לשביל התיירותי.

[צרו קשר בוואטסאפ](https://wa.me/66929894495) כדי להזמין את הרפתקת דוי אינתנון שלכם, או עיינו ב[אוסף הסיורים המלא](/tours) שלנו לחוויות נוספות בצפון תאילנד.`,
  },

  // ─── Article 5: What to Pack for Thailand Off-Road Tours ───
  {
    title: "What to Pack for Thailand Off-Road Tours",
    titleHe: "מה לארוז לטיולי שטח בתאילנד",
    slug: "what-to-pack-thailand-off-road-tours",
    coverImage: "/images/optimized/tourists_with_4x4.jpg",
    excerpt:
      "The ultimate packing guide for your Chiang Mai 4x4 adventure. From must-have gear and clothing layers to camera equipment and kosher snack tips — everything you need and nothing you don't.",
    excerptHe:
      "מדריך האריזה המושלם להרפתקת ה-4x4 שלכם בצ'יאנג מאי. מציוד חיוני ושכבות ביגוד ועד ציוד צילום וטיפים לחטיפים כשרים — כל מה שצריך ולא מה שלא.",
    category: "Travel Tips",
    content: `# What to Pack for Thailand Off-Road Tours

Packing for an off-road adventure in Northern Thailand is an art form. Pack too little and you'll be uncomfortable. Pack too much and you'll be lugging unnecessary weight through jungle trails. After guiding hundreds of tours through Chiang Mai's mountains, jungles, and waterfalls, we've distilled the perfect packing list for every type of traveler.

This guide covers day tours, multi-day adventures, and special considerations for families and kosher-observant travelers.

## The Essential Day Tour Pack

These items should be in your daypack for every single off-road tour, regardless of the destination or season.

### Clothing

**What to wear:**
- **Lightweight, quick-dry shirt** — cotton absorbs sweat and stays wet; synthetic or merino wool dries fast
- **Comfortable pants or shorts** — convertible pants (zip-off legs) are the Swiss Army knife of off-road clothing
- **Sturdy closed-toe shoes** — hiking shoes or trail runners with good grip. Flip-flops are for the hotel, not the trail
- **Hat with a brim** — sun protection for your face and neck. Baseball caps work; wide-brim hats are better
- **Sunglasses with a strap** — bumpy 4x4 rides will send unstrapped sunglasses flying

**What to bring in your bag:**
- **Rain jacket or poncho** — even in dry season, mountain weather can change in minutes
- **Warm layer** — a fleece or light jacket for high-elevation stops like [Doi Inthanon](/tours/doi-inthanon-roof-of-thailand) where temperatures drop significantly
- **Swimwear** — for waterfall stops like [Sticky Waterfalls](/tours/maerim-sticky-waterfalls) or natural swimming pools
- **Change of dry clothes** — you will get wet. Whether from waterfalls, river crossings, or sudden rain, a dry shirt and shorts in a plastic bag is a lifesaver
- **Water shoes** — essential for waterfall climbing and river activities. Cheap ones from Chiang Mai's Night Bazaar work perfectly

### Sun & Bug Protection

- **Sunscreen SPF 50+** — reapply every 2 hours. The tropical sun is intense, especially at altitude
- **Insect repellent** — DEET-based is most effective, but DEET-free options work for most situations. Apply to ankles, wrists, and neck
- **After-bite cream** — mosquitoes happen despite your best efforts

### Hydration & Snacks

- **Reusable water bottle (1 liter minimum)** — WIRO 4x4 provides water on all tours, but having your own bottle keeps you hydrated between stops
- **Trail snacks** — granola bars, nuts, dried fruit, or energy bars. Heat-resistant options are best (chocolate melts fast in Thailand)
- **Electrolyte packets** — for hot season tours, these prevent dehydration headaches

### Tech & Photography

- **Phone with offline maps** — download the area in Google Maps before departure. Cell service can be spotty in the mountains
- **Camera** — whatever you're comfortable carrying. Phone cameras are excellent, but if you have a DSLR/mirrorless, the scenery deserves it
- **Waterproof phone case** — a simple zip-lock bag works, but a proper case allows underwater photos at waterfalls
- **Power bank** — a full day of photos and GPS will drain your battery. Bring a 10,000+ mAh bank
- **GoPro or action camera** — perfect for mounting during 4x4 river crossings and rough trail sections

### Medical & Personal

- **Personal medications** — bring more than you think you'll need
- **Basic first aid** — band-aids, antiseptic wipes, blister pads. WIRO 4x4 carries first aid kits, but personal basics are wise
- **Motion sickness medication** — if you're prone to it, mountain roads can be winding. Take it 30 minutes before departure
- **Hand sanitizer** — for before meals and after activities
- **Tissues/wet wipes** — trail bathrooms don't always have paper
- **Microfiber towel** — compact, quick-drying, infinitely useful

## Season-Specific Additions

### Cool Season (November – February)
- **Warm fleece or down jacket** — essential for early morning Doi Inthanon visits
- **Lightweight gloves** — useful for summit visits when temperatures drop below 10°C
- **Beanie or warm hat** — mornings can be genuinely cold at altitude
- **Long pants** — preferable to shorts for warmth and bush protection

### Hot Season (March – May)
- **Extra water** — bring 2 liters instead of 1
- **Cooling towel** — wet it and wear it around your neck
- **Light-colored clothing** — dark colors absorb more heat
- **UV protection arm sleeves** — lightweight sun protection without the sunscreen reapplication

### Rainy Season (June – October)
- **Quality rain jacket** (not just a poncho) — you'll need it for extended showers
- **Waterproof dry bag** — for electronics and dry clothes. A 10-liter dry bag fits easily in your daypack
- **Gaiters or tall socks** — leech protection on jungle trails
- **Extra pair of socks** — wet feet are uncomfortable feet
- **Waterproof phone case** — non-negotiable this season

For detailed seasonal information, see our [Best Time to Visit Chiang Mai](/blog/best-time-to-visit-chiang-mai-off-road-tours) guide.

## Multi-Day Tour Packing

If you're joining a 2-3 day package or combining multiple day tours, add these to your list:

- **Small backpack (30-40 liters)** — large enough for clothing changes, compact enough for vehicle storage
- **2-3 sets of activity clothes** — quick-dry fabrics that can be hand-washed and dried overnight
- **1 set of evening clothes** — for dinner at restaurants or Chabad Shabbat meals
- **Toiletries bag** — travel sizes of shampoo, soap, toothpaste
- **Laundry bag** — to separate dirty clothes from clean ones
- **Universal travel adapter** — Thailand uses Type A, B, and C plugs (most USB chargers work fine)
- **Headlamp** — for evening walks, early morning departures, and unexpected situations

## Family Packing Additions

Traveling with kids? Add these to the family pack:

- **Child-specific sunscreen** — gentler formulas for sensitive skin
- **Snack variety** — kids get hangry faster. Pack favorites plus some adventure snacks
- **Small games or books** — for car ride downtime (though the scenery usually keeps them entertained)
- **Child car seat note** — WIRO 4x4 provides car seats on request. Specify your child's age and weight when booking
- **Extra changes of clothes** — at least 2 extra outfits per child per day
- **Favorite comfort item** — a stuffed animal or blanket for younger kids
- **Kid-safe bug repellent** — DEET-free citronella or picaridin-based options

Read our full [Family-Friendly 4x4 Adventures guide](/blog/family-friendly-4x4-adventures-chiang-mai) for more family travel tips.

## Kosher Traveler Additions

For observant travelers, add these to your pack:

- **Kosher snack bars** from home — your favorites won't be available locally
- **Instant kosher soup packets** — great for emergency meals
- **Disposable utensils** — plastic cutlery, cups, and plates for self-prepared meals
- **Kosher condiments** — small packets of ketchup, mustard, or hot sauce from home
- **Shabbat candles and matches** (if observing Shabbat during your trip)
- **Kippah and tzitzit** (if applicable)

WIRO 4x4 offers kosher meal packages on all tours — [let us know your needs](https://wa.me/66929894495) when booking. For comprehensive kosher food information, see our [Kosher Food Guide for Northern Thailand](/blog/kosher-food-guide-northern-thailand).

## What NOT to Pack

Just as important as what to bring is what to leave behind:

- **Heavy hiking boots** — trail runners are better for Thailand's terrain and climate
- **Jeans** — they're heavy, slow to dry, and uncomfortable in humidity
- **Expensive jewelry** — leave valuables at your hotel safe
- **Large luggage** — day tours have limited vehicle storage space
- **Too many "just in case" items** — Chiang Mai has excellent shopping if you forget something. 7-Eleven and local markets are everywhere

## Where to Buy Gear in Chiang Mai

Forgot something? No problem. Chiang Mai has everything you need:

- **Night Bazaar** — water shoes, hats, sunglasses, phone cases, and rain ponchos at bargain prices
- **Decathlon (Central Festival)** — quality outdoor gear at reasonable prices
- **Boots & Hearts (Nimmanhaemin)** — outdoor and adventure clothing
- **7-Eleven/FamilyMart** — sunscreen, insect repellent, snacks, water, basic medications
- **Rimping Supermarket** — imported foods, snacks, and supplies (see our [Kosher Food Guide](/blog/kosher-food-guide-northern-thailand) for kosher options)

## The Quick Checklist

Copy this for your trip:

**Always bring:**
- [ ] Quick-dry clothing + hat + sunglasses
- [ ] Sturdy shoes + water shoes
- [ ] Rain jacket
- [ ] Sunscreen + bug repellent
- [ ] Water bottle + snacks
- [ ] Phone + power bank + waterproof case
- [ ] Change of dry clothes in a plastic bag
- [ ] Personal medications + basic first aid
- [ ] Microfiber towel
- [ ] Camera

**Add for cool season:** warm layers, gloves, beanie
**Add for rainy season:** dry bag, extra socks, gaiters, quality rain jacket
**Add for families:** kid sunscreen, extra clothes, snacks, comfort item
**Add for kosher travelers:** kosher snacks, instant soups, disposable utensils

## Ready to Pack and Go?

Now that you know what to bring, all that's left is choosing your adventure. Browse our [tour collection](/tours) to find the perfect off-road experience, use the [Trip Cost Estimator](/estimate) to plan your budget, and [contact us on WhatsApp](https://wa.me/66929894495) to start planning your Chiang Mai 4x4 adventure.`,
    contentHe: `# מה לארוז לטיולי שטח בתאילנד

אריזה להרפתקת שטח בצפון תאילנד היא אמנות. ארזו מעט מדי ויהיה לכם לא נוח. ארזו יותר מדי ותסחבו משקל מיותר בשבילי ג'ונגל. אחרי הדרכת מאות סיורים בהרים, בג'ונגלים ובמפלים של צ'יאנג מאי, זיקקנו את רשימת האריזה המושלמת לכל סוג מטייל.

המדריך הזה מכסה סיורי יום, הרפתקאות רב-יומיות ושיקולים מיוחדים למשפחות ולמטיילים שומרי כשרות.

## חבילת סיור היום החיונית

פריטים אלה צריכים להיות בתיק היום שלכם לכל סיור שטח, ללא קשר ליעד או לעונה.

### ביגוד

**מה ללבוש:**
- **חולצה קלה ומתייבשת מהר** — כותנה סופגת זיעה ונשארת רטובה; סינתטי או צמר מרינו מתייבש מהר
- **מכנסיים או מכנסיים קצרים נוחים** — מכנסיים להמרה (רגליים נשלפות) הם הכלי הרב-תכליתי של ביגוד שטח
- **נעליים סגורות ויציבות** — נעלי הליכה או ריצת שטח עם אחיזה טובה. כפכפים הם למלון, לא לשביל
- **כובע עם שוליים** — הגנה מהשמש לפנים ולעורף
- **משקפי שמש עם רצועה** — נסיעות 4x4 קופצניות ישלחו משקפיים ללא רצועה לעוף

**מה להביא בתיק:**
- **מעיל גשם או פונצ'ו** — גם בעונה היבשה, מזג האוויר בהרים יכול להשתנות בדקות
- **שכבה חמה** — פליז או מעיל קל לעצירות בגובה רב כמו [דוי אינתנון](/tours/doi-inthanon-roof-of-thailand)
- **בגד ים** — לעצירות במפלים כמו [מפלי הסטיקי](/tours/maerim-sticky-waterfalls)
- **בגדים יבשים להחלפה** — תירטבו. בין אם ממפלים, חציות נהר או גשם פתאומי
- **נעלי מים** — חיוניות לטיפוס מפלים ופעילויות נהר

### הגנה מהשמש וחרקים

- **קרם הגנה SPF 50+** — מרחו מחדש כל שעתיים
- **דוחה חרקים** — מבוסס DEET הכי יעיל, אבל אפשרויות ללא DEET עובדות ברוב המצבים
- **קרם לאחר עקיצה** — יתושים קורים למרות המאמצים הטובים ביותר

### שתייה וחטיפים

- **בקבוק מים רב-פעמי (ליטר מינימום)** — WIRO 4x4 מספק מים בכל הסיורים, אבל בקבוק משלכם שומר על לחות בין עצירות
- **חטיפי שביל** — חטיפי גרנולה, אגוזים, פירות מיובשים או חטיפי אנרגיה
- **שקיות אלקטרוליטים** — לסיורים בעונה החמה, אלה מונעים כאבי ראש מהתייבשות

### טכנולוגיה וצילום

- **טלפון עם מפות לא מקוונות** — הורידו את האזור בגוגל מפות לפני היציאה
- **מצלמה** — מה שנוח לכם לשאת. מצלמות טלפון מצוינות, אבל אם יש לכם DSLR, הנוף ראוי לזה
- **כיסוי אטום לטלפון** — שקית ז'יפלוק פשוטה עובדת, אבל כיסוי מתאים מאפשר צילום תת-מימי
- **סוללה ניידת** — יום שלם של צילומים ו-GPS ירוקן את הסוללה. הביאו 10,000+ mAh
- **GoPro או מצלמת אקשן** — מושלמת להרכבה בזמן חציות נהר ב-4x4

### רפואה ואישי

- **תרופות אישיות** — הביאו יותר ממה שאתם חושבים שתצטרכו
- **עזרה ראשונה בסיסית** — פלסטרים, מגבונים אנטיספטיים, רפידות שלפוחיות
- **תרופה נגד מחלת תנועה** — אם אתם נוטים לזה, דרכי ההרים מתפתלות
- **ג'ל אלכוהול** — לפני ארוחות ואחרי פעילויות
- **טישו/מגבונים לחים** — שירותי שביל לא תמיד מצוידים בנייר
- **מגבת מיקרופייבר** — קומפקטית, מתייבשת מהר, שימושית בלי סוף

## תוספות לפי עונה

### העונה הקרירה (נובמבר – פברואר)
- **פליז חם או מעיל פוך** — חיוני לביקורי בוקר מוקדמים בדוי אינתנון
- **כפפות קלות** — שימושיות לביקורי פסגה כשהטמפרטורה יורדת מתחת ל-10 מעלות
- **כובע צמר** — בקרים יכולים להיות באמת קרים בגובה

### העונה החמה (מרץ – מאי)
- **מים נוספים** — הביאו 2 ליטר במקום 1
- **מגבת קירור** — הרטיבו אותה ועטפו סביב הצוואר
- **ביגוד בצבע בהיר** — צבעים כהים סופגים יותר חום

### עונת הגשמים (יוני – אוקטובר)
- **מעיל גשם איכותי** (לא רק פונצ'ו) — תצטרכו אותו למקלחות ממושכות
- **תיק יבש אטום למים** — לאלקטרוניקה ובגדים יבשים
- **גרביים גבוהות** — הגנה מעלוקות בשבילי ג'ונגל
- **זוג גרביים נוסף** — רגליים רטובות הן רגליים לא נוחות

למידע עונתי מפורט, ראו את המדריך שלנו [הזמן הטוב ביותר לבקר בצ'יאנג מאי](/blog/best-time-to-visit-chiang-mai-off-road-tours).

## אריזה לסיורים רב-יומיים

אם אתם מצטרפים לחבילה של 2-3 ימים, הוסיפו:

- **תרמיל קטן (30-40 ליטר)**
- **2-3 סטים של בגדי פעילות** — בדים מתייבשים מהר שניתן לכביסת יד
- **סט אחד של בגדי ערב** — לארוחות ערב במסעדות או ארוחות שבת בחב"ד
- **תיק טואלטיקה** — גדלי נסיעה של שמפו, סבון, משחת שיניים
- **פנס ראש** — להליכות ערב, יציאות בוקר מוקדמות

## תוספות למשפחות

מטיילים עם ילדים? הוסיפו:

- **קרם הגנה ספציפי לילדים**
- **מגוון חטיפים** — ילדים מתרעבים מהר יותר
- **משחקים קטנים או ספרים** — לזמני מנוחה בנסיעה
- **בגדים להחלפה נוספים** — לפחות 2 סטים נוספים לכל ילד ליום
- **פריט נוחות אהוב** — בובת חיבוק או שמיכה לילדים קטנים
- **דוחה חרקים בטוח לילדים**

קראו את המדריך המלא שלנו [הרפתקאות 4x4 למשפחות](/blog/family-friendly-4x4-adventures-chiang-mai).

## תוספות למטיילים כשרים

למטיילים שומרי מצוות, הוסיפו:

- **חטיפים כשרים** מהבית — האהובים שלכם לא יהיו זמינים מקומית
- **שקיות מרק כשר מהיר** — מעולה לארוחות חירום
- **סכום חד-פעמי** — סכין, מזלגות, כוסות וצלחות פלסטיק
- **תבלינים כשרים** — שקיות קטנות של קטשופ, חרדל או רוטב חריף מהבית
- **נרות שבת וגפרורים** (אם שומרים שבת במהלך הטיול)

WIRO 4x4 מציע חבילות ארוחות כשרות בכל הסיורים — [ספרו לנו על הצרכים שלכם](https://wa.me/66929894495) בעת ההזמנה. למידע מקיף על אוכל כשר, ראו את [מדריך האוכל הכשר לצפון תאילנד](/blog/kosher-food-guide-northern-thailand).

## מה לא לארוז

חשוב לא פחות ממה להביא הוא מה להשאיר מאחור:

- **מגפי הליכה כבדים** — נעלי ריצת שטח טובות יותר לשטח ולאקלים של תאילנד
- **ג'ינס** — כבד, מתייבש לאט, ולא נוח בלחות
- **תכשיטים יקרים** — השאירו חפצי ערך בכספת המלון
- **מזוודות גדולות** — לסיורי יום יש מקום אחסון מוגבל ברכב

## איפה לקנות ציוד בצ'יאנג מאי

שכחתם משהו? אין בעיה. לצ'יאנג מאי יש הכל:

- **בזאר הלילה** — נעלי מים, כובעים, משקפי שמש, כיסויי טלפון ופונצ'ו גשם במחירי מציאה
- **דקתלון (סנטרל פסטיבל)** — ציוד חוץ איכותי במחירים סבירים
- **7-Eleven** — קרם הגנה, דוחה חרקים, חטיפים, מים, תרופות בסיסיות

## רשימת בדיקה מהירה

**תמיד הביאו:**
- [ ] ביגוד מתייבש מהר + כובע + משקפי שמש
- [ ] נעליים יציבות + נעלי מים
- [ ] מעיל גשם
- [ ] קרם הגנה + דוחה חרקים
- [ ] בקבוק מים + חטיפים
- [ ] טלפון + סוללה ניידת + כיסוי אטום
- [ ] בגדים יבשים להחלפה בשקית ניילון
- [ ] תרופות אישיות + עזרה ראשונה בסיסית
- [ ] מגבת מיקרופייבר
- [ ] מצלמה

## מוכנים לארוז ולצאת?

עכשיו שאתם יודעים מה להביא, כל מה שנשאר הוא לבחור את ההרפתקה. עיינו ב[אוסף הסיורים](/tours) שלנו, השתמשו ב[מחשבון עלויות הטיול](/estimate) לתכנון התקציב, ו[צרו קשר בוואטסאפ](https://wa.me/66929894495) כדי להתחיל לתכנן את הרפתקת ה-4x4 שלכם בצ'יאנג מאי.`,
  },

  // ─── Article 6: Mae Kampong Village: Hidden Gem of Northern Thailand ───
  {
    title: "Mae Kampong Village: Hidden Gem of Northern Thailand",
    titleHe: "כפר מאה קמפונג: האוצר הנסתר של צפון תאילנד",
    slug: "mae-kampong-village-hidden-gem-northern-thailand",
    coverImage: "/images/optimized/mae-kampong-village.jpg",
    excerpt:
      "Nestled in the misty mountains east of Chiang Mai, Mae Kampong is a 100-year-old village where time moves slower, coffee grows wild, and genuine Thai mountain culture comes alive. Here's why it should be on every traveler's list.",
    excerptHe:
      "מקונן בהרים הערפיליים מזרחית לצ'יאנג מאי, מאה קמפונג הוא כפר בן 100 שנה שבו הזמן נע לאט יותר, קפה גדל בר ותרבות ההרים התאילנדית האמיתית מתעוררת לחיים. הנה למה הוא חייב להיות ברשימה של כל מטייל.",
    category: "Destinations",
    content: `# Mae Kampong Village: Hidden Gem of Northern Thailand

About 50 kilometers east of Chiang Mai, tucked into a steep mountain valley at 1,300 meters elevation, sits Mae Kampong — a village that feels like it belongs in a different century. With wooden houses built on stilts along a rushing stream, terraced tea and coffee gardens climbing the hillsides, and a community that has preserved its traditional way of life for over a century, Mae Kampong offers something increasingly rare in Southeast Asia: an authentic, unhurried cultural experience.

This isn't a tourist village built for visitors. It's a real, living community of about 130 families who have opened their doors to share their traditions with the world.

## The Story of Mae Kampong

### A Century of Tradition

Mae Kampong was founded over 100 years ago by settlers from the lowlands who came to harvest the wild tea leaves (miang) that grew abundantly in the mountain forests. "Miang" — fermented tea leaves chewed as a mild stimulant — was a major trade commodity in Northern Thailand, and the forests around Mae Kampong were rich with it.

For decades, miang production was the village's livelihood. But as the chewing tradition declined in modern Thailand, the village had to reinvent itself. Rather than abandoning their mountain home, the villagers turned to coffee cultivation, eco-tourism, and sustainable agriculture — becoming one of Thailand's most successful community-based tourism models.

### The Community Today

Today, Mae Kampong is a thriving model of sustainable rural development:
- **Population:** About 400 people in 130 households
- **Primary income:** Coffee and tea cultivation, tourism, fermented tea production
- **Awards:** Multiple national awards for community-based tourism
- **Governance:** The village manages tourism collectively through a community committee
- **Education:** The village school serves children from surrounding mountain communities

## What to See and Do

### 1. Walk the Village Trail

The main activity in Mae Kampong is simply walking through the village itself. The houses are built along a steep hillside, connected by wooden walkways, stone steps, and narrow paths that wind between traditional Lanna-style wooden homes.

**What you'll encounter:**
- **Traditional Lanna architecture** — raised wooden houses with teak framing and corrugated roofs, some over 80 years old
- **The village stream** — a clear mountain brook runs through the center of the village, powering small hydro generators and providing a constant natural soundtrack
- **Home workshops** — many families operate small cottage industries visible from the walkways: weaving, fermented tea processing, coffee roasting
- **Village cats and dogs** — friendly and well-fed, they're part of the community character
- **Community herb gardens** — medicinal plants and cooking herbs grow on terraces between houses

The complete village walk takes about 45-60 minutes at a leisurely pace. There's no rush — stop to chat with villagers (our guides translate), peek into workshops, and soak in the atmosphere.

### 2. Coffee and Tea Experiences

Mae Kampong sits in prime coffee-growing territory. The elevation (1,300m), cool temperatures, and rich soil produce excellent arabica beans.

**Coffee tour highlights:**
- Visit a small family-run coffee plantation on the hillside above the village
- See coffee cherries on the tree (harvest season: November-February)
- Watch the full process: picking, pulping, drying, roasting
- Taste freshly roasted coffee prepared in traditional and modern styles
- Buy beans directly from the grower — some of the freshest, most ethical coffee you'll ever drink

**Miang (fermented tea) experience:**
- Learn about the ancient tradition of fermenting wild tea leaves
- Watch the labor-intensive preparation process
- Try miang if you're adventurous — it's an acquired taste with a slightly bitter, earthy flavor
- Understand how this single product sustained mountain communities for centuries

### 3. The Waterfall Hike

A gentle 20-minute trail leads from the village to a beautiful multi-tiered waterfall hidden in the forest. The hike follows the village stream through bamboo groves and tropical forest.

**What to expect:**
- The trail is well-maintained but has some uneven surfaces — good shoes are recommended
- The waterfall has natural pools perfect for a refreshing dip (bring swimwear)
- During rainy season (June-October), the waterfall is at its most impressive
- The forest trail is shaded, making it pleasant even in hot season
- Look for butterflies, birds, and occasional glimpses of small wildlife

### 4. Giant Tree (Ton Yang)

Just outside the village, a massive 500-year-old yang tree (dipterocarp) towers over the forest. It's an awe-inspiring sight that puts human timescales into perspective. The tree is considered sacred by the community, and a small shrine sits at its base.

### 5. Treehouse and Homestay Experiences

Mae Kampong is famous for its treehouse accommodations — simple but charming rooms built among the trees on the hillside above the village. Spending a night here is a magical experience.

**What a homestay includes:**
- **Accommodation** in a village home or treehouse (basic but clean and comfortable)
- **Home-cooked meals** prepared by your host family using local ingredients
- **Morning alms giving** — wake up early to watch or participate in the daily Buddhist alms ceremony
- **Evening atmosphere** — the sounds of the forest, the stream, and absolute darkness (minimal light pollution)
- **Cultural immersion** — breakfast with your host family, hearing their stories and learning about mountain life

**Note for kosher travelers:** Homestay meals are prepared in non-kosher kitchens. We recommend bringing your own kosher food for overnight stays, or we can arrange packed kosher meals from Chiang Mai. See our [Kosher Food Guide](/blog/kosher-food-guide-northern-thailand) for more tips.

### 6. Seasonal Highlights

**November-January:** Coffee harvest season. The hillsides are dotted with red coffee cherries, and the air smells of roasting beans. Wild Himalayan cherry blossoms add pink accents to the green mountainside.

**February-April:** The Loy Krathong festival (November) and Songkran (April) are celebrated with local traditions unique to mountain communities.

**June-September:** The mountains are at their greenest. Morning mists fill the valley, and the waterfall is thunderous. Fewer tourists mean a more intimate village experience.

## Getting There by 4x4

Mae Kampong is about 50 km from Chiang Mai, but the last 10 km wind up a steep mountain road through dense forest. While the road is paved, a 4x4 makes the journey far more comfortable and opens up additional off-road detours.

### The WIRO 4x4 Mae Kampong Experience

Our [Mae Kampong Hidden Village tour](/tours/mae-kampong-hidden-village) is designed to give you the deepest possible experience of this remarkable community.

**What makes our tour special:**
- **Local connections:** Wiro has personal relationships with village families built over years of visits. This means access to homes, workshops, and conversations that independent visitors don't get
- **Off-road approach:** We take a scenic back route through the mountains, passing viewpoints and smaller villages that most visitors never see
- **Unhurried pace:** We spend enough time in the village for you to genuinely absorb the atmosphere — not just snap photos and leave
- **Combined itineraries:** We can combine Mae Kampong with other nearby experiences, such as the [Doi Suthep temple visit](/tours/doi-suthep-pui-beyond-temple) or [Sticky Waterfalls](/tours/maerim-sticky-waterfalls) for a full day

### Combining with Other Destinations

Mae Kampong pairs beautifully with other Northern Thailand experiences:

- **Mae Kampong + Doi Suthep:** Mountain village in the morning, temple in the afternoon
- **Mae Kampong + Sticky Waterfalls:** Cultural immersion followed by waterfall adventure
- **Mae Kampong + Doi Inthanon:** Two days exploring mountain communities and Thailand's highest peak (see our [Doi Inthanon guide](/blog/doi-inthanon-national-park-complete-guide))

## Practical Tips

### What to Bring
- **Good walking shoes** — the village has stairs and uneven surfaces
- **Warm layer** — at 1,300m, mornings can be cool even in hot season
- **Cash** — for buying coffee, crafts, and snacks from village vendors (no card payments)
- **Camera** — the village is incredibly photogenic
- **Respectful clothing** — shoulders and knees covered when visiting the temple
- **Water bottle** — though coffee and tea are abundant

For a complete packing guide, see [What to Pack for Thailand Off-Road Tours](/blog/what-to-pack-thailand-off-road-tours).

### Etiquette
- **Ask before photographing** people, especially elders and in workshops
- **Remove shoes** before entering homes and the temple
- **Buy local** — purchasing coffee, tea, and crafts directly supports the community
- **Speak softly** — the village values its peaceful atmosphere
- **Don't litter** — the community takes environmental stewardship seriously

### Best Time to Visit
- **All year round** — Mae Kampong is beautiful in every season
- **November-February** for the most comfortable temperatures and coffee harvest
- **Weekdays** for fewer visitors and a more authentic atmosphere

## Why Mae Kampong Matters

In a world of mass tourism and Instagram-driven travel, Mae Kampong represents something precious: a community that has found a way to share its culture with visitors while preserving its identity and traditions. The village proves that tourism can be a force for cultural preservation rather than cultural erosion.

When you visit Mae Kampong with WIRO 4x4, you're not just seeing a pretty village — you're participating in a model of sustainable tourism that benefits the people who live there.

## Ready to Discover Mae Kampong?

Whether you come for the coffee, the culture, the waterfall, or simply the peace of a mountain village that feels a world away from the city, Mae Kampong will leave a lasting impression.

[Contact us on WhatsApp](https://wa.me/66929894495) to include Mae Kampong in your Chiang Mai adventure, or explore all our [Northern Thailand tours](/tours) to build the perfect itinerary. Use our [Trip Cost Estimator](/estimate) to plan your budget.`,
    contentHe: `# כפר מאה קמפונג: האוצר הנסתר של צפון תאילנד

כ-50 קילומטר מזרחית לצ'יאנג מאי, מקונן בעמק הררי תלול בגובה 1,300 מטר, יושב מאה קמפונג — כפר שמרגיש כאילו הוא שייך למאה אחרת. עם בתי עץ בנויים על כלונסאות לאורך נחל גועש, גני תה וקפה מדורגים המטפסים על מדרונות הגבעות, וקהילה ששמרה על אורח חייה המסורתי למעלה ממאה שנה, מאה קמפונג מציע משהו שנעשה נדיר יותר ויותר בדרום-מזרח אסיה: חוויה תרבותית אותנטית ולא ממוהרת.

זה לא כפר תיירותי שנבנה למבקרים. זו קהילה חיה ואמיתית של כ-130 משפחות שפתחו את דלתותיהן לחלוק את מסורותיהן עם העולם.

## הסיפור של מאה קמפונג

### מאה שנות מסורת

מאה קמפונג נוסד לפני למעלה מ-100 שנה על ידי מתיישבים מהשפלה שבאו לקטוף את עלי התה הפראיים (מיאנג) שגדלו בשפע ביערות ההרים. "מיאנג" — עלי תה מותססים שנלעסו כממריץ קל — היה מוצר סחר מרכזי בצפון תאילנד, והיערות סביב מאה קמפונג היו עשירים בו.

במשך עשורים, ייצור מיאנג היה מקור הפרנסה של הכפר. אבל כשמסורת הלעיסה ירדה בתאילנד המודרנית, הכפר היה צריך להמציא את עצמו מחדש. במקום לנטוש את ביתם ההררי, הכפריים פנו לגידול קפה, תיירות אקולוגית וחקלאות בת-קיימא — והפכו לאחד ממודלי התיירות הקהילתית המוצלחים ביותר בתאילנד.

### הקהילה היום

היום, מאה קמפונג הוא מודל משגשג של פיתוח כפרי בר-קיימא:
- **אוכלוסייה:** כ-400 אנשים ב-130 משקי בית
- **הכנסה עיקרית:** גידול קפה ותה, תיירות, ייצור תה מותסס
- **פרסים:** מספר פרסים לאומיים לתיירות קהילתית
- **ניהול:** הכפר מנהל את התיירות באופן קולקטיבי דרך ועד קהילתי

## מה לראות ולעשות

### 1. הליכה בשביל הכפר

הפעילות העיקרית במאה קמפונג היא פשוט ללכת דרך הכפר עצמו. הבתים בנויים לאורך מדרון תלול, מחוברים במעברי עץ, מדרגות אבן ושבילים צרים שמתפתלים בין בתי עץ בסגנון לאנה מסורתי.

**מה תפגשו:**
- **ארכיטקטורה מסורתית של לאנה** — בתי עץ מוגבהים עם מסגור טיק וגגות פח, חלקם בני 80+ שנה
- **נחל הכפר** — פלג הרים צלול זורם דרך מרכז הכפר ומספק פסקול טבעי מתמיד
- **סדנאות בית** — משפחות רבות מפעילות תעשיות ביתיות קטנות: אריגה, עיבוד תה מותסס, קליית קפה
- **גני צמחי מרפא קהילתיים** — צמחי מרפא ותבלינים גדלים על מרפסות בין הבתים

ההליכה המלאה בכפר לוקחת כ-45-60 דקות בקצב נינוח. אין לחץ — עצרו לשוחח עם הכפריים (המדריכים שלנו מתרגמים), הציצו לסדנאות, וספגו את האווירה.

### 2. חוויות קפה ותה

מאה קמפונג יושב בטריטוריה מעולה לגידול קפה. הגובה (1,300 מ'), הטמפרטורות הקרירות והאדמה העשירה מייצרים פולי ערביקה מעולים.

**דגשי סיור הקפה:**
- בקרו במטע קפה קטן מנוהל על ידי משפחה על מדרון הגבעה מעל הכפר
- ראו דובדבני קפה על העץ (עונת קטיף: נובמבר-פברואר)
- צפו בתהליך המלא: קטיפה, מיצוי, ייבוש, קלייה
- טעמו קפה קלוי טרי שהוכן בסגנונות מסורתיים ומודרניים
- קנו פולים ישירות מהמגדל — חלק מהקפה הטרי והאתי ביותר שתשתו אי פעם

**חוויית מיאנג (תה מותסס):**
- למדו על המסורת העתיקה של הסנת עלי תה פראיים
- צפו בתהליך ההכנה העמלני
- נסו מיאנג אם אתם הרפתקנים — טעם נרכש עם גוון מעט מר וארצי

### 3. טיול למפל

שביל עדין בן 20 דקות מוביל מהכפר למפל רב-שכבתי יפהפה שמוסתר ביער. הטיול עוקב אחר נחל הכפר דרך חורשות במבוק ויער טרופי.

**מה לצפות:**
- השביל מתוחזק היטב אבל יש משטחים לא אחידים — נעליים טובות מומלצות
- למפל יש בריכות טבעיות מושלמות לטבילה מרעננת (הביאו בגד ים)
- בעונת הגשמים (יוני-אוקטובר), המפל במיטבו
- שביל היער מוצל, מה שהופך אותו נעים גם בעונה החמה

### 4. העץ הענק (טון יאנג)

ממש מחוץ לכפר, עץ יאנג (דיפטרוקרפ) ענק בן 500 שנה מתנשא מעל היער. זה מראה מעורר יראה שמשים את הזמן האנושי בפרספקטיבה. העץ נחשב קדוש על ידי הקהילה, ומקדש קטן יושב בבסיסו.

### 5. חוויות בית עץ ואירוח ביתי

מאה קמפונג מפורסם בלינות בבתי העץ שלו — חדרים פשוטים אך מקסימים שנבנו בין העצים על מדרון הגבעה.

**מה כולל אירוח ביתי:**
- **לינה** בבית כפרי או בית עץ (בסיסי אבל נקי ונוח)
- **ארוחות ביתיות** שמוכנות על ידי המשפחה המארחת ממרכיבים מקומיים
- **נתינת צדקה בוקרית** — התעוררו מוקדם לצפות או להשתתף בטקס הנתינה הבודהיסטי היומי
- **אווירת ערב** — צלילי היער, הנחל, וחושך מוחלט

**הערה למטיילים כשרים:** ארוחות אירוח ביתי מוכנות במטבחים לא כשרים. אנו ממליצים להביא אוכל כשר משלכם ללינות, או שנוכל לארגן ארוחות כשרות ארוזות מצ'יאנג מאי. ראו את [מדריך האוכל הכשר](/blog/kosher-food-guide-northern-thailand) שלנו.

### 6. דגשים עונתיים

**נובמבר-ינואר:** עונת קטיף הקפה. המדרונות מנוקדים בדובדבני קפה אדומים, והאוויר ריחני מקלייה. פריחת דובדבן הימלאית מוסיפה גוונים ורודים.

**יוני-ספטמבר:** ההרים בשיא הירוק שלהם. ערפלי בוקר ממלאים את העמק, והמפל רועם. פחות תיירים מאפשרים חוויה כפרית אינטימית יותר.

## הגעה ב-4x4

מאה קמפונג נמצא כ-50 ק"מ מצ'יאנג מאי, אבל 10 הק"מ האחרונים מתפתלים על דרך הרים תלולה דרך יער צפוף. בעוד שהדרך סלולה, רכב 4x4 הופך את הנסיעה להרבה יותר נוחה ופותח מעקפים נוספים בשטח.

### חוויית WIRO 4x4 במאה קמפונג

הסיור שלנו [כפר מאה קמפונג הנסתר](/tours/mae-kampong-hidden-village) תוכנן לתת לכם את החוויה העמוקה ביותר של הקהילה המדהימה הזו.

**מה הופך את הסיור שלנו למיוחד:**
- **קשרים מקומיים:** לווירו יש קשרים אישיים עם משפחות הכפר שנבנו במשך שנות ביקורים. זה אומר גישה לבתים, סדנאות ושיחות שמבקרים עצמאיים לא מקבלים
- **גישה בשטח:** אנחנו לוקחים מסלול נופי אחורי דרך ההרים, עוברים תצפיות וכפרים קטנים שרוב המבקרים אף פעם לא רואים
- **קצב רגוע:** אנחנו מבלים מספיק זמן בכפר כדי שתספגו באמת את האווירה
- **מסלולים משולבים:** אנחנו יכולים לשלב מאה קמפונג עם חוויות סמוכות, כמו [ביקור במקדש דוי סוטפ](/tours/doi-suthep-pui-beyond-temple) או [מפלי הסטיקי](/tours/maerim-sticky-waterfalls)

### שילוב עם יעדים אחרים

מאה קמפונג משתלב יפה עם חוויות אחרות בצפון תאילנד:

- **מאה קמפונג + דוי סוטפ:** כפר הררי בבוקר, מקדש אחר הצהריים
- **מאה קמפונג + מפלי הסטיקי:** טבילה תרבותית ואחריה הרפתקת מפלים
- **מאה קמפונג + דוי אינתנון:** יומיים של חקירת קהילות הרים והפסגה הגבוהה ביותר בתאילנד (ראו את [מדריך דוי אינתנון](/blog/doi-inthanon-national-park-complete-guide) שלנו)

## טיפים מעשיים

### מה להביא
- **נעלי הליכה טובות** — לכפר יש מדרגות ומשטחים לא אחידים
- **שכבה חמה** — ב-1,300 מ', בקרים יכולים להיות קרירים גם בעונה החמה
- **מזומנים** — לקניית קפה, מלאכת יד וחטיפים ממוכרי הכפר (אין תשלום בכרטיס)
- **מצלמה** — הכפר פוטוגני להפליא
- **ביגוד מכובד** — כיסוי כתפיים וברכיים בעת ביקור במקדש
- **בקבוק מים** — למרות שקפה ותה בשפע

למדריך אריזה מלא, ראו [מה לארוז לטיולי שטח בתאילנד](/blog/what-to-pack-thailand-off-road-tours).

### נימוסים
- **שאלו לפני צילום** אנשים, במיוחד זקנים ובסדנאות
- **הורידו נעליים** לפני כניסה לבתים ולמקדש
- **קנו מקומי** — רכישת קפה, תה ומלאכת יד תומכת ישירות בקהילה
- **דברו בשקט** — הכפר מעריך את האווירה השלווה שלו
- **אל תלכלכו** — הקהילה מתייחסת ברצינות לשמירה על הסביבה

### הזמן הטוב ביותר לביקור
- **כל השנה** — מאה קמפונג יפה בכל עונה
- **נובמבר-פברואר** לטמפרטורות הנוחות ביותר ועונת קטיף הקפה
- **ימי חול** לפחות מבקרים ואווירה אותנטית יותר

## למה מאה קמפונג חשוב

בעולם של תיירות המונית ונסיעות מונעות אינסטגרם, מאה קמפונג מייצג משהו יקר ערך: קהילה שמצאה דרך לחלוק את תרבותה עם מבקרים תוך שימור זהותה ומסורותיה. הכפר מוכיח שתיירות יכולה להיות כוח לשימור תרבותי ולא לשחיקה תרבותית.

כשאתם מבקרים במאה קמפונג עם WIRO 4x4, אתם לא רק רואים כפר יפה — אתם משתתפים במודל של תיירות בת-קיימא שמועיל לאנשים שחיים שם.

## מוכנים לגלות את מאה קמפונג?

בין אם אתם מגיעים בשביל הקפה, התרבות, המפל, או פשוט השלווה של כפר הררי שמרגיש עולם רחוק מהעיר, מאה קמפונג ישאיר רושם מתמשך.

[צרו קשר בוואטסאפ](https://wa.me/66929894495) כדי לכלול את מאה קמפונג בהרפתקת צ'יאנג מאי שלכם, או חקרו את כל [סיורי צפון תאילנד](/tours) שלנו כדי לבנות את המסלול המושלם. השתמשו ב[מחשבון עלויות הטיול](/estimate) שלנו לתכנון התקציב.`,
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

  console.log(`Seeding ${articles.length} blog articles (Batch 2)...`);

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
          article.slug === "doi-inthanon-national-park-complete-guide"
            ? "doi inthanon,national park,chiang mai,waterfalls,hill tribes,nature"
            : article.slug === "what-to-pack-thailand-off-road-tours"
              ? "packing,gear,travel tips,off-road,chiang mai,essentials"
              : "mae kampong,village,coffee,culture,community tourism,hidden gem",
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
  console.log("\nDone! Batch 2 blog articles seeded successfully.");
}

seed().catch(console.error);
