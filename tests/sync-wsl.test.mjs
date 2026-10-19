import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { syncWsl } from "../scripts/sync-wsl.mjs";
import { RUNTIME_FILES } from "../scripts/runtime-bundle.mjs";
import { createRuntimeFixture, listFiles } from "./helpers/runtime-fixture.mjs";
import { emulateWsl, linuxPath } from "./helpers/wsl-emulator.mjs";

const emulator = fileURLToPath(new URL("./helpers/wsl-emulator.mjs", import.meta.url));

function harness(t, options = {}) {
  const fixture = createRuntimeFixture(t, "repo & semi;$(echo nope) 中文");
  const config = {
    ...fixture,
    homeDir: path.join(fixture.temporary, "home & ;'$(printf INJECTED)%USERPROFILE% 中文"),
    linuxHome: "/home/test & ;'$(printf INJECTED)%USERPROFILE% 中文",
    ...options,
  };
  const configPath = path.join(fixture.temporary, "wsl-config.json");
  fs.mkdirSync(config.homeDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config));
  const calls = [];
  const spawn = (command, args, spawnOptions) => {
    assert.equal(command, "wsl.exe");
    assert.equal(args[0], "--exec");
    assert.equal(spawnOptions.shell, false);
    calls.push(args);
    return options.subprocess
      ? spawnSync(process.execPath, [emulator, configPath, ...args], spawnOptions)
      : emulateWsl(args, config);
  };
  return { ...fixture, config, calls, spawn, destination: path.join(config.homeDir, ".openclaw/workspace/skills/persona-skill") };
}

function seedInstallation(destination) {
  fs.mkdirSync(path.join(destination, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(destination, "scripts/sync-wsl.mjs"), "old unsafe helper");
  fs.writeFileSync(path.join(destination, "keep-until-success"), "previous installation");
}

function contents(directory) {
  return Object.fromEntries(listFiles(directory).map((file) => [file, fs.readFileSync(path.join(directory, file), "base64")]));
}

function assertWindowsSnapshotCleaned(calls) {
  const staged = calls.find((args) => args[1] === "wslpath")?.[4];
  if (staged) assert.equal(fs.existsSync(path.dirname(staged)), false);
}

for (const subprocess of [false, true]) {
  test(`Windows WSL transport preserves special paths and stages only runtime files (subprocess=${subprocess})`, (t) => {
    const { sourceDir, destination, calls, spawn } = harness(t, { subprocess });
    seedInstallation(destination);
    const result = syncWsl({ sourceDir, platform: "win32", spawn });
    assert.equal(result, linuxPath(fs.realpathSync(destination)));
    assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
    for (const file of RUNTIME_FILES) {
      assert.deepEqual(fs.readFileSync(path.join(destination, file)), fs.readFileSync(path.join(sourceDir, file)));
    }
    const rsync = calls.find((args) => args[1] === "rsync");
    assert.deepEqual(rsync.slice(0, 4), ["--exec", "rsync", "-a", "--"]);
    assert.ok(rsync.at(-1).includes(".persona-skill-stage."));
    assert.equal(calls.some((args) => args.includes("--delete")), false);
    assert.deepEqual(fs.readdirSync(path.dirname(destination)), ["persona-skill"]);
    assertWindowsSnapshotCleaned(calls);
  });
}

test("WSL supports a first installation without an existing destination", (t) => {
  const { sourceDir, destination, calls, spawn } = harness(t);
  syncWsl({ sourceDir, platform: "win32", spawn });
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
  assert.equal(calls.filter((args) => args[1] === "mv").length, 1);
});

for (const failCommand of ["wslpath", "printenv", "realpath", "test", "mkdir", "mktemp", "rsync"]) {
  test(`WSL ${failCommand} failure preserves the old installation`, (t) => {
    const { sourceDir, destination, calls, spawn } = harness(t, { failCommand });
    seedInstallation(destination);
    const before = contents(destination);
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /WSL/u);
    assert.ok(calls.some((args) => args[1] === failCommand));
    assert.deepEqual(contents(destination), before);
    assert.deepEqual(fs.readdirSync(path.dirname(destination)), ["persona-skill"]);
    assertWindowsSnapshotCleaned(calls);
  });
}

for (const failure of [{ error: new Error("ENOENT") }, { status: null, signal: "SIGTERM" }]) {
  test(`WSL reports launcher failure ${failure.error?.message ?? failure.signal}`, (t) => {
    const { sourceDir } = createRuntimeFixture(t);
    let staged;
    assert.throws(() => syncWsl({
      sourceDir, platform: "win32",
      spawn: (_command, args) => { staged = args[4]; return failure; },
    }), /WSL/u);
    assert.equal(fs.existsSync(path.dirname(staged)), false);
  });
}

test("WSL install rename failure restores the previous skill", (t) => {
  const { sourceDir, destination, calls, spawn } = harness(t, { failInstall: true });
  seedInstallation(destination);
  const before = contents(destination);
  assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /simulated install failure/u);
  assert.deepEqual(contents(destination), before);
  assert.deepEqual(fs.readdirSync(path.dirname(destination)), ["persona-skill"]);
  assertWindowsSnapshotCleaned(calls);
});

test("WSL rollback failure keeps the previous skill in a recoverable backup", (t) => {
  const { sourceDir, destination, calls, spawn } = harness(t, { failInstall: true, failRestore: true });
  seedInstallation(destination);
  const before = contents(destination);
  assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /backup preserved/u);
  const backup = fs.readdirSync(path.dirname(destination)).find((entry) => entry.startsWith(".persona-skill-stage."));
  assert.ok(backup);
  assert.deepEqual(contents(path.join(path.dirname(destination), backup, "previous")), before);
  assertWindowsSnapshotCleaned(calls);
});

for (const phase of ["backup", "install", "restore"]) {
  test(`WSL retains recovery files when ${phase} succeeds before its acknowledgement is lost`, (t) => {
    const fixture = harness(t, { failInstall: phase === "restore" });
    const { sourceDir, destination, calls } = fixture;
    seedInstallation(destination);
    const before = contents(destination);
    let interrupted = false;
    const spawn = (command, args, options) => {
      const result = fixture.spawn(command, args, options);
      const from = args.at(-2);
      const to = args.at(-1);
      const matched = phase === "backup" ? to.endsWith("/previous")
        : phase === "restore" ? from.endsWith("/previous")
        : from.endsWith("/persona-skill") && to.endsWith("/persona-skill");
      if (!interrupted && args[1] === "mv" && result.status === 0 && matched) {
        interrupted = true;
        return { status: null, signal: "SIGTERM" };
      }
      return result;
    };
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /recovery directory preserved/u);
    assert.equal(interrupted, true);
    const recovery = fs.readdirSync(path.dirname(destination)).find((entry) => entry.startsWith(".persona-skill-stage."));
    assert.ok(recovery);
    if (phase === "restore") assert.deepEqual(contents(destination), before);
    else assert.deepEqual(contents(path.join(path.dirname(destination), recovery, "previous")), before);
    assert.equal(calls.some((args) => args[1] === "rm"), false);
    assertWindowsSnapshotCleaned(calls);
  });
}

test("WSL rejects case aliases through an ancestor symlink before moving old files", (t) => {
  const fixture = harness(t);
  const parent = path.join(fixture.temporary, "MiXeD");
  const sourceDir = path.join(parent, "persona-skill/checkout");
  fs.mkdirSync(parent);
  const alias = path.join(fixture.temporary, "mixed");
  if (!fs.existsSync(alias)) return t.skip("Requires a case-insensitive filesystem");
  fs.mkdirSync(sourceDir, { recursive: true });
  for (const file of RUNTIME_FILES) {
    const target = path.join(sourceDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(fixture.sourceDir, file), target);
  }
  fs.mkdirSync(path.join(sourceDir, ".git"));
  fs.writeFileSync(path.join(sourceDir, ".git/config"), "must preserve repository");
  const skills = path.dirname(fixture.destination);
  fs.mkdirSync(path.dirname(skills), { recursive: true });
  try { fs.symlinkSync(alias, skills, "junction"); }
  catch (error) {
    if (error.code === "EPERM") return t.skip("Creating symlinks requires additional Windows privileges");
    throw error;
  }
  const before = contents(sourceDir);
  assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn: fixture.spawn }), /must not overlap/u);
  assert.deepEqual(contents(sourceDir), before);
  assert.equal(fixture.calls.some((args) => ["mkdir", "mktemp", "rsync", "mv", "rm"].includes(args[1])), false);
});

for (const relationship of ["same", "source contains destination", "destination contains source", "ancestor symlink"]) {
  test(`WSL refuses source/target overlap: ${relationship}`, (t) => {
    const fixture = harness(t);
    const { config, destination, spawn, calls } = fixture;
    fs.mkdirSync(destination, { recursive: true });
    let sourceDir = destination;
    if (relationship === "source contains destination") sourceDir = config.homeDir;
    if (relationship === "destination contains source") sourceDir = path.join(destination, "checkout");
    if (relationship === "ancestor symlink") {
      fs.rmSync(path.dirname(destination), { recursive: true });
      fs.mkdirSync(path.join(fixture.temporary, "repositories"));
      try {
        fs.symlinkSync(path.join(fixture.temporary, "repositories"), path.dirname(destination), "junction");
      } catch (error) {
        if (error.code === "EPERM") return t.skip("Creating symlinks requires additional Windows privileges");
        throw error;
      }
      sourceDir = path.join(fixture.temporary, "repositories/persona-skill");
    }
    fs.mkdirSync(sourceDir, { recursive: true });
    for (const file of RUNTIME_FILES) {
      const target = path.join(sourceDir, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(fixture.sourceDir, file), target);
    }
    fs.mkdirSync(path.join(sourceDir, ".git"));
    fs.writeFileSync(path.join(sourceDir, ".git/config"), "must not delete source");
    const before = contents(sourceDir);
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /must not overlap/u);
    assert.deepEqual(contents(sourceDir), before);
    assert.equal(calls.some((args) => ["mkdir", "mktemp", "rsync", "mv", "rm"].includes(args[1])), false);
    assertWindowsSnapshotCleaned(calls);
  });
}

for (const gitKind of ["file", "directory"]) {
  test(`WSL refuses an unrelated Git checkout with a .git ${gitKind}`, (t) => {
    const { sourceDir, destination, calls, spawn } = harness(t);
    seedInstallation(destination);
    if (gitKind === "directory") fs.mkdirSync(path.join(destination, ".git"));
    else fs.writeFileSync(path.join(destination, ".git"), "gitdir: elsewhere");
    const before = contents(destination);
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /WSL test/u);
    assert.deepEqual(contents(destination), before);
    assert.equal(calls.some((args) => args[1] === "mv"), false);
  });
}

test("WSL refuses a symlinked destination before changing its target", (t) => {
  const { sourceDir, destination, temporary, spawn } = harness(t);
  const outside = path.join(temporary, "outside");
  seedInstallation(outside);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  try { fs.symlinkSync(outside, destination, "junction"); }
  catch (error) {
    if (error.code === "EPERM") return t.skip("Creating symlinks requires additional Windows privileges");
    throw error;
  }
  const before = contents(outside);
  assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /WSL test/u);
  assert.deepEqual(contents(outside), before);
});

test("WSL staging uses real host rsync without changing old files before completion", (t) => {
  const probe = spawnSync("rsync", ["--version"], { stdio: "ignore", shell: false });
  if (process.platform === "win32" || probe.error || probe.status !== 0) {
    return t.skip("Requires a POSIX host with rsync; WSL launcher remains simulated");
  }
  const { sourceDir, destination, spawn } = harness(t, { realRsync: true });
  seedInstallation(destination);
  const source = fs.readFileSync(path.join(sourceDir, "SKILL.md"));
  fs.writeFileSync(path.join(destination, "SKILL.md"), Buffer.alloc(source.length, "x"));
  syncWsl({ sourceDir, platform: "win32", spawn });
  assert.deepEqual(fs.readFileSync(path.join(destination, "SKILL.md")), source);
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
});

for (const homeOutput of ["", "relative/path", "/home/test\n/another/path", "/home/test\0bad"]) {
  test(`WSL refuses invalid home output ${JSON.stringify(homeOutput)}`, (t) => {
    const { sourceDir, destination, calls, spawn } = harness(t, { homeOutput });
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /absolute Linux path/u);
    assert.equal(fs.existsSync(destination), false);
    assert.equal(calls.some((args) => args[1] === "mkdir"), false);
  });
}

test("native and WSL-hosted sync use the local installer without launching a process", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  for (const platform of ["linux", "darwin"]) {
    const destination = syncWsl({
      sourceDir, platform, homeDir: path.join(temporary, platform),
      spawn: () => assert.fail("native sync must not invoke a child process"),
    });
    assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
  }
});
