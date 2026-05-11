import { Edit3, File, Folder, Trash2 } from 'lucide-react'
import { linkedEntityLabels, resourceTypeLabels } from '../../types/constants'
import type { AppData, ResourceLink } from '../../types/models'
import { formatDate } from '../../utils/date'
import { linkedEntityName } from '../../utils/metrics'
import { compactPath } from '../../utils/text'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ResourceActions } from './ResourceActions'

interface ResourceCardProps {
  data: AppData
  resource: ResourceLink
  onEdit: (resource: ResourceLink) => void
  onDelete: (resource: ResourceLink) => void
}

export function ResourceCard({ data, resource, onEdit, onDelete }: ResourceCardProps) {
  const Icon = resource.type === 'folder' ? Folder : File

  return (
    <article className={`pd-card p-4 ${resource.isMissing ? 'pd-danger-row' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--pd-muted)] text-[color:var(--pd-accent-foreground)]">
              <Icon className="h-5 w-5" />
            </span>
            <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">{resource.label}</h4>
            {resource.isMissing ? <Badge tone="red">Missing</Badge> : null}
            {resource.pathHealth === 'unknown' ? <Badge tone="amber">Unchecked</Badge> : null}
          </div>
          <p className="pd-path mt-2 max-w-full text-sm" title={resource.path}>
            {compactPath(resource.path, 86)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            aria-label={`Edit ${resource.label}`}
            size="sm"
            icon={<Edit3 className="h-4 w-4" />}
            onClick={() => onEdit(resource)}
          >
            Edit
          </Button>
          <Button
            aria-label={`Remove ${resource.label}`}
            size="sm"
            variant="ghost"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => onDelete(resource)}
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{resourceTypeLabels[resource.type]}</Badge>
        <Badge tone="blue">{linkedEntityLabels[resource.linkedEntityType]}</Badge>
        <Badge tone="slate">{linkedEntityName(data, resource)}</Badge>
        {resource.tags.map((tag) => (
          <Badge key={tag} tone="purple">
            {tag}
          </Badge>
        ))}
      </div>
      {resource.description ? (
        <p className="mt-3 text-sm leading-6 text-[color:var(--pd-muted-foreground)]">{resource.description}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--pd-border)] pt-3">
        <p className="text-xs text-[color:var(--pd-muted-foreground)]">
          Created {formatDate(resource.createdAt)} · Updated {formatDate(resource.updatedAt)}
        </p>
        <ResourceActions resource={resource} />
      </div>
    </article>
  )
}
