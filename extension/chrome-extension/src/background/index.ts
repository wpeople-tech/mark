import type { BuildIdea, ScanState, TerminalLine } from '@extension/shared';

const API_BASE = (process.env as any).CEB_API_BASE || 'http://localhost:3000';
const FORGE_ENDPOINT = `${API_BASE}/api/forge`;
const OPPORTUNITIES_ENDPOINT = `${API_BASE}/api/opportunities`;

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
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log('[MARK Background] Message received:', msg.type, msg.owner ? `${msg.owner}/${msg.repo}` : '');
  if (msg.type === 'START_SCAN') {
    startScan(msg.owner, msg.repo).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'RESET_STATE') {
    chrome.storage.local.set({ scanState: DEFAULT_STATE });
    sendResponse({ ok: true });
  }
});

async function startScan(owner: string, repo: string): Promise<void> {
  await chrome.storage.local.set({
    scanState: { ...DEFAULT_STATE, status: 'scanning', repoName: `${owner}/${repo}` },
  });

  broadcast({ type: 'SCAN_STARTED' });

  try {
    const res = await fetch(FORGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo }),
    });

    if (res.status === 429) {
      await updateState({ status: 'rate_limited', remaining: 0 });
      broadcast({ type: 'RATE_LIMITED' });
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let markFileBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          await handleSSEEvent(data);
          if (data.type === 'content') {
            markFileBuffer += data.text;
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }

    fetchOpportunities(markFileBuffer, `${owner}/${repo}`);
  } catch (err: any) {
    await updateState({
      status: 'error',
      error: err.message ?? 'Scan failed. Please try again.',
    });
    broadcast({ type: 'SCAN_ERROR', error: err.message });
  }
}

async function handleSSEEvent(data: any): Promise<void> {
  const current = await getState();

  switch (data.type) {
    case 'status':
      await updateState({
        remaining: data.remaining ?? current.remaining,
        lines: [
          ...current.lines,
          { type: 'status', text: data.message, cls: 'blue' } as TerminalLine,
        ],
      });
      break;

    case 'stack':
      await updateState({ tags: data.tags });
      break;

    case 'skills':
      await updateState({ skills: data.skills });
      break;

    case 'content':
      await updateState({ markFile: current.markFile + data.text });
      break;

    case 'done':
      await updateState({
        status: 'done',
        zipBase64: data.zipBase64,
        markFile: data.markFile,
        tags: data.tags,
        skills: data.skills,
        remaining: data.remaining ?? current.remaining,
        lines: [
          ...current.lines,
          { type: 'done', text: '→ Complete ✓', cls: 'green' } as TerminalLine,
        ],
      });
      break;

    case 'error':
      await updateState({ status: 'error', error: data.message });
      break;
  }

  broadcast({ type: 'STATE_UPDATE', data });
}

async function fetchOpportunities(markFile: string, repoName: string): Promise<void> {
  try {
    const current = await getState();
    const res = await fetch(OPPORTUNITIES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markFile, repoName, stack: current.tags }),
    });
    const { ideas } = await res.json();
    await updateState({ ideas: ideas as BuildIdea[] });
    broadcast({ type: 'IDEAS_READY', ideas });
  } catch {
    // Non-blocking — ignore errors
  }
}

async function getState(): Promise<ScanState> {
  const result = await chrome.storage.local.get('scanState');
  return result.scanState ?? DEFAULT_STATE;
}

async function updateState(partial: Partial<ScanState>): Promise<void> {
  const current = await getState();
  await chrome.storage.local.set({ scanState: { ...current, ...partial } });
}

function broadcast(msg: object): void {
  chrome.runtime.sendMessage(msg).catch(() => {
    // Popup may be closed — ignore
  });
}
