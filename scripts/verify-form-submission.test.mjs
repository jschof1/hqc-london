import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import vm from 'node:vm';

// Bundle the real Astro route, with only its provider fetch replaced in each test.
const routes = {};
for (const kind of ['quote', 'contact', 'quick-form', 'discount', 'feedback']) {
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
  CONTACT_FORM_WEBHOOK: 'https://receiver.example.test/contact',
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
  assert.equal(redirect, 'manual');
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
  assert.equal(payload.privacy_notice_version, 'phase8-batch6-2026-09-28');
  assert.equal(payload.email_marketing_consent, 'no');
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
 { ...quote, route: 'bad' },
    { ...quote, service: 'Essential Clean™ suitability', frequency: 'One-off' },
    { ...quote, route: 'commercial' },
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

test('provider failures return sanitized 502 once and log only a bounded diagnostic', async () => {
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
    assert.equal(logs.length, providers.length);
    for (const entry of logs) {
      assert.equal(entry[0], 'HQC form delivery failed');
      assert.deepEqual(Object.keys(entry[1]).sort(), ['category', 'form', 'provider_status']);
      assert.equal(entry[1].form, 'quote');
      assert.ok(['fetch', 'http', 'body', 'rejected'].includes(entry[1].category));
      assert.doesNotMatch(JSON.stringify(entry), /private|secret|receiver\.example|intake@example/);
    }
    assert.equal(logs[7][1].provider_status, 500);
    assert.equal(logs[9][1].category, 'fetch');
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

test('legacy contact uses isolated receiver with a normalized discriminator and no sales fields', async () => capture(async calls => {
  for (const service of ['general-inquiry', 'existing-client', 'supplier', 'partnership', 'administrative', 'other']) {
    const response = await invoke('quick-form', { name: quote.name, email: quote.email, phone: '', postcode: '',
      service, message: 'Test contact message', privacy_consent: 'yes', source: 'forged',
      form_type: 'quote', enquiry_type: 'commercial', route: 'commercial', stage: 'won', details: 'sales details',
    });
    assert.equal(response.status, 200);
    const { url, payload } = calls.at(-1);
    assert.equal(url, env.CONTACT_FORM_WEBHOOK);
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

const classification = (type, service, discount = false) => [
  'hqc - source - website', ...(discount ? ['hqc - source - discount offer'] : []),
  `hqc - type - ${type}`, `hqc - service - ${service}`,
].join(',');

test('classification preserves every existing quote field and normalizes metadata before tagging', async () => capture(async calls => {
  const input = { ...quote, service: '  Deep Clean™  ', buyer: 'home', service_context: 'deep-clean',
    address: '1 Test Street', area: 'London', size: '800 sq ft', frequency: 'One-off',
    desired_date: '2026-11-03', required_service_date: '2026-11-03', checkout_date: '2026-11-01',
    inspection_date: '2026-11-02', move_in_date: '2026-11-04', operating_hours: 'Evenings',
    mobilisation_requirements: 'Access arranged', tupe_context: 'Unknown', property_type: 'flat',
    bedrooms: '2', bathrooms: '1', source_page: '/request-a-quote/', landing_page: '/deep-cleaning-london/',
    referrer: 'https://example.test/', utm_source: 'test', utm_medium: 'paid', utm_campaign: 'test',
    utm_content: 'test', utm_term: 'clean', utm_id: '123', intent: 'moving',
    source: 'forged', form_type: 'contact', enquiry_type: 'complex',
  };
  assert.equal((await invoke('quote', input)).status, 200);
  const { payload } = calls[0];
  for (const [key, value] of Object.entries(input)) {
    if (['details', 'source', 'form_type', 'enquiry_type'].includes(key)) continue;
    assert.equal(payload[key], value.trim(), key);
  }
  assert.ok(payload.details.startsWith(quote.details));
  assert.equal(payload.source, 'request_a_quote');
  assert.equal(payload.form_type, 'quote');
  assert.equal(payload.enquiry_type, 'residential');
  assert.equal(payload.classification_tags, classification('residential', 'deep clean'));
  assert.deepEqual(Object.keys(payload).sort(), [...new Set([...Object.keys(input),
    'classification_tags', 'timestamp', 'submission_id', 'privacy_notice_version', 'email_marketing_consent',
  ])].sort());
}));

for (const service of ['never-seen-before', 'Office Cleaning']) {
  test(`residential route with ${service} forwards unconfirmed tags without rejecting intake`, async () => capture(async calls => {
    assert.equal((await invoke('quote', { ...quote, service, property_type: 'flat' })).status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].payload.enquiry_type, 'residential');
    assert.equal(calls[0].payload.service, service);
    assert.equal(calls[0].payload.classification_tags, classification('unconfirmed', 'unconfirmed'));
  }));
}

test('current route aliases map to fixed service families without rewriting the submitted service', async () => capture(async calls => {
  const aliases = {
    residential: {
      'regular cleaning': ['essential-clean', 'essential'], 'deep clean': ['deep-clean', 'deep-cleaning'],
      'move in': ['move-in', 'move-in-cleaning'], 'end of tenancy': ['end-of-tenancy', 'end-of-tenancy-cleaning'],
      'post construction': ['post-construction', 'post-construction-cleaning'],
    },
    commercial: {
      office: ['office', 'office-cleaning'], commercial: ['commercial', 'commercial-cleaning'],
      'deep clean': ['commercial-deep', 'commercial-deep-cleaning'],
      communal: ['communal', 'communal-area', 'communal-area-cleaning'],
      'property portfolio': ['portfolio'], 'move in out': ['void', 'move-in-void'],
    },
    complex: {
      office: ['office'], 'deep clean': ['commercial-deep'], communal: ['communal'],
      assessment: ['large-property', 'complex-property'], 'post construction': ['post-construction'],
      'property portfolio': ['portfolio', 'multi-site'],
    },
  };
  for (const [route, families] of Object.entries(aliases)) {
    for (const [family, values] of Object.entries(families)) {
      for (const alias of values) {
        assert.equal((await invoke('quote', { ...quote, route, service: ` ${alias.toUpperCase()} `,
          frequency: 'Weekly', operating_hours: 'Evenings', mobilisation_requirements: 'Next month',
        })).status, 200);
        const { payload } = calls.at(-1);
        assert.equal(payload.classification_tags, classification(route, family));
        assert.equal(payload.service, alias.toUpperCase());
      }
    }
  }
}));

test('the pure helper excludes non-sales input and returns independent arrays without mutation', async () => {
  const result = await build({ entryPoints: [new URL('../src/lib/enquiry-classification.ts', import.meta.url).pathname],
    bundle: true, write: false, platform: 'node', format: 'esm',
  });
  const { websiteEnquiryTags } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
  const body = Object.freeze({ form_type: 'quote', source: 'request_a_quote', route: 'commercial', enquiry_type: 'property', service: 'Office Cleaning', property_type: 'flat' });
  const first = websiteEnquiryTags(body);
  assert.equal(first.join(','), classification('property', 'office'));
  first.push('modified return value');
  assert.equal(websiteEnquiryTags(body).join(','), classification('property', 'office'));
  for (const form_type of ['contact', 'feedback', 'unknown', '', '__proto__']) {
    assert.deepEqual(websiteEnquiryTags(Object.freeze({ ...body, form_type })), []);
  }
});

test('every current routed service forwards the declared enquiry type and a fixed service family', async () => capture(async calls => {
  const services = {
    residential: [
      ['Essential Clean™ suitability', 'regular cleaning'], ['Deep Clean™', 'deep clean'],
      ['Move-In Reset™', 'move in'], ['End of Tenancy™', 'end of tenancy'],
      ['Post-Construction™', 'post construction'], ['Other residential requirement', 'assessment'],
    ],
    property: [
      ['Communal Area Cleaning', 'communal'], ['Agency or Portfolio Support', 'property portfolio'],
      ['Move-In and Void Property Cleaning', 'move in out'], ['End of Tenancy™', 'end of tenancy'],
      ['Post-Construction™', 'post construction'], ['Other property requirement', 'assessment'],
    ],
    commercial: [
      ['Office Cleaning', 'office'], ['Commercial Cleaning', 'commercial'],
      ['Commercial Deep Cleaning', 'deep clean'], ['Other professional requirement', 'assessment'],
    ],
    complex: [
      ['Large or Executive Property', 'assessment'], ['Office or Workplace Project', 'office'],
      ['Commercial Deep-Clean Project', 'deep clean'], ['Communal Site Assessment', 'communal'],
      ['Post-Construction Project', 'post construction'], ['Multi-Site or Portfolio Project', 'property portfolio'],
      ['Other Complex Requirement', 'assessment'],
    ],
  };
  const source = await readFile(new URL('../src/pages/request-a-quote.astro', import.meta.url), 'utf8');
  const current = [...source.matchAll(/options: \[([^\]]+)\]/g)]
    .flatMap(match => [...match[1].matchAll(/'([^']+)'/g)].map(value => value[1]));
  assert.deepEqual(Object.values(services).flat().map(([service]) => service), current);
  for (const [route, entries] of Object.entries(services)) {
    for (const [service, family] of entries) {
      for (const selected of [service, ` ${service.toUpperCase()} `]) {
        assert.equal((await invoke('quote', { ...quote, route: route === 'property' ? 'commercial' : route,
          buyer: route === 'property' ? 'property' : route, service: selected, property_type: 'flat',
          frequency: 'Weekly', operating_hours: 'Evenings', mobilisation_requirements: 'Next month',
        })).status, 200);
        assert.equal(calls.at(-1).payload.classification_tags, classification(route, family), `${route}: ${selected}`);
        assert.equal(calls.at(-1).payload.service, selected.trim());
      }
    }
  }
  for (const buyer of ['agency', 'property']) {
    assert.equal((await invoke('quote', { ...quote, route: 'commercial', buyer, service: 'Office Cleaning',
      property_type: 'flat', frequency: 'Weekly', operating_hours: 'Evenings', mobilisation_requirements: 'Next month',
    })).status, 200);
    assert.equal(calls.at(-1).payload.classification_tags, classification('property', 'office'));
  }
}));

test('routed membership excludes unrelated global aliases and unknown commercial services even for property buyers', async () => capture(async calls => {
  for (const [route, services] of Object.entries({
    residential: ['office', 'office-cleaning', 'communal', 'signature', 'essentials', 'airbnb'],
    commercial: ['never-seen-before', 'deep-clean', 'post-construction', 'signature', 'wellclean', 'multi-site'],
    complex: ['signature', 'wellclean', 'airbnb', 'post-construction-cleaning', 'office-cleaning', 'void'],
  })) {
    for (const service of services) {
      for (const buyer of ['', 'agency', 'property']) {
        assert.equal((await invoke('quote', { ...quote, route, service, buyer,
          property_type: 'flat', desired_date: '2026-11-03', details: 'Residential home deep clean',
          frequency: 'Weekly', operating_hours: 'Evenings', mobilisation_requirements: 'Next month',
        })).status, 200);
        assert.equal(calls.at(-1).payload.classification_tags,
          classification(route === 'complex' ? 'complex' : 'unconfirmed', 'unconfirmed'), `${route}: ${service}: ${buyer}`);
      }
    }
  }
}));

test('legacy service IDs retain distinct tiers and never turn office plus flat into residential', async () => capture(async calls => {
  const services = [
    ['signature', 'residential', 'signature cleaning'], ['essentials', 'residential', 'regular cleaning'],
    ['wellclean', 'residential', 'wellness'], ['move-in-out', 'unconfirmed', 'move in out'],
    ['airbnb', 'property', 'airbnb'], ['office', 'commercial', 'office'],
    ['never-seen-before', 'unconfirmed', 'unconfirmed'],
  ];
  const source = await readFile(new URL('../src/pages/quote.astro', import.meta.url), 'utf8');
  const current = [...source.match(/const services = \[([\s\S]*?)\];/)[1].matchAll(/id: "([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(services.slice(0, -1).map(([id]) => id), current);
  for (const [service, type, family] of services) {
    assert.equal((await invoke('quote', { name: quote.name, email: quote.email, phone: quote.phone, postcode: quote.postcode,
      property_type: 'flat', frequency: 'weekly', service,
    })).status, 200);
    assert.equal(calls.at(-1).payload.classification_tags, classification(type, family), service);
  }
}));

test('quick forms require agreeing building and service signals and never guess from an area or free text', async () => capture(async calls => {
  const tiers = [['Essentials Clean™', 'regular cleaning'], ['Signature Clean™', 'signature cleaning'], ['WellClean™', 'wellness']];
  for (const page of ['services', 'process', 'why-us']) {
    const source = await readFile(new URL(`../src/pages/${page}.astro`, import.meta.url), 'utf8');
    const selector = source.match(/<select[^>]*name="service"[^>]*>([\s\S]*?)<\/select>/)[1];
    const current = [...selector.matchAll(/<option>([^<]+)<\/option>/g)].map(match => match[1]);
    assert.deepEqual(tiers.map(([service]) => service), current);
    for (const [service, family] of tiers) {
      const body = { name: quote.name, email: quote.email, postcode: quote.postcode,
        property_type: 'Apartment', service, privacy_consent: 'yes',
      };
      const req = request('quick-form', body);
      req.headers.set('Referer', `https://highqualityclean.co.uk/${page}/`);
      assert.equal((await invoke('quick-form', null, { request: req })).status, 200);
      assert.equal(calls.at(-1).payload.classification_tags, classification('residential', family));
    }
  }
  for (const [property_type, service, type, family] of [
    ['flat', 'Office Cleaning', 'unconfirmed', 'office'],
    ['Office', 'Office Cleaning', 'commercial', 'office'],
    ['Commercial Property', 'commercial', 'commercial', 'commercial'],
    ['Office', 'Essentials Clean™', 'unconfirmed', 'regular cleaning'],
    ['Other', 'Signature Clean™', 'unconfirmed', 'signature cleaning'],
    ['Modern Development', 'WellClean™', 'unconfirmed', 'wellness'],
    ['Apartment', 'Office-looking unknown service', 'unconfirmed', 'unconfirmed'],
    ['Mansion', '', 'unconfirmed', 'unconfirmed'],
  ]) {
    assert.equal((await invoke('quick-form', { name: quote.name, email: quote.email, postcode: quote.postcode,
      property_type, service, area: 'Chelsea', details: 'Commercial office deep clean', privacy_consent: 'yes',
      enquiry_type: 'residential', source: 'services_page',
    })).status, 200);
    assert.equal(calls.at(-1).payload.classification_tags, classification(type, family), `${property_type}: ${service}`);
  }
}));

test('discount classifications use only the normalized type and retain the legacy discount tag', async () => capture(async calls => {
  for (const [type, normalized] of [['home', 'residential'], ['Residential', 'residential'], ['commercial', 'commercial'], ['Commercial', 'commercial']]) {
    for (const variant of [{ message: 'Office deep clean' }, { phone: quote.phone, summary: 'Move in clean' }]) {
      assert.equal((await invoke('discount', { name: quote.name, email: quote.email, type, ...variant,
        service: 'Office Cleaning', enquiry_type: 'complex',
      })).status, 200);
      const { payload } = calls.at(-1);
      assert.equal(payload.classification_tags, classification(normalized, 'unconfirmed', true));
      assert.equal(payload.tag, 'discount offer');
      assert.equal('service' in payload, false);
    }
  }
}));

test('client tag fields cannot reach the receiver and contact or feedback never carry sales classifications', async () => capture(async calls => {
  const forged = { classification_tags: ['forged'], tags: { admin: true }, tag: 'won',
    classification_type: 'commercial', classification_service: 'deep clean', classification_anything: 'lifecycle',
  };
  for (const [kind, body, expected] of [
    ['quote', quote, classification('residential', 'deep clean')],
    ['quick-form', { name: quote.name, email: quote.email, postcode: quote.postcode, property_type: 'Apartment', service: 'WellClean™', privacy_consent: 'yes' }, classification('residential', 'wellness')],
    ['discount', { name: quote.name, email: quote.email, type: 'home', message: '' }, classification('residential', 'unconfirmed', true)],
    ['quick-form', { name: quote.name, email: quote.email, service: 'supplier', message: 'Test', privacy_consent: 'yes' }, ''],
    ['feedback', { name: quote.name, email: quote.email, feedback: 'Test', form_type: 'quote' }, ''],
  ]) {
    assert.equal((await invoke(kind, { ...body, ...forged })).status, 200);
    const { payload } = calls.at(-1);
    assert.equal(payload.classification_tags, expected);
    for (const key of Object.keys(forged).filter(key => !['classification_tags', 'tag'].includes(key))) {
      assert.equal(key in payload, false, key);
    }
    assert.equal(payload.tag, kind === 'discount' ? 'discount offer' : undefined);
    assert.doesNotMatch(JSON.stringify(payload), /forged|lifecycle/);
  }
}));

test('arbitrary accepted service and property strings produce only bounded fallback tags', async () => capture(async calls => {
  for (const service of ['__proto__', 'constructor', 'toString', 'office,won', 'deep', 'hqc - service - custom', 'x'.repeat(2000), ...Array.from({ length: 40 }, (_, i) => `unknown-${i}`)]) {
    for (const kind of ['quote', 'quick-form']) {
      const body = kind === 'quote' ? { ...quote, route: 'complex', service }
        : { name: quote.name, email: quote.email, postcode: quote.postcode, service, property_type: service, privacy_consent: 'yes' };
      assert.equal((await invoke(kind, body)).status, 200);
      assert.equal(calls.at(-1).payload.classification_tags, classification(kind === 'quote' ? 'complex' : 'unconfirmed', 'unconfirmed'));
    }
  }
}));

// Execute each real submit callback without a browser or third-party DOM library.
const frontends = [
  ['src/pages/request-a-quote.astro', '/api/quote/', quote],
  ['src/pages/contact.astro', '/api/contact/', { service: 'supplier' }],
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
      scrollIntoView() {}, focus() {}, setAttribute() {},
    };
    nodes.push(value);
    return value;
  };
  const button = node(), message = node(), success = node(true), preview = node(true), content = node();
  const form = {
    dataset: { hqcEndpoint: endpoint, hqcSource: 'services_page' },
    elements: { namedItem: () => null }, style: {}, reportValidity: () => true,
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
    tabs: [{ dataset: { route: 'residential' }, getAttribute: () => 'true' }], routes: { residential: {} }, initialService: '', setRoute() {}, populateContext() {},
    normalizeDiscountType: type => type === 'home' ? 'Residential' : 'Commercial',
    document: { getElementById: () => preview, createElement: () => node() },
    FormData: class { entries() { return Object.entries(payload); } },
    fetch: async () => response, window, alert: text => alerts.push(text),
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    console: { error() {} }, HTMLElement: class {},
  });
  await handler.call(form, { preventDefault() {} });
  return { captures, alerts, nodes, resets, form, success, preview, button, content, message };
}

for (const [path, endpoint, payload] of frontends) {
  test(`${path}: failures preserve input; preview neither resets nor converts; explicit acceptance converts`, async () => {
    for (const response of [Response.json({ ok: false, error: 'rejected' }), Response.json({}),
      new Response('not JSON'), Response.json({ ok: 'true' }), Response.json({ ok: 1 }), Response.json({ ok: true }, { status: 502 })]) {
      const ui = await frontend(path, endpoint, payload, response);
      assert.equal(ui.resets, 0);
      assert.ok(ui.captures.some(e => e.detail?.stage === 'attempted'));
      assert.ok(ui.captures.some(e => e.detail?.stage === 'error'));
      assert.ok(!ui.captures.some(e => e.detail?.stage === 'receipt'));
      assert.equal(ui.form.style.display, undefined);
      assert.equal(ui.success.classList.contains('hidden'), true);
      assert.equal(ui.button.disabled, false);
    }
    const preview = await frontend(path, endpoint, payload, Response.json({ ok: true, preview: true }, { status: 202 }));
    assert.equal(preview.resets, 0);
    assert.ok(preview.captures.some(e => e.detail?.stage === 'preview'));
    assert.ok(!preview.captures.some(e => e.detail?.stage === 'receipt'));
    assert.equal(preview.form.style.display, undefined);
    assert.equal(preview.success.classList.contains('hidden'), true);
    assert.equal(preview.button.disabled, false);
    assert.ok(preview.alerts.some(text => /preview.*not sent/i.test(text)) ||
      /preview.*not sent/i.test(preview.message.textContent) ||
      preview.nodes.some(n => /preview.*not sent/i.test(n.textContent)) ||
      !preview.preview.classList.contains('hidden'), 'preview must show an accurate state');
    const accepted = await frontend(path, endpoint, payload, Response.json({ ok: true, submission_id: 'correlation' }));
    assert.equal(accepted.captures.filter(e => e.detail?.stage === 'receipt').length, 1);
  });
}

test('Phase8 quote and contact acknowledge privacy visually; optional marketing is normalized and server version wins', async () => capture(async calls => {
  for (const kind of ['quote', 'contact']) {
    for (const consent of [undefined, '', 'no', 'YES', 'yes']) {
      const body = kind === 'quote' ? { ...quote } : { name: quote.name, email: quote.email, service: 'supplier', message: 'Question' };
      delete body.privacy_consent;
      if (consent !== undefined) body.email_marketing_consent = consent;
      body.privacy_notice_version = 'forged';
      assert.equal((await invoke(kind, body)).status, 200);
      const payload = calls.at(-1).payload;
      assert.equal(payload.email_marketing_consent, consent === 'yes' ? 'yes' : 'no');
      assert.equal(payload.privacy_notice_version, 'phase8-batch6-2026-09-28');
      assert.equal(payload.privacy_consent, undefined, 'do not invent a checkbox consent');
    }
  }
}));

test('Phase8 property and agency do not require commercial-only fields; commercial still does', async () => capture(async calls => {
  for (const buyer of ['property', 'agency']) {
    assert.equal((await invoke('quote', { ...quote, route: 'commercial', buyer, service: 'Agency or Portfolio Support' })).status, 200);
    assert.equal(calls.at(-1).payload.enquiry_type, 'property');
    assert.equal(calls.at(-1).payload.classification_tags, classification('property', 'property portfolio'));
    for (const key of ['frequency', 'operating_hours', 'mobilisation_requirements']) assert.equal(calls.at(-1).payload[key], undefined);
  }
  assert.equal((await invoke('quote', { ...quote, route: 'commercial', buyer: 'commercial' })).status, 400);
}));

test('legacy quick forms require actual privacy yes, independent of optional marketing', async () => noFetch(async () => {
  for (const privacy_consent of [undefined, '', 'no', 'true']) {
    assert.equal((await invoke('quick-form', { name: quote.name, email: quote.email, postcode: quote.postcode,
      property_type: 'flat', service: 'Signature Clean™', privacy_consent, email_marketing_consent: 'yes' })).status, 400);
  }
}));

test('all contact topics and private feedback strip the entire sales field union', async () => capture(async calls => {
  const sales = { ...quote, buyer: 'agency', route: 'commercial', service_context: 'office', address: 'Private',
    area: 'London', size: '500', frequency: 'Weekly', desired_date: '2026-11-03', required_service_date: '2026-11-03',
    checkout_date: '2026-11-02', inspection_date: '2026-11-04', move_in_date: '2026-11-05',
    operating_hours: 'Evenings', mobilisation_requirements: 'Now', tupe_context: 'Unknown',
    property_type: 'office', bedrooms: '2', bathrooms: '1', utm_source: 'sales', landing_page: '/quote/',
    source_page: '/quote/', referrer: 'https://example.test/', intent: 'sale', stage: 'won', type: 'Commercial', tag: 'sale',
  };
  for (const topic of ['general-inquiry', 'existing-client', 'supplier', 'partnership', 'administrative', 'other']) {
    assert.equal((await invoke('contact', { ...sales, service: topic, message: 'Question' })).status, 200);
    assert.equal(calls.at(-1).url, env.CONTACT_FORM_WEBHOOK);
    assert.equal(calls.at(-1).payload.form_type, 'contact');
    assert.equal(calls.at(-1).payload.enquiry_type, 'contact');
    const keys = ['name', 'email', 'phone', 'postcode', 'service', 'message', 'email_marketing_consent',
      'source', 'enquiry_type', 'form_type', 'privacy_notice_version', 'classification_tags', 'timestamp', 'submission_id'];
    for (const key of Object.keys(calls.at(-1).payload)) assert.ok(keys.includes(key), key);
  }
  assert.equal((await invoke('feedback', { ...sales, feedback: 'Private', message: 'Sale', rating: '2' })).status, 200);
  const keys = ['name', 'email', 'feedback', 'rating', 'reference', 'email_marketing_consent', 'source',
    'enquiry_type', 'form_type', 'privacy_notice_version', 'classification_tags', 'timestamp', 'submission_id'];
  for (const key of Object.keys(calls.at(-1).payload)) assert.ok(keys.includes(key), key);
  assert.equal(calls.at(-1).payload.classification_tags, '');
}));

test('explicit and legacy contact fail closed for missing or reused sales destinations, including normalized URLs', async () => noFetch(async () => {
  for (const kind of ['contact', 'quick-form']) {
    for (const CONTACT_FORM_WEBHOOK of [undefined, '', env.QUOTE_FORM_WEBHOOK, env.QUICK_FORM_WEBHOOK,
      env.DISCOUNT_FORM_WEBHOOK, 'https://receiver.example.test:443/quote', `${env.QUOTE_FORM_WEBHOOK}#different-name`]) {
      assert.equal((await invoke(kind, { name: quote.name, email: quote.email, service: 'supplier', message: 'Question',
        privacy_consent: 'yes' }, { env: { ...env, CONTACT_FORM_WEBHOOK } })).status, 503);
    }
  }
}));

test('unknown hosts are no-send even when configured with all production receivers', async () => noFetch(async () => {
  for (const host of ['unknown.example', 'highqualityclean.co.uk.evil.test', 'deploy-preview-3.netlify.app']) {
    for (const kind of ['quote', 'contact']) {
      const response = await invoke(kind, kind === 'quote' ? quote : { name: quote.name, email: quote.email, service: 'supplier', message: 'Question' }, { host });
      assert.equal(response.status, 202);
      assert.equal((await response.json()).preview, true);
    }
  }
}));

// A sales form adding optional notes must not silently change receiver/category.
test('quick sales enquiry remains sales when an optional message is present', async () => capture(async calls => {
  const response = await invoke('quick-form', { name: quote.name, email: quote.email, postcode: quote.postcode,
    property_type: 'flat', service: 'office', privacy_consent: 'yes', message: 'Please email first',
  });
  assert.equal(response.status, 200);
  assert.equal(calls[0].url, env.QUICK_FORM_WEBHOOK);
  assert.equal(calls[0].payload.form_type, 'quick-form');
  assert.equal(calls[0].payload.enquiry_type, 'quick_form');
}));
