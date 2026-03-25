# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

Give your OpenClaw a persona that actually fits — shaped by MBTI, defined by relationship role, and written directly into its core files.

## Installation

```bash
clawhub install persona-skill
```

No API keys or environment variables required. The skill runs entirely with tools already available in OpenClaw (`Read`, `Write`, `Bash(node:*)`).

## How to Use

Once installed, trigger initialization with an explicit phrase. Any language works — what matters is a clear intent to initialize:

- `initialize persona`
- `rebuild the persona`
- `reset persona from scratch`
- `调用 persona 进行初始化`
- `初始化人格`

The skill will guide you through a short one-question-at-a-time interview, then write the result directly into OpenClaw's persona files.

The skill only starts on an explicit initialization request — normal conversations are not affected.

## What Happens During Initialization

The interview collects five things:

1. **Your MBTI** — used to find a compatible or complementary persona direction
2. **Persona gender** — male or female
3. **Relationship role** — choose one:
   - `companion` — warmth, emotional resonance, sense of safety
   - `assistant` — execution support, clear communication, reliability
   - `mentor` — challenge, growth, pushback on blind spots
   - `friend` — low-pressure companionship, casual and easy-going
4. **Persona name** — pick from three generated candidates or request more
5. **Your preferences** — how you want to be addressed, habits, boundaries, communication needs

After the interview, the skill generates and writes four core persona files:

| File | Content |
|------|---------|
| `SOUL.md` | Personality core, values, tone constraints, interaction principles |
| `MEMORY.md` | Character biography, relationship background, long-term behavioral context |
| `IDENTITY.md` | Name, identity, vibe, avatar references |
| `USER.md` | How you want to be addressed, known preferences, communication no-go zones |

These files take effect immediately and persist across all future conversations.

## Why It Works Better Than a Prompt

- **MBTI-guided, not guesswork**: the skill uses a deterministic reverse-lookup table to find the best-fit persona for your type, rather than letting the model improvise.
- **Structured writing strategy**: each file is written with a specific role in mind. `SOUL.md` is written as high-priority identity injection; `MEMORY.md` builds a coherent character with psychology, behavioral patterns, and emotional context — not a flat sketch.
- **Persistent, not temporary**: the result is written into OpenClaw's core files. It keeps shaping tone, relationship feel, and communication style in every future session.
- **Re-initialization supported**: run the same command again to rebuild the persona from scratch. The skill will warn you before overwriting an existing one.

## Documents

- `docs/persona-skill-design.md` — initialization flow, responsibility boundaries, and write strategy
- `docs/persona-generation-strategy.md` — canonical generation rules for the four persona files

## Project Metadata

- Repository: `https://github.com/tower1229/Zhuang-Yan`
- Issues: `https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js: `>=18.18`
- License: `MIT-0`
