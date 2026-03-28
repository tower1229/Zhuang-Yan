# Zhuang-Yan（persona-skill）— [English README](./README.md)

别再让 OpenClaw 的人格像一次性 prompt 一样忽明忽暗。

`persona-skill` 不是给角色“贴一个 MBTI 标签”这么简单，而是通过一次简短但高密度的初始化采访，帮你把人格底稿真正搭起来：先理解用户最在意的相处感、陪伴感与情绪价值，再一次性写入 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 和 `persona/PERSONA_PROFILE.md`，让后续对话、记忆系统和下游 skill 都建立在同一套稳定设定上。

## 安装

```bash
clawhub install persona-skill
```

无需额外 API Key，也不需要环境变量。装好就能进入初始化流程。

## 它解决的，不只是“人设不稳定”

- 不是零碎修补，而是完整重建：显式触发后，从头采访、从头起草、从头落盘，不对旧人格做模糊打补丁。
- 不是先决定性格，再强行往里塞细节：它会先锁定用户真正想要的互动体验，再反推更合适的人格方向。
- 不是只有一段可读文案：它会同时生成可运行的五份上下文文件，以及给其他 skill 消费的结构化档案 `persona/PERSONA_PROFILE.md`。
- 不是只为“当前聊天”服务：这套档案会成为后续记忆、场景锚点、身份约束与表达风格的共同基座。

## 使用方式

用明确的初始化指令触发，例如：

- `调用 persona 进行初始化`
- `初始化人格`
- `initialize persona`
- `rebuild persona`
- `run persona initialization`

未显式触发时，Skill 不会介入普通对话。

一旦进入流程，它会以一问一答的方式完成初始化采访，然后重写：

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

## 这套初始化为什么更“像一个真正的人”

`persona-skill` 的主轴不是泛泛而谈的“性格分析”，而是围绕用户真正的关系需求来建模：

`human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> 五文件投影`

这意味着它生成的不是一个“看起来像 AI 人设”的空壳，而是一个更懂得该如何陪伴、回应、表达、记住和延续关系语境的角色底盘。

尤其是这几个环节，会直接决定产物质量：

- `social_friction_signature`：识别用户在人际关系里最容易被消耗、误解或失望的地方。
- `core_social_need`：提炼用户最希望被满足的核心相处需求。
- `ideal_counterparty_presence`：定义理想陪伴者应该如何出现、如何说话、如何让人安心。
- `pair_core_value` 与 `desired_emotional_impact`：把人格从“设定”推进到“实际相处体验”。

## 档案先行，运行时跟随

这个项目的新架构重点很明确：

1. 先产出 `persona/PERSONA_PROFILE.md` 作为结构化底层档案
2. 再让 `SOUL / MEMORY / IDENTITY / USER` 统一投影这份档案
3. 让其他 skill 和 Timeline 有稳定、可消费、可复用的人设事实源

相比把所有设定都揉进一堆 prose 里，这种做法的优势是：

- 人设事实更稳定，不容易在长对话里漂移
- 下游技能更容易读取身份、外观、背景、场景锚点与约束
- 运行时文件可以更精炼，把“该怎么互动”和“这个人是谁”分层管理

## 渐进式披露架构

初始化链路已经收敛成一条清晰的最小读取顺序：

1. `SKILL.md`
2. `references/protocols/initialization-flow.md`
3. `references/protocols/drafting-spec.md`
4. `references/runtime-context/template-pack.md`
5. `references/runtime-context/persona-profile-consumption-guide.md`

数据资产保持独立：

- `assets/mbti/mbti-index.json`
- `references/mbti/*.md`

读取顺序遵循渐进式披露：

1. `SKILL.md` 先判断是否应该启动
2. 进入采访后才读取 `initialization-flow.md`
3. 采访完成后才读取 `drafting-spec.md`
4. 真正起草时才读取模板包、消费指南和 MBTI 资产

这样做的意义很简单：模型只在需要的时候读需要的文档，避免过早加载无关规范，也避免初始化过程被杂讯拖偏。

## 文档

- `docs/persona-skill-design.md`：整体架构、文件边界与依赖顺序
- `references/runtime-context/persona-profile-consumption-guide.md`：`persona/PERSONA_PROFILE.md` 的结构约定、字段语义与推荐消费顺序

## 项目信息

- 仓库地址：`https://github.com/tower1229/Zhuang-Yan`
- Issue 地址：`https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js 要求：`>=18.18`
- 许可证：`MIT-0`
