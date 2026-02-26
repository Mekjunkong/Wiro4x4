# Test Coverage Analysis & Improvement Recommendations

**Date:** 2026-02-26
**Current State:** 31 test files, 166 tests (133 pass, 33 skipped DB-dependent)

---

## 1. Current Coverage Summary

### Well-Tested Areas

| Area                                     | Tests | Notes                                              |
| ---------------------------------------- | ----- | -------------------------------------------------- |
| Pricing engine (`shared/pricing.ts`)     | 31    | Excellent — all calculations, edge cases, rounding |
| Validation schemas (`shared/schemas.ts`) | 12    | 6 of 11 schemas tested (see gap below)             |
| Booking CRUD                             | 6     | Create, list, agent/lead/financial list            |
| Lead management                          | 6     | Create, list, status transitions                   |
| Review workflow                          | 6     | Submit, approve, stats                             |
| Agent CRUD                               | 5     | Create, list, update, delete                       |
| Blog management                          | 5     | List, getBySlug, create, upload, listAll           |
| Admin roles (RBAC)                       | 4     | Owner/admin/manager/agent access control           |
| Admin enhancements                       | 8     | Booking reschedule, bulk email, availability       |
| CRM features                             | 5     | Customer list, activity, pipeline stats            |
| Lead scoring                             | 11    | Source, phone, message, status, recency            |
| Email notifications                      | 6     | Mocked `notifyOwner` calls                         |
| Chat system                              | 6     | Session/message persistence                        |
| Package CRUD                             | 6     | Full lifecycle                                     |
| Rate limiting                            | 3     | Under/over limit, independent keys                 |

### Partially Tested

| Area              | Tests | What's Missing                          |
| ----------------- | ----- | --------------------------------------- |
| Financial records | 4     | No update/delete tests                  |
| Gallery           | 3     | No image validation, no update/delete   |
| Dashboard         | 2     | Response shape only, no data accuracy   |
| Settings          | 4     | No edge cases (empty key, large values) |
| Stats             | 2     | Public stats shape only                 |
| Scheduler         | 2     | Smoke test only, no job execution       |

---

## 2. Untested Schemas (Gap in `validation.test.ts`)

The `validation.test.ts` file tests 6 of the 11 Zod schemas in `shared/schemas.ts`. These 5 are completely untested:

| Schema                        | Lines   | Risk                                   |
| ----------------------------- | ------- | -------------------------------------- |
| `blogPostInputSchema`         | 129-142 | Blog creation with invalid data        |
| `tourPackageInputSchema`      | 144-157 | Package creation (min 2 tours, max 5)  |
| `customerInputSchema`         | 180-192 | CRM customer creation                  |
| `customerActivityInputSchema` | 194-210 | Activity type enum, due date transform |
| `settingsUpdateSchema`        | 233-236 | Accepts `z.unknown()` for value        |

**Also untested:** `createCheckoutSchema`, `refundSchema`, `verifySessionSchema`, `updateUserRoleSchema`, `bookingDraftInputSchema` (partially tested in `bookingDraft.test.ts` but not via `validation.test.ts`).

---

## 3. Untested Server Modules

These server files have **zero test coverage**:

### 3a. Route Handlers Without Tests

| Route File            | Procedures                                                                       | Priority                                                  |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `routes/health.ts`    | `readiness`, `liveness`                                                          | Medium — health checks are critical for monitoring        |
| `routes/analytics.ts` | `funnelData`                                                                     | Low — admin-only, DB-dependent                            |
| `routes/admin.ts`     | User management, audit log                                                       | Medium — admin RBAC already tested elsewhere              |
| `routes/tour.ts`      | `tour.update`, `tour.delete`, `tour.listAllPaginated`                            | **High** — CRUD gaps                                      |
| `routes/payment.ts`   | `createCheckout`, `verifySession`, `refund`, `createPaymentLink`, `isConfigured` | Medium — Stripe dependent, but `isConfigured` is testable |

### 3b. Services Without Tests

| File                        | Functions                                                                                                                            | Priority                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `customerEmailService.ts`   | `sendCustomerConfirmation`, `sendBookingReminder`, `sendPostTourFeedback`, `sendPaymentConfirmationEmail`, `sendBulkEmailToCustomer` | **High** — 5 email functions, none tested (even for graceful fallback) |
| `abandonedBookingEmail.ts`  | `sendBookingRecoveryEmail`                                                                                                           | Medium — recovery email                                                |
| `newsletterEmailService.ts` | Newsletter send logic                                                                                                                | Medium — partially covered by `newsletter.test.ts` route test          |
| `reminderScheduler.ts`      | `startReminderScheduler`, `processReminders`                                                                                         | Medium — scheduling logic                                              |
| `securityHeaders.ts`        | `setSecurityHeaders`, `expressSecurityHeaders`                                                                                       | **High** — security feature, easy to test                              |
| `stripeService.ts`          | `initiateCheckout`, `verifyAndCompleteSession`, `processRefund`                                                                      | Low — requires Stripe key                                              |
| `stripeSessionChecker.ts`   | Session polling logic                                                                                                                | Low                                                                    |
| `sentry.ts`                 | Error capture                                                                                                                        | Low                                                                    |

### 3c. Background Jobs Without Tests

| File                       | Purpose                     | Priority |
| -------------------------- | --------------------------- | -------- |
| `jobs/bookingReminders.ts` | Pre-tour reminders          | Medium   |
| `jobs/dailySummary.ts`     | Daily summary email         | Medium   |
| `jobs/leadAlerts.ts`       | Lead alert notifications    | Medium   |
| `jobs/postTourFeedback.ts` | Post-tour feedback requests | Medium   |

---

## 4. XSS / Input Sanitization Gap

The `noHtml` refine function in `shared/schemas.ts` rejects `<tags>` in text fields. However:

- **Not tested directly** — no test verifies that `<script>alert(1)</script>` is rejected
- Applied to: `contactName`, `hotelPreferences`, `foodPreferences`, `specialRequests`, `dietaryRestrictions`, `review.text`, `lead.message`
- **Not applied to:** `agentInputSchema.notes`, `customerInputSchema.notes`, `blogPostInputSchema.content` (blog content legitimately needs HTML/markdown)

**Recommendation:** Add explicit XSS validation tests for every field that uses `noHtml`.

---

## 5. Recommended Test Improvements (Prioritized)

### Priority 1: High-Impact, Easy to Add

#### A. Complete Schema Validation Tests

**File:** `server/validation.test.ts`
**Effort:** ~30 minutes
**What to add:**

- `blogPostInputSchema` — valid/invalid, missing required fields
- `tourPackageInputSchema` — min 2 tours, max 5, discount bounds
- `customerInputSchema` — stage enum, language enum
- `customerActivityInputSchema` — type enum, date transform
- `settingsUpdateSchema` — empty key rejection
- XSS `noHtml` tests for all applicable fields

#### B. Security Headers Test

**File:** New `server/securityHeaders.test.ts`
**Effort:** ~15 minutes
**What to add:**

```
- setSecurityHeaders sets all 4 expected headers
- expressSecurityHeaders calls next()
- Header values match expected constants
```

#### C. Customer Email Service Graceful Fallback

**File:** New `server/customerEmailService.test.ts`
**Effort:** ~20 minutes
**What to add:**

```
- sendCustomerConfirmation returns false without RESEND_API_KEY
- sendBookingReminder returns false without RESEND_API_KEY
- sendPostTourFeedback returns false without RESEND_API_KEY
- sendPaymentConfirmationEmail returns false without RESEND_API_KEY
- sendBulkEmailToCustomer returns false without RESEND_API_KEY
```

#### D. Health Route Test

**File:** New `server/health.test.ts`
**Effort:** ~10 minutes
**What to add:**

```
- health.liveness returns { status: "alive", timestamp }
- health.readiness throws without DB (consistent with itWithDb pattern)
```

### Priority 2: Medium-Impact, Moderate Effort

#### E. Tour CRUD Completion

**File:** Existing `server/booking.test.ts` or new `server/tour.test.ts`
**Effort:** ~20 minutes
**What to add:**

```
- tour.create with auto-generated slug
- tour.update modifies fields
- tour.delete removes tour
- tour.getBySlug returns undefined for non-existent
- tour.listAllPaginated returns pagination shape
```

#### F. Abandoned Booking Email Test

**File:** New `server/abandonedBookingEmail.test.ts`
**Effort:** ~10 minutes
**What to add:**

```
- sendBookingRecoveryEmail returns false without RESEND_API_KEY
- Function exports correctly
```

#### G. Rate Limiting Integration

**File:** Extend existing `server/rateLimit.test.ts`
**Effort:** ~15 minutes
**What to add:**

```
- Verify rate limit is actually applied to booking.create (not just the limiter in isolation)
- Test that different IPs are tracked independently in route context
```

#### H. Tour Slug Generation

**File:** `server/routes/tour.ts` has a `generateSlug` helper
**Effort:** ~10 minutes
**What to add:**

```
- Generates lowercase slug from name
- Strips special characters
- Handles leading/trailing hyphens
- Handles spaces and multiple special chars
```

### Priority 3: Larger Effort, High Value

#### I. Booking Validation Business Rules

**Effort:** ~30 minutes
The booking form has "7-rule validation" mentioned in CLAUDE.md but no test verifies these rules end-to-end:

```
- Departure date must be after arrival date
- At least 1 adult required
- Children ages required when hasChildren is true
- Pickup and dropoff points required
- Custom pickup required when pickupPoint is "other"
```

#### J. Analytics Funnel Data

**File:** New `server/analytics.test.ts`
**Effort:** ~15 minutes (DB-dependent)
**What to add:**

```
- funnelData returns steps array and conversionRate
- Zero bookings returns 0% conversion
- Auth required (protected procedure)
```

#### K. Reminder Scheduler Logic

**File:** New `server/reminderScheduler.test.ts`
**Effort:** ~30 minutes
**What to add:**

```
- processReminders handles empty booking list
- Idempotency: doesn't send duplicate reminders (checks reminderSentAt)
- startReminderScheduler is idempotent
```

---

## 6. Summary: Biggest Gaps by Risk

| Gap                                         | Risk Level | Effort | Why It Matters                         |
| ------------------------------------------- | ---------- | ------ | -------------------------------------- |
| Missing schema validation tests (5 schemas) | **High**   | Low    | Invalid data could reach DB            |
| No XSS/noHtml validation tests              | **High**   | Low    | Security vulnerability unverified      |
| Customer email service untested             | **High**   | Low    | 5 functions with zero coverage         |
| Security headers untested                   | **High**   | Low    | Security feature needs verification    |
| Tour CRUD incomplete                        | **Medium** | Low    | Update/delete paths unverified         |
| Health endpoint untested                    | **Medium** | Low    | Monitoring reliability                 |
| Rate limit integration                      | **Medium** | Medium | Limiter tested in isolation only       |
| Booking business rules                      | **Medium** | Medium | 7-rule validation unverified           |
| Background jobs untested                    | **Medium** | Medium | Scheduler reliability                  |
| Frontend components (0 tests)               | **Low**    | High   | Would need React Testing Library setup |
| E2E flows (0 tests)                         | **Low**    | High   | Would need Playwright setup            |

---

## 7. Quick Wins (Can Be Done Today)

1. Add 5 missing schema tests to `validation.test.ts` (~15 tests)
2. Add `noHtml` XSS rejection tests (~6 tests)
3. Add `securityHeaders.test.ts` (~3 tests)
4. Add `customerEmailService.test.ts` graceful fallback (~5 tests)
5. Add `health.test.ts` for liveness endpoint (~2 tests)
6. Add tour slug generation tests (~4 tests)

**Total: ~35 new tests, ~2 hours of work, covering the most critical gaps.**
