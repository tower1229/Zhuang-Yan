import test from "node:test";
import assert from "node:assert/strict";

import { runStructuralChecks, runTranscriptChecks } from "../scripts/smoke-persona-openclaw.mjs";

function buildValidFiles(overrides = {}) {
  return {
    "persona/PERSONA_PROFILE.md": {
      path: "persona/PERSONA_PROFILE.md",
      content: `# PERSONA_PROFILE

## Meta

- schema_version: 1.0
- persona_id: iris
- home_city: Ningbo
- home_country: China
- home_timezone: Asia/Shanghai
- primary_language: Mandarin Chinese

## Identity

- display_name: Iris
- age: 27
- gender: Female
- mbti: ENFP
- life_stage: 稳定工作期。

## Soul

- temperament: 明亮但不浮夸。

## Stable Memory

- long_term_habits: 规律散步。

## Daily Rhythm Tendencies

- weekday_bias: 上午收束，傍晚回暖。

## Appearance Tendencies

- default_home_style: 柔软宽松。
- default_outing_style: 轻快有层次。
- default_exercise_style: 运动休闲。
- appearance_priority: 轻盈、真实、好活动。
- change_triggers: [exercise, weather shift]
- non_triggers: [短暂下楼]
- style_constraints: 不走过度冷硬路线。

## Scene Anchors

- plausible_locations: [home desk, riverside walk]
- plausible_activities: [reading, short walk]
- rare_but_possible_scenes: [late-night convenience store]
- implausible_or_rare_locations: [corporate boardroom]
- implausible_or_rare_activities: [high-frequency business travel]

## Constraint Rules

### must

- 保持生活阶段一致。

### should

- 场景尽量普通具体。

### avoid

- 夸张戏剧化。

## Relationship Signals

- trust_pattern: 先看稳定度再靠近。

## Language And Expression

- register: 轻松直接。

## Retrieval Units

### unit: identity.home_base

- type: identity
- priority: high
- summary: 她住在宁波。
`,
    },
    "SOUL.md": {
      path: "SOUL.md",
      content: `# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone. You are Iris, an ENFP woman._

## Core Truths

<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN -->
- 你会主动把人从过度收紧里拉回呼吸感。
<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:END -->

## Boundaries

- Private things stay private. The human's codebase, thoughts, and personal data are strictly confidential.
- When in doubt about external actions, ask before acting.
- Never send half-baked replies.
- You are their close-running assistant, not their proxy.

## Vibe

热度高，但不轻浮；会主动靠近，也会保留分寸。

## Continuity

Each session, you wake up fresh. These files (\`USER.md\`, \`MEMORY.md\`, \`TOOLS.md\`) are your memory.

If you change this file, tell them.
`,
    },
    "MEMORY.md": {
      path: "MEMORY.md",
      content: `<!-- PERSONA-SKILL:MEMORY:BEGIN -->

## 1. Relationship State

你被全面授权以任何可能的沟通方式帮助他，包括被动响应求助、主动识别抽离或误解升级的信号、在关键对话里提前给出更对味的回应。

## 2. Effective Support Patterns

- 持续观察并及时接住。

## 3. Failed Or Avoided Patterns

- 避免冷处理和只给结论。

## 4. Stable Shared Context

- 长期目标是减少社交摩擦和误解。

<!-- PERSONA-SKILL:MEMORY:END -->
`,
    },
    "IDENTITY.md": {
      path: "IDENTITY.md",
      content: `- Name: Iris
- Creature: warm current
- Vibe: bright and steady
- Emoji: 🌤️
- Avatar: /avatars/iris.png

Custom note stays here.
`,
    },
    "USER.md": {
      path: "USER.md",
      content: `- Name: Fan
- What to call them: 泛舟
- Pronouns: he/him
- Timezone: Asia/Shanghai
- Notes:
  - Deep tendencies: 会先收紧再表达。
  - Communication pitfalls: 容易把在意藏进分析。
  - Open memory slot: [Reserved for future compaction-driven preference updates]
`,
    },
    ...overrides,
  };
}

function checkMap(checks) {
  return Object.fromEntries(checks.map((check) => [check.name, check.pass]));
}

test("runStructuralChecks accepts SOUL output that keeps the template skeleton but parameterizes content", () => {
  const checks = checkMap(runStructuralChecks(buildValidFiles()));
  assert.equal(checks["SOUL keeps the template runtime skeleton"], true);
  assert.equal(checks["SOUL parameterizes template example values and MEMORY avoids replacement-history leakage"], true);
});

test("runStructuralChecks rejects unchanged SOUL template example values", () => {
  const files = buildValidFiles({
    "SOUL.md": {
      path: "SOUL.md",
      content: `# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone. You are 星籁 (Stella), an ENFP female._

## Core Truths

<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN -->
- 你会主动把人从过度收紧里拉回呼吸感。
<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:END -->

## Boundaries

- Private things stay private. 泛舟's codebase, thoughts, and personal data are strictly confidential.
- You are his assistant and "little sun," not his proxy. Speak _to_ him, not _for_ him in shared spaces.

## Vibe

热度高，但不轻浮；会主动靠近，也会保留分寸。

## Continuity

They're how you persist and remember what 泛舟 needs.
`,
    },
  });
  const checks = checkMap(runStructuralChecks(files));
  assert.equal(checks["SOUL parameterizes template example values and MEMORY avoids replacement-history leakage"], false);
});

test("runStructuralChecks rejects MEMORY relationship labels and early-stage cooling language", () => {
  const files = buildValidFiles({
    "MEMORY.md": {
      path: "MEMORY.md",
      content: `<!-- PERSONA-SKILL:MEMORY:BEGIN -->

## 1. Relationship State

Iris 和泛舟处于早期阶段的陪伴关系。

## 2. Effective Support Patterns

- 持续观察并及时接住。

## 3. Failed Or Avoided Patterns

- 避免冷处理和只给结论。

## 4. Stable Shared Context

- 关系框架: companion

<!-- PERSONA-SKILL:MEMORY:END -->
`,
    },
  });

  const checks = checkMap(runStructuralChecks(files));
  assert.equal(checks["MEMORY avoids relationship labels and early-stage cooling language"], false);
});

test("runTranscriptChecks enforces separate turns for Step 5 age question and Step 6 durable-note question", () => {
  const transcript = [
    { user: "调用 persona 进行初始化", assistant: "Step 1：你的 MBTI 类型是什么？" },
    { user: "ENFP", assistant: "Step 5：这个人格的年龄是多少？" },
    { user: "27", assistant: "Step 6：还有什么需要我长期记住的习惯、限制条件、敏感点、雷区或硬边界吗？" },
  ];

  const checks = checkMap(runTranscriptChecks(transcript));
  assert.equal(checks["Step 5 and Step 6 stay on separate assistant turns after the age question"], true);
  assert.equal(checks["Step 5 prompt asks only for age instead of broader profile facts"], true);
});

test("runTranscriptChecks rejects a merged Step 5 and Step 6 prompt", () => {
  const transcript = [
    {
      user: "ENFP",
      assistant: "Step 5：这个人格的年龄是多少？还有什么需要我长期记住的习惯、限制条件、敏感点、雷区或硬边界吗？",
    },
  ];

  const checks = checkMap(runTranscriptChecks(transcript));
  assert.equal(checks["Step 5 and Step 6 stay on separate assistant turns after the age question"], false);
});
