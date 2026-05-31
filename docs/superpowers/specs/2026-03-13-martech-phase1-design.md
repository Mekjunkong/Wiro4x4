# Wiro 4x4 MarTech Plugin Suite - Phase 1 Design

**Date:** 2026-03-13
**Author:** Claude Code
**Status:** Design Approved
**Phase:** 1 of 3 (Foundation)

---

## Executive Summary

This document specifies Phase 1 of the Wiro 4x4 MarTech Plugin Suite: a marketing automation system built on a **Hybrid Layered Architecture** with 3 layers:

1. **Layer 1 (Agents):** Specialized agents for execution
2. **Layer 2 (Plugin):** Orchestration wrapper with slash commands + scheduled tasks
3. **Layer 3 (MCP):** External integrations (optional, progressive enhancement)

**Phase 1 Deliverables:**

- 2 specialized agents: `martech-ops` + `martech-content`
- 1 plugin wrapper: `wiro-martech.plugin`
- 9 slash commands for marketing automation
- 4 scheduled tasks for daily/weekly operations
- Graceful degradation (works without external services)
- Progressive enhancement (better with MCP connectors)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Plugin 6: Marketing Operations Director](#plugin-6-marketing-operations-director)
3. [Plugin 2: Content Marketing Manager](#plugin-2-content-marketing-manager)
4. [Agent Specifications](#agent-specifications)
5. [Scheduled Tasks](#scheduled-tasks)
6. [MCP Integration](#mcp-integration)
7. [Error Handling](#error-handling)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Future Phases](#future-phases)

---

## 1. Architecture Overview

### Hybrid Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 2: wiro-martech.plugin (Orchestration)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Slash Commands:                                        │
│  - /martech:morning-briefing    → martech-ops          │
│  - /martech:eod-report          → martech-ops          │
│  - /martech:weekly-review       → martech-ops          │
│  - /martech:weekly-plan         → martech-ops + content│
│  - /martech:content-calendar    → martech-content      │
│  - /martech:write-blog          → martech-content      │
│  - /martech:write-social        → martech-content      │
│  - /martech:write-newsletter    → martech-content      │
│  - /martech:publish             → martech-content      │
│                                                         │
│  Scheduled Tasks:                                       │
│  - Daily 07:00 → morning-briefing                      │
│  - Daily 18:00 → eod-report                            │
│  - Monday 09:00 → weekly-plan                          │
│  - Friday 16:00 → weekly-review                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Agents (Execution)                           │
├──────────────────────────┬──────────────────────────────┤
│  martech-ops.md          │  martech-content.md          │
│  (Operations Director)   │  (Content Manager)           │
│                          │                              │
│  Sub-agents:             │  Sub-agents:                 │
│  - report-compiler       │  - copywriter-th             │
│  - strategy-advisor      │  - copywriter-he             │
│  - task-coordinator      │  - seo-optimizer             │
│                          │  - calendar-planner          │
│                          │  - ai-generator              │
└──────────────────────────┴──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Data & Integrations                          │
├──────────────────────────┬──────────────────────────────┤
│  MySQL Database          │  MCP Connectors (Optional)   │
│  (Required)              │  (Progressive Enhancement)   │
│                          │                              │
│  Tables:                 │  Phase 1:                    │
│  - blogPosts             │  - Google Sheets (calendar)  │
│  - leads                 │  - Gmail (reports)           │
│  - bookings              │  - Google Drive (storage)    │
│  - tours                 │  - Canva (images)            │
│  - financialRecords      │                              │
└──────────────────────────┴──────────────────────────────┘
```

### Design Principles

1. **Graceful Degradation:** Core functionality works without external services
2. **Progressive Enhancement:** Adding MCPs/API keys unlocks more features
3. **Loose Coupling:** Agents are independent, communicate via plugin orchestrator
4. **Clear Separation:** Agents = logic, Plugin = orchestration
5. **Production Ready:** Battle-tested patterns (microservices + API gateway)

---

## 2. Plugin 6: Marketing Operations Director

### Overview

**Purpose:** Central orchestrator that aggregates data from all sources and generates actionable reports.

**Role:** "สมองกลาง" of the MarTech team

**Key Responsibilities:**

- Daily briefings (morning + EOD)
- Weekly reviews and planning
- Data aggregation from MySQL + external sources
- Strategic recommendations

### Slash Commands

#### `/martech:morning-briefing`

**Purpose:** Daily morning report with yesterday's metrics + today's priorities

**Flow:**

```
1. User executes: /martech:morning-briefing
2. Plugin delegates to: martech-ops agent
3. Agent sub-agents:
   - report-compiler → queries MySQL (leads, bookings, revenue)
   - report-compiler → queries Google Sheets (if connected)
   - strategy-advisor → analyzes metrics → generates recommendations
4. Agent returns: formatted markdown report
5. Plugin output:
   - Gmail MCP available → sends email to wiro.adventures@gmail.com
   - No Gmail MCP → returns report in chat
```

**Output Format:**

```markdown
# 🌅 Morning Briefing - 2026-03-13

## 📊 Yesterday's Performance

- **New Leads**: 5 (+2 from Facebook, +3 from website)
- **Bookings**: 2 confirmed (Doi Inthanon x2)
- **Revenue**: ฿15,000 THB

## 📝 Content Status

- **Published**: 1 blog post ("Kosher Guide to Chiang Mai")
- **Top Performer**: "Best 4x4 Routes" (247 views, +15%)

## 🎯 Today's Priorities

1. Follow-up 3 leads from yesterday
2. Finish blog draft: "Songkran Adventure"
3. Schedule social posts for weekend

## ⚠️ Blockers

- None

---

Generated by Marketing Operations Director
```

#### `/martech:eod-report`

**Purpose:** End-of-day summary

**Flow:** Similar to morning-briefing, but focuses on:

- Today's achievements
- Tasks completed vs planned
- Blockers encountered

#### `/martech:weekly-review`

**Purpose:** Weekly performance review (runs Friday 16:00)

**Flow:**

```
1. Plugin delegates to: martech-ops + martech-content
2. Aggregates:
   - Week's leads, bookings, revenue (martech-ops)
   - Content published, performance (martech-content)
3. Returns: comprehensive weekly report
```

#### `/martech:weekly-plan`

**Purpose:** Plan next week's content + goals (runs Monday 09:00)

**Flow:**

```
1. Plugin delegates to: martech-ops + martech-content
2. martech-content generates: suggested content topics
3. martech-ops generates: sales targets, priorities
4. Returns: combined weekly plan
```

### Data Sources

**Primary (MySQL via tRPC):**

- `leads` → lead count, sources, status
- `bookings` → confirmed bookings, tour distribution
- `financialRecords` → revenue, costs
- `blogPosts` → published posts, views
- `reviews` → customer feedback, ratings

**Secondary (Google Sheets via MCP - optional):**

- Lead pipeline tracking
- Content calendar
- Campaign metrics

### Sub-Agents

#### report-compiler

**Purpose:** Fetch and aggregate raw data
**Outputs:** Metrics object with all numbers

#### strategy-advisor

**Purpose:** Analyze metrics + generate insights
**Inputs:** Raw metrics
**Outputs:** Actionable recommendations (3-5 bullet points)

#### task-coordinator

**Purpose:** Delegate tasks to other agents
**Example:** "Content calendar shows blog due today → notify martech-content"

---

## 3. Plugin 2: Content Marketing Manager

### Overview

**Purpose:** Automated content creation for blog, social media, newsletters

**Upgrade from:** `wiro-content` agent → enhanced with AI, automation, multi-channel

**Key Responsibilities:**

- Blog post generation (bilingual EN + HE)
- Social media captions
- Newsletter drafting
- Content calendar planning

### Slash Commands

#### `/martech:content-calendar`

**Purpose:** View/plan content calendar

**Flow:**

```
1. Plugin delegates to: martech-content agent
2. Agent queries:
   - MySQL blogPosts (published + scheduled)
   - Google Sheets calendar (if connected)
3. Returns: calendar view (next 30 days)
```

**Output:**

```markdown
# 📅 Content Calendar - Next 30 Days

## This Week

- **Mon 2026-03-15**: Blog - "Kosher Songkran Guide" (draft)
- **Wed 2026-03-17**: Social - Doi Inthanon highlight
- **Fri 2026-03-19**: Newsletter - Monthly update

## Next Week

- **Mon 2026-03-22**: Blog - "Best Time to Visit Chiang Mai"
- **Thu 2026-03-25**: Social - Customer testimonial

## Upcoming Holidays

- **Apr 13-15**: Songkran (Thai New Year) 🌊
- **Apr 22-30**: Pesach 🍷

💡 Suggested topics for Songkran week...
```

#### `/martech:write-blog`

**Purpose:** Generate blog post draft (bilingual)

**Signature:**

```typescript
/martech:write-blog
  topic="Kosher Songkran Guide"
  tone="adventurous"      // optional: adventurous | informative | personal
  generateImage=true       // optional: use Canva MCP
```

**Flow:**

```
1. Plugin delegates to: martech-content agent
2. Agent sub-agents:
   - calendar-planner → checks if topic in calendar
   - ai-generator → generates draft via Claude API (if ANTHROPIC_API_KEY)
     OR copywriter-th/he → manual template generation
   - seo-optimizer → adds keywords, meta tags
3. Returns: draft blog post (JSON matching blogPostInputSchema)
4. Plugin asks: "Review draft? (approve/edit/regenerate)"
```

**Output:**

```json
{
  "title": "Your Ultimate Guide to Kosher Songkran in Chiang Mai",
  "titleHe": "המדריך המלא לסונגקראן כשר בצ'יאנג מאי",
  "slug": "kosher-songkran-guide-chiang-mai",
  "excerpt": "Experience Thailand's most famous water festival while maintaining kosher observance...",
  "excerptHe": "חוו את פסטיבל המים המפורסם...",
  "content": "# Your Ultimate Guide...\n\n## What is Songkran?...",
  "contentHe": "# המדריך המלא...\n\n## מהו סונגקראן?...",
  "category": "travel-tips",
  "tags": "[\"songkran\", \"kosher\", \"chiang mai\", \"festivals\"]",
  "status": "draft"
}
```

#### `/martech:write-social`

**Purpose:** Generate social media caption

**Signature:**

```typescript
/martech:write-social
  platform="facebook"     // facebook | instagram
  topic="Doi Inthanon tour highlight"
  includeImage=true
```

**Output:**

```markdown
🏔️ Discover the Roof of Thailand! 🌲

Join us on an unforgettable journey to Doi Inthanon, Thailand's highest peak at 2,565m.
Experience breathtaking mountain views, cascading waterfalls, and the famous King & Queen
pagodas - all while enjoying kosher meals throughout the day! 🍽️✨

Perfect for families and adventure seekers alike. Book your private 4x4 tour today! 🚙

📍 Doi Inthanon National Park
⏱️ Full day tour (8-10 hours)
✅ 100% Kosher certified
🗓️ Book now for April slots

#KosherTravel #ChiangMai #DoiInthanon #ThailandAdventure #JewishTravel
#OffRoad4x4 #KosherFood #IsraeliTravelers #NorthernThailand #Wiro4x4

[Image suggestion: Doi Inthanon pagoda with mountain backdrop]
```

#### `/martech:write-newsletter`

**Purpose:** Draft newsletter email

**Output:**

```markdown
Subject: 🌸 Spring Adventures Await - Special Songkran Offers Inside!

Preview: Experience Thailand's water festival the kosher way + exclusive early bird discounts

---

# Shalom from Chiang Mai! 🙏

Spring has arrived in Northern Thailand, and we're excited to share what's new...

[Newsletter body with sections: Highlights, Special Offers, Upcoming Tours, Testimonials]

---

📧 Questions? Reply to this email
🌐 Visit: wiro4x4indochina.com
📱 WhatsApp: +972544715400

Unsubscribe | Update preferences
```

#### `/martech:publish`

**Purpose:** Publish content to database

**Signature:**

```typescript
/martech:publish
  type="blog"              // blog | tour | newsletter
  draft={...}              // content object
  scheduledDate="2026-03-15"  // optional
```

**Flow:**

```
1. Plugin validates schema (blogPostInputSchema / tourInputSchema)
2. Plugin delegates to: martech-content agent
3. Agent:
   - Saves to MySQL via tRPC.blog.create() or tRPC.tour.create()
   - (Optional) Uploads cover image to S3
   - (Optional) Updates Google Sheets calendar
4. Returns: published URL
```

### Sub-Agents

#### copywriter-th

**Purpose:** Write Thai/English content
**Tone:** Adventure-focused, kosher-confident, personal
**Output:** Draft matching schemas

#### copywriter-he

**Purpose:** Write Hebrew content (native, not translated)
**Output:** Natural Hebrew versions

#### seo-optimizer

**Purpose:** Add SEO elements
**Inputs:** Draft content
**Outputs:** Keywords, meta tags, JSON-LD

#### calendar-planner

**Purpose:** Plan content calendar
**Sources:** Thai festivals, Jewish holidays, tourism seasons
**Output:** Suggested topics by date

#### ai-generator

**Purpose:** Generate drafts via Anthropic API
**Fallback:** Template-based if no API key

```typescript
// Lazy initialization pattern
if (process.env.ANTHROPIC_API_KEY) {
  const draft = await anthropic.messages.create({...});
} else {
  const draft = generateTemplate(topic);
}
```

---

## 4. Agent Specifications

### 4.1 martech-ops.md

**File Location:** `.claude/agents/martech-ops.md`

**Frontmatter:**

```yaml
---
name: martech-ops
description: Marketing Operations Director for Wiro 4x4. Aggregates data from all sources, generates reports, coordinates marketing team, and provides strategic recommendations.
tools: Read, Bash, Grep, Glob
color: purple
---
```

**Key Sections:**

- Hard Rules (5 rules)
- Responsibilities (daily, weekly)
- Data Sources (MySQL via tRPC, Sheets via MCP)
- Sub-Agent Coordination (report-compiler, strategy-advisor, task-coordinator)
- Report Templates (morning-briefing, eod-report, weekly-review, weekly-plan)
- Integration Points (with other agents)

**Database Access Pattern:**

```typescript
// Always use tRPC, never direct SQL
await trpc.lead.listPaginated.query({ page: 1, pageSize: 20 });
await trpc.booking.listPaginated.query({ page: 1, pageSize: 20 });
await trpc.blog.listAll.query();
await trpc.financial.stats.query();
```

### 4.2 martech-content.md

**File Location:** `.claude/agents/martech-content.md`

**Frontmatter:**

```yaml
---
name: martech-content
description: Content Marketing Manager for Wiro 4x4. Creates bilingual blog posts, social captions, tour descriptions, and newsletters with AI assistance. Upgraded from wiro-content.
tools: Read, Write, Edit, Bash, Grep, Glob
color: pink
---
```

**Key Sections:**

- Hard Rules (inherited from wiro-content + new automation rules)
- NEW Features (AI generation, calendar, multi-channel)
- Sub-Agents (copywriter-th, copywriter-he, seo-optimizer, calendar-planner, ai-generator)
- Content Types (blog, social, tour, newsletter)
- SEO Keywords (from wiro-seo)
- Database Access (same as wiro-content)
- Integration with wiro-seo

**Schema Validation:**

```typescript
import { blogPostInputSchema, tourInputSchema } from "shared/schemas";

// All content must match these schemas
const result = blogPostInputSchema.safeParse(draft);
if (!result.success) {
  throw new Error("Invalid blog post schema");
}
```

---

## 5. Scheduled Tasks

### Configuration

**File:** `.claude/plugins/wiro-martech/plugin.json`

```json
{
  "scheduledTasks": [
    {
      "name": "morning-briefing",
      "schedule": "0 7 * * *",
      "command": "/martech:morning-briefing",
      "enabled": true
    },
    {
      "name": "eod-report",
      "schedule": "0 18 * * *",
      "command": "/martech:eod-report",
      "enabled": true
    },
    {
      "name": "weekly-plan",
      "schedule": "0 9 * * 1",
      "command": "/martech:weekly-plan",
      "enabled": true
    },
    {
      "name": "weekly-review",
      "schedule": "0 16 * * 5",
      "command": "/martech:weekly-review",
      "enabled": true
    }
  ]
}
```

### Schedule Details

| Task             | Frequency | Time      | Purpose                                  |
| ---------------- | --------- | --------- | ---------------------------------------- |
| morning-briefing | Daily     | 07:00     | Yesterday's metrics + today's priorities |
| eod-report       | Daily     | 18:00     | Today's achievements + blockers          |
| weekly-plan      | Weekly    | Mon 09:00 | Plan next week's content + goals         |
| weekly-review    | Weekly    | Fri 16:00 | Performance review across all channels   |

### Requirements

- ⚠️ Claude Desktop must be running at scheduled time
- ✅ Tasks run in background, notify when complete
- 🔧 Can enable/disable via `plugin.json` and reload

---

## 6. MCP Integration

### Phase 1 Connectors (All Optional)

#### Tier 1: Google Workspace (Recommended)

**Connectors:**

- Gmail → Send reports via email
- Google Sheets → Content calendar + lead pipeline
- Google Drive → Store reports
- Google Calendar → (Future: schedule content)

**Status:** Official connectors available
**Setup:** Built-in to Claude Desktop (OAuth login)

**Usage Example:**

```typescript
// Check if connector available before using
const hasGmail = await checkMcpConnector("gmail");

if (hasGmail) {
  await mcp.gmail.sendEmail({
    to: "wiro.adventures@gmail.com",
    subject: "🌅 Morning Briefing",
    body: report,
  });
} else {
  return report; // Fallback: return in chat
}
```

#### Tier 2: Canva (Optional)

**Purpose:** Generate blog cover images, social graphics

**Status:** Official connector available
**Setup:** Connect via Claude Desktop settings

### Graceful Degradation Strategy

**Core Principle:** Everything works without MCPs, better with them.

**Example Flows:**

**Without MCPs:**

```
/martech:morning-briefing
→ Queries MySQL only
→ Returns report in chat
→ User copies manually if needed
```

**With Gmail MCP:**

```
/martech:morning-briefing
→ Queries MySQL
→ Sends via Gmail automatically
→ Notification: "Report sent ✅"
```

**With Gmail + Sheets MCPs:**

```
/martech:morning-briefing
→ Queries MySQL + Google Sheets
→ Richer data (calendar, pipeline)
→ Sends via Gmail
→ Logs to Sheets
```

---

## 7. Error Handling

### Principle: Fail Gracefully, Never Crash

### 7.1 External Service Failures

```typescript
async function getLeadPipeline() {
  try {
    if (await hasMcp("google-sheets")) {
      return await mcp.sheets.query("Lead Pipeline");
    }
  } catch (error) {
    console.warn("Sheets unavailable, falling back to MySQL");
  }

  // Always have a fallback
  return await trpc.lead.listPaginated.query();
}
```

**User Experience:**

```
✅ Morning Briefing Generated
⚠️ Note: Using MySQL data only (Google Sheets not connected)
💡 Tip: Connect Sheets for richer pipeline tracking
```

### 7.2 AI Generation Failures

```typescript
async function generateBlogDraft(topic: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      status: 'template',
      content: generateTemplate(topic),
      message: '📝 Using template (ANTHROPIC_API_KEY not set)'
    };
  }

  try {
    const draft = await anthropic.messages.create({...});
    return { status: 'ai', content: draft, message: '✨ Generated via AI' };
  } catch (error) {
    console.error('AI generation failed:', error);
    return {
      status: 'template',
      content: generateTemplate(topic),
      message: '⚠️ AI failed, using template fallback'
    };
  }
}
```

### 7.3 Database Query Failures

```typescript
async function getDailyMetrics() {
  try {
    const leads = await trpc.lead.listPaginated.query({...});
    const bookings = await trpc.booking.listPaginated.query({...});
    return { leads, bookings };
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Unable to fetch metrics. Check DATABASE_URL.');
  }
}
```

**User Experience:**

```
❌ Morning Briefing Failed
Error: Unable to fetch metrics. Check DATABASE_URL.

Troubleshooting:
1. Verify Wiro 4x4 dev server is running (pnpm dev)
2. Check DATABASE_URL in .env.local
3. Try: /martech:morning-briefing --debug
```

### 7.4 Scheduled Task Failures

```typescript
scheduledTasks.forEach(task => {
  cron.schedule(task.schedule, async () => {
    try {
      await executeCommand(task.command);
      logSuccess(task.name);
    } catch (error) {
      logFailure(task.name, error);
      notify(`⚠️ Scheduled task failed: ${task.name}`);
      // Don't crash scheduler
    }
  });
});
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Agent Logic)

**File:** `tests/martech-ops.test.ts`

```typescript
describe("martech-ops agent", () => {
  it("generates morning briefing from MySQL data", async () => {
    const mockData = {
      leads: [{ name: "Test Lead", createdAt: new Date() }],
      bookings: [{ tourSlug: "doi-inthanon", status: "confirmed" }],
    };

    const report = await generateMorningBriefing(mockData);

    expect(report).toContain("New Leads: 1");
    expect(report).toContain("Bookings: 1");
  });

  it("handles empty data gracefully", async () => {
    const emptyData = { leads: [], bookings: [] };
    const report = await generateMorningBriefing(emptyData);

    expect(report).toContain("New Leads: 0");
    expect(report).not.toThrow();
  });
});
```

**File:** `tests/martech-content.test.ts`

```typescript
describe("martech-content agent", () => {
  it("generates blog draft matching schema", async () => {
    const draft = await generateBlogDraft({
      topic: "Kosher Songkran Guide",
      tone: "adventurous",
    });

    const result = blogPostInputSchema.safeParse(draft);
    expect(result.success).toBe(true);
    expect(draft.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("falls back to template when no API key", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const draft = await generateBlogDraft({ topic: "Test" });
    expect(draft.status).toBe("template");
  });
});
```

### 8.2 Integration Tests (Plugin Commands)

**File:** `tests/martech-plugin.test.ts`

```typescript
describe("wiro-martech plugin", () => {
  it("/martech:morning-briefing delegates to ops agent", async () => {
    const spy = jest.spyOn(agents, "martech-ops");
    await executeCommand("/martech:morning-briefing");
    expect(spy).toHaveBeenCalled();
  });

  it("/martech:publish validates schema before saving", async () => {
    const invalidDraft = { title: "Missing fields" };
    await expect(
      executeCommand("/martech:publish", invalidDraft)
    ).rejects.toThrow("Invalid blog post schema");
  });
});
```

### 8.3 Manual Testing Checklist

**Phase 1 MVP:**

```
□ /martech:morning-briefing (without MCPs)
  → Should query MySQL only
  → Should return formatted report
  → Should not crash

□ /martech:morning-briefing (with Gmail MCP)
  → Should send email to wiro.adventures@gmail.com
  → Should log success

□ /martech:write-blog (without ANTHROPIC_API_KEY)
  → Should use template
  → Should match blogPostInputSchema

□ /martech:write-blog (with ANTHROPIC_API_KEY)
  → Should use AI generation
  → Should match blogPostInputSchema

□ /martech:publish
  → Should save to MySQL via tRPC
  → Should return blog URL

□ Scheduled tasks
  → Should trigger at correct times
  → Should handle failures gracefully
```

---

## 9. Deployment Guide

### 9.1 Prerequisites

**Required:**

- Claude Desktop installed
- Wiro 4x4 project running (`pnpm dev`)
- MySQL database accessible (`DATABASE_URL` set)

**Optional:**

- `ANTHROPIC_API_KEY` for AI blog generation
- `RESEND_API_KEY` for email (already in Wiro)
- Google Workspace MCP connector
- Canva MCP connector

### 9.2 Installation Steps

#### Step 1: Create Agent Files

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4

# Create martech-ops agent
cat > .claude/agents/martech-ops.md << 'EOF'
[Full content from Section 4.1]
EOF

# Create martech-content agent
cat > .claude/agents/martech-content.md << 'EOF'
[Full content from Section 4.2]
EOF
```

#### Step 2: Create Plugin Structure

```bash
mkdir -p .claude/plugins/wiro-martech/commands
cd .claude/plugins/wiro-martech

# Create plugin manifest
cat > plugin.json << 'EOF'
{
  "name": "wiro-martech",
  "version": "1.0.0",
  "description": "Marketing automation suite for Wiro 4x4",
  "commands": [...],
  "scheduledTasks": [...],
  "agents": ["martech-ops", "martech-content"]
}
EOF

# Create command handlers
cat > commands/index.ts << 'EOF'
[Command orchestration logic]
EOF
```

#### Step 3: Restart Claude Desktop

```bash
# Restart to load new plugin
# OR: Settings → Plugins → Refresh
```

#### Step 4: Test Installation

```bash
# Test commands
/martech:morning-briefing
/martech:content-calendar
/martech:write-blog topic="Test Post"
```

### 9.3 Configuration

**Environment Variables (.env.local):**

```bash
# Required (already in Wiro)
DATABASE_URL=mysql://...

# Optional (AI generation)
ANTHROPIC_API_KEY=sk-ant-...

# Optional (email - already in Wiro)
RESEND_API_KEY=re_...
```

### 9.4 Verification Checklist

**Installation Complete When:**

```
✅ 2 agents visible in agent list
   - martech-ops (purple)
   - martech-content (pink)

✅ 9 slash commands available
   - /martech:morning-briefing
   - /martech:eod-report
   - /martech:weekly-review
   - /martech:weekly-plan
   - /martech:content-calendar
   - /martech:write-blog
   - /martech:write-social
   - /martech:write-newsletter
   - /martech:publish

✅ Scheduled tasks configured
   - Logs at 07:00, 18:00 daily
   - Logs Monday 09:00, Friday 16:00

✅ Manual tests passing
   - morning-briefing returns report
   - write-blog generates valid draft
   - publish saves to MySQL
```

---

## 10. Future Phases

### Phase 2: Core Marketing (5 plugins)

**Timeline:** TBD
**Plugins:**

- Plugin 3: Social Media Manager
- Plugin 7: Facebook Ads Manager
- Plugin 4: Performance Marketing Analyst
- Plugin 5: Sales & CRM Coordinator
- Plugin 8: Messenger Chatbot & Sales Closer

**New Features:**

- Facebook/Instagram posting automation
- Ads campaign management + optimization
- Lead tracking + follow-up automation
- Customer chat + sales conversion

### Phase 3: Advanced Intelligence (1 plugin)

**Timeline:** TBD
**Plugin:**

- Plugin 1: Market Intelligence Officer

**New Features:**

- Competitor analysis
- Market trend detection
- Pricing optimization
- Audience insights

---

## Appendix A: File Locations

```
/Users/pasuthunjunkong/workspace/Wiro4x4/
├── .claude/
│   ├── agents/
│   │   ├── martech-ops.md           # Operations Director
│   │   └── martech-content.md       # Content Manager
│   └── plugins/
│       └── wiro-martech/
│           ├── plugin.json          # Plugin manifest
│           └── commands/
│               └── index.ts         # Command handlers
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-03-13-martech-phase1-design.md  # This document
└── tests/
    ├── martech-ops.test.ts
    ├── martech-content.test.ts
    └── martech-plugin.test.ts
```

---

## Appendix B: Integration with Existing Wiro Agents

**Upgraded Agents:**

- `wiro-content` → `martech-content` (enhanced with AI + automation)

**Keep Separate:**

- `wiro-ops` → Still used for general operations (not replaced by martech-ops)
- `wiro-seo` → Consulted by martech-content for SEO optimization
- `wiro-frontend`, `wiro-backend` → Core development agents
- `wiro-finance`, `wiro-accountant` → Financial operations
- All other wiro agents → Unchanged

**Collaboration:**

- martech-content + wiro-seo → SEO optimization
- martech-ops + wiro-finance → Revenue reporting
- martech-ops + wiro-booking-manager → Lead/booking metrics

---

## Document History

| Version | Date       | Author      | Changes                 |
| ------- | ---------- | ----------- | ----------------------- |
| 1.0     | 2026-03-13 | Claude Code | Initial design approved |

---

**End of Phase 1 Design Document**
