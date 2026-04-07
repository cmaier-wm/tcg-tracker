# Implementation Plan: Azure Deployment

**Branch**: `004-azure-deploy` | **Date**: 2026-04-03 | **Spec**: [/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/spec.md](/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/spec.md)
**Input**: Feature specification from `/specs/004-azure-deploy/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Provision and deploy `tcg-tracker` to Azure as a production-ready Next.js
application using Azure Developer CLI with Bicep-managed infrastructure. The
deployment will target Azure App Service on Linux for compute, Azure Database
for PostgreSQL Flexible Server for persistent data, Azure Key Vault for secret
storage, and Azure Monitor resources for diagnostics. The repository will gain
the IaC, azd configuration, deployment scripts, and operator documentation
required to provision, deploy, verify, and repeat releases from source control.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 on Node.js 22 LTS  
**Primary Dependencies**: Next.js 16, React 19, Prisma ORM, Azure Developer CLI, Bicep  
**Storage**: Azure Database for PostgreSQL Flexible Server 17  
**Testing**: `npm run build`, Vitest suites, targeted Playwright/browser checks, Azure post-deploy smoke verification  
**Target Platform**: Azure App Service on Linux in `centralus`  
**Project Type**: Full-stack web application with server-rendered Node.js host  
**Performance Goals**: Production site responds successfully for primary pages and at least one database-backed route after deployment; repeat deployment remains idempotent  
**Constraints**: Keep app non-containerized, prefer IaC over ad hoc CLI, secure secrets through Azure-managed configuration, preserve local Docker-only database workflow for development  
**Scale/Scope**: Single production environment, one public web app, one managed PostgreSQL server, one operator-managed deployment workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-first scope is defined: this plan references a concrete spec and does
      not start implementation from placeholders alone.
- [x] User stories remain independently valuable, priority-ordered, and
      independently testable.
- [x] Verification is defined for each story and for any foundational work that
      could block later validation.
- [x] Added complexity, dependencies, services, or directories are explicitly
      justified; simpler alternatives are noted when rejected.
- [x] Any changes to stack, structure, or commands are reflected in `README.md`,
      `AGENTS.md`, and related guidance files in the same change set.

## Project Structure

### Documentation (this feature)

```text
specs/004-azure-deploy/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
components/
lib/
prisma/
scripts/
tests/

infra/
├── main.bicep
├── main.parameters.json
└── modules/

.azure/
└── hooks/

azure.yaml
```

**Structure Decision**: Keep the existing single Next.js application structure
and add `infra/`, `.azure/hooks/`, and `azure.yaml` at the repository root for
Azure provisioning and deployment. This adds the smallest set of new paths
needed for repeatable Azure hosting without containerizing or splitting the app
into separate services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Additional `infra/` and azd files | Required to provision and deploy Azure resources from source control | Azure portal-only setup and ad hoc shell commands are not auditable or repeatable |
| Azure Key Vault and managed identity | Required to avoid checked-in production secrets and satisfy secure configuration goals | Plain App Service app settings alone would still require raw secrets to be managed outside a secure secret store |
