const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Contact Information
  contactName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },

  // Adults
  numberOfAdults: {
    type: Number,
    required: true,
    min: 1
  },

  // Children
  hasChildren: {
    type: Boolean,
    default: false
  },
  numberOfChildren: {
    type: Number,
    min: 0
  },

  // Dates
  pickupDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  // Pickup location
  pickupPoint: {
    type: String,
    enum: ['airport', 'hotel'],
    required: true
  },
  pickupHotelName: {
    type: String
  },

  // Drop-off location
  dropoffPoint: {
    type: String,
    enum: ['airport', 'hotel'],
    required: true
  },
  dropoffHotelName: {
    type: String
  },

  // Hotels
  includesHotels: {
    type: Boolean,
    default: false
  },
  hotelLevel: {
    type: String,
    enum: ['budget', 'standard', 'luxury', 'premium']
  },

  // Guide
  includesGuide: {
    type: Boolean,
    default: false
  },

  // Trip and driving
  includesTrip: {
    type: Boolean,
    default: false
  },
  allowsSelfDriving: {
    type: Boolean,
    default: false
  },

  // Attractions
  includesAttractions: {
    type: Boolean,
    default: false
  },
  selectedAttractions: [{
    type: String
  }],

  // Food preferences
  includesFood: {
    type: Boolean,
    default: false
  },
  foodPreferences: {
    kosher: {
      type: Boolean,
      default: false
    },
    vegetarian: {
      type: Boolean,
      default: false
    },
    vegan: {
      type: Boolean,
      default: false
    },
    sensitivities: {
      type: String
    }
  },

  // Suggested destinations
  suggestedDestinations: [{
    type: String
  }],

  // Shabbat
  needsShabbatHotel: {
    type: Boolean,
    default: false
  },
  shabbatHotel: {
    type: String,
    enum: ['empress', 'shangri-la', 'astra', 'other']
  },
  otherShabbatHotel: {
    type: String
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Notes from admin
  adminNotes: {
    type: String
  },

  // Agent Assignment
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  agentAssignedAt: {
    type: Date
  },

  // Tour Package Link
  tourPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage'
  },
  packageName: {
    type: String
  },

  // Revenue and Commission
  estimatedRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  actualRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  agentCommission: {
    type: Number,
    default: 0,
    min: 0
  },

  // Cost Tracking
  costs: {
    guideFee: {
      type: Number,
      default: 0,
      min: 0
    },
    transportCost: {
      type: Number,
      default: 0,
      min: 0
    },
    accommodationCost: {
      type: Number,
      default: 0,
      min: 0
    },
    attractionsCost: {
      type: Number,
      default: 0,
      min: 0
    },
    foodCost: {
      type: Number,
      default: 0,
      min: 0
    },
    otherCosts: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Financial Calculations (auto-calculated)
  totalCosts: {
    type: Number,
    default: 0,
    min: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  profitMargin: {
    type: Number,
    default: 0
  }
});

// Update the updatedAt timestamp before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate financial metrics before saving
bookingSchema.pre('save', function(next) {
  // Calculate total costs
  if (this.costs) {
    this.totalCosts =
      (this.costs.guideFee || 0) +
      (this.costs.transportCost || 0) +
      (this.costs.accommodationCost || 0) +
      (this.costs.attractionsCost || 0) +
      (this.costs.foodCost || 0) +
      (this.costs.otherCosts || 0);
  }

  // Calculate profit: actualRevenue - totalCosts - agentCommission
  const revenue = this.actualRevenue || 0;
  const costs = this.totalCosts || 0;
  const commission = this.agentCommission || 0;
  this.profit = revenue - costs - commission;

  // Calculate profit margin: (profit / revenue) * 100
  if (revenue > 0) {
    this.profitMargin = (this.profit / revenue) * 100;
  } else {
    this.profitMargin = 0;
  }

  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
