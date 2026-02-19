# Wiro4x4 Improvements Design

**Date:** 2026-02-19
**Approach:** Fast Feedback First
**Scope:** Code Quality + Testing + Performance (no new features)

## 1. ESLint + CI Integration

Add ESLint with `@typescript-eslint` using flat config format (`eslint.config.js`).

**Rules:**

- `no-unused-vars` (error)
- `no-explicit-any` (warn)
- `consistent-return` (error)
- `no-floating-promises` (error)
- Prettier integration via `eslint-config-prettier`

**CI:** Add `pnpm lint` step in `ci.yml` between TypeScript check and tests.

**lint-staged:** Add ESLint to existing config so errors are caught on commit.

**New dependencies:** `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`

**New scripts:** `"lint": "eslint ."`, `"lint:fix": "eslint . --fix"`

## 2. Split db.ts into Domain Modules

Current: 1 file, 90+ functions, ~1560 lines.

**New structure:**

```
server/db/
  index.ts          # Re-exports + getDb() connection
  users.ts          # upsertUser, getUserByOpenId, getAllAdminUsers, updateUserRole, removeAdminAccess
  bookings.ts       # CRUD + paginated + bulk + reminders/feedback
  agents.ts         # CRUD + performance stats + date range queries
  leads.ts          # CRUD + paginated + bulk + score update
  financial.ts      # CRUD + stats + generateDefaultFinancialRecords
  gallery.ts        # CRUD + paginated
  reviews.ts        # CRUD + stats + bulk approve/delete
  payments.ts       # CRUD + stats + total paid + pending
  tours.ts          # CRUD + slug lookup + paginated
  blog.ts           # CRUD + slug lookup + paginated
  subscribers.ts    # CRUD + deactivate
  chat.ts           # sessions + messages + mode/summary/context updates
  customers.ts      # CRUD + pipeline + findOrCreate + activities + timeline
  audit.ts          # logAdminAction + scheduledEmail helpers
```

**Migration:** `server/db/index.ts` re-exports everything. Existing imports (`import { ... } from "../db"`) keep working with zero changes.

**Pagination helper:** Extract shared `paginatedQuery()` function used by 7+ paginated functions.

## 3. Docker Test DB in CI

Add MySQL 8.0 service container to GitHub Actions CI.

**ci.yml additions:**

```yaml
services:
  mysql:
    image: mysql:8.0
    env:
      MYSQL_ROOT_PASSWORD: test
      MYSQL_DATABASE: wiro_test
    ports:
      - 3306:3306
    options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
```

**Environment:** `DATABASE_URL=mysql://root:test@localhost:3306/wiro_test`

**Schema setup:** Run `pnpm db:push` before tests to create tables.

**Local unchanged:** Without DATABASE_URL, `itWithDb` still skips.

**Unlocks:** 25 currently-skipped DB-dependent tests run in CI.

## 4. Performance Optimizations

### 4a. Compression Middleware

Add `compression` package to Express. Compresses API responses with gzip/brotli (60-80% size reduction for JSON).

### 4b. React Query Caching (staleTime tuning)

Configure staleTime by query type in tRPC client setup:

- Static content (tours, gallery, blog): 5 min
- Semi-dynamic (reviews, pricing): 2 min
- Real-time (bookings, admin): 0 (always fresh)

### 4c. Database Indexes

Add to Drizzle schema:

- `idx_leads_status_createdAt` on leads(status, createdAt)
- `idx_customers_email` on customers(email)
- `idx_customers_phone` on customers(phone)
- `idx_chat_messages_sessionId` on chatMessages(sessionId)
- `idx_blog_posts_isPublished` on blogPosts(isPublished, publishedAt)

Applied via `pnpm db:push`.

## 5. E2E Tests + Bundle Analysis

### 5a. Playwright E2E Tests

3 critical user paths:

1. Homepage -> Booking flow (load, click Book Now, fill form, submit)
2. Gallery + Reviews (browse with filters, view reviews)
3. Admin dashboard (login, view bookings, paginate, switch tabs)

**Setup:** `@playwright/test` dev dependency, `e2e/` directory, `playwright.config.ts`, `pnpm e2e` script.

**CI:** Run after build step (start server, run Playwright, stop).

### 5b. Bundle Analysis

Add `rollup-plugin-visualizer` to vite.config.ts.

**New script:** `"build:analyze"` builds + generates HTML treemap.

**CI:** Warn if any chunk exceeds 500KB.

## Implementation Order

1. ESLint setup (instant editor feedback)
2. Split db.ts (faster navigation)
3. Docker test DB in CI (full test coverage)
4. Compression + caching + indexes (performance)
5. E2E tests + bundle analysis (reliability + observability)

## Success Criteria

- [ ] ESLint runs in editor and CI with zero errors
- [ ] db.ts split into 15 domain modules, all imports still work
- [ ] CI runs all 131+ tests with MySQL service container
- [ ] API responses are gzip-compressed
- [ ] React Query caches static content for 5 min
- [ ] 5 new database indexes added
- [ ] 3 Playwright E2E test suites pass
- [ ] Bundle visualizer available via `pnpm build:analyze`
