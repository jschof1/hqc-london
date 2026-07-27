#!/usr/bin/env node
/**
 * Builds docs/WEBSITE_CONTENT_AND_STRUCTURE.md with full data exports
 * embedded for a single-repo content reference. Run from repo root:
 *   node scripts/generate-website-content-doc.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const docsDir = path.join(root, 'docs');
const outPath = path.join(docsDir, 'WEBSITE_CONTENT_AND_STRUCTURE.md');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function walkAstros(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walkAstros(p, acc);
    else if (name.name.endsWith('.astro')) acc.push(p);
  }
  return acc;
}

const ROUTE_NOTES = {
  'src/pages/404.astro':
    '(Astro `404.astro`; matches unknown URLs — visitors do not browse to `/404/` intentionally.)',
  'src/pages/areas/areas.astro': '`Astro.redirect` to `/areas/` — avoid duplicate directory URL.',
};

function astroUrl(absFile) {
  const relPg = path.relative(path.join(root, 'src/pages'), absFile).replace(/\\/g, '/');
  if (relPg.endsWith('.ts')) {
    const segs = relPg.replace(/\.ts$/i, '').split('/').filter(Boolean);
    return '`POST /' + segs.join('/') + '/`';
  }
  let s = relPg.replace(/\.astro$/i, '');
  const segs = s.split('/').filter(Boolean);
  const last = segs.length ? segs[segs.length - 1] : '';
  if (last === '[area]') {
    const region = segs.length > 1 ? segs[segs.length - 2] : '';
    return '`{dynamic}` `/locations/' + region + '/{slug}/` (slug from §4.3)';
  }
  if (segs.length === 1 && segs[0] === '404')
    return '`{404}` Astro serves for non-matching URLs (not a normal content path)';
  if (!segs.length || (segs.length === 1 && segs[0] === 'index')) return '`/`';
  if (segs[segs.length - 1] === 'index') segs.pop();
  const pathPart = segs.join('/');
  return '`/' + pathPart + '/`';
}

function discoverApiRoutes() {
  const apidir = path.join(root, 'src/pages/api');
  if (!fs.existsSync(apidir)) return [];
  return fs.readdirSync(apidir).filter((n) => n.endsWith('.ts')).map((n) => path.join(apidir, n));
}

function fenced(lang, body) {
  const fence = '`' + '`' + '`';
  return fence + lang + '\n' + body + '\n' + fence + '\n\n';
}

const pagesDir = path.join(root, 'src/pages');
const astros = walkAstros(pagesDir).sort();
const apiRoutes = discoverApiRoutes().sort();

const mergedPageTree = [...astros, ...apiRoutes]
  .map((abs) => path.relative(root, abs).replace(/\\/g, '/'))
  .sort();

let md = `# High Quality Clean — Website Content & Structure

Single reference document combining **information architecture**, **routes**, **where copy lives**, and **verbatim data/config content** extracted from \`src/\`.

- **Canonical site:** \`https://highqualityclean.co.uk/\` (non-www HTTPS, trailing slash).
- Regenerate after content changes:
  \`\`\`
  node scripts/generate-website-content-doc.mjs
  \`\`\`
- Large inline payloads: complete \`src/data/area-data.json\`, \`site-settings.json\`, and \`faq.js\` are appended below verbatim.

---

## 1 Source tree (\`src\`)

\`\`\`text
`;
for (const f of mergedPageTree) {
  md += f + '\n';
}
[
  'src/layouts/Layout.astro',
  'src/middleware.ts',
  'src/lib/googleReviews.ts',
  'src/data/area-data.json',
  'src/data/faq.js',
  'src/data/site-settings.json',
  'src/styles/global.css',
  'src/scripts/main.js',
  'src/scripts/gallery.js'
].sort().forEach((p) => (md += p + '\n'));

const comps = [];
walkAstros(path.join(root, 'src/components'), comps);
for (const c of comps.sort().map((abs) => path.relative(root, abs))) {
  md += c + '\n';
}

md += `\`\`\`

---

## 2 Route map (\`src/pages/\` → URLs)

Trailing slash enforced by Astro (\`trailingSlash: 'always'\` in root \`astro.config.mjs\`).

Dynamic location routes derive slugs from \`area-data.json\` keys (\`camelCase\` → \`kebab-case\`): London excludes \`region === "Surrey"\`; Surrey filters \`region === "Surrey"\`.

### Page files discovered

| File | URL shape / notes |
|------|-------------------|
`;

const routeListing = [...astros, ...apiRoutes].sort((a, b) =>
  path.relative(root, a).localeCompare(path.relative(root, b))
);
for (const abs of routeListing) {
  const relNorm = path.relative(root, abs).replace(/\\/g, '/');
  const note = ROUTE_NOTES[relNorm];
  md += '| `' + relNorm + '` | ' + astroUrl(abs) + (note ? ' — ' + note : '') + ' |\n';
}

md += `
### Layout metadata overrides (explicit \`<Layout ...>\`)

| Path | Title | Meta description |
|------|-------|-------------------|
`;

const KNOWN_META = [
  ['src/pages/index.astro', 'Luxury Cleaning Services London | High Quality Clean', 'Premium home, office and concierge cleaning across London and Surrey. DBS-checked, fully insured cleaners, 5-star service and tailored plans for discerning households.'],
  ['src/pages/services.astro', 'Luxury Cleaning Services in London | High Quality Clean', 'Explore premium home, deep, office, Airbnb, end-of-tenancy and laundry cleaning services for discerning London and Surrey clients. DBS-checked, fully insured teams.'],
  ['src/pages/contact.astro', 'Contact High Quality Clean | Luxury London Cleaners', 'Speak to High Quality Clean about premium home, deep, office and Airbnb cleaning across London and Surrey. Call, WhatsApp, email or request a tailored quote online.'],
  ['src/pages/quote.astro', 'Request a Luxury Cleaning Quote | High Quality Clean London', 'Tell us about your London or Surrey property and receive a tailored cleaning quote from High Quality Clean\'s professional team. Same-week response, no obligation.'],
  ['src/pages/discount.astro', '30% Introductory Rate | High Quality Clean', 'Claim your exclusive 30% introductory rate for High Quality Clean\'s luxury cleaning services. Limited availability for new clients.'],
  ['src/pages/feedback.astro', 'Feedback | High Quality Clean', 'We value your feedback. Please let us know about your experience with our luxury cleaning services.'],
  ['src/pages/offer.astro', 'Offer | High Quality Clean', 'Get a 30% introductory rate for your first month of cleaning with High Quality Clean.'],
  ['src/pages/areas.astro', 'Luxury Cleaners Across London & Surrey | High Quality Clean', 'Premium cleaning across Mayfair, Belgravia, Chelsea, Kensington, Knightsbridge, Weybridge and nearby areas. DBS-checked, insured cleaners.'],
  ['src/pages/why-us.astro', 'Why Choose High Quality Clean | Wellness-Grade London Cleaning', 'Wellness-grade protocols, concierge-level care and DBS-checked, fully insured cleaners for London\'s most discerning homes. See why clients trust High Quality Clean.'],
  ['src/pages/process.astro', 'Our Cleaning Process | High Quality Clean London', 'From discreet consultation and bespoke plan to first clean and ongoing care, our 5-step process delivers calm, consistent, immaculate results in London homes.'],
  ['src/pages/case-studies.astro', 'Cleaning Case Studies & Gallery | High Quality Clean London', 'Before-and-after transformations from luxury London homes: deep cleans, end-of-tenancy resets and wellness-grade detailing. See our work in action.'],
  ['src/pages/client-success-stories.astro', 'Client Success Stories — High Quality Clean London', 'High Quality Clean Client Success Stories — Real experiences from discerning London clients who trusted us with their homes. Detailed case studies showcasing our wellness-grade cleaning excellence.'],
  ['src/pages/faq.astro', 'FAQ | High Quality Clean', 'Frequently asked questions about our premium cleaning services in London. Get answers to all your queries about booking, pricing, and our processes.'],
  ['src/pages/404.astro', 'Page Not Found | High Quality Clean', 'The page you\'re looking for seems to have been moved or doesn\'t exist. Explore our luxury cleaning services for London\'s finest properties.'],
  ['src/pages/privacy-policy.astro', 'Privacy Policy | High Quality Clean', 'Privacy Policy for High Quality Clean Ltd.'],
  ['src/pages/terms-and-conditions.astro', 'Terms and Conditions | High Quality Clean', 'Terms and conditions of service for High Quality Clean Ltd. Professional luxury cleaning services in London.'],
  ['src/pages/disclaimer.astro', 'Third Party Disclaimer | High Quality Clean', 'Important information about external links, third-party platforms, and third-party services referenced on the High Quality Clean Ltd website.'],
  ['src/pages/services/deep-cleaning.astro', 'Deep Cleaning Service London | High Quality Clean', 'Wellness-grade deep cleaning for London homes: kitchens, bathrooms, ovens, behind appliances, skirtings and high-touch detail. Insured, DBS-checked teams. Book a quote today.'],
  ['src/pages/services/end-of-tenancy-cleaning.astro', 'End of Tenancy Cleaning London | High Quality Clean', 'Professional end of tenancy cleaning in London for tenants, landlords and agents. Detailed move-out cleans, fixed quotes, and high standards throughout.'],
  ['src/pages/services/office-cleaning.astro', 'Office Cleaning Services London | High Quality Clean', 'Premium office and commercial cleaning across London. Daily, evening or weekend rotas, vetted teams, sanitising of high-touch points and discreet, consistent service.'],
  ['src/pages/services/airbnb-cleaning.astro', 'Airbnb Cleaning & Turnover Service London | High Quality Clean', '5-star Airbnb and short-let turnover cleaning across London. Hotel-standard linen, photo reporting, inventory checks and reliable scheduling to protect your Superhost status.'],
  ['src/pages/services/carpet-cleaning.astro', 'Professional Carpet Cleaning London | High Quality Clean', 'Specialist carpet, rug and upholstery cleaning across London. Stain removal, odour neutralising and fibre-safe deep extraction for wool, silk and synthetic finishes.'],
  ['src/pages/services/ironing-and-laundry.astro', 'Ironing & Laundry Service London | High Quality Clean', 'Concierge-grade ironing and laundry across London: shirts, linens, delicates and wardrobe care, hand-finished and beautifully presented. Pickup and drop-off available.'],
  ['src/pages/locations/london/[area].astro', 'From area.pageTitle / fallback Luxury Cleaners {name}', 'From metaDescription or programmatic fallback'],
  ['src/pages/locations/surrey/[area].astro', 'Same pattern (Surrey fallback string)', 'From metaDescription or programmatic fallback']
];

for (const [file, title, desc] of KNOWN_META) {
  md += `| \`${file}\` | ${title.replace(/\|/g, '\\|')} | ${desc.replace(/\|/g, '\\|')} |\n`;
}

md += `
**Note:** Quote, discount, and feedback layouts use \`robots="noindex, nofollow"\` on \`<Layout>\`.

---

## 3 Shared UI copy (canonical files)

Marketing copy reused across routes lives primarily in:

- \`src/components/Header.astro\` — nav labels, CTAs
- \`src/components/Footer.astro\` — tagline, company links, contact
- \`src/layouts/Layout.astro\` — default meta description if a page omits one; Site-wide JSON-LD (\`Organization\`, \`WebSite\`, …)
- Component defaults under \`src/components/*.astro\` (hero sections, FAQs, tiers, testimonials fallbacks)

**Markdown does not duplicate every Astro/component string** (those files are authoritative). Exceptions: all **data files** appear verbatim in §4.

---

## 4 Verbatim configuration & structured content

`;

md += `### 4.1 Site settings (\`src/data/site-settings.json\`)

`;

md += fenced('json', read('src/data/site-settings.json'));

md +=
  `### 4.2 FAQ module (\`src/data/faq.js\`)

FAQ answers include HTML snippets (anchors to Terms and Conditions).

` + fenced('javascript', read('src/data/faq.js'));

const areaPretty = JSON.stringify(JSON.parse(read('src/data/area-data.json')), null, 2);
md +=
  `### 4.3 Area / location payloads (\`src/data/area-data.json\`)

Full JSON defining per-area headings, narratives, testimonials, FAQs, pricing copy, hero alt text, etc. Location templates read this directly.

` + fenced('json', areaPretty);

md += `---

## 5 Behaviour & APIs (summary)

| File | Purpose |
|------|---------|
| \`src/middleware.ts\` | Canonical host + legacy path redirects (\`legacyRedirects\` map) |
| \`astro.config.mjs\` | \`redirects:\` for branding/legacy URLs; \`site:\` canonical origin |
| \`src/pages/api/discount.ts\` | Proxies POST body to Cloudflare secret \`DISCOUNT_FORM_WEBHOOK\`; client maps \`home\`/\`commercial\` UI values → \`Residential\`/\`Commercial\` in payload |
| \`src/pages/api/quick-form.ts\` | Proxies → \`QUICK_FORM_WEBHOOK\` |
| \`src/pages/api/quote.ts\` | Proxies → \`QUOTE_FORM_WEBHOOK\` |
| \`src/pages/api/feedback.ts\` | Proxies → \`FEEDBACK_WEBHOOK\` |
| \`src/lib/googleReviews.ts\` | Optional live Google testimonials; fallback when scrape fails |

---

## 6 Content not fully inlined here

Large **page-level** Astro files with extensive inline prose (recommended to read/edit in place):

- \`src/pages/offer.astro\` (~1800 lines)
- \`src/pages/areas.astro\` (area directory + postcode UI)
- \`src/pages/case-studies.astro\` & \`src/pages/client-success-stories.astro\`
- Legal: \`src/pages/privacy-policy.astro\`, \`terms-and-conditions.astro\`, \`disclaimer.astro\`
- \`src/pages/why-us.astro\`, \`process.astro\`
- Each \`src/pages/services/*.astro\`: large objects passed into \`ServiceTemplate.astro\`

---

_This file was generated by \`scripts/generate-website-content-doc.mjs\`._
`;

if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(outPath, md, 'utf8');
console.log('Wrote', path.relative(root, outPath));
