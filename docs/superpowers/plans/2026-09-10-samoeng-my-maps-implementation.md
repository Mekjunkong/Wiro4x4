# Samoeng Loop Google My Maps Implementation Plan

## Outcome

Publish an editable Google My Maps overview on the production Samoeng Loop guide while preserving the existing full-route navigation link and bilingual WIRO attraction guide.

## System flow

- Trigger: approved design and explicit instruction to create and deploy.
- Inputs: WIRO's 38-place Google Maps collection, supplied full-route link, existing bilingual route page, and the authenticated Google account.
- External owner: Google My Maps asset, public sharing, marker panels, and embedded map controls.
- Website owner: bilingual framing copy, iframe sizing, analytics, accessibility, fallback, and navigation CTA.
- Output: a public My Map plus a verified production embed at `/motorcycle-tours/samoeng-loop`.

## Tasks

1. Create and name `Samoeng Loop by WIRO 4x4` in Google My Maps.
2. Import all 38 saved attractions from the versioned category CSV files.
3. Create the overview course from the supplied route's verified stops and visually compare it with the source route.
4. Make the map publicly viewable and capture Google's supported embed URL.
5. Add a focused map-overview component below the page hero.
6. Add URL validation, analytics placement, accessibility, loading space, and a permanent full-route fallback.
7. Run focused tests, the full validation suite, and desktop/mobile English/Hebrew browser checks.
8. Commit, push, merge to `main`, verify the intended Vercel project, and prove the public route, map, canonical, and sitemap.

## Human checkpoint

The user approved the written design and explicitly requested creation and deployment. Google may still show an account confirmation or public-sharing dialog; only the specified map asset will be changed.

## Failure paths

- Import ambiguity: correct or replace the affected marker before public sharing.
- Course mismatch: retain the supplied full-route CTA and do not label the My Maps line as motorcycle-calculated.
- Public sharing unavailable: stop before website integration and leave the current production page unchanged.
- Embed failure: retain the bilingual map explanation, full-route CTA, and local attraction list.
- Deployment mismatch: verify `.vercel/project.json` and use the repository's established Git integration instead of promoting an unrelated project.

## Measures

- 38 markers present across six attraction layers.
- Course visible and source navigation link unchanged.
- Embed loads and marker detail opens on production.
- No horizontal overflow at 390 px in English or Hebrew.
- Public route is HTTP 200 with canonical and sitemap entry intact.
