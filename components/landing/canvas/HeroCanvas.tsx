'use client'

import { useEffect, useRef } from 'react'

interface HeroCanvasProps {
  enabled?: boolean
}

export function HeroCanvas({ enabled = true }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    const hero = heroRef.current
    if (!canvas || !hero) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const r = hero.getBoundingClientRect()
      canvas.width = r.width
      canvas.height = r.height
    }
    resize()
    window.addEventListener('resize', resize)

    const blobs = [
      { bx: 0.5, by: 0.32, r: 0.28, px: 1.9, py: 1.5, phase: 0 },
      { bx: 0.72, by: 0.55, r: 0.2, px: 1.6, py: 2.0, phase: 1.4 },
      { bx: 0.26, by: 0.6, r: 0.19, px: 2.2, py: 1.2, phase: 2.7 },
      { bx: 0.82, by: 0.22, r: 0.14, px: 1.4, py: 1.8, phase: 4.1 },
    ]

    let t = 0
    let mouse = { x: canvas.width * 0.5, y: canvas.height * 0.4 }

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    const onMouseLeave = () => {
      mouse = { x: canvas.width * 0.5, y: canvas.height * 0.4 }
    }

    hero.addEventListener('mousemove', onMouseMove)
    hero.addEventListener('mouseleave', onMouseLeave)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      for (const b of blobs) {
        const tt = t * 0.008
        const bx = (b.bx + Math.sin(tt * b.px + b.phase) * 0.13) * W
        const by = (b.by + Math.cos(tt * b.py + b.phase) * 0.1) * H
        const br = b.r * Math.min(W, H)
        const mdx = mouse.x - bx
        const mdy = mouse.y - by
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        const pull = Math.max(0, 1 - md / (H * 0.65)) * 0.09
        const fx = bx + mdx * pull
        const fy = by + mdy * pull

        const g = ctx.createRadialGradient(
          fx - br * 0.22, fy - br * 0.22, br * 0.04,
          fx, fy, br * 1.18
        )
        g.addColorStop(0, 'hsla(42, 18%, 98%, 0.58)')
        g.addColorStop(0.3, 'hsla(42, 18%, 96%, 0.32)')
        g.addColorStop(0.65, 'hsla(42, 14%, 95%, 0.16)')
        g.addColorStop(1, 'rgba(200,198,192,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(fx, fy, br * 1.08, 0, Math.PI * 2)
        ctx.fill()

        const sh = ctx.createLinearGradient(
          fx - br * 0.55, fy - br * 0.55,
          fx + br * 0.25, fy + br * 0.25
        )
        sh.addColorStop(0, 'rgba(169, 169, 169, 0.48)')
        sh.addColorStop(0.35, 'rgba(255,255,255,0.16)')
        sh.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = sh
        ctx.beginPath()
        ctx.arc(fx, fy, br * 0.68, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(41, 41, 41, 0.22)'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.arc(fx, fy, br * 0.96, 0, Math.PI * 2)
        ctx.stroke()
      }

      t++
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      hero.removeEventListener('mousemove', onMouseMove)
      hero.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [enabled])

  return (
    <div ref={heroRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full pointer-events-none"
      />
    </div>
  )
}
