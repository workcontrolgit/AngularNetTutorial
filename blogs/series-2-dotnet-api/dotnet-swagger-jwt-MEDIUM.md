# Test Your Secured .NET API Without Writing a Single Line of Frontend Code

## Configuring Swagger to Accept Bearer Tokens for Interactive API Exploration

You've built a .NET API with JWT authentication, role-based policies, and clean architecture. Now you want to test it. The old approach: spin up the Angular app, log in, open browser DevTools, copy the access token, paste it into a `curl` command, and run your test. That's four manual steps before you've tested anything.

The better approach: open Swagger UI, click **Authorize**, paste the token once, and call any endpoint directly in the browser — with full request/response details, no terminal required.

This article walks through the complete Swagger setup in the **TalentManagement API** — how NSwag is configured, how the Bearer security scheme works, how `[Authorize]` attributes appear as lock icons in the UI, and a step-by-step walkthrough for testing a secured `DELETE` endpoint.

![Swagger Positions Endpoint](https://raw.githubusercontent.com/workcontrolgit/AngularNetTutorial/master/docs/images/webapi/swagger-positions-resource-expanded.png)

---

This article is part of the **AngularNetTutorial** series. The full-stack tutorial — covering Angular 20, .NET 10 Web API, and OAuth 2.0 with Duende IdentityServer — has been published at [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56). **This article dives deep into how Swagger is configured to test secured .NET API endpoints with Bearer tokens.**

---

## 📚 What You'll Learn

* Why NSwag instead of Swashbuckle — and what changes
* The `AddOpenApiDocument()` configuration that wires up Bearer authentication in Swagger
* How `AspNetCoreOperationSecurityScopeProcessor` automatically adds lock icons to protected endpoints
* How `UseOpenApi()` and `UseSwaggerUi()` serve the JSON spec and interactive UI
* Step-by-step: get a JWT token and test a secured endpoint in Swagger UI
* How `[ProducesResponseType]` attributes improve the generated documentation

---

## 🔧 NSwag vs Swashbuckle

ASP.NET Core ships with built-in support for OpenAPI documents, and most projects choose between two libraries to power the Swagger UI:

**Swashbuckle** — the classic choice, deeply integrated with ASP.NET Core's `AddSwaggerGen()`. Most tutorials use it.

**NSwag** — generates both the OpenAPI spec and strongly-typed C# / TypeScript client code from it. The TalentManagement API uses NSwag because the same spec that powers the Swagger UI can generate Angular HTTP clients automatically.

The key difference in code:

```
Swashbuckle:   services.AddSwaggerGen()  →  app.UseSwagger()  →  app.UseSwaggerUI()
NSwag:         services.AddOpenApiDocument()  →  app.UseOpenApi()  →  app.UseSwaggerUi()
```

Everything else — Bearer token setup, lock icons, `[Authorize]` integration — works the same way conceptually.

---

## ⚙️ AddSwaggerExtension: Registering the Document

Swagger is registered in `ServiceExtensions.cs`:

```csharp
public static void AddSwaggerExtension(this IServiceCollection services)
{
    services.AddOpenApiDocument(config =>
    {
        config.DocumentName = "v1";
        config.Version     = "v1";
        config.Title       = "Clean Architecture - TalentManagementAPI.WebApi";
        config.Description =
            "This Api will be responsible for overall data distribution and authorization.";

        config.PostProcess = document =>
        {
            document.Info.Contact = new OpenApiContact
            {
                Name  = "Jane Doe",
                Email = "jdoe@janedoe.com",
                Url   = "https://janedoe.com/contact",
            };
        };

        // Register the Bearer security scheme
        config.AddSecurity("Bearer", new OpenApiSecurityScheme
        {
            Type         = OpenApiSecuritySchemeType.Http,
            Scheme       = "Bearer",
            BearerFormat = "JWT",
            In           = OpenApiSecurityApiKeyLocation.Header,
            Name         = "Authorization",
            Description  =
                "Input your Bearer token in this format - " +
                "Bearer {your token here} to access this API",
        });

        // Auto-apply the Bearer requirement to endpoints that need it
        config.OperationProcessors.Add(
            new AspNetCoreOperationSecurityScopeProcessor("Bearer"));
    });
}
```

### What Each Part Does

**`DocumentName = "v1"`** — the identifier for this OpenAPI document. The `{documentName}` placeholder in the route templates below resolves to `v1`:

```
/swagger/v1/swagger.json   ← the raw JSON spec
/swagger                   ← the interactive UI
```

**`PostProcess`** — a callback that runs after the document is generated. Used here to add contact information to the `info` block of the OpenAPI spec. Useful for adding a license, terms-of-service URL, or any metadata that doesn't fit the main configuration.

**`AddSecurity("Bearer", ...)`** — registers the JWT Bearer security scheme with the OpenAPI spec. This is what makes the **Authorize** button appear in the Swagger UI. Breaking down each property:

```
Type = OpenApiSecuritySchemeType.Http
    → The scheme is HTTP authentication (as opposed to apiKey or oauth2)

Scheme = "Bearer"
    → The HTTP authentication scheme name (used in the Authorization header)

BearerFormat = "JWT"
    → Informational only — tells the UI to display "JWT" as the token format hint

In = OpenApiSecurityApiKeyLocation.Header
    → The token is sent in the request header (not a query param or cookie)

Name = "Authorization"
    → The header name where the token is placed
```

**`AspNetCoreOperationSecurityScopeProcessor("Bearer")`** — this is the key piece that connects `[Authorize]` attributes on controllers to the Bearer scheme in Swagger. It inspects each endpoint at document-generation time:

* Endpoints with `[Authorize]` → get a lock icon 🔒 and include Bearer in their security requirements
* Endpoints with `[AllowAnonymous]` → get no lock icon, no Bearer requirement

Without this processor, you'd have the Authorize button but no endpoints would actually require auth in the UI.

---

## 🚀 UseSwaggerExtension: Serving the UI

The middleware pipeline in `AppExtensions.cs` serves two things:

```csharp
public static void UseSwaggerExtension(this IApplicationBuilder app)
{
    // Serve the raw OpenAPI JSON spec
    app.UseOpenApi(settings =>
    {
        settings.Path = "/swagger/{documentName}/swagger.json";
    });

    // Serve the interactive Swagger UI
    app.UseSwaggerUi(settings =>
    {
        settings.Path         = "/swagger";
        settings.DocumentPath = "/swagger/{documentName}/swagger.json";
    });
}
```

**`UseOpenApi`** serves the machine-readable JSON document at:

```
https://localhost:44378/swagger/v1/swagger.json
```

This is the raw OpenAPI 3.0 spec — useful for generating client code with NSwag CLI or importing into Postman.

**`UseSwaggerUi`** serves the interactive HTML/JS UI at:

```
https://localhost:44378/swagger
```

The UI loads the JSON spec from `DocumentPath` and renders it as the familiar expandable endpoint explorer.

### Middleware Order Matters

In `Program.cs`, the middleware is registered in this specific order:

```csharp
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();    // ← must come before UseAuthorization
app.UseAuthorization();     // ← must come before UseSwaggerExtension
app.UseSwaggerExtension();  // ← Swagger after auth middleware
app.MapControllers();
```

**Why this order?** When Swagger UI sends a request to a protected endpoint, `UseAuthentication()` reads the `Authorization` header and populates `HttpContext.User`. Then `UseAuthorization()` evaluates the role policies. If Swagger came before auth middleware, the protected endpoints would return `401` even with a valid token pasted into the UI.

---

## 🔒 Lock Icons: What You See in the UI

The `AspNetCoreOperationSecurityScopeProcessor` maps `[Authorize]` attributes to lock icons:

```
[AllowAnonymous]                    → 🔓 No lock — open padlock icon, no auth required
[Authorize]                         → 🔒 Lock — any authenticated user
[Authorize(Policy = "AdminPolicy")] → 🔒 Lock — HRAdmin role required
```

The Employees resource in the UI looks like this:

```
GET    /api/v1/employees          🔓  Get all employees (public)
GET    /api/v1/employees/{id}     🔓  Get employee by ID (public)
POST   /api/v1/employees          🔒  Create employee (authenticated)
PUT    /api/v1/employees/{id}     🔒  Update employee (authenticated)
DELETE /api/v1/employees/{id}     🔒  Delete employee (AdminPolicy)
```

The lock is visual only — the actual enforcement happens in the authorization middleware. But it immediately tells any developer which endpoints require authentication before they try to call them.

---

## 🔑 Step-by-Step: Testing a Secured Endpoint

### Step 1: Get an Access Token

The easiest way is to let Angular do the OIDC flow and then copy the token from the browser:

1. Start all three services (IdentityServer, API, Angular)
2. Open the Angular app at `http://localhost:4200`
3. Log in with an HRAdmin user (`ashtyn1` / `Pa$$word123`)
4. Open browser DevTools → **Application** → **Session Storage** → `http://localhost:4200`
5. Find the key containing `access_token` — copy the value

The token is a long base64 string starting with `eyJ...`.

Alternatively, get a token directly from IdentityServer's token endpoint without any Angular involvement:

```bash
curl -X POST https://localhost:44310/connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=TalentManagement" \
  -d "client_secret=your_secret" \
  -d "username=ashtyn1" \
  -d "password=Pa$$word123" \
  -d "scope=openid profile roles app.api.talentmanagement.read app.api.talentmanagement.write" \
  -k
```

The response contains `"access_token": "eyJ..."`.

### Step 2: Open Swagger UI

Navigate to `https://localhost:44378/swagger`.

You'll see all endpoints grouped by resource (Employees, Departments, Positions, etc.), each showing the HTTP method, route, and summary from the XML doc comments.

### Step 3: Authorize

Click the **Authorize** button (top right, next to the lock icon).

A dialog appears with a single input field labelled **Bearer (http, Bearer)**:

```
Value: _________________________

Important: Paste ONLY the token value.
NSwag adds "Bearer " automatically.
```

**Critical detail:** Because `Type = OpenApiSecuritySchemeType.Http` and `Scheme = "Bearer"` are set, NSwag knows this is an HTTP Bearer scheme. It prepends `Bearer ` to your token automatically when sending requests. If you paste `Bearer eyJ...` instead of just `eyJ...`, the API receives `Bearer Bearer eyJ...` and returns `401`.

Paste the raw token, click **Authorize**, click **Close**.

### Step 4: Test a Locked Endpoint

Expand **DELETE /api/v1/employees/{id}**. The lock icon is now closed (gold), indicating you're authorized.

1. Click **Try it out**
2. Enter an employee ID (copy one from a `GET /api/v1/employees` response)
3. Click **Execute**

The UI sends:

```
DELETE https://localhost:44378/api/v1/employees/abc123-guid
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

If the token has the `HRAdmin` role claim, you get `200 OK`. If you're logged in as an Employee or Manager, you get `403 Forbidden` — the Swagger UI shows the response body and headers so you can see exactly what the API returned.

### Step 5: Test a Public Endpoint Without Auth

Expand **GET /api/v1/employees**. The lock is open. Click **Try it out** → **Execute**.

This works immediately — no token required. The Swagger UI doesn't send the `Authorization` header for `[AllowAnonymous]` endpoints even when you're authorized in the UI.

---

## 📝 ProducesResponseType: Better API Docs

Controllers use `[ProducesResponseType]` to declare exactly which HTTP status codes each endpoint can return. These appear as response examples in the Swagger UI:

```csharp
[HttpPost]
[Authorize]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IActionResult> Post(CreateEmployeeCommand command)
{
    var result = await Mediator.Send(command);
    return CreatedAtAction(nameof(Get), new { id = result.Value }, result);
}
```

In the Swagger UI, the POST endpoint shows documented responses for both `201 Created` and `400 Bad Request` — including the response schema for each. This tells API consumers what to expect before they've written a single line of client code.

Without `[ProducesResponseType]`, the UI only shows a generic `200 OK` response, which doesn't reflect what the endpoint actually returns.

---

## 🌐 The OpenAPI JSON Spec

The raw spec at `https://localhost:44378/swagger/v1/swagger.json` is a machine-readable description of every endpoint. You can use it to:

**Generate Angular HTTP clients** with the NSwag CLI:

```bash
npx nswag openapi2tsclient \
  /input:https://localhost:44378/swagger/v1/swagger.json \
  /output:src/app/api/api-client.ts \
  /template:Angular
```

This generates a typed Angular service with strongly-typed request/response models — matching every endpoint, query parameter, and request body exactly.

**Import into Postman:**

1. Open Postman → Import
2. Paste `https://localhost:44378/swagger/v1/swagger.json`
3. Postman creates a collection with every endpoint pre-configured

**Import into Insomnia, HTTPie, or any OpenAPI-compatible tool** — the spec is vendor-neutral.

---

## 🎯 Key Design Decisions

**NSwag over Swashbuckle** — The OpenAPI JSON spec can generate typed TypeScript clients for Angular, eliminating hand-written HTTP service code. If client generation isn't needed, Swashbuckle is simpler.

**`AspNetCoreOperationSecurityScopeProcessor`** — This processor reads `[Authorize]` attributes at document-generation time, not at runtime. The lock icons in Swagger UI are purely visual documentation; the actual security is enforced by the auth middleware regardless of what Swagger shows.

**`Type = OpenApiSecuritySchemeType.Http`** — Using the `Http` type means the UI only asks for the raw token value (not `Bearer <token>`). This is less error-prone than `ApiKey` type, where developers must remember to include the `Bearer ` prefix themselves.

**`DocumentName = "v1"`** — The document name matches the API version. If a v2 is added, a second `AddOpenApiDocument()` call with `DocumentName = "v2"` creates a separate Swagger document, separate Authorize button, and separate UI dropdown — without touching the v1 configuration.

---

## 📖 Series Navigation

**AngularNetTutorial Blog Series:**

* [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56) — Main tutorial
* [Stop Juggling Multiple Repos: Manage Your Full-Stack App Like a Workspace](#) — Git Submodules
* [End-to-End Testing Made Simple: How Playwright Transforms Testing](#) — Playwright Overview
* [Why Your Angular App Needs PKCE: OAuth 2.0 Explained with a Working Demo](#) — OAuth 2.0 PKCE Flow
* [Lock Down Your Angular Routes: Auth Guards with OIDC in 5 Minutes](#) — Route Guards
* [Never Forget a Bearer Token Again: Angular's HTTP Interceptor Explained](#) — HTTP Interceptor
* [Show the Right Buttons to the Right People: Role-Based UI in Angular](#) — Role-Based UI
* [How to Structure a .NET 10 API So It Doesn't Become a Mess](#) — Clean Architecture
* [How Your .NET API Knows to Trust Angular: JWT Validation Explained](#) — JWT Validation
* [Future-Proof Your .NET API: Add Versioning Without Breaking Existing Clients](#) — API Versioning
* **Test Your Secured .NET API Without Writing a Single Line of Frontend Code** — This article

---

**📌 Tags:** #dotnet #swagger #openapi #nswag #aspnetcore #webapi #jwt #authentication #apidocumentation #restapi #cleanarchitecture #csharp #fullstack #angular #devtools
