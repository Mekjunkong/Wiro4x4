import { useState, useMemo, useCallback, useId, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { LOGIN_URL } from "@/const";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Utensils,
  Hotel,
  Mountain,
  FileText,
  AlertCircle,
  BadgePercent,
  MapPin,
  Car,
  Search,
  X,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { formatTHB } from "@shared/pricing";
import { nanoid } from "nanoid";

// ── Destination Database ─────────────────────────────────────

interface EntranceFee {
  name: string;
  costPerPerson: number;
}

interface DestinationPreset {
  id: string;
  name: string;
  region: string;
  entranceFees: EntranceFee[];
  suggestedCarPerDay: number;
  suggestedHotelPerNight: number;
  notes?: string;
}

const DESTINATIONS: DestinationPreset[] = [
  {
    id: "doi-inthanon",
    name: "Doi Inthanon National Park",
    region: "Chiang Mai",
    entranceFees: [
      { name: "National Park Entry", costPerPerson: 300 },
      { name: "Royal Pagodas (King & Queen)", costPerPerson: 40 },
    ],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1800,
    notes: "Wachirathan Waterfall & Pha Dok Siew included in park fee",
  },
  {
    id: "mae-kampong",
    name: "Mae Kampong Village",
    region: "Chiang Mai",
    entranceFees: [{ name: "Village Conservation Fee", costPerPerson: 50 }],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1500,
    notes: "Scenic village stay, coffee farms, bamboo bridges",
  },
  {
    id: "sticky-waterfalls",
    name: "Sticky Waterfalls (Bua Tong)",
    region: "Mae Rim / Chiang Mai",
    entranceFees: [{ name: "Waterfall Entrance", costPerPerson: 0 }],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1800,
    notes: "Free entrance. Climbable limestone waterfall",
  },
  {
    id: "doi-suthep",
    name: "Doi Suthep Temple & National Park",
    region: "Chiang Mai",
    entranceFees: [
      { name: "Wat Phra That Doi Suthep", costPerPerson: 50 },
      { name: "Doi Suthep-Pui NP Entry", costPerPerson: 100 },
    ],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1800,
  },
  {
    id: "mae-wang",
    name: "Mae Wang Jungle & Riverside",
    region: "Chiang Mai",
    entranceFees: [],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1500,
    notes: "Off-road jungle trails, river crossing, remote villages",
  },
  {
    id: "samoeng-loop",
    name: "Samoeng Mountain Loop",
    region: "Chiang Mai",
    entranceFees: [],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1800,
    notes: "Scenic mountain circuit, hill tribe villages",
  },
  {
    id: "elephant-sanctuary",
    name: "Elephant Sanctuary (Mae Taeng)",
    region: "Chiang Mai",
    entranceFees: [
      { name: "Sanctuary Admission (half-day)", costPerPerson: 1500 },
    ],
    suggestedCarPerDay: 2500,
    suggestedHotelPerNight: 1800,
  },
  {
    id: "chiang-mai-city",
    name: "Chiang Mai City Tour",
    region: "Chiang Mai",
    entranceFees: [
      { name: "Wat Chedi Luang", costPerPerson: 50 },
      { name: "Wat Phra Singh", costPerPerson: 50 },
    ],
    suggestedCarPerDay: 2000,
    suggestedHotelPerNight: 1800,
  },
  {
    id: "chiang-rai",
    name: "Chiang Rai City & Temples",
    region: "Chiang Rai",
    entranceFees: [
      { name: "White Temple (Wat Rong Khun)", costPerPerson: 100 },
      { name: "Black House Museum (Baan Dam)", costPerPerson: 80 },
      { name: "Golden Triangle Viewpoint", costPerPerson: 50 },
    ],
    suggestedCarPerDay: 3500,
    suggestedHotelPerNight: 1800,
    notes: "Blue Temple is free. ~3 hrs from Chiang Mai",
  },
  {
    id: "pai",
    name: "Pai Valley",
    region: "Mae Hong Son",
    entranceFees: [
      { name: "Pai Canyon Entrance", costPerPerson: 0 },
      { name: "Mae Yen Waterfall", costPerPerson: 100 },
      { name: "Tha Pai Hot Springs", costPerPerson: 300 },
    ],
    suggestedCarPerDay: 3500,
    suggestedHotelPerNight: 1500,
    notes: "~3 hrs via 762 curves. Great for 2-3 day trips",
  },
  {
    id: "mae-hong-son",
    name: "Mae Hong Son Loop",
    region: "Mae Hong Son",
    entranceFees: [
      { name: "Tham Lot Cave (with guide)", costPerPerson: 350 },
      { name: "Ban Rak Thai Village", costPerPerson: 0 },
    ],
    suggestedCarPerDay: 3500,
    suggestedHotelPerNight: 1500,
    notes: "Remote mountain province near Myanmar border",
  },
  {
    id: "lampang",
    name: "Lampang & Elephant Center",
    region: "Lampang",
    entranceFees: [
      { name: "Thai Elephant Conservation Center", costPerPerson: 250 },
      { name: "Wat Phra That Lampang Luang", costPerPerson: 0 },
    ],
    suggestedCarPerDay: 3000,
    suggestedHotelPerNight: 1800,
    notes: "~1.5 hrs from Chiang Mai",
  },
  {
    id: "nan",
    name: "Nan Province",
    region: "Nan",
    entranceFees: [
      { name: "Nan National Museum", costPerPerson: 100 },
      { name: "Doi Phu Kha NP", costPerPerson: 200 },
    ],
    suggestedCarPerDay: 4000,
    suggestedHotelPerNight: 1500,
    notes: "Remote province, ~5 hrs from Chiang Mai",
  },
  {
    id: "sukhothai",
    name: "Sukhothai Historical Park",
    region: "Sukhothai",
    entranceFees: [
      { name: "Central Zone Entry", costPerPerson: 150 },
      { name: "North Zone Entry", costPerPerson: 100 },
    ],
    suggestedCarPerDay: 4500,
    suggestedHotelPerNight: 1500,
    notes: "UNESCO World Heritage. ~5 hrs south of Chiang Mai",
  },
  {
    id: "luang-prabang",
    name: "Luang Prabang, Laos",
    region: "Laos",
    entranceFees: [
      { name: "Lao Visa on Arrival", costPerPerson: 1500 },
      { name: "Kuang Si Waterfall", costPerPerson: 400 },
      { name: "Pak Ou Caves (boat)", costPerPerson: 500 },
      { name: "Royal Palace Museum", costPerPerson: 200 },
    ],
    suggestedCarPerDay: 4500,
    suggestedHotelPerNight: 2000,
    notes: "International trip. Visa required. Budget 3–5 days minimum",
  },
  {
    id: "golden-triangle-myanmar",
    name: "Golden Triangle & Myanmar Border",
    region: "Chiang Rai / Myanmar",
    entranceFees: [
      { name: "Golden Triangle Hall of Opium", costPerPerson: 200 },
      { name: "Boat to Laos island (optional)", costPerPerson: 100 },
    ],
    suggestedCarPerDay: 4000,
    suggestedHotelPerNight: 2000,
    notes: "Where Thailand, Laos, and Myanmar meet",
  },
];

// ── Saved Attractions (localStorage) ─────────────────────────

const SAVED_KEY = "wiro_calc_attractions";

function loadSavedAttractions(): { name: string; cost: number }[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistAttraction(name: string, cost: number) {
  try {
    const list = loadSavedAttractions();
    if (list.some(a => a.name.toLowerCase() === name.trim().toLowerCase()))
      return;
    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify([...list, { name: name.trim(), cost }])
    );
  } catch {}
}

// ── Meal defaults ─────────────────────────────────────────────

const MEAL_DEFAULTS = {
  regular: { breakfast: 80, lunch: 180, dinner: 250 },
  kosher: { breakfast: 150, lunch: 300, dinner: 450 },
} as const;

// ── Types ────────────────────────────────────────────────────

type TourTypeKey = "1-day" | "2-3-day" | "7-14-day";

interface AttractionFee {
  id: string;
  name: string;
  cost: number;
}

interface DayItinerary {
  id: string;
  dayNumber: number;
  label: string;
  destinationId: string | null;
  isKosher: boolean;
  breakfastEnabled: boolean;
  breakfast: number;
  lunchEnabled: boolean;
  lunch: number;
  dinnerEnabled: boolean;
  dinner: number;
  hotel: number;
  carCost: number;
  driverCost: number;
  attractions: AttractionFee[];
}

// ── Constants ────────────────────────────────────────────────

const TOUR_TYPE_LABELS: Record<
  TourTypeKey,
  { label: string; maxDays: number }
> = {
  "1-day": { label: "One Day", maxDays: 1 },
  "2-3-day": { label: "2–3 Days", maxDays: 3 },
  "7-14-day": { label: "7–14 Days", maxDays: 14 },
};

function makeDay(n: number, carCost = 2500, driverCost = 1000): DayItinerary {
  const m = MEAL_DEFAULTS.regular;
  return {
    id: nanoid(),
    dayNumber: n,
    label: `Day ${n}`,
    destinationId: null,
    isKosher: false,
    breakfastEnabled: false,
    breakfast: m.breakfast,
    lunchEnabled: true,
    lunch: m.lunch,
    dinnerEnabled: n > 1,
    dinner: m.dinner,
    hotel: n > 1 ? 1800 : 0,
    carCost,
    driverCost,
    attractions: [],
  };
}

// ── Calculation Logic ────────────────────────────────────────

interface CostBreakdown {
  numberOfDays: number;
  totalCar: number;
  totalDriver: number;
  totalFixedCosts: number;
  fixedCostPerPerson: number;
  variableCostPerPerson: number;
  baseCostPerPerson: number;
  profitAmountPerPerson: number;
  sellingPricePerPerson: number;
  totalSellingPrice: number;
  totalProfit: number;
  dailyBreakdown: { day: DayItinerary; totalVariableThisDay: number }[];
}

function calculateCosts(
  participants: number,
  profitMargin: number,
  days: DayItinerary[]
): CostBreakdown {
  if (participants <= 0 || days.length === 0) {
    return {
      numberOfDays: 0,
      totalCar: 0,
      totalDriver: 0,
      totalFixedCosts: 0,
      fixedCostPerPerson: 0,
      variableCostPerPerson: 0,
      baseCostPerPerson: 0,
      profitAmountPerPerson: 0,
      sellingPricePerPerson: 0,
      totalSellingPrice: 0,
      totalProfit: 0,
      dailyBreakdown: [],
    };
  }

  const totalCar = days.reduce((s, d) => s + d.carCost, 0);
  const totalDriver = days.reduce((s, d) => s + d.driverCost, 0);
  const totalFixedCosts = totalCar + totalDriver;
  const fixedCostPerPerson = totalFixedCosts / participants;

  const dailyBreakdown = days.map(day => {
    const meals =
      (day.breakfastEnabled ? day.breakfast : 0) +
      (day.lunchEnabled ? day.lunch : 0) +
      (day.dinnerEnabled ? day.dinner : 0);
    const attractionTotal = day.attractions.reduce((s, a) => s + a.cost, 0);
    return { day, totalVariableThisDay: meals + day.hotel + attractionTotal };
  });

  const variableCostPerPerson = dailyBreakdown.reduce(
    (s, d) => s + d.totalVariableThisDay,
    0
  );
  const baseCostPerPerson = fixedCostPerPerson + variableCostPerPerson;
  const profitAmountPerPerson = baseCostPerPerson * (profitMargin / 100);
  const sellingPricePerPerson =
    Math.ceil((baseCostPerPerson + profitAmountPerPerson) / 100) * 100;
  const totalSellingPrice = sellingPricePerPerson * participants;
  const totalProfit = totalSellingPrice - baseCostPerPerson * participants;

  return {
    numberOfDays: days.length,
    totalCar,
    totalDriver,
    totalFixedCosts,
    fixedCostPerPerson,
    variableCostPerPerson,
    baseCostPerPerson,
    profitAmountPerPerson,
    sellingPricePerPerson,
    totalSellingPrice,
    totalProfit,
    dailyBreakdown,
  };
}

// ── Main Component ───────────────────────────────────────────

export default function AdminCostCalculator() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (!loading && !isAuthenticated) {
    navigate(LOGIN_URL);
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Admin
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="w-6 h-6 text-accent" />
              Trip Cost Planner
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pick destinations → entrance fees, car & hotel auto-fill → get
              your quote
            </p>
          </div>
        </div>
        <CostCalculatorDashboard />
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────

function CostCalculatorDashboard() {
  const [activeType, setActiveType] = useState<TourTypeKey>("1-day");
  const [participants, setParticipants] = useState(4);
  const [profitMargin, setProfitMargin] = useState(30);
  const [days, setDays] = useState<DayItinerary[]>([makeDay(1)]);

  const handleTypeChange = (type: TourTypeKey) => {
    setActiveType(type);
    setDays([makeDay(1)]);
  };

  const maxDays = TOUR_TYPE_LABELS[activeType].maxDays;

  const addDay = () => {
    if (days.length >= maxDays) return;
    const prev = days[days.length - 1];
    setDays(d => [...d, makeDay(d.length + 1, prev.carCost, prev.driverCost)]);
  };

  const removeDay = (id: string) => {
    setDays(prev => {
      const next = prev.filter(d => d.id !== id);
      return next.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    });
  };

  const updateDay = useCallback((id: string, patch: Partial<DayItinerary>) => {
    setDays(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const applyDestination = useCallback(
    (dayId: string, dest: DestinationPreset) => {
      setDays(prev =>
        prev.map(d => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            label: dest.name,
            destinationId: dest.id,
            carCost: dest.suggestedCarPerDay,
            hotel: d.dayNumber > 1 ? dest.suggestedHotelPerNight : 0,
            attractions: dest.entranceFees.map(f => ({
              id: nanoid(),
              name: f.name,
              cost: f.costPerPerson,
            })),
          };
        })
      );
    },
    []
  );

  const breakdown = useMemo(
    () => calculateCosts(participants, profitMargin, days),
    [participants, profitMargin, days]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: inputs */}
      <div className="xl:col-span-2 space-y-5">
        {/* Tour type */}
        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Trip Duration
          </h2>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(TOUR_TYPE_LABELS) as TourTypeKey[]).map(key => (
              <button
                key={key}
                onClick={() => handleTypeChange(key)}
                className={`px-4 py-2 rounded-sm text-sm font-medium border transition-colors ${
                  activeType === key
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:border-accent/50 hover:bg-accent/5"
                }`}
              >
                {TOUR_TYPE_LABELS[key].label}
              </button>
            ))}
          </div>
        </Card>

        {/* Group & profit */}
        <Card className="p-5 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Group & Profit
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                <Users className="inline w-3.5 h-3.5 mr-1" />
                Participants
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setParticipants(p => Math.max(1, p - 1))}
                  className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={participants}
                  onChange={e =>
                    setParticipants(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center border border-border rounded-sm py-2 text-lg font-bold focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <button
                  onClick={() => setParticipants(p => p + 1)}
                  className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                <TrendingUp className="inline w-3.5 h-3.5 mr-1" />
                Profit Margin:{" "}
                <span className="text-accent font-bold">{profitMargin}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={80}
                step={5}
                value={profitMargin}
                onChange={e => setProfitMargin(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>40%</span>
                <span>80%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Days */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Itinerary — Destinations & Costs
            </h2>
            <span className="text-xs text-muted-foreground">
              {days.length} / {maxDays} days
            </span>
          </div>

          <div className="space-y-3">
            {days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                canRemove={days.length > 1}
                onRemove={() => removeDay(day.id)}
                onChange={patch => updateDay(day.id, patch)}
                onApplyDestination={dest => applyDestination(day.id, dest)}
              />
            ))}
          </div>

          {days.length < maxDays && (
            <Button
              variant="outline"
              size="sm"
              onClick={addDay}
              className="w-full border-dashed border-accent/50 text-accent hover:bg-accent/5"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Day {days.length + 1}
            </Button>
          )}
        </Card>
      </div>

      {/* Right: summary */}
      <div className="xl:col-span-1">
        <div className="sticky top-6 space-y-4">
          <SummaryPanel
            breakdown={breakdown}
            participants={participants}
            profitMargin={profitMargin}
            days={days}
          />
        </div>
      </div>
    </div>
  );
}

// ── Destination Picker ───────────────────────────────────────

function DestinationPicker({
  onSelect,
  onClose,
}: {
  onSelect: (dest: DestinationPreset) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const results =
    query.length > 0
      ? DESTINATIONS.filter(
          d =>
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.region.toLowerCase().includes(query.toLowerCase())
        )
      : DESTINATIONS;

  return (
    <div className="border border-border rounded-sm bg-background shadow-lg mt-2 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search destination..."
          className="flex-1 text-sm bg-transparent outline-none"
        />
        <button onClick={onClose}>
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {results.map(dest => (
          <button
            key={dest.id}
            onClick={() => {
              onSelect(dest);
              onClose();
            }}
            className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{dest.name}</p>
                <p className="text-xs text-muted-foreground">{dest.region}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-accent font-medium">
                  Car {formatTHB(dest.suggestedCarPerDay)}/day
                </p>
                {dest.entranceFees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {dest.entranceFees.length} entrance fee
                    {dest.entranceFees.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {dest.notes && (
              <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                {dest.notes}
              </p>
            )}
          </button>
        ))}
        {results.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground text-center">
            No destinations found
          </p>
        )}
      </div>
    </div>
  );
}

// ── Meal Checkbox ─────────────────────────────────────────────

function MealCheckbox({
  label,
  enabled,
  cost,
  onToggle,
  onCostChange,
}: {
  label: string;
  enabled: boolean;
  cost: number;
  onToggle: (v: boolean) => void;
  onCostChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={enabled}
        onChange={e => onToggle(e.target.checked)}
        className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer shrink-0"
      />
      <span
        className={`text-xs w-16 shrink-0 ${!enabled ? "text-muted-foreground/50" : "text-foreground"}`}
      >
        {label}
      </span>
      <div className="relative flex-1">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
          ฿
        </span>
        <input
          type="number"
          min={0}
          disabled={!enabled}
          value={cost}
          onChange={e => onCostChange(parseInt(e.target.value) || 0)}
          className={`w-full pl-5 pr-2 text-xs border rounded py-1.5 text-right transition-colors ${
            enabled
              ? "border-border bg-background font-medium"
              : "border-border/30 bg-muted/30 text-muted-foreground/50"
          }`}
        />
      </div>
    </div>
  );
}

// ── Attraction Adder (with memory) ───────────────────────────

function AttractionAdder({
  onAdd,
}: {
  onAdd: (name: string, cost: number) => void;
}) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState(0);
  const [open, setOpen] = useState(false);
  const saved = loadSavedAttractions();
  const filtered = name.trim()
    ? saved.filter(a => a.name.toLowerCase().includes(name.toLowerCase()))
    : saved;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, cost);
    persistAttraction(trimmed, cost);
    setName("");
    setCost(0);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div ref={containerRef} className="relative mt-2">
      <div className="flex gap-1.5 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Add attraction / fee name..."
            className="w-full text-xs border border-dashed border-accent/40 rounded px-2 py-1.5 bg-background focus:border-accent focus:outline-none"
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 border border-border rounded bg-background shadow-lg max-h-40 overflow-y-auto">
              {filtered.map(a => (
                <button
                  key={a.name}
                  onMouseDown={() => {
                    setName(a.name);
                    setCost(a.cost);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3 text-accent/60 shrink-0" />
                    {a.name}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {formatTHB(a.cost)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-24 shrink-0">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            ฿
          </span>
          <input
            type="number"
            min={0}
            value={cost}
            onChange={e => setCost(parseInt(e.target.value) || 0)}
            onKeyDown={handleKeyDown}
            className="w-full pl-5 pr-2 text-xs border border-dashed border-accent/40 rounded py-1.5 text-right focus:border-accent focus:outline-none"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-7 h-7 rounded bg-accent text-white flex items-center justify-center hover:bg-accent/90 disabled:opacity-30 transition-opacity shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {saved.length > 0 && !open && (
        <p className="text-xs text-muted-foreground/50 mt-1 pl-1 flex items-center gap-1">
          <Bookmark className="w-3 h-3" />
          {saved.length} saved — type to search
        </p>
      )}
    </div>
  );
}

// ── DayCard ─────────────────────────────────────────────────

function DayCard({
  day,
  canRemove,
  onRemove,
  onChange,
  onApplyDestination,
}: {
  day: DayItinerary;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<DayItinerary>) => void;
  onApplyDestination: (dest: DestinationPreset) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const currentDest = day.destinationId
    ? DESTINATIONS.find(d => d.id === day.destinationId)
    : null;

  const removeAttraction = (id: string) =>
    onChange({ attractions: day.attractions.filter(a => a.id !== id) });

  const updateAttraction = (id: string, patch: Partial<AttractionFee>) =>
    onChange({
      attractions: day.attractions.map(a =>
        a.id === id ? { ...a, ...patch } : a
      ),
    });

  const toggleKosher = (isKosher: boolean) => {
    const m = MEAL_DEFAULTS[isKosher ? "kosher" : "regular"];
    onChange({
      isKosher,
      breakfast: m.breakfast,
      lunch: m.lunch,
      dinner: m.dinner,
    });
  };

  const mealsCost =
    (day.breakfastEnabled ? day.breakfast : 0) +
    (day.lunchEnabled ? day.lunch : 0) +
    (day.dinnerEnabled ? day.dinner : 0);
  const dayVariableTotal =
    mealsCost + day.hotel + day.attractions.reduce((s, a) => s + a.cost, 0);
  const dayFixedTotal = day.carCost + day.driverCost;

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold text-sm shrink-0">
            Day {day.dayNumber}
          </span>
          {day.isKosher && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm font-medium shrink-0">
              Kosher
            </span>
          )}
          {currentDest ? (
            <span className="text-xs text-accent truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {currentDest.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No destination set
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Fixed: {formatTHB(dayFixedTotal)} · Var:{" "}
            {formatTHB(dayVariableTotal)}/pp
          </span>
          {canRemove && (
            <button
              onClick={e => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-3 space-y-4">
          {/* Destination picker */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Destination
            </p>
            <button
              onClick={() => setShowPicker(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-sm hover:border-accent/50 transition-colors text-sm"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                {currentDest
                  ? currentDest.name
                  : "Pick destination to auto-fill costs..."}
              </span>
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showPicker && (
              <DestinationPicker
                onSelect={dest => {
                  onApplyDestination(dest);
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
              />
            )}
            {currentDest?.notes && (
              <p className="text-xs text-muted-foreground/70 italic mt-1 px-1">
                {currentDest.notes}
              </p>
            )}
          </div>

          {/* Car & Driver */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Car className="w-3 h-3" /> Car & Driver (shared cost)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <CurrencyField
                label="Car / Transfer"
                value={day.carCost}
                onChange={v => onChange({ carCost: v })}
                compact
              />
              <CurrencyField
                label="Driver / Guide"
                value={day.driverCost}
                onChange={v => onChange({ driverCost: v })}
                compact
              />
            </div>
          </div>

          {/* Meals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Utensils className="w-3 h-3" /> Meals (per person)
              </p>
              {/* Kosher toggle */}
              <div className="flex items-center overflow-hidden border border-border rounded-sm text-xs">
                <button
                  onClick={() => toggleKosher(false)}
                  className={`px-2.5 py-1 transition-colors ${
                    !day.isKosher
                      ? "bg-accent text-white"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Regular
                </button>
                <button
                  onClick={() => toggleKosher(true)}
                  className={`px-2.5 py-1 transition-colors ${
                    day.isKosher
                      ? "bg-accent text-white"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  ✡ Kosher
                </button>
              </div>
            </div>

            <div className="space-y-0.5">
              <MealCheckbox
                label="Breakfast"
                enabled={day.breakfastEnabled}
                cost={day.breakfast}
                onToggle={v => onChange({ breakfastEnabled: v })}
                onCostChange={v => onChange({ breakfast: v })}
              />
              <MealCheckbox
                label="Lunch"
                enabled={day.lunchEnabled}
                cost={day.lunch}
                onToggle={v => onChange({ lunchEnabled: v })}
                onCostChange={v => onChange({ lunch: v })}
              />
              <MealCheckbox
                label="Dinner"
                enabled={day.dinnerEnabled}
                cost={day.dinner}
                onToggle={v => onChange({ dinnerEnabled: v })}
                onCostChange={v => onChange({ dinner: v })}
              />
            </div>
          </div>

          {/* Hotel */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Hotel className="w-3 h-3" /> Hotel (per person / night)
            </p>
            <CurrencyField
              label=""
              value={day.hotel}
              onChange={v => onChange({ hotel: v })}
              compact
            />
          </div>

          {/* Entrance fees */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Mountain className="w-3 h-3" /> Entrance Fees (per person)
            </p>

            {day.attractions.length === 0 && (
              <p className="text-xs text-muted-foreground italic mb-2">
                Pick a destination to auto-fill, or add below
              </p>
            )}

            {day.attractions.map(attr => (
              <div key={attr.id} className="flex gap-2 items-center mb-1.5">
                <input
                  type="text"
                  value={attr.name}
                  onChange={e =>
                    updateAttraction(attr.id, { name: e.target.value })
                  }
                  className="flex-1 text-xs border border-border rounded px-2 py-1.5 bg-background"
                  placeholder="Fee name"
                />
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    ฿
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={attr.cost}
                    onChange={e =>
                      updateAttraction(attr.id, {
                        cost: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-5 pr-2 text-xs border border-border rounded py-1.5 text-right"
                  />
                </div>
                <button
                  onClick={() => removeAttraction(attr.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <AttractionAdder
              onAdd={(name, cost) =>
                onChange({
                  attractions: [
                    ...day.attractions,
                    { id: nanoid(), name, cost },
                  ],
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary Panel ────────────────────────────────────────────

function SummaryPanel({
  breakdown,
  participants,
  profitMargin,
  days,
}: {
  breakdown: CostBreakdown;
  participants: number;
  profitMargin: number;
  days: DayItinerary[];
}) {
  const empty = breakdown.numberOfDays === 0;
  const destinations = days
    .map(d => DESTINATIONS.find(dest => dest.id === d.destinationId)?.name)
    .filter(Boolean);

  return (
    <>
      {destinations.length > 0 && (
        <Card className="p-4 bg-accent/5 border-accent/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            Trip Route
          </p>
          <div className="space-y-0.5">
            {days.map((d, i) => {
              const dest = DESTINATIONS.find(
                dest => dest.id === d.destinationId
              );
              return (
                <p key={d.id} className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-12 shrink-0">
                    Day {i + 1}
                  </span>
                  {dest ? (
                    <span className="flex items-center gap-1 min-w-0">
                      {dest.name}
                      {d.isKosher && (
                        <span className="text-xs text-blue-600 shrink-0">
                          ✡
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground">
                      Not set
                    </span>
                  )}
                </p>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Cost Breakdown
        </h3>

        {empty ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Configure the trip to see costs
          </p>
        ) : (
          <div className="space-y-1 text-sm">
            <SectionHeader label="Fixed Costs (whole group)" />
            <Row label="Car / Transfer" value={breakdown.totalCar} />
            <Row label="Driver / Guide" value={breakdown.totalDriver} />
            <Row
              label="÷ Participants"
              value={null}
              note={`÷ ${participants}`}
            />
            <Row
              label="Fixed Cost / Person"
              value={breakdown.fixedCostPerPerson}
              bold
              className="border-t pt-1"
            />

            <SectionHeader label="Variable Costs / Person" className="mt-3" />
            {breakdown.dailyBreakdown.map(({ day, totalVariableThisDay }) => (
              <Row
                key={day.id}
                label={day.label}
                value={totalVariableThisDay}
                indent
              />
            ))}
            <Row
              label="Variable Total / Person"
              value={breakdown.variableCostPerPerson}
              bold
              className="border-t pt-1"
            />

            <div className="border-t-2 border-accent/30 my-3" />
            <Row
              label="Base Cost / Person"
              value={breakdown.baseCostPerPerson}
              bold
            />
            <Row
              label={`Profit (${profitMargin}%) / Person`}
              value={breakdown.profitAmountPerPerson}
              className="text-green-700"
            />
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quote Summary
        </h3>

        {empty ? (
          <p className="text-sm text-muted-foreground text-center py-2">—</p>
        ) : (
          <>
            <BigStat
              label="Selling Price / Person"
              value={formatTHB(breakdown.sellingPricePerPerson)}
              sub={`Base ${formatTHB(Math.round(breakdown.baseCostPerPerson))} + ${profitMargin}% margin`}
              color="accent"
            />
            <BigStat
              label="Total Quote"
              value={formatTHB(breakdown.totalSellingPrice)}
              sub={`${participants} person${participants > 1 ? "s" : ""}`}
              color="accent"
            />
            <BigStat
              label="Your Profit"
              value={formatTHB(Math.round(breakdown.totalProfit))}
              sub={`${formatTHB(Math.round(breakdown.profitAmountPerPerson))} / person`}
              color="green"
            />

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Deposit (30%)</span>
                <span className="font-medium">
                  {formatTHB(
                    Math.round((breakdown.totalSellingPrice * 0.3) / 100) * 100
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Balance on tour day</span>
                <span className="font-medium">
                  {formatTHB(
                    breakdown.totalSellingPrice -
                      Math.round((breakdown.totalSellingPrice * 0.3) / 100) *
                        100
                  )}
                </span>
              </div>
            </div>

            {profitMargin < 15 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Margin below 15% — may not cover unexpected costs</span>
              </div>
            )}
            {profitMargin >= 40 && (
              <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-sm text-xs text-blue-800">
                <BadgePercent className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>High margin — verify vs. market rates</span>
              </div>
            )}
          </>
        )}
      </Card>

      {!empty && (
        <Card className="p-4 flex items-start gap-3 bg-muted/30">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Internal tool only. Share the final selling price with customers via
            WhatsApp or the booking form.
          </p>
        </Card>
      )}
    </>
  );
}

// ── Shared sub-components ────────────────────────────────────

function CurrencyField({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs text-muted-foreground mb-1 font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
          ฿
        </span>
        <input
          id={id}
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || 0)}
          className={`w-full pl-6 pr-2 border border-border rounded-sm focus:ring-2 focus:ring-accent focus:border-transparent text-right font-medium ${compact ? "py-1.5 text-xs" : "py-2.5 text-sm"}`}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  note,
  bold,
  indent,
  className = "",
}: {
  label: string;
  value: number | null;
  note?: string;
  bold?: boolean;
  indent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex justify-between py-0.5 ${bold ? "font-semibold" : ""} ${className}`}
    >
      <span className={`text-sm ${indent ? "pl-3 text-muted-foreground" : ""}`}>
        {label}
      </span>
      {value !== null ? (
        <span className="text-sm tabular-nums">
          {formatTHB(Math.round(value))}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">{note}</span>
      )}
    </div>
  );
}

function SectionHeader({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2 mb-1 ${className}`}
    >
      {label}
    </p>
  );
}

function BigStat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "accent" | "green";
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/70">{sub}</p>
      </div>
      <p
        className={`text-xl font-bold tabular-nums ${color === "accent" ? "text-accent" : "text-green-600"}`}
      >
        {value}
      </p>
    </div>
  );
}
