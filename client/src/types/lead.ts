// Lead/Inquiry Management Types

import { Agent } from './agent';
import { TourPackage } from './tourPackage';
import { Booking } from './tourBooking';

export interface Lead {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfAdults: number;
  numberOfChildren: number;
  preferredStartDate: string;
  preferredEndDate: string;
  duration: number;
  tourPackageId?: string | TourPackage;
  hotelLevel: HotelLevel;
  interests: string[];
  specialRequests?: string;
  status: LeadStatus;
  quoteGenerated: boolean;
  quoteSentAt?: string;
  estimatedCost: number;
  finalQuotedPrice: number;
  quoteValidUntil?: string;
  convertedToBooking: boolean;
  bookingId?: string | Booking;
  convertedAt?: string;
  source: LeadSource;
  referralSource?: string;
  agentId?: string | Agent;
  assignedAt?: string;
  lastContactedAt?: string;
  contactAttempts: number;
  emailsSent: number;
  adminNotes?: string;
  internalNotes?: string;
  priority: LeadPriority;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfAdults: number;
  numberOfChildren?: number;
  preferredStartDate: string;
  preferredEndDate: string;
  tourPackageId?: string;
  hotelLevel?: HotelLevel;
  interests?: string[];
  specialRequests?: string;
  source?: LeadSource;
  referralSource?: string;
}

export interface Quote {
  leadId: string;
  customerName: string;
  packageName: string;
  duration: number;
  numberOfAdults: number;
  numberOfChildren: number;
  totalPeople: number;
  hotelLevel: string;
  season: SeasonType;
  costs: {
    accommodation: number;
    meals: number;
    guide: number;
    transport: number;
    attractions: number;
    total: number;
  };
  quotedPrice: number;
  estimatedProfit: number;
  validUntil: string;
}

export interface ConversionStats {
  totalLeads: number;
  newLeads: number;
  quotedLeads: number;
  quoteSentLeads: number;
  acceptedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  quoteConversionRate: number;
  leadConversionRate: number;
  quoteToBookingRate: number;
  totalEstimatedRevenue: number;
  averageQuoteValue: number;
  bySource: {
    [key in LeadSource]: {
      total: number;
      converted: number;
      conversionRate: number;
    };
  };
  avgTimeToQuote: number;
}

// Enums and Constants
export const LEAD_STATUS = [
  'new',
  'contacted',
  'quoted',
  'quote-sent',
  'negotiating',
  'accepted',
  'converted',
  'declined',
  'lost'
] as const;
export type LeadStatus = typeof LEAD_STATUS[number];

export const LEAD_SOURCES = [
  'web-form',
  'phone',
  'email',
  'referral',
  'social-media',
  'other'
] as const;
export type LeadSource = typeof LEAD_SOURCES[number];

export const LEAD_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type LeadPriority = typeof LEAD_PRIORITIES[number];

export const HOTEL_LEVELS = ['budget', 'standard', 'luxury', 'premium'] as const;
export type HotelLevel = typeof HOTEL_LEVELS[number];

export const SEASON_TYPES = ['peak', 'shoulder', 'low'] as const;
export type SeasonType = typeof SEASON_TYPES[number];

// Status colors and labels
export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#3498db',
  contacted: '#9b59b6',
  quoted: '#f39c12',
  'quote-sent': '#e67e22',
  negotiating: '#1abc9c',
  accepted: '#27ae60',
  converted: '#16a085',
  declined: '#95a5a6',
  lost: '#e74c3c'
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  'quote-sent': 'Quote Sent',
  negotiating: 'Negotiating',
  accepted: 'Accepted',
  converted: 'Converted',
  declined: 'Declined',
  lost: 'Lost'
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  'web-form': 'Website Form',
  phone: 'Phone Call',
  email: 'Email',
  referral: 'Referral',
  'social-media': 'Social Media',
  other: 'Other'
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  low: '#95a5a6',
  medium: '#3498db',
  high: '#f39c12',
  urgent: '#e74c3c'
};

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};
