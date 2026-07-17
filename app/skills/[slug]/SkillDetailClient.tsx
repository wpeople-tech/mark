'use client'

import { useCallback, useState } from 'react'

interface SkillDetailClientProps {
  preview: string[]
  name: string
  compact?: boolean
}

export function SkillDetailClient({ preview, name, compact }: SkillDetailClientProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const text = `## ${name}\n${preview.map((p) => '- ' + p).join('\n')}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [name, preview])

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="text-[12px] font-semibold px-4 py-[9px] rounded-md bg-ink text-paper border-none whitespace-nowrap transition-opacity hover:opacity-85"
      >
        ⧉ {copied ? 'Copied ✓' : 'Copy snippet'}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="text-[13px] font-semibold px-[22px] py-[13px] rounded-md bg-transparent border transition-colors"
      style={{
        color: '#E8E6E0',
        borderColor: 'rgba(255,255,255,.2)',
      }}
    >
      ⧉ {copied ? 'Copied ✓' : 'Copy snippet'}
    </button>
  )
}
