# Part 5: Advanced Topics — Git Submodules, Testing, Deployment, and Production

## Building Modern Web Applications with Angular, .NET, and OAuth 2.0

**[← Part 4: Angular Client](04-angular-client-deep-dive.md)** | **[Tutorial Home](TUTORIAL.md)** | **[Part 6: Real-World Features →](06-real-world-features.md)**

---

## 🚀 Introduction

This guide covers advanced topics essential for taking your CAT pattern application from development to production:

* **Git Submodules** — Managing multi-repository architecture
* **Testing Strategies** — Unit, integration, and end-to-end testing
* **CI/CD Pipelines** — Automated builds and deployments
* **Docker Containerization** — Consistent environments across dev and production
* **Production Deployment** — Azure, AWS, and on-premise options
* **Monitoring & Logging** — Application insights and observability
* **Performance Optimization** — Scaling and optimization techniques
* **Security Hardening** — Production security best practices

---

## 📦 Git Submodules Deep Dive

### Why Use Git Submodules?

The CAT pattern uses Git submodules to keep each component in its own repository while maintaining a parent repository that ties everything together.

**Benefits:**
✅ Independent version control for each component
✅ Teams can work on components independently
✅ Easy to share components across projects
✅ Clear separation of concerns
✅ Flexible deployment (deploy components separately)

**Trade-offs:**
❌ More complex than monorepo
❌ Requires understanding of submodule commands
❌ Can be confusing for team members new to submodules

### Working with Submodules

**Initial Clone:**

```bash
# Clone with all submodules
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutorial.git

# If already cloned without submodules
git submodule update --init --recursive
```

**Checking Submodule Status:**

```bash
# View current commit for each submodule
git submodule status

# Output example:
# 7a3b2c1d... Clients/TalentManagement-Angular-Material (heads/develop)
# 8e4f9a2b... ApiResources/TalentManagement-API (heads/master)
# 9c5d6e3f... TokenService/Duende-IdentityServer (heads/master)
```

**Making Changes in a Submodule:**

```bash
# 1. Navigate to submodule
cd Clients/TalentManagement-Angular-Material

# 2. Check out the branch you want to work on
git checkout develop

# 3. Make your changes
# ... edit files ...

# 4. Commit changes in the submodule
git add .
git commit -m "Add new employee feature"
git push origin develop

# 5. Return to parent repository
cd ../..

# 6. Update parent to reference new commit
git add Clients/TalentManagement-Angular-Material
git commit -m "Update Angular client submodule to latest"
git push
```

**Updating Submodules to Latest:**

```bash
# Pull latest changes in parent
git pull

# Update all submodules to their latest commits
git submodule update --remote --merge

# Or update specific submodule
git submodule update --remote --merge Clients/TalentManagement-Angular-Material
```

**Common Submodule Workflows:**

**Workflow 1: Update parent after submodule changes**
```bash
cd ApiResources/TalentManagement-API
git pull origin master
cd ../..
git add ApiResources/TalentManagement-API
git commit -m "Update API submodule"
git push
```

**Workflow 2: Switch submodule branches**
```bash
cd Clients/TalentManagement-Angular-Material
git fetch
git checkout feature/new-dashboard
cd ../..
git add Clients/TalentManagement-Angular-Material
git commit -m "Switch Angular client to new dashboard feature"
```

**Workflow 3: Clone and immediately start working**
```bash
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutorial.git
cd AngularNetTutorial/Clients/TalentManagement-Angular-Material
git checkout develop
# Start working...
```

---

## 🧪 Testing Strategies

### Testing Pyramid

The testing pyramid shows the recommended distribution of tests:

**End-to-End Tests (10%)** — Full application testing
* **Tools:** Playwright, Cypress
* **Purpose:** Verify complete user flows
* **Example:** Login → Navigate → Create Employee → Verify in list

**Integration Tests (20%)** — Component interaction testing
* **Tools:** .NET WebApplicationFactory, Angular TestBed
* **Purpose:** Test multiple components together
* **Example:** Controller → Service → Database

**Unit Tests (70%)** — Individual component testing
* **Tools:** xUnit, Jasmine, Jest
* **Purpose:** Test business logic in isolation
* **Example:** Validator, service method, pure function

### .NET API Testing

**Unit Test Example:**

```csharp
using Xunit;
using FluentAssertions;
using TalentManagement.Application.Employees.Commands.CreateEmployee;

namespace TalentManagement.Application.Tests.Employees
{
    public class CreateEmployeeCommandValidatorTests
    {
        private readonly CreateEmployeeCommandValidator _validator;

        public CreateEmployeeCommandValidatorTests()
        {
            _validator = new CreateEmployeeCommandValidator();
        }

        [Fact]
        public void Should_Have_Error_When_FirstName_Is_Empty()
        {
            // Arrange
            var command = new CreateEmployeeCommand { FirstName = "" };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
        }

        [Theory]
        [InlineData("test@example.com", true)]
        [InlineData("invalid-email", false)]
        [InlineData("", false)]
        public void Should_Validate_Email_Format(string email, bool expected)
        {
            // Arrange
            var command = new CreateEmployeeCommand
            {
                FirstName = "John",
                LastName = "Doe",
                Email = email,
                DateOfBirth = DateTime.Now.AddYears(-25),
                HireDate = DateTime.Now
            };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().Be(expected);
        }
    }
}
```

**Integration Test Example:**

```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;

namespace TalentManagement.WebApi.Tests.Integration
{
    public class EmployeesControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public EmployeesControllerTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetEmployees_WithoutAuth_Returns401()
        {
            // Act
            var response = await _client.GetAsync("/api/v1/employees");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetEmployees_WithValidToken_ReturnsEmployees()
        {
            // Arrange
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", GetValidTestToken());

            // Act
            var response = await _client.GetAsync("/api/v1/employees");
            var employees = await response.Content.ReadFromJsonAsync<List<EmployeeDto>>();

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            employees.Should().NotBeNull();
        }
    }
}
```

### Angular Testing

**Component Test Example:**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeService } from '../../../core/services/employee.service';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmployeeService', ['createEmployee', 'getEmployee']);

    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: EmployeeService, useValue: spy }
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('firstName')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
  });

  it('should mark form invalid when required fields empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should call createEmployee on submit', () => {
    // Arrange
    component.form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dateOfBirth: new Date('1990-01-01'),
      hireDate: new Date(),
      departmentId: 1
    });
    employeeService.createEmployee.and.returnValue(of(123));

    // Act
    component.onSubmit();

    // Assert
    expect(employeeService.createEmployee).toHaveBeenCalled();
  });
});
```

### E2E Testing with Playwright

**Installation:**

```bash
npm init playwright@latest
```

**E2E Test Example:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');

    // Login
    await page.click('button:has-text("Login")');
    await page.fill('input[name="username"]', 'ashtyn1');
    await page.fill('input[name="password"]', 'Pa$$word123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/dashboard');
  });

  test('should create new employee', async ({ page }) => {
    // Navigate to employees
    await page.click('a:has-text("Employees")');
    await expect(page).toHaveURL('**/employees');

    // Click add button
    await page.click('button:has-text("Add Employee")');

    // Fill form
    await page.fill('input[formControlName="firstName"]', 'Jane');
    await page.fill('input[formControlName="lastName"]', 'Smith');
    await page.fill('input[formControlName="email"]', 'jane.smith@example.com');
    await page.fill('input[formControlName="phoneNumber"]', '555-1234');

    // Select department
    await page.click('mat-select[formControlName="departmentId"]');
    await page.click('mat-option:has-text("IT")');

    // Submit
    await page.click('button:has-text("Save")');

    // Verify redirect to list
    await expect(page).toHaveURL('**/employees');

    // Verify employee in list
    await expect(page.locator('table')).toContainText('Jane Smith');
  });

  test('should edit employee', async ({ page }) => {
    await page.goto('http://localhost:4200/employees');

    // Click edit button for first employee
    await page.click('button[matTooltip="Edit"]');

    // Update email
    await page.fill('input[formControlName="email"]', 'updated@example.com');

    // Save
    await page.click('button:has-text("Save")');

    // Verify update
    await expect(page.locator('table')).toContainText('updated@example.com');
  });
});
```

**Run E2E Tests:**

```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test employee-management.spec.ts

# Debug mode
npx playwright test --debug
```

---

## 🐳 Docker Containerization

### Why Docker?

**Benefits:**
✅ Consistent environments (dev, staging, production)
✅ Easy deployment and scaling
✅ Isolation from host system
✅ Version control for infrastructure
✅ Simplified CI/CD pipelines

### Dockerfiles

**Angular Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist/talent-management /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf for Angular:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**.NET API Dockerfile:**

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy solution and project files
COPY ["src/TalentManagement.WebApi/TalentManagement.WebApi.csproj", "src/TalentManagement.WebApi/"]
COPY ["src/TalentManagement.Application/TalentManagement.Application.csproj", "src/TalentManagement.Application/"]
COPY ["src/TalentManagement.Domain/TalentManagement.Domain.csproj", "src/TalentManagement.Domain/"]
COPY ["src/TalentManagement.Infrastructure/TalentManagement.Infrastructure.csproj", "src/TalentManagement.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/TalentManagement.WebApi/TalentManagement.WebApi.csproj"

# Copy remaining source code
COPY . .

# Build application
WORKDIR "/src/src/TalentManagement.WebApi"
RUN dotnet build "TalentManagement.WebApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "TalentManagement.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "TalentManagement.WebApi.dll"]
```

**IdentityServer Dockerfile:**

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["src/Duende.STS.Identity/Duende.STS.Identity.csproj", "src/Duende.STS.Identity/"]
RUN dotnet restore "src/Duende.STS.Identity/Duende.STS.Identity.csproj"

COPY . .
WORKDIR "/src/src/Duende.STS.Identity"
RUN dotnet build "Duende.STS.Identity.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Duende.STS.Identity.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "Duende.STS.Identity.dll"]
```

### Docker Compose

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  # SQL Server Database
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password123
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    healthcheck:
      test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -Q "SELECT 1"
      interval: 10s
      timeout: 3s
      retries: 10

  # IdentityServer
  identityserver:
    build:
      context: ./TokenService/Duende-IdentityServer
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=https://+:443;http://+:80
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=IdentityServerDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
    ports:
      - "44310:443"
      - "5000:80"
    depends_on:
      sqlserver:
        condition: service_healthy
    volumes:
      - ./TokenService/Duende-IdentityServer/certs:/app/certs:ro

  # Web API
  api:
    build:
      context: ./ApiResources/TalentManagement-API
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=https://+:443;http://+:80
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=TalentManagementDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
      - IdentityServer__Authority=https://identityserver:443
    ports:
      - "44378:443"
      - "5001:80"
    depends_on:
      - sqlserver
      - identityserver

  # Angular Client
  angular:
    build:
      context: ./Clients/TalentManagement-Angular-Material/talent-management
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - api
      - identityserver

volumes:
  sqlserver-data:
```

**Running with Docker Compose:**

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 🔄 CI/CD Pipelines

### GitHub Actions

**.github/workflows/api-ci.yml:**

```yaml
name: API CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'ApiResources/TalentManagement-API/**'
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
      with:
        submodules: recursive

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '10.0.x'

    - name: Restore dependencies
      run: dotnet restore ApiResources/TalentManagement-API

    - name: Build
      run: dotnet build ApiResources/TalentManagement-API --no-restore

    - name: Run tests
      run: dotnet test ApiResources/TalentManagement-API --no-build --verbosity normal

    - name: Build Docker image
      if: github.ref == 'refs/heads/main'
      run: |
        cd ApiResources/TalentManagement-API
        docker build -t talentmanagement-api:${{ github.sha }} .

    - name: Push to Docker Hub
      if: github.ref == 'refs/heads/main'
      run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        docker tag talentmanagement-api:${{ github.sha }} ${{ secrets.DOCKER_USERNAME }}/talentmanagement-api:latest
        docker push ${{ secrets.DOCKER_USERNAME }}/talentmanagement-api:latest
```

**.github/workflows/angular-ci.yml:**

```yaml
name: Angular CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'Clients/TalentManagement-Angular-Material/**'
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
      with:
        submodules: recursive

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install dependencies
      run: |
        cd Clients/TalentManagement-Angular-Material/talent-management
        npm ci

    - name: Lint
      run: |
        cd Clients/TalentManagement-Angular-Material/talent-management
        npm run lint

    - name: Run tests
      run: |
        cd Clients/TalentManagement-Angular-Material/talent-management
        npm run test -- --watch=false --browsers=ChromeHeadless

    - name: Build
      run: |
        cd Clients/TalentManagement-Angular-Material/talent-management
        npm run build -- --configuration production

    - name: Build Docker image
      if: github.ref == 'refs/heads/main'
      run: |
        cd Clients/TalentManagement-Angular-Material/talent-management
        docker build -t talentmanagement-angular:${{ github.sha }} .
```

---

## ☁️ Production Deployment

### Azure Deployment

**Deploying to Azure App Service:**

**1. Create Azure Resources:**

```bash
# Create resource group
az group create --name rg-talentmanagement --location eastus

# Create App Service Plan
az appservice plan create \
  --name plan-talentmanagement \
  --resource-group rg-talentmanagement \
  --sku B1 \
  --is-linux

# Create Web Apps
az webapp create \
  --resource-group rg-talentmanagement \
  --plan plan-talentmanagement \
  --name api-talentmanagement \
  --runtime "DOTNET|10.0"

az webapp create \
  --resource-group rg-talentmanagement \
  --plan plan-talentmanagement \
  --name identityserver-talentmanagement \
  --runtime "DOTNET|10.0"

# Create Azure SQL Database
az sql server create \
  --name sql-talentmanagement \
  --resource-group rg-talentmanagement \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourStrong@Password123

az sql db create \
  --resource-group rg-talentmanagement \
  --server sql-talentmanagement \
  --name TalentManagementDb \
  --service-objective S0
```

**2. Configure App Settings:**

```bash
# Set connection string
az webapp config connection-string set \
  --resource-group rg-talentmanagement \
  --name api-talentmanagement \
  --settings DefaultConnection="Server=tcp:sql-talentmanagement.database.windows.net,1433;Database=TalentManagementDb;User ID=sqladmin;Password=YourStrong@Password123;Encrypt=True;TrustServerCertificate=False;" \
  --connection-string-type SQLAzure

# Set app settings
az webapp config appsettings set \
  --resource-group rg-talentmanagement \
  --name api-talentmanagement \
  --settings IdentityServer__Authority=https://identityserver-talentmanagement.azurewebsites.net
```

**3. Deploy from GitHub Actions:**

Add to workflow file:

```yaml
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'api-talentmanagement'
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
    package: './publish'
```

### AWS Deployment

**Using AWS Elastic Beanstalk:**

```bash
# Initialize EB CLI
eb init -p "Docker running on 64bit Amazon Linux 2023" talent-management-api

# Create environment
eb create production-env

# Deploy
eb deploy

# Set environment variables
eb setenv ASPNETCORE_ENVIRONMENT=Production \
  ConnectionStrings__DefaultConnection="Server=..." \
  IdentityServer__Authority="https://..."
```

---

## 📊 Monitoring & Logging

### Application Insights (.NET)

**Install NuGet Package:**

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

**Configure in Program.cs:**

```csharp
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});
```

**Custom Telemetry:**

```csharp
public class EmployeesController : ControllerBase
{
    private readonly TelemetryClient _telemetry;

    public EmployeesController(TelemetryClient telemetry)
    {
        _telemetry = telemetry;
    }

    [HttpPost]
    public async Task<ActionResult> CreateEmployee(CreateEmployeeCommand command)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var result = await _mediator.Send(command);

            _telemetry.TrackEvent("EmployeeCreated", new Dictionary<string, string>
            {
                { "EmployeeId", result.ToString() },
                { "Department", command.DepartmentId.ToString() }
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _telemetry.TrackException(ex);
            throw;
        }
        finally
        {
            stopwatch.Stop();
            _telemetry.TrackMetric("EmployeeCreation_Duration", stopwatch.ElapsedMilliseconds);
        }
    }
}
```

### Structured Logging with Serilog

**Install Packages:**

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Seq
```

**Configure:**

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/app-.txt", rollingInterval: RollingInterval.Day)
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();
```

---

## ⚡ Performance Optimization

### API Optimization

**1. Enable Response Caching:**

```csharp
builder.Services.AddResponseCaching();

app.UseResponseCaching();

[HttpGet]
[ResponseCache(Duration = 60)] // Cache for 60 seconds
public async Task<ActionResult<List<EmployeeDto>>> GetEmployees()
{
    return Ok(await _mediator.Send(new GetEmployeesQuery()));
}
```

**2. Enable Response Compression:**

```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});

app.UseResponseCompression();
```

**3. Use Asynchronous Operations:**

```csharp
// Good
public async Task<List<Employee>> GetEmployeesAsync()
{
    return await _context.Employees.ToListAsync();
}

// Bad
public List<Employee> GetEmployees()
{
    return _context.Employees.ToList(); // Blocking
}
```

### Angular Optimization

**1. Lazy Loading:**

```typescript
const routes: Routes = [
  {
    path: 'employees',
    loadChildren: () => import('./features/employees/employees.routes')
  }
];
```

**2. OnPush Change Detection:**

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent { }
```

**3. TrackBy for Lists:**

```html
<tr *ngFor="let employee of employees; trackBy: trackById">
```

```typescript
trackById(index: number, item: Employee): number {
  return item.id;
}
```

---

## 🔒 Production Security

### Security Checklist

**IdentityServer:**
✅ Use HTTPS in production
✅ Strong signing certificates
✅ Secure connection strings (Azure Key Vault, AWS Secrets Manager)
✅ Enable rate limiting
✅ Configure CORS properly
✅ Use strong password policies

**API:**
✅ Validate all inputs
✅ Use parameterized queries (EF Core does this)
✅ Enable HTTPS redirection
✅ Configure CORS restrictively
✅ Implement rate limiting
✅ Use API keys or OAuth scopes for third-party access

**Angular:**
✅ Sanitize user inputs
✅ Use Content Security Policy headers
✅ Enable HTTPS
✅ Protect against XSS (Angular does automatically)
✅ Don't store sensitive data in localStorage
✅ Use HttpOnly cookies when possible

---

## 📝 Summary

In this advanced topics guide, we covered:

✅ **Git Submodules** — Managing multi-repository architecture effectively
✅ **Testing Strategies** — Unit, integration, and E2E testing
✅ **Docker** — Containerization for consistent deployments
✅ **CI/CD** — Automated pipelines with GitHub Actions
✅ **Cloud Deployment** — Azure and AWS deployment strategies
✅ **Monitoring** — Application Insights and Serilog
✅ **Performance** — Optimization techniques for API and Angular
✅ **Security** — Production security best practices

---

**Next in series:** [Part 6 — Real-World Features →](06-real-world-features.md)

**Previous:** [← Part 4: Angular Client Deep Dive](04-angular-client-deep-dive.md)

**Tutorial Home:** [📚 Complete Tutorial Series](TUTORIAL.md)

