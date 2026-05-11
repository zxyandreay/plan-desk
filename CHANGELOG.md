# Changelog

All meaningful fixes, additions, and release packaging changes should include an appropriate version bump across `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and visible app/version docs.

## 1.1.2 - 2026-05-11

- Rebuilt Windows release outputs with `PlanDesk` as the main binary name.
- Added a versioned direct EXE release artifact to avoid stale Windows Explorer icon cache entries.
- Refreshed the Windows shell icon cache at the end of the local release build script.
- Organized release versioning, annotated tag workflow, and GitHub release note configuration.
- Added `VERSIONING.md` and a version consistency check script.
- Documented historical tag reconstruction status and future release rules.

## 1.1.1 - 2026-05-11

- Updated the Windows app and installer icon to use the PlanDesk sidebar brand mark.
- Added the matching PlanDesk favicon for the Vite preview.

## 1.1.0 - 2026-05-11

- Refined the production UI system with semantic design tokens, calmer surfaces, and cohesive desktop spacing.
- Reworked dark mode around neutral dark grey backgrounds, dark panels, subtle borders, and restrained accent usage.
- Polished shared controls, navigation, dashboard, project workspace, tasks, resources, focus, reports, forms, modals, empty states, and settings.

## 1.0.1 - 2026-05-11

- Fixed Settings theme switching so System, Light, and Dark apply across the app and persist.
- Added production dark-mode styling for the existing interface.
- Polished local app wording and release build metadata.

## 1.0.0 - Historical / Unverified

- A `1.0.0` release was requested historically, but no commit in this repository confidently contains app version `1.0.0`.
- Do not reconstruct `v1.0.0` without stronger evidence.
