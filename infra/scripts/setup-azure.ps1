# =============================================================================
# setup-azure.ps1 - Deploy Azure infrastructure via Bicep
# =============================================================================
#
# Provisions all Azure resources for the Talent Management full stack:
#   - App Service Plan (B1)
#   - Web App: Talent Management API  (app-talent-api-dev)
#   - Web App: Duende IdentityServer  (app-talent-ids-dev)
#   - Static Web App: Angular UI      (swa-talent-ui-dev)
#   - Azure SQL Server                (sql-talent-dev)
#   - SQL Database: API               (sqldb-talent-api-dev)
#   - SQL Database: IdentityServer    (sqldb-talent-ids-dev)
#
# Prerequisites:
#   az login
#   az account set --subscription "7d4355af-9f71-4123-8a18-aa68dc430bbf"
#   Resource group must exist (run setup-oidc.ps1 first)
#
# Usage (from repo root):
#   .\infra\scripts\setup-azure.ps1
# =============================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --- Configuration ------------------------------------------------------------
$RESOURCE_GROUP     = "rg-talent-dev"
$RESOURCE_LOCATION  = "westus3"
$TEMPLATE_FILE      = "infra/main.bicep"
$PARAMETERS_FILE    = "infra/parameters/dev.bicepparam"
$SQL_ADMIN_PASSWORD = 'Tr@7vK#2mX$9pL4!'
# ------------------------------------------------------------------------------

Write-Host ""
Write-Host "========================================================"
Write-Host " Azure Infrastructure Deployment"
Write-Host " Resource Group: $RESOURCE_GROUP"
Write-Host " Template:       $TEMPLATE_FILE"
Write-Host " Parameters:     $PARAMETERS_FILE"
Write-Host "========================================================"
Write-Host ""

Write-Host ">>> Ensuring resource group exists in $RESOURCE_LOCATION..."

az group create `
  --name $RESOURCE_GROUP `
  --location $RESOURCE_LOCATION `
  --output none

Write-Host "    Resource group ready: $RESOURCE_GROUP ($RESOURCE_LOCATION)"
Write-Host ""
Write-Host ">>> Deploying Bicep template..."

# Set env var so dev.bicepparam reads it via readEnvironmentVariable()
$env:SQL_ADMIN_PASSWORD = $SQL_ADMIN_PASSWORD

$DEPLOYMENT = az deployment group create `
  --resource-group $RESOURCE_GROUP `
  --template-file $TEMPLATE_FILE `
  --parameters $PARAMETERS_FILE `
  --parameters "location=$RESOURCE_LOCATION" `
  --output json | ConvertFrom-Json

if (-not $DEPLOYMENT) {
    Write-Error "Deployment failed - no output returned from az CLI."
    exit 1
}

Write-Host ""
Write-Host "========================================================"
Write-Host " Deployment Complete - Resource URLs"
Write-Host "========================================================"
Write-Host " API App:         $($DEPLOYMENT.properties.outputs.apiAppUrl.value)"
Write-Host " IdentityServer:  $($DEPLOYMENT.properties.outputs.identityAppUrl.value)"
Write-Host " Angular SWA:     $($DEPLOYMENT.properties.outputs.angularAppUrl.value)"
Write-Host " SQL FQDN:        $($DEPLOYMENT.properties.outputs.sqlServerFqdn.value)"
Write-Host "========================================================"
