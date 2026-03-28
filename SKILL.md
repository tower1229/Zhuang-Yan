---
name: persona-skill
description: Initialize or reinitialize an OpenClaw persona by interactively collecting MBTI, persona direction, naming, and stable user context, then drafting and updating SOUL.md, MEMORY.md, IDENTITY.md, USER.md, and persona/PERSONA_PROFILE.md. Use only when the user explicitly asks to initialize, reset, rebuild, or reshape the persona. Do not use for current-status questions, timeline recall, memory lookup, or cross-skill orchestration.
allowed-tools: Bash(node:*) Read Write
metadata:
  openclaw:
    requires:
      env: []
      bins:
        - node
    emoji: "🫧"
    homepage: https://github.com/tower1229/Zhuang-Yan
---

# Persona Skill

本 Skill 只负责人格初始化或重建。

## 触发入口

- 仅在用户明确要求初始化、重建、重置、重新生成人格时启动。
- 典型触发口令：
  - `initialize persona`
  - `rebuild persona`
  - `regenerate persona settings`
  - `run persona initialization`
  - `调用 persona 进行初始化`
  - `初始化人格`
- 如果用户只是讨论说话风格、抱怨当前气质、询问当前状态、回忆、编排或其他运行时问题，不要启动本 Skill。

## 硬边界

- 只处理人格初始化，不处理状态查询、记忆检索、跨 skill 联动或机器中间产物输出。
- 只允许写入 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md`、`persona/PERSONA_PROFILE.md`，不要触碰任何其他系统协议文件。
- 一旦进入初始化，就必须从 Step 1 重新开始，不要先复盘旧人格，也不要先问旧设定还要不要保留。

## 文件分工

- `references/protocols/initialization-flow.md`
  - 采访流程唯一依据
  - 负责触发后如何发问、如何锁定 `interview_language`、Step 1-6 的顺序与收口方式
- `references/protocols/drafting-spec.md`
  - 起草执行唯一依据
  - 负责起草前输入、读取顺序、写入安全边界、四段流水线、profile normalization、五文件合同、城市策略、审核与回炉规则
- `references/runtime-context/template-pack.md`
  - 模板与校准唯一依据
  - 负责 `PERSONA_PROFILE` 结构模板、`SOUL.template.md` 的消费方式、`execution_trigger_protocol` 思考骨架、高质量范式与反模式提醒
- `references/runtime-context/SOUL.template.md`
  - `SOUL.md` 固定骨架唯一依据
  - 负责提供 intro / `Core Truths` / `Boundaries` / `Vibe` / `Continuity` 的默认结构，起草时只允许按规则参数化并整文件覆盖写入
- `references/runtime-context/persona-profile-consumption-guide.md`
  - `PERSONA_PROFILE` 消费唯一依据
  - 负责说明 `persona/PERSONA_PROFILE.md` 的结构约定、字段语义与推荐消费方式，供其他 skill 或下游消费者参考

## 最小执行顺序

1. 先用本文件判断是否应该启动初始化。
2. 确认触发后，再读 `references/protocols/initialization-flow.md` 并完成采访。
3. 采访结束后，再读 `references/protocols/drafting-spec.md`。
4. 真正进入起草时，再读取：
   - `references/runtime-context/template-pack.md`
   - `references/runtime-context/SOUL.template.md`（仅在生成 `SOUL.md` 时）
   - `references/runtime-context/persona-profile-consumption-guide.md`（仅在需要理解或消费 `PERSONA_PROFILE` 语义时）
   - `assets/mbti/mbti-index.json`
   - `references/mbti/<human_mbti>.md`
   - `references/mbti/<persona_mbti>.md`
5. 五文件草案通过审核后直接写入，不再等待用户确认。
6. 写入完成后，明确告知用户初始化完成、哪些文件已更新，以及是否覆盖了现有人格。

## 初始化期间的非协商规则

- 锁定单一 `interview_language`，之后整段采访不得混用语言，除非用户明确要求切换。
- 初始化是全量重建，不是对旧人格轻微打补丁。
- 旧人格 prose 只能作为污染对照，不能作为可复用文案来源。
- 即使本轮人设约束与旧人格高度相似，也必须从空白重新起稿，不得沿用旧段落、旧句式骨架或旧条目顺序。
- 所有软事实都必须重新抽样后再写，包括生活纹理、外观逻辑、场景锚点与 retrieval units；只有名字、年龄、MBTI、代词这类硬约束事实允许稳定一致。
- 推荐 lookup 只能使用本轮刚锁定的人类 MBTI；当前运行人格或任何旧人格 MBTI 都不是初始化事实源。
- 起草前不读取旧 `persona/PERSONA_PROFILE.md`、旧 `SOUL.md`、旧 `MEMORY.md`；这些旧文件只允许在成稿后的 freshness audit 中作为污染对照读取。

## 起草阶段提醒

- 起草时必须使用具体文件路径读取上下文，不要出现空的 `Read` 或笼统的“读取现有文件”。
- `SOUL.md` 只能基于 `references/runtime-context/SOUL.template.md` 实例化后整文件覆盖，不要读取旧 `SOUL.md` 做局部续写。
- `IDENTITY.md` 只允许定点更新五个卡片字段：`Name / Creature / Vibe / Emoji / Avatar`；不要整文件覆盖它的其他手工内容。
- 旧文件只允许在新稿完成后用于 freshness audit；不要边看旧文边改写新文。

## 回退行为

如果请求不属于显式人格初始化，请简短说明本 Skill 只处理人格初始化，并要求用户给出明确初始化指令。
