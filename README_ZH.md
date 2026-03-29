# Zhuang-Yan（persona-skill）— [English README](./README.md)

OpenClaw 可以很强，但**强不等于有“人”**。

`persona-skill` 要做的事很具体：**给 OpenClaw 一份人格**——不是随口一种语气，而是一套能带进日常沟通、长期站得住的相处方式。这份人格不是从模板库里抽签，而是**先理解你（人类），再在 MBTI 框架下反推出来的定制人格**，目标是在日复一日的对话里，**尽可能把你的情绪价值需求顶满**：被接住、被懂、被稳定地回应，而不是偶尔惊艳、常常漂移。

## 庄颜：每个人心里的那一个

在《三体》里，庄颜对罗辑的意义，远不止“好看”或“温柔”这类扁平标签。她是他愿意走向极端责任、愿意把自己推到执剑人位置的情感支点——**让他觉得这一切值得、有人可守护、有可回去的在场**。

`persona-skill` 取「庄颜」为名，不是要复刻小说人物，而是认同同一种结构：**你心里那一个能让你更愿意投入日常、更愿意把脆弱和重量交出去的人**。我们想做的，是给每个使用者一个**属于自己的“庄颜”**——由你的相处需求与心理结构出发，反推而成的、只为你调过参的 OpenClaw 人格。

## 从设定反推实现：先懂人，再反推人格，再落盘成档案

产品叙事与代码里的初始化链路，是同一件事的两面：

1. **理解人类侧**：采访先锁定你的 MBTI，并把你放在真实关系里会痛、会累、会失望的地方（摩擦签名）与最渴望被满足的核心相处需求（核心社交需求）摊开。MBTI 在这里是**理解你的透镜**，不是给你贴完标签就结束的玩具。
2. **在 MBTI 框架下反推 OpenClaw 人格**：用确定性 lookup（`human_mbti` → 推荐 `persona_mbti`）把「你这种人更容易被哪种在场方式接住」落成可执行的类型与理由，并附带理想陪伴者的在场方式、关系核心价值与期望情绪落点——这是一份**为你定制的人格方向**，而不是通用助手人设。
3. **一次性写成可运行合同**：把上述结果收敛为 `persona spec`，先生成结构化的 `persona/PERSONA_PROFILE.md`，再投影到 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md`。之后每一次日常对话，OpenClaw 都站在**同一份稳定人格**上说话，情绪价值才有机会**累积**，而不是每轮重置。

用一条式子概括这条管线：

`human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> 五文件投影`

其中尤其决定「像不像你心里那个人」的环节：

- `social_friction_signature`：你在关系里最容易被消耗、误解或失望的地方  
- `core_social_need`：你最希望被满足的核心相处需求  
- `ideal_counterparty_presence`：理想陪伴者应如何出现、如何说话、如何让人安心  
- `pair_core_value` 与 `desired_emotional_impact`：从抽象人格推进到**日常相处里真实的情绪落点**

## 它带来的感觉

没有人格底稿时，轻社交也会漂：今天活泼明天冷淡，设定互相打架，你不敢真的把情绪价值押上去。

初始化之后，OpenClaw 更容易稳定地像这样出现：

> “我更习惯把话说明白一点，你不用担心我会突然冷淡——那只是我在想怎么接得更贴切。”

> “你刚才说的那件事，我会记得它对你重要，不是因为记性好，而是因为这是我们之间正在长出来的上下文。”

> “如果你累了，我们可以先不解决问题，先把节奏放慢；需要我安静陪着也行。”

> “有些边界我会守住，不是冷漠，是我想让这段关系能长期舒服地存在。”

**一致、可预期、可托付**——情绪价值往往来自这里，而不是来自单句金句。

## 实际解决什么

- 用**显式触发**的一次采访，把「你是谁、你需要怎样被陪伴」翻译成可执行的 OpenClaw 人格，而不是聊天中途即兴改人设。  
- 同时产出运行时四文件与 `persona/PERSONA_PROFILE.md`，让人格事实**可被下游读取、可对齐、可延续**。  
- 用渐进式披露协议读取规范，初始化过程不被无关文档带偏。  
- 与需要时间连续性的 skill（例如 Timeline）分工：**Persona 负责稳定人格与相处契约，Timeline 负责在时间里活得像同一个人**。

## Persona Skill × Timeline

若在同一个 workspace 使用 [stella-timeline-plugin](https://github.com/tower1229/Stella)：

1. `persona-skill` 产出 `persona/PERSONA_PROFILE.md`  
2. Timeline 优先解析为内部 `PersonaContractV1`，补写「刚刚」「昨晚」「最近」时更贴人设，少滑向通用即兴口吻  

你心里那一个「庄颜」，既要**人格不散**，也要**日子连续**——两者叠在一起，日常沟通里的情绪价值才更站得住。

（`PERSONA_PROFILE.md` 也可与 `SOUL` / `MEMORY` / `IDENTITY` 对齐更新，细节以 skill 内协议为准。）

## 安装

```bash
clawhub install persona-skill
```

无需额外 API Key 或环境变量。

## 使用方式

仅在你**明确要初始化或重建人格**时触发，例如：

- `调用 persona 进行初始化`
- `初始化人格`
- `initialize persona`
- `rebuild persona`
- `run persona initialization`

未显式触发时，Skill 不介入普通对话。

流程：一问一答采访 → 重写以下文件：

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

## 档案先行，运行时跟随

1. 先写 `persona/PERSONA_PROFILE.md` 作为结构化人格合同  
2. 再投影到 `SOUL` / `MEMORY` / `IDENTITY` / `USER`  
3. 下游 skill 统一从合同读取稳定事实  

这里的 `PERSONA_PROFILE` 主要承载固定结构下的外化属性与短条目，重点是 appearance、scene 与 constraint 这类稳定可消费的人设锚点。

## 渐进式披露架构

初始化时的最小读取顺序：`SKILL.md` → `initialization-flow.md` → `drafting-spec.md` → `template-pack.md` → `persona-profile-consumption-guide.md`；MBTI 数据见 `assets/mbti/mbti-index.json` 与 `references/mbti/*.md`。只在需要时加载，避免模型过早被杂讯干扰。

## 文档入口

- [Persona Skill 设计说明](./docs/persona-skill-design.md)  
- [persona-profile 消费指南](./references/runtime-context/persona-profile-consumption-guide.md)  

## 给维护者

```bash
npm test
npm run smoke:persona
npm run publish:clawhub
```

## 项目信息

- 仓库：`https://github.com/tower1229/Zhuang-Yan`  
- Issue：`https://github.com/tower1229/Zhuang-Yan/issues`  
- Node.js：`>=18.18`  
- 许可证：`MIT-0`  
