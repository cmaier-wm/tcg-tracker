# Implementation Plan: Microsoft Teams Portfolio Alerts

**Branch**: `005-teams-value-alert` | **Date**: 2026-04-07 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/spec.md](/Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/spec.md)
**Input**: Feature specification from `/specs/005-teams-value-alert/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a Microsoft Teams gain-alert integration to the existing portfolio tracker by
letting the default user save a Teams workflow webhook destination, persist an
alert baseline in PostgreSQL, and evaluate alert eligibility whenever portfolio
valuation snapshots are saved. The implementation will extend the existing
settings surface, reuse the current valuation snapshot flow as the alert
trigger, and record delivery attempts so the product can prevent duplicates and
show delivery status to the user.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, Zod, native `fetch`, Node `crypto`  
**Storage**: PostgreSQL 17 for Teams alert preferences, encrypted webhook destination, baseline state, and delivery history  
**Testing**: Vitest unit/integration tests, React Testing Library, Playwright end-to-end coverage, targeted manual webhook verification  
**Target Platform**: Next.js web app running locally on Node.js 22 and on Azure App Service on Linux  
**Project Type**: Full-stack web application with server-rendered UI and API routes  
**Performance Goals**: Alert evaluation adds less than 2 seconds to a snapshot run when a Teams destination is configured and does not degrade normal portfolio page rendering  
**Constraints**: No outbound Teams traffic unless the user explicitly enables alerts, no duplicate messages within the same notified gain range, preserve current single-user default-account model, keep the initial integration limited to one Teams destination per user  
**Scale/Scope**: One default user account, one Teams workflow destination per user, one delivery record per alert attempt, alert checks on each valuation snapshot save

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
specs/005-teams-value-alert/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── teams-alert-settings.openapi.yaml
│   └── teams-workflow-webhook.schema.json
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── snapshots/route.ts
│   └── settings/
│       └── teams-alert/route.ts
├── portfolio/page.tsx
└── settings/page.tsx

components/
└── settings/
    ├── settings-page.tsx
    └── teams-alert-settings.tsx

lib/
├── portfolio/
│   ├── db-portfolio.ts
│   ├── get-portfolio.ts
│   └── save-valuation-snapshot.ts
├── settings/
└── teams/
    ├── alert-delivery.ts
    ├── alert-preferences.ts
    ├── encrypt-webhook.ts
    └── evaluate-portfolio-alert.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── contract/
├── integration/
├── e2e/
└── unit/
```

**Structure Decision**: Keep the existing single Next.js application structure
and extend the current settings and valuation paths. Add a focused `lib/teams/`
module for webhook delivery, preference persistence, and threshold evaluation so
the new external-integration logic stays isolated from portfolio valuation math
and UI code.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `lib/teams/` module | Keeps outbound Teams delivery, encryption, and threshold state separate from core portfolio helpers | Reusing `lib/portfolio/` directly would mix external-notification concerns into valuation logic and make testing harder |
| Persistent delivery records | Needed to prevent duplicates and expose delivery failures in the product | Tracking only a single boolean status would not preserve enough history to reason about duplicate suppression or failed attempts |
| Encrypted webhook storage | Teams webhook destinations act as credentials and should not be stored as plain text | Plain database storage is simpler but leaves a reusable outbound messaging secret exposed to anyone with raw database access |

## Phase 0: Research Summary

- Teams integration target: user-provided Teams Workflow webhook URL that posts
  to a selected Teams chat or channel.
- Alert trigger location: evaluate delivery as part of valuation snapshot saves
  because `saveValuationSnapshot()` is the canonical place where current
  portfolio value is persisted.
- Secret handling: encrypt the stored webhook URL with an application-managed
  key before database persistence.
- Verification approach: combine automated tests for threshold logic, API
  persistence, and snapshot-triggered delivery with manual end-to-end workflow
  verification using a real Teams workflow destination.

## Phase 1: Design Summary

- Extend the data model with entities for Teams alert preferences and alert
  delivery attempts tied to the existing `UserAccount`.
- Add a settings API contract for reading/updating Teams alert configuration.
- Define a stable JSON payload schema for outbound POST requests to a Teams
  Workflow webhook trigger.
- Update agent context after plan generation with `SPECIFY_FEATURE=005-teams-value-alert`.

## Post-Design Constitution Check

- [x] Spec-first scope remains anchored to [/Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/spec.md](/Users/cmaier/Source/tcg-tracker/specs/005-teams-value-alert/spec.md).
- [x] User stories still map cleanly to isolated delivery slices: configuration,
      alert delivery, and duplicate suppression.
- [x] Verification is explicit in `quickstart.md` and will be backed by unit,
      integration, contract, and end-to-end coverage.
- [x] Added complexity is documented above with rejected simpler alternatives.
- [x] No repo-wide guidance changes are required at planning time, but the
      eventual implementation must update guidance files if new environment
      variables, operator steps, or development commands are introduced.
