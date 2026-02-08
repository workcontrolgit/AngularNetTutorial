# Part 3: API Resource Deep Dive — Clean Architecture, Entity Framework Core, and RESTful Design

## Building Modern Web Applications with Angular, .NET, and OAuth 2.0

**[← Part 2: Token Service](02-token-service-deep-dive.md)** | **[Tutorial Home](TUTORIAL.md)** | **[Part 4: Angular Client Deep Dive →](04-angular-client-deep-dive.md)**

---

## 🏗️ Introduction

The **API Resource** is the business logic heart of the CAT pattern. It's responsible for:

* **Managing business logic** — Implementing domain rules and workflows
* **Data persistence** — Storing and retrieving data using Entity Framework Core
* **Protecting resources** — Validating access tokens from IdentityServer
* **Exposing RESTful endpoints** — Providing structured API access with versioning
* **Enforcing authorization** — Controlling who can access what data

Our **TalentManagement API** uses **.NET 10 Web API** with **Clean Architecture**, which provides clear separation of concerns and makes the codebase maintainable and testable.

### Why Clean Architecture?


Without Clean Architecture, you'd have:

* Business logic mixed with data access code
* Difficulty testing components in isolation
* Tight coupling between layers
* Hard-to-maintain monolithic code
* Challenges when changing databases or frameworks

Clean Architecture provides:

✅ **Separation of Concerns** — Each layer has a single responsibility
✅ **Testability** — Easy to unit test business logic
✅ **Flexibility** — Swap infrastructure without affecting business logic
✅ **Maintainability** — Clear structure that scales with team size
✅ **Domain-Driven Design** — Focus on business domain first

---

## 📚 Clean Architecture Fundamentals

### What is Clean Architecture?

**Clean Architecture** (by Robert C. Martin) organizes code in concentric layers where dependencies point inward. The core business logic has no dependencies on external frameworks or databases.

### The Four Layers

**Domain Layer (Core):**
* **Purpose:** Business entities, value objects, and core logic
* **Dependencies:** None (pure business logic)
* **Contains:** Entities, value objects, enums, domain exceptions
* **Example:** `Employee` entity, `PersonName` value object, `Gender` enum

**Application Layer:**
* **Purpose:** Use cases and application logic
* **Dependencies:** Domain layer only
* **Contains:** Commands, queries, interfaces, DTOs, validators
* **Example:** `CreateEmployeeCommand`, `GetEmployeesQuery`

**Infrastructure Layer:**
* **Purpose:** External concerns (database, file system, APIs)
* **Dependencies:** Domain and Application layers
* **Contains:** EF Core implementations, repositories, external services
* **Includes:** `Infrastructure.Persistence`, `Infrastructure.Shared`

**WebApi Layer (Presentation):**
* **Purpose:** HTTP endpoints and API contracts
* **Dependencies:** Application layer
* **Contains:** Controllers, filters, middleware, startup configuration
* **Example:** `EmployeesController`, API versioning

---

## 🎯 Project Structure

### Solution Organization

```
TalentManagement-API/
├── TalentManagementAPI.Domain/
│   ├── Common/
│   │   ├── BaseEntity.cs
│   │   └── AuditableBaseEntity.cs
│   ├── Entities/
│   │   ├── Employee.cs
│   │   ├── Department.cs
│   │   └── Position.cs
│   ├── Enums/
│   │   └── Gender.cs
│   └── ValueObjects/
│       └── PersonName.cs
│
├── TalentManagementAPI.Application/
│   ├── Features/
│   │   └── Employees/
│   │       ├── Commands/
│   │       │   ├── CreateEmployee/
│   │       │   │   ├── CreateEmployeeCommand.cs
│   │       │   │   └── CreateEmployeeCommandValidator.cs
│   │       │   ├── UpdateEmployee/
│   │       │   └── DeleteEmployeeById/
│   │       └── Queries/
│   │           ├── GetEmployees/
│   │           │   ├── GetEmployeesQuery.cs
│   │           │   └── GetEmployeesViewModel.cs
│   │           └── GetEmployeeById/
│   ├── Interfaces/
│   │   └── Repositories/
│   │       ├── IGenericRepositoryAsync.cs
│   │       └── IEmployeeRepositoryAsync.cs
│   ├── Events/
│   │   └── EmployeeChangedEvent.cs
│   └── Wrappers/
│       ├── Result.cs
│       └── PagedResult.cs
│
├── TalentManagementAPI.Infrastructure.Persistence/
│   ├── Context/
│   │   └── ApplicationDbContext.cs
│   ├── Repositories/
│   │   ├── GenericRepositoryAsync.cs
│   │   └── EmployeeRepositoryAsync.cs
│   └── Seeds/
│       └── DefaultData.cs
│
├── TalentManagementAPI.Infrastructure.Shared/
│   ├── Services/
│   │   ├── DateTimeService.cs
│   │   └── EventDispatcher.cs
│   └── Mock/
│       └── EmployeeBogusConfig.cs
│
└── TalentManagementAPI.WebApi/
    ├── Controllers/
    │   └── v1/
    │       ├── BaseApiController.cs
    │       └── EmployeesController.cs
    ├── Program.cs
    └── appsettings.json
```

---

## 🗃️ Domain Layer

### Base Entities

**BaseEntity.cs:**

```csharp
namespace TalentManagementAPI.Domain.Common
{
    /// <summary>
    /// Base class for all entities that have an ID property.
    /// </summary>
    public abstract class BaseEntity
    {
        /// <summary>
        /// Unique identifier for this entity.
        /// </summary>
        public virtual Guid Id { get; set; }
    }
}
```

**AuditableBaseEntity.cs:**

```csharp
namespace TalentManagementAPI.Domain.Common
{
    // Abstract base class for entities that support auditing
    public abstract class AuditableBaseEntity : BaseEntity
    {
        // The username of the user who created this entity
        public string CreatedBy { get; set; }
        // The timestamp when this entity was created
        public DateTime Created { get; set; }
        // The username of the user who last modified this entity
        public string LastModifiedBy { get; set; }
        // The timestamp when this entity was last modified
        public DateTime? LastModified { get; set; }
    }
}
```

### Value Objects

**PersonName.cs:**

```csharp
namespace TalentManagementAPI.Domain.ValueObjects
{
    public sealed class PersonName
    {
        public string FirstName { get; private set; }
        public string MiddleName { get; private set; }
        public string LastName { get; private set; }

        private PersonName()
        {
        }

        public PersonName(string firstName, string middleName, string lastName)
        {
            FirstName = Normalize(firstName);
            MiddleName = string.IsNullOrWhiteSpace(middleName) ? null : Normalize(middleName);
            LastName = Normalize(lastName);

            if (FirstName.Length == 0 || LastName.Length == 0)
            {
                throw new ArgumentException("First and last name are required.");
            }

            if (FirstName.Length > 100 || LastName.Length > 100 || (MiddleName?.Length ?? 0) > 100)
            {
                throw new ArgumentException("Name parts must not exceed 100 characters.");
            }
        }

        public string FullName =>
            string.IsNullOrWhiteSpace(MiddleName)
                ? $"{FirstName} {LastName}"
                : $"{FirstName} {MiddleName} {LastName}";

        public static string Normalize(string value)
        {
            var trimmed = (value ?? string.Empty).Trim();
            return string.Join(' ', trimmed.Split(' ', StringSplitOptions.RemoveEmptyEntries));
        }
    }
}
```

### Entities

**Employee.cs:**

```csharp
using TalentManagementAPI.Domain.ValueObjects;

namespace TalentManagementAPI.Domain.Entities
{
    public class Employee : AuditableBaseEntity
    {
        // Value Object for Name
        public PersonName Name { get; set; }

        // Computed properties (not mapped to database)
        [NotMapped]
        public string FirstName => Name?.FirstName;
        [NotMapped]
        public string MiddleName => Name?.MiddleName;
        [NotMapped]
        public string LastName => Name?.LastName;
        [NotMapped]
        public string FullName => Name?.FullName;

        // Foreign Key for Position
        public Guid PositionId { get; set; }
        // Navigation Property for Position
        public virtual Position Position { get; set; }

        // Foreign Key for Home Department
        public Guid DepartmentId { get; set; }
        // Navigation Property for Home Department
        public virtual Department Department { get; set; }

        // Salary of the Employee
        public decimal Salary { get; set; }

        public DateTime Birthday { get; set; }
        public string Email { get; set; }
        public Gender Gender { get; set; }
        public string EmployeeNumber { get; set; }
        public string Prefix { get; set; }
        public string Phone { get; set; }
    }
}
```

### Enums

**Gender.cs:**

```csharp
namespace TalentManagementAPI.Domain.Enums
{
    /// <summary>
    /// Represents the gender of a person.
    /// </summary>
    public enum Gender
    {
        /// <summary>
        /// Indicates that the person is male.
        /// </summary>
        Male,

        /// <summary>
        /// Indicates that the person is female.
        /// </summary>
        Female
    }
}
```

---

## 💼 Application Layer

### CQRS Pattern with Custom Mediator

The Application layer uses **CQRS (Command Query Responsibility Segregation)** to separate reads from writes, implemented with a **custom mediator pattern** (not the MediatR library).

**Key Components:**
* **Custom Mediator** — `TalentManagementAPI.Application.Messaging.IMediator` (custom implementation)
* **Commands** — Modify state (Create, Update, Delete)
* **Queries** — Retrieve data (Read)
* **Result<T>** — Standardized response wrapper
* **Pipeline Behaviors** — Validation, logging, caching decorators

### Command Example: CreateEmployee

**CreateEmployeeCommand.cs:**

```csharp
using TalentManagementAPI.Application.Messaging;
using TalentManagementAPI.Application.Events;

namespace TalentManagementAPI.Application.Features.Employees.Commands.CreateEmployee
{
    /// <summary>
    /// Command to create a new employee.
    /// </summary>
    public class CreateEmployeeCommand : IRequest<Result<Guid>>
    {
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public Guid PositionId { get; set; }
        public Guid DepartmentId { get; set; }
        public decimal Salary { get; set; }
        public DateTime Birthday { get; set; }
        public string Email { get; set; }
        public Gender Gender { get; set; }
        public string EmployeeNumber { get; set; }
        public string Prefix { get; set; }
        public string Phone { get; set; }

        public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, Result<Guid>>
        {
            private readonly IEmployeeRepositoryAsync _repository;
            private readonly IMapper _mapper;
            private readonly IEventDispatcher _eventDispatcher;

            public CreateEmployeeCommandHandler(
                IEmployeeRepositoryAsync repository,
                IMapper mapper,
                IEventDispatcher eventDispatcher)
            {
                _repository = repository;
                _mapper = mapper;
                _eventDispatcher = eventDispatcher;
            }

            public async Task<Result<Guid>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
            {
                var employee = _mapper.Map<Employee>(request);
                await _repository.AddAsync(employee);
                await _eventDispatcher.PublishAsync(new EmployeeChangedEvent(employee.Id), cancellationToken);
                return Result<Guid>.Success(employee.Id);
            }
        }
    }
}
```

**Key Features:**
- Command handler **nested inside command class**
- Uses **Repository pattern** (`IEmployeeRepositoryAsync`)
- Uses **AutoMapper** for DTO-to-Entity mapping
- Publishes **domain events** via `IEventDispatcher`
- Returns `Result<Guid>` wrapper (not bare Guid)

**CreateEmployeeCommandValidator.cs:**

```csharp
using FluentValidation;

namespace TalentManagementAPI.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
    {
        public CreateEmployeeCommandValidator()
        {
            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Email must be valid.");

            RuleFor(v => v.Birthday)
                .LessThan(DateTime.UtcNow.AddYears(-18))
                .WithMessage("Employee must be at least 18 years old.");

            RuleFor(v => v.Salary)
                .GreaterThan(0).WithMessage("Salary must be greater than zero.");
        }
    }
}
```

### Query Example: GetEmployees

**GetEmployeesQuery.cs:**

```csharp
namespace TalentManagementAPI.Application.Features.Employees.Queries.GetEmployees
{
    /// <summary>
    /// GetAllEmployeesQuery - handles media IRequest
    /// QueryParameter - contains paging parameters
    /// To add filter/search parameters, add search properties to the body of this class
    /// </summary>
    public class GetEmployeesQuery : QueryParameter, IRequest<PagedResult<IEnumerable<Entity>>>
    {
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string Email { get; set; }
        public string EmployeeNumber { get; set; }
        public string PositionTitle { get; set; }

        public ListParameter ShapeParameter { get; set; }
    }

    public class GetAllEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, PagedResult<IEnumerable<Entity>>>
    {
        private readonly IEmployeeRepositoryAsync _repository;
        private readonly IModelHelper _modelHelper;

        public GetAllEmployeesQueryHandler(IEmployeeRepositoryAsync employeeRepository, IModelHelper modelHelper)
        {
            _repository = employeeRepository;
            _modelHelper = modelHelper;
        }

        public async Task<PagedResult<IEnumerable<Entity>>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
        {
            var objRequest = request;

            //filtered fields security
            if (!string.IsNullOrEmpty(objRequest.Fields))
            {
                //limit to fields in view model
                objRequest.Fields = _modelHelper.ValidateModelFields<GetEmployeesViewModel>(objRequest.Fields);
            }
            else
            {
                //default fields from view model
                objRequest.Fields = _modelHelper.GetModelFields<GetEmployeesViewModel>();
            }

            // query based on filter
            var qryResult = await _repository.GetEmployeeResponseAsync(objRequest);
            var data = qryResult.data;
            RecordsCount recordCount = qryResult.recordsCount;

            // response wrapper
            return PagedResult<IEnumerable<Entity>>.Success(data, objRequest.PageNumber, objRequest.PageSize, recordCount);
        }
    }
}
```

**Key Features:**
- Inherits from `QueryParameter` (includes PageNumber, PageSize, OrderBy)
- Returns `PagedResult<IEnumerable<Entity>>` with pagination metadata
- Uses **field shaping** (dynamic field selection)
- Uses **IModelHelper** for security (validates requested fields)
- Returns `Entity` (dynamic ExpandoObject) not strongly-typed DTO

---

## 🗄️ Infrastructure Layer

### Repository Pattern

**IGenericRepositoryAsync.cs:**

```csharp
namespace TalentManagementAPI.Application.Interfaces.Repositories
{
    public interface IGenericRepositoryAsync<T> where T : class
    {
        Task<T> GetByIdAsync(Guid id);
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }
}
```

**IEmployeeRepositoryAsync.cs:**

```csharp
namespace TalentManagementAPI.Application.Interfaces.Repositories
{
    /// <summary>
    /// Interface for retrieving paged employee response asynchronously.
    /// </summary>
    public interface IEmployeeRepositoryAsync : IGenericRepositoryAsync<Employee>
    {
        /// <summary>
        /// Retrieves a list of employees based on the provided query parameters asynchronously.
        /// </summary>
        /// <param name="requestParameters">The request parameters.</param>
        /// <returns>A tuple containing the list of employees and the total number of records.</returns>
        Task<(IEnumerable<Entity> data, RecordsCount recordsCount)> GetEmployeeResponseAsync(GetEmployeesQuery requestParameters);
    }
}
```

**Key Features:**
- Generic repository base interface
- Returns tuple with data and record count
- Returns dynamic `Entity` (ExpandoObject) for field shaping

---

## 🌐 WebApi Layer

### Base API Controller

**BaseApiController.cs:**

```csharp
namespace TalentManagementAPI.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        private IMediator _mediator;
        protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>();
    }
}
```

### Employees Controller


**EmployeesController.cs:**

```csharp
namespace TalentManagementAPI.WebApi.Controllers.v1
{
    [ApiVersion("1.0")]
    public class EmployeesController : BaseApiController
    {
        /// <summary>
        /// Gets a list of employees based on the specified filter.
        /// </summary>
        /// <param name="filter">The filter used to get the list of employees.</param>
        /// <returns>A list of employees.</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get([FromQuery] GetEmployeesQuery filter)
        {
            return Ok(await Mediator.Send(filter));
        }

        /// <summary>
        /// Gets an employee by identifier.
        /// </summary>
        /// <param name="id">Employee identifier.</param>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id)
        {
            return Ok(await Mediator.Send(new GetEmployeeByIdQuery { Id = id }));
        }

        /// <summary>
        /// Creates a new employee.
        /// </summary>
        /// <param name="command">Employee payload.</param>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Post(CreateEmployeeCommand command)
        {
            var result = await Mediator.Send(command);
            return CreatedAtAction(nameof(Get), new { id = result.Value }, result);
        }

        /// <summary>
        /// Updates an existing employee.
        /// </summary>
        /// <param name="id">Employee identifier.</param>
        /// <param name="command">Update payload.</param>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Put(Guid id, UpdateEmployeeCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest();
            }

            return Ok(await Mediator.Send(command));
        }

        /// <summary>
        /// Deletes an employee by identifier.
        /// </summary>
        /// <param name="id">Employee identifier.</param>
        [HttpDelete("{id}")]
        [Authorize(Policy = AuthorizationConsts.AdminPolicy)]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteEmployeeByIdCommand { Id = id }));
        }
    }
}
```

**Key Features:**
- Inherits from `BaseApiController` (provides `Mediator` property)
- Uses `[ApiVersion("1.0")]` for API versioning
- Most GET endpoints are `[AllowAnonymous]` (for demo purposes)
- DELETE requires `AdminPolicy` authorization
- Returns `IActionResult` (not strongly-typed `ActionResult<T>`)
- Uses `Guid` for all entity IDs

---

## 🔒 Authentication & Authorization

### How Token Validation Works


**Step 1:** Angular sends request with Bearer token

```http
GET /api/v1/employees HTTP/1.1
Host: localhost:44378
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI...
```

**Step 2:** JWT Bearer middleware validates the token:
* Verifies signature using IdentityServer's public key
* Checks `iss` (issuer) matches configured Authority
* Checks `aud` (audience) matches API resource name
* Checks `exp` (expiration) hasn't passed
* Extracts claims (scopes, user ID, roles)

**Step 3:** Authorization policies check claims:
* `[Authorize]` — User must be authenticated
* `[Authorize(Policy = AuthorizationConsts.AdminPolicy)]` — User must have Admin role
* `[AllowAnonymous]` — No authentication required

**Step 4:** If authorized, controller action executes


**Step 5:** If unauthorized, returns 401 (not authenticated) or 403 (not authorized)

---


## Web API Features in Swagger

The screenshots below summarize the API surface and highlight API resources directly in Swagger.

### API Overview

![Swagger API endpoints overview](images/webapi/swagger-api-endpoints.png)
*Figure: Swagger overview of all TalentManagement API endpoint groups.*

This view helps developers quickly understand versioned routes, available controllers, and endpoint discovery for testing.

### Employee Resource (Primary Tutorial Path)

![Employees resource in Swagger](images/webapi/swagger-employees-resource-expanded.png)
*Figure: Expanded Employees API resource with read/write endpoints.*

This is the core tutorial API path with read/write endpoints used for end-to-end CRUD workflows.

### Other Domain Resources

![Departments API resource](images/webapi/swagger-departments-resource-expanded.png)
*Figure: Expanded Departments API resource in Swagger.*

![Positions API resource](images/webapi/swagger-positions-resource-expanded.png)
*Figure: Expanded Positions API resource in Swagger.*

![SalaryRanges API resource](images/webapi/swagger-salaryranges-resource-expanded.png)
*Figure: Expanded SalaryRanges API resource in Swagger.*

These resources follow the same architectural patterns as Employees: versioned routes, authorization, validation, and repository-backed persistence.

### Platform Resources (Cross-Cutting)

![Dashboard API resource](images/webapi/swagger-dashboard-resource-expanded.png)
*Figure: Dashboard resource for aggregate and summary data endpoints.*

![Cache API resource](images/webapi/swagger-cache-resource-expanded.png)
*Figure: Cache resource for cache management and refresh endpoints.*

Dashboard and Cache support operational and cross-cutting scenarios beyond CRUD and are useful for production diagnostics and performance workflows.

## 📝 Summary

In this deep dive, we covered the **actual TalentManagement API** implementation:

✅ **Clean Architecture** — Four layers with clear separation
✅ **Domain Layer** — Value Objects (PersonName), Base Entities with Guid IDs
✅ **Application Layer** — CQRS with custom mediator, nested handlers, Result<T> wrapper, Repository pattern
✅ **Infrastructure Layer** — Generic repository with field shaping
✅ **WebApi Layer** — API versioning, BaseApiController, AllowAnonymous for demos
✅ **Key Patterns** — Repository, Event Dispatcher, Result wrapper, Field shaping


### Key Architectural Decisions

**Why Value Objects?**
* PersonName encapsulates name validation logic
* Ensures first and last names are always valid
* Prevents invalid state in domain model

**Why Repository Pattern?**
* Abstracts data access from business logic
* Easier to test (mock repositories)
* Can swap data providers without changing business logic

**Why Result<T> Wrapper?**
* Standardized error handling
* Avoids throwing exceptions for business rule violations
* Better API consistency

**Why Field Shaping?**
* Allows clients to request only needed fields
* Reduces bandwidth
* Improves performance

---

**Next in series:** [Part 4 — Angular Client Deep Dive →](04-angular-client-deep-dive.md)

**Previous:** [← Part 2: Token Service Deep Dive](02-token-service-deep-dive.md)

**Tutorial Home:** [📚 Complete Tutorial Series](TUTORIAL.md)




