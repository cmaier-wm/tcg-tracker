# Research: Microsoft Teams Portfolio Alerts

## Decision: Use a Microsoft Teams Workflow webhook as the delivery target

**Rationale**: Microsoft’s current Teams guidance recommends Workflows for new
webhook-triggered posting flows and notes that older Microsoft 365 connectors
are being retired. A user-created workflow webhook also fits the current
single-user app: the user can create a destination in Teams, copy the webhook
URL, and paste it into the app without requiring tenant-wide app registration
or delegated sign-in flows.

**Alternatives considered**:

- Microsoft Graph delegated posting: rejected because it adds Entra app
  registration, delegated consent, and signed-in-user messaging complexity that
  is unnecessary for the current single-destination alert use case.
- Teams bot / proactive messaging: rejected because it requires a full Teams app
  lifecycle and installation model that is larger than the current feature
  scope.

## Decision: Evaluate alert eligibility inside `saveValuationSnapshot()`

**Rationale**: The existing snapshot pipeline already computes and persists the
current portfolio value after pricing updates. Running threshold evaluation from
that path makes alerting depend on the same persisted valuation data shown in
the product and avoids creating a second, diverging portfolio-value job.

**Alternatives considered**:

- Evaluate alerts during page loads: rejected because user navigation should not
  trigger outbound notifications or duplicate delivery attempts.
- Create a separate scheduled alert evaluator first: rejected because it adds a
  second trigger path and deployment complexity before the current snapshot flow
  is exhausted.

## Decision: Persist Teams alert state in PostgreSQL, not browser storage

**Rationale**: Alert preferences, baseline value, delivery history, and account
  theme settings drive server-side behavior and must be available when the
  snapshot route runs. Browser-local storage cannot power server-side threshold
  evaluation, delivery retries, or cross-platform settings parity.

**Alternatives considered**:

- Browser-local storage: rejected because the server cannot reliably read it
  during snapshot processing.
- Demo-store-only state: rejected because alert history and webhook settings
  must survive restarts and match production behavior.

## Decision: Encrypt the saved Teams webhook URL before database persistence

**Rationale**: The Teams workflow webhook URL is effectively a write credential
for a chat or channel. Encrypting it at rest with an application-managed key
reduces the blast radius of raw database exposure while keeping the runtime
integration straightforward.

**Alternatives considered**:

- Store the webhook URL in plain text: rejected because it treats a reusable
  posting credential like ordinary profile data.
- Store the webhook only in environment variables: rejected because the feature
  is user-configured and must support per-user destinations.

## Decision: Treat the current portfolio value at enablement time as the initial baseline

**Rationale**: The spec needs a deterministic starting point for the first
alert. Using the current value at the time alerts are enabled prevents an
immediate notification for gains that happened before the user opted in and
keeps future threshold checks simple.

**Alternatives considered**:

- Use the oldest valuation snapshot as baseline: rejected because it can trigger
  an immediate alert for stale gains that predate user opt-in.
- Send an immediate “current value” message at enablement: rejected because the
  requested behavior is threshold-based gain alerts, not connection
  confirmations.
