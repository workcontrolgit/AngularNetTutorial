# Why Your Angular App Needs PKCE: OAuth 2.0 Explained with a Working Demo

## Follow a Login Request from Browser to IdentityServer and Back — No Theory, Just Code

You've built a beautiful Angular app. Now you need to add authentication. You search "Angular login OAuth2" and suddenly you're drowning in acronyms — PKCE, OIDC, code_challenge, code_verifier, access tokens, identity tokens. Most tutorials throw a diagram at you and call it done.

This article is different. We'll follow a real login request step by step through actual working code, from the moment a user clicks "Login" to the moment they see their dashboard — with a Playwright test that proves it works.

![IdentityServer Login Page — the OAuth 2.0 PKCE flow in action](https://raw.githubusercontent.com/workcontrolgit/AngularNetTutorial/master/docs/images/identityserver/identityserver-login-admin.png)

📖 **Tutorial Repository:** [AngularNetTutorial on GitHub](https://github.com/workcontrolgit/AngularNetTutorial)

---

This article is part of the **AngularNetTutorial** series. The full-stack tutorial — covering Angular 20, .NET 10 Web API, and OAuth 2.0 with Duende IdentityServer — has been published at [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56). **This article dives deep into how the authentication layer works under the hood.**

---

## 🎓 What You'll Learn

* **Why PKCE exists** — The security problem it solves for single-page applications
* **The complete OIDC flow** — Every redirect, every token, in plain English
* **How Angular is configured** — The exact `auth.config.ts` settings and what each one does
* **How the token reaches your API** — The HTTP interceptor that adds `Authorization: Bearer` automatically
* **How to verify it works** — A Playwright test that walks through the full login sequence

---

## 📋 Prerequisites

**Before following this article, you should have:**

* **AngularNetTutorial running locally** — Clone the repo and start all three services (see setup below)
* **Basic Angular knowledge** — Components, services, and dependency injection
* **Familiarity with HTTP** — You know what a request/response looks like

**Not set up yet?** Follow the [AngularNetTutorial setup guide](https://github.com/workcontrolgit/AngularNetTutorial) first.

---

## 🎯 The Problem: Why Not Just Use Username/Password?

Imagine your Angular app handles authentication like a traditional web app — a login form that sends a username and password directly to your API, which checks a database and returns a session cookie.

**This works, but it has serious problems for modern multi-client architectures:**

* **Your Angular app handles passwords** — If your app has an XSS vulnerability, an attacker steals every user's password
* **Every client reinvents auth** — Your mobile app, Angular app, and CLI tool each manage their own credential logic
* **No single sign-on** — Users log in separately to every application
* **No consent model** — Users can't control what each app is allowed to access

**The OAuth 2.0 solution:** Don't let your Angular app touch credentials at all. Delegate authentication to a dedicated service — IdentityServer — that specialises in exactly this problem.

**But OAuth had a vulnerability for SPAs:** The original "Implicit Flow" put the access token directly in the browser URL. Malicious scripts on the same domain could read it. **PKCE (Proof Key for Code Exchange)** fixes this.

---

## 💡 What is PKCE and Why Does it Matter?

**PKCE is a security extension to OAuth 2.0 that prevents authorization code interception attacks.**

Here is how it works in plain English:

**1. Before redirecting to IdentityServer, Angular generates a secret:**

* Creates a random string called the `code_verifier` (stored in memory)
* Hashes it using SHA-256 to produce the `code_challenge`
* Sends only the `code_challenge` to IdentityServer (the hash, not the secret)

**2. IdentityServer stores the `code_challenge` and returns an authorization code**

**3. Angular sends the authorization code back to IdentityServer along with the original `code_verifier`**

**4. IdentityServer hashes the `code_verifier` and compares it to the stored `code_challenge`**

* If they match → IdentityServer issues access token and identity token
* If they don't match → Request rejected

**Why this prevents attacks:** Even if someone intercepts the authorization code mid-flight, they cannot exchange it for tokens without knowing the `code_verifier` — which was never sent over the network.

---

## 🚀 The Complete Login Flow: Step by Step

Here's exactly what happens when a user clicks "Login" in our Angular app.

### Step 1: User Clicks the Login Button

The user menu is rendered by `user-button.ts`. When the user clicks Login:

```typescript
// src/app/theme/widgets/user-button.ts
login() {
  // Redirect directly to IdentityServer for authentication
  this.oidcAuth.login();
}
```

This calls into `OidcAuthService`:

```typescript
// src/app/core/authentication/oidc-auth.service.ts
login(targetUrl?: string): void {
  if (targetUrl) {
    this.oauthService.initCodeFlow(targetUrl);
  } else {
    this.oauthService.initCodeFlow();
  }
}
```

`initCodeFlow()` is from the `angular-oauth2-oidc` library. It generates the PKCE `code_verifier` and `code_challenge`, then redirects the browser to IdentityServer.

### Step 2: Browser Redirects to IdentityServer

The browser navigates to a URL like this:

```
https://localhost:44310/connect/authorize
  ?response_type=code
  &client_id=TalentManagement
  &redirect_uri=http://localhost:4200/callback
  &scope=openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write
  &code_challenge=abc123xyz...
  &code_challenge_method=S256
  &state=random-state-value
```

All of this is configured once in `auth.config.ts`:

```typescript
// src/app/config/auth.config.ts
import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authConfig: AuthConfig = {
  // Duende IdentityServer URL
  issuer: environment.identityServerUrl,

  // Where IdentityServer sends the user after login
  redirectUri: window.location.origin + '/callback',

  // The client ID registered in IdentityServer
  clientId: environment.clientId,

  // What the app is requesting access to
  scope: environment.scope,

  // Authorization Code Flow with PKCE (most secure for SPAs)
  responseType: 'code',

  // Allow automatic token renewal before expiry
  useSilentRefresh: true,
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
};
```

And the environment values:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44378/api/v1',
  identityServerUrl: 'https://localhost:44310',
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',
};
```

### Step 3: User Logs in at IdentityServer

IdentityServer shows its own login page at `https://localhost:44310`. The Angular app is completely out of the picture — it never sees the username or password.

The user enters their credentials (e.g., `rosamond33` / `Pa$$word123`) and IdentityServer validates them against its user store.

### Step 4: IdentityServer Redirects Back with Authorization Code

After successful login, IdentityServer redirects back to Angular:

```
http://localhost:4200/callback
  ?code=abc123authcode...
  &state=random-state-value
  &session_state=xyz789...
```

This lands on the `CallbackComponent`:

```typescript
// src/app/routes/sessions/callback/callback.ts
export class CallbackComponent implements OnInit {
  private authService = inject(OidcAuthService);
  private router = inject(Router);

  async ngOnInit() {
    // initAuth() calls tryLogin() which exchanges the code for tokens
    const isAuthenticated = await this.authService.initAuth();

    if (isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      // Anonymous access allowed — go to dashboard as Guest
      this.router.navigate(['/dashboard']);
    }
  }
}
```

### Step 5: Angular Exchanges the Code for Tokens

`initAuth()` in `OidcAuthService` calls `tryLogin()` from the library:

```typescript
// src/app/core/authentication/oidc-auth.service.ts
async initAuth(): Promise<boolean> {
  try {
    // Load IdentityServer's metadata (endpoints, public keys, etc.)
    await this.oauthService.loadDiscoveryDocument();

    // Exchange the authorization code for tokens (PKCE verification happens here)
    await this.oauthService.tryLogin();

    if (this.oauthService.hasValidAccessToken()) {
      await this.handleSuccessfulLogin();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error during auth initialization:', error);
    return false;
  }
}
```

Behind the scenes, `tryLogin()` sends a POST to IdentityServer's token endpoint:

```
POST https://localhost:44310/connect/token
  grant_type=authorization_code
  code=abc123authcode...
  redirect_uri=http://localhost:4200/callback
  client_id=TalentManagement
  code_verifier=original-random-secret   ← PKCE verification
```

IdentityServer hashes the `code_verifier` and compares it to the `code_challenge` from Step 2. They match → tokens are issued.

### Step 6: Tokens are Stored and User State is Updated

```typescript
// src/app/core/authentication/oidc-auth.service.ts
private async handleSuccessfulLogin(): Promise<void> {
  // Extract claims from the identity token (name, email, roles)
  const claims = this.oauthService.getIdentityClaims() as UserInfo;
  this.userInfoSubject.next(claims);
  this.isAuthenticatedSubject.next(true);

  // Notify StartupService to load role-based permissions
  this.permissionsChangeSubject.next();
}
```

The `StartupService` listens for this event and loads the user's permissions:

```typescript
// src/app/core/bootstrap/startup.service.ts
constructor() {
  this.oidcAuth.permissionsChange$.subscribe(() => {
    this.setPermissions();
  });
}

setPermissions() {
  const roles = this.oidcAuth.getUserRoles();

  this.rolesService.flushRoles();

  if (roles.includes('HRAdmin')) {
    this.rolesService.addRoles({ HRAdmin: ['canAdd', 'canDelete', 'canEdit', 'canRead'] });
  }
  if (roles.includes('Manager')) {
    this.rolesService.addRoles({ Manager: ['canAdd', 'canEdit', 'canRead'] });
  }
  if (roles.includes('Employee')) {
    this.rolesService.addRoles({ Employee: ['canRead'] });
  }
}
```

### Step 7: Every API Request Gets the Bearer Token Automatically

Once the user is logged in, every HTTP request to the API automatically includes the access token. This is handled by the HTTP interceptor:

```typescript
// src/app/core/interceptors/auth-token-interceptor.ts
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(OidcAuthService);

  if (!authService.isAuthenticated()) {
    return next(req);
  }

  const token = authService.getAccessToken();

  // Clone the request and add the Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
```

The interceptor is registered once in `app.config.ts` and applies to every HTTP call automatically — no manual token management needed anywhere in your components.

---

## 🔑 The Two Tokens: What Each One Does

After a successful login, Angular holds two tokens:

**Identity Token (id_token)**
* **Purpose:** Proves who the user is (authentication)
* **Contains:** User ID (`sub`), name, email, roles
* **Used by:** Angular — to display user info and set permissions
* **Lifetime:** Short (minutes)

**Access Token (access_token)**
* **Purpose:** Grants access to protected API resources (authorization)
* **Contains:** Scopes (`app.api.talentmanagement.read`, `.write`), expiry
* **Used by:** .NET Web API — to validate the request
* **Lifetime:** Short (typically 1 hour)
* **Sent as:** `Authorization: Bearer <token>` header on every API request

---

## 🔄 Automatic Token Renewal: Silent Refresh

The access token expires after ~1 hour. Rather than forcing the user to log in again, Angular silently renews it using a hidden iframe:

```typescript
// auth.config.ts
useSilentRefresh: true,
silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
timeoutFactor: 0.75,  // Renew when 75% of token lifetime has passed
```

The `silent-refresh.html` file at the app root handles the iframe callback:

```html
<!-- public/silent-refresh.html -->
<script>
  parent.postMessage(location.hash, location.origin);
</script>
```

The library calls `setupAutomaticSilentRefresh()` which handles all the timing automatically.

---

## 🧪 Verify It Works: Playwright Test

Here is a Playwright test that walks through the complete login flow and verifies every step:

```typescript
// tests/auth/login-flow.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsRole } from '../../fixtures/auth.fixtures';

test.describe('OAuth 2.0 PKCE Login Flow', () => {

  test('should redirect to IdentityServer when clicking Login', async ({ page }) => {
    await page.goto('/');

    // Click the user icon in the toolbar
    await page.locator('button[aria-label="User menu"]').click();

    // Click Login option
    await page.locator('button:has-text("Login")').click();

    // Verify we are redirected to IdentityServer (PKCE flow started)
    await page.waitForURL(/localhost:44310/);
    await expect(page).toHaveURL(/connect\/authorize/);

    // Verify PKCE parameters are present in the URL
    const url = new URL(page.url());
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('TalentManagement');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  });

  test('should complete full login and reach dashboard', async ({ page }) => {
    // loginAsRole handles the complete OIDC flow
    await loginAsRole(page, 'manager');

    // Verify we are back in the Angular app
    await expect(page).toHaveURL(/localhost:4200/);

    // Verify the user is shown as authenticated (not Guest)
    await page.locator('button[aria-label="User menu"]').click();
    await expect(page.locator('text=rosamond33').or(page.locator('text=Manager'))).toBeVisible();
  });

  test('should attach Bearer token to API requests after login', async ({ page }) => {
    await loginAsRole(page, 'manager');

    // Intercept API calls and verify Authorization header
    let capturedToken = '';
    await page.route('**/api/v1/employees**', route => {
      const headers = route.request().headers();
      capturedToken = headers['authorization'] ?? '';
      route.continue();
    });

    // Navigate to employees to trigger API call
    await page.goto('/employees');

    // Verify the Bearer token was sent
    expect(capturedToken).toMatch(/^Bearer .+/);
  });

  test('should logout successfully', async ({ page }) => {
    await loginAsRole(page, 'manager');

    // Click user menu and logout
    await page.locator('button[aria-label="User menu"]').click();
    await page.locator('button:has-text("Logout")').or(
      page.locator('mat-icon:has-text("exit_to_app")').locator('..')
    ).click();

    // IdentityServer shows logout page — click return link
    await page.waitForURL(/localhost:44310/);
    const returnLink = page.locator('a:has-text("click here")');
    if (await returnLink.isVisible()) {
      await returnLink.click();
    }

    // Verify back on Angular app as Guest
    await page.waitForURL(/localhost:4200/);
    await page.locator('button[aria-label="User menu"]').click();
    await expect(page.locator('text=Guest')).toBeVisible();
  });

});
```

**Run the tests:**

```bash
cd Tests/AngularNetTutorial-Playwright
npx playwright test tests/auth/login-flow.spec.ts --ui
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

**What to observe in browser DevTools:**

1. Open DevTools → Network tab before clicking Login
2. Click Login and watch the redirect to `localhost:44310/connect/authorize`
3. Check the URL parameters for `code_challenge` and `response_type=code`
4. After login, watch the POST to `localhost:44310/connect/token`
5. Watch subsequent API calls to `localhost:44378/api/v1/...` — each should have `Authorization: Bearer ...`

---

## 📊 Real-World Impact

**Before OAuth 2.0 / PKCE:**

* ❌ Angular app stores and transmits user passwords
* ❌ XSS attack → all user passwords compromised
* ❌ No single sign-on — users log into every app separately
* ❌ Custom auth logic duplicated across every client app
* ❌ No standard for what each app is allowed to access

**After OAuth 2.0 / PKCE:**

* ✅ Angular app never sees passwords — IdentityServer handles it
* ✅ XSS attack can only compromise the current session's short-lived token
* ✅ One login works across all your applications
* ✅ Standard library (`angular-oauth2-oidc`) handles all auth logic
* ✅ Scopes define exactly what each app can access

---

## 🌟 Why This Matters

The PKCE flow demonstrated here is the **industry standard for securing single-page applications**. It's not Angular-specific — the same pattern applies to React, Vue, Svelte, and any other SPA framework.

Understanding PKCE makes you a better full-stack developer because:

**Transferable skills:**

* **OAuth 2.0 is everywhere** — Google, GitHub, Microsoft, AWS all use it. Understanding PKCE lets you integrate with any of them
* **Security-first thinking** — Knowing why PKCE exists helps you make better decisions in your own applications
* **Token-based architecture** — JWT access tokens are the lingua franca of modern microservices; this is the foundation

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
* **Why Your Angular App Needs PKCE** — This article
* *Lock Down Your Angular Routes: Auth Guards with OIDC* — Coming next

---

**📌 Tags:** #angular #oauth2 #pkce #openidconnect #identityserver #webdevelopment #authentication #security #typescript #angularmaterial #spa #jwt #fullstack #dotnet #playwright
