import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const production = 'https://highqualityclean.co.uk';
const preview = process.env.HQC_CRAWL_PREVIEW || 'https://phase8-2026-09-28-staging.hqc-london.pages.dev';
const sitemap = await (await fetch(`${production}/sitemap-0.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x => x[1]);
const paths = [...new Set(urls.map(x => new URL(x).pathname))];
const report = { capturedAt: new Date().toISOString(), production, preview, sitemapCount: urls.length, uniqueCount: paths.length, pages: [], redirects: [], links: [] };
async function inspect(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'manual' });
  const html = await response.text();
  return { status: response.status, location: response.headers.get('location'), robotsHeader: response.headers.get('x-robots-tag'), canonical: html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1], robots: html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1], hash: createHash('sha256').update(html).digest('hex'), html };
}
const links = new Set();
for (let i = 0; i < paths.length; i += 5) {
  report.pages.push(...await Promise.all(paths.slice(i, i + 5).map(async path => {
    const [live, staged] = await Promise.all([inspect(production + path), inspect(preview + path)]);
    for (const match of staged.html.matchAll(/href="(\/[^"#]*)"/g)) {
      const u = new URL(match[1].replaceAll('&amp;', '&'), preview);
      if (!/\.[a-z0-9]+$/i.test(u.pathname) && !u.pathname.startsWith('/api/')) links.add(u.pathname);
    }
    delete live.html; delete staged.html; return { path, live, staged };
  })));
}
const redirects = [...(await readFile('src/middleware.ts','utf8')).matchAll(/\['([^']+)', '([^']+)'\]/g)].map(x => ({ source:x[1], target:x[2] })).filter(x=>x.source.startsWith('/'));
for (let i = 0; i < redirects.length; i += 5) {
  report.redirects.push(...await Promise.all(redirects.slice(i,i+5).map(async row => { const r=await inspect(preview+row.source);delete r.html;return {...row,...r}; })));
}
for (let i=0, list=[...links]; i<list.length;i+=5) report.links.push(...await Promise.all(list.slice(i,i+5).map(async path=>{const r=await inspect(preview+path);return {path,status:r.status,location:r.location};})));
const missing = await inspect(preview + '/phase8-intentional-missing-page/'); delete missing.html; report.missing = missing;
const filename = process.env.HQC_CRAWL_OUTPUT || '/private/tmp/hqc-seo-crawl.json';
await writeFile(filename,JSON.stringify(report,null,2));
console.log(JSON.stringify({filename, pages:report.pages.length, liveErrors:report.pages.filter(x=>x.live.status!==200),previewErrors:report.pages.filter(x=>x.staged.status!==200),missingNoindex:report.pages.filter(x=>!`${x.staged.robots} ${x.staged.robotsHeader}`.includes('noindex')).map(x=>x.path),redirectErrors:report.redirects.filter(x=>x.status!==301 || !x.location?.endsWith(x.target)),linkErrors:report.links.filter(x=>x.status>=400),missingStatus:missing.status},null,2));
