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

const INVOICE_PREFIX: Record<string, string> = {
  tax_invoice: "INV",
  receipt: "RCP",
  wht_certificate: "WHT",
};

export const accountingRouter = router({
  // ── Invoices ────────────────────────────────────────────────

  createInvoice: secureProtectedProcedure
    .input(invoiceInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const prefix = INVOICE_PREFIX[input.type];
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yearMonth = `${yyyy}${mm}`;
      const sequence = await getNextInvoiceSequence(prefix, yearMonth);
      const invoiceNumber = generateInvoiceNumber(prefix, now, sequence);

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
      const { page, pageSize } = input;
      const { items, total } = await getAllInvoicesPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
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
        paymentDate: z.string().optional(),
        paymentMethod: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const paymentDate = input.paymentDate
        ? new Date(input.paymentDate)
        : undefined;
      await updateInvoiceStatus(
        input.id,
        input.status,
        paymentDate,
        input.paymentMethod
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "invoice",
        resourceId: input.id,
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  // ── Journal Entries ─────────────────────────────────────────

  recordEntry: secureProtectedProcedure
    .input(accountingEntryInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const createdBy = ctx.user?.email ?? "system";
      await createAccountingEntry({ ...input, createdBy });
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
      const { page, pageSize, accountCode, startDate, endDate } = input;
      const { items, total } = await getAccountingEntriesPaginated(
        page,
        pageSize,
        { accountCode, startDate, endDate }
      );
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  trialBalance: secureProtectedProcedure.query(async () => {
    return await getTrialBalance();
  }),

  // ── Tax Filings ─────────────────────────────────────────────

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
      const { page, pageSize } = input;
      const { items, total } = await getAllTaxFilingsPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
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
