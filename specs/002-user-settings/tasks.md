# Implementation Tasks: User Settings

**Input**: Design artifacts from `/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/settings-page.md, quickstart.md

**Tests**: Include automated verification tasks because this feature changes persistent user-visible behavior.

**Organization**: Tasks are grouped by user story and ordered so each story remains independently shippable and testable.

## Phase 1: Setup

- [x] T001 Confirm the new feature scope and file layout in `/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/plan.md` and `/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/spec.md`
- [x] T002 Add a dedicated settings route scaffold in `app/settings/page.tsx`
- [x] T003 Add settings-related shared components folder structure in `components/settings/`
- [x] T004 Add settings-related shared state helpers in `lib/settings/`

## Phase 2: Foundational

- [x] T005 Define the browser-local theme preference contract in `lib/settings/theme-storage.ts`
- [x] T006 Define the theme selection helper in `lib/settings/theme-preference.ts`
- [x] T007 Wire the app shell to read the stored preference before first render in `app/layout.tsx`
- [x] T008 Update global theme tokens and theme-specific styles in `app/globals.css`
- [x] T009 Add a navigation entry point to the settings page in `components/site-nav.tsx`

## Phase 3: User Story 1 - Change Theme Preference (Priority: P1)

**Goal**: Users can open settings and switch dark mode on or off.

**Independent Test**: Open the settings page, toggle dark mode, and confirm the app immediately switches themes.

- [x] T010 [US1] Implement the settings page UI with a theme toggle in `components/settings/settings-page.tsx`
- [x] T011 [US1] Render the settings page route from `app/settings/page.tsx`
- [x] T012 [US1] Add the theme toggle interaction and accessible labels in `components/settings/theme-toggle.tsx`
- [x] T013 [US1] Connect theme toggle actions to the shared preference helper in `lib/settings/theme-preference.ts`
- [x] T014 [US1] Verify the settings page renders and exposes the toggle in `tests/integration/settings-page.test.tsx`

## Phase 4: User Story 2 - Preserve Preference (Priority: P2)

**Goal**: The selected theme remains in place after reloads and future visits on the same browser/device.

**Independent Test**: Enable dark mode, reload the app, and confirm the same theme remains active.

- [x] T015 [US2] Persist the selected theme value in browser-local storage through `lib/settings/theme-storage.ts`
- [x] T016 [US2] Restore theme preference during app startup in `app/layout.tsx`
- [x] T017 [US2] Add unit coverage for theme preference save and restore behavior in `tests/unit/theme-preference.test.ts`
- [x] T018 [US2] Add integration coverage for preference persistence across page reloads in `tests/integration/settings-page.test.tsx`

## Phase 5: User Story 3 - Access Settings Easily (Priority: P3)

**Goal**: Users can find settings from the main app navigation.

**Independent Test**: From any main page, open the primary navigation and reach the settings page in one click.

- [x] T019 [US3] Add a visible Settings navigation item to `components/site-nav.tsx`
- [x] T020 [US3] Ensure the settings route is reachable from the main app shell in `app/layout.tsx`
- [x] T021 [US3] Add contract coverage for the settings page route in `tests/contract/settings-page.contract.test.ts`

## Phase 6: Polish & Cross-Cutting

- [x] T022 Update `specs/002-user-settings/quickstart.md` with the final verification steps after implementation details are confirmed
- [x] T023 Run the targeted test suites and record verification results in the feature notes
- [x] T024 Review `AGENTS.md` and `README.md` for any needed guidance updates after implementation

## Dependencies & Execution Order

- Phase 1 must complete before any implementation work.
- Phase 2 must complete before user story work because all stories depend on the shared theme state and app shell.
- US1 is the MVP and should be delivered first.
- US2 depends on the theme toggle and shared storage from US1.
- US3 depends on the settings route and navigation shell, but can be implemented in parallel with US2 after Phase 2.

## Parallel Execution Examples

- US1: `T010` and `T012` can proceed in parallel once `T006` is in place.
- US2: `T015` and `T017` can proceed in parallel after `T013`.
- US3: `T019` and `T021` can proceed in parallel after `T007`.

## Implementation Strategy

1. Deliver US1 first so the app has a working settings page and dark mode toggle.
2. Add US2 persistence next so the feature is durable across reloads.
3. Finish with US3 discoverability and verification polish so users can find the feature naturally.
4. Keep the implementation minimal: one settings page, one stored preference, and one global theme application path.
