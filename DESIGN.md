# WIRO 4x4 Design Context

## Design System Name

Expedition Dossier

## Scene

A traveler is checking the site on a phone in Chiang Mai or before a family trip, often in mixed light, trying to know whether WIRO can safely handle route, pickup, kosher, Hebrew, and timing needs. The interface should feel calm, decisive, and field-tested rather than slick or decorative.

## Color

- Strategy: restrained with a warm gold action system.
- Background: warm ivory and parchment surfaces, never pure white.
- Primary: tinted charcoal, never pure black.
- Accent: expedition gold used for dividers, highlights, and secondary UI.
- Primary conversion CTA: WhatsApp green is allowed because it is a real-world service cue.
- Admin/data color should reuse WIRO gold, stone, charcoal, and muted green where possible. Avoid purple/cyan AI palettes.

## Typography

- English body: Source Sans 3.
- English display: DM Serif Display, used sparingly for travel storytelling and section heads.
- Hebrew body: Heebo.
- Hebrew headings: Rubik with enough weight for legibility.
- Keep body line length around 65 to 75 characters on content pages.
- Use strong hierarchy with fewer sizes rather than many decorative labels.

## Layout

- Mobile-first.
- Homepage first viewport should have one dominant action, one secondary path, and no floating action stack.
- Desktop navigation should prioritize conversion and trip choice. Secondary content belongs under a lower-priority path.
- Cards are acceptable for tours, packages, blog posts, and admin records, but avoid nested cards and repeated icon-heading-text grids.
- Use real whitespace and grouping instead of side-stripe borders.

## Components

- Header: compact, fixed, and conversion-oriented.
- Hero: real full-bleed photo, direct promise, WhatsApp primary, tours secondary.
- Levi chat: appears after the user has moved beyond the first hero decision; it helps gather route, date, group size, pickup area, and kosher/Shabbat/Hebrew-guide needs.
- Cookie consent: compact utility strip, never a modal-like interruption.
- Tour/package cards: image-led with concise metadata and clear pricing notes.

## Motion

- Keep motion purposeful and short.
- Respect reduced motion.
- Avoid bounce or elastic effects.
- Prefer subtle opacity or transform transitions; do not animate layout-heavy properties.

## Accessibility

- Touch targets should be at least 44px.
- Icon-only controls need accessible labels, but visible labels are preferred when space allows.
- Chat messages should announce new content politely and preserve text direction.
- Hebrew pages and components must support RTL without mirrored layout bugs.

## Bans

- No gradient text.
- No decorative glassmorphism.
- No pure `#000` or `#fff` surfaces.
- No colored side-stripe card accents.
- No hero metric template.
- No generic “AI travel app” purple/cyan palette.
