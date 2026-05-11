interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value))

  return (
    <div className="space-y-1">
      {label ? <div className="text-xs font-medium text-[color:var(--pd-muted-foreground)]">{label}</div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--pd-muted)]">
        <div
          className="h-full rounded-full bg-[color:var(--pd-primary)] transition-all"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  )
}
