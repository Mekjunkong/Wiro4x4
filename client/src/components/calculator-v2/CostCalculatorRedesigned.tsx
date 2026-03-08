import { useState, useEffect } from "react";
import { Users, Calendar, Mountain, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  calculateTripTotal,
  type TourSelection,
  type PriceBreakdown,
} from "@shared/pricing";
import { SectionWrapper } from "./SectionWrapper";
import { TourSelector } from "./TourSelector";
import { GroupSelector } from "./GroupSelector";
import { DateSelector } from "./DateSelector";
import { ServiceSelector } from "./ServiceSelector";
import { ProgressIndicator } from "./ProgressIndicator";
import { PackageRecommendation } from "./PackageRecommendation";
import { PriceSummaryBar } from "./PriceSummaryBar";
import { PriceBreakdownModal } from "./PriceBreakdownModal";
import { SaveEstimateModal } from "./SaveEstimateModal";

export function CostCalculatorRedesigned() {
  const { t } = useLanguage();

  // Core state
  const [selectedTours, setSelectedTours] = useState<TourSelection[]>([]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState<number[]>([]);
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [includesHotels, setIncludesHotels] = useState(false);
  const [includesFood, setIncludesFood] = useState(false);
  const [includesAttractions, setIncludesAttractions] = useState(false);
  const [attractionCount, setAttractionCount] = useState(1);
  const [needsShabbatHotel, setNeedsShabbatHotel] = useState(false);

  // UI state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["tours"])
  );
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Mock tour data (will be fetched from tRPC in production)
  const availableTours: TourSelection[] = [
    { name: "Doi Inthanon", nameHe: "דוי אינטנון", basePrice: 2500 },
    { name: "Mae Kampong", nameHe: "מאה קמפונג", basePrice: 1800 },
    { name: "Sticky Waterfalls", nameHe: "מפלי הדבק", basePrice: 1500 },
  ];

  // Computed values
  const completedSections = new Set<"tours" | "group" | "dates" | "services">();
  if (selectedTours.length > 0) completedSections.add("tours");
  if (adults >= 1) completedSections.add("group");
  if (arrivalDate && departureDate) completedSections.add("dates");
  if (
    includesHotels ||
    includesFood ||
    includesAttractions ||
    needsShabbatHotel
  ) {
    completedSections.add("services");
  }

  const canCalculate = Boolean(
    selectedTours.length > 0 && arrivalDate && departureDate
  );

  let breakdown: PriceBreakdown | null = null;
  if (canCalculate) {
    try {
      breakdown = calculateTripTotal({
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
      });
    } catch {
      // Invalid dates or calculation error
      breakdown = null;
    }
  }

  // Progressive disclosure: auto-expand next section when current completes
  useEffect(() => {
    if (
      selectedTours.length > 0 &&
      !expandedSections.has("group") &&
      !expandedSections.has("dates")
    ) {
      setExpandedSections(new Set(["group"]));
    }
  }, [selectedTours.length, expandedSections]);

  useEffect(() => {
    if (
      adults >= 1 &&
      !expandedSections.has("dates") &&
      !expandedSections.has("services")
    ) {
      setExpandedSections(new Set(["dates"]));
    }
  }, [adults, expandedSections]);

  useEffect(() => {
    if (arrivalDate && departureDate && !expandedSections.has("services")) {
      setExpandedSections(new Set(["services"]));
    }
  }, [arrivalDate, departureDate, expandedSections]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getSummaryPill = (
    section: "tours" | "group" | "dates" | "services"
  ) => {
    if (section === "tours" && selectedTours.length > 0) {
      return t(
        `${selectedTours.length} selected`,
        `${selectedTours.length} נבחרו`
      );
    }
    if (section === "group" && adults > 0) {
      const total = adults + children.length;
      return t(`${total} people`, `${total} אנשים`);
    }
    if (section === "dates" && arrivalDate && departureDate) {
      return `${arrivalDate} - ${departureDate}`;
    }
    return undefined;
  };

  const currentSection =
    expandedSections.size === 1
      ? (Array.from(expandedSections)[0] as
          | "tours"
          | "group"
          | "dates"
          | "services")
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Progress indicator */}
      <ProgressIndicator
        completedSections={completedSections}
        currentSection={currentSection}
      />

      {/* Sections */}
      <div className="space-y-4">
        {/* Tours */}
        <SectionWrapper
          title={t("Select Tours", "בחירת טיולים")}
          icon={Mountain}
          isComplete={completedSections.has("tours")}
          isExpanded={expandedSections.has("tours")}
          onToggle={() => toggleSection("tours")}
          summaryPill={getSummaryPill("tours")}
          stepNumber={1}
        >
          <TourSelector
            availableTours={availableTours}
            selectedTours={selectedTours}
            onAddTour={tour => setSelectedTours([...selectedTours, tour])}
            onRemoveTour={idx =>
              setSelectedTours(selectedTours.filter((_, i) => i !== idx))
            }
          />
        </SectionWrapper>

        {/* Group */}
        <SectionWrapper
          title={t("Group Size", "גודל קבוצה")}
          icon={Users}
          isComplete={completedSections.has("group")}
          isExpanded={expandedSections.has("group")}
          onToggle={() => toggleSection("group")}
          summaryPill={getSummaryPill("group")}
          stepNumber={2}
        >
          <GroupSelector
            adults={adults}
            children={children}
            onSetAdults={setAdults}
            onAddChild={() => setChildren([...children, 0])}
            onRemoveChild={idx =>
              setChildren(children.filter((_, i) => i !== idx))
            }
            onUpdateChildAge={(idx, age) => {
              const updated = [...children];
              updated[idx] = age;
              setChildren(updated);
            }}
          />
        </SectionWrapper>

        {/* Dates */}
        <SectionWrapper
          title={t("Travel Dates", "תאריכי נסיעה")}
          icon={Calendar}
          isComplete={completedSections.has("dates")}
          isExpanded={expandedSections.has("dates")}
          onToggle={() => toggleSection("dates")}
          summaryPill={getSummaryPill("dates")}
          stepNumber={3}
        >
          <DateSelector
            arrivalDate={arrivalDate}
            departureDate={departureDate}
            onSetArrivalDate={setArrivalDate}
            onSetDepartureDate={setDepartureDate}
          />
        </SectionWrapper>

        {/* Services */}
        <SectionWrapper
          title={t("Additional Services", "שירותים נוספים")}
          icon={Settings}
          isComplete={completedSections.has("services")}
          isExpanded={expandedSections.has("services")}
          onToggle={() => toggleSection("services")}
          stepNumber={4}
        >
          <ServiceSelector
            includesHotels={includesHotels}
            includesFood={includesFood}
            includesAttractions={includesAttractions}
            attractionCount={attractionCount}
            needsShabbatHotel={needsShabbatHotel}
            onToggleHotels={setIncludesHotels}
            onToggleFood={setIncludesFood}
            onToggleAttractions={setIncludesAttractions}
            onSetAttractionCount={setAttractionCount}
            onToggleShabbatHotel={setNeedsShabbatHotel}
          />
        </SectionWrapper>

        {/* Package recommendation */}
        {breakdown?.packageOption && (
          <PackageRecommendation packageOption={breakdown.packageOption} />
        )}
      </div>

      {/* Price summary bar */}
      <PriceSummaryBar
        total={breakdown?.total ?? null}
        isVisible={canCalculate}
        onViewBreakdown={() => setShowBreakdownModal(true)}
        onSaveEstimate={() => setShowSaveModal(true)}
      />

      {/* Modals */}
      <PriceBreakdownModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        breakdown={breakdown}
      />

      <SaveEstimateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        estimateData={{
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
        }}
      />
    </div>
  );
}
