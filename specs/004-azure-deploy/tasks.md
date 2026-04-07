# Tasks: Azure Deployment

**Input**: Design documents from `/specs/004-azure-deploy/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Verification is mandatory. This feature uses local build validation,
targeted deployment smoke checks, and explicit operator verification steps in
`quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish Azure deployment scaffolding and repository hygiene.

- [x] T001 Create Azure Developer CLI project configuration in `/Users/cmaier/Source/tcg-tracker/azure.yaml`
- [x] T002 Create Azure environment helper and verification scripts in `/Users/cmaier/Source/tcg-tracker/scripts/azure-prepare-env.mjs` and `/Users/cmaier/Source/tcg-tracker/scripts/azure-verify-deployment.mjs`
- [x] T003 [P] Add deployment ignore patterns and tool configuration updates in `/Users/cmaier/Source/tcg-tracker/.gitignore` and `/Users/cmaier/Source/tcg-tracker/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provisioning and deployment assets required before any story can be completed.

- [x] T004 Create root Azure Bicep deployment in `/Users/cmaier/Source/tcg-tracker/infra/main.bicep` and `/Users/cmaier/Source/tcg-tracker/infra/main.parameters.json`
- [x] T005 [P] Create modular Azure resource definitions in `/Users/cmaier/Source/tcg-tracker/infra/modules/monitoring.bicep`, `/Users/cmaier/Source/tcg-tracker/infra/modules/postgres.bicep`, and `/Users/cmaier/Source/tcg-tracker/infra/modules/webapp.bicep`
- [x] T006 [P] Create azd deployment hooks in `/Users/cmaier/Source/tcg-tracker/.azure/hooks/preprovision.sh` and `/Users/cmaier/Source/tcg-tracker/.azure/hooks/postdeploy.sh`
- [x] T007 Update deployment planning artifacts and operator guidance in `/Users/cmaier/Source/tcg-tracker/README.md`, `/Users/cmaier/Source/tcg-tracker/AGENTS.md`, and `/Users/cmaier/Source/tcg-tracker/docs/development/mcps.md`

**Checkpoint**: Azure infrastructure, azd workflow, and repo guidance are in place.

---

## Phase 3: User Story 1 - Launch a hosted production environment (Priority: P1) 🎯 MVP

**Goal**: Provision Azure resources and deploy the Next.js application to a public HTTPS endpoint.

**Independent Test**: Run `azd provision --preview`, `azd up`, and confirm the deployed home page and API respond from the published URL.

### Verification for User Story 1

- [x] T008 [US1] Add deployment smoke verification steps to `/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/quickstart.md`
- [x] T009 [US1] Validate application packaging with `npm run build` from `/Users/cmaier/Source/tcg-tracker`

### Implementation for User Story 1

- [x] T010 [US1] Configure App Service deployment mapping and workflow order in `/Users/cmaier/Source/tcg-tracker/azure.yaml`
- [x] T011 [US1] Implement App Service runtime settings, diagnostics, and public endpoint outputs in `/Users/cmaier/Source/tcg-tracker/infra/modules/webapp.bicep`
- [x] T012 [US1] Provision Azure resources and deploy the app with azd from `/Users/cmaier/Source/tcg-tracker`
- [x] T013 [US1] Capture deployed endpoint and smoke-test results in `/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/quickstart.md`

**Checkpoint**: The app is reachable on Azure over HTTPS.

---

## Phase 4: User Story 2 - Operate with managed data and secure configuration (Priority: P2)

**Goal**: Back the deployed app with managed PostgreSQL and secure secret delivery through Key Vault and managed identity.

**Independent Test**: Confirm the Azure-hosted app starts with Key Vault-backed configuration, runs Prisma migrations, and serves a database-backed route successfully.

### Verification for User Story 2

- [x] T014 [US2] Add secure configuration and database verification steps to `/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/quickstart.md`
- [ ] T015 [US2] Run deployed database-backed route verification against the live site from `/Users/cmaier/Source/tcg-tracker`

### Implementation for User Story 2

- [x] T016 [US2] Implement PostgreSQL server, database, firewall, and Key Vault secret creation in `/Users/cmaier/Source/tcg-tracker/infra/modules/postgres.bicep`
- [x] T017 [US2] Implement user-assigned identity, Key Vault RBAC, and secret reference app settings in `/Users/cmaier/Source/tcg-tracker/infra/modules/webapp.bicep`
- [x] T018 [US2] Add production startup command and deployment-time environment validation in `/Users/cmaier/Source/tcg-tracker/package.json`, `/Users/cmaier/Source/tcg-tracker/scripts/azure-prepare-env.mjs`, and `/Users/cmaier/Source/tcg-tracker/.azure/hooks/preprovision.sh`
- [x] T019 [US2] Re-provision and redeploy the Azure environment from `/Users/cmaier/Source/tcg-tracker`

**Checkpoint**: The Azure app runs against managed PostgreSQL with Key Vault-backed configuration.

---

## Phase 5: User Story 3 - Repeat deployment and troubleshoot confidently (Priority: P3)

**Goal**: Make the deployment repeatable and diagnosable for future releases.

**Independent Test**: Re-run the documented workflow against the same environment and use the documented commands to retrieve endpoint, environment values, and app health.

### Verification for User Story 3

- [x] T020 [US3] Re-run `azd provision --preview` and `azd up` against the existing environment from `/Users/cmaier/Source/tcg-tracker`
- [x] T021 [US3] Validate troubleshooting and repeat-deploy instructions in `/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/quickstart.md`

### Implementation for User Story 3

- [x] T022 [US3] Add repeat-deploy and health-check automation in `/Users/cmaier/Source/tcg-tracker/scripts/azure-verify-deployment.mjs` and `/Users/cmaier/Source/tcg-tracker/.azure/hooks/postdeploy.sh`
- [x] T023 [US3] Document operator commands, required environment values, and troubleshooting entry points in `/Users/cmaier/Source/tcg-tracker/README.md` and `/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/quickstart.md`

**Checkpoint**: A maintainer can repeat the deployment and verify health without guessing.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and traceability updates across stories.

- [x] T024 [P] Mark completed implementation tasks in `/Users/cmaier/Source/tcg-tracker/specs/004-azure-deploy/tasks.md`
- [ ] T025 Run final repository verification for deployment changes from `/Users/cmaier/Source/tcg-tracker`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies.
- **Phase 2**: Depends on Phase 1 and blocks all user stories.
- **Phase 3**: Depends on Phase 2.
- **Phase 4**: Depends on Phase 3 because secure database configuration builds on the deployed web app.
- **Phase 5**: Depends on Phase 4.
- **Phase 6**: Depends on all earlier phases.

### User Story Dependencies

- **US1**: Starts after foundational work and delivers the MVP deployment endpoint.
- **US2**: Extends US1 with managed database and secure configuration.
- **US3**: Extends US1 and US2 with repeatability and troubleshooting workflow.

### Parallel Opportunities

- `T003`, `T005`, and `T006` can run in parallel once setup begins.
- Documentation updates in `T007` can overlap with infra authoring after the deployment shape is fixed.
- Verification note updates in `T008` and `T014` can happen alongside implementation before command execution.

## Implementation Strategy

### MVP First

1. Finish setup and foundational azd/Bicep assets.
2. Complete US1 and verify the public deployment endpoint.
3. Add US2 secure database and secret configuration.
4. Add US3 repeat-deploy and troubleshooting workflow.

### Incremental Delivery

1. Provision core Azure resources and publish the app.
2. Add managed PostgreSQL and Key Vault-backed configuration.
3. Harden the operator workflow with repeat deployment and health checks.
