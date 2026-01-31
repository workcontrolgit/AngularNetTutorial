import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { PageHeader } from '@shared/components/page-header/page-header';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { Position, PagedResponse, QueryParams } from '../../models';
import { PositionService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './position-list.component.html',
  styleUrl: './position-list.component.scss',
})
export class PositionListComponent implements OnInit, AfterViewInit {
  private positionService = inject(PositionService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private searchSubject = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  positions: Position[] = [];
  loading = false;
  displayedColumns: string[] = ['positionNumber', 'positionTitle', 'departmentId', 'salaryRangeId', 'actions'];

  // Pagination
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];

  // Search filters
  searchPositionNumber = '';
  searchPositionTitle = '';
  searchDepartment = '';

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.pageNumber = 1; // Reset to first page on search
      this.loadPositions();
    });

    this.loadPositions();
  }

  ngAfterViewInit(): void {
    // Server-side pagination and sorting - no need to bind to dataSource
  }

  loadPositions(): void {
    this.loading = true;

    const params: QueryParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    // Add search filters if provided
    if (this.searchPositionNumber) {
      params['PositionNumber'] = this.searchPositionNumber;
    }
    if (this.searchPositionTitle) {
      params['PositionTitle'] = this.searchPositionTitle;
    }
    if (this.searchDepartment) {
      params['Department'] = this.searchDepartment;
    }

    // Add sorting if available
    if (this.sort?.active && this.sort?.direction) {
      params['orderBy'] = `${this.sort.active} ${this.sort.direction}`;
    }

    this.positionService.getAllPaged(params).subscribe({
      next: (response: PagedResponse<Position>) => {
        this.positions = response.value;
        this.totalCount = response.recordsTotal;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading positions:', error);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.searchSubject.next();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPositions();
  }

  onSortChange(sort: Sort): void {
    this.loadPositions();
  }

  clearFilters(): void {
    this.searchPositionNumber = '';
    this.searchPositionTitle = '';
    this.searchDepartment = '';
    this.pageNumber = 1;
    this.loadPositions();
  }

  createPosition(): void {
    this.router.navigate(['/positions/create']);
  }

  viewPosition(position: Position): void {
    this.router.navigate(['/positions', position.id]);
  }

  editPosition(position: Position): void {
    this.router.navigate(['/positions/edit', position.id]);
  }

  deletePosition(position: Position): void {
    if (confirm(`Are you sure you want to delete ${position.positionTitle}?`)) {
      this.positionService.delete(position.id).subscribe({
        next: () => {
          this.loadPositions();
          this.showMessage('Position deleted successfully');
        },
        error: error => {
          console.error('Error deleting position:', error);
          this.showMessage('Error deleting position');
        },
      });
    }
  }

  addMockData(): void {
    const rowCount = prompt('How many mock positions would you like to add?', '10');
    if (rowCount) {
      const count = parseInt(rowCount, 10);
      if (count > 0 && count <= 100) {
        this.loading = true;
        this.positionService.addMockPositions({ rowCount: count }).subscribe({
          next: () => {
            this.showMessage(`${count} mock positions added successfully`);
            this.loadPositions();
          },
          error: error => {
            console.error('Error adding mock positions:', error);
            this.showMessage('Error adding mock positions');
            this.loading = false;
          },
        });
      } else {
        this.showMessage('Please enter a number between 1 and 100');
      }
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
