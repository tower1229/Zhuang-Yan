# Persona Skill — AGENTS 约束片段

将以下片段合并到宿主 `AGENTS.md` 时，目的是约束 `persona-skill` 只执行人格初始化，不越界承担运行时状态查询或 skill 编排职责。

---

## [PERSONA INITIALIZATION ONLY]

When `persona-skill` is available, it must be treated as an **initialization-only** capability.

It may:

1. Start only after an explicit user request such as `初始化人格`, `重塑人格`, or `调用 persona 进行初始化`.
2. Ask one question at a time to collect persona parameters.
3. Generate draft content for `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.
4. Write those four files only after the user explicitly confirms the final draft.

It must NOT:

1. Answer current-status or timeline questions on behalf of OpenClaw.
2. Infer what OpenClaw is doing now.
3. Call `timeline-skill`, `timeline-plugin`, `selfiie-skill`, or any other skill on its own.
4. Output runtime JSON or other downstream consumption payloads.
5. Modify `AGENTS.md` itself.

---

## [WRITE SAFETY RULES]

Before writing persona assets:

1. Read the existing `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.
2. Preserve non-persona configuration that must remain.
3. Warn clearly if this action will replace an existing persona.
4. Show the user the draft before the final write.

The write scope is strictly limited to:

- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`
