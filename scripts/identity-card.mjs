const CARD_FIELDS = [
  ["name", "- Name:"],
  ["creature", "- Creature:"],
  ["vibe", "- Vibe:"],
  ["emoji", "- Emoji:"],
  ["avatar", "- Avatar:"],
];

function isCardLine(line) {
  return CARD_FIELDS.some(([, prefix]) => line.startsWith(prefix));
}

export function patchIdentityCard(existingContent, nextFields) {
  const lines = existingContent.split(/\r?\n/);
  const canonicalCard = CARD_FIELDS.map(([key, prefix]) => `${prefix} ${nextFields[key] ?? ""}`.trimEnd());

  let insertAt = 0;
  let foundExistingCard = false;
  const remainingLines = [];

  for (const line of lines) {
    if (isCardLine(line)) {
      if (!foundExistingCard) {
        insertAt = remainingLines.length;
        foundExistingCard = true;
      }
      continue;
    }
    remainingLines.push(line);
  }

  const resultLines = foundExistingCard
    ? [...remainingLines.slice(0, insertAt), ...canonicalCard, ...remainingLines.slice(insertAt)]
    : [...canonicalCard, ...remainingLines];

  return resultLines.join("\n").replace(/\n+$/u, "\n");
}
