# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **tutorial repository** demonstrating the **CAT (Client, API Resource, Token Service)** pattern using Git submodules. Each component is a separate repository that can be developed independently.

**Tutorial Repository**: https://github.com/workcontrolgit/AngularNetTutotial.git

## Architecture: CAT Pattern with Git Submodules

### Three-Tier Architecture

```
AngularNetTutorial/
├── Clients/TalentManagement-Angular-Material/     # Git submodule
├── ApiResources/TalentManagement-API/             # Git submodule
└── TokenService/Duende-IdentityServer/            # Git submodule
```

Each folder is a **git submodule** pointing to its own repository:
- `Clients/`: Angular 20 + Material Design client (ng-matero template)
- `ApiResources/`: .NET 10 Web API with Clean Architecture
- `TokenService/`: Duende IdentityServer 7.0 for OAuth 2.0/OIDC

### Authentication Flow

1. User visits Angular app (`http://localhost:4200`)
2. Login redirects to IdentityServer (`https://localhost:44310`)
3. IdentityServer authenticates user, issues ID token + access token
4. Angular stores tokens, attaches access token to API requests
5. API validates token against IdentityServer, returns protected data

## Running the Full Stack

**Start all three services in this order:**

```bash
# Terminal 1: IdentityServer (must start first)
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet run

# Terminal 2: API (needs IdentityServer running)
cd ApiResources/TalentManagement-API
dotnet run

# Terminal 3: Angular Client
cd Clients/TalentManagement-Angular-Material/talent-management
npm start
```

**Application URLs:**
- Angular: `http://localhost:4200`
- API: `https://localhost:44378`
- IdentityServer: `https://localhost:44310`
- IdentityServer Admin: `https://localhost:44303`
- IdentityServer Admin API: `https://localhost:44302`

## Working with Git Submodules

### Initial Clone

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git

# Or initialize submodules after cloning
git submodule update --init --recursive
```

### Making Changes in a Submodule

**Critical**: Submodules have their own Git history. Changes must be committed in the submodule first, then the parent.

```bash
# 1. Navigate to submodule and make changes
cd Clients/TalentManagement-Angular-Material
git checkout develop  # or appropriate branch
# ... make your changes ...
git add .
git commit -m "Your changes"
git push

# 2. Return to parent and update reference
cd ../..
git add Clients/TalentManagement-Angular-Material
git commit -m "Update Angular client submodule"
git push
```

### Pulling Latest Changes

```bash
# Pull parent repo changes
git pull

# Update all submodules to their referenced commits
git submodule update --init --recursive

# OR pull latest from submodule's remote branch
git submodule update --remote --merge
```

### Check Submodule Status

```bash
git submodule status
# Shows current commit hash for each submodule
```

### Common Submodule Issues

**Submodule shows modified but you didn't change anything:**
- Submodule is on a different commit than parent expects
- Navigate to submodule: `cd Clients/TalentManagement-Angular-Material`
- Check status: `git status` and `git log`
- Reset to parent's expected commit or commit the change

**Submodule folder is empty:**
```bash
git submodule update --init --recursive
```

## Configuration Dependencies

### IdentityServer Configuration

**File**: `TokenService/Duende-IdentityServer/src/Duende.Admin/identityserverdata.json`

Key configuration for Angular client:
```json
{
  "ClientId": "TalentManagement",
  "AllowedScopes": [
    "openid",
    "email",
    "profile",
    "roles",
    "app.api.talentmanagement.read",
    "app.api.talentmanagement.write"
  ],
  "RedirectUris": ["http://localhost:4200/callback"],
  "PostLogoutRedirectUris": ["http://localhost:4200"]
}
```

### Angular Environment Configuration

**File**: `Clients/TalentManagement-Angular-Material/talent-management/src/environments/environment.ts`

Must match IdentityServer configuration:
```typescript
identityServerUrl: 'https://localhost:44310'
clientId: 'TalentManagement'
scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write'
```

### API Configuration

**File**: `ApiResources/TalentManagement-API/appsettings.json`

Must trust IdentityServer:
```json
{
  "IdentityServer": {
    "Authority": "https://localhost:44310"
  }
}
```

## Development Workflow

### Branching Strategy

Parent repository tracks submodule commits, not branches. Each submodule has its own branch strategy:
- Angular: Uses `develop` and `master` branches
- API: Check submodule for branch strategy
- IdentityServer: Check submodule for branch strategy

### Testing Changes Across Multiple Submodules

When changes span multiple components (e.g., new API endpoint + Angular UI):

1. Make changes in API submodule, commit, push
2. Make changes in Angular submodule, commit, push
3. Update parent repo to reference both new commits
4. Test the integration locally before pushing parent

### Port Conflicts

If ports are already in use:
- **IdentityServer**: Edit `Properties/launchSettings.json`
- **API**: Edit `Properties/launchSettings.json`
- **Angular**: Use `ng serve --port 4201` or edit `angular.json`

## Component-Specific Documentation

Each submodule has its own documentation:

### Angular Client Documentation
- `Clients/TalentManagement-Angular-Material/docs/claude-code-guide.md` - Comprehensive development guide
- `Clients/TalentManagement-Angular-Material/docs/` - Feature plans, implementation guides

### API Documentation
- Check `ApiResources/TalentManagement-API/` for API-specific documentation

### IdentityServer Documentation
- Check `TokenService/Duende-IdentityServer/` for IdentityServer configuration guides

## Common Development Tasks

### Adding a New API Scope

1. Update `TokenService/.../identityserverdata.json` with new scope
2. Restart IdentityServer
3. Update Angular `environment.ts` scope string
4. Update API to protect endpoints with `[Authorize]` requiring the scope

### Troubleshooting Authentication Issues

Common issue: **"invalid_scope" error**
- Cause: Angular requests a scope not in IdentityServer's `AllowedScopes`
- Fix: Ensure `environment.ts` scope matches `identityserverdata.json` exactly

Common issue: **Angular stuck at login page after successful auth**
- Cause: Auth guard using wrong authentication service
- Fix: Verify `auth-guard.ts` uses `OidcAuthService.isAuthenticated()`

Common issue: **CORS errors**
- Cause: IdentityServer URL mismatch
- Fix: Ensure `environment.ts` identityServerUrl matches running IdentityServer URL

### Verifying Full Stack Integration

1. Start all three services
2. Navigate to `http://localhost:4200`
3. Click login → should redirect to IdentityServer
4. Login with test credentials
5. Should redirect back to Angular dashboard
6. API calls should work (check Network tab for 200 responses with Bearer token)
