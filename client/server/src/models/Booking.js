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
  }
});

// Update the updatedAt timestamp before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
