'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useAutoAdvanceTabs(durations: number[]) {
  const [activeTab, setActiveTab] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const startRef = useRef(0)

  const startProgress = useCallback((i: number) => {
    startRef.current = performance.now()
    const dur = durations[i]
    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / dur)
      setProgress(p * 100)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [durations])

  useEffect(() => {
    let stopped = false

    const scheduleNext = (i: number) => {
      timerRef.current = setTimeout(() => {
        if (stopped) return
        const next = (i + 1) % durations.length
        setActiveTab(next)
        setProgress(0)
        startRef.current = performance.now()
        const dur = durations[next]
        const tick = (now: number) => {
          if (stopped) return
          const p = Math.min(1, (now - startRef.current) / dur)
          setProgress(p * 100)
          if (p < 1) {
            rafRef.current = requestAnimationFrame(tick)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
        scheduleNext(next)
      }, durations[i])
    }

    scheduleNext(0)

    return () => {
      stopped = true
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [durations])

  const switchTab = useCallback((i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setActiveTab(i)
    startProgress(i)

    const dur = durations[i]
    timerRef.current = setTimeout(() => {
      const next = (i + 1) % durations.length
      setActiveTab(next)
      setProgress(0)
      startRef.current = performance.now()
      const nextDur = durations[next]
      const tick = (now: number) => {
        const p = Math.min(1, (now - startRef.current) / nextDur)
        setProgress(p * 100)
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, dur)
  }, [durations, startProgress])

  return { activeTab, progress, switchTab }
}
