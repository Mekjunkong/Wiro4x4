# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wiro 4x4 Tour - A comprehensive tour business management system with a React TypeScript frontend and Node.js/Express/MongoDB backend. The backend is nested within `client/server/` for simplified deployment structure.

**Key Capabilities:**
- Public tour booking with conditional form logic
- Admin dashboard for booking management
- Agent management with commission tracking
- Lead-to-booking conversion pipeline with automated quotes
- Financial dashboard with profit/cost analysis
- Tour package templates with seasonal pricing
- Feedback/review system with public testimonials
- Email automation (SendGrid integration)
- Multi-agent tour planning system (.claude/agents/)

## Development Commands

### Frontend (React + TypeScript + Vite)
```bash
cd client
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (TypeScript + Vite)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (Node.js + Express + MongoDB)
```bash
cd client/server
npm install          # Install dependencies
npm run dev          # Start dev server with nodemon (http://localhost:3001)
npm start            # Start production server
```

### Environment Setup
Backend requires `.env` file in `client/server/`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/wiro4x4tour
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=your_sendgrid_api_key  # For email automation
SENDGRID_FROM_EMAIL=your_verified_email
```
Use `.env.example` as template. For MongoDB Atlas, update MONGODB_URI with connection string. SendGrid is optional but required for quote/booking emails.

### MongoDB
```bash
# Local MongoDB
brew services start mongodb-community  # macOS
mongosh                                # Connect to MongoDB shell
use wiro4x4tour                        # Switch to project database
db.bookings.find().pretty()            # View all bookings

# Check MongoDB connection
mongosh "mongodb://localhost:27017/wiro4x4tour"
```

## Architecture

### Project Structure
```
.claude/agents/            # Multi-agent tour planning system
├── tour-planner/          # Master orchestrator + specialist sub-agents
└── marketing-orchestrator/ # Marketing automation agents
client/                    # Frontend (React + TypeScript)
├── src/
│   ├── components/
│   │   ├── TourBookingForm.tsx    # Public booking form
│   │   ├── AdminDashboard.tsx     # Booking management
│   │   ├── agents/                # Agent management UI
│   │   ├── financial/             # Financial tracking & cost management
│   │   ├── leads/                 # Lead management & quote generation
│   │   ├── feedback/              # Customer feedback forms
│   │   └── inquiry/               # Public inquiry form
│   ├── types/
│   │   ├── tourBooking.ts         # Booking interfaces
│   │   ├── agent.ts               # Agent interfaces
│   │   ├── lead.ts                # Lead/quote interfaces
│   │   ├── financial.ts           # Financial tracking interfaces
│   │   ├── feedback.ts            # Feedback/review interfaces
│   │   └── tourPackage.ts         # Package template interfaces
│   ├── config/
│   │   └── api.ts                 # API URL configuration
│   └── App.tsx                    # Main app with 5-view routing
└── server/                # Backend (Node.js + Express + MongoDB)
    ├── src/
    │   ├── models/
    │   │   ├── Booking.js         # Booking schema with financial fields
    │   │   ├── Agent.js           # Agent schema with commission tracking
    │   │   ├── Lead.js            # Lead/inquiry schema
    │   │   ├── TourPackage.js     # Package template schema
    │   │   └── Feedback.js        # Feedback/review schema
    │   ├── services/
    │   │   └── emailService.js    # SendGrid email automation
    │   └── index.js               # Express server (1900+ lines, comprehensive API)
    └── .env                       # Environment configuration
```

### Key Architectural Patterns

**Multi-View Frontend:**
- App.tsx routes between 5 views: booking (public), admin, agents, financial, leads
- Each view is a standalone component with its own state management
- No global state library (Redux/Context) - intentionally simple with local useState
- API_URL configuration in `client/src/config/api.ts` for environment-specific endpoints

**Lead-to-Booking Pipeline:**
1. Customer submits inquiry via InquiryForm → creates Lead
2. Admin/agent assigns package to lead
3. System generates quote using TourPackage cost templates
4. Quote email sent to customer (SendGrid)
5. Lead status: new → quoted → quote-sent → accepted/declined
6. Accepted leads convert to Bookings via `/api/leads/:id/convert`

**Financial Tracking Architecture:**
- Bookings have `estimatedRevenue`, `actualRevenue`, and nested `costs` object
- Pre-save hooks auto-calculate `totalCosts`, `profit`, `profitMargin`
- Agents earn commission based on `commissionRate` × revenue
- Agent metrics auto-update when bookings are assigned/updated
- Financial dashboard aggregates across all bookings for business intelligence

**Tour Package Templates:**
- Packages define cost templates (accommodation tiers, meals, transport, guides, attractions)
- Seasonal multipliers adjust pricing (peak/shoulder/low season)
- Quote generation uses package templates + customer inputs (adults, children, dates, hotel level)
- Packages can be linked to leads and bookings for consistency

**Email Automation Flow:**
- `emailService.js` handles SendGrid integration
- Triggers: inquiry received, quote sent, booking confirmed, feedback request
- Emails sent asynchronously (don't block API responses)
- Configured via SENDGRID_API_KEY environment variable

**Type Synchronization:**
Critical type alignment between frontend TypeScript and backend Mongoose schemas:
- `client/src/types/tourBooking.ts` ↔ `client/server/src/models/Booking.js`
- `client/src/types/agent.ts` ↔ `client/server/src/models/Agent.js`
- `client/src/types/lead.ts` ↔ `client/server/src/models/Lead.js`
- `client/src/types/tourPackage.ts` ↔ `client/server/src/models/TourPackage.js`
- `client/src/types/feedback.ts` ↔ `client/server/src/models/Feedback.js`

When adding fields to any data model, update both TypeScript interfaces AND Mongoose schemas.

## API Endpoints

All endpoints prefixed with `/api`. See `client/server/src/index.js` for complete implementation (~1900 lines).

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - List with filters (?status, ?startDate, ?endDate)
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id` - Update status/adminNotes
- `PATCH /api/bookings/:id/assign-agent` - Assign/unassign agent
- `PATCH /api/bookings/:id/commission` - Calculate agent commission
- `PATCH /api/bookings/:id/costs` - Update cost breakdown
- `DELETE /api/bookings/:id` - Delete booking

### Agents
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents (?status filter)
- `GET /api/agents/:id` - Get agent details
- `GET /api/agents/:id/stats` - Performance statistics
- `GET /api/agents/:id/bookings` - Agent's bookings
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent (prevents if has bookings)

### Leads
- `POST /api/leads` - Create lead (public inquiry)
- `GET /api/leads` - List with filters (?status, ?source, ?priority, ?agentId)
- `GET /api/leads/:id` - Get lead details
- `PATCH /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/assign-agent` - Assign agent to lead
- `POST /api/leads/:id/generate-quote` - Generate quote from package template
- `POST /api/leads/:id/send-quote` - Email quote to customer
- `POST /api/leads/:id/convert` - Convert accepted lead to booking
- `GET /api/leads/stats/conversion` - Conversion rate statistics
- `DELETE /api/leads/:id` - Delete lead

### Tour Packages
- `POST /api/packages` - Create package template
- `GET /api/packages` - List packages (?status filter)
- `GET /api/packages/:id` - Get package
- `PATCH /api/packages/:id` - Update package
- `POST /api/packages/:id/estimate` - Estimate costs for custom inputs
- `DELETE /api/packages/:id` - Delete package (prevents if used in bookings)

### Financial
- `GET /api/financial/summary` - Overall financial summary
- `GET /api/financial/monthly` - Monthly breakdown (?year, ?month)
- `GET /api/financial/agent-performance` - Agent profit rankings

### Feedback
- `POST /api/feedback` - Submit feedback (public)
- `GET /api/feedback` - List all feedback (?status, ?minRating, ?packageId, ?agentId)
- `GET /api/feedback/public` - Published testimonials (?packageId, ?limit, ?minRating)
- `GET /api/feedback/:id` - Get feedback
- `GET /api/feedback/booking/:bookingId` - Check if feedback exists for booking
- `GET /api/feedback/stats/summary` - Feedback statistics
- `PATCH /api/feedback/:id` - Update status (approve/publish/reject)
- `DELETE /api/feedback/:id` - Delete feedback

### Health
- `GET /api/health` - Server health check

## Development Workflow

1. **Start MongoDB** (if using local): `brew services start mongodb-community`
2. **Start backend**: `cd client/server && npm run dev`
3. **Start frontend** (new terminal): `cd client && npm run dev`
4. **Access app**: http://localhost:5173
5. **Test API**: Backend runs on http://localhost:3001

Both servers must run concurrently during development. Backend uses nodemon for auto-restart on file changes. Frontend uses Vite HMR for instant updates.

## Common Development Tasks

### Adding New Booking Fields
1. Update TypeScript interface in `client/src/types/tourBooking.ts`
2. Add field to Mongoose schema in `client/server/src/models/Booking.js`
3. Update `TourBookingForm.tsx` with react-hook-form controls
4. Consider if field should be conditional (show/hide based on other fields)
5. Update API endpoint handlers in `client/server/src/index.js` if needed

### Adding New Data Models
When creating new entities (e.g., Itinerary, Vehicle, Payment):
1. Create TypeScript interface in `client/src/types/[model].ts`
2. Create Mongoose schema in `client/server/src/models/[Model].js`
3. Add CRUD routes in `client/server/src/index.js`
4. Import model at top of `index.js`
5. Create React component(s) in `client/src/components/`
6. Add view/route in `App.tsx` if needed

### Working with Agents
Agents (.claude/agents/) are custom Claude Code automation workflows:
- **tour-planner/**: Master orchestrator + 5 specialist sub-agents (destination research, cost calculation, guide coordination, logistics, safety)
- **marketing-orchestrator/**: Marketing campaign automation
- Invoke via Claude Code's agent system or modify .md files to customize behavior
- Each agent has YAML frontmatter defining name, description, tools

### Testing Email Automation
1. Set up SendGrid account and get API key
2. Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` to `.env`
3. Test endpoints that trigger emails:
   - `POST /api/leads` → sends inquiry received email
   - `POST /api/leads/:id/send-quote` → sends quote email
   - `POST /api/leads/:id/convert` → sends booking confirmation
4. Check SendGrid dashboard for delivery status

### MongoDB Operations
```bash
mongosh
use wiro4x4tour

# Bookings
db.bookings.find({ status: 'pending' }).pretty()
db.bookings.find({ agentId: ObjectId('...') })
db.bookings.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])

# Leads
db.leads.find({ status: 'new', convertedToBooking: false })
db.leads.find({ quoteGenerated: true, quoteSentAt: { $exists: true } })

# Agents
db.agents.find({ status: 'active' })
db.agents.updateOne({ _id: ObjectId('...') }, { $set: { commissionRate: 15 } })

# Financial queries
db.bookings.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: null, totalRevenue: { $sum: '$actualRevenue' }, totalProfit: { $sum: '$profit' } } }
])

# Feedback
db.feedbacks.find({ overallRating: { $gte: 4 }, status: 'published' })
```

## Technology Stack

**Frontend:** React 19, TypeScript 5.9, Vite 7, react-hook-form 7
**Backend:** Node.js, Express 5, Mongoose 9, nodemon (dev), @sendgrid/mail 8
**Database:** MongoDB (local or Atlas)
**Dev Tools:** ESLint, TypeScript ESLint

## Important Notes

### Architecture Decisions
- Backend is nested inside `client/server/` rather than at root level for simplified deployment
- Frontend and backend have separate `package.json` files and dependencies
- No global state management library (Redux/Context) - using local useState for simplicity
- API URL configured via `client/src/config/api.ts` for environment flexibility

### Data Flow Patterns
- **Booking status workflow:** pending → confirmed → in-progress → completed (or cancelled at any point)
- **Lead status workflow:** new → quoted → quote-sent → accepted/declined → converted
- **Agent status:** active | inactive | suspended
- **Feedback status:** pending → approved/rejected → published (optional)

### Financial Calculations
- Mongoose pre-save hooks auto-calculate `totalCosts`, `profit`, `profitMargin` on Booking model
- Agent metrics (`totalBookings`, `totalRevenue`, `totalCommission`) updated via `updateAgentMetrics()` helper
- Package estimator uses seasonal multipliers: peak (Nov-Feb), shoulder (Mar-May, Sep-Oct), low (Jun-Aug)

### Critical Dependencies
- MongoDB must be running before starting backend
- SendGrid API key required for email features (optional for dev, required for production)
- CORS configured to allow `FRONTEND_URL` (defaults to localhost:5173)

### Population & References
Backend uses Mongoose `.populate()` extensively:
- Bookings populate `agentId` when fetching
- Leads populate `tourPackageId`, `agentId`, `bookingId`
- Feedback populates `bookingId`, `tourPackageId`, `agentId`
- Always check if referenced documents exist before operations that depend on them

### Multi-Agent System
The `.claude/agents/` directory contains custom automation workflows:
- Not part of the web application codebase
- Used for tour planning, marketing, and content generation
- Agents delegate to sub-agents using Task tool
- Modify agent .md files to customize behavior
