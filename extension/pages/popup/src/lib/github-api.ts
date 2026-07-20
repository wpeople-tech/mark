import type { RepoData } from '@extension/shared';

const GITHUB_API = 'https://api.github.com';
const CACHE_TTL = 10 * 60 * 1000;

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
  'mcp.json',
  '.mcp.json',
];

interface CacheEntry {
  data: RepoData;
  timestamp: number;
}

type ContentItem = {
  type: string;
  name: string;
};

interface RepoScoreError {
  code: number;
  message: string;
}

const getErrorMessage = (status: number): string => {
  if (status === 404) return 'Repo private or not found. Score only available for public repos.';
  if (status === 403) return 'GitHub API rate limit. Try again in a few minutes.';
  return 'Failed to load repo data. Check your connection.';
};

const fetchRepoData = async (owner: string, repo: string): Promise<RepoData> => {
  const [repoRes, contributorsRes, contentsRes] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${owner}/${repo}`),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=30&anon=true`),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/`),
  ]);

  if (!repoRes.ok) {
    throw { code: repoRes.status, message: getErrorMessage(repoRes.status) } as RepoScoreError;
  }

  const repoData = await repoRes.json();
  const contributors = contributorsRes.ok ? await contributorsRes.json() : [];
  const contents = contentsRes.ok ? await contentsRes.json() : [];

  const manifestFiles = Array.isArray(contents)
    ? (contents as ContentItem[])
        .filter(item => item.type === 'file' && MANIFEST_FILES.includes(item.name))
        .map(item => item.name)
    : [];

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
    daysSinceLastPush,
  };
};

const getCachedRepoData = async (owner: string, repo: string): Promise<RepoData> => {
  const cacheKey = `repo_score_${owner}_${repo}`;
  const cached = await chrome.storage.session.get(cacheKey);

  if (cached[cacheKey]) {
    const entry = cached[cacheKey] as CacheEntry;
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
  }

  const data = await fetchRepoData(owner, repo);

  await chrome.storage.session.set({
    [cacheKey]: { data, timestamp: Date.now() } as CacheEntry,
  });

  return data;
};

export type { RepoScoreError };
export { getCachedRepoData as getRepoData };
