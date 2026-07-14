import { TICKER_ITEMS } from '@/lib/landing-data'

function TickerItem({ item }: { item: (typeof TICKER_ITEMS)[number] }) {
  return (
    <>
      <span className="text-[#555]">→ {item.repo}</span>
      <span className="text-term-green">scanned ✓</span>
      <span className="text-[#2a2a28]">·</span>
      <span className="text-[#555]">{item.ticker} generated</span>
      <span className="text-[#2a2a28]">·</span>
    </>
  )
}

export function TickerSection() {
  return (
    <div className="overflow-hidden py-[10px] bg-term-bg border-b border-white/[.06]">
      <div
        className="flex gap-10 whitespace-nowrap font-mono text-[11px]"
        style={{ animation: 'ticker 28s linear infinite' }}
      >
        {TICKER_ITEMS.map((item, i) => (
          <TickerItem key={i} item={item} />
        ))}
        {TICKER_ITEMS.map((item, i) => (
          <TickerItem key={`dup-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}
