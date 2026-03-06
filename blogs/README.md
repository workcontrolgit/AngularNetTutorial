# Blogs

This folder contains blog posts for publication on Medium.com covering the AngularNetTutorial full-stack series (Angular 20, .NET 10, OAuth 2.0).

## Folder Structure

```
blogs/
├── README.md                          ← This file
├── BLOG-SERIES-PLAN.md               ← Master plan with all 19 articles and status
├── BLOG-TEMPLATE.md                  ← Template for new articles
│
├── series-0-architecture/            ← Architecture & Workspace
│   ├── git-submodule-workspace-MEDIUM.md
│   └── playwright-testing-MEDIUM.md
│
├── series-1-authentication/          ← Authentication & Security
│   └── oauth2-pkce-flow-MEDIUM.md
│
├── series-2-dotnet-api/              ← .NET 10 Web API (coming soon)
├── series-3-angular-material/        ← Angular Material UI (coming soon)
├── series-4-playwright-testing/      ← Playwright Deep Dives (coming soon)
└── series-5-devops/                  ← DevOps & Data (coming soon)
```

## File Naming Convention

* **Blog posts:** `{topic}-MEDIUM.md` saved inside the appropriate `series-N-*/` folder
* **Series plan:** `BLOG-SERIES-PLAN.md` — track status with `[ ]` / `[~]` / `[x]`
* **Template:** `BLOG-TEMPLATE.md` — copy this when starting a new article

## Series Overview

**Series 0 — Architecture & Workspace** (`series-0-architecture/`)
* Git Submodule Workspace — manage multiple repos as one workspace
* Playwright Overview — E2E testing introduction

**Series 1 — Authentication & Security** (`series-1-authentication/`)
* OAuth 2.0 PKCE Flow — how login works end to end
* Angular Route Guards — protecting pages with OIDC
* HTTP Interceptor — automatic Bearer token injection
* Role-Based UI — ngx-permissions for Employee/Manager/HRAdmin

**Series 2 — .NET 10 Web API** (`series-2-dotnet-api/`)
* Clean Architecture — layer walkthrough
* JWT Token Validation — how the API trusts IdentityServer
* API Versioning — why `/api/v1/` matters
* Swagger with JWT — test secured endpoints interactively

**Series 3 — Angular Material UI** (`series-3-angular-material/`)
* Data Tables — sort, filter, paginate with MatTable
* Reactive Forms — validation patterns
* Dialogs — confirm/delete with MatDialog

**Series 4 — Playwright Testing** (`series-4-playwright-testing/`)
* First Playwright Test — from zero to green
* Page Object Model — for Angular Material
* Role-Based Testing — fixtures per role
* JWT Token Testing — decode and verify claims
* API Testing — Playwright request fixture

**Series 5 — DevOps & Data** (`series-5-devops/`)
* Database Seeding — EF Core seed data
* CI/CD with GitHub Actions — full-stack pipeline

## Medium.com Compatibility Rules

* ❌ NO tables (Medium.com doesn't support them)
* ✅ Bullet lists with em dashes (—)
* ✅ Emoji section headers (📚 🎯 🚀 🔐)
* ✅ Bold text for scannability
* ✅ Short paragraphs (2-3 sentences max)
* ✅ Hero image placeholder at top
* ✅ Series Navigation section at bottom
* ✅ Tags at the very bottom

## Publishing Workflow

1. Write article in `series-N-*/topic-MEDIUM.md` following `BLOG-TEMPLATE.md`
2. Update `BLOG-SERIES-PLAN.md` status from `[ ]` to `[~]`
3. Copy entire file content to clipboard
4. Paste into Medium editor (medium.com/new-story)
5. Replace placeholder image with actual diagram
6. Preview, adjust formatting, add tags
7. Publish — then update `BLOG-SERIES-PLAN.md` status to `[x]` with the published URL

## Published Articles

* [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56) — Main tutorial

## Main Tutorial Repository

📖 [AngularNetTutorial on GitHub](https://github.com/workcontrolgit/AngularNetTutorial)
