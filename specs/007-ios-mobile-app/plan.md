# Implementation Plan: iOS Mobile App

**Branch**: `007-ios-mobile-app` | **Date**: 2026-04-09 | **Spec**: [/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/spec.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/spec.md)
**Input**: Feature specification from `/specs/007-ios-mobile-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a first-party native iOS client for the existing TCG tracker so signed-in
collectors can review their collection summary, browse cards, inspect card
pricing, manage holdings, and adjust supported settings from an iPhone-first
experience aligned with the approved Figma Make design. To keep scope tight,
the implementation will reuse the current Next.js application as the only
backend and system of record, add only the smallest mobile-specific JSON
composition routes needed for startup and signed-in summary data, and keep the
native client online-first for the initial release.

## Technical Context

**Language/Version**: Swift 6 for the iOS client, TypeScript 5.9 on Node.js 22 LTS for backend additions  
**Primary Dependencies**: SwiftUI, Observation, Foundation networking, Swift Charts, existing Next.js 16, React 19, Prisma ORM, Auth.js, Zod backend stack  
**Storage**: Existing PostgreSQL 17 through the Next.js backend for account-owned data; secure session cookies on device; no offline source-of-truth storage in v1  
**Testing**: Vitest contract/integration coverage for backend mobile routes, Swift unit tests for client networking and state mapping, targeted manual verification for simulator and signed-in mobile flows  
**Target Platform**: iOS 17+ on iPhone devices, backed by the current Next.js app running locally on Node.js 22 and in Azure App Service on Linux  
**Project Type**: Native mobile app plus incremental API expansion inside the existing full-stack web application  
**Performance Goals**: Signed-in landing, browse, and card-detail mobile screens show useful content within 2 seconds on a normal local or production network after navigation; holding updates show visible confirmation within 2 seconds during smoke checks  
**Constraints**: Preserve account-owned auth, portfolio, and Teams settings behavior from the current web app; keep the first release iPhone-only and portrait-first; avoid introducing a second backend service; keep the mobile app online-first without offline mutation queues; follow the supplied Figma Make mobile layouts for navigation and visual hierarchy; keep backend contract changes minimal and traceable  
**Scale/Scope**: One new iOS app target, four mobile user stories, a two-tab primary mobile shell plus secondary settings navigation, current Pokemon-only catalog scope, and one signed-in collector account per session

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
specs/007-ios-mobile-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── mobile-api.openapi.yaml
│   └── mobile-navigation.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── auth/
│   ├── cards/
│   ├── mobile/
│   ├── portfolio/
│   └── settings/
├── cards/
├── login/
├── portfolio/
└── settings/

components/
├── auth/
├── cards/
├── charts/
├── portfolio/
└── settings/

ios/
└── TCGTracker/
    ├── App/
    ├── Features/
    │   ├── Auth/
    │   ├── Browse/
    │   ├── CardDetail/
    │   ├── Portfolio/
    │   └── Settings/
    ├── Models/
    ├── Networking/
    ├── State/
    └── Design/

lib/
├── auth/
├── mobile/
├── portfolio/
├── pricing/
├── tcgtracking/
└── teams/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Keep the current Next.js app as the only backend and
add a new top-level `ios/` application tree for the native client. Introduce a
small `lib/mobile/` composition layer plus `app/api/mobile/` routes for
signed-in bootstrap and summary data, while reusing current auth, cards,
portfolio, and Teams settings routes where they already match mobile needs.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New top-level `ios/` app directory | A native iOS client requires platform-specific app structure, assets, and tests | Extending the responsive web UI would not create an iOS app |
| Mobile-specific composition routes | The signed-in landing summary would otherwise require duplicated server-owned valuation logic in the client | Calling only existing granular routes keeps backend changes smaller on paper but pushes summary logic into Swift and increases startup complexity |

## Phase 0: Research Summary

- Native client choice: use SwiftUI for the mobile app because the requested
  outcome is an iOS app, not a responsive website wrapper, and the design
  reference already models native-feeling navigation and layout.
- Backend boundary: keep the existing Next.js app as the only source of truth
  for auth, portfolio, cards, and settings, adding mobile-specific routes only
  where the current route set would force duplicated server logic.
- Authentication model: reuse the current session-cookie auth behavior for the
  mobile client rather than adding a second token system for v1.
- Data freshness model: keep the mobile app online-first with explicit refresh
  behavior; defer offline write queues and conflict handling to later scope.
- Design source: treat the linked Figma Make file as the navigation and visual
  source of truth for tab structure, card detail layout, and mobile spacing.
- Verification model: combine backend contract coverage with native client
  networking/state tests and explicit manual simulator verification paths.

## Phase 1: Design Summary

- Add a native iOS app under `ios/TCGTracker/` organized by feature modules for
  auth, browse, card detail, portfolio, and settings.
- Introduce `lib/mobile/` helpers and `/api/mobile/session` plus
  `/api/mobile/home` routes so the native app can bootstrap signed-in state and
  collection summary without reproducing current server-side calculations.
- Reuse existing `/api/auth/login`, `/api/auth/logout`, `/api/cards`,
  `/api/cards/[category]/[cardId]`, `/api/cards/[category]/[cardId]/history`,
  `/api/portfolio`, `/api/portfolio/[holdingId]`,
  `/api/portfolio/history`, and `/api/settings/teams-alert` routes where their
  current contract already matches mobile needs.
- Mirror the Figma Make mobile design with a two-tab primary shell for browse
  and portfolio, pushed card-detail navigation, and a secondary settings
  destination from the signed-in shell.
- Keep iPad-specific layouts, Android, offline editing, and cross-platform
  theme sync out of scope for the first implementation pass.
- Document the local backend plus simulator workflow in `quickstart.md`.
- Update agent context after plan generation with `SPECIFY_FEATURE=007-ios-mobile-app`.

## Post-Design Constitution Check

- [x] Spec-first scope remains anchored to [/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/spec.md](/Users/cmaier/.codex/worktrees/2b13/tcg-tracker/specs/007-ios-mobile-app/spec.md).
- [x] User stories still map cleanly to independently testable slices:
      signed-in summary, browse/detail pricing, holding management, and
      settings management.
- [x] Verification is explicit in `quickstart.md` and will be backed by
      backend contract/integration tests plus native-client unit coverage.
- [x] Added complexity is documented above with rejected simpler alternatives.
- [x] Eventual implementation must update `README.md`, `AGENTS.md`, and any
      local-development guidance touched by the new iOS workflow in the same
      change set.
