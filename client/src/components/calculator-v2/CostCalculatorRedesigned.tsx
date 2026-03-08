import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateTripCost } from "@shared/pricing";
import type { TourSelection, PriceBreakdown } from "@shared/pricing";
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

  // TODO: Replace with actual tRPC query
  const availableTours: TourSelection[] = [
    {
      slug: "doi-inthanon-roof-of-thailand",
      nameEn: "Doi Inthanon",
      nameHe: "דוי אינטנון",
      basePrice: 2500,
      bookingCount: 0,
    },
    {
      slug: "mae-kampong-hidden-village",
      nameEn: "Mae Kampong",
      nameHe: "מאה קמפונג",
      basePrice: 1800,
      bookingCount: 0,
    },
    {
      slug: "maerim-sticky-waterfalls",
      nameEn: "Sticky Waterfalls",
      nameHe: "מפלי הדבק",
      basePrice: 1500,
      bookingCount: 0,
    },
    {
      slug: "doi-suthep-pui-beyond-temple",
      nameEn: "Doi Suthep",
      nameHe: "דוי סות'פ",
      basePrice: 2000,
      bookingCount: 0,
    },
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
    breakdown = calculateTripCost({
      tours: selectedTours,
      adults,
      children: children.map(age => ({ age })),
      arrivalDate: new Date(arrivalDate),
      departureDate: new Date(departureDate),
      includesHotels,
      includesFood,
      includesAttractions,
      attractionCount,
      needsShabbatHotel,
    });
  }

  // Progressive disclosure: auto-expand next section when current completes
  useEffect(() => {
    if (selectedTours.length > 0 && !expandedSections.has("group")) {
      setExpandedSections(new Set(["group"]));
    }
  }, [selectedTours.length]);

  useEffect(() => {
    if (adults >= 1 && !expandedSections.has("dates")) {
      setExpandedSections(new Set(["dates"]));
    }
  }, [adults]);

  useEffect(() => {
    if (arrivalDate && departureDate && !expandedSections.has("services")) {
      setExpandedSections(new Set(["services"]));
    }
  }, [arrivalDate, departureDate]);

  const handleAddTour = (tour: TourSelection) => {
    setSelectedTours(prev => [...prev, tour]);
  };

  const handleRemoveTour = (index: number) => {
    setSelectedTours(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddChild = () => {
    setChildren(prev => [...prev, 5]); // default age 5
  };

  const handleRemoveChild = (index: number) => {
    setChildren(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateChildAge = (index: number, age: number) => {
    setChildren(prev => prev.map((a, i) => (i === index ? age : a)));
  };

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

  const currentSection =
    completedSections.size === 0
      ? "tours"
      : completedSections.size === 1
        ? "group"
        : completedSections.size === 2
          ? "dates"
          : completedSections.size === 3
            ? "services"
            : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Progress indicator */}
      <ProgressIndicator
        completedSections={completedSections}
        currentSection={currentSection}
      />

      {/* Sections */}
      {/* Tours */}
      <SectionWrapper
        title={t("Select Your Tours", "בחרו את הטיולים")}
        sectionId="tours"
        isExpanded={expandedSections.has("tours")}
        onToggle={() => toggleSection("tours")}
        stepNumber={1}
      >
        <TourSelector
          availableTours={availableTours}
          selectedTours={selectedTours}
          onAddTour={handleAddTour}
          onRemoveTour={handleRemoveTour}
        />
      </SectionWrapper>

      {/* Group */}
      <SectionWrapper
        title={t("Group Details", "פרטי הקבוצה")}
        sectionId="group"
        isExpanded={expandedSections.has("group")}
        onToggle={() => toggleSection("group")}
        stepNumber={2}
      >
        <GroupSelector
          adults={adults}
          children={children}
          onSetAdults={setAdults}
          onAddChild={handleAddChild}
          onRemoveChild={handleRemoveChild}
          onUpdateChildAge={handleUpdateChildAge}
        />
      </SectionWrapper>

      {/* Dates */}
      <SectionWrapper
        title={t("Travel Dates", "תאריכי הנסיעה")}
        sectionId="dates"
        isExpanded={expandedSections.has("dates")}
        onToggle={() => toggleSection("dates")}
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
        sectionId="services"
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
        selectedTours={selectedTours}
        adults={adults}
        children={children}
        arrivalDate={arrivalDate}
        departureDate={departureDate}
        includesHotels={includesHotels}
        includesFood={includesFood}
        includesAttractions={includesAttractions}
        attractionCount={attractionCount}
        needsShabbatHotel={needsShabbatHotel}
        total={breakdown?.total ?? 0}
      />
    </div>
  );
}
