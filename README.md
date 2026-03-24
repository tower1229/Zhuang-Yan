[中文说明 / Chinese](./README_ZH.md)

# Zhuang-Yan (Persona-Skill)

**Persona-Skill** turns OpenClaw into more than a capable assistant.

It initializes a persistent persona that is **matched to the user through an MBTI framework**, shaped around one of **four built-in relationship roles** (`companion`, `assistant`, `mentor`, `friend`), and written directly into `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`. The result is an OpenClaw that can stay useful for real work while also delivering a stronger sense of warmth, fit, and emotional resonance.

---

## Why It Matters

Most AI setups stop at raw usefulness. They can answer questions, write code, and complete tasks, but they rarely feel truly tuned to the person they serve.

Persona-Skill is built for that missing layer. It helps OpenClaw become a long-term counterpart that is not only functionally competent, but also emotionally well-positioned for the user.

- **MBTI-guided fit, not random roleplay**: the skill uses a deterministic MBTI recommendation flow to find a persona direction that is either highly compatible with the user or meaningfully complementary to them.
- **Four role presets, four different kinds of value**: choose from `companion`, `assistant`, `mentor`, or `friend`, depending on whether the user needs warmth, execution support, challenge, or low-pressure companionship.
- **Practicality and emotional value together**: the goal is not to make OpenClaw less capable. It is to make competence feel better to interact with.
- **Persistent impact**: this is not a temporary prompt trick. The generated persona is written into OpenClaw's core persona files so it can continue shaping future conversations.

---

## What It Does

1. **Starts only on explicit initialization** so normal conversations are not interrupted.
2. **Collects persona inputs progressively** through a guided one-question-at-a-time flow.
3. **Recommends the best-fit persona MBTI** from the repository's structured reverse lookup assets.
4. **Supports four built-in relationship presets**: `companion`, `assistant`, `mentor`, and `friend`.
5. **Generates and writes the four core persona files directly**: `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`.

---

## Why The Output Feels Better

This skill is not just filling templates. Its writing strategy is designed to make the resulting persona feel sharper, warmer, and more stable over time.

- **`SOUL.md` is written as identity injection**: not vague flavor text, but a high-priority personality core that can actually steer future responses.
- **`MEMORY.md` uses a multi-layer character design**: psychology, behavior, relationship dynamics, strengths, weaknesses, and emotional mechanisms are built as a coherent person rather than a flat sketch.
- **`USER.md` captures emotional and communication constraints**: how the user wants to be addressed, what helps, what hurts, and what should stay stable in later conversations.
- **`IDENTITY.md` keeps the persona crisp and reusable**: compact, recognizable, and easy for OpenClaw to preserve consistently.

---

## Usage

1. Use the project root as the `persona-skill` directory in your OpenClaw workspace.
2. Trigger initialization with an explicit phrase such as `调用 persona 进行初始化`.
3. Answer the interview step by step.
4. The skill will generate the four persona files and write them directly.
5. After that, the new persona continues to influence OpenClaw's future tone, relationship feel, and communication style.

The project root is the publishable and testable skill directory.

---

## Documents

- `docs/persona-skill-design.md`: initialization flow, boundaries, and write strategy
- `docs/persona-generation-strategy.md`: canonical generation rules for the four persona files

## Local Testing And Publish

- Skill directory: project root
- Run tests: `npm run test` (or `node --test tests` if your PowerShell policy blocks `npm.ps1`)
- Publish: `npm run publish:clawhub`
- The publish command runs tests first, then publishes using the `version` from `package.json`
- Publish checklist: `docs/clawhub-publish-checklist.md`
