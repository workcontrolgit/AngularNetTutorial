# Building Modern Web Applications with Angular, .NET, and OAuth 2.0 — Complete Tutorial Series

Learn how to build secure, scalable enterprise applications using the **CAT Pattern** (Client, API Resource, Token Service) with Angular 20, .NET 10, and Duende IdentityServer.

## 📚 Tutorial Series

### Part 1: Foundation
**[01-foundation.md](01-foundation.md)** — Understanding the CAT Pattern

**Topics covered:**
* What is the CAT Pattern?
* High-level architecture
* Key security features
* Getting started (prerequisites, installation)
* Quick start guide (running all components)
* Component deep dive (Angular, API, IdentityServer)
* Benefits of the CAT Pattern
* Next steps and customization ideas

**Perfect for:** Developers new to the CAT pattern, architects evaluating patterns, teams starting new projects

---

### Part 2: Token Service Deep Dive
**[02-token-service-deep-dive.md](02-token-service-deep-dive.md)** — OAuth 2.0, OIDC, and Duende IdentityServer

**Topics covered:**
* OAuth 2.0 fundamentals
* OpenID Connect (OIDC)
* Understanding tokens (Access, ID, Refresh)
* Duende IdentityServer overview
* Configuration deep dive
* Authentication flows (PKCE)
* Security best practices
* Testing and debugging
* Common issues and solutions

**Perfect for:** Understanding authentication and authorization, implementing OAuth 2.0/OIDC, securing SPAs

---

### Part 3: API Resource Deep Dive
**[03-api-resource-deep-dive.md](03-api-resource-deep-dive.md)** — Clean Architecture, Entity Framework Core, and RESTful Design

**Topics covered:**
* Clean Architecture fundamentals
* Domain Layer (entities, enums, exceptions)
* Application Layer (CQRS with MediatR, commands, queries, validators)
* Infrastructure Layer (EF Core, DbContext, configurations)
* WebApi Layer (controllers, authentication, authorization)
* JWT Bearer token validation
* Scope-based and role-based authorization
* Testing strategies (unit and integration tests)
* Best practices (DTOs, async/await, error handling, pagination)

**Perfect for:** Understanding Clean Architecture, implementing CQRS, securing APIs with JWT tokens

---

### Part 4: Angular Client Deep Dive
**[04-angular-client-deep-dive.md](04-angular-client-deep-dive.md)** — Modern SPA with Material Design and OIDC

**Topics covered:**
* Angular fundamentals (standalone components, DI, lifecycle)
* OIDC authentication setup and configuration
* Auth service, guards, and HTTP interceptors
* API communication and services
* Material Design UI components
* Forms (reactive forms, validation)
* Routing and navigation
* Role-based UI with ngx-permissions
* State management with Signals
* Component testing and service testing

**Perfect for:** Building modern Angular SPAs, implementing OIDC authentication, Material Design UIs

---

### Part 5: Advanced Topics
**[05-advanced-topics.md](05-advanced-topics.md)** — Git Submodules, Testing, Deployment, and Production

**Topics covered:**
* Git submodules deep dive (workflows, commands, best practices)
* Testing strategies (unit, integration, E2E with Playwright)
* Docker containerization (Dockerfiles, docker-compose)
* CI/CD pipelines (GitHub Actions)
* Production deployment (Azure, AWS)
* Monitoring and logging (Application Insights, Serilog)
* Performance optimization (caching, compression, lazy loading)
* Production security hardening

**Perfect for:** DevOps, production deployments, CI/CD automation, containerization

---

### Part 6: Real-World Features
**[06-real-world-features.md](06-real-world-features.md)** — CRUD Operations, Dashboard, Search, and Analytics

**Topics covered:**
* Complete CRUD implementation (Create, Read, Update, Delete)
* Dashboard with KPIs and analytics
* Charts and data visualization (Chart.js)
* Advanced search and filtering
* Pagination with server-side paging
* Data export (Excel, CSV)
* Multi-criteria search
* Real-world production patterns

**Perfect for:** Implementing production features, data visualization, search functionality

---

## 🧪 Hands-On Labs

**Want to learn by doing?** Follow our progressive hands-on labs that teach practical skills by building with the actual source code.

**[View All Labs →](labs/README.md)**

### Quick Start Labs

**LAB-01: Setup Verification (20 minutes)**
* **Focus:** Verify development environment and Git submodules
* **Prerequisites:** Git, .NET SDK 10.0+, Node.js 20.x
* **Start here:** [LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)

**LAB-02: JWT Token Inspection (30 minutes)**
* **Focus:** Understand OAuth 2.0 tokens and authentication flow
* **Prerequisites:** LAB-01 completed
* **Continue to:** [LAB-02: Inspect JWT Tokens](labs/LAB-02-inspect-tokens.md)

**LAB-03: Clean Architecture Vertical Slice (30 minutes)**
* **Focus:** Extend API with new property through all layers
* **Prerequisites:** LAB-01, LAB-02 completed
* **Continue to:** [LAB-03: Extend API](labs/LAB-03-extend-api.md)

**LAB-04: Angular Material Component (45 minutes)**
* **Focus:** Build search component with Material Design and RxJS
* **Prerequisites:** LAB-03 completed
* **Continue to:** [LAB-04: Build Component](labs/LAB-04-build-component.md)

**LAB-05: Unit Testing (60 minutes)**
* **Focus:** Write comprehensive unit tests for backend and frontend
* **Prerequisites:** LAB-04 completed
* **Continue to:** [LAB-05: Write Tests](labs/LAB-05-write-tests.md)

**LAB-06: Docker Containerization (60 minutes)**
* **Focus:** Containerize all three CAT Pattern components
* **Prerequisites:** LAB-05 completed
* **Continue to:** [LAB-06: Docker Deployment](labs/LAB-06-docker-deployment.md)

### What You'll Build

✅ **LAB-03:** Add a "Notes" field to Employee entity (Domain → Migration → Application → Testing)
✅ **LAB-04:** Build an Angular search component with Material Design, reactive forms, and RxJS
✅ **LAB-05:** Write unit tests for validators, services, and components
✅ **LAB-06:** Containerize all three CAT Pattern components with Docker Compose

**[Start with LAB-01: Verify Setup →](labs/LAB-01-verify-setup.md)**

---

## 📖 How to Use This Tutorial

### For Learning Theory
1. Start with **[Part 1: Foundation](01-foundation.md)** to understand the architecture
2. Continue with **[Part 2: Token Service](02-token-service-deep-dive.md)** to understand authentication
3. Follow the series sequentially for best results

### For Hands-On Practice
1. Complete **[LAB-01: Verify Setup](labs/LAB-01-verify-setup.md)** to ensure your environment is ready
2. Follow labs **LAB-02 through LAB-06** in sequence
3. Reference tutorial parts as needed for deeper understanding

### Recommended Learning Path
**Best approach for mastering the CAT Pattern:**

1. **Read Part 1** (Foundation) — Understand the big picture
2. **Complete LAB-01** — Verify your setup works
3. **Read Part 2** (Token Service) — Learn authentication theory
4. **Complete LAB-02** — Inspect JWT tokens hands-on
5. **Read Part 3** (API Resource) — Learn Clean Architecture
6. **Complete LAB-03** — Build vertical slice through API
7. **Read Part 4** (Angular Client) — Learn Angular patterns
8. **Complete LAB-04** — Build Angular component
9. **Complete LAB-05** — Add unit tests
10. **Read Part 5** (Advanced Topics) — Learn Docker & deployment
11. **Complete LAB-06** — Containerize the application
12. **Read Part 6** (Real-World Features) — Production patterns

---

## 🗺️ Quick Navigation

### Essential Guides
* **[Repository README](../README.md)** — Project overview and quick start
* **[Setup Submodules Guide](../SETUP-SUBMODULES.md)** — Git submodules setup instructions
* **[CODE-MAP.md](CODE-MAP.md)** — Find anything in the codebase quickly
* **[CLAUDE.md](../CLAUDE.md)** — Developer guide for AI assistance

### Labs & Solutions
* **[All Labs](labs/README.md)** — Hands-on practice exercises
* **[Lab Solutions](labs/solutions/)** — Complete solution code for LAB-03, LAB-04, LAB-05


