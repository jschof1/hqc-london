# HQC Lead Management delivery

Owner: Codex for configuration, release and verification; Pedro for responding to
enquiries and confirming customer outcomes. Jack reviews the handover. Client
adoption and any customer booking, payment or review remain separate outcomes.

## Usable outcome

Pedro works from one Lead Management board, reads the original website enquiry
in contact Notes, and uses the assigned task to respond and record the next action
and date. First use: open the next genuine enquiry, contact the customer, and
record the outcome. No customer message is sent by these new workflows.

## Agreed five stages

| Stage | Move the card when |
| --- | --- |
| New Lead | A sales enquiry needs attention. |
| Contacted | A personal contact attempt is recorded. An automatic reply does not count. |
| Scheduled | The customer has confirmed a booking. A requested date does not count. |
| Paid | Full payment is confirmed. A deposit does not count. |
| Review Request Sent | The service is complete and the review request has actually been sent and recorded. |

Use won/lost/abandoned statuses and a reason to record outcomes; retain history.
Payment and service completion require human confirmation. No payment processor
or booking system is assumed to be the source of truth for these stages.

## Provider configuration

Location: `Hdye2dupQT03NHLQbGTd`. Pipeline: `zZ0Y6ds1jqTa7tD3ZT6H`.

| Stage | Preserved or appended ID |
| --- | --- |
| New Lead | `d888d47b-59e2-4cda-a60b-a6c9c1524ce3` |
| Contacted | `19e9b391-2f13-48b8-a9a2-f420eab0445f` |
| Scheduled | `7ece5cda-023b-4204-8052-5543d8d78356` |
| Paid | `fd80dc8e-e31c-4283-9476-26e221306df6` |
| Review Request Sent | `c655a254-8d46-4ea8-ab83-81166a2867aa` |

The original three stage definitions, all other pipelines, and all 47 baseline
opportunities were read back unchanged after adding the two stages. Existing
records have not been migrated or reclassified.

### Website intake

Workflow `57dd228b-68a0-46eb-8203-dccdbdce19d0`,
**HQC Lead Management - Website Intake**:

1. Create/update the contact from incoming name, email and phone.
2. Save the enquiry in a contact note, including source, dates and form details.
3. Create a same-day review/response task assigned to Pedro.
4. Allow only `quote`, `quick-form` and `discount` into the sales branch.
5. Format today's date as ISO; create a Lead Management / New Lead opportunity
   with next-action text and date. Native duplicate protection remains enabled.
6. Wait one minute for the new opportunity to become searchable.
7. Find the most recent open Lead Management opportunity and assign Pedro only
   when it has no owner. Preserve existing owners and progress.

Contact messages and private feedback stop after the note and task; they do not
create a sales deal. Contact retains the existing `QUICK_FORM_WEBHOOK` binding
and is distinguished by `form_type=contact`.

Repeat enquiries remain visible as new notes/tasks. Sequential repeats reuse the
existing open deal. Closed history is preserved: Pedro must review whether to
reopen it or create a separate deal. Native duplicate controls are not a durable
idempotency ledger or proof of concurrent exactly-once processing.

### Paid job check

Workflow `33d6c223-63e5-43e1-982a-df070fac52ac`,
**HQC Lead Management - Paid Job Review Check**:

- Trigger: pipeline stage changed, Lead Management, Paid.
- Create Pedro's same-day completion-check task.
- Require full payment and completed service before requesting a review.
- Leave the card at Paid. A person records Review Request Sent after the actual
  send. The workflow contains no customer send action.
- Re-entry and multiple-opportunity handling are enabled; stop-on-response is off.

## Release and preservation

The website safeguards were already deployed from `59972c9`. The release changes
the four existing production receiver values to the tested intake and rebuilds
Cloudflare Pages. The binding names and the Contact form contract stay intact.
Preview configuration and PostHog configuration are preserved.

This intentionally replaces the website's entry into the older acknowledgement
and nurture paths. Their published definitions and historical records are kept;
the new intake does not invoke their customer messages. Manual customer contact
and review sending are part of Pedro's operating routine.

Previous production deployment: `70aeb5a8-3cf4-4fc7-aa19-b79c97d2ebf9`.
Rollback uses Cloudflare's previous successful production deployment. Original
secret values are masked by Cloudflare; do not claim they have been exported or
restore an empty masked value. Reconcile project receiver settings before a
subsequent rebuild following rollback.

## Verification and remaining gates

Direct receiver checks used the existing reserved DND fixture. They verified
resolved receipt fields for every form type, same-day Pedro tasks, a new sales
opportunity, delayed fallback ownership, repeat stage/owner preservation,
optional-phone preservation, and non-sales exclusion. The Paid transition created
the completion-check task and did not automatically advance to Review Request
Sent. Original opportunity records and external message history were compared
against frozen baselines; native opportunity activity entries are not messages.

Production form readback, final deployment receipt and the finished PDF are
recorded in the delivery evidence once checked. No real customer outcome is
inferred from synthetic checks. The four older Open/Lost reconciliation cases
remain Pedro's existing tasks; no outcome has been guessed and no duplicate
reconciliation tasks have been created.

Release accepted, 21 October 01:46 BST: public quote, quick form, discount,
contact and feedback submissions each returned JSON success with a unique
correlation reference and produced exactly one matching native GHL receipt and
one same-day task assigned to Pedro. Quote room counts, dates, consent and all
supplied attribution fields were read back; feedback rating/reference were saved.
The existing phone survived later submissions without a phone. Contact and
feedback produced no new sales deal. A further fresh public quote created a
New Lead with a next-action date and Pedro ownership after the one-minute wait.

The production forwarding failure was reproduced in workerd: `redirect: error`
is unsupported and throws before sending. The handler now uses `manual`; its
non-2xx guard refuses redirects without forwarding customer data to another
host. A new workerd regression fails before the change and passes afterwards,
including the redirect refusal. Bounded diagnostic logs contain only form kind,
phase category and HTTP status; no URLs, payloads or raw provider errors.
Cloudflare's [Request documentation](https://developers.cloudflare.com/workers/runtime-apis/request/?ref=blog.madbotz.com)
confirms the runtime restriction.

Accepted implementation: `82e301099cebdd6f9825ea6de709d12b71de7399`, production
deployment `e86069ec-c9b1-4ff6-a770-0f26967c8aaa`. Form routing, 22 handler/frontend
checks, the real workerd regression, seven analytics checks and the build pass.
The final documentation/guide commit will trigger a further deployment of the
same implementation; its deployment receipt is recorded in Blume after readback.

The two-page PDF explains stage criteria, the daily routine, repeat enquiries,
manual customer contact and review sends, and the live automation boundary.
Both rendered pages passed visual inspection, text bounds, overlap and required
wording checks. Source and sanitized acceptance evidence are included with it.

First genuine use remains an explicit handover gate: Pedro opens the next real
enquiry task, reads Notes, contacts the customer, and records the outcome and
next follow-up. Pedro owns that action; Jack owns the handover. Check it after
the next genuine enquiry or within two working days of handover. No customer
booking, payment, review or Pedro adoption is inferred from synthetic tests.

Final provider readback at 01:48 BST confirms both workflows published (intake v20,
Paid check v3), all five stages, and all 47 original opportunity records fully
unchanged after fixture cleanup. Test deals were removed, all 17 synthetic tasks
completed, and the fixture-only phone restored to its original empty value.
Customer message history is unchanged.

Private raw payloads, receiver URLs and provider snapshots are stored outside
the repository. They must not be committed. The Pedro PDF contains no customer
data, credentials or provider identifiers.
