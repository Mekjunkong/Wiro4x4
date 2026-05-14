import { describe, expect, it } from "vitest";
import {
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
    const missing = getMissingBookingFields("אני רוצה להזמין", "he");
    const url = buildWhatsAppUrl("he", "אני רוצה להזמין", missing);
    const decoded = decodeURIComponent(url);

    expect(missing).toContain("מסלול או רעיון לטיול");
    expect(decoded).toContain("ההודעה שלי: אני רוצה להזמין");
    expect(decoded).toContain("פרטים חסרים: מסלול או רעיון לטיול");
  });
});
