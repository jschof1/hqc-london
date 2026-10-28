# HQC weekly enquiry report

Generate Pedro's weekly report locally from an already exported JSON snapshot:

```sh
node scripts/hqc-weekly-report.mjs \
  --input /private/path/snapshot.json \
  --from 2026-10-19 \
  --to 2026-10-26 \
  --output /private/path/report-2026-10-19.md

node --test scripts/hqc-weekly-report.test.mjs
```

The CLI uses only Node built-ins. It reads the snapshot and creates one Markdown
file; it does not connect to GHL, load credentials, mutate records, send messages,
schedule work or publish anything. Exporting and verifying source evidence is a
separate workflow. The output directory must already exist. Existing output files
are refused, including symlinks and hardlinks; input cannot be overwritten. New
reports have mode `0600`. Keep real exports and reports outside the repository.

`--from` is inclusive and `--to` exclusive, both at midnight in **Europe/London**.
Pass the following Monday as `--to` for a Monday–Sunday week. DST days can contain
23 or 25 hours. The report prints the equivalent UTC boundaries. Event durations
are actual elapsed time, including nights and weekends, rather than business hours.

## Capture current inventory

Use the existing private authenticated provider module; credentials stay outside
this repository. Its `connect()` returns `request(route, {method})`.

```sh
node scripts/hqc-weekly-export.mjs \
  --provider /private/path/provider.cjs \
  --output /private/path/current-inventory.json
```

The exporter makes one fixed HQC opportunity-search GET, checks identity and
reported total, and refuses incomplete inventory or 100 or more rows. It does not
paginate or make mutations. It creates a new private output and refuses existing
files. Import only a trusted local provider module: importing it executes its code.

`currentInventoryComplete:true` means the complete **current inventory** only.
It cannot establish deleted historical opportunities. Both historical
`opportunitiesComplete:false` and `eventsComplete:false` are always retained,
so this export cannot support verified receipt counts, response
times, quote/win rates or Lost reasons. Obtain and reconcile retained receipts and
actual response/quote/outcome events before asserting historical completeness.
The Markdown report is usable now for current-record observations and gaps.

## Snapshot contract

The root `locationId` and `pipelineId` must match these fixed values. Opportunity
rows retain native GHL fields. Add the small `reporting` object only when the
native data needs an explicit classification; do not turn stage changes or Tasks
into evidence events.

This example uses invented IDs only and contains no client/contact PII:

```json
{
  "locationId": "Hdye2dupQT03NHLQbGTd",
  "pipelineId": "zZ0Y6ds1jqTa7tD3ZT6H",
  "coverage": {
    "opportunitiesComplete": true,
    "eventsComplete": true
  },
  "opportunities": [
    {
      "id": "example-opportunity-1",
      "locationId": "Hdye2dupQT03NHLQbGTd",
      "pipelineId": "zZ0Y6ds1jqTa7tD3ZT6H",
      "contactId": "example-contact-1",
      "contact": { "id": "example-contact-1", "tags": [] },
      "createdAt": "2026-10-20T09:00:00Z",
      "updatedAt": "2026-10-21T10:00:00Z",
      "customFields": [],
      "reporting": { "formType": "quote", "isTest": false }
    }
  ],
  "events": [
    {
      "opportunityId": "example-opportunity-1",
      "type": "enquiry_received",
      "occurredAt": "2026-10-20T09:00:00Z",
      "sourceRef": "example-receipt-1"
    },
    {
      "opportunityId": "example-opportunity-1",
      "type": "first_human_response",
      "occurredAt": "2026-10-20T09:12:00Z",
      "sourceRef": "example-human-response-1"
    },
    {
      "opportunityId": "example-opportunity-1",
      "type": "quote_sent",
      "occurredAt": "2026-10-20T10:00:00Z",
      "sourceRef": "example-sent-quote-1"
    },
    {
      "opportunityId": "example-opportunity-1",
      "type": "lost",
      "occurredAt": "2026-10-21T10:00:00Z",
      "sourceRef": "example-recorded-outcome-1",
      "reasonCode": "price"
    }
  ]
}
```

Both arrays are required, even when empty. Coverage flags are booleans; omitted
flags mean unknown. Only explicit `true` authorises complete metrics. This asserts
that the export includes every relevant opportunity and its **entire event history
through the report cutoff**, including receipts before `--from`, archived records
and terminal outcomes. A current-week event export alone cannot establish the
earliest receipt or first response. A snapshot taken before `--to` cannot assert
complete coverage. The CLI cannot verify exporter assertions or source receipts.
If either coverage flag is false/missing, receipt metrics, rates, response times
and Lost reasons show **Unavailable**, even with empty event arrays. Observed
record counts remain visible and are explicitly partial evidence.

Each opportunity requires its own `id` and `pipelineId`, and an embedded
`contact.tags` string array fetched from the contact, including `[]` when verified
empty. Missing contact tags withhold the row and make totals/rates unavailable.
Use `contactId` or embedded `contact.id` to link test exclusions across opportunities.
Do not deduplicate real opportunities by contact: one contact can have several jobs.

Native creation time is `createdAt`, falling back to `dateAdded` only when absent.
Native `updatedAt` and `lastStageChangeAt` are shown separately as observations;
they never establish receipt, response, quote or outcome. Missing/invalid creation
timestamps make the created-opportunity total unavailable without preventing an
otherwise evidenced receipt cohort. Timestamps must be ISO date-times with seconds
and `Z` or an explicit `±HH:MM` offset; date-only and timezone-less values are not
accepted as event evidence.

## Exclusions and classification

- Only the named location's current Lead Management pipeline is eligible. Rows
  from a different location or pipeline are excluded, including test pipelines.
  Omitted row `locationId` inherits the root location's scope.
- Exclude `hqc-isolated-sales-test` in embedded contact tags or top-level tags,
  `isTest: true` or `reporting.isTest: true`, and names/pipeline names containing
  whole marker tokens `test`, `synthetic`, `fixture`, `isolated`, `demo` or `qa`
  (case insensitive). Inspect native opportunity `name`, embedded contact
  `name`/`firstName`/`lastName`, `pipelineName` and `pipeline.name`. A known test
  contact excludes **all** its opportunities, including otherwise unmarked rows.
- Contact and Feedback are excluded from opportunity `name`, `source`, `formType`, `form_type`,
  `reporting.formType`, contact/top-level tags and named classification fields.
  These are conservative whole-token matches, including tags such as
  `hqc-source-contact`. They do not match ordinary names containing a substring.
- Native opportunity/contact `customFields` arrays can use `key`, `fieldKey` or
  `name` of `form_type`, `formType`, `enquiry_type` or `enquiryType`, with `value`
  or `fieldValue`. Opaque native custom-field IDs are **not guessed**: the exporter
  must map their verified meaning to `reporting.formType`. Do the same for other
  synthetic-name conventions via `reporting.isTest`. `isTest: false` never cancels
  another exclusion. Include verified classification metadata to ensure admin
  Contact/Feedback records cannot pass as sales merely by being in this pipeline.

Identical opportunity rows with the same ID are deduplicated. Conflicting rows for
one ID fail rather than selecting one silently. Events for excluded opportunities
are ignored. Events with no opportunity row make totals/rates unavailable: include
their rows so eligibility can be checked, even if the rows will be excluded.
Valid included events require `opportunityId`, supported `type`, valid
`occurredAt` and non-empty `sourceRef`. The reference must identify inspectable
evidence, not an invented attribution; it is never printed in the report.

Event deduplication uses `(opportunityId, type, sourceRef)`. Conflicting timestamps
or recognised loss codes for that identity fail. Equivalent timestamp offsets are
accepted as the same instant. Different references for the same action cannot
inflate cohort rates: each opportunity contributes at most once to each metric.
Use a different reference for a later distinct action or corrected evidence.

## Evidence and metric definitions

| Metric / event | Definition |
| --- | --- |
| Native opportunities created | Eligible rows whose native creation timestamp is in the period. This is an opportunity count, **not verified submissions**, especially when receipt events are absent. |
| Weekly enquiries / `enquiry_received` | Distinct eligible opportunities whose **earliest lifetime evidenced receipt** is in the period. A receipt proves the received enquiry; opportunity creation alone does not. Repeated submissions on one opportunity remain one cohort member. This report does not count all form submissions. |
| `first_human_response` | Evidence of the actual first human response to that opportunity's enquiry, on any verified response channel. An automated acknowledgement, inbound message, activity timestamp, task completion or stage label does not qualify. A sent-message receipt does not establish delivery/read status. |
| Time to first response | Median elapsed receipt-to-first-evidenced-human-response time, among responded cohort opportunities only. The response must be at/after receipt and before the exclusive cutoff. The report gives the measured sample and number without an evidenced response. With no responses the median is N/A, never zero. |
| Quote rate / `quote_sent` | Cohort opportunities with an evidenced sent quote by cutoff / **all cohort opportunities**. Prepared quotes and old stage names are insufficient. |
| Win rate / `won` | Cohort opportunities whose latest unambiguous evidenced terminal outcome by cutoff is won / **all cohort opportunities**. This is cohort conversion, not wins divided by decided jobs. No payment or service completion is inferred. |
| `lost` / Lost reasons | Latest evidenced terminal outcome must be lost. Reason distribution denominator is these lost cohort opportunities only. Use the reason on the latest lost event, not a stale opportunity custom field. |

All follow-up ends at the same exclusive `--to`. This is a short observation window
for recent enquiries, not a lifetime conversion forecast. Events before the receipt
cannot establish response/quote/outcome; the report counts these anomalies. Latest
terminal evidence determines won/lost; simultaneous won and lost are unknown and
counted as conflicts. No terminal event means **open/unknown**, regardless of a
Closed stage/status. Reopening without an explicit supported outcome is not modelled;
do not claim current lifecycle status from this report. No-event response/quote
counts describe missing evidence, not proof that a human never acted. Empty cohort
rates are N/A (`0/0`).

Lost events may carry `reasonCode`: `price`, `timing`, `service_fit`, `no_response`,
`competitor` or `other`. Exporters must map only a verified recorded reason to these
categories; they must not guess from notes, stages or silence. Missing, unrecognised
or conflicting simultaneous loss codes are **Unknown / unclassified**, with a count
and denominator. Free-text reasons, contact identifiers, names, source references
and custom-field values are not emitted, to avoid copying PII into reports. An
explicit `other` remains distinct from an unclassified reason.

The CLI validates structure and evidence consistency; it cannot prove that an
export is exhaustive, that a reported human action happened, or that Pedro has
adopted the workflow. Review the resulting aggregates against the retained source
evidence before using them for a client or commercial decision.
