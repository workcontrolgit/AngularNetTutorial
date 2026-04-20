# AI Enhancement Tutorial — Series 6 & 7

> Update the checklist below as each article is completed.

## Context

The existing AngularNetTutorial (Series 0–5, 22 articles) covers the full CAT stack (Angular 20 + .NET 10 + Duende IdentityServer) but has zero AI content. Developers need practical, working examples of how to add AI to a real production-style app — not toy demos.

**Decisions:**
* **AI Provider:** Ollama (free, local, no API key required) via Microsoft.Extensions.AI abstraction
* **Series 6** — AI App Features (AI capabilities for end users of the TalentManagement app)
* **Series 7** — Developer Productivity AI (AI tools for building faster)

**Why Ollama + Microsoft.Extensions.AI:**
* Zero cost, no sign-up — tutorial readers can follow without a credit card
* Microsoft.Extensions.AI is provider-agnostic: swap Ollama → Azure OpenAI → Anthropic by changing 1 line in DI registration
* Aligned with .NET 10 ecosystem (official Microsoft abstraction)

---

## Coexistence Strategy: Feature Flags + Graceful Degradation

The original tutorial (Series 0–5) and AI tutorial (Series 6–7) share **one codebase**. AI features default to **off** so developers without Ollama are unaffected.

**`Microsoft.FeatureManagement` is already installed — no new dependencies needed.**

**Backend (.NET) — appsettings.json default (AI off):**
```json
"FeatureManagement": {
  "AiEnabled": false
}
```

**Frontend (Angular) — environment.ts default (AI hidden):**
```typescript
export const environment = {
  aiEnabled: false,
  ...
};
```

**Two audiences, one repo:**
* **Original tutorial readers (no Ollama)** — `aiEnabled: false` everywhere, zero broken UI or failed API calls
* **AI enhancement readers (have Ollama)** — follow Series 6 article 6.1: set `"AiEnabled": true`, AI features activate

All Series 6 code merges into `develop` via feature branches. `AiEnabled` defaults to `false` so `develop` is safe for both audiences — no divergent AI branch needed.

---

## Series 6: AI App Features

**Folder:** `blogs/series-6-ai-app-features/`
**Theme:** Add AI capabilities that HR managers and employees actually use

* **6.1** — `6.1-dotnet-ai-foundation.md` — Run a Local LLM in Your .NET 10 API with Ollama
  * Code: `IChatClient` DI setup, `POST /api/v1/ai/chat` endpoint, feature flag setup
* **6.2** — `6.2-dotnet-ai-hr-assistant.md` — Build an HR AI Assistant That Knows Your Data
  * Code: `GetHrInsightQuery` (MediatR), inject DashboardMetrics context into prompt
* **6.3** — `6.3-angular-ai-chat-widget.md` — Add an AI Chat Widget to Angular with Streaming
  * Code: `AiChatComponent`, SSE streaming with RxJS
* **6.4** — `6.4-angular-ai-dashboard-insights.md` — AI-Generated Dashboard Insights in Angular Material
  * Code: AI Insights `mat-card` on dashboard, prompt engineering patterns
* **6.5** — `6.5-dotnet-natural-language-search.md` — Natural Language Employee Search with LLM Query Parsing
  * Code: `NlSearchQuery` handler (.NET) + NL search bar (Angular)
* **6.6** — `6.6-dotnet-ai-response-caching.md` — Cache Your AI Responses: Save Time and API Costs
  * Code: EasyCaching cache-aside in `OllamaAiService`, `X-AI-Cache` response header
* **6.7** — `6.7-dotnet-mssql-vector-search.md` — Semantic Employee Search with MSSQL 2025 Native Vector Search
  * Code: `vector(768)` column on Employee entity, `IEmbeddingService`/`OllamaEmbeddingService`, `SemanticSearchQuery` MediatR handler using `VECTOR_DISTANCE`, `POST /api/v1/employees/semantic-search` endpoint, Angular semantic search tab on employee list

---

## Series 7: Developer Productivity AI

**Folder:** `blogs/series-7-developer-productivity-ai/`
**Theme:** AI tools that make the developer faster — applied to this exact codebase

* **7.1** — `7.1-claude-code-workflow.md` — How We Built 22 Articles with Claude Code
  * Content: CLAUDE.md patterns, prompting guide, session workflow tips
* **7.2** — `7.2-copilot-clean-architecture.md` — GitHub Copilot for .NET Clean Architecture
  * Content: Copilot prompt patterns for CQRS handlers, FluentValidation, Mapster
* **7.3** — `7.3-ai-generated-playwright-tests.md` — Generate Playwright Tests from User Stories with AI
  * Content: Prompt-to-test workflow, AI-generated `.spec.ts` files, human review checklist
* **7.4** — `7.4-ai-code-review-github-actions.md` — AI Code Review in GitHub Actions
  * Content + Code: GitHub Action YAML using Anthropic API for PR review

---

## Gitflow Branch Strategy

**Branch naming:** `feature/[article-number]-[short-slug]`
**Base branch:** always off `develop`, merge back via PR

### Feature Branch Map

* **6.1** — Parent: `feature/6.1-dotnet-ai-foundation` | ApiResources: `feature/6.1-dotnet-ai-foundation`
* **6.2** — Parent: `feature/6.2-dotnet-ai-hr-assistant` | ApiResources: `feature/6.2-dotnet-ai-hr-assistant`
* **6.3** — Parent: `feature/6.3-angular-ai-chat-widget` | Clients: `feature/6.3-angular-ai-chat-widget`
* **6.4** — Parent: `feature/6.4-angular-ai-dashboard-insights` | Clients: `feature/6.4-angular-ai-dashboard-insights`
* **6.5** — Parent: `feature/6.5-natural-language-search` | ApiResources + Clients: `feature/6.5-natural-language-search`
* **6.6** — Parent: `feature/6.6-ai-response-caching` | ApiResources: `feature/6.6-ai-response-caching`
* **6.7** — Parent: `feature/6.7-mssql-vector-search` | ApiResources + Clients: `feature/6.7-mssql-vector-search`
* **7.1–7.4** — Parent only (blog articles, no submodule code changes)

### Gitflow Steps Per Article (with submodule code)

```bash
# 1. Submodule feature branch (off develop)
cd ApiResources/TalentManagement-API   # or Clients/...
git checkout develop && git pull
git checkout -b feature/[N.N]-[slug]

# 2. Parent repo feature branch (off develop)
cd ../..
git checkout develop && git pull
git checkout -b feature/[N.N]-[slug]

# 3. Code in submodule → commit → push
git add . && git commit -m "Add [feature]"
git push --set-upstream origin feature/[N.N]-[slug]

# 4. Blog article + submodule ref in parent → commit → push
git add blogs/series-6-ai-app-features/[N.N]-*.md
git add ApiResources/TalentManagement-API
git commit -m "Add article [N.N] and [feature] implementation"
git push --set-upstream origin feature/[N.N]-[slug]

# 5. Open PRs: submodule feature → develop, then parent feature → develop
```

---

## Implementation Checklist

### Phase 0: Setup

- [x] Ollama running at `http://localhost:11434` ✅
- [x] `blogs/AI-ENHANCEMENT-SERIES-PLAN.md` created ✅
- [x] Create `blogs/series-6-ai-app-features/` folder ✅
- [x] Create `blogs/series-7-developer-productivity-ai/` folder ✅
- [x] Create `docs/images/ai/` folder for screenshots ✅
- [x] Update `blogs/BLOG-SERIES-PLAN.md` with Series 6 & 7 entries ✅
- [x] Update `blogs/SERIES-NAVIGATION-TOC.md` to include new series ✅

### Phase 1: Series 6 — Backend Foundation

- [x] **6.1 — .NET AI Foundation** ✅
  - [x] `git checkout -b feature/6.1-dotnet-ai-foundation` in ApiResources submodule ✅
  - [x] `git checkout -b feature/6.1-dotnet-ai-foundation` in parent repo ✅
  - [x] Write article draft (`6.1-dotnet-ai-foundation.md`) ✅
  - [x] Add to WebApi.csproj: `Microsoft.Extensions.AI.Ollama` ✅
  - [x] Add to Infrastructure.Shared.csproj: `Microsoft.Extensions.AI` ✅
  - [x] Add `"AiEnabled": false` to `FeatureManagement` in `appsettings.json` ✅
  - [x] Add `"Ollama"` config block to `appsettings.json` ✅
  - [x] Create `Application/Interfaces/IAiChatService.cs` ✅
  - [x] Create `Infrastructure.Shared/Services/OllamaAiService.cs` ✅
  - [x] Create `WebApi/Controllers/v1/AiController.cs` with `[FeatureGate("AiEnabled")]` ✅
  - [x] Register `AddOllamaChatClient()` in `Program.cs` ✅
  - [x] Register `IAiChatService` → `OllamaAiService` in `ServiceRegistration.cs` ✅
  - [ ] Screenshot: Swagger AI endpoint → `docs/images/ai/` *(manual step)*
  - [x] Commit + push ApiResources `feature/6.1-dotnet-ai-foundation` ✅
  - [x] Commit + push parent `feature/6.1-dotnet-ai-foundation` ✅
  - [ ] Open PR: ApiResources `feature/6.1-dotnet-ai-foundation` → `develop` — https://github.com/workcontrolgit/TalentManagement-API/pull/new/feature/6.1-dotnet-ai-foundation
  - [ ] Open PR: Parent `feature/6.1-dotnet-ai-foundation` → `develop` — https://github.com/workcontrolgit/AngularNetTutorial/pull/new/feature/6.1-dotnet-ai-foundation

- [x] **6.2 — HR AI Assistant (data-aware)** ✅
  - [x] `git checkout -b feature/6.2-dotnet-ai-hr-assistant` in ApiResources submodule ✅
  - [x] `git checkout -b feature/6.2-dotnet-ai-hr-assistant` in parent repo ✅
  - [x] Write article draft (`6.2-dotnet-ai-hr-assistant.md`) ✅
  - [x] Create `Application/Features/AI/Queries/GetHrInsight/GetHrInsightQuery.cs` (MediatR) ✅
  - [x] Create `Application/Features/AI/Queries/GetHrInsight/HrInsightDto.cs` ✅
  - [x] Add `POST /api/v1/ai/hr-insight` endpoint to `AiController` ✅
  - [x] Inject DashboardMetrics context into prompt ✅
  - [ ] Screenshot: AI answer about employee data → `docs/images/ai/` *(manual step)*
  - [x] Commit + push submodule feature branch ✅
  - [x] Commit + push parent feature branch ✅
  - [x] Open PR: ApiResources `feature/6.2-dotnet-ai-hr-assistant` → `develop` — https://github.com/workcontrolgit/TalentManagement-API/pull/3 ✅
  - [x] Open PR: Parent `feature/6.2-dotnet-ai-hr-assistant` → `develop` — https://github.com/workcontrolgit/AngularNetTutorial/pull/17 ✅

### Phase 2: Series 6 — Angular Frontend

- [x] **6.3 — Angular AI Chat Widget** ✅
  - [x] `git checkout -b feature/6.3-angular-ai-chat-widget` in Clients submodule ✅
  - [x] `git checkout -b feature/6.3-angular-ai-chat-widget` in parent repo ✅
  - [x] Write article draft (`6.3-angular-ai-chat-widget.md`) ✅
  - [x] Create `src/app/services/api/ai.service.ts` ✅
  - [x] Create `src/app/routes/ai-chat/` (component + template + SCSS) ✅
  - [x] Add `aiEnabled: false` to environment files ✅
  - [x] Add to sidebar navigation (`menu.json` + `en-US.json` translation key) ✅
  - [x] Register route in `app.routes.ts` ✅
  - [ ] Screenshot: Chat widget in Angular UI → `docs/images/ai/` *(manual step)*
  - [x] Commit + push Clients feature branch ✅
  - [x] Commit + push parent feature branch ✅
  - [x] Open PR: Clients `feature/6.3-angular-ai-chat-widget` → `develop` — https://github.com/workcontrolgit/TalentManagement-Angular-Material/pull/3 ✅
  - [x] Open PR: Parent `feature/6.3-angular-ai-chat-widget` → `develop` — https://github.com/workcontrolgit/AngularNetTutorial/pull/18 ✅

- [x] **6.4 — AI Dashboard Insights** ✅
  - [x] `git checkout -b feature/6.4-angular-ai-dashboard-insights` in Clients submodule ✅
  - [x] `git checkout -b feature/6.4-angular-ai-dashboard-insights` in parent repo ✅
  - [x] Write article draft (`6.4-angular-ai-dashboard-insights.md`) ✅
  - [x] Modify `dashboard.ts` — add AI insights call after metrics load ✅
  - [x] Add "AI Insights" `mat-card` to `dashboard.html` (guarded by `aiEnabled`) ✅
  - [ ] Screenshot: Dashboard with AI insights card → `docs/images/ai/` *(manual step)*
  - [x] Commit + push Clients feature branch ✅
  - [x] Commit + push parent feature branch ✅
  - [x] Open PR: Clients `feature/6.4-angular-ai-dashboard-insights` → `develop` — https://github.com/workcontrolgit/TalentManagement-Angular-Material/pull/4 ✅
  - [x] Open PR: Parent `feature/6.4-angular-ai-dashboard-insights` → `develop` — https://github.com/workcontrolgit/AngularNetTutorial/pull/19 ✅

### Phase 3: Series 6 — Advanced

- [ ] **6.5 — Natural Language Search**
  - [ ] `git checkout -b feature/6.5-natural-language-search` in ApiResources + Clients + parent
  - [x] Write article draft (`6.5-dotnet-natural-language-search.md`) ✅
  - [ ] .NET: Create `NlSearchQuery` MediatR handler (LLM → structured filter)
  - [ ] Angular: Add NL search bar above employee table
  - [ ] Screenshot: NL query → filtered employee list → `docs/images/ai/`
  - [ ] Commit + push all feature branches
  - [ ] Open PRs: ApiResources + Clients + Parent → `develop`

- [ ] **6.6 — AI Response Caching**
  - [ ] `git checkout -b feature/6.6-ai-response-caching` in ApiResources submodule + parent
  - [ ] Write article draft (`6.6-dotnet-ai-response-caching.md`)
  - [ ] .NET: Add EasyCaching cache-aside to `OllamaAiService`
  - [ ] Add `X-AI-Cache: HIT/MISS` response header
  - [ ] Screenshot: Swagger response headers showing cache → `docs/images/ai/`
  - [ ] Commit + push feature branches
  - [ ] Open PRs: ApiResources + Parent → `develop`

- [ ] **6.7 — Semantic Search with MSSQL 2025 Vector Search**
  - [ ] `git checkout -b feature/6.7-mssql-vector-search` in ApiResources + Clients + parent
  - [ ] Write article draft (`6.7-dotnet-mssql-vector-search.md`)
  - [ ] .NET: Add `SearchEmbedding vector(768)` column to Employee entity + EF migration
  - [ ] .NET: Create `Application/Interfaces/IEmbeddingService.cs`
  - [ ] .NET: Create `Infrastructure.Shared/Services/OllamaEmbeddingService.cs` (calls `nomic-embed-text` via Ollama `/api/embeddings`)
  - [ ] .NET: Create `Application/Features/Employees/Queries/SemanticSearch/SemanticSearchQuery.cs` (MediatR)
  - [ ] .NET: Create `SemanticSearchQueryHandler.cs` — embed query → `VECTOR_DISTANCE` raw SQL → ranked results
  - [ ] .NET: Add `POST /api/v1/employees/semantic-search` endpoint to `EmployeesController`
  - [ ] .NET: Seed/backfill embeddings for existing employee seed data
  - [ ] Angular: Add `semanticSearch()` method to `ai.service.ts`
  - [ ] Angular: Add semantic search tab/toggle on employee list (alongside existing NL search bar)
  - [ ] Add `VectorSearchEnabled` feature flag to `appsettings.json` and `environment.ts`
  - [ ] Screenshot: Semantic search results vs keyword results → `docs/images/ai/`
  - [ ] Commit + push all feature branches
  - [ ] Open PRs: ApiResources + Clients + Parent → `develop`

### Phase 4: Series 7 — Developer Productivity (parent repo only)

- [ ] **7.1 — Claude Code Workflow**
  - [ ] `git checkout -b feature/7.1-claude-code-workflow` in parent repo
  - [ ] Write article: CLAUDE.md patterns, prompting, session workflow
  - [ ] Commit + push → Open PR → `develop`

- [ ] **7.2 — Copilot for Clean Architecture**
  - [ ] `git checkout -b feature/7.2-copilot-clean-architecture` in parent repo
  - [ ] Write article: Copilot prompt patterns for CQRS, FluentValidation
  - [ ] Commit + push → Open PR → `develop`

- [ ] **7.3 — AI-Generated Playwright Tests**
  - [ ] `git checkout -b feature/7.3-ai-generated-playwright-tests` in parent repo
  - [ ] Write article: prompt-to-test workflow, human review checklist
  - [ ] Commit + push → Open PR → `develop`

- [ ] **7.4 — AI Code Review in GitHub Actions**
  - [ ] `git checkout -b feature/7.4-ai-code-review-ci` in parent repo
  - [ ] Write article + GitHub Action YAML using Anthropic API
  - [ ] Commit + push → Open PR → `develop`

---

## Writing Order

1. 6.1 — backend AI foundation (everything else depends on this)
2. 6.2 — HR assistant (builds on 6.1)
3. 6.3 — Angular chat widget (needs 6.1 endpoint)
4. 6.4 — dashboard insights (builds on 6.2 + existing dashboard)
5. 6.5 — NL search (builds on 6.1 + existing employee list)
6. 6.6 — AI caching (builds on 6.1 + EasyCaching from article 2.5)
7. 6.7 — MSSQL 2025 vector search (builds on 6.5 — contrasts LLM translator with semantic similarity; requires SQL Server 2025 CTP or later)
8. 7.1–7.4 — independent, any order

---

## Ollama Setup Reference

```bash
ollama pull llama3.2      # 2GB, fast for tutorials
ollama serve              # http://localhost:11434
```

> **✅ Confirmed:** Ollama is running at `http://localhost:11434` in the dev environment.

---

## Verification (each Series 6 article)

1. Start all 3 services + `ollama serve`
2. Set `"AiEnabled": true` in `appsettings.json` and `aiEnabled: true` in `environment.ts`
3. Navigate to the feature in Angular (`http://localhost:4200`)
4. Confirm AI responds correctly
5. Verify Swagger endpoint behavior
6. Reset `AiEnabled` to `false` — confirm original tutorial still works perfectly
7. Run Playwright tests — ensure no regressions
