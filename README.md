# PlanDesk

**A local-first desktop project manager for individuals and small teams who want plans, tasks, files, and progress reports in one private workspace.**

PlanDesk organizes project work into milestones, tasks, issues, notes, linked local resources, calendar/timeline views, and exportable reports. Start from a blank project or a built-in template, customize the task workflow, link the files and folders you already use, then track what needs attention without setting up a server or account.

[Releases](https://github.com/zxyandreay/plan-desk/releases) | [User Guide](./docs/USER_GUIDE.md) | [Development Guide](./docs/DEVELOPMENT.md) | [Changelog](./CHANGELOG.md) | [Versioning](./VERSIONING.md)

## Highlights

- Dashboard and project workspaces for projects, milestones, tasks, issues, notes, resources, calendars, timelines, and reports.
- Built-in templates for student work, research papers, client websites, software/app development, event planning, content calendars, freelance work, and personal projects.
- Per-project task workflows with editable columns, workflow templates, board/list task views, and progress based on completed workflow columns.
- Focus, calendar, and timeline views for overdue work, due-soon tasks, project deadlines, milestones, and unscheduled items.
- Local file and folder links with desktop open/reveal actions, path health checks, and optional folder-template creation after confirmation.
- Markdown project reports, CSV task exports, and JSON backup import/export with validation before replacing local data.

## How It Works

1. Create a blank project or choose a template with starter milestones, tasks, notes, workflow columns, and optional folder recommendations.
2. Plan the project in workspace tabs for milestones, tasks, issues, notes, resources, calendar, timeline, and reports.
3. Link local files or folders as references so project context stays close to the work without copying the files.
4. Use focus, calendar, timeline, and dashboard views to find deadlines, blockers, missing resources, and recent work.
5. Export project reports, task lists, or a full JSON backup when you need to share status or preserve local data.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Desktop:** Tauri v2, Rust, NSIS Windows packaging
- **Data:** IndexedDB snapshot storage, Zod validation
- **State and UI:** Zustand, dnd-kit, lucide-react, date-fns
- **Tooling:** Vite, ESLint, TypeScript project references
- **Backend:** None; the current app runs locally in the browser preview or Tauri WebView

## Getting Started

### Requirements

- Node.js and npm
- A modern browser for the Vite preview
- Windows, Rust/Cargo, Microsoft C++ Build Tools, and WebView2 for native desktop builds

### Install and Run

```bash
git clone https://github.com/zxyandreay/plan-desk.git
cd plan-desk
npm install
npm run dev
```

Open `http://localhost:5173` if the browser does not open automatically.

The browser preview is useful for development and evaluation. Native file/folder pickers, open/reveal actions, and folder creation are available only in the Tauri desktop app.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite browser preview on port 5173 |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run build` | Typecheck and build the frontend |
| `npm run preview` | Preview the production frontend build locally |
| `npm run tauri:dev` | Run the Tauri desktop app in development |
| `npm run tauri:build` | Build the Tauri desktop app |
| `npm run version:check` | Confirm all version files match |
| `npm.cmd run desktop:setup` | Install/check Windows desktop build prerequisites |
| `npm.cmd run desktop:build` | Run checks, build the Windows installer, and collect release files |

See the [Development Guide](./docs/DEVELOPMENT.md) for desktop prerequisites, PowerShell notes, packaging details, and validation commands.

## Data, Privacy, and Security

- **Data storage:** PlanDesk stores app records in IndexedDB under the `plandesk-local` database.
- **Network use:** The app has no production backend, account system, sync service, or analytics integration in the current implementation.
- **Authentication:** Not applicable; projects are local to the browser profile or Tauri WebView data store.
- **Local file links:** File and folder paths are stored as plain text references. PlanDesk does not upload, recursively scan, move, rename, delete, or copy linked files.
- **Folder templates:** Desktop-only folder creation creates missing folders under a chosen root and refuses unsafe relative paths. Existing files are not overwritten.
- **Data loss:** Clearing browser/Tauri site data or using the in-app clear-data action removes PlanDesk records. JSON backups include project data and path strings, not the contents of linked files or folders.

## Project Structure

```text
plan-desk/
|-- .github/release.yml      # GitHub Release note categories
|-- docs/                    # User and development documentation
|-- public/                  # Static icons for the web preview
|-- scripts/                 # Version, prerequisite, and Windows release scripts
|-- src/                     # React application source
|-- src/data/                # Templates, schemas, sample data, and IndexedDB repository
|-- src/lib/                 # File-system and report helpers
|-- src-tauri/               # Tauri shell, Rust commands, permissions, and app icons
|-- CHANGELOG.md             # Release history
|-- LICENSE                  # Source-available license terms
|-- VERSIONING.md            # Version and release workflow notes
`-- package.json             # Scripts and JavaScript dependencies
```

## Documentation

- [User Guide](./docs/USER_GUIDE.md) - project workflow, templates, file links, exports, and browser/desktop differences
- [Development Guide](./docs/DEVELOPMENT.md) - setup, scripts, validation, Tauri development, and Windows packaging
- [Changelog](./CHANGELOG.md) - released changes
- [Versioning](./VERSIONING.md) - version files, release tags, and release checklist

## Status and Limitations

**Status:** Active source-available desktop project. Current app version: `1.3.0`.

- Windows is the configured packaged target. macOS and Linux desktop releases are not documented as tested outputs.
- The browser preview cannot open/reveal local paths or create folders; it stores manually entered paths as references.
- IndexedDB is the current storage backend. SQLite storage, activity history, PDF export, folder child-count previews, and keyboard shortcuts are not implemented.
- PlanDesk does not provide cloud sync, multi-user collaboration, remote authentication, hosted deployment, email, payment, or analytics services.
- No automated test script is currently defined in `package.json`; validation relies on version checks, typecheck, lint, and build.

## Contributing

Feedback and issue reports are welcome. This repository is maintained as a personal product and portfolio reference, so unsolicited feature pull requests may not be accepted.

## License

PlanDesk is source-available for viewing, learning, and portfolio review. The license does not permit copying, redistribution, publishing, resale, monetization, or commercial use without written permission.

See [LICENSE](./LICENSE) for the complete terms.

## Author

Built by [zxyandreay](https://github.com/zxyandreay).
