// dev.bicepparam — parameter values for the dev environment
// SQL password is read from the SQL_ADMIN_PASSWORD environment variable.
// Set it before deploying: $env:SQL_ADMIN_PASSWORD = 'your-password'

using '../main.bicep'

// ─── Resource naming (Cloud Adoption Framework convention) ────────────────────
// Pattern: {type}-{workload}-{qualifier}-{env}

param appServicePlanName = 'asp-talent-f1-dev'
param apiAppName         = 'app-talent-api-dev'
param identityAppName    = 'app-talent-ids-dev'
param staticWebAppName   = 'swa-talent-ui-dev'
param sqlServerName      = 'sql-talent-dev'
param apiDbName          = 'sqldb-talent-api-dev'
param identityDbName     = 'sqldb-talent-ids-dev'

// SQL admin credentials
param sqlAdminLogin      = 'sqladmin'
param sqlAdminPassword   = readEnvironmentVariable('SQL_ADMIN_PASSWORD')
