import { Flag, Milestone as MilestoneIcon } from 'lucide-react'
import { getProjectWorkflowColumns, getTaskWorkflowColumn, isTaskCompletedByWorkflow } from '../../data/templates'
import { colorClass } from '../../utils/colors'
import { formatDate, isPastDate } from '../../utils/date'
import type { AppData, Project } from '../../types/models'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'

interface TimelineViewProps {
  data: AppData
  project: Project
}

export function TimelineView({ data, project }: TimelineViewProps) {
  const milestones = data.milestones
    .filter((milestone) => milestone.projectId === project.id)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return a.order - b.order
    })
  const projectTasks = data.tasks.filter((task) => task.projectId === project.id)
  const scheduledTasks = projectTasks.filter((task) => task.dueDate)
  const unscheduledTasks = projectTasks.filter((task) => !task.dueDate)

  if (!milestones.length && !scheduledTasks.length && !project.startDate && !project.dueDate) {
    return (
      <EmptyState
        title="No timeline yet"
        message="Add project dates, milestone dates, or task due dates to build a project timeline."
      />
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="pd-eyebrow">Timeline</p>
          <h3 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">Project Phases</h3>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Milestones and dated tasks in schedule order, with unscheduled work kept separate.
          </p>
        </div>
      </header>

      <div className="pd-card pd-color-card p-4 pl-5">
        <div className="flex items-start gap-3">
          <Flag className="mt-1 h-5 w-5 text-[color:var(--pd-primary)]" />
          <div>
            <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">{project.name}</h4>
            <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
              {formatDate(project.startDate)} to {formatDate(project.dueDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[color:var(--pd-border-strong)]">
        {milestones.map((milestone) => {
          const milestoneTasks = scheduledTasks
            .filter((task) => task.milestoneId === milestone.id)
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          const isMilestoneOverdue = milestone.status !== 'completed' && isPastDate(milestone.dueDate)

          return (
            <article key={milestone.id} className="relative pl-10">
              <span className={`pd-color-card absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border border-[color:var(--pd-border)] bg-[color:var(--pd-card)] ${colorClass(milestone.color)}`}>
                <span className="pd-color-dot" aria-hidden="true" />
              </span>
              <div className={`pd-card pd-color-card p-4 ${colorClass(milestone.color)}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-[color:var(--pd-foreground-strong)]">
                      <MilestoneIcon className="h-4 w-4" />
                      {milestone.title}
                    </h4>
                    <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
                      {milestone.description || 'No milestone description.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={milestone.status === 'completed' ? 'green' : isMilestoneOverdue ? 'red' : 'blue'}>
                      {milestone.status.replaceAll('_', ' ')}
                    </Badge>
                    <Badge tone="slate">{formatDate(milestone.dueDate)}</Badge>
                  </div>
                </div>
                <TimelineTaskList data={data} tasks={milestoneTasks} />
              </div>
            </article>
          )
        })}
      </div>

      {scheduledTasks.some((task) => !task.milestoneId) ? (
        <div className="pd-panel">
          <h4 className="pd-section-title">Scheduled tasks without a milestone</h4>
          <TimelineTaskList data={data} tasks={scheduledTasks.filter((task) => !task.milestoneId)} />
        </div>
      ) : null}

      {unscheduledTasks.length ? (
        <div className="pd-panel">
          <h4 className="pd-section-title">Unscheduled tasks</h4>
          <TimelineTaskList data={data} tasks={unscheduledTasks} />
        </div>
      ) : null}
    </section>
  )
}

function TimelineTaskList({ data, tasks }: { data: AppData; tasks: AppData['tasks'] }) {
  if (!tasks.length) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-[color:var(--pd-border-strong)] px-3 py-4 text-sm text-[color:var(--pd-muted-foreground)]">
        No dated tasks in this phase.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      {tasks.map((task) => {
        const columns = getProjectWorkflowColumns(data.workflowColumns, task.projectId)
        const column = getTaskWorkflowColumn(task, columns)
        const complete = isTaskCompletedByWorkflow(task, columns)
        const overdue = !complete && isPastDate(task.dueDate)
        return (
          <div key={task.id} className={`pd-row pd-color-card px-3 py-2 ${colorClass(task.color)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span className="pd-color-dot mt-1.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium text-[color:var(--pd-foreground-strong)]">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <Badge tone={complete ? 'green' : overdue ? 'red' : 'blue'}>
                  {complete ? 'Complete' : overdue ? 'Overdue' : column?.name ?? task.status}
                </Badge>
                <Badge tone={task.priority === 'urgent' || task.priority === 'high' ? 'amber' : 'slate'}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
