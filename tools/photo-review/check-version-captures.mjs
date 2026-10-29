import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('./public/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('versions/manifest.json', root), 'utf8'));
const ids = manifest.versions.map(v => v.id);
assert.equal(new Set(ids).size, ids.length, 'Version IDs must be unique');
assert.ok(ids.includes(manifest.defaultBefore) && ids.includes(manifest.defaultAfter));
let count = 0;
for (const version of manifest.versions) {
  assert.match(version.commit, /^[0-9a-f]{40}$/);
  assert.match(version.immutableDeploymentUrl, /^https:\/\/[0-9a-f]{8}\.hqc-london\.pages\.dev$/);
  for (const [pageId, views] of Object.entries(version.pages)) {
    assert.ok(manifest.pages.some(p => p.id === pageId), `Unknown page ${pageId}`);
    for (const [view, shot] of Object.entries(views)) {
      assert.ok(['desktop', 'mobile'].includes(view));
      assert.match(shot.src, /^\/versions\/captures\/[a-z0-9-]+\.jpg$/);
      const bytes = await readFile(new URL(shot.src.slice(1), root));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), shot.sha256, shot.src);
      assert.equal(bytes.readUInt16BE(0), 0xffd8, 'JPEG signature');
      let dimensions;
      for (let offset = 2; offset < bytes.length;) {
        assert.equal(bytes[offset], 0xff, 'JPEG marker');
        const marker = bytes[offset + 1], length = bytes.readUInt16BE(offset + 2);
        if ([0xc0, 0xc1, 0xc2].includes(marker)) {
          dimensions = { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
          break;
        }
        offset += length + 2;
      }
      assert.deepEqual(dimensions, { width: shot.width, height: shot.height }, shot.src);
      count += 1;
    }
  }
}
console.log(`Verified ${count} capture hashes and image dimensions across ${ids.length} source-linked versions.`);
