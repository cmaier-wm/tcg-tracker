# Feature Specification: Pokemon Card Portfolio Tracker

**Feature Branch**: `001-card-portfolio-tracker`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Build an application leveraging this API https://tcgtracking.com/tcgapi/?tab=docs to track TCG cards. I want to be able to view cards (including variations in different languages), see their current price and historical price graph, and see an image of the card. I also want to track my own portfolio of cards, including total value and historical value graph." Updated scope: first release is Pokemon only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Cards and Variants (Priority: P1)

As a collector, I want to browse supported Pokemon cards and inspect
their available variants so I can quickly understand what printings, languages,
and images exist for a card before deciding whether to track it.

**Why this priority**: Card discovery is the entry point for the product. If
users cannot find cards and identify the correct variant, portfolio tracking and
pricing views are not trustworthy.

**Independent Test**: Can be fully tested by opening the catalog, locating a
card, and confirming the card detail view shows its image and available
language or variant combinations without using portfolio features.

**Acceptance Scenarios**:

1. **Given** a user is viewing the card catalog, **When** they search or browse
   to a card, **Then** the system shows matching card results with identifying
   details that let the user choose the correct card.
2. **Given** a user opens a card detail view, **When** the card has multiple
   language or finish variations, **Then** the system shows those available
   variations in a way the user can inspect individually.
3. **Given** a card has an available image from the market data source,
   **When** the user opens the card detail view, **Then** the system displays
   that image alongside the card details.

---

### User Story 2 - Inspect Card Pricing History (Priority: P1)

As a collector, I want to see a card's current market value and a historical
price graph so I can judge price movement over time before buying, selling, or
tracking the card in my collection.

**Why this priority**: Pricing insight is a core product promise and must ship
at the same priority level as card discovery so users can evaluate cards as soon
as they find them.

**Independent Test**: Can be fully tested by opening a card detail view for a
card with tracked pricing history and confirming the current value and price
graph appear without adding the card to a portfolio.

**Acceptance Scenarios**:

1. **Given** a user is viewing a card variation with current market data,
   **When** the detail view loads, **Then** the system shows the latest tracked
   price and the date or time of that price update.
2. **Given** a card variation has multiple recorded price points, **When** the
   user opens the pricing section, **Then** the system shows a historical graph
   that makes upward and downward movement visible over time.
3. **Given** a card variation has no historical data yet, **When** the user
   opens the pricing section, **Then** the system explains that history is not
   available yet and still shows the latest available current price if present.

---

### User Story 3 - Track Personal Portfolio Value (Priority: P1)

As a collector, I want to maintain a personal portfolio of owned cards and see
both current total value and historical portfolio value so I can understand how
my collection is performing over time.

**Why this priority**: Portfolio tracking is also a core product promise and is
top-priority alongside discovery and pricing because the product is meant to
help users monitor the value of cards they own, not just browse market data.

**Independent Test**: Can be fully tested by adding cards to a portfolio,
reviewing the portfolio summary, and confirming the system shows current total
value and a historical portfolio graph based on recorded valuations.

**Acceptance Scenarios**:

1. **Given** a user is viewing a card variation, **When** they add it to their
   portfolio with a quantity, **Then** the portfolio records that holding and
   includes it in the user's collection summary.
2. **Given** a user has multiple portfolio holdings, **When** they open the
   portfolio view, **Then** the system shows each holding, its current estimated
   value, and the portfolio's total estimated value.
3. **Given** the portfolio has recorded valuation snapshots over time,
   **When** the user opens portfolio analytics, **Then** the system shows a
   historical graph of total portfolio value.

### Edge Cases

- A card exists in the catalog but has no image, no current market price, or no
  historical pricing yet.
- A card has multiple language, condition, or finish combinations, but only a
  subset have market data at a given time.
- A user adds the same card variation to their portfolio more than once.
- A previously tracked card becomes unavailable or is renamed in the external
  market data source.
- Portfolio valuation history exists for some days but not others due to source
  update gaps.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let users browse and search a catalog of supported
  Pokemon cards.
- **FR-002**: The system MUST show identifying card details for each catalog
  result, including enough information to distinguish cards with the same or
  similar names.
- **FR-003**: The system MUST show available card variations for a selected
  card, including language options when that information is available from the
  market data source.
- **FR-004**: The system MUST display a card image when an image is available
  for the selected card.
- **FR-005**: The system MUST show the latest available market price for a
  selected card variation.
- **FR-006**: The system MUST retain time-series price snapshots for tracked
  card variations so historical price graphs can be displayed.
- **FR-007**: The system MUST display a historical price graph for a selected
  card variation when more than one price snapshot exists.
- **FR-008**: The system MUST clearly indicate when current price or historical
  price data is unavailable.
- **FR-009**: Users MUST be able to add a specific card variation to their
  personal portfolio with a recorded quantity.
- **FR-010**: Users MUST be able to update or remove a portfolio holding.
- **FR-011**: The system MUST calculate and display the current estimated value
  of each portfolio holding using the latest available market price for that
  holding's selected variation.
- **FR-012**: The system MUST calculate and display the portfolio's current
  total estimated value.
- **FR-013**: The system MUST retain periodic portfolio valuation snapshots so a
  historical portfolio value graph can be displayed.
- **FR-014**: The system MUST display a historical graph of total portfolio
  value when more than one portfolio valuation snapshot exists.
- **FR-015**: The system MUST keep portfolio holdings tied to the exact card
  variation selected by the user so valuation reflects the intended language or
  variant rather than a generic card record.

### Key Entities *(include if feature involves data)*

- **Card**: A Pokemon card product users can browse, identified by set, name,
  collector identifier, rarity, and image metadata.
- **Card Variation**: A distinct market-trackable version of a card, defined by
  attributes such as language, finish, condition grouping, or other source
  variation data that affects pricing.
- **Price Snapshot**: A dated record of a card variation's observed market value
  used to show current pricing and historical price graphs.
- **Portfolio Holding**: A user's owned quantity of a specific card variation.
- **Portfolio Valuation Snapshot**: A dated record of the total estimated value
  of the user's portfolio at a point in time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of users can locate a desired card and open its detail view in
  under 60 seconds during usability testing.
- **SC-002**: 95% of card detail views with available source pricing show both a
  current price and last-update timestamp on first load.
- **SC-003**: 95% of card variations with at least two stored price snapshots
  display a historical price graph without missing points caused by rendering
  errors.
- **SC-004**: 95% of portfolio edits made by users are reflected in the
  portfolio total value on the next portfolio view refresh.
- **SC-005**: 95% of portfolio views with at least two stored valuation
  snapshots display a historical total-value graph.

## Assumptions

- The first release is for a single collector's personal portfolio; multi-user
  sharing, social features, and marketplace transactions are out of scope.
- The first release only supports Pokemon from the external card data source;
  other TCG categories are out of scope unless requirements change later.
- The external card data source provides Pokemon product identifiers, images,
  and current market pricing for at least a meaningful subset of the cards
  users want to track.
- Historical graphs are built from price and valuation snapshots collected after
  the app begins tracking a card or portfolio; full historical backfill is out
  of scope unless the source already exposes it.
- Authentication and portfolio privacy controls can follow a standard personal
  account model and do not need specialized roles for this feature.
