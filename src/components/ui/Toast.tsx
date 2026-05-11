import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../stores/appStore'

const toneClass = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
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
        'fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
        toneClass[toast.tone],
      )}
      role="status"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{toast.message}</span>
    </div>
  )
}
