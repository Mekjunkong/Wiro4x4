import { test, expect, type Page } from "@playwright/test";

// The /book day-tour stepper (tour → date & group → kosher → details).
// booking.create is mocked in every test, so no run ever writes a booking.

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86400000)
    );
    localStorage.setItem("wiro-preferred-language", "en");
    // Capture the WhatsApp hand-off instead of opening a tab.
    window.open = ((url?: string | URL) => {
      (window as unknown as { __opened?: string }).__opened = String(url);
      return null;
    }) as typeof window.open;
  });
}

// Later page.route() handlers take precedence, so individual tests can
// register their own booking.create handler on top of this default.
async function mockBookingCreate(page: Page) {
  const bodies: unknown[] = [];
  await page.route(/\/api\/trpc\/booking\.create/, async route => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          result: {
            data: {
              json: {
                success: true,
                message: "Booking created successfully",
                bookingId: 4242,
              },
            },
          },
        },
      ]),
    });
  });
  return bodies;
}

async function goToDetails(page: Page) {
  await page.goto("/book?tour=maerim-sticky-waterfalls");
  await page.locator(".wx-day").nth(2).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#contactName")).toBeVisible();
}

test.describe("Booking stepper", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await mockBookingCreate(page);
  });

  test("loads on the tour step with all six tours", async ({ page }) => {
    await page.goto("/book");

    await expect(
      page.getByRole("heading", { level: 1, name: "Book your day" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Which trail?" })
    ).toBeVisible();
    await expect(page.locator(".wx-opt")).toHaveCount(6);
    await expect(
      page.getByRole("link", { name: "Use the full trip planner" })
    ).toHaveAttribute("href", "/plan-trip");
  });

  test("starts on the date step when a tour is passed in the URL", async ({
    page,
  }) => {
    await page.goto("/book?tour=maerim-sticky-waterfalls");

    await expect(
      page.getByRole("heading", { name: "When, and who's coming?" })
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "Your day" })
    ).toContainText("Sticky Waterfalls");
  });

  test("requires a date before continuing", async ({ page }) => {
    await page.goto("/book?tour=maerim-sticky-waterfalls");

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert")).toHaveText("Pick a date to continue");

    await page.locator(".wx-day").nth(2).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByRole("heading", { name: "Your kosher level" })
    ).toBeVisible();
  });

  test("group counters stay within bounds", async ({ page }) => {
    await page.goto("/book?tour=maerim-sticky-waterfalls");

    const fewerAdults = page.getByRole("button", { name: "Fewer Adults" });
    await fewerAdults.click();
    await fewerAdults.click();
    await expect(
      page.getByRole("complementary", { name: "Your day" })
    ).toContainText("1 adult");

    const moreKids = page.getByRole("button", { name: "More Kids" });
    for (let i = 0; i < 6; i++) await moreKids.click();
    await expect(page.getByText(/7 travelers/)).toBeVisible();
  });

  test("validates name, phone and consent without submitting", async ({
    page,
  }) => {
    let created = 0;
    await page.route(/\/api\/trpc\/booking\.create/, route => {
      created += 1;
      return route.abort();
    });
    await goToDetails(page);

    await page.locator("#contactPhone").fill("abc");
    await page.getByRole("button", { name: /send on whatsapp/i }).click();

    await expect(page.getByText("Tell us your name")).toBeVisible();
    await expect(
      page.getByText("WhatsApp number, with country code")
    ).toBeVisible();
    await expect(
      page.getByText("Please agree to the Terms of Service and Privacy Policy")
    ).toBeVisible();
    expect(created).toBe(0);
  });

  test("keeps touch-sized inputs on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await goToDetails(page);

    const box = await page.locator("#contactName").boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("saves the request, then hands off to tracked WhatsApp", async ({
    page,
  }) => {
    const bodies = await mockBookingCreate(page);
    await goToDetails(page);

    await page.locator("#contactName").fill("Stepper Test");
    await page.locator("#contactPhone").fill("+972 50 123 4567");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: /send on whatsapp/i }).click();

    await expect(
      page.getByRole("heading", { name: "Request sent — check WhatsApp" })
    ).toBeVisible();
    await expect(page.getByText("WIRO-4242")).toBeVisible();

    const opened = await page.evaluate(
      () => (window as unknown as { __opened?: string }).__opened ?? ""
    );
    expect(opened).toMatch(/wa\.me/);
    expect(opened).toMatch(/BOOKING-SUBMIT-EN/);
    expect(decodeURIComponent(opened)).toContain("Sticky Waterfalls");

    const sent = JSON.stringify(bodies[0]);
    expect(sent).toContain('"contactName":"Stepper Test"');
    expect(sent).toContain('"includesTrip":true');
    expect(sent).toContain("maerim-sticky-waterfalls");
  });

  test("hands package links to the full planner", async ({ page }) => {
    await page.goto("/book?package=northern-thailand-3d2n");

    await expect(page).toHaveURL(/\/plan-trip\?package=northern-thailand-3d2n/);
  });
});
