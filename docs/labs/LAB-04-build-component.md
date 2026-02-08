# LAB-04: Build Angular Search Component

## 🎯 Objective

Learn how to create a **reusable search component** in Angular 20 with Material Design that integrates with the TalentManagement API.

---

## 📋 Prerequisites

**Completed:**
- ✅ [LAB-01: Verify Setup](LAB-01-verify-setup.md)
- ✅ [LAB-02: Inspect JWT Tokens](LAB-02-inspect-tokens.md)
- ✅ [LAB-03: Extend API](LAB-03-extend-api.md)

**Time Required:** 45-60 minutes

---

## 🚀 Steps

### Step 1: Generate Component

```bash
cd Clients/TalentManagement-Angular-Material/talent-management
ng generate component features/employees/employee-search --standalone
```

### Step 2: Component TypeScript

File: `employee-search.component.ts`

```typescript
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { EmployeeService } from '../../../services/api/employee.service';
import { Employee } from '../../../models';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.scss']
})
export class EmployeeSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);

  employeeSelected = output<Employee>();

  searchForm!: FormGroup;
  employees: Employee[] = [];
  
  displayedColumns: string[] = ['employeeNumber', 'fullName', 'email', 'departmentName'];
  
  totalRecords = 0;
  pageSize = 10;
  pageNumber = 1;
  isLoading = false;

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.setupSearchSubscription();
    this.searchEmployees();
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('searchTerm')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageNumber = 1;
      this.searchEmployees();
    });
  }

  searchEmployees(): void {
    this.isLoading = true;
    
    const queryParams: any = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    const searchTerm = this.searchForm.get('searchTerm')!.value;
    if (searchTerm) {
      queryParams.lastName = searchTerm;
    }

    this.employeeService.getAll(queryParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded) {
          this.employees = response.value;
          this.totalRecords = response.totalRecords;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.searchEmployees();
  }

  onEmployeeClick(employee: Employee): void {
    this.employeeSelected.emit(employee);
  }

  getFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }
}
```

### Step 3: Component Template

File: `employee-search.component.html`

```html
<div class="search-container">
  <form [formGroup]="searchForm">
    <mat-form-field>
      <mat-label>Search by name</mat-label>
      <input matInput formControlName="searchTerm" placeholder="Type to search...">
    </mat-form-field>
  </form>

  <div *ngIf="isLoading">Loading...</div>

  <table mat-table [dataSource]="employees" *ngIf="!isLoading">
    <ng-container matColumnDef="employeeNumber">
      <th mat-header-cell *matHeaderCellDef>Employee #</th>
      <td mat-cell *matCellDef="let employee">{{ employee.employeeNumber }}</td>
    </ng-container>

    <ng-container matColumnDef="fullName">
      <th mat-header-cell *matHeaderCellDef>Name</th>
      <td mat-cell *matCellDef="let employee">{{ getFullName(employee) }}</td>
    </ng-container>

    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef>Email</th>
      <td mat-cell *matCellDef="let employee">{{ employee.email }}</td>
    </ng-container>

    <ng-container matColumnDef="departmentName">
      <th mat-header-cell *matHeaderCellDef>Department</th>
      <td mat-cell *matCellDef="let employee">{{ employee.departmentName }}</td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
        (click)="onEmployeeClick(row)"
        class="clickable-row"></tr>
  </table>

  <mat-paginator
    [length]="totalRecords"
    [pageSize]="pageSize"
    [pageIndex]="pageNumber - 1"
    (page)="onPageChange($event)">
  </mat-paginator>
</div>
```

### Step 4: Component Styles

File: `employee-search.component.scss`

```scss
.search-container {
  padding: 24px;
}

.clickable-row {
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

mat-form-field {
  width: 100%;
  max-width: 400px;
}
```

### Step 5: Add Route

In `src/app/routes/routes.ts`:

```typescript
{
  path: 'employees',
  component: EmployeesPageComponent,
  canActivate: [authGuard]
}
```

### Step 6: Test

1. Start all services
2. Navigate to: `http://localhost:4200/employees`
3. Test search (type in search box)
4. Test pagination
5. Test row click

---

## ✅ Verification

- [ ] Component generated successfully
- [ ] Search input with debouncing works
- [ ] Table displays employee data
- [ ] Pagination works
- [ ] Row click emits event
- [ ] Loading state shows

---

## 🎓 Key Concepts

- **Standalone components** - No NgModule needed
- **inject()** - Modern dependency injection
- **output()** - Signal-based component outputs
- **debounceTime()** - Wait before API call
- **Material Design** - Professional UI components

---

*[LAB-05: Write Unit Tests →](LAB-05-write-tests.md)*
