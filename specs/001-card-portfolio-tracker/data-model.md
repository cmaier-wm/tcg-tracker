# Data Model: TCG Card Portfolio Tracker

## CardCategory

Represents a supported game or category from the upstream card data source.

### Fields

- `id`: internal identifier
- `sourceCategoryId`: upstream category identifier
- `name`: display name
- `slug`: stable URL-safe identifier
- `isActive`: whether the category is currently enabled in the app
- `createdAt`
- `updatedAt`

### Relationships

- One `CardCategory` has many `CardSet` records
- One `CardCategory` has many `Card` records through sets

## CardSet

Represents a set or release grouping used to organize cards.

### Fields

- `id`
- `categoryId`
- `sourceSetId`
- `name`
- `abbreviation`
- `releasedOn` (optional)
- `createdAt`
- `updatedAt`

### Relationships

- Belongs to one `CardCategory`
- Has many `Card` records

## Card

Represents the base product a user recognizes when browsing the catalog.

### Fields

- `id`
- `setId`
- `sourceProductId`
- `name`
- `cleanName`
- `collectorNumber` (optional)
- `rarity` (optional)
- `imageUrl` (optional)
- `externalProductUrl` (optional)
- `createdAt`
- `updatedAt`

### Relationships

- Belongs to one `CardSet`
- Has many `CardVariation` records

### Validation Rules

- `sourceProductId` must be unique within the local catalog
- `name` is required

## CardVariation

Represents a price-trackable variant of a card that can be selected by a user.

### Fields

- `id`
- `cardId`
- `sourceSkuId` (optional when the source exposes only product-level pricing)
- `languageCode`
- `finish`
- `conditionCode` (optional for portfolio-level default selection)
- `variantLabel`
- `isDefault`
- `createdAt`
- `updatedAt`

### Relationships

- Belongs to one `Card`
- Has many `PriceSnapshot` records
- Has many `PortfolioHolding` records

### Validation Rules

- The combination of `cardId`, `languageCode`, `finish`, `conditionCode`, and
  `variantLabel` must be unique
- `languageCode` is required if the source provides language data

## PriceSnapshot

Represents the observed market value of a card variation at a point in time.

### Fields

- `id`
- `cardVariationId`
- `capturedAt`
- `marketPrice` (optional)
- `lowPrice` (optional)
- `highPrice` (optional)
- `listingCount` (optional)
- `sourceName`
- `createdAt`

### Relationships

- Belongs to one `CardVariation`

### Validation Rules

- Only one snapshot per `cardVariationId`, `sourceName`, and capture window
  should be stored for a given daily import

## UserAccount

Represents the collector whose portfolio is tracked in the application.

### Fields

- `id`
- `email`
- `displayName`
- `createdAt`
- `updatedAt`

### Relationships

- Has many `PortfolioHolding` records
- Has many `PortfolioValuationSnapshot` records

## PortfolioHolding

Represents an owned quantity of a specific card variation.

### Fields

- `id`
- `userId`
- `cardVariationId`
- `quantity`
- `notes` (optional)
- `acquiredAt` (optional)
- `createdAt`
- `updatedAt`

### Relationships

- Belongs to one `UserAccount`
- Belongs to one `CardVariation`

### Validation Rules

- `quantity` must be greater than zero
- A user can have at most one active holding row per card variation; repeat adds
  should update quantity rather than create ambiguous duplicates

## PortfolioValuationSnapshot

Represents the total estimated value of a user's portfolio at a point in time.

### Fields

- `id`
- `userId`
- `capturedAt`
- `totalValue`
- `holdingCount`
- `pricedHoldingCount`
- `createdAt`

### Relationships

- Belongs to one `UserAccount`

### Validation Rules

- One valuation snapshot per user per daily capture window

## State Transitions

- `Card` and `CardVariation` records are created or updated during catalog sync
- `PriceSnapshot` records are appended during scheduled pricing imports
- `PortfolioHolding` records are created when a user adds a card, updated when
  quantity changes, and deleted when the user removes the holding
- `PortfolioValuationSnapshot` records are appended during scheduled or
  post-edit valuation refreshes
