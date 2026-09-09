# Samoeng Loop Route Guide Design

## Feature summary

Add a dedicated Samoeng Loop motorcycle guide to the WIRO 4x4 website and link it from the existing motorcycle tours page. It serves mobile-first travelers who want to understand the ride, open the full route in Google Maps, choose useful stops, and contact WIRO when they want motorcycles, a guide, or support.

## Primary user action

Open the complete Samoeng Loop route in Google Maps with confidence. The secondary action is to ask WIRO for help planning or supporting the ride.

## Design direction

- Register: brand.
- Color strategy: restrained, using the existing Expedition Dossier ivory, charcoal, gold, and WhatsApp green system.
- Scene: a rider checks the route on a phone before leaving Chiang Mai, often outdoors or in mixed light, and needs fast practical decisions.
- Anchors: the current WIRO motorcycle page, a printed expedition route dossier, and Google Maps category clarity.
- Visual probes are skipped because the existing production site is the authoritative design system and the new page should feel native to it.

## Scope

- Fidelity: production-ready.
- Breadth: one new route page plus one entry point on the existing motorcycle page.
- Interactivity: category filters and external Google Maps actions.
- Languages: English and Hebrew through the existing language context.
- Devices: mobile-first, responsive through desktop.

## Layout strategy

1. Route hero with a real Northern Thailand image, concise route facts, and one dominant “Open full route” action.
2. A short four-stage route narrative from Chiang Mai through Mae Rim, Pong Yaeng, Samoeng, and Doi Kham.
3. A curated attraction explorer with category filters. Show a useful subset by default and keep the complete shared Maps list available as the source of truth.
4. Practical riding notes that clearly distinguish approximate route facts from live conditions.
5. A WIRO assistance panel with a tracked WhatsApp action.

## Key states

- Default: featured stops across all categories.
- Filtered: only stops matching the selected category.
- No JavaScript or external Maps failure: all links remain normal anchors and the shared list remains accessible.
- Reduced motion: no motion is required to understand or operate the page.
- RTL: Hebrew copy and control flow follow the existing language system.

## Interaction model

- “Open full route” opens the rider’s Google Maps route in a new tab or app.
- Category controls update the visible stop list and expose pressed state to assistive technology.
- Each attraction opens an individual Google Maps search so the destination is resilient even if a place identifier changes.
- “See all saved places” opens the user-maintained Google Maps collection.
- The WIRO CTA opens a tracked, prefilled WhatsApp conversation.

## Content requirements

- Route facts: about 130 km, approximately 3 hours 40 minutes of riding before stops, start and finish in Chiang Mai.
- Categories: nature and waterfalls, viewpoints and gardens, temples and culture, adventure, family and animals, cafes and food.
- Curated stops use only names confirmed in the shared Maps list. Do not claim current opening hours, fees, road status, or seasonal access.
- State that weather, traffic, and road conditions can change.
- Avoid presenting every stop as mandatory or on-route. Some are optional detours.

## Workflow and ownership

- Trigger: visitor opens the Samoeng Loop guide from the motorcycle page or search.
- Steps: review route facts, choose a category, open a stop or the complete route, then optionally contact WIRO.
- Human checkpoint: WIRO owns the Google Maps collection and updates the list when attractions change.
- Failure path: if a shared collection or attraction changes, the website retains the route CTA, plain-language stop names, and Maps search links while WIRO updates the source list.

## Success measures

- Full-route Google Maps clicks.
- Attraction Maps clicks by category.
- Tracked WhatsApp enquiries from the Samoeng Loop page.
- Organic visits to the Samoeng Loop route URL.

## Implementation references

- `reference/brand.md`
- `reference/interaction-design.md`
- `reference/responsive-design.md`
- `reference/ux-writing.md`
- `reference/harden.md`

## Open questions

None blocking. The page intentionally avoids live opening-hour, fee, and road-condition data until an owned data workflow exists.
