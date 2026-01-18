// Tour Package Types for Wiro 4x4 Tour Planning System

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  locations: string[];
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  accommodation?: string;
  notes?: string;
}

export interface CostTemplate {
  accommodationPerNight: {
    budget: number;
    standard: number;
    luxury: number;
    premium: number;
  };
  mealPerDay: number;
  guidePerDay: number;
  transportPerDay: number;
  attractionsPerPerson: number;
}

export interface SeasonMultipliers {
  peak: number;      // High season (Nov-Feb)
  shoulder: number;  // Shoulder (Mar-May, Sep-Oct)
  low: number;       // Low season (Jun-Aug)
}

export interface TourPackage {
  _id: string;
  name: string;
  code: string;
  description: string;
  duration: number;
  status: 'active' | 'inactive' | 'draft';
  destinations: string[];
  attractions: string[];
  includes: {
    accommodation: boolean;
    meals: boolean;
    guide: boolean;
    transport: boolean;
    attractions: boolean;
  };
  minGroupSize: number;
  maxGroupSize: number;
  costTemplate: CostTemplate;
  basePricePerPerson: number;
  seasonMultipliers: SeasonMultipliers;
  itinerary: ItineraryDay[];
  requirements?: string;
  safetyProtocols?: string;
  cancellationPolicy?: string;
  imageUrl?: string;
  images: string[];
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFormData {
  name: string;
  code: string;
  description: string;
  duration: number;
  status: 'active' | 'inactive' | 'draft';
  destinations: string[];
  attractions: string[];
  includes: {
    accommodation: boolean;
    meals: boolean;
    guide: boolean;
    transport: boolean;
    attractions: boolean;
  };
  minGroupSize: number;
  maxGroupSize: number;
  costTemplate: CostTemplate;
  basePricePerPerson: number;
  seasonMultipliers: SeasonMultipliers;
  itinerary: ItineraryDay[];
  requirements?: string;
  safetyProtocols?: string;
  cancellationPolicy?: string;
  imageUrl?: string;
}

export interface CostBreakdown {
  accommodationCost: number;
  mealCost: number;
  guideCost: number;
  transportCost: number;
  attractionsCost: number;
  totalCosts: number;
}

export interface CostEstimate {
  packageId: string;
  packageName: string;
  duration: number;
  numberOfAdults: number;
  numberOfChildren: number;
  totalPeople: number;
  hotelLevel: HotelLevel;
  pickupDate: string;
  season: 'peak' | 'shoulder' | 'low';
  seasonMultiplier: number;
  costBreakdown: CostBreakdown;
  estimatedRevenue: number;
  estimatedProfit: number;
  profitMargin: number;
}

export interface CostEstimateRequest {
  numberOfAdults: number;
  numberOfChildren?: number;
  hotelLevel: HotelLevel;
  pickupDate: string;
  includesGuide?: boolean;
  includesAttractions?: boolean;
}

// Constants
export const HOTEL_LEVELS = ['budget', 'standard', 'luxury', 'premium'] as const;
export type HotelLevel = typeof HOTEL_LEVELS[number];

export const PACKAGE_STATUS = ['active', 'inactive', 'draft'] as const;
export type PackageStatus = typeof PACKAGE_STATUS[number];

export const SEASON_TYPES = ['peak', 'shoulder', 'low'] as const;
export type SeasonType = typeof SEASON_TYPES[number];

// Status display helpers
export const PACKAGE_STATUS_COLORS: Record<PackageStatus, string> = {
  active: '#27ae60',
  inactive: '#95a5a6',
  draft: '#f39c12'
};

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft'
};

export const HOTEL_LEVEL_LABELS: Record<HotelLevel, string> = {
  budget: 'Budget',
  standard: 'Standard',
  luxury: 'Luxury',
  premium: 'Premium'
};

export const SEASON_LABELS: Record<SeasonType, string> = {
  peak: 'Peak Season (Nov-Feb)',
  shoulder: 'Shoulder Season (Mar-May, Sep-Oct)',
  low: 'Low Season (Jun-Aug)'
};

// Default values for forms
export const DEFAULT_COST_TEMPLATE: CostTemplate = {
  accommodationPerNight: {
    budget: 800,
    standard: 1500,
    luxury: 3000,
    premium: 5000
  },
  mealPerDay: 600,
  guidePerDay: 2000,
  transportPerDay: 1500,
  attractionsPerPerson: 1000
};

export const DEFAULT_SEASON_MULTIPLIERS: SeasonMultipliers = {
  peak: 1.3,
  shoulder: 1.1,
  low: 1.0
};

export const DEFAULT_ITINERARY_DAY: ItineraryDay = {
  day: 1,
  title: '',
  description: '',
  activities: [],
  locations: [],
  meals: {
    breakfast: false,
    lunch: false,
    dinner: false
  }
};
