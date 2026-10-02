# Current status — 2 October 2026

See [the current release record](RELEASE_RECORD_2026-10-02.md) for the verified implementation, evidence and remaining release gates. The historical 28 September record below is retained; its open items are superseded by the dated current record.

# Phase 8 staging implementation record — 28 September 2026

## Authority and isolation

- Release authority: Pedro's email `1a0e5dd902d5774e` and attached Release Pack v1.0 (28 September), superseding the earlier draft.
- Copy sources: Pedro Approved Draft DOCX Batches 1–6, interpreted under the Release Pack's locked Areas 1–12 and Section 15 amendments.
- Source branch: `main` at `41903fbb90cf1c0c396d8ac68075a05a993cca79`.
- Code baseline branch: `archive/pre-phase8-main-2026-09-28` at the same commit.
- Development branch: `phase8-2026-09-28-staging`. Old draft PR #2 is separate and predates this release.
- New draft PR #3 has a Cloudflare Pages branch preview at `https://phase8-2026-09-28-staging.hqc-london.pages.dev/`. The Pages check succeeded; a separate `Workers Builds: high-quality-clean` check failed without a deployment log available here. Resolve its cause and account scope before release. The Netlify deploy-preview check is a separate integration and is not the Cloudflare acceptance target.
- Live HTTP baseline: `live-http-baseline-2026-09-28.json`, 46 sitemap URLs with 200 responses and SHA-256 hashes. This is an inventory, not a Cloudflare backup or a verified deployment-to-commit match.
- After PR creation, the live homepage still showed the prior “Request a tailored quote” CTA while the branch preview showed the approved “Request a Cleaning Quote.” `main` remained at its September 21 commit. This is a visible isolation check, not a full response-hash recheck or account deployment audit.

## Implemented on the staging branch

- Controlled copy sections imported for the homepage and 22 service/trust/area pages from Batches 1–5. The original approved text is held as structured content; the Release Pack's newer CTA amendments take priority. The 300+ client-count sections are withheld from rendered pages pending substantiation.
- Batch 5's 35 FAQ questions/answers replace the older FAQ body and drive visible FAQ schema.
- Batch 6 Privacy and Terms body replaces older conflicting text on staging. The 15-row cancellation matrix is retained. Production fields remain visibly marked as unverified.
- Essential Clean primary CTA reaches the approved Launch27 booking-request iframe. The page distinguishes a submitted request from HQC confirmation, explains Heavy Build-Up review and the qualifying recurring offer.
- The introductory offer overlay is limited to Essential Clean and the relevant home-cleaning hub, starts after delay plus scroll engagement, defers to the cookie banner, closes by keyboard and touch, suppresses for seven days after dismissal, and records engagement separately from sales conversion.
- Quote UI has distinct Home, Property/Portfolio, Workplace/Commercial and Complex routes. Property still submits through the existing commercial route with a `buyer` context pending GHL mapping verification.
- General Contact is separated from quote routing behind a distinct `CONTACT_FORM_WEBHOOK` binding; absence of configuration fails closed. Preview submissions report that nothing was sent.
- Quote and Contact show the Batch 6 privacy notice, and optional email marketing consent is unchecked. No SMS marketing is introduced.

## Verification performed

- `npm run build`: passed after the changes; generated controlled canonical sitemap.
- `npm run test:forms`: passed the repository's structural routing checks.
- Local Chromium browser checks: homepage, Essential Clean CTAs and mobile reflow, four quote tabs, marketing consent defaults, preview form non-delivery, 35 FAQ entries/schema, 15 Terms matrix rows, targeted overlay/dismissal/suppression/exclusions, local noindex and JavaScript page errors. The local browser had zero page errors. Cloudflare branch-preview Chrome QA confirmed the homepage, preview noindex, booking iframe and provider form loading; it did not submit a booking.
- The remote Launch27 URL returned HTTP 200 to a direct request. The Cloudflare branch preview loaded the live cross-origin Launch27 form in Chrome; the frame permits internal scrolling if the provider does not send a resize message. Its customer-facing frequency help says “Cancel or reschedule anytime,” which conflicts with the approved three-month commitment for the 30% first-clean offer. The provider also displays the >£400/50% deposit text. Actual booking submission, eligibility discount, payment, terms links and success/failure states are **not verified**; no real booking or charge was attempted.

## Open before staging can be called implementation-complete

1. **GHL:** This session's connector is read-only and does not expose HQC configuration writes. Configure/verify fields, owner, stage, next action/date, required service date, acknowledgement, notifications, delivery failures, stop conditions, reporting and all 11 scenarios in the correct sub-account. Configure the distinct non-sales Contact route and its secret. Do not connect the preview to production sales automations without a controlled test plan.
2. **Automaid and payment:** Provider admin to reconcile the 30% weekly/fortnightly, three-month commitment, Heavy Build-Up intervention, manual confirmation and >£400 deposit with approved Terms. In particular, correct or explain the provider's “Cancel or reschedule anytime” statement alongside the three-month offer commitment, and verify the offer actually applies only to eligible bookings. Confirm booking completion signal, mobile iframe and failed-payment behavior. Cross-origin iframe rendering alone does not prove conversion.
3. **Legal and consent:** Pedro to verify final company/ICO/privacy/processor details; audit actual third-party cookies and the Launch27 terms/privacy links. The Batch 6 staging pages contain verification placeholders.
4. **Assets/evidence:** Approved flat logo, professional Pedro portrait, sourced reviews/case studies/photo permissions and evidence for the 300+ claim. Current illustrative imagery and older portrait need classification before release.
5. **SEO/rollback:** Obtain Search Console and backlink/landing-page evidence for any location consolidation; complete pre-migration crawl and direct redirect map. Record the actual Cloudflare production deployment ID, settings and bindings, and verify the rollback in that account. No location URL was removed by this branch.
6. **QA:** Live staging integration tests, upload success/failure if uploads are enabled, current Chrome/Edge/Safari/Firefox and iOS/Android checks, keyboard/reflow/accessibility and performance. Local Chromium coverage is only a subset. Complete Pedro's controlled acceptance and explicit release authorisation before any production deployment.

## Production release gate

No merge to `main`, production deployment, DNS change or production workflow switch is authorised by this staging work. P0/P1 defects, unverified commercial rules, production placeholders, uncontrolled SEO changes or absent backup/rollback evidence block release.
