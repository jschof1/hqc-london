# Client revision guard

`check.mjs` is a small Node CLI with no dependencies. It stops a client revision from touching files outside its frozen scope, and it stops a handover when the website no longer matches a recorded version.

```bash
node tools/client-revisions/check.mjs            # full check: required before handover or production
node tools/client-revisions/check.mjs --scope    # scope only: allowed for building a review preview
node --test tools/client-revisions/check.test.mjs
```

Options: `--packet <path>` (default `revisions/current.json`) and `--versions <path>` (default `revisions/versions.json`). Paths resolve from the git root. There is no `--force` flag and no environment variable to skip a check. Exit code `0` means pass and `1` means fail.

## Scope check (both modes)

- The packet must be committed at `HEAD` and the working copy must match it byte for byte. Its latest change must be a planning-only commit containing just the packet. Freeze the packet in its own planning commit before implementing. Updating it later is a separate committed planning step.
- The packet uses `schemaVersion: 1`. `baseline` must be a full 40-character commit hash and an ancestor of `HEAD`. It must equal the parent of the planning-only packet commit. Freeze the scope from that exact starting point; each authorised scope amendment starts a new baseline and planning commit. Keep earlier accepted requirements in the cumulative acceptance matrix. `request` must not be empty, and every requirement ID must be unique.
- Each `allowedFiles` entry needs an exact relative path (no globs, `..`, absolute paths or duplicates), at least one known requirement ID, and a boolean `allowDelete`.
- The baseline is compared separately with both the index and working tree. This covers committed, staged and unstaged edits, plus untracked files that are not ignored. Renames show as a delete plus an add. Every changed path must be listed, and a deletion also needs `allowDelete: true`. Output shows path counts and offending path names, never file contents.

The repository must contain the baseline, registered source commits and capture-manifest commits. Use a complete Git checkout with the relevant review branch fetched; missing evidence fails closed. CI uses `fetch-depth: 0`.

## Version check (full mode only)

The guard computes an application fingerprint: a SHA-256 over sorted paths and raw bytes. It covers tracked and untracked, non-ignored files in `src/`, `public/`, `functions/` and `scripts/`, plus `astro.config.*`, `tailwind.config.*`, `postcss.config.*`, `tsconfig.json`, `wrangler.toml|json|jsonc`, `package-lock.json`, and `package.json` with only `scripts` removed. Editing package scripts (for example to add this guard) does not create a fake new release. Dependency, lockfile or runtime changes do. Code under `tools/` and the separate CRM maintenance commands `scripts/hqc-{lead-controls,weekly-export,weekly-report}{,.test}.mjs` are excluded. Those commands do not form part of the deployed website and require their own operational evidence. Other scripts remain covered. Any symlink in the protected tree fails the check.

The index and working application fingerprints must agree at handover, so staged drift cannot hide behind restored working files. The current fingerprint must equal the fingerprint of at least one `versions[].commit` in `revisions/versions.json`, computed from git objects using the same method. For each matching version, the guard checks the following:

- `immutableDeploymentUrl` is `https://<8 hex>.hqc-london.pages.dev`.
- `reviewUrl` starts with `https://review.highqualityclean.co.uk/versions/`.
- The capture manifest is read from git at `captureManifest.commit:captureManifest.path`. It must contain the same version `id`, with the same `commit` and `immutableDeploymentUrl`. It needs at least one page, and every page needs desktop and mobile captures with SHA-256 values. Registry flags are not trusted on their own.

## Limits

- The guard detects which paths changed. It cannot tell whether an edit inside an allowed file goes beyond the request. A human review is still needed.
- It cannot confirm that the client or Jack approved the request. The packet text is trusted as written.
- It is not tamper-proof. Anyone who can push can edit the packet, the registry or this guard. Independent review and branch protection rules are separate and still required.
- It checks that capture SHA-256 values are present and well formed. It does not re-hash the capture images, which may live on another branch or host.
- Ignored files (for example a gitignored file under `src/`) are outside the fingerprint, as are line-ending conversions applied by git.
