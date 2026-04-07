# Project Context

## Tech Stack
- TypeScript 5.9 on Node.js 22 LTS
- Next.js 16 with React 19
- Prisma ORM with PostgreSQL 17
- Docker Compose for local PostgreSQL
- TanStack Query, Recharts, and Zod
- Vitest, React Testing Library, and Playwright

## Conventions
- Follow the constitution in `.specify/memory/constitution.md`.
- Use the spec-driven workflow: `spec.md -> plan.md -> supporting design docs ->
  tasks.md -> implementation`.
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
- `npm run db:migrate`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run snapshots:run`
- `npm run db:down`
- `npm run azure:prepare`
- `npm run azure:verify -- <deployed-url>`
- `env AZD_CONFIG_DIR=/tmp/.azd azd env set POSTGRES_ADMIN_PASSWORD <url-safe-password>`
- `env AZD_CONFIG_DIR=/tmp/.azd azd provision --preview`
- `env AZD_CONFIG_DIR=/tmp/.azd azd up`
- Use the `.specify/scripts/bash/` helpers for spec-kit workflow maintenance as
  needed.

## Active Technologies
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL, Docker Compose, TanStack Query, Recharts, Zod (001-card-portfolio-tracker)
- PostgreSQL 17 for application data and time-series snapshots (001-card-portfolio-tracker)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL 17, Vitest, React Testing Library, Playwright (002-user-settings)
- Browser-local persisted user preference; no new server-side storage required for v1 (002-user-settings)
- Existing PostgreSQL catalog plus demo-store fallback; no new persisted storage required (003-results-sorting)
- TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, Azure Developer CLI, Bicep (004-azure-deploy)
- Azure Database for PostgreSQL Flexible Server 17 (004-azure-deploy)

## Recent Changes
- 001-card-portfolio-tracker: Added TypeScript 5.9 on Node.js 22 LTS + Next.js 16, React 19, Prisma ORM, PostgreSQL, Docker Compose, TanStack Query, Recharts, Zod
- 002-user-settings: Added a browser-local settings surface with dark mode support and persistent theme selection
- 004-azure-deploy: Added Azure App Service + PostgreSQL Flexible Server deployment scaffolding with Azure Developer CLI and Bicep
