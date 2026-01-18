const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Customer Contact Information
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },

  // Inquiry Details
  numberOfAdults: {
    type: Number,
    required: true,
    min: 1
  },
  numberOfChildren: {
    type: Number,
    default: 0,
    min: 0
  },
  preferredStartDate: {
    type: Date,
    required: true
  },
  preferredEndDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },

  // Tour Preferences
  tourPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage'
  },
  hotelLevel: {
    type: String,
    enum: ['budget', 'standard', 'luxury', 'premium'],
    default: 'standard'
  },
  interests: [{
    type: String
  }],
  specialRequests: {
    type: String
  },

  // Status Workflow
  status: {
    type: String,
    enum: ['new', 'contacted', 'quoted', 'quote-sent', 'negotiating', 'accepted', 'converted', 'declined', 'lost'],
    default: 'new'
  },

  // Quote Information
  quoteGenerated: {
    type: Boolean,
    default: false
  },
  quoteSentAt: {
    type: Date
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  finalQuotedPrice: {
    type: Number,
    min: 0
  },
  quoteValidUntil: {
    type: Date
  },

  // Conversion Tracking
  convertedToBooking: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  convertedAt: {
    type: Date
  },

  // Lead Source & Attribution
  source: {
    type: String,
    enum: ['web-form', 'phone', 'email', 'referral', 'social-media', 'other'],
    default: 'web-form'
  },
  referralSource: {
    type: String
  },

  // Agent Assignment
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  assignedAt: {
    type: Date
  },

  // Communication History
  lastContactedAt: {
    type: Date
  },
  contactAttempts: {
    type: Number,
    default: 0
  },
  emailsSent: {
    type: Number,
    default: 0
  },

  // Admin Notes
  adminNotes: {
    type: String
  },
  internalNotes: {
    type: String
  },

  // Priority & Follow-up
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  followUpDate: {
    type: Date
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Auto-calculate duration if dates provided
  if (this.preferredStartDate && this.preferredEndDate) {
    const start = new Date(this.preferredStartDate);
    const end = new Date(this.preferredEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      this.duration = diffDays;
    }
  }

  next();
});

// Indexes for performance
leadSchema.index({ status: 1 });
leadSchema.index({ customerEmail: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ agentId: 1 });
leadSchema.index({ convertedToBooking: 1 });
leadSchema.index({ followUpDate: 1 });

// Virtual for total people
leadSchema.virtual('totalPeople').get(function() {
  return this.numberOfAdults + (this.numberOfChildren || 0);
});

module.exports = mongoose.model('Lead', leadSchema);
