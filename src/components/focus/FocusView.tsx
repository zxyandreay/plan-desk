import { AlertTriangle, CalendarClock, FileWarning, Flame, ListChecks } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { issueSeverityLabels, taskPriorityLabels, taskStatusLabels } from '../../types/constants'
import type { Issue, ResourceLink, Task } from '../../types/models'
import { colorClass } from '../../utils/colors'
import { formatDate } from '../../utils/date'
import { getFocusItems, projectForIssue, projectForTask } from '../../utils/metrics'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'

export function FocusView() {
  const data = useAppStore((state) => state.data)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const focus = getFocusItems(data)
  const hasItems =
    focus.overdueTasks.length ||
    focus.dueToday.length ||
    focus.dueThisWeek.length ||
    focus.highPriorityTasks.length ||
    focus.blockedTasks.length ||
    focus.criticalIssues.length ||
    focus.missingResources.length

  return (
    <div className="pd-page space-y-6">
      <header>
        <p className="pd-eyebrow">What needs attention</p>
        <h2 className="pd-page-title">Focus</h2>
        <p className="pd-page-description">
          Overdue work, near deadlines, blockers, critical issues, and missing linked resources.
        </p>
      </header>

      {!hasItems ? (
        <EmptyState
          title="Nothing needs attention"
          message="No overdue tasks, blocked work, critical issues, or missing resources are currently visible."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <TaskPanel
            title="Overdue"
            icon={<CalendarClock className="h-5 w-5 text-red-600" />}
            tasks={focus.overdueTasks}
            empty="No overdue tasks."
            onOpen={setActiveProject}
            data={data}
          />
          <TaskPanel
            title="Due today"
            icon={<CalendarClock className="h-5 w-5 text-amber-600" />}
            tasks={focus.dueToday}
            empty="No tasks due today."
            onOpen={setActiveProject}
            data={data}
          />
          <TaskPanel
            title="Due this week"
            icon={<ListChecks className="h-5 w-5 text-blue-700" />}
            tasks={focus.dueThisWeek}
            empty="No tasks due this week."
            onOpen={setActiveProject}
            data={data}
          />
          <TaskPanel
            title="High priority"
            icon={<Flame className="h-5 w-5 text-red-600" />}
            tasks={focus.highPriorityTasks}
            empty="No high priority open tasks."
            onOpen={setActiveProject}
            data={data}
          />
          <IssuePanel issues={focus.criticalIssues} onOpen={setActiveProject} data={data} />
          <ResourcePanel resources={focus.missingResources} onOpen={setActiveProject} data={data} />
        </div>
      )}
    </div>
  )
}

function TaskPanel({
  title,
  icon,
  tasks,
  empty,
  onOpen,
  data,
}: {
  title: string
  icon: React.ReactNode
  tasks: Task[]
  empty: string
  onOpen: (projectId: string) => void
  data: ReturnType<typeof useAppStore.getState>['data']
}) {
  return (
    <section className="pd-panel">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="pd-section-title">{title}</h3>
      </div>
      {tasks.length ? (
        <div className="space-y-2">
          {tasks.slice(0, 8).map((task) => {
            const project = projectForTask(data, task)
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onOpen(task.projectId)}
                className={`pd-row w-full px-3 py-2 text-left ${colorClass(task.color)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-[color:var(--pd-foreground-strong)]">
                    <span className="pd-color-dot" aria-hidden="true" />
                    <span className="line-clamp-2">{task.title}</span>
                  </span>
                  <Badge tone={task.priority === 'urgent' ? 'red' : 'amber'}>
                    {taskPriorityLabels[task.priority]}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
                  {project?.name ?? 'Project'} · {taskStatusLabels[task.status]} · Due {formatDate(task.dueDate)}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--pd-muted-foreground)]">{empty}</p>
      )}
    </section>
  )
}

function IssuePanel({
  issues,
  onOpen,
  data,
}: {
  issues: Issue[]
  onOpen: (projectId: string) => void
  data: ReturnType<typeof useAppStore.getState>['data']
}) {
  return (
    <section className="pd-panel">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="pd-section-title">Critical and high issues</h3>
      </div>
      {issues.length ? (
        <div className="space-y-2">
          {issues.map((issue) => {
            const project = projectForIssue(data, issue)
            return (
              <button
                key={issue.id}
                type="button"
                onClick={() => onOpen(issue.projectId)}
                className={`pd-row w-full px-3 py-2 text-left ${colorClass(issue.color)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-[color:var(--pd-foreground-strong)]">
                    <span className="pd-color-dot" aria-hidden="true" />
                    <span className="line-clamp-2">{issue.title}</span>
                  </span>
                  <Badge tone={issue.severity === 'critical' ? 'red' : 'amber'}>
                    {issueSeverityLabels[issue.severity]}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
                  {project?.name ?? 'Project'}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--pd-muted-foreground)]">No high or critical open issues.</p>
      )}
    </section>
  )
}

function ResourcePanel({
  resources,
  onOpen,
  data,
}: {
  resources: ResourceLink[]
  onOpen: (projectId: string) => void
  data: ReturnType<typeof useAppStore.getState>['data']
}) {
  return (
    <section className="pd-panel">
      <div className="mb-3 flex items-center gap-2">
        <FileWarning className="h-5 w-5 text-amber-600" />
        <h3 className="pd-section-title">Missing resources</h3>
      </div>
      {resources.length ? (
        <div className="space-y-2">
          {resources.map((resource) => {
            const project = data.projects.find((item) => item.id === resource.projectId)
            return (
              <button
                key={resource.id}
                type="button"
                onClick={() => onOpen(resource.projectId)}
                className={`pd-row pd-danger-row w-full px-3 py-2 text-left ${colorClass(resource.color)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-[color:var(--pd-foreground-strong)]">
                    <span className="pd-color-dot" aria-hidden="true" />
                    <span className="line-clamp-2">{resource.label}</span>
                  </span>
                  <Badge tone="red">Missing</Badge>
                </div>
                <div className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
                  {project?.name ?? 'Project'}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--pd-muted-foreground)]">No missing linked resources.</p>
      )}
    </section>
  )
}
