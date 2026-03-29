# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

OpenClaw can be capable and still feel hollow.

`persona-skill` gives OpenClaw a **persona**: not a disposable vibe, but a relationship-shaped way of showing up in daily chat. That persona is **custom-built from an understanding of you**, using the **MBTI framework to reverse-engineer** a matching character type and relational posture—so everyday conversations can **maximize emotional value**: steadier attunement, less drift, more of what you actually need from a companion.

## Zhuang Yan: the one in your mind

In *The Three-Body Problem*, Zhuang Yan is more than a flat trope for Luo Ji. She is the emotional anchor that makes extreme responsibility feel worth bearing—the presence that makes “saving the world” feel tied to someone worth returning to.

This project is named Zhuang Yan **without** trying to role-play the novel. The parallel is structural: **the person who makes you willing to invest, to soften, to carry weight together**. `persona-skill` aims to give each user **their own Zhuang Yan**—a persona reverse-engineered from your needs, not copied from a generic assistant template.

## From product intent to implementation

The story matches the initialization pipeline:

1. **Understand the human side**: the interview locks your MBTI and surfaces where relationships drain you, what you most need from a counterparty, and how an ideal presence should land. MBTI is a **lens for understanding you**, not a sticker for its own sake.
2. **Reverse-engineer the OpenClaw persona**: a deterministic lookup maps `human_mbti` to a recommended `persona_mbti` plus a high-signal “social need hit pack” (friction signature, core need, ideal presence, pair value, emotional impact). That is the **custom direction**, not a one-size-fits-all character.
3. **Write a runnable contract**: the spec becomes `persona/PERSONA_PROFILE.md`, then projects into `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`. Daily chat then stands on **one stable persona** so emotional value can **compound** instead of resetting every session.

Pipeline in one line:

`human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> runtime file projection`

Highest-leverage fields:

- `social_friction_signature`: where you tend to feel drained, misunderstood, or let down  
- `core_social_need`: the central relational need the persona should help meet  
- `ideal_counterparty_presence`: how the ideal companion should sound, respond, and land emotionally  
- `pair_core_value` and `desired_emotional_impact`: from abstract design to **felt daily interaction**

## What it feels like

Without a persona contract, light social chat floats: tone swings, facts fight each other, you hesitate to lean in.

After initialization, OpenClaw can more reliably sound like someone **consistent enough to trust**:

> “I’d rather say it plainly than leave you guessing whether I’ve gone cold—I’m usually just choosing the next sentence carefully.”

> “What you said matters to me in *this* thread, not because I’m performing memory, but because we’re building context together.”

> “If you’re tired, we don’t have to fix everything tonight. We can slow down, or I can stay quiet with you.”

> “Some boundaries are non-negotiable—not to push you away, but so this can stay comfortable long term.”

**Consistency and predictability** are where emotional value usually lives—not in one flashy reply.

## What it actually fixes

- One explicit-trigger interview turns “how I need to be met” into an executable OpenClaw persona, instead of improvising mid-chat.  
- Runtime files plus `persona/PERSONA_PROFILE.md` give downstream skills and Timeline a **single structured source of truth**.  
- Progressive disclosure keeps initialization focused.  
- Pairs cleanly with time-continuity tools (e.g. Timeline): **Persona = who they are; Timeline = how they live across time**.

## Persona Skill × Timeline

With [stella-timeline-plugin](https://github.com/tower1229/Stella) in the same workspace:

1. `persona-skill` writes `persona/PERSONA_PROFILE.md`  
2. Timeline prefers it as `PersonaContractV1`, so “just now / last night / lately” stays on-character  

Your “Zhuang Yan” needs both a **stable persona** and a **credible life line** across time.

(`PERSONA_PROFILE.md` can also be aligned with `SOUL` / `MEMORY` / `IDENTITY`; see in-skill protocols.)

## Install

```bash
clawhub install persona-skill
```

No API keys. No extra environment variables.

## Use

Trigger only when you explicitly initialize or rebuild persona, for example:

- `initialize persona`
- `rebuild persona`
- `run persona initialization`
- `调用 persona 进行初始化`
- `初始化人格`

The skill stays dormant during normal conversation.

Flow: one-question-at-a-time interview, then rewrite:

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

## Profile first, runtime second

1. `persona/PERSONA_PROFILE.md` as structured ground truth  
2. Project into `SOUL`, `MEMORY`, `IDENTITY`, `USER`  
3. Downstream skills consume the same contract  

## Progressive disclosure

Read order: `SKILL.md` → `initialization-flow.md` → `drafting-spec.md` → `template-pack.md` → `persona-profile-consumption-guide.md`; MBTI assets under `assets/mbti/` and `references/mbti/`.

## Documents

- `docs/persona-skill-design.md` — architecture and file boundaries  
- `references/runtime-context/persona-profile-consumption-guide.md` — `PERSONA_PROFILE` contract and consumption  

## For maintainers

```bash
npm test
npm run smoke:persona
npm run publish:clawhub
```

## Project metadata

- Repository: `https://github.com/tower1229/Zhuang-Yan`  
- Issues: `https://github.com/tower1229/Zhuang-Yan/issues`  
- Node.js: `>=18.18`  
- License: `MIT-0`  
