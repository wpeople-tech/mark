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
