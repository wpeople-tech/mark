import type { RepoData, RepoScore, RepoScoreBreakdown } from '@extension/shared';

const AI_KEYWORDS = [
  'ai',
  'llm',
  'agent',
  'mcp',
  'model',
  'gpt',
  'claude',
  'anthropic',
  'openai',
  'ollama',
  'langchain',
  'rag',
  'embedding',
  'inference',
  'fine-tuning',
  'transformer',
];

const DEFI_KEYWORDS = [
  'defi',
  'trading',
  'wallet',
  'chain',
  'solana',
  'ethereum',
  'token',
  'swap',
  'dex',
  'amm',
  'yield',
  'stake',
  'nft',
  'web3',
  'blockchain',
  'crypto',
  'protocol',
];

const DEVTOOL_KEYWORDS = [
  'cli',
  'sdk',
  'api',
  'developer',
  'tool',
  'library',
  'framework',
  'plugin',
  'extension',
  'integration',
  'automation',
];

const DATA_KEYWORDS = [
  'data',
  'analytics',
  'dashboard',
  'monitor',
  'tracker',
  'metrics',
  'visualization',
  'report',
  'chart',
];

const SKILL_SIGNALS: Record<string, number> = {
  'package.json': 2,
  typescript: 1,
  nextjs: 1,
  react: 1,
  tailwind: 1,
  prisma: 1,
  'pyproject.toml': 1,
  fastapi: 1,
  postgres: 1,
  'go.mod': 1,
  'cargo.toml': 1,
  docker: 1,
  mcp: 2,
  'mcp.json': 2,
  jest: 1,
  vitest: 1,
  zod: 1,
  drizzle: 1,
  supabase: 1,
};

const estimateSkillMatch = (topics: string[], manifestFiles: string[]): number => {
  let count = 0;
  const signals = [...topics, ...manifestFiles].join(' ').toLowerCase();

  for (const [signal, weight] of Object.entries(SKILL_SIGNALS)) {
    if (signals.includes(signal)) count += weight;
  }

  return Math.min(count, 10);
};

const getStackNames = (manifestFiles: string[], topics: string[]): string => {
  const stacks: string[] = [];
  const all = [...manifestFiles, ...topics].join(' ').toLowerCase();

  if (all.includes('package.json') || all.includes('typescript') || all.includes('nextjs')) stacks.push('TypeScript');
  if (all.includes('react') || all.includes('nextjs')) stacks.push('React');
  if (all.includes('python') || all.includes('pyproject')) stacks.push('Python');
  if (all.includes('go.mod')) stacks.push('Go');
  if (all.includes('cargo')) stacks.push('Rust');
  if (all.includes('fastapi')) stacks.push('FastAPI');
  if (all.includes('mcp')) stacks.push('MCP');
  if (all.includes('bun')) stacks.push('Bun');

  return stacks.slice(0, 3).join(' + ') || 'detected';
};

const getNarrativeAngle = (topics: string[], description: string): string => {
  const text = [...topics, description].join(' ').toLowerCase();

  if (text.includes('mcp') || text.includes('model-context-protocol')) return 'MCP';
  if (text.includes('agent') || text.includes('agentic')) return 'AI Agent';
  if (text.includes('llm') || text.includes('claude') || text.includes('gpt')) return 'LLM / AI';
  if (text.includes('defi') || text.includes('trading')) return 'DeFi';
  if (text.includes('solana') || text.includes('blockchain') || text.includes('web3')) return 'Web3';
  if (text.includes('cli') || text.includes('developer')) return 'DevTool';

  return 'utility';
};

const generateBullets = (data: RepoData, breakdown: RepoScoreBreakdown): string[] => {
  const bullets: string[] = [];

  const starLabel =
    data.stars >= 10000
      ? `${(data.stars / 1000).toFixed(0)}k`
      : data.stars >= 1000
        ? `${(data.stars / 1000).toFixed(1)}k`
        : `${data.stars}`;

  const activityLabel =
    data.daysSinceLastPush <= 1
      ? 'commit in the last 24 hours'
      : data.daysSinceLastPush <= 7
        ? `last commit ${data.daysSinceLastPush} days ago`
        : data.daysSinceLastPush <= 30
          ? `last commit ${data.daysSinceLastPush} days ago`
          : `last commit ${Math.round(data.daysSinceLastPush / 30)} months ago`;

  if (breakdown.traction >= 18 && breakdown.activity >= 15) {
    bullets.push(`${starLabel} stars with ${activityLabel} — narrative is moving, the window is still open`);
  } else if (breakdown.traction >= 10) {
    bullets.push(`${starLabel} stars, ${activityLabel} — enough traction for a credible launch`);
  } else {
    bullets.push(
      `${starLabel} stars — small repo but ${breakdown.activity >= 15 ? 'very actively developed' : 'worth checking if it is still maintained'}`,
    );
  }

  const stackNames = getStackNames(data.manifestFiles, data.topics);
  const isMCP =
    data.manifestFiles.includes('mcp.json') ||
    data.topics.includes('mcp') ||
    data.topics.includes('model-context-protocol');

  if (isMCP) {
    bullets.push(`MCP-compatible detected — ${stackNames} stack can be scanned by MARK for an actionable CLAUDE.md`);
  } else if (breakdown.buildability >= 20) {
    bullets.push(`${stackNames} stack clearly detected — high skill matching means a specific, ready-to-use CLAUDE.md`);
  } else if (breakdown.buildability >= 10) {
    bullets.push(`${stackNames || 'partially detected'} stack — enough to generate a usable CLAUDE.md`);
  } else {
    bullets.push('Limited manifest files — scan still works but CLAUDE.md may be more generic');
  }

  if (breakdown.narrativeFit >= 18) {
    const angle = getNarrativeAngle(data.topics, data.description);
    bullets.push(
      `${angle} narrative — utility angle is easy to shape, ticker has strong context for a pump.fun launch`,
    );
  } else if (breakdown.narrativeFit >= 12) {
    bullets.push(
      'Developer tool with a clear audience — a utility angle can be launched, but needs the right positioning',
    );
  } else if (breakdown.narrativeFit >= 8) {
    bullets.push('Data and analytics angle available — could be a niche but solid utility for a specific audience');
  } else {
    bullets.push(
      'Narrative angle unclear from metadata — full scan needed to see if a viable build opportunity exists',
    );
  }

  return bullets;
};

const calculateRepoScore = (data: RepoData): RepoScore => {
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

  const total = traction + activity + buildability + narrativeFit + uniqueness;

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

  const bullets = generateBullets(data, { traction, activity, buildability, narrativeFit, uniqueness });

  return { total, label, color, breakdown: { traction, activity, buildability, narrativeFit, uniqueness }, bullets };
};

export { calculateRepoScore };
