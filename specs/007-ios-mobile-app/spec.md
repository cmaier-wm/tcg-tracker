# Feature Specification: iOS Mobile App

**Feature Branch**: `007-ios-mobile-app`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "i want to create an iOS mobile version of the app, following the design in https://www.figma.com/make/6ao1OMigGMRBj68UqBEOWA/TCG-Card-Tracker-App?p=f&t=yPFfzhkWszroa0UZ-11"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In And Review Collection Summary (Priority: P1)

As a returning collector, I want to sign in on my iPhone and immediately see a
mobile-optimized summary of my collection so I can understand portfolio value,
recent movement, and next actions without using the desktop site.

**Why this priority**: A mobile app only becomes useful when an existing user
can quickly access trusted account data in a form that fits a phone. This is
the minimum viable slice that proves the app is a useful mobile companion.

**Independent Test**: Can be fully tested by signing in on an iPhone-sized
screen, loading the signed-in landing experience, and confirming the user can
review portfolio summary information and navigate to the app’s primary mobile
sections without using card editing or settings flows.

**Acceptance Scenarios**:

1. **Given** a registered user opens the iOS app, **When** they provide valid
   credentials, **Then** the app signs them in and opens the primary signed-in
   mobile experience without requiring a desktop browser.
2. **Given** a signed-in user has existing holdings, **When** the signed-in
   landing experience loads, **Then** the app shows current portfolio value,
   recent movement indicators, and clear entry points into portfolio and card
   discovery views.
3. **Given** a signed-in user has no holdings, **When** the signed-in landing
   experience loads, **Then** the app shows an intentional empty state with a
   clear next step into card discovery.

---

### User Story 2 - Browse Cards And Inspect Pricing On Mobile (Priority: P1)

As a collector, I want to browse cards and inspect card details, images, and
pricing history from my phone so I can evaluate cards while away from my desk.

**Why this priority**: Card discovery and pricing are core product promises.
The mobile version would not meet user expectations if collectors could sign in
but could not look up cards and assess value on the go.

**Independent Test**: Can be fully tested by opening the card catalog on an
iPhone-sized screen, locating a card, and confirming the detail experience
shows images, variation choices, current pricing, and historical pricing in a
mobile-appropriate layout.

**Acceptance Scenarios**:

1. **Given** a signed-in user opens card discovery, **When** they browse or
   search for a card, **Then** the app shows mobile-friendly results that help
   them identify the correct card.
2. **Given** a signed-in user opens a card detail view, **When** the card has
   multiple tracked variations, **Then** the app lets them inspect those
   variations and view the matching image and current price.
3. **Given** a card variation has recorded history, **When** the user views the
   pricing section, **Then** the app shows a historical price chart that is
   readable and usable on a phone screen.

---

### User Story 3 - Manage Portfolio Holdings From Mobile (Priority: P2)

As a collector, I want to add, update, and remove holdings from the mobile app
so my collection stays accurate when I am buying, selling, or checking cards in
person.

**Why this priority**: Mobile portfolio editing is highly valuable, but the app
still provides meaningful value without it if users can already review their
existing collection and card pricing.

**Independent Test**: Can be fully tested by adding a card variation to the
portfolio from mobile, editing its quantity, removing it, and confirming the
portfolio totals and holding list update correctly.

**Acceptance Scenarios**:

1. **Given** a signed-in user is viewing a card variation, **When** they add it
   to their collection from mobile, **Then** the holding appears in their
   portfolio with the entered quantity.
2. **Given** a signed-in user already owns a card variation, **When** they
   change its quantity from the portfolio view, **Then** the app updates the
   holding and reflects the change in portfolio totals.
3. **Given** a signed-in user removes a holding, **When** the action is
   confirmed, **Then** the holding is no longer shown and its value is excluded
   from portfolio totals.

---

### User Story 4 - Adjust Personal Settings On Mobile (Priority: P3)

As a signed-in user, I want to manage my personal app preferences and alert
settings from the mobile app so I do not need to return to the desktop site for
basic account maintenance.

**Why this priority**: Settings are important for completeness, but they are
secondary to delivering a reliable mobile core experience for sign-in,
discovery, pricing, and portfolio management.

**Independent Test**: Can be fully tested by opening settings on mobile,
changing supported preferences or alert settings, and confirming the updated
values are shown when the user returns to settings later.

**Acceptance Scenarios**:

1. **Given** a signed-in user opens settings on mobile, **When** they review
   available preferences, **Then** the app shows settings in a touch-friendly
   layout aligned with the approved mobile design.
2. **Given** a signed-in user changes a supported preference or alert setting,
   **When** they save the update, **Then** the app confirms the change and
   shows the saved value on the next settings load.

### Edge Cases

- A user signs in successfully but has an empty portfolio and no saved alert
  settings.
- A card has a current price but no historical price data to chart.
- A card has multiple tracked variations, but some variations have no image or
  missing market data.
- A user attempts to save an invalid holding quantity or performs repeated taps
  on a primary action while a request is still in progress.
- A session expires while a user is navigating between mobile screens.
- The app is opened on supported iPhone sizes with different safe areas or text
  scaling preferences.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an iOS mobile experience for the app’s
  existing authenticated users that is optimized for iPhone-sized screens.
- **FR-002**: The system MUST let users sign in, remain signed in across normal
  app launches, and sign out from the mobile app.
- **FR-003**: The system MUST present a signed-in mobile landing experience
  that summarizes portfolio value, recent performance indicators, and
  navigation to the app’s primary sections.
- **FR-004**: The system MUST follow the approved Figma mobile design as the
  reference for information hierarchy, navigation patterns, spacing, and visual
  presentation.
- **FR-005**: The system MUST let users browse and search the supported card
  catalog from the mobile app.
- **FR-006**: The system MUST show card details, available variations, and card
  imagery in a mobile-friendly layout.
- **FR-007**: The system MUST show the latest available market price and
  historical pricing information for a selected card variation when that data
  exists.
- **FR-008**: The system MUST clearly communicate when card imagery, current
  pricing, or historical pricing data is unavailable.
- **FR-009**: The system MUST let users add a selected card variation to their
  portfolio from the mobile app.
- **FR-010**: The system MUST let users update or remove an existing portfolio
  holding from the mobile app.
- **FR-011**: The system MUST show the user’s portfolio holdings, current
  estimated holding values, and current total portfolio value on mobile.
- **FR-012**: The system MUST keep portfolio changes made on mobile consistent
  with the user’s existing account data so the collection shown on mobile
  matches the collection shown in other app experiences.
- **FR-013**: The system MUST provide a mobile settings area where users can
  review and update supported personal preferences and alert settings.
- **FR-014**: The system MUST keep mobile primary actions usable with touch
  input, readable text, and layouts that respect common iPhone safe-area
  constraints.
- **FR-015**: The system MUST protect authenticated screens by returning
  signed-out or expired sessions to the sign-in flow before protected data is
  shown.

### Key Entities *(include if feature involves data)*

- **Mobile Session**: A user’s authenticated mobile access state, including
  whether protected screens can be viewed and when re-authentication is needed.
- **Portfolio Summary**: The aggregate collection information shown in the
  signed-in mobile landing experience, including total value and recent
  movement indicators.
- **Card**: A collectible item a user can browse, identify, and inspect from
  mobile views.
- **Card Variation**: A specific tracked version of a card whose image and
  pricing may differ from other versions of the same card.
- **Portfolio Holding**: A user’s owned quantity of a specific card variation.
- **User Preference**: A saved personal app or alert configuration that the
  user can review or update from mobile settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of returning users can sign in and reach the signed-in mobile
  experience in under 45 seconds during usability testing.
- **SC-002**: 95% of tested signed-in landing loads show portfolio summary
  content or an intentional empty state without layout breakage on supported
  iPhone sizes.
- **SC-003**: 90% of users in moderated testing can find a target card and open
  its pricing detail view in under 75 seconds using only the mobile app.
- **SC-004**: 95% of successful holding edits made from mobile are reflected in
  the user’s portfolio totals on the next portfolio refresh.
- **SC-005**: 90% of tested users rate the mobile app’s navigation and
  readability as easy to use on a phone-sized screen.

## Assumptions

- The iOS mobile app is a dedicated mobile experience for the current product,
  not a redesign of the existing desktop web experience.
- The first release targets signed-in collectors using supported iPhone
  devices; iPad-specific layouts and Android support are out of scope unless a
  later feature expands them.
- The mobile app uses the existing account-owned portfolio, pricing, and
  settings data rather than introducing a separate collection or separate user
  profile.
- The referenced Figma file is the approved source for the mobile visual
  direction and interaction patterns unless later design revisions replace it.
- Administrative tooling, catalog ingestion workflows, and back-office
  management remain out of scope for the mobile app.
