# AI Submenu Refactor Plan

> Separate all AI features from the single "AI Chat" page into dedicated routes under an **AI** parent submenu.
> Update Series 6 blog articles to reflect the new structure. Add Playwright tests for each AI feature.

---

## Motivation

Articles 6.3 and 6.4 introduced AI into the existing `ai-chat` component as tabs. As more AI features land (NL Search in 6.5, Vector Search), cramming everything into one tabbed page becomes cluttered and hard to navigate. A proper **AI submenu** gives each feature its own focused page, matches the pattern used by Employees / Departments / Positions, and makes the blog series cleaner to follow.

---

## Target Menu Structure

```
AI  (sub menu, icon: psychology)
├── AI Assistant    → /ai/assistant     (extracted from ai-chat Tab 1)
├── HR Insight      → /ai/hr-insight    (extracted from ai-chat Tab 2)
├── NL Search       → /ai/nl-search     (new, article 6.5)
└── Vector Search   → /ai/vector-search (new, article 6.5)
```

---

## Gitflow Rules (applies to every phase)

1. Every phase starts from the **latest `develop`** in both the submodule and parent repo.
2. Branch naming: `feature/ai-submenu-phaseN-<slug>`
3. Code is committed in the **submodule first**, then the parent repo updates its submodule pointer.
4. After verification passes, open a PR from the feature branch → `develop` in each affected repo.
5. **Do not start the next phase until all PRs for the current phase are merged.**

---

## Phase 0: Remove Embedded AI from Existing CRUD Components

> **Goal:** Restore `employee-list` and `position-list` to their original Series 0–5 state so those blog articles remain accurate. AI features for these entities move to dedicated `/ai/*` pages instead.

### Gitflow — Start

```bash
# Clients submodule
cd Clients/TalentManagement-Angular-Material
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase0-crud-cleanup

# Parent repo
cd ../..
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase0-crud-cleanup
```

### 0.1 — employee-list.component.ts
**File:** `Clients/.../src/app/routes/employees/employee-list.component.ts`

- [ ] Remove `import { AiService, NlEmployeeFilter } from '../../services/api/ai.service'`
- [ ] Remove `private aiService = inject(AiService)` field
- [ ] Remove `aiEnabled = environment.aiEnabled` field
- [ ] Remove `nlQuery`, `nlLoading`, `nlError`, `nlResults` (and any related NL state fields)
- [ ] Remove the `setupNlSearch()` private method and its `Subject`/pipe chain
- [ ] Remove the `clearNlSearch()` method
- [ ] Remove the `setupNlSearch()` call from `ngOnInit`
- [ ] Remove `environment` import if no longer used elsewhere in this file

### 0.2 — employee-list.component.html
**File:** `Clients/.../src/app/routes/employees/employee-list.component.html`

- [ ] Remove the entire `<mat-card *ngIf="aiEnabled" class="nl-search-card">` block (NL search bar above employee table)
- [ ] Verify the table and surrounding markup is unchanged from the Series 3 state

### 0.3 — position-list.component.ts
**File:** `Clients/.../src/app/routes/positions/position-list.component.ts`

- [ ] Remove `import { AiService, SemanticPositionResult } from '../../services/api'`
- [ ] Remove `private aiService = inject(AiService)` field
- [ ] Remove `aiEnabled = environment.aiEnabled` field
- [ ] Remove `semanticSearch$` Subject and all related state fields (`semanticResults`, `semanticLoading`, etc.)
- [ ] Remove the semantic search pipe setup in `ngOnInit`
- [ ] Remove any semantic search trigger methods
- [ ] Remove `environment` import if no longer used elsewhere in this file

### 0.4 — position-list.component.html
**File:** `Clients/.../src/app/routes/positions/position-list.component.html`

- [ ] Remove the entire `<mat-card class="nl-search-card" *ngIf="aiEnabled">` block (semantic search bar above position table)
- [ ] Verify the table and surrounding markup is unchanged from the Series 3 state

### 0.5 — Confirm Dashboard AI Card is Intentionally Kept
The `dashboard.ts` / `dashboard.html` AI Insights card is from **article 6.4** (an AI article, not a CRUD article) — it stays in place.

- [ ] Confirm `dashboard.ts` and `dashboard.html` are NOT touched in this cleanup phase

### Phase 0 Verification

- [ ] Employee List page has no AI/NL search bar — matches Series 3 article exactly
- [ ] Position List page has no semantic search bar — matches Series 3 article exactly
- [ ] No `AiService` import in `employee-list.component.ts` or `position-list.component.ts`
- [ ] `ng build` compiles with no errors
- [ ] All existing Series 0–5 CRUD features still work (manual smoke test)

### Gitflow — Commit, Push & PR

```bash
# Commit in Clients submodule
cd Clients/TalentManagement-Angular-Material
git add src/app/routes/employees/employee-list.component.ts \
        src/app/routes/employees/employee-list.component.html \
        src/app/routes/positions/position-list.component.ts \
        src/app/routes/positions/position-list.component.html
git commit -m "Remove embedded AI features from employee-list and position-list"
git push --set-upstream origin feature/ai-submenu-phase0-crud-cleanup

# Update submodule pointer + commit in parent repo
cd ../..
git add Clients/TalentManagement-Angular-Material
git commit -m "Phase 0: remove AI from CRUD components — update Clients submodule ref"
git push --set-upstream origin feature/ai-submenu-phase0-crud-cleanup

# Open PRs
gh pr create --base develop --title "Phase 0: Remove embedded AI from CRUD components" \
  --body "Restores employee-list and position-list to Series 0-5 state. AI features will live under the /ai submenu." \
  --repo workcontrolgit/TalentManagement-Angular-Material

gh pr create --base develop --title "Phase 0: Remove embedded AI from CRUD components" \
  --body "Updates Clients submodule pointer after removing embedded AI from employee-list and position-list." \
  --repo workcontrolgit/AngularNetTutorial
```

> ⛔ **Gate: Do not start Phase 1 until both Phase 0 PRs are merged into `develop`.**

---

## Phase 1: Angular UI Refactoring

> **Goal:** Replace the single `ai-chat` route with an `ai` parent submenu and four dedicated child pages.

### Gitflow — Start

```bash
# Clients submodule
cd Clients/TalentManagement-Angular-Material
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase1-ui-refactor

# Parent repo
cd ../..
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase1-ui-refactor
```

### 1.1 — menu.json
**File:** `Clients/.../public/data/menu.json`

- [ ] Remove the top-level `ai-chat` link entry
- [ ] Add an `ai` sub-menu entry (type: `sub`, icon: `psychology`) with four children:
  ```json
  {
    "route": "ai",
    "name": "ai",
    "type": "sub",
    "icon": "psychology",
    "children": [
      { "route": "assistant",     "name": "aiAssistant",    "type": "link" },
      { "route": "hr-insight",    "name": "aiHrInsight",    "type": "link" },
      { "route": "nl-search",     "name": "aiNlSearch",     "type": "link" },
      { "route": "vector-search", "name": "aiVectorSearch", "type": "link" }
    ]
  }
  ```

### 1.2 — i18n Translation Keys
**File:** `Clients/.../public/i18n/en-US.json`

- [ ] Remove `"aiChat": "AI Assistant"` (old top-level key)
- [ ] Add new keys under `menu`:
  ```json
  "ai": "AI",
  "ai.aiAssistant":    "AI Assistant",
  "ai.aiHrInsight":    "HR Insight",
  "ai.aiNlSearch":     "NL Search",
  "ai.aiVectorSearch": "Vector Search"
  ```

### 1.3 — Create New AI Route Components
**Base folder:** `Clients/.../src/app/routes/ai/`

Each component is standalone and follows the same structure as existing route components.

- [ ] Create `ai/ai-assistant/ai-assistant.component.ts` — extract General Chat logic from `ai-chat.component.ts`
- [ ] Create `ai/ai-assistant/ai-assistant.component.html` — extract General Chat template from `ai-chat.component.html`
- [ ] Create `ai/ai-assistant/ai-assistant.component.scss` — extract relevant styles
- [ ] Create `ai/ai-hr-insight/ai-hr-insight.component.ts` — extract HR Insights logic from `ai-chat.component.ts`
- [ ] Create `ai/ai-hr-insight/ai-hr-insight.component.html` — extract HR Insights template
- [ ] Create `ai/ai-hr-insight/ai-hr-insight.component.scss` — extract relevant styles
- [ ] Create `ai/ai-nl-search/ai-nl-search.component.ts` — new NL search UI (calls `AiService.nlEmployeeSearch()`)
- [ ] Create `ai/ai-nl-search/ai-nl-search.component.html` — search bar + results table
- [ ] Create `ai/ai-nl-search/ai-nl-search.component.scss`
- [ ] Create `ai/ai-vector-search/ai-vector-search.component.ts` — new vector search UI (calls `AiService.semanticPositionSearch()`)
- [ ] Create `ai/ai-vector-search/ai-vector-search.component.html` — query input + ranked results list
- [ ] Create `ai/ai-vector-search/ai-vector-search.component.scss`

### 1.4 — Update app.routes.ts
**File:** `Clients/.../src/app/app.routes.ts`

- [ ] Remove `import { AiChatComponent } from './routes/ai-chat/ai-chat.component'`
- [ ] Add imports for the four new AI components
- [ ] Remove `{ path: 'ai-chat', component: AiChatComponent }` route
- [ ] Add the nested `ai` children block:
  ```typescript
  {
    path: 'ai',
    children: [
      { path: 'assistant',     component: AiAssistantComponent },
      { path: 'hr-insight',    component: AiHrInsightComponent },
      { path: 'nl-search',     component: AiNlSearchComponent },
      { path: 'vector-search', component: AiVectorSearchComponent },
      { path: '', redirectTo: 'assistant', pathMatch: 'full' },
    ],
  }
  ```
- [ ] Add backward-compatible redirect: `{ path: 'ai-chat', redirectTo: 'ai/assistant', pathMatch: 'full' }`

### 1.5 — Delete Old AI Chat Component
**Folder:** `Clients/.../src/app/routes/ai-chat/`

- [ ] Delete `ai-chat.component.ts`
- [ ] Delete `ai-chat.component.html`
- [ ] Delete `ai-chat.component.scss`
- [ ] Remove the `ai-chat/` folder

### Phase 1 Verification

- [ ] AI submenu entry appears in sidebar and expands to show 4 children
- [ ] All 4 routes load without console errors: `/ai/assistant`, `/ai/hr-insight`, `/ai/nl-search`, `/ai/vector-search`
- [ ] Active child route is highlighted in sidebar
- [ ] `aiEnabled: false` shows disabled banner on every AI page
- [ ] Old `/ai-chat` URL redirects to `/ai/assistant`
- [ ] `ng build` compiles with no errors

### Gitflow — Commit, Push & PR

```bash
# Commit in Clients submodule
cd Clients/TalentManagement-Angular-Material
git add public/data/menu.json \
        public/i18n/en-US.json \
        src/app/app.routes.ts \
        src/app/routes/ai/
git rm -r src/app/routes/ai-chat/
git commit -m "Add AI submenu with 4 dedicated routes, remove old ai-chat page"
git push --set-upstream origin feature/ai-submenu-phase1-ui-refactor

# Update submodule pointer in parent repo
cd ../..
git add Clients/TalentManagement-Angular-Material
git commit -m "Phase 1: AI submenu refactor — update Clients submodule ref"
git push --set-upstream origin feature/ai-submenu-phase1-ui-refactor

# Open PRs
gh pr create --base develop --title "Phase 1: Add AI submenu with 4 dedicated routes" \
  --body "Replaces the single ai-chat page with an AI parent submenu (AI Assistant, HR Insight, NL Search, Vector Search). Adds backward-compatible redirect from /ai-chat." \
  --repo workcontrolgit/TalentManagement-Angular-Material

gh pr create --base develop --title "Phase 1: AI submenu refactor" \
  --body "Updates Clients submodule pointer after AI submenu refactor." \
  --repo workcontrolgit/AngularNetTutorial
```

> ⛔ **Gate: Do not start Phase 2 until both Phase 1 PRs are merged into `develop`.**

---

## Phase 2: Blog Updates (Series 6)

> **Goal:** Update blog articles so all code samples match the refactored codebase. No submodule code changes in this phase — parent repo only.

### Gitflow — Start

```bash
# Parent repo only (blog files live here, no submodule changes)
cd <root>
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase2-blog-updates
```

### 2.1 — Article 6.3 (Angular AI Chat Widget)
**File:** `blogs/series-6-ai-app-features/6.3-angular-ai-chat-widget.md`

The article currently describes adding a single `ai-chat` route with two tabs. It must be rewritten to describe the **AI submenu pattern**.

- [ ] Update article introduction — explain the submenu approach instead of single page + tabs
- [ ] Update all file paths: `src/app/routes/ai-chat/` → `src/app/routes/ai/ai-assistant/`
- [ ] Update menu.json code sample to show the `ai` sub-menu entry (4 children)
- [ ] Update i18n code sample with new keys (`ai`, `ai.aiAssistant`, etc.)
- [ ] Update `app.routes.ts` code sample to show the nested `ai` children block
- [ ] Remove all `mat-tab-group` code samples — each feature is now a full page
- [ ] Update screenshots section — replace single-page screenshot reference with per-page screenshots
- [ ] Update "What you built" summary to reflect 4 separate pages

### 2.2 — Article 6.4 (AI Dashboard Insights)
**File:** `blogs/series-6-ai-app-features/6.4-angular-ai-dashboard-insights.md`

- [ ] Verify no references to `/ai-chat` route remain
- [ ] Update any link to the AI chat to point to `/ai/hr-insight` instead
- [ ] Add a callout: "The HR Insight feature lives at `/ai/hr-insight` (see article 6.3)"

### 2.3 — Future Article 6.5 (Natural Language Search)
**File:** `blogs/series-6-ai-app-features/6.5-dotnet-natural-language-search.md` *(to be written)*

- [ ] Write Angular section describing `AiNlSearchComponent` at route `/ai/nl-search`
- [ ] Include `app.routes.ts` snippet showing `nl-search` as an existing child route
- [ ] Include menu.json snippet noting `nl-search` is already scaffolded from article 6.3

### 2.4 — Series Navigation / TOC
**Files:** `blogs/SERIES-NAVIGATION-TOC.md`, `blogs/BLOG-SERIES-PLAN.md`, `blogs/AI-ENHANCEMENT-SERIES-PLAN.md`

- [ ] Update Series 6 entry in `SERIES-NAVIGATION-TOC.md` — note submenu refactor lands in 6.3
- [ ] Update `AI-ENHANCEMENT-SERIES-PLAN.md` Phase 2 checklist to reflect 6.3 now covers the submenu scaffold

### Phase 2 Verification

- [ ] Every code sample in 6.3 matches committed code in the `Clients` submodule on `develop`
- [ ] No stale `/ai-chat` URL references remain in any Series 6 article
- [ ] 6.5 article skeleton is in place with correct route and menu references

### Gitflow — Commit, Push & PR

```bash
# Parent repo only
git add blogs/series-6-ai-app-features/ \
        blogs/SERIES-NAVIGATION-TOC.md \
        blogs/BLOG-SERIES-PLAN.md \
        blogs/AI-ENHANCEMENT-SERIES-PLAN.md
git commit -m "Phase 2: Update Series 6 blogs to match AI submenu refactor"
git push --set-upstream origin feature/ai-submenu-phase2-blog-updates

# Open PR (parent repo only — no submodule changes)
gh pr create --base develop --title "Phase 2: Update Series 6 blog articles for AI submenu" \
  --body "Updates 6.3, 6.4, and 6.5 skeleton to match the AI submenu structure. Removes all tab-based code samples and stale /ai-chat references." \
  --repo workcontrolgit/AngularNetTutorial
```

> ⛔ **Gate: Do not start Phase 3 until the Phase 2 PR is merged into `develop`.**

---

## Phase 3: Playwright Tests

> **Goal:** Add AI-specific page objects and test files. Update any existing tests that reference the old `/ai-chat` route.

### Gitflow — Start

```bash
# Tests submodule
cd Tests/AngularNetTutorial-Playwright
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase3-playwright

# Parent repo
cd ../..
git checkout develop && git pull
git checkout -b feature/ai-submenu-phase3-playwright
```

### 3.1 — AI Page Objects
**Base folder:** `Tests/AngularNetTutorial-Playwright/page-objects/`

- [ ] Create `ai-assistant.page.ts`:
  - `messageInput`, `sendButton`, `messageList`, `clearButton` locators
  - `sendMessage(text)`, `getLastReply()`, `waitForReply()` helpers

- [ ] Create `ai-hr-insight.page.ts`:
  - `questionInput`, `askButton`, `hrMessageList`, `suggestionButtons` locators
  - `clickSuggestion(index)`, `askQuestion(text)`, `getLastAnswer()`, `getExecutionTime()` helpers

- [ ] Create `ai-nl-search.page.ts`:
  - `searchInput`, `searchButton`, `resultsTable`, `parsedExpression` locators
  - `search(query)`, `getResultCount()` helpers

- [ ] Create `ai-vector-search.page.ts`:
  - `queryInput`, `searchButton`, `resultCards` locators
  - `search(query)`, `getTopResult()` helpers

### 3.2 — AI Test Files
**Folder:** `Tests/AngularNetTutorial-Playwright/tests/ai/`

- [ ] Create `tests/ai/ai-navigation.spec.ts`:
  - AI submenu is visible in sidebar after login
  - Clicking each child link loads the correct page
  - URL matches expected path for all 4 routes

- [ ] Create `tests/ai/ai-assistant.spec.ts`:
  - Page renders with message input and send button
  - `aiEnabled: false` — disabled banner shown, input hidden
  - Clear button empties the conversation

- [ ] Create `tests/ai/ai-hr-insight.spec.ts`:
  - Page renders with question input
  - Suggestion buttons are visible when conversation is empty
  - Clicking a suggestion populates the input field

- [ ] Create `tests/ai/ai-nl-search.spec.ts`:
  - Page renders with search bar
  - Submitting a query triggers a loading indicator
  - `parsedExpression` field is visible after response

- [ ] Create `tests/ai/ai-vector-search.spec.ts`:
  - Page renders with query input
  - Search returns ranked results with score values

### 3.3 — Update Existing Tests for New Routes

- [ ] Search all test files for `/ai-chat` — update every match to `/ai/assistant`
- [ ] Update `tests/navigation/routing.spec.ts` — replace `ai-chat` route check with `ai/assistant`
- [ ] Update `tests/screenshots/blog-screenshots.spec.ts` — update any AI page screenshot capture

### Phase 3 Verification

- [ ] `npx playwright test tests/ai/` — all new AI tests pass
- [ ] `npx playwright test` — full suite passes with no regressions
- [ ] No test file references the old `/ai-chat` URL

### Gitflow — Commit, Push & PR

```bash
# Commit in Tests submodule
cd Tests/AngularNetTutorial-Playwright
git add page-objects/ai-*.page.ts tests/ai/ tests/navigation/ tests/screenshots/
git commit -m "Add AI submenu page objects and tests, update stale /ai-chat references"
git push --set-upstream origin feature/ai-submenu-phase3-playwright

# Update submodule pointer in parent repo
cd ../..
git add Tests/AngularNetTutorial-Playwright
git commit -m "Phase 3: Playwright AI tests — update Tests submodule ref"
git push --set-upstream origin feature/ai-submenu-phase3-playwright

# Open PRs
gh pr create --base develop --title "Phase 3: Add Playwright tests for AI submenu" \
  --body "Adds page objects and test specs for all 4 AI routes. Updates existing tests that referenced /ai-chat." \
  --repo workcontrolgit/AngularNetTutorial-Playwright

gh pr create --base develop --title "Phase 3: Playwright AI tests" \
  --body "Updates Tests submodule pointer after adding AI submenu Playwright tests." \
  --repo workcontrolgit/AngularNetTutorial
```

> ✅ **All phases complete once the Phase 3 PRs are merged into `develop`.**

---

## Phase Summary

| Phase | Branch | Repos Affected | Gate |
|-------|--------|----------------|------|
| 0 — CRUD cleanup | `feature/ai-submenu-phase0-crud-cleanup` | Clients + Parent | PR merged → start Phase 1 |
| 1 — UI refactor | `feature/ai-submenu-phase1-ui-refactor` | Clients + Parent | PR merged → start Phase 2 |
| 2 — Blog updates | `feature/ai-submenu-phase2-blog-updates` | Parent only | PR merged → start Phase 3 |
| 3 — Playwright tests | `feature/ai-submenu-phase3-playwright` | Tests + Parent | PR merged → done |

Each phase branches off the **latest `develop`** after the previous phase's PR is merged.
