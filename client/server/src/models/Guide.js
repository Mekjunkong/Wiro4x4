import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date
    },
    nationalId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Employment Status
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'freelance', 'contractor'],
      default: 'full-time'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'suspended'],
      default: 'active'
    },
    joinDate: {
      type: Date,
      default: Date.now
    },

    // Language Skills (Critical for Thailand tourism)
    languages: [{
      language: {
        type: String,
        required: true,
        enum: [
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
        ]
      },
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        required: true
      },
      certifications: [String] // e.g., "TOEFL 110", "HSK Level 6"
    }],

    // Technical 4x4 Skills (Core competency for Wiro 4x4)
    drivingSkills: {
      hasLicense: {
        type: Boolean,
        default: false
      },
      licenseNumber: String,
      licenseExpiry: Date,
      vehicleTypes: [{
        type: String,
        enum: ['4x4-suv', 'pickup-truck', 'van', 'minibus', 'motorcycle', 'atv']
      }],
      offRoadExperience: {
        type: String,
        enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
        default: 'none'
      },
      specializedSkills: [{
        type: String,
        enum: [
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
        ]
      }]
    },

    // Adventure & Activity Skills (Profit-generating)
    activitySkills: [{
      type: String,
      enum: [
        // Water Activities
        'kayaking',
        'white-water-rafting',
        'snorkeling',
        'scuba-diving',
        'stand-up-paddleboarding',
        'fishing',
        'boat-operation',

        // Land Activities
        'rock-climbing',
        'abseiling',
        'zip-lining',
        'mountain-biking',
        'hiking',
        'trekking',
        'camping',
        'jungle-survival',

        // Cultural Activities
        'cooking-instruction',
        'thai-massage-demo',
        'meditation-instruction',
        'muay-thai-basics',
        'traditional-crafts',

        // Photography & Media
        'photography',
        'videography',
        'drone-operation',
        'wildlife-photography',

        // Specialized
        'bird-watching',
        'wildlife-tracking',
        'elephant-care',
        'farm-activities',
        'tea-tasting',
        'wine-pairing'
      ]
    }],

    // Knowledge Specializations (Value-add for premium tours)
    specializations: [{
      type: String,
      enum: [
        // Cultural & Historical
        'thai-history',
        'buddhist-culture',
        'temple-architecture',
        'royal-family-history',
        'ancient-civilizations',
        'hill-tribes',
        'ethnic-minorities',

        // Nature & Wildlife
        'tropical-ecology',
        'bird-species',
        'marine-biology',
        'botany',
        'jungle-flora-fauna',
        'elephant-behavior',
        'reptiles-amphibians',

        // Culinary
        'thai-cuisine',
        'street-food',
        'regional-specialties',
        'fruit-varieties',
        'cooking-techniques',
        'food-safety',

        // Geography & Environment
        'geology',
        'weather-patterns',
        'sustainable-tourism',
        'conservation',

        // Wellness & Spirituality
        'meditation',
        'yoga',
        'traditional-medicine',
        'spiritual-practices',

        // Adventure Tourism
        'adventure-tourism',
        'eco-tourism',
        'agro-tourism',
        'wellness-tourism',
        'photography-tours',
        'luxury-travel'
      ]
    }],

    // Certifications (Legal compliance + premium pricing)
    certifications: [{
      name: {
        type: String,
        required: true
      },
      issuingOrganization: String,
      certificationNumber: String,
      issueDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'pending-renewal'],
        default: 'active'
      },
      documentUrl: String,
      category: {
        type: String,
        enum: [
          // Safety & Medical
          'first-aid',
          'cpr',
          'wilderness-first-responder',
          'advanced-first-aid',
          'emergency-medical-technician',

          // Tourism & Guiding
          'tour-guide-license',
          'national-park-guide',
          'regional-guide-license',
          'international-tour-director',

          // Activity-Specific
          'scuba-diving-instructor',
          'kayak-instructor',
          'climbing-instructor',
          'rafting-guide',
          'survival-instructor',

          // Driving & Vehicle
          'defensive-driving',
          'off-road-driving',
          '4x4-recovery',
          'commercial-drivers-license',

          // Food & Hospitality
          'food-safety-handler',
          'sommelier',
          'culinary-certificate',

          // Cultural
          'cultural-heritage-interpreter',
          'language-proficiency',
          'meditation-teacher',

          // Insurance & Legal
          'professional-liability-insurance',
          'tour-operator-insurance'
        ]
      }
    }],

    // Experience Metrics (Track proven capability)
    experience: {
      yearsGuiding: {
        type: Number,
        default: 0,
        min: 0
      },
      totalToursLed: {
        type: Number,
        default: 0,
        min: 0
      },
      totalGuestsGuided: {
        type: Number,
        default: 0,
        min: 0
      },
      largestGroupSize: {
        type: Number,
        default: 0,
        min: 0
      },
      tourTypesExperience: [{
        type: String,
        enum: [
          'day-trip',
          'multi-day',
          'luxury',
          'budget',
          'family',
          'solo-travelers',
          'corporate',
          'adventure',
          'cultural',
          'eco-tour',
          'photography',
          'wellness',
          'senior-travelers',
          'student-groups'
        ]
      }],
      destinationsExpertise: [{
        destination: String,
        timesVisited: Number,
        lastVisited: Date
      }]
    },

    // Performance Ratings (Profitability indicator)
    performance: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: 0
      },
      recommendationRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      repeatClientRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      tipAverage: {
        type: Number,
        default: 0,
        min: 0
      },
      customerCompliments: {
        type: Number,
        default: 0,
        min: 0
      },
      customerComplaints: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    // Availability & Scheduling
    availability: {
      preferredRegions: [{
        type: String,
        enum: [
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
        ]
      }],
      willingToTravel: {
        type: Boolean,
        default: true
      },
      maxConsecutiveDays: {
        type: Number,
        default: 14
      },
      blackoutDates: [{
        startDate: Date,
        endDate: Date,
        reason: String
      }],
      preferredGroupSize: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 20 }
      }
    },

    // Pricing & Compensation (Profitability)
    pricing: {
      baseDayRate: {
        type: Number,
        required: true,
        default: 2000,
        min: 0
      },
      premiumRate: {
        type: Number,
        default: 0,
        min: 0
      },
      currency: {
        type: String,
        default: 'THB'
      },
      overtimeRate: {
        type: Number,
        default: 0
      },
      multiDayDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      lastRateUpdate: {
        type: Date,
        default: Date.now
      }
    },

    // Soft Skills Assessment (Qualitative value)
    softSkills: {
      communicationStyle: {
        type: String,
        enum: ['formal', 'casual', 'balanced'],
        default: 'balanced'
      },
      teachingAbility: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent', 'outstanding'],
        default: 'good'
      },
      enthusiasm: {
        type: String,
        enum: ['low', 'moderate', 'high', 'exceptional'],
        default: 'moderate'
      },
      culturalSensitivity: {
        type: String,
        enum: ['developing', 'competent', 'proficient', 'expert'],
        default: 'competent'
      },
      problemSolving: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent', 'outstanding'],
        default: 'good'
      },
      punctuality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent', 'outstanding'],
        default: 'good'
      },
      flexibility: {
        type: String,
        enum: ['rigid', 'moderate', 'flexible', 'highly-flexible'],
        default: 'moderate'
      },
      humor: {
        type: String,
        enum: ['none', 'subtle', 'moderate', 'strong'],
        default: 'moderate'
      }
    },

    // Emergency Contacts
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      alternatePhone: String
    },

    // Notes & Admin
    adminNotes: {
      type: String,
      default: ''
    },
    internalRating: {
      type: Number,
      min: 1,
      max: 10
    },
    tags: [String],

    // Tracking
    lastActiveDate: {
      type: Date
    },
    nextAvailableDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
guideSchema.index({ email: 1 });
guideSchema.index({ status: 1 });
guideSchema.index({ 'languages.language': 1 });
guideSchema.index({ 'availability.preferredRegions': 1 });
guideSchema.index({ 'performance.averageRating': -1 });
guideSchema.index({ 'pricing.baseDayRate': 1 });
guideSchema.index({ specializations: 1 });
guideSchema.index({ activitySkills: 1 });

// Virtual for full name
guideSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if guide is available on a date
guideSchema.methods.isAvailableOnDate = function(date) {
  if (this.status !== 'active') return false;

  const checkDate = new Date(date);
  return !this.availability.blackoutDates.some(blackout => {
    return checkDate >= blackout.startDate && checkDate <= blackout.endDate;
  });
};

// Method to calculate daily rate with premiums
guideSchema.methods.calculateDailyRate = function(tourType, duration) {
  let rate = this.baseDayRate;

  // Add premium for luxury tours
  if (tourType === 'luxury' && this.pricing.premiumRate) {
    rate += this.pricing.premiumRate;
  }

  // Apply multi-day discount
  if (duration > 3 && this.pricing.multiDayDiscount > 0) {
    rate = rate * (1 - this.pricing.multiDayDiscount / 100);
  }

  return rate;
};

// Static method to find guides by skill
guideSchema.statics.findBySkill = function(skillType, skillValue) {
  const query = {};
  query[skillType] = skillValue;
  return this.find(query).where('status').equals('active');
};

// Static method to find available guides
guideSchema.statics.findAvailableGuides = function(startDate, endDate, region) {
  return this.find({
    status: 'active',
    'availability.preferredRegions': region,
    'availability.blackoutDates': {
      $not: {
        $elemMatch: {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      }
    }
  }).sort({ 'performance.averageRating': -1 });
};

const Guide = mongoose.model('Guide', guideSchema);

export default Guide;
