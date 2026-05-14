import { AlertTriangle, CalendarClock, CheckCircle2, FolderCheck, FolderOpen, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { projectPriorityLabels, projectStatusLabels } from '../../types/constants'
import { colorClass } from '../../utils/colors'
import { formatDate } from '../../utils/date'
import {
  calculateProgress,
  countOpenIssues,
  countOpenTasks,
  getDashboardStats,
  getProjectIssues,
  getProjectResources,
  getProjectTasks,
  isTaskDueSoon,
} from '../../utils/metrics'
import { useAppStore } from '../../stores/appStore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { ProjectTemplateWizard } from '../projects/ProjectTemplateWizard'

export function Dashboard() {
  const data = useAppStore((state) => state.data)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const loadSampleData = useAppStore((state) => state.loadSampleData)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isProjectModalOpen, setProjectModalOpen] = useState(false)

  const stats = getDashboardStats(data)
  const dueSoon = data.tasks.filter((task) => isTaskDueSoon(task, data)).slice(0, 8)
  const recentProjects = data.projects
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return data.projects.filter((project) => {
      const matchesText = [project.name, project.category, project.description, project.goal]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesText && matchesStatus
    })
  }, [data.projects, query, statusFilter])

  return (
    <div className="pd-page space-y-6">
      <header className="pd-page-header">
        <div>
          <p className="pd-eyebrow">Plan projects. Track tasks. Finish work.</p>
          <h2 className="pd-page-title">Dashboard</h2>
          <p className="pd-page-description">
            Your projects, tasks, notes, and files in one local workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSampleData}>Load sample project</Button>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setProjectModalOpen(true)}
          >
            New project
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-5">
        <StatCard label="Active projects" value={stats.activeProjects} icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Completed" value={stats.completedProjects} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Overdue tasks" value={stats.overdueTasks} icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard label="Open issues" value={stats.blockedIssues} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Missing resources" value={stats.missingResources} icon={<FolderCheck className="h-5 w-5" />} />
      </section>

      {data.projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message="Create your first project or load sample data to explore how PlanDesk connects planning work to local files and folders."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" onClick={() => setProjectModalOpen(true)}>
                Create project
              </Button>
              <Button onClick={loadSampleData}>Load sample data</Button>
            </div>
          }
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="pd-panel">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="pd-section-title">Projects</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[color:var(--pd-subtle-foreground)]" />
                    <input
                      aria-label="Search dashboard projects"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="pd-input h-9 w-64 pl-9 pr-3 text-sm"
                      placeholder="Search"
                    />
                  </div>
                  <select
                    aria-label="Filter projects by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="pd-input h-9 px-3 text-sm"
                  >
                    <option value="all">All statuses</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              {filteredProjects.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredProjects.map((project) => {
                    const tasks = getProjectTasks(data, project.id)
                    const issues = getProjectIssues(data, project.id)
                    const resources = getProjectResources(data, project.id)
                    const progress = calculateProgress(tasks, data)
                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setActiveProject(project.id)}
                        className={`pd-card pd-card-interactive pd-color-card p-4 pl-5 text-left ${colorClass(project.color)}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="pd-color-dot" aria-hidden="true" />
                              <h4 className="line-clamp-2 text-base font-semibold text-[color:var(--pd-foreground-strong)]">
                                {project.name}
                              </h4>
                            </div>
                            <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
                              {project.category || 'Uncategorized'}
                            </p>
                          </div>
                          {project.rootFolderPath ? <FolderOpen className="h-4 w-4 text-blue-700" /> : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge tone="blue">{projectStatusLabels[project.status]}</Badge>
                          <Badge tone={project.priority === 'high' ? 'red' : 'slate'}>
                            {projectPriorityLabels[project.priority]}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <ProgressBar value={progress} label={`${progress}% complete`} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-[color:var(--pd-muted-foreground)]">
                          <span>{countOpenTasks(tasks, data)} open tasks</span>
                          <span>{countOpenIssues(issues)} open issues</span>
                          <span>{resources.length} resources</span>
                        </div>
                        <p className="mt-3 text-xs text-[color:var(--pd-muted-foreground)]">
                          Due {formatDate(project.dueDate)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <EmptyState title="No search results" message="Try a different search term or status filter." />
              )}
            </div>
            <div className="space-y-4">
              <Panel title="Due soon">
                {dueSoon.length ? (
                  <div className="space-y-3">
                    {dueSoon.map((task) => {
                      const project = data.projects.find((item) => item.id === task.projectId)
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setActiveProject(task.projectId)}
                          className={`pd-row w-full px-3 py-2 text-left ${colorClass(task.color)}`}
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--pd-foreground-strong)]">
                            <span className="pd-color-dot" aria-hidden="true" />
                            <span className="line-clamp-2">{task.title}</span>
                          </div>
                          <div className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
                            {project?.name ?? 'Project'} · {formatDate(task.dueDate)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--pd-muted-foreground)]">
                    Nothing due in the next seven days.
                  </p>
                )}
              </Panel>
              <Panel title="Recent projects">
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setActiveProject(project.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-[color:var(--pd-muted)]"
                    >
                      <span className="font-medium text-[color:var(--pd-foreground)]">{project.name}</span>
                      <span className="text-xs text-[color:var(--pd-muted-foreground)]">
                        {formatDate(project.updatedAt)}
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        </>
      )}

      <Modal title="Create project" isOpen={isProjectModalOpen} onClose={() => setProjectModalOpen(false)}>
        <ProjectTemplateWizard
          onCancel={() => setProjectModalOpen(false)}
          onCreated={() => setProjectModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="pd-card p-4">
      <div className="flex items-center justify-between text-[color:var(--pd-muted-foreground)]">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-[color:var(--pd-foreground-strong)]">{value}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pd-panel">
      <h3 className="mb-3 pd-section-title">{title}</h3>
      {children}
    </div>
  )
}
