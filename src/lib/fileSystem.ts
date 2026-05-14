import type { PathHealth, ResourceType } from '../types/models'

type ActionResult = {
  ok: boolean
  message: string
}

export interface FolderCreateRequestItem {
  id: string
  name: string
  path: string
}

export interface FolderCreateResultItem {
  id: string
  name: string
  relativePath: string
  path: string
  status: 'created' | 'existing' | 'failed'
  message?: string
}

export interface FolderCreateResult extends ActionResult {
  results: FolderCreateResultItem[]
}

export function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function normalizePickerResult(result: string | string[] | null) {
  if (Array.isArray(result)) {
    return result[0] ?? null
  }

  return result
}

export async function chooseFolder() {
  if (!isTauriRuntime()) {
    return window.prompt('Paste the folder path to link in PlanDesk')?.trim() || null
  }

  const { open } = await import('@tauri-apps/plugin-dialog')
  const result = await open({
    directory: true,
    multiple: false,
    title: 'Choose folder to link in PlanDesk',
  })
  return normalizePickerResult(result)
}

export async function chooseFile() {
  if (!isTauriRuntime()) {
    return window.prompt('Paste the file path to link in PlanDesk')?.trim() || null
  }

  const { open } = await import('@tauri-apps/plugin-dialog')
  const result = await open({
    directory: false,
    multiple: false,
    title: 'Choose file to link in PlanDesk',
  })
  return normalizePickerResult(result)
}

export async function copyText(text: string): Promise<ActionResult> {
  try {
    if (isTauriRuntime()) {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager')
      await writeText(text)
      return { ok: true, message: 'Copied to clipboard.' }
    }
  } catch {
    // Fall through to browser/DOM clipboard fallbacks.
  }

  try {
    await navigator.clipboard.writeText(text)
    return { ok: true, message: 'Copied to clipboard.' }
  } catch {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (copied) {
        return { ok: true, message: 'Copied to clipboard.' }
      }
    } catch {
      // Return a stable, user-facing error below.
    }

    return {
      ok: false,
      message: 'Could not copy to clipboard.',
    }
  }
}

export async function openLinkedPath(path: string): Promise<ActionResult> {
  if (!isTauriRuntime()) {
    return {
      ok: false,
      message: 'Opening local paths is available in the desktop app. The browser preview keeps paths as references.',
    }
  }

  try {
    const { openPath } = await import('@tauri-apps/plugin-opener')
    await openPath(path)
    return { ok: true, message: 'Opened linked path.' }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not open linked path.',
    }
  }
}

export async function revealLinkedPath(path: string): Promise<ActionResult> {
  if (!isTauriRuntime()) {
    return {
      ok: false,
      message: 'Reveal in Explorer is available in the desktop app.',
    }
  }

  try {
    const { revealItemInDir } = await import('@tauri-apps/plugin-opener')
    await revealItemInDir(path)
    return { ok: true, message: 'Revealed linked path.' }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not reveal linked path.',
    }
  }
}

export async function checkPathHealth(path: string): Promise<PathHealth> {
  if (!path.trim()) {
    return 'unknown'
  }

  if (path.startsWith('Demo path:')) {
    return 'missing'
  }

  if (!isTauriRuntime()) {
    return 'unknown'
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const exists = await invoke<boolean>('path_exists', { path })
    return exists ? 'available' : 'missing'
  } catch {
    return 'unknown'
  }
}

export async function choosePathForType(type: ResourceType) {
  return type === 'folder' ? chooseFolder() : chooseFile()
}

export async function createDirectoriesFromTemplate(
  rootPath: string,
  folders: FolderCreateRequestItem[],
): Promise<FolderCreateResult> {
  if (!isTauriRuntime()) {
    return {
      ok: false,
      message:
        'Folder template creation is available in the desktop app. Browser preview mode can only store folder paths as references.',
      results: [],
    }
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const results = await invoke<FolderCreateResultItem[]>('create_directories', {
      rootPath,
      folders: folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        relativePath: folder.path,
      })),
    })
    const failedCount = results.filter((result) => result.status === 'failed').length
    return {
      ok: failedCount === 0,
      message: failedCount
        ? `Folder template finished with ${failedCount} issue${failedCount === 1 ? '' : 's'}.`
        : 'Folder template created and checked.',
      results,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not create folder template.',
      results: [],
    }
  }
}
