import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Employee, Gender } from '../../models';
import { EmployeeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employee?: Employee;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getById(id).subscribe({
      next: (employee: Employee) => {
        this.employee = employee;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employee:', error);
        this.loading = false;
        this.router.navigate(['/employees']);
      },
    });
  }

  getFullName(): string {
    if (!this.employee) return '';
    const parts = [
      this.employee.prefix,
      this.employee.firstName,
      this.employee.middleName,
      this.employee.lastName,
      this.employee.suffix,
    ].filter(Boolean);
    return parts.join(' ');
  }

  getGenderLabel(gender: Gender): string {
    return gender === Gender.Male ? 'Male' : 'Female';
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/employees', 'edit', this.employee.id]);
    }
  }

  deleteEmployee(): void {
    if (!this.employee) return;

    if (confirm(`Are you sure you want to delete ${this.getFullName()}?`)) {
      this.employeeService.delete(this.employee.id).subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: error => {
          console.error('Error deleting employee:', error);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canDelete(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }
}
