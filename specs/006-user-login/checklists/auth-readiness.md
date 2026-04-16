# Auth Readiness Checklist: User Login And Account-Scoped Data

**Purpose**: Validate that the login feature requirements and planning artifacts are complete, clear, and release-ready for first-party email/password authentication with account-scoped portfolio and settings.
**Created**: 2026-04-08
**Feature**: [spec.md](/Users/cmaier/Source/tcg-tracker/specs/006-user-login/spec.md)

**Note**: This checklist tests the quality of the written requirements and planning artifacts, not whether the implementation works.

## Requirement Completeness

- [x] CHK001 Are registration requirements complete about which credentials are required beyond email and password, including any password policy expectations? [Completeness, Spec §FR-001, Gap]
- [x] CHK002 Are sign-out requirements defined clearly enough to state where the user is returned and what signed-out UI state must be shown afterward? [Completeness, Spec §FR-002, Gap]
- [x] CHK003 Are session-expiry requirements complete about which routes or actions must trigger re-authentication and whether unsaved portfolio/settings edits must be recoverable? [Completeness, Spec §FR-003, Edge Cases]
- [x] CHK004 Are the requirements complete about which existing settings are account-backed in v1, including theme preference? [Completeness, Spec §FR-006, Spec §Assumptions]
- [x] CHK005 Are requirements defined for how the first successful registration claims legacy shared data if two visitors attempt registration at nearly the same time? [Gap, Spec §FR-010, Edge Case]

## Requirement Clarity

- [x] CHK006 Is "valid email and password" defined with objective validation criteria so registration behavior is not left to implementation guesswork? [Clarity, Spec §FR-001b, Ambiguity]
- [x] CHK007 Is "automatic sign-in after registration" clear about the destination page or post-registration landing state? [Clarity, Spec §FR-002a, Gap]
- [x] CHK008 Is "session remains active" clarified with an explicit expiry window or inactivity policy rather than leaving session lifetime implicit? [Clarity, Spec §FR-003, Ambiguity]
- [x] CHK009 Is "portfolio features" defined precisely enough to enumerate the protected surfaces for reads, writes, and valuation-history access? [Clarity, Spec §FR-004, Spec §FR-007, Contract §Protected Surfaces]
- [x] CHK010 Is "account settings" defined precisely enough to identify every protected settings surface and avoid future disagreement about scope? [Clarity, Spec §FR-006, Spec §FR-007, Gap]

## Requirement Consistency

- [x] CHK011 Do the public-browsing requirements stay consistent between the spec and the protected-routes contract so catalog/detail pages are never accidentally treated as protected surfaces? [Consistency, Spec §FR-007a, Contract §Protected Surfaces]
- [x] CHK012 Do the legacy-data rules stay consistent between the clarified spec, planning notes, and assumptions, especially around the first-user claim and non-inheritance by later users? [Consistency, Spec §FR-010, Spec §Assumptions, Plan §Constraints]
- [x] CHK013 Are the registration and duplicate-email requirements consistent about whether email comparison is case-sensitive or normalized before uniqueness checks? [Consistency, Spec §FR-001a, Spec §FR-008, Gap]
- [x] CHK014 Do the session requirements stay consistent between the spec and quickstart smoke checks about what "persisted across page reloads" means in local and deployed environments? [Consistency, Spec §FR-003, Quickstart §Production Smoke Check]

## Acceptance Criteria Quality

- [x] CHK015 Are success criteria measurable for sign-in performance beyond "under 3 minutes during manual verification," including any system-side timing or responsiveness expectation? [Measurability, Spec §SC-001, Ambiguity]
- [x] CHK016 Are the isolation success criteria traceable to explicit acceptance scenarios for both reads and writes across portfolio and settings? [Acceptance Criteria, Spec §SC-002, Spec §SC-003]
- [x] CHK017 Are protected-route outcomes measurable for both page requests and API requests, not just redirect behavior for browser pages? [Acceptance Criteria, Spec §SC-004, Contract §Expected Behavior]

## Scenario Coverage

- [x] CHK018 Are requirements documented for the full primary auth journey: register, auto-sign-in, reload with active session, sign out, and sign back in later? [Coverage, Spec §User Story 1]
- [x] CHK019 Are alternate-path requirements documented for signing in from a public card-detail or catalog context without losing the user’s place? [Coverage, Gap]
- [x] CHK020 Are requirements defined for users who never create a portfolio or never save account-backed settings after registering? [Coverage, Gap]

## Edge Case Coverage

- [x] CHK021 Are requirements documented for malformed or partially entered credentials on registration and sign-in, beyond the single "invalid credentials" scenario? [Edge Case, Spec §User Story 1, Gap]
- [x] CHK022 Are requirements defined for what happens if legacy shared data assignment partially succeeds across portfolio records and settings records? [Edge Case, Spec §FR-010, Recovery]
- [x] CHK023 Are requirements defined for concurrent sessions for the same account across multiple browsers or devices, or is that behavior intentionally out of scope? [Edge Case, Gap]

## Non-Functional Requirements

- [x] CHK024 Are security requirements complete enough to cover password hashing expectations, session-cookie protection, and secret-handling boundaries without relying on implementation convention alone? [Non-Functional, Spec §FR-009, Plan §Phase 0 Research Summary]
- [x] CHK025 Are observability requirements specified for authentication failures, legacy-data claim events, and unauthorized portfolio/settings access attempts? [Gap, Non-Functional]
- [x] CHK026 Are deployed-environment requirements sufficiently documented to identify all required production configuration values and migration preconditions for Azure App Service rollout? [Completeness, Quickstart §Deployed Environment Setup, Plan §Phase 1 Design Summary]

## Dependencies & Assumptions

- [x] CHK027 Is the assumption that theme preference is account-backed reflected consistently across requirements so reviewers can distinguish intentional server-backed settings scope from omissions? [Assumption, Spec §Assumptions, Spec §FR-006]
- [x] CHK028 Are external dependency assumptions for Auth.js session persistence, PostgreSQL availability, and HTTPS in production documented as requirements where rollout would otherwise fail? [Dependency, Plan §Technical Context, Quickstart §Deployed Environment Setup]

## Ambiguities & Conflicts

- [x] CHK029 Does the spec define whether login identifiers are normalized before comparison so "User@Example.com" and "user@example.com" cannot produce conflicting interpretations? [Ambiguity, Spec §FR-001a, Spec §FR-008]
- [x] CHK030 Is there any conflict between keeping browsing public and requiring login before portfolio mutation from card-detail pages that may contain add-to-portfolio affordances? [Conflict, Spec §FR-007, Spec §FR-007a]

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Items are numbered sequentially for easy reference
