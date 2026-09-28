/**
 * The five WIRO services shown in the homepage 3D carousel.
 * Copy restored from the pre-redesign ServiceBanners cover flow.
 * Every text field is [English, Hebrew].
 */
type Bi = [string, string];

export interface WiroService {
  id: string;
  /** Stem under /images/optimized (see `photo()` in wiroTours). */
  image: string;
  badge: Bi;
  label: Bi;
  audience: Bi;
  summary: Bi;
  heading: Bi;
  subheading: Bi;
  bullets: Bi[];
  cta: Bi;
  href: string;
}

export const WIRO_SERVICES: WiroService[] = [
  {
    id: "organized-groups",
    image: "tour_group_photo",
    badge: ["Groups", "קבוצות"],
    label: ["Organized trips & groups", "טיולים מאורגנים וקבוצות"],
    audience: ["For travel agents and companies", "לסוכני נסיעות ולחברות"],
    summary: [
      "Tailor-made journeys across Thailand and East Asia.",
      "מסעות בהתאמה אישית בתאילנד ובמזרח אסיה.",
    ],
    heading: [
      "Fully customized group trips — from Thailand to all of East Asia",
      "טיולים בהתאמה אישית — מתאילנד ועד מזרח אסיה",
    ],
    subheading: [
      "25 years of experience building and executing tour plans on the ground for travel agents and companies from Israel. End-to-end service.",
      "25 שנות ניסיון בתכנון ובהפקת טיולים בשטח עבור סוכני נסיעות וחברות מישראל. שירות מקצה לקצה.",
    ],
    bullets: [
      [
        "Customized itineraries in Thailand, Vietnam, Laos, Japan, Cambodia and India",
        "מסלולים בהתאמה אישית בתאילנד, וייטנאם, לאוס, יפן, קמבודיה והודו",
      ],
      [
        "Flights, hotels and kosher food coordinated; private chef option available",
        "אנחנו מתאמים טיסות, מלונות ואוכל כשר, עם אפשרות לשף פרטי",
      ],
      [
        "Hebrew and English speaking guides throughout the trip",
        "מדריכים דוברי עברית ואנגלית לאורך הטיול",
      ],
      [
        "Close support for the organizer, from planning to return home",
        "ליווי צמוד למארגן הקבוצה, מהתכנון ועד החזרה הביתה",
      ],
    ],
    cta: [
      "Let's customize a trip for your group",
      "בואו נתכנן טיול לקבוצה שלכם",
    ],
    href: "/contact?subject=group_booking",
  },
  {
    id: "private-tours",
    image: "couple_with_4x4",
    badge: ["Private", "טיול פרטי"],
    label: ["Your Private Tours", "הטיול הפרטי שלכם"],
    audience: ["4x4 or van, fully customized", "ברכב שטח או בוואן"],
    summary: [
      "Your people. Your pace. A route made just for you.",
      "האנשים שלכם. הקצב שלכם. מסלול שנבנה בשבילכם.",
    ],
    heading: [
      "Private 4x4 or van tours, fully customized to you",
      "טיולים פרטיים ברכב שטח או בוואן, בהתאמה אישית",
    ],
    subheading: [
      "Authentic, extreme, relaxed, hidden, adventurous? You decide.",
      "אותנטי, אתגרי, רגוע, נסתר או מלא הרפתקאות? אתם מחליטים.",
    ],
    bullets: [
      [
        "Every trip is personally planned — no two trips are the same",
        "כל טיול מתוכנן אישית — אין שני טיולים זהים",
      ],
      [
        "Private vehicle with a driver, or the option to drive independently",
        "רכב פרטי עם נהג, או אפשרות לנהיגה עצמית",
      ],
      [
        "Private chef option and kosher food throughout the route",
        "אפשרות לשף פרטי ואוכל כשר לאורך המסלול",
      ],
      [
        "Hotels, pace and activities to match your family or group",
        "מלונות, קצב ופעילויות שמתאימים למשפחה או לקבוצה שלכם",
      ],
    ],
    cta: ["Plan your own private trip", "בואו נתכנן את הטיול הפרטי שלכם"],
    href: "/tours",
  },
  {
    id: "motorcycle-tours",
    // AI-generated service illustration; not a photograph of WIRO guests.
    image: "motorcycle-touring-illustration",
    badge: ["Motorcycle", "אופנועים"],
    label: ["Motorcycle Tours in the North", "טיולי אופנועים בצפון"],
    audience: ["For groups, minimum 5 riders", "לקבוצות של 5 רוכבים ומעלה"],
    summary: [
      "Winding mountain roads. Open skies. Ride together.",
      "כבישים מתפתלים, שמיים פתוחים וחוויית רכיבה משותפת.",
    ],
    heading: [
      "The most beautiful riding roads in the world — Northern Thailand's mountains, for a real group of riders",
      "כבישי הרכיבה היפים בעולם — בהרי צפון תאילנד, עם קבוצת הרוכבים שלכם",
    ],
    subheading: [
      "Organized motorcycle tours in Northern Thailand for groups (minimum 5 riders).",
      "טיולי אופנועים מאורגנים בצפון תאילנד לקבוצות של 5 רוכבים ומעלה.",
    ],
    bullets: [
      [
        "An iconic loop with 1,864 turns, rainforests, rice terraces, villages and waterfalls",
        "מסלול אגדי עם 1,864 פיתולים, יערות גשם, טרסות אורז, כפרים ומפלים",
      ],
      [
        "Selected hotels adapted for groups of 5+ riders",
        "מלונות נבחרים המותאמים לקבוצות רוכבים",
      ],
      [
        "Close escort throughout, with a support vehicle for equipment",
        "ליווי צמוד לאורך הדרך, כולל רכב תמיכה לציוד",
      ],
      [
        "Optional chef, kosher menu, riding lessons, equipment and professional riding guide",
        "לבחירתכם: שף פרטי, תפריט כשר, שיעורי רכיבה, ציוד ומדריך רכיבה מקצועי",
      ],
    ],
    cta: [
      "Assemble a group — we'll plan the route",
      "אתם מביאים קבוצה — אנחנו מתכננים מסלול",
    ],
    href: "/motorcycle-tours",
  },
  {
    id: "off-road",
    image: "offroad_trail_driving",
    badge: ["Off-road", "שטח 4x4"],
    label: ["True Off-Road Experience", "חוויית שטח אמיתית"],
    audience: [
      "For families or groups, with a self-drive 4x4 option",
      "לזוגות, למשפחות ולקבוצות, עם אפשרות לנהיגה עצמית",
    ],
    summary: [
      "Beyond the paved road, into the heart of the North.",
      "מעבר לכביש הסלול, אל הלב הפראי של הצפון.",
    ],
    heading: [
      "A real off-road trip in the heart of the North — with or without a steering wheel in your hands",
      "טיול שטח אמיתי בלב הצפון — עם ההגה בידיים שלכם או בלעדיו",
    ],
    subheading: [
      "4x4 routes for couples, families and groups, with an exclusive self-driving option.",
      "מסלולי שטח לזוגות, למשפחות ולקבוצות, עם אפשרות מיוחדת לנהיגה עצמית.",
    ],
    bullets: [
      [
        "25 years planning northern off-road routes — Pai, Chiang Rai, Doi Inthanon and more",
        "25 שנות ניסיון בתכנון מסלולי שטח בצפון — פאי, צ׳יאנג ראי, דוי אינתנון ועוד",
      ],
      [
        "Self-drive 4x4 vehicles with close escort",
        "רכבי שטח לנהיגה עצמית עם ליווי צמוד",
      ],
      [
        "Private chef option, hotels and a kosher menu along the route",
        "אפשרות לשף פרטי, מלונות ותפריט כשר לאורך המסלול",
      ],
      [
        "All the planning is on us — just bring the adrenaline",
        "כל התכנון עלינו — אתם רק מביאים את האדרנלין",
      ],
    ],
    cta: [
      "Plan a real 4x4 trip in the North",
      "בואו נתכנן טיול שטח אמיתי בצפון",
    ],
    href: "/tours",
  },
  {
    id: "car-rental",
    image: "vehicle_fleet_jungle",
    badge: ["Car rental", "השכרת רכב"],
    label: ["Car Rental in Chiang Mai", "השכרת רכב בצ׳יאנג מאי"],
    audience: ["Travel in your own flow", "לגלות את הצפון בקצב שלכם"],
    summary: [
      "Pick up the keys. Discover the North at your own pace.",
      "המפתחות אצלכם. הצפון מחכה שתגלו אותו.",
    ],
    heading: [
      "Car rental in the North — move freely, at your own pace",
      "השכרת רכב בצפון — חופש לנוע בקצב שלכם",
    ],
    subheading: [
      "Private car rental for independent trips in Northern Thailand — service, maintenance, reliability and integrity guaranteed.",
      "השכרת רכב לטיולים עצמאיים בצפון תאילנד, עם שירות, תחזוקה, אמינות ויושרה.",
    ],
    bullets: [
      [
        "A range of vehicles for independent rental in the northern region",
        "מגוון רכבים להשכרה עצמאית באזור הצפון",
      ],
      ["Convenient online booking", "הזמנה נוחה באינטרנט"],
      [
        "Consult our team on your itinerary",
        "אפשרות להתייעץ עם הצוות שלנו על המסלול",
      ],
      [
        "Backup and availability throughout your rental",
        "גיבוי וזמינות לאורך תקופת ההשכרה",
      ],
    ],
    cta: ["Book a car", "להזמנת רכב"],
    href: "/car-rental",
  },
];
