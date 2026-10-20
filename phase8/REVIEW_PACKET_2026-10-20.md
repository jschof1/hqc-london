# Phase 8 version comparison and recovery record

20 October 2026. Prepared for Pedro and Jack against the 15 October request and Jack's 17 October commitment. This extends the [15 October addendum](RELEASE_ADDENDUM_2026-10-15.md), without changing the website or recording acceptance.

## The version Pedro can review

| Reference | Exact value | Meaning |
| --- | --- | --- |
| Frozen review source | `3c7b305b7d7f7759f418a95e6c54428b40b8faac` | PR #3 head read from GitHub on 20 October before this documentation update. |
| Immutable website preview | https://308740d2.hqc-london.pages.dev/ | GitHub's Cloudflare Pages check maps this deployment to that exact source. No new browser exercise was performed today. |
| Deployment | `308740d2-b9ce-44ef-86d0-7dfbc84d5fb5` | Successful Pages check, not operational or client acceptance. [Receipt](evidence/2026-10-20/github-pages-check.json). |
| Application source checkpoint | `79c3d91d705a28fb637a53276363925ab17612b9` | All 280 files in the recorded application/configuration scope have identical Git blobs at this revision and `3c7b305`. |
| Historical analytics checkpoint | `89cd449d647771dc30ba11c3d7b6d32afffa6a7b` | The 6 October analytics/browser/handler and staging-provider receipt evidence belongs to this checkpoint. It is not a new-head test pass. |
| Documentation revision | The commit containing this packet on [draft PR #3](https://github.com/jschof1/hqc-london/pull/3) | Adds evidence and register annotations only. The frozen website review target above remains explicit even when the branch head advances. |

The mutable branch address is not a version identifier. Pedro's 15 October email does not identify the exact earlier build or specific element he found missing. The comparison below covers named, recoverable checkpoints. It cannot establish which unnamed build he reviewed or assert that he accepted any of them.

## Controlled source documents recovered

The original attachments were downloaded and read as DOCX on 20 October. Their originals remain private. Their byte hashes and sizes are in [source-comparison.json](evidence/2026-10-20/source-comparison.json). The Batch 1 v3 and Batches 2–6 hashes match the source inventory in the committed 24 September copy-stage review at `f4cfe15`.

| Document | Exact Gmail source in the account read | Role |
| --- | --- | --- |
| Release Pack v1.0, 28 September | UK Trade Leads message `1a0e5dd91cc7edc4`, `HQC_Phase_8_Development_Technical_Implementation_Release_Pack_v1.0.docx` | Controlled staging authority, all twelve areas, section 15 copy amendments, section 17 acceptance tests and section 19 release sequence. SHA-256 `756c6254a971a0a291160277de113fe4d8f1991b9c16252f93d03fe29fc2fbb4`. |
| Revised audit including CC01, 8 October | UK Trade Leads message `1a11d8b691f092b1`, `HQC_Phase_8_Independent_Implementation_Audit_08_Oct_2026_Revised_CC01.docx` | Findings F01–F06 and service-dependent payment clarification. SHA-256 `b93b3c021313fdbc1ae19729091b3f91c1437f359a2e43d374b82e982f5dfbc0`. |
| Batch 1 controlled v3, 2 September | Aspect message `1a062afe88054740`, `HQC_Website_Copywriting_Batch_1_Controlled_v3_2026-09-02.docx` | Controlled Home, Property & Facilities, Office and Home Cleaning source. The older root-repository approved draft is not substituted for v3. |
| Batch 2 approved draft | UK Trade Leads message `1a0aea92471512d1` | Original 17 September attachment. |
| Batches 3–6 approved drafts | UK Trade Leads message `1a0c2964eea839ff` | Four original 21 September attachments. |
| Original gap and offer registers | UK Trade Leads sent message `1a13a76f68a90141` | Recovered on 15 October and preserved byte-for-byte in [14 October evidence](evidence/2026-10-14/). Their hashes still match the recorded sent-attachment provenance. |

The implementation basis is established. The Release Pack identifies Strategy v2.1 and the locked areas as its authority hierarchy. This update does not claim a fresh comparison with every original strategy decision or full rendered-copy parity against every DOCX paragraph. Source continuity, intentional rendering exclusions and outstanding acceptance are recorded separately.

## Cumulative changes and explicit removals

The [complete application patch](evidence/2026-10-20/application-89cd449-to-3c7b305.patch.json) contains every change within the recorded application/configuration scope between `89cd449` and the frozen target. It has fifteen changed files, with no deleted files. The [machine-readable comparison](evidence/2026-10-20/source-comparison.json) includes the exact before/after blobs, all four changed copy values and a 280-file target manifest.

| Checkpoint | Change or disposition | What is preserved, replaced or still missing |
| --- | --- | --- |
| `152d5da` initial Phase 8 import to `89cd449` | Controlled-copy data continuity | `phase8-copy.json` is byte-identical between these checkpoints. This establishes continuity of the imported data, not approval of every rendered block. |
| `20ad2a0` | Booking request wording | Four Essential Clean text values replace premature confirmation language with request submission and HQC review/confirmation. No page key was removed. |
| `cbfc449` | Audit F01 | The generic `ConversionPrompt` mount was removed. The Essential offer is rendered only for Essential Clean and Home Cleaning. This is an intentional exclusion correction, not a missing replacement promotion. |
| `cbfc449` | Audit F03/F04/F05 and CC01 | Company/office fields were populated in that historical change. Booking parent and Terms distinguish details, collection and confirmation and state that the 50% rule is service-dependent. Today makes no legal or commercial edits. Privacy/Terms contacts, dates, ICO and actual processors remain unaccepted inputs. |
| `cbfc449` | Contact WhatsApp removal | The unverified landline WhatsApp card was removed. Phone, email and address cards remain in source. No replacement WhatsApp destination is established or invented. |
| `cbfc449` | Interaction fixes | Forms/dialogs are excluded from stagger animations. Cookie preferences are excluded from generic anchor handling. These shared runtime changes mean that older browser evidence cannot automatically certify the target. |
| `30a9456`, `93ef509` | Separate private photo review and its evidence | Historical photo-review material is committed under `tools/photo-review`. It is not a selection approval or a change to the public website's approved photo permissions. |
| `79c3d91` | Founder presentation | Home/About use a shared natural-proportion portrait with three responsive derivatives. About's enlarged event-photo/portrait hero presentation was replaced with existing interior imagery and a separate portrait. Original `pedro.png` and `pedro-founder.webp` blobs are retained unchanged from `89cd449`. |
| `79c3d91` | Proof presentation | Three evidence positions remain, now grouped into residential and commercial/property categories. Property/office placeholder markup was replaced with the shared component and the residential page also gains that component. |
| `79c3d91` | Review template excluded from rendering | On Reviews, rendering replaces the `Review format` block and following blocks in that section with a permission-pending residential evidence explanation. The original controlled-copy data remains. Retained data is not a claim that these blocks still appear. This presentation disposition needs Pedro's review. |
| Initial import onward | 300+ claim withheld | Count-claim sections are deliberately filtered from rendering pending substantiation. They remain in source. No evidence of the numerical claim or permission to publish it is invented. |
| `3c7b305` | Cumulative registers, assets and bounded evidence | Application files match `79c3d91`. The `.gitattributes` change only preserves the two recovered sent CSVs byte-for-byte. The [full intervening file list](evidence/2026-10-20/head-79c3d91-to-3c7b305.txt) identifies documentation/evidence changes. |
| This update | Current-head comparison and recovery record | Adds this packet, evidence and dated register annotations. No product code, provider settings, legal values, assets, DNS or production branch changes. |

All 23 controlled-copy page keys remain from `89cd449`. Only Essential Clean's four text values differ. FAQ data is byte-identical from the initial import through the target. Form handlers, quote page, consent component, analytics adapter/contract/path data, shared Header and Footer, redirects, dependency lockfile and build configuration were compared through the complete manifest. Unchanged files have identical blobs. Layout and shared interaction code did change as disclosed above, so this does not prove unchanged rendered behaviour.

## Evidence that applies, and checks still unverified

| Evidence | Applicable version and scope | What it does not establish |
| --- | --- | --- |
| 6 October owner proof | `89cd449`, 27 analytics checks, 55 browser checks, 12 handler groups and actual isolated staging analytics receipts. [Dated summary](evidence/2026-10-20/historical-analytics-summary.json). | No current-head or production conversion result. No real enquiry, booking, payment or client acceptance. |
| 13 October retained reports | [55 browser observations](evidence/2026-10-13/browser-verified/results.json), [27 analytics checks](evidence/2026-10-13/analytics-27-checks.json), [14 audit groups](evidence/2026-10-13/audit-final/results.json). | Historical built-server tests, with mocked/blocked providers. Not a fresh pass at `3c7b305`. |
| 14 October correction record | [Source and limitations](../docs/GITHUB-RESOLUTION-2026-10-14.md). Records focused cloud checks and twelve renders. | Repository-wide TypeScript was not clean. The documented unchanged errors remain unverified here. No physical-device acceptance. |
| 15 October browser record | Seven bounded checks against application `79c3d91` at https://3ad5eef9.hqc-london.pages.dev/. [Exact record](evidence/2026-10-15/browser-readback.json). Source equality supports continuity of those application files. | No new exercise of `308740d2`, full browser suite, all eighteen offer cases, eleven GHL cases or provider completion. Hashed previews disable analytics by contract. |
| Current exact-head Pages receipt | `3c7b305` and deployment `308740d2`, read from GitHub today. | A build/deploy check does not prove interface, provider, consent, receipt, booking, payment or acceptance outcomes. |
| Today's comparison and recovery checks | Git blob comparisons, complete changed-file patch, copy-key/value comparisons, sent-register hashes and nine readable Git archives. | No new build, staging deployment, browser run, runtime suite or live provider action was performed. |

The source proof narrows regression risk. Newer-head browser, physical-device, performance, SEO and end-to-end operational acceptance are explicitly unverified by this update. Analytics platform acceptance also remains open. Phase 8 Plausible and separate main/PostHog work are preserved; the locked pack's GA4/GTM wording has not been silently substituted or accepted. Campaign query values are intentionally excluded from the Plausible adapter. Reliable form-source continuity and downstream Booking Request/Confirmed Booking semantics still need separate evidence.

## Twelve-area review and next evidence

The existing [cumulative gap register](HQC-gap-register.csv) retains A01–A12, original observed evidence and pending HQC sign-off. Added 20 October columns identify the exact compared head, the current evidence limit, owner and checkpoint. The [eighteen-case offer register](HQC-popup-acceptance.csv) remains unchanged. Partial or Unverified does not mean the feature is absent.

| Areas | Remaining evidence or decision | Owner |
| --- | --- | --- |
| A01/A11 | Fresh current-live backup, external configuration recovery, owner access/MFA and final security/device/performance checks. Historical source restore is separate. | Jack, with Pedro for HQC ownership. |
| A02/A05/A06 | Eleven GHL scenarios and isolated four-route/contact receipts, assignment/stage/dates/stops, acknowledgement, exception and mailbox/app delivery. Upload success/failure or an explicit accepted scope disposition. | Jack with HQC GHL administrator. |
| A03/A04 | Request capture without automatic allocation, heavy-build-up review, offer eligibility, HQC manual allocation, service-specific collection and confirmation, controlled success/failure and provider consent. | Pedro/provider administrator; Jack verifies website-facing consistency. |
| A07 | Explicit platform reconciliation, reliable permitted source continuity and measured lead/request/confirmed-booking distinctions. | Jack; Pedro accepts scope. |
| A08 | Exact privacy and Terms contacts, policy approval dates, ICO position, actual processors and optional/embedded cookie behaviour. | Pedro supplies/approves facts; Jack implements approved particulars later. |
| A09 | Final deployed redirect/canonical/crawl/Search Console and indexability checks at the authorised release stage. | Jack. |
| A10 | Faithful flat vector/raster/favicons, display-size approval, portrait/photo selections, review/logo permissions and substantiation or omission of 300+ proof. Recovered raster kit is not final vector artwork. | Jack prepares assets; Pedro supplies evidence and accepts exact assets. |
| A12 | All eighteen offer dispositions, including provider completion P15 and performance P17. Existing bounded observations are not a blanket pass. | Jack; Pedro/provider administrator for completion. |

## Earlier versions and recovery limits

Nine full commit archives were produced in memory and their TARs read on 20 October. [The recovery inventory](evidence/2026-10-20/source-comparison.json) records each full SHA, archive hash and file count. No checkout was deployed or restored over a live system.

| Revision | Recoverable checkpoint |
| --- | --- |
| `41903fbb90cf1c0c396d8ac68075a05a993cca79` | Historical pre-Phase 8 source. Its 2 October isolated restore/build is recorded in [baseline-restore.json](evidence/2026-10-02/baseline-restore.json). It is not asserted to be current production. |
| `152d5daedc61be1a6df673d7be05413d97f6dc69` | Initial Phase 8 controlled-copy import. |
| `89cd449d647771dc30ba11c3d7b6d32afffa6a7b` | 6 October analytics checkpoint. |
| `20ad2a0`, `cbfc449` | Manual booking correction, then audit/CC01 corrections. Full SHAs are in the recovery inventory. |
| `30a9456`, `93ef509` | Separate private photo-review source and evidence. |
| `79c3d91d705a28fb637a53276363925ab17612b9` | Natural portrait and grouped proof presentation. |
| `3c7b305b7d7f7759f418a95e6c54428b40b8faac` | Frozen cumulative review target. |

A non-destructive source export uses `git archive --format=tar <full-SHA> > <new-file>.tar`. A comparison uses `git diff <earlier-SHA> <review-SHA> -- src public scripts`. These commands do not switch a working branch or restore a provider. Archive availability does not guarantee dependency downloads, a future build, external secrets, DNS, GHL/Automaid state or retained deployment availability. Those need current recovery evidence before release.

## Decision and follow-through

Jack owns presenting this packet for approval of the exact current draft message. No explanatory email has been sent by this update. The live-source reconciliation found Pedro's 15 October comparison request and Jack's 17 October reply; neither supplies production authority. Earlier drafts or previous sends are not approval of a new message.

Pedro's next review can identify specific missing items against the frozen preview, review the explicit rendering replacements, and supply the listed legal/asset/provider inputs. A missing earlier reviewed build or item remains an exact information gate, not a reason to delay the comparison already completed here.

Next internal checkpoint is **20 October 2026 at 17:00 BST**, or immediately on a Pedro reply, candidate change or test evidence. This is an owned review trigger, not a scheduled automation. Jack's existing tasks `task_1791029807019_h2zkx8` and `task_1787144546033_y2hday` remain open. Their older blockedReason/nextAction/reviewAt fields contain superseded dates or unsent-draft claims; no canonical task was changed here.

Any application change requires a new exact version/delta record and relevant verification. The release sequence remains developer QA, readiness declaration, Pedro's acceptance of the exact candidate, defect resolution, pre-production verification, Pedro's explicit release authorisation and the immediate production smoke test. Jack must also explicitly authorise the production action in the current workflow. PR #3 remains draft and unmerged. The comparison packet is complete; Phase 8 client acceptance and release are not.
