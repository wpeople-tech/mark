'use client'

import { useEffect, useRef } from 'react'

export function ExtensionPopupCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const p = canvas.parentElement
      if (!p) return
      canvas.width = p.clientWidth
      canvas.height = p.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const blobs = [
      { bx: 0.4, by: 0.45, r: 0.45, px: 2.1, py: 1.3, phase: 0 },
      { bx: 0.7, by: 0.55, r: 0.35, px: 1.8, py: 1.9, phase: 1.8 },
      { bx: 0.25, by: 0.65, r: 0.3, px: 2.5, py: 1.1, phase: 3.2 },
    ]

    let t = 0

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      for (const b of blobs) {
        const tt = t * 0.006
        const bx = (b.bx + Math.sin(tt * b.px + b.phase) * 0.08) * W
        const by = (b.by + Math.cos(tt * b.py + b.phase) * 0.06) * H
        const br = b.r * Math.min(W, H)

        const g = ctx.createRadialGradient(bx, by, br * 0.02, bx, by, br * 1.1)
        g.addColorStop(0, 'hsla(42, 18%, 98%, 0.55)')
        g.addColorStop(0.35, 'hsla(42, 18%, 95%, 0.28)')
        g.addColorStop(0.7, 'hsla(42, 14%, 93%, 0.12)')
        g.addColorStop(1, 'rgba(200,198,192,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(bx, by, br * 1.02, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(41, 41, 41, 0.15)'
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.arc(bx, by, br * 0.9, 0, Math.PI * 2)
        ctx.stroke()
      }

      t++
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 size-full pointer-events-none" />
}
