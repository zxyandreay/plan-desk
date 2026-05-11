import { CalendarClock, FolderKanban, Gauge, Plus, Search, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { cn } from '../../lib/cn'
import { useAppStore, type AppView } from '../../stores/appStore'
import { projectStatusLabels } from '../../types/constants'
import type { ProjectFormValues } from '../../types/models'
import { calculateProgress, getProjectTasks } from '../../utils/metrics'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { ProjectForm } from '../projects/ProjectForm'

interface AppShellProps {
  children: ReactNode
}

const navItems: { id: AppView; label: string; icon: typeof Gauge }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'focus', label: 'Focus', icon: CalendarClock },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: AppShellProps) {
  const data = useAppStore((state) => state.data)
  const activeView = useAppStore((state) => state.activeView)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const setActiveView = useAppStore((state) => state.setActiveView)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const createProject = useAppStore((state) => state.createProject)
  const isSaving = useAppStore((state) => state.isSaving)
  const [isProjectModalOpen, setProjectModalOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return data.projects
    }

    return data.projects.filter((project) =>
      [project.name, project.category, project.description, project.goal]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [data.projects, query])

  const submitProject = (values: ProjectFormValues) => {
    createProject(values)
    setProjectModalOpen(false)
  }

  return (
    <div className="pd-app flex h-screen">
      <aside className="pd-sidebar flex w-72 shrink-0 flex-col border-r">
        <div className="border-b border-[color:var(--pd-border)] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--pd-primary)] text-[color:var(--pd-primary-foreground)] shadow-sm">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-normal text-[color:var(--pd-foreground-strong)]">
                PlanDesk
              </h1>
              <p className="text-xs text-[color:var(--pd-muted-foreground)]">
                Plan projects. Track tasks. Finish work.
              </p>
            </div>
          </div>
          <Button
            className="mt-5 w-full"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setProjectModalOpen(true)}
          >
            New project
          </Button>
        </div>
        <nav className="space-y-1 border-b border-[color:var(--pd-border)] p-3" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={cn(
                  'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition',
                  active
                    ? 'bg-[color:var(--pd-accent)] text-[color:var(--pd-accent-foreground)] shadow-sm'
                    : 'text-[color:var(--pd-muted-foreground)] hover:bg-[color:var(--pd-muted)] hover:text-[color:var(--pd-foreground-strong)]',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[color:var(--pd-subtle-foreground)]" />
            <input
              aria-label="Search projects"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              className="pd-input h-9 w-full pl-9 pr-3 text-sm"
            />
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(getProjectTasks(data, project.id))
              const active = activeView === 'project' && activeProjectId === project.id
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(project.id)}
                  className={cn(
                    'w-full rounded-xl border px-3 py-3 text-left transition',
                    active
                      ? 'border-[color:var(--pd-primary)] bg-[color:var(--pd-accent)] shadow-sm'
                      : 'border-[color:var(--pd-border)] bg-[color:var(--pd-card)] hover:border-[color:var(--pd-border-strong)] hover:bg-[color:var(--pd-card-hover)]',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-semibold text-[color:var(--pd-foreground-strong)]">
                      {project.name}
                    </span>
                    <span className="shrink-0 rounded-md bg-[color:var(--pd-muted)] px-1.5 py-0.5 text-[11px] text-[color:var(--pd-muted-foreground)]">
                      {progress}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[color:var(--pd-muted-foreground)]">
                    <span>{project.category || 'Uncategorized'}</span>
                    <span>{projectStatusLabels[project.status]}</span>
                  </div>
                </button>
              )
            })}
            {!filteredProjects.length ? (
              <p className="rounded-xl border border-dashed border-[color:var(--pd-border-strong)] px-3 py-5 text-center text-sm text-[color:var(--pd-muted-foreground)]">
                No matching projects.
              </p>
            ) : null}
          </div>
        </div>
        <div className="border-t border-[color:var(--pd-border)] px-4 py-3 text-xs text-[color:var(--pd-muted-foreground)]">
          {isSaving ? 'Saving locally...' : 'Stored locally in this workspace'}
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      <Modal
        title="Create project"
        description="Start with the goal and optionally link a root folder."
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      >
        <ProjectForm onCancel={() => setProjectModalOpen(false)} onSubmit={submitProject} />
      </Modal>
    </div>
  )
}
