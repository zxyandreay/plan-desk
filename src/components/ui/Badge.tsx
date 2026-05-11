import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BadgeTone = 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple'

const tones: Record<BadgeTone, string> = {
  slate: 'pd-badge-slate',
  blue: 'pd-badge-blue',
  green: 'pd-badge-green',
  amber: 'pd-badge-amber',
  red: 'pd-badge-red',
  purple: 'pd-badge-purple',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export function Badge({ children, tone = 'slate', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'pd-badge inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
