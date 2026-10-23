import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const check = fileURLToPath(new URL("./verify-phase8-intake-parity.mjs", import.meta.url));
const git = (cwd, ...args) => execFileSync("git", args, { cwd, stdio: "ignore" });
const write = (cwd, file, value) => {
  const dest = join(cwd, file);
  mkdirSync(join(dest, ".."), { recursive: true });
  writeFileSync(dest, value);
};
const run = (cwd, ...refs) => spawnSync(process.execPath, [check, ...refs], { cwd, encoding: "utf8" });

test("blocks missing production lead protection, clears equal content, rejects unknown refs", () => {
  const cwd = mkdtempSync(join(tmpdir(), "hqc-phase8-intake-"));
  try {
    git(cwd, "init", "-q");
    git(cwd, "config", "user.email", "test@example.invalid");
    git(cwd, "config", "user.name", "HQC Release Test");
    write(cwd, "src/lib/form-submission.ts", "export const accepted = false;\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "baseline");
    git(cwd, "branch", "production");
    git(cwd, "checkout", "-qb", "staging");
    write(cwd, "README.md", "Intentional staging copy only\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "staging copy");
    git(cwd, "checkout", "-q", "production");
    write(cwd, "src/lib/form-submission.ts", "export const accepted = true;\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "fix production form acknowledgement");
    const blocked = run(cwd, "production", "staging");
    assert.equal(blocked.status, 1, blocked.stderr);
    assert.match(blocked.stderr, /BLOCKED: Phase 8 candidate/);
    assert.match(blocked.stderr, /src\/lib\/form-submission\.ts/);
    git(cwd, "checkout", "-q", "staging");
    write(cwd, "src/lib/form-submission.ts", "export const accepted = true;\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "carry source protection forward");
    const preserved = run(cwd, "production", "staging");
    assert.equal(preserved.status, 0, preserved.stderr);
    assert.match(preserved.stdout, /PASS: protected enquiry paths/);
    const unknown = run(cwd, "production", "missing-staging");
    assert.equal(unknown.status, 2, unknown.stderr);
    assert.match(unknown.stderr, /BLOCKED: unable to compare/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
