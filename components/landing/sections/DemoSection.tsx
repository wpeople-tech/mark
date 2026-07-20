'use client'

import { useEffect, useReducer } from 'react'
import { ExtensionPopupCanvas } from '../canvas/ExtensionPopupCanvas'
import { IdeaCard } from '../ui/IdeaCard'
import { ProgressBar } from '../ui/ProgressBar'
import { MascotPanel } from '../ui/MascotPanel'
import { useAutoAdvanceTabs } from '@/lib/hooks/useAutoAdvanceTabs'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import {
  EP_CHIPS,
  EP_LINES,
  IDEAS,
  MF_LINES,
  TAB_DUR,
} from '@/lib/landing-data'

const TABS = [
  { id: 0, label: 'Scan', num: '01' },
  { id: 1, label: 'Mark File', num: '02' },
  { id: 2, label: 'Build Ideas', num: '03' },
]

interface AnimState {
  epOpen: boolean
  epChipCount: number
  epLineCount: number
  mfCount: number
  ideasShown: number
  ivfOn: boolean
}

type AnimAction =
  | { type: 'reset' }
  | { type: 'epOpen' }
  | { type: 'epLine'; count: number }
  | { type: 'epChip'; count: number }
  | { type: 'mf'; count: number }
  | { type: 'ideas'; count: number }
  | { type: 'ivf' }

const initialAnim: AnimState = {
  epOpen: false,
  epChipCount: 0,
  epLineCount: 0,
  mfCount: 0,
  ideasShown: 0,
  ivfOn: false,
}

function animReducer(state: AnimState, action: AnimAction): AnimState {
  switch (action.type) {
    case 'reset':
      return initialAnim
    case 'epOpen':
      return { ...state, epOpen: true }
    case 'epLine':
      return { ...state, epLineCount: action.count }
    case 'epChip':
      return { ...state, epChipCount: action.count }
    case 'mf':
      return { ...state, mfCount: action.count }
    case 'ideas':
      return { ...state, ideasShown: action.count }
    case 'ivf':
      return { ...state, ivfOn: true }
    default:
      return state
  }
}

export function DemoSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: tabsRef, isVisible: tabsVisible } = useScrollReveal(0.15)
  const { activeTab, progress, switchTab } = useAutoAdvanceTabs(TAB_DUR)
  const [anim, dispatch] = useReducer(animReducer, initialAnim)

  useEffect(() => {
    dispatch({ type: 'reset' })

    if (activeTab === 0) {
      const t80 = setTimeout(() => dispatch({ type: 'epOpen' }), 400)
      const lineTimers = EP_LINES.map((l, k) =>
        setTimeout(() => dispatch({ type: 'epLine', count: k + 1 }), l.d)
      )
      const chipTimers = EP_CHIPS.map((c, k) =>
        setTimeout(() => dispatch({ type: 'epChip', count: k + 1 }), c.d)
      )
      return () => {
        clearTimeout(t80)
        lineTimers.forEach(clearTimeout)
        chipTimers.forEach(clearTimeout)
      }
    }

    if (activeTab === 1) {
      const timers = MF_LINES.map((_, k) =>
        setTimeout(() => dispatch({ type: 'mf', count: k + 1 }), 100 + k * 160)
      )
      return () => timers.forEach(clearTimeout)
    }

    if (activeTab === 2) {
      const t1 = setTimeout(() => dispatch({ type: 'ideas', count: 1 }), 200)
      const t2 = setTimeout(() => dispatch({ type: 'ideas', count: 2 }), 650)
      const t3 = setTimeout(() => dispatch({ type: 'ideas', count: 3 }), 1100)
      const t4 = setTimeout(() => dispatch({ type: 'ivf' }), 1800)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
      }
    }
  }, [activeTab])

  return (
    <section
      id="demo"
      className="py-20 px-10 bg-paper"
    >
      <div className="max-w-[1080px] mx-auto grid md:grid-cols-[minmax(0,640px)_1fr] grid-cols-1 gap-12 items-center">
        <div className="min-w-0">
        <div
          ref={headerRef}
          className={`flex flex-col items-start text-left mb-10 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="inline-flex items-center gap-[6px] text-[11px] font-medium tracking-[.08em] uppercase text-muted bg-surface border border-border rounded-pill px-[14px] py-[5px] mb-4">
            Live demo
          </span>
          <h2
            className="font-bold tracking-[-.03em] text-ink m-0 mb-3 leading-[1.1]"
            style={{ fontSize: 'var(--text-h2)' }}
          >
            Two layers of intelligence
          </h2>
          <p className="text-[15px] text-muted leading-[1.65] max-w-[520px] m-0">
            Every scan returns a MARK File — a deep codebase read — plus three
            pump.fun-ready utility ideas derived from what the repo can actually
            do.
          </p>
        </div>

        <div
          ref={tabsRef}
          className={`max-w-[640px] transition-all duration-700 ${
            tabsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex border border-border rounded-md bg-paper overflow-hidden mb-3">
            {TABS.map((tab, i) => {
              const isActive = activeTab === tab.id
              return (
                <div
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className="flex-1 py-[10px] px-2 text-center text-[12px] font-medium cursor-pointer transition-colors duration-200"
                  style={{
                    background: isActive ? 'var(--ink)' : 'var(--paper)',
                    color: isActive ? 'var(--paper)' : 'var(--muted)',
                    borderRightWidth: i < TABS.length - 1 ? 0.5 : 0,
                    borderRightStyle: 'solid',
                    borderRightColor: 'var(--border)',
                  }}
                >
                  <span
                    className="block font-mono mb-[1px]"
                    style={{
                      fontSize: '9px',
                      opacity: 0.55,
                    }}
                  >
                    {tab.num}
                  </span>
                  {tab.label}
                </div>
              )
            })}
          </div>
          <ProgressBar progress={progress} />

          <div className="grid">
            <div
              className="col-start-1 row-start-1"
              style={{
                opacity: activeTab === 0 ? 1 : 0,
                pointerEvents: activeTab === 0 ? 'auto' : 'none' as const,
                animation: activeTab === 0 ? 'fpIn .45s cubic-bezier(.16,1,.3,1) both' : 'none',
              }}
            >
              <ScanPanel
                epOpen={anim.epOpen}
                epChipCount={anim.epChipCount}
                epLineCount={anim.epLineCount}
              />
            </div>
            <div
              className="col-start-1 row-start-1"
              style={{
                opacity: activeTab === 1 ? 1 : 0,
                pointerEvents: activeTab === 1 ? 'auto' : 'none' as const,
                animation: activeTab === 1 ? 'fpIn .45s cubic-bezier(.16,1,.3,1) both' : 'none',
              }}
            >
              <MarkFilePanel mfCount={anim.mfCount} />
            </div>
            <div
              className="col-start-1 row-start-1"
              style={{
                opacity: activeTab === 2 ? 1 : 0,
                pointerEvents: activeTab === 2 ? 'auto' : 'none' as const,
                animation: activeTab === 2 ? 'fpIn .45s cubic-bezier(.16,1,.3,1) both' : 'none',
              }}
            >
              <IdeasPanel ideasShown={anim.ideasShown} ivfOn={anim.ivfOn} />
            </div>
          </div>
        </div>
      </div>
      <MascotPanel isThree />
    </div>
    </section>
  )
}

function ScanPanel({
  epOpen,
  epChipCount,
  epLineCount,
}: {
  epOpen: boolean
  epChipCount: number
  epLineCount: number
}) {
  return (
    <div>
      <div className="bg-paper border border-border rounded-card overflow-hidden">
        <div className="bg-surface border-b border-border py-2 px-3 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="size-[9px] rounded-full bg-[#FF6057]" />
            <span className="size-[9px] rounded-full bg-[#FFBD2E]" />
            <span className="size-[9px] rounded-full bg-[#28CA40]" />
          </div>
          <div className="flex-1 bg-paper border border-border rounded-sm py-[3px] px-[10px] text-[11px] font-mono text-muted">
            github.com/ggerganov/whisper.cpp
          </div>
          <div className="size-[22px] rounded-sm bg-ink flex items-center justify-center text-[10px] font-bold text-paper">
            M
          </div>
        </div>
        <div className="h-[240px] bg-paper p-3 flex gap-3 relative">
          <div className="w-[140px] bg-paper border border-border rounded-md p-[10px] flex-shrink-0 self-start">
            <div className="text-[12px] font-semibold text-accent font-mono mb-1">
              whisper.cpp
            </div>
            <div className="text-[10px] text-muted font-mono leading-[1.8]">
              ⭐ 38.2k
              <br />
              C++ · MIT
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-[5px]">
            <div className="text-[10px] font-mono text-accent bg-accent-bg px-2 py-1 rounded-sm flex items-center gap-[5px]">
              📄 CMakeLists.txt
            </div>
            <div className="text-[10px] font-mono text-muted px-2 py-1 flex items-center gap-[5px]">
              📄 whisper.h
            </div>
            <div className="text-[10px] font-mono text-muted px-2 py-1 flex items-center gap-[5px]">
              📦 bindings/
            </div>
            <div className="text-[10px] font-mono text-muted px-2 py-1 flex items-center gap-[5px]">
              📄 requirements.txt
            </div>
          </div>
          <div
            className="absolute top-[10px] right-[10px] w-[230px] bg-paper border border-border rounded-md overflow-hidden"
            style={{
              boxShadow: 'var(--shadow-popup)',
              transformOrigin: 'top right',
              transition: 'transform .4s cubic-bezier(.16,1,.3,1), opacity .4s cubic-bezier(.16,1,.3,1)',
              opacity: epOpen ? 1 : 0,
              transform: epOpen ? 'scale(1) translateY(0)' : 'scale(.82) translateY(-6px)',
            }}
          >
            <div className="px-[10px] py-[6px] border-b border-border flex justify-between items-center">
              <div className="text-[11px] font-bold flex items-center gap-[5px]">
                <span
                  className="size-[6px] rounded-full bg-accent"
                  style={{ animation: 'epblink 2s infinite' }}
                />
                MARK
              </div>
              <div className="text-[9px] font-mono text-muted">whisper.cpp</div>
            </div>
            <div className="h-[64px] bg-surface relative overflow-hidden">
              <ExtensionPopupCanvas />
              <div className="absolute inset-0 flex items-center justify-center gap-[5px] flex-wrap p-[5px]">
                {EP_CHIPS.slice(0, epChipCount).map((chip, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-mono px-2 py-[2px] rounded-pill"
                    style={{
                      background: chip.bg,
                      border: `.5px solid ${chip.bd}`,
                      color: chip.fg,
                      animation: 'fadeIn .3s ease both',
                    }}
                  >
                    {chip.t}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="bg-term-bg px-[10px] py-[6px] font-mono text-[9.5px] leading-[1.8]"
              style={{ minHeight: '66px' }}
            >
              <div>
                <span className="text-[#3a3a38]">▸</span>{' '}
                <span className="text-term-text">scanning...</span>
              </div>
              {EP_LINES.slice(0, epLineCount).map((line, i) => (
                <div key={i} style={{ animation: 'lineIn .25s ease both' }}>
                  <span className="text-[#3a3a38]">·</span>{' '}
                  <span style={{ color: line.c }}>{line.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarkFilePanel({ mfCount }: { mfCount: number }) {
  return (
    <div>
      <div className="bg-paper border border-border rounded-card overflow-hidden">
        <div className="bg-ink py-[10px] px-[14px] flex justify-between items-center">
          <div className="text-[12px] font-semibold text-paper font-mono flex items-center gap-[6px]">
            <span className="size-[6px] rounded-full bg-term-green" />
            CLAUDE.md
          </div>
          <div className="flex gap-[5px]">
            <span
              className="text-[9px] font-mono px-[7px] py-[2px] rounded-sm"
              style={{
                background: 'rgba(125,174,234,.15)',
                color: '#7DAEEA',
                border: '.5px solid rgba(125,174,234,.3)',
              }}
            >
              whisper.cpp
            </span>
            <span
              className="text-[9px] font-mono px-[7px] py-[2px] rounded-sm"
              style={{
                background: 'rgba(109,190,138,.15)',
                color: '#6DBE8A',
                border: '.5px solid rgba(109,190,138,.3)',
              }}
            >
              generated ✓
            </span>
          </div>
        </div>
        <div
          className="bg-term-bg px-4 py-3 font-mono text-[11px] leading-[1.9]"
          style={{ minHeight: '250px' }}
        >
          {MF_LINES.slice(0, mfCount).map((line, i) => (
            <div
              key={i}
              style={{ animation: 'lineIn .25s ease both', minHeight: '1.9em' }}
            >
              {line.parts.map((p, j) => (
                <span
                  key={j}
                  style={{ color: p.c, fontWeight: p.fw || '400' }}
                >
                  {p.t}{' '}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IdeasPanel({
  ideasShown,
  ivfOn,
}: {
  ideasShown: number
  ivfOn: boolean
}) {
  return (
    <div>
      <div className="flex flex-col gap-[10px]">
        {IDEAS.slice(0, ideasShown).map((idea, i) => (
          <IdeaCard key={i} idea={idea} />
        ))}
        {ivfOn && (
          <div
            className="py-[10px] px-3 bg-surface border border-border rounded-sm text-[11px] text-muted text-center"
            style={{ animation: 'fadeIn .3s ease both' }}
          >
            From <strong className="text-ink">ggerganov/whisper.cpp</strong> —
            generated in 28 seconds
          </div>
        )}
      </div>
    </div>
  )
}
