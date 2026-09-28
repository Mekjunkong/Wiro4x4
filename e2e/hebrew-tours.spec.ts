import { expect, test, type Page } from "@playwright/test";

// Hebrew tour pages live at /he/tours/:slug; English ones at /tours/:slug.

async function prepare(page: Page, language: "en" | "he") {
  await page.addInitScript(lang => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86_400_000)
    );
    localStorage.setItem("wiro-preferred-language", lang);
  }, language);
}

const SLUG = "mae-kampong-hidden-village";

test("the Hebrew tour page renders in Hebrew with its own canonical", async ({
  page,
}) => {
  await prepare(page, "en");
  await page.goto(`/he/tours/${SLUG}`);

  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "מאה קמפונג"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://www.wiro4x4indochina.com/he/tours/${SLUG}`
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]')
  ).toHaveAttribute("href", `https://www.wiro4x4indochina.com/tours/${SLUG}`);
});

test("a visitor who prefers Hebrew is moved from the English tour URL", async ({
  page,
}) => {
  await prepare(page, "he");
  await page.goto(`/tours/${SLUG}`);
  await expect(page).toHaveURL(new RegExp(`/he/tours/${SLUG}$`));
});

test("the language button switches between the tour pages", async ({
  page,
}) => {
  await prepare(page, "en");
  await page.goto(`/he/tours/${SLUG}`);
  await page
    .getByRole("button", { name: /switch language to english/i })
    .click();
  await expect(page).toHaveURL(new RegExp(`/tours/${SLUG}$`));
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page
    .getByRole("button", { name: /switch language to hebrew/i })
    .click();
  await expect(page).toHaveURL(new RegExp(`/he/tours/${SLUG}$`));
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
});

test("the language button also switches the fixed-language landing pages", async ({
  page,
}) => {
  await prepare(page, "en");
  await page.goto("/kosher-tours");
  await page
    .getByRole("button", { name: /switch language to hebrew/i })
    .click();
  await expect(page).toHaveURL(/\/he\/kosher-tours-chiang-mai$/);
});

test("tour links point to Hebrew pages while browsing in Hebrew", async ({
  page,
}) => {
  await prepare(page, "he");
  await page.goto("/tours");
  await expect(page.locator(".wx-cards a").first()).toBeVisible();
  const hrefs = await page
    .locator('a[href*="/tours/"]')
    .evaluateAll(links =>
      links
        .map(a => a.getAttribute("href") ?? "")
        .filter(h => /\/tours\/[a-z-]+$/.test(h))
    );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/he\/tours\//);
});
