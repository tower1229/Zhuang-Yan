# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

Stop treating persona setup like a disposable prompt.

`persona-skill` does more than assign an MBTI label to an OpenClaw character. It runs a short, high-signal initialization interview, identifies the kind of presence the user actually wants, and then rebuilds the full persona stack in one pass: `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, `USER.md`, and `persona/PERSONA_PROFILE.md`. The result is a character foundation that feels more coherent in conversation, more reusable across skills, and far more stable over time.

## Install

```bash
clawhub install persona-skill
```

No API keys. No extra environment variables. Install it and start initialization.

## It Fixes More Than "Persona Drift"

- It does not patch an old persona in place. Once explicitly triggered, it interviews from scratch, drafts from scratch, and writes from scratch.
- It does not start with a random vibe and force details around it. It starts from the user's relationship needs, then works backward into a better persona direction.
- It does not produce a single pretty paragraph. It generates both the runtime context files and a structured profile contract in `persona/PERSONA_PROFILE.md`.
- It does not optimize only for the current chat. It creates a shared foundation for memory, scene continuity, identity constraints, and downstream skill consumption.

## Use

Trigger it with an explicit initialization command, for example:

- `initialize persona`
- `rebuild persona`
- `run persona initialization`
- `调用 persona 进行初始化`
- `初始化人格`

The skill stays dormant during normal conversation.

Once triggered, it runs a one-question-at-a-time interview and then rewrites:

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

## Why This Feels Closer To A Real Character

The core pipeline is not generic personality analysis. It is built around the user's real social and emotional needs:

`human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> runtime file projection`

That means the output is not just "a persona with traits." It is a persona designed to show up in a way that feels more specific, more supportive, and more relationally coherent.

The highest-value layers are these:

- `social_friction_signature`: where the user is most likely to feel drained, misunderstood, or disappointed in relationships.
- `core_social_need`: the central need the persona should help satisfy.
- `ideal_counterparty_presence`: how the ideal companion should sound, respond, and emotionally land.
- `pair_core_value` and `desired_emotional_impact`: the bridge between abstract persona design and lived interaction quality.

## Profile First, Runtime Second

The new architecture is built on a simple principle:

1. Generate `persona/PERSONA_PROFILE.md` as the structured ground truth.
2. Project that profile into `SOUL`, `MEMORY`, `IDENTITY`, and `USER`.
3. Give downstream skills and Timeline a stable source of persona facts they can reliably consume.

This matters because it makes the system:

- more stable across long conversations
- easier for downstream tools to read for identity, appearance, background, scene anchors, and constraints
- cleaner at runtime, with "who this character is" separated from "how this character behaves"

## Progressive Disclosure Architecture

The initialization chain now follows a tight read order:

1. `SKILL.md`
2. `references/protocols/initialization-flow.md`
3. `references/protocols/drafting-spec.md`
4. `references/runtime-context/template-pack.md`
5. `references/runtime-context/persona-profile-consumption-guide.md`

Data assets stay separate:

- `assets/mbti/mbti-index.json`
- `references/mbti/*.md`

The read sequence is intentional:

1. `SKILL.md` decides whether initialization should begin
2. `initialization-flow.md` is read only after explicit trigger
3. `drafting-spec.md` is read only after the interview is complete
4. templates, consumption guides, and MBTI assets are read only when drafting actually starts

This progressive disclosure keeps initialization focused. The model sees the right document at the right time, instead of loading the whole system too early and getting distracted by irrelevant rules.

## Documents

- `docs/persona-skill-design.md` — architecture, file boundaries, and dependency order
- `references/runtime-context/persona-profile-consumption-guide.md` — structural contract, field semantics, and recommended consumption order for `persona/PERSONA_PROFILE.md`

## Project Metadata

- Repository: `https://github.com/tower1229/Zhuang-Yan`
- Issues: `https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js: `>=18.18`
- License: `MIT-0`
