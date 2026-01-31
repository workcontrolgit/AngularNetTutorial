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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { SalaryRange } from '../../models';
import { SalaryRangeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-salary-range-list',
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
    MatSnackBarModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './salary-range-list.component.html',
  styleUrl: './salary-range-list.component.scss',
})
export class SalaryRangeListComponent implements OnInit, OnDestroy {
  private salaryRangeService = inject(SalaryRangeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  salaryRanges: SalaryRange[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  displayedColumns: string[] = ['name', 'minSalary', 'maxSalary', 'actions'];

  searchForm!: FormGroup;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initSearchForm();
    this.setupAutoSubmit();
    this.loadSalaryRanges();
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
        this.loadSalaryRanges();
      });
  }

  loadSalaryRanges(): void {
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

    this.salaryRangeService.getAllPaged(params).subscribe({
      next: (response) => {
        this.salaryRanges = response.value;
        this.totalCount = response.recordsTotal;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading salary ranges:', error);
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
    this.loadSalaryRanges();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1; // API uses 1-based page numbers
    this.loadSalaryRanges();
  }

  createSalaryRange(): void {
    this.router.navigate(['/salary-ranges/create']);
  }

  viewSalaryRange(salaryRange: SalaryRange): void {
    this.router.navigate(['/salary-ranges', salaryRange.id]);
  }

  editSalaryRange(salaryRange: SalaryRange): void {
    this.router.navigate(['/salary-ranges/edit', salaryRange.id]);
  }

  deleteSalaryRange(salaryRange: SalaryRange): void {
    if (confirm(`Are you sure you want to delete ${salaryRange.name}?`)) {
      this.salaryRangeService.delete(salaryRange.id).subscribe({
        next: () => {
          this.loadSalaryRanges();
          this.showMessage('Salary range deleted successfully');
        },
        error: error => {
          console.error('Error deleting salary range:', error);
          this.showMessage('Error deleting salary range');
        },
      });
    }
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  canEdit(): boolean {
    return this.authService.hasRole('HRAdmin') || this.authService.hasRole('Manager');
  }
}
