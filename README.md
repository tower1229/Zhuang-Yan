# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

`persona-skill` initializes or rebuilds an OpenClaw persona through a short interview, then writes the result into the five persona files plus `persona/CANON.md`.

## Install

```bash
clawhub install persona-skill
```

No extra API keys or environment variables are required.

## Use

Trigger it with an explicit initialization request, for example:

- `initialize persona`
- `rebuild persona`
- `run persona initialization`
- `调用 persona 进行初始化`
- `初始化人格`

The skill stays inactive during normal conversation. Once explicitly triggered, it runs a one-question-at-a-time interview and then rewrites:

- `persona/CANON.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

## Architecture

The initialization chain now uses a reduced structure:

1. `SKILL.md`
2. `references/protocols/initialization-flow.md`
3. `references/protocols/drafting-spec.md`
4. `references/runtime-context/template-pack.md`

Data assets stay separate:

- `assets/mbti/mbti-index.json`
- `references/mbti/*.md`

Progressive disclosure is intentional:

1. `SKILL.md` decides whether initialization should start
2. `initialization-flow.md` governs the interview
3. `drafting-spec.md` governs generation and writing
4. `template-pack.md` is read only at drafting time

## What the Skill Optimizes For

- emotional value first through the user's core social need
- `human_mbti -> social_friction_signature -> core_social_need -> ideal_counterparty_presence -> recommended persona_mbti -> pair_core_value -> desired_emotional_impact -> file projection`
- `social_friction_signature`, `core_social_need`, and `ideal_counterparty_presence` now act as the main psychological guidance package
- stable `persona/CANON.md` facts are derived from life stage first; if the age is still below the usual graduation threshold, the persona should default into a student or strongly student-stage context. Only then does persona spec guide the profile, with English-culture name connotations used as a light vibe adjustment inside constrained randomness
- `persona/CANON.md` should function as structured ground truth for both humans and downstream skills, so it should prefer fixed sections, externally visible attributes, and short labeled entries over long personality essays
- runtime persona files kept lean, with `persona/CANON.md` as the full upstream truth source
- rebuilds from scratch instead of lightly patching the old persona

## Documents

- `docs/persona-skill-design.md` — architecture, file boundaries, and dependency order

## Project Metadata

- Repository: `https://github.com/tower1229/Zhuang-Yan`
- Issues: `https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js: `>=18.18`
- License: `MIT-0`
