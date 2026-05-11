import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Dashboard } from './components/dashboard/Dashboard'
import { FocusView } from './components/focus/FocusView'
import { AppShell } from './components/layout/AppShell'
import { ProjectWorkspace } from './components/projects/ProjectWorkspace'
import { SettingsView } from './components/settings/SettingsView'
import { Toast } from './components/ui/Toast'
import { useAppStore } from './stores/appStore'

function App() {
  const initialize = useAppStore((state) => state.initialize)
  const isReady = useAppStore((state) => state.isReady)
  const activeView = useAppStore((state) => state.activeView)
  const activeProjectId = useAppStore((state) => state.activeProjectId)

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-700">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
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
