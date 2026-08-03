import { expect, test, type Locator, type Page } from "@playwright/test";

async function contrastRatio(page: Page, locator: Locator) {
  return locator.evaluate(element => {
    const parseColor = (value: string) => {
      const match = value.match(
        /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/
      );
      if (!match) return null;
      return {
        red: Number(match[1]),
        green: Number(match[2]),
        blue: Number(match[3]),
        alpha: match[4] === undefined ? 1 : Number(match[4]),
      };
    };
    const luminance = (color: { red: number; green: number; blue: number }) =>
      [color.red, color.green, color.blue]
        .map(channel => channel / 255)
        .map(channel =>
          channel <= 0.03928
            ? channel / 12.92
            : Math.pow((channel + 0.055) / 1.055, 2.4)
        )
        .reduce((total, channel, index) => {
          const weights = [0.2126, 0.7152, 0.0722];
          return total + channel * weights[index];
        }, 0);

    const foreground = parseColor(getComputedStyle(element).color);
    if (!foreground) throw new Error("Could not parse foreground color");

    let node: Element | null = element;
    let background = null;
    while (node) {
      const candidate = parseColor(getComputedStyle(node).backgroundColor);
      if (candidate && candidate.alpha > 0) {
        background = candidate;
        break;
      }
      node = node.parentElement;
    }
    if (!background) throw new Error("Could not find background color");

    const foregroundLuminance = luminance(foreground);
    const backgroundLuminance = luminance(background);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86_400_000)
    );
  });
});

test("conversion surfaces meet WCAG AA contrast", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const heroWhatsApp = page
    .getByRole("link", {
      name: "Check Availability on WhatsApp",
    })
    .first();
  const journeyLabel = page.getByText("Choose your way into the north", {
    exact: true,
  });
  const exploreAction = page
    .locator("#tours article .text-accent-readable")
    .first();

  await expect(heroWhatsApp).toBeVisible();
  await expect(journeyLabel).toBeVisible();
  await expect(exploreAction).toBeVisible();

  expect(await contrastRatio(page, heroWhatsApp)).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page, journeyLabel)).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page, exploreAction)).toBeGreaterThanOrEqual(4.5);

  const newsletterText = page.getByText(
    "Get the latest tour updates and special offers",
    { exact: true }
  );
  const newsletterInput = page.locator("#newsletter-email");
  expect(
    await newsletterText.evaluate(
      element => element.getBoundingClientRect().height
    )
  ).toBeGreaterThan(0);
  expect(
    await newsletterInput.evaluate(
      element => element.getBoundingClientRect().height
    )
  ).toBeGreaterThan(0);
  expect(await contrastRatio(page, newsletterText)).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page, newsletterInput)).toBeGreaterThanOrEqual(
    4.5
  );
});
