import { useState } from 'react'
import { issueSeverities, issueSeverityLabels, issueStatuses, issueStatusLabels } from '../../types/constants'
import type { Issue, IssueFormValues, Task } from '../../types/models'
import { Button } from '../ui/Button'
import { ColorSelector } from '../ui/ColorSelector'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface IssueFormProps {
  issue?: Issue
  tasks: Task[]
  onCancel: () => void
  onSubmit: (values: IssueFormValues) => void
}

export function IssueForm({ issue, tasks, onCancel, onSubmit }: IssueFormProps) {
  const [values, setValues] = useState<IssueFormValues>({
    title: issue?.title ?? '',
    description: issue?.description ?? '',
    severity: issue?.severity ?? 'medium',
    status: issue?.status ?? 'open',
    color: issue?.color ?? 'slate',
    relatedTaskId: issue?.relatedTaskId,
    resolutionNotes: issue?.resolutionNotes ?? '',
  })
  const [error, setError] = useState('')

  const submit = () => {
    if (!values.title.trim()) {
      setError('Issue title is required.')
      return
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      relatedTaskId: values.relatedTaskId || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Title"
        value={values.title}
        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        placeholder="Missing brand assets"
      />
      <TextAreaField
        label="Description"
        value={values.description}
        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Severity"
          value={values.severity}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              severity: event.target.value as IssueFormValues['severity'],
            }))
          }
        >
          {issueSeverities.map((severity) => (
            <option key={severity} value={severity}>
              {issueSeverityLabels[severity]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Status"
          value={values.status}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as IssueFormValues['status'],
            }))
          }
        >
          {issueStatuses.map((status) => (
            <option key={status} value={status}>
              {issueStatusLabels[status]}
            </option>
          ))}
        </SelectField>
      </div>
      <SelectField
        label="Related task"
        value={values.relatedTaskId ?? ''}
        onChange={(event) =>
          setValues((current) => ({ ...current, relatedTaskId: event.target.value || undefined }))
        }
      >
        <option value="">No related task</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </SelectField>
      <TextAreaField
        label="Resolution notes"
        value={values.resolutionNotes}
        onChange={(event) =>
          setValues((current) => ({ ...current, resolutionNotes: event.target.value }))
        }
        placeholder="What resolved this issue?"
      />
      <ColorSelector
        value={values.color}
        onChange={(color) => setValues((current) => ({ ...current, color }))}
        hint="Issue color is for grouping; severity remains separate."
      />
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {issue ? 'Save issue' : 'Create issue'}
        </Button>
      </div>
    </div>
  )
}
