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
      label: "WHT PND.3 (\u0E20.\u0E07.\u0E14.3)",
    },
    {
      type: "wht_pnd53",
      dueDate: `${nextYear}-${pad(nextMonth)}-07`,
      label: "WHT PND.53 (\u0E20.\u0E07.\u0E14.53)",
    },
    {
      type: "vat_pp30",
      dueDate: `${nextYear}-${pad(nextMonth)}-15`,
      label: "VAT PP.30 (\u0E20.\u0E1E.30)",
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
  return `\u0E3F${amount.toLocaleString("en-US")}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Chart of Accounts ────────────────────────────────────────

export const CHART_OF_ACCOUNTS = {
  // Revenue
  "41000": {
    nameTh:
      "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E08\u0E32\u0E01\u0E41\u0E1E\u0E47\u0E04\u0E40\u0E01\u0E08\u0E17\u0E31\u0E27\u0E23\u0E4C",
    nameEn: "Tour Package Sales",
    type: "revenue",
  },
  "41100": {
    nameTh:
      "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E17\u0E31\u0E27\u0E23\u0E4C\u0E23\u0E32\u0E22\u0E27\u0E31\u0E19",
    nameEn: "Day Trip Revenue",
    type: "revenue",
  },
  "41200": {
    nameTh:
      "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E2A\u0E48\u0E07\u0E2A\u0E19\u0E32\u0E21\u0E1A\u0E34\u0E19",
    nameEn: "Airport Transfer Revenue",
    type: "revenue",
  },
  "41300": {
    nameTh:
      "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E17\u0E31\u0E27\u0E23\u0E4C\u0E1E\u0E34\u0E40\u0E28\u0E29",
    nameEn: "Custom Tour Revenue",
    type: "revenue",
  },
  "42000": {
    nameTh:
      "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E04\u0E48\u0E32\u0E19\u0E32\u0E22\u0E2B\u0E19\u0E49\u0E32",
    nameEn: "Commission Income",
    type: "revenue",
  },
  "49000": {
    nameTh: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E2D\u0E37\u0E48\u0E19",
    nameEn: "Other Income",
    type: "revenue",
  },
  "49100": {
    nameTh:
      "\u0E01\u0E33\u0E44\u0E23\u0E08\u0E32\u0E01\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E41\u0E25\u0E01\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19",
    nameEn: "Foreign Exchange Gain",
    type: "revenue",
  },
  // Cost of Sales
  "51000": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E42\u0E04\u0E40\u0E0A\u0E2D\u0E23\u0E4C",
    nameEn: "Kosher Hotel & Accommodation",
    type: "cost",
  },
  "51100": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E42\u0E04\u0E40\u0E0A\u0E2D\u0E23\u0E4C",
    nameEn: "Kosher Food & Catering",
    type: "cost",
  },
  "51200": {
    nameTh: "\u0E04\u0E48\u0E32\u0E02\u0E19\u0E2A\u0E48\u0E07",
    nameEn: "Transportation",
    type: "cost",
  },
  "51300": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E44\u0E01\u0E14\u0E4C\u0E19\u0E33\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27",
    nameEn: "Tour Guide Fees",
    type: "cost",
  },
  "51400": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E40\u0E02\u0E49\u0E32\u0E0A\u0E21/\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21",
    nameEn: "Entrance Fees & Activities",
    type: "cost",
  },
  "51500": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E15\u0E31\u0E4B\u0E27\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E1A\u0E34\u0E19\u0E43\u0E19\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28",
    nameEn: "Domestic Flights",
    type: "cost",
  },
  "51600": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07",
    nameEn: "Travel Insurance",
    type: "cost",
  },
  // Operating Expenses
  "61000": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19",
    nameEn: "Office Rent",
    type: "expense",
  },
  "61100": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E2A\u0E32\u0E18\u0E32\u0E23\u0E13\u0E39\u0E1B\u0E42\u0E20\u0E04",
    nameEn: "Utilities",
    type: "expense",
  },
  "61200": {
    nameTh:
      "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19/\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2A\u0E31\u0E07\u0E04\u0E21",
    nameEn: "Staff Salaries & SS",
    type: "expense",
  },
  "61300": {
    nameTh: "\u0E04\u0E48\u0E32\u0E01\u0E32\u0E23\u0E15\u0E25\u0E32\u0E14",
    nameEn: "Marketing & Advertising",
    type: "expense",
  },
  "61400": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E40\u0E27\u0E47\u0E1A\u0E44\u0E0B\u0E15\u0E4C/\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35",
    nameEn: "Website & Technology",
    type: "expense",
  },
  "61500": {
    nameTh: "\u0E04\u0E48\u0E32\u0E27\u0E34\u0E0A\u0E32\u0E0A\u0E35\u0E1E",
    nameEn: "Professional Fees",
    type: "expense",
  },
  "61600": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E18\u0E23\u0E23\u0E21\u0E40\u0E19\u0E35\u0E22\u0E21\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23/FX",
    nameEn: "Bank Charges & FX Fees",
    type: "expense",
  },
  "61700": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E27\u0E31\u0E2A\u0E14\u0E38\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19",
    nameEn: "Office Supplies",
    type: "expense",
  },
  "61800": {
    nameTh: "\u0E04\u0E48\u0E32\u0E2A\u0E37\u0E48\u0E2D\u0E2A\u0E32\u0E23",
    nameEn: "Communication",
    type: "expense",
  },
  "61900": {
    nameTh:
      "\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E40\u0E1A\u0E47\u0E14\u0E40\u0E15\u0E25\u0E47\u0E14",
    nameEn: "Miscellaneous",
    type: "expense",
  },
  "69100": {
    nameTh:
      "\u0E02\u0E32\u0E14\u0E17\u0E38\u0E19\u0E08\u0E32\u0E01\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E41\u0E25\u0E01\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19",
    nameEn: "Foreign Exchange Loss",
    type: "expense",
  },
} as const;

export type AccountCode = keyof typeof CHART_OF_ACCOUNTS;
