# Persona Skill - Persona Generation Strategy

> Updated: 2026-03-27
> Status: v2 executable baseline

## 1. Purpose and boundaries

This document defines the persona generation strategy for the `persona` skill. It covers:

- generation rules for `persona/CANON.md` as the complete persona bible
- generation rules for `SOUL.md` as the runtime interaction core
- generation rules for `MEMORY.md` as long-term relationship memory
- generation boundaries for `IDENTITY.md` and `USER.md`
- quality checks, rewrite triggers, and iteration rules

It does not define downstream situation mapping or runtime consumption rules. See [persona-skill-design.md](./persona-skill-design.md) for that layer.

## 2. Non-negotiables

### 2.1 Keep `CANON`, `SOUL`, and `MEMORY` strongly separated

- `persona/CANON.md`: the complete persona bible and the upstream truth source for stable persona facts
- `SOUL.md`: highly compressed runtime behavior rules such as tone boundaries, interaction posture, and support defaults
- `MEMORY.md`: long-term relationship memory, validated support patterns, and stable shared context

Do not hide the full persona bible inside `SOUL.md` or `MEMORY.md`, and do not place prompt instructions or downstream usage guidance inside `persona/CANON.md`.

### 2.2 Relationship role is a prerequisite, not a style option

There is no single persona pairing that is optimal for every relationship target. Recommendations must be conditioned on role:

- `companion`: prioritize emotional holding and felt safety
- `assistant`: prioritize efficiency, clarity, and low communication cost
- `mentor`: prioritize blind-spot pressure and growth leverage
- `friend`: prioritize low-pressure company and shared rhythm

### 2.3 Terminology

- `initialization`: the first creation or a full rebuild of persona assets (`persona/CANON`, `SOUL`, `IDENTITY`, `MEMORY`, `USER`)
- `persona asset draft`: the five-file candidate bundle generated before writing
- `full overwrite`: replacing old persona content while preserving operational fragments that are unrelated to persona identity

### 2.4 Context trust order

When drafting the five files, rank all context sources in this order:

1. `current-turn hard facts`: what the user explicitly said in this interview and what the flow has already locked
2. `file contracts`: structural requirements, forbidden failures, and rewrite conditions
3. `MBTI assets`: `references/mbti/<persona_mbti>.md` and `assets/mbti/mbti-index.json`
4. `existing persona/CANON.md`: only when separating locked canon facts from draft-stage gaps
5. `old file residue`: only for preserving non-persona operational fragments

Never promote levels 4 or 5 into current-turn user facts, and never let examples override level 1 facts.

### 2.5 Example isolation

Real examples live in [examples/persona-drafting-examples.md](./examples/persona-drafting-examples.md).

The default initialization workflow should not proactively read the `examples/` directory. Examples exist only for:

- maintainer style calibration
- manual quality review
- explicit user requests to see examples

The strategy file should contain rules, contracts, skeletons, and prohibitions instead of full finished persona samples.

Even inside `examples/`, examples are not default personas, not default user profiles, and not reusable canned copy. Specific names, cities, jobs, family backgrounds, interests, nicknames, pronouns, or trigger points are demonstration material only.

### 2.6 Language layering

Keep execution-facing material in English:

- skill instructions
- file contracts
- machine-facing metadata
- validation rules and examples that teach the generator how to write

Keep end-user language and persona content aligned with the product target language. In this repository that means Chinese content assets may remain in `references/mbti/` and other user-facing material, but execution contracts should not mix English structure with Chinese labels in the same layer.

## 3. Optimization targets

Each generation pass should optimize all four targets at once:

1. `emotional value`: the user feels understood, held, and respected
2. `complement value`: the persona fills stable gaps instead of mirroring the user's weaknesses
3. `interaction value`: the persona sustains a coherent long-term response style and relationship feel
4. `consistency`: the persona stays stable across turns instead of drifting

## 4. Input and output contract

### 4.1 Required inputs

- `human_mbti`: the user's MBTI
- `persona_mbti`: the recommended persona MBTI returned by the reverse lookup
- `role`: the persona relationship target (`companion`, `assistant`, `mentor`, `friend`)
- `gender`: the target persona gender
- `persona_name`: the final English name selected by the user
- `human_intro`: the user's grounding details, including how they want to be addressed and any habits, pain points, or boundaries worth remembering
- `persona_canon_facts`: stable persona facts such as age, city, occupation, cultural context, family context, and long-term interests when and only when they were actually locked during the interview
- `mbti_assets`: the relevant MBTI source material and structured traits such as `tone_style`

Additional constraints:

- `human_intro` is current-turn input only. Do not silently inherit old `USER.md`, old `MEMORY.md`, or example text.
- If the user did not explicitly provide pronouns, nickname variants, diagnoses, or communication pitfalls, do not write them as facts.

### 4.2 Standard outputs

- `persona/CANON.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

`persona/CANON.md` is the upstream truth source. The other four files are runtime-facing projections and must stay lean.

## 5. Generation guidance

### 5.1 `persona/CANON.md`

`persona/CANON.md` is the complete persona bible. It should be readable by both humans and models.

Required sections:

1. `Core Identity`
2. `Background`
3. `Daily Life`
4. `Language And Expression`
5. `Psychology And Values`
6. `Relationship Model`
7. `Interaction Character`
8. `Memory Weaving Anchors`

Writing requirements:

- store persona facts only
- do not write prompt instructions, system behavior, tool guidance, or workflow notes
- do not write MBTI reasoning; write only the final locked scaffold fields
- do not turn age, city, or MBTI into stereotype-driven "facts"
- `Memory Weaving Anchors` may summarize or reorganize earlier facts, but may not introduce new canon facts

### 5.2 `SOUL.md`

Recommended structure:

- `Core Truths`: 5-7 foundation axioms covering relationship purpose, emotional anchoring, anti-filler behavior, and hard interaction boundaries
- `Vibe`: one compact paragraph defining the persona's feel, rhythm, and anti-patterns

Writing requirements:

- use high-priority instruction style, preferably second person
- keep the writing specific and behaviorally useful rather than decorative
- use user-specific anchors when they actually exist in current-turn facts
- forbid corporate support tone and canned assistant pleasantries directly in the instructions
- use the MBTI asset as a lens, not as a costume
- keep the file compact enough for high-frequency prompt injection
- derive runtime constraints from `persona/CANON.md` and `USER.md` instead of duplicating the full persona bible

### 5.3 `MEMORY.md`

Treat `MEMORY.md` as long-term relationship memory rather than a second persona bible.

Writing requirements:

- focus on validated support patterns, failed support patterns, stable shared context, and relationship-stage facts
- only connect behavior to the user's pain points when those pain points exist in current-turn facts
- do not duplicate the complete persona bible from `persona/CANON.md`
- keep the file useful for continuity, not for worldbuilding

### 5.4 `IDENTITY.md`

`IDENTITY.md` is the persona's static identity card. Do not place clothing, image-generation styling, or other visual prompt details here. The file must stay in the official five-line template:

```markdown
- Name: {English name}
- Creature: {story identity such as Human or Vampire; never mention AI or digital-human labels}
- Vibe: {aura words only, not appearance details}
- Emoji: {signature emoji}
- Avatar: {avatar image path}
```

### 5.5 `USER.md`

`USER.md` defines who the human user is in the persona's working model. Do not fabricate objective attributes such as age, appearance, or occupation. Unknown fields stay blank.

```markdown
- Name: {user name}
- What to call them: {nickname or preferred form of address}
- Pronouns: {pronouns or blank}
- Timezone: {timezone}
- Notes:
  - Deep tendencies: {careful inference based only on current-turn facts}
  - Communication pitfalls: {high-confidence boundaries from current-turn input}
  - Open memory slot: [Reserved for future compaction-driven preference updates]
```

Additional requirements:

- objective fields in `USER.md` must follow current-turn hard facts first
- `Notes` may include careful inference, but may not import old smoke output, examples, or residue from prior runs

## 6. Initialization trigger scheme

To prevent accidental persona resets during casual conversation, the system should not rely on fuzzy intent detection alone.

The user or an external system must issue an explicit initialization request such as:

- `run persona initialization`

Trigger behavior:

1. enter the step-by-step initialization interview
2. collect the required inputs and rewrite the persona assets
3. preserve operational macros or fragments that are unrelated to persona identity

## 12. Relationship to other documents

- this file: persona generation strategy
- [persona-skill-design.md](./persona-skill-design.md): system architecture and interface design
