import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--pd-border-strong)] bg-[color:var(--pd-card)] px-6 py-10 text-center shadow-sm">
      <div className="pd-empty-icon">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-[color:var(--pd-foreground-strong)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--pd-muted-foreground)]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
