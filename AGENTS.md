## Learned User Preferences

- Use non-www HTTPS as the canonical host for this site: `https://highqualityclean.co.uk`.
- Keep discount form URL params and internal values compatible as `home` / `commercial`, but send webhook payload `type` values as `Residential` / `Commercial`.

## Learned Workspace Facts

- This Astro 5 site deploys to Cloudflare Pages with `@astrojs/cloudflare`, `output: 'server'`, `pages_build_output_dir = "dist"`, and GitHub pushes to the connected branch auto-deploy.
- Canonical URLs should be lowercase, trailing-slash, non-www HTTPS URLs, with duplicate legacy area and service paths redirected directly to final canonical URLs where possible.
- Public phone details should show the GBP-aligned landline `0208 870 3925` / `+44208703925`; calls forward to `07427 925266`, but the mobile should not be displayed publicly.
- The discount form posts to `/api/discount`, which reads the Cloudflare Pages secret `DISCOUNT_FORM_WEBHOOK`; changing that secret requires a fresh Pages deployment before production uses the new value.
- Location landing pages are prerendered static HTML under `/locations/london/[area]/` and `/locations/surrey/[area]/`; the sitemap injection script should skip URLs already emitted by Astro sitemap to avoid duplicates.

## Mandatory client revision controls

Use `/Users/jack/.agents/skills/client-revision-gauntlet/SKILL.md` for every client revision. Recover the exact current request from the native thread when available; do not ask Jack to repeat evidence already supplied. A new request adds to the cumulative accepted baseline. It never replaces earlier accepted requirements unless Jack or Pedro explicitly requests that replacement.

### Before editing

1. Read the complete current request, prior accepted requirements and outstanding items. Choose the exact baseline commit and immutable preview. Production, a review candidate and client acceptance are separate states. Do not assume the newest branch is accepted.
2. Commit `revisions/current.json` as a planning-only change BEFORE implementation. Set its baseline to the exact pre-planning HEAD. Record the source request, numbered requirements, exact allowed file paths, any explicitly requested deletions, preserved behaviour and verification. Keep accepted website versions as separate source references when they differ from the working baseline. Keep client emails and private access links out of this public repository. Record a private evidence reference rather than the full email.
3. Every changed file and meaningful diff hunk must map to a specific request. Do not redesign, tidy, refactor, replace assets, remove sections or rewrite unrelated copy. Preserve existing photos, layout, claims, forms, routing, tracking, schema, redirects and operational improvements outside the request. A whole page being allowed does not authorise changing everything in it.
4. If an unrequested change seems necessary, stop that part and explain the specific dependency. Finish independent authorised work. A newly expanded file list requires a separate planning commit and matching explicit authority; do not edit the packet to disguise drift.

### During implementation and verification

- Run `npm run check:revision:scope` while editing. Unlisted and nonignored untracked files fail. Deletions require an explicit per-file permission in the frozen packet. Renames are a deletion plus an addition.
- Review the complete diff against the accepted baseline AND the newer operational improvements. Do not restore an obsolete version wholesale. Keep an acceptance matrix of each requested item and the earlier requirements it could affect.
- Use a separate implementation owner and a fresh independent reviewer for material revisions. The reviewer checks every hunk against the request, preserved content and behaviour, including unintended removals inside allowed files. Use the other provider when available under the session's delegation rules. Record findings and fixes; an agent's completion claim is not evidence.
- Check changed pages on desktop and mobile, including relevant forms and the full downstream journey when routing or automation changes. Source checks and screenshots cannot prove CRM delivery, payment, client approval or a successful enquiry. Record each remaining gate honestly.

### Keep visual versions ready

- Every website revision handed over or released must have an exact source commit, immutable Pages deployment, dated desktop/mobile captures of affected pages, factual change notes and outstanding items in the version review at `https://review.highqualityclean.co.uk/versions/`.
- Maintain the review tool in `tools/photo-review/` on `codex/hqc-visual-version-review-2026-10-29` until it is deliberately integrated. Operator instructions are `tools/photo-review/VERSION_REVIEW.md` there. Do not merge that branch wholesale into production: its Phase 8 application is held.
- Append a new version to its manifest; never overwrite or delete earlier snapshots, comments or photo selections. Record capture time separately from release date. For unchanged application source, retain its existing visual version and record operational changes in the revision evidence; do not invent a new visual release.
- After publishing and reading back the review room, update `revisions/versions.json` with the source commit, immutable deployment and the committed capture manifest. Run `npm run check:revision` before client handover or production release. `build:review` is an explicitly incomplete preview build and grants no release or handover permission.
- The guard checks exact file scope and recorded source/manifest consistency. It does not authenticate Jack's approval, prove a live deployment or catch every unintended semantic change. Independent review, hosted readback and protected branch settings remain separate requirements. Never claim an absolute prevention guarantee.

### Release and communication

Changes to protected `main` must go through a pull request and the required `revision-controls` check. Do not disable branch protection, bypass the check or force-push to finish a task.

Keep Phase 8's existing production hold until enquiry reconciliation, booking/payment and Pedro's acceptance gates have direct evidence. Do not bypass or remove its release guard. Commit and push authorised work, then distinguish source, deployment, provider behaviour and client acceptance in the handover.

Prepare client messages with the current native recipient, account, full text and attachments. Show Jack the exact current draft and wait for his explicit approval before sending. Never settle or archive a conversation; only Jack may do that in the interface.
