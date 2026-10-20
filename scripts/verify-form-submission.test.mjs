import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import vm from 'node:vm';

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

const invoke = (kind, body, options = {}) => routes[kind]({
  request: options.request ?? request(kind, body, options.host),
  locals: { runtime: { env: options.env ?? env } },
});
async function capture(run) {
  const calls = [];
  await withProvider(async (url, options) => {
    calls.push({ url, ...options, payload: JSON.parse(options.body) });
    return Response.json({ success: true });
  }, () => run(calls));
}
async function noFetch(run) {
  let calls = 0;
  await withProvider(async () => { calls++; throw new Error('Unexpected fetch'); }, run);
  assert.equal(calls, 0, 'invalid or preview submissions must not reach a receiver');
}

test('current routed quote maps dates, legacy notes and server-owned metadata', async () => capture(async calls => {
  const input = { ...quote, desired_date: '2026-11-03', checkout_date: '2026-11-02',
    address: '1 Test Street', service_context: 'deep-clean', buyer: 'homeowner', size: '800 sq ft',
    area: 'London', intent: 'moving', utm_source: 'test', source_page: '/request-a-quote/',
    source: 'forged', form_type: 'feedback', enquiry_type: 'contact', timestamp: 'forged',
    submission_id: 'forged', stage: 'won', privacy_notice_version: 'phase8-forged',
  };
  const response = await invoke('quote', input);
  assert.equal(response.status, 200);
  const result = await response.json();
  const { payload, signal, redirect, method, url } = calls[0];
  assert.equal(url, env.QUOTE_FORM_WEBHOOK);
  assert.equal(method, 'POST');
  assert.equal(redirect, 'error');
  assert.ok(signal instanceof AbortSignal);
  assert.equal(payload.required_service_date, '2026-11-03');
  assert.equal(payload.checkout_date, '2026-11-02');
  assert.equal(payload.inspection_date, '');
  assert.equal(payload.move_in_date, '');
  assert.equal(payload.desired_date, payload.required_service_date);
  assert.equal('property_type' in payload, false, 'do not invent a building type from the sales route');
  for (const value of ['Test condition and access', 'Deep Clean™', '1 Test Street', '2026-11-03', 'deep-clean', 'homeowner', '800 sq ft', 'London', 'moving']) {
    assert.ok(payload.details.includes(value), `legacy details must retain ${value}`);
  }
  assert.equal(payload.form_type, 'quote');
  assert.equal(payload.source, 'request_a_quote');
  assert.equal(payload.enquiry_type, 'residential');
  assert.equal(payload.utm_source, 'test');
  assert.equal(payload.privacy_consent, 'yes');
  assert.equal('stage' in payload, false);
  assert.equal('privacy_notice_version' in payload, false);
  assert.match(payload.timestamp, /^\d{4}-\d\d-\d\dT/);
  assert.match(payload.submission_id, /^[0-9a-f-]{36}$/);
  assert.ok(payload.details.includes(payload.submission_id));
  assert.ok(payload.details.includes(payload.timestamp));
  assert.equal(result.submission_id, payload.submission_id);
  assert.equal(result.ok, true);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  await invoke('quote', input);
  assert.notEqual(calls[1].payload.submission_id, payload.submission_id, 'UUIDs correlate attempts, not deduplicate delivery');
}));

test('legacy detailed quote allows optional notes and keeps property and room fields', async () => capture(async calls => {
  const legacy = { name: quote.name, email: quote.email, phone: quote.phone, postcode: quote.postcode,
    service: 'office', property_type: 'flat', frequency: 'weekly', bedrooms: 'studio', bathrooms: '1', details: '',
  };
  assert.equal((await invoke('quote', legacy)).status, 200);
  const { payload } = calls[0];
  assert.equal(payload.source, 'website_detailed_quote_page');
  assert.equal(payload.property_type, 'flat');
  assert.equal(payload.bedrooms, 'studio');
  assert.equal(payload.bathrooms, '1');
  assert.equal(payload.frequency, 'weekly');
  assert.equal(payload.enquiry_type, 'commercial');
  assert.equal('operating_hours' in payload, false, 'legacy page does not require routed commercial fields');
}));

test('current commercial, property and complex routes follow current conditional requirements', async () => capture(async calls => {
  for (const buyer of ['', 'agency', 'property']) {
    const response = await invoke('quote', { ...quote, route: 'commercial', buyer, service: 'Office Cleaning',
      frequency: 'Weekly', operating_hours: 'After 6pm', mobilisation_requirements: 'Start next month', tupe_context: 'Unknown',
    });
    assert.equal(response.status, 200);
    assert.equal(calls.at(-1).payload.enquiry_type, buyer ? 'property' : 'commercial');
    assert.ok(calls.at(-1).payload.details.includes('After 6pm'));
  }
  assert.equal((await invoke('quote', { ...quote, route: 'complex', service: 'Large or Executive Property' })).status, 200);
  assert.equal(calls.at(-1).payload.enquiry_type, 'complex');
}));

test('date conflicts and non-ISO or impossible dates fail before fetch', async () => noFetch(async () => {
  for (const dates of [
    { desired_date: '2026-11-02', required_service_date: '2026-11-03' },
    { desired_date: '2026-02-30' }, { required_service_date: '03/11/2026' },
    { checkout_date: '2026-13-01' }, { inspection_date: 'tomorrow' }, { move_in_date: '2026-11-03T00:00:00Z' },
  ]) assert.equal((await invoke('quote', { ...quote, ...dates })).status, 400);
}));

test('matching aliases and leap days normalize to one canonical date envelope', async () => capture(async calls => {
  assert.equal((await invoke('quote', { ...quote, desired_date: '2028-02-29', required_service_date: '2028-02-29' })).status, 200);
  assert.equal(calls[0].payload.required_service_date, '2028-02-29');
  assert.equal(calls[0].payload.desired_date, '2028-02-29');
}));

test('invalid JSON, non-object input, field types and current required fields fail without fetch', async () => noFetch(async () => {
  const invalidJSON = new Request('https://highqualityclean.co.uk/api/quote/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
  assert.equal((await invoke('quote', null, { request: invalidJSON })).status, 400);
  for (const body of [null, [], 'string', { ...quote, name: {} }, { ...quote, email: 'invalid' },
    { ...quote, phone: 'abc' }, { ...quote, postcode: '' }, { ...quote, details: '' },
    { ...quote, privacy_consent: 'no' }, { ...quote, route: 'bad' },
    { ...quote, service: 'Essential Clean™ suitability', frequency: 'One-off' },
    { ...quote, route: 'commercial' }, { ...quote, service: 'Office Cleaning', route: 'commercial', buyer: 'agency' },
    { ...quote, details: 'a'.repeat(8001) },
  ]) assert.equal((await invoke('quote', body)).status, 400);
}));

test('JSON media type, same-origin and streamed byte limits are enforced without fetch', async () => noFetch(async () => {
  for (const [headers, body, expected] of [
    [{ 'Content-Type': 'text/plain' }, JSON.stringify(quote), 415],
    [{ 'Content-Type': 'application/json-malformed' }, JSON.stringify(quote), 415],
    [{ 'Content-Type': 'application/json', Origin: 'https://other.example.test' }, JSON.stringify(quote), 403],
    [{ 'Content-Type': 'application/json', 'Content-Length': '32769' }, '{}', 413],
    [{ 'Content-Type': 'application/json' }, JSON.stringify({ ignored: 'a'.repeat(32768) }), 413],
    [{ 'Content-Type': 'application/json' }, JSON.stringify({ ignored: 'é'.repeat(17000) }), 413],
  ]) {
    const req = new Request('https://highqualityclean.co.uk/api/quote/', { method: 'POST', headers, body });
    assert.equal((await invoke('quote', null, { request: req })).status, expected);
  }
}));

test('missing or invalid receiver fails closed and does not leak configuration', async () => noFetch(async () => {
  for (const webhook of [undefined, '', 'not a URL', 'http://receiver.example.test/private-token']) {
    const response = await invoke('quote', quote, { env: { QUOTE_FORM_WEBHOOK: webhook } });
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /receiver|private-token/);
  }
  const response = await routes.quote({ request: request('quote', quote), locals: {} });
  assert.equal(response.status, 503);
}));

test('provider HTTP failures, negative JSON and network/redirect errors return sanitized 502 once', async () => {
  const providers = [
    () => Response.json({ success: false }), () => Response.json({ accepted: false }),
    () => Response.json({ error: 'private customer at secret receiver' }),
    () => Response.json({ statusCode: 422, message: ['Invalid field value'] }),
    () => Response.json({ status: 'error', message: 'Submission rejected' }),
    () => Response.json({ status: 'failed' }),
    () => Response.json({ errors: ['Submission rejected'] }),
    () => new Response('private receiver error', { status: 500 }),
    () => new Response(null, { status: 302, headers: { Location: 'https://other.example.test' } }),
    () => { throw new TypeError('redirect or network failure https://receiver.example.test/private-token'); },
    () => ({ ok: true, text: async () => { throw new TypeError('private body read failure'); } }),
  ];
  const logs = [];
  const originalError = console.error;
  console.error = (...args) => logs.push(args);
  try {
    for (const provider of providers) {
      let calls = 0;
      await withProvider(async () => { calls++; return provider(); }, async () => {
        const response = await invoke('quote', quote);
        assert.equal(response.status, 502);
        assert.doesNotMatch(await response.text(), /private|secret|receiver\.example/);
        assert.equal(calls, 1);
      });
    }
    assert.equal(logs.length, 0);
  } finally { console.error = originalError; }
});

test('ten-second timeout covers fetch and response body, without retries', async () => {
  const originalTimeout = AbortSignal.timeout;
  const delays = [];
  AbortSignal.timeout = delay => { delays.push(delay); return originalTimeout(5); };
  try {
    for (const duringBody of [false, true]) {
      let calls = 0;
      await withProvider(async (_url, { signal }) => {
        calls++;
        if (duringBody) return {
          ok: true,
          text: () => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })),
        };
        return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
      }, async () => {
        // Node's timeout signal is unref'd; hold this isolated test process alive.
        const hold = setTimeout(() => {}, 1000);
        try { assert.equal((await invoke('quote', quote)).status, 502); }
        finally { clearTimeout(hold); }
        assert.equal(calls, 1);
      });
    }
    assert.deepEqual(delays, [10_000, 10_000]);
  } finally { AbortSignal.timeout = originalTimeout; }
});

test('valid previews return no-send 202, preserve validation and never need a receiver', async () => noFetch(async () => {
  const forms = {
    quote,
    'quick-form': { name: quote.name, email: quote.email, service: 'supplier', message: 'Question', privacy_consent: 'yes' },
    discount: { name: quote.name, email: quote.email, type: 'home', message: '' },
    feedback: { name: quote.name, email: quote.email, feedback: 'Test', rating: '3' },
  };
  for (const host of ['localhost', '127.0.0.1', '[::1]', 'review.hqc-london.pages.dev']) {
    for (const [kind, body] of Object.entries(forms)) {
      const response = await invoke(kind, body, { host, env: {} });
      assert.equal(response.status, 202);
      const result = await response.json();
      assert.equal(result.preview, true);
      assert.match(result.message, /no notification was sent/);
    }
    assert.equal((await invoke('quote', { ...quote, email: 'invalid' }, { host })).status, 400);
  }
}));

test('discount page and embedded offer retain their distinct required fields and type compatibility', async () => capture(async calls => {
  for (const [type, expected] of [['home', 'Residential'], ['commercial', 'Commercial'], ['Residential', 'Residential'], ['Commercial', 'Commercial']]) {
    assert.equal((await invoke('discount', { name: quote.name, email: quote.email, phone: quote.phone, type, summary: 'Weekly clean', source: 'forged' })).status, 200);
    const { payload } = calls.at(-1);
    assert.equal(payload.type, expected);
    assert.equal(payload.summary, 'Weekly clean');
    assert.equal(payload.tag, 'discount offer');
    assert.equal(payload.source, 'discount_page');
    assert.equal(payload.form_type, 'discount');
  }
  assert.equal((await invoke('discount', { name: quote.name, email: quote.email, type: 'home', message: '' })).status, 200);
  assert.equal(calls.at(-1).payload.source, 'offer_component');
  assert.equal(calls.at(-1).payload.summary, '');
  assert.equal((await invoke('discount', { name: quote.name, email: quote.email, type: 'commercial', message: 'Office clean', page_url: 'https://highqualityclean.co.uk/' })).status, 200);
  assert.equal(calls.at(-1).payload.summary, 'Office clean');
  assert.equal(calls.at(-1).payload.page_url, 'https://highqualityclean.co.uk/');
}));

test('invalid discount and feedback values do not reach a receiver', async () => noFetch(async () => {
  for (const type of ['bad', '__proto__', '']) {
    assert.equal((await invoke('discount', { name: quote.name, email: quote.email, type, message: '' })).status, 400);
  }
  assert.equal((await invoke('discount', { name: quote.name, email: quote.email, type: 'home', summary: 'Test' })).status, 400);
  assert.equal((await invoke('feedback', { name: quote.name, email: quote.email, feedback: 'Test', rating: '6' })).status, 400);
  assert.equal((await invoke('feedback', { name: quote.name, email: quote.email, feedback: '' })).status, 400);
}));

test('contact stays on quick receiver with a normalized discriminator and no sales fields', async () => capture(async calls => {
  for (const service of ['general-inquiry', 'existing-client', 'supplier', 'partnership', 'administrative', 'other']) {
    const response = await invoke('quick-form', { name: quote.name, email: quote.email, phone: '', postcode: '',
      service, message: 'Test contact message', privacy_consent: 'yes', source: 'forged',
      form_type: 'quote', enquiry_type: 'commercial', route: 'commercial', stage: 'won', details: 'sales details',
    });
    assert.equal(response.status, 200);
    const { url, payload } = calls.at(-1);
    assert.equal(url, env.QUICK_FORM_WEBHOOK);
    assert.equal(payload.form_type, 'contact');
    assert.equal(payload.source, 'contact_page');
    assert.equal(payload.enquiry_type, 'contact');
    assert.equal(payload.message, 'Test contact message');
    for (const field of ['route', 'stage', 'details']) assert.equal(field in payload, false);
  }
}));

test('current quick forms allow missing phone and notes and retain their page sources', async () => capture(async calls => {
  for (const [page, source] of [['areas', 'areas_page'], ['process', 'process_page'], ['services', 'services_page'], ['why-us', 'why_us_page']]) {
    const body = { name: quote.name, email: quote.email, postcode: 'SW1', property_type: 'Apartment', privacy_consent: 'yes', source: 'forged', page_url: `https://highqualityclean.co.uk/${page}/`,
      ...(page === 'areas' ? { area: 'Chelsea' } : { service: 'Signature Clean™' }),
    };
    const req = request('quick-form', body);
    req.headers.set('Referer', `https://highqualityclean.co.uk/${page}/`);
    assert.equal((await invoke('quick-form', null, { request: req })).status, 200);
    assert.equal(calls.at(-1).payload.source, source);
    assert.equal(calls.at(-1).payload.form_type, 'quick-form');
    assert.equal(calls.at(-1).payload.enquiry_type, 'quick_form');
    assert.equal(calls.at(-1).payload.page_url, body.page_url);
  }
  assert.equal((await invoke('feedback', { name: quote.name, email: quote.email, feedback: 'Test', reference: 'TEST-1', rating: '4' })).status, 200);
  assert.equal(calls.at(-1).url, env.FEEDBACK_WEBHOOK);
  assert.equal(calls.at(-1).payload.enquiry_type, 'private_feedback');
}));

// Execute each real submit callback without a browser or third-party DOM library.
const frontends = [
  ['src/pages/request-a-quote.astro', '/api/quote/', quote],
  ['src/pages/quote.astro', '/api/quote/', quote],
  ['src/pages/contact.astro', '/api/quick-form/', { service: 'supplier' }],
  ['src/pages/discount.astro', '/api/discount/', { type: 'home' }],
  ['src/pages/feedback.astro', '/api/feedback/', { rating: '3' }],
  ['src/scripts/main.js', '/api/quick-form/', quote],
];
async function frontend(path, endpoint, payload, response) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  const start = /^([ \t]*)(?:form|feedbackForm)\??\.addEventListener\('submit', async/m.exec(source);
  assert.ok(start, `real submit callback in ${path}`);
  const closing = `\n${start[1]}});`;
  const end = source.indexOf(closing, start.index);
  assert.notEqual(end, -1);
  const { code } = await transform(source.slice(start.index, end + closing.length), { loader: 'ts' });
  const captures = [], alerts = [], nodes = [];
  let handler, resets = 0;
  const node = (hidden = false) => {
    const classes = new Set(hidden ? ['hidden'] : []);
    const value = { disabled: false, textContent: 'Submit', innerHTML: 'Submit', style: {}, dataset: {},
      classList: { add: (...v) => v.forEach(c => classes.add(c)), remove: (...v) => v.forEach(c => classes.delete(c)), contains: c => classes.has(c) },
      scrollIntoView() {}, setAttribute() {},
    };
    nodes.push(value);
    return value;
  };
  const button = node(), message = node(), success = node(true), preview = node(true), content = node();
  const form = {
    dataset: { hqcEndpoint: endpoint, hqcSource: 'services_page' },
    style: {}, reportValidity: () => true,
    querySelector: selector => selector.includes('button') ? button : null,
    appendChild() {}, reset: () => { resets++; },
    addEventListener: (_type, fn) => { handler = fn; },
  };
  const window = { location: { href: 'https://highqualityclean.co.uk/services/' }, posthog: { capture: (...args) => captures.push(args) },
    dispatchEvent: event => captures.push(event), scrollTo() {},
  };
  vm.runInNewContext(code, {
    form, feedbackForm: form, submit: button, submitBtn: button, message, successMessage: success,
    formContent: content, successContent: success, feedbackStep: content, successStep: success,
    steps: [content], navContainer: node(), progressContainer: node(),
    originalBtnText: 'Submit', originalButtonText: 'Submit', routeInput: { value: 'residential' },
    routes: { residential: {} }, initialService: '', setRoute() {}, populateContext() {},
    normalizeDiscountType: type => type === 'home' ? 'Residential' : 'Commercial',
    document: { getElementById: () => preview, createElement: () => node() },
    FormData: class { entries() { return Object.entries(payload); } },
    fetch: async () => response, window, alert: text => alerts.push(text),
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    console: { error: () => assert.fail('frontend must not log provider data') },
  });
  await handler.call(form, { preventDefault() {} });
  return { captures, alerts, nodes, resets, form, success, preview, button, content, message };
}

for (const [path, endpoint, payload] of frontends) {
  test(`${path}: failures preserve input; preview neither resets nor converts; explicit acceptance converts`, async () => {
    for (const response of [Response.json({ ok: false, error: 'rejected' }), Response.json({}),
      new Response('not JSON'), Response.json({ ok: true }, { status: 502 })]) {
      const ui = await frontend(path, endpoint, payload, response);
      assert.equal(ui.resets, 0);
      assert.equal(ui.captures.length, 0);
      assert.equal(ui.form.style.display, undefined);
      assert.equal(ui.success.classList.contains('hidden'), true);
      assert.equal(ui.button.disabled, false);
    }
    const preview = await frontend(path, endpoint, payload, Response.json({ ok: true, preview: true }, { status: 202 }));
    assert.equal(preview.resets, 0);
    assert.equal(preview.captures.length, 0);
    assert.equal(preview.form.style.display, undefined);
    assert.equal(preview.success.classList.contains('hidden'), true);
    assert.equal(preview.button.disabled, false);
    assert.ok(preview.alerts.some(text => /preview.*not sent/i.test(text)) ||
      /preview.*not sent/i.test(preview.message.textContent) ||
      preview.nodes.some(n => /preview.*not sent/i.test(n.textContent)) ||
      !preview.preview.classList.contains('hidden'), 'preview must show an accurate state');
    const accepted = await frontend(path, endpoint, payload, Response.json({ ok: true, submission_id: 'correlation' }));
    assert.ok(accepted.captures.length > 0);
  });
}
