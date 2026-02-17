import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Users,
  Calendar,
  Hotel,
  Utensils,
  Mountain,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ChevronDown,
  Baby,
  BadgePercent,
  Star,
} from "lucide-react";
import {
  calculateTripTotal,
  formatTHB,
  getEffectiveGroupSize,
  isCustomQuoteRequired,
  detectShabbatNights,
  SERVICE_PRICES,
  MULTI_DAY_PACKAGES,
  type TourSelection,
  type TripConfig,
  type PriceBreakdown,
  type PriceLineItem,
} from "@shared/pricing";

// Fallback tours when DB is empty
const FALLBACK_TOURS: TourSelection[] = [
  { name: "Waterfall Adventure Tour", nameHe: "הרפתקת מפלים", basePrice: 3500 },
  {
    name: "Mountain & Valley Explorer",
    nameHe: "טיול הרים ועמקים",
    basePrice: 4200,
  },
  {
    name: "Jungle & River Expedition",
    nameHe: "טיול ג'ונגל ונהרות",
    basePrice: 4800,
  },
  {
    name: "Rice Fields & Culture Tour",
    nameHe: "שדות אורז ותרבות מקומית",
    basePrice: 2800,
  },
  {
    name: "Elephant Sanctuary Visit",
    nameHe: "ביקור במקלט פילים",
    basePrice: 3200,
  },
  {
    name: "Hill Tribe Cultural Journey",
    nameHe: "מסע תרבותי לשבטי ההרים",
    basePrice: 3800,
  },
];

export function CostCalculator() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  const { data: dbTours } = trpc.tour.list.useQuery();

  const availableTours: TourSelection[] = useMemo(() => {
    if (dbTours && dbTours.length > 0) {
      return dbTours.map(tour => ({
        name: tour.name,
        nameHe: tour.nameHe,
        basePrice: tour.price,
      }));
    }
    return FALLBACK_TOURS;
  }, [dbTours]);

  // ── State ──────────────────────────────────────────────────
  const [selectedTours, setSelectedTours] = useState<TourSelection[]>([]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState<number[]>([]); // array of ages
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [includesHotels, setIncludesHotels] = useState(false);
  const [includesFood, setIncludesFood] = useState(false);
  const [includesAttractions, setIncludesAttractions] = useState(false);
  const [attractionCount, setAttractionCount] = useState(1);
  const [needsShabbatHotel, setNeedsShabbatHotel] = useState(false);

  // ── Derived ────────────────────────────────────────────────
  const canCalculate =
    selectedTours.length > 0 &&
    arrivalDate &&
    departureDate &&
    departureDate > arrivalDate;

  const breakdown: PriceBreakdown | null = useMemo(() => {
    if (!canCalculate) return null;

    const config: TripConfig = {
      tours: selectedTours,
      group: {
        adults,
        children: children.map(age => ({ age })),
      },
      arrivalDate: new Date(arrivalDate),
      departureDate: new Date(departureDate),
      services: {
        includesHotels,
        includesFood,
        includesAttractions,
        attractionCount,
      },
      needsShabbatHotel,
    };
    return calculateTripTotal(config);
  }, [
    selectedTours,
    adults,
    children,
    arrivalDate,
    departureDate,
    includesHotels,
    includesFood,
    includesAttractions,
    attractionCount,
    needsShabbatHotel,
    canCalculate,
  ]);

  const shabbatAutoDetected = useMemo(() => {
    if (!arrivalDate || !departureDate) return 0;
    return detectShabbatNights(new Date(arrivalDate), new Date(departureDate));
  }, [arrivalDate, departureDate]);

  const effectiveGroupSize = getEffectiveGroupSize({
    adults,
    children: children.map(age => ({ age })),
  });

  // ── Handlers ───────────────────────────────────────────────
  const addTour = (tour: TourSelection) => {
    setSelectedTours(prev => [...prev, tour]);
  };

  const removeTour = (index: number) => {
    setSelectedTours(prev => prev.filter((_, i) => i !== index));
  };

  const addChild = () => setChildren(prev => [...prev, 5]);
  const removeChild = (index: number) =>
    setChildren(prev => prev.filter((_, i) => i !== index));
  const updateChildAge = (index: number, age: number) =>
    setChildren(prev => prev.map((a, i) => (i === index ? age : a)));

  const handleWhatsApp = () => {
    if (!breakdown) return;
    const tourNames = selectedTours
      .map(t => (isHebrew ? t.nameHe : t.name))
      .join(", ");
    const message = isHebrew
      ? `היי WIRO 4x4! עשיתי חישוב עלויות באתר:\n\nטיולים: ${tourNames}\nקבוצה: ${adults} מבוגרים${children.length > 0 ? `, ${children.length} ילדים` : ""}\nתאריכים: ${arrivalDate} → ${departureDate}\nהערכת מחיר: ${formatTHB(breakdown.total)}\n\nאפשר לקבל הצעת מחיר מדויקת?`
      : `Hi WIRO 4x4! I used the cost estimator on your site:\n\nTours: ${tourNames}\nGroup: ${adults} adults${children.length > 0 ? `, ${children.length} children` : ""}\nDates: ${arrivalDate} → ${departureDate}\nEstimated price: ${formatTHB(breakdown.total)}\n\nCan I get an exact quote?`;
    window.open(
      `https://wa.me/66929894495?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Tour Selection */}
      <Card className="p-5 md:p-6 border border-[#D4AF37]/30 rounded-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#D4AF37]" />
          {t("Select Tours", "בחרו טיולים")}
        </h3>

        {/* Selected tours */}
        {selectedTours.length > 0 && (
          <div className="space-y-2 mb-4">
            {selectedTours.map((tour, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-[#D4AF37]/5 rounded-sm px-4 py-2.5"
              >
                <div>
                  <span className="font-medium text-sm">
                    {isHebrew ? tour.nameHe : tour.name}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {formatTHB(tour.basePrice)}
                  </span>
                </div>
                <button
                  onClick={() => removeTour(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label={t("Remove tour", "הסרת טיול")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add tour dropdown */}
        <div className="relative">
          <select
            onChange={e => {
              const idx = parseInt(e.target.value);
              if (!isNaN(idx)) {
                addTour(availableTours[idx]);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="w-full px-4 py-3 border border-border rounded-sm bg-background appearance-none cursor-pointer focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-base"
          >
            <option value="" disabled>
              {t("+ Add a tour...", "+ הוסיפו טיול...")}
            </option>
            {availableTours.map((tour, idx) => (
              <option key={idx} value={idx}>
                {isHebrew ? tour.nameHe : tour.name} —{" "}
                {formatTHB(tour.basePrice)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Multi-day package hint */}
        {selectedTours.length >= 2 && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
            <BadgePercent className="w-3.5 h-3.5" />
            {t(
              `Tip: ${MULTI_DAY_PACKAGES.map((p: (typeof MULTI_DAY_PACKAGES)[number]) => `${p.days}-day`).join(", ")} packages get automatic discounts`,
              `טיפ: חבילות של ${MULTI_DAY_PACKAGES.map((p: (typeof MULTI_DAY_PACKAGES)[number]) => `${p.days} ימים`).join(", ")} מקבלות הנחה אוטומטית`
            )}
          </div>
        )}
      </Card>

      {/* Group Size */}
      <Card className="p-5 md:p-6 border border-[#D4AF37]/30 rounded-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#D4AF37]" />
          {t("Group Size", "גודל הקבוצה")}
        </h3>

        {/* Adults */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">{t("Adults", "מבוגרים")}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdults(a => Math.max(1, a - 1))}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label={t("Decrease adults", "הפחת מבוגרים")}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-lg">{adults}</span>
            <button
              onClick={() => setAdults(a => a + 1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label={t("Increase adults", "הוסף מבוגרים")}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium flex items-center gap-2">
              <Baby className="w-4 h-4" />
              {t("Children", "ילדים")}
            </span>
            <button
              onClick={addChild}
              className="text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t("Add child", "הוסיפו ילד")}
            </button>
          </div>

          {children.length > 0 && (
            <div className="space-y-2">
              {children.map((age, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20">
                    {t(`Child ${idx + 1}`, `ילד ${idx + 1}`)}
                  </span>
                  <select
                    value={age}
                    onChange={e =>
                      updateChildAge(idx, parseInt(e.target.value))
                    }
                    className="flex-1 px-3 py-2 border border-border rounded-sm text-sm"
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0
                          ? t("Under 1", "מתחת לגיל 1")
                          : t(`Age ${i}`, `גיל ${i}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeChild(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label={t("Remove child", "הסרת ילד")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  "Under 3: free | Ages 3-10: 50% surcharge | 11+: full price",
                  "מתחת ל-3: חינם | גילאי 3-10: 50% תוספת | 11+: מחיר מלא"
                )}
              </p>
            </div>
          )}

          {/* Group size indicator */}
          <div className="mt-3 text-sm">
            {isCustomQuoteRequired(effectiveGroupSize) ? (
              <span className="text-amber-600 font-medium">
                {t(
                  "Groups of 7+ require a custom quote — prices shown are estimates",
                  "קבוצות של 7+ דורשות הצעת מחיר מותאמת — המחירים המוצגים הם הערכה"
                )}
              </span>
            ) : effectiveGroupSize >= 5 ? (
              <span className="text-muted-foreground">
                {t(
                  "Group of 5-6: +20% surcharge applies",
                  "קבוצה של 5-6: תוספת 20%"
                )}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Dates */}
      <Card className="p-5 md:p-6 border border-[#D4AF37]/30 rounded-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#D4AF37]" />
          {t("Travel Dates", "תאריכי הטיול")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
              {t("Arrival", "הגעה")}
            </label>
            <input
              type="date"
              value={arrivalDate}
              onChange={e => setArrivalDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-border rounded-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
              {t("Departure", "עזיבה")}
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              min={arrivalDate || new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-border rounded-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Shabbat detection */}
        {shabbatAutoDetected > 0 && (
          <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-sm">
            <span className="text-amber-800">
              {t(
                `Your trip includes ${shabbatAutoDetected} Friday night${shabbatAutoDetected > 1 ? "s" : ""} (Shabbat)`,
                `הטיול שלכם כולל ${shabbatAutoDetected} ליל${shabbatAutoDetected > 1 ? "ות" : ""} שישי (שבת)`
              )}
            </span>
          </div>
        )}
      </Card>

      {/* Services */}
      <Card className="p-5 md:p-6 border border-[#D4AF37]/30 rounded-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-[#D4AF37]" />
          {t("Additional Services", "שירותים נוספים")}
        </h3>

        <div className="space-y-3">
          <ServiceToggle
            icon={Hotel}
            label={t("Hotels", "מלונות")}
            detail={t(
              `~${formatTHB(SERVICE_PRICES.hotelPerNight)}/night`,
              `~${formatTHB(SERVICE_PRICES.hotelPerNight)}/לילה`
            )}
            checked={includesHotels}
            onChange={setIncludesHotels}
          />
          <ServiceToggle
            icon={Utensils}
            label={t("Kosher Meals", "ארוחות כשרות")}
            detail={t(
              `~${formatTHB(SERVICE_PRICES.foodPerDay)}/day`,
              `~${formatTHB(SERVICE_PRICES.foodPerDay)}/יום`
            )}
            checked={includesFood}
            onChange={setIncludesFood}
          />
          <ServiceToggle
            icon={Mountain}
            label={t("Attractions", "אטרקציות")}
            detail={t(
              `~${formatTHB(SERVICE_PRICES.attractionPerItem)}/attraction`,
              `~${formatTHB(SERVICE_PRICES.attractionPerItem)}/אטרקציה`
            )}
            checked={includesAttractions}
            onChange={setIncludesAttractions}
          />
          {includesAttractions && (
            <div className="ml-10 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {t("Number of attractions:", "מספר אטרקציות:")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAttractionCount(c => Math.max(1, c - 1))}
                  className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted text-sm"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-medium">
                  {attractionCount}
                </span>
                <button
                  onClick={() => setAttractionCount(c => c + 1)}
                  className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted text-sm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          <ServiceToggle
            icon={Hotel}
            label={t("Shabbat Hotel (near Chabad)", 'מלון שבת (ליד חב"ד)')}
            detail={t(
              `${formatTHB(SERVICE_PRICES.shabbatHotelPerNight)}/night`,
              `${formatTHB(SERVICE_PRICES.shabbatHotelPerNight)}/לילה`
            )}
            checked={needsShabbatHotel}
            onChange={setNeedsShabbatHotel}
          />
        </div>
      </Card>

      {/* Price Breakdown */}
      {breakdown && (
        <Card className="p-5 md:p-6 border-2 border-[#D4AF37]/30 rounded-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#D4AF37]" />
            {t("Price Estimate", "הערכת מחיר")}
          </h3>

          {breakdown.isCustomQuote && (
            <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
              {t(
                "Group of 7+ — prices below are estimates. Contact us for exact pricing.",
                "קבוצה של 7+ — המחירים למטה הם הערכה. צרו קשר לקבלת מחיר מדויק."
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Tour items */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("Tours", "טיולים")}
              </h4>
              {breakdown.tourItems.map((item: PriceLineItem, idx: number) => (
                <LineItem
                  key={idx}
                  label={isHebrew ? item.labelHe : item.labelEn}
                  amount={item.amount}
                />
              ))}
              {breakdown.groupMultiplier > 1 && (
                <LineItem
                  label={t(
                    `Group surcharge (×${breakdown.groupMultiplier})`,
                    `תוספת קבוצה (×${breakdown.groupMultiplier})`
                  )}
                  amount={breakdown.groupAdjustedTotal - breakdown.tourSubtotal}
                  className="text-amber-600"
                />
              )}
              {breakdown.childrenSurcharge > 0 && (
                <LineItem
                  label={t("Children surcharge", "תוספת ילדים")}
                  amount={breakdown.childrenSurcharge}
                  className="text-amber-600"
                />
              )}
            </div>

            {/* Package comparison */}
            {breakdown.packageOption && (
              <div className="px-3 py-2.5 bg-green-50 border border-green-200 rounded-sm">
                <div className="flex items-center gap-2 text-green-800 font-medium text-sm mb-1">
                  <BadgePercent className="w-4 h-4" />
                  {t("Package Discount Available!", "הנחת חבילה זמינה!")}
                </div>
                <p className="text-xs text-green-700">
                  {isHebrew
                    ? `${breakdown.packageOption.nameHe}: ${formatTHB(breakdown.packageOption.packagePrice)} (חיסכון ${formatTHB(breakdown.packageOption.savings)})`
                    : `${breakdown.packageOption.nameEn}: ${formatTHB(breakdown.packageOption.packagePrice)} (save ${formatTHB(breakdown.packageOption.savings)})`}
                </p>
              </div>
            )}

            {/* Services */}
            {breakdown.serviceItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                  {t("Services", "שירותים")}
                </h4>
                {breakdown.serviceItems.map(
                  (item: PriceLineItem, idx: number) => (
                    <LineItem
                      key={idx}
                      label={isHebrew ? item.labelHe : item.labelEn}
                      amount={item.amount}
                    />
                  )
                )}
              </div>
            )}

            {/* Shabbat */}
            {breakdown.shabbatCost > 0 && (
              <LineItem
                label={t(
                  `Shabbat Hotel (${breakdown.shabbatNights} night${breakdown.shabbatNights > 1 ? "s" : ""})`,
                  `מלון שבת (${breakdown.shabbatNights} ${breakdown.shabbatNights > 1 ? "לילות" : "לילה"})`
                )}
                amount={breakdown.shabbatCost}
              />
            )}

            {/* Total */}
            <div className="border-t-2 border-[#D4AF37]/20 pt-3 mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xl font-bold">
                  {t("Estimated Total", "סה״כ הערכה")}
                </span>
                <span
                  className="text-2xl font-bold text-[#D4AF37]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {formatTHB(breakdown.total)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("Deposit (30%)", "מקדמה (30%)")}</span>
                <span>{formatTHB(breakdown.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("Balance on tour day", "יתרה ביום הטיול")}</span>
                <span>{formatTHB(breakdown.balanceAmount)}</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={handleWhatsApp}
              variant="default"
              className="w-full py-3 text-base bg-[#D4AF37] hover:bg-[#B8960F] text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t(
                "Get Exact Quote via WhatsApp",
                "קבלו הצעת מחיר מדויקת בוואטסאפ"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={() => {
                window.location.href = "/book";
              }}
            >
              {t("Book Now", "להזמנה")}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            {t(
              "Prices are estimates. Final pricing confirmed upon booking.",
              "המחירים הם הערכה. המחיר הסופי יאושר בעת ההזמנה."
            )}
          </p>
        </Card>
      )}

      {/* Empty state */}
      {!canCalculate && (
        <Card className="p-6 md:p-8 border-2 border-dashed border-muted-foreground/20 text-center rounded-sm">
          <Calculator className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {t(
              "Select at least one tour and set your travel dates to see the price estimate",
              "בחרו לפחות טיול אחד וקבעו תאריכים כדי לראות הערכת מחיר"
            )}
          </p>
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function ServiceToggle({
  icon: Icon,
  label,
  detail,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-border text-[#D4AF37] focus:ring-[#D4AF37]"
      />
      <Icon className="w-5 h-5 text-[#D4AF37] shrink-0" />
      <span className="font-medium flex-1">{label}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </label>
  );
}

function LineItem({
  label,
  amount,
  className = "",
}: {
  label: string;
  amount: number;
  className?: string;
}) {
  return (
    <div className={`flex justify-between text-sm py-1 ${className}`}>
      <span>{label}</span>
      <span className="font-medium">{formatTHB(amount)}</span>
    </div>
  );
}
