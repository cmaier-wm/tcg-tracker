# Feature Specification: Password Reset

**Feature Branch**: `009-password-reset`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "password reset"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Request a reset link (Priority: P1)

As a returning collector who cannot sign in, I want to request a password reset so that I can regain access to my account without creating a new one.

**Why this priority**: Account recovery has no viable fallback today, so users who forget or lose their password are blocked from their portfolio and settings.

**Independent Test**: Can be fully tested by submitting a registered email address, observing a success confirmation, using the issued reset path, and confirming that the account can later sign in with a new password.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor on the sign-in page, **When** they choose the password reset option and submit their email address, **Then** the system accepts the request and shows a confirmation that does not reveal whether the email is registered.
2. **Given** a password reset request for a registered account, **When** the request is accepted, **Then** the account receives a time-limited reset path that can be used to choose a new password.
3. **Given** a password reset request for an email address that is not registered, **When** the request is submitted, **Then** the system shows the same confirmation response used for registered accounts and does not create a usable reset path.

---

### User Story 2 - Set a new password (Priority: P2)

As a collector with a valid reset path, I want to set a new password so that I can sign back in and continue using my existing account and data.

**Why this priority**: Reset delivery is only useful if it leads to a safe password change that restores account access without losing data ownership.

**Independent Test**: Can be fully tested by opening a valid reset path, entering a compliant new password, confirming the change succeeds, and then signing in with the new password while the old password no longer works.

**Acceptance Scenarios**:

1. **Given** a user opens a valid, unexpired reset path, **When** they submit a new password that meets password requirements, **Then** the system updates the account password and confirms that the account can sign in with the new password.
2. **Given** a user submits a new password that does not meet password requirements, **When** they attempt to complete the reset, **Then** the system rejects the submission and shows a specific validation message.
3. **Given** a user completes a password reset successfully, **When** they attempt to sign in with the prior password, **Then** the sign-in is rejected and the new password is required.

---

### User Story 3 - Handle expired or reused reset paths safely (Priority: P3)

As a collector, I want expired or already-used reset paths to fail safely so that my account cannot be reset through stale recovery links.

**Why this priority**: Recovery flows are security-sensitive, and invalid reset paths must fail predictably without exposing account details or allowing repeated use.

**Independent Test**: Can be fully tested by attempting to use an expired reset path and a previously used reset path, then verifying both are rejected with actionable recovery guidance.

**Acceptance Scenarios**:

1. **Given** a user opens an expired reset path, **When** they try to set a new password, **Then** the system rejects the attempt and directs them to request a new reset.
2. **Given** a user opens a reset path that has already been used successfully, **When** they try to reuse it, **Then** the system rejects the attempt and directs them to request a new reset.
3. **Given** multiple reset requests are made for the same account, **When** a newer reset path is issued, **Then** older outstanding reset paths are no longer accepted.

### Edge Cases

- What happens when a signed-in user visits the password reset request or completion flow? The system should redirect them to their signed-in destination rather than inviting unnecessary account recovery.
- What happens when a user requests multiple password resets in a short period? The system should avoid creating multiple simultaneously valid reset paths and should keep the user-facing confirmation generic.
- What happens when a user follows a malformed or tampered reset path? The system should reject the attempt safely and direct the user to request a new reset.
- What happens when a user resets their password while other sessions for that account still exist? Existing sessions should no longer provide continued access once the password reset has been completed.
- What happens when a user tries to reuse their current password as the new password? The system should reject the reset and require a different password.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a password reset entry point from the signed-out authentication experience.
- **FR-002**: The system MUST allow a signed-out user to submit their email address to request a password reset.
- **FR-003**: The system MUST respond to password reset requests with the same user-facing confirmation regardless of whether the submitted email address matches an existing account.
- **FR-004**: The system MUST issue a single-account password reset path only for existing accounts that are eligible to sign in with email and password.
- **FR-005**: The system MUST require password reset paths to expire after a limited recovery window.
- **FR-006**: The system MUST allow a user with a valid, unexpired reset path to set a new password for that account.
- **FR-007**: The system MUST enforce the same minimum password requirements during password reset that apply during registration.
- **FR-008**: The system MUST reject password reset completion when the reset path is missing, malformed, expired, revoked, or already used.
- **FR-009**: The system MUST invalidate any older outstanding reset paths for an account once a newer reset path is issued.
- **FR-010**: The system MUST invalidate all active authenticated sessions for an account after a successful password reset.
- **FR-011**: The system MUST allow the account to sign in with the new password immediately after a successful reset.
- **FR-012**: The system MUST reject sign-in attempts that use the prior password after a successful reset.
- **FR-013**: The system MUST reject password reset attempts that try to reuse the account’s current password as the new password.
- **FR-014**: The system MUST record server-side audit events for password reset request, success, expiry, invalid-path, and failure outcomes without exposing plaintext passwords, reset secrets, or raw session tokens in user-facing responses or logs.
- **FR-015**: The system MUST provide clear, actionable recovery messaging for invalid or expired reset paths, including how to request a new reset.
- **FR-016**: The system MUST preserve the user’s account-owned portfolio data and account-backed settings throughout the password reset process.

### Key Entities *(include if feature involves data)*

- **Password Reset Request**: Represents a recovery attempt for a specific email-address account, including issuance time, validity window, and whether it is still usable.
- **Password Reset Path**: Represents the one-time recovery path presented to the user to prove they are completing an issued reset request.
- **Recovered Account Session State**: Represents the currently active signed-in sessions for an account that must be invalidated after a successful password reset.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: During manual verification, a signed-out user can start the password reset flow from the sign-in page and complete a successful reset in under 5 minutes.
- **SC-002**: In acceptance testing, 100% of successful password resets allow sign-in with the new password and reject the prior password immediately afterward.
- **SC-003**: In acceptance testing, 100% of expired, reused, malformed, or revoked reset paths are rejected and direct the user to request a new reset.
- **SC-004**: In acceptance testing, password reset request responses are indistinguishable between registered and unregistered email addresses in 100% of tested cases.

## Assumptions

- Password reset will apply only to accounts that authenticate with email address and password; external identity-provider recovery is out of scope for this slice.
- The product will use the account email address as the recovery destination because email is already the unique account identifier.
- A successful password reset should revoke existing sessions so that account access is consistently re-established under the new password.
- Profile editing, email-address changes, MFA recovery, and broader account-management features remain out of scope for this feature unless specified later.
