'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { SKILL_DB, SKILL_CATS, LVL_STYLE } from '@/lib/landing-data'
import type { SkillDefinition } from '@/lib/landing-data'

function SkillCard({
  skill,
  onClick,
}: {
  skill: SkillDefinition
  onClick: () => void
}) {
  const [cat, lvl, name, desc, tags] = skill
  const style = LVL_STYLE[lvl as keyof typeof LVL_STYLE]

  return (
    <div
      onClick={onClick}
      className="bg-white border border-border rounded-md p-[18px_20px] transition-all duration-200 cursor-pointer hover:border-accent-border hover:-translate-y-0.5"
      style={{ animation: 'fadeIn .3s ease both' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-medium text-accent bg-accent-bg border border-accent-border px-[8px] py-[2px] rounded-sm">
          {cat}
        </span>
        <span
          className="text-[10px] font-mono px-[8px] py-[2px] rounded-sm border"
          style={{
            color: style.fg,
            background: style.bg,
            borderColor: style.bd,
          }}
        >
          {lvl}
        </span>
      </div>
      <div className="text-[14px] font-semibold text-ink mb-[5px]">{name}</div>
      <div className="text-[12px] text-muted leading-[1.6] mb-[10px]">
        {desc}
      </div>
      <div className="flex gap-1 flex-wrap">
        {tags.map((tg) => (
          <span
            key={tg}
            className="text-[9px] font-mono text-[#555552] bg-surface border border-border px-[7px] py-[1px] rounded-sm"
          >
            {tg}
          </span>
        ))}
      </div>
    </div>
  )
}

function SkillModal({
  skill,
  copied,
  onClose,
  onCopy,
}: {
  skill: SkillDefinition
  copied: boolean
  onClose: () => void
  onCopy: () => void
}) {
  const [cat, lvl, name, desc, tags] = skill
  const style = LVL_STYLE[lvl as keyof typeof LVL_STYLE]

  const preview = useMemo(() => {
    const words = desc
      .replace(/\.$/, '')
      .split(/[,—:]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
    return [
      ...words.map((w) => w[0].toUpperCase() + w.slice(1)),
      `Applied automatically when MARK detects ${tags[0]} in your repo`,
    ]
  }, [desc, tags])

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-6"
      onClick={handleBackdrop}
      style={{
        background: 'rgba(15,15,14,.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn .25s ease both',
      }}
    >
      <div
        className="w-full bg-paper rounded-lg shadow-popup overflow-y-auto max-h-[86vh]"
        style={{
          maxWidth: '680px',
          padding: '36px 40px',
          animation: 'fpIn .35s cubic-bezier(.16,1,.3,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-[18px]">
          <div className="flex gap-2 items-center">
            <span className="text-[11px] font-medium font-mono tracking-[.06em] uppercase text-accent bg-accent-bg border border-accent-border px-[10px] py-[3px] rounded-sm">
              {cat}
            </span>
            <span
              className="text-[11px] font-mono px-[10px] py-[3px] rounded-sm border"
              style={{
                color: style.fg,
                background: style.bg,
                borderColor: style.bd,
              }}
            >
              {lvl}
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-md border border-border bg-white text-muted text-[14px] leading-none flex items-center justify-center transition-colors hover:text-ink hover:border-ink"
          >
            ✕
          </button>
        </div>

        <h3
          className="font-bold tracking-[-.03em] text-ink m-0 mb-3 leading-[1.1]"
          style={{ fontSize: 'clamp(24px, 3.5vw, 34px)' }}
        >
          {name}
        </h3>
        <p className="text-[14px] text-[#555552] leading-[1.7] m-0 mb-6">
          {desc}
        </p>

        <div className="text-[11px] font-mono tracking-[.08em] uppercase text-muted mb-2">
          // Compatible with
        </div>
        <div className="flex gap-[6px] flex-wrap mb-6">
          {tags.map((tg) => (
            <span
              key={tg}
              className="text-[11px] font-mono text-[#555552] bg-surface border border-border px-[10px] py-[3px] rounded-sm"
            >
              {tg}
            </span>
          ))}
        </div>

        <div className="text-[11px] font-mono tracking-[.08em] uppercase text-muted mb-2">
          // Skill preview
        </div>
        <div
          className="rounded-md mb-7 font-mono text-[12px] leading-[2]"
          style={{
            background: '#0B0B0A',
            padding: '18px 22px',
          }}
        >
          <div style={{ color: '#E8C56A' }}>## {name}</div>
          {preview.map((line, i) => (
            <div key={i} style={{ color: '#E8E6E0' }}>
              - {line}
            </div>
          ))}
        </div>

        <div className="flex gap-[10px] flex-wrap">
          <button className="text-[13px] font-semibold px-6 py-3 rounded-md bg-accent text-white border-none transition-opacity hover:opacity-88">
            Full details →
          </button>
          <button
            onClick={onCopy}
            className="text-[13px] font-semibold px-6 py-3 rounded-md bg-white text-ink border border-border transition-colors hover:border-ink"
          >
            {copied ? 'Copied ✓' : 'Copy Skill'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SkillsSection() {
  const [skillCat, setSkillCat] = useState('All')
  const [skillQuery, setSkillQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null)
  const [copied, setCopied] = useState(false)

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal(0.15)

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    SKILL_DB.forEach(([cat]) => {
      map[cat] = (map[cat] || 0) + 1
    })
    return map
  }, [])

  const filtered = useMemo(() => {
    const q = skillQuery.trim().toLowerCase()
    return SKILL_DB.filter(
      ([cat, , name, desc, tags]) =>
        (skillCat === 'All' || cat === skillCat) &&
        (!q ||
          name.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          tags.some((t) => t.includes(q))),
    )
  }, [skillCat, skillQuery])

  const handleClose = useCallback(() => {
    setSelectedSkill(null)
    setCopied(false)
  }, [])

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSkill) handleClose()
    },
    [selectedSkill, handleClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const handleCopy = useCallback(async () => {
    if (!selectedSkill) return
    const [, , name, desc] = selectedSkill
    const words = desc
      .replace(/\.$/, '')
      .split(/[,—:]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
    const preview = [
      ...words.map((w) => w[0].toUpperCase() + w.slice(1)),
      `Applied automatically when MARK detects ${selectedSkill[4][0]} in your repo`,
    ]
    const text = `## ${name}\n${preview.map((p) => '- ' + p).join('\n')}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [selectedSkill])

  return (
    <section
      id="skills"
      data-screen-label="Skills library"
      className="py-20 px-10 bg-paper border-t border-border"
    >
      <div className="max-w-[1080px] mx-auto">
        <div
          ref={headerRef}
          className={`flex flex-col items-center text-center mb-10 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="inline-flex items-center gap-[6px] text-[11px] font-medium tracking-[.08em] uppercase text-muted bg-surface border border-border rounded-pill px-[14px] py-[5px] mb-4">
            Skill Library
          </span>
          <h2
            className="font-bold tracking-[-.03em] text-ink m-0 mb-3 leading-[1.1]"
            style={{ fontSize: 'var(--text-h2)' }}
          >
            MARK&apos;s 59 <em className="italic">skills.</em>
          </h2>
          <p className="text-[15px] text-muted leading-[1.65] max-w-[520px] m-0 mb-6">
            Every scan scores your repo against this library and picks the top
            6-8 for your CLAUDE.md.
          </p>

          <div className="w-full max-w-[420px] flex items-center gap-2 bg-white border border-border rounded-md px-[14px] py-[9px]">
            <span className="text-muted text-[13px]">⌕</span>
            <input
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              placeholder="Search skills..."
              className="flex-1 border-none outline-none bg-transparent font-sans text-[13px] text-ink"
            />
            <span className="text-[10px] font-mono text-muted">
              {filtered.length} skills
            </span>
          </div>
        </div>

        <div
          ref={contentRef}
          className={`transition-all duration-700 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex gap-[6px] flex-wrap justify-center mb-7">
            {(['All', ...SKILL_CATS] as const).map((cat) => {
              const label =
                cat === 'All'
                  ? `All (${SKILL_DB.length})`
                  : `${cat} (${counts[cat] || 0})`
              const active = skillCat === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSkillCat(cat)}
                  className="text-[11px] font-medium px-[14px] py-[6px] rounded-pill border transition-colors"
                  style={{
                    background: active ? '#0F0F0E' : '#ffffff',
                    color: active ? '#F7F6F3' : '#888785',
                    borderColor: active ? '#0F0F0E' : '#E5E3DC',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filtered.map((skill) => (
                <SkillCard
                  key={skill[2]}
                  skill={skill}
                  onClick={() => {
                    setSelectedSkill(skill)
                    setCopied(false)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[13px] text-muted font-mono">
              No skills match &ldquo;{skillQuery}&rdquo;
            </div>
          )}
        </div>
      </div>

      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          copied={copied}
          onClose={handleClose}
          onCopy={handleCopy}
        />
      )}
    </section>
  )
}
