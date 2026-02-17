# Blog Content Pipeline — Design Document

**Date:** 2026-02-17
**Status:** Approved
**Feature:** AI-powered blog content generation, rich editor, and distribution engine

---

## Overview

Upgrade the entire blog lifecycle from creation to distribution. An AI content generator produces bilingual article drafts, a rich markdown editor replaces the basic textarea, and a distribution engine (RSS, search, social sharing, newsletter) ensures content gets discovered.

## Architecture

```
Admin Blog Tab (Upgraded)
├── AI Content Generator
│   ├── Topic selector (6 pre-loaded + free text)
│   ├── Tone & length controls
│   └── Claude API → bilingual draft (EN + HE)
├── Rich Markdown Editor
│   ├── Split-pane: markdown | live preview
│   ├── Toolbar: formatting + image upload (S3)
│   ├── Bilingual tabs (EN / HE)
│   └── Auto-save to localStorage
├── Preview Mode
│   └── Full article render (reuses MarkdownRenderer)
└── Publish + Distribute
    ├── RSS feed auto-updated
    ├── Social share buttons on post
    └── Optional: send to newsletter subscribers
```

## Component 1: AI Content Generator

### Workflow

1. Admin clicks "Generate Article" in Blog tab
2. Dialog with: topic (dropdown + free text), tone (informative/adventurous/practical), length (500/1000/2000 words)
3. Claude API generates bilingual article: title, titleHe, excerpt, excerptHe, content, contentHe, slug, category, tags
4. Draft loads into editor form for review and editing

### System Prompt

Dynamic prompt includes:

- Wiro brand voice (adventurous, kosher-focused, Northern Thailand expertise)
- Tour catalog data (from `tours` table) for accurate references
- SEO instructions: target keywords, meta description, internal links to `/tours/:slug`
- Hebrew instructions: natural Hebrew, not machine-translated

### Pre-loaded Topic Library

1. Kosher Dining Guide for Northern Thailand
2. Shabbat-Friendly Accommodations in Chiang Mai
3. Israeli Traveler Tips for Southeast Asia
4. Cultural Etiquette Guide for Thailand/Laos/Vietnam
5. Best Time to Visit Chiang Mai
6. Packing List for Off-Road Adventures

## Component 2: Rich Markdown Editor

### Features

- **Split-pane view**: raw markdown (left) + live preview (right)
- **Toolbar**: bold, italic, H2/H3, links, images, lists, blockquotes, code blocks
- **Image upload**: drag-and-drop or click → S3 via `storagePut()` → inserts `![alt](url)`
- **Bilingual tabs**: toggle between English and Hebrew content
- **Auto-save**: drafts to localStorage every 30 seconds
- **Preview mode**: full-width render using existing `MarkdownRenderer` component

### Dependencies

No new libraries needed. Toolbar inserts markdown syntax into textarea. Preview uses existing `MarkdownRenderer`.

## Component 3: Distribution Engine

### 3a. RSS Feed

- New Express endpoint: `GET /api/rss`
- Standard RSS 2.0 XML format
- Includes: title, description, link, pubDate for each published post
- `<link rel="alternate" type="application/rss+xml">` added to `index.html`

### 3b. Blog Search & Filtering

- Search bar on `/blog` page (client-side filter on title + excerpt + tags)
- Category filter chips (uses existing `category` field)
- Tag-based filtering

### 3c. Social Sharing

- Per-post share buttons: WhatsApp, Facebook, Twitter/X, copy link
- Dynamic OG meta tags via `usePageMeta()` for blog posts
- Share preview shows: title, excerpt, cover image

### 3d. Email Newsletter

- Signup form on `/blog` page and footer (email + language preference)
- On publish, option to "Send to subscribers" via Resend
- Email contains: article title, excerpt, cover image, read-more link
- Unsubscribe link in every email

## Database Changes

### New Table: `newsletterSubscribers`

| Column         | Type             | Purpose             |
| -------------- | ---------------- | ------------------- |
| `id`           | serial PK        | Subscriber ID       |
| `email`        | varchar (unique) | Subscriber email    |
| `language`     | enum('en','he')  | Preferred language  |
| `subscribedAt` | timestamp        | Signup date         |
| `isActive`     | boolean          | Unsubscribe support |

### Existing `blogPosts` Table

No changes needed — existing schema already supports all required fields.

## API Changes

### New tRPC Procedures

| Procedure                | Type     | Auth   | Purpose                                   |
| ------------------------ | -------- | ------ | ----------------------------------------- |
| `blog.generateDraft`     | mutation | admin  | Call Claude API to generate article draft |
| `blog.uploadImage`       | mutation | admin  | Upload image to S3 for blog content       |
| `newsletter.subscribe`   | mutation | public | Add subscriber (rate-limited: 5/min)      |
| `newsletter.unsubscribe` | mutation | public | Deactivate subscriber                     |
| `newsletter.list`        | query    | admin  | List all subscribers                      |
| `newsletter.send`        | mutation | admin  | Send blog post to active subscribers      |

### New REST Endpoint

| Endpoint   | Method | Purpose                   |
| ---------- | ------ | ------------------------- |
| `/api/rss` | GET    | RSS 2.0 XML feed (public) |

## Error Handling

| Scenario                    | Response                                      |
| --------------------------- | --------------------------------------------- |
| Claude API failure          | Error toast, allow retry                      |
| S3 upload failure           | Error toast with file name, allow retry       |
| Newsletter send failure     | Partial send tracking, log successes/failures |
| RSS feed with no posts      | Return valid empty RSS XML                    |
| Duplicate newsletter signup | Silently succeed (idempotent)                 |

## Testing Strategy

- AI generation: mock Claude API, verify bilingual output structure
- RSS feed: verify XML format, published posts only
- Newsletter: subscribe/unsubscribe validation, dedup, rate limiting
- Newsletter send: mock Resend, verify active-only delivery
- Blog search: client-side filtering logic
- Image upload: mock S3 integration
- Follows existing Vitest patterns

## Technology Choices

| Component      | Technology                           |
| -------------- | ------------------------------------ |
| AI Generator   | Claude API (Anthropic SDK)           |
| Editor         | Custom React markdown editor         |
| Preview        | Existing MarkdownRenderer            |
| Image Storage  | S3 via `storagePut()`                |
| RSS            | Express route (XML generation)       |
| Search         | Client-side filtering (React)        |
| Social Sharing | Share component (WhatsApp/FB/X/copy) |
| Newsletter     | Drizzle ORM + Resend email           |

## Scope

- ~12-15 new/modified files
- 1 new DB table (`newsletterSubscribers`)
- 6 new tRPC procedures
- 1 new REST endpoint (`/api/rss`)
- ~6-8 new test cases
