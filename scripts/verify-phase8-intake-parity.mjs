#!/usr/bin/env node
/**
 * Pre-release gate for HQC Phase 8. Compares source CONTENT, not just merge ancestry.
 * This does not replace provider acceptance or an end-to-end GHL receipt test.
 *
 * Usage (after fetching both refs):
 *   node scripts/verify-phase8-intake-parity.mjs origin/main origin/phase8-2026-09-28-staging
 */
import { execFileSync } from "node:child_process";

const guardedPaths = [
  "src/lib/form-submission.ts",
  "src/lib/enquiry-classification.ts",
  "src/lib/preview.ts",
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
];

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

const [productionRef, candidateRef] = process.argv.slice(2);
if (!productionRef || !candidateRef || process.argv.length !== 4) {
  console.error("Usage: node scripts/verify-phase8-intake-parity.mjs <production-ref> <candidate-ref>");
  process.exit(2);
}

try {
  const production = git(["rev-parse", "--verify", `${productionRef}^{commit}`]);
  const candidate = git(["rev-parse", "--verify", `${candidateRef}^{commit}`]);
  if (production === candidate) {
    console.log("PASS: identical commits, no protected form/lead drift.");
    process.exit(0);
  }

  const changed = git(["diff", "--name-only", "--no-renames", production, candidate, "--", ...guardedPaths])
    .split("\n")
    .filter(Boolean);

  if (changed.length === 0) {
    console.log(`PASS: protected enquiry paths are identical in ${production.slice(0, 12)} and ${candidate.slice(0, 12)}.`);
    console.log("Provider receipt, booking, payment and client acceptance must still be tested.");
    process.exit(0);
  }

  console.error("BLOCKED: Phase 8 candidate differs from current production in protected enquiry paths.");
  console.error(`Production source: ${productionRef} (${production.slice(0, 12)})`);
  console.error(`Candidate source: ${candidateRef} (${candidate.slice(0, 12)})`);
  for (const path of changed) console.error(`  - ${path}`);
  console.error("Reconcile each difference deliberately. Do not overwrite recent GHL form acceptance, lead tagging, date or error-handling fixes.");
  console.error("Re-run this guard against freshly fetched refs and run the form/runtime/browser/provider acceptance checks before production release.");
  process.exit(1);
} catch (error) {
  console.error("BLOCKED: unable to compare both exact Git refs. Fetch/verify production and candidate refs first.");
  console.error(error?.stderr?.toString()?.trim() || error.message);
  process.exit(2);
}
