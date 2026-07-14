'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

const STEPS = [
  {
    num: '01',
    title: 'Open any repo',
    desc: 'Navigate to any public GitHub repository. MARK works on any language, any stack, any size.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Click MARK',
    desc: 'The extension reads manifest files, detects stack, and scores 59 skill patterns against what it finds.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Get ideas + launch',
    desc: 'Download your MARK File ZIP. Ship the utility website. Launch the token. Repeat.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section
      data-screen-label="Process"
      className="py-20 px-10 bg-surface border-t border-border border-b border-border"
    >
      <div className="max-w-[1080px] mx-auto">
        <div
          ref={ref}
          className={`flex flex-col items-center text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="inline-flex items-center gap-[6px] text-[11px] font-medium tracking-[.08em] uppercase text-muted bg-paper border border-border rounded-pill px-[14px] py-[5px] mb-4">
            Process
          </span>
          <h2
            className="font-bold tracking-[-.03em] text-ink m-0 leading-[1.1]"
            style={{ fontSize: 'var(--text-h2)' }}
          >
            Three steps, thirty seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const { ref, isVisible } = useScrollReveal(0.15)

  const iconAnim =
    index === 0
      ? 'swDown 2.4s ease-in-out infinite'
      : index === 1
        ? 'magZ 2s ease-in-out infinite'
        : 'rktF 2s ease-in-out infinite'

  return (
    <div
      ref={ref}
      className={`bg-paper border border-border rounded-card px-7 py-8 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <span className="text-[11px] font-mono text-muted block mb-[14px]">{step.num}</span>
      <div className="size-[44px] rounded-md bg-ink flex items-center justify-center mb-4 relative overflow-hidden">
        {index === 0 && (
          <div
            className="absolute left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(26,71,168,.9), transparent)',
              top: -2,
              animation: iconAnim,
            }}
          />
        )}
        {index === 1 && (
          <div
            className="absolute inset-0 rounded-md"
            style={{ animation: 'magP 2s ease-in-out infinite' }}
          />
        )}
        {index === 2 && (
          <div
            className="absolute bottom-2 left-1/2 w-[2px] rounded-sm"
            style={{
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, rgba(232,197,106,.9), transparent)',
              animation: 'rktT 2s ease-in-out infinite',
            }}
          />
        )}
        <div style={{ animation: iconAnim }}>{step.icon}</div>
      </div>
      <div className="text-[16px] font-semibold text-ink mb-[6px]">{step.title}</div>
      <div className="text-[13px] text-muted leading-[1.6]">{step.desc}</div>
    </div>
  )
}
