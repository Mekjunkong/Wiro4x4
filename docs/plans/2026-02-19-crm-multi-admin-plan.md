# CRM + Multi-Admin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a CRM system (unified customer view, Kanban pipeline, follow-up tracking) and multi-admin roles (owner/manager/agent) to the Wiro4x4 admin panel.

**Architecture:** Two new DB tables (`customers`, `customerActivities`) + extended `users.role` enum. New route files (`server/routes/crm.ts`, `server/routes/admin.ts`) following existing tRPC patterns. New admin tab components following existing admin tab pattern. Role-based middleware in `_helpers.ts`.

**Tech Stack:** React 19, TypeScript, tRPC 11, Drizzle ORM (MySQL), Zod, Vitest, Tailwind CSS, HTML5 Drag-and-Drop API.

---

## Task 1: Database Schema — Add `customers` and `customerActivities` tables

**Files:**

- Modify: `drizzle/schema.ts` (add after `scheduledEmails` table, ~line 370)

**Step 1: Add the `customers` table to schema**

Add after the `scheduledEmails` table definition in `drizzle/schema.ts`:

```typescript
// CRM Customers Table
export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    whatsapp: varchar("whatsapp", { length: 50 }),
    language: mysqlEnum("language", ["en", "he"]).default("en"),
    stage: mysqlEnum("stage", [
      "prospect",
      "active",
      "completed",
      "vip",
      "inactive",
    ])
      .default("prospect")
      .notNull(),
    source: varchar("source", { length: 100 }).default("website"),
    tags: text("tags"), // JSON array: ["VIP", "repeat", "kosher-strict"]
    totalSpent: int("totalSpent").default(0),
    totalBookings: int("totalBookings").default(0),
    lastContactAt: timestamp("lastContactAt"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_customers_email").on(table.email),
    index("idx_customers_phone").on(table.phone),
    index("idx_customers_stage").on(table.stage),
  ]
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// CRM Customer Activities Table
export const customerActivities = mysqlTable(
  "customerActivities",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    type: mysqlEnum("type", [
      "note",
      "call",
      "whatsapp",
      "email",
      "follow_up",
      "status_change",
    ]).notNull(),
    content: text("content").notNull(),
    dueDate: timestamp("dueDate"),
    isCompleted: int("isCompleted").default(0).notNull(),
    createdBy: varchar("createdBy", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("idx_customerActivities_customerId").on(table.customerId),
    index("idx_customerActivities_dueDate").on(table.dueDate),
  ]
);

export type CustomerActivity = typeof customerActivities.$inferSelect;
export type InsertCustomerActivity = typeof customerActivities.$inferInsert;
```

**Step 2: Extend the `users.role` enum**

In `drizzle/schema.ts`, find the `users` table definition (~line 16-31). Change:

```typescript
// FROM:
role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),

// TO:
role: mysqlEnum("role", ["user", "admin", "owner", "manager", "agent"]).default("user").notNull(),
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: PASS (no new type errors — only added types)

**Step 4: Commit**

```bash
git add drizzle/schema.ts
git commit -m "feat(schema): add customers, customerActivities tables and extend user roles"
```

---

## Task 2: Role-Based Middleware — Add `ownerProcedure`, `managerProcedure`, `agentProcedure`

**Files:**

- Modify: `server/_core/trpc.ts` (~line 28-45)
- Modify: `server/routes/_helpers.ts` (re-export new procedures)

**Step 1: Add role-checking middleware to `server/_core/trpc.ts`**

After the existing `adminProcedure` (~line 30-45), add:

```typescript
/** Roles that have at least "owner" access (owner + admin for backward compat). */
const OWNER_ROLES = ["admin", "owner"];
/** Roles that have at least "manager" access. */
const MANAGER_ROLES = ["admin", "owner", "manager"];
/** Roles that have at least "agent" access. */
const AGENT_ROLES = ["admin", "owner", "manager", "agent"];

export const ownerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !OWNER_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Owner access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

export const managerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !MANAGER_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Manager access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

export const agentProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !AGENT_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Agent access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);
```

**Step 2: Export from `_helpers.ts`**

In `server/routes/_helpers.ts`, update the import from `../_core/trpc`:

```typescript
import {
  publicProcedure,
  protectedProcedure,
  ownerProcedure,
  managerProcedure,
  agentProcedure,
  router,
} from "../_core/trpc";
```

Add security-header-wrapped versions:

```typescript
export const secureOwnerProcedure = ownerProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
export const secureManagerProcedure = managerProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
export const secureAgentProcedure = agentProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
```

And add them to the exports at the bottom of the file.

**Step 3: Update test helpers with role-based contexts**

In `server/test-helpers.ts`, add:

```typescript
/** Create a mock owner context for tRPC callers. */
export function createOwnerContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-owner",
    email: "owner@example.com",
    name: "Test Owner",
    loginMethod: "manus",
    role: "admin", // admin = owner equivalent
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

/** Create a mock manager context for tRPC callers. */
export function createManagerContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-manager",
    email: "manager@example.com",
    name: "Test Manager",
    loginMethod: "manus",
    role: "manager",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

/** Create a mock agent context for tRPC callers. */
export function createAgentContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "test-agent",
    email: "agent@example.com",
    name: "Test Agent",
    loginMethod: "manus",
    role: "agent",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}
```

**Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add server/_core/trpc.ts server/routes/_helpers.ts server/test-helpers.ts
git commit -m "feat(auth): add owner/manager/agent role-based middleware"
```

---

## Task 3: Zod Schemas — Add CRM and admin validation schemas

**Files:**

- Modify: `shared/schemas.ts` (add after `verifySessionSchema`, ~line 155)

**Step 1: Add CRM schemas**

```typescript
export const customerInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  language: z.enum(["en", "he"]).default("en"),
  stage: z
    .enum(["prospect", "active", "completed", "vip", "inactive"])
    .default("prospect"),
  source: z.string().max(100).default("website"),
  tags: z.string().optional(), // JSON array string
  notes: z.string().max(2000).optional(),
});

export const customerActivityInputSchema = z.object({
  customerId: z.number(),
  type: z.enum([
    "note",
    "call",
    "whatsapp",
    "email",
    "follow_up",
    "status_change",
  ]),
  content: z.string().min(1, "Content is required").max(2000),
  dueDate: z
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : undefined)),
  createdBy: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(["user", "admin", "owner", "manager", "agent"]),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CustomerActivityInput = z.infer<typeof customerActivityInputSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
```

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add shared/schemas.ts
git commit -m "feat(schemas): add CRM customer, activity, and admin role schemas"
```

---

## Task 4: Database Helpers — Add CRM functions to `server/db.ts`

**Files:**

- Modify: `server/db.ts` (add after the last function, import new schema tables)

**Step 1: Add imports**

At the existing import block (~line 98-119), add:

```typescript
import {
  // ... existing imports ...
  customers,
  customerActivities,
  InsertCustomer,
  InsertCustomerActivity,
} from "../drizzle/schema";
```

**Step 2: Add CRM database helpers**

Add at the end of `server/db.ts`:

```typescript
// ─── CRM: Customers ──────────────────────────────────────

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result;
}

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.updatedAt));
}

export async function getAllCustomersPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.updatedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCustomer(
  id: number,
  data: Partial<InsertCustomer>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Also delete associated activities
  await db
    .delete(customerActivities)
    .where(eq(customerActivities.customerId, id));
  return await db.delete(customers).where(eq(customers.id, id));
}

export async function getCustomersByStage(stage: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customers)
    .where(eq(customers.stage, stage as any))
    .orderBy(desc(customers.updatedAt));
}

// ─── CRM: Customer Activities ─────────────────────────────

export async function createCustomerActivity(activity: InsertCustomerActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(customerActivities).values(activity);
}

export async function getActivitiesByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customerActivities)
    .where(eq(customerActivities.customerId, customerId))
    .orderBy(desc(customerActivities.createdAt));
}

export async function completeActivity(activityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(customerActivities)
    .set({ isCompleted: 1 })
    .where(eq(customerActivities.id, activityId));
}

export async function getPendingFollowUps() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customerActivities)
    .where(
      and(
        eq(customerActivities.type, "follow_up"),
        eq(customerActivities.isCompleted, 0)
      )
    )
    .orderBy(customerActivities.dueDate);
}

// ─── CRM: Pipeline Stats ─────────────────────────────────

export async function getCustomerPipelineStats() {
  const db = await getDb();
  if (!db) return { prospect: 0, active: 0, completed: 0, vip: 0, inactive: 0 };
  const all = await db.select().from(customers);
  return {
    prospect: all.filter(c => c.stage === "prospect").length,
    active: all.filter(c => c.stage === "active").length,
    completed: all.filter(c => c.stage === "completed").length,
    vip: all.filter(c => c.stage === "vip").length,
    inactive: all.filter(c => c.stage === "inactive").length,
  };
}

// ─── CRM: Customer Timeline (merged view) ─────────────────

export async function getCustomerTimeline(email?: string, phone?: string) {
  const db = await getDb();
  if (!db) return [];

  const timeline: Array<{
    date: Date;
    type: string;
    title: string;
    detail: string;
    source: string;
  }> = [];

  // Get leads matching this customer
  if (email) {
    const matchedLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email));
    for (const lead of matchedLeads) {
      timeline.push({
        date: lead.createdAt,
        type: "lead",
        title: `Lead created (${lead.source})`,
        detail: lead.message ?? "",
        source: "leads",
      });
    }
  }

  // Get bookings matching this customer
  if (email) {
    const matchedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.contactEmail, email));
    for (const booking of matchedBookings) {
      timeline.push({
        date: booking.createdAt,
        type: "booking",
        title: `Booking #${booking.id} — ${booking.status}`,
        detail: `${booking.numberOfAdults} adults, ${booking.arrivalDate.toLocaleDateString()} - ${booking.departureDate.toLocaleDateString()}`,
        source: "bookings",
      });
    }
  }

  // Get reviews matching this customer
  if (email) {
    const matchedReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.email, email));
    for (const review of matchedReviews) {
      timeline.push({
        date: review.createdAt,
        type: "review",
        title: `Review — ${review.rating}/5 stars`,
        detail: review.text.substring(0, 100),
        source: "reviews",
      });
    }
  }

  // Sort by date descending
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
  return timeline;
}

// ─── Admin: User Management ───────────────────────────────

export async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(users)
    .where(inArray(users.role, ["admin", "owner", "manager", "agent"]))
    .orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: role as any })
    .where(eq(users.id, userId));
}

export async function removeAdminAccess(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: "user" })
    .where(eq(users.id, userId));
}
```

**Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add server/db.ts
git commit -m "feat(db): add CRM customer, activity, timeline, and admin user helpers"
```

---

## Task 5: Tests — Write CRM and admin role tests

**Files:**

- Create: `server/crm.test.ts`
- Create: `server/admin-roles.test.ts`

**Step 1: Write CRM tests**

Create `server/crm.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createManagerContext,
  createAgentContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("CRM Router", () => {
  describe("crm.listCustomers", () => {
    it("returns paginated customer list for admin", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.crm.listCustomers({ page: 1, pageSize: 20 });
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("totalPages");
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe("crm.addActivity", () => {
    itWithDb("creates an activity for a customer", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.crm.addActivity({
        customerId: 1,
        type: "note",
        content: "Test note for customer",
      });
      expect(result).toHaveProperty("success", true);
    });
  });

  describe("crm.getPipelineStats", () => {
    it("returns stage counts", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.crm.getPipelineStats();
      expect(result).toHaveProperty("prospect");
      expect(result).toHaveProperty("active");
      expect(result).toHaveProperty("completed");
      expect(result).toHaveProperty("vip");
      expect(result).toHaveProperty("inactive");
    });
  });

  describe("role-based access", () => {
    it("denies public access to crm.listCustomers", async () => {
      const caller = appRouter.createCaller(createPublicContext().ctx);
      await expect(
        caller.crm.listCustomers({ page: 1, pageSize: 20 })
      ).rejects.toThrow();
    });

    it("allows manager access to crm.listCustomers", async () => {
      const caller = appRouter.createCaller(createManagerContext().ctx);
      const result = await caller.crm.listCustomers({ page: 1, pageSize: 20 });
      expect(result).toHaveProperty("items");
    });
  });
});
```

**Step 2: Write admin role tests**

Create `server/admin-roles.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createManagerContext,
  createAgentContext,
  createPublicContext,
} from "./test-helpers";

describe("Admin Roles", () => {
  describe("admin.listUsers", () => {
    it("returns user list for owner/admin", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.admin.listUsers();
      expect(Array.isArray(result)).toBe(true);
    });

    it("denies manager access to admin.listUsers", async () => {
      const caller = appRouter.createCaller(createManagerContext().ctx);
      await expect(caller.admin.listUsers()).rejects.toThrow(
        "Owner access required"
      );
    });

    it("denies agent access to admin.listUsers", async () => {
      const caller = appRouter.createCaller(createAgentContext().ctx);
      await expect(caller.admin.listUsers()).rejects.toThrow(
        "Owner access required"
      );
    });

    it("denies public access to admin.listUsers", async () => {
      const caller = appRouter.createCaller(createPublicContext().ctx);
      await expect(caller.admin.listUsers()).rejects.toThrow();
    });
  });
});
```

**Step 3: Run tests**

Run: `pnpm test`
Expected: Tests will FAIL because routes don't exist yet. This is expected (TDD — write tests first).

**Step 4: Commit**

```bash
git add server/crm.test.ts server/admin-roles.test.ts
git commit -m "test: add CRM and admin role test files (red phase)"
```

---

## Task 6: tRPC Routes — Create CRM and admin routers

**Files:**

- Create: `server/routes/crm.ts`
- Create: `server/routes/admin.ts`
- Modify: `server/routers.ts` (register new routers)

**Step 1: Create `server/routes/crm.ts`**

```typescript
import { z } from "zod";
import {
  router,
  secureManagerProcedure,
  secureOwnerProcedure,
  secureAgentProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createCustomer,
  getAllCustomersPaginated,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createCustomerActivity,
  getActivitiesByCustomerId,
  completeActivity,
  getCustomerPipelineStats,
  getCustomerTimeline,
  getCustomerByEmail,
} from "../db";
import {
  customerInputSchema,
  customerActivityInputSchema,
  paginationInput,
} from "../../shared/schemas";

export const crmRouter = router({
  listCustomers: secureManagerProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllCustomersPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getCustomer: secureManagerProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const customer = await getCustomerById(input.id);
      if (!customer) return null;
      const activities = await getActivitiesByCustomerId(input.id);
      const timeline = await getCustomerTimeline(
        customer.email ?? undefined,
        customer.phone ?? undefined
      );
      return { customer, activities, timeline };
    }),

  createCustomer: secureManagerProcedure
    .input(customerInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createCustomer(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "customer",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  updateCustomer: secureManagerProcedure
    .input(
      z.object({
        id: z.number(),
        data: customerInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateCustomer(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "customer",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  deleteCustomer: secureOwnerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteCustomer(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "customer",
        resourceId: input.id,
      });
      return { success: true };
    }),

  addActivity: secureAgentProcedure
    .input(customerActivityInputSchema)
    .mutation(async ({ input, ctx }) => {
      await createCustomerActivity({
        ...input,
        createdBy: ctx.user?.name ?? ctx.user?.email ?? "unknown",
      });
      // Update lastContactAt on the customer
      await updateCustomer(input.customerId, {
        lastContactAt: new Date(),
      });
      return { success: true };
    }),

  completeActivity: secureAgentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await completeActivity(input.id);
      return { success: true };
    }),

  getPipelineStats: secureManagerProcedure.query(async () => {
    return await getCustomerPipelineStats();
  }),

  movePipeline: secureManagerProcedure
    .input(
      z.object({
        customerId: z.number(),
        stage: z.enum(["prospect", "active", "completed", "vip", "inactive"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateCustomer(input.customerId, { stage: input.stage });
      // Log the stage change as an activity
      await createCustomerActivity({
        customerId: input.customerId,
        type: "status_change",
        content: `Stage changed to ${input.stage}`,
        createdBy: ctx.user?.name ?? "unknown",
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "customer",
        resourceId: input.customerId,
        newValue: JSON.stringify({ stage: input.stage }),
      });
      return { success: true };
    }),
});
```

**Step 2: Create `server/routes/admin.ts`**

```typescript
import { z } from "zod";
import {
  router,
  secureOwnerProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import { getAllAdminUsers, updateUserRole, removeAdminAccess } from "../db";
import { updateUserRoleSchema } from "../../shared/schemas";

export const adminRouter = router({
  listUsers: secureOwnerProcedure.query(async () => {
    return await getAllAdminUsers();
  }),

  updateUserRole: secureOwnerProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      // Prevent changing own role
      if (input.userId === ctx.user?.id) {
        throw new Error("Cannot change your own role");
      }
      await updateUserRole(input.userId, input.role);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "user",
        resourceId: input.userId,
        newValue: JSON.stringify({ role: input.role }),
      });
      return { success: true };
    }),

  removeUser: secureOwnerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      if (input.userId === ctx.user?.id) {
        throw new Error("Cannot remove your own admin access");
      }
      await removeAdminAccess(input.userId);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "user",
        resourceId: input.userId,
      });
      return { success: true };
    }),
});
```

**Step 3: Register routers in `server/routers.ts`**

Add imports:

```typescript
import { crmRouter } from "./routes/crm";
import { adminRouter } from "./routes/admin";
```

Add to the `appRouter`:

```typescript
export const appRouter = router({
  // ... existing routers ...
  crm: crmRouter,
  admin: adminRouter,
});
```

**Step 4: Run tests**

Run: `pnpm test`
Expected: All new tests PASS. Existing tests still PASS.

**Step 5: Commit**

```bash
git add server/routes/crm.ts server/routes/admin.ts server/routers.ts
git commit -m "feat(api): add CRM and admin tRPC routers with role guards"
```

---

## Task 7: Frontend — CRM Pipeline Board Component

**Files:**

- Create: `client/src/components/admin/CRMPipelineBoard.tsx`

**Step 1: Create the pipeline board component**

This component renders a horizontal Kanban board with 5 columns. Cards are draggable on desktop. On mobile, cards have a "Move to..." dropdown.

```typescript
// Key structure — the implementer should build this component with:
// - 5 columns: prospect, active, completed, vip, inactive
// - Each column shows customer cards from trpc.crm.listCustomers filtered by stage
// - Cards show: name, score (stars), lastContactAt relative time, WhatsApp + note quick actions
// - HTML5 drag-and-drop: onDragStart sets customer id, onDrop calls trpc.crm.movePipeline
// - Mobile: each card has a <select> dropdown to move between stages
// - Uses toast(sonner) for success/error notifications
// - Calls trpc.crm.getPipelineStats for column header counts
// - onClick on a card calls the onSelectCustomer prop to open detail panel
```

The component signature:

```typescript
interface CRMPipelineBoardProps {
  onSelectCustomer: (customerId: number) => void;
}
export function CRMPipelineBoard({ onSelectCustomer }: CRMPipelineBoardProps) { ... }
```

**Step 2: Commit**

```bash
git add client/src/components/admin/CRMPipelineBoard.tsx
git commit -m "feat(ui): add CRM pipeline Kanban board component"
```

---

## Task 8: Frontend — CRM Customer List Component

**Files:**

- Create: `client/src/components/admin/CRMCustomerList.tsx`

**Step 1: Create the customer list component**

```typescript
// Key structure:
// - Searchable table of all customers (trpc.crm.listCustomers with pagination)
// - Columns: Name, Contact (email/phone), Stage (colored badge), Score, Bookings, Last Active
// - Filter dropdowns: stage, source, hasFollowUp
// - Search filters by name/email/phone
// - Uses existing Pagination component from ./Pagination
// - Row click calls onSelectCustomer prop
// - Uses existing TableSkeleton while loading
```

Component signature:

```typescript
interface CRMCustomerListProps {
  onSelectCustomer: (customerId: number) => void;
}
export function CRMCustomerList({ onSelectCustomer }: CRMCustomerListProps) { ... }
```

**Step 2: Commit**

```bash
git add client/src/components/admin/CRMCustomerList.tsx
git commit -m "feat(ui): add CRM customer list with search and filters"
```

---

## Task 9: Frontend — CRM Customer Detail Component

**Files:**

- Create: `client/src/components/admin/CRMCustomerDetail.tsx`

**Step 1: Create the customer detail panel**

```typescript
// Key structure:
// - Fetches customer data with trpc.crm.getCustomer
// - Header: name, stage badge, contact info with WhatsApp/email action buttons
// - Stats: totalSpent, totalBookings, score, source
// - Tabs: Timeline | Activities | Notes
// - Timeline tab: merged chronological view from customer.timeline (leads, bookings, reviews)
//   + customer.activities (notes, calls, follow-ups)
// - Activity form: type selector, content textarea, optional dueDate for follow-ups
// - Complete follow-up button (trpc.crm.completeActivity)
// - Edit customer button → inline form with customerInputSchema fields
// - Stage selector dropdown to quickly change stage (trpc.crm.movePipeline)
```

Component signature:

```typescript
interface CRMCustomerDetailProps {
  customerId: number;
  onClose: () => void;
}
export function CRMCustomerDetail({ customerId, onClose }: CRMCustomerDetailProps) { ... }
```

**Step 2: Commit**

```bash
git add client/src/components/admin/CRMCustomerDetail.tsx
git commit -m "feat(ui): add CRM customer detail panel with timeline and activities"
```

---

## Task 10: Frontend — CRM Tab Integration + Admin Users Tab

**Files:**

- Modify: `client/src/components/admin/index.ts` (add exports)
- Create: `client/src/components/admin/CRMTab.tsx` (orchestrates pipeline/list/detail views)
- Create: `client/src/components/admin/UsersTab.tsx` (admin user management)
- Modify: `client/src/pages/AdminDashboard.tsx` (add CRM and Users tabs)
- Modify: `client/src/components/admin/types.ts` (add new tab IDs)

**Step 1: Create `CRMTab.tsx`** — Orchestrates the two views (pipeline/list) and detail panel

```typescript
// Key structure:
// - Toggle between PipelineView and ListView (two buttons at top)
// - "Add Customer" button → dialog/inline form using customerInputSchema
// - When a customer is selected (from either view), show CRMCustomerDetail as a side panel
// - Import and render CRMPipelineBoard and CRMCustomerList based on active view
```

**Step 2: Create `UsersTab.tsx`** — Owner-only admin management

```typescript
// Key structure:
// - Table of admin users from trpc.admin.listUsers
// - Columns: Name, Email, Role (dropdown to change), Actions (remove)
// - Role dropdown calls trpc.admin.updateUserRole
// - Remove button calls trpc.admin.removeUser with confirmation
// - Shows "Only visible to owners" badge
```

**Step 3: Update `client/src/components/admin/types.ts`**

Add to `AdminTabId` type (note: this type is currently only in AdminDashboard.tsx, move or extend):

Add new tab IDs `"crm"` and `"users"` to the union type.

**Step 4: Update `client/src/components/admin/index.ts`**

Add exports:

```typescript
export { CRMTab } from "./CRMTab";
export { UsersTab } from "./UsersTab";
```

**Step 5: Update `client/src/pages/AdminDashboard.tsx`**

Add imports for `CRMTab`, `UsersTab`, and new Lucide icons (`UserCircle`, `Shield`).

Add `"crm"` and `"users"` to the `AdminTabId` type.

Add to the `tabs` array:

```typescript
{ id: "crm", label: "CRM", icon: UserCircle, count: undefined },
// ... existing tabs ...
{ id: "users", label: "Users", icon: Shield, count: undefined },
```

Add tab rendering in the content area (where existing tabs are rendered via switch/conditional):

```typescript
{activeTab === "crm" && <CRMTab />}
{activeTab === "users" && <UsersTab />}
```

The Users tab should only appear if the current user's role is `admin` or `owner`. Add a conditional to the tabs array:

```typescript
// Only show Users tab for owner/admin
...(["admin", "owner"].includes(user.role)
  ? [{ id: "users" as const, label: "Users", icon: Shield, count: undefined }]
  : []),
```

**Step 6: Run type check and tests**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS

**Step 7: Commit**

```bash
git add client/src/components/admin/CRMTab.tsx client/src/components/admin/UsersTab.tsx client/src/components/admin/index.ts client/src/components/admin/types.ts client/src/pages/AdminDashboard.tsx
git commit -m "feat(ui): integrate CRM tab and Users tab into admin dashboard"
```

---

## Task 11: Auto-Customer Creation — Hook into existing lead/booking creation

**Files:**

- Modify: `server/routes/booking.ts` (add auto-customer creation after booking.create)
- Modify: `server/routes/lead.ts` (add auto-customer creation after lead.create)

**Step 1: Add auto-customer creation helper to `server/db.ts`**

```typescript
export async function findOrCreateCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  // Try to find existing customer by email
  if (data.email) {
    const existing = await getCustomerByEmail(data.email);
    if (existing) return existing.id;
  }

  // Try to find by phone
  if (data.phone) {
    const existing = await getCustomerByPhone(data.phone);
    if (existing) return existing.id;
  }

  // Create new customer
  const result = await db.insert(customers).values({
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    source: data.source ?? "website",
    stage: "prospect",
  });

  // Return the inserted ID
  const insertId = (result as any)[0]?.insertId;
  return insertId ?? null;
}
```

**Step 2: In `server/routes/booking.ts`**, after the `createBooking` call, add:

```typescript
// Auto-create or link customer (non-blocking)
import { findOrCreateCustomer, updateCustomer } from "../db";

// After createBooking(bookingData):
findOrCreateCustomer({
  name: input.contactName,
  email: input.contactEmail || undefined,
  phone: input.contactPhone,
  source: "booking",
})
  .then(customerId => {
    if (customerId) {
      updateCustomer(customerId, { stage: "active" }).catch(console.error);
    }
  })
  .catch(console.error);
```

**Step 3: In `server/routes/lead.ts`**, after the `createLead` call, add:

```typescript
import { findOrCreateCustomer } from "../db";

// After createLead(input):
findOrCreateCustomer({
  name: input.name,
  email: input.email,
  phone: input.phone || undefined,
  source: input.source || "website",
}).catch(console.error);
```

**Step 4: Run tests**

Run: `pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add server/db.ts server/routes/booking.ts server/routes/lead.ts
git commit -m "feat(crm): auto-create customer records from new bookings and leads"
```

---

## Task 12: Final Integration — Push schema, test end-to-end, update todo.md

**Files:**

- Modify: `todo.md` (add CRM + multi-admin section)

**Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests PASS

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Update `todo.md`**

Add a new section:

```markdown
## CRM + Multi-Admin Roles (Feb 19, 2026)

### Database Schema

- [ ] Run `pnpm db:push` to create customers and customerActivities tables
- [ ] Run `pnpm db:push` to update users.role enum

### Multi-Admin Roles

- [x] Add owner/manager/agent roles to users table
- [x] Add role-based middleware (ownerProcedure, managerProcedure, agentProcedure)
- [x] Add admin user management API (list, updateRole, remove)
- [x] Add Users tab to admin panel (owner-only)

### CRM System

- [x] Add customers table (name, email, phone, stage, tags, totalSpent)
- [x] Add customerActivities table (notes, calls, follow-ups with due dates)
- [x] Add CRM tRPC procedures (CRUD, pipeline, timeline, activities)
- [x] Add CRM Pipeline Board (Kanban with drag-and-drop)
- [x] Add CRM Customer List (searchable, filterable table)
- [x] Add CRM Customer Detail (timeline, activities, follow-ups)
- [x] Add CRM tab to admin dashboard
- [x] Auto-create customers from new bookings and leads

### Tests

- [x] CRM router tests (listCustomers, addActivity, getPipelineStats, role access)
- [x] Admin roles tests (listUsers access control for owner/manager/agent/public)
```

**Step 4: Commit everything**

```bash
git add todo.md
git commit -m "docs: update todo.md with CRM + multi-admin feature checklist"
```

**Step 5: Note for production deployment**

After pushing to GitHub, the following must be run on the Manus platform:

- `pnpm db:push` — creates the `customers` and `customerActivities` tables, and updates the `users.role` enum

---

## Dependency Graph

```
[Task 1] → [Task 2] → [Task 3] → [Task 4] → [Task 5, Task 6] → [Task 7, Task 8, Task 9] → [Task 10] → [Task 11] → [Task 12]
```

- Tasks 1-4 are sequential (schema → middleware → schemas → DB helpers)
- Tasks 5-6 can run in parallel (tests + routes)
- Tasks 7-9 can run in parallel (independent UI components)
- Task 10 integrates everything into the dashboard
- Task 11 adds auto-customer creation hooks
- Task 12 is final integration and cleanup
