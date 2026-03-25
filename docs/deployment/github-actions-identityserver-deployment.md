# GitHub Actions Deployment Plan for IdentityServer

## Purpose

This document defines the GitHub Actions deployment approach for the IdentityServer application that supports the Talent Management API.

IdentityServer is deployed separately from the API, but both applications share the same Azure App Service Plan.

## Deployment Target

- Azure App Service
- separate Web App for IdentityServer
- shared `Basic B1` App Service Plan with the API

## Authentication Model

Use Azure OpenID Connect from GitHub Actions.

Required GitHub secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

If the API and IdentityServer are deployed from separate repositories, each repository must hold its own GitHub secrets or use GitHub environments with shared policy.

## Workflow Responsibilities

The IdentityServer workflow should:

1. trigger on pushes to the deployment branch
2. restore packages
3. build the IdentityServer solution or project
4. run tests
5. publish the IdentityServer host project
6. deploy the published output to the IdentityServer Web App

## Suggested Workflow File

Store the workflow as:

- `.github/workflows/deploy-identityserver.yml`

## Suggested Workflow Structure

The exact project path depends on the IdentityServer repository layout, but the structure should mirror the API deployment pipeline:

```yaml
name: Deploy IdentityServer

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
        run: dotnet restore

      - name: Build
        run: dotnet build -c Release --no-restore

      - name: Test
        run: dotnet test -c Release --no-build

      - name: Publish IdentityServer
        run: dotnet publish <IdentityServerHostProject>.csproj -c Release -o ./publish/identity

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy Identity Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: app-talent-ids-dev
          package: ./publish/identity
```

## IdentityServer Settings Required in Azure

These settings should be stored in Azure App Service configuration:

- IdentityServer database connection string
- issuer URL / public origin settings
- client URLs
- signing and certificate-related settings
- external provider settings if used

## Operational Notes

IdentityServer is a dependency for the API authentication flow.

That means:

- IdentityServer should generally be deployed before the API when auth-related changes are involved
- the API configuration must point to the correct Azure IdentityServer URL
- post-deployment validation must include the discovery document and token issuance flow

## Decision Summary

IdentityServer should have its own GitHub Actions deployment workflow and its own Web App, even though it shares the same App Service Plan and Azure SQL logical server with the API.
