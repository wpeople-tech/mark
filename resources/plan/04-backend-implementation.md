# Backend Implementation Plan
## MARK Intelligence — Core API & Libraries

**Status:** Ready for Implementation  
**Dependencies:** OpenRouter API Key, GitHub Token (optional), Upstash Redis (optional for dev)  
**Target:** 8 files — 5 libs + 1 LLM module + 2 API routes  
**Estimated Time:** 3-4 hours  
**Test Environment:** `yarn dev` → http://localhost:3000

---

## Prerequisites

### Environment Variables (.env)

```bash
# Required
OPENROUTER_API_KEY=sk-or-...

# Optional (dev fallback exists)
GITHUB_TOKEN=ghp_...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...

# Local dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** `.env` is already set up with the correct variable names.

### Dependencies (already installed)

✅ `openai@4.86.2`  
✅ `@upstash/ratelimit@2.0.8`  
✅ `@upstash/redis@1.38.0`  
✅ `fflate@0.8.3`

---

## Implementation Order

Build bottom-up — each file can be verified independently before the next depends on it.

---

## Step 1: Rate Limiting (`lib/rateLimit.ts`)

**Purpose:** Sliding window rate limiter (5 scans / 24 hours per IP)

**Source:** README §5.6

**API:**
```typescript
export async function checkRateLimit(ip: string): Promise<{
  success: boolean
  remaining: number
  reset: number
}>
```

**Logic:**
- Initialize Upstash Redis client via `Redis.fromEnv()`
- Create `Ratelimit.slidingWindow(5, '24h')` limiter
- Prefix: `mark:scan`
- Analytics: enabled
- **Dev fallback:** If Redis env vars missing, use in-memory Map with TTL (so dev works without Upstash)

**Edge Cases:**
- Missing Redis env vars → fallback to in-memory limiter with console.warn
- Redis connection failure → degrade gracefully, log error, allow scan (don't block users)

**Test:**
```typescript
const { success, remaining, reset } = await checkRateLimit('127.0.0.1')
console.log({ success, remaining, reset })
// Expected: { success: true, remaining: 4, reset: <unix timestamp> }
```

**Files Created:**
- `lib/rateLimit.ts`

---

## Step 2: GitHub Manifest Fetcher (`lib/github.ts`)

**Purpose:** Fetch manifest files from any public GitHub repo

**Source:** README §5.8

**API:**
```typescript
export async function packRepo(owner: string, repo: string): Promise<string>
```

**Constants:**
```typescript
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
```

**Logic:**
1. Get default branch via GitHub API
2. Get file tree (recursive, 1 level deep)
3. Filter manifest files that exist in tree (max 20 files)
4. Fetch raw content in parallel batches of 10
5. Cap each file at 2500 chars
6. Cap total output at 32,000 chars
7. Return concatenated string with file markers

**Headers:**
- `Authorization: token ${process.env.GITHUB_TOKEN}` (if present)
- `Accept: application/vnd.github.v3+json`
- `User-Agent: MARK-Intelligence/1.0`

**Edge Cases:**
- Repo not found (404) → throw descriptive error
- Private repo without token → throw "private repo" error
- Empty repo → return empty string with note
- No manifest files found → return README only
- Network timeout → throw after 10s

**Test:**
```typescript
const context = await packRepo('facebook', 'react')
console.log(context.slice(0, 500))
// Expected: Should contain package.json content
```

**Files Created:**
- `lib/github.ts`

---

## Step 3: Stack Detection (`lib/detectStack.ts`)

**Purpose:** Keyword scoring against 29 stack patterns

**Source:** README §5.9

**API:**
```typescript
export function detectStack(context: string): string[]
```

**Patterns (29 total):**
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
```

**Logic:**
- Lowercase the entire context string
- For each pattern, check if ANY keyword matches
- Return array of matching tag names
- No scoring, just binary match

**Edge Cases:**
- Empty context → return `[]`
- No matches → return `[]`

**Test:**
```typescript
const context = `package.json content with "react": "18.0.0" and tsconfig.json`
const tags = detectStack(context)
console.log(tags)
// Expected: ['react', 'typescript']
```

**Files Created:**
- `lib/detectStack.ts`

---

## Step 4: Skill Selection (`lib/selectSkills.ts`)

**Purpose:** Match 59 skill patterns against detected stack tags, return top 6-8

**Source:** README §5.10

**API:**
```typescript
export function selectSkills(tags: string[], maxSkills = 8): string[]
```

**Skill Map (59 skills):**
```typescript
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
```

**Logic:**
- For each skill, count how many of its tags match the input tags
- Sort by match count descending
- Return top N skills (default 8)

**Edge Cases:**
- No tags provided → return `[]`
- Fewer than N matches → return all matches
- Ties in scoring → arbitrary order (first wins)

**Test:**
```typescript
const tags = ['react', 'typescript', 'nextjs']
const skills = selectSkills(tags)
console.log(skills)
// Expected: ['next-js-app-router', 'react-component-patterns', 'typescript-strict', ...]
```

**Files Created:**
- `lib/selectSkills.ts`

---

## Step 5: ZIP Builder (`lib/buildZip.ts`)

**Purpose:** Create base64-encoded ZIP containing CLAUDE.md + skill files + setup guide

**Source:** README §5.11

**API:**
```typescript
export async function buildZip(
  markFile: string,
  skills: string[],
  owner: string,
  repo: string
): Promise<string>
```

**Contents:**
```
mark-output.zip
├── CLAUDE.md                    # The generated intelligence file
├── SETUP_GUIDE.md               # How to use this with Claude Code
└── .claude/skills/
    ├── next-js-app-router.md
    ├── react-component-patterns.md
    └── ... (selected skills only)
```

**Skill File Content (59 total):**

Each skill file will be a markdown document with:
- `# {Skill Name}`
- `## Key Patterns`
- `## Common Issues`
- `## Best Practices`

For implementation, I'll create abbreviated content for all 59 skills (README only shows 1 example).

**SETUP_GUIDE.md Template:**
```markdown
# MARK Intelligence — Setup Guide
Generated for: {owner}/{repo}

## Quick Start
1. Copy CLAUDE.md to your project root
2. Add the skill files to .claude/skills/
3. Run: claude code

## Selected Skills ({count}/59)
{skill list}

## What this gives Claude Code
- Full understanding of your tech stack
- Coding conventions and patterns from this codebase
- Ready-to-use skill files for your specific setup

Generated by MARK Intelligence — markintel.tech
```

**Logic:**
1. Create in-memory file map: `Record<string, Uint8Array>`
2. Add CLAUDE.md
3. Add SETUP_GUIDE.md
4. For each selected skill, add `.claude/skills/{skill}.md` (if content exists)
5. Use `fflate.zipSync()` with compression level 6
6. Convert to base64 via `Buffer.from(zipped).toString('base64')`

**Edge Cases:**
- Missing skill content → skip that skill file (log warning)
- Empty markFile → still create ZIP with placeholder
- Very large markFile → fflate handles compression automatically

**Test:**
```typescript
const zipBase64 = await buildZip(
  '# CLAUDE.md\n\nTest content',
  ['next-js-app-router', 'react-component-patterns'],
  'facebook',
  'react'
)
console.log(zipBase64.slice(0, 50))
// Expected: base64 string starting with "UEsDBBQA..."
```

**Files Created:**
- `lib/buildZip.ts`

---

## Step 6: LLM Module (`app/lib/llm.ts`)

**Purpose:** OpenRouter streaming + retry logic + prompts

**Source:** README §5.7

**Replaces:** Existing `app/lib/llm.ts` placeholder

**API:**
```typescript
export const MARK_SYSTEM_PROMPT: string
export const OPPORTUNITIES_SYSTEM_PROMPT: string

export function streamMarkFile(
  context: string,
  tags: string[],
  skills: string[]
): Promise<Stream<ChatCompletionChunk>>

export async function generateOpportunities(
  markFile: string,
  repoName: string,
  stack: string[]
): Promise<any[]>
```

**Constants:**

```typescript
export const MARK_SYSTEM_PROMPT = `You are MARK, a GitHub repository intelligence engine.

Given a repository's manifest content and detected stack, generate a comprehensive CLAUDE.md file.

The CLAUDE.md must include:
- ## Project Overview: what the repo does, its core capability, intended audience
- ## Tech Stack: complete breakdown (language, framework, build system, testing, deployment)
- ## Architecture Patterns: key design decisions, patterns detected in the codebase
- ## Core Capabilities: what this codebase can actually DO (not just what it is)
- ## Coding Conventions: naming, file organization, patterns from the manifests
- ## Development Workflow: setup steps, build commands, testing
- ## Selected Claude Skills: the specific skill files selected and why
- ## Known Constraints: platform limitations, dependencies to be aware of

Be specific and grounded in the actual manifest content.
Do not invent capabilities that aren't evident from the files.
Output the CLAUDE.md content directly. No preamble, no explanation.`

export const OPPORTUNITIES_SYSTEM_PROMPT = `You are a crypto product strategist specializing in pump.fun utility launches.

Given a GitHub repo's MARK File (intelligence report), generate exactly 3 utility website ideas.

Each idea must:
1. Use the repo's ACTUAL core technical capability as the engine (not just "make a website about this")
2. Target a specific audience that already exists and would genuinely use it
3. Be buildable by 1 developer in 1-2 weeks (realistic scope)
4. Have a clear reason why token holders would exist (demand driver)

Respond ONLY with valid JSON. No markdown. No explanation. No preamble.

Required format:
[
  {
    "websiteName": "ToolName",
    "domain": "toolname.xyz",
    "ticker": "$TOOL",
    "valueProp": "One sentence: what it does and who it helps.",
    "pumpFunAngle": "Why token holders would exist. What creates demand. Be specific.",
    "buildEffort": "3 days",
    "coreCapabilityUsed": "Which specific capability from the MARK File this uses"
  }
]`
```

**Retry Logic:**
```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      if (err?.status === 429) {
        const retryAfter = parseInt(err.headers?.['retry-after'] ?? '5')
        await new Promise(r => setTimeout(r, retryAfter * 1000 * (attempt + 1)))
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}
```

**streamMarkFile Logic:**
1. Call OpenRouter with `poolside/laguna-m.1:free`
2. Max tokens: 4000
3. Messages: system prompt + user prompt with stack/skills/context
4. Stream: true
5. Wrap in `callWithRetry`

**generateOpportunities Logic:**
1. Call OpenRouter with same model
2. Max tokens: 1500
3. Messages: system prompt + user prompt with markFile/stack/repoName
4. Stream: false
5. Parse JSON response (with try/catch fallback to `[]`)

**Edge Cases:**
- Model at capacity (429) → retry with exponential backoff
- Invalid JSON in opportunities response → return `[]`
- Network timeout → throw error after retries exhausted
- Rate limit on OpenRouter side → handled by retry logic

**Test:**
```typescript
const stream = await streamMarkFile(
  'sample manifest content',
  ['react', 'typescript'],
  ['next-js-app-router']
)
for await (const chunk of stream) {
  console.log(chunk.choices[0]?.delta?.content)
}
// Expected: streaming markdown text
```

**Files Modified:**
- `app/lib/llm.ts` (full replacement)

---

## Step 7: Forge API Route (`app/api/forge/route.ts`)

**Purpose:** SSE endpoint that orchestrates the entire scan flow

**Source:** README §5.12

**Endpoint:** `POST /api/forge`

**Request Body:**
```typescript
{ owner: string, repo: string }
```

**Response:** Server-Sent Events stream

**SSE Event Types:**
```typescript
// 1. Initial status
{ type: 'status', message: 'Reading manifest files...', remaining: 4 }

// 2. Stack detected
{ type: 'stack', tags: ['react', 'typescript'] }

// 3. Skills selected
{ type: 'skills', skills: ['next-js-app-router', ...], count: 6 }

// 4. Content streaming (many events)
{ type: 'content', text: '# CLAUDE.md\n\n...' }

// 5. Done
{ type: 'done', zipBase64: '...', markFile: '...', tags: [...], skills: [...], repoName: 'owner/repo' }

// Error event
{ type: 'error', message: 'Error description' }
```

**Logic Flow:**
```typescript
1. CORS check
   - If origin is chrome-extension://* → allow
   - If origin is NEXT_PUBLIC_APP_URL → allow
   - Else → null origin

2. Handle OPTIONS preflight
   - Return 204 with CORS headers

3. Rate limit check
   - Get IP from x-forwarded-for header
   - Call checkRateLimit(ip)
   - If !success → return 429 JSON with error message

4. Parse request body
   - Validate owner and repo are present
   - If missing → return 400 JSON

5. Create SSE stream
   - TextEncoder for encoding events
   - ReadableStream with start(controller)

6. Send events:
   a. status: 'Reading manifest files...'
   b. Call packRepo(owner, repo)
   c. Call detectStack(context)
   d. Send stack event with tags
   e. Call selectSkills(tags)
   f. Send skills event
   g. status: 'Generating MARK File...'
   h. Call streamMarkFile(context, tags, skills)
   i. For each chunk, send content event
   j. Call buildZip(fullContent, skills, owner, repo)
   k. Send done event with all data

7. Error handling
   - Wrap in try/catch
   - Send error event if any step fails
   - Always close controller in finally

8. Return Response
   - headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
   - Include CORS headers
```

**CORS Headers:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': isExtension || isSelf ? origin : 'null',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

**Runtime Config:**
```typescript
export const runtime = 'nodejs'  // Required for fflate
```

**Edge Cases:**
- Missing owner/repo → 400 with clear message
- Rate limited → 429 with remaining/reset info
- GitHub API failure → error event in SSE stream (don't close stream)
- LLM timeout → error event in SSE stream
- Client disconnects mid-stream → cleanup gracefully

**Test:**
```bash
curl -N http://localhost:3000/api/forge \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"owner":"facebook","repo":"react"}'
```

Expected output:
```
data: {"type":"status","message":"Reading manifest files...","remaining":4}

data: {"type":"stack","tags":["react","typescript","nextjs"]}

data: {"type":"skills","skills":["next-js-app-router","react-component-patterns"],"count":6}

data: {"type":"status","message":"Generating MARK File..."}

data: {"type":"content","text":"# CLAUDE"}

data: {"type":"content","text":".md\n\n"}

...

data: {"type":"done","zipBase64":"UEsDBBQA...","markFile":"...","tags":[...],"skills":[...],"repoName":"facebook/react"}
```

**Files Created:**
- `app/api/forge/route.ts`

---

## Step 8: Opportunities API Route (`app/api/opportunities/route.ts`)

**Purpose:** Generate 3 pump.fun-ready build ideas

**Source:** README §5.13

**Endpoint:** `POST /api/opportunities`

**Request Body:**
```typescript
{
  markFile: string
  repoName: string
  stack: string[]
}
```

**Response:** JSON
```typescript
{
  ideas: BuildIdea[]
}
```

**BuildIdea Type:**
```typescript
interface BuildIdea {
  websiteName: string
  domain: string
  ticker: string
  valueProp: string
  pumpFunAngle: string
  buildEffort: string
  coreCapabilityUsed: string
}
```

**Logic:**
```typescript
1. CORS check
   - Wildcard allowed (called separately, non-critical)

2. Handle OPTIONS preflight

3. Parse request body
   - Extract markFile, repoName, stack

4. Call generateOpportunities(markFile, repoName, stack)

5. Return JSON
   - { ideas: [...] }
   - If error → { ideas: [], error: message }
```

**CORS Headers:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

**Runtime Config:**
```typescript
export const runtime = 'nodejs'
```

**Edge Cases:**
- LLM returns invalid JSON → return `{ ideas: [] }`
- LLM timeout → return `{ ideas: [], error: 'Timeout' }`
- Missing fields → return `{ ideas: [], error: 'Missing required fields' }`

**Test:**
```bash
curl http://localhost:3000/api/opportunities \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"markFile":"# Sample CLAUDE.md","repoName":"facebook/react","stack":["react","typescript"]}'
```

Expected output:
```json
{
  "ideas": [
    {
      "websiteName": "ReactPlayground",
      "domain": "reactplayground.xyz",
      "ticker": "$PLAY",
      "valueProp": "Live React component playground with instant preview for developers.",
      "pumpFunAngle": "Token holders get priority access to premium templates and faster build times.",
      "buildEffort": "5 days",
      "coreCapabilityUsed": "React's component rendering and JSX transformation"
    },
    ...
  ]
}
```

**Files Created:**
- `app/api/opportunities/route.ts`

---

## Verification Steps

After implementing each file:

### 1. Type Check
```bash
yarn build
# Should compile with no errors
```

### 2. Manual API Test
```bash
yarn dev

# Terminal 2:
curl -N http://localhost:3000/api/forge \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"owner":"facebook","repo":"react"}'
```

### 3. Extension Integration Test
```bash
# Terminal 1: yarn dev
# Terminal 2: cd extension && pnpm dev
# Load unpacked extension
# Open github.com/facebook/react
# Click MARK icon → Click "Scan this repo"
# Should see:
# - Glass animation starts
# - Stack chips appear (react, typescript, etc.)
# - Terminal streams lines
# - Download button becomes active
# - Ideas tab shows 3 cards
```

---

## File Structure After Implementation

```
/Users/zidane/project/wp/mark/
├── lib/
│   ├── rateLimit.ts          ✅ NEW
│   ├── github.ts             ✅ NEW
│   ├── detectStack.ts        ✅ NEW
│   ├── selectSkills.ts       ✅ NEW
│   ├── buildZip.ts           ✅ NEW
│   ├── utils.ts              (existing)
│   ├── landing-data.ts       (existing)
│   └── hooks/                (existing)
├── app/
│   ├── lib/
│   │   └── llm.ts            ✅ REPLACED
│   └── api/
│       ├── forge/
│       │   └── route.ts      ✅ NEW
│       └── opportunities/
│           └── route.ts      ✅ NEW
```

---

## Known Limitations & Future Enhancements

### Current Scope (MVP)
- ✅ 5 scans per IP per day (rate limit)
- ✅ Public repos only (GitHub API limitation without auth)
- ✅ 29 stack patterns, 59 skills
- ✅ Max 20 manifest files per repo
- ✅ Max 32KB total manifest content
- ✅ Free OpenRouter model (`poolside/laguna-m.1:free`)

### Not Implemented (out of scope)
- ❌ User accounts / authentication
- ❌ Scan history / persistence
- ❌ Custom skill uploads
- ❌ Private repo scanning (requires OAuth)
- ❌ Webhook notifications
- ❌ Bulk scanning
- ❌ Analytics dashboard

### Possible Future Enhancements
- Upgrade to paid LLM tier for faster/better generation
- Add more stack patterns (e.g., Vue, Svelte, Astro)
- Add more skills (currently 59, could expand to 100+)
- Support for monorepos (detect multiple projects)
- Support for private repos via GitHub OAuth
- Scan history stored in Upstash (or Supabase)
- Real-time collaboration (multiple users scanning same repo)

---

## Success Criteria

✅ `yarn build` succeeds with no errors  
✅ `yarn dev` starts without crashes  
✅ `curl /api/forge` returns SSE stream with all 5 event types  
✅ `curl /api/opportunities` returns valid JSON with 3 ideas  
✅ Extension popup connects to localhost:3000 successfully  
✅ Full scan flow works: GitHub → detect → scan → stream → download ZIP  
✅ Rate limit enforces 5/24h per IP  
✅ CORS allows chrome-extension:// origins  

---

## Timeline Estimate

| Step | File | Time |
|------|------|------|
| 1 | `lib/rateLimit.ts` | 20 min |
| 2 | `lib/github.ts` | 30 min |
| 3 | `lib/detectStack.ts` | 15 min |
| 4 | `lib/selectSkills.ts` | 15 min |
| 5 | `lib/buildZip.ts` | 30 min |
| 6 | `app/lib/llm.ts` | 30 min |
| 7 | `app/api/forge/route.ts` | 45 min |
| 8 | `app/api/opportunities/route.ts` | 15 min |
| **Testing** | Manual + Extension | 30 min |
| **Total** | | **3h 50min** |

---

## Next Steps After Backend Complete

1. ✅ Backend implementation (this plan)
2. ⏭️ Deploy to Vercel (markintel.tech)
3. ⏭️ Update extension CEB_API_BASE to production URL
4. ⏭️ Build extension for Chrome Web Store (`pnpm zip`)
5. ⏭️ Create Web Store listing assets (screenshots, promo tiles)
6. ⏭️ Submit extension for review (1-3 days)
7. ⏭️ Launch $MARK token on pump.fun
8. ⏭️ Marketing push (Twitter, ProductHunt, etc.)

---

**Status:** Ready to proceed with Step 1 (lib/rateLimit.ts)
