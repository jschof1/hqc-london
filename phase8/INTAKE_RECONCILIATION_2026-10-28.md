# Phase8 intake reconciliation — bounded local review, 28 October 2026

Status: implemented and locally checked; review candidate, not accepted for production. Parity is **not verified** and production release is **blocked**. No commit, push, deployment, provider request, credentials, messages, installation or site build. No delegation. Parent owns CRM and release.

Sources actually read: local `main` at `48f4776d3d78a777b84aa27c9879f7c6b7327e1f`, existing staging worktree baseline `4119701` on `codex/hqc-review-packet-2026-10-20`, and local remote-tracking `origin/client-win/hqc-phase8-lead-intake-release-gate-20261023`. These refs were not fetched during this bounded task. The missing draft commit `6717...` was not recoverable and was not used or reconstructed. This is a fresh reconciliation of available source, not recovery of that draft.

Two existing-shape alternatives were considered:

1. Preserve the staged handler and port live reliability fixes into it. This retains Phase8 behaviour directly but duplicates the work of recovering legacy quick/discount validation, source classification and receiver rejection handling.
2. Adapt the live handler and reapply the staged contracts. **Chosen:** retain the same `submitForm(request, env, kind)` signature, extend its existing form-kind union, and keep the established thin API wrappers. No new intake architecture.

The result keeps Cloudflare `redirect: 'manual'`, rejects redirect responses without forwarding to another destination, parses live receiver rejection envelopes, bounds delivery to ten seconds, avoids automatic retries, logs only bounded categories/status, and creates classification/source metadata on the server. Plain-text/empty successful receiver acknowledgements retain main's semantics; browsers still require this API's explicit `{ok:true}`. Submission UUIDs correlate attempts, not durable delivery or deduplication.

Phase8 contracts retained:

- Explicit `contact` form kind and `/api/contact/`, using `CONTACT_FORM_WEBHOOK`; missing or reused quote/quick/discount destinations fail closed, including URL normalization and fragments. Legacy contact input on quick-form is also isolated onto the contact receiver rather than creating a sales lead.
- Per-kind allowlists remove sales fields from contact/private feedback. Contact/private feedback have no sales classification tags; their empty classification string cannot confer a sales type.
- Server-owned `privacy_notice_version = phase8-batch6-2026-09-28`; quote/contact optional marketing is normalized to literal `yes` or `no`, independently of submitting an enquiry. No privacy checkbox is invented or required for quote/contact visual acknowledgement. Legacy quick forms still require `privacy_consent: yes`.
- Property/agency buyers use the commercial route with property enquiry type, without requiring commercial-only frequency, operating hours or mobilisation. Ordinary routed commercial enquiries still require those fields. All four actual staged service selectors are tested, including property End of Tenancy, Post-Construction and other-property choices; unknown service aliases retain bounded unconfirmed classifications.
- Required-service/desired aliases, checkout/inspection/move-in dates, explicit empty dates on later enquiries, attribution, notes enrichment, property/room choices and the live legacy quote/quick/discount contracts remain available.
- Strict staging production-host guard is unchanged. All frontend pages/copy, legal/consent copy, analytics source and datasets are unchanged from `4119701`. Existing quote/contact callbacks already require literal `ok === true`, distinguish preview receipts and retain analytics stages; executable callback tests cover false/empty/malformed/string/numeric success, HTTP failure, preview and accepted receipt without editing those pages.

## Exact implementation and test files

- `src/lib/form-submission.ts` — reconciled existing handler.
- `src/lib/enquiry-classification.ts` — live helper plus exact Phase8 property choices.
- `src/pages/api/quick-form.ts`, `src/pages/api/discount.ts` — live thin wrappers.
- `package.json` — forms runs routing, staged runtime, adapted main handler and workerd tests. Lightweight analytics is `test:analytics`; original full browser analytics command is preserved as `test:analytics:browser`.
- `scripts/verify-form-routing.mjs`, `scripts/test-form-handlers.mjs` — align existing checks with the shared boundary and manual redirects.
- `scripts/verify-form-submission.test.mjs`, `scripts/verify-form-worker.test.mjs` — adapted main tests plus Phase8 cases and executable frontend callbacks. Worker receiver is in-process; fetches cannot reach external providers.
- `scripts/verify-phase8-analytics.test.mjs` — real contract and adapter tests for consent, PII stripping, preview isolation, attempt/error/receipt distinction, deduplication and withdrawal, without browsers or a server.
- `scripts/verify-phase8-intake-parity.mjs`, `scripts/verify-phase8-intake-parity.test.mjs` — adapted 23 October source guard. Records intentional differences against exact source/test hashes; does not treat byte equality as operational acceptance. All invocations remain production-blocking until external evidence is reviewed separately.
- `phase8/RELEASE_GATE_INTAKE_PARITY_2026-10-23.md` — original review-branch context with current bounded-use addendum.
- This note and `phase8/evidence/2026-10-28/intake-{reconciliation.json,forms.log,analytics.log,guard-tests.log,release-guard.log}` — source-bound proof and local receipts.

## Verification and limits

`npm run test:forms`: routing check, 12 staged runtime groups, 37 route/classifier/Phase8/frontend tests, and one real workerd test covering accepted quote, refused redirect, isolated contact, property/agency without commercial-only fields and unknown-host no-send. `npm run test:analytics`: two lightweight contract/real-adapter tests. Guard unit tests: six, including two executable build-boundary checks. `git diff --check` and locked frontend content comparisons must also remain clean.

Tests use the parent's existing dependency directory through a temporary worktree `node_modules` symlink, removed after testing. No dependency downloads, browser launches or Astro/site build occurred. Test-only in-memory TypeScript bundling is part of the inherited handler tests. Browser, rendered-page/accessibility and provider acceptance are untested here; the original browser analytics suite remains available.

The JSON proof binds every protected main/candidate content hash and the exact successful test log hashes. It also records locked frontend digests against staging baseline. Worktree proof is valid only for these exact bytes; parent must regenerate/review against the eventual committed candidate and fresh refs. Recorded source reconciliation is not certified parity, client acceptance or release authority.

Run from this worktree:

```sh
node scripts/verify-phase8-intake-parity.mjs main WORKTREE phase8/evidence/2026-10-28/intake-reconciliation.json
```

Expected exit is **1**: local reconciliation recorded, production release blocked. Unknown refs, stale/missing proof or receipt errors fail closed. This source guard intentionally has no switch that approves provider outcomes or production release.

## Remaining gates and owners

Parent: review these uncommitted changes, commit/push, refresh production/candidate refs and regenerate exact candidate evidence; perform the authorised site build and browser/accessibility/customer-journey tests when resources permit. Preserve the locked frontend and consent copy.

Parent/CRM owner: verify a genuinely isolated production contact destination and controlled receiver acknowledgement, CRM contact/opportunity/tag mapping, assignment, notifications and duplicate/failure handling. No live destination or CRM state was read or changed here. Complete booking/service-dependent payment acceptance only with matching provider authority.

Parent/Jack/Pedro: attach an immutable candidate preview and current A02/A05/A06/A07 receipts; obtain Pedro's acceptance before release. Old review packets and successful local tests are insufficient. Production receipt, booking/payment and client outcomes remain unproved. Keep the owning thread available for Jack's review; do not settle/archive it.

## Parent verification addendum, 28 October

The parent fetched current remote references before reconciliation and repeated all listed forms/analytics tests after integrating the candidate. Added the existing locked Miniflare version as an explicit test dependency in package.json and package-lock.json; no install was needed locally. The actual `npm run build` now runs `check-phase8-release.mjs` first: Cloudflare branch `main`, or explicit `HQC_RELEASE_TARGET=production`, fails before Astro. Review branch builds remain possible. This deliberate guard must be replaced only after the remaining evidence and Pedro acceptance are resolved. It is not a complete release-authority system. The separate source evidence CLI always exits 1 and cannot grant release.

All 81 frontend page/component/layout/data/script files remain identical to staging baseline 4119701. Existing twelve-area and eighteen-popup registers remain cumulative historical records, with their unverified operational inputs intact. This change does not rewrite those old checks as fresh passes. Current production forms were separately exercised on a protected DND fixture on 28 October: five notes/tasks, one sales opportunity across the three sales routes, no second opportunity for repeated open/closed enquiries, and no outbound customer message. Those are receipts for live main, not for this review candidate or Pedro-witnessed acceptance.

No local Astro/browser build was run: the live Mac resource guard disallowed heavy work. The canonical GitHub review branch is used for a fresh Cloudflare review build; its actual build result and immutable preview must be recorded after pushing. Public production stays at 48f4776; production has no isolated CONTACT_FORM_WEBHOOK configured, so this candidate must not be promoted. Customer acknowledgements, booking/payment, legal particulars, analytics platform choice and client acceptance remain distinct gates.

Independent Claude Opus 5.5 review found no blocking defect. A latent quick-form notes routing issue was corrected: legacy Contact is identified by its controlled contact-topic selector, rather than the presence of any message field; a regression test keeps sales notes on the sales receiver. Existing discount embedded-offer compatibility remains deliberate. Quick enquiry forms supply email, not a newly invented phone requirement. The build guard covers connected Cloudflare main-branch builds and explicit production builds; it cannot prevent someone manually deploying already-built preview assets. Production is held by policy as well as this limited build guard.
