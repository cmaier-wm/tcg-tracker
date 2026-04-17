const codeCardPrefixPattern = /^code card\b/i;

type CodeCardCandidate = {
  name?: string | null;
  cleanName?: string | null;
  rarity?: string | null;
};

export function isCodeCard(candidate: CodeCardCandidate) {
  const normalizedRarity = candidate.rarity?.trim().toLowerCase();

  if (normalizedRarity === "code card") {
    return true;
  }

  return [candidate.name, candidate.cleanName].some((value) =>
    codeCardPrefixPattern.test(value?.trim() ?? "")
  );
}
