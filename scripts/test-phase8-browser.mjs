import { chromium, firefox, webkit, devices, expect } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axe = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.HQC_TEST_URL || 'http://127.0.0.1:4328';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname) && !new URL(base).hostname.endsWith('.pages.dev')) throw new Error('Browser tests may only run against no-send previews');
const out = process.env.HQC_TEST_OUTPUT || '/private/tmp/hqc-browser-qa';
await mkdir(out, { recursive: true });
const results = [];
const engines = process.env.HQC_TEST_ENGINES?.split(',') || ['chrome', 'firefox', 'webkit', 'iphone', 'android'];
for (const engine of engines) {
  const browser = await (engine === 'firefox' ? firefox : ['webkit', 'iphone'].includes(engine) ? webkit : chromium).launch(engine === 'chrome' || engine === 'android' ? { channel: 'chrome' } : {});
  const context = await browser.newContext(engine === 'iphone' ? devices['iPhone 13'] : engine === 'android' ? devices['Pixel 7'] : { viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const analyticsRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', response => {
    if (response.status() >= 400 && ['stylesheet', 'script', 'image'].includes(response.request().resourceType())) errors.push(`Asset HTTP ${response.status()}: ${response.url()}`);
  });
  page.on('request', req => { if (/umami|google-analytics|googletagmanager/.test(req.url())) analyticsRequests.push(req.url()); });
  const record = { engine, version: browser.version(), tests: [], accessibility: [], errors };
  const check = async (name, fn) => { await fn(); record.tests.push(name); console.log(`PASS ${engine}: ${name}`); };
  const fillQuote = async () => {
    for (const [field, value] of Object.entries({ name: 'Local QA only', email: 'qa@example.invalid', phone: '02000000000', postcode: 'SW18 2DZ', details: 'Automated no-send test' })) await page.locator(`[name="${field}"]`).fill(value);
  };
  try {
    await check('keyboard route switching and property deadlines', async () => {
      await page.goto(base + '/request-a-quote/?route=property&utm_source=qa', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Reject Non-Essential', exact: true }).click();
      await expect(page.locator('[name="operating_hours"]')).toBeDisabled();
      await expect(page.locator('[name="checkout_date"]')).toBeEnabled();
      await page.locator('[name="checkout_date"]').fill('2026-10-31');
      await page.getByRole('tab', { name: /Property or portfolio/ }).press('ArrowRight');
      await expect(page.getByRole('tab', { name: /Workplace or commercial site/ })).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('[name="operating_hours"]')).toBeEnabled();
      await expect(page.locator('[name="checkout_date"]')).toHaveValue('');
      await page.getByRole('tab', { name: /Workplace or commercial site/ }).press('Home');
      await page.locator('[name="service"]').selectOption('End of Tenancy™');
      await fillQuote();
      await page.locator('[name="desired_date"]').fill('2026-10-30');
      await expect(page.locator('[name="email_marketing_consent"]')).not.toBeChecked();
    });
    await check('native endpoint validates then reports no-send preview', async () => {
      await page.getByRole('button', { name: 'Submit Your Requirement' }).click();
      await expect(page.locator('#form-message')).toContainText('was not sent');
      await expect(page.locator('[name="name"]')).toHaveValue('Local QA only');
    });
    await check('failed submission and malformed success preserve data with no success claim', async () => {
      for (const failure of [{ status: 502, body: '{"error":"upstream unavailable"}' }, { status: 200, body: '{}' }]) {
        await page.route('**/api/quote/', route => route.fulfill({ ...failure, contentType: 'application/json' }));
        await page.getByRole('button', { name: 'Submit Your Requirement' }).click();
        await expect(page.locator('#form-message')).toContainText('could not confirm receipt');
        await expect(page.locator('[name="name"]')).toHaveValue('Local QA only');
        await page.unroute('**/api/quote/');
      }
    });
    await check('mocked receipt resets dates/consent for a separate new enquiry', async () => {
      await page.locator('[name="email_marketing_consent"]').check();
      await page.route('**/api/quote/', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"submission_id":"local-mock-only"}' }));
      await page.getByRole('button', { name: 'Submit Your Requirement' }).click();
      await expect(page.locator('#form-message')).toContainText('not a quotation');
      await expect(page.locator('[name="desired_date"]')).toHaveValue('');
      await expect(page.locator('[name="email_marketing_consent"]')).not.toBeChecked();
      await page.unroute('**/api/quote/');
    });
    await check('quote reflow and automated accessibility', async () => {
      await page.getByRole('tab', { name: /Property or portfolio/ }).click();
      await page.addScriptTag({ content: axe });
      const audit = await page.evaluate(async () => (await axe.run(document.querySelector('main'), { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
      record.accessibility.push({ page: 'quote', violations: audit });
      expect(audit.filter(v => ['critical', 'serious'].includes(v.impact))).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${out}/${engine}-quote.png`, fullPage: true });
      if (!['iphone','android'].includes(engine)) await page.setViewportSize({ width: 320, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (!['iphone','android'].includes(engine)) await page.setViewportSize({ width: 1440, height: 900 });
    });
    await check('contact failure is accessible and never a lead confirmation', async () => {
      await page.goto(base + '/contact/');
      for (const [field, value] of Object.entries({ name: 'Local QA only', email: 'qa@example.invalid', message: 'No-send QA message' })) await page.locator(`#contact-form [name="${field}"]`).fill(value);
      await page.locator('#contact-form [name="service"]').selectOption('general-inquiry');
      await page.locator('#contact-form button[type=submit]').click();
      await expect(page.locator('#contact-preview-status')).toBeVisible();
      await page.route('**/api/contact/', route => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"failed"}' }));
      await page.locator('#contact-form button[type=submit]').click();
      await expect(page.locator('#contact-error')).toBeFocused();
      await expect(page.locator('#contact-success')).not.toBeVisible();
      await expect(page.locator('#contact-form [name="message"]')).toHaveValue('No-send QA message');
      await page.unroute('**/api/contact/');
    });
    await check('optional tracking stays off after rejection; preferences remain usable', async () => {
      expect(analyticsRequests).toEqual([]);
      expect(await page.evaluate(() => sessionStorage.getItem('hqc:attribution'))).toBeNull();
      await page.locator('[data-open-cookie-preferences]').click();
      await expect(page.locator('#hqc-cookie-preferences')).toBeVisible();
      await page.locator('#hqc-cookie-analytics').check();
      await page.getByRole('button', { name: 'Save Preferences', exact: true }).click();
      await expect(page.locator('#hqc-cookie-preferences')).not.toBeVisible();
      expect(analyticsRequests).toEqual([]); // Even accepted optional tracking stays disabled on previews.
    });
    await check('booking provider failure leaves a usable fallback and no confirmation', async () => {
      await page.route('https://highqualitycleanlimited.launch27.com/**', route => route.abort());
      await page.goto(base + '/book-essential-clean/');
      await expect(page.getByRole('link', { name: 'open the booking request in a new tab' })).toHaveAttribute('href', 'https://highqualitycleanlimited.launch27.com/?w_cleaning');
      await expect(page.getByText('Your submission is a booking request.', { exact: false })).toBeVisible();
      await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${out}/${engine}-booking-failure.png`, fullPage: true });
      await page.unroute('https://highqualitycleanlimited.launch27.com/**');
    });
    await check('offer delay, cookie precedence, keyboard dismissal and suppression', async () => {
      await context.clearCookies();
      await page.goto(base + '/essential-clean-london/');
      await page.evaluate(() => { localStorage.clear(); });
      await page.clock.install();
      await page.reload();
      await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.clock.fastForward(13000);
      await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
      await page.getByRole('button', { name: 'Reject Non-Essential', exact: true }).click();
      await page.clock.fastForward(1);
      await expect(page.locator('#hqc-essential-offer')).toBeVisible();
      await expect(page.locator('[data-hqc-offer-cta=book]')).toHaveAttribute('href', '/book-essential-clean/');
      await page.getByRole('button', { name: 'Close offer' }).press('Escape');
      await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
      expect(await page.evaluate(() => Number(localStorage.getItem('hqc:essential-offer-dismissed-until:v1')) > Date.now())).toBe(true);
      await page.reload();
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.clock.fastForward(13000);
      await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
      await page.clock.resume();
    });
    await check('all ratings retain the same Google review route and optional private feedback', async () => {
      await page.goto(base + '/feedback/');
      await expect(page.locator('#google-review-link')).toBeVisible();
      await expect(page.locator('#google-review-link')).toHaveAttribute('href', 'https://g.page/r/CUGl_VXye-StEBM/review');
      for (const rating of [1,2,3,4,5]) {
        await page.getByRole('button', { name: `Rate ${rating} star${rating > 1 ? 's' : ''}`, exact: true }).click();
        await expect(page.locator('#google-review-link')).toBeVisible();
        await expect(page.locator('#feedback-step')).not.toBeVisible();
        await expect(page.locator('#success-step')).not.toBeVisible();
      }
      await page.getByRole('button', { name: 'Send private feedback instead', exact: true }).click();
      await page.locator('#feedback-form [name=name]').fill('Local QA only');
      await page.locator('#feedback-form [name=email]').fill('qa@example.invalid');
      await page.locator('#feedback-form [name=feedback]').fill('No-send private feedback test');
      await page.locator('#submit-feedback').click();
      await expect(page.locator('#feedback-status')).toContainText('Nothing was sent or published on Google');
      await expect(page.locator('#success-step')).not.toBeVisible();
      await page.route('**/api/feedback/', route => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"failed"}' }));
      await page.locator('#submit-feedback').click();
      await expect(page.locator('#feedback-status')).toContainText('could not confirm receipt');
      await expect(page.locator('#google-review-link')).toBeVisible();
      await page.unroute('**/api/feedback/');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${out}/${engine}-feedback.png`, fullPage: true });
    });
    await check('preview noindex and genuine missing-page status', async () => {
      const response = await page.goto(base + '/phase8-intentional-missing-page/');
      expect(response.status()).toBe(404);
      await page.goto(base + '/request-a-quote/');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://highqualityclean.co.uk/request-a-quote/');
    });
    expect(errors).toEqual([]);
  } catch (error) { record.failure = String(error); process.exitCode = 1; console.error(engine, error); }
  finally { results.push(record); await browser.close(); }
}
await writeFile(`${out}/results.json`, JSON.stringify({ base, testedAt: new Date().toISOString(), note: 'Browser-engine and viewport tests; not physical iOS/Android, Safari or Edge certification. Delivery success paths are mocked, preview posts do not send.', results }, null, 2));
