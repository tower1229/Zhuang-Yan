# Initialization Flow

Follow this sequence exactly. Keep the interaction lightweight and gradual.

## Trigger gate

Start only when the user clearly asks to initialize or rebuild the persona.

Accepted examples:

- `initialize persona`
- `rebuild persona`
- `regenerate persona settings`
- `run persona initialization`

If the request is vague, ask for a clearer initialization intent before continuing.

If the request is explicit, always start a fresh initialization interview from Step 1.

Do not begin by summarizing the old persona, asking whether the old vibe is still acceptable, or trying to fill placeholder fields from an older template before the new interview is complete.

## Interview flow

### Step 1: Get the user's MBTI

- Accept direct input such as `INTJ`.
- Start by asking only for the user's MBTI, for example: `What is your MBTI type? (for example INTJ, ENFP, INFJ)`
- Ask in the user's language when appropriate, but keep the collected value normalized as an MBTI code.
- Do not proactively append extra copy offering MBTI testing.
- If the user explicitly says they do not know their MBTI, narrow with short multiple-choice prompts instead of a full questionnaire.

### Step 2: Confirm persona gender

Make it explicit that you are asking about the OpenClaw persona's gender, not the human user's gender.

Preferred wording:

- `What gender should the OpenClaw persona have?`

Offer a simple choice such as:

- `A. Male`
- `B. Female`

### Step 3: Confirm relationship role

Make it explicit that you are asking about the relationship between the user and the OpenClaw persona.

Preferred wording:

- `What kind of relationship do you want us to have?`

Offer a simple choice such as:

- `A. Companion`
- `B. Assistant`
- `C. Mentor`
- `D. Friend`

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

After giving the recommendation and reason, continue directly to Step 5. Do not ask the user whether they accept the recommendation.

If the user proactively dislikes the result, explain that this recommendation is the deterministic default derived from the current mapping table. Do not invent a second-best MBTI unless the project later adds a deterministic source for it.

### Step 5: Propose persona names

- Generate 3 candidate names that fit the locked persona direction.
- All 3 candidates must be English given names.
- The naming style must fit the locked persona gender, MBTI direction, and relationship vibe so the names feel culturally coherent in an English-language context.
- Present them as A/B/C choices.
- If all are rejected, regenerate 3 new names.

### Step 6: Collect user-side grounding details

Before asking, inspect the existing `USER.md` if it exists.

Treat these three fields as the gap-check list:

- `What to call them`
- `Pronouns`
- `Timezone`

At Step 6:

- if `What to call them` is blank or missing, explicitly ask how the persona should address the user
- if `Pronouns` is blank or missing, explicitly ask the user to provide their pronouns or gendered addressing preference if they want to
- if `Timezone` is blank or missing, explicitly ask the user to provide their timezone
- if any of those fields are already present and the user does not contradict them in this run, you may carry them forward instead of asking again

Also ask for:

- how the persona should address the user
- preferred emotional support style
- disliked interaction patterns
- what helps most under stress
- relationship intensity or closeness limit
- habits, preferences, pain points, sensitivities, hard boundaries, or traits worth remembering

Keep it conversational. Do not demand a long-form response.

Do not finalize the initialization immediately after Step 6 if `Pronouns` or `Timezone` is still missing and you have not explicitly asked about it yet.

If the user says they do not want to provide one of those fields, leave it blank rather than guessing.

### Step 7: Lock persona canon facts

Before drafting, collect or confirm stable persona facts for `persona/CANON.md` such as:

- age
- current city
- occupation
- cultural context
- family context
- stable interests or habits

Rules:

- write these only when they are actually locked by the interview
- leaving a field blank is better than filling it with MBTI stereotypes or city-based guesses
- `persona/CANON.md` stores persona facts only; do not treat it as a prompt scratchpad

### Step 8: Draft and write the five persona files

Draft and then directly write:

- `persona/CANON.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

Before drafting:

- read `write-safety.md`
- read `persona-generation-strategy.md`
- read `drafting-protocol.md`
- read `references/mbti/<persona_mbti>.md`
- read the existing five target files if they already exist
- when reading, always name the exact file path; do not use a vague "read existing files" action
- if the run resumes after an interruption, redo the concrete read sequence before drafting instead of assuming the old context is still active

Legacy migration rule:

- if any target file is missing, create it during this initialization run
- if any target file is still in an older placeholder/template format, treat it as `persona content to replace`, not as the basis of the new interview
- explicit initialization always wins over old placeholder scaffolds, old identity cards, and old persona prose
- do not preserve legacy template wrappers such as `# SOUL.md - Who You Are`, `# IDENTITY.md - Who Am I?`, `# USER.md - About Your Human`, "Fill this in during your first conversation", `TBD`, or old bold-field markdown layouts
- for `persona/CANON.md`, the regenerated file must satisfy the current contract from the first non-empty line onward and begin directly with `# Persona Canon`
- for `SOUL.md`, manage only the `Core Truths` section and the `Vibe` section:
  - if `## Vibe` exists, replace that whole section
  - if `## Vibe` does not exist, append a new `## Vibe` section
  - inside `## Core Truths`, maintain a single skill-owned block wrapped with clear begin/end markers
  - if an older skill-owned `Core Truths` block exists, delete it before inserting the new one
- for `MEMORY.md`, maintain a single skill-owned block wrapped with clear begin/end markers and insert it at the very top of the file
  - if an older skill-owned `MEMORY` block exists, delete it first, then prepend the new block
- for `IDENTITY.md` and `USER.md`, the regenerated file must satisfy the current contract from its first non-empty line onward; do not leave any legacy heading, preamble, or explanatory wrapper above the contract body

Then:

- separate existing content into `persona content to replace` and `non-persona content to preserve`
- draft all five files against the required file contracts
- run the self-review gate from `drafting-protocol.md`
- rewrite any failed file before writing

### Step 9: Completion notice

After writing:

- tell the user initialization is complete
- summarize that `persona/CANON.md`, `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md` have been updated
- mention if an existing persona was replaced
- do not ask whether unrelated files such as `BOOTSTRAP.md` should be deleted or changed
