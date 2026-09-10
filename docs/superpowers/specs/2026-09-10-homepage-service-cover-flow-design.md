# Homepage Service Cover Flow Design

**Date:** 2026-09-10

**Status:** Approved for implementation

## Outcome

Redesign only the homepage `ServiceBanners` carousel as a cinematic cover flow. Preserve the five existing WIRO services, their photographs, bilingual copy, detail dialogs, destination links, semantics, and the rest of the homepage.

## Selected Approach

Keep the existing Embla Carousel integration and add a focused visual-state layer driven by Embla's selected slide. This avoids another carousel dependency while retaining mature drag, swipe, snap, and keyboard behavior.

Alternatives rejected:

- A custom CSS scroll-snap implementation would reduce JavaScript but weaken selected-state control, looping, and keyboard behavior.
- Swiper's cover-flow effect would deliver the visual quickly but add a dependency for behavior the existing Embla foundation already supports.

## Visual System

The carousel should feel like a collection of expedition films rather than a row of product cards.

- The active journey is centered, fully visible, sharp, and brighter than its neighbors.
- Desktop uses a wide cinematic crop and a restrained shadow below the active image.
- Adjacent journeys remain partially visible, scale to approximately `0.86`, rotate around the Y axis by approximately 18 degrees, darken slightly, and sit behind the active journey.
- More distant journeys recede further and do not compete with the selected title.
- Existing WIRO green, warm ivory, expedition gold, Source Sans 3, DM Serif Display, Hebrew fonts, and square-edged geometry remain unchanged.
- Text stays directly over the image with a bottom-heavy dark gradient. No glass card or opaque text box is introduced.

## Responsive Behavior

Mobile is a distinct composition rather than a reduced desktop effect.

- At 375 to 430 pixels, the active card occupies approximately 84 percent of the viewport.
- The preceding and following cards remain visible at both edges as a swipe cue.
- Mobile cards use a taller crop and only a small 3D rotation so titles stay readable.
- At tablet widths, the active card widens and transitions toward a 3:2 crop.
- At desktop widths, the active card uses a cinematic 16:9 crop with deeper perspective.
- The carousel viewport clips its own transformed slides and must never increase the page's horizontal scroll width.

## Interaction Model

- Dragging or swiping selects the nearest journey through Embla's existing momentum and snap behavior.
- Previous and next buttons select one journey at a time.
- Arrow keys follow the page direction in English and Hebrew.
- Selecting a side journey centers it without opening its detail dialog.
- Selecting the already-active journey opens its existing detail dialog.
- Pagination represents all five journeys and exposes the selected state through `aria-current`.
- The current carousel does not autoplay, so autoplay is not added.

Transitions last approximately 600 milliseconds and use `cubic-bezier(0.22, 1, 0.36, 1)`. Only transform, opacity, and filter animate. Rapid input must interrupt cleanly without bounce.

## Accessibility

- Preserve semantic region, slide group, button, dialog, and heading structures.
- Keep meaningful localized image alternative text.
- Maintain 44-pixel minimum arrow and pagination targets.
- Keep visible keyboard focus indicators.
- Announce the selected slide position with an unobtrusive live status.
- Under reduced motion, remove rotation and transitions while keeping the active slide larger and adjacent slides visible.
- Hebrew uses the existing RTL direction and direction-aware controls.

## Data and Component Boundaries

`ServiceBanners.tsx` remains the owner of service content, Embla state, dialogs, and controls. A small pure helper maps a service index and selected index to a visual position. CSS in the existing global stylesheet owns perspective, card sizing, depth, and motion.

No service copy, URL, image source, modal content, or homepage section order changes.

## Production Workflow

- Trigger: the user approved the cover-flow design.
- Steps: update selected-state logic, apply responsive depth styles, add regression coverage, run local validation, and complete visual QA.
- Human checkpoint: review desktop and mobile screenshots before any production merge.
- Failure path: unsupported 3D transforms or reduced-motion preferences fall back to a centered, flat, swipeable carousel with all content accessible.

## Verification

- TypeScript, lint, component tests, and production build pass.
- Desktop previous and next buttons work.
- Side-card selection centers the card; active-card selection opens its current dialog.
- Swipe works on touch-sized viewports.
- Arrow keys work in English and Hebrew.
- All images retain intrinsic dimensions and non-active images lazy-load.
- No horizontal page overflow or clipped copy at 375, 390, 430, 768, 1024, and 1440 pixels.
- Reduced-motion behavior is static and readable.
- Browser console has no carousel errors.
