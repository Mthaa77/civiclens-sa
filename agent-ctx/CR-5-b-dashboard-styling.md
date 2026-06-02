# Task CR-5-b: Significantly Improve Dashboard Module Styling

## Agent: Dashboard Styling Enhancer
## Date: 2026-03-05

## Summary
Significantly improved the visual polish, depth, and micro-interactions of the Dashboard module at `/src/components/modules/Dashboard.tsx`.

## Changes Made

### A. KPI Cards Enhancement
- Added inner glow/shadow matching each card's accent color (using `boxShadow: inset` with accent color at low opacity)
- Increased KPI value font weight from `font-bold` to `font-extrabold`
- Made trend indicators more prominent: increased icon size from `size-3.5` to `size-4`, trend value font from `text-xs font-medium` to `text-sm font-bold`
- Added animated shimmer effect on hover using Framer Motion `whileHover`
- Improved "Click to explore" hover text — increased from `text-[9px]` to `text-[10px]`, `font-semibold`, added translate animation, made arrow icon larger (`size-3`)
- Added subtle diagonal line background pattern inside each KPI card at very low opacity (3%)
- Added second glow layer (bottom-left) for more depth
- Icon badge scales up on hover (110%)

### B. Provincial Intelligence Table
- Added alternating row colors (`bg-white/[0.01]` on even rows)
- Improved header row with gradient bottom border using `backgroundImage` + `backgroundClip`
- Color-coded province names with left border accent (`3px solid` using `PROVINCE_ACCENT_COLORS` map)
- Added province color dot indicator next to province names
- Changed header text from `text-zinc-500` to `text-zinc-400 font-bold`
- Changed score values to `font-bold`
- Empty state text changed from `text-zinc-600` to `text-zinc-500`

### C. Recent Risk Signals & Active Tenders Sidebar
- Added severity-based left border accents on risk signal items (4px, color-coded: Critical=#EF4444, High=#F97316, Medium=#F59E0B, Low=#22C55E)
- Added category-based left border accents on tender items (4px, using `CATEGORY_COLORS` map)
- Made "View all" links more prominent with hover underline animation (CSS transition width 0→100%)
- Added staggered entrance animations using custom `listItemStagger` variant with `custom={i}`
- Increased font weights for better readability
- Changed "View all" links to `font-semibold text-zinc-400 hover:text-zinc-200`

### D. Municipality Comparison Widget
- Added colored column headers matching municipalities (A=#0077B6, B=#2D6A4F, C=#B45309) — these were already present but improved with gradient header background
- Added subtle gradient background to comparison table header using `backgroundImage` with both color stops and border
- Made comparison values more prominent — increased from `text-xs` to `text-sm font-bold`
- Added "FHS vs SDS Gap" row with `ArrowLeftRight` icon indicator between compared values, color-coded by gap magnitude
- Added alternating row colors in comparison table
- Select triggers styled with accent color borders
- Label dots increased from `size-2` to `size-2.5`
- Labels changed to `font-semibold text-zinc-400`

### E. Chart Sections (Audit Distribution & Provincial Health)
- Added subtle frame/card wrapper accent line at top of each chart card (module-themed gradient)
- Added icon badges in chart titles for visual anchoring
- Improved chart legend visibility — increased dots from `size-2.5` to `size-3`, added glow (`boxShadow`), scale on hover, text size increased, added `font-semibold`/`font-bold`
- Added subtle background radial gradient behind donut chart center label
- Center label: increased to `font-extrabold`, "Total" text changed from `text-zinc-500` to `text-zinc-400 font-semibold`
- Chart percentage text changed from `text-zinc-600` to `text-zinc-400 font-semibold`
- Legend text changed from `text-zinc-400` to `text-zinc-300 font-medium`
- YAxis tick colors changed from `#71717a` to `#a1a1aa`/`#d4d4d8` for better contrast

### F. General Polish
- Increased all `zinc-400` text to `zinc-300` where used as descriptive labels
- Changed all `zinc-500` text to `zinc-400` where used as primary labels (KPI labels, subtitles, badges)
- Changed `zinc-600` text to `zinc-400`/`zinc-500` for better contrast
- Added gradient border separators using `bg-gradient-to-r from-transparent via-white/[0.08] to-transparent`
- Added section headers (`SectionHeader` component) before each major section with:
  - Accent color bar (left border with gradient fade)
  - Larger font (`text-base font-bold`) 
  - Subtitle text
  - Color-coded by section theme
- Added noise texture overlay to main container for depth (using existing `noise-texture` CSS class from globals.css)
- Changed title fonts to `font-bold`/`font-extrabold` throughout
- Added `AnimatePresence` import for potential future use

## New Components/Helpers Added
- `SectionHeader` — reusable section header with accent color bar and subtitle
- `PROVINCE_ACCENT_COLORS` — map of province names to unique accent colors
- `CATEGORY_COLORS` — map of tender categories to unique accent colors
- `COMPARISON_COLORS` — constant for municipality comparison column colors
- `listItemStagger` — custom animation variant for staggered list item entrance

## Files Modified
- `/src/components/modules/Dashboard.tsx` — All changes in this single file

## Verification
- ESLint passes with no errors
- Dev server compiles successfully
- All existing functionality preserved
