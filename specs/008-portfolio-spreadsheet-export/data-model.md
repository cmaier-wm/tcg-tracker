# Data Model: Portfolio Spreadsheet Export

## PortfolioExportRequest

- **Purpose**: Represents an authenticated user's request to generate a
  spreadsheet-compatible download of their current portfolio.
- **Attributes**:
  - `userId`: authenticated account owner for the export
  - `requestedAt`: server-side timestamp used for filename generation and audit
  - `sort`: optional row-order preference aligned to existing portfolio sort
    options
- **Relationships**:
  - Resolves one current `UserAccount`
  - Reads many current `PortfolioHolding` records
- **Validation rules**:
  - request is rejected when no authenticated user session is present
  - request must never read holdings from another account
  - unsupported sort values normalize to the portfolio default sort

## ExportPortfolioHoldingRow

- **Purpose**: Represents one holding row in the downloaded spreadsheet.
- **Attributes**:
  - `holdingId`
  - `categorySlug` or category name
  - `setName`
  - `cardName`
  - `collectorNumber`
  - `variationLabel`
  - `quantity`
  - `unitMarketPrice`
  - `estimatedValue`
  - `lastValuationAt`
- **Relationships**:
  - Derived from one `PortfolioHolding`
  - Joins one `CardVariation`
  - Joins one `Card` and its `CardSet` or `CardCategory`
  - Reads zero or one latest `PriceSnapshot`
- **Validation rules**:
  - one row is produced per holding
  - card-identifying columns must be sufficient to distinguish similar holdings
  - valuation columns may be blank or marked unavailable when no latest price
    exists

## PortfolioExportDocument

- **Purpose**: Represents the generated downloadable file and its metadata.
- **Attributes**:
  - `filename`
  - `contentType`
  - `columnHeaders`
  - `rows`
  - `generatedAt`
- **Relationships**:
  - Built from one `PortfolioExportRequest`
  - Contains many `ExportPortfolioHoldingRow` records
- **Validation rules**:
  - filename must clearly identify the download as a portfolio export
  - column headers must be human-readable
  - row ordering must be deterministic for the same request inputs

## ExportOutcome

- **Purpose**: Represents the user-visible result of an export attempt.
- **Attributes**:
  - `status`: one of `success`, `empty`, `unauthorized`, or `error`
  - `message`
  - `downloadedFileName` when `status = success`
- **Relationships**:
  - produced from one `PortfolioExportRequest`
- **Validation rules**:
  - `success` may only occur when at least one holding row exists
  - `empty` must not imply a file was downloaded
  - `unauthorized` must not leak portfolio data

## State Transitions

- **Authenticated with holdings -> Success**: valid session plus at least one
  holding produces a downloadable `PortfolioExportDocument`.
- **Authenticated with no holdings -> Empty**: valid session plus zero holdings
  returns the defined empty-state outcome and no file.
- **Unauthenticated or expired -> Unauthorized**: missing or invalid session
  blocks export generation before any row data is returned.
- **Generation failure -> Error**: unexpected failures return a clear
  non-download error outcome without partial file content.
