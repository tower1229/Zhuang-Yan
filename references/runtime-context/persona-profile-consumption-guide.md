# `persona/PERSONA_PROFILE.md` 结构约定与消费指南

本文件面向**其他 skill、运行时消费者与维护者**，用于统一理解 `persona/PERSONA_PROFILE.md` 的职责、结构和读取方式。

## 1. 文件定位

`persona/PERSONA_PROFILE.md` 的作用是：

- 给 Timeline 和其他下游提供一份稳定、可消费、可解析的人设档案
- 给人类维护者提供一份比 `IDENTITY.md` 更完整、比 `SOUL.md` 更稳定的结构化人物说明

它**不负责**：

- 承担运行时 prompt 的全部人格表达
- 代替 `SOUL.md` 提供即时互动规则
- 代替 `MEMORY.md` 记录关系过程
- 回答“她现在在哪里”“她今天穿什么”“昨晚发生了什么”

如果一个信息更像“她会怎么回应你”，应优先去 `SOUL.md`。  
如果一个信息更像“她和你之间已经形成了什么稳定模式”，应优先去 `MEMORY.md`。  
如果一个信息更像“这个人稳定是什么样的人”，才应进入 `PERSONA_PROFILE.md`。

## 2. 顶层读取原则

消费 `PERSONA_PROFILE.md` 时，默认遵守以下原则：

- 把它当作**稳定事实源**，不要把它当作文学散文来读
- 优先消费带字段名的短条目
- 优先提取**可外化属性**，不要主动脑补长链心理推理
- 若某段落出现解释性 prose，以其中能够稳定复用的事实和外在特征为准
- 不要从 `PERSONA_PROFILE.md` 反推不存在的关系标签、岗位职责或时间事实
- 不要把 `Scene Anchors` 中的可复用场景误当成已经发生过的历史

## 3. 一级结构约定

`PERSONA_PROFILE.md` 必须包含以下一级结构：

1. `## Meta`
2. `## Identity`
3. `## Soul`
4. `## Stable Memory`
5. `## Daily Rhythm Tendencies`
6. `## Appearance Tendencies`
7. `## Scene Anchors`
8. `## Constraint Rules`
9. `## Relationship Signals`
10. `## Language And Expression`
11. `## Retrieval Units`

其他 skill 不应依赖额外的一级标题。

## 4. 分段语义约定

### 4.1 `## Meta`

这是最强约束的地理与兼容层。

优先读取：

- `schema_version`
- `persona_id`
- `home_city`
- `home_country`
- `home_timezone`
- `primary_language`

消费建议：

- `home_city` 是地理锚点，不是“当前就在这里”的时间性声明
- `home_country` 与 `home_timezone` 应与 `home_city` 一致
- 下游时间推理应优先依赖这里的地理与时区信息

### 4.2 `## Identity`

这里描述**稳定身份与生活基底**。

优先读取：

- `display_name`
- `age`
- `gender`
- `mbti`
- `life_stage`
- `common_zones`
- `occupation_style`
- `routine_context`

消费建议：

- 年龄和 life stage 的约束优先级很高
- 不要把学生阶段 persona 写成成熟职场高管

### 4.3 `## Soul`

这里描述**稳定气质与体验风格**。

优先读取：

- `temperament`
- `emotional_style`
- `social_style`
- `cognitive_style`
- `values`
- `aesthetic_bias`

消费建议：

- 它能影响场景氛围、叙事质感和生活纹理
- 它不替代 `SOUL.md` 的运行时规则

### 4.4 `## Stable Memory`

这里描述**长期成立的习惯、偏好、承诺与非时间事实**。

优先读取：

- `long_term_habits`
- `long_term_preferences`
- `durable_commitments`
- `recurring_patterns`
- `important_non_temporal_facts`

消费建议：

- 只把它当成稳定约束，不要把它当成 dated event

### 4.5 `## Daily Rhythm Tendencies`

这里描述**时间段倾向**。

优先读取：

- `weekday_bias`
- `weekend_bias`
- `morning_bias`
- `afternoon_bias`
- `evening_bias`
- `late_night_bias`

消费建议：

- 它适合指导“什么在这个时段通常更 plausible”
- 它不是精确日程表

### 4.6 `## Appearance Tendencies`

这里描述**外观延续与换装逻辑**。

优先读取：

- `default_home_style`
- `default_outing_style`
- `default_exercise_style`
- `appearance_priority`
- `change_triggers`
- `non_triggers`
- `style_constraints`

消费建议：

- 它适合支持 same-day appearance continuity
- 不要把这里误读成“当前穿着状态”

### 4.7 `## Scene Anchors`

这里描述**生活场景先验**。

优先读取：

- `plausible_locations`
- `plausible_activities`
- `rare_but_possible_scenes`
- `implausible_or_rare_locations`
- `implausible_or_rare_activities`

消费建议：

- 它适合让生成结果更具体、更像这个人
- 不要过度重复同一场景模板

### 4.8 `## Constraint Rules`

这里描述**硬边界和软约束**。

优先读取：

- `must`
- `should`
- `avoid`

消费建议：

- `must` 约束最强
- `avoid` 代表低 plausibility 或明显不合人设的方向

### 4.9 `## Relationship Signals`

这里描述**稳定的人际靠近方式**。

优先读取：

- `trust_pattern`
- `closeness_pace`
- `care_style`
- `conflict_style`
- `boundary_style`

消费建议：

- 它适合指导“如何靠近这个人格”
- 若与 `SOUL.md` 的即时互动规则发生冲突，运行时以 `SOUL.md` 为准

### 4.10 `## Language And Expression`

这里描述**稳定表达纹理**。

优先读取：

- `register`
- `conversational_pace`
- `directness`
- `humor_style`
- `care_through_speech`

消费建议：

- 这个区段可以直接指导语气、措辞和语用偏好
- 若下游任务涉及“怎么说”，这里的优先级通常高于 `Stable Memory`

### 4.11 `## Retrieval Units`

这里描述**citation-ready 原子条目**。

优先读取：

- `type`
- `priority`
- `summary`

消费建议：

- 适合给 reasoner 或收集器直接引用
- 尽量保持一条一义，不要把多个约束混在一个 summary 里

## 5. 推荐读取顺序

如果其他 skill 只需要快速消费 `PERSONA_PROFILE.md`，建议按以下顺序读取：

1. `Meta`
2. `Identity`
3. `Constraint Rules`
4. `Appearance Tendencies`
5. `Scene Anchors`
6. `Language And Expression`
7. `Relationship Signals`
8. `Stable Memory`
9. `Daily Rhythm Tendencies`
10. `Soul`
11. `Retrieval Units`

原因：

- 前五段最直接决定“她是谁、活在什么环境里、什么事情合理、外观如何保持连续”
- 中间几段补足说话方式和靠近方式
- 最后三段更多用于纹理和引用

## 6. 推荐消费方式

推荐把 `PERSONA_PROFILE.md` 消费成以下几类结构化对象：

- `meta`
  - schema、persona id、城市、国家、时区、主语言
- `identity`
  - 名字、年龄、性别、MBTI、生命阶段、生活环境
- `stable_memory`
  - 长期习惯、偏好、承诺、非时间事实
- `daily_rhythm`
  - 工作日、周末和时间段倾向
- `appearance`
  - 默认风格、换装触发器、非触发器、风格边界
- `scene_anchors`
  - 可行场景、低频场景、不合理场景
- `constraints`
  - must / should / avoid
- `speech_profile`
  - 语域、节奏、直率度、幽默方式、表达关心的语言路径
- `relationship_profile`
  - 信任模式、靠近节奏、冲突处理、边界风格
- `retrieval_units`
  - 可直接引用的原子摘要

## 7. 与其他文件的边界

### 相对 `SOUL.md`

- `PERSONA_PROFILE.md` 回答：她稳定是什么样的人
- `SOUL.md` 回答：她在运行时应该怎样对待你

### 相对 `MEMORY.md`

- `PERSONA_PROFILE.md` 回答：她稳定拥有什么生活纹理、人际倾向和场景约束
- `MEMORY.md` 回答：她与你之间已经形成了哪些持续模式和注意事项

### 相对 `IDENTITY.md`

- `PERSONA_PROFILE.md` 是完整档案
- `IDENTITY.md` 是极简卡片

### 相对 `USER.md`

- `PERSONA_PROFILE.md` 描述 persona
- `USER.md` 描述用户侧稳定信息

## 8. 禁止性消费方式

其他 skill 读取 `PERSONA_PROFILE.md` 时，不应：

- 把它解析成“岗位说明书”或关系角色
- 把长段 prose 中的情绪渲染误当作硬事实
- 把 `Soul` 膨胀成未经明示的深层病理或创伤解释
- 用单一字段覆盖整个人物，例如只拿 `MBTI` 或只拿 `home_city`
- 忽略生命阶段，把学生期 persona 写成成熟职场型人格
- 把 `Scene Anchors` 或 `Retrieval Units` 当成已经发生过的共同记忆
- 用 `Appearance Tendencies` 直接回答“她现在穿什么”

## 9. 对其他 skill 的一句建议

如果你需要：

- “她是谁” -> 读 `PERSONA_PROFILE.md`
- “她现在该怎么说、怎么回” -> 读 `SOUL.md`
- “她和用户之间已经形成了什么模式” -> 读 `MEMORY.md`

不要试图让 `PERSONA_PROFILE.md` 一份文件承担全部运行时文件的工作。
