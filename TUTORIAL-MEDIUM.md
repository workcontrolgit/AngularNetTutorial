# Building Modern Web Applications with Angular, .NET, and OAuth 2.0

## A Complete Tutorial Series Using the CAT Pattern

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

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 10.0+ | [Download](https://dotnet.microsoft.com/download) |
| Node.js | 20.x LTS | [Download](https://nodejs.org/) |
| Git | Latest | [Download](https://git-scm.com/) |
| VS Code | Latest | [Download](https://code.visualstudio.com/) |

### Clone the Repository

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git

cd AngularNetTutotial

# Verify submodules are initialized
git submodule status
```

### Quick Start: Running All Components

**⚠️ Start in this order:**

#### Step 1: Start IdentityServer

```bash
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet restore
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44310`

#### Step 2: Start API

```bash
cd ApiResources/TalentManagement-API
dotnet restore
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44378`

#### Step 3: Start Angular Client

```bash
cd Clients/TalentManagement-Angular-Material/talent-management
npm install
npm start
```

**Wait for:** `✔ Browser application bundle generation complete.`

### Application URLs

| Component | URL |
|-----------|-----|
| **Angular Client** | http://localhost:4200 |
| **Web API** | https://localhost:44378 |
| **Swagger UI** | https://localhost:44378/swagger |
| **IdentityServer** | https://localhost:44310 |
| **Admin UI** | https://localhost:44303 |

### First Login

1. Navigate to **http://localhost:4200**
2. Click **"Sign In"**
3. Login with: **alice** / **Pass123$**
4. You'll be redirected to the dashboard

---

## 📦 Component Details

### 1. Angular Client (Presentation Tier)

**Technology Stack:**
* Angular 20
* Angular Material
* ng-matero template
* angular-auth-oidc-client
* ngx-permissions
* RxJS 7.x
* TypeScript 5.x

**Key Features:**
* OIDC authentication with automatic token refresh
* HTTP interceptor for Bearer tokens
* Route guards for protected pages
* Material Design components
* Responsive layouts
* Service-based state management

**Configuration (environment.ts):**

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44378/api/v1',
  identityServerUrl: 'https://localhost:44310',
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',
};
```

### 2. API Resource (Business Logic Tier)

**Technology Stack:**
* ASP.NET Core 10
* Entity Framework Core 10
* AutoMapper
* FluentValidation
* Swashbuckle (Swagger)
* Serilog

**Clean Architecture Layers:**

```
Domain/
├── Entities/         # Domain entities
├── Interfaces/       # Repository interfaces
└── Common/           # Base entities

Application/
├── DTOs/             # Data Transfer Objects
├── Mappings/         # AutoMapper profiles
├── Services/         # Business logic
└── Validators/       # FluentValidation

Infrastructure/
├── Data/             # EF Core DbContext
├── Repositories/     # Repository implementations
└── Identity/         # Identity integration

WebApi/
├── Controllers/      # API endpoints
├── Middleware/       # Exception handling
└── Extensions/       # Service registration
```

**API Endpoints (Employees):**

| Method | Endpoint | Authorization |
|--------|----------|---------------|
| GET | `/api/v1/employees` | `read` scope |
| GET | `/api/v1/employees/{id}` | `read` scope |
| POST | `/api/v1/employees` | `write` scope |
| PUT | `/api/v1/employees/{id}` | `write` scope |
| DELETE | `/api/v1/employees/{id}` | `write` scope |

**Configuration (appsettings.json):**

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

### 3. Token Service (Authentication Tier)

**Technology Stack:**
* Duende IdentityServer 7.0
* ASP.NET Core Identity
* Entity Framework Core
* SQL Server

**OAuth 2.0 Flows Supported:**
* Authorization Code Flow with PKCE (for SPAs)
* Client Credentials Flow (service-to-service)
* Resource Owner Password Flow (trusted apps)
* Hybrid Flow (server-side web apps)

**Token Types:**

**Access Token** — Bearer token for API authorization (1 hour lifetime)

**ID Token** — Contains user identity information (5 minutes lifetime)

**Refresh Token** — Long-lived token to obtain new access tokens (30 days)

**Configuration (identityserverdata.json):**

```json
{
  "Clients": [
    {
      "ClientId": "TalentManagement",
      "AllowedGrantTypes": ["authorization_code"],
      "RequirePkce": true,
      "RequireClientSecret": false,
      "AllowedScopes": [
        "openid", "profile", "email", "roles",
        "app.api.talentmanagement.read",
        "app.api.talentmanagement.write"
      ],
      "RedirectUris": ["http://localhost:4200/callback"],
      "PostLogoutRedirectUris": ["http://localhost:4200"],
      "AllowedCorsOrigins": ["http://localhost:4200"],
      "AccessTokenLifetime": 3600,
      "AllowOfflineAccess": true
    }
  ]
}
```

---

## 💡 Benefits of the CAT Pattern

### Scalability
* **Independent Deployment** — Deploy client, API, or auth server independently
* **Horizontal Scaling** — Scale components based on load
* **CDN-Friendly** — Serve static Angular app from CDN
* **Database Separation** — Separate databases for identity and application data

### Maintainability
* **Clear Boundaries** — Each component has well-defined responsibilities
* **Technology Flexibility** — Replace Angular with React without touching API
* **Team Organization** — Different teams can own different tiers
* **Git Submodules** — Independent version control for each component

### Security
* **Centralized Authentication** — Single source of truth for user identity
* **Token-Based Authorization** — Stateless, scalable security model
* **Scope-Based Access** — Fine-grained API permissions
* **Security Updates** — Update auth server without affecting client/API

### Developer Experience
* **Hot Reload** — Angular development server with live reload
* **Swagger UI** — Interactive API testing
* **TypeScript** — Type safety across frontend
* **Separation of Concerns** — Work on UI without touching backend logic

---

## 📖 Tutorial Series

This tutorial is divided into 6 parts:

### Part 1: Foundation
* Understanding the CAT Pattern (this document)
* Setting Up Development Environment
* Running the Complete Stack

### Part 2: Token Service Deep Dive
* OAuth 2.0 and OpenID Connect Fundamentals
* Duende IdentityServer Configuration
* Securing Your IdentityServer

### Part 3: API Resource Deep Dive
* Clean Architecture in .NET
* Entity Framework Core
* API Authentication & Authorization
* Building RESTful APIs

### Part 4: Angular Client Deep Dive
* Angular Application Architecture
* OIDC Authentication in Angular
* Material Design and ng-matero
* Calling Protected APIs
* Role-Based UI with ngx-permissions

### Part 5: Advanced Topics
* Git Submodules Workflow
* Testing Strategies
* Deployment
* Monitoring and Logging
* Scaling the CAT Pattern

### Part 6: Real-World Features
* Employee Management CRUD
* Dashboard with Analytics
* User Profile and Settings
* Advanced Search and Filtering

---

## 🎓 Next Steps

### 1. Explore the Running Application

Try these actions:
* Log in with test credentials (`alice` / `Pass123$`)
* Navigate through the dashboard
* View and manage employees
* Check the Swagger UI for API documentation
* Inspect network requests (note the Bearer token)

### 2. Make Your First Change

**Easy starter task:** Add a new field to the Employee entity

1. Update `Domain/Entities/Employee.cs`
2. Create EF migration
3. Update `Application/DTOs/EmployeeDto.cs`
4. Update Angular model
5. Update Angular form
6. Test end-to-end

### 3. Customize for Your Needs

* Change the Material Design theme
* Add external login (Google/Microsoft)
* Add more entities
* Switch databases (PostgreSQL/MySQL)
* Add caching (Redis)
* Implement email notifications

---

## 🔗 Learning Resources

### Official Documentation
* [Angular](https://angular.dev/)
* [ASP.NET Core](https://docs.microsoft.com/aspnet/core/)
* [Entity Framework Core](https://docs.microsoft.com/ef/core/)
* [Duende IdentityServer](https://docs.duendesoftware.com/identityserver/)
* [Material Design](https://material.angular.io/)

### OAuth 2.0 and OIDC
* [OAuth 2.0](https://oauth.net/2/)
* [OpenID Connect](https://openid.net/connect/)
* [JWT.io](https://jwt.io/) — Decode and inspect tokens

### Clean Architecture
* Clean Architecture by Robert C. Martin
* Domain-Driven Design by Eric Evans
* [Microsoft Clean Architecture Template](https://github.com/jasontaylordev/CleanArchitecture)

---

## 🤝 Support and Contribution

### Getting Help
* **GitHub Issues** — Report bugs or request features
* **GitHub Discussions** — Ask questions and share ideas
* **Stack Overflow** — Tag questions with `cat-pattern`, `angular`, `identityserver`

### Contributing
Contributions are welcome! See each submodule's CONTRIBUTING.md.

---

## 🎉 Conclusion

The **CAT Pattern** provides a robust, scalable, and secure foundation for building modern web applications. By separating authentication, business logic, and presentation into distinct tiers, you gain:

✅ **Security** — Industry-standard OAuth 2.0/OIDC authentication

✅ **Scalability** — Independent scaling of each component

✅ **Maintainability** — Clear separation of concerns

✅ **Flexibility** — Technology-agnostic architecture

This tutorial gives you a complete, working example to learn from, customize, and deploy.

**Happy coding!** 🚀

---

## 🔗 Repository

Full source code: [github.com/workcontrolgit/AngularNetTutotial](https://github.com/workcontrolgit/AngularNetTutotial)

---

**Next in series:** [Part 2 — Token Service Deep Dive →](docs/02-token-service-deep-dive.md)

---

*This tutorial series covers building production-ready applications with Angular 20, .NET 10, and Duende IdentityServer 7.0.*

*Tags: #angular #dotnet #oauth2 #identityserver #webdevelopment #authentication #cleanarchitecture #typescript #csharp*