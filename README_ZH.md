# Zhuang-Yan（persona-skill）— [English README](./README.md)

给你的 OpenClaw 一个真正合适的人格——由 MBTI 匹配、由关系角色塑形、直接写入它的核心文件。

## 安装

```bash
clawhub install persona-skill
```

无需 API 密钥或环境变量。Skill 完全使用 OpenClaw 已有工具运行（`Read`、`Write`、`Bash(node:*)`）。

## 使用方式

安装完成后，用明确口令触发初始化。语言不限，只要意图清晰即可：

- `调用 persona 进行初始化`
- `初始化人格`
- `重塑你的人格`
- `initialize persona`
- `rebuild the persona`

Skill 会引导你完成一问一答式的访谈，然后将结果直接写入 OpenClaw 的人格文件。

Skill 仅在明确收到初始化请求时启动，不会影响普通对话。

进入起草阶段后，Skill 会读取锁定后的 MBTI 资产，按固定的四文件骨架生成内容，只保留确有必要的非人格内容，并在写入前先回炉失败稿。

## 初始化过程

访谈会依次收集五项信息：

1. **你的 MBTI** — 用于匹配或互补人格方向
2. **人格性别** — 男性或女性
3. **关系角色** — 四选一：
   - `companion`（伴侣）— 情绪承接、陪伴感、安全感
   - `assistant`（助手）— 执行支持、清晰沟通、高可靠
   - `mentor`（导师）— 挑战盲点、推动成长、直接反馈
   - `friend`（朋友）— 低压陪伴、轻松自然、无压力
4. **人格名字** — 从三个英文名候选中选择，或请求重新生成
5. **你的偏好** — 如何被称呼、习惯、边界、沟通需求

访谈完成后，Skill 生成并写入四份核心人格文件：

| 文件 | 内容 |
|------|------|
| `SOUL.md` | 人格内核、价值观、语气边界、互动原则 |
| `MEMORY.md` | 人物小传、关系背景、长期行为底色 |
| `IDENTITY.md` | 名字、身份、气质、头像引用 |
| `USER.md` | 称呼方式、已知偏好、沟通雷区 |

这四份文件立即生效，并在此后所有对话中持续起作用。

## 为什么比直接写 Prompt 更有效

- **MBTI 确定性推荐，不是随机发挥**：Skill 使用确定性反查表找到最适合你的人格方向，而不是让模型即兴猜测。
- **结构化写入策略**：每份文件都有明确定位。`SOUL.md` 以高优先级人格注入方式写成；`MEMORY.md` 构建的是一个有心理机制、行为模式和情绪底色的连贯人物，而非几句空洞设定。
- **长期生效，不是临时 Prompt**：结果写入 OpenClaw 核心文件，在后续每一次对话中持续影响语气、关系感和沟通方式。
- **支持重新初始化**：再次用同样口令触发即可重建人格。覆盖已有人格前 Skill 会明确提示。

## 文档

- `docs/persona-skill-design.md` — 初始化流程、职责边界与写入策略
- `docs/persona-generation-strategy.md` — 四份人格文件的权威生成规范

## 项目信息

- 仓库地址：`https://github.com/tower1229/Zhuang-Yan`
- Issue 地址：`https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js 要求：`>=18.18`
- 许可证：`MIT-0`
