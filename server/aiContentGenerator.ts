import Anthropic from "@anthropic-ai/sdk";
import type { Tour } from "../drizzle/schema";

interface GenerateOptions {
  topic: string;
  tone: "informative" | "adventurous" | "practical";
  length: number;
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

// Lazily initialize Anthropic so tests don't crash when ANTHROPIC_API_KEY is unset
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
              `- ${t.name} (${t.nameHe}): ${t.duration}, ${t.price}THB — /tours/${t.slug}`
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
