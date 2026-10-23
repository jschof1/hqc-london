# HQC Phase 8: preserve October production lead-intake fixes

**Checked 23 October 2026. Release blocker, not a completed migration or a claim that customer enquiries were lost.**

## Business reason

Pedro specifically asked on 15 October that later Phase 8 iterations must not erase approved functionality. Jack agreed to cumulative verification before production release. Since then, the **main** branch received important form-routing and CRM lead-management changes on 20–21 October, and Jack's 22 October email reported the website-to-GHL Lead Management journey working.

A live, read-only GitHub comparison on 23 October reports that `phase8-2026-09-28-staging` is **18 commits ahead and 13 commits behind `main`**. The two branches differ in request handlers, source-owned lead classification, frontend enquiry journeys and form tests. This is concrete code drift. It does not prove a current production error or that an eventual merge must break enquiries, but it **prevents treating the older Phase 8 acceptance receipts as sufficient release authority**.

## Added guard (review branch, not live)

`scripts/verify-phase8-intake-parity.mjs` compares **source contents at two explicit Git refs**, instead of assuming commit ancestry or test totals prove feature continuity. It protects GHL/Cloudflare intake acceptance, fail-closed form acknowledgement, service classification, date/route handling and related customer enquiry pages. Different or missing protected files block release and print their paths. The script does **not** silently copy newer main files over Phase 8 work.

After fetching both latest refs in a clone:

```sh
git fetch origin main phase8-2026-09-28-staging
node scripts/verify-phase8-intake-parity.mjs origin/main origin/phase8-2026-09-28-staging
node --test scripts/verify-phase8-intake-parity.test.mjs
```

Run this from a checkout containing the new script. A nonzero parity result is a **release blocker requiring deliberate reconciliation**; intentional Phase 8 differences still need verification, not arbitrary deletion. The test creates a temporary Git history to prove three cases: missing production intake fix is blocked; matching critical file content passes even when branches diverge elsewhere; unknown refs fail closed.

## Required next steps before merging or deploying Phase 8

1. Review `main` changes to `src/lib/form-submission.ts`, `src/lib/enquiry-classification.ts`, `src/pages/api/{quote,quick-form,discount,feedback}.ts`, relevant public forms and three form checks. Preserve genuine Phase 8 enhancements **and** the October 20–21 production-side customer intake controls.
2. Re-run the parity script against *freshly fetched* refs after reconciliation; explicitly document each intentionally divergent protected path if it cannot match exactly.
3. Run actual build, handler/workerd tests and customer-journey browser tests on the **new candidate**, followed by a controlled labelled non-customer GHL receipt test checking accepted enquiry, appropriate contact/opportunity/tags, assignment, notifications and duplicate/failed submissions. Retest booking and service-dependent payment confirmation with Pedro/provider permissions. Do not trigger real customer communications or charge cards.
4. Update the Phase 8 A02/A05/A06/A07 requirements and attach the current commit, immutable preview and validation receipts. Obtain Pedro's acceptance before any production release. The existing 20 October `phase8/REVIEW_PACKET_2026-10-20.md` is historical and **predates the current main-side enquiry changes**.

## Scope and evidence

- Exact business: High Quality Clean, Pedro Ndombasi, `https://highqualityclean.co.uk`, GHL location `Hdye2dupQT03NHLQbGTd`, repository `jschof1/hqc-london`.
- Client Pulse generated 19 October, stale by 23 October: 18 distinct confirmed enquiry-evidence people, 27 possible, 23 unread, and missed-call evidence. Not all are qualified leads; no missed-job claim.
- Relevant live relationship: Pedro's 15 October email and Jack's response committing to regression verification, plus Jack's sent 22 October GHL Lead Management handoff email.
- GitHub compared the current `main` and `phase8-2026-09-28-staging` branches on 23 October; current main commit observed `48f4776d3d78a777b84aa27c9879f7c6b7327e1f`. The exact candidate should be re-fetched for the final gate.
- No production, GHL, customer, payment or client-account settings were modified by this work. The temporary test uses a synthetic local repository, not live enquiries.
