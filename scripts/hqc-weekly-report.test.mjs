import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, symlink, link, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildReport, londonMidnight, LOCATION_ID, PIPELINE_ID } from './hqc-weekly-report.mjs';

const period = { from: '2026-10-19', to: '2026-10-26' };
const opportunity = (id, overrides = {}) => ({
  id, pipelineId: PIPELINE_ID, locationId: LOCATION_ID,
  createdAt: '2026-10-20T09:00:00Z', contactId: `contact-${id}`,
  contact: { tags: [] }, customFields: [], ...overrides,
});
const event = (opportunityId, type, occurredAt = '2026-10-20T09:00:00Z', extra = {}) => ({
  opportunityId, type, occurredAt, sourceRef: `${opportunityId}:${type}:${occurredAt}`, ...extra,
});
const snapshot = (opportunities = [], events = [], coverage = { opportunitiesComplete: true, eventsComplete: true }) => ({
  locationId: LOCATION_ID, pipelineId: PIPELINE_ID, coverage, opportunities, events,
});

test('receipt cohort, response median, quote/win denominators and unknown lost reasons', () => {
  const rows = ['a', 'b', 'c', 'd'].map(id => opportunity(id));
  const events = rows.map(r => event(r.id, 'enquiry_received'));
  events.push(event('a', 'first_human_response', '2026-10-20T09:10:00Z'),
    event('b', 'first_human_response', '2026-10-20T09:30:00Z'),
    event('a', 'quote_sent'), event('b', 'quote_sent'), event('a', 'won'),
    event('b', 'lost', '2026-10-22T09:00:00Z', { reasonCode: 'price' }), event('c', 'lost'));
  const { metrics: m, markdown } = buildReport(snapshot(rows, events), period);
  assert.equal(m.observedCohort, 4);
  assert.equal(m.medianResponseMs, 20 * 60000);
  assert.deepEqual([m.responded, m.quoted, m.won, m.lost, m.outcomeUnknown], [2, 2, 1, 2, 1]);
  assert.deepEqual(m.lostReasons, { Price: 1, 'Unknown / unclassified': 1 });
  assert.match(markdown, /Quote rate: 2\/4 \(50.0%\)/);
  assert.match(markdown, /Win rate: 1\/4 \(25.0%\)/);
  assert.match(markdown, /Price: 1\/2 \(50.0%\)/);
  assert.match(markdown, /2 without an evidenced response/);
});

test('deduplicates opportunity rows and event source evidence; distinct refs cannot inflate per-opportunity metrics', () => {
  const row = opportunity('a');
  const receipt = event('a', 'enquiry_received');
  const quote = event('a', 'quote_sent');
  const result = buildReport(snapshot([row, structuredClone(row)], [receipt, receipt, quote, quote,
    { ...receipt, sourceRef: 'second-copy' }, { ...quote, sourceRef: 'other-copy' }]), period);
  assert.equal(result.metrics.duplicateRows, 1);
  assert.equal(result.metrics.duplicateEvents, 2);
  assert.equal(result.metrics.observedCohort, 1);
  assert.equal(result.metrics.quoted, 1);
});

test('conflicting duplicate opportunity or source event fails closed', () => {
  const row = opportunity('a');
  assert.throws(() => buildReport(snapshot([row, { ...row, name: 'different' }]), period), /Conflicting duplicate opportunity/);
  const receipt = event('a', 'enquiry_received');
  assert.throws(() => buildReport(snapshot([row], [receipt, { ...receipt, occurredAt: '2026-10-20T10:00:00Z' }]), period), /Conflicting duplicate event/);
});

test('excludes tagged contacts across multiple opportunities, synthetic names and test/other pipelines', () => {
  const rows = [
    opportunity('tagged', { contactId: 'shared', contact: { tags: ['hqc-isolated-sales-test'] } }),
    opportunity('same-contact', { contactId: 'shared' }),
    opportunity('synthetic', { name: 'HQC Synthetic Enquiry' }),
    opportunity('name-test', { contact: { name: 'Isolated Test', tags: [] } }),
    opportunity('pipeline-test', { pipelineName: 'Isolated sales test' }),
    opportunity('other-pipeline', { pipelineId: 'test-pipeline' }),
    opportunity('other-location', { locationId: 'elsewhere' }), opportunity('real'),
  ];
  const result = buildReport(snapshot(rows, rows.map(r => event(r.id, 'enquiry_received'))), period);
  assert.equal(result.metrics.observedCohort, 1);
  assert.equal(result.metrics.excluded.test, 5);
  assert.equal(result.metrics.excluded.scope, 2);
  assert.equal(result.metrics.ignoredEvents, 7);
});

test('Contact and Feedback classifications are excluded from tags, source, named custom fields and explicit mapping', () => {
  const rows = [
    opportunity('contact', { contact: { tags: ['hqc-source-contact'] } }),
    opportunity('feedback', { source: 'Feedback' }),
    opportunity('custom', { customFields: [{ key: 'form_type', value: 'contact' }] }),
    opportunity('mapped', { reporting: { formType: 'feedback' } }),
    opportunity('native-field', { contact: { tags: [], customFields: [{ fieldKey: 'form_type', fieldValue: 'Contact' }] } }),
    opportunity('native-name', { name: 'Feedback form' }),
    opportunity('sales'),
  ];
  const { metrics } = buildReport(snapshot(rows, rows.map(r => event(r.id, 'enquiry_received'))), period);
  assert.equal(metrics.excluded.admin, 6);
  assert.equal(metrics.observedCohort, 1);
});

test('missing contact tags withhold row and make rates unavailable instead of certifying exclusions', () => {
  const { metrics, markdown } = buildReport(snapshot([opportunity('unknown', { contact: {} }), opportunity('a')],
    [event('a', 'enquiry_received')]), period);
  assert.equal(metrics.excluded.tagsUnknown, 1);
  assert.equal(metrics.complete, false);
  assert.match(markdown, /Quote rate: Unavailable/);
});

test('same contact with multiple sales opportunities remains two opportunities', () => {
  const rows = ['a', 'b'].map(id => opportunity(id, { contactId: 'same-contact' }));
  const result = buildReport(snapshot(rows, [event('a', 'enquiry_received'), event('b', 'enquiry_received'), event('a', 'won')]), period);
  assert.equal(result.metrics.observedCohort, 2);
  assert.match(result.markdown, /Win rate: 1\/2 \(50.0%\)/);
});

test('London midnight boundaries and elapsed response duration cross autumn DST correctly', () => {
  assert.equal(new Date(londonMidnight('2026-10-25')).toISOString(), '2026-10-24T23:00:00.000Z');
  assert.equal(londonMidnight('2026-10-26') - londonMidnight('2026-10-25'), 25 * 3600000);
  const rows = ['before', 'start', 'end'].map(id => opportunity(id));
  const result = buildReport(snapshot(rows, [
    event('before', 'enquiry_received', '2026-10-24T22:59:59Z'),
    event('start', 'enquiry_received', '2026-10-25T00:00:00+01:00'),
    event('start', 'first_human_response', '2026-10-25T02:00:00+00:00'),
    event('end', 'enquiry_received', '2026-10-26T00:00:00Z'),
  ]), { from: '2026-10-25', to: '2026-10-26' });
  assert.equal(result.metrics.observedCohort, 1);
  assert.equal(result.metrics.medianResponseMs, 3 * 3600000);
});

test('London spring DST day lasts 23 hours and UTC midnight does not define the end boundary', () => {
  assert.equal(londonMidnight('2026-03-30') - londonMidnight('2026-03-29'), 23 * 3600000);
  const result = buildReport(snapshot([opportunity('a'), opportunity('b')], [
    event('a', 'enquiry_received', '2026-03-29T22:59:59Z'),
    event('b', 'enquiry_received', '2026-03-29T23:00:00Z'),
  ]), { from: '2026-03-29', to: '2026-03-30' });
  assert.equal(result.metrics.observedCohort, 1);
});

test('partial or missing coverage is unavailable, even when arrays are empty; native observations stay separate', () => {
  for (const coverage of [{ opportunitiesComplete: true, eventsComplete: false },
    { opportunitiesComplete: false, eventsComplete: true }, { opportunitiesComplete: true }, undefined]) {
    const s = snapshot([opportunity('a')], [], coverage);
    if (coverage === undefined) delete s.coverage;
    const { markdown, metrics } = buildReport(s, period);
    assert.equal(metrics.complete, false);
    assert.match(markdown, /Weekly enquiries \(verified receipts, per opportunity\): Unavailable/);
    assert.match(markdown, /Win rate: Unavailable/);
    assert.match(markdown, /## Lost reasons[\s\S]*- Unavailable/);
    assert.equal(metrics.observedCreated, 1);
    assert.equal(metrics.createdWithoutReceipt, 1);
  }
});

test('complete empty cohort shows zero verified receipts but rates and response time are N/A', () => {
  const { markdown } = buildReport(snapshot(), period);
  assert.match(markdown, /per opportunity\): 0\./);
  assert.match(markdown, /Quote rate: N\/A \(0\/0/);
  assert.match(markdown, /Median elapsed time.*N\/A/);
  assert.doesNotMatch(markdown, /NaN|Infinity/);
});

test('unmatched opportunity evidence invalidates complete-looking totals instead of silently dropping enquiries', () => {
  const { metrics, markdown } = buildReport(snapshot([opportunity('a')], [
    event('a', 'enquiry_received'), event('missing-row', 'enquiry_received'),
  ]), period);
  assert.equal(metrics.unmatchedEvents, 1);
  assert.equal(metrics.complete, false);
  assert.equal(metrics.nativeComplete, false);
  assert.match(markdown, /Events with no matching opportunity row: 1/);
  assert.match(markdown, /Win rate: Unavailable/);
});

test('stage, lastMessage, Tasks and historical custom field dates never supply event evidence', () => {
  const row = opportunity('a', { status: 'won', pipelineStageName: 'Closed / Quote sent',
    lastMessage: { dateAdded: '2026-10-20T09:01:00Z' }, lastActivity: '2026-10-20T09:01:00Z',
    tasks: [{ completed: true }], customFields: [{ key: 'quote_date', value: '2026-10-20' }] });
  const { metrics } = buildReport(snapshot([row], [event('a', 'enquiry_received')]), period);
  assert.deepEqual([metrics.responded, metrics.quoted, metrics.won, metrics.lost, metrics.outcomeUnknown], [0, 0, 0, 0, 1]);
  assert.equal(metrics.medianResponseMs, null);
  assert.equal(buildReport(snapshot([row]), period).metrics.observedCohort, 0);
});

test('earliest lifetime receipt sets cohort; late and pre-receipt events cannot convert this cohort', () => {
  const rows = [opportunity('old'), opportunity('current')];
  const { metrics } = buildReport(snapshot(rows, [
    event('old', 'enquiry_received', '2026-10-01T09:00:00Z'), event('old', 'enquiry_received'),
    event('current', 'enquiry_received'), event('current', 'quote_sent', '2026-10-20T08:59:59Z'),
    event('current', 'first_human_response', '2026-10-26T00:00:00Z'),
    event('current', 'won', '2026-10-26T00:00:00Z'),
  ]), period);
  assert.equal(metrics.observedCohort, 1);
  assert.deepEqual([metrics.quoted, metrics.responded, metrics.won, metrics.beforeReceipt], [0, 0, 0, 1]);
});

test('latest terminal event determines outcome; simultaneous conflicts are unknown and conflicting reasons unclassified', () => {
  const rows = ['a', 'b', 'c'].map(id => opportunity(id));
  const events = rows.map(r => event(r.id, 'enquiry_received'));
  events.push(event('a', 'lost', undefined, { reasonCode: 'price' }), event('a', 'won', '2026-10-21T09:00:00Z'),
    event('b', 'won'), event('b', 'lost'), event('c', 'lost', undefined, { reasonCode: 'timing' }),
    event('c', 'lost', undefined, { sourceRef: 'other', reasonCode: 'competitor' }));
  const { metrics } = buildReport(snapshot(rows, events), period);
  assert.deepEqual([metrics.won, metrics.lost, metrics.outcomeUnknown, metrics.conflictingOutcomes], [1, 1, 1, 1]);
  assert.deepEqual(metrics.lostReasons, { 'Unknown / unclassified': 1 });
});

test('native dateAdded is supported, missing dates do not become fabricated submission dates', () => {
  const rows = [opportunity('a', { createdAt: undefined, dateAdded: '2026-10-20T09:00:00Z' }),
    opportunity('b', { createdAt: '2026-02-30T09:00:00Z' })];
  const { metrics, markdown } = buildReport(snapshot(rows, [event('b', 'enquiry_received')]), period);
  assert.equal(metrics.observedCreated, 1);
  assert.equal(metrics.missingCreated, 1);
  assert.equal(metrics.observedCohort, 1);
  assert.equal(metrics.nativeComplete, false);
  assert.match(markdown, /Opportunities created during period: Unavailable/);
});

test('malformed included event dates, unsupported events, wrong scope and impossible periods fail closed', () => {
  for (const date of ['2026-10-20T09:00:00', '2026-02-30T09:00:00Z', '2026-10-20T24:00:00Z']) {
    assert.throws(() => buildReport(snapshot([opportunity('a')], [event('a', 'enquiry_received', date)]), period), /valid ISO timestamp/);
  }
  assert.throws(() => buildReport(snapshot([opportunity('a')], [event('a', 'stage_changed')]), period), /supported type/);
  assert.throws(() => buildReport({ ...snapshot(), pipelineId: 'legacy' }, period), /current Lead Management/);
  assert.throws(() => buildReport(snapshot(), { ...period, from: '2026-02-30' }), /Invalid calendar/);
  assert.throws(() => buildReport(snapshot(), { from: period.to, to: period.from }), /later than/);
  assert.throws(() => buildReport(snapshot([], [], { eventsComplete: 'true' }), period), /booleans/);
});

test('aggregate Markdown does not emit contact identity, free-text notes or source references', () => {
  const row = opportunity('private-opportunity', { name: 'PRIVATE_NAME', contact: { tags: [], email: 'PRIVATE_EMAIL' } });
  const { markdown } = buildReport(snapshot([row], [event(row.id, 'enquiry_received'),
    event(row.id, 'lost', undefined, { reasonCode: 'other', reason: 'PRIVATE_NOTE', sourceRef: 'PRIVATE_REF' })]), period);
  assert.doesNotMatch(markdown, /PRIVATE_|private-opportunity/);
  assert.match(markdown, /Other: 1\/1/);
});

test('CLI writes aggregate Markdown, preserves input and existing output, and rejects invalid arguments', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'hqc-weekly-'));
  try {
    const input = join(dir, 'snapshot.json');
    const output = join(dir, 'report.md');
    const raw = JSON.stringify(snapshot([opportunity('a')], [event('a', 'enquiry_received')]));
    await writeFile(input, raw);
    const script = fileURLToPath(new URL('./hqc-weekly-report.mjs', import.meta.url));
    const args = ['--input', input, '--from', period.from, '--to', period.to, '--output', output];
    const run = extra => spawnSync(process.execPath, [script, ...extra], { encoding: 'utf8' });
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    assert.match(await readFile(output, 'utf8'), /# HQC weekly enquiry report/);
    assert.equal((await stat(output)).mode & 0o777, 0o600);
    assert.equal(await readFile(input, 'utf8'), raw);
    assert.equal(run(args).status, 1);
    assert.match(run(args).stderr, /Output already exists/);
    assert.equal(run([...args.slice(0, -1), input]).status, 1);
    const alias = join(dir, 'alias.json');
    await symlink(input, alias);
    assert.equal(run([...args.slice(0, -1), alias]).status, 1);
    const hardlink = join(dir, 'hardlink.json');
    await link(input, hardlink);
    assert.equal(run([...args.slice(0, -1), hardlink]).status, 1);
    assert.equal(await readFile(input, 'utf8'), raw);
    assert.equal(run([...args, '--from', period.from]).status, 1);
    assert.equal(run(['--input']).status, 1);
    assert.equal(run(['--help']).status, 0);
    await writeFile(input, '{invalid JSON with PRIVATE_DATA');
    const invalid = run([...args.slice(0, -1), join(dir, 'invalid.md')]);
    assert.equal(invalid.status, 1);
    assert.doesNotMatch(invalid.stderr, /PRIVATE_DATA/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
