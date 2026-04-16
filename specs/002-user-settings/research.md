# Research: User Settings

## Theme Preference Storage

Decision: Store the dark mode preference on the user’s browser/device and restore it on subsequent visits.

Rationale: The feature request asks for user settings with dark mode, and the accepted cross-platform parity rules now require account-backed persistence. This delivers a single source of truth for both web and iOS instead of duplicating per-device state.

Alternatives considered:
- Server-side user settings tied to an account. Rejected because it adds scope the feature did not request.
- Session-only preference. Rejected because it would not persist across visits.

## Theme Application Strategy

Decision: Apply the selected theme at the app shell level so all pages inherit the same visual mode.

Rationale: A global theme decision keeps the experience consistent across browse, detail, and portfolio pages and avoids piecemeal styling drift.

Alternatives considered:
- Per-page theme handling. Rejected because it would create inconsistency and duplicate logic.

## Settings Surface

Decision: Add a dedicated settings page reachable from the existing app navigation.

Rationale: A dedicated page is simple, discoverable, and easy to test. It also keeps the feature isolated from unrelated browsing and portfolio flows.

Alternatives considered:
- Inline settings in the header menu. Rejected because it adds navigation complexity for a small feature.
- Modal-based settings. Rejected because it is less durable for future preferences.

## Verification Approach

Decision: Use unit tests for preference logic, integration tests for the settings page and app shell, and end-to-end checks for persistence across reloads.

Rationale: The feature has a small amount of logic but a visible user experience change, so layered verification reduces regression risk.

Alternatives considered:
- Manual-only verification. Rejected because persistence and global theme changes are easy to regress.
