import type { IdeaItem } from '@/lib/landing-data'

interface IdeaCardProps {
  idea: IdeaItem
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <div
      className="border border-border rounded-md p-3 bg-paper"
      style={{ animation: 'ideaIn .45s cubic-bezier(.16,1,.3,1) both' }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[13px] font-semibold text-ink">{idea.name}</span>
        <span className="text-[10px] font-mono text-accent bg-accent-bg border border-accent-border px-[7px] py-[2px] rounded-sm">
          {idea.tk}
        </span>
      </div>
      <div className="text-[12px] text-muted leading-[1.5]">{idea.desc}</div>
      <div className="flex justify-between items-center mt-[6px]">
        <span className="text-[10px] text-green bg-green-bg border border-green-border px-[7px] py-[2px] rounded-sm">
          pump.fun viable ✓
        </span>
        <span className="text-[10px] font-mono text-muted">{idea.est}</span>
      </div>
    </div>
  )
}
