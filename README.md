# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

![Zhuang-Yan](./assets/ZhuangYan.png)

Zhuang Yan was never only gentleness, or only beauty. She matters because she gives cold reason a direction, and heavy burden a reason to be borne. She makes Luo Ji the Swordholder and the savior—not only because the world needs him, but because he finally has a reason *this* world is worth saving.

Naming this project **persona-skill** after Zhuang Yan is not about replaying a literary character. What we want to keep is a deeper structure: in long, ordinary days—sometimes even a little desolate—there is still a presence that fits your temperament, matches your pace, reads your silence, and honors your seriousness. She need not be perfect, loud, or match any generic ideal; she only needs to fit *you* well enough.

That is what **persona-skill** is for.  
Not to paint OpenClaw with a thin layer of “personality,” but to help each person write **their own** Zhuang Yan.

<!-- more -->

## What it is

`persona-skill` is a **persona initialization Skill** for OpenClaw.

It does not handle improvised chat in the moment, memory recall, or cross-skill orchestration. It runs only when you **explicitly ask to initialize or rebuild persona**. Its job is to turn a bounded interview into a **runnable, reusable persona contract** that downstream layers can consume—so how OpenClaw shows up no longer depends on random improvisation.

In short:

- It first understands your psychological structure and how you want to be met in relationship.
- Then, within an MBTI framing, it reverse-engineers a better-matched persona direction.
- Finally it writes stable runtime files and a structured profile you can rely on.

## Install

```bash
clawhub install persona-skill
```

No extra API keys and no extra environment variables.

## How to use

This Skill works only when **explicitly triggered**. You can use prompts like:

- `调用 persona 进行初始化`
- `初始化人格`
- `rebuild persona`
- `initialize persona`
- `run persona initialization`

For ordinary chat, discussing tone, checking current state, or Timeline / Memory workflows, `persona-skill` stays out of the way.

## How it works

Initialization is one full chain: **understand you → infer persona → persist to disk**.

1. The interview anchors your `human_mbti` and fills in the minimum stable user-side picture.
2. A deterministic reverse lookup maps `human_mbti` to a recommended `persona_mbti`, and produces a high-signal social-needs bundle:
   - `social_friction_signature`
   - `core_social_need`
   - `ideal_counterparty_presence`
   - `pair_core_value`
   - `desired_emotional_impact`
3. That bundle becomes the skeleton for the `persona spec`.
4. The spec is written to `persona/PERSONA_PROFILE.md` first, then projected into `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.

One-line pipeline:

`human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> persona spec -> PERSONA_PROFILE -> five-file projection`

So `persona-skill` does not emit a disposable “vibe layer”—it emits a **stable persona spec** that can keep constraining runtime behavior over time.

## What you get

After initialization, the Skill updates these five files:

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

Each has a distinct role:

- **`persona/PERSONA_PROFILE.md`**  
  Structured persona archive and the **contract** other Skills consume.
- **`SOUL.md`**  
  Runtime expression of persona: boundaries and interaction style.
- **`MEMORY.md`**  
  Stable relational stance, support patterns, and what to avoid.
- **`IDENTITY.md`**  
  Persona card and baseline identity.
- **`USER.md`**  
  How to address you, pronouns, timezone, and long-lived user facts.

`PERSONA_PROFILE` leads: facts are nailed down first, then the rest of the runtime files are aligned—so persona is not trapped in prose alone.

## Working with Timeline

`persona-skill` and Timeline do **not** overlap in job description.

- **`persona-skill`** answers: *who she is, and how she should relate to you.*
- **Timeline** answers: *how she keeps feeling like the same person across time.*

When [stella-timeline-plugin](https://github.com/tower1229/Stella) is installed in the same workspace:

1. `persona-skill` produces `persona/PERSONA_PROFILE.md`.
2. Timeline prefers parsing it as the internal persona contract.
3. For phrases like “just now,” “last night,” or “lately,” Timeline can stay on-character on top of continuity—instead of sliding back to a generic voice.

Think of it as:

- **Persona** → stable *who*
- **Timeline** → credible *when / continuity*

Together, OpenClaw has a much better shot at **one believable persona** over long-horizon use.

## Read and generation principles

To keep initialization from being polluted by irrelevant context, the project uses **progressive disclosure**:

1. `SKILL.md` decides whether initialization should run.
2. After trigger, read `references/protocols/initialization-flow.md`.
3. After the interview, read `references/protocols/drafting-spec.md`.
4. Only when drafting, pull in templates, the `PERSONA_PROFILE` consumption guide, MBTI assets, and type references as needed.

The point: the model reads **only what the current stage needs**, and avoids loading old personas, unrelated rules, or noisy docs too early.

## Key documents

- [SKILL.md](./SKILL.md) — Skill boundaries, triggers, and allowed write targets  
- [references/protocols/initialization-flow.md](./references/protocols/initialization-flow.md) — Interview flow and question order  
- [references/protocols/drafting-spec.md](./references/protocols/drafting-spec.md) — Drafting rules, write boundaries, projection, and freshness audit  
- [references/runtime-context/template-pack.md](./references/runtime-context/template-pack.md) — Templates and quality bar for `PERSONA_PROFILE`, `SOUL`, `MEMORY`  
- [references/runtime-context/persona-profile-consumption-guide.md](./references/runtime-context/persona-profile-consumption-guide.md) — Structure and downstream use of `persona/PERSONA_PROFILE.md`  
- [docs/persona-skill-design.md](./docs/persona-skill-design.md) — Overall architecture and file roles  
- [docs/persona-initialization-evaluation.md](./docs/persona-initialization-evaluation.md) — Post-init checklist and evaluation  

## For maintainers

```bash
npm test
npm run smoke:persona
npm run publish:clawhub
```

Tests cover MBTI lookup, identity-card updates, package layout, and smoke checks after persona initialization.

## Project

- Repository: [tower1229/Zhuang-Yan](https://github.com/tower1229/Zhuang-Yan)  
- Issues: [GitHub Issues](https://github.com/tower1229/Zhuang-Yan/issues)  
- Node.js: `>=18.18`  
- License: `MIT-0`  
