---
name: mark-intelligence
description: Use for developing MARK Intelligence — a Next.js 16 landing page + API + Chrome Extension that scans GitHub repos and generates CLAUDE.md files + pump.fun build opportunities. Trigger on any MARK-related dev work: landing page, API routes, design system, liquid glass animation, Chrome Extension, or build planning.
---

# MARK Intelligence — Project Skill

## Project Overview

**MARK** (Markdown Intelligence) is a Next.js 16 app + Chrome Extension. Users click the extension on any GitHub repo page, and in ~30 seconds it:
1. Generates a **CLAUDE.md** (repo intelligence report with architecture, stack, patterns, skill files)
2. Generates **3 Build Opportunities** (utility website ideas for pump.fun launch)

**Domain:** markintel.tech | **Token:** $MARK on pump.fun | **Deployment:** Vercel Hobby Plan

### Target Audience
Crypto builders who scroll GitHub for interesting repos, build utility websites on top, and launch tokens on pump.fun.

---

## Design System

### Colors
```
--ink:          #0F0F0E   (near-black — primary text, buttons)
--paper:        #F7F6F3   (warm off-white — main background)
--surface:      #EFEFEB   (warm grey — cards, icon backgrounds)
--border:       #E5E3DC   (subtle warm border)
--muted:        #888785   (secondary text, labels)

--accent:       #1A47A8   (royal blue — interactive, tokens)
--accent-bg:    #EBF2FF   (light blue — badge backgrounds)
--accent-border:#C3D7F7   (blue border)

--green:        #1B6B28   (dark green — "pump.fun viable" text)
--green-bg:     #E9F5E9   (light green — badge background)
--green-border: #B6DEB9   (green border)

--term-bg:      #0B0B0A   (terminal background)
--term-text:    #E8E6E0   (terminal default text)
--term-green:   #6DBE8A   (success output)
--term-blue:    #7DAEEA   (command / key output)
--term-yellow:  #E8C56A   (heading / warning output)
--term-dim:     #444442   (dimmed / comment output)
```

### Typography
```
--font-sans: 'Geist', system-ui, -apple-system, sans-serif
--font-mono: 'Geist Mono', 'Fira Code', monospace

--text-hero:   clamp(40px, 6vw, 64px)   (hero H1)
--text-h2:     clamp(26px, 3.5vw, 32px) (section H2)
--text-token:  clamp(36px, 6vw, 60px)   (token section H2)
--text-base:   15px                      (body)
--text-sm:     13px                      (secondary)
--text-xs:    11px                       (labels, meta)
--text-mono:  11px                       (mono labels)

Weights: 700 (display/headings), 600 (subheadings/buttons), 500 (labels/nav), 400 (body)
```

### Border Radius
```
--radius-sm:   4px   (tags, badges)
--radius:      8px   (buttons, inputs)
--radius-md:   10px  (popups, extension cards)
--radius-card: 14px  (section cards)
--radius-lg:   16px  (large cards, mockups)
--radius-pill: 99px  (pill badges)
```

### Borders
All borders: `.5px solid var(--border)` — never thicker.

### Spacing (8px grid)
```
4px   — gap antar badge/chip
8px   — tight spacing (icon padding, small gaps)
12px  — medium tight
16px  — standard component gap
24px  — card padding
32px  — section internal spacing
48px  — section gap kecil
80px  — section padding (top/bottom)
```

### Shadows
```
Extension popup:   0 12px 40px rgba(0,0,0,.14)
Demo cards:        0 8px 32px rgba(0,0,0,.08)
Nav backdrop:      backdrop-filter: blur(12px)
```

### Liquid Glass (Hero + Extension Glass Zone)
- Canvas 2D metaball blobs
- Colors: warm off-white transparent (hsla(42, 18%, 95-98%, 0.3-0.6))
- Shimmer: linear gradient putih transparan di sisi atas-kiri setiap blob
- Edge: stroke rgba(200,198,192,0.22) tipis di perimeter blob
- Mouse: blob tertarik ke arah kursor (pull factor 0.08-0.09)

---

## Project Structure

```
markintel.tech/
├── app/
│   ├── layout.tsx           ← Root layout (Geist font, metadata)
│   ├── page.tsx             ← Landing page (client component with animations)
│   ├── globals.css          ← Tailwind + design tokens
│   └── api/
│       ├── forge/route.ts    ← POST — scan + MARK File (SSE streaming, 60s timeout)
│       └── opportunities/route.ts ← POST — generate 3 build ideas (30s timeout)
├── lib/
│   ├── github.ts            ← packRepo() — GitHub API manifest fetch
│   ├── detectStack.ts       ← stack keyword scoring (27 stack patterns)
│   ├── selectSkills.ts      ← top 6-8 skill selector dari 59 skills
│   ├── buildZip.ts          ← fflate ZIP builder
│   ├── claude.ts            ← Anthropic SDK + retry logic + system prompts
│   └── rateLimit.ts         ← Upstash Redis sliding window (5 scans/24h)
├── public/
│   ├── og-image.png         ← 1200×630px
│   └── favicon.ico
├── extension/               ← Chrome Extension (separate section below)
├── vercel.json              ← function timeout config (WAJIB)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## API Routes

### POST /api/forge — Scan repo + generate MARK File (SSE streaming)
- **Runtime:** `nodejs` (fflate needs Node.js)
- **Timeout:** 60s (configured in vercel.json)
- **Input:** `{ owner, repo }`
- **Output:** SSE stream with events:
  - `{ type: 'status', message, remaining }` — progress updates
  - `{ type: 'stack', tags }` — detected tech stack
  - `{ type: 'skills', skills, count }` — matched skills
  - `{ type: 'content', text }` — streamed CLAUDE.md content
  - `{ type: 'done', zipBase64, markFile, tags, skills, repoName }` — complete
  - `{ type: 'error', message }` — error
- **CORS:** Allows `chrome-extension://` origins and `NEXT_PUBLIC_APP_URL`

### POST /api/opportunities — Generate build ideas
- **Runtime:** `nodejs`
- **Timeout:** 30s
- **Input:** `{ markFile, repoName, stack }`
- **Output:** `{ ideas: [...] }`
- **CORS:** `*`

---

## Library Modules

### lib/github.ts
- `packRepo(owner, repo)` → manifest content string (capped at 32KB)
- Fetches default branch, file tree, then reads up to 20 known manifest files
- Uses `GITHUB_TOKEN` env var if available

### lib/detectStack.ts
- `detectStack(context)` → string[] of detected tags
- 27 stack patterns (nextjs, react, typescript, tailwind, prisma, python, rust, golang, cpp, docker, supabase, redis, vercel, openai, anthropic, etc.)

### lib/selectSkills.ts
- `selectSkills(tags, maxSkills = 8)` → string[] of top matching skills
- 59 skills mapped to relevant stack tags

### lib/claude.ts
- `streamMarkFile(context, tags, skills)` — SSE streaming via Anthropic SDK
- `generateOpportunities(markFile, repoName, stack)` — returns array of ideas
- Retry logic (3 attempts) for 429 rate limits
- System prompts for both MARK file generation and opportunity generation

### lib/buildZip.ts
- `buildZip(markFile, skills, owner, repo)` → base64 ZIP string
- Contains CLAUDE.md + SETUP_GUIDE.md + selected skill files
- Uses `fflate` for ZIP creation

### lib/rateLimit.ts
- `checkRateLimit(ip)` → `{ success, remaining, reset }`
- Sliding window: 5 scans per 24h per IP
- Uses Upstash Redis

---

## Chrome Extension Structure

```
extension/
├── manifest.json
├── pages/popup/
│   ├── index.html
│   └── index.tsx            ← Popup UI (React)
├── src/
│   ├── background/index.ts  ← Service worker (fetch + SSE handling)
│   ├── content/index.ts     ← GitHub URL detection + storage
│   └── lib/
│       ├── types.ts          ← Shared types (ScanState, RepoInfo, BuildIdea, TerminalLine)
│       └── constants.ts      ← API_BASE, endpoints, MAX_SCANS_PER_DAY
└── public/icons/
    ├── icon16.png, icon32.png, icon48.png, icon128.png
```

### Key Extension Details
- **Manifest V3**
- **Permissions:** storage, tabs, activeTab
- **Host permissions:** github.com/*, markintel.tech/*
- **Content script:** Runs on `https://github.com/*/*`, extracts owner/repo from URL, saves to `chrome.storage.local`
- **Popup:** 360px wide, React, shows scan status, tabs (Mark File / Build Opportunities), download buttons
- **Service worker:** Handles START_SCAN message, reads SSE stream from /api/forge, updates chrome.storage, broadcasts to popup via `chrome.runtime.sendMessage`

---

## Constraints

### Vercel Hobby Plan Limits
| Resource | Limit |
|---|---|
| Function duration | 10s default, 60s max (via vercel.json) |
| Functions per project | 12 (we use 2) |
| Bandwidth | 100 GB/month |
| Custom domain | 1 per project (markintel.tech) |

### vercel.json (REQUIRED)
```json
{
  "functions": {
    "app/api/forge/route.ts": { "maxDuration": 60 },
    "app/api/opportunities/route.ts": { "maxDuration": 30 }
  }
}
```

### Environment Variables (in .env.local)
```
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
NEXT_PUBLIC_APP_URL=https://markintel.tech
```

### Costs (MVP)
- **Fixed:** $15 ($10 domain + $5 Chrome Web Store)
- **Variable:** ~$0.065/scan (Anthropic API)
- **Free tier:** Vercel Hobby, Upstash Redis (10k req/day), GitHub API with token (5k req/hr)

---

## Next.js 16 Cautions

This project uses **Next.js 16.2.10** with breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Known differences from older versions:
- Tailwind v4 used (via `@tailwindcss/postcss`), not v3 — different config approach
- React 19 (server components, improved hooks)
- Check docs for any API route or middleware changes

---

## Development Workflow

1. **Plan first** — every step starts with a plan file in `resources/plan/`
2. **Implement** — code the plan, one file/section at a time
3. **Verify** — run `yarn lint` and `yarn build` after each step
4. **Reference** — always use design tokens from this skill, never guess colors/spacing
5. **Extension** — built separate from the Next.js app; uses the boilerplate at `https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite`
6. **Deployment** — Vercel CLI or GitHub integration; set env vars in Vercel Dashboard

### Building Order (suggested)
1. Design system (globals.css with design tokens)
2. Landing page (port from PRD JSX)
3. Library modules (github, detectStack, selectSkills)
4. API routes (forge, opportunities) + claude.ts
5. Rate limiting + ZIP building
6. Chrome Extension
7. Deployment + Chrome Web Store assets
