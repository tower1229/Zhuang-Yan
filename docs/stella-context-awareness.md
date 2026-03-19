# Stella × Persona — 情景感知集成方案

> 更新时间：2026-03-19  
> 状态：设计完成，待实现  
> 依赖文档：[persona-skill-design.md](./persona-skill-design.md)

---

## 1. 背景与目标

**现状**：Stella 的自拍 prompt 完全依赖用户输入。当用户说"发张自拍"但未指定场景时，Stella 使用默认 mirror 模式，生成结果与数字人当下状态无关，真实感不足。

**目标**：当用户请求自拍且未指定明确场景时，Stella 自动调用 `persona` skill 的情景感知能力，推断合理的场景/情绪/形象，生成与数字人当下状态一致的自拍。

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

## 3. 调用链

```
用户："发张自拍"（无明确场景）
  ↓
Stella SKILL.md 检测到无明确场景关键词
  ↓
指示 agent：调用 persona skill 的情景感知能力
  ↓
persona skill 读取四层输入：
  - SOUL.md 人格特质
  - MEMORY.md 人物小传
  - memory/YYYY-MM-DD.md 近期流水
  - 最近 1h 会话历史（sessions_list + sessions_history）
  ↓
输出结构化 JSON（见下方格式）
  ↓
Stella 消费 JSON → 组装 prompt
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

当 `persona` skill 不可用时（未安装、agent 无法找到对应指令），Stella 回退到现有行为：
- 无场景关键词 → 默认 mirror 模式
- 有场景关键词 → 按现有关键词匹配逻辑选择模式

降级对用户透明，不报错，不提示。

---

## 6. 需要修改的文件

### 6.1 `templates/SOUL.fragment.md`（Stella 侧）

在"Mode selection"部分之前，新增情景感知规则：

```markdown
### Context-Aware Mode (when no scene is specified)

When the user requests a selfie/photo without specifying a scene, location, 
outfit, or activity:

1. Call `persona` skill to get the current context state
2. Use the returned JSON to assemble the prompt:
   - `camera.suggested_mode` → select mirror or direct mode
   - `scene` fields → location and activity description
   - `emotion` fields → expression and mood description  
   - `appearance` fields → outfit and style description
   - `camera.lighting` → lighting description
3. If `confidence < 0.5` or persona skill is unavailable → fall back to default mirror mode
```

### 6.2 `SKILL.md`（Stella 侧）

在"Step 1: Collect User Input"之前，新增 Step 0：

```markdown
### Step 0: Context Inference (when no scene specified)

If the user's request contains no scene keywords (location, outfit, activity):

1. Check if `persona` skill is available
2. If available: invoke persona skill's context sensing capability
3. Use the returned structured JSON in Step 2 to assemble the prompt
4. If unavailable or confidence < 0.5: skip to Step 1 with default mirror mode
```

---

## 7. 实现优先级建议

```
Phase 1（先做）：
  - persona skill 的初始化流程（职责A）
  - 验证 SOUL.md / MEMORY.md 写入效果

Phase 2：
  - persona skill 的情景感知输出（职责B）
  - 验证 JSON 输出格式和内容质量

Phase 3：
  - Stella 集成情景感知
  - 端到端测试：无场景自拍请求 → 情景推断 → 生图
```

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
- Stella `SKILL.md` — 现有 Step-by-Step 指令
- Stella `templates/SOUL.fragment.md` — 现有 SOUL 配置片段
- [OpenClaw Session Tools](https://docs.openclaw.ai/concepts/session-tool.md)
