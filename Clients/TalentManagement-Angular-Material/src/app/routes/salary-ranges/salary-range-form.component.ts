import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { SalaryRange, CreateSalaryRangeCommand, UpdateSalaryRangeCommand } from '../../models';
import { SalaryRangeService } from '../../services/api';

@Component({
  selector: 'app-salary-range-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './salary-range-form.component.html',
  styleUrl: './salary-range-form.component.scss',
})
export class SalaryRangeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private salaryRangeService = inject(SalaryRangeService);

  salaryRangeForm!: FormGroup;
  loading = false;
  isEditMode = false;
  salaryRangeId?: string;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.salaryRangeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      minSalary: ['', [Validators.required, Validators.min(0)]],
      maxSalary: ['', [Validators.required, Validators.min(0)]],
    }, {
      validators: this.salaryRangeValidator
    });
  }

  salaryRangeValidator(control: AbstractControl): ValidationErrors | null {
    const minSalary = control.get('minSalary')?.value;
    const maxSalary = control.get('maxSalary')?.value;

    if (minSalary && maxSalary && parseFloat(minSalary) >= parseFloat(maxSalary)) {
      return { salaryRangeInvalid: true };
    }

    return null;
  }

  checkEditMode(): void {
    this.salaryRangeId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.salaryRangeId;

    if (this.isEditMode && this.salaryRangeId) {
      this.loadSalaryRange(this.salaryRangeId);
    }
  }

  loadSalaryRange(id: string): void {
    this.loading = true;
    this.salaryRangeService.getById(id).subscribe({
      next: (salaryRange: SalaryRange) => {
        this.salaryRangeForm.patchValue({
          name: salaryRange.name,
          minSalary: salaryRange.minSalary,
          maxSalary: salaryRange.maxSalary,
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading salary range:', error);
        this.showMessage('Error loading salary range');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.salaryRangeForm.invalid) {
      this.salaryRangeForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.salaryRangeId) {
      const command: UpdateSalaryRangeCommand = {
        id: this.salaryRangeId,
        name: this.salaryRangeForm.value.name,
        minSalary: parseFloat(this.salaryRangeForm.value.minSalary),
        maxSalary: parseFloat(this.salaryRangeForm.value.maxSalary),
      };

      this.salaryRangeService.updateSalaryRange(command).subscribe({
        next: () => {
          this.showMessage('Salary range updated successfully');
          this.router.navigate(['/salary-ranges', this.salaryRangeId]);
        },
        error: error => {
          console.error('Error updating salary range:', error);
          this.showMessage('Error updating salary range');
          this.loading = false;
        },
      });
    } else {
      const command: CreateSalaryRangeCommand = {
        name: this.salaryRangeForm.value.name,
        minSalary: parseFloat(this.salaryRangeForm.value.minSalary),
        maxSalary: parseFloat(this.salaryRangeForm.value.maxSalary),
      };

      this.salaryRangeService.createSalaryRange(command).subscribe({
        next: (salaryRange) => {
          console.log('Salary range created - Response:', salaryRange);
          console.log('Salary range ID:', salaryRange?.id);
          this.showMessage('Salary range created successfully');
          if (salaryRange?.id) {
            console.log('Navigating to detail page:', '/salary-ranges/' + salaryRange.id);
            this.router.navigate(['/salary-ranges', salaryRange.id]);
          } else {
            console.warn('No salary range ID returned, navigating to list page');
            this.router.navigate(['/salary-ranges']);
          }
          this.loading = false;
        },
        error: error => {
          console.error('Error creating salary range:', error);
          this.showMessage('Error creating salary range');
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/salary-ranges']);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  getFormTitle(): string {
    return this.isEditMode ? 'Edit Salary Range' : 'Create Salary Range';
  }
}
