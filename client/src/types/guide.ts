// TypeScript interfaces for Guide model
// Mirrors the Mongoose schema in client/server/src/models/Guide.js

export type EmploymentType = 'full-time' | 'part-time' | 'freelance' | 'contractor';
export type GuideStatus = 'active' | 'inactive' | 'on-leave' | 'suspended';

export type LanguageName =
  | 'Thai'
  | 'English'
  | 'Mandarin Chinese'
  | 'Cantonese'
  | 'Japanese'
  | 'Korean'
  | 'French'
  | 'German'
  | 'Russian'
  | 'Spanish'
  | 'Arabic'
  | 'Hebrew'
  | 'Hindi'
  | 'Malay'
  | 'Vietnamese';

export type LanguageProficiency = 'basic' | 'conversational' | 'fluent' | 'native';

export type OffRoadExperience = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type VehicleType = '4x4-suv' | 'pickup-truck' | 'van' | 'minibus' | 'motorcycle' | 'atv';

export type DrivingSkill =
  | 'mud-driving'
  | 'sand-dune-navigation'
  | 'river-crossing'
  | 'steep-incline-descent'
  | 'rock-crawling'
  | 'night-driving'
  | 'convoy-leading'
  | 'vehicle-recovery'
  | 'winching'
  | 'tire-changing'
  | 'basic-mechanics'
  | 'engine-troubleshooting';

export type ActivitySkill =
  // Water Activities
  | 'kayaking'
  | 'white-water-rafting'
  | 'snorkeling'
  | 'scuba-diving'
  | 'stand-up-paddleboarding'
  | 'fishing'
  | 'boat-operation'
  // Land Activities
  | 'rock-climbing'
  | 'abseiling'
  | 'zip-lining'
  | 'mountain-biking'
  | 'hiking'
  | 'trekking'
  | 'camping'
  | 'jungle-survival'
  // Cultural Activities
  | 'cooking-instruction'
  | 'thai-massage-demo'
  | 'meditation-instruction'
  | 'muay-thai-basics'
  | 'traditional-crafts'
  // Photography & Media
  | 'photography'
  | 'videography'
  | 'drone-operation'
  | 'wildlife-photography'
  // Specialized
  | 'bird-watching'
  | 'wildlife-tracking'
  | 'elephant-care'
  | 'farm-activities'
  | 'tea-tasting'
  | 'wine-pairing';

export type Specialization =
  // Cultural & Historical
  | 'thai-history'
  | 'buddhist-culture'
  | 'temple-architecture'
  | 'royal-family-history'
  | 'ancient-civilizations'
  | 'hill-tribes'
  | 'ethnic-minorities'
  // Nature & Wildlife
  | 'tropical-ecology'
  | 'bird-species'
  | 'marine-biology'
  | 'botany'
  | 'jungle-flora-fauna'
  | 'elephant-behavior'
  | 'reptiles-amphibians'
  // Culinary
  | 'thai-cuisine'
  | 'street-food'
  | 'regional-specialties'
  | 'fruit-varieties'
  | 'cooking-techniques'
  | 'food-safety'
  // Geography & Environment
  | 'geology'
  | 'weather-patterns'
  | 'sustainable-tourism'
  | 'conservation'
  // Wellness & Spirituality
  | 'meditation'
  | 'yoga'
  | 'traditional-medicine'
  | 'spiritual-practices'
  // Adventure Tourism
  | 'adventure-tourism'
  | 'eco-tourism'
  | 'agro-tourism'
  | 'wellness-tourism'
  | 'photography-tours'
  | 'luxury-travel';

export type CertificationCategory =
  // Safety & Medical
  | 'first-aid'
  | 'cpr'
  | 'wilderness-first-responder'
  | 'advanced-first-aid'
  | 'emergency-medical-technician'
  // Tourism & Guiding
  | 'tour-guide-license'
  | 'national-park-guide'
  | 'regional-guide-license'
  | 'international-tour-director'
  // Activity-Specific
  | 'scuba-diving-instructor'
  | 'kayak-instructor'
  | 'climbing-instructor'
  | 'rafting-guide'
  | 'survival-instructor'
  // Driving & Vehicle
  | 'defensive-driving'
  | 'off-road-driving'
  | '4x4-recovery'
  | 'commercial-drivers-license'
  // Food & Hospitality
  | 'food-safety-handler'
  | 'sommelier'
  | 'culinary-certificate'
  // Cultural
  | 'cultural-heritage-interpreter'
  | 'language-proficiency'
  | 'meditation-teacher'
  // Insurance & Legal
  | 'professional-liability-insurance'
  | 'tour-operator-insurance';

export type CertificationStatus = 'active' | 'expired' | 'pending-renewal';

export type TourType =
  | 'day-trip'
  | 'multi-day'
  | 'luxury'
  | 'budget'
  | 'family'
  | 'solo-travelers'
  | 'corporate'
  | 'adventure'
  | 'cultural'
  | 'eco-tour'
  | 'photography'
  | 'wellness'
  | 'senior-travelers'
  | 'student-groups';

export type ThailandRegion =
  | 'Bangkok'
  | 'Chiang Mai'
  | 'Chiang Rai'
  | 'Phuket'
  | 'Krabi'
  | 'Koh Samui'
  | 'Pattaya'
  | 'Ayutthaya'
  | 'Sukhothai'
  | 'Isaan'
  | 'Kanchanaburi'
  | 'Khao Yai'
  | 'Pai'
  | 'Mae Hong Son'
  | 'Hua Hin'
  | 'Khao Sok'
  | 'Similan Islands'
  | 'Golden Triangle';

export type CommunicationStyle = 'formal' | 'casual' | 'balanced';
export type SkillLevel = 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding';
export type EnthusiasmLevel = 'low' | 'moderate' | 'high' | 'exceptional';
export type CulturalSensitivityLevel = 'developing' | 'competent' | 'proficient' | 'expert';
export type FlexibilityLevel = 'rigid' | 'moderate' | 'flexible' | 'highly-flexible';
export type HumorLevel = 'none' | 'subtle' | 'moderate' | 'strong';

export interface LanguageSkill {
  language: LanguageName;
  proficiency: LanguageProficiency;
  certifications?: string[];
}

export interface DrivingSkills {
  hasLicense: boolean;
  licenseNumber?: string;
  licenseExpiry?: Date;
  vehicleTypes: VehicleType[];
  offRoadExperience: OffRoadExperience;
  specializedSkills: DrivingSkill[];
}

export interface Certification {
  name: string;
  issuingOrganization?: string;
  certificationNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  status: CertificationStatus;
  documentUrl?: string;
  category: CertificationCategory;
}

export interface DestinationExpertise {
  destination: string;
  timesVisited: number;
  lastVisited?: Date;
}

export interface Experience {
  yearsGuiding: number;
  totalToursLed: number;
  totalGuestsGuided: number;
  largestGroupSize: number;
  tourTypesExperience: TourType[];
  destinationsExpertise: DestinationExpertise[];
}

export interface Performance {
  averageRating: number;
  totalReviews: number;
  recommendationRate: number;
  repeatClientRate: number;
  tipAverage: number;
  customerCompliments: number;
  customerComplaints: number;
}

export interface BlackoutDate {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface Availability {
  preferredRegions: ThailandRegion[];
  willingToTravel: boolean;
  maxConsecutiveDays: number;
  blackoutDates: BlackoutDate[];
  preferredGroupSize: {
    min: number;
    max: number;
  };
}

export interface Pricing {
  baseDayRate: number;
  premiumRate: number;
  currency: string;
  overtimeRate: number;
  multiDayDiscount: number;
  lastRateUpdate: Date;
}

export interface SoftSkills {
  communicationStyle: CommunicationStyle;
  teachingAbility: SkillLevel;
  enthusiasm: EnthusiasmLevel;
  culturalSensitivity: CulturalSensitivityLevel;
  problemSolving: SkillLevel;
  punctuality: SkillLevel;
  flexibility: FlexibilityLevel;
  humor: HumorLevel;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  alternatePhone?: string;
}

export interface Guide {
  _id?: string;

  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  nationalId?: string;

  // Employment Status
  employmentType: EmploymentType;
  status: GuideStatus;
  joinDate: Date;

  // Skills
  languages: LanguageSkill[];
  drivingSkills: DrivingSkills;
  activitySkills: ActivitySkill[];
  specializations: Specialization[];
  certifications: Certification[];

  // Experience & Performance
  experience: Experience;
  performance: Performance;

  // Availability & Scheduling
  availability: Availability;

  // Pricing
  pricing: Pricing;

  // Soft Skills
  softSkills: SoftSkills;

  // Emergency Contact
  emergencyContact?: EmergencyContact;

  // Admin
  adminNotes?: string;
  internalRating?: number;
  tags?: string[];

  // Tracking
  lastActiveDate?: Date;
  nextAvailableDate?: Date;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Form data for creating/editing guides
export interface GuideFormData extends Omit<Guide, '_id' | 'createdAt' | 'updatedAt'> {}

// Constants for dropdowns and forms
export const LANGUAGE_OPTIONS: LanguageName[] = [
  'Thai',
  'English',
  'Mandarin Chinese',
  'Cantonese',
  'Japanese',
  'Korean',
  'French',
  'German',
  'Russian',
  'Spanish',
  'Arabic',
  'Hebrew',
  'Hindi',
  'Malay',
  'Vietnamese'
];

export const ACTIVITY_SKILLS: ActivitySkill[] = [
  'kayaking',
  'white-water-rafting',
  'snorkeling',
  'scuba-diving',
  'stand-up-paddleboarding',
  'fishing',
  'boat-operation',
  'rock-climbing',
  'abseiling',
  'zip-lining',
  'mountain-biking',
  'hiking',
  'trekking',
  'camping',
  'jungle-survival',
  'cooking-instruction',
  'thai-massage-demo',
  'meditation-instruction',
  'muay-thai-basics',
  'traditional-crafts',
  'photography',
  'videography',
  'drone-operation',
  'wildlife-photography',
  'bird-watching',
  'wildlife-tracking',
  'elephant-care',
  'farm-activities',
  'tea-tasting',
  'wine-pairing'
];

export const SPECIALIZATIONS: Specialization[] = [
  'thai-history',
  'buddhist-culture',
  'temple-architecture',
  'royal-family-history',
  'ancient-civilizations',
  'hill-tribes',
  'ethnic-minorities',
  'tropical-ecology',
  'bird-species',
  'marine-biology',
  'botany',
  'jungle-flora-fauna',
  'elephant-behavior',
  'reptiles-amphibians',
  'thai-cuisine',
  'street-food',
  'regional-specialties',
  'fruit-varieties',
  'cooking-techniques',
  'food-safety',
  'geology',
  'weather-patterns',
  'sustainable-tourism',
  'conservation',
  'meditation',
  'yoga',
  'traditional-medicine',
  'spiritual-practices',
  'adventure-tourism',
  'eco-tourism',
  'agro-tourism',
  'wellness-tourism',
  'photography-tours',
  'luxury-travel'
];

export const DRIVING_SKILLS: DrivingSkill[] = [
  'mud-driving',
  'sand-dune-navigation',
  'river-crossing',
  'steep-incline-descent',
  'rock-crawling',
  'night-driving',
  'convoy-leading',
  'vehicle-recovery',
  'winching',
  'tire-changing',
  'basic-mechanics',
  'engine-troubleshooting'
];

export const THAILAND_REGIONS: ThailandRegion[] = [
  'Bangkok',
  'Chiang Mai',
  'Chiang Rai',
  'Phuket',
  'Krabi',
  'Koh Samui',
  'Pattaya',
  'Ayutthaya',
  'Sukhothai',
  'Isaan',
  'Kanchanaburi',
  'Khao Yai',
  'Pai',
  'Mae Hong Son',
  'Hua Hin',
  'Khao Sok',
  'Similan Islands',
  'Golden Triangle'
];

// Helper function to format guide full name
export const getGuideFullName = (guide: Guide): string => {
  return `${guide.firstName} ${guide.lastName}`;
};

// Helper function to check if certification is expiring soon (within 30 days)
export const isCertificationExpiringSoon = (cert: Certification): boolean => {
  if (!cert.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return new Date(cert.expiryDate) <= thirtyDaysFromNow && cert.status === 'active';
};

// Helper function to calculate guide's total experience score
export const calculateExperienceScore = (guide: Guide): number => {
  const exp = guide.experience;
  return (
    exp.yearsGuiding * 10 +
    exp.totalToursLed * 0.5 +
    exp.totalGuestsGuided * 0.1 +
    exp.tourTypesExperience.length * 5 +
    exp.destinationsExpertise.length * 3
  );
};

// Helper function to check if guide is premium tier (based on ratings and experience)
export const isPremiumGuide = (guide: Guide): boolean => {
  return (
    guide.performance.averageRating >= 4.5 &&
    guide.performance.totalReviews >= 20 &&
    guide.experience.yearsGuiding >= 3
  );
};
