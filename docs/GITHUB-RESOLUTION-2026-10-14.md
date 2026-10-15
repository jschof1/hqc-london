# HQC staging reconciliation — 14 October 2026

> **15 October dated correction:** the statements below are the historical 14 October snapshot. Current remote `main` is `61bb2eb11f5f413113c661b1ec344eb1873946e1`, independently updated for PostHog; staging application source is `79c3d91d705a28fb637a53276363925ab17612b9`. The [15 October release addendum](../phase8/RELEASE_ADDENDUM_2026-10-15.md) preserves the exact prior previews, extends the recovered sent registers and records remaining acceptance gates. No analytics integration or production merge is implied.

This change follows the current Phase 8 staging source at `93ef509d44171174f01d604982b3e5989accde2c`. Production `main` remains at `41903fbb90cf1c0c396d8ac68075a05a993cca79`; launch still requires Pedro's acceptance and explicit release authorisation.

## Focused website changes

- The supplied 1152 × 2048 founder photograph is shown at its natural proportions on Home and About, capped at 384 CSS pixels. Responsive 320/640/960 WebP derivatives resize that same source; no appearance edits were made.
- About no longer enlarges the 444 × 454 event photograph or stretches the portrait across the hero. It reuses existing London interior/property imagery and presents the portrait separately.
- Residential proof is separated from commercial/property proof on Home, the relevant service pages and Reviews & Case Studies. The existing three evidence positions remain explicit placeholders, with client permission and traceable source material required before publication.
- The imported five-star review-format template is replaced in rendered output by a permission-controlled placeholder. The original approved-copy data remains available as source material; the unsubstantiated 300-client section remains withheld.
- Existing form destinations, phone number, consent-controlled Plausible tracking, booking safeguards and no-send preview behavior are retained.

## Current validation

Cloud execution used Linux and Node 24.19.0. Structural form checks and all 12 mocked handler groups pass. The production build passes and emits 45 controlled canonical sitemap URLs. Strict TypeScript validation of the changed visual data passes, and the source diff has no whitespace errors.

The repository-wide TypeScript check still reports two errors in unchanged files: the Vite/Tailwind plugin type mismatch in `astro.config.mjs` and missing declarations for `google-maps-review-scraper` in `src/lib/googleReviews.ts`. A clean repository-wide type check is not claimed. This repository has no lint script.

The unchanged browser suite passes 22 groups in Chromium desktop and Pixel 7 emulation. It verifies no-send forms, failure recovery, mocked receipt handling, consent, booking fallback, all-rating Google-review access, preview noindex and genuine 404. Nine Chromium analytics groups and the payload allowlist/privacy checks pass. Real submissions, calls, booking, payments and analytics writes are blocked or mocked. Other browser engines and physical devices have not been certified by this run.

Twelve separate renders cover six affected routes at 390 and 1440 pixels. Checks confirm no overflow or missing loaded images, natural portrait sizing, explicit evidence categories, no enlarged event image and no five-star template. The supplied portrait and evidence sections were visually inspected. Native Cloudflare local preview failed on this hosted runtime's network-interface lookup; source-browser checks use Astro's local no-send server. The successful build and actual provider deployment/readback must be recorded separately.

## Older PR #2

All ten changed files at `312741b9b3d4f8d3715cbe216f1152bd5cc18575` were compared with current Phase 8:

| Original scope | Current disposition |
| --- | --- |
| Header/footer HQC lock-up | Current shared components retain the later HQC presentation. The requested faithful flat logo exports remain #13. |
| Homepage five-stage process, complex route, three proof positions and founder-video reserve | Present in Phase 8; proof positions are further clarified by this change. No founder video is invented. |
| Commercial property `site-assessment` and office `site-visit` links | Exact intent-bearing links remain in `outcome-pages.ts` and the built pages. |
| Hidden quote intent and routing verification | Current quote form retains and populates `intent`; current structural and handler tests cover the evolved contract. |
| Property/office process and permission-controlled proof | Preserved through current controlled-copy rendering, service-profile content and explicit evidence slots. |
| More-than-300 trust claim | Deliberately withheld pending substantiation; the older claim must not be reinstated. |
| Essential Clean suitability and booking hand-off | Current controlled booking-request journey supersedes the old generic hand-off. Actual provider consent, eligibility, manual allocation and acceptance remain #10/#12. |
| Preview isolation | Current middleware/form guards retain preview origin, noindex and no-send behavior. |
| Historical implementation-response document | Superseded by Phase 8 release, audit, search/consent and analytics records; historical branch remains preserved. |

The old conflicting PR should be closed as superseded after current staging verification, without merging its older tree or deleting its branch. This is not an assertion that its external booking or client-approval gates are complete.

## Owned gates

All listed issues stay open. **Owner: Jack. Follow-up: 16 October 2026 at 09:00 BST, or immediately when Pedro replies.**

| Issue | Required next evidence/action |
| --- | --- |
| #4 | Authenticated GHL call/workflow audit, identify the actual delay, deduplicate repeated missed calls, and verify real handset recovery plus correct contact/opportunity state. No ten-day root cause is inferred. |
| #5 | Map the actual live lead-source/workflow paths, waits, conflicts and failures, then verify destination receipt and recovery. Website mocks cannot replace this. |
| #6 | Agree the smallest useful dataset/reporting route and verify both users' access and source freshness before dashboard acceptance. No speculative dashboard is built to close planning work. |
| #7 | Confirm real Reputation/Google settings and published direct review route, remove the obsolete filter in the provider, and verify an authorised genuine journey. No public review or automated reply is fabricated. |
| #8 | Resolve Pedro's exact broken reporting link and verify production conversion/source access. Staging Plausible tests do not prove production reporting or booking completion. |
| #9 | Verify the tenant's Launch27 plan/event samples and the unresolved payment/refund/recurring-booking semantics; review the smallest one-way visibility mapping before any prototype. Support contact remains unauthorised. |
| #10 | Verify actual Essential Clean eligibility, heavy-build-up assessment, provider consent, pricing/Terms and manual allocation before an accepted booking can be claimed. |
| #11 | Record actual capabilities used, maintenance burden and cost before deciding whether replacement is worthwhile. P3 remains deferred and does not block launch. |
| #12 | Pedro reviews the correct staging build; provider/forms/payment/consent/legal/device and recovery gates are accepted before any production launch. |
| #13 | Use the approved original logo source for faithful flat transparent horizontal SVG and PNG/WebP, compact black/white and favicon exports; obtain acceptance. No new logo or runtime 3D dependency is added. |
| #14 | Review the natural portrait correction, choose permission-cleared photographs/legacy candidates, and approve remaining image quality. The old small London image is not enlarged as a new hero. |
| #15 | Review the residential/commercial structure; provide attributable reviews/stories and logo permissions before replacing explicit placeholders. |

Connected Client Pulse was re-read and still returns an 8 October stale snapshot with 47 clients. It cannot verify current GHL workflow state, enquiries, bookings, billing or client acceptance. Canonical Cloudflare provider administration/binding readback requires an authorised account/session; successful Pages checks only establish the reviewed deployment.

## Integration research

Official Launch27 documentation lists Pro-and-above Zapier booking/customer triggers, including created, updated, cancelled, completed and assignment changes. Created does not include a new instance within an existing recurring booking series, and completion can be automatic or manual. Neither event proves payment. The smallest candidate is one-way visibility into GHL using stable external customer/booking IDs and status updates, with no customer/review/payment sends until controlled acceptance. Tenant plan, real samples, refund/payment and repeat-booking details remain unproved.

- https://intercom.help/Launch27/en/articles/4256720-zapier-integration-overview
- https://help.gohighlevel.com/support/solutions/articles/48001239140-where-and-how-to-configure-the-missed-call-text-back-feature

The HighLevel native missed-call feature sends a text per missed call, so deduplication and actual workflow/call evidence are needed. This does not establish HQC's delay cause.

## Separate recent source

`feat/posthog-consent-analytics` at `20f32fbd35f5ac34097629ebcbcb6b530603ad68` is a separate 14 October branch. Its documentation references production Umami, while current Phase 8 uses Plausible and its route-ready handshake. Preserve this work and reconcile it with its owning analytics conversation before integration; no automatic merge or branch deletion occurs here.
