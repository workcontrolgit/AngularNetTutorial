# Lock Down Your Angular Routes: Auth Guards with OIDC in 5 Minutes

## How to Protect Pages, Redirect Unauthenticated Users, and Verify It Works with Playwright

You've added OAuth 2.0 login to your Angular app. But login alone doesn't protect your pages. An unauthenticated user can still type `/employees/create` in the address bar and land on your form. A logged-in Employee can still navigate directly to `/positions/create` — a page reserved for HRAdmin only.

Route guards fix this. In two small files, you can protect every authenticated route, enforce role-based access, and redirect unauthorised users automatically — with zero boilerplate in your components.

![Anonymous user view — the dashboard before login](https://raw.githubusercontent.com/workcontrolgit/AngularNetTutorial/master/docs/images/angular/application-dashboard-anonymous.png)

📖 **Tutorial Repository:** [AngularNetTutorial on GitHub](https://github.com/workcontrolgit/AngularNetTutorial)

---

This article is part of the **AngularNetTutorial** series. The full-stack tutorial — covering Angular 20, .NET 10 Web API, and OAuth 2.0 with Duende IdentityServer — has been published at [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56). **This article covers the Angular route guard layer — what runs before a page loads to decide whether the user is allowed in.**

---

## 🎓 What You'll Learn

* **How `authGuard` works** — The function that checks OIDC authentication before every protected route
* **How role guards work** — `managerGuard` and `hrAdminGuard` enforce permissions beyond authentication
* **How guards are applied in routes** — A single `canActivate` or `canActivateChild` on the parent protects all children
* **The anonymous access escape hatch** — How `environment.allowAnonymousAccess` lets you develop without logging in
* **How to verify it with Playwright** — Tests that prove guards redirect and block as expected

---

## 📋 Prerequisites

**Before following this article, you should have:**

* **AngularNetTutorial running locally** — All three services started (IdentityServer, API, Angular)
* **Read the PKCE article** — [Why Your Angular App Needs PKCE](#) — this article builds on the auth service explained there
* **Basic Angular routing knowledge** — You know what `Routes` and `canActivate` are

**Not set up yet?** Follow the [AngularNetTutorial setup guide](https://github.com/workcontrolgit/AngularNetTutorial) first.

---

## 🎯 The Problem: Login Alone Doesn't Protect Routes

After implementing OIDC login, many developers assume their pages are protected. They're not.

**Without guards, any user can:**

* **Type a URL directly** — Navigating to `http://localhost:4200/employees/create` loads the form regardless of login state
* **Bookmark a deep link** — A bookmarked URL bypasses the login flow entirely
* **Escalate privileges** — An Employee role user can access Manager-only or HRAdmin-only forms

Angular's router runs before any component renders. This is exactly where guards belong — they intercept navigation, check conditions, and either allow or redirect.

---

## 🗺️ Guard Decision Flow

Here's how the two-layer guard system works in this app:

```
User navigates to /employees/create
              │
              ▼
  ┌─────────────────────┐
  │  canActivateChild:  │  ← on AdminLayout parent route
  │     [authGuard]     │
  └─────────────────────┘
              │
    isAuthenticated()?
       /           \
     YES            NO
      │              │
      ▼              ▼
  ┌──────────┐   oidcAuth.login(targetUrl)
  │ canActivate│  → redirect to IdentityServer
  │[managerGuard]│  (returns to this URL after login)
  └──────────┘
              │
  isManager() || isHRAdmin()?
       /           \
     YES            NO
      │              │
      ▼              ▼
   Route           router.navigate(['/403'])
   renders         → Error 403 Forbidden page
```

**Two separate concerns, two separate files:**

* **`auth-guard.ts`** — Are you logged in? If not, go to IdentityServer
* **`role.guard.ts`** — Are you authorised for this specific action? If not, go to `/403`

---

## 🚀 How It Works: The Code

### The Authentication Guard

The `authGuard` function is the gatekeeper for all authenticated routes:

```typescript
// src/app/core/authentication/auth-guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OidcAuthService } from './oidc-auth.service';
import { environment } from '../../../environments/environment';

export const authGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const oidcAuth = inject(OidcAuthService);

  // Allow anonymous access if configured in environment
  if (environment.allowAnonymousAccess) {
    return true;
  }

  // Check if user is authenticated via OIDC
  if (oidcAuth.isAuthenticated()) {
    return true;
  }

  // Redirect to IdentityServer — pass target URL so user returns here after login
  oidcAuth.login(state?.url);
  return false;
};
```

**Three things to notice:**

* **`environment.allowAnonymousAccess`** — A development flag. Set it to `true` in `environment.ts` and you skip all authentication during local development. Never `true` in production
* **`oidcAuth.isAuthenticated()`** — Calls `oauthService.hasValidAccessToken()` under the hood. If the access token has expired, this returns `false` and the user is sent back to IdentityServer to re-authenticate
* **`oidcAuth.login(state?.url)`** — Passes the current URL as the target. After IdentityServer login completes, the user lands back on the page they tried to visit — not the home page

### The Role Guards

Role guards add a second layer on top of authentication:

```typescript
// src/app/core/authentication/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { OidcAuthService } from './oidc-auth.service';

// Manager operations: employees and departments create/edit
export const managerGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(OidcAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.login();
    return false;
  }

  if (authService.isManager() || authService.isHRAdmin()) {
    return true;
  }

  // User is authenticated but lacks the required role
  router.navigate(['/403']);
  return false;
};

// HRAdmin operations: positions and salary ranges create/edit
export const hrAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(OidcAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.login();
    return false;
  }

  if (authService.isHRAdmin()) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
```

**Key difference from `authGuard`:** Role guards redirect to `/403` (Forbidden) — not to IdentityServer. The user *is* authenticated, they just don't have the right role. Sending them to re-login would be confusing and wrong.

There is also a generic `roleGuard` for declarative configuration:

```typescript
// Usage: configure required roles via route data
{
  path: 'admin',
  canActivate: [roleGuard],
  data: { roles: ['HRAdmin'] }
}
```

### Applying Guards in the Routes

The real power comes from how guards are applied in `app.routes.ts`:

```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],   // ← protects ALL child routes
    children: [
      { path: 'dashboard', component: Dashboard },

      // All authenticated users can view lists
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeDetailComponent },

      // Manager or HRAdmin only — create/edit
      { path: 'employees/create', component: EmployeeFormComponent, canActivate: [managerGuard] },
      { path: 'employees/edit/:id', component: EmployeeFormComponent, canActivate: [managerGuard] },

      // HRAdmin only — positions create/edit
      { path: 'positions/create', component: PositionFormComponent, canActivate: [hrAdminGuard] },
      { path: 'positions/edit/:id', component: PositionFormComponent, canActivate: [hrAdminGuard] },

      // HRAdmin only — salary ranges create/edit
      { path: 'salary-ranges/create', component: SalaryRangeFormComponent, canActivate: [hrAdminGuard] },
      { path: 'salary-ranges/edit/:id', component: SalaryRangeFormComponent, canActivate: [hrAdminGuard] },

      // Error pages
      { path: '403', component: Error403 },
    ],
  },
  // Public routes — no guards
  { path: 'callback', component: CallbackComponent },
  { path: 'auth/register', component: Register },
];
```

**The `canActivateChild` pattern is the key architectural decision:**

* Placing `canActivate: [authGuard]` and `canActivateChild: [authGuard]` on the `AdminLayout` parent means every child route is automatically protected
* You never forget to add `authGuard` to a new route — if it's a child of `AdminLayout`, it's already covered
* Role guards are only added to the specific routes that need them — list views are accessible to all authenticated users; create/edit forms are not

### Route Protection Summary

**Protected by `authGuard` only (all authenticated users):**

* `/dashboard` — Dashboard
* `/employees` — Employee list
* `/employees/:id` — Employee detail
* `/departments` — Department list
* `/departments/:id` — Department detail
* `/positions` — Position list
* `/salary-ranges` — Salary range list
* `/profile/overview` — User profile

**Protected by `managerGuard` (Manager + HRAdmin):**

* `/employees/create` — Create employee
* `/employees/edit/:id` — Edit employee
* `/departments/create` — Create department
* `/departments/edit/:id` — Edit department

**Protected by `hrAdminGuard` (HRAdmin only):**

* `/positions/create` — Create position
* `/positions/edit/:id` — Edit position
* `/salary-ranges/create` — Create salary range
* `/salary-ranges/edit/:id` — Edit salary range

**No guard (public):**

* `/callback` — OIDC callback (must be public — IdentityServer redirects here)
* `/auth/register` — Registration page

---

## 🧪 Verify It Works: Playwright Tests

Here are Playwright tests that verify the guard behaviour for each role:

```typescript
// Tests/AngularNetTutorial-Playwright/tests/auth/role-based-access.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsRole } from '../../fixtures/auth.fixtures';

test.describe('Route Guard — Authentication', () => {

  test('should redirect unauthenticated user to IdentityServer', async ({ page }) => {
    // Try to access a protected route without logging in
    await page.goto('/employees');

    // Guard fires → redirected to IdentityServer
    await page.waitForURL(/localhost:44310/);
    await expect(page).toHaveURL(/connect\/authorize/);
  });

  test('should redirect back to target URL after login', async ({ page }) => {
    // Try to access a specific protected page
    await page.goto('/employees');
    await page.waitForURL(/localhost:44310/);

    // Complete login at IdentityServer
    await page.fill('input[name="Input.Username"]', 'rosamond33');
    await page.fill('input[name="Input.Password"]', 'Pa$$word123');
    await page.click('button[type="submit"]');

    // Should land back on /employees, not /dashboard
    await page.waitForURL(/localhost:4200/);
    expect(page.url()).toContain('/employees');
  });

});

test.describe('Route Guard — Employee Role (read-only)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'employee');
  });

  test('should allow Employee to view employee list', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const employeeTable = page.locator('table, mat-table');
    await expect(employeeTable.first()).toBeVisible({ timeout: 5000 });
  });

  test('should block Employee from accessing create form directly', async ({ page }) => {
    // Try to bypass UI and navigate directly to the create route
    await page.goto('/employees/create');
    await page.waitForLoadState('networkidle');

    // managerGuard fires → redirected to /403
    const isOnCreatePage = page.url().includes('employees/create');
    expect(isOnCreatePage).toBe(false);
  });

});

test.describe('Route Guard — Manager Role', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'manager');
  });

  test('should allow Manager to access employee create form', async ({ page }) => {
    await page.goto('/employees/create');
    await page.waitForLoadState('networkidle');

    // managerGuard passes → form renders
    expect(page.url()).toContain('employees/create');
  });

  test('should block Manager from accessing hrAdmin-only route', async ({ page }) => {
    await page.goto('/positions/create');
    await page.waitForLoadState('networkidle');

    // hrAdminGuard fires → redirected to /403
    const isOnCreatePage = page.url().includes('positions/create');
    expect(isOnCreatePage).toBe(false);
  });

});

test.describe('Route Guard — HRAdmin Role (full access)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'hrAdmin');
  });

  test('should allow HRAdmin to access positions create form', async ({ page }) => {
    await page.goto('/positions/create');
    await page.waitForLoadState('networkidle');

    // hrAdminGuard passes → form renders
    expect(page.url()).toContain('positions/create');
  });

  test('should allow HRAdmin to access salary range create form', async ({ page }) => {
    await page.goto('/salary-ranges/create');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('salary-ranges/create');
  });

});
```

**Run the tests:**

```bash
cd Tests/AngularNetTutorial-Playwright
npx playwright test tests/auth/role-based-access.spec.ts --ui
```

---

## 💻 Try It Yourself

**Start All Services:**

```bash
# Terminal 1: IdentityServer (start first)
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet run

# Terminal 2: API
cd ApiResources/TalentManagement-API/TalentManagementAPI.WebApi
dotnet run

# Terminal 3: Angular Client
cd Clients/TalentManagement-Angular-Material/talent-management
npm start
```

**Application URLs:**

* **Angular Client:** http://localhost:4200 — Main application UI
* **Web API:** https://localhost:44378 — RESTful API endpoints
* **Swagger UI:** https://localhost:44378/swagger — Interactive API docs
* **IdentityServer:** https://localhost:44310 — Authentication server

**Test Credentials:**

* **Manager:** `rosamond33` / `Pa$$word123`
* **HRAdmin:** `ashtyn1` / `Pa$$word123`
* **Employee:** `antoinette16` / `Pa$$word123`

**What to observe:**

1. Open a private/incognito window and navigate to `http://localhost:4200/employees` — you are immediately redirected to IdentityServer
2. Log in as `antoinette16` (Employee) — you see the employee list but no Create or Edit buttons
3. Try typing `http://localhost:4200/employees/create` in the address bar while logged in as Employee — you land on the 403 page
4. Log in as `rosamond33` (Manager) — Create and Edit buttons appear; but `/positions/create` still shows 403
5. Log in as `ashtyn1` (HRAdmin) — full access to everything including Positions and Salary Ranges

---

## 📊 Real-World Impact

**Without route guards:**

* ❌ Unauthenticated users see protected pages (or broken API errors)
* ❌ Role enforcement exists only in the UI — bypassed by typing a URL
* ❌ Every component must check auth state and redirect manually
* ❌ Security depends on the UI hiding buttons — not on the routing layer

**With route guards:**

* ✅ Unauthenticated users are sent to IdentityServer automatically
* ✅ Role enforcement happens at the router — URL navigation is blocked
* ✅ Components are clean — no auth checks, no redirects, no boilerplate
* ✅ One change in `app.routes.ts` instantly secures a new route
* ✅ Return URL means users land exactly where they intended after login

---

## 🌟 Why This Matters

Route guards are the Angular idiom for **separating authentication concerns from business logic**. Your components don't need to know about tokens, roles, or redirects — they just render. The router handles who is allowed to reach them.

The pattern here — a broad `canActivateChild` on the layout parent, plus targeted role guards on sensitive actions — scales cleanly. Adding a new feature route requires a single line in `app.routes.ts`. If the route needs role protection, add `canActivate: [managerGuard]`. That's it.

**Transferable skills:**

* **`canActivate` and `canActivateChild`** — Applicable to any Angular application, not just OIDC-secured ones
* **Functional guards** — The modern Angular approach (since v14.2); simpler than class-based guards
* **Role-based routing** — The same pattern works with any identity provider: Auth0, Azure AD, Keycloak, or your own backend
* **Return URL pattern** — Standard practice for any app that needs post-login redirection

---

## 🤝 Community & Support

**Questions or feedback?** The tutorial repository welcomes:

* ⭐ **GitHub stars** — Help others discover it!
* 🐛 **Issue reports** — Found a bug or have a suggestion?
* 💬 **Discussions** — Ask questions, share your use cases
* 🚀 **Pull requests** — Improvements always appreciated

---

## 📖 Series Navigation

**AngularNetTutorial Blog Series:**

* [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56) — Main tutorial
* [Stop Juggling Multiple Repos: Manage Your Full-Stack App Like a Workspace](#) — Git Submodules
* [End-to-End Testing Made Simple: How Playwright Transforms Testing](#) — Playwright Overview
* [Why Your Angular App Needs PKCE: OAuth 2.0 Explained with a Working Demo](#) — OAuth 2.0 PKCE Flow
* **Lock Down Your Angular Routes** — This article
* *Never Forget a Bearer Token Again: Angular's HTTP Interceptor Explained* — Coming next

---

**📌 Tags:** #angular #oauth2 #routeguards #openidconnect #identityserver #webdevelopment #authentication #security #typescript #angularmaterial #spa #rbac #fullstack #dotnet #playwright
