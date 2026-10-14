# Phase 8 staging release record — 2 October 2026

**Staging implementation and local validation progressed; production acceptance remains blocked.** Authority is Pedro's 28 September Release Pack v1.0, all 22 sections, approved Batches 1–6 and locked Areas 1–12. No production merge, DNS change, live webhook replacement, customer submission, booking or payment was made by this website work.

- Draft PR: https://github.com/jschof1/hqc-london/pull/3
- Branch: `phase8-2026-09-28-staging`
- Preview: https://phase8-2026-09-28-staging.hqc-london.pages.dev/
- Public site: https://highqualityclean.co.uk
- Platform: Astro 5, Tailwind, Cloudflare Pages server adapter, GitHub branch deployments.

Priority URL coverage, canonical selection and private link-export follow-up: [SEO acceptance](SEO_ACCEPTANCE_2026-10-02.md).

Follow-up search, consent, contrast and keyboard evidence: [2 October follow-up](SEARCH_CONSENT_ACCESSIBILITY_2026-10-02.md). Isolated actual-handler test preparation and fixture identifiers are retained in private local release evidence.

## Website changes

Quote, administrative Contact and private-feedback endpoints now validate on the server, bound request size and webhook wait time, reject cross-origin submissions, strip client-supplied workflow metadata and return a consistent receipt/error contract. The four quote journeys distinguish residential, property, commercial and complex enquiries. Property enquiries retain the existing `route=commercial` plus `buyer=property/agency` compatibility contract and explicitly add `enquiry_type=property`.

Required service date remains compatible with `desired_date`; check-out, inspection and move-in dates are separate. Inapplicable fields are cleared when changing routes. New submissions carry explicit blank dates and unchecked marketing consent rather than inheriting a previous enquiry. Commercial-only questions no longer block property enquiries. Failures preserve the user's data and never display success. The browser prevents simultaneous double-click submissions; the server gives each attempt a UUID. Durable downstream deduplication is still an integration requirement; an uncertain webhook response can mean receipt happened, so the interface advises contacting HQC before retrying.

Contact requires a distinct `CONTACT_FORM_WEBHOOK` and rejects reuse of a configured quote/quick/discount endpoint. The server owns the `form_type` discriminator. Payload separation alone does not prove the receiving system will avoid creating a sales opportunity.

All non-production hosts are no-send, including Pages, Netlify and unknown hosts. Preview submissions validate then return HTTP 202 with `preview:true`; this is interface testing, not CRM delivery. Preview analytics and indexing are suppressed. The general feedback page gives every rating the same direct Google option, explains that Google publication requires pressing Post, and offers private feedback separately. No customer-specific tracked review link was opened or changed.

Consent now gates stored attribution, Umami calls and optional GA4 loading. `PUBLIC_GA4_MEASUREMENT_ID` accepts a `G-…` identifier; none is currently configured in Pages. Quote receipt maps to `generate_lead`, while booking-page opening remains an engagement event. No iframe opening is called a submitted or confirmed booking. GA4 property ownership and receipt remain unverified. The read-only cookie audit found pre-consent analytics/marketing scripts inside the provider iframe; see the follow-up consent gate. The approved consent copy is preserved.

The booking embed accepts resize messages only from its expected origin and its own iframe window. The tested provider-failure fallback offers a direct booking link without claiming confirmation. Form grids no longer fade during interaction. Error statuses can receive focus below the fixed header. Six lowercase legacy aliases now redirect directly to the existing canonical destination, with slash and non-slash variants. No location was deleted or consolidated.

The two existing homepage illustrations have WebP derivatives at the original resolution, reducing approximately 3.98 MB to 191 KB. The original PNG sources are retained. This changes encoding, not the artwork or approved copy.

## Verification and its limits

| Check | Result | Limits |
| --- | --- | --- |
| Production build | Pass | Compiles application; not provider acceptance or a separate strict TypeScript audit |
| Existing form-routing checks | Pass | Structural checks |
| Shared form runtime suite | 12 groups pass | Real handler, mocked webhooks; no customer messages |
| Browser suite | 55 checks pass, 11 each in Chrome, Firefox, WebKit, iPhone and Android emulation | Actual Safari 26.5.2 targeted route/zoom/provider-keyboard checks added; Edge and physical devices remain outstanding |
| Accessibility | Zero reported violations on eight complete pages; 28 hover/focus checks and keyboard/320px/640px reflow passed | Targeted checks, not a WCAG certification/full-site audit |
| Booking failure / consent / offer | Failure fallback, preview tracking suppression, delay/cookie precedence/Escape/suppression checked | No real provider submission/payment; production homepage and staging provider consent audit completed; provider pre-consent resources remain a gate |
| Crawl before push | All 45 current sitemap URLs return 200 on production and staging; inspected internal links resolve; genuine 404 | Final deployed redirect readback recorded separately; GSC landing-page and limited Google Links baseline recovered |
| Baseline recovery | Production source commit extracted into an independent directory, matching original dependency versions, successful build of 268 files, SHA-256 manifest retained | No live rollback executed; secret values/external provider state not recovered |
| Mobile lab | Three pages measured with Chrome, 390×844, 4× CPU, 150ms latency, 1.6Mbps | Single local run; not field Core Web Vitals or Lighthouse score. Homepage load event improved from 22.1s to 3.2s after WebP conversion in comparable single-run throttled tests; final LCP 1.26s and CLS 0.019, neither a field-performance claim |

Evidence is under `evidence/2026-10-02/`. The final contrast/shared-handler follow-up passed 55 browser checks with zero errors (`browser-followup-55-checks.json`), all 12 runtime groups, eight-page whole-document accessibility checks and 28 hover/focus checks. Contact-only verification after removing the unverified WhatsApp link also passed (`contact-final-accessibility.json`); rendered HTML retains the landline and email and contains no removed number/link. `browser-55-checks.json` is the complete 13:54Z run, superseding earlier interrupted development runs. The fresh final build rerun also passed all 55 checks with zero JavaScript or missing-asset errors; see `browser-final-55-checks.json`. A stale local preview process initially referenced an old stylesheet after rebuilding; restarting it fixed the local test environment, and missing-asset assertions were added. Live deployment evidence is recorded separately. Lighthouse did not complete because disk space was exhausted; no Lighthouse result is claimed.

## Production, backup and duplicate build

Cloudflare's production deployment was read back as `242f9c4f-ce9a-4e3e-944e-ad99eb2665bc`, serving main commit `41903fbb90cf1c0c396d8ac68075a05a993cca79`. The archive branch `archive/pre-phase8-main-2026-09-28` retains that source. Pages production branch is main; production and preview deployments remain enabled. Its production bindings are `QUOTE_FORM_WEBHOOK`, `QUICK_FORM_WEBHOOK`, `DISCOUNT_FORM_WEBHOOK`, `FEEDBACK_WEBHOOK`; secret values are masked. Contact and GA4 configuration are absent.

The failing `high-quality-clean` Worker is a separate duplicate, with no custom domain, bindings or event triggers observed. Its site build succeeded and its Worker upload failed because this is a Pages repository. Jack explicitly approved disabling its non-production builds. The saved off setting was verified after reload on 2 October; canonical Pages deployment remains enabled. Historical failed checks are not rewritten by this setting change.

Practical release rollback: retain the then-current successful production deployment; if an authorised release fails its smoke test, use Cloudflare Pages rollback to that recorded production deployment, then check the canonical host, indexing, redirects, forms and booking. A preview deployment is not a rollback target. See [Cloudflare rollback documentation](https://developers.cloudflare.com/pages/configuration/rollbacks/). Source recovery is demonstrated; complete disaster recovery including masked secrets, provider configuration and HQC owner-level access is not yet certified.

## Intake ownership and exact handoff

`src/pages/request-a-quote.astro` posts JSON to `/api/quote/`. `src/pages/api/quote.ts` reads the Pages runtime environment and calls `submitForm(request, env, 'quote')` in `src/lib/form-submission.ts`. That handler invokes the HTTPS URL in `QUOTE_FORM_WEBHOOK`. The four quote routes share this single configured destination. Cloudflare masks the value; the repository and secret helper contain no recoverable destination value. Thus the current receiving provider/workflow ID and its administrator remain unverified, rather than assumed to be the newly built GHL adapter.

The sales owner must identify the existing incoming-webhook workflow and its loaded execution reference, connect/map the adapter there, then verify the destination. Do not replace the production secret blindly. A Pages secret change requires a fresh production deployment; staging remains no-send pending an explicitly isolated integration design.

| Website field | Opportunity field |
| --- | --- |
| `required_service_date` / compatibility `desired_date` | `opportunity.required_service_date` |
| `checkout_date` | `opportunity.checkout_date` |
| `inspection_date` | `opportunity.inspection_date` |
| `move_in_date` | `opportunity.movein_date` (different spelling) |

Also preserve `submission_id`, source/UTMs where consent permits, consent yes/no and notice version; assign Pedro, stage, next action/date and control exceptions through the authorised sales workflow. A fresh enquiry must not inherit old dates. Contact goes to its own non-sales destination. The coordinator subsequently invoked the actual shared handler using an isolated receiver and ephemeral environment. Contact at 16:19 BST completed the non-sales branch with no opportunity or conversation. One Quote at 16:22 BST produced an opportunity whose name matched its receipt UUID, retained all four service dates and Pedro assignment, and showed the expected native workflow provenance. DND stayed true, no phone was added, and there were no customer messages; a system opportunity activity is recorded separately. **Partial integration only:** Next Action Date persisted as 10 February 2026 instead of 2 October 2026. This is a native DATE conversion defect owned by sales, not a website payload correction. No repeat invocation was made by this website owner. The readback records the receiver returned to Draft. The production secret remains unconnected/unverified, and no acknowledgement or recipient-delivery proof is claimed. See `shared-handler-isolated-summary.json`; raw fixture IDs, UUIDs and native records remain private.

## Release gates, owners and next action

| Gate | Owner | Concrete next action |
| --- | --- | --- |
| Quote → GHL, Contact isolation, repeat handling and all 11 sales scenarios | Sales/GHL owner, coordinated by Jack | Recover real intake; connect adapter under isolated testing; read back records, owner/stage/action/date, acknowledgement and notifications, exceptions/stop conditions/reporting |
| Domain email delivery | Jack / GHL owner | Verify HQC sender, SPF/DKIM/DMARC alignment, reply-to, delivered acknowledgement, bounce/failure visibility and app notification |
| Launch27 offer, commitment, deposit and terms | Pedro / provider admin | Reconcile actual provider behaviour with approved Terms; test a permitted no-charge/sandbox success and failure journey |
| Analytics and cookies | Jack | Recover/configure correct GA4 property, verify consent-on/off and event receipt; reconcile provider pre-consent scripts and actual processor stack |
| Legal/company/ICO | Pedro | Resolve production placeholders and sign off actual stack/company identity |
| Brand/evidence | Pedro / Jack | Approved transparent logo, valid professional portrait, review/case-study provenance, photo/logo permissions; evidence for 300+ claim before showing it |
| SEO | Jack | Google link exports and priority URL coverage/canonical checks now recorded privately; eleven live targets and four direct legacy redirects verified. Preserve locations/linked targets; review temporary discovery notes before acceptance or 5 October at 09:00 BST |
| Device/accessibility/security | Jack | Remaining Edge and physical iOS/Android acceptance, broader Safari coverage and screen-reader review, HQC admin ownership/MFA evidence |
| Backup/release | Jack + Pedro | Retain production deployment and external configuration recovery; complete controlled acceptance; obtain explicit production authorisation |

Provider readback on 2 October: approved URL loads; Heavy Build-Up manual intervention and >£400/50% deposit text are present. Frequency help still says “Cancel or reschedule anytime”, conflicting with the offer's three-month commitment. Legacy “WellClean” and “Move In/Move Out Reset” references and “Essentials Clean” remain. Larger-home contact number displayed is 07824 390336, differing from the website's 0208 870 3925. Terms and Privacy are mentioned but no clickable Terms/Privacy links were exposed in the loaded form. These need Pedro/provider reconciliation; no provider settings, booking or payment were changed.

Uploads are not exposed as a working feature. Founder video and complex cross-system attribution retain the pack's non-blocker treatment. Production remains blocked by integration, provider/commercial, legal/evidence and acceptance gates; a green build does not close them. The website chat owns staging and release evidence; the sales and reviews chats retain their respective provider work. The coordinator owns dependency follow-up with Pedro.

## Deployed staging readback

Latest application commit `46be4fd9f55a2be6a063ff24b67a792325896a37` deployed successfully to Cloudflare Pages preview `e20443f7-1a67-44ed-8bc4-1a8b40fb63da` at **16:12:36 BST on 2 October**. Fresh provider readback in `deployment-readback.json` verifies this commit and its branch alias. Production remains deployment `242f9c4f-ce9a-4e3e-944e-ad99eb2665bc` / main `41903fbb90cf1c0c396d8ac68075a05a993cca79`. The earlier implementation snapshot is retained as `deployment-readback-initial.json`, explicitly historical.

The current application passed 11 deployed Chrome no-send checks with zero errors (`browser-followup-deployed.json`). Live Contact readback confirms the removed WhatsApp number/link is absent, public landline/email remain, and preview noindex is present (`contact-live-readback.json`). The earlier full crawl remains applicable to unchanged routes: 45 sitemap pages, 63 redirect mappings, 46 internal links and genuine missing-page 404. The older baseline includes `/sitemap-0.xml` as a 46th record, not a lost page.

Actual Safari 26.5.2 on macOS was checked against this staging build. Cookie rejection and ArrowRight/ArrowLeft quote-route switching worked. Safari’s own Page Menu confirmed 200% zoom; visible quote fields reflowed and Tab reached name/email/phone. Zoom was restored before the booking check. Normal Tab traversed provider identity, address, service, property, discount/date and instruction controls, then left the iframe; Option-Tab reached the parent direct-booking link. No details were entered, selections changed, CAPTCHA solved, booking submitted or payment attempted. Payment controls and provider validation/submission remain untested. These are bounded native-browser observations, not full Safari, screen-reader or physical-device certification. See `safari-native-acceptance.json` and the two Safari screenshots. Edge is not installed on this host.

Private Search Console data/screenshots, fixture records and the minimal provider-access draft are retained outside this public repository. No client message was sent. The older startup draft is historical and must not be sent as a current update. Subsequent documentation-only commits may have a newer deployment; the recorded JSON deliberately names the application commit it proves rather than implying a self-referential commit.
