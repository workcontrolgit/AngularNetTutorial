# AngularNetTutorial Blog Series Plan

**Series Title:** Full-Stack Development with Angular, .NET, and OAuth 2.0
**Publication:** [Scrum and Coke on Medium](https://medium.com/scrum-and-coke)
**Tutorial Repository:** https://github.com/workcontrolgit/AngularNetTutorial

**Status Key:**
- [ ] Not started
- [~] In progress / Draft exists
- [x] Published

---

## 📚 Published Articles

- [x] **Series Kickoff**
  - **Title:** Building Modern Web Applications with Angular, .NET, and OAuth 2.0
  - **Subtitle:** A Complete Tutorial Series Using the CAT Pattern — Client, API Resource, and Token Service
  - **Published:** https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56
  - **File:** *(external — no local file)*

---

## 📝 Series 0: Architecture & Workspace

- [~] **Article 0.1 — Git Submodules as Workspace**
  - **Title:** Stop Juggling Multiple Repos: Manage Your Full-Stack App Like a Workspace
  - **Subtitle:** How Git Submodules Transform Multi-Repository Projects into a Unified Development Experience
  - **File:** `blogs/series-0-architecture/git-submodule-workspace-MEDIUM.md`
  - **Notes:** Draft complete. Ready to publish.

- [~] **Article 0.2 — Playwright Overview**
  - **Title:** End-to-End Testing Made Simple: How Playwright Transforms Testing for Angular Applications
  - **Subtitle:** Comprehensive E2E Testing for Modern Full-Stack Applications
  - **File:** `blogs/series-0-architecture/playwright-testing-MEDIUM.md`
  - **Notes:** Draft complete. QA done. Ready to publish.

---

## 🔐 Series 1: Authentication & Security

- [~] **Article 1.1 — OAuth 2.0 PKCE Flow**
  - **Title:** Why Your Angular App Needs PKCE: OAuth 2.0 Explained with a Working Demo
  - **Subtitle:** Follow a Login Request from Browser to IdentityServer and Back — No Theory, Just Code
  - **File:** `blogs/series-1-authentication/oauth2-pkce-flow-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

- [~] **Article 1.2 — Angular Route Guards**
  - **Title:** Lock Down Your Angular Routes: Auth Guards with OIDC in 5 Minutes
  - **Subtitle:** How to Protect Pages, Redirect Unauthenticated Users, and Verify It Works with Playwright
  - **File:** `blogs/series-1-authentication/angular-route-guards-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

- [~] **Article 1.3 — HTTP Interceptor**
  - **Title:** Never Forget a Bearer Token Again: Angular's HTTP Interceptor Explained
  - **Subtitle:** How One File Automatically Secures Every API Request in Your Angular App
  - **File:** `blogs/series-1-authentication/angular-http-interceptor-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

- [~] **Article 1.4 — Role-Based UI**
  - **Title:** Show the Right Buttons to the Right People: Role-Based UI in Angular
  - **Subtitle:** How *appHasRole and ngx-permissions Control What Each User Sees — Without Cluttering Your Components
  - **File:** `blogs/series-1-authentication/angular-role-based-ui-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

---

## 🔧 Series 2: .NET 10 Web API

- [~] **Article 2.1 — Clean Architecture**
  - **Title:** How to Structure a .NET 10 API So It Doesn't Become a Mess
  - **Subtitle:** A Walking Tour of Clean Architecture: Domain, Application, Infrastructure, and WebApi Layers
  - **File:** `blogs/series-2-dotnet-api/dotnet-clean-architecture-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

- [~] **Article 2.2 — JWT Token Validation**
  - **Title:** How Your .NET API Knows to Trust Angular — JWT Validation Explained
  - **Subtitle:** Connecting IdentityServer, Access Tokens, and API Authorization in One Clear Flow
  - **File:** `blogs/series-2-dotnet-api/dotnet-jwt-validation-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

- [~] **Article 2.3 — API Versioning**
  - **Title:** Future-Proof Your .NET API: Add Versioning Without Breaking Existing Clients
  - **Subtitle:** Why `/api/v1/` Matters and How to Implement Versioning the Right Way
  - **File:** `blogs/series-2-dotnet-api/dotnet-api-versioning-MEDIUM.md`
  - **Notes:** Draft complete. Ready for review.

- [ ] **Article 2.4 — Swagger with JWT**
  - **Title:** Test Your Secured .NET API Without Writing a Single Line of Frontend Code
  - **Subtitle:** Configuring Swagger to Accept Bearer Tokens for Interactive API Exploration
  - **File:** `blogs/series-2-dotnet-api/dotnet-swagger-jwt-MEDIUM.md`

---

## 🎨 Series 3: Angular Material UI

- [ ] **Article 3.1 — Data Tables**
  - **Title:** Build a Production-Ready Data Table in Angular Material: Sort, Filter, Page
  - **Subtitle:** From Zero to a Fully Functional Employee List with MatTable, MatSort, and MatPaginator
  - **File:** `blogs/series-3-angular-material/angular-material-datatable-MEDIUM.md`

- [ ] **Article 3.2 — Reactive Forms**
  - **Title:** Reactive Forms Done Right: Validation Patterns Every Angular Developer Should Know
  - **Subtitle:** Required Fields, Email Validation, and Custom Validators with Angular Material — With Playwright Tests
  - **File:** `blogs/series-3-angular-material/angular-reactive-forms-MEDIUM.md`

- [ ] **Article 3.3 — Dialogs**
  - **Title:** The Right Way to Ask "Are You Sure?" — Angular Material Dialogs for Confirm Actions
  - **Subtitle:** Building a Delete Confirmation Dialog with MatDialog, Proper Result Handling, and E2E Tests
  - **File:** `blogs/series-3-angular-material/angular-material-dialogs-MEDIUM.md`

---

## 🎭 Series 4: Playwright Testing Deep Dives

- [ ] **Article 4.1 — First Playwright Test**
  - **Title:** Your First Playwright Test for an Angular App — From Zero to Green in 15 Minutes
  - **Subtitle:** Step-by-Step: Install Playwright, Write a Login Test, and Run It Against a Real OAuth 2.0 App
  - **File:** `blogs/series-4-playwright-testing/playwright-first-test-MEDIUM.md`

- [ ] **Article 4.2 — Page Object Model**
  - **Title:** Stop Copy-Pasting Selectors: The Page Object Model for Angular Material
  - **Subtitle:** How to Write Playwright Tests That Don't Break Every Time the UI Changes
  - **File:** `blogs/series-4-playwright-testing/playwright-page-object-model-MEDIUM.md`

- [ ] **Article 4.3 — Role-Based Testing**
  - **Title:** One Feature, Three Users: Testing Role-Based Access Control with Playwright
  - **Subtitle:** How to Use Fixtures to Test Employee, Manager, and HRAdmin Permissions Systematically
  - **File:** `blogs/series-4-playwright-testing/playwright-role-based-testing-MEDIUM.md`

- [ ] **Article 4.4 — JWT Token Testing**
  - **Title:** How to Extract and Verify JWT Tokens in Playwright Tests
  - **Subtitle:** Decode the Token, Check the Claims, and Confirm the Right Scopes Are Granted
  - **File:** `blogs/series-4-playwright-testing/playwright-jwt-token-testing-MEDIUM.md`

- [ ] **Article 4.5 — API Testing**
  - **Title:** Skip the UI: Test Your .NET API Directly with Playwright's Request Fixture
  - **Subtitle:** Authenticate via Browser, Extract the Token, and Call API Endpoints Programmatically
  - **File:** `blogs/series-4-playwright-testing/playwright-api-testing-MEDIUM.md`

---

## 🛠️ Series 5: DevOps & Data

- [ ] **Article 5.1 — Database Seeding**
  - **Title:** 1,000 Test Employees in 3 Seconds: Database Seeding for Development and Testing
  - **Subtitle:** How EF Core's EnsureCreated and a Seeder Give Every Developer an Identical Starting Point
  - **File:** `blogs/series-5-devops/dotnet-database-seeding-MEDIUM.md`

- [ ] **Article 5.2 — CI/CD with GitHub Actions**
  - **Title:** Run Your Playwright Tests Automatically: CI/CD for a Full-Stack Angular/.NET App
  - **Subtitle:** GitHub Actions Workflow That Starts IdentityServer, API, and Angular — Then Runs All E2E Tests
  - **File:** `blogs/series-5-devops/cicd-github-actions-MEDIUM.md`

---

## 📊 Publication Tracker

**Total articles planned:** 19
**Published:** 1
**Draft ready:** 9
**Not started:** 9

---

## 📋 Writing Guidelines

- Follow `BLOG-TEMPLATE.md` for structure
- Save drafts as `[topic]-MEDIUM.md` in the appropriate `blogs/series-N-*/` folder
- All code examples must come from the actual tutorial repo
- Test all code examples before publishing
- No tables — use bullet lists with em dashes (—)
- Add Series Navigation section at bottom of each article
- Update this plan when an article is published (change `[ ]` to `[x]`)
