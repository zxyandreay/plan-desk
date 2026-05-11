import { Clipboard, ExternalLink, FolderSearch } from 'lucide-react'
import { copyText, openLinkedPath, revealLinkedPath } from '../../lib/fileSystem'
import { useAppStore } from '../../stores/appStore'
import type { ResourceLink } from '../../types/models'
import { Button } from '../ui/Button'

interface ResourceActionsProps {
  resource: ResourceLink
}

export function ResourceActions({ resource }: ResourceActionsProps) {
  const showToast = useAppStore((state) => state.showToast)

  const run = async (action: () => Promise<{ ok: boolean; message: string }>) => {
    const result = await action()
    showToast(result.message, result.ok ? 'success' : 'warning')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        icon={<ExternalLink className="h-4 w-4" />}
        onClick={() => run(() => openLinkedPath(resource.path))}
      >
        Open
      </Button>
      <Button
        size="sm"
        icon={<FolderSearch className="h-4 w-4" />}
        onClick={() => run(() => revealLinkedPath(resource.path))}
      >
        Reveal
      </Button>
      <Button
        size="sm"
        icon={<Clipboard className="h-4 w-4" />}
        onClick={() => run(() => copyText(resource.path))}
      >
        Copy
      </Button>
    </div>
  )
}
