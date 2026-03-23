[中文说明 / Chinese](./README_ZH.md)

# Zhuang-Yan (Persona-Skill)

**Persona-Skill** is an OpenClaw skill for persona initialization.

Its job is singular: after the user triggers it with an explicit initialization request, it collects persona inputs through an interactive one-question-at-a-time flow, then generates and overwrites `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md` so the new persona can shape OpenClaw's future communication style.

---

## Why Install It

- **Turn persona setup into a real onboarding flow**: instead of a one-shot dump of preferences, the skill collects persona signals step by step, making initialization feel guided and intentional.
- **Write directly into OpenClaw's core persona files**: it updates `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`, so the result does not live in a temporary prompt fragment.
- **Build from structured MBTI assets instead of vague roleplay**: persona recommendation uses the repository's deterministic `reverse_lookup` mapping and MBTI references instead of ad hoc guessing.
- **Create long-tail influence on future conversations**: once written, the persona continues to affect tone, boundaries, and relationship feel across later chats.
- **Keep the workflow focused**: the skill is built specifically for persona initialization, so the interaction stays clean and does not drift into unrelated runtime behaviors.

---

## Core Capabilities

1. **Keyword-triggered initialization**: starts only when the user explicitly asks to initialize, rebuild, or reshape the persona.
2. **Progressive information collection**: asks one question at a time to gather the user's MBTI, target persona gender, relationship role, name, preferred address, and important preferences or boundaries.
3. **MBTI-based persona recommendation**: uses `reverse_lookup` from `data/mbti/mbti-index.json` to recommend the best-fit persona type.
4. **Direct four-file write after drafting**: generates `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md`, writes them directly, and then tells the user initialization is complete.

---

## Writing Highlights

- **Second-person `SOUL.md` design**: the persona core is written as high-priority identity guidance rather than loose flavor text.
- **Multi-layer `MEMORY.md` generation**: biography, psychology, relationship dynamics, and behavioral tendencies are written as a coherent long-form background.
- **User-aware `USER.md` constraints**: address style, preferences, and communication boundaries are captured so future replies stay consistent.
- **Stable identity card in `IDENTITY.md`**: name, vibe, creature, emoji, and avatar stay compact and reusable.

---

## Usage

1. Use the project root as the `persona-skill` directory in your OpenClaw workspace.
2. Trigger initialization with an explicit phrase such as `调用 persona 进行初始化`.
3. Answer the guided questions step by step.
4. Once the four-file draft is complete, the skill writes it directly.
5. After the write, the skill reports completion, and the updated `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md` continue to influence future conversations.

The project root is the publishable and testable skill directory.

---

## Documents

- `docs/persona-skill-design.md`: initialization flow, responsibility boundary, and write strategy
- `docs/persona-generation-strategy.md`: generation rules for the four persona files
- `docs/AGENTS.fragment.md`: host-side AGENTS fragment for persona initialization constraints

## Local Testing And Publish

- Skill directory: project root
- Run tests first: `npm run test`
- Mount this directory in an OpenClaw workspace and test the interaction flow directly
- Direct publish command: `clawhub --workdir . publish . --slug persona-skill --name "Persona Skill" --version 0.1.0 --tags latest --changelog "Initial public release"`
- Helper script: `npm run publish:clawhub`
- Publish checklist: `docs/clawhub-publish-checklist.md`
