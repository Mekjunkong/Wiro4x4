# Samoeng Loop Google My Maps Embed Design

## Feature summary

Add a public Google My Maps overview directly below the hero on the WIRO Samoeng Loop motorcycle guide. The map should show the complete course plus attraction pins, let visitors inspect Google-hosted place details, and preserve the existing full-route Google Maps action for navigation.

The public My Map becomes WIRO's editable visual source of truth. The website keeps its curated bilingual attraction copy and conversion flow as a separate, owned layer.

## Primary user action

Understand the shape of the Samoeng Loop and its available stops, then open the authoritative Google Maps course when ready to navigate.

## Design direction

- Register: brand.
- Color strategy: restrained, following WIRO's Expedition Dossier system.
- Scene: a rider checks the route on a phone in bright outdoor light before leaving Chiang Mai and needs a legible overview without learning a new interface.
- Anchors: WIRO Expedition Dossier, Google My Maps, and a marked paper road atlas.
- The selected visual direction is the Google My Maps embed shown in the visual companion. Google owns the map canvas and information-panel styling; WIRO owns the surrounding heading, explanation, legend, route CTA, and fallback.
- Image-generation probes are skipped because this is a focused refinement of an existing production page and the approved live page plus Google My Maps interface are the authoritative visual references.

## Scope

- Fidelity: production-ready.
- Breadth: one embedded-map section on `/motorcycle-tours/samoeng-loop` plus the external Google My Map asset.
- Interactivity: pan, zoom, layer and marker interaction inside My Maps; a separate WIRO button opens the supplied full route in Google Maps.
- Languages: English and Hebrew around the embed. Google controls use the language Google selects for the visitor.
- Devices: mobile-first, responsive through desktop.

## Architecture and ownership

### Google-owned map asset

Create one public Google My Map in the user's Google account named `Samoeng Loop by WIRO 4x4`.

Organize it into these editorial layers:

1. Verified Samoeng course.
2. Waterfalls and nature.
3. Views and gardens.
4. Temples and culture.
5. Adventure.
6. Family and animals.
7. Cafes and food.

The course line must be manually traced or imported and visually checked against the supplied Google Maps motorcycle course. Google My Maps does not offer a motorcycle route mode, so the embedded line must not be described as a newly calculated motorcycle route.

Attraction markers use the supplied shared collection as source material. Each marker contains the confirmed place name, category, and a concise description. The map must be public before Google provides a supported embed.

### Website-owned presentation

Add a focused `SamoengMapOverview` component to the route guide. It receives the My Maps embed URL and full-route URL as explicit inputs. The component owns:

- bilingual section heading and explanatory copy;
- responsive iframe sizing;
- the external full-route action;
- loading and failure treatment;
- map-open analytics;
- accessibility labeling.

The website's existing attraction data remains independent. My Maps edits update the embed automatically, while changes to the curated website descriptions or filters still require a code update.

## Layout strategy

Place the map section directly below the current hero and before the four route chapters.

On desktop:

- show a short heading row above the map;
- use a wide map viewport approximately 460 to 500 pixels high;
- place a brief instruction and the full-route button below the iframe;
- allow Google's standard map title, layer, zoom, and place-detail UI to remain unobstructed.

On mobile:

- use a map viewport approximately 320 to 360 pixels high;
- make the external route action full width below the iframe;
- keep at least 44-pixel touch targets;
- avoid overlaying WIRO controls over Google's map controls;
- preserve zero horizontal overflow in English and Hebrew RTL.

## Key states

- Default: the public My Map loads lazily with the full course and attraction layers visible.
- Marker selected: Google My Maps opens its standard place-information panel inside the embed.
- Loading: the reserved map area prevents layout shift and displays a neutral `Loading route overview` label for assistive technology.
- Map unavailable: the section retains the heading, a concise explanation, and the working `Open full route in Google Maps` link. The attraction filters and cards remain available below.
- Map made private or deleted: the iframe failure must not remove navigation access or WIRO's local attraction content.
- No JavaScript: the external full-route anchor remains crawlable and usable.
- RTL: WIRO-owned heading, instructions, and actions mirror correctly; the embedded Google interface remains isolated inside its iframe.

## Interaction model

- Visitors can pan and zoom inside the embedded My Map.
- Tapping a marker opens Google's My Maps information panel.
- The full-route button opens the supplied Google Maps motorcycle course in a new tab or the Google Maps app.
- Map and route actions emit the existing `map_open` analytics event with distinct placements.
- Website category filters continue controlling the curated list below; they do not attempt to control cross-origin My Maps layers.

## Content requirements

English:

- Eyebrow: `Route overview`
- Heading: `Explore the complete Samoeng Loop`
- Instruction: `Move around the map and tap a marker for place details. Open the full route when you are ready to navigate.`
- Action: `Open full route in Google Maps`
- Failure: `The interactive map is unavailable right now. You can still open the complete route or browse the stops below.`

Hebrew equivalents must be supplied through the existing language context. Do not claim live opening hours, fees, road status, or motorcycle-calculated My Maps directions.

## Workflow

- Trigger: the user approves creation of a public My Map in their Google account.
- Steps: inspect the supplied route and collection, create the map, add and categorize markers, trace or import the verified course, review the map privately, make it public, obtain the supported embed URL, add it to the WIRO page, test, deploy, and verify production.
- Human checkpoint: immediately before creating or changing the Google account asset and making it public, confirm the external account action with the user. Review the finished private map before public sharing when the platform permits it.
- Failure path: if the account is unavailable, the map cannot be made public, or the embed cannot load, retain the current published route guide and full-route link until the map asset is ready.

## Testing

- Unit-test embed URL validation and analytics placement values.
- Confirm the production content-security policy permits only the required Google frame origin.
- Verify iframe title, lazy loading, reserved height, fallback copy, and external-link security attributes.
- Browser-test desktop and 390-pixel mobile layouts.
- Test English and Hebrew RTL with no horizontal overflow.
- Confirm a marker opens a My Maps information panel.
- Confirm the full-route action resolves to the supplied multi-stop Google Maps course.
- Verify the public route remains HTTP 200, canonical, and present in the sitemap after deployment.

## Success measures

- My Maps overview loads successfully on the public route.
- Visitors engage with the map without losing access to the route CTA.
- Full-route Google Maps clicks remain measurable.
- WIRO can update the public My Map without redeploying the website.

## Recommended implementation references

- `reference/brand.md`
- `reference/interaction-design.md`
- `reference/responsive-design.md`
- `reference/harden.md`
- `reference/accessibility.md`

## Open questions

No design questions remain. Implementation requires an authenticated Google account, a completed public My Map, and its generated embed URL.
