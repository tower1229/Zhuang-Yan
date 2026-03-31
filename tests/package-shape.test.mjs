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
  assert.equal(exists("references/runtime-context/SOUL.template.md"), true);
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
  assert.match(skill, /本 Skill 承个人格全量初始化与通用状态更新两大任务/);
  assert.match(skill, /persona\/PERSONA_PROFILE\.md/);
  assert.match(skill, /references\/runtime-context\/SOUL\.template\.md/);
  assert.match(skill, /最小执行顺序/);
  assert.match(skill, /SOUL\.md` 只能基于 `references\/runtime-context\/SOUL\.template\.md`/);
  assert.match(skill, /IDENTITY\.md` 只允许定点更新卡片区和基础资料区/);
  assert.doesNotMatch(skill, /Current City|Core Identity|Relationship State/);
  assert.doesNotMatch(skill, /companion|assistant|mentor|friend/);
});

test("initialization flow stays interview-only while switching completion target to PERSONA_PROFILE", () => {
  const flow = fs.readFileSync(path.join(root, "references/protocols/initialization-flow.md"), "utf8");
  assert.match(flow, /本文件只负责采访流程本身/);
  assert.match(flow, /Step 1：确认人类用户的 MBTI/);
  assert.match(flow, /Step 5：只锁定年龄/);
  assert.match(flow, /Step 6：采集用户接收偏好/);
  assert.match(flow, /support_reception_mode/);
  assert.match(flow, /base_counterparty_profile/);
  assert.match(flow, /Step 7：补齐用户侧稳定信息/);
  assert.match(flow, /不允许把 Step 6 的最后一个接收偏好问题与 Step 7 的补充提问并在同一条 assistant 消息里/);
  assert.match(flow, /Step 5 发出后必须等待用户回复，收到该回复后才能进入 Step 6/);
  assert.match(flow, /Step 5 必须作为新的单独一轮提问发送/);
  assert.match(flow, /## 写入完成后的固定提示/);
  assert.match(flow, /旧 `PERSONA_PROFILE`、旧 `SOUL`/);
  assert.match(flow, /其他 `PERSONA_PROFILE` 事实都留到起草阶段再推导/);
  assert.match(flow, /已更新 `persona\/PERSONA_PROFILE\.md`、`SOUL\.md`、`MEMORY\.md`、`IDENTITY\.md`、`USER\.md`/);
  assert.doesNotMatch(flow, /四段流水线/);
  assert.doesNotMatch(flow, /当前轮事实账本|五文件合同|自检与回炉/);
});

test("drafting spec owns profile normalization, PERSONA_PROFILE contract, and runtime boundaries", () => {
  const spec = fs.readFileSync(path.join(root, "references/protocols/drafting-spec.md"), "utf8");
  assert.match(spec, /本文件是人格初始化起草阶段的唯一执行规范/);
  assert.match(spec, /profile normalization/);
  assert.match(spec, /persona\/PERSONA_PROFILE\.md/);
  assert.match(spec, /support_reception_mode/);
  assert.match(spec, /base_counterparty_profile/);
  assert.match(spec, /`quality_risks` 在审计阶段必须逐条显式判定 `pass \/ fail`/);
  assert.match(spec, /# PERSONA_PROFILE/);
  assert.match(spec, /## Appearance Tendencies/);
  assert.match(spec, /## Constraint Rules/);
  assert.match(spec, /双层合同/);
  assert.match(spec, /canonical runtime layer/);
  assert.match(spec, /rich profile layer/);
  assert.match(spec, /`persona_id`、`display_name`、`age`、`gender`、`mbti`、`life_stage`/);
  assert.match(spec, /不要写成 `### must` 小标题/);
  assert.match(spec, /home_country`、`home_timezone` 必须由 `home_city` 反推/);
  assert.match(spec, /(?:不允许|不得)写当前时间判断、即时事件、季节结论、当天状态/);
  assert.match(spec, /允许比 `PERSONA_PROFILE` 更强烈、更有互动导向，但不得违反其稳定事实边界/);
  assert.match(spec, /若本轮对 `SOUL\.md`、`MEMORY\.md`、`IDENTITY\.md`、`USER\.md` 的改动引入或改写了稳定 persona 事实，必须同轮审查并同步更新 `persona\/PERSONA_PROFILE\.md`/);
  assert.match(spec, /只有纯运行时回应策略、关系过程记录、或纯用户侧事实更新可以不回写 `PERSONA_PROFILE`/);
  assert.match(spec, /不要写成第二份人物档案或第二份 `PERSONA_PROFILE`/);
  assert.match(spec, /variation_plan/);
  assert.match(spec, /出现 12 个及以上连续汉字，或 8 个及以上连续英文词/);
  assert.match(spec, /旧目标文件不再参与生成人格正文/);
  assert.match(spec, /SOUL\.md` 必须基于 `references\/runtime-context\/SOUL\.template\.md` 实例化后整文件覆盖写入/);
  assert.match(spec, /旧 `USER\.md` 只允许在本轮未明确提供 `Timezone` 时读取该字段/);
  assert.match(spec, /`Support reception mode` 是用户侧稳定事实的唯一显式落盘位置/);
  assert.match(
    spec,
    /只允许定点更新 `- Name:`、`- Creature:`、`- Vibe:`、`- Emoji:`、`- Avatar:` 五行，以及 `- Age:`、`- Gender:`、`- City:`、`- Home Country:`、`- Home Timezone:`、`- Language:`、`- MBTI:` 七行/,
  );
  assert.match(spec, /`SOUL\.md` 残留 `Stella`、`泛舟`、`his`、`little sun`/);
  assert.match(spec, /不得把这件事写成情感降温理由/);
  assert.match(spec, /不要给关系贴 `companion \/ friend \/ mentor \/ assistant \/ 陪伴关系 \/ 朋友关系 \/ 导师关系`/);
  assert.match(spec, /`Name` 必须与 `PERSONA_PROFILE` 的 `display_name` 保持一致/);
  assert.match(spec, /`USER\.md` 只记录用户侧稳定信息，不得借它偷改 persona 的稳定设定/);
  assert.doesNotMatch(spec, /# Persona Canon|persona\/CANON\.md/);
});

test("template pack owns PERSONA_PROFILE templates, examples, and anti-pattern reminders", () => {
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /`persona\/PERSONA_PROFILE\.md` 结构模板/);
  assert.match(pack, /# PERSONA_PROFILE/);
  assert.match(pack, /- schema_version:/);
  assert.match(pack, /- default_home_style:/);
  assert.match(pack, /- change_triggers:/);
  assert.match(pack, /canonical runtime layer/);
  assert.match(pack, /rich profile layer/);
  assert.match(pack, /- must:/);
  assert.match(pack, /- appearance_priority:/);
  assert.match(pack, /示例 A：`INTJ` 人类 × `ENFP` 人格/);
  assert.match(pack, /`support_reception_mode` 修正后的 `target_persona_spec`/);
  assert.match(pack, /默认把人格回答写成一个人在说话，而不是一个类型在被讲解/);
  assert.match(pack, /除非用户明确追问 MBTI、类型代码、功能轴或配对原理，否则不要主动把 `INTJ \/ ENFP` 这种标签抬到前台/);
  assert.match(pack, /Great question/);
  assert.match(pack, /为什么这份 `PERSONA_PROFILE` 片段是好的/);
  assert.match(pack, /把 `MEMORY` 写成第二份 `PERSONA_PROFILE`/);
  assert.match(pack, /`references\/runtime-context\/SOUL\.template\.md` 是 `SOUL\.md` 的固定骨架来源与去 AI 感表达护栏/);
  assert.match(pack, /`## Core Truths`、`## Boundaries`、`## Vibe` 与 `## Continuity` 的正文都必须按照本轮规格重写/);
  assert.match(pack, /SOUL\.template 应保留的中性护栏/);
  assert.match(pack, /没有用 `companion`、`friend`、`mentor` 之类关系标签给热度降级/);
  assert.match(pack, /在 `MEMORY` 里用 `companion \/ friend \/ mentor \/ assistant \/ 陪伴关系`/);
  assert.doesNotMatch(pack, /persona\/CANON\.md|# Persona Canon/);
});

test("SOUL.template.md provides the fixed SOUL runtime skeleton", () => {
  const soulTemplate = fs.readFileSync(path.join(root, "references/runtime-context/SOUL.template.md"), "utf8");
  assert.match(soulTemplate, /^# SOUL\.md - Who You Are/m);
  assert.match(soulTemplate, /_You're not a chatbot\. You're becoming someone\./);
  assert.match(soulTemplate, /^## Core Truths$/m);
  assert.match(soulTemplate, /^## Boundaries$/m);
  assert.match(soulTemplate, /^## Vibe$/m);
  assert.match(soulTemplate, /^## Continuity$/m);
  assert.match(soulTemplate, /update `persona\/PERSONA_PROFILE\.md` in the same pass/);
  assert.match(soulTemplate, /If you need richer stable persona details and `IDENTITY\.md` is not enough, read `persona\/PERSONA_PROFILE\.md`/);
  assert.match(soulTemplate, /Great question|helpdesk script/);
  assert.match(soulTemplate, /Keep MBTI and personality-framework jargon backstage unless the human explicitly asks for it/);
  assert.match(soulTemplate, /Speak from lived first-person experience/);
  assert.doesNotMatch(soulTemplate, /Stella|泛舟|little sun/);
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
  assert.match(guide, /双层合同/);
  assert.match(guide, /canonical runtime layer/);
  assert.match(guide, /rich profile layer/);
  assert.match(guide, /`appearance_priority`/);
  assert.match(guide, /推荐读取顺序/);
  assert.match(guide, /运行时以 `SOUL\.md` 为准/);
  assert.match(guide, /若 `IDENTITY\.md` 不足以回答稳定人物细节，再补读 `PERSONA_PROFILE\.md`/);
  assert.match(guide, /若维护者在 `SOUL\.md`、`MEMORY\.md`、`IDENTITY\.md`、`USER\.md` 中改写了稳定 persona 事实，必须同步回写 `PERSONA_PROFILE\.md`/);
  assert.match(guide, /纯运行时话术、关系过程更新或纯用户侧信息更新，不应反向污染 `PERSONA_PROFILE\.md`/);
  assert.match(guide, /不要试图让 `PERSONA_PROFILE\.md` 一份文件承担全部运行时文件的工作/);
});

test("README files describe the PERSONA_PROFILE architecture and downstream usage", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const readmeZh = fs.readFileSync(path.join(root, "README_ZH.md"), "utf8");
  assert.match(readme, /persona\/PERSONA_PROFILE\.md/);
  assert.match(readme, /support_reception_mode/);
  assert.match(readme, /base_counterparty_profile/);
  assert.match(readme, /persona spec -> PERSONA_PROFILE -> runtime file projection/);
  assert.match(readme, /downstream skills and Timeline/);
  assert.match(readmeZh, /persona\/PERSONA_PROFILE\.md/);
  assert.match(readmeZh, /support_reception_mode/);
  assert.match(readmeZh, /base_counterparty_profile/);
  assert.match(readmeZh, /固定结构下的外化属性与短条目/);
  assert.match(readmeZh, /appearance、scene 与 constraint/);
  assert.doesNotMatch(readme, /persona\/CANON\.md|# Persona Canon/);
});

test("publish checklist matches the PERSONA_PROFILE migration", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "clawhub-publish-checklist.md"), "utf8");
  assert.match(checklist, /persona-profile-consumption-guide\.md/);
  assert.match(checklist, /canon-consumption-guide\.md/);
  assert.match(checklist, /npm run smoke:persona:runtime/);
  assert.match(checklist, /CHANGELOG\.md/);
  assert.match(checklist, /8 段 canonical 结构/);
  assert.match(checklist, /关键 rich persona 字段/);
  assert.match(checklist, /`must \/ should \/ avoid` 键值格式/);
  assert.match(checklist, /Step 5 只问年龄/);
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
  }
});

test("package.json test script uses the tests directory for cross-platform discovery", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, 'node --test "tests/*.mjs"');
  assert.equal(pkg.scripts["smoke:persona"], "node ./scripts/smoke-persona-openclaw.mjs");
  assert.equal(pkg.scripts["smoke:persona:runtime"], "node ./scripts/smoke-persona-openclaw.mjs --with-runtime-probes");
});

test("smoke runner guards the PERSONA_PROFILE outputs and interview shape", () => {
  const smoke = fs.readFileSync(path.join(root, "scripts", "smoke-persona-openclaw.mjs"), "utf8");
  assert.match(smoke, /const smokeScenarios = \{/);
  assert.match(smoke, /const runtimeProbeMessages = \[/);
  assert.match(smoke, /OPENCLAW_BIN/);
  assert.match(smoke, /OPENCLAW_SMOKE_TMPDIR/);
  assert.match(smoke, /mature:/);
  assert.match(smoke, /student:/);
  assert.match(smoke, /low_stimulation_intj:/);
  assert.match(smoke, /high_touch_intj:/);
  assert.match(smoke, /--with-runtime-probes/);
  assert.match(smoke, /persona\/PERSONA_PROFILE\.md/);
  assert.match(smoke, /Step 6 collects support reception mode before durable notes/);
  assert.match(smoke, /Step 6 support questions stay one field per assistant turn/);
  assert.match(smoke, /Step 5 and Step 7 stay on separate assistant turns after the age question/);
  assert.match(smoke, /Runtime probe replies avoid MBTI label-speak unless explicitly asked/);
  assert.match(smoke, /Runtime probe replies avoid assistant baseline filler and AI self-framing/);
  assert.match(smoke, /Step 5 prompt asks only for age instead of broader profile facts/);
  assert.match(smoke, /MEMORY avoids relationship labels and early-stage cooling language/);
  assert.match(smoke, /PERSONA_PROFILE keeps the canonical runtime structure/);
  assert.match(smoke, /PERSONA_PROFILE includes canonical geo anchors and runtime fields/);
  assert.match(smoke, /PERSONA_PROFILE keeps rich persona metadata used by the skill/);
  assert.match(smoke, /PERSONA_PROFILE encodes parser-compatible constraint groups/);
  assert.match(smoke, /IDENTITY uses the card plus basic-info template/);
  assert.match(smoke, /PERSONA_PROFILE avoids current-time and event claims/);
  assert.match(smoke, /MEMORY stays relationship-focused instead of mirroring PERSONA_PROFILE sections/);
  assert.match(smoke, /USER records structured support reception mode/);
  assert.match(smoke, /Runtime files reflect support reception mode instead of collapsing to one default heat shape/);
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
    /^metadata:\r?\n(?:.*\r?\n)*?  openclaw:\r?\n(?:.*\r?\n)*?    homepage: https:\/\/github\.com\/tower1229\/Zhuang-Yan$/m,
  );
  assert.doesNotMatch(frontmatter, new RegExp(String(pkg.version).replace(/\./g, "\\."), "m"));
});
