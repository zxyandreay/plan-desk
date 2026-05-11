import { useState } from 'react'
import { milestoneStatuses, milestoneStatusLabels } from '../../types/constants'
import type { Milestone, MilestoneFormValues } from '../../types/models'
import { Button } from '../ui/Button'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface MilestoneFormProps {
  milestone?: Milestone
  onCancel: () => void
  onSubmit: (values: MilestoneFormValues) => void
}

export function MilestoneForm({ milestone, onCancel, onSubmit }: MilestoneFormProps) {
  const [values, setValues] = useState<MilestoneFormValues>({
    title: milestone?.title ?? '',
    description: milestone?.description ?? '',
    status: milestone?.status ?? 'not_started',
    dueDate: milestone?.dueDate ?? '',
  })
  const [error, setError] = useState('')

  const submit = () => {
    if (!values.title.trim()) {
      setError('Milestone title is required.')
      return
    }

    onSubmit({ ...values, title: values.title.trim() })
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Title"
        value={values.title}
        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        placeholder="Design phase"
      />
      <TextAreaField
        label="Description"
        value={values.description}
        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Status"
          value={values.status}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as MilestoneFormValues['status'],
            }))
          }
        >
          {milestoneStatuses.map((status) => (
            <option key={status} value={status}>
              {milestoneStatusLabels[status]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Due date"
          type="date"
          value={values.dueDate}
          onChange={(event) => setValues((current) => ({ ...current, dueDate: event.target.value }))}
        />
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {milestone ? 'Save milestone' : 'Create milestone'}
        </Button>
      </div>
    </div>
  )
}
