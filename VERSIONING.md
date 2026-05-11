# PlanDesk Versioning

PlanDesk uses semantic versioning:

```text
MAJOR.MINOR.PATCH
```

- `MAJOR`: breaking changes, major redesigns, storage-breaking migrations, or incompatible changes.
- `MINOR`: meaningful new features, substantial UI/UX improvements, new app sections, new workflows, or major release improvements.
- `PATCH`: bug fixes, small UI polish, small behavior fixes, dependency updates, minor improvements, and release packaging fixes.

## Tag Format

All release tags must be annotated Git tags using:

```text
vX.Y.Z
```

Examples:

- `v1.0.0`
- `v1.0.1`
- `v1.1.0`
- `v1.1.1`
- `v1.1.2`

Use annotated tags only:

```sh
git tag -a vX.Y.Z -m "PlanDesk vX.Y.Z"
```

## Release Commit Rule

Every official release must have:

- updated version in all app/config files
- clean release commit
- annotated Git tag
- pushed commit
- pushed tag
- generated Windows installer artifact
- GitHub Release entry
- release notes

Recommended release commit format:

```text
Release vX.Y.Z: short summary
```

Examples:

- `Release v1.1.1: apply PlanDesk app icons`
- `Release v1.1.2: fix Windows release icons`
- `Release v1.2.0: add project templates`

For normal non-release commits, use clear conventional-style messages when practical:

- `feat: add project templates`
- `fix: correct theme persistence`
- `ui: refine dashboard cards`
- `docs: update release workflow`
- `chore: organize version tagging`
- `build: update installer config`

## Future Update Workflow

Every future PlanDesk update should follow this checklist:

1. Decide the version bump.
2. Update all version files.
3. Update `CHANGELOG.md`.
4. Run `npm run version:check`.
5. Run lint, typecheck, and build checks.
6. Rebuild the Windows installer.
7. Commit using a release message.
8. Create an annotated tag.
9. Push the branch.
10. Push the tag.
11. Create a GitHub Release.
12. Upload installer artifacts.

Do not tag unfinished work. Do not create a release tag before the app builds successfully. Do not reuse the same version number for different builds. Do not force-update published tags unless correcting a serious release mistake.

## Version Files

Keep these app version references aligned:

- `package.json`
- `package-lock.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src/utils/version.ts`
- visible README/release artifact references when they mention the current version

## Historical Versions

| Version | Tag | Type | Notes | Status |
|---|---|---|---|---|
| 1.0.0 | v1.0.0 | Initial release | Requested historical version, but no commit in this repository confidently contains app version `1.0.0`; earliest clear commits contain `0.1.0`. | Missing / unverified; do not reconstruct without stronger evidence |
| 1.0.1 | v1.0.1 | Patch | Theme switching fix and production UI polish release. | Reconstructed from commit `e5c77ba` |
| 1.1.0 | v1.1.0 | Minor | Dark mode and production UI refinement release. | Reconstructed from commit `9506fee` |
| 1.1.1 | v1.1.1 | Patch | PlanDesk app and installer icon release. | Reconstructed from commit `b34954c` |
| 1.1.2 | v1.1.2 | Patch | Windows release icon and versioned EXE release; release workflow organization. | Existing |
| 1.1.3 | v1.1.3 | Patch | Report export and backup download fix release. | Current release |
