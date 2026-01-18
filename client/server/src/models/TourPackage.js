const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  activities: [{
    type: String
  }],
  locations: [{
    type: String
  }],
  meals: {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false }
  },
  accommodation: {
    type: String
  },
  notes: {
    type: String
  }
});

const tourPackageSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },

  // Destinations & Activities
  destinations: [{
    type: String,
    required: true
  }],
  attractions: [{
    type: String
  }],

  // Inclusions
  includes: {
    accommodation: { type: Boolean, default: true },
    meals: { type: Boolean, default: true },
    guide: { type: Boolean, default: true },
    transport: { type: Boolean, default: true },
    attractions: { type: Boolean, default: true }
  },

  // Group Size
  minGroupSize: {
    type: Number,
    default: 1,
    min: 1
  },
  maxGroupSize: {
    type: Number,
    default: 10,
    min: 1
  },

  // Cost Templates (per person per day)
  costTemplate: {
    accommodationPerNight: {
      budget: { type: Number, default: 800 },
      standard: { type: Number, default: 1500 },
      luxury: { type: Number, default: 3000 },
      premium: { type: Number, default: 5000 }
    },
    mealPerDay: {
      type: Number,
      default: 600
    },
    guidePerDay: {
      type: Number,
      default: 2000
    },
    transportPerDay: {
      type: Number,
      default: 1500
    },
    attractionsPerPerson: {
      type: Number,
      default: 1000
    }
  },

  // Base Pricing
  basePricePerPerson: {
    type: Number,
    required: true,
    min: 0
  },

  // Season Multipliers
  seasonMultipliers: {
    peak: { type: Number, default: 1.3 },      // High season (Nov-Feb)
    shoulder: { type: Number, default: 1.1 },  // Shoulder (Mar-May, Sep-Oct)
    low: { type: Number, default: 1.0 }        // Low season (Jun-Aug)
  },

  // Itinerary Template
  itinerary: [itineraryDaySchema],

  // Requirements & Notes
  requirements: {
    type: String
  },
  safetyProtocols: {
    type: String
  },
  cancellationPolicy: {
    type: String
  },

  // Images
  imageUrl: {
    type: String
  },
  images: [{
    type: String
  }],

  // Metadata
  bookingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
tourPackageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes (code and name already indexed via unique: true)
tourPackageSchema.index({ status: 1 });

module.exports = mongoose.model('TourPackage', tourPackageSchema);
