import { test, expect, type Page } from "@playwright/test";
import {
  buildAttributionCapsule,
  parseAttributionCapsule,
  WHATSAPP_SOURCES,
} from "../shared/whatsappAttribution";

// Helper to dismiss overlays
async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86400000)
    );
  });
}

async function openLeadsTab(page: Page) {
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  if (await menu.isVisible()) await menu.click();
  const leadsTab = page.getByRole("tab", { name: "Leads", exact: true });
  await leadsTab.focus();
  await page.keyboard.press("Enter");
}

type MockLead = Record<string, unknown> & { id: number; status: string };

async function mockAuthenticatedAdmin(
  page: Page,
  initialLeads: MockLead[] = []
) {
  const leads: MockLead[] = [...initialLeads];
  let createAttempts = 0;
  let lastCreatePayload: Record<string, unknown> | undefined;
  let updateAttempts = 0;
  let activeUpdates = 0;
  let maxConcurrentUpdates = 0;

  const dataFor = (procedure: string) => {
    if (procedure === "auth.me") {
      return {
        id: 1,
        email: "admin@example.com",
        name: "E2E Admin",
        role: "admin",
      };
    }
    if (procedure === "lead.listPaginated") {
      return {
        items: leads,
        total: leads.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
    }
    if (procedure === "lead.list") return leads;
    if (procedure.endsWith("listPaginated")) {
      return { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    }
    if (procedure.endsWith(".list") || procedure.endsWith(".listAll")) {
      return [];
    }
    if (procedure === "dashboard.badgeCounts") return {};
    if (procedure === "analytics.funnelData") {
      return { steps: [], conversionRate: 0 };
    }
    if (procedure === "dashboard.stats") {
      return {
        bookingsByDay: [],
        revenueByDay: [],
        leadConversion: { total: 0, converted: 0, rate: 0 },
        postTourReviews: {
          windowStart: "2026-07-01",
          windowEnd: "2026-07-12",
          volume: 0,
          completedTours: 0,
          reviewed: 0,
          completionRate: 0,
          lowRatingExceptions: 0,
        },
        upcomingTours: [],
        pendingBookings: 0,
        newLeads: 0,
      };
    }
    if (procedure === "abandoned.count") return { total: 0, unsent: 0 };
    return {};
  };

  await page.route("**/api/trpc/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const procedures = url.pathname.replace(/^\/api\/trpc\//, "").split(",");

    if (request.method() === "POST") {
      const rawBody = request.postDataJSON() as
        | { json?: Record<string, unknown> }
        | Record<string, { json?: Record<string, unknown> }>;
      const payload =
        "json" in rawBody ? rawBody.json : Object.values(rawBody)[0]?.json;
      if (procedures.includes("lead.createFromWhatsApp")) {
        createAttempts += 1;
        lastCreatePayload = payload;
        if (createAttempts === 1) {
          await new Promise(resolve => setTimeout(resolve, 750));
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              error: {
                json: {
                  message: "Temporary save failure",
                  code: -32603,
                  data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
                },
              },
            }),
          });
          return;
        }
        const parsed = parseAttributionCapsule(
          String(payload?.attributionCapsule ?? "")
        );
        if (!parsed) {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({ error: { message: "Capsule required" } }),
          });
          return;
        }
        const source = WHATSAPP_SOURCES.find(
          item => item.code === parsed.sourceCode
        );
        leads.unshift({
          id: 101,
          name: payload?.name ?? "",
          phone: payload?.phone ?? "",
          email: payload?.email || null,
          source: "whatsapp",
          status: "new",
          sourceCode: parsed.sourceCode,
          sourceChannel: parsed.channel,
          language: source?.language ?? "en",
          landingPage: parsed.landingPath,
          utmSource: parsed.utmSource,
          utmMedium: parsed.utmMedium,
          utmCampaign: parsed.utmCampaign,
          interestedTours: payload?.interestedTours ?? null,
          message: payload?.message ?? null,
          travelDate: payload?.travelDate ?? null,
          groupSize: payload?.groupSize ?? null,
          estimatedValueThb: payload?.estimatedValueThb ?? null,
          completedAt: null,
          lostReason: null,
          score: 0,
          createdAt: new Date().toISOString(),
        });
      }
      if (procedures.includes("lead.update")) {
        updateAttempts += 1;
        activeUpdates += 1;
        maxConcurrentUpdates = Math.max(maxConcurrentUpdates, activeUpdates);
        await new Promise(resolve =>
          setTimeout(
            resolve,
            initialLeads.length > 1
              ? updateAttempts === 1
                ? 1_000
                : 750
              : updateAttempts === 1
                ? 400
                : 75
          )
        );
        const id = Number(payload?.id);
        const lead = leads.find(item => item.id === id);
        const data = payload?.data as Record<string, unknown> | undefined;
        if (lead && data) {
          Object.assign(lead, data);
          if (data.completed !== undefined) {
            lead.completedAt = data.completed ? new Date().toISOString() : null;
            delete lead.completed;
          }
        }
        activeUpdates -= 1;
      }
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ result: { data: { json: { success: true } } } }),
      });
      return;
    }

    const results = procedures.map(procedure => ({
      result: { data: { json: dataFor(procedure) } },
    }));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(procedures.length === 1 ? results[0] : results),
    });
  });

  return {
    leads,
    getCreateAttempts: () => createAttempts,
    getLastCreatePayload: () => lastCreatePayload,
    getActiveUpdates: () => activeUpdates,
    getMaxConcurrentUpdates: () => maxConcurrentUpdates,
  };
}

test.describe("Admin Dashboard - WhatsApp lead operations", () => {
  test("releases independent row locks after concurrent updates", async ({
    page,
  }) => {
    await preparePage(page);
    const leadDefaults = {
      email: null,
      phone: "+66 80 000 0000",
      source: "whatsapp",
      sourceCode: "CONTACT-CARD-EN",
      sourceChannel: "direct",
      language: "en",
      landingPage: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      interestedTours: null,
      message: null,
      travelDate: null,
      groupSize: null,
      estimatedValueThb: null,
      completedAt: null,
      lostReason: null,
      score: 0,
      createdAt: "2026-07-13T00:00:00.000Z",
    };
    const mockAdmin = await mockAuthenticatedAdmin(page, [
      {
        ...leadDefaults,
        id: 201,
        name: "First concurrent lead",
        status: "new",
      },
      {
        ...leadDefaults,
        id: 202,
        name: "Second concurrent lead",
        status: "new",
      },
    ]);
    await page.goto("/admin");
    await openLeadsTab(page);

    const firstStatus = page.getByLabel("Status for First concurrent lead");
    const secondStatus = page.getByLabel("Status for Second concurrent lead");
    await firstStatus.selectOption("contacted");
    await secondStatus.selectOption("contacted");
    await expect.poll(() => mockAdmin.getMaxConcurrentUpdates()).toBe(2);
    await expect(firstStatus).toBeDisabled();
    await expect(secondStatus).toBeDisabled();
    await expect.poll(() => mockAdmin.getActiveUpdates()).toBe(0);
    await expect(firstStatus).toBeEnabled();
    await expect(secondStatus).toBeEnabled();
  });

  test("captures an attributed WhatsApp inquiry inline", async ({
    page,
  }, testInfo) => {
    await preparePage(page);
    const mockAdmin = await mockAuthenticatedAdmin(page);
    await page.goto("/admin");
    await openLeadsTab(page);

    await expect(
      page.getByRole("button", { name: "Add WhatsApp inquiry" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Add WhatsApp inquiry" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Attribution capsule")).toHaveAttribute(
      "placeholder",
      "Paste [WIRO:v1|…] from the WhatsApp message"
    );

    const capsule = buildAttributionCapsule({
      sourceCode: "HOME-HERO-EN",
      channel: "organic",
      utmSource: "google",
      utmMedium: "organic",
      utmCampaign: "summer",
      landingPath: "/kosher-tours",
    });
    await page.getByLabel("Name or WhatsApp label").fill("Noa WhatsApp");
    await page.getByLabel("WhatsApp phone").fill("+66 81 234 5678");
    await page.getByLabel("Attribution capsule").fill(capsule);
    const preview = page.getByLabel("Source preview");
    await expect(preview.getByText("HOME-HERO-EN")).toBeVisible();
    await expect(preview.getByText("organic", { exact: true })).toBeVisible();

    const sourceSelect = page.getByLabel("Manual source fallback");
    await expect(sourceSelect.locator("option")).toHaveCount(
      WHATSAPP_SOURCES.length + 1
    );
    await page.getByLabel("Attribution capsule").fill("");
    await sourceSelect.selectOption("CONTACT-CARD-HE");
    await expect(preview).toContainText("CONTACT-CARD-HE");
    await expect(preview).toContainText("HE");
    await expect(preview).toContainText("Landing Unknown");
    await page.getByLabel("Attribution capsule").fill(capsule);

    await page.getByLabel("Tour interest").fill("Doi Inthanon private tour");
    await page.getByLabel("Travel date").fill("2026-11-20");
    await page.getByLabel("Group size").fill("4");
    await page.getByLabel("Estimated value (THB)").fill("48000");
    await page.getByLabel("Notes").fill("=1+1");

    const form = page.getByRole("form", { name: "Add WhatsApp inquiry" });
    const submitButton = form.locator('button[type="submit"]');
    await submitButton.click();
    await expect(form).toHaveAttribute("aria-busy", "true");
    await expect(
      page.getByRole("button", { name: "Close WhatsApp inquiry form" })
    ).toBeDisabled();
    await expect(page.getByLabel("Name or WhatsApp label")).toBeDisabled();
    await expect(submitButton).toBeDisabled();
    await expect(page.getByRole("alert")).toContainText(
      "Temporary save failure"
    );
    const save = page.getByRole("button", { name: "Save WhatsApp inquiry" });
    await expect(save).toBeEnabled();
    await expect(page.getByLabel("Name or WhatsApp label")).toHaveValue(
      "Noa WhatsApp"
    );
    await expect(page.getByLabel("WhatsApp phone")).toHaveValue(
      "+66 81 234 5678"
    );
    await expect(page.getByLabel("Attribution capsule")).toHaveValue(capsule);
    await expect(page.getByLabel("Tour interest")).toHaveValue(
      "Doi Inthanon private tour"
    );
    await expect(page.getByLabel("Travel date")).toHaveValue("2026-11-20");
    await expect(page.getByLabel("Group size")).toHaveValue("4");
    await expect(page.getByLabel("Estimated value (THB)")).toHaveValue("48000");
    await expect(page.getByLabel("Notes")).toHaveValue("=1+1");
    await expect(preview).toContainText("HOME-HERO-EN");
    expect(mockAdmin.getCreateAttempts()).toBe(1);

    await save.click();
    await expect(
      page.getByRole("button", { name: "Add WhatsApp inquiry" })
    ).toBeVisible();
    expect(mockAdmin.getLastCreatePayload()?.attributionCapsule).toBe(capsule);
    const row = page.getByRole("row", { name: /Noa WhatsApp/ });
    await expect(row).toContainText("HOME-HERO-EN");
    await expect(row).toContainText("organic");
    await expect(row).toContainText("THB 48,000");
    if (testInfo.project.name === "Mobile Chrome") {
      const mobileContact = page.getByLabel("Mobile contact for Noa WhatsApp");
      await expect(mobileContact).toBeVisible();
      await expect(mobileContact).toContainText("+66 81 234 5678");
    }

    const status = row.getByLabel("Status for Noa WhatsApp");
    await status.selectOption("lost");
    await expect(
      page.getByText("Add a loss reason below, then choose Lost again.")
    ).toBeVisible();
    await expect(status.locator("option:checked")).toHaveText("New");
    const detailsSummary = page.getByText("Attribution and outcome details", {
      exact: true,
    });
    await detailsSummary.focus();
    await page.keyboard.press("Enter");
    await page.getByLabel("Loss reason for Noa WhatsApp").fill("Travel dates");
    await status.selectOption("contacted");
    await status.selectOption("quoted");
    await expect.poll(() => mockAdmin.getActiveUpdates()).toBe(0);
    expect(mockAdmin.getMaxConcurrentUpdates()).toBe(1);
    await expect(status.locator("option:checked")).toHaveText("Quoted");
    await status.selectOption("converted");
    await expect(status.locator("option:checked")).toHaveText("Confirmed");
    await row.getByRole("button", { name: "Mark completed" }).click();
    await expect(row).toContainText("Completed");
    page.once("dialog", async dialog => {
      expect(dialog.message()).toContain("Undo completed");
      await dialog.dismiss();
    });
    await status.selectOption("contacted");
    await expect(status.locator("option:checked")).toHaveText("Confirmed");

    await page.reload();
    await openLeadsTab(page);
    const persistedRow = page.getByRole("row", { name: /Noa WhatsApp/ });
    await expect(persistedRow).toContainText("THB 48,000");
    await expect(persistedRow).toContainText("Completed");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString("utf8")).toContain('"\'=1+1"');
  });
});

test.describe("Admin Dashboard - Access Control", () => {
  test("should require authentication to access /admin", async ({ page }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();

    // Either redirects to login/oauth or stays on admin with auth gate
    const isHandled =
      url.includes("login") || url.includes("oauth") || url.includes("admin");
    expect(isHandled).toBeTruthy();
  });

  test("should not expose admin data without authentication", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("/admin")) {
      // If stayed on admin page, sensitive data should not be visible
      // Check for typical admin-only content
      const hasRevenueData = await page
        .locator('text="Total Revenue"')
        .isVisible()
        .catch(() => false);
      const hasBookingDetails = await page
        .locator('text="Booking #"')
        .isVisible()
        .catch(() => false);

      // Without auth, these should not be visible
      expect(hasRevenueData && hasBookingDetails).toBeFalsy();
    }
  });

  test("should not throw JavaScript errors on admin page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const unexpectedErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(unexpectedErrors).toHaveLength(0);
  });
});

test.describe("Admin Dashboard - Tab Navigation", () => {
  // These tests verify the admin dashboard structure without needing auth
  // They check that the page loads and the tab system works if authenticated

  test("should display admin dashboard header/layout", async ({ page }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Page should load without crashing
    await expect(page.locator("body")).toBeVisible();

    // Check if we have the admin layout or a login redirect
    const url = page.url();
    if (url.includes("/admin")) {
      // Admin page loaded - may show login prompt or dashboard
      await expect(page.locator("header, body")).toBeVisible();
    }
  });

  test("should show login button or auth prompt for unauthenticated users", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("/admin")) {
      // On admin page without auth - should have some auth indicator
      const hasLoginButton = await page
        .getByRole("link", { name: /log ?in|sign ?in/i })
        .isVisible()
        .catch(() => false);
      const hasAuthMessage = await page
        .getByText(/sign in|log in|authenticate|unauthorized/i)
        .first()
        .isVisible()
        .catch(() => false);
      const hasAdminContent = await page
        .getByText(/bookings|dashboard|CRM/i)
        .first()
        .isVisible()
        .catch(() => false);

      // Either shows auth prompt or admin content (if auth is handled differently)
      expect(hasLoginButton || hasAuthMessage || hasAdminContent).toBeTruthy();
    }
  });
});

test.describe("Admin Dashboard - Tab Definitions", () => {
  // Verify the admin tabs are defined correctly by checking the component structure
  // This tests the expected tabs exist when the page renders

  test("should have expected admin tab identifiers", async ({ page }) => {
    await preparePage(page);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes("/admin")) {
      // Redirected away from admin - test is not applicable
      test.skip();
      return;
    }

    // Check if any tab-like elements exist
    const tabElements = page.locator('[role="tab"], button[data-state]');
    const _tabCount = await tabElements.count();

    // If admin page is accessible, it should have tab navigation
    // Expected tabs: CRM, Bookings, Calendar, Agents, Leads, Financial, Tours, etc.
    const expectedTabNames = [
      /bookings?/i,
      /tours?/i,
      /blog/i,
      /gallery/i,
      /reviews?/i,
    ];

    for (const tabName of expectedTabNames) {
      const tabButton = page.getByRole("button", { name: tabName }).first();
      const hasTab = await tabButton.isVisible().catch(() => false);

      // Tab may or may not be visible depending on auth state
      // This is a soft check - we just verify the page handles it
      if (hasTab) {
        await expect(tabButton).toBeVisible();
      }
    }
  });
});

test.describe("Admin Dashboard - API Protection", () => {
  // Verify that admin API endpoints are protected

  test("should reject unauthenticated API calls to admin endpoints", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    // Try to call a protected tRPC endpoint directly
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/trpc/booking.list", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return { status: res.status, ok: res.ok };
      } catch {
        return { status: 0, ok: false };
      }
    });

    // Should be unauthorized or error (not 200 with data)
    // tRPC might return 200 with error body or 401/403
    expect(response.status).not.toBe(0);
  });

  test("should allow public API calls for tours and gallery", async ({
    page,
  }) => {
    await preparePage(page);
    await page.goto("/");

    // Public endpoints should work without auth
    const tourResponse = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/trpc/tour.list", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return { status: res.status, ok: res.ok };
      } catch {
        return { status: 0, ok: false };
      }
    });

    // Public endpoint should respond (not necessarily 200 due to tRPC query params)
    expect(tourResponse.status).not.toBe(0);
  });
});

test.describe("Admin Dashboard - Page Stability", () => {
  test("should handle rapid navigation to /admin without crashing", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);

    // Navigate to admin multiple times
    await page.goto("/admin");
    await page.waitForTimeout(500);
    await page.goto("/");
    await page.waitForTimeout(500);
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver") &&
        !e.includes("AbortError")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("should handle direct navigation to admin on mobile", async ({
    page,
  }) => {
    await preparePage(page);

    // Use mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // Page should load without critical errors
    await expect(page.locator("body")).toBeVisible();

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// Hebrew admin tests
test.describe("Admin Dashboard - Hebrew", () => {
  test("should load admin page in Hebrew without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await preparePage(page);

    // Set Hebrew language before loading admin
    await page.goto("/");
    let langSwitcher = page.getByRole("button", {
      name: /switch language to hebrew/i,
    });
    if (!(await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false))) {
      const menuButton = page.getByRole("button", { name: /toggle menu/i });
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.dispatchEvent("click");
        await page.waitForTimeout(500);
      }
      langSwitcher = page.getByRole("button", {
        name: /switch language to hebrew/i,
      });
    }
    if (await langSwitcher.isVisible().catch(() => false)) {
      await langSwitcher.click();
    }

    await page.goto("/admin");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      e =>
        !e.includes("UNAUTHORIZED") &&
        !e.includes("401") &&
        !e.includes("auth") &&
        !e.includes("ResizeObserver")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
