import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const base = process.env.HQC_TEST_URL || 'http://127.0.0.1:4330';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
for (const path of ['/', '/request-a-quote/', '/essential-clean-london/']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 100000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.lab = { lcpMs: 0, cls: 0 };
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.lab.lcpMs = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.lab.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  results.push({ path, ...await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return { ...window.lab, domContentLoadedMs: nav.domContentLoadedEventEnd, loadMs: nav.loadEventEnd, resources: performance.getEntriesByType('resource').sort((a,b)=>b.transferSize-a.transferSize).slice(0,5).map(r=>({url:r.name,bytes:r.transferSize,duration:r.duration})) };
  }) });
  await context.close();
}
await browser.close();
const report = { testedAt: new Date().toISOString(), base, environment: 'Single-run local lab: Chrome 390x844 mobile, 4x CPU, 150ms latency, 1.6Mbps download; not field Core Web Vitals or Lighthouse.', results };
await writeFile(process.env.HQC_PERF_OUTPUT || '/private/tmp/hqc-mobile-performance-after.json', JSON.stringify(report,null,2));
console.log(JSON.stringify(results));
