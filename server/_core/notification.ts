import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

let resendClient: any = null;

async function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Notification] RESEND_API_KEY not configured — notifications disabled"
      );
      return null;
    }
    const { Resend } = await import("resend");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmailNotification(title: string, content: string) {
  const ownerEmail = process.env.OWNER_EMAIL;
  const hasEmailConfig = Boolean(ownerEmail && process.env.RESEND_API_KEY);
  if (!hasEmailConfig) return false;

  const resend = await getResendClient();
  if (!resend) return false;

  await resend.emails.send({
    from: "notifications@wiro4x4indochina.com",
    to: ownerEmail,
    subject: title,
    html: `
      <h2>${escapeHtml(title)}</h2>
      <div>${escapeHtml(content).replace(/\n/g, "<br>")}</div>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sent from Wiro 4x4 Notification System
      </p>
    `,
  });
  return true;
}

async function sendTelegramNotification(title: string, content: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: [`WIRO 4x4: ${title}`, "", content].join("\n").slice(0, 4096),
      }),
    }
  );

  if (!response.ok) {
    console.error("[Notification] Telegram failed:", await response.text());
    return false;
  }
  return true;
}

export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = payload;

  if (!title?.trim() || !content?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title and content are required.",
    });
  }

  try {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (await sendEmailNotification(cleanTitle, cleanContent)) {
      return true;
    }

    if (await sendTelegramNotification(cleanTitle, cleanContent)) {
      return true;
    }

    console.warn(
      "[Notification] No owner notification channel configured. Set OWNER_EMAIL plus RESEND_API_KEY, or TELEGRAM_BOT_TOKEN plus TELEGRAM_CHAT_ID."
    );
    return false;
  } catch (error) {
    console.error("[Notification] Delivery failed:", error);
    return false;
  }
}
