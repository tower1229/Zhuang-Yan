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

function containsHan(value) {
  return /[\p{Script=Han}]/u.test(value);
}

test("runtime files required by the skill exist", () => {
  assert.equal(exists("SKILL.md"), true);
  assert.equal(exists("assets/mbti/mbti-index.json"), true);
  assert.equal(exists("references/initialization-flow.md"), true);
  assert.equal(exists("references/drafting-protocol.md"), true);
  assert.equal(exists("references/write-safety.md"), true);
  assert.equal(exists("references/examples/persona-drafting-examples.md"), true);
  assert.equal(exists("references/templates/persona-canon-template.md"), true);
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
  assert.match(skill, /references\/templates\/persona-canon-template\.md/);
  assert.match(skill, /references\/mbti\/<persona_mbti>\.md/);
  assert.match(skill, /always restart the interview from Step 1/);
  assert.match(skill, /asking for the OpenClaw persona's gender, not the human user's gender/);
  assert.match(skill, /asking about the relationship between the user and the OpenClaw persona/);
  assert.match(skill, /What kind of relationship do you want us to have/);
  assert.match(skill, /inspect the existing `USER\.md` first/);
  assert.match(skill, /If `What to call them`, `Pronouns`, or `Timezone` is blank or missing, explicitly ask/);
  assert.match(skill, /Missing target files and legacy placeholder files are not something to "work around"/);
  assert.match(skill, /Do not read `references\/examples\/` during normal initialization/);
  assert.match(skill, /Never issue an empty `Read` call or a vague read request such as "read existing files"/);
  assert.match(skill, /Treat `SOUL\.md` and `MEMORY\.md` as section-owned files/);
  assert.match(skill, /Treat `IDENTITY\.md`, `USER\.md`, and `persona\/CANON\.md` as whole-file-owned files/);
  assert.match(skill, /Never ask to edit, delete, or clean up `BOOTSTRAP\.md`, `AGENTS\.md`/);
  assert.doesNotMatch(skill, /timeline-skill|timeline-plugin|selfiie-skill/);
});

test("initialization flow encodes the current interview constraints", () => {
  const flow = fs.readFileSync(path.join(root, "references/initialization-flow.md"), "utf8");
  assert.match(flow, /Do not proactively append extra copy offering MBTI testing/);
  assert.match(flow, /always start a fresh initialization interview from Step 1/);
  assert.match(flow, /Do not begin by summarizing the old persona/);
  assert.match(flow, /asking about the OpenClaw persona's gender, not the human user's gender/);
  assert.match(flow, /What gender should the OpenClaw persona have/);
  assert.match(flow, /asking about the relationship between the user and the OpenClaw persona/);
  assert.match(flow, /What kind of relationship do you want us to have/);
  assert.match(flow, /Do not ask the user whether they accept the recommendation/);
  assert.match(flow, /All 3 candidates must be English given names/);
  assert.match(flow, /inspect the existing `USER\.md` if it exists/);
  assert.match(flow, /if `Pronouns` is blank or missing, explicitly ask/);
  assert.match(flow, /if `Timezone` is blank or missing, explicitly ask/);
  assert.match(flow, /leave it blank rather than guessing/);
  assert.match(flow, /if any target file is missing, create it during this initialization run/);
  assert.match(flow, /do not preserve legacy template wrappers/);
  assert.match(flow, /must satisfy the current contract from its first non-empty line onward/);
  assert.match(flow, /always name the exact file path; do not use a vague "read existing files" action/);
  assert.match(flow, /if the run resumes after an interruption, redo the concrete read sequence before drafting/);
  assert.match(flow, /do not ask whether unrelated files such as `BOOTSTRAP\.md` should be deleted or changed/);
  assert.match(flow, /read `references\/mbti\/<persona_mbti>\.md`/);
  assert.match(flow, /self-review gate from `drafting-protocol\.md`/);
  assert.match(flow, /read `templates\/persona-canon-template\.md`/);
});

test("drafting protocol hardens the five-file generation contract", () => {
  const protocol = fs.readFileSync(path.join(root, "references", "drafting-protocol.md"), "utf8");
  assert.match(protocol, /references\/mbti\/<persona_mbti>\.md/);
  assert.match(protocol, /references\/templates\/persona-canon-template\.md/);
  assert.match(protocol, /current-turn fact ledger/);
  assert.match(protocol, /explicit user facts from this interview/);
  assert.match(protocol, /treat existing `USER\.md`, `MEMORY\.md`, prior smoke outputs, and strategy examples as tainted for user facts/);
  assert.match(protocol, /carry-forward candidates from existing USER\.md/);
  assert.match(protocol, /the only fields that may enter `carry-forward candidates from existing USER\.md` are `What to call them`, `Pronouns`, and `Timezone`/);
  assert.match(protocol, /Explicit initialization intent outranks all existing persona prose, placeholder cards, and legacy scaffolds/);
  assert.match(protocol, /Use concrete file reads only/);
  assert.match(protocol, /never issue an empty `Read` call/);
  assert.match(protocol, /restart this exact read sequence from the top with explicit file names/);
  assert.match(protocol, /Treat the following as legacy scaffolds to replace, not preserve/);
  assert.match(protocol, /If one of the five target files is missing, treat that as a required regeneration task/);
  assert.match(protocol, /## 6\. File contracts/);
  assert.match(protocol, /# Persona Canon/);
  assert.match(protocol, /## 1\. Core Identity/);
  assert.match(protocol, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(protocol, /PERSONA-SKILL:MEMORY:BEGIN/);
  assert.match(protocol, /the managed `Core Truths` block must live inside the `## Core Truths` section/);
  assert.match(protocol, /insert the managed `MEMORY` block at the very top of the file/);
  assert.match(protocol, /first non-empty line must be `- Name: \{English given name\}`/);
  assert.match(protocol, /first non-empty line must be `- Name: \.\.\.`/);
  assert.match(protocol, /## Core Truths/);
  assert.match(protocol, /## 1\. Relationship State/);
  assert.match(protocol, /exactly three bullets under `Notes`/);
  assert.match(protocol, /leave it blank instead of guessing/);
  assert.match(protocol, /the interview must explicitly ask for it before finalizing/);
  assert.match(protocol, /invents pronouns, pet names, dislikes, diagnoses, or boundaries not explicitly provided this run/);
  assert.match(protocol, /you may carry forward non-empty `What to call them`, `Pronouns`, and `Timezone` values from existing `USER\.md` only when the user does not override them in this run/);
  assert.match(protocol, /failing to generate `MEMORY\.md` because an older workspace did not already have one/);
  assert.match(protocol, /one of the five required files is missing or empty after drafting/);
  assert.match(protocol, /Never preserve or discuss edits to files outside the five target persona files/);
  assert.match(protocol, /The draft must fail and be rewritten if/);
});

test("persona generation strategy keeps the shipped guidance abstract instead of bundling a default persona", () => {
  const strategy = fs.readFileSync(path.join(root, "references", "persona-generation-strategy.md"), "utf8");
  const examples = fs.readFileSync(
    path.join(root, "references", "examples", "persona-drafting-examples.md"),
    "utf8",
  );
  assert.match(strategy, /Context trust order/);
  assert.match(strategy, /Example isolation/);
  assert.match(strategy, /Language layering/);
  assert.match(strategy, /examples\/persona-drafting-examples\.md/);
  assert.doesNotMatch(strategy, /Stella|real human female companion/);
  assert.doesNotMatch(strategy, /What to call them: dear/);
  assert.match(examples, /SOUL excerpt sketch/);
  assert.match(examples, /MEMORY skeleton sketch/);
});

test("execution-facing guidance files stay English-first", () => {
  const files = [
    "SKILL.md",
    "references/initialization-flow.md",
    "references/write-safety.md",
    "references/drafting-protocol.md",
    "references/persona-generation-strategy.md",
    "references/examples/persona-drafting-examples.md",
    "CONTRIBUTING.md",
  ];

  for (const relativePath of files) {
    const text = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.equal(containsHan(text), false, `${relativePath} should stay English-first`);
  }
});

test("machine-facing MBTI metadata stays English-first", () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, "assets/mbti/mbti-index.json"), "utf8"));
  const machineFacingValues = [
    index._meta.description,
    ...index._meta.sections,
    index._meta.compatibility_notes.source,
    index._meta.compatibility_notes.fallback_policy,
    index._meta.initialization_mode,
    index.compatibility_matrix._note,
    index.reverse_lookup._description,
  ];

  for (const value of machineFacingValues) {
    assert.equal(containsHan(value), false, `machine-facing metadata should stay English-first: ${value}`);
  }
});

test("MBTI reference assets align with the canon-plus-runtime model", () => {
  const mbtiDir = path.join(root, "references", "mbti");
  const files = fs.readdirSync(mbtiDir).filter((name) => name.endsWith(".md"));

  for (const fileName of files) {
    const text = fs.readFileSync(path.join(mbtiDir, fileName), "utf8");
    assert.doesNotMatch(
      text,
      /情景感知和 prompt 组装消费|人物小传生成时的气质锚定|人物小传生成和价值主张描述的背景语料/,
      `${fileName} should not describe the old runtime or biography model`,
    );
    assert.match(
      text,
      /生成辅助层|角色档案与运行时人格文件生成/,
      `${fileName} should describe the current canon-plus-runtime usage`,
    );
  }
});

test("package.json test script uses the tests directory for cross-platform discovery", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/*.mjs"');
  assert.equal(pkg.scripts["smoke:persona"], "node ./scripts/smoke-persona-openclaw.mjs");
});

test("smoke runner guards against legacy wrapper leakage", () => {
  const smoke = fs.readFileSync(path.join(root, "scripts", "smoke-persona-openclaw.mjs"), "utf8");
  assert.match(smoke, /CANON uses the full persona canon contract/);
  assert.match(smoke, /SOUL contains managed Core Truths block/);
  assert.match(smoke, /MEMORY contains managed top block and all four required sections/);
  assert.match(smoke, /IDENTITY and USER do not retain legacy wrapper headings/);
  assert.match(smoke, /IDENTITY and USER do not retain legacy placeholder copy/);
  assert.match(smoke, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(smoke, /PERSONA-SKILL:MEMORY:BEGIN/);
  assert.match(smoke, /legacyWrapperPattern/);
  assert.match(smoke, /Fill this in during your first conversation/);
  assert.match(smoke, /About Your Human/);
  assert.match(smoke, /Deep tendencies|Communication pitfalls|Open memory slot/);
  assert.match(smoke, /## 1\\\. Core Identity/);
  assert.match(smoke, /## 1\\\. Relationship State/);
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
