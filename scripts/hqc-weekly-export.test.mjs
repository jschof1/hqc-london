import test from 'node:test';
import assert from 'node:assert/strict';
import { captureSnapshot } from './hqc-weekly-export.mjs';
import { LOCATION_ID, PIPELINE_ID } from './hqc-weekly-report.mjs';

const row = { id: 'example-opportunity', locationId: LOCATION_ID, pipelineId: PIPELINE_ID };

test('captures only the fixed account GET and leaves event completeness false', async () => {
  const calls = [];
  const snapshot = await captureSnapshot({ request: async (...args) => {
    calls.push(args);
    return { opportunities: [row], meta: { total: 1 } };
  }, now: '2026-10-28T16:00:00Z' });
  assert.deepEqual(calls, [[`/opportunities/search?location_id=${LOCATION_ID}&limit=100`, { method: 'GET' }]]);
  assert.equal(snapshot.coverage.currentInventoryComplete, true);
  assert.equal(snapshot.coverage.opportunitiesComplete, false);
  assert.equal(snapshot.coverage.eventsComplete, false);
  assert.deepEqual(snapshot.events, []);
});

test('refuses partial inventory, an unbounded page, duplicate IDs and a different account', async () => {
  for (const result of [
    { opportunities: [row], meta: { total: 2 } },
    { opportunities: Array.from({ length: 100 }, (_, i) => ({ ...row, id: String(i) })), meta: { total: 100 } },
    { opportunities: [row, row], meta: { total: 2 } },
    { opportunities: [{ ...row, locationId: 'another-location' }], meta: { total: 1 } },
    { opportunities: [], meta: {} },
  ]) await assert.rejects(captureSnapshot({ request: async () => result }));
});
