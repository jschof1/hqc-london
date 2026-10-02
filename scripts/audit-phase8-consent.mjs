import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
const out = process.env.HQC_AUDIT_OUTPUT || '/private/tmp/hqc-consent-audit';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
for (const [label, url] of [['staging-booking','https://phase8-2026-09-28-staging.hqc-london.pages.dev/book-essential-clean/'],['production-home','https://highqualityclean.co.uk/']]) {
 if(process.env.HQC_AUDIT_LABEL&&label!==process.env.HQC_AUDIT_LABEL)continue;
 for (const choice of (process.env.HQC_AUDIT_CHOICE?[process.env.HQC_AUDIT_CHOICE]:['reject','accept'])) {
  const context = await browser.newContext({ viewport: {width:1280,height:900} });
  const page = await context.newPage();
  let stage = 'before-choice';
  const requests = [], setCookies = [], errors = [];
  page.on('request', req => { const u = new URL(req.url()); if (/^https?:$/.test(u.protocol)) requests.push({stage,host:u.hostname,path:u.pathname,type:req.resourceType(),method:req.method()}); });
  page.on('response', async response => { try { for (const h of await response.headersArray()) if(h.name.toLowerCase()==='set-cookie') setCookies.push({stage,host:new URL(response.url()).hostname,name:h.value.split('=')[0]}); } catch {} });
  page.on('pageerror', e=>errors.push(e.message));
  const response = await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const snapshot = async () => ({cookies:(await context.cookies()).map(({name,domain,path,httpOnly,secure,sameSite,expires})=>({name,domain,path,httpOnly,secure,sameSite,expires})),frames:page.frames().map(f=>{try{const u=new URL(f.url());return u.origin+u.pathname;}catch{return f.url();}}),storageKeys:await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)}))});
  const before = await snapshot();
  stage = choice;
  await page.getByRole('button',{name:choice==='reject'?'Reject Non-Essential':'Accept All',exact:true}).click();
  await page.waitForTimeout(4000);
  const after = await snapshot();
  const preferences = await page.evaluate(()=>window.hqcCookiePreferences);
  results.push({label,url,choice,status:response.status(),preferences,before,after,requests:[...new Map(requests.map(x=>[JSON.stringify(x),x])).values()],setCookies,errors});
  await writeFile(`${out}/partial-results.json`,JSON.stringify(results,null,2));
  await context.close();
 }
}
await browser.close();
await writeFile(`${out}/results.json`,JSON.stringify({testedAt:new Date().toISOString(),note:'Fresh temporary Chrome contexts. No form input, booking submission or payment. Cookie values and URL query strings omitted. Observed services are technical destinations, not a legal processor determination. Preview first-party analytics intentionally disabled.',results},null,2));
console.log(JSON.stringify(results.map(r=>({label:r.label,choice:r.choice,status:r.status,beforeCookies:r.before.cookies.map(c=>c.domain+':'+c.name),afterCookies:r.after.cookies.map(c=>c.domain+':'+c.name),hosts:[...new Set(r.requests.map(q=>q.host))],errors:r.errors}))));
