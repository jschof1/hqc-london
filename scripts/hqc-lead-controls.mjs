#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, lstat, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const LOCATION_ID = 'Hdye2dupQT03NHLQbGTd';
export const PIPELINE_ID = 'zZ0Y6ds1jqTa7tD3ZT6H';
export const NEW_LEAD = 'd888d47b-59e2-4cda-a60b-a6c9c1524ce3';
export const CONTACTED = '19e9b391-2f13-48b8-a9a2-f420eab0445f';
export const ISOLATED_PIPELINE = 'mTL9j3EzgxRFm3I4neD7';
export const ISOLATED_STAGE = '35e10670-8c2d-4dda-b89e-b2f254b3c543';
export const PEDRO = 'JMa0rVXwL125C0Uo7Ocu';
export const DATE_FIELDS = ['required_service_date', 'checkout_date', 'inspection_date', 'move_in_date'];
const FIELD_KEYS = [...DATE_FIELDS, 'next_action', 'next_action_date'];
const SIGNALS = ['replied', 'declined', 'accepted', 'deliveryFailed', 'serviceDatesChanged'];
const KINDS = ['new_enquiry', 'contacted', 'information_requested', 'quote_sent'];
const CHECKPOINTS = ['receipt-working-day', 'day-1-working', 'day-3-calendar', 'day-7-calendar', 'day-10-calendar', 'exception'];
const DAY = 86400000;
const validId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const empty = value => value === undefined || value === null || value === '';
const error = message => { throw new Error(message); };
const sortedJSON = value => JSON.stringify(value, function (key, v) {
  return object(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v;
});
const same = (a, b) => sortedJSON(a) === sortedJSON(b);
const clone = value => JSON.parse(JSON.stringify(value));

function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) error('Expected YYYY-MM-DD date.');
  const ms = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value) error('Invalid calendar date.');
  return value;
}
function instant(value) {
  const m = typeof value === 'string' && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!m || +m[2] > 23 || +m[3] > 59 || +m[4] > 59 || +m[6] > 23 || +m[7] > 59) error('Expected ISO timestamp with timezone.');
  date(m[1]);
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) error('Invalid timestamp.');
  return ms;
}
function localDay(ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ms).map(p => [p.type, p.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function localTime(day, hour) {
  const target = Date.parse(`${day}T${hour}:00:00Z`);
  let candidate = target;
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(candidate).map(p => [p.type, p.value]));
    candidate = target - (Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`) - candidate);
  }
  return new Date(candidate).toISOString();
}
const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
function working(day, holidays) {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  return weekday !== 0 && weekday !== 6 && !holidays.has(day);
}
function roll(day, holidays) {
  for (let n = 0; n < 370; n++, day = addDays(day, 1)) if (working(day, holidays)) return day;
  error('No working day within calendar policy limit.');
}
function addWorking(day, holidays) { return roll(addDays(day, 1), holidays); }

function fieldIds(opportunity) {
  const ids = opportunity.controlFieldIds;
  if (!object(ids) || FIELD_KEYS.some(key => !validId(ids[key])) || Object.keys(ids).length !== FIELD_KEYS.length || new Set(Object.values(ids)).size !== FIELD_KEYS.length) {
    error('Require six unique verified controlFieldIds; no field-ID guessing.');
  }
  return Object.fromEntries(FIELD_KEYS.map(key => [key, ids[key]]));
}
function fields(row, ids) {
  if (!Array.isArray(row.customFields)) error('Require complete native opportunity customFields array.');
  const values = {};
  for (const [key, id] of Object.entries(ids)) {
    const matches = row.customFields.filter(f => f?.id === id);
    if (matches.length > 1) error('Duplicate native control field.');
    const f = matches[0];
    if (f && !empty(f.fieldValue) && !empty(f.value) && f.fieldValue !== f.value) error('Native field value aliases conflict.');
    const value = f?.fieldValue ?? f?.value ?? '';
    if (typeof value !== 'string') error('Control fields require verified string date/text bindings.');
    values[key] = value;
  }
  for (const key of [...DATE_FIELDS, 'next_action_date']) if (values[key]) date(values[key]);
  return values;
}
function oppProjection(row, ids) {
  if (!object(row) || !validId(row.id) || !validId(row.contactId) || !row.updatedAt) error('Opportunity requires id, contactId and native updatedAt revision.');
  instant(row.updatedAt);
  if (!empty(row.assignedTo) && !validId(row.assignedTo)) error('Native assignedTo must be an owner id.');
  return {
    id: row.id, contactId: row.contactId, locationId: row.locationId,
    pipelineId: row.pipelineId, pipelineStageId: row.pipelineStageId,
    status: row.status, name: row.name ?? '', assignedTo: row.assignedTo ?? '',
    updatedAt: row.updatedAt, fields: fields(row, ids),
    otherCustomFields: row.customFields.filter(f => !Object.values(ids).includes(f.id)).map(clone).sort((a, b) => sortedJSON(a).localeCompare(sortedJSON(b))),
  };
}
function bindExactOpportunity(payload, opportunityId, ids) {
  const row = unwrap(payload, 'opportunity');
  if (row.id !== opportunityId || row.locationId !== LOCATION_ID ||
    !validId(row.pipelineId) || !validId(row.pipelineStageId) || typeof row.name !== 'string' ||
    typeof row.status !== 'string') error('Incomplete or mismatched exact-ID opportunity GET.');
  const bound = { ...row, customFields: row.customFields === undefined ? [] : row.customFields, controlFieldIds: ids };
  oppProjection(bound, ids);
  return bound;
}
export async function readOpportunityForControls({ request, opportunityId, controlFieldIds }) {
  if (typeof request !== 'function' || !validId(opportunityId)) error('Require exact opportunity id and request binding.');
  const ids = fieldIds({ controlFieldIds });
  return bindExactOpportunity(await request(`/opportunities/${opportunityId}`, { method: 'GET' }), opportunityId, ids);
}
function contactProjection(row) {
  if (!object(row) || !validId(row.id) || typeof row.dnd !== 'boolean' || !Array.isArray(row.tags) || row.tags.some(t => typeof t !== 'string')) error('Contact requires id, explicit native dnd and complete tags.');
  if (row.dndSettings !== undefined && !object(row.dndSettings)) error('Native dndSettings must be an object.');
  return {
    id: row.id, locationId: row.locationId, dnd: row.dnd,
    dndSettings: row.dndSettings ?? {}, tags: [...row.tags].sort(),
    name: row.name ?? '', firstName: row.firstName ?? '', lastName: row.lastName ?? '',
  };
}
function eligibleScope(o, c) {
  if (o.locationId !== LOCATION_ID || c.locationId !== LOCATION_ID || o.contactId !== c.id) error('Exact HQC opportunity/contact location linkage required.');
  if (o.status !== 'open') error('Closed/non-open opportunities are excluded.');
  const tagged = c.tags.includes('hqc-isolated-sales-test');
  const isolatedName = /\bisolated\b/i.test(`${o.name} ${c.name} ${c.firstName} ${c.lastName}`);
  if (o.pipelineId === ISOLATED_PIPELINE && o.pipelineStageId === ISOLATED_STAGE && c.dnd && tagged && isolatedName) return true;
  if (o.pipelineId !== PIPELINE_ID || ![NEW_LEAD, CONTACTED].includes(o.pipelineStageId)) error('Pipeline/stage is outside the open New Lead/Contacted allowlist.');
  if (tagged || /(?:^|[^a-z0-9])(?:test|synthetic|isolated|fixture)(?:$|[^a-z0-9])/i.test(`${o.name} ${c.name} ${c.firstName} ${c.lastName}`)) error('Test/synthetic contacts are allowed only in the exact DND isolated fixture.');
  return false;
}
function receiptDates(receipt) {
  const dates = {};
  for (const key of DATE_FIELDS) {
    const alias = key === 'required_service_date' ? 'desired_date' : key === 'move_in_date' ? 'movein_date' : key;
    const a = receipt?.[key];
    const b = receipt?.[alias];
    if (!empty(a) && !empty(b) && a !== b) error('Receipt canonical/alias dates conflict.');
    dates[key] = empty(a) ? (empty(b) ? '' : date(b)) : date(a);
  }
  return dates;
}

export function planControls(input = {}) {
  try {
    const { opportunity, contact, anchor, receipt, now, holidays = [] } = input ?? {};
    if (receipt && ['contact', 'feedback'].includes(receipt.formType)) error('Contact/Feedback is outside sales controls.');
    const ids = fieldIds(opportunity);
    const o = oppProjection(opportunity, ids);
    const c = contactProjection(contact);
    const isolated = eligibleScope(o, c);
    const nowMs = instant(now);
    if (!object(anchor) || !validId(anchor.id) || anchor.opportunityId !== o.id || !KINDS.includes(anchor.kind) || typeof anchor.sourceRef !== 'string' || !anchor.sourceRef.trim()) error('Require immutable source-backed anchor linked to this exact opportunity.');
    const anchorMs = instant(anchor.occurredAt);
    if (anchorMs > nowMs) error('Anchor is in the future.');
    if (!Array.isArray(anchor.completedCheckpoints) || !Array.isArray(anchor.requiredDateFields) || anchor.completedCheckpoints.some(x => !CHECKPOINTS.includes(x)) || anchor.requiredDateFields.some(x => !DATE_FIELDS.includes(x))) error('Require explicit valid completedCheckpoints and canonical requiredDateFields arrays.');
    if (!object(anchor.signals) || SIGNALS.some(key => typeof anchor.signals[key] !== 'boolean')) error('Require all five explicitly reviewed boolean anchor signals.');
    if (!Array.isArray(holidays)) error('holidays must be explicit YYYY-MM-DD dates.');
    const holidaySet = new Set(holidays.map(date));
    if (receipt) {
      if (!['quote', 'quick-form', 'quick', 'discount'].includes(receipt.formType) || !validId(receipt.submissionId)) error('Require source-backed sales receipt formType and submissionId.');
      if (instant(receipt.receivedAt) > nowMs) error('Receipt is in the future.');
    }
    if (anchor.kind === 'new_enquiry' && (!receipt || receipt.submissionId !== anchor.id || instant(receipt.receivedAt) !== anchorMs)) error('New enquiry anchor must exactly match receipt submissionId and receivedAt.');
    const updates = { customFields: [] };
    if (!o.assignedTo) updates.assignedTo = PEDRO;
    const supplied = receiptDates(receipt);
    const effective = { ...o.fields };
    for (const key of DATE_FIELDS) {
      if (supplied[key] && effective[key] && supplied[key] !== effective[key]) error('Receipt conflicts with an existing opportunity service date.');
      if (supplied[key] && !effective[key] && (isolated || o.pipelineStageId === NEW_LEAD)) {
        effective[key] = supplied[key];
        updates.customFields.push({ id: ids[key], fieldValue: supplied[key] });
      }
    }
    const actionTag = `[hqc-control:${anchor.id}]`;
    if ((o.fields.next_action || o.fields.next_action_date) && !o.fields.next_action.includes(actionTag)) error('Foreign Next Action/date preserved; operator reconciliation required.');
    const today = localDay(nowMs);
    const anchorDay = localDay(anchorMs);
    const schedule = anchor.kind === 'new_enquiry' ? [['receipt-working-day', roll(localDay(instant(receipt.receivedAt)), holidaySet)]] :
      anchor.kind === 'contacted' ? [['day-1-working', addWorking(anchorDay, holidaySet)]] :
        [['day-1-working', addWorking(anchorDay, holidaySet)], ...[3, ...(anchor.kind === 'quote_sent' ? [7, 10] : [])].map(n => [`day-${n}-calendar`, roll(addDays(anchorDay, n), holidaySet)])];
    const finalDate = schedule.at(-1)[1];
    const earliest = DATE_FIELDS.map(key => effective[key]).filter(Boolean).sort()[0];
    const exceptions = SIGNALS.filter(key => anchor.signals[key]);
    if (c.dnd || Object.values(c.dndSettings).some(setting => setting === true || setting?.status === 'active')) exceptions.push('DND');
    if (anchor.requiredDateFields.some(key => !effective[key])) exceptions.push('required_date_missing');
    if (earliest && (earliest <= today || earliest <= finalDate || (anchor.kind === 'quote_sent' && earliest <= addDays(anchorDay, 10)))) exceptions.push('service_deadline');
    const checkpoint = exceptions.length ? ['exception', today] : schedule.find(([key]) => !anchor.completedCheckpoints.includes(key));
    if (!checkpoint || anchor.completedCheckpoints.includes(checkpoint[0])) error('All applicable checkpoints already completed; do not recreate tasks.');
    const [checkpointId, dueDay] = checkpoint;
    const stableKey = `[hqc-control:${o.id}:${anchor.id}:${checkpointId}]`;
    const dueDate = exceptions.length || dueDay <= today ? new Date(nowMs).toISOString() : localTime(dueDay, '17');
    const description = exceptions.length ? `Immediate internal review: ${exceptions.join(', ')}` : `Internal human review: ${anchor.kind}, ${checkpointId}`;
    const nextAction = `${actionTag} ${description}`;
    for (const [key, value] of [['next_action', nextAction], ['next_action_date', dueDay < today ? today : dueDay]]) {
      if (o.fields[key] !== value) updates.customFields.push({ id: ids[key], fieldValue: value });
    }
    const task = {
      key: stableKey, checkpoint: checkpointId, contactId: c.id,
      title: `${stableKey} ${description}`,
      body: `${stableKey}\nOpportunity: ${o.id}\nAnchor: ${anchor.id} (${anchor.kind})\nEvidence: ${anchor.sourceRef}\nINTERNAL HUMAN REVIEW ONLY. Check actual current reply, service deadlines, DND and restrictions before any draft or contact. No customer chasing is authorised. Never infer last customer contact. Do not delete or supersede old tasks automatically.`,
      dueDate, completed: false, assignedTo: o.assignedTo || PEDRO,
    };
    return {
      eligible: true, reason: exceptions.length ? `immediate_review:${exceptions.join(',')}` : 'internal_review',
      expected: { opportunity: o, contact: c, fieldIds: ids,
        input: { opportunity: clone(opportunity), contact: clone(contact), anchor: clone(anchor), receipt: receipt ? clone(receipt) : null, now, holidays: [...holidays] } },
      updates, task,
    };
  } catch (e) { return { eligible: false, reason: e.message, expected: null, updates: null, task: null }; }
}

const taskPayload = task => Object.fromEntries(['title', 'body', 'dueDate', 'completed', 'assignedTo'].map(key => [key, task[key]]));
function unwrap(payload, key) {
  const row = payload?.[key] ?? payload;
  if (!object(row)) error(`Missing native ${key} readback.`);
  return row;
}
function taskList(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.tasks;
  if (!Array.isArray(rows) || payload?.nextPage || payload?.meta?.nextPage || payload?.meta?.nextPageUrl) error('Require complete native task list; pagination/unavailable is not empty.');
  return rows;
}
function matchingTasks(tasks, plan) {
  const matches = tasks.filter(t => t?.title?.includes(plan.task.key) || t?.body?.includes(plan.task.key));
  if (matches.length > 1) error('Multiple matching control tasks; manual reconcile required.');
  if (matches.length && (!validId(matches[0].id) || typeof matches[0].completed !== 'boolean')) error('Task readback requires native id and explicit completed flag.');
  if (matches[0]?.contactId && matches[0].contactId !== plan.task.contactId) error('Task belongs to a different contact.');
  return matches;
}
function targetProjection(plan) {
  const target = clone(plan.expected.opportunity);
  if (plan.updates.assignedTo) target.assignedTo = plan.updates.assignedTo;
  for (const update of plan.updates.customFields) {
    const key = Object.keys(plan.expected.fieldIds).find(key => plan.expected.fieldIds[key] === update.id);
    target.fields[key] = update.fieldValue;
  }
  return target;
}
function withoutRevision(o) { const { updatedAt, ...rest } = o; return rest; }
async function syncDir(dir) { const fd = await open(dir, 'r'); try { await fd.sync(); } finally { await fd.close(); } }
async function privateFile(path, directory = false) {
  const info = await lstat(path);
  if (info.isSymbolicLink() || (directory ? !info.isDirectory() : !info.isFile() || info.nlink !== 1) || (info.mode & 0o077) || (process.getuid && info.uid !== process.getuid())) error('Journal paths must be private, owned, regular files/directories without symlinks.');
}
async function saveJournal(path, journal, dir) {
  const tmp = join(dir, `.journal-${randomUUID()}.tmp`);
  const fd = await open(tmp, 'wx', 0o600);
  try { await fd.writeFile(JSON.stringify(journal, null, 2)); await fd.sync(); } finally { await fd.close(); }
  await rename(tmp, path);
  await syncDir(dir);
}

export async function applyControls({ request, plan, journalDir }) {
  if (typeof request !== 'function' || typeof journalDir !== 'string' || !plan?.eligible || !plan.expected?.input) error('Require eligible pure plan, request binding and private journalDir.');
  if (!same(planControls(plan.expected.input), plan)) error('Plan was modified; regenerate from reviewed inputs.');
  const ids = plan.expected.fieldIds;
  const oppId = plan.expected.opportunity.id;
  const contactId = plan.expected.contact.id;
  const oppRoute = `/opportunities/${oppId}`;
  const contactRoute = `/contacts/${contactId}`;
  const tasksRoute = `${contactRoute}/tasks`;
  // Closed route/method allowlist: no send endpoints, searches or bulk mutations.
  const call = async (route, method = 'GET', body) => {
    const allowed = (route === oppRoute && ['GET', 'PUT'].includes(method)) ||
      (route === contactRoute && method === 'GET') || (route === tasksRoute && ['GET', 'POST'].includes(method));
    if (!allowed) error('Route/method outside exact-opportunity adapter allowlist.');
    return request(route, body === undefined ? { method } : { method, body });
  };
  const dir = resolve(journalDir);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await privateFile(dir, true);
  const stem = createHash('sha256').update(`${LOCATION_ID}:${oppId}`).digest('hex');
  const lockPath = join(dir, `${stem}.lock`);
  const journalPath = join(dir, `${stem}.json`);
  let lock;
  try { lock = await open(lockPath, 'wx', 0o600); } catch (e) {
    if (e.code === 'EEXIST') error('Opportunity lock exists; do not retry or remove automatically. Manual reconcile required.');
    throw e;
  }
  let journal;
  let op;
  let primaryError;
  try {
    await lock.writeFile(JSON.stringify({ opportunityId: oppId, pid: process.pid }));
    await lock.sync();
    await syncDir(dir);
    try {
      await privateFile(journalPath);
      journal = JSON.parse(await readFile(journalPath, 'utf8'));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      journal = { version: 1, locationId: LOCATION_ID, opportunityId: oppId, operations: {} };
    }
    if (journal.version !== 1 || journal.locationId !== LOCATION_ID || journal.opportunityId !== oppId || !object(journal.operations)) error('Journal identity/shape mismatch; manual reconcile required.');
    if (Object.values(journal.operations).some(entry => !['verified', 'existing_completed', 'aborted'].includes(entry.state))) error('Unresolved/unknown prior outcome; manual reconcile required, no automatic retry.');
    const prior = journal.operations[plan.task.key];
    if (prior && prior.state !== 'aborted' && !same(prior.plan, plan)) error('Existing checkpoint has a different plan; manual reconcile required.');
    const readState = async () => {
      const opportunity = oppProjection(bindExactOpportunity(await call(oppRoute), oppId, ids), ids);
      const contact = contactProjection(unwrap(await call(contactRoute), 'contact'));
      eligibleScope(opportunity, contact);
      return { opportunity, contact };
    };
    const state = await readState();
    if (prior && ['verified', 'existing_completed'].includes(prior.state)) {
      const tasks = matchingTasks(taskList(await call(tasksRoute)), plan);
      const wanted = prior.state === 'verified' ? targetProjection(plan) : plan.expected.opportunity;
      if (!same(withoutRevision(state.opportunity), withoutRevision(wanted)) || !same(state.contact, plan.expected.contact) || tasks.length !== 1 || tasks[0].id !== prior.taskId) error('Previously verified state drifted; manual reconcile required.');
      if (!tasks[0].completed && !same(taskPayload(tasks[0]), taskPayload(plan.task))) error('Previously verified task changed; manual reconcile required.');
      return { status: tasks[0].completed ? 'existing_completed' : 'existing_verified', opportunityId: oppId, taskId: tasks[0].id };
    }
    if (!same(state.opportunity, plan.expected.opportunity) || !same(state.contact, plan.expected.contact)) error('Opportunity/contact changed since planning; no writes performed.');
    const existing = matchingTasks(taskList(await call(tasksRoute)), plan);
    if (existing.length && !existing[0].completed && !same(taskPayload(existing[0]), taskPayload(plan.task))) error('Existing task differs; manual reconcile required, no writes.');
    op = { state: 'prepared', plan, taskId: existing[0]?.id ?? null };
    journal.operations[plan.task.key] = op;
    await saveJournal(journalPath, journal, dir);
    if (existing[0]?.completed) {
      op.state = 'existing_completed';
      await saveJournal(journalPath, journal, dir);
      return { status: 'existing_completed', opportunityId: oppId, taskId: existing[0].id };
    }
    // Check again after task lookup and durable preparation, immediately before PUT.
    const fresh = await readState();
    if (!same(fresh.opportunity, plan.expected.opportunity) || !same(fresh.contact, plan.expected.contact)) {
      op.state = 'aborted';
      await saveJournal(journalPath, journal, dir);
      error('Uncontrolled opportunity/contact race detected; no writes performed.');
    }
    const target = targetProjection(plan);
    if (plan.updates.customFields.length || plan.updates.assignedTo) {
      op.state = 'writing_opportunity';
      await saveJournal(journalPath, journal, dir);
      await call(oppRoute, 'PUT', plan.updates);
    }
    const afterPut = await readState();
    if (!same(withoutRevision(afterPut.opportunity), withoutRevision(target)) || !same(afterPut.contact, plan.expected.contact)) error('Opportunity fields/contact readback mismatch; manual reconcile required.');
    // Recheck task list before POST; completed native tasks are never recreated.
    const beforePost = matchingTasks(taskList(await call(tasksRoute)), plan);
    let task = beforePost[0];
    if (task && !task.completed && !same(taskPayload(task), taskPayload(plan.task))) error('Concurrent task drift; manual reconcile required.');
    if (!task) {
      op.state = 'writing_task';
      await saveJournal(journalPath, journal, dir);
      const result = unwrap(await call(tasksRoute, 'POST', taskPayload(plan.task)), 'task');
      if (!validId(result.id)) error('Task creation returned no native task id; manual reconcile required.');
      op.taskId = result.id;
    } else op.taskId = task.id;
    const verifiedTasks = matchingTasks(taskList(await call(tasksRoute)), plan);
    task = verifiedTasks[0];
    const final = await readState();
    if (verifiedTasks.length !== 1 || task.id !== op.taskId || (!task.completed && !same(taskPayload(task), taskPayload(plan.task))) ||
      !same(withoutRevision(final.opportunity), withoutRevision(target)) || !same(final.contact, plan.expected.contact)) error('Final field/task readback failed; manual reconcile required.');
    op.state = 'verified';
    await saveJournal(journalPath, journal, dir);
    return { status: task.completed ? 'existing_completed' : 'verified', opportunityId: oppId, taskId: task.id };
  } catch (e) {
    primaryError = e;
    if (op && !['aborted', 'existing_completed', 'verified'].includes(op.state)) {
      // Even a thrown PUT/POST may have landed. Persist uncertainty; never retry.
      op.state = op.state === 'prepared' ? 'aborted' : 'unknown';
      op.error = 'Operation/readback failed; inspect native records and reconcile manually.';
      try { await saveJournal(journalPath, journal, dir); } catch { /* Prior durable in-flight state still blocks retries. */ }
    }
    throw e;
  } finally {
    try {
      await lock.close();
      await unlink(lockPath);
      await syncDir(dir);
    } catch (cleanupError) {
      if (!primaryError) throw cleanupError;
    }
  }
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length === 1 && argv[0] === '--help') {
    process.stdout.write('Planning only: node scripts/hqc-lead-controls.mjs --input plan.json --output output.json\n');
    return;
  }
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--input', '--output'].includes(argv[i]) || !argv[i + 1] || argv[i + 1].startsWith('--') || args[argv[i]]) error('Require --input and --output exactly once.');
    args[argv[i]] = argv[i + 1];
  }
  if (!args['--input'] || !args['--output']) error('Require --input and --output; CLI never applies changes.');
  let input;
  try { input = JSON.parse(await readFile(resolve(args['--input']), 'utf8')); } catch { error('Cannot read valid planning JSON.'); }
  const plan = planControls(input);
  await writeFile(resolve(args['--output']), `${JSON.stringify(plan, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  process.stdout.write(`Planning only: ${plan.eligible ? 'eligible internal review' : 'ineligible'}; no provider calls.\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(e => { process.stderr.write(`HQC controls: ${e.code ? `File operation failed (${e.code}).` : e.message}\n`); process.exitCode = 1; });
}
