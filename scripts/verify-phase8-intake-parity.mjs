#!/usr/bin/env node
// Source guard adapted from the 23 October release-gate branch. No network or provider calls.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const guardedPaths = [
  "src/lib/form-submission.ts",
  "src/lib/enquiry-classification.ts",
  "src/lib/preview.ts",
  "src/pages/api/contact.ts",
  "src/pages/api/discount.ts",
  "src/pages/api/feedback.ts",
  "src/pages/api/quick-form.ts",
  "src/pages/api/quote.ts",
  "src/pages/contact.astro",
  "src/pages/discount.astro",
  "src/pages/feedback.astro",
  "src/pages/quote.astro",
  "src/pages/request-a-quote.astro",
  "scripts/verify-form-routing.mjs",
  "scripts/verify-form-submission.test.mjs",
  "scripts/verify-form-worker.test.mjs",
  "scripts/test-form-handlers.mjs",
  "scripts/verify-phase8-analytics.test.mjs",
  "src/scripts/main.js",
  "src/scripts/analytics.js",
  "src/scripts/analytics-contract.js",
  "src/data/analytics-paths.json",
  "package.json",
  "package-lock.json",
  "scripts/check-phase8-release.mjs",
  "scripts/check-phase8-release.test.mjs",
  "scripts/sitemap-routes.mjs",
  "scripts/verify-phase8-intake-parity.mjs",
  "scripts/verify-phase8-intake-parity.test.mjs",
];
export const sha256 = value => value === null ? null : createHash('sha256').update(value).digest('hex');
export const operationalGates = [
  'Parent review, commit/push and fresh production/candidate ref readback',
  'Candidate build and browser/accessibility/customer-journey receipts',
  'Isolated CONTACT_FORM_WEBHOOK configuration and controlled receiver acceptance',
  'CRM contact/opportunity/tags, assignment, notifications and duplicate/failure evidence (parent-owned)',
  'Booking and service-dependent payment acceptance with provider authority',
  'Immutable candidate preview, A02/A05/A06/A07 evidence and Pedro acceptance',
];

// A deliberate reconciliation needs exact source hashes, a reason for each divergent
// path and source-bound local test receipts. This is not human review or a release approval.
export function inspectReconciliation(production, candidate, sources, proof, receiptText) {
  const changed = guardedPaths.filter(path => sources[path].production !== sources[path].candidate);
  const errors = [];
  if (changed.length) {
    if (proof?.production !== production || proof?.candidate !== candidate) errors.push('Proof refs do not match the inspected sources');
    for (const path of guardedPaths) {
      const entry = proof?.paths?.[path];
      if (!entry || entry.production !== sources[path].production || entry.candidate !== sources[path].candidate) errors.push(`Missing or stale source hash: ${path}`);
      if (changed.includes(path) && !entry?.reason?.trim()) errors.push(`Missing reconciliation reason: ${path}`);
    }
    for (const command of ['npm run test:forms', 'npm run test:analytics']) {
      const receipt = proof?.checks?.find(check => check.command === command);
      if (!receipt || receipt.exitCode !== 0 || !receipt.log || receipt.sha256 !== sha256(receiptText[receipt.log] ?? null)) errors.push(`Missing or stale local test receipt: ${command}`);
    }
  }
  return { changed, errors, codeEvidence: errors.length === 0, productionRelease: false, operationalGates };
}

const git = args => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
function content(ref, path) {
  if (ref === 'WORKTREE') {
    try { return readFileSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  if (!git(['ls-tree', ref, '--', path])) return null;
  return execFileSync('git', ['show', `${ref}:${path}`], { stdio: ['ignore', 'pipe', 'pipe'] });
}
function main() {
  const [productionRef, candidateRef, proofFile] = process.argv.slice(2);
  if (!productionRef || !candidateRef || process.argv.length > 5) {
    console.error('Usage: node scripts/verify-phase8-intake-parity.mjs <production-ref> <candidate-ref|WORKTREE> [proof.json]');
    return 2;
  }
  try {
    const production = git(['rev-parse', '--verify', `${productionRef}^{commit}`]);
    const candidate = candidateRef === 'WORKTREE' ? `WORKTREE:${git(['rev-parse', 'HEAD'])}` : git(['rev-parse', '--verify', `${candidateRef}^{commit}`]);
    const sources = Object.fromEntries(guardedPaths.map(path => [path, { production: sha256(content(production, path)), candidate: sha256(content(candidateRef === 'WORKTREE' ? 'WORKTREE' : candidate, path)) }]));
    const proof = proofFile ? JSON.parse(readFileSync(proofFile, 'utf8')) : null;
    const receipts = Object.fromEntries((proof?.checks || []).map(check => [check.log, readFileSync(check.log, 'utf8')]));
    const result = inspectReconciliation(production, candidate, sources, proof, receipts);
    console.log(`Production: ${production}; candidate: ${candidate}`);
    console.log(`${result.changed.length} deliberately divergent protected paths`);
    if (result.errors.length) for (const error of result.errors) console.error(`BLOCKED: ${error}`);
    else console.log(result.changed.length ? 'RECORDED: source-bound reconciliation and local test receipts; parent review still required. Parity is not verified.' : 'MATCH: protected source content is equal; this does not verify operational evidence.');
    console.error('BLOCKED: production release requires separately reviewed operational evidence.');
    for (const gate of operationalGates) console.error(`  - ${gate}`);
    return 1; // This bounded source check cannot certify external outcomes or approve release.
  } catch {
    console.error('BLOCKED: unable to inspect exact refs, reconciliation proof or local test receipts.');
    return 2;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = main();
