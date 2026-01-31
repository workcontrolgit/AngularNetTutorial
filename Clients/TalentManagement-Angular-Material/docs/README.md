# Angular Enterprise Application Template

A production-ready Angular 20+ enterprise application template with OIDC authentication, role-based access control, and Material Design.

## Features

- ✅ **Angular 20+** with standalone components
- ✅ **ng-matero** professional dashboard template
- ✅ **OIDC Authentication** (Duende IdentityServer ready)
- ✅ **Role-Based Access Control** with ngx-permissions
- ✅ **Material Design 20+** UI components
- ✅ **Clean Architecture** API integration
- ✅ **Reactive Forms** with validation
- ✅ **Server-Side Pagination** support
- ✅ **Internationalization** (i18n) ready
- ✅ **TypeScript 5.8** with strict mode
- ✅ **ESLint + Stylelint** configured
- ✅ **JWT Token Viewer** for development

## Quick Start

```bash
# 1. Install dependencies
cd talent-management
npm install

# 2. Configure your environment
# Edit src/environments/environment.ts with your API and IdentityServer URLs

# 3. Run development server
npm start

# Navigate to http://localhost:4200
```

## Related Repositories

### Frontend (This Repository)

**🔗 Angular Material Version**: [TalentManagement-Angular-Material](https://github.com/workcontrolgit/TalentManagement-Angular-Material)

This repository contains the production-ready Angular 20+ frontend with:
- ng-matero enterprise dashboard template
- OIDC authentication and role-based access control
- Material Design 20+ UI components
- Internationalization support (10 languages)
- Server-side pagination and search

### Backend API

**🔗 Backend Repository**: [TalentManagementData](https://github.com/workcontrolgit/TalentManagementData)

The backend provides:
- RESTful API endpoints for HR data management
- Clean Architecture implementation
- Entity Framework Core with SQL Server
- Swagger/OpenAPI documentation
- CORS enabled for Angular client

## Documentation

- **[📘 Complete Setup Guide](TEMPLATE_SETUP_GUIDE.md)** - Comprehensive guide for customizing this template
- **[🤖 CLAUDE.md](CLAUDE.md)** - AI assistant guidance for working with the codebase

## Template Structure

```
talent-management/
├── src/app/
│   ├── config/              # Authentication & app configuration
│   ├── core/                # Services, guards, interceptors
│   ├── models/              # TypeScript interfaces
│   ├── routes/              # Feature pages (CRUD components)
│   ├── services/api/        # API integration services
│   ├── shared/              # Shared components & directives
│   └── theme/               # Layout components
├── public/
│   ├── data/menu.json       # Menu configuration
│   └── i18n/en-US.json      # Translations
└── src/environments/        # Environment configs
```

## Key Technologies

| Category | Technology |
|----------|-----------|
| Framework | Angular 20+ |
| UI Library | Angular Material 20+ |
| Template | ng-matero |
| Authentication | angular-oauth2-oidc |
| Authorization | ngx-permissions |
| Forms | Reactive Forms + Material |
| HTTP | HttpClient with interceptors |
| State | RxJS Observables |
| Styling | SCSS + Material Theming |
| Date | date-fns adapter |
| i18n | ngx-translate |
| Notifications | ngx-hot-toast |

## Configuration Checklist

Before using this template for a new project, update:

- [ ] `package.json` - Project name and version
- [ ] `angular.json` - Project name
- [ ] `src/environments/environment.ts` - API URL, IdentityServer URL, Client ID, Scopes
- [ ] `public/data/menu.json` - Application menu structure
- [ ] `public/i18n/en-US.json` - Translation keys
- [ ] `src/app/core/bootstrap/startup.service.ts` - Roles and permissions
- [ ] `CLAUDE.md` - Project-specific documentation
- [ ] `public/favicon.ico` - Application icon
- [ ] `src/styles.scss` - Theme colors (optional)

See [TEMPLATE_SETUP_GUIDE.md](TEMPLATE_SETUP_GUIDE.md) for detailed instructions.

## Available Scripts

```bash
npm start              # Development server (http://localhost:4200)
npm run build          # Development build
npm run build:prod     # Production build
npm test               # Run tests
npm run lint           # Lint TypeScript and SCSS
npm run lint:ts        # Lint TypeScript only
npm run lint:scss      # Lint SCSS only
```

## IdentityServer Requirements

This template requires an OIDC-compliant identity provider (tested with Duende IdentityServer) configured with:

- **Grant Type**: Authorization Code + PKCE
- **Required Scopes**: `openid`, `profile`, `email`, your API scopes
- **ID Token Claims**: `sub`, `name`, `email`, `role` (string or array)
- **CORS**: Enable for your application URL

See [TEMPLATE_SETUP_GUIDE.md#identityserver-setup](TEMPLATE_SETUP_GUIDE.md#identityserver-setup) for details.

## Creating New Entities

1. Create model in `src/app/models/`
2. Create service extending `BaseApiService` in `src/app/services/api/`
3. Copy and modify component files from `src/app/routes/departments/`
4. Add routes in `src/app/app.routes.ts`
5. Update menu in `public/data/menu.json`
6. Add translations in `public/i18n/en-US.json`

See the [complete guide](TEMPLATE_SETUP_GUIDE.md#creating-new-entities) for examples.

## Architecture Highlights

### Authentication Flow
- OIDC Authorization Code + PKCE flow
- Automatic token refresh
- Reactive authentication state (`isAuthenticated$` observable)
- Permissions automatically update on login/logout

### API Integration
- `BaseApiService<T>` for consistent CRUD operations
- Automatic response unwrapping (handles wrapped API responses)
- HTTP interceptors for auth tokens and error handling
- Server-side pagination support

### Role-Based Access Control
- Guard-based route protection (`roleGuard`, `managerGuard`, etc.)
- Directive-based UI control (`*appHasRole="['Role']"`)
- Dynamic permission loading from ID token
- Reactive permission system

### Component Patterns
- **List**: Paginated tables with search and CRUD buttons
- **Detail**: Read-only view with edit/delete actions
- **Form**: Create/Edit mode detection with loading states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Contributing

This is a template repository. Fork it and customize for your needs.

## License

MIT License - Use freely in your projects.

---

**For detailed setup instructions, see [TEMPLATE_SETUP_GUIDE.md](TEMPLATE_SETUP_GUIDE.md)**
