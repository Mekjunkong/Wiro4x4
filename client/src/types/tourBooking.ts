export interface TourBookingFormData {
  // Adults
  numberOfAdults: number;

  // Children
  hasChildren: boolean;
  numberOfChildren?: number;

  // Dates
  pickupDate: string;
  endDate: string;

  // Pickup location
  pickupPoint: 'airport' | 'hotel';
  pickupHotelName?: string;

  // Drop-off location
  dropoffPoint: 'airport' | 'hotel';
  dropoffHotelName?: string;

  // Hotels
  includesHotels: boolean;
  hotelLevel?: 'budget' | 'standard' | 'luxury' | 'premium';

  // Guide
  includesGuide: boolean;

  // Trip and driving
  includesTrip: boolean;
  allowsSelfDriving?: boolean;

  // Attractions
  includesAttractions: boolean;
  selectedAttractions?: string[];

  // Food preferences
  includesFood: boolean;
  foodPreferences?: {
    kosher: boolean;
    vegetarian: boolean;
    vegan: boolean;
    sensitivities?: string;
  };

  // Suggested destinations
  suggestedDestinations: string[];

  // Shabbat
  needsShabbatHotel: boolean;
  shabbatHotel?: 'empress' | 'shangri-la' | 'astra' | 'other';
  otherShabbatHotel?: string;

  // Contact information
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export const ATTRACTIONS = [
  'Elephants',
  'Omegas',
  'Long-neck Karen Village',
  'Rafting',
  'Orchid Park',
  'White Temple',
  'Blue Temple',
  'Tiger Kingdom',
  'Night Safari',
  'Hot Springs'
] as const;

export const DESTINATIONS = [
  'Pai',
  'Chiang Rai',
  'Chiang Mai',
  'Doi Inthanon',
  'Mae Hong Son',
  'Doi Suthep',
  'Golden Triangle',
  'Mae Taeng',
  'Lamphun',
  'Lampang'
] as const;

export const SHABBAT_HOTELS = [
  { value: 'empress', label: 'Empress Hotel' },
  { value: 'shangri-la', label: 'Shangri-La Hotel' },
  { value: 'astra', label: 'Astra Hotel' },
  { value: 'other', label: 'Other' }
] as const;
