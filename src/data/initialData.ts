import type { AppData } from '../types/models'

export function createEmptyData(): AppData {
  return {
    version: 1,
    projects: [],
    workflowColumns: [],
    milestones: [],
    tasks: [],
    issues: [],
    notes: [],
    resources: [],
    settings: {
      theme: 'system',
      defaultView: 'dashboard',
    },
  }
}
