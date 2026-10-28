#!/usr/bin/env node
// Preview builds are review artefacts. Phase 8 has no production acceptance yet.
const production = process.env.CF_PAGES_BRANCH === 'main' || process.env.HQC_RELEASE_TARGET === 'production';
if (production) {
  console.error('BLOCKED: Phase 8 production release has outstanding CRM, booking/payment and Pedro acceptance gates. See phase8/INTAKE_RECONCILIATION_2026-10-28.md.');
  process.exitCode = 1;
} else {
  console.log('Phase 8 review build only. This build does not grant production release approval.');
}
