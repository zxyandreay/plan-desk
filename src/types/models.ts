import type { ColorToken } from './colors'

export type { ColorToken } from './colors'

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
export type ProjectPriority = 'low' | 'medium' | 'high'
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IssueStatus = 'open' | 'monitoring' | 'resolved'
export type ResourceType = 'file' | 'folder'
export type LinkedEntityType = 'project' | 'milestone' | 'task' | 'issue' | 'note'
export type ThemePreference = 'system' | 'light' | 'dark'
export type DefaultView = 'dashboard' | 'focus'
export type PathHealth = 'available' | 'missing' | 'unknown'

export interface Project {
  id: string
  name: string
  description: string
  category: string
  goal: string
  status: ProjectStatus
  priority: ProjectPriority
  color?: ColorToken
  startDate: string
  dueDate: string
  rootFolderPath?: string
  rootFolderStatus?: PathHealth
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  description: string
  status: MilestoneStatus
  color?: ColorToken
  dueDate: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  projectId: string
  milestoneId?: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  color?: ColorToken
  dueDate: string
  assignee?: string
  tags: string[]
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}

export interface Issue {
  id: string
  projectId: string
  relatedTaskId?: string
  title: string
  description: string
  severity: IssueSeverity
  status: IssueStatus
  color?: ColorToken
  resolutionNotes: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  projectId: string
  title: string
  content: string
  color?: ColorToken
  createdAt: string
  updatedAt: string
}

export interface ResourceLink {
  id: string
  projectId: string
  linkedEntityType: LinkedEntityType
  linkedEntityId?: string
  label: string
  type: ResourceType
  path: string
  description?: string
  color?: ColorToken
  tags: string[]
  isMissing?: boolean
  pathHealth?: PathHealth
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  theme: ThemePreference
  defaultView: DefaultView
  lastOpenedProjectId?: string
}

export interface AppData {
  version: 1
  projects: Project[]
  milestones: Milestone[]
  tasks: Task[]
  issues: Issue[]
  notes: Note[]
  resources: ResourceLink[]
  settings: AppSettings
  exportedAt?: string
}

export interface ProjectFormValues {
  name: string
  description: string
  category: string
  goal: string
  status: ProjectStatus
  priority: ProjectPriority
  color?: ColorToken
  startDate: string
  dueDate: string
  rootFolderPath?: string
}

export interface MilestoneFormValues {
  title: string
  description: string
  status: MilestoneStatus
  color?: ColorToken
  dueDate: string
}

export interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  color?: ColorToken
  dueDate: string
  milestoneId?: string
  assignee?: string
  tags: string[]
  subtasks: Subtask[]
}

export interface IssueFormValues {
  title: string
  description: string
  severity: IssueSeverity
  status: IssueStatus
  color?: ColorToken
  relatedTaskId?: string
  resolutionNotes: string
}

export interface NoteFormValues {
  title: string
  content: string
  color?: ColorToken
}

export interface ResourceFormValues {
  linkedEntityType: LinkedEntityType
  linkedEntityId?: string
  label: string
  type: ResourceType
  path: string
  description?: string
  color?: ColorToken
  tags: string[]
}
