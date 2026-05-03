import { eq, and, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { chatSessions, chatMessages } from "../../drizzle/schema";

export async function createChatSession(data: {
  visitorId: string;
  language: "en" | "he";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(chatSessions)
    .values({ visitorId: data.visitorId, language: data.language })
    .$returningId();
  return result.id;
}

export async function getChatSessionByVisitorId(visitorId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.visitorId, visitorId),
        sql`${chatSessions.mode} != 'closed'`
      )
    )
    .orderBy(desc(chatSessions.createdAt), desc(chatSessions.id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getChatMessagesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

export async function addChatMessage(data: {
  sessionId: number;
  role: "visitor" | "ai" | "agent";
  content: string;
  metadata?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(chatMessages)
    .values({
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata ?? null,
    })
    .$returningId();
  return result.id;
}

export async function updateChatSessionMode(
  id: number,
  mode: "ai" | "human" | "closed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ mode })
    .where(eq(chatSessions.id, id));
}

export async function updateChatSessionSummary(id: number, summary: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ summary })
    .where(eq(chatSessions.id, id));
}

export async function updateChatSessionBookingContext(
  id: number,
  bookingContext: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ bookingContext })
    .where(eq(chatSessions.id, id));
}

export async function closeChatSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ mode: "closed", closedAt: new Date() })
    .where(eq(chatSessions.id, id));
}

export async function getAllChatSessionsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(chatSessions)
    .orderBy(desc(chatSessions.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatSessions);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
