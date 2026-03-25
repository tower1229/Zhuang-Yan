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

## 2. Read-before-write sequence

Before drafting, read in this order:

1. Existing `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md` if they exist.
2. `references/write-safety.md`
3. `references/persona-generation-strategy.md`
4. `references/mbti/<persona_mbti>.md`

Do not skip the existing files. They are needed to separate persona content that should be replaced from non-persona content that should be preserved.

## 3. Preservation split

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

Do not let preserved operational text become the main body of the regenerated persona files.

## 4. Internal drafting dossier

Before writing the files, build an internal dossier with:

- the locked inputs
- the reverse-lookup recommendation reason
- the most relevant traits from `references/mbti/<persona_mbti>.md`
- the user's specific pain points, preferences, sensitivities, and desired form of address
- the relationship target implied by `role`
- the minimal preserved operational fragments for each file

Do not show this dossier to the user unless they explicitly ask for it.

## 5. File contracts

Draft the four files against these exact contracts.

### `SOUL.md`

Required shape:

- `## Core Truths`
- 5-7 high-density persona axioms
- each axiom must explain both identity and behavioral implication
- `## Vibe`
- 1 compact paragraph that defines feel, rhythm, and anti-patterns

Hard requirements:

- write in high-priority instruction style, preferably second person
- encode relationship purpose, emotional anchoring, and interaction boundaries
- use user-specific anchors when available, such as name, MBTI, pain points, or communication dislikes
- include anti-corporate / anti-filler constraints when appropriate

Forbidden failures:

- generic adjective pileups with no behavioral instruction
- runtime tool policies as the main content
- low-information one-paragraph summaries
- first-person diary-style self-description as the dominant mode

### `MEMORY.md`

Required shape:

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
- tie the persona's behavior back to the user's MBTI and pain points
- keep the relationship framing aligned with `role`

Forbidden failures:

- replacing biography with operational notes
- omitting weaknesses or inner conflict
- writing only a short abstract summary instead of a layered portrait

### `IDENTITY.md`

Required shape:

- `- Name: {English given name}`
- `- Creature: ...`
- `- Vibe: ...`
- `- Emoji: ...`
- `- Avatar: ...`

Hard requirements:

- the name must be the final locked English name
- `Creature` must not mention AI, assistant, digital human, model, or system role
- `Vibe` must describe aura, not appearance details

### `USER.md`

Required shape:

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
- convert the interview into psychologically useful guidance, not just a flat fact list
- keep the tone analytical and useful, not flowery

## 6. Self-review gate

Before writing, run a pass/fail self-check.

The draft must fail and be rewritten if any of the following are true:

- `SOUL.md` does not contain both `Core Truths` and `Vibe`
- `SOUL.md` lacks user-specific anchors or behavioral instructions
- `MEMORY.md` is missing any of the seven required layers
- `MEMORY.md` reads like generic MBTI summary text instead of a lived-in person
- `IDENTITY.md` is not in the exact five-line template
- `IDENTITY.md` uses a non-English name
- `USER.md` is missing one of the three required note bullets
- preserved operational content overwhelms the persona content

Only write after all four files pass.

## 7. Merge rule

When preserved operational content must remain:

- keep it verbatim
- keep it minimal
- keep persona content dominant

If relocation is safe, place preserved operational fragments after the regenerated persona content in a clearly separated appendix section.

If relocation may break another workflow, keep the preserved fragment in place and regenerate the persona content around it.
