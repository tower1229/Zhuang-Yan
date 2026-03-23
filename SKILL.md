---
name: persona-skill
description: Initialize or reinitialize an OpenClaw persona by interactively collecting MBTI, relationship role, naming, and user preference details, then drafting and updating SOUL.md, MEMORY.md, IDENTITY.md, and USER.md. Use only when the user explicitly asks to initialize, reset, rebuild, or reshape the persona. Do not use for current-status questions, timeline recall, memory lookup, or cross-skill orchestration.
allowed-tools: Bash(node:*) Read Write
metadata:
  openclaw:
    requires:
      env: []
      bins:
        - node
    emoji: "🫧"
---

# Persona Skill

Treat this skill as initialization-only.

## Hard boundaries

- Proceed only after an explicit initialization request such as `初始化人格`, `重塑人格`, `重新生成人格`, or `调用 persona 进行初始化`.
- Do not answer current-status or timeline questions.
- Do not call `timeline-skill`, `timeline-plugin`, `selfiie-skill`, or any other skill.
- Do not write JSON payloads or downstream prompt parameters.
- Do not modify `AGENTS.md` or any file other than `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.

## Required workflow

1. Read `references/initialization-flow.md` before starting the interview.
2. Read `references/write-safety.md` before drafting or writing any file.
3. Use one-question-at-a-time interaction. Prefer A/B/C/D style choices whenever possible.
4. Use the deterministic MBTI mapping in `data/mbti/mbti-index.json`.
5. Prefer running `node scripts/mbti-lookup.js <human_mbti> <role>` to get the exact recommendation.
6. Read `references/file-generation-rules.md` before drafting `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, or `USER.md`.
7. After the four-file draft is complete, write it directly without waiting for user confirmation.
8. After writing, clearly tell the user that initialization is complete and which files were updated.
9. Warn clearly when the operation will replace an existing persona.

## Drafting rules

- Keep `SOUL.md` focused on personality core, values, tone boundaries, and interaction principles.
- Keep `MEMORY.md` focused on biography, relationship background, and long-term behavioral context.
- Keep `IDENTITY.md` short and template-shaped.
- Keep `USER.md` limited to known user-facing facts, preferences, boundaries, and timezone.
- Preserve any non-persona operational content that must remain in the four target files.

## Fallback behavior

If the request is not an explicit persona initialization request, do not start the workflow. Briefly explain that this skill only handles persona initialization and ask for a clear initialization request instead.

