# Data Model: Azure Deployment

## DeploymentEnvironment

- **Purpose**: Represents the named Azure deployment context for this
  application.
- **Attributes**:
  - `environmentName`: azd environment name, expected to be `prod`
  - `subscriptionId`: Azure subscription hosting the deployment
  - `resourceGroupName`: Azure resource group containing deployment resources
  - `location`: Azure region, set to `centralus`
  - `appUrl`: public HTTPS URL for the deployed web app
- **Relationships**:
  - Owns one `WebApplication`
  - Owns one `ManagedDatabase`
  - Owns one `SecretStore`

## WebApplication

- **Purpose**: Represents the hosted Next.js application instance.
- **Attributes**:
  - `serviceName`: azd service name `web`
  - `appServiceName`: globally unique App Service site name
  - `appServicePlanName`: Linux App Service plan name
  - `managedIdentityId`: user-assigned managed identity bound to the app
  - `runtime`: Node.js on Linux
  - `startupCommand`: command that applies Prisma migrations and starts Next.js
- **Relationships**:
  - Reads secrets from `SecretStore`
  - Connects to `ManagedDatabase`
  - Emits telemetry to Azure Monitor resources

## ManagedDatabase

- **Purpose**: Represents the production PostgreSQL resource and application
  database.
- **Attributes**:
  - `serverName`: Azure PostgreSQL Flexible Server name
  - `databaseName`: application database name
  - `engineVersion`: PostgreSQL 17
  - `adminUsernameSecret`: Key Vault secret name for the admin username
  - `adminPasswordSecret`: Key Vault secret name for the admin password
  - `connectionStringSecret`: Key Vault secret name for the application
    connection string
- **Relationships**:
  - Owned by `DeploymentEnvironment`
  - Accessed by `WebApplication`

## SecretStore

- **Purpose**: Represents Azure Key Vault storage for deployment secrets.
- **Attributes**:
  - `vaultName`: Key Vault name
  - `secretNames`: list of secret keys required by the app and deployment flow
  - `rbacMode`: Azure RBAC authorization enabled
- **Relationships**:
  - Grants the `WebApplication` managed identity read access
  - Stores database secrets for `ManagedDatabase`

## DeploymentVerificationRecord

- **Purpose**: Represents the observable outputs needed to verify deployment.
- **Attributes**:
  - `resourceGroupName`
  - `appUrl`
  - `healthCheckRoutes`
  - `verificationCommands`
  - `logEntryPoints`
- **Relationships**:
  - Produced from `DeploymentEnvironment`
  - Used by operators following `quickstart.md`
