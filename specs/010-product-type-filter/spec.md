# Feature Specification: Product Type Filter

**Feature Branch**: `010-product-type-filter`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "i want a filter on the home page for cards vs. sealed product. i also want it to default to filter by cards"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filter Home Results by Product Type (Priority: P1)

As a collector, I want to filter the home-page catalog between cards and sealed
product so I can focus on the type of inventory I am browsing.

**Why this priority**: Product-type filtering changes the primary browse
experience on the home page, which is the main discovery entry point for the
app.

**Independent Test**: Can be fully tested by opening the home page, switching
the product-type filter between Cards and Sealed Product, and confirming the
visible results update to match the selected type without leaving the page.

**Acceptance Scenarios**:

1. **Given** a user is on the home page, **When** they view the catalog
   controls, **Then** the system shows a product-type filter with Cards and
   Sealed Product as selectable values.
2. **Given** a user is viewing home-page results, **When** they select Cards,
   **Then** the system shows only card results in the visible result set.
3. **Given** a user is viewing home-page results, **When** they select Sealed
   Product, **Then** the system shows only sealed-product results in the
   visible result set.

---

### User Story 2 - Default Home View to Cards (Priority: P1)

As a collector landing on the home page, I want the product-type filter to
default to Cards so I immediately see card results without changing any
controls.

**Why this priority**: The requested default state determines the first
impression of the browse experience and should be consistent every time the
user arrives without an explicit selection.

**Independent Test**: Can be fully tested by opening the home page with no
explicit product-type selection present and confirming Cards is the active
filter and only card results are shown.

**Acceptance Scenarios**:

1. **Given** a user opens the home page with no explicit product-type
   selection, **When** the initial result set loads, **Then** Cards is shown as
   the active filter and only card results appear.
2. **Given** a user returns to the home page through the standard home-page
   entry path, **When** no explicit product-type selection is preserved,
   **Then** the system applies Cards as the default filter again.

---

### User Story 3 - Preserve Search and Sort While Changing Product Type (Priority: P2)

As a collector, I want product-type filtering to work alongside existing browse
controls so I can narrow the result set without losing the rest of my browsing
context.

**Why this priority**: The filter is most useful when it composes cleanly with
existing home-page search and ordering behavior instead of resetting the rest of
the page state.

**Independent Test**: Can be fully tested by applying a search term or sort on
the home page, changing the product-type filter, and confirming the same
search/sort context remains active while the results are constrained to the
selected type.

**Acceptance Scenarios**:

1. **Given** a user has entered a search term on the home page, **When** they
   switch the product-type filter, **Then** the search term remains active and
   the system shows only matching results of the selected product type.
2. **Given** a user has an active home-page sort order, **When** they switch
   the product-type filter, **Then** the system keeps that sort order while
   showing only results of the selected product type.

## Client Parity *(mandatory)*

- **Web Impact**: Add a home-page product-type filter to the main browse
  controls, scoped to Cards and Sealed Product, with Cards selected by default
  when no explicit filter is active.
- **iOS Impact**: Add the same product-type filter and default Cards behavior to
  the native iOS home/browse screen so the initial browse experience matches
  the web app.
- **Shared Backend/API Impact**: Ensure the shared browse contract supports
  product-type filtering for card and sealed-product catalog results so both
  clients request and receive aligned result sets.
- **Parity Expectation**: `web + iOS` in the same increment.
- **Web Console Verification**: Verify the home page in the browser while
  loading the default Cards view and while switching between Cards and Sealed
  Product, with no browser console errors during the supported flow.

### Edge Cases

- One product type has no matching home-page results for the current search or
  browse context.
- A user switches product type after applying a search term or sort order.
- A direct home-page entry does not include an explicit product-type selection.
- A result set contains mixed product types in the underlying catalog and must
  be constrained cleanly to only the selected type.
- The sealed-product catalog is smaller or temporarily empty, but the filter
  must still remain selectable and understandable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-000**: The feature MUST be implemented for both the web application and
  the native iOS application in the same increment unless an approved,
  time-bound exception is documented.
- **FR-001**: The system MUST provide a user-visible product-type filter on the
  home page anywhere the primary catalog result set is browsed.
- **FR-002**: The product-type filter MUST provide exactly two selectable
  values: Cards and Sealed Product.
- **FR-002a**: The user-visible label `Cards` MUST map to the normalized
  product-type request value `card`.
- **FR-003**: The system MUST apply Cards as the default active product-type
  filter on the home page when no explicit product-type selection is present.
- **FR-004**: When Cards is the active product-type filter, the system MUST
  show only card results in the home-page result set.
- **FR-005**: When Sealed Product is the active product-type filter, the system
  MUST show only sealed-product results in the home-page result set.
- **FR-006**: The system MUST make the active product-type selection visible to
  the user.
- **FR-007**: Changing the product-type filter MUST update the current home-page
  result set without requiring navigation away from the home page.
- **FR-008**: Changing the product-type filter MUST preserve the active search
  term and active sort order for the home-page browse session unless the user
  explicitly clears them.
- **FR-009**: When the selected product type has no matching results, the
  system MUST show an empty-state message that makes it clear no results match
  the selected type.

### Key Entities *(include if feature involves data)*

- **Product Type Filter**: A home-page browse control that limits visible
  catalog results to either Cards or Sealed Product and indicates which of the
  two states is currently active.
- **Catalog Result Set**: The collection of home-page browse results after the
  system applies the current product-type selection together with any existing
  search and sort state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tested home-page loads without an explicit product-type
  selection show Cards as the active default state.
- **SC-002**: 100% of tested product-type changes on the home page update the
  visible result set so only items of the selected type remain.
- **SC-003**: 95% of users can identify and switch the home-page product-type
  filter in one interaction or less during usability testing.
- **SC-004**: 100% of tested home-page flows that combine a search term or sort
  order with product-type changes preserve the existing search and sort state.
- **SC-005**: For affected web flows, no browser console errors occur while the
  user loads the default Cards view and switches between Cards and Sealed
  Product.

## Assumptions

- The home page already displays or can display both card and sealed-product
  catalog results through the shared browse experience.
- Cards and Sealed Product are the only product-type values required for this
  increment.
- The user-visible label `Cards` maps to the normalized shared request value
  `card`.
- The requested default applies only when no explicit product-type selection is
  already present in the current home-page state.
- Product-type filtering is limited to the home-page browse experience and does
  not change portfolio behavior in this increment.
