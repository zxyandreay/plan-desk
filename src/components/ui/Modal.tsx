import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, description, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-[color:var(--pd-border)] bg-[color:var(--pd-card)] shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--pd-border)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Close modal"
            variant="ghost"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="max-h-[calc(92vh-74px)] overflow-y-auto bg-[color:var(--pd-card)] p-5 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )
}
