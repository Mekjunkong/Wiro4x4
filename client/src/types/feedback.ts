// Feedback & Review Types

import { Booking } from './tourBooking';
import { TourPackage } from './tourPackage';
import { Agent } from './agent';
import { Guide } from './guide';

export interface Feedback {
  _id: string;
  bookingId: string | Booking;
  customerName: string;
  customerEmail: string;
  overallRating: number; // 1-5
  ratings: FeedbackRatings;
  comments: string;
  highlights?: string;
  suggestions?: string;
  wouldRecommend: boolean;
  willingToProvideTestimonial: boolean;
  tourPackageId?: string | TourPackage;
  tourDate?: string;
  agentId?: string | Agent;
  guideId?: string | Guide;
  photos: string[];
  status: FeedbackStatus;
  publishedAt?: string;
  approvedBy?: string;
  adminResponse?: string;
  respondedAt?: string;
  contactedForTestimonial: boolean;
  submittedAt: string;
  ipAddress?: string;
  allowPublicDisplay: boolean;
  displayName?: string;
}

export interface FeedbackRatings {
  guide?: number; // 1-5
  vehicle?: number; // 1-5
  activities?: number; // 1-5
  accommodation?: number; // 1-5
  food?: number; // 1-5
  valueForMoney?: number; // 1-5
}

export interface FeedbackFormData {
  bookingId: string;
  overallRating: number;
  ratings: FeedbackRatings;
  comments: string;
  highlights?: string;
  suggestions?: string;
  wouldRecommend: boolean;
  willingToProvideTestimonial?: boolean;
  allowPublicDisplay?: boolean;
  displayName?: string;
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recommendationRate: number;
  testimonialWillingRate: number;
  categoryAverages: {
    guide: number;
    vehicle: number;
    activities: number;
    accommodation: number;
    food: number;
    valueForMoney: number;
  };
  byStatus: {
    pending: number;
    approved: number;
    published: number;
    rejected: number;
  };
}

export interface PublicFeedback {
  _id: string;
  overallRating: number;
  ratings: FeedbackRatings;
  comments: string;
  highlights?: string;
  displayName?: string;
  tourDate?: string;
  publishedAt: string;
  tourPackageId?: {
    _id: string;
    name: string;
    code: string;
  };
}

// Constants
export const FEEDBACK_STATUS = ['pending', 'approved', 'published', 'rejected'] as const;
export type FeedbackStatus = typeof FEEDBACK_STATUS[number];

export const FEEDBACK_RATING_CATEGORIES = [
  'guide',
  'vehicle',
  'activities',
  'accommodation',
  'food',
  'valueForMoney'
] as const;
export type FeedbackRatingCategory = typeof FEEDBACK_RATING_CATEGORIES[number];

// Status colors and labels
export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  pending: '#f39c12',
  approved: '#27ae60',
  published: '#16a085',
  rejected: '#e74c3c'
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected'
};

export const RATING_CATEGORY_LABELS: Record<FeedbackRatingCategory, string> = {
  guide: 'Tour Guide',
  vehicle: '4x4 Vehicle',
  activities: 'Activities',
  accommodation: 'Accommodation',
  food: 'Food & Dining',
  valueForMoney: 'Value for Money'
};

// Helper functions
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return '#27ae60'; // Excellent - green
  if (rating >= 3.5) return '#f39c12'; // Good - yellow
  if (rating >= 2.5) return '#e67e22'; // Fair - orange
  return '#e74c3c'; // Poor - red
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Fair';
  if (rating >= 1.5) return 'Poor';
  return 'Very Poor';
}

export function getStarDisplay(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  const emptyStars = 5 - Math.ceil(rating);
  stars += '☆'.repeat(emptyStars);
  return stars;
}
