# Contract: Home Product Type Filter

## Shared Browse Query Contract

### Endpoint

- `GET /api/cards`

### Query Parameters

- `q`: optional search term
- `set`: optional set slug
- `sort`: optional catalog sort value
- `productType`: optional enum
  - `card`
  - `sealed-product`

### Normalization Rules

- If `productType` is omitted or invalid, the system behaves as if
  `productType=card`.
- Web home-page resets return to the default cards state.
- Infinite-scroll requests must resend the same `productType` as the current
  visible result set.

## Response Contract

```json
{
  "items": [
    {
      "id": "string",
      "productType": "card",
      "category": "pokemon",
      "categoryName": "Pokemon",
      "setName": "151",
      "name": "Charizard ex",
      "collectorNumber": "6/165",
      "rarity": "Ultra Rare",
      "imageUrl": "https://example.test/item.png",
      "currentPrice": 120.0,
      "variationCount": 2
    }
  ]
}
```

## Field Rules

- `productType` is required on every returned item.
- `collectorNumber` and `rarity` are optional and may be absent for
  `sealed-product` items.
- Returned items must all match the requested `productType`.
- Result ordering still follows the requested `sort` value inside the selected
  product type.

## Web URL Contract

- Home-page default state may omit `productType` from the URL while still
  rendering Cards as active.
- When the user selects Sealed Product, the URL includes
  `productType=sealed-product`.
- Changing `productType` preserves any active `q`, `set`, and `sort` values.

## iOS Browse Contract

- The iOS browse store sends the same `productType` values as the web client.
- The initial iOS browse request uses the default `card` selection.
- Product-type changes trigger a new browse request without clearing the current
  query text or selected sort.

## Out of Scope for This Contract

- No sealed-product detail endpoint is introduced in this increment.
- Card detail and price-history endpoints remain card-only.
