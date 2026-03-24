import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  TEST_TARGET,
  buildCommandSpec,
  detectPublisherBootstrapBug,
  parseArgs,
  quoteWin,
  readPackageVersion,
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
});

test("release script uses the tests directory for pre-publish validation", () => {
  assert.equal(TEST_TARGET, "tests");
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

test("detectPublisherBootstrapBug matches the ClawHub backend error", () => {
  const output = `Error: Uncaught Error: This query or mutation function ran multiple paginated queries.\n    at async ensurePersonalPublisherForUser (../../convex/lib/publishers.ts:169:14)`;
  assert.equal(detectPublisherBootstrapBug(output), true);
});

test("detectPublisherBootstrapBug ignores unrelated errors", () => {
  assert.equal(detectPublisherBootstrapBug("network timeout"), false);
});
