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

## Repository Conventions

- Keep runtime assets limited to the files referenced by `SKILL.md`.
- Keep maintainer-only files excluded in `.clawhubignore`.
- Do not add license terms that conflict with ClawHub's `MIT-0` distribution model.
- Keep execution-facing files and machine-facing metadata in English.
- Keep end-user and persona content aligned with the product language instead of mixing English structure with Chinese labels in the same contract layer.
