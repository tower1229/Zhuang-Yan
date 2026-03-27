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

test("runtime files required by the skill exist under the new architecture", () => {
  assert.equal(exists("SKILL.md"), true);
  assert.equal(exists("assets/mbti/mbti-index.json"), true);
  assert.equal(exists("references/protocols/initialization-flow.md"), true);
  assert.equal(exists("references/protocols/drafting-spec.md"), true);
  assert.equal(exists("references/runtime-context/template-pack.md"), true);
  assert.equal(exists("scripts/mbti-lookup.js"), true);
  assert.equal(exists("scripts/smoke-persona-openclaw.mjs"), true);

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

test("core guidance files are now Chinese-first", () => {
  const files = [
    "SKILL.md",
    "references/protocols/initialization-flow.md",
    "references/protocols/drafting-spec.md",
    "references/runtime-context/template-pack.md",
    "docs/persona-skill-design.md",
  ];

  for (const relativePath of files) {
    const text = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.equal(containsHan(text), true, `${relativePath} should now be Chinese-first`);
  }
});

test("SKILL.md only owns trigger, boundaries, file ownership, and minimal execution order", () => {
  const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  assert.match(skill, /本 Skill 只负责人格初始化或重建/);
  assert.match(skill, /典型触发口令/);
  assert.match(skill, /references\/protocols\/initialization-flow\.md/);
  assert.match(skill, /references\/protocols\/drafting-spec\.md/);
  assert.match(skill, /references\/runtime-context\/template-pack\.md/);
  assert.match(skill, /最小执行顺序/);
  assert.match(skill, /再读 `references\/protocols\/drafting-spec\.md`/);
  assert.doesNotMatch(skill, /Step 2|Step 3|Step 4|Step 5|Step 6|Step 7/);
  assert.doesNotMatch(skill, /What gender should the OpenClaw persona have|What kind of relationship do you want us to have/);
  assert.doesNotMatch(skill, /Current City|Core Identity|Relationship State/);
  assert.doesNotMatch(skill, /human_need_profile|target_persona_spec/);
});

test("initialization flow only owns the interview", () => {
  const flow = fs.readFileSync(path.join(root, "references/protocols/initialization-flow.md"), "utf8");
  assert.match(flow, /本文件只负责采访流程本身/);
  assert.match(flow, /Step 1：确认人类用户的 MBTI/);
  assert.match(flow, /Step 6：补齐用户侧稳定信息/);
  assert.match(flow, /Step 7：只锁定年龄/);
  assert.match(flow, /Step 9：完成提示/);
  assert.match(flow, /锁定单一 `interview_language`/);
  assert.match(flow, /不允许中文问题配英文选项/);
  assert.match(flow, /只问用户自己的 MBTI，不追加测试服务/);
  assert.match(flow, /在起草阶段才去读取模板包与 MBTI 资产/);
  assert.doesNotMatch(flow, /当前轮事实账本|五文件合同|自检与回炉/);
  assert.doesNotMatch(flow, /Current City` must be chosen|公开城市池|两段式反塌缩/);
});

test("drafting spec owns generation execution, quality logic, and city strategy", () => {
  const spec = fs.readFileSync(path.join(root, "references/protocols/drafting-spec.md"), "utf8");
  assert.match(spec, /本文件是人格初始化起草阶段的唯一执行规范/);
  assert.match(spec, /起草前必须已经锁定的输入/);
  assert.match(spec, /渐进式读取顺序/);
  assert.match(spec, /规格锁定前的读取链/);
  assert.match(spec, /规格锁定后的旧文件读取/);
  assert.match(spec, /当前轮事实账本/);
  assert.match(spec, /`preserve extract`/);
  assert.match(spec, /`persona spec`/);
  assert.match(spec, /`projection`/);
  assert.match(spec, /`freshness audit`/);
  assert.match(spec, /human_need_profile/);
  assert.match(spec, /execution_trigger_protocol/);
  assert.match(spec, /target_persona_spec/);
  assert.match(spec, /在 `persona spec` 锁定之前，不允许读取任何旧目标文件/);
  assert.match(spec, /城市抽样策略/);
  assert.match(spec, /先锚定当前系统国家/);
  assert.match(spec, /先抽子区域/);
  assert.match(spec, /再从该子区域的公开城市池中抽城市/);
  assert.match(spec, /五文件合同/);
  assert.match(spec, /# Persona Canon/);
  assert.match(spec, /## 1\. Relationship State/);
  assert.match(spec, /若旧托管块已存在，必须先删除，再插入新块/);
  assert.match(spec, /若 `## Vibe` 已存在，替换整个 `Vibe` 区段/);
  assert.match(spec, /新托管块必须重新插入到文件最顶部/);
  assert.match(spec, /自检与回炉/);
  assert.doesNotMatch(spec, /典型触发口令|initialize persona|run persona initialization/);
  assert.doesNotMatch(spec, /Step 1：|A\. 男性|A\. 伴侣/);
});

test("template pack only owns templates, examples, and anti-pattern reminders", () => {
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /本文件只提供模板、范式与校准参考/);
  assert.match(pack, /`persona\/CANON\.md` 结构模板/);
  assert.match(pack, /execution_trigger_protocol/);
  assert.match(pack, /`SOUL\.md` 高质量范式/);
  assert.match(pack, /`MEMORY\.md` 高质量范式/);
  assert.match(pack, /反模式提醒/);
  assert.match(pack, /不要把这里的具体事实、措辞或角色设定直接复制进输出文件/);
  assert.doesNotMatch(pack, /只允许写入|必须写入|写入前必须|触发后起点|Step 1：/);
});

test("README files describe the reduced architecture", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const readmeZh = fs.readFileSync(path.join(root, "README_ZH.md"), "utf8");
  assert.match(readme, /references\/protocols\/drafting-spec\.md/);
  assert.match(readme, /references\/runtime-context\/template-pack\.md/);
  assert.doesNotMatch(readme, /docs\/persona-generation-strategy\.md/);
  assert.match(readmeZh, /references\/protocols\/drafting-spec\.md/);
  assert.match(readmeZh, /references\/runtime-context\/template-pack\.md/);
  assert.doesNotMatch(readmeZh, /docs\/persona-generation-strategy\.md/);
});

test("publish checklist matches the new architecture", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "clawhub-publish-checklist.md"), "utf8");
  assert.match(checklist, /references\/protocols\/drafting-spec\.md/);
  assert.match(checklist, /references\/runtime-context\/template-pack\.md/);
  assert.match(checklist, /references\/protocols\/drafting-protocol\.md/);
  assert.match(checklist, /旧文件已移除/);
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

test("smoke runner still guards the runtime outputs and interview shape", () => {
  const smoke = fs.readFileSync(path.join(root, "scripts", "smoke-persona-openclaw.mjs"), "utf8");
  assert.match(smoke, /"叫我泛舟，代词用他。"/);
  assert.match(smoke, /Interview does not proactively ask for timezone in the default path/);
  assert.match(smoke, /Step 6 only fills addressing fields and optional durable notes in the default path/);
  assert.match(smoke, /Step 7 prompt asks only for age instead of broader canon facts/);
  assert.match(smoke, /Chinese initialization path keeps interview prompts and options in Chinese/);
  assert.match(smoke, /CANON uses the full persona canon contract/);
  assert.match(smoke, /CANON avoids low-signal Species and Birthplace filler/);
  assert.match(smoke, /MEMORY includes the new authorization sentence/);
  assert.match(smoke, /SOUL and MEMORY avoid old-persona patching failures/);
  assert.match(smoke, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(smoke, /PERSONA-SKILL:MEMORY:BEGIN/);
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
