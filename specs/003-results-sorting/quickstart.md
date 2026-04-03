# Quickstart: Results Sorting

## Goal

Verify users can sort browse results, see highest-priced cards first by default,
and get stable ordering for mixed priced/unpriced result sets across every
supported field and direction.

## Manual Verification

1. Start the app with `npm run dev`.
2. Open `/` with no query parameters.
3. Confirm the browse page shows a sort control and that the visible default
   ordering is highest price first.
4. Change the sort option through each documented field and direction:
   `price-asc`, `price-desc`, `name-asc`, `name-desc`, `number-asc`,
   `number-desc`, `set-asc`, `set-desc`, `rarity-asc`, and `rarity-desc`.
5. Confirm the same search term and set filter values remain in place each
   time and the result order changes without clearing filters.
6. Scroll until `/api/cards` loads more items.
7. Confirm newly loaded items continue the same selected sort order.
8. Search for a term that returns a mix of priced and unpriced cards.
9. Confirm priced cards appear before unpriced cards for both `price-desc` and
   `price-asc`.
10. Open `/cards` directly with an explicit `sort` query parameter and confirm
    the selected sort is visible and applied.
11. Open `/cards?sort=invalid-option` and confirm the selected sort falls back
    to `price-desc`.

## Automated Verification

Run the targeted suites after implementation:

```bash
npm run test:unit -- tests/unit/search-query.test.ts
npm run test:integration -- tests/integration/cards-browse.test.tsx tests/contract/cards-search.contract.test.ts
npm run test:e2e
```

## Expected Outcomes

- Users can select and see the active sort order.
- Users can sort by price, name, collector number, set, and rarity in both
  ascending and descending directions.
- The home page defaults to highest price first when no explicit sort is set.
- Infinite-scroll requests preserve the same sort order as the current browse
  state.
- Price sorting keeps unpriced cards after priced cards and remains stable for
  ties.
