import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code = readFileSync(new URL('../public/hqc-plausible.js', import.meta.url), 'utf8');
function run(host = 'highqualityclean.co.uk') {
  const events = [], handlers = {};
  const context = { URL, location: { hostname: host, href: `https://${host}/contact/?email=private#secret` }, document: { referrer: 'https://example.com/path?private=yes', addEventListener: (n, fn) => handlers[n] = fn }, window: { localStorage: { getItem: () => null }, addEventListener: (n, fn) => handlers[n] = fn }, fetch: (_, options) => { events.push(JSON.parse(options.body)); return Promise.resolve(); } };
  vm.runInNewContext(code, context);
  return { events, handlers, context };
}
test('one pageview per load, both live hosts, sanitized URLs, no preview traffic', () => {
  for (const host of ['highqualityclean.co.uk', 'www.highqualityclean.co.uk']) {
    const { events, context } = run(host);
    vm.runInNewContext(code, context);
    assert.equal(events.length, 1);
    assert.deepEqual(events[0], { n: 'pageview', d: 'highqualityclean.co.uk', u: `https://${host}/contact/`, r: 'https://example.com/path' });
  }
  assert.equal(run('preview.hqc-london.pages.dev').events.length, 0);
});
test('contact goals never include contact details; unrelated links do not convert', () => {
  const { events, handlers } = run();
  for (const href of ['tel:+441234', 'mailto:private@example.com', 'https://wa.me/441234', 'https://wa.me.attacker.test/', 'https://highqualityclean.co.uk/contact/']) {
    handlers.click({ target: { closest: () => ({ href }) } });
  }
  assert.deepEqual(events.map(e => e.n), ['pageview','Website Phone Click','Website Email Click','Website WhatsApp Click']);
  assert.ok(!JSON.stringify(events).includes('441234'));
});
test('only existing accepted form hooks count, no event properties copied', () => {
  const { events, handlers } = run();
  for (const detail of [{event:'enquiry_route_selected'}, {}, {event:'form_submit', email:'secret'}, {endpoint:'/api/quick-form'}, {endpoint:'/api/discount/'}]) handlers['hqc:conversion']({detail});
  assert.deepEqual(events.map(e => e.n), ['pageview', ...Array(3).fill('Website Enquiry Accepted')]);
  assert.ok(!JSON.stringify(events).includes('secret'));
});
