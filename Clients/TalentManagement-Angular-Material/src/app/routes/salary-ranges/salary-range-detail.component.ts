import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { SalaryRange } from '../../models';
import { SalaryRangeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-salary-range-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './salary-range-detail.component.html',
  styleUrl: './salary-range-detail.component.scss',
})
export class SalaryRangeDetailComponent implements OnInit {
  private salaryRangeService = inject(SalaryRangeService);
  private authService = inject(OidcAuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  salaryRange!: SalaryRange;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSalaryRange(id);
    }
  }

  loadSalaryRange(id: string): void {
    this.loading = true;

    this.salaryRangeService.getById(id).subscribe({
      next: (salaryRange: SalaryRange) => {
        this.salaryRange = salaryRange;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading salary range:', error);
        this.showMessage('Error loading salary range');
        this.loading = false;
        this.router.navigate(['/salary-ranges']);
      },
    });
  }

  editSalaryRange(): void {
    this.router.navigate(['/salary-ranges', 'edit', this.salaryRange.id]);
  }

  deleteSalaryRange(): void {
    if (confirm(`Are you sure you want to delete "${this.salaryRange.name}"?`)) {
      this.salaryRangeService.delete(this.salaryRange.id).subscribe({
        next: () => {
          this.showMessage('Salary range deleted successfully');
          this.router.navigate(['/salary-ranges']);
        },
        error: error => {
          console.error('Error deleting salary range:', error);
          this.showMessage('Error deleting salary range');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/salary-ranges']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canDelete(): boolean {
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
