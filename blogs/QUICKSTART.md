# Quick Start: Running the AngularNetTutorial Stack

This guide covers the startup commands, application URLs, and test credentials used throughout the AngularNetTutorial blog series.

📖 **Tutorial Repository:** [AngularNetTutorial on GitHub](https://github.com/workcontrolgit/AngularNetTutorial)

---

## Start All Services

Start the three services in this order. Each must be running before you proceed.

**Terminal 1: IdentityServer (start first — others depend on it)**

```bash
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44310`

**Terminal 2: API**

```bash
cd ApiResources/TalentManagement-API/TalentManagementAPI.WebApi
dotnet run
```

**Wait for:** `Now listening on: https://localhost:44378`

**Terminal 3: Angular Client**

```bash
cd Clients/TalentManagement-Angular-Material/talent-management
npm start
```

**Wait for:** `Angular Live Development Server is listening on localhost:4200`

---

## Application URLs

* **Angular Client:** http://localhost:4200 — Main application UI
* **Web API:** https://localhost:44378 — RESTful API endpoints
* **Swagger UI:** https://localhost:44378/swagger — Interactive API documentation
* **IdentityServer:** https://localhost:44310 — OAuth 2.0/OIDC authentication server
* **Admin UI:** https://localhost:44303 — IdentityServer management console

---

## Test Credentials

* **Manager:** `rosamond33` / `Pa$$word123`
* **HRAdmin:** `ashtyn1` / `Pa$$word123`
* **Employee:** `antoinette16` / `Pa$$word123`
* **Admin (IdentityServer Admin UI):** `admin` / `Pa$$word123`

---

## Playwright Tests (E2E Testing Articles)

After all three services are running, install and run the Playwright test suite:

```bash
cd Tests/AngularNetTutorial-Playwright
npm install
npx playwright install
npx playwright test
```

**Useful Playwright commands:**

```bash
npx playwright test --ui           # Interactive UI mode for debugging
npx playwright test --headed       # Watch tests run in the browser
npx playwright test --project=chromium  # Run on specific browser only
npx playwright show-report         # View detailed HTML report
```

---

📖 **Series:** [AngularNetTutorial Series Navigation](SERIES-NAVIGATION-TOC.md)
