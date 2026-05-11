import type { AppData, ResourceLink } from '../../types/models'
import { EmptyState } from '../ui/EmptyState'
import { ResourceCard } from './ResourceCard'

interface ResourceListProps {
  data: AppData
  resources: ResourceLink[]
  onEdit: (resource: ResourceLink) => void
  onDelete: (resource: ResourceLink) => void
}

export function ResourceList({ data, resources, onEdit, onDelete }: ResourceListProps) {
  if (!resources.length) {
    return (
      <EmptyState
        title="No linked resources"
        message="Add a file or folder link to keep project work connected to the places where the real files live."
      />
    )
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          data={data}
          resource={resource}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
