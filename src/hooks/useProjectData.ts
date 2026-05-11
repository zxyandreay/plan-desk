import { useMemo } from 'react'
import { useAppStore } from '../stores/appStore'
import {
  getProjectIssues,
  getProjectMilestones,
  getProjectNotes,
  getProjectResources,
  getProjectTasks,
} from '../utils/metrics'

export function useProjectData(projectId: string) {
  const data = useAppStore((state) => state.data)

  return useMemo(
    () => ({
      project: data.projects.find((item) => item.id === projectId),
      milestones: getProjectMilestones(data, projectId),
      tasks: getProjectTasks(data, projectId),
      issues: getProjectIssues(data, projectId),
      notes: getProjectNotes(data, projectId),
      resources: getProjectResources(data, projectId),
    }),
    [data, projectId],
  )
}
