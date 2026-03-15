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

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("[Notification] OWNER_EMAIL not configured");
    return false;
  }

  const resend = await getResendClient();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: "notifications@wiro4x4indochina.com",
      to: ownerEmail,
      subject: title.trim(),
      html: `
        <h2>${title.trim()}</h2>
        <div>${content.trim().replace(/\n/g, "<br>")}</div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent from Wiro 4x4 Notification System
        </p>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Notification] Email failed:", error);
    return false;
  }
}
