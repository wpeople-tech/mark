'use client'

import { useRef, useState } from 'react'
import { MASCOT_BADGES } from '@/lib/landing-data'

export function MascotPanel() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ deg: 0, tx: 0, ty: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    setTilt({ deg: nx * 8, tx: nx * 10, ty: ny * 10 })
  }

  const handleMouseLeave = () => setTilt({ deg: 0, tx: 0, ty: 0 })

  return (
    <div className="relative flex flex-col items-center justify-center min-w-0">
      <div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[360px]"
      >
        {MASCOT_BADGES.map((badge, i) => (
          <span
            key={i}
            className="absolute text-[10px] font-mono px-[10px] py-[3px] rounded-pill"
            style={{
              ...badge.style,
              background: badge.bg,
              color: badge.fg,
              border: `.5px solid ${badge.bd}`,
              boxShadow: '0 8px 32px rgba(0,0,0,.08)',
              animation: `rktF 3.2s ease-in-out infinite ${badge.delay}`,
            }}
          >
            {badge.label}
          </span>
        ))}
        <div
          className="w-full transition-transform duration-300 ease-out"
          style={{
            transform: `rotate(${tilt.deg}deg) translate(${tilt.tx}px, ${tilt.ty}px) scale(1.04)`,
          }}
        >
          <img
            src="/mark-image.png"
            alt="MARK mascot"
            className="w-full h-auto block"
            style={{
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.12))',
              animation: 'rktF 4s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      <div className="text-[11px] font-mono text-muted mt-2 text-center">
        MARK — your repo intelligence cat
      </div>
    </div>
  )
}
