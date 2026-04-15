# Implementation Plan: Pokemon Card Portfolio Tracker

**Branch**: `001-card-portfolio-tracker` | **Date**: 2026-04-02 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker/spec.md](/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker/spec.md)
**Input**: Feature specification from `/specs/001-card-portfolio-tracker/spec.md`

## Summary

Build a full-stack product surface that lets collectors browse Pokemon cards,
inspect current and historical pricing, and track a personal portfolio with
current and historical valuation across web and iOS. Internal variation records
may remain in the data model, but variant-specific UX is not part of the
intended product. The recommended stack is a single TypeScript web app using
Next.js for UI and server routes, PostgreSQL for relational portfolio and
snapshot storage, Prisma ORM for data access, and Vitest plus Playwright for
verification, with the native iOS client consuming the same backend contracts.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, PostgreSQL,
TanStack Query, Recharts, Zod, Docker Compose for local database services  
**Storage**: PostgreSQL 17 for application data and time-series snapshots,
run locally via Docker Compose by default  
**Testing**: Vitest, React Testing Library, Playwright  
**Client Scope**: web + iOS, with the portfolio celebration/fireworks effect as a documented desktop-only exception
**Target Platform**: Responsive web application for modern desktop and mobile browsers plus a native iPhone client
**Project Type**: Full-stack web application plus native iOS client
**Performance Goals**: Catalog search results and card detail views render in
under 2 seconds on typical broadband; portfolio summary renders in under 2
seconds for portfolios up to 1,000 holdings  
**Constraints**: Must tolerate missing external price history or image data,
must support daily snapshot ingestion without manual intervention, must remain
simple enough to ship as a single deployable web app plus native iOS client,
must not require manual local database installation for development, and must
keep variant-specific UX out of scope even if internal variation records remain
necessary for pricing/storage
**Scale/Scope**: Initial release targets a single collector account model,
supports only Pokemon from the external source, and stores daily price and
portfolio snapshots for tracked items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does
      not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and
      independently testable.
- [x] Web, iOS, and shared backend or API impact are defined for each story.
- [x] Verification is defined for both web and iOS behavior in each story and
      for any foundational work that could block later validation.
- [x] Added complexity, dependencies, services, or directories are explicitly
      justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`,
      `AGENTS.md`, and related guidance files in the same change set.

Post-design re-check: PASS. The generated research, data model, contracts,
quickstart, and synced guidance files remain consistent with the constitution
after retroactive parity amendments and explicit desktop-only exceptions.

## Client Delivery Plan

### Shared Backend/API Changes

Retain the existing card, pricing, and portfolio APIs as the shared source of
truth for both clients. Internal variation records may remain in the backend to
support pricing fidelity, but variant-specific UX and user choices are no
longer part of the product contract.

### Web Delivery Surface

Keep catalog browse, card detail, pricing history, and portfolio value/history
available on the web app. Remove or avoid user-facing variant-specific language
from the card detail and portfolio flows. Keep the portfolio celebration
animation explicitly desktop-only.

### iOS Delivery Surface

Deliver the same browse, card detail, pricing history, and portfolio
value/history behavior in the native iOS client without any variant-specific
controls or copy.

### Parity Verification

Verify that both web and iOS support browse, card images, current price,
historical price graph, portfolio holdings, total value, and portfolio value
history. Verify separately that the web-only celebration effect remains absent
from iOS.

## Project Structure

### Documentation (this feature)

```text
specs/001-card-portfolio-tracker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── app-api.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (marketing)/
├── cards/
│   ├── page.tsx
│   └── [category]/[cardId]/page.tsx
├── portfolio/
│   └── page.tsx
└── api/
    ├── cards/
    ├── portfolio/
    └── snapshots/

components/
├── cards/
├── charts/
└── portfolio/

lib/
├── tcgtracking/
├── pricing/
├── portfolio/
└── db/

prisma/
├── schema.prisma
└── migrations/

docker/
└── postgres/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Use a single Next.js application with App Router and
route handlers so UI, server-side data loading, and portfolio APIs stay in one
codebase. This is simpler than a split frontend/backend architecture and still
supports clean contracts, background snapshot ingestion, and independent story
delivery. Use Docker Compose only for local infrastructure, starting with
PostgreSQL, so onboarding stays simple without forcing containerized app
development.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Single full-stack framework instead of separate frontend/backend services | Keeps catalog browsing, portfolio APIs, and SSR pages in one deployable app | A split frontend/backend adds service boundaries before the product has proven complexity that requires them |
| PostgreSQL for snapshots and holdings instead of flat files or local-only storage | Holdings, card variations, and time-series snapshots are relational and need durable querying | Flat files make historical aggregation and concurrent updates fragile; SQLite is fine for local prototyping but weaker as the default production target |
