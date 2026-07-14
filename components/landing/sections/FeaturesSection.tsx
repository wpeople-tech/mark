'use client'

import { FeatureCell } from '../ui/FeatureCell'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

const CELLS = [
  {
    id: 'claude',
    title: 'CLAUDE.md included',
    desc: 'Every scan outputs a production-ready CLAUDE.md — the file Claude Code reads automatically every session.',
    hbg: '#EBF2FF',
    hstroke: '#1A47A8',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    ornament: (
      <div className="flex flex-col gap-[3px]">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="h-[2px] rounded-sm"
            style={{
              background: '#1A47A8',
              opacity: 0.4,
              width: [18, 13, 16][i],
              animation: `tlA 1.6s ease-in-out infinite ${i * 0.25}s`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    id: 'skills',
    title: '59 curated skills',
    desc: 'MARK scores your stack against 59 patterns — Next.js, TypeScript, Prisma, auth, testing, and more — and picks the top 6-8.',
    hbg: '#E8F5E9',
    hstroke: '#0F0F0E',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    ornament: (
      <div className="w-[30px] flex flex-col gap-1">
        {[
          { delay: '0s', color: '#6DBE8A' },
          { delay: '.35s', color: '#90CAF9' },
          { delay: '.7s', color: '#E8C56A' },
        ].map((bar, i) => (
          <div key={i} className="h-[2px] rounded-sm bg-border overflow-hidden">
            <div
              className="h-full rounded-sm"
              style={{
                width: 0,
                background: bar.color,
                animation: `sfill 2.2s ease-out infinite ${bar.delay}`,
              }}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'speed',
    title: '30 second turnaround',
    desc: 'GitHub API manifest scan + Claude generation in one pass. No repo cloning. No file uploads.',
    hbg: '#FFF8E1',
    hstroke: '#F9A825',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" style={{ transformOrigin: '50% 67%', animation: 'cspin .5s linear infinite' }} />
      </svg>
    ),
    ornament: null,
  },
  {
    id: 'pumpfun',
    title: 'pump.fun angles',
    desc: 'Every idea comes with a ticker, domain suggestion, value prop, and why it\'s viable as a token launch.',
    hbg: '#EBF2FF',
    hstroke: '#1A47A8',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    ornament: (
      <div className="flex flex-col gap-[3px]">
        {['$DEPLOY', '$SPACES', '$BASE'].map((ticker, i) => (
          <div
            key={i}
            className="text-[8px] font-mono px-[5px] py-[1px] rounded-sm text-accent bg-accent-bg border border-accent-border"
            style={{
              opacity: 0,
              transform: 'translateX(4px)',
              animation: `tpin .5s ease-out ${i * 0.2}s forwards`,
            }}
          >
            {ticker}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'download',
    title: 'ZIP download',
    desc: 'One click downloads CLAUDE.md + selected skill files + setup guide in a ready-to-drop ZIP.',
    hbg: '#E8F5E9',
    hstroke: '#6DBE8A',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'dlb .9s ease-in-out infinite' }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    ornament: null,
  },
  {
    id: 'free',
    title: 'Free, no account',
    desc: '5 scans per day, no login, no API key needed. MARK handles everything on the server side.',
    hbg: '#EFEFEB',
    hstroke: '#0F0F0E',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'shp 1.5s ease-in-out infinite' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    ornament: null,
  },
]

export function FeaturesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.15)

  return (
    <section id="features" data-screen-label="Features" className="py-20 px-10 bg-paper">
      <div className="max-w-[1080px] mx-auto">
        <div
          ref={headerRef}
          className={`flex flex-col items-center text-center mb-12 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="inline-flex items-center gap-[6px] text-[11px] font-medium tracking-[.08em] uppercase text-muted bg-surface border border-border rounded-pill px-[14px] py-[5px] mb-4">
            What&apos;s inside
          </span>
          <h2
            className="font-bold tracking-[-.03em] text-ink m-0 mb-3 leading-[1.1]"
            style={{ fontSize: 'var(--text-h2)' }}
          >
            Built for crypto builders
          </h2>
          <p className="text-[15px] text-muted leading-[1.65] max-w-[520px] m-0">
            Everything in the output is designed for one thing: getting a utility website live and a token launched as fast as possible.
          </p>
        </div>

        <div
          ref={gridRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-border rounded-card overflow-hidden bg-border transition-all duration-700 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {CELLS.map((cell) => (
            <FeatureCell
              key={cell.id}
              icon={cell.icon}
              title={cell.title}
              description={cell.desc}
              hbg={cell.hbg}
              hstroke={cell.hstroke}
              ornament={cell.ornament}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
