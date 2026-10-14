import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const source = (await readFile(new URL('../src/scripts/posthog.ts', import.meta.url), 'utf8'))
  .replace("import('posthog-js')", 'loadPostHog()');

async function browser({ hostname = 'highqualityclean.co.uk', token = 'phc_test', delayed = false, fail = false } = {}) {
  const window = new EventTarget();
  window.hqcCookiePreferences = { analytics: false };
  const document = new EventTarget();
  const location = { hostname, origin: `https://${hostname}`, pathname: '/request-a-quote/', search: '?email=private@example.test', hash: '#private' };
  const captures = [];
  let imports = 0;
  let initializes = 0;
  let optedOut = true;
  let options;
  let release;
  const hold = new Promise(resolve => { release = resolve; });
  const sdk = {
    init(_token, config) { initializes++; options = config; return sdk; },
    opt_in_capturing() { optedOut = false; },
    opt_out_capturing() { optedOut = true; },
    set_config(settings) { Object.assign(options, settings); },
    reset() {},
    capture(event, properties = {}) {
      if (optedOut) return;
      const result = options.before_send({ event, properties: {
        token: 'phc_test', distinct_id: 'anonymous-browser', $lib: 'web',
        $current_url: location.origin + location.pathname + location.search + location.hash,
        $referrer: 'https://example.test/private?email=private@example.test',
        $initial_current_url: 'https://example.test/private', $set: { email: 'private@example.test' },
        utm_campaign: 'private@example.test', gclid: 'advertising-id', ...properties,
      } });
      if (result) captures.push(JSON.parse(JSON.stringify(result)));
    },
  };
  const { code } = await transform(source, {
    loader: 'ts', format: 'iife', target: 'es2022',
    define: {
      'import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN': JSON.stringify(token),
      'import.meta.env.PUBLIC_POSTHOG_HOST': JSON.stringify('https://eu.i.posthog.com'),
    },
  });
  vm.runInNewContext(code, {
    window, document, location,
    loadPostHog: async () => { imports++; if (delayed) await hold; if (fail) throw new Error('blocked'); return { default: sdk }; },
  });
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const consent = async analytics => {
    window.hqcCookiePreferences = { analytics };
    window.dispatchEvent(new Event('hqc:cookie-preferences-updated'));
    await settle();
  };
  return { window, document, location, sdk, captures, consent, release, settle,
    get imports() { return imports; }, get initializes() { return initializes; }, get options() { return options; } };
}

test('no SDK import or queued events before consent, or after rejection', async () => {
  const b = await browser();
  b.window.dispatchEvent(new CustomEvent('hqc:conversion', { detail: { event: 'phone_click' } }));
  await b.consent(false);
  assert.equal(b.imports, 0);
  assert.equal(b.captures.length, 0);
  await b.consent(true);
  assert.deepEqual(b.captures.map(e => e.event), ['$pageview']);
  assert.equal(b.options.disable_session_recording, true);
  assert.equal(b.options.autocapture, false);
  assert.equal(b.options.person_profiles, 'never');
});

test('withdrawal stops capture immediately, and reacceptance resumes once', async () => {
  const b = await browser();
  await b.consent(true);
  await b.consent(false);
  assert.equal(b.options.disable_persistence, true);
  b.sdk.capture('quote_submitted', { route: 'residential' });
  assert.equal(b.captures.length, 1);
  await b.consent(true);
  assert.equal(b.initializes, 1);
  assert.equal(b.options.disable_persistence, false);
  assert.equal(b.imports, 1);
  assert.equal(b.captures.length, 2);
});

test('withdrawal during SDK download prevents initialization', async () => {
  const b = await browser({ delayed: true });
  await b.consent(true);
  await b.consent(false);
  b.release();
  await b.settle();
  assert.equal(b.initializes, 0);
  assert.equal(b.captures.length, 0);
  await b.consent(true);
  assert.equal(b.initializes, 1);
});

test('SDK-added and supplied personal fields are removed from every allowed event', async () => {
  const b = await browser();
  await b.consent(true);
  b.sdk.capture('quote_submitted', {
    route: 'commercial', quote_flow: 'routed', service: 'private@example.test',
    email: 'private@example.test', href: 'tel:0123456789', name: 'Private Name',
  });
  b.sdk.capture('$exception', { message: 'private@example.test' });
  const event = b.captures.at(-1);
  assert.equal(event.event, 'quote_submitted');
  assert.equal(event.properties.route, 'commercial');
  assert.equal(event.properties.$current_url, 'https://highqualityclean.co.uk/request-a-quote/');
  assert.equal(event.properties.site_environment, 'production');
  assert.equal(/private|advertising-id|0123456789/.test(JSON.stringify(b.captures)), false);
  assert.equal(b.captures.length, 2);
});

test('navigation records one pageview per path and custom actions are not duplicated', async () => {
  const b = await browser();
  await b.consent(true);
  b.document.dispatchEvent(new Event('astro:page-load'));
  b.window.dispatchEvent(new Event('popstate'));
  assert.equal(b.captures.length, 1);
  b.location.pathname = '/contact/';
  b.document.dispatchEvent(new Event('astro:page-load'));
  b.window.dispatchEvent(new CustomEvent('hqc:conversion', { detail: { event: 'phone_click', href: 'tel:123' } }));
  b.window.dispatchEvent(new CustomEvent('hqc:conversion', { detail: { event: 'enquiry_route_selected', route: 'commercial' } }));
  assert.deepEqual(b.captures.map(e => e.event), ['$pageview', '$pageview', 'phone_click']);
});

test('HQC previews are labelled; localhost, other clients and missing configuration stay disabled', async () => {
  const preview = await browser({ hostname: 'analytics-check.hqc-london.pages.dev' });
  await preview.consent(true);
  assert.equal(preview.captures[0].properties.site_environment, 'preview');
  for (const options of [{ hostname: 'localhost' }, { hostname: 'other-client.pages.dev' }, { token: '' }]) {
    const b = await browser(options);
    await b.consent(true);
    assert.equal(b.imports, 0);
  }
});

test('an unavailable SDK fails quietly without creating events', async () => {
  const b = await browser({ fail: true });
  await b.consent(true);
  assert.equal(b.captures.length, 0);
  assert.equal(b.initializes, 0);
});
