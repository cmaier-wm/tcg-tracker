# Project Context

## Tech Stack
- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- Prisma ORM with PostgreSQL 17
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright
- Swift 6 with SwiftUI, Observation, Foundation networking, and Swift Charts

## Conventions
- Follow the constitution in `.specify/memory/constitution.md`.
- Use the spec-driven workflow: `spec.md -> plan.md -> supporting design docs ->
  tasks.md -> implementation`.
- All features and behavior changes are in scope for both the web app and the
  native iOS app by default. Treat cross-platform parity as mandatory unless
  the constitution is explicitly amended or a time-bound exception is approved
  in the plan.
- Use the current Figma Make file as the default UI reference for visual
  alignment work: `https://www.figma.com/make/6ao1OMigGMRBj68UqBEOWA/TCG-Card-Tracker-App?p=f&t=XknWAY1aATbX7RHT-0`
- Organize work as independently valuable user stories with exact file-path
  tasks.
- Verification is mandatory for every behavior change. Prefer automated tests;
  if not practical, define explicit manual verification in `quickstart.md`.
- Keep repo guidance in sync with accepted plans when stack, structure, or
  commands change.
- Keep MCP workflow documentation in `docs/development/mcps.md` in sync when
  development tooling changes.
- Azure infrastructure and hosting work may use Azure MCP when cloud resource
  context is needed; prefer that over ad hoc assumptions about Azure state.
- Prefer Docker only for local infrastructure services unless a later plan
  explicitly justifies containerizing the app itself.
- The accepted Azure hosting target for this repository is Azure App Service on
  Linux with Azure Database for PostgreSQL Flexible Server, Azure Key Vault,
  and Azure Developer CLI (`azd`) using Bicep in `infra/`.

## Commands
- `npm install`
- `npm run db:up`
- `npm run db:generate`
- `npm run dev`
- `npm run codex:sync-worktrees`
- `npm run db:migrate`
- `export AUTH_SECRET=<local-secret>`
- `export TEAMS_WEBHOOK_ENCRYPTION_KEY=<local-secret>`
- `export AUTH_RESET_EMAIL_ENDPOINT=<server-side-reset-delivery-endpoint>`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run snapshots:run`
- `npm run db:down`
- `cd ios && swift test`
- `ruby ios/scripts/generate_xcodeproj.rb`
- `npm run azure:prepare`
- `npm run azure:verify -- <deployed-url>`
- `env AZD_CONFIG_DIR=/tmp/.azd azd env set POSTGRES_ADMIN_PASSWORD <url-safe-password>`
- `env AZD_CONFIG_DIR=/tmp/.azd azd provision --preview`
- `env AZD_CONFIG_DIR=/tmp/.azd azd up`
- Use the `.specify/scripts/bash/` helpers for spec-kit workflow maintenance as
  needed.
- `npm run dev` automatically runs `prisma migrate deploy` and `prisma generate`
  before starting the local server on port `3000`.
- `npm run codex:sync-worktrees` backfills the tracked Codex Desktop Run action
  into older `tcg-tracker` worktrees under `$CODEX_HOME/worktrees` or
  `~/.codex/worktrees`.
- When `AUTH_RESET_EMAIL_ENDPOINT` is not set locally, password reset requests
  log the reset URL in the server output for manual verification instead of
  sending an email.

## Active Technologies
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL, Docker Compose, TanStack Query, Recharts, Zod (001-card-portfolio-tracker)
- PostgreSQL 17 for application data and time-series snapshots (001-card-portfolio-tracker)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL 17, Vitest, React Testing Library, Playwright (002-user-settings)
- Browser-local persisted user preference; no new server-side storage required for v1 (002-user-settings)
- Existing PostgreSQL catalog plus demo-store fallback; no new persisted storage required (003-results-sorting)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, Azure Developer CLI, Bicep (004-azure-deploy)
- Azure Database for PostgreSQL Flexible Server 17 (004-azure-deploy)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, Zod, native `fetch`, Node `crypto` (005-teams-value-alert)
- PostgreSQL 17 for Teams alert preferences, encrypted webhook destination, baseline state, and delivery history (005-teams-value-alert)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, Auth.js, Zod, password hashing library (`bcryptjs` or equivalent) (006-user-login)
- PostgreSQL 17 for users, sessions, account-owned portfolio data, and account-owned Teams settings (006-user-login)
- Swift 6 for the iOS client, TypeScript 5.9 on Node.js 22 LTS for backend additions + SwiftUI, Observation, Foundation networking, Swift Charts, existing Next.js 16, React 19, Prisma ORM, Auth.js, Zod backend stack (007-ios-mobile-app)
- Existing PostgreSQL 17 through the Next.js backend for account-owned data; secure session cookies on device; no offline source-of-truth storage in v1 (007-ios-mobile-app)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, Auth.js session helpers, Zod, native `Response` and string handling for CSV output (008-portfolio-spreadsheet-export)
- PostgreSQL 17 for authenticated portfolio holdings and latest price snapshots, with the existing in-memory demo-store fallback when the database is unavailable in non-production or test fallback paths (008-portfolio-spreadsheet-export)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, Zod, `bcryptjs`, native Node `crypto`, existing app-owned auth/session helpers, and a transactional email delivery integration for production reset emails (009-password-reset)
- PostgreSQL 17 for users, credentials, sessions, audit events, and new password reset token records (009-password-reset)

## Recent Changes
- 001-card-portfolio-tracker: Added TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL, Docker Compose, TanStack Query, Recharts, Zod
- 002-user-settings: Added an account-backed settings surface with persistent light/dark theme selection shared across web and iOS
- 004-azure-deploy: Added Azure App Service + PostgreSQL Flexible Server deployment scaffolding with Azure Developer CLI and Bicep
- 005-teams-value-alert: Added persisted Microsoft Teams workflow alerts with encrypted webhook storage, snapshot-triggered threshold delivery, and duplicate suppression
- 006-user-login: Added email/password registration, session-backed login/logout, protected portfolio/settings routes, account-owned portfolio data, and account-owned Teams alert settings
- 007-ios-mobile-app: Added a package-backed native iOS client structure, mobile summary composition routes, and SwiftUI flows for auth, browse, portfolio, card detail, and settings
- 008-portfolio-spreadsheet-export: Added authenticated CSV portfolio export, export API coverage, and Azure startup packaging updates for App Service deployment
