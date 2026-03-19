# Security + UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix XSS vulnerability in MarkdownRenderer and eliminate overlapping mobile CTA elements via sequential cascade.

**Architecture:** Allowlist-based URL sanitization in the markdown renderer. Custom DOM event (`cookie-consent-changed`) for cross-component communication. Scroll + viewport + route gating for overlay visibility.

**Tech Stack:** React 19, TypeScript, Vitest, Wouter, localStorage, sessionStorage, custom DOM events.

**Spec:** `docs/superpowers/specs/2026-03-19-security-ux-improvements-design.md`

---

## File Map

| File                                              | Action                          | Responsibility                                  |
| ------------------------------------------------- | ------------------------------- | ----------------------------------------------- |
| `client/src/lib/sanitizeUrl.ts`                   | Create                          | URL sanitization utility                        |
| `client/src/lib/sanitizeUrl.test.ts`              | Create                          | Unit tests for sanitization                     |
| `client/src/lib/cookieConsent.ts`                 | Create                          | Shared constant + event name                    |
| `client/src/components/blog/MarkdownRenderer.tsx` | Modify (lines 28-49)            | Apply sanitizeUrl to links + images             |
| `client/src/components/CookieConsent.tsx`         | Modify (lines 4, 20-26, 34)     | Import shared key, dispatch event, bump z-index |
| `client/src/components/StickyBookBar.tsx`         | Modify (lines 6-16, 20)         | Add consent gate                                |
| `client/src/components/FloatingActionButtons.tsx` | Modify (lines 7-11, 32)         | Hide on mobile homepage                         |
| `client/src/components/NewsletterPopup.tsx`       | Modify (lines 8, 33-38, 63, 68) | Gating + z-index + delay                        |
| `client/src/App.tsx`                              | Modify (lines 38-44)            | Page view counter in ScrollToTop                |

---

### Task 1: sanitizeUrl Utility + Tests

**Files:**

- Create: `client/src/lib/sanitizeUrl.ts`
- Create: `client/src/lib/sanitizeUrl.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// client/src/lib/sanitizeUrl.test.ts
import { describe, it, expect } from "vitest";
import { sanitizeUrl } from "./sanitizeUrl";

describe("sanitizeUrl", () => {
  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("allows http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("allows relative paths", () => {
    expect(sanitizeUrl("/images/photo.jpg")).toBe("/images/photo.jpg");
  });

  it("allows anchor links", () => {
    expect(sanitizeUrl("#section")).toBe("#section");
  });

  it("allows mailto links", () => {
    expect(sanitizeUrl("mailto:test@example.com")).toBe(
      "mailto:test@example.com"
    );
  });

  it("allows tel links", () => {
    expect(sanitizeUrl("tel:+1234567890")).toBe("tel:+1234567890");
  });

  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
  });

  it("blocks JAVASCRIPT: (case insensitive)", () => {
    expect(sanitizeUrl("JAVASCRIPT:alert(1)")).toBe("#");
  });

  it("blocks javascript: with control characters", () => {
    expect(sanitizeUrl("java\tscript:alert(1)")).toBe("#");
  });

  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("blocks vbscript: protocol", () => {
    expect(sanitizeUrl("vbscript:alert(1)")).toBe("#");
  });

  it("blocks javascript: with leading whitespace", () => {
    expect(sanitizeUrl("  javascript:alert(1)  ")).toBe("#");
  });

  it("strips control characters from safe URLs", () => {
    expect(sanitizeUrl("https://example.com\x00")).toBe("https://example.com");
  });

  it("handles empty string", () => {
    expect(sanitizeUrl("")).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/sanitizeUrl.test.ts`
Expected: FAIL — module `./sanitizeUrl` not found

- [ ] **Step 3: Write the implementation**

```typescript
// client/src/lib/sanitizeUrl.ts

/**
 * Sanitize a URL from markdown content by allowlisting safe protocols.
 * Strips control characters and returns the cleaned URL. Blocks anything
 * except http(s), mailto, tel, relative paths, and anchors.
 */
export function sanitizeUrl(url: string): string {
  const cleaned = url.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (/^[a-z]+:/i.test(cleaned) && !/^https?:|^mailto:|^tel:/i.test(cleaned)) {
    return "#";
  }
  return cleaned;
}
```

**Note:** Returns `cleaned` (not `url`) so control characters are always stripped from the output, even for safe URLs.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/lib/sanitizeUrl.test.ts`
Expected: 14 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/sanitizeUrl.ts client/src/lib/sanitizeUrl.test.ts
git commit -m "feat: add allowlist-based URL sanitization utility"
```

---

### Task 2: Apply sanitizeUrl to MarkdownRenderer

**Files:**

- Modify: `client/src/components/blog/MarkdownRenderer.tsx` (lines 6, 28-34, 37-49)

- [ ] **Step 1: Add import at top of file**

At line 6 (after the `import type { ReactNode } from "react";` line), add:

```typescript
import { sanitizeUrl } from "@/lib/sanitizeUrl";
```

- [ ] **Step 2: Apply to image src (line ~31)**

In the `renderInline` function, find the image rendering block:

```typescript
src={match[2]}
```

Change to:

```typescript
src={sanitizeUrl(match[2])}
```

- [ ] **Step 3: Apply to link href (line ~43)**

Find the link rendering block:

```typescript
href={match[4]}
```

Change to:

```typescript
href={sanitizeUrl(match[4])}
```

- [ ] **Step 4: Run all tests**

Run: `pnpm test`
Expected: All existing tests pass + new sanitizeUrl tests pass

- [ ] **Step 5: Commit**

```bash
git add client/src/components/blog/MarkdownRenderer.tsx
git commit -m "fix(security): apply URL sanitization to MarkdownRenderer links and images"
```

---

### Task 3: Shared Cookie Consent Constant + CookieConsent Event + z-index

**Files:**

- Create: `client/src/lib/cookieConsent.ts`
- Modify: `client/src/components/CookieConsent.tsx` (lines 4, 20-26, 34)

- [ ] **Step 1: Create shared constant file**

```typescript
// client/src/lib/cookieConsent.ts
export const COOKIE_CONSENT_KEY = "cookie-consent-accepted";
export const COOKIE_CONSENT_EVENT = "cookie-consent-changed";
```

- [ ] **Step 2: Update CookieConsent to import shared constant**

In `CookieConsent.tsx`, replace line 4:

```typescript
// BEFORE:
const COOKIE_CONSENT_KEY = "cookie-consent-accepted";
```

With:

```typescript
// AFTER:
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";
```

- [ ] **Step 3: Update handleAccept to dispatch event**

Replace the existing `handleAccept` function (lines 20-26):

```typescript
// BEFORE:
const handleAccept = () => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  } catch {
    // localStorage not available
  }
  setVisible(false);
};
```

With:

```typescript
// AFTER:
const handleAccept = () => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  } catch {
    // localStorage not available
  }
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  setVisible(false);
};
```

- [ ] **Step 4: Update z-index**

In the JSX (line 34), change:

```
className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up"
```

To:

```
className="fixed bottom-0 left-0 right-0 z-[9997] p-4 animate-fade-in-up"
```

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/cookieConsent.ts client/src/components/CookieConsent.tsx
git commit -m "feat: extract cookie consent constant, dispatch custom event, bump z-index"
```

---

### Task 4: StickyBookBar — Consent Gate

**Files:**

- Modify: `client/src/components/StickyBookBar.tsx` (lines 1-16)

- [ ] **Step 1: Add import for shared constants**

After the existing imports (line ~4), add:

```typescript
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";
```

- [ ] **Step 2: Replace component state and scroll logic**

Replace lines 6-16 (the component function start through the scroll useEffect):

```typescript
// BEFORE:
export function StickyBookBar() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
```

With:

```typescript
// AFTER:
export function StickyBookBar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [consentGiven, setConsentGiven] = useState(
    () => {
      try { return !!localStorage.getItem(COOKIE_CONSENT_KEY); } catch { return false; }
    }
  );

  useEffect(() => {
    const onConsent = () => setConsentGiven(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visible = scrolled && consentGiven;
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/StickyBookBar.tsx
git commit -m "feat: StickyBookBar gated behind cookie consent"
```

---

### Task 5: FloatingActionButtons — Hide on Mobile Homepage

**Files:**

- Modify: `client/src/components/FloatingActionButtons.tsx` (lines 7-11, 32)

- [ ] **Step 1: Add state for mobile detection and scroll tracking**

At the top of the file, add the import (after other imports):

```typescript
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/lib/cookieConsent";
```

After the existing state declarations (line ~11, after `const isBookingPage = ...`), add:

```typescript
const [scrolledPast, setScrolledPast] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const [consentGiven, setConsentGiven] = useState(() => {
  try {
    return !!localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return false;
  }
});

useEffect(() => {
  const onConsent = () => setConsentGiven(true);
  window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
}, []);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

useEffect(() => {
  const handleScroll = () => setScrolledPast(window.scrollY > 600);
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const isHomePage = location === "/";
const hideOnMobile = isMobile && scrolledPast && consentGiven && isHomePage;
```

- [ ] **Step 2: Add early return**

Before the existing `return (` JSX block, add:

```typescript
if (hideOnMobile) return null;
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add client/src/components/FloatingActionButtons.tsx
git commit -m "feat: hide FloatingActionButtons on mobile homepage when StickyBookBar visible"
```

---

### Task 6: App.tsx — Global Page View Counter

**Files:**

- Modify: `client/src/App.tsx` (lines 38-44)

- [ ] **Step 1: Add page view tracking to ScrollToTop**

Replace lines 38-44:

```typescript
// BEFORE:
function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
  return null;
}
```

With:

```typescript
// AFTER:
function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const views =
        Number(sessionStorage.getItem("wiro_page_views") || "0") + 1;
      sessionStorage.setItem("wiro_page_views", String(views));
    } catch {
      // sessionStorage not available
    }
  }, [location]);
  return null;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: track page views in sessionStorage for newsletter gating"
```

---

### Task 7: NewsletterPopup — Gating + z-index + Delay

**Files:**

- Modify: `client/src/components/NewsletterPopup.tsx` (lines 8, 33-38, 63, 68)

- [ ] **Step 1: Add import for shared constant**

At the top of the file, add:

```typescript
import { COOKIE_CONSENT_KEY } from "@/lib/cookieConsent";
```

- [ ] **Step 2: Update delay constant**

Change line 8:

```typescript
// BEFORE:
const SHOW_DELAY_MS = 15_000;
```

To:

```typescript
// AFTER:
const SHOW_DELAY_MS = 30_000;
```

- [ ] **Step 3: Update the visibility useEffect**

Replace lines 33-38 (the useEffect that sets the timer):

```typescript
// BEFORE:
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && Date.now() < Number(stored)) return;

  const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
  return () => clearTimeout(timer);
}, []);
```

With:

```typescript
// AFTER:
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && Date.now() < Number(stored)) return;

  // Gate: cookie consent must be accepted
  try {
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) return;
  } catch {
    return;
  }

  // Gate: must have viewed 2+ pages in this session
  try {
    const views = Number(sessionStorage.getItem("wiro_page_views") || "0");
    if (views < 2) return;
  } catch {
    return;
  }

  const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
  return () => clearTimeout(timer);
}, []);
```

- [ ] **Step 4: Update z-index for backdrop**

Find the backdrop div (line ~63):

```
className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
```

Change `z-[9998]` to `z-[10002]`.

- [ ] **Step 5: Update z-index for popup container**

Find the popup container div (line ~68):

```
className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
```

Change `z-[9999]` to `z-[10003]`.

- [ ] **Step 6: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add client/src/components/NewsletterPopup.tsx
git commit -m "feat: NewsletterPopup gated behind consent + page views, delay 30s, z-index fix"
```

---

### Task 8: Full Verification

- [ ] **Step 1: Run all tests**

Run: `pnpm test`
Expected: All tests pass (existing + 14 new sanitizeUrl tests)

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Manual verification checklist**

1. Open `http://localhost:3000` in mobile viewport (375px)
2. Clear localStorage and sessionStorage in DevTools
3. Reload page
4. Verify: CookieConsent bar visible at bottom, FloatingActionButtons visible at bottom-right
5. Verify: NO StickyBookBar visible even when scrolling
6. Click "Accept" on CookieConsent
7. Scroll down past 600px — StickyBookBar appears, FloatingActionButtons disappear
8. Navigate to `/tours` — FloatingActionButtons reappear (not homepage)
9. Navigate back to `/` — after 2 pages and 30s, NewsletterPopup should appear
10. Resize to desktop (>768px) — FloatingActionButtons + StickyBookBar both visible (no overlap)

- [ ] **Step 4: Final commit if any fixes needed, then done**
