# WIRO Cinematic Hero Banner Design

**Date:** 2026-07-31

**Status:** Approved for implementation planning

## Summary

Turn the homepage's static hero photograph into a cinematic sequence made from
three existing WIRO photographs. The sequence balances quiet anticipation
with real off-road energy while preserving the hero's current conversion copy,
Hebrew support, WhatsApp tracking, route CTA, and accessibility.

The selected direction is **B — Cinematic sequence**:

1. A golden Chiang Mai landscape establishes place and calm.
2. Travelers with the WIRO vehicle make the experience personal.
3. A 4x4 water crossing delivers a controlled burst of action.

This is a still-image treatment, not a video banner. Motion comes from restrained
pan-and-zoom animation and soft cross-dissolves.

## Goals

- Make the first viewport feel like the beginning of a short WIRO film.
- Blend quiet, premium travel atmosphere with authentic off-road action.
- Preserve the hero's current booking hierarchy and bilingual content.
- Keep the experience fast enough for mobile visitors and resilient on slow
  connections.
- Respect reduced-motion preferences and avoid announcing decorative scene
  changes to assistive technology.

## Non-goals

- Do not rewrite the hero headline, supporting copy, CTAs, or WhatsApp message.
- Do not add video, audio, carousel controls, pagination dots, or swipe behavior.
- Do not redesign the header or any section below the hero.
- Do not add a carousel or animation dependency.
- Do not generate or replace the underlying WIRO photography.

## Approved Visual Story

The sequence is a seamless 15-second loop:

| Time | Scene | Feeling | Motion |
| --- | --- | --- | --- |
| 0–5 seconds | Golden Chiang Mai landscape | Quiet anticipation | Slow push-in with a slight lateral drift |
| 5–10 seconds | Travelers with WIRO vehicle | Human warmth and trust | Gentle pan that keeps the group and vehicle readable |
| 10–15 seconds | 4x4 water crossing | Controlled off-road energy | Slightly stronger push toward the vehicle and water |

Adjacent scenes overlap with a 1.0-second soft cross-dissolve. Image scale
remains restrained, from `1.02` to `1.08`, so the motion
feels photographic rather than like an automated slideshow.

A subtle film-grain texture and consistent dark color treatment sit above
the photographs. The existing bottom-heavy contrast gradient remains above the
sequence and below the hero content. Grain must be lightweight CSS or an inline
texture and must not introduce another downloaded image.

## Composition and Content

The sequence fills the existing `100svh` hero area and uses responsive
`object-position` values per scene so the important subject remains visible at
mobile and desktop widths.

The hero content remains stationary while the images move behind it:

- WIRO location eyebrow
- Existing English and Hebrew headline
- Existing supporting paragraph
- WhatsApp availability CTA and attribution source codes
- Route ideas CTA
- Personal-response trust note
- Desktop scroll cue

No image-specific caption appears. The three photographs function as one
background story, not three content slides.

## Component Design

Create a focused `CinematicHeroBackground` component and render it inside the
existing `Hero` component.

### `CinematicHeroBackground`

Responsibilities:

- Own the ordered scene definitions.
- Render the permanent group-photo layer plus the animated landscape and action
  overlays. The permanent layer is both the middle scene and the fallback, so
  the group photo is not duplicated in the DOM.
- Apply scene-specific positioning and animation classes.
- Mark decorative animated layers so assistive technology ignores them.
- Expose no controls and own no booking or language logic.

Dependencies:

- The existing `OptimizedImage` component.
- CSS keyframes in the global stylesheet or a colocated stylesheet following the
  repository's current styling pattern.

### `Hero`

Responsibilities remain unchanged:

- Localized booking copy.
- WhatsApp message construction and attribution.
- CTA behavior.
- Route scrolling and the scroll cue.

This boundary keeps cinematic presentation separate from conversion behavior.

## Image Loading and Data Flow

Scene configuration is static and local; there is no API or runtime content
request.

1. `Hero` renders `CinematicHeroBackground`.
2. The component renders the current WIRO group photo as the permanent middle
   scene and fallback.
3. The opening landscape receives high fetch priority.
4. The group and action scenes load immediately afterward through responsive
   image markup.
5. CSS controls opacity and transform across the 15-second loop.

Generate `sm`, `md`, and `lg` WebP/JPEG variants for only the three selected hero
assets. Do not run or commit an unrelated repository-wide image rewrite.

Performance budgets:

- Mobile, all three WebP scenes combined: target at or below 250 KB.
- Desktop, all three WebP scenes combined: target at or below 600 KB.
- No new JavaScript dependency or timer.
- No layout shift; every layer has intrinsic dimensions and fills the established
  hero box.

## Failure Handling

- The existing WIRO group photograph remains underneath the animated layers.
- If an animated scene exhausts `OptimizedImage`'s fallback chain, that layer
  disappears and the permanent layer remains visible.
- If every image fails, the hero's existing solid primary background and
  contrast gradient keep all copy and actions readable.
- An unavailable later scene must not interrupt the animation loop or CTA
  behavior.

## Accessibility

- The permanent WIRO image keeps the current localized descriptive alt text.
- Animated overlay images use empty alt text and `aria-hidden="true"` to avoid
  repeated announcements.
- With `prefers-reduced-motion: reduce`, all sequence animation stops and the
  existing WIRO group banner is shown as the single static hero image.
- The existing heading order, CTA labels, focus styles, touch targets, and
  keyboard behavior remain unchanged.
- The overlay must preserve text contrast in every scene.
- Hebrew RTL rendering must retain the current logical start alignment and CTA
  order.

## Responsive Behavior

- Desktop uses wider crops that preserve landscape context.
- Mobile prioritizes the vehicle, people, and water-crossing subject over
  peripheral scenery.
- Use scene-specific `object-position` values at mobile and desktop breakpoints.
- Keep the current hero copy width and bottom alignment unchanged. If visual
  verification finds a collision with a photographed subject, adjust that
  scene's `object-position` rather than the content layout.
- No breakpoint changes the scene order or timing.

## Verification

Automated checks:

- TypeScript and production build pass.
- Existing homepage and language end-to-end tests pass.
- Add a focused test that confirms the three scene assets and permanent fallback
  render without changing the current hero CTAs.
- Confirm responsive variants return successfully without avoidable 404 fallback
  requests.

Manual visual checks:

- Watch at least two complete loops on desktop and mobile.
- Verify each cross-dissolve has no flash, blank frame, or visible image jump.
- Check text contrast during the brightest landscape and water scenes.
- Check that important subjects are not cropped out at common phone widths.
- Verify Hebrew RTL, reduced motion, and simulated failed overlay images.
- Confirm the motion reads as a quiet-to-action miniature story rather than an
  autoplay carousel.

## Expected Files

- `client/src/components/Hero.tsx` — render the cinematic background while
  preserving conversion logic.
- `client/src/components/CinematicHeroBackground.tsx` — new presentation-only
  component.
- `client/src/index.css` — sequence, dissolve, grain, and reduced-motion styles.
- `client/public/images/optimized/` — responsive variants for the selected
  landscape, group, and water-crossing images only.
- A focused `CinematicHeroBackground` component test plus the existing homepage
  and language end-to-end tests.
