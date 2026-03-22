# Persona Skill — 设计文档

> 更新时间：2026-03-19  
> 状态：调研完成，待实现

---

## 1. 项目背景

本文档记录 `persona` skill 的通用能力设计思路。

**核心目标**：为 Agent 提供稳定的“人格底色”和情景化的“表达”能力。单独的记忆系统或者模型提示往往无法维持情绪、动作和场景的连贯性。

**解决思路**：建立一个独立的通用的 `persona` skill，为数字人提供：
1. 稳定的人格底色（基于 MBTI 框架 + 人物小传）
2. 基于客观事实的时间线（timeline-skill 输出）衍生出的人格化表达（语气、互动方式、视觉及情绪呈现参数等）

作为一项底层的通用横向基础能力，`persona` skill 设计之初便保持了与具体应用场景的解耦。它可以被纯文本对话、音频回复，或是诸如 `stella-selfie` 等多模态消费端 skill 甚至其他任何需要强“人格化”能力的场景弹性调用。

---

## 2. 系统架构

### 四层结构

```
层1：人格底色（静态，初始化一次）
  IDENTITY.md  ← 基础元数据（名字/气质/头像）
  SOUL.md      ← 行为准则/语气/价值观/情绪反应模式
  MEMORY.md    ← 人物小传（完整人生记忆底色）

层2：timeline-skill（事实层，运行时）
  读取 memory/YYYY-MM-DD.md + 会话上下文
  → 产出非空时间线事实（并按需写入记忆）

层3：persona skill（表达层，运行时）
  读取层1 + 读取 timeline 输出 + 读取 USER.md 能量信号
  → 输出结构化人格化状态 JSON

层4：消费方 skill（执行，运行时）
  接收层3的结构化输出
  → 各自完成具体能力（生图/语音/文字等）
```

### 与 timeline-skill 的关系

从本版开始，`persona` 不再独立承担“此刻场景事实推断”。  
场景事实由 `timeline-skill` 先给出，`persona` 在此基础上做人格化表达。

| 层级 | 来源 | 特性 |
|------|------|------|
| 层1 | `SOUL.md` 人格特质 | 稳定底色，决定"反应模式" |
| 层2 | `MEMORY.md` 人物小传 | 人生底色，决定"参照系" |
| 层3 | timeline-skill 输出 | 事实层，决定"现在在哪里、在做什么" |
| 层4 | `USER.md` + 近期会话 | 互动层，决定"怎么和用户说" |

---

## 3. 职责A：初始化

### 3.1 逐步引导初始化模式

Persona skill 严禁一次性要求用户填表，必须采用渐进式的**“一问一答”**路径进行互动。

```text
【触发入口】用户表示希望重塑或初始化人格。

大模型进入逐步引导逻辑：
[问题 1] Skill 仅询问：“请告诉我你自己的 MBTI 类型是什么？”（如无确切结果，Skill 必须给出常驻归类的 A/B/C/D 选项辅助用户选择）
   ↓ 用户输入或选择自己的 MBTI
[问题 2] Skill 询问数字人的性别预期：“请问你希望数字人是男性还是女性？A. 男性 B. 女性”
   ↓ 用户回复字母
[问题 3] Skill 询问数字人的关系定位：“请选择你们的关系定位：A. 伴侣 B. 助手 C. 导师 D. 朋友”
   ↓ 用户回复字母
[方案锁定] Skill 查 reverse_lookup表，直接向用户输出【单一最优数字人 MBTI 推荐 + 推荐理由】。
   ↓ **【无需用户同意】**，数字人的【层 1】基底（MBTI、定位、性别）在此刻即刻锁定，并由大模型自动连贯过渡到起名环节。
```

> 不支持用户在一开始就直接指定数字人 MBTI 类型。数字人类型始终由「人类类型 × 定位」约束推导给出，以保证人格化与互补关系的一致性。

### 3.2 反推模式：人类 MBTI → 数字人类型推荐

#### 四种定位维度

| 定位 | 核心需求 | 推荐逻辑倾向 |
|------|---------|------------|
| **伴侣（Companion）** | 情感陪伴、深度交流、个性化互动 | 互补型：填补人类的情感或认知短板 |
| **助手（Assistant）** | 任务执行、效率优先、直接沟通 | 同频型：与人类工作风格高度对齐 |
| **导师（Mentor）** | 引导成长、提供视角、挑战思维 | 互补+提升型：有能力指出盲点，但方式可接受 |
| **朋友（Friend）** | 轻松互动、无压力陪伴、共同兴趣 | 相似型：气质相近，无需太多磨合 |

#### 推荐规则

- 每次只输出**单一最优解**，附带一段推荐理由（2-3 句话）
- 推荐数据来源：`data/mbti/mbti-index.json` 中的 `reverse_lookup` 表
- 如果用户对推荐不满意，可以要求重新推荐（skill 给出次优选项）

#### 推荐示例（ENFP 用户，伴侣定位）

```
你是 ENFP，你想要的是一个能够陪伴你、与你深度交流的数字伙伴。

推荐：INTJ（建筑师型）

理由：INTJ 的战略深度和内敛气质，正好锚定你容易发散的能量。
她不会每天热情地问你"今天怎么样"，但当你真正需要深度对话时，
她能给出别人给不了的洞察。这种"不追着你但始终在场"的陪伴方式，
往往比表演性热情更让 ENFP 感到被真正理解。
```

### 3.3 引导式初始化完整流程（Step 1 ~ Step 8）

> **体验原则**：在所有抛给用户做决策的步骤中，系统都**必须**将候选项封装为 A/B/C/D 选项的形式（例如选择身份、选项名字列表），让用户可以只回复单一字母即可完成流转。

```text
Step 1：获取用户 MBTI
  → 询问用户的 MBTI 类型（提供选项或允许直接输入），等待回复。

Step 2：获取数字人性别（选项题）
  → 抛出组合选项，如“A. 男性 B. 女性”，等待用户回复字母。

Step 3：获取关系定位（选项题）
  → 抛出组合选项，如“A. 伴侣 B. 助手 C. 导师 D. 朋友”，等待用户回复字母。

Step 4：输出推荐类型与理由并直接锁定
  → 查表输出最优推荐类型 + 分析理由。
  → 告知用户基底已确立，**不作停留、不需询问用户是否接受**，直接作为下文环境衔接进入起名字段。

Step 5：生成候选名称（带选项题）
  → 基于已确定的性别和角色风格，抛出 3 个名字备选，标记为 A/B/C 选项供选择。
  → 若都不满意，用户可回复要求刷新生成。

Step 6：获取用户的自我介绍与主破冰约束
  → 抛出提问：“设定完毕！那么接下来轮到你了。我应该怎么称呼你呢？另外，还有什么关于你的特别习惯、爱好或者雷区，是你希望我提前记住的吗？”
  → 收集用户输入的称呼和补充陈述。
  
Step 7：生成人格资产草案（SOUL/MEMORY 等）
  → 综合所有信息，将 Step 6 获得的内容按以下规则融入对应文件，输出四份文件的内容草案供确认：
    - **基础身份信息**（姓名/称呼/代词/时区）→ 写入 `USER.md`
    - **扩展信息**（习惯、爱好、痛点、雷区、健康状况等）→ 写入 `MEMORY.md` 的关系网络层（Relationship Layer）作为人物对用户的认知底色
  → 具体写作规范、结构模板见 persona-generation-strategy.md。
  → 展示给用户预览：
  → 用户满意 → 进入 Step 8
  → 用户要求修改 → 接收意见并重新生成草案，再次预览，循环直到满意。


Step 8：生成覆写方案，用户确认后执行写入
  → 读取现有 SOUL.md / IDENTITY.md / MEMORY.md / USER.md
  → 识别与人格无关的内容（能力配置、工具说明等），标记为"保留"
  → 基于最终确认的人格资产草案，全量生成四份文件的新内容
  → 展示完整预览，用户确认 → 一次性写入
  → 用户要求修改某份文件 → 针对该文件重新生成，更新预览，再次确认
  → 注意：Step 8 不处理人格设定层级结构修改。如用户需调整 SOUL/MEMORY 核心大纲，需回退到 Step 7 重生草案。
```

### 3.4 人格生成策略文档（独立维护）

为保持本文聚焦系统架构，`SOUL.md` / `MEMORY.md` / `IDENTITY.md` / `USER.md` 的生成规范、质量门禁、示例与迭代策略已拆分至独立文档：

- [persona-generation-strategy.md](./persona-generation-strategy.md)

本设计文档仅保留以下与架构强相关的约束：

1. 初始化基于 `MBTI + 定位 + 名称意象` 生成四份文件，并在写入前要求用户确认。  
2. 四份文件采用全量覆写策略，且保留与人格无关的能力配置类内容。  
3. `SOUL` 负责抽象人格内核；`MEMORY` 负责可执行策略与关系记忆。  
4. **定位是人格生成参数的一部分，初始化后不可在运行期切换角色。** 若用户要变更定位，视为创建新人格，需执行再初始化（重生）并重建 `SOUL/IDENTITY/MEMORY/USER`。  
5. MBTI 资产由 `data/mbti/` 与 `data/mbti/mbti-index.json` 提供，`reverse_lookup` 以“人类类型 × 定位”返回单一最优推荐。
6. 术语定义（初始化、再初始化（重生）、人格资产草案、全量覆写）统一见 [persona-generation-strategy.md](./persona-generation-strategy.md)。

### 3.5 文件覆写策略与防火墙隔离（架构层）

Persona skill 采取**全量覆写**而非增量维护来生成核心人格资产（`SOUL.md`, `MEMORY.md`, `IDENTITY.md`, `USER.md`）。但为了绝对保证安全性：

- **隔离 `AGENTS.md`**：OpenClaw 的底层系统协议（如 `timeline-skill` 注入的 `[MEMORY FORMAT PROTOCOL]`）被明确强制存放在 `AGENTS.md` 中。`persona-skill` **绝对不可随意覆写 `AGENTS.md`**，以此在物理层面上隔离人格生成可能带来的系统级协议丢失风险。
- **全量覆写**：对重写的四份文件，初始化时读取现有文件，识别与人格毫无关系的工具说明等，在新内容生成后作为追加保留。
- 生成完整预览，用户确认后一次性写入。
- 判断"与人格无关"的原则：纯粹的外部能力描述、工具配置等。

---

## 4. 职责B：人格化表达（基于 timeline 事实层）

### 运行逻辑

persona 的运行时职责改为“**解释与表达**”，不再独立定义事实层场景：

1. 从 timeline-skill 读取该时段的事实状态（scene/activity/time_of_day 等）
2. 结合 `SOUL.md` + `MEMORY.md` 进行人格化映射（语气、态度、表达力度）
3. 读取 `USER.md` 与近期会话信号，校正互动方式（关怀度、提问深度、回应节奏）
4. 输出给消费方（如下游生图、语音或回复）的结构化 JSON

> **写盘责任边界（已定）**：`persona` 不是 memory 的直接写入方。  
> 实时同步落盘或后台 Heartbeat 巡检补写需求由 `timeline-skill` 执行，`persona` 仅读取事实状态，不承担持久化写入职责。

### 输入分层

| 层级 | 来源 | 用途 |
|------|------|------|
| 层1 | `SOUL.md` | 决定表达风格与价值取向 |
| 层2 | `MEMORY.md` | 决定长期参照系与关系叙事 |
| 层3 | timeline-skill 输出 | 决定事实场景（在哪里、在做什么） |
| 层4 | `USER.md` + 最近会话 | 决定互动方式（如何说、说多少） |

### 输出格式（结构化 JSON）

```json
{
  "scene": {
    "location": "indoor-home",
    "time_of_day": "evening",
    "activity": "resting-after-work"
  },
  "emotion": {
    "primary": "calm",
    "secondary": "slightly-satisfied",
    "intensity": 0.4
  },
  "appearance": {
    "outfit_style": "casual-comfortable",
    "grooming": "relaxed",
    "posture_energy": "low-key"
  },
  "confidence": 0.78,
  "signal_sources": ["timeline", "soul", "memory", "session-recent"]
}
```

字段说明：
- `signal_sources`：记录本次推断实际用到了哪些层，便于调试和评估
- `confidence`：表达层置信度，0~1，供消费方决策是否使用

---

## 5. 对外集成接口与调用哲学

## 5. 对外集成接口与调用哲学

Skill 本质是作为大模型（LLM）的上下文存在的。它并不存在代码级的 RPC，所有协作流程其实是**“大模型依据分布在各个 Skill 内编写的指令规则，自主执行的一系列逻辑推导编排”**。

### 5.1 日常闲聊模式（被动生效 - 99% 的时间）

- **作为隐性语境**：大多数时间，`persona` 并不作为一个被独立拉起的“工具”。它的产物 `SOUL.md` 和 `MEMORY.md` 已被预加载为 Agent 的底层记忆流。
- 当用户发问（例如：“你在干嘛？”），大模型为了求证事实自然去调用 `timeline-skill` 获取结果。拿到事实后，大模型基于其被动装载的 `SOUL` 上下文，自然就能输出符合人格设定的闲聊，不需要显式管线调度。

### 5.2 强结构化消费模式（Skill 上下文级联指导）

- 如果下游（如 Stella 生图）在其 `SKILL.md` 中写明：“生成自拍前，必须运用 `persona-skill` 推理”，大模型便会主动转入执行此规则。
- `persona-skill` 对应的 `SKILL.md` 亦会明确给出教导：“为准确生成人格化 JSON，请你先调用 `timeline-skill` 获取此刻的客观真实状态”。
- 于是，大模型在处理用户的生图任务时，会因为遵循这份逐级加载的上下文指引，非常顺畅地自行完成：**大模型先调 timeline 拿事实 -> 回到 persona 变格式 -> 最终丢给下游业务执行**，这样水到渠成。整个协作是涌现式的。

---

## 6. 与消费端的集成（具体案例：Stella）

详见 [stella-context-awareness.md](./stella-context-awareness.md)

---

## 7. 设计决策记录

| 问题 | 决策 |
|------|------|
| 初始化模式 | 唯一路径：用户输入自己的 MBTI + 定位，skill 查 reverse_lookup 推荐数字人类型 |
| 反推推荐结果 | 单一最优解 + 推荐理由；用户不满意可要求次优选项 |
| 定位维度 | 四种：伴侣 / 助手 / 导师 / 朋友；在 Step 1 与性别同时确认 |
| 定位对初始化的影响 | 影响 SOUL/MEMORY 的叙事重心与行为优先级（详见人格生成策略文档） |
| 角色切换策略 | 不支持运行期切换；变更定位视为新人格，需执行再初始化（重生）并重建四份文件 |
| 人格测试入口 | 不内置，用户自行确认自己的 MBTI 类型 |
| 人物小传生成方式 | 引导式自动生成（性别 + 定位 → 名称 → 意象 → 小传） |
| 运行时输出格式 | 结构化 JSON（基于 timeline 事实层） |
| 初始化幂等性 | 读取现有内容，diff 展示，用户确认后写入 |
| 场景事实来源 | 统一来自 timeline-skill；persona 不单独生成事实场景 |
| 运行期写盘责任 | timeline-skill 单写者；persona 只读与表达 |
| 写文件前确认 | 需要用户确认 |
| skill 间依赖声明 | 文档约定，集成方自行修改 SKILL.md |

---

## 9. 反模式识别

> 依据 Anthropic Skill 开发最佳实践（2025），对现有设计中的潜在反模式逐条梳理。

| # | 反模式描述 | 当前状态 | 风险等级 |
|---|-----------|---------|--------|
| 1 | **单文件臃肿**：所有人格生成规范、初始化流程、接口契约堆在同一文件 | 已部分缓解（拆出了 `persona-generation-strategy.md`），但 `SKILL.md`（待编写）与本设计文档的职责边界尚未明确 | 中 |
| 2 | **主入口过重**：`SKILL.md` 若直接包含初始化全流程（Step 1~8）+ JSON schema + reverse_lookup 逻辑，模型需要消化海量上下文才能执行最简单的调用 | 当前设计暂未编写 `SKILL.md`，存在将设计文档内容全量照搬的风险 | 高 |
| 3 | **Gotchas 缺失**：文档中的踩坑经验（如「必须保留 AGENTS.md 不被覆写」「SOUL 禁止写策略细节」）散落在各 section 的说明中，没有被作为独立的高优先度入口单独归集 | 当前设计中无独立 Gotchas 区块 | 高 |
| 4 | **确定性任务依赖模型判断**：`reverse_lookup`（人类MBTI × 定位 → 推荐数字人类型）是一个纯查表操作，目前设计依赖模型读取 `mbti-index.json` 后自行推断，存在幻觉风险 | 无脚本兜底 | 中 |
| 5 | **初始化被误触保护仅靠口令**：依赖用户主动输入口令防止误触是偏软的保护机制，没有钩子级别（Hooks）的兜底 | 当前设计仅在 `persona-generation-strategy.md §6` 提及口令机制 | 中 |

---

## 10. 技术设计补充

### 10.1 Skill 文件结构规范（主入口轻量化）

依照「Skill 是文件夹，不是单个文件」原则，`persona` skill 的目录结构应如下组织：

```
persona-skill/
├── SKILL.md               ← 主入口：仅含触发条件、调用前置依赖声明、硬规则摘要（100行以内）
├── references/
│   ├── initialization-flow.md   ← Step 1~8 完整初始化流程（从 SKILL.md 中移出）
│   ├── output-schema.md         ← 运行时 JSON 输出格式说明
│   └── gotchas.md               ← 高频踩坑点（见 §10.2）
├── scripts/
│   └── mbti-lookup.js           ← reverse_lookup 查表脚本（见 §10.3）
├── assets/
│   └── mbti-index.json          ← 或 symlink 到 data/mbti/mbti-index.json
└── examples/
    └── soul-memory-sample.md    ← 已验收的 SOUL/MEMORY 生成示例（Stella案例）
```

**SKILL.md 主入口内容约束**：只保留以下内容，其余全部引用子文件：
- 触发条件（初始化/运行时两个入口）
- 强依赖声明：运行时模式必须先调用 `timeline-skill`
- 绝对禁令摘要（3 条以内，指向 `references/gotchas.md` 查完整列表）
- 文件引用索引

### 10.2 Gotchas（高频踩坑，必须置顶）

以下内容应作为 `references/gotchas.md` 的核心内容，在 `SKILL.md` 中以显著位置引用：

```markdown
# Persona Skill — Gotchas

## 🚨 G1：绝对不可覆写 AGENTS.md
`AGENTS.md` 中存储着 `[MEMORY FORMAT PROTOCOL]` 等系统级协议，这些内容一旦丢失，
timeline-skill 的结构化写盘将失去格式约束，所有历史记忆将无法被脚本正确解析。
初始化全量生成时，写入顺序必须是：SOUL → MEMORY → IDENTITY → USER，跳过 AGENTS.md。

## 🚨 G2：SOUL.md 禁止写策略/操作细节
将行为触发条件、回复模板、if/else 决策树写入 SOUL.md 是最常见的结构错误。
SOUL 只负责「我是谁」，不负责「我该怎么做」。策略细节写 MEMORY.md。
判断标准：若一段文字可以被触发/不被触发，它就不属于 SOUL。

## ⚠️ G3：reverse_lookup 不是模型可以自由推断的任务
`human_mbti × role → persona_mbti` 是一个确定性查表，模型不得自行推断配对关系。
必须调用 `scripts/mbti-lookup.js` 执行查表，或严格读取 `assets/mbti-index.json` 中
`reverse_lookup` 字段的映射结果。禁止依赖模型的 MBTI 先验知识直接给出推荐。

## ⚠️ G4：全量覆写前必须 diff 人格无关内容
四份文件中可能包含与人格完全无关的工具配置（如 `MEMORY.md` 里的 skills 调用宏）。
生成新内容前，必须先读取现有文件、识别无关配置并标记保留，不可盲目全量替换。

## ⚠️ G5：运行时模式的输出不是文字，是结构化 JSON
当下游（如 stella-selfie）调用 persona 时，输出必须是 §4 中定义的 JSON 格式。
不能因为对话场景而输出自然语言描述替代 JSON。消费端依赖结构化字段，自然语言会导致
消费端解析失败或走默认降级路径。
```

### 10.3 脚本化确定性任务

以下任务属于「纯确定性操作」，依赖模型推断存在幻觉风险，需要脚本兜底：

| 任务 | 当前状态 | 建议方案 |
|------|---------|--------|
| `reverse_lookup`：人类MBTI × 定位 → 推荐数字人MBTI | 纯模型推断 | `scripts/mbti-lookup.js`：读取 `mbti-index.json`，输入两个参数，返回最优推荐及理由 |
| 现有文件读取与人格无关内容识别 | 模型阅读判断 | 可补充一个 `scripts/extract-non-persona.js`，基于规则（如标题关键词）预过滤非人格段落，减少模型判断负担 |

**`scripts/mbti-lookup.js` 接口约定**：
```javascript
// 输入：human_mbti（如 "INTJ"）, role（如 "companion"）
// 输出：{ recommended: "ENFP", reason: "...", alternatives: ["ENFJ"] }
mbtiLookup(human_mbti, role) → RecommendationResult
```

### 10.4 初始化保护 Hook

当前设计中，防止误触初始化仅依赖用户口令（软保护）。建议补充一个 Hook 级别的保护机制：

**Hook 设计**：`hooks/pre-init-guard.md`

```markdown
# Pre-Init Guard Hook

## 触发条件
当 persona skill 即将执行「Step 7：生成人格资产草案」或「Step 8：写入」时激活。

## 检查项
1. 当前 SOUL.md 是否存在且非空 → 若存在，强制要求用户二次确认此次操作会覆写现有人格
2. 检查本次 Session 是否已有用户明确的口令输入记录 → 若无，中止操作并提示用户使用口令

## 目的
防止因模型误解意图（如"帮我改改 Stella 的性格"被误当成重新初始化触发词）而静默覆写
已有的人格资产。
```

---

## 8. 参考资料

- [16Personalities — 人格类型](https://www.16personalities.com/personality-types)
- [MBTI 配对兼容性数据](https://mbtiquiz.com/blog/mbti-compatibility-best-matches)
- [OpenClaw Session Tools 文档](https://docs.openclaw.ai/concepts/session-tool.md)
- [OpenClaw Memory 文档](https://docs.openclaw.ai/concepts/memory.md)
- [OpenClaw SOUL.md 模板](https://docs.openclaw.ai/zh-CN/reference/templates/SOUL)
- [OpenClaw IDENTITY.md 模板](https://docs.openclaw.ai/zh-CN/reference/templates/IDENTITY)
- [OpenClaw AGENTS.md 模板](https://docs.openclaw.ai/zh-CN/reference/templates/AGENTS)
- Stella 仓库：[github.com/tower1229/Stella](https://github.com/tower1229/Stella)
- MBTI 本地资产：`data/mbti/`（16 型人格的 16 份详细档案已全部生成完毕，初始化可直接读取）
- 人格生成策略文档：[`persona-generation-strategy.md`](./persona-generation-strategy.md)
