# Show the Right Buttons to the Right People: Role-Based UI in Angular

## How *appHasRole and ngx-permissions Control What Each User Sees — Without Cluttering Your Components

Your app has three types of users: Employee, Manager, and HRAdmin. An Employee should see data but not be able to change it. A Manager can add and edit. An HRAdmin can do everything — including delete. How do you make the UI reflect this without writing `if (isManager || isHRAdmin)` scattered through every component?

This article walks through two complementary techniques used in the AngularNetTutorial app: a custom structural directive that hides individual buttons, and ngx-permissions that controls the navigation menu — both driven by the same OIDC token claims.

![Employee list page showing role-appropriate action buttons](https://raw.githubusercontent.com/workcontrolgit/AngularNetTutorial/master/docs/images/angular/employee-list-page.png)

📖 **Tutorial Repository:** [AngularNetTutorial on GitHub](https://github.com/workcontrolgit/AngularNetTutorial)

---

This article is part of the **AngularNetTutorial** series. The full-stack tutorial — covering Angular 20, .NET 10 Web API, and OAuth 2.0 with Duende IdentityServer — has been published at [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56). **This article covers role-based UI rendering — controlling which buttons, actions, and navigation items each user role can see.**

---

## 🎓 What You'll Learn

* **Two approaches to role-based UI** — `*appHasRole` for buttons, ngx-permissions for navigation
* **How `*appHasRole` works** — A structural directive that removes elements from the DOM entirely
* **How ngx-permissions works** — A permission layer that maps OIDC roles to named capabilities
* **How `StartupService` connects them** — Translating OIDC token roles to permissions on login and logout
* **The permission hierarchy** — What HRAdmin, Manager, Employee, and Guest can each do
* **How to verify it with Playwright** — Tests that check button visibility per role

---

## 📋 Prerequisites

**Before following this article, you should have:**

* **Read the PKCE article** — [Why Your Angular App Needs PKCE](#) — understand how roles arrive in the OIDC token
* **Read the Route Guards article** — [Lock Down Your Angular Routes](#) — understand how navigation is protected at the router level
* **Basic Angular knowledge** — Directives, structural directives (`*ngIf`), and Angular Material

**Not set up yet?** Follow the [AngularNetTutorial setup guide](https://github.com/workcontrolgit/AngularNetTutorial) first.

---

## 🎯 The Problem: Role Logic Creeping Into Every Component

Without a clean abstraction, role checks end up written inline everywhere:

```html
<!-- ❌ Without a directive — role logic scattered in templates -->
<button *ngIf="authService.isManager() || authService.isHRAdmin()" (click)="edit()">
  Edit
</button>

<button *ngIf="authService.isHRAdmin()" (click)="delete()">
  Delete
</button>
```

```typescript
// ❌ And in the component too
get canEdit(): boolean {
  return this.authService.isManager() || this.authService.isHRAdmin();
}
```

**Problems:**

* **Duplication** — The same role check appears in every list component, every detail component
* **Coupling** — Components directly depend on `OidcAuthService` for UI decisions
* **Brittleness** — Adding a new role or changing role logic means updating every component
* **Testing overhead** — Every component test needs to mock auth state

---

## 💡 Two Complementary Approaches

This app uses two techniques, each for a different context:

```
Role-Based UI in AngularNetTutorial
├── *appHasRole directive        → buttons and sections in components
│   ├── Add Employee button
│   ├── Edit Employee button
│   ├── Delete Employee button
│   └── Dashboard Quick Actions
│
└── ngx-permissions              → sidebar navigation menu items
    ├── "Add Employee" menu item (canAdd)
    ├── "Add Department" menu item (canAdd)
    └── Other menu items with permissions
```

Both read from the same source of truth — the `role` claim in the OIDC identity token.

---

## 🚀 Approach 1: The `*appHasRole` Directive

### What It Does

`*appHasRole` is a custom structural directive that completely removes an element from the DOM if the user doesn't have the required role. The element is not hidden with CSS — it is never created at all.

```html
<!-- src/app/routes/employees/employee-list.component.html -->

<!-- Add button — visible to Manager and HRAdmin -->
<button mat-raised-button color="primary"
        (click)="createEmployee()"
        *appHasRole="['HRAdmin', 'Manager']">
  <mat-icon>add</mat-icon>
  Add Employee
</button>

<!-- Edit button — visible to Manager and HRAdmin -->
<button mat-icon-button color="accent"
        (click)="editEmployee(employee)"
        *appHasRole="['HRAdmin', 'Manager']"
        matTooltip="Edit Employee">
  <mat-icon>edit</mat-icon>
</button>

<!-- Delete button — HRAdmin only -->
<button mat-icon-button color="warn"
        (click)="deleteEmployee(employee)"
        *appHasRole="['HRAdmin']"
        matTooltip="Delete Employee">
  <mat-icon>delete</mat-icon>
</button>
```

The same pattern repeats consistently across all entity pages:

* **View/detail button** — no `*appHasRole` — all authenticated users can view
* **Edit button** — `*appHasRole="['HRAdmin', 'Manager']"`
* **Delete button** — `*appHasRole="['HRAdmin']"`
* **Add button** — `*appHasRole="['HRAdmin', 'Manager']"`

### How the Directive Works

```typescript
// src/app/shared/directives/has-role.directive.ts
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private authService = inject(OidcAuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private subscription?: Subscription;

  private roles!: string | string[];

  @Input() set appHasRole(roles: string | string[]) {
    this.updateView(roles);
  }

  ngOnInit(): void {
    // Re-check roles when authentication state changes (login / logout)
    this.subscription = this.authService.isAuthenticated$.subscribe(() => {
      if (this.roles) {
        this.updateView(this.roles);
      }
    });
  }

  private updateView(roles: string | string[]): void {
    this.roles = roles;
    this.viewContainer.clear();           // Always clear first

    const hasRole = this.checkRole(roles);

    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);  // Render
    }
    // else: nothing — the element is simply not in the DOM
  }

  private checkRole(roles: string | string[]): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    if (typeof roles === 'string') {
      return this.authService.hasRole(roles);
    }
    if (Array.isArray(roles)) {
      return this.authService.hasAnyRole(roles);     // true if user has ANY of the listed roles
    }
    return false;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

**Three things to notice:**

* **`ViewContainerRef`** — This is what makes it structural. Instead of hiding with `display:none`, `viewContainer.createEmbeddedView()` and `viewContainer.clear()` actually add and remove the DOM node. An Employee inspecting page source will not find the Delete button at all
* **`isAuthenticated$` subscription** — The directive reacts to login/logout. If a user logs in mid-session, buttons appear immediately without a page refresh
* **`hasAnyRole()`** — When an array is passed (`['HRAdmin', 'Manager']`), the directive shows the element if the user has **at least one** of the listed roles

### Where Roles Come From

The directive reads roles directly from the OIDC token via `OidcAuthService`:

```typescript
// src/app/core/authentication/oidc-auth.service.ts
getUserRoles(): string[] {
  const claims = this.oauthService.getIdentityClaims() as any;
  if (!claims) return [];

  const role = claims['role'];   // 'role' claim from IdentityServer token

  if (Array.isArray(role)) {
    return role;                 // User can have multiple roles
  } else if (typeof role === 'string') {
    return [role];               // Single role returned as string
  }
  return [];
}

hasRole(role: string): boolean {
  return this.getUserRoles().includes(role);
}

hasAnyRole(roles: string[]): boolean {
  const userRoles = this.getUserRoles();
  return roles.some(role => userRoles.includes(role));
}
```

The `role` claim is set in IdentityServer when a user logs in — it is part of the identity token issued by Duende IdentityServer.

---

## 🚀 Approach 2: ngx-permissions for the Navigation Menu

### Why a Different Approach for Navigation?

Navigation menus are configured in a data file (`menu.json`), not in Angular templates. This makes the `*appHasRole` directive less practical — you'd need a separate directive instance for each menu item. Instead, the app uses **ngx-permissions**, which lets menu configuration declare required permissions as data.

### The Permission Mapping

`StartupService` runs at app startup and after every login/logout. It translates OIDC roles into ngx-permissions roles and named permissions:

```typescript
// src/app/core/bootstrap/startup.service.ts
setPermissions() {
  const roles = this.oidcAuth.getUserRoles();

  const allPermissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];

  this.rolesService.flushRoles();   // Clear all previous roles

  if (roles.length > 0) {
    // Authenticated user — load permissions based on role
    this.permissonsService.loadPermissions(allPermissions);

    if (roles.includes('HRAdmin')) {
      this.rolesService.addRoles({ HRAdmin: allPermissions });
      // HRAdmin can: canAdd, canDelete, canEdit, canRead
    }
    if (roles.includes('Manager')) {
      this.rolesService.addRoles({ Manager: allPermissions });
      // Manager can: canAdd, canDelete, canEdit, canRead
    }
    if (roles.includes('Employee')) {
      this.rolesService.addRoles({ Employee: ['canRead'] });
      // Employee can only: canRead
    }
  } else {
    // Anonymous user
    this.permissonsService.loadPermissions(['canRead']);
    this.rolesService.addRoles({ Guest: ['canRead'] });
    // Guest can only: canRead
  }
}
```

This runs automatically whenever `OidcAuthService` emits a `permissionsChange$` event — which fires after login and after logout:

```typescript
constructor() {
  this.oidcAuth.permissionsChange$.subscribe(() => {
    this.setPermissions();   // Re-load permissions on every auth state change
  });
}
```

### The Permission Hierarchy

```
Role         canRead    canEdit    canAdd    canDelete
──────────   ────────   ────────   ───────   ─────────
HRAdmin        ✅         ✅         ✅         ✅
Manager        ✅         ✅         ✅         ✅
Employee       ✅         ❌         ❌         ❌
Guest          ✅         ❌         ❌         ❌
```

**Note:** Both Manager and HRAdmin get all four permissions. The distinction between Manager and HRAdmin is enforced by **route guards** (for page access) and **`*appHasRole`** (for Delete buttons) — not by the permission names alone.

### Menu Configuration with Permissions

The sidebar navigation menu is defined in `menu.json`. Menu items declare their required permissions:

```json
{
  "menu": [
    {
      "route": "dashboard",
      "name": "dashboard",
      "type": "link",
      "icon": "dashboard"
    },
    {
      "route": "employees",
      "name": "employees",
      "type": "sub",
      "icon": "people",
      "children": [
        {
          "route": "",
          "name": "employeeList",
          "type": "link"
        },
        {
          "route": "create",
          "name": "addEmployee",
          "type": "link",
          "permissions": {
            "only": ["canAdd"]
          }
        }
      ]
    }
  ]
}
```

The sidebar template reads `permissions.only` from each menu item and passes it to `*ngxPermissionsOnly`:

```html
<!-- src/app/theme/sidemenu/sidemenu.html -->
<ng-template
  [ngxPermissionsOnly]="menuItem.permissions?.only"
  [ngxPermissionsExcept]="menuItem.permissions?.except">
  <li class="menu-item" navAccordionItem [route]="menuItem.route">
    <a class="menu-heading" [routerLink]="...">
      <!-- menu item content -->
    </a>
  </li>
</ng-template>
```

An Employee or Guest never sees "Add Employee" in the sidebar because they don't have `canAdd`. A Manager or HRAdmin sees it because `setPermissions()` loaded `canAdd` for their role.

---

## 🗺️ What Each Role Sees

```
                      Employee          Manager           HRAdmin
                    ─────────────     ─────────────     ─────────────
Sidebar nav:
  Dashboard           ✅ visible        ✅ visible        ✅ visible
  Employee List       ✅ visible        ✅ visible        ✅ visible
  Add Employee        ❌ hidden         ✅ visible        ✅ visible
  (canAdd required)   (no canAdd)       (has canAdd)      (has canAdd)

Employee List page:
  View button         ✅ visible        ✅ visible        ✅ visible
  Edit button         ❌ not in DOM     ✅ visible        ✅ visible
  (*appHasRole=       (no match)        (Manager match)   (HRAdmin match)
  ['HRAdmin','Mgr'])

  Delete button       ❌ not in DOM     ❌ not in DOM     ✅ visible
  (*appHasRole=       (no match)        (no match)        (HRAdmin match)
  ['HRAdmin'])

  Add button          ❌ not in DOM     ✅ visible        ✅ visible
  (*appHasRole=       (no match)        (Manager match)   (HRAdmin match)
  ['HRAdmin','Mgr'])

Dashboard:
  Quick Actions       ❌ not in DOM     ✅ visible        ✅ visible
  section             (no match)        (Manager match)   (HRAdmin match)
```

---

## 🧪 Verify It Works: Playwright Tests

```typescript
// Tests/AngularNetTutorial-Playwright/tests/auth/role-based-access.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsRole } from '../../fixtures/auth.fixtures';

test.describe('Role-Based UI — Employee (read-only)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'employee');
  });

  test('should NOT show Add button to Employee', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const addButton = page.locator('button').filter({ hasText: /create|add.*employee|new/i });
    const isVisible = await addButton.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('should NOT show Edit buttons to Employee', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const editButtons = page.locator('button').filter({ hasText: /edit/i });
    const isVisible = await editButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('should NOT show Delete buttons to Employee', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const deleteButtons = page.locator('button').filter({ hasText: /delete/i });
    const isVisible = await deleteButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });
});

test.describe('Role-Based UI — Manager (add and edit)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'manager');
  });

  test('should show Add button to Manager', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const addButton = page.locator('button').filter({ hasText: /create|add.*employee|new/i });
    await expect(addButton.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show Edit buttons to Manager', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const editButtons = page.locator('button, a').filter({ hasText: /edit/i });
    await expect(editButtons.first()).toBeVisible({ timeout: 3000 });
  });

  test('should NOT show Delete buttons to Manager', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const deleteButtons = page.locator('button').filter({ hasText: /delete/i });
    const isVisible = await deleteButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });
});

test.describe('Role-Based UI — HRAdmin (full access)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'hrAdmin');
  });

  test('should show all action buttons to HRAdmin', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    const editButtons = page.locator('button, a').filter({ hasText: /edit/i });
    const deleteButtons = page.locator('button').filter({ hasText: /delete/i });

    await expect(editButtons.first()).toBeVisible({ timeout: 3000 });
    await expect(deleteButtons.first()).toBeVisible({ timeout: 3000 });
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

1. Log in as `antoinette16` (Employee) — navigate to `/employees`. No Add, Edit, or Delete buttons. The "Add Employee" menu item in the sidebar is also missing
2. Log in as `rosamond33` (Manager) — Add and Edit buttons appear. Delete is still hidden. "Add Employee" appears in the sidebar
3. Log in as `ashtyn1` (HRAdmin) — All buttons visible including Delete
4. Open browser DevTools → Elements tab while logged in as Employee. Search for the Delete button's HTML — it doesn't exist in the DOM at all

---

## 📊 Real-World Impact

**Without role-based UI directives:**

* ❌ Role checks duplicated in every component template and TypeScript
* ❌ Adding a new role requires updating every component
* ❌ Developers forget to add checks on new features
* ❌ Components are tightly coupled to the auth service

**With `*appHasRole` and ngx-permissions:**

* ✅ Role checks declared once, at the element level, in HTML
* ✅ New UI elements only need `*appHasRole="['Manager']"` — no TypeScript changes
* ✅ Directive subscribes to auth changes — login/logout updates UI instantly
* ✅ ngx-permissions in menu.json means nav changes need zero Angular code changes

---

## 🌟 Why This Matters

Role-based UI is about **trust boundaries in your user interface**. Route guards stop unauthorised users from reaching a page. The API stops unauthorised users from modifying data. Role-based UI ensures that authorised users only see the actions they're supposed to take — reducing confusion and accidental operations.

The combination of `*appHasRole` (reactive, OIDC-driven, DOM-level) and ngx-permissions (config-driven, permission-named) is a pattern that scales cleanly. As the app grows — more entity types, more roles, more nuanced permissions — each approach handles its layer without bleeding into the other.

**Transferable skills:**

* **Structural directives** — The `ViewContainerRef` pattern for conditional rendering is more powerful than `*ngIf` when you need reactive re-evaluation or the element must truly not exist in the DOM
* **ngx-permissions** — Works with any authentication system, not just OIDC; the key insight is mapping business permissions (`canAdd`) to auth roles rather than using auth roles directly in templates
* **Separation of concerns** — UI rendering, routing, and API protection are three separate layers. Each must be implemented independently

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
* [Lock Down Your Angular Routes: Auth Guards with OIDC in 5 Minutes](#) — Route Guards
* [Never Forget a Bearer Token Again: Angular's HTTP Interceptor Explained](#) — HTTP Interceptor
* **Show the Right Buttons to the Right People** — This article
* *How to Structure a .NET 10 API So It Doesn't Become a Mess* — Coming next (Series 2)

---

**📌 Tags:** #angular #oauth2 #rbac #rolebased #angularmaterial #ngxpermissions #webdevelopment #authentication #security #typescript #spa #fullstack #dotnet #playwright #ux
