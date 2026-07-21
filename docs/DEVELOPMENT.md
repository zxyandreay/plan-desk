# PlanDesk Development Guide

This guide covers local development, validation, and Windows desktop packaging for PlanDesk.

## Requirements

- Node.js and npm
- A modern browser for the Vite preview
- Rust and Cargo for Tauri development
- Microsoft Visual Studio C++ Build Tools for Windows desktop builds
- WebView2 Runtime for running the Windows desktop app
- `winget` if you want to use the Windows prerequisite setup script

No `.env` file is required in the current repository.

## Install

```bash
git clone https://github.com/zxyandreay/plan-desk.git
cd plan-desk
npm install
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks the `npm` PowerShell shim.

## Browser Preview

```bash
npm run dev
```

The Vite dev server uses port `5173` with `strictPort` enabled. Open `http://localhost:5173` if the browser does not open automatically.

The browser preview is useful for UI development and evaluation, but it cannot perform native desktop file actions. It stores manually entered file/folder paths as references and uses browser downloads for exports.

## Tauri Desktop Development

Tauri source lives in `src-tauri/`.

```bash
npm run tauri:dev
```

The Tauri config starts the Vite dev server through `npm.cmd run dev` and loads `http://localhost:5173` in a desktop window.

Native desktop commands currently provide:

- path existence checks
- text-file saves for exports
- safe folder-template creation under a chosen root folder
- native file/folder dialogs through Tauri plugins
- open/reveal path actions through Tauri plugins
- clipboard writes through a Tauri plugin

## Windows Desktop Setup

Run the prerequisite helper once on Windows:

```powershell
npm.cmd run desktop:setup
```

The script checks for `winget`, installs Rustup when needed, selects the stable MSVC Rust toolchain, checks or installs Visual Studio C++ Build Tools, and checks for WebView2. Restart PowerShell after installing Rust or Build Tools so `cargo`, `rustc`, and MSVC tools are available.

## Windows Packaging

```powershell
npm.cmd run desktop:build
```

The release script:

1. Installs JavaScript dependencies.
2. Runs `npm.cmd run typecheck`.
3. Runs `npm.cmd run lint`.
4. Builds the Tauri NSIS installer.
5. Copies release files into `release/`.

For version `1.3.0`, the expected release output names are:

```text
release/
|-- PlanDesk_1.3.0_x64-setup.exe
|-- PlanDesk_1.3.0_x64.exe
`-- PlanDesk.exe
```

The installer is configured as a current-user NSIS installer and includes the offline WebView2 installer mode through Tauri.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite browser preview |
| `npm run build` | Run TypeScript build mode and create the production frontend bundle |
| `npm run lint` | Run ESLint across the repository |
| `npm run preview` | Preview the production frontend build |
| `npm run typecheck` | Run TypeScript build mode without pretty output |
| `npm run tauri` | Call the Tauri CLI |
| `npm run tauri:dev` | Run the Tauri desktop app in development |
| `npm run tauri:build` | Build the Tauri desktop app |
| `npm run version:check` | Confirm version references match `package.json` |
| `npm run release:build` | Alias for `npm.cmd run desktop:build` |
| `npm.cmd run desktop:setup` | Install/check Windows desktop prerequisites |
| `npm.cmd run desktop:build` | Run checks, build NSIS, and collect release artifacts |

## Data Model and Storage

PlanDesk stores a single versioned app snapshot in IndexedDB:

- database: `plandesk-local`
- object store: `snapshots`
- key: `current`
- schema version: `1`

Stored records include:

- projects
- workflow columns
- milestones
- tasks and subtasks
- issues
- notes
- resource links
- app settings

The data-access layer is isolated in `src/data/`. Import and save operations validate data through the Zod schema in `src/data/schema.ts`.

## Validation

Run the available checks before release or documentation updates:

```bash
npm.cmd run version:check
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

There is no automated test script defined in `package.json` at this time.

## Release Notes and Versioning

- Use [CHANGELOG.md](../CHANGELOG.md) for released changes.
- Use [VERSIONING.md](../VERSIONING.md) for version files, annotated tag rules, and release workflow details.

Release tags use `vX.Y.Z`, and version references are expected to stay aligned across `package.json`, `package-lock.json`, Tauri config, Cargo files, and `src/utils/version.ts`.
