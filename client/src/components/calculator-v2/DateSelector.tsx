// client/src/components/calculator-v2/DateSelector.tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { detectShabbatNights } from "@shared/pricing";

interface DateSelectorProps {
  arrivalDate: string;
  departureDate: string;
  onSetArrivalDate: (date: string) => void;
  onSetDepartureDate: (date: string) => void;
}

export function DateSelector({
  arrivalDate,
  departureDate,
  onSetArrivalDate,
  onSetDepartureDate,
}: DateSelectorProps) {
  const { t } = useLanguage();

  const shabbatNights =
    arrivalDate && departureDate
      ? detectShabbatNights(new Date(arrivalDate), new Date(departureDate))
      : 0;

  const isInvalidRange =
    arrivalDate && departureDate && departureDate <= arrivalDate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Arrival */}
        <div>
          <label
            htmlFor="arrival-v2"
            className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
          >
            {t("Arrival", "הגעה")}
          </label>
          <input
            id="arrival-v2"
            type="date"
            value={arrivalDate}
            onChange={e => onSetArrivalDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-border rounded-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-base"
          />
        </div>

        {/* Departure */}
        <div>
          <label
            htmlFor="departure-v2"
            className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
          >
            {t("Departure", "עזיבה")}
          </label>
          <input
            id="departure-v2"
            type="date"
            value={departureDate}
            onChange={e => onSetDepartureDate(e.target.value)}
            min={arrivalDate || new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-base ${
              isInvalidRange ? "border-red-500" : "border-border"
            }`}
          />
        </div>
      </div>

      {/* Validation error */}
      {isInvalidRange && (
        <div className="text-sm text-red-600">
          {t(
            "Departure date must be after arrival date",
            "תאריך העזיבה חייב להיות אחרי תאריך ההגעה"
          )}
        </div>
      )}

      {/* Shabbat detection */}
      {shabbatNights > 0 && !isInvalidRange && (
        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-sm">
          <span className="text-amber-800">
            {t(
              `Your trip includes ${shabbatNights} Friday night${shabbatNights > 1 ? "s" : ""} (Shabbat)`,
              `הטיול שלכם כולל ${shabbatNights} ליל${shabbatNights > 1 ? "ות" : ""} שישי (שבת)`
            )}
          </span>
        </div>
      )}
    </div>
  );
}
