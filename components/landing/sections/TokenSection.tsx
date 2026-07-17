'use client'

import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { TokenCanvas } from '../canvas/TokenCanvas'

export function TokenSection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section id="token" data-screen-label="Token" className="py-20 px-10 bg-paper">
      <div
        ref={ref}
        className={`max-w-[1080px] mx-auto bg-ink rounded-card py-20 px-10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <TokenCanvas />

        <div className="text-[10px] tracking-[.15em] uppercase text-[#555] mb-4 relative">
           ON PUMP.FUN
        </div>

        <h2
          className="font-bold tracking-[-.04em] text-paper m-0 mb-4 leading-[1.05] relative"
          style={{
            fontSize: 'var(--text-token)',
            background: 'linear-gradient(110deg, #F7F6F3 40%, #7DAEEA 50%, #F7F6F3 60%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shine 6s linear infinite',
          }}
        >
          The tool that finds
          <br />
          the next token.
        </h2>

        <p className="text-[15px] text-[#666] leading-[1.65] max-w-[460px] m-0 mb-10 relative">
          MARK ships as a Chrome Extension. The token launch is meta: a utility that helps builders find pump.fun ideas, backed by a pump.fun token.
        </p>

        <div className="flex gap-2 flex-wrap justify-center mb-10 relative">
          {['Solana', 'pump.fun', 'fair launch', 'no team tokens'].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-[14px] py-[5px] rounded-pill"
              style={{
                border: '.5px solid #333',
                color: tag === '' ? '#888' : '#555',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href="https://pump.fun"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-[13px] font-semibold px-7 py-[14px] rounded-md bg-paper text-ink no-underline transition-opacity duration-150 relative hover:opacity-88"
        >
          Buy on pump.fun →
        </a>
      </div>
    </section>
  )
}
