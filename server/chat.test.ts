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
