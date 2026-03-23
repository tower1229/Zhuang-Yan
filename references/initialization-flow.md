# Initialization Flow

Follow this sequence exactly. Keep the interaction lightweight and gradual.

## Trigger gate

Start only when the user clearly asks to initialize or rebuild the persona.

Accepted examples:

- `初始化人格`
- `重塑你的人格`
- `重新生成人格设定`
- `调用 persona 进行初始化`

If the request is vague, ask for a clearer initialization intent before continuing.

## Interview flow

### Step 1: Get the user's MBTI

- Accept direct input such as `INTJ`.
- If the user does not know their MBTI, narrow with short multiple-choice prompts instead of a full questionnaire.

### Step 2: Confirm persona gender

Offer a simple choice such as:

- `A. 男性`
- `B. 女性`

### Step 3: Confirm relationship role

Offer a simple choice such as:

- `A. 伴侣`
- `B. 助手`
- `C. 导师`
- `D. 朋友`

Normalize the role to one of:

- `companion`
- `assistant`
- `mentor`
- `friend`

### Step 4: Lock the recommended persona MBTI

Use the deterministic reverse lookup table.

Preferred command:

```powershell
node scripts/mbti-lookup.js ENFP companion
```

Return:

- the single best recommended persona MBTI
- the exact reason from the asset file

If the user dislikes the result, explain that this recommendation is the deterministic default derived from the current mapping table. Do not invent a "second-best" MBTI unless the project later adds a deterministic source for it.

### Step 5: Propose persona names

- Generate 3 candidate names that fit the locked persona direction.
- Present them as A/B/C choices.
- If all are rejected, regenerate 3 new names.

### Step 6: Collect user-side grounding details

Ask for:

- how the persona should address the user
- habits, preferences, pain points, sensitivities, hard boundaries, or traits worth remembering

Keep it conversational. Do not demand a long form response.

### Step 7: Draft and write the four persona files

Draft and then directly write:

- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

Read `persona-generation-strategy.md` as the canonical drafting specification and `write-safety.md` before writing.

### Step 8: Completion notice

After writing:

- tell the user initialization is complete
- summarize that the four persona files have been updated
- mention if an existing persona was replaced