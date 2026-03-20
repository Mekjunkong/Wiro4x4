import { eq, desc, sql, and, gte } from "drizzle-orm";
import { getDb } from "./connection";
import { whatsappMessages, InsertWhatsAppMessage } from "../../drizzle/schema";

export async function createWhatsAppMessage(msg: InsertWhatsAppMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(whatsappMessages).values(msg).$returningId();
  return result.id;
}

export async function getAllWhatsAppMessagesPaginated(
  page = 1,
  pageSize = 20,
  phoneFilter?: string
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const offset = (page - 1) * pageSize;
  const conditions = phoneFilter
    ? eq(whatsappMessages.phoneNumber, phoneFilter)
    : undefined;

  const items = await db
    .select()
    .from(whatsappMessages)
    .where(conditions)
    .orderBy(desc(whatsappMessages.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countQuery = phoneFilter
    ? db
        .select({ count: sql<number>`count(*)` })
        .from(whatsappMessages)
        .where(eq(whatsappMessages.phoneNumber, phoneFilter))
    : db.select({ count: sql<number>`count(*)` }).from(whatsappMessages);

  const countResult = await countQuery;
  const total = Number(countResult[0]?.count ?? 0);

  return { items, total };
}

export async function getWhatsAppMessageStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalMessages: 0,
      incomingMessages: 0,
      outgoingMessages: 0,
      autoReplies: 0,
      uniqueContacts: 0,
      messagesToday: 0,
      autoRepliesToday: 0,
    };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappMessages);

  const [incomingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.direction, "incoming"));

  const [outgoingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.direction, "outgoing"));

  const [autoReplyResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappMessages)
    .where(eq(whatsappMessages.isAutoReply, 1));

  const [uniqueContactsResult] = await db
    .select({
      count: sql<number>`count(distinct ${whatsappMessages.phoneNumber})`,
    })
    .from(whatsappMessages);

  const [todayResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappMessages)
    .where(gte(whatsappMessages.createdAt, todayStart));

  const [autoReplyTodayResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappMessages)
    .where(
      and(
        eq(whatsappMessages.isAutoReply, 1),
        gte(whatsappMessages.createdAt, todayStart)
      )
    );

  return {
    totalMessages: Number(totalResult?.count ?? 0),
    incomingMessages: Number(incomingResult?.count ?? 0),
    outgoingMessages: Number(outgoingResult?.count ?? 0),
    autoReplies: Number(autoReplyResult?.count ?? 0),
    uniqueContacts: Number(uniqueContactsResult?.count ?? 0),
    messagesToday: Number(todayResult?.count ?? 0),
    autoRepliesToday: Number(autoReplyTodayResult?.count ?? 0),
  };
}

export async function updateWhatsAppMessageStatus(
  whatsappMessageId: string,
  status: "sent" | "delivered" | "read" | "failed"
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(whatsappMessages)
    .set({ status })
    .where(eq(whatsappMessages.whatsappMessageId, whatsappMessageId));
}
