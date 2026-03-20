import { relations } from "drizzle-orm";
import {
  bookings,
  agents,
  leads,
  financialRecords,
  payments,
  chatSessions,
  chatMessages,
  tours,
  tourAvailability,
  tripPhotoAlbums,
  tripPhotos,
} from "./schema";

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

export const leadsRelations = relations(leads, ({ one }) => ({
  convertedBooking: one(bookings, {
    fields: [leads.convertedToBookingId],
    references: [bookings.id],
  }),
}));

export const financialRecordsRelations = relations(
  financialRecords,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [financialRecords.bookingId],
      references: [bookings.id],
    }),
  })
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  availability: many(tourAvailability),
}));

export const tourAvailabilityRelations = relations(
  tourAvailability,
  ({ one }) => ({
    tour: one(tours, {
      fields: [tourAvailability.tourId],
      references: [tours.id],
    }),
  })
);

export const tripPhotoAlbumsRelations = relations(
  tripPhotoAlbums,
  ({ one, many }) => ({
    booking: one(bookings, {
      fields: [tripPhotoAlbums.bookingId],
      references: [bookings.id],
    }),
    photos: many(tripPhotos),
  })
);

export const tripPhotosRelations = relations(tripPhotos, ({ one }) => ({
  album: one(tripPhotoAlbums, {
    fields: [tripPhotos.albumId],
    references: [tripPhotoAlbums.id],
  }),
}));
