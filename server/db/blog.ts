import { eq, sql, and, lte } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { blogPosts, InsertBlogPost } from "../../drizzle/schema";
import { COMPANY_WHATSAPP, COMPANY_WHATSAPP_DISPLAY } from "../../shared/const";

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(blogPosts).values(post);
}

export async function getAllPublishedBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(blogPosts)
    .where(
      and(eq(blogPosts.isPublished, 1), lte(blogPosts.publishedAt, sql`NOW()`))
    )
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Retired WhatsApp number that older posts still link to. */
const OLD_WHATSAPP = /(?:\+?66[\s-]?)?0?92[\s-]?989[\s-]?4495|66929894495/g;

/** Points any retired WhatsApp number in post text at the current one. */
export function withCurrentWhatsApp<T extends { content?: string | null }>(
  post: T
): T {
  if (!post.content) return post;
  const content = post.content.replace(OLD_WHATSAPP, match =>
    /^\d+$/.test(match) ? COMPANY_WHATSAPP : COMPANY_WHATSAPP_DISPLAY
  );
  return content === post.content ? post : { ...post, content };
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.isPublished, 1),
        lte(blogPosts.publishedAt, sql`NOW()`)
      )
    )
    .limit(1);
  return result.length > 0 ? withCurrentWhatsApp(result[0]) : undefined;
}

export async function updateBlogPost(
  id: number,
  data: Partial<InsertBlogPost>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function getAllBlogPostsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
