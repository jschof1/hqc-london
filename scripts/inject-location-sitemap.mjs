#!/usr/bin/env node
/**
 * Post-build script: inject location page URLs into the Astro-generated sitemap.
 *
 * Astro's @astrojs/sitemap only discovers statically-prerendered pages.
 * Dynamic server-rendered routes ([area].astro) need to be added manually.
 *
 * Run after `astro build`:
 *   node scripts/inject-location-sitemap.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, '../dist/sitemap-0.xml');

// London areas (must match slugs from area-data.json)
const londonAreas = [
  'battersea',
  'belgravia',
  'chelsea',
  'clapham',
  'hampstead',
  'highgate',
  'holland-park',
  'kensington',
  'knightsbridge',
  'mayfair',
  'notting-hill',
  'primrose-hill',
  'st-johns-wood',
  'wandsworth',
];

// Surrey areas
const surreyAreas = [
  'hersham',
  'walton-on-thames',
  'weybridge',
];

const baseUrl = 'https://highqualityclean.co.uk';
const today = new Date().toISOString().split('T')[0];

function buildUrlEntry(path) {
  return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
}

// Read the existing sitemap
let xml = readFileSync(sitemapPath, 'utf-8');

// Only inject URLs that aren't already in the sitemap (prerendered routes are
// auto-added by @astrojs/sitemap; we don't want duplicates).
const allLocationPaths = [
  ...londonAreas.map(area => `/locations/london/${area}/`),
  ...surreyAreas.map(area => `/locations/surrey/${area}/`),
];

const missingPaths = allLocationPaths.filter(path => !xml.includes(`<loc>${baseUrl}${path}</loc>`));

if (missingPaths.length === 0) {
  console.log(`✓ All ${allLocationPaths.length} location URLs already present in sitemap-0.xml — nothing to inject`);
} else {
  const locationEntries = missingPaths.map(buildUrlEntry).join('\n');
  xml = xml.replace('</urlset>', `${locationEntries}\n</urlset>`);
  writeFileSync(sitemapPath, xml);
  console.log(`✓ Injected ${missingPaths.length} missing location URL(s) into sitemap-0.xml`);
}
