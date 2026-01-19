# WIRO 4x4 Website - Complete System Overview

## 🎯 Project Information
- **Project Name:** WIRO 4x4 – Kosher Off-Road Tours Chiang Mai
- **Type:** Full-stack web application with database, server, and user management
- **Tech Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL/TiDB
- **Features:** Database integration, server-side logic, user authentication

---

## 📄 Pages & Routes

### Public Pages
1. **Home Page** (`/`)
   - Hero section with call-to-action
   - Tours showcase
   - Kosher information
   - Travel checklist
   - AI Concierge section
   - Testimonials
   - Why Choose WIRO section
   - Community connection
   - Footer

2. **Pricing Page** (`/pricing`)
   - Tour pricing information
   - Group calculator
   - Package details

3. **Blog** (`/blog`)
   - Blog post listings
   - Individual blog post pages (`/blog/:id`)

4. **Booking Form** (`/book`)
   - Customer information collection
   - Tour selection
   - Date picker
   - Group size selection
   - Additional services (kosher meals, Hebrew guide, etc.)
   - Pickup/dropoff locations
   - Special requests

5. **Admin Dashboard** (`/admin`)
   - Booking management
   - Calendar view of bookings
   - Booking status updates
   - Customer information viewing

---

## 🗄️ Database System

### Tables
1. **Users Table**
   - User authentication
   - Role-based access (admin/user)
   - Profile information

2. **Bookings Table**
   - Customer details (name, email, phone, WhatsApp)
   - Tour information (tour type, date, group size)
   - Services requested (kosher meals, Hebrew guide, photographer, etc.)
   - Logistics (pickup/dropoff locations)
   - Special requests
   - Booking status (pending, confirmed, cancelled, completed)
   - Timestamps

### Database Features
- MySQL/TiDB connection
- Drizzle ORM for type-safe queries
- Schema migrations with `pnpm db:push`
- Full CRUD operations via tRPC

---

## 🔐 Authentication System

### Manus OAuth Integration
- Pre-configured OAuth authentication
- Session management with JWT
- Protected routes for admin dashboard
- User role management (admin/user)
- Automatic redirect to login for unauthorized access

### Auth Features
- Login/logout functionality
- Session persistence
- Role-based access control
- Admin-only procedures

---

## 📧 Email Notification System

### Resend Integration
- Automated booking notifications
- Sends to: wiro.adventures@gmail.com
- Beautiful HTML email templates
- Includes all booking details:
  - Customer information
  - Tour details and dates
  - Services requested
  - Pickup/dropoff locations
  - Special requests

### Email Features
- Professional branded templates
- Forest green and gold color scheme
- Responsive email design
- Automatic sending on new bookings

### Limitations
- Currently sends only to wiro.adventures@gmail.com
- To send to multiple recipients (pasuthunjunkong@gmail.com), domain verification required at resend.com/domains

---

## 🎨 Design System

### Color Palette
- **Primary:** Deep forest green (#1A4D2E)
- **Secondary:** Gold/amber accents
- **Background:** Clean white
- **Text:** Dark forest green

### Typography
- **Headings:** Playfair Display (serif, elegant)
- **Body:** Poppins (sans-serif, modern)
- **Hebrew Support:** Heebo font with RTL support

### Components
- Custom shadcn/ui components
- Responsive design (mobile-first)
- Smooth animations and transitions
- Premium shadows and effects

---

## 📱 Mobile Optimization

### Responsive Features
- Hamburger menu with slide-down navigation
- Touch-optimized form inputs
- Larger checkboxes and radio buttons on mobile (6x6px)
- Touch-manipulation CSS for better browser handling
- Responsive text sizing
- Full-width buttons on mobile
- Optimized spacing and padding

### Mobile-Specific Components
- Floating action buttons (Book Now + WhatsApp)
- Pulse animation to draw attention
- Touch-friendly navigation
- Smooth scroll behavior

---

## ⚡ Performance Optimizations

### Image Optimization
- **Total Images:** 26 images
- **Original Size:** 3.9 MB
- **Optimized WebP:** 2.74 MB (28.4% savings)
- **Optimized JPEG:** 3.24 MB (15.2% savings)
- **Formats:** WebP with JPEG fallback
- **Lazy Loading:** Implemented for non-critical images
- **Priority Loading:** Hero image preloaded

### Code Optimization
- Manual code splitting for vendor libraries
- Separate chunks for React, UI components, icons, utilities
- CSS and JavaScript minification (esbuild)
- Optimized file naming
- Source maps disabled in production

### Critical Resource Optimization
- Hero image preloaded (WebP + JPEG fallback)
- Font loading optimization (media print trick)
- DNS prefetch for Google Fonts
- Resource hints (preload, preconnect, dns-prefetch)

### Build Configuration
- Vite optimized for production
- CSS minification enabled
- Chunk size warnings (1MB limit)
- Tree shaking enabled

---

## 🛠️ Admin Features

### Booking Management
- View all bookings in table format
- Filter by status (pending, confirmed, cancelled, completed)
- Search functionality
- Booking details modal
- Status update capability

### Calendar View
- Monthly calendar display
- Bookings shown by date
- Color-coded status indicators:
  - Pending: Yellow
  - Confirmed: Green
  - Cancelled: Red
  - Completed: Blue
- Click to view booking details
- Month navigation

---

## 🌐 Internationalization

### Language Support
- **English:** Primary language
- **Hebrew:** Full RTL support
- Language switcher in header
- Bidirectional text support
- Hebrew fonts (Heebo)
- RTL-specific CSS utilities

---

## 🎯 User Experience Features

### Floating Action Buttons
- **Book Now Button:** Forest green with calendar icon
- **WhatsApp Button:** Green with message icon
- Fixed position (bottom-right)
- Pulse animation (3s cycle)
- Hover tooltips
- Scale animation on hover
- Always visible while scrolling

### Interactive Elements
- Smooth scroll behavior
- Hover effects on buttons and cards
- Loading states
- Error handling
- Success notifications (toast messages)

### Navigation
- Sticky header
- Mobile hamburger menu
- Smooth page transitions
- Breadcrumb navigation (where applicable)

---

## 🔧 Technical Infrastructure

### Backend (tRPC + Express)
- **tRPC Procedures:** Type-safe API endpoints
- **Public Procedures:** Accessible without authentication
- **Protected Procedures:** Require authentication
- **Admin Procedures:** Require admin role

### API Endpoints
- `booking.create` - Create new booking
- `booking.list` - List all bookings (admin)
- `booking.updateStatus` - Update booking status (admin)
- `auth.me` - Get current user
- `auth.logout` - Logout user
- `system.notifyOwner` - Send notification to owner

### Database Helpers
- Centralized query functions in `server/db.ts`
- Type-safe with Drizzle ORM
- Reusable across procedures

---

## 📦 Dependencies & Tools

### Key Libraries
- **React 19:** UI framework
- **Tailwind CSS 4:** Styling
- **tRPC 11:** Type-safe APIs
- **Drizzle ORM:** Database queries
- **Resend:** Email service
- **Wouter:** Lightweight routing
- **Lucide React:** Icon library
- **shadcn/ui:** Component library
- **Superjson:** Data serialization

### Development Tools
- **Vite:** Build tool and dev server
- **TypeScript:** Type safety
- **Vitest:** Testing framework
- **Prettier:** Code formatting
- **ESLint:** Code linting

---

## 🧪 Testing

### Test Coverage
- **Total Tests:** 14 tests
- **Test Files:** 4 files
- **All Passing:** ✓

### Test Areas
- Authentication (login, logout)
- Booking creation
- Booking validation
- Email notifications
- Database operations

---

## 📊 Analytics & Monitoring

### Built-in Analytics
- UV/PV tracking
- Visitor analytics
- Dashboard in Management UI

---

## 🚀 Deployment & Hosting

### Manus Hosting
- Built-in hosting included
- Custom domain support
- Auto-generated domain: wiro4x4.manus.space
- SSL/HTTPS enabled
- Automatic deployments from checkpoints

### Publishing
- Click "Publish" button in Management UI
- Requires checkpoint creation first
- Instant deployment
- Zero-downtime updates

---

## 📝 Documentation

### Available Docs
1. **PERFORMANCE_ANALYSIS.md** - Performance metrics and optimization results
2. **PERFORMANCE_OPTIMIZATION_GUIDE.md** - Detailed optimization instructions
3. **SYSTEM_OVERVIEW.md** - This document
4. **README.md** - Template documentation
5. **todo.md** - Feature tracking and task list

---

## 🔮 Future Enhancement Opportunities

### Suggested Features
1. **Customer Email Confirmations** - Send booking confirmations to customers
2. **Photo Gallery** - Showcase tour photos by category
3. **Booking Status Notifications** - Email customers on status changes
4. **Domain Verification** - Enable multi-recipient emails
5. **Payment Integration** - Stripe already configured, ready to implement
6. **Review System** - Customer reviews and ratings
7. **Multi-language Blog** - Translate blog posts
8. **Tour Availability Calendar** - Show available dates
9. **Real-time Chat** - Live customer support
10. **Social Media Integration** - Share tours on social platforms

---

## 📞 Support & Maintenance

### Email Service
- **Provider:** Resend
- **API Key:** Pre-configured
- **Sender:** wiro.adventures@gmail.com
- **Status:** Active, test mode

### Stripe Integration
- **Status:** Test sandbox created
- **Claim URL:** Available in system config
- **Expiry:** 2026-02-05
- **Keys:** Pre-configured (test mode)

### Database
- **Type:** MySQL/TiDB
- **Connection:** Pre-configured
- **Migrations:** Automated with Drizzle Kit
- **Backup:** Managed by Manus platform

---

## 🎓 Key Learnings & Best Practices

### Performance
- Always optimize images before deployment
- Use WebP with fallbacks
- Implement lazy loading for below-fold content
- Preload critical resources

### Mobile-First
- Design for mobile first, then scale up
- Touch targets minimum 44x44px
- Test on actual devices
- Use touch-manipulation CSS

### User Experience
- Clear call-to-actions
- Floating buttons for quick access
- Smooth animations (not too fast or slow)
- Loading states for all async operations

### Code Quality
- Type-safe APIs with tRPC
- Centralized database queries
- Reusable components
- Comprehensive testing

---

## 📈 Current Status

### Completed Features ✓
- ✅ Full website with all pages
- ✅ Booking system with database
- ✅ Admin dashboard with calendar
- ✅ Email notifications
- ✅ Mobile optimization
- ✅ Performance optimization
- ✅ Floating action buttons
- ✅ Pulse animations
- ✅ Hebrew/English support
- ✅ Authentication system

### Pending Tasks
- ⏳ Domain verification for multi-recipient emails
- ⏳ Customer email confirmations
- ⏳ Photo gallery page
- ⏳ Stripe payment implementation
- ⏳ Additional admin features

---

**Last Updated:** January 19, 2026
**Version:** e80dbc39
**Status:** Production Ready 🚀
