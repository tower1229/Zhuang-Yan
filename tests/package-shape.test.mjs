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
  assert.equal(exists("references/examples/persona-drafting-examples.md"), true);
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
  assert.match(skill, /always restart the interview from Step 1/);
  assert.match(skill, /inspect the existing `USER\.md` first/);
  assert.match(skill, /If `What to call them`, `Pronouns`, or `Timezone` is blank or missing, explicitly ask/);
  assert.match(skill, /Missing target files and legacy placeholder files are not something to "work around"/);
  assert.match(skill, /Do not read `references\/examples\/` during normal initialization/);
  assert.match(skill, /Treat `SOUL\.md` and `MEMORY\.md` as section-owned files/);
  assert.match(skill, /Treat `IDENTITY\.md` and `USER\.md` as whole-file-owned files/);
  assert.match(skill, /Never ask to edit, delete, or clean up `BOOTSTRAP\.md`, `AGENTS\.md`/);
  assert.doesNotMatch(skill, /timeline-skill|timeline-plugin|selfiie-skill/);
});

test("initialization flow encodes the current interview constraints", () => {
  const flow = fs.readFileSync(path.join(root, "references/initialization-flow.md"), "utf8");
  assert.match(flow, /Do not proactively append extra copy offering MBTI testing/);
  assert.match(flow, /always start a fresh initialization interview from Step 1/);
  assert.match(flow, /Do not begin by summarizing the old persona/);
  assert.match(flow, /Do not ask the user whether they accept the recommendation/);
  assert.match(flow, /All 3 candidates must be English given names/);
  assert.match(flow, /inspect the existing `USER\.md` if it exists/);
  assert.match(flow, /if `Pronouns` is blank or missing, explicitly ask/);
  assert.match(flow, /if `Timezone` is blank or missing, explicitly ask/);
  assert.match(flow, /leave it blank rather than guessing/);
  assert.match(flow, /if any target file is missing, create it during this initialization run/);
  assert.match(flow, /do not preserve legacy template wrappers/);
  assert.match(flow, /must satisfy the current contract from its first non-empty line onward/);
  assert.match(flow, /do not ask whether unrelated files such as `BOOTSTRAP\.md` should be deleted or changed/);
  assert.match(flow, /read `references\/mbti\/<persona_mbti>\.md`/);
  assert.match(flow, /self-review gate from `drafting-protocol\.md`/);
});

test("drafting protocol hardens the four-file generation contract", () => {
  const protocol = fs.readFileSync(path.join(root, "references", "drafting-protocol.md"), "utf8");
  assert.match(protocol, /references\/mbti\/<persona_mbti>\.md/);
  assert.match(protocol, /current-turn fact ledger/);
  assert.match(protocol, /explicit user facts from this interview/);
  assert.match(protocol, /treat existing `USER\.md`, `MEMORY\.md`, prior smoke outputs, and strategy examples as tainted for user facts/);
  assert.match(protocol, /carry-forward candidates from existing USER\.md/);
  assert.match(protocol, /the only fields that may enter `carry-forward candidates from existing USER\.md` are `What to call them`, `Pronouns`, and `Timezone`/);
  assert.match(protocol, /Explicit initialization intent outranks all existing persona prose, placeholder cards, and legacy scaffolds/);
  assert.match(protocol, /Treat the following as legacy scaffolds to replace, not preserve/);
  assert.match(protocol, /If one of the four target files is missing, treat that as a required regeneration task/);
  assert.match(protocol, /## 6\. File contracts/);
  assert.match(protocol, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(protocol, /PERSONA-SKILL:MEMORY:BEGIN/);
  assert.match(protocol, /the managed `Core Truths` block must live inside the `## Core Truths` section/);
  assert.match(protocol, /insert the managed `MEMORY` block at the very top of the file/);
  assert.match(protocol, /first non-empty line must be `- Name: \{English given name\}`/);
  assert.match(protocol, /first non-empty line must be `- Name: \.\.\.`/);
  assert.match(protocol, /## Core Truths/);
  assert.match(protocol, /## 一、基础信息（Identity Layer）/);
  assert.match(protocol, /exactly three bullets under `Notes`/);
  assert.match(protocol, /leave it blank instead of guessing/);
  assert.match(protocol, /the interview must explicitly ask for it before finalizing/);
  assert.match(protocol, /invents pronouns, pet names, dislikes, diagnoses, or boundaries not explicitly provided this run/);
  assert.match(protocol, /you may carry forward non-empty `What to call them`, `Pronouns`, and `Timezone` values from existing `USER\.md` only when the user does not override them in this run/);
  assert.match(protocol, /failing to generate `MEMORY\.md` because an older workspace did not already have one/);
  assert.match(protocol, /one of the four required files is missing or empty after drafting/);
  assert.match(protocol, /Never preserve or discuss edits to files outside the four target persona files/);
  assert.match(protocol, /The draft must fail and be rewritten if/);
});

test("persona generation strategy keeps the shipped guidance abstract instead of bundling a default persona", () => {
  const strategy = fs.readFileSync(path.join(root, "references", "persona-generation-strategy.md"), "utf8");
  const examples = fs.readFileSync(
    path.join(root, "references", "examples", "persona-drafting-examples.md"),
    "utf8",
  );
  assert.match(strategy, /上下文信任顺序/);
  assert.match(strategy, /示例隔离原则/);
  assert.match(strategy, /examples\/persona-drafting-examples\.md/);
  assert.doesNotMatch(strategy, /高浓度指令片段示意|骨架片段示意|^\*\*示例：\*\*$/m);
  assert.doesNotMatch(strategy, /女性伴侣\(Stella\)|真实人类女性伴侣 Stella|Stella（星籁）/);
  assert.doesNotMatch(strategy, /What to call them: 亲爱的 \/ 你/);
  assert.doesNotMatch(strategy, /Pronouns: 他/);
  assert.match(examples, /SOUL 片段示意/);
  assert.match(examples, /MEMORY 骨架示意/);
});

test("package.json test script uses the tests directory for cross-platform discovery", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/*.mjs"');
  assert.equal(pkg.scripts["smoke:persona"], "node ./scripts/smoke-persona-openclaw.mjs");
});

test("smoke runner guards against legacy wrapper leakage", () => {
  const smoke = fs.readFileSync(path.join(root, "scripts", "smoke-persona-openclaw.mjs"), "utf8");
  assert.match(smoke, /SOUL contains managed Core Truths block/);
  assert.match(smoke, /MEMORY contains managed top block and all seven required layers/);
  assert.match(smoke, /IDENTITY and USER do not retain legacy wrapper headings/);
  assert.match(smoke, /IDENTITY and USER do not retain legacy placeholder copy/);
  assert.match(smoke, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(smoke, /PERSONA-SKILL:MEMORY:BEGIN/);
  assert.match(smoke, /legacyWrapperPattern/);
  assert.match(smoke, /Fill this in during your first conversation/);
  assert.match(smoke, /About Your Human/);
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
