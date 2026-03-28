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

- emotional value first across all roles
- `human_mbti × role -> pair_core_value / pair_contrast_axis / desired_emotional_impact -> human_need_profile / target_persona_spec -> file projection`
- `pair_contrast_axis` and `desired_emotional_impact` now act as role-specific psychological guidance, not short labels
- runtime persona files kept lean, with `persona/CANON.md` as the full upstream truth source
- rebuilds from scratch instead of lightly patching the old persona

## Documents

- `docs/persona-skill-design.md` — architecture, file boundaries, and dependency order

## Project Metadata

- Repository: `https://github.com/tower1229/Zhuang-Yan`
- Issues: `https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js: `>=18.18`
- License: `MIT-0`
