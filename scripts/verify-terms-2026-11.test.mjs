// Regression checks for Pedro's 20 and 23 November 2026 Terms amendments.
// The expected wording below is restated independently from Pedro's amendment document.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const BASELINE = '4751e5b';
const REQUEST_BASELINE = 'c4c601d';
const read = (path) => fs.readFileSync(path, 'utf8');
const legal = JSON.parse(read('src/data/phase8-legal.json'));
const before = JSON.parse(execFileSync('git', ['show', `${BASELINE}:src/data/phase8-legal.json`], { encoding: 'utf8' }));
const requestBefore = JSON.parse(execFileSync('git', ['show', `${REQUEST_BASELINE}:src/data/phase8-legal.json`], { encoding: 'utf8' }));

function sections(blocks) {
  const result = [];
  for (const block of blocks) {
    if (block.kind === 'h2') result.push({ heading: block.text, number: Number(block.text.match(/^(\d+)\. /)?.[1]) || null, title: block.text.replace(/^\d+\. /, ''), blocks: [] });
    else result.at(-1)?.blocks.push(block);
  }
  return result;
}
const now = sections(legal.terms);
const old = sections(before.terms);
const requestOld = sections(requestBefore.terms);
const byNumber = (list, n) => list.find((s) => s.number === n);
const byTitle = (list, title) => list.find((s) => s.title === title);
const texts = (section) => section.blocks.flatMap((b) => b.lines ?? b.items ?? (b.rows ? b.rows.flat() : [b.text]));
const has = (section, text) => texts(section).includes(text);

test('header line is dated for the corrected edition', () => {
  assert.deepEqual(legal.terms[0], { kind: 'p', text: 'Last updated: 24 November 2026' });
  assert.ok(!JSON.stringify(legal.terms).includes('[FINAL LEGAL / PRODUCTION APPROVAL DATE]'));
  assert.deepEqual(legal.terms.slice(1, 3), before.terms.slice(1, 3));
});

test('Privacy Policy adds only the requested WhatsApp supplier category', () => {
  const expected = structuredClone(requestBefore.privacy);
  const categories = expected.find((block) => block.kind === 'ul' && block.items?.includes('email and business communications;'));
  categories.items.splice(categories.items.indexOf('email and business communications;') + 1, 0, 'messaging services (WhatsApp);');
  assert.deepEqual(legal.privacy, expected);
});

test('numbered sections are sequential, followed only by the commercial schedule', () => {
  const numbered = now.filter((s) => s.number !== null);
  assert.deepEqual(numbered.map((s) => s.number), numbered.map((_, i) => i + 1));
  assert.equal(numbered.length, 35);
  assert.equal(now.at(-1).heading, 'Commercial Clients Schedule');
  assert.equal(now.filter((s) => s.number === null).length, 1);
});

const expectedOrder = [
  'Company and Definitions', 'Service Selection and Scope', 'Information Supplied by the Client', 'Quotations',
  "HQC's Service Commitment", 'Booking Confirmation', 'Pricing and VAT', 'Payment',
  'Essential Clean™ Recurring Introductory Offer', 'Commercial and Other Recurring Agreements', 'Your 14-Day Right to Cancel',
  'HQC Appointment Cancellation & Rescheduling Matrix', 'HQC Cancellation or Material Rescheduling',
  'Project and Assessment-Led Cancellation Terms', 'Access and Aborted Visits', 'Keys, Access Codes and Alarms',
  'Safe Working Conditions', 'Property Condition and Variations', 'Specialist and Sensitive Items',
  'Appliances, Windows, Carpets and Other Add-Ons', 'End of Tenancy™', 'Post-Construction™', 'Recurring and Commercial Services',
  'Team Allocation and Subcontractors', 'Service Timing', 'Quality, Complaints and Remedial Action', 'Results and Limitations',
  'Damage, Valuables and Photos', 'Insurance', 'Force Majeure and Events Beyond Reasonable Control', 'Personal Information',
  'Intellectual Property', 'Changes to These Terms', 'Governing Law', 'Contact'
];

test('new sections sit after old §4 and §14 and every other section keeps its order', () => {
  assert.deepEqual(now.filter((s) => s.number).map((s) => s.title), expectedOrder);
});

test('sections the amendments do not touch are identical to the historical baseline', () => {
  const changed = new Set(['Company and Definitions', 'Quotations', 'Payment', 'Essential Clean™ Recurring Introductory Offer',
    'Consumer Statutory Cancellation Rights', 'HQC Appointment Cancellation & Rescheduling Matrix', 'Quality, Complaints and Remedial Action',
    'Damage and Pre-Existing Conditions', 'Changes to These Terms', 'Contact', 'Booking Confirmation', 'Pricing and VAT',
    'Appliances, Windows, Carpets and Other Add-Ons', 'Insurance']);
  let compared = 0;
  for (const section of old) {
    if (changed.has(section.title)) continue;
    assert.deepEqual(byTitle(now, section.title)?.blocks, section.blocks, section.title);
    compared++;
  }
  assert.equal(compared, 19);
  assert.deepEqual(byNumber(now, 17), byNumber(requestOld, 17), 'section 17 remains unchanged from the request baseline');
});

test('changed sections keep every earlier approved block and add only the requested wording', () => {
  const additive = [
    ['Company and Definitions', 1], ['Quality, Complaints and Remedial Action', 1], ['Changes to These Terms', 1]
  ];
  for (const [title, added] of additive) {
    const was = byTitle(old, title).blocks;
    assert.deepEqual(byTitle(now, title).blocks.slice(0, was.length), was, title);
    assert.equal(byTitle(now, title).blocks.length, was.length + added, title);
  }
  // Approved §7 booking-system paragraph is still in Payment (now §8).
  assert.ok(has(byNumber(now, 8), 'Our booking system records booking requests and payment details. Recording payment details does not by itself mean that payment has been taken. HQC decides whether any advance payment is required for the service and when it is collected, and will confirm the applicable payment terms in the quotation or booking confirmation.'));
});

test('§1 precedence, §4 quotation validity and the service commitment are verbatim', () => {
  assert.ok(has(byNumber(now, 1), 'Your contract with HQC is made up of these Terms and any quotation, booking confirmation or commercial proposal we send you. If they conflict, the specific quotation, confirmation or proposal applies over these general Terms, unless that would remove a right you have by law.'));
  assert.ok(has(byNumber(now, 4), 'A quotation is valid for 30 days from the date we send it. It is based on the information you give us and assumes normal conditions and access. Availability is confirmed only when we confirm your booking.'));
  assert.deepEqual(texts(byNumber(now, 5)), [
    'Our commitment',
    'HQC will carry out the agreed service with reasonable care and skill, using methods suitable for the surfaces and items within the agreed scope.',
    'If something has been missed',
    'If an area within the agreed scope has not been cleaned to a reasonable standard, please tell us within 48 hours of the visit, with a short description and photographs where possible. Where we agree that the issue falls within the agreed scope, we will return to put it right at no extra cost, at the earliest suitable time.',
    'If a re-clean is not possible within a reasonable time, or does not resolve the issue, you may be entitled to an appropriate price reduction.',
    'The 48-hour window is our preferred reporting time, so that we can check the issue while it is fresh. It does not remove your statutory rights or any legal time limit.'
  ]);
  assert.ok(!/Decision for Pedro|P\.N:|Decided \(/.test(JSON.stringify(legal.terms)));
});

test('quotations retain exactly the three remaining bullets', () => {
  assert.deepEqual(byNumber(now, 4).blocks.find((block) => block.kind === 'ul').items, [
    'a quotation covers only the stated scope;',
    'additional work is not automatically included;',
    'quotations remain subject to availability until booking is confirmed;'
  ]);
});

test('VAT appears in §7 only and Payment retains Pedro\'s Stripe text without the duplicate subsection', () => {
  assert.equal(texts(byNumber(now, 7))[0], 'HQC is VAT-registered. Prices for consumers include VAT. Prices for business clients may be quoted excluding VAT, and will say so. Business clients receive a VAT invoice.');
  assert.equal(texts(byNumber(now, 8))[0], 'Payment timing depends on the service and may include payment at booking, advance payment before service, payment on completion, recurring card payment or invoicing under agreed commercial terms.');
  const tail = texts(byNumber(now, 8)).slice(-8);
  assert.deepEqual(tail, [
    'How you pay',
    'We take card payments through Stripe, our card payment provider, which is our preferred method. We also accept bank transfer by arrangement.',
    'When you pay',
    'We will tell you when payment is due in your quotation or booking confirmation. For some bookings, such as one-off, larger or specialist cleans, we may ask for full or part payment before work begins. If so, we will tell you the amount and when it is due before your booking is confirmed. Before a visit, we may place a temporary hold on your card to check that it can be used. A hold is not a charge.',
    'If a payment fails',
    'If we cannot take payment or confirm your card, we will contact you so that you can update your card details or pay another way. If payment cannot be confirmed before a visit, we may need to reschedule it. If an amount remains unpaid, we may pause future visits until it is resolved.',
    'Refunds',
    'Where a refund is due, including when you cancel under §11, we will make it to your original payment method within 14 days.'
  ]);
  assert.ok(!texts(byNumber(now, 8)).includes('Prices and VAT'));
});

test('recurring offer has exactly the three requested changes', () => {
  const was = byNumber(old, 8).blocks;
  const is = byNumber(now, 9).blocks;
  const replaced = 'Where a client repeatedly cancels or suspends enough visits to materially defeat the agreed recurring arrangement, HQC may review the pattern and, after considering the circumstances, treat the arrangement as having ended early.';
  const expected = was.map((b) => b.text === replaced ? { kind: 'p', text: 'If three or more consecutive scheduled visits are cancelled or suspended by you during the minimum term, other than for reasons outside your reasonable control, we may write to you to treat the arrangement as ended early. In that case the discount balance may apply.' } : b);
  assert.notDeepEqual(expected, was);
  assert.deepEqual(is, [...expected,
    { kind: 'p', text: 'The discount balance will not be charged where you end the arrangement because HQC has materially failed to provide the agreed service, and has not put it right after you told us about it.' },
    { kind: 'h3', text: 'Price changes for recurring clients' },
    { kind: 'p', text: "Your price is fixed for the three-month minimum term. After that, we may change the price of your recurring service by giving you at least 30 days' written notice. If you do not accept the new price, you may end the arrangement without charge before the new price takes effect." }
  ]);
  assert.equal(was.at(-3).text, 'If HQC ends the recurring arrangement');
});

test('14-day right to cancel replaces the old statutory section and includes the model form', () => {
  assert.deepEqual(texts(byNumber(now, 11)), [
    'If you are a consumer and you book a service online, by phone or email, or away from our business premises, you have the right to cancel the contract within 14 days without giving a reason. The 14 days start on the day the contract is made, which is the day we confirm your booking.',
    'To cancel, tell us clearly before the 14 days end, for example by email to support@highqualityclean.co.uk or by phone on 020 8870 3925. You may use the model cancellation form below, but you do not have to.',
    'If you cancel within the 14 days and no service has been provided, we will refund any payment you have made within 14 days of your cancellation, using the same payment method.',
    'If you ask us to start the service within the 14-day period and then cancel, you must pay a proportionate amount for the service provided up to the time you tell us you are cancelling. If the service has been fully performed at your request within the 14 days, you lose the right to cancel for that service.',
    'This statutory right is separate from our appointment cancellation and rescheduling policy in §12.',
    'Model cancellation form',
    'To: High Quality Clean Ltd, 9 Swanage Road, London SW18 2DZ, support@highqualityclean.co.uk',
    'I hereby give notice that I cancel my contract for the supply of the following service: [service]. Ordered on: [date]. Name: [name]. Address: [address]. Date: [date].'
  ]);
  // Booking-form tick-box and confirmation-email paragraph are not Terms text.
  assert.ok(!JSON.stringify(legal.terms).includes('If my first clean is within 14 days of booking'));
  assert.ok(!JSON.stringify(legal.terms).includes('Your right to cancel —'));
});

test('cancellation matrix replaces only the client cancel/reschedule rows with fixed tiers', () => {
  const was = byNumber(old, 11).blocks;
  const is = byNumber(now, 12).blocks;
  const oldTable = was.find((b) => b.kind === 'table');
  const tables = is.filter((b) => b.kind === 'table');
  assert.equal(tables.length, 2);
  assert.equal(is[0].text, "The matrix below is HQC's normal policy for appointments. Any charge remains subject to applicable consumer law.");
  assert.deepEqual(tables[0].rows, [
    ['Situation', 'Notice before scheduled start', 'Charge'],
    ['You cancel or reschedule', 'More than 48 hours', '£0'],
    ['You cancel or reschedule', '24 to 48 hours', '25% of the booked service price'],
    ['You cancel or reschedule', 'Less than 24 hours', '50% of the booked service price'],
    ['You cancel after the team has set off, or the team cannot gain access as agreed', 'On the day', '100% of the booked service price']
  ]);
  const replaced = ['Customer cancels', 'Customer reschedules', 'Customer cancels or reschedules', 'Same-day cancellation after dispatch', 'Failed access'];
  assert.deepEqual(tables[1].rows, oldTable.rows.filter((row, i) => i === 0 || !replaced.includes(row[0])));
  for (const kept of ['HQC cancellation before attendance', 'HQC operational failure during service', 'Undisclosed unsafe condition', 'Property materially different from information supplied', 'Post-construction site not ready', 'Exceptional circumstances', 'Substantial client-caused access delay']) {
    assert.equal(tables[1].rows.filter((row) => row[0] === kept).length, 1, kept);
  }
  assert.ok(!JSON.stringify(is).includes('Up to 50%') && !JSON.stringify(is).includes('Up to 100%'));
  assert.deepEqual(is[is.indexOf(tables[0]) + 1], { kind: 'p', text: 'These charges reflect the cleaner time we have reserved and usually cannot reallocate at short notice. If we are able to reallocate the time, we will reduce or waive the charge. Statutory cancellation rights in §11 are not affected.' });
  // Every non-table block of the old section remains in order.
  assert.deepEqual(is.filter((b) => b.kind !== 'table' && !b.text?.startsWith('These charges reflect')).slice(1), was.filter((b) => b.kind !== 'table').slice(1));
});

test('keys, access codes and alarms follows Access and Aborted Visits with the £500 cap', () => {
  assert.equal(byNumber(now, 15).title, 'Access and Aborted Visits');
  assert.deepEqual(texts(byNumber(now, 16)), [
    'Keys and codes held by HQC',
    'Where you give us keys, fobs or access codes, we will record who holds them, store keys securely and unlabelled with your address, and share codes only with the team members attending. We will return keys or confirm their destruction when the arrangement ends, or sooner if you ask.',
    'Lost keys',
    'If a key or fob in our care is lost through our fault, we will tell you promptly and pay the reasonable cost of replacing it, up to £500 per incident.',
    'Alarms',
    'Please give us accurate alarm instructions and tell us about any change. We will pay any reasonable call-out charge caused by our failure to follow the instructions you gave us. We are not responsible for call-outs caused by incorrect or out-of-date instructions, or by a faulty system.',
    'Written protocol',
    'For complex, executive and commercial clients, we will agree the key-holding and access arrangements in writing before the first visit.'
  ]);
});

test('complaints, damage, copy of Terms and contact wording are verbatim', () => {
  assert.equal(texts(byNumber(now, 26)).at(-1), 'We aim to acknowledge complaints within 2 working days and respond fully within 10 working days. If we cannot resolve your complaint, we will tell you in writing and explain any alternative dispute resolution options available. You can also get free advice from Citizens Advice.');
  assert.deepEqual(texts(byNumber(now, 28)), [
    'Damage caused by HQC',
    "If we damage your property or belongings through our negligence, we will repair it or pay the reasonable cost of repair. Where repair is not possible, we will pay a fair replacement value, taking account of the item's age and condition.",
    'Reporting damage',
    'Please tell us within 48 hours of the visit, with photographs, and keep the item or affected area as it is until we have inspected it, where reasonable. Reporting promptly helps us investigate; it does not remove your statutory rights.',
    'What we are not responsible for',
    'We are not responsible for:',
    'damage caused by an existing defect, wear or faulty installation that we could not reasonably have identified;',
    'items that are loose, unstable or not fixed as they should be;',
    'the result of following a specific instruction you gave us, where we told you of the risk beforehand.',
    'Valuables',
    'Please put away cash, jewellery and small valuable items before the visit, and tell us about any fragile, high-value or sentimental items in the areas we are cleaning.',
    'Photographs for quality records',
    'Our team may take dated photographs of the areas cleaned, before and after, to record the condition and the work done. These are kept securely for quality and dispute purposes only. We never publish photographs of your home without your written consent.',
    'Nothing in these Terms excludes or limits liability where doing so would be unlawful.'
  ]);
  assert.equal(texts(byNumber(now, 33)).at(-1), 'Your booking confirmation email links to the version of these Terms that applies to your booking. Each version is dated and kept available at a fixed address. Please save or print a copy for your records, or ask us and we will email you one.');
  assert.deepEqual(byNumber(now, 35).blocks, [
    'High Quality Clean Ltd, registered in England and Wales, company number 13213121',
    'Registered office: 9 Swanage Road, London SW18 2DZ',
    'VAT registration number: 519 1014 22',
    'Telephone: 020 8870 3925',
    'WhatsApp: 07824 390336',
    'Bookings, changes, cancellations and complaints: support@highqualityclean.co.uk',
    'Personal data and privacy requests: privacy@highqualityclean.co.uk'
  ].map((text) => ({ kind: 'p', text })));
});

test('insurance, access-equipment exclusion and commercial C5 use the confirmed wording', () => {
  const schedule = now.at(-1);
  assert.deepEqual(texts(schedule).filter((t) => /^C\d\. /.test(t)), ['C1. Liability', 'C2. Payment', 'C3. Non-solicitation', 'C4. Term and price review', 'C5. Indemnities and insurance']);
  assert.ok(has(schedule, 'This schedule applies only to Commercial Services (as defined in §1).'));
  assert.ok(has(schedule, "HQC's total liability to a commercial client arising from any service is limited to the greater of the fees paid or payable for that service in the 12 months before the claim, or £1 million. HQC is not liable for loss of profit, loss of business, loss of revenue or any indirect or consequential loss. Nothing limits liability for death or personal injury caused by negligence, fraud, or anything else that cannot be limited by law."));
  assert.ok(has(schedule, 'Invoices are payable within 30 days of the invoice date unless the proposal states otherwise. HQC may charge interest and compensation on late payments under the Late Payment of Commercial Debts (Interest) Act 1998.'));
  assert.ok(has(schedule, "During the agreement and for 12 months after it ends, the client will not directly engage any HQC team member who worked at the client's premises in the previous 12 months, without HQC's written agreement. If this happens, the client will pay HQC a fee equal to 20% of that team member's annual earnings from HQC, as a reasonable estimate of HQC's recruitment and training costs."));
  assert.ok(has(schedule, "The minimum term, notice period and any annual price review are as stated in the proposal. Where a price review applies, HQC will give at least 30 days' written notice."));
  assert.ok(has(schedule, "HQC does not give any indemnity, or accept any liability, beyond what is set out in these Terms and the agreed proposal, unless a director of HQC agrees otherwise in writing. HQC's insurance certificate is available on request; it does not name clients as interested parties."));
  assert.deepEqual(texts(byNumber(now, 29)), ["HQC holds public liability insurance with a limit of £5 million and employers' liability insurance with a limit of £10 million. Certificates are available on request."]);
  assert.equal(texts(byNumber(now, 20)).at(-1), 'We do not carry out work that needs rope access, cradles, harnesses or powered access platforms (such as cherry pickers or scissor lifts).');
  assert.ok(byNumber(now, 1).blocks.some((b) => b.items?.some((item) => item.startsWith('Commercial Service means'))));
  assert.ok(!/RSAP|TMP0\d\d/.test(JSON.stringify(legal.terms)));
});

test('every internal § cross-reference points at the section it names', () => {
  const refs = [...JSON.stringify(legal.terms).matchAll(/§(\d+)/g)].map((m) => Number(m[1]));
  assert.deepEqual([...new Set(refs)].sort((a, b) => a - b), [1, 11, 12]);
  assert.equal(byNumber(now, 1).title, 'Company and Definitions');
  assert.equal(byNumber(now, 11).title, 'Your 14-Day Right to Cancel');
  assert.equal(byNumber(now, 12).title, 'HQC Appointment Cancellation & Rescheduling Matrix');
  assert.ok(!/\b(?:section|clause) \d+/i.test(JSON.stringify(legal.terms)));
});

test('footer preserves its content and adds the requested WhatsApp link', () => {
  const footer = read('src/components/Footer.astro');
  assert.match(footer, /<p>9 Swanage Road, London SW18 2DZ<\/p>\n\s*<p>VAT registration number: 519 1014 22<\/p>/);
  assert.match(footer, /href="https:\/\/wa\.me\/447824390336"[^>]*>WhatsApp: 07824 390336<\/a>/);
  const baseline = execFileSync('git', ['show', `${REQUEST_BASELINE}:src/components/Footer.astro`], { encoding: 'utf8' });
  assert.equal(footer.replace(/\n\s*<a href="https:\/\/wa\.me\/447824390336"[^>]*>WhatsApp: 07824 390336<\/a>/, ''), baseline);
  assert.match(read('src/components/ControlledLegalPage.astro'), /href="https:\/\/wa\.me\/447824390336">WhatsApp: 07824 390336<\/a>/);
});

test('dated Terms PDF exists at the fixed address and is a small PDF', () => {
  const pdf = fs.readFileSync('public/terms-2026-11.pdf');
  assert.equal(pdf.subarray(0, 5).toString('latin1'), '%PDF-');
  assert.ok(pdf.length > 20_000 && pdf.length < 500_000, `size ${pdf.length}`);
  const generator = read('scripts/build-terms-pdf.mjs');
  assert.match(generator, /src\/data\/phase8-legal\.json/);
  assert.match(generator, /writeFile\(output, pdf, \{ flag: 'wx' \}\)/);
  const defaultOverwrite = spawnSync(process.execPath, ['scripts/build-terms-pdf.mjs', 'public/terms-2026-11.pdf'], { encoding: 'utf8' });
  assert.equal(defaultOverwrite.status, 1);
  assert.match(defaultOverwrite.stderr, /Refusing to overwrite/);
});
