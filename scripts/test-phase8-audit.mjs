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
 await record('P02','Offer never opens immediately or from time alone',async()=>{
  await fresh('/essential-clean-london/');await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();await page.clock.fastForward(13000);await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
 });
 await record('P01','Essential offer requires engagement and delay',async()=>{
  await trigger();await expect(page.locator('#hqc-essential-offer')).toBeVisible();await expect(page.getByRole('button',{name:'Close offer'})).toBeFocused();
 });
 await record('P11-P12','Both CTAs use the controlled routes without a mini form',async()=>{
  await expect(page.locator('[data-hqc-offer-cta=book]')).toHaveAttribute('href','/book-essential-clean/');
  await expect(page.locator('[data-hqc-offer-cta=suitability]')).toHaveAttribute('href','/request-a-quote/?route=residential&service=essential-clean&buyer=home');
  await expect(page.locator('#hqc-essential-offer form')).toHaveCount(0);
 });
 await record('P08-P10','Click dismissal and seven-day suppression survive reload',async()=>{
  await page.getByRole('button',{name:'Close offer'}).click();
  const remaining=await page.evaluate(()=>Number(localStorage.getItem('hqc:essential-offer-dismissed-until:v1'))-Date.now());expect(remaining).toBeGreaterThan(6.99*86400000);expect(remaining).toBeLessThanOrEqual(7*86400000);
  await page.reload();await trigger();await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();
 });
 await record('P10-expiry','Offer can reappear after suppression expires',async()=>{
  await page.evaluate(()=>localStorage.setItem('hqc:essential-offer-dismissed-until:v1',String(Date.now()-1)));await page.reload();await trigger();await expect(page.locator('#hqc-essential-offer')).toBeVisible();
 });
 await record('P09','Escape dismisses the modal',async()=>{await page.getByRole('button',{name:'Close offer'}).press('Escape');await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();});
 await record('P07','Cookie banner defers the offer until a choice is made',async()=>{
  await fresh('/home-cleaning-london/',false);await trigger();await expect(page.locator('#hqc-essential-offer')).not.toBeVisible();await page.getByRole('button',{name:'Reject Non-Essential',exact:true}).click();await page.clock.fastForward(1);await expect(page.locator('#hqc-essential-offer')).toBeVisible();
 });
 await record('P18','Accurate recurring offer without artificial scarcity',async()=>{
  const text=await page.locator('#hqc-essential-offer').innerText();expect(text).toContain('30%');expect(text).toContain('three-month');expect(text).toContain('One-off cleaning does not qualify');expect(text).not.toMatch(/countdown|only \d+ left|viewing now|ends in/i);
 });
 await record('P16','Opening and dismissing the offer sends no lead or provider request',async()=>{expect(mutations).toEqual([]);});
 await record('P13','Mobile modal fits viewport and touch dismissal works',async()=>{
  await context.close();
  const mobile=await browser.newContext(devices['iPhone 13']);
  await mobile.route(/launch27|analytics.aspectstudio.net/,route=>route.abort());
  const p=await mobile.newPage();await p.clock.install();await p.goto(base+'/essential-clean-london/');await p.getByRole('button',{name:'Reject Non-Essential',exact:true}).tap();await p.evaluate(()=>{window.scrollTo(0,600);window.dispatchEvent(new Event('scroll'));});await p.clock.fastForward(13000);await expect(p.locator('#hqc-essential-offer')).toBeVisible();
  expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const box=await p.locator('#hqc-essential-offer').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.width).toBeLessThanOrEqual(390);
  await p.screenshot({path:out+'/mobile-offer.png'});await p.getByRole('button',{name:'Close offer'}).tap();await expect(p.locator('#hqc-essential-offer')).not.toBeVisible();await mobile.close();
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
 await record('contact-route','Unverified landline WhatsApp link is removed',async()=>{await proof.goto(base+'/contact/');await expect(proof.locator('a[href*="wa.me"]')).toHaveCount(0);await expect(proof.locator('a[href^="tel:"]').first()).toBeVisible();});
 await proof.close();
} catch(e) {checks.push({status:'fail',error:String(e)});process.exitCode=1;console.error(e);}
finally {await browser.close();await writeFile(out+'/results.json',JSON.stringify({testedAt:new Date().toISOString(),base,checks,limits:['Provider calls blocked; no booking, payment, CRM or customer communications','P14 analytics covered separately by analytics suite; P15 provider Booking Request completion unverified; P17 field performance unverified','Mobile viewport and touch emulation are not physical device certification']},null,2));}
