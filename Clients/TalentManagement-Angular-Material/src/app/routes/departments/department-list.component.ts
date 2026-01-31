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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Department } from '../../models';
import { DepartmentService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith, catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-department-list',
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
    MatSnackBarModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit, OnDestroy {
  private departmentService = inject(DepartmentService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  departments: Department[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;

  searchForm!: FormGroup;

  // Autocomplete observables
  filteredNames$!: Observable<string[]>;

  private destroy$ = new Subject<void>();

  // Table columns
  displayedColumns: string[] = [
    'name',
    'actions',
  ];

  ngOnInit(): void {
    this.initSearchForm();
    this.setupAutocomplete();
    this.setupAutoSubmit();
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      Name: [''],
    });
  }

  setupAutocomplete(): void {
    // Setup autocomplete for Name
    this.filteredNames$ = this.searchForm.get('Name')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.getAutocompleteOptions('Name', value))
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
        this.loadDepartments();
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

    return this.departmentService.getAllPaged(params).pipe(
      map(response => {
        const values = response.value
          .map(dept => dept.name)
          .filter((v, i, arr) => v && arr.indexOf(v) === i); // Unique values only

        return values;
      }),
      catchError(() => of([]))
    );
  }

  loadDepartments(): void {
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

    this.departmentService.getAllPaged(params).subscribe({
      next: (response) => {
        this.departments = response.value;
        this.totalCount = response.recordsTotal;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading departments:', error);
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
    this.loadDepartments();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1; // API uses 1-based page numbers
    this.loadDepartments();
  }

  viewDepartment(department: Department): void {
    this.router.navigate(['/departments', department.id]);
  }

  editDepartment(department: Department): void {
    this.router.navigate(['/departments', 'edit', department.id]);
  }

  deleteDepartment(department: Department): void {
    if (confirm(`Are you sure you want to delete "${department.name}"?`)) {
      this.departmentService.delete(department.id).subscribe({
        next: () => {
          this.showMessage('Department deleted successfully');
          this.loadDepartments();
        },
        error: error => {
          console.error('Error deleting department:', error);
          this.showMessage('Error deleting department');
        },
      });
    }
  }

  createDepartment(): void {
    this.router.navigate(['/departments', 'create']);
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

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
