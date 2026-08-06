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
import { canonicalSitemapPaths, locationSitemapPaths } from './sitemap-routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, '../dist/sitemap-0.xml');

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

// Read the existing sitemap and retain only the explicit canonical allowlist.
// This guards against legacy source files being rediscovered by Astro.
let xml = readFileSync(sitemapPath, 'utf-8');
const urlEntries = xml.match(/<url>.*?<\/url>/gs) ?? [];
const canonicalEntries = new Map();

for (const entry of urlEntries) {
  const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) continue;
  const path = new URL(loc).pathname;
  if (canonicalSitemapPaths.has(path)) canonicalEntries.set(path, entry);
}

const missingLocationPaths = locationSitemapPaths.filter((path) => !canonicalEntries.has(path));
for (const path of missingLocationPaths) canonicalEntries.set(path, buildUrlEntry(path));

const canonicalEntriesInOrder = [...canonicalSitemapPaths]
  .map((path) => canonicalEntries.get(path))
  .filter(Boolean)
  .join('');

const openingTag = xml.match(/^.*?<urlset[^>]*>/s)?.[0];
if (!openingTag) throw new Error('sitemap-0.xml does not contain a <urlset> element');

xml = `${openingTag}${canonicalEntriesInOrder}</urlset>`;
writeFileSync(sitemapPath, xml);

const missingControlledPaths = [...canonicalSitemapPaths].filter((path) => !canonicalEntries.has(path));
if (missingControlledPaths.length > 0) {
  throw new Error(`Sitemap is missing ${missingControlledPaths.length} controlled URL(s): ${missingControlledPaths.join(', ')}`);
}

console.log(`✓ Wrote ${canonicalEntries.size} controlled canonical URL(s); injected ${missingLocationPaths.length} retained location URL(s)`);
