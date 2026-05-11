import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../stores/appStore'

const toneClass = {
  success: 'pd-badge-green',
  info: 'pd-badge-blue',
  warning: 'pd-badge-amber',
  error: 'pd-badge-red',
}

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

export function Toast() {
  const toast = useAppStore((state) => state.toast)
  const dismissToast = useAppStore((state) => state.dismissToast)

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(dismissToast, 4200)
    return () => window.clearTimeout(timer)
  }, [dismissToast, toast])

  if (!toast) {
    return null
  }

  const Icon = icons[toast.tone]

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg',
        toneClass[toast.tone],
      )}
      role="status"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{toast.message}</span>
    </div>
  )
}
