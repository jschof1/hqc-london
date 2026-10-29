import test from 'node:test';
import assert from 'node:assert/strict';
import { versionReview } from './version-review.js';

const manifest = { versions: [{ id: 'oct28' }], pages: [{ id: 'home' }] };
const operation = { author: 'Pedro', text: 'Keep this heading.', versionId: 'oct28', pageId: 'home', requestId: '12345678-1234-1234-1234-123456789012' };
function fixture() {
  const values = new Map();
  const storage = { get: async k => structuredClone(values.get(k)), put: async (k, v) => values.set(k, structuredClone(v)), transaction: async f => f(storage) };
  const send = op => versionReview(new Request('https://review.test/api/versions', { method: 'POST', body: JSON.stringify(op) }), storage, manifest);
  return { values, storage, send };
}
test('comments persist and a retried save creates only one comment', async () => {
  const { send, storage } = fixture();
  assert.equal((await send(operation)).status, 200);
  const retry = await (await send(operation)).json();
  assert.equal(retry.comments.length, 1);
  assert.equal(retry.revision, 1);
  assert.equal(retry.comments[0].pageId, 'home');
  const result = await versionReview(new Request('https://review.test/api/versions'), storage, manifest);
  assert.deepEqual(await result.json(), retry);
});
test('an existing save identifier cannot replace a comment', async () => {
  const { send } = fixture();
  await send(operation);
  assert.equal((await send({ ...operation, text: 'Changed text' })).status, 409);
});
test('invalid author, page, release and excessive text fail without writes', async () => {
  for (const patch of [{ author: 'Other' }, { pageId: 'missing' }, { versionId: 'missing' }, { text: '' }, { text: 'x'.repeat(2001) }, { requestId: '../escape' }]) {
    const { send, values } = fixture();
    assert.equal((await send({ ...operation, ...patch })).status, 400);
    assert.equal(values.size, 0);
  }
});
test('discussion storage does not overwrite photo review storage', async () => {
  const { send, values } = fixture();
  values.set('review', { entries: { photo: { choice: 'keep' } } });
  await send(operation);
  assert.deepEqual(values.get('review'), { entries: { photo: { choice: 'keep' } } });
});
