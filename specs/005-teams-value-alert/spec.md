# Feature Specification: Microsoft Teams Portfolio Alerts

**Feature Branch**: `005-teams-value-alert`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Create a Microsoft Teams integration so that whenever my portfolio value goes up by more than $1,000, I get a message"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receive a gain alert in Teams (Priority: P1)

As a portfolio owner, I want to receive a Microsoft Teams message when my portfolio value increases by more than $1,000 so that I notice meaningful gains without having to watch the app constantly.

**Why this priority**: This is the core user outcome. Without alert delivery, the integration provides no value.

**Independent Test**: Can be fully tested by enabling the integration, creating a portfolio value increase greater than $1,000, and confirming that a Teams message is delivered with the gain details.

**Acceptance Scenarios**:

1. **Given** the user has enabled Teams alerts and selected a valid message destination, **When** the portfolio value rises by more than $1,000 above the last notified value, **Then** the system sends one Teams message that reports the updated portfolio value and the amount gained.
2. **Given** the user has enabled Teams alerts and selected a valid message destination, **When** the portfolio value rises by $1,000 or less above the last notified value, **Then** the system does not send a Teams message.

---

### User Story 2 - Control whether alerts are active (Priority: P2)

As a portfolio owner, I want to enable or disable Teams alerts so that I can decide whether the app sends external notifications.

**Why this priority**: Users need control over outbound messaging and should not receive notifications unless they opt in.

**Independent Test**: Can be fully tested by turning the alert setting on and off and confirming that only the enabled state allows alert delivery.

**Acceptance Scenarios**:

1. **Given** the user has disabled Teams alerts, **When** the portfolio value rises by more than $1,000, **Then** the system does not send a Teams message.
2. **Given** the user has enabled Teams alerts after previously disabling them, **When** the next qualifying increase occurs, **Then** the system resumes sending Teams messages.

---

### User Story 3 - Avoid duplicate notifications for the same gain range (Priority: P3)

As a portfolio owner, I want the app to avoid repeating the same alert while my portfolio remains within an already-notified gain range so that Teams messages stay useful instead of noisy.

**Why this priority**: Duplicate alerts would reduce trust in the integration and make the signal hard to use.

**Independent Test**: Can be fully tested by triggering one qualifying increase, running additional portfolio refreshes without another $1,000 gain beyond the last notification point, and confirming that no duplicate Teams message is sent.

**Acceptance Scenarios**:

1. **Given** the system has already sent an alert for the current gain range, **When** the portfolio refreshes again without increasing another $1,000 beyond the last notified value, **Then** the system does not send a duplicate Teams message.
2. **Given** the system has already sent an alert and the portfolio later rises another $1,000 beyond the last notified value, **When** the next evaluation runs, **Then** the system sends a new Teams message for the new gain range.

---

### Edge Cases

- What happens when the Teams destination becomes unavailable or rejects the message? The system records the failed attempt, does not mark the alert as delivered, and allows a later qualifying evaluation to retry.
- How does the system handle a portfolio value drop after an alert has been sent? A decrease does not trigger a message and does not count as a new gain threshold until the portfolio later rises more than $1,000 above the last notified value.
- What happens when the integration is enabled before any prior alert baseline exists? The system treats the current portfolio value at enablement time as the starting comparison point and waits for a later increase greater than $1,000 before sending the first message.
- What happens when the portfolio value changes by exactly $1,000? The system does not send an alert because the threshold is for increases greater than $1,000.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to enable or disable Microsoft Teams portfolio gain alerts.
- **FR-002**: The system MUST allow a user to connect and maintain one Microsoft Teams message destination for portfolio gain alerts.
- **FR-003**: The system MUST evaluate portfolio value changes against a stored comparison point for each user with Teams alerts enabled.
- **FR-004**: The system MUST send a Teams message when the portfolio value increases by more than $1,000 above the last notified value.
- **FR-005**: The system MUST NOT send a Teams message when the increase is $1,000 or less above the last notified value.
- **FR-006**: The system MUST include, at minimum, the current portfolio value, the amount gained since the last notification baseline, and the time of evaluation in each Teams alert.
- **FR-007**: The system MUST update the user’s notification baseline only after a Teams alert is successfully delivered.
- **FR-008**: The system MUST prevent duplicate alerts for repeated evaluations that do not exceed another $1,000 increase above the last notified value.
- **FR-009**: The system MUST preserve the user’s alert preference and Teams destination across sessions until the user changes or removes them.
- **FR-010**: The system MUST expose alert delivery failures to the user in a way that makes it clear that notifications are not currently being delivered.

### Key Entities *(include if feature involves data)*

- **Teams Alert Preference**: Represents whether a user wants Teams portfolio gain alerts, the selected Teams destination, and the current delivery status of the integration.
- **Alert Baseline**: Represents the portfolio value reference point used to determine whether the next gain exceeds the $1,000 notification threshold.
- **Alert Delivery Record**: Represents an attempted Teams alert, including the evaluated gain amount, delivery outcome, destination, and time of attempt.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of portfolio increases greater than $1,000 above the last notified value produce one Teams message during acceptance testing.
- **SC-002**: 0 duplicate Teams messages are sent during repeated portfolio evaluations that stay within the same already-notified gain range during acceptance testing.
- **SC-003**: A user can enable the integration, trigger a qualifying gain, and confirm message delivery in under 5 minutes during manual verification.
- **SC-004**: In acceptance testing, users can identify a failed Teams alert delivery from the product interface without inspecting logs or external systems.

## Assumptions

- The initial version supports one Teams destination per user rather than multiple destinations or routing rules.
- The portfolio owner is the only user type in scope for receiving these alerts.
- The app already has a reliable way to determine the user’s current portfolio value during normal product operation.
- The starting comparison point for alerting is established when the user first enables Teams alerts or reconnects the destination.
