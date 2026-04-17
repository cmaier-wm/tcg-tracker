# Research: Product Type Filter

## Decision 1: Add an explicit `productType` browse parameter with `card` as the default

- **Decision**: Represent the new filter as a first-class browse parameter with
  two values: `card` and `sealed-product`. Default to `card` whenever the home
  page or iOS browse screen loads without an explicit selection.
- **Rationale**: The requested behavior is a browse-state concern, not a stored
  user preference. Putting it in shared request state lets web and iOS stay in
  sync, keeps the default deterministic, and allows the existing search and sort
  controls to compose with the new filter.
- **Alternatives considered**:
  - Persist the last selected product type per user: rejected because the spec
    asks for a default, not preference storage.
  - Reuse `category` for cards vs sealed products: rejected because `category`
    currently identifies franchises like Pokémon rather than inventory form.

## Decision 2: Extend the existing `/api/cards` browse contract instead of creating a new endpoint

- **Decision**: Keep the existing `/api/cards` route and catalog access path for
  this increment, and add an optional `productType` query parameter to it.
- **Rationale**: Both the home-page infinite list and the iOS browse store
  already depend on this route. Extending the current contract is smaller and
  less risky than introducing a parallel `/api/catalog` endpoint and migrating
  all consumers in the same change.
- **Alternatives considered**:
  - Create a new `/api/catalog` endpoint: rejected because it broadens the
    migration surface without adding user value for this feature.
  - Filter only on the client after fetching mixed results: rejected because it
    would break pagination correctness and diverge web/iOS behavior.

## Decision 3: Broaden the list-item contract to a catalog item model while keeping card detail card-only

- **Decision**: Add `productType` metadata to the shared browse response items
  and tolerate optional card-only fields for sealed rows. Keep card detail and
  history endpoints unchanged and card-only.
- **Rationale**: The new filter changes what appears in the list, but the spec
  does not ask for a sealed-product detail flow. Broadening only the list
  contract keeps implementation focused on the requested home-page behavior.
- **Alternatives considered**:
  - Add a full sealed-product detail experience now: rejected because it exceeds
    the requested scope.
  - Force sealed rows into the existing card-detail route: rejected because it
    would create a misleading contract and undefined behavior.

## Decision 4: Keep the new control scoped to the home page

- **Decision**: Show the product-type filter on `/` and keep `/cards` behaving
  as the existing card-specific browse surface unless a later spec broadens it.
- **Rationale**: The user requested a home-page filter. The current component
  structure supports adding the control via props without changing every browse
  entry point.
- **Alternatives considered**:
  - Enable the product-type filter on every browse route immediately: rejected
    because it expands scope and increases regression risk.

## Decision 5: Verify the feature with layered automated coverage plus UI smoke checks

- **Decision**: Cover normalization and filter composition in TypeScript tests,
  contract changes in API tests, web behavior and console cleanliness in
  Playwright, and iOS state changes in Swift XCTest plus simulator smoke checks.
- **Rationale**: The feature changes shared browse state across two clients, so
  verification needs to exercise shared query behavior and both UIs.
- **Alternatives considered**:
  - Rely on manual verification only: rejected because regressions in filter
    composition and response shape are easy to miss without automated checks.
