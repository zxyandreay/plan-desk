import { FolderTree } from 'lucide-react'
import { useState } from 'react'
import { folderTemplates, getFolderTemplate } from '../../data/templates'
import { chooseFolder, createDirectoriesFromTemplate, isTauriRuntime } from '../../lib/fileSystem'
import { useAppStore } from '../../stores/appStore'
import { colorClass } from '../../utils/colors'
import { Button } from '../ui/Button'
import { SelectField, TextField } from '../ui/Field'

interface FolderTemplateDialogProps {
  projectId: string
  onClose: () => void
}

export function FolderTemplateDialog({ projectId, onClose }: FolderTemplateDialogProps) {
  const data = useAppStore((state) => state.data)
  const createResource = useAppStore((state) => state.createResource)
  const showToast = useAppStore((state) => state.showToast)
  const project = data.projects.find((item) => item.id === projectId)
  const [templateId, setTemplateId] = useState(project?.category.toLowerCase().includes('website') ? 'client-website' : 'basic-project')
  const [rootPath, setRootPath] = useState(project?.rootFolderPath ?? '')
  const [isCreating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const template = getFolderTemplate(templateId)
  const canCreateFolders = isTauriRuntime()

  const chooseRoot = async () => {
    const folder = await chooseFolder()
    if (folder) {
      setRootPath(folder)
    }
  }

  const createFolders = async () => {
    if (!rootPath.trim()) {
      setMessage('Choose a root folder before applying a folder template.')
      return
    }

    if (!canCreateFolders) {
      setMessage('Folder creation is available in the desktop app. Browser preview mode can only show the structure.')
      return
    }

    setCreating(true)
    setMessage('')
    const result = await createDirectoriesFromTemplate(rootPath, template.folders)
    const linkable = result.results.filter((item) => item.status === 'created' || item.status === 'existing')

    for (const item of linkable) {
      const folder = template.folders.find((candidate) => candidate.id === item.id)
      await createResource(projectId, {
        linkedEntityType: 'project',
        label: folder?.name ?? item.name,
        type: 'folder',
        path: item.path,
        description:
          folder?.description ??
          `Folder template item from ${template.name}. Existing folders are linked without being modified.`,
        color: folder?.color ?? project?.color ?? 'slate',
        tags: ['folder-template'],
      })
    }

    setCreating(false)
    const failed = result.results.filter((item) => item.status === 'failed').length
    if (linkable.length) {
      showToast(`${linkable.length} folder links added. No files were overwritten.`, failed ? 'warning' : 'success')
    }
    setMessage(result.message)
  }

  return (
    <div className="space-y-4">
      <div className="pd-muted-panel p-4">
        <div className="flex items-start gap-3">
          <FolderTree className="mt-1 h-5 w-5 text-[color:var(--pd-primary)]" />
          <div>
            <h3 className="font-semibold text-[color:var(--pd-foreground-strong)]">Create local folders safely</h3>
            <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
              Folder templates only create missing folders under the chosen root and link them as references.
              PlanDesk never deletes, moves, renames, uploads, or overwrites your files.
            </p>
          </div>
        </div>
      </div>

      <SelectField
        label="Folder template"
        value={templateId}
        onChange={(event) => setTemplateId(event.target.value)}
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
          value={rootPath}
          onChange={(event) => setRootPath(event.target.value)}
          placeholder="Choose or paste a project root folder"
        />
        <div className="flex items-end">
          <Button onClick={chooseRoot}>Choose folder</Button>
        </div>
      </div>

      <div className="pd-card p-4">
        <h4 className="mb-3 text-sm font-semibold text-[color:var(--pd-foreground-strong)]">
          Preview: {template.name}
        </h4>
        <div className="grid gap-2 md:grid-cols-2">
          {template.folders.map((folder) => (
            <div key={folder.id} className={`pd-row pd-color-card px-3 py-2 ${colorClass(folder.color)}`}>
              <div className="flex items-center gap-2">
                <span className="pd-color-dot" aria-hidden="true" />
                <span className="text-sm font-medium text-[color:var(--pd-foreground)]">{folder.path}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!canCreateFolders ? (
        <p className="rounded-md border border-[color:var(--pd-warning-border)] bg-[color:var(--pd-warning-bg)] px-3 py-2 text-sm text-[color:var(--pd-warning-text)]">
          Desktop-only action: run PlanDesk as the Windows app to create folders. The browser preview cannot modify local folders.
        </p>
      ) : null}
      {message ? <p className="text-sm text-[color:var(--pd-muted-foreground)]">{message}</p> : null}

      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Close</Button>
        <Button variant="primary" disabled={isCreating} onClick={createFolders}>
          {isCreating ? 'Creating...' : 'Create folders and link'}
        </Button>
      </div>
    </div>
  )
}
