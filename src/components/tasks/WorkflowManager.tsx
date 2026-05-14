import { ArrowDown, ArrowUp, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { workflowTemplates } from '../../data/templates'
import { useAppStore } from '../../stores/appStore'
import type { WorkflowColumn, WorkflowColumnFormValues, WorkflowColumnType } from '../../types/models'
import { colorClass } from '../../utils/colors'
import { cn } from '../../lib/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ColorSelector } from '../ui/ColorSelector'
import { SelectField, TextField } from '../ui/Field'

interface WorkflowManagerProps {
  projectId: string
  onClose: () => void
}

const columnTypes: WorkflowColumnType[] = ['todo', 'active', 'review', 'blocked', 'done', 'custom']

const columnTypeLabels: Record<WorkflowColumnType, string> = {
  todo: 'To do',
  active: 'Active',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
  custom: 'Custom',
}

export function WorkflowManager({ projectId, onClose }: WorkflowManagerProps) {
  const data = useAppStore((state) => state.data)
  const createWorkflowColumn = useAppStore((state) => state.createWorkflowColumn)
  const updateWorkflowColumn = useAppStore((state) => state.updateWorkflowColumn)
  const moveWorkflowColumn = useAppStore((state) => state.moveWorkflowColumn)
  const deleteWorkflowColumn = useAppStore((state) => state.deleteWorkflowColumn)
  const applyWorkflowTemplate = useAppStore((state) => state.applyWorkflowTemplate)
  const showToast = useAppStore((state) => state.showToast)
  const [newColumn, setNewColumn] = useState<WorkflowColumnFormValues>({
    name: '',
    color: 'blue',
    type: 'custom',
    isCompleted: false,
  })
  const [deleteTargets, setDeleteTargets] = useState<Record<string, string>>({})
  const [templateId, setTemplateId] = useState('standard')

  const columns = data.workflowColumns
    .filter((column) => column.projectId === projectId)
    .sort((a, b) => a.order - b.order)
  const tasks = data.tasks.filter((task) => task.projectId === projectId)

  const saveColumn = (column: WorkflowColumn, values: WorkflowColumnFormValues) => {
    if (!values.name.trim()) {
      showToast('Column name is required.', 'warning')
      return
    }
    updateWorkflowColumn(column.id, { ...values, name: values.name.trim() })
  }

  const addColumn = () => {
    if (!newColumn.name.trim()) {
      showToast('Column name is required.', 'warning')
      return
    }
    createWorkflowColumn(projectId, { ...newColumn, name: newColumn.name.trim() })
    setNewColumn({ name: '', color: 'blue', type: 'custom', isCompleted: false })
  }

  const applyTemplate = () => {
    const confirmed = window.confirm(
      'Apply this workflow template? Existing tasks will be moved into the closest matching new columns.',
    )
    if (!confirmed) return
    applyWorkflowTemplate(projectId, templateId)
  }

  return (
    <div className="space-y-5">
      <div className="pd-muted-panel p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <SelectField
            label="Workflow template"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            hint="Templates can quickly reshape this project's columns."
          >
            {workflowTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </SelectField>
          <div className="flex items-end">
            <Button onClick={applyTemplate}>Apply template</Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {columns.map((column, index) => {
          const taskCount = tasks.filter((task) => task.columnId === column.id).length
          const moveTarget = deleteTargets[column.id] ?? columns.find((item) => item.id !== column.id)?.id
          return (
            <WorkflowColumnRow
              key={column.id}
              column={column}
              index={index}
              total={columns.length}
              taskCount={taskCount}
              moveTarget={moveTarget}
              targetOptions={columns.filter((item) => item.id !== column.id)}
              onMove={(direction) => moveWorkflowColumn(column.id, direction)}
              onSave={(values) => saveColumn(column, values)}
              onTargetChange={(value) =>
                setDeleteTargets((current) => ({ ...current, [column.id]: value }))
              }
              onDelete={() => deleteWorkflowColumn(column.id, moveTarget)}
            />
          )
        })}
      </div>

      <div className="pd-card p-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <TextField
            label="New column"
            value={newColumn.name}
            onChange={(event) => setNewColumn((current) => ({ ...current, name: event.target.value }))}
            placeholder="Waiting on vendor"
          />
          <SelectField
            label="Type"
            value={newColumn.type}
            onChange={(event) =>
              setNewColumn((current) => ({
                ...current,
                type: event.target.value as WorkflowColumnType,
                isCompleted: event.target.value === 'done' ? true : current.isCompleted,
              }))
            }
          >
            {columnTypes.map((type) => (
              <option key={type} value={type}>
                {columnTypeLabels[type]}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="mt-3">
          <ColorSelector
            value={newColumn.color}
            onChange={(color) => setNewColumn((current) => ({ ...current, color }))}
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
          <input
            type="checkbox"
            checked={newColumn.isCompleted}
            onChange={(event) =>
              setNewColumn((current) => ({
                ...current,
                isCompleted: event.target.checked,
                type: event.target.checked ? 'done' : current.type,
              }))
            }
          />
          Count tasks in this column as completed
        </label>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={addColumn}>
            Add column
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

function WorkflowColumnRow({
  column,
  index,
  total,
  taskCount,
  moveTarget,
  targetOptions,
  onMove,
  onSave,
  onTargetChange,
  onDelete,
}: {
  column: WorkflowColumn
  index: number
  total: number
  taskCount: number
  moveTarget?: string
  targetOptions: WorkflowColumn[]
  onMove: (direction: -1 | 1) => void
  onSave: (values: WorkflowColumnFormValues) => void
  onTargetChange: (value: string) => void
  onDelete: () => void
}) {
  const [values, setValues] = useState<WorkflowColumnFormValues>({
    name: column.name,
    color: column.color ?? 'slate',
    type: column.type,
    isCompleted: column.isCompleted,
  })

  return (
    <div className={cn('pd-card pd-color-card p-4', colorClass(values.color))}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="pd-color-dot mt-2" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">{column.name}</h4>
              {column.isCompleted ? (
                <Badge tone="green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </Badge>
              ) : null}
              <Badge tone={column.type === 'blocked' ? 'red' : column.type === 'done' ? 'green' : 'slate'}>
                {columnTypeLabels[column.type]}
              </Badge>
              <Badge tone="blue">{taskCount} tasks</Badge>
            </div>
            <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
              Column {index + 1} of {total}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Move ${column.name} left`}
            disabled={index === 0}
            icon={<ArrowUp className="h-4 w-4" />}
            onClick={() => onMove(-1)}
          />
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Move ${column.name} right`}
            disabled={index === total - 1}
            icon={<ArrowDown className="h-4 w-4" />}
            onClick={() => onMove(1)}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <TextField
          label="Name"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        <SelectField
          label="Type"
          value={values.type}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              type: event.target.value as WorkflowColumnType,
              isCompleted: event.target.value === 'done' ? true : current.isCompleted,
            }))
          }
        >
          {columnTypes.map((type) => (
            <option key={type} value={type}>
              {columnTypeLabels[type]}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="mt-3">
        <ColorSelector
          value={values.color}
          onChange={(color) => setValues((current) => ({ ...current, color }))}
        />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
        <input
          type="checkbox"
          checked={values.isCompleted}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              isCompleted: event.target.checked,
              type: event.target.checked ? 'done' : current.type,
            }))
          }
        />
        Count tasks in this column as completed
      </label>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[color:var(--pd-border)] pt-3">
        {taskCount ? (
          <label className="min-w-52 flex-1 space-y-1.5 text-sm">
            <span className="font-medium text-[color:var(--pd-foreground)]">Move tasks to</span>
            <select
              className="pd-input h-9 w-full px-3 text-sm"
              value={moveTarget ?? ''}
              onChange={(event) => onTargetChange(event.target.value)}
            >
              {targetOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Empty columns can be removed without moving tasks.
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={() => onSave(values)}>Save</Button>
          <Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
