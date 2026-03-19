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
  → 性别影响名称候选和小传的代词/叙事视角
  → 定位（伴侣/助手/导师/朋友）影响 SOUL.md 的行为基调
  → 直接模式：此步同时收集定位
  → 反推模式：定位已在 Step 0 确认，此步只确认性别

Step 2：生成 3 个候选名称
  → 基于性别，生成 3 个有辨识度的名字
  → 用户不满意 → 继续生成 3 个，直到满意为止

Step 3：分析所选名称的文化关联意象
  → 名字的词源、历史人物、文化符号、情感色调
  → 此步输出是人物小传生成的"种子"

Step 4：基于 MBTI + 定位 + 名称意象 自动生成人物小传
  → 包含：成长背景、当前生活状态、重要关系、
         标志性经历、日常习惯和偏好
  → 定位影响小传的叙事重心（伴侣定位强化情感线，助手定位强化成就线）
  → 展示给用户预览

Step 5：生成编辑方案，用户确认后执行写入
  → 读取现有 SOUL.md / IDENTITY.md / MEMORY.md
  → 生成 diff 方案：相关内容覆盖，不相关内容保留
  → 用户确认 → 写入文件
```

### 3.4 定位对 SOUL.md 的影响

同一个 MBTI 类型，不同定位会生成不同的 SOUL.md 行为基调：

| 定位 | SOUL.md 基调调整方向 |
|------|-------------------|
| 伴侣 | 强化情感在场感，允许主动分享状态，增加个人化表达 |
| 助手 | 强化任务导向，减少情感铺垫，提高响应效率 |
| 导师 | 强化洞察力表达，允许主动提出建议，增加引导性问题 |
| 朋友 | 强化轻松感，允许闲聊和玩笑，降低正式感 |

### 3.5 幂等性保证

每次初始化前，skill 必须：
1. 读取三个目标文件的现有内容
2. 识别哪些内容属于 persona skill 管辖范围（用标记区分，如 `<!-- persona-managed -->`）
3. 只覆盖管辖范围内的内容，保留用户自己写的其他内容
4. 展示完整 diff，用户确认后才写入

### 3.6 MBTI 本地资产

16 种类型的完整描述存储在 `data/mbti/` 目录，每个文件包含两层：

**背景知识层**（供小传生成使用）：
- 核心人格特征
- 优势与弱势
- 职业倾向
- 情感模式

**操作层**（直接写入 SOUL.md 和情景感知使用）：
- `tone_style`：语气与表达风格
- `emotion_patterns`：情绪反应模式
- `aesthetic_preferences`：审美偏好（场景/光线/穿搭）
- `default_solitude_state`：无信号时的默认情景
- `social_patterns`：社交行为模式
- `context_mapping`：会话信号 → 情景输出映射表

配对关系层（供反推模式使用）：
- `compatibility.best/good/challenging`：兼容性分级
- `reverse_lookup`：人类类型 + 定位 → 推荐数字人类型

---

## 4. 职责B：情景感知

### 推断逻辑

让模型内部回答：

> "根据我的人格特质、人生经历、近期记忆和最近的对话，我现在过得怎么样？此刻我可能在哪里、在做什么、是什么状态？"

会话历史读取方式：
- `sessions_list`：`activeMinutes=60`，`kinds=["main","node","other"]`，`messageLimit=8`
- `sessions_history`：必要时补全细节

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
| 定位对初始化的影响 | 影响 SOUL.md 行为基调和人物小传叙事重心 |
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
