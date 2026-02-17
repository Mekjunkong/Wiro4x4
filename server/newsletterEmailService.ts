import type { Subscriber } from "../drizzle/schema";

/**
 * Sends a blog post to active newsletter subscribers.
 * Stub -- implemented in Task 6.
 */
export async function sendNewsletterEmail(
  blogPostId: number,
  subscribers: Subscriber[],
  subject?: string
): Promise<number> {
  // TODO: implement with Resend in Task 6
  console.log(
    `[Newsletter] Would send post ${blogPostId} to ${subscribers.length} subscribers`
  );
  return subscribers.length;
}
