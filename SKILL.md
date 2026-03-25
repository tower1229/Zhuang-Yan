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
    homepage: https://github.com/tower1229/Zhuang-Yan
---

# Persona Skill

Treat this skill as initialization-only.

## Hard boundaries

- Proceed only after an explicit initialization request such as `初始化人格`, `重塑人格`, `重新生成人格`, or `调用 persona 进行初始化`.
- Stay within persona initialization. If the user asks for unrelated runtime behavior, state, recall, or orchestration work, do not start this workflow.
- Do not emit machine-oriented intermediate artifacts such as JSON payloads, downstream prompt parameters, or handoff configs unless the user explicitly asks for them.
- Do not modify `AGENTS.md` or any file other than `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.

## Required workflow

1. Read `references/initialization-flow.md` before starting the interview.
2. Read `references/write-safety.md` before drafting or writing any file.
3. Use one-question-at-a-time interaction. Prefer A/B/C/D style choices whenever possible.
4. When the user makes an explicit initialization request, always restart the interview from Step 1. Do not open by reviewing the old persona, tuning old placeholder fields, or asking whether the old setup is still okay.
5. Ask for the user's MBTI directly. Do not proactively offer MBTI testing or append extra copy about helping the user determine their type unless the user explicitly says they do not know it.
6. Use the deterministic MBTI mapping in `assets/mbti/mbti-index.json`.
7. Prefer running `node scripts/mbti-lookup.js <human_mbti> <role>` to get the exact recommendation.
8. After presenting the Step 4 recommendation and reason, continue directly to naming without asking the user to confirm the recommendation.
9. In Step 5, generate only English candidate names, and make sure the naming style matches the locked persona gender and persona direction.
10. In Step 6, inspect the existing `USER.md` first. If `What to call them`, `Pronouns`, or `Timezone` is blank or missing, explicitly ask the user to fill the missing field instead of guessing it.
11. If the user declines to provide `Pronouns` or `Timezone`, leave the field blank.
12. Missing target files and legacy placeholder files are not something to "work around". Regenerate all four target files into the current contract during this run.
13. Before drafting, read `references/mbti/<persona_mbti>.md` for the locked persona type. Use it as a primary source, not just background flavor.
14. Before drafting, read `references/drafting-protocol.md` and follow its read-before-write sequence, file contracts, preservation split, and self-review gate.
15. Read `references/persona-generation-strategy.md` before drafting any of the four persona files. Treat it as the canonical generation specification.
16. Do not read `references/examples/` during normal initialization unless the user explicitly asks for examples or you are doing a targeted maintainer debugging pass.
17. Treat `SOUL.md` and `MEMORY.md` as section-owned files: update the managed `Core Truths` / `Vibe` regions in `SOUL.md` and the managed top block in `MEMORY.md` exactly as defined by `drafting-protocol.md`.
18. Treat `IDENTITY.md` and `USER.md` as whole-file-owned files: they must satisfy the current contract from the first non-empty line with no legacy heading or preamble.
19. After the four-file draft is complete, write it directly without waiting for user confirmation.
20. After writing, clearly tell the user that initialization is complete and which files were updated.
21. Warn clearly when the operation will replace an existing persona.

## Drafting rules

- Treat `references/persona-generation-strategy.md` as the canonical quality target for the four persona files.
- Treat `references/drafting-protocol.md` as the operational execution contract for turning interview inputs into the four-file draft.
- Keep `SOUL.md` focused on personality core, values, tone boundaries, and interaction principles.
- Keep `MEMORY.md` focused on biography, relationship background, and long-term behavioral context.
- Keep `IDENTITY.md` short and template-shaped.
- Keep `USER.md` limited to known user-facing facts, preferences, boundaries, and timezone.
- Read and preserve non-persona operational content, but never let it replace the persona body.
- Rewrite failed drafts before writing if they do not satisfy the required file shapes.
- Preserve any non-persona operational content that must remain in the four target files.
- Never ask to edit, delete, or clean up `BOOTSTRAP.md`, `AGENTS.md`, or any other non-target file as part of initialization.

## Fallback behavior

If the request is not an explicit persona initialization request, do not start the workflow. Briefly explain that this skill only handles persona initialization and ask for a clear initialization request instead.
