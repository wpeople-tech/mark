import type { SkillDefinition } from '@/lib/landing-data'
import { LVL_STYLE } from '@/lib/landing-data'

interface SkillCardProps {
  skill: SkillDefinition
  onClick: () => void
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
  const [cat, lvl, name, desc, tags] = skill
  const style = LVL_STYLE[lvl as keyof typeof LVL_STYLE]

  return (
    <div
      onClick={onClick}
      className="bg-white border border-border rounded-md p-[18px_20px] transition-all duration-200 cursor-pointer hover:border-accent-border hover:-translate-y-0.5"
      style={{ animation: 'fadeIn .3s ease both' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-medium text-accent bg-accent-bg border border-accent-border px-[8px] py-[2px] rounded-sm">
          {cat}
        </span>
        <span
          className="text-[10px] font-mono px-[8px] py-[2px] rounded-sm border"
          style={{
            color: style.fg,
            background: style.bg,
            borderColor: style.bd,
          }}
        >
          {lvl}
        </span>
      </div>
      <div className="text-[14px] font-semibold text-ink mb-[5px]">{name}</div>
      <div className="text-[12px] text-muted leading-[1.6] mb-[10px]">
        {desc}
      </div>
      <div className="flex gap-1 flex-wrap">
        {tags.map((tg) => (
          <span
            key={tg}
            className="text-[9px] font-mono text-[#555552] bg-surface border border-border px-[7px] py-[1px] rounded-sm"
          >
            {tg}
          </span>
        ))}
      </div>
    </div>
  )
}
