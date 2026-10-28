import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const run = env => spawnSync(process.execPath, ['scripts/check-phase8-release.mjs'], {
  encoding: 'utf8', env: { ...process.env, CF_PAGES_BRANCH: '', HQC_RELEASE_TARGET: '', ...env },
});
test('preview and local review builds remain possible', () => {
  assert.equal(run({ CF_PAGES_BRANCH: 'phase8-2026-09-28-staging' }).status, 0);
  assert.equal(run({}).status, 0);
});
test('production branch and explicit production builds fail before Astro', () => {
  for (const env of [{ CF_PAGES_BRANCH: 'main' }, { HQC_RELEASE_TARGET: 'production' }]) {
    const result = run(env);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /BLOCKED.*Pedro acceptance/);
  }
});
