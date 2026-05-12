import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Edit3, GripVertical, Link2, Paperclip, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { type ButtonHTMLAttributes, useMemo, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { taskPriorities, taskPriorityLabels, taskStatusLabels, taskStatuses } from '../../types/constants'
import type {
  ColorToken,
  ResourceFormValues,
  ResourceLink,
  Task,
  TaskFormValues,
  TaskPriority,
  TaskStatus,
} from '../../types/models'
import { cn } from '../../lib/cn'
import { colorClass } from '../../utils/colors'
import { formatDate, isPastDate } from '../../utils/date'
import { resourceCountForEntity } from '../../utils/metrics'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { ResourceForm } from '../resources/ResourceForm'
import { TaskForm } from './TaskForm'

interface TasksViewProps {
  projectId: string
}

export function TasksView({ projectId }: TasksViewProps) {
  const data = useAppStore((state) => state.data)
  const taskView = useAppStore((state) => state.taskView)
  const setTaskView = useAppStore((state) => state.setTaskView)
  const createTask = useAppStore((state) => state.createTask)
  const updateTask = useAppStore((state) => state.updateTask)
  const deleteTask = useAppStore((state) => state.deleteTask)
  const moveTask = useAppStore((state) => state.moveTask)
  const toggleSubtask = useAppStore((state) => state.toggleSubtask)
  const createResource = useAppStore((state) => state.createResource)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [deletingTask, setDeletingTask] = useState<Task | undefined>()
  const [resourceTarget, setResourceTarget] = useState<Task | undefined>()
  const [isTaskModalOpen, setTaskModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all')
  const [milestoneFilter, setMilestoneFilter] = useState('all')

  const milestones = data.milestones.filter((milestone) => milestone.projectId === projectId)
  const projectResources = data.resources.filter((resource) => resource.projectId === projectId)
  const tasks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return data.tasks.filter((task) => {
      if (task.projectId !== projectId) {
        return false
      }

      const matchesText = [task.title, task.description, task.assignee, task.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchesMilestone = milestoneFilter === 'all' || task.milestoneId === milestoneFilter
      return matchesText && matchesStatus && matchesPriority && matchesMilestone
    })
  }, [data.tasks, milestoneFilter, priorityFilter, projectId, query, statusFilter])

  const submitTask = (values: TaskFormValues) => {
    if (editingTask) {
      updateTask(editingTask.id, values)
    } else {
      createTask(projectId, values)
    }
    setEditingTask(undefined)
    setTaskModalOpen(false)
  }

  const submitResource = async (values: ResourceFormValues) => {
    await createResource(projectId, values)
    setResourceTarget(undefined)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = String(event.active.id)
    const status = event.over?.id as TaskStatus | undefined
    if (status && taskStatuses.includes(status)) {
      moveTask(taskId, status)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">Tasks</h3>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">Manage the work in board or list view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="pd-segmented">
            <button
              type="button"
              onClick={() => setTaskView('board')}
              className={cn(
                'pd-segment',
                taskView === 'board' ? 'pd-segment-active' : '',
              )}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setTaskView('list')}
              className={cn(
                'pd-segment',
                taskView === 'list' ? 'pd-segment-active' : '',
              )}
            >
              List
            </button>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingTask(undefined)
              setTaskModalOpen(true)
            }}
          >
            Add task
          </Button>
        </div>
      </div>

      <div className="pd-toolbar p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[color:var(--pd-subtle-foreground)]" />
            <input
              aria-label="Search tasks"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks"
              className="pd-input h-9 w-full pl-9 pr-3 text-sm"
            />
          </div>
          <select
            aria-label="Filter status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | TaskStatus)}
            className="pd-input h-9 px-3 text-sm"
          >
            <option value="all">All statuses</option>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as 'all' | TaskPriority)}
            className="pd-input h-9 px-3 text-sm"
          >
            <option value="all">All priorities</option>
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter milestone"
            value={milestoneFilter}
            onChange={(event) => setMilestoneFilter(event.target.value)}
            className="pd-input h-9 px-3 text-sm"
          >
            <option value="all">All milestones</option>
            {milestones.map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!tasks.length ? (
        <EmptyState
          title="No tasks"
          message="Create tasks to turn this project into a clear, finishable plan."
          action={<Button variant="primary" onClick={() => setTaskModalOpen(true)}>Add task</Button>}
        />
      ) : taskView === 'board' ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="pd-kanban-rail">
            <div className="pd-kanban-track">
              {taskStatuses.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  tasks={tasks.filter((task) => task.status === status)}
                  milestones={milestones}
                  resources={projectResources}
                  onEdit={(task) => {
                    setEditingTask(task)
                    setTaskModalOpen(true)
                  }}
                  onDelete={setDeletingTask}
                  onLink={setResourceTarget}
                  onToggleSubtask={toggleSubtask}
                />
              ))}
            </div>
          </div>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              milestones={milestones}
              resources={projectResources}
              onEdit={() => {
                setEditingTask(task)
                setTaskModalOpen(true)
              }}
              onDelete={() => setDeletingTask(task)}
              onLink={() => setResourceTarget(task)}
              onToggleSubtask={toggleSubtask}
            />
          ))}
        </div>
      )}

      <Modal
        title={editingTask ? 'Edit task' : 'Create task'}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setEditingTask(undefined)
          setTaskModalOpen(false)
        }}
      >
        <TaskForm
          task={editingTask}
          milestones={milestones}
          onCancel={() => {
            setEditingTask(undefined)
            setTaskModalOpen(false)
          }}
          onSubmit={submitTask}
        />
      </Modal>
      <Modal title="Link task resource" isOpen={Boolean(resourceTarget)} onClose={() => setResourceTarget(undefined)}>
        {resourceTarget ? (
          <ResourceForm
            data={data}
            projectId={projectId}
            defaultEntityType="task"
            defaultEntityId={resourceTarget.id}
            onCancel={() => setResourceTarget(undefined)}
            onSubmit={submitResource}
          />
        ) : null}
      </Modal>
      <ConfirmDialog
        title="Delete task"
        message="This removes the task record and its resource links from PlanDesk. It will not delete real files or folders."
        confirmLabel="Delete task"
        isOpen={Boolean(deletingTask)}
        onCancel={() => setDeletingTask(undefined)}
        onConfirm={() => {
          if (deletingTask) {
            deleteTask(deletingTask.id)
            setDeletingTask(undefined)
          }
        }}
      />
    </section>
  )
}

function TaskColumn({
  status,
  tasks,
  milestones,
  resources,
  onEdit,
  onDelete,
  onLink,
  onToggleSubtask,
}: {
  status: TaskStatus
  tasks: Task[]
  milestones: { id: string; title: string; color?: ColorToken }[]
  resources: ResourceLink[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onLink: (task: Task) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'pd-kanban-column transition',
        isOver ? 'pd-kanban-column-over' : '',
      )}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--pd-border)] px-3 py-3">
        <h4 className="text-sm font-semibold text-[color:var(--pd-foreground-strong)]">{taskStatusLabels[status]}</h4>
        <span className="rounded-md border border-[color:var(--pd-border)] bg-[color:var(--pd-card)] px-2 py-0.5 text-xs font-semibold text-[color:var(--pd-muted-foreground)]">
          {tasks.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 pr-2 scrollbar-thin">
        {tasks.length ? (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              milestones={milestones}
              resources={resources}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              onLink={() => onLink(task)}
              onToggleSubtask={onToggleSubtask}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[color:var(--pd-border-strong)] px-3 py-6 text-center text-sm text-[color:var(--pd-muted-foreground)]">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

function DraggableTaskCard(props: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.task.id,
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        {...props}
        compact
        dragHandleProps={{ ...attributes, ...listeners } as ButtonHTMLAttributes<HTMLButtonElement>}
        isDragging={isDragging}
      />
    </div>
  )
}

interface TaskCardProps {
  task: Task
  milestones: { id: string; title: string; color?: ColorToken }[]
  resources: ResourceLink[]
  compact?: boolean
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>
  isDragging?: boolean
  onEdit: () => void
  onDelete: () => void
  onLink: () => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}

function TaskCard({
  task,
  milestones,
  resources,
  compact = false,
  dragHandleProps,
  isDragging = false,
  onEdit,
  onDelete,
  onLink,
  onToggleSubtask,
}: TaskCardProps) {
  const milestone = milestones.find((item) => item.id === task.milestoneId)
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const subtaskProgress = task.subtasks.length
    ? Math.round((completedSubtasks / task.subtasks.length) * 100)
    : 0
  const linkedResources = resourceCountForEntity(resources, 'task', task.id)
  const overdue = isPastDate(task.dueDate) && task.status !== 'done'

  return (
    <article
      className={cn(
        'pd-card pd-color-card p-4 pl-5',
        colorClass(task.color),
        compact ? 'p-3 pl-5' : '',
        isDragging ? 'border-[color:var(--pd-primary)] shadow-lg' : '',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {dragHandleProps ? (
            <button
              type="button"
              aria-label={`Drag ${task.title}`}
              className="mt-0.5 grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded-md text-[color:var(--pd-subtle-foreground)] hover:bg-[color:var(--pd-muted)] hover:text-[color:var(--pd-foreground-strong)] active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : (
            <span className="pd-color-dot mt-2" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <h4 className="line-clamp-2 font-semibold leading-5 text-[color:var(--pd-foreground-strong)]">
              {task.title}
            </h4>
            {!compact && task.description ? (
              <p className="mt-2 text-sm leading-6 text-[color:var(--pd-muted-foreground)]">
                {task.description}
              </p>
            ) : null}
          </div>
        </div>
        <Badge tone={task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'amber' : 'slate'}>
          {taskPriorityLabels[task.priority]}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={task.status === 'blocked' ? 'red' : task.status === 'done' ? 'green' : 'blue'}>
          {taskStatusLabels[task.status]}
        </Badge>
        {overdue ? <Badge tone="red">Overdue</Badge> : null}
        {milestone ? (
          <span className={`pd-color-pill ${colorClass(milestone.color)}`}>
            <span className="pd-color-dot" aria-hidden="true" />
            {milestone.title}
          </span>
        ) : null}
        {task.tags.map((tag) => (
          <Badge key={tag} tone="purple">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-3 grid gap-2 text-xs text-[color:var(--pd-muted-foreground)] sm:grid-cols-2">
        <span>Due {formatDate(task.dueDate)}</span>
        <span className="inline-flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5" />
          {linkedResources} resources
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5 sm:col-span-2">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{task.assignee || 'Unassigned'}</span>
        </span>
      </div>
      {task.subtasks.length ? (
        <div className="mt-3">
          <ProgressBar value={subtaskProgress} label={`${completedSubtasks}/${task.subtasks.length} subtasks`} />
          {!compact ? (
            <div className="mt-2 space-y-1">
              {task.subtasks.map((subtask) => (
                <label
                  key={subtask.id}
                  className="flex items-center gap-2 text-sm text-[color:var(--pd-muted-foreground)]"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => onToggleSubtask(task.id, subtask.id)}
                  />
                  <span className={subtask.completed ? 'line-through' : ''}>{subtask.title}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--pd-border)] pt-3">
        <Button size="sm" icon={<Link2 className="h-4 w-4" />} onClick={onLink}>
          Link
        </Button>
        <Button size="sm" icon={<Edit3 className="h-4 w-4" />} onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  )
}
