import {chromium,expect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), axe=await readFile(require.resolve('axe-core/axe.min.js'),'utf8');
const base=process.env.HQC_TEST_URL||'https://phase8-2026-09-28-staging.hqc-london.pages.dev';
const out=process.env.HQC_AUDIT_OUTPUT||'/private/tmp/hqc-fullpage-qa'; await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}), results=[];
for (const path of (process.env.HQC_AUDIT_PATHS?.split(',') || ['/','/request-a-quote/','/contact/','/essential-clean-london/','/book-essential-clean/','/feedback/','/privacy-policy/','/terms-and-conditions/'])) {
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 const r={path,keyboard:[],reflow:[],violations:[],incomplete:[],tests:[],errors:[]};
 page.on('pageerror',e=>r.errors.push(e.message));
 try {
  await page.goto(base+path,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Reject Non-Essential',exact:true}).click();
  // Genuine keyboard traversal: no controls that could submit a form are activated.
  await page.locator('body').click({position:{x:1,y:1}});
  let firstKey;
  for(let i=0;i<110;i++) {
   await page.keyboard.press('Tab');
   await page.waitForFunction(()=>{const e=document.activeElement;if(!e||e===document.body)return true;const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;},null,{timeout:1500}).catch(()=>{});
   const focus=await page.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return {tag:'BODY'};const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {index:[...document.querySelectorAll('*')].indexOf(e),tag:e.tagName,id:e.id,name:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('name')||'').trim().slice(0,90),href:e.getAttribute('href'),rect:{x:r.x,y:r.y,w:r.width,h:r.height},visible:s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0,inViewport:r.bottom>0&&r.top<innerHeight,outline:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow};});
   const key=JSON.stringify([focus.index,focus.tag,focus.id,focus.name,focus.href]);
   if(firstKey===key){r.keyboardCycleAt=i;break;} firstKey ??= key; r.keyboard.push(focus);
   if(focus.tag==='IFRAME'){r.iframeTraversal='Parent focus enters cross-origin provider; inner controls require separate provider keyboard review';await page.keyboard.press('Shift+Tab');break;}
  }
  r.tests.push('Tab navigation recorded without submission');
  await page.keyboard.press('Escape');
  // Playwright locator focus plus native keyboard verifies dropdown entry/exit.
  await page.locator('#property-menu-toggle').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#property-menu-toggle')).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');await expect(page.locator('#property-menu-toggle')).toBeFocused();r.tests.push('Desktop dropdown keyboard entry and Escape focus return');
  await page.setViewportSize({width:320,height:900});
  await page.locator('#mobile-menu-toggle').focus();await page.keyboard.press('Enter');await expect(page.locator('#mobile-menu-toggle')).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');await expect(page.locator('#mobile-menu-toggle')).toHaveAttribute('aria-expanded','false');r.tests.push('Mobile menu keyboard open and Escape close');
  for(const width of [320,640]) {
   await page.setViewportSize({width,height:900});
   r.reflow.push(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,wideElements:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&getComputedStyle(e).position!=='absolute';}).slice(0,10).map(e=>({tag:e.tagName,id:e.id,className:e.className}))})));
  }
  await page.setViewportSize({width:1280,height:900});
  await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  r.zoom200=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,bodyWidth:document.body.getBoundingClientRect().width}));
  await page.screenshot({path:`${out}/${path.split('/').filter(Boolean).join('-')||'home'}-200pct.png`,fullPage:false});
  await page.evaluate(()=>{document.documentElement.style.zoom='';window.scrollTo({top:0,behavior:'instant'});});
  await page.waitForTimeout(1500); // Let scroll-triggered fades finish before measuring final contrast.
  await page.addScriptTag({content:axe});
  const audit=await page.evaluate(async()=>{const x=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:x.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:x.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))};});
  r.violations=audit.violations;r.incomplete=audit.incomplete;
 }catch(e){r.failure=String(e);}
 results.push(r); await writeFile(`${out}/partial-results.json`,JSON.stringify(results,null,2)); console.log(JSON.stringify({path,tests:r.tests,focusCount:r.keyboard.length,reflow:r.reflow.map(x=>({width:x.width,overflow:x.overflow})),violations:r.violations.map(v=>({id:v.id,count:v.nodes.length,impact:v.impact})),failure:r.failure}));await context.close();
}
await browser.close();await writeFile(`${out}/results.json`,JSON.stringify({testedAt:new Date().toISOString(),note:'Chrome keyboard and whole-document axe checks. 320/640px reflow and 200% CSS magnification simulate layout stress; actual browser UI zoom, screen reader and physical-device acceptance remain separate. Cross-origin iframe audit limitations are recorded. No submissions.',results},null,2));
