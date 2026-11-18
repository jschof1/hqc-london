# Old-version comparison capture coverage, 18 November 2026

Jack reported that pages such as Move-in / Void were missing from the old side of the private version comparison. The prior homepage-only check did not establish complete comparison coverage.

## Frozen sources and scope

- Existing before version: `nov13-pedro-audit`, application source `177b6e202dee86e9703f0a6bbcd746fb5cf26ece`, immutable deployment `https://5bf03519.hqc-london.pages.dev`.
- Existing after version: `nov17-pedro-followup-v2`, source `ac24c182d7af8b76c65159701b3a06b1af0ead5e`, immutable deployment `https://99efba8e.hqc-london.pages.dev`.
- Before had nine captured pages; after had 26. Seventeen before pages need genuine supplementary desktop/mobile captures from the same old deployment.
- No application release is created. Existing version IDs, source/deployment references, original captures and capture dates remain. Each added image records its actual 18 November capture time.
- Preserve all comments, photo selections, access controls, all other visual versions and the customer-site production hold. No form submission, client message or payment action is part of this correction.

## Evidence and state

Supplementary capture implementation is committed and pushed on the isolated review branch at `262f24b0ce9bc435e65d8d5d0d17b618f83a464b` after planning commit `0640deb`. All 34 captures passed exact old-origin/path, one-H1, font/image health and read-only request checks. The original 18 images and all other 25 version entries remain unchanged. Four comment tests, scope checking and 502 capture hashes/dimensions pass. Fresh independent Claude review returned `PASS_AS_PREPARED`, verifying all additions, source routes, hashes, dimensions and preservation. Published only the existing `hqc-photo-review` Worker at `27a9bdd9-d6b2-4f5c-a880-3ca2b13326c2` with `--keep-vars`, after repairing the scoped Cloudflare authorisation in the existing signed-in browser at Jack's request. Hosted manifest has 26 old pages and 26 latest pages. Move-in / Void desktop old/new images load at their recorded dimensions. Existing comments and photo selections match their pre-publication backups byte-for-byte. A fresh independent hosted audit is in progress; it does not extend to forms/CRM or customer-site release. The root registry appends a supplement record while retaining the original capture-manifest reference. The original source and immutable deployments are unchanged; this is supplementary visual coverage of the older source. Private originals, baseline storage reads and the exact request remain in the private 18 November coverage evidence folder; private access material is excluded from this repository.
