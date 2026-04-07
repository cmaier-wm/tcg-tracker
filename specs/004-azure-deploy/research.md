# Research: Azure Deployment

## Decision: Use Azure Developer CLI with Bicep

**Rationale**: Official Azure guidance for full-stack deployment templates uses
`azure.yaml` plus an `infra/` folder, and recommends `azd up` for standard app
deployments. This gives the repository a repeatable provision-and-deploy
workflow without hand-maintained portal steps.

**Alternatives considered**:

- Raw `az` shell scripts: rejected because the repo constitution prefers IaC
  over ad hoc commands for non-trivial infrastructure.
- Manual Azure portal setup: rejected because it is not reviewable or
  repeatable.

## Decision: Host the app on Azure App Service (Linux)

**Rationale**: The repository is a single Next.js server application with Prisma
and no Dockerfile. App Service on Linux fits that shape directly and avoids
introducing containerization that the repo guidance says to avoid unless
explicitly justified.

**Alternatives considered**:

- Azure Container Apps: rejected because it would add container build and image
  publishing complexity without a clear need.
- Azure Static Web Apps: rejected because this app relies on server-side Node.js
  execution and Prisma-backed APIs.

## Decision: Use Azure Database for PostgreSQL Flexible Server 17

**Rationale**: Prisma already targets PostgreSQL, and Azure quota checks show
`centralus` has sufficient PostgreSQL Flexible Server quota for a small initial
production deployment. Using a managed PostgreSQL service preserves the current
application data model with the smallest code change surface.

**Alternatives considered**:

- Azure SQL Database: rejected because it would require changing Prisma provider
  and SQL compatibility assumptions.
- Reusing a local or self-hosted PostgreSQL instance: rejected because the
  deployment must not depend on local infrastructure.

## Decision: Store production secrets in Azure Key Vault and reference them from App Service

**Rationale**: Azure deployment rules for this task require Key Vault for
PostgreSQL credentials, RBAC-based access, and a user-assigned managed identity
on the web app. This also satisfies the product requirement that production
configuration not depend on checked-in secrets.

**Alternatives considered**:

- Raw App Service app settings only: rejected because database credentials would
  still need to be managed directly instead of stored in Key Vault.

## Decision: Use `centralus` for the first production environment

**Rationale**: Azure region availability checks confirm that `centralus`
supports App Service, PostgreSQL Flexible Server, and Key Vault in the default
subscription, and PostgreSQL quota is sufficient. It is also a geographically
reasonable default for the current operator context.

**Alternatives considered**:

- `eastus2`: viable, but not preferred once `centralus` was confirmed.
- `southcentralus`: viable, but not preferred once `centralus` was confirmed.

## Decision: Apply Prisma migrations during web app startup

**Rationale**: The deployed app can safely run `prisma migrate deploy` before
`next start`, which ensures the managed database schema is current without
requiring local operator IP access to the database. This keeps schema setup
inside the deployment flow while remaining repeatable on restart.

**Alternatives considered**:

- Run migrations from the operator workstation: rejected because the required
  firewall model would need extra public IP management for every maintainer.
- Leave migrations manual: rejected because it increases release risk and fails
  the requirement for a reliable production workflow.
