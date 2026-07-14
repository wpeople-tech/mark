'use client'

import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()

    function ease(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    let raf: number
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration)
      setValue(target * ease(p))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return Math.round(value)
}
