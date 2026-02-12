/**
 * Pure pricing calculation functions for Wiro 4x4 tour cost estimation.
 * No database dependency — used by both client (calculator) and server (quotes).
 * All amounts in THB.
 */

// ── Types ────────────────────────────────────────────────────

export interface TourSelection {
  name: string;
  nameHe: string;
  basePrice: number;
}

export interface ServiceSelection {
  includesHotels: boolean;
  includesFood: boolean;
  includesAttractions: boolean;
  attractionCount: number;
}

export interface GroupConfig {
  adults: number;
  children: { age: number }[];
}

export interface TripConfig {
  tours: TourSelection[];
  group: GroupConfig;
  arrivalDate: Date;
  departureDate: Date;
  services: ServiceSelection;
  needsShabbatHotel: boolean;
}

export interface PriceLineItem {
  labelEn: string;
  labelHe: string;
  amount: number;
  isDiscount?: boolean;
}

export interface PriceBreakdown {
  tourItems: PriceLineItem[];
  tourSubtotal: number;
  groupMultiplier: number;
  groupAdjustedTotal: number;
  childrenSurcharge: number;
  serviceItems: PriceLineItem[];
  servicesSubtotal: number;
  shabbatNights: number;
  shabbatCost: number;
  packageOption: PackageComparison | null;
  subtotal: number;
  total: number;
  depositAmount: number;
  balanceAmount: number;
  isCustomQuote: boolean;
}

export interface PackageComparison {
  nameEn: string;
  nameHe: string;
  days: number;
  packagePrice: number;
  individualPrice: number;
  savings: number;
}

// ── Constants ────────────────────────────────────────────────

export const SERVICE_PRICES = {
  hotelPerNight: 1800,
  foodPerDay: 1200,
  attractionPerItem: 800,
  shabbatHotelPerNight: 2000,
} as const;

export const MULTI_DAY_PACKAGES = [
  {
    nameEn: "Weekend Adventure",
    nameHe: "הרפתקת סוף שבוע",
    days: 2,
    price: 7200,
  },
  {
    nameEn: "3-Day Indochina Explorer",
    nameHe: "חוויית אינדוסין - 3 ימים",
    days: 3,
    price: 11500,
  },
  {
    nameEn: "5-Day Complete Experience",
    nameHe: "5 ימים — החוויה המלאה",
    days: 5,
    price: 17800,
  },
] as const;

export const DEPOSIT_RATE = 0.3;

// ── Calculation Functions ────────────────────────────────────

/**
 * Returns the group-size multiplier.
 * 1-4 people: 1.0x | 5-6: 1.2x | 7+: custom
 */
export function getGroupMultiplier(effectiveGroupSize: number): number {
  if (effectiveGroupSize <= 4) return 1.0;
  if (effectiveGroupSize <= 6) return 1.2;
  return 1.2; // 7+ uses 1.2 as estimate, flagged as custom
}

export function isCustomQuoteRequired(effectiveGroupSize: number): boolean {
  return effectiveGroupSize >= 7;
}

/**
 * Count children aged 11+ as full adults for group-size bracket.
 */
export function getEffectiveGroupSize(group: GroupConfig): number {
  const olderChildren = group.children.filter(c => c.age >= 11).length;
  return group.adults + olderChildren;
}

/**
 * Calculate surcharge for children aged 3-10.
 * Children under 3: free. Ages 3-10: 50% of the group-size surcharge.
 */
export function calculateChildrenSurcharge(
  group: GroupConfig,
  tourSubtotal: number,
  multiplier: number
): number {
  const surcharge = tourSubtotal * multiplier - tourSubtotal;
  if (surcharge <= 0) return 0;

  const eligibleChildren = group.children.filter(
    c => c.age >= 3 && c.age <= 10
  ).length;
  if (eligibleChildren === 0) return 0;

  return Math.round((surcharge * 0.5 * eligibleChildren) / 100) * 100;
}

/**
 * Count Friday nights between arrival and departure.
 */
export function detectShabbatNights(arrival: Date, departure: Date): number {
  let count = 0;
  const current = new Date(arrival);
  while (current < departure) {
    if (current.getDay() === 5) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Calculate number of tour days and hotel nights.
 */
export function getTripDuration(arrival: Date, departure: Date) {
  const diffMs = departure.getTime() - arrival.getTime();
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const nights = Math.max(0, days - 1);
  return { days, nights };
}

/**
 * Find a matching multi-day package and calculate savings.
 */
export function findPackageOption(
  tourDays: number,
  individualTourTotal: number
): PackageComparison | null {
  const pkg = MULTI_DAY_PACKAGES.find(p => p.days === tourDays);
  if (!pkg) return null;
  const savings = individualTourTotal - pkg.price;
  if (savings <= 0) return null;

  return {
    nameEn: pkg.nameEn,
    nameHe: pkg.nameHe,
    days: pkg.days,
    packagePrice: pkg.price,
    individualPrice: individualTourTotal,
    savings,
  };
}

/**
 * Round to nearest 100 THB.
 */
export function roundToNearest100(amount: number): number {
  return Math.round(amount / 100) * 100;
}

/**
 * Main calculation: takes a full trip config and returns an itemized breakdown.
 */
export function calculateTripTotal(config: TripConfig): PriceBreakdown {
  const {
    tours,
    group,
    arrivalDate,
    departureDate,
    services,
    needsShabbatHotel,
  } = config;

  // Tour line items
  const tourItems: PriceLineItem[] = tours.map(tour => ({
    labelEn: tour.name,
    labelHe: tour.nameHe,
    amount: tour.basePrice,
  }));
  const tourSubtotal = tours.reduce((sum, t) => sum + t.basePrice, 0);

  // Group size
  const effectiveSize = getEffectiveGroupSize(group);
  const groupMultiplier = getGroupMultiplier(effectiveSize);
  const groupAdjustedTotal = roundToNearest100(tourSubtotal * groupMultiplier);
  const childrenSurcharge = calculateChildrenSurcharge(
    group,
    tourSubtotal,
    groupMultiplier
  );
  const isCustom = isCustomQuoteRequired(effectiveSize);

  // Trip duration
  const { days, nights } = getTripDuration(arrivalDate, departureDate);

  // Services
  const serviceItems: PriceLineItem[] = [];
  if (services.includesHotels && nights > 0) {
    const hotelCost = nights * SERVICE_PRICES.hotelPerNight;
    serviceItems.push({
      labelEn: `Hotels (${nights} night${nights > 1 ? "s" : ""})`,
      labelHe: `מלונות (${nights} ${nights > 1 ? "לילות" : "לילה"})`,
      amount: hotelCost,
    });
  }
  if (services.includesFood) {
    const foodCost = days * SERVICE_PRICES.foodPerDay;
    serviceItems.push({
      labelEn: `Kosher Meals (${days} day${days > 1 ? "s" : ""})`,
      labelHe: `ארוחות כשרות (${days} ${days > 1 ? "ימים" : "יום"})`,
      amount: foodCost,
    });
  }
  if (services.includesAttractions && services.attractionCount > 0) {
    const attrCost =
      services.attractionCount * SERVICE_PRICES.attractionPerItem;
    serviceItems.push({
      labelEn: `Attractions (${services.attractionCount})`,
      labelHe: `אטרקציות (${services.attractionCount})`,
      amount: attrCost,
    });
  }
  const servicesSubtotal = serviceItems.reduce((sum, s) => sum + s.amount, 0);

  // Shabbat
  const shabbatNights = needsShabbatHotel
    ? detectShabbatNights(arrivalDate, departureDate)
    : 0;
  const shabbatCost = shabbatNights * SERVICE_PRICES.shabbatHotelPerNight;

  // Package comparison (based on tour-only total, before services)
  const packageOption = findPackageOption(tours.length, groupAdjustedTotal);

  // Total
  const tourCost = packageOption
    ? packageOption.packagePrice
    : groupAdjustedTotal;
  const subtotal =
    tourCost + childrenSurcharge + servicesSubtotal + shabbatCost;
  const total = roundToNearest100(subtotal);
  const depositAmount = roundToNearest100(total * DEPOSIT_RATE);
  const balanceAmount = total - depositAmount;

  return {
    tourItems,
    tourSubtotal,
    groupMultiplier,
    groupAdjustedTotal,
    childrenSurcharge,
    serviceItems,
    servicesSubtotal,
    shabbatNights,
    shabbatCost,
    packageOption,
    subtotal,
    total,
    depositAmount,
    balanceAmount,
    isCustomQuote: isCustom,
  };
}

/**
 * Format THB amount: ฿3,500
 */
export function formatTHB(amount: number): string {
  return `฿${amount.toLocaleString()}`;
}
