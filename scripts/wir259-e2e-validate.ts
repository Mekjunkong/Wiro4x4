import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { eq } from "drizzle-orm";
import { getDb } from "../server/db/connection";
import { bookings, postTourReviewRequests } from "../drizzle/schema";
import {
  schedulePostTourReviewForBooking,
  processDuePostTourReviewRequests,
  recordPostTourReviewOpenedByMessageId,
  trackPostTourReviewLinkClick,
  trackPostTourReviewSubmission,
  getPostTourReviewEntry,
  getWeeklyPostTourReviewMetric,
} from "../server/postTourReviewService";

type InsertResult = { insertId?: number } | Array<{ insertId?: number }>;

async function run() {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const now = Date.now();
  const arrival = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const departure = new Date(now - 2 * 24 * 60 * 60 * 1000);

  const bookingInsert = await db.insert(bookings).values({
    contactName: `WIR-259 QA ${now}`,
    contactPhone: "66999990000",
    contactWhatsApp: "66999990000",
    contactEmail: `wir259-${now}@example.com`,
    arrivalDate: arrival,
    departureDate: departure,
    pickupPoint: "Chiang Mai hotel",
    dropoffPoint: "Chiang Mai hotel",
    status: "completed",
  });

  const insertResult = bookingInsert as InsertResult;
  const bookingId = Number(
    (Array.isArray(insertResult)
      ? insertResult[0]?.insertId
      : insertResult.insertId) ?? 0
  );
  if (!bookingId) throw new Error("Failed to create booking");

  try {
    const scheduled = await schedulePostTourReviewForBooking({
      bookingId,
      delayMinutes: 30,
    });

    await db
      .update(postTourReviewRequests)
      .set({
        scheduledAt: new Date(Date.now() - 5 * 60 * 1000),
        status: "scheduled",
      })
      .where(eq(postTourReviewRequests.id, scheduled.id));

    const processResult = await processDuePostTourReviewRequests();

    const fakeMessageId = `wamid.fake.${now}`;
    await db
      .update(postTourReviewRequests)
      .set({
        status: "sent",
        sentAt: new Date(),
        whatsappMessageId: fakeMessageId,
      })
      .where(eq(postTourReviewRequests.id, scheduled.id));

    await recordPostTourReviewOpenedByMessageId(fakeMessageId);
    await trackPostTourReviewLinkClick(scheduled.id);
    await trackPostTourReviewSubmission({
      reviewRequestId: scheduled.id,
      bookingId,
      rating: 3,
      text: "QA low-rating escalation path check",
      reviewerName: "WIR259 QA",
    });

    const finalEntry = await getPostTourReviewEntry(bookingId);
    const weekly = await getWeeklyPostTourReviewMetric();

    const result = {
      bookingId,
      requestId: scheduled.id,
      processResult,
      finalStatus: finalEntry?.reviewedAt ? "reviewed" : "not_reviewed",
      openedAt: finalEntry?.openedAt ?? null,
      clickedAt: finalEntry?.clickedAt ?? null,
      reviewedAt: finalEntry?.reviewedAt ?? null,
      rating: finalEntry?.rating ?? null,
      escalatedAt: finalEntry?.escalatedAt ?? null,
      opsFollowUpUrl: finalEntry?.opsFollowUpUrl ?? null,
      weeklySnapshot: {
        completionRate: weekly.completionRate,
        requestsSent: weekly.requestsSent,
        reviewed: weekly.reviewed,
        lowRatingCount: weekly.lowRatingCount,
      },
      environment: {
        whatsappConfigured: Boolean(
          process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
        ),
      },
    };

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await db
      .delete(postTourReviewRequests)
      .where(eq(postTourReviewRequests.bookingId, bookingId));
    await db.delete(bookings).where(eq(bookings.id, bookingId));
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
