[English / 英文说明](./README.md)

# Zhuang-Yan（Persona-Skill）

**Persona-Skill** 是一个面向 OpenClaw 的人格初始化 skill。

它的职责只有一件事：在用户用明确初始化口令触发后，以交互式的一问一答方式收集人格信息，然后生成并覆写 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 四份文件，让新人格持续影响 OpenClaw 之后的沟通风格。

---

## 为什么值得安装

- **把人格设定变成真正的初始化流程**：不是一次性把偏好扔给模型，而是通过渐进式问答完成更自然、更有仪式感的建模。
- **直接写入 OpenClaw 的核心人格文件**：结果落在 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 中，而不是停留在临时 prompt 片段里。
- **基于结构化 MBTI 资产而不是模糊扮演**：人格推荐来自仓库内确定性的 `reverse_lookup` 映射和 MBTI 参考资料，而不是随意猜测。
- **持续影响后续每一次对话**：写入完成后，新人格会长期影响语气、边界感和关系氛围，而不是只在当前会话生效。
- **流程边界清晰、目标单纯**：skill 专门服务于人格初始化，不会把交互过程拖向无关的运行时能力。

---

## 核心能力

1. **关键词触发初始化**：仅在用户明确表达初始化、重建或重塑人格意图时启动。
2. **渐进式信息收集**：一次只问一个问题，逐步确认用户 MBTI、数字人性别、关系定位、名字、称呼偏好以及重要边界。
3. **基于 MBTI 的人格推荐**：通过 `data/mbti/mbti-index.json` 中的 `reverse_lookup` 推荐最适合的数字人人格类型。
4. **四文件草案生成后直接写入**：生成 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 后直接写入，并在完成后告知用户。

---

## 写作亮点

- **`SOUL.md` 采用第二人称人格注入写法**：强调高优先级身份约束，而不是松散的风格描述。
- **`MEMORY.md` 采用多层人物小传结构**：把背景、心理、关系和行为习惯整合成有连续性的长期底色。
- **`USER.md` 会写入用户导向约束**：记录称呼方式、偏好和沟通雷区，帮助后续回复保持稳定一致。
- **`IDENTITY.md` 保持简洁可复用**：名字、气质、身份、Emoji、头像等信息集中而稳定。

---

## 使用方式

1. 将本项目根目录作为 OpenClaw 工作区中的 `persona-skill` 目录。
2. 用明确口令触发初始化，例如：`调用 persona 进行初始化`。
3. 按照引导逐步回答问题。
4. 四文件草案完成后，skill 会直接写入。
5. 写入完成后，skill 会提示初始化完成，更新后的 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 会持续影响后续对话。

本项目根目录就是可发布、可测试的 skill 目录。

---

## 文档

- `docs/persona-skill-design.md`：初始化流程、职责边界与写入策略
- `docs/persona-generation-strategy.md`：四份人格文件的生成规则
- `docs/AGENTS.fragment.md`：宿主侧 `AGENTS.md` 约束片段

## 本地测试与发布

- Skill 目录：项目根目录
- 先运行测试：`npm run test`
- 将本目录挂载到 OpenClaw 工作区后直接测试交互流程
- 直接发布命令：`clawhub --workdir . publish . --slug persona-skill --name "Persona Skill" --version 0.1.0 --tags latest --changelog "Initial public release"`
- 快捷发布脚本：`npm run publish:clawhub`
- 发布检查清单：`docs/clawhub-publish-checklist.md`
