'use client'

import { useCallback, useMemo } from 'react'
import { LVL_STYLE } from '@/lib/landing-data'
import type { SkillDefinition } from '@/lib/landing-data'

interface SkillModalProps {
  skill: SkillDefinition
  copied: boolean
  onClose: () => void
  onCopy: () => void
}

export function SkillModal({ skill, copied, onClose, onCopy }: SkillModalProps) {
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
          {'//'} Compatible with
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
          {'//'} Skill preview
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
