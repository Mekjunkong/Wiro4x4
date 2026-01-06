import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Link, useRoute } from 'wouter';

export default function BlogPost() {
  const { t } = useLanguage();
  const [, params] = useRoute('/blog/:id');
  const postId = params?.id;

  const posts: Record<string, any> = {
    'kosher-dining-guide': {
      title: t('Kosher Dining Guide for Northern Thailand', 'מדריך אוכל כשר לצפון תאילנד'),
      date: t('December 7, 2024', '7 דצמבר 2024'),
      readTime: t('8 min read', '8 דקות קריאה'),
      image: '/images/1000000149.jpg',
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
- **WIRO 4x4 Kosher Coordinator**: +66 123 456 789
- **Bangkok Kosher Restaurants**: For longer trips

## Conclusion

With proper planning and the right resources, maintaining kashrut in Northern Thailand is entirely manageable. WIRO 4x4 is committed to ensuring all our guests can enjoy their adventure while observing their dietary requirements.

**Questions?** Contact us on WhatsApp for personalized kosher meal planning for your tour.`,
        `# מציאת אוכל כשר בצ'יאנג מאי

טיול לצפון תאילנד תוך שמירה על כשרות לא חייב להיות מאתגר. הנה המדריך המקיף שלכם לאפשרויות אוכל כשר בצ'יאנג מאי והסביבה.

## בית חב"ד צ'יאנג מאי

בית חב"ד הוא המשאב העיקרי שלכם לארוחות כשרות בצ'יאנג מאי. ממוקם בלב העיר, הם מציעים:

- **ארוחות שבת**: ארוחות שבת שבועיות עם הקהילה
- **שירותי חג**: ארוחות מיוחדות בחגים יהודיים
- **חבילות ארוחות**: ארוחות כשרות מוזמנות מראש לסיורים וטיולים
- **מצרכים**: מבחר מוגבל של מזונות כשרים ארוזים

**חשוב**: תמיד התקשרו מראש לאישור זמינות ולביצוע הזמנות.

## שירות ארוחות כשרות WIRO 4x4

כל הסיורים שלנו כוללים אפשרויות ארוחות כשרות:

- **ארוחות צהריים ארוזות**: סלטים טריים, פירות, אגוזים וחטיפים עם הכשר
- **תיאום מסעדות**: אנו עובדים עם מסעדות נבחרות שיכולות להכין ארוחות בסגנון כשר תחת פיקוח
- **אפשרויות צמחוניות**: ארוחות צמחוניות לחלוטין שהוכנו לפי הנחיות כשרות
- **בקשות מיוחדות**: הודיעו לנו על כל מגבלה או העדפה תזונתית

## אפשרויות בישול עצמי

### סופרמרקטים עם פריטים ידידותיים לכשרות

1. **רימפינג סופרמרקט**: מבחר גדול של פירות, ירקות ומוצרים ארוזים
2. **טופס מרקט**: מדור בינלאומי עם כמה מוצרים עם הכשר
3. **מאקרו**: פריטים בכמויות גדולות ותוצרת טרייה

### מה לחפש

- פירות וירקות טריים (תמיד כשרים)
- פריטים ארוזים עם סמלי הכשר
- אורז, קינואה ודגנים רגילים
- ירקות וקטניות משומרים (בדקו רכיבים)
- אגוזים ופירות יבשים (לא מלוחים, ללא טעם)

## אכילה במסעדות: מסעדות צמחוניות

למרות שאינן בעלות הכשר, מסעדות צמחוניות אלו מציעות ארוחות התואמות את חוקי הכשרות:

1. **Pun Pun Organic Restaurant**: מטבח תאילנדי צמחוני אורגני
2. **Goodsouls Kitchen**: אפשרויות צמחוניות וטבעוניות בריאות
3. **Anchan Vegetarian Restaurant**: מנות תאילנדיות צמחוניות מסורתיות

**הערה**: תמיד הודיעו לצוות על הדרישות התזונתיות שלכם ושאלו על מרכיבים.

## טיפים לטיול

### לפני הטיול

- צרו קשר עם בית חב"ד צ'יאנג מאי מראש
- ארזו חטיפים כשרים מהבית (חטיפי אנרגיה, אגוזים, פירות יבשים)
- הביאו כלים וצלחות חד-פעמיים
- הורידו אפליקציות הכשר

### במהלך הסיור

- תקשרו בבירור את הצרכים התזונתיים למדריך
- נשאו חטיפים כשרים לשעת חירום
- שתו מים בבקבוקים
- היו גמישים וסבלניים

## אנשי קשר לשעת חירום

- **חב"ד צ'יאנג מאי**: [צרו קשר בוואטסאפ]
- **רכז כשרות WIRO 4x4**: 66819611398+
- **מסעדות כשרות בבנגקוק**: לטיולים ארוכים יותר

## סיכום

עם תכנון נכון והמשאבים המתאימים, שמירה על כשרות בצפון תאילנד היא לחלוטין אפשרית. WIRO 4x4 מחויבת להבטיח שכל האורחים שלנו יוכלו ליהנות מההרפתקה שלהם תוך שמירה על דרישותיהם התזונתיות.

**שאלות?** צרו איתנו קשר בוואטסאפ לתכנון ארוחות כשרות מותאם אישית לסיור שלכם.`
      ),
    },
    'israeli-traveler-tips': {
      title: t('Israeli Traveler Tips for Southeast Asia', 'טיפים לישראלים בדרום מזרח אסיה'),
      date: t('December 7, 2024', '7 דצמבר 2024'),
      readTime: t('10 min read', '10 דקות קריאה'),
      image: '/images/vietnam_rice_terraces.jpg',
      content: t(
        `# Essential Tips for Israeli Travelers in Southeast Asia

Drawing from years of experience guiding Israeli travelers through Thailand, Laos, and Vietnam, here are the insider tips you need to know.

## Before You Leave Israel

### Documentation

- **Passport**: Ensure 6+ months validity
- **Visas**: Check current requirements (Thailand: 30-day visa exemption, Laos & Vietnam: visa on arrival or e-visa)
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
- **WIRO 4x4 Emergency**: +66 123 456 789
- **Chabad Chiang Mai**: [WhatsApp contact]

## Conclusion

Southeast Asia offers incredible experiences for Israeli travelers. With proper preparation and cultural sensitivity, your adventure will be unforgettable. WIRO 4x4 is here to ensure your off-road experiences are safe, kosher-friendly, and authentically amazing.

**Ready to explore?** Contact us to plan your perfect Indochina adventure!`,
        `# טיפים חיוניים למטיילים ישראלים בדרום מזרח אסיה

מתוך שנים של ניסיון בהדרכת מטיילים ישראלים בתאילנד, לאוס ווייטנאם, הנה הטיפים הפנימיים שאתם צריכים לדעת.

## לפני שאתם עוזבים את ישראל

### תיעוד

- **דרכון**: ודאו תוקף של 6+ חודשים
- **ויזות**: בדקו דרישות עדכניות (תאילנד: פטור ויזה ל-30 יום, לאוס ווייטנאם: ויזה בהגעה או e-visa)
- **ביטוח נסיעות**: חיוני לפעילויות הרפתקה
- **רישומי חיסונים**: חיסונים מומלצים לאזור

### עניינים כספיים

- **מטבע**: בהט תאילנדי (THB), קיפ לאוסי (LAK), דונג וייטנאמי (VND)
- **כספומטים**: זמינים בערים, מוגבלים באזורים כפריים
- **כרטיסי אשראי**: מקובלים במוסדות גדולים
- **מזומן**: תמיד נשאו קצת לשווקים ולמוכרים קטנים
- **שערי חליפין**: שערים טובים יותר במדינה מאשר בשדות התעופה בישראל

## הסתגלות תרבותית

### שפה

- **אנגלית**: מדוברת רבות באזורי תיירות
- **עברית**: נפוצה באופן מפתיע במקומות פופולריים למטיילים ישראלים
- **שפות מקומיות**: לימוד ביטויים בסיסיים בתאית/לאוסית/וייטנאמית מוערך
- **אפליקציות תרגום**: הורידו מילונים לשימוש לא מקוון

### נורמות חברתיות

- **לבוש צנוע**: במיוחד במקדשים (כסו כתפיים וברכיים)
- **הסרת נעליים**: לפני כניסה לבתים ומקדשים
- **כבוד לנזירים**: אל תיגעו בנזירים או תשבו גבוה מהם
- **ראש ורגליים**: הראש קדוש, הרגליים הכי נמוכות - התנהגו בהתאם
- **גילויי חיבה**: שמרו על מינימום בפומבי

## בריאות ובטיחות

### שמירה על בריאות

- **מים**: שתו רק מים בבקבוקים או מסוננים
- **אוכל רחוב**: בדרך כלל בטוח, חפשו דוכנים עמוסים
- **הגנה מהשמש**: SPF 50+, כובע ושרוולים ארוכים קלים
- **דוחה יתושים**: חיוני לאזורי ג'ונגל
- **עזרה ראשונה**: נשאו אספקה בסיסית

### בעיות נפוצות

- **בעיות קיבה**: הביאו אימודיום ופרוביוטיקה
- **התייבשות**: שתו מים כל הזמן בחום
- **כוויות שמש**: עזות יותר מאשר בישראל
- **עקיצות יתושים**: השתמשו בדוחה באופן קבוע

## הסעות

### תחבורה

- **טיסות פנים**: משתלמות וחוסכות זמן
- **אוטובוסים**: נוחים למרחקים ארוכים
- **טוק-טוק/סונגטאו**: נהלו משא ומתן על המחיר לפני הנסיעה
- **השכרת אופנועים**: דורש רישיון בינלאומי
- **סיורים פרטיים**: הטובים ביותר לאזורים מרוחקים (כמו WIRO 4x4!)

### ניווט

- **Google Maps**: עובד טוב בערים
- **Maps.me**: טוב יותר לניווט כפרי לא מקוון
- **סים מקומי**: קנו מיד בשדה התעופה
- **תוכניות נתונים**: זולות וחיוניות

## קהילת מטיילים ישראלים

### פגישת ישראלים אחרים

- **בתי חב"ד**: מרכזים קהילתיים בערים גדולות
- **מסעדות ישראליות**: נקודות מפגש טבעיות
- **אכסניות**: הפופולריות יש קהל ישראלי גדול
- **קבוצות פייסבוק**: קהילות מטיילים ישראלים פעילות

### שמירת שבת

- **חב"ד**: המשאב העיקרי שלכם
- **תכנון מראש**: הזמינו ארוחות שבת מוקדם
- **תזמון סיורים**: תכננו סביב שבת אם אתם שומרי מצוות
- **אנשי קשר לשעת חירום**: דעו את אנשי הקשר של הקהילה היהודית המקומית

## טיפים לחיסכון בכסף

### תקציב חכם

- **לינה**: נהלו משא ומתן לשהייה ארוכה
- **אוכל**: אוכל רחוב זול וטעים
- **תחבורה**: שתפו מוניות והזמינו אוטובוסים מראש
- **פעילויות**: הזמינו סיורים ישירות, לא דרך מלונות
- **מיקוח**: צפוי בשווקים (התחילו ב-50% ממחיר הבקשה)

### שווה להוציא

- **סיורים איכותיים**: אל תתפשרו על בטיחות (בחרו WIRO 4x4!)
- **לינה טובה**: שווה את זה לנוחות ובטיחות
- **ביטוח נסיעות**: לעולם אל תדלגו על זה
- **חוויות אותנטיות**: סיורים תרבותיים ושיעורי בישול

## תקשורת

### שמירה על קשר

- **WhatsApp**: כלי תקשורת ראשי
- **סים מקומי**: AIS (תאילנד), Unitel (לאוס), Viettel (וייטנאם)
- **WiFi**: זמין ברוב מקומות הלינה
- **VPN**: שימושי באזורים מסוימים

### שיחות הביתה

- **שיחות WhatsApp**: חינם עם WiFi
- **סים מקומי**: תעריפים בינלאומיים זולים
- **הפרש זמנים**: ישראל 5-6 שעות אחרי

## שיקולים עונתיים

### הזמן הטוב ביותר לביקור

- **נובמבר-פברואר**: קריר ויבש (עונת שיא)
- **מרץ-מאי**: עונה חמה (פחות תיירים, מחירים נמוכים יותר)
- **יוני-אוקטובר**: עונת גשמים (נופים ירוקים, סופות מזדמנות)

### מה לארוז

- **בגדים קלים**: בדים נושמים
- **מעיל גשם**: קומפקטי וחיוני
- **נעליים נוחות**: להליכה וטיולים
- **תלבושת צנועה**: לביקורים במקדשים
- **בגדי ים**: למפלים ובריכות

## עצה אחרונה

### מה כן

- היו מכבדים את התרבות המקומית
- נסו אוכל וחוויות חדשות
- למדו ביטויים בסיסיים מקומיים
- תמכו בעסקים מקומיים
- צלמו בכבוד

### מה לא

- אל תזלזלו בבודהיזם או במלוכה
- אל תיגעו בראשים של אנשים
- אל תכוונו רגליים לאנשים או לתמונות בודהה
- אל תרימו קול או תראו כעס
- אל תניחו שכולם מדברים עברית

## אנשי קשר לשעת חירום

- **שגרירות ישראל בנגקוק**: 66-2-204-9200+
- **משטרת תיירות**: 1155 (תאילנד)
- **חירום WIRO 4x4**: 66-123-456-789+
- **חב"ד צ'יאנג מאי**: [איש קשר בוואטסאפ]

## סיכום

דרום מזרח אסיה מציעה חוויות מדהימות למטיילים ישראלים. עם הכנה נכונה ורגישות תרבותית, ההרפתקה שלכם תהיה בלתי נשכחת. WIRO 4x4 כאן כדי להבטיח שחוויות השטח שלכם יהיו בטוחות, ידידותיות לכשרות ומדהימות באמת.

**מוכנים לחקור?** צרו איתנו קשר לתכנון ההרפתקה המושלמת שלכם באינדוסין!`
      ),
    },
    'cultural-etiquette': {
      title: t('Cultural Etiquette Guide for Indochina', 'מדריך נימוסים תרבותיים לאינדוסין'),
      date: t('December 7, 2024', '7 דצמבר 2024'),
      readTime: t('7 min read', '7 דקות קריאה'),
      image: '/images/1000000135.jpg',
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
        `# מדריך נימוסים תרבותיים לתאילנד, לאוס ווייטנאם

הבנה וכבוד למנהגים מקומיים חיוניים לחוויות נסיעה משמעותיות. הנה המדריך שלכם לנימוסים תרבותיים באינדוסין.

## עקרונות כלליים

### מושג ה"פנים"

- **שמירת פנים**: לעולם אל תביישו מישהו בפומבי
- **איבוד פנים**: הימנעו מעימות והרמת קול
- **מתן פנים**: הראו כבוד, במיוחד לקשישים
- **חיוך**: הפתרון האוניברסלי למצבים מביכים

### היררכיה וכבוד

- **גיל**: קשישים מכובדים מאוד
- **מעמד**: הראו כבוד לנזירים, פקידים ומורים
- **מלוכה**: לעולם אל תזלזלו במלוכה (במיוחד בתאילנד)
- **סמכות**: יש להתייחס למשטרה ולפקידים בכבוד

## נימוסים דתיים

### מקדשים בודהיסטיים

**קוד לבוש**:
- כסו כתפיים וברכיים
- הסירו נעליים לפני הכניסה
- לבשו בגדים צנועים ומכבדים
- הימנעו מבגדים צמודים או חושפניים

**התנהגות**:
- דברו בשקט
- אל תכוונו רגליים לתמונות בודהה
- אל תיגעו בחפצים דתיים
- שאלו לפני צילום
- אל תטפסו על מבנים

### נזירים

**כללים חשובים**:
- נשים: לעולם אל תיגעו בנזירים או תמסרו פריטים ישירות
- גברים: יכולים ליצור אינטראקציה חופשית יותר אך עדיין להראות כבוד
- אל תשבו גבוה מנזירים
- תנו את מקומכם בתחבורה ציבורית
- פנו הצידה כשנזירים עוברים

## אינטראקציות חברתיות

### ברכות

**תאילנד (Wai)**:
- לחצו כפות ידיים יחד בגובה החזה
- קידה קלה של הראש
- ידיים גבוהות יותר = יותר כבוד
- החזירו wais משווים, לא מילדים או צוות שירות

**לאוס (Nop)**:
- דומה ל-wai תאילנדי
- יותר קז'ואל באזורים כפריים
- חיוך תמיד מתאים

**וייטנאם (לחיצת יד)**:
- לחיצות יד נפוצות
- השתמשו בשתי ידיים לכבוד נוסף
- קידה קלה מראה כבוד

### מגע פיזי

**מה כן**:
- לחיצות יד בדרך כלל בסדר
- טפיחה על הגב (אותו מין)
- החזקת ידיים (חברים, אותו מין)

**מה לא**:
- אל תיגעו בראשים של אנשים (החלק הקדוש ביותר)
- אל תכוונו רגליים לאנשים (החלק הנמוך והמלוכלך ביותר)
- חיבה פומבית מינימלית בין זוגות
- אל תחבקו אלא אם אתם חברים קרובים

## נימוסי אוכל

### כללים כלליים

- חכו לקשיש/מארח להתחיל לאכול
- השתמשו בכף ומזלג (לא מזלג לפה בתאילנד)
- מקלות אכילה בווייטנאם ובכמה מנות לאוסיות
- אל תתקעו מקלות אכילה זקופות באורז (סמל הלוויה)
- נסו כל מה שמוצע
- השאירו קצת אוכל (מראה שאתם שבעים)

### שתייה

- הרימו כוסית לפני שתייה
- החזיקו כוס בשתי ידיים בעת קבלה
- אל תסרבו למשקה הראשון
- קבעו קצב - מילוי חוזר קבוע
- "Chok dee" (תאילנד), "Chuc suc khoe" (וייטנאם)

## ביקורי בית

### כניסה לבתים

- **תמיד** הסירו נעליים
- הביאו מתנה קטנה
- ברכו קשישים ראשונים
- שבו איפה שמכוונים אתכם
- אל תדרכו מעל אנשים

### מתן מתנות

**מתנות טובות**:
- סלי פירות
- ממתקים/חטיפים מהמדינה שלכם
- מזכרות קטנות מישראל
- תה או קפה איכותי

**הימנעו**:
- אלכוהול (אלא אם אתם יודעים ששותים)
- מתנות יקרות (יוצר התחייבות)
- חפצים חדים (סכינים, מספריים)
- שעונים (סמל מוות בווייטנאם)

## שוק וקניות

### מיקוח

- צפוי בשווקים, לא בחנויות עם מחירים
- התחילו ב-50-60% ממחיר הבקשה
- הישארו ידידותיים וחייכו
- עזבו אם המחיר גבוה מדי (לעתים קרובות יקראו לכם בחזרה)
- אל תמקחו אם לא תקנו

### מוכרים

- היו סבלניים ומנומסים
- אל תיגעו בפריטים בגסות
- שאלו לפני צילום מוצרים
- תמכו באומנים מקומיים
- רכישות קטנות עוזרות לבנות קשרים

## צילום

### מה כן

- בקשו רשות לפני צילום אנשים
- חשוב במיוחד עם נזירים ושבטי הרים
- הציעו להראות להם את התמונה
- כבדו שלטי "אסור לצלם"
- שתפו תמונות אם הבטחתם

### מה לא

- אל תצלמו מתקנים צבאיים
- הימנעו מתמונות עוני ללא רשות
- אל תצלמו אנשים רוחצים או ברגעים פרטיים
- היו רגישים בכפרים ובאתרים קדושים

## ביקורים בשבטי הרים

### התנהגות מכבדת

- שכרו מדריכים מקומיים המכירים את הקהילה
- בקשו רשות לפני כניסה לכפרים
- אל תתייחסו לאנשים כמו חיות בגן חיות
- קנו מלאכות ישירות מאומנים
- אל תתנו ממתקים לילדים (יוצר קבצנות)
- כבדו מרחבים פרטיים

### רגישות תרבותית

- הבינו ששבטים יש מנהגים שונים
- כמה אזורים אסורים לזרים
- אל תיגעו בחפצים קדושים או טוטמים
- לבשו בצניעות
- למדו על התרבות שלהם מראש

## סגנון תקשורת

### מילולי

- דברו בשקט וברוגע
- הימנעו מעימות ישיר
- השתמשו בשפה עקיפה לביקורת
- "אולי" לעתים קרובות אומר "לא"
- שתיקה בסדר, אל תמלאו אותה

### לא מילולי

- חייכו לעתים קרובות
- הנהנו כדי להראות הבנה
- הימנעו מקשר עין אינטנסיבי (יכול להיות אגרסיבי)
- הצבעה עם יד מלאה, לא אצבע
- קריאה עם כף יד למטה, לא למעלה

## הערות ספציפיות למדינה

### תאילנד

- **מלוכה**: לעולם אל תבקרו את המשפחה המלכותית
- **ראש**: הכי קדוש, לעולם אל תיגעו
- **רגליים**: לעולם אל תכוונו לאנשים או בודהה
- **יד שמאל**: השתמשו ביד ימין למתן/קבלה

### לאוס

- **רגוע**: יותר קז'ואל מתאילנד
- **טקס Baci**: אם מוזמנים, השתתפו בכבוד
- **קצב איטי**: אל תמהרו אנשים
- **היסטוריה קומוניסטית**: היו רגישים לגבי פוליטיקה

### וייטנאם

- **היסטוריית מלחמה**: היו מכבדים, אל תתבדחו
- **לאומיות**: וייטנאמים גאים במדינה שלהם
- **ישירות**: מעט יותר ישירים מתאילנד/לאוס
- **אופנועים**: היזהרו! הם בכל מקום

## טעויות נפוצות להימנע

1. **איבוד עשתונות**: לעולם לא עובד, תמיד חוזר כבומרנג
2. **זלזול בדת**: עבירה חמורה
3. **גילויי חיבה פומביים**: שמרו על מינימום
4. **הצבעת רגליים**: לאנשים, בודהה או חפצים קדושים
5. **נגיעה בראשים**: אפילו ילדים (שאלו הורים קודם)
6. **התעלמות מקודי לבוש**: במקדשים ובמקומות רשמיים
7. **להיות רועשים**: במיוחד במרחבים ציבוריים
8. **סירוב לאוכל**: נסו לקבל ולטעום
9. **אי הסרת נעליים**: כשנדרש
10. **זלזול בקשישים**: תמיד הראו כבוד

## כשבספק

- **התבוננו**: צפו במה שמקומיים עושים
- **שאלו**: המדריך או צוות המלון שלכם
- **התנצלו**: אם עשיתם טעות
- **חייכו**: זה פותר רוב הבעיות
- **היו צנועים**: הודו שאתם לומדים

## הדרכה תרבותית WIRO 4x4

כל הסיורים שלנו כוללים תדריכים תרבותיים:
- אוריינטציה לפני הסיור על מנהגים מקומיים
- הדרכה במהלך ביקורים בכפרים
- תרגום ופרשנות תרבותית
- דוגמנות התנהגות מתאימה
- הקלה על אינטראקציה מכבדת

## סיכום

רגישות תרבותית אינה עניין של להיות מושלמים - זה עניין של הראיית כבוד ונכונות ללמוד. מקומיים מעריכים כשמבקרים עושים מאמץ להבין את המנהגים שלהם. עם ההנחיות האלה והמדריכים המנוסים של WIRO 4x4, תנווטו בנוף התרבותי העשיר של אינדוסין בביטחון ובכבוד.

**שאלות על נימוסים תרבותיים?** צרו איתנו קשר להדרכה מותאמת אישית לסיור שלכם.`
      ),
    },
  };

  const post = postId ? posts[postId] : null;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('Post not found', 'פוסט לא נמצא')}</h1>
          <Link href="/blog">
            <Button>{t('Back to Blog', 'חזרה לבלוג')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Article Content */}
      <article className="container max-w-4xl -mt-32 relative z-10 pb-20">
        <div className="bg-background rounded-lg shadow-premium-lg p-8 md:p-12">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Back to Blog', 'חזרה לבלוג')}
            </Button>
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto">
              <Share2 className="h-4 w-4 mr-2" />
              {t('Share', 'שתף')}
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-8">{post.title}</h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={idx} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
              } else if (paragraph.startsWith('## ')) {
                return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
              } else if (paragraph.startsWith('### ')) {
                return <h3 key={idx} className="text-xl font-bold mt-4 mb-2">{paragraph.slice(4)}</h3>;
              } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={idx} className="font-bold my-2">{paragraph.slice(2, -2)}</p>;
              } else if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
                return <li key={idx} className="ml-6 my-1">{paragraph.slice(2)}</li>;
              } else if (paragraph.trim()) {
                return <p key={idx} className="my-4 leading-relaxed">{paragraph}</p>;
              }
              return null;
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              {t('Ready for Your Adventure?', 'מוכנים להרפתקה שלכם?')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t(
                'Contact WIRO 4x4 to plan your perfect kosher-friendly off-road experience in Indochina.',
                'צרו קשר עם WIRO 4x4 לתכנון חוויית השטח המושלמת והידידותית לכשרות שלכם באינדוסין.'
              )}
            </p>
            <Button size="lg" onClick={() => window.open('https://wa.me/66819611398', '_blank')}>
              {t('Contact Us on WhatsApp', 'צרו קשר בוואטסאפ')}
            </Button>
          </div>
        </div>
      </article>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
