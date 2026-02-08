# LAB-04 Solution: Build Angular Search Component

## Complete Solution Code

This document provides the complete solution for [LAB-04: Build Angular Search Component](../LAB-04-build-component.md).

---

## Complete Component Files

### employee-search.component.ts

**File:** `Clients/TalentManagement-Angular-Material/talent-management/src/app/features/employees/employee-search/employee-search.component.ts`

```typescript
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.scss']
})
export class EmployeeSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);

  // Output event when employee is selected
  employeeSelected = output<Employee>();

  searchForm!: FormGroup;
  employees: Employee[] = [];
  displayedColumns: string[] = ['employeeNumber', 'fullName', 'email', 'departmentName'];
  
  // Pagination properties
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  
  // Loading state
  isLoading = false;

  ngOnInit(): void {
    this.initializeForm();
    this.setupSearchSubscription();
    this.searchEmployees();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('searchTerm')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageNumber = 1; // Reset to first page on search
      this.searchEmployees();
    });
  }

  searchEmployees(): void {
    this.isLoading = true;
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';

    this.employeeService.getEmployees(this.pageNumber, this.pageSize, searchTerm)
      .pipe(
        catchError(error => {
          console.error('Error loading employees:', error);
          return of({ data: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0 });
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        this.employees = response.data;
        this.totalCount = response.totalCount;
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.searchEmployees();
  }

  onRowClick(employee: Employee): void {
    this.employeeSelected.emit(employee);
  }

  clearSearch(): void {
    this.searchForm.reset();
  }
}
```

---

### employee-search.component.html

**File:** `Clients/TalentManagement-Angular-Material/talent-management/src/app/features/employees/employee-search/employee-search.component.html`

```html
<div class="employee-search-container">
  <!-- Search Header -->
  <div class="search-header">
    <h2>Search Employees</h2>
  </div>

  <!-- Search Form -->
  <form [formGroup]="searchForm" class="search-form">
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Search by name, email, or employee number</mat-label>
      <input 
        matInput 
        formControlName="searchTerm"
        placeholder="Type to search..."
        autocomplete="off">
      <mat-icon matPrefix>search</mat-icon>
      @if (searchForm.get('searchTerm')?.value) {
        <button 
          mat-icon-button 
          matSuffix 
          (click)="clearSearch()"
          type="button"
          aria-label="Clear search">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  </form>

  <!-- Loading Spinner -->
  @if (isLoading) {
    <div class="loading-container">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  }

  <!-- Results Table -->
  @if (!isLoading) {
    <div class="results-container">
      <table mat-table [dataSource]="employees" class="employee-table">
        <!-- Employee Number Column -->
        <ng-container matColumnDef="employeeNumber">
          <th mat-header-cell *matHeaderCellDef>Employee #</th>
          <td mat-cell *matCellDef="let employee">{{ employee.employeeNumber }}</td>
        </ng-container>

        <!-- Full Name Column -->
        <ng-container matColumnDef="fullName">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let employee">{{ employee.fullName }}</td>
        </ng-container>

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let employee">{{ employee.email }}</td>
        </ng-container>

        <!-- Department Column -->
        <ng-container matColumnDef="departmentName">
          <th mat-header-cell *matHeaderCellDef>Department</th>
          <td mat-cell *matCellDef="let employee">{{ employee.departmentName }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr 
          mat-row 
          *matRowDef="let row; columns: displayedColumns;"
          (click)="onRowClick(row)"
          class="clickable-row">
        </tr>

        <!-- No Data Row -->
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
            @if (searchForm.get('searchTerm')?.value) {
              No employees found matching "{{ searchForm.get('searchTerm')?.value }}"
            } @else {
              No employees found
            }
          </td>
        </tr>
      </table>

      <!-- Paginator -->
      @if (totalCount > 0) {
        <mat-paginator 
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          [pageIndex]="pageNumber - 1"
          (page)="onPageChange($event)"
          aria-label="Select page">
        </mat-paginator>
      }
    </div>
  }
</div>
```

---

### employee-search.component.scss

**File:** `Clients/TalentManagement-Angular-Material/talent-management/src/app/features/employees/employee-search/employee-search.component.scss`

```scss
.employee-search-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .search-header {
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      margin: 0;
    }
  }

  .search-form {
    margin-bottom: 24px;

    .search-field {
      width: 100%;
      font-size: 16px;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 48px 0;
  }

  .results-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .employee-table {
      width: 100%;

      th {
        background-color: #f5f5f5;
        font-weight: 600;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
      }

      td {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
      }

      .clickable-row {
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f5f5f5;
        }

        &:active {
          background-color: #e0e0e0;
        }
      }

      .no-data {
        text-align: center;
        padding: 48px 24px;
        color: rgba(0, 0, 0, 0.54);
        font-style: italic;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .employee-search-container {
    padding: 16px;

    .search-header h2 {
      font-size: 20px;
    }

    .employee-table {
      font-size: 12px;

      th, td {
        padding: 8px 4px;
      }
    }
  }
}
```

---

## Integration Steps

### Step 1: Create the Component

```bash
cd Clients/TalentManagement-Angular-Material/talent-management
ng generate component features/employees/employee-search --standalone
```

### Step 2: Add Route

**File:** `src/app/app.routes.ts`

```typescript
import { EmployeeSearchComponent } from './features/employees/employee-search/employee-search.component';

export const routes: Routes = [
  // ... other routes
  {
    path: 'employees/search',
    component: EmployeeSearchComponent,
    canActivate: [AuthGuard]
  }
];
```

### Step 3: Add Navigation Menu Item

**File:** `src/app/shared/components/sidebar/sidebar.component.html`

```html
<mat-nav-list>
  <!-- Other menu items -->
  
  <a mat-list-item routerLink="/employees/search" routerLinkActive="active">
    <mat-icon matListItemIcon>search</mat-icon>
    <span matListItemTitle>Search Employees</span>
  </a>
</mat-nav-list>
```

### Step 4: Use Component with Event Handling

**Example parent component:**

```typescript
import { EmployeeSearchComponent } from './employee-search/employee-search.component';

@Component({
  selector: 'app-employee-list',
  template: `
    <app-employee-search 
      (employeeSelected)="onEmployeeSelected($event)">
    </app-employee-search>
  `,
  imports: [EmployeeSearchComponent]
})
export class EmployeeListComponent {
  onEmployeeSelected(employee: Employee): void {
    console.log('Selected employee:', employee);
    // Navigate to detail view or open edit dialog
    this.router.navigate(['/employees', employee.id]);
  }
}
```

---

## Testing the Component

### Manual Testing Steps

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Navigate to search page:**
   - Open http://localhost:4200
   - Login with `ashtyn1` / `Pa$$word123`
   - Click "Search Employees" in sidebar

3. **Test search functionality:**
   - Type in search box
   - Verify 300ms debounce (results update after typing stops)
   - Clear search with X button

4. **Test pagination:**
   - Change page size (5, 10, 25, 50)
   - Navigate through pages
   - Verify page numbers update correctly

5. **Test row selection:**
   - Click on table row
   - Verify `employeeSelected` event fires
   - Check console for selected employee

### Unit Testing

**File:** `employee-search.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { EmployeeSearchComponent } from './employee-search.component';
import { EmployeeService } from '../../../core/services/employee.service';

describe('EmployeeSearchComponent', () => {
  let component: EmployeeSearchComponent;
  let fixture: ComponentFixture<EmployeeSearchComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmployeeService', ['getEmployees']);

    await TestBed.configureTestingModule({
      imports: [EmployeeSearchComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EmployeeService, useValue: spy }
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    employeeService.getEmployees.and.returnValue(of({
      data: [],
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      totalCount: 0
    }));

    fixture = TestBed.createComponent(EmployeeSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEmployees on init', () => {
    fixture.detectChanges();
    expect(employeeService.getEmployees).toHaveBeenCalledWith(1, 10, '');
  });

  it('should emit selected employee on row click', () => {
    spyOn(component.employeeSelected, 'emit');
    const mockEmployee = {
      id: 1,
      employeeNumber: 'EMP001',
      fullName: 'John Doe',
      email: 'john@example.com'
    } as any;

    component.onRowClick(mockEmployee);

    expect(component.employeeSelected.emit).toHaveBeenCalledWith(mockEmployee);
  });
});
```

---

## Verification Checklist

- [x] Component created with standalone: true
- [x] ReactiveFormsModule imported
- [x] Material Design modules imported
- [x] inject() function used for DI
- [x] output() function used for event emission
- [x] debounceTime(300) applied to search
- [x] distinctUntilChanged() prevents duplicate calls
- [x] catchError() handles API errors
- [x] Pagination works correctly
- [x] Row click emits employee
- [x] Loading spinner displays
- [x] No data message shows
- [x] Responsive styles applied
- [x] Unit tests pass

---

## Key Concepts Demonstrated

✅ **Standalone Components** — No NgModule required
✅ **Modern DI** — Using inject() function
✅ **Signal-based Events** — Using output() for events
✅ **Reactive Forms** — FormBuilder and FormGroup
✅ **RxJS Operators** — debounceTime, distinctUntilChanged, catchError, finalize
✅ **Material Design** — Table, paginator, form field
✅ **Server-side Pagination** — PagedResponse pattern
✅ **Error Handling** — Graceful degradation
✅ **Loading States** — User feedback
✅ **Responsive Design** — Mobile-friendly styles

---

*[← Back to LAB-04](../LAB-04-build-component.md) | [Labs Home](../README.md)*
