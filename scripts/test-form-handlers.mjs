import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'hqc-form-tests-'));
await build({ entryPoints: ['src/lib/form-submission.ts'], bundle: true, platform: 'node', format: 'esm', outfile: join(temp, 'handler.mjs') });
const { submitForm } = await import(pathToFileURL(join(temp, 'handler.mjs')));
const originalFetch = globalThis.fetch;
const env = { QUOTE_FORM_WEBHOOK: 'https://sales.invalid/hook', CONTACT_FORM_WEBHOOK: 'https://admin.invalid/hook' };
const quote = { name: 'Controlled Test', email: 'test@example.invalid', phone: '02000000000', postcode: 'SW18 2DZ', service: 'End of Tenancy™', details: 'Local test only', route: 'residential', desired_date: '2026-10-30' };
const contact = { name: 'Controlled Test', email: 'test@example.invalid', service: 'general-inquiry', message: 'Local test only' };
let calls = [];
let tests = 0;
async function check(name, run) { await run(); tests++; console.log(`PASS ${name}`); }
function request(body = quote, host = 'highqualityclean.co.uk', headers = {}) {
  return new Request(`https://${host}/api/quote/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
function mock(handler = () => new Response(JSON.stringify({ ok: true }), { status: 200 })) {
  calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, ...options, payload: JSON.parse(options.body) }); return handler(url, options); };
}
try {
  await check('four quote routes retain dates, source, consent and distinct enquiry IDs', async () => {
    mock();
    for (const [route, buyer] of [['residential','home'], ['commercial','property'], ['commercial','commercial'], ['complex','complex']]) {
      const response = await submitForm(request({ ...quote, route, buyer, frequency: 'Weekly', operating_hours: 'After 6pm', mobilisation_requirements: 'Access supplied', utm_source: 'test' }), env, 'quote');
      assert.equal(response.status, 200);
      assert.equal((await response.json()).ok, true);
      const payload = calls.at(-1).payload;
      assert.equal(payload.required_service_date, '2026-10-30');
      assert.equal(payload.desired_date, '2026-10-30');
      assert.equal(payload.enquiry_type, buyer === 'property' ? 'property' : route);
      assert.equal(payload.email_marketing_consent, 'no');
      assert.equal(payload.utm_source, 'test');
      assert.equal(payload.source, 'request_a_quote');
    }
    assert.equal(new Set(calls.map(x => x.payload.submission_id)).size, 4);
  });
  await check('property route does not demand commercial-only fields', async () => {
    mock(); assert.equal((await submitForm(request({ ...quote, route: 'commercial', buyer: 'property' }), env, 'quote')).status, 200);
  });
  await check('repeat enquiry has its own empty dates and unchecked consent', async () => {
    mock(); await submitForm(request({ ...quote, email_marketing_consent: 'yes', checkout_date: '2026-10-31' }), env, 'quote');
    await submitForm(request({ ...quote, desired_date: '' }), env, 'quote');
    assert.equal(calls[0].payload.email_marketing_consent, 'yes');
    for (const key of ['desired_date', 'required_service_date', 'checkout_date', 'inspection_date', 'move_in_date']) assert.equal(calls[1].payload[key], '');
    assert.equal(calls[1].payload.email_marketing_consent, 'no');
  });
  await check('malformed JSON, missing/invalid fields, impossible and conflicting dates fail before delivery', async () => {
    mock();
    for (const body of ['{', 'null', [], { ...quote, name: '' }, { ...quote, email: 'bad' }, { ...quote, desired_date: '2026-02-30' }, { ...quote, required_service_date: '2026-11-01' }, { ...quote, route: 'invalid' }, { ...quote, route: 'commercial' }, { ...quote, service: 'Essential Clean™ suitability', frequency: 'One-off' }, { ...quote, details: {} }]) {
      assert.equal((await submitForm(request(body), env, 'quote')).status, 400);
    }
    assert.equal(calls.length, 0);
  });
  await check('cross-origin, wrong content type and oversized bodies fail closed', async () => {
    mock();
    assert.equal((await submitForm(request(quote, undefined, { Origin: 'https://evil.invalid' }), env, 'quote')).status, 403);
    assert.equal((await submitForm(request(quote, undefined, { 'Content-Type': 'text/plain' }), env, 'quote')).status, 415);
    assert.equal((await submitForm(request('x'.repeat(33000)), env, 'quote')).status, 413);
    assert.equal(calls.length, 0);
  });
  await check('all non-production hosts validate but cannot send', async () => {
    mock();
    for (const host of ['localhost', '[::1]', '127.0.0.1', 'preview.hqc-london.pages.dev', 'deploy-preview-3.netlify.app', 'unknown.example']) {
      const response = await submitForm(request(quote, host), env, 'quote');
      assert.equal(response.status, 202); assert.equal((await response.json()).preview, true);
      assert.equal((await submitForm(request({ ...quote, name: '' }, host), env, 'quote')).status, 400);
    }
    assert.equal(calls.length, 0);
  });
  await check('contact payload cannot create a sales route and uses a separate endpoint', async () => {
    mock(); const response = await submitForm(request({ ...contact, route: 'commercial', stage: 'qualified', desired_date: '2026-10-30' }), env, 'contact');
    assert.equal(response.status, 200); assert.equal(calls[0].url, env.CONTACT_FORM_WEBHOOK);
    assert.equal(calls[0].payload.enquiry_type, 'contact');
    assert.equal(calls[0].payload.route, undefined); assert.equal(calls[0].payload.stage, undefined); assert.equal(calls[0].payload.desired_date, undefined);
  });
  await check('missing or reused contact destination fails closed', async () => {
    mock();
    for (const config of [{}, { ...env, CONTACT_FORM_WEBHOOK: env.QUOTE_FORM_WEBHOOK }, { ...env, QUICK_FORM_WEBHOOK: env.CONTACT_FORM_WEBHOOK }]) {
      assert.equal((await submitForm(request(contact), config, 'contact')).status, 503);
    }
    assert.equal(calls.length, 0);
  });
  await check('upstream rejection, logical failure, timeout and network failure never return success', async () => {
    for (const upstream of [() => new Response('Unavailable', { status: 503 }), () => new Response('{"success":false}'), () => new Response('{"ok":false}'), () => new Response('{"error":"failed"}'), () => { throw new DOMException('Timeout', 'TimeoutError'); }, () => { throw new TypeError('Network unavailable'); }]) {
      mock(upstream);
      for (const [kind, body] of [['quote', quote], ['contact', contact]]) assert.equal((await submitForm(request(body), env, kind)).status, 502);
    }
  });
  await check('server strips forged metadata and uses bounded delivery without redirects', async () => {
    mock(); await submitForm(request({ ...quote, source: 'confirmed', timestamp: 'forged', submission_id: 'forged', stage: 'won' }), env, 'quote');
    const sent = calls[0];
    assert.equal(sent.payload.stage, undefined); assert.notEqual(sent.payload.timestamp, 'forged'); assert.notEqual(sent.payload.submission_id, 'forged');
    assert.equal(sent.redirect, 'error'); assert.ok(sent.signal instanceof AbortSignal);
  });
  await check('private feedback validates rating and never represents a Google publication', async () => {
    const feedback = { name: 'Controlled Test', email: 'qa@example.invalid', rating: '1', feedback: 'Private feedback test' };
    mock();
    const response = await submitForm(request(feedback), { FEEDBACK_WEBHOOK: 'https://feedback.invalid/hook' }, 'feedback');
    assert.equal(response.status, 200);
    assert.equal(calls[0].payload.enquiry_type, 'private_feedback');
    assert.equal(calls[0].payload.rating, '1');
    assert.equal((await submitForm(request({ ...feedback, rating: '9' }), env, 'feedback')).status, 400);
    const preview = await submitForm(request(feedback, 'preview.hqc-london.pages.dev'), env, 'feedback');
    assert.equal((await preview.json()).preview, true);
    mock(() => new Response('{"success":false}'));
    assert.equal((await submitForm(request(feedback), { FEEDBACK_WEBHOOK: 'https://feedback.invalid/hook' }, 'feedback')).status, 502);
  });
  console.log(`${tests} runtime groups passed. Webhooks mocked; no GHL, booking, email or payment outcome is claimed.`);
} finally { globalThis.fetch = originalFetch; await rm(temp, { recursive: true, force: true }); }
