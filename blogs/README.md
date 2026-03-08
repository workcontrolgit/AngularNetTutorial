# Blogs

This folder contains blog posts for publication on Medium.com covering the AngularNetTutorial full-stack series (Angular 20, .NET 10, OAuth 2.0).

## Navigation

📖 **[Series Navigation TOC](SERIES-NAVIGATION-TOC.md)** — Quick links to all articles

📋 **[Blog Series Plan](BLOG-SERIES-PLAN.md)** — Full plan with status, subtitles, and file paths

## Folder Structure

```
blogs/
├── README.md                        ← This file
├── SERIES-NAVIGATION-TOC.md        ← Article navigation — link all readers back here
├── BLOG-SERIES-PLAN.md             ← Master plan with status tracking
├── BLOG-TEMPLATE.md                ← Template for new articles
│
├── series-0-architecture/
│   ├── 0.1-git-submodule-workspace.md
│   └── 0.2-playwright-testing.md
│
├── series-1-authentication/
│   ├── 1.1-oauth2-pkce-flow.md
│   ├── 1.2-angular-route-guards.md
│   ├── 1.3-angular-http-interceptor.md
│   └── 1.4-angular-role-based-ui.md
│
├── series-2-dotnet-api/
│   ├── 2.1-dotnet-clean-architecture.md
│   ├── 2.2-dotnet-jwt-validation.md
│   ├── 2.3-dotnet-api-versioning.md
│   └── 2.4-dotnet-swagger-jwt.md
│
├── series-3-angular-material/
│   ├── 3.1-angular-material-datatable.md
│   ├── 3.2-angular-reactive-forms.md
│   ├── 3.3-angular-material-dialogs.md
│   └── 3.4-ng-matero-admin-shell.md
│
├── series-4-playwright-testing/     ← Coming soon
└── series-5-devops/                 ← Coming soon
```

## File Naming Convention

* **Blog posts:** `[N.N]-[topic].md` inside the appropriate `series-N-*/` folder
* **Series plan:** `BLOG-SERIES-PLAN.md` — track status with `[ ]` / `[~]` / `[x]`
* **Template:** `BLOG-TEMPLATE.md` — copy this when starting a new article

## Medium.com Compatibility Rules

* ❌ NO tables (Medium.com doesn't support them)
* ✅ Bullet lists with em dashes (—)
* ✅ Emoji section headers (📚 🎯 🚀 🔐)
* ✅ Bold text for scannability
* ✅ Short paragraphs (2-3 sentences max)
* ✅ Hero image placeholder at top
* ✅ Single TOC back-reference at bottom (replaces per-article navigation lists)
* ✅ Tags at the very bottom

## Publishing Workflow

1. Write article in `series-N-*/N.N-[topic].md` following `BLOG-TEMPLATE.md`
2. Update `BLOG-SERIES-PLAN.md` status from `[ ]` to `[~]`
3. Update `SERIES-NAVIGATION-TOC.md` with the published Medium URL when live
4. Copy entire file content to clipboard
5. Paste into Medium editor (medium.com/new-story)
6. Replace placeholder image with actual diagram
7. Preview, adjust formatting, add tags
8. Publish — then update `BLOG-SERIES-PLAN.md` status to `[x]` with the published URL

## Published Articles

* [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56) — Main tutorial

## Main Tutorial Repository

📖 [AngularNetTutorial on GitHub](https://github.com/workcontrolgit/AngularNetTutorial)
