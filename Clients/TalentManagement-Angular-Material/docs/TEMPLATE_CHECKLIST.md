# Template Customization Checklist

Use this checklist when setting up a new project from this template.

## Initial Setup

- [ ] Clone or download template repository
- [ ] (Optional) Remove git history: `rm -rf .git && git init`
- [ ] Run initialization script:
  - **Windows**: `.\initialize-template.ps1`
  - **Mac/Linux**: `./initialize-template.sh`
- [ ] Install dependencies: `cd <project-name> && npm install`

## Configuration Files

### Project Configuration
- [ ] `package.json`
  - [ ] Update `name` field
  - [ ] Update `version` field
  - [ ] Review and update `dependencies` if needed

- [ ] `angular.json`
  - [ ] Update project name (should be done by script)
  - [ ] Review build budgets (optional)

### Environment Configuration
- [ ] `src/environments/environment.ts`
  - [ ] Update `apiUrl` with your development API URL
  - [ ] Update `identityServerUrl` with your dev IdentityServer URL
  - [ ] Update `clientId` with your OIDC client ID
  - [ ] Update `scope` with your API scopes
  - [ ] Set `allowAnonymousAccess` (true for dev, usually false for prod)

- [ ] `src/environments/environment.prod.ts`
  - [ ] Update `apiUrl` with your production API URL
  - [ ] Update `identityServerUrl` with your production IdentityServer URL
  - [ ] Update `clientId` (may be same or different from dev)
  - [ ] Update `scope` with your API scopes
  - [ ] Set `allowAnonymousAccess` to `false` for production

### Menu and Navigation
- [ ] `public/data/menu.json`
  - [ ] Remove template menu items (Dashboard, Employees, Departments, etc.)
  - [ ] Add your application's menu structure
  - [ ] Set correct icons (see [Material Icons](https://fonts.google.com/icons))
  - [ ] Configure permission requirements for menu items

### Translations
- [ ] `public/i18n/en-US.json`
  - [ ] Remove template translation keys
  - [ ] Add your menu translations (namespaced with `menu.`)
  - [ ] Add your application-specific translations
  - [ ] (Optional) Add additional language files (e.g., `es-ES.json`, `fr-FR.json`)

## Application Branding

- [ ] `public/index.html`
  - [ ] Update `<title>` tag
  - [ ] Update meta description
  - [ ] Update meta keywords (if used)

- [ ] `public/favicon.ico`
  - [ ] Replace with your application icon

- [ ] `src/app/theme/header/branding.ts`
  - [ ] Update `appName` property
  - [ ] (Optional) Add logo image reference

- [ ] `src/styles.scss`
  - [ ] (Optional) Customize Material theme colors
  - [ ] (Optional) Add custom CSS variables
  - [ ] (Optional) Update typography

## Authentication & Authorization

- [ ] `src/app/core/bootstrap/startup.service.ts`
  - [ ] Update `setPermissions()` method with your roles
  - [ ] Map roles to appropriate permissions
  - [ ] Remove template roles (Guest, Employee, Manager, HRAdmin) if not needed

- [ ] `src/app/core/authentication/role.guard.ts`
  - [ ] Add new role guards for your roles (if needed)
  - [ ] Remove template guards if not needed

- [ ] **IdentityServer Configuration** (external)
  - [ ] Create OIDC client with matching `clientId`
  - [ ] Configure grant type: `authorization_code`
  - [ ] Enable PKCE
  - [ ] Add redirect URIs: `http://localhost:4200/callback`, `https://your-domain.com/callback`
  - [ ] Add post-logout URIs: `http://localhost:4200`, `https://your-domain.com`
  - [ ] Configure CORS origins
  - [ ] Add API resource scopes
  - [ ] Configure ID token claims: `sub`, `name`, `email`, `role`

## Remove Template Code

### Delete Template Entities (if not needed)
- [ ] Delete `src/app/models/department.model.ts`
- [ ] Delete `src/app/models/employee.model.ts`
- [ ] Delete `src/app/models/position.model.ts`
- [ ] Delete `src/app/models/salary-range.model.ts`
- [ ] Delete `src/app/services/api/department.service.ts`
- [ ] Delete `src/app/services/api/employee.service.ts`
- [ ] Delete `src/app/services/api/position.service.ts`
- [ ] Delete `src/app/services/api/salary-range.service.ts`
- [ ] Delete entire folders:
  - [ ] `src/app/routes/departments/`
  - [ ] `src/app/routes/employees/`
  - [ ] `src/app/routes/positions/`
  - [ ] `src/app/routes/salary-ranges/`

### Keep These Files (Core Infrastructure)
- ✅ Keep `src/app/core/` (all authentication, guards, interceptors)
- ✅ Keep `src/app/services/api/base-api.service.ts`
- ✅ Keep `src/app/services/token-decoder.service.ts`
- ✅ Keep `src/app/routes/profile/` (useful for viewing tokens)
- ✅ Keep `src/app/routes/dashboard/` (customize as needed)
- ✅ Keep `src/app/routes/sessions/` (login, callback, error pages)
- ✅ Keep `src/app/shared/` (directives, components)
- ✅ Keep `src/app/theme/` (layout components)

## Update Documentation

- [ ] `CLAUDE.md`
  - [ ] Update project overview section
  - [ ] Update API base URL
  - [ ] Update IdentityServer configuration
  - [ ] Update role matrix with your roles
  - [ ] Document your entities and business rules
  - [ ] Update any template-specific references

- [ ] `README.md`
  - [ ] Update project name and description
  - [ ] Add project-specific badges (if any)
  - [ ] Update feature list for your application
  - [ ] Add project-specific setup instructions
  - [ ] Document environment variables (if any)

- [ ] Create/Update other documentation:
  - [ ] Add `CONTRIBUTING.md` (if open source)
  - [ ] Add `LICENSE` file
  - [ ] Add `CHANGELOG.md` for tracking changes

## Create Your Entities

For each entity in your application:

### 1. Models
- [ ] Create model file: `src/app/models/<entity>.model.ts`
- [ ] Define main interface
- [ ] Define Create command interface
- [ ] Define Update command interface
- [ ] Export from `src/app/models/index.ts`

### 2. Services
- [ ] Create service: `src/app/services/api/<entity>.service.ts`
- [ ] Extend `BaseApiService<T>`
- [ ] Set `endpoint` property
- [ ] Add entity-specific methods if needed
- [ ] Export from `src/app/services/api/index.ts`

### 3. Components
- [ ] Create folder: `src/app/routes/<entity>/`
- [ ] Create list component (copy from departments example)
- [ ] Create detail component (copy from departments example)
- [ ] Create form component (copy from departments example)
- [ ] Update templates with your fields
- [ ] Update TypeScript with your model

### 4. Routes
- [ ] Add routes in `src/app/app.routes.ts`
- [ ] Add route guards where needed
- [ ] Test navigation

### 5. Menu
- [ ] Add menu items to `public/data/menu.json`
- [ ] Add translations to `public/i18n/en-US.json`

## Testing

- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors
- [ ] Run build: `npm run build`
- [ ] Fix any build errors
- [ ] Test development server: `npm start`
- [ ] Test authentication flow
- [ ] Test role-based access control
- [ ] Test CRUD operations for each entity
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] (Optional) Run tests: `npm test`

## Git Repository

- [ ] Initialize git (if not done): `git init`
- [ ] Create `.gitignore` (already exists)
- [ ] Create initial commit
- [ ] Create repository on GitHub/GitLab/Bitbucket
- [ ] Add remote: `git remote add origin <url>`
- [ ] Push: `git push -u origin main`
- [ ] Set up branches (main, develop, feature/*)
- [ ] (Optional) Set up CI/CD pipeline

## Deployment Preparation

- [ ] Review production environment configuration
- [ ] Set up production IdentityServer client
- [ ] Configure production API CORS
- [ ] Update production redirect URIs
- [ ] Test production build: `npm run build:prod`
- [ ] Review bundle sizes (check warnings)
- [ ] Set up hosting (Azure, AWS, Netlify, etc.)
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring/logging (optional)

## Final Review

- [ ] Remove template initialization scripts:
  - [ ] Delete `initialize-template.ps1`
  - [ ] Delete `initialize-template.sh`
  - [ ] (Optional) Delete `TEMPLATE_SETUP_GUIDE.md`
  - [ ] (Optional) Delete this `TEMPLATE_CHECKLIST.md`
- [ ] Remove template documentation references
- [ ] Update README with final project information
- [ ] Review all TODOs in code (search for `TODO`)
- [ ] Review all console.log statements (remove debugging logs)
- [ ] Test all features end-to-end
- [ ] Get stakeholder approval
- [ ] Deploy to production! 🚀

---

## Quick Reference: Common Tasks

### Adding a New Menu Item
1. Edit `public/data/menu.json`
2. Add translation in `public/i18n/en-US.json`
3. Create corresponding route component
4. Add route in `app.routes.ts`

### Adding a New Role
1. Update IdentityServer to include role in ID token
2. Edit `startup.service.ts` - add role mapping in `setPermissions()`
3. (Optional) Create role guard in `role.guard.ts`
4. Use in routes: `canActivate: [yourRoleGuard]`
5. Use in templates: `*appHasRole="['YourRole']"`

### Adding a New Permission
1. Edit `startup.service.ts` - add to permissions array
2. Map permission to appropriate roles
3. Use in menu: `"permissions": { "only": ["yourPermission"] }`
4. Use in components: `*ngxPermissionsOnly="['yourPermission']"`

### Changing API Response Format
If your API doesn't use the wrapped response pattern:
1. Edit `src/app/services/api/base-api.service.ts`
2. Update `create()`, `update()`, `getAll()`, `getAllPaged()` methods
3. Remove response unwrapping logic if not needed

### Adding Multiple API Resources
1. Add additional scopes to `environment.scope`
2. Ensure IdentityServer is configured for all API resources
3. The same access token will work for all APIs (multi-audience token)

---

**Note**: This checklist is comprehensive. Not all items may apply to your project. Adjust as needed.
