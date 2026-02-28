# Wiro Accountant Agent — Design Document

**Date:** 2026-02-28
**Status:** Approved
**Agent File:** `.claude/agents/wiro-accountant.md`

## Overview

A single comprehensive Claude Code agent (`wiro-accountant`) for Wiro 4x4 that handles all financial management: invoicing, income/expense tracking, Thai tax compliance, and inventory management.

## Context

### Existing Agents (No Overlap)

| Agent                  | Role                                                    | Relationship                                                                           |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `wiro-finance`         | Read-only financial analysis (P&L, trends, projections) | Accountant **builds tools**; Finance **reads data**                                    |
| `wiro-cost-calculator` | Pricing features for customers/admin                    | Accountant handles **post-sale** financials; Calculator handles **pre-sale** estimates |
| `wiro-ops`             | Operational briefings                                   | Accountant provides **financial data** that ops can reference                          |

### Source Document

Design incorporates requirements from `ai_accounting_assistant_kosher_tour.docx` — a comprehensive Thai tax-compliant accounting spec including:

- Chart of Accounts (Thai Accounting Standards)
- VAT/WHT/CIT rules and filing calendar
- Multi-currency handling (THB/ILS/USD)
- Document templates (Tax Invoice, Receipt, WHT Certificate)

## Architecture

### Single Agent: `wiro-accountant`

- **Access:** Full write (Read, Write, Edit, Bash, Grep, Glob)
- **Scope:** Build and maintain accounting features within the Wiro4x4 codebase
- **Pattern:** Same as `wiro-cost-calculator` — builds React components, tRPC routes, DB helpers, and scripts

### Four Capabilities

1. **Invoicing & Receipts** — Generate Tax Invoices (ใบกำกับภาษี), Receipts (ใบเสร็จรับเงิน), WHT Certificates
2. **Income/Expense Tracking** — Chart of accounts (4xxxx-6xxxx), multi-currency with FX gain/loss
3. **Tax Reporting** — VAT (PP.30), WHT (PND.3/53), CIT estimation, filing reminders
4. **Inventory Management** — Vehicle fleet, equipment, supplies, depreciation

### Database Strategy

Extends existing schema with new tables:

| Table                         | Purpose                                                               |
| ----------------------------- | --------------------------------------------------------------------- |
| `financialRecords` (existing) | Foundation — continues to store revenue/cost/refund records           |
| `accountingEntries` (new)     | Double-entry journal with account codes from chart of accounts        |
| `invoices` (new)              | Invoice register — number, customer, amount, status, payment tracking |
| `inventory` (new)             | Asset/equipment tracking with purchase date, cost, depreciation       |
| `taxFilings` (new)            | Tax filing deadlines and completion status                            |

### Thai Tax Compliance

| Tax               | Rate                  | Form           | Deadline           |
| ----------------- | --------------------- | -------------- | ------------------ |
| VAT               | 7%                    | PP.30 (ภ.พ.30) | 15th monthly       |
| WHT (services)    | 3%                    | PND.3/53       | 7th monthly        |
| WHT (rental)      | 5%                    | PND.3/53       | 7th monthly        |
| WHT (transport)   | 1%                    | PND.3/53       | 7th monthly        |
| WHT (advertising) | 2%                    | PND.3/53       | 7th monthly        |
| CIT               | 20% (SME rates apply) | PND.50/51      | May / Aug annually |

### Chart of Accounts

**Revenue (4xxxx):** Tour packages (41000), day trips (41100), transfers (41200), custom tours (41300), commissions (42000), other (49000), FX gain (49100)

**Cost of Sales (5xxxx):** Kosher hotel (51000), kosher food (51100), transport (51200), guide fees (51300), entrance fees (51400), domestic flights (51500), travel insurance (51600)

**Operating Expenses (6xxxx):** Office rent (61000), utilities (61100), salaries (61200), marketing (61300), website/tech (61400), professional fees (61500), bank charges (61600), supplies (61700), communication (61800), misc (61900), FX loss (69100)

### Hard Rules

1. NEVER modify `server/_core/` or `client/src/_core/`
2. NEVER modify `drizzle/migrations/*`
3. ALWAYS add Zod schemas to `shared/schemas.ts`
4. ALWAYS add DB helpers to `server/db.ts`
5. ALWAYS follow existing tRPC router patterns
6. ALWAYS show amounts with currency code + comma formatting
7. ALWAYS support trilingual where applicable (TH official, EN business, HE customer)
8. ALWAYS run `npx tsc --noEmit` + `pnpm test` after changes
9. NEVER give tax advice, sign statements, or file taxes
10. ALWAYS flag transactions over ฿500,000 for human review
11. ALWAYS export existing data before modifying DB schema
12. ALWAYS log financial write operations with timestamp and context
13. ALWAYS use BOT reference rate for FX conversions, track gain/loss
14. ALWAYS require confirmation for financial operations above configurable threshold

## Decisions

| Decision                  | Choice                   | Rationale                                                            |
| ------------------------- | ------------------------ | -------------------------------------------------------------------- |
| Single vs multiple agents | Single `wiro-accountant` | Simpler management, capabilities are interconnected                  |
| Access level              | Full write               | Needs to build features, create scripts, add DB tables               |
| External integrations     | None (build in-codebase) | No external accounting software currently in use                     |
| Architecture              | Monolithic agent file    | Matches existing agent patterns (wiro-finance, wiro-cost-calculator) |
| Additional rules          | All 4 selected           | Backup, logging, FX support, approval workflow                       |
