import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { syncWsl } from "../scripts/sync-wsl.mjs";
import { RUNTIME_FILES } from "../scripts/runtime-bundle.mjs";
import { createRuntimeFixture, listFiles } from "./helpers/runtime-fixture.mjs";

test("Windows to WSL sync keeps special paths in separate arguments and stages only runtime files", (t) => {
  const { sourceDir } = createRuntimeFixture(t);
  const linuxSource = '/mnt/c/A & B;$(printf INJECTED)|"quote"/中文';
  const linuxHome = "/home/test & ;'$(printf INJECTED)%USERPROFILE% 中文";
  const calls = [];
  let staged;
  const spawn = (command, args, options) => {
    calls.push({ command, args, options });
    assert.equal(command, "wsl.exe");
    assert.equal(args[0], "--exec");
    assert.equal(options.shell, false);
    if (args[1] === "wslpath") {
      staged = args[4];
      assert.deepEqual(listFiles(staged), [...RUNTIME_FILES].sort());
      return { status: 0, stdout: `${linuxSource}\n` };
    }
    return { status: 0, stdout: args[1] === "printenv" ? `${linuxHome}\n` : "" };
  };
  const destination = `${linuxHome}/.openclaw/workspace/skills/persona-skill`;
  assert.equal(syncWsl({ sourceDir, platform: "win32", spawn }), destination);
  assert.deepEqual(calls.map((call) => call.args), [
    ["--exec", "wslpath", "-a", "-u", staged],
    ["--exec", "printenv", "HOME"],
    ["--exec", "test", "!", "-L", destination],
    ["--exec", "mkdir", "-p", "--", destination],
    ["--exec", "rsync", "-a", "--delete", "--", `${linuxSource}/`, `${destination}/`],
  ]);
  assert.equal(fs.existsSync(path.dirname(staged)), false);
});

test("WSL transport preserves paths across real child processes and replaces stale installed files", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t, "repo & semi;$(echo nope) 中文");
  const homeDir = path.join(temporary, "home & semi;$(echo nope) 中文");
  const destination = path.join(homeDir, ".openclaw/workspace/skills/persona-skill");
  fs.mkdirSync(path.join(destination, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(destination, "scripts/sync-wsl.mjs"), "old unsafe helper");
  const emulator = path.join(temporary, "wsl-emulator.cjs");
  const mapping = path.join(temporary, "source-path.json");
  const linuxHome = "/home/test & semi;$(echo nope) 中文";
  fs.writeFileSync(emulator, `
const fs = require("node:fs");
const path = require("node:path");
const [home, mapping, linuxHome, flag, command, ...args] = process.argv.slice(2);
function destination(value) {
  if (!value.startsWith(linuxHome + "/")) process.exit(5);
  return path.join(home, ...value.slice(linuxHome.length + 1).split("/"));
}
if (flag !== "--exec") process.exit(2);
if (command === "wslpath") {
  fs.writeFileSync(mapping, JSON.stringify(args[2]));
  process.stdout.write("/staged-bundle\\n");
}
else if (command === "printenv") process.stdout.write(linuxHome + "\\n");
else if (command === "test") {
  const target = destination(args[2]);
  if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink()) process.exit(1);
}
else if (command === "mkdir") fs.mkdirSync(destination(args[2]), { recursive: true });
else if (command === "rsync") {
  if (args[1] !== "--delete" || args[2] !== "--") process.exit(3);
  if (args[3] !== "/staged-bundle/") process.exit(6);
  const target = destination(args[4]);
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(JSON.parse(fs.readFileSync(mapping, "utf8")), target, { recursive: true });
} else process.exit(4);
`);
  const spawn = (command, args, options) => {
    assert.equal(command, "wsl.exe");
    assert.equal(options.shell, false);
    return spawnSync(process.execPath, [emulator, homeDir, mapping, linuxHome, ...args], options);
  };
  const linuxDestination = syncWsl({ sourceDir, platform: "win32", spawn });
  assert.equal(linuxDestination, `${linuxHome}/.openclaw/workspace/skills/persona-skill`);
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
});

for (const failure of ["missing executable", "wslpath", "printenv", "test", "mkdir", "rsync", "terminated process"]) {
  test(`WSL sync reports ${failure} and removes its temporary bundle`, (t) => {
    const { sourceDir } = createRuntimeFixture(t);
    let staged;
    const calls = [];
    const spawn = (_command, args) => {
      calls.push(args[1]);
      if (args[1] === "wslpath") staged = args[4];
      if (failure === "missing executable") return { error: new Error("ENOENT") };
      if (failure === "terminated process") return { status: null, signal: "SIGTERM" };
      if (args[1] === failure) return { status: 1, stderr: "failed" };
      return { status: 0, stdout: args[1] === "wslpath" ? "/mnt/c/staged\n" : "/home/test\n" };
    };
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /WSL/u);
    assert.equal(fs.existsSync(path.dirname(staged)), false);
    if (failure === "wslpath" || failure === "missing executable") assert.deepEqual(calls, ["wslpath"]);
  });
}

test("WSL sync stops before mkdir or rsync when the destination is a symlink", (t) => {
  const { sourceDir } = createRuntimeFixture(t);
  const commands = [];
  const spawn = (_command, args) => {
    commands.push(args[1]);
    return args[1] === "test"
      ? { status: 1, stderr: "destination is a symlink" }
      : { status: 0, stdout: args[1] === "wslpath" ? "/mnt/c/staged\n" : "/home/test\n" };
  };
  assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /destination is a symlink/u);
  assert.deepEqual(commands, ["wslpath", "printenv", "test"]);
});

test("WSL command arrays work with real host rsync in a temporary workspace", (t) => {
  const probe = spawnSync("rsync", ["--version"], { stdio: "ignore", shell: false });
  if (process.platform === "win32" || probe.error || probe.status !== 0) {
    return t.skip("Requires a POSIX host with rsync; WSL launcher remains simulated");
  }
  const { temporary, sourceDir } = createRuntimeFixture(t);
  const homeDir = path.join(temporary, "home & ;$(printf INJECTED) ' 中文");
  const destination = path.join(homeDir, ".openclaw/workspace/skills/persona-skill");
  fs.mkdirSync(path.join(destination, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(destination, "scripts/sync-wsl.mjs"), "old unsafe helper");
  const spawn = (_command, args, options) => {
    if (args[1] === "wslpath") return { status: 0, stdout: `${args[4]}\n` };
    if (args[1] === "printenv") return { status: 0, stdout: `${homeDir}\n` };
    return spawnSync(args[1], args.slice(2), options);
  };
  assert.equal(syncWsl({ sourceDir, platform: "win32", spawn }), destination);
  assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
});

for (const value of ["", "relative/path", "/home/test\n/another/path", "/home/test\0bad"]) {
  test(`WSL sync rejects invalid home path ${JSON.stringify(value)} before writing`, (t) => {
    const { sourceDir } = createRuntimeFixture(t);
    const commands = [];
    const spawn = (_command, args) => {
      commands.push(args[1]);
      return { status: 0, stdout: args[1] === "wslpath" ? "/mnt/c/staged\n" : value };
    };
    assert.throws(() => syncWsl({ sourceDir, platform: "win32", spawn }), /absolute Linux path/u);
    assert.deepEqual(commands, ["wslpath", "printenv"]);
  });
}

test("native and WSL-hosted sync use the local runtime installer without invoking a shell", (t) => {
  const { temporary, sourceDir } = createRuntimeFixture(t);
  for (const platform of ["linux", "darwin"]) {
    const destination = syncWsl({
      sourceDir, platform, homeDir: path.join(temporary, platform),
      spawn: () => assert.fail("native sync must not invoke a child process"),
    });
    assert.deepEqual(listFiles(destination), [...RUNTIME_FILES].sort());
  }
});
