import { z } from 'zod'
import { colorTokens } from '../types/colors'

const pathHealthSchema = z.enum(['available', 'missing', 'unknown'])
const colorTokenSchema = z.enum(colorTokens)
const projectStatusSchema = z.enum(['planning', 'active', 'on_hold', 'completed', 'archived'])
const projectPrioritySchema = z.enum(['low', 'medium', 'high'])
const milestoneStatusSchema = z.enum(['not_started', 'in_progress', 'completed'])
const taskStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'review', 'blocked', 'done'])
const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
const issueSeveritySchema = z.enum(['low', 'medium', 'high', 'critical'])
const issueStatusSchema = z.enum(['open', 'monitoring', 'resolved'])
const linkedEntityTypeSchema = z.enum(['project', 'milestone', 'task', 'issue', 'note'])
const resourceTypeSchema = z.enum(['file', 'folder'])

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().catch(''),
  category: z.string().catch(''),
  goal: z.string().catch(''),
  status: projectStatusSchema.catch('planning'),
  priority: projectPrioritySchema.catch('medium'),
  color: colorTokenSchema.optional().catch(undefined),
  startDate: z.string().catch(''),
  dueDate: z.string().catch(''),
  rootFolderPath: z.string().optional(),
  rootFolderStatus: pathHealthSchema.optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const milestoneSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().catch(''),
  status: milestoneStatusSchema.catch('not_started'),
  color: colorTokenSchema.optional().catch(undefined),
  dueDate: z.string().catch(''),
  order: z.number().catch(0),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const subtaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completed: z.boolean().catch(false),
})

const taskSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  milestoneId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().catch(''),
  status: taskStatusSchema.catch('todo'),
  priority: taskPrioritySchema.catch('medium'),
  color: colorTokenSchema.optional().catch(undefined),
  dueDate: z.string().catch(''),
  assignee: z.string().optional(),
  tags: z.array(z.string()).catch([]),
  subtasks: z.array(subtaskSchema).catch([]),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const issueSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  relatedTaskId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().catch(''),
  severity: issueSeveritySchema.catch('medium'),
  status: issueStatusSchema.catch('open'),
  color: colorTokenSchema.optional().catch(undefined),
  resolutionNotes: z.string().catch(''),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const noteSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().catch(''),
  color: colorTokenSchema.optional().catch(undefined),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const resourceSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  linkedEntityType: linkedEntityTypeSchema.catch('project'),
  linkedEntityId: z.string().optional(),
  label: z.string().min(1),
  type: resourceTypeSchema.catch('folder'),
  path: z.string().min(1),
  description: z.string().optional(),
  color: colorTokenSchema.optional().catch(undefined),
  tags: z.array(z.string()).catch([]),
  isMissing: z.boolean().optional(),
  pathHealth: pathHealthSchema.optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).catch('system'),
  defaultView: z.enum(['dashboard', 'focus']).catch('dashboard'),
  lastOpenedProjectId: z.string().optional(),
})

export const appDataSchema = z.object({
  version: z.literal(1).catch(1),
  projects: z.array(projectSchema).catch([]),
  milestones: z.array(milestoneSchema).catch([]),
  tasks: z.array(taskSchema).catch([]),
  issues: z.array(issueSchema).catch([]),
  notes: z.array(noteSchema).catch([]),
  resources: z.array(resourceSchema).catch([]),
  settings: settingsSchema.catch({ theme: 'system', defaultView: 'dashboard' }),
  exportedAt: z.string().optional(),
})
