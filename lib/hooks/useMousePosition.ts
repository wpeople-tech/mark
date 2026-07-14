'use client'

import { useEffect, useState } from 'react'

interface MousePosition {
  x: number
  y: number
}

export function useMousePosition() {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return pos
}
