# Persona Skill — 设计文档

> 更新时间：2026-03-19  
> 状态：调研完成，待实现

---

## 1. 项目背景

本文档记录 `persona` skill 的完整设计思路，来源于对 Stella 自拍真实性体验的需求讨论。

**核心问题**：当用户请求自拍但未指定场景时，Stella 缺乏推断合理场景/情绪/形象的能力，导致生成结果与数字人当下状态脱节，真实感不足。

**解决思路**：建立一个独立的 `persona` skill，为数字人提供：
1. 稳定的人格底色（基于 MBTI 框架 + 人物小传）
2. 实时的情景感知能力（基于 OpenClaw 记忆系统 + 近期会话）

`persona` skill 作为横向基础能力，可被 `stella-selfie` 及未来所有需要人格化能力的 skill 调用。

---

## 2. 系统架构

### 三层结构

```
层1：人格底色（静态，初始化一次）
  IDENTITY.md  ← 基础元数据（名字/气质/头像）
  SOUL.md      ← 行为准则/语气/价值观/情绪反应模式
  MEMORY.md    ← 人物小传（完整人生记忆底色）

层2：persona skill（动态，运行时）
  读取层1 + 读取近期会话 + 读取 memory/YYYY-MM-DD.md
  → 输出结构化情景状态 JSON

层3：消费方 skill（执行，运行时）
  接收层2的结构化输出
  → 各自完成具体能力（生图/语音/文字等）
```

### OpenClaw 记忆系统的四层输入

情景感知综合以下四层，越近的信号权重越高，但不能完全覆盖底色：

| 层级 | 来源 | 特性 |
|------|------|------|
| 层1 | `SOUL.md` 人格特质 | 稳定底色，决定"反应模式" |
| 层2 | `MEMORY.md` 人物小传 | 人生底色，决定"参照系" |
| 层3 | `memory/YYYY-MM-DD.md` | 近期流水，决定"近期基调" |
| 层4 | 最近 1h 会话历史 | 当下信号，决定"此刻状态" |

---

## 3. 职责A：初始化

### 3.1 两种初始化模式

Persona skill 支持两种初始化入口，共用同一个对话流程，通过第一步的用户选择分支：

```
入口问题："你想直接选择数字人的人格类型，还是先告诉我你自己的 MBTI，让我来推荐最适合你的类型？"

├── 模式A：直接模式
│   用户直接指定数字人 MBTI 类型
│   → 进入 Step 1（性别 + 定位）
│
└── 模式B：反推模式
    用户输入自己的 MBTI 类型
    → skill 询问定位（伴侣/助手/导师/朋友）
    → skill 输出单一最优推荐 + 推荐理由
    → 用户确认后进入 Step 1（性别 + 定位已知）
```

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

### 3.3 引导式初始化流程（六步）

```
Step 0（仅反推模式）：输出推荐类型 + 理由，等待用户确认
  → 用户确认后，数字人类型已确定，携带定位信息进入 Step 1

Step 1：确认性别 + 数字人定位
  → 性别影响名称候选和人格资产文案的代词/叙事视角
  → 定位（伴侣/助手/导师/朋友）影响 SOUL.md 的行为基调
  → 直接模式：此步同时收集定位
  → 反推模式：定位已在 Step 0 确认，此步只确认性别

Step 2：生成 3 个候选名称
  → 基于性别，生成 3 个有辨识度的名字
  → 用户不满意 → 继续生成 3 个，直到满意为止

Step 3：分析所选名称的文化关联意象
  → 名字的词源、历史人物、文化符号、情感色调
  → 此步输出是人格资产生成的"种子"

Step 4：基于 MBTI + 定位 + 名称意象 生成人格资产草案
  → 输出草案包含：SOUL / MEMORY / IDENTITY / USER
  → 具体写作规范、结构模板与质量门禁见 persona-generation-strategy.md
  → 展示给用户预览
  → 用户满意 → 进入 Step 5
  → 用户要求修改 → 接收意见并重新生成草案，再次预览，循环直到满意

Step 5：生成覆写方案，用户确认后执行写入
  → 读取现有 SOUL.md / IDENTITY.md / MEMORY.md / USER.md
  → 识别与人格无关的内容（能力配置、工具说明等），标记为"保留"
  → 基于最终确认的人格资产草案，全量生成四份文件的新内容
  → 展示完整预览，用户确认 → 一次性写入
  → 用户要求修改某份文件 → 针对该文件重新生成，更新预览，再次确认
  → 注意：Step 5 不处理人格设定层修改。如用户在此步要求调整 SOUL/MEMORY 核心设定，
           需回退到 Step 4 重生草案，再重新触发 Step 5
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

### 3.5 文件覆写策略（架构层）

Persona skill 对四份文件采用**全量覆写**而非增量维护：

- 初始化时，读取现有文件并识别与人格设定无关的内容（如能力配置、工具说明）
- 人格相关内容全部按新人格重建
- 与人格无关的内容原样保留并追加
- 生成完整预览，用户确认后一次性写入

判断"与人格无关"的原则：内容描述能力、工具或外部系统集成，而非角色性格、语气、情感或关系。

---

## 4. 职责B：情景感知

### 推断逻辑

情景感知综合**五层输入**，依次读取并加权：

| 层级 | 来源 | 用途 |
|------|------|------|
| 层1 | `SOUL.md` 人格特质 | 决定"反应模式"底色 |
| 层2 | `MEMORY.md` 人物小传 | 决定"参照系"和习惯偏好 |
| 层3 | `memory/YYYY-MM-DD.md` | 决定"近期基调" |
| 层4 | 最近 1h 会话历史 | 决定"此刻场景和情绪" |
| 层5 | `USER.md` 能量信号 | 校正"互动方式"维度（而非场景维度） |

> 层5 的作用是：根据用户当前状态的行为线索（如"话变少了"、"在问很基础的问题"），判断此刻应该用什么方式与用户互动，而不是改变场景推断结果本身。

让模型内部回答两个问题：

**问题A（场景）**：根据层1-4，我现在过得怎么样？此刻我可能在哪里、在做什么、是什么状态？

**问题B（互动方式）**：根据层5，用户现在处于什么能量状态？我应该以什么方式出现？

会话历史读取方式：
- `sessions_list`：`activeMinutes=60`，`kinds=["main","node","other"]`，`messageLimit=8`
- `sessions_history`：必要时补全细节

### 信号匹配策略

优先使用 `context_mapping` 中的预定义信号类型（`signal_just_completed_task`、`signal_deep_in_work` 等）进行精确匹配。

**当会话信号无法匹配任何预定义类型时**，不应强行套用最近似的类型，而是：
1. 基于层1-3（人格底色 + 记忆）推断一个合理的默认状态
2. 将 `confidence` 值相应降低（建议 0.5 以下）
3. 在 `signal_sources` 中标记为 `["soul", "memory-inferred"]`，不包含 `session-recent`

这确保了即使会话信号模糊，输出仍然是人格一致的，而非随机的。

### 无信号处理

当记忆系统为空、会话历史极短时，**不需要降级**。"无事可做、独处"本身就是一种情景。MBTI 框架对每种人格的独处状态都有明确描述（`default_solitude_state` 字段），可以直接输出。

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
  "camera": {
    "suggested_mode": "direct",
    "distance": "close-up",
    "lighting": "warm-indoor"
  },
  "confidence": 0.78,
  "signal_sources": ["soul", "memory-today", "session-recent"]
}
```

字段说明：
- `signal_sources`：记录本次推断实际用到了哪些层，便于调试和评估
- `confidence`：推断置信度，0~1，供消费方决策是否使用推断结果
- `camera.suggested_mode`：直接映射到 Stella 的 `mirror` / `direct` 模式选择

---

## 5. 对外集成接口

### 面向 skill 开发者

`persona` skill 不提供原生的 skill 间调用机制（OpenClaw 不支持），而是通过文档约定集成方式：

**集成方式**：在需要人格化能力的 skill 的 `SKILL.md` 中，明确指示 agent：
1. 在执行核心能力前，先按照 `persona` skill 的指引获取情景状态
2. 消费返回的结构化 JSON，映射到自己的参数

**降级策略**（建议）：
- 如果 `persona` skill 可用 → 调用情景感知
- 如果不可用（agent 找不到对应指令）→ 使用自身的默认逻辑

**文档责任**：`persona` skill 的 README 需要提供清晰的集成示例，集成方自行按照示例修改 SKILL.md。

---

## 6. 与 Stella 的集成（具体案例）

详见 [stella-context-awareness.md](./stella-context-awareness.md)

---

## 7. 设计决策记录

| 问题 | 决策 |
|------|------|
| 初始化模式 | 两种模式共用入口：直接模式（用户指定类型）+ 反推模式（用户输入自己 MBTI，skill 推荐） |
| 反推推荐结果 | 单一最优解 + 推荐理由；用户不满意可要求次优选项 |
| 定位维度 | 四种：伴侣 / 助手 / 导师 / 朋友；在 Step 1 与性别同时确认 |
| 定位对初始化的影响 | 影响 SOUL/MEMORY 的叙事重心与行为优先级（详见人格生成策略文档） |
| 角色切换策略 | 不支持运行期切换；变更定位视为新人格，需执行再初始化（重生）并重建四份文件 |
| 人格测试入口 | 不内置，用户自行确认自己的 MBTI 类型 |
| 人物小传生成方式 | 引导式自动生成（性别 + 定位 → 名称 → 意象 → 小传） |
| 情景感知输出格式 | 结构化 JSON |
| 初始化幂等性 | 读取现有内容，diff 展示，用户确认后写入 |
| 无信号降级 | 不需要，独处本身是有效情景（使用 `default_solitude_state`） |
| 写文件前确认 | 需要用户确认 |
| skill 间依赖声明 | 文档约定，集成方自行修改 SKILL.md |

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
- MBTI 本地资产：`data/mbti/`（INTJ.md 为完整样本，其余待生成）
- 人格生成策略文档：[`persona-generation-strategy.md`](./persona-generation-strategy.md)
