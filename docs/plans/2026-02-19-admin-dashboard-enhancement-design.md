# Admin Dashboard Enhancement Design

**Date:** 2026-02-19
**Approach:** Surgical UX Upgrade (enhance existing 11-tab structure)
**Goal:** Make the admin panel efficient for a solo operator managing all aspects of the Wiro4x4 business.

---

## 1. Dashboard Stats & Charts

### Current

4 static stats cards: Total Bookings, Pending, Confirmed, Revenue.

### Enhanced

- **Clickable stats cards** — clicking "Pending" filters the Bookings tab to pending status.
- **Mini chart row** (3 Recharts sparklines below stats):
  - Bookings last 30 days (line chart)
  - Revenue last 30 days (bar chart)
  - Lead conversion rate (donut chart)
- **"Today's Priorities" section** below charts:
  - Upcoming tours (next 7 days) with quick action buttons
  - Pending bookings needing attention (count + links)
  - New unread leads count

### Backend

- New tRPC procedure: `admin.dashboardStats` — aggregates bookings, revenue, leads in a single query.

---

## 2. Tab Notification Badges

### Current

Tabs show icon + label only.

### Enhanced

Each tab gets a colored badge showing actionable item count:

| Tab      | Badge Shows             | Color  |
| -------- | ----------------------- | ------ |
| CRM      | New customers this week | Gray   |
| Bookings | Pending bookings        | Red    |
| Calendar | Tours today/tomorrow    | Gray   |
| Leads    | New unconverted leads   | Orange |
| Reviews  | Pending reviews         | Orange |
| Blog     | Draft posts             | Gray   |

### Badge Colors

- **Red** = needs immediate attention
- **Orange** = should review soon
- **Gray** = informational

### Backend

- New tRPC procedure: `admin.tabBadgeCounts` — returns all counts in one query.

---

## 3. Inline Editing & Quick Actions (Bookings Tab)

### Current

Click row to expand -> find dropdown -> change status. 4+ clicks per action.

### Enhanced

**3a. Inline status dropdown**
Status shows as a colored pill on the row. Click pill -> dropdown appears inline -> select new status. **1 click.**

**3b. Inline agent assignment**
Agent column shows current agent or "Unassigned". Click -> dropdown -> select. **1 click.**

**3c. Bulk actions**
Select multiple bookings via checkboxes -> "Bulk Actions" dropdown at top:

- Change Status (to any status)
- Assign Agent
- Send Email

**3d. Bulk email**
Select bookings -> "Send Email" -> compose message or pick template -> sends to all selected customers via wiro.adventures@gmail.com (Resend API).

**3e. Quick action row on hover**
Hover a booking row to see icon buttons: WhatsApp, Email, Change Status, Delete. No expansion needed.

**3f. Expansion remains**
For full details (services, special requests, payment) — but rarely needed for daily ops.

---

## 4. Interactive Calendar (Calendar Tab)

### Current

View-only calendar showing bookings by date.

### Enhanced

- **Drag-and-drop rescheduling** — drag a booking from one date to another.
- **Click-to-view** — click a booking to see details in a popover.
- **Color-coded status** — green=confirmed, yellow=pending, red=cancelled, blue=completed.
- **Click empty day** — opens quick booking form for that date.

### Implementation

HTML5 native drag events on booking cards within the calendar grid. On drop, call `booking.updateDate` mutation.

### Backend

- New tRPC procedure: `booking.updateDate` — changes booking tour date.

---

## 5. Financial Record Management (Financial Tab)

### Current

Read-only table with CSV export.

### Enhanced

- **"Add Record" button** -> opens dialog with fields:
  - Date, Type (revenue/cost/refund), Category (dropdown), Amount (THB), Description, Linked Booking (optional)
- **Inline edit** — click a cell to edit in place (amount, description, category).
- **Delete** — icon button per row with confirmation dialog.
- **Monthly summary** — collapsible section with month-by-month breakdown chart.

### Backend

New tRPC procedures:

- `financial.create` — add financial record
- `financial.update` — edit existing record
- `financial.delete` — remove record

---

## 6. Agent Availability Management (Agents Tab)

### Current

View-only agent cards with stats + weekly availability table.

### Enhanced

- **Click-to-cycle availability** — click a day cell to cycle: Active -> On Leave -> Inactive.
- **Quick status toggle** — toggle button on each agent card (Active/Inactive).
- **Auto-assign suggestion** — when assigning agent to booking, suggest the available agent with fewest active bookings.

### Backend

New tRPC procedures:

- `agent.updateAvailability` — set availability for a specific day
- `agent.toggleStatus` — toggle agent active/inactive

---

## 7. Settings Tab (New - 12th Tab)

### Sections

1. **Business Info** — WhatsApp number, business email (wiro.adventures@gmail.com), business hours
2. **Email Templates** — edit confirmation, reminder, and status-change email templates (markdown with variable placeholders)
3. **Pricing Rules** — base prices per tour, group discount thresholds, seasonal pricing multipliers
4. **Site Configuration** — toggle features (blog, reviews, gallery), maintenance mode toggle

### Backend

- New `settings` DB table (key-value: `key VARCHAR, value JSON, updatedAt TIMESTAMP`)
- New tRPC procedures: `settings.get`, `settings.update`, `settings.getAll`

---

## Summary of Changes

### New Database Tables

1. `settings` (key, value, updatedAt)

### New tRPC Procedures

1. `admin.dashboardStats` — aggregated dashboard data
2. `admin.tabBadgeCounts` — badge counts for all tabs
3. `booking.updateDate` — change booking date (for calendar drag)
4. `financial.create` — add financial record
5. `financial.update` — edit financial record
6. `financial.delete` — delete financial record
7. `agent.updateAvailability` — set day availability
8. `agent.toggleStatus` — toggle active/inactive
9. `settings.get` — get single setting
10. `settings.update` — update setting
11. `settings.getAll` — get all settings

### Modified Components

1. `AdminDashboard.tsx` — stats charts, clickable cards, priority section, badge counts
2. `BookingsTab.tsx` — inline editing, bulk actions, hover quick actions, bulk email
3. `CalendarTab.tsx` — drag-drop rescheduling, click-to-view popover, click-empty-day
4. `FinancialTab.tsx` — add/edit/delete records, monthly summary
5. `AgentsTab.tsx` — click-to-cycle availability, status toggle, auto-assign suggestion

### New Components

1. `SettingsTab.tsx` — new settings management tab
2. `BulkEmailDialog.tsx` — compose + send bulk emails
3. `InlineStatusDropdown.tsx` — reusable inline status pill/dropdown
4. `DashboardCharts.tsx` — sparkline charts for dashboard overview
5. `TodaysPriorities.tsx` — priority action items section

### New Server Files

1. `server/routes/settings.ts` — settings CRUD
2. `server/db/settings.ts` — settings DB helpers
3. `server/schema/settings.ts` — settings Drizzle schema

---

## Implementation Order (Dependency Graph)

```
Phase 1 (Backend Foundation):
[Settings schema + DB] -> [Settings tRPC routes]
[Dashboard stats procedure] + [Tab badge counts procedure]

Phase 2 (Core UI Enhancements):
[Dashboard charts + priorities] + [Tab badges]
[Inline status/agent dropdowns for Bookings]

Phase 3 (Advanced Features):
[Bulk actions + bulk email] + [Financial CRUD]
[Agent availability management]
[Calendar drag-drop]

Phase 4 (Settings):
[Settings tab UI]

Phase 5 (Polish):
[Testing] + [Mobile responsive adjustments]
```

Phases 1-2 are highest impact. Phases 3-4 add power-user features. Phase 5 ensures quality.
