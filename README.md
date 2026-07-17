# Product Requirements Document
# MARK Intelligence

**Version:** 1.0  
**Status:** Ready for Development  
**Domain:** markintel.tech  
**Token:** $MARK on pump.fun  
**Deployment:** Vercel Hobby Plan (single project)  
**Platform:** Chrome Extension + Landing Page

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [User Flow](#3-user-flow)
4. [Design Tokens](#4-design-tokens)
5. [Next.js Implementation — Landing Page + Core Functions](#5-nextjs-implementation)
6. [Chrome Extension Implementation](#6-chrome-extension-implementation)
7. [Constraints & Infrastructure](#7-constraints--infrastructure)

---

## 1. Product Overview

### Nama
**MARK Intelligence**

Singkatan dari **M**ark**D**own Intelligence. "Mark" diambil dari MD (Markdown / CLAUDE.md), sekaligus menjadi nama karakter produk ini.

### Apa ini
MARK Intelligence adalah **Chrome Extension** yang bisa dibuka di atas halaman GitHub repo mana saja. Satu klik, extension membaca dan menganalisis repo yang sedang dibuka, menghasilkan dua output utama:

1. **MARK File** — sebuah CLAUDE.md yang detail dan siap pakai, berisi arsitektur, stack, pattern, dan skill files yang relevan dengan codebase tersebut.

2. **Build Opportunities** — 3 ide utility website yang bisa dibangun berdasarkan kapabilitas teknikal repo tersebut, lengkap dengan nama website, domain suggestion, token ticker untuk pump.fun launch, dan angle bisnis kenapa layak diluncurkan.

Produk ini juga memiliki **landing page** di `markintel.tech` yang berfungsi sebagai marketing page sekaligus demo interaktif untuk pump.fun launch.

### Posisi produk
MARK bukan developer tool biasa. Target penggunanya adalah **crypto builder** — orang yang rutin scroll GitHub untuk mencari repo menarik, lalu membangun utility website di atasnya dan me-launch token di pump.fun. MARK mengotomatisasi dua hal yang biasanya dilakukan manual: memahami codebase orang lain, dan menemukan peluang bisnis dari codebase tersebut.

### Token
**$MARK** akan diluncurkan di pump.fun bersamaan dengan atau sesaat setelah Chrome Extension live. Angle token: ironi yang bagus — tool yang membantu builder menemukan ide token, sendirinya adalah token.

---

## 2. Problem Statement

### Konteks
Ekosistem pump.fun dan crypto builder culture punya pola yang berulang: seseorang menemukan repo menarik di GitHub → membangun utility website di atasnya → launch token. Pola ini terbukti berhasil (contoh: tools berbasis Claude, Whisper, Supabase, LangChain semuanya sudah ada versi token-nya).

### Masalah yang ada
Proses ini saat ini dilakukan secara manual dan lambat:

**Masalah 1 — Memahami codebase orang lain butuh waktu**  
Ketika seorang builder membuka repo trending, mereka harus membaca README, menelusuri file structure, memahami dependencies, dan menyimpulkan "repo ini sebenarnya bisa dipakai untuk apa." Ini bisa makan 15-30 menit per repo, bahkan lebih.

**Masalah 2 — Dari "repo menarik" ke "ide konkret" masih ada gap besar**  
Bahkan setelah paham repo-nya, memikirkan utility website yang viable — dengan nama yang bagus, angle pump.fun yang masuk akal, dan build effort yang realistis — butuh sesi brainstorming tersendiri.

**Masalah 3 — Setup Claude Code untuk repo baru selalu dari nol**  
Setiap kali mulai membangun di atas repo orang lain, developer harus manually menulis CLAUDE.md atau biarkan Claude Code "bingung" karena tidak ada context file.

### Solusi MARK
MARK menyelesaikan ketiga masalah ini dalam satu klik, 30 detik:
- Baca dan pahami repo → otomatis
- Temukan peluang bisnis → otomatis
- Generate CLAUDE.md siap pakai → otomatis

---

## 3. User Flow

### Primary Flow (Extension)

```
1. USER BROWSE GITHUB
   └─ Buka halaman repo: github.com/owner/repo
   └─ Content script MARK aktif otomatis, detect URL
   └─ Simpan { owner, repo } ke chrome.storage.local

2. USER KLIK ICON MARK
   └─ Icon MARK muncul di browser toolbar
   └─ User klik → popup terbuka (360px wide)
   └─ Popup baca chrome.storage → tampilkan repo yang sedang dibuka
   └─ Tombol "Scan" atau auto-scan langsung

3. SCAN BERJALAN (SSE streaming)
   └─ Popup kirim request ke markintel.tech/api/forge
   └─ Service worker handle fetch, forward events ke popup
   └─ Liquid glass animation aktif di glass zone popup
   └─ Terminal stream per baris:
       · "Reading manifest files..."
       · "→ Stack: C++ · Python · CMake"
       · "→ Matching 59 skill patterns..."
       · "→ 6 skills matched ✓"
       · "→ Generating MARK File..."
       · "→ Build ideas generated ✓"
   └─ Stack chip muncul satu per satu di glass zone

4. OUTPUT — TAB 1: MARK FILE
   └─ CLAUDE.md content tampil di terminal (scrollable)
   └─ Stack tags row
   └─ Skill match progress bar
   └─ File download row:
       - CLAUDE.md (download individual)
       - mark-output.zip (CLAUDE.md + skill files + setup guide)

5. OUTPUT — TAB 2: BUILD OPPORTUNITIES
   └─ API call kedua ke /api/opportunities (non-blocking)
   └─ 3 idea cards muncul satu per satu:
       - Nama website
       - Domain suggestion
       - Token ticker ($TICKER)
       - Value prop 1 kalimat
       - "pump.fun viable ✓" badge
       - Estimated build effort
   └─ Footer: "From owner/repo — generated in Xs"

6. DOWNLOAD
   └─ User klik download ZIP → trigger download otomatis
   └─ ZIP berisi: CLAUDE.md + selected skill files + SETUP_GUIDE.md
   └─ User bisa "Rescan" untuk repo lain atau tab berbeda

7. RATE LIMIT
   └─ Jika sudah 5 scan hari ini:
       - Tampil pesan "You've used 5/5 scans today. Come back tomorrow."
       - Tombol scan di-disable
       - Counter reset jam 00:00 UTC
```

### Secondary Flow (Landing Page)

```
1. DISCOVER
   └─ User datang dari X/Twitter, pump.fun, atau search
   └─ Lihat hero: "Read any repo. Find your next build."
   └─ Liquid glass animation + stack chips muncul di hero

2. UNDERSTAND
   └─ Scroll ke Demo Section (Feature Tab Demo)
       - Tab Scan: lihat browser mockup + extension popup animation
       - Tab Mark File: lihat CLAUDE.md streaming
       - Tab Build Ideas: lihat 3 cards muncul
   └─ Scroll ke How It Works: 3 step dengan animated icons
   └─ Scroll ke Features Grid: hover tiap cell untuk micro-animation

3. CONVERT
   └─ Klik "Add to Chrome" → toast "Coming to Chrome Web Store soon"
   └─ (Post-launch: redirect ke Chrome Web Store listing)
   └─ Scroll ke Token Section: buy $MARK

4. RETURN
   └─ User yang sudah install extension balik ke GitHub
   └─ Extension aktif otomatis di setiap halaman github.com/*/*
```

---

## 4. Design Tokens

### Color Palette

```css
:root {
  /* Core */
  --ink:          #0F0F0E;   /* near-black — primary text, buttons */
  --paper:        #F7F6F3;   /* warm off-white — main background */
  --surface:      #EFEFEB;   /* warm grey — cards, icon backgrounds */
  --border:       #E5E3DC;   /* subtle warm border */
  --muted:        #888785;   /* secondary text, labels */

  /* Accent */
  --accent:       #1A47A8;   /* royal blue — interactive, tokens */
  --accent-bg:    #EBF2FF;   /* light blue — badge backgrounds */
  --accent-border:#C3D7F7;   /* blue border */

  /* Success / pump.fun */
  --green:        #1B6B28;   /* dark green — "pump.fun viable" text */
  --green-bg:     #E9F5E9;   /* light green — badge background */
  --green-border: #B6DEB9;   /* green border */

  /* Terminal (dark surfaces) */
  --term-bg:      #0B0B0A;   /* terminal background */
  --term-text:    #E8E6E0;   /* terminal default text */
  --term-green:   #6DBE8A;   /* success output */
  --term-blue:    #7DAEEA;   /* command / key output */
  --term-yellow:  #E8C56A;   /* heading / warning output */
  --term-dim:     #444442;   /* dimmed / comment output */
}
```

### Typography

```css
:root {
  --font-sans: 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'Fira Code', monospace;
}

/* Fluid type scale */
:root {
  --text-hero:   clamp(40px, 6vw, 64px);    /* hero H1 */
  --text-h2:     clamp(26px, 3.5vw, 32px);  /* section H2 */
  --text-token:  clamp(36px, 6vw, 60px);    /* token section H2 */
  --text-base:   15px;                       /* body */
  --text-sm:     13px;                       /* secondary */
  --text-xs:     11px;                       /* labels, meta */
  --text-mono:   11px;                       /* mono labels */
}

/* Font weights */
/* 700 — display, headings */
/* 600 — subheadings, buttons */
/* 500 — labels, nav */
/* 400 — body */
```

### Border Radius

```css
:root {
  --radius-sm:   4px;    /* tags, badges */
  --radius:      8px;    /* buttons, inputs */
  --radius-md:   10px;   /* popups, extension cards */
  --radius-card: 14px;   /* section cards */
  --radius-lg:   16px;   /* large cards, mockups */
  --radius-pill: 99px;   /* pill badges */
}
```

### Borders

```
Semua border: .5px solid var(--border)
Tidak ada border yang lebih tebal dari .5px di design ini.
```

### Spacing System (8px grid)

```
4px  — gap antar badge/chip
8px  — tight spacing (icon padding, small gaps)
12px — medium tight
16px — standard component gap
24px — card padding
32px — section internal spacing
48px — section gap kecil
80px — section padding (top/bottom)
```

### Shadow

```css
/* Extension popup */
box-shadow: 0 12px 40px rgba(0,0,0,.14);

/* Demo cards */
box-shadow: 0 8px 32px rgba(0,0,0,.08);

/* Nav backdrop */
backdrop-filter: blur(12px);
```

### Liquid Glass (Hero + Extension Glass Zone)

```
Technique: Canvas 2D metaball blobs
Colors: warm off-white transparan (hsla(42, 18%, 95-98%, 0.3-0.6))
Shimmer: linear gradient putih transparan di sisi atas-kiri setiap blob
Edge: stroke rgba(200,198,192,0.22) tipis di perimeter blob
Mouse: blob tertarik ke arah kursor (pull factor 0.08-0.09)
```

---

## 5. Next.js Implementation

### 5.1 Project Structure

```
markintel.tech/               ← Single Vercel Project
├── app/
│   ├── layout.tsx           ← Root layout (Geist font, metadata)
│   ├── page.tsx             ← Landing page (seluruh HTML index.html diport ke sini)
│   ├── globals.css          ← Semua CSS dari index.html
│   └── api/
│       ├── forge/
│       │   └── route.ts     ← POST — scan + MARK File (SSE streaming)
│       └── opportunities/
│           └── route.ts     ← POST — generate 3 build ideas
├── lib/
│   ├── github.ts            ← packRepo() — GitHub API manifest fetch
│   ├── detectStack.ts       ← stack keyword scoring
│   ├── selectSkills.ts      ← top 6-8 skill selector dari 59 skills
│   ├── buildZip.ts          ← fflate ZIP builder
│   ├── llm.ts               ← OpenRouter + retry logic (actual location)
│   └── rateLimit.ts         ← Upstash Redis sliding window
├── public/
│   ├── og-image.png         ← 1200×630px untuk Twitter/OG sharing
│   └── favicon.ico
├── vercel.json              ← function timeout config (WAJIB)
├── next.config.ts
├── package.json
└── tsconfig.json
```

### 5.2 Dependencies

```json
{
  "dependencies": {
    "next": "16.x",
    "react": "19.x",
    "react-dom": "19.x",
    "openai": "^4.86.2",
    "@upstash/ratelimit": "^2.0.8",
    "@upstash/redis": "^1.38.0",
    "fflate": "^0.8.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.24.0",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0",
    "@base-ui/react": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "shadcn": "^4.13.0"
  }
}
```

### 5.3 Environment Variables

```env
# .env.local — JANGAN commit ke git

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# GitHub (optional tapi sangat disarankan)
# Tanpa token: 60 req/hr. Dengan token: 5000 req/hr
GITHUB_TOKEN=ghp_...

# Upstash Redis (free tier — https://console.upstash.com)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...

# Public URL (untuk CORS di extension)
NEXT_PUBLIC_APP_URL=https://markintel.tech
```

Set semua env var juga di Vercel Dashboard → Project Settings → Environment Variables.

### 5.4 vercel.json (WAJIB untuk Hobby Plan)

```json
{
  "functions": {
    "app/api/forge/route.ts": {
      "maxDuration": 60
    },
    "app/api/opportunities/route.ts": {
      "maxDuration": 30
    }
  }
}
```

⚠️ Tanpa ini, semua request ke /api/forge akan timeout setelah 10 detik (default Vercel Hobby).

### 5.5 app/layout.tsx

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'MARK Intelligence — Read any repo. Find your next build.',
  description: 'Scan any GitHub repo in 30 seconds. Get a full intelligence report + 3 pump.fun-ready utility website ideas.',
  openGraph: {
    title: 'MARK Intelligence',
    description: 'Scan any GitHub repo. Get 3 pump.fun-ready ideas.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    url: 'https://markintel.tech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MARK Intelligence',
    description: 'Read any repo. Find your next build.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### 5.6 lib/rateLimit.ts

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface LimitResult {
  success: boolean
  remaining: number
  reset: number
}

function createInMemoryLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    async limit(ip: string): Promise<LimitResult> {
      const now = Date.now()
      const entry = hits.get(ip)

      if (!entry || now > entry.resetAt) {
        const resetAt = now + 24 * 60 * 60 * 1000
        hits.set(ip, { count: 1, resetAt })
        return { success: true, remaining: 4, reset: Math.ceil(resetAt / 1000) }
      }

      entry.count += 1
      if (entry.count > 5) {
        return { success: false, remaining: 0, reset: Math.ceil(entry.resetAt / 1000) }
      }

      return { success: true, remaining: 5 - entry.count, reset: Math.ceil(entry.resetAt / 1000) }
    },
  }
}

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const limiter = hasRedis
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '24h'),
      analytics: true,
      prefix: 'mark:scan',
    })
  : createInMemoryLimiter()

export async function checkRateLimit(ip: string): Promise<LimitResult> {
  const result = await limiter.limit(ip)
  return { success: result.success, remaining: result.remaining, reset: result.reset }
}
```

### 5.7 lib/llm.ts

```typescript
"use server";

import OpenAI from "openai";
import { MARK_SYSTEM_PROMPT, OPPORTUNITIES_SYSTEM_PROMPT } from "@/lib/prompts";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status === 429) {
        const retryAfter = parseInt(err.headers?.["retry-after"] ?? "5");
        await new Promise((r) =>
          setTimeout(r, retryAfter * 1000 * (attempt + 1)),
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function streamMarkFile(
  context: string,
  tags: string[],
  skills: string[],
) {
  return callWithRetry(() =>
    client.chat.completions.create({
      model: "poolside/laguna-m.1:free",
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: MARK_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Stack detected: ${tags.join(", ")}\nSelected skills: ${skills.join(", ")}\n\nManifest content:\n${context}`,
        },
      ],
      stream: true,
    }),
  );
}

export async function generateOpportunities(
  markFile: string,
  repoName: string,
  stack: string[],
): Promise<any[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await callWithRetry(() =>
        client.chat.completions.create({
          model: "poolside/laguna-m.1:free",
          max_tokens: 1500,
          messages: [
            {
              role: "system",
              content: OPPORTUNITIES_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Repo: ${repoName}\nStack: ${stack.join(", ")}\n\nMARK File:\n${markFile.slice(0, 3000)}`,
            },
          ],
        }),
      );

      const raw = response.choices[0]?.message?.content ?? "[]";
      return JSON.parse(raw.trim());
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw new Error(
    `Failed to generate opportunities after ${maxRetries} attempts: ${lastError?.message ?? "Unknown error"}`,
  );
}
```

### 5.8 lib/github.ts

```typescript
const GITHUB_API = 'https://api.github.com'
const RAW_API = 'https://raw.githubusercontent.com'

const MANIFEST_FILES = [
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile',
  'Cargo.toml', 'go.mod', 'build.gradle', 'pom.xml',
  'CMakeLists.txt', 'Makefile', 'composer.json',
  'tsconfig.json', 'next.config.js', 'next.config.ts',
  'tailwind.config.js', 'tailwind.config.ts',
  'vite.config.js', 'vite.config.ts',
  'prisma/schema.prisma', '.env.example',
  'README.md', 'README.rst',
]

function getHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MARK-Intelligence/1.0',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }
  return headers
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`Repo not found: ${owner}/${repo}`)
  const data = await res.json()
  return data.default_branch || 'main'
}

async function getFileTree(
  owner: string,
  repo: string,
  branch: string
): Promise<string[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: getHeaders() }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.tree || [])
    .filter((f: any) => f.type === 'blob')
    .map((f: any) => f.path as string)
}

async function fetchFileContent(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${RAW_API}/${owner}/${repo}/${branch}/${path}`,
      { headers: getHeaders() }
    )
    if (!res.ok) return null
    const text = await res.text()
    return text.slice(0, 2500) // cap per file
  } catch {
    return null
  }
}

export async function packRepo(owner: string, repo: string): Promise<string> {
  const branch = await getDefaultBranch(owner, repo)
  const tree = await getFileTree(owner, repo, branch)

  // Pilih manifest files yang ada di repo
  const targets = MANIFEST_FILES.filter(f => tree.includes(f)).slice(0, 20)

  // Fetch parallel, batch 10
  const results: string[] = []
  for (let i = 0; i < targets.length; i += 10) {
    const batch = targets.slice(i, i + 10)
    const contents = await Promise.all(
      batch.map(async path => {
        const content = await fetchFileContent(owner, repo, branch, path)
        return content ? `\n\n--- ${path} ---\n${content}` : null
      })
    )
    results.push(...contents.filter(Boolean) as string[])
  }

  const packed = results.join('')
  return packed.slice(0, 32000) // total cap
}
```

### 5.9 lib/detectStack.ts

```typescript
const STACK_PATTERNS: Record<string, string[]> = {
  'nextjs': ['next.config', '"next":', 'next/'],
  'react': ['"react":', 'react-dom', 'jsx', 'tsx'],
  'typescript': ['tsconfig.json', '"typescript":', '.ts"', '.tsx"'],
  'tailwind': ['tailwind.config', '"tailwindcss":', '@tailwind'],
  'prisma': ['prisma/schema', '"prisma":', '@prisma/client'],
  'python': ['requirements.txt', 'pyproject.toml', 'setup.py', '.py'],
  'fastapi': ['fastapi', 'uvicorn'],
  'django': ['django', 'DJANGO_SETTINGS'],
  'rust': ['Cargo.toml', 'fn main()', 'cargo'],
  'golang': ['go.mod', 'package main'],
  'cpp': ['CMakeLists.txt', '.cpp', '.h', 'cmake'],
  'java': ['pom.xml', 'build.gradle', '.java'],
  'docker': ['Dockerfile', 'docker-compose'],
  'supabase': ['@supabase/', 'supabase'],
  'postgres': ['postgresql', 'pg', 'DATABASE_URL'],
  'sqlite': ['sqlite', 'better-sqlite3'],
  'redis': ['redis', 'ioredis', 'upstash'],
  'vercel': ['vercel.json', '"vercel"'],
  'cloudflare': ['wrangler', 'cloudflare'],
  'openai': ['openai', 'OPENAI_API_KEY'],
  'anthropic': ['anthropic', 'ANTHROPIC_API_KEY', 'claude'],
  'langchain': ['langchain', 'langgraph'],
  'llm': ['transformers', 'huggingface', 'ollama', 'vllm'],
  'audio': ['whisper', 'audio', 'speech', 'wav', 'mp3'],
  'wasm': ['wasm', 'webassembly', 'emscripten'],
  'cuda': ['cuda', 'nvidia', 'gpu'],
  'metal': ['metal', 'apple silicon', 'mlx'],
}

export function detectStack(context: string): string[] {
  const lower = context.toLowerCase()
  const detected: string[] = []

  for (const [tag, patterns] of Object.entries(STACK_PATTERNS)) {
    if (patterns.some(p => lower.includes(p.toLowerCase()))) {
      detected.push(tag)
    }
  }

  return detected
}
```

### 5.10 lib/selectSkills.ts

```typescript
// 59 skills dikurasi dari 5 source repos
// Mapping: skill → tags yang relevan
const SKILL_MAP: Record<string, string[]> = {
  'next-js-app-router':       ['nextjs', 'react'],
  'react-component-patterns': ['react', 'typescript'],
  'typescript-strict':        ['typescript'],
  'tailwind-design-system':   ['tailwind', 'react'],
  'state-management':         ['react', 'nextjs'],
  'web-performance':          ['nextjs', 'react', 'vercel'],
  'prisma-orm':               ['prisma', 'postgres'],
  'supabase-integration':     ['supabase'],
  'postgres-patterns':        ['postgres', 'prisma'],
  'redis-caching':            ['redis'],
  'api-routes-nextjs':        ['nextjs'],
  'zod-validation':           ['typescript', 'nextjs'],
  'authentication':           ['nextjs', 'supabase'],
  'deployment-vercel':        ['vercel', 'nextjs'],
  'docker-containerization':  ['docker'],
  'python-fastapi':           ['python', 'fastapi'],
  'python-async':             ['python'],
  'django-patterns':          ['django', 'python'],
  'rust-systems':             ['rust'],
  'rust-wasm':                ['rust', 'wasm'],
  'golang-patterns':          ['golang'],
  'cpp-systems':              ['cpp'],
  'cpp-performance':          ['cpp', 'cuda'],
  'cmake-build':              ['cpp'],
  'audio-processing':         ['audio'],
  'speech-to-text':           ['audio', 'python', 'llm'],
  'llm-integration':          ['openai', 'anthropic', 'llm'],
  'anthropic-claude':         ['anthropic'],
  'langchain-agents':         ['langchain'],
  'huggingface-models':       ['llm'],
  'gpu-acceleration':         ['cuda', 'metal'],
  'wasm-deployment':          ['wasm'],
  'cross-platform-build':     ['cpp', 'rust', 'golang'],
  'python-bindings':          ['python', 'cpp', 'rust'],
  'testing-jest':             ['react', 'nextjs', 'typescript'],
  'testing-vitest':           ['typescript', 'react'],
  'testing-pytest':           ['python'],
  'error-handling':           ['typescript', 'python', 'rust'],
  'logging-monitoring':       ['nextjs', 'python', 'docker'],
  'environment-config':       ['nextjs', 'python', 'docker'],
  'git-workflow':             ['nextjs', 'python', 'rust', 'golang', 'cpp'],
  'solid-principles':         ['typescript', 'python', 'java'],
  'api-design':               ['nextjs', 'fastapi', 'golang'],
  'rate-limiting':            ['nextjs', 'fastapi', 'redis'],
  'security-patterns':        ['nextjs', 'python'],
  'cloudflare-workers':       ['cloudflare'],
  'edge-computing':           ['vercel', 'cloudflare'],
  'web-scraping':             ['python'],
  'data-processing':          ['python', 'rust', 'golang'],
  'stream-processing':        ['nextjs', 'python', 'rust'],
  'file-handling':            ['python', 'rust', 'golang', 'cpp'],
  'cli-tools':                ['rust', 'golang', 'python'],
  'java-spring':              ['java'],
  'mobile-pwa':               ['react', 'nextjs'],
  'accessibility-a11y':       ['react', 'nextjs'],
  'internationalization':     ['nextjs', 'react'],
  'component-library':        ['react', 'typescript'],
  'monorepo-setup':           ['typescript', 'nextjs'],
}

export function selectSkills(tags: string[], maxSkills = 8): string[] {
  const scores: Record<string, number> = {}

  for (const [skill, skillTags] of Object.entries(SKILL_MAP)) {
    const matches = skillTags.filter(t => tags.includes(t)).length
    if (matches > 0) scores[skill] = matches
  }

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxSkills)
    .map(([skill]) => skill)
}
```

### 5.11 lib/buildZip.ts

```typescript
import { strToU8, zipSync } from 'fflate'
import { SKILL_CONTENT } from './skillsContent'

function buildSetupGuide(owner: string, repo: string, skills: string[]): string {
  return `# MARK Intelligence — Setup Guide
Generated for: ${owner}/${repo}

## Quick Start
1. Copy CLAUDE.md to your project root
2. Add the skill files to .claude/skills/
3. Run: claude code

## Selected Skills (${skills.length}/59)
${skills.map(s => `- ${s}`).join('\n')}

## What this gives Claude Code
- Full understanding of your tech stack
- Coding conventions and patterns from this codebase
- Ready-to-use skill files for your specific setup

Generated by MARK Intelligence — markintel.tech
`
}

export async function buildZip(
  markFile: string,
  skills: string[],
  owner: string,
  repo: string
): Promise<string> {
  const files: Record<string, Uint8Array> = {
    'CLAUDE.md': strToU8(markFile),
    'SETUP_GUIDE.md': strToU8(buildSetupGuide(owner, repo, skills)),
  }

  // Tambah skill files yang tersedia
  for (const skill of skills) {
    const content = SKILL_CONTENT[skill]
    if (content) {
      files[`.claude/skills/${skill}.md`] = strToU8(content)
    }
  }

  const zipped = zipSync(files, { level: 6 })
  return Buffer.from(zipped).toString('base64')
}
```

### 5.12 app/api/forge/route.ts

```typescript
import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { packRepo } from '@/lib/github'
import { detectStack } from '@/lib/detectStack'
import { selectSkills } from '@/lib/selectSkills'
import { streamMarkFile } from '@/lib/llm'
import { buildZip } from '@/lib/buildZip'

export const runtime = 'nodejs'  // WAJIB — fflate butuh Node, bukan Edge

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const isExtension = origin.startsWith('chrome-extension://')
  const isSelf = origin === process.env.NEXT_PUBLIC_APP_URL

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isExtension || isSelf ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  // CORS untuk Chrome Extension
  const origin = req.headers.get('origin') || ''
  const isExtension = origin.startsWith('chrome-extension://')
  const isSelf = origin === process.env.NEXT_PUBLIC_APP_URL

  const corsHeaders = {
    'Access-Control-Allow-Origin': isExtension || isSelf ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const { success, remaining } = await checkRateLimit(ip)

  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', message: 'You\'ve used 5/5 scans today. Come back tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const { owner, repo } = await req.json()
  if (!owner || !repo) {
    return new Response(JSON.stringify({ error: 'Missing owner or repo' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      try {
        // Phase 1: GitHub scan
        send({ type: 'status', message: 'Reading manifest files...', remaining })
        const context = await packRepo(owner, repo)

        // Phase 2: Stack detection
        const tags = detectStack(context)
        send({ type: 'stack', tags })

        // Phase 3: Skill selection
        const skills = selectSkills(tags)
        send({ type: 'skills', skills, count: skills.length })

        // Phase 4: Claude generation (streaming)
        send({ type: 'status', message: 'Generating MARK File...' })
        const claudeStream = await streamMarkFile(context, tags, skills)

        let fullContent = ''
        for await (const chunk of claudeStream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          fullContent += text
          if (text) send({ type: 'content', text })
        }

        // Phase 5: ZIP
        const zipBase64 = await buildZip(fullContent, skills, owner, repo)
        send({
          type: 'done',
          zipBase64,
          markFile: fullContent,
          tags,
          skills,
          repoName: `${owner}/${repo}`,
        })

      } catch (err: any) {
        send({ type: 'error', message: err.message ?? 'Scan failed. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders,
    },
  })
}
```

### 5.13 app/api/opportunities/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateOpportunities } from '@/lib/llm'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const { markFile, repoName, stack } = await req.json()
    const ideas = await generateOpportunities(markFile, repoName, stack)
    return NextResponse.json({ ideas }, { headers: corsHeaders })
  } catch (err: any) {
    return NextResponse.json(
      { ideas: [], error: err.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
```

### 5.14 Landing Page (app/page.tsx)

Port `index.html` yang sudah selesai ke Next.js format:

```tsx
'use client'

// Semua animasi (cursor, liquid glass, demo terminal, dll)
// menggunakan useEffect karena butuh browser APIs

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Init semua JS dari index.html:
    // - heroCanvas liquid glass
    // - custom cursor
    // - magnetic buttons
    // - blur shape follower
    // - stats counter IntersectionObserver
    // - demo terminal trigger
    // - hide-on-scroll nav
    // - scrollspy
    // - toast handler
    // - how-it-works icon observer
    // - token particles
  }, [])

  return (
    <>
      {/* Paste semua JSX dari index.html di sini */}
      {/* Ganti class= ke className=, for= ke htmlFor=, dll */}
    </>
  )
}
```

**Konversi HTML → JSX yang perlu dilakukan:**

| HTML | JSX |
|---|---|
| `class=` | `className=` |
| `for=` | `htmlFor=` |
| `<canvas>` | tetap `<canvas>` |
| `style="..."` | `style={{ ... }}` (object) |
| `onclick=` | `onClick=` |
| SVG `viewbox=` | `viewBox=` |
| Comments `<!-- -->` | `{/* */}` |

---

## 6. Chrome Extension Implementation

### 6.1 Setup Boilerplate

```bash
git clone https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite
cd chrome-extension-boilerplate-react-vite
pnpm install
```

Boilerplate ini sudah include: React 18, Vite, TypeScript, Tailwind, MV3 structure, hot reload, dan auto-packaging untuk Chrome Web Store.

### 6.2 Extension Structure

```
extension/
├── manifest.json
├── pages/
│   └── popup/
│       ├── index.html
│       └── index.tsx        ← Main popup UI
├── src/
│   ├── background/
│   │   └── index.ts         ← Service worker: handle fetch + SSE
│   ├── content/
│   │   └── index.ts         ← Detect GitHub URL
│   └── lib/
│       ├── types.ts          ← Shared TypeScript types
│       └── constants.ts      ← API URL, config
└── public/
    └── icons/
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png
```

### 6.3 manifest.json

```json
{
  "manifest_version": 3,
  "name": "MARK Intelligence",
  "version": "1.0.0",
  "description": "Scan any GitHub repo. Get a full intelligence report + 3 pump.fun-ready build ideas.",
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16":  "icons/icon16.png",
      "32":  "icons/icon32.png",
      "48":  "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "default_title": "MARK Intelligence"
  },
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://github.com/*/*"],
      "js": ["content/index.js"],
      "run_at": "document_idle"
    }
  ],
  "permissions": [
    "storage",
    "tabs",
    "activeTab"
  ],
  "host_permissions": [
    "https://github.com/*",
    "https://markintel.tech/*"
  ],
  "icons": {
    "16":  "icons/icon16.png",
    "32":  "icons/icon32.png",
    "48":  "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 6.4 src/lib/types.ts

```typescript
export interface RepoInfo {
  owner: string
  repo: string
}

export interface ScanState {
  status: 'idle' | 'scanning' | 'done' | 'error' | 'rate_limited'
  lines: TerminalLine[]
  tags: string[]
  skills: string[]
  markFile: string
  zipBase64: string
  repoName: string
  ideas: BuildIdea[]
  remaining: number
  error?: string
}

export interface TerminalLine {
  type: 'status' | 'stack' | 'skills' | 'content' | 'done' | 'error'
  text: string
  cls?: 'dim' | 'white' | 'blue' | 'green' | 'yellow'
}

export interface BuildIdea {
  websiteName: string
  domain: string
  ticker: string
  valueProp: string
  pumpFunAngle: string
  buildEffort: string
  coreCapabilityUsed: string
}
```

### 6.5 src/lib/constants.ts

```typescript
export const API_BASE = 'https://markintel.tech'
export const FORGE_ENDPOINT = `${API_BASE}/api/forge`
export const OPPORTUNITIES_ENDPOINT = `${API_BASE}/api/opportunities`
export const MAX_SCANS_PER_DAY = 5
```

### 6.6 src/content/index.ts

```typescript
// Jalan di setiap halaman github.com/*/*
// Detect owner/repo dari URL, simpan ke chrome.storage

function extractRepo(): { owner: string; repo: string } | null {
  const parts = location.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null
  // Hindari false positive seperti /explore, /topics, dll
  const excluded = ['explore', 'topics', 'trending', 'marketplace', 'settings', 'orgs']
  if (excluded.includes(parts[0])) return null
  return { owner: parts[0], repo: parts[1] }
}

function updateStorage(): void {
  const repo = extractRepo()
  if (repo) {
    chrome.storage.local.set({ currentRepo: repo })
  } else {
    chrome.storage.local.remove('currentRepo')
  }
}

// Initial detect
updateStorage()

// Handle GitHub SPA navigation (GitHub adalah SPA, URL berubah tanpa full page reload)
let lastPath = location.pathname

const observer = new MutationObserver(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname
    updateStorage()
  }
})

observer.observe(document.body, {
  subtree: true,
  childList: true,
})
```

### 6.7 src/background/index.ts

```typescript
// Service Worker — handle semua fetch ke API
// PENTING: semua state simpan ke chrome.storage.local
// Service worker bisa di-terminate kapan saja saat idle

import { FORGE_ENDPOINT, OPPORTUNITIES_ENDPOINT } from '../lib/constants'
import type { ScanState, BuildIdea } from '../lib/types'

const DEFAULT_STATE: ScanState = {
  status: 'idle',
  lines: [],
  tags: [],
  skills: [],
  markFile: '',
  zipBase64: '',
  repoName: '',
  ideas: [],
  remaining: 5,
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'START_SCAN') {
    startScan(msg.owner, msg.repo).then(() => sendResponse({ ok: true }))
    return true // keep channel open untuk async
  }

  if (msg.type === 'RESET_STATE') {
    chrome.storage.local.set({ scanState: DEFAULT_STATE })
    sendResponse({ ok: true })
  }
})

async function startScan(owner: string, repo: string): Promise<void> {
  // Reset state
  await chrome.storage.local.set({
    scanState: {
      ...DEFAULT_STATE,
      status: 'scanning',
      repoName: `${owner}/${repo}`,
    },
  })

  broadcast({ type: 'SCAN_STARTED' })

  try {
    const res = await fetch(FORGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo }),
    })

    if (res.status === 429) {
      await updateState({ status: 'rate_limited', remaining: 0 })
      broadcast({ type: 'RATE_LIMITED' })
      return
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const reader = res.body!.getReader()
    const dec = new TextDecoder()
    let markFileBuffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = dec.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          await handleSSEEvent(data)
          if (data.type === 'content') {
            markFileBuffer += data.text
          }
        } catch {}
      }
    }

    // Setelah scan done, call /api/opportunities (non-blocking untuk UX)
    fetchOpportunities(markFileBuffer, `${owner}/${repo}`)

  } catch (err: any) {
    await updateState({
      status: 'error',
      error: err.message ?? 'Scan failed',
    })
    broadcast({ type: 'SCAN_ERROR', error: err.message })
  }
}

async function handleSSEEvent(data: any): Promise<void> {
  const current = await getState()

  switch (data.type) {
    case 'status':
      await updateState({
        lines: [...current.lines, {
          type: 'status', text: data.message, cls: 'blue'
        }],
      })
      break

    case 'stack':
      await updateState({ tags: data.tags })
      break

    case 'skills':
      await updateState({ skills: data.skills })
      break

    case 'content':
      await updateState({
        markFile: current.markFile + data.text,
      })
      break

    case 'done':
      await updateState({
        status: 'done',
        zipBase64: data.zipBase64,
        markFile: data.markFile,
        tags: data.tags,
        skills: data.skills,
        remaining: data.remaining ?? current.remaining,
        lines: [...current.lines, {
          type: 'done', text: '→ Complete ✓', cls: 'green'
        }],
      })
      break

    case 'error':
      await updateState({ status: 'error', error: data.message })
      break
  }

  broadcast({ type: 'STATE_UPDATE', data })
}

async function fetchOpportunities(
  markFile: string,
  repoName: string
): Promise<void> {
  try {
    const current = await getState()
    const res = await fetch(OPPORTUNITIES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markFile,
        repoName,
        stack: current.tags,
      }),
    })
    const { ideas } = await res.json()
    await updateState({ ideas })
    broadcast({ type: 'IDEAS_READY', ideas })
  } catch {}
}

async function getState(): Promise<ScanState> {
  const result = await chrome.storage.local.get('scanState')
  return result.scanState ?? DEFAULT_STATE
}

async function updateState(partial: Partial<ScanState>): Promise<void> {
  const current = await getState()
  await chrome.storage.local.set({
    scanState: { ...current, ...partial },
  })
}

function broadcast(msg: object): void {
  chrome.runtime.sendMessage(msg).catch(() => {
    // Popup mungkin tertutup — ignore error
  })
}
```

### 6.8 pages/popup/index.tsx

```tsx
import { useEffect, useState, useRef } from 'react'
import type { ScanState, BuildIdea } from '../../src/lib/types'

const DEFAULT_STATE: ScanState = {
  status: 'idle', lines: [], tags: [], skills: [],
  markFile: '', zipBase64: '', repoName: '', ideas: [], remaining: 5,
}

export default function Popup() {
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(null)
  const [state, setState] = useState<ScanState>(DEFAULT_STATE)
  const [activeTab, setActiveTab] = useState<'mark' | 'ideas'>('mark')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load repo dari storage
  useEffect(() => {
    chrome.storage.local.get(['currentRepo', 'scanState'], (result) => {
      if (result.currentRepo) setRepo(result.currentRepo)
      if (result.scanState) setState(result.scanState)
    })
  }, [])

  // Listen untuk updates dari service worker
  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === 'STATE_UPDATE' || msg.type === 'SCAN_STARTED') {
        chrome.storage.local.get('scanState', (result) => {
          if (result.scanState) setState(result.scanState)
        })
      }
      if (msg.type === 'IDEAS_READY') {
        setState(prev => ({ ...prev, ideas: msg.ideas }))
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  // Init liquid glass Canvas
  useEffect(() => {
    if (!canvasRef.current) return
    // [Liquid glass animation code — sama dengan yang ada di showcase]
    initLiquidGlass(canvasRef.current, state.status === 'scanning')
  }, [state.status])

  function handleScan() {
    if (!repo) return
    chrome.runtime.sendMessage({
      type: 'START_SCAN',
      owner: repo.owner,
      repo: repo.repo,
    })
  }

  function handleDownload() {
    if (!state.zipBase64) return
    const blob = base64ToBlob(state.zipBase64, 'application/zip')
    const url = URL.createObjectURL(blob)
    chrome.downloads.download({
      url,
      filename: `mark-${state.repoName.replace('/', '-')}.zip`,
    })
  }

  function handleRescan() {
    chrome.runtime.sendMessage({ type: 'RESET_STATE' })
    setState(DEFAULT_STATE)
    handleScan()
  }

  return (
    <div className="popup-root">
      {/* Header */}
      <div className="popup-header">
        <div className="popup-logo">
          <div className="logo-dot" />
          <span>MARK</span>
        </div>
        <div className="popup-repo">
          {repo ? `${repo.owner}/${repo.repo}` : 'Open a GitHub repo'}
        </div>
      </div>

      {/* Glass Zone */}
      <div className="glass-zone">
        <canvas ref={canvasRef} className="glass-canvas" />
        <div className="glass-overlay">
          <div className="scan-status">
            {getScanStatusText(state.status)}
          </div>
          <div className="chip-row">
            {state.tags.slice(0, 4).map(tag => (
              <span key={tag} className="chip">{tag}</span>
            ))}
            {state.skills.length > 0 && (
              <span className="chip chip-accent">{state.skills.length} skills</span>
            )}
          </div>
        </div>
        <div
          className="scan-progress"
          style={{ width: state.status === 'scanning' ? '0%' : '100%' }}
        />
      </div>

      {/* No repo state */}
      {!repo && (
        <div className="no-repo">
          Open any GitHub repository to use MARK
        </div>
      )}

      {/* Idle state */}
      {repo && state.status === 'idle' && (
        <div className="idle-state">
          <button className="scan-btn" onClick={handleScan}>
            Scan this repo
          </button>
          <div className="remaining-info">
            {state.remaining} scans remaining today
          </div>
        </div>
      )}

      {/* Rate limited */}
      {state.status === 'rate_limited' && (
        <div className="rate-limit-msg">
          You've used 5/5 scans today.
          <br />Come back tomorrow.
        </div>
      )}

      {/* Scanning / Done */}
      {(state.status === 'scanning' || state.status === 'done') && (
        <>
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'mark' ? 'active' : ''}`}
              onClick={() => setActiveTab('mark')}
            >
              Mark File
            </button>
            <button
              className={`tab ${activeTab === 'ideas' ? 'active' : ''}`}
              onClick={() => setActiveTab('ideas')}
            >
              Build Opportunities
            </button>
          </div>

          {/* Tab: Mark File */}
          {activeTab === 'mark' && (
            <div className="tab-content">
              <div className="terminal">
                {state.lines.map((line, i) => (
                  <div key={i} className={`term-line ${line.cls || ''}`}>
                    <span className="term-prefix">·</span>
                    <span>{line.text}</span>
                  </div>
                ))}
                {state.status === 'scanning' && (
                  <span className="cursor" />
                )}
              </div>

              {state.status === 'done' && (
                <div className="file-list">
                  <div className="file-row" onClick={handleDownload}>
                    <span className="file-icon">📄</span>
                    <div>
                      <div className="file-name">CLAUDE.md</div>
                      <div className="file-tags">
                        {state.tags.slice(0,3).join(' · ')}
                      </div>
                    </div>
                    <span className="dl-icon">↓</span>
                  </div>
                  <div className="file-row" onClick={handleDownload}>
                    <span className="file-icon">📁</span>
                    <div>
                      <div className="file-name">mark-output.zip</div>
                      <div className="file-tags">
                        CLAUDE.md + {state.skills.length} skills + setup guide
                      </div>
                    </div>
                    <span className="dl-icon">↓</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Build Opportunities */}
          {activeTab === 'ideas' && (
            <div className="tab-content">
              {state.ideas.length === 0 ? (
                <div className="ideas-loading">Generating ideas...</div>
              ) : (
                <div className="ideas-list">
                  {state.ideas.map((idea, i) => (
                    <IdeaCard key={i} idea={idea} delay={i * 200} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="popup-footer">
        {state.status === 'done' && (
          <>
            <div className="status-indicator">
              <div className="status-dot" />
              <span>Scan complete</span>
            </div>
            <div className="footer-actions">
              <button className="btn-dl" onClick={handleDownload}>↓ ZIP</button>
              <button className="btn-rescan" onClick={handleRescan}>↺ Rescan</button>
            </div>
          </>
        )}
        {state.status === 'scanning' && (
          <div className="scanning-indicator">Scanning...</div>
        )}
        {state.status === 'idle' && repo && (
          <div className="remaining-footer">
            {state.remaining}/5 scans remaining today
          </div>
        )}
      </div>
    </div>
  )
}

function IdeaCard({ idea, delay }: { idea: BuildIdea; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div className={`idea-card ${visible ? 'visible' : ''}`}>
      <div className="idea-header">
        <span className="idea-name">{idea.websiteName}</span>
        <span className="idea-ticker">{idea.ticker}</span>
      </div>
      <p className="idea-desc">{idea.valueProp}</p>
      <div className="idea-footer">
        <span className="idea-pf">pump.fun viable ✓</span>
        <span className="idea-effort">{idea.buildEffort}</span>
      </div>
    </div>
  )
}

function getScanStatusText(status: ScanState['status']): string {
  const map = {
    idle: 'Ready to scan',
    scanning: 'Scanning...',
    done: 'Scan complete ✓',
    error: 'Scan failed',
    rate_limited: 'Limit reached',
  }
  return map[status]
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

function initLiquidGlass(canvas: HTMLCanvasElement, active: boolean): void {
  // [Copy dari animations-showcase.html — ep canvas logic]
  // Blobs scale down saat active=false (scan selesai)
}
```

### 6.9 Build & Submit ke Chrome Web Store

```bash
# Build extension
pnpm build

# Output ada di dist/

# Submit ke Chrome Web Store:
# 1. Buka https://chrome.google.com/webstore/devconsole
# 2. "New Item" → upload dist/ sebagai ZIP
# 3. Isi deskripsi, screenshot, kategori: "Developer Tools"
# 4. Submit for review (biasanya 1-3 hari)
# Biaya: $5 one-time developer registration fee
```

---

## 7. Constraints & Infrastructure

### Vercel Hobby Plan — Limits yang Perlu Diperhatikan

| Resource | Limit | Status MARK |
|---|---|---|
| Serverless function duration | 10s default, 60s max (via vercel.json) | ✅ Configured |
| Serverless functions per project | 12 | ✅ Hanya 2 (/api/forge + /api/opportunities) |
| Bandwidth | 100 GB/month | ✅ Aman untuk MVP |
| Build time | 45 menit max | ✅ Next.js build < 5 menit |
| Custom domain | 1 per project | ✅ markintel.tech |
| Concurrent builds | 1 | ✅ Single project |

### Free Tier Services

| Service | Free Tier | Usage MARK |
|---|---|---|
| Vercel Hobby | $0/bulan | Landing page + API |
| Upstash Redis | 10,000 req/day, 256MB | Rate limiting (5 scan × ~2000 users = 10,000) |
| Anthropic API | Pay per use (~$0.065/scan) | No free tier — variable cost |
| GitHub API (unauth) | 60 req/hr | Sangat terbatas |
| GitHub API (dengan token) | 5,000 req/hr | ✅ Tambahkan GITHUB_TOKEN |

**Total fixed cost MVP: $15** ($10 domain + $5 Chrome Web Store)  
**Variable cost: ~$0.065/scan** (dibayar sesuai usage)

### Critical: CORS Configuration

Extension popup (origin: `chrome-extension://[id]`) perlu di-allow di `/api/forge` dan `/api/opportunities`. CORS header sudah ada di code di atas. Pastikan tidak ada middleware yang strip headers ini.

### Satu Vercel Project — Cara Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Di root folder project Next.js
vercel --prod

# Atau connect via GitHub:
# Vercel Dashboard → Import Project → pilih repo GitHub → deploy otomatis setiap push ke main
```

Setelah deploy pertama:
1. Pergi ke Vercel Dashboard → project → Settings → Domains
2. Tambahkan `markintel.tech`
3. Ikuti instruksi DNS di domain registrar
4. Tambahkan semua environment variables di Settings → Environment Variables

---

*MARK Intelligence PRD v1.0 — siap untuk development*