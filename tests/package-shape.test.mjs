import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))), "..");

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : "";
}

test("runtime files required by the skill exist", () => {
  assert.equal(exists("SKILL.md"), true);
  assert.equal(exists("assets/mbti/mbti-index.json"), true);
  assert.equal(exists("references/initialization-flow.md"), true);
  assert.equal(exists("references/drafting-protocol.md"), true);
  assert.equal(exists("references/write-safety.md"), true);
  assert.equal(exists("scripts/smoke-persona-openclaw.mjs"), true);
  assert.equal(exists("references/persona-generation-strategy.md"), true);
  assert.equal(exists("scripts/mbti-lookup.js"), true);
});

test(".clawhubignore excludes maintainer-only files", () => {
  const ignore = fs.readFileSync(path.join(root, ".clawhubignore"), "utf8");
  assert.match(ignore, /^README\.md$/m);
  assert.match(ignore, /^README_ZH\.md$/m);
  assert.match(ignore, /^CHANGELOG\.md$/m);
  assert.match(ignore, /^CONTRIBUTING\.md$/m);
  assert.match(ignore, /^LICENSE$/m);
  assert.match(ignore, /^docs\/$/m);
  assert.match(ignore, /^tests\/$/m);
  assert.match(ignore, /^scripts\/release-clawhub\.mjs$/m);
});

test("SKILL.md requires the shipped persona generation strategy", () => {
  const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  assert.match(skill, /references\/persona-generation-strategy\.md/);
  assert.match(skill, /references\/drafting-protocol\.md/);
  assert.match(skill, /references\/mbti\/<persona_mbti>\.md/);
  assert.doesNotMatch(skill, /timeline-skill|timeline-plugin|selfiie-skill/);
});

test("initialization flow encodes the current interview constraints", () => {
  const flow = fs.readFileSync(path.join(root, "references/initialization-flow.md"), "utf8");
  assert.match(flow, /Do not proactively append extra copy offering MBTI testing/);
  assert.match(flow, /Do not ask the user whether they accept the recommendation/);
  assert.match(flow, /All 3 candidates must be English given names/);
  assert.match(flow, /read `references\/mbti\/<persona_mbti>\.md`/);
  assert.match(flow, /self-review gate from `drafting-protocol\.md`/);
});

test("drafting protocol hardens the four-file generation contract", () => {
  const protocol = fs.readFileSync(path.join(root, "references", "drafting-protocol.md"), "utf8");
  assert.match(protocol, /references\/mbti\/<persona_mbti>\.md/);
  assert.match(protocol, /## 5\. File contracts/);
  assert.match(protocol, /## Core Truths/);
  assert.match(protocol, /## 一、基础信息（Identity Layer）/);
  assert.match(protocol, /exactly three bullets under `Notes`/);
  assert.match(protocol, /The draft must fail and be rewritten if/);
});

test("package.json test script uses the tests directory for cross-platform discovery", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/*.mjs"');
  assert.equal(pkg.scripts["smoke:persona"], "node ./scripts/smoke-persona-openclaw.mjs");
});

test("repository metadata files exist", () => {
  assert.equal(exists(".gitignore"), true);
  assert.equal(exists("LICENSE"), true);
  assert.equal(exists("CHANGELOG.md"), true);
  assert.equal(exists("CONTRIBUTING.md"), true);
});

test("package.json includes professional project metadata", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.license, "MIT-0");
  assert.equal(pkg.homepage, "https://github.com/tower1229/Zhuang-Yan#readme");
  assert.equal(pkg.bugs.url, "https://github.com/tower1229/Zhuang-Yan/issues");
  assert.equal(pkg.repository.type, "git");
  assert.equal(pkg.repository.url, "git+https://github.com/tower1229/Zhuang-Yan.git");
  assert.match(pkg.description, /OpenClaw persona/i);
  assert.equal(pkg.engines.node, ">=18.18");
});

test("SKILL.md frontmatter keeps homepage metadata and does not duplicate the package version", () => {
  const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  const frontmatter = readFrontmatter(skill);
  assert.doesNotMatch(frontmatter, /^version:/m);
  assert.match(frontmatter, /^    homepage: https:\/\/github\.com\/tower1229\/Zhuang-Yan$/m);
});
