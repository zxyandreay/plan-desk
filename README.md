# PlanDesk

Plan projects. Track tasks. Finish work.

PlanDesk is a local-first desktop project management app that helps individuals and small teams organize projects, milestones, tasks, issues, notes, linked local files/folders, and progress reports without complicated setup.

It is Windows-first through Tauri, React, and TypeScript, with a portable architecture for macOS and Linux later.

## Features

- Dashboard with project cards, progress, due-soon work, recent projects, and attention counts.
- Project workspaces with Overview, Milestones, Tasks, Issues, Notes, Files / Resources, and Report views.
- CRUD for projects, milestones, tasks, issues, notes, and resource links.
- Task board and list views, including drag-and-drop status changes on the board.
- Focus view for overdue work, due today, due this week, high-priority tasks, blocked tasks, critical issues, and missing resource links.
- Project reports with copyable/downloadable Markdown, JSON backup export, and CSV task export.
- JSON import with validation and confirmation before replacing current local data.
- Optional sample projects for Client Website Redesign, Graduation Event Planning, and Research Paper.

## File And Folder Links

PlanDesk stores file and folder paths as references only. It does not upload, move, rename, or delete your actual files.

You can link files or folders to:

- Projects
- Milestones
- Tasks
- Issues
- Notes

Resource links support labels, descriptions, tags, linked section/entity, path health, open, reveal, copy path, edit, remove, and filters by type, section, missing status, tag, and search text.

In the Tauri desktop app, native file/folder pickers and open/reveal actions are handled through Tauri plugins. In the Vite browser preview, PlanDesk safely falls back to manual path entry and clipboard support where the browser allows it.

PlanDesk never recursively scans your computer and never modifies linked files or folders.

## Screenshots

Screenshots can be added here after packaging the first desktop release.

## Tech Stack

- Tauri v2 desktop shell
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- IndexedDB persistence
- Zod validation
- dnd-kit
- lucide-react
- date-fns

SQLite is intentionally deferred behind the data-access layer. The current app uses IndexedDB for a complete local-first MVP that runs in the available development environment.

## Local Setup

Install dependencies:

```sh
npm install
```

Start the web development preview:

```sh
npm run dev
```

Run type checking:

```sh
npm run typecheck
```

Run linting:

```sh
npm run lint
```

Build the frontend:

```sh
npm run build
```

## Tauri Development

Tauri source lives in `src-tauri`.

Run the desktop app:

```sh
npm run tauri:dev
```

Build the desktop app:

```sh
npm run tauri:build
```

Tauri requires Rust and Cargo. If `cargo` is not available on your PATH, install Rust from https://rustup.rs/ before running Tauri commands.

## Data And Storage

PlanDesk stores app data locally in IndexedDB under a single versioned snapshot. The data-access layer is isolated in `src/data`, so a SQLite-backed desktop repository can be added later without rewriting the UI.

Stored records include:

- Projects
- Milestones
- Tasks and subtasks
- Issues
- Notes
- Resource links
- App settings

Backups export these records as JSON. Linked file/folder paths are included as plain text references only; the actual files are not copied.

## Export And Import

Project reports can be exported as Markdown. Task lists can be exported as CSV. Full app backups can be exported/imported as JSON.

On import, PlanDesk validates the backup shape with Zod and asks for confirmation before replacing current data. Imported paths may not exist on the current computer; PlanDesk marks those links as missing instead of crashing.

## Project Structure

```text
src/
  app/
  components/
    dashboard/
    focus/
    issues/
    layout/
    milestones/
    notes/
    projects/
    reports/
    resources/
    settings/
    tasks/
    ui/
  data/
  hooks/
  lib/
  stores/
  types/
  utils/
src-tauri/
```

## Future Improvements

- SQLite storage backend for packaged desktop builds.
- Dark mode styling tied to the stored theme setting.
- Activity history.
- Project templates.
- PDF export.
- Optional shallow folder preview for direct child counts.
- Keyboard shortcuts for common creation and navigation actions.

## License

MIT license intended. Add a `LICENSE` file before publishing a formal release.
