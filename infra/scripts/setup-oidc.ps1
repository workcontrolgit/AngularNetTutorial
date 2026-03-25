# =============================================================================
# setup-oidc.ps1 — One-time Azure OIDC setup for GitHub Actions (PowerShell)
# =============================================================================
#
# Run this script ONCE per environment to wire up passwordless deployment.
# It creates an App Registration, adds a Federated Identity Credential so
# GitHub Actions can authenticate with Azure using short-lived OIDC tokens
# (no stored passwords), and saves the three required values as GitHub secrets.
#
# Prerequisites:
#   az login                              (logged in to Azure CLI)
#   az account set --subscription "..."   (correct subscription selected)
#   gh auth login                         (logged in to GitHub CLI)
#
# Usage:
#   .\infra\scripts\setup-oidc.ps1
# =============================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --- Configuration ------------------------------------------------------------
# Edit these values before running.

$APP_NAME           = "github-actions-talent-dev"   # App Registration display name
$RESOURCE_GROUP     = "rg-talent-dev"               # Resource group to manage
$LOCATION           = "eastus"                      # Azure region
$GITHUB_ORG         = "workcontrolgit"              # GitHub organisation or username
$GITHUB_REPO        = "AngularNetTutorial"          # GitHub repository name
$BRANCH             = "main"                        # Branch that triggers deployments
$SQL_ADMIN_PASSWORD = 'Tr@7vK#2mX$9pL4!'           # SQL admin password
# ------------------------------------------------------------------------------

Write-Host ""
Write-Host "========================================================"
Write-Host " Azure OIDC Setup for GitHub Actions"
Write-Host " App:   $APP_NAME"
Write-Host " Repo:  $GITHUB_ORG/$GITHUB_REPO  (branch: $BRANCH)"
Write-Host " RG:    $RESOURCE_GROUP  ($LOCATION)"
Write-Host "========================================================"
Write-Host ""

# --- Step 1: Create App Registration ------------------------------------------
Write-Host ">>> Step 1: Create App Registration"

$APP_ID = az ad app create `
  --display-name $APP_NAME `
  --query appId `
  --output tsv

Write-Host "    Created App Registration: $APP_ID"

# --- Step 2: Create Service Principal -----------------------------------------
Write-Host ">>> Step 2: Create Service Principal"

az ad sp create --id $APP_ID --output none

Write-Host "    Service Principal created"

# --- Step 3: Add Federated Identity Credential --------------------------------
Write-Host ">>> Step 3: Add Federated Identity Credential"

$TEMP_CRED_FILE = [System.IO.Path]::GetTempFileName() + ".json"
@{
  name        = "github-actions-branch-$BRANCH"
  issuer      = "https://token.actions.githubusercontent.com"
  subject     = "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/$BRANCH"
  audiences   = @("api://AzureADTokenExchange")
  description = "GitHub Actions OIDC for $GITHUB_ORG/$GITHUB_REPO branch $BRANCH"
} | ConvertTo-Json | Set-Content -Path $TEMP_CRED_FILE -Encoding UTF8

az ad app federated-credential create `
  --id $APP_ID `
  --parameters "@$TEMP_CRED_FILE" `
  --output none

Remove-Item $TEMP_CRED_FILE -Force

Write-Host "    Federated credential added (branch: $BRANCH)"

# --- Step 4a: Create Resource Group -------------------------------------------
Write-Host ">>> Step 4a: Create Resource Group (idempotent)"

az group create `
  --name $RESOURCE_GROUP `
  --location $LOCATION `
  --output none

Write-Host "    Resource group ready: $RESOURCE_GROUP"

# --- Step 4b: Grant Contributor Role on Resource Group ------------------------
Write-Host ">>> Step 4b: Grant Contributor role on $RESOURCE_GROUP"

$SUBSCRIPTION_ID = az account show --query id --output tsv
$SCOPE = "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"

az role assignment create `
  --assignee $APP_ID `
  --role "Contributor" `
  --scope $SCOPE `
  --output none

Write-Host "    Contributor role granted on: $SCOPE"

# --- Step 5: Retrieve Tenant ID -----------------------------------------------
$TENANT_ID = az account show --query tenantId --output tsv

# --- Step 6: Save Secrets to GitHub Repository --------------------------------
Write-Host ">>> Step 6: Save secrets to GitHub repository"

gh secret set AZURE_CLIENT_ID       --body $APP_ID              --repo "${GITHUB_ORG}/${GITHUB_REPO}"
gh secret set AZURE_TENANT_ID       --body $TENANT_ID           --repo "${GITHUB_ORG}/${GITHUB_REPO}"
gh secret set AZURE_SUBSCRIPTION_ID --body $SUBSCRIPTION_ID     --repo "${GITHUB_ORG}/${GITHUB_REPO}"
gh secret set SQL_ADMIN_PASSWORD    --body $SQL_ADMIN_PASSWORD  --repo "${GITHUB_ORG}/${GITHUB_REPO}"

Write-Host "    AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID, SQL_ADMIN_PASSWORD saved"

# --- Done ---------------------------------------------------------------------
Write-Host ""
Write-Host "========================================================"
Write-Host " Summary"
Write-Host "========================================================"
Write-Host " AZURE_CLIENT_ID:       $APP_ID"
Write-Host " AZURE_TENANT_ID:       $TENANT_ID"
Write-Host " AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
Write-Host " SQL_ADMIN_PASSWORD:    (set)"
Write-Host ""
Write-Host " Verify all 4 secrets at:"
Write-Host "   https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/secrets/actions"
Write-Host ""
Write-Host " OIDC setup complete. GitHub Actions can now deploy to Azure"
Write-Host " without any stored passwords or client secrets."
Write-Host "========================================================"
