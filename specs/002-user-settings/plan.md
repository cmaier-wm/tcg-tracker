# Implementation Plan: User Settings

**Branch**: `002-user-settings` | **Date**: 2026-04-03 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/spec.md](/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/spec.md)
**Input**: Feature specification from `/specs/002-user-settings/spec.md`

## Summary

Add a settings area that lets users toggle dark mode and keeps that preference on the same browser/device. The smallest viable implementation is a dedicated settings page, a shared theme preference layer that applies across the app, and browser-local persistence so returning users keep their chosen mode.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, PostgreSQL 17, Vitest, React Testing Library, Playwright  
**Storage**: Browser-local persisted user preference; no new server-side storage required for v1  
**Testing**: Vitest for unit/integration logic, React Testing Library for page/component behavior, Playwright for end-to-end verification  
**Target Platform**: Web application in modern browsers  
**Project Type**: Web application  
**Performance Goals**: Theme changes should be visible immediately, with preference restoration on initial load perceived as instantaneous  
**Constraints**: Must preserve current app navigation and existing Pokemon browsing/portfolio flows; no account requirement for v1; preference must survive page reloads on the same browser/device  
**Scale/Scope**: Single user-facing settings surface plus global theme application across the existing app shell

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and independently testable.
- [x] Verification is defined for each story and for any foundational work that could block later validation.
- [x] Added complexity, dependencies, services, or directories are explicitly justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`, `AGENTS.md`, and related guidance files in the same change set.

## Research

See [/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/research.md](/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/research.md).

## Design

See [/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/data-model.md](/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/data-model.md) and [/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/contracts/settings-page.md](/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/contracts/settings-page.md).

## Quickstart

See [/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/quickstart.md](/Users/cmaier/Source/tcg-tracker/specs/002-user-settings/quickstart.md).

## Project Structure

### Documentation (this feature)

```text
specs/002-user-settings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── settings-page.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── layout.tsx
├── settings/
│   └── page.tsx
└── globals.css

components/
├── settings/
│   ├── settings-page.tsx
│   └── theme-toggle.tsx
└── site-nav.tsx

lib/
└── settings/
    ├── theme-preference.ts
    └── theme-storage.ts

tests/
├── integration/
│   └── settings-page.test.tsx
├── contract/
│   └── settings-page.contract.test.ts
└── unit/
    └── theme-preference.test.ts
```

**Structure Decision**: Use the existing Next.js app router structure under `app/`, keep theme behavior in reusable `components/settings` and `lib/settings` modules, and add dedicated tests under the existing `tests/` tree. No new top-level service or package is needed.

## Complexity Tracking

No constitutional violations require justification.
