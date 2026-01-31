# Dashboard API Development Plan - .NET Core

## Project Overview
Create a dedicated Dashboard API endpoint in the .NET Core backend that aggregates HR metrics and returns them in a single optimized response for the Angular frontend.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Endpoint Specification](#api-endpoint-specification)
3. [DTOs and Models](#dtos-and-models)
4. [Repository Implementation](#repository-implementation)
5. [Service Layer](#service-layer)
6. [Controller Implementation](#controller-implementation)
7. [Database Queries](#database-queries)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Implementation Steps](#implementation-steps)

---

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                  API Layer                          │
│  • DashboardController                              │
│  • DTOs (Request/Response models)                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Application Layer                      │
│  • DashboardService                                 │
│  • Business Logic                                   │
│  • Data Aggregation                                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Infrastructure Layer                   │
│  • DashboardRepository (or use existing repos)      │
│  • EF Core DbContext                                │
│  • Database Queries                                 │
└─────────────────────────────────────────────────────┘
```

---

## API Endpoint Specification

### Endpoint Details

**URL:** `GET /api/v1/Dashboard/Metrics`

**Authentication:** Required (Bearer token)

**Authorization:** All authenticated users (Guest, Employee, Manager, HRAdmin)

**Response Format:** JSON

**Status Codes:**
- `200 OK` - Successfully retrieved metrics
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

---

## DTOs and Models

### File: `Application/DTOs/Dashboard/DashboardMetricsDto.cs`

```csharp
using System;
using System.Collections.Generic;

namespace TalentManagement.Application.DTOs.Dashboard
{
    /// <summary>
    /// Dashboard metrics response DTO
    /// </summary>
    public class DashboardMetricsDto
    {
        /// <summary>
        /// Total number of employees
        /// </summary>
        public int TotalEmployees { get; set; }

        /// <summary>
        /// Total number of departments
        /// </summary>
        public int TotalDepartments { get; set; }

        /// <summary>
        /// Total number of positions
        /// </summary>
        public int TotalPositions { get; set; }

        /// <summary>
        /// Total number of salary ranges
        /// </summary>
        public int TotalSalaryRanges { get; set; }

        /// <summary>
        /// Number of new hires in current month
        /// </summary>
        public int NewHiresThisMonth { get; set; }

        /// <summary>
        /// Average salary across all employees
        /// </summary>
        public decimal AverageSalary { get; set; }

        /// <summary>
        /// Employee distribution by department
        /// </summary>
        public List<DepartmentMetricDto> EmployeesByDepartment { get; set; }

        /// <summary>
        /// Top 10 positions by employee count
        /// </summary>
        public List<PositionMetricDto> EmployeesByPosition { get; set; }

        /// <summary>
        /// Employee distribution by salary range
        /// </summary>
        public List<SalaryRangeMetricDto> EmployeesBySalaryRange { get; set; }

        /// <summary>
        /// Gender distribution
        /// </summary>
        public GenderMetricDto GenderDistribution { get; set; }

        /// <summary>
        /// Recently added employees (last 5)
        /// </summary>
        public List<RecentEmployeeDto> RecentEmployees { get; set; }

        public DashboardMetricsDto()
        {
            EmployeesByDepartment = new List<DepartmentMetricDto>();
            EmployeesByPosition = new List<PositionMetricDto>();
            EmployeesBySalaryRange = new List<SalaryRangeMetricDto>();
            GenderDistribution = new GenderMetricDto();
            RecentEmployees = new List<RecentEmployeeDto>();
        }
    }

    /// <summary>
    /// Department metric DTO
    /// </summary>
    public class DepartmentMetricDto
    {
        public string DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int EmployeeCount { get; set; }
    }

    /// <summary>
    /// Position metric DTO
    /// </summary>
    public class PositionMetricDto
    {
        public string PositionId { get; set; }
        public string PositionTitle { get; set; }
        public int EmployeeCount { get; set; }
    }

    /// <summary>
    /// Salary range metric DTO
    /// </summary>
    public class SalaryRangeMetricDto
    {
        public string SalaryRangeId { get; set; }
        public string RangeName { get; set; }
        public decimal MinSalary { get; set; }
        public decimal MaxSalary { get; set; }
        public int EmployeeCount { get; set; }
    }

    /// <summary>
    /// Gender distribution metric DTO
    /// </summary>
    public class GenderMetricDto
    {
        public int Male { get; set; }
        public int Female { get; set; }
    }

    /// <summary>
    /// Recent employee DTO
    /// </summary>
    public class RecentEmployeeDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string PositionTitle { get; set; }
        public string DepartmentName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
```

---

## Repository Implementation

### Option A: Use Existing Repositories

If you already have `IEmployeeRepository`, `IDepartmentRepository`, etc., you can use them directly in the service.

### Option B: Create Dedicated Dashboard Repository

**File:** `Infrastructure/Repositories/DashboardRepository.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TalentManagement.Application.DTOs.Dashboard;
using TalentManagement.Domain.Entities;
using TalentManagement.Infrastructure.Data;

namespace TalentManagement.Infrastructure.Repositories
{
    public interface IDashboardRepository
    {
        Task<DashboardMetricsDto> GetDashboardMetricsAsync();
    }

    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public DashboardRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
        {
            var metrics = new DashboardMetricsDto();

            // Execute all queries in parallel for performance
            var metricsTask = GetBasicMetricsAsync();
            var departmentMetricsTask = GetDepartmentMetricsAsync();
            var positionMetricsTask = GetPositionMetricsAsync();
            var salaryRangeMetricsTask = GetSalaryRangeMetricsAsync();
            var genderMetricsTask = GetGenderMetricsAsync();
            var recentEmployeesTask = GetRecentEmployeesAsync();

            await Task.WhenAll(
                metricsTask,
                departmentMetricsTask,
                positionMetricsTask,
                salaryRangeMetricsTask,
                genderMetricsTask,
                recentEmployeesTask
            );

            // Combine results
            var basicMetrics = await metricsTask;
            metrics.TotalEmployees = basicMetrics.TotalEmployees;
            metrics.TotalDepartments = basicMetrics.TotalDepartments;
            metrics.TotalPositions = basicMetrics.TotalPositions;
            metrics.TotalSalaryRanges = basicMetrics.TotalSalaryRanges;
            metrics.NewHiresThisMonth = basicMetrics.NewHiresThisMonth;
            metrics.AverageSalary = basicMetrics.AverageSalary;

            metrics.EmployeesByDepartment = await departmentMetricsTask;
            metrics.EmployeesByPosition = await positionMetricsTask;
            metrics.EmployeesBySalaryRange = await salaryRangeMetricsTask;
            metrics.GenderDistribution = await genderMetricsTask;
            metrics.RecentEmployees = await recentEmployeesTask;

            return metrics;
        }

        private async Task<(int TotalEmployees, int TotalDepartments, int TotalPositions,
            int TotalSalaryRanges, int NewHiresThisMonth, decimal AverageSalary)> GetBasicMetricsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var totalEmployees = await _context.Employees.CountAsync();
            var totalDepartments = await _context.Departments.CountAsync();
            var totalPositions = await _context.Positions.CountAsync();
            var totalSalaryRanges = await _context.SalaryRanges.CountAsync();

            var newHiresThisMonth = await _context.Employees
                .Where(e => e.CreatedAt >= startOfMonth)
                .CountAsync();

            var averageSalary = await _context.Employees
                .AverageAsync(e => (decimal?)e.Salary) ?? 0;

            return (totalEmployees, totalDepartments, totalPositions,
                totalSalaryRanges, newHiresThisMonth, averageSalary);
        }

        private async Task<List<DepartmentMetricDto>> GetDepartmentMetricsAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .GroupBy(e => new { e.DepartmentId, e.Department.Name })
                .Select(g => new DepartmentMetricDto
                {
                    DepartmentId = g.Key.DepartmentId,
                    DepartmentName = g.Key.Name,
                    EmployeeCount = g.Count()
                })
                .OrderByDescending(d => d.EmployeeCount)
                .ToListAsync();
        }

        private async Task<List<PositionMetricDto>> GetPositionMetricsAsync()
        {
            return await _context.Employees
                .Include(e => e.Position)
                .GroupBy(e => new { e.PositionId, e.Position.PositionTitle })
                .Select(g => new PositionMetricDto
                {
                    PositionId = g.Key.PositionId,
                    PositionTitle = g.Key.PositionTitle,
                    EmployeeCount = g.Count()
                })
                .OrderByDescending(p => p.EmployeeCount)
                .Take(10) // Top 10 positions
                .ToListAsync();
        }

        private async Task<List<SalaryRangeMetricDto>> GetSalaryRangeMetricsAsync()
        {
            return await _context.Employees
                .Include(e => e.Position)
                    .ThenInclude(p => p.SalaryRange)
                .GroupBy(e => new
                {
                    e.Position.SalaryRangeId,
                    e.Position.SalaryRange.Name,
                    e.Position.SalaryRange.MinSalary,
                    e.Position.SalaryRange.MaxSalary
                })
                .Select(g => new SalaryRangeMetricDto
                {
                    SalaryRangeId = g.Key.SalaryRangeId,
                    RangeName = g.Key.Name,
                    MinSalary = g.Key.MinSalary,
                    MaxSalary = g.Key.MaxSalary,
                    EmployeeCount = g.Count()
                })
                .OrderBy(s => s.MinSalary)
                .ToListAsync();
        }

        private async Task<GenderMetricDto> GetGenderMetricsAsync()
        {
            var genderCounts = await _context.Employees
                .GroupBy(e => e.Gender)
                .Select(g => new { Gender = g.Key, Count = g.Count() })
                .ToListAsync();

            return new GenderMetricDto
            {
                Male = genderCounts.FirstOrDefault(g => g.Gender == Gender.Male)?.Count ?? 0,
                Female = genderCounts.FirstOrDefault(g => g.Gender == Gender.Female)?.Count ?? 0
            };
        }

        private async Task<List<RecentEmployeeDto>> GetRecentEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Position)
                .Include(e => e.Department)
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .Select(e => new RecentEmployeeDto
                {
                    Id = e.Id,
                    FullName = $"{e.FirstName} {e.LastName}",
                    PositionTitle = e.Position.PositionTitle,
                    DepartmentName = e.Department.Name,
                    CreatedAt = e.CreatedAt ?? DateTime.MinValue
                })
                .ToListAsync();
        }
    }
}
```

---

## Service Layer

### File: `Application/Services/DashboardService.cs`

```csharp
using System;
using System.Threading.Tasks;
using TalentManagement.Application.DTOs.Dashboard;
using TalentManagement.Infrastructure.Repositories;

namespace TalentManagement.Application.Services
{
    public interface IDashboardService
    {
        Task<DashboardMetricsDto> GetDashboardMetricsAsync();
    }

    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardService(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository ??
                throw new ArgumentNullException(nameof(dashboardRepository));
        }

        public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
        {
            try
            {
                var metrics = await _dashboardRepository.GetDashboardMetricsAsync();

                // Additional business logic can be added here
                // For example: filtering based on user roles, calculating additional metrics, etc.

                return metrics;
            }
            catch (Exception ex)
            {
                // Log the exception
                throw new ApplicationException("Error retrieving dashboard metrics", ex);
            }
        }
    }
}
```

---

## Controller Implementation

### File: `API/Controllers/DashboardController.cs`

```csharp
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TalentManagement.Application.DTOs.Dashboard;
using TalentManagement.Application.Services;

namespace TalentManagement.API.Controllers
{
    /// <summary>
    /// Dashboard controller for HR metrics
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/v1/[controller]")]
    [Produces("application/json")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IDashboardService dashboardService,
            ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService ??
                throw new ArgumentNullException(nameof(dashboardService));
            _logger = logger ??
                throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get dashboard metrics including employee counts, charts data, and recent activity
        /// </summary>
        /// <returns>Dashboard metrics</returns>
        /// <response code="200">Returns dashboard metrics</response>
        /// <response code="401">Unauthorized - invalid or missing token</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("Metrics")]
        [ProducesResponseType(typeof(DashboardMetricsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DashboardMetricsDto>> GetMetrics()
        {
            try
            {
                _logger.LogInformation("Fetching dashboard metrics");

                var metrics = await _dashboardService.GetDashboardMetricsAsync();

                _logger.LogInformation(
                    "Dashboard metrics retrieved successfully. Total Employees: {TotalEmployees}",
                    metrics.TotalEmployees);

                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard metrics");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving dashboard metrics" });
            }
        }

        /// <summary>
        /// Get department-specific metrics (for managers)
        /// </summary>
        /// <param name="departmentId">Department ID</param>
        /// <returns>Department-specific dashboard metrics</returns>
        [HttpGet("Metrics/Department/{departmentId}")]
        [Authorize(Roles = "Manager,HRAdmin")]
        [ProducesResponseType(typeof(DashboardMetricsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DashboardMetricsDto>> GetDepartmentMetrics(string departmentId)
        {
            // Future implementation for department-specific metrics
            return NotFound(new { message = "Department-specific metrics not yet implemented" });
        }
    }
}
```

---

## Database Queries

### SQL Query Examples (for reference/optimization)

#### 1. Basic Metrics Query
```sql
-- Total counts
SELECT
    (SELECT COUNT(*) FROM Employees) AS TotalEmployees,
    (SELECT COUNT(*) FROM Departments) AS TotalDepartments,
    (SELECT COUNT(*) FROM Positions) AS TotalPositions,
    (SELECT COUNT(*) FROM SalaryRanges) AS TotalSalaryRanges,
    (SELECT COUNT(*) FROM Employees
     WHERE CreatedAt >= DATEADD(month, DATEDIFF(month, 0, GETUTCDATE()), 0)) AS NewHiresThisMonth,
    (SELECT AVG(Salary) FROM Employees) AS AverageSalary;
```

#### 2. Employees by Department
```sql
SELECT
    d.Id AS DepartmentId,
    d.Name AS DepartmentName,
    COUNT(e.Id) AS EmployeeCount
FROM Departments d
LEFT JOIN Employees e ON e.DepartmentId = d.Id
GROUP BY d.Id, d.Name
ORDER BY EmployeeCount DESC;
```

#### 3. Top 10 Positions
```sql
SELECT TOP 10
    p.Id AS PositionId,
    p.PositionTitle,
    COUNT(e.Id) AS EmployeeCount
FROM Positions p
LEFT JOIN Employees e ON e.PositionId = p.Id
GROUP BY p.Id, p.PositionTitle
ORDER BY EmployeeCount DESC;
```

#### 4. Gender Distribution
```sql
SELECT
    Gender,
    COUNT(*) AS Count
FROM Employees
GROUP BY Gender;
```

#### 5. Recent Employees
```sql
SELECT TOP 5
    e.Id,
    CONCAT(e.FirstName, ' ', e.LastName) AS FullName,
    p.PositionTitle,
    d.Name AS DepartmentName,
    e.CreatedAt
FROM Employees e
INNER JOIN Positions p ON e.PositionId = p.Id
INNER JOIN Departments d ON e.DepartmentId = d.Id
ORDER BY e.CreatedAt DESC;
```

---

## Dependency Injection Setup

### File: `API/Program.cs` or `Startup.cs`

```csharp
// In ConfigureServices method or builder.Services configuration

// Register Dashboard Repository
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

// Register Dashboard Service
builder.Services.AddScoped<IDashboardService, DashboardService>();
```

---

## Testing Strategy

### 1. Unit Tests

**File:** `Tests/Application.UnitTests/Services/DashboardServiceTests.cs`

```csharp
using System.Threading.Tasks;
using Moq;
using TalentManagement.Application.DTOs.Dashboard;
using TalentManagement.Application.Services;
using TalentManagement.Infrastructure.Repositories;
using Xunit;

namespace TalentManagement.Tests.Application.UnitTests.Services
{
    public class DashboardServiceTests
    {
        private readonly Mock<IDashboardRepository> _mockRepository;
        private readonly DashboardService _service;

        public DashboardServiceTests()
        {
            _mockRepository = new Mock<IDashboardRepository>();
            _service = new DashboardService(_mockRepository.Object);
        }

        [Fact]
        public async Task GetDashboardMetricsAsync_ReturnsMetrics()
        {
            // Arrange
            var expectedMetrics = new DashboardMetricsDto
            {
                TotalEmployees = 150,
                TotalDepartments = 8,
                TotalPositions = 45,
                TotalSalaryRanges = 12,
                NewHiresThisMonth = 5,
                AverageSalary = 75000
            };

            _mockRepository
                .Setup(r => r.GetDashboardMetricsAsync())
                .ReturnsAsync(expectedMetrics);

            // Act
            var result = await _service.GetDashboardMetricsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(150, result.TotalEmployees);
            Assert.Equal(8, result.TotalDepartments);
            Assert.Equal(45, result.TotalPositions);
        }

        [Fact]
        public async Task GetDashboardMetricsAsync_IncludesAllMetricTypes()
        {
            // Arrange
            var expectedMetrics = new DashboardMetricsDto
            {
                EmployeesByDepartment = new List<DepartmentMetricDto>
                {
                    new DepartmentMetricDto { DepartmentName = "Engineering", EmployeeCount = 50 }
                },
                EmployeesByPosition = new List<PositionMetricDto>
                {
                    new PositionMetricDto { PositionTitle = "Developer", EmployeeCount = 30 }
                },
                GenderDistribution = new GenderMetricDto { Male = 85, Female = 65 },
                RecentEmployees = new List<RecentEmployeeDto>
                {
                    new RecentEmployeeDto { FullName = "John Doe" }
                }
            };

            _mockRepository
                .Setup(r => r.GetDashboardMetricsAsync())
                .ReturnsAsync(expectedMetrics);

            // Act
            var result = await _service.GetDashboardMetricsAsync();

            // Assert
            Assert.NotEmpty(result.EmployeesByDepartment);
            Assert.NotEmpty(result.EmployeesByPosition);
            Assert.NotNull(result.GenderDistribution);
            Assert.NotEmpty(result.RecentEmployees);
        }
    }
}
```

### 2. Integration Tests

**File:** `Tests/API.IntegrationTests/Controllers/DashboardControllerTests.cs`

```csharp
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using TalentManagement.Application.DTOs.Dashboard;
using Xunit;
using System.Text.Json;

namespace TalentManagement.Tests.API.IntegrationTests.Controllers
{
    public class DashboardControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public DashboardControllerTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetMetrics_ReturnsOkWithMetrics()
        {
            // Arrange - Add authorization header with test token
            _client.DefaultRequestHeaders.Add("Authorization", "Bearer test-token");

            // Act
            var response = await _client.GetAsync("/api/v1/Dashboard/Metrics");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var metrics = JsonSerializer.Deserialize<DashboardMetricsDto>(content);

            Assert.NotNull(metrics);
            Assert.True(metrics.TotalEmployees >= 0);
            Assert.True(metrics.TotalDepartments >= 0);
        }

        [Fact]
        public async Task GetMetrics_WithoutAuth_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/v1/Dashboard/Metrics");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
```

---

## Performance Optimization

### 1. Add Caching

```csharp
using Microsoft.Extensions.Caching.Memory;
using System;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "DashboardMetrics";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public DashboardService(
        IDashboardRepository dashboardRepository,
        IMemoryCache cache)
    {
        _dashboardRepository = dashboardRepository;
        _cache = cache;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
    {
        // Try to get from cache
        if (_cache.TryGetValue(CacheKey, out DashboardMetricsDto cachedMetrics))
        {
            return cachedMetrics;
        }

        // Fetch from database
        var metrics = await _dashboardRepository.GetDashboardMetricsAsync();

        // Store in cache
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(CacheDuration);

        _cache.Set(CacheKey, metrics, cacheOptions);

        return metrics;
    }
}
```

### 2. Database Indexing

```sql
-- Ensure indexes exist for optimal query performance

-- Employee table indexes
CREATE NONCLUSTERED INDEX IX_Employees_DepartmentId
ON Employees(DepartmentId) INCLUDE (Id);

CREATE NONCLUSTERED INDEX IX_Employees_PositionId
ON Employees(PositionId) INCLUDE (Id);

CREATE NONCLUSTERED INDEX IX_Employees_CreatedAt
ON Employees(CreatedAt DESC) INCLUDE (Id, FirstName, LastName);

CREATE NONCLUSTERED INDEX IX_Employees_Gender
ON Employees(Gender) INCLUDE (Id);
```

### 3. AsNoTracking for Read-Only Queries

```csharp
// In repository methods
return await _context.Employees
    .AsNoTracking() // Don't track entities - better performance for read-only
    .Include(e => e.Department)
    .GroupBy(e => new { e.DepartmentId, e.Department.Name })
    .Select(g => new DepartmentMetricDto
    {
        DepartmentId = g.Key.DepartmentId,
        DepartmentName = g.Key.Name,
        EmployeeCount = g.Count()
    })
    .ToListAsync();
```

---

## Implementation Steps

### Phase 1: Setup (1-2 hours)

1. **Create DTO Files**
   - Create `DashboardMetricsDto.cs`
   - Create supporting DTOs (DepartmentMetricDto, etc.)

2. **Create Repository Interface and Implementation**
   - Create `IDashboardRepository.cs`
   - Create `DashboardRepository.cs`

3. **Register Dependencies**
   - Update DI container in `Program.cs`

### Phase 2: Core Implementation (3-4 hours)

4. **Implement Repository Methods**
   - Implement `GetBasicMetricsAsync()`
   - Implement `GetDepartmentMetricsAsync()`
   - Implement `GetPositionMetricsAsync()`
   - Implement `GetSalaryRangeMetricsAsync()`
   - Implement `GetGenderMetricsAsync()`
   - Implement `GetRecentEmployeesAsync()`

5. **Create Service Layer**
   - Create `IDashboardService.cs`
   - Create `DashboardService.cs`

6. **Create Controller**
   - Create `DashboardController.cs`
   - Add Swagger documentation attributes

### Phase 3: Testing (2-3 hours)

7. **Write Unit Tests**
   - Test service layer
   - Test repository methods

8. **Write Integration Tests**
   - Test controller endpoints
   - Test authorization

9. **Manual Testing**
   - Test with Postman/Swagger
   - Verify all metrics return correct data

### Phase 4: Optimization (1-2 hours)

10. **Add Caching**
    - Implement memory cache in service

11. **Database Optimization**
    - Add/verify indexes
    - Analyze query plans

12. **Performance Testing**
    - Load test with realistic data volumes
    - Optimize slow queries

### Phase 5: Documentation (1 hour)

13. **Update Swagger Documentation**
    - Add XML comments
    - Generate API documentation

14. **Create README**
    - Document endpoint usage
    - Add example requests/responses

---

## Sample API Response

### Request
```http
GET /api/v1/Dashboard/Metrics HTTP/1.1
Host: localhost:44378
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
```

### Response
```json
{
  "totalEmployees": 150,
  "totalDepartments": 8,
  "totalPositions": 45,
  "totalSalaryRanges": 12,
  "newHiresThisMonth": 5,
  "averageSalary": 75000.00,
  "employeesByDepartment": [
    {
      "departmentId": "dept-1",
      "departmentName": "Engineering",
      "employeeCount": 50
    },
    {
      "departmentId": "dept-2",
      "departmentName": "Sales",
      "employeeCount": 30
    },
    {
      "departmentId": "dept-3",
      "departmentName": "Marketing",
      "employeeCount": 20
    }
  ],
  "employeesByPosition": [
    {
      "positionId": "pos-1",
      "positionTitle": "Software Engineer",
      "employeeCount": 25
    },
    {
      "positionId": "pos-2",
      "positionTitle": "Sales Representative",
      "employeeCount": 20
    },
    {
      "positionId": "pos-3",
      "positionTitle": "Marketing Manager",
      "employeeCount": 15
    }
  ],
  "employeesBySalaryRange": [
    {
      "salaryRangeId": "sr-1",
      "rangeName": "$50k-$75k",
      "minSalary": 50000,
      "maxSalary": 75000,
      "employeeCount": 50
    },
    {
      "salaryRangeId": "sr-2",
      "rangeName": "$75k-$100k",
      "minSalary": 75000,
      "maxSalary": 100000,
      "employeeCount": 60
    }
  ],
  "genderDistribution": {
    "male": 85,
    "female": 65
  },
  "recentEmployees": [
    {
      "id": "emp-1",
      "fullName": "John Doe",
      "positionTitle": "Software Engineer",
      "departmentName": "Engineering",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "emp-2",
      "fullName": "Jane Smith",
      "positionTitle": "Sales Representative",
      "departmentName": "Sales",
      "createdAt": "2025-01-12T14:20:00Z"
    }
  ]
}
```

---

## Error Handling

### Global Exception Handler

```csharp
// Middleware/ExceptionHandlerMiddleware.cs
public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var response = new
        {
            message = "An error occurred while processing your request",
            details = exception.Message // Remove in production
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}
```

---

## Security Considerations

### 1. Authorization

```csharp
[Authorize] // All users must be authenticated
[Authorize(Roles = "HRAdmin,Manager")] // Role-based access
```

### 2. Data Filtering by Role

```csharp
public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(ClaimsPrincipal user)
{
    var metrics = await _dashboardRepository.GetDashboardMetricsAsync();

    // If user is a Manager (not HRAdmin), filter to their department only
    if (user.IsInRole("Manager") && !user.IsInRole("HRAdmin"))
    {
        var userDepartmentId = user.FindFirst("department_id")?.Value;

        metrics.EmployeesByDepartment = metrics.EmployeesByDepartment
            .Where(d => d.DepartmentId == userDepartmentId)
            .ToList();

        // Recalculate totals for the department
        // ...
    }

    return metrics;
}
```

### 3. Rate Limiting

```csharp
// In Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("dashboard", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10; // 10 requests per minute
    });
});

// In Controller
[EnableRateLimiting("dashboard")]
[HttpGet("Metrics")]
public async Task<ActionResult<DashboardMetricsDto>> GetMetrics()
{
    // ...
}
```

---

## Monitoring and Logging

### Application Insights Configuration

```csharp
// In DashboardRepository
public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
{
    var stopwatch = Stopwatch.StartNew();

    try
    {
        var metrics = await GetBasicMetricsAsync();

        stopwatch.Stop();
        _logger.LogInformation(
            "Dashboard metrics retrieved in {ElapsedMilliseconds}ms",
            stopwatch.ElapsedMilliseconds);

        return metrics;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving dashboard metrics");
        throw;
    }
}
```

---

## Timeline Estimate

| Phase | Task | Hours |
|-------|------|-------|
| **Phase 1** | Setup (DTOs, interfaces, DI) | 1-2h |
| **Phase 2** | Core Implementation (repo, service, controller) | 3-4h |
| **Phase 3** | Testing (unit, integration, manual) | 2-3h |
| **Phase 4** | Optimization (caching, indexes) | 1-2h |
| **Phase 5** | Documentation | 1h |
| **Total** | | **8-12h** |

---

## Checklist

- [ ] Create DTOs in Application layer
- [ ] Create IDashboardRepository interface
- [ ] Implement DashboardRepository with all queries
- [ ] Create IDashboardService interface
- [ ] Implement DashboardService
- [ ] Create DashboardController
- [ ] Register services in DI container
- [ ] Write unit tests for service
- [ ] Write unit tests for repository
- [ ] Write integration tests for controller
- [ ] Add Swagger documentation
- [ ] Implement caching
- [ ] Add database indexes
- [ ] Performance test with realistic data
- [ ] Add logging and monitoring
- [ ] Security review
- [ ] Update API documentation
- [ ] Deploy to development environment
- [ ] QA testing
- [ ] Deploy to production

---

**Document Version:** 1.0
**Last Updated:** January 19, 2025
**Status:** Ready for Implementation
