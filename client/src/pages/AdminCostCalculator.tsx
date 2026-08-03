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
  AlertCircle,
  BadgePercent,
  MapPin,
  Car,
  Search,
  X,
  Sparkles,
  Bookmark,
  Layers,
  MessageCircle,
  Copy,
  Save,
  FolderOpen,
  ChevronsUpDown,
  RotateCcw,
  User,
  Calendar,
  CheckCheck,
  Pencil,
} from "lucide-react";
import { DEPOSIT_RATE, formatUSD } from "@shared/pricing";
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
const QUOTES_KEY = "wiro_calc_quotes";

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

// ── Client Info ───────────────────────────────────────────────

interface ClientInfo {
  clientName: string;
  arrivalDate: string;
  departureDate: string;
  notes: string;
}

const EMPTY_CLIENT: ClientInfo = {
  clientName: "",
  arrivalDate: "",
  departureDate: "",
  notes: "",
};

// ── Saved Quotes ──────────────────────────────────────────────

interface SavedQuote {
  id: string;
  name: string;
  savedAt: string;
  participants: number;
  profitMargin: number;
  tourType: TourTypeKey;
  days: DayItinerary[];
  client?: ClientInfo;
}

function loadSavedQuotes(): SavedQuote[] {
  try {
    return JSON.parse(localStorage.getItem(QUOTES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQuote(quote: SavedQuote) {
  try {
    const list = loadSavedQuotes().filter(q => q.id !== quote.id);
    localStorage.setItem(
      QUOTES_KEY,
      JSON.stringify([quote, ...list].slice(0, 20))
    );
  } catch {}
}

function deleteQuote(id: string) {
  try {
    const list = loadSavedQuotes().filter(q => q.id !== id);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(list));
  } catch {}
}

// ── Meal defaults ─────────────────────────────────────────────

const MEAL_DEFAULTS = {
  regular: { breakfast: 80, lunch: 180, dinner: 250 },
  kosher: { breakfast: 150, lunch: 300, dinner: 450 },
} as const;

// ── Tour Templates ────────────────────────────────────────────

interface TemplateDay {
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
  numberOfVehicles: number;
  driverCost: number;
  attractions: { name: string; cost: number }[];
}

interface TourTemplate {
  id: string;
  name: string;
  description: string;
  tourType: TourTypeKey;
  days: TemplateDay[];
}

type TourTypeKey = "1-day" | "2-3-day" | "7-14-day";

const TOUR_TEMPLATES: TourTemplate[] = [
  {
    id: "chiang-mai-pai-3d",
    name: "Chiang Mai → Pai  (3 days)",
    description:
      "Karen tribe · Mok Fha waterfall · Pa Pae hot spring · Cave lodge · Elephant camp · Long neck village",
    tourType: "2-3-day",
    days: [
      {
        dayNumber: 1,
        label: "Day 1 — Chiang Mai → Pai",
        destinationId: "pai",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: true,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 1500,
        carCost: 3500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Karen Tribe Village", cost: 0 },
          { name: "Mok Fha Waterfall (trekking)", cost: 0 },
          { name: "Pa Pae Hot Spring", cost: 300 },
          { name: "Pai Canyon (sunset)", cost: 0 },
        ],
      },
      {
        dayNumber: 2,
        label: "Day 2 — Pai Adventure",
        destinationId: "pai",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: true,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 1500,
        carCost: 2500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Kiew Lom Viewpoint", cost: 0 },
          { name: "Cave Lodge (stalactite + bamboo raft bat cave)", cost: 350 },
          { name: "Lahu Tribe Village (Thailand–Myanmar border)", cost: 0 },
          { name: "Ban Sai Chon Chinese Refugee Village", cost: 0 },
        ],
      },
      {
        dayNumber: 3,
        label: "Day 3 — Pai → Chiang Mai",
        destinationId: "elephant-sanctuary",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: false,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 0,
        carCost: 3500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Pai History Bridge", cost: 0 },
          {
            name: "Meateang Elephant Camp (show + riding + ox kart + bamboo raft)",
            cost: 1500,
          },
          { name: "Karen Long Neck & Big Ears Village", cost: 200 },
          { name: "Hmong Tribe Village", cost: 0 },
        ],
      },
    ],
  },
  {
    id: "doi-inthanon-1d",
    name: "Doi Inthanon Day Trip  (1 day)",
    description:
      "Roof of Thailand · Royal Pagodas · Wachirathan Waterfall · Pha Dok Siew nature trail",
    tourType: "1-day",
    days: [
      {
        dayNumber: 1,
        label: "Doi Inthanon National Park",
        destinationId: "doi-inthanon",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: false,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 0,
        carCost: 2500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "National Park Entry", cost: 300 },
          { name: "Royal Pagodas (King & Queen)", cost: 40 },
        ],
      },
    ],
  },
  {
    id: "chiang-rai-2d",
    name: "Chiang Rai Explorer  (2 days)",
    description:
      "White Temple · Black House · Blue Temple · Golden Triangle · Long Neck Village · Night Bazaar",
    tourType: "2-3-day",
    days: [
      {
        dayNumber: 1,
        label: "Day 1 — Chiang Rai Temples",
        destinationId: "chiang-rai",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: true,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 1800,
        carCost: 3500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "White Temple (Wat Rong Khun)", cost: 100 },
          { name: "Blue Temple (free)", cost: 0 },
          { name: "Black House Museum (Baan Dam)", cost: 80 },
        ],
      },
      {
        dayNumber: 2,
        label: "Day 2 — Golden Triangle → Chiang Mai",
        destinationId: "golden-triangle-myanmar",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: false,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 0,
        carCost: 4000,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Hall of Opium Museum", cost: 200 },
          { name: "Golden Triangle Viewpoint", cost: 50 },
          { name: "Karen Long Neck Village", cost: 200 },
          { name: "Boat to Laos island (optional)", cost: 100 },
        ],
      },
    ],
  },
  {
    id: "mae-hong-son-3d",
    name: "Mae Hong Son Loop  (3 days)",
    description:
      "Tham Lot Cave · Pang Mapha · Ban Rak Thai Chinese village · Pha Sua Waterfall · Padaung tribe",
    tourType: "2-3-day",
    days: [
      {
        dayNumber: 1,
        label: "Day 1 — Chiang Mai → Soppong",
        destinationId: "mae-hong-son",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: true,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 1500,
        carCost: 3500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Tham Lot Cave (with guide)", cost: 350 },
          { name: "Lod Cave bamboo raft", cost: 150 },
        ],
      },
      {
        dayNumber: 2,
        label: "Day 2 — Mae Hong Son Town",
        destinationId: "mae-hong-son",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: true,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 1500,
        carCost: 2500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Ban Rak Thai Chinese Village", cost: 0 },
          { name: "Pha Sua Waterfall", cost: 0 },
          { name: "Padaung (Long Neck) Village", cost: 300 },
        ],
      },
      {
        dayNumber: 3,
        label: "Day 3 — Return to Chiang Mai",
        destinationId: "mae-hong-son",
        isKosher: false,
        breakfastEnabled: false,
        breakfast: MEAL_DEFAULTS.regular.breakfast,
        lunchEnabled: true,
        lunch: MEAL_DEFAULTS.regular.lunch,
        dinnerEnabled: false,
        dinner: MEAL_DEFAULTS.regular.dinner,
        hotel: 0,
        carCost: 3500,
        numberOfVehicles: 1,
        driverCost: 1000,
        attractions: [
          { name: "Wat Phra That Doi Kong Mu viewpoint", cost: 0 },
          { name: "Pang Tong Royal Project", cost: 0 },
        ],
      },
    ],
  },
];

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
  numberOfVehicles: number;
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
    numberOfVehicles: 1,
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

  const totalCar = days.reduce((s, d) => s + d.carCost * d.numberOfVehicles, 0);
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
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (!loading && (!isAuthenticated || user?.role !== "admin")) {
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
  const [profitInput, setProfitInput] = useState("30");
  const [days, setDays] = useState<DayItinerary[]>([makeDay(1)]);
  const [clientInfo, setClientInfo] = useState<ClientInfo>(EMPTY_CLIENT);
  const [saveNameOpen, setSaveNameOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [quotesOpen, setQuotesOpen] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(loadSavedQuotes);

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

  const copyDay = (id: string) => {
    if (days.length >= maxDays) return;
    const src = days.find(d => d.id === id);
    if (!src) return;
    const copy: DayItinerary = {
      ...src,
      id: nanoid(),
      dayNumber: days.length + 1,
      label: `Day ${days.length + 1}`,
      attractions: src.attractions.map(a => ({ ...a, id: nanoid() })),
    };
    setDays(prev => [...prev, copy]);
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

  const applyCarToAll = (fromId: string) => {
    const src = days.find(d => d.id === fromId);
    if (!src) return;
    setDays(prev =>
      prev.map(d => ({
        ...d,
        carCost: src.carCost,
        driverCost: src.driverCost,
      }))
    );
  };

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

  const loadTemplate = useCallback((template: TourTemplate) => {
    setActiveType(template.tourType);
    setDays(
      template.days.map(d => ({
        ...d,
        id: nanoid(),
        attractions: d.attractions.map(a => ({ ...a, id: nanoid() })),
      }))
    );
  }, []);

  const handleReset = () => {
    setActiveType("1-day");
    setParticipants(4);
    setProfitMargin(30);
    setProfitInput("30");
    setDays([makeDay(1)]);
    setClientInfo(EMPTY_CLIENT);
  };

  const toggleAllKosher = (isKosher: boolean) => {
    setDays(prev =>
      prev.map(d => {
        const m = MEAL_DEFAULTS[isKosher ? "kosher" : "regular"];
        return {
          ...d,
          isKosher,
          breakfast: m.breakfast,
          lunch: m.lunch,
          dinner: m.dinner,
        };
      })
    );
  };

  const handleSaveQuote = () => {
    const name = saveName.trim() || `Quote ${new Date().toLocaleDateString()}`;
    const q: SavedQuote = {
      id: nanoid(),
      name,
      savedAt: new Date().toISOString(),
      participants,
      profitMargin,
      tourType: activeType,
      days,
      client: clientInfo,
    };
    saveQuote(q);
    setSavedQuotes(loadSavedQuotes());
    setSaveName("");
    setSaveNameOpen(false);
  };

  const handleLoadQuote = (q: SavedQuote) => {
    setActiveType(q.tourType);
    setParticipants(q.participants);
    setProfitMargin(q.profitMargin);
    setProfitInput(String(q.profitMargin));
    setDays(q.days);
    setClientInfo(q.client ?? EMPTY_CLIENT);
    setQuotesOpen(false);
  };

  const handleDeleteQuote = (id: string) => {
    deleteQuote(id);
    setSavedQuotes(loadSavedQuotes());
  };

  const breakdown = useMemo(
    () => calculateCosts(participants, profitMargin, days),
    [participants, profitMargin, days]
  );

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-20">
        {/* Left: inputs */}
        <div className="xl:col-span-2 space-y-5">
          {/* Tour type */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Trip Duration
              </h2>
              <div className="flex items-center gap-2">
                {/* Save */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSaveNameOpen(v => !v);
                      setQuotesOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-xs border rounded-sm px-2.5 py-1.5 text-accent border-accent/30 hover:bg-accent/5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  {saveNameOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setSaveNameOpen(false)}
                      />
                      <div className="absolute right-0 z-30 top-full mt-1 w-64 border border-border rounded-sm bg-background shadow-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Save quote as
                        </p>
                        <input
                          autoFocus
                          value={saveName}
                          onChange={e => setSaveName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleSaveQuote();
                          }}
                          placeholder="e.g. Family 4 pax Pai 3D"
                          className="w-full text-sm border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={handleSaveQuote}
                        >
                          Save
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                {/* Load */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setQuotesOpen(v => !v);
                      setSaveNameOpen(false);
                    }}
                    className={`flex items-center gap-1.5 text-xs border rounded-sm px-2.5 py-1.5 transition-colors ${quotesOpen ? "bg-accent text-white border-accent" : "text-accent border-accent/30 hover:bg-accent/5"}`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Load{" "}
                    {savedQuotes.length > 0 && (
                      <span className="ml-0.5 bg-accent/20 text-accent rounded-full px-1.5">
                        {savedQuotes.length}
                      </span>
                    )}
                  </button>
                  {quotesOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setQuotesOpen(false)}
                      />
                      <div className="absolute right-0 z-30 top-full mt-1 w-80 border border-border rounded-sm bg-background shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-border bg-muted/40">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Saved Quotes
                          </p>
                        </div>
                        {savedQuotes.length === 0 && (
                          <p className="px-3 py-4 text-sm text-center text-muted-foreground">
                            No saved quotes yet
                          </p>
                        )}
                        {savedQuotes.map(q => (
                          <div
                            key={q.id}
                            className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/40"
                          >
                            <button
                              onClick={() => handleLoadQuote(q)}
                              className="flex-1 text-left min-w-0"
                            >
                              <p className="text-sm font-medium truncate">
                                {q.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {q.participants} pax · {q.days.length} day
                                {q.days.length > 1 ? "s" : ""} ·{" "}
                                {new Date(q.savedAt).toLocaleDateString()}
                              </p>
                            </button>
                            <button
                              onClick={() => handleDeleteQuote(q.id)}
                              className="text-red-400 hover:text-red-600 shrink-0 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <TemplateLoader onLoad={loadTemplate} />
              </div>
            </div>
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

          {/* Client Info */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Client Info
              </h2>
              <span className="text-xs text-muted-foreground italic">
                Optional — included in WhatsApp quote
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientInfo.clientName}
                  onChange={e =>
                    setClientInfo(c => ({ ...c, clientName: e.target.value }))
                  }
                  placeholder="e.g. Cohen Family"
                  className="w-full text-sm border border-border rounded-sm px-3 py-1.5 focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Notes / Special Requests
                </label>
                <input
                  type="text"
                  value={clientInfo.notes}
                  onChange={e =>
                    setClientInfo(c => ({ ...c, notes: e.target.value }))
                  }
                  placeholder="e.g. wheelchair accessible, gluten-free"
                  className="w-full text-sm border border-border rounded-sm px-3 py-1.5 focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Arrival Date
                </label>
                <input
                  type="date"
                  value={clientInfo.arrivalDate}
                  onChange={e =>
                    setClientInfo(c => ({ ...c, arrivalDate: e.target.value }))
                  }
                  className="w-full text-sm border border-border rounded-sm px-3 py-1.5 focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Departure Date
                </label>
                <input
                  type="date"
                  value={clientInfo.departureDate}
                  onChange={e =>
                    setClientInfo(c => ({
                      ...c,
                      departureDate: e.target.value,
                    }))
                  }
                  className="w-full text-sm border border-border rounded-sm px-3 py-1.5 focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Group & profit */}
          <Card className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Group & Profit
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-sm px-2 py-1 hover:bg-muted transition-colors"
                title="Reset everything"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
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
                      setParticipants(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
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
                {/* Quick picks */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {[2, 4, 6, 8, 10, 12].map(n => (
                    <button
                      key={n}
                      onClick={() => setParticipants(n)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        participants === n
                          ? "bg-accent text-white border-accent"
                          : "border-border hover:border-accent/50 text-muted-foreground"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  <TrendingUp className="inline w-3.5 h-3.5 mr-1" />
                  Profit Margin
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min={0}
                    max={80}
                    step={5}
                    value={profitMargin}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setProfitMargin(v);
                      setProfitInput(String(v));
                    }}
                    className="flex-1 accent-[var(--accent)]"
                  />
                  <div className="relative w-16 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={profitInput}
                      onChange={e => {
                        setProfitInput(e.target.value);
                        const v = Math.min(
                          80,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        setProfitMargin(v);
                      }}
                      onBlur={() => setProfitInput(String(profitMargin))}
                      className="w-full text-center border border-border rounded-sm py-1.5 text-sm font-bold focus:ring-2 focus:ring-accent focus:border-transparent pr-4"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                {/* Kosher all-days toggle */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    All days:
                  </span>
                  <div className="flex items-center overflow-hidden border border-border rounded-sm text-xs">
                    <button
                      onClick={() => toggleAllKosher(false)}
                      className={`px-2.5 py-1 transition-colors ${
                        days.every(d => !d.isKosher)
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      Regular
                    </button>
                    <button
                      onClick={() => toggleAllKosher(true)}
                      className={`px-2.5 py-1 transition-colors ${
                        days.every(d => d.isKosher)
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      ✡ All Kosher
                    </button>
                  </div>
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
                  canCopy={days.length < maxDays}
                  onRemove={() => removeDay(day.id)}
                  onCopy={() => copyDay(day.id)}
                  onChange={patch => updateDay(day.id, patch)}
                  onApplyDestination={dest => applyDestination(day.id, dest)}
                  onApplyCarToAll={() => applyCarToAll(day.id)}
                  multiDay={days.length > 1}
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
              clientInfo={clientInfo}
            />
          </div>
        </div>
      </div>

      {/* Sticky footer bar — always visible */}
      {breakdown.numberOfDays > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                {participants} pax · {breakdown.numberOfDays} day
                {breakdown.numberOfDays > 1 ? "s" : ""} · {profitMargin}% margin
              </span>
              <span className="font-semibold">
                {formatUSD(breakdown.sellingPricePerPerson)}{" "}
                <span className="text-muted-foreground font-normal">
                  / person
                </span>
              </span>
              <span className="text-accent font-bold text-base">
                {formatUSD(breakdown.totalSellingPrice)} total
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Deposit {Math.round(DEPOSIT_RATE * 100)}%:{" "}
                {formatUSD(
                  Math.round(
                    (breakdown.totalSellingPrice * DEPOSIT_RATE) / 100
                  ) * 100
                )}
              </span>
              <span className="text-green-600 font-semibold">
                Profit: {formatUSD(Math.round(breakdown.totalProfit))}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Template Loader ──────────────────────────────────────────

function TemplateLoader({ onLoad }: { onLoad: (t: TourTemplate) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs border rounded-sm px-2.5 py-1.5 transition-colors ${
          open
            ? "bg-accent text-white border-accent"
            : "text-accent border-accent/30 hover:bg-accent/5"
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        Load Template
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 top-full mt-1 w-80 border border-border rounded-sm bg-background shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tour Templates
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Pre-fills all days, meals & attractions
              </p>
            </div>
            {TOUR_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  onLoad(t);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-3 hover:bg-accent/5 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded shrink-0">
                    {t.days.length} days
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
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
                  Car ฿{dest.suggestedCarPerDay.toLocaleString()}/day
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
                    {formatUSD(a.cost)}
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
  canCopy,
  onRemove,
  onCopy,
  onChange,
  onApplyDestination,
  onApplyCarToAll,
  multiDay,
}: {
  day: DayItinerary;
  canRemove: boolean;
  canCopy: boolean;
  onRemove: () => void;
  onCopy: () => void;
  onChange: (patch: Partial<DayItinerary>) => void;
  onApplyDestination: (dest: DestinationPreset) => void;
  onApplyCarToAll: () => void;
  multiDay: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(day.label);

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
      <div className="w-full flex items-center justify-between px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => setExpanded(v => !v)} className="shrink-0">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <span className="font-semibold text-sm shrink-0">
            Day {day.dayNumber}
          </span>
          {day.isKosher && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm font-medium shrink-0">
              Kosher
            </span>
          )}
          {editingLabel ? (
            <input
              autoFocus
              value={labelDraft}
              onChange={e => setLabelDraft(e.target.value)}
              onBlur={() => {
                onChange({ label: labelDraft.trim() || day.label });
                setEditingLabel(false);
              }}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === "Escape") {
                  onChange({ label: labelDraft.trim() || day.label });
                  setEditingLabel(false);
                }
              }}
              className="flex-1 text-xs border border-accent rounded px-1.5 py-0.5 focus:outline-none min-w-0"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <button
              className="flex items-center gap-1 text-xs text-accent truncate hover:underline min-w-0"
              onClick={e => {
                e.stopPropagation();
                setLabelDraft(day.label);
                setEditingLabel(true);
              }}
              title="Click to rename"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {currentDest ? currentDest.name : day.label}
              </span>
              <Pencil className="w-2.5 h-2.5 shrink-0 opacity-50" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            ฿{dayFixedTotal.toLocaleString()} fix · ฿
            {dayVariableTotal.toLocaleString()}/pp
          </span>
          {canCopy && (
            <button
              onClick={e => {
                e.stopPropagation();
                onCopy();
              }}
              className="text-muted-foreground hover:text-accent p-1 transition-colors"
              title="Copy this day"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
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
      </div>

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
                label="Car / Transfer (per vehicle)"
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
            {/* Vehicles count + apply to all */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Vehicles:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onChange({
                      numberOfVehicles: Math.max(1, day.numberOfVehicles - 1),
                    })
                  }
                  className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs hover:bg-muted"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-4 text-center">
                  {day.numberOfVehicles}
                </span>
                <button
                  onClick={() =>
                    onChange({ numberOfVehicles: day.numberOfVehicles + 1 })
                  }
                  className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs hover:bg-muted"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                = ฿{(day.carCost * day.numberOfVehicles).toLocaleString()} total
                car
              </span>
              {multiDay && (
                <button
                  onClick={onApplyCarToAll}
                  className="ml-auto text-xs text-accent border border-accent/30 rounded px-2 py-0.5 hover:bg-accent/5 transition-colors flex items-center gap-1"
                  title="Apply this car & driver cost to all days"
                >
                  <ChevronsUpDown className="w-3 h-3" />
                  Apply to all days
                </button>
              )}
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
  clientInfo,
}: {
  breakdown: CostBreakdown;
  participants: number;
  profitMargin: number;
  days: DayItinerary[];
  clientInfo: ClientInfo;
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
              value={formatUSD(breakdown.sellingPricePerPerson)}
              sub={`Base ${formatUSD(Math.round(breakdown.baseCostPerPerson))} + ${profitMargin}% margin`}
              color="accent"
            />
            <BigStat
              label="Total Quote"
              value={formatUSD(breakdown.totalSellingPrice)}
              sub={`${participants} person${participants > 1 ? "s" : ""}`}
              color="accent"
            />
            <BigStat
              label="Your Profit"
              value={formatUSD(Math.round(breakdown.totalProfit))}
              sub={`${formatUSD(Math.round(breakdown.profitAmountPerPerson))} / person`}
              color="green"
            />

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Deposit ({Math.round(DEPOSIT_RATE * 100)}%)</span>
                <span className="font-medium">
                  {formatUSD(
                    Math.round(
                      (breakdown.totalSellingPrice * DEPOSIT_RATE) / 100
                    ) * 100
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Balance on tour day</span>
                <span className="font-medium">
                  {formatUSD(
                    breakdown.totalSellingPrice -
                      Math.round(
                        (breakdown.totalSellingPrice * DEPOSIT_RATE) / 100
                      ) *
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
        <WhatsAppQuoteButton
          breakdown={breakdown}
          participants={participants}
          days={days}
          clientInfo={clientInfo}
        />
      )}
    </>
  );
}

// ── WhatsApp Quote Button ────────────────────────────────────

function WhatsAppQuoteButton({
  breakdown,
  participants,
  days,
  clientInfo,
}: {
  breakdown: CostBreakdown;
  participants: number;
  days: DayItinerary[];
  clientInfo: ClientInfo;
}) {
  const [copied, setCopied] = useState(false);

  const route = days
    .map(d => {
      const dest = DESTINATIONS.find(dest => dest.id === d.destinationId);
      return dest ? dest.name : d.label;
    })
    .join(" → ");

  const deposit =
    Math.round((breakdown.totalSellingPrice * DEPOSIT_RATE) / 100) * 100;
  const balance = breakdown.totalSellingPrice - deposit;
  const hasKosher = days.some(d => d.isKosher);

  const dayLines = breakdown.dailyBreakdown.map(
    ({ day, totalVariableThisDay }) => {
      const dest = DESTINATIONS.find(d => d.id === day.destinationId);
      const name = dest ? dest.name : day.label;
      return `  Day ${day.dayNumber}: ${name}${day.isKosher ? " ✡" : ""} — ${formatUSD(totalVariableThisDay)}/pp`;
    }
  );

  const lines: (string | null)[] = [
    `🏕 *WIRO 4x4 Tour Quote*`,
    clientInfo.clientName ? `👤 Client: ${clientInfo.clientName}` : null,
    clientInfo.arrivalDate
      ? `📅 Dates: ${clientInfo.arrivalDate}${clientInfo.departureDate ? ` → ${clientInfo.departureDate}` : ""}`
      : null,
    ``,
    route ? `📍 Route: ${route}` : null,
    `🗓 Duration: ${breakdown.numberOfDays} day${breakdown.numberOfDays > 1 ? "s" : ""}`,
    `👥 Group: ${participants} person${participants > 1 ? "s" : ""}`,
    hasKosher ? `✡ Kosher meals included` : null,
    ``,
    `*Day-by-Day Costs (per person):*`,
    ...dayLines,
    ``,
    `💰 *${formatUSD(breakdown.sellingPricePerPerson)} per person*`,
    `📦 Total: *${formatUSD(breakdown.totalSellingPrice)}*`,
    ``,
    `Deposit (${Math.round(DEPOSIT_RATE * 100)}%): ${formatUSD(deposit)}`,
    `Balance on tour day: ${formatUSD(balance)}`,
    ``,
    `Includes: private 4x4, Hebrew-speaking guide, all entrance fees`,
    hasKosher ? `Includes: kosher meals throughout` : null,
    clientInfo.notes ? `Note: ${clientInfo.notes}` : null,
    ``,
    `To book: https://www.wiro4x4indochina.com/booking`,
  ];

  const message = lines.filter(l => l !== null).join("\n");
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-sm py-3 text-sm transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        Send Quote via WhatsApp
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full border border-border rounded-sm py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        {copied ? (
          <>
            <CheckCheck className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Quote Text
          </>
        )}
      </button>
    </div>
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
          {formatUSD(Math.round(value))}
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
