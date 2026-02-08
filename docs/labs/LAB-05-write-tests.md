# LAB-05: Write Unit Tests

## 🎯 Objective

Learn **test-driven development (TDD)** practices by writing unit tests for your .NET API validators, Angular services, and Angular components. This lab demonstrates the **testing pyramid** approach with practical examples.

---

## 📋 Prerequisites

**Completed:**
- ✅ [LAB-01: Verify Setup](LAB-01-verify-setup.md)
- ✅ [LAB-02: Inspect JWT Tokens](LAB-02-inspect-tokens.md)
- ✅ [LAB-03: Extend API](LAB-03-extend-api.md)
- ✅ [LAB-04: Build Angular Component](LAB-04-build-component.md)

**Time Required:** 45-60 minutes

---

## 🧪 Testing Pyramid Overview

**Unit Tests (70%)** — Fast, isolated, tests single components
- **Tools:** xUnit, FluentAssertions, Jasmine
- **Focus:** Business logic, validators, services

**Integration Tests (20%)** — Test component interaction
- **Tools:** WebApplicationFactory, TestBed
- **Focus:** API endpoints, component + service

**E2E Tests (10%)** — Full user flows
- **Tools:** Playwright, Cypress
- **Focus:** Login → Navigate → CRUD operations

**This lab focuses on Unit Tests (70% of your testing strategy).**

---

## 🚀 Part 1: .NET API Unit Tests

### Step 1: Create Test Project (if not exists)

```bash
cd ApiResources/TalentManagement-API

# Create xUnit test project
dotnet new xunit -n TalentManagementAPI.Application.Tests

# Add project reference
dotnet add TalentManagementAPI.Application.Tests/TalentManagementAPI.Application.Tests.csproj reference TalentManagementAPI.Application/TalentManagementAPI.Application.csproj

# Add to solution
dotnet sln add TalentManagementAPI.Application.Tests/TalentManagementAPI.Application.Tests.csproj
```

### Step 2: Install Test Dependencies

```bash
cd TalentManagementAPI.Application.Tests

dotnet add package FluentAssertions
dotnet add package Moq
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
```

### Step 3: Write Validator Tests

Create file: `TalentManagementAPI.Application.Tests/Employees/CreateEmployeeCommandValidatorTests.cs`

```csharp
using FluentAssertions;
using TalentManagementAPI.Application.Features.Employees.Commands.CreateEmployee;
using Xunit;

namespace TalentManagementAPI.Application.Tests.Employees
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
            var command = new CreateEmployeeCommand
            {
                FirstName = "",
                LastName = "Doe",
                Email = "john@example.com",
                DateOfBirth = DateTime.Now.AddYears(-25),
                HireDate = DateTime.Now
            };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
        }

        [Fact]
        public void Should_Have_Error_When_LastName_Is_Empty()
        {
            // Arrange
            var command = new CreateEmployeeCommand
            {
                FirstName = "John",
                LastName = "",
                Email = "john@example.com",
                DateOfBirth = DateTime.Now.AddYears(-25),
                HireDate = DateTime.Now
            };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "LastName");
        }

        [Theory]
        [InlineData("test@example.com", true)]
        [InlineData("invalid-email", false)]
        [InlineData("", false)]
        [InlineData("test@", false)]
        [InlineData("@example.com", false)]
        public void Should_Validate_Email_Format(string email, bool expectedValid)
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
            result.IsValid.Should().Be(expectedValid);
            if (!expectedValid)
            {
                result.Errors.Should().Contain(e => e.PropertyName == "Email");
            }
        }

        [Fact]
        public void Should_Have_Error_When_FirstName_Exceeds_50_Characters()
        {
            // Arrange
            var command = new CreateEmployeeCommand
            {
                FirstName = new string('A', 51),
                LastName = "Doe",
                Email = "john@example.com",
                DateOfBirth = DateTime.Now.AddYears(-25),
                HireDate = DateTime.Now
            };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e =>
                e.PropertyName == "FirstName" &&
                e.ErrorMessage.Contains("50 characters"));
        }

        [Fact]
        public void Should_Pass_When_All_Required_Fields_Valid()
        {
            // Arrange
            var command = new CreateEmployeeCommand
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                DateOfBirth = DateTime.Now.AddYears(-30),
                HireDate = DateTime.Now.AddDays(-100)
            };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
        }

        [Fact]
        public void Should_Validate_Notes_MaxLength_500()
        {
            // Arrange
            var command = new CreateEmployeeCommand
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                DateOfBirth = DateTime.Now.AddYears(-25),
                HireDate = DateTime.Now,
                Notes = new string('A', 501)
            };

            // Act
            var result = _validator.Validate(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e =>
                e.PropertyName == "Notes" &&
                e.ErrorMessage.Contains("500 characters"));
        }
    }
}
```

### Step 4: Run .NET Tests

```bash
cd ApiResources/TalentManagement-API

# Run all tests
dotnet test

# Run with detailed output
dotnet test --verbosity normal

# Run specific test class
dotnet test --filter "FullyQualifiedName~CreateEmployeeCommandValidatorTests"
```

**Expected Output:**
```
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     7, Skipped:     0, Total:     7, Duration: 245 ms
```

---

## 🚀 Part 2: Angular Service Tests

### Step 5: Create Service Test File

Create file: `Clients/TalentManagement-Angular-Material/talent-management/src/app/core/services/employee.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EmployeeService } from './employee.service';
import { Employee } from '../models/employee.model';
import { PagedResponse } from '../models/paged-response.model';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://localhost:44378/api/v1/employees';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEmployees', () => {
    it('should return paged employees', () => {
      // Arrange
      const mockResponse: PagedResponse<Employee> = {
        data: [
          {
            id: 1,
            employeeNumber: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '555-1234',
            hireDate: new Date('2020-01-01'),
            departmentId: 1,
            departmentName: 'IT',
            positionId: 1,
            positionName: 'Developer'
          }
        ],
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 1
      };

      // Act
      service.getEmployees(1, 10, '').subscribe(response => {
        // Assert
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(1);
        expect(response.data[0].firstName).toBe('John');
      });

      // Assert HTTP request
      const req = httpMock.expectOne(request =>
        request.url.includes(apiUrl) &&
        request.params.get('pageNumber') === '1' &&
        request.params.get('pageSize') === '10'
      );
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockResponse);
    });

    it('should include search term in query params', () => {
      // Arrange
      const searchTerm = 'John';

      // Act
      service.getEmployees(1, 10, searchTerm).subscribe();

      // Assert
      const req = httpMock.expectOne(request =>
        request.url.includes(apiUrl) &&
        request.params.get('searchTerm') === searchTerm
      );
      expect(req.request.method).toBe('GET');

      req.flush({ data: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0 });
    });
  });

  describe('getEmployee', () => {
    it('should return employee by id', () => {
      // Arrange
      const mockEmployee: Employee = {
        id: 1,
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        hireDate: new Date('2020-01-01'),
        departmentId: 1,
        departmentName: 'IT',
        positionId: 1,
        positionName: 'Developer'
      };

      // Act
      service.getEmployee(1).subscribe(employee => {
        // Assert
        expect(employee).toEqual(mockEmployee);
        expect(employee.id).toBe(1);
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');

      req.flush(mockEmployee);
    });
  });

  describe('createEmployee', () => {
    it('should create new employee', () => {
      // Arrange
      const newEmployee = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        hireDate: new Date('2024-01-01'),
        departmentId: 2,
        positionId: 2
      };
      const createdId = 123;

      // Act
      service.createEmployee(newEmployee).subscribe(id => {
        // Assert
        expect(id).toBe(createdId);
      });

      // Assert HTTP request
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEmployee);

      req.flush(createdId);
    });
  });

  describe('updateEmployee', () => {
    it('should update existing employee', () => {
      // Arrange
      const updatedEmployee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe Updated',
        email: 'john.updated@example.com',
        phone: '555-9999',
        hireDate: new Date('2020-01-01'),
        departmentId: 1,
        positionId: 1
      };

      // Act
      service.updateEmployee(1, updatedEmployee).subscribe();

      // Assert HTTP request
      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedEmployee);

      req.flush(null);
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee by id', () => {
      // Arrange
      const employeeId = 1;

      // Act
      service.deleteEmployee(employeeId).subscribe();

      // Assert HTTP request
      const req = httpMock.expectOne(`${apiUrl}/${employeeId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });

  describe('error handling', () => {
    it('should handle HTTP error', () => {
      // Arrange
      const errorMessage = 'Server error';

      // Act
      service.getEmployee(999).subscribe(
        () => fail('should have failed with 404 error'),
        (error) => {
          // Assert
          expect(error.status).toBe(404);
        }
      );

      // Assert HTTP request
      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });
});
```

### Step 6: Run Angular Service Tests

```bash
cd Clients/TalentManagement-Angular-Material/talent-management

# Run all tests
npm test

# Run tests in headless mode (CI)
npm test -- --watch=false --browsers=ChromeHeadless

# Run specific test file
npm test -- --include='**/employee.service.spec.ts'
```

---

## 🚀 Part 3: Angular Component Tests

### Step 7: Create Component Test File

Create file: `Clients/TalentManagement-Angular-Material/talent-management/src/app/features/employees/employee-form/employee-form.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { PositionService } from '../../../core/services/position.service';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;
  let departmentService: jasmine.SpyObj<DepartmentService>;
  let positionService: jasmine.SpyObj<PositionService>;

  beforeEach(async () => {
    // Create spy objects
    const employeeSpy = jasmine.createSpyObj('EmployeeService', [
      'createEmployee',
      'updateEmployee',
      'getEmployee'
    ]);
    const departmentSpy = jasmine.createSpyObj('DepartmentService', ['getDepartments']);
    const positionSpy = jasmine.createSpyObj('PositionService', ['getPositions']);

    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: EmployeeService, useValue: employeeSpy },
        { provide: DepartmentService, useValue: departmentSpy },
        { provide: PositionService, useValue: positionSpy }
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    departmentService = TestBed.inject(DepartmentService) as jasmine.SpyObj<DepartmentService>;
    positionService = TestBed.inject(PositionService) as jasmine.SpyObj<PositionService>;

    // Setup default spy returns
    departmentService.getDepartments.and.returnValue(of([]));
    positionService.getPositions.and.returnValue(of([]));

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();

    expect(component.form.get('firstName')?.value).toBe('');
    expect(component.form.get('lastName')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
  });

  it('should mark form as invalid when required fields are empty', () => {
    fixture.detectChanges();

    expect(component.form.valid).toBeFalse();
    expect(component.form.get('firstName')?.errors?.['required']).toBeTruthy();
    expect(component.form.get('lastName')?.errors?.['required']).toBeTruthy();
    expect(component.form.get('email')?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    fixture.detectChanges();

    const emailControl = component.form.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should validate first name max length (50)', () => {
    fixture.detectChanges();

    const firstNameControl = component.form.get('firstName');

    firstNameControl?.setValue('A'.repeat(51));
    expect(firstNameControl?.errors?.['maxlength']).toBeTruthy();

    firstNameControl?.setValue('A'.repeat(50));
    expect(firstNameControl?.errors).toBeNull();
  });

  it('should call createEmployee on submit when creating new employee', () => {
    fixture.detectChanges();

    component.form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      dateOfBirth: new Date('1990-01-01'),
      hireDate: new Date('2020-01-01'),
      departmentId: 1,
      positionId: 1
    });

    employeeService.createEmployee.and.returnValue(of(123));

    component.onSubmit();

    expect(employeeService.createEmployee).toHaveBeenCalledWith(
      jasmine.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      })
    );
  });

  it('should not submit when form is invalid', () => {
    fixture.detectChanges();

    component.form.patchValue({
      firstName: '',
      lastName: '',
      email: 'invalid'
    });

    component.onSubmit();

    expect(employeeService.createEmployee).not.toHaveBeenCalled();
    expect(employeeService.updateEmployee).not.toHaveBeenCalled();
  });

  it('should handle create employee error', () => {
    fixture.detectChanges();

    component.form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      dateOfBirth: new Date('1990-01-01'),
      hireDate: new Date('2020-01-01'),
      departmentId: 1,
      positionId: 1
    });

    const errorResponse = { status: 400, statusText: 'Bad Request' };
    employeeService.createEmployee.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    // Verify error was handled (component should still be valid for retry)
    expect(component.form.enabled).toBeTrue();
  });

  it('should load departments on init', () => {
    const mockDepartments = [
      { id: 1, name: 'IT', description: 'Information Technology' },
      { id: 2, name: 'HR', description: 'Human Resources' }
    ];

    departmentService.getDepartments.and.returnValue(of(mockDepartments));

    fixture.detectChanges();

    expect(departmentService.getDepartments).toHaveBeenCalled();
  });

  it('should load positions on init', () => {
    const mockPositions = [
      { id: 1, name: 'Developer', description: 'Software Developer' },
      { id: 2, name: 'Manager', description: 'Team Manager' }
    ];

    positionService.getPositions.and.returnValue(of(mockPositions));

    fixture.detectChanges();

    expect(positionService.getPositions).toHaveBeenCalled();
  });
});
```

### Step 8: Run Angular Component Tests

```bash
cd Clients/TalentManagement-Angular-Material/talent-management

# Run all tests
npm test

# Run specific component test
npm test -- --include='**/employee-form.component.spec.ts'

# Run with code coverage
npm test -- --code-coverage
```

**Coverage report will be generated in:** `coverage/index.html`

---

## ✅ Verification Checklist

### .NET API Tests
- [ ] All validator tests pass
- [ ] Tests verify required fields
- [ ] Tests verify max length constraints
- [ ] Tests verify email format validation
- [ ] Tests verify Notes field (from LAB-03)
- [ ] `dotnet test` shows all green

### Angular Service Tests
- [ ] Service is created successfully
- [ ] GET requests return paged data
- [ ] POST requests create employees
- [ ] PUT requests update employees
- [ ] DELETE requests remove employees
- [ ] HTTP errors are handled
- [ ] `npm test` shows all green

### Angular Component Tests
- [ ] Component is created successfully
- [ ] Form initializes with empty values
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Max length validation works
- [ ] Submit calls service methods
- [ ] Invalid forms don't submit
- [ ] Dropdowns load departments and positions

---

## 🎓 Key Concepts Learned

### Testing Best Practices

**✅ AAA Pattern (Arrange-Act-Assert)**
- **Arrange:** Set up test data and mocks
- **Act:** Execute the code being tested
- **Assert:** Verify the expected outcome

**✅ Test Naming Convention**
- `Should_ExpectedBehavior_When_Condition`
- Example: `Should_Have_Error_When_FirstName_Is_Empty`

**✅ One Assertion Per Test (Ideal)**
- Each test should verify one specific behavior
- Makes failures easier to diagnose

**✅ Test Independence**
- Each test should run independently
- No shared state between tests
- Use `beforeEach` for setup

### .NET Testing Tools

**xUnit** — Testing framework (alternative: NUnit, MSTest)
**FluentAssertions** — Readable assertions
**Moq** — Mocking framework for dependencies
**Theory/InlineData** — Data-driven tests

### Angular Testing Tools

**TestBed** — Angular testing utility
**HttpTestingController** — Mock HTTP requests
**Jasmine** — Testing framework and assertion library
**Spy Objects** — Mock services and verify calls

---

## 🔍 Common Testing Scenarios

### Test Data Validation
```csharp
[Fact]
public void Should_Validate_Field()
{
    var command = new CreateEmployeeCommand { Field = InvalidValue };
    var result = _validator.Validate(command);
    result.IsValid.Should().BeFalse();
}
```

### Test HTTP Service Call
```typescript
it('should make GET request', () => {
    service.getData().subscribe();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
});
```

### Test Form Validation
```typescript
it('should validate form', () => {
    component.form.patchValue({ field: '' });
    expect(component.form.valid).toBeFalse();
});
```

### Test Service Method Call
```typescript
it('should call service method', () => {
    serviceSpy.method.and.returnValue(of(result));
    component.action();
    expect(serviceSpy.method).toHaveBeenCalled();
});
```

---

## 💡 Tips and Best Practices

### Writing Effective Tests

1. **Test behavior, not implementation**
   - Focus on what the code does, not how it does it
   - Don't test private methods directly

2. **Use meaningful test names**
   - Test names should describe the expected behavior
   - Anyone should understand what's being tested

3. **Keep tests simple and focused**
   - One test = one behavior
   - Avoid complex logic in tests

4. **Use test data builders**
   - Create helper methods for test data
   - Reduces duplication

5. **Mock external dependencies**
   - HTTP calls, database access, file system
   - Tests should be fast and isolated

### Running Tests in CI/CD

```bash
# .NET API tests
dotnet test --configuration Release --no-build --verbosity normal

# Angular tests (headless)
npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

---

## 🚨 Troubleshooting

### .NET Tests

**Issue:** Tests not discovered
```bash
# Rebuild solution
dotnet clean
dotnet build
dotnet test
```

**Issue:** FluentAssertions not found
```bash
dotnet add package FluentAssertions
```

### Angular Tests

**Issue:** "NullInjectorError: No provider for HttpClient"
```typescript
// Add to TestBed providers:
providers: [
  provideHttpClient(),
  provideHttpClientTesting()
]
```

**Issue:** "Can't resolve all parameters for Router"
```typescript
// Add to imports:
provideRouter([])
```

**Issue:** Tests timeout
```typescript
// Increase timeout in jasmine
beforeEach(async () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
});
```

---

## 📖 Next Steps

Now that you've learned unit testing:

1. **Add more test coverage**
   - Aim for 70-80% code coverage
   - Focus on critical business logic

2. **Write integration tests**
   - Test API endpoints with WebApplicationFactory
   - Test component + service integration

3. **Add E2E tests**
   - Use Playwright for critical user flows
   - Test login → CRUD operations

4. **Set up CI/CD**
   - Run tests automatically on every commit
   - Block merges if tests fail

---

*[LAB-06: Docker Containerization →](LAB-06-docker-deployment.md)*
