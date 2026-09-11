# Homepage Cover Flow Autoplay Design

**Date:** 2026-09-11

**Status:** Approved direction; ready for implementation planning

## Outcome

Add restrained autoplay to the existing homepage `ServiceBanners` cover flow so visitors discover every WIRO journey without losing time to read the active card. Preserve the current five services, images, links, detail dialogs, SEO structure, English/Hebrew behavior, and cinematic cover-flow presentation.

## Selected Approach

Use a one-shot timer around the existing Embla instance. Do not add an autoplay package or replace Embla.

- Each active journey remains visible for 6.5 seconds.
- Automatic movement always calls Embla's logical `scrollNext()` so English and Hebrew follow the configured direction correctly.
- Every resume begins a fresh 6.5-second dwell rather than using a partial remainder.
- Autoplay starts only when the carousel is visible, the browser tab is visible, motion is allowed, no detail dialog is open, and no pause condition is active.
- If Embla is unavailable, the carousel remains fully manual.

## Interaction and Pause State

Autoplay pauses temporarily while a visitor is:

- hovering with a mouse;
- focusing any carousel control with a keyboard;
- dragging or swiping;
- reading an open journey detail dialog;
- viewing another browser tab; or
- scrolled far enough that the carousel is outside the viewport.

Autoplay resumes with a complete dwell after hover ends, focus leaves the carousel, drag momentum settles, the dialog closes, the tab becomes visible, or the carousel returns to view.

Manual arrows, pagination, side-card selection, keyboard navigation, and drag selection reset the dwell. Automatic movement must never open a detail dialog.

## Readability and Controls

- Keep the active journey centered, sharp, and fully readable.
- Add a quiet localized hint: “Swipe to browse · open the active journey for full details.”
- Use a clearer active-card action: “Open full journey details.”
- Add a persistent 44-pixel Play/Pause button beside the existing controls.
- A visitor's manual Pause remains in force until they explicitly press Play.
- Keep the existing arrows and pagination visually subordinate to the imagery.

## Accessibility and Reduced Motion

- While autoplay is running, the slide status region uses `aria-live="off"` so screen readers are not interrupted every 6.5 seconds.
- While paused or used manually, selection feedback may use `aria-live="polite"`.
- Play/Pause is a semantic button with localized accessible labels and visible focus.
- `prefers-reduced-motion: reduce` disables autoplay completely and preserves the existing flat, readable reduced-motion cover flow.
- Keyboard focus keeps autoplay paused until focus leaves the complete carousel.

## System Flow

- Trigger: the homepage cover flow becomes visible and all play conditions are true.
- Steps: start one timer, advance one logical slide, update the selected state, wait for Embla to settle, then start a new timer.
- Human checkpoint: verify that 6.5 seconds is comfortable on real desktop and mobile devices before production merge.
- Failure paths: clear the timer when state becomes uncertain; retain arrows, dots, side-card selection, swipe, keyboard navigation, and detail dialogs as the complete manual fallback.

## Verification

- Advances once after approximately 6.5 seconds and never skips a journey.
- Does not advance during hover, focus, drag, an open dialog, a hidden tab, or while outside the viewport.
- Pause remains persistent; Play resumes with a fresh dwell.
- Reduced-motion users receive no autoplay.
- English and Hebrew move through the same logical journey order.
- No horizontal overflow, clipped card copy, timer duplication, console error, or layout shift at 375, 390, 430, 768, 1024, and 1440 pixels.
