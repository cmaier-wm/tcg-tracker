<!--
Sync Impact Report
- Version change: 2.0.0 -> 2.1.0
- Modified principles:
  - Placeholder principle set -> I. Spec Before Code
  - Placeholder principle set -> II. Vertical Slice Delivery
  - III. Verification Is Mandatory -> III. Cross-Platform Parity Is Mandatory
  - Placeholder principle set -> IV. Explicit Simplicity
  - Placeholder principle set -> V. Traceable Context Sync
- Added sections:
  - None
- Expanded governance:
  - Engineering Standards
  - Workflow & Review Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated /Users/cmaier/Source/tcg-tracker/.specify/templates/plan-template.md
  - ✅ updated /Users/cmaier/Source/tcg-tracker/.specify/templates/spec-template.md
  - ✅ updated /Users/cmaier/Source/tcg-tracker/.specify/templates/tasks-template.md
  - ⚠ pending /Users/cmaier/Source/tcg-tracker/.specify/templates/commands/*.md
    Directory does not exist in this repository.
  - ✅ updated /Users/cmaier/Source/tcg-tracker/AGENTS.md
  - ✅ updated /Users/cmaier/Source/tcg-tracker/README.md
- Follow-up TODOs:
  - None
-->

# tcg-tracker Constitution

## Core Principles

### I. Spec Before Code
Every non-trivial change MUST begin with a feature spec under `specs/` and MUST
progress through plan and tasks artifacts before implementation starts. Code-only
work is allowed only for isolated fixes that do not change behavior, interfaces,
or project structure; those fixes MUST still document scope and verification in
the related commit or task notes. This keeps scope explicit and prevents design
drift before the repository has a stable implementation baseline.

### II. Vertical Slice Delivery
Work MUST be organized as independently valuable user stories ordered by
priority. Each story MUST define an independent test or verification path and
MUST remain shippable without requiring lower-priority stories. Cross-story
dependencies are allowed only when they are called out in the plan and justified
as foundational. This enforces MVP-first delivery and keeps partial progress
useful.

### III. Cross-Platform Parity Is Mandatory
Every product feature and behavior change MUST ship on both the web
application and the native iOS application in the same increment. Specs, plans,
and tasks MUST identify the web surface, the iOS surface, shared backend or API
changes, and verification for both clients.

Web-only or iOS-only delivery is prohibited unless the constitution is amended
or a time-bound exception is recorded in the plan's Complexity Tracking and
approved during review. Shared backend and API changes MUST be designed as the
common source of truth whenever behavior is expected to match across both
clients. Features lacking explicit cross-platform coverage are incomplete until
parity work or an approved exception is documented.

### IV. Explicit Simplicity
Plans, specs, and code MUST prefer the smallest design that satisfies the
current story and stated constraints. New dependencies, abstractions, services,
or directories MUST be justified in the implementation plan with the simpler
alternative that was rejected. Placeholder technology decisions in repo guidance
MUST be replaced with concrete values once chosen. This repo is currently in a
bootstrap state, so clarity about what is real matters more than broad
generality.

### V. Traceable Context Sync
Project guidance files, especially `AGENTS.md`, `README.md`, and generated plan
artifacts, MUST stay aligned with the latest accepted implementation direction.
When a plan changes the active stack, structure, commands, or working
constraints, the corresponding guidance MUST be updated in the same change set.
Every task list MUST use exact file paths and trace work back to a user story so
humans and agents can audit intent without guessing.

## Engineering Standards

The repository MUST record concrete technical decisions in the feature plan
before implementation begins, including language/runtime, primary dependencies,
storage, test approach, target platform, project type, and operating
constraints. `NEEDS CLARIFICATION` is acceptable only during planning; it MUST
not survive into implementation-ready tasks.

Implementation-ready plans and tasks MUST spell out required work for the web
client, the iOS client, and any shared backend or API surfaces. Specs MUST
declare parity expectations explicitly and default to both clients being in
scope.

User-facing web routes and flows MUST not emit browser console errors during
supported user journeys. Any feature that changes web UI behavior MUST define
how console cleanliness will be verified, preferably through automated browser
checks and otherwise through explicit manual verification steps. Known
exceptions are allowed only when documented in the plan with owner, reason, and
follow-up path.

Generated or maintained guidance files MUST reflect the currently adopted stack
and commands. If the project is still pre-implementation, repo-level guidance
MUST say so explicitly instead of presenting guessed commands or conventions as
facts.

## Workflow & Review Gates

The canonical workflow for new work is:
`spec.md -> plan.md -> research/data-model/contracts/quickstart -> tasks.md -> implementation`.

Before implementation starts, reviewers MUST confirm:
1. The Constitution Check in the plan passes or any exception is documented in
   Complexity Tracking.
2. User stories are independently testable and priority-ordered.
3. Web, iOS, and shared backend or API impact are defined for each story.
4. Verification tasks are defined for both web and iOS behavior in each story.
5. Web stories define console-clean verification or a documented exception.
6. Project guidance files affected by the plan are updated or explicitly marked
   for follow-up.

Before a change is considered complete, reviewers MUST confirm that the claimed
verification has been executed, that new complexity has a written justification,
and that documentation reflects the delivered behavior rather than the intended
behavior.

## Governance

This constitution overrides conflicting guidance in templates, agent instruction
files, and informal workflow notes. Amendments MUST include: the proposed text
change, the semantic version bump rationale, and any required template or
guidance synchronization. A change that redefines or removes a principle is a
MAJOR version change; a change that adds a principle or materially expands
governance is a MINOR version change; wording clarifications and non-semantic
sync updates are PATCH changes.

Compliance MUST be checked in every implementation plan and in code review for
changes that touch behavior, structure, or workflow. Any temporary exception
MUST be documented in the relevant plan under Complexity Tracking with a clear
expiration or follow-up path.

**Version**: 2.1.0 | **Ratified**: 2026-04-01 | **Last Amended**: 2026-04-15
