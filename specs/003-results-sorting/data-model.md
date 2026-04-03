# Data Model: Results Sorting

## Entities

### SortOption

Represents a user-selectable ordering rule for card browse results.

Fields:
- `field`: one of `price`, `name`, `number`, `set`, or `rarity`
- `direction`: one of `asc` or `desc`
- `value`: stable query-string identifier such as `price-desc` or `rarity-asc`
- `label`: user-facing display text for the control
- `defaultOnHome`: whether this option is the implicit default on `/`

Relationships:
- Selected by the browse UI
- Applied to a `CatalogQueryState`

Validation rules:
- `field` must be one of the supported browse sort fields
- `direction` must be either ascending or descending
- `value` must be one of the supported sort identifiers
- Exactly one option is treated as the default when no explicit sort is present

### CatalogQueryState

Represents the complete browse request state used to fetch and order card
results.

Fields:
- `q`: optional search term
- `category`: category slug, currently fixed to `pokemon` in the user-facing
  browse flows
- `set`: optional set slug filter
- `sort`: active sort option identifier
- `offset`: current infinite-scroll offset
- `limit`: requested page size

Relationships:
- Produced by page search params and `/api/cards` query params
- Consumed by `getCardCatalog`

Validation rules:
- `sort` must normalize invalid or missing values to the default supported
  option
- `offset` must be zero or greater
- `limit` must be at least one

### SortedCardResult

Represents a normalized browse item after sort-relevant values have been mapped.

Fields:
- `id`
- `name`
- `setName`
- `collectorNumber`
- `rarity`
- `currentPrice`
- `category`
- `variationCount`

Relationships:
- Derived from database cards or demo cards via the existing mapping layer
- Ordered according to the selected `SortOption`

Validation rules:
- `currentPrice`, `collectorNumber`, and `rarity` may be absent
- Sort tie-breakers must remain deterministic for identical visible values

State transitions:
- Raw catalog source item -> normalized card list item -> sorted result slice

## Notes

- No schema changes are required for this feature.
- The sorting model is intentionally limited to browse result ordering and does
  not apply to portfolio or price-history data.
