# Research: Portfolio Spreadsheet Export

## Decision: Use CSV as the v1 spreadsheet-compatible export format

**Rationale**: CSV satisfies the user request to generate and download a
spreadsheet while staying within the existing Node.js and browser platform
capabilities already present in the app. It opens in common spreadsheet tools
without adding a workbook-generation dependency, which keeps the design aligned
with the repo constitution's simplicity rule.

**Alternatives considered**:

- XLSX workbook generation library: rejected because it adds a new dependency
  and more formatting and escaping complexity for a first slice that only needs
  one flat holdings sheet.
- JSON export: rejected because it is not a spreadsheet-native format for the
  target user workflow.

## Decision: Deliver export through a dedicated authenticated route handler

**Rationale**: A dedicated `GET /api/portfolio/export` route cleanly separates
file-download semantics from the existing JSON CRUD portfolio endpoints. It can
reuse the app's existing auth guards, run fully on the server, and return the
filename and MIME headers required for a browser download.

**Alternatives considered**:

- Extending `GET /api/portfolio` with a query flag for file responses: rejected
  because one endpoint would have to switch between JSON and file contracts.
- Client-side CSV assembly from already rendered page data: rejected because it
  couples export to paginated UI state and duplicates server-side auth and data
  logic in the browser.

## Decision: Export all holdings for the signed-in user, not only the current page

**Rationale**: “My portfolio” implies the full account-owned collection, while
the current page UI is paginated to five holdings at a time. Export therefore
needs an all-holdings path and may optionally accept the existing sort choices
for row order so the downloaded file still matches the user's mental model.

**Alternatives considered**:

- Export only the currently visible page: rejected because it silently drops
  holdings and would make the file incomplete.
- Export holdings plus historical charts or snapshots in v1: rejected because
  the spec limits this slice to current holdings and latest valuation data.

## Decision: Build export rows from existing holding, card, and latest-price data

**Rationale**: The current portfolio query path already resolves the
authenticated user's holdings and their latest price snapshot or demo fallback
equivalent. Extending that path to include card-identifying fields such as
category, set name, collector number, variation label, quantity, and latest
valuation fields avoids introducing new persisted export records.

**Alternatives considered**:

- Persist export jobs or snapshots: rejected because the export is immediate
  and small enough for synchronous generation in the current scope.
- Export only card name and quantity: rejected because it does not satisfy the
  spec requirement to distinguish similar holdings reliably.

## Decision: Treat empty portfolios as a distinct non-download outcome

**Rationale**: The spec requires clear feedback when the account has nothing to
export. The UI should therefore avoid implying success for an empty export, and
the route contract should make the empty-portfolio case explicit so direct API
calls do not return an ambiguous blank file.

**Alternatives considered**:

- Downloading a header-only CSV for empty portfolios: rejected because the spec
  explicitly calls for a clear “nothing to export” outcome instead of implying
  success.
- Hiding all export affordances without explanation: rejected because users
  still need to understand why export is unavailable.

## Decision: Use a recognizable, date-stamped filename

**Rationale**: The spec requires a recognizable portfolio export filename.
Including a stable portfolio label plus the current export date makes the file
easy to identify in a downloads folder and easy to share or archive later.

**Alternatives considered**:

- Generic `download.csv`: rejected because it is not meaningful once saved.
- User-supplied file naming in v1: rejected because it adds UI and validation
  scope that is unnecessary for the first release.
