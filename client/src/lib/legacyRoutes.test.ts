import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("legacy booking route", () => {
  it("keeps /booking as a compatibility redirect to /book", () => {
    const appSource = readFileSync(resolve("client/src/App.tsx"), "utf8");

    expect(appSource).toContain(
      '<Route path={"/booking"} component={LegacyBookingRedirect} />'
    );
    expect(appSource).toContain('navigate("/book", { replace: true });');
  });

  it("uses the shared phone constant for public structured data", () => {
    const contactSource = readFileSync(
      resolve("client/src/pages/Contact.tsx"),
      "utf8"
    );
    const tourDetailSource = readFileSync(
      resolve("client/src/pages/TourDetail.tsx"),
      "utf8"
    );

    expect(contactSource).toContain("telephone: COMPANY_PHONE");
    expect(tourDetailSource).toContain("telephone: COMPANY_PHONE");
    expect(`${contactSource}\n${tourDetailSource}`).not.toContain(
      "+668****1397"
    );
  });

  it("keeps mobile consent above the floating action area", () => {
    const cookieSource = readFileSync(
      resolve("client/src/components/CookieConsent.tsx"),
      "utf8"
    );

    expect(cookieSource).toContain("fixed bottom-16");
    expect(cookieSource).toContain('type="button"');
  });

  it("gives the logo link an accessible name", () => {
    const headerSource = readFileSync(
      resolve("client/src/components/Header.tsx"),
      "utf8"
    );

    expect(headerSource).toContain('aria-label="WIRO 4x4 home"');
  });
});
