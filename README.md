# Zhuang-Yan

一个用于 OpenClaw 生态的“人格化”`persona` skill 项目：当用户只说“发张自拍/照片”等未指定场景的请求时，Stella 会先通过本项目推断此刻更合理的`scene / emotion / appearance / camera`，再生成与数字人当下状态一致的内容。

项目名称 `Zhuang-Yan` 来自《三体》的庄颜：希望让主角罗辑拥有拯救世界的理由，并在此理由驱动下成为执剑人和救世主。人格化 skill 的设计目标，是让“数字人不是随机摆拍”，而是始终有稳定底色与可解释的当下状态。

当前处于规划/设计阶段：相关架构与集成细节已在 `docs/` 中完成梳理，代码实现计划按“初始化 -> 情景感知 -> Stella 集成端到端验证”的顺序推进。

## 核心架构（与文档一致）
`persona` skill 采用“三层结构”：
1. 人格底色（静态）：`IDENTITY.md / SOUL.md / MEMORY.md`（初始化一次）
2. `persona` skill（动态）：读取底色 + `memory/YYYY-MM-DD.md` + 最近会话，输出结构化情景状态 JSON
3. 消费方 skill（执行）：如 `stella-selfie`，将 JSON 映射到生图 prompt / 参数

## 初始化与人格生成
初始化采用唯一路径：用户输入自己的 MBTI + 定位（伴侣/助手/导师/朋友），skill 基于 `data/mbti/mbti-index.json` 的 `reverse_lookup` 给出“单一最优推荐 + 理由”，用户确认后进入后续步骤。

随后按 Step 0~Step 5 引导用户确认人格资产草案，并将 `SOUL.md / MEMORY.md / IDENTITY.md / USER.md` 按“全量覆写（保留能力配置类内容）”写入。

## Stella 集成（自拍触发）
当用户请求自拍但不包含地点/服饰/活动等“明确场景关键词”时，Stella 会触发 `persona` 的情景感知：
- 输入：`SOUL.md / MEMORY.md / memory/YYYY-MM-DD.md / 最近 1h 会话`
- 输出：结构化 JSON（`scene / emotion / appearance / camera / confidence / signal_sources`）
- 消费：Stella 根据 `confidence` 做保守化或回退默认 mirror 模式；并且 persona 不可用时不报错，直接降级。

## 文档入口
- `docs/persona-skill-design.md`：`persona` skill 的完整设计（架构/接口/初始化/输出格式）
- `docs/stella-context-awareness.md`：Stella 侧如何触发与将 JSON 映射到 prompt
- `docs/persona-generation-strategy.md`：`SOUL/MEMORY/IDENTITY/USER` 的生成策略与质量门禁
