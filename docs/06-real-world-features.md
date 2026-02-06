# Part 6: Real-World Features — CRUD Operations, Dashboard, Search, and Analytics

## Building Modern Web Applications with Angular, .NET, and OAuth 2.0

**[← Part 5: Advanced Topics](05-advanced-topics.md)** | **[Tutorial Home](TUTORIAL.md)**

---

## 🎯 Introduction

This final part demonstrates real-world features aligned with the **actual TalentManagement project** implementation:

* **Complete CRUD Operations** — Full Create, Read, Update, Delete workflows with Guid IDs
* **Custom Mediator Pattern** — Using custom IMediator implementation (not MediatR library)
* **Repository Pattern** — Using IEmployeeRepositoryAsync instead of direct DbContext
* **Result Wrapper** — Handling Result<T> and PagedResult<T> responses
* **Base API Service** — Generic service pattern for Angular
* **Event Dispatching** — Domain events for employee changes
* **Field Shaping** — Dynamic field selection in API responses

---

## 📋 Complete CRUD Implementation

### Backend: Full Employee CRUD with Repository Pattern

**GetEmployeeByIdQuery.cs:**

```csharp
using TalentManagementAPI.Application.Messaging;
using TalentManagementAPI.Application.Interfaces.Repositories;
using Mapster;

namespace TalentManagementAPI.Application.Features.Employees.Queries.GetEmployeeById
{
    public class GetEmployeeByIdQuery : IRequest<Result<EmployeeDetailsDto>>
    {
        public Guid Id { get; set; }
    }

    public class GetEmployeeByIdQueryHandler
        : IRequestHandler<GetEmployeeByIdQuery, Result<EmployeeDetailsDto>>
    {
        private readonly IEmployeeRepositoryAsync _repository;
        private readonly IMapper _mapper;

        public GetEmployeeByIdQueryHandler(
            IEmployeeRepositoryAsync repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<EmployeeDetailsDto>> Handle(
            GetEmployeeByIdQuery request,
            CancellationToken cancellationToken)
        {
            var employee = await _repository.GetByIdAsync(request.Id);

            if (employee == null)
            {
                return Result<EmployeeDetailsDto>.Failure($"Employee with ID {request.Id} not found.");
            }

            var dto = _mapper.Map<EmployeeDetailsDto>(employee);
            return Result<EmployeeDetailsDto>.Success(dto);
        }
    }
}
```

**UpdateEmployeeCommand.cs:**

```csharp
using TalentManagementAPI.Application.Messaging;
using TalentManagementAPI.Application.Events;
using TalentManagementAPI.Domain.ValueObjects;

namespace TalentManagementAPI.Application.Features.Employees.Commands.UpdateEmployee
{
    public class UpdateEmployeeCommand : IRequest<Result<Guid>>
    {
        public Guid Id { get; set; }
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

        public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, Result<Guid>>
        {
            private readonly IEmployeeRepositoryAsync _repository;
            private readonly IEventDispatcher _eventDispatcher;

            public UpdateEmployeeCommandHandler(
                IEmployeeRepositoryAsync repository,
                IEventDispatcher eventDispatcher)
            {
                _repository = repository;
                _eventDispatcher = eventDispatcher;
            }

            public async Task<Result<Guid>> Handle(
                UpdateEmployeeCommand request,
                CancellationToken cancellationToken)
            {
                var employee = await _repository.GetByIdAsync(request.Id);

                if (employee == null)
                {
                    return Result<Guid>.Failure($"Employee with ID {request.Id} not found.");
                }

                // Update employee properties
                employee.Name = new PersonName(request.FirstName, request.MiddleName, request.LastName);
                employee.PositionId = request.PositionId;
                employee.DepartmentId = request.DepartmentId;
                employee.Salary = request.Salary;
                employee.Birthday = request.Birthday;
                employee.Email = request.Email;
                employee.Gender = request.Gender;
                employee.EmployeeNumber = request.EmployeeNumber;
                employee.Prefix = request.Prefix;
                employee.Phone = request.Phone;

                await _repository.UpdateAsync(employee);
                await _eventDispatcher.PublishAsync(new EmployeeChangedEvent(employee.Id), cancellationToken);

                return Result<Guid>.Success(employee.Id);
            }
        }
    }
}
```

**DeleteEmployeeByIdCommand.cs:**

```csharp
using TalentManagementAPI.Application.Messaging;

namespace TalentManagementAPI.Application.Features.Employees.Commands.DeleteEmployeeById
{
    public class DeleteEmployeeByIdCommand : IRequest<Result<Guid>>
    {
        public Guid Id { get; set; }

        public class DeleteEmployeeByIdCommandHandler : IRequestHandler<DeleteEmployeeByIdCommand, Result<Guid>>
        {
            private readonly IEmployeeRepositoryAsync _repository;

            public DeleteEmployeeByIdCommandHandler(IEmployeeRepositoryAsync repository)
            {
                _repository = repository;
            }

            public async Task<Result<Guid>> Handle(
                DeleteEmployeeByIdCommand request,
                CancellationToken cancellationToken)
            {
                var employee = await _repository.GetByIdAsync(request.Id);

                if (employee == null)
                {
                    return Result<Guid>.Failure($"Employee with ID {request.Id} not found.");
                }

                await _repository.DeleteAsync(employee);

                return Result<Guid>.Success(request.Id);
            }
        }
    }
}
```

**Key Features:**
- Uses **custom mediator pattern** (`TalentManagementAPI.Application.Messaging`, not MediatR library)
- Uses **Repository pattern** (`IEmployeeRepositoryAsync`)
- Returns `Result<T>` wrapper (not bare values)
- Uses `Guid` for all entity IDs
- Updates **PersonName** value object
- Publishes **domain events** on changes
- Proper null checking with failure results

---

### Frontend: Complete CRUD with BaseApiService

**Employee List Component:**

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../services/api/employee.service';
import { Employee } from '../../../models/employee.model';
import { PagedResponse, QueryParams } from '../../../models/pagination.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  employees: Employee[] = [];
  displayedColumns = ['employeeNumber', 'firstName', 'lastName', 'email',
                      'positionTitle', 'departmentName', 'salary', 'actions'];
  loading = false;

  // Pagination
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;

    const params: QueryParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.employeeService.getAllPaged(params).subscribe({
      next: (response: PagedResponse<Employee>) => {
        this.employees = response.value;
        this.totalRecords = response.totalRecords;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: string) {
    this.router.navigate(['/employees', id, 'edit']);
  }

  deleteEmployee(employee: Employee) {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.delete(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
        }
      });
    }
  }

  createEmployee() {
    this.router.navigate(['/employees', 'new']);
  }

  onPageChange(event: any) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }
}
```

**Key Features:**
* Uses `getAllPaged()` to get `PagedResponse<Employee>`
* Extracts `value` property for employee array
* Uses `totalRecords` for pagination
* All IDs are strings (Guids)
* Uses inherited methods from `BaseApiService`

**Employee Form Component:**

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../../services/api/employee.service';
import { DepartmentService } from '../../../services/api/department.service';
import { PositionService } from '../../../services/api/position.service';
import { CreateEmployeeCommand, UpdateEmployeeCommand } from '../../../models/employee.model';
import { Gender } from '../../../models/gender.enum';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatSelectModule, MatDatepickerModule],
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private positionService = inject(PositionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = false;
  employeeId?: string;

  departments: Department[] = [];
  positions: Position[] = [];

  genders = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadDepartments();
    this.loadPositions();
    this.checkEditMode();
  }

  initForm() {
    this.form = this.fb.group({
      employeeNumber: ['', [Validators.required]],
      prefix: [''],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', [Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      birthday: ['', Validators.required],
      gender: [Gender.Male, Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      departmentId: ['', Validators.required],
      positionId: ['', Validators.required]
    });
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
      }
    });
  }

  loadPositions() {
    this.positionService.getAll().subscribe({
      next: (data) => {
        this.positions = data;
      }
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.employeeId = id;
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: string) {
    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.form.patchValue({
          employeeNumber: employee.employeeNumber,
          prefix: employee.prefix,
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          birthday: employee.birthday,
          gender: employee.gender,
          salary: employee.salary,
          departmentId: employee.departmentId,
          positionId: employee.positionId
        });
      },
      error: (error) => {
        console.error('Error loading employee:', error);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;

    if (this.isEditMode && this.employeeId) {
      const command: UpdateEmployeeCommand = {
        id: this.employeeId,
        ...formValue
      };

      this.employeeService.updateEmployee(command).subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Error updating employee:', error);
        }
      });
    } else {
      const command: CreateEmployeeCommand = formValue;

      this.employeeService.createEmployee(command).subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Error creating employee:', error);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/employees']);
  }
}
```

**Key Features:**
* Loads departments and positions for dropdowns
* Uses `Gender` enum (0 = Male, 1 = Female)
* All IDs are strings (Guids)
* Uses `CreateEmployeeCommand` and `UpdateEmployeeCommand` interfaces
* Handles both create and edit modes
* Uses `birthday` field (not `dateOfBirth`)
* Uses `phone` field (not `phoneNumber`)

---

## 📊 Result Wrapper Handling

### Understanding Result<T>

The API returns all responses wrapped in `Result<T>` or `PagedResult<T>`:

**Result<T> structure:**
```typescript
interface Result<T> {
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  value: T;
}
```

**PagedResponse<T> structure:**
```typescript
interface PagedResponse<T> {
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  value: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}
```

### Handling in Angular

The `BaseApiService` automatically unwraps the `value` property:

```typescript
// BaseApiService handles unwrapping
getById(id: string): Observable<T> {
  return this.http.get<PagedResponse<T>>(`${this.apiUrl}/${this.endpoint}/${id}`)
    .pipe(
      map(response => response.value as T)  // Unwraps automatically
    );
}
```

**For error handling:**

```typescript
this.employeeService.getById(id).subscribe({
  next: (employee) => {
    // employee is already unwrapped
    console.log(employee);
  },
  error: (error) => {
    // Handle HTTP errors
    if (error.error && error.error.errors) {
      console.error('Validation errors:', error.error.errors);
    }
  }
});
```

---

## 🔍 Advanced Search with Field Shaping

### Backend: Field Shaping Support

The API supports dynamic field selection using `IModelHelper`:

**GetEmployeesQuery with field shaping:**

```csharp
public class GetEmployeesQuery : QueryParameter, IRequest<PagedResult<IEnumerable<Entity>>>
{
    public string LastName { get; set; }
    public string FirstName { get; set; }
    public string Email { get; set; }
    public string EmployeeNumber { get; set; }
    public string PositionTitle { get; set; }

    // Inherited from QueryParameter:
    // public int PageNumber { get; set; }
    // public int PageSize { get; set; }
    // public string OrderBy { get; set; }
    // public string Fields { get; set; }  // For field shaping
}
```

**Handler with field validation:**

```csharp
public async Task<PagedResult<IEnumerable<Entity>>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
{
    var objRequest = request;

    // Validate and filter fields for security
    if (!string.IsNullOrEmpty(objRequest.Fields))
    {
        // Limit to fields in view model
        objRequest.Fields = _modelHelper.ValidateModelFields<GetEmployeesViewModel>(objRequest.Fields);
    }
    else
    {
        // Default fields from view model
        objRequest.Fields = _modelHelper.GetModelFields<GetEmployeesViewModel>();
    }

    // Query based on filter
    var qryResult = await _repository.GetEmployeeResponseAsync(objRequest);
    var data = qryResult.data;
    RecordsCount recordCount = qryResult.recordsCount;

    // Response wrapper
    return PagedResult<IEnumerable<Entity>>.Success(data, objRequest.PageNumber, objRequest.PageSize, recordCount);
}
```

### Frontend: Using Field Shaping

```typescript
// Request specific fields only
const params: QueryParams = {
  pageNumber: 1,
  pageSize: 10,
  fields: 'id,firstName,lastName,email,departmentName'
};

this.employeeService.getAllPaged(params).subscribe({
  next: (response) => {
    // Response contains only requested fields
    console.log(response.value);
  }
});
```

**Benefits:**
* Reduces bandwidth
* Improves performance
* Client controls response payload
* Security: only allowed fields can be requested

---

## 📝 Summary

In this final part, we covered **real-world features** aligned with the actual project:

✅ **Complete CRUD** — Using Repository pattern, Result<T> wrapper, Guid IDs
✅ **Value Objects** — PersonName in domain layer
✅ **Domain Events** — EmployeeChangedEvent for side effects
✅ **Base API Service** — Generic Angular service with PagedResponse handling
✅ **Proper Models** — CreateEmployeeCommand, UpdateEmployeeCommand
✅ **Field Shaping** — Dynamic field selection for performance
✅ **Result Wrapper** — Standardized error handling
✅ **Pagination** — Full support with totalRecords, pageNumber, pageSize

### Series Completion

**Congratulations!** You've completed the entire tutorial series on building modern web applications with the CAT pattern. You now have:

✅ **Solid foundation** in OAuth 2.0 and OIDC authentication
✅ **Clean Architecture** knowledge with Repository and Value Object patterns
✅ **Modern Angular** skills with BaseApiService and angular-oauth2-oidc
✅ **Production patterns** including Result wrapper, domain events, field shaping
✅ **Real-world implementation** based on actual production code

### Key Patterns Learned

**Backend:**
* Clean Architecture with proper layer separation
* Repository pattern with IEmployeeRepositoryAsync
* CQRS with MediatR (nested handlers)
* Value Objects (PersonName)
* Domain Events (IEventDispatcher)
* Result<T> wrapper pattern
* Field shaping with IModelHelper

**Frontend:**
* BaseApiService<T> generic pattern
* angular-oauth2-oidc for authentication
* PagedResponse<T> handling
* Reactive forms with validation
* RxJS observables
* TypeScript interfaces for type safety

---

**Previous:** [← Part 5: Advanced Topics](05-advanced-topics.md)

**Tutorial Home:** [📚 Complete Tutorial Series](TUTORIAL.md)

**Start from beginning:** [Part 1: Foundation →](01-foundation.md)

