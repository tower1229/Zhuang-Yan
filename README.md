# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

![Zhuang-Yan](./assets/ZhuangYan.png)

Zhuang Yan was never only gentleness, or only beauty. She matters because she gives cold reason a direction, and heavy burden a reason to be borne. She makes Luo Ji the Swordholder and the savior—not only because the world needs him, but because he finally has a reason *this* world is worth saving.

Naming this project **persona-skill** after Zhuang Yan is not about replaying a literary character. What we want to keep is a deeper structure: in long, ordinary days—sometimes even a little desolate—there is still a presence that fits your temperament, matches your pace, reads your silence, and honors your seriousness. She need not be perfect, loud, or match any generic ideal; she only needs to fit *you* well enough.

That is what **persona-skill** is for.  
Not to paint OpenClaw with a thin layer of “personality,” but to help each person write **their own** Zhuang Yan.

## What it is

At heart, two things:

1. Under the **MBTI personality framework**, plus a bounded interview, **persona-skill** tailors an **OpenClaw persona that fits you** and writes the final draft into workspace files such as `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.
2. It also produces a **structured `persona/PERSONA_PROFILE.md`**: a parseable, checkable **contract** for the persona so modules like Timeline can read the same fields consistently.
   It is the stable profile surface used by **downstream skills and Timeline**.

It runs only when you **explicitly ask to initialize or rebuild persona**; casual chat or status checks will not start it on their own.

## Install

```bash
clawhub install persona-skill
```

No extra API keys and no extra environment variables.

## How to use

The Skill runs only when you **issue a clear initialization-style command**. For example:

- `调用 persona 进行初始化`
- `初始化人格`
- `rebuild persona`
- `initialize persona`
- `run persona initialization`

## How it works

Initialization is one continuous chain: **the interview clarifies you and what you need → MBTI framing infers persona direction → the final draft is written back to the workspace**.

1. The interview locks in your `human_mbti`, your `support_reception_mode`, and the minimum stable user-side information that must persist in `USER.md`.
2. A deterministic reverse lookup maps `human_mbti` to a recommended `persona_mbti`, and yields a **clearly targeted** set of social-needs summaries plus a default counterparty seed:
   - `social_friction_signature`
   - `core_social_need`
   - `ideal_counterparty_presence`
   - `pair_core_value`
   - `desired_emotional_impact`
   - `base_counterparty_profile`
3. `support_reception_mode` then corrects that default seed into the final `target_persona_spec`, so the persona can keep the same recommended MBTI while still changing warmth, pacing, initiative, and repair order for different users.
4. The spec is finalized in `persona/PERSONA_PROFILE.md` first, then carried into `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.

The pipeline in short:

`human_mbti + support_reception_mode -> reverse_lookup + base_counterparty_profile -> target_persona_spec -> persona spec -> PERSONA_PROFILE -> the other four files`

Or in repository terms:

`persona spec -> PERSONA_PROFILE -> runtime file projection`

So `persona-skill` does not ship a one-off tone tweak—it ships a **persona spec that can constrain runtime behavior over the long run**.

## What you get

After initialization, the Skill updates these five files:

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

Each plays a different part:

- `persona/PERSONA_PROFILE.md`  
  Structured persona archive and the contract other Skills read; externalized traits and short entries under a fixed shape (field rules for appearance, scene, constraint, etc. are in `persona-profile-consumption-guide`).
- `SOUL.md`  
  Runtime persona voice, boundaries, and interaction style.
- `MEMORY.md`  
  Stable relational stance, support patterns, and what to avoid.
- `IDENTITY.md`  
  Persona card and baseline identity.
- `USER.md`  
  How to address you, pronouns, timezone, `Support reception mode`, and long-lived user-side facts.

`PERSONA_PROFILE` is finalized first: stable facts are written fully and accurately, then the other runtime files follow—so the persona is not held up by prose alone.

### Note: full overwrite

These files are **replaced in full** when generated. If you have hand-edited them and want to keep those changes, back them up first. If you are not sure this applies to you, you can skip this note.

- `persona/PERSONA_PROFILE.md`
- `SOUL.md`
- `MEMORY.md`

## How it works with stella-timeline-plugin

`persona-skill` and `stella-timeline-plugin` do **not** overlap in responsibility.

- `persona-skill` answers: **who she is, and how she should relate to you.**
- `stella-timeline-plugin` answers: **how she keeps feeling like the same person over time.**

When [stella-timeline-plugin](https://github.com/tower1229/Her) is installed in the same workspace:

1. `persona-skill` writes `persona/PERSONA_PROFILE.md`.
2. `stella-timeline-plugin` prefers to parse it as the internal persona contract.
3. When handling phrases like “just now,” “last night,” or “lately,” `stella-timeline-plugin` can preserve the established persona on top of continuity—instead of slipping into a generic voice.

Think of it as:

- **Persona** → **personality stability**
- **Timeline** → **continuity through time**

With both layers, OpenClaw is more likely to **keep one believable persona** across long-running interactions.

## Read and generation principles

To keep initialization from being pulled off-course by irrelevant context, documentation is read **in stages** (progressive disclosure):

1. `SKILL.md` decides whether initialization should run.
2. After the trigger, read `references/protocols/initialization-flow.md`.
3. After the interview, read `references/protocols/drafting-spec.md`.
4. Only while drafting, pull in the template pack, the `PERSONA_PROFILE` structure notes, MBTI assets, and the relevant type references as needed.

That way the model reads only what the current step needs, and avoids loading an old persona, unrelated rules, or noisy docs too early.

## Key documents

- [SKILL.md](./SKILL.md)  
  Skill boundaries, triggers, and allowed write targets.
- [references/protocols/initialization-flow.md](./references/protocols/initialization-flow.md)  
  Initialization interview flow and question order.
- [references/protocols/drafting-spec.md](./references/protocols/drafting-spec.md)  
  Drafting rules, write boundaries, file projection, and freshness audit.
- [references/runtime-context/template-pack.md](./references/runtime-context/template-pack.md)  
  Templates and quality bar for `PERSONA_PROFILE`, `SOUL`, and `MEMORY`.
- [references/runtime-context/persona-profile-consumption-guide.md](./references/runtime-context/persona-profile-consumption-guide.md)  
  Structure of `persona/PERSONA_PROFILE.md` and how downstream code should reference it.
- [docs/persona-skill-design.md](./docs/persona-skill-design.md)  
  Overall architecture and file roles.
- [docs/persona-initialization-evaluation.md](./docs/persona-initialization-evaluation.md)  
  Post-init acceptance checklist and evaluation.

## For maintainers

```bash
npm test
npm run smoke:persona
npm run publish:clawhub
```

Tests cover MBTI lookup, identity-card updates, package layout, and smoke checks after persona initialization.

## Project info

- Repository: [tower1229/Zhuang-Yan](https://github.com/tower1229/Zhuang-Yan)
- Issues: [GitHub Issues](https://github.com/tower1229/Zhuang-Yan/issues)
- Node.js: `>=18.18`
- License: `MIT-0`
