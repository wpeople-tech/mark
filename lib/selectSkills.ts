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
