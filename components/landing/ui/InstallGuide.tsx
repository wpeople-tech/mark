'use client'

import { useEffect, useRef } from 'react'

interface InstallGuideProps {
  visible: boolean
  onClose: () => void
}

const STEPS = [
  { num: '1', title: 'Download & unzip', detail: 'Save the extension zip and extract it anywhere on your computer.' },
  { num: '2', title: 'Open Chrome Extensions', detail: 'Go to chrome://extensions and toggle Developer mode (top right).' },
  { num: '3', title: 'Load unpacked', detail: 'Click "Load unpacked" and select the extracted folder (not the zip).' },
  { num: '4', title: 'Pin the extension', detail: 'Click the puzzle icon in Chrome toolbar, find MARK, and pin it.' },
  { num: '5', title: 'Scan any repo', detail: 'Go to any GitHub repo, click the MARK icon, and scan.' },
]

export function InstallGuide({ visible, onClose }: InstallGuideProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-[rgba(15,15,14,0.6)] backdrop-blur-[2px] px-4"
    >
      <div
        className="bg-paper w-full max-w-[500px] rounded-[16px] p-[32px] relative animate-in"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] size-[28px] flex items-center justify-center rounded-full border-[0.5px] border-border bg-surface text-muted hover:text-ink text-[15px] leading-none cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-[20px] font-bold text-ink mb-[4px]">Install MARK</h2>
        <p className="text-[13px] text-muted mb-[24px]">Manual installation for developers</p>

        <a
          href="/mark-extension.zip"
          download
          className="flex items-center justify-center gap-[8px] w-full bg-accent text-white text-[14px] font-semibold py-[10px] rounded-[8px] mb-[24px] cursor-pointer no-underline"
        >
          <span className="text-[16px]">↓</span>
          Download mark-extension.zip
        </a>

        <div className="flex flex-col gap-[12px]">
          {STEPS.map(step => (
            <div key={step.num} className="flex gap-[12px]">
              <div className="size-[24px] shrink-0 flex items-center justify-center rounded-full bg-accent-bg text-accent text-[11px] font-bold border-[0.5px] border-accent-border">
                {step.num}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink">{step.title}</div>
                <div className="text-[12px] text-muted mt-[1px] leading-[1.5]">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
