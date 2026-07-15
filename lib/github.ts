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
    return text.slice(0, 2500)
  } catch {
    return null
  }
}

export async function packRepo(owner: string, repo: string): Promise<string> {
  const branch = await getDefaultBranch(owner, repo)
  const tree = await getFileTree(owner, repo, branch)

  const targets = MANIFEST_FILES.filter(f => tree.includes(f)).slice(0, 20)

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
  return packed.slice(0, 32000)
}
