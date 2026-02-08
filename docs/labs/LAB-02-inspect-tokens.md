# LAB-02: Inspect JWT Tokens with DevTools

## 🎯 Objective

Understand OAuth 2.0 and OIDC authentication by inspecting actual JWT tokens in your browser, learning how tokens are structured and used for API authorization.

**What you'll accomplish:**
- ✅ Capture and inspect access tokens from HTTP requests
- ✅ Decode JWT tokens to see their contents
- ✅ Understand token structure (header, payload, signature)
- ✅ Modify token lifetime and test expiration behavior
- ✅ Debug authentication issues using DevTools
- ✅ Learn the difference between access tokens and ID tokens

---

## 📋 Prerequisites

**Before Starting This Lab:**

- ✅ Completed [LAB-01: Verify Setup](LAB-01-verify-setup.md)
- ✅ All three services running (IdentityServer, API, Angular)
- ✅ Successfully logged in at least once
- ✅ Familiar with browser DevTools (F12)
- ✅ Read [Part 2: Token Service Deep Dive](../02-token-service-deep-dive.md) (recommended)

---

## ⏱️ Duration

**20-25 minutes**

---

## 🚀 Steps

### Step 1: Capture an Access Token

#### 1.1 Prepare DevTools

1. Open browser to `http://localhost:4200`
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Check **Preserve log** checkbox
5. Clear existing network logs (trash icon)

#### 1.2 Login to Application

1. If already logged in, logout first (user menu → Logout)
2. Click **Sign In** (top-right user menu)
3. Login with credentials:
   - **Username:** `ashtyn1`
   - **Password:** `Pa$$word123`
4. After redirect back to Angular, observe Network tab

#### 1.3 Find Token Exchange Request

In Network tab, look for these requests in order:

**Request 1: Authorization Request**
- URL: `https://localhost:44310/connect/authorize`
- Method: GET
- Purpose: Initiates login, returns authorization code

**Request 2: Token Exchange** (This is what we want!)
- URL: `https://localhost:44310/connect/token`
- Method: POST
- Purpose: Exchanges authorization code for tokens

**Click on the `token` request** → Go to **Response** tab

#### 1.4 Examine Token Response

You should see JSON response containing:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1..."
}
```

**Key fields:**
- `access_token` - Used to access protected APIs
- `id_token` - Contains user identity information
- `expires_in` - Token lifetime in seconds (default: 3600 = 1 hour)
- `scope` - Permissions granted by this token

---

### Step 2: Decode the Access Token

#### 2.1 Copy Access Token

1. In the token response, find the `access_token` value
2. **Right-click** on the token string → **Copy value**
3. The token should start with `eyJ...` (this is Base64 encoded)

**Example token (shortened):**
```
eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo0NDMxMCIsIm5iZiI6MTcwNzMyNzYwMCwiZXhwIjoxNzA3MzMxMjAwLCJhdWQiOiJhcHAuYXBpLnRhbGVudG1hbmFnZW1lbnQiLCJjbGllbnRfaWQiOiJUYWxlbnRNYW5hZ2VtZW50Iiwic3ViIjoiMjQ4Mjg5NzYxMDAxIiwic2NvcGUiOlsiYXBwLmFwaS50YWxlbnRtYW5hZ2VtZW50LnJlYWQiLCJhcHAuYXBpLnRhbGVudG1hbmFnZW1lbnQud3JpdGUiXSwicm9sZSI6WyJIUkFkbWluIiwiTWFuYWdlciJdLCJuYW1lIjoiQXNodHluIERvZSIsImVtYWlsIjoiYXNodHluMUBleGFtcGxlLmNvbSJ9.signature_data_here
```

#### 2.2 Visit JWT.io Decoder

1. Open new browser tab
2. Go to **https://jwt.io**
3. Paste your access token into the **"Encoded"** section (left side)
4. The **"Decoded"** section (right side) automatically shows the token contents

#### 2.3 Examine Token Structure

A JWT has three parts separated by dots (`.`):

```
[HEADER].[PAYLOAD].[SIGNATURE]
```

**HEADER (Algorithm & Key ID):**
```json
{
  "alg": "RS256",
  "kid": "1234567890",
  "typ": "at+jwt"
}
```
- `alg` - Algorithm used to sign token (RSA with SHA-256)
- `kid` - Key ID used to verify signature
- `typ` - Token type (at+jwt = Access Token as JWT)

**PAYLOAD (Claims):**
```json
{
  "iss": "https://localhost:44310",
  "nbf": 1707327600,
  "exp": 1707331200,
  "aud": "app.api.talentmanagement",
  "client_id": "TalentManagement",
  "sub": "248289761001",
  "scope": [
    "app.api.talentmanagement.read",
    "app.api.talentmanagement.write",
    "openid",
    "profile",
    "email",
    "roles"
  ],
  "role": ["HRAdmin", "Manager"],
  "name": "Ashtyn Doe",
  "email": "ashtyn1@example.com"
}
```

**Key Claims:**
- `iss` (issuer) - Who issued this token (IdentityServer URL)
- `aud` (audience) - Who this token is for (API resource name)
- `sub` (subject) - Unique user ID
- `exp` (expiration) - When token expires (Unix timestamp)
- `nbf` (not before) - When token becomes valid
- `scope` - What permissions this token grants
- `role` - User's roles
- `name`, `email` - User profile information

**SIGNATURE:**
- Cryptographic signature that proves token wasn't tampered with
- Generated using IdentityServer's private key
- Verified by API using IdentityServer's public key

---

### Step 3: Inspect API Requests with Bearer Token

#### 3.1 Navigate to Employees Page

In Angular app (keep DevTools open):
1. Click **Employees** in left sidebar
2. Watch Network tab for new requests

#### 3.2 Find API Request

Look for request to:
- URL: `https://localhost:44378/api/v1/Employees`
- Method: GET
- Status: 200 OK

#### 3.3 Examine Authorization Header

Click on the request → **Headers** tab → **Request Headers** section

Find:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI...
```

**This is how APIs receive the access token!**

The Angular HTTP interceptor automatically adds this header to every API request.

**File Reference:** See how this works in:
`Clients/TalentManagement-Angular-Material/talent-management/src/app/core/interceptors/auth.interceptor.ts`

#### 3.4 Compare Token

Copy the token after "Bearer " and paste into jwt.io.

**Verify:**
- It's the same access token from Step 2
- It has the required scopes: `app.api.talentmanagement.read`
- It hasn't expired yet (check `exp` claim)

---

### Step 4: Decode the ID Token

#### 4.1 Find ID Token in Token Response

Go back to the `/connect/token` request response.

Find the `id_token` field (separate from `access_token`).

#### 4.2 Decode ID Token

1. Copy the `id_token` value
2. Paste into https://jwt.io
3. Examine the payload

**ID Token Payload Example:**
```json
{
  "iss": "https://localhost:44310",
  "aud": "TalentManagement",
  "sub": "248289761001",
  "name": "Ashtyn Doe",
  "given_name": "Ashtyn",
  "family_name": "Doe",
  "email": "ashtyn1@example.com",
  "email_verified": true,
  "role": ["HRAdmin", "Manager"],
  "iat": 1707327600,
  "exp": 1707327900,
  "auth_time": 1707327600,
  "amr": ["pwd"]
}
```

#### 4.3 Compare Access Token vs ID Token

| Aspect | Access Token | ID Token |
|--------|--------------|----------|
| **Purpose** | Grant API access | Prove user identity |
| **Audience** | API (`app.api.talentmanagement`) | Client (`TalentManagement`) |
| **Contains** | Scopes, permissions | User identity claims |
| **Lifetime** | Longer (1 hour default) | Shorter (5 min default) |
| **Used By** | API validates it | Client validates it |

---

### Step 5: Test Token Expiration

Now let's see what happens when a token expires.

#### 5.1 Modify Token Lifetime

1. Open `TokenService/Duende-IdentityServer/src/Duende.Admin/identityserverdata.json`
2. Find the `TalentManagement` client configuration
3. Find `AccessTokenLifetime: 3600` (1 hour in seconds)
4. Change to: `AccessTokenLifetime: 60` (1 minute)
5. Save the file

**File location:** `TokenService/Duende-IdentityServer/src/Duende.Admin/identityserverdata.json` (around line 460)

#### 5.2 Restart IdentityServer

1. Go to Terminal 1 (IdentityServer)
2. Press **Ctrl+C** to stop
3. Run `dotnet run` to restart
4. Wait for: `Now listening on: https://localhost:44310`

#### 5.3 Login with New Token

1. In Angular app, logout (if logged in)
2. Login again with `ashtyn1` / `Pa$$word123`
3. Check DevTools Network → `/connect/token` response
4. Verify: `"expires_in": 60` (not 3600)

#### 5.4 Wait for Token to Expire

1. Stay on Employees page (or any page)
2. **Wait 1 minute and 10 seconds** (to ensure token expired)
3. Click to a different page or refresh the list
4. Watch Network tab

**What happens:**
- API request returns **401 Unauthorized**
- Angular shows error or redirects to login
- This is because the access token expired!

#### 5.5 Restore Original Token Lifetime

1. Open `identityserverdata.json` again
2. Change `AccessTokenLifetime` back to: `3600`
3. Save file
4. Restart IdentityServer (Ctrl+C, then `dotnet run`)

---

### Step 6: Understand Token Validation

#### 6.1 How API Validates Tokens

When the API receives a request with `Authorization: Bearer <token>`, it:

1. **Extracts token** from Authorization header
2. **Fetches public key** from IdentityServer (`/.well-known/openid-configuration`)
3. **Verifies signature** using public key (ensures token wasn't tampered)
4. **Checks claims:**
   - `iss` matches IdentityServer URL
   - `aud` matches API resource name
   - `exp` hasn't passed (token not expired)
   - `nbf` has passed (token is valid now)
5. **Checks scopes** match what endpoint requires
6. **Returns 200 OK** if valid, or **401 Unauthorized** if invalid

**File Reference:** See JWT validation configuration in:
`ApiResources/TalentManagement-API/Program.cs` (around line 60-80)

#### 6.2 Test IdentityServer Discovery Endpoint

Open browser to:
```
https://localhost:44310/.well-known/openid-configuration
```

This shows IdentityServer's metadata that APIs use for token validation:
- `issuer` - IdentityServer URL
- `jwks_uri` - Where to get public keys for signature verification
- `token_endpoint` - Where to exchange authorization code for token
- `userinfo_endpoint` - Where to get user information
- Supported scopes, grant types, algorithms

---

## ✅ Verification Checklist

Use this checklist to confirm you completed all steps:

### Token Capture
- [ ] Opened DevTools Network tab
- [ ] Logged in and observed `/connect/authorize` request
- [ ] Found `/connect/token` request with token response
- [ ] Identified `access_token` and `id_token` in response

### Token Decoding
- [ ] Copied access token to jwt.io
- [ ] Examined token header (algorithm, key ID)
- [ ] Examined token payload (issuer, audience, subject, scopes, roles)
- [ ] Understood token structure (header.payload.signature)

### Token Usage
- [ ] Found API request with `Authorization: Bearer` header
- [ ] Confirmed same access token is used for API calls
- [ ] Decoded ID token and compared with access token

### Token Expiration
- [ ] Modified `AccessTokenLifetime` to 60 seconds
- [ ] Restarted IdentityServer
- [ ] Observed token expiration after 1 minute
- [ ] Saw 401 Unauthorized error
- [ ] Restored original token lifetime (3600 seconds)

### Token Validation
- [ ] Accessed `/.well-known/openid-configuration` endpoint
- [ ] Understood how API validates tokens

---

## 🐛 Troubleshooting

### Issue: Can't find `/connect/token` request

**Symptoms:**
- Network tab doesn't show token request
- Only see authorize request

**Solutions:**
1. Ensure **Preserve log** is checked in DevTools
2. Clear network logs and login again
3. Look for XHR or Fetch requests (filter in Network tab)

---

### Issue: jwt.io shows "Invalid Signature"

**Symptoms:**
- jwt.io shows signature verification failed (red)

**Solution:**
This is **normal and expected**! jwt.io doesn't have IdentityServer's public key, so it can't verify the signature. The signature is still valid - only IdentityServer and your API can verify it.

**What the red warning means:**
- jwt.io is warning you it couldn't verify
- Your API **can** verify because it has the public key
- The token is still valid and secure

---

### Issue: Token has already expired

**Symptoms:**
- Decoded token shows `exp` timestamp in the past
- Can't test with the token

**Solution:**
1. Logout and login again to get a fresh token
2. Work quickly after login (tokens expire in 1 hour)
3. Or increase token lifetime temporarily for testing

---

### Issue: 401 Unauthorized immediately after login

**Symptoms:**
- Login succeeds but API calls fail
- Token looks valid

**Solutions:**
1. **Check API is running** - Verify Terminal 2 shows API on port 44378
2. **Check IdentityServer is running** - Verify Terminal 1 shows port 44310
3. **Check scopes match** - Token must have required scope for API
4. **Check audience** - Token `aud` must match API resource name
5. **Clear browser cache** - Old tokens might be cached

---

### Issue: IdentityServer won't restart after config change

**Symptoms:**
- Error when restarting IdentityServer
- Configuration invalid

**Solution:**
1. Check JSON syntax in `identityserverdata.json`
2. Ensure no trailing commas
3. Verify `AccessTokenLifetime` is a number (not string)
4. Restore from backup if needed

---

## 💡 What You Learned

### OAuth 2.0 & OIDC Concepts
- **Authorization Code Flow with PKCE** - How SPAs get tokens securely
- **Token Exchange** - Trading authorization code for access token
- **Access Token vs ID Token** - Different purposes and audiences
- **JWT Structure** - Header, payload, signature
- **Token Claims** - Standard claims (iss, aud, sub, exp) and custom claims (roles, name)

### Debugging Skills
- **How to capture tokens** in DevTools Network tab
- **How to decode JWT tokens** using jwt.io
- **How to inspect HTTP headers** for Authorization
- **How to test token expiration** by modifying lifetime
- **How to troubleshoot authentication** using browser tools

### Security Concepts
- **Token Signing** - How signatures prevent tampering
- **Token Validation** - What APIs check when verifying tokens
- **Token Expiration** - Why short lifetimes improve security
- **Scopes** - How permissions are encoded in tokens
- **Discovery Endpoint** - How clients and APIs find IdentityServer metadata

### Development Workflow
- Tokens are issued by IdentityServer during login
- Angular stores tokens in memory (not localStorage)
- HTTP interceptor adds Bearer token to API requests automatically
- APIs validate tokens on every request
- Expired tokens return 401 Unauthorized

---

## 🚀 Next Steps

### Immediate Next Lab

**[LAB-03: Extend API with New Property](LAB-03-extend-api.md)**

In the next lab, you'll:
- Add a new "Notes" field to the Employee entity
- Create and apply Entity Framework migrations
- Update commands and handlers
- Test your changes using Swagger and tokens!

### Deepen Your Understanding

- Read [Part 2: Token Service Deep Dive](../02-token-service-deep-dive.md) for complete OAuth 2.0 theory
- Read [Part 3: API Resource Deep Dive](../03-api-resource-deep-dive.md) to understand JWT validation in the API

---

## 🎯 Bonus Challenges

### Challenge 1: Inspect Refresh Token Flow
**Difficulty:** Medium

Angular uses silent refresh to get new access tokens without re-login.

**Tasks:**
1. Stay logged in for more than 1 hour
2. Watch DevTools Network for `/connect/token` requests
3. Look for `grant_type: refresh_token` in request body
4. Observe new access token issued without redirect to login page

**What you'll learn:** How refresh tokens enable long sessions without constant re-authentication

---

### Challenge 2: Test Invalid Token
**Difficulty:** Medium

See what happens when you send a tampered token.

**Tasks:**
1. Copy a valid access token from DevTools
2. Paste into jwt.io
3. Change a claim (e.g., change role from "HRAdmin" to "SuperAdmin")
4. Copy the modified token from jwt.io
5. Use DevTools → Network tab → Right-click API request → Edit and Resend
6. Replace Authorization header with modified token
7. Observe API response

**Expected:** 401 Unauthorized (signature validation fails)

**What you'll learn:** Why token signatures are critical for security

---

### Challenge 3: Compare User Claims
**Difficulty:** Easy

**Tasks:**
1. Login as `ashtyn1`
2. Decode access token and note the roles
3. Logout
4. Try logging in as different user (if you create one in IdentityServer Admin)
5. Compare tokens - different `sub`, different roles?

**What you'll learn:** How tokens differ per user

---

### Challenge 4: Explore Scope-Based Authorization
**Difficulty:** Advanced

**Tasks:**
1. Open `identityserverdata.json`
2. Remove `app.api.talentmanagement.write` from `AllowedScopes`
3. Restart IdentityServer
4. Login and get new token
5. Decode token - verify write scope is missing
6. Try to POST/PUT/DELETE in Swagger
7. Observe 403 Forbidden (even though authenticated)

**Restore:** Add write scope back and restart

**What you'll learn:** Difference between authentication (401) and authorization (403)

---

## 🆘 Need Help?

### If You're Stuck
1. Check [Troubleshooting section](#-troubleshooting) above
2. Review [Part 2: Token Service Deep Dive](../02-token-service-deep-dive.md)
3. Check [Solution Document](solutions/lab-02-solution.md) for hints
4. Post in GitHub Discussions with your specific issue

### Common Questions

**Q: Why does jwt.io show "Invalid Signature" in red?**
A: jwt.io doesn't have IdentityServer's public key. This is normal - your API can verify it.

**Q: Can I decode tokens in production?**
A: You can decode the structure, but never log or expose token values in production. They're secrets!

**Q: Why are token lifetimes so short?**
A: Security! If a token is stolen, it only works for 1 hour max. Refresh tokens allow longer sessions securely.

**Q: Where are tokens stored in Angular?**
A: In memory (using `angular-oauth2-oidc` library). Not in localStorage for security.

---

**Congratulations!** 🎉 You now understand JWT tokens and OAuth 2.0 authentication at the HTTP level!

**Ready to build API features?** Continue to **[LAB-03: Extend API](LAB-03-extend-api.md)**

---

*Part of the [CAT Pattern Tutorial Series](../TUTORIAL.md)*
*Last Updated: February 2026*
