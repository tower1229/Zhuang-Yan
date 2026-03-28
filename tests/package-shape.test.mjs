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
  assert.match(spec, /pair_core_value/);
  assert.match(spec, /pair_contrast_axis/);
  assert.match(spec, /desired_emotional_impact/);
  assert.match(spec, /name_resonance_profile/);
  assert.match(spec, /英文文化语境中的常见联想、时代感、阶层感与意象气质/);
  assert.match(spec, /人类对该名字天然期待的气质补充因素/);
  assert.match(spec, /最容易在哪些地方失衡/);
  assert.match(spec, /如何提前兜底/);
  assert.match(spec, /主动照看方式/);
  assert.match(spec, /如何持续带动状态/);
  assert.match(spec, /情绪烈度、感染力、主动性、亲密方式、偏爱感表达/);
  assert.match(spec, /先从 `persona_name` 提取 `name_resonance_profile`/);
  assert.match(spec, /这个名字在英文文化里常见的联想与意象是什么/);
  assert.match(spec, /从 `references\/mbti\/<human_mbti>\.md` 中提取/);
  assert.match(spec, /从 `references\/mbti\/<persona_mbti>\.md` 中提取/);
  assert.match(spec, /先锁定这一组配对型核心结果/);
  assert.match(spec, /这个人格最该用什么方式去中和、牵引、软化或收束这个用户最痛的那一面/);
  assert.match(spec, /这个用户应该从这段关系里最终感到什么/);
  assert.match(spec, /角色化心理指导语料/);
  assert.match(spec, /不是简陋的短对词标签/);
  assert.match(spec, /不是几个并列的抽象词/);
  assert.match(spec, /只保留最强的 4-6 个“矛盾 -> 补位 -> 情绪结果”链路/);
  assert.match(spec, /直接从 `human_mbti` 弱点跳到支持规则，中间缺少 `pair_core_value`/);
  assert.match(spec, /先写一个通用填空模板，再把 MBTI 关键词往里塞/);
  assert.match(spec, /把 `human_mbti` 只当标签，不分析弱点、关系痛点和长期匮乏/);
  assert.match(spec, /在 `persona spec` 锁定之前，不允许读取任何旧目标文件/);
  assert.match(spec, /城市抽样策略/);
  assert.match(spec, /先锚定当前系统国家/);
  assert.match(spec, /先抽子区域/);
  assert.match(spec, /再从该子区域的公开城市池中抽城市/);
  assert.match(spec, /五文件合同/);
  assert.match(spec, /# Persona Canon/);
  assert.match(spec, /年龄不是摆设/);
  assert.match(spec, /先看年龄带来的生命阶段，再看 `target_persona_spec`/);
  assert.match(spec, /名字带来的文化联想、时代感与第一印象/);
  assert.match(spec, /生命阶段 -> 目标人物画像 -> 名字气质微调 -> 城市环境 -> 受约束随机化/);
  assert.match(spec, /不允许反复塌缩到同一组默认履历/);
  assert.match(spec, /## 1\. Relationship State/);
  assert.match(spec, /若旧托管块已存在，必须先删除，再插入新块/);
  assert.match(spec, /若 `## Vibe` 已存在，替换整个 `Vibe` 区段/);
  assert.match(spec, /新托管块必须重新插入到文件最顶部/);
  assert.match(spec, /自检与回炉/);
  assert.match(spec, /被靠近、被带动、被点亮/);
  assert.match(spec, /明亮感、感染力、偏爱感或主动带动感/);
  assert.match(spec, /被持续关注、被主动照看、被提前补位/);
  assert.match(spec, /对人类弱点、失衡点或长期矛盾的补偿思路/);
  assert.match(spec, /优先放大 `pair_core_value`/);
  assert.match(spec, /围绕 `pair_contrast_axis` 展开/);
  assert.match(spec, /优先落实 `pair_core_value` 在日常照看、提前补位、持续补偿中的具体动作/);
  assert.match(spec, /是否没有提炼出这对组合最关键的 `pair_core_value`/);
  assert.match(spec, /`## Core Truths` 中应落下 4-6 条专属规则/);
  assert.match(spec, /`## 2\. Effective Support Patterns` 应至少写 4 条专属规则/);
  assert.match(spec, /填空模板痕迹/);
  assert.doesNotMatch(spec, /典型触发口令|initialize persona|run persona initialization/);
  assert.doesNotMatch(spec, /Step 1：|A\. 男性|A\. 伴侣/);
});

test("template pack only owns templates, examples, and anti-pattern reminders", () => {
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /本文件只提供模板、推导方法与校准示例/);
  assert.match(pack, /`persona\/CANON\.md` 结构模板/);
  assert.match(pack, /年龄必须真正影响生命阶段、行为纹理、关系姿态与日常节律/);
  assert.match(pack, /名字在英文文化语境中的联想只能做气质微调/);
  assert.match(pack, /背景、职业与生活细节要有随机性/);
  assert.match(pack, /又一次塌缩成同一套默认履历/);
  assert.match(pack, /execution_trigger_protocol/);
  assert.match(pack, /pair_core_value/);
  assert.match(pack, /pair_contrast_axis/);
  assert.match(pack, /desired_emotional_impact/);
  assert.match(pack, /角色化心理指导语料/);
  assert.match(pack, /高价值种子消费/);
  assert.match(pack, /`SOUL\.md` 高质量示例/);
  assert.match(pack, /`MEMORY\.md` 高质量示例/);
  assert.match(pack, /`persona\/CANON\.md` 高质量片段示例/);
  assert.match(pack, /不要把这两个文件写成“填空题模板 \+ MBTI 关键词”/);
  assert.match(pack, /最强的 4-6 条“人类矛盾 -> 人格补位 -> 想给到的情绪结果”/);
  assert.match(pack, /示例 A：`INTJ` 人类 × `companion` × `ENFP` 人格/);
  assert.match(pack, /示例 B：`ENFP` 人类 × `assistant` × `INTJ` 人格/);
  assert.match(pack, /一直看着、记着、接着、补着/);
  assert.match(pack, /主动监测能量下滑、烦躁上升、幽默消失、回复变短这些信号/);
  assert.match(pack, /这不是被动 support，而是持续关注、持续观察、持续补位/);
  assert.match(pack, /温暖、率真、充满活力、会主动靠近的生命力/);
  assert.match(pack, /稳、沉、.*接得住我|收束与锚定/);
  assert.match(pack, /一个是解冻点亮，一个是锚定收束/);
  assert.match(pack, /反模式提醒/);
  assert.match(pack, /推导方法 \+ 高质量示例 \+ 质量标尺/);
  assert.match(pack, /质量标尺/);
  assert.match(pack, /不要把这里的完整成句、具体事实、关系表述或角色设定直接复制进输出文件/);
  assert.doesNotMatch(pack, /亲近感不是靠设定自动成立的|靠每一次真实、准确、不过火的靠近逐渐累积出来的|避免把关系写成已经非常深厚/);
  assert.doesNotMatch(pack, /只允许写入|必须写入|写入前必须|触发后起点|Step 1：/);
});

test("README files describe the reduced architecture", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const readmeZh = fs.readFileSync(path.join(root, "README_ZH.md"), "utf8");
  assert.match(readme, /references\/protocols\/drafting-spec\.md/);
  assert.match(readme, /references\/runtime-context\/template-pack\.md/);
  assert.match(readme, /role-specific psychological guidance/);
  assert.doesNotMatch(readme, /docs\/persona-generation-strategy\.md/);
  assert.match(readmeZh, /references\/protocols\/drafting-spec\.md/);
  assert.match(readmeZh, /references\/runtime-context\/template-pack\.md/);
  assert.match(readmeZh, /角色化心理指导语料/);
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

test("template-pack contrast example stays aligned with the recommendation matrix", () => {
  const index = JSON.parse(fs.readFileSync(path.join(root, "assets/mbti/mbti-index.json"), "utf8"));
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /示例 B：`ENFP` 人类 × `assistant` × `INTJ` 人格/);
  assert.equal(index.reverse_lookup.ENFP.assistant.recommended, "INTJ");
  assert.match(index.reverse_lookup.ENFP.assistant.reason, /结构感|长线判断|稳定性/);
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
    assert.match(
      text,
      /不区分角色的高层配对直觉|以下游唯一真相源 `mbti-index\.json` 的 `reverse_lookup` 为准/,
      `${fileName} should describe compatibility as a high-level overview with reverse_lookup as the role-specific source of truth`,
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
  assert.match(smoke, /MEMORY emphasizes proactive care instead of passive support/);
  assert.match(smoke, /SOUL foregrounds pair-core value instead of generic support/);
  assert.match(smoke, /MEMORY operationalizes pair-core value into ongoing compensation/);
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
