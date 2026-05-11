import type {
  IssueSeverity,
  IssueStatus,
  LinkedEntityType,
  MilestoneStatus,
  ProjectPriority,
  ProjectStatus,
  ResourceType,
  TaskPriority,
  TaskStatus,
} from './models'

export const projectStatuses: ProjectStatus[] = [
  'planning',
  'active',
  'on_hold',
  'completed',
  'archived',
]

export const projectPriorities: ProjectPriority[] = ['low', 'medium', 'high']

export const milestoneStatuses: MilestoneStatus[] = [
  'not_started',
  'in_progress',
  'completed',
]

export const taskStatuses: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'blocked',
  'done',
]

export const taskPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

export const issueSeverities: IssueSeverity[] = ['low', 'medium', 'high', 'critical']
export const issueStatuses: IssueStatus[] = ['open', 'monitoring', 'resolved']
export const resourceTypes: ResourceType[] = ['file', 'folder']
export const linkedEntityTypes: LinkedEntityType[] = [
  'project',
  'milestone',
  'task',
  'issue',
  'note',
]

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  archived: 'Archived',
}

export const projectPriorityLabels: Record<ProjectPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
}

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const issueSeverityLabels: Record<IssueSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const issueStatusLabels: Record<IssueStatus, string> = {
  open: 'Open',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
}

export const linkedEntityLabels: Record<LinkedEntityType, string> = {
  project: 'Project',
  milestone: 'Milestone',
  task: 'Task',
  issue: 'Issue',
  note: 'Note',
}

export const resourceTypeLabels: Record<ResourceType, string> = {
  file: 'File',
  folder: 'Folder',
}
