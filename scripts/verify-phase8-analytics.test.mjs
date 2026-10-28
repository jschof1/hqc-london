import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { canonicalSitemapPaths } from './sitemap-routes.mjs';

const bundle = async path => (await build({ entryPoints: [path], bundle: true, write: false, platform: 'node', format: 'esm' })).outputFiles[0].text;
const contract = await import(`data:text/javascript;base64,${Buffer.from(await bundle('src/scripts/analytics-contract.js')).toString('base64')}`);
const adapter = (await build({ entryPoints: ['src/scripts/analytics.js'], bundle: true, write: false, format: 'iife' })).outputFiles[0].text;

test('Phase8 analytics preserves known paths and removes customer values, queries and unknown properties', () => {
  for (const path of canonicalSitemapPaths) assert.equal(contract.safePath(path), path);
  const poison = 'private-person@example.invalid';
  const data = contract.payload('cta_clicked', { category: 'phone', email: poison, destination: '/contact/', reason: poison },
    { hostname: contract.previewDomain, pathname: `/unknown/${poison}` }, `https://www.google.com/?q=${poison}`);
  assert.equal(data.u, `https://${contract.previewDomain}/other/`);
  assert.equal(data.r, 'https://www.google.com/');
  assert.deepEqual(data.p, { category: 'phone', destination: '/contact/', page_type: 'other', environment: 'staging' });
  assert.ok(!JSON.stringify(data).includes(poison));
  for (const host of ['localhost', 'other.hqc-london.pages.dev', 'unknown.example']) assert.equal(contract.dataset(host), null);
  assert.equal(contract.payload('form_preview', {}, { hostname: 'highqualityclean.co.uk', pathname: '/' }), null);
  assert.equal(contract.payload('invented_event', {}, { hostname: contract.previewDomain, pathname: '/' }), null);
});

function fixture(host = contract.previewDomain) {
  const events = [], listeners = {};
  class Form {
    id = 'routed-quote-form';
    dataset = { analyticsRouteReady: 'property' };
    querySelector() { return { value: 'Agency or Portfolio Support' }; }
  }
  const form = new Form();
  const window = { hqcCookiePreferences: { analytics: false }, addEventListener: (name, fn) => { listeners[name] = fn; } };
  vm.runInNewContext(adapter, {
    location: { hostname: host, pathname: '/request-a-quote/', href: `https://${host}/request-a-quote/?private=ignored` },
    window, document: { referrer: '', addEventListener() {}, getElementById: () => form,
      querySelector: () => ({ dataset: { route: 'property' } }), querySelectorAll: () => [] },
    HTMLFormElement: Form, localStorage: { getItem: () => null }, navigator: {}, performance: { now: () => 1 },
    IntersectionObserver: class { observe() {} disconnect() {} }, setInterval() {}, AbortController, URL,
    fetch: async (url, options) => { events.push({ url, options, body: JSON.parse(options.body) }); },
  });
  return { events, window, emit: (name, detail) => listeners[name]?.({ detail }) };
}

test('real adapter gates consent, isolates previews, deduplicates receipts and honours withdrawal', () => {
  const f = fixture();
  const stage = value => f.emit('hqc:form-stage', { id: 'routed-quote-form', stage: value });
  stage('attempted'); stage('receipt');
  assert.equal(f.events.length, 0);
  f.window.hqcCookiePreferences.analytics = true;
  f.emit('hqc:cookie-preferences-updated');
  f.emit('hqc:cookie-preferences-updated');
  assert.equal(f.events.filter(e => e.body.n === 'pageview').length, 1);
  assert.equal(f.events.find(e => e.body.n === 'quote_route_selected').body.p.route, 'property');
  stage('attempted'); stage('preview'); stage('receipt');
  assert.equal(f.events.filter(e => e.body.n === 'form_preview').length, 1);
  assert.equal(f.events.filter(e => e.body.n === 'form_receipt').length, 0);
  stage('attempted'); stage('error');
  assert.equal(f.events.filter(e => e.body.n === 'form_error').length, 1);
  stage('attempted'); stage('receipt'); stage('receipt');
  assert.equal(f.events.filter(e => e.body.n === 'form_receipt').length, 1);
  for (const event of f.events) {
    assert.equal(event.url, contract.endpoint);
    assert.equal(event.options.credentials, 'omit');
    assert.equal(event.options.referrerPolicy, 'no-referrer');
    assert.equal(event.body.d, contract.previewDomain);
  }
  f.window.hqcCookiePreferences.analytics = false;
  f.emit('hqc:cookie-preferences-updated');
  const count = f.events.length;
  stage('attempted'); stage('receipt');
  assert.equal(f.events.length, count);
  const unknown = fixture('unknown.example');
  unknown.window.hqcCookiePreferences.analytics = true;
  unknown.emit('hqc:cookie-preferences-updated');
  assert.equal(unknown.events.length, 0);
});
