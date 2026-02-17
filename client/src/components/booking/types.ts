/** Shared types and constants for booking form sub-components. */

export type FormData = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
  agentName: string;
  arrivalDate: string;
  departureDate: string;
  numberOfAdults: number;
  hasChildren: boolean;
  numberOfChildren: number;
  childrenAges: string;
  includesHotels: boolean;
  hotelPreferences: string;
  includesGuide: boolean;
  includesTrip: boolean;
  includesAttractions: boolean;
  selectedAttractions: string[];
  includesFood: boolean;
  foodPreferences: string;
  needsShabbatHotel: boolean;
  shabbatHotel: string;
  pickupPoint: string;
  customPickupLocation: string;
  dropoffPoint: string;
  customDropoffLocation: string;
  suggestedDestinations: string[];
  specialRequests: string;
  budget: string;
  selfDriving4x4: boolean;
};

export type FormStepProps = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formErrors: Record<string, string>;
  isHebrew: boolean;
  t: (en: string, he: string) => string;
};

export const DESTINATIONS = [
  { id: "pai", en: "Pai", he: "פאי" },
  { id: "chiang-rai", en: "Chiang Rai", he: "צ'יאנג ראי" },
  { id: "chiang-mai", en: "Chiang Mai", he: "צ'יאנג מאי" },
  { id: "doi-inthanon", en: "Doi Inthanon", he: "דוי אינתנון" },
  { id: "mae-hong-son", en: "Mae Hong Son", he: "מאה הונג סון" },
  { id: "golden-triangle", en: "Golden Triangle", he: "המשולש הזהב" },
];

export const SHABBAT_HOTELS = [
  {
    id: "chabad-chiang-mai",
    en: "Chabad Chiang Mai Area",
    he: "אזור חב\"ד צ'יאנג מאי",
  },
  { id: "chabad-bangkok", en: "Chabad Bangkok Area", he: 'אזור חב"ד בנגקוק' },
  { id: "other", en: "Other Location", he: "מיקום אחר" },
];

export const ATTRACTIONS = [
  { id: "elephant-sanctuary", en: "Elephant Sanctuary", he: "מקלט פילים" },
  { id: "waterfall", en: "Waterfall Trek", he: "טרק למפלים" },
  { id: "hill-tribe", en: "Hill Tribe Village", he: "כפר שבטים" },
  { id: "temple", en: "Temple Visit", he: "ביקור במקדש" },
  { id: "night-market", en: "Night Market", he: "שוק לילה" },
  { id: "hot-springs", en: "Hot Springs", he: "מעיינות חמים" },
];

// I9: Get today's date in YYYY-MM-DD for min attribute
export function getTodayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1); // minimum tomorrow (24h ahead)
  return d.toISOString().split("T")[0];
}
