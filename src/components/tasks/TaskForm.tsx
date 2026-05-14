import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { statusFromWorkflowColumn } from '../../data/templates'
import { taskPriorities, taskPriorityLabels } from '../../types/constants'
import type { Milestone, Subtask, Task, TaskFormValues, WorkflowColumn } from '../../types/models'
import { createId } from '../../utils/id'
import { joinTags, splitTags } from '../../utils/text'
import { Button } from '../ui/Button'
import { ColorSelector } from '../ui/ColorSelector'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface TaskFormProps {
  task?: Task
  milestones: Milestone[]
  workflowColumns: WorkflowColumn[]
  onCancel: () => void
  onSubmit: (values: TaskFormValues) => void
}

export function TaskForm({ task, milestones, workflowColumns, onCancel, onSubmit }: TaskFormProps) {
  const initialColumn =
    workflowColumns.find((column) => column.id === task?.columnId) ?? workflowColumns[0]
  const [values, setValues] = useState<TaskFormValues>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? statusFromWorkflowColumn(initialColumn),
    columnId: task?.columnId ?? initialColumn?.id,
    priority: task?.priority ?? 'medium',
    color: task?.color ?? 'slate',
    dueDate: task?.dueDate ?? '',
    milestoneId: task?.milestoneId,
    assignee: task?.assignee ?? '',
    tags: task?.tags ?? [],
    subtasks: task?.subtasks ?? [],
  })
  const [tagText, setTagText] = useState(joinTags(values.tags))
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [error, setError] = useState('')

  const updateValue = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const addSubtask = () => {
    if (!subtaskTitle.trim()) {
      return
    }

    const subtask: Subtask = {
      id: createId('subtask'),
      title: subtaskTitle.trim(),
      completed: false,
    }
    updateValue('subtasks', [...values.subtasks, subtask])
    setSubtaskTitle('')
  }

  const submit = () => {
    if (!values.title.trim()) {
      setError('Task title is required.')
      return
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      assignee: values.assignee?.trim() || undefined,
      milestoneId: values.milestoneId || undefined,
      tags: splitTags(tagText),
    })
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Title"
        value={values.title}
        onChange={(event) => updateValue('title', event.target.value)}
        placeholder="Finalize homepage mockup"
      />
      <TextAreaField
        label="Description"
        value={values.description}
        onChange={(event) => updateValue('description', event.target.value)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Workflow column"
          value={values.columnId ?? ''}
          onChange={(event) => {
            const column = workflowColumns.find((item) => item.id === event.target.value)
            setValues((current) => ({
              ...current,
              columnId: column?.id,
              status: statusFromWorkflowColumn(column),
            }))
          }}
        >
          {workflowColumns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Priority"
          value={values.priority}
          onChange={(event) => updateValue('priority', event.target.value as TaskFormValues['priority'])}
        >
          {taskPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {taskPriorityLabels[priority]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Milestone"
          value={values.milestoneId ?? ''}
          onChange={(event) => updateValue('milestoneId', event.target.value || undefined)}
        >
          <option value="">No milestone</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Due date"
          type="date"
          value={values.dueDate}
          onChange={(event) => updateValue('dueDate', event.target.value)}
        />
        <TextField
          label="Assignee"
          value={values.assignee ?? ''}
          onChange={(event) => updateValue('assignee', event.target.value)}
          placeholder="Optional"
        />
        <TextField
          label="Tags"
          value={tagText}
          onChange={(event) => setTagText(event.target.value)}
          placeholder="design, client"
          hint="Separate tags with commas."
        />
      </div>
      <ColorSelector
        value={values.color}
        onChange={(color) => updateValue('color', color)}
        hint="Adds a subtle strip and dot to this task in board and list views."
      />
      <div className="pd-muted-panel p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField
              label="Add subtask"
              value={subtaskTitle}
              onChange={(event) => setSubtaskTitle(event.target.value)}
              placeholder="Check mobile layout"
            />
          </div>
          <Button icon={<Plus className="h-4 w-4" />} onClick={addSubtask}>
            Add
          </Button>
        </div>
        {values.subtasks.length ? (
          <div className="mt-3 space-y-2">
            {values.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="pd-row flex items-center justify-between gap-2 px-3 py-2"
              >
                <label className="flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() =>
                      updateValue(
                        'subtasks',
                        values.subtasks.map((item) =>
                          item.id === subtask.id ? { ...item, completed: !item.completed } : item,
                        ),
                      )
                    }
                  />
                  {subtask.title}
                </label>
                <Button
                  aria-label={`Remove ${subtask.title}`}
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() =>
                    updateValue(
                      'subtasks',
                      values.subtasks.filter((item) => item.id !== subtask.id),
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {task ? 'Save task' : 'Create task'}
        </Button>
      </div>
    </div>
  )
}
