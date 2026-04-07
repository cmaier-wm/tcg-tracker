# Quickstart: Azure Deployment

## Prerequisites

- Azure CLI authenticated to the target tenant and subscription
- Azure Developer CLI installed
- Node.js 22 and npm installed
- Local repository dependencies installed with `npm install`

## First Deployment

1. Create or select the azd environment:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd env new prod
   ```

2. Set the deployment location and subscription if they are not already set:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd env set AZURE_LOCATION centralus
   env AZD_CONFIG_DIR=/tmp/.azd azd env set AZURE_SUBSCRIPTION_ID a94e41d4-5686-46fc-8390-e18bbbbb27cc
   env AZD_CONFIG_DIR=/tmp/.azd azd env set POSTGRES_ADMIN_USERNAME tcgtrackeradmin
   env AZD_CONFIG_DIR=/tmp/.azd azd env set POSTGRES_ADMIN_PASSWORD <url-safe-password>
   ```

3. Validate infrastructure changes before provisioning:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd provision --preview
   ```

4. Provision infrastructure and deploy the application:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd up
   ```

## Repeat Deployment

1. Redeploy code and reconcile any infrastructure changes:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd up
   ```

2. If only infrastructure changes are needed:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd provision
   ```

3. If only application code changes are needed:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd deploy
   ```

## Verification

1. Build locally before deployment:

   ```bash
   npm run build
   ```

2. Retrieve the deployed web endpoint:

   ```bash
   env AZD_CONFIG_DIR=/tmp/.azd azd env get-value SERVICE_WEB_URI
   ```

3. Confirm the home page responds:

   ```bash
   curl --fail --silent "$(env AZD_CONFIG_DIR=/tmp/.azd azd env get-value SERVICE_WEB_URI)" >/dev/null
   ```

4. Confirm a database-backed route responds:

   ```bash
   curl --fail --silent "$(env AZD_CONFIG_DIR=/tmp/.azd azd env get-value SERVICE_WEB_URI)/api/cards?offset=0&limit=1" >/dev/null
   ```

5. If deployment fails, inspect:
   - App Service application logs
   - azd environment values
   - Azure resource provisioning history in the target resource group

## Current Prod Environment

- Resource group: `rg-prod`
- Web app: `azappjzn32vflxpfjy`
- Web URL: `https://azappjzn32vflxpfjy.azurewebsites.net`
- Key Vault: `azkvjzn32vflxpfjy`
- PostgreSQL server: `azpsqljzn32vflxpfjy`

## Current Verification Status

- `npm run build` succeeded locally on 2026-04-03.
- `bicep build infra/main.bicep` succeeded locally on 2026-04-03.
- Azure provisioning succeeded in subscription
  `a94e41d4-5686-46fc-8390-e18bbbbb27cc`.
- Direct HTTP verification of the deployed site from this machine timed out on
  2026-04-03, so public endpoint health remains unresolved from the current
  environment.
