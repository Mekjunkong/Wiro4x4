# Mae Hong Son Loop Expedition Atlas Design

**Date:** 2026-09-11

**Status:** Visual direction A approved; ready for implementation planning

## Outcome

Create a bilingual Mae Hong Son Loop local guide for independent motorcycle and private 4x4 travelers. The page should feel like a premium expedition atlas: emotionally cinematic at the top, practical and scannable throughout, and honest about what WIRO currently offers.

The primary action is to understand the loop and its stages. The secondary action is “Ask WIRO to help plan this route.” The page must not imply that a fixed commercial package, price, support vehicle, insurance, or availability already exists.

## Selected Visual Direction

Use **A — Expedition Atlas**.

- A wide documentary hero introduces Mae Hong Son as a multi-day road journey.
- A compact 4 / 5 / 6-day pace selector appears immediately after the introduction.
- A route ribbon and overview map make the loop understandable before the detailed chapters.
- Stage chapters combine route guidance, driving/riding context, and a small number of photo-led highlights.
- The existing WIRO dark green, warm ivory, expedition gold, editorial serif typography, squared geometry, and WhatsApp conversion system remain authoritative.
- Photography is large and cinematic, but the page does not identify a generic Northern Thailand photograph as a specific attraction.

## Audience and Page Structure

The same guide serves motorcycle and private 4x4 travelers. A lightweight vehicle switch changes practical notes, not the route or unsupported commercial claims.

1. Hero: “Mae Hong Son Loop” plus motorcycle / private 4x4 and 4 / 5 / 6-day positioning.
2. Route orientation: clockwise route ribbon and conservative planning summary.
3. Pace selector: compare 4, 5, and 6-day versions without presenting prices.
4. Overview map: show the loop and major towns; provide stage-level Google Maps actions.
5. Stage chapters: explain the route in geographic order.
6. Highlight gallery: photo-led attraction cards grouped by mood.
7. Practical guide: weather, haze, road checks, fuel/planning, licenses, helmets, and emergency links.
8. WIRO planning CTA: tracked WhatsApp enquiry with the chosen pace and vehicle included in the message.

## Route Model

Use a clockwise editorial route:

1. Chiang Mai to Mae Sariang via Highway 108.
2. Mae Sariang to Khun Yuam.
3. Khun Yuam to Mae Hong Son town.
4. Mae Hong Son base and optional northern detours.
5. Mae Hong Son through Pang Mapha / Tham Lod to Pai.
6. Pai to Chiang Mai via Highways 1095 and 107.

Pace options:

- **4 days:** a compressed loop for experienced road travelers; fewer detours and longer days.
- **5 days:** balances riding/driving time with major highlights by combining the middle western stages.
- **6 days:** the recommended complete atlas, with more time for Mae Hong Son and optional northern detours.

Do not publish exact distance, stage duration, road condition, or curve-count claims until the final route geometry is measured and WIRO approves the wording.

## Curated Highlights

Initial editorial candidates, subject to source and live-condition checks:

- Mae Sariang old town and riverside.
- Khun Yuam and the Thai-Japan Friendship Memorial Hall.
- Doi Mae U Kho sunflower fields as a clearly seasonal detour.
- Mae Hong Son town, Wat Phra That Doi Kong Mu, and the Jong Kham / Jong Klang lake area.
- Su Tong Pae bamboo bridge.
- Ban Rak Thai as an optional northern detour.
- Pang Ung as an optional detour with access requirements checked before travel.
- Tham Lod Cave with guide/raft and operational details checked live.
- Ban Jabo viewpoint.
- Pai Canyon and Pai town.
- Sai Ngam or Tha Pai hot springs as optional additions.

Filters: Nature, Culture, Viewpoints, Town & Food, Seasonal, and Optional Detour.

Every highlight record should contain a localized name and description, category, stage association, Google Maps query, source URL, last-verified date, `liveCheckRequired` flag, and motorcycle/4x4 note. Opening hours, prices, access rules, and operating status are never hard-coded as current facts without an owned update workflow.

## Map Strategy

Google Maps saved-list and ordinary share URLs are not reliable iframe sources. The page therefore uses a staged system:

- Launch with a branded route overview plus individual stage-level Google Maps directions/search links.
- Avoid a single giant Google Maps navigation URL because waypoint limits make it fragile on mobile.
- Reserve the overview-map component boundary for a future public WIRO Google My Map after route geometry and account sharing are approved.
- If the embedded map later fails, the route ribbon, town sequence, stage links, and attraction search links remain usable.

## Photography Strategy

- Reuse existing WIRO expedition images only when they truthfully support a general road, cave, waterfall, village, or mountain atmosphere.
- Source or generate new editorial images only after checking usage rights and visual accuracy.
- Exact-location cards require an image that is verified for that place; otherwise label the image as regional atmosphere and avoid misleading alt text.
- Keep image dimensions explicit, preload only the hero, and lazy-load gallery media.

## Safety and Trust

The practical panel links visitors to current Thai authorities for weather warnings, road incidents, air quality, licensing, helmets, emergency medical help, and Tourist Police. It explains that mountain weather, haze, access, and road conditions change.

No “road is open,” “safe today,” permit, price, or opening-hours claim is published without a live verification source and date.

## Localization, SEO, and Attribution

- Full English and Hebrew copy through the existing language context, including RTL visual QA.
- New canonical route, localized metadata, server-rendered fallback content, structured data, sitemap entry, and internal links from the motorcycle/private-tour surfaces.
- Use a stable route such as `/motorcycle-tours/mae-hong-son-loop`, while page copy clearly serves both motorcycles and 4x4s.
- Track route-stage clicks, attraction Maps clicks, pace/vehicle selection, and WhatsApp enquiries with a dedicated Mae Hong Son attribution source.

## System Workflow

- Trigger: a visitor lands from search, a WIRO tour page, or a shared link.
- Steps: understand the loop, select vehicle and pace, inspect the map/stages, save highlights, then ask WIRO for planning help.
- Human checkpoints: WIRO approves the final route geometry, commercial wording, exact-place photographs, and any live operational facts before production publication.
- Failure paths: if a map, photo, translation, or live source is unavailable, preserve the route narrative and ordinary links; omit uncertain claims rather than showing stale detail.

## Success Measures

- Route and stage map clicks.
- Highlight map clicks by category.
- 4 / 5 / 6-day and motorcycle / 4x4 selections.
- Tracked WhatsApp planning enquiries.
- Organic visits and engagement on the Mae Hong Son route URL.

## Verification

- TypeScript, lint, focused tests, and production build pass.
- English/Hebrew page content, metadata, canonical, structured data, sitemap, and server fallback agree.
- Pace and vehicle selection is keyboard and screen-reader operable.
- Map and attraction actions work as normal links if JavaScript or an embed fails.
- Hero and gallery images load without layout shift and carry accurate localized alt text.
- No clipped copy, control overlap, or horizontal page overflow at 375, 390, 430, 768, 1024, and 1440 pixels.
- Current road, weather, air-quality, and emergency links are rechecked immediately before deployment.
