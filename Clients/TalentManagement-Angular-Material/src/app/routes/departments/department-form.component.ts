import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Department, CreateDepartmentCommand, UpdateDepartmentCommand } from '../../models';
import { DepartmentService } from '../../services/api';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
})
export class DepartmentFormComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  departmentForm!: FormGroup;
  loading = false;
  isEditMode = false;
  departmentId?: string;

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.departmentId = id;
      this.loadDepartment(id);
    }
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  loadDepartment(id: string): void {
    this.loading = true;

    this.departmentService.getById(id).subscribe({
      next: (department: Department) => {
        this.departmentForm.patchValue({
          name: department.name,
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading department:', error);
        this.showMessage('Error loading department');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.departmentId) {
      const command: UpdateDepartmentCommand = {
        id: this.departmentId,
        name: this.departmentForm.value.name,
      };

      this.departmentService.updateDepartment(command).subscribe({
        next: () => {
          this.showMessage('Department updated successfully');
          this.router.navigate(['/departments', this.departmentId]);
        },
        error: error => {
          console.error('Error updating department:', error);
          this.showMessage('Error updating department');
          this.loading = false;
        },
      });
    } else {
      const command: CreateDepartmentCommand = {
        name: this.departmentForm.value.name,
      };

      this.departmentService.createDepartment(command).subscribe({
        next: (department) => {
          console.log('Department created - Response:', department);
          console.log('Department ID:', department?.id);
          this.showMessage('Department created successfully');
          if (department?.id) {
            console.log('Navigating to detail page:', '/departments/' + department.id);
            this.router.navigate(['/departments', department.id]);
          } else {
            console.warn('No department ID returned, navigating to list page');
            this.router.navigate(['/departments']);
          }
          this.loading = false;
        },
        error: error => {
          console.error('Error creating department:', error);
          this.showMessage('Error creating department');
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.departmentId) {
      this.router.navigate(['/departments', this.departmentId]);
    } else {
      this.router.navigate(['/departments']);
    }
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
