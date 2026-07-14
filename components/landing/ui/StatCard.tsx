'use client'

import { useCountUp } from '@/lib/hooks/useCountUp'

interface StatCardProps {
  label: string
  value: number
  unit: string
  description: string
  icon: React.ReactNode
  isVisible: boolean
  delay?: number
  iconBg?: 'blue' | 'green'
}

export function StatCard({
  label,
  value,
  unit,
  description,
  icon,
  isVisible,
  delay = 0,
  iconBg = 'blue',
}: StatCardProps) {
  const animatedValue = useCountUp(isVisible ? value : 0, 1800)

  const iconClasses =
    iconBg === 'blue'
      ? 'bg-accent-bg border-accent-border'
      : 'bg-green-bg border-green-border'

  return (
    <div
      className="bg-white/85 backdrop-blur-[8px] rounded-card border border-[var(--border)] p-5 text-left opacity-0"
      style={{
        animation: isVisible
          ? `blurIn 0.8s cubic-bezier(.16,1,.3,1) ${delay}s forwards`
          : undefined,
        filter: 'blur(6px)',
        transform: 'translateY(16px)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium tracking-[.08em] uppercase text-muted">
          {label}
        </span>
        <span
          className={`size-8 rounded-md flex items-center justify-center border ${iconClasses}`}
        >
          {icon}
        </span>
      </div>
      <div className="text-[30px] font-bold tracking-[-.04em] text-ink leading-[1.1]">
        {animatedValue}
        {unit}
      </div>
      <div className="text-[12px] text-muted mt-0.5">{description}</div>
    </div>
  )
}
