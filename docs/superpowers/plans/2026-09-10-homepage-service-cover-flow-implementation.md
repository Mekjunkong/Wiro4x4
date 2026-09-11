# Homepage Service Cover Flow Implementation Plan

## Goal

Ship the approved cinematic cover-flow redesign for the existing homepage service carousel without changing any other homepage section, service content, image, destination link, dialog, or SEO structure.

## Ownership

| Work                          | Owner                         | Done when                                                                          |
| ----------------------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| Selected-state model          | Primary implementation        | Every service resolves to active, adjacent, or distant visual state in LTR and RTL |
| Cover-flow presentation       | Primary implementation        | Active card is centered and cinematic; neighboring cards visibly recede            |
| Interaction regression checks | Code-audit agent plus primary | Side click selects, active click opens, arrows, dots, keyboard, and swipe work     |
| Responsive visual QA          | Visual-QA agent plus primary  | Required widths, RTL, reduced motion, focus, and overflow are verified             |
| Production release            | Primary implementation        | CI and Vercel pass, merge is verified on the public homepage                       |

## Critical Path

`state helper and tests` → `component markup` → `responsive CSS` → `automated validation` → `browser QA` → `PR and production verification`

## Tasks

### 1. Add a deterministic visual-position helper

- Map each service index relative to Embla's selected snap.
- Handle the five-item loop so the first and last services can be adjacent.
- Return stable active, previous, next, and distant states for class and accessibility logic.
- Add focused unit coverage for wraparound behavior.

### 2. Adapt the existing Embla configuration

- Use centered alignment, looping, one-slide movement, and stable snap behavior.
- Preserve direction-aware English and Hebrew navigation.
- Track selection and slide count using the current Embla API events.
- Keep autoplay absent because the existing carousel does not autoplay.

### 3. Separate selection from dialog activation

- A side-card click scrolls that journey to the center and does not open the dialog.
- A click on the active card opens the existing service dialog.
- Preserve current service CTAs and nested organized-group contact flow.
- Add an unobtrusive live selected-slide label.

### 4. Implement cinematic responsive presentation

- Add a carousel-specific viewport and scene wrapper with CSS perspective.
- Size mobile slides to approximately 84 percent of viewport width.
- Progress through taller mobile, 3:2 tablet, and 16:9 desktop crops.
- Apply transform, opacity, filter, stacking, and shadow by visual state.
- Use the approved 600 millisecond exponential ease.
- Flatten rotation and remove transitions under reduced motion.

### 5. Validate locally

- Run focused tests, TypeScript, lint, full unit tests, and production build.
- Start a production-equivalent preview that can render the homepage.
- Verify 375, 390, 430, 768, 1024, and 1440+ widths.
- Verify English, Hebrew RTL, side click, active click, arrows, dots, keyboard, swipe, focus, image loading, and no page overflow.
- Inspect console and network failures.

### 6. Release and verify

- Commit only carousel, CSS, tests, and plan files.
- Push a dedicated branch and create a focused PR.
- Merge after the relevant CI and Vercel checks pass or known baseline failures are confirmed unrelated.
- Verify the public homepage has the new cover flow and the production bundle matches the merge commit.

## Human Checkpoint

The user approved the design and explicitly requested deployment. The final release checkpoint is a visual comparison at mobile and desktop widths before merging.

## Failure Paths

- If looped visual positions are unstable, keep Embla non-looping and preserve centered partial neighbors.
- If side-card dialog prevention is unreliable, render separate active and inactive controls instead of depending on event cancellation.
- If mobile 3D transforms cause Safari clipping, reduce rotation to zero on mobile while keeping scale, opacity, and partial neighbors.
- If production preview differs from local rendering, stop the merge and compare generated CSS and browser console output.
- If Vercel targets a project other than `wiro4x4`, do not promote it.

## Success Measures

- Five services and all current content remain available.
- No new runtime dependency.
- No horizontal page overflow at any required width.
- Active service is centered, sharp, and dominant.
- Neighboring services are visible and clearly selectable.
- All specified pointer, touch, keyboard, RTL, and reduced-motion paths work.
- Public homepage returns HTTP 200 with no carousel console errors.
