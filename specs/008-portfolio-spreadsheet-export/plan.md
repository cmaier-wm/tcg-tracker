# Implementation Plan: Portfolio Spreadsheet Export

**Branch**: `008-portfolio-spreadsheet-export` | **Date**: 2026-04-09 | **Spec**: [/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/spec.md](/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/spec.md)
**Input**: Feature specification from `/specs/008-portfolio-spreadsheet-export/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a user-initiated portfolio export to the authenticated portfolio surface so
collectors can download their holdings as a spreadsheet-compatible file. The
implementation will add a dedicated authenticated export route plus a portfolio
UI trigger, reuse the existing account-scoped portfolio logic to produce all
holdings for the current user, and generate a CSV file with human-readable
holding and valuation columns without introducing a workbook dependency for v1.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, Auth.js session helpers, Zod, native `Response` and string handling for CSV output  
**Storage**: PostgreSQL 17 for authenticated portfolio holdings and latest price snapshots, with the existing in-memory demo-store fallback when the database is unavailable in non-production or test fallback paths  
**Testing**: Vitest unit/integration/contract tests, React Testing Library for portfolio UI states, Playwright end-to-end coverage for authenticated export flows, and targeted manual verification that the downloaded file opens in a spreadsheet application  
**Target Platform**: Next.js web app running locally on Node.js 22 and deployed to Azure App Service on Linux  
**Project Type**: Full-stack web application with server-rendered UI and route handlers  
**Performance Goals**: A signed-in user can start and complete export in under 30 seconds during manual verification, and export generation should complete within normal interactive request time for typical portfolio sizes without delaying portfolio page rendering  
**Constraints**: Preserve account isolation from the existing auth rollout, keep export limited to current holdings and latest valuation data, include all holdings instead of only the current paginated page, provide a distinct empty-state outcome instead of a misleading successful download, keep the v1 file spreadsheet-compatible without adding a new workbook dependency, and support both database-backed and demo-store-backed portfolio reads  
**Scale/Scope**: Initial release covers one on-demand export for the signed-in user's current holdings dataset, expected to remain small enough for an in-memory server-side CSV generation path in the current app

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

## Project Structure

### Documentation (this feature)

```text
specs/008-portfolio-spreadsheet-export/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── portfolio-export.openapi.yaml
│   └── portfolio-export-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   └── portfolio/
│       ├── route.ts
│       ├── [holdingId]/route.ts
│       ├── history/route.ts
│       └── export/route.ts
└── portfolio/page.tsx

components/
└── portfolio/
    ├── portfolio-export-button.tsx
    ├── portfolio-list.tsx
    ├── portfolio-pagination.tsx
    └── portfolio-sort.tsx

lib/
├── api/
│   ├── http-errors.ts
│   └── route-handler.ts
├── auth/
│   ├── auth-session.ts
│   └── route-guards.ts
└── portfolio/
    ├── db-portfolio.ts
    ├── export-portfolio.ts
    ├── get-portfolio.ts
    └── portfolio-sort.ts

tests/
├── contract/
│   └── portfolio-export.contract.test.ts
├── integration/
│   ├── portfolio-export-route.test.ts
│   ├── portfolio-export-button.test.tsx
│   └── portfolio-page.test.tsx
└── e2e/
    └── portfolio.spec.ts
```

**Structure Decision**: Keep the existing single Next.js application structure
and add a focused portfolio export slice within the current portfolio route/UI
surface. A dedicated `lib/portfolio/export-portfolio.ts` helper is preferable
to embedding CSV shaping inside the route handler because it keeps account-
scoped data mapping reusable across contract, integration, and UI-triggered
tests without introducing a new service boundary or directory tree.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `app/api/portfolio/export/route.ts` route | Download responses need file-specific headers and a dedicated contract separate from JSON holding CRUD | Overloading `app/api/portfolio/route.ts` would mix JSON CRUD and file-download concerns in one handler |
| New `lib/portfolio/export-portfolio.ts` helper | Centralizes export row mapping, CSV escaping, filename generation, and empty-state checks for both DB and demo fallback flows | Building CSV inline inside the route would duplicate portfolio-shaping logic and make route tests harder to isolate |

## Phase 0: Research Summary

- Export format: use CSV as the v1 spreadsheet-compatible format so files open
  in Excel, Numbers, and Google Sheets without adding a new workbook library.
- Delivery mechanism: expose a dedicated authenticated `GET
  /api/portfolio/export` route that returns a file download response and can be
  triggered directly from the portfolio page.
- Export scope: include all holdings owned by the current authenticated user,
  not only the currently paginated portfolio page, while allowing row ordering
  to follow the same sort choices the portfolio screen already supports.
- Export columns: include card-identifying fields plus quantity and latest
  valuation data available from the current holding source so each row is both
  human-readable and auditable outside the app.
- Empty portfolios: present a distinct empty-state outcome and avoid generating
  a misleading success download when the account has no holdings.
- Error and auth handling: require the existing auth guards for export and
  treat expired or missing sessions as non-download outcomes with clear
  user-facing feedback.

## Phase 1: Design Summary

- Model export as a non-persistent request/result flow built from the current
  portfolio and latest price snapshot data instead of adding new database
  tables.
- Add an export route contract that documents success headers, CSV response
  semantics, empty-portfolio behavior, and authentication failures.
- Add a portfolio UI contract that defines where the export action appears,
  when it is disabled or hidden, and how empty or error feedback is surfaced.
- Reuse existing account-scoped portfolio retrieval, but introduce an
  export-specific mapper that returns all holdings plus card-identifying fields
  needed for spreadsheet rows.
- Define quickstart verification that covers DB-backed and demo-fallback
  behavior, downloaded-file inspection, and cross-account isolation checks.
- No stack or operator-command changes are expected; implementation should keep
  `README.md`, `AGENTS.md`, and `docs/development/mcps.md` unchanged unless the
  final code introduces new commands or tooling.

## Post-Design Constitution Check

- [x] Spec-first scope remains anchored to [/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/spec.md](/Users/cmaier/.codex/worktrees/f921/tcg-tracker/specs/008-portfolio-spreadsheet-export/spec.md).
- [x] User stories still map cleanly to isolated slices: successful export,
      account-scoped data isolation, and empty-state feedback.
- [x] Verification is explicit in `quickstart.md` and will be backed by unit,
      integration, contract, end-to-end, and manual spreadsheet-open checks.
- [x] Added complexity is documented above with rejected simpler alternatives.
- [x] No new stack or command changes are planned; if implementation changes
      that assumption, repo guidance must be updated in the same change set.
