// =============================================================================
// main.bicep — Talent Management full-stack Azure infrastructure
// =============================================================================
// Provisions all resources for the AngularNetTutorial three-tier stack:
//   - App Service Plan (B1, shared)
//   - Web App: Talent Management API
//   - Web App: Duende IdentityServer
//   - Static Web App: Angular client (Free tier)
//   - Azure SQL logical server (shared)
//   - SQL database: TalentManagementApiDb
//   - SQL database: IdentityServerDb
//
// Deploy command (from repo root):
//   az deployment group create \
//     --resource-group rg-talent-dev \
//     --template-file infra/main.bicep \
//     --parameters infra/parameters/dev.bicepparam \
//     --parameters sqlAdminPassword=$SQL_ADMIN_PASSWORD
// =============================================================================

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Name of the App Service Plan')
param appServicePlanName string

@description('Name of the API Web App')
param apiAppName string

@description('Name of the IdentityServer Web App')
param identityAppName string

@description('Name of the Angular Static Web App')
param staticWebAppName string

@description('Name of the Azure SQL logical server')
param sqlServerName string

@description('Name of the API database')
param apiDbName string

@description('Name of the IdentityServer database')
param identityDbName string

@description('SQL administrator login name')
param sqlAdminLogin string

@description('SQL administrator password — pass from GitHub Secret, never store in parameters file')
@secure()
param sqlAdminPassword string

// ─── App Service Plan ─────────────────────────────────────────────────────────
module appServicePlan 'modules/appServicePlan.bicep' = {
  name: 'appServicePlan'
  params: {
    appServicePlanName: appServicePlanName
    location: location
  }
}

// ─── Web Apps ─────────────────────────────────────────────────────────────────
module apiApp 'modules/webApp.bicep' = {
  name: 'apiApp'
  params: {
    webAppName: apiAppName
    location: location
    appServicePlanId: appServicePlan.outputs.id
  }
}

module identityApp 'modules/webApp.bicep' = {
  name: 'identityApp'
  params: {
    webAppName: identityAppName
    location: location
    appServicePlanId: appServicePlan.outputs.id
  }
}

// ─── Angular Static Web App ───────────────────────────────────────────────────
module angularSwa 'modules/staticWebApp.bicep' = {
  name: 'angularSwa'
  params: {
    staticWebAppName: staticWebAppName
    location: location
  }
}

// ─── SQL Server + Databases ───────────────────────────────────────────────────
module sqlServer 'modules/sqlServer.bicep' = {
  name: 'sqlServer'
  params: {
    sqlServerName: sqlServerName
    location: location
    sqlAdminLogin: sqlAdminLogin
    sqlAdminPassword: sqlAdminPassword
    apiDbName: apiDbName
    identityDbName: identityDbName
  }
}

// ─── Outputs (used by deployment workflows and post-deployment config) ─────────
output apiAppUrl string = apiApp.outputs.url
output identityAppUrl string = identityApp.outputs.url
output angularAppUrl string = angularSwa.outputs.url
output sqlServerFqdn string = sqlServer.outputs.sqlServerFqdn
output apiDbConnectionString string = sqlServer.outputs.apiDbConnectionString
output identityDbConnectionString string = sqlServer.outputs.identityDbConnectionString
