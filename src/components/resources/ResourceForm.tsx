import { FilePlus2, FolderOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { choosePathForType } from '../../lib/fileSystem'
import {
  linkedEntityLabels,
  linkedEntityTypes,
  resourceTypeLabels,
  resourceTypes,
} from '../../types/constants'
import type { AppData, LinkedEntityType, ResourceFormValues, ResourceLink, ResourceType } from '../../types/models'
import { linkedEntityName } from '../../utils/metrics'
import { joinTags, splitTags } from '../../utils/text'
import { Button } from '../ui/Button'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface ResourceFormProps {
  data: AppData
  projectId: string
  resource?: ResourceLink
  defaultEntityType?: LinkedEntityType
  defaultEntityId?: string
  onCancel: () => void
  onSubmit: (values: ResourceFormValues) => void
}

export function ResourceForm({
  data,
  projectId,
  resource,
  defaultEntityType = 'project',
  defaultEntityId,
  onCancel,
  onSubmit,
}: ResourceFormProps) {
  const [values, setValues] = useState<ResourceFormValues>({
    linkedEntityType: resource?.linkedEntityType ?? defaultEntityType,
    linkedEntityId: resource?.linkedEntityId ?? defaultEntityId,
    label: resource?.label ?? '',
    type: resource?.type ?? 'folder',
    path: resource?.path ?? '',
    description: resource?.description ?? '',
    tags: resource?.tags ?? [],
  })
  const [tagText, setTagText] = useState(joinTags(values.tags))
  const [error, setError] = useState('')

  const entityOptions = useMemo(() => {
    const project = data.projects.find((item) => item.id === projectId)
    const common = [{ id: '', label: project?.name ?? 'Project' }]
    const lists: Record<Exclude<LinkedEntityType, 'project'>, { id: string; label: string }[]> = {
      milestone: data.milestones
        .filter((item) => item.projectId === projectId)
        .map((item) => ({ id: item.id, label: item.title })),
      task: data.tasks
        .filter((item) => item.projectId === projectId)
        .map((item) => ({ id: item.id, label: item.title })),
      issue: data.issues
        .filter((item) => item.projectId === projectId)
        .map((item) => ({ id: item.id, label: item.title })),
      note: data.notes
        .filter((item) => item.projectId === projectId)
        .map((item) => ({ id: item.id, label: item.title })),
    }

    return values.linkedEntityType === 'project' ? common : lists[values.linkedEntityType]
  }, [data, projectId, values.linkedEntityType])

  const updateValue = <K extends keyof ResourceFormValues>(key: K, value: ResourceFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const pickPath = async (type: ResourceType) => {
    const selected = await choosePathForType(type)
    if (selected) {
      setValues((current) => ({
        ...current,
        type,
        path: selected,
        label: current.label || selected.split(/[\\/]/).filter(Boolean).at(-1) || selected,
      }))
    }
  }

  const submit = () => {
    if (!values.label.trim()) {
      setError('Resource label is required.')
      return
    }

    if (!values.path.trim()) {
      setError('A file or folder path is required.')
      return
    }

    if (values.linkedEntityType !== 'project' && !values.linkedEntityId) {
      setError(`Choose a ${linkedEntityLabels[values.linkedEntityType].toLowerCase()} to link this resource to.`)
      return
    }

    onSubmit({
      ...values,
      label: values.label.trim(),
      path: values.path.trim(),
      linkedEntityId: values.linkedEntityType === 'project' ? undefined : values.linkedEntityId,
      description: values.description?.trim() || undefined,
      tags: splitTags(tagText),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Button icon={<FolderOpen className="h-4 w-4" />} onClick={() => pickPath('folder')}>
          Choose folder
        </Button>
        <Button icon={<FilePlus2 className="h-4 w-4" />} onClick={() => pickPath('file')}>
          Choose file
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Label"
          value={values.label}
          onChange={(event) => updateValue('label', event.target.value)}
          placeholder="Design files"
        />
        <SelectField
          label="Type"
          value={values.type}
          onChange={(event) => updateValue('type', event.target.value as ResourceType)}
        >
          {resourceTypes.map((type) => (
            <option key={type} value={type}>
              {resourceTypeLabels[type]}
            </option>
          ))}
        </SelectField>
      </div>
      <TextField
        label="Path"
        value={values.path}
        onChange={(event) => updateValue('path', event.target.value)}
        placeholder="C:\\Users\\Andrea\\Documents\\Project\\Design"
        hint="PlanDesk stores this path only as a reference."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Linked section"
          value={values.linkedEntityType}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              linkedEntityType: event.target.value as LinkedEntityType,
              linkedEntityId: undefined,
            }))
          }
        >
          {linkedEntityTypes.map((type) => (
            <option key={type} value={type}>
              {linkedEntityLabels[type]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Linked item"
          value={values.linkedEntityId ?? ''}
          disabled={values.linkedEntityType === 'project'}
          onChange={(event) => updateValue('linkedEntityId', event.target.value || undefined)}
        >
          {values.linkedEntityType === 'project' ? (
            <option value="">{linkedEntityName(data, { ...values, projectId })}</option>
          ) : (
            <>
              <option value="">Choose item</option>
              {entityOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </>
          )}
        </SelectField>
      </div>
      <TextAreaField
        label="Description"
        value={values.description ?? ''}
        onChange={(event) => updateValue('description', event.target.value)}
      />
      <TextField
        label="Tags"
        value={tagText}
        onChange={(event) => setTagText(event.target.value)}
        placeholder="assets, design"
        hint="Separate tags with commas."
      />
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {resource ? 'Save resource' : 'Add resource'}
        </Button>
      </div>
    </div>
  )
}
