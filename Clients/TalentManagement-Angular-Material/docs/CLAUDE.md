# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 20 HR Talent Management application using **ng-matero** dashboard template with OIDC authentication via Duende IdentityServer. Follows standalone component architecture.

## Build Commands

```bash
# Development server
cd talent-management
npm start                    # Runs on http://localhost:4200

# Build
npm run build               # Development build
npm run build:prod          # Production build
npm run watch               # Watch mode for development

# Linting
npm run lint                # Lint TypeScript and SCSS
npm run lint:ts             # Lint TypeScript only
npm run lint:scss           # Lint SCSS only

# Testing
npm test                    # Run Jasmine/Karma tests
```

## Architecture

### Authentication & Authorization

**OIDC Authentication** using `angular-oauth2-oidc`:
- IdentityServer: `https://sts.skoruba.local` (running in Docker)
- Flow: Authorization Code + PKCE
- Anonymous access enabled by default (`environment.allowAnonymousAccess: true`)
- Service: `src/app/core/authentication/oidc-auth.service.ts`

**IdentityServer Infrastructure** (Docker):
- **STS (Token Service)**: `https://sts.skoruba.local` - OIDC provider for authentication
- **Admin UI**: `https://admin.skoruba.local` - Web app for managing clients, resources, users, and config
- **Admin API**: `https://admin-api.skoruba.local` - REST API with Swagger UI for programmatic management

**Role-Based Access Control** via `ngx-permissions`:
- **Roles**: Guest (anonymous), Employee, Manager, HRAdmin
- **Permissions**: canRead, canAdd, canEdit, canDelete
- Permissions set in `startup.service.ts` based on ID token roles
- Route guards: `roleGuard`, `employeeGuard`, `managerGuard`, `hrAdminGuard` (in `role.guard.ts`)
- UI directive: `*appHasRole="['HRAdmin', 'Manager']"` (structural directive)

**Permission Matrix**:
- Guest/Employee: Read-only access
- Manager: Full CRUD on Employees
- HRAdmin: Full CRUD on all entities

### API Integration

**Backend**: Clean Architecture API at `https://localhost:44378/api/v1`
- API specification: `swagger.json` (root directory)
- Base service: `src/app/services/api/base-api.service.ts`
- Services follow pattern: `employee.service.ts`, `department.service.ts`, etc.

**Response Format**:
```typescript
interface PagedResponse<T> {
  value: T[];               // Actual data array
  pageNumber: number;
  pageSize: number;
  recordsFiltered: number;
  recordsTotal: number;
  isSuccess: boolean;
  message?: string;
  errors: string[];
}
```

**Important**: API responses wrap data in `value` property. `BaseApiService.getAll()` extracts this automatically.

### State Management & Startup

**Application Initialization** (`src/app/core/bootstrap/startup.service.ts`):
1. Loads menu from `public/data/menu.json`
2. Sets permissions based on authenticated user roles
3. Runs before app renders (via `provideAppInitializer`)

**Menu System**:
- Configuration: `public/data/menu.json`
- Translations: `public/i18n/en-US.json` with namespaced keys
- Child routes are relative to parent (e.g., parent: `"employees"`, child: `"create"` → `/employees/create`)
- Menu items support permission-based visibility: `"permissions": { "only": ["canAdd"] }`

**Translation Keys**: MenuService adds namespace automatically:
- Menu item `employees.employeeList` → Translation key `menu.employees.employeeList`

### Component Patterns

**Standalone Components**: All components use standalone: true (Angular 20+)

**CRUD Pattern** (Employee example):
- List: `employee-list.component.ts` - Table with pagination, search, CRUD buttons
- Detail: `employee-detail.component.ts` - Read-only view with edit/delete actions
- Form: `employee-form.component.ts` - Create/Edit (detects mode via route param)

**Server-Side Pagination** (for large datasets like Positions with 200k+ records):
```typescript
// Service method
getAllPaged(params?: QueryParams): Observable<PagedResponse<T>>

// Component
loadData() {
  const params = { pageNumber, pageSize, searchField: value };
  this.service.getAllPaged(params).subscribe(response => {
    this.data = response.value;
    this.totalCount = response.recordsTotal;
  });
}
```

**Reactive User Info**: Components must subscribe to `oidcAuth.isAuthenticated$` to react to login/logout:
```typescript
ngOnInit() {
  this.updateUserInfo();
  this.authSubscription = this.oidcAuth.isAuthenticated$.subscribe(() => {
    this.updateUserInfo();
  });
}
```

### HTTP Interceptors

Located in `src/app/core/interceptors/`:
- `auth-token-interceptor.ts` - Adds Bearer token to API requests
- `error-interceptor.ts` - Global error handling (status 0/CORS errors logged, not toasted)
- `base-url-interceptor.ts` - Prepends base URL to relative requests

### Routing

**Path Structure**:
- `/dashboard` - Dashboard
- `/employees` - Employee list
- `/employees/create` - Create employee (protected: `managerGuard`)
- `/employees/edit/:id` - Edit employee (protected: `managerGuard`)
- `/employees/:id` - Employee detail
- `/login` - Login page
- `/callback` - OIDC callback
- `/403`, `/404`, `/500` - Error pages

**Route Protection**: Use guards from `role.guard.ts`:
```typescript
{ path: 'employees/create', component: EmployeeFormComponent, canActivate: [managerGuard] }
```

### Forms & Validation

**Date Pickers**: Use `date-fns` adapter (not `MatNativeDateModule`)
- Configuration in `app.config.ts` with `provideDateFnsAdapter()`
- **Do NOT provide** `MAT_DATE_LOCALE` when using date-fns adapter
- Format: `yyyy-MM-dd`

**Material Form Fields**: Appearance set to `outlined` globally via `MAT_CARD_CONFIG`

### Environment Configuration

`src/environments/environment.ts`:
```typescript
apiUrl: 'https://localhost:44378/api/v1'
identityServerUrl: 'https://sts.skoruba.local'
clientId: 'TalentManagement'
scope: 'openid profile email app.api.talentmanagement.read'
allowAnonymousAccess: true
```

**Multiple API Resources**: When calling multiple APIs, add their scopes to the scope string:
```typescript
scope: 'openid profile email app.api.talentmanagement.read app.api.reporting.read app.api.notifications.write'
```
The access token will contain multiple audiences in the `aud` claim, and the same token works for all APIs. No Angular code changes needed - the `authTokenInterceptor` handles everything.

## Common Issues & Solutions

### Menu Items Not Showing
- Check translation keys use dot notation: `menu.parent.child`
- Child routes are relative to parent (use `"create"` not `"employees/create"`)
- Verify permissions in `startup.service.ts` match menu's `permissions.only`

### Date Picker Errors
- Remove `MAT_DATE_LOCALE` provider when using date-fns adapter
- Date-fns adapter configured in `provideDateFnsAdapter()` only

### User Info Not Updating After Login
- Components must subscribe to `oidcAuth.isAuthenticated$` observable
- Use properties bound to template, not methods
- Check ID token contains required claims (name, email, role)

### Role-Based UI Not Working
- Directive syntax: `*appHasRole="['Role1', 'Role2']"` (array for multiple)
- Verify roles in ID token (check browser console for startup logs)
- Ensure `startup.service.ts` loads permissions before app renders

### API Response Errors
- Check if response has `value` wrapper (PagedResponse)
- `BaseApiService.getAll()` already unwraps `value`
- For paged endpoints, use `getAllPaged()` which returns full `PagedResponse<T>`

## File Locations

- **API Services**: `src/app/services/api/`
- **Models**: `src/app/models/`
- **Authentication**: `src/app/core/authentication/`
- **Guards**: `src/app/core/authentication/role.guard.ts`
- **Interceptors**: `src/app/core/interceptors/`
- **Routes/Components**: `src/app/routes/[entity]/`
- **Menu Config**: `public/data/menu.json`
- **Translations**: `public/i18n/en-US.json`
- **Shared Directives**: `src/app/shared/directives/`

## Token Claims Reference

**ID Token** (from IdentityServer):
- Required for UI: `name`, `email`, `role` (array), `preferred_username`
- Retrieved via: `oauthService.getIdentityClaims()`

**Access Token** (for API):
- Scopes: `openid`, `profile`, `email`, `app.api.talentmanagement.read`
- Automatically attached by `auth-token-interceptor.ts`
