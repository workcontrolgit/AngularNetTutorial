# CODE-MAP.md — Developer Navigation Guide

## 🗺️ Quick Navigation

This guide helps you find exactly what you need in the CAT Pattern tutorial repository.

**New here?** Start with [README.md](../README.md) → [TUTORIAL.md](TUTORIAL.md) → [Labs](labs/README.md)

---

## 📚 Documentation Structure

### Getting Started
| File | Purpose | When to Read |
|------|---------|--------------|
| [README.md](../README.md) | Repository overview, quick start | First time setup |
| [SETUP-SUBMODULES.md](../SETUP-SUBMODULES.md) | Git submodules guide | Working with submodules |
| [CLAUDE.md](../CLAUDE.md) | Developer guide for Claude Code | Using AI assistance |

### Tutorial Series (Theory)
| Part | File | Topics | Audience |
|------|------|--------|----------|
| **Part 1** | [01-foundation.md](01-foundation.md) | CAT Pattern, Architecture, Quick Start | Architects, New Developers |
| **Part 2** | [02-token-service-deep-dive.md](02-token-service-deep-dive.md) | OAuth 2.0, OIDC, Duende IdentityServer | Security Engineers |
| **Part 3** | [03-api-resource-deep-dive.md](03-api-resource-deep-dive.md) | Clean Architecture, EF Core, CQRS | Backend Developers |
| **Part 4** | [04-angular-client-deep-dive.md](04-angular-client-deep-dive.md) | Angular, Material Design, OIDC | Frontend Developers |
| **Part 5** | [05-advanced-topics.md](05-advanced-topics.md) | Git, Testing, Docker, CI/CD, Production | DevOps, Full-Stack |
| **Part 6** | [06-real-world-features.md](06-real-world-features.md) | CRUD, Dashboard, Search, Analytics | All Developers |

### Hands-On Labs (Practice)
| Lab | File | Practice Area | Prerequisites |
|-----|------|---------------|---------------|
| **LAB-01** | [labs/LAB-01-verify-setup.md](labs/LAB-01-verify-setup.md) | Setup verification, Git submodules | None |
| **LAB-02** | [labs/LAB-02-inspect-tokens.md](labs/LAB-02-inspect-tokens.md) | JWT tokens, DevTools, OAuth debugging | LAB-01 |
| **LAB-03** | [labs/LAB-03-extend-api.md](labs/LAB-03-extend-api.md) | Domain → Migration → Application → Testing | LAB-01, LAB-02 |
| **LAB-04** | [labs/LAB-04-build-component.md](labs/LAB-04-build-component.md) | Angular component, Material Design, RxJS | LAB-03 |
| **LAB-05** | [labs/LAB-05-write-tests.md](labs/LAB-05-write-tests.md) | Unit tests (xUnit, Jasmine, TestBed) | LAB-04 |
| **LAB-06** | [labs/LAB-06-docker-deployment.md](labs/LAB-06-docker-deployment.md) | Docker, Docker Compose, Containers | LAB-05 |

### Lab Solutions (Reference)
| Solution | File | Description |
|----------|------|-------------|
| **LAB-03 Solution** | [labs/solutions/LAB-03-solution.md](labs/solutions/LAB-03-solution.md) | Complete code for extending API |
| **LAB-04 Solution** | [labs/solutions/LAB-04-solution.md](labs/solutions/LAB-04-solution.md) | Complete Angular component code |
| **LAB-05 Solution** | [labs/solutions/LAB-05-solution.md](labs/solutions/LAB-05-solution.md) | Complete unit test examples |

---

## 🏗️ Repository Structure

```
AngularNetTutorial/
├── docs/                           # 📚 All documentation
│   ├── TUTORIAL.md                # Tutorial series index
│   ├── CODE-MAP.md                # This file
│   ├── 01-foundation.md           # Part 1: CAT Pattern overview
│   ├── 02-token-service-deep-dive.md
│   ├── 03-api-resource-deep-dive.md
│   ├── 04-angular-client-deep-dive.md
│   ├── 05-advanced-topics.md
│   ├── 06-real-world-features.md
│   └── labs/                      # 🧪 Hands-on practice
│       ├── README.md             # Labs overview
│       ├── LAB-01-verify-setup.md
│       ├── LAB-02-inspect-tokens.md
│       ├── LAB-03-extend-api.md
│       ├── LAB-04-build-component.md
│       ├── LAB-05-write-tests.md
│       ├── LAB-06-docker-deployment.md
│       └── solutions/            # Lab solutions
│           ├── LAB-03-solution.md
│           ├── LAB-04-solution.md
│           └── LAB-05-solution.md
│
├── Clients/                       # 🎨 Frontend applications
│   └── TalentManagement-Angular-Material/
│       └── talent-management/
│           ├── src/
│           │   ├── app/
│           │   │   ├── core/     # Services, guards, interceptors
│           │   │   ├── features/ # Feature modules (employees, dashboard)
│           │   │   └── shared/   # Shared components
│           │   └── environments/ # Environment configs
│           └── docs/             # Angular-specific documentation
│
├── ApiResources/                  # 🔧 Backend APIs
│   └── TalentManagement-API/
│       ├── TalentManagementAPI.Domain/
│       │   ├── Entities/         # Employee, Department, Position
│       │   ├── Enums/            # Gender, etc.
│       │   └── ValueObjects/     # PersonName
│       ├── TalentManagementAPI.Application/
│       │   ├── Features/
│       │   │   └── Employees/
│       │   │       ├── Commands/ # CreateEmployee, UpdateEmployee
│       │   │       └── Queries/  # GetEmployees, GetEmployee
│       │   └── Interfaces/       # Repository interfaces
│       ├── TalentManagementAPI.Infrastructure.Persistence/
│       │   ├── Contexts/         # ApplicationDbContext
│       │   ├── Configurations/   # EF Core entity configs
│       │   └── Migrations/       # Database migrations
│       ├── TalentManagementAPI.Infrastructure.Shared/
│       └── TalentManagementAPI.WebApi/
│           └── Controllers/      # API endpoints
│
└── TokenService/                  # 🔐 Authentication
    └── Duende-IdentityServer/
        └── src/
            ├── Duende.STS.Identity/     # IdentityServer
            ├── Duende.Admin/            # Admin UI
            └── Duende.Admin.Api/        # Admin API
```

---

## 🔍 Find What You Need

### "I want to understand the architecture"

**Start here:**
1. [01-foundation.md](01-foundation.md) — CAT Pattern overview
2. [README.md](../README.md) — Architecture diagram

**Deep dives:**
- Token Service: [02-token-service-deep-dive.md](02-token-service-deep-dive.md)
- API Resource: [03-api-resource-deep-dive.md](03-api-resource-deep-dive.md)
- Angular Client: [04-angular-client-deep-dive.md](04-angular-client-deep-dive.md)

---

### "I want to learn by doing"

**Follow the labs in order:**
1. [LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)
2. [LAB-02: Inspect JWT Tokens](labs/LAB-02-inspect-tokens.md)
3. [LAB-03: Extend API](labs/LAB-03-extend-api.md)
4. [LAB-04: Build Angular Component](labs/LAB-04-build-component.md)
5. [LAB-05: Write Unit Tests](labs/LAB-05-write-tests.md)
6. [LAB-06: Docker Containerization](labs/LAB-06-docker-deployment.md)

---

### "I need to fix authentication issues"

**OAuth 2.0 / OIDC:**
- [02-token-service-deep-dive.md](02-token-service-deep-dive.md) — Token types, flows, debugging
- [LAB-02: Inspect JWT Tokens](labs/LAB-02-inspect-tokens.md) — Hands-on token inspection

**Common issues:**
- "invalid_scope" error → [02-token-service-deep-dive.md:628](02-token-service-deep-dive.md)
- Token expiration → [LAB-02: Step 5](labs/LAB-02-inspect-tokens.md#step-5-test-token-expiration)
- CORS errors → [CLAUDE.md](../CLAUDE.md) — "Troubleshooting Authentication Issues"

---

### "I want to add a new API endpoint"

**Clean Architecture workflow:**
1. Read: [03-api-resource-deep-dive.md](03-api-resource-deep-dive.md) — Layers explained
2. Practice: [LAB-03: Extend API](labs/LAB-03-extend-api.md) — Add Notes property
3. Reference: [labs/solutions/LAB-03-solution.md](labs/solutions/LAB-03-solution.md) — Complete code

**Key files to modify:**
- `ApiResources/TalentManagement-API/TalentManagementAPI.Domain/Entities/Employee.cs` — Domain entity
- `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/` — Commands
- `ApiResources/TalentManagement-API/TalentManagementAPI.WebApi/Controllers/` — Controller

---

### "I want to build an Angular component"

**Angular + Material Design:**
1. Read: [04-angular-client-deep-dive.md](04-angular-client-deep-dive.md) — Angular patterns
2. Practice: [LAB-04: Build Angular Component](labs/LAB-04-build-component.md) — Search component
3. Reference: [labs/solutions/LAB-04-solution.md](labs/solutions/LAB-04-solution.md) — Complete code

**Key patterns:**
- Standalone components → [04-angular-client-deep-dive.md:130](04-angular-client-deep-dive.md)
- Reactive forms → [LAB-04: Step 3](labs/LAB-04-build-component.md#step-3-implement-component)
- RxJS operators → [04-angular-client-deep-dive.md:458](04-angular-client-deep-dive.md)

---

### "I want to write tests"

**Unit testing:**
1. Read: [05-advanced-topics.md:137](05-advanced-topics.md) — Testing pyramid
2. Practice: [LAB-05: Write Unit Tests](labs/LAB-05-write-tests.md) — xUnit + Jasmine
3. Reference: [labs/solutions/LAB-05-solution.md](labs/solutions/LAB-05-solution.md) — Test examples

**Test types:**
- FluentValidation tests → [LAB-05: Step 3](labs/LAB-05-write-tests.md#step-3-write-validator-tests)
- Angular service tests → [LAB-05: Step 5](labs/LAB-05-write-tests.md#step-5-create-service-test-file)
- Component tests → [LAB-05: Step 7](labs/LAB-05-write-tests.md#step-7-create-component-test-file)

---

### "I want to containerize the application"

**Docker + Docker Compose:**
1. Read: [05-advanced-topics.md:421](05-advanced-topics.md) — Docker fundamentals
2. Practice: [LAB-06: Docker Containerization](labs/LAB-06-docker-deployment.md) — Full stack
3. Run: `docker-compose up --build`

**Dockerfiles:**
- Angular: [LAB-06: Step 1](labs/LAB-06-docker-deployment.md#step-1-create-angular-dockerfile)
- API: [LAB-06: Step 6](labs/LAB-06-docker-deployment.md#step-6-create-api-dockerfile)
- IdentityServer: [LAB-06: Step 9](labs/LAB-06-docker-deployment.md#step-9-create-identityserver-dockerfile)

---

### "I want to deploy to production"

**Production deployment:**
1. [05-advanced-topics.md:660](05-advanced-topics.md) — CI/CD pipelines
2. [05-advanced-topics.md:719](05-advanced-topics.md) — Cloud deployment (Azure, AWS)
3. [05-advanced-topics.md:951](05-advanced-topics.md) — Production security

**Key topics:**
- GitHub Actions → [05-advanced-topics.md:665](05-advanced-topics.md)
- Azure deployment → [05-advanced-topics.md:769](05-advanced-topics.md)
- Monitoring → [05-advanced-topics.md:900](05-advanced-topics.md)

---

### "I want to work with Git submodules"

**Submodules guide:**
- [SETUP-SUBMODULES.md](../SETUP-SUBMODULES.md) — Complete submodules guide
- [CLAUDE.md](../CLAUDE.md) — "Working with Git Submodules" section
- [05-advanced-topics.md:24](05-advanced-topics.md) — Advanced submodule workflows

**Common commands:**
```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutorial.git

# Initialize submodules after clone
git submodule update --init --recursive

# Pull latest changes
git submodule update --remote --merge
```

---

## 🎯 Learning Paths

### Path 1: Backend Developer

**Focus:** .NET, Clean Architecture, EF Core

1. [01-foundation.md](01-foundation.md) — Overview
2. [03-api-resource-deep-dive.md](03-api-resource-deep-dive.md) — API deep dive
3. [LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)
4. [LAB-03: Extend API](labs/LAB-03-extend-api.md)
5. [LAB-05: Write Unit Tests](labs/LAB-05-write-tests.md) — .NET tests
6. [LAB-06: Docker Deployment](labs/LAB-06-docker-deployment.md)

---

### Path 2: Frontend Developer

**Focus:** Angular, Material Design, OIDC

1. [01-foundation.md](01-foundation.md) — Overview
2. [04-angular-client-deep-dive.md](04-angular-client-deep-dive.md) — Angular deep dive
3. [LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)
4. [LAB-02: Inspect JWT Tokens](labs/LAB-02-inspect-tokens.md)
5. [LAB-04: Build Angular Component](labs/LAB-04-build-component.md)
6. [LAB-05: Write Unit Tests](labs/LAB-05-write-tests.md) — Angular tests

---

### Path 3: Security Engineer

**Focus:** OAuth 2.0, OIDC, IdentityServer

1. [01-foundation.md](01-foundation.md) — Overview
2. [02-token-service-deep-dive.md](02-token-service-deep-dive.md) — Auth deep dive
3. [LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)
4. [LAB-02: Inspect JWT Tokens](labs/LAB-02-inspect-tokens.md)
5. [05-advanced-topics.md:951](05-advanced-topics.md) — Production security

---

### Path 4: DevOps Engineer

**Focus:** Docker, CI/CD, Cloud Deployment

1. [01-foundation.md](01-foundation.md) — Overview
2. [05-advanced-topics.md](05-advanced-topics.md) — Advanced topics
3. [LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)
4. [LAB-06: Docker Deployment](labs/LAB-06-docker-deployment.md)
5. [05-advanced-topics.md:660](05-advanced-topics.md) — CI/CD

---

### Path 5: Full-Stack Developer

**Complete everything in order:**

1. [TUTORIAL.md](TUTORIAL.md) — Start here
2. Parts 1-6 (all theory documents)
3. LAB-01 through LAB-06 (all labs)
4. [06-real-world-features.md](06-real-world-features.md) — Production patterns

---

## 🔗 External Resources

### Technology Documentation
- [.NET 10 Documentation](https://docs.microsoft.com/aspnet/core/)
- [Angular Documentation](https://angular.dev/)
- [Duende IdentityServer Docs](https://docs.duendesoftware.com/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [Angular Material](https://material.angular.io/)

### OAuth 2.0 / OIDC
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenID Connect Specification](https://openid.net/connect/)
- [JWT.io](https://jwt.io/) — Token decoder

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

## 📞 Getting Help

### In-Repository Resources
1. Check [README.md](../README.md) — Quick troubleshooting
2. Review [CLAUDE.md](../CLAUDE.md) — Common issues
3. Search labs for similar problems

### External Help
- **GitHub Issues:** [Report issues](https://github.com/workcontrolgit/AngularNetTutorial/issues)
- **Pull Requests:** [Contribute improvements](https://github.com/workcontrolgit/AngularNetTutorial/pulls)

---

## 🎓 Glossary

### Common Terms

**CAT Pattern** — Client, API Resource, Token Service architecture pattern

**OIDC** — OpenID Connect, authentication protocol built on OAuth 2.0

**JWT** — JSON Web Token, secure token format

**PKCE** — Proof Key for Code Exchange, security extension for OAuth 2.0

**CQRS** — Command Query Responsibility Segregation pattern

**Clean Architecture** — Four-layer architecture (Domain, Application, Infrastructure, WebApi)

**EF Core** — Entity Framework Core, ORM for .NET

**MediatR** — Mediator pattern library for CQRS

**FluentValidation** — Validation library for .NET

**RxJS** — Reactive Extensions for JavaScript

**Material Design** — Google's design system

**TestBed** — Angular testing utility

**xUnit** — .NET testing framework

---

## 📊 Quick Reference

### Application URLs (Development)
- **Angular Client:** http://localhost:4200
- **Web API:** https://localhost:44378
- **Swagger UI:** https://localhost:44378/swagger
- **IdentityServer:** https://localhost:44310
- **IdentityServer Admin:** https://localhost:44303

### Test Credentials
**Angular Application:**
- Username: `ashtyn1`
- Password: `Pa$$word123`

**IdentityServer Admin:**
- Username: `admin`
- Password: `Pa$$word123`

### Default Ports
- Angular: 4200
- API: 44378 (HTTPS), 5001 (HTTP)
- IdentityServer: 44310 (HTTPS), 5000 (HTTP)
- IdentityServer Admin: 44303
- IdentityServer Admin API: 44302
- SQL Server: 1433

---

## 🚀 Quick Commands

### Running the Stack

```bash
# Start IdentityServer
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet run

# Start API
cd ApiResources/TalentManagement-API
dotnet run

# Start Angular
cd Clients/TalentManagement-Angular-Material/talent-management
npm start
```

### Docker

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Testing

```bash
# Run .NET tests
cd ApiResources/TalentManagement-API
dotnet test

# Run Angular tests
cd Clients/TalentManagement-Angular-Material/talent-management
npm test
```

### Git Submodules

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutorial.git

# Update submodules
git submodule update --remote --merge

# Check submodule status
git submodule status
```

---

## 📝 Version Information

**Tutorial Version:** 1.0
**Last Updated:** February 2026

**Component Versions:**
- Angular: 20.x
- .NET: 10.0
- Duende IdentityServer: 7.0
- Node.js: 20.x LTS
- SQL Server: 2022

---

*Need to add something to this map? [Contribute!](https://github.com/workcontrolgit/AngularNetTutorial/pulls)*
