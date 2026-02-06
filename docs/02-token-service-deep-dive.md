# Part 2: Token Service Deep Dive — Understanding OAuth 2.0, OpenID Connect, and Duende IdentityServer

## Building Modern Web Applications with Angular, .NET, and OAuth 2.0

**[← Part 1: Foundation](01-foundation.md)** | **[Tutorial Home](TUTORIAL.md)** | **[Part 3: API Resource Deep Dive →](03-api-resource-deep-dive.md)**

---

## 🔐 Introduction

The **Token Service** is the security heart of the CAT pattern. It's responsible for:

* **Authenticating users** — Verifying username/password credentials
* **Issuing tokens** — Providing access tokens and ID tokens to clients
* **Managing sessions** — Handling single sign-on (SSO) and logout
* **Protecting resources** — Defining what APIs clients can access
* **User management** — Storing user accounts, passwords, and profiles

In this tutorial, we use **Duende IdentityServer 7.0**, which is a certified implementation of OAuth 2.0 and OpenID Connect (OIDC). Understanding these standards is crucial to securing your application properly.

### Why Do We Need a Token Service?

Without a dedicated token service, you'd have to:

* Store user credentials in every application
* Implement authentication logic in every client
* Manage password policies across multiple systems
* Handle token generation and validation manually
* Build your own user management UI

A token service centralizes all of this, providing:

✅ **Single Source of Truth** for user identity
✅ **Standardized Security** using OAuth 2.0/OIDC
✅ **Scalability** — Multiple clients can share one auth server
✅ **Compliance** — Easier to audit and secure
✅ **User Experience** — Single sign-on across applications

---

## 📚 OAuth 2.0 Fundamentals

### What is OAuth 2.0?

**OAuth 2.0** is an **authorization framework** that allows applications to obtain limited access to user accounts on an HTTP service. It's NOT an authentication protocol (that's OIDC, which builds on OAuth 2.0).

### Key Concepts

#### 1. The Four Roles

OAuth 2.0 defines four key roles in the authentication and authorization process:

* **Resource Owner** — The user who owns the data (in our app: the end user logging in)
* **Client** — Application requesting access (in our app: Angular SPA)
* **Authorization Server** — Issues tokens after authenticating user (in our app: IdentityServer)
* **Resource Server** — Hosts protected resources (in our app: .NET Web API)

#### 2. Grant Types (Authorization Flows)

OAuth 2.0 defines several "grant types" - ways for clients to obtain access tokens. Our application uses the **Authorization Code Flow with PKCE**.

##### Authorization Code Flow with PKCE

**PKCE** (Proof Key for Code Exchange, pronounced "pixie") is essential for Single Page Applications (SPAs) because they can't securely store secrets.

**The Flow:**

**Step 1:** Angular SPA generates a random `code_verifier` and creates `code_challenge` (hash of verifier)

**Step 2:** Browser redirects to IdentityServer's `/authorize` endpoint with:
* `response_type=code`
* `client_id=TalentManagement`
* `redirect_uri=http://localhost:4200/callback`
* `code_challenge=abc123...`
* `code_challenge_method=S256`

**Step 3:** IdentityServer shows login form, user enters credentials

**Step 4:** IdentityServer redirects back to callback URL with authorization code:
* `http://localhost:4200/callback?code=xyz123`

**Step 5:** Angular makes POST request to `/token` endpoint with:
* `grant_type=authorization_code`
* `code=xyz123`
* `code_verifier=original_random_string`
* `redirect_uri=http://localhost:4200/callback`

**Step 6:** IdentityServer verifies that `hash(code_verifier)` matches the original `code_challenge`

**Step 7:** IdentityServer returns tokens:
```json
{
  "access_token": "eyJhbGc...",
  "id_token": "eyJhbGc...",
  "refresh_token": "abc123..."
}
```

**Why PKCE?**

Without PKCE, an attacker could intercept the authorization code and exchange it for tokens. PKCE prevents this by requiring the client to prove it's the same application that started the flow.

#### 3. Scopes

**Scopes** define what permissions the client is requesting. Think of them as "permissions" or "access levels."

**Types of Scopes:**

* **Identity Scopes** — User information (examples: `openid`, `profile`, `email`)
* **API Scopes** — API permissions (examples: `api.read`, `api.write`)

**In Our Application:**

```
openid                              - Required for OIDC
profile                             - Access to user's profile (name, etc.)
email                               - Access to user's email
roles                               - Access to user's roles
app.api.talentmanagement.read       - Read data from API
app.api.talentmanagement.write      - Modify data via API
```

#### 4. Consent

**Consent** is when the user explicitly grants permission to the client application. In our app, we've disabled consent (`RequireConsent: false`) for a smoother user experience since we control both the client and the server.

In a third-party scenario (like "Sign in with Google"), users would see a consent screen listing the requested permissions.

---

## 🔑 OpenID Connect (OIDC)

### What is OpenID Connect?

**OpenID Connect** is an **authentication layer** built on top of OAuth 2.0. While OAuth 2.0 handles authorization (what you can access), OIDC handles authentication (who you are).

### OAuth 2.0 vs OIDC

Understanding the difference between OAuth 2.0 and OIDC:

**OAuth 2.0:**
* **Purpose:** Authorization
* **Question Answered:** "What can I do?"
* **Primary Token:** Access Token
* **Use Case:** Grant API access
* **User Info:** Not standardized

**OpenID Connect (OIDC):**
* **Purpose:** Authentication
* **Question Answered:** "Who am I?"
* **Primary Token:** ID Token
* **Use Case:** Verify user identity
* **User Info:** Standardized claims

### Key OIDC Concepts

#### 1. ID Token

An **ID Token** is a JWT (JSON Web Token) that contains information about the authenticated user. It's proof that the user successfully logged in.

**Example ID Token (decoded):**

```json
{
  "header": {
    "alg": "RS256",
    "kid": "abc123",
    "typ": "JWT"
  },
  "payload": {
    "sub": "248289761001",           // Subject - unique user ID
    "name": "Alice Smith",
    "given_name": "Alice",
    "family_name": "Smith",
    "email": "alice@example.com",
    "email_verified": true,
    "role": ["Admin", "Manager"],
    "iss": "https://localhost:44310", // Issuer - who issued the token
    "aud": "TalentManagement",        // Audience - intended recipient
    "iat": 1675000000,                // Issued at (timestamp)
    "exp": 1675003600,                // Expires at (timestamp)
    "auth_time": 1675000000,          // When authentication occurred
    "amr": ["pwd"]                    // Authentication method (password)
  },
  "signature": "..."
}
```

**Key Claims:**

* `sub` (subject) — Unique identifier for the user (never changes)
* `iss` (issuer) — URL of the IdentityServer that issued the token
* `aud` (audience) — Client ID this token is intended for
* `exp` (expiration) — Token expiration timestamp
* `iat` (issued at) — When the token was issued

#### 2. UserInfo Endpoint

The **UserInfo endpoint** (`/connect/userinfo`) returns additional claims about the authenticated user. The client calls this endpoint with an access token to get user details.

```http
GET /connect/userinfo HTTP/1.1
Host: localhost:44310
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI...

Response:
{
  "sub": "248289761001",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": ["Admin"]
}
```

#### 3. Standard Claims

OIDC defines standard claims for user information:

* **`sub`** — Subject identifier (example: "248289761001")
* **`name`** — Full name (example: "Alice Smith")
* **`given_name`** — First name (example: "Alice")
* **`family_name`** — Last name (example: "Smith")
* **`email`** — Email address (example: "alice@example.com")
* **`email_verified`** — Email verified? (example: true)
* **`picture`** — Profile picture URL (example: "https://...")
* **`phone_number`** — Phone number (example: "+1-555-1234")
* **`address`** — Address (example: { "formatted": "123 Main St..." })
* **`birthdate`** — Date of birth (example: "1990-01-01")
* **`locale`** — Locale/language (example: "en-US")
* **`zoneinfo`** — Time zone (example: "America/New_York")

---

## 🎫 Understanding Tokens

### Token Types

#### 1. Access Token

* **Purpose:** Grant access to protected resources (APIs)
* **Format:** JWT or reference token
* **Lifetime:** Short (typically 1 hour)
* **Validated by:** Resource server (API)
* **Contains:** Scopes, client ID, expiration

**Example Access Token (JWT, decoded):**

```json
{
  "header": {
    "alg": "RS256",
    "kid": "abc123",
    "typ": "at+jwt"
  },
  "payload": {
    "iss": "https://localhost:44310",
    "aud": "app.api.talentmanagement",
    "client_id": "TalentManagement",
    "sub": "248289761001",
    "scope": [
      "app.api.talentmanagement.read",
      "app.api.talentmanagement.write",
      "openid",
      "profile",
      "email"
    ],
    "role": ["Admin"],
    "name": "Alice Smith",
    "email": "alice@example.com",
    "iat": 1675000000,
    "exp": 1675003600,
    "nbf": 1675000000
  },
  "signature": "..."
}
```

#### 2. ID Token

* **Purpose:** Prove user identity to the client
* **Format:** Always JWT
* **Lifetime:** Short (typically 5 minutes)
* **Validated by:** Client application
* **Contains:** User identity claims

#### 3. Refresh Token

* **Purpose:** Obtain new access tokens without re-authentication
* **Format:** Opaque string (not JWT)
* **Lifetime:** Long (days, weeks, or months)
* **Validated by:** Authorization server (IdentityServer)
* **Contains:** Reference to user session

### JWT Structure

A **JWT (JSON Web Token)** has three parts separated by dots:

```
eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[      Header      ] . [      Payload       ] . [    Signature    ]
```

#### Header

```json
{
  "alg": "RS256",  // Algorithm (RSA with SHA-256)
  "kid": "123",    // Key ID (identifies which signing key was used)
  "typ": "JWT"     // Type
}
```

#### Payload

```json
{
  "sub": "1234567890",
  "name": "Alice",
  "role": "Admin",
  "exp": 1675003600
}
```

#### Signature

The signature is created by:

1. Taking the encoded header and payload
2. Concatenating with a dot: `encodedHeader.encodedPayload`
3. Signing with a private key using the algorithm specified in the header
4. Base64 encoding the result

![Token Structure](images/jwt-token-structure.png)
*Figure 6: JWT token structure showing header, payload, and signature components*

---

## 🏗️ Duende IdentityServer Overview

### What is Duende IdentityServer?

**Duende IdentityServer** is a .NET-based framework for implementing OAuth 2.0 and OpenID Connect. It's the successor to IdentityServer4 (now deprecated).

**Key Features:**

✅ Certified OpenID Connect implementation
✅ Supports all OAuth 2.0 flows
✅ Built on ASP.NET Core Identity for user management
✅ Extensible and customizable
✅ Production-ready with enterprise support
✅ Admin UI for managing clients, users, and resources

### Duende IdentityServer Components

Our IdentityServer setup consists of three main components:

**STS.Identity (Port 44310):**
* Login UI and authentication flows
* OAuth 2.0 and OIDC endpoints
* Token issuance and validation
* UserInfo endpoint

**Admin UI (Port 44303):**
* Web-based administration interface
* Manage clients and applications
* Manage users and roles
* Configure API resources and scopes

**Admin API (Port 44302):**
* REST API for administrative operations
* Programmatic access to IdentityServer configuration
* Integration with automation tools

![IdentityServer Admin UI](images/identityserver-admin-ui.png)
*Figure 5: Duende IdentityServer Admin UI for managing clients, resources, and users*

---

## ⚙️ Configuration Deep Dive

### Configuration Files

#### identityserverdata.json - Clients and Resources

This file defines:
* **Identity Resources** — User information scopes
* **API Scopes** — Permissions for APIs
* **API Resources** — Protected APIs
* **Clients** — Applications that can request tokens

**Full Configuration Example:**

```json
{
  "IdentityServerData": {
    "IdentityResources": [
      {
        "Name": "openid",
        "Enabled": true,
        "Required": true,
        "DisplayName": "Your user identifier",
        "UserClaims": ["sub"]
      },
      {
        "Name": "profile",
        "Enabled": true,
        "DisplayName": "User profile",
        "UserClaims": ["name", "family_name", "given_name"]
      },
      {
        "Name": "email",
        "Enabled": true,
        "DisplayName": "Your email address",
        "UserClaims": ["email", "email_verified"]
      },
      {
        "Name": "roles",
        "Enabled": true,
        "DisplayName": "Roles",
        "UserClaims": ["role"]
      }
    ],
    "ApiScopes": [
      {
        "Name": "app.api.talentmanagement.read",
        "DisplayName": "Read access to Talent Management API",
        "UserClaims": ["role", "name"]
      }
    ],
    "ApiResources": [
      {
        "Name": "app.api.talentmanagement",
        "Scopes": ["app.api.talentmanagement.read"]
      }
    ],
    "Clients": [
      {
        "ClientId": "TalentManagement",
        "ClientName": "Talent Management Angular App",
        "AllowedGrantTypes": ["authorization_code"],
        "RequirePkce": true,
        "RequireClientSecret": false,
        "AllowedScopes": ["openid", "profile", "email", "roles"],
        "RedirectUris": ["http://localhost:4200/callback"],
        "PostLogoutRedirectUris": ["http://localhost:4200"],
        "AllowedCorsOrigins": ["http://localhost:4200"],
        "RequireConsent": false,
        "AccessTokenLifetime": 3600
      }
    ]
  }
}
```

---

## 🔒 Security Best Practices

### 1. Always Use HTTPS in Production

Tokens are sent in HTTP headers. Without HTTPS, they can be intercepted.

**Development:** `http://localhost:4200` (acceptable)
**Production:** `https://yourdomain.com` (required)

### 2. Use PKCE for SPAs

SPAs can't securely store client secrets. PKCE prevents authorization code interception attacks.

Always set:
* `RequirePkce: true`
* `RequireClientSecret: false` (for public clients like SPAs)

### 3. Short Token Lifetimes

**Recommended token lifetimes:**

* **Access Token:** 1 hour — Frequently used, higher risk if compromised
* **ID Token:** 5 minutes — Only needed at login time
* **Refresh Token:** 30 days — Longer is acceptable since it's managed server-side

### 4. Validate Redirect URIs

Always specify exact redirect URIs to prevent open redirect attacks where an attacker could steal the authorization code.

**Do:**
```json
"RedirectUris": ["http://localhost:4200/callback"]
```

**Don't:**
```json
"RedirectUris": ["http://localhost:4200/*"]  // Too permissive
```

---

## 🧪 Testing and Debugging

### Test /.well-known/openid-configuration

This endpoint exposes IdentityServer's metadata:

```bash
curl https://localhost:44310/.well-known/openid-configuration
```

**Returns:**
* Supported scopes
* Token endpoint URLs
* Supported grant types
* Available algorithms
* JWKS (JSON Web Key Set) endpoint

**Use this to verify:**
* IdentityServer is running correctly
* Endpoints are accessible
* Configuration is as expected

---

## ⚠️ Common Issues and Solutions

### Issue: "invalid_scope" error

**Problem:** Client requests a scope that's not in the `AllowedScopes` configuration

**Symptoms:**
* Error during login
* Message: "invalid_scope"
* Login flow stops

**Solution:**
1. Check `identityserverdata.json` client configuration
2. Verify `AllowedScopes` array includes all requested scopes
3. Restart IdentityServer after configuration changes

**Example fix:**
```json
{
  "ClientId": "TalentManagement",
  "AllowedScopes": [
    "openid",
    "profile",
    "email",
    "roles",
    "app.api.talentmanagement.read"  // Make sure this matches what Angular requests
  ]
}
```

---

### Issue: CORS errors in browser

**Problem:** Angular origin not in `AllowedCorsOrigins`

**Symptoms:**
* Browser console shows CORS errors
* Requests to IdentityServer fail
* Message: "Access to fetch... has been blocked by CORS policy"

**Solution:**
Add Angular URL to `AllowedCorsOrigins` array:

```json
{
  "ClientId": "TalentManagement",
  "AllowedCorsOrigins": [
    "http://localhost:4200"
  ]
}
```

**Important:** The URL must match exactly (including protocol and port)

---

### Issue: Token expired

**Problem:** Access token lifetime too short for user workflow

**Symptoms:**
* API returns 401 Unauthorized
* User has to log in frequently
* Token works initially, then stops

**Solution:**
Adjust `AccessTokenLifetime` in client configuration:

```json
{
  "ClientId": "TalentManagement",
  "AccessTokenLifetime": 3600  // 1 hour in seconds
}
```

**Note:** Use refresh tokens for longer sessions rather than extending access token lifetime excessively.

---

## 📝 Summary

In this deep dive, we covered:

✅ **OAuth 2.0 Fundamentals** — Authorization framework, grant types, scopes
✅ **OpenID Connect** — Authentication layer, ID tokens, UserInfo endpoint
✅ **Tokens** — Access tokens, ID tokens, refresh tokens, JWT structure
✅ **Duende IdentityServer** — Architecture, project structure
✅ **Configuration** — Clients, resources, scopes, users
✅ **Security Best Practices** — HTTPS, PKCE, token lifetimes
✅ **Testing and Debugging** — Endpoint testing, common issues

### Key Takeaways

**OAuth 2.0 vs OIDC:**
* OAuth 2.0 = Authorization ("What can I do?")
* OIDC = Authentication ("Who am I?")

**Token Types:**
* Access Token = API access
* ID Token = User identity
* Refresh Token = Long-lived session

**Security Essentials:**
* Always use PKCE for SPAs
* Keep token lifetimes short
* Validate redirect URIs
* Use HTTPS in production

---

**Next in series:** [Part 3 — API Resource Deep Dive →](03-api-resource-deep-dive.md)

**Previous:** [← Part 1: Foundation — Understanding the CAT Pattern](01-foundation.md)

**Tutorial Home:** [📚 Complete Tutorial Series](TUTORIAL.md)

