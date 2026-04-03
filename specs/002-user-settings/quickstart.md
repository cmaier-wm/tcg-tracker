# Quickstart: User Settings

## Goal

Verify the settings area can toggle dark mode and preserve the selected theme across reloads.

## Manual Verification

1. Start the app and open `/settings`.
2. Toggle dark mode on.
3. Confirm the app shell and pages switch to the dark theme immediately.
4. Reload the page or navigate away and back.
5. Confirm the dark theme remains enabled.
6. Toggle dark mode off and confirm the default theme returns.
7. Use the main navigation to return to the browse and portfolio pages and confirm the theme stays consistent across the app.

## Automated Verification

Run the targeted test suites after implementation:

```bash
npm run test:unit -- tests/unit/theme-preference.test.ts
npm run test:integration -- tests/integration/settings-page.test.tsx tests/contract/settings-page.contract.test.tsx
npm run test:e2e
```

## Expected Outcomes

- The settings page is reachable from the main navigation.
- Dark mode changes are visible without a full restart.
- The saved preference survives reloads on the same browser/device.
- The settings toggle and persistence behavior pass the targeted unit and integration tests.
