# Azure Bicep Infrastructure Plan

## What is Azure Bicep?

**Azure Bicep is a declarative Infrastructure as Code (IaC) language** for defining and deploying Azure resources. Instead of clicking through the Azure Portal to create resources, you write a `.bicep` file that describes *what* you want — and Azure creates it.

### Bicep vs. the Azure Portal

Without Bicep, setting up this project's Azure infrastructure means:

1. Log into portal.azure.com
2. Manually create a Resource Group
3. Manually create an App Service Plan
4. Manually create two Web Apps
5. Manually create a SQL Server and two databases
6. Repeat for every new environment (staging, production)

With Bicep, all of that becomes **one command**:

```bash
az deployment group create \
  --resource-group rg-talent-dev \
  --template-file infra/main.bicep \
  --parameters infra/parameters/dev.bicepparam
```

Run it once and all resources are created. Run it again and Azure only updates what changed. Tear down the environment and recreate it identically in minutes.

### How Bicep Works

**Yes — Bicep templates are deployed using the Azure CLI** (`az` command) or Azure PowerShell. The typical workflow is:

```
Write .bicep file  →  Run az CLI command  →  Azure creates resources
```

Bicep is not a script that runs step by step. It is a **declaration** of the desired end state. Azure reads the file and figures out what to create, update, or leave alone.

### Bicep vs. ARM Templates

Bicep compiles down to ARM (Azure Resource Manager) templates — the native Azure deployment format. Bicep is a cleaner, more readable syntax that Microsoft built on top of ARM. You never need to write raw ARM JSON; write Bicep and the compiler handles the rest.

### Prerequisites for Running Bicep

Install these tools once:

```bash
# 1. Install Azure CLI
# Windows: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows
winget install Microsoft.AzureCLI

# 2. Install Bicep CLI (included with Azure CLI 2.20+, or install separately)
az bicep install

# 3. Log in to Azure
az login

# 4. Set your target subscription
az account set --subscription "Your Subscription Name"
```

### A Minimal Bicep Example

Here is what a Bicep file looks like — this creates one App Service Plan:

```bicep
param location string = 'eastus'
param appServicePlanName string = 'asp-talent-b1-dev'

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
}
```

Deploy it with:

```bash
az group create --name rg-talent-dev --location eastus
az deployment group create \
  --resource-group rg-talent-dev \
  --template-file infra/main.bicep
```

### Bicep in GitHub Actions

In this project, Bicep will be run from GitHub Actions as part of the CI/CD pipeline — so infrastructure changes are version-controlled and deployed automatically alongside code changes.

```yaml
- name: Deploy Bicep infrastructure
  uses: azure/arm-deploy@v1
  with:
    resourceGroupName: rg-talent-dev
    template: infra/main.bicep
    parameters: infra/parameters/dev.bicepparam
```

---

## Purpose

This document defines the infrastructure that should be provisioned with Bicep for the low-cost Azure deployment design.

The goal is to express the target Azure resources as Infrastructure as Code instead of relying on ad hoc portal setup.

## Bicep Scope

The Bicep template should provision:

1. App Service Plan
2. API Web App
3. IdentityServer Web App
4. Angular Static Web App
5. Azure SQL logical server
6. API database
7. IdentityServer database
8. optional Application Insights later, if budget allows

## Is Bicep a Separate Project or Repository?

**No — Bicep lives inside the parent repository, not in a separate repo.**

This project uses Git submodules. The parent repository (`AngularNetTutorial`) is the right place for Bicep because it orchestrates the full stack. The submodules (API, Angular, IdentityServer) contain only their own application code.

```
AngularNetTutorial/          ← parent repo — Bicep lives HERE
├── infra/                   ← all Bicep files
│   ├── main.bicep           ← entry point, composes all modules
│   ├── modules/             ← one file per resource type
│   │   ├── appServicePlan.bicep
│   │   ├── webApp.bicep
│   │   ├── staticWebApp.bicep
│   │   └── sqlServer.bicep
│   └── parameters/          ← one file per environment
│       ├── dev.bicepparam
│       └── prod.bicepparam
├── .github/
│   └── workflows/
│       ├── deploy-infra.yml         ← runs Bicep (infrastructure only)
│       ├── deploy-api.yml           ← deploys .NET API
│       ├── deploy-identityserver.yml
│       └── deploy-angular.yml       ← deploys Angular to Static Web Apps
├── ApiResources/TalentManagement-API/       ← git submodule
├── Clients/TalentManagement-Angular-Material/ ← git submodule
├── TokenService/Duende-IdentityServer/      ← git submodule
└── Tests/AngularNetTutorial-Playwright/     ← git submodule
```

### Why Not a Separate Repo?

A separate "infrastructure repo" is appropriate for large teams where a platform/ops team owns infrastructure independently of application code. For this project:

- the infrastructure is tightly coupled to one application stack
- Bicep changes and app code changes are often committed together
- a single parent repo keeps the full picture in one place
- the `infra/` folder is small — it does not warrant its own repo

### Four Separate Workflows, Not One

Infrastructure and application deployments use **separate GitHub Actions workflows**:

| Workflow | Trigger | What It Does |
|---|---|---|
| `deploy-infra.yml` | Manual or push to `infra/` | Runs Bicep — creates/updates Azure resources |
| `deploy-api.yml` | Push to `ApiResources/` submodule | Builds and deploys .NET API |
| `deploy-identityserver.yml` | Push to `TokenService/` submodule | Builds and deploys IdentityServer |
| `deploy-angular.yml` | Push to `Clients/` submodule | Builds Angular and deploys to Static Web Apps |

**Why separate?** Infrastructure rarely changes. Keeping it in its own workflow means an API code change does not re-run Bicep. It also makes it easier to run Bicep manually (first time setup) without triggering an application deployment.

### Deploy Order (First Time Setup)

On first setup, run the workflows in this order:

```
1. deploy-infra.yml        ← provision all Azure resources first
2. deploy-identityserver.yml ← IdentityServer must be up before API can validate tokens
3. deploy-api.yml           ← API needs IdentityServer running
4. deploy-angular.yml       ← Angular can deploy any time after infra is ready
```

After the first setup, each workflow runs independently on its own trigger.

---

## Recommended File Location

Create Bicep assets under:

```
infra/
├── main.bicep
├── modules/
│   ├── appServicePlan.bicep
│   ├── webApp.bicep
│   ├── staticWebApp.bicep
│   └── sqlServer.bicep
└── parameters/
    ├── dev.bicepparam
    └── prod.bicepparam
```

### GitHub Actions Workflow File

Create `.github/workflows/deploy-infra.yml` in the parent repository:

```yaml
name: Deploy Infrastructure (Bicep)

on:
  workflow_dispatch:          # manual trigger — run this first on new environments
  push:
    branches: [main]
    paths:
      - 'infra/**'            # only runs when Bicep files change

permissions:
  id-token: write             # required for Azure OpenID Connect (OIDC) login
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to Azure (OIDC — no stored secrets)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Create Resource Group (if it does not exist)
        run: |
          az group create \
            --name rg-talent-dev \
            --location eastus

      - name: Deploy Bicep infrastructure
        uses: azure/arm-deploy@v2
        with:
          resourceGroupName: rg-talent-dev
          template: infra/main.bicep
          parameters: infra/parameters/dev.bicepparam
          failOnStdErr: false
```

### Safeguarding AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_SUBSCRIPTION_ID

#### Where These Values Live

**These three IDs are never written inside any Bicep file or committed to source control.** They are stored exclusively as encrypted GitHub repository secrets and referenced in the workflow using `${{ secrets.SECRET_NAME }}` syntax.

```yaml
# In the workflow file — the actual values are NEVER visible here
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}       # resolved at runtime from GitHub Secrets
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

GitHub Secrets are:
- **encrypted at rest** — GitHub encrypts the value when you save it
- **masked in logs** — if a secret value appears in a workflow log, GitHub replaces it with `***`
- **never exposed to forks** — pull requests from forked repositories cannot access repository secrets
- **not visible after entry** — once saved, the value cannot be retrieved from the GitHub UI

#### Why OIDC — No Password Stored

The traditional approach to GitHub → Azure authentication uses a **client secret** (a password):

```
GitHub stores password → sends password to Azure → Azure validates password
```

The problem: that password is a long-lived credential. If it leaks (log file, PR comment, accident), an attacker has access until someone rotates it.

**OIDC (OpenID Connect) eliminates the password entirely:**

```
GitHub generates a short-lived JWT for this specific job run
→ Azure validates the JWT against the trusted GitHub OIDC issuer
→ Azure issues a short-lived access token (valid ~1 hour)
→ Job runs and token expires automatically
```

No password exists to leak. Even if an attacker intercepted the access token, it expires when the job ends.

#### Azure Side Setup (One-Time, Done in Azure Portal)

Before the workflow can authenticate, configure trust on the Azure side:

**Step 1 — Create an App Registration**

```
Azure Portal → Azure Active Directory → App registrations → New registration
Name: github-actions-talent-dev
```

This gives you the `AZURE_CLIENT_ID` (Application ID) and `AZURE_TENANT_ID` (shown on the overview page).

**Step 2 — Add a Federated Identity Credential**

```
App Registration → Certificates & secrets → Federated credentials → Add credential

Scenario: GitHub Actions deploying Azure resources
Organization: workcontrolgit
Repository: AngularNetTutorial
Entity type: Branch
Branch: main
```

This tells Azure: "trust JWT tokens issued by GitHub Actions for this specific repo and branch." No password is created.

**Step 3 — Grant the App Registration a Role on the Resource Group**

```
Azure Portal → Resource Groups → rg-talent-dev → Access control (IAM)
→ Add role assignment
Role: Contributor
Member: github-actions-talent-dev (the App Registration from Step 1)
```

> **Use Resource Group scope, not Subscription scope.** `Contributor` at the Subscription level gives access to all resources in your entire Azure subscription. Scoping to the resource group limits the blast radius — if the credential is ever misused, it can only affect `rg-talent-dev`.

**Step 4 — Add the Three Values as GitHub Secrets**

```
GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret
```

| Secret Name | Value | How to Find It |
|---|---|---|
| `AZURE_CLIENT_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | App Registration → Overview → Application (client) ID |
| `AZURE_TENANT_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | App Registration → Overview → Directory (tenant) ID |
| `AZURE_SUBSCRIPTION_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Azure Portal → Subscriptions → Subscription ID |

#### Automate the Setup with a Script

All four steps can be run with a single script instead of clicking through the portal. The script lives at `infra/scripts/setup-oidc.sh` in the repository.

**What the script does:**

* Creates the App Registration (`az ad app create`)
* Creates the Service Principal (`az ad sp create`)
* Adds the Federated Identity Credential for the `main` branch (`az ad app federated-credential create`)
* Creates the Resource Group if it does not yet exist (`az group create`)
* Grants `Contributor` on the Resource Group only (`az role assignment create`)
* Saves `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` directly to GitHub Secrets (`gh secret set`)

**Prerequisites before running:**

```bash
# Log in to Azure CLI and select the correct subscription
az login
az account set --subscription "Your Subscription Name"

# Log in to GitHub CLI (needed to write GitHub Secrets)
gh auth login
```

**Run the script once:**

```bash
# From the root of the repository
chmod +x infra/scripts/setup-oidc.sh
./infra/scripts/setup-oidc.sh
```

**Edit the configuration block at the top of the script** before running:

```bash
APP_NAME="github-actions-talent-dev"   # App Registration display name
RESOURCE_GROUP="rg-talent-dev"         # Resource group to grant access to
LOCATION="eastus"                       # Azure region
GITHUB_ORG="workcontrolgit"            # GitHub organisation
GITHUB_REPO="AngularNetTutorial"       # Repository name
BRANCH="main"                           # Branch that triggers deployments
```

**After the script finishes:**

The script prints a summary and reminds you to add the one secret it cannot generate — the SQL admin password:

```bash
gh secret set SQL_ADMIN_PASSWORD --repo workcontrolgit/AngularNetTutorial
```

Then verify all four secrets are present at:
`https://github.com/workcontrolgit/AngularNetTutorial/settings/secrets/actions`

> **Run once per environment.** For a `prod` environment, copy the script, set `APP_NAME="github-actions-talent-prod"` and `RESOURCE_GROUP="rg-talent-prod"`, and run again. This creates a separate App Registration with a separate Federated Credential scoped to the `prod` resource group.

---

#### Principle of Least Privilege

| Concern | Recommendation |
|---|---|
| Role scope | `Contributor` on the **resource group only** — not the subscription |
| Number of credentials | One App Registration per environment (`dev`, `prod`) — never share credentials across environments |
| Federated credential scope | Lock to a specific branch (`main`) — not `*` for all branches |
| `sqlAdminPassword` | Store as a GitHub secret, pass as a `--parameters` argument to Bicep — never hardcode in `.bicepparam` |

#### `sqlAdminPassword` — Handling Bicep Secure Parameters

The SQL admin password is a `@secure()` Bicep parameter. Never put it in `dev.bicepparam`. Instead, pass it at deploy time from a GitHub secret:

```yaml
- name: Deploy Bicep infrastructure
  uses: azure/arm-deploy@v2
  with:
    resourceGroupName: rg-talent-dev
    template: infra/main.bicep
    parameters: >
      infra/parameters/dev.bicepparam
      sqlAdminPassword=${{ secrets.SQL_ADMIN_PASSWORD }}
```

Add `SQL_ADMIN_PASSWORD` as a fourth GitHub repository secret containing the chosen password.

#### Required GitHub Secrets (Complete List)

| Secret | Purpose |
|---|---|
| `AZURE_CLIENT_ID` | Identifies the App Registration for OIDC login |
| `AZURE_TENANT_ID` | Identifies the Azure AD tenant |
| `AZURE_SUBSCRIPTION_ID` | Identifies the target Azure subscription |
| `SQL_ADMIN_PASSWORD` | Passed as a secure Bicep parameter — never in source files |

Set them at: **Repository → Settings → Secrets and variables → Actions → New repository secret**.

### Triggering the Workflow

After pushing the workflow file and setting the secrets:

```bash
# Option 1: Push a change to any file in infra/ — workflow triggers automatically
git add infra/main.bicep
git commit -m "Add initial Bicep infrastructure"
git push

# Option 2: Trigger manually from GitHub UI
# Go to: Actions → Deploy Infrastructure (Bicep) → Run workflow
```

## Required Resources

### App Service Plan

- SKU: `B1`
- OS: Linux preferred if both applications support it cleanly
- shared by both Web Apps

### Web App: API

- runtime configured for the target .NET version
- app settings for database connection and IdentityServer integration
- HTTPS only enabled

### Web App: IdentityServer

- runtime configured for the target .NET version
- app settings for IdentityServer database and external URLs
- HTTPS only enabled

### Azure SQL logical server

- administrator login configured as a deployment parameter
- firewall/network access kept minimal

### SQL databases

- one database for API
- one database for IdentityServer
- lowest practical starting SKU

## Bicep Parameters

Parameter names use **camelCase**. Resource name values follow the [Azure Cloud Adoption Framework (CAF) abbreviation convention](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations): `{type}-{workload}-{qualifier}-{env}`.

### Infrastructure Parameters

| Parameter | Type | Example Value | CAF Abbreviation |
|---|---|---|---|
| `location` | string | `eastus` | — |
| `environment` | string | `dev` | suffix for all names |
| `appServicePlanName` | string | `asp-talent-b1-dev` | `asp-` |
| `apiAppName` | string | `app-talent-api-dev` | `app-` |
| `identityAppName` | string | `app-talent-ids-dev` | `app-` |
| `angularStaticWebAppName` | string | `swa-talent-ui-dev` | `swa-` |
| `sqlServerName` | string | `sql-talent-dev` | `sql-` |
| `apiDatabaseName` | string | `sqldb-talent-api-dev` | `sqldb-` |
| `identityDatabaseName` | string | `sqldb-talent-ids-dev` | `sqldb-` |
| `sqlAdminLogin` | string | `sqladmin` | — |
| `sqlAdminPassword` | securestring | *(secret)* | `@secure()` |

### URL Parameters (used to configure IdentityServer and app settings)

These parameters are derived from the provisioned resource names and must be passed explicitly or computed in the Bicep template using `reference()`.

| Parameter | Type | Example Value | Used By |
|---|---|---|---|
| `angularAppUrl` | string | `https://swa-talent-ui-dev.azurestaticapps.net` | IdentityServer redirect URIs, API CORS |
| `apiAppUrl` | string | `https://app-talent-api-dev.azurewebsites.net` | Angular `environment.prod.ts`, IdentityServer |
| `identityAppUrl` | string | `https://app-talent-ids-dev.azurewebsites.net` | Angular `environment.prod.ts`, API `Sts:ServerUrl` |

> These URL parameters are the critical link between infrastructure provisioning and application configuration. They must be confirmed before configuring any app settings.

## Security Decisions

The Bicep implementation should enforce these defaults:

- `httpsOnly: true` on Web Apps
- no secrets committed into source control
- use parameters for credentials
- avoid unnecessary public exposure
- add managed identity later if required by the application design

## Configuration Strategy

The template should create infrastructure only.

Application secrets and environment-specific values should be applied separately through:

- Azure App Service configuration
- GitHub Actions deployment configuration
- secure deployment parameters

Avoid hardcoding live connection strings inside the Bicep files.

## Deployment Flow

Recommended flow:

1. deploy Bicep infrastructure
2. configure application settings
3. run database migrations
4. deploy IdentityServer
5. deploy API
6. validate auth and API connectivity

## Example Resource Relationships

- one App Service Plan hosts:
  - API Web App
  - IdentityServer Web App
- one SQL logical server hosts:
  - API database
  - IdentityServer database

## Out of Scope for Initial Template

These items are intentionally excluded from the first low-cost template unless required later:

- virtual network integration
- private endpoints
- deployment slots
- premium App Service tiers
- Azure Container Registry
- Container Apps resources

## Configuration Updates Required for Azure

Once the Azure resources are provisioned and their URLs are known, the following files must be updated before deploying.

---

### 1. IdentityServer — `identityserverdata.json`

**File:** `TokenService/Duende-IdentityServer/shared/identityserverdata.json`

Locate the `TalentManagement` client entry (ClientId: `"TalentManagement"`) and add the Azure SWA URLs alongside the existing localhost entries:

**`RedirectUris`** — add:
```
https://{angularAppUrl}
https://{angularAppUrl}/silent-refresh.html
https://{angularAppUrl}/callback
```

**`PostLogoutRedirectUris`** — add:
```
https://{angularAppUrl}
```

**`AllowedCorsOrigins`** — add:
```
https://{angularAppUrl}
```

**`ClientUri`** — update to:
```
https://{angularAppUrl}
```

> Keep the `localhost` entries. Removing them will break local development.

---

### 2. Angular — `environment.prod.ts`

**File:** `Clients/TalentManagement-Angular-Material/talent-management/src/environments/environment.prod.ts`

Current values that need updating:

```typescript
// BEFORE
apiUrl: 'https://your-production-api.com/api/v1',
identityServerUrl: 'https://localhost:44310',

// AFTER
apiUrl: 'https://{apiAppUrl}/api/v1',
identityServerUrl: 'https://{identityAppUrl}',
```

> In GitHub Actions, these can be injected at build time using `sed` or Angular's `fileReplacements` with environment variables, so the actual URLs do not need to be hardcoded in source control.

---

### 3. API — App Service Configuration (not `appsettings.json`)

**Do not** commit Azure connection strings or URLs to `appsettings.json`. Instead, set these in **Azure App Service → Configuration → Application settings**:

| Setting Name | Value |
|---|---|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string for `sqldb-talent-api-dev` |
| `Sts__ServerUrl` | `https://{identityAppUrl}` |
| `Sts__ValidIssuer` | `https://{identityAppUrl}` |
| `AllowedHosts` | `app-talent-api-dev.azurewebsites.net` |

> The current `appsettings.json` has `"AllowedHosts": "*"` and `Sts:ServerUrl: "https://localhost:44310"`. Both must be overridden via App Service configuration in Azure.

---

### 4. API — CORS Configuration

The API must allow cross-origin requests from the Angular Static Web App domain.

Check the CORS configuration in `appsettings.json` (or the `AddCorsExtension` call in `Program.cs`) and add:

```
https://{angularAppUrl}
```

as an allowed origin for the production CORS policy.

---

### 5. IdentityServer — App Service Configuration

Set in **Azure App Service → Configuration → Application settings** for `app-talent-ids-dev`:

| Setting Name | Value |
|---|---|
| `ConnectionStrings__ConfigurationDbConnection` | Azure SQL connection string for `sqldb-talent-ids-dev` |
| `ConnectionStrings__PersistedGrantDbConnection` | Azure SQL connection string for `sqldb-talent-ids-dev` |
| `ConnectionStrings__IdentityDbConnection` | Azure SQL connection string for `sqldb-talent-ids-dev` |
| `AdminConfiguration__IdentityAdminBaseUrl` | `https://app-talent-ids-dev.azurewebsites.net` |

---

### Configuration Update Checklist

- [ ] Add Azure SWA URLs to `RedirectUris` in `identityserverdata.json`
- [ ] Add Azure SWA URL to `PostLogoutRedirectUris` in `identityserverdata.json`
- [ ] Add Azure SWA URL to `AllowedCorsOrigins` in `identityserverdata.json`
- [ ] Update `environment.prod.ts` `apiUrl` to Azure API URL
- [ ] Update `environment.prod.ts` `identityServerUrl` to Azure IdentityServer URL
- [ ] Set `Sts__ServerUrl` and `Sts__ValidIssuer` in API App Service configuration
- [ ] Set `ConnectionStrings__DefaultConnection` in API App Service configuration
- [ ] Set IdentityServer database connection strings in IdentityServer App Service configuration
- [ ] Configure CORS in API to allow Angular Static Web App domain
- [ ] Create `staticwebapp.config.json` in Angular for SPA route fallback

---

## Decision Summary

The Bicep template should provision the smallest practical Azure footprint for this solution:

- one shared `B1` App Service Plan
- two Web Apps
- one shared Azure SQL logical server
- two databases

This keeps the infrastructure aligned with the low-cost hosting decision already documented in `docs/azure-deployment-plan.md`.
