# Admin Dashboard Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the Wiro4x4 admin dashboard for solo-operator efficiency: inline editing, dashboard charts, notification badges, financial CRUD, agent availability management, bulk communication, interactive calendar, and a Settings tab.

**Architecture:** Surgical upgrade of the existing 11-tab admin dashboard (becomes 12 with Settings). New tRPC procedures aggregate data for dashboard stats and badge counts. Existing components gain inline editing and bulk actions. New `settings` table stores key-value config. All changes are additive — no breaking refactors.

**Tech Stack:** React 19, TypeScript, tRPC 11, Drizzle ORM (MySQL/TiDB), Recharts, Tailwind CSS 4, Vitest, Resend email API.

---

## Phase 1: Backend Foundation

### Task 1: Settings DB Schema

**Files:**

- Modify: `drizzle/schema.ts` (add settings table after line ~486)
- Modify: `server/db/index.ts` (add settings re-exports)

**Step 1: Add settings table to Drizzle schema**

In `drizzle/schema.ts`, add after the last table definition:

```typescript
export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
```

**Step 2: Create settings DB helpers**

Create: `server/db/settings.ts`

```typescript
import { eq } from "drizzle-orm";
import { db } from "../_core/db";
import { settings } from "../../drizzle/schema";

export async function getSetting(key: string) {
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  return row?.value ?? null;
}

export async function getAllSettings() {
  return db.select().from(settings);
}

export async function upsertSetting(key: string, value: unknown) {
  const existing = await getSetting(key);
  if (existing !== null) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function deleteSetting(key: string) {
  await db.delete(settings).where(eq(settings.key, key));
}
```

**Step 3: Add re-exports to server/db/index.ts**

Add to `server/db/index.ts`:

```typescript
// Settings
export {
  getSetting,
  getAllSettings,
  upsertSetting,
  deleteSetting,
} from "./settings";
```

**Step 4: Run database migration**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm db:push`
Expected: Migration generates and applies the `settings` table.

**Step 5: Commit**

```bash
git add drizzle/schema.ts server/db/settings.ts server/db/index.ts drizzle/
git commit -m "feat(db): add settings table with key-value storage"
```

---

### Task 2: Settings tRPC Router

**Files:**

- Create: `server/routes/settings.ts`
- Modify: `server/routers.ts` (add settings router)
- Create: `shared/schemas.ts` (add settingsInputSchema — append to existing file)

**Step 1: Add settings validation schema**

In `shared/schemas.ts`, add at the end:

```typescript
export const settingsUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});
```

**Step 2: Create settings router**

Create: `server/routes/settings.ts`

```typescript
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getSetting, getAllSettings, upsertSetting } from "../db";
import { settingsUpdateSchema } from "../../shared/schemas";
import { checkAdminRateLimit, logAdminAction } from "../_core/admin-helpers";

export const settingsRouter = router({
  getAll: protectedProcedure.query(async () => {
    const rows = await getAllSettings();
    const map: Record<string, unknown> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }),

  get: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return getSetting(input.key);
    }),

  update: protectedProcedure
    .input(settingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      await checkAdminRateLimit(ctx);
      await upsertSetting(input.key, input.value);
      await logAdminAction({
        userId: ctx.user.id,
        action: "update_setting",
        resourceType: "settings",
        resourceId: input.key,
        newValue: input.value,
      });
      return { success: true };
    }),
});
```

**Step 3: Register in routers.ts**

In `server/routers.ts`, add import and merge:

```typescript
import { settingsRouter } from "./routes/settings";
```

Add to the merged router object:

```typescript
settings: settingsRouter,
```

**Step 4: Verify types compile**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No type errors.

**Step 5: Commit**

```bash
git add server/routes/settings.ts server/routers.ts shared/schemas.ts
git commit -m "feat(api): add settings tRPC router with get/update"
```

---

### Task 3: Dashboard Stats & Badge Counts Procedures

**Files:**

- Create: `server/routes/dashboard.ts`
- Modify: `server/routers.ts` (add dashboard router)

**Step 1: Create dashboard router with stats and badge counts**

Create: `server/routes/dashboard.ts`

```typescript
import { sql, eq, and, gte, lte, count, sum } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../_core/db";
import {
  bookings,
  leads,
  financialRecords,
  reviews,
  blogPosts,
  customers,
} from "../../drizzle/schema";

export const dashboardRouter = router({
  stats: protectedProcedure.query(async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Bookings last 30 days - grouped by date
    const bookingsByDay = await db
      .select({
        date: sql<string>`DATE(${bookings.createdAt})`.as("date"),
        count: count().as("count"),
      })
      .from(bookings)
      .where(gte(bookings.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${bookings.createdAt})`)
      .orderBy(sql`DATE(${bookings.createdAt})`);

    // Revenue last 30 days - grouped by date
    const revenueByDay = await db
      .select({
        date: sql<string>`DATE(${financialRecords.createdAt})`.as("date"),
        total: sum(financialRecords.amount).as("total"),
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.type, "revenue"),
          gte(financialRecords.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${financialRecords.createdAt})`)
      .orderBy(sql`DATE(${financialRecords.createdAt})`);

    // Lead conversion rate
    const [leadStats] = await db
      .select({
        total: count().as("total"),
        converted:
          sql<number>`SUM(CASE WHEN ${leads.status} = 'converted' THEN 1 ELSE 0 END)`.as(
            "converted"
          ),
      })
      .from(leads);

    // Upcoming tours (next 7 days)
    const upcomingTours = await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.arrivalDate, sql`CURDATE()`),
          lte(bookings.arrivalDate, sevenDaysFromNow),
          sql`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      )
      .orderBy(bookings.arrivalDate)
      .limit(10);

    // Pending bookings
    const [pendingCount] = await db
      .select({ count: count().as("count") })
      .from(bookings)
      .where(eq(bookings.status, "pending"));

    // New leads (unconverted)
    const [newLeadsCount] = await db
      .select({ count: count().as("count") })
      .from(leads)
      .where(eq(leads.status, "new"));

    return {
      bookingsByDay: bookingsByDay.map(r => ({
        date: r.date,
        count: Number(r.count),
      })),
      revenueByDay: revenueByDay.map(r => ({
        date: r.date,
        total: Number(r.total) || 0,
      })),
      leadConversion: {
        total: Number(leadStats?.total) || 0,
        converted: Number(leadStats?.converted) || 0,
        rate:
          leadStats?.total && Number(leadStats.total) > 0
            ? Math.round(
                (Number(leadStats.converted) / Number(leadStats.total)) * 100
              )
            : 0,
      },
      upcomingTours,
      pendingBookings: Number(pendingCount?.count) || 0,
      newLeads: Number(newLeadsCount?.count) || 0,
    };
  }),

  badgeCounts: protectedProcedure.query(async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const [pendingBookings] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, "pending"));

    const [newLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.status, "new"));

    const [pendingReviews] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.isApproved, 0));

    const [draftPosts] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, 0));

    const [newCustomers] = await db
      .select({ count: count() })
      .from(customers)
      .where(gte(customers.createdAt, weekAgo));

    const [todayTours] = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.arrivalDate, sql`CURDATE()`),
          lte(bookings.arrivalDate, tomorrow),
          sql`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      );

    return {
      crm: Number(newCustomers?.count) || 0,
      bookings: Number(pendingBookings?.count) || 0,
      calendar: Number(todayTours?.count) || 0,
      leads: Number(newLeads?.count) || 0,
      reviews: Number(pendingReviews?.count) || 0,
      blog: Number(draftPosts?.count) || 0,
    };
  }),
});
```

**Step 2: Register in routers.ts**

Add import and merge `dashboard: dashboardRouter`.

**Step 3: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add server/routes/dashboard.ts server/routers.ts
git commit -m "feat(api): add dashboard stats and badge counts procedures"
```

---

### Task 4: Financial CRUD Procedures

**Files:**

- Modify: `server/routes/financial.ts` (add create, update, delete procedures)

**Step 1: Read existing financial router**

Read: `server/routes/financial.ts` to understand current structure.

**Step 2: Add CRUD mutations to financial router**

Add to the existing financial router:

```typescript
create: protectedProcedure
  .input(financialRecordInputSchema)
  .mutation(async ({ ctx, input }) => {
    await checkAdminRateLimit(ctx);
    const result = await createFinancialRecord(input);
    await logAdminAction({
      userId: ctx.user.id,
      action: "create",
      resourceType: "financial_record",
      resourceId: String(result.insertId),
    });
    return { success: true, id: result.insertId };
  }),

update: protectedProcedure
  .input(
    z.object({
      id: z.number(),
      data: financialRecordInputSchema.partial(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await checkAdminRateLimit(ctx);
    await updateFinancialRecord(input.id, input.data);
    await logAdminAction({
      userId: ctx.user.id,
      action: "update",
      resourceType: "financial_record",
      resourceId: String(input.id),
    });
    return { success: true };
  }),

delete: protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    await checkAdminRateLimit(ctx);
    await deleteFinancialRecord(input.id);
    await logAdminAction({
      userId: ctx.user.id,
      action: "delete",
      resourceType: "financial_record",
      resourceId: String(input.id),
    });
    return { success: true };
  }),
```

**Step 3: Type check**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add server/routes/financial.ts
git commit -m "feat(api): add financial record CRUD mutations"
```

---

### Task 5: Booking Date Update & Agent Availability Procedures

**Files:**

- Modify: `server/routes/booking.ts` (add updateDate procedure)
- Modify: `server/routes/agent.ts` (add availability procedures)

**Step 1: Add updateDate to booking router**

In `server/routes/booking.ts`, add:

```typescript
updateDate: protectedProcedure
  .input(
    z.object({
      id: z.number(),
      arrivalDate: z.string().or(z.date()).transform((v) => new Date(v)),
      departureDate: z.string().or(z.date()).transform((v) => new Date(v)),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await checkAdminRateLimit(ctx);
    await updateBooking(input.id, {
      arrivalDate: input.arrivalDate,
      departureDate: input.departureDate,
    });
    await logAdminAction({
      userId: ctx.user.id,
      action: "reschedule",
      resourceType: "booking",
      resourceId: String(input.id),
    });
    return { success: true };
  }),
```

**Step 2: Add availability procedures to agent router**

In `server/routes/agent.ts`, add:

```typescript
updateAvailability: protectedProcedure
  .input(
    z.object({
      id: z.number(),
      status: z.enum(["active", "inactive", "on_leave"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await checkAdminRateLimit(ctx);
    await updateAgent(input.id, { status: input.status });
    await logAdminAction({
      userId: ctx.user.id,
      action: "update_availability",
      resourceType: "agent",
      resourceId: String(input.id),
    });
    return { success: true };
  }),
```

**Step 3: Type check**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add server/routes/booking.ts server/routes/agent.ts
git commit -m "feat(api): add booking reschedule and agent availability procedures"
```

---

## Phase 2: Core UI Enhancements

### Task 6: Dashboard Charts Component

**Files:**

- Create: `client/src/components/admin/DashboardCharts.tsx`

**Step 1: Create the dashboard charts component**

Uses Recharts (already in dependencies). Shows 3 sparkline charts + Today's Priorities section.

```typescript
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { Calendar, TrendingUp, DollarSign, AlertCircle, ArrowRight } from "lucide-react";

interface DashboardChartsProps {
  stats: {
    bookingsByDay: { date: string; count: number }[];
    revenueByDay: { date: string; total: number }[];
    leadConversion: { total: number; converted: number; rate: number };
    upcomingTours: Array<{
      id: number;
      contactName: string;
      arrivalDate: Date | string;
      status: string;
      suggestedDestinations: string | null;
    }>;
    pendingBookings: number;
    newLeads: number;
  };
  onFilterBookings?: (status: string) => void;
}

export function DashboardCharts({ stats, onFilterBookings }: DashboardChartsProps) {
  const conversionData = [
    { name: "Converted", value: stats.leadConversion.converted },
    { name: "Other", value: stats.leadConversion.total - stats.leadConversion.converted },
  ];

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bookings Trend */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-700">Bookings (30 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={stats.bookingsByDay}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [value, "Bookings"]}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString()
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-gray-700">Revenue (30 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats.revenueByDay}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} THB`, "Revenue"]}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString()
                }
              />
              <Bar dataKey="total" fill="#16a34a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Conversion */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-700">Lead Conversion</h3>
          </div>
          <div className="flex items-center justify-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#7c3aed" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {stats.leadConversion.rate}%
              </div>
              <div className="text-xs text-gray-500">
                {stats.leadConversion.converted}/{stats.leadConversion.total} leads
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Priorities */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Today's Priorities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Upcoming Tours */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
              <Calendar className="h-3 w-3" />
              Upcoming Tours (7 days)
            </div>
            {stats.upcomingTours.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming tours</p>
            ) : (
              stats.upcomingTours.slice(0, 5).map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{tour.contactName}</span>
                    <span className="text-gray-500 ml-2 text-xs">
                      {new Date(tour.arrivalDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      tour.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tour.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pending Bookings */}
          <button
            onClick={() => onFilterBookings?.("pending")}
            className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-left"
          >
            <AlertCircle className="h-8 w-8 text-yellow-600 shrink-0" />
            <div>
              <div className="text-2xl font-bold text-yellow-800">
                {stats.pendingBookings}
              </div>
              <div className="text-xs text-yellow-600">Pending bookings</div>
            </div>
            <ArrowRight className="h-4 w-4 text-yellow-400 ml-auto" />
          </button>

          {/* New Leads */}
          <button
            onClick={() => onFilterBookings?.("leads")}
            className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-left"
          >
            <TrendingUp className="h-8 w-8 text-orange-600 shrink-0" />
            <div>
              <div className="text-2xl font-bold text-orange-800">
                {stats.newLeads}
              </div>
              <div className="text-xs text-orange-600">New leads</div>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-400 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/components/admin/DashboardCharts.tsx
git commit -m "feat(ui): add DashboardCharts component with sparklines and priorities"
```

---

### Task 7: Integrate Dashboard Charts + Badge Counts into AdminDashboard

**Files:**

- Modify: `client/src/pages/AdminDashboard.tsx`
- Modify: `client/src/components/admin/index.ts` (export DashboardCharts)

**Step 1: Add DashboardCharts export**

In `client/src/components/admin/index.ts`, add:

```typescript
export { DashboardCharts } from "./DashboardCharts";
```

**Step 2: Integrate into AdminDashboard.tsx**

Changes needed:

1. Import `DashboardCharts` and add `trpc.dashboard.stats.useQuery()` + `trpc.dashboard.badgeCounts.useQuery()`
2. Add `<DashboardCharts>` below the stats cards section
3. Update each tab's label to include a badge count from `badgeCounts` data
4. Make stats cards clickable — clicking sets active tab + status filter
5. Add a callback `handleFilterBookings` that switches to the Bookings tab with a status filter, or Leads tab

For badge rendering on tabs, add a helper:

```typescript
function TabBadge({ count, color }: { count: number; color: "red" | "orange" | "gray" }) {
  if (count === 0) return null;
  const colors = {
    red: "bg-red-500 text-white",
    orange: "bg-orange-500 text-white",
    gray: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors[color]}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
```

Wire badges to tabs:

- CRM tab: `<TabBadge count={badges?.crm} color="gray" />`
- Bookings tab: `<TabBadge count={badges?.bookings} color="red" />`
- Calendar tab: `<TabBadge count={badges?.calendar} color="gray" />`
- Leads tab: `<TabBadge count={badges?.leads} color="orange" />`
- Reviews tab: `<TabBadge count={badges?.reviews} color="orange" />`
- Blog tab: `<TabBadge count={badges?.blog} color="gray" />`

**Step 3: Type check + verify dev server**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add client/src/pages/AdminDashboard.tsx client/src/components/admin/index.ts
git commit -m "feat(ui): integrate dashboard charts and tab notification badges"
```

---

### Task 8: Inline Status Dropdown Component

**Files:**

- Create: `client/src/components/admin/InlineStatusDropdown.tsx`

**Step 1: Build reusable inline status dropdown**

```typescript
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, type BookingStatus } from "./types";

interface InlineStatusDropdownProps {
  value: BookingStatus;
  onChange: (status: BookingStatus) => void;
  disabled?: boolean;
}

const statuses: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export function InlineStatusDropdown({
  value,
  onChange,
  disabled,
}: InlineStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setOpen(!open);
        }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary/30 ${STATUS_COLORS[value]}`}
        disabled={disabled}
      >
        {STATUS_LABELS[value]}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-36 bg-white border rounded-lg shadow-lg py-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                onChange(s);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${
                s === value ? "font-bold" : ""
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[s].split(" ")[0]}`}
              />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Export from index**

Add to `client/src/components/admin/index.ts`:

```typescript
export { InlineStatusDropdown } from "./InlineStatusDropdown";
```

**Step 3: Commit**

```bash
git add client/src/components/admin/InlineStatusDropdown.tsx client/src/components/admin/index.ts
git commit -m "feat(ui): add InlineStatusDropdown component for 1-click status changes"
```

---

### Task 9: Refactor BookingsTab with Inline Editing + Bulk Actions

**Files:**

- Modify: `client/src/components/admin/BookingsTab.tsx`

**Step 1: Read current BookingsTab**

Read the full file to understand inline expansion logic.

**Step 2: Refactor BookingsTab**

Key changes:

1. **Replace status text with `<InlineStatusDropdown>`** on each row (no need to expand)
2. **Replace agent assignment text with inline dropdown** on each row
3. **Add bulk action bar** above table: when checkboxes selected, show "Bulk Actions" dropdown with:
   - Change Status → sub-menu with all statuses
   - Assign Agent → sub-menu with agent list
   - Send Email → opens BulkEmailDialog
4. **Add hover quick actions** — on row hover, show small icon buttons (WhatsApp, Email, Delete)
5. **Keep expansion** for full details (services, payment, special requests)

The inline dropdowns stop event propagation so clicking them doesn't toggle row expansion.

For bulk status change:

```typescript
const bulkUpdateMut = trpc.booking.update.useMutation({
  onSuccess: () => {
    utils.booking.listPaginated.invalidate();
    toast.success("Bookings updated");
    setSelectedIds([]);
  },
});

async function handleBulkStatusChange(status: BookingStatus) {
  await Promise.all(
    selectedIds.map(id => bulkUpdateMut.mutateAsync({ id, data: { status } }))
  );
}
```

For quick action WhatsApp link:

```typescript
function getWhatsAppUrl(booking: Booking) {
  const phone = booking.contactWhatsApp || booking.contactPhone;
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}`;
}
```

**Step 3: Type check**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add client/src/components/admin/BookingsTab.tsx
git commit -m "feat(ui): add inline editing, bulk actions, and quick actions to BookingsTab"
```

---

### Task 10: Bulk Email Dialog Component

**Files:**

- Create: `client/src/components/admin/BulkEmailDialog.tsx`
- Modify: `server/routes/booking.ts` (add bulkEmail procedure)

**Step 1: Add bulkEmail procedure on server**

In `server/routes/booking.ts`:

```typescript
bulkEmail: protectedProcedure
  .input(
    z.object({
      bookingIds: z.array(z.number()).min(1),
      subject: z.string().min(1).max(200),
      message: z.string().min(1).max(5000),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await checkAdminRateLimit(ctx);
    const results = [];
    for (const id of input.bookingIds) {
      const booking = await getBookingById(id);
      if (booking?.contactEmail) {
        try {
          await sendBulkEmailToCustomer({
            to: booking.contactEmail,
            subject: input.subject,
            message: input.message,
            customerName: booking.contactName,
          });
          results.push({ id, success: true });
        } catch {
          results.push({ id, success: false });
        }
      }
    }
    await logAdminAction({
      userId: ctx.user.id,
      action: "bulk_email",
      resourceType: "booking",
      resourceId: input.bookingIds.join(","),
    });
    return {
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }),
```

Create the email helper `sendBulkEmailToCustomer` in the existing email service file (likely `server/services/email.ts` or similar) using Resend, with `from: "WIRO 4x4 <wiro.adventures@gmail.com>"`.

**Step 2: Create BulkEmailDialog component**

```typescript
import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BulkEmailDialogProps {
  open: boolean;
  onClose: () => void;
  bookingIds: number[];
  recipientCount: number;
}

export function BulkEmailDialog({
  open,
  onClose,
  bookingIds,
  recipientCount,
}: BulkEmailDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const bulkEmail = trpc.booking.bulkEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Sent ${data.sent} emails${data.failed ? `, ${data.failed} failed` : ""}`);
      onClose();
      setSubject("");
      setMessage("");
    },
    onError: () => toast.error("Failed to send emails"),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            Send Email to {recipientCount} Customer{recipientCount !== 1 ? "s" : ""}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., Important Update About Your Tour"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Your message to customers..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              bulkEmail.mutate({ bookingIds, subject, message })
            }
            disabled={!subject || !message || bulkEmail.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {bulkEmail.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add client/src/components/admin/BulkEmailDialog.tsx server/routes/booking.ts
git commit -m "feat: add bulk email dialog and server procedure"
```

---

## Phase 3: Advanced Features

### Task 11: Financial Tab CRUD UI

**Files:**

- Modify: `client/src/components/admin/FinancialTab.tsx`

**Step 1: Read current FinancialTab**

Read the full file.

**Step 2: Add CRUD UI**

Changes:

1. **"Add Record" button** at top → opens a dialog with form fields: Date, Type (dropdown), Category (text input), Amount (number), Description (textarea), Linked Booking ID (optional number)
2. **Inline edit** — each row gets a small Edit icon button. Clicking opens the same dialog pre-filled with row data.
3. **Delete** — trash icon per row with confirmation via `window.confirm()`.

Use mutations:

```typescript
const createMut = trpc.financial.create.useMutation({
  onSuccess: () => utils.financial.listAllPaginated.invalidate(),
});
const updateMut = trpc.financial.update.useMutation({
  onSuccess: () => utils.financial.listAllPaginated.invalidate(),
});
const deleteMut = trpc.financial.delete.useMutation({
  onSuccess: () => utils.financial.listAllPaginated.invalidate(),
});
```

Dialog state:

```typescript
const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(
  null
);
const [showForm, setShowForm] = useState(false);
```

**Step 3: Commit**

```bash
git add client/src/components/admin/FinancialTab.tsx
git commit -m "feat(ui): add financial record CRUD to FinancialTab"
```

---

### Task 12: Agent Availability Management UI

**Files:**

- Modify: `client/src/components/admin/AgentsTab.tsx`

**Step 1: Read current AgentsTab**

Read the full file.

**Step 2: Add availability management**

Changes:

1. **Click-to-cycle availability** — on the weekly availability table, clicking a cell for an agent cycles their status: active → on_leave → inactive → active. Calls `agent.updateAvailability` mutation.
2. **Quick status toggle** — on each agent card, add a toggle switch (Active/Inactive) that calls `agent.updateAvailability`.
3. **Visual feedback** — show loading spinner on the cell/toggle while mutation is in-flight.

```typescript
const updateAvailability = trpc.agent.updateAvailability.useMutation({
  onSuccess: () => {
    utils.agent.list.invalidate();
    utils.agent.stats.invalidate();
    toast.success("Agent availability updated");
  },
});

function cycleStatus(current: string): "active" | "inactive" | "on_leave" {
  if (current === "active") return "on_leave";
  if (current === "on_leave") return "inactive";
  return "active";
}
```

**Step 3: Commit**

```bash
git add client/src/components/admin/AgentsTab.tsx
git commit -m "feat(ui): add click-to-cycle availability and status toggle for agents"
```

---

### Task 13: Interactive Calendar with Drag-Drop

**Files:**

- Modify: `client/src/components/admin/CalendarTab.tsx`
- Modify: the BookingCalendar component (find its location via grep)

**Step 1: Find and read BookingCalendar component**

Grep for `BookingCalendar` to locate the file.

**Step 2: Add drag-drop rescheduling**

Changes to CalendarTab and BookingCalendar:

1. Each booking card in the calendar becomes draggable (`draggable="true"`, `onDragStart` sets booking ID)
2. Each day cell becomes a drop target (`onDragOver`, `onDrop`)
3. On drop, calculate new arrival/departure dates (shift by the delta in days)
4. Call `booking.updateDate` mutation
5. Add click-to-view popover on booking cards (show contact name, phone, status, destinations)
6. Color-code booking cards by status (use STATUS_COLORS)

```typescript
function handleDragStart(
  e: React.DragEvent,
  bookingId: number,
  arrivalDate: string,
  departureDate: string
) {
  e.dataTransfer.setData("bookingId", String(bookingId));
  e.dataTransfer.setData("arrivalDate", arrivalDate);
  e.dataTransfer.setData("departureDate", departureDate);
}

function handleDrop(e: React.DragEvent, targetDate: string) {
  e.preventDefault();
  const bookingId = Number(e.dataTransfer.getData("bookingId"));
  const oldArrival = new Date(e.dataTransfer.getData("arrivalDate"));
  const oldDeparture = new Date(e.dataTransfer.getData("departureDate"));
  const newArrival = new Date(targetDate);
  const diffDays = Math.round(
    (newArrival.getTime() - oldArrival.getTime()) / (1000 * 60 * 60 * 24)
  );
  const newDeparture = new Date(
    oldDeparture.getTime() + diffDays * 24 * 60 * 60 * 1000
  );

  updateDateMut.mutate({
    id: bookingId,
    arrivalDate: newArrival.toISOString(),
    departureDate: newDeparture.toISOString(),
  });
}
```

**Step 3: Commit**

```bash
git add client/src/components/admin/CalendarTab.tsx components/BookingCalendar.tsx
git commit -m "feat(ui): add drag-drop rescheduling and status colors to calendar"
```

---

## Phase 4: Settings Tab

### Task 14: Settings Tab UI

**Files:**

- Create: `client/src/components/admin/SettingsTab.tsx`
- Modify: `client/src/components/admin/index.ts` (export)
- Modify: `client/src/pages/AdminDashboard.tsx` (add 12th tab)

**Step 1: Create SettingsTab component**

4 sections: Business Info, Email Templates, Pricing Rules, Site Configuration.

```typescript
import { useState, useEffect } from "react";
import { Save, Loader2, Settings, Mail, DollarSign, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SettingsTab() {
  const utils = trpc.useUtils();
  const { data: allSettings, isLoading } = trpc.settings.getAll.useQuery();
  const updateSetting = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.getAll.invalidate();
      toast.success("Setting saved");
    },
    onError: () => toast.error("Failed to save setting"),
  });

  const [businessInfo, setBusinessInfo] = useState({
    whatsappNumber: "",
    businessEmail: "",
    businessHours: "",
  });

  const [emailTemplates, setEmailTemplates] = useState({
    confirmationTemplate: "",
    reminderTemplate: "",
    statusChangeTemplate: "",
  });

  // Initialize from server data
  useEffect(() => {
    if (allSettings) {
      setBusinessInfo({
        whatsappNumber: (allSettings.whatsappNumber as string) || "66929894495",
        businessEmail: (allSettings.businessEmail as string) || "wiro.adventures@gmail.com",
        businessHours: (allSettings.businessHours as string) || "Mon-Fri 9:00-18:00 ICT",
      });
      setEmailTemplates({
        confirmationTemplate: (allSettings.confirmationTemplate as string) || "",
        reminderTemplate: (allSettings.reminderTemplate as string) || "",
        statusChangeTemplate: (allSettings.statusChangeTemplate as string) || "",
      });
    }
  }, [allSettings]);

  function saveSection(entries: Record<string, unknown>) {
    Promise.all(
      Object.entries(entries).map(([key, value]) =>
        updateSetting.mutateAsync({ key, value })
      )
    );
  }

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Business Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">WhatsApp Number</label>
            <input
              type="text"
              value={businessInfo.whatsappNumber}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, whatsappNumber: e.target.value })
              }
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Business Email</label>
            <input
              type="email"
              value={businessInfo.businessEmail}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, businessEmail: e.target.value })
              }
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Business Hours</label>
            <input
              type="text"
              value={businessInfo.businessHours}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, businessHours: e.target.value })
              }
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={() => saveSection(businessInfo)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          disabled={updateSetting.isPending}
        >
          {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Business Info
        </button>
      </section>

      {/* Email Templates */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Email Templates</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Use placeholders: {"{{customerName}}"}, {"{{tourDate}}"}, {"{{status}}"}, {"{{bookingId}}"}
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Booking Confirmation</label>
            <textarea
              value={emailTemplates.confirmationTemplate}
              onChange={(e) =>
                setEmailTemplates({ ...emailTemplates, confirmationTemplate: e.target.value })
              }
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Dear {{customerName}}, your booking #{{bookingId}} is confirmed for {{tourDate}}..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Booking Reminder</label>
            <textarea
              value={emailTemplates.reminderTemplate}
              onChange={(e) =>
                setEmailTemplates({ ...emailTemplates, reminderTemplate: e.target.value })
              }
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Hi {{customerName}}, your tour is coming up on {{tourDate}}..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status Change Notification</label>
            <textarea
              value={emailTemplates.statusChangeTemplate}
              onChange={(e) =>
                setEmailTemplates({ ...emailTemplates, statusChangeTemplate: e.target.value })
              }
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Hi {{customerName}}, your booking status has been updated to: {{status}}..."
            />
          </div>
        </div>
        <button
          onClick={() => saveSection(emailTemplates)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          disabled={updateSetting.isPending}
        >
          {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Email Templates
        </button>
      </section>

      {/* Site Configuration */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Site Configuration</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Toggle features on/off for the public website.</p>
        <div className="space-y-3">
          {[
            { key: "feature_blog", label: "Blog" },
            { key: "feature_reviews", label: "Customer Reviews" },
            { key: "feature_gallery", label: "Photo Gallery" },
            { key: "feature_chat", label: "Live Chat" },
            { key: "maintenance_mode", label: "Maintenance Mode" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{item.label}</span>
              <button
                onClick={() =>
                  updateSetting.mutate({
                    key: item.key,
                    value: !(allSettings?.[item.key] ?? true),
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  (allSettings?.[item.key] ?? true)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    (allSettings?.[item.key] ?? true)
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

**Step 2: Export and add tab**

In `client/src/components/admin/index.ts`, add:

```typescript
export { SettingsTab } from "./SettingsTab";
```

In `AdminDashboard.tsx`, add the 12th tab:

```typescript
{ id: "settings", label: "Settings", icon: Settings, component: SettingsTab }
```

**Step 3: Commit**

```bash
git add client/src/components/admin/SettingsTab.tsx client/src/components/admin/index.ts client/src/pages/AdminDashboard.tsx
git commit -m "feat(ui): add Settings tab with business info, email templates, and site config"
```

---

## Phase 5: Testing & Polish

### Task 15: Write Tests for New Backend Procedures

**Files:**

- Create or modify test files for: dashboard, settings, financial CRUD, booking updateDate

**Step 1: Write dashboard stats test**

Find existing test pattern (likely `server/__tests__/` or `server/routes/__tests__/`), then create:

```typescript
import { describe, it, expect } from "vitest";

describe("dashboard.stats", () => {
  it("returns bookingsByDay as array of {date, count}", async () => {
    // Call the procedure or DB function directly
    // Assert shape: { bookingsByDay: [], revenueByDay: [], leadConversion: {}, ... }
  });
});

describe("dashboard.badgeCounts", () => {
  it("returns counts for all badge-enabled tabs", async () => {
    // Assert shape: { crm: number, bookings: number, calendar: number, leads: number, reviews: number, blog: number }
  });
});
```

**Step 2: Write settings CRUD test**

```typescript
describe("settings", () => {
  it("creates and retrieves a setting", async () => {
    await upsertSetting("test_key", { foo: "bar" });
    const val = await getSetting("test_key");
    expect(val).toEqual({ foo: "bar" });
  });

  it("updates an existing setting", async () => {
    await upsertSetting("test_key", "new_value");
    const val = await getSetting("test_key");
    expect(val).toBe("new_value");
  });
});
```

**Step 3: Write financial CRUD test**

Test create, update, delete mutations return success.

**Step 4: Run all tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing 131 tests pass + new tests pass.

**Step 5: Commit**

```bash
git add server/__tests__/
git commit -m "test: add tests for dashboard, settings, and financial CRUD"
```

---

### Task 16: Mobile Responsive Adjustments

**Files:**

- Modify: Various admin components as needed

**Step 1: Review each new/modified component on mobile viewport**

Check with dev tools at 375px width:

- DashboardCharts: Charts should stack vertically, priorities should stack
- InlineStatusDropdown: Dropdown should not overflow screen edge
- BookingsTab bulk actions bar: Should wrap on mobile
- SettingsTab: Form fields should be full-width
- Calendar drag: Should still work (or degrade gracefully to click-only on touch)

**Step 2: Fix any overflow or layout issues**

Apply responsive classes (Tailwind `sm:`, `md:`, `lg:` breakpoints).

**Step 3: Type check + test**

Run: `npx tsc --noEmit && pnpm test`

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix(ui): responsive adjustments for admin dashboard enhancements"
```

---

## Implementation Summary

| Phase | Tasks       | Description                                                                  |
| ----- | ----------- | ---------------------------------------------------------------------------- |
| 1     | Tasks 1-5   | Backend: settings schema, tRPC routers, dashboard/financial/agent procedures |
| 2     | Tasks 6-10  | Core UI: charts, badges, inline editing, bulk actions, bulk email            |
| 3     | Tasks 11-13 | Advanced: financial CRUD UI, agent availability UI, drag-drop calendar       |
| 4     | Task 14     | Settings tab with 4 sections                                                 |
| 5     | Tasks 15-16 | Testing + mobile polish                                                      |

**Total: 16 tasks across 5 phases.**

**Dependency graph:**

```
[T1, T2, T3] → [T4, T5] → [T6, T8] → [T7, T9, T10] → [T11, T12, T13] → [T14] → [T15, T16]
```
