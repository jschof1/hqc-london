import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { relativePathError } from './check.mjs';

const CLI = fileURLToPath(new URL('./check.mjs', import.meta.url));
const temps = [];
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

const env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const sh = (cwd, ...args) => execFileSync('git', args, { cwd, env }).toString().trim();
const write = (root, rel, content) => {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  writeFileSync(path.join(root, rel), content);
};
const commitAll = (root, msg) => { sh(root, 'add', '-A'); sh(root, 'commit', '-q', '-m', msg); return sh(root, 'rev-parse', 'HEAD'); };
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

const PKG = { name: 'site', scripts: { build: 'astro build' }, dependencies: { astro: '5.0.0' } };
const DEPLOY = 'https://828d0b90.hqc-london.pages.dev';

// Baseline app commit, capture manifest on a side branch, then the committed packet and registry on main.
function makeRepo({ packet: edit = (p) => p, manifest: editManifest = (m) => m } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'client-revisions-'));
  temps.push(root);
  sh(root, 'init', '-q', '-b', 'main');
  write(root, '.gitignore', 'node_modules/\n');
  write(root, 'src/pages/index.astro', '<h1>Home</h1>\n');
  write(root, 'public/logo.svg', '<svg/>\n');
  write(root, 'scripts/inject.mjs', 'export {};\n');
  write(root, 'package.json', `${JSON.stringify(PKG, null, 2)}\n`);
  write(root, 'package-lock.json', '{"lockfileVersion":3}\n');
  write(root, 'docs/old.md', 'old\n');
  write(root, 'docs/keep.md', 'keep\n');
  const baseline = commitAll(root, 'baseline');

  sh(root, 'checkout', '-q', '-b', 'captures');
  const capture = { sha256: sha256('jpg'), src: '/versions/captures/home.jpg' };
  const manifest = editManifest({
    versions: [{ id: 'live', commit: baseline, immutableDeploymentUrl: DEPLOY, pages: { home: { desktop: capture, mobile: capture } } }],
  });
  write(root, 'review/public/versions/manifest.json', typeof manifest === 'string' ? manifest : JSON.stringify(manifest));
  const manifestCommit = commitAll(root, 'captures');
  sh(root, 'checkout', '-q', 'main');

  const allowed = ['AGENTS.md', 'package.json', 'revisions/current.json', 'revisions/versions.json', 'tools/client-revisions/check.mjs', 'notes/a b.md', 'src/pages/index.astro', 'package-lock.json'];
  const packet = edit({
    schemaVersion: 1,
    baseline,
    request: 'Add the revision guard.',
    requirements: [{ id: 'R1', text: 'Guard changes.' }],
    allowedFiles: [
      ...allowed.map((p) => ({ path: p, requirements: ['R1'], allowDelete: false })),
      { path: 'docs/old.md', requirements: ['R1'], allowDelete: true },
    ],
  });
  write(root, 'revisions/current.json', `${JSON.stringify(packet, null, 2)}\n`);
  commitAll(root, 'freeze packet only');
  write(root, 'revisions/versions.json', JSON.stringify({
    schemaVersion: 1,
    versions: [{ id: 'live', commit: baseline, immutableDeploymentUrl: DEPLOY, reviewUrl: 'https://review.highqualityclean.co.uk/versions/', captureManifest: { commit: manifestCommit, path: 'review/public/versions/manifest.json' } }],
  }));
  commitAll(root, 'register capture evidence');
  return root;
}

const run = (root, ...args) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd: root, env });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const expectPass = (r) => assert.equal(r.code, 0, r.out);
const expectFail = (r, pattern) => { assert.equal(r.code, 1, r.out); assert.match(r.out, pattern); };

test('allowed committed, staged, unstaged and untracked changes pass both modes', () => {
  const root = makeRepo();
  write(root, 'AGENTS.md', 'rules\n');
  commitAll(root, 'agents');
  write(root, 'tools/client-revisions/check.mjs', '// guard\n');
  sh(root, 'add', 'tools/client-revisions/check.mjs');
  write(root, 'notes/a b.md', 'spaced\n');
  write(root, 'node_modules/x/index.js', 'ignored\n');
  unlinkSync(path.join(root, 'docs/old.md'));
  const r = run(root);
  expectPass(r);
  assert.match(r.out, /Changed paths since [0-9a-f]{12}: 6 \(4 added, 0 modified, 1 deleted, 1 untracked\)/);
  assert.match(r.out, /Matches recorded version "live"/);
  assert.match(r.out, /Limit: Cannot verify/);
  expectPass(run(root, '--scope'));
});

test('unlisted tracked and untracked paths fail, including names with spaces', () => {
  const root = makeRepo();
  write(root, 'docs/keep.md', 'edited\n');
  write(root, 'notes/b c.md', 'stray\n');
  const r = run(root, '--scope');
  expectFail(r, /not listed in packet: "docs\/keep.md"/);
  assert.match(r.out, /not listed in packet: "notes\/b c.md"/);
});

test('deletions need allowDelete true', () => {
  const root = makeRepo();
  sh(root, 'rm', '-q', 'docs/old.md');
  expectPass(run(root, '--scope'));
  sh(root, 'rm', '-q', 'package-lock.json');
  expectFail(run(root, '--scope'), /deletion not allowed by packet: "package-lock.json"/);
});

test('packet schema errors fail', () => {
  const unknown = makeRepo({ packet: (p) => ({ ...p, allowedFiles: [...p.allowedFiles, { path: 'x.md', requirements: ['R9'], allowDelete: false }] }) });
  expectFail(run(unknown, '--scope'), /unknown requirement "R9"/);
  const glob = makeRepo({ packet: (p) => ({ ...p, allowedFiles: [...p.allowedFiles, { path: 'src/*', requirements: ['R1'], allowDelete: 'yes' }] }) });
  expectFail(run(glob, '--scope'), /"src\/\*" must be an exact path/);
  const short = makeRepo({ packet: (p) => ({ ...p, baseline: p.baseline.slice(0, 7), requirements: [...p.requirements, { id: 'R1', text: 'dup' }] }) });
  const r = run(short, '--scope');
  expectFail(r, /full 40-character commit hash/);
  assert.match(r.out, /duplicate requirement id "R1"/);
  for (const bad of ['../x', '/etc/passwd', 'a//b', './a', 'a\\b', 'a/']) assert.ok(relativePathError(bad), bad);
  assert.equal(relativePathError('notes/a b.md'), null);
});

test('baseline must be an ancestor of HEAD', () => {
  const root = makeRepo();
  sh(root, 'checkout', '-q', 'captures');
  write(root, 'x.txt', 'x');
  const side = commitAll(root, 'side');
  sh(root, 'checkout', '-q', 'main');
  const packet = JSON.parse(execFileSync('git', ['show', 'HEAD:revisions/current.json'], { cwd: root }).toString());
  write(root, 'revisions/current.json', JSON.stringify({ ...packet, baseline: side }));
  commitAll(root, 'bad baseline');
  expectFail(run(root, '--scope'), /is not an ancestor of HEAD/);
});

test('uncommitted packet edits fail', () => {
  const root = makeRepo();
  write(root, 'revisions/current.json', '{"schemaVersion":1}\n');
  expectFail(run(root, '--scope'), /must be committed at HEAD and unchanged/);
});

test('package script-only edits keep the recorded version; dependency and lock drift go stale', () => {
  const root = makeRepo();
  write(root, 'package.json', JSON.stringify({ ...PKG, scripts: { ...PKG.scripts, 'check:revision': 'node tools/client-revisions/check.mjs' } }, null, 4));
  expectPass(run(root));
  write(root, 'package.json', JSON.stringify({ ...PKG, dependencies: { astro: '5.1.0' } }));
  expectFail(run(root), /matches no recorded version/);
  expectPass(run(root, '--scope'));

  const lock = makeRepo();
  write(lock, 'package-lock.json', '{"lockfileVersion":3,"x":1}\n');
  expectFail(run(lock), /matches no recorded version/);
});

test('allowed application edits pass --scope but fail the full check as stale', () => {
  const root = makeRepo();
  write(root, 'src/pages/index.astro', '<h1>Changed</h1>\n');
  expectPass(run(root, '--scope'));
  expectFail(run(root), /matches no recorded version/);
});

test('untracked runtime inputs count towards the fingerprint', () => {
  const root = makeRepo();
  write(root, 'scripts/new.mjs', 'export {};\n');
  expectFail(run(root), /matches no recorded version/);
});

test('symlinks in the protected tree fail closed', () => {
  const root = makeRepo();
  symlinkSync('../../package.json', path.join(root, 'src/pages/link.json'));
  expectFail(run(root), /symlink in protected application tree: "src\/pages\/link.json"/);
});

test('capture manifest evidence is read from git, not trusted', () => {
  const noCaptures = makeRepo({ manifest: (m) => ({ versions: [{ ...m.versions[0], pages: { home: { desktop: { sha256: 'abc' } } } }] }) });
  expectFail(run(noCaptures), /desktop and mobile SHA-256 captures/);
  const wrongUrl = makeRepo({ manifest: (m) => ({ versions: [{ ...m.versions[0], immutableDeploymentUrl: 'https://deadbeef.hqc-london.pages.dev' }] }) });
  expectFail(run(wrongUrl), /deployment URL differs from registry/);
  const missing = makeRepo({ manifest: () => ({ versions: [] }) });
  expectFail(run(missing), /not found in capture manifest/);
  const broken = makeRepo({ manifest: () => '{not json' });
  expectFail(run(broken), /capture manifest is not valid JSON/);
});

test('unknown flags such as --force are rejected', () => {
  const root = makeRepo();
  expectFail(run(root, '--force'), /unknown or incomplete argument "--force"/);
});

test('packet and implementation cannot be committed together', () => {
  const root = makeRepo();
  const packet = JSON.parse(execFileSync('git', ['show', 'HEAD:revisions/current.json'], { cwd: root }).toString());
  packet.request += ' Updated scope.';
  write(root, 'revisions/current.json', JSON.stringify(packet));
  write(root, 'AGENTS.md', 'implementation in same commit');
  commitAll(root, 'scope mixed with implementation');
  expectFail(run(root, '--scope'), /planning-only commit/);
});

test('separate CRM commands do not invent a website release; build scripts still change it', async () => {
  const { isProtected } = await import('./check.mjs');
  assert.equal(isProtected('scripts/hqc-lead-controls.mjs'), false);
  assert.equal(isProtected('scripts/hqc-weekly-report.test.mjs'), false);
  assert.equal(isProtected('scripts/inject-location-sitemap.mjs'), true);
  assert.equal(isProtected('scripts/new-runtime.mjs'), true);
});

test('staged forbidden edits and deletions cannot hide behind restored working files', () => {
  for (const deletion of [false, true]) {
    const root = makeRepo();
    if (deletion) unlinkSync(path.join(root, 'docs/keep.md'));
    else write(root, 'docs/keep.md', 'forbidden staged edit');
    sh(root, 'add', 'docs/keep.md');
    write(root, 'docs/keep.md', 'keep\n');
    expectFail(run(root, '--scope'), /not listed in packet/);
  }
});

test('staged application drift cannot hide behind restored working files', () => {
  const root = makeRepo();
  write(root, 'src/pages/index.astro', '<h1>Unreviewed</h1>\n');
  sh(root, 'add', 'src/pages/index.astro');
  write(root, 'src/pages/index.astro', '<h1>Home</h1>\n');
  expectFail(run(root), /staged application differs/);
});

test('implementation before a separate packet commit is rejected', () => {
  const root = makeRepo();
  write(root, 'AGENTS.md', 'implemented before revised scope');
  commitAll(root, 'implementation first');
  const packet = JSON.parse(execFileSync('git', ['show', 'HEAD:revisions/current.json'], { cwd: root }).toString());
  packet.request += ' Retrospective amendment.';
  write(root, 'revisions/current.json', JSON.stringify(packet));
  commitAll(root, 'packet only but too late');
  expectFail(run(root, '--scope'), /planning commit parent/);
});
