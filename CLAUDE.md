# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wiro 4x4 Tour - A tour booking system for Thailand with a React TypeScript frontend and Node.js/Express/MongoDB backend. The backend is nested within `client/server/` for simplified deployment structure.

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
```
Use `.env.example` as template. For MongoDB Atlas, update MONGODB_URI with connection string.

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
client/                    # Frontend (React + TypeScript)
├── src/
│   ├── components/
│   │   ├── TourBookingForm.tsx    # Main booking form with conditional logic
│   │   └── AdminDashboard.tsx     # Admin view for managing bookings
│   ├── types/
│   │   └── tourBooking.ts         # TypeScript interfaces and constants
│   └── App.tsx                    # Main app with view routing (booking/admin)
└── server/                # Backend (Node.js + Express + MongoDB)
    ├── src/
    │   ├── models/
    │   │   └── Booking.js         # Mongoose schema matching frontend types
    │   └── index.js               # Express server with RESTful API
    └── .env                       # Environment configuration
```

### Key Architectural Patterns

**Frontend Form Logic:**
- Conditional fields driven by `TourBookingFormData` TypeScript interface in `client/src/types/tourBooking.ts`
- React Hook Form manages form state with automatic validation
- Fields appear/disappear based on boolean toggles (hasChildren, includesHotels, includesAttractions, etc.)
- Constants arrays (ATTRACTIONS, DESTINATIONS, SHABBAT_HOTELS) define dropdown options

**Backend Data Flow:**
- RESTful API in `client/server/src/index.js` with routes: GET/POST/PATCH/DELETE `/api/bookings`
- Mongoose schema in `Booking.js` mirrors frontend TypeScript interface
- Status workflow: pending → confirmed → in-progress → completed (or cancelled)
- Query filtering by status, date range via query params
- CORS enabled for local frontend-backend communication

**State Management:**
- App.tsx uses simple useState for view routing (booking vs admin)
- AdminDashboard fetches bookings on mount and manages local state
- No global state management library (Redux/Context) - kept intentionally simple

### Type Alignment
The `TourBookingFormData` interface in `client/src/types/tourBooking.ts` must stay synchronized with the Mongoose schema in `client/server/src/models/Booking.js`. When adding fields, update both files.

## API Endpoints

All endpoints prefixed with `/api`:

- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - List all bookings (supports ?status=pending&startDate=2024-06-01&endDate=2024-06-30)
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id` - Update booking status/adminNotes
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/health` - Health check

## Development Workflow

1. **Start MongoDB** (if using local): `brew services start mongodb-community`
2. **Start backend**: `cd client/server && npm run dev`
3. **Start frontend** (new terminal): `cd client && npm run dev`
4. **Access app**: http://localhost:5173
5. **Test API**: Backend runs on http://localhost:3001

Both servers must run concurrently during development. Backend uses nodemon for auto-restart on file changes. Frontend uses Vite HMR for instant updates.

## Common Development Tasks

### Adding New Form Fields
1. Update `TourBookingFormData` interface in `client/src/types/tourBooking.ts`
2. Add field to Mongoose schema in `client/server/src/models/Booking.js`
3. Add form controls in `TourBookingForm.tsx` with react-hook-form
4. Consider if field should be conditional (show/hide based on other fields)

### Adding New Attraction/Destination Options
Update constants arrays in `client/src/types/tourBooking.ts`:
- `ATTRACTIONS` for attraction checkboxes
- `DESTINATIONS` for destination checkboxes
- `SHABBAT_HOTELS` for Shabbat hotel dropdown

### Testing Database Operations
```bash
mongosh
use wiro4x4tour
db.bookings.find({ status: 'pending' })          # Find by status
db.bookings.find({ pickupDate: { $gte: ISODate('2024-06-01') } })  # Find by date
db.bookings.deleteOne({ _id: ObjectId('...') })  # Delete by ID
```

## Technology Stack

**Frontend:** React 19, TypeScript 5.9, Vite 7, react-hook-form 7
**Backend:** Node.js, Express 5, Mongoose 9, nodemon (dev)
**Database:** MongoDB (local or Atlas)
**Dev Tools:** ESLint, TypeScript ESLint

## Important Notes

- The backend is nested inside `client/server/` rather than at root level
- Frontend and backend have separate `package.json` files and dependencies
- MongoDB must be running before starting backend
- CORS is configured in backend to allow frontend requests from localhost:5173
- Booking status enum: pending | confirmed | in-progress | completed | cancelled
