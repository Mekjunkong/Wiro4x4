import { WIRO_TOUR_CATALOG } from "../shared/wiroTourCatalog";

export type BookingLanguage = "en" | "he";
export type BookingFieldKey = "tour" | "date" | "group" | "pickup" | "kosher";

export type BookingFields = Record<
  `has${Capitalize<BookingFieldKey>}`,
  boolean
>;

export interface LeviBookingState {
  intent: "general" | "booking";
  fields: BookingFields;
  details: Partial<Record<BookingFieldKey, string>>;
  missingKeys: BookingFieldKey[];
  missingLabels: string[];
  completionPercent: number;
  qualified: boolean;
}

export const BOOKING_FIELD_LABELS: Record<
  BookingLanguage,
  Record<BookingFieldKey, string>
> = {
  en: {
    tour: "tour or route idea",
    date: "preferred date/date range",
    group: "group size, adults, children and kids ages if any",
    pickup: "hotel or pickup area in Chiang Mai",
    kosher: "kosher/Shabbat/Hebrew guide needs",
  },
  he: {
    tour: "מסלול או רעיון לטיול",
    date: "תאריך או טווח תאריכים מועדף",
    group: "מספר משתתפים, מבוגרים, ילדים וגילאי הילדים אם יש",
    pickup: "מלון או אזור איסוף בצ׳יאנג מאי",
    kosher: "צרכי כשרות, שבת או מדריך בעברית",
  },
};

export function normalizeBookingLanguage(
  language: string | undefined
): BookingLanguage {
  return language?.toLowerCase().startsWith("he") ? "he" : "en";
}

export function shouldEscalate(message: string): boolean {
  const lower = message.toLowerCase();
  return [
    "book",
    "booking",
    "reserve",
    "available",
    "availability",
    "price",
    "how much",
    "cost",
    "quote",
    "deposit",
    "payment",
    "whatsapp",
    "confirm",
    "speak to",
    "human",
    "להזמין",
    "הזמנה",
    "פנוי",
    "פנויה",
    "זמין",
    "זמינה",
    "זמינות",
    "מחיר",
    "כמה עולה",
    "עלות",
    "הצעת מחיר",
    "תשלום",
    "לאשר",
    "נציג",
  ].some(keyword => lower.includes(keyword));
}

export function getConversationBookingText(
  messages: Array<{ role: string; content: string }>,
  latestMessage: string
): string {
  const userMessages = messages
    .filter(msg => msg.role === "user" && typeof msg.content === "string")
    .map(msg => msg.content.trim())
    .filter(Boolean);

  if (!userMessages.includes(latestMessage)) userMessages.push(latestMessage);
  return userMessages.join("\n");
}

export function getBookingFields(message: string): BookingFields {
  const lower = message.toLowerCase();
  const hasDate =
    /\b\d{4}-\d{2}-\d{2}\b/.test(message) ||
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(message) ||
    /\b(?:today|tomorrow|tonight|next week|this week|next month|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(
      message
    ) ||
    /(?:היום|מחר|הלילה|השבוע|שבוע הבא|חודש הבא|תאריך|ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר|ראשון|שני|שלישי|רביעי|חמישי|שישי)/.test(
      message
    );
  const mentionsChildren =
    /\b(?:kids?|children)\b/i.test(message) || /(?:ילדים|ילד)/.test(message);
  const hasChildAges =
    /(?:\b\d+\s*)?(?:kids?|children)\s*(?:are\s*)?(?:aged?|ages?)?\s*[:\-]?\s*\d{1,2}(?:\s*(?:,|and|&|-)\s*\d{1,2})*/i.test(
      message
    ) ||
    /(?:ילדים|ילד)\s*(?:בגיל(?:אי)?\s*)?\d{1,2}(?:\s*(?:,|ו|-)\s*\d{1,2})*/.test(
      message
    );
  const hasGroupSize =
    /\b\d+\s*(?:pax|people|persons|adults|adult|kids|children|child|guests|travelers|travellers)\b/i.test(
      message
    ) ||
    /(?:couple|family|families|group|solo|alone)/i.test(message) ||
    /\d+\s*(?:אנשים|איש|מטיילים|מבוגרים|ילדים|ילד|נפשות)/.test(message) ||
    /(?:זוג|משפחה|קבוצה|לבד)/.test(message);
  // A child changes the quote, so do not treat a group as complete until the
  // visitor supplies each child's age. Adults-only groups remain valid.
  const hasGroup = hasGroupSize && (!mentionsChildren || hasChildAges);
  const hasTour = [
    ...WIRO_TOUR_CATALOG.flatMap(tour => [tour.slug, tour.name]),
    "inthanon",
    "doi suthep",
    "mae kampong",
    "sticky",
    "mae wang",
    "samoeng",
    "pai",
    "chiang rai",
    "golden triangle",
    "waterfall",
    "jungle",
    "elephant",
    "off-road",
    "off road",
    "4x4",
    "day tour",
    "טיול",
    "טיול יום",
    "מסלול",
    "ג׳יפים",
    "ג'יפים",
    "צאנג",
    "צ'אנג",
    "מפלים",
    "דוי",
    "פאי",
  ].some(keyword => lower.includes(keyword.toLowerCase()));
  const hasPickup =
    /\b(?:hotel|pickup|pick up|pick-up|old city|nimman|airport|chiang mai gate|night bazaar|chang klan|mae rim|hang dong|san sai)\b/i.test(
      message
    ) ||
    /(?:מלון|איסוף|אזור|שדה התעופה|עיר העתיקה|ניממן|צ׳יאנג מאי|צ'יאנג מאי)/.test(
      message
    );
  const hasKosher =
    /\b(?:kosher|shabbat|sabbath|hebrew guide|hebrew-speaking|hebrew speaking|jewish|israeli|no kosher|not kosher)\b/i.test(
      message
    ) ||
    /(?:כשר|כשרות|שבת|עברית|מדריך בעברית|ישראלים|יהודים|לא צריך כשר)/.test(
      message
    );

  return { hasTour, hasDate, hasGroup, hasPickup, hasKosher };
}

function getMissingKeys(fields: BookingFields): BookingFieldKey[] {
  const missing: BookingFieldKey[] = [];
  if (!fields.hasTour) missing.push("tour");
  if (!fields.hasDate) missing.push("date");
  if (!fields.hasGroup) missing.push("group");
  if (!fields.hasPickup) missing.push("pickup");
  if (!fields.hasKosher) missing.push("kosher");
  return missing;
}

export function getMissingBookingFields(
  message: string,
  language?: string
): string[] {
  const lang = normalizeBookingLanguage(language);
  const fields = getBookingFields(message);
  return getMissingKeys(fields).map(key => BOOKING_FIELD_LABELS[lang][key]);
}

function findTourDetail(message: string): string | undefined {
  const lower = message.toLowerCase();
  const aliases: Array<[string, string]> = [
    ["inthanon", "Doi Inthanon"],
    ["אינתנון", "Doi Inthanon"],
    ["mae kampong", "Mae Kampong"],
    ["קמפונג", "Mae Kampong"],
    ["sticky", "Maerim & Sticky Waterfalls"],
    ["מפלים דביקים", "Maerim & Sticky Waterfalls"],
    ["doi suthep", "Doi Suthep-Pui"],
    ["סוטפ", "Doi Suthep-Pui"],
    ["mae wang", "Mae Wang"],
    ["מאה וואנג", "Mae Wang"],
    ["samoeng", "Samoeng Loop"],
    ["סמואנג", "Samoeng Loop"],
  ];
  return aliases.find(([alias]) => lower.includes(alias))?.[1];
}

function findMatchedDetail(
  message: string,
  pattern: RegExp
): string | undefined {
  return message.match(pattern)?.[0]?.trim().slice(0, 100);
}

function findGroupDetail(message: string): string | undefined {
  const parts = [
    ...(message.match(
      /\b\d+\s*(?:pax|people|persons|adults?|kids?|children|guests?|travelers?|travellers?)\b/gi
    ) ?? []),
    ...(message.match(/\d+\s*(?:אנשים|איש|מטיילים|מבוגרים|ילדים|ילד|נפשות)/g) ??
      []),
    ...(message.match(/(?:children|kids)\s+aged?\s+[\d, and-]+/gi) ?? []),
    ...(message.match(/(?:ילדים|ילד)\s+בגיל(?:אי)?\s+[\d, ו-]+/g) ?? []),
  ];
  return parts.length > 0
    ? Array.from(new Set(parts)).join(", ").slice(0, 140)
    : undefined;
}

function findPickupDetail(message: string): string | undefined {
  return findMatchedDetail(
    message,
    /(?:nimman|old city|airport|night bazaar|chang klan|mae rim|hang dong|san sai|chiang mai gate|ניממן|עיר העתיקה|שדה התעופה|צ׳יאנג מאי|צ'יאנג מאי)/i
  );
}

function findKosherDetail(message: string): string | undefined {
  const matches = message.match(
    /(?:kosher|shabbat|sabbath|hebrew guide|hebrew-speaking|hebrew speaking|no kosher|not kosher|כשר|כשרות|שבת|מדריך בעברית|לא צריך כשר)/gi
  );
  return matches
    ? Array.from(new Set(matches)).join(", ").slice(0, 120)
    : undefined;
}

export function buildBookingState(
  message: string,
  language?: string
): LeviBookingState {
  const lang = normalizeBookingLanguage(language);
  const fields = getBookingFields(message);
  const missingKeys = getMissingKeys(fields);
  const knownCount = 5 - missingKeys.length;
  const bookingIntent = shouldEscalate(message) || knownCount >= 3;
  const details: LeviBookingState["details"] = {};

  if (fields.hasTour) details.tour = findTourDetail(message) ?? "Provided";
  if (fields.hasDate) {
    details.date =
      findMatchedDetail(
        message,
        /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|today|tomorrow|next week|this week|next month)\b/i
      ) ?? "Provided";
  }
  if (fields.hasGroup) {
    details.group = findGroupDetail(message) ?? "Provided";
  }
  if (fields.hasPickup)
    details.pickup = findPickupDetail(message) ?? "Provided";
  if (fields.hasKosher)
    details.kosher = findKosherDetail(message) ?? "Provided";

  return {
    intent: bookingIntent ? "booking" : "general",
    fields,
    details,
    missingKeys,
    missingLabels: missingKeys.map(key => BOOKING_FIELD_LABELS[lang][key]),
    completionPercent: knownCount * 20,
    qualified: bookingIntent && missingKeys.length === 0,
  };
}

export function buildBookingStateSummary(
  state: LeviBookingState,
  language?: string
): string {
  const lang = normalizeBookingLanguage(language);
  const provided = (Object.keys(state.details) as BookingFieldKey[])
    .map(key => `${BOOKING_FIELD_LABELS[lang][key]}: ${state.details[key]}`)
    .join("; ");
  const missing = state.missingLabels.join(", ");

  if (lang === "he") {
    return [
      provided ? `פרטים שנאספו: ${provided}` : "עדיין לא נאספו פרטי הזמנה",
      missing ? `פרטים חסרים: ${missing}` : "כל פרטי ההזמנה הבסיסיים נאספו",
    ].join("\n");
  }

  return [
    provided
      ? `Collected details: ${provided}`
      : "No booking details collected yet",
    missing
      ? `Missing details: ${missing}`
      : "All minimum booking details collected",
  ].join("\n");
}

export function shouldSendOwnerAlert(
  current: LeviBookingState,
  previous: LeviBookingState | null
): "new" | "progress" | "qualified" | null {
  // WhatsApp stays available throughout the conversation, but owner Telegram
  // alerts are reserved for completed booking profiles. This avoids turning a
  // simple price question into an interrupting lead notification.
  if (current.qualified && !previous?.qualified) return "qualified";
  return null;
}
