import { Clipboard, Download, FileJson, Table } from 'lucide-react'
import { useMemo } from 'react'
import { copyText } from '../../lib/fileSystem'
import { downloadTextFile, generateProjectMarkdown, generateTaskCsv } from '../../lib/report'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

interface ReportViewProps {
  projectId: string
}

export function ReportView({ projectId }: ReportViewProps) {
  const data = useAppStore((state) => state.data)
  const exportData = useAppStore((state) => state.exportData)
  const showToast = useAppStore((state) => state.showToast)
  const project = data.projects.find((item) => item.id === projectId)
  const markdown = useMemo(
    () => (project ? generateProjectMarkdown(data, project) : ''),
    [data, project],
  )

  if (!project) {
    return <EmptyState title="Project not found" message="The report cannot be generated." />
  }

  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const tasks = data.tasks.filter((task) => task.projectId === projectId)

  const copyReport = async () => {
    const result = await copyText(markdown)
    showToast(result.message, result.ok ? 'success' : 'error')
  }

  const exportFile = async (filename: string, content: string, type: string) => {
    const result = await downloadTextFile(filename, content, type)
    showToast(result.message, result.ok ? 'success' : 'error')
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">Report / Export</h3>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Export project progress and references. Files are not embedded or copied.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<Clipboard className="h-4 w-4" />} onClick={copyReport}>
            Copy Markdown
          </Button>
          <Button
            icon={<Download className="h-4 w-4" />}
            onClick={() =>
              void exportFile(`${safeName || 'project'}-report.md`, markdown, 'text/markdown')
            }
          >
            Download .md
          </Button>
          <Button
            icon={<Table className="h-4 w-4" />}
            onClick={() =>
              void exportFile(`${safeName || 'project'}-tasks.csv`, generateTaskCsv(tasks), 'text/csv')
            }
          >
            CSV tasks
          </Button>
          <Button
            icon={<FileJson className="h-4 w-4" />}
            onClick={() =>
              void exportFile(
                'plandesk-backup.json',
                JSON.stringify(exportData(), null, 2),
                'application/json',
              )
            }
          >
            JSON backup
          </Button>
        </div>
      </div>
      <div className="pd-panel p-4">
        <textarea
          aria-label="Markdown report"
          readOnly
          value={markdown}
          className="pd-input h-[60vh] w-full resize-none p-4 font-mono text-sm leading-6"
        />
      </div>
    </section>
  )
}
