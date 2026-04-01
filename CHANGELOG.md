# Changelog

All notable repository-level changes to this project are documented in this file.

## [1.1.1] - 2026-04-01

- **支持自定义世界律动 (World Rhythm Constraints)**：在 `PERSONA_PROFILE.md` 中引入 `world_rhythm_constraints` 字段。支持定义非标准作息（如熬夜型、极早起型）的睡眠与活动窗口，供 Timeline 插件在执行合理性校验时优先读取。
- **完善规范文档 (Spec Integrity)**：对 `drafting-spec.md` 和 `template-pack.md` 执行了全量恢复与校准。找回了被误删的 `SOUL.md` 合同要点、外观逻辑、约束格式等核心准则。
- **更新消费指南 (Consumption Guide)**：在 `persona-profile-consumption-guide.md` 中明确了律动约束的语义定义与解析建议，确保多 Skill 联动时的行为一致性。
- **Timeline 联动增强**：配合 `Her` 插件实现了 Path 2 (状态切换) 路由优先级提升，解决了活跃上下文阻塞跳转的问题。同时为 Stella 人格添加了具体的律动约束示例。

## [1.1.0] - 2026-03-31

- **通用增量更新入口 (General Incremental Update)**：新增 `更新 PERSONA_PROFILE` 触发关键词。支持模型在不启动初始化采访的情况下，对 `IDENTITY.md` 和 `PERSONA_PROFILE.md` 进行定点增量修改（例如由 Timeline 驱动的地点/状态迁移同步）。
- **任务决策树 (Task Dispatcher)**：重构 `SKILL.md`，在入口处引入显式的“全量重建”与“增量维护”双分支判断。通过优化 YAML 描述，提升了模型在大任务并存时的路由准确度。
- **新增 `persona-update.md` 协议**：定义了增量更新的原子性改写（Incremental Patching）规范，确保底色气质稳定性并禁止触及不可变硬属性。
- **双向联动基础设施**：完成与外部 Skill（如 Timeline 2.6.0+）的跨技能联动对接，支持通过 JSON 处理异构指令同步。

## [0.3.2] - 2026-03-29

- Pushed MBTI labels fully backstage in runtime guidance so persona replies default to first-person, lived answers instead of type-code explanations.
- Added runtime smoke probes plus automated checks that catch detached MBTI label-speak on preference and conflict questions.
- Hardened the smoke runner with a writable temp-dir fallback and clearer `openclaw` executable guidance for local verification.

## [0.3.1] - 2026-03-29

- Clarified the SOUL continuity boundary so runtime agents can fall back from `IDENTITY.md` to `persona/PERSONA_PROFILE.md` for richer stable persona facts.
- Expanded `IDENTITY.md` basic-info projection to include `City`, `Home Country`, and `Home Timezone`.
- Tightened release metadata by versioning the default publish changelog and documenting this release in the repository changelog.

## [0.1.0] - 2026-03-24

- Established the publishable `persona-skill` repository layout.
- Added cross-platform test discovery and a guarded ClawHub release script.
- Documented ClawHub publishing checks, repository metadata, and local workflows.
