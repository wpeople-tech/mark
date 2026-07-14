'use client'

import { useCallback, useRef, useState } from 'react'

export function useMagneticButton(factor = 0.28) {
  const ref = useRef<HTMLButtonElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const btn = ref.current
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const relX = (e.clientX - (r.left + r.width / 2)) * factor
      const relY = (e.clientY - (r.top + r.height / 2)) * factor
      setStyle({ transform: `translate(${relX}px, ${relY}px)` })
    },
    [factor]
  )

  const handleMouseLeave = useCallback(() => {
    setStyle({ transform: 'translate(0,0)' })
  }, [])

  return { ref, style, handleMouseMove, handleMouseLeave }
}
