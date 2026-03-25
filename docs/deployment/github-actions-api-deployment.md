# GitHub Actions Deployment Plan for Talent Management API

## Purpose

This document defines the GitHub Actions deployment approach for the `TalentManagementAPI.WebApi` project when deploying to Azure App Service.

The target Azure resource is a dedicated Web App hosted on a shared `Basic B1` App Service Plan.

## Deployment Target

- Azure App Service
- separate Web App for the API
- shared App Service Plan with IdentityServer

## Authentication Model

Use Azure OpenID Connect from GitHub Actions.

Required GitHub secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

This avoids storing long-lived publish-profile credentials in GitHub.

## Workflow Responsibilities

The API workflow should:

1. trigger on pushes to the deployment branch
2. restore NuGet packages
3. build the solution
4. run tests
5. publish the API project
6. deploy the published output to the API Web App

## Suggested Workflow File

Store the workflow as:

- `.github/workflows/deploy-api.yml`

## Recommended Trigger

Start with:

- push to `main`

Optional later refinements:

- path filtering for API-related files only
- manual dispatch for controlled releases
- environment approvals for production

## Recommended Build Scope

Restore and build from the solution root:

- `TalentManagementAPI.slnx`

Publish only:

- `TalentManagementAPI.WebApi/TalentManagementAPI.WebApi.csproj`

## Suggested Workflow Structure

```yaml
name: Deploy Talent Management API

on:
  push:
    branches: [ main ]

permissions:
  id-token: write
  contents: read

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore
        run: dotnet restore TalentManagementAPI.slnx

      - name: Build
        run: dotnet build TalentManagementAPI.slnx -c Release --no-restore

      - name: Test
        run: dotnet test TalentManagementAPI.slnx -c Release --no-build

      - name: Publish API
        run: dotnet publish TalentManagementAPI.WebApi/TalentManagementAPI.WebApi.csproj -c Release -o ./publish/api

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy API Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: app-talent-api-dev
          package: ./publish/api
```

## App Settings Required in Azure

These settings should be configured in the Azure Web App, not committed to source control:

- API database connection string
- `Sts:ServerUrl`
- `Sts:ValidIssuer`
- `Sts:Audience`
- feature flags such as `FeatureManagement__AiEnabled`
- any production-specific cache and mail settings

## Notes About Database Migration

Do not couple deployment to automatic production migration unless the migration strategy has been reviewed.

Preferred options:

1. separate migration step in the release process
2. controlled manual migration
3. explicit pipeline step added later after validation

## Decision Summary

The API deployment workflow should be a standard GitHub Actions build/test/publish/deploy pipeline targeting Azure App Service through OpenID Connect authentication.
