# Mobile Navigation Contract

## Design Source

- Primary design reference: the supplied Figma Make file for the TCG Tracker
  mobile experience.

## Auth States

- The mobile app has two root states:
  - signed out
  - signed in
- Signed-out users start at the sign-in flow.
- Signed-in users start at the mobile landing experience and can navigate to
  browse, portfolio, card detail, and settings.

## Primary Navigation

- The primary signed-in shell uses two top-level destinations:
  - Browse
  - Portfolio
- Settings is a secondary destination from the signed-in shell, not a third
  persistent tab.

## Screen Expectations

### Sign In

- Collects credentials and transitions into the signed-in shell on success.
- Shows a clear validation or auth error on failure without entering protected
  areas.

### Signed-In Landing Experience

- Shows portfolio summary metrics or an empty state when the user has no
  holdings.
- Provides clear onward navigation into browse and portfolio flows.

### Browse

- Shows searchable card results with identifying details optimized for a small
  screen.
- Selecting a card opens card detail.

### Card Detail

- Shows card image, identifying metadata, tracked variations, current pricing,
  and historical pricing.
- Supports add-to-portfolio entry without leaving the signed-in mobile shell.

### Portfolio

- Shows holdings, current total value, and update/remove interactions.
- Reflects successful holding changes on the next visible refresh.

### Settings

- Shows supported personal preferences and alert settings in a touch-friendly
  layout.
- Saving a supported setting keeps the user in the signed-in shell.

## Navigation Rules

- Protected screens never render account-backed content before session
  validation completes.
- Session expiry from any protected screen returns the user to sign-in.
- Returning from card detail restores the prior browse context where practical.
- Successful holding changes are reflected in portfolio totals and the
  signed-in landing summary on the next refresh.
