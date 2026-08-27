# WIRO Indochina Premium Journey

Interview answers, captured from the owner's approved direction on 2026-08-28.

1. **Vibe:** Cinematic, grounded, private, adventurous, refined. References: a documentary travel film, a luxury safari lodge, and an editorial outdoor magazine.
2. **Scroll journey:** Start with the feeling of leaving ordinary Chiang Mai behind. Move into real jungle roads, waterfalls, mountains, and village life. Then show how WIRO makes the journey private, safe, Hebrew-friendly, kosher-aware, and personal. End with a clear invitation to plan a private route. Also include Indochina country Laos and Vietnam also.
3. **Energy curve:** Begin calm and spacious. Build tension as the road becomes rougher and more remote. Peak at the moment the vehicle reaches an unforgettable natural location. Finish warm, reassuring, and personal.
4. **Feelings and memorable moment:** Recognition: “This feels like the Thailand I want to discover.” Curiosity: “Where is this road going?” Excitement: “This is a real off-road adventure.” Trust: “WIRO understands my group and my observance.” Desire: “I want to be there.” Memorable moment: arriving at a hidden waterfall after the final difficult stretch of trail.
5. **Unique site behavior:** The route should reveal itself as the visitor scrolls. The road, landscape, and story should gradually change from Chiang Mai into the remote destination, with the booking invitation appearing only after the visitor has experienced the journey.
6. **Design distance:** Premium-minimal with an editorial travel-film feeling. Elegant typography, large real photography, restrained animation, deep forest green, warm gold, and generous space.
7. **World structure:** Distinct photographic scenes connected by the feeling of one journey. Each scene should feel like a real chapter, not a generic animated section.
8. **Existing assets:** Use the WIRO logo, forest-green and gold brand colors, current hero video, bridge photo, waterfall photo, hill-tribe photo, real route photography, English and Hebrew content, WhatsApp, booking flow, and Levi support. Do not generate replacement imagery unless an important scene is missing.

## Working product assumptions

- Audience: Jewish and kosher-aware travelers, especially Israeli and Hebrew-speaking private groups visiting Chiang Mai and the wider Indochina region.
- End belief: WIRO can create a real, private adventure that respects the group's pace, language, food needs, and observance.
- Primary action: **Plan with WIRO**.
- Art direction: real photography and supplied footage, editorial outdoor composition, deep forest green, warm gold, DM Serif Display and Source Sans 3.
- Laos and Vietnam are presented as regional route-planning territory, not as invented confirmed WIRO inventory.

## Journey

1. **Threshold:** Leave ordinary Chiang Mai behind and understand that the road is the invitation.
2. **Discovery:** Follow the route through Mae Wang and the North as the landscape changes.
3. **Peak:** Reach the hidden waterfall after the difficult trail and feel that the road earned the arrival.
4. **Confidence:** Learn that private pacing, Hebrew support, kosher-aware planning, and Shabbat sensitivity are designed into the conversation.
5. **Range:** See Thailand, Laos, and Vietnam as one wider Indochina field for tailored route planning.
6. **Commitment:** Send dates, group details, and desired places to WIRO on WhatsApp.

## Feeling curve

1. Calm recognition: spacious green threshold copy and a clear promise of leaving the ordinary road.
2. Curiosity: the route rail and staggered real photographs move the visitor from Chiang Mai toward the North.
3. Anticipation: the final chapter tightens the sense of distance before the arrival.
4. Awe: the waterfall fills the screen and holds the largest span as the engineered peak.
5. Confidence: practical support appears as a quiet, structured list rather than sales claims.
6. Possibility: three regional scenes widen the journey from Thailand into Laos and Vietnam.
7. Resolve: the gold close holds a single next action and does not trail into an empty footer.

## Peak

“The screen took me from Chiang Mai through the hard road, then the jungle opened onto the waterfall.”

Peak act: **3, waterfall arrival**.

## Tell-someone sentence

It’s the site where the route reveals itself from Chiang Mai to a hidden waterfall, then hands you a private Indochina journey to plan.

## Authored silence

The first threshold has no scroll instruction or animated cue. The quiet space before the route rail is intentional. The pause immediately before the waterfall peak is also intentional.

## Score

| Beat       | Device                               | Why                                                              |
| ---------- | ------------------------------------ | ---------------------------------------------------------------- |
| Threshold  | pinned editorial copy                | Establishes calm and gives the journey room to breathe.          |
| Discovery  | staggered image rail + progress line | Makes the route physically reveal itself under scroll.           |
| Peak       | long held photographic reveal        | The waterfall is the single largest visual and emotional change. |
| Confidence | structured list                      | Turns the emotional promise into concrete reassurance.           |
| Range      | three-scene region grid              | Broadens the geography without inventing a tour catalogue.       |
| Commitment | resolved split CTA                   | Ends with one clear WhatsApp action and a secondary tour link.   |

## Grammar and fingerprint gate

Grammar: **editorial route atlas**. The page uses a calm threshold, a physical route rail, a long photographic peak, a practical confidence list, a regional triptych, and a held CTA close. FilMic one-shot lost because it would contradict the approved distinct-scene direction and over-weight the existing hero-video pattern. The other grammars lost because they either make the route feel like a product interface, require generated or continuous worlds, or push the page toward novelty over trust.

Registry status before this build: empty. Gate: clear by default. Planned fingerprint: grammar editorial route atlas; nav existing transparent-to-forest header; hero device real-photo/video hero; act sequence threshold → route rail → peak → confidence → region triptych → close; close pattern held gold split CTA; signature move scroll-traveling route marker.

## Verification record

- `pnpm check`: passed.
- `pnpm exec vite build`: passed.
- Desktop scroll-through at 1280×720: passed. All regional images loaded after scrolling; no missing-media responses.
- Mobile capture at 390px width: passed visually with no horizontal overflow.
- Reduced-motion DOM check: passed. Scroll cue is absent, journey and CTA remain available, and no overflow was detected.
- Screenshot evidence: `lab/wiro-desktop.png`, `lab/wiro-mobile.png`, `lab/wiro-scroll.png`.
- Not verified here: real iPhone video decoder/autoplay behavior and production API responses. The Vite-only browser run logged the existing TRPC HTML fallback because the app API was not running.

## Impeccable critique pass

- Context and product gates passed. The page is a brand-register marketing surface.
- Deterministic scan: clean, no prohibited JSX patterns detected.
- Main critique: the first regional composition was too uniform and risked reading as a generic destination-card grid.
- Adjustment: staggered the Laos card and varied all three image proportions, while keeping the mobile layout compact and scannable.
- Preserved: real imagery, one primary WhatsApp action, no invented inventory claims, reduced-motion support, and bilingual copy.

## UI UX Pro Max refinement

- Design-system search was used as a reference, but its app-store pattern, blue/orange palette, and Cinzel/Josefin pairing were rejected as a mismatch for WIRO’s existing expedition brand.
- Kept the established forest/gold palette and DM Serif Display/Source Sans 3 system.
- Added reserved image dimensions for layout stability and requestAnimationFrame-throttled scroll progress for smoother mobile interaction.
