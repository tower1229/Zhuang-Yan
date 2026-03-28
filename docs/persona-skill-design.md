# Persona Skill 设计文档

> 更新时间：2026-03-27
> 当前架构：3 层核心 + 1 份模板包 + 2 类数据资产

## 1. 设计目标

这次重构的目标只有三件事：

1. 降低初始化链路中的依赖文件数量
2. 让各文件职责清晰、不重叠
3. 让模型按渐进式披露顺序读取信息，避免过早加载无关规范

## 2. 最终架构

### 核心文件

1. `SKILL.md`
2. `references/protocols/initialization-flow.md`
3. `references/protocols/drafting-spec.md`
4. `references/runtime-context/template-pack.md`

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

不负责：

- Step 细节
- 起草规则
- 文件合同
- 模板内容

### `initialization-flow.md`

只负责：

- 触发后采访流程
- `interview_language` 锁定
- Step 1-7 问法与跳转
- Step 6 gap-check
- Step 9 完成提示

不负责：

- 起草顺序
- 文件合同
- 四段流水线
- 审核门禁

### `drafting-spec.md`

只负责：

- 起草前必备输入
- 渐进式读取顺序
- 写入安全边界
- 当前轮事实账本
- 四段流水线
- `SOUL / MEMORY` 专属规则推导方法
- `pair_core_value / pair_contrast_axis / desired_emotional_impact`
- 五文件合同
- 城市抽样策略
- 自检与回炉

它是“怎么生成”的唯一主文档。

### `template-pack.md`

只负责：

- `CANON` 结构模板
- `execution_trigger_protocol` 思考骨架
- `SOUL / MEMORY / CANON` 推导方法与双高质量示例
- 反模式提醒

它是“好稿长什么样”的唯一模板包。

## 4. 渐进式披露顺序

标准读取链固定为：

1. 先读 `SKILL.md` 判断是否该启动
2. 用户显式触发后，再读 `initialization-flow.md`
3. 采访完成后，再读 `drafting-spec.md`
4. 真正起草前，再读：
   - `template-pack.md`
   - `assets/mbti/mbti-index.json`
   - `references/mbti/<human_mbti>.md`
   - `references/mbti/<persona_mbti>.md`

禁止提前读取后置文档。

## 5. 关键生成原则

- 初始化是全量重建，不是旧人格轻改
- reverse lookup 只锁定人格骨架
- 模板包负责提供推导方法与高质量示例，不负责提供可直接套用的标准答案
- 具体生成规则、质量目标、文件合同与城市策略都集中收口在 `drafting-spec.md`
- `SOUL` 与 `MEMORY` 的高价值内容必须优先围绕 `pair_core_value` 展开，而不是平均分配给一组泛优点
- `pair_contrast_axis` 与 `desired_emotional_impact` 必须保持角色化、可消费、可放大的心理语义密度，不能退回成简短标签
- `CANON` 的稳定事实不能直接从 MBTI 标签偷懒外推，而应先看年龄带来的生命阶段，再看目标人物画像，再用名字在英文文化语境中的联想做轻微气质微调，最后在受约束随机性里生成履历与生活细节

## 6. 对外维护文档

- `README.md` / `README_ZH.md`
  - 只介绍新架构、使用方式、依赖链和结果文件
- `docs/clawhub-publish-checklist.md`
  - 只检查新文件结构与发布前验证项

本设计文档只保留高层架构，不再重复协议细节。
