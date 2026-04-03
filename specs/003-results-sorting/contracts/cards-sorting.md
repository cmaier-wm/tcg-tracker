# Cards Sorting Contract

## Purpose

Define the expected user-facing and route-level behavior for sortable card
results in the browse experience.

## Routes

- `GET /`
- `GET /cards`
- `GET /api/cards`

## Query Parameters

### `sort`

Supported values:
- `price-asc`
- `price-desc`
- `name-desc`
- `name-asc`
- `number-asc`
- `number-desc`
- `set-asc`
- `set-desc`
- `rarity-asc`
- `rarity-desc`

Behavior:
- When omitted on `/`, the app behaves as if `sort=price-desc`.
- When omitted on `/cards`, the app also normalizes to the default supported
  sort so subsequent infinite-scroll requests remain consistent.
- When an unsupported value is supplied, the system falls back to the default
  supported sort.

Other existing query parameters remain supported:
- `q`
- `set`
- `offset`
- `limit`

## UI Expectations

- The browse filters surface exposes a visible sort control.
- The active sort selection is reflected in the control state.
- Changing sort preserves the current search term and set filter.
- Infinite-scroll fetches send the same `sort` value as the currently visible
  browse state.

## Ordering Rules

- `price-desc` orders priced cards from highest price to lowest price.
- `price-asc` orders priced cards from lowest price to highest price.
- All price sorts place cards without a known price after priced cards.
- `name-asc` and `name-desc` order cards alphabetically by visible card name.
- `number-asc` and `number-desc` order cards by collector number using a
  numeric-aware comparison for mixed text/number values.
- `set-asc` and `set-desc` order cards by visible set name.
- `rarity-asc` and `rarity-desc` order cards by the app's normalized rarity
  rank with deterministic fallback for unknown rarity labels.
- When multiple cards share the same primary sort value, the result order
  remains deterministic through stable secondary fields.

## Acceptance Notes

- Loading `/` with no explicit sort shows highest-priced visible cards first.
- Loading more results through `/api/cards` continues the same ordering rule
  without reordering already visible cards.
- Mixed priced/unpriced result sets keep unpriced cards grouped after priced
  cards while still rendering the full result list.
