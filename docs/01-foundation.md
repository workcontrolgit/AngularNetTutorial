# Part 1: Foundation — Understanding the CAT Pattern

## Building Modern Web Applications with Angular, .NET, and OAuth 2.0

**[← Back to Main Tutorial](../TUTORIAL.md)** | **[Next: Part 2 →](02-token-service-deep-dive.md)**

---

Welcome to this comprehensive tutorial series that demonstrates building a modern, secure web application using the **CAT (Client, API Resource, Token Service)** pattern. This pattern represents industry best practices for building scalable, maintainable, and secure enterprise applications.

![CAT Pattern Architecture](https://via.placeholder.com/800x400?text=CAT+Pattern+Architecture)

---

## 📚 What You'll Learn

* How to architect modern web applications using separation of concerns
* Implementing OAuth 2.0 and OpenID Connect (OIDC) authentication
* Building RESTful APIs with Clean Architecture
* Creating responsive UIs with Angular and Material Design
* Managing distributed codebases with Git submodules
* Securing APIs with JWT tokens
* Role-based access control (RBAC)

## 👥 Who This Tutorial Is For

* Full-stack developers looking to learn modern authentication patterns
* Teams building enterprise applications requiring secure authentication
* Architects designing microservices-based systems
* Developers transitioning to Angular and .NET stacks

---

## 🎯 What is the CAT Pattern?

The **CAT (Client, API Resource, Token Service)** pattern is an architectural approach that separates authentication, business logic, and user interface into three distinct tiers.

### Architecture Overview

```
┌─────────────────┬─────────────────┬─────────────────┐
│     Client      │   API Resource  │  Token Service  │
│   (Angular)     │    (.NET API)   │ (IdentityServer)│
│                 │                 │                 │
│  • UI/UX        │  • Business     │  • Auth         │
│  • Routing      │    Logic        │  • Tokens       │
│  • State Mgmt   │  • Data Access  │  • Users        │
│  • API Calls    │  • Validation   │  • OAuth 2.0    │
└─────────────────┴─────────────────┴─────────────────┘
         │                 │                 │
         └──────── HTTPS + JWT Tokens ───────┘
```

### Why CAT Pattern?

✅ **Separation of Concerns** — Each tier has a single, well-defined responsibility

✅ **Independent Scaling** — Scale each component based on demand

✅ **Technology Agnostic** — Swap implementations without affecting other tiers

✅ **Security by Design** — Centralized authentication with token-based authorization

✅ **Microservices Ready** — Foundation for transitioning to microservices architecture

---

## 🏗️ High-Level Architecture

Our application consists of three main components:

### 1. **Angular Client (Port 4200)**
* Material Design UI
* OIDC Client authentication
* HTTP Interceptor adds Bearer tokens to requests

### 2. **IdentityServer (Port 44310)**
* User authentication
* OAuth 2.0 / OIDC flows
* Token issuance and validation
* Client and scope management

### 3. **ASP.NET Core Web API (Port 44378)**
* CRUD operations
* Business logic
* JWT authentication
* Role-based authorization

### Authentication Flow

```
1. User clicks "Login" in Angular
   ↓
2. Redirect to IdentityServer
   ↓
3. User enters credentials
   ↓
4. IdentityServer validates credentials
   ↓
5. Redirect back with authorization code
   ↓
6. Exchange code for tokens (PKCE)
   ↓
7. Store tokens in memory
   ↓
8. API requests include Bearer token
   ↓
9. API validates token against IdentityServer
   ↓
10. Return protected data
```

![CAT Pattern Architecture](images/cat-pattern-architecture.png)
*Figure 1: CAT Pattern architecture showing the three-tier separation of concerns*

---

## 🔐 Key Security Features

### OAuth 2.0 Authorization Code Flow with PKCE
Secure authentication for Single Page Applications with protection against authorization code interception.

### JWT Bearer Token Authentication
Stateless API authentication with token-based authorization and scopes.

### Role-Based Access Control (RBAC)
Fine-grained permissions using ngx-permissions and API endpoint protection.

### Secure Token Storage
In-memory token storage (no localStorage) with automatic token refresh.

### HTTPS Enforcement
All communication encrypted with CORS configuration for cross-origin requests.

---

## 🚀 Getting Started

### Prerequisites

**Tools you'll need:**

* **.NET SDK 10.0+** — Build and run .NET applications — [Download](https://dotnet.microsoft.com/download)
* **Node.js 20.x LTS** — Run Angular development server — [Download](https://nodejs.org/)
* **npm 10+** — Package manager for Node.js — Included with Node.js
* **Git (Latest)** — Version control and submodules — [Download](https://git-scm.com/)
* **Visual Studio Code** — Recommended code editor — [Download](https://code.visualstudio.com/)

**Optional tools:**
* SQL Server Management Studio or Azure Data Studio for database management
* Postman for API testing
* Git GUI Client like GitHub Desktop or SourceTree

### System Requirements

* **Operating System:** Windows 10/11, macOS 10.15+, or Linux
* **RAM:** 8GB minimum (16GB recommended)
* **Disk Space:** 5GB free space
* **Browser:** Chrome, Edge, or Firefox (latest versions)

### Clone the Repository

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git

cd AngularNetTutotial

# Verify submodules are initialized
git submodule status
```

If you've already cloned without submodules:

```bash
git submodule update --init --recursive
```

### Quick Start: Running All Components

**⚠️ Important:** Start components in this specific order!

#### Step 1: Start IdentityServer (Token Service)

**Why First?** The API and Angular client both depend on IdentityServer for token validation.

```bash
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet restore
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44310`

**Verify:** Open browser to `https://localhost:44310` — you should see the IdentityServer login page

#### Step 2: Start API Resource (Backend)

**Why Second?** The API needs IdentityServer running to validate tokens.

```bash
cd ApiResources/TalentManagement-API
dotnet restore
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44378`

**Verify:** Open browser to `https://localhost:44378/swagger` — you should see Swagger UI

#### Step 3: Start Angular Client (Frontend)

```bash
cd Clients/TalentManagement-Angular-Material/talent-management
npm install
npm start
```

**Wait for:** `✔ Browser application bundle generation complete.`

**Verify:** Open browser to `http://localhost:4200` — you should see the login page

### Application URLs

**Where to access each component:**

* **Angular Client:** http://localhost:4200 — Main application UI
* **Web API:** https://localhost:44378 — RESTful API endpoints
* **Swagger UI:** https://localhost:44378/swagger — API documentation
* **IdentityServer:** https://localhost:44310 — Authentication server
* **IdentityServer Admin:** https://localhost:44303 — Admin panel
* **IdentityServer Admin API:** https://localhost:44302 — Admin API

### First Login

**Try it out:**

1. Navigate to **http://localhost:4200**
2. Click **"Sign In"**
3. You'll be redirected to IdentityServer (https://localhost:44310)
4. Use default credentials:
   * **Username:** `alice` or `admin`
   * **Password:** `Pass123$`
5. After successful login, you'll be redirected back to the Angular dashboard

![Angular Login Page](images/angular-login-page.png)
*Figure 2: TalentManagement Angular application login page*

![IdentityServer Login](images/identityserver-login.png)
*Figure 3: Duende IdentityServer authentication page*

![Application Dashboard](images/application-dashboard.png)
*Figure 4: TalentManagement dashboard after successful authentication*

### Common Issues

**IdentityServer won't start**
* **Problem:** Port 44310 already in use
* **Solution:** Kill process using the port or change port in `Properties/launchSettings.json`

**API returns 401 Unauthorized**
* **Problem:** IdentityServer not running or URL mismatch
* **Solution:** Verify IdentityServer is running at https://localhost:44310

**Angular shows "invalid_scope" error**
* **Problem:** Scope mismatch between Angular config and IdentityServer
* **Solution:** Verify `environment.ts` scope matches `identityserverdata.json`

**Submodules are empty**
* **Problem:** Cloned without `--recurse-submodules`
* **Solution:** Run `git submodule update --init --recursive`

---

## 📦 Component Deep Dive

### 1. Angular Client (Presentation Tier)

**Repository:** [TalentManagement-Angular-Material](https://github.com/workcontrolgit/TalentManagement-Angular-Material)

**Technology Stack:**

* **Angular 20** — Frontend framework
* **Angular Material 20** — UI component library
* **ng-matero** — Admin dashboard template
* **angular-auth-oidc-client** — OIDC authentication
* **ngx-permissions** — Role-based permissions
* **RxJS 7.x** — Reactive programming
* **TypeScript 5.x** — Type-safe JavaScript
* **Chart.js** — Data visualization

**Key Features:**

* **Authentication & Authorization**
  * OIDC authentication with automatic token refresh
  * HTTP interceptor automatically adds Bearer token to API requests
  * Route guards protect authenticated routes
  * Role-based UI rendering using ngx-permissions

* **UI Components**
  * Material Design components (buttons, forms, tables, dialogs)
  * Responsive layouts (mobile, tablet, desktop)
  * Data tables with sorting, filtering, pagination
  * Form validation with reactive forms
  * Snackbar notifications for user feedback

* **State Management**
  * Service-based state management
  * RxJS observables for reactive data flow
  * BehaviorSubjects for shared state

* **Code Organization**
  * Feature modules (lazy-loaded for performance)
  * Standalone components (Angular 20)
  * Shared module for common components
  * Core module for singleton services

**Configuration Example (environment.ts):**

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

**Important configuration points:**
* `apiUrl` must match the running API URL
* `identityServerUrl` must match the running IdentityServer URL
* `clientId` must match a client configured in IdentityServer
* `scope` must be a subset of scopes allowed for the client

**Build Commands:**

```bash
# Development server with live reload
npm start

# Build for production
npm run build

# Run unit tests
npm test

# Lint code
npm run lint
```

---

### 2. API Resource (Business Logic Tier)

**Repository:** [TalentManagement-API](https://github.com/workcontrolgit/TalentManagement-API)

**Technology Stack:**

* **ASP.NET Core 10** — Web API framework
* **Entity Framework Core 10** — ORM for database access
* **AutoMapper** — Object-to-object mapping
* **FluentValidation** — Request validation
* **Swashbuckle** — Swagger/OpenAPI documentation
* **SQL Server 2019+** — Database
* **Serilog** — Structured logging

**Clean Architecture Layers:**

```
Domain/
├── Entities/         # Domain entities (Employee, Department, Position)
├── Interfaces/       # Repository interfaces
└── Common/           # Base entities, value objects

Application/
├── DTOs/             # Data Transfer Objects
├── Mappings/         # AutoMapper profiles
├── Services/         # Business logic services
└── Validators/       # FluentValidation validators

Infrastructure/
├── Data/             # EF Core DbContext
├── Repositories/     # Repository implementations
└── Identity/         # Identity integration

WebApi/
├── Controllers/      # API endpoints
├── Middleware/       # Exception handling, logging
└── Extensions/       # Service registration
```

**Benefits of Clean Architecture:**

* **Testability** — Each layer can be tested in isolation
* **Maintainability** — Changes in one layer don't affect others
* **Flexibility** — Easy to swap implementations (e.g., change database)
* **Separation of Concerns** — Each layer has a single responsibility

**API Endpoints (Employees Example):**

* **GET /api/v1/employees** — Get all employees (requires `read` scope)
* **GET /api/v1/employees/{id}** — Get employee by ID (requires `read` scope)
* **POST /api/v1/employees** — Create employee (requires `write` scope)
* **PUT /api/v1/employees/{id}** — Update employee (requires `write` scope)
* **DELETE /api/v1/employees/{id}** — Delete employee (requires `write` scope)

**Authentication & Authorization Example:**

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
        // Business logic here
    }
}
```

**Configuration Example (appsettings.json):**

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

  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

**Important configuration points:**
* `Authority` must match IdentityServer URL
* `ApiName` must match API resource name in IdentityServer
* `AllowedOrigins` must include Angular client URL

**Build Commands:**

```bash
# Restore NuGet packages
dotnet restore

# Build solution
dotnet build

# Run API
dotnet run --project src/WebApi

# Apply database migrations
dotnet ef database update --project src/Infrastructure --startup-project src/WebApi

# Run tests
dotnet test
```

---

### 3. Token Service (Authentication Tier)

**Repository:** [Duende-IdentityServer](https://github.com/workcontrolgit/Duende-IdentityServer)

**Technology Stack:**

* **Duende IdentityServer 7.0** — OAuth 2.0 / OIDC server
* **ASP.NET Core Identity 10** — User management
* **Entity Framework Core 10** — Data access
* **SQL Server 2019+** — Database
* **Admin UI** — Web-based admin panel

**OAuth 2.0 Flows Supported:**

* **Authorization Code Flow with PKCE** — For Single Page Applications (SPAs)
* **Client Credentials Flow** — For service-to-service authentication
* **Resource Owner Password Flow** — For trusted applications
* **Hybrid Flow** — For server-side web applications

**OpenID Connect Features:**

* User authentication
* Single Sign-On (SSO)
* ID tokens with user claims
* UserInfo endpoint

**Token Types:**

**Access Token:**
* **Purpose:** Grant access to protected resources (APIs)
* **Format:** JWT or reference token
* **Lifetime:** Short (typically 1 hour)
* **Validated by:** Resource server (API)
* **Contains:** Scopes, client ID, user claims

**ID Token:**
* **Purpose:** Prove user identity to the client
* **Format:** Always JWT
* **Lifetime:** Short (typically 5 minutes)
* **Validated by:** Client application
* **Contains:** User identity claims (name, email, roles)

**Refresh Token:**
* **Purpose:** Obtain new access tokens without re-authentication
* **Format:** Opaque string (not JWT)
* **Lifetime:** Long (days, weeks, or months)
* **Validated by:** Authorization server (IdentityServer)
* **Contains:** Reference to user session

**Configuration Example (identityserverdata.json):**

```json
{
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

**Important configuration points:**

* **ClientId** — Must match Angular `environment.ts` clientId
* **AllowedScopes** — Must include all scopes requested by Angular
* **RedirectUris** — Must match Angular callback URL
* **AllowedCorsOrigins** — Must include Angular app URL
* **RequirePkce** — Always true for SPAs (security best practice)
* **RequireClientSecret** — Always false for SPAs (can't store secrets)

**User Seed Data Example (identitydata.json):**

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
        { "Type": "email", "Value": "alice@example.com" },
        { "Type": "role", "Value": "Admin" }
      ]
    }
  ]
}
```

**Build Commands:**

```bash
# Restore packages
dotnet restore

# Run IdentityServer
dotnet run --project src/Duende.STS.Identity

# Run Admin UI
dotnet run --project src/Duende.Admin

# Apply migrations
dotnet ef database update --project src/Duende.STS.Identity
```

**Admin UI Tasks:**

Access the Admin UI at **https://localhost:44303** to manage:

* **Clients** — Configure OAuth/OIDC clients
* **API Resources** — Define protected APIs
* **Identity Resources** — Define user claims
* **Users** — Manage user accounts
* **Roles** — Define user roles
* **API Scopes** — Define fine-grained permissions

---

## 💡 Benefits of the CAT Pattern

### Scalability

**Independent Deployment**
Deploy client, API, or auth server independently without affecting other components.

**Horizontal Scaling**
Scale components based on load — scale API for high traffic while keeping IdentityServer lightweight.

**CDN-Friendly**
Serve static Angular app from CDN for global distribution and faster load times.

**Database Separation**
Separate databases for identity and application data improves security and performance.

### Maintainability

**Clear Boundaries**
Each component has well-defined responsibilities, making code easier to understand and modify.

**Technology Flexibility**
Replace Angular with React or Vue without touching the API or authentication logic.

**Team Organization**
Different teams can own different tiers — frontend team, backend team, security team.

**Git Submodules**
Independent version control for each component allows parallel development.

### Security

**Centralized Authentication**
Single source of truth for user identity reduces attack surface.

**Token-Based Authorization**
Stateless, scalable security model that works across microservices.

**Scope-Based Access**
Fine-grained API permissions control what each client can access.

**Security Updates**
Update auth server without affecting client or API code.

### Testability

**Unit Testing**
Test each layer in isolation with mock dependencies.

**Integration Testing**
Test API endpoints with mock tokens without running IdentityServer.

**E2E Testing**
Test complete flows across all tiers in staging environment.

**Mocking**
Easy to mock external dependencies like databases and auth providers.

### Developer Experience

**Hot Reload**
Angular development server with live reload for instant feedback.

**Swagger UI**
Interactive API testing without Postman or other tools.

**TypeScript**
Type safety across frontend catches errors at compile time.

**Separation of Concerns**
Work on UI without touching backend logic — faster iteration cycles.

### Enterprise Readiness

**Multiple Clients**
Support web, mobile, and desktop apps with single backend and auth server.

**API Gateway Ready**
Easy integration with API gateways like Azure API Management or Kong.

**Microservices Foundation**
Natural evolution to microservices architecture when needed.

**Audit & Compliance**
Centralized logging and audit trails for regulatory compliance.

---

## 📖 Tutorial Series Roadmap

This tutorial is divided into 6 parts:

### Part 1: Foundation
* **1.1 Understanding the CAT Pattern** (this document)
* **1.2 Setting Up Development Environment**
* **1.3 Running the Complete Stack**

### Part 2: Token Service Deep Dive
* **2.1 OAuth 2.0 and OpenID Connect Fundamentals**
* **2.2 Duende IdentityServer Configuration**
* **2.3 Securing Your IdentityServer**

### Part 3: API Resource Deep Dive
* **3.1 Clean Architecture in .NET**
* **3.2 Entity Framework Core**
* **3.3 API Authentication & Authorization**
* **3.4 Building RESTful APIs**

### Part 4: Angular Client Deep Dive
* **4.1 Angular Application Architecture**
* **4.2 OIDC Authentication in Angular**
* **4.3 Material Design and ng-matero**
* **4.4 Calling Protected APIs**
* **4.5 Role-Based UI with ngx-permissions**

### Part 5: Advanced Topics
* **5.1 Git Submodules Workflow**
* **5.2 Testing Strategies**
* **5.3 Deployment to Azure**
* **5.4 Monitoring and Logging**
* **5.5 Scaling the CAT Pattern**

### Part 6: Real-World Features
* **6.1 Employee Management CRUD**
* **6.2 Dashboard with Analytics**
* **6.3 User Profile and Settings**
* **6.4 Advanced Search and Filtering**

---

## 🎓 Next Steps

### 1. Explore the Running Application

**Try these actions:**
* Log in with test credentials (`alice` / `Pass123$`)
* Navigate through the dashboard
* View and manage employees
* Create, edit, and delete an employee
* Check the Swagger UI for API documentation
* Inspect network requests in browser DevTools (note the Bearer token)

### 2. Make Your First Change

**Easy starter task: Add a new field to the Employee entity**

Follow this workflow to understand how changes flow through all three tiers:

1. Update `Domain/Entities/Employee.cs` (add property)
2. Create EF migration: `dotnet ef migrations add AddNewField`
3. Update database: `dotnet ef database update`
4. Update `Application/DTOs/EmployeeDto.cs` (add property)
5. Update Angular model in `shared/models/employee.model.ts`
6. Update Angular form to include new field
7. Test end-to-end

### 3. Customize for Your Needs

**Ideas to explore:**

* **Change the theme** — Modify Angular Material theme colors
* **Add external login** — Integrate Google or Microsoft authentication
* **Add more entities** — Build out the domain model (Projects, Timesheets)
* **Switch databases** — Try PostgreSQL or MySQL instead of SQL Server
* **Add caching** — Implement Redis for API responses
* **Add email** — Implement email notifications with SendGrid
* **Add file upload** — Implement avatar or document upload

### 4. Follow the Tutorial Series

Start with **Part 2: Token Service Deep Dive** to understand:
* How IdentityServer issues tokens
* How the Angular client obtains tokens
* How the API validates tokens
* OAuth 2.0 flows in detail
* PKCE security for SPAs

---

## 🔗 Learning Resources

### Official Documentation

* **Angular** — https://angular.dev/
* **ASP.NET Core** — https://docs.microsoft.com/aspnet/core/
* **Entity Framework Core** — https://docs.microsoft.com/ef/core/
* **Duende IdentityServer** — https://docs.duendesoftware.com/identityserver/
* **Material Design** — https://material.angular.io/

### OAuth 2.0 and OIDC

* **OAuth 2.0** — https://oauth.net/2/
* **OpenID Connect** — https://openid.net/connect/
* **OAuth 2.0 Playground** — https://www.oauth.com/playground/
* **JWT.io** — https://jwt.io/ (decode and inspect tokens)

### Clean Architecture

* **Clean Architecture** by Robert C. Martin
* **Domain-Driven Design** by Eric Evans
* **Microsoft Clean Architecture Template** — https://github.com/jasontaylordev/CleanArchitecture

### Angular Best Practices

* **Angular Style Guide** — https://angular.dev/style-guide
* **RxJS Best Practices** — https://rxjs.dev/guide/overview

---

## 🎉 Conclusion

The **CAT Pattern** provides a robust, scalable, and secure foundation for building modern web applications. By separating authentication, business logic, and presentation into distinct tiers, you gain:

✅ **Security** — Industry-standard OAuth 2.0/OIDC authentication

✅ **Scalability** — Independent scaling of each component

✅ **Maintainability** — Clear separation of concerns

✅ **Flexibility** — Technology-agnostic architecture

This tutorial gives you a complete, working example to learn from, customize, and deploy to production.

**Happy coding!** 🚀

---

## 🔗 Repository & Resources

**Full source code:** [github.com/workcontrolgit/AngularNetTutotial](https://github.com/workcontrolgit/AngularNetTutotial)

**Tutorial documentation:** Complete guides in the docs/ folder

**Component repositories:**
* Angular Client: [TalentManagement-Angular-Material](https://github.com/workcontrolgit/TalentManagement-Angular-Material)
* .NET API: [TalentManagement-API](https://github.com/workcontrolgit/TalentManagement-API)
* IdentityServer: [Duende-IdentityServer](https://github.com/workcontrolgit/Duende-IdentityServer)

---

**Next in series:** [Part 2 — Token Service Deep Dive →](02-token-service-deep-dive.md)

---

*This tutorial series covers building production-ready applications with Angular 20, .NET 10, and Duende IdentityServer 7.0. Perfect for full-stack developers, architects, and teams building secure enterprise applications.*


