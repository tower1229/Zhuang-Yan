# Stella × Timeline × Persona — 情景感知集成方案

> 更新时间：2026-03-19  
> 状态：实施规范（v1）  
> 依赖文档：[persona-skill-design.md](./persona-skill-design.md)

---

## 1. 背景与目标

**现状**：Stella 的自拍 prompt 完全依赖用户输入。当用户说"发张自拍"但未指定场景时，Stella 使用默认 mirror 模式，生成结果与数字人当下状态无关，真实感不足。

**目标**：当用户请求自拍且未指定明确场景时，大模型基于意图触发 Stella Skill。Stella 会在其指令上下文中指导大模型：在缺乏场景时，应优先遵循 `persona-skill` 的规则获取构图与情感；而 `persona-skill` 的上下文又会指导大模型调用 `timeline-skill` 拿取事实。最终由大模型根据这一套逐级指导的上下文（Skill Instructions），顺畅完成“事实获取 -> 人格渲染 -> 自拍生成”的编排。

---

## 2. 触发条件

以下情况触发情景感知调用：

**触发**（无明确场景）：
- "发张自拍"
- "发张照片"
- "让我看看你现在的样子"
- "你在干嘛"

**不触发**（有明确场景关键词）：
- 包含地点：cafe / beach / park / 咖啡馆 / 海边...
- 包含服饰：wearing / dress / outfit / 穿着...
- 包含活动：at a party / 在派对...

判断逻辑沿用 Stella 现有的关键词检测，无关键词命中时进入情景感知流程。

---

## 3. 编排链（基于 Skill 上下文指令驱动）

Skill 的本质是大模型的上下文载体。不存在独立于大模型的“硬编码底层脚本调用链”，一切流转均由大模型遵循对应 Skill 的指令要求，自发完成运行编排。

```text
用户："发张自拍"（无明确场景）
  ↓
大模型识别自拍意图，决定遵守 `stella-selfie` skill。
  ↓
大模型阅读 `stella-selfie` 的上下文指令，发现此时参数不足（无明确场景），
并根据指导要求，决定运用 `persona-skill` 规则来获取构图与情感表达。
  ↓
大模型进入执行 `persona-skill` 的语境，阅读其指令要求，
得知需要事实锚点，并被指导去调用时间引擎 `timeline-skill`。
  ↓
大模型调用 `timeline-skill`，触发其读取/写入记忆，返回事实状态 JSON。
  ↓
大模型携事实 JSON，继续完成 `persona-skill` 的上下文约束，生成表现力 JSON。
  ↓
大模型带着这两步获得的结构化数据，顺理成章回到 Stella 各配置项中组装出 Prompt。
  ↓
生图 → 发送
```

---

## 4. JSON → Prompt 映射规则

### 4.1 模式选择

| `camera.suggested_mode` | Stella 模式 |
|------------------------|------------|
| `direct` | Direct Selfie 模式 |
| `mirror` | Mirror Selfie 模式（默认） |

### 4.2 Direct 模式 prompt 组装

基础模板：
```
a close-up selfie taken by herself at [scene_desc], [emotion_desc], 
direct eye contact with the camera, looking straight into the lens, 
eyes centered and clearly visible, not a mirror selfie, 
phone held at arm's length, face fully visible
```

字段填充：
- `[scene_desc]`：`scene.location` + `scene.activity` + `scene.time_of_day`
- `[emotion_desc]`：`emotion.primary` + `emotion.secondary`（intensity 低时省略 secondary）

示例：
```
a close-up selfie taken by herself at home in the evening, 
just finished work, feeling calm and slightly satisfied,
direct eye contact with the camera...
```

### 4.3 Mirror 模式 prompt 组装

基础模板：
```
make a pic of this person, but [context_desc]. the person is taking a mirror selfie
```

字段填充：
- `[context_desc]`：`appearance.outfit_style` + `scene.activity` + `emotion.primary`

示例：
```
make a pic of this person, but in casual comfortable clothes, 
resting after work, looking calm. the person is taking a mirror selfie
```

### 4.4 光线补充

当 `camera.lighting` 有值时，追加到 prompt 末尾：

| `camera.lighting` | 追加描述 |
|-------------------|---------|
| `warm-indoor` | `warm indoor lighting` |
| `natural-daylight` | `natural daylight, soft shadows` |
| `cool-office` | `cool office lighting` |
| `low-key` | `dim ambient light, moody atmosphere` |

### 4.5 置信度处理

| `confidence` | 处理策略 |
|-------------|---------|
| ≥ 0.75 | 直接使用推断结果 |
| 0.5 ~ 0.75 | 使用推断结果，但场景描述保守化（去掉具体活动，只保留 location + time） |
| < 0.5 | 忽略推断结果，回退到默认 mirror 模式 |

---

## 5. 降级策略

当 `timeline-skill` 或 `persona` skill 不可用时（未安装、agent 无法找到对应指令），Stella 回退到现有行为：
- 无场景关键词 → 默认 mirror 模式
- 有场景关键词 → 按现有关键词匹配逻辑选择模式

降级对用户透明，不报错，不提示。

---

## 6. 实施规范（Stella 侧）

### 6.1 `templates/SOUL.fragment.md`（Stella 侧）

在 `templates/SOUL.fragment.md` 的 "Mode selection" 部分之前，**必须**新增以下指导大模型的指令：

```markdown
### Context-Aware Mode (when no scene is specified)

When the user requests a selfie/photo without specifying a scene, location, 
outfit, or activity:

1. You must use the `persona-skill` to transform the current state into expressive scene parameters.
2. Follow the instructions of `persona-skill` (which will likely require you to fetch factual state from `timeline-skill` first).
3. Use the resulting JSON to assemble the final selfie prompt.
```

### 6.2 `SKILL.md`（Stella 侧）

新增 Step 0，约束大模型在无场景时的行为，使其充当协调者。

```markdown
### Step 0: Context Inference (when no scene specified)

If the user's request contains no scene keywords (location, outfit, activity):

1. Do NOT hallucinate a background. Instead, strictly follow the rules of `persona-skill` to define the expressive context.
2. Once the contextual generation is completely resolved, input the derived result into Step 1.
```

---

## 7. 实现优先级建议

```
Phase 1（先做）：
  - persona skill 的初始化流程（职责A）
  - 验证 SOUL.md / MEMORY.md 写入效果

Phase 2：
  - timeline-skill 的事实状态输出（memory 读写 + 非空返回）
  - persona skill 的表达层输出（消费 timeline）
  - 验证 JSON 输出格式和内容质量

Phase 3：
  - Stella 集成情景感知
  - 端到端测试：无场景自拍请求 → timeline（事实）→ persona（表达）→ 生图
```

### 7.1 强制执行约束（MUST）

### 7.1 强制执行约束（MUST）

1. 必须在系统级 `SKILL.md` 中指引模型通过意图自行完成顺滑降级判断，不得在内部写死调用指令语法。
2. 若 `timeline-skill` 返回无效，大模型应该自动依靠 Stella `SKILL.md` 里的异常处理策略退回默认镜面模式，杜绝其自行脑补 `location` 或 `activity`。
3. 若底层表现能力 `confidence < 0.5`，按照上下文约定，由大模型判断走保守或默认回退策略（按 §4.5）。

---

## 8. 评估指标

上线后建议观察：

| 指标 | 说明 |
|------|------|
| `scene_relevance` | 生成场景与当时会话内容的相关度（人工评估） |
| `user_correction_rate` | 用户收到自拍后二次要求修改的比例 |
| `confidence_distribution` | 置信度分布，低置信度比例过高说明信号不足 |
| `fallback_rate` | 回退到默认模式的比例 |

---

## 9. 参考

- [persona-skill-design.md](./persona-skill-design.md) — persona skill 完整设计
- `timeline-skill-design.md`（Her 仓库）— timeline 事实层设计
- Stella `SKILL.md` — 现有 Step-by-Step 指令
- Stella `templates/SOUL.fragment.md` — 现有 SOUL 配置片段
- [OpenClaw Session Tools](https://docs.openclaw.ai/concepts/session-tool.md)
