## Plan: Restructure DemoSection to Match v3 Design

### Objective
Restructure the `DemoSection.tsx` component to match the two-column grid layout and incorporate the new mascot visual as defined in `MARK Landing v3.dc.html`.

### Current State
- `DemoSection.tsx` uses a single-column, centered layout for tabs and panels.
- Header and content are centrally aligned.
- Animations for tabs are controlled by `useAutoAdvanceTabs` and `useEffect`.

### Target State (from v3.dc.html)
- Two-column grid layout for the main content area of the Demo section.
  - Left column: Contains the header (left-aligned) and the existing tabbed panels (Scan, Mark File, Build Ideas).
  - Right column: Contains a new "mascot" visual — a cat image with floating badges and cursor-follow tilt interaction.
- Specific styles and animations for the mascot panel and its elements.

### Step-by-Step Implementation

**Step 1: Check + Add Animation Keyframe (app/globals.css)**
- **Status:** Completed. `rktF` keyframe already exists in `app/globals.css` (line 267).

**Step 2: Add Mascot Badge Data (lib/landing-data.ts)**
- Add a new exported constant `MASCOT_BADGES` containing the data for the three floating badges.

**Step 3: Create `<MascotPanel />` Component (components/landing/ui/MascotPanel.tsx)**
- Create a new React component that encapsulates the mascot image, the floating badges, and the cursor-follow tilt effect.
- Utilize the `MASCOT_BADGES` data.
- Implement mouse event handlers for the tilt effect.

**Step 4: Rewrite `DemoSection.tsx` (components/landing/sections/DemoSection.tsx)**
- Modify the main rendering logic of `DemoSection` to implement the two-column grid.
- Adjust the header's styling for left-alignment.
- Integrate the newly created `<MascotPanel />` into the right column of the grid.
- Ensure all existing tab animation logic remains functional within the left column.

**Step 5: Verify**
- Run `npm run lint` to catch any linting errors.
- Run `npm run build` to ensure the project compiles without errors.
- Manually check the demo section in the browser for visual correctness, layout, animations, and responsiveness (especially the grid collapsing on smaller screens).

### Detailed Changes for Each Step

**Step 2: `lib/landing-data.ts`**
```typescript
export const MASCOT_BADGES = [
  { label: 'scanning repo…', bg: '#EBF2FF', fg: '#1A47A8', bd: '#C3D7F7', pos: 'top:6%;left:-4%', delay: '0s' },
  { label: '8 skills matched ✓', bg: '#E9F5E9', fg: '#1B6B28', bd: '#B6DEB9', pos: 'top:30%;right:-8%', delay: '.8s' },
  { label: '$MARK', bg: '#F7F6F3', fg: '#888785', bd: '#E5E3DC', pos: 'bottom:12%;left:-2%', delay: '1.6s' },
]
```

**Step 3: `components/landing/ui/MascotPanel.tsx`**
```tsx
'use client'

import { useRef, useState } from 'react'
import { MASCOT_BADGES } from '@/lib/landing-data'

export function MascotPanel() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: nx * 8, y: ny * 10 })
  }

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <div className="relative flex flex-col items-center justify-center min-w-0">
      <div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[360px]"
      >
        {MASCOT_BADGES.map((badge, i) => (
          <span
            key={i}
            className="absolute text-[10px] font-mono px-[10px] py-[3px] rounded-pill shadow-card"
            style={{
              [badge.pos.split(':')[0]]: badge.pos.split(':')[1].split(';')[0],
              [badge.pos.split(';')[1].split(':')[0]]: badge.pos.split(';')[1].split(':')[1],
              background: badge.bg,
              color: badge.fg,
              border: `.5px solid ${badge.bd}`,
              animation: `rktF 3.2s ease-in-out infinite ${badge.delay}`,
            }}
          >
            {badge.label}
          </span>
        ))}
        <div
          className="w-full transition-transform duration-300 ease-out"
          style={{
            transform: `rotate(${tilt.x}deg) translate(${tilt.y}px, ${tilt.y}px) scale(1.04)`,
          }}
        >
          <img
            src="/uploads/mark-image.png"
            alt="MARK mascot"
            className="w-full h-auto block"
            style={{
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.12))',
              animation: 'rktF 4s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      <div className="text-[11px] font-mono text-muted mt-2 text-center">
        MARK — your repo intelligence cat
      </div>
    </div>
  )
}
```

**Step 4: `components/landing/sections/DemoSection.tsx`**
- **Import:**
  ```typescript
  import { MascotPanel } from '../ui/MascotPanel'
  import {
    EP_CHIPS,
    EP_LINES,
    IDEAS,
    MF_LINES,
    TAB_DUR,
    MASCOT_BADGES, // Add this import
  } from '@/lib/landing-data'
  ```

- **Update `section` tag and its direct child:**
  ```tsx
  <section id="demo" className="py-20 px-10 bg-paper">
    <div className="max-w-[1080px] mx-auto grid md:grid-cols-[minmax(0,640px)_1fr] grid-cols-1 gap-12 items-center">
      {/* Existing header and tabs/panels go here */}
      <div>
        <div
          ref={headerRef}
          className={`flex flex-col items-start text-left mb-10 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* ... rest of the header content */}
        </div>

        <div
          ref={tabsRef}
          className={`max-w-[640px] transition-all duration-700 ${ // Removed mx-auto here
            tabsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* ... rest of the tabs content */}
        </div>
      </div>

      {/* Add MascotPanel here */}
      <MascotPanel />
    </div>
  </section>
  ```
