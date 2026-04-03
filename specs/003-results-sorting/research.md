# Research: Results Sorting

## Sort State Transport

Decision: Carry the active sort selection in the browse query string and pass it
through both server-rendered page loads and `/api/cards` infinite-scroll
requests.

Rationale: The current browse experience already uses query-string state for
search and set filters. Reusing the URL keeps sorting visible, shareable, and
stable across page reloads and scroll fetches without introducing client-only
state that could drift from the server-rendered first page.

Alternatives considered:
- Client-only sort state. Rejected because the first page and later scroll pages
  could disagree on ordering.
- Cookie or local-storage persistence. Rejected because the spec only requires
  view-level persistence, not cross-session preference storage.

## Initial Sort Options

Decision: Support bidirectional sorting for `price`, `name`, `number`, `set`,
and `rarity`, yielding ten supported sort values.

Rationale: The expanded scope explicitly asks for number, set, and rarity in
addition to the existing result-order request, and it requires every supported
field to allow both ascending and descending order. Keeping all sort values in
one normalized list makes URL handling, UI labels, and tests deterministic.

Alternatives considered:
- Shipping only `price` plus one alternate field. Rejected because it no longer
  matches the requested scope.
- Splitting field and direction into separate query parameters. Rejected
  because a single normalized `sort` value is easier to preserve across page
  loads and infinite-scroll requests.

## Price Sorting Strategy

Decision: Normalize card list items first, then apply a shared application-layer
sort that can order by current price and stable tie-breakers before offset/limit
slicing.

Rationale: Current price is derived from the preferred variation after catalog
records are loaded. A shared post-mapping sorter keeps database and demo-store
results consistent and ensures pagination reflects the selected order instead of
sorting only within already-sliced pages.

Alternatives considered:
- Database-only ordering on joined snapshot data. Rejected because it adds query
  complexity and still leaves the demo fallback with separate behavior.
- Sorting after pagination. Rejected because it would only sort within each page
  rather than the whole result set, breaking infinite-scroll consistency.

## Missing Price Handling

Decision: When price sorting is active, place cards with a known `currentPrice`
before cards without one for both directions, then use `name`, `setName`, and
`id` as stable secondary tie-breakers. For number, set, and rarity sorting,
cards missing the primary field sort after cards with a value.

Rationale: This directly satisfies the spec’s missing-price requirement and
gives deterministic output for duplicate prices or fully unpriced result sets.
The chosen tie-breakers are already available on `CardListItem`, so no schema
changes are needed.

Alternatives considered:
- Treat missing prices as zero during sorting. Rejected because it obscures the
  distinction between genuinely low-priced and unpriced cards.
- Leave equal-price or unpriced items in implicit database order. Rejected
  because it does not guarantee predictable output.

## Non-Price Sort Ordering

Decision: Use natural string comparison for `name`, `set`, and collector
`number`, and use a domain-specific rarity rank map with alphabetical fallback
for `rarity`.

Rationale: Name, set, and number sorting should behave like users expect from
visible labels, including numeric-aware collector number ordering. Rarity needs
more than plain alphabetical order to feel meaningful, so a rank map provides a
better collector-facing default while still remaining deterministic for unknown
labels.

Alternatives considered:
- Alphabetical rarity sorting. Rejected because it produces unintuitive
  collector order for common rarity labels.
- Parsing collector numbers as plain integers only. Rejected because many card
  numbers contain letters or set prefixes.

## Verification Scope

Decision: Add unit coverage for sort parsing/ordering helpers, contract coverage
for catalog query handling, integration coverage for visible sort controls and
default order, and retain Playwright for manual follow-through if needed.

Rationale: Sorting spans UI, server query handling, and fallback logic.
Layered verification catches regressions without requiring a full browser suite
for every ordering rule.

Alternatives considered:
- Manual-only verification. Rejected because ordering regressions are easy to
  miss and inexpensive to automate.
