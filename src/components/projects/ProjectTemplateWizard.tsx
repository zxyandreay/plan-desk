import { CheckCircle2, FolderTree, LayoutTemplate, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { folderTemplates, getFolderTemplate, getProjectTemplate, projectTemplates, workflowTemplates } from '../../data/templates'
import {
  chooseFolder,
  createDirectoriesFromTemplate,
  isTauriRuntime,
  type FolderCreateResultItem,
} from '../../lib/fileSystem'
import { useAppStore } from '../../stores/appStore'
import { projectPriorities, projectPriorityLabels, projectStatuses, projectStatusLabels } from '../../types/constants'
import type { FolderTemplateItem, ProjectFormValues, ResourceFormValues } from '../../types/models'
import { colorClass } from '../../utils/colors'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ColorSelector } from '../ui/ColorSelector'
import { SelectField, TextAreaField, TextField } from '../ui/Field'

interface ProjectTemplateWizardProps {
  onCancel: () => void
  onCreated: () => void
}

export function ProjectTemplateWizard({ onCancel, onCreated }: ProjectTemplateWizardProps) {
  const createProjectFromTemplate = useAppStore((state) => state.createProjectFromTemplate)
  const createResource = useAppStore((state) => state.createResource)
  const showToast = useAppStore((state) => state.showToast)
  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState('blank')
  const template = getProjectTemplate(templateId)
  const [workflowTemplateId, setWorkflowTemplateId] = useState(template.workflowTemplateId ?? 'standard')
  const [folderTemplateId, setFolderTemplateId] = useState(template.folderTemplateId ?? 'basic-project')
  const [includeTasks, setIncludeTasks] = useState(true)
  const [includeIssues, setIncludeIssues] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [applyWorkflow, setApplyWorkflow] = useState(true)
  const [createFolders, setCreateFolders] = useState(false)
  const [isCreating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState<ProjectFormValues>({
    name: 'Untitled Project',
    description: '',
    category: template.category,
    goal: template.defaultGoal ?? '',
    status: 'planning',
    priority: 'medium',
    color: template.color ?? 'slate',
    startDate: '',
    dueDate: '',
    rootFolderPath: '',
  })

  const folderTemplate = getFolderTemplate(folderTemplateId)
  const selectedWorkflowTemplate = workflowTemplates.find((workflow) => workflow.id === workflowTemplateId)
  const canCreateFolders = isTauriRuntime()

  const selectedTemplate = useMemo(() => getProjectTemplate(templateId), [templateId])

  const selectTemplate = (nextTemplateId: string) => {
    const nextTemplate = getProjectTemplate(nextTemplateId)
    setTemplateId(nextTemplateId)
    setWorkflowTemplateId(nextTemplate.workflowTemplateId ?? 'standard')
    setFolderTemplateId(nextTemplate.folderTemplateId ?? 'basic-project')
    setValues((current) => ({
      ...current,
      name: nextTemplate.id === 'blank' ? current.name : nextTemplate.name,
      category: nextTemplate.category,
      goal: nextTemplate.defaultGoal ?? '',
      color: nextTemplate.color ?? current.color,
    }))
  }

  const updateValue = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const chooseRootFolder = async () => {
    const folder = await chooseFolder()
    if (folder) {
      updateValue('rootFolderPath', folder)
    }
  }

  const validate = () => {
    if (!values.name.trim()) return 'Project name is required.'
    if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
      return 'Due date cannot be earlier than start date.'
    }
    if (createFolders && !values.rootFolderPath?.trim()) {
      return 'Choose a root folder before creating a folder structure.'
    }
    if (createFolders && !canCreateFolders) {
      return 'Folder templates can create folders only in the desktop app. Browser preview can still create the project without folders.'
    }
    return ''
  }

  const createFolderResources = (
    results: FolderCreateResultItem[],
    folders: FolderTemplateItem[],
    milestoneIdsByTemplateId: Record<string, string>,
  ): ResourceFormValues[] =>
    results
      .filter((result) => result.status === 'created' || result.status === 'existing')
      .map((result) => {
        const folder = folders.find((item) => item.id === result.id)
        const milestoneId = folder?.milestoneTemplateId
          ? milestoneIdsByTemplateId[folder.milestoneTemplateId]
          : undefined
        return {
          linkedEntityType: milestoneId ? 'milestone' : 'project',
          linkedEntityId: milestoneId,
          label: folder?.name ?? result.name,
          type: 'folder',
          path: result.path,
          description:
            folder?.description ??
            `Folder template item from ${folderTemplate.name}. Existing folders are linked without being modified.`,
          color: folder?.color ?? selectedTemplate.color ?? 'slate',
          tags: ['folder-template'],
        }
      })

  const submit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setCreating(true)
    setError('')

    let folderResults: FolderCreateResultItem[] = []
    if (createFolders && values.rootFolderPath) {
      const result = await createDirectoriesFromTemplate(values.rootFolderPath, folderTemplate.folders)
      if (!result.results.length && !result.ok) {
        setCreating(false)
        setError(result.message)
        return
      }
      folderResults = result.results
      if (!result.ok) {
        showToast(result.message, 'warning')
      }
    }

    const created = createProjectFromTemplate({
      templateId,
      workflowTemplateId,
      applyWorkflow,
      includeTasks,
      includeIssues,
      includeNotes,
      values: {
        ...values,
        name: values.name.trim(),
        rootFolderPath: values.rootFolderPath?.trim() || undefined,
      },
    })

    const resources = createFolderResources(
      folderResults,
      folderTemplate.folders,
      created.milestoneIdsByTemplateId,
    )

    for (const resource of resources) {
      await createResource(created.projectId, resource)
    }

    if (resources.length) {
      showToast(`${resources.length} folder template links added. Existing files were not modified.`, 'success')
    }

    setCreating(false)
    onCreated()
  }

  return (
    <div className="space-y-5">
      <div className="pd-muted-panel flex flex-wrap items-center gap-2 p-2">
        {['Template', 'Basics', 'Options', 'Preview'].map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={cn('pd-segment', step === index ? 'pd-segment-active' : '')}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="pd-section-title">Choose a project template</h3>
            <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
              Templates can generate milestones, tasks, notes, workflows, and optional folder structures.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {projectTemplates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTemplate(item.id)}
                className={cn(
                  'pd-card pd-card-interactive pd-color-card p-4 text-left',
                  colorClass(item.color),
                  templateId === item.id ? 'border-[color:var(--pd-primary)] ring-2 ring-[color:var(--pd-focus)]' : '',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="pd-color-dot mt-1.5" aria-hidden="true" />
                  <div>
                    <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">{item.name}</h4>
                    <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="blue">{item.category}</Badge>
                      <Badge tone="slate">{item.milestones.length} milestones</Badge>
                      <Badge tone="slate">{item.tasks.length} tasks</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Project name"
              value={values.name}
              onChange={(event) => updateValue('name', event.target.value)}
            />
            <TextField
              label="Category"
              value={values.category}
              onChange={(event) => updateValue('category', event.target.value)}
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
          />
          <TextAreaField
            label="Goal"
            value={values.goal}
            onChange={(event) => updateValue('goal', event.target.value)}
          />
          <ColorSelector value={values.color} onChange={(color) => updateValue('color', color)} />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="pd-card p-4">
            <div className="flex items-start gap-3">
              <LayoutTemplate className="mt-1 h-5 w-5 text-[color:var(--pd-primary)]" />
              <div className="flex-1 space-y-3">
                <SelectField
                  label="Workflow"
                  value={workflowTemplateId}
                  onChange={(event) => setWorkflowTemplateId(event.target.value)}
                  hint="This controls the task board columns for the project."
                >
                  {workflowTemplates.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </SelectField>
                <label className="flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
                  <input
                    type="checkbox"
                    checked={applyWorkflow}
                    onChange={(event) => setApplyWorkflow(event.target.checked)}
                  />
                  Apply this workflow to the project
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkflowTemplate?.columns.map((column) => (
                    <span key={column.id} className={`pd-color-pill ${colorClass(column.color)}`}>
                      <span className="pd-color-dot" aria-hidden="true" />
                      {column.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pd-card p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-[color:var(--pd-primary)]" />
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
                  <input type="checkbox" checked={includeTasks} onChange={(event) => setIncludeTasks(event.target.checked)} />
                  Include template tasks
                </label>
                <label className="flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
                  <input type="checkbox" checked={includeIssues} onChange={(event) => setIncludeIssues(event.target.checked)} />
                  Include template issues when available
                </label>
                <label className="flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
                  <input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} />
                  Include template notes when available
                </label>
              </div>
            </div>
          </div>

          <div className="pd-card p-4">
            <div className="flex items-start gap-3">
              <FolderTree className="mt-1 h-5 w-5 text-[color:var(--pd-primary)]" />
              <div className="flex-1 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--pd-foreground)]">
                  <input
                    type="checkbox"
                    checked={createFolders}
                    onChange={(event) => setCreateFolders(event.target.checked)}
                  />
                  Create project folder structure
                </label>
                <p className="text-sm text-[color:var(--pd-muted-foreground)]">
                  PlanDesk creates folders only after confirmation. It never deletes, moves, uploads, or overwrites files.
                </p>
                <SelectField
                  label="Folder template"
                  value={folderTemplateId}
                  onChange={(event) => setFolderTemplateId(event.target.value)}
                >
                  {folderTemplates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </SelectField>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <TextField
                    label="Root folder"
                    value={values.rootFolderPath ?? ''}
                    onChange={(event) => updateValue('rootFolderPath', event.target.value)}
                    placeholder="Choose or paste a folder path"
                  />
                  <div className="flex items-end">
                    <Button onClick={chooseRootFolder}>Choose folder</Button>
                  </div>
                </div>
                {!canCreateFolders ? (
                  <p className="rounded-md border border-[color:var(--pd-warning-border)] bg-[color:var(--pd-warning-bg)] px-3 py-2 text-sm text-[color:var(--pd-warning-text)]">
                    Folder creation is desktop-only. You can still create the project now, then run folder templates inside the native app.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <PreviewCard title="Project">
            <p className="font-semibold text-[color:var(--pd-foreground-strong)]">{values.name}</p>
            <p className="text-sm text-[color:var(--pd-muted-foreground)]">{values.category || 'Uncategorized'}</p>
            <p className="mt-2 text-sm text-[color:var(--pd-muted-foreground)]">{values.goal || 'No goal yet.'}</p>
          </PreviewCard>
          <PreviewCard title="Milestones">
            <PreviewList items={selectedTemplate.milestones.map((item) => item.title)} empty="No template milestones." />
          </PreviewCard>
          <PreviewCard title="Tasks">
            <PreviewList
              items={includeTasks ? selectedTemplate.tasks.map((item) => item.title) : []}
              empty="Template tasks are turned off."
            />
          </PreviewCard>
          <PreviewCard title="Folders">
            <PreviewList
              items={createFolders ? folderTemplate.folders.map((item) => item.path) : []}
              empty="Folder creation is turned off."
            />
          </PreviewCard>
        </div>
      ) : null}

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap justify-between gap-2 border-t border-[color:var(--pd-border)] pt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <div className="flex gap-2">
          <Button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Back
          </Button>
          {step < 3 ? (
            <Button variant="primary" onClick={() => setStep((current) => Math.min(3, current + 1))}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<CheckCircle2 className="h-4 w-4" />}
              disabled={isCreating}
              onClick={submit}
            >
              {isCreating ? 'Creating...' : 'Create project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pd-card p-4">
      <h4 className="mb-3 text-sm font-semibold text-[color:var(--pd-foreground-strong)]">{title}</h4>
      {children}
    </div>
  )
}

function PreviewList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) {
    return <p className="text-sm text-[color:var(--pd-muted-foreground)]">{empty}</p>
  }

  return (
    <ul className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <li key={item} className="flex items-center gap-2 text-sm text-[color:var(--pd-foreground)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--pd-primary)]" aria-hidden="true" />
          {item}
        </li>
      ))}
      {items.length > 8 ? (
        <li className="text-sm text-[color:var(--pd-muted-foreground)]">+{items.length - 8} more</li>
      ) : null}
    </ul>
  )
}
