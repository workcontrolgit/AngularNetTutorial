// dev.bicepparam — parameter values for the dev environment
// DO NOT add sqlAdminPassword here — pass it at deploy time from a GitHub Secret:
//   --parameters sqlAdminPassword=$SQL_ADMIN_PASSWORD

using '../main.bicep'

// ─── Resource naming (Cloud Adoption Framework convention) ────────────────────
// Pattern: {type}-{workload}-{qualifier}-{env}

param appServicePlanName = 'asp-talent-b1-dev'
param apiAppName         = 'app-talent-api-dev'
param identityAppName    = 'app-talent-ids-dev'
param staticWebAppName   = 'swa-talent-ui-dev'
param sqlServerName      = 'sql-talent-dev'
param apiDbName          = 'sqldb-talent-api-dev'
param identityDbName     = 'sqldb-talent-ids-dev'

// ─── SQL admin login ──────────────────────────────────────────────────────────
// Password is passed at deploy time — never stored here
param sqlAdminLogin = 'sqladmin'
