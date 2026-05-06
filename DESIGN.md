---
name: WIRO 4×4
description: The only kosher off-road 4×4 tour company in Chiang Mai — private jungle adventures with Hebrew-speaking guides
colors:
  charcoal: "#1c1c1c"
  charcoal-body: "#2c2c2c"
  parchment: "#faf7f2"
  cream: "#fdfbf7"
  teak-dust: "#e8e2da"
  river-silt: "#6b6560"
  temple-gold: "#d4af37"
  temple-gold-cta: "#b8960f"
  temple-gold-cta-hover: "#a3850e"
  crimson: "#b91c1c"
typography:
  display:
    fontFamily: '"DM Serif Display", "Playfair Display", Georgia, serif'
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: '"DM Serif Display", "Playfair Display", Georgia, serif'
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: '"Source Sans 3", sans-serif'
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.25em"
rounded:
  sharp: "0px"
  subtle: "2px"
  base: "4px"
  card: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-ghost-gold:
    backgroundColor: "transparent"
    textColor: "{colors.temple-gold}"
    rounded: "{rounded.sharp}"
    padding: "8px 24px"
  button-ghost-gold-hover:
    backgroundColor: "{colors.temple-gold}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sharp}"
    padding: "8px 24px"
  button-cta:
    backgroundColor: "{colors.temple-gold-cta}"
    textColor: "#ffffff"
    rounded: "{rounded.sharp}"
    padding: "12px 40px"
  button-cta-hover:
    backgroundColor: "{colors.temple-gold-cta-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.sharp}"
    padding: "12px 40px"
  button-hero-primary:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.sharp}"
    padding: "8px 40px"
  input-default:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.charcoal-body}"
    rounded: "{rounded.base}"
    padding: "8px 12px"
  chip-attribute:
    backgroundColor: "{colors.temple-gold}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sharp}"
    padding: "4px 12px"
---

# Design System: WIRO 4×4

## 1. Overview

**Creative North Star: "The Expedition Dossier"**

This is a well-worn travel document that proves real experience happened. DM Serif Display headlines cut sharp against parchment-toned backgrounds. Temple Gold appears as printed ink — the stamp on a field envelope, the underline in a handwritten note, the ruled margin in a jungle notebook. Photography is primary documentation, not decoration. Every screen should feel like a page you'd find tucked inside a guide's kit bag, not a brochure you'd pick up in a hotel lobby.

The system rejects the logistics-heavy corporate aesthetic of Thailand Kosher, Kesher Tours, and Koco Travel — travel agency layouts with group-bus-tour energy, dense itinerary tables, and "traditional Jewish vacation" positioning. It equally rejects generic adventure tourism with stock photography and countdown timers, budget backpacker neon-and-clutter, and the cold distance of sterile luxury hotel design.

Density is intentional. The site breathes. Whitespace is the jungle clearing between dense canopy sections.

**Key Characteristics:**

- Warm parchment surfaces (`#faf7f2`, `#fdfbf7`) — never clinical white
- Near-zero corner radius (`0px`) on action elements: printed, not rounded
- Temple Gold used at trace-element concentration — dividers, borders, underlines, focus rings
- DM Serif Display at confident scale; contrast with Source Sans 3's open warmth
- Uppercase tracking labels as structural document markers
- Bilingual Hebrew/English as a first-class constraint, not an afterthought

## 2. Colors: The Field Palette

Drawn from the Chiang Mai environment: deep shadow-canopy charcoal, warm parchment aged in tropical humidity, gold that reads like monsoon-season brass on aged metal.

### Primary

- **Chiang Mai Night** (`#1c1c1c`): Primary action surfaces, text headings, nav on scroll, filled button variant. The system's anchoring dark tone — warm charcoal, not cold black.
- **Trail Dark** (`#2c2c2c`): Body copy and foreground text. Fractionally lifted from full black to read warmly on parchment backgrounds.

### Secondary

- **Temple Gold** (`#d4af37`): Dividers, borders, focus rings, underline animations, eyebrow text, attribute chip tints, ring accents. Used sparingly — a trace element. OKLCH canonical: `oklch(75% 0.14 85)`.
- **Monsoon Honey** (`#b8960f`): The only surface where gold fills a large area — the CTA button background, chosen for WCAG AA contrast against white text. Darker than Temple Gold by design.
- **Deep Amber** (`#a3850e`): Hover state of the CTA button. Slightly deeper to confirm engagement without a color change large enough to surprise.

### Neutral

- **Rice Paper** (`#faf7f2`): Page background. Warm ivory. Never substituted with `#ffffff`.
- **Field Notes Cream** (`#fdfbf7`): Card surfaces. One tone above the page background — tonal layering replaces shadows at rest.
- **Teak Dust** (`#e8e2da`): Borders, input backgrounds, muted section surfaces, divider lines.
- **River Silt** (`#6b6560`): Secondary text, metadata, placeholder copy, muted labels.
- **Crimson** (`#b91c1c`): Destructive actions and form error states only. Never decorative.

**The Restraint Rule.** Temple Gold appears on ≤10% of any given screen surface. A gold element draws the eye because everything around it is not gold. Filling backgrounds, cards, or non-CTA buttons with gold destroys the signal entirely.

**The Warm Surface Rule.** Every background surface must carry warmth. Rice Paper for pages. Field Notes Cream for cards. Teak Dust for borders. Pure white (`#ffffff`) is prohibited on surfaces — it breaks the dossier illusion.

## 3. Typography

**Display Font:** DM Serif Display (with Playfair Display, Georgia, serif as fallback)
**Body Font:** Source Sans 3 (sans-serif)
**Hebrew Fonts:** Heebo (body), Rubik (headings) — used whenever `[lang="he"]` or `.rtl` is applied

**Character:** A studied pairing of authority and readability. DM Serif Display carries the weight of old cartography — confident, slightly editorial, unhurried. Source Sans 3 provides clear, open counters for extended reading. The combination reads as "knowledgeable guide's personal notes," not "corporate brochure." Hebrew content uses Heebo and Rubik, which share the same warm, open register without mimicking the Latin aesthetic.

### Hierarchy

- **Display** (400, `clamp(1.875rem, 5vw, 3rem)`, line-height 1.15): Hero headlines, the single defining statement of a page. DM Serif Display. Never in Source Sans.
- **Headline** (400, `clamp(1.5rem, 3.5vw, 2.25rem)`, line-height 1.2): Section headers, tour names, blog titles. DM Serif Display.
- **Title** (600, 1.125rem, line-height 1.4): Card titles, subsection labels. Source Sans 3.
- **Body** (400, 1rem, line-height 1.625): Running prose. Source Sans 3. Line length capped at 65–75ch.
- **Label** (600, 0.75rem, letter-spacing 0.25em, uppercase): Eyebrows, trust badges, navigation, attribute tags. Source Sans 3. Always tracked and uppercased.

**The Eyebrow Rule.** Every major section opens with a label-weight uppercase tracker in Temple Gold before the DM Serif Display headline. The sequence — gold eyebrow → serif headline → 64px gold rule — is the structural fingerprint of this system. It reads like a typed section header on a field report. New sections that skip the eyebrow lose their chapter identity.

**The Type-Mixing Rule.** DM Serif Display is for headings. Source Sans 3 is for everything else. Never set body copy in DM Serif Display, and never set a headline in Source Sans without intent and context. Hebrew headings use Rubik (semi-bold); Hebrew body uses Heebo.

## 4. Elevation

The system is near-flat by default. Depth is expressed primarily through tonal layering — Rice Paper page, Field Notes Cream cards, Teak Dust borders — rather than shadows. Shadows appear only as responses to state (hover, overlay, elevation) or to separate floating surfaces from the page.

### Shadow Vocabulary

- **Ambient** (`0 10px 40px rgba(28, 28, 28, 0.08)`): Very diffuse lift. Used on cards that require visual separation from the page when tonal layering alone is insufficient. Rare.
- **Hover Lift** (`0 20px 60px rgba(28, 28, 28, 0.12)`): Applied on card hover — communicates that the element is responding to attention.
- **Luxury Frame** (`0 24px 48px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(212, 175, 55, 0.15)`): Tour cards on hover only. The second layer — a 1px gold ring — arrives with the shadow, framing the card like a loupe around a field photograph. Use only on tour cards.

**The Flat-By-Default Rule.** A surface at rest is flat. The shadow is a state — hover, focus, overlay — not a decorative property. A card with a shadow at rest and a stronger shadow on hover has lost the signal. Tonal layering (background color difference) handles rest-state depth.

## 5. Components

### Buttons

Sharp, tracked, uppercase. Every button reads like a stamped instruction on a field kit.

- **Shape:** `0px` radius (`rounded-sm`). Near-square corners reinforce the dossier aesthetic. Softer radii are wrong here.
- **Typography:** `text-sm font-medium tracking-[0.1em] uppercase` on all variants. No exceptions.
- **Ghost Gold (default):** Transparent fill, `border-2 border-accent text-accent`. On hover: `bg-accent text-charcoal`. Standard navigation CTAs and secondary actions.
- **Filled CTA (`secondary`):** `bg-accent-cta text-white` (`#b8960f`). The primary conversion action — "Book", "Inquire", "WhatsApp". On hover: `#a3850e`. One per section maximum.
- **Hero Primary:** `border-2 border-accent text-white` on dark overlay. On hover: `bg-accent text-charcoal`.
- **Hero Secondary:** `border border-white/60 text-white`. On hover: `bg-white text-primary`.

### Chips / Attribute Tags

Document annotations, not navigation.

- **Style:** `bg-accent/10 text-accent rounded-sm px-3 py-1 text-xs` — soft gold tint background, near-square corner, small tracking.
- Used for tour attributes: Kosher, Private, Shabbat Friendly, Hebrew Guide. Never used as navigation or filter pills in new components.

### Cards / Containers

- **Tour Cards — Corner Style:** `0px` radius (`rounded-sm`). Intentional. Printed-document edges.
- **Default UI Cards:** `rounded-xl` (8px) for booking forms, admin surfaces, dialog content — softer to reduce friction in transactional contexts.
- **Background:** Field Notes Cream (`#fdfbf7`). One tone above the page.
- **Shadow at Rest:** None. Tonal layering handles rest-state separation.
- **Shadow on Hover:** Luxury Frame — `translateY(-6px)` + `0 24px 48px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(212,175,55,0.15)`. The gold ring and the depth arrive together.
- **Border at Rest:** `1px solid teak-dust (#e8e2da)`. Full perimeter — no partial borders.
- **Internal Padding:** `24px` vertical and horizontal.

### Inputs / Fields

- **Style:** `border border-teak-dust bg-parchment rounded-base (4px)`. Slightly softer than buttons — inputs are receptive, not assertive.
- **Focus:** `outline: 2px solid #d4af37 outline-offset: 2px` — gold ring. Consistent with the full accent system.
- **Transition:** `border-color 0.2s ease, box-shadow 0.2s ease`.
- **Error:** `border-crimson` + `ring-crimson/20` with `role="alert"` on the error message element.
- **Disabled:** `opacity-50 pointer-events-none`.

### Navigation

- **Transparent state (hero):** No background. White text. Logo at full height (`h-36` on desktop, `h-32` on tablet, `h-16` on mobile).
- **Scrolled state:** `bg-background/95 backdrop-blur-md` (parchment at 95% opacity, 12px blur) + `border-b border-accent/20` (subtle gold bottom rule).
- **Logo transition:** Scales from full height to `h-14` on scroll. `transition-all duration-300`.
- **Nav links:** `text-sm font-medium tracking-[0.1em] uppercase`. Gold underline expands from center on hover: `::after` pseudo-element, `width: 0 → 100%`, `left: 50% → 0`, `height: 1px`, `background: temple-gold`, `transition: width 0.3s ease, left 0.3s ease`.
- **Active link:** Full-width gold underline at rest.
- **Mobile:** Full-height drawer. Warm background (`bg-background`). Same typography as desktop nav.

### Gold Divider (Signature Component)

The primary structural element of this design system. Appears after every major section eyebrow.

- **Default (centered):** `display: block; height: 1px; width: 64px; background: #d4af37; margin: 0 auto`.
- **Inline accent (hero subheading):** `position: absolute; bottom: -12px; left: 0; height: 2px; width: 56px; background: #d4af37`. Used as a trailing mark at the end of hero subheadings.
- Never used as a full-width horizontal rule. Its brevity is the point — a stamp, not a wall.

## 6. Do's and Don'ts

### Do:

- **Do** use Temple Gold exclusively for borders, dividers, underlines, focus rings, and the single filled CTA button background (Monsoon Honey). The ratio on any screen must stay below 10%.
- **Do** use `0px` radius (`rounded-sm`) on tour cards, buttons, and attribute chips. The sharp corner is intentional — it signals printed, not digital.
- **Do** open every major section with a label-weight uppercase eyebrow in Temple Gold, followed by a DM Serif Display headline, followed by a 64px centered gold divider. This three-part sequence is the structural fingerprint of the system.
- **Do** load all Hebrew content with `[lang="he"]` or `.rtl`, Heebo/Rubik fonts, and `dir="rtl"`. Bilingual is a first-class contract, not a translation layer.
- **Do** apply the Luxury Frame shadow (`0 24px 48px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(212,175,55,0.15)`) only on tour cards and only on hover. Its gold ring is a surprise — preserve that.
- **Do** register every new animation with the `prefers-reduced-motion` kill switch already in `index.css`. The full reset is there — new animations belong inside it.
- **Do** keep all body copy on a background of Rice Paper (`#faf7f2`) or Field Notes Cream (`#fdfbf7`). Warm surfaces only.

### Don't:

- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on any card, list item, callout, or alert. The tour card's current `border-l-4 border-accent` pattern is **prohibited** — it already exists in the codebase and must not spread. Replace with a full border, background tint, or leading icon.
- **Don't** use gradient text via `background-clip: text`. The `.wiro-gold-shimmer` and `.gold-shimmer` utilities are **prohibited** for new components. These utilities exist in `index.css` and must not be applied in new work. Use solid `color: #d4af37` instead.
- **Don't** use pure white (`#ffffff`) as any background surface. Rice Paper is the minimum warmth. Clinical white breaks the dossier character entirely.
- **Don't** design new pages to look like Thailand Kosher, Kesher Tours, or Koco Travel. The failure mode is: logistics-heavy, corporate tone, group-bus-tour visual hierarchy, "traditional Jewish vacation" positioning. If it looks like a travel agency, it has failed.
- **Don't** use countdown timers, "X spots left" urgency badges, or stock photography of anonymous tourists. Specificity — real trail names, real guide faces, real coordinates — is the only trust signal this brand uses.
- **Don't** fill any large surface — card background, section background, hero overlay — with Temple Gold or Monsoon Honey. Gold is a trace element. The moment it fills a surface, its signal collapses.
- **Don't** apply a drop shadow to any surface at rest. Shadows are earned by state change. A static card with a visible shadow is over-decorated.
- **Don't** ship a new page section without Hebrew copy equivalents. The bilingual contract is non-negotiable. English-only sections do not exist in this product.
