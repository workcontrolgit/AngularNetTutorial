#!/usr/bin/env bash
# =============================================================================
# setup-oidc.sh — One-time Azure OIDC setup for GitHub Actions
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
#   chmod +x infra/scripts/setup-oidc.sh
#   ./infra/scripts/setup-oidc.sh
# =============================================================================

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
# Edit these values before running.

APP_NAME="github-actions-talent-dev"   # App Registration display name in Azure AD
RESOURCE_GROUP="rg-talent-dev"         # Resource group the deployment identity can manage
LOCATION="eastus"                       # Azure region for the resource group
GITHUB_ORG="workcontrolgit"            # GitHub organisation or username
GITHUB_REPO="AngularNetTutorial"       # GitHub repository name (no owner prefix)
BRANCH="main"                           # Branch that triggers deployments
# ──────────────────────────────────────────────────────────────────────────────

echo ""
echo "========================================================"
echo " Azure OIDC Setup for GitHub Actions"
echo " App:   $APP_NAME"
echo " Repo:  $GITHUB_ORG/$GITHUB_REPO  (branch: $BRANCH)"
echo " RG:    $RESOURCE_GROUP  ($LOCATION)"
echo "========================================================"
echo ""

# ─── Step 1: Create App Registration ──────────────────────────────────────────
echo ">>> Step 1: Create App Registration"

APP_ID=$(az ad app create \
  --display-name "$APP_NAME" \
  --query appId \
  --output tsv)

echo "    Created App Registration: $APP_ID"

# ─── Step 2: Create Service Principal ─────────────────────────────────────────
echo ">>> Step 2: Create Service Principal"

az ad sp create --id "$APP_ID" --output none

echo "    Service Principal created"

# ─── Step 3: Add Federated Identity Credential ────────────────────────────────
echo ">>> Step 3: Add Federated Identity Credential"
#
# This tells Azure: "trust JWT tokens from GitHub Actions for this exact
# repo and branch — no password needed."

FEDERATED_CREDENTIAL=$(cat <<EOF
{
  "name": "github-actions-branch-${BRANCH}",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/${BRANCH}",
  "audiences": ["api://AzureADTokenExchange"],
  "description": "GitHub Actions OIDC for ${GITHUB_ORG}/${GITHUB_REPO} branch ${BRANCH}"
}
EOF
)

az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters "$FEDERATED_CREDENTIAL" \
  --output none

echo "    Federated credential added (branch: $BRANCH)"

# ─── Step 4a: Create Resource Group ───────────────────────────────────────────
echo ">>> Step 4a: Create Resource Group (idempotent)"

az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo "    Resource group ready: $RESOURCE_GROUP"

# ─── Step 4b: Grant Contributor Role on Resource Group ────────────────────────
echo ">>> Step 4b: Grant Contributor role on $RESOURCE_GROUP"
#
# Scoped to the resource group only — not the entire subscription.
# Least-privilege: the deployment identity can only touch rg-talent-dev.

SUBSCRIPTION_ID=$(az account show --query id --output tsv)
SCOPE="/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}"

az role assignment create \
  --assignee "$APP_ID" \
  --role "Contributor" \
  --scope "$SCOPE" \
  --output none

echo "    Contributor role granted on: $SCOPE"

# ─── Step 5: Retrieve Tenant ID ───────────────────────────────────────────────
TENANT_ID=$(az account show --query tenantId --output tsv)

# ─── Step 6: Save Secrets to GitHub Repository ────────────────────────────────
echo ">>> Step 6: Save secrets to GitHub repository"

gh secret set AZURE_CLIENT_ID       --body "$APP_ID"          --repo "${GITHUB_ORG}/${GITHUB_REPO}"
gh secret set AZURE_TENANT_ID       --body "$TENANT_ID"       --repo "${GITHUB_ORG}/${GITHUB_REPO}"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID" --repo "${GITHUB_ORG}/${GITHUB_REPO}"

echo "    AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID saved"

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "========================================================"
echo " Summary"
echo "========================================================"
echo " AZURE_CLIENT_ID:       $APP_ID"
echo " AZURE_TENANT_ID:       $TENANT_ID"
echo " AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo ""
echo " One secret still needed — set it manually:"
echo ""
echo "   gh secret set SQL_ADMIN_PASSWORD --repo ${GITHUB_ORG}/${GITHUB_REPO}"
echo ""
echo " Then verify all 4 secrets at:"
echo "   https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/secrets/actions"
echo ""
echo " OIDC setup complete. GitHub Actions can now deploy to Azure"
echo " without any stored passwords or client secrets."
echo "========================================================"
