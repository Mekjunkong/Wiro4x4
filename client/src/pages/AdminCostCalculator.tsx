import { useState, useMemo, useCallback, useId } from "react";
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
} from "lucide-react";
import { formatTHB } from "@shared/pricing";
import { nanoid } from "nanoid";

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
  lunch: number;
  dinner: number;
  hotel: number;
  attractions: AttractionFee[];
}

interface TourTypeConfig {
  guideRatePerDay: number;
  transferRatePerDay: number;
}

// ── Constants ────────────────────────────────────────────────

const TOUR_TYPE_DEFAULTS: Record<TourTypeKey, TourTypeConfig> = {
  "1-day": { guideRatePerDay: 1000, transferRatePerDay: 2500 },
  "2-3-day": { guideRatePerDay: 1500, transferRatePerDay: 2500 },
  "7-14-day": { guideRatePerDay: 1500, transferRatePerDay: 2500 },
};

const TOUR_TYPE_LABELS: Record<
  TourTypeKey,
  { label: string; maxDays: number }
> = {
  "1-day": { label: "One Day Tour", maxDays: 1 },
  "2-3-day": { label: "2–3 Day Tour", maxDays: 3 },
  "7-14-day": { label: "7–14 Day Tour", maxDays: 14 },
};

const KNOWN_ATTRACTIONS: { name: string; cost: number }[] = [
  { name: "Wachirathan Waterfall (Doi Inthanon)", cost: 400 },
  { name: "Pha Dok Siew Nature Trail", cost: 200 },
  { name: "Doi Inthanon National Park Fee", cost: 300 },
  { name: "Royal Pagodas", cost: 40 },
  { name: "Elephant Sanctuary Admission", cost: 800 },
  { name: "Hot Springs Entrance", cost: 100 },
];

function makeDay(n: number): DayItinerary {
  return {
    id: nanoid(),
    dayNumber: n,
    label: `Day ${n}`,
    lunch: 450,
    dinner: n > 1 ? 450 : 0,
    hotel: n > 1 ? 1800 : 0,
    attractions: [],
  };
}

// ── Calculation Logic ────────────────────────────────────────

interface CostBreakdown {
  numberOfDays: number;
  totalGuide: number;
  totalTransfer: number;
  totalFixedCosts: number;
  fixedCostPerPerson: number;
  variableCostPerPerson: number;
  baseCostPerPerson: number;
  profitAmountPerPerson: number;
  sellingPricePerPerson: number;
  totalSellingPrice: number;
  totalProfit: number;
  dailyBreakdown: {
    day: DayItinerary;
    totalVariableThisDay: number;
  }[];
}

function calculateCosts(
  participants: number,
  profitMargin: number,
  guideRate: number,
  transferRate: number,
  days: DayItinerary[]
): CostBreakdown {
  if (participants <= 0 || days.length === 0) {
    return {
      numberOfDays: 0,
      totalGuide: 0,
      totalTransfer: 0,
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

  const n = days.length;
  const totalGuide = guideRate * n;
  const totalTransfer = transferRate * n;
  const totalFixedCosts = totalGuide + totalTransfer;
  const fixedCostPerPerson = totalFixedCosts / participants;

  const dailyBreakdown = days.map(day => {
    const attractionTotal = day.attractions.reduce((s, a) => s + a.cost, 0);
    const total = day.lunch + day.dinner + day.hotel + attractionTotal;
    return { day, totalVariableThisDay: total };
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
    numberOfDays: n,
    totalGuide,
    totalTransfer,
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
        {/* Header */}
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
              Tour Cost Calculator
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Internal pricing tool — calculates base cost + profit margin
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
  const defaults = TOUR_TYPE_DEFAULTS[activeType];

  const [participants, setParticipants] = useState(4);
  const [profitMargin, setProfitMargin] = useState(30);
  const [guideRate, setGuideRate] = useState(defaults.guideRatePerDay);
  const [transferRate, setTransferRate] = useState(defaults.transferRatePerDay);
  const [days, setDays] = useState<DayItinerary[]>([makeDay(1)]);

  // When tour type changes, reset to sensible defaults
  const handleTypeChange = (type: TourTypeKey) => {
    setActiveType(type);
    const d = TOUR_TYPE_DEFAULTS[type];
    setGuideRate(d.guideRatePerDay);
    setTransferRate(d.transferRatePerDay);
    setDays([makeDay(1)]);
  };

  const maxDays = TOUR_TYPE_LABELS[activeType].maxDays;

  const addDay = () => {
    if (days.length >= maxDays) return;
    setDays(prev => [...prev, makeDay(prev.length + 1)]);
  };

  const removeDay = (id: string) => {
    setDays(prev => {
      const next = prev.filter(d => d.id !== id);
      return next.map((d, i) => ({
        ...d,
        dayNumber: i + 1,
        label: `Day ${i + 1}`,
      }));
    });
  };

  const updateDay = useCallback((id: string, patch: Partial<DayItinerary>) => {
    setDays(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const breakdown = useMemo(
    () =>
      calculateCosts(participants, profitMargin, guideRate, transferRate, days),
    [participants, profitMargin, guideRate, transferRate, days]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left column: inputs */}
      <div className="xl:col-span-2 space-y-5">
        {/* Tour type tabs */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Tour Type
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

        {/* Global inputs */}
        <Card className="p-5 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Group & Profit Settings
          </h2>

          {/* Participants + profit margin in a 2-col grid */}
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

          {/* Fixed rate overrides */}
          <div className="border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Daily Fixed Rates (shared across group)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <CurrencyField
                label="Tour Guide / day"
                value={guideRate}
                onChange={setGuideRate}
              />
              <CurrencyField
                label="Transfer / day"
                value={transferRate}
                onChange={setTransferRate}
              />
            </div>
          </div>
        </Card>

        {/* Daily itinerary */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Daily Itinerary — Variable Costs per Person
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

      {/* Right column: live summary */}
      <div className="xl:col-span-1">
        <div className="sticky top-6 space-y-4">
          <SummaryPanel
            breakdown={breakdown}
            participants={participants}
            profitMargin={profitMargin}
          />
        </div>
      </div>
    </div>
  );
}

// ── DayCard ─────────────────────────────────────────────────

function DayCard({
  day,
  canRemove,
  onRemove,
  onChange,
}: {
  day: DayItinerary;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<DayItinerary>) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const addAttraction = () =>
    onChange({
      attractions: [
        ...day.attractions,
        { id: nanoid(), name: "Attraction", cost: 200 },
      ],
    });

  const removeAttraction = (id: string) =>
    onChange({ attractions: day.attractions.filter(a => a.id !== id) });

  const updateAttraction = (id: string, patch: Partial<AttractionFee>) =>
    onChange({
      attractions: day.attractions.map(a =>
        a.id === id ? { ...a, ...patch } : a
      ),
    });

  const dayTotal =
    day.lunch +
    day.dinner +
    day.hotel +
    day.attractions.reduce((s, a) => s + a.cost, 0);

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      {/* Day header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <input
            value={day.label}
            onChange={e => onChange({ label: e.target.value })}
            onClick={e => e.stopPropagation()}
            className="font-semibold text-sm bg-transparent border-0 outline-none focus:underline w-28"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-accent">
            {formatTHB(dayTotal)} / person
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

      {/* Day body */}
      {expanded && (
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <CurrencyField
              label={
                <>
                  <Utensils className="inline w-3 h-3 mr-0.5" /> Lunch
                </>
              }
              value={day.lunch}
              onChange={v => onChange({ lunch: v })}
              compact
            />
            <CurrencyField
              label={
                <>
                  <Utensils className="inline w-3 h-3 mr-0.5" /> Dinner
                </>
              }
              value={day.dinner}
              onChange={v => onChange({ dinner: v })}
              compact
            />
            <CurrencyField
              label={
                <>
                  <Hotel className="inline w-3 h-3 mr-0.5" /> Hotel
                </>
              }
              value={day.hotel}
              onChange={v => onChange({ hotel: v })}
              compact
            />
          </div>

          {/* Attractions */}
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
              <Mountain className="w-3 h-3" /> Attractions
            </p>
            {day.attractions.map(attr => (
              <div key={attr.id} className="flex gap-2 items-center">
                <select
                  value={attr.name}
                  onChange={e => {
                    const preset = KNOWN_ATTRACTIONS.find(
                      a => a.name === e.target.value
                    );
                    updateAttraction(attr.id, {
                      name: e.target.value,
                      cost: preset?.cost ?? attr.cost,
                    });
                  }}
                  className="flex-1 text-xs border border-border rounded px-2 py-1.5 bg-background"
                >
                  {KNOWN_ATTRACTIONS.map(a => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                  <option value={attr.name}>{attr.name}</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={attr.cost}
                  onChange={e =>
                    updateAttraction(attr.id, {
                      cost: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 text-xs border border-border rounded px-2 py-1.5 text-right"
                />
                <button
                  onClick={() => removeAttraction(attr.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addAttraction}
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add attraction
            </button>
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
}: {
  breakdown: CostBreakdown;
  participants: number;
  profitMargin: number;
}) {
  const empty = breakdown.numberOfDays === 0;

  return (
    <>
      {/* Cost Breakdown Table */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Cost Breakdown
        </h3>

        {empty ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Configure tour details to see breakdown
          </p>
        ) : (
          <div className="space-y-1 text-sm">
            <SectionHeader label="Fixed Costs (Shared)" />
            <Row label="Tour Guide" value={breakdown.totalGuide} />
            <Row label="Transfer / Vehicle" value={breakdown.totalTransfer} />
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

      {/* Summary Numbers */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
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

            {/* Deposit split */}
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
                <span>
                  High margin — verify competitiveness vs. market rates
                </span>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Export note */}
      {!empty && (
        <Card className="p-4 flex items-start gap-3 bg-muted/30">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            This is an internal planning tool. Use the final selling price when
            generating customer quotes via WhatsApp or the booking form.
          </p>
        </Card>
      )}
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────

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
      <label
        htmlFor={id}
        className="block text-xs text-muted-foreground mb-1 font-medium"
      >
        {label}
      </label>
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
  const colorClass = color === "accent" ? "text-accent" : "text-green-600";
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/70">{sub}</p>
      </div>
      <p className={`text-xl font-bold tabular-nums ${colorClass}`}>{value}</p>
    </div>
  );
}
