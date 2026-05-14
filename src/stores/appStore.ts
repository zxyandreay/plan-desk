import { create } from 'zustand'
import { createSampleData } from '../data/demoData'
import { createEmptyData } from '../data/initialData'
import { readAppData, saveAppData } from '../data/localRepository'
import {
  createWorkflowColumns,
  getProjectTemplate,
  getProjectWorkflowColumns,
  legacyStatusToColumnId,
  statusFromWorkflowColumn,
  workflowColumnId,
} from '../data/templates'
import { checkPathHealth } from '../lib/fileSystem'
import type {
  AppData,
  AppSettings,
  IssueFormValues,
  MilestoneFormValues,
  NoteFormValues,
  ProjectFormValues,
  ResourceFormValues,
  TaskFormValues,
  WorkflowColumnFormValues,
} from '../types/models'
import { nowIso } from '../utils/date'
import { createId } from '../utils/id'

export type AppView = 'dashboard' | 'focus' | 'calendar' | 'settings' | 'project'
export type ProjectTab =
  | 'overview'
  | 'milestones'
  | 'tasks'
  | 'issues'
  | 'notes'
  | 'resources'
  | 'calendar'
  | 'timeline'
  | 'report'

export type ToastTone = 'success' | 'info' | 'warning' | 'error'

export interface ToastMessage {
  id: string
  tone: ToastTone
  message: string
}

export interface CreateProjectFromTemplateInput {
  templateId: string
  values: ProjectFormValues
  workflowTemplateId: string
  applyWorkflow: boolean
  includeTasks: boolean
  includeIssues: boolean
  includeNotes: boolean
}

export interface CreateProjectFromTemplateResult {
  projectId: string
  milestoneIdsByTemplateId: Record<string, string>
}

interface AppStore {
  data: AppData
  isReady: boolean
  isSaving: boolean
  activeView: AppView
  activeProjectId?: string
  activeProjectTab: ProjectTab
  taskView: 'board' | 'list'
  toast?: ToastMessage
  initialize: () => Promise<void>
  showToast: (message: string, tone?: ToastTone) => void
  dismissToast: () => void
  setActiveView: (view: AppView) => void
  setActiveProject: (projectId?: string) => void
  setProjectTab: (tab: ProjectTab) => void
  setTaskView: (view: 'board' | 'list') => void
  createProject: (values: ProjectFormValues) => string
  createProjectFromTemplate: (input: CreateProjectFromTemplateInput) => CreateProjectFromTemplateResult
  updateProject: (projectId: string, values: ProjectFormValues) => void
  deleteProject: (projectId: string) => void
  setProjectRoot: (projectId: string, rootFolderPath?: string) => Promise<void>
  createMilestone: (projectId: string, values: MilestoneFormValues) => void
  updateMilestone: (milestoneId: string, values: MilestoneFormValues) => void
  deleteMilestone: (milestoneId: string) => void
  createTask: (projectId: string, values: TaskFormValues) => void
  updateTask: (taskId: string, values: TaskFormValues) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, columnId: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  createWorkflowColumn: (projectId: string, values: WorkflowColumnFormValues) => void
  updateWorkflowColumn: (columnId: string, values: WorkflowColumnFormValues) => void
  moveWorkflowColumn: (columnId: string, direction: -1 | 1) => void
  deleteWorkflowColumn: (columnId: string, moveToColumnId?: string) => void
  applyWorkflowTemplate: (projectId: string, workflowTemplateId: string) => void
  createIssue: (projectId: string, values: IssueFormValues) => void
  updateIssue: (issueId: string, values: IssueFormValues) => void
  deleteIssue: (issueId: string) => void
  createNote: (projectId: string, values: NoteFormValues) => void
  updateNote: (noteId: string, values: NoteFormValues) => void
  deleteNote: (noteId: string) => void
  createResource: (projectId: string, values: ResourceFormValues) => Promise<void>
  updateResource: (resourceId: string, values: ResourceFormValues) => Promise<void>
  deleteResource: (resourceId: string) => void
  importData: (data: AppData) => void
  exportData: () => AppData
  loadSampleData: () => void
  clearData: () => void
  updateSettings: (settings: Partial<AppSettings>) => void
  refreshResourceHealth: () => Promise<void>
}

const initialState: Pick<
  AppStore,
  'data' | 'isReady' | 'isSaving' | 'activeView' | 'activeProjectTab' | 'taskView'
> = {
  data: createEmptyData(),
  isReady: false,
  isSaving: false,
  activeView: 'dashboard',
  activeProjectTab: 'overview',
  taskView: 'board',
}

function touchProject(data: AppData, projectId: string, updatedAt: string) {
  return {
    ...data,
    projects: data.projects.map((project) =>
      project.id === projectId ? { ...project, updatedAt } : project,
    ),
  }
}

function removeEntityResources(
  data: AppData,
  linkedEntityType: 'milestone' | 'task' | 'issue' | 'note',
  linkedEntityId: string,
) {
  return data.resources.filter(
    (resource) =>
      resource.linkedEntityType !== linkedEntityType || resource.linkedEntityId !== linkedEntityId,
  )
}

function taskValuesForWorkflow(data: AppData, projectId: string, values: TaskFormValues) {
  const columns = getProjectWorkflowColumns(data.workflowColumns, projectId)
  const columnId = values.columnId && columns.some((column) => column.id === values.columnId)
    ? values.columnId
    : legacyStatusToColumnId(values.status, columns)
  const column = columns.find((item) => item.id === columnId)

  return {
    ...values,
    columnId,
    status: statusFromWorkflowColumn(column),
  }
}

export const useAppStore = create<AppStore>((set, get) => {
  const persist = (data: AppData) => {
    set({ isSaving: true })
    void saveAppData(data)
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'PlanDesk could not save data.'
        set({
          toast: {
            id: createId('toast'),
            tone: 'error',
            message,
          },
        })
      })
      .finally(() => set({ isSaving: false }))
  }

  const commit = (updater: (data: AppData) => AppData, toast?: Omit<ToastMessage, 'id'>) => {
    const nextData = updater(get().data)
    set({
      data: nextData,
      toast: toast ? { id: createId('toast'), ...toast } : get().toast,
    })
    persist(nextData)
  }

  return {
    ...initialState,
    async initialize() {
      const data = await readAppData()
      set({
        data,
        isReady: true,
        activeView: data.settings.defaultView,
        activeProjectId: data.settings.lastOpenedProjectId,
      })
      void get().refreshResourceHealth()
    },
    showToast(message, tone = 'info') {
      set({ toast: { id: createId('toast'), message, tone } })
    },
    dismissToast() {
      set({ toast: undefined })
    },
    setActiveView(view) {
      set({ activeView: view, activeProjectId: view === 'project' ? get().activeProjectId : undefined })
    },
    setActiveProject(projectId) {
      const activeView = projectId ? 'project' : 'dashboard'
      set({ activeProjectId: projectId, activeView })
      commit((data) => ({
        ...data,
        settings: {
          ...data.settings,
          lastOpenedProjectId: projectId,
        },
      }))
    },
    setProjectTab(tab) {
      set({ activeProjectTab: tab })
    },
    setTaskView(view) {
      set({ taskView: view })
    },
    createProject(values) {
      const timestamp = nowIso()
      const projectId = createId('project')
      const workflowColumns = createWorkflowColumns(projectId, 'standard', timestamp)
      commit(
        (data) => ({
          ...data,
          projects: [
            {
              id: projectId,
              ...values,
              rootFolderStatus: values.rootFolderPath ? 'unknown' : undefined,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...data.projects,
          ],
          workflowColumns: [...data.workflowColumns, ...workflowColumns],
          settings: {
            ...data.settings,
            lastOpenedProjectId: projectId,
          },
        }),
        { tone: 'success', message: 'Project created.' },
      )
      set({ activeProjectId: projectId, activeView: 'project', activeProjectTab: 'overview' })
      void get().refreshResourceHealth()
      return projectId
    },
    createProjectFromTemplate(input) {
      const timestamp = nowIso()
      const template = getProjectTemplate(input.templateId)
      const projectId = createId('project')
      const workflowTemplateId = input.applyWorkflow
        ? input.workflowTemplateId || template.workflowTemplateId || 'standard'
        : 'standard'
      const workflowColumns = createWorkflowColumns(projectId, workflowTemplateId, timestamp)
      const firstColumnId = workflowColumns[0]?.id
      const milestoneIdsByTemplateId: Record<string, string> = {}

      const milestones = template.milestones.map((milestone) => {
        const milestoneId = createId('milestone')
        milestoneIdsByTemplateId[milestone.id] = milestoneId
        return {
          id: milestoneId,
          projectId,
          title: milestone.title,
          description: milestone.description ?? '',
          status: 'not_started' as const,
          color: milestone.color,
          dueDate: '',
          order: milestone.order,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      })

      const tasks = input.includeTasks
        ? template.tasks.map((task) => {
            const requestedColumnId = task.columnId
              ? workflowColumnId(projectId, task.columnId)
              : undefined
            const column =
              workflowColumns.find((item) => item.id === requestedColumnId) ??
              workflowColumns.find((item) => item.type === 'todo') ??
              workflowColumns[0]

            return {
              id: createId('task'),
              projectId,
              milestoneId: task.milestoneTemplateId
                ? milestoneIdsByTemplateId[task.milestoneTemplateId]
                : undefined,
              title: task.title,
              description: task.description ?? '',
              status: statusFromWorkflowColumn(column),
              columnId: column?.id ?? firstColumnId,
              priority: task.priority ?? 'medium',
              color: task.color,
              dueDate: '',
              assignee: undefined,
              tags: task.tags ?? [],
              subtasks: [],
              createdAt: timestamp,
              updatedAt: timestamp,
            }
          })
        : []

      const issues = input.includeIssues
        ? (template.issues ?? []).map((issue) => ({
            id: createId('issue'),
            projectId,
            relatedTaskId: undefined,
            title: issue.title,
            description: issue.description ?? '',
            severity: issue.severity ?? 'medium',
            status: 'open' as const,
            color: issue.color,
            resolutionNotes: '',
            createdAt: timestamp,
            updatedAt: timestamp,
          }))
        : []

      const notes = input.includeNotes
        ? (template.notes ?? []).map((note) => ({
            id: createId('note'),
            projectId,
            title: note.title,
            content: note.content,
            color: note.color,
            createdAt: timestamp,
            updatedAt: timestamp,
          }))
        : []

      commit(
        (data) => ({
          ...data,
          projects: [
            {
              id: projectId,
              ...input.values,
              color: input.values.color ?? template.color,
              rootFolderStatus: input.values.rootFolderPath ? 'unknown' : undefined,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...data.projects,
          ],
          workflowColumns: [...data.workflowColumns, ...workflowColumns],
          milestones: [...data.milestones, ...milestones],
          tasks: [...tasks, ...data.tasks],
          issues: [...issues, ...data.issues],
          notes: [...notes, ...data.notes],
          settings: {
            ...data.settings,
            lastOpenedProjectId: projectId,
          },
        }),
        { tone: 'success', message: template.id === 'blank' ? 'Blank project created.' : 'Project created from template.' },
      )
      set({ activeProjectId: projectId, activeView: 'project', activeProjectTab: 'overview' })
      void get().refreshResourceHealth()
      return { projectId, milestoneIdsByTemplateId }
    },
    updateProject(projectId, values) {
      const timestamp = nowIso()
      commit(
        (data) => ({
          ...data,
          projects: data.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  ...values,
                  rootFolderStatus: values.rootFolderPath ? project.rootFolderStatus ?? 'unknown' : undefined,
                  updatedAt: timestamp,
                }
              : project,
          ),
        }),
        { tone: 'success', message: 'Project updated.' },
      )
      void get().refreshResourceHealth()
    },
    deleteProject(projectId) {
      commit(
        (data) => ({
          ...data,
          projects: data.projects.filter((project) => project.id !== projectId),
          workflowColumns: data.workflowColumns.filter((column) => column.projectId !== projectId),
          milestones: data.milestones.filter((milestone) => milestone.projectId !== projectId),
          tasks: data.tasks.filter((task) => task.projectId !== projectId),
          issues: data.issues.filter((issue) => issue.projectId !== projectId),
          notes: data.notes.filter((note) => note.projectId !== projectId),
          resources: data.resources.filter((resource) => resource.projectId !== projectId),
          settings: {
            ...data.settings,
            lastOpenedProjectId:
              data.settings.lastOpenedProjectId === projectId
                ? undefined
                : data.settings.lastOpenedProjectId,
          },
        }),
        { tone: 'warning', message: 'Project deleted. Local files were not touched.' },
      )
      set({ activeProjectId: undefined, activeView: 'dashboard' })
    },
    async setProjectRoot(projectId, rootFolderPath) {
      const timestamp = nowIso()
      const rootFolderStatus = rootFolderPath ? await checkPathHealth(rootFolderPath) : undefined
      commit(
        (data) => ({
          ...data,
          projects: data.projects.map((project) =>
            project.id === projectId
              ? { ...project, rootFolderPath, rootFolderStatus, updatedAt: timestamp }
              : project,
          ),
        }),
        { tone: 'success', message: rootFolderPath ? 'Root folder linked.' : 'Root folder removed.' },
      )
    },
    createMilestone(projectId, values) {
      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              milestones: [
                ...data.milestones,
                {
                  id: createId('milestone'),
                  projectId,
                  ...values,
                  order: data.milestones.filter((milestone) => milestone.projectId === projectId).length,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
              ],
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Milestone created.' },
      )
    },
    updateMilestone(milestoneId, values) {
      const timestamp = nowIso()
      const milestone = get().data.milestones.find((item) => item.id === milestoneId)
      if (!milestone) {
        return
      }

      commit(
        (data) =>
          touchProject(
            {
              ...data,
              milestones: data.milestones.map((item) =>
                item.id === milestoneId ? { ...item, ...values, updatedAt: timestamp } : item,
              ),
            },
            milestone.projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Milestone updated.' },
      )
    },
    deleteMilestone(milestoneId) {
      const milestone = get().data.milestones.find((item) => item.id === milestoneId)
      if (!milestone) {
        return
      }

      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              milestones: data.milestones.filter((item) => item.id !== milestoneId),
              tasks: data.tasks.map((task) =>
                task.milestoneId === milestoneId
                  ? { ...task, milestoneId: undefined, updatedAt: timestamp }
                  : task,
              ),
              resources: removeEntityResources(data, 'milestone', milestoneId),
            },
            milestone.projectId,
            timestamp,
          ),
        { tone: 'warning', message: 'Milestone deleted. Linked files were not touched.' },
      )
    },
    createTask(projectId, values) {
      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              tasks: [
                {
                  id: createId('task'),
                  projectId,
                  ...taskValuesForWorkflow(data, projectId, values),
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
                ...data.tasks,
              ],
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Task created.' },
      )
    },
    updateTask(taskId, values) {
      const timestamp = nowIso()
      const task = get().data.tasks.find((item) => item.id === taskId)
      if (!task) {
        return
      }

      commit(
        (data) =>
          touchProject(
            {
              ...data,
              tasks: data.tasks.map((item) =>
                item.id === taskId
                  ? { ...item, ...taskValuesForWorkflow(data, item.projectId, values), updatedAt: timestamp }
                  : item,
              ),
            },
            task.projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Task updated.' },
      )
    },
    deleteTask(taskId) {
      const task = get().data.tasks.find((item) => item.id === taskId)
      if (!task) {
        return
      }

      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              tasks: data.tasks.filter((item) => item.id !== taskId),
              issues: data.issues.map((issue) =>
                issue.relatedTaskId === taskId
                  ? { ...issue, relatedTaskId: undefined, updatedAt: timestamp }
                  : issue,
              ),
              resources: removeEntityResources(data, 'task', taskId),
            },
            task.projectId,
            timestamp,
          ),
        { tone: 'warning', message: 'Task deleted. Linked files were not touched.' },
      )
    },
    moveTask(taskId, columnId) {
      const timestamp = nowIso()
      const task = get().data.tasks.find((item) => item.id === taskId)
      if (!task) {
        return
      }

      commit((data) =>
        touchProject(
          {
            ...data,
            tasks: data.tasks.map((item) =>
              item.id === taskId
                ? {
                    ...item,
                    columnId,
                    status: statusFromWorkflowColumn(
                      getProjectWorkflowColumns(data.workflowColumns, item.projectId).find(
                        (column) => column.id === columnId,
                      ),
                    ),
                    updatedAt: timestamp,
                  }
                : item,
            ),
          },
          task.projectId,
          timestamp,
        ),
      )
    },
    toggleSubtask(taskId, subtaskId) {
      const timestamp = nowIso()
      const task = get().data.tasks.find((item) => item.id === taskId)
      if (!task) {
        return
      }

      commit((data) =>
        touchProject(
          {
            ...data,
            tasks: data.tasks.map((item) =>
              item.id === taskId
                ? {
                    ...item,
                    subtasks: item.subtasks.map((subtask) =>
                      subtask.id === subtaskId
                        ? { ...subtask, completed: !subtask.completed }
                        : subtask,
                    ),
                    updatedAt: timestamp,
                  }
                : item,
            ),
          },
          task.projectId,
          timestamp,
        ),
      )
    },
    createWorkflowColumn(projectId, values) {
      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              workflowColumns: [
                ...data.workflowColumns,
                {
                  id: createId('workflow'),
                  projectId,
                  ...values,
                  type: values.isCompleted ? 'done' : values.type,
                  order: getProjectWorkflowColumns(data.workflowColumns, projectId).length,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
              ],
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Workflow column added.' },
      )
    },
    updateWorkflowColumn(columnId, values) {
      const timestamp = nowIso()
      const column = get().data.workflowColumns.find((item) => item.id === columnId)
      if (!column) {
        return
      }

      const projectColumns = getProjectWorkflowColumns(get().data.workflowColumns, column.projectId)
      const wouldRemoveLastCompleted =
        column.isCompleted &&
        !values.isCompleted &&
        projectColumns.filter((item) => item.id !== columnId).every((item) => !item.isCompleted)

      if (wouldRemoveLastCompleted) {
        get().showToast('At least one workflow column must count as completed.', 'warning')
        return
      }

      commit(
        (data) =>
          touchProject(
            {
              ...data,
              workflowColumns: data.workflowColumns.map((item) =>
                item.id === columnId
                  ? {
                      ...item,
                      ...values,
                      type: values.isCompleted ? 'done' : values.type,
                      updatedAt: timestamp,
                    }
                  : item,
              ),
              tasks: data.tasks.map((task) => {
                if (task.columnId !== columnId) return task
                const nextColumn = {
                  ...column,
                  ...values,
                  type: values.isCompleted ? 'done' : values.type,
                }
                return { ...task, status: statusFromWorkflowColumn(nextColumn), updatedAt: timestamp }
              }),
            },
            column.projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Workflow column updated.' },
      )
    },
    moveWorkflowColumn(columnId, direction) {
      const timestamp = nowIso()
      const column = get().data.workflowColumns.find((item) => item.id === columnId)
      if (!column) {
        return
      }

      const columns = getProjectWorkflowColumns(get().data.workflowColumns, column.projectId)
      const currentIndex = columns.findIndex((item) => item.id === columnId)
      const nextIndex = currentIndex + direction
      if (nextIndex < 0 || nextIndex >= columns.length) {
        return
      }

      const reordered = [...columns]
      const [moved] = reordered.splice(currentIndex, 1)
      reordered.splice(nextIndex, 0, moved)
      const orderById = new Map(reordered.map((item, index) => [item.id, index]))

      commit((data) =>
        touchProject(
          {
            ...data,
            workflowColumns: data.workflowColumns.map((item) =>
              orderById.has(item.id)
                ? { ...item, order: orderById.get(item.id) ?? item.order, updatedAt: timestamp }
                : item,
            ),
          },
          column.projectId,
          timestamp,
        ),
      )
    },
    deleteWorkflowColumn(columnId, moveToColumnId) {
      const timestamp = nowIso()
      const column = get().data.workflowColumns.find((item) => item.id === columnId)
      if (!column) {
        return
      }

      const data = get().data
      const columns = getProjectWorkflowColumns(data.workflowColumns, column.projectId)
      const tasksInColumn = data.tasks.filter((task) => task.columnId === columnId)
      const targetColumn = columns.find((item) => item.id === moveToColumnId)
      const remainingColumns = columns.filter((item) => item.id !== columnId)

      if (tasksInColumn.length && !targetColumn) {
        get().showToast('Choose another column before deleting a column that contains tasks.', 'warning')
        return
      }

      if (!remainingColumns.some((item) => item.isCompleted || item.type === 'done')) {
        get().showToast('At least one workflow column must count as completed.', 'warning')
        return
      }

      const orderById = new Map(remainingColumns.map((item, index) => [item.id, index]))
      commit(
        (currentData) =>
          touchProject(
            {
              ...currentData,
              workflowColumns: currentData.workflowColumns
                .filter((item) => item.id !== columnId)
                .map((item) =>
                  orderById.has(item.id)
                    ? { ...item, order: orderById.get(item.id) ?? item.order, updatedAt: timestamp }
                    : item,
                ),
              tasks: currentData.tasks.map((task) =>
                task.columnId === columnId && targetColumn
                  ? {
                      ...task,
                      columnId: targetColumn.id,
                      status: statusFromWorkflowColumn(targetColumn),
                      updatedAt: timestamp,
                    }
                  : task,
              ),
            },
            column.projectId,
            timestamp,
          ),
        { tone: 'warning', message: 'Workflow column deleted. Tasks were kept.' },
      )
    },
    applyWorkflowTemplate(projectId, workflowTemplateId) {
      const timestamp = nowIso()
      const workflowColumns = createWorkflowColumns(projectId, workflowTemplateId, timestamp)
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              workflowColumns: [
                ...data.workflowColumns.filter((column) => column.projectId !== projectId),
                ...workflowColumns,
              ],
              tasks: data.tasks.map((task) => {
                if (task.projectId !== projectId) return task
                const columnId = legacyStatusToColumnId(task.status, workflowColumns) ?? workflowColumns[0]?.id
                const column = workflowColumns.find((item) => item.id === columnId)
                return {
                  ...task,
                  columnId,
                  status: statusFromWorkflowColumn(column),
                  updatedAt: timestamp,
                }
              }),
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Workflow template applied.' },
      )
    },
    createIssue(projectId, values) {
      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              issues: [
                {
                  id: createId('issue'),
                  projectId,
                  ...values,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
                ...data.issues,
              ],
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Issue created.' },
      )
    },
    updateIssue(issueId, values) {
      const timestamp = nowIso()
      const issue = get().data.issues.find((item) => item.id === issueId)
      if (!issue) {
        return
      }

      commit(
        (data) =>
          touchProject(
            {
              ...data,
              issues: data.issues.map((item) =>
                item.id === issueId ? { ...item, ...values, updatedAt: timestamp } : item,
              ),
            },
            issue.projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Issue updated.' },
      )
    },
    deleteIssue(issueId) {
      const issue = get().data.issues.find((item) => item.id === issueId)
      if (!issue) {
        return
      }

      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              issues: data.issues.filter((item) => item.id !== issueId),
              resources: removeEntityResources(data, 'issue', issueId),
            },
            issue.projectId,
            timestamp,
          ),
        { tone: 'warning', message: 'Issue deleted. Linked files were not touched.' },
      )
    },
    createNote(projectId, values) {
      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              notes: [
                {
                  id: createId('note'),
                  projectId,
                  ...values,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
                ...data.notes,
              ],
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Note created.' },
      )
    },
    updateNote(noteId, values) {
      const timestamp = nowIso()
      const note = get().data.notes.find((item) => item.id === noteId)
      if (!note) {
        return
      }

      commit(
        (data) =>
          touchProject(
            {
              ...data,
              notes: data.notes.map((item) =>
                item.id === noteId ? { ...item, ...values, updatedAt: timestamp } : item,
              ),
            },
            note.projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Note updated.' },
      )
    },
    deleteNote(noteId) {
      const note = get().data.notes.find((item) => item.id === noteId)
      if (!note) {
        return
      }

      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              notes: data.notes.filter((item) => item.id !== noteId),
              resources: removeEntityResources(data, 'note', noteId),
            },
            note.projectId,
            timestamp,
          ),
        { tone: 'warning', message: 'Note deleted. Linked files were not touched.' },
      )
    },
    async createResource(projectId, values) {
      const timestamp = nowIso()
      const pathHealth = await checkPathHealth(values.path)
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              resources: [
                {
                  id: createId('resource'),
                  projectId,
                  ...values,
                  pathHealth,
                  isMissing: pathHealth === 'missing',
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
                ...data.resources,
              ],
            },
            projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Resource link added. The original file or folder was not modified.' },
      )
    },
    async updateResource(resourceId, values) {
      const timestamp = nowIso()
      const resource = get().data.resources.find((item) => item.id === resourceId)
      if (!resource) {
        return
      }

      const pathHealth = await checkPathHealth(values.path)
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              resources: data.resources.map((item) =>
                item.id === resourceId
                  ? {
                      ...item,
                      ...values,
                      pathHealth,
                      isMissing: pathHealth === 'missing',
                      updatedAt: timestamp,
                    }
                  : item,
              ),
            },
            resource.projectId,
            timestamp,
          ),
        { tone: 'success', message: 'Resource link updated.' },
      )
    },
    deleteResource(resourceId) {
      const resource = get().data.resources.find((item) => item.id === resourceId)
      if (!resource) {
        return
      }

      const timestamp = nowIso()
      commit(
        (data) =>
          touchProject(
            {
              ...data,
              resources: data.resources.filter((item) => item.id !== resourceId),
            },
            resource.projectId,
            timestamp,
          ),
        { tone: 'warning', message: 'Resource link removed. The original file or folder was not touched.' },
      )
    },
    importData(data) {
      const nextData = {
        ...data,
        exportedAt: undefined,
      }
      set({
        data: nextData,
        activeProjectId: nextData.settings.lastOpenedProjectId,
        activeView: nextData.settings.defaultView,
        toast: {
          id: createId('toast'),
          tone: 'success',
          message: 'Backup imported.',
        },
      })
      persist(nextData)
      void get().refreshResourceHealth()
    },
    exportData() {
      return {
        ...get().data,
        exportedAt: nowIso(),
      }
    },
    loadSampleData() {
      const data = createSampleData()
      set({
        data,
        activeProjectId: data.settings.lastOpenedProjectId,
        activeView: 'project',
        activeProjectTab: 'overview',
        toast: {
          id: createId('toast'),
          tone: 'success',
          message: 'Sample projects loaded.',
        },
      })
      persist(data)
    },
    clearData() {
      const data = createEmptyData()
      set({
        data,
        activeProjectId: undefined,
        activeView: 'dashboard',
        activeProjectTab: 'overview',
        toast: {
          id: createId('toast'),
          tone: 'warning',
          message: 'All PlanDesk data cleared. Local files were not touched.',
        },
      })
      persist(data)
    },
    updateSettings(settings) {
      commit(
        (data) => ({
          ...data,
          settings: {
            ...data.settings,
            ...settings,
          },
        }),
        { tone: 'success', message: 'Settings updated.' },
      )
    },
    async refreshResourceHealth() {
      const data = get().data
      const resources = await Promise.all(
        data.resources.map(async (resource) => {
          const pathHealth = await checkPathHealth(resource.path)
          return {
            ...resource,
            pathHealth,
            isMissing: pathHealth === 'missing',
          }
        }),
      )
      const projects = await Promise.all(
        data.projects.map(async (project) => {
          if (!project.rootFolderPath) {
            return { ...project, rootFolderStatus: undefined }
          }

          return {
            ...project,
            rootFolderStatus: await checkPathHealth(project.rootFolderPath),
          }
        }),
      )
      const nextData = { ...get().data, resources, projects }
      set({ data: nextData })
      persist(nextData)
    },
  }
})
