'use client'

import { useEffect } from 'react'

export function useCustomCursor(enabled = true) {
  useEffect(() => {
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    if (!fine || !enabled) return

    document.body.style.cursor = 'none'

    const dot = document.createElement('div')
    dot.style.cssText =
      'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;width:8px;height:8px;border-radius:50%;background:#0F0F0E;transform:translate(-50%,-50%);transition:width .18s ease,height .18s ease,background .18s ease'

    const ring = document.createElement('div')
    ring.style.cssText =
      'position:fixed;top:0;left:0;pointer-events:none;z-index:9998;width:34px;height:34px;border-radius:50%;border:.5px solid rgba(15,15,14,.35);transform:translate(-50%,-50%);transition:width .25s cubic-bezier(.16,1,.3,1),height .25s cubic-bezier(.16,1,.3,1),border-color .25s ease,background .25s ease'

    document.body.appendChild(dot)
    document.body.appendChild(ring)

    let rx = 0
    let ry = 0
    let raf: number

    const onMouseMove = (e: MouseEvent) => {
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
      rx += (e.clientX - rx) * 0.18
      ry += (e.clientY - ry) * 0.18
    }

    const loop = () => {
      ring.style.left = rx + 'px'
      ring.style.top = ry + 'px'
      raf = requestAnimationFrame(loop)
    }

    const hoverOn = () => {
      ring.style.width = '56px'
      ring.style.height = '56px'
      ring.style.background = 'rgba(26,71,168,.06)'
      ring.style.borderColor = 'rgba(26,71,168,.4)'
      dot.style.background = '#1A47A8'
    }

    const hoverOff = () => {
      ring.style.width = '34px'
      ring.style.height = '34px'
      ring.style.background = 'transparent'
      ring.style.borderColor = 'rgba(15,15,14,.35)'
      dot.style.background = '#0F0F0E'
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a,button,[data-fx],[onclick]')) {
        hoverOn()
      } else {
        hoverOff()
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    loop()

    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(raf)
      dot.remove()
      ring.remove()
    }
  }, [enabled])
}
