'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'

const SKILL_LINKS = [
  'Code Quality',
  'Git',
  'Testing',
  'React / Frontend',
  'TypeScript',
  'Python',
  'Backend / API',
  'DevOps',
  'Architecture',
  'AI / LLM',
];

export function SkillsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: chipsRef, isVisible: chipsVisible } = useScrollReveal(0.15)

  return (
    <section
      id="skills"
      data-screen-label="Skill library CTA"
      className="py-20 px-10 bg-surface border-t border-border border-b border-border"
    >
      <div className="max-w-[1080px] mx-auto">
        <div
          ref={headerRef}
          className={`grid grid-cols-[1fr_auto] gap-12 items-center transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div>
            <div className="text-[11px] font-mono font-medium tracking-[.14em] uppercase text-[#1A47A8] mb-[14px]">
              {'//'} Skill Library
            </div>
            <h2
              className="font-bold tracking-[-.04em] text-ink m-0 leading-[1.05]"
              style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
            >
              MARK&apos;s 59 Skills.<br />
              <em className="italic text-[#1A47A8]">Auto-selected.</em>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-5 text-right">
            <p className="text-[15px] text-muted leading-[1.65] max-w-[340px] m-0">
              Browse every skill. MARK selects them automatically — or copy any
              skill manually.
            </p>
            <a
              href="/skills"
              className="inline-flex items-center gap-2 text-[14px] font-semibold px-7 py-[15px] rounded-md bg-[#1A47A8] text-white transition-opacity hover:opacity-88"
            >
              Browse Skills Library →
            </a>
          </div>
        </div>

        <div
          ref={chipsRef}
          className={`flex gap-2 flex-wrap mt-11 transition-all duration-700 ${
            chipsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {SKILL_LINKS.map((cat) => (
            <a
              key={cat}
              href="/skills"
              className="text-[12px] font-medium px-[18px] py-2 rounded-pill bg-white border border-border text-[#555552] transition-colors hover:border-ink hover:text-ink"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
