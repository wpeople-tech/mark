# MARK — Repo Score Feature
## Dev Brief v1.0

**Feature name:** Repo Score
**Trigger:** Popup MARK terbuka di atas GitHub repo manapun
**Timing:** Muncul SEBELUM user klik scan — otomatis saat popup terbuka
**Goal:** User langsung tahu apakah repo ini worth dibangun dan dilaunch tokennya,
          tanpa perlu nunggu full scan dulu

---

## Overview Flow

```
User buka github.com/owner/repo
↓
User klik icon MARK di toolbar
↓
Popup terbuka
↓
MARK langsung hit GitHub API (bukan /api/forge)
  → ambil: stars, forks, last_push, topics, description,
            is_fork, contributors_count, has_manifest_files
↓
Scoring engine hitung score (0-100) di client side
↓
Score + label + 3 bullet reasoning muncul di popup
  dalam < 2 detik
↓
User bisa klik Scan untuk lanjut ke full MARK output
```

---

## UI Placement di Popup

Repo Score muncul di **ATAS** popup, sebelum tab "Mark File" dan
"Build Opportunities". Ini yang pertama dilihat user.

```
┌─────────────────────────────────────────┐
│ ● MARK                    owner/repo    │
├─────────────────────────────────────────┤
│                                         │
│  REPO SCORE                             │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │   82  Good Build Candidate  ■■■ │   │
│  │  /100                           │   │
│  │                                 │   │
│  │  • [bullet 1]                   │   │
│  │  • [bullet 2]                   │   │
│  │  • [bullet 3]                   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [  Scan Repository  ]                  │
│                                         │
│  ──────────────────────────────────     │
│  Mark File    │    Build Opportunities  │
│  (hasil scan muncul di sini setelah     │
│   user klik Scan)                       │
└─────────────────────────────────────────┘
```

**Color per label:**
```
85-100  →  border + text: #1B6B28  (green)   label: "Strong Build Candidate"
65-84   →  border + text: #1A47A8  (blue)    label: "Good Build Candidate"
45-64   →  border + text: #B07D00  (amber)   label: "Moderate Potential"
0-44    →  border + text: #888785  (muted)   label: "Low Priority"
```

**Score bar visual:**
```
Score 82 → bar filled 82% dengan warna sesuai label
Animasi: bar fill dari 0 ke nilai final dalam 600ms (ease-out)
```

---

## Data Fetching

### Endpoint yang dipakai
GitHub REST API — public, no auth required untuk public repos:

```
GET https://api.github.com/repos/{owner}/{repo}
```

Response fields yang dipakai:
```javascript
{
  stargazers_count,    // untuk traction score
  forks_count,        // untuk traction score
  pushed_at,          // untuk activity score (last commit date)
  topics,             // untuk narrative fit score
  description,        // untuk narrative fit keyword matching
  is_fork,            // untuk uniqueness score
  open_issues_count,  // bonus signal
  subscribers_count,  // watcher count
  created_at,         // repo age
  license,            // ada license atau tidak
  default_branch      // untuk cek manifest files
}
```

### Endpoint kedua — contributors count
```
GET https://api.github.com/repos/{owner}/{repo}/contributors?per_page=1&anon=true
```
Ambil dari response header `Link` atau count dari response array.
Kalau > 30 contributors, hit limit jadi tidak perlu exact count — cukup tahu "banyak".

### Endpoint ketiga — manifest files check
```
GET https://api.github.com/repos/{owner}/{repo}/contents/
```
Cek apakah root directory mengandung salah satu dari:
```javascript
const MANIFEST_FILES = [
  'package.json',
  'pyproject.toml',
  'go.mod',
  'Cargo.toml',
  'requirements.txt',
  'composer.json',
  'Gemfile',
  'build.gradle',
  'pom.xml',
  'mcp.json',          // MCP server
  '.mcp.json',         // MCP config
]
```

### Semua 3 request jalan PARALLEL (Promise.all)
```javascript
const [repoData, contributorsData, contentsData] = await Promise.all([
  fetch(`https://api.github.com/repos/${owner}/${repo}`),
  fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=30`),
  fetch(`https://api.github.com/repos/${owner}/${repo}/contents/`),
])
```

### Rate limiting GitHub API
GitHub public API: 60 requests/hour per IP tanpa auth.
Untuk avoid hitting limit:
```javascript
// Cache hasil di chrome.storage.session
// Key: `repo_score_${owner}_${repo}`
// TTL: 10 menit (600000ms)
// Setelah 10 menit, fetch ulang

const CACHE_TTL = 10 * 60 * 1000 // 10 menit

async function getRepoData(owner, repo) {
  const cacheKey = `repo_score_${owner}_${repo}`
  const cached = await chrome.storage.session.get(cacheKey)

  if (cached[cacheKey]) {
    const { data, timestamp } = cached[cacheKey]
    if (Date.now() - timestamp < CACHE_TTL) {
      return data
    }
  }

  const data = await fetchRepoData(owner, repo)
  await chrome.storage.session.set({
    [cacheKey]: { data, timestamp: Date.now() }
  })
  return data
}
```

---

## Scoring Engine

Semua kalkulasi terjadi di **client side** di dalam extension.
Tidak ada request ke server MARK untuk scoring ini.

```typescript
// types
interface RepoData {
  stars: number
  forks: number
  lastPushedAt: string        // ISO date string
  topics: string[]
  description: string
  isFork: boolean
  contributorsCount: number
  manifestFiles: string[]     // files yang ditemukan di root
  hasRelease: boolean
  daysSinceLastPush: number   // kalkulasi dari pushed_at
}

interface RepoScore {
  total: number               // 0-100
  label: string               // label text
  color: string               // hex color
  breakdown: {
    traction: number          // 0-25
    activity: number          // 0-20
    buildability: number      // 0-25
    narrativeFit: number      // 0-20
    uniqueness: number        // 0-10
  }
  bullets: string[]           // array of 3 strings
}
```

### Fungsi scoring lengkap:

```typescript
function calculateRepoScore(data: RepoData): RepoScore {

  // ─── 1. TRACTION (max 25) ────────────────────────────────────
  let traction = 0

  if (data.stars >= 10000) traction = 25
  else if (data.stars >= 1000) traction = 18
  else if (data.stars >= 100)  traction = 10
  else traction = 3

  // Bonus: fork ratio > 5% artinya orang aktif build di atasnya
  const forkRatio = data.stars > 0 ? data.forks / data.stars : 0
  if (forkRatio > 0.05) traction = Math.min(25, traction + 5)

  // ─── 2. ACTIVITY (max 20) ────────────────────────────────────
  let activity = 0
  const days = data.daysSinceLastPush

  if (days <= 7)   activity = 20
  else if (days <= 30)  activity = 15
  else if (days <= 90)  activity = 8
  else activity = 2

  // Bonus: ada release baru (indikator project masih actively maintained)
  if (data.hasRelease) activity = Math.min(20, activity + 3)

  // ─── 3. BUILDABILITY (max 25) ────────────────────────────────
  let buildability = 0

  // Stack detectability dari manifest files
  if (data.manifestFiles.length >= 2)      buildability += 15
  else if (data.manifestFiles.length === 1) buildability += 8
  // 0 manifest = 0 poin

  // Skill match approximation dari topics + manifest
  // (skill match count real baru ada setelah full scan,
  //  ini estimasi dari topics dan manifest yang ada)
  const detectedSkills = estimateSkillMatch(data.topics, data.manifestFiles)
  if (detectedSkills >= 6)      buildability += 10
  else if (detectedSkills >= 3) buildability += 6
  else if (detectedSkills >= 1) buildability += 2
  buildability = Math.min(25, buildability)

  // ─── 4. NARRATIVE FIT (max 20) ───────────────────────────────
  let narrativeFit = 0

  const AI_KEYWORDS = [
    'ai', 'llm', 'agent', 'mcp', 'model', 'gpt', 'claude',
    'anthropic', 'openai', 'ollama', 'langchain', 'rag',
    'embedding', 'inference', 'fine-tuning', 'transformer'
  ]

  const DEFI_KEYWORDS = [
    'defi', 'trading', 'wallet', 'chain', 'solana', 'ethereum',
    'token', 'swap', 'dex', 'amm', 'yield', 'stake', 'nft',
    'web3', 'blockchain', 'crypto', 'protocol'
  ]

  const DEVTOOL_KEYWORDS = [
    'cli', 'sdk', 'api', 'developer', 'tool', 'library',
    'framework', 'plugin', 'extension', 'integration', 'automation'
  ]

  const DATA_KEYWORDS = [
    'data', 'analytics', 'dashboard', 'monitor', 'tracker',
    'metrics', 'visualization', 'report', 'chart'
  ]

  const searchText = [
    ...data.topics,
    data.description || ''
  ].join(' ').toLowerCase()

  const hasAI = AI_KEYWORDS.some(kw => searchText.includes(kw))
  const hasDefi = DEFI_KEYWORDS.some(kw => searchText.includes(kw))
  const hasDevTool = DEVTOOL_KEYWORDS.some(kw => searchText.includes(kw))
  const hasData = DATA_KEYWORDS.some(kw => searchText.includes(kw))

  if (hasAI) narrativeFit = 20
  else if (hasDefi) narrativeFit = 16
  else if (hasDevTool) narrativeFit = 12
  else if (hasData) narrativeFit = 8
  else narrativeFit = 4

  // Bonus: ada mcp.json = MCP-compatible, super hot narrative
  if (data.manifestFiles.includes('mcp.json') ||
      data.manifestFiles.includes('.mcp.json')) {
    narrativeFit = Math.min(20, narrativeFit + 5)
  }

  // ─── 5. UNIQUENESS (max 10) ──────────────────────────────────
  let uniqueness = data.isFork ? 3 : 10

  // Bonus: community-built (> 10 contributors)
  if (data.contributorsCount > 10) {
    uniqueness = Math.min(10, uniqueness + 3)
  }

  // ─── TOTAL ───────────────────────────────────────────────────
  const total = traction + activity + buildability + narrativeFit + uniqueness

  // ─── LABEL + COLOR ───────────────────────────────────────────
  let label: string
  let color: string

  if (total >= 85) {
    label = 'Strong Build Candidate'
    color = '#1B6B28'
  } else if (total >= 65) {
    label = 'Good Build Candidate'
    color = '#1A47A8'
  } else if (total >= 45) {
    label = 'Moderate Potential'
    color = '#B07D00'
  } else {
    label = 'Low Priority'
    color = '#888785'
  }

  // ─── BULLETS ─────────────────────────────────────────────────
  const bullets = generateBullets(data, {
    traction, activity, buildability, narrativeFit, uniqueness
  })

  return {
    total,
    label,
    color,
    breakdown: { traction, activity, buildability, narrativeFit, uniqueness },
    bullets
  }
}
```

---

## Skill Match Estimation (untuk Buildability score)

Ini estimasi SEBELUM full scan — berdasarkan topics dan manifest files saja.
Skill match yang real baru keluar setelah full scan `/api/forge`.

```typescript
function estimateSkillMatch(
  topics: string[],
  manifestFiles: string[]
): number {
  let count = 0
  const signals = [...topics, ...manifestFiles].join(' ').toLowerCase()

  // Map signal ke estimated skill matches
  const SKILL_SIGNALS: Record<string, number> = {
    'package.json':       2,   // nextjs + react atau typescript
    'typescript':         1,
    'nextjs':             1,
    'react':              1,
    'tailwind':           1,
    'prisma':             1,
    'pyproject.toml':     1,   // python skill
    'fastapi':            1,
    'postgres':           1,
    'go.mod':             1,   // go skill
    'cargo.toml':         1,   // rust skill
    'docker':             1,
    'mcp':                2,   // mcp-server + typescript
    'mcp.json':           2,
    'jest':               1,
    'vitest':             1,
    'zod':                1,
    'drizzle':            1,
    'supabase':           1,
  }

  for (const [signal, weight] of Object.entries(SKILL_SIGNALS)) {
    if (signals.includes(signal)) count += weight
  }

  return Math.min(count, 10) // cap di 10
}
```

---

## Bullet Generation

Bullets dibuat dinamis berdasarkan data repo yang ada.
Setiap bullet cover aspek yang berbeda: traction, activity, dan narrative/buildability.

```typescript
function generateBullets(
  data: RepoData,
  breakdown: { traction: number; activity: number; buildability: number;
               narrativeFit: number; uniqueness: number }
): string[] {
  const bullets: string[] = []

  // ─── BULLET 1: Traction + Activity (momentum) ────────────────
  const starLabel =
    data.stars >= 10000 ? `${(data.stars / 1000).toFixed(0)}k` :
    data.stars >= 1000  ? `${(data.stars / 1000).toFixed(1)}k` :
    `${data.stars}`

  const activityLabel =
    data.daysSinceLastPush <= 1   ? 'commit dalam 24 jam terakhir' :
    data.daysSinceLastPush <= 7   ? `last commit ${data.daysSinceLastPush} hari lalu` :
    data.daysSinceLastPush <= 30  ? `last commit ${data.daysSinceLastPush} hari lalu` :
    `last commit ${Math.round(data.daysSinceLastPush / 30)} bulan lalu`

  if (breakdown.traction >= 18 && breakdown.activity >= 15) {
    bullets.push(
      `${starLabel} stars dengan ${activityLabel} — narrative sedang aktif bergerak, window belum tutup`
    )
  } else if (breakdown.traction >= 10) {
    bullets.push(
      `${starLabel} stars, ${activityLabel} — traction cukup untuk launch yang credible`
    )
  } else {
    bullets.push(
      `${starLabel} stars — repo kecil tapi ${breakdown.activity >= 15 ? 'sangat aktif dikembangkan' : 'perlu dicek apakah masih maintained'}`
    )
  }

  // ─── BULLET 2: Buildability (stack + skills) ─────────────────
  const stackNames = getStackNames(data.manifestFiles, data.topics)
  const isMCP = data.manifestFiles.includes('mcp.json') ||
                data.topics.includes('mcp') ||
                data.topics.includes('model-context-protocol')

  if (isMCP) {
    bullets.push(
      `MCP-compatible terdeteksi — stack ${stackNames} langsung bisa di-scan MARK untuk CLAUDE.md yang actionable`
    )
  } else if (breakdown.buildability >= 20) {
    bullets.push(
      `Stack ${stackNames} terdeteksi dengan jelas — skill matching tinggi, CLAUDE.md output akan specific dan langsung pakai`
    )
  } else if (breakdown.buildability >= 10) {
    bullets.push(
      `Stack ${stackNames || 'terdeteksi sebagian'} — cukup untuk generate CLAUDE.md yang usable`
    )
  } else {
    bullets.push(
      `Stack kurang manifest files — scan tetap bisa jalan tapi CLAUDE.md mungkin lebih generic`
    )
  }

  // ─── BULLET 3: Narrative + Launch angle ──────────────────────
  if (breakdown.narrativeFit >= 18) {
    const angle = getNarrativeAngle(data.topics, data.description)
    bullets.push(
      `Narrative ${angle} — utility angle mudah dibentuk, ticker punya konteks yang kuat untuk launch di pump.fun`
    )
  } else if (breakdown.narrativeFit >= 12) {
    bullets.push(
      `Developer tool dengan audience yang jelas — ada angle utility yang bisa dilaunch, tapi butuh positioning yang tepat`
    )
  } else if (breakdown.narrativeFit >= 8) {
    bullets.push(
      `Data dan analytics angle tersedia — bisa jadi utility yang niche tapi solid untuk audience yang spesifik`
    )
  } else {
    bullets.push(
      `Narrative angle belum jelas dari metadata — perlu full scan untuk lihat apakah ada build opportunity yang viable`
    )
  }

  return bullets
}

// Helper: ambil nama stack yang human-readable
function getStackNames(manifestFiles: string[], topics: string[]): string {
  const stacks: string[] = []
  const all = [...manifestFiles, ...topics].join(' ').toLowerCase()

  if (all.includes('package.json') || all.includes('typescript') || all.includes('nextjs'))
    stacks.push('TypeScript')
  if (all.includes('react') || all.includes('nextjs'))
    stacks.push('React')
  if (all.includes('python') || all.includes('pyproject'))
    stacks.push('Python')
  if (all.includes('go.mod'))
    stacks.push('Go')
  if (all.includes('cargo'))
    stacks.push('Rust')
  if (all.includes('fastapi'))
    stacks.push('FastAPI')
  if (all.includes('mcp'))
    stacks.push('MCP')
  if (all.includes('bun'))
    stacks.push('Bun')

  return stacks.slice(0, 3).join(' + ') || 'terdeteksi'
}

// Helper: narrative angle label
function getNarrativeAngle(topics: string[], description: string): string {
  const text = [...topics, description || ''].join(' ').toLowerCase()

  if (text.includes('mcp') || text.includes('model-context-protocol'))
    return 'MCP'
  if (text.includes('agent') || text.includes('agentic'))
    return 'AI Agent'
  if (text.includes('llm') || text.includes('claude') || text.includes('openai') || text.includes('gpt'))
    return 'LLM / AI'
  if (text.includes('defi') || text.includes('trading'))
    return 'DeFi'
  if (text.includes('solana') || text.includes('blockchain') || text.includes('web3'))
    return 'Web3'
  if (text.includes('cli') || text.includes('developer'))
    return 'DevTool'

  return 'utility'
}
```

---

## Loading State

Saat data sedang di-fetch (< 2 detik biasanya), tampilkan skeleton:

```tsx
// Skeleton state
<div className="repo-score-skeleton">
  <div className="skeleton-bar" />       {/* placeholder untuk angka score */}
  <div className="skeleton-label" />     {/* placeholder untuk label */}
  <div className="skeleton-bullet" />    {/* 3 placeholder bullets */}
  <div className="skeleton-bullet" />
  <div className="skeleton-bullet" />
</div>
```

CSS untuk skeleton (pulse animation):
```css
.skeleton-bar, .skeleton-label, .skeleton-bullet {
  background: linear-gradient(90deg, #EFEFEB 25%, #E5E3DC 50%, #EFEFEB 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-pulse {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-bar    { height: 40px; width: 100px; }
.skeleton-label  { height: 20px; width: 160px; margin-top: 8px; }
.skeleton-bullet { height: 14px; width: 90%; margin-top: 8px; }
```

---

## Error State

Kalau repo private atau GitHub API return error:

```typescript
// Kondisi error yang mungkin terjadi:
// 404 → repo not found atau private
// 403 → rate limit hit
// Network error → offline atau timeout

// UI untuk error state:
<div className="repo-score-error">
  <span className="error-icon">○</span>
  <span className="error-text">
    {error === 404
      ? "Repo private atau tidak ditemukan. Score hanya tersedia untuk public repos."
      : error === 403
      ? "GitHub API rate limit. Coba lagi dalam beberapa menit."
      : "Tidak bisa load repo data. Cek koneksi internet."}
  </span>
</div>

// Tombol Scan tetap muncul meski score error
// User masih bisa scan normal
```

---

## Contoh Output Final

**Contoh 1 — sst/opencode (score: ~88)**
```
88   Strong Build Candidate   ████████████████████░░░
/100

• 160k stars dengan last commit 13 menit lalu — narrative sedang
  aktif bergerak, window belum tutup

• Stack TypeScript + Bun + MCP terdeteksi dengan jelas — skill
  matching tinggi, CLAUDE.md output akan specific dan langsung pakai

• Narrative MCP — utility angle mudah dibentuk, ticker punya
  konteks yang kuat untuk launch di pump.fun
```

**Contoh 2 — OpenHands/OpenHands (score: ~72)**
```
72   Good Build Candidate   ██████████████░░░░░░░░░
/100

• 80k stars, last commit 12 jam lalu — traction cukup untuk
  launch yang credible

• Stack Python + FastAPI terdeteksi dengan jelas — skill matching
  tinggi, CLAUDE.md output akan specific dan langsung pakai

• Narrative AI Agent — utility angle mudah dibentuk, ticker punya
  konteks yang kuat untuk launch di pump.fun
```

**Contoh 3 — repo random 45 stars (score: ~28)**
```
28   Low Priority   █████░░░░░░░░░░░░░░░░░
/100

• 45 stars — repo kecil, perlu dicek apakah masih maintained

• Stack terdeteksi sebagian — cukup untuk generate CLAUDE.md
  yang usable

• Narrative angle belum jelas dari metadata — perlu full scan
  untuk lihat apakah ada build opportunity yang viable
```

---

## File Structure

```
extension/
├── src/
│   ├── popup/
│   │   ├── components/
│   │   │   ├── RepoScore.tsx          ← komponen utama score UI
│   │   │   ├── RepoScoreSkeleton.tsx  ← loading state
│   │   │   └── RepoScoreError.tsx     ← error state
│   │   └── Popup.tsx                  ← sudah ada, tinggal tambahkan RepoScore di atas tabs
│   ├── lib/
│   │   ├── scoring.ts                 ← semua fungsi scoring (calculateRepoScore, dll)
│   │   ├── github-api.ts              ← fetch functions + caching
│   │   └── types.ts                   ← RepoData, RepoScore interfaces
│   └── background/
│       └── service-worker.ts          ← tidak perlu diubah untuk feature ini
```

---

## Checklist Sebelum Ship

```
[ ] Score muncul dalam < 2 detik setelah popup terbuka
[ ] Skeleton loading tampil saat fetch berlangsung
[ ] Error state tampil dengan benar untuk private repo (404)
[ ] Error state tampil untuk rate limit (403)
[ ] Cache 10 menit bekerja — buka repo yang sama 2x tidak fetch ulang
[ ] Score bar animasi smooth (ease-out 600ms)
[ ] Color sesuai dengan label (green/blue/amber/muted)
[ ] 3 bullets semua terisi, tidak ada yang undefined atau kosong
[ ] Tombol Scan tetap muncul dan berfungsi normal di semua state
[ ] Tidak ada console errors di production build
[ ] Test di 5 repo berbeda: large (>10k stars), medium (1k-10k),
    small (<100), fork, dan private repo
```

---

*Kirim demo video ke Caesar setelah semua checklist done.*
*Target: score muncul sebelum user perlu scroll atau klik apapun.*
