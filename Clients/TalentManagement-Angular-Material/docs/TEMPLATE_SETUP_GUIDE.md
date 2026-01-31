# Angular Enterprise Application Template

This is a production-ready Angular 20+ enterprise application template built with **ng-matero** dashboard framework, featuring OIDC authentication, role-based access control, and Clean Architecture API integration.

## Template Features

### Core Technologies
- **Angular 20+** - Latest Angular with standalone components
- **ng-matero** - Professional dashboard template with Material Design
- **TypeScript 5.8** - Type-safe development
- **SCSS** - Modular styling with Material theming
- **RxJS** - Reactive programming

### Authentication & Authorization
- **OIDC Authentication** via `angular-oauth2-oidc`
  - Authorization Code + PKCE flow
  - Integration with Duende IdentityServer
  - Automatic token refresh
  - Anonymous access support
- **Role-Based Access Control** via `ngx-permissions`
  - Declarative permissions (canRead, canAdd, canEdit, canDelete)
  - Route guards (roleGuard, employeeGuard, managerGuard, hrAdminGuard)
  - UI directive: `*appHasRole="['Role1', 'Role2']"`
  - Reactive permission system that updates on login/logout

### Architecture Patterns
- **Standalone Components** - Modern Angular architecture (no NgModules)
- **Clean Architecture API Integration** - Service layer with typed responses
- **Reactive State Management** - RxJS observables throughout
- **Event-Driven Design** - Decoupled services using Subject/Observable pattern
- **Server-Side Pagination** - Optimized for large datasets
- **Loading States** - Consistent spinner overlays on forms

### UI Components & Features
- **Material Design 20+** - Full Material component library
- **Responsive Layout** - Mobile-first design with breakpoints
- **Sidemenu Navigation** - Permission-based menu with ngx-permissions
- **User Profile Page** - JWT token viewer with copy-to-clipboard
- **CRUD Scaffolding** - List, Detail, Form components with patterns
- **Date Handling** - date-fns adapter (not Moment.js)
- **Form Validation** - Reactive forms with Material form fields
- **Toast Notifications** - Success/error messages via ngx-hot-toast
- **Internationalization** - ngx-translate with JSON translation files

### Developer Experience
- **ESLint** - TypeScript and Angular linting
- **Stylelint** - SCSS linting with ordering rules
- **Prettier** - Code formatting
- **VSCode Integration** - Launch configurations and tasks
- **CLAUDE.md** - AI assistant guidance for codebase

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- (Optional) Docker for IdentityServer

### Installation Steps

1. **Clone or download this template**
   ```bash
   git clone <your-template-repo-url> my-new-project
   cd my-new-project
   ```

2. **Remove template-specific git history (optional)**
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit from template"
   ```

3. **Install dependencies**
   ```bash
   cd talent-management
   npm install
   ```

4. **Configure your application**
   - See [Configuration Guide](#configuration-guide) below

5. **Run development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200`

## Configuration Guide

### 1. Update Project Name

**File: `talent-management/package.json`**
```json
{
  "name": "your-project-name",
  "version": "1.0.0"
}
```

**File: `talent-management/angular.json`**
```json
{
  "projects": {
    "your-project-name": {
      "projectType": "application"
    }
  }
}
```

### 2. Configure API and Authentication

**File: `talent-management/src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  baseUrl: '',
  useHash: false,

  // Replace with your API URL
  apiUrl: 'https://your-api-url.com/api/v1',

  // Replace with your IdentityServer URL
  identityServerUrl: 'https://your-identity-server.com',

  // Replace with your client ID (configured in IdentityServer)
  clientId: 'YourClientId',

  // Update scopes based on your API resources
  scope: 'openid profile email your.api.scope',

  // Set to false if you want to require authentication
  allowAnonymousAccess: true,
};
```

**File: `talent-management/src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  baseUrl: '',
  useHash: false,

  apiUrl: 'https://your-production-api-url.com/api/v1',
  identityServerUrl: 'https://your-production-identity-server.com',
  clientId: 'YourClientId',
  scope: 'openid profile email your.api.scope',
  allowAnonymousAccess: false, // Usually false in production
};
```

### 3. Update Menu Configuration

**File: `talent-management/public/data/menu.json`**

Replace with your application's menu structure:
```json
{
  "menu": [
    {
      "route": "dashboard",
      "name": "dashboard",
      "type": "link",
      "icon": "dashboard"
    },
    {
      "route": "your-entity",
      "name": "yourEntity",
      "type": "sub",
      "icon": "your_icon",
      "children": [
        {
          "route": "your-entity",
          "name": "list",
          "type": "link"
        },
        {
          "route": "your-entity/create",
          "name": "create",
          "type": "link",
          "permissions": {
            "only": ["canAdd"]
          }
        }
      ]
    }
  ]
}
```

### 4. Update Translations

**File: `talent-management/public/i18n/en-US.json`**

Add your translation keys (menu items are automatically namespaced with `menu.`):
```json
{
  "menu": {
    "dashboard": "Dashboard",
    "yourEntity": "Your Entity",
    "list": "List",
    "create": "Create New"
  }
}
```

### 5. Update Application Title and Metadata

**File: `talent-management/public/index.html`**
```html
<title>Your Application Name</title>
<meta name="description" content="Your application description">
```

**File: `talent-management/src/app/theme/header/branding.ts`**
```typescript
appName = 'Your App Name';
```

### 6. Configure Roles and Permissions

**File: `talent-management/src/app/core/bootstrap/startup.service.ts`**

Update the `setPermissions()` method to match your roles:
```typescript
setPermissions() {
  const roles = this.oidcAuth.getUserRoles();
  const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];

  this.rolesService.flushRoles();

  if (roles.includes('YourAdminRole')) {
    this.rolesService.addRoles({ YourAdminRole: permissions });
  }
  if (roles.includes('YourUserRole')) {
    this.rolesService.addRoles({ YourUserRole: ['canRead'] });
  }
  // Add more roles as needed
}
```

### 7. Update CLAUDE.md

**File: `talent-management/CLAUDE.md`**

Update the project overview section with your specific details:
- Project name and description
- Your API URL and endpoints
- Your IdentityServer configuration
- Your specific roles and permissions
- Your domain entities and business rules

## Creating New Entities

This template includes scaffolded CRUD components for reference. Here's the pattern:

### 1. Create Model

**File: `src/app/models/your-entity.model.ts`**
```typescript
export interface YourEntity {
  id: string;
  name: string;
  // Add your fields
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateYourEntityCommand {
  name: string;
  // Add your fields
}

export interface UpdateYourEntityCommand {
  id: string;
  name: string;
  // Add your fields
}
```

### 2. Create API Service

**File: `src/app/services/api/your-entity.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { YourEntity, CreateYourEntityCommand, UpdateYourEntityCommand } from '@models';

@Injectable({ providedIn: 'root' })
export class YourEntityService extends BaseApiService<YourEntity> {
  protected override endpoint = 'your-entities';

  createYourEntity(command: CreateYourEntityCommand) {
    return this.create(command);
  }

  updateYourEntity(id: string, command: UpdateYourEntityCommand) {
    return this.update(id, command);
  }
}
```

### 3. Create Components

Use the existing components as templates:
- **List Component**: `src/app/routes/departments/department-list.component.*`
- **Detail Component**: `src/app/routes/departments/department-detail.component.*`
- **Form Component**: `src/app/routes/departments/department-form.component.*`

Copy and modify these files, replacing "Department" with "YourEntity".

### 4. Add Routes

**File: `src/app/app.routes.ts`**
```typescript
{
  path: 'your-entities',
  children: [
    { path: '', component: YourEntityListComponent },
    { path: 'create', component: YourEntityFormComponent, canActivate: [managerGuard] },
    { path: 'edit/:id', component: YourEntityFormComponent, canActivate: [managerGuard] },
    { path: ':id', component: YourEntityDetailComponent },
  ],
}
```

### 5. Update Menu (see step 3 above)

## API Integration Notes

### Response Format

The backend API uses a wrapped response pattern:

```typescript
interface ApiResponse<T> {
  value: T;              // Actual data
  isSuccess: boolean;
  isFailure: boolean;
  message?: string;
  errors: string[];
  executionTimeMs: number;
}

interface PagedResponse<T> {
  value: T[];            // Array of data
  pageNumber: number;
  pageSize: number;
  recordsFiltered: number;
  recordsTotal: number;
  isSuccess: boolean;
  message?: string;
  errors: string[];
}
```

`BaseApiService` automatically unwraps these responses. After creating an entity, the API returns:
```json
{
  "value": "newly-created-guid",
  "isSuccess": true,
  "errors": []
}
```

The service maps this to `{ id: "newly-created-guid" }` automatically.

### Server-Side Pagination

For large datasets, use `getAllPaged()`:

```typescript
loadData() {
  const params = {
    pageNumber: this.currentPage,
    pageSize: this.pageSize,
    searchField: this.searchTerm
  };

  this.service.getAllPaged(params).subscribe(response => {
    this.data = response.value;
    this.totalCount = response.recordsTotal;
  });
}
```

## IdentityServer Setup

### Required Configuration

In your IdentityServer, configure a client with:

**Client ID**: Match your `environment.clientId`

**Grant Types**: `authorization_code`

**PKCE Required**: `true`

**Scopes**:
- `openid` (required)
- `profile` (required)
- `email` (recommended)
- Your API resource scopes

**Redirect URIs**:
- `http://localhost:4200/callback` (development)
- `https://your-production-url.com/callback` (production)

**Post Logout Redirect URIs**:
- `http://localhost:4200` (development)
- `https://your-production-url.com` (production)

**CORS Origins**:
- `http://localhost:4200` (development)
- `https://your-production-url.com` (production)

### Required Token Claims

Your IdentityServer must include these claims in the **ID Token**:

- `sub` - User identifier (required)
- `name` - User's display name (recommended)
- `email` - User's email (recommended)
- `role` - User's role(s) - can be string or array (required for RBAC)
- `preferred_username` - Username (optional)

Example ID token claims:
```json
{
  "sub": "user-guid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": ["HRAdmin", "Manager"],
  "preferred_username": "johnd"
}
```

## Build and Deployment

### Development Build
```bash
npm run build
```
Output: `dist/talent-management/browser/`

### Production Build
```bash
npm run build:prod
```

### Linting
```bash
npm run lint          # Lint TypeScript and SCSS
npm run lint:ts       # TypeScript only
npm run lint:scss     # SCSS only
```

### Testing
```bash
npm test              # Run Jasmine/Karma tests
```

## Customization Tips

### Change Theme Colors

**File: `src/styles.scss`**

Modify the Material theme variables:
```scss
$primary: mat.m2-define-palette(mat.$m2-indigo-palette);
$accent: mat.m2-define-palette(mat.$m2-pink-palette);
$warn: mat.m2-define-palette(mat.$m2-red-palette);
```

### Update Logo and Favicon

Replace these files:
- `talent-management/public/favicon.ico`
- Update logo in `src/app/theme/header/branding.ts`

### Customize Dashboard

Edit `src/app/routes/dashboard/dashboard.component.*` to show your application-specific widgets and metrics.

## Directory Structure

```
talent-management/
├── public/                      # Static assets
│   ├── data/
│   │   └── menu.json           # Menu configuration
│   ├── i18n/
│   │   └── en-US.json          # Translations
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── config/             # Auth and app configuration
│   │   ├── core/               # Core services and guards
│   │   │   ├── authentication/ # OIDC service, guards, helpers
│   │   │   ├── bootstrap/      # Startup and menu services
│   │   │   └── interceptors/   # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces
│   │   ├── routes/             # Feature components (CRUD pages)
│   │   ├── services/           # API services
│   │   │   └── api/            # Base and entity services
│   │   ├── shared/             # Shared components and directives
│   │   └── theme/              # Layout components
│   ├── environments/           # Environment configurations
│   └── styles.scss             # Global styles
├── angular.json                # Angular workspace config
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── CLAUDE.md                   # AI assistant guidance
```

## Key Files to Update for Each New Project

### Must Update
1. `package.json` - Project name and version
2. `angular.json` - Project name
3. `src/environments/environment*.ts` - API URL, IdentityServer URL, Client ID, Scopes
4. `public/data/menu.json` - Menu structure
5. `public/i18n/en-US.json` - Translation keys
6. `CLAUDE.md` - Project-specific documentation

### Should Update
7. `src/app/core/bootstrap/startup.service.ts` - Roles and permissions
8. `src/app/routes/dashboard/dashboard.component.*` - Dashboard content
9. `src/styles.scss` - Theme colors
10. `public/favicon.ico` - Application icon
11. `src/app/theme/header/branding.ts` - Application name

### Can Keep As-Is
- All core services (`BaseApiService`, `OidcAuthService`, `TokenDecoderService`)
- All interceptors
- All guards
- Profile components
- Error pages (403, 404, 500)
- Layout components (header, sidemenu, footer)

## Common Patterns

### Loading State Pattern
```typescript
export class YourComponent {
  loading = false;

  onSubmit() {
    this.loading = true;
    this.service.create(data).subscribe({
      next: (result) => {
        this.showMessage('Success');
        this.router.navigate(['/path']);
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Error');
        this.loading = false;
      }
    });
  }
}
```

### Reactive User Info Pattern
```typescript
ngOnInit() {
  this.updateUserInfo();
  this.authSubscription = this.oidcAuth.isAuthenticated$.subscribe(() => {
    this.updateUserInfo();
  });
}

private updateUserInfo() {
  this.isAuthenticated = this.oidcAuth.isAuthenticated();
  this.userName = this.oidcAuth.getUserDisplayName();
}

ngOnDestroy() {
  this.authSubscription?.unsubscribe();
}
```

### Permission-Based UI Pattern
```html
<button *appHasRole="['Manager', 'HRAdmin']" (click)="create()">
  Create New
</button>
```

## Troubleshooting

### Menu items don't show after login
- Check that roles are in the ID token
- Verify `startup.service.ts` has correct role mappings
- Check browser console for permission logs

### OIDC authentication fails
- Verify IdentityServer URL is accessible
- Check CORS configuration in IdentityServer
- Verify client ID matches IdentityServer configuration
- Check redirect URIs match exactly

### API calls fail with 401 Unauthorized
- Check that access token is valid (Profile page)
- Verify API resource scopes in `environment.scope`
- Check that API accepts the audience in the access token

### Date picker errors
- Do NOT provide `MAT_DATE_LOCALE` with date-fns adapter
- Only use `provideDateFnsAdapter()` in `app.config.ts`

## License

This template is provided as-is for use in your projects. Modify as needed.

## Support

For issues specific to:
- **ng-matero**: https://github.com/ng-matero/ng-matero
- **Angular**: https://angular.io/docs
- **angular-oauth2-oidc**: https://github.com/manfredsteyer/angular-oauth2-oidc
- **Duende IdentityServer**: https://docs.duendesoftware.com/

---

**Built with Angular 20+ and ng-matero dashboard template**
