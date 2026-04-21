# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **tutorial repository** demonstrating the **CAT (Client, API Resource, Token Service)** pattern using Git submodules. Each component is a separate repository that can be developed independently.

**Tutorial Repository**: https://github.com/workcontrolgit/AngularNetTutorial.git

## Architecture: CAT Pattern with Git Submodules

### Three-Tier Architecture with E2E Testing

```
AngularNetTutorial/
├── Clients/TalentManagement-Angular-Material/     # Git submodule
├── ApiResources/TalentManagement-API/             # Git submodule
├── TokenService/Duende-IdentityServer/            # Git submodule
└── Tests/AngularNetTutorial-Playwright/           # Git submodule
```

Each folder is a **git submodule** pointing to its own repository:
- `Clients/`: Angular 20 + Material Design client (ng-matero template)
- `ApiResources/`: .NET 10 Web API with Clean Architecture
- `TokenService/`: Duende IdentityServer 7.0 for OAuth 2.0/OIDC
- `Tests/`: Playwright end-to-end tests for the full stack

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

## Running End-to-End Tests

**Prerequisites:** All three services must be running (IdentityServer, API, Angular).

```bash
# Navigate to Playwright tests
cd Tests/AngularNetTutorial-Playwright

# Install dependencies (first time only)
npm install

# Run tests headless
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/auth.spec.ts

# View test report
npx playwright show-report
```

**Common Playwright Commands:**
- `npx playwright codegen http://localhost:4200` - Generate tests by recording interactions
- `npx playwright test --debug` - Run tests in debug mode
- `npx playwright test --project=chromium` - Run tests on specific browser

## Working with Git Submodules

### Initial Clone

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutorial.git

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
3. Update E2E tests in Playwright submodule if needed, commit, push
4. Update parent repo to reference all new commits
5. Run E2E tests to verify integration before pushing parent

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

### Playwright E2E Tests Documentation
- Check `Tests/AngularNetTutorial-Playwright/` for test documentation and test organization

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

**Manual Testing:**
1. Start all three services
2. Navigate to `http://localhost:4200`
3. Click login → should redirect to IdentityServer
4. Login with test credentials (`ashtyn1` / `Pa$$word123`)
5. Should redirect back to Angular dashboard
6. API calls should work (check Network tab for 200 responses with Bearer token)

**Automated Testing:**
7. Run Playwright E2E tests to verify critical user flows:
   ```bash
   cd Tests/AngularNetTutorial-Playwright
   npx playwright test
   ```

**Admin UI Access:**
- URL: https://localhost:44303
- Credentials: `admin` / `Pa$$word123`

---

## Git Commit Guidelines

When asked to commit code changes to the repository, follow these guidelines:

### Commit Message Format

**Write concise, descriptive commit messages without AI co-authorship attribution:**

```bash
# Good examples
git commit -m "Add blogs folder with Medium.com template and git submodule article"
git commit -m "Fix broken image link in git submodule blog post"
git commit -m "Update Angular environment configuration for production"
git commit -m "Refactor authentication service to use OIDC"

# Bad examples (avoid these)
git commit -m "Updated files"  # Too vague
git commit -m "Fixed stuff"     # Not descriptive
git commit -m "🤖 Generated with Claude Code"  # No AI attribution
```

### Commit Message Guidelines

* **Be descriptive but concise** — 50-72 characters max for the subject line
* **Use imperative mood** — "Add feature" not "Added feature" or "Adds feature"
* **Focus on what changed** — Describe the change, not the process
* **No AI attribution** — Do not reference Claude, AI assistance, or co-authorship
* **Group related changes** — Combine logically related file changes into one commit

### Standard Commit Workflow

When user requests "check in code" or "commit changes":

```bash
# 1. Stage all changes
git add .

# 2. Commit with descriptive message (no AI attribution)
git commit -m "Brief description of changes"

# 3. Push to remote
git push
```

### Multi-File Commit Examples

**When adding new features:**
```bash
git commit -m "Add authentication guard and login component"
```

**When updating documentation:**
```bash
git commit -m "Update README with deployment instructions"
```

**When fixing bugs:**
```bash
git commit -m "Fix token refresh logic in auth interceptor"
```

**When refactoring:**
```bash
git commit -m "Refactor employee service to use RxJS operators"
```

### What NOT to Include

* ❌ AI tool references ("Generated by Claude", "AI-assisted commit")
* ❌ Co-author attributions to AI assistants
* ❌ Workflow descriptions ("Used Claude Code to...", "Asked AI to...")
* ❌ Excessive detail in commit message (save that for PR descriptions)
* ❌ Emoji or special characters (unless project convention)

---

## Writing Medium.com Compatible Blog Posts

When creating blog posts or documentation for Medium.com, follow these guidelines to ensure proper formatting and compatibility.

### Medium.com Formatting Rules

**CRITICAL: Medium.com does NOT support tables.** All content must use alternative formatting.

### Replace Tables With Lists

**❌ DON'T use tables:**
```markdown
| Tool | Version | Purpose |
|------|---------|---------|
| .NET | 10.0+ | Backend |
```

**✅ DO use bullet lists with em dashes (—):**
```markdown
* **.NET SDK 10.0+** — Build and run .NET applications
* **Node.js 20.x LTS** — Run Angular development server
* **Git (Latest)** — Version control and submodules
```

### Technology Stack Formatting

**❌ DON'T use tables for tech stacks:**
```markdown
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 20.x | Frontend |
```

**✅ DO use descriptive bullets:**
```markdown
**Technology Stack:**

* **Angular 20** — Frontend framework
* **Angular Material 20** — UI component library
* **TypeScript 5.x** — Type-safe JavaScript
* **RxJS 7.x** — Reactive programming
```

### API Endpoints Formatting

**❌ DON'T use tables for API endpoints:**
```markdown
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/employees | read |
```

**✅ DO use descriptive bullets:**
```markdown
**API Endpoints (Employees):**

* **GET /api/v1/employees** — Get all employees (requires `read` scope)
* **GET /api/v1/employees/{id}** — Get employee by ID (requires `read` scope)
* **POST /api/v1/employees** — Create employee (requires `write` scope)
* **PUT /api/v1/employees/{id}** — Update employee (requires `write` scope)
* **DELETE /api/v1/employees/{id}** — Delete employee (requires `write` scope)
```

### Comparison/Reference Formatting

**❌ DON'T use tables for comparisons:**
```markdown
| Aspect | Value |
|--------|-------|
| Format | JWT |
| Lifetime | 1 hour |
```

**✅ DO use definition-style formatting:**
```markdown
**Access Token:**
* **Purpose:** Grant access to protected resources (APIs)
* **Format:** JWT or reference token
* **Lifetime:** Short (typically 1 hour)
* **Validated by:** Resource server (API)
* **Contains:** Scopes, client ID, user claims
```

### URL/Port Listings

**❌ DON'T use tables for URLs:**
```markdown
| Component | URL | Description |
|-----------|-----|-------------|
| Angular | http://localhost:4200 | Main UI |
```

**✅ DO use colon-separated bullets:**
```markdown
**Application URLs:**

* **Angular Client:** http://localhost:4200 — Main application UI
* **Web API:** https://localhost:44378 — RESTful API endpoints
* **Swagger UI:** https://localhost:44378/swagger — API documentation
* **IdentityServer:** https://localhost:44310 — Authentication server
```

### Problem/Solution Formatting

**❌ DON'T use tables for troubleshooting:**
```markdown
| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Error | Token invalid | Restart IdentityServer |
```

**✅ DO use problem/solution structure:**
```markdown
**Common Issues:**

**IdentityServer won't start**
* **Problem:** Port 44310 already in use
* **Solution:** Kill process using the port or change port in `Properties/launchSettings.json`

**API returns 401 Unauthorized**
* **Problem:** IdentityServer not running or URL mismatch
* **Solution:** Verify IdentityServer is running at https://localhost:44310

**Angular shows "invalid_scope" error**
* **Problem:** Scope mismatch between Angular config and IdentityServer
* **Solution:** Verify `environment.ts` scope matches `identityserverdata.json`
```

### Section Headers with Emojis

Use emojis to make sections more visually appealing and scannable:

```markdown
## 📚 What You'll Learn
## 🎯 What is the CAT Pattern?
## 🚀 Getting Started
## 🔐 Key Security Features
## 📦 Component Deep Dive
## 💡 Benefits of the CAT Pattern
## 📖 Tutorial Series Roadmap
## 🎓 Next Steps
## 🔗 Learning Resources
## 🤝 Support and Contribution
## 🎉 Conclusion
```

### Bold and Emphasis

Use bold effectively for scannability:

```markdown
**Why First?** The API and Angular client both depend on IdentityServer.

**Wait for:** `Now listening on: https://localhost:44310`

**Verify:** Open browser to check the application loads correctly.
```

### Code Block Best Practices

Keep code blocks concise and focused:

```markdown
**Good:**
```typescript
export const environment = {
  apiUrl: 'https://localhost:44378/api/v1',
  identityServerUrl: 'https://localhost:44310',
};
```
```

**Avoid:** Including entire files or excessive comments

### Nested Lists for Structure

Use nested bullets for hierarchical information:

```markdown
**Key Features:**

* **Authentication & Authorization**
  * OIDC authentication with automatic token refresh
  * HTTP interceptor adds Bearer tokens automatically
  * Route guards protect authenticated routes
  * Role-based UI rendering using ngx-permissions

* **UI Components**
  * Material Design components (buttons, forms, tables)
  * Responsive layouts (mobile, tablet, desktop)
  * Data tables with sorting and filtering
  * Form validation with reactive forms
```

### Checkmarks for Benefits

Use checkmarks (✅) for positive points:

```markdown
## Benefits

✅ **Security** — Industry-standard OAuth 2.0/OIDC authentication

✅ **Scalability** — Independent scaling of each component

✅ **Maintainability** — Clear separation of concerns

✅ **Flexibility** — Technology-agnostic architecture
```

### Hero Images

Always include a placeholder at the top of blog posts:

```markdown
# Your Title Here

## Subtitle

Brief introduction paragraph.

![Architecture Diagram](https://via.placeholder.com/800x400?text=Your+Image+Description)

---

## First Section
```

### Tags at Bottom

End blog posts with relevant tags:

```markdown
---

**📌 Tags:** #angular #dotnet #oauth2 #openidconnect #identityserver #webdevelopment #authentication #security #cleanarchitecture #typescript #csharp #enterpriseapplications #fullstack #spa #jwt
```

### Creating Medium-Optimized Content

When asked to create Medium.com blog posts:

1. **Start from scratch** or use existing content as reference
2. **Remove ALL tables** — convert to lists, sections, or prose
3. **Add emoji section headers** for visual appeal
4. **Use bold liberally** for scannability
5. **Keep paragraphs short** (2-3 sentences max)
6. **Use nested bullets** for hierarchical info
7. **Add checkmarks (✅)** for benefits/features
8. **Include hero image placeholder** at top
9. **Add relevant tags** at bottom
10. **Test by copying to Medium** editor before finalizing

### Example: Converting a Tutorial Section

**Before (with tables):**
```markdown
## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 10.0+ | [Link](https://dotnet.microsoft.com) |
| Node.js | 20.x | [Link](https://nodejs.org/) |

| Feature | Description |
|---------|-------------|
| OIDC | Authentication protocol |
| JWT | Token format |
```

**After (Medium-optimized):**
```markdown
## 🚀 Getting Started

### Prerequisites

**Tools you'll need:**

* **.NET SDK 10.0+** — Build and run .NET applications — [Download](https://dotnet.microsoft.com/download)
* **Node.js 20.x LTS** — Run Angular development server — [Download](https://nodejs.org/)
* **npm 10+** — Package manager for Node.js — Included with Node.js
* **Git (Latest)** — Version control and submodules — [Download](https://git-scm.com/)

### Key Technologies

**Authentication & Security:**
* **OIDC (OpenID Connect)** — Industry-standard authentication protocol
* **JWT (JSON Web Tokens)** — Secure token format for API authorization
* **OAuth 2.0** — Authorization framework for delegated access
* **PKCE** — Security extension for single-page applications
```

### Quick Reference: Medium.com Do's and Don'ts

**DO:**
* ✅ Use bullet lists with em dashes (—)
* ✅ Use emoji section headers (📚, 🎯, 🚀)
* ✅ Use bold for emphasis and key terms
* ✅ Keep paragraphs short (2-3 sentences)
* ✅ Use nested bullets for structure
* ✅ Use checkmarks (✅) for benefits
* ✅ Include hero image placeholder
* ✅ Add tags at bottom

**DON'T:**
* ❌ Use tables (not supported)
* ❌ Use complex ASCII diagrams (simplify them)
* ❌ Use relative internal links
* ❌ Include file system paths excessively
* ❌ Use overly technical jargon without explanation
* ❌ Write long paragraphs (hard to scan)
* ❌ Use excessive nested headings (keep hierarchy flat)

### Publishing Workflow

1. **Create content** following Medium guidelines
2. **Save as `*-MEDIUM.md`** to distinguish from regular docs
3. **Copy entire content** to clipboard
4. **Paste into Medium editor** (medium.com/new-story)
5. **Replace placeholder image** with actual diagram
6. **Preview** to check formatting
7. **Add publication tags** from bottom of article
8. **Publish or save as draft**

### File Naming Convention

* Regular documentation: `TUTORIAL.md`, `README.md`
* Medium-optimized version: `TUTORIAL-MEDIUM.md`
* Part-specific blogs: `01-introduction-MEDIUM.md`, `02-authentication-MEDIUM.md`

This ensures clear separation between comprehensive technical documentation and reader-friendly Medium content.
