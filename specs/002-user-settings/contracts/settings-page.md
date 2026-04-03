# Settings Page Contract

## Purpose

Define the expected user-facing behavior of the settings area for the initial release.

## Route

- `GET /settings`

## Behavior

- The page presents the current theme preference.
- The user can enable dark mode or return to the default light theme.
- The selected theme is reflected across the app after the user changes it.
- Returning to the page shows the last saved theme choice for that browser/device.

## UI Expectations

- The page includes a clear navigation path back to the main app.
- The page does not require a user account.
- The page should not expose any preference controls that are outside the current feature scope.

## Acceptance Notes

- A user can change the setting without leaving the settings page.
- Reloading the app on the same browser/device preserves the chosen theme.
