import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const quickForms = [
  ['src/pages/areas.astro', 'areas_page', ['name', 'email', 'postcode', 'area', 'property_type', 'details', 'privacy_consent']],
  ['src/pages/process.astro', 'process_page', ['name', 'email', 'postcode', 'property_type', 'service', 'details', 'privacy_consent']],
  ['src/pages/services.astro', 'services_page', ['name', 'email', 'postcode', 'property_type', 'service', 'details', 'privacy_consent']],
  ['src/pages/why-us.astro', 'why_us_page', ['name', 'email', 'postcode', 'property_type', 'service', 'details', 'privacy_consent']],
];

for (const [path, source, fields] of quickForms) {
  const sourceText = await read(path);
  expect(sourceText.includes('action="/api/quick-form"'), `${path} must post to /api/quick-form`);
  expect(sourceText.includes('data-hqc-endpoint="/api/quick-form"'), `${path} must declare its same-origin endpoint`);
  expect(sourceText.includes(`data-hqc-source="${source}"`), `${path} must declare source ${source}`);
  for (const field of fields) {
    expect(sourceText.includes(`name="${field}"`), `${path} is missing named field ${field}`);
  }
  expect(!sourceText.includes('api.web3forms.com'), `${path} still references Web3Forms`);
  expect(!sourceText.includes('name="access_key"'), `${path} still contains a committed Web3Forms access key`);
  expect(!/onsubmit="[^"]*preventDefault\(\)[^"]*alert\(/.test(sourceText), `${path} still contains fake success handling`);
}

const connectedForms = [
  ['src/pages/contact.astro', '/api/quick-form', ['name', 'email', 'phone', 'postcode', 'service', 'message']],
  ['src/pages/request-a-quote.astro', '/api/quote', [
    'route', 'buyer', 'service', 'service_context', 'name', 'email', 'phone', 'postcode',
    'address', 'area', 'size', 'frequency', 'desired_date', 'details', 'operating_hours',
    'mobilisation_requirements', 'tupe_context', 'privacy_consent', 'source_page',
    'landing_page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
    'utm_term', 'utm_id',
  ]],
  ['src/pages/quote.astro', '/api/quote', [
    'name', 'email', 'phone', 'postcode', 'service', 'property_type', 'bedrooms', 'bathrooms',
    'frequency', 'details',
  ]],
  ['src/pages/discount.astro', '/api/discount', ['name', 'email', 'phone', 'type', 'summary']],
  ['src/pages/feedback.astro', '/api/feedback', ['rating', 'name', 'email', 'reference', 'feedback']],
];

for (const [path, endpoint, fields] of connectedForms) {
  const sourceText = await read(path);
  expect(sourceText.includes(`fetch('${endpoint}'`), `${path} must fetch ${endpoint}`);
  for (const field of fields) {
    expect(sourceText.includes(`name="${field}"`), `${path} is missing expected CRM field ${field}`);
  }
}

const offer = await read('src/components/Offer.astro');
expect(offer.includes('action="/api/discount"'), 'Offer form must post to /api/discount');
expect(offer.includes('data-hqc-source="offer_component"'), 'Offer form must declare its source');
for (const field of ['type', 'name', 'email', 'phone', 'message']) {
  expect(offer.includes(`name="${field}"`), `Offer form is missing named field ${field}`);
}
expect(!offer.includes('Wire up your actual submission logic here'), 'Offer still contains placeholder submission logic');

const main = await read('src/scripts/main.js');
for (const required of ['fetch(endpoint', 'response.ok', "payload.type === 'home'", "payload.type === 'commercial'", "CustomEvent('hqc:conversion'", '0208 870 3925']) {
  expect(main.includes(required), `Shared form handler is missing: ${required}`);
}

const apiBindings = [
  ['src/pages/api/quick-form.ts', 'QUICK_FORM_WEBHOOK'],
  ['src/pages/api/quote.ts', 'QUOTE_FORM_WEBHOOK'],
  ['src/pages/api/discount.ts', 'DISCOUNT_FORM_WEBHOOK'],
  ['src/pages/api/feedback.ts', 'FEEDBACK_WEBHOOK'],
];
for (const [path, binding] of apiBindings) {
  const sourceText = await read(path);
  expect(sourceText.includes(binding), `${path} must use ${binding}`);
  expect(sourceText.includes('body: JSON.stringify(body)'), `${path} must preserve the submitted JSON payload`);
}

if (failures.length) {
  console.error(`Form routing verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Form routing verification passed for 4 repaired quick forms, discount offer, 5 existing form routes, shared handler, and 4 webhook bindings.');
