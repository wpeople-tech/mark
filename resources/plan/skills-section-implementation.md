# Skills Section Implementation Plan

**Date:** 2026-07-17  
**Status:** Ready for implementation  
**Source:** `resources/ui/skills-section.zip` design handoff from Claude Design

---

## Overview

Add a Skills Library section to the landing page showcasing MARK's 59 curated skill patterns. Users can browse, search, filter by category, and view detailed information about each skill.

---

## Design Source Analysis

### From `MARK Landing v3.dc.html`

The design prototype includes:

1. **Skills Library Section** (lines 492-532)
   - Header with badge + title + description
   - Search bar with live count
   - Category filter pills (10 categories + "All")
   - Skill card grid (responsive, auto-fill minmax(300px, 1fr))
   - Each card shows: category badge, level badge, name, description, tech tags

2. **Skill Modal** (lines 564-595)
   - Full-screen backdrop with blur
   - Detail panel: category + level, name, description, compatible tags, markdown preview, copy button
   - Close on backdrop click or Escape key

3. **Data Structure** (lines 660-721)
   - `SKILL_DB`: 59 skills as `[category, level, name, desc, tags[]]`
   - `SKILL_CATS`: 10 category names
   - `LVL_STYLE`: Color mapping for beginner/intermediate/advanced

4. **Interactions**
   - Search filters by name/description/tags (case-insensitive)
   - Category pills toggle active state
   - Skill cards hover: border color + lift
   - Modal copy button shows "Copied ✓" feedback for 2s

---

## Files to Create/Modify

### 1. `lib/landing-data.ts`

**Add three new exports:**

```typescript
// Skill categories (10)
export const SKILL_CATS: string[]

// Level color styles
export const LVL_STYLE: Record<'beginner' | 'intermediate' | 'advanced', {
  fg: string
  bg: string
  bd: string
}>

// Skills database (59 skills)
// [category, level, name, description, tags[]]
export const SKILL_DB: [string, string, string, string, string[]][]
```

**Data source:** Lines 660-726 from `MARK Landing v3.dc.html`

---

### 2. `components/landing/sections/SkillsSection.tsx` (NEW)

**Component structure:**

```tsx
'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { useState, useMemo } from 'react'
import { SKILL_DB, SKILL_CATS, LVL_STYLE } from '@/lib/landing-data'

export function SkillsSection() {
  // State
  const [skillCat, setSkillCat] = useState('All')
  const [skillQuery, setSkillQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<typeof SKILL_DB[0] | null>(null)
  const [copied, setCopied] = useState(false)

  // Filtering logic
  const filtered = useMemo(() => { ... })
  const counts = useMemo(() => { ... })

  // Handlers
  const handleCopy = async () => { ... }
  const handleClose = () => { ... }
  const handleEscape = useCallback((e) => { ... })

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  // Scroll reveal
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal(0.15)

  return (
    <section id="skills" className="py-20 px-10 bg-paper border-t border-border">
      {/* Header */}
      <div ref={headerRef} className={...}>
        <span className="badge">Skill Library</span>
        <h2>MARK's 59 <em>skills.</em></h2>
        <p>Description...</p>
        
        {/* Search bar */}
        <div className="search-input">
          <span>⌕</span>
          <input ... />
          <span className="count">{filtered.length} skills</span>
        </div>
      </div>

      {/* Category pills */}
      <div ref={contentRef} className={...}>
        {['All', ...SKILL_CATS].map(cat => (
          <button
            key={cat}
            onClick={() => setSkillCat(cat)}
            className={skillCat === cat ? 'active' : ''}
          >
            {cat} ({counts[cat]})
          </button>
        ))}
      </div>

      {/* Skill cards grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
        {filtered.map(skill => (
          <SkillCard
            key={skill[2]}
            skill={skill}
            onClick={() => setSelectedSkill(skill)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state">No skills match "{skillQuery}"</div>
      )}

      {/* Modal */}
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          copied={copied}
          onClose={handleClose}
          onCopy={handleCopy}
        />
      )}
    </section>
  )
}
```

**Child components (in same file):**

```tsx
function SkillCard({ skill, onClick }: { skill: typeof SKILL_DB[0], onClick: () => void }) {
  const [cat, lvl, name, desc, tags] = skill
  const style = LVL_STYLE[lvl as keyof typeof LVL_STYLE]
  
  return (
    <div
      onClick={onClick}
      className="skill-card cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5"
    >
      <div className="badges">
        <span className="category-badge">{cat}</span>
        <span className="level-badge" style={{ color: style.fg, bg: style.bg, border: style.bd }}>
          {lvl}
        </span>
      </div>
      <div className="name">{name}</div>
      <div className="desc">{desc}</div>
      <div className="tags">
        {tags.map(tag => <span key={tag}>{tag}</span>)}
      </div>
    </div>
  )
}

function SkillModal({ skill, copied, onClose, onCopy }: { ... }) {
  const [cat, lvl, name, desc, tags] = skill
  const style = LVL_STYLE[lvl as keyof typeof LVL_STYLE]
  
  // Generate preview lines
  const preview = useMemo(() => {
    const words = desc.replace(/\.$/, '').split(/[,—:]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
    return [
      ...words.map(w => w[0].toUpperCase() + w.slice(1)),
      `Applied automatically when MARK detects ${tags[0]} in your repo`,
    ]
  }, [desc, tags])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn .25s ease both' }}
    >
      <div
        className="modal-panel"
        onClick={handleStopPropagation}
        style={{ animation: 'fpIn .35s cubic-bezier(.16,1,.3,1) both' }}
      >
        {/* Header with badges + close */}
        <div className="modal-header">
          <div className="badges">
            <span className="category-badge">{cat}</span>
            <span className="level-badge" style={...}>{lvl}</span>
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Content */}
        <h3>{name}</h3>
        <p>{desc}</p>

        {/* Compatible tags */}
        <div className="section-label">// Compatible with</div>
        <div className="tags">{tags.map(...)}</div>

        {/* Preview */}
        <div className="section-label">// Skill preview</div>
        <div className="code-preview">
          <div className="preview-line title">## {name}</div>
          {preview.map(line => <div key={line}>- {line}</div>)}
        </div>

        {/* Actions */}
        <div className="actions">
          <button className="primary">Full details →</button>
          <button onClick={onCopy} className="secondary">
            {copied ? 'Copied ✓' : 'Copy Skill'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Styling notes:**

- Uses existing design tokens (ink, paper, muted, border, accent, etc.)
- Level badges: beginner (green), intermediate (gold), advanced (red)
- Modal backdrop: `rgba(15,15,14,.45)` + `blur(4px)`
- Code preview: dark terminal style (`#0B0B0A` bg, Geist Mono, syntax colors)

---

### 3. `app/page.tsx`

**Change:** Add `SkillsSection` import and render

```tsx
import { SkillsSection } from '@/components/landing/sections/SkillsSection'

// ...in JSX:
<FeaturesSection />
<SkillsSection />
<TokenSection />
```

---

### 4. `components/landing/sections/Nav.tsx`

**Change:** Add "Skills" link

**Desktop nav** (line 67-77):

```tsx
<button onClick={() => handleAnchor('demo')} className={linkClass}>
  How it works
</button>
<button onClick={() => handleAnchor('features')} className={linkClass}>
  Features
</button>
<button onClick={() => handleAnchor('skills')} className={linkClass}>
  Skills
</button>
<button onClick={() => handleAnchor('token')} className={linkClass}>
  $MARK
</button>
```

**Mobile nav** (line 136-165):

```tsx
<button onClick={() => handleAnchor('demo')} className={mobileLinkClass}>
  How it works
</button>
<button onClick={() => handleAnchor('features')} className={mobileLinkClass}>
  Features
</button>
<button onClick={() => handleAnchor('skills')} className={mobileLinkClass}>
  Skills
</button>
<button onClick={() => handleAnchor('token')} className={mobileLinkClass}>
  $MARK
</button>
```

---

## Design Tokens & Animations

### Colors (from prototype)

| Element | Light Mode |
|---------|-----------|
| Background | `#F7F6F3` (paper) |
| Card bg | `#ffffff` |
| Text primary | `#0F0F0E` (ink) |
| Text muted | `#888785` |
| Border | `#E5E3DC` |
| Accent | `#1A47A8` |
| Accent bg | `#EBF2FF` |
| Accent border | `#C3D7F7` |
| Success | `#1B6B28` / `#E9F5E9` / `#B6DEB9` |
| Warning | `#8a6d1a` / `#FBF4DF` / `#E8D9A8` |
| Danger | `#7a2f2f` / `#F9E9E9` / `#E5C3C3` |

### Level badge colors

```typescript
{
  beginner: { fg: '#1B6B28', bg: '#E9F5E9', bd: '#B6DEB9' },
  intermediate: { fg: '#8a6d1a', bg: '#FBF4DF', bd: '#E8D9A8' },
  advanced: { fg: '#7a2f2f', bg: '#F9E9E9', bd: '#E5C3C3' },
}
```

### Animations (already in globals.css)

- `fadeIn` — opacity 0→1
- `fpIn` — fade + translateY(10px)→0 (modal panel)
- Scroll reveal uses existing `useScrollReveal` hook

---

## Acceptance Criteria

- [ ] Skills section renders between Features and Token sections
- [ ] Nav includes "Skills" link (desktop + mobile)
- [ ] Search input filters skills by name/description/tags (case-insensitive, live)
- [ ] Category pills show counts and toggle active state
- [ ] Skill cards display category, level, name, description, tags
- [ ] Skill card hover: border → accent, lift 2px
- [ ] Click card → modal with full details
- [ ] Modal shows preview markdown lines (3 from description + auto-apply note)
- [ ] Copy button copies markdown to clipboard, shows "Copied ✓" for 2s
- [ ] Modal closes on backdrop click or Escape key
- [ ] Empty state shown when no skills match query
- [ ] Scroll reveal animations match existing sections
- [ ] Responsive: cards stack on mobile, modal scrolls on small screens

---

## Testing Checklist

1. **Search functionality**
   - Type "react" → filters to React-related skills
   - Type "auth" → filters to auth skills
   - Empty query → shows all skills

2. **Category filtering**
   - Click "Testing" → shows only Testing category skills
   - Click "All" → shows all skills again
   - Counts update correctly

3. **Modal interactions**
   - Click skill card → modal opens
   - Click backdrop → modal closes
   - Press Escape → modal closes
   - Click close X → modal closes
   - Click Copy → clipboard receives markdown, button shows "Copied ✓"

4. **Responsive behavior**
   - Desktop: 3-4 cards per row
   - Tablet: 2 cards per row
   - Mobile: 1 card per row, modal full width

5. **Animations**
   - Section fades in on scroll (like other sections)
   - Modal backdrop fades in (.25s)
   - Modal panel slides up (.35s cubic-bezier)

---

## Implementation Order

1. **Data layer** — Add SKILL_DB, SKILL_CATS, LVL_STYLE to `lib/landing-data.ts`
2. **Component** — Build SkillsSection with child components (SkillCard, SkillModal)
3. **Integration** — Import and render in `app/page.tsx`
4. **Navigation** — Add "Skills" link to Nav component
5. **Verification** — Run `npm run lint` and `npm run build`
6. **Manual test** — Check all acceptance criteria

---

## Notes

- This is a **read-only library browse** — not connected to live scan results
- The 59 skills shown here are the full curated list (same as backend `SKILL_MAP` but UI-formatted)
- Modal "Full details →" button currently shows toast (future: could link to `/skills/[slug]` when that page is built)
- Copy functionality uses `navigator.clipboard.writeText()` with fallback graceful degradation
- Skill preview generation mirrors the prototype logic: extract first 3 phrases from description + auto-apply note

---

## Design Fidelity Notes

- Exact match to `MARK Landing v3.dc.html` (lines 492-595)
- Uses existing design system tokens (no new colors needed)
- Follows existing section pattern (badge + h2 + description + content)
- Modal follows existing Toast/InstallGuide overlay pattern
- All animations use existing keyframes from `globals.css`

---

**Status:** Ready to implement ✓
