/**
 * Competitor Monitor
 *
 * Fetches competitor pricing from Viator and compares with WIRO pricing.
 * Generates a text report and notifies Eli via Telegram.
 */

const VIATOR_URL = "https://www.viator.com/Chiang-Mai/d343-ttd";

interface CompetitorPrice {
  tourName: string;
  price: number | null;
  currency: string;
}

interface CompetitorReport {
  timestamp: string;
  viatorTours: CompetitorPrice[];
  wiroPrices: Record<string, number>;
  findings: string[];
}

async function fetchViatorPrices(): Promise<CompetitorPrice[]> {
  try {
    const response = await fetch(VIATOR_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(
        `[CompetitorMonitor] Viator fetch failed: ${response.status}`
      );
      return [];
    }

    const html = await response.text();

    // Extract prices from HTML using simple regex patterns
    const pricePattern =
      /\$[\d,]+(?:\.\d{2})?|฿[\d,]+(?:\.\d{2})?|€[\d,]+(?:\.\d{2})?/g;
    const tourNamePattern =
      /class="(?:card|tour|title)"[^>]*>([^<]+)<\/(?:div|h|span)/gi;

    const prices = html.match(pricePattern) || [];
    const tourNames = html.match(tourNamePattern) || [];

    const result: CompetitorPrice[] = [];
    for (let i = 0; i < Math.min(tourNames.length, prices.length); i++) {
      const name = tourNames[i]
        ?.replace(/class="[^"]*">/i, "")
        .replace(/<\/[^>]+>/, "")
        .trim();
      const priceStr = prices[i];

      if (!name || !priceStr) continue;

      let price = 0;
      let currency = "USD";

      if (priceStr.startsWith("$")) {
        currency = "USD";
        price = parseFloat(priceStr.replace(/[$,]/g, ""));
      } else if (priceStr.startsWith("฿")) {
        currency = "THB";
        price = parseFloat(priceStr.replace(/[฿,]/g, ""));
      } else if (priceStr.startsWith("€")) {
        currency = "EUR";
        price = parseFloat(priceStr.replace(/[€,]/g, ""));
      }

      if (price > 0 && name.length < 100) {
        result.push({ tourName: name, price, currency });
      }
    }

    console.log(
      `[CompetitorMonitor] Fetched ${result.length} competitor tours`
    );
    return result;
  } catch (err) {
    console.error("[CompetitorMonitor] Fetch error:", err);
    return [];
  }
}

function buildReport(
  viatorTours: CompetitorPrice[],
  wiroPrices: Record<string, number>
): CompetitorReport {
  const findings: string[] = [];

  if (viatorTours.length === 0) {
    findings.push("⚠️  Could not fetch Viator pricing data");
  } else {
    const avgViatorPrice =
      viatorTours.reduce((sum, t) => sum + (t.price ?? 0), 0) /
      viatorTours.length;
    const avgWiroPrice =
      Object.values(wiroPrices).reduce((a, b) => a + b, 0) /
      Object.keys(wiroPrices).length;

    findings.push(`Average Viator price: $${avgViatorPrice.toFixed(0)}`);
    findings.push(`Average WIRO price: ฿${avgWiroPrice.toFixed(0)}`);

    // Convert to same currency for comparison (rough: 1 USD ≈ 33 THB)
    const viatorInTHB = avgViatorPrice * 33;
    const diff = ((avgWiroPrice - viatorInTHB) / viatorInTHB) * 100;

    if (diff > 10) {
      findings.push(
        `📈 WIRO prices are ${diff.toFixed(0)}% higher than Viator`
      );
    } else if (diff < -10) {
      findings.push(
        `📉 WIRO prices are ${Math.abs(diff).toFixed(0)}% lower than Viator`
      );
    } else {
      findings.push("✅ WIRO prices are competitive");
    }
  }

  return {
    timestamp: new Date().toISOString(),
    viatorTours,
    wiroPrices,
    findings,
  };
}

export async function checkCompetitors(): Promise<CompetitorReport> {
  const viatorTours = await fetchViatorPrices();

  const wiroPrices: Record<string, number> = {
    "Doi Inthanon": 3500,
    "Doi Suthep": 2000,
    "Mae Wang": 3500,
    "Mae Kampong": 2500,
    "Sticky Waterfalls": 3000,
    "Samoeng Loop": 3200,
  };

  const report = buildReport(viatorTours, wiroPrices);

  // Notify Eli
  try {
    const { notifyCompetitorReport } = await import("./eliNotify");
    const reportText =
      report.findings.join("\n") +
      `\n\n📊 Data: ${viatorTours.length} Viator tours analyzed`;
    await notifyCompetitorReport(reportText);
  } catch (err) {
    console.error("[CompetitorMonitor] Failed to notify Eli:", err);
  }

  return report;
}
