# LAB-03 Solution: Extend API with New Property

## Complete Solution Code

This document provides the complete solution for [LAB-03: Extend API with New Property](../LAB-03-extend-api.md).

---

## Step 1: Add Property to Domain Entity

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Domain/Entities/Employee.cs`

**Add after the Phone property:**

```csharp
/// <summary>
/// Internal notes about the employee (max 500 characters).
/// </summary>
public string Notes { get; set; }
```

**Complete Employee.cs (relevant section):**

```csharp
namespace TalentManagementAPI.Domain.Entities
{
    public class Employee : AuditableBaseEntity
    {
        public string EmployeeNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        
        /// <summary>
        /// Internal notes about the employee (max 500 characters).
        /// </summary>
        public string Notes { get; set; }
        
        public DateTime DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; }
        public int PositionId { get; set; }
        public Position Position { get; set; }
    }
}
```

---

## Step 2: Create Migration

**Command:**

```bash
cd ApiResources/TalentManagement-API
dotnet ef migrations add AddNotesToEmployee --project TalentManagementAPI.Infrastructure.Persistence --startup-project TalentManagementAPI.WebApi
```

**Expected Output:**

```
Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
```

**Generated Migration File:**

`TalentManagementAPI.Infrastructure.Persistence/Migrations/[Timestamp]_AddNotesToEmployee.cs`

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TalentManagementAPI.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Employees",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Employees");
        }
    }
}
```

---

## Step 3: Apply Migration

**Command:**

```bash
dotnet ef database update --project TalentManagementAPI.Infrastructure.Persistence --startup-project TalentManagementAPI.WebApi
```

**Expected Output:**

```
Build started...
Build succeeded.
Applying migration '20240208123456_AddNotesToEmployee'.
Done.
```

**Verify in Database:**

```sql
-- Check that Notes column was added
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Employees' AND COLUMN_NAME = 'Notes';
```

---

## Step 4: Update Commands

### CreateEmployeeCommand.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/CreateEmployee/CreateEmployeeCommand.cs`

**Add property:**

```csharp
public string Notes { get; set; }
```

**Complete CreateEmployeeCommand.cs:**

```csharp
using MediatR;
using System;

namespace TalentManagementAPI.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeCommand : IRequest<int>
    {
        public string EmployeeNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Notes { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }
        public int DepartmentId { get; set; }
        public int PositionId { get; set; }
    }
}
```

### UpdateEmployeeCommand.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/UpdateEmployee/UpdateEmployeeCommand.cs`

**Add property:**

```csharp
public string Notes { get; set; }
```

**Complete UpdateEmployeeCommand.cs:**

```csharp
using MediatR;
using System;

namespace TalentManagementAPI.Application.Features.Employees.Commands.UpdateEmployee
{
    public class UpdateEmployeeCommand : IRequest
    {
        public int Id { get; set; }
        public string EmployeeNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Notes { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }
        public int DepartmentId { get; set; }
        public int PositionId { get; set; }
    }
}
```

---

## Step 5: Add Validation

### CreateEmployeeCommandValidator.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/CreateEmployee/CreateEmployeeCommandValidator.cs`

**Add validation rule:**

```csharp
RuleFor(v => v.Notes)
    .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
```

**Complete CreateEmployeeCommandValidator.cs:**

```csharp
using FluentValidation;

namespace TalentManagementAPI.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
    {
        public CreateEmployeeCommandValidator()
        {
            RuleFor(v => v.EmployeeNumber)
                .NotEmpty().WithMessage("Employee number is required.")
                .MaximumLength(50).WithMessage("Employee number must not exceed 50 characters.");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(50).WithMessage("First name must not exceed 50 characters.");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(50).WithMessage("Last name must not exceed 50 characters.");

            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email is required.")
                .MaximumLength(100).WithMessage("Email must not exceed 100 characters.");

            RuleFor(v => v.Phone)
                .MaximumLength(20).WithMessage("Phone must not exceed 20 characters.");

            RuleFor(v => v.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");

            RuleFor(v => v.DateOfBirth)
                .NotEmpty().WithMessage("Date of birth is required.")
                .Must(BeAValidAge).WithMessage("Employee must be at least 18 years old.");

            RuleFor(v => v.HireDate)
                .NotEmpty().WithMessage("Hire date is required.");

            RuleFor(v => v.DepartmentId)
                .GreaterThan(0).WithMessage("Department is required.");

            RuleFor(v => v.PositionId)
                .GreaterThan(0).WithMessage("Position is required.");
        }

        private bool BeAValidAge(DateTime dateOfBirth)
        {
            var age = DateTime.Today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;
            return age >= 18;
        }
    }
}
```

### UpdateEmployeeCommandValidator.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/UpdateEmployee/UpdateEmployeeCommandValidator.cs`

**Add the same validation rule:**

```csharp
RuleFor(v => v.Notes)
    .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
```

---

## Step 6: Update Command Handlers

The handlers automatically map properties, but verify they include Notes:

### CreateEmployeeCommandHandler.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/CreateEmployee/CreateEmployeeCommandHandler.cs`

**Relevant section (Handle method):**

```csharp
var employee = new Employee
{
    EmployeeNumber = request.EmployeeNumber,
    FirstName = request.FirstName,
    LastName = request.LastName,
    Email = request.Email,
    Phone = request.Phone,
    Notes = request.Notes,  // ← Add this line
    DateOfBirth = request.DateOfBirth,
    HireDate = request.HireDate,
    DepartmentId = request.DepartmentId,
    PositionId = request.PositionId
};
```

### UpdateEmployeeCommandHandler.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Commands/UpdateEmployee/UpdateEmployeeCommandHandler.cs`

**Relevant section (Handle method):**

```csharp
employee.EmployeeNumber = request.EmployeeNumber;
employee.FirstName = request.FirstName;
employee.LastName = request.LastName;
employee.Email = request.Email;
employee.Phone = request.Phone;
employee.Notes = request.Notes;  // ← Add this line
employee.DateOfBirth = request.DateOfBirth;
employee.HireDate = request.HireDate;
employee.DepartmentId = request.DepartmentId;
employee.PositionId = request.PositionId;
```

---

## Step 7: Update Query Response DTOs (if needed)

### EmployeeDto.cs

**File:** `ApiResources/TalentManagement-API/TalentManagementAPI.Application/Features/Employees/Queries/GetEmployees/EmployeeDto.cs`

**Add property:**

```csharp
public string Notes { get; set; }
```

**Complete EmployeeDto.cs:**

```csharp
namespace TalentManagementAPI.Application.Features.Employees.Queries.GetEmployees
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Notes { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int PositionId { get; set; }
        public string PositionName { get; set; }
    }
}
```

---

## Step 8: Build and Test

### Build the Solution

```bash
cd ApiResources/TalentManagement-API
dotnet build
```

**Expected Output:**

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### Run the API

```bash
dotnet run --project TalentManagementAPI.WebApi
```

**Wait for:**

```
Now listening on: https://localhost:44378
Application started. Press Ctrl+C to shut down.
```

---

## Step 9: Test in Swagger

### 1. Open Swagger UI

Navigate to: `https://localhost:44378/swagger`

### 2. Authenticate

1. Click **Authorize** button (top right)
2. Login with credentials: `ashtyn1` / `Pa$$word123`
3. Allow scopes

### 3. Test POST /api/v1/employees

**Expand POST endpoint → Try it out**

**Request body:**

```json
{
  "employeeNumber": "EMP999",
  "firstName": "Test",
  "lastName": "Employee",
  "email": "test@example.com",
  "phone": "555-1234",
  "notes": "This is a test employee with notes field",
  "dateOfBirth": "1990-01-01",
  "hireDate": "2024-01-01",
  "departmentId": 1,
  "positionId": 1
}
```

**Expected Response:** `201 Created` with new employee ID

### 4. Test Validation

**Test with 501 characters in Notes:**

```json
{
  "employeeNumber": "EMP998",
  "firstName": "Test",
  "lastName": "Validation",
  "email": "validation@example.com",
  "phone": "555-5678",
  "notes": "AAAAAAAAAA...AAA",  // 501 A's
  "dateOfBirth": "1990-01-01",
  "hireDate": "2024-01-01",
  "departmentId": 1,
  "positionId": 1
}
```

**Expected Response:** `400 Bad Request`

```json
{
  "errors": {
    "Notes": [
      "Notes must not exceed 500 characters."
    ]
  },
  "title": "One or more validation errors occurred."
}
```

### 5. Test GET /api/v1/employees

**Verify Notes field appears in response:**

```json
{
  "data": [
    {
      "id": 999,
      "employeeNumber": "EMP999",
      "firstName": "Test",
      "lastName": "Employee",
      "fullName": "Test Employee",
      "email": "test@example.com",
      "phone": "555-1234",
      "notes": "This is a test employee with notes field",
      "dateOfBirth": "1990-01-01T00:00:00",
      "hireDate": "2024-01-01T00:00:00",
      "departmentId": 1,
      "departmentName": "IT",
      "positionId": 1,
      "positionName": "Developer"
    }
  ]
}
```

---

## Verification Checklist

- [x] Notes property added to Employee.cs
- [x] Migration created successfully
- [x] Migration applied to database
- [x] CreateEmployeeCommand includes Notes
- [x] UpdateEmployeeCommand includes Notes
- [x] Validators include MaxLength(500) rule
- [x] Command handlers map Notes property
- [x] EmployeeDto includes Notes property
- [x] API builds without errors
- [x] Swagger shows notes field
- [x] Can create employee with notes
- [x] Validation rejects 501+ characters
- [x] GET returns notes field

---

## Common Issues and Solutions

### Issue: Migration not creating Notes column

**Solution:** Verify Entity Framework configuration

```csharp
// Check: TalentManagementAPI.Infrastructure.Persistence/Configurations/EmployeeConfiguration.cs
public void Configure(EntityTypeBuilder<Employee> builder)
{
    builder.Property(e => e.Notes)
        .HasMaxLength(500)
        .IsRequired(false);
}
```

### Issue: Validation not working

**Solution:** Ensure FluentValidation is registered in Program.cs

```csharp
builder.Services.AddFluentValidation(fv => 
    fv.RegisterValidatorsFromAssemblyContaining<CreateEmployeeCommandValidator>());
```

### Issue: Notes not appearing in Swagger

**Solution:** Rebuild and restart API

```bash
dotnet clean
dotnet build
dotnet run --project TalentManagementAPI.WebApi
```

---

## What You Learned

✅ **Domain-First Development** — Start with domain entity
✅ **EF Core Migrations** — Create and apply database changes
✅ **CQRS Pattern** — Update commands and queries separately
✅ **FluentValidation** — Add declarative validation rules
✅ **Vertical Slice** — Complete flow from domain to API
✅ **Testing in Swagger** — Verify API changes immediately

---

*[← Back to LAB-03](../LAB-03-extend-api.md) | [Labs Home](../README.md)*
