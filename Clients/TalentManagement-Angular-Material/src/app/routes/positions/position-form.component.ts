import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import {
  Position,
  CreatePositionCommand,
  UpdatePositionCommand,
  Department,
  SalaryRange,
} from '../../models';
import { PositionService, DepartmentService, SalaryRangeService } from '../../services/api';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './position-form.component.html',
  styleUrl: './position-form.component.scss',
})
export class PositionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private positionService = inject(PositionService);
  private departmentService = inject(DepartmentService);
  private salaryRangeService = inject(SalaryRangeService);

  positionForm!: FormGroup;
  loading = false;
  isEditMode = false;
  positionId?: string;
  departments: Department[] = [];
  salaryRanges: SalaryRange[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
    this.loadSalaryRanges();
    this.checkEditMode();
  }

  initForm(): void {
    this.positionForm = this.fb.group({
      positionTitle: ['', [Validators.required, Validators.maxLength(100)]],
      positionNumber: ['', [Validators.required, Validators.maxLength(50)]],
      positionDescription: ['', [Validators.maxLength(500)]],
      departmentId: ['', Validators.required],
      salaryRangeId: ['', Validators.required],
    });
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
      },
      error: error => {
        console.error('Error loading departments:', error);
        this.showMessage('Error loading departments');
      },
    });
  }

  loadSalaryRanges(): void {
    this.salaryRangeService.getAll().subscribe({
      next: (salaryRanges: SalaryRange[]) => {
        this.salaryRanges = salaryRanges;
      },
      error: error => {
        console.error('Error loading salary ranges:', error);
        this.showMessage('Error loading salary ranges');
      },
    });
  }

  checkEditMode(): void {
    this.positionId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.positionId;

    if (this.isEditMode && this.positionId) {
      this.loadPosition(this.positionId);
    }
  }

  loadPosition(id: string): void {
    this.loading = true;
    this.positionService.getById(id).subscribe({
      next: (position: Position) => {
        this.positionForm.patchValue({
          positionTitle: position.positionTitle,
          positionNumber: position.positionNumber,
          positionDescription: position.positionDescription,
          departmentId: position.departmentId,
          salaryRangeId: position.salaryRangeId,
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading position:', error);
        this.showMessage('Error loading position');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.positionId) {
      const command: UpdatePositionCommand = {
        id: this.positionId,
        ...this.positionForm.value,
      };

      this.positionService.updatePosition(command).subscribe({
        next: () => {
          this.showMessage('Position updated successfully');
          this.router.navigate(['/positions', this.positionId]);
        },
        error: error => {
          console.error('Error updating position:', error);
          this.showMessage('Error updating position');
          this.loading = false;
        },
      });
    } else {
      const command: CreatePositionCommand = this.positionForm.value;

      this.positionService.createPosition(command).subscribe({
        next: (position) => {
          console.log('Position created - Response:', position);
          console.log('Position ID:', position?.id);
          this.showMessage('Position created successfully');
          if (position?.id) {
            console.log('Navigating to detail page:', '/positions/' + position.id);
            this.router.navigate(['/positions', position.id]);
          } else {
            console.warn('No position ID returned, navigating to list page');
            this.router.navigate(['/positions']);
          }
          this.loading = false;
        },
        error: error => {
          console.error('Error creating position:', error);
          this.showMessage('Error creating position');
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/positions']);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  getFormTitle(): string {
    return this.isEditMode ? 'Edit Position' : 'Create Position';
  }
}
