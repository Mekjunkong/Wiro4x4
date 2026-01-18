const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // Booking Reference
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },

  // Customer Information (copied from booking for easy access)
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },

  // Overall Rating (1-5 stars)
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // Detailed Ratings
  ratings: {
    guide: {
      type: Number,
      min: 1,
      max: 5
    },
    vehicle: {
      type: Number,
      min: 1,
      max: 5
    },
    activities: {
      type: Number,
      min: 1,
      max: 5
    },
    accommodation: {
      type: Number,
      min: 1,
      max: 5
    },
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Written Feedback
  comments: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  highlights: {
    type: String,
    maxlength: 500
  },
  suggestions: {
    type: String,
    maxlength: 500
  },

  // Recommendation
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  willingToProvideTestimonial: {
    type: Boolean,
    default: false
  },

  // Tour Details (from booking)
  tourPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage'
  },
  tourDate: {
    type: Date
  },

  // Agent Reference (for performance tracking)
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },

  // Photos (optional - URLs to uploaded images)
  photos: [{
    type: String
  }],

  // Approval & Publishing
  status: {
    type: String,
    enum: ['pending', 'approved', 'published', 'rejected'],
    default: 'pending'
  },
  publishedAt: {
    type: Date
  },
  approvedBy: {
    type: String  // Admin user who approved it
  },

  // Follow-up
  adminResponse: {
    type: String,
    maxlength: 1000
  },
  respondedAt: {
    type: Date
  },
  contactedForTestimonial: {
    type: Boolean,
    default: false
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },

  // Social Sharing
  allowPublicDisplay: {
    type: Boolean,
    default: true
  },
  displayName: {
    type: String  // How name should appear publicly (e.g., "John D." instead of full name)
  }
});

// Indexes
feedbackSchema.index({ bookingId: 1 });
feedbackSchema.index({ overallRating: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ tourPackageId: 1 });
feedbackSchema.index({ agentId: 1 });
feedbackSchema.index({ submittedAt: -1 });

// Virtual for average rating across categories
feedbackSchema.virtual('averageCategoryRating').get(function() {
  const ratings = [];
  if (this.ratings) {
    if (this.ratings.guide) ratings.push(this.ratings.guide);
    if (this.ratings.vehicle) ratings.push(this.ratings.vehicle);
    if (this.ratings.activities) ratings.push(this.ratings.activities);
    if (this.ratings.accommodation) ratings.push(this.ratings.accommodation);
    if (this.ratings.food) ratings.push(this.ratings.food);
    if (this.ratings.valueForMoney) ratings.push(this.ratings.valueForMoney);
  }
  return ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
});

// Auto-publish if rating is 4 or 5 and customer allows public display
feedbackSchema.pre('save', function(next) {
  if (this.isNew && this.overallRating >= 4 && this.allowPublicDisplay && this.status === 'pending') {
    this.status = 'approved';
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
