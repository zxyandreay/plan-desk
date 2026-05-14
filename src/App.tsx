import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Dashboard } from './components/dashboard/Dashboard'
import { CalendarView } from './components/calendar/CalendarView'
import { FocusView } from './components/focus/FocusView'
import { AppShell } from './components/layout/AppShell'
import { ProjectWorkspace } from './components/projects/ProjectWorkspace'
import { SettingsView } from './components/settings/SettingsView'
import { Toast } from './components/ui/Toast'
import { useTheme } from './hooks/useTheme'
import { useAppStore } from './stores/appStore'

function App() {
  const initialize = useAppStore((state) => state.initialize)
  const isReady = useAppStore((state) => state.isReady)
  const activeView = useAppStore((state) => state.activeView)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const theme = useAppStore((state) => state.data.settings.theme)

  useTheme(theme)

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (!isReady) {
    return (
      <div className="pd-app flex h-screen items-center justify-center">
        <div className="pd-card flex items-center gap-3 px-5 py-4 text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--pd-primary)]" />
          Loading PlanDesk
        </div>
      </div>
    )
  }

  const content =
    activeView === 'project' && activeProjectId ? (
      <ProjectWorkspace projectId={activeProjectId} />
    ) : activeView === 'focus' ? (
      <FocusView />
    ) : activeView === 'calendar' ? (
      <CalendarView />
    ) : activeView === 'settings' ? (
      <SettingsView />
    ) : (
      <Dashboard />
    )

  return (
    <>
      <AppShell>{content}</AppShell>
      <Toast />
    </>
  )
}

export default App
