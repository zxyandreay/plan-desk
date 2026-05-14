import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getProjectWorkflowColumns, getTaskWorkflowColumn, isTaskCompletedByWorkflow } from '../../data/templates'
import { useAppStore } from '../../stores/appStore'
import { colorClass } from '../../utils/colors'
import { formatDate, isPastDate } from '../../utils/date'
import { cn } from '../../lib/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import type { ColorToken } from '../../types/models'

interface CalendarViewProps {
  projectId?: string
}

type CalendarItemType = 'project' | 'milestone' | 'task'

interface CalendarItem {
  id: string
  type: CalendarItemType
  title: string
  date: string
  projectId: string
  projectName: string
  color?: ColorToken
  status: string
  isComplete: boolean
}

export function CalendarView({ projectId }: CalendarViewProps) {
  const data = useAppStore((state) => state.data)
  const setActiveProject = useAppStore((state) => state.setActiveProject)
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(new Date())

  const items = useMemo(() => {
    const projects = projectId
      ? data.projects.filter((project) => project.id === projectId)
      : data.projects
    const projectIds = new Set(projects.map((project) => project.id))
    const builtItems: CalendarItem[] = []

    projects.forEach((project) => {
      if (project.dueDate) {
        builtItems.push({
          id: project.id,
          type: 'project',
          title: `${project.name} deadline`,
          date: project.dueDate,
          projectId: project.id,
          projectName: project.name,
          color: project.color,
          status: project.status,
          isComplete: project.status === 'completed' || project.status === 'archived',
        })
      }
    })

    data.milestones
      .filter((milestone) => projectIds.has(milestone.projectId) && milestone.dueDate)
      .forEach((milestone) => {
        const project = data.projects.find((item) => item.id === milestone.projectId)
        builtItems.push({
          id: milestone.id,
          type: 'milestone',
          title: milestone.title,
          date: milestone.dueDate,
          projectId: milestone.projectId,
          projectName: project?.name ?? 'Project',
          color: milestone.color,
          status: milestone.status.replaceAll('_', ' '),
          isComplete: milestone.status === 'completed',
        })
      })

    data.tasks
      .filter((task) => projectIds.has(task.projectId) && task.dueDate)
      .forEach((task) => {
        const project = data.projects.find((item) => item.id === task.projectId)
        const columns = getProjectWorkflowColumns(data.workflowColumns, task.projectId)
        const column = getTaskWorkflowColumn(task, columns)
        builtItems.push({
          id: task.id,
          type: 'task',
          title: task.title,
          date: task.dueDate,
          projectId: task.projectId,
          projectName: project?.name ?? 'Project',
          color: task.color,
          status: column?.name ?? task.status.replaceAll('_', ' '),
          isComplete: isTaskCompletedByWorkflow(task, columns),
        })
      })

    return builtItems.sort((a, b) => a.date.localeCompare(b.date))
  }, [data, projectId])

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  })
  const selectedItems = items.filter((item) => isSameDay(parseISO(item.date), selectedDate))
  const hasDatedItems = items.length > 0

  return (
    <div className={projectId ? 'space-y-4' : 'pd-page space-y-6'}>
      <header className={projectId ? 'flex flex-wrap items-center justify-between gap-3' : 'pd-page-header'}>
        <div>
          <p className="pd-eyebrow">Calendar</p>
          <h2 className={projectId ? 'text-lg font-semibold text-[color:var(--pd-foreground-strong)]' : 'pd-page-title'}>
            Deadlines by Month
          </h2>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Projects, milestones, and task due dates in one calm monthly view.
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon={<ChevronLeft className="h-4 w-4" />} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            Previous
          </Button>
          <Button onClick={() => {
            const today = new Date()
            setCurrentMonth(startOfMonth(today))
            setSelectedDate(today)
          }}>
            Today
          </Button>
          <Button icon={<ChevronRight className="h-4 w-4" />} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next
          </Button>
        </div>
      </header>

      {!hasDatedItems ? (
        <EmptyState
          title="No dated work yet"
          message="Add due dates to projects, milestones, or tasks to see them on the calendar."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <section className="pd-panel overflow-hidden p-0">
            <div className="border-b border-[color:var(--pd-border)] px-4 py-3">
              <h3 className="font-semibold text-[color:var(--pd-foreground-strong)]">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
            </div>
            <div className="grid grid-cols-7 border-b border-[color:var(--pd-border)] bg-[color:var(--pd-muted)] text-xs font-semibold uppercase tracking-wide text-[color:var(--pd-muted-foreground)]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-3 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const dayItems = items.filter((item) => isSameDay(parseISO(item.date), day))
                const selected = isSameDay(day, selectedDate)
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-28 border-b border-r border-[color:var(--pd-border)] p-2 text-left transition hover:bg-[color:var(--pd-card-hover)]',
                      !isSameMonth(day, currentMonth) ? 'bg-[color:var(--pd-muted)] text-[color:var(--pd-subtle-foreground)]' : 'bg-[color:var(--pd-card)]',
                      selected ? 'outline outline-2 outline-[color:var(--pd-primary)] outline-offset-[-2px]' : '',
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{format(day, 'd')}</span>
                      {dayItems.length ? <Badge tone="blue">{dayItems.length}</Badge> : null}
                    </div>
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <span
                          key={`${item.type}-${item.id}`}
                          className={`pd-color-pill max-w-full ${colorClass(item.color)}`}
                        >
                          <span className="pd-color-dot" aria-hidden="true" />
                          <span className="truncate">{item.title}</span>
                        </span>
                      ))}
                      {dayItems.length > 3 ? (
                        <p className="text-xs text-[color:var(--pd-muted-foreground)]">
                          +{dayItems.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="pd-panel">
            <h3 className="pd-section-title">{format(selectedDate, 'MMM d, yyyy')}</h3>
            <div className="mt-4 space-y-3">
              {selectedItems.length ? (
                selectedItems.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => setActiveProject(item.projectId)}
                    className={`pd-card pd-card-interactive pd-color-card w-full p-3 text-left ${colorClass(item.color)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="pd-color-dot mt-1.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-sm font-semibold text-[color:var(--pd-foreground-strong)]">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
                          {projectId ? item.type : `${item.projectName} - ${item.type}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={item.isComplete ? 'green' : isPastDate(item.date) ? 'red' : 'blue'}>
                        {item.isComplete ? 'Complete' : isPastDate(item.date) ? 'Overdue' : item.status}
                      </Badge>
                      <Badge tone="slate">{formatDate(item.date)}</Badge>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-[color:var(--pd-border-strong)] px-3 py-6 text-center text-sm text-[color:var(--pd-muted-foreground)]">
                  No dated work on this day.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
