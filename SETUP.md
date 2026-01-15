# Quick Setup Guide

Follow these steps to get your Wiro 4x4 Tour booking system running:

## Step 1: MongoDB Setup

Choose one option:

### Option A: Local MongoDB (Recommended for Development)

**macOS:**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
mongosh
```

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. MongoDB will start automatically as a service

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Option B: MongoDB Atlas (Cloud - No Installation)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free cluster
4. Add IP address `0.0.0.0/0` to IP whitelist (Network Access)
5. Create a database user (Database Access)
6. Click "Connect" → "Connect your application"
7. Copy the connection string
8. Update `client/server/.env` with your connection string

## Step 2: Start the Backend

```bash
cd client/server
npm run dev
```

You should see:
```
🚀 Server running on port 3001
✅ Connected to MongoDB
```

## Step 3: Start the Frontend

Open a new terminal window:

```bash
cd client
npm run dev
```

You should see:
```
  VITE ready in 500 ms
  ➜  Local:   http://localhost:5173/
```

## Step 4: Test the Application

1. Open your browser to `http://localhost:5173`
2. You'll see two navigation buttons:
   - **Book a Tour**: The booking form for customers
   - **Admin Dashboard**: View and manage bookings

3. Test the booking form:
   - Fill in the form with test data
   - Click "Submit Booking Request"
   - You should see a success message

4. Check the Admin Dashboard:
   - Click "Admin Dashboard" in the navigation
   - You should see your test booking
   - Try changing the status
   - Click on a booking to view full details

## Step 5: Verify Database

```bash
mongosh
use wiro4x4tour
db.bookings.find().pretty()
```

You should see your test booking in the database.

## Troubleshooting

### Backend won't start
- **MongoDB not running**: Check if MongoDB service is running
- **Port 3001 in use**: Change PORT in `client/server/.env`
- **Dependencies missing**: Run `npm install` in `client/server/`

### Frontend won't start
- **Port 5173 in use**: Vite will automatically try port 5174
- **Dependencies missing**: Run `npm install` in `client/`

### Form submission fails
- **Backend not running**: Make sure backend is running on port 3001
- **CORS error**: Check that CORS is enabled in backend
- **MongoDB connection failed**: Verify MongoDB is running and connection string is correct

### Can't see bookings in Admin Dashboard
- **Backend not connected**: Check browser console for errors
- **No bookings in database**: Submit a test booking first
- **MongoDB query failed**: Check backend terminal for errors

## Next Steps

You have a TODO in the AdminDashboard.tsx file:
- Implement the `getFilteredBookings()` function to filter bookings by status

See the main README.md for more detailed information about:
- API endpoints
- Production deployment
- Future enhancements
- Technology stack

---

Need help? Check the logs:
- **Backend logs**: Check the terminal where you ran `npm run dev` in server/
- **Frontend logs**: Check browser developer console (F12)
- **Database**: Use `mongosh` to query the database directly
