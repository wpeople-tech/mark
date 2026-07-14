'use client'

import { useEffect, useState } from 'react'
import { HeroCanvas } from '../canvas/HeroCanvas'
import { StatCard } from '../ui/StatCard'
import { Terminal } from '../ui/Terminal'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { useMagneticButton } from '@/lib/hooks/useMagneticButton'
import { TERM_LINES, TAGS, SKILLS } from '@/lib/landing-data'

interface HeroSectionProps {
  onCtaClick?: () => void
  onScrollToDemo?: () => void
}

export function HeroSection({ onCtaClick, onScrollToDemo }: HeroSectionProps) {
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal(0.3)
  const [termCount, setTermCount] = useState(0)
  const [termDone, setTermDone] = useState(false)
  const [fillsOn, setFillsOn] = useState(false)
  const {
    ref: ctaRef,
    style: ctaStyle,
    handleMouseMove: ctaMove,
    handleMouseLeave: ctaLeave,
  } = useMagneticButton()
  const {
    ref: demoCtaRef,
    style: demoCtaStyle,
    handleMouseMove: demoCtaMove,
    handleMouseLeave: demoCtaLeave,
  } = useMagneticButton()

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    TERM_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setTermCount(i + 1), 1200 + i * 750)
      )
    })

    timers.push(
      setTimeout(() => setTermDone(true), 1200 + TERM_LINES.length * 750 + 300)
    )
    timers.push(
      setTimeout(() => setFillsOn(true), 1200 + TERM_LINES.length * 750 + 500)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen px-10 pt-[140px] pb-20 flex flex-col items-center text-center overflow-hidden"
    >
      <HeroCanvas />

      <div className="relative z-2 flex flex-col items-center max-w-[840px] mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[.1em] uppercase text-muted rounded-pill px-4 py-[6px] mb-7 opacity-0"
          style={{
            background: 'rgba(247,246,243,.82)',
            border: '.5px solid var(--border)',
            backdropFilter: 'blur(6px)',
            animation: 'blurIn .7s cubic-bezier(.16,1,.3,1) .05s forwards',
            filter: 'blur(8px)',
            transform: 'translateY(12px)',
          }}
        >
          <span
            className="size-[7px] rounded-full"
            style={{
              background: 'var(--accent)',
              animation: 'eyepulse 2.4s ease-in-out infinite',
            }}
          />
          Chrome Extension · Free · No login
        </div>

        {/* Headline */}
        <h1 className="font-bold tracking-[-.04em] leading-[1.04] text-ink m-0 mb-5 text-[clamp(40px,6vw,64px)]">
          <span className="block">
            {[
              { text: 'Read', color: 'ink', delay: 0.12 },
              { text: 'any', color: 'ink', delay: 0.2 },
              { text: 'repo.', color: 'ink', delay: 0.28 },
            ].map((w, i, arr) => (
              <span
                key={`a-${i}`}
                className="inline-block opacity-0"
                style={{
                  animation: `blurIn .7s cubic-bezier(.16,1,.3,1) ${w.delay}s forwards`,
                  filter: 'blur(10px)',
                  transform: 'translateY(14px)',
                }}
              >
                {w.text}
                {i < arr.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </span>
          <span className="block">
            {[
              { text: 'Find', color: 'muted', delay: 0.36 },
              { text: 'your', color: 'muted', delay: 0.44 },
              { text: 'next', color: 'ink', delay: 0.52 },
              { text: 'build.', color: 'ink', delay: 0.6 },
            ].map((w, i, arr) => (
              <span
                key={`b-${i}`}
                className={`inline-block opacity-0 ${
                  w.color === 'muted' ? 'text-muted' : 'text-ink'
                }`}
                style={{
                  animation: `blurIn .7s cubic-bezier(.16,1,.3,1) ${w.delay}s forwards`,
                  filter: 'blur(10px)',
                  transform: 'translateY(14px)',
                }}
              >
                {w.text}
                {i < arr.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-[16px] text-muted leading-[1.7] max-w-[480px] m-0 mb-8 opacity-0"
          style={{
            animation: 'blurIn .7s cubic-bezier(.16,1,.3,1) .55s forwards',
            filter: 'blur(6px)',
            transform: 'translateY(12px)',
          }}
        >
          Open any GitHub repo. MARK scans it in seconds and returns a full
          intelligence report — plus 3 utility website ideas ready to launch
          on pump.fun.
        </p>

        {/* CTAs */}
        <div
          className="flex gap-[10px] items-center flex-wrap justify-center opacity-0"
          style={{
            animation: 'blurIn .7s cubic-bezier(.16,1,.3,1) .68s forwards',
            filter: 'blur(6px)',
            transform: 'translateY(12px)',
          }}
        >
          <button
            ref={ctaRef}
            onClick={onCtaClick}
            onMouseMove={ctaMove}
            onMouseLeave={ctaLeave}
            className="text-[13px] font-semibold px-6 py-[13px] rounded-md bg-ink text-paper border-none flex items-center gap-[7px] tracking-[.01em] transition-opacity duration-150 hover:opacity-88"
            style={ctaStyle}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m10 8 6 4-6 4V8z" />
            </svg>
            Add to Chrome
          </button>
          <button
            ref={demoCtaRef}
            onClick={onScrollToDemo}
            onMouseMove={demoCtaMove}
            onMouseLeave={demoCtaLeave}
            className="text-[13px] text-muted border bg-paper/60 px-[18px] py-[13px] rounded-md transition-all duration-150 backdrop-blur-[6px] hover:border-ink hover:text-ink"
            style={{
              borderWidth: 0.5,
              borderStyle: 'solid',
              borderColor: 'var(--border)',
              ...demoCtaStyle,
            }}
          >
            See demo ↓
          </button>
        </div>

        {/* Trust line */}
        <div
          className="mt-7 flex items-center gap-3 text-[12px] text-muted opacity-0"
          style={{
            animation: 'blurIn .7s ease .85s forwards',
            filter: 'blur(4px)',
          }}
        >
          <span>Free forever</span>
          <span className="size-1 rounded-full bg-muted" />
          <span>No account needed</span>
          <span className="size-1 rounded-full bg-muted" />
          <span>5 scans / day</span>
        </div>
      </div>

      {/* Stat cards */}
      <div
        ref={statsRef}
        className="relative z-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[960px] mt-14 mx-auto"
      >
        <StatCard
          label="Scan time"
          value={30}
          unit="s"
          description="average scan time"
          icon={
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="#1A47A8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
          isVisible={statsVisible}
          delay={0}
          iconBg="blue"
        />
        <StatCard
          label="Skills"
          value={59}
          unit=""
          description="curated skill patterns"
          icon={
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="#1A47A8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          }
          isVisible={statsVisible}
          delay={0.1}
          iconBg="blue"
        />
        <StatCard
          label="Ideas"
          value={3}
          unit=""
          description="build ideas per repo"
          icon={
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="#1A47A8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
          }
          isVisible={statsVisible}
          delay={0.2}
          iconBg="blue"
        />
        <StatCard
          label="Logins"
          value={0}
          unit=""
          description="logins required"
          icon={
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="#1B6B28"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
          isVisible={statsVisible}
          delay={0.3}
          iconBg="green"
        />
      </div>

      {/* Terminal mockup card */}
      <div
        className="relative z-2 w-full max-w-[960px] mt-4 mx-auto bg-paper border rounded-lg overflow-hidden text-left opacity-0"
        style={{
          borderWidth: 0.5,
          borderStyle: 'solid',
          borderColor: 'var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,.08)',
          animation: 'blurIn .8s cubic-bezier(.16,1,.3,1) 1.1s forwards',
          filter: 'blur(6px)',
          transform: 'translateY(20px)',
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '.5px solid #F3F2EE' }}
        >
          <div>
            <div className="text-[10px] font-medium tracking-[.1em] uppercase text-muted">
              Layer 01 — Mark File
            </div>
            <div className="text-[14px] font-medium text-ink mt-[3px]">
              Full repo intelligence scan
            </div>
          </div>
          {termDone ? (
            <span
              className="text-[10px] px-[10px] py-[3px] rounded-pill"
              style={{
                background: 'var(--green-bg)',
                color: 'var(--green)',
                border: '.5px solid var(--green-border)',
              }}
            >
              complete ✓
            </span>
          ) : (
            <span
              className="text-[10px] px-[10px] py-[3px] rounded-pill"
              style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                border: '.5px solid var(--accent-border)',
              }}
            >
              scanning...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
          <div
            className="p-5 md:border-r"
            style={{ borderColor: '#F3F2EE', borderRightWidth: 0.5 }}
          >
            <Terminal
              lines={TERM_LINES.slice(0, termCount)}
              isRunning={!termDone}
            />
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div>
              <div className="text-[10px] font-medium tracking-[.1em] uppercase text-muted mb-[10px]">
                Detected skills
              </div>
              <div className="flex gap-[6px] flex-wrap">
                {termDone ? (
                  TAGS.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-[9px] py-[3px] rounded-sm text-ink"
                      style={{
                        background: 'var(--surface)',
                        border: '.5px solid var(--border)',
                        animation: 'fadeIn .4s ease both',
                        animationDelay: `${i * 50}ms`,
                        color: '#555552',
                      }}
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: 'var(--muted)' }}
                  >
                    awaiting scan…
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-medium tracking-[.1em] uppercase text-muted mb-[10px]">
                Scores
              </div>
              <div className="flex flex-col gap-[10px]">
                {SKILLS.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-[10px]"
                  >
                    <span
                      className="text-[11px] font-mono text-muted min-w-[130px]"
                    >
                      {s.name}
                    </span>
                    <div
                      className="flex-1 h-[3px] rounded-pill overflow-hidden"
                      style={{ background: 'var(--surface)' }}
                    >
                      <div
                        className="h-full rounded-pill transition-all"
                        style={{
                          background: 'var(--accent)',
                          width: fillsOn ? `${s.pct}%` : '0%',
                          transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted min-w-[30px] text-right">
                      {s.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
