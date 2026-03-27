# Zhuang-Yan (persona-skill) — [中文说明](./README_ZH.md)

Give your OpenClaw a persona that actually fits — shaped by MBTI, expressed through relationship role, optimized for emotional value, compressed into runtime persona files, and backed by a complete persona canon.

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

The skill will guide you through a short one-question-at-a-time interview, then write the result into OpenClaw's runtime persona files and `persona/CANON.md`.

The skill only starts on an explicit initialization request — normal conversations are not affected.

During drafting, the skill reads both the human MBTI asset and the recommended persona MBTI asset, derives a role-conditioned need profile, builds an internal execution trigger protocol, calibrates against high-quality file templates, preserves only non-persona operational fragments when needed, and rewrites failed drafts before writing.

## What Happens During Initialization

The interview collects:

1. **Your MBTI** — used to lock a starting persona scaffold
2. **Persona gender** — male or female
3. **Relationship role** — choose one:
   - `companion` — intimacy first, then emotional holding, brightness, and active closeness
   - `assistant` — emotionally valuable execution support, clarity, and reliable help
   - `mentor` — challenge, growth leverage, and emotionally grounded pushback
   - `friend` — low-pressure companionship, shared rhythm, and easy access to warmth
4. **Persona name** — pick from three English-name candidates or request more
5. **User-side grounding** — how you want to be addressed, preferred support style, disliked interaction pattern, and what helps most under stress
6. **Locked persona age** — the one explicit canon fact collected before drafting

The rest of the canon is not filled by a long questionnaire. The skill infers the target persona from:

- your `human_mbti`
- the recommended `persona_mbti`
- the selected `role`
- the user-side need profile
- an internal `Execution Trigger Protocol` used to turn weakness, friction, and failure modes into proactive support behavior
- high-quality templates that teach the model what strong `SOUL`, `MEMORY`, and `CANON` writing looks like

After the interview, the skill generates and writes four runtime persona files plus one canon file:

| File | Content |
|------|---------|
| `SOUL.md` | Runtime interaction core: tone constraints, support defaults, anti-patterns |
| `MEMORY.md` | Long-term relationship memory: validated patterns and stable shared context |
| `IDENTITY.md` | Name, identity, vibe, avatar references |
| `USER.md` | How you want to be addressed, known preferences, communication no-go zones |
| `persona/CANON.md` | The complete persona bible for stable character facts and downstream consumers |

The runtime files take effect immediately in future conversations. `persona/CANON.md` stays as the upstream truth source for the persona's stable facts.

## Why It Works Better Than a Prompt

- **Human-need-first, not just MBTI matching**: the reverse lookup locks a persona skeleton, but the real generation path is `human_mbti + role -> need profile -> target persona spec -> files`.
- **Emotional value stays first across roles**: every role is still a care role. `companion` especially prioritizes felt intimacy rather than generic support or abstract safety.
- **Template-calibrated, not average-model prose**: the skill reads high-quality `SOUL`, `MEMORY`, and `CANON` templates so the model learns what "good" looks like before it writes.
- **Runtime-vs-canon separation**: the prompt-facing files stay lean, while `persona/CANON.md` stores the complete persona bible for richer downstream memory and timeline work.
- **Persistent, not temporary**: the result is written into OpenClaw's core files. It keeps shaping tone, relationship feel, and communication style in every future session.
- **Re-initialization supported**: run the same command again to rebuild the persona from scratch. The skill will warn you before overwriting an existing one.

## Documents

- `docs/persona-skill-design.md` — initialization flow, responsibility boundaries, and write strategy
- `docs/persona-generation-strategy.md` — canonical generation rules for the runtime files and `persona/CANON.md`

## Project Metadata

- Repository: `https://github.com/tower1229/Zhuang-Yan`
- Issues: `https://github.com/tower1229/Zhuang-Yan/issues`
- Node.js: `>=18.18`
- License: `MIT-0`
