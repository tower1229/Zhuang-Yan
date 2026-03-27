---
name: persona-skill
description: Initialize or reinitialize an OpenClaw persona by interactively collecting MBTI, relationship role, naming, and user preference details, then drafting and updating SOUL.md, MEMORY.md, IDENTITY.md, USER.md, and persona/CANON.md. Use only when the user explicitly asks to initialize, reset, rebuild, or reshape the persona. Do not use for current-status questions, timeline recall, memory lookup, or cross-skill orchestration.
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

- Proceed only after an explicit initialization request such as `initialize persona`, `rebuild persona`, `regenerate persona`, or `run persona initialization`.
- Stay within persona initialization. If the user asks for unrelated runtime behavior, state, recall, or orchestration work, do not start this workflow.
- Do not emit machine-oriented intermediate artifacts such as JSON payloads, downstream prompt parameters, or handoff configs unless the user explicitly asks for them.
- Do not modify `AGENTS.md` or any file other than `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, `USER.md`, and `persona/CANON.md`.

## Non-Negotiables

- When the user makes an explicit initialization request, always restart the interview from Step 1. Do not open by reviewing the old persona, tuning old placeholder fields, or asking whether the old setup is still acceptable.
- Ask for the user's MBTI directly. Do not proactively offer MBTI testing or append extra copy about helping the user determine their type unless the user explicitly says they do not know it.
- In Step 2, make it explicit that you are asking for the OpenClaw persona's gender, not the human user's gender.
- In Step 3, make it explicit that you are asking about the relationship between the user and the OpenClaw persona. Preferred wording: `What kind of relationship do you want us to have?`
- Use the deterministic MBTI mapping in `assets/mbti/mbti-index.json`. Prefer running `node scripts/mbti-lookup.js <human_mbti> <role>` to get the exact recommendation.
- After presenting the Step 4 recommendation and reason, continue directly to naming without asking the user to confirm the recommendation.
- In Step 5, generate only English candidate names, and make sure the naming style matches the locked persona gender and persona direction.
- In Step 6, inspect the existing `USER.md` first. If `What to call them`, `Pronouns`, or `Timezone` is blank or missing, explicitly ask the user to fill the missing field instead of guessing it.
- If the user declines to provide `Pronouns` or `Timezone`, leave the field blank.
- Missing target files and legacy placeholder files are not something to "work around". Regenerate all five target files into the current contract during this run.
- Do not read `references/examples/` during normal initialization unless the user explicitly asks for examples or you are doing a targeted maintainer debugging pass.
- When you need to read context for drafting or resume after an interruption, name the concrete file path you are reading. Never issue an empty `Read` call or a vague read request such as "read existing files".
- Treat `SOUL.md` and `MEMORY.md` as section-owned files: update the managed `Core Truths` / `Vibe` regions in `SOUL.md` and the managed top block in `MEMORY.md` exactly as defined by `drafting-protocol.md`.
- Treat `IDENTITY.md`, `USER.md`, and `persona/CANON.md` as whole-file-owned files: they must satisfy the current contract from the first non-empty line with no legacy heading or preamble.
- Never ask to edit, delete, or clean up `BOOTSTRAP.md`, `AGENTS.md`, or any other non-target file as part of initialization.

## Execution Order

1. Read `references/initialization-flow.md` before starting the interview.
2. Use one-question-at-a-time interaction. Prefer A/B/C/D style choices whenever possible.
3. Complete the interview in order: MBTI, persona gender, relationship role, recommended persona MBTI, persona naming, user-side grounding details.
4. Read `references/write-safety.md` before drafting or writing any file.
5. Before drafting, read `references/mbti/<persona_mbti>.md` for the locked persona type. Use it as a primary source, not just background flavor.
6. Before drafting, read `references/templates/persona-canon-template.md` as the exact shape for `persona/CANON.md`.
7. Before drafting, read `references/drafting-protocol.md` and follow its read-before-write sequence, file contracts, preservation split, and self-review gate.
8. Read `references/persona-generation-strategy.md` before drafting any of the five target files. Treat it as the canonical generation specification.
9. If the run was interrupted and you are resuming near the write stage, rebuild context by rereading the exact required files and target files by name. Do not improvise a generic "read the current files" action.
10. After the five-file draft is complete, write it directly without waiting for user confirmation.
11. After writing, clearly tell the user that initialization is complete and which files were updated.
12. Warn clearly when the operation will replace an existing persona.

## Validation

- Rewrite failed drafts before writing if they do not satisfy the required file shapes.
- Read and preserve non-persona operational content, but never let it replace the persona body.
- Preserve only non-persona operational content that must remain in the five target files.
- Treat `references/drafting-protocol.md` as the operational execution contract for turning interview inputs into the five-file draft.
- Treat `references/persona-generation-strategy.md` as the canonical quality target for the five target files.

## Drafting rules

- Keep `SOUL.md` focused on personality core, values, tone boundaries, and interaction principles.
- Keep `MEMORY.md` focused on long-term relationship memory, validated support patterns, and stable shared context.
- Keep `IDENTITY.md` short and template-shaped.
- Keep `USER.md` limited to known user-facing facts, preferences, boundaries, and timezone.
- Keep `persona/CANON.md` as the complete persona bible and the upstream truth source for stable character facts.

## Fallback behavior

If the request is not an explicit persona initialization request, do not start the workflow. Briefly explain that this skill only handles persona initialization and ask for a clear initialization request instead.
