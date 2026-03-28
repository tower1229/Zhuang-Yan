import test from "node:test";
import assert from "node:assert/strict";

import { patchIdentityCard } from "../scripts/identity-card.mjs";

test("patchIdentityCard updates the five identity card fields while preserving extra content", () => {
  const existing = `- Name: Old
- Creature: old creature
- Vibe: old vibe
- Emoji: 🙂
- Avatar: /avatars/old.png

## Manual Notes

- Keep this custom note.
`;

  const patched = patchIdentityCard(existing, {
    name: "Iris",
    creature: "warm current",
    vibe: "bright and steady",
    emoji: "🌤️",
    avatar: "/avatars/iris.png",
  });

  assert.match(patched, /^- Name: Iris$/m);
  assert.match(patched, /^- Creature: warm current$/m);
  assert.match(patched, /^- Vibe: bright and steady$/m);
  assert.match(patched, /^- Emoji: 🌤️$/m);
  assert.match(patched, /^- Avatar: \/avatars\/iris\.png$/m);
  assert.match(patched, /^## Manual Notes$/m);
  assert.match(patched, /Keep this custom note\./);
});

test("patchIdentityCard fills in missing card lines without deleting the rest of the file", () => {
  const existing = `- Name: Old
- Vibe: old vibe

Custom footer
`;

  const patched = patchIdentityCard(existing, {
    name: "Nova",
    creature: "night spark",
    vibe: "calm and bright",
    emoji: "✨",
    avatar: "/avatars/nova.png",
  });

  const nonEmptyLines = patched
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  assert.equal(nonEmptyLines[0], "- Name: Nova");
  assert.equal(nonEmptyLines[1], "- Creature: night spark");
  assert.equal(nonEmptyLines[2], "- Vibe: calm and bright");
  assert.equal(nonEmptyLines[3], "- Emoji: ✨");
  assert.equal(nonEmptyLines[4], "- Avatar: /avatars/nova.png");
  assert.match(patched, /Custom footer/);
});
