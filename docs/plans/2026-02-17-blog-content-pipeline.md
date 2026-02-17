# Blog Content Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the blog lifecycle with AI content generation (Claude API), a rich markdown editor with image uploads, and a distribution engine (RSS, search, social sharing, newsletter send).

**Architecture:** The admin Blog tab gets three new capabilities layered on the existing tRPC + Drizzle + React stack. The AI generator calls Claude API server-side via a new `blog.generateDraft` procedure. The rich editor replaces plain textareas with a split-pane markdown editor + toolbar + S3 image upload. Distribution adds an Express RSS endpoint, client-side blog search/filter, social share buttons on posts, and a newsletter send procedure using Resend.

**Tech Stack:** React 19, TypeScript, tRPC 11, Drizzle ORM, Vitest, Claude API (Anthropic SDK), Resend, Express, S3 via `storagePut()`, shadcn/ui components.

---

## Existing Infrastructure (DO NOT recreate)

These already exist in the codebase — tasks reference them, don't rebuild:

- `drizzle/schema.ts` — `subscribers` table (lines 339-348), `blogPosts` table (lines 293-312)
- `server/db.ts` — `createSubscriber`, `getSubscriberByEmail`, all blog CRUD helpers
- `server/routes/newsletter.ts` — `newsletter.subscribe` procedure with rate limiting
- `server/routes/blog.ts` — full blog CRUD (list, getBySlug, listAll, create, update, delete)
- `server/routes/_helpers.ts` — `securePublicProcedure`, `secureProtectedProcedure`, `checkAdminRateLimit`, `logAdminAction`
- `server/test-helpers.ts` — `createAuthContext`, `createPublicContext`, `itWithDb`
- `client/src/components/NewsletterSignup.tsx` — newsletter form in footer
- `client/src/components/blog/MarkdownRenderer.tsx` — markdown-to-JSX renderer
- `client/src/components/admin/BlogTab.tsx` — existing blog admin with textarea editor
- `server/storage.ts` — `storagePut()` for S3 uploads

---

## Task 1: Add newsletter DB helpers and `newsletter.list` + `newsletter.send` procedures

**Files:**

- Modify: `server/db.ts` (add `getAllActiveSubscribers`)
- Modify: `server/routes/newsletter.ts` (add `list`, `unsubscribe`, `send` procedures)
- Modify: `shared/schemas.ts` (add `newsletterSendSchema`)
- Test: `server/newsletter.test.ts` (create new)

**Step 1: Write failing tests for newsletter procedures**

Create `server/newsletter.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("newsletter.subscribe (public)", () => {
  it("subscribes a new email", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.subscribe({
      email: `test-${Date.now()}@example.com`,
      language: "en",
    });
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it("handles duplicate subscription idempotently", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const email = `dup-${Date.now()}@example.com`;
    await caller.newsletter.subscribe({ email, language: "en" });
    const result = await caller.newsletter.subscribe({ email, language: "en" });
    expect(result.success).toBe(true);
  });
});

describe("newsletter.list (admin)", () => {
  it("returns subscriber list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("newsletter.unsubscribe (public)", () => {
  it("deactivates a subscriber", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.unsubscribe({
      email: "nonexistent@example.com",
    });
    // Should succeed silently even if email doesn't exist
    expect(result.success).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/newsletter.test.ts`
Expected: FAIL — `newsletter.list`, `newsletter.unsubscribe` not defined.

**Step 3: Add DB helpers**

In `server/db.ts`, after the existing `getSubscriberByEmail` function (~line 810), add:

```typescript
export async function getAllActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.isActive, 1))
    .orderBy(desc(subscribers.subscribedAt));
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.subscribedAt));
}

export async function deactivateSubscriber(email: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(subscribers)
    .set({ isActive: 0 })
    .where(eq(subscribers.email, email));
}
```

**Step 4: Add procedures to newsletter router**

Replace `server/routes/newsletter.ts` with expanded version adding `list`, `unsubscribe`, and `send`:

```typescript
import { z } from "zod";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkRateLimit,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createSubscriber,
  getSubscriberByEmail,
  getAllSubscribers,
  getAllActiveSubscribers,
  deactivateSubscriber,
  getBlogPostBySlug,
} from "../db";
import { sendNewsletterEmail } from "../newsletterEmailService";

export const newsletterRouter = router({
  subscribe: securePublicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        language: z.string().default("en"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`newsletter:${ip}`, 5, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }
      const existing = await getSubscriberByEmail(input.email);
      if (existing) {
        return { success: true, message: "Already subscribed" };
      }
      await createSubscriber(input);
      return { success: true, message: "Successfully subscribed!" };
    }),

  unsubscribe: securePublicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await deactivateSubscriber(input.email);
      return { success: true, message: "Unsubscribed successfully" };
    }),

  list: secureProtectedProcedure.query(async () => {
    return await getAllSubscribers();
  }),

  send: secureProtectedProcedure
    .input(
      z.object({
        blogPostId: z.number(),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const subscribers = await getAllActiveSubscribers();
      if (subscribers.length === 0) {
        return { success: true, sent: 0, message: "No active subscribers" };
      }
      // sendNewsletterEmail is implemented in Task 6
      const sent = await sendNewsletterEmail(
        input.blogPostId,
        subscribers,
        input.subject
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "send_newsletter",
        resourceType: "newsletter",
        newValue: JSON.stringify({
          blogPostId: input.blogPostId,
          recipientCount: sent,
        }),
      });
      return { success: true, sent, message: `Sent to ${sent} subscribers` };
    }),
});
```

**Step 5: Create stub for `newsletterEmailService.ts`**

Create `server/newsletterEmailService.ts`:

```typescript
import type { Subscriber } from "../drizzle/schema";

/**
 * Sends a blog post to active newsletter subscribers.
 * Stub — implemented in Task 6.
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
```

**Step 6: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/newsletter.test.ts`
Expected: PASS (4 tests)

**Step 7: Commit**

```bash
git add server/newsletter.test.ts server/db.ts server/routes/newsletter.ts server/newsletterEmailService.ts shared/schemas.ts
git commit -m "feat: add newsletter list, unsubscribe, and send procedures"
```

---

## Task 2: Add AI content generation procedure (`blog.generateDraft`)

**Files:**

- Create: `server/aiContentGenerator.ts`
- Modify: `server/routes/blog.ts` (add `generateDraft` procedure)
- Test: `server/aiContentGenerator.test.ts` (create new)

**Step 1: Write failing test**

Create `server/aiContentGenerator.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";
import { generateBlogDraft } from "./aiContentGenerator";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              title: "Best Time to Visit Chiang Mai",
              titleHe: "הזמן הטוב ביותר לבקר בצ'יאנג מאי",
              slug: "best-time-visit-chiang-mai",
              excerpt: "A guide to seasons and weather.",
              excerptHe: "מדריך לעונות ומזג האוויר.",
              content: "# Best Time to Visit\n\nNovember to February is ideal.",
              contentHe: "# הזמן הטוב ביותר\n\nנובמבר עד פברואר הוא אידיאלי.",
              category: "Travel Tips",
              tags: "weather,seasons,chiang-mai",
            }),
          },
        ],
      }),
    };
  },
}));

describe("generateBlogDraft", () => {
  it("returns bilingual draft with all required fields", async () => {
    const result = await generateBlogDraft({
      topic: "Best Time to Visit Chiang Mai",
      tone: "informative",
      length: 1000,
      tourData: [],
    });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("titleHe");
    expect(result).toHaveProperty("slug");
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("contentHe");
    expect(result).toHaveProperty("excerpt");
    expect(result).toHaveProperty("excerptHe");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("tags");
  });

  it("handles missing fields gracefully with defaults", async () => {
    const result = await generateBlogDraft({
      topic: "Test Topic",
      tone: "adventurous",
      length: 500,
      tourData: [],
    });

    expect(typeof result.title).toBe("string");
    expect(result.title.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/aiContentGenerator.test.ts`
Expected: FAIL — module not found.

**Step 3: Install Anthropic SDK**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm add @anthropic-ai/sdk`

**Step 4: Implement `aiContentGenerator.ts`**

Create `server/aiContentGenerator.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import type { Tour } from "../drizzle/schema";

interface GenerateOptions {
  topic: string;
  tone: "informative" | "adventurous" | "practical";
  length: number; // target word count
  tourData: Pick<
    Tour,
    "name" | "nameHe" | "slug" | "description" | "price" | "duration"
  >[];
}

interface BlogDraft {
  title: string;
  titleHe: string;
  slug: string;
  excerpt: string;
  excerptHe: string;
  content: string;
  contentHe: string;
  category: string;
  tags: string;
}

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for AI content generation"
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

function buildSystemPrompt(tourData: GenerateOptions["tourData"]): string {
  const tourList =
    tourData.length > 0
      ? tourData
          .map(
            t =>
              `- ${t.name} (${t.nameHe}): ${t.duration}, ฿${t.price} — /tours/${t.slug}`
          )
          .join("\n")
      : "No tour data available.";

  return `You are a content writer for WIRO 4x4, a kosher off-road tour company in Chiang Mai, Northern Thailand.

Brand voice: adventurous yet professional, warm and welcoming to Israeli travelers. You are experts in Northern Thailand, kosher dining, and off-road 4x4 adventures.

Available tours:
${tourList}

Writing rules:
- Write content in Markdown format (use ##, ###, -, **, etc.)
- Include internal links to tour pages using /tours/<slug> format
- Optimize for SEO: use the topic keywords naturally in headings and first paragraph
- Be specific with local knowledge (place names, Thai words, practical tips)
- Hebrew content must be natural Hebrew, NOT machine-translated

You MUST respond with a valid JSON object containing these exact fields:
- title: English title (SEO-optimized)
- titleHe: Hebrew title
- slug: URL-friendly slug (lowercase, hyphens)
- excerpt: 1-2 sentence English summary for preview cards
- excerptHe: Hebrew summary
- content: Full English article in Markdown
- contentHe: Full Hebrew article in Markdown
- category: One of: "Travel Tips", "Food & Kosher", "Culture", "Adventure", "Guides"
- tags: Comma-separated lowercase tags

Respond ONLY with the JSON object, no other text.`;
}

export async function generateBlogDraft(
  options: GenerateOptions
): Promise<BlogDraft> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: buildSystemPrompt(options.tourData),
    messages: [
      {
        role: "user",
        content: `Write a ${options.length}-word ${options.tone} blog article about: "${options.topic}"`,
      },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return {
      title: parsed.title || options.topic,
      titleHe: parsed.titleHe || "",
      slug:
        parsed.slug || options.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: parsed.excerpt || "",
      excerptHe: parsed.excerptHe || "",
      content: parsed.content || "",
      contentHe: parsed.contentHe || "",
      category: parsed.category || "Travel Tips",
      tags: parsed.tags || "",
    };
  } catch {
    // If JSON parsing fails, treat entire response as English content
    return {
      title: options.topic,
      titleHe: "",
      slug: options.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: text.slice(0, 200),
      excerptHe: "",
      content: text,
      contentHe: "",
      category: "Travel Tips",
      tags: "",
    };
  }
}
```

**Step 5: Add `generateDraft` procedure to blog router**

In `server/routes/blog.ts`, add import and procedure:

```typescript
// Add to imports:
import { generateBlogDraft } from "../aiContentGenerator";
import { getAllActiveTours } from "../db";

// Add to blogRouter object, after the existing delete procedure:
  generateDraft: secureProtectedProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        tone: z.enum(["informative", "adventurous", "practical"]).default("informative"),
        length: z.number().min(300).max(3000).default(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const tours = await getAllActiveTours();
      const tourData = tours.map(t => ({
        name: t.name,
        nameHe: t.nameHe,
        slug: t.slug,
        description: t.description,
        price: t.price,
        duration: t.duration,
      }));
      const draft = await generateBlogDraft({ ...input, tourData });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "generate_draft",
        resourceType: "blog",
        newValue: JSON.stringify({ topic: input.topic }),
      });
      return draft;
    }),
```

**Step 6: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/aiContentGenerator.test.ts`
Expected: PASS (2 tests)

**Step 7: Commit**

```bash
git add server/aiContentGenerator.ts server/aiContentGenerator.test.ts server/routes/blog.ts package.json pnpm-lock.yaml
git commit -m "feat: add AI blog content generation with Claude API"
```

---

## Task 3: Add blog image upload procedure

**Files:**

- Modify: `server/routes/blog.ts` (add `uploadImage` procedure)
- Test: `server/blog.test.ts` (add upload test)

**Step 1: Write failing test**

Add to `server/blog.test.ts`:

```typescript
describe("blog.uploadImage", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.blog.uploadImage({
        fileName: "test.jpg",
        fileData: "base64data",
        contentType: "image/jpeg",
      })
    ).rejects.toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/blog.test.ts`
Expected: FAIL — `blog.uploadImage` not defined.

**Step 3: Add `uploadImage` procedure to blog router**

In `server/routes/blog.ts`, add:

```typescript
// Add to imports:
import { storagePut } from "../storage";

// Add to blogRouter:
  uploadImage: secureProtectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileData: z.string().min(1), // base64
        contentType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const buffer = Buffer.from(input.fileData, "base64");
      const key = `blog/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "upload_image",
        resourceType: "blog",
        newValue: JSON.stringify({ fileName: input.fileName, url }),
      });
      return { url };
    }),
```

**Step 4: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/blog.test.ts`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add server/routes/blog.ts server/blog.test.ts
git commit -m "feat: add blog image upload via S3"
```

---

## Task 4: Add RSS feed Express endpoint

**Files:**

- Create: `server/routes/rss.ts`
- Modify: `server/_core/index.ts` (register RSS route)
- Test: `server/rss.test.ts` (create new)

**Step 1: Write failing test**

Create `server/rss.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { generateRssFeed } from "./routes/rss";

describe("RSS feed generation", () => {
  it("returns valid XML with no posts", () => {
    const xml = generateRssFeed([], "https://wiro4x4.com");
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("WIRO 4x4");
  });

  it("includes published posts in feed", () => {
    const posts = [
      {
        title: "Test Post",
        slug: "test-post",
        excerpt: "A test excerpt",
        publishedAt: new Date("2026-01-15"),
        content: "Full content here",
        author: "WIRO 4x4",
      },
    ];
    const xml = generateRssFeed(posts as any, "https://wiro4x4.com");
    expect(xml).toContain("<item>");
    expect(xml).toContain("<title>Test Post</title>");
    expect(xml).toContain("/blog/test-post");
  });

  it("escapes XML special characters", () => {
    const posts = [
      {
        title: "Tips & Tricks <2026>",
        slug: "tips-tricks",
        excerpt: 'Use "quotes" & <tags>',
        publishedAt: new Date("2026-01-15"),
        content: "",
        author: "WIRO 4x4",
      },
    ];
    const xml = generateRssFeed(posts as any, "https://wiro4x4.com");
    expect(xml).toContain("&amp;");
    expect(xml).not.toContain("& ");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/rss.test.ts`
Expected: FAIL — module not found.

**Step 3: Implement RSS feed generator**

Create `server/routes/rss.ts`:

```typescript
import type { Express } from "express";
import { getAllPublishedBlogPosts } from "../db";
import type { BlogPost } from "../../drizzle/schema";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateRssFeed(
  posts: Pick<
    BlogPost,
    "title" | "slug" | "excerpt" | "publishedAt" | "author"
  >[],
  siteUrl: string
): string {
  const items = posts
    .map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${escapeXml(post.slug)}</link>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
      <guid>${siteUrl}/blog/${escapeXml(post.slug)}</guid>
      <author>${escapeXml(post.author || "WIRO 4x4")}</author>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WIRO 4x4 — Travel Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Travel tips, kosher dining guides, and adventure stories from Northern Thailand</description>
    <language>en</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function registerRssRoute(app: Express) {
  app.get("/api/rss", async (_req, res) => {
    try {
      const posts = await getAllPublishedBlogPosts();
      const siteUrl = process.env.SITE_URL || "https://wiro4x4.com";
      const xml = generateRssFeed(posts, siteUrl);
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      console.error("[RSS] Failed to generate feed:", err);
      res.status(500).send("Failed to generate RSS feed");
    }
  });
}
```

**Step 4: Register the RSS route in Express**

In `server/_core/index.ts`, add after `registerOAuthRoutes(app);` (line 37):

```typescript
import { registerRssRoute } from "../routes/rss";
// ... after registerOAuthRoutes(app);
registerRssRoute(app);
```

**Step 5: Add RSS link to `client/index.html`**

In `client/index.html`, add inside `<head>` after the Twitter meta tags:

```html
<!-- RSS Feed -->
<link
  rel="alternate"
  type="application/rss+xml"
  title="WIRO 4x4 Blog"
  href="/api/rss"
/>
```

**Step 6: Run tests to verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/rss.test.ts`
Expected: PASS (3 tests)

**Step 7: Commit**

```bash
git add server/routes/rss.ts server/rss.test.ts server/_core/index.ts client/index.html
git commit -m "feat: add RSS feed endpoint at /api/rss"
```

---

## Task 5: Upgrade admin BlogTab with rich editor + AI generate button

**Files:**

- Create: `client/src/components/admin/MarkdownEditor.tsx`
- Create: `client/src/components/admin/GenerateArticleDialog.tsx`
- Modify: `client/src/components/admin/BlogTab.tsx`

**Step 1: Create the MarkdownEditor component**

Create `client/src/components/admin/MarkdownEditor.tsx`:

```typescript
import { useState, useRef, useCallback, useEffect } from "react";
import { MarkdownRenderer } from "@/components/blog";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  onImageUpload?: (file: File) => Promise<string>;
  storageKey?: string; // localStorage auto-save key
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  onChange: (val: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const newValue =
    value.slice(0, selectionStart) +
    before +
    selected +
    after +
    value.slice(selectionEnd);
  onChange(newValue);
  // Restore cursor after React re-render
  requestAnimationFrame(() => {
    textarea.selectionStart = selectionStart + before.length;
    textarea.selectionEnd = selectionStart + before.length + selected.length;
    textarea.focus();
  });
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  dir = "ltr",
  onImageUpload,
  storageKey,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    if (!storageKey || !value) return;
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, value);
    }, 30_000);
    return () => clearTimeout(timer);
  }, [value, storageKey]);

  const toolbar = useCallback(
    (action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const map: Record<string, [string, string]> = {
        bold: ["**", "**"],
        italic: ["*", "*"],
        h2: ["## ", "\n"],
        h3: ["### ", "\n"],
        link: ["[", "](url)"],
        list: ["- ", "\n"],
        ordered: ["1. ", "\n"],
        quote: ["> ", "\n"],
        code: ["`", "`"],
      };
      const [before, after] = map[action] || ["", ""];
      insertAtCursor(ta, before, after, onChange);
    },
    [onChange]
  );

  const handleImageUpload = useCallback(async () => {
    if (!onImageUpload) return;
    fileInputRef.current?.click();
  }, [onImageUpload]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;
      try {
        const url = await onImageUpload(file);
        const ta = textareaRef.current;
        if (ta) {
          insertAtCursor(ta, `![${file.name}](`, `${url})`, onChange);
        }
      } catch {
        // Error handled by caller
      }
      e.target.value = "";
    },
    [onImageUpload, onChange]
  );

  const buttons = [
    { icon: Bold, action: "bold", title: "Bold" },
    { icon: Italic, action: "italic", title: "Italic" },
    { icon: Heading2, action: "h2", title: "Heading 2" },
    { icon: Heading3, action: "h3", title: "Heading 3" },
    { icon: Link, action: "link", title: "Link" },
    { icon: List, action: "list", title: "Bullet list" },
    { icon: ListOrdered, action: "ordered", title: "Numbered list" },
    { icon: Quote, action: "quote", title: "Blockquote" },
    { icon: Code, action: "code", title: "Inline code" },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        {buttons.map(({ icon: Icon, action, title }) => (
          <button
            key={action}
            type="button"
            onClick={() => toolbar(action)}
            title={title}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        {onImageUpload && (
          <button
            type="button"
            onClick={handleImageUpload}
            title="Upload image"
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <Image className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1" />
        <div className="flex gap-1">
          {(["edit", "split", "preview"] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded text-xs ${mode === m ? "bg-primary text-white" : "hover:bg-muted"}`}
            >
              {m === "edit" ? (
                <Edit3 className="w-3 h-3" />
              ) : m === "preview" ? (
                <Eye className="w-3 h-3" />
              ) : (
                "Split"
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <div className={`flex ${mode === "split" ? "divide-x divide-border" : ""}`}>
        {mode !== "preview" && (
          <div className={mode === "split" ? "w-1/2" : "w-full"}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              dir={dir}
              className="w-full h-[400px] p-4 resize-none text-sm font-mono focus:outline-none"
            />
          </div>
        )}
        {mode !== "edit" && (
          <div
            className={`${mode === "split" ? "w-1/2" : "w-full"} h-[400px] overflow-y-auto p-4`}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Preview will appear here...
              </p>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
```

**Step 2: Create the GenerateArticleDialog component**

Create `client/src/components/admin/GenerateArticleDialog.tsx`:

```typescript
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TOPIC_LIBRARY = [
  "Kosher Dining Guide for Northern Thailand",
  "Shabbat-Friendly Accommodations in Chiang Mai",
  "Israeli Traveler Tips for Southeast Asia",
  "Cultural Etiquette Guide for Thailand/Laos/Vietnam",
  "Best Time to Visit Chiang Mai",
  "Packing List for Off-Road Adventures",
];

interface GenerateArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (draft: {
    title: string;
    titleHe: string;
    slug: string;
    excerpt: string;
    excerptHe: string;
    content: string;
    contentHe: string;
    category: string;
    tags: string;
  }) => void;
}

export function GenerateArticleDialog({
  open,
  onOpenChange,
  onGenerated,
}: GenerateArticleDialogProps) {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [tone, setTone] = useState<"informative" | "adventurous" | "practical">("informative");
  const [length, setLength] = useState(1000);

  const generateMut = trpc.blog.generateDraft.useMutation({
    onSuccess: draft => {
      toast.success("Article draft generated!");
      onGenerated(draft);
      onOpenChange(false);
      setTopic("");
      setCustomTopic("");
    },
    onError: error => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    const finalTopic = topic === "custom" ? customTopic : topic;
    if (!finalTopic) {
      toast.error("Please select or enter a topic");
      return;
    }
    generateMut.mutate({ topic: finalTopic, tone, length });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            Generate Article with AI
          </DialogTitle>
          <DialogDescription>
            Select a topic and style. Claude will generate a full bilingual draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="">Select a topic...</option>
              {TOPIC_LIBRARY.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="custom">Custom topic...</option>
            </select>
          </div>

          {topic === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1">Custom Topic</label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Enter your article topic"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tone</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as typeof tone)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="informative">Informative</option>
                <option value="adventurous">Adventurous</option>
                <option value="practical">Practical Guide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <select
                value={length}
                onChange={e => setLength(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value={500}>Short (~500 words)</option>
                <option value={1000}>Medium (~1000 words)</option>
                <option value={2000}>Long (~2000 words)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generateMut.isPending}
            className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm hover:bg-[#D4AF37]/90 flex items-center justify-center gap-2"
          >
            {generateMut.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Update BlogTab to use new components**

Replace the content/contentHe textareas in `client/src/components/admin/BlogTab.tsx` with the `MarkdownEditor` component, and add a "Generate Article" button that opens the `GenerateArticleDialog`.

Key changes to `BlogTab.tsx`:

- Import `MarkdownEditor` and `GenerateArticleDialog`
- Add `generateDialogOpen` state
- Add "Generate Article" button next to "+ New Post"
- Replace `<textarea>` for content with `<MarkdownEditor>`
- Wire `onGenerated` callback to populate `blogForm`
- Add `onImageUpload` handler that calls `trpc.blog.uploadImage`

(This is the largest file change — the full updated component replaces the 483-line `BlogTab.tsx`)

**Step 4: Export new components from admin index**

In `client/src/components/admin/index.ts`, add:

```typescript
export { MarkdownEditor } from "./MarkdownEditor";
export { GenerateArticleDialog } from "./GenerateArticleDialog";
```

**Step 5: Test manually**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`

- Navigate to `/admin` → Blog tab
- Verify "Generate Article" button appears
- Verify new post dialog shows MarkdownEditor with toolbar + split view
- Verify toolbar buttons insert markdown syntax

**Step 6: Commit**

```bash
git add client/src/components/admin/MarkdownEditor.tsx client/src/components/admin/GenerateArticleDialog.tsx client/src/components/admin/BlogTab.tsx client/src/components/admin/index.ts
git commit -m "feat: add rich markdown editor and AI article generation to blog admin"
```

---

## Task 6: Implement newsletter email sending with Resend

**Files:**

- Modify: `server/newsletterEmailService.ts` (implement real sending)
- Test: `server/newsletter.test.ts` (add send test)

**Step 1: Write failing test**

Add to `server/newsletter.test.ts`:

```typescript
import { vi } from "vitest";

vi.mock("./resendEmailService", () => ({
  getResendClient: () => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "mock-id" }),
    },
  }),
}));

describe("newsletter.send (admin)", () => {
  itWithDb("sends newsletter to subscribers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.send({
      blogPostId: 1,
      subject: "New Article!",
    });
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("sent");
  });
});
```

**Step 2: Implement `newsletterEmailService.ts`**

Replace the stub with:

```typescript
import type { Subscriber, BlogPost } from "../drizzle/schema";
import { getBlogPostBySlug, getAllPublishedBlogPosts } from "./db";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

let _resend: any = null;

function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Newsletter] No RESEND_API_KEY — emails will not be sent");
      return null;
    }
    // Lazy import to avoid crash if resend not configured
    const { Resend } = require("resend");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
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
```

**Step 3: Run tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/newsletter.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add server/newsletterEmailService.ts server/newsletter.test.ts
git commit -m "feat: implement newsletter email sending via Resend"
```

---

## Task 7: Add blog search and category filtering to `/blog` page

**Files:**

- Modify: `client/src/pages/Blog.tsx`

**Step 1: Add search bar and category filter chips**

Add to the blog page between the hero section and the posts grid:

- A search input that filters posts by title + excerpt + tags (client-side)
- Category filter chips extracted from the posts
- Show active filter state

Key additions to `Blog.tsx`:

```typescript
// Add state
const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

// Extract unique categories
const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];

// Filter posts
const filteredPosts = posts.filter(post => {
  const matchesSearch =
    !searchQuery ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
  const matchesCategory =
    !selectedCategory || post.category === selectedCategory;
  return matchesSearch && matchesCategory;
});
```

Add search UI between hero and grid:

```tsx
{
  /* Search & Filter */
}
<div className="container max-w-6xl mx-auto mb-8">
  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder={t("Search articles...", "חיפוש מאמרים...")}
        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm"
      />
    </div>
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          !selectedCategory
            ? "bg-[#D4AF37] text-white"
            : "bg-muted hover:bg-muted/80"
        }`}
      >
        {t("All", "הכל")}
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === cat
              ? "bg-[#D4AF37] text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
</div>;
```

Replace `posts.map(...)` with `filteredPosts.map(...)` in the grid.

**Step 2: Import Search icon**

Add `Search` to the lucide-react import.

**Step 3: Test manually**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`

- Visit `/blog`
- Verify search bar appears
- Verify category chips appear
- Verify filtering works

**Step 4: Commit**

```bash
git add client/src/pages/Blog.tsx
git commit -m "feat: add search and category filtering to blog page"
```

---

## Task 8: Add social share buttons to blog posts

**Files:**

- Create: `client/src/components/blog/ShareButtons.tsx`
- Modify: `client/src/components/blog/index.ts` (export)
- Modify: `client/src/pages/BlogPost.tsx` (add share buttons)
- Modify: `client/src/hooks/usePageMeta.ts` (add OG tags for blog)

**Step 1: Create ShareButtons component**

Create `client/src/components/blog/ShareButtons.tsx`:

```typescript
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Share2, MessageCircle, Facebook, Twitter, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  excerpt: string;
}

export function ShareButtons({ url, title, excerpt }: ShareButtonsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttons = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-green-100 hover:text-green-700",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-100 hover:text-blue-700",
    },
    {
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-sky-100 hover:text-sky-700",
    },
  ];

  return (
    <div className="flex items-center gap-2 py-4 border-t border-border mt-8">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        {t("Share", "שתפו")}
      </span>
      {buttons.map(({ label, icon: Icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className={`p-2 rounded-full transition-colors ${color}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={handleCopy}
        title={t("Copy link", "העתקת קישור")}
        className="p-2 rounded-full hover:bg-muted transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
```

**Step 2: Export from blog/index.ts**

Add to `client/src/components/blog/index.ts`:

```typescript
export { ShareButtons } from "./ShareButtons";
```

**Step 3: Add ShareButtons to BlogPost page**

In `client/src/pages/BlogPost.tsx`, import and add after the article content:

```typescript
import { ShareButtons } from "@/components/blog";

// After <BlogPostCta /> in the article:
<ShareButtons
  url={`/blog/${postId}`}
  title={post.title}
  excerpt={dbPost?.excerpt || ""}
/>
```

**Step 4: Update `usePageMeta` for dynamic blog OG tags**

In `client/src/hooks/usePageMeta.ts`, ensure the OG meta tags update dynamically for blog posts (update og:title, og:description, and og:image if the hook supports it — or add that support).

**Step 5: Test manually**

- Visit a blog post
- Verify share buttons appear
- Verify WhatsApp, Facebook, X links work
- Verify copy link copies to clipboard

**Step 6: Commit**

```bash
git add client/src/components/blog/ShareButtons.tsx client/src/components/blog/index.ts client/src/pages/BlogPost.tsx client/src/hooks/usePageMeta.ts
git commit -m "feat: add social share buttons and dynamic OG tags to blog posts"
```

---

## Task 9: Add "Send to subscribers" button in admin Blog tab

**Files:**

- Modify: `client/src/components/admin/BlogTab.tsx` (add send button per post)

**Step 1: Add send newsletter mutation and button**

In `BlogTab.tsx`, add a mutation:

```typescript
const sendNewsletterMut = trpc.newsletter.send.useMutation({
  onSuccess: data => {
    toast.success(data.message);
  },
  onError: error => {
    toast.error(`Failed: ${error.message}`);
  },
});
```

Add a "Send to subscribers" button in each published post's action row:

```tsx
{
  post.isPublished === 1 && (
    <button
      onClick={() => {
        if (confirm(`Send "${post.title}" to all newsletter subscribers?`))
          sendNewsletterMut.mutate({ blogPostId: post.id });
      }}
      disabled={sendNewsletterMut.isPending}
      className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200 min-h-[36px]"
    >
      {sendNewsletterMut.isPending ? "Sending..." : "Send to Subscribers"}
    </button>
  );
}
```

**Step 2: Test manually**

- Navigate to admin Blog tab
- Published posts should show "Send to Subscribers" button
- Unpublished posts should not

**Step 3: Commit**

```bash
git add client/src/components/admin/BlogTab.tsx
git commit -m "feat: add send-to-subscribers button for published blog posts"
```

---

## Task 10: Run full test suite and verify build

**Step 1: Run all tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests pass + new tests pass (newsletter, AI generator, RSS).

**Step 2: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No TypeScript errors.

**Step 3: Build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm build`
Expected: Clean build with no errors.

**Step 4: Fix any issues found**

If tests/types/build fail, fix them before continuing.

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: fix any remaining type/test/build issues"
```

---

## Task Summary

| Task | What                                        | Files                                                      | Tests      |
| ---- | ------------------------------------------- | ---------------------------------------------------------- | ---------- |
| 1    | Newsletter list/unsubscribe/send procedures | db.ts, newsletter.ts, schema                               | 4 new      |
| 2    | AI content generation (Claude API)          | aiContentGenerator.ts, blog.ts                             | 2 new      |
| 3    | Blog image upload (S3)                      | blog.ts                                                    | 1 new      |
| 4    | RSS feed endpoint                           | rss.ts, index.ts, index.html                               | 3 new      |
| 5    | Rich markdown editor + AI generate dialog   | MarkdownEditor.tsx, GenerateArticleDialog.tsx, BlogTab.tsx | manual     |
| 6    | Newsletter email sending (Resend)           | newsletterEmailService.ts                                  | 1 new      |
| 7    | Blog search + category filtering            | Blog.tsx                                                   | manual     |
| 8    | Social share buttons + OG tags              | ShareButtons.tsx, BlogPost.tsx                             | manual     |
| 9    | Send-to-subscribers admin button            | BlogTab.tsx                                                | manual     |
| 10   | Full test suite + type check + build        | —                                                          | verify all |

**Total: 10 tasks, ~11 new tests, ~7 new files, ~6 modified files**

## Environment Variables Needed

Add to `.env.local` or Manus environment:

- `ANTHROPIC_API_KEY` — for Claude API content generation
- `SITE_URL` — for RSS feed and newsletter links (default: `https://wiro4x4.com`)
