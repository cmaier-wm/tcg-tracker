# Feature Specification: Results Sorting

**Feature Branch**: `003-results-sorting`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "Add sorting to the results page. The default on the home page should be to sort by price from high to low"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Change Result Order (Priority: P1)

As a collector, I want to sort card results by different orders so I can scan
the catalog in the order that best matches what I am looking for.

**Why this priority**: Result ordering directly affects whether users can find
expensive, cheap, or alphabetically grouped cards without manually scanning a
long list.

**Independent Test**: Can be fully tested by opening the browse view, changing
the sort option, and confirming the same set of cards appears in the selected
order without changing the current filters.

**Acceptance Scenarios**:

1. **Given** a user is viewing card results, **When** they open the sorting
   control, **Then** the system shows the available sort options in a way the
   user can select.
2. **Given** a user is viewing filtered or searched results, **When** they
   select a different sort order, **Then** the system reorders the existing
   result set without clearing the active search or filters.
3. **Given** multiple cards in the result set share the same value for the
   selected sort field, **When** the system renders the reordered list,
   **Then** the order remains stable and predictable for those ties.

---

### User Story 2 - See Highest-Value Cards First on Home (Priority: P1)

As a collector landing on the home page, I want the default result order to
show the highest-priced cards first so I immediately see the most valuable
cards in the visible list.

**Why this priority**: The home page is the default entry point, and the user
explicitly wants value-first ordering there.

**Independent Test**: Can be fully tested by opening the home page with no sort
selection applied and confirming the visible results are ordered from highest
price to lowest price.

**Acceptance Scenarios**:

1. **Given** a user opens the home page with no explicit sort selection,
   **When** the first page of results loads, **Then** cards with prices appear
   before lower-priced cards in descending price order.
2. **Given** a user returns to the home page through the home-page entry path,
   **When** no explicit sort selection is present, **Then** the default sort is
   applied again as highest price to lowest price.

---

### User Story 3 - Handle Missing Prices During Sorting (Priority: P2)

As a collector, I want sorting to behave sensibly for cards without a known
price so I can still browse mixed result sets without confusing gaps or random
ordering.

**Why this priority**: A meaningful subset of the catalog may lack price data at
times, and inconsistent placement of those cards would make price sorting feel
broken.

**Independent Test**: Can be fully tested by loading a result set that contains
both priced and unpriced cards and confirming the ordering rule for missing
prices is applied consistently.

**Acceptance Scenarios**:

1. **Given** a result set contains both priced and unpriced cards, **When** the
   user applies a price-based sort, **Then** the system places all priced cards
   in price order and groups cards without prices after the priced cards.
2. **Given** a result set contains only cards without prices, **When** the user
   applies a price-based sort, **Then** the system still renders the full result
   set in a stable fallback order.

### Edge Cases

- A search result set mixes priced and unpriced cards.
- Multiple cards share the same price and require a stable tie-break order.
- A user changes sort order after applying a search term or set filter.
- A user lands directly on a results URL that already includes a sort
  selection.
- The home page has fewer visible results than a full page but must still honor
  the default sort order.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a user-visible sorting control anywhere
  card results are shown.
- **FR-002**: The system MUST let users reorder the current result set without
  clearing the active search term or filters.
- **FR-003**: The system MUST support sorting by price from highest to lowest.
- **FR-004**: The system MUST support at least one non-price sort option so
  users can choose an alternate browsing order.
- **FR-005**: The system MUST apply highest-price-first sorting by default on
  the home page when no explicit sort has been selected.
- **FR-006**: The system MUST preserve an explicitly selected sort order while
  the user continues browsing, searching, or filtering within the same results
  view.
- **FR-007**: When price-based sorting is active, the system MUST place cards
  without a known price after cards with a known price.
- **FR-008**: The system MUST apply a stable secondary ordering rule when two or
  more cards have the same sort value so their order is predictable.
- **FR-009**: The system MUST make the active sort order visible to the user.

### Key Entities *(include if feature involves data)*

- **Sort Option**: A user-selectable ordering choice applied to a card result
  set, such as highest-price-first or an alternate browsing order.
- **Result Set**: The current collection of cards returned for the active
  browse, search, and filter state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of home-page loads with priced cards show the visible results
  in descending price order when no explicit sort has been selected.
- **SC-002**: 95% of users can change the result ordering in one interaction or
  less during usability testing.
- **SC-003**: 100% of tested result sets preserve the same cards before and
  after a sort change, with only the order changing.
- **SC-004**: 100% of tested result sets containing both priced and unpriced
  cards place unpriced cards after priced cards when highest-price-first
  sorting is active.

## Assumptions

- The home page and results browsing flow share the same sorting behavior and
  control design.
- Existing available card attributes are sufficient to support at least one
  alternate non-price sort option without introducing new data collection.
- The current catalog already exposes enough pricing coverage for price-based
  sorting to be useful, even if some cards remain unpriced.
- Sorting changes are in scope only for card result lists, not for portfolio
  tables or price-history charts.
