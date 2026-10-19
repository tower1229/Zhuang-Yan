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
  assert.equal(RUNTIME_FILES.length, 26);
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

test("runtime Markdown references stay inside the runtime allowlist", (t) => {
  const { sourceDir } = createRuntimeFixture(t);
  const types = RUNTIME_FILES.filter((file) => file.startsWith("references/mbti/")).map((file) => path.basename(file, ".md"));
  for (const file of RUNTIME_FILES.filter((entry) => entry.endsWith(".md"))) {
    const text = fs.readFileSync(path.join(sourceDir, file), "utf8");
    for (const [reference] of text.matchAll(/(?:references|assets|scripts)\/[A-Za-z0-9_./<>-]+\.(?:md|json|js)/gu)) {
      const paths = /<(?:human|persona)_mbti>/u.test(reference)
        ? types.map((type) => reference.replace(/<(?:human|persona)_mbti>/gu, type)) : [reference];
      for (const dependency of paths) {
        assert.ok(RUNTIME_FILES.includes(dependency), `${file} references an unbundled file: ${dependency}`);
      }
    }
  }
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

test("runtime lookup keeps its CommonJS boundary inside an ESM workspace", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const workspace = path.join(temporary, "esm-workspace");
  fs.mkdirSync(workspace);
  fs.writeFileSync(path.join(workspace, "package.json"), JSON.stringify({ type: "module" }));
  const destination = path.join(workspace, "skills/persona-skill");
  copyRuntimeBundle(destination, sourceDir);
  const result = spawnSync(process.execPath, [path.join(destination, "scripts/mbti-lookup.js"), "ENFP"], { encoding: "utf8", shell: false });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).recommended, "INTJ");
  assert.equal(JSON.parse(fs.readFileSync(path.join(destination, "scripts/package.json"), "utf8")).type, "commonjs");
});

for (const gitKind of ["file", "directory"]) {
  test(`local sync refuses an unrelated Git checkout with a .git ${gitKind}`, (t) => {
    const { temporary, sourceDir } = createRuntimeFixture(t);
    const destination = path.join(temporary, "checkout");
    fs.mkdirSync(destination);
    if (gitKind === "directory") fs.mkdirSync(path.join(destination, ".git"));
    else fs.writeFileSync(path.join(destination, ".git"), "gitdir: elsewhere");
    fs.writeFileSync(path.join(destination, "keep"), "unrelated repository");
    assert.throws(() => installRuntimeBundle(destination, sourceDir), /Git checkout/u);
    assert.equal(fs.readFileSync(path.join(destination, "keep"), "utf8"), "unrelated repository");
    assert.ok(fs.existsSync(path.join(destination, ".git")));
  });
}

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

test("local sync rejects source ancestors reached through a different path case", (t) => {
  const fixture = createRuntimeFixture(t);
  const source = path.join(fixture.temporary, "MiXeD/checkout");
  copyRuntimeBundle(source, fixture.sourceDir);
  const destination = path.join(fixture.temporary, "mixed");
  if (!fs.existsSync(destination)) return t.skip("Requires a case-insensitive filesystem");
  fs.mkdirSync(path.join(source, ".git"));
  fs.writeFileSync(path.join(source, ".git/config"), "must preserve repository");
  assert.throws(() => installRuntimeBundle(destination, source), /must not overlap/u);
  assert.equal(fs.readFileSync(path.join(source, ".git/config"), "utf8"), "must preserve repository");
});

test("local sync retains recovery files when backup rename succeeds before throwing", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const destination = path.join(temporary, "installed");
  fs.mkdirSync(destination);
  fs.writeFileSync(path.join(destination, "keep"), "previous installation");
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from, to) => {
    rename(from, to);
    if (from === destination) throw new Error("rename acknowledgement lost");
  });
  assert.throws(() => installRuntimeBundle(destination, sourceDir), /recovery directory preserved/u);
  const recovery = fs.readdirSync(temporary).find((entry) => entry.startsWith(".persona-skill-stage."));
  assert.ok(recovery);
  assert.equal(fs.readFileSync(path.join(temporary, recovery, "previous/keep"), "utf8"), "previous installation");
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
  const backupRoot = fs.readdirSync(temporary).find((entry) => entry.startsWith(".persona-skill-stage."));
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
