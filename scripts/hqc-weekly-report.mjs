#!/usr/bin/env node
import { readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const LOCATION_ID = 'Hdye2dupQT03NHLQbGTd';
export const PIPELINE_ID = 'zZ0Y6ds1jqTa7tD3ZT6H';
const TYPES = new Set(['enquiry_received', 'first_human_response', 'quote_sent', 'won', 'lost']);
const REASONS = {
  price: 'Price', timing: 'Timing', service_fit: 'Service fit',
  no_response: 'No response', competitor: 'Competitor', other: 'Other',
};
const marker = /(?:^|[^a-z0-9])(?:test|synthetic|fixture|isolated|demo|qa)(?:$|[^a-z0-9])/i;
const adminRoute = /(?:^|[^a-z0-9])(?:contact|feedback)(?:$|[^a-z0-9])/i;
const text = value => typeof value === 'string' ? value.trim() : '';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(message); };

function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('Dates must use YYYY-MM-DD.');
  const ms = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value) fail('Invalid calendar date.');
  return ms;
}

export function londonMidnight(value) {
  const target = calendarDate(value);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  let instant = target;
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
    const local = Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`);
    instant = target - (local - instant);
  }
  return instant;
}

function timestamp(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match || +match[2] > 23 || +match[3] > 59 || +match[4] > 59 || +match[6] > 23 || +match[7] > 59) return null;
  try { calendarDate(match[1]); } catch { return null; }
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

function stable(value) {
  if (Array.isArray(value)) return JSON.stringify(value.map(v => JSON.parse(stable(v))));
  if (object(value)) return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map(k => [k, JSON.parse(stable(value[k]))])));
  return JSON.stringify(value);
}

// Only named classification fields are interpreted; arbitrary custom-field IDs need
// an explicit reporting.formType mapping by the snapshot exporter.
function classification(row) {
  const fields = [...(row.customFields ?? []), ...(row.contact?.customFields ?? [])];
  return [row.formType, row.form_type, row.reporting?.formType, row.source, row.name,
    ...fields.filter(f => object(f) && /^(?:form_type|formType|enquiry_type|enquiryType)$/.test(f.key ?? f.fieldKey ?? f.name ?? ''))
      .map(f => f.value ?? f.fieldValue), ...(row.contact?.tags ?? []), ...(row.tags ?? [])]
    .flat().map(text).filter(Boolean);
}

function isTest(row) {
  return row.reporting?.isTest === true || row.isTest === true ||
    [...(row.contact?.tags ?? []), ...(row.tags ?? [])].some(t => text(t).toLowerCase() === 'hqc-isolated-sales-test') ||
    [row.name, row.contact?.name, row.contact?.firstName, row.contact?.lastName, row.pipelineName,
      row.pipeline?.name].some(v => marker.test(text(v)));
}

export function buildReport(snapshot, { from, to }) {
  const start = londonMidnight(from);
  const end = londonMidnight(to);
  if (end <= start) fail('--to must be later than --from (exclusive end).');
  if (!object(snapshot) || snapshot.locationId !== LOCATION_ID || snapshot.pipelineId !== PIPELINE_ID) {
    fail('Snapshot must identify the HQC location and current Lead Management pipeline.');
  }
  if (!Array.isArray(snapshot.opportunities) || !Array.isArray(snapshot.events)) {
    fail('Snapshot requires opportunities/events arrays.');
  }
  const coverage = snapshot.coverage ?? {};
  if (!object(coverage) || ['opportunitiesComplete', 'eventsComplete'].some(key =>
    coverage[key] !== undefined && typeof coverage[key] !== 'boolean')) fail('Coverage flags must be booleans when supplied.');
  const rows = new Map();
  let duplicateRows = 0;
  for (const row of snapshot.opportunities) {
    if (!object(row) || !text(row.id) || !text(row.pipelineId)) fail('Each opportunity requires id and pipelineId.');
    if (row.contact !== undefined && !object(row.contact)) fail('Opportunity contact must be an object.');
    for (const owner of [row, row.contact]) {
      if (!owner) continue;
      if (owner.tags !== undefined && (!Array.isArray(owner.tags) || owner.tags.some(t => typeof t !== 'string'))) fail('Tags must be string arrays.');
      if (owner.customFields !== undefined && !Array.isArray(owner.customFields)) fail('customFields must be arrays.');
    }
    if (rows.has(row.id)) {
      if (stable(rows.get(row.id)) !== stable(row)) fail('Conflicting duplicate opportunity rows; reconcile snapshot first.');
      duplicateRows++;
    } else rows.set(row.id, row);
  }
  const contactId = row => text(row.contactId) || text(row.contact?.id);
  const testContacts = new Set([...rows.values()].filter(isTest).map(contactId).filter(Boolean));
  const excluded = { test: 0, scope: 0, admin: 0, tagsUnknown: 0 };
  const included = new Map();
  for (const row of rows.values()) {
    if (isTest(row) || testContacts.has(contactId(row))) { excluded.test++; continue; }
    if (row.pipelineId !== PIPELINE_ID || (row.locationId && row.locationId !== LOCATION_ID)) { excluded.scope++; continue; }
    if (classification(row).some(v => adminRoute.test(v))) { excluded.admin++; continue; }
    if (!Array.isArray(row.contact?.tags)) { excluded.tagsUnknown++; continue; }
    included.set(row.id, row);
  }
  const events = new Map([...included.keys()].map(id => [id, []]));
  const identities = new Map();
  let duplicateEvents = 0;
  let ignoredEvents = 0;
  let unmatchedEvents = 0;
  for (const event of snapshot.events) {
    if (!object(event) || !text(event.opportunityId)) fail('Each event requires opportunityId.');
    if (!rows.has(event.opportunityId)) { unmatchedEvents++; continue; }
    if (!included.has(event.opportunityId)) { ignoredEvents++; continue; }
    if (!TYPES.has(event.type) || !text(event.sourceRef)) fail('Included events require a supported type and non-empty sourceRef.');
    const at = timestamp(event.occurredAt);
    if (at === null) fail('Event occurredAt requires a valid ISO timestamp with timezone.');
    const key = JSON.stringify([event.opportunityId, event.type, event.sourceRef]);
    const reason = event.type === 'lost' && Object.hasOwn(REASONS, event.reasonCode) ? event.reasonCode : null;
    const signature = JSON.stringify([at, reason]);
    if (identities.has(key)) {
      if (identities.get(key) !== signature) fail('Conflicting duplicate event evidence; reconcile snapshot first.');
      duplicateEvents++;
      continue;
    }
    identities.set(key, signature);
    events.get(event.opportunityId).push({ type: event.type, at, reason });
  }
  let nativeCreated = 0;
  let missingCreated = 0;
  let nativeUpdated = 0;
  let nativeStageChanged = 0;
  let createdWithoutReceipt = 0;
  let cohortSize = 0;
  let quoted = 0;
  let won = 0;
  let lost = 0;
  let outcomeUnknown = 0;
  let conflictingOutcomes = 0;
  let beforeReceipt = 0;
  const responseMs = [];
  const lostReasons = new Map();
  const inWindow = at => at !== null && at >= start && at < end;
  for (const [id, row] of included) {
    const created = timestamp(row.createdAt ?? row.dateAdded);
    if (created === null) missingCreated++;
    if (inWindow(created)) nativeCreated++;
    if (inWindow(timestamp(row.updatedAt))) nativeUpdated++;
    if (inWindow(timestamp(row.lastStageChangeAt))) nativeStageChanged++;
    const history = events.get(id).filter(e => e.at < end).sort((a, b) => a.at - b.at);
    const receipt = history.find(e => e.type === 'enquiry_received');
    if (inWindow(created) && !receipt) createdWithoutReceipt++;
    if (!receipt || !inWindow(receipt.at)) continue;
    cohortSize++;
    beforeReceipt += history.filter(e => e.type !== 'enquiry_received' && e.at < receipt.at).length;
    const afterReceipt = history.filter(e => e.at >= receipt.at);
    const response = afterReceipt.find(e => e.type === 'first_human_response');
    if (response) responseMs.push(response.at - receipt.at);
    if (afterReceipt.some(e => e.type === 'quote_sent')) quoted++;
    const terminal = afterReceipt.filter(e => e.type === 'won' || e.type === 'lost');
    const latest = terminal.at(-1);
    const simultaneous = latest && terminal.filter(e => e.at === latest.at);
    if (!latest || new Set(simultaneous.map(e => e.type)).size > 1) {
      outcomeUnknown++;
      if (latest) conflictingOutcomes++;
    } else if (latest.type === 'won') won++;
    else {
      lost++;
      const codes = new Set(simultaneous.map(e => e.reason));
      const reason = codes.size === 1 && latest.reason ? REASONS[latest.reason] : 'Unknown / unclassified';
      lostReasons.set(reason, (lostReasons.get(reason) ?? 0) + 1);
    }
  }
  const complete = coverage.opportunitiesComplete === true && coverage.eventsComplete === true && excluded.tagsUnknown === 0 && unmatchedEvents === 0;
  const nativeComplete = coverage.opportunitiesComplete === true && excluded.tagsUnknown === 0 && missingCreated === 0 && unmatchedEvents === 0;
  responseMs.sort((a, b) => a - b);
  const median = responseMs.length ? (responseMs[Math.floor((responseMs.length - 1) / 2)] + responseMs[Math.floor(responseMs.length / 2)]) / 2 : null;
  const rate = count => cohortSize ? `${count}/${cohortSize} (${(count / cohortSize * 100).toFixed(1)}%)` : 'N/A (0/0; empty cohort)';
  const unavailable = 'Unavailable (incomplete coverage, missing contact tags or unmatched events)';
  const available = value => complete ? value : unavailable;
  const metrics = {
    complete, nativeComplete, observedCohort: cohortSize, observedCreated: nativeCreated,
    createdWithoutReceipt, missingCreated, responded: responseMs.length, medianResponseMs: median,
    quoted, won, lost, outcomeUnknown, conflictingOutcomes, beforeReceipt,
    lostReasons: Object.fromEntries([...lostReasons].sort(([a], [b]) => a.localeCompare(b))),
    duplicateEvents, duplicateRows, ignoredEvents, unmatchedEvents, excluded,
  };
  const lines = [
    '# HQC weekly enquiry report', '',
    `Period: ${from} inclusive to ${to} exclusive; Europe/London.`,
    `UTC boundaries: ${new Date(start).toISOString()} to ${new Date(end).toISOString()} (exclusive).`,
    `Location: ${LOCATION_ID}; Lead Management pipeline: ${PIPELINE_ID}.`, '',
    '## Coverage and scope', '',
    `- Opportunities complete: ${coverage.opportunitiesComplete ?? 'unknown'}; events complete: ${coverage.eventsComplete ?? 'unknown'}.`,
    '- Completeness asserts all relevant opportunity history and event evidence through the exclusive cutoff, including older receipts. This CLI cannot verify that assertion.',
    `- Excluded opportunities: test/synthetic ${excluded.test}; other pipeline/location ${excluded.scope}; Contact/Feedback ${excluded.admin}.`,
    `- Withheld for missing contact.tags: ${excluded.tagsUnknown}.`,
    `- Events with no matching opportunity row: ${unmatchedEvents}; any unmatched evidence makes totals/rates unavailable.`,
    `- Duplicate opportunity rows removed: ${duplicateRows}; duplicate event evidence removed: ${duplicateEvents}; events outside included opportunities ignored: ${ignoredEvents}.`, '',
    '## Native opportunity observations', '',
    `- Opportunities created during period: ${nativeComplete ? nativeCreated : 'Unavailable (incomplete opportunities, missing contact tags, unmatched events or missing/invalid creation dates)'}. Observed records: ${nativeCreated}.`,
    `- Missing/invalid native creation timestamps: ${missingCreated}. Native updatedAt in period: ${nativeUpdated}; native lastStageChangeAt in period: ${nativeStageChanged} (observations only).`,
    `- Created opportunities without a receipt event before cutoff: ${createdWithoutReceipt} observed. These are opportunities, not verified form submissions.`, '',
    '## Receipt cohort metrics', '',
    '- Cohort: distinct eligible opportunities whose earliest evidenced enquiry_received falls in the period. Same-contact opportunities remain separate; repeated receipts do not create additional enquiries.',
    '- Follow-up: from each receipt until the exclusive period end. Later responses, quotes and outcomes are excluded; recent enquiries have less time to convert.',
    `- Weekly enquiries (verified receipts, per opportunity): ${available(cohortSize)}. Observed cohort records: ${cohortSize}.`,
    `- First actual human response: ${available(`${responseMs.length}/${cohortSize} evidenced; ${cohortSize - responseMs.length} without an evidenced response by cutoff`)}.`,
    `- Median elapsed time to first actual human response: ${available(median === null ? 'N/A (no evidenced responses)' : `${(median / 60000).toFixed(1)} minutes; measured among ${responseMs.length} responded opportunities only`)}.`,
    `- Quote rate: ${available(rate(quoted))}; denominator is the entire receipt cohort, including unquoted opportunities.`,
    `- Win rate: ${available(rate(won))}; denominator is the entire receipt cohort, including lost and unresolved opportunities.`,
    `- Outcomes by cutoff: ${available(`${won} won; ${lost} lost; ${outcomeUnknown} without an unambiguous evidenced outcome (open/unknown)`)}.`,
    `- Without an evidenced quote by cutoff: ${available(cohortSize - quoted)}. Absence of evidence is not proof no quote or response happened.`,
    `- Cohort events before receipt ignored: ${beforeReceipt}; simultaneous contradictory terminal outcomes withheld: ${conflictingOutcomes}.`, '',
    '## Lost reasons', '',
    '- Latest evidenced terminal outcome by cutoff wins; simultaneous won/lost is unknown. Reasons use only the latest lost event, never the current stage or a stale custom field.',
    '- Denominator: cohort opportunities whose latest unambiguous outcome is lost. Missing/unrecognised/conflicting reasonCode is Unknown / unclassified; free text is not emitted.',
  ];
  if (!complete) lines.push(`- ${unavailable}.`);
  else if (!lost) lines.push('- N/A (0 lost cohort opportunities).');
  else for (const [reason, count] of Object.entries(metrics.lostReasons)) lines.push(`- ${reason}: ${count}/${lost} (${(count / lost * 100).toFixed(1)}%).`);
  lines.push('', 'No response is inferred from lastMessage, activity or Tasks; no quote is inferred from stage names; no won/lost outcome is inferred from Closed status or stage. Automated acknowledgements are not human responses.', '');
  return { markdown: lines.join('\n'), metrics };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length === 1 && argv[0] === '--help') {
    process.stdout.write('Usage: node scripts/hqc-weekly-report.mjs --input snapshot.json --from YYYY-MM-DD --to YYYY-MM-DD --output report.md\n');
    return;
  }
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    if (!['input', 'from', 'to', 'output'].includes(key) || argv[i] !== `--${key}` || !argv[i + 1] || argv[i + 1].startsWith('--') || Object.hasOwn(options, key)) {
      fail('Expected --input, --from, --to and --output exactly once; use --help.');
    }
    options[key] = argv[i + 1];
  }
  if (Object.keys(options).length !== 4) fail('Missing required arguments; use --help.');
  const inputPath = await realpath(resolve(options.input));
  const outputPath = resolve(options.output);
  let existingOutput;
  try { existingOutput = await realpath(outputPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (inputPath === outputPath || inputPath === existingOutput) fail('Output must not replace the input snapshot.');
  let snapshot;
  try { snapshot = JSON.parse(await readFile(inputPath, 'utf8')); } catch { fail('Cannot read a valid JSON snapshot.'); }
  const { markdown } = buildReport(snapshot, options);
  // Exclusive creation preserves existing files and hardlinks, including the input.
  await writeFile(outputPath, markdown, { flag: 'wx', mode: 0o600 });
  process.stdout.write('Weekly report written.\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    const message = error.code === 'EEXIST' ? 'Output already exists; choose a new report path.' :
      error.code ? `File operation failed (${error.code}).` : error instanceof SyntaxError ? 'Invalid JSON snapshot.' : error.message;
    process.stderr.write(`HQC weekly report: ${message}\n`);
    process.exitCode = 1;
  });
}
