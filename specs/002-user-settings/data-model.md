# Data Model: User Settings

## Entities

### ThemePreference

Represents the active visual mode chosen by the user.

Fields:
- `mode`: current theme choice, limited to `light` or `dark`
- `updatedAt`: last time the preference changed

Relationships:
- Applies globally to the current app session and all pages rendered for that browser/device

Validation rules:
- `mode` must always resolve to a supported theme value
- If the stored value is missing or invalid, the app must fall back to `light`

State transitions:
- `light` -> `dark` when the user enables dark mode
- `dark` -> `light` when the user disables dark mode

### SettingsEntryPoint

Represents the discoverable navigation route into the settings area.

Fields:
- `label`: user-facing name for the settings destination
- `href`: route to the settings page

Relationships:
- Links from the main app navigation to the settings page

Validation rules:
- The entry point must always be visible from the primary app navigation

## Notes

- This feature does not require a separate account-level profile object in v1.
- No additional preference types are in scope for this release.
