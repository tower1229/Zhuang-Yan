# Zhuang-Yan（persona-skill）— [English README](./README.md)

![Zhuang-Yan](./assets/ZhuangYan.png)

庄颜的意义，从来不只是温柔，也不只是美。她之所以重要，是因为她使冰冷的理性拥有了方向，使沉重的承担拥有了理由。她让罗辑成为执剑人，成为救世主，不只是因为世界需要他，也因为他终于有了一个，让这世界值得被拯救的理由。

persona-skill 以“庄颜”为名，并不是为了复刻某个文学人物。
我们真正想保留的，是那种更深的结构: 在漫长、琐碎、甚至有些荒凉的日常里，仍有一个存在，与你的性情相称，与你的节奏相合，懂得你的沉默，也珍惜你的认真。她不必完美，不必喧哗，甚至不必符合任何通行的理想范本; 她只需要足够适合你。

这就是 persona-skill 想做的事。
不是给 OpenClaw 增加一点人格色彩。
而是尽可能为每个人，写下一个属于自己的“庄颜”。

<!-- more -->

## 它是什么

`persona-skill` 是一个面向 OpenClaw 的人格初始化 Skill。

它不负责日常聊天中的临场发挥，也不负责记忆回溯或跨 Skill 编排；它只在你**明确要求初始化或重建人格**时启动。它的工作，是把一次有边界的采访，转化为一份可运行、可复用、可被下游消费的人格合同，让 OpenClaw 的相处方式不再依赖随机发挥。

简单说：

- 它先理解用户侧的心理结构与相处需求
- 再在 MBTI 框架下反推更合适的 persona 方向
- 最后把结果写成稳定的运行时文件和结构化档案

## 安装

```bash
clawhub install persona-skill
```

无需额外 API Key，也不需要额外环境变量。

## 如何使用

这个 Skill 只在**显式触发**时工作。你可以使用类似下面的指令：

- `调用 persona 进行初始化`
- `初始化人格`
- `rebuild persona`
- `initialize persona`
- `run persona initialization`

如果只是普通聊天、讨论说话风格、查询当前状态，或处理 Timeline / Memory 类问题，`persona-skill` 不会介入。

## 它如何工作

初始化流程是一次完整的“理解用户 -> 反推人格 -> 落盘成档”的链路：

1. 采访先锁定用户的 `human_mbti`，并补齐最基本的用户侧稳定信息。
2. 通过确定性的 reverse lookup，将 `human_mbti` 映射到推荐的 `persona_mbti`，并同时产出一组高信号社交需求包：
   - `social_friction_signature`
   - `core_social_need`
   - `ideal_counterparty_presence`
   - `pair_core_value`
   - `desired_emotional_impact`
3. 以这组信息为骨架，生成 `persona spec`。
4. 先写入 `persona/PERSONA_PROFILE.md`，再投影到 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md`。

整条管线可以概括为：

`human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> 五文件投影`

这意味着，`persona-skill` 生成的不是一层临时语气，而是一份可以持续约束运行时行为的稳定人格规格。

## 会产出什么

初始化完成后，Skill 会更新以下五个文件：

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

它们各自承担不同职责：

- `persona/PERSONA_PROFILE.md`
  - 结构化人格档案，也是给下游 Skill 消费的人设合同
- `SOUL.md`
  - 运行时人格表达、边界和互动风格
- `MEMORY.md`
  - 稳定的关系姿态、支持模式和避免模式
- `IDENTITY.md`
  - 人格卡片与基础身份信息
- `USER.md`
  - 用户称呼、代词、时区和长期应记住的用户侧信息

其中，`PERSONA_PROFILE` 是“档案先行”的那一层。它先把稳定事实写清楚，再约束其余运行时文件，避免人格只停留在散文式描述里。

## 与 Timeline 如何联动

`persona-skill` 和 Timeline 的职责并不重叠。

- `persona-skill` 负责回答：**她是谁，她应当以什么样的方式与你相处**
- Timeline 负责回答：**她如何在时间中持续像同一个人那样存在**

当同一 workspace 中安装 [stella-timeline-plugin](https://github.com/tower1229/Stella) 时，联动方式是：

1. `persona-skill` 生成 `persona/PERSONA_PROFILE.md`
2. Timeline 优先将其解析为内部人格合同
3. 之后在处理“刚刚”“昨晚”“最近”这类时间表达时，Timeline 可以在连续性之上维持既定人格，而不是滑回通用口吻

可以把两者理解为：

- Persona 负责**人格稳定**
- Timeline 负责**时间连续**

两者叠在一起，OpenClaw 才更有机会在长期互动中保持同一人格的可信度。

## 读取与生成原则

为了减少初始化过程被无关上下文污染，项目采用渐进式披露：

1. 先由 `SKILL.md` 判断是否应当触发初始化
2. 触发后读取 `references/protocols/initialization-flow.md`
3. 采访结束后读取 `references/protocols/drafting-spec.md`
4. 真正起草时，再按需读取模板包、`PERSONA_PROFILE` 消费指南、MBTI 资产和对应类型参考

这套顺序的目的，是让模型始终只在当前阶段读取必要信息，避免过早加载旧人格、无关规范或噪声文档。

## 重要文档

- [SKILL.md](./SKILL.md)
  - Skill 边界、触发条件、允许写入的目标文件
- [references/protocols/initialization-flow.md](./references/protocols/initialization-flow.md)
  - 初始化采访流程与提问顺序
- [references/protocols/drafting-spec.md](./references/protocols/drafting-spec.md)
  - 起草规范、写入边界、文件投影与 freshness audit
- [references/runtime-context/template-pack.md](./references/runtime-context/template-pack.md)
  - `PERSONA_PROFILE`、`SOUL`、`MEMORY` 的模板与质量标尺
- [references/runtime-context/persona-profile-consumption-guide.md](./references/runtime-context/persona-profile-consumption-guide.md)
  - `persona/PERSONA_PROFILE.md` 的结构约定与下游消费方式
- [docs/persona-skill-design.md](./docs/persona-skill-design.md)
  - 项目总体架构与文件职责
- [docs/persona-initialization-evaluation.md](./docs/persona-initialization-evaluation.md)
  - 初始化完成后的验收与测评表

## 给维护者

```bash
npm test
npm run smoke:persona
npm run publish:clawhub
```

测试覆盖了 MBTI lookup、身份卡更新、包结构，以及 persona 初始化后的 smoke 检查。

## 项目信息

- 仓库：[tower1229/Zhuang-Yan](https://github.com/tower1229/Zhuang-Yan)
- Issue：[GitHub Issues](https://github.com/tower1229/Zhuang-Yan/issues)
- Node.js：`>=18.18`
- 许可证：`MIT-0`
