'use client'

import { useEffect } from 'react'

interface ToastProps {
  visible: boolean
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ visible, message, onClose, duration = 2800 }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 z-1000 -translate-x-1/2 bg-ink text-paper text-[13px] px-5 py-3 rounded-md flex items-center gap-[10px] pointer-events-none"
      style={{
        boxShadow: '0 12px 40px rgba(0,0,0,.14)',
        animation: 'toastIn .5s cubic-bezier(.16,1,.3,1)',
        transform: 'translate(-50%, 0)',
      }}
    >
      <span className="size-[7px] rounded-full bg-term-green" />
      <span>{message}</span>
    </div>
  )
}
