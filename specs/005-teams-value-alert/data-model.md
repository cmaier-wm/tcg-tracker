# Data Model: Microsoft Teams Portfolio Alerts

## TeamsAlertPreference

- **Purpose**: Represents the persisted Teams alert configuration for a user.
- **Attributes**:
  - `userId`: owning user account
  - `enabled`: whether portfolio gain alerts are active
  - `destinationLabel`: user-visible name for the Teams chat or channel
  - `encryptedWebhookUrl`: encrypted Teams workflow webhook URL
  - `webhookUrlIv`: initialization vector or nonce used for encryption
  - `baselineValue`: portfolio value reference used for the next threshold check
  - `lastEvaluatedAt`: most recent time alert eligibility was checked
  - `lastDeliveredAt`: most recent successful Teams alert delivery time
  - `lastFailureAt`: most recent failed delivery time
  - `lastFailureMessage`: latest user-displayable failure reason
  - `createdAt`
  - `updatedAt`
- **Relationships**:
  - Belongs to one `UserAccount`
  - Has many `TeamsAlertDelivery` records
- **Validation rules**:
  - `encryptedWebhookUrl`, `webhookUrlIv`, and `destinationLabel` are required
    when `enabled` is `true`
  - `baselineValue` is initialized from the current portfolio value when alerts
    are first enabled or reconnected

## TeamsAlertDelivery

- **Purpose**: Represents a single attempt to deliver a Teams portfolio gain
  alert.
- **Attributes**:
  - `id`
  - `userId`
  - `preferenceId`
  - `capturedAt`: valuation snapshot time that triggered evaluation
  - `portfolioValue`
  - `baselineValue`
  - `gainAmount`
  - `status`: `sent` or `failed`
  - `failureMessage`: normalized delivery error, if any
  - `responseCode`: HTTP status code from the Teams workflow endpoint, if
    available
  - `createdAt`
- **Relationships**:
  - Belongs to one `TeamsAlertPreference`
  - Belongs to one `UserAccount`
- **Validation rules**:
  - `gainAmount` must be greater than `1000` for created delivery attempts
  - A successful delivery updates the parent preference baseline to
    `portfolioValue`

## PortfolioAlertEvaluation

- **Purpose**: Represents the in-memory decision object produced when the app
  compares the latest portfolio value with the stored baseline.
- **Attributes**:
  - `currentPortfolioValue`
  - `baselineValue`
  - `gainAmount`
  - `shouldSend`
  - `reason`: `disabled`, `missing-destination`, `threshold-not-met`,
    `send-required`, or `delivery-failed`
- **Relationships**:
  - Reads from `TeamsAlertPreference`
  - Reads the latest `PortfolioValuationSnapshot`
  - May create one `TeamsAlertDelivery`

## State Transitions

- **Disabled -> Enabled**: user saves a valid Teams destination; baseline is set
  to the current portfolio value and delivery status is cleared.
- **Enabled -> Sent**: evaluation finds `gainAmount > 1000`, delivery succeeds,
  and baseline advances to the delivered portfolio value.
- **Enabled -> Failed**: evaluation finds `gainAmount > 1000`, delivery fails,
  and baseline remains unchanged so a later qualifying evaluation can retry.
- **Enabled -> Disabled**: user turns alerts off; existing delivery history is
  retained and no further outbound posts occur until re-enabled.
