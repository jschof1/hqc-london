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
  expect(sourceText.includes('action="/api/quick-form/"'), `${path} must post to /api/quick-form/`);
  expect(sourceText.includes('data-hqc-endpoint="/api/quick-form/"'), `${path} must declare its same-origin endpoint`);
  expect(sourceText.includes(`data-hqc-source="${source}"`), `${path} must declare source ${source}`);
  for (const field of fields) {
    expect(sourceText.includes(`name="${field}"`), `${path} is missing named field ${field}`);
  }
  expect(!sourceText.includes('api.web3forms.com'), `${path} still references Web3Forms`);
  expect(!sourceText.includes('name="access_key"'), `${path} still contains a committed Web3Forms access key`);
  expect(!/onsubmit="[^"]*preventDefault\(\)[^"]*alert\(/.test(sourceText), `${path} still contains fake success handling`);
}

const connectedForms = [
  ['src/pages/contact.astro', '/api/quick-form/', ['name', 'email', 'phone', 'postcode', 'service', 'message', 'privacy_consent']],
  ['src/pages/request-a-quote.astro', '/api/quote/', [
    'route', 'buyer', 'service', 'service_context', 'name', 'email', 'phone', 'postcode',
    'address', 'area', 'size', 'frequency', 'desired_date', 'details', 'operating_hours',
    'mobilisation_requirements', 'tupe_context', 'privacy_consent', 'source_page',
    'landing_page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
    'utm_term', 'utm_id',
  ]],
  ['src/pages/quote.astro', '/api/quote/', [
    'name', 'email', 'phone', 'postcode', 'service', 'property_type', 'bedrooms', 'bathrooms',
    'frequency', 'details',
  ]],
  ['src/pages/discount.astro', '/api/discount/', ['name', 'email', 'phone', 'type', 'summary']],
  ['src/pages/feedback.astro', '/api/feedback/', ['rating', 'name', 'email', 'reference', 'feedback']],
];

for (const [path, endpoint, fields] of connectedForms) {
  const sourceText = await read(path);
  expect(sourceText.includes(`fetch('${endpoint}'`), `${path} must fetch ${endpoint}`);
  expect(/(?:result|responseBody)\?\.ok !== true/.test(sourceText), `${path} must require explicit form acceptance`);
  expect(/(?:result|responseBody)(?:\?)?\.preview === true/.test(sourceText), `${path} must distinguish preview submissions before success tracking`);
  for (const field of fields) {
    expect(sourceText.includes(`name="${field}"`), `${path} is missing expected CRM field ${field}`);
  }
}

const offer = await read('src/components/Offer.astro');
expect(offer.includes('action="/api/discount/"'), 'Offer form must post to /api/discount/');
expect(offer.includes('data-hqc-source="offer_component"'), 'Offer form must declare its source');
for (const field of ['type', 'name', 'email', 'phone', 'message']) {
  expect(offer.includes(`name="${field}"`), `Offer form is missing named field ${field}`);
}
expect(!offer.includes('Wire up your actual submission logic here'), 'Offer still contains placeholder submission logic');

const main = await read('src/scripts/main.js');
for (const required of ['fetch(endpoint', 'response.ok', "payload.type === 'home'", "payload.type === 'commercial'", "CustomEvent('hqc:conversion'", '0208 870 3925']) {
  expect(main.includes(required), `Shared form handler is missing: ${required}`);
}
expect(main.includes('result?.ok !== true'), 'Shared frontend must require explicit form acceptance');
expect(main.includes('result.preview === true'), 'Shared frontend must handle preview without resetting or tracking');

const handler = await read('src/lib/form-submission.ts');
const apiBindings = [
  ['quick-form', 'QUICK_FORM_WEBHOOK'],
  ['quote', 'QUOTE_FORM_WEBHOOK'],
  ['discount', 'DISCOUNT_FORM_WEBHOOK'],
  ['feedback', 'FEEDBACK_WEBHOOK'],
];
for (const [kind, binding] of apiBindings) {
  const path = `src/pages/api/${kind}.ts`;
  const sourceText = await read(path);
  expect(sourceText.includes("import { submitForm } from '../../lib/form-submission'"), `${path} must use the shared intake boundary`);
  expect(sourceText.includes(`, '${kind}')`), `${path} must pass its own form kind`);
  expect(!sourceText.includes('fetch(') && !sourceText.includes('request.json('), `${path} must remain a thin route`);
  expect(handler.includes(binding), `Shared handler must select ${binding}`);
}
for (const contract of ['request.body?.getReader()', 'MAX_BYTES', 'required_service_date',
  'delete body.desired_date', 'body.form_type =', 'body.submission_id = crypto.randomUUID()',
  "isNonProductionRequest(request)", 'AbortSignal.timeout(10_000)', "redirect: 'error'",
  'result?.ok === false', 'result?.success === false']) {
  expect(handler.includes(contract), `Shared intake boundary is missing ${contract}`);
}
expect(!handler.includes('CONTACT_FORM_WEBHOOK'), 'Contact must retain the existing receiver until a separate receiver is configured');

const previewGuard = await read('src/lib/preview.ts');
expect(previewGuard.includes("hostname.endsWith('.pages.dev')"), 'Preview guard must recognise Cloudflare Pages preview hosts');
expect(previewGuard.includes('status: 202'), 'Preview guard must return an accepted test response');

const layout = await read('src/layouts/Layout.astro');
expect(layout.includes("process.env.CF_PAGES_BRANCH !== 'main'"), 'Prerendered Pages preview routes must receive preview metadata from the deployment branch');
expect(layout.includes("'noindex, nofollow, noarchive'"), 'Preview routes must not be indexed');

const cookiePreferences = await read('src/components/CookiePreferences.astro');
expect(cookiePreferences.includes("window.location.hostname.toLowerCase()"), 'Analytics consent must use the runtime hostname as a preview safety check');
expect(cookiePreferences.includes("hostname.endsWith('.pages.dev')"), 'Analytics must remain disabled on Pages preview hosts even on prerendered routes');
expect(cookiePreferences.includes('banner.dataset.analyticsAllowed === \'true\' && !runtimePreviewHost'), 'Analytics requires production build permission and a production runtime host');

if (failures.length) {
  console.error(`Form routing verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Form routing verification passed for 4 repaired quick forms, discount offer, 5 existing form routes, shared handler, and 4 webhook bindings.');
