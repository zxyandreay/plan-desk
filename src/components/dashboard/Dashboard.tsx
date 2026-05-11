import { AlertTriangle, CalendarClock, CheckCircle2, FolderCheck, FolderOpen, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { projectPriorityLabels, projectStatusLabels } from '../../types/constants'
import type { ProjectFormValues } from '../../types/models'
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
import { ProjectForm } from '../projects/ProjectForm'

export function Dashboard() {
  const data = useAppStore((state) => state.data)
  const createProject = useAppStore((state) => state.createProject)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const loadSampleData = useAppStore((state) => state.loadSampleData)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isProjectModalOpen, setProjectModalOpen] = useState(false)

  const stats = getDashboardStats(data)
  const dueSoon = data.tasks.filter(isTaskDueSoon).slice(0, 8)
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

  const submitProject = (values: ProjectFormValues) => {
    createProject(values)
    setProjectModalOpen(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">Plan projects. Track tasks. Finish work.</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
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
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-950">Projects</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      aria-label="Search dashboard projects"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="h-9 w-64 rounded-md border border-slate-300 pl-9 pr-3 text-sm"
                      placeholder="Search"
                    />
                  </div>
                  <select
                    aria-label="Filter projects by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
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
                    const progress = calculateProgress(tasks)
                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setActiveProject(project.id)}
                        className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-semibold text-slate-950">{project.name}</h4>
                            <p className="mt-1 text-sm text-slate-500">{project.category || 'Uncategorized'}</p>
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
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
                          <span>{countOpenTasks(tasks)} open tasks</span>
                          <span>{countOpenIssues(issues)} open issues</span>
                          <span>{resources.length} resources</span>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">Due {formatDate(project.dueDate)}</p>
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
                          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-blue-50"
                        >
                          <div className="text-sm font-medium text-slate-900">{task.title}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {project?.name ?? 'Project'} · {formatDate(task.dueDate)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Nothing due in the next seven days.</p>
                )}
              </Panel>
              <Panel title="Recent projects">
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setActiveProject(project.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <span className="font-medium text-slate-800">{project.name}</span>
                      <span className="text-xs text-slate-500">{formatDate(project.updatedAt)}</span>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        </>
      )}

      <Modal title="Create project" isOpen={isProjectModalOpen} onClose={() => setProjectModalOpen(false)}>
        <ProjectForm onCancel={() => setProjectModalOpen(false)} onSubmit={submitProject} />
      </Modal>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold text-slate-950">{title}</h3>
      {children}
    </div>
  )
}
