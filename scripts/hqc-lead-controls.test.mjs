import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  planControls, applyControls, readOpportunityForControls, LOCATION_ID, PIPELINE_ID, NEW_LEAD, CONTACTED,
  ISOLATED_PIPELINE, ISOLATED_STAGE, PEDRO, DATE_FIELDS,
} from './hqc-lead-controls.mjs';

const clone = value => structuredClone(value);
const ids = Object.fromEntries([...DATE_FIELDS, 'next_action', 'next_action_date'].map(key => [key, `field-${key}`]));
function input(overrides = {}) {
  const base = {
    opportunity: {
      id: 'opp-a', contactId: 'contact-a', locationId: LOCATION_ID, pipelineId: PIPELINE_ID,
      pipelineStageId: NEW_LEAD, status: 'open', name: 'Example sales enquiry',
      assignedTo: 'existing-owner', updatedAt: '2026-10-23T09:00:00Z',
      customFields: [{ id: 'unrelated-last-customer-contact', fieldValue: 'retained' }], controlFieldIds: ids,
    },
    contact: { id: 'contact-a', locationId: LOCATION_ID, tags: [], dnd: false },
    anchor: {
      kind: 'new_enquiry', id: 'receipt-a', opportunityId: 'opp-a', occurredAt: '2026-10-23T09:00:00Z',
      sourceRef: 'retained-evidence-a', completedCheckpoints: [], requiredDateFields: [],
      signals: { replied: false, declined: false, accepted: false, deliveryFailed: false, serviceDatesChanged: false },
    },
    receipt: { formType: 'quote', submissionId: 'receipt-a', receivedAt: '2026-10-23T09:00:00Z' },
    now: '2026-10-23T10:00:00Z', holidays: [],
  };
  return { ...base, ...overrides };
}
function contacted(kind = 'contacted', overrides = {}) {
  const value = input();
  value.opportunity.pipelineStageId = CONTACTED;
  value.anchor.kind = kind;
  value.anchor.id = 'anchor-a';
  value.receipt = null;
  return { ...value, ...overrides };
}
const valueOf = (plan, key) => plan.updates.customFields.find(f => f.id === ids[key])?.fieldValue;
const nativeTask = plan => ({ id: 'task-existing', ...Object.fromEntries(['title', 'body', 'dueDate', 'completed', 'assignedTo'].map(k => [k, plan.task[k]])) });
async function temporary(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'hqc-controls-'));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}
function fakeAPI(inputs, hooks = {}) {
  const list = Array.isArray(inputs) ? inputs : [inputs];
  const db = { opportunities: new Map(list.map(i => [i.opportunity.id, clone(i.opportunity)])),
    contacts: new Map(list.map(i => [i.contact.id, clone(i.contact)])), tasks: new Map(), calls: [], writes: 0 };
  const request = async (route, options) => {
    db.calls.push({ route, ...clone(options) });
    if (hooks.before) await hooks.before(route, options, db);
    let match;
    if ((match = /^\/opportunities\/([^/]+)$/.exec(route))) {
      const row = db.opportunities.get(match[1]);
      assert.ok(row);
      if (options.method === 'GET') return { opportunity: clone(row) };
      assert.equal(options.method, 'PUT');
      db.writes++;
      assert.deepEqual(Object.keys(options.body).sort(), Object.keys(options.body).filter(k => ['assignedTo', 'customFields'].includes(k)).sort());
      for (const field of options.body.customFields) {
        const existing = row.customFields.find(f => f.id === field.id);
        if (existing) existing.fieldValue = field.fieldValue;
        else row.customFields.push(clone(field));
      }
      if (options.body.assignedTo) row.assignedTo = options.body.assignedTo;
      row.updatedAt = '2026-10-23T10:01:00Z';
      if (hooks.afterPut) await hooks.afterPut(db);
      return { opportunity: clone(row) };
    }
    if ((match = /^\/contacts\/([^/]+)\/tasks$/.exec(route))) {
      const rows = db.tasks.get(match[1]) ?? [];
      if (options.method === 'GET') return { tasks: clone(rows) };
      assert.equal(options.method, 'POST');
      db.writes++;
      const task = { ...clone(options.body), id: `task-${db.writes}`, contactId: match[1] };
      db.tasks.set(match[1], [...rows, task]);
      if (hooks.afterPost) await hooks.afterPost(db);
      return { task: clone(task) };
    }
    if ((match = /^\/contacts\/([^/]+)$/.exec(route))) {
      assert.equal(options.method, 'GET');
      return { contact: clone(db.contacts.get(match[1])) };
    }
    assert.fail(`Unexpected route ${route}`);
  };
  return { request, db };
}

test('four independent dates, canonical aliases, owner preservation and exact task key', () => {
  const i = input();
  Object.assign(i.receipt, { desired_date: '2026-12-01', checkout_date: '2026-12-02', inspection_date: '2026-12-03', move_in_date: '2026-12-04' });
  const plan = planControls(i);
  assert.equal(plan.eligible, true, plan.reason);
  assert.deepEqual(DATE_FIELDS.map(key => valueOf(plan, key)), ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04']);
  assert.equal(plan.updates.assignedTo, undefined);
  assert.equal(plan.task.assignedTo, 'existing-owner');
  assert.match(plan.task.title, /opp-a:receipt-a:receipt-working-day/);
  assert.match(plan.task.body, /Check actual current reply, service deadlines, DND and restrictions/);
  assert.equal(plan.updates.customFields.some(f => f.id === 'unrelated-last-customer-contact'), false);
  const fallback = input();
  fallback.opportunity.assignedTo = '';
  assert.equal(planControls(fallback).updates.assignedTo, PEDRO);
});

test('alias conflicts, malformed dates and native field conflicts reject without a task', () => {
  for (const dates of [
    { required_service_date: '2026-12-01', desired_date: '2026-12-02' },
    { move_in_date: '2026-12-01', movein_date: '2026-12-02' },
    { checkout_date: '2026-02-30' },
  ]) {
    const i = input(); Object.assign(i.receipt, dates);
    assert.equal(planControls(i).eligible, false);
  }
  const i = input();
  i.receipt.desired_date = '2026-12-01';
  i.opportunity.customFields.push({ id: ids.required_service_date, fieldValue: '2026-12-02' });
  assert.match(planControls(i).reason, /conflicts with an existing/);
});

test('never backfills dates in Contacted; equal existing dates remain untouched', () => {
  const i = contacted();
  i.receipt = { ...input().receipt, desired_date: '2026-12-01' };
  assert.equal(valueOf(planControls(i), 'required_service_date'), undefined);
  const n = input();
  n.receipt.desired_date = '2026-12-01';
  n.opportunity.customFields.push({ id: ids.required_service_date, fieldValue: '2026-12-01' });
  assert.equal(valueOf(planControls(n), 'required_service_date'), undefined);
});

test('weekends, supplied holidays and autumn DST use London civil dates', () => {
  const i = contacted();
  const plan = planControls(i);
  assert.equal(valueOf(plan, 'next_action_date'), '2026-10-26');
  assert.equal(plan.task.dueDate, '2026-10-26T17:00:00.000Z');
  i.holidays = ['2026-10-26'];
  assert.equal(valueOf(planControls(i), 'next_action_date'), '2026-10-27');
  const spring = contacted();
  spring.anchor.occurredAt = '2026-03-27T10:00:00Z';
  spring.now = '2026-03-27T11:00:00Z';
  assert.equal(planControls(spring).task.dueDate, '2026-03-30T16:00:00.000Z');
  const sunday = input();
  sunday.receipt.receivedAt = sunday.anchor.occurredAt = '2026-10-25T00:30:00+01:00';
  sunday.now = '2026-10-25T02:00:00Z';
  assert.equal(valueOf(planControls(sunday), 'next_action_date'), '2026-10-26');
});

test('information and quote checkpoints roll calendar dates and skip explicitly completed checkpoints', () => {
  const info = contacted('information_requested');
  info.anchor.completedCheckpoints = ['day-1-working'];
  assert.equal(planControls(info).task.checkpoint, 'day-3-calendar');
  assert.equal(valueOf(planControls(info), 'next_action_date'), '2026-10-26');
  const quote = contacted('quote_sent');
  const expected = [['day-1-working', '2026-10-26'], ['day-3-calendar', '2026-10-26'], ['day-7-calendar', '2026-10-30'], ['day-10-calendar', '2026-11-02']];
  for (const [key, day] of expected) {
    const p = planControls(quote);
    assert.equal(p.task.checkpoint, key);
    assert.equal(valueOf(p, 'next_action_date'), day);
    quote.anchor.completedCheckpoints.push(key);
  }
  assert.match(planControls(quote).reason, /already completed/);
});

test('earliest of all service dates, required missing dates and every stop signal produce immediate internal review', () => {
  for (const key of DATE_FIELDS) {
    const i = contacted('quote_sent');
    i.opportunity.customFields.push({ id: ids[key], fieldValue: '2026-11-01' });
    const p = planControls(i);
    assert.match(p.reason, /service_deadline/);
    assert.equal(p.task.checkpoint, 'exception');
    assert.equal(p.task.dueDate, i.now.replace('Z', '.000Z'));
  }
  for (const key of ['replied', 'declined', 'accepted', 'deliveryFailed', 'serviceDatesChanged']) {
    const i = contacted(); i.anchor.signals[key] = true;
    assert.match(planControls(i).reason, new RegExp(key));
    assert.equal(planControls(i).task.checkpoint, 'exception');
  }
  const missing = contacted(); missing.anchor.requiredDateFields = ['inspection_date'];
  assert.match(planControls(missing).reason, /required_date_missing/);
  const dnd = contacted(); dnd.contact.dnd = true;
  assert.match(planControls(dnd).reason, /DND/);
  dnd.contact.dnd = false; dnd.contact.dndSettings = { Email: { status: 'active' } };
  assert.match(planControls(dnd).reason, /DND/);
});

test('foreign action/date pairs and foreign unpaired values are preserved; exact owned tag allows update', () => {
  for (const [action, due] of [['Call operator', '2026-10-30'], ['Call operator', ''], ['', '2026-10-30']]) {
    const i = input();
    i.opportunity.customFields.push({ id: ids.next_action, fieldValue: action }, { id: ids.next_action_date, fieldValue: due });
    assert.match(planControls(i).reason, /Foreign Next Action/);
  }
  const owned = input();
  owned.opportunity.customFields.push({ id: ids.next_action, fieldValue: '[hqc-control:receipt-a] Previous internal review' });
  assert.equal(planControls(owned).eligible, true);
  owned.opportunity.customFields[1].fieldValue = '[hqc-control:receipt-another] Other anchor';
  assert.equal(planControls(owned).eligible, false);
});

test('rejects closed statuses, all other stages, admin receipts, unlinked/future/unsourced anchors', () => {
  for (const status of ['won', 'lost', 'abandoned', 'closed']) {
    const i = input(); i.opportunity.status = status;
    assert.match(planControls(i).reason, /non-open/);
  }
  for (const stage of ['booked-stage', 'paid-stage', 'review-sent-stage']) {
    const i = input(); i.opportunity.pipelineStageId = stage;
    assert.equal(planControls(i).eligible, false);
  }
  for (const formType of ['contact', 'feedback']) {
    const i = input(); i.receipt.formType = formType;
    assert.match(planControls(i).reason, /outside sales/);
  }
  for (const patch of [{ opportunityId: 'opp-b' }, { sourceRef: '' }, { occurredAt: '2027-01-01T00:00:00Z' }, { occurredAt: '2026-10-23T10:00:00' }]) {
    const i = input(); Object.assign(i.anchor, patch);
    assert.equal(planControls(i).eligible, false);
  }
});

test('isolated pipeline requires exact stage, DND, test tag and isolated name', () => {
  const i = input();
  Object.assign(i.opportunity, { pipelineId: ISOLATED_PIPELINE, pipelineStageId: ISOLATED_STAGE, name: 'HQC isolated fixture' });
  Object.assign(i.contact, { dnd: true, tags: ['hqc-isolated-sales-test'] });
  assert.equal(planControls(i).eligible, true);
  assert.match(planControls(i).reason, /DND/);
  for (const mutate of [j => { j.contact.dnd = false; }, j => { j.contact.tags = []; }, j => { j.opportunity.name = 'Example'; }, j => { j.opportunity.pipelineStageId = NEW_LEAD; }]) {
    const j = clone(i); mutate(j); assert.equal(planControls(j).eligible, false);
  }
  const production = input(); production.contact.tags = ['hqc-isolated-sales-test'];
  assert.equal(planControls(production).eligible, false);
});

test('successful apply journals before mutations, touches only allowed fields/routes and verifies rerun without mutation', async () => temporary(async dir => {
  const i = input(); const plan = planControls(i);
  const { request, db } = fakeAPI(i, {
    before: async (route, options) => {
      if (!['PUT', 'POST'].includes(options.method)) return;
      const names = await readdir(dir);
      assert.equal(names.filter(n => n.endsWith('.lock')).length, 1);
      const journal = JSON.parse(await readFile(join(dir, names.find(n => n.endsWith('.json'))), 'utf8'));
      assert.equal(journal.operations[plan.task.key].state, options.method === 'PUT' ? 'writing_opportunity' : 'writing_task');
    },
  });
  const first = await applyControls({ request, plan, journalDir: dir });
  assert.equal(first.status, 'verified');
  assert.equal(db.writes, 2);
  const second = await applyControls({ request, plan, journalDir: dir });
  assert.equal(second.status, 'existing_verified');
  assert.equal(second.taskId, first.taskId);
  assert.equal(db.writes, 2);
  assert.equal(db.opportunities.get('opp-a').customFields.find(f => f.id === 'unrelated-last-customer-contact').fieldValue, 'retained');
  assert.equal((await readdir(dir)).some(n => n.endsWith('.lock')), false);
}));

test('same-contact two-opportunity tasks use separate stable keys, fields and journals', async () => temporary(async dir => {
  const a = input(); const b = input();
  b.opportunity.id = b.anchor.opportunityId = 'opp-b';
  const { request, db } = fakeAPI([a, b]);
  await applyControls({ request, plan: planControls(a), journalDir: dir });
  await applyControls({ request, plan: planControls(b), journalDir: dir });
  assert.equal(db.tasks.get('contact-a').length, 2);
  assert.notEqual(db.tasks.get('contact-a')[0].title, db.tasks.get('contact-a')[1].title);
  assert.equal((await readdir(dir)).filter(n => n.endsWith('.json')).length, 2);
}));

test('isolated DND apply backfills four dates and empty owner without changing DND/stage/status', async () => temporary(async dir => {
  const i = input();
  Object.assign(i.opportunity, { pipelineId: ISOLATED_PIPELINE, pipelineStageId: ISOLATED_STAGE, name: 'Isolated fixture', assignedTo: '' });
  Object.assign(i.contact, { dnd: true, tags: ['hqc-isolated-sales-test'] });
  Object.assign(i.receipt, { desired_date: '2026-12-01', checkout_date: '2026-12-02', inspection_date: '2026-12-03', movein_date: '2026-12-04' });
  const plan = planControls(i); const { request, db } = fakeAPI(i);
  assert.equal((await applyControls({ request, plan, journalDir: dir })).status, 'verified');
  assert.equal(db.contacts.get('contact-a').dnd, true);
  assert.equal(db.opportunities.get('opp-a').pipelineStageId, ISOLATED_STAGE);
  assert.equal(db.opportunities.get('opp-a').status, 'open');
  assert.equal(db.opportunities.get('opp-a').assignedTo, PEDRO);
  assert.equal(db.tasks.get('contact-a')[0].assignedTo, PEDRO);
  for (const key of DATE_FIELDS) assert.ok(db.opportunities.get('opp-a').customFields.find(f => f.id === ids[key]).fieldValue);
  assert.equal(db.calls.some(c => /message|workflow|enrol|send/i.test(c.route)), false);
}));

test('invalid/missing input or unreviewed DND/signals is ineligible rather than defaulted safe', () => {
  assert.equal(planControls(null).eligible, false);
  assert.equal(planControls().eligible, false);
  const i = input(); delete i.contact.dnd;
  assert.equal(planControls(i).eligible, false);
  const j = input(); delete j.anchor.signals.replied;
  assert.equal(planControls(j).eligible, false);
});

test('completed native task is not recreated or followed by opportunity mutation', async () => temporary(async dir => {
  const i = input(); const plan = planControls(i); const { request, db } = fakeAPI(i);
  db.tasks.set('contact-a', [{ ...nativeTask(plan), completed: true }]);
  assert.equal((await applyControls({ request, plan, journalDir: dir })).status, 'existing_completed');
  assert.equal((await applyControls({ request, plan, journalDir: dir })).status, 'existing_completed');
  assert.equal(db.writes, 0);
}));

test('detects stale planning, fresh DND change and uncontrolled race before any mutation', async () => {
  for (const kind of ['initial', 'opportunity-race', 'dnd-race']) await temporary(async dir => {
    const i = input(); const plan = planControls(i); let gets = 0;
    const { request, db } = fakeAPI(i, { before: (route, options, state) => {
      if (route === '/opportunities/opp-a' && options.method === 'GET') {
        gets++;
        if (kind === 'initial' || gets === 2) {
          if (kind === 'dnd-race') state.contacts.get('contact-a').dnd = true;
          else state.opportunities.get('opp-a').assignedTo = 'new-owner';
        }
      }
    } });
    await assert.rejects(applyControls({ request, plan, journalDir: dir }), /changed since planning|race detected/);
    assert.equal(db.writes, 0);
  });
});

test('ambiguous PUT or POST outcome is journalled unknown and blocks all retries without API calls', async () => {
  for (const kind of ['PUT', 'POST']) await temporary(async dir => {
    const i = input(); const plan = planControls(i);
    const hooks = { [kind === 'PUT' ? 'afterPut' : 'afterPost']: () => { throw new Error('Transport lost after provider acceptance'); } };
    const { request, db } = fakeAPI(i, hooks);
    await assert.rejects(applyControls({ request, plan, journalDir: dir }), /Transport lost/);
    const names = await readdir(dir);
    const journal = JSON.parse(await readFile(join(dir, names.find(n => n.endsWith('.json'))), 'utf8'));
    assert.equal(journal.operations[plan.task.key].state, 'unknown');
    const calls = db.calls.length; const writes = db.writes;
    await assert.rejects(applyControls({ request, plan, journalDir: dir }), /manual reconcile.*no automatic retry/);
    assert.equal(db.calls.length, calls);
    assert.equal(db.writes, writes);
  });
});

test('bad field readback or collateral field loss blocks task creation and automatic retries', async () => temporary(async dir => {
  const i = input(); const plan = planControls(i);
  const { request, db } = fakeAPI(i, { afterPut: state => { state.opportunities.get('opp-a').customFields = []; } });
  await assert.rejects(applyControls({ request, plan, journalDir: dir }), /readback mismatch/);
  assert.equal(db.writes, 1);
  await assert.rejects(applyControls({ request, plan, journalDir: dir }), /manual reconcile/);
}));

test('duplicate tasks, modified plan and unsafe journal permissions fail before writes', async () => temporary(async dir => {
  const i = input(); const plan = planControls(i); const { request, db } = fakeAPI(i);
  db.tasks.set('contact-a', [nativeTask(plan), { ...nativeTask(plan), id: 'another-task' }]);
  await assert.rejects(applyControls({ request, plan, journalDir: dir }), /Multiple matching/);
  const modified = clone(plan); modified.updates.status = 'won';
  await assert.rejects(applyControls({ request, plan: modified, journalDir: dir }), /Plan was modified/);
  assert.equal(db.writes, 0);
  await chmod(dir, 0o755);
  await assert.rejects(applyControls({ request, plan, journalDir: dir }), /private/);
}));

test('opportunity lock prevents concurrent apply; stale lock is never automatically removed', async () => temporary(async dir => {
  const i = input(); const plan = planControls(i); let release; let entered;
  const reached = new Promise(r => { entered = r; });
  const hold = new Promise(r => { release = r; });
  let blocked = false;
  const { request, db } = fakeAPI(i, { before: async () => { if (!blocked) { blocked = true; entered(); await hold; } } });
  const first = applyControls({ request, plan, journalDir: dir });
  await reached;
  await assert.rejects(applyControls({ request, plan, journalDir: dir }), /lock exists/);
  release(); await first;
  assert.equal(db.writes, 2);
}));

test('planning CLI has no apply switch, preserves inputs/output and hides invalid JSON contents', async () => temporary(async dir => {
  const script = fileURLToPath(new URL('./hqc-lead-controls.mjs', import.meta.url));
  const source = join(dir, 'input.json'); const output = join(dir, 'plan.json');
  const raw = JSON.stringify(input()); await writeFile(source, raw);
  const run = args => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  const args = ['--input', source, '--output', output];
  assert.equal(run(args).status, 0);
  assert.equal(JSON.parse(await readFile(output, 'utf8')).eligible, true);
  assert.equal(await readFile(source, 'utf8'), raw);
  assert.equal(run(args).status, 1);
  assert.equal(run([...args, '--apply', 'true']).status, 1);
  assert.equal(run(['--input', source]).status, 1);
  await writeFile(source, '{PRIVATE_CONTENT invalid');
  const invalid = run(['--input', source, '--output', join(dir, 'bad.json')]);
  assert.equal(invalid.status, 1);
  assert.doesNotMatch(invalid.stderr, /PRIVATE_CONTENT/);
}));

test('native quick-form receipt is accepted without retyping and unknown checkpoints reject', () => {
  const i = input(); i.receipt.formType = 'quick-form';
  assert.equal(planControls(i).eligible, true);
  i.anchor.completedCheckpoints = ['day-1-workng'];
  assert.equal(planControls(i).eligible, false);
});

test('exact-ID native binding normalizes only an omitted field array on a complete matching GET', async () => {
  const i = input(); delete i.opportunity.customFields;
  const calls = [];
  const read = payload => readOpportunityForControls({ opportunityId: 'opp-a', controlFieldIds: ids, request: async (...args) => { calls.push(args); return payload; } });
  const row = await read({ opportunity: i.opportunity });
  assert.deepEqual(calls, [['/opportunities/opp-a', { method: 'GET' }]]);
  assert.deepEqual(row.customFields, []);
  assert.equal(planControls({ ...i, opportunity: row }).eligible, true);
  assert.equal(planControls(i).eligible, false);
  for (const bad of [
    { ...i.opportunity, id: 'another-opp' },
    { ...i.opportunity, locationId: 'another-location' },
    { ...i.opportunity, updatedAt: undefined },
    { ...i.opportunity, pipelineStageId: undefined },
    { ...i.opportunity, name: undefined },
    { ...i.opportunity, customFields: null },
  ]) await assert.rejects(read({ opportunity: bad }));
});

test('empty exact native opportunity can apply without seeding an action', async () => temporary(async dir => {
  const i = input(); i.opportunity.customFields = [];
  const { request, db } = fakeAPI(i);
  delete db.opportunities.get('opp-a').customFields;
  const native = await readOpportunityForControls({ request, opportunityId: 'opp-a', controlFieldIds: ids });
  const plan = planControls({ ...i, opportunity: native });
  const mergedRequest = async (route, options) => {
    if (options.method === 'PUT') db.opportunities.get('opp-a').customFields ??= [];
    return request(route, options);
  };
  assert.equal((await applyControls({ request: mergedRequest, plan, journalDir: dir })).status, 'verified');
}));

test('failed final prewrite GET is aborted and can be replanned without an unknown write', async () => temporary(async dir => {
  const i = input(); const plan = planControls(i); let reads = 0;
  const { request, db } = fakeAPI(i);
  const failing = async (route, options) => {
    if (route === '/opportunities/opp-a' && options.method === 'GET' && ++reads === 2) throw Error('Read transport failed before PUT');
    return request(route, options);
  };
  await assert.rejects(applyControls({ request: failing, plan, journalDir: dir }), /Read transport/);
  assert.equal(db.writes, 0);
  const name = (await readdir(dir)).find(n => n.endsWith('.json'));
  const journal = JSON.parse(await readFile(join(dir, name), 'utf8'));
  assert.equal(journal.operations[plan.task.key].state, 'aborted');
  assert.equal((await applyControls({ request, plan, journalDir: dir })).status, 'verified');
}));
