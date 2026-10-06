import { build, transform } from 'esbuild';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const tmp = await mkdtemp(join(tmpdir(), 'hqc-analytics-'));
await build({entryPoints:['src/scripts/analytics-contract.js'],bundle:true,format:'esm',platform:'node',outfile:join(tmp,'contract.mjs')});
const contract = await import(pathToFileURL(join(tmp,'contract.mjs')));
const { canonicalSitemapPaths } = await import('./sitemap-routes.mjs');
for (const path of canonicalSitemapPaths) assert.equal(contract.safePath(path), path, `Missing analytics path: ${path}`);
const stage = `https://${contract.previewDomain}`;
const base = process.env.HQC_TEST_URL || 'http://127.0.0.1:4328';
assert(['localhost','127.0.0.1'].includes(new URL(base).hostname), 'This test proxies only a local no-send server.');
const poison = 'private-person@example.invalid';
const data = contract.payload('cta_clicked', { category:'phone', href:`tel:${poison}`, email:poison, destination:'/contact/', item:poison, reason:poison }, {hostname:contract.previewDomain,pathname:`/unknown/${poison}`}, `https://www.google.com/?q=${poison}`);
assert.equal(data.u, `${stage}/other/`);
assert.equal(data.r, 'https://www.google.com/');
assert(!JSON.stringify(data).includes(poison));
assert.equal(contract.dataset('other.hqc-london.pages.dev'),null);
assert.equal(contract.dataset('localhost'),null);
assert.equal(contract.payload('form_preview',{}, {hostname:'highqualityclean.co.uk',pathname:'/'}),null);
assert.equal(contract.payload('invented_event',{}, {hostname:contract.previewDomain,pathname:'/'}),null);
console.log('PASS payload allowlist, unknown path/referrer sanitization, event and hostname isolation');
const discountSource = await readFile('src/pages/discount.astro', 'utf8');
const discountHTML = discountSource.match(/<main[\s\S]*?<\/main>/)[0];
const discountJS = (await transform(discountSource.match(/<script>([\s\S]*?)<\/script>/)[1], {loader:'ts'})).code;
const adapterJS = (await build({entryPoints:['src/scripts/analytics.js'],bundle:true,write:false,format:'iife'})).outputFiles[0].text;
const results=[];
for (const engine of (process.env.HQC_TEST_ENGINES || 'chrome,firefox,webkit').split(',')) {
 const browser=await (engine==='firefox'?firefox:engine==='webkit'?webkit:chromium).launch(engine==='chrome'?{channel:'chrome'}:{});
 const context=await browser.newContext({viewport:{width:1280,height:850}});
 const events=[], errors=[];
 await context.route('**/*',async route=>{
  const req=route.request(), url=new URL(req.url());
  if(url.origin==='https://analytics.aspectstudio.net') {
   assert.equal(url.href,contract.endpoint);
   assert(!req.headers()['referer'], 'HTTP Referer must not leak the page query');
   const event=JSON.parse(req.postData());
   assert.equal(event.d,contract.previewDomain);
   assert(!JSON.stringify(event).includes(poison));
   assert(!/[?#]/.test(event.u));
   events.push(event);
   return route.fulfill({status:202,headers:{'Access-Control-Allow-Origin':'*'},body:''});
  }
  if(url.origin===stage) {
   const response=await route.fetch({url:base+url.pathname+url.search, maxRedirects:0, headers: { ...req.headers(), host: new URL(base).host, origin: new URL(base).origin }});
   if (url.pathname.startsWith('/api/') && response.status() !== 202) console.error('Local fixture API:', engine, url.pathname, response.status(), await response.text());
   const headers = {...response.headers()};
   if(headers.location?.startsWith(base)) headers.location = headers.location.replace(base,stage);
   return route.fulfill({response,headers});
  }
  return route.abort(); // Includes Launch27 and all other providers.
 });
 await context.addInitScript(() => {
  const original = window.fetch;
  window.fetch = (...args) => {
   if (String(args[0]).includes('analytics.aspectstudio.net')) {
    const body = JSON.parse(args[1].body);
    if(body.n === 'form_abandoned') sessionStorage.setItem('analytics-test-last-exit', JSON.stringify(body));
   }
   return original(...args);
  };
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const count=name=>events.filter(e=>e.n===name).length;
 const waitEvents=async()=>page.waitForTimeout(250);
 const check=async(name,fn)=>{await fn();results.push({engine,check:name});console.log(`PASS ${engine}: ${name}`);};
 try {
  await check('consent gates, initial property route, repeated consent deduplication',async()=>{
   await page.goto(stage+`/request-a-quote/?route=property&utm_source=${poison}`,{waitUntil:'networkidle'});
   assert.equal(events.length,0);
   await page.locator('#hqc-cookie-accept-all').click();await waitEvents();
   assert.equal(count('pageview'),1);
   await expect.poll(() => events.some(e=>e.n==='quote_route_selected'&&e.p.route==='property')).toBe(true);
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('hqc:cookie-preferences-updated')));await waitEvents();
   assert.equal(count('pageview'),1);
  });
  await check('validation groups, route abandonment and reopened route',async()=>{
   await page.locator('[name="name"]').focus();
   await page.locator('#quote-submit').click();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='form_validation'&&e.p.reason==='required')).toBe(true);
   await page.locator('[data-route="commercial"]').click();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='form_abandoned'&&e.p.route==='property'&&e.p.reason==='route_changed')).toBe(true);
   await page.locator('[data-route="property"]').click();
   await page.locator('[name="name"]').focus();await waitEvents();
   assert.equal(events.filter(e=>e.n==='form_started'&&e.p.route==='property').length,2);
  });
  await check('four quote routes keep customer values out of analytics',async()=>{
   for(const routeName of ['residential','property','commercial','complex']) {
    await page.locator(`[data-route="${routeName}"]`).click();
    await page.locator('[name="name"]').fill(poison);
    await page.locator('[name="email"]').fill(poison);
    await page.locator('[name="phone"]').fill('02000000000');
    await page.locator('[name="postcode"]').fill('SW18 2DZ');
    await page.locator('[name="service"]').selectOption({index:1});
    await page.locator('[name="details"]').fill(poison);
    for(const field of ['frequency','operating_hours','mobilisation_requirements']) {
     const el=page.locator(`[name="${field}"]`);
     if(await el.isEnabled()) { if(field==='frequency') await el.selectOption({index:1}); else await el.fill(poison); }
    }
    await page.locator('#quote-submit').click();
    await expect(page.locator('#form-message')).toBeVisible();await expect(page.locator('#form-message')).toContainText('was not sent');await waitEvents();
    await expect.poll(() => events.some(e=>e.n==='form_attempted'&&e.p.route===routeName)).toBe(true);
    await expect.poll(() => events.some(e=>e.n==='form_preview'&&e.p.route===routeName)).toBe(true);
   }
   assert.equal(count('form_receipt'),0);
   await expect.poll(() => events.some(e=>e.n==='quote_service_selected'&&e.p.service==='essential_clean')).toBe(true);
  });
  await check('malformed success and server validation are errors; explicit receipt only once',async()=>{
   for(const failure of [{status:200,body:'{}'},{status:422,body:'{"field":"name"}'}]) {
    await page.route('**/api/quote/',route=>route.fulfill({...failure,contentType:'application/json'}));
    await page.locator('#quote-submit').click();
    await expect(page.locator('#form-message')).toContainText('could not confirm receipt');await waitEvents();
    await page.unroute('**/api/quote/');
   }
   assert.equal(count('form_error'),2);assert.equal(count('form_receipt'),0);
   await expect.poll(() => events.some(e=>e.n==='form_error'&&e.p.reason==='server_validation')).toBe(true);
   await page.route('**/api/quote/',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"submission_id":"private-id-never-send"}'}));
   await page.locator('#quote-submit').click();await expect(page.locator('#form-message')).toContainText('received for HQC review');await waitEvents();
   assert.equal(count('form_receipt'),1);
   assert(!JSON.stringify(events).includes('private-id-never-send'));
   await page.unroute('**/api/quote/');
  });
  await check('contact and private feedback no-send stages',async()=>{
   await page.goto(stage+'/contact/',{waitUntil:'networkidle'});
   const form=page.locator('#contact-form');
   for(const name of ['name','email','phone','message']) { const el=form.locator(`[name="${name}"]`);if(await el.count()) await el.fill(name==='phone'?'02000000000':poison); }
   // Populate any mandatory subject choice without recording its text.
   for(const el of await form.locator('select[required]').all()) await el.selectOption({index:1});
   await form.locator('button[type="submit"]').click();await expect(page.locator('#contact-preview-status')).toBeVisible();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='form_preview'&&e.p.form==='contact')).toBe(true);
   await page.goto(stage+'/feedback/',{waitUntil:'networkidle'});
   await page.locator('#private-feedback-toggle').click();
   const feedback=page.locator('#feedback-form');
   for(const el of await feedback.locator('input:not([type="hidden"]),textarea').all()) {
    const type=await el.getAttribute('type'); if(type==='checkbox')continue;
    await el.fill(type==='tel'?'02000000000':poison);
   }
   await page.locator('#submit-feedback').click();await expect(page.locator('#feedback-status')).toContainText('Nothing was sent');await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='form_preview'&&e.p.form==='feedback')).toBe(true);
  });
  await check('discount redirects to offer; retained discount handler fixture separates previews',async()=>{
   // WebKit cannot fulfill an intercepted 301; check the real local redirect
   // over HTTP, then load its destination through the browser fixture.
   const redirect = await context.request.get(base+'/discount/?type=home', {maxRedirects:0});
   assert.equal(redirect.status(),301);
   assert.equal(new URL(redirect.headers().location,base).pathname,'/offer/');
   await page.goto(stage+'/offer/?type=home',{waitUntil:'networkidle'});
   // The legacy form is intentionally redirected. Test its retained handler in an isolated fixture, not by changing the site's redirects.
   await page.route(`${stage}/discount/**`, route=>route.fulfill({status:200,contentType:'text/html',body:`<style>.hidden{display:none}</style>${discountHTML}<script>window.hqcCookiePreferences={analytics:true}</script><script>${adapterJS}</script><script>${discountJS}</script>`}));
   await page.goto(stage+'/discount/?type=home',{waitUntil:'networkidle'});
   page.once('dialog',dialog=>dialog.accept());
   const form=page.locator('#discount-form');
   for(const name of ['name','email','phone','summary']) await form.locator(`[name="${name}"]`).fill(name==='phone'?'02000000000':poison);
   await form.locator('button[type="submit"]').click();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='form_preview'&&e.p.form==='discount'&&e.p.route==='residential')).toBe(true);
   await expect(page.locator('#success-content')).toBeHidden();
   await page.unroute(`${stage}/discount/**`);
  });
  await check('FAQ, scroll, page exit and consent withdrawal',async()=>{
   await page.goto(stage+'/cleaning-faqs/',{waitUntil:'networkidle'});
   const faq=page.locator('main details').first();await faq.locator('summary').click();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='faq_opened'&&e.p.item==='1')).toBe(true);
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='scroll_depth'&&e.p.depth==='90')).toBe(true);
   await page.goto(stage+'/request-a-quote/',{waitUntil:'networkidle'});
   await page.locator('[name="name"]').fill(poison);
   await page.goto(stage+'/contact/',{waitUntil:'networkidle'});await waitEvents();
   // Playwright's paused network route loses unload fetches. Assert the real
   // navigation's fetch invocation here; provider delivery is a separate live gate.
   const exit = JSON.parse(await page.evaluate(()=>sessionStorage.getItem('analytics-test-last-exit')));
   assert.equal(exit.n, 'form_abandoned');
   assert.equal(exit.p.reason, 'page_exit');
   assert.equal(exit.p.route, 'residential');
   assert.equal(exit.d, contract.previewDomain);
   assert(!JSON.stringify(exit).includes(poison));
   await page.locator('[data-open-cookie-preferences]').first().click();
   await page.locator('#hqc-cookie-dialog-reject').click();await waitEvents();const before=events.length;
   await page.locator('#contact-form [name="name"]').focus();
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('hqc:form-stage',{detail:{id:'contact-form',stage:'attempted'}})));await waitEvents();
   assert.equal(events.length,before);
  });
  await check('booking page and fallback do not claim a booking',async()=>{
   await page.goto(stage+'/book-essential-clean/',{waitUntil:'networkidle'});
   await page.locator('[data-open-cookie-preferences]').first().press('Enter');await expect(page.locator('#hqc-cookie-preferences')).toBeVisible();await page.locator('#hqc-cookie-dialog-accept').click();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='booking_page_viewed')).toBe(true);
   await page.locator('a[href*="launch27.com"]').click();await waitEvents();
   await expect.poll(() => events.some(e=>e.n==='booking_fallback_clicked')).toBe(true);
   assert(!events.some(e=>/booking.*(confirmed|completed)/.test(e.n)));
  });
  assert.deepEqual(errors,[]);
 } finally {await context.close();await browser.close();}
}
await writeFile(join(tmp,'results.json'),JSON.stringify(results,null,2));
console.log(`PASS ${results.length} browser checks; evidence ${tmp}/results.json`);
