import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { RUNTIME_FILES } from "../scripts/runtime-bundle.mjs";
import { createRuntimeFixture, listFiles } from "./helpers/runtime-fixture.mjs";

import {
  TEST_TARGET,
  buildCommandSpec,
  detectPublisherBootstrapBug,
  parseArgs,
  publish,
  readPackageVersion,
  resolveNpxCli,
  runPublisher,
} from "../scripts/release-clawhub.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJsonPath = path.join(root, "package.json");
const packageVersion = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")).version;

test("readPackageVersion returns package.json version", () => {
  assert.equal(readPackageVersion(packageJsonPath), packageVersion);
});

test("parseArgs uses package.json version by default", () => {
  const args = parseArgs([], { defaultVersion: packageVersion });
  assert.equal(args.version, packageVersion);
  assert.equal(args.tag, "latest");
  assert.equal(args.changelog, `Release ${packageVersion}`);
});

test("release script uses the tests directory for pre-publish validation", () => {
  assert.equal(TEST_TARGET, "tests/*.mjs");
});

test("publisher command keeps all metadata in argv without a shell", () => {
  const values = ['A & B;$(printf INJECTED)|"quote"', "%USERPROFILE% ^ 中文"];
  const spec = buildCommandSpec(process.execPath, ["-e", "console.log(JSON.stringify(process.argv.slice(1)))", ...values], true);
  const result = spawnSync(spec.command, spec.args, spec.options);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), values);
  assert.equal(spec.options.shell, false);
});

test("buildCommandSpec keeps argv array for publisher invocations", () => {
  const spec = buildCommandSpec("clawhub", ["publish", ".", "--name", "Persona Skill"]);
  assert.equal(spec.command, "clawhub");
  assert.deepEqual(spec.args, ["publish", ".", "--name", "Persona Skill"]);
  assert.equal(spec.options.shell, false);
});

test("publish hands the CLI only the staged runtime bundle and cleans it afterwards", (t) => {
  const { sourceDir } = createRuntimeFixture(t);
  const args = parseArgs(["--name", "Persona & ; $(printf nope) 中文", "--changelog", "First line\nSecond & ; line"]);
  let staged;
  publish(args, {
    sourceDir,
    invokePublisher: (argv) => {
      staged = argv[3];
      assert.equal(argv[2], "publish");
      assert.notEqual(staged, sourceDir);
      assert.deepEqual(listFiles(staged), [...RUNTIME_FILES].sort());
      assert.equal(argv[argv.indexOf("--name") + 1], args.name);
      assert.equal(argv[argv.indexOf("--version") + 1], packageVersion);
      assert.equal(argv[argv.indexOf("--changelog") + 1], args.changelog);
      return { status: 0, stdout: "", stderr: "" };
    },
  });
  assert.equal(fs.existsSync(path.dirname(staged)), false);
});

test("publish failures preserve exit status and clean up staging", (t) => {
  const { sourceDir } = createRuntimeFixture(t);
  let staged;
  assert.throws(() => publish(parseArgs([]), {
    sourceDir,
    invokePublisher: (argv) => {
      staged = argv[3];
      return { status: 17, stdout: "", stderr: "" };
    },
  }), (error) => error.exitCode === 17);
  assert.equal(fs.existsSync(path.dirname(staged)), false);
});

test("dry-run validates the runtime bundle without invoking a publisher", (t) => {
  const { sourceDir } = createRuntimeFixture(t);
  const args = parseArgs(["--dry-run"]);
  assert.equal(args.dryRun, true);
  assert.deepEqual(publish(args, {
    sourceDir, invokePublisher: () => assert.fail("dry-run must never invoke ClawHub"),
  }), { version: packageVersion, files: [...RUNTIME_FILES] });
  fs.rmSync(path.join(sourceDir, "scripts/mbti-lookup.js"));
  assert.throws(() => publish(args, { sourceDir }), /ENOENT/u);
});

test("publisher prefers a directly executable ClawHub without a shell", () => {
  const calls = [];
  const argv = ["publish", "A & ; 中文"];
  const result = runPublisher(argv, {
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: 0, stdout: "published", stderr: "" };
    },
  });
  assert.equal(result.status, 0);
  assert.equal(calls[1].command, "clawhub");
  assert.deepEqual(calls[1].args, argv);
  assert.ok(calls.every((call) => call.options.shell === false));
});

test("publisher bypasses Windows cmd shims by running npx-cli.js through Node", () => {
  const calls = [];
  const npxCli = 'C:\\Program Files\\npm & tools\\bin\\npx-cli.js';
  const argv = ["publish", 'C:\\A & B;$(echo nope) 中文'];
  runPublisher(argv, {
    npxCli,
    spawn: (command, args, options) => {
      calls.push({ command, args, options });
      return calls.length === 1 ? { error: new Error("ENOENT") } : { status: 0 };
    },
  });
  assert.equal(calls[1].command, process.execPath);
  assert.deepEqual(calls[1].args, [npxCli, "-y", "clawhub", ...argv]);
  assert.ok(calls.every((call) => call.options.shell === false));
});

test("npx resolution uses npm's JavaScript entrypoint beside npm_execpath", (t) => {
  const { temporary } = createRuntimeFixture(t);
  const directory = path.join(temporary, "npm & tools");
  fs.mkdirSync(directory);
  const cli = path.join(directory, "npx-cli.js");
  fs.writeFileSync(cli, "");
  assert.equal(resolveNpxCli({ npmExecPath: path.join(directory, "npm-cli.js") }), cli);
});

test("detectPublisherBootstrapBug matches the ClawHub backend error", () => {
  const output = `Error: Uncaught Error: This query or mutation function ran multiple paginated queries.\n    at async ensurePersonalPublisherForUser (../../convex/lib/publishers.ts:169:14)`;
  assert.equal(detectPublisherBootstrapBug(output), true);
});

test("detectPublisherBootstrapBug ignores unrelated errors", () => {
  assert.equal(detectPublisherBootstrapBug("network timeout"), false);
});
