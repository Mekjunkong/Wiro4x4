import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildLeviChatRequest,
  buildLeviLeadAlert,
  buildLeviWebhookRequest,
  buildWhatsAppUrl,
  getBookingFields,
  getMissingBookingFields,
  requestLeviReply,
} from "./routes/levi";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Levi booking qualification helpers", () => {
  it("asks for every required booking field on vague English booking intent", () => {
    const missing = getMissingBookingFields("I want to book", "en");

    expect(missing).toEqual([
      "tour or route idea",
      "preferred date/date range",
      "group size, adults, children and kids ages if any",
      "hotel or pickup area in Chiang Mai",
      "kosher/Shabbat/Hebrew guide needs",
    ]);
  });

  it("recognizes booking details across Hebrew text", () => {
    const fields = getBookingFields(
      "רוצים טיול ג׳יפים מחר, 2 מבוגרים וילד, איסוף ממלון בניממן, צריך כשר ומדריך בעברית"
    );

    expect(fields).toEqual({
      hasTour: true,
      hasDate: true,
      hasGroup: true,
      hasPickup: true,
      hasKosher: true,
    });
  });

  it("localizes Hebrew missing fields and WhatsApp prefill", () => {
    const missing = getMissingBookingFields("אני רוצה להזמין", "he-IL");
    const url = buildWhatsAppUrl("he-IL", "אני רוצה להזמין", missing);
    const decoded = decodeURIComponent(url);

    expect(missing).toContain("מסלול או רעיון לטיול");
    expect(missing).toContain(
      "מספר משתתפים, מבוגרים, ילדים וגילאי הילדים אם יש"
    );
    expect(decoded).toContain("ההודעה שלי: אני רוצה להזמין");
    expect(decoded).toContain("פרטים חסרים: מסלול או רעיון לטיול");
    expect(decoded).toContain(
      "מספר משתתפים, מבוגרים, ילדים וגילאי הילדים אם יש"
    );
  });

  it("builds the plain-text alert that Levi delivers from the VPS", () => {
    const alert = buildLeviLeadAlert({
      latestMessage: "Can you arrange kosher meals?",
      bookingContext: "Can you arrange kosher meals?",
      language: "en",
      visitorId: "visitor-123456789",
      reply: "Yes, we can arrange kosher picnic meals.",
      whatsappUrl: "https://wa.me/66816401397?text=kosher",
    });

    expect(alert).toContain("💬 New Customer Message - WIRO 4x4");
    expect(alert).toContain("🔑 Visitor: visitor-123456");
    expect(alert).toContain("Can you arrange kosher meals?");
    expect(alert).toContain("Yes, we can arrange kosher picnic meals.");
    expect(alert).toContain("https://wa.me/66816401397?text=kosher");
    expect(alert).not.toContain("<b>");
  });

  it("signs Levi webhook requests with the timestamp and exact body", () => {
    const request = buildLeviWebhookRequest(
      "A signed WIRO alert",
      "test-secret",
      1_800_000_000
    );

    expect(request).toEqual({
      body: JSON.stringify({
        event_type: "wiro.chat.message",
        text: "A signed WIRO alert",
      }),
      timestamp: "1800000000",
      signature:
        "4fa681ec03d5f201767d2cae5136b256d5912bc54c75b74d52c7560998d2a59f",
    });
  });

  it("builds a Levi-only VPS request with the isolated model", () => {
    const request = buildLeviChatRequest([
      { role: "user", content: "Can you arrange kosher meals?" },
    ]);

    expect(request.model).toBe("levi");
    expect(request.messages[0]).toMatchObject({
      role: "system",
      content: expect.stringContaining("You are Levi"),
    });
    expect(request.messages[0]?.content).not.toContain("You are Moshe");
    expect(request.messages.at(-1)).toEqual({
      role: "user",
      content: "Can you arrange kosher meals?",
    });
  });

  it("uses only the authenticated Levi VPS reply endpoint", async () => {
    vi.stubEnv("LEVI_CHAT_URL", "https://levi.example/v1/chat/completions");
    vi.stubEnv("LEVI_API_KEY", "levi-test-secret");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Levi reply" } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestLeviReply([{ role: "user", content: "Hello" }])
    ).resolves.toBe("Levi reply");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://levi.example/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer levi-test-secret",
        }),
      })
    );
  });
});
