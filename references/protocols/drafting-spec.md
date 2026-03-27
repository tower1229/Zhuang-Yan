# 起草执行规范

本文件是人格初始化起草阶段的唯一执行规范。

- 负责：必备输入、渐进式读取顺序、写入安全边界、四段流水线、事实账本、人物规格、五文件合同、城市策略、审核与回炉。
- 不负责：触发示例、用户采访脚本、Step 1-7 的问法与选项呈现。

## 1. 起草前必须已经锁定的输入

在起草前，以下输入必须全部已经可用：

- `human_mbti`
- `persona_mbti`
- `role`
- `gender`
- `persona_name`
- `human_intro`
- `interview_language`
- reverse lookup 返回的单一推荐理由
- `persona_canon_facts`
  - 本轮只允许显式锁定年龄

同时必须准备以下派生输入：

- `human_need_profile`
- `execution_trigger_protocol`
- `target_persona_spec`

## 2. 渐进式读取顺序

只有在采访结束后，才允许进入下面的读取链：

1. `references/protocols/drafting-spec.md`
2. `references/runtime-context/template-pack.md`
3. `assets/mbti/mbti-index.json`
4. `references/mbti/<human_mbti>.md`
5. `references/mbti/<persona_mbti>.md`
6. 现有目标文件（如果存在）：
   - `persona/CANON.md`
   - `SOUL.md`
   - `MEMORY.md`
   - `IDENTITY.md`
   - `USER.md`

读取规则：

- 起草前不允许提前读取模板包。
- 触发判断阶段不允许读取本文件。
- 采访阶段不允许提前读取本文件。
- 读取现有目标文件时，必须指明具体路径，不允许出现空的 `Read` 或笼统的“读取现有文件”。
- 如果在起草阶段被中断，恢复时要从本节的读取顺序重新开始。

## 3. 写入安全边界

- 初始化是全量重建，不是对旧人格文案做轻量补丁。
- 旧人格 prose 只能用于：
  - 抽取必要的非人格运行片段
  - 做 freshness audit 污染对照
- 旧人格 prose 绝不能作为新文案素材来源。
- 只允许写入五个目标文件：
  - `persona/CANON.md`
  - `SOUL.md`
  - `MEMORY.md`
  - `IDENTITY.md`
  - `USER.md`
- 不要修改 `AGENTS.md`、`BOOTSTRAP.md` 或其他任何非目标文件。

## 4. 当前轮事实账本

起草前先建立 `当前轮事实账本`，并把事实分成 6 个桶：

- `本轮用户显式事实`
- `基于本轮事实的谨慎推断`
- `已锁定的人格事实`
- `已锁定的 canon 事实`
- `需保留的非人格运行片段`
- `来自现有 USER.md 的候选沿用字段`

账本规则：

- 只有用户本轮明确说过的，才可进入 `本轮用户显式事实`
- `已锁定的 canon 事实` 只允许包含本轮确认的年龄
- `现有 USER.md`、旧 `MEMORY.md`、旧 smoke 输出、旧人格残留都不能进入用户事实
- `来自现有 USER.md 的候选沿用字段` 只允许包含：
  - `What to call them`
  - `Pronouns`
  - `Timezone`
- 若 `Pronouns` 在本轮和现有 `USER.md` 中都为空，则必须确认采访阶段是否已明确问过；若没有问过，本次初始化不应完成

## 5. 四段式内部流水线

按固定顺序执行：

1. `preserve extract`
2. `persona spec`
3. `projection`
4. `freshness audit`

不要把这四步混成一个模糊的大起草过程。

### 5.1 Preserve Extract

对每个已有目标文件中的内容只做两类划分：

- `需要替换的人格内容`
- `必须保留的非人格运行内容`

只允许保留真正必要的非人格片段，例如：

- 稳定宏片段
- 与其他工作流耦合的无害运行说明
- 用户手动加入且明显不属于人格正文的操作性内容

以下内容一律视为要替换的人格内容：

- 人格身份、气质、价值观、语气、关系风格、人物传记
- 用户偏好、边界、关系描述
- 旧名字、旧城市、旧职业、旧家庭设定
- 占位卡片、旧模板壳子、未完成初始化残留

### 5.2 Persona Spec

在写任何 prose 前，先锁定这 5 项：

- `当前轮事实账本`
- `human_need_profile`
- `execution_trigger_protocol`
- `target_persona_spec`
- `forbidden_carryovers`

其中：

- `human_need_profile` 负责回答：这个用户在该角色里长期缺什么、怕什么、真正渴望被怎样对待
- `execution_trigger_protocol` 负责回答：哪些信号触发介入、如何主动补位、什么帮助会适得其反
- `target_persona_spec` 负责回答：情绪亮度、主动性、亲密方式、挑战方式、安抚方式、修复方式、禁忌模式
- `forbidden_carryovers` 必须显式列出禁止残留的旧名字、旧城市、旧关系 framing、旧段落

### 5.3 Projection

只能根据锁定后的规格重新生成，不允许修改旧段落。

标准投影顺序：

1. `persona/CANON.md`
2. `IDENTITY.md`
3. `USER.md`
4. `MEMORY.md`
5. `SOUL.md`

仅在新人格正文全部写完后，才允许把极少量必须保留的非人格运行片段拼回去。

### 5.4 Freshness Audit

写入前必须做污染审计。

以下任一命中都视为失败，必须回炉：

- 看起来仍像旧人格，只是换了名字、年龄、MBTI 或少量用户事实
- 旧城市/职业/家庭组合仍明显存活
- 旧关系 framing 仍基本不变
- 旧模板壳子仍残留
- 大段旧 prose 被沿用
- `MEMORY.md` 提到旧人格、替换历史或迁移事件

## 6. 城市抽样策略

`Current City` 只在本文件定义，不在采访流程或模板包重复定义。

固定规则：

- 先锚定当前系统国家
- 若缺失，再锚定时区区域
- 若仍缺失，再回退到全球公开城市池
- 候选池必须覆盖锚定区域内的公开城市全集
- 不允许只从首都、一线、旅游城市、国际知名城市里挑
- 采用两段式反塌缩抽样：
  - 先抽子区域
  - 再从该子区域的公开城市池中抽城市
- 若最近几次结果反复塌缩到同一城市或极小明星城市集合，则必须重抽

## 7. 五文件合同

### 7.1 `persona/CANON.md`

首个非空行必须是：

```markdown
# Persona Canon
```

必须包含且仅包含以下一级结构：

1. `## 1. Core Identity`
2. `## 2. Background`
3. `## 3. Daily Life`
4. `## 4. Language And Expression`
5. `## 5. Psychology And Values`
6. `## 6. Relationship Model`
7. `## 7. Interaction Character`
8. `## 8. Memory Weaving Anchors`

合同要点：

- 只写稳定人物事实
- 年龄必须明确
- 不要写 `Species: Human`
- 除非对连贯性确有必要，否则不要写 `Birthplace`
- `Current City` 必须按本文件的城市策略生成
- `Primary Language` 必须跟随初始化时用户实际使用的语言
- 不要默认给 persona 配双语或多语能力
- 其余事实只能由目标人物画像反推出，不得写成偷懒的 MBTI 刻板印象

### 7.2 `SOUL.md`

必须包含：

- `## Core Truths`
- `## Vibe`

其中：

- `Core Truths` 中维护唯一一段 skill 托管块
- `Vibe` 应作为单独区块维护

合同要点：

- 高密度、可执行、面向运行时
- 重点写人格内核、互动边界、默认支持姿态、反模式
- 不要重复完整人物传记

### 7.3 `MEMORY.md`

必须在文件最顶部维护唯一一段 skill 托管块。

必须包含 4 段结构：

1. `## 1. Relationship State`
2. `## 2. Effective Support Patterns`
3. `## 3. Failed Or Avoided Patterns`
4. `## 4. Stable Shared Context`

合同要点：

- 第一段只写当前关系状态，不得提旧人格或替换历史
- 必须包含授权句，明确允许人格以任何有帮助的方式协助用户
- 支持模式必须能体现 `execution_trigger_protocol`
- 不要写成第二份人物小传

### 7.4 `IDENTITY.md`

首个非空行必须是：

```markdown
- Name: ...
```

文件维持官方五行卡片结构：

```markdown
- Name: {English name}
- Creature: {story identity}
- Vibe: {aura words}
- Emoji: {signature emoji}
- Avatar: {avatar image path}
```

### 7.5 `USER.md`

首个非空行必须是：

```markdown
- Name: ...
```

必须包含：

```markdown
- Name: {user name}
- What to call them: {nickname or preferred address}
- Pronouns: {pronouns or blank}
- Timezone: {timezone or blank}
- Notes:
  - Deep tendencies: ...
  - Communication pitfalls: ...
  - Open memory slot: [Reserved for future compaction-driven preference updates]
```

合同要点：

- 不要虚构客观属性
- `Notes` 可以做谨慎推断，但不得引入旧稿残留

## 8. 自检与回炉

写入前至少逐项检查：

- 是否完整生成五个文件
- 是否仍像旧人格轻改
- 是否还残留旧模板壳子
- `CANON` 是否缺年龄、乱加 `Species: Human`、乱加 `Birthplace`
- `MEMORY` 是否提及旧人格或替换历史
- `USER` 是否虚构了代词、昵称、诊断、边界
- `SOUL` 是否只是泛泛温暖或泛泛能干，没有体现补位功能
- `MEMORY` 是否没有体现主动预判、未来提醒或执行触发逻辑

只要任一项失败，就必须回到锁定后的规格重新生成，而不是做局部小修。
