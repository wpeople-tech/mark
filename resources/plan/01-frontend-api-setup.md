# Plan 01 — Project Scaffolding (Env + Styling + Config)

## Goal
Set up the MARK Intelligence Next.js 16 project foundation: environment variables, full Tailwind v4 design system, metadata, and root config files. No core features (API routes, lib modules, landing page) — those come in later phases.

## Scope

| Included | Deferred to later phase |
|---|---|
| `.env.example` | `lib/` modules (github, detectStack, etc.) |
| `app/globals.css` — full design system | `app/api/` routes (forge, opportunities) |
| `app/layout.tsx` — metadata + fonts | Landing page content from `resources/ui/animation-showcase.html` |
| `vercel.json` — function timeouts | Any core business logic |
| `next.config.ts` | |
| Remove default CNA boilerplate | |

## Steps

### Step 1: Environment Variables
**Files:** `.env.example` (NEW)
- Create `.env.example` with all required vars (empty values) as documentation
- User will create `.env.local` manually with actual values

Variables:
```
OPENROUTER_API_KEY=
GITHUB_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Design System — `app/globals.css`
**File:** `app/globals.css`
- Replace default Next.js boilerplate with full MARK design tokens
- No packages to install for styling — Tailwind v4 + `@tailwindcss/postcss` already in `package.json`

**CSS custom properties to define:**
- **Colors** (17 vars): --ink, --paper, --surface, --border, --muted, --accent, --accent-bg, --accent-border, --green, --green-bg, --green-border, --term-bg, --term-text, --term-green, --term-blue, --term-yellow, --term-dim
- **Typography** (7 vars): --text-hero (clamp), --text-h2 (clamp), --text-token (clamp), --text-base, --text-sm, --text-xs, --text-mono
- **Border radius** (6 vars): --radius-sm, --radius, --radius-md, --radius-card, --radius-lg, --radius-pill
- **Spacing** (8 vars on 8px grid): 4px through 80px
- **Shadows** (2 vars + nav backdrop-filter)

**Tailwind v4 `@theme` block:**
- `--color-*` for each color
- `--font-sans` / `--font-mono`
- `--radius-*` for each radius
- `--shadow-*` for shadows
- `--text-*` for type scale

### Step 3: Metadata & Fonts — `app/layout.tsx`
**File:** `app/layout.tsx`
- Update `<html>` className to use Geist variables
- Remove dark mode class references
- Set metadata: title (`MARK Intelligence`), description, OpenGraph, Twitter card
- Keep `next/font/google` Geist font setup (already correct)

### Step 4: Clean Up Boilerplate — `app/page.tsx`
**File:** `app/page.tsx`
- Remove all default Create Next App content (Next.js logo, links, deploy buttons)
- Replace with a simple minimal placeholder (just `<main>` with the MARK logo text)
- Landing page port from `resources/ui/landing-page.html` comes in later phase

### Step 5: Root Config Files
**File:** `vercel.json` (NEW)
```json
{
  "functions": {
    "app/api/forge/route.ts": { "maxDuration": 60 },
    "app/api/opportunities/route.ts": { "maxDuration": 30 }
  }
}
```
(Config created now even though routes don't exist yet — ensures deployment won't break later.)

**File:** `next.config.ts` — no changes needed (default is fine)

---

## Packages Required

None for this phase. All styling deps already in `package.json`:
- `next@16.2.10`, `react@19.2.4`, `react-dom@19.2.4`
- `tailwindcss@^4`, `@tailwindcss/postcss@^4`
- `typescript@^5`, `@types/node`, `@types/react`, `@types/react-dom`

Core packages (`openai`, `@upstash/ratelimit`, `@upstash/redis`, `fflate`) will be added in the next phase when lib modules are implemented.

## Files Changed/Created (total: 5)

| Action | File |
|---|---|
| **Create** | `.env.example` |
| **Modify** | `app/globals.css` |
| **Modify** | `app/layout.tsx` |
| **Modify** | `app/page.tsx` |
| **Create** | `vercel.json` |

## Verification

```bash
yarn lint     # ESLint check
yarn build    # TypeScript + Next.js build
```
