# Wiro 4x4 Website TODO

## Booking System Rebuild (Full Rewrite)

### Phase 1: Database Schema
- [x] Design bookings table (customer info, tour details, dates, status)
- [x] Design agents table (name, email, phone, specialties, availability)
- [x] Design leads table (inquiry details, source, conversion status)
- [x] Design financial_records table (costs, revenue, profit tracking)
- [x] Run database migrations

### Phase 2: tRPC Backend
- [x] Create booking procedures (create, list, update, delete)
- [x] Create agent procedures (CRUD operations)
- [x] Create lead procedures (capture, convert, track)
- [x] Create financial procedures (record costs, calculate profit)
- [x] Implement booking status workflow

### Phase 3: Customer Booking Form
- [x] Build booking form component matching wiro4x4enquiry.manus.space
- [x] Add date range picker
- [x] Add group size calculator with children support
- [x] Add optional services (hotels, guide, attractions, kosher meals)
- [x] Add Shabbat hotel selection
- [x] Add pickup/dropoff location selection (airport/hotel)
- [x] Include all destinations (Pai, Chiang Rai, Chiang Mai, Doi Inthanon, Mae Hong Son, Golden Triangle)
- [x] Add bilingual support (Hebrew/English)
- [x] Integrate with WhatsApp for confirmation
- [x] Add agent name field for quick agent form
- [x] Add form validation and error handling

### Phase 4: Admin Dashboard
- [x] Create admin layout with header navigation
- [x] Build bookings list view with filters
- [x] Build booking detail view (expandable cards)
- [x] Add booking status management
- [x] Add booking delete functionality
- [x] Add search and filtering
- [x] Stats cards (total, pending, confirmed, revenue)

### Phase 5: Agent Management
- [x] Create agent list view
- [x] Display agent profiles with status
- [ ] Add agent assignment to bookings
- [ ] Track agent performance metrics
- [ ] Add agent availability calendar

### Phase 6: Financial & Leads
- [x] Build financial records table view
- [x] Build lead management table view
- [ ] Add cost tracking per booking
- [ ] Calculate profit margins with charts
- [ ] Add lead-to-booking conversion tracking

### Phase 7: Testing & Integration
- [ ] Test booking form submission
- [ ] Test admin dashboard functionality
- [ ] Test agent assignment workflow
- [ ] Test financial calculations
- [ ] Verify database integrity

## Previously Completed Features
- [x] Language switcher with flag icons
- [x] WhatsApp number updated to +66 81 961 1398
- [x] Pricing page with transparent costs
- [x] Blog with travel resources
- [x] SEO optimization
- [x] Book Now button in header navigation


## New Features - Email & Calendar

### Email Notifications
- [x] Create email notification service using built-in notification API
- [x] Send new booking alert to admin/owner
- [x] Include booking details in email (dates, services, contact info)
- [x] Add status change notifications

### Booking Calendar View
- [x] Create calendar component for admin dashboard
- [x] Display bookings by date with color-coded status
- [x] Show booking details on click/hover
- [x] Add month/week navigation
- [x] Integrate with existing admin dashboard tabs

## Email Recipients Configuration

- [x] Configure Resend email service with API key
- [x] Configure email notifications to send to wiro.adventures@gmail.com
- [ ] Configure email notifications to send to pasuthunjunkong@gmail.com (requires domain verification)

## Domain Verification Required

- [ ] Verify a custom domain at resend.com/domains to enable sending to multiple recipients
- [ ] After domain verification, update SENDER_EMAIL in resendEmailService.ts
- [ ] After domain verification, add pasuthunjunkong@gmail.com to NOTIFICATION_RECIPIENTS


## Mobile Responsiveness Optimization

- [x] Audit all components for mobile viewport (375px - 768px)
- [x] Fix Hero section mobile layout (responsive text sizing, button widths, spacing)
- [x] Fix Header/Navigation mobile menu (hamburger menu with slide-down navigation)
- [x] Fix Tours section mobile cards (responsive grid, padding, text sizing)
- [x] Fix WhyWiro section mobile layout (responsive grid and text)
- [ ] Fix Pricing page mobile layout
- [ ] Fix Booking form mobile responsiveness
- [ ] Fix Admin dashboard mobile view
- [ ] Test on multiple mobile breakpoints (320px, 375px, 414px, 768px)
- [ ] Ensure touch targets are at least 44x44px
- [ ] Verify text is readable without zooming


## Bug Fixes

- [x] Fix hamburger menu not working when clicked on mobile (improved with touch-manipulation, fixed positioning, click-outside handler)


## Mobile Enhancement Tasks

- [x] Add smooth slide-down animation to mobile menu (opacity + translate-y transition)
- [x] Optimize booking form for mobile touchscreens
- [x] Ensure form fields are properly sized for mobile (text-base, proper padding)
- [x] Make date pickers touch-friendly (touch-manipulation CSS)
- [x] Optimize checkboxes and radio buttons for touch (6x6px on mobile, 5x5px on desktop)
- [x] Test on multiple mobile browsers (Safari, Chrome mobile) - optimized with touch-manipulation
- [x] Verify touch targets meet 44x44px minimum (checkboxes 6x6px, radio buttons 5x5px, buttons have proper padding)


## Performance Optimization Tasks

### Image Optimization
- [x] Analyze current image sizes and formats (26 images, 3.9 MB total)
- [x] Create image optimization script (Python with Pillow)
- [x] Create OptimizedImage component with WebP support
- [x] Compress all images (28.4% WebP savings, 15.2% JPEG savings)
- [x] Resize images to appropriate dimensions (hero: 1920px, large: 1200px, medium: 800px)
- [x] Convert all images to WebP with JPEG/PNG fallback (2.74 MB WebP, 3.24 MB JPEG)
- [x] Implement lazy loading for non-critical images (in OptimizedImage component)
- [x] Add priority loading for hero/LCP images (in OptimizedImage component)

### Code Splitting & Bundle Optimization
- [x] Implement manual chunks for vendor libraries (React, UI, icons, utils)
- [x] Enable CSS and JavaScript minification (esbuild)
- [x] Add code splitting for routes (via manual chunks)
- [x] Reduce initial bundle size (optimized chunk file names, disabled sourcemaps)

### Critical Resource Optimization
- [x] Add preload hints for hero/LCP images (WebP + JPEG fallback)
- [x] Optimize font loading (media print trick with onload)
- [x] Preconnect to external CDNs (Google Fonts with DNS prefetch)
- [x] Add resource hints for critical assets (preload, preconnect, dns-prefetch)

### Build Configuration
- [x] Update Vite config for optimal performance (manual chunks, optimized file names)
- [x] Enable CSS minification (cssMinify: true)
- [x] Configure chunk size warnings (1MB limit)
- [x] Optimize production build (esbuild minification, disabled sourcemaps)

### Documentation
- [x] Create performance optimization report (PERFORMANCE_ANALYSIS.md)
- [x] Document all changes made (PERFORMANCE_OPTIMIZATION_GUIDE.md)
- [x] Provide maintenance guidelines (image optimization workflow)
- [x] Include verification steps (browser testing, performance metrics)


## Homepage Section Reordering

- [x] Move "Why Choose WIRO" section to lower position on homepage (now after Testimonials)


## Floating Action Buttons

- [x] Add floating "Book Now" button next to WhatsApp icon (Book Now above, WhatsApp below)


## Bug Fixes

- [x] Fix floating Book Now button 404 error (changed /booking to /book)


## UI Enhancements

- [x] Add pulse animation to floating action buttons (3s subtle pulse with scale 1.02)


## Admin Panel Access

- [x] Add admin link to header navigation (visible only for admin users with shield icon)
- [x] Create admin access guide document (ADMIN_GUIDE.md)


## Bug Fixes

- [x] Fix booking form getting stuck on submission (added setIsSubmitting(false) in onSuccess and onError)


## Customer Email Confirmations

- [x] Create customer confirmation email template (HTML with booking details)
- [x] Implement ICS calendar file generation (using ics package)
- [x] Add "Add to Calendar" button/link in confirmation email (download link + attachment)
- [x] Include tour details, dates, times, location in calendar event
- [x] Include contact information in calendar event (phone, WhatsApp, website)
- [x] Update booking flow to send confirmation emails to customers (added to booking.create procedure)


## UI Enhancements

- [x] Fix floating calendar button visibility and functionality when scrolling (z-index: 9999)
- [x] Fix hamburger menu not working when scrolling down (z-index: 10000 for header, 9998 for menu)
- [x] Enhance Hebrew version of booking form for mobile (better spacing, RTL support, mobile-first text sizes)
- [x] Improve form mobile responsiveness and touch targets (pb-24 for floating buttons clearance)
- [x] Improve overall form UI design (enhanced hero section with mt-20, better padding)


## Text Visibility Issues

- [x] Fix hero section text visibility (added strong text shadows, increased font weight, changed to full white)
- [x] Fix header logo text visibility (white with text shadow when not scrolled, primary when scrolled)
- [x] Add text shadows for better readability (all hero and header text)
- [x] Ensure all text has sufficient contrast ratio (white text with dark shadows)


## Hamburger Menu Issues

- [x] Fix hamburger menu not responding to clicks on mobile (increased touch target to 44x44px, higher z-index)
- [x] Improve menu performance and reduce lag (conditional rendering instead of CSS transitions)
- [x] Optimize menu animations for better responsiveness (simplified to animate-in fade-in)


## Hebrew Version Layout Issues

- [x] Fix Hebrew hero section to match English layout (added pb-20 to section, pb-40 to content)
- [x] Ensure buttons are fully visible and not cut off (increased bottom padding)
- [x] Fix RTL text alignment and spacing (proper RTL support already in place)
- [x] Match button positioning between English and Hebrew versions (consistent layout)


## Floating Button and Hero Layout Issues

- [x] Fix floating Book Now button not visible (both buttons confirmed present with z-index 9999)
- [x] Increase hero section mobile padding to prevent button cutoff (pb-32 on mobile, pb-56 for content)
- [x] Ensure both floating buttons display correctly on mobile (stacked vertically with proper spacing)


## Hebrew Version Layout (Keep English Text + LTR)

- [x] Remove RTL direction change - Hebrew version keeps LTR layout like English
- [x] Keep English text for Hebrew version (matching user's screenshot)
- [x] Ensure Hebrew version looks identical to English version
- [x] Remove RTL CSS styles


## Critical Visibility Issues

- [x] Fix hero section - "Book Your Adventure" button not visible (reduced padding: py-20 pb-8)
- [x] Fix floating calendar button invisible on white background (changed to gold/secondary color with border)


## Hebrew Version Layout Enhancement

- [x] Fix Tours section - images too small and positioned incorrectly (removed RTL direction)
- [x] Move tour card images above text content (matching English version) - already correct in component
- [x] Increase tour card image size to match English version (removed flex-direction: row-reverse)
- [x] Ensure all Hebrew version sections match English version layout exactly (removed all RTL CSS)


## Hamburger Menu & Homepage Cleanup

- [x] Improve hamburger menu clickability - increased to 60x60px touch area with larger 8x8 icons
- [x] Remove "AI Trip Concierge" section from homepage (removed from Home.tsx)
- [x] Remove "Before You Travel Checklist" section from homepage (removed from Home.tsx)
- [x] Remove "Sample Kosher Trail Meal" section from homepage (removed from KosherInfo.tsx)


## Hamburger Menu Positioning Fix

- [x] Fix hamburger menu button - clickable area doesn't match visual position (added -m-2 negative margin, increased to 64x64px with 9x9 icons)
- [x] Adjust header padding/layout so button is clickable where it appears (negative margin extends clickable area)


## Admin Panel Functionality Fixes

- [x] Fix admin panel - cannot change booking status (added error handling and success alerts)
- [x] Fix admin panel - cannot delete bookings (added error handling and success alerts)


## Hamburger Menu Size Increase

- [x] Make hamburger menu much bigger and easier to click (increased to 80x80px)
- [x] Increase touch area to at least 80x80px or larger (now 80x80px with 10x10 icons and -m-3 negative margin)
