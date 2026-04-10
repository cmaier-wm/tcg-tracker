# UI Contract: Portfolio Export

## Portfolio Page Surface

- The export affordance lives on `/portfolio` inside the existing "Your Cards"
  surface so it is discoverable near the holdings list it exports.
- The affordance is visible only to authenticated users because `/portfolio` is
  already a protected route.
- The affordance label clearly indicates a spreadsheet download outcome, such
  as "Export Portfolio".

## Success Behavior

- Activating export starts a browser download without navigating away from
  `/portfolio`.
- The downloaded filename clearly identifies the file as a portfolio export.
- The user remains on the portfolio page after the browser download starts.
- The page shows a visible success toast after the browser download is started.

## Empty-State Behavior

- If the portfolio has no holdings, the export affordance is disabled or
  otherwise prevented from triggering a misleading success download.
- The page shows a clear explanation that there is no portfolio data available
  to export.
- Direct route access to the export endpoint still returns the defined API
  empty-state outcome.

## Error Behavior

- If the export route returns an authentication failure, the user is prompted to
  sign in again before retrying export.
- If export generation fails for any other reason, the page shows a clear,
  non-download error message and leaves the current portfolio UI intact.

## Sorting Behavior

- Exported rows include all holdings for the account, not only the current
  paginated page.
- If the portfolio page currently exposes a selected sort option, that sort may
  be forwarded to the export request so row order matches the user's current
  view.
