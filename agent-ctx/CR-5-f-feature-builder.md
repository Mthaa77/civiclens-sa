# Task CR-5-f — Municipality Watchlist + Enhanced Global Search

## Agent: Feature Builder
## Date: 2026-03-05

---

## Work Summary

Built the Municipality Watchlist feature and Enhanced Global Search for CivicLens SA.

### Part 1: Watchlist Store
- **Created** `/src/store/watchlist.ts`
  - Zustand store with `persist` middleware (localStorage key: `civiclens-watchlist`)
  - State: `watchlistMunis: string[]`
  - Actions: `addToWatchlist(id)`, `removeFromWatchlist(id)`, `isInWatchlist(id)`
  - Pre-populated with 3 defaults: Johannesburg (id: '2'), Cape Town (id: '1'), eThekwini (id: '3')

### Part 2: WatchlistStar Component
- **Created** `/src/components/shared/WatchlistStar.tsx`
  - Toggle star button with filled/outline states
  - Gold color (#D97706) when active with glow filter
  - Framer Motion bounce animation on toggle (`whileTap: scale 0.8`, `animate: [1, 1.25, 1]`)
  - Tooltip: "Add to watchlist" / "Remove from watchlist"
  - Uses `useWatchlistStore` for state
  - `stopPropagation` and `preventDefault` to avoid parent click handlers

### Part 3: WatchlistWidget Component
- **Created** `/src/components/shared/WatchlistWidget.tsx`
  - Compact card (~300px tall) matching Dashboard sidebar panel style
  - Header: "Watchlist" with Eye icon, count badge (#D97706 gold), Edit toggle, Collapse toggle
  - List of watched municipalities (up to 5 visible, scrollable):
    - Name with colored dot (FHS score band color)
    - Province text
    - FHS score badge (color-coded)
    - Audit outcome mini badge (3-letter abbreviation)
    - Remove button (visible in Edit mode, or on hover)
    - Click navigates to MuniLens
  - Empty state: "Add municipalities to your watchlist" with Plus icon
  - "View all" link if more than 5
  - Add button: Popover with Command search to add municipalities from MOCK_MUNICIPALITIES
  - Collapsible with AnimatePresence animation
  - Glass morphism card matching Dashboard dark theme

### Part 4: Dashboard Integration
- **Updated** `/src/components/modules/Dashboard.tsx`
  - Imported WatchlistWidget
  - Changed "Intelligence Feed" grid from 2-col to 3-col (`lg:grid-cols-3`)
  - Added WatchlistWidget before RiskSignalsPanel
  - Updated section header accent color to #D97706 (gold)
  - Updated subtitle to include "Watchlist"

### Part 5: MuniLens Integration
- **Updated** `/src/components/modules/MuniLens.tsx`
  - Imported WatchlistStar
  - Added WatchlistStar next to municipality name in the detail view header
  - Positioned after the name, before the badges row

### Part 6: Enhanced Global Search
- **Updated** `/src/components/layout/Topbar.tsx`
  - Added imports: Building2, FileSearch, ShieldAlert, MOCK_MUNICIPALITIES, MOCK_TENDERS, MOCK_RISK_SIGNALS, formatCompactZAR, getScoreBand
  - Enhanced CommandDialog (Ctrl+K) to search across 4 categories:
    1. **Recent** — Shows last 5 navigated modules (derived from activeModule + defaults)
    2. **Modules** — All modules grouped by phase (MVP, Phase 2, Phase 3)
    3. **Municipalities** — All MOCK_MUNICIPALITIES with name, province, FHS score badge, colored dot
    4. **Tenders** — All MOCK_TENDERS with title, buyer, value, colored status dot
    5. **Risk Signals** — All MOCK_RISK_SIGNALS with type, entity, severity badge, colored dot
  - Updated title to "Search CivicLens SA" and placeholder to "Search everything..."
  - Each result has colored dot indicator and navigates to correct module on select
  - Prefixed command values with category to avoid collision (e.g., `module-`, `municipality-`, `tender-`, `risk-`)

### Lint & Build
- All lint checks pass (`bun run lint` — 0 errors)
- Dev server compiles and responds with 200 status

---

## Files Changed

| File | Action |
|------|--------|
| `/src/store/watchlist.ts` | Created |
| `/src/components/shared/WatchlistStar.tsx` | Created |
| `/src/components/shared/WatchlistWidget.tsx` | Created |
| `/src/components/modules/Dashboard.tsx` | Modified (import + grid layout) |
| `/src/components/modules/MuniLens.tsx` | Modified (import + header) |
| `/src/components/layout/Topbar.tsx` | Modified (enhanced search) |

---

## Design Notes
- Watchlist accent color: #D97706 (amber/gold) — consistent across widget, star, and search results
- Dark theme consistency: glass morphism cards, white/[0.02-0.08] borders
- Framer Motion used for: star bounce, watchlist item layout animation, collapse/expand
- All components follow existing shadcn/ui patterns (Card, Badge, Button, Command, Popover, ScrollArea, Tooltip)
- Types were already sufficient — no changes needed to `/src/types/index.ts`
