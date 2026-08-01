/**
 * Hardcoded fallback blog posts used when no DB post matches the slug.
 * Each post has English and Hebrew content selected by the translation function.
 */
import { getAdditionalHardcodedPosts } from "./additionalHardcodedPosts";

type TranslationFn = (en: string, he: string) => string;

export interface HardcodedPost {
  title: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}

export function getHardcodedPosts(
  t: TranslationFn
): Record<string, HardcodedPost> {
  return {
    "kosher-dining-guide": {
      title: t(
        "Kosher Dining Guide for Northern Thailand",
        "איך שומרים כשרות בצפון תאילנד -- המדריך המלא"
      ),
      date: t("December 7, 2024", "7 דצמבר 2024"),
      readTime: t("8 min read", "8 דקות קריאה"),
      image: "/images/optimized/village_hamlet_rice_fields.jpg",
      content: t(
        `# Finding Kosher Food in Chiang Mai

Traveling to Northern Thailand while maintaining kashrut doesn't have to be challenging. Here's your comprehensive guide to kosher dining options in Chiang Mai and surrounding areas.

## Chabad House Chiang Mai

The Chabad House is your primary resource for kosher meals in Chiang Mai. Located in the heart of the city, they offer:

- **Shabbat Meals**: Weekly Shabbat dinners with the community
- **Holiday Services**: Special meals during Jewish holidays
- **Meal Packages**: Pre-ordered kosher meals for tours and excursions
- **Grocery Items**: Limited selection of kosher packaged foods

**Important**: Always call ahead to confirm availability and make reservations.

## WIRO 4x4 Kosher Meal Service

All our tours include kosher meal options:

- **Packed Lunches**: Fresh salads, fruits, nuts, and kosher-certified snacks
- **Restaurant Coordination**: We work with select restaurants that can prepare kosher-style meals under supervision
- **Vegetarian Options**: Strictly vegetarian meals prepared with kosher guidelines
- **Special Requests**: Notify us of any dietary restrictions or preferences

## Self-Catering Options

### Supermarkets with Kosher-Friendly Items

1. **Rimping Supermarket**: Large selection of fruits, vegetables, and packaged goods
2. **Tops Market**: International section with some kosher-certified products
3. **Makro**: Bulk items and fresh produce

### What to Look For

- Fresh fruits and vegetables (always kosher)
- Packaged items with kosher certification symbols
- Plain rice, quinoa, and grains
- Canned vegetables and legumes (check ingredients)
- Nuts and dried fruits (unsalted, unflavored)

## Dining Out: Vegetarian Restaurants

While not kosher-certified, these vegetarian restaurants offer meals that align with kosher dietary laws:

1. **Pun Pun Organic Restaurant**: Organic vegetarian Thai cuisine
2. **Goodsouls Kitchen**: Healthy vegetarian and vegan options
3. **Anchan Vegetarian Restaurant**: Traditional Thai vegetarian dishes

**Note**: Always inform staff about your dietary requirements and ask about ingredients.

## Travel Tips

### Before Your Trip

- Contact Chabad House Chiang Mai in advance
- Pack kosher snacks from home (energy bars, nuts, dried fruit)
- Bring disposable utensils and plates
- Download kosher certification apps

### During Your Tour

- Communicate dietary needs clearly to your guide
- Carry emergency kosher snacks
- Stay hydrated with bottled water
- Be flexible and patient

## Emergency Contacts

- **Chabad Chiang Mai**: [Contact via WhatsApp]
- **WIRO 4x4 Kosher Coordinator**: +66 81 640 1397
- **Bangkok Kosher Restaurants**: For longer trips

## Conclusion

With proper planning and the right resources, maintaining kashrut in Northern Thailand is entirely manageable. WIRO 4x4 is committed to ensuring all our guests can enjoy their adventure while observing their dietary requirements.

**Questions?** Contact us on WhatsApp for personalized kosher meal planning for your tour.`,
        `# איך שומרים על כשרות בצ'יאנג מאי -- המדריך המלא

טסים לצפון תאילנד ורוצים לשמור כשרות? אל תילחצו. עם קצת תכנון מראש, אפשר לאכול כשר בצ'יאנג מאי בלי שום בעיה. הנה כל מה שצריך לדעת.

## בית חב"ד צ'יאנג מאי -- הבית של הישראלים

מי שהיה פעם בתאילנד יודע שבית חב"ד הוא התחנה הראשונה. הסניף בצ'יאנג מאי נמצא במרכז העיר ומציע:

- **ארוחות שבת**: ארוחה שבתית קהילתית כל שבוע -- אווירה ישראלית מובטחת
- **ארוחות חגים**: סדר פסח, ארוחות חג מיוחדות ואירועים קהילתיים
- **חבילות אוכל לטיולים**: אפשר להזמין ארוחות כשרות ארוזות מראש
- **מכולת כשרה**: מבחר בסיסי של מוצרים ארוזים עם הכשר

**טיפ חשוב**: תמיד תתאמו מראש -- תתקשרו או תשלחו הודעה לפני שמגיעים, במיוחד בשבתות וחגים.

## ארוחות כשרות בטיולים של WIRO 4x4

כשיוצאים לטיול שטח איתנו, נושא האוכל מסודר:

- **ארוחות ארוזות**: סלטים, פירות טריים, אגוזים וחטיפים כשרים -- הכל מוכן ומחכה
- **מסעדות בפיקוח**: יש לנו קשרים עם מסעדות שמכינות אוכל בהתאם לדרישות כשרות
- **אופציה צמחונית**: ארוחות צמחוניות מלאות, מוכנות לפי הכללים
- **התאמות אישיות**: צליאקים? אלרגיות? ספרו לנו בהזמנה ונסדר הכל

## קניות -- איפה קונים אוכל כשר

### סופרים שכדאי להכיר

1. **Rimping Supermarket**: הסופר הכי טוב בצ'יאנג מאי -- מבחר ענק של פירות, ירקות ומוצרים מיובאים
2. **Tops Market**: יש מדף בינלאומי עם כמה מוצרים עם סימן הכשר
3. **Makro**: סיטונאי -- מעולה לקניות בכמויות של פירות, ירקות ומוצרים בסיסיים

### מה לחפש על המדפים

- פירות וירקות טריים -- תמיד כשרים, והמבחר בתאילנד מטורף
- מוצרים ארוזים עם סמלי כשרות מוכרים (OU, OK וכד')
- אורז, קינואה, דגנים -- המזון הבסיסי פה זול ונגיש
- שימורי ירקות וקטניות (תבדקו שאין תוספות בעייתיות)
- אגוזים ופירות יבשים טבעיים, בלי תוספות

## מסעדות צמחוניות -- אופציה טובה לשומרי כשרות

אין להן הכשר רשמי, אבל המסעדות הצמחוניות האלה מגישות אוכל שמתאים לרוב שומרי הכשרות:

1. **Pun Pun Organic**: מסעדה צמחונית אורגנית עם אוכל תאילנדי אותנטי -- מקום מקסים
2. **Goodsouls Kitchen**: אופציות צמחוניות וטבעוניות, מנות בריאות ומזינות
3. **Anchan Vegetarian**: מנות תאילנדיות מסורתיות בגרסה צמחונית

**שימו לב**: תמיד ציינו בפני הצוות שיש לכם דרישות מיוחדות, ותשאלו על המרכיבים -- במיוחד לגבי רטבים ותבלינים.

## טיפים מהשטח

### לפני שטסים

- תתאמו עם בית חב"ד מראש, במיוחד אם אתם מגיעים לשבת או חג
- ארזו מהארץ חטיפים כשרים -- במבה, חטיפי אנרגיה, אגוזים, פירות מיובשים
- קחו סט כלים חד-פעמיים -- יכול להציל מצבים
- הורידו את אפליקציית "Is It Kosher" או אפליקציות כשרות דומות

### בזמן הטיול

- תעדכנו את המדריך שלכם מה אתם אוכלים ומה לא -- בלי בושה
- תמיד שימו בתיק כמה חטיפים כשרים למקרה חירום
- רק מים בבקבוקים סגורים -- הכלל הזה רלוונטי לכולם בתאילנד
- תהיו פתוחים ואופטימיים -- תמיד יש פתרון

## אנשי קשר חשובים

- **חב"ד צ'יאנג מאי**: [שלחו הודעה בוואטסאפ]
- **אחראי כשרות WIRO 4x4**: ‎+66-81-640-1397
- **מסעדות כשרות בבנגקוק**: למי שמגיע דרך בנגקוק או מתכנן עצירה

## לסיכום

שמירה על כשרות בצפון תאילנד? בהחלט אפשרי, ואפילו יותר קל ממה שנשמע. ב-WIRO 4x4 אנחנו מכירים את האזור לעומק ודואגים שתאכלו כשר ותיהנו מכל רגע.

**רוצים לדעת עוד?** שלחו לנו הודעה בוואטסאפ ונבנה לכם תפריט כשר מותאם אישית לטיול.`
      ),
    },
    "israeli-traveler-tips": {
      title: t(
        "Israeli Traveler Tips for Southeast Asia",
        "המדריך השלם למטייל הישראלי בדרום מזרח אסיה"
      ),
      date: t("December 7, 2024", "7 דצמבר 2024"),
      readTime: t("10 min read", "10 דקות קריאה"),
      image: "/images/optimized/waterfall_lush_jungle.jpg",
      content: t(
        `# Essential Tips for Israeli Travelers in Southeast Asia

Drawing from years of experience guiding Israeli travelers through Thailand, Laos, and Vietnam, here are the insider tips you need to know.

## Before You Leave Israel

### Documentation

- **Passport**: Ensure 6+ months validity
- **Entry requirements**: Check official visa and entry rules for every country shortly before departure; requirements can change
- **Travel Insurance**: Essential for adventure activities
- **Vaccination Records**: Recommended vaccines for the region

### Money Matters

- **Currency**: Thai Baht (THB), Lao Kip (LAK), Vietnamese Dong (VND)
- **ATMs**: Widely available in cities, limited in rural areas
- **Credit Cards**: Accepted in major establishments
- **Cash**: Always carry some for markets and small vendors
- **Exchange Rates**: Better rates in-country than at Israeli airports

## Cultural Adaptation

### Language

- **English**: Widely spoken in tourist areas
- **Hebrew**: Surprisingly common in popular Israeli traveler spots
- **Local Languages**: Learning basic Thai/Lao/Vietnamese phrases is appreciated
- **Translation Apps**: Download offline dictionaries

### Social Norms

- **Dress Modestly**: Especially at temples (cover shoulders and knees)
- **Remove Shoes**: Before entering homes and temples
- **Respect Monks**: Don't touch monks or sit higher than them
- **Head and Feet**: Head is sacred, feet are lowest - act accordingly
- **Public Displays**: Keep affection minimal in public

## Health and Safety

### Staying Healthy

- **Water**: Drink only bottled or filtered water
- **Street Food**: Generally safe, look for busy stalls
- **Sun Protection**: SPF 50+, hat, and light long sleeves
- **Insect Repellent**: Essential for jungle areas
- **First Aid**: Carry basic supplies

### Common Issues

- **Stomach Problems**: Bring Imodium and probiotics
- **Dehydration**: Drink water constantly in the heat
- **Sunburn**: More intense than in Israel
- **Mosquito Bites**: Use repellent religiously

## Getting Around

### Transportation

- **Domestic Flights**: Affordable and time-saving
- **Buses**: Comfortable for long distances
- **Tuk-tuks/Songthaews**: Negotiate price before riding
- **Motorbike Rentals**: Requires international license
- **Private Tours**: Best for remote areas (like WIRO 4x4!)

### Navigation

- **Google Maps**: Works well in cities
- **Maps.me**: Better for offline rural navigation
- **Local SIM**: Buy immediately at airport
- **Data Plans**: Cheap and essential

## Israeli Traveler Community

### Meeting Fellow Israelis

- **Chabad Houses**: Community centers in major cities
- **Israeli Restaurants**: Natural gathering spots
- **Hostels**: Popular ones have large Israeli crowds
- **Facebook Groups**: Active Israeli traveler communities

### Shabbat Observance

- **Chabad**: Your primary resource
- **Advance Planning**: Book Shabbat meals early
- **Tour Scheduling**: Plan around Shabbat if observant
- **Emergency Contacts**: Know local Jewish community contacts

## Money-Saving Tips

### Budget Wisely

- **Accommodation**: Negotiate for longer stays
- **Food**: Street food is cheap and delicious
- **Transportation**: Share taxis and book buses in advance
- **Activities**: Book tours directly, not through hotels
- **Bargaining**: Expected at markets (start at 50% of asking price)

### Splurge-Worthy

- **Quality Tours**: Don't compromise on safety (choose WIRO 4x4!)
- **Good Accommodation**: Worth it for comfort and safety
- **Travel Insurance**: Never skip this
- **Authentic Experiences**: Cultural tours and cooking classes

## Communication

### Staying Connected

- **WhatsApp**: Primary communication tool
- **Local SIM**: AIS (Thailand), Unitel (Laos), Viettel (Vietnam)
- **WiFi**: Available in most accommodations
- **VPN**: Useful in some areas

### Calling Home

- **WhatsApp Calls**: Free with WiFi
- **Local SIM**: Cheap international rates
- **Time Difference**: Israel is 5-6 hours behind

## Seasonal Considerations

### Best Time to Visit

- **November-February**: Cool and dry (peak season)
- **March-May**: Hot season (fewer tourists, lower prices)
- **June-October**: Rainy season (lush landscapes, occasional storms)

### What to Pack

- **Light Clothing**: Breathable fabrics
- **Rain Jacket**: Compact and essential
- **Comfortable Shoes**: For walking and hiking
- **Modest Outfit**: For temple visits
- **Swimwear**: For waterfalls and pools

## Final Advice

### Do's

- Be respectful of local culture
- Try new foods and experiences
- Learn basic local phrases
- Support local businesses
- Take photos respectfully

### Don'ts

- Don't disrespect Buddhism or monarchy
- Don't touch people's heads
- Don't point feet at people or Buddha images
- Don't raise your voice or show anger
- Don't assume everyone speaks Hebrew

## Emergency Contacts

- **Israeli Embassy Bangkok**: +66 2 204 9200
- **Tourist Police**: 1155 (Thailand)
- **WIRO 4x4 Emergency**: +66 81 640 1397
- **Chabad Chiang Mai**: [WhatsApp contact]

## Conclusion

Southeast Asia offers incredible experiences for Israeli travelers. With proper preparation and cultural sensitivity, your adventure will be unforgettable. WIRO 4x4 is here to ensure your off-road experiences are safe, kosher-friendly, and authentically amazing.

**Ready to explore?** Contact us to plan your perfect Indochina adventure!`,
        `# המדריך השלם למטייל הישראלי בדרום מזרח אסיה

אחרי שנים שאנחנו מלווים ישראלים בטיולי שטח בתאילנד, לאוס ווייטנאם, ריכזנו את כל מה שלמדנו למדריך אחד. בין אם זה הטיול הגדול אחרי הצבא או חופשה משפחתית -- הטיפים האלה יחסכו לכם כסף, זמן ובלבולים.

## לפני שעולים על המטוס

### מסמכים -- תבדקו מראש

- **דרכון**: לפחות 6 חודשי תוקף מיום הכניסה למדינה -- בלי זה לא עולים על הטיסה
- **תנאי כניסה**: בדקו באתר רשמי את כללי הוויזה והכניסה לכל מדינה סמוך ליציאה, כי הדרישות עשויות להשתנות
- **ביטוח נסיעות**: חובה, לא המלצה. במיוחד אם מתכננים טיולי שטח או אופנועים
- **חיסונים**: תתייעצו עם מרפאת מטיילים -- צהבת, טיפוס ועוד

### כסף -- כמה דברים שחשוב לדעת

- **מטבעות**: באט תאילנדי (THB), קיפ לאוסי (LAK), דונג וייטנאמי (VND)
- **כספומטים**: בערים הגדולות יש בכל פינה, באזורים כפריים -- פחות. תמשכו מראש
- **כרטיס אשראי**: מקובל במקומות גדולים, אבל אל תסמכו רק עליו
- **מזומן**: חובה לשווקים, אוכל רחוב, טוק-טוקים ובכלל כמעט בכל מקום מחוץ לערים
- **המרה**: לעולם אל תמירו בנתב"ג. השער במדינת היעד תמיד טוב יותר, בהרבה

## להתנהג כמו מקומי (או לפחות לנסות)

### שפה

- **אנגלית**: באזורי תיירות כולם מדברים, ברמות שונות
- **עברית**: תופתעו כמה מקומיים מכירים מילים בעברית -- "אחי", "סבבה", "כמה זה" -- זה כי ישראלים מגיעים לפה כבר עשרות שנים
- **תאית/לאוסית/וייטנאמית**: גם "תודה" ו"שלום" בשפה המקומית פותחים דלתות. תשקיעו שתי דקות ללמוד
- **אפליקציות**: Google Translate עם הורדה אופליין -- חובה

### נורמות חברתיות -- הדברים שישראלים נוטים לשכוח

- **לבוש במקדשים**: כתפיים וברכיים מכוסות. רצינו, זה לא אופציונלי
- **נעליים**: מורידים לפני כניסה לבתים ומקדשים. תמיד
- **נזירים**: נשים לא נוגעות בנזירים בכלל. גברים מתייחסים בכבוד מרבי
- **ראש ורגליים**: הראש נחשב לחלק הקדוש בגוף, הרגליים לנמוך ביותר. אל תלטפו ילדים על הראש, ואל תצביעו עם הרגליים
- **PDA**: חיבוקים ונשיקות בפומבי -- לא מקובלים פה. אפילו החזקת ידיים מעוררת מבטים

## בריאות -- אל תזלזלו

### כללים בסיסיים

- **מים**: רק בבקבוקים סגורים, בלי יוצאי דופן. גם לצחצוח שיניים
- **אוכל רחוב**: בדרך כלל מעולה ובטוח. טיפ: אם הדוכן עמוס מקומיים -- סימן טוב
- **שמש**: קרם SPF 50+ זה חובה. השמש פה חזקה אפילו ביחס לישראל
- **יתושים**: דוחה יתושים, במיוחד בשעות הערב ובאזורי ג'ונגל. אל תוותרו
- **ערכת עזרה ראשונה**: פלסטרים, אלגל, שלשולים, כאבי ראש -- הבסיס

### מה שתכלס קורה

- **בטן**: כמעט כולם עוברים את זה. אימודיום ופרוביוטיקה -- תביאו מהארץ
- **התייבשות**: שותים מים כל הזמן, גם כשלא צמאים. פה זה 35+ מעלות עם לחות
- **כוויות שמש**: חמורות יותר ממה שמכירים בישראל -- אל תזלזלו
- **יתושים**: OFF, אותובן, או כל דוחה חזק. במיוחד בצפון ובאזורים כפריים

## תחבורה -- איך מסתובבים

### אופציות

- **טיסות פנימיות**: זולות (AirAsia, Nok Air) וחוסכות ימים שלמים של נסיעה
- **אוטובוסים**: נוחים ומרווחים, במיוחד אוטובוסי VIP לילה
- **טוק-טוק וסונגטאו**: חלק מהחוויה. תמיד מסכמים מחיר לפני שעולים
- **אופנועים**: הדרך הכי חופשית -- אבל חובה רישיון בינלאומי וביטוח
- **טיול שטח פרטי**: הדרך הכי בטוחה ומהנה להכיר אזורים מרוחקים (בדיוק מה שאנחנו עושים ב-WIRO 4x4)

### ניווט

- **Google Maps**: מצוין בערים
- **Maps.me**: עדיף לשבילים כפריים ואזורים בלי קליטה
- **סים מקומי**: קונים ישר בנחיתה, בשדה התעופה
- **חבילת דאטה**: עולה כמעט כלום ומשנה את החיים

## הקהילה הישראלית -- אתם לא לבד

### איפה פוגשים את החבר'ה

- **בתי חב"ד**: הבית של הישראלים בכל עיר גדולה. ארוחות, אווירה, הרגשת בית
- **מסעדות ישראליות**: כן, גם בצ'יאנג מאי יש שקשוקה וחומוס
- **הוסטלים**: באזורים כמו קאו סאן רוד, וואנג ויינג, פאי -- חצי מהאנשים ישראלים
- **קבוצות פייסבוק**: "ישראלים בתאילנד", "ישראלים בוייטנאם" -- עדכונים, טיפים, שותפים לטיול

### שומרים שבת?

- **חב"ד**: הכתובת שלכם. ארוחות שבת קהילתיות, תפילות, אווירה חמה
- **הזמינו מראש**: ארוחות שבת נגמרות מהר, במיוחד בעונות השיא
- **תזמנו את הטיול**: ב-WIRO 4x4 אנחנו יודעים לתכנן טיולים שמסתדרים עם שבת
- **שמרו טלפונים**: של חב"ד ושל הקהילה היהודית המקומית, למקרה הצורך

## כסף -- איפה חוסכים ועל מה משקיעים

### איך שורדים בתקציב

- **לינה**: מתמקחים, במיוחד לשהייה של כמה לילות. הנחות ניכרות
- **אוכל**: פאד תאי ב-40-50 באט (5-6 שקלים) -- אוכל רחוב זה הדבר הכי טעים והכי זול
- **תחבורה**: שיתוף מוניות (Grab), אוטובוסים מוקדמים
- **אטרקציות**: הזמינו ישירות מהספק, לא דרך המלון -- החיסכון יכול להיות 30-50%
- **מיקוח**: חובה בשווקים. מתחילים מחצי מהמחיר ומשם עולים לאט

### על מה שווה לפזר

- **טיול שטח איכותי**: בטיחות זה לא משהו שחוסכים עליו. עם WIRO 4x4 אתם מקבלים מדריכים מנוסים ורכבים מטופחים
- **לינה טובה**: אחרי יום טיול אתם רוצים מקלחת חמה ומיטה נוחה
- **ביטוח**: כבר אמרנו -- לא מדלגים על זה. לעולם
- **חוויות מקוריות**: שיעור בישול תאילנדי, טיול לכפרי הרים, ירידה ברפטינג

## להישאר מחוברים

### קישוריות

- **וואטסאפ**: כלי התקשורת מספר 1 בתאילנד -- לכולם
- **סים מקומי**: AIS (תאילנד), Unitel (לאוס), Viettel (וייטנאם) -- זול, פשוט, עובד
- **WiFi**: כמעט בכל מקום לינה, בתי קפה ומסעדות
- **VPN**: שווה להתקין, בעיקר בווייטנאם

### להתקשר הביתה

- **וואטסאפ**: שיחות בחינם עם WiFi -- אמא תשמח
- **סים מקומי**: שיחות בינלאומיות בזול
- **הפרשי שעות**: ישראל 5 שעות מאחור בחורף, 4 בקיץ

## מתי הכי טוב לבוא

### עונות

- **נובמבר-פברואר**: העונה הכי טובה. מזג אוויר נעים, יבש וקריר יחסית. זו גם עונת השיא -- יותר תיירים ומחירים גבוהים יותר
- **מרץ-מאי**: חם. ממש חם. אבל פחות תיירים, מחירים נמוכים, ויש בזה את הקסם שלו
- **יוני-אוקטובר**: עונת הגשמים. הנופים הכי ירוקים, מחירים הכי נמוכים, אבל גשם כמעט כל יום

### מה לארוז

- **בגדים קלים ונושמים**: כותנה, פשתן -- הגוף יודה לכם
- **מעיל גשם דק**: חובה כל השנה, גם בעונה היבשה
- **נעלי הליכה נוחות**: לטיולים ולטרקים
- **חולצה עם שרוולים ומכנסיים ארוכים**: למקדשים
- **בגד ים**: למפלים, נהרות, בריכות -- הם בכל מקום

## עשה ואל תעשה

### כן

- כבדו את התרבות המקומית -- אתם אורחים פה
- נסו כל מה שמציעים לכם (חוץ מעקרבים מטוגנים, שזה עניין אישי)
- למדו "קופ קון קראפ/קה" (תודה בתאית) -- זה פותח לבבות
- קנו מאומנים מקומיים, לא מחנויות תיירים
- צלמו בכבוד ובהסכמה

### לא

- אל תבזו את הדת או את המלך -- בתאילנד זה עבירה פלילית, ברצינות
- אל תלטפו ילדים (או מבוגרים) על הראש
- אל תצביעו עם הרגליים לכיוון אנשים, פסלי בודהה או מקדשים
- אל תצעקו ואל תתנהגו אגרסיבית -- פה מעריכים רוגע ושלווה
- אל תצפו שכולם ידברו עברית -- גם אם הרבה מהם כן

## טלפונים חשובים

- **שגרירות ישראל בבנגקוק**: +66-2-204-9200
- **משטרת תיירות (תאילנד)**: 1155
- **חירום WIRO 4x4**: +66-81-640-1397
- **חב"ד צ'יאנג מאי**: [וואטסאפ]

## סיכום

דרום מזרח אסיה היא חוויה שכל ישראלי צריך לחוות -- בין אם בטיול הגדול אחרי הצבא, חופשת זוגות, או הרפתקה משפחתית. עם ההכנה הנכונה וקצת רגישות תרבותית, הטיול הזה ילווה אתכם עד סוף החיים. ואנחנו ב-WIRO 4x4 כאן כדי לוודא שחלק טיולי השטח יהיה הכי בטוח, הכי כשר והכי מרגש שאפשר.

**מוכנים?** שלחו לנו הודעה ובואו נתכנן את הטיול המושלם שלכם!`
      ),
    },
    "cultural-etiquette": {
      title: t(
        "Cultural Etiquette Guide for Indochina",
        "איך להתנהג באינדוסין -- המדריך התרבותי"
      ),
      date: t("December 7, 2024", "7 דצמבר 2024"),
      readTime: t("7 min read", "7 דקות קריאה"),
      image: "/images/optimized/hilltribe_girl_craft_market-md.webp",
      content: t(
        `# Cultural Etiquette Guide for Thailand, Laos & Vietnam

Understanding and respecting local customs is essential for meaningful travel experiences. Here's your guide to cultural etiquette in Indochina.

## General Principles

### The Concept of "Face"

- **Saving Face**: Never embarrass someone publicly
- **Losing Face**: Avoid confrontation and raised voices
- **Giving Face**: Show respect, especially to elders
- **Smiling**: The universal solution to awkward situations

### Hierarchy and Respect

- **Age**: Elders are highly respected
- **Status**: Show deference to monks, officials, and teachers
- **Royalty**: Never disrespect the monarchy (especially in Thailand)
- **Authority**: Police and officials should be treated with respect

## Religious Etiquette

### Buddhist Temples

**Dress Code**:
- Cover shoulders and knees
- Remove shoes before entering
- Wear modest, respectful clothing
- Avoid tight or revealing clothes

**Behavior**:
- Speak quietly
- Don't point feet at Buddha images
- Don't touch religious artifacts
- Ask before taking photos
- Don't climb on structures

### Monks

**Important Rules**:
- Women: Never touch monks or hand items directly
- Men: Can interact more freely but still show respect
- Don't sit higher than monks
- Give up your seat on public transport
- Step aside when monks pass

## Social Interactions

### Greetings

**Thailand (Wai)**:
- Press palms together at chest level
- Slight bow of the head
- Higher hands = more respect
- Return wais from equals, not children or service staff

**Laos (Nop)**:
- Similar to Thai wai
- More casual in rural areas
- Smile is always appropriate

**Vietnam (Handshake)**:
- Handshakes are common
- Use both hands for extra respect
- Slight bow shows respect

### Physical Contact

**Do's**:
- Handshakes are generally okay
- Pat on the back (same gender)
- Hold hands (friends, same gender)

**Don'ts**:
- Don't touch people's heads (most sacred part)
- Don't point feet at people (lowest, dirtiest part)
- Minimal public affection between couples
- Don't hug unless you're close friends

## Dining Etiquette

### General Rules

- Wait for elder/host to start eating
- Use spoon and fork (not fork to mouth in Thailand)
- Chopsticks in Vietnam and some Lao dishes
- Don't stick chopsticks upright in rice (funeral symbol)
- Try everything offered
- Leave a little food (shows you're satisfied)

### Drinking

- Toast before drinking
- Hold glass with both hands when receiving
- Don't refuse the first drink
- Pace yourself - refills are constant
- "Chok dee" (Thailand), "Chuc suc khoe" (Vietnam)

## Home Visits

### Entering Homes

- **Always** remove shoes
- Bring a small gift
- Greet elders first
- Sit where directed
- Don't step over people

### Gift Giving

**Good Gifts**:
- Fruit baskets
- Sweets/snacks from your country
- Small souvenirs from Israel
- Quality tea or coffee

**Avoid**:
- Alcohol (unless you know they drink)
- Expensive gifts (creates obligation)
- Sharp objects (knives, scissors)
- Clocks (symbol of death in Vietnam)

## Market and Shopping

### Bargaining

- Expected at markets, not in shops with prices
- Start at 50-60% of asking price
- Stay friendly and smile
- Walk away if price is too high (they'll often call you back)
- Don't bargain if you won't buy

### Vendors

- Be patient and polite
- Don't touch items roughly
- Ask before taking photos of products
- Support local artisans
- Small purchases help build relationships

## Photography

### Do's

- Ask permission before photographing people
- Especially important with monks and hill tribes
- Offer to show them the photo
- Respect "no photography" signs
- Share photos if you promised

### Don'ts

- Don't photograph military installations
- Avoid photos of poverty without permission
- Don't photograph people bathing or in private moments
- Be sensitive in villages and sacred sites

## Hill Tribe Visits

### Respectful Behavior

- Hire local guides who know the community
- Ask permission before entering villages
- Don't treat people like zoo animals
- Buy crafts directly from artisans
- Don't give candy to children (creates begging)
- Respect private spaces

### Cultural Sensitivity

- Understand that tribes have different customs
- Some areas are off-limits to outsiders
- Don't touch sacred objects or totems
- Dress modestly
- Learn about their culture beforehand

## Communication Style

### Verbal

- Speak softly and calmly
- Avoid direct confrontation
- Use indirect language for criticism
- "Maybe" often means "no"
- Silence is okay, don't fill it

### Non-Verbal

- Smile frequently
- Nod to show understanding
- Avoid intense eye contact (can be aggressive)
- Pointing with full hand, not finger
- Beckoning with palm down, not up

## Country-Specific Notes

### Thailand

- **Monarchy**: Never criticize the royal family
- **Head**: Most sacred, never touch
- **Feet**: Never point at people or Buddha
- **Left Hand**: Use right hand for giving/receiving

### Laos

- **Relaxed**: More casual than Thailand
- **Baci Ceremony**: If invited, participate respectfully
- **Slow Pace**: Don't rush people
- **Communist History**: Be sensitive about politics

### Vietnam

- **War History**: Be respectful, don't joke
- **Nationalism**: Vietnamese are proud of their country
- **Directness**: Slightly more direct than Thailand/Laos
- **Motorbikes**: Watch out! They're everywhere

## Common Mistakes to Avoid

1. **Losing Your Temper**: Never works, always backfires
2. **Disrespecting Religion**: Serious offense
3. **Public Displays of Affection**: Keep it minimal
4. **Pointing Feet**: At people, Buddha, or sacred objects
5. **Touching Heads**: Even children (ask parents first)
6. **Ignoring Dress Codes**: At temples and formal places
7. **Being Loud**: Especially in public spaces
8. **Refusing Food**: Try to accept and taste
9. **Not Removing Shoes**: When required
10. **Disrespecting Elders**: Always show deference

## When in Doubt

- **Observe**: Watch what locals do
- **Ask**: Your guide or hotel staff
- **Apologize**: If you make a mistake
- **Smile**: It solves most problems
- **Be Humble**: Admit you're learning

## WIRO 4x4 Cultural Guidance

All our tours include cultural briefings:
- Pre-tour orientation on local customs
- Guidance during village visits
- Translation and cultural interpretation
- Appropriate behavior modeling
- Respectful interaction facilitation

## Conclusion

Cultural sensitivity isn't about being perfect - it's about showing respect and willingness to learn. Locals appreciate when visitors make an effort to understand their customs. With these guidelines and WIRO 4x4's experienced guides, you'll navigate Indochina's rich cultural landscape with confidence and respect.

**Questions about cultural etiquette?** Contact us for personalized guidance for your tour.`,
        `# מדריך התנהגות תרבותי לתאילנד, לאוס ווייטנאם

בואו נגיד את זה ישר: ישראלים ידועים בעולם כמטיילים רועשים ואסרטיביים. באינדוסין, הגישה הזו פשוט לא עובדת. המנטליות פה הפוכה לחלוטין -- שקט, חיוך, כבוד. מי שמבין את הקוד התרבותי מקבל חוויה אחרת לגמרי. הנה כל מה שצריך לדעת.

## הכלל הכי חשוב: "שמירת פנים"

### מה זה אומר בפועל

- **לא מביכים אף אחד ברבים**: לא צוחקים על מישהו, לא מבקרים אותו בקול רם, לא גורמים למצב לא נעים
- **עימות = כישלון**: אם הרמתם את הקול, אתם הצד שהפסיד. תמיד
- **חיוך הוא הכלי הכי חזק**: גם כשמשהו מתסכל, גם כשלא מבינים מה קורה -- חיוך פותר הכל
- **כבוד למבוגרים**: בכל מצב. מפנים מקום, מדברים בכבוד, שומעים

### היררכיה -- ככה זה עובד פה

- **גיל**: מבוגר = חכם = ראוי לכבוד. אין על זה ויכוח
- **נזירים**: ברמה הכי גבוהה של הכבוד. לא נוגעים, לא יושבים מעליהם
- **מלוכה בתאילנד**: נושא רגיש ברמה פלילית. לא מדברים נגד המלך, לא בבדיחה, לא בציניות, לא בשום צורה
- **משטרה ופקידים**: מתנהגים בכבוד ובסבלנות, גם אם זה לוקח זמן

## במקדשים -- הכללים שלא גמישים

### לבוש

- כתפיים וברכיים מכוסות -- חובה, ללא יוצאי דופן
- נעליים מורידים בכניסה
- בגדים צנועים ומכובדים, בלי גופיות ומכנסיים קצרים
- לא צמוד ולא חושפני -- תזכרו, זה מקום פולחן

### התנהגות

- מדברים בלחש
- רגליים מכופלות הצידה, לעולם לא מופנות לכיוון פסלי בודהה
- ידיים רחוקות מחפצים דתיים
- מצלמים רק אחרי ששואלים אם מותר
- ממש לא מטפסים על שום דבר

### נזירים -- כללים ברורים

- **נשים**: אסור לגעת בנזיר או להושיט לו משהו ישירות. מניחים את החפץ על השולחן
- **גברים**: מתנהגים בכבוד אבל יכולים ליצור קשר ישיר יותר
- לא יושבים במקום גבוה מהם -- לא על ספסל, לא על כסא, לא על כלום
- מפנים מקום בתחבורה ציבורית
- כשנזיר עובר -- זזים הצידה

## ברכות -- איך אומרים שלום

**תאילנד -- ה-"ואי" (Wai)**:
- ידיים צמודות מול החזה, הנהון קל
- ככל שהידיים גבוהות יותר, ככה מביעים יותר כבוד
- מחזירים "ואי" לאנשים בגילכם ומעמדכם, לא לילדים או למלצרים

**לאוס -- ה-"נוֹפּ" (Nop)**:
- דומה ל"ואי" התאילנדי, אבל יותר רגוע
- באזורים כפריים פשוט מחייכים וזהו

**וייטנאם -- לחיצת יד**:
- לחיצת יד רגילה, כמו שמכירים
- לשתי הידיים -- סימן של כבוד מיוחד
- הנהון קל מוסיף נקודות

## מגע גופני -- מפת המותר והאסור

**מותר**:
- לחיצת יד -- כמעט תמיד בסדר
- טפיחה על הגב -- בין גברים
- חברים מאותו המין מחזיקים ידיים -- כן, זה רגיל פה

**אסור**:
- **ראש**: החלק הכי קדוש. לא נוגעים, גם לא בלטיפה חברית, גם לא לילדים
- **רגליים**: החלק הכי נמוך. לא מצביעים, לא שמים על שולחן, לא מכוונים לאנשים
- **חיבוק/נשיקה בציבור**: לא מקובל כלל, גם בין זוגות. שמרו את זה לחדר
- **חיבוק**: רק בין חברים ממש קרובים, ואפילו אז -- בזהירות

## אוכל -- הכללים שצריך להכיר

### על השולחן

- מחכים שהזקן/המארח יתחיל. אז רק אז מתחילים
- בתאילנד אוכלים עם כף ומזלג -- המזלג דוחף לכף, הכף נכנסת לפה. לא המזלג
- בווייטנאם -- מקלות אכילה. תתאמנו קצת מראש
- **לעולם** לא תוקעים מקלות זקופים באורז -- זה מזכיר קטורת ללוויה
- תנסו מכל דבר שמגישים -- גם אם לא יודעים מה זה
- להשאיר קצת אוכל בצלחת = "שבעתי, תודה". לנקות את הצלחת = "אני עדיין רעב"

### כשמוזגים לכם

- מרימים כוסית ואומרים "לחיים" -- "Chok Dee" בתאילנד, "Chuc Suc Khoe" בווייטנאם
- מקבלים כוס בשתי ידיים -- מחווה של כבוד
- לא מסרבים לכוס הראשונה, גם אם אתם לא שותים
- שימו לב: ימלאו לכם כל שנייה. תשתו לאט אם לא רוצים להשתכר

## כשמוזמנים לבית מקומי

### כניסה

- נעליים בחוץ. תמיד, בלי חריגים
- תביאו מתנה קטנה (עוד רגע נפרט)
- מברכים את הבוגרים ראשון
- יושבים איפה שמראים לכם -- אל תבחרו לעצמכם
- אם אנשים יושבים על הרצפה -- לא דורכים מעליהם, עוקפים

### מה מביאים

**מתנות שעושות שמח**:
- סל פירות -- תמיד עובד
- ממתקים מהארץ -- במבה, שוקולד עלית, חלבה
- מזכרת ישראלית קטנה
- תה או קפה איכותי

**מה לא**:
- אלכוהול -- רק אם אתם בטוחים שהם שותים
- מתנות יקרות מדי -- יוצר מחויבות לא נעימה
- סכינים או מספריים -- סמל של ניתוק
- שעונים -- סמל מוות בווייטנאם. ברצינות

## מיקוח -- אומנות ישראלית שעובדת גם באסיה

- בשווקים -- כן, זה חלק מהמשחק. בחנויות עם מחירונים -- לא
- מתחילים מ-50-60% מהמחיר שנאמר, ועולים משם
- הכי חשוב: לחייך, להנות מהתהליך. זה לא קרב -- זה ריקוד
- טריק קלאסי: אם המחיר לא מתאים, אמרו "תודה" ותתחילו ללכת. ב-80% מהמקרים יקראו לכם חזרה עם מחיר טוב יותר
- כלל זהב: אל תתמקחו אם אתם לא באמת רוצים לקנות

## צילום -- שאלו לפני שלוחצים

**כן**:
- תשאלו רשות לפני שמצלמים אנשים. תמיד
- נזירים ובני שבטי הרים -- רגישים במיוחד. תשאלו פעמיים
- תציעו להראות את התמונה -- זה גורם לחיוך
- רשום "אסור לצלם"? אז אסור לצלם
- הבטחתם לשלוח תמונה? תשלחו

**לא**:
- מתקנים צבאיים -- אפילו לא מקרוב
- אנשים בסיטואציות קשות -- לא בלי לשאול
- אנשים רוחצים, מתפללים או ברגעים אינטימיים
- כפרים ואתרים קדושים -- עם רגישות מקסימלית

## כפרי שבטי הרים -- לא גן חיות

### כללים בסיסיים

- תגיעו עם מדריך מקומי שמכיר את הקהילה ויש לו קשר אישי
- מבקשים רשות לפני שנכנסים לכפר
- האנשים האלה חיים פה -- הם לא אטרקציה תיירותית. תזכרו את זה
- רוצים לתמוך? קנו ישירות מהאומנים, לא מהחנות בעיר
- **לא מחלקים ממתקים לילדים** -- זה יוצר תרבות של קבצנות ותלות. במקום, תקנו מהם
- כבדו חללים פרטיים וקדושים

### להתכונן מראש

- כל שבט שונה -- קארן, אקה, לאהו, ליסו -- לכל אחד מנהגים אחרים
- יש מקומות שסגורים למבקרים. אל תתעקשו
- לא נוגעים בחפצים קדושים, טוטמים, או מבנים דתיים
- לובשים צנוע -- זה בסיסי
- תקראו קצת מראש. אפילו מאמר קצר משנה את כל החוויה

## איך מדברים -- ההבדל שמשנה הכל

### מילים

- מדברים בטון נמוך ורגוע. צעקות = כישלון
- עימות ישיר הוא פשוט לא אופציה. תמצאו דרך עוקפת
- ביקורת? רק בעקיפין, בצורה עדינה
- כשאומרים לכם "אולי" -- תבינו שזה "לא"
- שתיקה היא חלק מהשיחה. אל תמהרו למלא אותה

### שפת גוף

- חייכו. הרבה. גם אם זה לא טבעי לכם -- זה הכלי מספר 1
- הנהנו בראש כדי להראות שאתם מקשיבים
- מבט ישיר וחזק בעיניים? באסיה זה נתפס כאגרסיבי. תרככו
- מצביעים על משהו? עם כל כף היד, לא עם אצבע
- קוראים למישהו? כף יד כלפי מטה ותנועה פנימה. כף יד למעלה זה גס

## הבדלים בין המדינות

### תאילנד

- **המלך**: נושא אדום. ביקורת על המלוכה היא עבירה פלילית שנענשת במאסר. ברצינות גמורה
- **ראש**: החלק הכי קדוש בגוף. לא נוגעים. נקודה
- **רגליים**: לא מכוונים לכיוון אנשים, מקדשים או פסלים
- **יד ימין**: נותנים ומקבלים ביד ימין. השמאלית נחשבת לא נקייה

### לאוס

- **האווירה**: הרבה יותר רגועה מתאילנד. הקצב איטי, והמנטליות מתאימה
- **טקס באצ'י (Baci)**: טקס ברכה מסורתי. אם מזמינים -- תשתתפו, זו חוויה מיוחדת
- **"סאבאידי"**: אל תמהרו אנשים. הדברים קורים בקצב שלהם
- **פוליטיקה**: מדינה קומוניסטית. תהיו מודעים ולא תעלו את הנושא

### וייטנאם

- **מלחמת וייטנאם**: נושא רגיש ביותר. לא בדיחות, לא הערות, כלום
- **גאווה לאומית**: וייטנאמים גאים מאוד במדינה ובהיסטוריה שלהם. תכבדו את זה
- **תקשורת ישירה יותר**: בהשוואה לתאילנד ולאוס, וייטנאמים יותר ישירים. אבל עדיין -- בנימוס
- **אופנועים**: הם בכל מקום. ברחוב, על המדרכה, בניגוד לכיוון. תסתכלו לכל הצדדים, כל הזמן

## 10 טעויות שישראלים עושים (ואיך להימנע מהן)

1. **לצעוק או להרים קול**: אף פעם לא עובד. אף פעם. המקומיים ייסגרו לגמרי
2. **לזלזל בדת**: עבירה חמורה שיכולה לגרור מאסר בתאילנד
3. **נשיקות וחיבוקים בציבור**: פה זה לא קולני כמו בישראל. שמרו את זה לפרטי
4. **כיוון רגליים**: לא לכיוון בודהה, לא לכיוון אנשים, לא לכיוון מקדשים
5. **ליטוף ראשים**: גם של ילדים חמודים. תשאלו את ההורים ותכבדו אם אומרים לא
6. **גופייה ומכנסיים קצרים במקדש**: לבוש צנוע הוא לא אופציה -- הוא תנאי כניסה
7. **דיבור חזק ורועש**: במיוחד במקומות שקטים, מקדשים, ובתחבורה ציבורית
8. **לסרב לאוכל**: גם אם לא מכירים -- טעימה קטנה מראה כבוד
9. **להיכנס עם נעליים**: תסתכלו על הכניסה -- יש נעליים? מורידים
10. **לא לכבד מבוגרים**: תמיד תנו כבוד לאנשים מבוגרים מכם

## לא בטוחים מה לעשות? יש כלל פשוט

- **תסתכלו סביב**: מה המקומיים עושים? תעשו כמוהם
- **תשאלו**: את המדריך, את הצוות במלון, את מי שנראה ידידותי
- **טעיתם? תתנצלו**: חיוך + הנהון = סליחה מקובלת
- **חייכו**: המפתח האוניברסלי בכל מקום באסיה
- **הכירו שאתם לומדים**: ענווה אמיתית פותחת דלתות

## ההכנה התרבותית שלנו ב-WIRO 4x4

בכל טיול אנחנו דואגים שתגיעו מוכנים:
- תדריך מקיף לפני הטיול על הכללים התרבותיים של כל אזור
- ליווי והדרכה בזמן ביקורים בכפרים ומקומות קדושים
- המדריכים שלנו דוברי השפה המקומית ומכירים את הקודים
- עזרה בתקשורת עם מקומיים -- תרגום, הסברים, גישור תרבותי
- דוגמה אישית -- המדריכים שלנו מראים איך מתנהגים נכון

## שורה תחתונה

לא צריך להיות מושלמים -- צריך לנסות. המקומיים באינדוסין מעריכים מאוד מטיילים שעושים מאמץ להבין את התרבות שלהם, גם אם טועים לפעמים. חיוך, ענווה, וכבוד -- שלושת המילים האלה ישנו לכם את הטיול מקצה לקצה.

**רוצים להגיע מוכנים?** דברו איתנו ונדאג שתכירו את התרבות לעומק לפני שמגיעים.`
      ),
    },
    ...getAdditionalHardcodedPosts(t),
  };
}
