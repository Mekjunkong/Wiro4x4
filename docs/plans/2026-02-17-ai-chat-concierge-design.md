# AI Chat Concierge — Design Document

**Date:** 2026-02-17
**Status:** Approved
**Feature:** Bilingual AI chat widget with booking assist and WhatsApp human handoff

---

## Overview

A floating chat widget on the Wiro 4x4 site that provides visitors with an AI-powered concierge experience. The bot answers tour, pricing, and logistics questions in English or Hebrew, helps gather booking preferences, and can hand off to a human staff member via WhatsApp when needed.

## Architecture

```
Visitor Browser (Chat Widget)
    ↕ WebSocket
Express Server (Chat Router)
    ├── Claude API (AI responses)
    ├── WhatsApp Business API (human handoff)
    └── MySQL DB (chat_sessions, chat_messages)
```

### Key Flows

1. **Visitor opens chat** — WebSocket established, new `chatSessions` row created
2. **AI mode** — visitor messages routed to Claude API with dynamic system prompt (tour data, pricing rules, FAQ), response streamed back via WS
3. **Booking assist** — AI gathers tour preference, dates, group size; offers to pre-fill the `/book` form
4. **Human handoff** — triggered by visitor request or AI uncertainty; WhatsApp message sent to staff with chat summary; staff replies forwarded to visitor via webhook → WS
5. **Session resume** — `visitorId` in localStorage allows reconnection to existing session

## Database Schema

### `chatSessions`

| Column           | Type                        | Purpose                                        |
| ---------------- | --------------------------- | ---------------------------------------------- |
| `id`             | serial PK                   | Session identifier                             |
| `visitorId`      | varchar                     | Anonymous ID (localStorage)                    |
| `language`       | enum('en','he')             | From site language toggle                      |
| `mode`           | enum('ai','human','closed') | Current chat mode                              |
| `summary`        | text                        | AI-generated summary for handoff               |
| `bookingContext` | json                        | Gathered preferences (tour, dates, group size) |
| `createdAt`      | timestamp                   | Session start                                  |
| `closedAt`       | timestamp                   | Session end                                    |

### `chatMessages`

| Column      | Type                         | Purpose                                 |
| ----------- | ---------------------------- | --------------------------------------- |
| `id`        | serial PK                    | Message identifier                      |
| `sessionId` | FK → chatSessions            | Parent session                          |
| `role`      | enum('visitor','ai','agent') | Sender                                  |
| `content`   | text                         | Message body                            |
| `metadata`  | json                         | Optional (booking data, handoff reason) |
| `createdAt` | timestamp                    | Sent at                                 |

## AI Chatbot Design

### System Prompt

Dynamic system prompt built from:

- Tour catalog (from `tours` table): names, prices, itineraries, difficulty
- Pricing rules (from `shared/pricing.ts`)
- Kosher dining information
- Logistics (pickup locations, what to bring, weather)
- FAQ content
- Language instruction: respond in visitor's detected language (EN/HE)
- Booking assist instruction: gather preferences, then offer to pre-fill form

### Conversation Memory

Full session history sent with each Claude API call. Sessions are short-lived (tour inquiries), so context window limits are not a concern.

### Handoff Triggers

- Visitor explicitly asks for a human
- AI detects a question it can't confidently answer
- Visitor asks about custom/complex arrangements

## Chat Widget UI

### Appearance

- Floating bubble, bottom-right corner
- Design tokens: charcoal (#1c1c1c) header, warm ivory (#faf7f2) body, gold (#d4af37) accents
- Framer Motion slide-up animation
- RTL layout when Hebrew active
- Mobile: full-screen overlay. Desktop: 380px wide panel

### Widget States

1. **Collapsed** — bubble icon with subtle pulse
2. **Open** — message history + input + send button
3. **Typing** — animated dots during AI response
4. **Handoff** — "Connecting you via WhatsApp..." status
5. **Booking prompt** — inline card with gathered details + "Start Booking" button

### Message Types

- Text (visitor, AI, agent)
- Quick reply buttons (tour name chips)
- Booking summary card (pre-fill preview)

## WhatsApp Bridge

### Visitor → Staff

On handoff, server sends WhatsApp message to configured staff number:

- AI-generated chat summary
- Visitor's gathered preferences
- Session link identifier

### Staff → Visitor

Staff replies on WhatsApp → webhook hits Express server → message forwarded to visitor's active WebSocket.

### Fallback

If WhatsApp API not configured: create lead in admin pipeline + email notification.

## Error Handling

| Scenario             | Response                                                |
| -------------------- | ------------------------------------------------------- |
| Claude API failure   | Fallback message + trigger handoff                      |
| WebSocket disconnect | Auto-reconnect with exponential backoff, queue messages |
| WhatsApp API failure | Create lead + email notification                        |
| Rate limit exceeded  | Max 30 messages/session/minute                          |

## Testing Strategy

- Unit: chat routing (AI vs human mode), booking context extraction, system prompt generation
- Integration: WebSocket lifecycle, Claude API mock responses
- Follows existing Vitest patterns (18 test files, 107 tests)

## Technology Choices

| Component   | Technology                                      |
| ----------- | ----------------------------------------------- |
| Chat widget | React + Framer Motion + shadcn/ui               |
| Real-time   | WebSocket (`ws` library)                        |
| AI          | Claude API (Anthropic SDK)                      |
| Knowledge   | Tours DB + pricing rules + FAQ (dynamic prompt) |
| WhatsApp    | WhatsApp Business Cloud API (webhook)           |
| Storage     | 2 MySQL tables via Drizzle ORM                  |
| Bilingual   | Existing LanguageContext (EN/HE)                |
| Booking     | Event emitter → navigate to /book pre-filled    |
