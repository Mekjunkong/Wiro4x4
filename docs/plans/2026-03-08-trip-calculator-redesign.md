# Trip Calculator Redesign - Design Document

**Date:** 2026-03-08
**Status:** Approved
**Target:** `/estimate-v2` (A/B test before replacing `/estimate`)

## Overview

Complete redesign of the trip cost calculator to improve mobile UX, increase conversion, and provide a premium booking experience. The new calculator features progressive disclosure, collapsible sections, sticky price summary, and strategic trust signals.

## Design Decisions

### 1. Layout Philosophy: Hybrid Collapsible Approach

**Selected: Option C - Hybrid Approach**

- Single-page scroll with collapsible sections
- Completed sections auto-collapse with summary pills
- Click any section to expand and edit
- Progressive disclosure guides users through flow

**Rationale:** Balances overview visibility with focused attention. Less overwhelming than showing everything, more flexible than strict wizard.

### 2. Sticky Price Display: Fixed Bottom Bar

**Selected: Option A - Fixed Bottom Bar**

- Always visible at screen bottom (mobile)
- Shows: "Total: ฿12,500" + "View Breakdown" button
- Tapping expands full breakdown modal
- Desktop: Sticky card bottom-right

**Rationale:** Maximum visibility for conversion-critical element. Always-present CTA reduces friction.

### 3. Tour Visual Presentation: Expandable Preview Cards

**Selected: Option C - Expandable Preview Cards**

- Default: Name + price + 60px thumbnail (collapsed)
- Tap to expand: Shows 3 highlights + image carousel + "Popular" badge
- Compact but allows rich detail on demand

**Rationale:** Best balance of screen space and engagement. Visual confirmation without overwhelming.

### 4. Trust Signals: Strategic Placement

**Selected: Option C - Strategic Placement**

- "Popular" badge on top 2-3 tours only
- Recent booking count below tour selector
- Single customer quote in price breakdown
- Guarantee badge in bottom bar

**Rationale:** Natural placement at decision points. Not pushy, but builds confidence where it matters.

### 5. Save & Share: Both Email + Shareable Link

**Selected: Option C - Both Options**

- "Save & Share Estimate" button opens modal
- Two tabs: "Email Me" (lead capture) | "Get Link" (instant share)
- Email captures lead, link enables viral sharing

**Rationale:** Covers both use cases - lead generation and user convenience. Flexibility increases conversion.

### 6. Currency Conversion: THB Primary with Tooltips

**Selected: Option C - THB Primary with Tooltip**

- All prices shown in THB (primary)
- Hover/tap any price → tooltip shows: "~$350 USD | ~€320 EUR | ~₪1,250 ILS"
- Static exchange rates with "approximate" disclaimer
- Updated monthly via `shared/currencyConversion.ts`

**Rationale:** Keeps UI clean, THB stays authoritative, but provides helpful context for international (especially Israeli) travelers.

### 7. Package Recommendations: Smart Context-Aware

**Selected: Option C - Smart Recommendations**

- Shows when user completes dates section
- Only if dates align with package duration (2/3/5 days)
- Appears as expandable card between Services and Price
- Shows comparison: à la carte vs package with savings highlighted

**Rationale:** Timely, relevant, value-focused. Not pushy, appears when users have enough context to appreciate the offer.

### 8. Mobile Interactions: Progressive Disclosure

**Selected: Option C - Progressive Disclosure**

- Section auto-expands when previous is completed
- Completed sections auto-collapse with summary pill
- Can manually expand any section to edit
- Smooth scroll animations (300ms ease-out)

**Rationale:** Guided flow for first-time users, flexible for returning users. Premium mobile experience.

### 9. Empty States: Hybrid Visual Approach

**Selected: Option C - Hybrid**

- Main empty state (no tours): Hero illustration of 4x4 on mountain
- Section placeholders: Icons + helpful micro-copy
- Example: "Select tours to begin" with calculator icon

**Rationale:** One quality illustration sets brand tone, icons keep development fast and consistent.

## Architecture

### File Structure

```
client/src/
├── pages/
│   └── EstimateV2.tsx                    # New page at /estimate-v2
├── components/
│   └── calculator-v2/
│       ├── CostCalculatorRedesigned.tsx  # Main orchestrator
│       ├── TourSelector.tsx              # Collapsible tour section
│       ├── GroupSelector.tsx             # Collapsible group section
│       ├── DateSelector.tsx              # Collapsible dates section
│       ├── ServiceSelector.tsx           # Collapsible services section
│       ├── PriceSummaryBar.tsx           # Fixed bottom bar
│       ├── PriceBreakdownModal.tsx       # Full breakdown modal
│       ├── SaveEstimateModal.tsx         # Email + link modal
│       ├── TourPreviewCard.tsx           # Expandable tour card
│       ├── PackageRecommendation.tsx     # Smart package card
│       ├── SectionWrapper.tsx            # Reusable collapsible wrapper
│       ├── ProgressIndicator.tsx         # Step tracker
│       ├── CurrencyTooltip.tsx           # Price hover tooltip
│       └── EmptyStateHero.tsx            # No tours illustration
shared/
└── currencyConversion.ts                 # Static exchange rates
```

### Migration Strategy

1. Build `/estimate-v2` as complete parallel implementation
2. Keep `/estimate` unchanged during development
3. Test thoroughly (E2E, manual QA, accessibility)
4. Soft launch via URL param: `/estimate?version=v2`
5. Monitor analytics for 1-2 weeks (bounce rate, WhatsApp clicks, email captures)
6. If successful: replace `/estimate` → redirect to v2
7. Archive old calculator code for 30 days, then delete

**Rollback:** If issues arise, remove URL param routing, iterate on v2

## Component Hierarchy

### CostCalculatorRedesigned (Main Orchestrator)

**State:**

```typescript
- selectedTours: TourSelection[]
- adults: number
- children: number[] // ages
- arrivalDate: string
- departureDate: string
- services: ServiceConfig
- completedSections: Set<'tours' | 'group' | 'dates' | 'services'>
- currentSection: string | null // for auto-scroll
```

**Responsibilities:**

- Coordinate section expansion/collapse
- Track completion state
- Calculate pricing via `shared/pricing.ts`
- Manage modals (breakdown, save/share)

### SectionWrapper (Reusable Collapsible Container)

**Props:**

```typescript
- title: string
- icon: LucideIcon
- isComplete: boolean
- isExpanded: boolean
- onToggle: () => void
- summaryPill?: ReactNode // e.g., "2 tours selected"
- stepNumber: number
- children: ReactNode
```

**Styling:**

- Collapsed: Header bar with icon + title + summary pill + chevron
- Expanded: Full section with smooth height animation
- Complete state: Green checkmark icon

### PriceSummaryBar (Fixed Bottom Bar)

**Props:**

```typescript
- total: number | null
- isVisible: boolean // show when canCalculate = true
- onViewBreakdown: () => void
- onSaveEstimate: () => void
- breakdown: PriceBreakdown | null
```

**Responsive:**

- Mobile (< 768px): Fixed bottom, full width, 80px height
- Desktop (> 1024px): Fixed bottom-right, 300px width card

**Contents:**

- Total price (large, bold)
- "View Breakdown" button (primary)
- "Save & Share" button (secondary)
- Small "100% Guarantee" badge

### TourPreviewCard (Expandable Tour Card)

**Props:**

```typescript
- tour: TourSelection
- isExpanded: boolean
- onToggle: () => void
- onRemove: () => void
- language: 'en' | 'he'
```

**States:**

- **Collapsed:** Name + price + 60px thumbnail + remove button
- **Expanded:** + 3 highlights bullet points + image carousel (3-5 images) + "Popular" badge (if applicable)

**Images:** Use existing tour images from DB or fallback to `/images/optimized/`

## Data Flow & Interactions

### Progressive Disclosure Flow

1. **Initial State:** Only "Tours" section expanded, hero empty state visible
2. **Select First Tour:** Tours section shows card, "Group" section auto-expands
3. **Complete Group:** "Group" collapses with pill "4 people", "Dates" auto-expands
4. **Select Dates:** "Dates" collapses with pill "Mar 15-20", "Services" auto-expands
5. **Any Service Toggle:** Price summary bar appears (smooth slide up animation)
6. **Click "View Breakdown":** PriceBreakdownModal opens (full screen on mobile, centered modal on desktop)
7. **Click "Save & Share":** SaveEstimateModal opens with Email | Link tabs

### Auto-Collapse Logic

```typescript
// When section marked complete, collapse and expand next
onTourSelected() {
  markComplete('tours')
  expandNext('group')
  smoothScrollTo('group')
}

onGroupSet() {
  markComplete('group')
  expandNext('dates')
  smoothScrollTo('dates')
}

onDatesSet() {
  markComplete('dates')
  expandNext('services')
  smoothScrollTo('services')
}
```

### Smart Package Recommendation Trigger

**Conditions:**

- `selectedTours.length >= 2`
- `tripDays matches MULTI_DAY_PACKAGES` (2/3/5 days)
- User has completed dates section

**Appearance:**

- Card appears between Services and Price Summary
- Expandable: "💡 Save ฿2,500 with our 3-Day Adventure Package"
- Click to see comparison table: À la carte vs Package pricing

## Mobile-Specific UX

### Fixed Bottom Bar (Mobile)

- Appears when `canCalculate = true`
- Height: 80px + safe area padding
- Contains: Total price + "View Breakdown" button
- Sticky position: `fixed bottom-0 inset-x-0`
- Add `pb-24` to main content to prevent overlap

### Touch Interactions

- **Section headers:** Full-width tap target, min 48px height
- **Tour cards:** Tap anywhere to expand, only trash icon removes
- **Currency tooltip:** Long-press price to show conversions (mobile), hover on desktop
- **Smooth scrolling:** 300ms ease-out animations between sections

### Responsive Breakpoints

- **Mobile (< 768px):** Full-width cards, fixed bottom bar, single column
- **Tablet (768-1024px):** Max-width 720px centered, bottom bar stays bottom
- **Desktop (> 1024px):** Max-width 800px, price summary becomes sticky right sidebar

## Trust Signals & Conversion Elements

### Strategic Placement

1. **Tour Selector:**
   - "Most Popular" badge on top 2 tours
   - Gold gradient badge with star icon
   - Position: Top-right of tour card

2. **Below Tour Selector:**
   - "12 travelers booked tours this week"
   - Subtle gray text with users icon
   - Updates weekly (static count)

3. **Price Breakdown Modal:**
   - Customer quote card:
     > "Amazing experience! The kosher meals were delicious and Wiro was so knowledgeable. Highly recommend!"
     > — Sarah, Tel Aviv ⭐⭐⭐⭐⭐
   - Light gold background, quote icon, 5-star rating

4. **Bottom Bar:**
   - Small "100% Satisfaction Guarantee" icon
   - Tooltip on hover: "Love it or your money back"

### Badge Styling

- **"Popular":** `bg-gradient-to-r from-[#D4AF37] to-[#B8960F]`, white text, star icon
- **Booking count:** `text-muted-foreground`, subtle, non-intrusive
- **Customer quote:** `bg-[#D4AF37]/10`, rounded-lg, padding, quote marks

## Error Handling & Edge Cases

### Edge Cases

1. **No tours in DB:**
   - Show fallback tours (current behavior)
   - Log warning to console

2. **Invalid dates (departure before arrival):**
   - Inline error message below date fields
   - Disable price calculation
   - Red border on invalid field

3. **Network error loading tours:**
   - Show error state with retry button
   - "Failed to load tours. [Retry]"

4. **Save email fails:**
   - Toast notification: "Failed to send email. Please try again."
   - Retry button in toast
   - Log error for debugging

5. **Shareable link too long:**
   - Use URL shortener API (optional)
   - Or: Store estimate in localStorage + generate short code
   - Fallback: Copy full URL to clipboard with warning

### Validation Rules

**Required:**

- At least 1 tour selected
- Valid date range (departure > arrival, both set)

**Optional:**

- Group size (defaults to 2 adults)
- All services (all can be empty)

**Price Display:**

- Show "—" if incomplete
- Show "Custom Quote Required" if group >= 7

## Currency Conversion

### Implementation

**File:** `shared/currencyConversion.ts`

```typescript
export const EXCHANGE_RATES = {
  USD: 0.028, // 1 THB = ~$0.028 USD
  EUR: 0.026, // 1 THB = ~€0.026 EUR
  ILS: 0.1, // 1 THB = ~₪0.10 ILS
  // Updated monthly
};

export function formatCurrency(
  thb: number,
  currency: "USD" | "EUR" | "ILS"
): string {
  const amount = thb * EXCHANGE_RATES[currency];
  const symbol = { USD: "$", EUR: "€", ILS: "₪" }[currency];
  return `${symbol}${amount.toFixed(0)}`;
}
```

### UI Integration

**CurrencyTooltip Component:**

- Wraps all price displays
- On hover (desktop) or long-press (mobile): Show tooltip
- Tooltip content: "~$350 USD | ~€320 EUR | ~₪1,250 ILS"
- Disclaimer: "Approximate rates, updated monthly"

### Rate Updates

- Manual update monthly in `currencyConversion.ts`
- Comment at top of file: "Last updated: 2026-03-08"
- Future: Could pull from API, but static is simpler

## Save & Share Functionality

### SaveEstimateModal Component

**Tabs:**

1. **Email Me:**
   - Input: Email address
   - Optional: Name, notes
   - Button: "Send Estimate"
   - Action: Call `trpc.estimate.sendEmail` (new procedure)
   - Success: Toast "Estimate sent! Check your inbox."

2. **Get Link:**
   - Generate shareable URL with query params
   - Example: `/estimate-v2?tours=doi-inthanon,mae-kampong&adults=4&dates=2026-03-15,2026-03-20`
   - Button: "Copy Link" (copies to clipboard)
   - WhatsApp share button (opens WhatsApp with link)

### Backend Requirements

**New tRPC Procedure:** `estimate.sendEmail`

```typescript
// server/routes/estimate.ts
export const estimateRouter = router({
  sendEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
      estimate: z.object({
        tours: z.array(z.string()),
        adults: z.number(),
        children: z.array(z.number()),
        dates: z.object({ arrival: z.string(), departure: z.string() }),
        services: z.object({ ... }),
        total: z.number(),
      }),
    }))
    .mutation(async ({ input }) => {
      // Send email via Resend
      // Template: "Your WIRO 4x4 Trip Estimate"
      // Include: Tours, dates, group, total, booking link
      await sendEstimateEmail(input.email, input.estimate)
    })
})
```

## Testing Strategy

### Unit Tests

**Shared Logic:**

- `shared/pricing.ts` - All calculations (already covered)
- `shared/currencyConversion.ts` - Tooltip formatting

**Component Logic:**

- Section completion detection
- Auto-expand/collapse behavior
- Price visibility logic

### Component Tests (Vitest + Testing Library)

1. **SectionWrapper:**
   - Renders collapsed with summary pill
   - Expands on click
   - Shows checkmark when complete

2. **TourPreviewCard:**
   - Renders collapsed state
   - Expands on click to show highlights
   - Remove button works

3. **PriceSummaryBar:**
   - Hidden when `!canCalculate`
   - Visible when `canCalculate`
   - Click opens modal

### E2E Tests (Playwright)

**Test File:** `e2e/trip-calculator-v2.spec.ts`

**Scenarios:**

1. **Full Booking Flow:**
   - Navigate to `/estimate-v2`
   - Select 2 tours
   - Set group size (3 adults, 1 child age 8)
   - Select dates (5-day trip)
   - Toggle services (hotels, kosher meals)
   - Verify price appears in bottom bar
   - Click "View Breakdown" → modal opens with correct items
   - Verify package recommendation appears

2. **Progressive Disclosure:**
   - Verify only Tours section expanded initially
   - Select tour → Group auto-expands
   - Set group → Dates auto-expands
   - Set dates → Services auto-expands
   - Verify smooth scrolling between sections

3. **Save Estimate:**
   - Complete calculator
   - Click "Save & Share"
   - Tab 1: Enter email, submit (verify success toast)
   - Tab 2: Click "Copy Link" (verify clipboard)

4. **Mobile Experience:**
   - Test on mobile viewport (375px width)
   - Verify bottom bar appears
   - Verify collapsing works via touch
   - Verify currency tooltip on long-press

5. **Error Handling:**
   - Try to calculate with no tours → see empty state
   - Set departure before arrival → see validation error
   - Network failure → see retry button

## Visual Design

### Color Palette

- Primary: `#D4AF37` (WIRO Gold)
- Primary Hover: `#B8960F`
- Secondary: `#2D5016` (Forest Green)
- Background: `bg-background` (theme-aware)
- Muted: `text-muted-foreground`
- Success: `text-green-600`
- Error: `text-red-600`

### Typography

- Headings: `font-heading` (existing WIRO font)
- Body: `font-sans`
- Prices: `font-bold text-2xl` (large, prominent)

### Spacing

- Section padding: `p-5 md:p-6`
- Card spacing: `space-y-6 md:space-y-8`
- Mobile touch targets: Min 48px height

### Animations

- Section expand/collapse: 300ms ease-out
- Bottom bar slide up: 200ms ease-in-out
- Smooth scroll: 300ms ease-out
- Hover states: 150ms ease

## Success Metrics

**Primary KPIs:**

- WhatsApp click-through rate (current: ~X%, target: +20%)
- Email capture rate (new metric, target: 15% of visitors)
- Shareable link generation (new metric, target: 10% of completions)

**Secondary KPIs:**

- Time on page (should decrease with better UX)
- Bounce rate (should decrease)
- Mobile completion rate (should increase)

**A/B Test Duration:** 1-2 weeks minimum, 500+ visitors per version

## Future Enhancements (Post-Launch)

1. **Real-time booking counts** (requires backend tracking)
2. **Dynamic exchange rates** (API integration)
3. **Tour recommendations** (ML-based on user behavior)
4. **Multi-language support** (beyond EN/HE)
5. **Payment integration** (Stripe checkout from calculator)
6. **Calendar availability** (disable unavailable dates)
7. **Group chat feature** (for families planning together)

## Appendix: Key Differences from Current Calculator

| Feature       | Current `/estimate`         | New `/estimate-v2`                      |
| ------------- | --------------------------- | --------------------------------------- |
| Layout        | All sections always visible | Collapsible with progressive disclosure |
| Price Display | Bottom of page              | Fixed bottom bar (always visible)       |
| Tour Cards    | Text-only list              | Expandable cards with images            |
| Trust Signals | None                        | Popular badges, booking count, quotes   |
| Save/Share    | WhatsApp only               | Email + shareable link + WhatsApp       |
| Currency      | THB only                    | THB + tooltip conversions (USD/EUR/ILS) |
| Package Hints | Static text                 | Smart contextual recommendations        |
| Mobile UX     | Basic responsive            | Optimized progressive disclosure        |
| Empty State   | Icon + text                 | Hero illustration                       |
| Accessibility | Basic                       | Full ARIA labels, keyboard nav          |

---

**End of Design Document**

Next step: Create detailed implementation plan using `writing-plans` skill.
