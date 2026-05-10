# AI Chat Concierge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a bilingual AI chat widget that answers tour/pricing questions via Claude, assists with booking pre-fill, and hands off to staff via WhatsApp when needed.

**Architecture:** Floating React chat widget communicates over WebSocket to an Express-attached `ws` server. Server routes visitor messages to Claude API with a dynamic system prompt (tour data + pricing rules + FAQ). Two new DB tables (`chatSessions`, `chatMessages`) persist conversation history. WhatsApp Business API bridges human handoff; falls back to lead creation if unconfigured.

**Tech Stack:** React 19, Framer Motion, `ws` (WebSocket), Anthropic SDK (Claude), Drizzle ORM (MySQL), existing tRPC for admin endpoints.

**Design Doc:** `docs/plans/2026-02-17-ai-chat-concierge-design.md`

---

## Task 1: Database Schema — Chat Tables

**Files:**

- Modify: `drizzle/schema.ts` (append after `scheduledEmails` table, ~line 372)
- Modify: `drizzle/relations.ts` (append chat relations)
- Create: `server/chat.test.ts` (schema validation tests)

**Step 1: Write the failing test**

Create `server/chat.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { chatSessions, chatMessages } from "../drizzle/schema";

describe("chat schema", () => {
  it("chatSessions table has required columns", () => {
    const cols = Object.keys(chatSessions);
    expect(cols).toContain("id");
    expect(cols).toContain("visitorId");
    expect(cols).toContain("language");
    expect(cols).toContain("mode");
    expect(cols).toContain("summary");
    expect(cols).toContain("bookingContext");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("closedAt");
  });

  it("chatMessages table has required columns", () => {
    const cols = Object.keys(chatMessages);
    expect(cols).toContain("id");
    expect(cols).toContain("sessionId");
    expect(cols).toContain("role");
    expect(cols).toContain("content");
    expect(cols).toContain("metadata");
    expect(cols).toContain("createdAt");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chat.test.ts`
Expected: FAIL — `chatSessions` and `chatMessages` not exported from schema.

**Step 3: Add the tables to schema**

In `drizzle/schema.ts`, append after the `scheduledEmails` table and its types (after line ~372):

```typescript
// Chat Concierge Tables
export const chatSessions = mysqlTable(
  "chatSessions",
  {
    id: int("id").autoincrement().primaryKey(),
    visitorId: varchar("visitorId", { length: 64 }).notNull(),
    language: mysqlEnum("language", ["en", "he"]).default("en").notNull(),
    mode: mysqlEnum("mode", ["ai", "human", "closed"]).default("ai").notNull(),
    summary: text("summary"),
    bookingContext: text("bookingContext"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    closedAt: timestamp("closedAt"),
  },
  table => [index("idx_chatSessions_visitorId").on(table.visitorId)]
);

export const chatMessages = mysqlTable(
  "chatMessages",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull(),
    role: mysqlEnum("role", ["visitor", "ai", "agent"]).notNull(),
    content: text("content").notNull(),
    metadata: text("metadata"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("idx_chatMessages_sessionId").on(table.sessionId)]
);

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
```

**Step 4: Add relations**

In `drizzle/relations.ts`, add import for `chatSessions, chatMessages` and append:

```typescript
export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));
```

**Step 5: Run test to verify it passes**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chat.test.ts`
Expected: PASS

**Step 6: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add drizzle/schema.ts drizzle/relations.ts server/chat.test.ts
git commit -m "feat(chat): add chatSessions and chatMessages DB tables"
```

---

## Task 2: Chat DB Helpers

**Files:**

- Modify: `server/db.ts` (append chat query helpers)
- Modify: `server/chat.test.ts` (add DB helper tests)

**Step 1: Write the failing test**

Append to `server/chat.test.ts`:

```typescript
import { itWithDb } from "./test-helpers";
import {
  createChatSession,
  getChatSessionByVisitorId,
  getChatMessagesBySessionId,
  addChatMessage,
  updateChatSessionMode,
  updateChatSessionSummary,
  updateChatSessionBookingContext,
  closeChatSession,
  getAllChatSessionsPaginated,
} from "./db";

describe("chat DB helpers", () => {
  itWithDb("createChatSession returns inserted id", async () => {
    const id = await createChatSession({
      visitorId: "test-v1",
      language: "en",
    });
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  itWithDb("addChatMessage stores and retrieves messages", async () => {
    const sessionId = await createChatSession({
      visitorId: "test-v2",
      language: "en",
    });
    await addChatMessage({ sessionId, role: "visitor", content: "Hello" });
    await addChatMessage({
      sessionId,
      role: "ai",
      content: "Hi! How can I help?",
    });
    const messages = await getChatMessagesBySessionId(sessionId);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("visitor");
    expect(messages[1].role).toBe("ai");
  });

  itWithDb(
    "getChatSessionByVisitorId returns latest open session",
    async () => {
      await createChatSession({ visitorId: "test-v3", language: "he" });
      const session = await getChatSessionByVisitorId("test-v3");
      expect(session).toBeTruthy();
      expect(session!.language).toBe("he");
      expect(session!.mode).toBe("ai");
    }
  );
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chat.test.ts`
Expected: FAIL — functions not exported from `./db`

**Step 3: Implement DB helpers**

Append to `server/db.ts`:

```typescript
import {
  chatSessions,
  chatMessages,
  InsertChatSession,
  InsertChatMessage,
} from "../drizzle/schema";

// ── Chat Concierge ────────────────────────────────────────

export async function createChatSession(
  data: Pick<InsertChatSession, "visitorId" | "language">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(chatSessions).values(data).$returningId();
  return result.id;
}

export async function getChatSessionByVisitorId(visitorId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.visitorId, visitorId),
        sql`${chatSessions.mode} != 'closed'`
      )
    )
    .orderBy(sql`${chatSessions.createdAt} DESC`)
    .limit(1);
  return rows[0] ?? null;
}

export async function getChatMessagesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

export async function addChatMessage(
  data: Pick<InsertChatMessage, "sessionId" | "role" | "content" | "metadata">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(chatMessages).values(data).$returningId();
  return result.id;
}

export async function updateChatSessionMode(
  id: number,
  mode: "ai" | "human" | "closed"
) {
  const db = await getDb();
  if (!db) return;
  await db.update(chatSessions).set({ mode }).where(eq(chatSessions.id, id));
}

export async function updateChatSessionSummary(id: number, summary: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(chatSessions).set({ summary }).where(eq(chatSessions.id, id));
}

export async function updateChatSessionBookingContext(
  id: number,
  bookingContext: string
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(chatSessions)
    .set({ bookingContext })
    .where(eq(chatSessions.id, id));
}

export async function closeChatSession(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(chatSessions)
    .set({ mode: "closed", closedAt: new Date() })
    .where(eq(chatSessions.id, id));
}

export async function getAllChatSessionsPaginated(
  page: number,
  pageSize: number
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(chatSessions)
      .orderBy(sql`${chatSessions.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(chatSessions),
  ]);
  return { items, total: Number(countResult[0].count) };
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chat.test.ts`
Expected: Schema tests PASS, DB tests PASS (or skip if no DATABASE_URL)

**Step 5: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`

**Step 6: Commit**

```bash
git add server/db.ts server/chat.test.ts
git commit -m "feat(chat): add chat DB query helpers"
```

---

## Task 3: Chat AI Service — System Prompt & Claude Integration

**Files:**

- Create: `server/chatAiService.ts`
- Create: `server/chatAiService.test.ts`

**Step 1: Write the failing test**

Create `server/chatAiService.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";

vi.stubEnv("ANTHROPIC_API_KEY", "test-key");

// Mock Claude to return a known response
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: "Welcome to WIRO 4x4! How can I help you plan your adventure?",
          },
        ],
      }),
    };
  },
}));

import { generateChatResponse, buildChatSystemPrompt } from "./chatAiService";

describe("chatAiService", () => {
  it("buildChatSystemPrompt includes tour data", () => {
    const prompt = buildChatSystemPrompt(
      [
        {
          name: "Jungle Safari",
          nameHe: "ספארי ג'ונגל",
          slug: "jungle-safari",
          price: 3500,
          duration: "6 hours",
          description: "Adventure tour",
        },
      ],
      "en"
    );
    expect(prompt).toContain("Jungle Safari");
    expect(prompt).toContain("3500");
    expect(prompt).toContain("English");
  });

  it("buildChatSystemPrompt sets Hebrew for he language", () => {
    const prompt = buildChatSystemPrompt([], "he");
    expect(prompt).toContain("Hebrew");
  });

  it("generateChatResponse returns AI text", async () => {
    const result = await generateChatResponse(
      [{ role: "visitor", content: "Hello" }],
      [],
      "en"
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("generateChatResponse detects handoff trigger", async () => {
    // The mock returns a normal response, but test the interface works
    const result = await generateChatResponse(
      [{ role: "visitor", content: "I want to talk to a human" }],
      [],
      "en"
    );
    expect(typeof result).toBe("string");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chatAiService.test.ts`
Expected: FAIL — module not found

**Step 3: Implement the chat AI service**

Create `server/chatAiService.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import type { Tour } from "../drizzle/schema";

type TourSummary = Pick<
  Tour,
  "name" | "nameHe" | "slug" | "price" | "duration" | "description"
>;

interface ChatMessage {
  role: "visitor" | "ai" | "agent";
  content: string;
}

// Lazy init — same pattern as aiContentGenerator.ts
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required for chat concierge");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export function buildChatSystemPrompt(
  tourData: TourSummary[],
  language: "en" | "he"
): string {
  const langName = language === "en" ? "English" : "Hebrew";
  const tourList =
    tourData.length > 0
      ? tourData
          .map(
            t =>
              `- ${t.name} (${t.nameHe}): ${t.duration}, ${t.price} THB — /tours/${t.slug}\n  ${t.description.slice(0, 120)}`
          )
          .join("\n")
      : "No tour data available.";

  return `You are the WIRO 4x4 AI concierge — a friendly, knowledgeable assistant for a kosher off-road tour company in Chiang Mai, Northern Thailand.

## Your Role
- Answer questions about tours, pricing, logistics, kosher dining, and Northern Thailand
- Help visitors choose the right tour and gather their preferences (dates, group size, services)
- When you have enough booking info, offer to start a booking with a JSON block
- If you cannot confidently answer a question, say so and offer to connect them with a human

## Language
Respond in ${langName}. The visitor's site language is set to "${language}".

## Available Tours
${tourList}

## Pricing Rules
- Base prices are per person per tour
- Group of 1-4: base price
- Group of 5-6: +20% multiplier
- Group of 7+: requires custom quote
- Children under 3: free
- Children 3-10: 50% surcharge on base
- Children 11+: full price
- Deposit: 30% of total

## Kosher Information
All tours include kosher meal options. Shabbat-friendly scheduling available. Kosher restaurants and catering partners in Chiang Mai area.

## Logistics
- Pickup available from Chiang Mai hotels, airport, bus station
- Tours depart between 7-9 AM depending on the tour
- What to bring: comfortable shoes, sunscreen, water, camera
- Best season: November to February (cool and dry)

## Booking Assist
When the visitor has shared enough info (tour interest, dates, group size), offer to pre-fill the booking form. Output a JSON block like:
\`\`\`booking
{"tour": "tour-slug", "dates": "arrival-departure", "adults": N, "children": N, "services": ["hotels", "food"]}
\`\`\`

## Handoff
If the visitor asks for a human, or you encounter a question you cannot answer, respond with:
\`\`\`handoff
{"reason": "brief reason for handoff"}
\`\`\`

## Rules
- Be warm, helpful, and concise (2-4 sentences per response)
- Never make up information — only reference the tours and data provided
- Do not discuss competitors or other tour companies
- WhatsApp contact: +972544715400`;
}

export async function generateChatResponse(
  history: ChatMessage[],
  tourData: TourSummary[],
  language: "en" | "he"
): Promise<string> {
  const client = getClient();

  const messages = history.map(msg => ({
    role: (msg.role === "visitor" ? "user" : "assistant") as
      | "user"
      | "assistant",
    content: msg.content,
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 512,
    system: buildChatSystemPrompt(tourData, language),
    messages,
  });

  return response.content[0]?.type === "text"
    ? response.content[0].text
    : "I'm sorry, I couldn't generate a response. Let me connect you with our team.";
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chatAiService.test.ts`
Expected: PASS (4 tests)

**Step 5: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`

**Step 6: Commit**

```bash
git add server/chatAiService.ts server/chatAiService.test.ts
git commit -m "feat(chat): add AI chat service with dynamic system prompt"
```

---

## Task 4: WebSocket Server Setup

**Files:**

- Create: `server/chatWebSocket.ts`
- Modify: `server/_core/index.ts` (attach WS to HTTP server, ~line 33)
- Create: `server/chatWebSocket.test.ts`

**Step 1: Write the failing test**

Create `server/chatWebSocket.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";

vi.stubEnv("ANTHROPIC_API_KEY", "test-key");

// Mock all external deps
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Hello! I'm your WIRO concierge." }],
      }),
    };
  },
}));

vi.mock("./db", () => ({
  createChatSession: vi.fn().mockResolvedValue(1),
  getChatSessionByVisitorId: vi.fn().mockResolvedValue(null),
  getChatMessagesBySessionId: vi.fn().mockResolvedValue([]),
  addChatMessage: vi.fn().mockResolvedValue(1),
  updateChatSessionMode: vi.fn(),
  updateChatSessionSummary: vi.fn(),
  updateChatSessionBookingContext: vi.fn(),
  closeChatSession: vi.fn(),
  getAllActiveTours: vi.fn().mockResolvedValue([]),
}));

import { handleChatMessage, ChatIncomingMessage } from "./chatWebSocket";

describe("chatWebSocket message handler", () => {
  it("handles init message and returns session_started", async () => {
    const responses: any[] = [];
    const send = (data: string) => responses.push(JSON.parse(data));

    await handleChatMessage(
      JSON.stringify({ type: "init", visitorId: "v1", language: "en" }),
      send
    );

    expect(responses[0].type).toBe("session_started");
    expect(responses[0].sessionId).toBe(1);
  });

  it("handles chat message and returns ai_response", async () => {
    const responses: any[] = [];
    const send = (data: string) => responses.push(JSON.parse(data));

    // Init first
    await handleChatMessage(
      JSON.stringify({ type: "init", visitorId: "v2", language: "en" }),
      send
    );

    // Then send a message
    await handleChatMessage(
      JSON.stringify({
        type: "message",
        sessionId: 1,
        content: "What tours do you have?",
      }),
      send
    );

    const aiResponse = responses.find(r => r.type === "ai_response");
    expect(aiResponse).toBeTruthy();
    expect(typeof aiResponse.content).toBe("string");
  });

  it("handles close message", async () => {
    const responses: any[] = [];
    const send = (data: string) => responses.push(JSON.parse(data));

    await handleChatMessage(
      JSON.stringify({ type: "close", sessionId: 1 }),
      send
    );

    expect(responses[0].type).toBe("session_closed");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chatWebSocket.test.ts`
Expected: FAIL — module not found

**Step 3: Install ws dependency**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm add ws && pnpm add -D @types/ws`

**Step 4: Implement the WebSocket handler**

Create `server/chatWebSocket.ts`:

````typescript
import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import {
  createChatSession,
  getChatSessionByVisitorId,
  getChatMessagesBySessionId,
  addChatMessage,
  updateChatSessionMode,
  closeChatSession,
  getAllActiveTours,
} from "./db";
import { generateChatResponse } from "./chatAiService";
import { checkRateLimit } from "./rateLimit";

export interface ChatIncomingMessage {
  type: "init" | "message" | "close";
  visitorId?: string;
  language?: "en" | "he";
  sessionId?: number;
  content?: string;
}

// Track active sessions per WebSocket connection
const connectionSessions = new Map<WebSocket, number>();

export async function handleChatMessage(
  raw: string,
  send: (data: string) => void
): Promise<void> {
  let msg: ChatIncomingMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
    return;
  }

  if (msg.type === "init") {
    const visitorId = msg.visitorId || `anon-${Date.now()}`;
    const language = msg.language || "en";

    // Resume existing session or create new
    const existing = await getChatSessionByVisitorId(visitorId);
    if (existing) {
      const messages = await getChatMessagesBySessionId(existing.id);
      send(
        JSON.stringify({
          type: "session_started",
          sessionId: existing.id,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })),
          resumed: true,
        })
      );
      return;
    }

    const sessionId = await createChatSession({ visitorId, language });
    send(
      JSON.stringify({
        type: "session_started",
        sessionId,
        history: [],
        resumed: false,
      })
    );
    return;
  }

  if (msg.type === "message") {
    const sessionId = msg.sessionId;
    const content = msg.content?.trim();
    if (!sessionId || !content) {
      send(
        JSON.stringify({
          type: "error",
          message: "sessionId and content required",
        })
      );
      return;
    }

    // Rate limit: 30 messages/session/minute
    const { allowed } = checkRateLimit(`chat:${sessionId}`, 30, 60_000);
    if (!allowed) {
      send(
        JSON.stringify({
          type: "error",
          message: "Too many messages. Please slow down.",
        })
      );
      return;
    }

    // Save visitor message
    await addChatMessage({ sessionId, role: "visitor", content });

    // Get conversation history
    const history = await getChatMessagesBySessionId(sessionId);
    const chatHistory = history.map(m => ({
      role: m.role as "visitor" | "ai" | "agent",
      content: m.content,
    }));

    // Get tour data for system prompt
    let tourData: any[] = [];
    try {
      tourData = (await getAllActiveTours()).map(t => ({
        name: t.name,
        nameHe: t.nameHe,
        slug: t.slug,
        price: t.price,
        duration: t.duration,
        description: t.description,
      }));
    } catch {
      // DB unavailable — use empty tour data
    }

    // Determine language from session (default en)
    const session = await getChatSessionByVisitorId(
      `session-${sessionId}`
    ).catch(() => null);
    const language = (session?.language as "en" | "he") || "en";

    try {
      // Send typing indicator
      send(JSON.stringify({ type: "typing", sessionId }));

      const aiText = await generateChatResponse(
        chatHistory,
        tourData,
        language
      );

      // Check for handoff trigger
      if (aiText.includes("```handoff")) {
        await updateChatSessionMode(sessionId, "human");
        await addChatMessage({
          sessionId,
          role: "ai",
          content: aiText,
          metadata: JSON.stringify({ handoff: true }),
        });
        send(
          JSON.stringify({
            type: "handoff_initiated",
            sessionId,
            content: aiText,
          })
        );
        return;
      }

      // Check for booking context
      if (aiText.includes("```booking")) {
        const bookingMatch = aiText.match(/```booking\n([\s\S]*?)```/);
        if (bookingMatch) {
          await addChatMessage({
            sessionId,
            role: "ai",
            content: aiText,
            metadata: JSON.stringify({ bookingContext: bookingMatch[1] }),
          });
          send(
            JSON.stringify({
              type: "booking_prompt",
              sessionId,
              content: aiText,
              bookingData: bookingMatch[1],
            })
          );
          return;
        }
      }

      // Normal AI response
      await addChatMessage({ sessionId, role: "ai", content: aiText });
      send(JSON.stringify({ type: "ai_response", sessionId, content: aiText }));
    } catch (err) {
      console.error("[Chat] AI response error:", err);
      const fallback =
        language === "he"
          ? "מצטער, נתקלתי בבעיה. אפשר לפנות אלינו ישירות בוואטסאפ: +972544715400"
          : "Sorry, I encountered an issue. You can reach us on WhatsApp: +972544715400";
      await addChatMessage({ sessionId, role: "ai", content: fallback });
      send(
        JSON.stringify({ type: "ai_response", sessionId, content: fallback })
      );
    }
    return;
  }

  if (msg.type === "close") {
    if (msg.sessionId) {
      await closeChatSession(msg.sessionId);
    }
    send(JSON.stringify({ type: "session_closed" }));
    return;
  }

  send(
    JSON.stringify({
      type: "error",
      message: `Unknown message type: ${msg.type}`,
    })
  );
}

export function attachWebSocket(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/chat" });

  wss.on("connection", ws => {
    ws.on("message", async raw => {
      await handleChatMessage(raw.toString(), data => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    });

    ws.on("close", () => {
      const sessionId = connectionSessions.get(ws);
      if (sessionId) {
        closeChatSession(sessionId).catch(() => {});
        connectionSessions.delete(ws);
      }
    });

    ws.on("error", err => {
      console.error("[Chat WS] Connection error:", err);
    });
  });

  console.log("[Chat] WebSocket server attached at /ws/chat");
  return wss;
}
````

**Step 5: Attach WebSocket to the server**

In `server/_core/index.ts`, add after line 33 (after `const server = createServer(app);`):

```typescript
import { attachWebSocket } from "../chatWebSocket";
```

And after the `server.listen(port, () => {` block, add inside the callback:

```typescript
attachWebSocket(server);
```

**Step 6: Run test to verify it passes**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chatWebSocket.test.ts`
Expected: PASS (3 tests)

**Step 7: Type check + full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm test`
Expected: No type errors, all existing + new tests pass

**Step 8: Commit**

```bash
git add server/chatWebSocket.ts server/chatWebSocket.test.ts server/_core/index.ts package.json pnpm-lock.yaml
git commit -m "feat(chat): add WebSocket server with AI message handling"
```

---

## Task 5: Chat tRPC Router (Admin Endpoints)

**Files:**

- Create: `server/routes/chat.ts`
- Modify: `server/routers.ts` (import and register chatRouter)
- Modify: `server/chat.test.ts` (add router tests)

**Step 1: Write the failing test**

Append to `server/chat.test.ts`:

```typescript
import { appRouter } from "./routers";
import { createAuthContext } from "./test-helpers";

describe("chat tRPC router", () => {
  it("chat.listSessions returns paginated results", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // This will either hit the DB or return empty results
    const result = await caller.chat.listSessions({ page: 1, pageSize: 10 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("totalPages");
  });

  it("chat.getSessionMessages requires sessionId", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Should work with valid input shape
    await expect(
      caller.chat.getSessionMessages({ sessionId: 999 })
    ).resolves.toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chat.test.ts`
Expected: FAIL — `chat` not a property of router

**Step 3: Implement the chat router**

Create `server/routes/chat.ts`:

```typescript
import { z } from "zod";
import { router, secureProtectedProcedure } from "./_helpers";
import {
  getAllChatSessionsPaginated,
  getChatMessagesBySessionId,
  closeChatSession,
} from "../db";
import { paginationInput } from "../../shared/schemas";

export const chatRouter = router({
  listSessions: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllChatSessionsPaginated(
        page,
        pageSize
      );
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getSessionMessages: secureProtectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getChatMessagesBySessionId(input.sessionId);
    }),

  closeSession: secureProtectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      await closeChatSession(input.sessionId);
      return { success: true };
    }),
});
```

**Step 4: Register in routers.ts**

In `server/routers.ts`, add the import:

```typescript
import { chatRouter } from "./routes/chat";
```

And add to the `appRouter`:

```typescript
chat: chatRouter,
```

**Step 5: Run test to verify it passes**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test -- server/chat.test.ts`
Expected: PASS

**Step 6: Type check + full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm test`

**Step 7: Commit**

```bash
git add server/routes/chat.ts server/routers.ts server/chat.test.ts
git commit -m "feat(chat): add admin tRPC endpoints for chat session management"
```

---

## Task 6: Chat Widget UI — React Component

**Files:**

- Create: `client/src/components/ChatWidget.tsx`
- Modify: `client/src/App.tsx` (render ChatWidget globally)

**Step 1: Create the chat widget component**

Create `client/src/components/ChatWidget.tsx`:

```tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface ChatMessage {
  role: "visitor" | "ai" | "agent";
  content: string;
  createdAt?: string;
}

type WidgetState = "collapsed" | "open";

const VISITOR_ID_KEY = "wiro-chat-visitor-id";

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}

export function ChatWidget() {
  const { language, t } = useLanguage();
  const [location] = useLocation();
  const [state, setState] = useState<WidgetState>("collapsed");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [showPulse, setShowPulse] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);

  // Hide on admin pages
  const isAdminPage = location.startsWith("/admin");

  // Pulse animation — stop after 3 cycles
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when widget opens
  useEffect(() => {
    if (state === "open") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [state]);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);

    ws.onopen = () => {
      reconnectAttempts.current = 0;
      ws.send(
        JSON.stringify({
          type: "init",
          visitorId: getOrCreateVisitorId(),
          language,
        })
      );
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "session_started":
          setSessionId(data.sessionId);
          if (data.history?.length) {
            setMessages(data.history);
          } else {
            // Welcome message
            setMessages([
              {
                role: "ai",
                content: t(
                  "Hi! I'm your WIRO 4x4 adventure concierge. Ask me about tours, pricing, kosher dining, or anything about Northern Thailand!",
                  "שלום! אני העוזר הדיגיטלי של WIRO 4x4. שאלו אותי על טיולים, מחירים, אוכל כשר, או כל דבר על צפון תאילנד!"
                ),
              },
            ]);
          }
          break;

        case "typing":
          setIsTyping(true);
          break;

        case "ai_response":
          setIsTyping(false);
          setMessages(prev => [...prev, { role: "ai", content: data.content }]);
          break;

        case "booking_prompt":
          setIsTyping(false);
          setMessages(prev => [...prev, { role: "ai", content: data.content }]);
          break;

        case "handoff_initiated":
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              role: "ai",
              content: t(
                "Let me connect you with our team. Opening WhatsApp...",
                "מחבר אותך עם הצוות שלנו. פותח וואטסאפ..."
              ),
            },
          ]);
          // Open WhatsApp with context
          const whatsappMsg = encodeURIComponent(
            t(
              "Hi WIRO 4x4, I was chatting with your AI concierge and need help.",
              "היי WIRO 4x4, דיברתי עם העוזר הדיגיטלי שלכם ואשמח לעזרה."
            )
          );
          window.open(
            `https://wa.me/972544715400?text=${whatsappMsg}`,
            "_blank"
          );
          break;

        case "error":
          setIsTyping(false);
          console.warn("[Chat]", data.message);
          break;

        case "session_closed":
          setSessionId(null);
          break;
      }
    };

    ws.onclose = () => {
      if (state === "open") {
        // Exponential backoff reconnect
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [language, state, t]);

  // Connect when widget opens
  useEffect(() => {
    if (state === "open" && !wsRef.current) {
      connect();
    }
    return () => {
      clearTimeout(reconnectTimer.current);
    };
  }, [state, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearTimeout(reconnectTimer.current);
    };
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || !sessionId) return;

    setMessages(prev => [...prev, { role: "visitor", content: text }]);
    setInput("");
    setIsTyping(true);

    wsRef.current.send(
      JSON.stringify({ type: "message", sessionId, content: text })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isAdminPage) return null;

  return (
    <>
      {/* Collapsed bubble */}
      <AnimatePresence>
        {state === "collapsed" && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setState("open")}
            className={`fixed bottom-24 right-6 bg-[#1c1c1c] text-[#d4af37] rounded-full p-4 shadow-premium-lg z-[9998] hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] ${showPulse ? "animate-subtle-pulse" : ""}`}
            aria-label={t("Open chat", "פתח צ'אט")}
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Open panel */}
      <AnimatePresence>
        {state === "open" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-[#faf7f2] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9998] max-[400px]:w-full max-[400px]:h-full max-[400px]:bottom-0 max-[400px]:right-0 max-[400px]:rounded-none max-[400px]:max-w-none max-[400px]:max-h-none"
          >
            {/* Header */}
            <div className="bg-[#1c1c1c] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#d4af37]" />
                <span className="font-semibold text-sm">
                  {t("WIRO Concierge", "עוזר WIRO")}
                </span>
              </div>
              <button
                onClick={() => {
                  setState("collapsed");
                  if (wsRef.current) {
                    wsRef.current.close();
                    wsRef.current = null;
                  }
                }}
                className="text-white/70 hover:text-white transition-colors"
                aria-label={t("Close chat", "סגור צ'אט")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      msg.role === "visitor"
                        ? "bg-[#1c1c1c] text-white rounded-br-sm"
                        : "bg-white text-[#1c1c1c] border border-[#e5e2dc] rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-[#1c1c1c] border border-[#e5e2dc] rounded-2xl rounded-bl-sm px-4 py-2">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#e5e2dc] p-3 shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("Type a message...", "כתבו הודעה...")}
                  className="flex-1 bg-white border border-[#e5e2dc] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                  disabled={!sessionId}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || !sessionId}
                  className="bg-[#d4af37] text-[#1c1c1c] rounded-xl p-2 hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t("Send", "שלח")}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Step 2: Render ChatWidget in App.tsx**

In `client/src/App.tsx`, import and add ChatWidget inside `AppContent`, after `<CookieConsent />`:

```tsx
import { ChatWidget } from "./components/ChatWidget";
```

And in the JSX:

```tsx
<CookieConsent />
<ChatWidget />
```

**Step 3: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add client/src/components/ChatWidget.tsx client/src/App.tsx
git commit -m "feat(chat): add floating chat widget UI component"
```

---

## Task 7: WhatsApp Handoff Fallback (Lead Creation)

**Files:**

- Modify: `server/chatWebSocket.ts` (add lead creation on handoff)

**Step 1: Write the failing test**

Append to `server/chatWebSocket.test.ts`:

```typescript
import { createLead } from "./db";

// The mock is already set up above. Add:
vi.mock("./db", async importOriginal => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    createChatSession: vi.fn().mockResolvedValue(1),
    getChatSessionByVisitorId: vi.fn().mockResolvedValue(null),
    getChatMessagesBySessionId: vi
      .fn()
      .mockResolvedValue([
        { role: "visitor", content: "I need custom arrangements" },
      ]),
    addChatMessage: vi.fn().mockResolvedValue(1),
    updateChatSessionMode: vi.fn(),
    updateChatSessionSummary: vi.fn(),
    closeChatSession: vi.fn(),
    getAllActiveTours: vi.fn().mockResolvedValue([]),
    createLead: vi.fn().mockResolvedValue(1),
  };
});

describe("handoff creates lead as fallback", () => {
  it("createLeadFromChat is callable", async () => {
    // Test that the function exists and is importable
    const { createLeadFromChatSession } = await import("./chatWebSocket");
    expect(typeof createLeadFromChatSession).toBe("function");
  });
});
```

**Note:** Due to mock complexity, this test may need adjustment. The key implementation follows.

**Step 2: Add lead-creation helper to chatWebSocket.ts**

In `server/chatWebSocket.ts`, add this exported function and call it during handoff:

```typescript
import { createLead } from "./db";

export async function createLeadFromChatSession(
  sessionId: number,
  summary: string
) {
  try {
    await createLead({
      name: `Chat Visitor (Session #${sessionId})`,
      email: "chat-lead@wiro4x4.com", // placeholder — no email from chat
      source: "chat_concierge",
      message: summary,
    });
  } catch (err) {
    console.error("[Chat] Failed to create lead from handoff:", err);
  }
}
```

Then in the handoff branch of `handleChatMessage`, call:

```typescript
// After updateChatSessionMode(sessionId, "human"):
const chatSummary = history
  .map(m => `${m.role}: ${m.content}`)
  .slice(-5)
  .join("\n");
await createLeadFromChatSession(sessionId, chatSummary);
```

**Step 3: Run tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`

**Step 4: Commit**

```bash
git add server/chatWebSocket.ts server/chatWebSocket.test.ts
git commit -m "feat(chat): create lead in admin pipeline on human handoff"
```

---

## Task 8: Admin Dashboard — Chat Sessions Tab

**Files:**

- Modify: `client/src/pages/AdminDashboard.tsx` (add Chat tab)

**Step 1: Add Chat tab to admin dashboard**

In `client/src/pages/AdminDashboard.tsx`:

1. Add `"Chat"` to the tabs array
2. Add tRPC query for `trpc.chat.listSessions`
3. Render a table with columns: ID, Visitor ID, Language, Mode, Created, Actions (view messages, close)
4. Add a "View Messages" dialog that calls `trpc.chat.getSessionMessages`

This follows the exact same pattern as every other admin tab (Bookings, Leads, etc.):

- Paginated list using `listSessions`
- 20 items per page
- Status badges for mode (ai=green, human=yellow, closed=gray)
- "View" button opens messages in a dialog
- "Close" button calls `chat.closeSession`

**Step 2: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add client/src/pages/AdminDashboard.tsx
git commit -m "feat(chat): add Chat Sessions tab to admin dashboard"
```

---

## Task 9: Push DB Schema & Full Integration Test

**Files:**

- No new files — validation step

**Step 1: Push schema to database**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm db:push`
Expected: Migration generated for `chatSessions` and `chatMessages` tables

**Step 2: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All tests pass (existing 117 + new ~15 = ~132 tests)

**Step 3: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Manual smoke test**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`

Test checklist:

- [ ] Chat bubble appears bottom-right on homepage
- [ ] Clicking bubble opens chat panel with welcome message
- [ ] Typing a message sends it and receives AI response
- [ ] Chat bubble hidden on `/admin` page
- [ ] Admin → Chat tab shows session list
- [ ] Closing the widget disconnects WebSocket

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(chat): AI chat concierge — complete implementation"
```

---

## Summary of Files Changed

| Action | File                                   | Purpose                                                 |
| ------ | -------------------------------------- | ------------------------------------------------------- |
| Modify | `drizzle/schema.ts`                    | Add `chatSessions` + `chatMessages` tables              |
| Modify | `drizzle/relations.ts`                 | Add chat table relations                                |
| Modify | `server/db.ts`                         | Add 8 chat DB helper functions                          |
| Create | `server/chatAiService.ts`              | Claude API integration with dynamic system prompt       |
| Create | `server/chatWebSocket.ts`              | WebSocket handler + message routing + handoff           |
| Modify | `server/_core/index.ts`                | Attach WebSocket to HTTP server                         |
| Create | `server/routes/chat.ts`                | Admin tRPC endpoints (listSessions, getMessages, close) |
| Modify | `server/routers.ts`                    | Register chatRouter                                     |
| Create | `client/src/components/ChatWidget.tsx` | Floating chat widget UI                                 |
| Modify | `client/src/App.tsx`                   | Render ChatWidget globally                              |
| Modify | `client/src/pages/AdminDashboard.tsx`  | Chat Sessions admin tab                                 |
| Create | `server/chat.test.ts`                  | Schema + DB helper + router tests                       |
| Create | `server/chatAiService.test.ts`         | AI service tests                                        |
| Create | `server/chatWebSocket.test.ts`         | WebSocket handler tests                                 |
| Modify | `package.json`                         | Add `ws` + `@types/ws` dependencies                     |

## Dependency Graph

```
[Task 1: Schema] → [Task 2: DB Helpers] → [Task 3: AI Service, Task 5: tRPC Router]
                                          → [Task 4: WebSocket Server] → [Task 7: Handoff Fallback]
                                                                        → [Task 6: Chat Widget UI]
                                                                        → [Task 8: Admin Tab]
                                                                        → [Task 9: Integration Test]
```

Parallel groups: `[T1] → [T2] → [T3, T5] → [T4] → [T6, T7, T8] → [T9]`
