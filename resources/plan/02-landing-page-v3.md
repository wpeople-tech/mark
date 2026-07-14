# MARK Landing Page v3 — Implementation Plan

## Decisions Made

| # | Question | Answer |
|---|----------|--------|
| 1 | Mobile nav | Hamburger menu collapse |
| 2 | Auto-tabs after manual click | Let it continue |
| 3 | Extension popup trigger | On scroll-in to demo section |
| 4 | Custom cursor | Desktop only (`pointer:fine`) |
| 5 | Rate-limit UI | Defer (not in v3.dc.html) |
| 6 | Toast message | "Coming to Chrome Web Store soon" |
| 7 | Footer links | Placeholders (`#`) |

## Source

**Primary:** `resources/ui/MARK\ Landing\ v3.dc.html` (extracted from handoff ZIP)
**Design tokens:** README.md §4 + `app/globals.css`

## File Structure

```
mark/
├── app/
│   ├── page.tsx              ← Compose all sections
│   └── globals.css           ← Add keyframes from v3.dc.html
├── components/landing/
│   ├── canvas/
│   │   ├── HeroCanvas.tsx        ← Liquid glass metaballs + mouse pull
│   │   ├── ExtensionPopupCanvas.tsx  ← Mini glass for demo popup
│   │   └── TokenCanvas.tsx       ← Particle node graph
│   ├── ui/
│   │   ├── StatCard.tsx          ← Count-up stat display
│   │   ├── FeatureCell.tsx       ← Grid cell with hover FX
│   │   ├── IdeaCard.tsx          ← Build opportunity card
│   │   ├── Toast.tsx             ← Bottom notification
│   │   ├── ProgressBar.tsx       ← Tab progress indicator
│   │   └── Terminal.tsx          ← Terminal mockup
│   └── sections/
│       ├── Nav.tsx               ← Fixed nav + hamburger
│       ├── HeroSection.tsx       ← Hero + stats + terminal
│       ├── TickerSection.tsx     ← Infinite scroll ticker
│       ├── DemoSection.tsx       ← Auto-advancing tabs
│       ├── HowItWorksSection.tsx ← 3-step process
│       ├── FeaturesSection.tsx   ← Feature grid + hover FX
│       ├── TokenSection.tsx      ← Token card + particles
│       └── Footer.tsx            ← Links + copyright
├── lib/
│   ├── utils.ts                 ← cn() helper (existing)
│   ├── landing-data.ts          ← All hardcoded content
│   ├── useScrollReveal.ts       ← IntersectionObserver
│   ├── useCountUp.ts            ← Eased number animation
│   ├── useAutoAdvanceTabs.ts    ← Tab cycling
│   ├── useMagneticButton.ts     ← Mouse-follow transform
│   ├── useNavScroll.ts         ← Hide/show nav
│   ├── useCustomCursor.ts       ← Desktop dot+ring
│   ├── useMobileNav.ts          ← Hamburger state
│   └── useMousePosition.ts      ← Canvas interaction
├── public/
│   └── fonts/                   ← Geist (via next/font/google, already set)
├── next.config.ts
├── postcss.config.mjs
├── vercel.json
└── package.json
```

## Implementation Order

### Step 1: Foundation
1. Add all keyframe animations to `globals.css` (see §Animations)
2. Create `lib/landing-data.ts` — extract content from v3.dc.html
3. Create all hooks inside `lib/`

### Step 2: Canvas Components
1. `HeroCanvas.tsx` — 4 blobs, mouse pull 0.09, shimmer + edge stroke
2. `ExtensionPopupCanvas.tsx` — 3 blobs, no mouse interaction
3. `TokenCanvas.tsx` — 30 nodes, edge connections <85px

### Step 3: UI Primitives
1. `StatCard.tsx`
2. `FeatureCell.tsx`
3. `IdeaCard.tsx`
4. `Toast.tsx`
5. `ProgressBar.tsx`
6. `Terminal.tsx`

### Step 4: Sections (top-to-bottom)
1. `Nav.tsx` — with mobile hamburger overlay
2. `HeroSection.tsx` — liquid glass + stagger + stats + terminal mockup
3. `TickerSection.tsx` — dark bar with infinite scroll
4. `DemoSection.tsx` — 3 auto-tabs, extension popup, ideas
5. `HowItWorksSection.tsx` — 3 step cards with animated icons
6. `FeaturesSection.tsx` — 2×3 grid with hover ornaments
7. `TokenSection.tsx` — dark card + particles + shimmer text
8. `Footer.tsx` — placeholders

### Step 5: Integration
1. Compose all sections in `app/page.tsx`
2. Wire up toast, nav scroll, canvas initialization

### Step 6: Verification
- `npm run lint`
- `npm run build`
- Visual parity check, responsive, reduced-motion

---

## Animations (Keyframes to Add in globals.css)

| Keyframe | Source Line | Used In |
|----------|-------------|---------|
| `blurIn` | 25 | Hero text stagger |
| `eyepulse` | 26 | Nav dot |
| `ticker` | 27 | Ticker section |
| `blinkcur` | 28 | Terminal cursor |
| `toastIn` | 29 | Toast notification |
| `shine` | 30 | Token section H2 |
| `fpIn` | 31 | Tab panels |
| `ideaIn` | 32 | Idea cards |
| `lineIn` | 33 | Terminal lines |
| `fadeIn` | 34 | Chips, ideas |
| `epblink` | 35 | Extension popup dot |
| `swDown` | 36 | GitHub icon |
| `magZ` / `magP` | 37-38 | Magnify icon |
| `rktF` / `rktT` | 39-40 | Rocket icon |
| `tlA` | 41 | Feature cell (CLAUDE.md) |
| `sfill` | 42 | Feature cell (skills) |
| `cspin` | 43 | Feature cell (clock) |
| `tpin` | 44 | Feature cell (tokens) |
| `dlb` | 45 | Feature cell (download) |
| `shp` | 46 | Feature cell (shield) |

## Tailwind v4 Notes

- Use `@theme inline` for design token utilities (`bg-ink`, `text-paper`, etc.)
- Use arbitrary values sparingly: `text-[clamp(40px,6vw,64px)]`
- `aspect-*`, `backdrop-blur-*`, `rounded-*` from design tokens
- Dynamic values (progress width, magnetic transform) still use inline `style={}`

## Verification

- `yarn lint` — no errors
- `yarn build` — successful
- Visual: pixel-match with v3.dc.html
- Interactions: all hooks clean up on unmount
- Responsive: mobile hamburger, tablet grids, desktop full
- Reduced-motion: `prefers-reduced-motion: reduce` → .01s duration
