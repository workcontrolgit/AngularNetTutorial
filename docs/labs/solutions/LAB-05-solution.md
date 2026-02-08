# LAB-05 Solution: Write Unit Tests

## Complete Solution Code

This document provides the complete solution for [LAB-05: Write Unit Tests](../LAB-05-write-tests.md).

---

## Part 1: .NET API Unit Tests - Complete Solutions

### CreateEmployeeCommandValidatorTests.cs (Complete)

**File:** `TalentManagementAPI.Application.Tests/Employees/CreateEmployeeCommandValidatorTests.cs`

**Complete test class with all test methods shown in the lab.**

See [LAB-05: Step 3](../LAB-05-write-tests.md#step-3-write-validator-tests) for the full implementation.

**Key Test Patterns:**

```csharp
[Fact]
public void Should_Have_Error_When_FirstName_Is_Empty()
{
    // Arrange - Create command with empty FirstName
    var command = new CreateEmployeeCommand { FirstName = "" /* ... */ };
    
    // Act - Validate command
    var result = _validator.Validate(command);
    
    // Assert - Expect validation error
    result.IsValid.Should().BeFalse();
    result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
}
```

**Theory Tests with InlineData:**

```csharp
[Theory]
[InlineData("test@example.com", true)]
[InlineData("invalid-email", false)]
[InlineData("", false)]
public void Should_Validate_Email_Format(string email, bool expectedValid)
{
    // Test multiple scenarios with one test method
}
```

---

## Part 2: Angular Service Tests - Complete Solutions

### EmployeeService.spec.ts (Complete)

**File:** `src/app/core/services/employee.service.spec.ts`

**See [LAB-05: Step 5](../LAB-05-write-tests.md#step-5-create-service-test-file) for full implementation.**

**Key Testing Patterns:**

### 1. Setup TestBed with HTTP Testing

```typescript
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
```

### 2. Verify HTTP Requests

```typescript
it('should return paged employees', () => {
  const mockResponse: PagedResponse<Employee> = { /* ... */ };

  service.getEmployees(1, 10, '').subscribe(response => {
    expect(response).toEqual(mockResponse);
  });

  const req = httpMock.expectOne(request =>
    request.url.includes(apiUrl) &&
    request.params.get('pageNumber') === '1'
  );
  expect(req.request.method).toBe('GET');
  req.flush(mockResponse);
});
```

### 3. Test Error Handling

```typescript
it('should handle HTTP error', () => {
  service.getEmployee(999).subscribe(
    () => fail('should have failed with 404 error'),
    (error) => {
      expect(error.status).toBe(404);
    }
  );

  const req = httpMock.expectOne(`${apiUrl}/999`);
  req.flush('Not Found', { status: 404, statusText: 'Not Found' });
});
```

### 4. Cleanup After Each Test

```typescript
afterEach(() => {
  httpMock.verify(); // Ensures no outstanding HTTP requests
});
```

---

## Part 3: Angular Component Tests - Complete Solutions

### EmployeeFormComponent.spec.ts (Complete)

**File:** `src/app/features/employees/employee-form/employee-form.component.spec.ts`

**See [LAB-05: Step 7](../LAB-05-write-tests.md#step-7-create-component-test-file) for full implementation.**

**Key Testing Patterns:**

### 1. Setup with Spy Objects

```typescript
beforeEach(async () => {
  const employeeSpy = jasmine.createSpyObj('EmployeeService', [
    'createEmployee',
    'updateEmployee',
    'getEmployee'
  ]);

  await TestBed.configureTestingModule({
    imports: [EmployeeFormComponent],
    providers: [
      { provide: EmployeeService, useValue: employeeSpy }
    ]
  }).compileComponents();

  employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
});
```

### 2. Test Form Initialization

```typescript
it('should initialize form with empty values', () => {
  fixture.detectChanges();

  expect(component.form.get('firstName')?.value).toBe('');
  expect(component.form.get('email')?.value).toBe('');
});
```

### 3. Test Form Validation

```typescript
it('should validate email format', () => {
  fixture.detectChanges();

  const emailControl = component.form.get('email');

  emailControl?.setValue('invalid-email');
  expect(emailControl?.errors?.['email']).toBeTruthy();

  emailControl?.setValue('valid@example.com');
  expect(emailControl?.errors).toBeNull();
});
```

### 4. Test Service Method Calls

```typescript
it('should call createEmployee on submit', () => {
  fixture.detectChanges();

  component.form.patchValue({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  });

  employeeService.createEmployee.and.returnValue(of(123));

  component.onSubmit();

  expect(employeeService.createEmployee).toHaveBeenCalledWith(
    jasmine.objectContaining({
      firstName: 'John',
      lastName: 'Doe'
    })
  );
});
```

### 5. Test Error Scenarios

```typescript
it('should handle create employee error', () => {
  fixture.detectChanges();

  component.form.patchValue({ /* valid data */ });

  const errorResponse = { status: 400, statusText: 'Bad Request' };
  employeeService.createEmployee.and.returnValue(throwError(() => errorResponse));

  component.onSubmit();

  expect(component.form.enabled).toBeTrue();
});
```

---

## Running Tests - Complete Commands

### .NET Tests

```bash
cd ApiResources/TalentManagement-API

# Run all tests
dotnet test

# Run with detailed output
dotnet test --verbosity detailed

# Run specific test class
dotnet test --filter "FullyQualifiedName~CreateEmployeeCommandValidatorTests"

# Run specific test method
dotnet test --filter "FullyQualifiedName~Should_Have_Error_When_FirstName_Is_Empty"

# Run with code coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

**Expected Output:**

```
Test run for TalentManagementAPI.Application.Tests.dll (.NET 10.0)
Microsoft (R) Test Execution Command Line Tool Version 17.9.0

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     7, Skipped:     0, Total:     7, Duration: 245 ms
```

### Angular Tests

```bash
cd Clients/TalentManagement-Angular-Material/talent-management

# Run all tests (watch mode)
npm test

# Run tests once (CI mode)
npm test -- --watch=false

# Run tests in headless browser
npm test -- --watch=false --browsers=ChromeHeadless

# Run specific test file
npm test -- --include='**/employee.service.spec.ts'

# Run with code coverage
npm test -- --code-coverage --watch=false

# Run and generate coverage report
npm test -- --code-coverage --watch=false --browsers=ChromeHeadless
```

**Expected Output:**

```
✔ Browser application bundle generation complete.
08 02 2026 10:30:15.123:INFO [karma-server]: Karma v6.4.2 server started
08 02 2026 10:30:15.456:INFO [Chrome Headless]: Connected on socket
Chrome Headless 120.0.0.0: Executed 15 of 15 SUCCESS (0.789 secs / 0.654 secs)
TOTAL: 15 SUCCESS

=============================== Coverage summary ===============================
Statements   : 85.23% ( 247/290 )
Branches     : 78.12% ( 75/96 )
Functions    : 81.67% ( 49/60 )
Lines        : 84.91% ( 236/278 )
================================================================================
```

---

## Test Coverage Analysis

### Viewing .NET Coverage Report

**Install ReportGenerator:**

```bash
dotnet tool install -g dotnet-reportgenerator-globaltool
```

**Generate HTML Report:**

```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
reportgenerator -reports:coverage.opencover.xml -targetdir:coveragereport -reporttypes:Html
```

**Open report:** `coveragereport/index.html`

### Viewing Angular Coverage Report

**After running tests with coverage:**

```bash
npm test -- --code-coverage --watch=false
```

**Open report:** `coverage/index.html`

**Coverage report shows:**
- Line coverage percentage
- Branch coverage percentage
- Uncovered lines highlighted in red
- File-by-file breakdown

---

## Additional Test Examples

### Testing with Mock Data Builders

**Create test data builder:**

```typescript
// test-helpers/employee.builder.ts
export class EmployeeBuilder {
  private employee: Partial<Employee> = {
    id: 1,
    employeeNumber: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  };

  withId(id: number): this {
    this.employee.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.employee.email = email;
    return this;
  }

  build(): Employee {
    return this.employee as Employee;
  }
}

// Usage in tests
const employee = new EmployeeBuilder()
  .withId(123)
  .withEmail('test@example.com')
  .build();
```

### Testing Async Operations

```typescript
it('should handle async operation', fakeAsync(() => {
  let result: any;

  service.getEmployee(1).subscribe(data => {
    result = data;
  });

  tick(); // Simulate passage of time

  expect(result).toBeDefined();
}));
```

### Testing Observables with Marble Testing

```typescript
import { TestScheduler } from 'rxjs/testing';

it('should debounce search input', () => {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  scheduler.run(({ cold, expectObservable }) => {
    const input$ = cold('a-b-c---|');
    const expected =    '---c----|';
    const result$ = input$.pipe(debounceTime(300));

    expectObservable(result$).toBe(expected);
  });
});
```

---

## Troubleshooting Common Test Issues

### .NET Tests

**Issue: "No test is available"**

```bash
# Solution: Clean and rebuild
dotnet clean
dotnet build
dotnet test
```

**Issue: "FluentAssertions not found"**

```bash
# Solution: Add package
cd TalentManagementAPI.Application.Tests
dotnet add package FluentAssertions
dotnet restore
```

**Issue: Tests fail due to database**

```csharp
// Solution: Use in-memory database for tests
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("TestDatabase"));
```

### Angular Tests

**Issue: "NullInjectorError: No provider for HttpClient"**

```typescript
// Solution: Add HTTP testing providers
providers: [
  provideHttpClient(),
  provideHttpClientTesting()
]
```

**Issue: "Can't resolve all parameters for Router"**

```typescript
// Solution: Add router testing provider
providers: [
  provideRouter([])
]
```

**Issue: "Timeout - Async callback was not invoked"**

```typescript
// Solution: Increase timeout
beforeEach(async () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  // ...
});
```

**Issue: "Expected spy to have been called"**

```typescript
// Solution: Ensure detectChanges() is called
fixture.detectChanges(); // Triggers ngOnInit
expect(serviceSpy.method).toHaveBeenCalled();
```

---

## Best Practices Summary

### AAA Pattern (Arrange-Act-Assert)

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test';
  serviceSpy.method.and.returnValue(of('result'));

  // Act - Execute the code being tested
  component.action(input);

  // Assert - Verify the expected outcome
  expect(serviceSpy.method).toHaveBeenCalledWith(input);
});
```

### Test Naming Conventions

✅ **Good:** `Should_Have_Error_When_FirstName_Is_Empty`
✅ **Good:** `should validate email format`
❌ **Bad:** `test1`, `testValidation`, `checkEmail`

### One Assertion Per Test (Ideal)

```typescript
// Good - focused test
it('should mark form invalid when email is empty', () => {
  component.form.get('email')?.setValue('');
  expect(component.form.valid).toBeFalse();
});

// Also good - related assertions
it('should populate form with employee data', () => {
  const employee = { firstName: 'John', lastName: 'Doe' };
  component.loadEmployee(employee);
  
  expect(component.form.get('firstName')?.value).toBe('John');
  expect(component.form.get('lastName')?.value).toBe('Doe');
});
```

### Test Independence

```typescript
// Good - each test is independent
beforeEach(() => {
  component = new MyComponent();
  component.ngOnInit();
});

// Bad - tests depend on execution order
let sharedState;
it('test 1', () => { sharedState = 'value'; });
it('test 2', () => { expect(sharedState).toBe('value'); }); // Fragile
```

### Mock External Dependencies

```typescript
// Good - mock HTTP calls
const httpMock = TestBed.inject(HttpTestingController);

// Good - mock services
const serviceSpy = jasmine.createSpyObj('MyService', ['method']);

// Bad - make real HTTP calls in tests
service.getData().subscribe(); // Slow, unreliable
```

---

## Test Pyramid Reminder

**70% Unit Tests** — Fast, isolated, test business logic
- Validators, pure functions, services, components

**20% Integration Tests** — Test component interactions
- API controllers with database, component + service

**10% E2E Tests** — Full user flows
- Login → Navigate → CRUD operations

---

## What You Learned

✅ **xUnit Testing** — Facts, Theories, InlineData
✅ **FluentAssertions** — Readable test assertions
✅ **Jasmine/Karma** — Angular testing framework
✅ **TestBed** — Angular testing utility
✅ **HttpTestingController** — Mock HTTP requests
✅ **Spy Objects** — Mock services and verify calls
✅ **Code Coverage** — Measure test effectiveness
✅ **AAA Pattern** — Arrange-Act-Assert structure
✅ **Test Naming** — Clear, descriptive test names
✅ **Test Independence** — Isolated, repeatable tests

---

*[← Back to LAB-05](../LAB-05-write-tests.md) | [Labs Home](../README.md)*
