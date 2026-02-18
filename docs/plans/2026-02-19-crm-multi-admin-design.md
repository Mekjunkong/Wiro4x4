# CRM + Multi-Admin Design

**Date:** 2026-02-19
**Status:** Approved
**Project:** Wiro4x4

## Overview

Add a CRM system and multi-admin role support to the Wiro4x4 admin panel. The CRM provides a unified customer view with a Kanban pipeline board and follow-up tracking. Multi-admin enables owner/manager/agent roles with permission-based access.

## Goals

1. **Unified customer view** — see all of a customer's history (leads, bookings, reviews, chats) in one place
2. **Follow-up tracking** — log communications, set reminders, track what's been done
3. **Pipeline management** — visual Kanban board for lead-to-booking conversion
4. **Multi-admin roles** — owner, manager, agent with different permission levels

## Data Model

### `customers` table

| Column                | Type                                             | Purpose                                           |
| --------------------- | ------------------------------------------------ | ------------------------------------------------- |
| id                    | int (PK)                                         | Auto-increment                                    |
| name                  | varchar(255)                                     | Display name                                      |
| email                 | varchar(320)                                     | Primary email (unique, nullable)                  |
| phone                 | varchar(50)                                      | Primary phone                                     |
| whatsapp              | varchar(50)                                      | WhatsApp number                                   |
| language              | enum(en, he)                                     | Preferred language                                |
| stage                 | enum(prospect, active, completed, vip, inactive) | Lifecycle stage                                   |
| source                | varchar(100)                                     | How they found us                                 |
| tags                  | text (JSON)                                      | Custom tags like "VIP", "repeat", "kosher-strict" |
| totalSpent            | int                                              | Cached total revenue (THB)                        |
| totalBookings         | int                                              | Cached booking count                              |
| lastContactAt         | timestamp                                        | Last interaction date                             |
| notes                 | text                                             | General notes                                     |
| createdAt / updatedAt | timestamp                                        | Standard timestamps                               |

### `customerActivities` table

| Column      | Type                                                        | Purpose                            |
| ----------- | ----------------------------------------------------------- | ---------------------------------- |
| id          | int (PK)                                                    | Auto-increment                     |
| customerId  | int (FK)                                                    | Links to customer                  |
| type        | enum(note, call, whatsapp, email, follow_up, status_change) | Activity type                      |
| content     | text                                                        | Activity description               |
| dueDate     | timestamp                                                   | For follow-up reminders (nullable) |
| isCompleted | int                                                         | Boolean - was the follow-up done?  |
| createdBy   | varchar(255)                                                | Admin who logged it                |
| createdAt   | timestamp                                                   | When it happened                   |

### `users.role` enum extension

Current: `user`, `admin`
New: `user`, `admin`, `owner`, `manager`, `agent`

- **owner** — full access including admin management and financial records
- **manager** — broad access but no financial records or admin management
- **agent** — view assigned bookings, add notes, update status on assignments
- **admin** — backward compatibility, treated as owner

## Linking Strategy

Existing tables (`bookings`, `leads`, `reviews`, `subscribers`) are linked to customers by matching email or phone. No foreign key changes needed. The CRM tab queries across tables using the customer's email/phone to build the unified view.

Auto-customer creation: when a new lead or booking comes in, if no matching customer exists, one is auto-created.

## Role Hierarchy & Permissions

| Action                               | Owner | Manager | Agent     |
| ------------------------------------ | ----- | ------- | --------- |
| CRM - view all customers             | yes   | yes     | no        |
| CRM - view assigned customers        | yes   | yes     | yes       |
| CRM - add/edit customers             | yes   | yes     | no        |
| CRM - delete customers               | yes   | no      | no        |
| CRM - add activities/notes           | yes   | yes     | yes (own) |
| CRM - move pipeline                  | yes   | yes     | no        |
| Bookings - full CRUD                 | yes   | yes     | no        |
| Bookings - view/update assigned      | yes   | yes     | yes       |
| Leads, Tours, Gallery, Blog, Reviews | yes   | yes     | no        |
| Financial records                    | yes   | no      | no        |
| Admin user management                | yes   | no      | no        |

## UI Design

### CRM Tab — Two Views

**Pipeline View (default):** Horizontal Kanban board with 5 columns (New, Contacted, Quoted, Converted, Lost) matching lead statuses. Cards show name, score, last contact time, quick actions. Desktop: HTML5 drag-and-drop. Mobile: tap card for "Move to..." menu.

**Customer List View:** Searchable, filterable table with columns: Name, Contact, Stage, Score, Bookings, Last Active. Filters by stage, source, has follow-up.

### Customer Detail Panel

Expandable panel showing:

- Contact info with WhatsApp/email quick action buttons
- Stage badge, score, total spent, booking count
- Tabbed content: Timeline, Bookings, Notes
- Timeline merges data from leads, bookings, reviews, activities, scheduled emails
- Actions: Add Note, Schedule Follow-up

### Admin Management Tab (Owner only)

Table of admin users with: Name, Email, Role, Actions (Edit/Delete). Invite button to add new admins.

## Backend Architecture

### New tRPC Procedures

**CRM namespace:**

- `crm.listCustomers` (query, manager+) — paginated with filters
- `crm.getCustomer` (query, manager+) — single customer with linked data
- `crm.createCustomer` (mutation, manager+) — manual add
- `crm.updateCustomer` (mutation, manager+) — edit details/stage
- `crm.deleteCustomer` (mutation, owner) — delete
- `crm.getTimeline` (query, manager+) — merged activity timeline
- `crm.addActivity` (mutation, agent+) — log note/call/follow-up
- `crm.completeActivity` (mutation, agent+) — mark follow-up done
- `crm.getPipelineStats` (query, manager+) — card counts per stage
- `crm.movePipeline` (mutation, manager+) — move lead between stages

**Admin namespace:**

- `admin.listUsers` (query, owner) — list admin users
- `admin.updateUserRole` (mutation, owner) — change role
- `admin.removeUser` (mutation, owner) — remove admin access

## File Changes

| Area       | Files                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Schema     | `drizzle/schema.ts` — add `customers`, `customerActivities`; extend `users.role` enum              |
| DB helpers | `server/db.ts` — add ~15 CRM + admin functions                                                     |
| Schemas    | `shared/schemas.ts` — add CRM + admin Zod schemas                                                  |
| Router     | `server/routers.ts` — add CRM + admin procedures with role guards                                  |
| Frontend   | `client/src/pages/AdminDashboard.tsx` — add CRM tab + Users tab                                    |
| Components | New: `CRMPipelineBoard.tsx`, `CRMCustomerList.tsx`, `CRMCustomerDetail.tsx`, `CRMActivityForm.tsx` |
| Tests      | `server/crm.test.ts`, `server/admin-roles.test.ts`                                                 |

## Scale Considerations

Designed for <50 active customers. No need for complex search indexing, caching, or pagination optimization beyond existing patterns. HTML5 drag-and-drop sufficient (no library needed).

## Non-Goals

- External CRM integration (Salesforce, HubSpot)
- Automated email campaigns (newsletter already handles this)
- Customer self-service portal
- Complex reporting/analytics dashboards
