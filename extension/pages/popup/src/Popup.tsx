import './Popup.css';
import { useEffect, useRef, useState } from 'react';
import type { BuildIdea, RepoInfo, ScanState } from '@extension/shared';

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

export default function Popup() {
  const [repo, setRepo] = useState<RepoInfo | null>(null);
  const [state, setState] = useState<ScanState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<'mark' | 'ideas'>('mark');

  useEffect(() => {
    chrome.storage.local.get(['currentRepo', 'scanState'], result => {
      console.log('[MARK Popup] Storage loaded:', result);
      if (result.currentRepo) setRepo(result.currentRepo);
      if (result.scanState) setState(result.scanState);
    });
  }, []);

  useEffect(() => {
    console.log('[MARK Popup] Registering message listener');
    const listener = (msg: any) => {
      console.log('[MARK Popup] Received message:', msg.type);
      if (['STATE_UPDATE', 'SCAN_STARTED', 'IDEAS_READY', 'RATE_LIMITED', 'SCAN_ERROR'].includes(msg.type)) {
        chrome.storage.local.get('scanState', result => {
          console.log('[MARK Popup] scanState from storage:', result.scanState?.status);
          if (result.scanState) setState(result.scanState);
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      console.log('[MARK Popup] Removing message listener');
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const handleScan = () => {
    console.log('[MARK Popup] handleScan called, repo:', repo);
    if (!repo) return;
    // Optimistic update — show scanning state immediately
    setState(prev => ({
      ...prev,
      status: 'scanning',
      lines: [{ type: 'status' as const, text: '→ Starting scan...', cls: 'blue' as const }],
    }));
    console.log('[MARK Popup] Sending START_SCAN message');
    chrome.runtime.sendMessage({ type: 'START_SCAN', owner: repo.owner, repo: repo.repo }, (response) => {
      console.log('[MARK Popup] START_SCAN response:', response);
      if (chrome.runtime.lastError) {
        console.error('[MARK Popup] START_SCAN error:', chrome.runtime.lastError);
      }
    });
  };

  const handleRescan = () => {
    chrome.runtime.sendMessage({ type: 'RESET_STATE' });
    setState(DEFAULT_STATE);
    setTimeout(() => handleScan(), 100);
  };

  const handleDownload = () => {
    if (!state.zipBase64) return;
    const blob = base64ToBlob(state.zipBase64, 'application/zip');
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: `mark-${state.repoName.replace('/', '-')}.zip`,
    });
  };

  return (
    <div className="popup-root">
      <div className="popup-header">
        <div className="popup-logo">
          <div className="logo-dot" />
          <span>MARK</span>
        </div>
        {repo && <div className="popup-repo">{repo.owner}/{repo.repo}</div>}
      </div>

      <GlassZone state={state} />

      <div className="popup-body">
        {!repo && (
          <div className="no-repo">Open any GitHub repository to use MARK</div>
        )}

        {repo && state.status === 'idle' && (
          <div className="idle-state">
            <button className="scan-btn" onClick={handleScan}>
              Scan this repo
            </button>
            <div className="remaining-info">{state.remaining} scans remaining today</div>
          </div>
        )}

        {state.status === 'rate_limited' && (
          <div className="rate-limit-msg">
            You've used 5/5 scans today.
            <br />
            Come back tomorrow.
          </div>
        )}

        {state.status === 'error' && (
          <div className="error-msg">
            {state.error || 'Scan failed. Please try again.'}
          </div>
        )}

        {(state.status === 'scanning' || state.status === 'done') && (
          <>
            <div className="tabs">
              <button className={`tab ${activeTab === 'mark' ? 'active' : ''}`} onClick={() => setActiveTab('mark')}>
                Mark File
              </button>
              <button className={`tab ${activeTab === 'ideas' ? 'active' : ''}`} onClick={() => setActiveTab('ideas')}>
                Build Opportunities
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'mark' && (
                <MarkFileTab state={state} onDownload={handleDownload} />
              )}
              {activeTab === 'ideas' && (
                <IdeasTab ideas={state.ideas} />
              )}
            </div>
          </>
        )}
      </div>

      {repo && (
        <div className="popup-footer">
          {state.status === 'done' && (
            <>
              <div className="status-indicator">
                <div className="status-dot" />
                <span>Scan complete</span>
              </div>
              <div className="footer-actions">
                <button className="btn-dl" onClick={handleDownload}>
                  ↓ ZIP
                </button>
                <button className="btn-rescan" onClick={handleRescan}>
                  ↺ Rescan
                </button>
              </div>
            </>
          )}
          {state.status === 'scanning' && (
            <div className="scanning-indicator">Scanning...</div>
          )}
          {state.status === 'idle' && (
            <div className="remaining-footer">{state.remaining}/5 scans remaining today</div>
          )}
        </div>
      )}
    </div>
  );
}

function GlassZone({ state }: { state: ScanState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 360 * dpr;
    canvas.height = 140 * dpr;
    canvas.style.width = '360px';
    canvas.style.height = '140px';
    ctx.scale(dpr, dpr);

    const blobs: Metaball[] = [];
    for (let i = 0; i < 4; i++) {
      blobs.push({
        x: Math.random() * 360,
        y: Math.random() * 140,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 30 + Math.random() * 30,
      });
    }

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, 360, 140);

      blobs.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < 0 || blob.x > 360) blob.vx *= -1;
        if (blob.y < 0 || blob.y > 140) blob.vy *= -1;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, 'hsla(42, 18%, 98%, 0.5)');
        gradient.addColorStop(1, 'hsla(42, 18%, 95%, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(200, 198, 192, 0.22)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    }

    if (state.status === 'scanning') {
      animate();
    }

    return () => cancelAnimationFrame(animationId);
  }, [state.status]);

  return (
    <div className="glass-zone">
      <canvas ref={canvasRef} className="glass-canvas" />
      <div className="glass-overlay">
        <div className="scan-status">{getScanStatusText(state.status)}</div>
        <div className="chip-row">
          {state.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="chip" style={{ animationDelay: `${i * 50}ms` }}>
              {tag}
            </span>
          ))}
          {state.skills.length > 0 && (
            <span className="chip chip-accent">{state.skills.length} skills</span>
          )}
        </div>
      </div>
      <div
        className="scan-progress"
        style={{ width: state.status === 'scanning' ? '0%' : state.status === 'done' ? '100%' : '0%' }}
      />
    </div>
  );
}

function MarkFileTab({ state, onDownload }: { state: ScanState; onDownload: () => void }) {
  return (
    <>
      {state.lines.length > 0 && (
        <div className="terminal">
          {state.lines.map((line, i) => (
            <div key={i} className={`term-line ${line.cls || ''}`}>
              <span className="term-prefix">·</span>
              <span>{line.text}</span>
            </div>
          ))}
          {state.status === 'scanning' && <span className="cursor" />}
        </div>
      )}

      {state.status === 'done' && (
        <div className="file-list">
          <div className="file-row" onClick={onDownload}>
            <span className="file-icon">📄</span>
            <div>
              <div className="file-name">CLAUDE.md</div>
              <div className="file-tags">{state.tags.slice(0, 3).join(' · ')}</div>
            </div>
            <span className="dl-icon">↓</span>
          </div>
          <div className="file-row" onClick={onDownload}>
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
    </>
  );
}

function IdeasTab({ ideas }: { ideas: BuildIdea[] }) {
  if (ideas.length === 0) {
    return <div className="ideas-loading">Generating ideas...</div>;
  }

  return (
    <div className="ideas-list">
      {ideas.map((idea, i) => (
        <IdeaCard key={i} idea={idea} delay={i * 200} />
      ))}
    </div>
  );
}

function IdeaCard({ idea, delay }: { idea: BuildIdea; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

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
  );
}

function getScanStatusText(status: ScanState['status']): string {
  const map: Record<ScanState['status'], string> = {
    idle: 'Ready to scan',
    scanning: 'Scanning...',
    done: 'Scan complete ✓',
    error: 'Scan failed',
    rate_limited: 'Limit reached',
  };
  return map[status];
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

interface Metaball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}
