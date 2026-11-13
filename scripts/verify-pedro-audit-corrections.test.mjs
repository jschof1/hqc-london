import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { transform } from 'esbuild';
import { parse as parseAstro, transform as transformAstro } from '@astrojs/compiler';

const read = (path) => fs.readFileSync(path, 'utf8');
const data = (path) => JSON.parse(read(path));
const original = (path) => JSON.parse(execFileSync('git', ['show', `d4c296e:${path}`], { encoding: 'utf8' }));
const copy = data('src/data/phase8-copy.json');
const legal = data('src/data/phase8-legal.json');
const section = (slug, heading) => copy[slug].sections.find((section) => section.heading === heading);
const sectionText = (slug, heading) => JSON.stringify(section(slug, heading));
async function moduleAt(path) {
  const { code } = await transform(read(path), { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

// These expected words are the client acceptance criteria, independently stated
// here so a future missing/changed qualification is caught before a preview.
test('both offer sections carry the exact minimum commitment at their approved positions', () => {
  const offer = section('essential-clean-london', '30% Off Your First Clean for Eligible New Recurring Clients');
  assert.equal(offer.blocks[0].text, '30% off the first Essential Clean™ when starting an eligible weekly or fortnightly plan with a minimum three-month commitment.');
  const home = section('home-cleaning-london', 'Essential Clean™: Maintain and Improve');
  assert.equal(home.blocks[2].kind, 'ul');
  assert.equal(home.blocks[3].text, 'Receive 30% off your first Essential Clean™ when you start a weekly or fortnightly plan with a minimum three-month commitment.');
  assert.match(JSON.stringify(offer), /does not apply to one-off/);
});

test('the nine omitted controlled call-outs have been restored without replacing their surrounding sections', () => {
  const cases = [
    ['deep-cleaning-london', 'Restore First. Maintain Afterwards.', 'Deep Clean™ → improved baseline → Essential Clean™ maintenance'],
    ['commercial-deep-cleaning-london', 'Restore the Site Before Returning to Maintenance', 'Commercial Deep Clean → improved baseline → recurring commercial programme'],
    ['complex-property-cleaning-london', 'The HQC Complex Service Assessment & Delivery System™', 'Qualification → Assessment → Defined Scope → Delivery Plan → Controlled Delivery → Handover'],
    ['cleaning-prices-london', 'Why Bedroom Count Alone Is Not Enough', 'Price Labour. Not Bedrooms.'],
    ['cleaning-prices-london', 'The Principle Is Simple', 'Clear scope. Labour-based quotations. Careful delivery.'],
    ['why-choose-hqc', 'Quality Is Connected to the Agreed Outcome', 'Quality and attention to detail define HQC. Property condition and required outcome determine the service.'],
    ['why-choose-hqc', 'Cleaning Defined by the Outcome', 'The Right Cleaning Service for the Result You Need'],
    ['about-high-quality-clean', 'Why HQC Exists', 'Understand the result first. Then define the cleaning required to achieve it.'],
    ['about-high-quality-clean', 'Labour Matters', 'Price Labour. Not Bedrooms.']
  ];
  assert.equal(section('deep-cleaning-london', 'Restore First. Maintain Afterwards.').blocks[1].text, 'Deep Clean™ → improved baseline → Essential Clean™ maintenance');
  assert.equal(section('cleaning-prices-london', 'The Principle Is Simple').blocks[0].text, 'Clear scope. Labour-based quotations. Careful delivery.');
  const before = original('src/data/phase8-copy.json');
  for (const [slug, heading, text] of cases) {
    if (slug === 'cleaning-prices-london' && text === 'Price Labour. Not Bedrooms.') {
      assert.equal(copy[slug].heroSupport, text);
      assert.deepEqual(section(slug, heading).blocks, before[slug].sections.find((s) => s.heading === heading).blocks);
    } else {
      assert.equal(section(slug, heading).blocks.filter((b) => b.text === text).length, 1);
      assert.deepEqual(section(slug, heading).blocks.filter((b) => b.text !== text), before[slug].sections.find((s) => s.heading === heading).blocks);
    }
  }
});

test('the Complex amendment preserves the original access list and all seven controlled process steps', () => {
  const access = section('complex-property-cleaning-london', 'Confidentiality and Access');
  const before = original('src/data/phase8-copy.json')['complex-property-cleaning-london'];
  assert.deepEqual(access.blocks[1], before.sections.find((s) => s.heading === 'Confidentiality and Access').blocks[1]);
  assert.equal(access.blocks.at(-1).items.length, 4);
  const assessment = section('complex-property-cleaning-london', 'What the Assessment May Involve');
  assert.equal(assessment.blocks[0].text, 'Every complex assessment includes a site visit. Depending on the property, we may also ask for:');
  assert.ok(!assessment.blocks[1].items.includes('a site visit;'));
  assert.equal(assessment.blocks.at(-1).text, 'Not every complex enquiry will require every item.');
  const next = section('complex-property-cleaning-london', 'What Happens Next');
  assert.equal(next.blocks.filter((b) => b.kind === 'h3').length, 7);
  assert.equal(next.blocks[4].text, '3. Site assessment');
  assert.equal(next.blocks[5].text, 'We visit the property to confirm its condition, access and requirements.');
  assert.equal(next.blocks.at(-1).text, 'We take on new recurring clients only when we can staff them properly.');
  assert.equal(copy['complex-property-cleaning-london'].title, before.title);
  for (const [slug, page] of Object.entries(copy)) {
    if (slug !== 'complex-property-cleaning-london') assert.ok(!JSON.stringify(page).includes('We take on new recurring clients only when we can staff them properly.'));
  }
});

test('approved confirmation wording and unresolved legal decisions stay separate from the section 7 replacement', () => {
  const before = original('src/data/phase8-legal.json');
  const section5 = (blocks) => blocks.find((block) => block.text?.startsWith('A booking becomes confirmed only when HQC has reviewed'));
  assert.deepEqual(section5(legal.terms), section5(before.terms));
  assert.ok(JSON.stringify(legal).includes('Launch27/Automaid'));
  assert.ok(JSON.stringify(legal).includes('[FINAL LEGAL / PRODUCTION APPROVAL DATE]'));
  assert.ok(JSON.stringify(legal.privacy).includes('privacy@highqualityclean.co.uk'));
  assert.ok(JSON.stringify(legal.terms).includes('Email: support@highqualityclean.co.uk'));
  assert.ok(JSON.stringify(legal.terms).includes('Our booking system records booking requests and payment details. Recording payment details does not by itself mean that payment has been taken. HQC decides whether a deposit or payment is required for the service and when it is collected, and will confirm the applicable payment terms in the quotation or booking confirmation.'));
  assert.deepEqual(section('essential-clean-london', 'What Happens Next'), original('src/data/phase8-copy.json')['essential-clean-london'].sections.find((s) => s.heading === 'What Happens Next'));
  assert.ok(!read('src/pages/book-essential-clean.astro').includes('A 50% deposit on bookings over £400'));
});

test('homepage reviews use exactly the named six while the two exclusions disappear at the shared source', () => {
  const reviews = data('src/data/google-reviews.json');
  const selected = ['Kara O.', 'Lucy M.', 'Yori Z.', 'Fabio K.', 'Chris M.', 'Liv M.'];
  for (const name of selected) assert.equal(reviews.reviews.filter((r) => r.name === name).length, 1);
  assert.ok(!reviews.reviews.some((r) => ['Thomas B.', 'Andre B.'].includes(r.name)));
  assert.equal(reviews.rating, 4.9); assert.equal(reviews.reviewCount, 92);
  const cards = read('src/components/ReviewMarquee.astro');
  assert.equal((cards.match(/\['(?:Kara O\.|Lucy M\.|Yori Z\.|Fabio K\.|Chris M\.|Liv M\.)'/g) ?? []).length, 6);
  assert.ok(!cards.includes('<script>')); assert.ok(!cards.includes('hm-marquee-track'));
  assert.ok(!read('src/pages/index.astro').includes('<TrustRail'));
  assert.ok(!read('src/components/OutcomePage.astro').includes('<ClientEvidence'));
  assert.ok(read('src/components/OutcomePage.astro').includes("page.slug === 'reviews-case-studies' ? []"));
});

test('actual route data retains the corrected route, service and intent states', async () => {
  const { outcomePages } = await moduleAt('src/data/outcome-pages.ts');
  const page = (slug) => outcomePages.find((p) => p.slug === slug);
  const cases = [
    ['communal-area-cleaning-london', 'secondaryHref', '/request-a-quote/?route=commercial&service=communal&intent=site-visit'],
    ['commercial-cleaning-london', 'secondaryHref', '/request-a-quote/?route=commercial&intent=site-assessment'],
    ['commercial-deep-cleaning-london', 'primaryHref', '/request-a-quote/?route=commercial&service=commercial-deep&intent=assessment'],
    ['end-of-tenancy-cleaning-london', 'secondaryHref', '/request-a-quote/?route=residential&service=end-of-tenancy']
  ];
  for (const [slug, field, expected] of cases) assert.equal(page(slug)[field], expected);
  assert.equal(page('cleaning-prices-london').secondaryCta, 'Check Essential Clean™ Pricing');
  assert.equal(page('cleaning-prices-london').secondaryHref, '/essential-clean-london/');
  const selector = read('src/components/ServiceSelector.astro');
  assert.match(selector, /number: '08', result: 'complex'/);
  assert.match(selector, /href: '\/essential-clean-london\/\?next=booking'/);
});

test('the complex selector click changes the destination while preserving the established analytics category', async () => {
  const script = read('src/components/ServiceSelector.astro').match(/<script>([\s\S]*?)<\/script>/)[1];
  const { code } = await transform(script, { loader: 'ts' });
  const elements = new Map();
  const element = () => ({ textContent: '', attrs: {}, classList: { add() {}, remove() {} }, setAttribute(name, value) { this.attrs[name] = value; }, scrollIntoView() {} });
  for (const id of ['selector-result', 'selector-label', 'selector-heading', 'selector-copy', 'selector-primary', 'selector-secondary']) elements.set(id, element());
  let click; const button = { ...element(), dataset: { result: 'complex' }, addEventListener(_, fn) { click = fn; }, closest() { return null; } };
  const events = [];
  vm.runInNewContext(code, {
    document: { getElementById: (id) => elements.get(id), querySelectorAll: () => [button] },
    window: { dispatchEvent: (event) => events.push(event) },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    matchMedia: () => ({ matches: true })
  });
  click();
  assert.equal(elements.get('selector-primary').attrs.href, '/request-a-quote/?route=complex');
  assert.equal(events[0].detail.result, 'professional');
  button.dataset.result = 'professional'; click();
  assert.equal(elements.get('selector-primary').attrs.href, '/request-a-quote/?route=commercial');
});

test('disclosure follows explicit provenance and never relabels a genuine founder or unknown archive photo', async () => {
  const { isIllustrativeImage, illustrativeAlt } = await moduleAt('src/data/card-imagery.ts');
  for (const src of ['/images/phase8-nov10/r-routine-visit.webp', '/images/generated/hqc-home-hero.webp', '/images/phase8-nov6/complex-a-800.webp']) {
    assert.equal(isIllustrativeImage(src), true);
    assert.match(illustrativeAlt(src, 'A room.'), /^Illustrative: A room\./);
  }
  for (const src of ['/images/pedro-on-site-original.png', '/images/phase8-nov6/old-living-room-800.webp', '/images/luxury-home/richmond-living-room.png']) assert.equal(isIllustrativeImage(src), false);
  assert.match(illustrativeAlt('/images/phase8-nov10/r-routine-visit.webp', ''), /Illustrative: Cleaner in a teal uniform vacuuming/);
  assert.equal(createHash('sha256').update(fs.readFileSync('public/images/pedro-on-site-original.png')).digest('hex'), '5b5fe29232e15b7356df4a33e6ea6f9fca9950260ef65a625da7c595fa78bd71');
  const home = read('src/pages/index.astro');
  assert.ok(home.includes('alt="Pedro Ndombasi, founder of High Quality Clean, on site with a team member."'));
});

test('location templates implement the controlled cross-buyer structure without restoring unsupported local claims', () => {
  for (const region of ['london', 'surrey']) {
    const source = read(`src/pages/locations/${region}/[area].astro`);
    assert.ok(source.includes('Professional Cleaning Services in {areaInfo.name}'));
    assert.ok(source.includes('HQC supports suitable homes, workplaces and managed properties in {areaInfo.name}, subject to service requirements, scheduling and team availability.'));
    assert.ok(source.includes('Check Availability in {areaInfo.name}'));
    assert.ok(source.includes('Find My Service'));
    for (const route of ['/home-cleaning-london/', '/property-facilities-cleaning-london/', '/commercial-cleaning-london/', '/complex-property-cleaning-london/']) assert.ok(source.includes(route));
    assert.ok(!source.includes('areaInfo.aboutArea'));
    assert.ok(source.includes('Cleaning Services ${areaInfo.name} | High Quality Clean'));
    assert.equal(source.split('HQC supports suitable homes, workplaces and managed properties in {areaInfo.name}, subject to service requirements, scheduling and team availability.').length - 1, 1);
  }
});

test('an ambiguous Reviews replacement cannot remove the previously approved hero lead', () => {
  assert.deepEqual(copy['reviews-case-studies'].lead, original('src/data/phase8-copy.json')['reviews-case-studies'].lead);
  const template = read('src/components/OutcomePage.astro');
  assert.match(template, /page\.slug === 'reviews-case-studies' &&[\s\S]*?href=\{reviewsData\.profileUrl\}[\s\S]*?>Read all reviews on Google<\/a>/);
  assert.equal(data('src/data/google-reviews.json').profileUrl, original('src/data/google-reviews.json').profileUrl);
});

test('the requested public phone display includes Terms and all current source surfaces', () => {
  assert.match(JSON.stringify(legal), /Telephone: 020 8870 3925/);
  const files = fs.readdirSync('src', { recursive: true }).filter((file) => /\.(astro|json|[jt]s)$/.test(file));
  for (const file of files) assert.doesNotMatch(read(`src/${file}`), /0208 870 3925/, file);
});

test('the retained floor-plan image is no longer paired with its look-alike in the requested contexts', async () => {
  const { outcomeCardImagery, homeProcessImagery, homeComplexStepImagery, cardLibrary } = await moduleAt('src/data/card-imagery.ts');
  assert.equal(homeProcessImagery['Service profile'], 'g-service-profile');
  assert.notEqual(homeComplexStepImagery['Defined scope'], 'g-scope-plan');
  for (const slug of ['how-we-work', 'complex-property-cleaning-london']) assert.ok(!JSON.stringify(outcomeCardImagery[slug]).includes('g-scope-plan'), slug);
  assert.notEqual(cardLibrary[homeComplexStepImagery['Defined scope']].src, cardLibrary['g-service-profile'].src);
});

test('heading semantics retain the two-column error composition and valid homepage nesting', async () => {
  const classOf = (node) => node.attributes?.find((attr) => attr.name === 'class')?.value || '';
  const walk = (node, visit, ancestors = []) => { visit(node, ancestors); for (const child of node.children || []) walk(child, visit, [...ancestors, node]); };
  const error = (await parseAstro(read('src/pages/404.astro'))).ast;
  let intro;
  walk(error, (node) => { if (node.name === 'section' && classOf(node).includes('utility-error-intro')) intro = node; });
  const columns = intro.children.filter((node) => node.type === 'element' && node.name !== 'span');
  assert.deepEqual(columns.map((node) => node.name), ['div', 'div']);
  assert.ok(classOf(columns[0]).includes('utility-error-number'));
  assert.ok(columns[1].children.some((node) => node.name === 'h1'));
  walk(error, (node) => { if (node.name === 'ul') assert.ok(!classOf(node).includes('text-white'), 'useful routes inherit their porcelain panel contrast'); });
  const home = (await parseAstro(read('src/pages/index.astro'))).ast;
  walk(home, (node, ancestors) => { if (/^h[1-6]$/.test(node.name || '')) assert.ok(!ancestors.some((parent) => parent.name === 'span'), `invalid heading in span at line ${node.position?.start?.line}`); });
});

test('changed Astro sources compile without a site build; this does not claim browser or provider verification', async () => {
  const files = execFileSync('git', ['diff', '--name-only', 'd4c296e'], { encoding: 'utf8' }).trim().split('\n').filter((p) => p.endsWith('.astro'));
  for (const file of files) {
    const result = await transformAstro(read(file), { filename: file });
    assert.deepEqual(result.diagnostics.filter((d) => d.severity === 1), [], file);
  }
});
