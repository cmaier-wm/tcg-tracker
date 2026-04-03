export function tokenizeSearchQuery(query?: string | null) {
  return (
    query
      ?.trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean) ?? []
  );
}

export function matchesSearchTokens(
  values: Array<string | null | undefined>,
  tokens: string[]
) {
  return tokens.every((token) =>
    values.some((value) => value?.toLowerCase().includes(token))
  );
}
