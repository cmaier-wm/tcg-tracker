# Implementation Plan: Product Type Filter

**Branch**: `010-product-type-filter` | **Date**: 2026-04-16 | **Spec**: [spec.md](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/spec.md)
**Input**: Feature specification from `/specs/010-product-type-filter/spec.md`

## Summary

Add a home-page product-type filter that switches the browse result set between
Cards and Sealed Product, default Cards on first load, and preserve existing
search and sort context while the filter changes. The smallest implementation is
to add a shared `productType` browse parameter, extend the existing catalog list
contract so both web and iOS can render mixed catalog item types, and scope the
new control to the home page while keeping card-detail behavior card-only.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS for web/backend and Swift 6 for iOS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, PostgreSQL 17, Vitest, React Testing Library, Playwright, SwiftUI, Observation, Foundation networking  
**Storage**: Existing PostgreSQL catalog plus demo-store fallback; no new persisted user preference storage required  
**Testing**: Vitest unit and integration tests, contract coverage for browse query handling, Playwright verification for web UI and console cleanliness, Swift XCTest plus iOS Simulator smoke verification  
**Client Scope**: `web + iOS REQUIRED`  
**Target Platform**: Next.js App Router web app in modern desktop/mobile browsers plus the native iOS client backed by the same HTTP API  
**Project Type**: Full-stack web application with a native iOS client  
**Performance Goals**: Home-page default load and product-type changes should remain within current browse responsiveness, with result refreshes feeling immediate and infinite-scroll fetches preserving the selected filter without visible ordering glitches  
**Constraints**: Keep scope limited to the home-page browse experience, preserve active search and sort state when product type changes, avoid new services or storage, keep `/cards` behavior stable unless explicitly broadened later, and maintain browser-console-clean web verification  
**Scale/Scope**: One home-page browse route, one shared cards API route, one shared catalog access layer, one iOS browse screen, and targeted automated/manual verification for the new filter dimension

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and independently testable.
- [x] Web, iOS, and shared backend or API impact are defined for each story.
- [x] Verification is defined for both web and iOS behavior in each story and for any foundational work that could block later validation.
- [x] Affected web routes and flows define browser console-clean verification or a documented, approved exception.
- [x] Added complexity, dependencies, services, or directories are explicitly justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`, `AGENTS.md`, and related guidance files in the same change set.

## Phase Outputs

- **Research**: [research.md](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/research.md)
- **Data Model**: [data-model.md](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/data-model.md)
- **Contracts**: [home-product-type-filter.md](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/contracts/home-product-type-filter.md)
- **Quickstart**: [quickstart.md](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/specs/010-product-type-filter/quickstart.md)

## Client Delivery Plan

### Shared Backend/API Changes

Introduce a normalized `productType` browse parameter with two supported values:
`card` and `sealed-product`. Thread that parameter through the existing
home-page server render, infinite-scroll API calls, shared catalog access
helpers, and iOS browse requests. Keep the existing `/api/cards` route for this
increment to avoid a broader endpoint migration, but broaden the returned list
item contract to include `productType` and to tolerate sealed-product rows whose
card-only fields are absent. Preserve card detail and price-history endpoints as
card-only contracts; sealed rows remain browse-only until a separate sealed
detail feature is specified. The user-visible label `Cards` maps to the shared
request value `productType=card`.

### Web Delivery Surface

Implement the filter on the home page by extending
[app/page.tsx](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/page.tsx),
[components/cards/cards-browser-page.tsx](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/cards-browser-page.tsx),
[components/cards/catalog-filters.tsx](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/catalog-filters.tsx),
and [components/cards/infinite-card-list.tsx](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/components/cards/infinite-card-list.tsx).
Scope the control to `/` via props so [app/cards/page.tsx](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/app/cards/page.tsx)
can remain card-only. Update the home-page empty state copy to reference the
selected product type, and adjust result-row rendering so sealed-product entries
render safely without assuming collector number, rarity, or card-detail
navigation. This includes explicit web browse-row handling so sealed-product
rows do not link to card-detail routes.

### Web Console Verification

Verify `/` with Playwright after implementation in three flows: default load
with Cards active, switch to Sealed Product, and switch product type while a
search term or sort is active. Each flow must confirm no browser console errors,
the URL/query state matches the selected filter behavior, and the visible result
set updates without a full-page navigation regression.

### iOS Delivery Surface

Extend [ios/TCGTracker/Models/APIModels.swift](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Models/APIModels.swift),
[ios/TCGTracker/Networking/APIClient.swift](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Networking/APIClient.swift),
[ios/TCGTracker/State/BrowseStore.swift](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/State/BrowseStore.swift),
and [ios/TCGTracker/Features/Browse/BrowseView.swift](/Users/cmaier/.codex/worktrees/a9f6/tcg-tracker/ios/TCGTracker/Features/Browse/BrowseView.swift)
with the same two-value product-type selection and default Cards behavior.
Preserve the current query and sort state when product type changes. When the
selected row is a card, keep existing card-detail navigation. When the selected
row is a sealed product, render the row without invoking card-detail navigation
in this increment. This behavior requires explicit browse-row interaction logic
and verification in the iOS browse surface.

### Parity Verification

Parity is satisfied when both clients expose the same two product-type choices,
default to Cards on initial home/browse load, preserve search and sort when the
product type changes, and render an understandable empty state when the selected
type has no results. Web verification will use automated tests plus Playwright;
iOS verification will use Swift XCTest for state changes and iOS Simulator smoke
checks for the browse UI.

## Project Structure

### Documentation (this feature)

```text
specs/010-product-type-filter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── home-product-type-filter.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── page.tsx
├── cards/
│   └── page.tsx
└── api/
    └── cards/
        └── route.ts

components/
└── cards/
    ├── card-empty-state.tsx
    ├── cards-browser-page.tsx
    ├── catalog-filters.tsx
    └── infinite-card-list.tsx

lib/
└── tcgtracking/
    ├── db-catalog.ts
    ├── get-card-catalog.ts
    ├── mappers.ts
    └── search-query.ts

tests/
├── contract/
│   └── cards-search.contract.test.ts
├── e2e/
│   └── home-product-type-filter.spec.ts
├── integration/
│   ├── cards-browser-page.test.tsx
│   └── catalog-filters.test.tsx
└── unit/
    └── search-query.test.ts

ios/
├── TCGTracker/
│   ├── Features/
│   │   └── Browse/
│   │       └── BrowseView.swift
│   ├── Models/
│   │   └── APIModels.swift
│   ├── Networking/
│   │   └── APIClient.swift
│   └── State/
│       └── BrowseStore.swift
└── TCGTrackerTests/
    └── BrowseStoreTests.swift
```

**Structure Decision**: Keep the feature inside the existing browse vertical
slice. Extend the current home page, shared card-browse components, shared
catalog helpers, and iOS browse store instead of introducing a separate catalog
service or new top-level module. This is the smallest approach that still
maintains cross-platform parity.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |
