/**
 * HQC Phase 8 controlled-copy integrity check.
 *
 * The two pinned Git blob IDs refer to the copy and FAQ source on the
 * 15 October staging review checkpoint, not to a client-approved production
 * release. This guards against accidental silent edits to imported material.
 *
 * An intentional change requires documented HQC approval, a diff review and
 * an explicit update of the corresponding blob ID in the same reviewed PR.
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const checkpoints = [
  {
    path: '../src/data/phase8-copy.json',
    label: 'Controlled Phase 8 page copy (Batches 1-6)',
    expected: '30d58c2bf5df0ffca134bc0effb513cf2b5e5cff',
  },
  {
    path: '../src/data/phase8-faq.json',
    label: 'Controlled Phase 8 FAQ copy (Batch 5)',
    expected: '5efb38e597a672a317aa5df728e10d632373ac7f',
  },
];

let failed = false;

for (const { path, label, expected } of checkpoints) {
  const contents = await readFile(new URL(path, import.meta.url));
  // Git blob IDs hash the exact file bytes preceded by "blob <length>\0".
  const actual = createHash('sha1')
    .update(Buffer.from(`blob ${contents.length}\0`))
    .update(contents)
    .digest('hex');

  if (actual !== expected) {
    failed = true;
    console.error(`FAIL: ${label} has changed since the pinned review checkpoint.`);
    console.error(`  Expected source: ${expected}\n  Current source:  ${actual}`);
    console.error('  Review the exact diff against Pedro\'s approved copy batches and Phase 8 release pack.');
    console.error('  Update the pin only alongside a documented, authorised content decision.');
  } else {
    console.log(`PASS: ${label} is unchanged (${actual.slice(0, 10)}).`);
  }
}

if (failed) process.exitCode = 1;
