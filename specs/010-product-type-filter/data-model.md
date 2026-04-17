# Data Model: Product Type Filter

## ProductTypeSelection

- **Purpose**: Represents the active home-page browse mode.
- **Values**:
  - `card`
  - `sealed-product`
- **Rules**:
  - Default to `card` when the client has no explicit selection.
  - Reject or normalize unknown values to `card`.
  - Must be preserved when requesting additional pages of the same result set.

## CatalogBrowseRequest

- **Purpose**: Shared browse request state sent by web and iOS.
- **Fields**:
  - `q`: optional search term
  - `set`: optional set filter
  - `sort`: current sort value
  - `productType`: current `ProductTypeSelection`
  - `offset`: optional pagination offset
  - `limit`: optional page size
- **Rules**:
  - Search and sort remain unchanged when `productType` changes.
  - Home-page default requests use `productType=card` even when the URL omits
    the parameter.
  - Requests must return a result set containing only the selected product type.

## CatalogBrowseItem

- **Purpose**: Normalized list item rendered in the shared browse UI.
- **Fields**:
  - `id`: stable identifier
  - `productType`: `card` or `sealed-product`
  - `category`: franchise/category slug
  - `categoryName`: display name for the category
  - `setName`: primary secondary label shown in browse results
  - `name`: display title
  - `imageUrl`: optional thumbnail image
  - `currentPrice`: optional latest price
  - `collectorNumber`: optional, card-only
  - `rarity`: optional, card-only
  - `variationCount`: optional count or equivalent inventory variant count
- **Rules**:
  - Card rows keep today’s card metadata contract.
  - Sealed-product rows may omit `collectorNumber` and `rarity`.
  - The UI must render missing optional fields without layout or navigation
    errors.

## HomeBrowseState

- **Purpose**: Client-side state for the home-page browse experience.
- **Fields**:
  - `query`
  - `selectedSet`
  - `selectedSort`
  - `selectedProductType`
  - `items`
  - `isLoading`
  - `errorMessage`
- **State Transitions**:
  - `initial load -> card default`: client hydrates with `card` selected.
  - `card -> sealed-product`: refresh results using the same search/sort state.
  - `sealed-product -> card`: refresh results using the same search/sort state.
  - `any selection -> empty result`: show an empty state that names the selected
    product type.

## Interaction Capability

- **Card row**: Supports existing card-detail navigation.
- **Sealed-product row**: Browse-only in this increment; it renders in the list
  but does not invoke the card-detail flow.
