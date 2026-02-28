/**
 * AI auto-response for new leads.
 * Generates personalized initial response using Gemini 2.5 Flash via invokeLLM().
 * Sends via Resend to the lead's email.
 */

import { invokeLLM } from "./_core/llm";
import { getAllActiveTours } from "./db";
import { Resend } from "resend";
import {
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_SENDER_EMAIL,
  COMPANY_WHATSAPP,
  COMPANY_WEBSITE,
} from "@shared/const";

const SENDER_EMAIL = COMPANY_SENDER_EMAIL;

// Lazy Resend instance
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface LeadInfo {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  interestedTours?: string;
  message?: string;
}

/**
 * Generate and send an AI-powered auto-response to a new lead.
 * This runs asynchronously and should not block the lead.create response.
 */
export async function sendAutoResponse(lead: LeadInfo): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[AutoResponse] Resend API key not configured, skipping auto-response"
      );
      return false;
    }

    // Fetch active tours for context
    const activeTours = await getAllActiveTours();
    const tourList = activeTours
      .map(
        t =>
          `- ${t.name}: ${t.description?.substring(0, 100)}... (${t.duration}, ฿${t.price})`
      )
      .join("\n");

    // Generate response using LLM
    const prompt = `You are a friendly tour operator for WIRO 4x4, a kosher off-road tour company in Chiang Mai, Thailand.
Write a warm, personalized email response to a new inquiry.

Lead info:
- Name: ${lead.name}
- Source: ${lead.source || "website"}
- Interested in: ${lead.interestedTours || "Not specified"}
- Their message: ${lead.message || "No message provided"}

Available tours:
${tourList || "Various kosher off-road adventures in Northern Thailand"}

Requirements:
- Be warm and personal, use their name
- Suggest 2-3 relevant tours based on their interest
- Mention pricing overview
- Include WhatsApp number (${COMPANY_PHONE}) for quick questions
- Keep it under 300 words
- End with a clear call to action (book or WhatsApp for details)
- Do NOT use markdown formatting — this is a plain text email
- Sign off as "The WIRO 4x4 Team"`;

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You write warm, professional emails for a kosher tour operator. Be concise and helpful.",
        },
        { role: "user", content: prompt },
      ],
    });

    const responseText =
      typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "";

    if (!responseText) {
      console.error("[AutoResponse] LLM returned empty response");
      return false;
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [lead.email],
      subject: `Welcome to WIRO 4x4! Let's plan your Chiang Mai adventure`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
  .content { background: #fff; padding: 25px; border: 1px solid #e0e0e0; }
  .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 13px; }
  .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">Welcome to WIRO 4x4!</h2>
      <p style="margin:5px 0 0 0;opacity:0.9;">Kosher Off-Road Adventures in Chiang Mai</p>
    </div>
    <div class="content">
      ${responseText
        .split("\n")
        .map(line => (line.trim() ? `<p>${line}</p>` : ""))
        .join("")}
      <div style="text-align:center;margin:20px 0;">
        <a href="https://wa.me/${COMPANY_WHATSAPP}" class="whatsapp-btn">Chat on WhatsApp</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong></p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
      <p><a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
    </div>
  </div>
</body>
</html>`,
    });

    if (error) {
      console.error("[AutoResponse] Failed to send:", error);
      return false;
    }

    console.log(`[AutoResponse] Auto-response sent to ${lead.email}`);
    return true;
  } catch (error) {
    console.error("[AutoResponse] Error:", error);
    return false;
  }
}
