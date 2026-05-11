import type {
  AppData,
  Issue,
  LinkedEntityType,
  Milestone,
  Project,
  ResourceLink,
  Task,
} from '../types/models'
import { isDueToday, isPastDate, isWithinNextDays } from './date'

export function getProjectTasks(data: AppData, projectId: string) {
  return data.tasks.filter((task) => task.projectId === projectId)
}

export function getProjectMilestones(data: AppData, projectId: string) {
  return data.milestones
    .filter((milestone) => milestone.projectId === projectId)
    .sort((a, b) => a.order - b.order)
}

export function getProjectIssues(data: AppData, projectId: string) {
  return data.issues.filter((issue) => issue.projectId === projectId)
}

export function getProjectNotes(data: AppData, projectId: string) {
  return data.notes.filter((note) => note.projectId === projectId)
}

export function getProjectResources(data: AppData, projectId: string) {
  return data.resources.filter((resource) => resource.projectId === projectId)
}

export function calculateProgress(tasks: Task[]) {
  if (tasks.length === 0) {
    return 0
  }

  return Math.round((tasks.filter((task) => task.status === 'done').length / tasks.length) * 100)
}

export function calculateMilestoneProgress(data: AppData, milestoneId: string) {
  return calculateProgress(data.tasks.filter((task) => task.milestoneId === milestoneId))
}

export function isTaskOverdue(task: Task) {
  return task.status !== 'done' && isPastDate(task.dueDate)
}

export function isTaskDueSoon(task: Task) {
  return task.status !== 'done' && isWithinNextDays(task.dueDate, 7)
}

export function isIssueBlocking(issue: Issue) {
  return issue.status !== 'resolved' && ['high', 'critical'].includes(issue.severity)
}

export function getDashboardStats(data: AppData) {
  const activeProjects = data.projects.filter((project) =>
    ['planning', 'active', 'on_hold'].includes(project.status),
  ).length
  const completedProjects = data.projects.filter((project) => project.status === 'completed').length
  const overdueTasks = data.tasks.filter(isTaskOverdue).length
  const blockedIssues = data.issues.filter((issue) => issue.status !== 'resolved').length
  const missingResources = data.resources.filter((resource) => resource.isMissing).length

  return {
    activeProjects,
    completedProjects,
    overdueTasks,
    blockedIssues,
    missingResources,
  }
}

export function getFocusItems(data: AppData) {
  const overdueTasks = data.tasks.filter(isTaskOverdue)
  const dueToday = data.tasks.filter((task) => task.status !== 'done' && isDueToday(task.dueDate))
  const dueThisWeek = data.tasks.filter(isTaskDueSoon)
  const highPriorityTasks = data.tasks.filter(
    (task) => task.status !== 'done' && ['high', 'urgent'].includes(task.priority),
  )
  const blockedTasks = data.tasks.filter((task) => task.status === 'blocked')
  const criticalIssues = data.issues.filter(isIssueBlocking)
  const missingResources = data.resources.filter((resource) => resource.isMissing)

  return {
    overdueTasks,
    dueToday,
    dueThisWeek,
    highPriorityTasks,
    blockedTasks,
    criticalIssues,
    missingResources,
  }
}

export function countOpenTasks(tasks: Task[]) {
  return tasks.filter((task) => task.status !== 'done').length
}

export function countOpenIssues(issues: Issue[]) {
  return issues.filter((issue) => issue.status !== 'resolved').length
}

export function linkedEntityName(
  data: AppData,
  resource: Pick<ResourceLink, 'linkedEntityType' | 'linkedEntityId' | 'projectId'>,
) {
  if (resource.linkedEntityType === 'project' || !resource.linkedEntityId) {
    return data.projects.find((project) => project.id === resource.projectId)?.name ?? 'Project'
  }

  const lookup: Record<Exclude<LinkedEntityType, 'project'>, { id: string; name: string }[]> = {
    milestone: data.milestones.map((milestone) => ({ id: milestone.id, name: milestone.title })),
    task: data.tasks.map((task) => ({ id: task.id, name: task.title })),
    issue: data.issues.map((issue) => ({ id: issue.id, name: issue.title })),
    note: data.notes.map((note) => ({ id: note.id, name: note.title })),
  }

  return lookup[resource.linkedEntityType].find((item) => item.id === resource.linkedEntityId)
    ?.name ?? 'Missing linked item'
}

export function projectForTask(data: AppData, task: Task) {
  return data.projects.find((project) => project.id === task.projectId)
}

export function projectForIssue(data: AppData, issue: Issue) {
  return data.projects.find((project) => project.id === issue.projectId)
}

export function resourceCountForEntity(
  resources: ResourceLink[],
  entityType: LinkedEntityType,
  entityId?: string,
) {
  return resources.filter((resource) => {
    if (entityType === 'project') {
      return resource.linkedEntityType === 'project'
    }

    return resource.linkedEntityType === entityType && resource.linkedEntityId === entityId
  }).length
}

export function recentlyUpdatedItems(
  projects: Project[],
  milestones: Milestone[],
  tasks: Task[],
  issues: Issue[],
  resources: ResourceLink[],
) {
  return [
    ...projects.map((item) => ({ label: item.name, kind: 'Project', updatedAt: item.updatedAt })),
    ...milestones.map((item) => ({ label: item.title, kind: 'Milestone', updatedAt: item.updatedAt })),
    ...tasks.map((item) => ({ label: item.title, kind: 'Task', updatedAt: item.updatedAt })),
    ...issues.map((item) => ({ label: item.title, kind: 'Issue', updatedAt: item.updatedAt })),
    ...resources.map((item) => ({ label: item.label, kind: 'Resource', updatedAt: item.updatedAt })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
}
