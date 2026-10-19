import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { RUNTIME_FILES, copyRuntimeBundle, installRuntimeBundle, withRuntimeBundle } from "../scripts/runtime-bundle.mjs";
import { installSmokeSkill } from "../scripts/smoke-persona-openclaw.mjs";
import { syncLocalOpenClaw } from "../scripts/sync-local-openclaw.mjs";
import { createRuntimeFixture, listFiles } from "./helpers/runtime-fixture.mjs";

test("runtime bundle copies only the complete allowlist and remains executable", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t, "repo & semi; dollar$(echo nope) 中文");
  const destination = path.join(temporary, "bundle");
  copyRuntimeBundle(destination, sourceDir);
  assert.equal(RUNTIME_FILES.length, 25);
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
  for (const file of RUNTIME_FILES) {
    assert.deepEqual(fs.readFileSync(path.join(destination, file)), fs.readFileSync(path.join(sourceDir, file)));
  }
  const index = JSON.parse(fs.readFileSync(path.join(destination, "assets/mbti/mbti-index.json"), "utf8"));
  const types = Object.keys(index.reverse_lookup).filter((type) => /^[EI][NS][FT][JP]$/u.test(type));
  assert.equal(types.length, 16);
  for (const type of types) assert.ok(RUNTIME_FILES.includes(`references/mbti/${type}.md`));
  const result = spawnSync(process.execPath, [path.join(destination, "scripts/mbti-lookup.js"), "ENFP"], { encoding: "utf8", shell: false });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).recommended, "INTJ");
});

test("local sync replaces stale installed helpers while preserving workspace persona files", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const homeDir = path.join(temporary, "home & ; 中文");
  const workspace = path.join(homeDir, ".openclaw/workspace");
  const destination = path.join(workspace, "skills/persona-skill");
  fs.mkdirSync(path.join(destination, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(destination, "scripts/sync-wsl.mjs"), "old unsafe helper");
  fs.writeFileSync(path.join(workspace, "SOUL.md"), "existing persona");
  assert.equal(syncLocalOpenClaw({ sourceDir, homeDir }), destination);
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
  assert.equal(fs.readFileSync(path.join(workspace, "SOUL.md"), "utf8"), "existing persona");
  assert.deepEqual(fs.readdirSync(path.dirname(destination)), ["persona-skill"]);
});

test("smoke installation uses the same runtime file set", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const destination = path.join(temporary, "smoke/skills/persona-skill");
  installSmokeSkill(destination, sourceDir);
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
});

test("missing runtime assets fail before replacing an installed skill", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const destination = path.join(temporary, "installed");
  fs.mkdirSync(destination);
  fs.writeFileSync(path.join(destination, "keep"), "old installation");
  fs.rmSync(path.join(sourceDir, "scripts/mbti-lookup.js"));
  assert.throws(() => installRuntimeBundle(destination, sourceDir), /ENOENT/u);
  assert.deepEqual(listFiles(destination), ["keep"]);
  assert.deepEqual(fs.readdirSync(temporary).sort(), ["installed", "source"]);
});

test("runtime copying refuses overlapping or nonempty destinations", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  for (const destination of [sourceDir, path.join(sourceDir, "nested"), temporary]) {
    assert.throws(() => installRuntimeBundle(destination, sourceDir), /must not overlap/u);
  }
  const nonempty = path.join(temporary, "nonempty");
  fs.mkdirSync(nonempty);
  fs.writeFileSync(path.join(nonempty, "keep"), "keep");
  assert.throws(() => copyRuntimeBundle(nonempty, sourceDir), /must be empty/u);
  assert.deepEqual(listFiles(nonempty), ["keep"]);
});

test("local installation restores the old skill if the final rename fails", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const destination = path.join(temporary, "installed");
  fs.mkdirSync(destination);
  fs.writeFileSync(path.join(destination, "keep"), "old installation");
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from, to) => {
    if (path.basename(from) === "persona-skill" && to === destination) throw new Error("simulated rename failure");
    return rename(from, to);
  });
  assert.throws(() => installRuntimeBundle(destination, sourceDir), /simulated rename failure/u);
  assert.equal(fs.readFileSync(path.join(destination, "keep"), "utf8"), "old installation");
  assert.deepEqual(fs.readdirSync(temporary).sort(), ["installed", "source"]);
});

test("local installation retains a recoverable backup if rollback also fails", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const destination = path.join(temporary, "installed");
  fs.mkdirSync(destination);
  fs.writeFileSync(path.join(destination, "keep"), "old installation");
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from, to) => {
    if (to === destination) throw new Error("simulated filesystem failure");
    return rename(from, to);
  });
  assert.throws(() => installRuntimeBundle(destination, sourceDir), /backup preserved/u);
  const backupRoot = fs.readdirSync(temporary).find((entry) => entry.startsWith("persona-skill-bundle."));
  assert.ok(backupRoot);
  assert.equal(fs.readFileSync(path.join(temporary, backupRoot, "previous/keep"), "utf8"), "old installation");
});

test("local installation refuses a symlinked destination without changing its target", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const target = path.join(temporary, "outside");
  const destination = path.join(temporary, "installed");
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, "keep"), "untouched");
  try {
    fs.symlinkSync(target, destination, "junction");
  } catch (error) {
    if (error.code === "EPERM") return t.skip("Creating symlinks requires additional Windows privileges");
    throw error;
  }
  assert.throws(() => installRuntimeBundle(destination, sourceDir), /regular directory/u);
  assert.deepEqual(listFiles(target), ["keep"]);
});

for (const target of ["scripts/mbti-lookup.js", "references"]) {
  test(`runtime bundle rejects symlinked source ${target}`, (t) => {
    const { temporary, sourceDir } = createRuntimeFixture(t);
    const file = path.join(sourceDir, target);
    const moved = path.join(temporary, "linked-source");
    fs.renameSync(file, moved);
    try {
      fs.symlinkSync(moved, file, target === "references" ? "junction" : "file");
    } catch (error) {
      if (error.code === "EPERM") return t.skip("Creating symlinks requires additional Windows privileges");
      throw error;
    }
    const destination = path.join(temporary, "bundle");
    assert.throws(() => copyRuntimeBundle(destination, sourceDir), /regular files and directories/u);
    assert.equal(fs.existsSync(destination), false);
  });
}

test("temporary runtime bundles are removed after success and failure", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  let staged;
  for (const fail of [false, true]) {
    const callback = (directory) => {
      staged = directory;
      assert.deepEqual(listFiles(directory), [...RUNTIME_FILES].sort());
      if (fail) throw new Error("publisher failure");
      return "done";
    };
    if (fail) assert.throws(() => withRuntimeBundle(callback, { sourceDir, tempDir: temporary }), /publisher failure/u);
    else assert.equal(withRuntimeBundle(callback, { sourceDir, tempDir: temporary }), "done");
    assert.equal(fs.existsSync(path.dirname(staged)), false);
  }
});
