# Persona Skill 设计文档

> 更新时间：2026-03-30
> 当前架构：3 层核心 + 1 份模板包 + 2 类数据资产

## 1. 设计目标

这次重构的目标只有五件事：

1. 用 `persona/PERSONA_PROFILE.md` 取代旧 `CANON` 合同
2. 让 `PERSONA_PROFILE` 与 `SOUL / MEMORY / IDENTITY` 形成“共享 persona spec + 先档案后运行时”的协作关系
3. 让模型按渐进式披露顺序读取信息，避免过早加载无关规范
4. 引入“默认人格种子 + 用户接收偏好修正层”的双层生成模型
5. 让 `SOUL.template` 只保留去 AI 感表达护栏，而不偷带默认人格姿态

## 2. 最终架构

### 核心文件

1. `SKILL.md`
2. `references/protocols/initialization-flow.md`
3. `references/protocols/drafting-spec.md`
4. `references/runtime-context/template-pack.md`
5. `references/runtime-context/persona-profile-consumption-guide.md`

### 数据资产

- `assets/mbti/mbti-index.json`
- `references/mbti/*.md`

## 3. 各文件职责

### `SKILL.md`

只负责：

- 是否允许启动初始化
- 触发示例
- 输出边界
- 文件分工
- 最小执行顺序

### `initialization-flow.md`

只负责：

- 触发后采访流程
- `interview_language` 锁定
- Step 1-7 问法与跳转
- `support_reception_mode` 采集
- Step 7 gap-check
- 写入完成后的固定提示

### `drafting-spec.md`

只负责：

- 起草前必备输入
- `support_reception_mode` 与 `base_counterparty_profile`
- 渐进式读取顺序
- 写入安全边界
- 当前轮事实账本
- 五段式内部流水线 + `profile normalization`
- `SOUL / MEMORY` 专属规则推导方法
- `social_friction_signature / core_social_need / ideal_counterparty_presence / pair_core_value / desired_emotional_impact`
- `base_counterparty_profile -> target_persona_spec` 修正链
- 五文件合同
- 城市抽样策略
- 自检与回炉

它是“怎么生成”的唯一主文档。

### `template-pack.md`

只负责：

- `PERSONA_PROFILE` 结构模板
- `execution_trigger_protocol` 思考骨架
- `SOUL.template` 的去 AI 感表达护栏消费方式
- `SOUL / MEMORY / PERSONA_PROFILE` 推导方法与高质量示例
- 反模式提醒

它是“好稿长什么样”的唯一模板包。

### `persona-profile-consumption-guide.md`

只负责：

- `persona/PERSONA_PROFILE.md` 的结构约定
- 分段语义
- 推荐读取顺序
- 推荐消费方式
- 与 `SOUL / MEMORY / IDENTITY / USER` 的边界

它是“其他 skill 应该怎样读 `PERSONA_PROFILE`”的唯一指南。

## 4. 渐进式披露顺序

标准读取链固定为：

1. 先读 `SKILL.md` 判断是否该启动
2. 用户显式触发后，再读 `initialization-flow.md`
3. 采访完成后，再读 `drafting-spec.md`
4. 真正起草前，再读：
   - `template-pack.md`
   - `persona-profile-consumption-guide.md`
   - `assets/mbti/mbti-index.json`
   - `references/mbti/<human_mbti>.md`
   - `references/mbti/<persona_mbti>.md`

禁止提前读取后置文档。

## 5. 关键生成原则

- 初始化是全量重建，不是旧人格轻改
- reverse lookup 只锁定人格骨架与核心社交需求命中包
- `support_reception_mode` 是用户侧稳定事实，写入 `USER.md`，并以更高优先级修正最终 `target_persona_spec`
- 模板包负责提供推导方法与高质量示例，不负责提供可直接套用的标准答案
- `profile normalization` 必须发生在 `persona spec` 锁定之后、文件投影之前
- `PERSONA_PROFILE` 先落盘，再约束 `IDENTITY / MEMORY / SOUL / USER` 的一致性
- `SOUL` 与 `MEMORY` 的高价值内容必须优先围绕 `core_social_need` 与 `pair_core_value` 展开，而不是平均分配给一组泛优点
- 去 AI 感不等于统一文风；`SOUL.template` 只提供表达方式护栏，不提供固定人格 prose
- `PERSONA_PROFILE` 的稳定事实不能直接从 MBTI 标签偷懒外推，而应先看年龄带来的生命阶段；如果尚未到常规毕业年龄，默认应落在学生身份或强学生阶段语境里。之后再看目标人物画像，用名字在英文文化语境中的联想做轻微气质微调，最后在受约束随机性里生成履历与生活细节
- `PERSONA_PROFILE` 的职责是“结构化底层档案 + 下游可消费约束”，因此其主体应优先呈现固定结构下的外化属性，减少长篇解释性人格散文，方便其他 skill 解析和复用
- 运行时互动行为冲突时，以 `SOUL / MEMORY` 为优先；稳定身份与生活事实冲突视为起草失败

## 6. 对外维护文档

- `README.md` / `README_ZH.md`
  - 只介绍新架构、使用方式、依赖链和结果文件
- `docs/clawhub-publish-checklist.md`
  - 只检查新文件结构与发布前验证项

本设计文档只保留高层架构，不再重复协议细节。
