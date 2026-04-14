# Data Model: iOS Mobile App

## MobileSession

- **Purpose**: Represents whether the iOS app currently has a valid
  authenticated user session for protected mobile screens.
- **Attributes**:
  - `status`
  - `userId`
  - `email`
  - `displayName`
- **Relationships**:
  - Gates access to `PortfolioSummary`, `PortfolioHolding`, and
    `UserPreference`
- **Validation rules**:
  - Protected mobile data is only available when the session is authenticated
  - Expired sessions must return the user to sign-in before protected actions

## PortfolioSummary

- **Purpose**: Represents the composed signed-in landing payload for the mobile
  app.
- **Attributes**:
  - `displayName`
  - `totalEstimatedValue`
  - `todayProfitLoss`
  - `holdingCount`
  - `totalCardQuantity`
  - `historyPreview`
  - `emptyState`
- **Relationships**:
  - Derived from `PortfolioHolding` and historical portfolio valuation data
- **Validation rules**:
  - Must support both populated and empty collection states
  - Summary totals must align with the server-owned portfolio calculations

## Card

- **Purpose**: Represents a collectible item visible in browse and detail views.
- **Attributes**:
  - `cardId`
  - `category`
  - `name`
  - `setName`
  - `collectorNumber`
  - `rarity`
  - `imageUrl`
- **Relationships**:
  - Has many `CardVariation` entries
- **Validation rules**:
  - Browse results must include enough identifying information for card
    selection on a small screen

## CardVariation

- **Purpose**: Represents a tracked version of a card with its own pricing
  characteristics.
- **Attributes**:
  - `variationId`
  - `label`
  - `language`
  - `finish`
  - `condition`
  - `currentPrice`
  - `lastUpdatedAt`
- **Relationships**:
  - Belongs to one `Card`
  - May map to one `PortfolioHolding`
- **Validation rules**:
  - Missing price data must be represented explicitly so the mobile client can
    show a clear empty state

## PortfolioHolding

- **Purpose**: Represents a user-owned quantity of a tracked card variation.
- **Attributes**:
  - `holdingId`
  - `cardVariationId`
  - `quantity`
  - `estimatedValue`
- **Relationships**:
  - Belongs to one authenticated user account
  - Contributes to one `PortfolioSummary`
- **Validation rules**:
  - Quantity must remain a positive whole number for add and update actions
  - Holding totals must refresh from server-owned valuation data after changes

## UserPreference

- **Purpose**: Represents account-backed settings visible from the mobile
  settings screen.
- **Attributes**:
  - `alertsEnabled`
  - `destinationLabel`
  - `triggerAmount`
  - `deliveryStatus`
- **Relationships**:
  - Belongs to one authenticated user account
- **Validation rules**:
  - Signed-out users cannot read or update account-backed settings
  - Invalid alert configuration must be rejected before persistence

## State Transitions

- **Signed Out -> Authenticated**: Valid credentials create an authenticated
  mobile session and unlock protected screens.
- **Authenticated -> Summary Ready**: The signed-in landing experience resolves
  current portfolio summary data for the user.
- **Authenticated -> Holding Updated**: A holding add, update, or remove action
  succeeds and is reflected in the next portfolio refresh.
- **Authenticated -> Settings Updated**: A supported preference change succeeds
  and is returned on the next settings load.
- **Authenticated -> Signed Out**: Logout or session expiry returns the app to
  the sign-in flow before protected content is shown again.
