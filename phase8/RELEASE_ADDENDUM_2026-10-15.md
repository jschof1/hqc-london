# Phase 8 release addendum: HQC-P8-2026-10-15-R1

15 October 2026. This is the cumulative review packet requested after Pedro's email today. It extends the existing release/audit records and the registers actually sent on 14 October. It does not establish HQC acceptance or production authority.

## Controlled version references

| Checkpoint | Exact source / immutable preview | Evidence |
| --- | --- | --- |
| Preceding application checkpoint | `93ef509d44171174f01d604982b3e5989accde2c`; https://1a1dcc65.hqc-london.pages.dev/ | Pages deployment `1a1dcc65-5196-451d-81f6-39fe41c6323a`; [check 115249972976](https://github.com/jschof1/hqc-london/runs/115249972976). Not labelled client-approved or client-viewed. |
| Application source carried into this candidate | `79c3d91d705a28fb637a53276363925ab17612b9`; https://3ad5eef9.hqc-london.pages.dev/ | Pages deployment `3ad5eef9-d5fc-4870-8ce6-cfb56ac896b9`; [check 115950215259](https://github.com/jschof1/hqc-london/runs/115950215259). All application files retained by this record-only change. |
| New review candidate | `HQC-P8-2026-10-15-R1`, the Git revision containing this addendum | The dated 15 October addendum on [existing PR #3](https://github.com/jschof1/hqc-london/pull/3) records the exact pushed revision, Pages check and immutable preview after deployment. Do not substitute the mutable branch URL for that pin. |
| Independently updated main | `61bb2eb11f5f413113c661b1ec344eb1873946e1`, freshly read from GitHub on 15 October | Separate PostHog work. The older `41903fb` production statements describe the original checkpoint, not current main. Public deployment and analytics acceptance are separate evidence. |

Jack's 14 October email was sent at 13:50 BST with a mutable branch URL. The `79c3d91` application was deployed later, at 16:47 BST that day. Pedro's complaint identifies neither the exact earlier reviewed build nor the specific missing element. The checkpoints above are recoverable source/deployment comparisons; neither is represented as approved by Pedro. Git history and immutable deployments allow comparison and source recovery. They do not prove recovery of external secrets or provider configuration.

## Latest application delta, and today's change

The [93ef509 to 79c3d91 comparison](https://github.com/jschof1/hqc-london/compare/93ef509d44171174f01d604982b3e5989accde2c...79c3d91d705a28fb637a53276363925ab17612b9) has nine files. It adds natural-proportion portrait derivatives and shared portrait/evidence components; changes Home, outcome-page presentation and visual data; and adds the 14 October note.

- Home/About use the supplied portrait at natural proportions. About's hero uses existing interior imagery; the enlarged small event-photo rendering was removed, while its source asset remains recoverable.
- Three proof positions remain, organised into residential and commercial/property categories. The rendered five-star template was replaced by explicit permission-controlled placeholders. Approved-copy data remains in Git; no review, logo permission or 300+ claim is invented. The unsupported 300+ section remains withheld.
- Booking, form handlers, legal copy, consent, analytics and shared header were unchanged in that nine-file application delta. Today's candidate also leaves application files unchanged. This is bounded source continuity, not a claim that the whole pack has no regressions.
- Today's change recovers the previously sent registers, adds dated source/deployed/provider distinctions, corrects stale current-version claims with addenda, records asset/legal provenance and attaches fresh no-submit browser/source-check evidence. No unapproved logo or legal wording is substituted.

## Existing registers, preserved and extended

- [Original gap register sent on 14 October](evidence/2026-10-14/HQC-gap-register.csv), recovered verbatim from sent message `1a13a76f68a90141`.
- [Current twelve-area cumulative register](HQC-gap-register.csv), retaining A01-A12 and the audit's requirement/evidence/status/severity/action/owner/retest/sign-off columns, with dated change and evidence distinctions.
- [Original offer register sent on 14 October](evidence/2026-10-14/HQC-popup-acceptance.csv).
- [Current eighteen-case offer register](HQC-popup-acceptance.csv). Historical compliant entries are dated observations, not a new blanket pass. P15 provider completion and P17 comparative performance remain unverified.

The existing private registers were unavailable in the first 15 October read-only reconciliation; their actual sent attachments have now been recovered. The older report is historical, not a current assertion that no register exists.

## Audit dispositions and exact input gates

| Finding | Current disposition | Owner / next evidence |
| --- | --- | --- |
| F01 | Website source restriction to Essential/home retained. No generic promo overlay restored. | Jack: preserve exclusions and map all eighteen cases to dated results. |
| F02 / F04 | Website request/manual confirmation wording retained and read in deployed Ego preview. | Pedro/provider admin: demonstrate capture, manual allocation, applicable collection and HQC confirmation without false success. |
| F03 | Company and office populated; privacy email, Terms email and final review dates still placeholders. | Pedro supplies/approves exact legal values and actual processor/ICO particulars. Jack inserts only those approved values. Do not infer a privacy contact from the sales email or invent a review date. |
| F05 / CC01 | Details are not collection or confirmation; 50% over £400 is service-dependent, not universal or automatic for Essential Clean. | Pedro/provider admin verifies actual service/payment settings and controlled success/failure. No provider transaction performed here. |
| F06 / Area 10 | The original 307-entry raster kit and Pedro's 8 October reference board recovered. No final flat/vector assets or final asset approval recovered. | Jack: produce a faithful flat master from approved lettering when that production step is separately resolved; Pedro reviews at actual sizes. Missing set: flat horizontal/compact SVG, transparent PNG/WebP, black/white alternatives and legible 16/32/48 favicon treatment. Keep stacked artwork recoverable. |

The recovered kit README explicitly retains metallic bevels/shading and claims raster files only; it contains zero SVGs. Pedro's 8 October email selects the horizontal second-row direction but requires flat production assets to be reviewed before approval. The board is a reference, not an approved production export. The current typographic header therefore remains. [Provenance and attachment hashes](evidence/2026-10-15/asset-provenance.json).

## Proportionate verification and limits

The existing structural form-routing check passed on the established Mac mini in an isolated temporary directory. No paused laptop workers were restarted or dependencies installed. [Exact result](evidence/2026-10-15/form-routing.txt).

Ego successfully opened the exact `3ad5eef9` preview through the existing browser session. The prior GET inspection-path 403 did not prove the preview was down. Fresh bounded checks at 390x700 and desktop verified cookie preferences/reject controls, touch-opening mobile navigation, touch navigation to Essential Clean, the visible offer and its touch dismissal, then the Essential primary CTA's parent booking destination. The booking page visibly retains CC01 and noindex and has no horizontal overflow at that viewport. Provider fields were neither filled nor submitted. Intermediate screenshots before menu paint settled are excluded; the saved settled menu image shows visible links.

Evidence is under [15 October evidence](evidence/2026-10-15/), including the [bounded browser record](evidence/2026-10-15/browser-readback.json). About portrait proportions and the three permission-pending Reviews slots were also read back; screenshots were visually inspected. The pinned new deployment receives a separate post-push readback recorded in PR #3 and the review handoff. Existing 13 October 55 browser / 27 analytics / 14 grouped audit checks and 14 October cloud reports remain historical. No new blanket all-browser, physical-device, performance or all-eleven-GHL pass is claimed. The Pages build is reported separately from website observations and provider/client acceptance.

## Remaining release decisions

1. Jack/Pedro identify the exact missing element and previously reviewed build if the comparison above does not match Pedro's observation. Record an explicit disposition rather than silently dropping approved work.
2. Jack resolves faithful flat asset production; Pedro approves display-size assets, photos/portrait selection, and traceable client proof/permissions. Unsupported proof remains withheld.
3. Pedro supplies the exact legal contacts and approval dates; Jack completes implementation without rewriting policies.
4. Jack and provider owners resolve the historical GHL date/intake issue and all eleven operational scenarios, sender/destination receipt, manual booking/allocation and CC01 payment/offer/consent behaviour under controlled testing.
5. Jack/Pedro explicitly reconcile Phase 8 Plausible/attribution versus main's separate PostHog work. No platform was silently chosen, merged, installed or removed here.
6. Jack/Pedro verify current live recovery, final devices/performance/SEO, then record explicit staging acceptance and production authority. PR #3 stays draft and unmerged. No live enquiry, booking, charge, call, email/SMS test or client message occurred.

Follow-through owner: **Jack**. Next trigger: review this pinned candidate and register with Pedro today, 15 October; any unanswered input gates remain open for the next working-day review, 16 October at 09:00 BST. This is an internal next action, not a client commitment or scheduled automation.
