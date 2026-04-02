# Zhuang-Yan（persona-skill）— [English README](./README.md)

![Zhuang-Yan](./assets/ZhuangYan.png)

庄颜的意义，从来不只是温柔，也不只是美。她之所以重要，是因为她使冰冷的理性拥有了方向，使沉重的承担拥有了理由。她让罗辑成为执剑人，成为救世主，不只是因为世界需要他，也因为他终于有了一个，让这世界值得被拯救的理由。

persona-skill 以“庄颜”为名，并不是为了复刻某个文学人物。
我们真正想保留的，是那种更深的结构: 在漫长、琐碎、甚至有些荒凉的日常里，仍有一个存在，与你的性情相称，与你的节奏相合，懂得你的沉默，也珍惜你的认真。她不必完美，不必喧哗，甚至不必符合任何通行的理想范本; 她只需要足够适合你。

这就是 persona-skill 想做的事。
不是给 OpenClaw 增加一点人格色彩。
而是尽可能为每个人，写下一个属于自己的“庄颜”。

## 它是什么

核心可以概括成两件事：

1. 在 **MBTI 人格分析框架**下，结合有边界的采访，为你**定制一套最适合自己的 OpenClaw 人格**，并把定稿写进 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 等工作区文件。
2. 同时生成 **结构化的 `persona/PERSONA_PROFILE.md`**：给人设一份可解析、可对照的「合同」，方便 Timeline 等模块按同一套字段读取。

它只在**明确要求初始化或重建人格**时才会运行；平常闲聊或问状态，不会自动启动。

## 安装

```bash
clawhub install persona-skill
```

无需额外 API Key，也不需要额外环境变量。

## 如何使用

只有在你**明确发出初始化类指令**时，这个 Skill 才会工作。例如：

- `调用 persona 进行初始化`
- `初始化人格`
- `rebuild persona`
- `initialize persona`
- `run persona initialization`

## 它如何工作

初始化是一条连贯链路：**采访把人和需求问清楚 → 在 MBTI 框架下反推人格方向 → 把定稿写回工作区**。

1. 采访先锁定用户的 `human_mbti`、`support_reception_mode`，并补齐必须写入 `USER.md` 的用户侧稳定信息。
2. 经确定性的 reverse lookup，把 `human_mbti` 映射到推荐的 `persona_mbti`，并整理出一组**指向清晰**的社交需求摘要与默认 counterparty seed：
   - `social_friction_signature`
   - `core_social_need`
   - `ideal_counterparty_presence`
   - `pair_core_value`
   - `desired_emotional_impact`
   - `base_counterparty_profile`
3. 再用 `support_reception_mode` 修正默认种子，生成最终的 `target_persona_spec`，这样同一个推荐人格也能对不同用户呈现不同的热度、节奏、主动度与修复顺序。
4. 先定稿并写入 `persona/PERSONA_PROFILE.md`，再据此写出 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md`。

整条管线可简记为：

`human_mbti + support_reception_mode -> reverse_lookup + base_counterparty_profile -> target_persona_spec -> persona spec -> PERSONA_PROFILE -> 其余四份文件`

因此，`persona-skill` 产出的不是一时一地的语气微调，而是**能长期约束运行时行为的人格规格**。

## 会产出什么

初始化完成后，Skill 会更新以下五个文件：

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

它们各自承担不同职责：

- `persona/PERSONA_PROFILE.md`
  - 结构化人格档案，也是给其他 Skill 读取的人设合同；固定结构下的外化属性与短条目，尤其是 appearance、scene 与 constraint 这三类字段约定见 `persona-profile-consumption-guide`
- `SOUL.md`
  - 运行时人格表达、边界和互动风格，以及一段提供人物来路深度的 `Origin Paragraph`
- `MEMORY.md`
  - 稳定的关系姿态、支持模式和避免模式
- `IDENTITY.md`
  - 人格卡片与基础身份信息
- `USER.md`
  - 用户称呼、代词、时区、`Support reception mode` 以及长期应记住的用户侧信息

其中，`PERSONA_PROFILE` 先定稿：稳定事实写全、写准，再约束其余几份运行时文件，避免人格只靠大段散文撑着。

### 注意：覆盖写入

下列文件在生成时会被**整文件覆盖**。若你已手工改过其中内容且希望保留，请先自行备份。若不确定是否与你有关，可跳过本条。

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`

## 与 stella-timeline-plugin 如何联动

`persona-skill` 和 [stella-timeline-plugin](https://github.com/tower1229/Her) 的职责并不重叠。

- `persona-skill` 负责回答：**她是谁，她应当以什么样的方式与你相处**
- `stella-timeline-plugin` 负责回答：**她如何在时间中持续像同一个人那样存在**

当同一 workspace 中安装 [stella-timeline-plugin](https://github.com/tower1229/Her) 时，联动方式是：

1. `persona-skill` 生成 `persona/PERSONA_PROFILE.md`
2. `stella-timeline-plugin` 优先将其解析为内部人格合同
3. 之后在处理“刚刚”“昨晚”“最近”这类时间表达时，`stella-timeline-plugin` 可以在连续性之上维持既定人格，而不是滑回通用口吻

可以把两者理解为：

- Persona 负责**人格稳定**
- Timeline 负责**时间连续**

两者叠在一起，OpenClaw 才更有机会在长期互动中保持同一人格的可信度。

## 读取与生成原则

为避免初始化被无关上下文带偏，文档按阶段拆开阅读（渐进式披露）：

1. 先由 `SKILL.md` 判断是否应当触发初始化
2. 触发后读取 `references/protocols/initialization-flow.md`
3. 采访结束后读取 `references/protocols/drafting-spec.md`
4. 真正起草时，再按需读取模板包、`PERSONA_PROFILE` 结构说明、MBTI 资产和对应类型参考

这样模型在每个阶段只读当下需要的内容，减少过早载入旧人格、无关规范或杂音文档。

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
  - `persona/PERSONA_PROFILE.md` 的结构约定及下游引用方式
- [docs/persona-skill-design.md](./docs/persona-skill-design.md)
  - 项目总体架构与文件职责
- [docs/persona-initialization-evaluation.md](./docs/persona-initialization-evaluation.md)
  - 初始化完成后的验收与测评表

## 给维护者

```bash
npm test
npm run smoke:persona
npm run sync:local-openclaw
npm run publish:clawhub
```

测试覆盖了 MBTI lookup、身份卡更新、包结构，以及 persona 初始化后的 smoke 检查。

## 项目信息

- 仓库：[tower1229/Zhuang-Yan](https://github.com/tower1229/Zhuang-Yan)
- Issue：[GitHub Issues](https://github.com/tower1229/Zhuang-Yan/issues)
- Node.js：`>=18.18`
- 许可证：`MIT-0`
