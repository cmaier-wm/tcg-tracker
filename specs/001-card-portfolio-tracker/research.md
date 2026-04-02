# Research: TCG Card Portfolio Tracker

## Decision: Use a single Next.js web application with App Router

**Rationale**: The feature is primarily a user-facing web product with a small
set of server responsibilities: fetching external card data, persisting
portfolio holdings, storing snapshots, and rendering responsive views. Next.js
supports full-stack web applications in one codebase, which keeps the initial
implementation simpler than splitting frontend and backend services while still
allowing server-rendered pages, route handlers, and browser interactivity.

**Alternatives considered**:

- Separate React SPA plus custom API service: rejected because it introduces two
  deployables and a network boundary before the product needs that complexity.
- Native mobile-first application: rejected because the requested feature set is
  better served by a responsive web app and there is no mobile-only requirement.

## Decision: Use TypeScript end-to-end

**Rationale**: The feature mixes UI logic, API integration, validation, and
portfolio calculations. Using TypeScript across server and client reduces model
drift and makes shared card, variation, and snapshot types easier to maintain.

**Alternatives considered**:

- JavaScript: rejected because the domain has many related data shapes and
  benefit from compile-time checks.
- Python backend plus TypeScript frontend: rejected because it recreates the
  split-service complexity already avoided by the single-app decision.

## Decision: Use PostgreSQL with Prisma ORM

**Rationale**: The product needs durable relational storage for cards tracked
locally, card variations, portfolio holdings, price snapshots, and portfolio
valuation snapshots. PostgreSQL handles relational integrity and time-series
query patterns well, while Prisma adds migrations and type-safe access that fit
the chosen TypeScript stack.

**Alternatives considered**:

- SQLite: rejected as the default target because it is attractive for local
  prototyping but less suitable as the baseline production datastore for
  concurrent web usage and scheduled snapshot ingestion.
- Document database: rejected because portfolio, variation, and snapshot data
  are relational and benefit from explicit foreign keys and structured queries.

## Decision: Use Docker Compose for local PostgreSQL, but run the app natively in development

**Rationale**: The project benefits from reproducible local database setup
without forcing the entire web app into containers before that complexity is
useful. A Docker-managed PostgreSQL instance removes host-specific database
setup drift while preserving the faster feedback loop of native Next.js
development.

**Alternatives considered**:

- No Docker at all: rejected because it increases onboarding friction and local
  environment inconsistency for the database.
- Full app plus database containerization from the start: rejected because it
  adds container rebuild, file watching, and debugging overhead before the team
  has a deployment need that requires it.

## Decision: Model historical charts from stored snapshots rather than relying on full source backfill

**Rationale**: The feature spec already assumes history may need to be built
  after the app starts tracking an item. Persisting daily price snapshots for
  tracked card variations and daily portfolio valuation snapshots gives the app
  deterministic chart data even if the upstream source only exposes current or
  limited pricing views.

**Alternatives considered**:

- On-demand current-price only charts: rejected because it cannot satisfy the
  historical graph requirement.
- Full external historical import: rejected because the source documentation
  does not promise a complete historical backfill mechanism for all games and
  variations.

## Decision: Use TanStack Query, Recharts, and Zod

**Rationale**: The application needs client-side refresh for interactive views,
clear chart rendering, and safe validation of external API payloads. TanStack
Query provides structured client-side cache and refresh behavior, Recharts is a
pragmatic charting library for price and valuation graphs, and Zod is a small
fit-for-purpose validation layer for upstream data parsing and internal request
contracts.

**Alternatives considered**:

- Hand-rolled fetch state and charting: rejected because it increases bespoke
  code in exactly the areas where mature libraries reduce risk.
- Heavier state-management frameworks: rejected because the feature does not yet
  justify global complexity beyond server data and local UI state.

## Decision: Use Vitest, React Testing Library, and Playwright for verification

**Rationale**: The constitution requires mandatory verification and the feature
  spans units of calculation, UI rendering, and end-to-end flows. Vitest is a
  fast fit for TypeScript logic and server-side utilities, React Testing Library
  verifies UI behavior at the component level, and Playwright covers the
  top-priority browsing, pricing, and portfolio workflows.

**Alternatives considered**:

- End-to-end tests only: rejected because portfolio math and parsing logic need
  faster and more targeted feedback loops.
- Unit tests only: rejected because the top-level user stories are UI-driven and
  need true browser validation.
