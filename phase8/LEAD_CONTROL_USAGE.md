# HQC internal lead review controls

This is a dependency-free, one-shot **internal human review task planner** and
an explicitly imported apply adapter. It is not customer chasing. It never sends
messages, publishes/enrols workflows, updates a contact, deletes old tasks,
changes pipeline/stage/status or fabricates last customer contact. There is no
scheduler, recurring runner, credential loader or automatic checkpoint advancement.

```sh
node scripts/hqc-lead-controls.mjs --input /private/path/plan.json --output /private/path/output.json
node --test scripts/hqc-lead-controls.test.mjs
```

The CLI only plans. There is no apply flag. It creates a new `0600` JSON output and
refuses existing files, preserving the input. Ineligible inputs produce
`{eligible:false,reason,expected:null,updates:null,task:null}`. A successful CLI exit
means planning finished; inspect `eligible`. Keep plans/journals outside the repo:
they retain private native records and evidence references. Examples below use
invented record/field identifiers, not PII or verified provider field bindings.

## Pure planner contract

```js
import { planControls, applyControls, readOpportunityForControls } from './scripts/hqc-lead-controls.mjs';
const plan = planControls({ opportunity, contact, anchor, receipt, now, holidays });
// => { eligible, reason, expected, updates, task }
```

Use complete native opportunity/contact rows from one operator-selected record.
Do not select an opportunity by contact, name search, old pipeline contracts or
the first result. Enrich the opportunity with **verified** `controlFieldIds` for
these six opportunity fields, without changing the native record:

```json
{
  "required_service_date": "example-service-field",
  "checkout_date": "example-checkout-field",
  "inspection_date": "example-inspection-field",
  "move_in_date": "example-movein-field",
  "next_action": "example-action-field",
  "next_action_date": "example-action-date-field"
}
```

All six must have unique IDs. Parent owns native Draft/date-field provisioning,
ID/type verification and provider proof. This adapter does not discover fields.
For example, a native `opportunity.movein_date` key maps to the planner's canonical
`move_in_date` through its verified ID. Native `customFields` must be a complete
array of `{id,fieldValue}` (or `{id,value}`); conflicting value aliases reject.
Date/text bindings must read back strings, with dates exactly `YYYY-MM-DD`. The
adapter writes `{customFields:[{id,fieldValue}],assignedTo?}` only. A parent binding
must prove that these partial field updates merge without clearing other fields;
readback checks also retain unrelated custom fields. No epoch/date-format guessing
or retrying a failed native date conversion is performed.

Required native opportunity properties: `id`, `contactId`, `locationId`,
`pipelineId`, `pipelineStageId`, `status`, `updatedAt`, `customFields`. `assignedTo`
is preserved; an empty owner falls back to Pedro `JMa0rVXwL125C0Uo7Ocu`. Contact
requires `id`, `locationId`, explicit boolean `dnd` and complete string-array `tags`.
Optional native `dndSettings` must be an object; any active channel is a restriction.

Scope is fixed to location `Hdye2dupQT03NHLQbGTd` and these open opportunities:

| Pipeline | Allowed stage IDs |
| --- | --- |
| Lead Management `zZ0Y6ds1jqTa7tD3ZT6H` | New Lead `d888d47b-59e2-4cda-a60b-a6c9c1524ce3`; Contacted `19e9b391-2f13-48b8-a9a2-f420eab0445f` |
| Isolated `mTL9j3EzgxRFm3I4neD7` | Only `35e10670-8c2d-4dda-b89e-b2f254b3c543`, with contact `dnd:true`, tag `hqc-isolated-sales-test` and an opportunity/contact name containing the token `isolated` |

Booked, Paid, Review Sent, all other stages/pipelines and every non-`open` status
reject. Test/synthetic/isolated/fixture name tokens or the isolated-test tag reject
in the real pipeline. Never repurpose the Work OS old-pipeline contract. Parent
must provide sales-only source records; receipts with `formType:contact|feedback`
always skip. No search, stage migration or native enrolment is part of this work.

The anchor adds `opportunityId` to the requested evidence shape so the link is
explicit and checked. Supply an immutable operator-reviewed evidence record:

```json
{
  "kind": "quote_sent",
  "id": "example-anchor-1",
  "opportunityId": "example-opportunity-1",
  "occurredAt": "2026-10-23T09:00:00Z",
  "sourceRef": "retained-evidence/example-quote-receipt",
  "completedCheckpoints": [],
  "signals": {
    "replied": false,
    "declined": false,
    "accepted": false,
    "deliveryFailed": false,
    "serviceDatesChanged": false
  },
  "requiredDateFields": []
}
```

`kind` is `new_enquiry`, `contacted`, `information_requested` or `quote_sent`.
Unknown completed-checkpoint IDs reject rather than silently scheduling again.
IDs use letters, digits, dot, underscore or hyphen (up to 128 characters); source
references are retained operator evidence, not inferred timestamps. All five
signals and both arrays are explicit; unknown signals must be reviewed rather than
silently defaulted false. Anchor timestamps cannot be in the future. All timestamp
inputs, including `now`, require ISO date-times with seconds and timezone.

Optional `receipt` has sales `formType:quote|quick-form|discount` (`quick` is a legacy alias), `submissionId`,
`receivedAt`, and any of `required_service_date`, `desired_date`, `checkout_date`,
`inspection_date`, `move_in_date`. For `new_enquiry` it is required: anchor `id`
equals `submissionId`, and `occurredAt` equals `receivedAt` as an instant. For
other anchors it is optional source-backed operator input; do not reconstruct it
from stage names or an old opportunity.

`desired_date` aliases only `required_service_date`; `movein_date` is also accepted
as an alias for `move_in_date`. Conflicting nonblank aliases reject. Four dates stay
separate. Populate only empty date fields on New Lead/the isolated fixture. Never
populate them on Contacted or clear existing dates. A supplied date conflicting
with a native date rejects; identical dates remain untouched. `requiredDateFields`
contains canonical date keys only; a missing required date makes immediate review.

## Calendar and ownership policy

Dates use Europe/London civil days; `holidays` is an explicit array of `YYYY-MM-DD`
nonworking dates. The minimal policy knows weekends and supplied holidays only;
it does not fetch or claim a complete UK holiday calendar. Calendar checkpoints
roll forward over weekends and supplied holidays. Working-day addition starts on
the following day. Future tasks are due at 17:00 London, using the correct DST
offset; checkpoints already due today or earlier use `now`.

| Anchor | Stable checkpoint IDs / due policy |
| --- | --- |
| `new_enquiry` | `receipt-working-day`: receipt's London day, rolled forward if nonworking |
| `contacted` | `day-1-working`: +1 working day |
| `information_requested` | `day-1-working`, `day-3-calendar` |
| `quote_sent` | `day-1-working`, `day-3-calendar`, `day-7-calendar`, `day-10-calendar` |

Choose the first checkpoint absent from `completedCheckpoints`. The parent must
link completion to real native task evidence; there is no automatic next run.
All completed means ineligible. Never automatically delete, complete, supersede
or recreate old tasks.

The earliest of all four effective dates wins. If it is today/past, at or before
the final checkpoint, or for a quote at or before anchor +10 calendar days, use an
immediate `exception` checkpoint. Any DND, reply, decline, acceptance, delivery
failure, changed-date signal or missing required date does the same. This remains
an internal review task, not permission to draft/send or an ordinary chase. An
already completed `exception` is not recreated for that anchor.

Next Action ownership is the exact tag `[hqc-control:<anchor.id>]`. Any existing
action or paired/unpaired date without that tag rejects and is preserved. Even a
different control anchor is foreign; parent must reconcile it manually. Owned
values can be updated. No field for last customer contact is written.

Task keys are `[hqc-control:<opportunity.id>:<anchor.id>:<checkpoint>]`, in both
title and body. Tasks belong to the exact contact, but retain opportunity identity
so two jobs for the same contact never collapse. Every task says to check the
actual current reply, deadlines, DND and restrictions before drafting or contact.

## Explicit parent apply binding

Only the imported adapter can apply a reviewed eligible plan:

```js
// parentNoRetryRequest is supplied by the parent; nothing here loads credentials.
const result = await applyControls({
  request: parentNoRetryRequest,
  plan,
  journalDir: '/private/operator-owned/hqc-control-journal'
});
```

`request(route,{method,body?})` returns the native JSON payload or throws. It must
make **one attempt only** for PUT/POST, including transport failures; do not hide
automatic retries in the parent helper. Fixed routes/methods are:

- GET/PUT `/opportunities/<exact-id>`; GET unwraps `{opportunity}` or a native row.
- GET `/contacts/<exact-contact-id>`; unwraps `{contact}` or a native row. This
  necessary read checks fresh DND/tags/location; no contact write is allowed.
- GET/POST `/contacts/<exact-contact-id>/tasks`; GET returns `{tasks:[...]}` or the
  complete array. POST returns `{task:{id,...}}` or the task row. Lists must be
  exhaustive; pagination markers reject. Tasks must have explicit native boolean
  `completed`. POST body is only `title`, `body`, `dueDate`, `completed`, `assignedTo`.

There are no messaging, destination-send, workflow, bulk, task-delete or task-update
routes. Existing completed tasks return `existing_completed` without mutation;
duplicate/mismatched tasks stop for manual reconciliation. No provider calls are
made by importing the module or running its planning CLI.

The adapter requires its original reproducible plan, reads the exact opportunity
and contact, compares revision/owner/stage/status/fields/DND/tags, and checks tasks.
It creates a private per-opportunity exclusive lock and fsynced journal before any
mutation. It re-reads after durable preparation, immediately before PUT. Both
opportunity fields and the task are read back, including unrelated custom fields.
The final durable state is `verified`; reapplying the **same exact plan** verifies
the native result and returns `existing_verified` without another PUT/POST. A new
plan for an existing checkpoint requires reconciliation, not a second mutation.

A thrown write may already have landed. The journal persists `unknown`, and any
in-flight/unknown entry blocks **all** further applies for that opportunity without
API calls. Do not retry, delete a journal, change directory or invent a new anchor
to bypass this. A crash leaves its exclusive lock in place; the adapter never
removes someone else's/stale lock. Parent must inspect native opportunity/task
evidence and durable intended payloads, then manually reconcile before any further
operation. A lock/journal storage failure stops progress; it never authorises retry.
Permissions must be private (`0700` directory / `0600` files), owned and without
symlinked journal files; this is local persistence, not a distributed lock.

**Concurrency limit:** native GET/PUT and task-list/POST offer no atomic
compare-and-set/unique-key contract through this interface. Fresh comparisons catch
observed races, and readback catches observable collateral changes, but another
provider writer can edit between the final GET and PUT or between task GET and
POST. The local lock covers only users of this journal on this filesystem. Do not
claim atomic safety or unattended multiwriter production readiness. Parent must
keep the DND fixture exclusive during its live proof; real-record use needs an
external exclusive-write boundary or a verified native conditional-write contract.
No unsafe retry or provider-lock simulation is supplied here. Native date storage,
workflow Draft state, absence of customer messages/enrolment and provider receipts
remain the parent's live-proof gates.

## Native proof on 28 October 2026

The parent applied a new-enquiry plan to one separate DND-protected fixture with
an invalid email and no phone. All four distinct service dates, Next Action and
Next Action Date read back; one Pedro-assigned internal exception task was
verified. Reapplying the same plan returned the same task without a mutation.
DND correctly chose immediate internal review. Ordinary cadence and calendar
branches are covered by unit tests, not a natural inbound workflow run.

The new task was completed and only its new opportunity deleted. A fresh provider
inventory confirmed all 47 original opportunities' business fields unchanged,
no extra opportunity, and no outbound SMS/email on the new fixture. The separate
DND test contact and completed task are retained as audit evidence.

Native GET omits `customFields` on a completely empty new opportunity. Use
`readOpportunityForControls({request, opportunityId, controlFieldIds})` to fetch
one exact ID. This checks identity, location and the remaining required native
properties, then normalizes only an omitted array to `[]`; explicit null/invalid
arrays still reject. It never normalizes search rows or arbitrary planner input.
The apply adapter uses the same exact-read binding. Generic planner input still
requires an explicit array. The first fixture proof seeded a control-owned action;
the follow-up proof exercises the exact-ID binding without any seed.
The native date-mapping clone is saved as Draft and has not received a natural
inbound test. Nothing in this proof authorizes publication or automatic chasing.

## Resolve an uncertain journal entry

Only a named human operator may resolve an unknown write, during an exclusive
write window. This is reconciliation, never permission to resend or retry a
possibly accepted mutation. Stop the originating process and establish that its
request has terminated; a fresh GET alone cannot rule out a late write.

1. Copy the private journal byte-for-byte to a new timestamped `0600` backup.
   Retain its hash, the original error and both intended payloads. Confirm no
   runner still owns the lock, including any remote provider operation.
2. Capture exact opportunity/contact GETs and the complete task list, and retain
   provider request/status evidence. Compare all expected and target fields,
   native identity, owner, stage, status, DND and exact task key/body/date/owner.
3. If terminal provider evidence proves **no write landed**, the opportunity is
   identical to the expected projection and no matching task exists, resolve to
   `aborted`. If both intended effects landed exactly once and fully match the
   target projection and native task, resolve to `verified` and record `taskId`.
   Partial effects, duplicate tasks, ambiguous terminal status or any mismatch
   remain `unknown`; investigate/repair separately and never relabel to retry.
4. Preserve the original entry and add `resolution:{operator,at,previousState,
   evidenceRefs,backupSha256}` before changing its `state`. Use a private temporary
   file, fsync it, atomically rename it over the journal and fsync the directory.
   Do not delete history, change journal directories or invent a fresh anchor.
   Remove a stale local lock only after the same operator proves its process and
   provider request have ended, recording that evidence alongside the resolution.
5. A subsequent apply still rechecks native state against its retained plan.
   A verified resolution only permits idempotent readback. Replan after an
   aborted resolution; retain every old plan and resolution for review.

A failure while the entry is merely `prepared` is recorded as `aborted`: the
adapter has issued no PUT/POST yet. After the first possible write it remains
`unknown` until the explicit reconciliation above. No automatic resolver exists.
