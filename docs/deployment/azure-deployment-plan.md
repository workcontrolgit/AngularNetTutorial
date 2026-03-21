# Azure Deployment Plan

## Goal

Deploy the full Talent Management stack — Angular client, .NET API, and IdentityServer — to Azure from GitHub at the lowest practical monthly cost, while keeping the design clean enough to support the existing IdentityServer integration and future growth.

This plan assumes:

- Azure budget target is approximately `$50/month`
- The API and IdentityServer will both run in Azure App Service
- The Angular SPA will be deployed to Azure Static Web Apps
- A single Azure SQL logical server will be shared
- The SQL server will host two databases:
  - `TalentManagementApiDb`
  - `IdentityServerDb`

## Final Decision

Use the following Azure footprint:

1. One Azure Resource Group
2. One Azure App Service Plan on the `Basic B1` tier
3. Two Azure Web Apps on that same App Service Plan
   - one for the API
   - one for IdentityServer
4. One Azure Static Web App for the Angular client
5. One shared Azure SQL logical server
6. Two separate Azure SQL databases on that server
   - one for the API
   - one for IdentityServer
7. GitHub Actions for CI/CD using Azure OpenID Connect authentication

## Why This Decision

This is the lowest-cost practical option for the current requirement.

### App Service decision

Azure App Service was selected instead of Azure Container Apps because:

- it is simpler to operate for standard ASP.NET Core applications
- it avoids container-specific complexity
- it fits the current repo better for straightforward GitHub Actions deployment
- it is easier to keep cost predictable for a small two-app setup

The `Basic B1` App Service Plan was selected because:

- it is the lowest dedicated App Service tier appropriate for a real hosted app
- both the API and IdentityServer can share the same plan
- Azure charges at the App Service Plan level, so placing both apps on one plan is significantly cheaper than separate plans

### Database decision

A single Azure SQL logical server with two databases was selected because:

- the API and IdentityServer remain logically isolated
- administration stays simple
- cost stays lower than using more infrastructure than necessary
- this matches the stated requirement that both apps share the same SQL server

Each application gets its own database because:

- it avoids coupling the application data model to the IdentityServer schema
- migrations stay independent
- backup/restore and troubleshooting remain cleaner

### Angular deployment decision

Azure Static Web Apps was selected for the Angular client because:

- it is purpose-built for static SPAs and has a free tier suitable for development and demo
- it provides built-in GitHub Actions CI/CD with automatic preview deployments for pull requests
- it includes a built-in CDN and global edge distribution at no extra cost
- it avoids the overhead of running a web server just to serve static files
- adding a third App Service Web App for a static SPA would waste compute resources and increase cost unnecessarily

The Angular app will be built via `ng build` and the `dist/talent-management/browser` output folder deployed as static assets.

### CI/CD decision

GitHub Actions with Azure OpenID Connect was selected because:

- it integrates directly with the GitHub repository
- it avoids long-lived deployment credentials where possible
- it is the recommended modern deployment model for Azure from GitHub

## Target Architecture

### Azure resources

- Resource Group: one shared resource group for the environment
- App Service Plan: `Basic B1`
- Web App 1: Talent Management API
- Web App 2: IdentityServer
- Static Web App: Angular client (Free tier)
- Azure SQL logical server: shared
- Azure SQL database 1: API database
- Azure SQL database 2: IdentityServer database

### Networking and configuration

- keep all App Service resources in the same Azure region
- store connection strings in App Service configuration, not in source control
- store feature flags and environment-specific settings in App Service configuration
- keep production secrets out of `appsettings.json`
- configure Angular production `environment.ts` with Azure API and IdentityServer URLs at build time via GitHub Actions environment variables
- set CORS on the API Web App to allow requests from the Static Web App domain

## Cost-First Constraints

This design is intentionally optimized for cost first, not scale first.

Expected cost controls:

- one shared `B1` App Service Plan instead of two plans
- Angular on Azure Static Web Apps Free tier (no compute cost)
- one shared Azure SQL logical server
- smallest practical database tiers at the start
- no extra container registry unless later required
- no premium networking or premium compute features initially

## Known Tradeoffs

This design has limits that need to be acknowledged.

### Angular Static Web Apps Free tier

The Free tier has limits that may require upgrading to Standard (~$9/month):

- custom domain with free managed TLS is supported
- no SLA on the Free tier
- limited staging environments on Free (only 3 pre-production environments)
- if a backend API proxy or serverless functions are added later, Standard is required

For development, demo, and MVP usage the Free tier is appropriate. Upgrade to Standard when an SLA or additional staging environments are needed.

### Shared App Service Plan

Both applications will compete for the same compute resources.

Implications:

- heavy IdentityServer traffic can affect API responsiveness
- heavy API traffic can affect login/token endpoints
- scaling one app means scaling both apps together while they share the same plan

This is acceptable for:

- development
- demo
- MVP
- low-traffic internal usage

This is not ideal for:

- medium or high production traffic
- independent scaling needs
- strict performance isolation

### Low-cost SQL tiers

Starting with the cheapest SQL option reduces cost, but performance headroom is limited.

Implications:

- query throughput is limited
- IdentityServer persisted grant activity may become a bottleneck earlier than expected
- future upgrade to a higher tier may be required

## Recommended Starting SKUs

These are the initial SKUs to provision unless testing shows they are too small.

### Compute

- Azure App Service Plan: `Basic B1`

### Databases

- `TalentManagementApiDb`: low-cost Azure SQL single database tier
- `IdentityServerDb`: low-cost Azure SQL single database tier

The exact database SKU should be confirmed in the Azure Pricing Calculator at provisioning time because pricing changes over time and may vary by region.

## Deployment Flow

### Phase 1: Provision Azure resources

Create:

1. Resource Group
2. App Service Plan (`B1`)
3. Web App for the API
4. Web App for IdentityServer
5. Static Web App for the Angular client (Free tier)
6. Shared Azure SQL logical server
7. API database
8. IdentityServer database

### Phase 2: Configure application settings

For the API Web App:

- API database connection string
- IdentityServer authority / STS URL
- JWT and auth-related settings
- feature flags
- environment-specific URLs

For the IdentityServer Web App:

- IdentityServer database connection string
- signing and runtime settings
- client/app URLs (including Angular Static Web App URL as allowed redirect/logout URI)

For the Angular Static Web App:

- `API_URL` — production API base URL (injected at build time via GitHub Actions)
- `IDENTITY_SERVER_URL` — production IdentityServer URL
- configure `staticwebapp.config.json` for SPA fallback routing (all routes return `index.html`)

### Phase 3: Configure GitHub deployment

Set up GitHub Actions authentication with Azure using:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Then create deployment workflows for:

1. IdentityServer
2. Talent Management API
3. Angular client

For the .NET workflows (IdentityServer and API), each workflow should:

1. restore
2. build
3. test
4. publish
5. deploy to the target Web App

For the Angular workflow:

1. install (`npm ci`)
2. build production (`ng build --configuration production`)
3. deploy `dist/talent-management/browser` to Azure Static Web Apps using the `Azure/static-web-apps-deploy` GitHub Action

Note: Azure Static Web Apps GitHub Actions integration can be bootstrapped automatically by the Azure portal — it commits a workflow file directly to the repository. This is the easiest starting point.

### Phase 4: Database migration strategy

Run migrations separately for each application:

- API migrations against `TalentManagementApiDb`
- IdentityServer migrations against `IdentityServerDb`

Migration execution should be explicit and environment-aware. Do not assume both apps can safely auto-migrate on startup in production.

### Phase 5: Validation

Validate:

- Angular app loads at the Static Web App URL
- login redirects to IdentityServer and returns to Angular correctly
- API health and Swagger endpoint
- IdentityServer discovery endpoint
- database connectivity
- token issuance
- API token validation against IdentityServer
- Angular API calls return data with Bearer token (check Network tab)

## Environment Naming Proposal

Suggested dev naming:

- Resource Group: `rg-talent-dev`
- App Service Plan: `asp-talent-b1-dev`
- API Web App: `app-talent-api-dev`
- Identity Web App: `app-talent-ids-dev`
- Angular Static Web App: `swa-talent-ui-dev`
- SQL Server: `sql-talent-dev`
- API DB: `sqldb-talent-api-dev`
- Identity DB: `sqldb-talent-ids-dev`

## Decision Summary

The chosen Azure deployment design is:

- Azure App Service, not Container Apps
- one shared `Basic B1` App Service Plan
- two Web Apps on that shared plan (API + IdentityServer)
- Azure Static Web Apps Free tier for the Angular client
- one shared Azure SQL logical server
- two separate Azure SQL databases
- GitHub Actions with Azure OpenID Connect

This is the best fit for the current requirement because it keeps monthly cost low, uses the right hosting model for each component (static hosting for the SPA, managed web servers for .NET), respects the shared SQL server constraint, and remains simple to deploy and operate from GitHub.
