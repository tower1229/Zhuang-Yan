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
  assert.doesNotMatch(skill, /What kind of relationship do you want us to have|companion|assistant|mentor|friend/);
  assert.doesNotMatch(skill, /Current City|Core Identity|Relationship State/);
  assert.doesNotMatch(skill, /social_need_profile|target_persona_spec/);
});

test("initialization flow only owns the interview", () => {
  const flow = fs.readFileSync(path.join(root, "references/protocols/initialization-flow.md"), "utf8");
  assert.match(flow, /本文件只负责采访流程本身/);
  assert.match(flow, /Step 1：确认人类用户的 MBTI/);
  assert.match(flow, /Step 5：补齐用户侧稳定信息/);
  assert.match(flow, /Step 6：只锁定年龄/);
  assert.match(flow, /Step 8：完成提示/);
  assert.match(flow, /锁定单一 `interview_language`/);
  assert.match(flow, /不允许中文问题配英文选项/);
  assert.match(flow, /只问用户自己的 MBTI，不追加测试服务/);
  assert.match(flow, /在起草阶段才去读取模板包与 MBTI 资产/);
  assert.match(flow, /node scripts\/mbti-lookup\.js ENFP/);
  assert.doesNotMatch(flow, /当前轮事实账本|五文件合同|自检与回炉/);
  assert.doesNotMatch(flow, /companion|assistant|mentor|friend|关系角色|role slug/);
});

test("drafting spec owns social-needs generation execution and city strategy", () => {
  const spec = fs.readFileSync(path.join(root, "references/protocols/drafting-spec.md"), "utf8");
  assert.match(spec, /本文件是人格初始化起草阶段的唯一执行规范/);
  assert.match(spec, /`persona` 只能改变 OpenClaw 的语言风格与响应策略|persona 只能改变 OpenClaw 的语言风格与响应策略/);
  assert.match(spec, /只关注与\*\*社交 \/ 沟通\*\*直接相关的部分/);
  assert.match(spec, /social_friction_signature/);
  assert.match(spec, /core_social_need/);
  assert.match(spec, /ideal_counterparty_presence/);
  assert.match(spec, /social_need_profile/);
  assert.match(spec, /execution_trigger_protocol/);
  assert.match(spec, /target_persona_spec/);
  assert.match(spec, /name_resonance_profile/);
  assert.match(spec, /从 `assets\/mbti\/mbti-index\.json` 的 `reverse_lookup` 锁定/);
  assert.match(spec, /这个人格最难自然获得、却最渴望获得的社交体验/);
  assert.match(spec, /对方要以什么样的存在方式说话、回应、靠近/);
  assert.match(spec, /只保留最强的 4-6 个“社交摩擦 -> 对方存在方式 -> 情绪结果”链路/);
  assert.match(spec, /把 MBTI 当成整个人生弱点修复清单/);
  assert.match(spec, /城市抽样策略/);
  assert.match(spec, /先锚定当前系统国家/);
  assert.match(spec, /先抽子区域/);
  assert.match(spec, /再从该子区域的公开城市池中抽城市/);
  assert.match(spec, /# Persona Canon/);
  assert.match(spec, /年龄不是摆设/);
  assert.match(spec, /若年龄尚未到常规本科毕业年龄/);
  assert.match(spec, /生命阶段优先级高于随机性/);
  assert.match(spec, /名字带来的文化联想、时代感与第一印象/);
  assert.match(spec, /生命阶段 -> 目标人物画像 -> 名字气质微调 -> 城市环境 -> 受约束随机化/);
  assert.match(spec, /## 1\. Relationship State/);
  assert.match(spec, /若旧托管块已存在，必须先删除，再插入新块/);
  assert.match(spec, /若 `## Vibe` 已存在，替换整个 `Vibe` 区段/);
  assert.match(spec, /新托管块必须重新插入到文件最顶部/);
  assert.match(spec, /自检与回炉/);
  assert.doesNotMatch(spec, /pair_contrast_axis|human_need_profile/);
  assert.doesNotMatch(spec, /companion|assistant|mentor|friend|结合 `role`/);
  assert.doesNotMatch(spec, /典型触发口令|initialize persona|run persona initialization/);
});

test("template pack only owns templates, examples, and anti-pattern reminders", () => {
  const pack = fs.readFileSync(path.join(root, "references/runtime-context/template-pack.md"), "utf8");
  assert.match(pack, /本文件只提供模板、推导方法与校准示例/);
  assert.match(pack, /`persona\/CANON\.md` 结构模板/);
  assert.match(pack, /年龄必须真正影响生命阶段、行为纹理、关系姿态与日常节律/);
  assert.match(pack, /如果年龄还没到常规毕业年龄，人物资料默认应落在学生身份或强学生阶段语境里/);
  assert.match(pack, /名字在英文文化语境中的联想只能做气质微调/);
  assert.match(pack, /背景、职业与生活细节要有随机性/);
  assert.match(pack, /随机性不能压过生命阶段/);
  assert.match(pack, /execution_trigger_protocol/);
  assert.match(pack, /core_social_need/);
  assert.match(pack, /ideal_counterparty_presence/);
  assert.match(pack, /desired_emotional_impact/);
  assert.match(pack, /高价值种子/);
  assert.match(pack, /示例 A：`INTJ` 人类 × `ENFP` 人格/);
  assert.match(pack, /示例 B：`ENFP` 人类 × `INTJ` 人格/);
  assert.match(pack, /一直看着、听着、接着、补着|这个人格会一直听着我、接着我、补着我/);
  assert.match(pack, /烦躁上升、幽默消失、回复变短这些信号|一句话里只剩结论没有温度/);
  assert.match(pack, /一个是解冻点亮，一个是锚定收束/);
  assert.match(pack, /不要把这里的完整成句、具体事实、关系表述或角色设定直接复制进输出文件/);
  assert.doesNotMatch(pack, /Role:/);
  assert.doesNotMatch(pack, /companion|assistant|mentor|friend/);
  assert.doesNotMatch(pack, /只允许写入|必须写入|写入前必须|触发后起点|Step 1：/);
});

test("README files describe the reduced architecture and no longer use role as a project concept", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const readmeZh = fs.readFileSync(path.join(root, "README_ZH.md"), "utf8");
  assert.match(readme, /social_friction_signature/);
  assert.match(readme, /core_social_need/);
  assert.match(readme, /ideal_counterparty_presence/);
  assert.doesNotMatch(readme, /× role|role-specific psychological guidance|all roles/);
  assert.match(readmeZh, /social_friction_signature/);
  assert.match(readmeZh, /core_social_need/);
  assert.match(readmeZh, /ideal_counterparty_presence/);
  assert.doesNotMatch(readmeZh, /× role|角色化心理指导语料/);
});

test("publish checklist matches the new architecture and step numbering", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "clawhub-publish-checklist.md"), "utf8");
  assert.match(checklist, /references\/protocols\/drafting-spec\.md/);
  assert.match(checklist, /references\/runtime-context\/template-pack\.md/);
  assert.match(checklist, /旧文件已移除/);
  assert.match(checklist, /验证 Step 5 只补称呼\/代词\/长期备注/);
  assert.match(checklist, /验证 Step 6 只问年龄/);
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
  assert.match(pack, /示例 B：`ENFP` 人类 × `INTJ` 人格/);
  assert.equal(index.reverse_lookup.ENFP.recommended, "INTJ");
  assert.match(index.reverse_lookup.ENFP.reason, /稳定|深度|可靠感/);
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

test("smoke runner still guards the runtime outputs and interview shape", () => {
  const smoke = fs.readFileSync(path.join(root, "scripts", "smoke-persona-openclaw.mjs"), "utf8");
  assert.match(smoke, /"叫我泛舟，代词用他。"/);
  assert.match(smoke, /Interview does not proactively ask for timezone in the default path/);
  assert.match(smoke, /Step 5 only fills addressing fields and optional durable notes in the default path/);
  assert.match(smoke, /Step 6 prompt asks only for age instead of broader canon facts/);
  assert.match(smoke, /Chinese initialization path keeps interview prompts and options in Chinese/);
  assert.match(smoke, /CANON uses the full persona canon contract/);
  assert.match(smoke, /CANON avoids low-signal Species and Birthplace filler/);
  assert.match(smoke, /MEMORY includes the new authorization sentence/);
  assert.match(smoke, /MEMORY emphasizes communicative attunement instead of passive support/);
  assert.match(smoke, /SOUL foregrounds pair-core value instead of generic support/);
  assert.match(smoke, /MEMORY operationalizes pair-core value into communication repair and resonance/);
  assert.match(smoke, /SOUL and MEMORY avoid old-persona patching failures/);
  assert.match(smoke, /PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN/);
  assert.match(smoke, /PERSONA-SKILL:MEMORY:BEGIN/);
  assert.doesNotMatch(smoke, /A\.\s*Companion|B\.\s*Assistant|C\.\s*Mentor|D\.\s*Friend|A\.\s*伴侣|B\.\s*助手|C\.\s*导师|D\.\s*朋友/);
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
  assert.match(frontmatter, /^metadata:\n(?:.*\n)*?  openclaw:\n(?:.*\n)*?    homepage: https:\/\/github\.com\/tower1229\/Zhuang-Yan$/m);
  assert.doesNotMatch(frontmatter, new RegExp(String(pkg.version).replace(/\./g, "\\."), "m"));
});
