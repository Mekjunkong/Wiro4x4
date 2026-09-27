/** FAQ content, shared so the server renders the same Q&A for crawlers. */
export interface FAQItem {
  id: string;
  questionEn: string;
  questionHe: string;
  answerEn: string;
  answerHe: string;
  category: "booking" | "tours" | "kosher" | "practical" | "safety";
}

export const FAQ_ITEMS: readonly FAQItem[] = [
  {
    id: "booking-process",
    category: "booking",
    questionEn: "How do I book a tour with WIRO 4x4?",
    questionHe: "איך אני מזמין טיול עם WIRO 4x4?",
    answerEn:
      "Booking is easy! You can use our online booking form, send us a message on WhatsApp, or email us directly. We recommend booking at least 48 hours in advance to secure your preferred date and tour. For peak season (November-February), we suggest booking 1-2 weeks ahead.",
    answerHe:
      "ההזמנה קלה! ניתן להשתמש בטופס ההזמנה המקוון שלנו, לשלוח לנו הודעה בוואטסאפ, או לשלוח לנו מייל ישירות. אנו ממליצים להזמין לפחות 48 שעות מראש כדי להבטיח את התאריך והטיול המועדפים עליכם. בעונת השיא (נובמבר-פברואר), אנו מציעים להזמין 1-2 שבועות מראש.",
  },
  {
    id: "cancellation-policy",
    category: "booking",
    questionEn: "What is your cancellation policy?",
    questionHe: "מהי מדיניות הביטול שלכם?",
    answerEn:
      "We offer free cancellation up to 48 hours before the tour start time. Cancellations within 24-48 hours receive a 50% refund. Cancellations less than 24 hours before the tour are non-refundable. In case of severe weather, we will reschedule at no extra cost.",
    answerHe:
      "אנו מציעים ביטול חינם עד 48 שעות לפני מועד תחילת הטיול. ביטולים בין 24 ל-48 שעות מקבלים החזר של 50%. ביטולים פחות מ-24 שעות לפני הטיול אינם ניתנים להחזר. במקרה של מזג אוויר קיצוני, נתזמן מחדש ללא עלות נוספת.",
  },
  {
    id: "payment-methods",
    category: "booking",
    questionEn: "What payment methods do you accept?",
    questionHe: "אילו אמצעי תשלום אתם מקבלים?",
    answerEn:
      "We accept bank transfers, cash (Thai Baht, US Dollars, Israeli Shekels), and major credit cards. A 30% deposit is required to confirm your booking, with the remaining balance due on the day of the tour. We will send you payment details after your booking is confirmed.",
    answerHe:
      "אנו מקבלים העברות בנקאיות, מזומן (באט תאילנדי, דולר אמריקאי, שקל ישראלי), וכרטיסי אשראי מרכזיים. נדרשת מקדמה של 30% לאישור ההזמנה, כאשר היתרה משולמת ביום הטיול. נשלח לכם פרטי תשלום לאחר אישור ההזמנה.",
  },
  {
    id: "kosher-food",
    category: "kosher",
    questionEn: "What kosher food options are available during tours?",
    questionHe: "אילו אפשרויות אוכל כשר זמינות במהלך הטיולים?",
    answerEn:
      "Kosher-friendly meal planning is available on all tours. Depending on route and advance notice, options may include packed kosher meals and, when available, meals from local providers you can review in advance. Share your kosher level before booking and we will confirm what is feasible for your itinerary.",
    answerHe:
      "תכנון אוכל ידידותי לכשרות זמין בכל הטיולים. בהתאם למסלול ולהודעה מראש, האפשרויות יכולות לכלול ארוחות כשרות ארוזות, ובכפוף לזמינות, ארוחות מספקים מקומיים שתוכלו לבדוק מראש. שתפו את רמת הכשרות לפני ההזמנה ונאשר מה אפשרי למסלול שלכם.",
  },
  {
    id: "shabbat-observance",
    category: "kosher",
    questionEn: "How do you handle Shabbat observance during multi-day trips?",
    questionHe: "איך אתם מתמודדים עם שמירת שבת בטיולים רב-יומיים?",
    answerEn:
      "When requested, we plan multi-day itineraries to support Shabbat observance. Trips can include a Shabbat hotel stop, and we help coordinate timing, accommodation options, and meal planning based on availability. For Shabbat-observant itineraries, no driving or activities are scheduled during Shabbat hours.",
    answerHe:
      "כשמבקשים זאת מראש, אנו מתכננים מסלולים רב-יומיים שמתחשבים בשמירת שבת. אפשר לשלב עצירה במלון לשבת, ואנו עוזרים לתאם זמנים, אפשרויות לינה ותכנון ארוחות לפי זמינות. במסלולים לשומרי שבת לא מתוכננות נסיעות או פעילויות בשעות השבת.",
  },
  {
    id: "hebrew-guide",
    category: "tours",
    questionEn: "Do you offer Hebrew-speaking guides?",
    questionHe: "האם אתם מציעים מדריכים דוברי עברית?",
    answerEn:
      "Yes. Our founder Wiro speaks fluent Hebrew and is the primary guide on many tours. Hebrew guidance helps with clear communication and cultural context throughout the day. If Hebrew support is essential for your dates, confirm guide availability with us before booking.",
    answerHe:
      "כן. המייסד שלנו וירו דובר עברית שוטפת והוא המדריך הראשי בחלק גדול מהטיולים. הדרכה בעברית עוזרת לתקשורת ברורה ולהבנת ההקשר המקומי לאורך היום. אם תמיכה בעברית חיונית לתאריכים שלכם, כדאי לאשר זמינות מדריך לפני ההזמנה.",
  },
  {
    id: "group-sizes",
    category: "tours",
    questionEn: "What group sizes do you accommodate?",
    questionHe: "לאילו גדלי קבוצות אתם מתאימים?",
    answerEn:
      "Our standard tours accommodate groups of 1-6 people per vehicle. For larger groups (7+), we can arrange multiple vehicles and provide a custom quote. We also offer private tours for couples, families, and solo travelers. The intimate group size ensures a personalized experience and more flexibility during the tour.",
    answerHe:
      "הטיולים הרגילים שלנו מתאימים לקבוצות של 1-6 אנשים לרכב. לקבוצות גדולות יותר (7+), אנו יכולים לסדר מספר רכבים ולספק הצעת מחיר מותאמת. אנו גם מציעים טיולים פרטיים לזוגות, משפחות ומטיילים יחידים. גודל הקבוצה האינטימי מבטיח חוויה אישית וגמישות רבה יותר במהלך הטיול.",
  },
  {
    id: "children-welcome",
    category: "tours",
    questionEn: "Are children welcome on tours? What are the age policies?",
    questionHe: "האם ילדים מתקבלים בטיולים? מהן מדיניות הגילאים?",
    answerEn:
      "Absolutely! Children of all ages are welcome. Children under 3 ride free, ages 3-10 receive a 50% discount, and children 11+ are charged the full adult rate. We have child-safe seat belts in all vehicles, and our guides are experienced with family groups. Some tours are better suited for families - just ask us for recommendations.",
    answerHe:
      "בהחלט! ילדים בכל הגילאים מתקבלים בברכה. ילדים מתחת לגיל 3 נוסעים בחינם, גילאי 3-10 מקבלים הנחה של 50%, וילדים מגיל 11+ משלמים מחיר מבוגר מלא. יש לנו חגורות בטיחות מותאמות לילדים בכל הרכבים, והמדריכים שלנו מנוסים עם קבוצות משפחתיות. חלק מהטיולים מתאימים יותר למשפחות - פשוט שאלו אותנו להמלצות.",
  },
  {
    id: "what-to-bring",
    category: "practical",
    questionEn: "What should I bring on a tour?",
    questionHe: "מה כדאי להביא לטיול?",
    answerEn:
      "We recommend bringing: comfortable hiking shoes or sandals with grip, sunscreen (SPF 50+), insect repellent, a hat or cap, a light rain jacket (especially during rainy season May-October), a refillable water bottle, a camera, and any personal medications. We provide drinking water and snacks on all tours.",
    answerHe:
      "אנו ממליצים להביא: נעלי הליכה נוחות או סנדלים עם אחיזה, קרם הגנה (SPF 50+), דוחה חרקים, כובע או מצחייה, מעיל גשם קל (במיוחד בעונת הגשמים מאי-אוקטובר), בקבוק מים למילוי חוזר, מצלמה, ותרופות אישיות. אנו מספקים מי שתייה וחטיפים בכל הטיולים.",
  },
  {
    id: "weather-conditions",
    category: "practical",
    questionEn:
      "What is the best time to visit Chiang Mai? How does weather affect tours?",
    questionHe:
      "מהו הזמן הטוב ביותר לבקר בצ'יאנג מאי? איך מזג האוויר משפיע על הטיולים?",
    answerEn:
      "The best season is November to February (cool and dry, 15-30°C). March to May is hot season (up to 40°C). June to October is rainy season - off-road trails can be muddier but the waterfalls are spectacular! We operate year-round and adjust routes based on conditions. If severe weather makes a tour unsafe, we will reschedule at no extra cost.",
    answerHe:
      "העונה הטובה ביותר היא נובמבר עד פברואר (קריר ויבש, 15-30 מעלות). מרץ עד מאי הוא עונה חמה (עד 40 מעלות). יוני עד אוקטובר הוא עונת הגשמים - שבילי השטח יכולים להיות בוציים יותר אבל המפלים מרהיבים! אנו פועלים כל השנה ומתאימים מסלולים לפי התנאים. אם מזג אוויר קיצוני הופך טיול ללא בטוח, נתזמן מחדש ללא עלות נוספת.",
  },
  {
    id: "accessibility",
    category: "practical",
    questionEn: "Are your tours accessible for people with limited mobility?",
    questionHe: "האם הטיולים שלכם נגישים לאנשים עם מוגבלות בניידות?",
    answerEn:
      "We do our best to accommodate guests with limited mobility. Our 4x4 vehicles have high clearance and step assists. Some tours involve moderate walking on uneven terrain, but we can customize itineraries to reduce walking distances. Please let us know about any mobility needs when booking so we can plan the best experience for you.",
    answerHe:
      "אנו עושים כמיטב יכולתנו להתאים את הטיולים לאורחים עם מוגבלות בניידות. לרכבי השטח שלנו יש גובה מרווח ומדרגות עזר. חלק מהטיולים כוללים הליכה מתונה בשטח לא אחיד, אבל אנו יכולים להתאים מסלולים כדי לצמצם מרחקי הליכה. אנא הודיעו לנו על כל צורך בנגישות בעת ההזמנה כדי שנוכל לתכנן את החוויה הטובה ביותר עבורכם.",
  },
  {
    id: "transport-pickup",
    category: "practical",
    questionEn: "Do you provide hotel pickup and drop-off?",
    questionHe: "האם אתם מספקים איסוף והחזרה מהמלון?",
    answerEn:
      "Yes! All our tours include complimentary pickup and drop-off from your hotel or accommodation in Chiang Mai city center and most surrounding areas. Pickup is typically between 7:00-8:00 AM depending on the tour. For accommodations outside the standard pickup zone, we can arrange transport for a small additional fee.",
    answerHe:
      "כן! כל הטיולים שלנו כוללים איסוף והחזרה חינם מהמלון או מקום הלינה שלכם במרכז העיר צ'יאנג מאי ורוב האזורים הסובבים. האיסוף הוא בדרך כלל בין 7:00-8:00 בבוקר בהתאם לטיול. ללינה מחוץ לאזור האיסוף הרגיל, אנו יכולים לסדר הסעה בתוספת תשלום קטנה.",
  },
  {
    id: "safety-measures",
    category: "safety",
    questionEn: "What safety measures do you have in place?",
    questionHe: "אילו אמצעי בטיחות יש לכם?",
    answerEn:
      "Safety is a core operating priority for our team. Our 4x4 vehicles are maintained on a regular schedule, and our drivers are experienced in the routes they operate. We carry first-aid kits, emergency communication tools, and drinking water on each tour, and we provide a safety briefing before departure. Passenger insurance details are shared during booking confirmation.",
    answerHe:
      "הבטיחות היא עיקרון תפעולי מרכזי אצלנו. רכבי ה-4x4 עוברים תחזוקה שוטפת, והנהגים שלנו מנוסים במסלולים שהם מפעילים. בכל טיול אנו נושאים ערכות עזרה ראשונה, אמצעי תקשורת חירום ומי שתייה, ומעבירים תדריך בטיחות לפני היציאה. פרטי הביטוח לנוסעים נמסרים בשלב אישור ההזמנה.",
  },
  {
    id: "custom-tours",
    category: "tours",
    questionEn: "Can I create a custom tour itinerary?",
    questionHe: "האם אפשר ליצור מסלול טיול מותאם אישית?",
    answerEn:
      "Absolutely! We love creating custom itineraries tailored to your interests, fitness level, and schedule. Whether you want to focus on temples, nature, local villages, food experiences, or a mix of everything - we can design the perfect tour for you. Custom tours can be single-day or multi-day. Contact us with your preferences and we will prepare a personalized proposal.",
    answerHe:
      "בהחלט! אנו אוהבים ליצור מסלולים מותאמים אישית להתאמה לתחומי העניין, רמת הכושר ולוח הזמנים שלכם. בין אם אתם רוצים להתמקד במקדשים, טבע, כפרים מקומיים, חוויות אוכל, או שילוב של הכל - אנו יכולים לעצב את הטיול המושלם עבורכם. טיולים מותאמים אישית יכולים להיות ליום אחד או למספר ימים. צרו איתנו קשר עם ההעדפות שלכם ונכין הצעה אישית.",
  },
];
