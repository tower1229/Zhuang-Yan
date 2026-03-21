# persona-skill 通用协议 (v1)

本文档定义了 `persona-skill` 的最终输入/输出契约。
它是从 `persona-skill-design.md` 中提取出的面向实现的协议规范。

## Skill 职责

`persona-skill` 充当表达层（Expression Layer）：

- 接收并消费标准的客观事实状态（如当前所处地点、动作和时间）
- 应用人格底色约束（基于 `SOUL`/`MEMORY`）
- 运用用户/会话信号微调互动与表达策略
- 为下游消费端 Skill（如 Image Generation, TTS）输出结构化的表达状态

注意：`persona-skill` 不负责生成或持久化时间线层面的事实，它专注于“如何表达”。

## 输入 (Input)

### 显式输入 (Explicit Input)

- 面向最终用户的直接调用不需要任何必填参数。
- 运行时由外部会话环境或者上游数据编排节点触发并传递事实上下文。

### 自动收集的内部输入 (Internal Auto-Collected Inputs)

- 客观事实状态数据（如 `TimelineWindow` 或被选取描述的情节）
- `SOUL.md`
- `MEMORY.md`
- `USER.md`
- 近期的会话信号（用于微调互动风格）

## 输出 (Output)

### 核心输出: 表达状态 JSON (Expressive State JSON)

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
  "signal_sources": ["timeline", "soul", "memory", "session-recent"]
}
```

## 面向下游消费者的依赖契约 (Required Contract for Downstream Consumers)

消费端必须解析的输出字段：

- `scene.location`
- `scene.activity`
- `scene.time_of_day`
- `emotion.primary`
- `appearance.outfit_style`
- `camera.suggested_mode`
- `camera.lighting`
- `confidence`

若必需字段缺失，消费端必须实施安全降级。

## 上游事实输入的消费契约 (Consumption Contract from Factual Upstream)

如果上游存在事实供应方（如 `timeline-skill`），为保证高质量推断，应期待包含如下字段：

- `schema_version`
- `window.calendar_date`
- `resolution.mode`
- `episodes` (至少一条)
- `episodes[*].temporal.start`
- `episodes[*].state_snapshot.scene.location_label`
- `episodes[*].state_snapshot.scene.activity`
- `episodes[*].state_snapshot.scene.time_of_day`
- `episodes[*].state_snapshot.emotion.primary`
- `episodes[*].state_snapshot.appearance.outfit_style`
- `episodes[*].provenance.confidence`

若不存在可消费的 episode，`persona-skill` 应当返回一个低置信度（low-confidence）的表达输出，以便下游消费端触发其特有的回退策略。

## 写盘责任边界 (Write Responsibility Boundary)

- `persona-skill` 并非规范记忆（canonical memory）的写入方。
- 涉及到存储层面的实时同步落盘或后台 Heartbeat 巡检补写，应交由专职的时间线组件负责。
- `persona-skill` 可以在必要时提示或触发写行为，但绝不允许其直接将事实写回磁盘持久化。

## （可选）家族技能生态配合 (Family Skill Integration)

虽然 `persona-skill` 在设计上完全独立于特定事实提供者，但作为家族生态的一部分，它能与 `timeline-skill` 天然配合：
当两者集成工作时，`timeline-skill` 作为稳固的事实输入源，直接将其 `TimelineWindow` 的输出交送给 `persona-skill`。`persona` 层负责处理这些生硬的事实并转化为多模态可用和具有强烈人格色彩的 JSON 表现力输出。集成协议只需对齐两边的输入/输出字段即可。

## 版本管理 (Versioning)

- `major` 版本不匹配：拒绝执行并触发降级。
- `minor` 版本不匹配：只要向前兼容，则忽略未知字段。
- 协议升级必须与 `timeline-skill` 以及所依赖的下游消费端规范保持同步。
