'use client'

interface TerminalLine {
  c: string
  t: string
}

interface TerminalProps {
  lines: TerminalLine[]
  isRunning: boolean
  minHeight?: number
}

export function Terminal({ lines, isRunning, minHeight = 190 }: TerminalProps) {
  return (
    <div
      className="rounded-[10px] relative overflow-hidden font-mono text-[11.5px] leading-[1.9]"
      style={{ background: 'var(--term-bg)', padding: '14px 16px', minHeight }}
    >
      <div className="flex gap-[6px] mb-[6px]">
        <span className="size-[9px] rounded-full" style={{ background: '#2a2a28' }} />
        <span className="size-[9px] rounded-full" style={{ background: '#2a2a28' }} />
        <span className="size-[9px] rounded-full" style={{ background: '#2a2a28' }} />
      </div>
      <div className="flex gap-[6px]">
        <span style={{ color: 'var(--term-dim)' }}>▸</span>
        <span style={{ color: 'var(--term-text)' }}>scanning vercel/next.js...</span>
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex gap-[6px]"
          style={{ animation: 'lineIn .25s ease both' }}
        >
          <span style={{ color: 'var(--term-dim)' }}>·</span>
          <span style={{ color: line.c }}>{line.t}</span>
        </div>
      ))}
      {isRunning && (
        <span
          className="inline-block"
          style={{
            width: 7,
            height: 13,
            background: 'var(--term-text)',
            animation: 'blinkcur .9s step-end infinite',
            verticalAlign: -2,
            marginLeft: 2,
          }}
        />
      )}
    </div>
  )
}
