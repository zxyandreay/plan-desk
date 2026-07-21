# PlanDesk User Guide

PlanDesk is designed for local project planning where project records, file links, and exports stay on the device you use to run the app.

## Normal Workflow

1. Create a project from a blank slate or a built-in template.
2. Add dates, goals, milestones, tasks, issues, notes, and linked resources.
3. Use the project workspace tabs to plan, update, and review the work.
4. Use the dashboard, focus view, calendar, and timeline to find deadlines and blockers.
5. Export reports, CSV task lists, or JSON backups when you need to share or preserve data.

## Project Templates

PlanDesk includes templates for:

- Blank Project
- Student Project
- Research Paper
- Client Website
- Software/App Development
- Event Planning
- Content Calendar
- Freelance Client Work
- Home / Personal Project

Templates can add starter milestones, tasks, issues, notes, workflow columns, color accents, and folder-template recommendations. The blank project template remains available when you want to start from scratch.

## Project Workspace

Each project has tabs for:

- **Overview:** summary, progress, quick actions, and recent activity.
- **Milestones:** ordered phases with due dates and progress.
- **Tasks:** board and list views for project tasks.
- **Issues:** project risks, blockers, and resolution notes.
- **Notes:** freeform project notes.
- **Files / Resources:** file and folder path references.
- **Calendar:** dated project, milestone, and task items.
- **Timeline:** project phases, scheduled tasks, and unscheduled work.
- **Report:** Markdown, CSV, and JSON export actions.

## Tasks and Workflows

Each project can have its own workflow columns. Columns can be added, renamed, reordered, recolored, marked as completed, and removed after tasks are moved to another column.

Built-in workflow templates include:

- Standard
- Simple
- Student
- Design
- Content
- Client Work
- Event Planning
- Software Development

Task progress is calculated from workflow columns marked as completed, so completion is not tied to a single hardcoded status name.

## Calendar, Timeline, and Focus

The global calendar shows dated project deadlines, milestone due dates, and task due dates across all projects. Project workspaces also include project-specific calendar and timeline views.

The focus view groups work that needs attention, including overdue tasks, tasks due today, tasks due this week, high-priority tasks, blocked tasks, critical issues, and missing resource links.

## File and Folder Links

PlanDesk stores file and folder paths as references only. It does not upload, move, rename, delete, copy, or recursively scan your actual files.

Resource links can be attached to:

- Projects
- Milestones
- Tasks
- Issues
- Notes

Resource records can include labels, descriptions, tags, colors, linked entity details, path health, and file/folder type.

In the Tauri desktop app, PlanDesk can use native dialogs to choose files or folders, open linked paths, reveal linked paths in Explorer, and check whether paths exist. In the Vite browser preview, those actions are limited by browser permissions, so PlanDesk falls back to manual path entry, downloads, and clipboard support where available.

## Folder Templates

Folder templates help create organized local folder structures such as:

- Documents / Resources / Outputs
- Client Website folders
- Software/App Development folders
- Student Project folders
- Research Paper folders
- Event Planning folders
- Content Calendar folders
- Freelance Client Work folders

Folder creation is a desktop-only action. PlanDesk creates folders only after confirmation, only under the chosen root folder, and only for safe relative folder paths. Existing folders are linked without being modified, and existing files are not overwritten.

Backups store folder paths only. They do not include folder contents.

## Reports, Exports, and Backups

PlanDesk can export:

- Project reports as Markdown
- Project task lists as CSV
- Full app backups as JSON

JSON backups include projects, workflow columns, milestones, tasks and subtasks, issues, notes, resource links, settings, and plain text file/folder paths. They do not include the actual files or folder contents.

When importing a JSON backup, PlanDesk validates the file shape with Zod and asks for confirmation before replacing current local app data. Imported paths may not exist on the current computer; missing paths are marked as missing instead of crashing the app.

## Sample Data

PlanDesk can load sample projects for:

- Client Website Redesign
- Graduation Event Planning
- Research Paper

Loading sample data replaces the current PlanDesk local records. It does not touch actual files or folders on your computer.

## Data Safety

PlanDesk records are local to the environment where the app runs. Clearing browser data, clearing Tauri WebView data, switching browser profiles, uninstalling app data, or using the in-app clear-data action can remove PlanDesk records.

Use JSON backup export before clearing data or moving to another machine. Keep in mind that backups preserve path strings, not linked file or folder contents.
