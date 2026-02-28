# Wiro Accountant — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the 4 accounting capabilities (invoicing, income/expense tracking, tax reporting, inventory management) as new DB tables, tRPC routes, and admin UI tabs within the existing Wiro 4x4 codebase.

**Architecture:** Extend the existing Drizzle schema with 4 new tables (`invoices`, `accountingEntries`, `taxFilings`, `inventory`). Add domain modules under `server/db/` and `server/routes/` following the established pattern. Add shared pure-function tax calculators in `shared/accounting.ts`. Wire into the admin dashboard as new tabs.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS 4 + Wouter | Express + tRPC 11 + Drizzle ORM (MySQL) | Vitest

---

## Task 1: Database Schema — 4 New Tables

**Files:**

- Modify: `drizzle/schema.ts` (append after line ~539)
- Modify: `drizzle/relations.ts` (add FK relationships)

**Step 1: Add `invoices` table to schema**

Append to `drizzle/schema.ts`:

```typescript
// Invoices Table (Tax Invoice, Receipt, WHT Certificate)
export const invoices = mysqlTable(
  "invoices",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
    bookingId: int("bookingId"),
    type: mysqlEnum("type", [
      "tax_invoice",
      "receipt",
      "wht_certificate",
    ]).notNull(),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerAddress: text("customerAddress"),
    customerTaxId: varchar("customerTaxId", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("THB"),
    subtotal: int("subtotal").notNull(), // in smallest unit (satang or THB integer)
    vatAmount: int("vatAmount").default(0),
    whtRate: int("whtRate").default(0), // stored as percentage * 100 (e.g., 300 = 3%)
    whtAmount: int("whtAmount").default(0),
    totalAmount: int("totalAmount").notNull(),
    fxRate: varchar("fxRate", { length: 20 }), // string to avoid float precision issues
    thbEquivalent: int("thbEquivalent"),
    status: mysqlEnum("status", ["unpaid", "paid", "partial", "cancelled"])
      .default("unpaid")
      .notNull(),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    paymentDate: timestamp("paymentDate"),
    lineItems: text("lineItems"), // JSON array: [{description, quantity, unitPrice, amount}]
    issuedAt: timestamp("issuedAt").defaultNow().notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_invoices_bookingId").on(table.bookingId),
    index("idx_invoices_status").on(table.status),
  ]
);

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
```

**Step 2: Add `accountingEntries` table**

```typescript
// Accounting Entries (Double-Entry Journal)
export const accountingEntries = mysqlTable(
  "accountingEntries",
  {
    id: int("id").autoincrement().primaryKey(),
    date: timestamp("date").notNull(),
    accountCode: varchar("accountCode", { length: 10 }).notNull(), // e.g., "41000", "51200"
    description: text("description").notNull(),
    debit: int("debit").default(0), // THB integer
    credit: int("credit").default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("THB"),
    originalAmount: int("originalAmount"), // amount in original currency
    fxRate: varchar("fxRate", { length: 20 }),
    bookingId: int("bookingId"),
    invoiceId: int("invoiceId"),
    vendorPayee: varchar("vendorPayee", { length: 255 }),
    documentRef: varchar("documentRef", { length: 100 }),
    createdBy: varchar("createdBy", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("idx_accountingEntries_accountCode").on(table.accountCode),
    index("idx_accountingEntries_date").on(table.date),
    index("idx_accountingEntries_bookingId").on(table.bookingId),
  ]
);

export type AccountingEntry = typeof accountingEntries.$inferSelect;
export type InsertAccountingEntry = typeof accountingEntries.$inferInsert;
```

**Step 3: Add `taxFilings` table**

```typescript
// Tax Filings Tracker
export const taxFilings = mysqlTable("taxFilings", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", [
    "vat_pp30",
    "wht_pnd3",
    "wht_pnd53",
    "cit_pnd50",
    "cit_pnd51",
  ]).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // "2026-02" or "2026-H1" or "2026"
  dueDate: timestamp("dueDate").notNull(),
  outputVat: int("outputVat"), // THB
  inputVat: int("inputVat"),
  netVat: int("netVat"),
  whtTotal: int("whtTotal"),
  taxableIncome: int("taxableIncome"),
  taxAmount: int("taxAmount"),
  status: mysqlEnum("status", ["pending", "prepared", "filed", "late"])
    .default("pending")
    .notNull(),
  filedAt: timestamp("filedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaxFiling = typeof taxFilings.$inferSelect;
export type InsertTaxFiling = typeof taxFilings.$inferInsert;
```

**Step 4: Add `inventory` table**

```typescript
// Inventory / Asset Tracking
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "vehicle",
    "equipment",
    "supplies",
  ]).notNull(),
  description: text("description"),
  purchaseDate: timestamp("purchaseDate"),
  purchaseCost: int("purchaseCost"), // THB
  currentValue: int("currentValue"),
  usefulLifeMonths: int("usefulLifeMonths"),
  monthlyDepreciation: int("monthlyDepreciation"),
  condition: mysqlEnum("condition", ["new", "good", "fair", "poor", "retired"])
    .default("good")
    .notNull(),
  quantity: int("quantity").default(1),
  location: varchar("location", { length: 255 }),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;
```

**Step 5: Push schema to database**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm db:push`
Expected: 4 new tables created without errors

**Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add drizzle/schema.ts drizzle/relations.ts
git commit -m "feat(accounting): add invoices, accountingEntries, taxFilings, inventory tables"
```

---

## Task 2: Shared Accounting Utilities — `shared/accounting.ts`

**Files:**

- Create: `shared/accounting.ts`
- Create: `server/accounting.test.ts`

**Step 1: Write failing tests for tax calculators**

Create `server/accounting.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateVat,
  calculateWht,
  calculateCit,
  getWhtRate,
  generateInvoiceNumber,
  formatThbAmount,
  getFilingDeadlines,
  calculateDepreciation,
} from "../shared/accounting";

describe("Accounting Module", () => {
  describe("calculateVat", () => {
    it("calculates 7% VAT on a sale", () => {
      expect(calculateVat(100000)).toEqual({
        baseAmount: 100000,
        vatAmount: 7000,
        totalWithVat: 107000,
      });
    });

    it("extracts VAT from a VAT-inclusive price", () => {
      expect(calculateVat(107000, { inclusive: true })).toEqual({
        baseAmount: 100000,
        vatAmount: 7000,
        totalWithVat: 107000,
      });
    });

    it("handles zero amount", () => {
      expect(calculateVat(0)).toEqual({
        baseAmount: 0,
        vatAmount: 0,
        totalWithVat: 0,
      });
    });
  });

  describe("calculateWht", () => {
    it("calculates 3% WHT for service fees", () => {
      expect(calculateWht(50000, "service")).toEqual({
        grossAmount: 50000,
        whtRate: 3,
        whtAmount: 1500,
        netPayment: 48500,
        form: "pnd53",
      });
    });

    it("calculates 5% WHT for rental", () => {
      expect(calculateWht(30000, "rental")).toEqual({
        grossAmount: 30000,
        whtRate: 5,
        whtAmount: 1500,
        netPayment: 28500,
        form: "pnd53",
      });
    });

    it("calculates 1% WHT for transportation", () => {
      expect(calculateWht(20000, "transportation")).toEqual({
        grossAmount: 20000,
        whtRate: 1,
        whtAmount: 200,
        netPayment: 19800,
        form: "pnd53",
      });
    });

    it("calculates 2% WHT for advertising", () => {
      expect(calculateWht(100000, "advertising")).toEqual({
        grossAmount: 100000,
        whtRate: 2,
        whtAmount: 2000,
        netPayment: 98000,
        form: "pnd53",
      });
    });

    it("uses pnd3 form for individuals", () => {
      const result = calculateWht(50000, "service", { isIndividual: true });
      expect(result.form).toBe("pnd3");
    });
  });

  describe("calculateCit", () => {
    it("applies SME rate: 0% on first 300K", () => {
      expect(calculateCit(200000, { isSme: true })).toEqual({
        taxableIncome: 200000,
        taxAmount: 0,
        effectiveRate: 0,
        brackets: [{ range: "0 - 300,000", rate: 0, tax: 0 }],
      });
    });

    it("applies SME rate: 15% on 300K-3M bracket", () => {
      const result = calculateCit(1000000, { isSme: true });
      // 0% on first 300K = 0
      // 15% on remaining 700K = 105,000
      expect(result.taxAmount).toBe(105000);
    });

    it("applies standard 20% for non-SME", () => {
      expect(calculateCit(1000000, { isSme: false }).taxAmount).toBe(200000);
    });
  });

  describe("getWhtRate", () => {
    it("returns correct rates for each payment type", () => {
      expect(getWhtRate("service")).toBe(3);
      expect(getWhtRate("rental")).toBe(5);
      expect(getWhtRate("transportation")).toBe(1);
      expect(getWhtRate("advertising")).toBe(2);
      expect(getWhtRate("professional")).toBe(3);
    });
  });

  describe("generateInvoiceNumber", () => {
    it("generates invoice number with prefix and date", () => {
      const num = generateInvoiceNumber("INV", new Date("2026-02-28"), 1);
      expect(num).toBe("INV-202602-0001");
    });

    it("pads sequence number to 4 digits", () => {
      const num = generateInvoiceNumber("RCP", new Date("2026-12-01"), 42);
      expect(num).toBe("RCP-202612-0042");
    });
  });

  describe("formatThbAmount", () => {
    it("formats with Baht symbol and commas", () => {
      expect(formatThbAmount(1500000)).toBe("฿1,500,000");
    });

    it("handles zero", () => {
      expect(formatThbAmount(0)).toBe("฿0");
    });
  });

  describe("getFilingDeadlines", () => {
    it("returns correct deadlines for a month", () => {
      const deadlines = getFilingDeadlines(2026, 2);
      expect(deadlines).toEqual([
        {
          type: "wht_pnd3",
          dueDate: "2026-03-07",
          label: "WHT PND.3 (ภ.ง.ด.3)",
        },
        {
          type: "wht_pnd53",
          dueDate: "2026-03-07",
          label: "WHT PND.53 (ภ.ง.ด.53)",
        },
        {
          type: "vat_pp30",
          dueDate: "2026-03-15",
          label: "VAT PP.30 (ภ.พ.30)",
        },
      ]);
    });
  });

  describe("calculateDepreciation", () => {
    it("calculates straight-line monthly depreciation", () => {
      const result = calculateDepreciation(120000, 60); // 120K over 60 months
      expect(result.monthlyAmount).toBe(2000);
      expect(result.annualAmount).toBe(24000);
    });

    it("calculates current value after N months", () => {
      const result = calculateDepreciation(120000, 60, { monthsElapsed: 24 });
      expect(result.currentValue).toBe(72000); // 120K - (2K * 24)
    });

    it("floors current value at zero", () => {
      const result = calculateDepreciation(120000, 60, { monthsElapsed: 100 });
      expect(result.currentValue).toBe(0);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/accounting.test.ts`
Expected: FAIL — module `../shared/accounting` not found

**Step 3: Implement `shared/accounting.ts`**

Create `shared/accounting.ts`:

```typescript
/**
 * Pure accounting calculation functions for Wiro 4x4.
 * No database dependency — used by both client and server.
 * All monetary amounts in THB (integer, no decimals).
 *
 * Thai tax rates as of 2026:
 *   VAT: 7%
 *   WHT: 1-5% depending on payment type
 *   CIT: 20% standard, SME brackets apply
 */

// ── VAT ──────────────────────────────────────────────────────

const VAT_RATE = 0.07;

interface VatResult {
  baseAmount: number;
  vatAmount: number;
  totalWithVat: number;
}

export function calculateVat(
  amount: number,
  opts?: { inclusive?: boolean }
): VatResult {
  if (amount === 0) return { baseAmount: 0, vatAmount: 0, totalWithVat: 0 };

  if (opts?.inclusive) {
    const baseAmount = Math.round(amount / (1 + VAT_RATE));
    const vatAmount = amount - baseAmount;
    return { baseAmount, vatAmount, totalWithVat: amount };
  }

  const vatAmount = Math.round(amount * VAT_RATE);
  return { baseAmount: amount, vatAmount, totalWithVat: amount + vatAmount };
}

// ── WHT ──────────────────────────────────────────────────────

type WhtPaymentType =
  | "service"
  | "rental"
  | "transportation"
  | "advertising"
  | "professional";

const WHT_RATES: Record<WhtPaymentType, number> = {
  service: 3,
  rental: 5,
  transportation: 1,
  advertising: 2,
  professional: 3,
};

interface WhtResult {
  grossAmount: number;
  whtRate: number;
  whtAmount: number;
  netPayment: number;
  form: "pnd3" | "pnd53";
}

export function getWhtRate(type: WhtPaymentType): number {
  return WHT_RATES[type];
}

export function calculateWht(
  grossAmount: number,
  type: WhtPaymentType,
  opts?: { isIndividual?: boolean }
): WhtResult {
  const rate = WHT_RATES[type];
  const whtAmount = Math.round(grossAmount * (rate / 100));
  return {
    grossAmount,
    whtRate: rate,
    whtAmount,
    netPayment: grossAmount - whtAmount,
    form: opts?.isIndividual ? "pnd3" : "pnd53",
  };
}

// ── CIT ──────────────────────────────────────────────────────

interface CitBracket {
  range: string;
  rate: number;
  tax: number;
}

interface CitResult {
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  brackets: CitBracket[];
}

export function calculateCit(
  taxableIncome: number,
  opts: { isSme: boolean }
): CitResult {
  if (!opts.isSme) {
    const taxAmount = Math.round(taxableIncome * 0.2);
    return {
      taxableIncome,
      taxAmount,
      effectiveRate: 20,
      brackets: [
        {
          range: `0 - ${formatNumber(taxableIncome)}`,
          rate: 20,
          tax: taxAmount,
        },
      ],
    };
  }

  // SME brackets
  const brackets: CitBracket[] = [];
  let remaining = taxableIncome;
  let totalTax = 0;

  // 0% on first 300,000
  const bracket1 = Math.min(remaining, 300000);
  brackets.push({ range: "0 - 300,000", rate: 0, tax: 0 });
  remaining -= bracket1;

  // 15% on 300,001 - 3,000,000
  if (remaining > 0) {
    const bracket2 = Math.min(remaining, 2700000);
    const tax2 = Math.round(bracket2 * 0.15);
    brackets.push({ range: "300,001 - 3,000,000", rate: 15, tax: tax2 });
    totalTax += tax2;
    remaining -= bracket2;
  }

  // 20% above 3,000,000
  if (remaining > 0) {
    const tax3 = Math.round(remaining * 0.2);
    brackets.push({ range: "3,000,001+", rate: 20, tax: tax3 });
    totalTax += tax3;
  }

  return {
    taxableIncome,
    taxAmount: totalTax,
    effectiveRate:
      taxableIncome > 0 ? Math.round((totalTax / taxableIncome) * 100) : 0,
    brackets,
  };
}

// ── Invoice Number ───────────────────────────────────────────

export function generateInvoiceNumber(
  prefix: string,
  date: Date,
  sequence: number
): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}-${yyyy}${mm}-${seq}`;
}

// ── Filing Deadlines ─────────────────────────────────────────

interface FilingDeadline {
  type: string;
  dueDate: string;
  label: string;
}

export function getFilingDeadlines(
  year: number,
  month: number
): FilingDeadline[] {
  // Deadlines are in the FOLLOWING month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const pad = (n: number) => String(n).padStart(2, "0");

  return [
    {
      type: "wht_pnd3",
      dueDate: `${nextYear}-${pad(nextMonth)}-07`,
      label: "WHT PND.3 (ภ.ง.ด.3)",
    },
    {
      type: "wht_pnd53",
      dueDate: `${nextYear}-${pad(nextMonth)}-07`,
      label: "WHT PND.53 (ภ.ง.ด.53)",
    },
    {
      type: "vat_pp30",
      dueDate: `${nextYear}-${pad(nextMonth)}-15`,
      label: "VAT PP.30 (ภ.พ.30)",
    },
  ];
}

// ── Depreciation ─────────────────────────────────────────────

interface DepreciationResult {
  monthlyAmount: number;
  annualAmount: number;
  currentValue: number;
}

export function calculateDepreciation(
  purchaseCost: number,
  usefulLifeMonths: number,
  opts?: { monthsElapsed?: number }
): DepreciationResult {
  const monthlyAmount = Math.round(purchaseCost / usefulLifeMonths);
  const elapsed = opts?.monthsElapsed ?? 0;
  const depreciated = monthlyAmount * elapsed;
  const currentValue = Math.max(0, purchaseCost - depreciated);

  return {
    monthlyAmount,
    annualAmount: monthlyAmount * 12,
    currentValue,
  };
}

// ── Formatting Helpers ───────────────────────────────────────

export function formatThbAmount(amount: number): string {
  return `฿${amount.toLocaleString("en-US")}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Chart of Accounts ────────────────────────────────────────

export const CHART_OF_ACCOUNTS = {
  // Revenue
  "41000": {
    nameTh: "รายได้จากแพ็คเกจทัวร์",
    nameEn: "Tour Package Sales",
    type: "revenue",
  },
  "41100": {
    nameTh: "รายได้ทัวร์รายวัน",
    nameEn: "Day Trip Revenue",
    type: "revenue",
  },
  "41200": {
    nameTh: "รายได้รับส่งสนามบิน",
    nameEn: "Airport Transfer Revenue",
    type: "revenue",
  },
  "41300": {
    nameTh: "รายได้ทัวร์พิเศษ",
    nameEn: "Custom Tour Revenue",
    type: "revenue",
  },
  "42000": {
    nameTh: "รายได้ค่านายหน้า",
    nameEn: "Commission Income",
    type: "revenue",
  },
  "49000": { nameTh: "รายได้อื่น", nameEn: "Other Income", type: "revenue" },
  "49100": {
    nameTh: "กำไรจากอัตราแลกเปลี่ยน",
    nameEn: "Foreign Exchange Gain",
    type: "revenue",
  },
  // Cost of Sales
  "51000": {
    nameTh: "ค่าที่พักโคเชอร์",
    nameEn: "Kosher Hotel & Accommodation",
    type: "cost",
  },
  "51100": {
    nameTh: "ค่าอาหารโคเชอร์",
    nameEn: "Kosher Food & Catering",
    type: "cost",
  },
  "51200": { nameTh: "ค่าขนส่ง", nameEn: "Transportation", type: "cost" },
  "51300": {
    nameTh: "ค่าไกด์นำเที่ยว",
    nameEn: "Tour Guide Fees",
    type: "cost",
  },
  "51400": {
    nameTh: "ค่าเข้าชม/กิจกรรม",
    nameEn: "Entrance Fees & Activities",
    type: "cost",
  },
  "51500": {
    nameTh: "ค่าตั๋วเครื่องบินในประเทศ",
    nameEn: "Domestic Flights",
    type: "cost",
  },
  "51600": {
    nameTh: "ค่าประกันการเดินทาง",
    nameEn: "Travel Insurance",
    type: "cost",
  },
  // Operating Expenses
  "61000": {
    nameTh: "ค่าเช่าสำนักงาน",
    nameEn: "Office Rent",
    type: "expense",
  },
  "61100": { nameTh: "ค่าสาธารณูปโภค", nameEn: "Utilities", type: "expense" },
  "61200": {
    nameTh: "เงินเดือน/ประกันสังคม",
    nameEn: "Staff Salaries & SS",
    type: "expense",
  },
  "61300": {
    nameTh: "ค่าการตลาด",
    nameEn: "Marketing & Advertising",
    type: "expense",
  },
  "61400": {
    nameTh: "ค่าเว็บไซต์/เทคโนโลยี",
    nameEn: "Website & Technology",
    type: "expense",
  },
  "61500": {
    nameTh: "ค่าวิชาชีพ",
    nameEn: "Professional Fees",
    type: "expense",
  },
  "61600": {
    nameTh: "ค่าธรรมเนียมธนาคาร/FX",
    nameEn: "Bank Charges & FX Fees",
    type: "expense",
  },
  "61700": {
    nameTh: "ค่าวัสดุสำนักงาน",
    nameEn: "Office Supplies",
    type: "expense",
  },
  "61800": { nameTh: "ค่าสื่อสาร", nameEn: "Communication", type: "expense" },
  "61900": {
    nameTh: "ค่าใช้จ่ายเบ็ดเตล็ด",
    nameEn: "Miscellaneous",
    type: "expense",
  },
  "69100": {
    nameTh: "ขาดทุนจากอัตราแลกเปลี่ยน",
    nameEn: "Foreign Exchange Loss",
    type: "expense",
  },
} as const;

export type AccountCode = keyof typeof CHART_OF_ACCOUNTS;
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/accounting.test.ts`
Expected: All 16 tests PASS

**Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add shared/accounting.ts server/accounting.test.ts
git commit -m "feat(accounting): add shared tax calculators with 16 tests — VAT, WHT, CIT, depreciation"
```

---

## Task 3: Zod Schemas for Accounting

**Files:**

- Modify: `shared/schemas.ts` (append new schemas)

**Step 1: Add invoice, accounting entry, tax filing, and inventory schemas**

Append to `shared/schemas.ts`:

```typescript
// ── Accounting Schemas ───────────────────────────────────────

export const invoiceInputSchema = z.object({
  bookingId: z.number().optional(),
  type: z.enum(["tax_invoice", "receipt", "wht_certificate"]),
  customerName: z.string().min(1, "Customer name is required").max(255),
  customerAddress: z.string().max(1000).optional(),
  customerTaxId: z.string().max(50).optional(),
  currency: z.enum(["THB", "ILS", "USD"]).default("THB"),
  subtotal: z.number().min(0),
  vatAmount: z.number().default(0),
  whtRate: z.number().min(0).max(500).default(0), // percentage * 100
  whtAmount: z.number().default(0),
  totalAmount: z.number().min(0),
  fxRate: z.string().optional(),
  thbEquivalent: z.number().optional(),
  paymentMethod: z.string().max(50).optional(),
  lineItems: z.string().optional(), // JSON string
  notes: z.string().max(2000).optional(),
});

export const accountingEntryInputSchema = z.object({
  date: z.string().transform(s => new Date(s)),
  accountCode: z.string().min(5).max(10),
  description: z.string().min(1, "Description is required").max(500),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  currency: z.enum(["THB", "ILS", "USD"]).default("THB"),
  originalAmount: z.number().optional(),
  fxRate: z.string().optional(),
  bookingId: z.number().optional(),
  invoiceId: z.number().optional(),
  vendorPayee: z.string().max(255).optional(),
  documentRef: z.string().max(100).optional(),
});

export const taxFilingInputSchema = z.object({
  type: z.enum(["vat_pp30", "wht_pnd3", "wht_pnd53", "cit_pnd50", "cit_pnd51"]),
  period: z.string().min(4).max(20),
  dueDate: z.string().transform(s => new Date(s)),
  outputVat: z.number().optional(),
  inputVat: z.number().optional(),
  netVat: z.number().optional(),
  whtTotal: z.number().optional(),
  taxableIncome: z.number().optional(),
  taxAmount: z.number().optional(),
  notes: z.string().max(2000).optional(),
});

export const inventoryInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  category: z.enum(["vehicle", "equipment", "supplies"]),
  description: z.string().max(1000).optional(),
  purchaseDate: z
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : undefined)),
  purchaseCost: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  usefulLifeMonths: z.number().min(1).optional(),
  condition: z.enum(["new", "good", "fair", "poor", "retired"]).default("good"),
  quantity: z.number().min(0).default(1),
  location: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type AccountingEntryInput = z.infer<typeof accountingEntryInputSchema>;
export type TaxFilingInput = z.infer<typeof taxFilingInputSchema>;
export type InventoryInput = z.infer<typeof inventoryInputSchema>;
```

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add shared/schemas.ts
git commit -m "feat(accounting): add Zod schemas for invoices, entries, tax filings, inventory"
```

---

## Task 4: Database Helpers — `server/db/accounting.ts` and `server/db/inventory.ts`

**Files:**

- Create: `server/db/accounting.ts`
- Create: `server/db/inventory.ts`
- Modify: `server/db/index.ts` (add exports)

**Step 1: Create `server/db/accounting.ts`**

```typescript
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";
import { getDb } from "./connection";
import {
  invoices,
  accountingEntries,
  taxFilings,
  InsertInvoice,
  InsertAccountingEntry,
  InsertTaxFiling,
} from "../../drizzle/schema";

// ── Invoices ─────────────────────────────────────────────────

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(invoices).values(data);
}

export async function getAllInvoicesPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(invoices)
    .orderBy(desc(invoices.issuedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(invoices).where(eq(invoices.id, id));
  return rows[0] ?? null;
}

export async function updateInvoiceStatus(
  id: number,
  status: "unpaid" | "paid" | "partial" | "cancelled",
  paymentDate?: Date,
  paymentMethod?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: Record<string, unknown> = { status };
  if (paymentDate) data.paymentDate = paymentDate;
  if (paymentMethod) data.paymentMethod = paymentMethod;
  return await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function getNextInvoiceSequence(
  prefix: string,
  yearMonth: string
) {
  const db = await getDb();
  if (!db) return 1;
  const pattern = `${prefix}-${yearMonth}-%`;
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`);
  return Number(rows[0]?.count ?? 0) + 1;
}

// ── Accounting Entries ───────────────────────────────────────

export async function createAccountingEntry(data: InsertAccountingEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(accountingEntries).values(data);
}

export async function getAccountingEntriesPaginated(
  page = 1,
  pageSize = 20,
  filters?: { accountCode?: string; startDate?: Date; endDate?: Date }
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const conditions = [];
  if (filters?.accountCode) {
    conditions.push(eq(accountingEntries.accountCode, filters.accountCode));
  }
  if (filters?.startDate) {
    conditions.push(gte(accountingEntries.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(accountingEntries.date, filters.endDate));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const items = await db
    .select()
    .from(accountingEntries)
    .where(where)
    .orderBy(desc(accountingEntries.date))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(accountingEntries)
    .where(where);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getTrialBalance() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      accountCode: accountingEntries.accountCode,
      totalDebit: sql<number>`SUM(${accountingEntries.debit})`,
      totalCredit: sql<number>`SUM(${accountingEntries.credit})`,
    })
    .from(accountingEntries)
    .groupBy(accountingEntries.accountCode)
    .orderBy(accountingEntries.accountCode);
}

// ── Tax Filings ──────────────────────────────────────────────

export async function createTaxFiling(data: InsertTaxFiling) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(taxFilings).values(data);
}

export async function getAllTaxFilingsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(taxFilings)
    .orderBy(desc(taxFilings.dueDate))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(taxFilings);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateTaxFilingStatus(
  id: number,
  status: "pending" | "prepared" | "filed" | "late",
  filedAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: Record<string, unknown> = { status };
  if (filedAt) data.filedAt = filedAt;
  return await db.update(taxFilings).set(data).where(eq(taxFilings.id, id));
}

export async function getUpcomingFilings() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(taxFilings)
    .where(
      and(eq(taxFilings.status, "pending"), gte(taxFilings.dueDate, new Date()))
    )
    .orderBy(taxFilings.dueDate);
}
```

**Step 2: Create `server/db/inventory.ts`**

```typescript
import { eq, sql, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { inventory, InsertInventoryItem } from "../../drizzle/schema";

export async function createInventoryItem(data: InsertInventoryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(inventory).values(data);
}

export async function getAllInventoryPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(inventory)
    .orderBy(desc(inventory.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventory);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getInventoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(inventory).where(eq(inventory.id, id));
  return rows[0] ?? null;
}

export async function updateInventoryItem(
  id: number,
  data: Partial<InsertInventoryItem>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(inventory).set(data).where(eq(inventory.id, id));
}

export async function deleteInventoryItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(inventory).where(eq(inventory.id, id));
}

export async function getInventorySummary() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      category: inventory.category,
      count: sql<number>`COUNT(*)`,
      totalValue: sql<number>`SUM(${inventory.currentValue})`,
      totalCost: sql<number>`SUM(${inventory.purchaseCost})`,
    })
    .from(inventory)
    .groupBy(inventory.category);
}
```

**Step 3: Update `server/db/index.ts` barrel exports**

Append to `server/db/index.ts`:

```typescript
// Accounting (invoices, journal entries, tax filings)
export {
  createInvoice,
  getAllInvoicesPaginated,
  getInvoiceById,
  updateInvoiceStatus,
  getNextInvoiceSequence,
  createAccountingEntry,
  getAccountingEntriesPaginated,
  getTrialBalance,
  createTaxFiling,
  getAllTaxFilingsPaginated,
  updateTaxFilingStatus,
  getUpcomingFilings,
} from "./accounting";

// Inventory
export {
  createInventoryItem,
  getAllInventoryPaginated,
  getInventoryById,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
} from "./inventory";
```

**Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add server/db/accounting.ts server/db/inventory.ts server/db/index.ts
git commit -m "feat(accounting): add DB helpers for invoices, journal entries, tax filings, inventory"
```

---

## Task 5: tRPC Routes — `server/routes/accounting.ts` and `server/routes/inventory.ts`

**Files:**

- Create: `server/routes/accounting.ts`
- Create: `server/routes/inventory.ts`
- Modify: `server/routers.ts` (register new routers)

**Step 1: Create `server/routes/accounting.ts`**

```typescript
import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createInvoice,
  getAllInvoicesPaginated,
  getInvoiceById,
  updateInvoiceStatus,
  getNextInvoiceSequence,
  createAccountingEntry,
  getAccountingEntriesPaginated,
  getTrialBalance,
  createTaxFiling,
  getAllTaxFilingsPaginated,
  updateTaxFilingStatus,
  getUpcomingFilings,
} from "../db";
import {
  invoiceInputSchema,
  accountingEntryInputSchema,
  taxFilingInputSchema,
  paginationInput,
} from "../../shared/schemas";
import { generateInvoiceNumber } from "../../shared/accounting";

export const accountingRouter = router({
  // ── Invoices ─────────────────────────────────────────────

  createInvoice: secureProtectedProcedure
    .input(invoiceInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const now = new Date();
      const prefix =
        input.type === "tax_invoice"
          ? "INV"
          : input.type === "receipt"
            ? "RCP"
            : "WHT";
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
      const seq = await getNextInvoiceSequence(prefix, yearMonth);
      const invoiceNumber = generateInvoiceNumber(prefix, now, seq);

      await createInvoice({ ...input, invoiceNumber });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "invoice",
        newValue: JSON.stringify({ ...input, invoiceNumber }),
      });
      return { success: true, invoiceNumber };
    }),

  listInvoices: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { items, total } = await getAllInvoicesPaginated(
        input.page,
        input.pageSize
      );
      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  getInvoice: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getInvoiceById(input.id);
    }),

  updateInvoiceStatus: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["unpaid", "paid", "partial", "cancelled"]),
        paymentDate: z
          .string()
          .optional()
          .transform(s => (s ? new Date(s) : undefined)),
        paymentMethod: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateInvoiceStatus(
        input.id,
        input.status,
        input.paymentDate,
        input.paymentMethod
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "invoice",
        resourceId: input.id,
        newValue: JSON.stringify({ status: input.status }),
      });
      return { success: true };
    }),

  // ── Journal Entries ────────────────────────────────────────

  recordEntry: secureProtectedProcedure
    .input(accountingEntryInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createAccountingEntry({
        ...input,
        createdBy: ctx.user?.email ?? "system",
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "accounting_entry",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  listEntries: secureProtectedProcedure
    .input(
      paginationInput.extend({
        accountCode: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const filters = {
        accountCode: input.accountCode,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      };
      const { items, total } = await getAccountingEntriesPaginated(
        input.page,
        input.pageSize,
        filters
      );
      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  trialBalance: secureProtectedProcedure.query(async () => {
    return await getTrialBalance();
  }),

  // ── Tax Filings ────────────────────────────────────────────

  createFiling: secureProtectedProcedure
    .input(taxFilingInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createTaxFiling(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "tax_filing",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  listFilings: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { items, total } = await getAllTaxFilingsPaginated(
        input.page,
        input.pageSize
      );
      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  markFiled: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "prepared", "filed", "late"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const filedAt = input.status === "filed" ? new Date() : undefined;
      await updateTaxFilingStatus(input.id, input.status, filedAt);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tax_filing",
        resourceId: input.id,
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  upcomingDeadlines: secureProtectedProcedure.query(async () => {
    return await getUpcomingFilings();
  }),
});
```

**Step 2: Create `server/routes/inventory.ts`**

```typescript
import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createInventoryItem,
  getAllInventoryPaginated,
  getInventoryById,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
} from "../db";
import { inventoryInputSchema, paginationInput } from "../../shared/schemas";

export const inventoryRouter = router({
  create: secureProtectedProcedure
    .input(inventoryInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      // Auto-calculate monthly depreciation if purchase cost and useful life provided
      const data = { ...input } as Record<string, unknown>;
      if (input.purchaseCost && input.usefulLifeMonths) {
        data.monthlyDepreciation = Math.round(
          input.purchaseCost / input.usefulLifeMonths
        );
        data.currentValue = input.currentValue ?? input.purchaseCost;
      }
      await createInventoryItem(data as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "inventory",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  list: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { items, total } = await getAllInventoryPaginated(
        input.page,
        input.pageSize
      );
      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  get: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getInventoryById(input.id);
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: inventoryInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateInventoryItem(input.id, input.data as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "inventory",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteInventoryItem(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "inventory",
        resourceId: input.id,
      });
      return { success: true };
    }),

  summary: secureProtectedProcedure.query(async () => {
    return await getInventorySummary();
  }),
});
```

**Step 3: Register routers in `server/routers.ts`**

Add imports and merge into appRouter:

```typescript
// Add after existing imports:
import { accountingRouter } from "./routes/accounting";
import { inventoryRouter } from "./routes/inventory";

// Add to appRouter object:
  accounting: accountingRouter,
  inventory: inventoryRouter,
```

**Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add server/routes/accounting.ts server/routes/inventory.ts server/routers.ts
git commit -m "feat(accounting): add tRPC routes for invoices, journal, tax filings, inventory"
```

---

## Task 6: Tests for tRPC Routes

**Files:**

- Create: `server/accounting-routes.test.ts`
- Create: `server/inventory.test.ts`

**Step 1: Create `server/accounting-routes.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, itWithDb } from "./test-helpers";

describe("accounting.createInvoice", () => {
  itWithDb("creates a tax invoice with auto-generated number", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.createInvoice({
      type: "tax_invoice",
      customerName: "David Cohen",
      subtotal: 45000,
      vatAmount: 3150,
      totalAmount: 48150,
      currency: "THB",
    });
    expect(result.success).toBe(true);
    expect(result.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
  });
});

describe("accounting.recordEntry", () => {
  itWithDb("creates an accounting journal entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.recordEntry({
      date: "2026-02-28",
      accountCode: "41000",
      description: "Tour package payment - Cohen family",
      debit: 0,
      credit: 45000,
      currency: "THB",
    });
    expect(result.success).toBe(true);
  });
});

describe("accounting.trialBalance", () => {
  it("returns trial balance (may be empty without DB)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.trialBalance();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("accounting.upcomingDeadlines", () => {
  it("returns upcoming filing deadlines", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.upcomingDeadlines();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

**Step 2: Create `server/inventory.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, itWithDb } from "./test-helpers";

describe("inventory.create", () => {
  itWithDb("creates a vehicle inventory item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.inventory.create({
      name: "Toyota Hilux 4x4 #1",
      category: "vehicle",
      description: "Main tour vehicle",
      purchaseCost: 850000,
      usefulLifeMonths: 60,
      condition: "good",
      quantity: 1,
      location: "Chiang Mai garage",
    });
    expect(result.success).toBe(true);
  });
});

describe("inventory.summary", () => {
  it("returns inventory summary by category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.inventory.summary();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

**Step 3: Run all tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing + new tests pass (non-DB tests pass; DB tests skip gracefully)

**Step 4: Commit**

```bash
git add server/accounting-routes.test.ts server/inventory.test.ts
git commit -m "test(accounting): add route tests for invoices, journal entries, tax filings, inventory"
```

---

## Task 7: Admin Dashboard — Accounting Tab

**Files:**

- Create: `client/src/components/admin/AccountingTab.tsx`
- Modify: `client/src/pages/AdminDashboard.tsx` (add new tab)

This is the largest UI task. The `AccountingTab` component should follow the same pattern as existing admin tabs (e.g., `FinancialTab.tsx`): paginated tables, create/edit modals, action buttons.

**Step 1: Create `AccountingTab.tsx`**

Build a tabbed component with 4 sub-tabs:

1. **Invoices** — List + Create + Status update
2. **Journal** — List + Create entry with account code picker
3. **Tax Calendar** — Filing deadlines with status badges
4. **Inventory** — List + Create + Edit + Delete

Use `trpc.accounting.*` and `trpc.inventory.*` hooks. Follow bilingual `t()` pattern.

The component should display:

- Invoice list with columns: Number, Customer, Type, Amount, Status, Date
- Journal entries with columns: Date, Account, Description, Debit, Credit
- Tax filings with columns: Type, Period, Due Date, Amount, Status
- Inventory with columns: Name, Category, Value, Condition, Location

**Step 2: Add tab to AdminDashboard.tsx**

Add `"Accounting"` to the tabs array and import `AccountingTab`. Wire it into the tab rendering switch.

**Step 3: Type-check and test**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add client/src/components/admin/AccountingTab.tsx client/src/pages/AdminDashboard.tsx
git commit -m "feat(accounting): add Accounting tab to admin dashboard — invoices, journal, tax, inventory"
```

---

## Task 8: Final Integration & Verification

**Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run dev server and verify**

Run: `pnpm dev`
Verify: Navigate to `/admin` → Accounting tab should appear and render without errors

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(accounting): complete accounting system — invoices, journal, tax, inventory

Adds 4 new DB tables, shared tax calculators (VAT/WHT/CIT), tRPC routes,
admin UI tab with invoices, journal entries, tax filing calendar, and
inventory management. Includes 20+ new tests."
```

---

## Summary

| Task | What                    | Files                                                          | Tests         |
| ---- | ----------------------- | -------------------------------------------------------------- | ------------- |
| 1    | DB Schema (4 tables)    | `drizzle/schema.ts`                                            | type-check    |
| 2    | Shared accounting utils | `shared/accounting.ts`                                         | 16 unit tests |
| 3    | Zod schemas             | `shared/schemas.ts`                                            | type-check    |
| 4    | DB helpers              | `server/db/accounting.ts`, `server/db/inventory.ts`            | type-check    |
| 5    | tRPC routes             | `server/routes/accounting.ts`, `server/routes/inventory.ts`    | type-check    |
| 6    | Route tests             | `server/accounting-routes.test.ts`, `server/inventory.test.ts` | 6 route tests |
| 7    | Admin UI                | `client/src/components/admin/AccountingTab.tsx`                | manual verify |
| 8    | Integration             | all files                                                      | full suite    |

**Total new files:** 7
**Total modified files:** 4
**Total new tests:** ~22
**Estimated commits:** 8
