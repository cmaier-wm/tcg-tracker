# Feature Specification: User Login And Account-Scoped Data

**Feature Branch**: `006-user-login`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "I want users to be able to log in. The current features associated to their user would be their portfolio and settings"

## Client Parity *(mandatory)*

- **Web Impact**: Keep registration, sign-in, sign-out, and account-protected portfolio/settings behavior available in the web app.
- **iOS Impact**: Provide registration, sign-in, sign-out, and account-protected portfolio/settings behavior in the native iOS client.
- **Shared Backend/API Impact**: Reuse the existing auth/session routes and account-backed data ownership model for both clients.
- **Parity Expectation**: `web + iOS`, while public browsing remains unauthenticated on both platforms.

## Clarifications

### Session 2026-04-08

- Q: What should happen to the existing shared default-user portfolio and settings data during login rollout? → A: Assign all existing shared portfolio/settings data to the first user who registers.
- Q: Should browsing the card catalog remain public after login is introduced? → A: Keep browsing public, but require login for portfolio/settings actions.
- Q: What is the account uniqueness rule? → A: One account per unique email address.
- Q: Who is allowed to register for an account? → A: Any visitor can register with a valid email/password.
- Q: What happens immediately after successful registration? → A: Automatically sign in right after successful registration.
- Q: How are email addresses compared for uniqueness and sign-in? → A: Trim surrounding whitespace and compare normalized lowercase email values.
- Q: Where does the user land after registration, sign-in, or sign-out? → A: Honor a validated `returnTo` destination for public pages; otherwise send successful auth to `/portfolio` and send sign-out to `/login`.
- Q: How long does an authenticated session remain valid? → A: Keep the session active for up to 30 days of inactivity, refreshing the inactivity window on authenticated use.
- Q: Are concurrent sessions for the same account allowed? → A: Yes. Multiple browser/device sessions may coexist, and sign-out ends only the current session.
- Q: Which settings are account-backed in v1? → A: Theme preference, Teams alert preferences, and Teams alert history are all account-backed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an account and sign in (Priority: P1)

As a collector, I want to create an account and sign in so that the app can associate my portfolio and settings with me instead of a shared default user.

**Why this priority**: Without account creation and sign-in, none of the current user-specific features can be scoped to an actual user identity.

**Independent Test**: Can be fully tested by registering a new account, signing in, reloading the app, confirming the session remains active, signing out, and signing back in with the same account.

**Acceptance Scenarios**:

1. **Given** a visitor without an account, **When** they submit valid registration details, **Then** the system creates the account and signs them in.
2. **Given** a registered user, **When** they submit valid login credentials, **Then** the system starts an authenticated session and shows the app as signed in.
3. **Given** a user enters invalid credentials, **When** they attempt to sign in, **Then** the system rejects the attempt and shows an actionable error without creating a session.
4. **Given** a visitor submits a malformed email address, a partial credential set, or a password shorter than 8 characters, **When** they attempt to register or sign in, **Then** the system rejects the submission and shows a clear validation error without creating an account or session.
5. **Given** a signed-in user chooses to sign out, **When** the sign-out completes, **Then** the current session ends, the user is redirected to `/login`, and protected portfolio/settings UI is replaced with the signed-out state.
6. **Given** a visitor starts sign-in or registration from a public card catalog or card detail page with a valid `returnTo` destination, **When** authentication succeeds, **Then** the app returns them to that originating public page without losing place.

---

### User Story 2 - Keep portfolio data private to the signed-in user (Priority: P2)

As a collector, I want my portfolio holdings and valuation history to belong only to my account so that other users do not see or overwrite my tracked cards.

**Why this priority**: Portfolio ownership is the most important user-specific data in the existing product and is the primary reason to add accounts.

**Independent Test**: Can be fully tested by creating two accounts, adding different holdings under each account, and confirming that each account only sees its own portfolio.

**Acceptance Scenarios**:

1. **Given** two different signed-in users, **When** each user adds cards to their portfolio, **Then** each portfolio view shows only that user’s holdings and valuation history.
2. **Given** a signed-in user, **When** they update or remove a holding, **Then** the change only affects their own portfolio records.
3. **Given** an unauthenticated visitor, **When** they try to access portfolio features, **Then** the system redirects them to sign in before showing portfolio data.
4. **Given** a newly registered user with no holdings, **When** they open portfolio features, **Then** the app shows an empty account-scoped portfolio state rather than shared legacy data.

---

### User Story 3 - Keep settings private to the signed-in user (Priority: P3)

As a collector, I want my app settings to belong to my account so that my preferences and notification configuration follow me when I sign in.

**Why this priority**: Once users can sign in, settings need the same account boundary as portfolio data to avoid shared or confusing state.

**Independent Test**: Can be fully tested by changing settings under one account, signing out, signing into another account, and confirming that the second account sees only its own settings.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they update account-scoped settings, **Then** those settings are saved to that user and restored on later sign-in.
2. **Given** two different users, **When** they configure different settings values, **Then** each user later sees only their own saved settings.
3. **Given** an unauthenticated visitor, **When** they try to access account settings, **Then** the system requires sign-in before showing or editing those settings.
4. **Given** a newly registered user with no saved account-backed settings, **When** they open settings, **Then** the app shows default account-backed theme and alert settings for that user.

---

### Edge Cases

- What happens when a visitor tries to register with an email address that already exists? The system rejects the duplicate registration and prompts them to sign in instead.
- What happens when a visitor submits malformed or partially entered credentials? The system rejects the submission with field-level validation errors and does not create or mutate any account or session state.
- What happens when a signed-in user signs out and another user signs in on the same browser? The second user must see only their own portfolio and settings, with no residual account data from the previous session.
- What happens to the current single default-user portfolio data? The system assigns the existing shared portfolio and settings records to the first user who successfully registers after login rollout.
- What happens if two visitors attempt the first registration at nearly the same time? The system allows only one successful legacy-data claim, and later registrations create clean accounts without inheriting the shared records.
- What happens if the legacy-data claim cannot update both portfolio and settings records successfully? The claim runs as an all-or-nothing transaction; if any part fails, no legacy records are reassigned and a later retry can claim the full dataset safely.
- What happens when an authenticated session expires while the user is editing portfolio or settings data? The system rejects the write, preserves the visible UI state when practical, and prompts the user to sign in again.
- What happens when the same user signs in from multiple browsers or devices? Each browser/device may hold its own active session, and signing out from one session does not revoke the others in v1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a visitor to create a user account with an email address and password.
- **FR-001a**: The system MUST treat the email address as the unique account identifier for registration and sign-in.
- **FR-001b**: The system MUST allow any visitor to register when they provide an email address in a valid email format and a password that satisfies the minimum password requirements; registration is not restricted to pre-approved users or domains in v1.
- **FR-001c**: The system MUST require registration passwords to contain at least 8 characters.
- **FR-001d**: The system MUST normalize email addresses by trimming surrounding whitespace and comparing a lowercase value for uniqueness checks and sign-in.
- **FR-001e**: The system MUST NOT require any registration credential beyond email address and password in v1; display name, email verification, MFA, and invite-only controls remain out of scope.
- **FR-002**: The system MUST allow a registered user to sign in and sign out.
- **FR-002a**: The system MUST automatically start an authenticated session immediately after successful account registration.
- **FR-002b**: The system MUST redirect a successfully signed-out user to `/login`, invalidate only the current session, and render signed-out navigation and protected-feature entry points.
- **FR-002c**: The system MUST return a user to a validated public-page `returnTo` destination after successful sign-in or registration when that destination originated from the public card catalog or a public card detail page; otherwise the post-auth destination MUST be `/portfolio`.
- **FR-002d**: The system MUST allow multiple concurrent sessions for the same account across different browsers or devices in v1.
- **FR-003**: The system MUST persist authenticated session state across page reloads until the user signs out or the session expires.
- **FR-003a**: The system MUST expire authenticated sessions after 30 days of inactivity and refresh the inactivity window on authenticated use.
- **FR-003b**: The system MUST require re-authentication when an expired session reaches any protected portfolio/settings page load or portfolio/settings API request.
- **FR-003c**: The system MUST reject writes attempted after session expiry and preserve in-browser portfolio/settings edit state when practical so the user can retry after signing in again.
- **FR-004**: The system MUST associate portfolio holdings and portfolio valuation snapshots with the authenticated user instead of a shared default user during authenticated flows.
- **FR-004a**: The protected portfolio surfaces in v1 MUST include `/portfolio`, `/api/portfolio`, `/api/portfolio/[holdingId]`, and `/api/portfolio/history`, including valuation-history reads.
- **FR-004b**: A registered user with no holdings or valuation history MUST see an empty account-scoped portfolio state rather than shared legacy data.
- **FR-005**: The system MUST scope portfolio reads and writes so that one authenticated user cannot access or mutate another user’s portfolio data through normal product routes.
- **FR-006**: The system MUST scope server-backed account settings reads and writes to the authenticated user.
- **FR-006a**: The account-backed settings surfaces in v1 MUST include theme preference, Teams alert preferences, and Teams alert history.
- **FR-006b**: A registered user with no saved account-backed settings MUST see empty/default account-backed settings rather than another user’s or the legacy shared state.
- **FR-007**: The system MUST require authentication before showing or mutating portfolio and server-backed settings features, redirecting unauthenticated page requests to sign in and rejecting unauthenticated API requests.
- **FR-007a**: The system MUST continue allowing unauthenticated visitors to browse the card catalog and card detail pages.
- **FR-007b**: Public card catalog and card detail pages MAY show add-to-portfolio affordances while signed out, but using those affordances MUST redirect the visitor to sign in and preserve a validated `returnTo` destination back to the originating public page.
- **FR-008**: The system MUST reject duplicate account registration attempts for an existing normalized email address.
- **FR-009**: The system MUST store passwords using a one-way password hash and MUST NOT persist passwords in plain text.
- **FR-009a**: The system MUST use an adaptive salted password hash implementation such as `bcryptjs` and MUST NOT log plaintext passwords or password hashes.
- **FR-009b**: The system MUST protect authenticated sessions with secure server-managed cookies and app-owned signing secrets; production authenticated traffic MUST run over HTTPS.
- **FR-009c**: Authentication secrets, session secrets, and database credentials MUST remain server-only configuration and MUST NOT be exposed to client bundles or copied into user-facing logs.
- **FR-010**: The system MUST assign the existing shared portfolio/settings data to the first user who successfully registers after login rollout and MUST ensure subsequent users do not inherit that legacy data.
- **FR-010a**: The first-user legacy-data claim MUST execute as a single atomic operation across portfolio and account-backed settings records so exactly one successful registration claims the full legacy dataset.
- **FR-010b**: If the legacy-data claim operation fails, the system MUST roll back all reassignment changes and leave the legacy dataset available for a later retry rather than partially assigning records.
- **FR-011**: The system MUST record structured server-side authentication audit events for failed sign-in attempts, unauthorized protected-route access attempts, and legacy-data claim success or failure without including plaintext passwords, password hashes, or raw session tokens.
- **FR-012**: The production deployment MUST provide the server-side configuration required for first-party authentication, including `AUTH_SECRET`, `DATABASE_URL`, executed database migrations, and HTTPS-backed app hosting before authenticated traffic is served.

### Key Entities *(include if feature involves data)*

- **User Account Credential**: Represents the login identity for a collector, including a unique email address, password hash, and account timestamps.
- **Authenticated Session**: Represents a signed-in browser session tied to a specific user account and expiry window.
- **User Portfolio Ownership**: Represents the relationship between a user account and that user’s holdings and valuation snapshots.
- **User Settings Ownership**: Represents the relationship between a user account and persisted account-scoped settings such as Teams alert preferences and future server-backed settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register and reach an authenticated app state in under 3 minutes during manual verification, and successful registration or sign-in submissions complete within 2 seconds once the page is loaded in local and production smoke checks.
- **SC-002**: In acceptance testing with at least two accounts, 100% of portfolio reads and writes remain isolated to the signed-in user.
- **SC-003**: In acceptance testing with at least two accounts, 100% of persisted account settings remain isolated to the signed-in user.
- **SC-004**: In acceptance testing, unauthenticated visitors are redirected to sign in for protected portfolio and settings pages in 100% of tested cases, and protected portfolio/settings API routes reject unauthenticated requests in 100% of tested cases.

## Assumptions

- The initial version will use first-party email/password authentication rather than OAuth or enterprise SSO.
- Password reset, email verification, MFA, and profile editing are out of scope for the first authentication slice unless later specified.
- Theme preference, Teams alert preferences, and Teams alert history all become account-backed settings surfaces in scope for this slice.
- Existing shared default-user data will be claimed by the first successfully registered account and will not be copied to later accounts.
