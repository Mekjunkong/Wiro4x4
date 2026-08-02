import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildLeviChatRequest,
  buildLeviLeadAlert,
  buildLeviSystemPrompt,
  buildLeviWebhookRequest,
  buildWhatsAppUrl,
  buildBookingState,
  getBookingFields,
  getMissingBookingFields,
  requestLeviReply,
  shouldSendOwnerAlert,
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
      "רוצים טיול ג׳יפים מחר, 2 מבוגרים וילד בגיל 6, איסוף ממלון בניממן, צריך כשר ומדריך בעברית"
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
    expect(decoded).toContain("ההודעה האחרונה שלי: אני רוצה להזמין");
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

    expect(alert).toContain("🔥 New WIRO Chat Lead");
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

  it("builds structured booking progress across a multi-detail inquiry", () => {
    const state = buildBookingState(
      "We want Doi Inthanon tomorrow for 2 adults and children aged 5 and 8, pickup at a Nimman hotel, kosher lunch please",
      "en"
    );

    expect(state).toMatchObject({
      intent: "booking",
      completionPercent: 100,
      qualified: true,
      missingKeys: [],
      fields: {
        hasTour: true,
        hasDate: true,
        hasGroup: true,
        hasPickup: true,
        hasKosher: true,
      },
      details: {
        tour: "Doi Inthanon",
        group: expect.stringContaining("children aged 5 and 8"),
        pickup: "Nimman",
        kosher: expect.stringMatching(/kosher/i),
      },
    });
  });

  it("keeps child ages missing until the visitor provides them", () => {
    const state = buildBookingState(
      "Doi Inthanon tomorrow for 2 adults and 2 children, pickup at a Nimman hotel, no kosher needed",
      "en"
    );

    expect(state.fields.hasGroup).toBe(false);
    expect(state.missingKeys).toContain("group");
    expect(state.qualified).toBe(false);
  });

  it("notifies the owner only when a booking profile becomes qualified", () => {
    const priceQuestion = buildBookingState("How much is a day tour?", "en");
    const partialBooking = buildBookingState(
      "Doi Inthanon tomorrow for 2 adults, pickup at a Nimman hotel",
      "en"
    );
    const qualifiedBooking = buildBookingState(
      "Doi Inthanon tomorrow for 2 adults, pickup at a Nimman hotel, no kosher needed",
      "en"
    );

    expect(shouldSendOwnerAlert(priceQuestion, null)).toBeNull();
    expect(shouldSendOwnerAlert(partialBooking, priceQuestion)).toBeNull();
    expect(shouldSendOwnerAlert(qualifiedBooking, partialBooking)).toBe(
      "qualified"
    );
  });

  it("uses the shared WIRO pricing source and avoids stale prompt claims", () => {
    const bookingState = buildBookingState("How much is a tour?", "en");
    const prompt = buildLeviSystemPrompt({
      bookingState,
      bookingSummary: "No booking details collected yet",
      availabilityPrompt: "No confirmed availability supplied.",
      now: new Date("2026-08-01T00:00:00Z"),
    });

    expect(prompt).toContain("Mae Wang — Jungle Wilderness: from $134");
    expect(prompt).toContain("Samoeng Loop — Mountain Circuit: from $98");
    expect(prompt).toContain("2-day Weekend Adventure: from $202");
    expect(prompt).toContain("A 30% deposit");
    expect(prompt).toContain("Nov – Feb: approximately +20%");
    expect(prompt).not.toContain(
      "Mae Wang - Jungle & River Wilderness** · $154"
    );
    expect(prompt).not.toContain("5-day: $588");
    expect(prompt).not.toContain("18:00");
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
