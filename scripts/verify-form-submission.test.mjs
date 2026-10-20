import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Bundle the real Astro route, with only its provider fetch replaced in each test.
const routes = {};
for (const kind of ['quote', 'quick-form', 'discount', 'feedback']) {
  const result = await build({
    entryPoints: [new URL(`../src/pages/api/${kind}.ts`, import.meta.url).pathname],
    bundle: true, write: false, platform: 'node', format: 'esm',
  });
  routes[kind] = (await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)).POST;
}

const quote = {
  route: 'residential', service: 'Deep Clean™', name: 'Intake Test',
  email: 'intake@example.test', phone: '020 7946 0999', postcode: 'SW1A 1AA',
  details: 'Test condition and access', privacy_consent: 'yes',
};
const env = {
  QUOTE_FORM_WEBHOOK: 'https://receiver.example.test/quote',
  QUICK_FORM_WEBHOOK: 'https://receiver.example.test/quick',
  DISCOUNT_FORM_WEBHOOK: 'https://receiver.example.test/discount',
  FEEDBACK_WEBHOOK: 'https://receiver.example.test/feedback',
};
const request = (kind, body, host = 'highqualityclean.co.uk') => new Request(`https://${host}/api/${kind}/`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
async function withProvider(provider, run) {
  const original = globalThis.fetch;
  globalThis.fetch = provider;
  try { await run(); } finally { globalThis.fetch = original; }
}

test('HTTP 200 with application rejection must return 502, never form success', async () => {
  let calls = 0;
  await withProvider(async () => {
    calls++;
    return Response.json({ ok: false, error: 'rejected' });
  }, async () => {
    const response = await routes.quote({ request: request('quote', quote), locals: { runtime: { env } } });
    assert.equal(response.status, 502);
    assert.notEqual((await response.json()).ok, true);
    assert.equal(calls, 1);
  });
});
