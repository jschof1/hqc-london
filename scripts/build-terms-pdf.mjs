#!/usr/bin/env node
// Render the Terms in src/data/phase8-legal.json to a dated, fixed-address PDF.
// Usage: node scripts/build-terms-pdf.mjs <output path>
//   e.g. node scripts/build-terms-pdf.mjs public/terms-2026-12.pdf
// Requires Node 20+ (the pinned Playwright version does not support older Node).
// Each published version (public/terms-YYYY-MM.pdf) is a fixed copy that booking confirmations link to,
// so an existing output file is never overwritten: the PDF is rendered to memory first and written with
// an exclusive create. A new Terms edition must use a new dated filename.
// The HTML Terms page is not touched; this reads the same data and prints it with Playwright's Chromium.
// Browser: Playwright's expected Chromium when installed; otherwise TERMS_PDF_CHROMIUM (an executable path)
// or, failing that, the newest chromium_headless_shell already in the Playwright cache
// (PLAYWRIGHT_BROWSERS_PATH or ~/Library/Caches/ms-playwright), so no browser download is needed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length !== 1 || args[0].startsWith('--')) {
  console.error('Usage: node scripts/build-terms-pdf.mjs <output path>');
  process.exit(2);
}
const output = resolve(process.cwd(), args[0]);
const refuse = () => {
  console.error(`Refusing to overwrite ${output}: published Terms PDFs are fixed copies. Use a new dated filename.`);
  process.exit(1);
};
if (existsSync(output)) refuse();
const terms = JSON.parse(readFileSync(resolve(root, 'src/data/phase8-legal.json'), 'utf8')).terms;

const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const updated = terms[0]?.text ?? '';
if (!/^Last updated: \d{1,2} [A-Z][a-z]+ \d{4}$/.test(updated)) throw new Error(`Terms must start with a dated "Last updated" line, found: ${updated}`);

const block = (b) => {
  switch (b.kind) {
    case 'h2': return `<h2>${esc(b.text)}</h2>`;
    case 'h3': return `<h3>${esc(b.text)}</h3>`;
    case 'ul': return `<ul>${b.items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
    case 'callout': return `<div class="callout">${(b.lines ?? [b.text]).map((line) => `<p>${esc(line)}</p>`).join('')}</div>`;
    case 'table': return `<table><thead><tr>${b.rows[0].map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${b.rows.slice(1).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    default:
      if (b.text === 'Link: Privacy Policy') return '<p>Privacy Policy: https://highqualityclean.co.uk/privacy-policy/</p>';
      return `<p>${esc(b.text)}</p>`;
  }
};

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>High Quality Clean Ltd - Terms and Conditions of Service</title>
<style>
  @page { size: A4; margin: 18mm 18mm 20mm; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 10pt; line-height: 1.45; color: #111; }
  header { border-bottom: 1.5pt solid #111; padding-bottom: 8pt; margin-bottom: 12pt; }
  .kicker { font-family: Helvetica, Arial, sans-serif; font-size: 8.5pt; letter-spacing: .08em; text-transform: uppercase; margin: 0; }
  h1 { font-size: 20pt; margin: 4pt 0 6pt; }
  .meta { font-family: Helvetica, Arial, sans-serif; font-size: 9pt; margin: 0; }
  h2 { font-size: 12.5pt; margin: 14pt 0 4pt; break-after: avoid; }
  h3 { font-size: 10.5pt; margin: 9pt 0 3pt; break-after: avoid; }
  p { margin: 0 0 5pt; }
  ul { margin: 0 0 6pt 16pt; padding: 0; }
  li { margin-bottom: 2pt; }
  table { width: 100%; border-collapse: collapse; margin: 4pt 0 8pt; font-family: Helvetica, Arial, sans-serif; font-size: 8.5pt; }
  th, td { border: .6pt solid #777; padding: 3pt 4pt; text-align: left; vertical-align: top; }
  th { background: #eee; }
  tr { break-inside: avoid; }
  .callout { border: .8pt solid #777; padding: 6pt 8pt; margin: 4pt 0 8pt; }
  .callout p:last-child { margin-bottom: 0; }
</style></head><body>
<header>
  <p class="kicker">High Quality Clean Ltd</p>
  <h1>Terms and Conditions of Service</h1>
  <p class="meta">${esc(updated)}</p>
</header>
${terms.slice(1).map(block).join('\n')}
</body></html>`;

// Use Playwright's expected browser when installed; otherwise reuse the newest Chromium
// headless shell already in the local cache rather than downloading another one.
function cachedHeadlessShell() {
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), 'Library/Caches/ms-playwright');
  if (!existsSync(cache)) return undefined;
  const builds = readdirSync(cache).filter((name) => /^chromium_headless_shell-\d+$/.test(name))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const build of builds) {
    for (const executable of ['chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-headless-shell-mac-x64/chrome-headless-shell', 'chrome-headless-shell-linux64/chrome-headless-shell']) {
      const candidate = join(cache, build, executable);
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}
const executablePath = existsSync(chromium.executablePath()) ? undefined : process.env.TERMS_PDF_CHROMIUM || cachedHeadlessShell();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
let pdf;
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  pdf = await page.pdf({
    format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7pt;color:#555;padding:0 18mm;display:flex;justify-content:space-between"><span>High Quality Clean Ltd - Terms and Conditions of Service - ${esc(updated)}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
    margin: { top: '18mm', bottom: '20mm', left: '18mm', right: '18mm' },
  });
} finally {
  await browser.close();
}
try {
  await writeFile(output, pdf, { flag: 'wx' });
} catch (error) {
  if (error?.code === 'EEXIST') refuse();
  throw error;
}
console.log(`Wrote ${output} (${pdf.length} bytes)`);
