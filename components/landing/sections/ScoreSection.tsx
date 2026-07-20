'use client'

import { useEffect, useState } from 'react'
import { MascotPanel } from '../ui/MascotPanel'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

const SCORE_DATA = {
  total: 88,
  label: 'Strong Build Candidate',
  color: '#1B6B28',
  bullets: [
    '160k stars with last commit 13 minutes ago — narrative is moving, the window is still open',
    'TypeScript + Bun + MCP stack detected — high skill matching means a specific, ready-to-use CLAUDE.md',
    'MCP narrative — utility angle is easy to shape, ticker has strong context for a pump.fun launch',
  ],
  breakdown: [
    { label: 'Traction', value: 25, max: 25, desc: 'Stars, forks, community activity' },
    { label: 'Activity', value: 20, max: 20, desc: 'Recent commits and releases' },
    { label: 'Buildability', value: 23, max: 25, desc: 'Stack clarity and skill match' },
    { label: 'Narrative Fit', value: 20, max: 20, desc: 'AI/DeFi/DevTool angle strength' },
    { label: 'Uniqueness', value: 10, max: 10, desc: 'Original or fork, contributors' },
  ],
}

export function ScoreSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.15)
  const { ref: breakdownRef, isVisible: breakdownVisible } = useScrollReveal(0.15)

  return (
    <section className="py-20 px-10 bg-surface border-t border-border border-b border-border">
      <div className="max-w-[1080px] mx-auto grid md:grid-cols-[minmax(0,640px)_1fr] grid-cols-1 gap-12 items-center">
        <div className="min-w-0">
          <div
            ref={headerRef}
            className={`flex flex-col items-start text-left mb-10 transition-all duration-700 ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="inline-flex items-center gap-[6px] text-[11px] font-medium tracking-[.08em] uppercase text-muted bg-paper border border-border rounded-pill px-[14px] py-[5px] mb-4">
              Repo Score
            </span>
            <h2
              className="font-bold tracking-[-.03em] text-ink m-0 mb-3 leading-[1.1]"
              style={{ fontSize: 'var(--text-h2)' }}
            >
              Know before you scan
            </h2>
            <p className="text-[15px] text-muted leading-[1.65] max-w-[520px] m-0">
              Instant 0–100 repo score from GitHub metadata alone. Five dimensions evaluated client-side in under 2 seconds — before you commit to a full scan.
            </p>
          </div>

          <div
            ref={cardRef}
            className={`transition-all duration-700 ${
              cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <ScoreCard visible={cardVisible} />
          </div>

          <div
            ref={breakdownRef}
            className={`mt-8 transition-all duration-700 ${
              breakdownVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="text-[11px] font-medium text-muted tracking-[.05em] uppercase mb-3">
              Score Breakdown
            </div>
            <div className="flex flex-col gap-3">
              {SCORE_DATA.breakdown.map((dim, i) => (
                <DimensionBar key={dim.label} dimension={dim} index={i} visible={breakdownVisible} />
              ))}
            </div>
          </div>
        </div>

        <MascotPanel />
      </div>
    </section>
  )
}

function ScoreCard({ visible }: { visible: boolean }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) return

    const target = SCORE_DATA.total
    const duration = 600
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const ratio = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - ratio, 3)
      const current = Math.round(eased * target)
      setProgress(current)

      if (ratio < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [visible])

  return (
    <div className="bg-paper border border-border rounded-card p-5 max-w-[520px]">
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-[42px] font-bold leading-none font-variant-numeric-tabular-nums"
          style={{ color: SCORE_DATA.color }}
        >
          {progress}
        </span>
        <span className="text-[13px] text-muted font-medium">/100</span>
        <span
          className="text-[13px] font-semibold tracking-[.01em] ml-auto"
          style={{ color: SCORE_DATA.color }}
        >
          {SCORE_DATA.label}
        </span>
      </div>

      <div className="h-[6px] bg-surface rounded-pill overflow-hidden mb-4">
        <div
          className="h-full rounded-pill transition-all duration-[600ms]"
          style={{
            width: `${progress}%`,
            background: SCORE_DATA.color,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {SCORE_DATA.bullets.map((bullet, i) => (
          <div
            key={i}
            className="flex gap-2 text-[11px] leading-[1.5] text-ink"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-4px)',
              transition: `opacity 0.4s ease ${i * 0.1 + 0.3}s, transform 0.4s ease ${i * 0.1 + 0.3}s`,
            }}
          >
            <span className="text-muted flex-shrink-0 mt-[2px]">•</span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DimensionBar({
  dimension,
  index,
  visible,
}: {
  dimension: (typeof SCORE_DATA.breakdown)[number]
  index: number
  visible: boolean
}) {
  const percentage = (dimension.value / dimension.max) * 100

  return (
    <div
      className="flex items-center gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-6px)',
        transition: `opacity 0.4s ease ${index * 0.08}s, transform 0.4s ease ${index * 0.08}s`,
      }}
    >
      <div className="w-[110px] flex-shrink-0">
        <div className="text-[12px] font-medium text-ink">{dimension.label}</div>
        <div className="text-[9px] text-muted">
          {dimension.value}/{dimension.max}
        </div>
      </div>
      <div className="flex-1 h-[6px] bg-surface rounded-pill overflow-hidden">
        <div
          className="h-full bg-accent rounded-pill"
          style={{
            width: visible ? `${percentage}%` : '0%',
            transition: `width 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.08 + 0.2}s`,
          }}
        />
      </div>
      <div className="text-[10px] text-muted w-[140px] hidden sm:block">{dimension.desc}</div>
    </div>
  )
}
