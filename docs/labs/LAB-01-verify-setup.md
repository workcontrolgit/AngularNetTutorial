# LAB-01: Verify Setup & First Code Change

## 🎯 Objective

Confirm your development environment is correctly configured and make your first code change to build confidence navigating the project.

**What you'll accomplish:**
- ✅ Clone repository and initialize Git submodules correctly
- ✅ Verify all three services (IdentityServer, API, Angular) are running
- ✅ Test authentication flow end-to-end
- ✅ Make a simple UI change and see hot-reload
- ✅ Inspect HTTP requests with browser DevTools
- ✅ Navigate the project structure confidently
- ✅ Understand how Git submodules work in the CAT pattern

---

## 📋 Prerequisites

**Before Starting This Lab:**

- ✅ Read [Part 1: Foundation](../01-foundation.md) tutorial (understand CAT pattern)
- ✅ .NET SDK 10.0+ installed ([Download](https://dotnet.microsoft.com/download))
- ✅ Node.js 20.x LTS installed ([Download](https://nodejs.org/))
- ✅ Git installed ([Download](https://git-scm.com/))
- ✅ Code editor installed (VS Code recommended: [Download](https://code.visualstudio.com/))
- ✅ Browser with DevTools (Chrome or Edge recommended)

**⚠️ Important:** This project uses **Git submodules**. Don't skip Step 0!

---

## ⏱️ Duration

**15-20 minutes**

---

## 🚀 Steps

### Step 0: Clone Repository and Initialize Submodules

**⚠️ IMPORTANT:** This tutorial uses Git submodules. Each component (Angular, API, IdentityServer) is in its own repository. You must initialize submodules before starting.

#### Option A: Clone with Submodules (Recommended for New Setup)

If you haven't cloned the repository yet:

```bash
# Clone the main repository with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git

# Navigate into the repository
cd AngularNetTutotial
```

**Expected output:**
```
Cloning into 'AngularNetTutotial'...
Submodule 'ApiResources/TalentManagement-API' (https://github.com/workcontrolgit/TalentManagement-API.git) registered for path 'ApiResources/TalentManagement-API'
Submodule 'Clients/TalentManagement-Angular-Material' (https://github.com/workcontrolgit/TalentManagement-Angular-Material.git) registered for path 'Clients/TalentManagement-Angular-Material'
Submodule 'TokenService/Duende-IdentityServer' (https://github.com/workcontrolgit/Duende-IdentityServer.git) registered for path 'TokenService/Duende-IdentityServer'
```

#### Option B: Initialize Submodules (If Already Cloned)

If you already cloned the repository but submodule folders are empty:

```bash
# Navigate to the repository root
cd AngularNetTutotial

# Initialize and clone all submodules
git submodule update --init --recursive
```

**Expected output:**
```
Submodule path 'ApiResources/TalentManagement-API': checked out '...'
Submodule path 'Clients/TalentManagement-Angular-Material': checked out '...'
Submodule path 'TokenService/Duende-IdentityServer': checked out '...'
```

#### Verify Submodules Are Initialized

Check that submodule folders contain files (not empty):

```bash
# Check submodule status
git submodule status
```

**Expected output (with commit hashes):**
```
 7a3b2c1d... Clients/TalentManagement-Angular-Material (heads/develop)
 8e4f9a2b... ApiResources/TalentManagement-API (heads/master)
 9c5d6e3f... TokenService/Duende-IdentityServer (heads/master)
```

**Verify folders are not empty:**
```bash
# Windows
dir Clients\TalentManagement-Angular-Material
dir ApiResources\TalentManagement-API
dir TokenService\Duende-IdentityServer

# Mac/Linux
ls -la Clients/TalentManagement-Angular-Material
ls -la ApiResources/TalentManagement-API
ls -la TokenService/Duende-IdentityServer
```

Each folder should contain files (not be empty).

#### Troubleshooting Submodules

**Problem: Submodule folders are empty**

**Solution 1:** Initialize submodules
```bash
git submodule update --init --recursive
```

**Solution 2:** If still empty, force update
```bash
git submodule sync --recursive
git submodule update --init --force --recursive
```

**Problem: "fatal: not a git repository"**

**Solution:** Ensure you're in the repository root folder
```bash
# Check current directory
pwd  # Mac/Linux
cd   # Windows

# Should be: /path/to/AngularNetTutotial
```

**Problem: Submodules show "detached HEAD" state**

**Solution:** This is normal for submodules. Each submodule points to a specific commit.
```bash
# To work on a submodule, navigate to it and checkout a branch
cd Clients/TalentManagement-Angular-Material
git checkout develop
cd ../..
```

**Problem: "Permission denied (publickey)"**

**Solution:** Configure Git credentials
```bash
# Use HTTPS instead of SSH
git config --global url."https://github.com/".insteadOf git@github.com:
git submodule update --init --recursive
```

---

### Step 1: Start All Three Services

Now that submodules are initialized, let's start all three services.

Open **three separate terminal windows**.

#### Terminal 1: Start IdentityServer (Token Service)

```bash
cd TokenService/Duende-IdentityServer/src/Duende.STS.Identity
dotnet restore
dotnet run
```

**Wait for:**
```
Now listening on: https://localhost:44310
```

**Verify:**
Open browser to `https://localhost:44310` → Should see IdentityServer login page

**Troubleshooting:**
- **Error: "Port already in use"** → Kill existing process: `netstat -ano | findstr :44310` then `taskkill /PID <pid> /F`
- **Error: "Unable to configure HTTPS"** → Run `dotnet dev-certs https --trust`

---

#### Terminal 2: Start API Resource (Backend)

```bash
cd ApiResources/TalentManagement-API
dotnet restore
dotnet run
```

**Wait for:**
```
Now listening on: https://localhost:44378
```

**Verify:**
Open browser to `https://localhost:44378/swagger` → Should see Swagger UI with API endpoints

**Troubleshooting:**
- **Error: "Database connection failed"** → Check `appsettings.json` connection string
- **Error: "IdentityServer authority unreachable"** → Ensure IdentityServer (Terminal 1) is running

---

#### Terminal 3: Start Angular Client (Frontend)

```bash
cd Clients/TalentManagement-Angular-Material/talent-management
npm install  # Only needed first time
npm start
```

**Wait for:**
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200
```

**Verify:**
Open browser to `http://localhost:4200` → Should see Angular dashboard

**Troubleshooting:**
- **Error: "npm not found"** → Install Node.js from https://nodejs.org
- **Error: "Module not found"** → Delete `node_modules` and run `npm install` again

---

### Step 2: Test Authentication Flow

#### 2.1 Open DevTools Before Login

1. Open `http://localhost:4200` in browser
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Ensure **Preserve log** is checked

#### 2.2 Perform Login

1. Click **Sign In** (top-right user menu)
2. You'll be redirected to IdentityServer (`https://localhost:44310`)
3. Enter credentials:
   - **Username:** `ashtyn1`
   - **Password:** `Pa$$word123`
4. Click **Login**
5. You'll be redirected back to Angular (`http://localhost:4200`)

#### 2.3 Observe Network Activity

In DevTools Network tab, you should see:

1. **authorize** request to IdentityServer → Returns authorization code
2. **token** request to IdentityServer → Exchanges code for access token
3. **Employees** request to API → Uses Bearer token in Authorization header

#### 2.4 Inspect an API Request

1. In Network tab, find request to `https://localhost:44378/api/v1/Employees`
2. Click on it
3. Go to **Headers** tab
4. Find **Request Headers** section
5. Look for: `Authorization: Bearer eyJhbGc...`

**This is the JWT access token!** We'll decode this in LAB-02.

---

### Step 3: Make Your First Code Change

Now let's modify the Angular dashboard title to verify hot-reload works.

#### 3.1 Open Dashboard Component

**File:** `Clients/TalentManagement-Angular-Material/talent-management/src/app/routes/dashboard/dashboard.component.ts`

**Navigate to:**
- If using VS Code: Press `Ctrl+P` → Type `dashboard.component.ts` → Press Enter
- Or browse folders: `Clients` → `TalentManagement-Angular-Material` → `talent-management` → `src` → `app` → `routes` → `dashboard`

#### 3.2 Modify the Page Title

**Find this line (around line 23):**
```typescript
pageTitle = 'Dashboard';
```

**Change it to:**
```typescript
pageTitle = 'Dashboard - Welcome to CAT Pattern!';
```

**Save the file** (`Ctrl+S`)

#### 3.3 Observe Hot-Reload

Watch your browser at `http://localhost:4200`:

- Angular automatically detects the change
- Page reloads within 2-3 seconds
- Dashboard title now shows: **"Dashboard - Welcome to CAT Pattern!"**

**Success!** You've verified hot-reload works.

---

### Step 4: Navigate to Employee List

#### 4.1 Open Employees Page

In Angular app, click:
**Employees** (in left sidebar) → You should see employee list with table

#### 4.2 Inspect Table Data

In DevTools Network tab:
1. Find request to `https://localhost:44378/api/v1/Employees`
2. Click on it
3. Go to **Response** tab
4. See JSON data with employee records

**Example response:**
```json
{
  "succeeded": true,
  "message": null,
  "errors": null,
  "value": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      ...
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalRecords": 50
}
```

---

### Step 5: Explore Project Structure

#### 5.1 Angular Client Structure

```
Clients/TalentManagement-Angular-Material/talent-management/
├── src/
│   ├── app/
│   │   ├── core/                   # Core services (auth, interceptors)
│   │   │   ├── authentication/     # OIDC auth service, guards
│   │   │   └── interceptors/       # HTTP interceptors (add Bearer token)
│   │   ├── routes/                 # Feature routes (dashboard, employees)
│   │   ├── shared/                 # Shared components, pipes
│   │   ├── services/               # API services (employee, department)
│   │   ├── models/                 # TypeScript interfaces
│   │   └── config/                 # Auth configuration
│   └── environments/               # Environment configs (URLs, clientId)
```

#### 5.2 API Resource Structure

```
ApiResources/TalentManagement-API/
├── TalentManagementAPI.Domain/     # Entities, enums, value objects
├── TalentManagementAPI.Application/ # Commands, queries, DTOs
├── TalentManagementAPI.Infrastructure.Persistence/  # EF Core, repositories
└── TalentManagementAPI.WebApi/     # Controllers, startup
```

#### 5.3 Token Service Structure

```
TokenService/Duende-IdentityServer/
└── src/
    ├── Duende.STS.Identity/        # Login UI, OIDC endpoints
    ├── Duende.Admin/               # Admin UI (https://localhost:44303)
    └── Duende.Admin.Api/           # Admin API
```

---

## ✅ Verification Checklist

Use this checklist to confirm you completed all steps:

### Repository & Submodules
- [ ] Repository cloned successfully
- [ ] All submodule folders contain files (not empty)
- [ ] `git submodule status` shows commits for all three submodules
- [ ] Can navigate into each submodule folder

### Services Running
- [ ] IdentityServer running at `https://localhost:44310`
- [ ] API running at `https://localhost:44378`
- [ ] Swagger UI accessible at `https://localhost:44378/swagger`
- [ ] Angular running at `http://localhost:4200`

### Authentication
- [ ] Can click "Sign In" in Angular
- [ ] Redirected to IdentityServer login page
- [ ] Can login with `ashtyn1` / `Pa$$word123`
- [ ] Redirected back to Angular dashboard
- [ ] Can see employee list (authenticated)

### DevTools Inspection
- [ ] Opened DevTools Network tab
- [ ] Observed `authorize` request to IdentityServer
- [ ] Observed `token` request to IdentityServer
- [ ] Found `Authorization: Bearer eyJ...` header in API requests

### Code Change
- [ ] Modified dashboard title in `dashboard.component.ts`
- [ ] Saved file and observed hot-reload
- [ ] New title displayed in browser

### Navigation
- [ ] Can navigate to Employees page
- [ ] Employee table loads with data
- [ ] Can see API response in DevTools

---

## 🐛 Troubleshooting

### Issue: IdentityServer won't start

**Symptoms:**
- Error: "Failed to bind to address https://localhost:44310"
- Terminal shows port conflict

**Solutions:**
1. Check if port already in use:
   ```bash
   # Windows
   netstat -ano | findstr :44310

   # Mac/Linux
   lsof -i :44310
   ```
2. Kill existing process or change port in `Properties/launchSettings.json`

---

### Issue: Angular shows blank page

**Symptoms:**
- Browser shows white screen
- Console shows errors about missing modules

**Solutions:**
1. Check browser console (F12) for errors
2. Verify `npm install` completed successfully
3. Delete `node_modules` folder and run `npm install` again
4. Check that API and IdentityServer are running

---

### Issue: "401 Unauthorized" when accessing API

**Symptoms:**
- Employee list doesn't load
- Network tab shows 401 status code
- Console shows CORS errors

**Solutions:**
1. Verify IdentityServer is running (Terminal 1)
2. Check `environment.ts` has correct `identityServerUrl`: `https://localhost:44310`
3. Check `appsettings.json` in API has correct Authority: `https://localhost:44310`
4. Clear browser cache and try logging in again

---

### Issue: Hot-reload not working

**Symptoms:**
- Changed code but browser doesn't update
- Have to manually refresh browser

**Solutions:**
1. Check that Angular dev server is still running (Terminal 3)
2. Look for compilation errors in terminal
3. Try saving file again (`Ctrl+S`)
4. If still not working, stop Angular (`Ctrl+C`) and restart with `npm start`

---

## 🎉 Success Criteria

You've successfully completed LAB-01 if:

✅ All three services start without errors
✅ You can login and see authenticated content
✅ You can inspect HTTP requests and see Bearer tokens
✅ You made a code change and saw hot-reload in action
✅ You can navigate the project folders confidently

---

## 🚀 Next Steps

### Immediate Next Lab

**[LAB-02: Inspect JWT Tokens with DevTools](LAB-02-inspect-tokens.md)**

In the next lab, you'll:
- Decode the JWT access token you saw in this lab
- Understand token structure and claims
- Modify token lifetime and test expiration
- Debug authentication issues like a pro

### Alternative Path

If you want to dive deeper into architecture before more labs:
- Review [Part 2: Token Service Deep Dive](../02-token-service-deep-dive.md)
- Review [Part 3: API Resource Deep Dive](../03-api-resource-deep-dive.md)

---

## 💡 What You Learned

### Technical Skills
- **How Git submodules work** - Each component in its own repository
- **How to initialize submodules** - Using `git submodule update --init --recursive`
- How to start multiple services for full-stack development
- How to use browser DevTools Network tab effectively
- How hot-reload works in Angular
- How JWT Bearer tokens are sent in HTTP headers
- How to navigate a multi-repository project structure

### CAT Pattern Concepts
- **Client** (Angular) makes HTTP requests with Bearer token
- **API Resource** (Web API) validates token and returns data
- **Token Service** (IdentityServer) issues tokens after authentication
- All three components must be running for the app to work
- **Git submodules** keep each tier in separate repositories (independent development)

### Development Workflow
- **Initialize submodules first** - Required before any development work
- Always start services in order: IdentityServer → API → Angular
- Use DevTools to debug HTTP requests and responses
- Hot-reload speeds up development (no manual refresh needed)
- Each submodule can be developed independently by different teams

---

## 🆘 Need Help?

### If You're Stuck
1. Check the [Troubleshooting section](#-troubleshooting) above
2. Review [Part 1: Foundation](../01-foundation.md) tutorial
3. Check [Solution Document](solutions/lab-01-solution.md) for complete answers
4. Post in GitHub Discussions with your specific error message

### Common Questions

**Q: Do I need to restart services when switching labs?**
A: No, keep them running. Only restart if you change configuration files.

**Q: Can I use different ports?**
A: Yes, but update `environment.ts`, `appsettings.json`, and `identityserverdata.json` consistently.

**Q: Where are user credentials stored?**
A: In IdentityServer database (seeded from `identitydata.json`). More in LAB-02.

---

## 🎯 Bonus Challenges

Want to go further? Try these optional tasks:

### Challenge 1: Change the Welcome Message
**Difficulty:** Easy
- Find the dashboard component HTML template
- Change "Welcome back!" to a custom message
- Observe hot-reload

**Hint:** Look for `dashboard.component.html`

### Challenge 2: Add a Console Log
**Difficulty:** Easy
- Add `console.log('Dashboard loaded!')` in `ngOnInit()` of dashboard component
- Save and check browser console (F12)

**Hint:** Find the `ngOnInit()` lifecycle hook

### Challenge 3: Inspect ID Token
**Difficulty:** Medium
- In DevTools, find the token response from IdentityServer
- Look for `id_token` in response (separate from `access_token`)
- Copy it to https://jwt.io and decode
- What claims do you see?

**Hint:** ID token contains user identity info (name, email, roles)

### Challenge 4: Explore IdentityServer Admin
**Difficulty:** Medium
- Navigate to `https://localhost:44303`
- Login with `admin` / `Pa$$word123`
- Explore Clients, API Resources, Users
- Find the `TalentManagement` client configuration

**Hint:** This is covered in [Part 2](../02-token-service-deep-dive.md)

### Challenge 5: Understand Submodule Structure
**Difficulty:** Medium
- Run `git remote -v` in the main repository
- Navigate into `Clients/TalentManagement-Angular-Material`
- Run `git remote -v` inside the submodule
- Notice it points to a different repository!
- Check current branch: `git branch`
- Try: `git log --oneline -5` to see submodule's commit history

**What you'll discover:**
- Each submodule is a complete Git repository
- Submodules point to specific commits (detached HEAD)
- Main repository only stores references to submodule commits
- Teams can work on submodules independently

**Hint:** See [Part 5: Advanced Topics](../05-advanced-topics.md) for Git submodules workflow

---

**Congratulations!** 🎉 You've completed LAB-01 and verified your development environment works correctly.

**Ready for the next challenge?** Continue to **[LAB-02: Inspect JWT Tokens](LAB-02-inspect-tokens.md)**

---

*Part of the [CAT Pattern Tutorial Series](../TUTORIAL.md)*
*Last Updated: February 2026*
