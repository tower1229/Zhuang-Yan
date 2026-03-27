# Write Safety

Follow these rules every time this skill reaches the drafting or writing stage.

## Allowed write scope

You may write only:

- `persona/CANON.md`
- `SOUL.md`
- `MEMORY.md`
- `IDENTITY.md`
- `USER.md`

Do not edit:

- `AGENTS.md`
- other skill folders
- plugin files
- configuration files outside the five persona assets

## Required pre-write checks

Before writing:

1. Read the existing target files if they already exist. Name the concrete file path for each read. Never issue an empty `Read` call or a vague action like "read existing files".
2. Detect whether a prior persona already exists.
3. Be aware that this is a reinitialization if existing persona content will be replaced.
4. Preserve non-persona operational content that must remain in those files.
5. Write the finalized five-file draft directly once it is ready.
6. If preserved content and regenerated persona content conflict, keep the preserved fragment only when it is truly non-persona and operationally required.
7. Do not allow preserved content to replace the required persona structure defined by the drafting protocol.
8. For `SOUL.md` and `MEMORY.md`, update only the skill-owned sections or blocks defined by the drafting protocol rather than assuming full-file ownership.
9. For `IDENTITY.md`, `USER.md`, and `persona/CANON.md`, regenerate the whole file against the current contract.

## Completion rule

After writing:

- explicitly tell the user that initialization is complete
- state that `persona/CANON.md`, `SOUL.md`, `MEMORY.md`, `IDENTITY.md`, and `USER.md` were updated
- mention whether an older persona was replaced

## Preservation rule

Preserve content only when it is operationally necessary and not part of the persona itself, for example:

- stable macros
- harmless operational notes
- required non-persona configuration fragments already living in one of the five files

If a section is part of the old persona identity, replace it with the new draft.

If preserved content is freeform and relocation is safe, place it in a clearly separated appendix section after the regenerated persona content.
