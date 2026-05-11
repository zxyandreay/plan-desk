import type { AppData } from '../types/models'

export function createEmptyData(): AppData {
  return {
    version: 1,
    projects: [],
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
