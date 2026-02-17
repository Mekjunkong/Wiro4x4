import type { Subscriber } from "../drizzle/schema";
import { getBlogPostById } from "./db";

let _resend: any = null;

function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Newsletter] No RESEND_API_KEY — emails will not be sent");
      return null;
    }
    const { Resend } = require("resend");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export async function sendNewsletterEmail(
  blogPostId: number,
  subscribers: Subscriber[],
  subject?: string
): Promise<number> {
  const resend = getResend();
  if (!resend) {
    console.warn("[Newsletter] Resend not configured, skipping email send");
    return 0;
  }

  const post = await getBlogPostById(blogPostId);
  if (!post) {
    console.error(`[Newsletter] Blog post ${blogPostId} not found`);
    return 0;
  }

  const siteUrl = process.env.SITE_URL || "https://wiro4x4.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const emailSubject = subject || `New from WIRO 4x4: ${post.title}`;

  let sent = 0;
  for (const sub of subscribers) {
    try {
      const isHe = sub.language === "he";
      const title = isHe && post.titleHe ? post.titleHe : post.title;
      const excerpt =
        isHe && post.excerptHe ? post.excerptHe : post.excerpt || "";
      const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`;

      await resend.emails.send({
        from: "WIRO 4x4 <updates@wiro4x4.com>",
        to: sub.email,
        subject: emailSubject,
        html: `
          <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
            <h1 style="color:#1c1c1c;">${title}</h1>
            ${post.coverImage ? `<img src="${post.coverImage}" alt="${title}" style="width:100%;border-radius:8px;margin:16px 0;" />` : ""}
            <p style="color:#555;font-size:16px;line-height:1.6;">${excerpt}</p>
            <a href="${postUrl}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;">
              ${isHe ? "קראו עוד" : "Read More"}
            </a>
            <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
            <p style="font-size:12px;color:#999;">
              <a href="${unsubscribeUrl}" style="color:#999;">${isHe ? "ביטול הרשמה" : "Unsubscribe"}</a>
            </p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`[Newsletter] Failed to send to ${sub.email}:`, err);
    }
  }

  return sent;
}
