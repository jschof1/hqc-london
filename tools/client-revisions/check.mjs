#!/usr/bin/env node
// Client revision guard. See README.md for what this does and does not prove.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const GLOB_OR_BACKSLASH = /[*?[\]{}!\\]/;
const PROTECTED_DIRS = ['src', 'public', 'functions', 'scripts'];
const PROTECTED_ROOT_FILES = [
  /^astro\.config\.[^/]+$/,
  /^tailwind\.config\.[^/]+$/,
  /^postcss\.config\.[^/]+$/,
  /^tsconfig\.json$/,
  /^wrangler\.(toml|json|jsonc)$/,
  /^package-lock\.json$/,
  /^package\.json$/,
];
const DEPLOYMENT_URL = /^https:\/\/[0-9a-f]{8}\.hqc-london\.pages\.dev$/;
const REVIEW_URL_PREFIX = 'https://review.highqualityclean.co.uk/versions/';
const DEFAULT_PACKET = 'revisions/current.json';
const DEFAULT_VERSIONS = 'revisions/versions.json';

export const LIMITS = [
  'Checks which paths changed, not whether edits inside an allowed file match the request.',
  'Cannot verify that the client or Jack approved the request; the packet is trusted as written.',
  'Not tamper-proof: anyone with write access can edit the packet, registry or this guard. Independent review and branch protection remain required.',
];

export class CheckError extends Error {}

export function git(root, args, { input, allowFail = false } = {}) {
  const result = spawnSync('git', ['-C', root, '-c', 'core.quotePath=false', ...args], {
    input,
    maxBuffer: 1 << 30,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  if (result.status === 0) return result.stdout;
  if (allowFail) return null;
  throw new CheckError(`git ${args[0]} failed: ${String(result.stderr).trim().split('\n')[0]}`);
}

const splitZ = (buf) => buf.toString('utf8').split('\0').filter(Boolean);
const show = (p) => JSON.stringify(p);
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

export function relativePathError(p) {
  if (typeof p !== 'string' || p === '') return 'must be a non-empty string';
  if (p.startsWith('/')) return 'must be relative';
  if (GLOB_OR_BACKSLASH.test(p) || p.includes('\0')) return 'must be an exact path (no glob or backslash)';
  if (p.split('/').some((s) => s === '' || s === '.' || s === '..')) return 'must not contain empty, "." or ".." segments';
  return null;
}

export function isCommit(root, sha) {
  if (typeof sha !== 'string' || !HEX40.test(sha)) return false;
  const out = git(root, ['rev-parse', '--verify', '--quiet', `${sha}^{commit}`], { allowFail: true });
  return out !== null && out.toString().trim() === sha;
}

export function validatePacket(root, packet) {
  const errors = [];
  if (!isPlainObject(packet)) return ['packet must be a JSON object'];
  if (packet.schemaVersion !== 1) errors.push('packet schemaVersion must be 1');
  if (!isCommit(root, packet.baseline)) {
    errors.push('baseline must be an existing full 40-character commit hash');
  } else if (git(root, ['merge-base', '--is-ancestor', packet.baseline, 'HEAD'], { allowFail: true }) === null) {
    errors.push(`baseline ${packet.baseline} is not an ancestor of HEAD`);
  }
  if (!nonEmptyString(packet.request)) errors.push('request must be a non-empty string');

  const ids = new Set();
  if (!Array.isArray(packet.requirements) || packet.requirements.length === 0) {
    errors.push('requirements must be a non-empty array');
  } else {
    for (const r of packet.requirements) {
      if (!isPlainObject(r) || !nonEmptyString(r.id) || !nonEmptyString(r.text)) {
        errors.push('each requirement needs a non-empty id and text');
      } else if (ids.has(r.id)) {
        errors.push(`duplicate requirement id ${show(r.id)}`);
      } else {
        ids.add(r.id);
      }
    }
  }

  const seen = new Set();
  if (!Array.isArray(packet.allowedFiles) || packet.allowedFiles.length === 0) {
    errors.push('allowedFiles must be a non-empty array');
    return errors;
  }
  for (const f of packet.allowedFiles) {
    if (!isPlainObject(f)) { errors.push('each allowedFiles entry must be an object'); continue; }
    const pathError = relativePathError(f.path);
    if (pathError) { errors.push(`allowedFiles path ${show(f.path)} ${pathError}`); continue; }
    if (seen.has(f.path)) errors.push(`duplicate allowedFiles path ${show(f.path)}`);
    seen.add(f.path);
    if (!Array.isArray(f.requirements) || f.requirements.length === 0) {
      errors.push(`allowedFiles ${show(f.path)} must list at least one requirement`);
    } else {
      for (const id of f.requirements) if (!ids.has(id)) errors.push(`allowedFiles ${show(f.path)} references unknown requirement ${show(id)}`);
    }
    if (typeof f.allowDelete !== 'boolean') errors.push(`allowedFiles ${show(f.path)} allowDelete must be true or false`);
  }
  return errors;
}

// Baseline vs working tree: committed, staged and unstaged edits plus untracked, non-ignored files.
export function listChanges(root, baseline) {
  const changes = [];
  const seen = new Set();
  for (const flags of [[], ['--cached']]) {
    const diff = splitZ(git(root, ['diff', ...flags, '--name-status', '-z', '--no-renames', '--no-ext-diff', baseline, '--']));
    for (let i = 0; i < diff.length; i += 2) {
      const key = `${diff[i]}\0${diff[i + 1]}`;
      if (!seen.has(key)) changes.push({ status: diff[i][0], path: diff[i + 1] });
      seen.add(key);
    }
  }
  for (const p of splitZ(git(root, ['ls-files', '-z', '--others', '--exclude-standard']))) changes.push({ status: '?', path: p });
  return changes;
}

export function scopeErrors(packet, changes) {
  const allowed = new Map(packet.allowedFiles.map((f) => [f.path, f]));
  const errors = [];
  for (const { status, path: p } of changes) {
    const entry = allowed.get(p);
    if (!'AMDT?'.includes(status)) errors.push(`unexpected git status ${status} for ${show(p)}`);
    else if (!entry) errors.push(`changed path not listed in packet: ${show(p)}`);
    else if (status === 'D' && entry.allowDelete !== true) errors.push(`deletion not allowed by packet: ${show(p)}`);
  }
  return errors;
}

export function isProtected(p) {
  if (/^scripts\/hqc-(lead-controls|weekly-export|weekly-report)(\.test)?\.mjs$/.test(p)) return false;
  return PROTECTED_DIRS.some((d) => p === d || p.startsWith(`${d}/`)) || PROTECTED_ROOT_FILES.some((re) => re.test(p));
}

export function normalizePackageJson(bytes) {
  let pkg;
  try { pkg = JSON.parse(bytes.toString('utf8')); } catch { throw new CheckError('package.json is not valid JSON'); }
  if (!isPlainObject(pkg)) throw new CheckError('package.json must be a JSON object');
  const rest = { ...pkg };
  delete rest.scripts;
  return Buffer.from(JSON.stringify(rest));
}

function hashFiles(files) {
  const hash = createHash('sha256');
  for (const { path: p, bytes } of [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
    const content = p === 'package.json' ? normalizePackageJson(bytes) : bytes;
    hash.update(`${p}\0${content.length}\0`);
    hash.update(content);
  }
  return { fingerprint: hash.digest('hex'), files: files.length };
}

export function worktreeFingerprint(root) {
  const paths = [...new Set(splitZ(git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])))].filter(isProtected);
  const files = [];
  for (const p of paths) {
    let stat;
    try { stat = lstatSync(path.join(root, p)); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
    if (stat.isSymbolicLink()) throw new CheckError(`symlink in protected application tree: ${show(p)}`);
    if (!stat.isFile()) throw new CheckError(`non-regular file in protected application tree: ${show(p)}`);
    files.push({ path: p, bytes: readFileSync(path.join(root, p)) });
  }
  return hashFiles(files);
}

function catBlobs(root, shas) {
  if (shas.length === 0) return [];
  const out = git(root, ['cat-file', '--batch'], { input: `${shas.join('\n')}\n` });
  const blobs = [];
  let i = 0;
  while (blobs.length < shas.length) {
    const nl = out.indexOf(10, i);
    const [, type, size] = out.subarray(i, nl).toString().split(' ');
    if (type !== 'blob') throw new CheckError('unreadable blob in commit tree');
    blobs.push(out.subarray(nl + 1, nl + 1 + Number(size)));
    i = nl + 2 + Number(size);
  }
  return blobs;
}

export function commitFingerprint(root, commit) {
  const entries = [];
  for (const line of splitZ(git(root, ['ls-tree', '-r', '-z', '--full-tree', commit]))) {
    const tab = line.indexOf('\t');
    const [mode, type, sha] = line.slice(0, tab).split(' ');
    const p = line.slice(tab + 1);
    if (!isProtected(p)) continue;
    if (mode === '120000') throw new CheckError(`symlink in protected application tree at ${commit.slice(0, 12)}: ${show(p)}`);
    if (type !== 'blob') throw new CheckError(`non-file entry in protected application tree at ${commit.slice(0, 12)}: ${show(p)}`);
    entries.push({ path: p, sha });
  }
  const blobs = catBlobs(root, entries.map((e) => e.sha));
  return hashFiles(entries.map((e, n) => ({ path: e.path, bytes: blobs[n] })));
}

export function indexFingerprint(root) {
  const entries = [];
  for (const line of splitZ(git(root, ['ls-files', '--stage', '-z']))) {
    const tab = line.indexOf('\t');
    const [mode, sha, stage] = line.slice(0, tab).split(' ');
    const p = line.slice(tab + 1);
    if (!isProtected(p)) continue;
    if (stage !== '0' || mode === '120000') throw new CheckError(`unmerged or symlink application entry in index: ${show(p)}`);
    entries.push({ path: p, sha });
  }
  const blobs = catBlobs(root, entries.map((e) => e.sha));
  return hashFiles(entries.map((e, n) => ({ path: e.path, bytes: blobs[n] })));
}

export function registryErrors(root, registry) {
  if (!isPlainObject(registry) || registry.schemaVersion !== 1) return ['versions registry schemaVersion must be 1'];
  if (!Array.isArray(registry.versions) || registry.versions.length === 0) return ['versions registry must list at least one version'];
  const errors = [];
  const ids = new Set();
  for (const v of registry.versions) {
    if (!isPlainObject(v) || !nonEmptyString(v.id)) { errors.push('each version needs a non-empty id'); continue; }
    if (ids.has(v.id)) errors.push(`duplicate version id ${show(v.id)}`);
    ids.add(v.id);
    if (!isCommit(root, v.commit)) errors.push(`version ${show(v.id)} commit must be an existing full commit hash`);
  }
  return errors;
}

// Validates a matched version against its capture manifest, read from git rather than trusted from the registry.
export function versionEvidenceErrors(root, v) {
  const errors = [];
  const label = `version ${show(v.id)}`;
  if (typeof v.immutableDeploymentUrl !== 'string' || !DEPLOYMENT_URL.test(v.immutableDeploymentUrl)) {
    errors.push(`${label} immutableDeploymentUrl must be https://<hash>.hqc-london.pages.dev`);
  }
  let review = null;
  try { review = new URL(v.reviewUrl); } catch { /* reported below */ }
  if (!review || !review.href.startsWith(REVIEW_URL_PREFIX) || review.username || review.password) {
    errors.push(`${label} reviewUrl must start with ${REVIEW_URL_PREFIX}`);
  }
  const cm = v.captureManifest;
  if (!isPlainObject(cm) || !isCommit(root, cm.commit) || relativePathError(cm.path)) {
    return [...errors, `${label} captureManifest needs an existing full commit hash and exact relative path`];
  }
  const raw = git(root, ['cat-file', 'blob', `${cm.commit}:${cm.path}`], { allowFail: true });
  if (raw === null) return [...errors, `${label} capture manifest ${show(cm.path)} is missing at ${cm.commit.slice(0, 12)}`];
  let manifest;
  try { manifest = JSON.parse(raw.toString('utf8')); } catch { return [...errors, `${label} capture manifest is not valid JSON`]; }
  const entry = Array.isArray(manifest?.versions) ? manifest.versions.find((m) => isPlainObject(m) && m.id === v.id) : undefined;
  if (!entry) return [...errors, `${label} not found in capture manifest`];
  if (entry.commit !== v.commit) errors.push(`${label} capture manifest commit differs from registry`);
  if (entry.immutableDeploymentUrl !== v.immutableDeploymentUrl) errors.push(`${label} capture manifest deployment URL differs from registry`);
  const pages = isPlainObject(entry.pages) ? Object.values(entry.pages) : [];
  const captured = pages.filter((pg) => isPlainObject(pg) && ['desktop', 'mobile'].every((d) => isPlainObject(pg[d]) && HEX64.test(pg[d].sha256 ?? '')));
  if (captured.length === 0 || captured.length !== pages.length) errors.push(`${label} capture manifest needs pages with desktop and mobile SHA-256 captures`);
  return errors;
}

function repoRelative(root, arg) {
  const rel = path.relative(root, path.resolve(root, arg)).split(path.sep).join('/');
  const err = relativePathError(rel);
  if (err) throw new CheckError(`path ${show(arg)} must be inside the repository (${err})`);
  return rel;
}

function readJson(root, rel, what) {
  try { return JSON.parse(readFileSync(path.join(root, rel), 'utf8')); } catch (e) {
    throw new CheckError(`${what} ${show(rel)} ${e.code === 'ENOENT' ? 'is missing' : 'is not valid JSON'}`);
  }
}

export function runCheck({ root, scope = false, packetPath = DEFAULT_PACKET, versionsPath = DEFAULT_VERSIONS }) {
  const lines = [];
  const errors = [];
  lines.push(scope ? 'Mode: --scope (preview construction only; run the full check before handover or production)' : 'Mode: full');

  const packetRel = repoRelative(root, packetPath);
  const working = (() => { try { return readFileSync(path.join(root, packetRel)); } catch { throw new CheckError(`packet ${show(packetRel)} is missing`); } })();
  const committed = git(root, ['cat-file', 'blob', `HEAD:${packetRel}`], { allowFail: true });
  if (committed === null || !committed.equals(working)) errors.push(`packet ${show(packetRel)} must be committed at HEAD and unchanged while implementing`);
  const packetCommit = git(root, ['log', '-1', '--format=%H', '--', packetRel]).toString().trim();
  if (packetCommit) {
    const planningPaths = splitZ(git(root, ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '-z', packetCommit]));
    if (planningPaths.length !== 1 || planningPaths[0] !== packetRel) errors.push('packet must be frozen in a separate planning-only commit before implementation');
  }
  const packet = readJson(root, packetRel, 'packet');
  const packetErrors = validatePacket(root, packet);
  if (packetCommit && packetErrors.length === 0) {
    const parent = git(root, ['rev-parse', `${packetCommit}^`], { allowFail: true });
    if (!parent || parent.toString().trim() !== packet.baseline) errors.push('baseline must be the planning commit parent: freeze scope before implementation; amendments start a new baseline');
  }
  errors.push(...packetErrors);

  if (packetErrors.length === 0) {
    const changes = listChanges(root, packet.baseline);
    const count = (s) => changes.filter((c) => c.status === s).length;
    lines.push(`Changed paths since ${packet.baseline.slice(0, 12)}: ${changes.length} (${count('A')} added, ${count('M') + count('T')} modified, ${count('D')} deleted, ${count('?')} untracked)`);
    errors.push(...scopeErrors(packet, changes));
  }

  if (!scope) {
    const registry = readJson(root, repoRelative(root, versionsPath), 'versions registry');
    const regErrors = registryErrors(root, registry);
    errors.push(...regErrors);
    if (regErrors.length === 0) {
      const current = worktreeFingerprint(root);
      if (indexFingerprint(root).fingerprint !== current.fingerprint) errors.push('staged application differs from working files; stage the intended application before the full handover check');
      lines.push(`Application fingerprint: ${current.fingerprint} (${current.files} files)`);
      const matches = registry.versions.filter((v) => {
        try { return commitFingerprint(root, v.commit).fingerprint === current.fingerprint; } catch (e) {
          if (!(e instanceof CheckError)) throw e;
          lines.push(`Version ${show(v.id)} cannot be fingerprinted: ${e.message}`);
          return false;
        }
      });
      if (matches.length === 0) errors.push('current application matches no recorded version; capture and register it before handover');
      for (const v of matches) {
        const evidenceErrors = versionEvidenceErrors(root, v);
        errors.push(...evidenceErrors);
        if (evidenceErrors.length === 0) lines.push(`Matches recorded version ${show(v.id)} (${v.commit.slice(0, 12)}, ${v.immutableDeploymentUrl})`);
      }
    }
  }

  for (const e of errors) lines.push(`FAIL ${e}`);
  lines.push(errors.length === 0 ? 'RESULT: PASS' : `RESULT: FAIL (${errors.length} problem${errors.length === 1 ? '' : 's'})`);
  lines.push(...LIMITS.map((l) => `Limit: ${l}`));
  return { ok: errors.length === 0, errors, lines };
}

export function parseArgs(argv) {
  const opts = { scope: false, packetPath: DEFAULT_PACKET, versionsPath: DEFAULT_VERSIONS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--scope') opts.scope = true;
    else if ((a === '--packet' || a === '--versions') && argv[i + 1] && !argv[i + 1].startsWith('--')) opts[a === '--packet' ? 'packetPath' : 'versionsPath'] = argv[++i];
    else throw new CheckError(`unknown or incomplete argument ${show(a)}. Usage: check.mjs [--scope] [--packet <path>] [--versions <path>]`);
  }
  return opts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    const root = git(process.cwd(), ['rev-parse', '--show-toplevel']).toString().trim();
    const { ok, lines } = runCheck({ root, ...opts });
    console.log(lines.join('\n'));
    process.exitCode = ok ? 0 : 1;
  } catch (e) {
    if (!(e instanceof CheckError)) throw e;
    console.error(`FAIL ${e.message}`);
    process.exitCode = 1;
  }
}
