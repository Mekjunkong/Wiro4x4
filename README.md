# Wiro 4x4 Tour - Booking System

A comprehensive tour booking system for Wiro 4x4 Tour in Thailand, featuring a React TypeScript frontend with conditional form logic and a Node.js/Express backend with MongoDB storage.

## Features

### Frontend (React + TypeScript)
- **Comprehensive Booking Form** with intelligent conditional fields:
  - Group size (adults and optional children)
  - Tour dates (pickup and end dates)
  - Pickup/drop-off locations (airport or hotel)
  - Hotel accommodation options (budget, standard, luxury, premium)
  - Tour guide services
  - 4x4 driving with optional self-driving
  - Attractions selection (elephants, temples, rafting, etc.)
  - Food preferences (kosher, vegetarian, vegan, allergies)
  - Suggested destinations (Pai, Chiang Rai, Chiang Mai, Doi Inthanon, etc.)
  - Shabbat accommodation near Chabad

- **Real-time Form Validation** using React Hook Form
- **Responsive Design** that works on all devices
- **Smooth Animations** for conditional field appearance

### Backend (Node.js + Express + MongoDB)
- RESTful API for booking management
- MongoDB database with Mongoose ODM
- CRUD operations for bookings
- Status tracking (pending, confirmed, in-progress, completed, cancelled)
- Admin notes capability
- Filter bookings by status and date range

## Project Structure

```
Wiro4x4tour/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── TourBookingForm.tsx    # Main form component
│   │   │   └── TourBookingForm.css    # Form styling
│   │   ├── types/
│   │   │   └── tourBooking.ts         # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── App.css
│   └── server/            # Backend API (nested in client for easier deployment)
│       ├── src/
│       │   ├── models/
│       │   │   └── Booking.js         # MongoDB schema
│       │   └── index.js               # Express server
│       ├── .env                       # Environment variables
│       └── package.json
├── CLAUDE.md
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Choose one option:
  - **Local MongoDB**: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - **MongoDB Atlas** (cloud): [Sign up for free](https://www.mongodb.com/cloud/atlas/register)
- **npm** or **yarn** (comes with Node.js)

## Installation

### 1. Install Frontend Dependencies

```bash
cd client
npm install
```

### 2. Install Backend Dependencies

```bash
cd client/server
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update it:

```bash
cd client/server
cp .env.example .env
```

Edit `.env` file and configure your MongoDB connection:

**For local MongoDB:**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/wiro4x4tour
```

**For MongoDB Atlas:**
```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/wiro4x4tour?retryWrites=true&w=majority
```

## Running the Application

You'll need to run both the frontend and backend simultaneously.

### Option 1: Run in Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd client/server
npm run dev
```
The API will be available at `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Option 2: Using a Process Manager (Recommended for Development)

You can use `concurrently` to run both in one terminal. First, install it in the root:

```bash
npm init -y
npm install --save-dev concurrently
```

Add this script to root `package.json`:
```json
"scripts": {
  "dev": "concurrently \"cd client/server && npm run dev\" \"cd client && npm run dev\""
}
```

Then run:
```bash
npm run dev
```

## MongoDB Setup

### Local MongoDB Setup

1. **Install MongoDB Community Server**
   - macOS: `brew install mongodb-community`
   - Windows/Linux: [Download installer](https://www.mongodb.com/try/download/community)

2. **Start MongoDB Service**
   - macOS: `brew services start mongodb-community`
   - Windows: MongoDB runs as a service automatically
   - Linux: `sudo systemctl start mongod`

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

### MongoDB Atlas Setup (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (free tier available)
3. Add your IP address to the whitelist (or allow access from anywhere: `0.0.0.0/0`)
4. Create a database user with read/write permissions
5. Get your connection string and update `.env` file

## API Endpoints

### Create Booking
```
POST /api/bookings
Content-Type: application/json

{
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "+1234567890",
  "numberOfAdults": 2,
  "hasChildren": true,
  "numberOfChildren": 1,
  "pickupDate": "2024-06-01",
  "endDate": "2024-06-07",
  ...
}
```

### Get All Bookings
```
GET /api/bookings
GET /api/bookings?status=pending
GET /api/bookings?startDate=2024-06-01&endDate=2024-06-30
```

### Get Single Booking
```
GET /api/bookings/:id
```

### Update Booking Status
```
PATCH /api/bookings/:id
Content-Type: application/json

{
  "status": "confirmed",
  "adminNotes": "Contacted customer, tour confirmed"
}
```

### Delete Booking
```
DELETE /api/bookings/:id
```

## Testing the Application

1. **Start both frontend and backend**
2. **Navigate to** `http://localhost:5173` in your browser
3. **Fill out the booking form** with test data
4. **Submit the form**
5. **Check MongoDB** to see the saved booking:
   ```bash
   mongosh
   use wiro4x4tour
   db.bookings.find().pretty()
   ```

## Production Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Update API URL** in `TourBookingForm.tsx` to point to your production backend

### Backend Deployment (Render/Heroku/Railway)

1. **Set environment variables** on your hosting platform
2. **Deploy the server directory**
3. **Ensure MongoDB is accessible** from the hosting platform

### Environment Variables for Production
```env
PORT=3001
MONGODB_URI=<your-production-mongodb-uri>
NODE_ENV=production
```

## Future Enhancements

- [ ] Email notifications to admin when bookings are received
- [ ] Admin dashboard to manage bookings
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email confirmations to customers
- [ ] Multi-language support (Thai, Hebrew, English)
- [ ] Calendar integration for tour availability
- [ ] Pricing calculator based on selections
- [ ] Photo gallery of destinations and attractions
- [ ] Customer reviews and testimonials

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- React Hook Form (form state management)
- Vite (build tool)

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose (ODM)

## Support

For issues or questions:
- Check MongoDB connection if database operations fail
- Ensure both frontend and backend are running
- Check browser console for frontend errors
- Check terminal logs for backend errors

## License

This project is proprietary software for Wiro 4x4 Tour.

---

Built with ❤️ for Wiro 4x4 Tour - Exploring Thailand's beautiful destinations
