'use client'

import { useState } from 'react'

interface FeatureCellProps {
  icon: React.ReactNode
  title: string
  description: string
  hbg: string
  hstroke: string
  ornament: React.ReactNode
}

export function FeatureCell({ icon, title, description, hbg, hstroke, ornament }: FeatureCellProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative px-6 py-7 overflow-hidden transition-colors duration-200"
      style={{ background: hovered ? '#ffffff' : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute right-5 top-[38px] transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {ornament}
      </div>
      <div
        className="size-[36px] rounded-md flex items-center justify-center mb-[14px] transition-colors duration-200"
        style={{ background: hovered ? hbg : 'var(--surface)', color: hovered ? hstroke : undefined }}
      >
        {icon}
      </div>
      <div className="text-[13px] font-semibold text-ink mb-[6px]">{title}</div>
      <div className="text-[12px] text-muted leading-[1.6]">{description}</div>
    </div>
  )
}
