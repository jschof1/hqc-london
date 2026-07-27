# HQC Finish Plan - 2026-06-29

## Current Position

The project is not at production launch yet, but it is past strategy and into preview review.

The current production site still uses the older luxury-led homepage positioning:

- title: `Luxury Cleaning Services London | High Quality Clean`
- H1: `Where Profound Care Meets Perfected Detail`

The current Cloudflare Pages development preview is live at:

- `https://hqc-development-site.hqc-london.pages.dev/`

That preview is intentionally `noindex, nofollow` and returns `200` for the main updated routes.

## What Is Built On Preview

Implemented on `origin/hqc-development-site`:

- homepage rewritten around cleaning-led buyer routes
- new route hubs:
  - `/property-and-facilities-cleaning/`
  - `/home-cleaning/`
  - `/commercial-and-wellness-cleaning/`
- priority service pages:
  - `/services/end-of-tenancy-cleaning/`
  - `/services/post-renovation-cleaning/`
  - `/services/end-of-tenancy-cleaning-wandsworth/`
  - `/services/estate-and-lettings-agents-cleaning/`
  - `/services/void-and-post-tenancy-cleaning/`
  - `/services/block-management-cleaning/`
- redirects for legacy/service/area URLs
- claim ledger in `src/data/claims.ts` to prevent unsupported proof claims from leaking into public copy
- noindex handling for Cloudflare preview hosts

## Verified Preview Routes

Checked 2026-06-29:

- `/` -> `200`, noindex
- `/property-and-facilities-cleaning/` -> `200`, noindex
- `/home-cleaning/` -> `200`, noindex
- `/commercial-and-wellness-cleaning/` -> `200`, noindex
- `/services/post-renovation-cleaning/` -> `200`, noindex
- `/services/end-of-tenancy-cleaning/` -> `200`, noindex
- `/services/estate-and-lettings-agents-cleaning/` -> `200`, noindex
- `/services/block-management-cleaning/` -> `200`, noindex
- `/services/void-and-post-tenancy-cleaning/` -> `200`, noindex
- `/quote/` -> `200`, noindex
- `/contact/` -> `200`, noindex
- `/discount/` -> `200`, noindex
- `/areas/` -> `200`, noindex
- `/case-studies/` -> `200`, noindex

Known gap:

- `/services/developer-handover-cleaning/` -> `404`

This is notable because the Phase 3 page brief expected Developer Handover Cleaning to be part of the Property and Facilities route.

## Repo State

Current local branch:

- `main`

Important branch:

- `origin/hqc-development-site`

Local issue:

- local `hqc-development-site` is behind `origin/hqc-development-site` by two commits
- local dependencies are not installed, so `npm run build` fails with `astro: command not found`
- there is no `npm test` script
- local working tree has uncommitted review/strategy docs plus `.gitignore` changed to ignore `.seo-cache/`

## Remaining Work To Finish

1. Sync local worktree to the preview branch.
2. Install dependencies and run a clean build.
3. Review the preview visually on desktop and mobile.
4. Decide whether Developer Handover Cleaning needs a page before launch or should be removed/deferred from the launch scope.
5. Confirm proof claims with Pedro before production:
   - insurance
   - vetted team
   - DBS
   - response time
   - quality checks
   - keyholding
   - out-of-hours support
   - ISO 9001
   - review count
   - named client examples/case studies
6. Tighten old pages that still carry luxury-led wording:
   - `/quote/`
   - `/contact/`
   - `/areas/`
   - `/case-studies/`
   - `/services/office-cleaning/`
7. Ask Pedro to review the live preview and answer the proof/page-scope questions.
8. After approval, merge/deploy to production.
9. Post-launch checks:
   - production routes return `200`
   - preview noindex is not carried onto production
   - production canonical URLs are correct
   - new sitemap includes the new route pages
   - key legacy redirects work
   - forms still submit

## Recommended Next Action

Do not launch yet.

The next best move is a focused finishing pass:

1. switch/sync to `origin/hqc-development-site`
2. install dependencies and build locally
3. fix the missing/deferred Developer Handover route decision
4. QA desktop/mobile preview
5. send Pedro a short proof-and-review checklist for approval

No outbound message should be sent without showing Jack the draft first.
