# MARK Intelligence — Repo Score Feature Implementation Plan
**Version:** 1.0  
**Created:** 2026-01-20  
**Status:** Ready for Implementation  
**Source:** [mark-reposcore-dev-brief.md](./mark-reposcore-dev-brief.md)

---

## Overview

This plan implements the **Repo Score** feature for MARK Intelligence Chrome Extension. The feature provides instant repository intelligence (0-100 score + 3 bullets) **before** the user clicks "Scan", using only GitHub REST API data (no backend call).

### Key Design Decisions
- **Client-side scoring** — no call to `/api/forge`, runs in popup JS
- **GitHub API direct** — 3 parallel fetch calls from extension to api.github.com
- **10-min cache** — `chrome.storage.session` keyed by `repo_score_${owner}_${repo}`
- **< 2 second load** — appears immediately when popup opens on a GitHub repo page
- **Error-tolerant** — if score fails (404/403/network), scan button still works

---

## File Structure

```
extension/
├── packages/shared/lib/utils/
│   └── types.ts                           [MODIFY] Add RepoData, RepoScore types
└── pages/popup/src/
    ├── lib/
    │   ├── github-api.ts                  [CREATE] Fetch GitHub API + cache
    │   └── scoring.ts                     [CREATE] calculateRepoScore + helpers
    ├── components/
    │   ├── RepoScore.tsx                  [CREATE] Main score card UI
    │   ├── RepoScoreSkeleton.tsx          [CREATE] Loading skeleton
    │   └── RepoScoreError.tsx             [CREATE] Error state UI
    ├── Popup.tsx                          [MODIFY] Mount RepoScore component
    └── Popup.css                          [MODIFY] Add score card styles
```

---

## Implementation Steps

### Step 1: Add Types to Shared Package

**File:** `extension/packages/shared/lib/utils/types.ts`

```typescript
export interface RepoData {
  stars: number;
  forks: number;
  lastPushedAt: string;        // ISO date string
  topics: string[];
  description: string;
  isFork: boolean;
  contributorsCount: number;
  manifestFiles: string[];     // files found in root
  hasRelease: boolean;
  daysSinceLastPush: number;   // calculated from pushed_at
}

export interface RepoScoreBreakdown {
  traction: number;      // 0-25
  activity: number;      // 0-20
  buildability: number;  // 0-25
  narrativeFit: number;  // 0-20
  uniqueness: number;    // 0-10
}

export interface RepoScore {
  total: number;               // 0-100
  label: string;               // "Strong Build Candidate", etc.
  color: string;               // hex color
  breakdown: RepoScoreBreakdown;
  bullets: string[];           // array of 3 strings
}

export interface RepoScoreState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: RepoScore;
  error?: {
    code: number;              // 404, 403, 0 (network)
    message: string;
  };
}
```

---

### Step 2: GitHub API Fetch + Cache

**File:** `extension/pages/popup/src/lib/github-api.ts`

```typescript
import type { RepoData } from '@extension/shared';

const GITHUB_API = 'https://api.github.com';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const MANIFEST_FILES = [
  'package.json', 'pyproject.toml', 'go.mod', 'Cargo.toml',
  'requirements.txt', 'composer.json', 'Gemfile', 'build.gradle',
  'pom.xml', 'mcp.json', '.mcp.json'
];

interface CacheEntry {
  data: RepoData;
  timestamp: number;
}

export async function getRepoData(owner: string, repo: string): Promise<RepoData> {
  // Check cache first
  const cacheKey = `repo_score_${owner}_${repo}`;
  const cached = await chrome.storage.session.get(cacheKey);

  if (cached[cacheKey]) {
    const entry = cached[cacheKey] as CacheEntry;
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
  }

  // Fetch fresh data
  const data = await fetchRepoData(owner, repo);

  // Store in cache
  await chrome.storage.session.set({
    [cacheKey]: { data, timestamp: Date.now() } as CacheEntry
  });

  return data;
}

async function fetchRepoData(owner: string, repo: string): Promise<RepoData> {
  // Parallel fetch: repo info, contributors, root contents
  const [repoRes, contributorsRes, contentsRes] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${owner}/${repo}`),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=30&anon=true`),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/`)
  ]);

  if (!repoRes.ok) {
    throw { code: repoRes.status, message: getErrorMessage(repoRes.status) };
  }

  const repoData = await repoRes.json();
  const contributors = contributorsRes.ok ? await contributorsRes.json() : [];
  const contents = contentsRes.ok ? await contentsRes.json() : [];

  // Parse manifest files from root contents
  const manifestFiles = contents
    .filter((item: any) => item.type === 'file' && MANIFEST_FILES.includes(item.name))
    .map((item: any) => item.name);

  // Calculate days since last push
  const lastPushed = new Date(repoData.pushed_at);
  const daysSinceLastPush = Math.floor((Date.now() - lastPushed.getTime()) / (1000 * 60 * 60 * 24));

  return {
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    lastPushedAt: repoData.pushed_at,
    topics: repoData.topics || [],
    description: repoData.description || '',
    isFork: repoData.fork || false,
    contributorsCount: Array.isArray(contributors) ? contributors.length : 0,
    manifestFiles,
    hasRelease: repoData.has_releases || false,
    daysSinceLastPush
  };
}

function getErrorMessage(status: number): string {
  if (status === 404) return 'Repo private or not found. Score only available for public repos.';
  if (status === 403) return 'GitHub API rate limit. Try again in a few minutes.';
  return 'Failed to load repo data. Check your connection.';
}
```

---

### Step 3: Scoring Engine

**File:** `extension/pages/popup/src/lib/scoring.ts`

```typescript
import type { RepoData, RepoScore, RepoScoreBreakdown } from '@extension/shared';

export function calculateRepoScore(data: RepoData): RepoScore {
  // 1. TRACTION (max 25)
  let traction = 0;
  if (data.stars >= 10000) traction = 25;
  else if (data.stars >= 1000) traction = 18;
  else if (data.stars >= 100) traction = 10;
  else traction = 3;

  const forkRatio = data.stars > 0 ? data.forks / data.stars : 0;
  if (forkRatio > 0.05) traction = Math.min(25, traction + 5);

  // 2. ACTIVITY (max 20)
  let activity = 0;
  const days = data.daysSinceLastPush;
  if (days <= 7) activity = 20;
  else if (days <= 30) activity = 15;
  else if (days <= 90) activity = 8;
  else activity = 2;

  if (data.hasRelease) activity = Math.min(20, activity + 3);

  // 3. BUILDABILITY (max 25)
  let buildability = 0;
  if (data.manifestFiles.length >= 2) buildability += 15;
  else if (data.manifestFiles.length === 1) buildability += 8;

  const detectedSkills = estimateSkillMatch(data.topics, data.manifestFiles);
  if (detectedSkills >= 6) buildability += 10;
  else if (detectedSkills >= 3) buildability += 6;
  else if (detectedSkills >= 1) buildability += 2;
  buildability = Math.min(25, buildability);

  // 4. NARRATIVE FIT (max 20)
  let narrativeFit = 0;
  const searchText = [...data.topics, data.description].join(' ').toLowerCase();

  const AI_KEYWORDS = ['ai', 'llm', 'agent', 'mcp', 'model', 'gpt', 'claude', 'anthropic', 'openai'];
  const DEFI_KEYWORDS = ['defi', 'trading', 'wallet', 'solana', 'ethereum', 'token', 'dex'];
  const DEVTOOL_KEYWORDS = ['cli', 'sdk', 'api', 'developer', 'tool', 'library', 'framework'];
  const DATA_KEYWORDS = ['data', 'analytics', 'dashboard', 'monitor', 'metrics'];

  const hasAI = AI_KEYWORDS.some(kw => searchText.includes(kw));
  const hasDefi = DEFI_KEYWORDS.some(kw => searchText.includes(kw));
  const hasDevTool = DEVTOOL_KEYWORDS.some(kw => searchText.includes(kw));
  const hasData = DATA_KEYWORDS.some(kw => searchText.includes(kw));

  if (hasAI) narrativeFit = 20;
  else if (hasDefi) narrativeFit = 16;
  else if (hasDevTool) narrativeFit = 12;
  else if (hasData) narrativeFit = 8;
  else narrativeFit = 4;

  if (data.manifestFiles.includes('mcp.json') || data.manifestFiles.includes('.mcp.json')) {
    narrativeFit = Math.min(20, narrativeFit + 5);
  }

  // 5. UNIQUENESS (max 10)
  let uniqueness = data.isFork ? 3 : 10;
  if (data.contributorsCount > 10) uniqueness = Math.min(10, uniqueness + 3);

  // TOTAL
  const total = traction + activity + buildability + narrativeFit + uniqueness;

  // LABEL + COLOR
  let label: string;
  let color: string;

  if (total >= 85) {
    label = 'Strong Build Candidate';
    color = '#1B6B28';
  } else if (total >= 65) {
    label = 'Good Build Candidate';
    color = '#1A47A8';
  } else if (total >= 45) {
    label = 'Moderate Potential';
    color = '#B07D00';
  } else {
    label = 'Low Priority';
    color = '#888785';
  }

  // BULLETS
  const bullets = generateBullets(data, { traction, activity, buildability, narrativeFit, uniqueness });

  return {
    total,
    label,
    color,
    breakdown: { traction, activity, buildability, narrativeFit, uniqueness },
    bullets
  };
}

function estimateSkillMatch(topics: string[], manifestFiles: string[]): number {
  let count = 0;
  const signals = [...topics, ...manifestFiles].join(' ').toLowerCase();

  const SKILL_SIGNALS: Record<string, number> = {
    'package.json': 2, 'typescript': 1, 'nextjs': 1, 'react': 1,
    'tailwind': 1, 'prisma': 1, 'pyproject.toml': 1, 'fastapi': 1,
    'postgres': 1, 'go.mod': 1, 'cargo.toml': 1, 'docker': 1,
    'mcp': 2, 'mcp.json': 2
  };

  for (const [signal, weight] of Object.entries(SKILL_SIGNALS)) {
    if (signals.includes(signal)) count += weight;
  }

  return Math.min(count, 10);
}

function generateBullets(
  data: RepoData,
  breakdown: RepoScoreBreakdown
): string[] {
  const bullets: string[] = [];

  // Bullet 1: Traction + Activity
  const starLabel = data.stars >= 10000 ? `${(data.stars / 1000).toFixed(0)}k` :
                    data.stars >= 1000 ? `${(data.stars / 1000).toFixed(1)}k` : `${data.stars}`;

  const activityLabel = data.daysSinceLastPush <= 1 ? 'commit dalam 24 jam terakhir' :
                        data.daysSinceLastPush <= 7 ? `last commit ${data.daysSinceLastPush} hari lalu` :
                        data.daysSinceLastPush <= 30 ? `last commit ${data.daysSinceLastPush} hari lalu` :
                        `last commit ${Math.round(data.daysSinceLastPush / 30)} bulan lalu`;

  if (breakdown.traction >= 18 && breakdown.activity >= 15) {
    bullets.push(`${starLabel} stars dengan ${activityLabel} — narrative sedang aktif bergerak, window belum tutup`);
  } else if (breakdown.traction >= 10) {
    bullets.push(`${starLabel} stars, ${activityLabel} — traction cukup untuk launch yang credible`);
  } else {
    bullets.push(`${starLabel} stars — repo kecil tapi ${breakdown.activity >= 15 ? 'sangat aktif dikembangkan' : 'perlu dicek apakah masih maintained'}`);
  }

  // Bullet 2: Buildability
  const stackNames = getStackNames(data.manifestFiles, data.topics);
  const isMCP = data.manifestFiles.includes('mcp.json') || data.topics.includes('mcp');

  if (isMCP) {
    bullets.push(`MCP-compatible terdeteksi — stack ${stackNames} langsung bisa di-scan MARK untuk CLAUDE.md yang actionable`);
  } else if (breakdown.buildability >= 20) {
    bullets.push(`Stack ${stackNames} terdeteksi dengan jelas — skill matching tinggi, CLAUDE.md output akan specific dan langsung pakai`);
  } else if (breakdown.buildability >= 10) {
    bullets.push(`Stack ${stackNames || 'terdeteksi sebagian'} — cukup untuk generate CLAUDE.md yang usable`);
  } else {
    bullets.push(`Stack kurang manifest files — scan tetap bisa jalan tapi CLAUDE.md mungkin lebih generic`);
  }

  // Bullet 3: Narrative
  if (breakdown.narrativeFit >= 18) {
    const angle = getNarrativeAngle(data.topics, data.description);
    bullets.push(`Narrative ${angle} — utility angle mudah dibentuk, ticker punya konteks yang kuat untuk launch di pump.fun`);
  } else if (breakdown.narrativeFit >= 12) {
    bullets.push(`Developer tool dengan audience yang jelas — ada angle utility yang bisa dilaunch, tapi butuh positioning yang tepat`);
  } else if (breakdown.narrativeFit >= 8) {
    bullets.push(`Data dan analytics angle tersedia — bisa jadi utility yang niche tapi solid untuk audience yang spesifik`);
  } else {
    bullets.push(`Narrative angle belum jelas dari metadata — perlu full scan untuk lihat apakah ada build opportunity yang viable`);
  }

  return bullets;
}

function getStackNames(manifestFiles: string[], topics: string[]): string {
  const stacks: string[] = [];
  const all = [...manifestFiles, ...topics].join(' ').toLowerCase();

  if (all.includes('package.json') || all.includes('typescript') || all.includes('nextjs')) stacks.push('TypeScript');
  if (all.includes('react') || all.includes('nextjs')) stacks.push('React');
  if (all.includes('python') || all.includes('pyproject')) stacks.push('Python');
  if (all.includes('go.mod')) stacks.push('Go');
  if (all.includes('cargo')) stacks.push('Rust');
  if (all.includes('mcp')) stacks.push('MCP');

  return stacks.slice(0, 3).join(' + ') || 'terdeteksi';
}

function getNarrativeAngle(topics: string[], description: string): string {
  const text = [...topics, description].join(' ').toLowerCase();

  if (text.includes('mcp') || text.includes('model-context-protocol')) return 'MCP';
  if (text.includes('agent') || text.includes('agentic')) return 'AI Agent';
  if (text.includes('llm') || text.includes('claude') || text.includes('gpt')) return 'LLM / AI';
  if (text.includes('defi') || text.includes('trading')) return 'DeFi';
  if (text.includes('solana') || text.includes('web3')) return 'Web3';
  if (text.includes('cli') || text.includes('developer')) return 'DevTool';

  return 'utility';
}
```

---

### Step 4: RepoScore Component

**File:** `extension/pages/popup/src/components/RepoScore.tsx`

```tsx
import { useEffect, useState } from 'react';
import type { RepoInfo, RepoScore as RepoScoreType } from '@extension/shared';
import { getRepoData } from '../lib/github-api';
import { calculateRepoScore } from '../lib/scoring';
import RepoScoreSkeleton from './RepoScoreSkeleton';
import RepoScoreError from './RepoScoreError';

interface RepoScoreProps {
  repo: RepoInfo;
}

export default function RepoScore({ repo }: RepoScoreProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [score, setScore] = useState<RepoScoreType | null>(null);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchScore() {
      setStatus('loading');
      setProgress(0);

      try {
        const data = await getRepoData(repo.owner, repo.repo);
        if (!mounted) return;

        const result = calculateRepoScore(data);
        setScore(result);
        setStatus('success');
      } catch (err: any) {
        if (!mounted) return;
        setError({ code: err.code || 0, message: err.message || 'Failed to load repo score' });
        setStatus('error');
      }
    }

    fetchScore();

    return () => {
      mounted = false;
    };
  }, [repo.owner, repo.repo]);

  useEffect(() => {
    if (status === 'success' && score) {
      let current = 0;
      const target = score.total;
      const duration = 600;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progressRatio, 3); // ease-out cubic
        current = Math.round(eased * target);
        setProgress(current);

        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [status, score]);

  if (status === 'loading') {
    return <RepoScoreSkeleton />;
  }

  if (status === 'error' || !score) {
    return <RepoScoreError error={error} />;
  }

  return (
    <div className="repo-score-card">
      <div className="repo-score-header">
        <div className="repo-score-number" style={{ color: score.color }}>
          {progress}
        </div>
        <div className="repo-score-label" style={{ color: score.color }}>
          {score.label}
        </div>
      </div>

      <div className="repo-score-bar-track">
        <div
          className="repo-score-bar-fill"
          style={{
            width: `${progress}%`,
            background: score.color
          }}
        />
      </div>

      <div className="repo-score-bullets">
        {score.bullets.map((bullet, i) => (
          <div key={i} className="repo-score-bullet">
            <span className="repo-score-bullet-dot">•</span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Step 5: Skeleton Component

**File:** `extension/pages/popup/src/components/RepoScoreSkeleton.tsx`

```tsx
export default function RepoScoreSkeleton() {
  return (
    <div className="repo-score-card">
      <div className="repo-score-header">
        <div className="skeleton-score-number" />
        <div className="skeleton-score-label" />
      </div>
      <div className="skeleton-score-bar" />
      <div className="repo-score-bullets">
        <div className="skeleton-bullet" />
        <div className="skeleton-bullet" />
        <div className="skeleton-bullet" />
      </div>
    </div>
  );
}
```

---

### Step 6: Error Component

**File:** `extension/pages/popup/src/components/RepoScoreError.tsx`

```tsx
interface RepoScoreErrorProps {
  error: { code: number; message: string } | null;
}

export default function RepoScoreError({ error }: RepoScoreErrorProps) {
  return (
    <div className="repo-score-error">
      <div className="repo-score-error-icon">○</div>
      <div className="repo-score-error-text">
        {error?.message || 'Score unavailable'}
      </div>
      <div className="repo-score-error-hint">
        Scan button below still works — full analysis doesn't need this score
      </div>
    </div>
  );
}
```

---

### Step 7: Modify Popup.tsx

**File:** `extension/pages/popup/src/Popup.tsx`

Import at top:
```typescript
import RepoScore from './components/RepoScore';
```

Insert in JSX, inside `.popup-body`, **before** the idle/scan section:
```tsx
{repo && <RepoScore repo={repo} />}
```

Position: after glass zone, before `{!repo && state.status === 'idle' && (...)}` block.

---

### Step 8: Add CSS

**File:** `extension/pages/popup/src/Popup.css`

Add at end of file:

```css
/* Repo Score */
.repo-score-card {
  border: 0.5px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px;
  margin-bottom: 16px;
  background: white;
}

.repo-score-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.repo-score-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.repo-score-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.repo-score-bar-track {
  height: 6px;
  background: var(--surface);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 12px;
}

.repo-score-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.repo-score-bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.repo-score-bullet {
  display: flex;
  gap: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ink);
}

.repo-score-bullet-dot {
  color: var(--muted);
  flex-shrink: 0;
  margin-top: 1px;
}

/* Skeleton */
.skeleton-score-number {
  width: 60px;
  height: 32px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  animation: skeletonPulse 1.2s ease-in-out infinite;
}

.skeleton-score-label {
  width: 140px;
  height: 16px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  animation: skeletonPulse 1.2s ease-in-out infinite;
}

.skeleton-score-bar {
  width: 100%;
  height: 6px;
  background: var(--surface);
  border-radius: 99px;
  margin-bottom: 12px;
  animation: skeletonPulse 1.2s ease-in-out infinite;
}

.skeleton-bullet {
  width: 100%;
  height: 14px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  animation: skeletonPulse 1.2s ease-in-out infinite;
}

.skeleton-bullet:nth-child(2) {
  width: 95%;
}

.skeleton-bullet:nth-child(3) {
  width: 90%;
}

/* Error */
.repo-score-error {
  border: 0.5px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px 16px;
  margin-bottom: 16px;
  text-align: center;
  background: var(--surface);
}

.repo-score-error-icon {
  font-size: 24px;
  color: var(--muted);
  margin-bottom: 8px;
}

.repo-score-error-text {
  font-size: 12px;
  color: var(--ink);
  font-weight: 500;
  margin-bottom: 4px;
}

.repo-score-error-hint {
  font-size: 10px;
  color: var(--muted);
  line-height: 1.5;
}
```

---

## Verification Commands

```bash
# In extension folder (use pnpm)
cd extension
pnpm run lint
pnpm run build

# In root project (use yarn)
cd ..
yarn lint
yarn build
```

---

## Success Criteria

- [ ] Score appears in < 2s after popup opens on a GitHub repo page
- [ ] Skeleton loading state shows during fetch
- [ ] Score bar animates smoothly from 0 to final value (600ms ease-out)
- [ ] Color matches tier (green ≥85, blue ≥65, amber ≥45, muted <45)
- [ ] 3 bullets all display, none empty or undefined
- [ ] Error state shows for private repo (404), rate limit (403), network errors
- [ ] Scan button remains visible and functional in all states
- [ ] Cache works: opening same repo twice within 10 min doesn't refetch
- [ ] No console errors in production build
- [ ] Test on 5 repos: large (>10k stars), medium (1k-10k), small (<100), fork, private

---

## Edge Cases Handled

| Scenario | Behavior |
|---|---|
| Popup opens on non-GitHub page | No score shown, manual URL input shown (existing) |
| Popup opens on GitHub `/explore` | Content script filters this, no repo detected |
| Private repo | Error: "Repo private or not found" |
| GitHub API rate limit (403) | Error: "GitHub API rate limit. Try again in a few minutes." |
| Network offline | Error: "Failed to load repo data. Check your connection." |
| Repo has 0 manifest files | Score still calculated, bullet says "stack kurang manifest files" |
| Repo is a fork | Uniqueness score = 3 instead of 10 |
| Score fetch fails | Scan button still works, user can proceed with full scan |

---

## Timeline Estimate

- Step 1 (types): 5 min
- Step 2 (github-api): 15 min
- Step 3 (scoring): 20 min
- Step 4-6 (components): 25 min
- Step 7-8 (integration): 15 min
- Verification: 10 min

**Total: ~90 minutes**

---

**Status:** Ready for implementation ✓  
**Next:** Implement Step 1 → Step 8 → Verify → Ship
