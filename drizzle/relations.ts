import { relations } from "drizzle-orm";
import { bookings, agents, financialRecords, payments } from "./schema";

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  agent: one(agents, {
    fields: [bookings.assignedAgentId],
    references: [agents.id],
  }),
  financialRecords: many(financialRecords),
  payments: many(payments),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  bookings: many(bookings),
}));

export const financialRecordsRelations = relations(financialRecords, ({ one }) => ({
  booking: one(bookings, {
    fields: [financialRecords.bookingId],
    references: [bookings.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));
