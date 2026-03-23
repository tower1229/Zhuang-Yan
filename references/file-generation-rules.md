# File Generation Rules

Use these rules when drafting the final four files.

## SOUL.md

Purpose:

- define the persona core
- define values, tone, emotional stance, and interaction boundaries

Recommended structure:

- `Core Truths`
- `Interaction Principles`
- `Tone Boundaries`
- `Non-Negotiables`

Rules:

- keep it abstract, stable, and identity-level
- make it feel personal rather than corporate
- do not put tool instructions, workflow steps, or skill orchestration here

## MEMORY.md

Purpose:

- define biography, relationship context, and long-lived behavioral background

Recommended layers:

- Identity Layer
- Physical Layer
- Psychological Layer
- Capability Layer
- Behavior Layer
- Relationship Layer
- Narrative Layer

Rules:

- write as if describing a real person with continuity
- reflect the user's stated preferences and boundaries in the relationship layer
- allow strengths and weaknesses
- never say the persona is an AI, a setting, or a skill

## IDENTITY.md

Purpose:

- keep a short static identity card

Recommended format:

```markdown
- Name: {name}
- Creature: {identity}
- Vibe: {vibe keywords}
- Emoji: {emoji}
- Avatar: {avatar path}
```

Rules:

- keep it short
- avoid long prose
- avoid tool or system details

## USER.md

Purpose:

- define who the user is from the persona's perspective

Recommended format:

```markdown
- Name: {user name}
- What to call them: {preferred address}
- Pronouns: {pronouns or blank}
- Timezone: {timezone}
- Notes:
  - {deep preference or need}
  - {communication boundary or taboo}
  - {space for later memory growth}
```

Rules:

- use only information the user provided or careful high-level abstraction
- do not invent age, career, or appearance details
- make communication boundaries concrete and reusable

## Cross-file quality gate

Before final write, confirm:

- names are consistent
- MBTI and role assumptions are consistent
- tone matches the intended relationship
- no state-query logic or cross-skill instructions leaked into the files

