import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))), "..");

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

test("runtime files required by the skill exist", () => {
  assert.equal(exists("SKILL.md"), true);
  assert.equal(exists("data/mbti/mbti-index.json"), true);
  assert.equal(exists("references/initialization-flow.md"), true);
  assert.equal(exists("references/write-safety.md"), true);
  assert.equal(exists("references/persona-generation-strategy.md"), true);
  assert.equal(exists("scripts/mbti-lookup.js"), true);
});

test(".clawhubignore excludes maintainer-only files", () => {
  const ignore = fs.readFileSync(path.join(root, ".clawhubignore"), "utf8");
  assert.match(ignore, /^README\.md$/m);
  assert.match(ignore, /^docs\/$/m);
  assert.match(ignore, /^tests\/$/m);
  assert.match(ignore, /^scripts\/release-clawhub\.mjs$/m);
});

test("SKILL.md requires the shipped persona generation strategy", () => {
  const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  assert.match(skill, /references\/persona-generation-strategy\.md/);
});