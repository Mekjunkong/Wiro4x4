import { describe, expect, it } from "vitest";
import { chatSessions, chatMessages } from "../drizzle/schema";
import { itWithDb } from "./test-helpers";
import {
  createChatSession,
  addChatMessage,
  getChatMessagesBySessionId,
  getChatSessionByVisitorId,
} from "./db";

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

describe("chat DB helpers", () => {
  itWithDb("createChatSession returns a positive id", async () => {
    const id = await createChatSession({
      visitorId: `test-visitor-${Date.now()}`,
      language: "en",
    });
    expect(id).toBeGreaterThan(0);
  });

  itWithDb(
    "addChatMessage stores and getChatMessagesBySessionId retrieves them in order",
    async () => {
      const sessionId = await createChatSession({
        visitorId: `test-visitor-msgs-${Date.now()}`,
        language: "en",
      });

      const msgId1 = await addChatMessage({
        sessionId,
        role: "visitor",
        content: "Hello",
      });
      const msgId2 = await addChatMessage({
        sessionId,
        role: "ai",
        content: "Hi there! How can I help?",
      });
      const msgId3 = await addChatMessage({
        sessionId,
        role: "visitor",
        content: "I want a tour",
        metadata: JSON.stringify({ intent: "booking" }),
      });

      expect(msgId1).toBeGreaterThan(0);
      expect(msgId2).toBeGreaterThan(0);
      expect(msgId3).toBeGreaterThan(0);

      const messages = await getChatMessagesBySessionId(sessionId);
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe("Hello");
      expect(messages[1].content).toBe("Hi there! How can I help?");
      expect(messages[2].content).toBe("I want a tour");
      expect(messages[2].metadata).toBe(JSON.stringify({ intent: "booking" }));

      // Verify ordering: createdAt should be ascending
      for (let i = 1; i < messages.length; i++) {
        expect(
          new Date(messages[i].createdAt).getTime()
        ).toBeGreaterThanOrEqual(new Date(messages[i - 1].createdAt).getTime());
      }
    }
  );

  itWithDb(
    "getChatSessionByVisitorId returns the latest open session",
    async () => {
      const visitorId = `test-visitor-latest-${Date.now()}`;

      // Create two sessions for the same visitor
      await createChatSession({ visitorId, language: "en" });
      const secondId = await createChatSession({ visitorId, language: "he" });

      const session = await getChatSessionByVisitorId(visitorId);
      expect(session).not.toBeNull();
      expect(session!.id).toBe(secondId);
      expect(session!.visitorId).toBe(visitorId);
      expect(session!.language).toBe("he");
    }
  );
});
