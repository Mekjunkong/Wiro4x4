// client/src/components/calculator-v2/ServiceSelector.tsx
import { Hotel, Utensils, Mountain, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTHB, SERVICE_PRICES } from "@shared/pricing";

interface ServiceSelectorProps {
  includesHotels: boolean;
  includesFood: boolean;
  includesAttractions: boolean;
  attractionCount: number;
  needsShabbatHotel: boolean;
  onToggleHotels: (value: boolean) => void;
  onToggleFood: (value: boolean) => void;
  onToggleAttractions: (value: boolean) => void;
  onSetAttractionCount: (count: number) => void;
  onToggleShabbatHotel: (value: boolean) => void;
}

export function ServiceSelector({
  includesHotels,
  includesFood,
  includesAttractions,
  attractionCount,
  needsShabbatHotel,
  onToggleHotels,
  onToggleFood,
  onToggleAttractions,
  onSetAttractionCount,
  onToggleShabbatHotel,
}: ServiceSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {/* Hotels */}
      <ServiceToggle
        icon={Hotel}
        label={t("Hotels", "מלונות")}
        detail={t(
          `~${formatTHB(SERVICE_PRICES.hotelPerNight)}/night`,
          `~${formatTHB(SERVICE_PRICES.hotelPerNight)}/לילה`
        )}
        checked={includesHotels}
        onChange={onToggleHotels}
      />

      {/* Kosher Meals */}
      <ServiceToggle
        icon={Utensils}
        label={t("Kosher Meals", "ארוחות כשרות")}
        detail={t(
          `~${formatTHB(SERVICE_PRICES.foodPerDay)}/day`,
          `~${formatTHB(SERVICE_PRICES.foodPerDay)}/יום`
        )}
        checked={includesFood}
        onChange={onToggleFood}
      />

      {/* Attractions */}
      <ServiceToggle
        icon={Mountain}
        label={t("Attractions", "אטרקציות")}
        detail={t(
          `~${formatTHB(SERVICE_PRICES.attractionPerItem)}/attraction`,
          `~${formatTHB(SERVICE_PRICES.attractionPerItem)}/אטרקציה`
        )}
        checked={includesAttractions}
        onChange={onToggleAttractions}
      />

      {includesAttractions && (
        <div className="ml-10 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {t("Number of attractions:", "מספר אטרקציות:")}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onSetAttractionCount(Math.max(1, attractionCount - 1))
              }
              className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted text-sm"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-medium">
              {attractionCount}
            </span>
            <button
              onClick={() => onSetAttractionCount(attractionCount + 1)}
              className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted text-sm"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Shabbat Hotel */}
      <ServiceToggle
        icon={Hotel}
        label={t("Shabbat Hotel (near Chabad)", 'מלון שבת (ליד חב"ד)')}
        detail={t(
          `${formatTHB(SERVICE_PRICES.shabbatHotelPerNight)}/night`,
          `${formatTHB(SERVICE_PRICES.shabbatHotelPerNight)}/לילה`
        )}
        checked={needsShabbatHotel}
        onChange={onToggleShabbatHotel}
      />
    </div>
  );
}

// Helper component
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
        className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
      />
      <Icon className="w-5 h-5 text-accent shrink-0" />
      <span className="font-medium flex-1">{label}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </label>
  );
}
