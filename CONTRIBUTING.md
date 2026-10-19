# Contributing

## Scope

This repository packages `persona-skill` for ClawHub and local OpenClaw workspaces.
Changes should preserve the skill's single responsibility: persona initialization only.

## Local Requirements

- Node.js `>=18.18`
- A `clawhub` CLI login if you intend to publish

## Common Commands

```bash
npm run test
npm run smoke:persona:runtime
npm run sync:local-openclaw
npm run sync:wsl
npm run publish:clawhub -- --dry-run
npm run publish:clawhub
```

If PowerShell blocks `npm.ps1`, use:

```bash
node --test tests
node ./scripts/release-clawhub.mjs
```

## Publishing Notes

1. Update the release version in `package.json`.
2. Review `docs/clawhub-publish-checklist.md`.
3. Run tests and the runtime smoke check before publishing.
4. If `openclaw` is not in `PATH`, set `OPENCLAW_BIN` first; if the default temp directory is not writable, set `OPENCLAW_SMOKE_TMPDIR`.
5. Publish from the repository root.
6. Run `npm run publish:clawhub -- --dry-run` to validate the runtime file set locally without invoking ClawHub. The publish wrapper uploads the same staged file set after tests pass.

## Runtime Bundle and Sync

- `scripts/runtime-bundle.mjs` owns the explicit runtime allowlist shared by publishing, local sync, Windows-to-WSL sync, and smoke installation.
- Add required runtime files there. Unlisted files are excluded even when placed inside `references/`, `assets/`, or `scripts/`.
- Regenerate `.clawhubignore` after changing the allowlist; tests reject drift:

```bash
node --input-type=module -e "import fs from 'node:fs'; import { renderClawHubIgnore } from './scripts/runtime-bundle.mjs'; fs.writeFileSync('.clawhubignore', renderClawHubIgnore())"
```

- Local sync uses Node's filesystem API and replaces only the installed skill directory, removing old helpers while leaving workspace persona files outside that directory intact.
- On Windows, `sync:wsl` uses `wsl.exe --exec` with argument arrays to reach the default distribution's current user. Install `rsync` inside that distribution first. On native Linux/macOS or inside WSL, the same command performs a local sync.
- Source paths come from the repository location, not the shell's current directory. Do not reintroduce shell command interpolation for paths or release metadata.
- The offline WSL transport tests use a subprocess emulator; a real Windows/WSL check is still required before claiming platform acceptance.

## Repository Conventions

- Keep runtime assets limited to the files referenced by `SKILL.md`.
- Keep maintainer-only files excluded in `.clawhubignore`.
- Do not add license terms that conflict with ClawHub's `MIT-0` distribution model.
- Keep execution-facing files and machine-facing metadata in English.
- Keep end-user and persona content aligned with the product language instead of mixing English structure with Chinese labels in the same contract layer.
