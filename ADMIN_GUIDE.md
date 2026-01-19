# WIRO 4x4 Admin Panel - User Guide

## 🔐 Accessing the Admin Panel

### Method 1: Direct URL
Navigate to: **https://wiro4x4.manus.space/admin**

### Method 2: Navigation Menu (After Login)
1. Log in to your account
2. Look for the "Admin" link in the header navigation (appears only for admin users)
3. Click the "Admin" link with the shield icon 🛡️

### Login Requirements
- You must be logged in with an admin account
- Regular users cannot access the admin panel
- If you see a login prompt, click "Login with Manus" and use your credentials

---

## 📊 Admin Dashboard Overview

The admin dashboard has **three main tabs**:

### 1. 📋 Bookings Tab (Default View)
Displays all customer bookings in a table format.

**Table Columns:**
- **Customer Name** - Full name of the person who booked
- **Email** - Customer's email address
- **Phone** - Contact phone number
- **Tour Type** - Which tour they selected (Full Day Jungle, Half Day Waterfall, etc.)
- **Date** - Tour date
- **Group Size** - Number of people
- **Status** - Current booking status (Pending, Confirmed, Cancelled, Completed)
- **Actions** - View details or update status

**Features:**
- **Search Bar** - Search by customer name, email, or phone
- **Status Filter** - Filter bookings by status (All, Pending, Confirmed, Cancelled, Completed)
- **View Details** - Click the eye icon to see full booking information
- **Update Status** - Click the pencil icon to change booking status

---

### 2. 📅 Calendar Tab
Visual calendar view of all bookings.

**Features:**
- **Monthly View** - See all bookings organized by date
- **Color-Coded Status:**
  - 🟡 **Yellow** = Pending
  - 🟢 **Green** = Confirmed
  - 🔴 **Red** = Cancelled
  - 🔵 **Blue** = Completed
- **Navigation** - Use arrows to move between months
- **Click to View** - Click any booking to see details
- **Multiple Bookings** - If multiple bookings exist on one date, they're all shown

**How to Use:**
1. Click the "Calendar" tab
2. Navigate to the desired month using < > arrows
3. Click on any booking to view full details
4. Use the color coding to quickly identify booking statuses

---

### 3. 📈 Analytics Tab
View booking statistics and trends.

**Metrics Displayed:**
- Total number of bookings
- Bookings by status (breakdown)
- Bookings by tour type
- Recent booking trends
- Revenue projections (if applicable)

---

## 🔍 Viewing Booking Details

When you click "View Details" on a booking, you'll see:

### Customer Information
- Full Name
- Email Address
- Phone Number
- WhatsApp Number (if provided)

### Tour Details
- Tour Type (Full Day Jungle, Half Day Waterfall, Cultural Tour, Custom Tour)
- Tour Date
- Group Size (Adults + Children)
- Duration

### Services Requested
- ✅ Kosher Meals
- ✅ Hebrew-Speaking Guide
- ✅ Professional Photographer
- ✅ Video Documentation
- ✅ Drone Footage
- ✅ Airport Pickup/Dropoff

### Logistics
- Pickup Location
- Dropoff Location
- Pickup Time

### Additional Information
- Special Requests
- Dietary Restrictions
- Accessibility Needs
- Any other notes from the customer

### Booking Metadata
- Booking ID
- Status
- Created Date
- Last Updated

---

## ✏️ Updating Booking Status

### How to Change Status:
1. Go to the **Bookings** tab
2. Find the booking you want to update
3. Click the **pencil icon** (✏️) in the Actions column
4. Select the new status from the dropdown:
   - **Pending** - Just received, not yet confirmed
   - **Confirmed** - Tour is confirmed, customer notified
   - **Cancelled** - Booking cancelled
   - **Completed** - Tour has been completed
5. Click "Update Status"
6. The status will update immediately

### Status Meanings:

**🟡 Pending**
- New booking received
- Awaiting confirmation
- You need to review and respond

**🟢 Confirmed**
- Tour is confirmed
- Customer has been notified
- All arrangements are in place

**🔴 Cancelled**
- Booking has been cancelled
- Either by customer or by you
- No tour will take place

**🔵 Completed**
- Tour has been completed
- Customer has taken the tour
- Archive status

---

## 📧 Email Notifications

### Automatic Notifications
When a customer submits a booking, you automatically receive an email at:
- **wiro.adventures@gmail.com**

### Email Contains:
- Customer name and contact information
- Tour type and date
- Group size
- All services requested
- Pickup/dropoff details
- Special requests

### Setting Up Additional Recipients
To also receive emails at **pasuthunjunkong@gmail.com**:
1. Verify a custom domain at [resend.com/domains](https://resend.com/domains)
2. Add DNS records to your domain
3. Update the email configuration (contact developer)

---

## 🔎 Search and Filter

### Search Functionality
- Type in the search bar at the top of the Bookings tab
- Searches across:
  - Customer names
  - Email addresses
  - Phone numbers
- Results update in real-time as you type

### Filter by Status
- Use the status dropdown to filter bookings
- Options: All, Pending, Confirmed, Cancelled, Completed
- Combine with search for precise results

---

## 📱 Mobile Access

The admin panel is fully mobile-responsive:
- Access from any device (phone, tablet, laptop)
- Touch-optimized buttons and controls
- Responsive tables that scroll horizontally on mobile
- Calendar adapts to small screens

---

## 🔒 Security & Permissions

### Admin-Only Access
- Only users with "admin" role can access the panel
- Regular users will be redirected if they try to access /admin
- Login is required

### How to Make Someone an Admin
Currently, admin status must be set in the database:
1. Access the database via Management UI → Database panel
2. Find the user in the "users" table
3. Change their "role" field from "user" to "admin"
4. Save changes

---

## 💡 Tips & Best Practices

### Daily Workflow
1. **Morning:** Check for new pending bookings
2. **Review:** Read booking details and special requests
3. **Confirm:** Update status to "Confirmed" and contact customer
4. **Prepare:** Note any special requirements (kosher meals, Hebrew guide, etc.)
5. **After Tour:** Update status to "Completed"

### Organization Tips
- Use the calendar view for planning your week
- Keep pending bookings to a minimum by confirming quickly
- Use the search function to find specific customers
- Check analytics regularly to understand booking trends

### Customer Service
- Respond to bookings within 24 hours
- Update status as soon as decisions are made
- Note any special requests in your planning
- Follow up with customers after completed tours

---

## 🆘 Troubleshooting

### "Access Denied" or "Please Login"
- Make sure you're logged in
- Verify your account has admin role
- Try logging out and back in

### Can't See Admin Link in Navigation
- The Admin link only appears if you're logged in as an admin
- Check your user role in the database
- Make sure you're on the correct account

### Bookings Not Showing Up
- Check if you have filters applied
- Try clearing the search box
- Refresh the page
- Verify bookings exist in the database

### Calendar Not Loading
- Refresh the page
- Check your internet connection
- Try a different browser

### Email Notifications Not Received
- Check spam/junk folder
- Verify wiro.adventures@gmail.com is correct
- Test email service in settings
- Contact developer if issue persists

---

## 🎯 Quick Reference

### Common Tasks

**View Today's Bookings:**
1. Go to Calendar tab
2. Look at today's date
3. Click any bookings to view details

**Confirm a Pending Booking:**
1. Go to Bookings tab
2. Find the pending booking
3. Click pencil icon
4. Select "Confirmed"
5. Contact customer separately

**Search for a Customer:**
1. Go to Bookings tab
2. Type name/email/phone in search bar
3. View results

**Check This Month's Statistics:**
1. Go to Analytics tab
2. View total bookings
3. See breakdown by status and tour type

---

## 📞 Support

If you need help with the admin panel:
- Review this guide first
- Check the troubleshooting section
- Contact your developer for technical issues
- Email notifications go to wiro.adventures@gmail.com

---

**Last Updated:** January 19, 2026
**Version:** Current
**Status:** Active 🟢
