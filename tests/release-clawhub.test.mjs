import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildCommandSpec, parseArgs, quoteWin, readPackageVersion } from "../scripts/release-clawhub.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("readPackageVersion returns package.json version", () => {
  assert.equal(readPackageVersion(path.join(root, "package.json")), "0.1.0");
});

test("parseArgs uses package.json version by default", () => {
  const args = parseArgs([], { defaultVersion: "0.1.0" });
  assert.equal(args.version, "0.1.0");
  assert.equal(args.tag, "latest");
});

test("quoteWin preserves spaced arguments", () => {
  assert.equal(quoteWin("Persona Skill"), '"Persona Skill"');
});

test("buildCommandSpec quotes Windows command arguments", () => {
  const spec = buildCommandSpec("clawhub", ["publish", ".", "--name", "Persona Skill"], "win32");
  assert.equal(spec.options.shell, true);
  assert.match(spec.command, /--name "Persona Skill"/);
});

test("buildCommandSpec keeps argv array on non-Windows", () => {
  const spec = buildCommandSpec("clawhub", ["publish", ".", "--name", "Persona Skill"], "linux");
  assert.equal(spec.command, "clawhub");
  assert.deepEqual(spec.args, ["publish", ".", "--name", "Persona Skill"]);
  assert.equal(spec.options.shell, false);
});