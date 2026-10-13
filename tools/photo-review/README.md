# HQC private photo review

A separate review app for Pedro and Jack. It does not change the production HQC site.

## Content and provenance

- Source: production release `4301fe213d1f9ef90fb1fe106c15821625fd715d`, deployed 7 May 2026, Cloudflare deployment `700cf0af-c68e-4059-b144-2b78e5628b41`.
- 73 recovered photos with placements on 39 original pages; 14 referenced files unavailable in that revision remain visible as gaps.
- 57 additional photos from the same revision's image library, without a verified May page placement.
- Six hero compositions respond to Pedro's 21 August 2026 controlled copy review: show homes, workplaces and managed properties alongside the approved headline.
- Original-page links open today's production site; they are not an independently accessible historical snapshot. The historical deployment URL redirects to today's canonical domain.
- Raw page/image mappings and deployment evidence are in `evidence/`; `public/data.json` is the curated review manifest. Historical logos/placeholders were excluded; stock portraits and unverified comparison illustrations are labelled.
- Assets are unchanged recovered files (remote stock images use the same photo identity). Prior use is not proof of licensing or an HQC project identity.

## Running and publication

From the repository root, install existing dependencies with `npm ci`. Keep `REVIEW_KEY=<random 48 hex characters>` in ignored `tools/photo-review/.dev.vars`. Never commit or log the key. Run:

```sh
node node_modules/wrangler/bin/wrangler.js dev --config tools/photo-review/wrangler.jsonc --port 43925
node tools/photo-review/test-review.mjs
node node_modules/wrangler/bin/wrangler.js deploy --config tools/photo-review/wrangler.jsonc
node node_modules/wrangler/bin/wrangler.js secret put REVIEW_KEY --config tools/photo-review/wrangler.jsonc
```

Use a Cloudflare credential with Workers Scripts edit and the necessary custom-domain route permissions on the configured account/zone. Published and verified on 13 October 2026. The saved general Cloudflare token has API Tokens Write access; it was used to issue a two-hour deployment token scoped to this account and the HQC zone. That temporary token was revoked after publication. Existing credentials were unchanged. See `evidence/live-publication.json`, `live-verification.json` and `live-assets.json` for proof.

The share link is `https://review.highqualityclean.co.uk/#<REVIEW_KEY>`. A fragment is exchanged for a Secure HttpOnly cookie and removed from the address bar. The key is never sent to third-party resources. Anyone with the link can edit the shared review. Rotating the key invalidates previous links/cookies but preserves choices.

Photos/data and all review endpoints require authentication; only the login shell is public. Robots/noindex headers apply throughout. Static assets run behind the Worker. Missing configuration fails closed. There is no tracking, client messaging, or automatic main-site publication.

Selections/notes are persisted in a SQLite Durable Object, with conflict detection and explicit failed-save/retry states. A CSV export is available. Cloudflare account retention governs persistence; this is not a separate backup. Jack owns reviewing Pedro's submitted shortlist and confirming final image use.

## Checks

The browser suite covers authentication, source consistency, reload and cross-context persistence, failed saves, concurrency, page mapping, hero previews, CSV export, finish state, and mobile overflow. It uses and then clears a QA selection: do not run against an active client review without preserving existing state first. Run hosted verification before sharing, using `REVIEW_URL=https://review.highqualityclean.co.uk`.

The capture helper `extract.py` expects the May revision built and served at `http://127.0.0.1:43918`, with only the temporary source's canonical middleware origin changed to that local address. It asserts the final response host to prevent accidental extraction from today's live site. Do not run it against the production checkout. Contact-sheet helpers provide visual asset inspection.
