import { Edit3, Link2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { issueSeverityLabels, issueStatusLabels } from '../../types/constants'
import type { Issue, IssueFormValues, ResourceFormValues } from '../../types/models'
import { formatDate } from '../../utils/date'
import { resourceCountForEntity } from '../../utils/metrics'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ResourceForm } from '../resources/ResourceForm'
import { IssueForm } from './IssueForm'

interface IssueViewProps {
  projectId: string
}

export function IssueView({ projectId }: IssueViewProps) {
  const data = useAppStore((state) => state.data)
  const createIssue = useAppStore((state) => state.createIssue)
  const updateIssue = useAppStore((state) => state.updateIssue)
  const deleteIssue = useAppStore((state) => state.deleteIssue)
  const createResource = useAppStore((state) => state.createResource)
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>()
  const [deletingIssue, setDeletingIssue] = useState<Issue | undefined>()
  const [resourceTarget, setResourceTarget] = useState<Issue | undefined>()
  const [isIssueModalOpen, setIssueModalOpen] = useState(false)

  const issues = data.issues.filter((issue) => issue.projectId === projectId)
  const tasks = data.tasks.filter((task) => task.projectId === projectId)
  const resources = data.resources.filter((resource) => resource.projectId === projectId)

  const submitIssue = (values: IssueFormValues) => {
    if (editingIssue) {
      updateIssue(editingIssue.id, values)
    } else {
      createIssue(projectId, values)
    }
    setEditingIssue(undefined)
    setIssueModalOpen(false)
  }

  const submitResource = async (values: ResourceFormValues) => {
    await createResource(projectId, values)
    setResourceTarget(undefined)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">Issues</h3>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Track blockers, risks, and decisions separately from tasks.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditingIssue(undefined)
            setIssueModalOpen(true)
          }}
        >
          Add issue
        </Button>
      </div>

      {issues.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {issues.map((issue) => {
            const relatedTask = tasks.find((task) => task.id === issue.relatedTaskId)
            const linkedResources = resourceCountForEntity(resources, 'issue', issue.id)
            return (
              <article key={issue.id} className="pd-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">{issue.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--pd-muted-foreground)]">
                      {issue.description || 'No description.'}
                    </p>
                  </div>
                  <Badge tone={issue.severity === 'critical' ? 'red' : issue.severity === 'high' ? 'amber' : 'slate'}>
                    {issueSeverityLabels[issue.severity]}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={issue.status === 'resolved' ? 'green' : 'blue'}>
                    {issueStatusLabels[issue.status]}
                  </Badge>
                  {relatedTask ? <Badge>{relatedTask.title}</Badge> : null}
                  <Badge>{linkedResources} resources</Badge>
                </div>
                {issue.resolutionNotes ? (
                  <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {issue.resolutionNotes}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--pd-border)] pt-3">
                  <span className="text-xs text-[color:var(--pd-muted-foreground)]">
                    Created {formatDate(issue.createdAt)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" icon={<Link2 className="h-4 w-4" />} onClick={() => setResourceTarget(issue)}>
                      Link
                    </Button>
                    <Button
                      size="sm"
                      icon={<Edit3 className="h-4 w-4" />}
                      onClick={() => {
                        setEditingIssue(issue)
                        setIssueModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setDeletingIssue(issue)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="No issues"
          message="Log blockers, risks, and unresolved questions so they do not disappear inside task notes."
          action={<Button variant="primary" onClick={() => setIssueModalOpen(true)}>Add issue</Button>}
        />
      )}

      <Modal
        title={editingIssue ? 'Edit issue' : 'Create issue'}
        isOpen={isIssueModalOpen}
        onClose={() => {
          setEditingIssue(undefined)
          setIssueModalOpen(false)
        }}
      >
        <IssueForm
          issue={editingIssue}
          tasks={tasks}
          onCancel={() => {
            setEditingIssue(undefined)
            setIssueModalOpen(false)
          }}
          onSubmit={submitIssue}
        />
      </Modal>
      <Modal title="Link issue resource" isOpen={Boolean(resourceTarget)} onClose={() => setResourceTarget(undefined)}>
        {resourceTarget ? (
          <ResourceForm
            data={data}
            projectId={projectId}
            defaultEntityType="issue"
            defaultEntityId={resourceTarget.id}
            onCancel={() => setResourceTarget(undefined)}
            onSubmit={submitResource}
          />
        ) : null}
      </Modal>
      <ConfirmDialog
        title="Delete issue"
        message="This removes the issue and its PlanDesk resource links. Linked files and folders remain untouched."
        confirmLabel="Delete issue"
        isOpen={Boolean(deletingIssue)}
        onCancel={() => setDeletingIssue(undefined)}
        onConfirm={() => {
          if (deletingIssue) {
            deleteIssue(deletingIssue.id)
            setDeletingIssue(undefined)
          }
        }}
      />
    </section>
  )
}
