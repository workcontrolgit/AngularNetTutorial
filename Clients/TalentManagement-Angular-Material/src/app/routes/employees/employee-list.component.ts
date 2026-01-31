import { Component, OnInit, inject, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Employee } from '../../models';
import { EmployeeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatAutocompleteModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private employeeService = inject(EmployeeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  employees: Employee[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;

  searchForm!: FormGroup;

  // Autocomplete observables
  filteredEmployeeNumbers$!: Observable<string[]>;
  filteredFirstNames$!: Observable<string[]>;
  filteredLastNames$!: Observable<string[]>;
  filteredEmails$!: Observable<string[]>;
  filteredPositionTitles$!: Observable<string[]>;

  private destroy$ = new Subject<void>();

  // Table columns
  displayedColumns: string[] = [
    'employeeNumber',
    'name',
    'email',
    'phone',
    'positionTitle',
    'actions',
  ];

  ngOnInit(): void {
    this.initSearchForm();
    this.setupAutocomplete();
    this.setupAutoSubmit();
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      FirstName: [''],
      LastName: [''],
      Email: [''],
      EmployeeNumber: [''],
      PositionTitle: [''],
    });
  }

  setupAutocomplete(): void {
    // Setup autocomplete for Employee Number
    this.filteredEmployeeNumbers$ = this.searchForm.get('EmployeeNumber')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.getAutocompleteOptions('EmployeeNumber', value))
    );

    // Setup autocomplete for First Name
    this.filteredFirstNames$ = this.searchForm.get('FirstName')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.getAutocompleteOptions('FirstName', value))
    );

    // Setup autocomplete for Last Name
    this.filteredLastNames$ = this.searchForm.get('LastName')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.getAutocompleteOptions('LastName', value))
    );

    // Setup autocomplete for Email
    this.filteredEmails$ = this.searchForm.get('Email')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.getAutocompleteOptions('Email', value))
    );

    // Setup autocomplete for Position Title
    this.filteredPositionTitles$ = this.searchForm.get('PositionTitle')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.getAutocompleteOptions('PositionTitle', value))
    );
  }

  setupAutoSubmit(): void {
    // Subscribe to form value changes and auto-submit search
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageNumber = 1; // Reset to first page on search
        this.loadEmployees();
      });
  }

  getAutocompleteOptions(field: string, value: string): Observable<string[]> {
    if (!value || value.length < 2) {
      return of([]);
    }

    const params: any = {
      PageNumber: 1,
      PageSize: 10,
      [field]: value,
    };

    return this.employeeService.getAllPaged(params).pipe(
      map(response => {
        const fieldMap: { [key: string]: (emp: Employee) => string } = {
          'EmployeeNumber': (emp: Employee) => emp.employeeNumber,
          'FirstName': (emp: Employee) => emp.firstName,
          'LastName': (emp: Employee) => emp.lastName,
          'Email': (emp: Employee) => emp.email,
          'PositionTitle': (emp: Employee) => emp.positionTitle || '',
        };

        const values = response.value
          .map(emp => fieldMap[field](emp))
          .filter((v, i, arr) => v && arr.indexOf(v) === i); // Unique values only

        return values;
      }),
      catchError(() => of([]))
    );
  }

  loadEmployees(): void {
    this.loading = true;

    const params = {
      PageNumber: this.pageNumber,
      PageSize: this.pageSize,
      ...this.searchForm.value,
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    this.employeeService.getAllPaged(params).subscribe({
      next: (response) => {
        this.employees = response.value;
        this.totalCount = response.recordsTotal;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employees:', error);
        this.loading = false;
      },
    });
  }

  onClearSearch(): void {
    this.searchForm.reset();
    this.pageNumber = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadEmployees();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1; // API uses 1-based page numbers
    this.loadEmployees();
  }

  getFullName(employee: Employee): string {
    const parts = [
      employee.prefix,
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ].filter(Boolean);
    return parts.join(' ');
  }

  viewEmployee(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }

  editEmployee(employee: Employee): void {
    this.router.navigate(['/employees', 'edit', employee.id]);
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete ${this.getFullName(employee)}?`)) {
      this.employeeService.delete(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: error => {
          console.error('Error deleting employee:', error);
        },
      });
    }
  }

  createEmployee(): void {
    this.router.navigate(['/employees', 'create']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canDelete(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canCreate(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }
}
