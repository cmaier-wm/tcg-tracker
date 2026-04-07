@description('Deployment environment name used by azd.')
param environmentName string

@description('Primary Azure region for this deployment.')
param location string

@description('azd service name for the web application.')
param serviceName string = 'web'

@description('PostgreSQL administrator username.')
param postgresAdminUsername string

@secure()
@description('PostgreSQL administrator password.')
param postgresAdminPassword string

@description('Application database name.')
param databaseName string = 'tcgtracker'

@description('Azure App Service plan SKU name.')
param appServicePlanSkuName string = 'B1'

@description('Azure Database for PostgreSQL SKU name.')
param postgresSkuName string = 'Standard_B1ms'

@description('Azure Database for PostgreSQL SKU tier.')
param postgresSkuTier string = 'Burstable'

@description('Azure Database for PostgreSQL storage size in GB.')
param postgresStorageSizeGb int = 32

@description('Azure Database for PostgreSQL engine version.')
param postgresVersion string = '17'

@description('Linux App Service runtime version.')
param nodeRuntime string = 'NODE|22-lts'

@description('Startup command for the Azure Web App.')
param appCommandLine string = 'node server.js'

var resourceToken = uniqueString(subscription().id, resourceGroup().id, location, environmentName)
var commonTags = {
  'azd-env-name': environmentName
}

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    resourceToken: resourceToken
    tags: commonTags
  }
}

module webapp './modules/webapp.bicep' = {
  name: 'webapp'
  params: {
    appCommandLine: appCommandLine
    appServicePlanSkuName: appServicePlanSkuName
    applicationInsightsConnectionString: monitoring.outputs.applicationInsightsConnectionString
    location: location
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    nodeRuntime: nodeRuntime
    resourceToken: resourceToken
    serviceName: serviceName
    tags: commonTags
  }
}

module postgres './modules/postgres.bicep' = {
  name: 'postgres'
  params: {
    databaseName: databaseName
    keyVaultName: webapp.outputs.keyVaultName
    location: location
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    postgresAdminPassword: postgresAdminPassword
    postgresAdminUsername: postgresAdminUsername
    postgresSkuName: postgresSkuName
    postgresSkuTier: postgresSkuTier
    postgresStorageSizeGb: postgresStorageSizeGb
    postgresVersion: postgresVersion
    resourceToken: resourceToken
    tags: commonTags
  }
}

output SERVICE_WEB_NAME string = webapp.outputs.webAppName
output SERVICE_WEB_URI string = webapp.outputs.webAppUri
output AZURE_LOCATION string = location
output AZURE_RESOURCE_GROUP string = resourceGroup().name
output KEY_VAULT_NAME string = webapp.outputs.keyVaultName
output POSTGRES_SERVER_NAME string = postgres.outputs.postgresServerName
