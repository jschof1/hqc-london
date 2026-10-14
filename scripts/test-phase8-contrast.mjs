import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),axe=await readFile(require.resolve('axe-core/axe.min.js'),'utf8');
const base=process.env.HQC_TEST_URL||'http://127.0.0.1:4333';
const browser=await chromium.launch({channel:'chrome'});const results=[];
for(const path of ['/','/contact/','/feedback/','/essential-clean-london/']) {
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 await page.goto(base+path,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Reject Non-Essential',exact:true}).click();await page.addScriptTag({content:axe});
 for(const selector of ['.button-primary','.button-dark','a[class~="hover:text-copper-ink"]','footer a[href="/how-we-work/"]','.trust-rail-card-featured','.trust-rail-card:not(.trust-rail-card-featured)','#contact-form button[type="submit"]','#private-feedback-toggle']) {
  const locator=page.locator(selector).first();if(!await locator.count()||!await locator.isVisible())continue;
  await locator.scrollIntoViewIfNeeded();await page.waitForTimeout(1500);
  for(const state of ['hover','focus']) {
   if(state==='focus'&&!await locator.evaluate(e=>e.matches('a,button,input,select,textarea,[tabindex]')))continue;
   if(state==='hover')await locator.hover();else {await page.mouse.move(1270,1);await locator.focus();}
   await page.waitForTimeout(350);
   const result=await locator.evaluate(async e=>{
    const audit=await axe.run(e,{runOnly:{type:'rule',values:['color-contrast']}});
    const style=getComputedStyle(e);
    return {tag:e.tagName,text:e.textContent?.trim().slice(0,100),color:style.color,background:style.backgroundColor,outline:style.outline,shadow:style.boxShadow,violations:audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))};
   });
   results.push({path,selector,state,...result});console.log(path,state,selector,result.violations.length?'FAIL':'PASS');
  }
 }
 await context.close();
}
await browser.close();await writeFile(process.env.HQC_CONTRAST_OUTPUT||'/private/tmp/hqc-hover-focus-results.json',JSON.stringify({testedAt:new Date().toISOString(),base,results},null,2));
expect(results.filter(r=>r.violations.length)).toEqual([]);
