import { FilePlus2, FolderPlus, RefreshCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { linkedEntityLabels, linkedEntityTypes, resourceTypeLabels } from '../../types/constants'
import type { LinkedEntityType, ResourceFormValues, ResourceLink, ResourceType } from '../../types/models'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import { ResourceForm } from './ResourceForm'
import { ResourceList } from './ResourceList'

interface ResourcesViewProps {
  projectId: string
}

export function ResourcesView({ projectId }: ResourcesViewProps) {
  const data = useAppStore((state) => state.data)
  const createResource = useAppStore((state) => state.createResource)
  const updateResource = useAppStore((state) => state.updateResource)
  const deleteResource = useAppStore((state) => state.deleteResource)
  const refreshResourceHealth = useAppStore((state) => state.refreshResourceHealth)
  const [editingResource, setEditingResource] = useState<ResourceLink | undefined>()
  const [deletingResource, setDeletingResource] = useState<ResourceLink | undefined>()
  const [isResourceModalOpen, setResourceModalOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<ResourceType>('folder')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ResourceType>('all')
  const [entityFilter, setEntityFilter] = useState<'all' | LinkedEntityType>('all')
  const [healthFilter, setHealthFilter] = useState<'all' | 'missing' | 'available' | 'unknown'>('all')
  const [tagFilter, setTagFilter] = useState('')

  const resources = data.resources.filter((resource) => resource.projectId === projectId)
  const allTags = Array.from(new Set(resources.flatMap((resource) => resource.tags))).sort()

  const normalizedQuery = query.trim().toLowerCase()
  const filteredResources = resources.filter((resource) => {
    const matchesText = [resource.label, resource.path, resource.description, resource.tags.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
    const matchesType = typeFilter === 'all' || resource.type === typeFilter
    const matchesEntity = entityFilter === 'all' || resource.linkedEntityType === entityFilter
    const matchesHealth =
      healthFilter === 'all' ||
      (healthFilter === 'missing' && resource.isMissing) ||
      resource.pathHealth === healthFilter
    const matchesTag = !tagFilter || resource.tags.includes(tagFilter)
    return matchesText && matchesType && matchesEntity && matchesHealth && matchesTag
  })

  const openAdd = (type: ResourceType) => {
    setDefaultType(type)
    setEditingResource(undefined)
    setResourceModalOpen(true)
  }

  const submitResource = async (values: ResourceFormValues) => {
    const normalized = { ...values, type: editingResource?.type ?? values.type ?? defaultType }
    if (editingResource) {
      await updateResource(editingResource.id, normalized)
    } else {
      await createResource(projectId, normalized)
    }
    setResourceModalOpen(false)
    setEditingResource(undefined)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Files / Resources</h3>
          <p className="text-sm text-slate-500">
            Link files and folders without moving, scanning, or modifying them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<RefreshCcw className="h-4 w-4" />} onClick={() => void refreshResourceHealth()}>
            Check paths
          </Button>
          <Button icon={<FolderPlus className="h-4 w-4" />} onClick={() => openAdd('folder')}>
            Add folder
          </Button>
          <Button variant="primary" icon={<FilePlus2 className="h-4 w-4" />} onClick={() => openAdd('file')}>
            Add file
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              aria-label="Search resources"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search labels, paths, tags"
              className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm"
            />
          </div>
          <select
            aria-label="Filter resource type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as 'all' | ResourceType)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="all">All types</option>
            <option value="file">{resourceTypeLabels.file}</option>
            <option value="folder">{resourceTypeLabels.folder}</option>
          </select>
          <select
            aria-label="Filter linked section"
            value={entityFilter}
            onChange={(event) => setEntityFilter(event.target.value as 'all' | LinkedEntityType)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="all">All sections</option>
            {linkedEntityTypes.map((type) => (
              <option key={type} value={type}>
                {linkedEntityLabels[type]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter resource health"
            value={healthFilter}
            onChange={(event) =>
              setHealthFilter(event.target.value as 'all' | 'missing' | 'available' | 'unknown')
            }
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="all">All health</option>
            <option value="missing">Missing</option>
            <option value="available">Available</option>
            <option value="unknown">Unchecked</option>
          </select>
        </div>
        {allTags.length ? (
          <div className="mt-3">
            <select
              aria-label="Filter resource tag"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <ResourceList
        data={data}
        resources={filteredResources}
        onEdit={(resource) => {
          setEditingResource(resource)
          setResourceModalOpen(true)
        }}
        onDelete={setDeletingResource}
      />

      <Modal
        title={editingResource ? 'Edit resource link' : 'Add resource link'}
        description="Removing a PlanDesk link never deletes the real file or folder."
        isOpen={isResourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false)
          setEditingResource(undefined)
        }}
      >
        <ResourceForm
          data={data}
          projectId={projectId}
          resource={editingResource}
          onCancel={() => {
            setResourceModalOpen(false)
            setEditingResource(undefined)
          }}
          onSubmit={submitResource}
        />
      </Modal>
      <ConfirmDialog
        title="Remove resource link"
        message="This removes only the PlanDesk reference. The actual file or folder will not be deleted, moved, renamed, or modified."
        confirmLabel="Remove link"
        isOpen={Boolean(deletingResource)}
        onCancel={() => setDeletingResource(undefined)}
        onConfirm={() => {
          if (deletingResource) {
            deleteResource(deletingResource.id)
            setDeletingResource(undefined)
          }
        }}
      />
    </section>
  )
}
