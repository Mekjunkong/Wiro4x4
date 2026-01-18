const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  // Commission
  commissionRate: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
    max: 100
  },

  // Performance Metrics (auto-calculated)
  totalBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCommission: {
    type: Number,
    default: 0,
    min: 0
  },

  // Notes
  notes: {
    type: String
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

// Create index on status for filtering (email already indexed via unique: true)
agentSchema.index({ status: 1 });

// Update the updatedAt timestamp before saving
agentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Agent', agentSchema);
