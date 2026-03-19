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

Add a `sanitizeUrl()` function at the top of `MarkdownRenderer.tsx`:

```typescript
function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "#";
  }
  return url;
}
```

Apply to both render points:

- `<a href={sanitizeUrl(match[4])}>`
- `<img src={sanitizeUrl(match[2])}>`

### Files Changed

- `client/src/components/blog/MarkdownRenderer.tsx` — add `sanitizeUrl()`, apply to `<a>` and `<img>`

### Testing

- Manual: create blog post with `[click me](javascript:alert(1))` — should render as `<a href="#">`
- Manual: create blog post with `![img](data:text/html,<script>alert(1)</script>)` — should render as `<img src="#">`

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

#### 2a. CookieConsent gates StickyBookBar

**File:** `client/src/components/StickyBookBar.tsx`

- Read `localStorage.getItem("cookie-consent-accepted")` on mount
- Listen for storage changes (in case consent is accepted while sticky bar component is mounted)
- Only allow visibility when consent has been accepted AND scroll > 600px

```typescript
const [consentGiven, setConsentGiven] = useState(
  () => !!localStorage.getItem("cookie-consent-accepted")
);

// Listen for consent changes within same tab
useEffect(() => {
  const check = () =>
    setConsentGiven(!!localStorage.getItem("cookie-consent-accepted"));
  window.addEventListener("storage", check);
  // Also poll briefly since storage event doesn't fire in same tab
  const interval = setInterval(check, 1000);
  return () => {
    window.removeEventListener("storage", check);
    clearInterval(interval);
  };
}, []);

// Only show when: consent given AND scrolled past threshold
const shouldShow = visible && consentGiven;
```

#### 2b. FloatingActionButtons hides on mobile when StickyBookBar is visible

**File:** `client/src/components/FloatingActionButtons.tsx`

- Add scroll listener (same 600px threshold as StickyBookBar)
- Add media query check for mobile (`< 768px`)
- When both conditions true AND cookie consent accepted: hide floating buttons

```typescript
const [stickyBarVisible, setStickyBarVisible] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

useEffect(() => {
  const handleScroll = () => {
    const consentGiven = !!localStorage.getItem("cookie-consent-accepted");
    setStickyBarVisible(window.scrollY > 600 && consentGiven);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const hideOnMobile = isMobile && stickyBarVisible;
```

If `hideOnMobile` is true, return `null` (don't render).

#### 2c. NewsletterPopup gating

**File:** `client/src/components/NewsletterPopup.tsx`

Changes:

1. Increase `SHOW_DELAY_MS` from `15_000` to `30_000`
2. Add consent gate: only show if `cookie-consent-accepted` exists in localStorage
3. Add page view gate: only show if user has viewed 2+ pages in this session

```typescript
const SHOW_DELAY_MS = 30_000; // 30 seconds (was 15)

useEffect(() => {
  // Increment page view count
  const views = Number(sessionStorage.getItem("wiro_page_views") || "0") + 1;
  sessionStorage.setItem("wiro_page_views", String(views));
}, []);

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

#### 2d. z-index cleanup

**File:** `client/src/components/CookieConsent.tsx`

- Change `z-50` class to `z-[9997]` so CookieConsent appears above StickyBookBar (9998 won't render while consent is pending, but as a safety net)

**File:** `client/src/components/NewsletterPopup.tsx`

- Change backdrop from `z-[9998]` to `z-[10000]`
- Change popup from `z-[9999]` to `z-[10001]`

### Resulting UX Timeline (Mobile First Visit)

1. **0s** — Page loads. CookieConsent appears at bottom. No StickyBookBar, no newsletter.
2. **User scrolls** — FloatingActionButtons visible at bottom-right (no conflict with cookie bar — different position).
3. **User accepts cookies** — CookieConsent disappears. StickyBookBar can now appear on scroll. FloatingActionButtons hide on mobile (StickyBookBar takes over the "Book Now" CTA role).
4. **User navigates to page 2, waits 30s** — NewsletterPopup modal appears with backdrop (all other elements behind it).

**Max simultaneous overlays:** 2 (CookieConsent + FloatingButtons before consent, or StickyBookBar + NewsletterPopup after).

### Files Changed

| File                        | Change                                                |
| --------------------------- | ----------------------------------------------------- |
| `StickyBookBar.tsx`         | Add consent gate, poll for consent changes            |
| `FloatingActionButtons.tsx` | Hide on mobile when StickyBookBar visible             |
| `NewsletterPopup.tsx`       | 30s delay, consent gate, page view gate, z-index bump |
| `CookieConsent.tsx`         | z-index from 50 to 9997                               |

### Testing

- Clear localStorage, visit site on mobile viewport
- Verify: only CookieConsent + FloatingButtons visible initially
- Accept cookies, scroll down: StickyBookBar appears, FloatingButtons hide
- Navigate to second page, wait 30s: NewsletterPopup appears
- On desktop (>768px): FloatingButtons stay visible alongside StickyBookBar (no overlap since StickyBookBar is at top)

---

## Out of Scope

- Performance improvements (GSAP removal, font optimization) — separate spec
- Urgency/scarcity indicators on tour cards — separate spec
- SSR/prerendering for SEO — separate spec
