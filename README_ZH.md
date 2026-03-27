# Zhuang-Yan（persona-skill）— [English README](./README.md)

给你的 OpenClaw 一个真正合适的人格——由 MBTI 提供骨架、由关系角色塑形、压缩写入运行时人格文件，并额外生成完整的角色档案。

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

Skill 会引导你完成一问一答式的访谈，然后将结果写入 OpenClaw 的运行时人格文件以及 `persona/CANON.md`。

Skill 仅在明确收到初始化请求时启动，不会影响普通对话。

进入起草阶段后，Skill 会读取锁定后的 MBTI 资产，按“运行时人格层 + Persona Canon”双层合同生成内容，只保留确有必要的非人格内容，并在写入前先回炉失败稿。

## 初始化过程

访谈会依次收集这些信息：

1. **你的 MBTI** — 用于锁定人格骨架
2. **人格性别** — 男性或女性
3. **关系角色** — 四选一：
   - `companion`（伴侣）— 情绪承接、陪伴感、安全感
   - `assistant`（助手）— 执行支持、清晰沟通、高可靠
   - `mentor`（导师）— 挑战盲点、推动成长、直接反馈
   - `friend`（朋友）— 低压陪伴、轻松自然、无压力
4. **人格名字** — 从三个英文名候选中选择，或请求重新生成
5. **你的偏好** — 如何被称呼、希望怎样被支持、哪些互动方式会踩雷、压力下更需要什么
6. **人物事实** — 年龄、城市、职业、家庭背景、长期兴趣等稳定人物事实（如需定义）

访谈完成后，Skill 生成并写入四份运行时人格文件和一份角色档案：

| 文件 | 内容 |
|------|------|
| `SOUL.md` | 运行时互动协议：人格内核、语气边界、默认支持方式、反模式 |
| `MEMORY.md` | 长期关系沉淀：已验证有效的互动经验、共享语境、稳定关系记忆 |
| `IDENTITY.md` | 名字、身份、气质、头像引用 |
| `USER.md` | 称呼方式、已知偏好、沟通雷区 |
| `persona/CANON.md` | 完整角色档案：稳定、可长期复用、供人工审阅与下游系统消费的人物事实 |

前四份运行时文件立即生效，并在此后所有对话中持续起作用；`persona/CANON.md` 作为上游真相源保留完整人物事实。

## 为什么比直接写 Prompt 更有效

- **MBTI 确定性推荐，不是随机发挥**：Skill 使用确定性反查表锁定人格骨架，而不是让模型即兴猜测。
- **运行时与角色档案分层**：高频注入文件保持精炼，完整人物事实集中沉淀到 `persona/CANON.md`，更适合后续记忆编织与人工审稿。
- **长期生效，不是临时 Prompt**：结果写入 OpenClaw 核心文件，在后续每一次对话中持续影响语气、关系感和沟通方式。
- **支持重新初始化**：再次用同样口令触发即可重建人格。覆盖已有人格前 Skill 会明确提示。

## 文档

- `docs/persona-skill-design.md` — 初始化流程、职责边界与写入策略
- `docs/persona-generation-strategy.md` — 运行时人格文件与 `persona/CANON.md` 的权威生成规范

## 项目信息

- 仓库地址：`https://github.com/tower1229/Zhuang-Yan`
- Issue 地址：`https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js 要求：`>=18.18`
- 许可证：`MIT-0`
