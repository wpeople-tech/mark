'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SKILL_DB, SKILL_CATS } from '@/lib/landing-data'
import type { SkillDefinition } from '@/lib/landing-data'
import { SkillCard } from '@/components/landing/ui/SkillCard'
import { SkillModal } from '@/components/landing/ui/SkillModal'
import { Nav } from '@/components/landing/sections/Nav'

export default function SkillsPage() {
  const [skillCat, setSkillCat] = useState('All')
  const [skillQuery, setSkillQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null)
  const [copied, setCopied] = useState(false)

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
    const [, , name, desc, tags] = selectedSkill
    const words = desc
      .replace(/\.$/, '')
      .split(/[,—:]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
    const preview = [
      ...words.map((w) => w[0].toUpperCase() + w.slice(1)),
      `Applied automatically when MARK detects ${tags[0]} in your repo`,
    ]
    const text = `## ${name}\n${preview.map((p) => '- ' + p).join('\n')}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [selectedSkill])

  return (
    <>
      {/* NAV */}
      <Nav />

      {/* HEADER */}
      <section
        data-screen-label="Skills header"
        className="pt-[140px] pb-10 px-10 bg-paper"
      >
        <div className="max-w-[1080px] mx-auto">
          <div
            className="text-[11px] font-mono font-medium tracking-[.14em] uppercase text-[#1A47A8] mb-4 opacity-0 blur-[6px] translate-y-[10px]"
            style={{ animation: 'blurIn .6s cubic-bezier(.16,1,.3,1) .05s forwards' }}
          >
            {'//'} Skill Library
          </div>
          <div className="flex justify-between items-end gap-10 flex-wrap">
            <h1
              className="font-bold tracking-[-.04em] leading-[1.02] text-ink m-0 opacity-0 blur-[8px] translate-y-[12px]"
              style={{
                fontSize: 'clamp(36px, 6vw, 60px)',
                animation: 'blurIn .7s cubic-bezier(.16,1,.3,1) .15s forwards',
              }}
            >
              MARK&apos;s 59 Skills.<br />
              <em className="italic text-[#1A47A8]">Auto-selected.</em>
            </h1>
            <p
              className="text-[15px] text-muted leading-[1.65] max-w-[360px] m-0 text-right opacity-0 blur-[6px] translate-y-[10px]"
              style={{ animation: 'blurIn .7s cubic-bezier(.16,1,.3,1) .3s forwards' }}
            >
              Browse every skill. MARK selects them automatically on every scan
              — or copy any skill manually.
            </p>
          </div>
          <div
            className="mt-9 flex items-center gap-4 flex-wrap opacity-0 blur-[4px]"
            style={{ animation: 'blurIn .7s ease .45s forwards' }}
          >
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
        </div>
      </section>

      {/* LIBRARY */}
      <section
        data-screen-label="Skills grid"
        className="py-2 px-10 pb-[100px] bg-paper"
      >
        <div className="max-w-[1080px] mx-auto">
          <div className="flex gap-[6px] flex-wrap mb-7">
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
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
            >
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
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-10 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <div className="text-[12px] text-muted font-mono">
          markintel.xyz · free · 
        </div>
        <Link
          href="/"
          className="text-[12px] text-muted transition-colors hover:text-ink"
        >
          ← Back to home
        </Link>
      </footer>

      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          copied={copied}
          onClose={handleClose}
          onCopy={handleCopy}
        />
      )}
    </>
  )
}
