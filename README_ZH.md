[English / 英文说明](./README.md)

# Zhuang-Yan（Persona-Skill）

**Persona-Skill** 让 OpenClaw 不只是一个能干的助手。

它会基于 **MBTI 人格框架**，为用户初始化一个更匹配、或更具互补性的长期人格，并结合 **四种内置关系角色**（`companion`、`assistant`、`mentor`、`friend`）完成塑造，最终将结果直接写入 `SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md`。这意味着 OpenClaw 不仅能继续提供实用能力，还能在长期互动里更好地提供贴合感、陪伴感和情绪价值。

---

## 为什么值得安装

很多 AI 配置只解决“能不能做事”，却不解决“和它相处是否舒服、是否真的适合你”。

Persona-Skill 想补上的，就是这一层长期关系价值。它不是单纯给 OpenClaw 加一点人设味道，而是让 OpenClaw 在保持实用性的同时，成为一个在气质、关系定位和互动方式上都更适合用户的数字人格。

- **基于 MBTI 的匹配与互补，不是随机扮演**：skill 通过确定性的 MBTI 推荐逻辑，为用户找到更适配、或更能稳定补位的人格方向。
- **四种角色预设，对应四种不同价值**：`companion` 强调情绪承接与安全感，`assistant` 强调执行支持与清晰沟通，`mentor` 强调挑战盲点与成长推动，`friend` 强调低压陪伴与轻松共处。
- **实用性和情绪价值并存**：它不是让 OpenClaw 变得“更会演”，而是让原本的能力更容易被用户接受、更愿意长期使用。
- **长期生效，不是临时 prompt**：生成结果会直接写入 OpenClaw 的核心人格文件，后续每一次对话都会持续受到影响。

---

## 它能做什么

1. **仅在明确初始化请求下启动**，不会打断普通对话。
2. **通过一问一答渐进式收集信息**，降低一次性填写人格设定的负担。
3. **基于结构化资产推荐最合适的人格 MBTI**，而不是让模型临场猜测。
4. **内置四种关系角色预设**：`companion`、`assistant`、`mentor`、`friend`。
5. **直接生成并写入四份核心人格文件**：`SOUL.md`、`MEMORY.md`、`IDENTITY.md`、`USER.md`。

---

## 为什么生成结果更有质感

这个 skill 不是在填模板，而是在用一套更适合长期陪伴和长期协作的人格生成策略，去塑造一个真正能持续影响对话体验的 OpenClaw。

- **`SOUL.md` 采用人格注入式写法**：不是松散的风格描述，而是能真正约束后续表达的高优先级人格内核。
- **`MEMORY.md` 采用多层人物小传结构**：把心理、行为、关系、优点、弱点和情绪机制写成一个连续的人，而不是几句空洞设定。
- **`USER.md` 会固化用户导向约束**：包括称呼方式、互动痛点、沟通雷区和深层需求，帮助后续回复更稳、更贴心。
- **`IDENTITY.md` 保持简洁稳定**：让名字、气质、身份和标识信息足够清晰，也足够容易长期维持一致性。

---

## 使用方式

1. 将项目根目录作为 OpenClaw 工作区中的 `persona-skill` 目录。
2. 用明确口令触发初始化，例如：`调用 persona 进行初始化`。
3. 按照引导逐步完成访谈。
4. skill 会生成四份人格文件并直接写入。
5. 从那之后，新人格会持续影响 OpenClaw 的语气、关系感和整体沟通风格。

本项目根目录就是可测试、可发布的 skill 目录。

---

## 文档

- `docs/persona-skill-design.md`：初始化流程、职责边界与写入策略
- `docs/persona-generation-strategy.md`：四份人格文件的权威生成规则

## 本地测试与发布

- Skill 目录：项目根目录
- 运行测试：`npm run test`（如果 PowerShell 执行策略拦截 `npm.ps1`，可改用 `node --test tests`）
- 发布命令：`npm run publish:clawhub`
- 发布命令会先跑测试，再读取 `package.json` 中的 `version` 进行发布
- 发布检查清单：`docs/clawhub-publish-checklist.md`
