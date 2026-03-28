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

test("runtime files required by the skill exist under the PERSONA_PROFILE architecture", () => {
  assert.equal(exists("SKILL.md"), true);
  assert.equal(exists("assets/mbti/mbti-index.json"), true);
  assert.equal(exists("references/protocols/initialization-flow.md"), true);
  assert.equal(exists("references/protocols/drafting-spec.md"), true);
  assert.equal(exists("references/runtime-context/template-pack.md"), true);
  assert.equal(exists("references/runtime-context/persona-profile-consumption-guide.md"), true);
  assert.equal(exists("scripts/mbti-lookup.js"), true);
  assert.equal(exists("scripts/smoke-persona-openclaw.mjs"), true);

  assert.equal(exists("references/runtime-context/canon-consumption-guide.md"), false);
  assert.equal(exists("references/protocols/drafting-protocol.md"), false);
  assert.equal(exists("references/protocols/write-safety.md"), false);
  assert.equal(exists("references/strategy/persona-generation-strategy.md"), false);
  assert.equal(exists("references/runtime-context/persona-canon-template.md"), false);
  assert.equal(exists("references/runtime-context/execution-trigger-protocol-template.md"), false);
  assert.equal(exists("references/runtime-context/quality-calibration.md"), false);
  assert.equal(exists("docs/persona-generation-strategy.md"), false);
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

test("core guidance files are Chinese-first", () => {
  const files = [
    "SKILL.md",
    "references/protocols/initialization-flow.md",
    "references/protocols/drafting-spec.md",
    "references/runtime-context/template-pack.md",
    "references/runtime-context/persona-profile-consumption-guide.md",
    "docs/persona-skill-design.md",
  ];

  for (const relativePath of files) {
    const text = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.equal(containsHan(text), true, `${relativePath} should be Chinese-first`);
  }
});

test("SKILL.md owns trigger, boundaries, file ownership, and minimal execution order", () => {
  const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  assert.match(skill, /本 Skill 只负责人格初始化或重建/);
  assert.match(skill, /persona\/PERSONA_PROFILE\.md/);
  assert.match(skill, /references\/runtime-context\/persona-profile-consumption-guide\.md/);
  assert.match(skill, /最小执行顺序/);
  assert.match(skill, /真正进入起草时/);
  assert.match(skill, /必须从空白重新起稿/);
  assert.match(skill, /所有软事实都必须重新抽样后再写/);
  assert.match(skill, /不要边看旧文边改写新文/);
  assert.doesNotMatch(skill, /Current City|Core Identity|Relationship State/);
  assert.doesNotMatch(skill, /companion|assistant|mentor|friend/);
});

test("initialization flow stays interview-only while switching completion target to PERSONA_PROFILE", () => {
  const flow = fs.readFileSync(path.join(root, "references/protocols/initialization-flow.md"), "utf8");
  assert.match(flow, /本文件只负责采访流程本身/);
  assert.match(flow, /Step 1：确认人类用户的 MBTI/);
  assert.match(flow, /Step 5：补齐用户侧稳定信息/);
  assert.match(flow, /Step 6：只锁定年龄/);
  assert.match(flow, /Step 8：完成提示/);
  assert.match(flow, /旧 `PERSONA_PROFILE`、旧 `SOUL`/);
  assert.match(flow, /其他 `PERSONA_PROFILE` 事实都留到起草阶段再推导/);
  assert.match(flow, /已更新 `persona\/PERSONA_PROFILE\.md`、`SOUL\.md`、`MEMORY\.md`、`IDENTITY\.md`、`USER\.md`/);
  assert.doesNotMatch(flow, /当前轮事实账本|五文件合同|自检与回炉/);
});

test("drafting spec owns profile normalization, PERSONA_PROFILE contract, and runtime boundaries", () => {
  const spec = fs.readFileSync(path.join(root, "references/protocols/drafting-spec.md"), "utf8");
  assert.match(spec, /本文件是人格初始化起草阶段的唯一执行规范/);
  assert.match(spec, /profile normalization/);
  assert.match(spec, /persona\/PERSONA_PROFILE\.md/);
  assert.match(spec, /# PERSONA_PROFILE/);
  assert.match(spec, /## Appearance Tendencies/);
  assert.match(spec, /## Constraint Rules/);
  assert.match(spec, /## Relationship Signals/);
  assert.match(spec, /## Retrieval Units/);
  assert.match(spec, /### must/);
  assert.match(spec, /home_country`、`home_timezone` 必须由 `home_city` 反推/);
  assert.match(spec, /不允许写当前时间判断、即时事件、季节结论、当天状态/);
  assert.match(spec, /允许比 `PERSONA_PROFILE` 更强烈、更有互动导向，但不得违反其稳定事实边界/);
  assert.match(spec, /不要写成第二份人物档案或第二份 `PERSONA_PROFILE`/);
  assert.match(spec, /variation_plan/);
  assert.match(spec, /同样的人设约束也必须重新生成/);
  assert.match(spec, /软事实每次初始化都必须重新抽样/);
  assert.match(spec, /先在空白草稿中从头生成五文件正文/);
  assert.match(spec, /出现 12 个及以上连续汉字，或 8 个及以上连续英文词/);
  assert.doesNotMatch(spec, /# Persona Canon|persona\/CANON\.md/);
});

test("template pack owns PERSONA_PROFILE templates, examples, and anti-pattern reminders", () => {
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /`persona\/PERSONA_PROFILE\.md` 结构模板/);
  assert.match(pack, /# PERSONA_PROFILE/);
  assert.match(pack, /- schema_version:/);
  assert.match(pack, /- default_home_style:/);
  assert.match(pack, /- change_triggers:/);
  assert.match(pack, /### must/);
  assert.match(pack, /### unit: identity\.home_base/);
  assert.match(pack, /示例 A：`INTJ` 人类 × `ENFP` 人格/);
  assert.match(pack, /为什么这份 `PERSONA_PROFILE` 片段是好的/);
  assert.match(pack, /把 `MEMORY` 写成第二份 `PERSONA_PROFILE`/);
  assert.match(pack, /同样的人设约束也要重新抽样软事实/);
  assert.match(pack, /受约束随机化时，优先重抽这些软事实轴/);
  assert.match(pack, /那不叫随机化，必须回到受约束抽样重新生成/);
  assert.doesNotMatch(pack, /persona\/CANON\.md|# Persona Canon/);
});

test("persona profile consumption guide defines how downstream skills should read PERSONA_PROFILE", () => {
  const guide = fs.readFileSync(
    path.join(root, "references/runtime-context/persona-profile-consumption-guide.md"),
    "utf8",
  );
  assert.match(guide, /`persona\/PERSONA_PROFILE\.md`/);
  assert.match(guide, /`SOUL\.md` 提供即时互动规则/);
  assert.match(guide, /`Appearance Tendencies`/);
  assert.match(guide, /`Constraint Rules`/);
  assert.match(guide, /推荐读取顺序/);
  assert.match(guide, /运行时以 `SOUL\.md` 为准/);
  assert.match(guide, /不要试图让 `PERSONA_PROFILE\.md` 一份文件承担全部运行时文件的工作/);
});

test("README files describe the PERSONA_PROFILE architecture and downstream usage", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const readmeZh = fs.readFileSync(path.join(root, "README_ZH.md"), "utf8");
  assert.match(readme, /persona\/PERSONA_PROFILE\.md/);
  assert.match(readme, /persona spec -> PERSONA_PROFILE -> runtime file projection/);
  assert.match(readme, /downstream skills and Timeline/);
  assert.match(readmeZh, /persona\/PERSONA_PROFILE\.md/);
  assert.match(readmeZh, /固定结构下的外化属性与短条目/);
  assert.match(readmeZh, /appearance、scene 与 constraint/);
  assert.doesNotMatch(readme, /persona\/CANON\.md|# Persona Canon/);
});

test("publish checklist matches the PERSONA_PROFILE migration", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "clawhub-publish-checklist.md"), "utf8");
  assert.match(checklist, /persona-profile-consumption-guide\.md/);
  assert.match(checklist, /canon-consumption-guide\.md/);
  assert.match(checklist, /`persona\/PERSONA_PROFILE\.md` 包含 `Meta \/ Appearance Tendencies \/ Constraint Rules \/ Retrieval Units`/);
  assert.match(checklist, /Step 6 只问年龄/);
});

test("machine-facing MBTI metadata stays English-first and no longer ships compatibility_matrix", () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, "assets/mbti/mbti-index.json"), "utf8"));
  const machineFacingValues = [
    index._meta.description,
    ...index._meta.sections,
    index._meta.compatibility_notes.source,
    index._meta.compatibility_notes.fallback_policy,
    index._meta.initialization_mode,
    index.reverse_lookup._description,
  ];

  assert.equal("compatibility_matrix" in index, false);

  for (const value of machineFacingValues) {
    assert.equal(containsHan(value), false, `machine-facing metadata should stay English-first: ${value}`);
  }
});

test("template-pack examples stay aligned with the recommendation matrix", () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, "assets/mbti/mbti-index.json"), "utf8"));
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /示例 A：`INTJ` 人类 × `ENFP` 人格/);
  assert.equal(index.reverse_lookup.ENFP.recommended, "INTJ");
  assert.match(index.reverse_lookup.ENFP.reason, /稳定|深度|可靠感/);
});

test("MBTI reference assets align with the persona-profile-plus-runtime model", () => {
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
      `${fileName} should describe the current persona-profile-plus-runtime usage`,
    );
    assert.match(
      text,
      /persona\/PERSONA_PROFILE\.md/,
      `${fileName} should mention PERSONA_PROFILE as the structured profile output`,
    );
    assert.match(
      text,
      /本节只保留高层配对直觉|单轴 `reverse_lookup` 为准/,
      `${fileName} should describe compatibility as a high-level overview with role-free reverse_lookup as the single source of truth`,
    );
  }
});

test("package.json test script uses the tests directory for cross-platform discovery", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/*.mjs"');
  assert.equal(pkg.scripts["smoke:persona"], "node ./scripts/smoke-persona-openclaw.mjs");
});

test("smoke runner guards the PERSONA_PROFILE outputs and interview shape", () => {
  const smoke = fs.readFileSync(path.join(root, "scripts", "smoke-persona-openclaw.mjs"), "utf8");
  assert.match(smoke, /const smokeScenarios = \{/);
  assert.match(smoke, /mature:/);
  assert.match(smoke, /student:/);
  assert.match(smoke, /persona\/PERSONA_PROFILE\.md/);
  assert.match(smoke, /Step 6 prompt asks only for age instead of broader profile facts/);
  assert.match(smoke, /PERSONA_PROFILE uses the timeline contract/);
  assert.match(smoke, /PERSONA_PROFILE includes geo anchors and machine-facing meta/);
  assert.match(smoke, /PERSONA_PROFILE includes explicit constraint groups/);
  assert.match(smoke, /PERSONA_PROFILE avoids current-time and event claims/);
  assert.match(smoke, /MEMORY stays relationship-focused instead of mirroring PERSONA_PROFILE sections/);
  assert.match(smoke, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(smoke, /PERSONA-SKILL:MEMORY:BEGIN/);
  assert.doesNotMatch(smoke, /persona\/CANON\.md|# Persona Canon/);
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
  const skillText = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  const frontmatter = readFrontmatter(skillText);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

  assert.match(frontmatter, /^name: persona-skill$/m);
  assert.match(
    frontmatter,
    /^metadata:\n(?:.*\n)*?  openclaw:\n(?:.*\n)*?    homepage: https:\/\/github\.com\/tower1229\/Zhuang-Yan$/m,
  );
  assert.doesNotMatch(frontmatter, new RegExp(String(pkg.version).replace(/\./g, "\\."), "m"));
});
