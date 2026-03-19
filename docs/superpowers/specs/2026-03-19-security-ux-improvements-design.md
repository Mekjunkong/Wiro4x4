# Security + UX Improvements Design

**Date:** 2026-03-19
**Status:** Approved
**Scope:** XSS prevention in MarkdownRenderer + sequential CTA cascade on homepage

---

## 1. Security: URL Sanitization in MarkdownRenderer

### Problem

`client/src/components/blog/MarkdownRenderer.tsx` renders markdown to JSX via regex parsing. While React auto-escapes text content (no `dangerouslySetInnerHTML`), two elements pass user-controlled URLs directly to DOM attributes:

- `<a href={match[4]}>` — link URLs from `[text](url)` markdown
- `<img src={match[2]}>` — image URLs from `![alt](url)` markdown

An admin (or compromised admin account) could inject `javascript:`, `data:`, or `vbscript:` protocol URLs in blog content to execute scripts for any visitor.

### Solution

Add an **allowlist-based** `sanitizeUrl()` function at the top of `MarkdownRenderer.tsx`. Allowlisting safe protocols is more robust than blocklisting dangerous ones, because browsers can interpret control characters, tabs, and null bytes within protocol prefixes to bypass blocklists.

```typescript
function sanitizeUrl(url: string): string {
  // Strip control characters that browsers may ignore in protocol parsing
  const cleaned = url.replace(/[\x00-\x1f\x7f]/g, "").trim();
  // If it has a protocol prefix, only allow known-safe ones
  if (/^[a-z]+:/i.test(cleaned) && !/^https?:|^mailto:|^tel:/i.test(cleaned)) {
    return "#";
  }
  return url;
}
```

Applied to both render points:

- `<a href={sanitizeUrl(match[4])}>`
- `<img src={sanitizeUrl(match[2])}>`

### Files Changed

- `client/src/components/blog/MarkdownRenderer.tsx` — add `sanitizeUrl()`, apply to `<a>` and `<img>`

### Testing

**Automated tests** (`client/src/components/blog/sanitizeUrl.test.ts` using Vitest):

- `https://example.com` → passes through unchanged
- `http://example.com` → passes through unchanged
- `/relative/path` → passes through unchanged
- `#anchor` → passes through unchanged
- `mailto:test@example.com` → passes through unchanged
- `tel:+1234567890` → passes through unchanged
- `javascript:alert(1)` → returns `#`
- `JAVASCRIPT:alert(1)` → returns `#` (case insensitive)
- `java\tscript:alert(1)` → returns `#` (control char stripped)
- `data:text/html,<script>alert(1)</script>` → returns `#`
- `vbscript:alert(1)` → returns `#`
- `  javascript:alert(1)  ` → returns `#` (whitespace trimmed)

**Manual tests:**

- Create blog post with `[click me](javascript:alert(1))` — should render as `<a href="#">`
- Create blog post with `![img](data:text/html,<script>alert(1)</script>)` — should render as `<img src="#">`

---

## 2. UX: Sequential CTA Cascade

### Problem

On mobile, up to 4 overlay elements compete simultaneously:

| Element               | Position            | z-index | Appears                    |
| --------------------- | ------------------- | ------- | -------------------------- |
| CookieConsent         | bottom bar          | 50      | immediately on first visit |
| StickyBookBar         | bottom bar (mobile) | 9998    | after 600px scroll         |
| FloatingActionButtons | bottom-right        | 9999    | always visible             |
| NewsletterPopup       | modal overlay       | 9999    | after 15s                  |

CookieConsent and StickyBookBar literally overlap at the bottom of mobile screens. All 4 can be visible at once after 15 seconds of scrolling.

### Solution: Sequential Cascade

**Principle:** At most 2 overlay elements visible at any time on mobile.

**Communication mechanism:** `CookieConsent` dispatches a custom `cookie-consent-changed` event when the user accepts. Other components listen for this event instead of polling localStorage. This gives instant reactivity with zero polling overhead.

#### 2a. CookieConsent dispatches custom event

**File:** `client/src/components/CookieConsent.tsx`

- In `handleAccept()`, after setting localStorage, dispatch custom event
- Change z-index from `z-50` to `z-[9997]`

```typescript
const handleAccept = () => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  } catch {}
  window.dispatchEvent(new Event("cookie-consent-changed"));
  setVisible(false);
};
```

#### 2b. CookieConsent gates StickyBookBar

**File:** `client/src/components/StickyBookBar.tsx`

- Read `localStorage` on mount for initial state
- Listen for `cookie-consent-changed` custom event for instant updates
- Only show when consent given AND scroll > 600px

```typescript
const [consentGiven, setConsentGiven] = useState(
  () => !!localStorage.getItem("cookie-consent-accepted")
);

useEffect(() => {
  const onConsent = () => setConsentGiven(true);
  window.addEventListener("cookie-consent-changed", onConsent);
  return () => window.removeEventListener("cookie-consent-changed", onConsent);
}, []);

// Only show when: consent given AND scrolled past threshold
const shouldShow = visible && consentGiven;
```

#### 2c. FloatingActionButtons hides on mobile when StickyBookBar is visible

**File:** `client/src/components/FloatingActionButtons.tsx`

- Add scroll listener (same 600px threshold as StickyBookBar)
- Add media query check for mobile (`< 768px`)
- Listen for `cookie-consent-changed` for instant consent detection
- When all conditions true: hide floating buttons on mobile

**Note:** `StickyBookBar` is only rendered on the Home page. On other pages, `consentGiven && scrolled` may be true but `FloatingActionButtons` hiding is still correct UX — on non-Home pages there's no StickyBookBar to replace them, so we should scope the hide behavior to only apply when the current route is `/`. Check `useLocation()` (already imported) to gate this.

```typescript
const [consentGiven, setConsentGiven] = useState(
  () => !!localStorage.getItem("cookie-consent-accepted")
);
const [scrolledPast, setScrolledPast] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const onConsent = () => setConsentGiven(true);
  window.addEventListener("cookie-consent-changed", onConsent);
  return () => window.removeEventListener("cookie-consent-changed", onConsent);
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

// Only hide on mobile + home page + when StickyBookBar would be visible
const isHomePage = location === "/";
const hideOnMobile = isMobile && scrolledPast && consentGiven && isHomePage;
```

If `hideOnMobile` is true, return `null` (don't render).

#### 2d. NewsletterPopup gating

**File:** `client/src/components/NewsletterPopup.tsx`

Changes:

1. Increase `SHOW_DELAY_MS` from `15_000` to `30_000`
2. Add consent gate: only show if `cookie-consent-accepted` exists in localStorage
3. Add page view gate: only show if user has viewed 2+ pages in this session

**File:** `client/src/App.tsx` (page view counter)

The page view counter must be incremented globally (in `Router` or `ScrollToTop`) since `NewsletterPopup` only renders on the Home page. Add to `ScrollToTop`:

```typescript
function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Track page views for newsletter popup gating
    const views = Number(sessionStorage.getItem("wiro_page_views") || "0") + 1;
    sessionStorage.setItem("wiro_page_views", String(views));
  }, [location]);
  return null;
}
```

Newsletter popup changes:

```typescript
const SHOW_DELAY_MS = 30_000; // 30 seconds (was 15)

useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && Date.now() < Number(stored)) return;

  // Gate: cookie consent must be accepted
  if (!localStorage.getItem("cookie-consent-accepted")) return;

  // Gate: must have viewed 2+ pages
  const views = Number(sessionStorage.getItem("wiro_page_views") || "0");
  if (views < 2) return;

  const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
  return () => clearTimeout(timer);
}, []);
```

#### 2e. z-index cleanup

Existing z-index landscape (found in codebase):

| Element         | Current z-index | Location                  |
| --------------- | --------------- | ------------------------- |
| ScrollProgress  | 10001           | ScrollProgress.tsx:25     |
| Header menu btn | 10001           | Header.tsx:188            |
| Header          | 10000           | Header.tsx (varies)       |
| FloatingActions | 9999            | FloatingActionButtons.tsx |
| StickyBookBar   | 9998            | StickyBookBar.tsx         |
| CookieConsent   | 50              | CookieConsent.tsx         |
| NewsletterPopup | 9998/9999       | NewsletterPopup.tsx       |

**New z-index scheme** (no conflicts with Header/ScrollProgress):

| Element                  | New z-index | Rationale                                   |
| ------------------------ | ----------- | ------------------------------------------- |
| CookieConsent            | 9997        | Below StickyBookBar (safety, won't overlap) |
| StickyBookBar            | 9998        | Unchanged                                   |
| FloatingActionButtons    | 9999        | Unchanged                                   |
| Header                   | 10000       | Unchanged                                   |
| ScrollProgress           | 10001       | Unchanged                                   |
| Header menu btn          | 10001       | Unchanged                                   |
| NewsletterPopup backdrop | 10002       | Above all navigation                        |
| NewsletterPopup dialog   | 10003       | Top of everything                           |

### Resulting UX Timeline (Mobile First Visit)

1. **0s** — Page loads. CookieConsent appears at bottom. No StickyBookBar, no newsletter.
2. **User scrolls** — FloatingActionButtons visible at bottom-right (no conflict with cookie bar — different position).
3. **User accepts cookies** — CookieConsent gone (instantly via custom event). StickyBookBar can now appear on scroll. FloatingActionButtons hide on mobile homepage (StickyBookBar takes over "Book Now" CTA role).
4. **User navigates to page 2, waits 30s** — NewsletterPopup modal appears with backdrop (all other elements behind it).

**Max simultaneous overlays:** 2 (CookieConsent + FloatingButtons before consent, or StickyBookBar + NewsletterPopup after).

### Files Changed

| File                        | Change                                                          |
| --------------------------- | --------------------------------------------------------------- |
| `MarkdownRenderer.tsx`      | Add allowlist-based `sanitizeUrl()`, apply to `<a>` and `<img>` |
| `CookieConsent.tsx`         | z-index 50 → 9997, dispatch `cookie-consent-changed` event      |
| `StickyBookBar.tsx`         | Add consent gate via custom event listener                      |
| `FloatingActionButtons.tsx` | Hide on mobile homepage when StickyBookBar visible              |
| `NewsletterPopup.tsx`       | 30s delay, consent gate, page view gate, z-index 10002/10003    |
| `App.tsx`                   | Page view counter in `ScrollToTop`                              |
| `sanitizeUrl.test.ts`       | Automated unit tests for URL sanitization (12 cases)            |

### Testing

- Clear localStorage + sessionStorage, visit site on mobile viewport (375px)
- Verify: only CookieConsent + FloatingButtons visible initially
- Accept cookies: StickyBookBar appears on scroll, FloatingButtons hide on mobile
- Navigate to second page, wait 30s: NewsletterPopup appears
- On desktop (>768px): FloatingButtons stay visible alongside StickyBookBar (no overlap — StickyBookBar at top, FloatingButtons at bottom-right)
- On non-Home pages: FloatingButtons always visible (StickyBookBar not rendered)
- Run `pnpm test` — sanitizeUrl tests pass

---

## Out of Scope

- Performance improvements (GSAP removal, font optimization) — separate spec
- Urgency/scarcity indicators on tour cards — separate spec
- SSR/prerendering for SEO — separate spec
