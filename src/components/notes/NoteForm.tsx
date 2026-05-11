import { useState } from 'react'
import type { Note, NoteFormValues } from '../../types/models'
import { Button } from '../ui/Button'
import { TextAreaField, TextField } from '../ui/Field'

interface NoteFormProps {
  note?: Note
  onCancel: () => void
  onSubmit: (values: NoteFormValues) => void
}

export function NoteForm({ note, onCancel, onSubmit }: NoteFormProps) {
  const [values, setValues] = useState<NoteFormValues>({
    title: note?.title ?? '',
    content: note?.content ?? '',
  })
  const [error, setError] = useState('')

  const submit = () => {
    if (!values.title.trim()) {
      setError('Note title is required.')
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
        placeholder="Client meeting notes"
      />
      <TextAreaField
        label="Content"
        value={values.content}
        onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
        rows={10}
        placeholder="Decisions, references, reminders, or project context"
      />
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {note ? 'Save note' : 'Create note'}
        </Button>
      </div>
    </div>
  )
}
