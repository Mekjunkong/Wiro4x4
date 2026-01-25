const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Agent = require('./models/Agent');
const TourPackage = require('./models/TourPackage');
const Lead = require('./models/Lead');
const Feedback = require('./models/Feedback');
const Guide = require('./models/Guide');
const emailService = require('./services/emailService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wiro4x4tour';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;

    // Create new booking
    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ New booking created:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: booking._id
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// Get all bookings (for admin panel) - with agent population
app.get('/api/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.pickupDate = {};
      if (startDate) filter.pickupDate.$gte = new Date(startDate);
      if (endDate) filter.pickupDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('agentId')
      .populate('guideId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Get a single booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
});

// Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
});

// ============= AGENT ROUTES =============

// Helper function to update agent metrics
async function updateAgentMetrics(agentId) {
  try {
    const bookings = await Booking.find({ agentId: agentId });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.actualRevenue || 0), 0);
    const totalCommission = bookings.reduce((sum, b) => sum + (b.agentCommission || 0), 0);

    await Agent.findByIdAndUpdate(agentId, {
      totalBookings,
      totalRevenue,
      totalCommission
    });

    console.log(`✅ Updated metrics for agent ${agentId}`);
  } catch (error) {
    console.error(`❌ Error updating agent metrics:`, error);
  }
}

// Create a new agent
app.post('/api/agents', async (req, res) => {
  try {
    const agentData = req.body;

    // Check if email already exists
    const existingAgent = await Agent.findOne({ email: agentData.email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this email already exists'
      });
    }

    const agent = new Agent(agentData);
    await agent.save();

    console.log('✅ New agent created:', agent._id);

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent
    });
  } catch (error) {
    console.error('❌ Error creating agent:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating agent',
      error: error.message
    });
  }
});

// Get all agents (with optional status filter)
app.get('/api/agents', async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const agents = await Agent.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    console.error('❌ Error fetching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agents',
      error: error.message
    });
  }
});

// Get a single agent by ID
app.get('/api/agents/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('❌ Error fetching agent:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent',
      error: error.message
    });
  }
});

// Update an agent
app.patch('/api/agents/:id', async (req, res) => {
  try {
    const updateData = req.body;

    // If updating email, check if it's already taken
    if (updateData.email) {
      const existingAgent = await Agent.findOne({
        email: updateData.email,
        _id: { $ne: req.params.id }
      });
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: 'Another agent with this email already exists'
        });
      }
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      message: 'Agent updated successfully',
      agent
    });
  } catch (error) {
    console.error('❌ Error updating agent:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating agent',
      error: error.message
    });
  }
});

// Delete an agent
app.delete('/api/agents/:id', async (req, res) => {
  try {
    // Check if agent has any bookings
    const bookingCount = await Booking.countDocuments({ agentId: req.params.id });

    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete agent with ${bookingCount} assigned booking(s). Please reassign or remove bookings first.`
      });
    }

    const agent = await Agent.findByIdAndDelete(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting agent:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting agent',
      error: error.message
    });
  }
});

// Get agent performance statistics
app.get('/api/agents/:id/stats', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get detailed booking breakdown
    const bookings = await Booking.find({ agentId: req.params.id });

    const stats = {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      inProgressBookings: bookings.filter(b => b.status === 'in-progress').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: agent.totalRevenue,
      totalCommission: agent.totalCommission,
      averageBookingValue: bookings.length > 0 ? agent.totalRevenue / bookings.length : 0,
      conversionRate: bookings.length > 0 ? (bookings.filter(b => b.status === 'completed').length / bookings.length) * 100 : 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching agent stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent statistics',
      error: error.message
    });
  }
});

// Get agent's bookings
app.get('/api/agents/:id/bookings', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const { status, limit } = req.query;

    const filter = { agentId: req.params.id };
    if (status) filter.status = status;

    let query = Booking.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(parseInt(limit));

    const bookings = await query;

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('❌ Error fetching agent bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent bookings',
      error: error.message
    });
  }
});

// ============= BOOKING-AGENT INTEGRATION =============

// Assign or unassign guide to booking
app.patch('/api/bookings/:id/assign-guide', async (req, res) => {
  try {
    const { guideId } = req.body;

    // If assigning a guide, verify the guide exists and is active
    if (guideId) {
      const guide = await Guide.findById(guideId);
      if (!guide) {
        return res.status(404).json({
          success: false,
          message: 'Guide not found'
        });
      }
      if (guide.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign inactive guide'
        });
      }
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking
    booking.guideId = guideId || null;
    booking.guideAssignedAt = guideId ? new Date() : null;
    await booking.save();

    const updatedBooking = await Booking.findById(req.params.id)
      .populate('agentId')
      .populate('guideId');

    res.json({
      success: true,
      message: guideId ? 'Guide assigned successfully' : 'Guide unassigned successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('❌ Error assigning guide:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning guide',
      error: error.message
    });
  }
});

// Assign or unassign agent to booking
app.patch('/api/bookings/:id/assign-agent', async (req, res) => {
  try {
    const { agentId } = req.body;

    // If assigning an agent, verify the agent exists and is active
    if (agentId) {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }
      if (agent.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign inactive or suspended agent'
        });
      }
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const previousAgentId = booking.agentId;

    // Update booking
    booking.agentId = agentId || null;
    booking.agentAssignedAt = agentId ? new Date() : null;
    await booking.save();

    // Update metrics for both old and new agents
    if (previousAgentId) {
      await updateAgentMetrics(previousAgentId);
    }
    if (agentId) {
      await updateAgentMetrics(agentId);
    }

    const updatedBooking = await Booking.findById(req.params.id).populate('agentId');

    res.json({
      success: true,
      message: agentId ? 'Agent assigned successfully' : 'Agent unassigned successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('❌ Error assigning agent:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning agent',
      error: error.message
    });
  }
});

// Calculate commission for a booking
app.patch('/api/bookings/:id/commission', async (req, res) => {
  try {
    const { estimatedRevenue, actualRevenue } = req.body;

    const booking = await Booking.findById(req.params.id).populate('agentId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.agentId) {
      return res.status(400).json({
        success: false,
        message: 'No agent assigned to this booking'
      });
    }

    const agent = booking.agentId;

    // Update revenue fields
    if (estimatedRevenue !== undefined) {
      booking.estimatedRevenue = estimatedRevenue;
    }
    if (actualRevenue !== undefined) {
      booking.actualRevenue = actualRevenue;
    }

    // Calculate commission based on actual revenue (or estimated if actual not set)
    const revenueForCommission = booking.actualRevenue || booking.estimatedRevenue;
    booking.agentCommission = revenueForCommission * (agent.commissionRate / 100);

    await booking.save();

    // Update agent metrics
    await updateAgentMetrics(agent._id);

    res.json({
      success: true,
      message: 'Commission calculated successfully',
      booking,
      commission: booking.agentCommission
    });
  } catch (error) {
    console.error('❌ Error calculating commission:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating commission',
      error: error.message
    });
  }
});

// ============= FINANCIAL MANAGEMENT =============

// Update costs for a booking
app.patch('/api/bookings/:id/costs', async (req, res) => {
  try {
    const { costs } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update costs
    if (costs) {
      booking.costs = {
        guideFee: costs.guideFee || 0,
        transportCost: costs.transportCost || 0,
        accommodationCost: costs.accommodationCost || 0,
        attractionsCost: costs.attractionsCost || 0,
        foodCost: costs.foodCost || 0,
        otherCosts: costs.otherCosts || 0
      };
    }

    await booking.save(); // Pre-save hook will auto-calculate totalCosts, profit, profitMargin

    res.json({
      success: true,
      message: 'Costs updated successfully',
      booking
    });
  } catch (error) {
    console.error('❌ Error updating costs:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating costs',
      error: error.message
    });
  }
});

// Get overall financial summary
app.get('/api/financial/summary', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } });

    const summary = {
      totalRevenue: bookings.reduce((sum, b) => sum + (b.actualRevenue || 0), 0),
      totalCosts: bookings.reduce((sum, b) => sum + (b.totalCosts || 0), 0),
      totalCommissions: bookings.reduce((sum, b) => sum + (b.agentCommission || 0), 0),
      totalProfit: bookings.reduce((sum, b) => sum + (b.profit || 0), 0),
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      averageRevenue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.actualRevenue || 0), 0) / bookings.length : 0,
      averageProfit: bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.profit || 0), 0) / bookings.length : 0
    };

    // Calculate overall profit margin
    summary.profitMargin = summary.totalRevenue > 0 ? (summary.totalProfit / summary.totalRevenue) * 100 : 0;

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('❌ Error fetching financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: error.message
    });
  }
});

// Get monthly financial breakdown
app.get('/api/financial/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;

    // Default to current year/month if not provided
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calculate date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const bookings = await Booking.find({
      pickupDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    }).populate('agentId');

    const monthlyData = {
      year: targetYear,
      month: targetMonth,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.actualRevenue || 0), 0),
      totalCosts: bookings.reduce((sum, b) => sum + (b.totalCosts || 0), 0),
      totalCommissions: bookings.reduce((sum, b) => sum + (b.agentCommission || 0), 0),
      totalProfit: bookings.reduce((sum, b) => sum + (b.profit || 0), 0),
      totalBookings: bookings.length,
      bookingsByStatus: {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        inProgress: bookings.filter(b => b.status === 'in-progress').length,
        completed: bookings.filter(b => b.status === 'completed').length
      },
      costBreakdown: {
        guideFees: bookings.reduce((sum, b) => sum + (b.costs?.guideFee || 0), 0),
        transport: bookings.reduce((sum, b) => sum + (b.costs?.transportCost || 0), 0),
        accommodation: bookings.reduce((sum, b) => sum + (b.costs?.accommodationCost || 0), 0),
        attractions: bookings.reduce((sum, b) => sum + (b.costs?.attractionsCost || 0), 0),
        food: bookings.reduce((sum, b) => sum + (b.costs?.foodCost || 0), 0),
        other: bookings.reduce((sum, b) => sum + (b.costs?.otherCosts || 0), 0)
      }
    };

    monthlyData.profitMargin = monthlyData.totalRevenue > 0
      ? (monthlyData.totalProfit / monthlyData.totalRevenue) * 100
      : 0;

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('❌ Error fetching monthly financials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly financials',
      error: error.message
    });
  }
});

// Get agent performance by profit
app.get('/api/financial/agent-performance', async (req, res) => {
  try {
    const agents = await Agent.find({ status: 'active' });
    const agentPerformance = [];

    for (const agent of agents) {
      const bookings = await Booking.find({
        agentId: agent._id,
        status: { $ne: 'cancelled' }
      });

      const performance = {
        agentId: agent._id,
        agentName: agent.name,
        company: agent.company,
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.actualRevenue || 0), 0),
        totalCosts: bookings.reduce((sum, b) => sum + (b.totalCosts || 0), 0),
        totalCommissions: bookings.reduce((sum, b) => sum + (b.agentCommission || 0), 0),
        totalProfit: bookings.reduce((sum, b) => sum + (b.profit || 0), 0),
        averageProfit: bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.profit || 0), 0) / bookings.length : 0
      };

      performance.profitMargin = performance.totalRevenue > 0
        ? (performance.totalProfit / performance.totalRevenue) * 100
        : 0;

      agentPerformance.push(performance);
    }

    // Sort by total profit descending
    agentPerformance.sort((a, b) => b.totalProfit - a.totalProfit);

    res.json({
      success: true,
      agents: agentPerformance
    });
  } catch (error) {
    console.error('❌ Error fetching agent performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent performance',
      error: error.message
    });
  }
});

// ============= TOUR PACKAGES =============

// Create tour package
app.post('/api/packages', async (req, res) => {
  try {
    const packageData = req.body;

    // Check if code already exists
    const existingPackage = await TourPackage.findOne({ code: packageData.code });
    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: 'Package code already exists'
      });
    }

    const tourPackage = new TourPackage(packageData);
    await tourPackage.save();

    console.log('✅ New tour package created:', tourPackage.code);

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully',
      package: tourPackage
    });
  } catch (error) {
    console.error('❌ Error creating tour package:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating tour package',
      error: error.message
    });
  }
});

// Get all tour packages
app.get('/api/packages', async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const packages = await TourPackage.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: packages.length,
      packages
    });
  } catch (error) {
    console.error('❌ Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching packages',
      error: error.message
    });
  }
});

// Get single tour package
app.get('/api/packages/:id', async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.json({
      success: true,
      package: tourPackage
    });
  } catch (error) {
    console.error('❌ Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching package',
      error: error.message
    });
  }
});

// Update tour package
app.patch('/api/packages/:id', async (req, res) => {
  try {
    const updateData = req.body;

    // If updating code, check uniqueness
    if (updateData.code) {
      const existingPackage = await TourPackage.findOne({
        code: updateData.code,
        _id: { $ne: req.params.id }
      });
      if (existingPackage) {
        return res.status(400).json({
          success: false,
          message: 'Package code already exists'
        });
      }
    }

    const tourPackage = await TourPackage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour package updated successfully',
      package: tourPackage
    });
  } catch (error) {
    console.error('❌ Error updating package:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating package',
      error: error.message
    });
  }
});

// Delete tour package
app.delete('/api/packages/:id', async (req, res) => {
  try {
    // Check if package is used in any bookings
    const bookingCount = await Booking.countDocuments({ tourPackageId: req.params.id });

    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete package with ${bookingCount} booking(s). Set to inactive instead.`
      });
    }

    const tourPackage = await TourPackage.findByIdAndDelete(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour package deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting package',
      error: error.message
    });
  }
});

// Estimate costs for a tour package
app.post('/api/packages/:id/estimate', async (req, res) => {
  try {
    const { numberOfAdults, numberOfChildren, hotelLevel, pickupDate, endDate } = req.body;

    const tourPackage = await TourPackage.findById(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    // Calculate duration
    const duration = tourPackage.duration;
    const totalPeople = numberOfAdults + (numberOfChildren || 0);

    // Determine season multiplier
    let seasonMultiplier = tourPackage.seasonMultipliers.low;
    if (pickupDate) {
      const month = new Date(pickupDate).getMonth() + 1;
      if (month >= 11 || month <= 2) {
        seasonMultiplier = tourPackage.seasonMultipliers.peak;
      } else if ((month >= 3 && month <= 5) || (month >= 9 && month <= 10)) {
        seasonMultiplier = tourPackage.seasonMultipliers.shoulder;
      }
    }

    // Calculate costs based on template
    const accommodationCost = tourPackage.costTemplate.accommodationPerNight[hotelLevel || 'standard'] * duration * totalPeople;
    const mealCost = tourPackage.costTemplate.mealPerDay * duration * totalPeople;
    const guideCost = tourPackage.costTemplate.guidePerDay * duration;
    const transportCost = tourPackage.costTemplate.transportPerDay * duration;
    const attractionsCost = tourPackage.costTemplate.attractionsPerPerson * totalPeople;

    const totalCosts = accommodationCost + mealCost + guideCost + transportCost + attractionsCost;

    // Calculate revenue (base price + season adjustment)
    const baseRevenue = tourPackage.basePricePerPerson * totalPeople;
    const estimatedRevenue = Math.round(baseRevenue * seasonMultiplier);

    // Estimated profit (before commission)
    const estimatedProfit = estimatedRevenue - totalCosts;
    const profitMargin = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0;

    const estimate = {
      packageName: tourPackage.name,
      duration: duration,
      numberOfAdults,
      numberOfChildren: numberOfChildren || 0,
      totalPeople,
      hotelLevel: hotelLevel || 'standard',
      season: seasonMultiplier === tourPackage.seasonMultipliers.peak ? 'peak' :
              seasonMultiplier === tourPackage.seasonMultipliers.shoulder ? 'shoulder' : 'low',
      seasonMultiplier,
      costs: {
        accommodation: accommodationCost,
        meals: mealCost,
        guide: guideCost,
        transport: transportCost,
        attractions: attractionsCost,
        total: totalCosts
      },
      estimatedRevenue,
      estimatedProfit,
      profitMargin,
      costBreakdown: {
        guideFee: guideCost,
        transportCost: transportCost,
        accommodationCost: accommodationCost,
        attractionsCost: attractionsCost,
        foodCost: mealCost,
        otherCosts: 0
      }
    };

    res.json({
      success: true,
      estimate
    });
  } catch (error) {
    console.error('❌ Error estimating costs:', error);
    res.status(500).json({
      success: false,
      message: 'Error estimating costs',
      error: error.message
    });
  }
});

// ============= LEAD MANAGEMENT & AUTOMATION =============

// Create new lead (public inquiry form)
app.post('/api/leads', async (req, res) => {
  try {
    const leadData = req.body;

    const lead = new Lead(leadData);
    await lead.save();

    console.log('✅ New lead created:', lead._id);

    // Send inquiry received email (async, don't wait)
    emailService.sendInquiryReceivedEmail(lead).catch(err =>
      console.error('Failed to send inquiry email:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      leadId: lead._id
    });
  } catch (error) {
    console.error('❌ Error creating lead:', error);
    res.status(400).json({
      success: false,
      message: 'Error submitting inquiry',
      error: error.message
    });
  }
});

// Get all leads with filtering and sorting
app.get('/api/leads', async (req, res) => {
  try {
    const { status, source, priority, agentId, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (priority) filter.priority = priority;
    if (agentId) filter.agentId = agentId;

    // Filter by preferred start date
    if (startDate || endDate) {
      filter.preferredStartDate = {};
      if (startDate) filter.preferredStartDate.$gte = new Date(startDate);
      if (endDate) filter.preferredStartDate.$lte = new Date(endDate);
    }

    const leads = await Lead.find(filter)
      .populate('tourPackageId')
      .populate('agentId')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
});

// Get single lead
app.get('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('tourPackageId')
      .populate('agentId')
      .populate('bookingId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('❌ Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
});

// Update lead (status, notes, quote info, etc.)
app.patch('/api/leads/:id', async (req, res) => {
  try {
    const updateData = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tourPackageId').populate('agentId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    console.log(`✅ Lead updated: ${lead._id} - Status: ${lead.status}`);

    // TODO: Trigger status-based emails (e.g., quote-sent, accepted, etc.)

    res.json({
      success: true,
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    console.error('❌ Error updating lead:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
});

// Delete lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
});

// Generate quote for lead using package cost estimator
app.post('/api/leads/:id/generate-quote', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('tourPackageId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (!lead.tourPackageId) {
      return res.status(400).json({
        success: false,
        message: 'No tour package selected for this lead'
      });
    }

    const tourPackage = lead.tourPackageId;

    // Use the same cost estimation logic from package estimator
    const duration = tourPackage.duration;
    const totalPeople = lead.numberOfAdults + (lead.numberOfChildren || 0);

    // Determine season
    let seasonMultiplier = tourPackage.seasonMultipliers.low;
    const month = new Date(lead.preferredStartDate).getMonth() + 1;
    if (month >= 11 || month <= 2) {
      seasonMultiplier = tourPackage.seasonMultipliers.peak;
    } else if ((month >= 3 && month <= 5) || (month >= 9 && month <= 10)) {
      seasonMultiplier = tourPackage.seasonMultipliers.shoulder;
    }

    // Calculate costs
    const hotelLevel = lead.hotelLevel || 'standard';
    const accommodationCost = tourPackage.costTemplate.accommodationPerNight[hotelLevel] * duration * totalPeople;
    const mealCost = tourPackage.costTemplate.mealPerDay * duration * totalPeople;
    const guideCost = tourPackage.costTemplate.guidePerDay * duration;
    const transportCost = tourPackage.costTemplate.transportPerDay * duration;
    const attractionsCost = tourPackage.costTemplate.attractionsPerPerson * totalPeople;
    const totalCosts = accommodationCost + mealCost + guideCost + transportCost + attractionsCost;

    // Calculate revenue
    const baseRevenue = tourPackage.basePricePerPerson * totalPeople;
    const estimatedRevenue = Math.round(baseRevenue * seasonMultiplier);
    const estimatedProfit = estimatedRevenue - totalCosts;

    // Update lead with quote info
    lead.quoteGenerated = true;
    lead.estimatedCost = totalCosts;
    lead.finalQuotedPrice = estimatedRevenue;

    // Set quote valid for 14 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);
    lead.quoteValidUntil = validUntil;

    // Update status if still new
    if (lead.status === 'new') {
      lead.status = 'quoted';
    }

    await lead.save();

    const quote = {
      leadId: lead._id,
      customerName: lead.customerName,
      packageName: tourPackage.name,
      duration: duration,
      numberOfAdults: lead.numberOfAdults,
      numberOfChildren: lead.numberOfChildren,
      totalPeople,
      hotelLevel,
      season: seasonMultiplier === tourPackage.seasonMultipliers.peak ? 'peak' :
              seasonMultiplier === tourPackage.seasonMultipliers.shoulder ? 'shoulder' : 'low',
      costs: {
        accommodation: accommodationCost,
        meals: mealCost,
        guide: guideCost,
        transport: transportCost,
        attractions: attractionsCost,
        total: totalCosts
      },
      quotedPrice: estimatedRevenue,
      estimatedProfit,
      validUntil: lead.quoteValidUntil
    };

    console.log(`✅ Quote generated for lead ${lead._id}: ${estimatedRevenue} THB`);

    // TODO: Trigger "quote generated" email with quote details

    res.json({
      success: true,
      message: 'Quote generated successfully',
      quote,
      lead
    });
  } catch (error) {
    console.error('❌ Error generating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating quote',
      error: error.message
    });
  }
});

// Send quote email to customer
app.post('/api/leads/:id/send-quote', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('tourPackageId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (!lead.quoteGenerated) {
      return res.status(400).json({
        success: false,
        message: 'No quote generated for this lead. Generate a quote first.'
      });
    }

    // Build quote object for email
    const quote = {
      packageName: lead.tourPackageId.name,
      duration: lead.duration,
      numberOfAdults: lead.numberOfAdults,
      numberOfChildren: lead.numberOfChildren || 0,
      totalPeople: lead.numberOfAdults + (lead.numberOfChildren || 0),
      hotelLevel: lead.hotelLevel || 'standard',
      season: 'standard', // This would be calculated based on date
      costs: {
        accommodation: Math.round(lead.estimatedCost * 0.35),
        meals: Math.round(lead.estimatedCost * 0.2),
        guide: Math.round(lead.estimatedCost * 0.15),
        transport: Math.round(lead.estimatedCost * 0.2),
        attractions: Math.round(lead.estimatedCost * 0.1)
      },
      quotedPrice: lead.finalQuotedPrice,
      validUntil: lead.quoteValidUntil
    };

    // Send quote email
    const emailResult = await emailService.sendQuoteEmail(lead, quote);

    if (emailResult.success) {
      // Update lead only if email sent successfully
      lead.quoteSentAt = new Date();
      lead.status = 'quote-sent';
      lead.emailsSent = (lead.emailsSent || 0) + 1;
      lead.lastContactedAt = new Date();
      await lead.save();

      console.log(`✅ Quote email sent to ${lead.customerEmail}`);

      res.json({
        success: true,
        message: 'Quote sent successfully',
        lead
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send quote email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending quote:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending quote',
      error: error.message
    });
  }
});

// Convert lead to booking
app.post('/api/leads/:id/convert', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('tourPackageId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.convertedToBooking) {
      return res.status(400).json({
        success: false,
        message: 'Lead already converted to booking',
        bookingId: lead.bookingId
      });
    }

    // Create booking from lead data
    const bookingData = {
      contactName: lead.customerName,
      contactEmail: lead.customerEmail,
      contactPhone: lead.customerPhone,
      numberOfAdults: lead.numberOfAdults,
      numberOfChildren: lead.numberOfChildren || 0,
      hasChildren: (lead.numberOfChildren || 0) > 0,
      pickupDate: lead.preferredStartDate,
      endDate: lead.preferredEndDate,

      // If package selected, link it
      tourPackageId: lead.tourPackageId ? lead.tourPackageId._id : null,
      packageName: lead.tourPackageId ? lead.tourPackageId.name : null,

      // Hotel level from lead
      hotelLevel: lead.hotelLevel,
      includesHotels: true,

      // Revenue from quote
      estimatedRevenue: lead.finalQuotedPrice || lead.estimatedCost,

      // Agent from lead
      agentId: lead.agentId || null,

      // Set initial status
      status: 'confirmed',

      // Special requests as admin notes
      adminNotes: lead.specialRequests || '',

      // Default values for required fields
      pickupPoint: 'hotel',
      dropoffPoint: 'hotel',
      includesGuide: false,
      includesTrip: true,
      allowsSelfDriving: false,
      includesAttractions: false,
      includesFood: false,
      needsShabbatHotel: false
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Update lead
    lead.convertedToBooking = true;
    lead.bookingId = booking._id;
    lead.convertedAt = new Date();
    lead.status = 'converted';
    await lead.save();

    // Update agent metrics if assigned
    if (lead.agentId) {
      await updateAgentMetrics(lead.agentId);
    }

    console.log(`✅ Lead ${lead._id} converted to booking ${booking._id}`);

    // Send booking confirmation email (async, don't wait)
    emailService.sendBookingConfirmationEmail(booking).catch(err =>
      console.error('Failed to send booking confirmation email:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Lead converted to booking successfully',
      booking,
      lead
    });
  } catch (error) {
    console.error('❌ Error converting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting lead to booking',
      error: error.message
    });
  }
});

// Get lead conversion statistics
app.get('/api/leads/stats/conversion', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const allLeads = await Lead.find(filter);
    const convertedLeads = allLeads.filter(l => l.convertedToBooking);
    const quotedLeads = allLeads.filter(l => l.quoteGenerated);
    const quoteSentLeads = allLeads.filter(l => l.quoteSentAt);
    const acceptedLeads = allLeads.filter(l => l.status === 'accepted');

    const stats = {
      totalLeads: allLeads.length,
      newLeads: allLeads.filter(l => l.status === 'new').length,
      quotedLeads: quotedLeads.length,
      quoteSentLeads: quoteSentLeads.length,
      acceptedLeads: acceptedLeads.length,
      convertedLeads: convertedLeads.length,
      lostLeads: allLeads.filter(l => l.status === 'lost' || l.status === 'declined').length,

      // Conversion rates
      quoteConversionRate: quotedLeads.length > 0 ? (quoteSentLeads.length / quotedLeads.length) * 100 : 0,
      leadConversionRate: allLeads.length > 0 ? (convertedLeads.length / allLeads.length) * 100 : 0,
      quoteToBookingRate: quoteSentLeads.length > 0 ? (convertedLeads.length / quoteSentLeads.length) * 100 : 0,

      // Revenue from converted leads
      totalEstimatedRevenue: convertedLeads.reduce((sum, l) => sum + (l.finalQuotedPrice || 0), 0),
      averageQuoteValue: quotedLeads.length > 0
        ? quotedLeads.reduce((sum, l) => sum + (l.finalQuotedPrice || 0), 0) / quotedLeads.length
        : 0,

      // By source
      bySource: {},

      // Average response time (in days)
      avgTimeToQuote: quotedLeads.length > 0
        ? quotedLeads.reduce((sum, l) => {
            const created = new Date(l.createdAt);
            const quoted = new Date(l.updatedAt); // Approximation
            return sum + Math.abs(quoted - created) / (1000 * 60 * 60 * 24);
          }, 0) / quotedLeads.length
        : 0
    };

    // Calculate by source
    const sources = ['web-form', 'phone', 'email', 'referral', 'social-media', 'other'];
    sources.forEach(source => {
      const sourceLeads = allLeads.filter(l => l.source === source);
      const sourceConverted = sourceLeads.filter(l => l.convertedToBooking);
      stats.bySource[source] = {
        total: sourceLeads.length,
        converted: sourceConverted.length,
        conversionRate: sourceLeads.length > 0 ? (sourceConverted.length / sourceLeads.length) * 100 : 0
      };
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching conversion stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversion statistics',
      error: error.message
    });
  }
});

// Assign agent to lead
app.patch('/api/leads/:id/assign-agent', async (req, res) => {
  try {
    const { agentId } = req.body;

    // Verify agent if provided
    if (agentId) {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }
      if (agent.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign inactive agent'
        });
      }
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead.agentId = agentId || null;
    lead.assignedAt = agentId ? new Date() : null;
    await lead.save();

    const updatedLead = await Lead.findById(req.params.id).populate('agentId');

    res.json({
      success: true,
      message: agentId ? 'Agent assigned successfully' : 'Agent unassigned',
      lead: updatedLead
    });
  } catch (error) {
    console.error('❌ Error assigning agent to lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning agent',
      error: error.message
    });
  }
});

// ============= FEEDBACK & REVIEWS =============

// Submit feedback for a booking (public endpoint)
app.post('/api/feedback', async (req, res) => {
  try {
    const feedbackData = req.body;

    // Verify booking exists
    const booking = await Booking.findById(feedbackData.bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({ bookingId: feedbackData.bookingId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this booking'
      });
    }

    // Add booking context to feedback
    feedbackData.customerName = feedbackData.customerName || booking.contactName;
    feedbackData.customerEmail = feedbackData.customerEmail || booking.contactEmail;
    feedbackData.tourPackageId = booking.tourPackageId;
    feedbackData.tourDate = booking.pickupDate;
    feedbackData.agentId = booking.agentId;
    feedbackData.guideId = booking.guideId;

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    console.log(`✅ Feedback submitted for booking ${booking._id}: ${feedback.overallRating} stars`);

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(400).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// Get all feedback (admin)
app.get('/api/feedback', async (req, res) => {
  try {
    const { status, minRating, packageId, agentId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (minRating) filter.overallRating = { $gte: parseInt(minRating) };
    if (packageId) filter.tourPackageId = packageId;
    if (agentId) filter.agentId = agentId;

    const feedbacks = await Feedback.find(filter)
      .populate('bookingId')
      .populate('tourPackageId')
      .populate('agentId')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// Get public/published feedback (for website display)
app.get('/api/feedback/public', async (req, res) => {
  try {
    const { packageId, limit, minRating } = req.query;

    const filter = {
      status: { $in: ['approved', 'published'] },
      allowPublicDisplay: true
    };

    if (packageId) filter.tourPackageId = packageId;
    if (minRating) filter.overallRating = { $gte: parseInt(minRating) };

    let query = Feedback.find(filter)
      .populate('tourPackageId', 'name code')
      .select('overallRating ratings comments highlights displayName tourDate publishedAt')
      .sort({ publishedAt: -1 });

    if (limit) query = query.limit(parseInt(limit));

    const feedbacks = await query;

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    console.error('❌ Error fetching public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// Get single feedback
app.get('/api/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('bookingId')
      .populate('tourPackageId')
      .populate('agentId');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// Update feedback status (approve/reject/publish)
app.patch('/api/feedback/:id', async (req, res) => {
  try {
    const { status, adminResponse, approvedBy } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'published' && !req.body.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
      updateData.respondedAt = new Date();
    }
    if (approvedBy) updateData.approvedBy = approvedBy;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
});

// Delete feedback
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
});

// Get feedback statistics
app.get('/api/feedback/stats/summary', async (req, res) => {
  try {
    const { packageId, agentId, startDate, endDate } = req.query;

    const filter = {};
    if (packageId) filter.tourPackageId = packageId;
    if (agentId) filter.agentId = agentId;
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }

    const feedbacks = await Feedback.find(filter);

    if (feedbacks.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalFeedback: 0,
          averageRating: 0,
          recommendationRate: 0
        }
      });
    }

    const stats = {
      totalFeedback: feedbacks.length,
      averageRating: feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length,
      ratingDistribution: {
        1: feedbacks.filter(f => f.overallRating === 1).length,
        2: feedbacks.filter(f => f.overallRating === 2).length,
        3: feedbacks.filter(f => f.overallRating === 3).length,
        4: feedbacks.filter(f => f.overallRating === 4).length,
        5: feedbacks.filter(f => f.overallRating === 5).length
      },
      recommendationRate: (feedbacks.filter(f => f.wouldRecommend).length / feedbacks.length) * 100,
      testimonialWillingRate: (feedbacks.filter(f => f.willingToProvideTestimonial).length / feedbacks.length) * 100,

      // Category averages
      categoryAverages: {
        guide: 0,
        vehicle: 0,
        activities: 0,
        accommodation: 0,
        food: 0,
        valueForMoney: 0
      },

      // Status breakdown
      byStatus: {
        pending: feedbacks.filter(f => f.status === 'pending').length,
        approved: feedbacks.filter(f => f.status === 'approved').length,
        published: feedbacks.filter(f => f.status === 'published').length,
        rejected: feedbacks.filter(f => f.status === 'rejected').length
      }
    };

    // Calculate category averages
    const categoryCounts = {
      guide: 0,
      vehicle: 0,
      activities: 0,
      accommodation: 0,
      food: 0,
      valueForMoney: 0
    };

    feedbacks.forEach(f => {
      if (f.ratings) {
        Object.keys(f.ratings.toObject()).forEach(category => {
          if (f.ratings[category]) {
            stats.categoryAverages[category] += f.ratings[category];
            categoryCounts[category]++;
          }
        });
      }
    });

    Object.keys(stats.categoryAverages).forEach(category => {
      if (categoryCounts[category] > 0) {
        stats.categoryAverages[category] = stats.categoryAverages[category] / categoryCounts[category];
      }
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
});

// Get feedback for specific booking (public - for checking if already submitted)
app.get('/api/feedback/booking/:bookingId', async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ bookingId: req.params.bookingId });

    if (!feedback) {
      return res.json({
        success: true,
        exists: false,
        feedback: null
      });
    }

    res.json({
      success: true,
      exists: true,
      feedback
    });
  } catch (error) {
    console.error('❌ Error checking feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking feedback',
      error: error.message
    });
  }
});

// ============= GUIDE MANAGEMENT =============

// Create new guide
app.post('/api/guides', async (req, res) => {
  try {
    const guideData = req.body;

    // Check if email already exists
    const existingGuide = await Guide.findOne({ email: guideData.email });
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: 'Guide with this email already exists'
      });
    }

    const guide = new Guide(guideData);
    await guide.save();

    console.log('✅ New guide created:', guide._id);

    res.status(201).json({
      success: true,
      message: 'Guide created successfully',
      guide
    });
  } catch (error) {
    console.error('❌ Error creating guide:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating guide',
      error: error.message
    });
  }
});

// Get all guides (with optional filters)
app.get('/api/guides', async (req, res) => {
  try {
    const {
      status,
      language,
      specialization,
      activitySkill,
      region,
      minRating,
      employmentType
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (language) filter['languages.language'] = language;
    if (specialization) filter.specializations = specialization;
    if (activitySkill) filter.activitySkills = activitySkill;
    if (region) filter['availability.preferredRegions'] = region;
    if (minRating) filter['performance.averageRating'] = { $gte: parseFloat(minRating) };

    const guides = await Guide.find(filter).sort({ 'performance.averageRating': -1, createdAt: -1 });

    res.json({
      success: true,
      count: guides.length,
      guides
    });
  } catch (error) {
    console.error('❌ Error fetching guides:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guides',
      error: error.message
    });
  }
});

// Get single guide by ID
app.get('/api/guides/:id', async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    res.json({
      success: true,
      guide
    });
  } catch (error) {
    console.error('❌ Error fetching guide:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guide',
      error: error.message
    });
  }
});

// Update guide
app.patch('/api/guides/:id', async (req, res) => {
  try {
    const updateData = req.body;

    // If updating email, check uniqueness
    if (updateData.email) {
      const existingGuide = await Guide.findOne({
        email: updateData.email,
        _id: { $ne: req.params.id }
      });
      if (existingGuide) {
        return res.status(400).json({
          success: false,
          message: 'Another guide with this email already exists'
        });
      }
    }

    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    res.json({
      success: true,
      message: 'Guide updated successfully',
      guide
    });
  } catch (error) {
    console.error('❌ Error updating guide:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating guide',
      error: error.message
    });
  }
});

// Delete guide
app.delete('/api/guides/:id', async (req, res) => {
  try {
    // TODO: Check if guide is assigned to any upcoming bookings
    // For now, allow deletion

    const guide = await Guide.findByIdAndDelete(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    res.json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting guide:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting guide',
      error: error.message
    });
  }
});

// Find available guides for specific dates and region
app.post('/api/guides/search/available', async (req, res) => {
  try {
    const { startDate, endDate, region, requiredSkills, requiredLanguages } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Build query
    const query = {
      status: 'active'
    };

    // Filter by region if provided
    if (region) {
      query['availability.preferredRegions'] = region;
    }

    // Filter by required skills if provided
    if (requiredSkills && requiredSkills.length > 0) {
      query.activitySkills = { $all: requiredSkills };
    }

    // Filter by required languages if provided
    if (requiredLanguages && requiredLanguages.length > 0) {
      query['languages.language'] = { $in: requiredLanguages };
    }

    // Find guides not in blackout dates
    query['availability.blackoutDates'] = {
      $not: {
        $elemMatch: {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      }
    };

    const guides = await Guide.find(query).sort({ 'performance.averageRating': -1 });

    res.json({
      success: true,
      count: guides.length,
      guides,
      searchCriteria: {
        startDate,
        endDate,
        region,
        requiredSkills,
        requiredLanguages
      }
    });
  } catch (error) {
    console.error('❌ Error searching guides:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for available guides',
      error: error.message
    });
  }
});

// Find guides by specific skill
app.get('/api/guides/search/by-skill', async (req, res) => {
  try {
    const { skillType, skillValue } = req.query;

    if (!skillType || !skillValue) {
      return res.status(400).json({
        success: false,
        message: 'skillType and skillValue are required'
      });
    }

    const query = { status: 'active' };

    // Build dynamic query based on skill type
    if (skillType === 'language') {
      query['languages.language'] = skillValue;
    } else if (skillType === 'activity') {
      query.activitySkills = skillValue;
    } else if (skillType === 'specialization') {
      query.specializations = skillValue;
    } else if (skillType === 'driving') {
      query['drivingSkills.specializedSkills'] = skillValue;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid skillType. Must be: language, activity, specialization, or driving'
      });
    }

    const guides = await Guide.find(query).sort({ 'performance.averageRating': -1 });

    res.json({
      success: true,
      count: guides.length,
      guides,
      searchCriteria: { skillType, skillValue }
    });
  } catch (error) {
    console.error('❌ Error searching guides by skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching guides by skill',
      error: error.message
    });
  }
});

// Get guide performance statistics
app.get('/api/guides/:id/stats', async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Get feedback for this guide
    const feedbacks = await Feedback.find({ guideId: req.params.id });

    const stats = {
      guideId: guide._id,
      guideName: `${guide.firstName} ${guide.lastName}`,
      performance: guide.performance,
      experience: guide.experience,

      // Skills summary
      totalLanguages: guide.languages.length,
      totalActivitySkills: guide.activitySkills.length,
      totalSpecializations: guide.specializations.length,
      totalCertifications: guide.certifications.length,
      activeCertifications: guide.certifications.filter(c => c.status === 'active').length,
      expiringSoonCertifications: guide.certifications.filter(c => {
        if (!c.expiryDate || c.status !== 'active') return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return new Date(c.expiryDate) <= thirtyDaysFromNow;
      }).length,

      // Feedback analysis
      totalFeedback: feedbacks.length,
      averageFeedbackRating: feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + (f.ratings?.guide || 0), 0) / feedbacks.length
        : 0,
      recentFeedback: feedbacks.slice(0, 5).map(f => ({
        rating: f.ratings?.guide,
        overallRating: f.overallRating,
        date: f.submittedAt,
        comments: f.comments
      })),

      // Pricing
      dailyRate: guide.pricing.baseDayRate,
      currency: guide.pricing.currency,
      isPremium: guide.performance.averageRating >= 4.5 && guide.performance.totalReviews >= 20 && guide.experience.yearsGuiding >= 3
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching guide stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guide statistics',
      error: error.message
    });
  }
});

// Update guide performance after tour completion
app.patch('/api/guides/:id/update-performance', async (req, res) => {
  try {
    const { rating, tipAmount, compliment, complaint } = req.body;

    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Update performance metrics
    if (rating !== undefined) {
      const totalRatings = guide.performance.totalReviews;
      const currentAvg = guide.performance.averageRating;

      // Calculate new average
      const newAverage = ((currentAvg * totalRatings) + rating) / (totalRatings + 1);

      guide.performance.averageRating = newAverage;
      guide.performance.totalReviews += 1;
    }

    if (tipAmount !== undefined && tipAmount > 0) {
      const totalTips = guide.performance.tipAverage * guide.performance.totalReviews;
      guide.performance.tipAverage = (totalTips + tipAmount) / (guide.performance.totalReviews || 1);
    }

    if (compliment) {
      guide.performance.customerCompliments += 1;
    }

    if (complaint) {
      guide.performance.customerComplaints += 1;
    }

    // Update experience metrics
    guide.experience.totalToursLed += 1;
    guide.lastActiveDate = new Date();

    await guide.save();

    console.log(`✅ Guide performance updated: ${guide._id}`);

    res.json({
      success: true,
      message: 'Guide performance updated successfully',
      guide
    });
  } catch (error) {
    console.error('❌ Error updating guide performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating guide performance',
      error: error.message
    });
  }
});

// Add certification to guide
app.post('/api/guides/:id/certifications', async (req, res) => {
  try {
    const certificationData = req.body;

    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    guide.certifications.push(certificationData);
    await guide.save();

    console.log(`✅ Certification added to guide ${guide._id}: ${certificationData.name}`);

    res.json({
      success: true,
      message: 'Certification added successfully',
      guide
    });
  } catch (error) {
    console.error('❌ Error adding certification:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding certification',
      error: error.message
    });
  }
});

// Add blackout dates to guide
app.post('/api/guides/:id/blackout-dates', async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    guide.availability.blackoutDates.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || ''
    });

    await guide.save();

    console.log(`✅ Blackout dates added to guide ${guide._id}`);

    res.json({
      success: true,
      message: 'Blackout dates added successfully',
      guide
    });
  } catch (error) {
    console.error('❌ Error adding blackout dates:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding blackout dates',
      error: error.message
    });
  }
});

// Get guides ranked by profitability (considering rates and ratings)
app.get('/api/guides/analytics/profitability', async (req, res) => {
  try {
    const guides = await Guide.find({ status: 'active' });

    const profitabilityRanking = guides.map(guide => {
      // Calculate profitability score
      // Higher rating + reasonable rate = more profitable
      const ratingScore = guide.performance.averageRating * 20; // Max 100
      const experienceScore = Math.min(guide.experience.yearsGuiding * 10, 50); // Max 50
      const reviewCountScore = Math.min(guide.performance.totalReviews, 30); // Max 30
      const recommendationScore = guide.performance.recommendationRate * 0.2; // Max 20

      const profitabilityScore = ratingScore + experienceScore + reviewCountScore + recommendationScore;

      return {
        guideId: guide._id,
        guideName: `${guide.firstName} ${guide.lastName}`,
        dailyRate: guide.pricing.baseDayRate,
        averageRating: guide.performance.averageRating,
        totalReviews: guide.performance.totalReviews,
        yearsExperience: guide.experience.yearsGuiding,
        totalToursLed: guide.experience.totalToursLed,
        recommendationRate: guide.performance.recommendationRate,
        profitabilityScore,
        isPremium: guide.performance.averageRating >= 4.5 && guide.performance.totalReviews >= 20 && guide.experience.yearsGuiding >= 3,
        languages: guide.languages.map(l => l.language),
        topSkills: guide.activitySkills.slice(0, 5),
        preferredRegions: guide.availability.preferredRegions
      };
    });

    // Sort by profitability score descending
    profitabilityRanking.sort((a, b) => b.profitabilityScore - a.profitabilityScore);

    res.json({
      success: true,
      count: profitabilityRanking.length,
      guides: profitabilityRanking,
      averageRate: profitabilityRanking.length > 0
        ? profitabilityRanking.reduce((sum, g) => sum + g.dailyRate, 0) / profitabilityRanking.length
        : 0
    });
  } catch (error) {
    console.error('❌ Error fetching profitability analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profitability analytics',
      error: error.message
    });
  }
});

// Get skills gap analysis (what skills are lacking)
app.get('/api/guides/analytics/skills-gap', async (req, res) => {
  try {
    const guides = await Guide.find({ status: 'active' });

    // Count guides by skill
    const languageCount = {};
    const activityCount = {};
    const specializationCount = {};
    const drivingCount = {};

    guides.forEach(guide => {
      // Languages
      guide.languages.forEach(lang => {
        languageCount[lang.language] = (languageCount[lang.language] || 0) + 1;
      });

      // Activity skills
      guide.activitySkills.forEach(skill => {
        activityCount[skill] = (activityCount[skill] || 0) + 1;
      });

      // Specializations
      guide.specializations.forEach(spec => {
        specializationCount[spec] = (specializationCount[spec] || 0) + 1;
      });

      // Driving skills
      if (guide.drivingSkills && guide.drivingSkills.specializedSkills) {
        guide.drivingSkills.specializedSkills.forEach(skill => {
          drivingCount[skill] = (drivingCount[skill] || 0) + 1;
        });
      }
    });

    // Identify gaps (skills with few guides)
    const getTopGaps = (countObj, threshold = 3) => {
      return Object.entries(countObj)
        .filter(([skill, count]) => count < threshold)
        .sort((a, b) => a[1] - b[1])
        .map(([skill, count]) => ({ skill, guideCount: count }));
    };

    const analysis = {
      totalActiveGuides: guides.length,

      languageGaps: getTopGaps(languageCount, 5),
      mostCommonLanguages: Object.entries(languageCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang, count]) => ({ language: lang, guideCount: count })),

      activitySkillGaps: getTopGaps(activityCount, 3),
      mostCommonActivitySkills: Object.entries(activityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, guideCount: count })),

      specializationGaps: getTopGaps(specializationCount, 2),
      mostCommonSpecializations: Object.entries(specializationCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([spec, count]) => ({ specialization: spec, guideCount: count })),

      drivingSkillGaps: getTopGaps(drivingCount, 2),

      recommendations: []
    };

    // Generate hiring recommendations
    if (analysis.languageGaps.length > 0) {
      analysis.recommendations.push(`Consider hiring guides with ${analysis.languageGaps[0].skill} language skills`);
    }
    if (analysis.activitySkillGaps.length > 0) {
      analysis.recommendations.push(`Need more guides with ${analysis.activitySkillGaps[0].skill} skills`);
    }
    if (analysis.specializationGaps.length > 0) {
      analysis.recommendations.push(`Expand ${analysis.specializationGaps[0].skill} expertise`);
    }

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('❌ Error fetching skills gap analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills gap analysis',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});
