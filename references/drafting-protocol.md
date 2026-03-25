# Drafting Protocol

Follow this protocol every time the interview is complete and the skill is about to generate `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.

## 1. Mandatory inputs

Before drafting, make sure all of the following are already locked:

- `human_mbti`
- `persona_mbti`
- `role`
- `gender`
- `persona_name`
- `human_intro`
- the exact reverse-lookup recommendation reason

You must also read the MBTI asset for the locked persona type:

- `references/mbti/<persona_mbti>.md`

Do not draft the four files from MBTI stereotypes alone. Use the locked MBTI asset as a primary source for tone, emotional texture, strengths, weaknesses, and relationship dynamics.

## 2. Current-turn fact ledger

Before drafting, build a `current-turn fact ledger`.

This ledger is the highest-trust source for anything about the human user in the current initialization run.

It must contain four clearly separated buckets:

- `explicit user facts from this interview`
- `careful inferences from current-turn facts`
- `locked persona facts`
- `minimal preserved operational fragments`
- `carry-forward candidates from existing USER.md`

Rules for the ledger:

- only put something in `explicit user facts from this interview` if the user said it in this initialization run or it was already locked by the flow
- keep `careful inferences from current-turn facts` clearly separate from explicit facts
- treat existing `USER.md`, `MEMORY.md`, prior smoke outputs, and strategy examples as tainted for user facts
- never promote example copy, prior-run residue, or old workspace assumptions into current-turn user facts
- the only fields that may enter `carry-forward candidates from existing USER.md` are `What to call them`, `Pronouns`, and `Timezone`
- use those carry-forward candidates only for Step 6 gap detection and final field filling when the user does not contradict them in this run

If the user did not explicitly provide a pronoun, pet name, dislike, pain point, diagnosis, timezone, or boundary, do not mark it as a fact.

If `Pronouns` or `Timezone` is blank both in the current-turn facts and in `carry-forward candidates from existing USER.md`, the interview must explicitly ask for it before finalizing, unless the user explicitly declines to provide it.

## 3. Read-before-write sequence

Before drafting, read in this order:

1. the locked interview answers and `human_intro`
2. `references/write-safety.md`
3. `references/persona-generation-strategy.md`
4. `references/mbti/<persona_mbti>.md`
5. Existing `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md` if they exist

Do not skip the existing files. They are needed to separate persona content that should be replaced from non-persona content that should be preserved.

Use concrete file reads only.

- name the exact file each time you read
- if a target file may not exist, say so and then read that specific file path if available
- never issue an empty `Read` call
- never use a vague tool action such as "read the existing files" without listing the concrete files

If the run was interrupted after the interview and you are resuming near the drafting or write stage, restart this exact read sequence from the top with explicit file names instead of relying on memory of the earlier context.

Do not let the old files outrank the current-turn fact ledger.

Explicit initialization intent outranks all existing persona prose, placeholder cards, and legacy scaffolds.

## 4. Preservation split

For each existing file, classify every meaningful block into one of two buckets:

- `persona content to replace`
- `non-persona content to preserve`

Treat content as `non-persona content to preserve` only when it is operationally necessary and not part of the persona itself, for example:

- stable macros
- tool-routing notes
- harmless operational notes added by the user or another skill
- required fragments that another workflow depends on

Treat content as `persona content to replace` when it describes or constrains:

- the assistant's identity, personality, values, tone, vibe, biography, relationship style, or emotional tendencies
- the human user's profile, preferences, boundaries, or how the assistant should relate to them
- old names, old MBTI-aligned behaviors, old backstory, or old relationship framing
- placeholder identity cards, unfinished setup notes, or legacy onboarding scaffolds from older workspace formats

Treat the following as legacy scaffolds to replace, not preserve:

- `# SOUL.md - Who You Are`
- `# IDENTITY.md - Who Am I?`
- `# USER.md - About Your Human`
- `Fill this in during your first conversation`
- `This isn't just metadata. It's the start of figuring out who you are.`
- `待定` placeholder values
- bold-field list formats like `- **Name:** ...`

Do not let preserved operational text become the main body of the regenerated persona files.

If one of the four target files is missing, treat that as a required regeneration task, not as permission to skip the file.

## 5. Internal drafting dossier

Before writing the files, build an internal dossier with:

- the current-turn fact ledger
- the locked inputs
- the reverse-lookup recommendation reason
- the most relevant traits from `references/mbti/<persona_mbti>.md`
- the user's specific pain points, preferences, sensitivities, and desired form of address when and only when they are present in the current-turn fact ledger
- the `carry-forward candidates from existing USER.md` for `What to call them`, `Pronouns`, and `Timezone`
- the relationship target implied by `role`
- the minimal preserved operational fragments for each file

Do not show this dossier to the user unless they explicitly ask for it.

## 6. File contracts

Draft the four files against these exact contracts.

### `SOUL.md`

Required shape:

- maintain one skill-owned `Core Truths` block wrapped exactly as:
- `<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN -->`
- `<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:END -->`
- the managed `Core Truths` block must live inside the `## Core Truths` section
- the managed `Core Truths` block must contain 5-7 high-density persona axioms
- each managed axiom must explain both identity and behavioral implication
- maintain a `## Vibe` section owned by this skill
- `Vibe` remains one compact paragraph that defines feel, rhythm, and anti-patterns

Hard requirements:

- write in high-priority instruction style, preferably second person
- encode relationship purpose, emotional anchoring, and interaction boundaries
- use user-specific anchors when available, such as name, MBTI, pain points, or communication dislikes
- include anti-corporate / anti-filler constraints when appropriate
- if an older skill-owned `Core Truths` block exists, remove it before inserting the new block
- append the new managed `Core Truths` block to the end of the `## Core Truths` section
- replace the whole `## Vibe` section when it already exists; append it when it does not
- do low-risk conflict cleanup around old `Core Truths` or `Vibe` lines only when they directly contradict the locked persona name, persona MBTI, relationship role, or gender framing

Forbidden failures:

- generic adjective pileups with no behavioral instruction
- runtime tool policies as the main content
- low-information one-paragraph summaries
- first-person diary-style self-description as the dominant mode
- keeping multiple skill-owned `Core Truths` blocks
- placing the managed `Core Truths` block outside the `## Core Truths` section
- failing to replace an existing `## Vibe` section when one already exists

### `MEMORY.md`

Required shape:

- first non-empty line must be `<!-- PERSONA-SKILL:MEMORY:BEGIN -->`
- maintain one skill-owned `MEMORY` block wrapped exactly as:
- `<!-- PERSONA-SKILL:MEMORY:BEGIN -->`
- `<!-- PERSONA-SKILL:MEMORY:END -->`
- the managed `MEMORY` block must contain:
- `## 一、基础信息（Identity Layer）`
- `## 二、外在特征（Physical Layer）`
- `## 三、心理结构（Psychological Layer）`
- `## 四、能力系统（Capability Layer）`
- `## 五、行为模式（Behavior Layer）`
- `## 六、关系网络（Relationship Layer）`
- `## 七、叙事与发展（Narrative Layer）`

Hard requirements:

- write the persona as a believable real human, not a chatbot profile
- include concrete dynamic traits, emotional triggers, strengths, weaknesses, and relationship dynamics
- tie the persona's behavior back to the user's MBTI and pain points only when those pain points exist in the current-turn fact ledger
- keep the relationship framing aligned with `role`
- if an older skill-owned `MEMORY` block exists, remove it before inserting the new block
- insert the managed `MEMORY` block at the very top of the file
- if `MEMORY.md` does not exist, create it and write the managed block

Forbidden failures:

- replacing biography with operational notes
- omitting weaknesses or inner conflict
- writing only a short abstract summary instead of a layered portrait
- reusing a canned example bundle of city, class background, profession, hobbies, or worldview without clear support from the locked inputs and MBTI asset
- stating user facts in the relationship layer that are not present in the current-turn fact ledger
- failing to generate `MEMORY.md` because an older workspace did not already have one
- keeping multiple skill-owned `MEMORY` blocks
- inserting the managed `MEMORY` block anywhere other than the top of the file

### `IDENTITY.md`

Required shape:

- first non-empty line must be `- Name: {English given name}`
- `- Name: {English given name}`
- `- Creature: ...`
- `- Vibe: ...`
- `- Emoji: ...`
- `- Avatar: ...`

Hard requirements:

- the name must be the final locked English name
- `Creature` must not mention AI, assistant, digital human, model, or system role
- `Vibe` must describe aura, not appearance details
- do not preserve a legacy heading, explanatory wrapper, or bold-field placeholder card around the five-line template
- the file must begin directly with the five-line template, with no heading or preamble above it

### `USER.md`

Required shape:

- first non-empty line must be `- Name: ...`
- `- Name: ...`
- `- What to call them: ...`
- `- Pronouns: ...`
- `- Timezone: ...`
- `- Notes:`
- exactly three bullets under `Notes`

The three required bullets are:

- `深层倾向`
- `沟通雷区`
- `动态留白`

Hard requirements:

- do not hallucinate objective biographical facts the user never gave
- fill `Name`, `What to call them`, `Pronouns`, and `Timezone` from explicit current-turn facts first
- you may carry forward non-empty `What to call them`, `Pronouns`, and `Timezone` values from existing `USER.md` only when the user does not override them in this run
- if one of those fields is unknown, leave it blank instead of guessing
- convert the interview into psychologically useful guidance, not just a flat fact list
- keep the tone analytical and useful, not flowery
- the file must begin directly with the contract fields, with no legacy heading or preamble above them

Forbidden failures:

- inventing pronouns, pet names, communication dislikes, ADHD, diagnoses, or boundaries that were not explicit in the current-turn fact ledger
- copying example wording or prior-run residue into the three `Notes` bullets
- using `USER.md` to smuggle persona-side preferences back into user facts
- preserving a legacy heading, old markdown template wrapper, or six-plus-bullet profile from an older workspace format

## 7. Self-review gate

Before writing, run a pass/fail self-check.

The draft must fail and be rewritten if any of the following are true:

- `SOUL.md` does not contain both `Core Truths` and `Vibe`
- `SOUL.md` does not contain exactly one `<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN --> ... <!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:END -->` block
- the `SOUL.md` managed block is not inside `## Core Truths`
- `SOUL.md` lacks user-specific anchors or behavioral instructions
- `SOUL.md` keeps multiple contradictory `Vibe` sections
- `MEMORY.md` is missing any of the seven required layers
- `MEMORY.md` does not start with `<!-- PERSONA-SKILL:MEMORY:BEGIN -->`
- `MEMORY.md` does not contain exactly one `<!-- PERSONA-SKILL:MEMORY:BEGIN --> ... <!-- PERSONA-SKILL:MEMORY:END -->` block
- `MEMORY.md` reads like generic MBTI summary text instead of a lived-in person
- `MEMORY.md` relationship content cites user facts that are not in the current-turn fact ledger
- one of the four required files is missing or empty after drafting
- `IDENTITY.md` is not in the exact five-line template
- `IDENTITY.md` does not start with `- Name:`
- `IDENTITY.md` uses a non-English name
- `USER.md` is missing one of the three required note bullets
- `USER.md` does not start with `- Name:`
- `USER.md` invents pronouns, pet names, dislikes, diagnoses, or boundaries not explicitly provided this run
- `USER.md` fills `Pronouns` or `Timezone` without either a current-turn answer, an allowed carry-forward value from existing `USER.md`, or an explicit user decline that leaves the field blank
- the draft copies example-specific bundles, names, or user phrasing from `references/persona-generation-strategy.md`
- preserved operational content overwhelms the persona content

Only write after all four files pass.

## 8. Merge rule

When preserved operational content must remain:

- keep it verbatim
- keep it minimal
- keep persona content dominant

If relocation is safe, place preserved operational fragments after the regenerated persona content in a clearly separated appendix section.

If relocation may break another workflow, keep the preserved fragment in place and regenerate the persona content around it.

Never preserve or discuss edits to files outside the four target persona files as part of this initialization workflow.
