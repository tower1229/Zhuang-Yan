# Zhuang-Yan (Persona-Skill)

**Persona-Skill** 是一个面向 OpenClaw 的人格初始化 skill。

它的职责只有一件事：在用户用明确关键词触发后，以交互式、一问一答的方式收集信息，最终生成并覆写 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 四份人格资产，让 OpenClaw 在后续每一次对话中自然呈现新的沟通风格。

---

## 核心能力

1. **关键词触发初始化**：仅在用户明确表达“初始化人格 / 重塑人格 / 调用 persona 进行初始化”等意图时启动。
2. **渐进式信息收集**：一次只问一个问题，逐步确认用户 MBTI、数字人性别、关系定位、名字、用户称呼与注意事项等信息。
3. **基于 MBTI 的人格反推**：通过 `data/mbti/mbti-index.json` 中的 `reverse_lookup`，为数字人推荐最合适的人格类型。
4. **四文件草案生成与确认写入**：先生成 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 草案，展示给用户确认后再执行全量覆写。

---

## 不再承担的职责

为避免边界失控，`persona-skill` **不再提供**以下能力：

- 查询 OpenClaw 当前状态
- 读取或推断时间线事实
- 主动调用或编排其他 skill
- 输出运行时结构化 JSON 供下游消费

它只负责初始化人格资产，不负责运行时状态感知和跨 skill 协同。

---

## 使用方式

1. 将本项目根目录作为 `persona-skill` 放入 OpenClaw 工作区。
2. 用明确口令触发初始化，例如：`调用 persona 进行初始化`。
3. 按照 skill 的引导逐步回答问题。
4. 审阅四份草案并确认写入。
5. 写入完成后，新人格会通过 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md` 持续影响后续对话风格。

本项目根目录就是可直接发布和测试的 skill 目录。

---

## 文档

- `docs/persona-skill-design.md`：初始化流程、职责边界、写入策略
- `docs/persona-generation-strategy.md`：四份人格资产的生成规范
- `docs/AGENTS.fragment.md`：供宿主 `AGENTS.md` 参考的人格初始化约束片段

## 本地测试与发布

- Skill 目录：项目根目录
- 建议先执行：`npm run test`
- 建议先在 OpenClaw 工作区中直接挂载这个目录进行实际对话测试
- 建议发布命令：`clawhub --workdir . publish . --slug persona-skill --name "Persona Skill" --version 0.1.0 --tags latest --changelog "Initial public release"`
- 可选发布脚本：`npm run publish:clawhub`
- 发布检查清单：`docs/clawhub-publish-checklist.md`

