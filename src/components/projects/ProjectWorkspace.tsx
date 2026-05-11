import {
  AlertTriangle,
  Clipboard,
  Edit3,
  ExternalLink,
  FileText,
  FolderOpen,
  Gauge,
  ListChecks,
  Milestone as MilestoneIcon,
  NotebookText,
  Paperclip,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { copyText, openLinkedPath } from '../../lib/fileSystem'
import { useAppStore, type ProjectTab } from '../../stores/appStore'
import { projectPriorityLabels, projectStatusLabels } from '../../types/constants'
import type { ProjectFormValues } from '../../types/models'
import { formatDate } from '../../utils/date'
import {
  calculateProgress,
  countOpenIssues,
  countOpenTasks,
  getProjectIssues,
  getProjectMilestones,
  getProjectNotes,
  getProjectResources,
  getProjectTasks,
  recentlyUpdatedItems,
} from '../../utils/metrics'
import { compactPath } from '../../utils/text'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { IssueView } from '../issues/IssueView'
import { MilestonesView } from '../milestones/MilestonesView'
import { NotesView } from '../notes/NotesView'
import { ReportView } from '../reports/ReportView'
import { ResourcesView } from '../resources/ResourcesView'
import { TasksView } from '../tasks/TasksView'
import { ProjectForm } from './ProjectForm'

const tabs: { id: ProjectTab; label: string; icon: typeof Gauge }[] = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'milestones', label: 'Milestones', icon: MilestoneIcon },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'issues', label: 'Issues', icon: AlertTriangle },
  { id: 'notes', label: 'Notes', icon: NotebookText },
  { id: 'resources', label: 'Files', icon: Paperclip },
  { id: 'report', label: 'Report', icon: FileText },
]

interface ProjectWorkspaceProps {
  projectId: string
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const data = useAppStore((state) => state.data)
  const activeProjectTab = useAppStore((state) => state.activeProjectTab)
  const setProjectTab = useAppStore((state) => state.setProjectTab)
  const updateProject = useAppStore((state) => state.updateProject)
  const deleteProject = useAppStore((state) => state.deleteProject)
  const showToast = useAppStore((state) => state.showToast)
  const [isEditOpen, setEditOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const project = data.projects.find((item) => item.id === projectId)
  const tasks = useMemo(() => getProjectTasks(data, projectId), [data, projectId])

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState title="Project not found" message="This project may have been deleted." />
      </div>
    )
  }

  const progress = calculateProgress(tasks)
  const missingRoot = project.rootFolderStatus === 'missing'

  const copyRoot = async () => {
    if (!project.rootFolderPath) {
      return
    }

    const result = await copyText(project.rootFolderPath)
    showToast(result.message, result.ok ? 'success' : 'error')
  }

  const openRoot = async () => {
    if (!project.rootFolderPath) {
      return
    }

    const result = await openLinkedPath(project.rootFolderPath)
    showToast(result.message, result.ok ? 'success' : 'warning')
  }

  const submitProject = (values: ProjectFormValues) => {
    updateProject(project.id, values)
    setEditOpen(false)
  }

  const content =
    activeProjectTab === 'milestones' ? (
      <MilestonesView projectId={project.id} />
    ) : activeProjectTab === 'tasks' ? (
      <TasksView projectId={project.id} />
    ) : activeProjectTab === 'issues' ? (
      <IssueView projectId={project.id} />
    ) : activeProjectTab === 'notes' ? (
      <NotesView projectId={project.id} />
    ) : activeProjectTab === 'resources' ? (
      <ResourcesView projectId={project.id} />
    ) : activeProjectTab === 'report' ? (
      <ReportView projectId={project.id} />
    ) : (
      <ProjectOverview projectId={project.id} />
    )

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
      <header className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{project.name}</h2>
              <Badge tone="blue">{projectStatusLabels[project.status]}</Badge>
              <Badge tone={project.priority === 'high' ? 'red' : 'slate'}>
                {projectPriorityLabels[project.priority]}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {project.category || 'Uncategorized'} · Due {formatDate(project.dueDate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.rootFolderPath ? (
              <>
                <Button icon={<ExternalLink className="h-4 w-4" />} onClick={openRoot}>
                  Open folder
                </Button>
                <Button icon={<Clipboard className="h-4 w-4" />} onClick={copyRoot}>
                  Copy path
                </Button>
              </>
            ) : null}
            <Button icon={<Edit3 className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <ProgressBar value={progress} label={`${progress}% complete`} />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            {project.rootFolderPath ? (
              <div className="flex flex-wrap items-center gap-2">
                <FolderOpen className="h-4 w-4 text-blue-700" />
                <span className="font-medium text-slate-700">Root folder:</span>
                <span className="text-slate-600" title={project.rootFolderPath}>
                  {compactPath(project.rootFolderPath)}
                </span>
                {missingRoot ? <Badge tone="red">Missing</Badge> : null}
                {project.rootFolderStatus === 'unknown' ? <Badge tone="amber">Unchecked</Badge> : null}
              </div>
            ) : (
              <span className="text-slate-500">No root folder linked yet.</span>
            )}
          </div>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeProjectTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProjectTab(tab.id)}
              className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                active ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {content}

      <Modal title="Edit project" isOpen={isEditOpen} onClose={() => setEditOpen(false)}>
        <ProjectForm project={project} onCancel={() => setEditOpen(false)} onSubmit={submitProject} />
      </Modal>
      <ConfirmDialog
        title="Delete project"
        message="This removes the project and its PlanDesk records. It will not delete any linked files or folders from your computer."
        confirmLabel="Delete project"
        isOpen={isDeleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteProject(project.id)
          setDeleteOpen(false)
        }}
      />
    </div>
  )
}

function ProjectOverview({ projectId }: { projectId: string }) {
  const data = useAppStore((state) => state.data)
  const setProjectTab = useAppStore((state) => state.setProjectTab)
  const project = data.projects.find((item) => item.id === projectId)

  if (!project) {
    return null
  }

  const tasks = getProjectTasks(data, projectId)
  const milestones = getProjectMilestones(data, projectId)
  const issues = getProjectIssues(data, projectId)
  const notes = getProjectNotes(data, projectId)
  const resources = getProjectResources(data, projectId)
  const updatedItems = recentlyUpdatedItems([project], milestones, tasks, issues, resources)

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Project brief</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoBlock title="Description" text={project.description || 'No description yet.'} />
            <InfoBlock title="Goal" text={project.goal || 'No goal defined yet.'} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Milestones" value={`${milestones.filter((item) => item.status === 'completed').length}/${milestones.length}`} />
          <SummaryCard label="Open tasks" value={countOpenTasks(tasks)} />
          <SummaryCard label="Open issues" value={countOpenIssues(issues)} />
          <SummaryCard label="Notes" value={notes.length} />
          <SummaryCard label="Resources" value={resources.length} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Quick actions</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setProjectTab('tasks')}>Add task</Button>
            <Button onClick={() => setProjectTab('milestones')}>Add milestone</Button>
            <Button onClick={() => setProjectTab('issues')}>Add issue</Button>
            <Button onClick={() => setProjectTab('notes')}>Add note</Button>
            <Button onClick={() => setProjectTab('resources')}>Add linked file/folder</Button>
            <Button onClick={() => setProjectTab('report')}>Export report</Button>
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Upcoming deadlines</h3>
          <div className="mt-3 space-y-2">
            {tasks
              .filter((task) => task.status !== 'done' && task.dueDate)
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="rounded-md bg-slate-50 px-3 py-2">
                  <div className="text-sm font-medium text-slate-800">{task.title}</div>
                  <div className="text-xs text-slate-500">{formatDate(task.dueDate)}</div>
                </div>
              ))}
            {!tasks.some((task) => task.status !== 'done' && task.dueDate) ? (
              <p className="text-sm text-slate-500">No upcoming task deadlines.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-950">Recently updated</h3>
          <div className="mt-3 space-y-2">
            {updatedItems.map((item) => (
              <div key={`${item.kind}-${item.label}-${item.updatedAt}`} className="rounded-md bg-slate-50 px-3 py-2">
                <div className="text-sm font-medium text-slate-800">{item.label}</div>
                <div className="text-xs text-slate-500">
                  {item.kind} · {formatDate(item.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  )
}
