import { chromium, devices, expect } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const base = process.env.HQC_TEST_URL || 'http://127.0.0.1:4328';
if (!['localhost','127.0.0.1'].includes(new URL(base).hostname) && !new URL(base).hostname.endsWith('.pages.dev')) throw Error('Only no-send previews are allowed');
const out = process.env.HQC_TEST_OUTPUT || 'phase8/evidence/2026-10-13/audit';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({viewport:{width:1365,height:900}});
const mutations=[];
await context.route('**/*',async route=>{
 const req=route.request(), url=new URL(req.url());
 if(!['GET','HEAD'].includes(req.method())) { mutations.push({method:req.method(),url:url.origin+url.pathname}); return route.abort(); }
 if(/launch27|analytics.aspectstudio.net/.test(url.hostname)) return route.abort();
 return route.continue();
});
const page=await context.newPage();
const checks=[];
const record=async(id,name,fn)=>{await fn();checks.push({id,name,status:'pass'});console.log(`PASS ${id}: ${name}`);};
const fresh=async(path,consent=true)=>{
 await page.goto(base+path);await page.evaluate(()=>localStorage.clear());
 await page.clock.install();await page.reload();
 if(consent) await page.getByRole('button',{name:'Reject Non-Essential',exact:true}).click();
};
const trigger=async()=>{await page.evaluate(()=>{window.scrollTo(0,600);window.dispatchEvent(new Event('scroll'));});await page.clock.fastForward(13000);};
try {
 await record('F01-exclusions','No promotional markup on any excluded service, quote, contact or booking page',async()=>{
  for(const path of ['/request-a-quote/','/contact/','/book-essential-clean/','/commercial-cleaning-london/','/office-cleaning-london/','/end-of-tenancy-cleaning-london/','/move-in-cleaning-london/','/post-construction-cleaning-london/','/complex-property-cleaning-london/','/deep-cleaning-london/']) {
   await page.goto(base+path);await expect(page.locator('#hqc-essential-offer')).toHaveCount(0);await expect(page.locator('#conversion-prompt')).toHaveCount(0);
  }
 });
 // 6 Nov 2026 (W3): the idle/exit Essential Clean offer is removed everywhere. These checks
 // replace the former P01-P18 modal behaviour tests and assert that no modal can appear.
 await record('P02-removed','Formerly eligible pages carry no offer modal markup',async()=>{
  for(const path of ['/essential-clean-london/','/home-cleaning-london/']) {
   await fresh(path);await expect(page.locator('#hqc-essential-offer')).toHaveCount(0);await expect(page.locator('[data-hqc-offer-cta]')).toHaveCount(0);
  }
 });
 await record('P01-removed','No modal opens after engagement, delay or exit intent',async()=>{
  for(const path of ['/essential-clean-london/','/home-cleaning-london/']) {
   await fresh(path);await trigger();await page.mouse.move(600,300);await page.mouse.move(600,0);await page.clock.fastForward(60000);
   await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.locator('#hqc-essential-offer')).toHaveCount(0);
  }
 });
 await record('P07-removed','No offer appears before or after the cookie choice',async()=>{
  await fresh('/home-cleaning-london/',false);await trigger();await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.getByRole('button',{name:'Reject Non-Essential',exact:true}).click();await page.clock.fastForward(13000);await expect(page.locator('dialog[open]')).toHaveCount(0);
 });
 await record('P16','Browsing the formerly eligible pages sends no lead or provider request',async()=>{expect(mutations).toEqual([]);});
 await record('P13-removed','Mobile: no offer modal after scroll and delay; no horizontal overflow',async()=>{
  await context.close();
  const mobile=await browser.newContext(devices['iPhone 13']);
  await mobile.route(/launch27|analytics.aspectstudio.net/,route=>route.abort());
  const p=await mobile.newPage();await p.clock.install();await p.goto(base+'/essential-clean-london/');await p.getByRole('button',{name:'Reject Non-Essential',exact:true}).tap();await p.evaluate(()=>{window.scrollTo(0,600);window.dispatchEvent(new Event('scroll'));});await p.clock.fastForward(13000);
  await expect(p.locator('dialog[open]')).toHaveCount(0);await expect(p.locator('#hqc-essential-offer')).toHaveCount(0);
  expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await p.screenshot({path:out+'/mobile-no-offer.png'});await mobile.close();
 });
 const proof=await browser.newPage();await proof.route(/launch27|analytics.aspectstudio.net/,route=>route.abort());
 await record('F02-F04','Service and Terms distinguish request, collection and HQC confirmation',async()=>{
  await proof.goto(base+'/essential-clean-london/');await expect(proof.getByRole('heading',{name:'4. Submit your booking request'})).toBeVisible();await expect(proof.getByRole('heading',{name:'5. HQC reviews and confirms'})).toBeVisible();
  await proof.goto(base+'/terms-and-conditions/');await expect(proof.getByText('Providing booking or payment details, or creating an Automaid record, does not itself confirm the booking or mean that payment has been collected.',{exact:false})).toBeVisible();
 });
 await record('F05','CC01 service-specific deposits and legal links are explicit',async()=>{
  await expect(proof.getByText('does not automatically apply to Essential Clean',{exact:false})).toBeVisible();
  await proof.goto(base+'/book-essential-clean/');await expect(proof.getByText('Entering payment details does not itself collect payment or confirm a booking.',{exact:false})).toBeVisible();
  await expect(proof.getByRole('link',{name:'Privacy Policy',exact:true}).first()).toHaveAttribute('href','/privacy-policy/');
  await proof.screenshot({path:out+'/booking-wording.png',fullPage:true});
 });
 await record('contact-route','Only the approved assessment WhatsApp link; no landline WhatsApp link',async()=>{await proof.goto(base+'/contact/');await expect(proof.locator('a[href*="wa.me"]')).toHaveCount(1);await expect(proof.locator('a[href*="wa.me"]')).toHaveAttribute('href','https://wa.me/447824390336');await expect(proof.locator('a[href*="wa.me/442088703925"]')).toHaveCount(0);await expect(proof.locator('a[href^="tel:"]').first()).toBeVisible();});
 await proof.close();
} catch(e) {checks.push({status:'fail',error:String(e)});process.exitCode=1;console.error(e);}
finally {await browser.close();await writeFile(out+'/results.json',JSON.stringify({testedAt:new Date().toISOString(),base,checks,limits:['Provider calls blocked; no booking, payment, CRM or customer communications','P14 analytics covered separately by analytics suite; P15 provider Booking Request completion unverified; P17 field performance unverified','Mobile viewport and touch emulation are not physical device certification']},null,2));}
