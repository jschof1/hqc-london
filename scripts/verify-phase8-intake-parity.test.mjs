import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { guardedPaths, inspectReconciliation, sha256 } from './verify-phase8-intake-parity.mjs';
const sources = Object.fromEntries(guardedPaths.map(path => [path, { production: 'main-sha', candidate: 'staged-sha' }]));
const logs = { forms: 'forms passed', analytics: 'analytics passed' };
const proof = () => ({ production: 'production', candidate: 'candidate', paths: Object.fromEntries(guardedPaths.map(path => [path, { ...sources[path], reason: 'Preserved staged contract and live reliability; see review notes' }])),
  checks: ['forms', 'analytics'].map(name => ({ command: `npm run test:${name}`, log: name, exitCode: 0, sha256: sha256(logs[name]) })) });
const inspect = (p = proof(), s = sources, receipts = logs) => inspectReconciliation('production', 'candidate', s, p, receipts);

test('missing proof and stale hashes block deliberate divergence', () => {
  assert.equal(inspect(null).codeEvidence, false);
  const p = proof(); p.paths['src/pages/api/contact.ts'].candidate = 'stale';
  assert.equal(inspect(p).codeEvidence, false);
  p.paths['src/pages/api/contact.ts'] = { ...sources['src/pages/api/contact.ts'], reason: '' };
  assert.equal(inspect(p).codeEvidence, false);
  p.production = 'old-main';
  assert.equal(inspect(p).codeEvidence, false);
});

test('missing or altered test receipts block code evidence', () => {
  assert.equal(inspect(proof(), sources, { ...logs, forms: 'altered' }).codeEvidence, false);
  const p = proof(); p.checks[0].exitCode = 1;
  assert.equal(inspect(p).codeEvidence, false);
  p.checks = [];
  assert.equal(inspect(p).codeEvidence, false);
});

test('recorded reconciliation and even identical sources never clear operational release gates', () => {
  assert.equal(inspect().codeEvidence, true);
  assert.equal(inspect().productionRelease, false);
  assert.ok(inspect().operationalGates.length > 0);
  const identical = Object.fromEntries(guardedPaths.map(path => [path, { production: 'same', candidate: 'same' }]));
  assert.equal(inspect(null, identical).codeEvidence, true);
  assert.equal(inspect(null, identical).productionRelease, false);
});

test('unknown refs fail closed without fetching or mutating Git', () => {
  const run = spawnSync(process.execPath, ['scripts/verify-phase8-intake-parity.mjs', 'missing-production-fixture', 'HEAD'], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /BLOCKED: unable to inspect/);
});
