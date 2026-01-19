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
- [ ] Create calendar component for admin dashboard
- [ ] Display bookings by date with color-coded status
- [ ] Show booking details on click/hover
- [ ] Add month/week navigation
- [ ] Integrate with existing admin dashboard tabs
