# Implementation Plan: Results Sorting

**Branch**: `003-results-sorting` | **Date**: 2026-04-03 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/spec.md](/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/spec.md)
**Input**: Feature specification from `/specs/003-results-sorting/spec.md`

## Summary

Add a user-visible sort control to the Pokemon browse experience, default the
home page to highest price first, and support bidirectional sorting for price,
name, number, set, and rarity while keeping output stable for mixed priced and
unpriced result sets. The smallest implementation is a query-string-backed sort
parameter, shared sorting logic in the catalog access layer, and targeted
contract/integration coverage for both server-rendered and infinite-scroll
result loading.

## Retroactive Parity Amendment

This feature now requires the same sort fields, directions, and default
price-desc ordering in the native iOS browse experience using the existing
catalog sort contract.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, PostgreSQL 17, Vitest, React Testing Library, Playwright  
**Storage**: Existing PostgreSQL catalog plus demo-store fallback; no new persisted storage required  
**Testing**: Vitest unit tests for sorting helpers, integration tests for browse page behavior, contract tests for catalog query handling, Playwright for browser verification  
**Target Platform**: Web application in modern desktop and mobile browsers  
**Project Type**: Web application  
**Performance Goals**: Initial result ordering should remain responsive for the first visible page and infinite-scroll fetches should preserve a predictable order without noticeable UI lag  
**Constraints**: Must preserve current search/set filters, work in both Prisma-backed and demo fallback paths, avoid introducing new services or dependencies, and keep infinite-scroll pagination behavior coherent with selected sort order  
**Scale/Scope**: One browse/results surface, one cards API route, one shared bidirectional sorting model covering five fields, and associated automated verification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and independently testable.
- [x] Verification is defined for each story and for any foundational work that could block later validation.
- [x] Added complexity, dependencies, services, or directories are explicitly justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`, `AGENTS.md`, and related guidance files in the same change set.

## Research

See [/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/research.md](/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/research.md).

## Design

See [/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/data-model.md](/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/data-model.md) and [/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/contracts/cards-sorting.md](/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/contracts/cards-sorting.md).

## Quickstart

See [/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/quickstart.md](/Users/cmaier/Source/tcg-tracker/specs/003-results-sorting/quickstart.md).

## Project Structure

### Documentation (this feature)

```text
specs/003-results-sorting/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cards-sorting.md
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
├── integration/
│   └── cards-browse.test.tsx
└── unit/
    └── search-query.test.ts
```

**Structure Decision**: Keep all sorting behavior inside the existing browse and
catalog layers. Extend the existing App Router pages, cards API route, and
`lib/tcgtracking` catalog path rather than adding new top-level modules. This
preserves the current vertical slice and avoids introducing a separate sorting
service for a single results surface.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Application-layer sort before pagination for all sort fields | Preferred-variation price is derived after catalog loading, collector numbers require natural comparison, and rarity needs app-defined ranking, so the feature needs one consistent sorter across database and demo paths | Database-only ordering was rejected because it would require multiple field-specific query strategies and still would not cover the demo fallback without duplicate logic |
