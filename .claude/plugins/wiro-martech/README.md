# Wiro MarTech Plugin - Phase 1

Marketing automation suite for Wiro 4x4 tour booking business.

## Overview

**Phase 1** includes:

- 2 agents: `martech-ops` (Operations Director) + `martech-content` (Content Manager)
- 9 slash commands for marketing automation
- 4 scheduled tasks (disabled by default)
- Graceful degradation (works without external services)

## Agents

### martech-ops (Operations Director)

**Purpose:** Aggregate data and generate reports

**Commands:**

- `/martech:morning-briefing` - Daily morning report
- `/martech:eod-report` - End of day summary
- `/martech:weekly-review` - Weekly performance review
- `/martech:weekly-plan` - Plan next week

**Data Sources:**

- MySQL via tRPC (required)
- Google Sheets MCP (optional)

### martech-content (Content Manager)

**Purpose:** Generate marketing content (bilingual EN + HE)

**Commands:**

- `/martech:content-calendar` - View/plan content calendar
- `/martech:write-blog` - Generate blog post draft
- `/martech:write-social` - Generate social caption
- `/martech:write-newsletter` - Draft newsletter
- `/martech:publish` - Publish to database

**Features:**

- AI generation via Claude API (if `ANTHROPIC_API_KEY` set)
- Template fallback (works without API key)
- Schema validation before publish

## Installation

### Prerequisites

- Claude Desktop installed
- Wiro 4x4 project running (`pnpm dev`)
- MySQL database accessible (`DATABASE_URL` set)

### Optional

- `ANTHROPIC_API_KEY` for AI blog generation
- Google Workspace MCP connector
- Canva MCP connector

### Steps

1. **Verify agents exist:**

```bash
ls .claude/agents/martech-ops.md
ls .claude/agents/martech-content.md
```

2. **Verify plugin loaded:**
   Restart Claude Desktop or reload plugins via Settings

3. **Test commands:**

```bash
/martech:morning-briefing
/martech:content-calendar
/martech:write-blog topic="Test Post"
```

## Scheduled Tasks

**Default:** All tasks are `enabled: false` (manual execution only)

**To enable automated scheduling:**

1. Edit `plugin.json`
2. Set `enabled: true` for desired tasks
3. Reload plugin in Claude Desktop
4. **IMPORTANT:** Claude Desktop must be running at scheduled time

**Schedule:**

- Daily 07:00 - Morning briefing
- Daily 18:00 - EOD report
- Monday 09:00 - Weekly plan
- Friday 16:00 - Weekly review

## Usage Examples

### Morning Briefing

```bash
/martech:morning-briefing
```

Output: Markdown report with:

- Yesterday's leads, bookings, revenue
- Content performance
- Today's priorities
- Blockers

### Generate Blog Post

```bash
/martech:write-blog topic="Kosher Songkran Guide" tone="adventurous"
```

Output: Draft JSON matching `blogPostInputSchema`

### Content Calendar

```bash
/martech:content-calendar
```

Output: Next 30 days with:

- Scheduled posts
- Upcoming holidays (Thai + Jewish)
- Suggested topics

## Configuration

### Environment Variables

**Required:**

```bash
DATABASE_URL=mysql://...  # Already in Wiro .env.local
```

**Optional:**

```bash
ANTHROPIC_API_KEY=sk-ant-...  # AI blog generation
RESEND_API_KEY=re_...         # Email (already in Wiro)
```

### MCP Connectors

**Google Sheets (optional):**

- Content calendar tracking
- Lead pipeline tracking
- Setup: Claude Desktop → Settings → Integrations → Google Workspace

**Gmail (optional):**

- Auto-send reports via email
- Setup: Claude Desktop → Settings → Integrations → Google Workspace

**Canva (optional):**

- Generate blog cover images
- Setup: Claude Desktop → Settings → Integrations → Canva

## Graceful Degradation

**Works WITHOUT:**

- Google Sheets MCP
- Gmail MCP
- Canva MCP
- ANTHROPIC_API_KEY

**Fallback behavior:**

- Uses MySQL only for data
- Returns reports in chat (no email)
- Template-based content generation (no AI)
- User warnings when optional services unavailable

## Troubleshooting

### Commands not available

- Verify plugin loaded: Check Claude Desktop settings
- Restart Claude Desktop
- Check `plugin.json` syntax

### Reports show no data

- Verify Wiro 4x4 dev server running: `pnpm dev`
- Check `DATABASE_URL` in `.env.local`
- Test tRPC query: `trpc.lead.listPaginated.query()`

### AI generation not working

- Check `ANTHROPIC_API_KEY` set in `.env.local`
- Fallback to templates is normal (still generates content)

### Scheduled tasks not running

- Verify `enabled: true` in `plugin.json`
- Claude Desktop must be running at scheduled time
- Check logs in Claude Desktop console

## Future Phases

**Phase 2:** Social Media + Ads + Analytics + Sales
**Phase 3:** Market Intelligence

See `docs/superpowers/specs/2026-03-13-martech-phase1-design.md` for details.

---

**Version:** 1.0.0 (Phase 1)
**Last Updated:** 2026-03-13
