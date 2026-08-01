import { describe, expect, it } from "vitest";
import {
  buildLeviLeadAlert,
  buildLeviWebhookRequest,
  buildTelegramLeadAlert,
  buildWhatsAppUrl,
  getBookingFields,
  getMissingBookingFields,
} from "./routes/moshe";

describe("Moshe booking qualification helpers", () => {
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

  it("builds an escaped Telegram alert with missing fields and exact visitor reply", () => {
    const alert = buildTelegramLeadAlert({
      latestMessage: `I want to book <Doi> & "quote" 'now'`,
      bookingContext: `I want to book <Doi> & "quote" 'now'`,
      language: "en",
      visitorId: `visitor<&"'>1234567890`,
      reply: `Happy to help <friend> & "confirm" 'soon'`,
      whatsappUrl: `https://wa.me/66816401397?text=<book>&q="yes"'`,
    });

    expect(alert).toContain("🔥 Booking / quote intent");
    expect(alert).toContain("🌐 Language: 🇬🇧 English");
    expect(alert).toContain("🔑 Visitor: visitor&lt;&amp;&quot;&#39;&gt;1");
    expect(alert).toContain(
      `I want to book &lt;Doi&gt; &amp; &quot;quote&quot; &#39;now&#39;`
    );
    expect(alert).toContain("📋 <b>Missing booking details:</b>");
    expect(alert).toContain("preferred date/date range");
    expect(alert).toContain(
      `Happy to help &lt;friend&gt; &amp; &quot;confirm&quot; &#39;soon&#39;`
    );
    expect(alert).toContain(
      `href="https://wa.me/66816401397?text=&lt;book&gt;&amp;q=&quot;yes&quot;&#39;"`
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
});
