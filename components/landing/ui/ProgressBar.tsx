interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-[2px] bg-border rounded-pill mb-5 overflow-hidden">
      <div
        className="h-full bg-ink rounded-pill transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
