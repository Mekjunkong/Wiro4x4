/**
 * Post-Tour Upsell Service
 *
 * Schedules and sends upsell emails 3 days after tour completion.
 * Uses /tmp/wiro_upsells.json for persistence.
 *
 * scheduleUpsell() is called when a booking status changes to "completed".
 * processUpsells() is called by the scheduler and /agent/upsells/process endpoint.
 */

import fs from "fs/promises";

const UPSELL_FILE = "/tmp/wiro_upsells.json";

interface UpsellEntry {
  bookingId: number;
  customerName: string;
  customerEmail: string | null;
  sendTime: string; // ISO date — completedAt + 3 days
  sent: boolean;
  createdAt: string;
}

async function readUpsells(): Promise<UpsellEntry[]> {
  try {
    const raw = await fs.readFile(UPSELL_FILE, "utf-8");
    return JSON.parse(raw) as UpsellEntry[];
  } catch {
    return [];
  }
}

async function writeUpsells(entries: UpsellEntry[]): Promise<void> {
  await fs.writeFile(UPSELL_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

/**
 * Schedule an upsell for a completed booking.
 * sendTime = completedAt + 3 days.
 */
export async function scheduleUpsell(params: {
  bookingId: number;
  customerName: string;
  customerEmail?: string | null;
  completedAt: Date | string;
}): Promise<void> {
  const completed =
    typeof params.completedAt === "string"
      ? new Date(params.completedAt)
      : params.completedAt;

  const sendTime = new Date(completed.getTime() + 3 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const upsells = await readUpsells();

  // Idempotent: replace any existing entry for this booking
  const filtered = upsells.filter(u => u.bookingId !== params.bookingId);

  filtered.push({
    bookingId: params.bookingId,
    customerName: params.customerName,
    customerEmail: params.customerEmail ?? null,
    sendTime: sendTime.toISOString(),
    sent: false,
    createdAt: now.toISOString(),
  });

  await writeUpsells(filtered);
  console.log(
    `[Upsell] Scheduled upsell for booking #${params.bookingId} at ${sendTime.toISOString()}`
  );
}

/**
 * Process all pending upsells — sends email + Telegram for any due entries.
 * Returns the number of upsells sent.
 */
export async function processUpsells(): Promise<number> {
  const upsells = await readUpsells();
  const now = new Date();
  let sentCount = 0;

  const updated: UpsellEntry[] = [];

  for (const entry of upsells) {
    if (entry.sent) {
      updated.push(entry);
      continue;
    }

    const sendTime = new Date(entry.sendTime);
    if (sendTime <= now) {
      try {
        await sendUpsellEmail(entry);
        await sendUpsellTelegram(entry);
        entry.sent = true;
        sentCount++;
      } catch (err) {
        console.error(
          `[Upsell] Failed to send upsell for booking #${entry.bookingId}:`,
          err
        );
      }
    }

    updated.push(entry);
  }

  await writeUpsells(updated);
  console.log(
    `[Upsell] Processed upsells: ${sentCount} sent, ${updated.filter(u => !u.sent).length} pending`
  );

  return sentCount;
}

// ── Email via Resend ────────────────────────────────────────────────────────

async function sendUpsellEmail(entry: UpsellEntry): Promise<void> {
  if (!entry.customerEmail) {
    console.log(
      `[Upsell] No email for booking #${entry.bookingId} — skipping email`
    );
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = buildUpsellHtml(entry.customerName);

  await resend.emails.send({
    from: "WIRO 4x4 <wiro.adventures@gmail.com>",
    to: entry.customerEmail,
    subject: "How was your WIRO 4x4 adventure? 🏎️ We'd love to hear from you!",
    html,
  });

  console.log(`[Upsell] Email sent to ${entry.customerEmail}`);
}

function buildUpsellHtml(customerName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>WIRO 4x4 — We'd love to have you back!</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color:#e67e22;">Hey ${customerName}! 🏎️</h2>
  <p>Hope you had an amazing time on your WIRO 4x4 adventure in Chiang Mai!</p>
  <p>We'd love to have you back for another tour. Here are some popular options:</p>
  <ul>
    <li><strong>Doi Inthanon</strong> — Thailand's highest peak, waterfalls & hill tribes — from ฿3,500</li>
    <li><strong>Mae Wang Jungle</strong> — bamboo rafting, elephants & waterfalls — from ฿3,500</li>
    <li><strong>Multi-Day Adventure</strong> — explore more of Northern Thailand — from ฿7,500</li>
  </ul>
  <p>Reply to this email or message us on WhatsApp for the best availability!</p>
  <p style="margin-top:24px;">Safe travels,<br/><strong>Wiro & the WIRO 4x4 Team</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:12px;color:#999;">
    WIRO 4x4 — Kosher Off-Road Adventures · Chiang Mai, Thailand<br/>
    <a href="https://wiro4x4indochina.com">wiro4x4indochina.com</a>
  </p>
</body>
</html>`;
}

// ── Telegram notification ───────────────────────────────────────────────────

async function sendUpsellTelegram(entry: UpsellEntry): Promise<void> {
  try {
    const { notifyUpsellSent } = await import("./eliNotify");
    await notifyUpsellSent({
      bookingId: entry.bookingId,
      customerName: entry.customerName,
      customerEmail: entry.customerEmail ?? undefined,
    });
  } catch (err) {
    console.error("[Upsell] Telegram notify failed:", err);
  }
}
