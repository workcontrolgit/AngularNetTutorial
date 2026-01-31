# Talent Management

An Angular-based HR management dashboard built with ng-matero, featuring OIDC authentication via Duende IdentityServer and role-based access control.

## Quick Start

### Prerequisites

- Node.js 22.15.0 or higher
- npm 10.9.2 or higher
- Duende IdentityServer running at `https://localhost:44310`
- Backend API running at `https://localhost:44378`

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200`. The application will automatically reload if you change any of the source files.

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── config/              # Application configuration
│   │   └── auth.config.ts   # OIDC configuration
│   ├── core/                # Core services & guards
│   │   ├── authentication/  # Auth services & guards
│   │   └── interceptors/    # HTTP interceptors
│   ├── routes/              # Feature modules
│   │   ├── dashboard/       # Dashboard page
│   │   └── sessions/        # Login, callback, errors
│   ├── shared/              # Shared components & directives
│   └── theme/               # ng-matero theme components
└── environments/            # Environment configurations
```

## Authentication

This application uses **OIDC (OpenID Connect)** with **Duende IdentityServer** for authentication.

### Configuration

Update `src/environments/environment.ts` with your settings:

```typescript
{
  apiUrl: 'https://localhost:44378/api/v1',
  identityServerUrl: 'https://localhost:44310',
  clientId: 'TalentManagement',
  scope: 'openid profile email api'
}
```

### Roles

Three roles are supported:

- **Employee**: View own profile, read-only access
- **Manager**: View team members, limited management
- **HRAdmin**: Full CRUD operations on all entities

## Features Implemented

- ✅ OIDC Authentication with Duende IdentityServer
- ✅ Role-based access control (Employee, Manager, HRAdmin)
- ✅ Anonymous/Guest access
- ✅ Automatic token refresh
- ✅ HTTP Bearer token interceptor
- ✅ Role-based route guards
- ✅ Role-based directive (`*hasRole`)
- ✅ Customized ng-matero dashboard
- ✅ Responsive Material Design UI

## Next Steps

See [../IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) for detailed implementation status and next phases:

- Phase 3: API Integration Layer
- Phase 4: Employee Management Module
- Phase 5: Supporting Entities (Departments, Positions, Salary Ranges)

## Technologies

- **Angular**: 20.1.1
- **Angular Material**: 20.2.14
- **ng-matero**: 20.2.0
- **angular-oauth2-oidc**: Latest
- **TypeScript**: Latest

## Documentation

- [Project Plan](../project_plan.md) - Full implementation plan
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Detailed implementation status
- [ng-matero Docs](https://ng-matero.github.io/)
- [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc)

## License

Private project for NguyenCorp HR Management.
