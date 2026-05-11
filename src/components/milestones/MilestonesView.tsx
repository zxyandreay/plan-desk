import { Edit3, Link2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { milestoneStatusLabels } from '../../types/constants'
import type { Milestone, MilestoneFormValues, ResourceFormValues } from '../../types/models'
import { formatDate } from '../../utils/date'
import { calculateMilestoneProgress, resourceCountForEntity } from '../../utils/metrics'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { ResourceForm } from '../resources/ResourceForm'
import { MilestoneForm } from './MilestoneForm'

interface MilestonesViewProps {
  projectId: string
}

export function MilestonesView({ projectId }: MilestonesViewProps) {
  const data = useAppStore((state) => state.data)
  const createMilestone = useAppStore((state) => state.createMilestone)
  const updateMilestone = useAppStore((state) => state.updateMilestone)
  const deleteMilestone = useAppStore((state) => state.deleteMilestone)
  const createResource = useAppStore((state) => state.createResource)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>()
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | undefined>()
  const [resourceTarget, setResourceTarget] = useState<Milestone | undefined>()
  const [isFormOpen, setFormOpen] = useState(false)

  const milestones = data.milestones
    .filter((milestone) => milestone.projectId === projectId)
    .sort((a, b) => a.order - b.order)
  const tasks = data.tasks.filter((task) => task.projectId === projectId)
  const resources = data.resources.filter((resource) => resource.projectId === projectId)

  const submitMilestone = (values: MilestoneFormValues) => {
    if (editingMilestone) {
      updateMilestone(editingMilestone.id, values)
    } else {
      createMilestone(projectId, values)
    }
    setEditingMilestone(undefined)
    setFormOpen(false)
  }

  const submitResource = async (values: ResourceFormValues) => {
    await createResource(projectId, values)
    setResourceTarget(undefined)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">Milestones</h3>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Plan major phases and connect phase-specific files.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditingMilestone(undefined)
            setFormOpen(true)
          }}
        >
          Add milestone
        </Button>
      </div>

      {milestones.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {milestones.map((milestone) => {
            const milestoneTasks = tasks.filter((task) => task.milestoneId === milestone.id)
            const completed = milestoneTasks.filter((task) => task.status === 'done').length
            const progress = calculateMilestoneProgress(data, milestone.id)
            const linkedResources = resourceCountForEntity(resources, 'milestone', milestone.id)
            return (
              <article key={milestone.id} className="pd-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">
                      {milestone.title}
                    </h4>
                    <p className="mt-1 text-sm text-[color:var(--pd-muted-foreground)]">
                      {milestone.description || 'No description.'}
                    </p>
                  </div>
                  <Badge tone={milestone.status === 'completed' ? 'green' : 'blue'}>
                    {milestoneStatusLabels[milestone.status]}
                  </Badge>
                </div>
                <div className="mt-4">
                  <ProgressBar value={progress} label={`${completed}/${milestoneTasks.length} tasks complete`} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[color:var(--pd-muted-foreground)]">
                  <span>Due {formatDate(milestone.dueDate)}</span>
                  <span>{linkedResources} resources</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--pd-border)] pt-3">
                  <Button size="sm" icon={<Link2 className="h-4 w-4" />} onClick={() => setResourceTarget(milestone)}>
                    Link file/folder
                  </Button>
                  <Button
                    size="sm"
                    icon={<Edit3 className="h-4 w-4" />}
                    onClick={() => {
                      setEditingMilestone(milestone)
                      setFormOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => setDeletingMilestone(milestone)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="No milestones"
          message="Create milestones to break this project into manageable phases."
          action={<Button variant="primary" onClick={() => setFormOpen(true)}>Add milestone</Button>}
        />
      )}

      <Modal
        title={editingMilestone ? 'Edit milestone' : 'Create milestone'}
        isOpen={isFormOpen}
        onClose={() => {
          setEditingMilestone(undefined)
          setFormOpen(false)
        }}
      >
        <MilestoneForm
          milestone={editingMilestone}
          onCancel={() => {
            setEditingMilestone(undefined)
            setFormOpen(false)
          }}
          onSubmit={submitMilestone}
        />
      </Modal>
      <Modal
        title="Link milestone resource"
        isOpen={Boolean(resourceTarget)}
        onClose={() => setResourceTarget(undefined)}
      >
        {resourceTarget ? (
          <ResourceForm
            data={data}
            projectId={projectId}
            defaultEntityType="milestone"
            defaultEntityId={resourceTarget.id}
            onCancel={() => setResourceTarget(undefined)}
            onSubmit={submitResource}
          />
        ) : null}
      </Modal>
      <ConfirmDialog
        title="Delete milestone"
        message="Tasks assigned to this milestone will stay in the project without a milestone. Resource links attached to this milestone will be removed, but real files will not be touched."
        confirmLabel="Delete milestone"
        isOpen={Boolean(deletingMilestone)}
        onCancel={() => setDeletingMilestone(undefined)}
        onConfirm={() => {
          if (deletingMilestone) {
            deleteMilestone(deletingMilestone.id)
            setDeletingMilestone(undefined)
          }
        }}
      />
    </section>
  )
}
