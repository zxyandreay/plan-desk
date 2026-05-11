import { FolderOpen, X } from 'lucide-react'
import { useState } from 'react'
import { chooseFolder } from '../../lib/fileSystem'
import { projectPriorities, projectPriorityLabels, projectStatuses, projectStatusLabels } from '../../types/constants'
import type { Project, ProjectFormValues } from '../../types/models'
import { Button } from '../ui/Button'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface ProjectFormProps {
  project?: Project
  onCancel: () => void
  onSubmit: (values: ProjectFormValues) => void
}

export function ProjectForm({ project, onCancel, onSubmit }: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>({
    name: project?.name ?? '',
    description: project?.description ?? '',
    category: project?.category ?? '',
    goal: project?.goal ?? '',
    status: project?.status ?? 'planning',
    priority: project?.priority ?? 'medium',
    startDate: project?.startDate ?? '',
    dueDate: project?.dueDate ?? '',
    rootFolderPath: project?.rootFolderPath,
  })
  const [error, setError] = useState('')

  const updateValue = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const submit = () => {
    if (!values.name.trim()) {
      setError('Project name is required.')
      return
    }

    if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
      setError('Due date cannot be earlier than the start date.')
      return
    }

    setError('')
    onSubmit({ ...values, name: values.name.trim() })
  }

  const pickFolder = async () => {
    const selected = await chooseFolder()
    if (selected) {
      updateValue('rootFolderPath', selected)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Project name"
          value={values.name}
          onChange={(event) => updateValue('name', event.target.value)}
          placeholder="Client Website Redesign"
          required
        />
        <TextField
          label="Category"
          value={values.category}
          onChange={(event) => updateValue('category', event.target.value)}
          placeholder="Client, study, product, event"
        />
        <SelectField
          label="Status"
          value={values.status}
          onChange={(event) => updateValue('status', event.target.value as ProjectFormValues['status'])}
        >
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              {projectStatusLabels[status]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Priority"
          value={values.priority}
          onChange={(event) => updateValue('priority', event.target.value as ProjectFormValues['priority'])}
        >
          {projectPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {projectPriorityLabels[priority]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Start date"
          type="date"
          value={values.startDate}
          onChange={(event) => updateValue('startDate', event.target.value)}
        />
        <TextField
          label="Due date"
          type="date"
          value={values.dueDate}
          onChange={(event) => updateValue('dueDate', event.target.value)}
        />
      </div>
      <TextAreaField
        label="Description"
        value={values.description}
        onChange={(event) => updateValue('description', event.target.value)}
        placeholder="What is this project about?"
      />
      <TextAreaField
        label="Goal"
        value={values.goal}
        onChange={(event) => updateValue('goal', event.target.value)}
        placeholder="What does finished look like?"
      />
      <div className="pd-muted-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--pd-foreground-strong)]">Project root folder</h3>
            <p className="mt-1 text-xs text-[color:var(--pd-muted-foreground)]">
              PlanDesk stores this path as a reference only.
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<FolderOpen className="h-4 w-4" />} onClick={pickFolder}>
              Choose folder
            </Button>
            {values.rootFolderPath ? (
              <Button
                icon={<X className="h-4 w-4" />}
                variant="ghost"
                onClick={() => updateValue('rootFolderPath', undefined)}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        <TextField
          label="Folder path"
          value={values.rootFolderPath ?? ''}
          onChange={(event) => updateValue('rootFolderPath', event.target.value || undefined)}
          placeholder="C:\\Users\\Andrea\\Documents\\Project"
          hint="In browser preview, paste a path manually. In the desktop app, use the native picker."
        />
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {project ? 'Save project' : 'Create project'}
        </Button>
      </div>
    </div>
  )
}
