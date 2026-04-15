# Feature Specification: Portfolio Spreadsheet Export

**Feature Branch**: `008-portfolio-spreadsheet-export`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Generate and download a spreadsheet of my portfolio"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download My Portfolio Spreadsheet (Priority: P1)

As a signed-in collector, I want to download my portfolio as a spreadsheet so I
can review, archive, and share my holdings outside the app.

**Why this priority**: The core user request is the ability to leave the app
with a usable copy of portfolio data. Without a successful download, the
feature does not deliver its intended value.

**Independent Test**: Can be fully tested by signing in with a portfolio that
contains holdings, starting the export, opening the downloaded file in a common
spreadsheet application, and confirming each holding appears as a row with its
key portfolio details.

**Acceptance Scenarios**:

1. **Given** a signed-in user with one or more portfolio holdings, **When**
   they request a portfolio export, **Then** the system downloads a
   spreadsheet-compatible file containing their current portfolio holdings.
2. **Given** a signed-in user opens the exported file, **When** the file loads
   in a common spreadsheet application, **Then** each exported row represents a
   portfolio holding with human-readable column headers.
3. **Given** a signed-in user has holdings with current valuation data, **When**
   they export their portfolio, **Then** the file includes quantity and current
   value information for each holding using the latest available portfolio view
   data.
4. **Given** a signed-in user successfully exports their portfolio, **When**
   the browser download starts, **Then** the app confirms success with a
   visible toast message.

---

### User Story 2 - Export Only My Account Data (Priority: P2)

As a signed-in collector, I want the exported spreadsheet to include only my
portfolio so that my download matches the account-scoped data I see in the app.

**Why this priority**: Account isolation is already a core product rule for
portfolio data. Export must preserve that boundary or it becomes a privacy and
trust issue.

**Independent Test**: Can be fully tested by creating two user accounts with
different holdings, exporting from each account, and confirming each file only
contains the holdings visible to that signed-in account.

**Acceptance Scenarios**:

1. **Given** two signed-in users with different portfolio holdings, **When**
   each user exports their portfolio, **Then** each downloaded file contains
   only that user's holdings.
2. **Given** an unauthenticated visitor, **When** they attempt to access the
   portfolio export action, **Then** the system requires sign-in before any
   portfolio spreadsheet is generated.
3. **Given** a signed-in user whose session is no longer valid, **When** they
   attempt to export their portfolio, **Then** the system does not generate a
   file and instead requires re-authentication.

---

### User Story 3 - Receive Useful Empty-State Feedback (Priority: P3)

As a signed-in collector, I want clear feedback when my portfolio has nothing
to export so I understand whether I should download an empty file or add cards
first.

**Why this priority**: Empty-state handling prevents confusion and reduces
support friction, but it is lower priority than a successful export for users
with holdings.

**Independent Test**: Can be fully tested by signing in to an account with no
portfolio holdings, requesting an export, and confirming the app communicates
the empty state clearly and consistently.

**Acceptance Scenarios**:

1. **Given** a signed-in user with no portfolio holdings, **When** they request
   a portfolio export, **Then** the system clearly indicates that there is no
   portfolio data available to export.
2. **Given** a signed-in user with no portfolio holdings, **When** they receive
   the empty-state response, **Then** the outcome does not imply that a file
   containing card data was successfully generated.

### Edge Cases

- A portfolio holding has no latest market value; the export still includes the
  holding and clearly indicates that current valuation data is unavailable.
- A user has multiple holdings for similar cards or variations; the export
  includes enough identifying information to distinguish them as separate rows.
- A user's session expires after the portfolio page loads but before the export
  request completes.
- A portfolio contains enough holdings that the export takes noticeably longer
  than a normal page action; the user still receives a clear success or failure
  outcome.
- A user requests export while their portfolio is empty because they are a new
  account or have removed all holdings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a portfolio export action to signed-in
  users from the portfolio experience.
- **FR-002**: The system MUST generate a spreadsheet-compatible download
  containing the signed-in user's current portfolio holdings.
- **FR-003**: The exported file MUST use human-readable column headers.
- **FR-004**: The exported file MUST include one row per portfolio holding.
- **FR-005**: Each exported holding row MUST include enough identifying data to
  distinguish the tracked card from other holdings with similar names.
- **FR-006**: Each exported holding row MUST include the recorded quantity for
  that holding.
- **FR-007**: Each exported holding row MUST include the latest available
  current valuation data shown for that holding, or clearly indicate when such
  valuation data is unavailable.
- **FR-008**: The exported file MUST reflect only the holdings owned by the
  currently authenticated user.
- **FR-009**: The system MUST require authentication before generating any
  portfolio export file.
- **FR-010**: The system MUST refuse to generate an export when the user's
  authenticated session is invalid or expired.
- **FR-011**: The system MUST provide a clear user-visible outcome when export
  generation fails so the user knows the spreadsheet was not produced.
- **FR-012**: The system MUST provide a clear user-visible empty-state outcome
  when the signed-in user has no portfolio holdings to export.
- **FR-013**: The export MUST represent the portfolio state as it exists at the
  time the export is generated rather than a stale or cached snapshot from a
  different user session.
- **FR-014**: The system MUST generate the spreadsheet file with a filename that
  makes it recognizable to the user as a portfolio export.
- **FR-015**: The system MUST show a visible success toast when a portfolio
  export download starts successfully.

### Key Entities *(include if feature involves data)*

- **Portfolio Export Request**: Represents a signed-in user's request to
  generate a downloadable spreadsheet of their current portfolio.
- **Exported Portfolio Holding Row**: Represents one holding in the downloaded
  spreadsheet, including card identification details, quantity, and current
  valuation fields.
- **Export Outcome**: Represents the user-visible result of an export attempt,
  including successful download, empty portfolio, authentication failure, or
  generation failure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual verification, a signed-in user with at least one
  holding can start and complete a portfolio export in under 30 seconds.
- **SC-002**: In acceptance testing with at least two user accounts, 100% of
  exported files contain only the holdings visible to the authenticated account
  that requested the export.
- **SC-003**: In manual verification, 100% of exported files open successfully
  in at least one common spreadsheet application and display readable column
  headers plus one row per expected holding.
- **SC-004**: In acceptance testing, 100% of export attempts from an empty
  portfolio return the defined empty-state outcome instead of implying a
  successful data export.

## Assumptions

- The initial release exports the current portfolio holdings view only; richer
  analytics-only exports, historical valuation exports, and scheduled exports
  are out of scope unless added later.
- The app already has enough account-scoped portfolio data available to produce
  the requested export without introducing new user-entered portfolio fields.
- A spreadsheet-compatible file that opens in common spreadsheet applications
  satisfies the user request; advanced formatting, formulas, and multi-sheet
  workbooks are not required for the first release.
- Export is a user-initiated download from the portfolio surface and does not
  require background delivery by email, Teams, or other destinations.
