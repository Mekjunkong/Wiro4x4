import {
  addChatMessage,
  createChatSession,
  getChatMessagesBySessionId,
  getChatSessionByVisitorId,
  updateChatSessionBookingContext,
  updateChatSessionSummary,
} from "./db/chat";
import type { LeviBookingState } from "./leviBooking";

export async function persistLeviExchange(args: {
  visitorId: string;
  messageId: string;
  language: "en" | "he";
  customerMessage: string;
  leviReply: string;
  bookingState: LeviBookingState;
  provider: "levi-vps" | "fallback";
  latencyMs: number;
}) {
  const session = await getChatSessionByVisitorId(args.visitorId);
  const sessionId =
    session?.id ??
    (await createChatSession({
      visitorId: args.visitorId,
      language: args.language,
    }));

  const existingMessages = await getChatMessagesBySessionId(sessionId);
  const alreadyStored = existingMessages.some(message => {
    if (!message.metadata) return false;
    try {
      return JSON.parse(message.metadata).messageId === args.messageId;
    } catch {
      return false;
    }
  });
  if (alreadyStored) return { sessionId, duplicate: true };

  await addChatMessage({
    sessionId,
    role: "visitor",
    content: args.customerMessage,
    metadata: JSON.stringify({ messageId: args.messageId }),
  });
  await addChatMessage({
    sessionId,
    role: "ai",
    content: args.leviReply,
    metadata: JSON.stringify({
      messageId: args.messageId,
      provider: args.provider,
      latencyMs: args.latencyMs,
    }),
  });
  await updateChatSessionBookingContext(
    sessionId,
    JSON.stringify(args.bookingState)
  );
  await updateChatSessionSummary(
    sessionId,
    `Levi chat: ${args.bookingState.intent}, ${args.bookingState.completionPercent}% complete`
  );

  return { sessionId, duplicate: false };
}
