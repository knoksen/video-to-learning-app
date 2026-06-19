# Windows Installer Plan (Future Work)

## Status
Planned only. Not implemented in MVP.

## Why deferred
A stable frontend UX is required before desktop packaging decisions are finalized.

## Proposed milestone
- Evaluate after M2 frontend and post-M3 stabilization.

## Packaging options under consideration
1. **Tauri** (preferred first evaluation)
   - Smaller bundle size
   - Native-feeling shell around web UI
2. **Electron**
   - Mature ecosystem
   - Larger runtime footprint

## Scope proposal
1. Define desktop app requirements (offline capabilities, auto-update policy, file export paths).
2. Select packaging stack (Tauri/Electron) based on footprint, security, and maintenance.
3. Add signed Windows build pipeline.
4. Produce `.exe` installer with versioning and rollback guidance.
5. Add smoke tests for install/launch/update/uninstall.

## Security and trust considerations
- Sign binaries before public distribution.
- Clearly separate local cached data from canonical backend report data.
- Do not ship secrets in packaged assets.

## Exit criteria
- Installer builds reproducibly.
- App installs/uninstalls cleanly.
- Versioned upgrades work.
- Basic trust-report flow functions in packaged desktop mode.
