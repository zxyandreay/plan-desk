import { Download, FileJson, Info, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { validateImportedData } from '../../data/localRepository'
import { downloadTextFile } from '../../lib/report'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { SelectField } from '../ui/Field'

export function SettingsView() {
  const data = useAppStore((state) => state.data)
  const exportData = useAppStore((state) => state.exportData)
  const importData = useAppStore((state) => state.importData)
  const clearData = useAppStore((state) => state.clearData)
  const loadSampleData = useAppStore((state) => state.loadSampleData)
  const updateSettings = useAppStore((state) => state.updateSettings)
  const showToast = useAppStore((state) => state.showToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isClearOpen, setClearOpen] = useState(false)
  const [isSampleOpen, setSampleOpen] = useState(false)

  const exportBackup = () => {
    downloadTextFile(
      'plandesk-backup.json',
      JSON.stringify(exportData(), null, 2),
      'application/json',
    )
  }

  const importBackup = async (file: File | undefined) => {
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsed = validateImportedData(JSON.parse(text))
      const confirmed = window.confirm(
        'Importing this backup will replace the current PlanDesk data in this browser profile. Continue?',
      )
      if (!confirmed) {
        return
      }

      importData(parsed)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Invalid backup file.', 'error')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
      <header>
        <p className="text-sm font-medium text-blue-700">Local-first settings</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">Settings</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Manage backups, sample data, and local file-link behavior.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Preferences</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SelectField
            label="Theme"
            value={data.settings.theme}
            onChange={(event) =>
              updateSettings({ theme: event.target.value as typeof data.settings.theme })
            }
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </SelectField>
          <SelectField
            label="Default view"
            value={data.settings.defaultView}
            onChange={(event) =>
              updateSettings({ defaultView: event.target.value as typeof data.settings.defaultView })
            }
          >
            <option value="dashboard">Dashboard</option>
            <option value="focus">Focus</option>
          </SelectField>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Backup / Import</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          JSON backups include projects, milestones, tasks, issues, notes, resource links, settings,
          and local paths as plain text references. They do not copy the actual files or folders.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button icon={<Download className="h-4 w-4" />} onClick={exportBackup}>
            Export JSON backup
          </Button>
          <Button icon={<Upload className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()}>
            Import JSON backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void importBackup(event.target.files?.[0])}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">Data tools</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button icon={<FileJson className="h-4 w-4" />} onClick={() => setSampleOpen(true)}>
            Load sample projects
          </Button>
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setClearOpen(true)}>
            Clear data
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <h3 className="text-base font-semibold text-blue-950">How local file links work</h3>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              PlanDesk stores file and folder paths as references only. It does not upload, move,
              rename, delete, or recursively scan your actual files. If a linked path is missing on
              this computer, PlanDesk marks it as missing and lets you update or remove the link.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">About</h3>
        <p className="mt-2 text-sm text-slate-600">
          PlanDesk 0.1.0 · Local-first project workspace for individuals and small teams.
        </p>
      </section>

      <ConfirmDialog
        title="Load sample projects"
        message="This replaces current PlanDesk data with sample projects. Local files and folders are not touched."
        confirmLabel="Load samples"
        isOpen={isSampleOpen}
        onCancel={() => setSampleOpen(false)}
        onConfirm={() => {
          loadSampleData()
          setSampleOpen(false)
        }}
      />
      <ConfirmDialog
        title="Clear PlanDesk data"
        message="This removes all PlanDesk records from local storage. It does not delete any actual files or folders from your computer."
        confirmLabel="Clear data"
        isOpen={isClearOpen}
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          clearData()
          setClearOpen(false)
        }}
      />
    </div>
  )
}
