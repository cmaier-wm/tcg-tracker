# Implementation Plan: TCG Card Portfolio Tracker

**Branch**: `001-card-portfolio-tracker` | **Date**: 2026-04-02 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker/spec.md](/Users/cmaier/Source/tcg-tracker/specs/001-card-portfolio-tracker/spec.md)
**Input**: Feature specification from `/specs/001-card-portfolio-tracker/spec.md`

## Summary

Build a full-stack web application that lets collectors browse TCG cards and
their variations, inspect current and historical pricing, and track a personal
portfolio with current and historical valuation. The recommended stack is a
single TypeScript web app using Next.js for UI and server routes, PostgreSQL
for relational portfolio and snapshot storage, Prisma ORM for data access, and
Vitest plus Playwright for verification.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, PostgreSQL,
TanStack Query, Recharts, Zod, Docker Compose for local database services  
**Storage**: PostgreSQL 17 for application data and time-series snapshots,
run locally via Docker Compose by default  
**Testing**: Vitest, React Testing Library, Playwright  
**Target Platform**: Responsive web application for modern desktop and mobile browsers  
**Project Type**: Full-stack web application  
**Performance Goals**: Catalog search results and card detail views render in
under 2 seconds on typical broadband; portfolio summary renders in under 2
seconds for portfolios up to 1,000 holdings  
**Constraints**: Must tolerate missing external price history or image data,
must preserve exact card-variation identity for holdings, must support daily
snapshot ingestion without manual intervention, must remain simple enough to
ship as a single deployable web app, and must not require manual local database
installation for development  
**Scale/Scope**: Initial release targets a single collector account model,
supports multiple TCG categories from the external source, and stores daily
price and portfolio snapshots for tracked items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does
      not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and
      independently testable.
- [x] Verification is defined for each story and for any foundational work that
      could block later validation.
- [x] Added complexity, dependencies, services, or directories are explicitly
      justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`,
      `AGENTS.md`, and related guidance files in the same change set.

Post-design re-check: PASS. The generated research, data model, contracts,
quickstart, and synced guidance files remain consistent with the constitution.

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
