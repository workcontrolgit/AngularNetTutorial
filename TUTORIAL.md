# Building Modern Web Applications with Angular, .NET, and OAuth 2.0

## A Complete Tutorial Series Using the CAT Pattern

Welcome to this comprehensive tutorial series that demonstrates building a modern, secure web application using the **CAT (Client, API Resource, Token Service)** pattern. This pattern represents industry best practices for building scalable, maintainable, and secure enterprise applications.

---

## Table of Contents

1. [Overview](#overview)
2. [What is the CAT Pattern?](#what-is-the-cat-pattern)
3. [Software Architecture](#software-architecture)
4. [Key Features](#key-features)
5. [Benefits of the CAT Pattern](#benefits-of-the-cat-pattern)
6. [Getting Started](#getting-started)
7. [Component Details](#component-details)
8. [Tutorial Series](#tutorial-series)
9. [Next Steps](#next-steps)

---

## Overview

This tutorial demonstrates a production-ready **Talent Management System** built using:

- **Angular 20** with Material Design for the user interface
- **.NET 10** Web API with Clean Architecture for business logic
- **Duende IdentityServer 7.0** for authentication and authorization

### What You'll Learn

- How to architect modern web applications using separation of concerns
- Implementing OAuth 2.0 and OpenID Connect (OIDC) authentication
- Building RESTful APIs with Clean Architecture
- Creating responsive UIs with Angular and Material Design
- Managing distributed codebases with Git submodules
- Securing APIs with JWT tokens
- Role-based access control (RBAC)

### Who This Tutorial Is For

- Full-stack developers looking to learn modern authentication patterns
- Teams building enterprise applications requiring secure authentication
- Architects designing microservices-based systems
- Developers transitioning to Angular and .NET stacks

---

## What is the CAT Pattern?

The **CAT (Client, API Resource, Token Service)** pattern is an architectural approach that separates authentication, business logic, and user interface into three distinct tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                     CAT Architecture                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│     Client      │   API Resource  │    Token Service        │
│   (Angular)     │    (.NET API)   │  (IdentityServer)       │
│                 │                 │                         │
│  • UI/UX        │  • Business     │  • Authentication       │
│  • Routing      │    Logic        │  • Token Issuance       │
│  • State Mgmt   │  • Data Access  │  • User Management      │
│  • API Calls    │  • Validation   │  • OAuth 2.0/OIDC       │
└─────────────────┴─────────────────┴─────────────────────────┘
         │                 │                     │
         └────────── HTTPS + JWT Tokens ─────────┘
```

### Why CAT Pattern?

1. **Separation of Concerns**: Each tier has a single, well-defined responsibility
2. **Independent Scaling**: Scale each component based on demand
3. **Technology Agnostic**: Swap implementations without affecting other tiers
4. **Security by Design**: Centralized authentication with token-based authorization
5. **Microservices Ready**: Foundation for transitioning to microservices architecture

---

## Software Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      User's Browser                            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Angular SPA (Port 4200)                      │      │
│  │  • Material Design UI                                │      │
│  │  • OIDC Client                                       │      │
│  │  • HTTP Interceptor (adds Bearer token)              │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┘
            │                                        │
            │ HTTPS                                  │ HTTPS
            ▼                                        ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   IdentityServer         │      │   ASP.NET Core Web API       │
│   (Port 44310)           │◄─────│   (Port 44378)               │
│                          │ Token│                              │
│ • User Authentication    │ Vld. │ • CRUD Operations            │
│ • OAuth 2.0/OIDC         │      │ • Business Logic             │
│ • Token Issuance         │      │ • Data Validation            │
│ • Client Management      │      │ • JWT Authentication         │
│ • Scope Definition       │      │ • Role Authorization         │
└──────────────────────────┘      └──────────────────────────────┘
            │                                        │
            │                                        │
            ▼                                        ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   Identity Database      │      │   Application Database       │
│   (Users, Roles)         │      │   (Business Data)            │
└──────────────────────────┘      └──────────────────────────────┘
```

### Authentication Flow

```
1. User → Angular Client: Click "Login"
   ↓
2. Angular → IdentityServer: Redirect to /authorize
   ↓
3. User ← IdentityServer: Show login form
   ↓
4. User → IdentityServer: Submit credentials
   ↓
5. IdentityServer: Validate credentials
   ↓
6. Angular ← IdentityServer: Redirect with authorization code
   ↓
7. Angular → IdentityServer: Exchange code for tokens
   ↓
8. Angular ← IdentityServer: Return ID token + Access token
   ↓
9. Angular: Store tokens in memory/session
   ↓
10. Angular → API: HTTP request with Bearer token
    ↓
11. API → IdentityServer: Validate token (cached)
    ↓
12. API: Authorize request based on scopes/roles
    ↓
13. Angular ← API: Return protected data
```

### Repository Structure (Git Submodules)

```
AngularNetTutorial/ (Parent Repository)
│
├── .gitmodules
├── README.md
├── TUTORIAL.md
├── CLAUDE.md
│
├── Clients/
│   └── TalentManagement-Angular-Material/ (Git Submodule)
│       ├── talent-management/
│       │   ├── src/
│       │   │   ├── app/
│       │   │   │   ├── routes/       # Feature modules
│       │   │   │   ├── core/         # Services, guards
│       │   │   │   ├── shared/       # Shared components
│       │   │   │   └── theme/        # Styling
│       │   │   └── environments/
│       │   ├── angular.json
│       │   └── package.json
│       └── docs/                     # Angular-specific docs
│
├── ApiResources/
│   └── TalentManagement-API/ (Git Submodule)
│       ├── src/
│       │   ├── Application/          # Business logic, DTOs
│       │   ├── Domain/               # Entities, interfaces
│       │   ├── Infrastructure/       # Data access, EF Core
│       │   └── WebApi/               # Controllers, startup
│       ├── tests/
│       └── TalentManagement.sln
│
└── TokenService/
    └── Duende-IdentityServer/ (Git Submodule)
        ├── src/
        │   ├── Duende.STS.Identity/  # Identity Server
        │   ├── Duende.Admin/         # Admin UI
        │   └── Duende.Admin.Api/     # Admin API
        └── shared/
            ├── identitydata.json     # User seed data
            └── identityserverdata.json # Client configuration
```

---

## Key Features

### 1. Security Features

- **OAuth 2.0 Authorization Code Flow with PKCE**
  - Secure authentication for Single Page Applications
  - Protection against authorization code interception

- **JWT Bearer Token Authentication**
  - Stateless API authentication
  - Token-based authorization with scopes

- **Role-Based Access Control (RBAC)**
  - Fine-grained permissions using ngx-permissions
  - API endpoint protection with `[Authorize]` attributes

- **Secure Token Storage**
  - In-memory token storage (no localStorage)
  - Automatic token refresh

- **HTTPS Enforcement**
  - All communication encrypted
  - CORS configuration for cross-origin requests

### 2. Angular Client Features

- **Modern UI/UX**
  - Material Design 3 components
  - Responsive layouts for mobile/desktop
  - Dark mode support (configurable)

- **ng-matero Template**
  - Pre-built dashboard layouts
  - Reusable UI components
  - Customizable themes

- **Feature Modules**
  - Employee Management (CRUD)
  - Department Management
  - Position Management
  - Salary Range Management
  - User Profile & Settings
  - Dashboard with analytics

- **State Management**
  - RxJS for reactive programming
  - Service-based state management

- **Authentication Integration**
  - OIDC client (angular-auth-oidc-client)
  - Automatic token injection via HTTP interceptor
  - Route guards for protected pages

### 3. API Features

- **Clean Architecture**
  - Separation of concerns across layers
  - Dependency injection
  - SOLID principles

- **RESTful API Design**
  - Standard HTTP methods (GET, POST, PUT, DELETE)
  - Consistent response formats
  - Versioning (v1)

- **Entity Framework Core**
  - Code-first database approach
  - Database migrations
  - Relationship management

- **Swagger/OpenAPI**
  - Interactive API documentation
  - API testing interface
  - Client code generation

- **Validation & Error Handling**
  - FluentValidation for request validation
  - Global exception handling
  - Standardized error responses

### 4. IdentityServer Features

- **User Management**
  - User registration and authentication
  - Password policies
  - Two-factor authentication (2FA) ready

- **Client Configuration**
  - Multiple client support
  - Per-client scope configuration
  - Redirect URI validation

- **Admin UI**
  - Manage clients, users, and resources
  - View audit logs
  - Configure identity providers

- **Standards Compliance**
  - OAuth 2.0
  - OpenID Connect (OIDC)
  - JWT tokens

---

## Benefits of the CAT Pattern

### 1. Scalability

- **Independent Deployment**: Deploy client, API, or auth server independently
- **Horizontal Scaling**: Scale components based on load (e.g., scale API for high traffic)
- **CDN-Friendly**: Serve static Angular app from CDN
- **Database Separation**: Separate databases for identity and application data

### 2. Maintainability

- **Clear Boundaries**: Each component has well-defined responsibilities
- **Technology Flexibility**: Replace Angular with React without touching API
- **Team Organization**: Different teams can own different tiers
- **Git Submodules**: Independent version control for each component

### 3. Security

- **Centralized Authentication**: Single source of truth for user identity
- **Token-Based Authorization**: Stateless, scalable security model
- **Scope-Based Access**: Fine-grained API permissions
- **Security Updates**: Update auth server without affecting client/API

### 4. Testability

- **Unit Testing**: Test each layer in isolation
- **Integration Testing**: Test API endpoints with mock tokens
- **E2E Testing**: Test complete flows across all tiers
- **Mocking**: Easy to mock external dependencies

### 5. Developer Experience

- **Hot Reload**: Angular development server with live reload
- **Swagger UI**: Interactive API testing
- **TypeScript**: Type safety across frontend
- **Separation of Concerns**: Work on UI without touching backend logic

### 6. Enterprise Readiness

- **Multiple Clients**: Support web, mobile, and desktop apps
- **API Gateway Ready**: Easy integration with API gateways
- **Microservices Foundation**: Natural evolution to microservices
- **Audit & Compliance**: Centralized logging and audit trails

---

## Getting Started

### Prerequisites

Before starting this tutorial, ensure you have the following installed:

| Tool | Version | Purpose | Download Link |
|------|---------|---------|---------------|
| **.NET SDK** | 10.0+ | Build and run .NET applications | [Download](https://dotnet.microsoft.com/download) |
| **Node.js** | 20.x LTS | Run Angular development server | [Download](https://nodejs.org/) |
| **npm** | 10+ | Package manager for Node.js | Included with Node.js |
| **Git** | Latest | Version control and submodules | [Download](https://git-scm.com/) |
| **Visual Studio Code** | Latest | Recommended code editor | [Download](https://code.visualstudio.com/) |

#### Optional Tools

- **SQL Server Management Studio** or **Azure Data Studio** - Database management
- **Postman** - API testing
- **Git GUI Client** - GitHub Desktop, SourceTree, etc.

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 5GB free space
- **Browser**: Chrome, Edge, Firefox (latest versions)

### Verify Installation

```bash
# Check .NET version
dotnet --version
# Expected: 10.0.0 or higher

# Check Node.js version
node --version
# Expected: v20.x.x or higher

# Check npm version
npm --version
# Expected: 10.x.x or higher

# Check Git version
git --version
# Expected: git version 2.x.x or higher
```

### Clone the Repository

This project uses **Git submodules** to manage the three main components. Clone everything at once:

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git

# Navigate to project directory
cd AngularNetTutotial

# Verify submodules are initialized
git submodule status
```

**Expected Output:**
```
 f8e445264a7c93e887d7105945ea22b1763a11e1 Clients/TalentManagement-Angular-Material (heads/develop)
 aa81e2280f6a34ffb4cd084a2be6c50c15f8f9ce ApiResources/TalentManagement-API (heads/master)
 110a32f18b292a57f09755199c540791b9a4adc5 TokenService/Duende-IdentityServer (heads/master)
```

If you've already cloned without submodules:

```bash
git submodule update --init --recursive
```

### Quick Start: Running All Components

The three components must be started in a specific order for proper operation:

#### Step 1: Start IdentityServer (Token Service)

**Why First?** The API and Angular client both depend on IdentityServer for token validation.

```bash
# Open Terminal 1
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity

# Restore NuGet packages
dotnet restore

# Run the application
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44310`

**Verify:** Open browser to `https://localhost:44310` - you should see the IdentityServer login page

#### Step 2: Start API Resource (Backend)

**Why Second?** The API needs IdentityServer running to validate tokens.

```bash
# Open Terminal 2
cd ApiResources/TalentManagement-API

# Restore NuGet packages
dotnet restore

# Apply database migrations (first time only)
dotnet ef database update

# Run the application
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44378`

**Verify:** Open browser to `https://localhost:44378/swagger` - you should see Swagger UI

#### Step 3: Start Angular Client (Frontend)

```bash
# Open Terminal 3
cd Clients/TalentManagement-Angular-Material/talent-management

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

**Wait for:** `✔ Browser application bundle generation complete.`

**Verify:** Open browser to `http://localhost:4200` - you should see the login page

### Application URLs

| Component | URL | Description |
|-----------|-----|-------------|
| **Angular Client** | http://localhost:4200 | Main application UI |
| **Web API** | https://localhost:44378 | RESTful API endpoints |
| **Swagger UI** | https://localhost:44378/swagger | API documentation |
| **IdentityServer** | https://localhost:44310 | Authentication server |
| **IdentityServer Admin** | https://localhost:44303 | Admin panel |
| **IdentityServer Admin API** | https://localhost:44302 | Admin API |

### First Login

1. Navigate to http://localhost:4200
2. Click **"Sign In"**
3. You'll be redirected to IdentityServer (https://localhost:44310)
4. Use default credentials:
   - **Username**: `admin` or `alice`
   - **Password**: `Pass123$`
5. After successful login, you'll be redirected back to the Angular dashboard

### Troubleshooting Quick Start

#### IdentityServer won't start
- **Error**: Port 44310 already in use
- **Solution**: Kill process using the port or change port in `Properties/launchSettings.json`

#### API returns 401 Unauthorized
- **Cause**: IdentityServer not running or URL mismatch
- **Solution**: Verify IdentityServer is running at https://localhost:44310

#### Angular shows "invalid_scope" error
- **Cause**: Scope mismatch between Angular config and IdentityServer
- **Solution**: Verify `environment.ts` scope matches `identityserverdata.json`

#### Submodules are empty
- **Cause**: Cloned without `--recurse-submodules`
- **Solution**: Run `git submodule update --init --recursive`

---

## Component Details

### 1. Angular Client (Presentation Tier)

**Repository**: [TalentManagement-Angular-Material](https://github.com/workcontrolgit/TalentManagement-Angular-Material)

#### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 20.x | Frontend framework |
| Angular Material | 20.x | UI component library |
| ng-matero | Latest | Admin dashboard template |
| angular-auth-oidc-client | Latest | OIDC authentication |
| ngx-permissions | Latest | Role-based permissions |
| RxJS | 7.x | Reactive programming |
| TypeScript | 5.x | Type-safe JavaScript |
| Chart.js | Latest | Data visualization |

#### Project Structure

```
talent-management/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards
│   │   │   ├── authentication/      # OIDC service, auth guard
│   │   │   ├── interceptors/        # HTTP interceptor for tokens
│   │   │   └── services/            # Shared services
│   │   │
│   │   ├── shared/                  # Shared components, directives
│   │   │   ├── components/          # Reusable UI components
│   │   │   ├── pipes/               # Custom pipes
│   │   │   └── models/              # TypeScript interfaces
│   │   │
│   │   ├── routes/                  # Feature modules (lazy-loaded)
│   │   │   ├── dashboard/           # Dashboard module
│   │   │   ├── employees/           # Employee management
│   │   │   ├── departments/         # Department management
│   │   │   ├── sessions/            # Login/logout
│   │   │   └── profile/             # User profile
│   │   │
│   │   ├── theme/                   # Styling, Material theming
│   │   │   ├── admin-layout/        # Main layout component
│   │   │   ├── sidebar/             # Navigation sidebar
│   │   │   └── header/              # Top header bar
│   │   │
│   │   ├── app.component.ts         # Root component
│   │   ├── app.routes.ts            # Application routing
│   │   └── app.config.ts            # App configuration
│   │
│   ├── environments/
│   │   ├── environment.ts           # Development config
│   │   └── environment.prod.ts      # Production config
│   │
│   ├── assets/                      # Static files
│   ├── styles/                      # Global styles
│   └── index.html                   # HTML entry point
│
├── angular.json                     # Angular CLI configuration
├── package.json                     # npm dependencies
├── tsconfig.json                    # TypeScript configuration
└── README.md
```

#### Key Features

**Authentication & Authorization**
- OIDC authentication with automatic token refresh
- HTTP interceptor automatically adds Bearer token to API requests
- Route guards protect authenticated routes
- Role-based UI rendering using ngx-permissions

**UI Components**
- Material Design components (buttons, forms, tables, dialogs)
- Responsive layouts (mobile, tablet, desktop)
- Data tables with sorting, filtering, pagination
- Form validation with reactive forms
- Snackbar notifications for user feedback

**State Management**
- Service-based state management
- RxJS observables for reactive data flow
- BehaviorSubjects for shared state

**Code Organization**
- Feature modules (lazy-loaded for performance)
- Standalone components (Angular 20)
- Shared module for common components
- Core module for singleton services

#### Configuration Files

**environment.ts** - Critical configuration for connecting to API and IdentityServer

```typescript
export const environment = {
  production: false,
  baseUrl: '',
  useHash: false,

  // API endpoint
  apiUrl: 'https://localhost:44378/api/v1',

  // IdentityServer configuration
  identityServerUrl: 'https://localhost:44310',
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',

  allowAnonymousAccess: true,
};
```

**Key Configuration Points:**
- `apiUrl`: Must match the running API URL
- `identityServerUrl`: Must match the running IdentityServer URL
- `clientId`: Must match a client configured in IdentityServer
- `scope`: Must be a subset of scopes allowed for the client

#### Build Commands

```bash
# Development server with live reload
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build --configuration production

# Run unit tests
npm test
# or
ng test

# Run end-to-end tests
npm run e2e

# Lint code
npm run lint
```

#### Development Workflow

1. **Create Feature Module**
   ```bash
   ng generate module routes/my-feature --routing
   ng generate component routes/my-feature/my-component
   ```

2. **Create Service**
   ```bash
   ng generate service core/services/my-service
   ```

3. **Add to Routes**
   ```typescript
   {
     path: 'my-feature',
     loadChildren: () => import('./routes/my-feature/my-feature.module')
       .then(m => m.MyFeatureModule),
     canActivate: [AuthGuard]
   }
   ```

---

### 2. API Resource (Business Logic Tier)

**Repository**: [TalentManagement-API](https://github.com/workcontrolgit/TalentManagement-API)

#### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| ASP.NET Core | 10.0 | Web API framework |
| Entity Framework Core | 10.0 | ORM for database access |
| AutoMapper | Latest | Object-to-object mapping |
| FluentValidation | Latest | Request validation |
| Swashbuckle | Latest | Swagger/OpenAPI |
| SQL Server | 2019+ | Database |
| Serilog | Latest | Structured logging |

#### Clean Architecture Layers

```
TalentManagement-API/
├── src/
│   ├── Domain/                      # Enterprise business rules
│   │   ├── Entities/                # Domain entities
│   │   │   ├── Employee.cs
│   │   │   ├── Department.cs
│   │   │   └── Position.cs
│   │   ├── Interfaces/              # Repository interfaces
│   │   └── Common/                  # Base entities, value objects
│   │
│   ├── Application/                 # Application business rules
│   │   ├── DTOs/                    # Data Transfer Objects
│   │   │   ├── EmployeeDto.cs
│   │   │   └── DepartmentDto.cs
│   │   ├── Mappings/                # AutoMapper profiles
│   │   ├── Interfaces/              # Service interfaces
│   │   ├── Services/                # Business logic services
│   │   └── Validators/              # FluentValidation validators
│   │
│   ├── Infrastructure/              # External concerns
│   │   ├── Data/                    # EF Core DbContext
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/            # Repository implementations
│   │   └── Identity/                # Identity integration
│   │
│   └── WebApi/                      # Presentation layer
│       ├── Controllers/             # API endpoints
│       │   ├── EmployeesController.cs
│       │   └── DepartmentsController.cs
│       ├── Middleware/              # Exception handling, logging
│       ├── Extensions/              # Service registration
│       ├── Program.cs               # Application entry point
│       └── appsettings.json         # Configuration
│
├── tests/
│   ├── Domain.Tests/
│   ├── Application.Tests/
│   └── WebApi.Tests/
│
└── TalentManagement.sln
```

#### Key Features

**Clean Architecture Benefits:**
- **Testability**: Each layer can be tested in isolation
- **Maintainability**: Changes in one layer don't affect others
- **Flexibility**: Easy to swap implementations (e.g., change database)
- **Separation of Concerns**: Each layer has a single responsibility

**API Endpoints** (example for Employees)

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| GET | `/api/v1/employees` | Get all employees | `app.api.talentmanagement.read` |
| GET | `/api/v1/employees/{id}` | Get employee by ID | `app.api.talentmanagement.read` |
| POST | `/api/v1/employees` | Create employee | `app.api.talentmanagement.write` |
| PUT | `/api/v1/employees/{id}` | Update employee | `app.api.talentmanagement.write` |
| DELETE | `/api/v1/employees/{id}` | Delete employee | `app.api.talentmanagement.write` |

**Entity Framework Core**
- Code-first approach with migrations
- Fluent API for entity configuration
- Repository pattern for data access
- Unit of Work pattern for transactions

**Authentication & Authorization**
```csharp
[Authorize(Policy = "ApiScope")]
[ApiController]
[Route("api/v1/[controller]")]
public class EmployeesController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
    {
        // ...
    }
}
```

#### Configuration Files

**appsettings.json** - Critical configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TalentManagementDb;Trusted_Connection=true;"
  },

  "IdentityServer": {
    "Authority": "https://localhost:44310",
    "ApiName": "app.api.talentmanagement",
    "RequireHttpsMetadata": true
  },

  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },

  "AllowedHosts": "*",

  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

**Key Configuration Points:**
- `Authority`: Must match IdentityServer URL
- `ApiName`: Must match API resource name in IdentityServer
- `AllowedOrigins`: Must include Angular client URL

#### Build Commands

```bash
# Restore NuGet packages
dotnet restore

# Build solution
dotnet build

# Run API
dotnet run --project src/WebApi

# Apply database migrations
dotnet ef database update --project src/Infrastructure --startup-project src/WebApi

# Create new migration
dotnet ef migrations add MigrationName --project src/Infrastructure --startup-project src/WebApi

# Run tests
dotnet test
```

#### Development Workflow

1. **Add New Entity (Domain Layer)**
   ```csharp
   public class SalaryRange : BaseEntity
   {
       public string Title { get; set; }
       public decimal MinSalary { get; set; }
       public decimal MaxSalary { get; set; }
   }
   ```

2. **Add Repository Interface (Domain Layer)**
   ```csharp
   public interface ISalaryRangeRepository : IRepository<SalaryRange>
   {
       Task<IEnumerable<SalaryRange>> GetByTitleAsync(string title);
   }
   ```

3. **Implement Repository (Infrastructure Layer)**
   ```csharp
   public class SalaryRangeRepository : Repository<SalaryRange>, ISalaryRangeRepository
   {
       // Implementation
   }
   ```

4. **Create DTO (Application Layer)**
   ```csharp
   public class SalaryRangeDto
   {
       public int Id { get; set; }
       public string Title { get; set; }
       public decimal MinSalary { get; set; }
       public decimal MaxSalary { get; set; }
   }
   ```

5. **Add Controller (WebApi Layer)**
   ```csharp
   [Authorize(Policy = "ApiScope")]
   [ApiController]
   [Route("api/v1/[controller]")]
   public class SalaryRangesController : ControllerBase
   {
       // CRUD endpoints
   }
   ```

6. **Create Migration**
   ```bash
   dotnet ef migrations add AddSalaryRange --project src/Infrastructure --startup-project src/WebApi
   dotnet ef database update --project src/Infrastructure --startup-project src/WebApi
   ```

---

### 3. Token Service (Authentication Tier)

**Repository**: [Duende-IdentityServer](https://github.com/workcontrolgit/Duende-IdentityServer)

#### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Duende IdentityServer | 7.0 | OAuth 2.0 / OIDC server |
| ASP.NET Core Identity | 10.0 | User management |
| Entity Framework Core | 10.0 | Data access |
| SQL Server | 2019+ | Database |
| Admin UI | Latest | Web-based admin panel |

#### Project Structure

```
Duende-IdentityServer/
├── src/
│   ├── Duende.STS.Identity/         # Main IdentityServer
│   │   ├── Controllers/
│   │   │   ├── AccountController.cs # Login, logout, register
│   │   │   ├── ConsentController.cs # User consent
│   │   │   └── GrantsController.cs  # Manage grants
│   │   ├── Configuration/
│   │   ├── Views/                   # Login UI
│   │   ├── Program.cs
│   │   └── appsettings.json
│   │
│   ├── Duende.Admin/                # Admin UI
│   │   ├── Controllers/
│   │   ├── identitydata.json        # User seed data
│   │   └── identityserverdata.json  # Client configuration
│   │
│   └── Duende.Admin.Api/            # Admin API
│
└── shared/
    ├── identitydata.json            # Shared user data
    └── identityserverdata.json      # Shared config
```

#### Key Features

**OAuth 2.0 Flows Supported:**
- Authorization Code Flow with PKCE (for SPAs)
- Client Credentials Flow (for service-to-service)
- Resource Owner Password Flow (for trusted apps)
- Hybrid Flow (for server-side web apps)

**OpenID Connect:**
- User authentication
- Single Sign-On (SSO)
- ID tokens with user claims
- UserInfo endpoint

**Token Types:**
- **Access Token**: Bearer token for API authorization
- **ID Token**: Contains user identity information
- **Refresh Token**: Long-lived token to obtain new access tokens

**User Management:**
- ASP.NET Core Identity integration
- Password policies
- Email confirmation
- Two-factor authentication (2FA) support
- External login providers (Google, Facebook, etc.)

#### Configuration Files

**identityserverdata.json** - Client and resource configuration

```json
{
  "IdentityResources": [
    {
      "Name": "openid",
      "DisplayName": "User ID",
      "Required": true,
      "UserClaims": ["sub"]
    },
    {
      "Name": "profile",
      "DisplayName": "User profile",
      "UserClaims": ["name", "family_name", "given_name"]
    },
    {
      "Name": "email",
      "DisplayName": "Email address",
      "UserClaims": ["email", "email_verified"]
    },
    {
      "Name": "roles",
      "DisplayName": "User roles",
      "UserClaims": ["role"]
    }
  ],

  "ApiScopes": [
    {
      "Name": "app.api.talentmanagement.read",
      "DisplayName": "Read access to Talent Management API"
    },
    {
      "Name": "app.api.talentmanagement.write",
      "DisplayName": "Write access to Talent Management API"
    }
  ],

  "ApiResources": [
    {
      "Name": "app.api.talentmanagement",
      "DisplayName": "Talent Management API",
      "Scopes": [
        "app.api.talentmanagement.read",
        "app.api.talentmanagement.write"
      ],
      "UserClaims": ["role", "name", "email"]
    }
  ],

  "Clients": [
    {
      "ClientId": "TalentManagement",
      "ClientName": "Talent Management Angular App",
      "AllowedGrantTypes": ["authorization_code"],
      "RequirePkce": true,
      "RequireClientSecret": false,
      "AllowedScopes": [
        "openid",
        "profile",
        "email",
        "roles",
        "app.api.talentmanagement.read",
        "app.api.talentmanagement.write"
      ],
      "RedirectUris": ["http://localhost:4200/callback"],
      "PostLogoutRedirectUris": ["http://localhost:4200"],
      "AllowedCorsOrigins": ["http://localhost:4200"],
      "RequireConsent": false,
      "AccessTokenLifetime": 3600,
      "AllowOfflineAccess": true
    }
  ]
}
```

**identitydata.json** - User seed data

```json
{
  "Users": [
    {
      "Username": "alice",
      "Email": "alice@example.com",
      "Password": "Pass123$",
      "Roles": ["Admin"],
      "Claims": [
        { "Type": "name", "Value": "Alice Smith" },
        { "Type": "given_name", "Value": "Alice" },
        { "Type": "family_name", "Value": "Smith" },
        { "Type": "email", "Value": "alice@example.com" },
        { "Type": "role", "Value": "Admin" }
      ]
    },
    {
      "Username": "bob",
      "Email": "bob@example.com",
      "Password": "Pass123$",
      "Roles": ["User"],
      "Claims": [
        { "Type": "name", "Value": "Bob Johnson" },
        { "Type": "given_name", "Value": "Bob" },
        { "Type": "family_name", "Value": "Johnson" },
        { "Type": "email", "Value": "bob@example.com" },
        { "Type": "role", "Value": "User" }
      ]
    }
  ]
}
```

**Key Configuration Points:**
- **ClientId**: Must match Angular `environment.ts` clientId
- **AllowedScopes**: Must include all scopes requested by Angular
- **RedirectUris**: Must match Angular callback URL
- **AllowedCorsOrigins**: Must include Angular app URL
- **RequirePkce**: Always true for SPAs (security best practice)
- **RequireClientSecret**: Always false for SPAs (can't store secrets)

#### Build Commands

```bash
# Restore packages
dotnet restore

# Build solution
dotnet build

# Run IdentityServer
dotnet run --project src/Duende.STS.Identity

# Run Admin UI
dotnet run --project src/Duende.Admin

# Run Admin API
dotnet run --project src/Duende.Admin.Api

# Apply migrations
dotnet ef database update --project src/Duende.STS.Identity
```

#### Admin UI

Access the Admin UI to manage:

- **Clients**: Configure OAuth/OIDC clients
- **API Resources**: Define protected APIs
- **Identity Resources**: Define user claims
- **Users**: Manage user accounts
- **Roles**: Define user roles
- **API Scopes**: Define fine-grained permissions

**Admin UI URL**: https://localhost:44303

#### Common Tasks

**Add New Client:**
1. Open Admin UI
2. Navigate to Clients → Add New Client
3. Configure:
   - Client ID
   - Allowed Grant Types
   - Redirect URIs
   - Allowed Scopes
4. Save

**Add New API Scope:**
1. Edit `identityserverdata.json`
2. Add to `ApiScopes` array
3. Add to relevant client's `AllowedScopes`
4. Restart IdentityServer

**Add New User:**
1. Edit `identitydata.json`
2. Add user with credentials, roles, claims
3. Run `dotnet ef database update` to seed data
4. Or register via UI at `/Account/Register`

---

## Tutorial Series

This tutorial is divided into multiple parts, each focusing on a specific aspect:

### Part 1: Foundation

**1.1 Understanding the CAT Pattern** _(This document)_
- Architecture overview
- Benefits and trade-offs
- When to use CAT pattern

**1.2 Setting Up Your Development Environment**
- Installing prerequisites
- Cloning the repository
- Understanding Git submodules

**1.3 Running the Complete Stack**
- Starting each component
- Verifying integration
- Troubleshooting common issues

### Part 2: Token Service Deep Dive

**2.1 OAuth 2.0 and OpenID Connect Fundamentals**
- Understanding OAuth 2.0 flows
- OIDC authentication vs OAuth authorization
- Tokens: Access, ID, and Refresh

**2.2 Duende IdentityServer Configuration**
- Client configuration
- API resource and scope definition
- Identity resources and claims
- User management with ASP.NET Identity

**2.3 Securing Your IdentityServer**
- HTTPS enforcement
- PKCE for SPAs
- Token lifetime and refresh strategies
- Password policies and 2FA

### Part 3: API Resource Deep Dive

**3.1 Clean Architecture in .NET**
- Understanding the layers
- Dependency flow
- Domain-driven design principles

**3.2 Entity Framework Core**
- Code-first migrations
- DbContext configuration
- Repository pattern
- Querying best practices

**3.3 API Authentication & Authorization**
- JWT Bearer authentication
- Scope-based authorization
- Role-based access control
- Claims transformation

**3.4 Building RESTful APIs**
- RESTful design principles
- Swagger/OpenAPI documentation
- Validation with FluentValidation
- Error handling and responses

### Part 4: Angular Client Deep Dive

**4.1 Angular Application Architecture**
- Feature modules and lazy loading
- Standalone components (Angular 20)
- Service-based state management
- RxJS patterns

**4.2 OIDC Authentication in Angular**
- angular-auth-oidc-client setup
- Authorization Code Flow with PKCE
- Automatic token refresh
- HTTP interceptor for Bearer tokens

**4.3 Material Design and ng-matero**
- Material Design components
- Theming and customization
- Responsive layouts
- ng-matero dashboard template

**4.4 Calling Protected APIs**
- HTTP client best practices
- Error handling
- Loading states
- Retry strategies

**4.5 Role-Based UI with ngx-permissions**
- Directive-based rendering
- Route guards
- Service-based checks
- Admin vs user views

### Part 5: Advanced Topics

**5.1 Git Submodules Workflow**
- Making changes in submodules
- Updating submodule references
- Branching strategies
- Resolving submodule conflicts

**5.2 Testing Strategies**
- Unit testing APIs with xUnit
- Unit testing Angular with Jasmine/Karma
- Integration testing
- E2E testing with Cypress

**5.3 Deployment**
- Deploying IdentityServer to Azure
- Deploying API to Azure App Service
- Deploying Angular to Azure Static Web Apps
- Environment configuration

**5.4 Monitoring and Logging**
- Serilog structured logging
- Application Insights integration
- Audit logging
- Performance monitoring

**5.5 Scaling the CAT Pattern**
- Horizontal scaling strategies
- Load balancing
- Database replication
- Caching strategies (Redis)

### Part 6: Real-World Features

**6.1 Employee Management CRUD**
- Creating the domain model
- Building the API endpoints
- Building the Angular UI
- Form validation

**6.2 Dashboard with Analytics**
- Chart.js integration
- Real-time data updates
- Dashboard layout
- Performance optimization

**6.3 User Profile and Settings**
- Profile management
- Password change
- User preferences
- Avatar upload

**6.4 Advanced Search and Filtering**
- Dynamic query building
- Server-side pagination
- Sorting and filtering
- Search optimization

---

## Next Steps

Now that you understand the CAT pattern and have the application running, here's what to do next:

### 1. Explore the Running Application

✅ **Try these actions:**
- Log in with test credentials (`alice` / `Pass123$`)
- Navigate through the dashboard
- View the employee list
- Create, edit, and delete an employee
- Check the Swagger UI for API documentation
- Inspect network requests in browser DevTools (note the Bearer token)

### 2. Follow the Tutorial Series

Start with **Part 2: Token Service Deep Dive** to understand authentication:
- How IdentityServer issues tokens
- How the Angular client obtains tokens
- How the API validates tokens

### 3. Make Your First Change

**Easy starter task**: Add a new field to the Employee entity

1. Update `Domain/Entities/Employee.cs` (add property)
2. Create EF migration
3. Update `Application/DTOs/EmployeeDto.cs`
4. Update Angular model in `shared/models/employee.model.ts`
5. Update Angular form to include new field
6. Test end-to-end

This exercise will help you understand how changes flow through all three tiers.

### 4. Review Component-Specific Documentation

Each submodule has detailed documentation:

- **Angular**: [Clients/TalentManagement-Angular-Material/docs/](Clients/TalentManagement-Angular-Material/docs/)
- **API**: Check `ApiResources/TalentManagement-API/README.md`
- **IdentityServer**: Check `TokenService/Duende-IdentityServer/README.md`

### 5. Join the Community

- GitHub Discussions: Ask questions and share your progress
- Issues: Report bugs or request features
- Pull Requests: Contribute improvements

### 6. Customize for Your Needs

This tutorial is a starting point. Consider these customizations:

- **Change the theme**: Modify Angular Material theme colors
- **Add external login**: Integrate Google/Microsoft authentication
- **Add more entities**: Build out the domain model
- **Switch databases**: Try PostgreSQL or MySQL
- **Add caching**: Implement Redis for API responses
- **Add email**: Implement email notifications

---

## Learning Resources

### Official Documentation

- **Angular**: https://angular.dev/
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core/
- **Entity Framework Core**: https://docs.microsoft.com/ef/core/
- **Duende IdentityServer**: https://docs.duendesoftware.com/identityserver/
- **Material Design**: https://material.angular.io/

### OAuth 2.0 and OIDC

- **OAuth 2.0**: https://oauth.net/2/
- **OpenID Connect**: https://openid.net/connect/
- **OAuth 2.0 Playground**: https://www.oauth.com/playground/
- **JWT.io**: https://jwt.io/ (decode and inspect tokens)

### Clean Architecture

- **Clean Architecture by Robert C. Martin**
- **Domain-Driven Design by Eric Evans**
- **Microsoft Clean Architecture Template**: https://github.com/jasontaylordev/CleanArchitecture

### Angular Best Practices

- **Angular Style Guide**: https://angular.dev/style-guide
- **RxJS Best Practices**: https://rxjs.dev/guide/overview

---

## Support and Contribution

### Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Stack Overflow**: Tag questions with `cat-pattern`, `angular`, `identityserver`

### Contributing

Contributions are welcome! See each submodule's CONTRIBUTING.md:

- [Angular Client Contributing Guide](Clients/TalentManagement-Angular-Material/CONTRIBUTING.md)
- [API Contributing Guide](ApiResources/TalentManagement-API/CONTRIBUTING.md)
- [IdentityServer Contributing Guide](TokenService/Duende-IdentityServer/CONTRIBUTING.md)

### Reporting Issues

When reporting issues, please include:

1. **Component**: Angular, API, or IdentityServer
2. **Environment**: OS, browser, .NET version, Node version
3. **Steps to reproduce**
4. **Expected behavior**
5. **Actual behavior**
6. **Error messages** (console logs, server logs)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- **Duende Software** for IdentityServer
- **ng-matero** team for the Angular admin template
- **Microsoft** for ASP.NET Core and Entity Framework Core
- **Angular team** for the amazing framework
- **All contributors** to this project

---

## Conclusion

The **CAT Pattern** provides a robust, scalable, and secure foundation for building modern web applications. By separating authentication, business logic, and presentation into distinct tiers, you gain:

- **Security**: Industry-standard OAuth 2.0/OIDC authentication
- **Scalability**: Independent scaling of each component
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Technology-agnostic architecture

This tutorial gives you a complete, working example to learn from, customize, and deploy.

**Happy coding! 🚀**

---

**Next**: [Part 2 - Token Service Deep Dive →](docs/02-token-service-deep-dive.md)
