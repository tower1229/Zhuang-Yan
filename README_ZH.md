# Zhuang-Yan（persona-skill）— [English README](./README.md)

`persona-skill` 用于在 OpenClaw 中初始化或重建人格：通过一段简短采访收集必要信息，再一次性写入五个运行时人格文件和 `persona/PERSONA_PROFILE.md`。

## 安装

```bash
clawhub install persona-skill
```

无需额外 API 密钥或环境变量。

## 使用方式

用明确的初始化口令触发，例如：

- `调用 persona 进行初始化`
- `初始化人格`
- `initialize persona`
- `rebuild persona`
- `run persona initialization`

未显式触发时，Skill 不会影响普通对话。

显式触发后，Skill 会进行一问一答式采访，然后重写：

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

## 架构

初始化链路已经收敛成：

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
2. 进入采访后读取 `initialization-flow.md`
3. 采访完成后读取 `drafting-spec.md`
4. 真正起草时才读取 `template-pack.md`、`persona-profile-consumption-guide.md` 与 MBTI 资产

## 这个 Skill 优化什么

- 所有高价值内容都先服务用户的核心社交需求
- 生成主轴是 `human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> 五文件投影`
- `social_friction_signature / core_social_need / ideal_counterparty_presence` 是新的高价值指导语料，用来定义“这个人最想被怎样对待”
- `persona/PERSONA_PROFILE.md` 的稳定人物事实会先看年龄带来的生命阶段；若尚未到常规毕业年龄，默认应落在学生身份或强学生阶段语境里。之后再看目标人物画像，并把名字在英文文化语境中的联想只作为气质微调，最后在受约束随机性里生成履历
- `persona/PERSONA_PROFILE.md` 更适合作为结构化底层设定来写：除了给人类阅读，也要方便其他 skill 和 Timeline 稳定提取身份、背景、表达风格、场景锚点与约束规则，因此应优先使用固定结构下的外化属性与短条目，而不是长篇人格剖析
- 运行时文件保持精炼，`persona/PERSONA_PROFILE.md` 负责沉淀稳定 persona、appearance、scene 与 constraint 语义
- 初始化是彻底重建，不是对旧人格轻改

## 文档

- `docs/persona-skill-design.md` — 架构、文件边界与依赖顺序
- `references/runtime-context/persona-profile-consumption-guide.md` — `persona/PERSONA_PROFILE.md` 的结构约定、字段语义与推荐读取顺序

## 项目信息

- 仓库地址：`https://github.com/tower1229/Zhuang-Yan`
- Issue 地址：`https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js 要求：`>=18.18`
- 许可证：`MIT-0`
